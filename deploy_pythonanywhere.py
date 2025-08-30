#!/usr/bin/env python3
"""
Script de Deploy Automatizado para PythonAnywhere
Execute este script após fazer upload dos arquivos
"""

import os
import sys
import subprocess

def run_command(command, description):
    """Executa um comando e mostra o resultado"""
    print(f"\n🔄 {description}...")
    print(f"Comando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Sucesso!")
            if result.stdout:
                print(f"Saída: {result.stdout}")
        else:
            print(f"❌ {description} - Erro!")
            print(f"Erro: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Erro ao executar comando: {e}")
        return False
    
    return True

def main():
    print("🚀 Script de Deploy para PythonAnywhere")
    print("=" * 50)
    
    # Verificar se estamos no PythonAnywhere
    if not os.path.exists('/var/www'):
        print("⚠️  Este script deve ser executado no PythonAnywhere")
        print("   Faça upload dos arquivos primeiro e execute no terminal do PythonAnywhere")
        return
    
    # 1. Criar ambiente virtual
    if not run_command("python3 -m venv venv", "Criando ambiente virtual"):
        return
    
    # 2. Ativar ambiente virtual
    if not run_command("source venv/bin/activate", "Ativando ambiente virtual"):
        return
    
    # 3. Instalar dependências
    if not run_command("pip install -r requirements.txt", "Instalando dependências"):
        return
    
    # 4. Configurar variáveis de ambiente
    env_vars = [
        "export FLASK_ENV=production",
        "export SECRET_KEY=sua_chave_secreta_aqui",
        "export MAIL_USERNAME=fundacaofsaacex@gmail.com",
        "export MAIL_PASSWORD=zdmd efek cxjc lgtj"
    ]
    
    print("\n🔧 Configurando variáveis de ambiente...")
    for var in env_vars:
        print(f"   {var}")
    
    # 5. Inicializar banco de dados
    print("\n🗄️  Inicializando banco de dados...")
    db_init_script = """
from main import app
from db import db

with app.app_context():
    db.create_all()
    print("Banco de dados inicializado com sucesso!")
"""
    
    with open('init_db.py', 'w') as f:
        f.write(db_init_script)
    
    if not run_command("python3 init_db.py", "Inicializando banco de dados"):
        return
    
    # 6. Limpar arquivo temporário
    os.remove('init_db.py')
    
    print("\n🎉 Deploy concluído com sucesso!")
    print("\n📋 Próximos passos:")
    print("1. Vá para o painel Web do PythonAnywhere")
    print("2. Configure o WSGI file")
    print("3. Clique em 'Reload'")
    print("4. Acesse seu site!")
    
    print("\n🔗 Seu site estará disponível em:")
    print("   https://SEU_USUARIO.pythonanywhere.com")

if __name__ == "__main__":
    main()
