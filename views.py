# views.py
from main import app, mail # Importa o aplicativo Flask principal e o objeto mail
from db import db
from models import Paciente,Estagiario,Agendamento
from flask import render_template, request, redirect, url_for, flash, session,jsonify
import datetime # Adicionado para conversão de data
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate 
from flask import request, jsonify, session
from email_utils import enviar_email_confirmacao_consulta





@app.route('/')
def index():
 return render_template('landingpage.html')




@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        print("DEBUG: Requisição POST para /login recebida.") # DEBUG
        identificador = request.form.get('identificador')
        senha_digitada = request.form.get('password')

        print(f"DEBUG: Identificador recebido: {identificador}") # DEBUG

        # Verificação para Paciente (usa email)
        paciente = Paciente.query.filter_by(email=identificador).first()
        if paciente:
            print(f"DEBUG: Paciente encontrado: {paciente.email}") # DEBUG
            if check_password_hash(paciente.senha, senha_digitada):
                print("DEBUG: Senha do paciente CORRETA.") # DEBUG
                session['logged_in'] = True
                session['user_id'] = paciente.id
                session['user_type'] = 'paciente'
                session['nome_usuario'] = paciente.nome
                flash('Login de paciente realizado com sucesso!', 'success')
                print("DEBUG: Redirecionando para aba_pacientes...") # DEBUG
                return redirect(url_for('aba_pacientes'))
            else:
                print("DEBUG: Senha do paciente INCORRETA.") # DEBUG
                flash('Senha incorreta. Por favor, tente novamente.', 'error')
                return render_template('login.html')
        else:
            print("DEBUG: Paciente não encontrado por email.") # DEBUG
        
        # Verificação para Estagiário (usa email ou RA)
        estagiario = Estagiario.query.filter_by(emailfsa=identificador).first()
        if not estagiario: 
            estagiario = Estagiario.query.filter_by(RA=identificador).first()
            if estagiario:
                print(f"DEBUG: Estagiário encontrado por RA: {estagiario.RA}") # DEBUG
            else:
                print("DEBUG: Estagiário NÃO encontrado por RA.") # DEBUG
                flash('E-mail/RA não encontrado. Por favor, verifique suas credenciais.', 'error')
                return render_template('login.html')
        else:
            print(f"DEBUG: Estagiário encontrado por emailfsa: {estagiario.emailfsa}") # DEBUG

        if estagiario and check_password_hash(estagiario.senha, senha_digitada):
            print("DEBUG: Senha do estagiário CORRETA.") # DEBUG
            session['logged_in'] = True
            session['user_id'] = estagiario.id
            session['user_type'] = 'estagiario'
            session['nome_usuario'] = estagiario.nome
            flash('Login de estagiário realizado com sucesso!', 'success')
            print("DEBUG: Redirecionando para aba_estagiario...") # DEBUG
            return redirect(url_for('aba_estagiario'))
        else:
            print("DEBUG: Senha do estagiário INCORRETA ou estagiário não encontrado.") # DEBUG
            flash('Senha incorreta. Por favor, tente novamente.', 'error')
            return render_template('login.html')
    
    # Se o método for GET, apenas renderiza a página de login
    messages = session.pop('_flashes', [])
    print(f"DEBUG: Requisição GET para /login. Mensagens flash: {messages}") # DEBUG
    return render_template('login.html', messages=messages)

# Rota de Logout (opcional, mas recomendado)
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('user_id', None)
    session.pop('user_type', None)
    session.pop('nome_usuario', None)
    flash('Você foi desconectado.', 'info')
    return redirect(url_for('login')) # Redireciona para a página de login



# Rota de paciente
@app.route('/termo_responsavel', methods=['GET', 'POST'])
def termo_responsavel():
    if request.method == 'POST':
        # Salvar os dados do responsável na sessão
        dados_responsavel = {
            'nome_responsavel': request.form['nomeResponsavel'],
            'cpf_responsavel': request.form['cpfResponsavel'],
            'telefone_responsavel': request.form['telefoneResponsavel'],
            'email_responsavel': request.form['emailResponsavel'],
            'parentesco': request.form['parentesco']
        }
        session['dados_responsavel'] = dados_responsavel
        return redirect(url_for('criar_senha'))
    
    messages = session.pop('_flashes', [])
    return render_template('termo_responsavel.html', messages=messages)

@app.route('/cadastroPaciente', methods=['GET', 'POST'])
def registrar_paciente():
    if request.method == 'POST':
        print("DEBUG: Recebido POST para /cadastroPaciente") # DEBUG
        
        dados_paciente = {
            'nome': request.form['nomeForm'],
            'data_nascimento': request.form['dataNascimentoForm'],
            'genero': request.form['generoForm'],
            'cpf': request.form['cpfForm'],
            'telefone': request.form['TelefoneForm'],
            'email': request.form['emailForm'],
            'endereco': request.form['enderecoForm'],
            'numero_casa': request.form['numeroCasaForm']
        }
        session['dados_paciente'] = dados_paciente
        
        flash('Dados do paciente salvos temporariamente. Agora crie sua senha.', 'info')
        print("DEBUG: Redirecionando para criar_senha") # DEBUG
        return redirect(url_for('criar_senha'))
    
    messages = session.pop('_flashes', [])
    return render_template("cadastroPaciente.html", messages=messages)

    
@app.route('/criarSenha', methods=['GET', 'POST'])
def criar_senha():
    if request.method == 'POST':
        print("DEBUG: Recebido POST para /criarSenha") # DEBUG
        if 'dados_paciente' not in session:
            flash('Por favor, preencha os dados do paciente primeiro.', 'error')
            print("DEBUG: dados_paciente não encontrado na sessão. Redirecionando para registrar_paciente.") # DEBUG
            return redirect(url_for('registrar_paciente'))

        print(f"DEBUG: Conteúdo da sessão ao entrar em criar_senha (POST): {session.get('dados_paciente')}") # DEBUG

        senha = request.form['password']
        confirmar_senha = request.form['confirm_password']
        
        if senha != confirmar_senha:
            flash('As senhas não coincidem.', 'error')
            messages = session.pop('_flashes', [])
            print("DEBUG: Senhas não coincidem.") # DEBUG
            return render_template("criarSenha.html", messages=messages)
        
        if not (8 <= len(senha) <= 20):
            flash('A senha deve ter entre 8 e 20 caracteres.', 'error')
            messages = session.pop('_flashes', [])
            print("DEBUG: Senha fora do tamanho permitido.") # DEBUG
            return render_template("criarSenha.html", messages=messages)
        
        print("DEBUG: Senha e confirmação válidas. Tentando criar paciente.") # DEBUG
        # CORREÇÃO: Hashing da senha do paciente
        hashed_senha = generate_password_hash(senha, method='pbkdf2:sha256') 

        dados_paciente = session['dados_paciente']

        # CONVERSÃO DA DATA: CORRIGIDO AQUI
        try:
            data_nascimento_obj = datetime.datetime.strptime(dados_paciente['data_nascimento'], '%Y-%m-%d').date()
        except ValueError as e:
            flash(f'Formato de data de nascimento inválido: {e}', 'error')
            messages = session.pop('_flashes', [])
            print(f"DEBUG: Erro no formato da data de nascimento: {e}") # DEBUG
            return render_template("criarSenha.html", messages=messages)

        novo_paciente = Paciente(
            nome=dados_paciente['nome'],
            data_nascimento=data_nascimento_obj, # Usando o objeto de data
            genero=dados_paciente['genero'],
            cpf=dados_paciente['cpf'],
            telefone=dados_paciente['telefone'],
            email=dados_paciente['email'],
            endereco=dados_paciente['endereco'],
            numero_casa=dados_paciente['numero_casa'],
            senha=hashed_senha # Usando a senha hasheada
        )
        print(f"DEBUG: Objeto Paciente criado: {novo_paciente}") # DEBUG

        try:
            db.session.add(novo_paciente)
            print("DEBUG: Paciente adicionado à sessão do DB.") # DEBUG
            db.session.commit()
            print("DEBUG: db.session.commit() executado com sucesso. Dados salvos.") # DEBUG
            
            # Fazer login automático após o cadastro
            session['logged_in'] = True
            session['user_id'] = novo_paciente.id
            session['user_type'] = 'paciente'
            session['nome_usuario'] = novo_paciente.nome
            
            flash('Paciente cadastrado com sucesso!', 'success')
            session.pop('dados_paciente', None) 
            print("DEBUG: Redirecionando para a rota triagem.") # DEBUG
            return redirect(url_for('triagem'))
            
        except Exception as e:
            db.session.rollback()
            print(f"DEBUG: ERRO DURANTE db.session.add/commit: {e}") # DEBUG CRÍTICO!
            flash(f'Ocorreu um erro ao cadastrar o paciente: {e}', 'error')
            messages = session.pop('_flashes', []) 
            return render_template("criarSenha.html", messages=messages)
    
    messages = session.pop('_flashes', [])
    return render_template("criarSenha.html", messages=messages)


@app.route('/triagem')
def triagem():
    print("DEBUG: Acessando a rota /triagem.")
    
    # Verifica se o usuário está logado e é um paciente
    if 'logged_in' not in session or session.get('user_type') != 'paciente':
        flash('Acesso negado. Por favor, faça o login como paciente.', 'error')
        return redirect(url_for('login'))
    
    messages = session.pop('_flashes', [])
    return render_template("triagem.html", messages=messages)



@app.route('/minhas_consultas')
def consultas():
    print("DEBUG: Acessando a rota /minhas_consultas.")
    
    # Verifica se o usuário está logado
    if 'logged_in' not in session:
        flash('Acesso negado. Por favor, faça o login.', 'error')
        return redirect(url_for('login'))
    
    user_id = session.get('user_id')
    user_type = session.get('user_type')
    
    if not user_id:
        flash('Erro na sessão. Por favor, faça o login novamente.', 'error')
        return redirect(url_for('login'))
    
    try:
        if user_type == 'paciente':
            # Busca agendamentos do paciente
            agendamentos = Agendamento.query.filter_by(paciente_id=user_id).order_by(Agendamento.data_solicitacao.desc()).all()
            
            # Busca informações dos estagiários para cada agendamento
            for agendamento in agendamentos:
                if agendamento.estagiario_id:
                    estagiario = Estagiario.query.get(agendamento.estagiario_id)
                    agendamento.estagiario = estagiario
                else:
                    agendamento.estagiario = None
                    
        elif user_type == 'estagiario':
            # Busca agendamentos do estagiário
            agendamentos = Agendamento.query.filter_by(estagiario_id=user_id).order_by(Agendamento.data_agendamento.desc()).all()
            
            # Busca informações dos pacientes para cada agendamento
            for agendamento in agendamentos:
                if agendamento.paciente_id:
                    paciente = Paciente.query.get(agendamento.paciente_id)
                    agendamento.paciente = paciente
                else:
                    agendamento.paciente = None
        else:
            flash('Tipo de usuário não reconhecido.', 'error')
            return redirect(url_for('login'))
            
    except Exception as e:
        print(f"Erro ao buscar agendamentos: {e}")
        agendamentos = []
        flash('Erro ao carregar consultas. Tente novamente.', 'error')
    
    messages = session.pop('_flashes', [])
    return render_template("minhas_consultas.html", agendamentos=agendamentos, messages=messages, user_type=user_type)


# Rota para a página de agendamentos de triagem
@app.route('/aba_pacientes')
def aba_pacientes():
    print("DEBUG: Acessando a rota /aba_pacientes.")  # DEBUG

    # Verifica se o usuário está logado e é um paciente
    if 'logged_in' not in session or session.get('user_type') != 'paciente':
        flash('Acesso negado. Por favor, faça o login como paciente.', 'error')
        return redirect(url_for('login'))

    paciente_id = session.get('user_id')
    if not paciente_id:
        flash('Erro na sessão. Por favor, faça o login novamente.', 'error')
        return redirect(url_for('login'))

    # Busca o paciente no banco de dados pelo ID da sessão
    paciente = Paciente.query.get(paciente_id)

    if not paciente:
        flash('Paciente não encontrado.', 'error')
        # Limpa uma sessão potencialmente inválida
        session.clear()
        return redirect(url_for('login'))

    print(f"DEBUG: Renderizando aba_pacientes.html para o paciente: {paciente.nome}")  # DEBUG
    messages = session.pop('_flashes', [])  # Para exibir mensagens flash se houver
    # Passa o objeto 'paciente' para o template
    return render_template("aba_pacientes.html", paciente=paciente, messages=messages)


# Rota para o formulário de cadastro do aluno (primeira etapa)
@app.route('/cadastroaluno', methods=['GET', 'POST'])
def tela_cadastro_aluno():
    if request.method == 'POST':
        print("DEBUG: Recebido POST para /cadastroaluno")
        dados_Estagiario = {
            'nome': request.form['nomeForm'],
            'data_nascimento': request.form['dataNascimentoForm'],
            'cpf': request.form['cpfForm'],
            'telefone_aluno': request.form['Telefone_alunoForm'],
            'emailfsa': request.form['emailFsaForm'],
            'RA': request.form['raForm'],
            'curso_periodo': request.form['cursoPeriodoForm']
        }
        session['dados_Estagiario'] = dados_Estagiario
        flash('Dados do Estagiário salvos temporariamente. Agora crie sua senha.', 'info')
        print("DEBUG: Redirecionando para criar_senha_aluno.") # Nome da rota corrigido
        return redirect(url_for('criar_senha_aluno'))
    
    print("DEBUG: Acessando a rota /cadastroaluno (GET)")
    messages = session.pop('_flashes', [])
    return render_template("cadastroaluno.html", messages=messages)


@app.route('/criarSenha_aluno', methods=['GET', 'POST'])
def criar_senha_aluno():
    # Primeira verificação: se 'dados_Estagiario' não está na sessão (primeiro acesso ou acesso direto)
    if 'dados_Estagiario' not in session:
        flash('Por favor, preencha os dados do Estagiário primeiro.', 'error')
        print("DEBUG: dados_Estagiario não encontrado na sessão. Redirecionando para tela_cadastro_aluno.")
        return redirect(url_for('tela_cadastro_aluno'))

    # Se o método for POST (o usuário submeteu o formulário de senha)
    if request.method == 'POST':
        senha = request.form['password']
        confirmar_senha = request.form['confirm_password']

        # Validação de senhas
        if senha != confirmar_senha:
            flash('As senhas não coincidem.', 'error')
            # Renderiza a mesma página com a mensagem de erro
            return render_template("criarSenha_aluno.html", messages=session.pop('_flashes', []))
        
        if not (8 <= len(senha) <= 20):
            flash('A senha deve ter entre 8 e 20 caracteres.', 'error')
            # Renderiza a mesma página com a mensagem de erro
            return render_template("criarSenha_aluno.html", messages=session.pop('_flashes', []))
        
        hashed_senha = generate_password_hash(senha, method='pbkdf2:sha256')

        dados_Estagiario = session['dados_Estagiario']

        # Tenta converter a data de nascimento
        try:
            data_nascimento_obj = datetime.datetime.strptime(dados_Estagiario['data_nascimento'], '%Y-%m-%d').date()
        except ValueError as e:
            flash(f'Formato de data de nascimento inválido: {e}', 'error')
            print(f"DEBUG: ERRO de formato de data: {e}") 
            # Renderiza a mesma página com a mensagem de erro
            return render_template("criarSenha_aluno.html", messages=session.pop('_flashes', []))

        novo_Estagiario = Estagiario(
            nome=dados_Estagiario['nome'],
            data_nascimento=data_nascimento_obj,
            RA=dados_Estagiario['RA'],
            cpf=dados_Estagiario['cpf'],
            telefone_aluno=dados_Estagiario['telefone_aluno'], 
            emailfsa=dados_Estagiario['emailfsa'],
            curso_periodo=dados_Estagiario['curso_periodo'],
            senha=hashed_senha
        )
        
        print(f"DEBUG: Objeto Estagiário criado: {novo_Estagiario}")

        # Tenta adicionar e commitar no banco de dados
        try:
            print("DEBUG: Tentando adicionar novo_Estagiario ao banco de dados.") 
            db.session.add(novo_Estagiario)
            print("DEBUG: Objeto adicionado à sessão. Tentando commit...") 
            db.session.commit()
            print("DEBUG: Commit realizado com sucesso!") 
            flash('Estagiário cadastrado com sucesso!', 'success')
            session.pop('dados_Estagiario', None) # Limpa os dados do estagiário da sessão

            # Set session variables for the newly registered intern
            session['logged_in'] = True
            session['user_id'] = novo_Estagiario.id
            session['user_type'] = 'estagiario'
            session['nome_usuario'] = novo_Estagiario.nome

            return redirect(url_for('aba_estagiario')) 
        except Exception as e:
            db.session.rollback()
            print(f"DEBUG: ERRO NO BANCO DE DADOS: {e}") 
            flash(f'Ocorreu um erro ao cadastrar o estagiário: {e}', 'error')
            # Renderiza a mesma página com a mensagem de erro do banco de dados
            return render_template("criarSenha_aluno.html", messages=session.pop('_flashes', []))
            
    # Se o método for GET (ou seja, é o primeiro acesso à página de criação de senha)
    # ou se a validação inicial de 'dados_Estagiario' na sessão falhou
    messages = session.pop('_flashes', [])
    return render_template("criarSenha_aluno.html", messages=messages)
            

            
# Rota para a aba do estagiário
@app.route('/aba_estagiario')
def aba_estagiario():
    print("DEBUG: Acessando a rota /aba_estagiario.")
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        flash('Acesso negado. Por favor, faça o login como estagiário.', 'error')
        return redirect(url_for('login'))

    estagiario_id = session.get('user_id')
    if not estagiario_id:
        flash('Erro na sessão. Por favor, faça o login novamente.', 'error')
        return redirect(url_for('login'))

    estagiario = Estagiario.query.get(estagiario_id)

    if not estagiario:
        flash('Estagiário não encontrado.', 'error')
        session.clear()
        return redirect(url_for('login'))

    messages = session.pop('_flashes', [])
    return render_template("aba_estagiario.html", estagiario=estagiario, messages=messages)





@app.route('/registro')
def registro_Geral():
 return render_template('registro.html')



@app.route('/api/agendamentos/solicitar', methods=['POST'])
def solicitar_triagem():
    try:
        if 'logged_in' not in session or session.get('user_type') != 'paciente':
            return jsonify({'error': 'Acesso negado. Por favor, faça login como paciente.'}), 403

        paciente_id = session.get('user_id')
        if not paciente_id:
            return jsonify({'error': 'ID do paciente não encontrado na sessão.'}), 400

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados inválidos. Nenhum dado recebido.'}), 400

        observacoes = data.get('observacoes', '').strip()
        if not observacoes:
            return jsonify({'error': 'As observações são obrigatórias.'}), 400

        # Verificar se já existe uma solicitação pendente ou confirmada para este paciente
        solicitacao_existente = Agendamento.query.filter(
            Agendamento.paciente_id == paciente_id,
            Agendamento.status.in_(['solicitado', 'confirmado'])
        ).first()

        if solicitacao_existente:
            return jsonify({'error': 'Você já possui uma solicitação de triagem pendente ou confirmada.'}), 400

        # Verificar se existe uma solicitação cancelada recentemente (últimas 24 horas)
        solicitacao_cancelada_recente = Agendamento.query.filter(
            Agendamento.paciente_id == paciente_id,
            Agendamento.status == 'cancelado',
            Agendamento.data_solicitacao >= datetime.datetime.now() - datetime.timedelta(hours=24)
        ).first()

        if solicitacao_cancelada_recente:
            return jsonify({'error': 'Você cancelou uma solicitação recentemente. Aguarde 24 horas para solicitar novamente.'}), 400

        # Criar nova solicitação
        novo_agendamento = Agendamento(
            paciente_id=paciente_id,
            status='solicitado',
            observacoes_paciente=observacoes,
            data_agendamento=None,
            estagiario_id=None,
            data_solicitacao=datetime.datetime.now()
        )

        try:
            db.session.add(novo_agendamento)
            db.session.commit()
            
            return jsonify({
                'message': 'Solicitação de triagem enviada com sucesso!',
                'agendamento_id': novo_agendamento.id
            }), 201
            
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao salvar agendamento: {e}")
            return jsonify({'error': 'Erro ao salvar a solicitação. Tente novamente.'}), 500

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao solicitar triagem: {e}")
        return jsonify({'error': f'Erro ao solicitar triagem: {str(e)}'}), 500


@app.route('/api/agendamentos/paciente', methods=['GET'])
def listar_agendamentos_paciente():
    if 'logged_in' not in session or session.get('user_type') != 'paciente':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como paciente.'}), 403

    paciente_id = session.get('user_id')
    if not paciente_id:
        return jsonify({'error': 'ID do paciente não encontrado na sessão.'}), 400

    try:
        agendamentos_db = Agendamento.query.filter_by(paciente_id=paciente_id).order_by(Agendamento.data_solicitacao.desc()).all()
        
        lista_agendamentos = []
        for ag in agendamentos_db:
            estagiario_nome = None
            if ag.estagiario_id and ag.estagiario:
                estagiario_nome = ag.estagiario.nome

            tipo_atendimento = "Consulta"
            if ag.status == 'solicitado' and not ag.estagiario_id:
                tipo_atendimento = "Solicitação de Triagem"

            ag_data = {
                'id': ag.id,
                'paciente_id': ag.paciente_id,
                'estagiario_id': ag.estagiario_id,
                'estagiario_nome': estagiario_nome,
                'data_solicitacao': ag.data_solicitacao.strftime('%d/%m/%Y %H:%M') if ag.data_solicitacao else None,
                'data_agendamento': ag.data_agendamento.strftime('%d/%m/%Y %H:%M') if ag.data_agendamento else None,
                'status': ag.status,
                'observacoes_paciente': ag.observacoes_paciente,
                'observacoes_estagiario': ag.observacoes_estagiario,
                'tipo_atendimento': tipo_atendimento
            }
            lista_agendamentos.append(ag_data)
            
        return jsonify(lista_agendamentos), 200

    except Exception as e:
        print(f"Erro ao listar agendamentos do paciente: {e}")
        return jsonify({'error': f'Erro ao buscar agendamentos: {str(e)}'}), 500


@app.route('/api/agendamentos/<int:agendamento_id>/cancelar', methods=['PUT'])
def cancelar_agendamento_paciente(agendamento_id):
    if 'logged_in' not in session or session.get('user_type') != 'paciente':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como paciente.'}), 403

    paciente_id = session.get('user_id')

    try:
        agendamento = Agendamento.query.filter_by(id=agendamento_id, paciente_id=paciente_id).first()
        if not agendamento:
            return jsonify({'error': 'Agendamento não encontrado ou não pertence a este paciente.'}), 404

        # Remover o registro do banco de dados
        db.session.delete(agendamento)
        db.session.commit()
        return jsonify({'message': 'Agendamento cancelado e removido com sucesso!'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao cancelar agendamento {agendamento_id} pelo paciente: {e}")
        return jsonify({'error': f'Erro ao cancelar agendamento: {str(e)}'}), 500

@app.route('/api/estagiario/disponibilidade', methods=['GET', 'POST'])
def gerenciar_disponibilidade():
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

    estagiario_id = session.get('user_id')
    if not estagiario_id:
        return jsonify({'error': 'ID do estagiário não encontrado na sessão.'}), 400

    if request.method == 'POST':
        try:
            data = request.get_json()
            if not data or 'disponibilidade' not in data:
                return jsonify({'error': 'Dados de disponibilidade não fornecidos.'}), 400

            estagiario = Estagiario.query.get(estagiario_id)
            if not estagiario:
                return jsonify({'error': 'Estagiário não encontrado.'}), 404

            # Atualiza a disponibilidade do estagiário
            estagiario.disponibilidade = data['disponibilidade']
            db.session.commit()

            return jsonify({'message': 'Disponibilidade atualizada com sucesso!'}), 200

        except Exception as e:
            db.session.rollback()
            print(f"Erro ao atualizar disponibilidade: {e}")
            return jsonify({'error': f'Erro ao atualizar disponibilidade: {str(e)}'}), 500

    # GET - Retorna a disponibilidade atual
    try:
        estagiario = Estagiario.query.get(estagiario_id)
        if not estagiario:
            return jsonify({'error': 'Estagiário não encontrado.'}), 404

        return jsonify({
            'disponibilidade': estagiario.disponibilidade or []
        }), 200

    except Exception as e:
        print(f"Erro ao buscar disponibilidade: {e}")
        return jsonify({'error': f'Erro ao buscar disponibilidade: {str(e)}'}), 500

@app.route('/api/estagiario/solicitacoes', methods=['GET'])
def listar_solicitacoes_estagiario():
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

    estagiario_id = session.get('user_id')
    if not estagiario_id:
        return jsonify({'error': 'ID do estagiário não encontrado na sessão.'}), 400

    try:
        # Busca apenas a solicitação mais recente de cada paciente
        subquery = db.session.query(
            Agendamento.paciente_id,
            db.func.max(Agendamento.id).label('max_id')
        ).filter(
            Agendamento.status == 'solicitado',
            Agendamento.estagiario_id.is_(None)
        ).group_by(Agendamento.paciente_id).subquery()

        solicitacoes = db.session.query(Agendamento).join(
            subquery,
            db.and_(
                Agendamento.paciente_id == subquery.c.paciente_id,
                Agendamento.id == subquery.c.max_id
            )
        ).order_by(Agendamento.data_solicitacao.desc()).all()

        lista_solicitacoes = []
        for sol in solicitacoes:
            paciente = Paciente.query.get(sol.paciente_id)
            if paciente:
                solicitacao_data = {
                    'id': sol.id,
                    'paciente_id': sol.paciente_id,
                    'paciente_nome': paciente.nome,
                    'data_solicitacao': sol.data_solicitacao.strftime('%d/%m/%Y %H:%M') if sol.data_solicitacao else None,
                    'observacoes_paciente': sol.observacoes_paciente,
                    'status': sol.status
                }
                lista_solicitacoes.append(solicitacao_data)

        return jsonify(lista_solicitacoes), 200

    except Exception as e:
        print(f"Erro ao listar solicitações: {e}")
        return jsonify({'error': f'Erro ao listar solicitações: {str(e)}'}), 500

@app.route('/api/estagiario/agendamentos/confirmar/<int:agendamento_id>', methods=['POST'])
def confirmar_agendamento(agendamento_id):
    try:
        if 'logged_in' not in session or session.get('user_type') != 'estagiario':
            return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

        estagiario_id = session.get('user_id')
        if not estagiario_id:
            return jsonify({'error': 'ID do estagiário não encontrado na sessão.'}), 400

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados inválidos. Nenhum dado recebido.'}), 400

        data_agendamento = data.get('data_agendamento')
        if not data_agendamento:
            return jsonify({'error': 'Data do agendamento é obrigatória.'}), 400

        try:
            data_agendamento = datetime.datetime.strptime(data_agendamento, '%Y-%m-%dT%H:%M')
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DDTHH:mm'}), 400

        agendamento = Agendamento.query.get(agendamento_id)
        if not agendamento:
            return jsonify({'error': 'Agendamento não encontrado.'}), 404

        if agendamento.status != 'solicitado':
            return jsonify({'error': 'Este agendamento não está disponível para confirmação.'}), 400

        if agendamento.estagiario_id and agendamento.estagiario_id != estagiario_id:
            return jsonify({'error': 'Este agendamento já foi atribuído a outro estagiário.'}), 400

        try:
            # Atualiza o agendamento
            agendamento.estagiario_id = estagiario_id
            agendamento.data_agendamento = data_agendamento
            agendamento.status = 'confirmado'
            agendamento.observacoes_estagiario = data.get('observacoes', 'Triagem confirmada pelo estagiário')

            # Busca os dados do paciente e do estagiário
            paciente = Paciente.query.get(agendamento.paciente_id)
            estagiario = Estagiario.query.get(estagiario_id)

            if not paciente or not estagiario:
                raise Exception("Paciente ou estagiário não encontrado")

            # Envia o email de confirmação
            email_enviado = enviar_email_confirmacao_consulta(
                paciente_email=paciente.email,
                nome_paciente=paciente.nome,
                data_consulta=data_agendamento.strftime('%d/%m/%Y'),
                hora_consulta=data_agendamento.strftime('%H:%M'),
                profissional=estagiario.nome
            )

            if not email_enviado:
                app.logger.warning(f"Falha ao enviar email de confirmação para o paciente {paciente.nome}")

            db.session.commit()
            return jsonify({'message': 'Agendamento confirmado com sucesso!'}), 200

        except Exception as e:
            db.session.rollback()
            print(f"Erro ao confirmar agendamento: {e}")
            return jsonify({'error': 'Erro ao confirmar agendamento. Tente novamente.'}), 500

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao processar confirmação de agendamento: {e}")
        return jsonify({'error': f'Erro ao processar confirmação: {str(e)}'}), 500

@app.route('/api/estagiario/consultas', methods=['GET'])
def listar_consultas_estagiario():
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

    estagiario_id = session.get('user_id')
    if not estagiario_id:
        return jsonify({'error': 'ID do estagiário não encontrado na sessão.'}), 400

    try:
        # Busca todas as consultas do estagiário
        consultas = Agendamento.query.filter_by(estagiario_id=estagiario_id).order_by(Agendamento.data_agendamento.desc()).all()
        
        lista_consultas = []
        for cons in consultas:
            paciente = Paciente.query.get(cons.paciente_id)
            if paciente:
                consulta_data = {
                    'id': cons.id,
                    'paciente_id': cons.paciente_id,
                    'paciente_nome': paciente.nome,
                    'data_solicitacao': cons.data_solicitacao.strftime('%d/%m/%Y %H:%M') if cons.data_solicitacao else None,
                    'data_agendamento': cons.data_agendamento.strftime('%d/%m/%Y %H:%M') if cons.data_agendamento else None,
                    'status': cons.status,
                    'observacoes_paciente': cons.observacoes_paciente,
                    'observacoes_estagiario': cons.observacoes_estagiario
                }
                lista_consultas.append(consulta_data)

        return jsonify(lista_consultas), 200

    except Exception as e:
        print(f"Erro ao listar consultas do estagiário: {e}")
        return jsonify({'error': f'Erro ao listar consultas: {str(e)}'}), 500

@app.route('/api/estagiario/consultas/<int:consulta_id>/concluir', methods=['POST'])
def concluir_consulta(consulta_id):
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

    estagiario_id = session.get('user_id')
    if not estagiario_id:
        return jsonify({'error': 'ID do estagiário não encontrado na sessão.'}), 400

    try:
        consulta = Agendamento.query.get(consulta_id)
        if not consulta:
            return jsonify({'error': 'Consulta não encontrada.'}), 404

        if consulta.estagiario_id != estagiario_id:
            return jsonify({'error': 'Esta consulta não pertence a você.'}), 403

        if consulta.status != 'confirmado':
            return jsonify({'error': 'Apenas consultas confirmadas podem ser concluídas.'}), 400

        data = request.get_json()
        observacoes = data.get('observacoes', '')

        consulta.status = 'concluido'
        consulta.observacoes_estagiario = observacoes
        db.session.commit()

        return jsonify({
            'message': 'Consulta concluída com sucesso!',
            'consulta_id': consulta.id
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao concluir consulta: {e}")
        return jsonify({'error': f'Erro ao concluir consulta: {str(e)}'}), 500

@app.route('/api/estagiario/dados', methods=['PUT'])
def atualizar_dados_estagiario():
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

    estagiario_id = session.get('user_id')
    if not estagiario_id:
        return jsonify({'error': 'ID do estagiário não encontrado na sessão.'}), 400

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos.'}), 400

        estagiario = Estagiario.query.get(estagiario_id)
        if not estagiario:
            return jsonify({'error': 'Estagiário não encontrado.'}), 404

        # Atualiza os campos permitidos
        campos_permitidos = ['telefone_aluno', 'curso_periodo']
        for campo in campos_permitidos:
            if campo in data:
                setattr(estagiario, campo, data[campo])

        db.session.commit()

        return jsonify({
            'message': 'Dados atualizados com sucesso!',
            'estagiario': {
                'nome': estagiario.nome,
                'telefone_aluno': estagiario.telefone_aluno,
                'curso_periodo': estagiario.curso_periodo,
                'emailfsa': estagiario.emailfsa,
                'RA': estagiario.RA
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao atualizar dados do estagiário: {e}")
        return jsonify({'error': f'Erro ao atualizar dados: {str(e)}'}), 500

@app.route('/api/estagiario/prontuarios', methods=['GET'])
def listar_prontuarios():
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

    estagiario_id = session.get('user_id')
    if not estagiario_id:
        return jsonify({'error': 'ID do estagiário não encontrado na sessão.'}), 400

    try:
        # Busca apenas as consultas concluídas do estagiário
        consultas = Agendamento.query.filter_by(
            estagiario_id=estagiario_id,
            status='concluido'
        ).order_by(Agendamento.data_agendamento.desc()).all()
        
        lista_prontuarios = []
        for cons in consultas:
            paciente = Paciente.query.get(cons.paciente_id)
            if paciente:
                prontuario_data = {
                    'id': cons.id,
                    'paciente_id': cons.paciente_id,
                    'paciente_nome': paciente.nome,
                    'data_consulta': cons.data_agendamento.strftime('%d/%m/%Y %H:%M') if cons.data_agendamento else None,
                    'observacoes_estagiario': cons.observacoes_estagiario
                }
                lista_prontuarios.append(prontuario_data)

        return jsonify(lista_prontuarios), 200

    except Exception as e:
        print(f"Erro ao listar prontuários: {e}")
        return jsonify({'error': f'Erro ao listar prontuários: {str(e)}'}), 500

@app.route('/api/estagiario/senha', methods=['PUT'])
def alterar_senha_estagiario():
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

    estagiario_id = session.get('user_id')
    if not estagiario_id:
        return jsonify({'error': 'ID do estagiário não encontrado na sessão.'}), 400

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos.'}), 400

        senha_atual = data.get('senha_atual')
        nova_senha = data.get('nova_senha')

        if not senha_atual or not nova_senha:
            return jsonify({'error': 'Senha atual e nova senha são obrigatórias.'}), 400

        estagiario = Estagiario.query.get(estagiario_id)
        if not estagiario:
            return jsonify({'error': 'Estagiário não encontrado.'}), 404

        # Verificar senha atual
        if not check_password_hash(estagiario.senha, senha_atual):
            return jsonify({'error': 'Senha atual incorreta.'}), 400

        # Atualizar senha
        estagiario.senha = generate_password_hash(nova_senha, method='pbkdf2:sha256')
        db.session.commit()

        return jsonify({'message': 'Senha alterada com sucesso!'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao alterar senha: {e}")
        return jsonify({'error': f'Erro ao alterar senha: {str(e)}'}), 500

@app.route('/api/estagiario/buscar-paciente', methods=['GET'])
def buscar_paciente():
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado. Por favor, faça login como estagiário.'}), 403

    nome = request.args.get('nome', '').strip()
    if not nome:
        return jsonify({'error': 'Nome do paciente é obrigatório.'}), 400

    try:
        # Busca pacientes que tenham o nome similar ao termo pesquisado
        pacientes = Paciente.query.filter(Paciente.nome.ilike(f'%{nome}%')).all()
        
        lista_pacientes = []
        for paciente in pacientes:
            # Busca as consultas concluídas deste paciente
            consultas = Agendamento.query.filter_by(
                paciente_id=paciente.id,
                status='concluido'
            ).order_by(Agendamento.data_agendamento.desc()).all()
            
            # Se o paciente tiver consultas concluídas, adiciona à lista
            if consultas:
                paciente_data = {
                    'id': paciente.id,
                    'nome': paciente.nome,
                    'email': paciente.email,
                    'telefone': paciente.telefone,
                    'consultas': [{
                        'id': cons.id,
                        'data': cons.data_agendamento.strftime('%d/%m/%Y %H:%M') if cons.data_agendamento else None,
                        'observacoes': cons.observacoes_estagiario
                    } for cons in consultas]
                }
                lista_pacientes.append(paciente_data)

        return jsonify(lista_pacientes), 200

    except Exception as e:
        print(f"Erro ao buscar pacientes: {e}")
        return jsonify({'error': f'Erro ao buscar pacientes: {str(e)}'}), 500

@app.route('/admin/gerenciar', methods=['GET'])
def gerenciar_usuarios():
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        flash('Acesso negado. Por favor, faça login como estagiário.', 'error')
        return redirect(url_for('login'))
    
    pacientes = Paciente.query.all()
    estagiarios = Estagiario.query.all()
    return render_template('gerenciar_usuarios.html', pacientes=pacientes, estagiarios=estagiarios)

@app.route('/admin/editar_paciente/<int:id>', methods=['GET', 'POST'])
def editar_paciente(id):
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado'}), 403
    
    paciente = Paciente.query.get_or_404(id)
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            paciente.nome = data.get('nome', paciente.nome)
            paciente.data_nascimento = datetime.datetime.strptime(data.get('data_nascimento'), '%Y-%m-%d').date()
            paciente.genero = data.get('genero', paciente.genero)
            paciente.cpf = data.get('cpf', paciente.cpf)
            paciente.telefone = data.get('telefone', paciente.telefone)
            paciente.email = data.get('email', paciente.email)
            paciente.endereco = data.get('endereco', paciente.endereco)
            paciente.numero_casa = data.get('numero_casa', paciente.numero_casa)
            
            db.session.commit()
            return jsonify({'message': 'Paciente atualizado com sucesso'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    return jsonify({
        'id': paciente.id,
        'nome': paciente.nome,
        'data_nascimento': paciente.data_nascimento.strftime('%Y-%m-%d'),
        'genero': paciente.genero,
        'cpf': paciente.cpf,
        'telefone': paciente.telefone,
        'email': paciente.email,
        'endereco': paciente.endereco,
        'numero_casa': paciente.numero_casa
    })

@app.route('/admin/editar_estagiario/<int:id>', methods=['GET', 'POST'])
def editar_estagiario(id):
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado'}), 403
    
    estagiario = Estagiario.query.get_or_404(id)
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            estagiario.nome = data.get('nome', estagiario.nome)
            estagiario.data_nascimento = datetime.datetime.strptime(data.get('data_nascimento'), '%Y-%m-%d').date()
            estagiario.RA = data.get('RA', estagiario.RA)
            estagiario.cpf = data.get('cpf', estagiario.cpf)
            estagiario.telefone_aluno = data.get('telefone_aluno', estagiario.telefone_aluno)
            estagiario.emailfsa = data.get('emailfsa', estagiario.emailfsa)
            estagiario.curso_periodo = data.get('curso_periodo', estagiario.curso_periodo)
            
            db.session.commit()
            return jsonify({'message': 'Estagiário atualizado com sucesso'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    return jsonify({
        'id': estagiario.id,
        'nome': estagiario.nome,
        'data_nascimento': estagiario.data_nascimento.strftime('%Y-%m-%d'),
        'RA': estagiario.RA,
        'cpf': estagiario.cpf,
        'telefone_aluno': estagiario.telefone_aluno,
        'emailfsa': estagiario.emailfsa,
        'curso_periodo': estagiario.curso_periodo
    })

@app.route('/admin/deletar_paciente/<int:id>', methods=['DELETE'])
def deletar_paciente(id):
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        paciente = Paciente.query.get_or_404(id)
        db.session.delete(paciente)
        db.session.commit()
        return jsonify({'message': 'Paciente deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/deletar_estagiario/<int:id>', methods=['DELETE'])
def deletar_estagiario(id):
    if 'logged_in' not in session or session.get('user_type') != 'estagiario':
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        estagiario = Estagiario.query.get_or_404(id)
        db.session.delete(estagiario)
        db.session.commit()
        return jsonify({'message': 'Estagiário deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/teste-email', methods=['GET'])
def teste_email():
    try:
        # Teste com email real
        email_enviado = enviar_email_confirmacao_consulta(
            paciente_email='fundacaofsaacex@gmail.com',  # Email real para teste
            nome_paciente='Paciente Teste',
            data_consulta='01/01/2024',
            hora_consulta='14:00',
            profissional='Dr. Teste'
        )
        
        if email_enviado:
            return jsonify({
                'message': '✅ Email enviado com sucesso!',
                'details': 'Verifique a caixa de entrada do fundacaofsaacex@gmail.com'
            }), 200
        else:
            return jsonify({
                'error': '❌ Falha ao enviar email',
                'details': 'Verifique os logs do servidor'
            }), 500
            
    except Exception as e:
        app.logger.error(f"Erro no teste: {str(e)}")
        return jsonify({
            'error': f'❌ Erro: {str(e)}'
        }), 500