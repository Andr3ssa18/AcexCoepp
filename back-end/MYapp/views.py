# views.py
from main import app # Importa o aplicativo Flask principal
from db import db
from models import Paciente,Estagiario
from flask import render_template, request, redirect, url_for, flash, session
import datetime # Adicionado para conversão de data
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate



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
        # NÃO imprima a senha digitada em produção! Apenas para depuração.
        # print(f"DEBUG: Senha digitada: {senha_digitada}") # DEBUG (DESCOMENTAR APENAS PARA DEBUG EXTREMO E REMOVER DEPOIS)

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

        # Se nenhum login foi bem-sucedido
        flash('Credenciais inválidas. Verifique seu e-mail/RA e senha.', 'error')
        messages = session.pop('_flashes', []) # Captura as mensagens flash
        print(f"DEBUG: Credenciais inválidas. Mensagens flash para render: {messages}") # DEBUG
        print("DEBUG: Renderizando login.html com mensagens de erro.") # DEBUG
        return render_template('login.html', messages=messages)
    
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
            flash('Paciente cadastrado com sucesso!', 'success')
            session.pop('dados_paciente', None) 
            print("DEBUG: Redirecionando para a rota agendamentos.") # DEBUG
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
    messages = session.pop('_flashes', [])
    return render_template("triagem.html", messages=messages)




@app.route('/minhas_consultas')
def consultas():
    print("DEBUG: Acessando a rota /minhas_consultas.")
    messages = session.pop('_flashes', [])
    return render_template("minhas_consultas.html", messages=messages)






# Rota para a página de agendamentos de triagem
@app.route('/aba_pacientes')
def aba_pacientes():
    print("DEBUG: Acessando a rota /aba_pacientes.") # DEBUG
    messages = session.pop('_flashes', []) # Para exibir mensagens flash se houver
    return render_template("aba_pacientes.html", messages=messages) # Assumindo que você tem agendamentos.html













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
    messages = session.pop('_flashes', [])
    return render_template("aba_estagiario.html", messages=messages)


# Rota para listar pacientes (para depuração)
@app.route('/listar_pacientes')
def listar_pacientes():
    print("DEBUG: Acessando a rota /listar_pacientes.") # DEBUG
    pacientes = Paciente.query.all()
    print(f"DEBUG: Pacientes encontrados no DB: {pacientes}") # DEBUG
    messages = session.pop('_flashes', [])
    return render_template('listar_pacientes.html', pacientes=pacientes, messages=messages)


@app.route('/registro')
def registro_Geral():
 return render_template('registro.html')