import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'uma_chave_muito_secreta_e_complexa_aqui'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações de email
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'fundacaofsaacex@gmail.com')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', 'zdmd efek cxjc lgtj')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_USERNAME', 'fundacaofsaacex@gmail.com')

class DevelopmentConfig(Config):
    DEBUG = True
    # Para desenvolvimento local
    basedir = os.path.abspath(os.path.dirname(__file__))
    instance_dir = os.path.join(basedir, 'instance')
    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir)
    db_path = os.path.join(instance_dir, 'fsa_teste.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path}'

class ProductionConfig(Config):
    DEBUG = False
    # Para PythonAnywhere - usar variável de ambiente
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///fsa_teste.db'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
