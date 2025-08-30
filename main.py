import os
from flask import Flask
from db import db
from flask_migrate import Migrate
import logging
from flask_mail import Mail, Message
from dotenv import load_dotenv
from config import config

# Configurar logging básico
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv(override=True)

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Carregar configuração
    app.config.from_object(config[config_name])
    
    # Configurar logging do Flask
    app.logger.setLevel(logging.DEBUG)
    
    # Inicializar extensões
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # Inicializar o Flask-Mail
    mail = Mail(app)
    
    # Importar e inicializar views
    from views import init_app as init_views
    init_views(app, mail)
    
    return app

# Criar a aplicação
app = create_app(os.environ.get('FLASK_ENV', 'development'))

if __name__ == '__main__':
    try:
        with app.app_context():
            db.create_all()
            app.logger.info("Banco de dados inicializado com sucesso")
        
        app.logger.info("Aplicação Flask iniciando...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        app.logger.error(f"Erro ao iniciar aplicação: {e}")
        raise 