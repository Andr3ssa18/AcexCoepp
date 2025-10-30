import os
from flask import Flask
from db import db
from flask_migrate import Migrate
import logging
from flask_mail import Mail, Message
from dotenv import load_dotenv

# Configurar logging básico
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambienteS
load_dotenv(override=True)

app = Flask(__name__)

# Configurar logging do Flask
app.logger.setLevel(logging.DEBUG)

# Configurações do Flask-Mail (simples)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'fundacaofsaacex@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'zdmd efek cxjc lgtj')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME', 'fundacaofsaacex@gmail.com')

# Log simples
app.logger.info("Sistema de email configurado")
app.logger.info(f"Email configurado: {app.config['MAIL_USERNAME']}")

# Inicializar o Flask-Mail
mail = Mail(app)

# Obtenha o caminho absoluto do diretório onde main.py está
basedir = os.path.abspath(os.path.dirname(__file__))

# Configurações do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'fsa_teste.db')
app.secret_key = 'uma_chave_muito_secreta_e_complexa_aqui' 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar extensões
db.init_app(app)
migrate = Migrate(app, db)

# Importar views DEPOIS de inicializar app e db
from views import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.logger.info("Aplicação Flask iniciando...")
    app.run(debug=True) 