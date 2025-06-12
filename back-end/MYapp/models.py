# models.py
from db import db
import datetime # Importar datetime para tipos de data

class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False) # Use db.Date para datas
    genero = db.Column(db.String(20), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    endereco = db.Column(db.String(200), nullable=False)
    numero_casa = db.Column(db.String(10), nullable=False)
    senha = db.Column(db.String(200), nullable=False) # Armazena hashes de senhas, não senhas em texto puro!
    agendamentos = db.relationship('Agendamento', backref='paciente', lazy=True) # Relacionamento com Agendamento

    def __repr__(self):
        return f"Paciente ('{self.nome}')"

class Estagiario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    RA = db.Column(db.String(10), unique=True, nullable=False) # RA geralmente é string
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    # AQUI ESTÁ A CHAVE! Certifique-se de que esta linha existe e o nome é "telefone"
    telefone_aluno = db.Column(db.String(20), nullable=False)
    emailfsa = db.Column(db.String(100), unique=True, nullable=False)
    curso_periodo = db.Column(db.String(50), nullable=False)
    senha = db.Column(db.String(200), nullable=False) # Armazenar a senha hash
    agendamentos = db.relationship('Agendamento', backref='estagiario', lazy=True) # Relacionamento com Agendamento
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