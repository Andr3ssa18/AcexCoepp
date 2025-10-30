# models.py
from db import db
import datetime # Importar datetime para tipos de data

class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    genero = db.Column(db.String(20), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)  # Único
    telefone = db.Column(db.String(20), unique=True, nullable=False)  # Único
    email = db.Column(db.String(100), unique=True, nullable=False)  # Único entre todos
    endereco = db.Column(db.String(200), nullable=False)
    numero_casa = db.Column(db.String(10), nullable=False)
    senha = db.Column(db.String(200), nullable=False)
    agendamentos = db.relationship('Agendamento', backref='paciente', lazy=True)
    def __repr__(self):
        return f"Paciente ('{self.nome}')"

class Estagiario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    RA = db.Column(db.String(10), unique=True, nullable=False)  # Único
    cpf = db.Column(db.String(14), unique=True, nullable=False)  # Único
    telefone_aluno = db.Column(db.String(20), unique=True, nullable=False)  # Único
    emailfsa = db.Column(db.String(100), unique=True, nullable=False)  # Único entre todos
    curso_periodo = db.Column(db.String(50), nullable=False)
    senha = db.Column(db.String(200), nullable=False)
    agendamentos = db.relationship('Agendamento', backref='estagiario', lazy=True)
    disponibilidades = db.relationship('Disponibilidade', backref='estagiario', lazy=True)

    def __repr__(self):
        return f"Estagiario ('{self.nome}', RA: '{self.RA}')"

class Agendamento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('paciente.id'), nullable=False)
    estagiario_id = db.Column(db.Integer, db.ForeignKey('estagiario.id'), nullable=True) # Pode ser nulo quando solicitado
    data_solicitacao = db.Column(db.DateTime, default=datetime.datetime.now, nullable=False)
    data_agendamento = db.Column(db.DateTime, nullable=True) # Data e hora que o estagiário agendou
    status = db.Column(db.String(50), default='solicitado', nullable=False) # 'solicitado', 'agendado', 'confirmado', 'cancelado'
    observacoes_estagiario = db.Column(db.String(500), nullable=True) # Notas do estagiário
    observacoes_paciente = db.Column(db.String(500), nullable=True) # Notas do paciente

    def __repr__(self):
        return f"Agendamento(ID: {self.id}, Paciente: {self.paciente.nome}, Status: {self.status}, Data: {self.data_agendamento})"

class Disponibilidade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    estagiario_id = db.Column(db.Integer, db.ForeignKey('estagiario.id'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fim = db.Column(db.Time, nullable=False)

    def __repr__(self):
        return f"<Disponibilidade id={self.id} estagiario_id={self.estagiario_id} data='{self.data}' horario='{self.hora_inicio}-{self.hora_fim}'>"

class Mestre(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)  # Único
    telefone = db.Column(db.String(20), unique=True, nullable=False)  # Único
    email = db.Column(db.String(100), unique=True, nullable=False)  # Único entre todos
    registro_profissional = db.Column(db.String(50), unique=True, nullable=False)  # Único
    senha = db.Column(db.String(200), nullable=False)
    
    def __repr__(self):
        return f"Mestre ('{self.nome}', CPF: '{self.cpf}')"

class Notificacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.datetime.now, nullable=False)
    # Permite enviar para todos os estagiários (destinatario_id nulo) ou para 1 específico
    destinatario_id = db.Column(db.Integer, db.ForeignKey('estagiario.id'), nullable=True)
    enviado_por = db.Column(db.String(100), nullable=False)  # Nome do admin

    def __repr__(self):
        return f"Notificacao('{self.titulo}', Destinatario: '{self.destinatario_id}')"

# Novo modelo de Prontuário, para armazenar dados detalhados das consultas concluídas
class Prontuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    agendamento_id = db.Column(db.Integer, db.ForeignKey('agendamento.id'), nullable=False)
    estagiario_id = db.Column(db.Integer, db.ForeignKey('estagiario.id'), nullable=False)
    paciente_id = db.Column(db.Integer, db.ForeignKey('paciente.id'), nullable=False)

    tipo_triagem = db.Column(db.String(50), nullable=True)
    sala_atendimento = db.Column(db.String(50), nullable=True)

    queixa_principal = db.Column(db.Text, nullable=False)
    historico_paciente = db.Column(db.Text, nullable=False)
    avaliacao_inicial = db.Column(db.Text, nullable=False)

    tipo_encaminhamento = db.Column(db.String(50), nullable=True)
    encaminhamento_descricao = db.Column(db.Text, nullable=True)

    status = db.Column(db.String(20), default='pendente', nullable=False)  # pendente, aprovado, reajustes
    data_criacao = db.Column(db.DateTime, default=datetime.datetime.now, nullable=False)
    ultima_atualizacao = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    def __repr__(self):
        return f"<Prontuario id={self.id} agendamento_id={self.agendamento_id} status='{self.status}'>"
