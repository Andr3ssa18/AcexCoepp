
import os # Adicione esta linha no topo
from flask import Flask
from db import db
from flask_migrate import Migrate
import logging # Adicionar import de logging

app = Flask(__name__)

# Configurar logging
# O logger do Flask já é configurado quando debug=True.
# Esta linha garante que, mesmo que debug=False, as mensagens INFO sejam capturadas.
# E se debug=True, também garante que o nível INFO seja exibido se o padrão for mais alto.
app.logger.setLevel(logging.INFO)

# Obtenha o caminho absoluto do diretório onde main.py está
basedir = os.path.abspath(os.path.dirname(__file__))

# Use os.path.join para construir o caminho completo para o banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'fsa_teste.db')
app.secret_key = 'uma_chave_muito_secreta_e_complexa_aqui' 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)
# Importar views DEPOIS de inicializar app e db
from views import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Adiciona um log para confirmar que a aplicação está tentando iniciar
    app.logger.info("Aplicação Flask iniciando...")
    app.run(debug=True) 