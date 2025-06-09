# models.py
from db import db
import datetime 

class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False) # Use db.Date para datas
    genero = db.Column(db.String(20), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    telefone = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    endereco = db.Column(db.String(200), nullable=False)
    numero_casa = db.Column(db.String(10), nullable=False)
    senha = db.Column(db.String(200), nullable=False) # Armazene hashes de senhas, não senhas em texto puro!


    def __repr__(self):
        return f'<Paciente {self.nome}>'
    

class Estagiario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    RA = db.Column(db.String(10), unique=True, nullable=False) # RA geralmente é string
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    # AQUI ESTÁ A CHAVE! Certifique-se de que esta linha existe e o nome é 'telefone'
    telefone_aluno = db.Column(db.String(20), nullable=False) 
    emailfsa = db.Column(db.String(100), unique=True, nullable=False)
    curso_periodo = db.Column(db.String(50), nullable=False)
    senha = db.Column(db.String(128), nullable=False) # Armazenar a senha hash

    def __repr__(self):
        return f'<Estagiario {self.nome} - RA: {self.RA}>'
    



