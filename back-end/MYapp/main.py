
import os # Adicione esta linha no topo
from flask import Flask, render_template, request, redirect, url_for, flash, session
from db import db
from flask_migrate import Migrate

app = Flask(__name__)

# Obtenha o caminho absoluto do diretório onde main.py está
basedir = os.path.abspath(os.path.dirname(__file__))

# Use os.path.join para construir o caminho completo para o banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'fsa_teste.db')
app.secret_key = 'uma_chave_muito_secreta_e_complexa_aqui' 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)

from views import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    app.run(debug=True)