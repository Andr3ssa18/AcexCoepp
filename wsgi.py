import sys
import os

# Adicionar o diretório do projeto ao path
path = os.path.dirname(os.path.abspath(__file__))
if path not in sys.path:
    sys.path.append(path)

# Importar a aplicação Flask
from main import app

# Para o PythonAnywhere
if __name__ == "__main__":
    app.run()
