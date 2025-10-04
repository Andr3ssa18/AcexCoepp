#!/usr/bin/env python3
"""
Script para migrar dados do SQLite para MySQL
Execute este script após configurar o MySQL
"""

import sqlite3
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime

# Configurações do MySQL
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '',  # Altere conforme sua configuração
    'database': 'fsa_teste',
    'charset': 'utf8mb4'
}

# Caminho do banco SQLite
SQLITE_DB = 'instance/fsa_teste.db'

def create_mysql_database():
    """Cria o banco de dados MySQL se não existir"""
    try:
        # Conectar sem especificar database
        connection = mysql.connector.connect(
            host=MYSQL_CONFIG['host'],
            port=MYSQL_CONFIG['port'],
            user=MYSQL_CONFIG['user'],
            password=MYSQL_CONFIG['password']
        )
        
        cursor = connection.cursor()
        
        # Criar database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_CONFIG['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Database '{MYSQL_CONFIG['database']}' criado/verificado com sucesso!")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"❌ Erro ao criar database MySQL: {e}")
        return False
    
    return True

def create_mysql_tables():
    """Cria as tabelas no MySQL baseadas no SQLite"""
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = connection.cursor()
        
        # SQL para criar tabelas (adaptado para MySQL)
        tables_sql = [
            """
            CREATE TABLE IF NOT EXISTS paciente (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                data_nascimento DATE NOT NULL,
                genero VARCHAR(20) NOT NULL,
                cpf VARCHAR(14) UNIQUE NOT NULL,
                telefone VARCHAR(20) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                endereco VARCHAR(200) NOT NULL,
                numero_casa VARCHAR(10) NOT NULL,
                senha VARCHAR(200) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """,
            """
            CREATE TABLE IF NOT EXISTS estagiario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                data_nascimento DATE NOT NULL,
                RA VARCHAR(10) UNIQUE NOT NULL,
                cpf VARCHAR(14) UNIQUE NOT NULL,
                telefone_aluno VARCHAR(20) NOT NULL,
                emailfsa VARCHAR(100) UNIQUE NOT NULL,
                curso_periodo VARCHAR(50) NOT NULL,
                senha VARCHAR(200) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """,
            """
            CREATE TABLE IF NOT EXISTS agendamento (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paciente_id INT NOT NULL,
                estagiario_id INT NULL,
                data_solicitacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                data_agendamento DATETIME NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'solicitado',
                observacoes_estagiario TEXT NULL,
                observacoes_paciente TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (paciente_id) REFERENCES paciente(id) ON DELETE CASCADE,
                FOREIGN KEY (estagiario_id) REFERENCES estagiario(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """,
            """
            CREATE TABLE IF NOT EXISTS disponibilidade (
                id INT AUTO_INCREMENT PRIMARY KEY,
                estagiario_id INT NOT NULL,
                data DATE NOT NULL,
                hora_inicio TIME NOT NULL,
                hora_fim TIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (estagiario_id) REFERENCES estagiario(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """,
            """
            CREATE TABLE IF NOT EXISTS alembic_version (
                version_num VARCHAR(32) NOT NULL,
                CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
        ]
        
        for sql in tables_sql:
            cursor.execute(sql)
            print("✅ Tabela criada/verificada com sucesso!")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return True
        
    except Error as e:
        print(f"❌ Erro ao criar tabelas MySQL: {e}")
        return False

def migrate_data():
    """Migra os dados do SQLite para MySQL"""
    try:
        # Conectar ao SQLite
        sqlite_conn = sqlite3.connect(SQLITE_DB)
        sqlite_cursor = sqlite_conn.cursor()
        
        # Conectar ao MySQL
        mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
        mysql_cursor = mysql_conn.cursor()
        
        # Migrar dados de cada tabela
        tables = ['paciente', 'estagiario', 'agendamento', 'disponibilidade', 'alembic_version']
        
        for table in tables:
            print(f"🔄 Migrando tabela: {table}")
            
            # Buscar dados do SQLite
            sqlite_cursor.execute(f"SELECT * FROM {table}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"⚠️  Tabela {table} está vazia")
                continue
            
            # Buscar nomes das colunas
            sqlite_cursor.execute(f"PRAGMA table_info({table})")
            columns_info = sqlite_cursor.fetchall()
            columns = [col[1] for col in columns_info]
            
            # Preparar INSERT para MySQL
            placeholders = ', '.join(['%s'] * len(columns))
            columns_str = ', '.join(columns)
            
            # Limpar tabela MySQL (opcional)
            mysql_cursor.execute(f"DELETE FROM {table}")
            
            # Inserir dados
            insert_sql = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
            
            for row in rows:
                mysql_cursor.execute(insert_sql, row)
            
            print(f"✅ {len(rows)} registros migrados para {table}")
        
        mysql_conn.commit()
        print("🎉 Migração concluída com sucesso!")
        
        # Fechar conexões
        sqlite_cursor.close()
        sqlite_conn.close()
        mysql_cursor.close()
        mysql_conn.close()
        
        return True
        
    except Error as e:
        print(f"❌ Erro na migração: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        return False

def main():
    """Função principal"""
    print("=== MIGRAÇÃO SQLITE → MYSQL ===")
    print(f"SQLite: {SQLITE_DB}")
    print(f"MySQL: {MYSQL_CONFIG['host']}:{MYSQL_CONFIG['port']}/{MYSQL_CONFIG['database']}")
    print()
    
    # Verificar se SQLite existe
    if not os.path.exists(SQLITE_DB):
        print(f"❌ Arquivo SQLite não encontrado: {SQLITE_DB}")
        return
    
    # 1. Criar database MySQL
    print("1. Criando database MySQL...")
    if not create_mysql_database():
        return
    
    # 2. Criar tabelas MySQL
    print("\n2. Criando tabelas MySQL...")
    if not create_mysql_tables():
        return
    
    # 3. Migrar dados
    print("\n3. Migrando dados...")
    if not migrate_data():
        return
    
    print("\n✅ Migração concluída! Agora você pode usar o SQLTools com MySQL.")
    print("\n📋 Próximos passos:")
    print("1. Instale a extensão 'SQLTools MySQL/MariaDB' no VS Code")
    print("2. Configure as credenciais MySQL no arquivo .vscode/settings.json")
    print("3. Conecte ao banco 'FSA MySQL Database' no SQLTools")

if __name__ == "__main__":
    main()
