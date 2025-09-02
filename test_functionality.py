#!/usr/bin/env python3
"""
Arquivo de teste para verificar as funcionalidades implementadas
"""

import requests
import json

# URL base da aplicação
BASE_URL = "http://localhost:5000"

def test_login_estagiario():
    """Testa o login de um estagiário"""
    print("=== Testando Login de Estagiário ===")
    
    # Dados de teste (você precisará criar um estagiário primeiro)
    login_data = {
        'identificador': 'teste@fsa.br',  # Substitua por um email válido
        'password': 'senha123'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", data=login_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("Login bem-sucedido!")
            # Verificar se foi redirecionado para aba_estagiario
            if 'aba_estagiario' in response.url:
                print("Redirecionamento correto para aba_estagiario")
            else:
                print(f"URL de redirecionamento: {response.url}")
        else:
            print(f"Login falhou: {response.text}")
            
    except Exception as e:
        print(f"Erro no teste: {e}")

def test_minhas_consultas_estagiario():
    """Testa o acesso à página de minhas consultas como estagiário"""
    print("\n=== Testando Minhas Consultas (Estagiário) ===")
    
    try:
        # Primeiro fazer login
        session = requests.Session()
        login_data = {
            'identificador': 'teste@fsa.br',  # Substitua por um email válido
            'password': 'senha123'
        }
        
        login_response = session.post(f"{BASE_URL}/login", data=login_data)
        
        if login_response.status_code == 200:
            print("Login realizado com sucesso")
            
            # Agora acessar minhas consultas
            consultas_response = session.get(f"{BASE_URL}/minhas_consultas")
            print(f"Status Minhas Consultas: {consultas_response.status_code}")
            
            if consultas_response.status_code == 200:
                print("Acesso a minhas consultas bem-sucedido!")
                # Verificar se a página contém as informações corretas
                if 'Minhas Consultas Confirmadas' in consultas_response.text:
                    print("Título correto para estagiário")
                else:
                    print("Título incorreto ou não encontrado")
            else:
                print(f"Erro ao acessar minhas consultas: {consultas_response.text}")
        else:
            print("Login falhou, não é possível testar minhas consultas")
            
    except Exception as e:
        print(f"Erro no teste: {e}")

def test_api_consultas_estagiario():
    """Testa a API de consultas do estagiário"""
    print("\n=== Testando API de Consultas do Estagiário ===")
    
    try:
        # Primeiro fazer login
        session = requests.Session()
        login_data = {
            'identificador': 'teste@fsa.br',  # Substitua por um email válido
            'password': 'senha123'
        }
        
        login_response = session.post(f"{BASE_URL}/login", data=login_data)
        
        if login_response.status_code == 200:
            print("Login realizado com sucesso")
            
            # Testar a API de consultas
            api_response = session.get(f"{BASE_URL}/api/estagiario/consultas")
            print(f"Status API Consultas: {api_response.status_code}")
            
            if api_response.status_code == 200:
                consultas = api_response.json()
                print(f"Consultas encontradas: {len(consultas)}")
                if consultas:
                    print("Primeira consulta:", consultas[0])
                else:
                    print("Nenhuma consulta encontrada")
            else:
                print(f"Erro na API: {api_response.text}")
        else:
            print("Login falhou, não é possível testar a API")
            
    except Exception as e:
        print(f"Erro no teste: {e}")

def test_confirmar_triagem():
    """Testa a confirmação de triagem por um estagiário"""
    print("\n=== Testando Confirmação de Triagem ===")
    
    try:
        # Primeiro fazer login
        session = requests.Session()
        login_data = {
            'identificador': 'teste@fsa.br',  # Substitua por um email válido
            'password': 'senha123'
        }
        
        login_response = session.post(f"{BASE_URL}/login", data=login_data)
        
        if login_response.status_code == 200:
            print("Login realizado com sucesso")
            
            # Primeiro listar solicitações disponíveis
            solicitacoes_response = session.get(f"{BASE_URL}/api/estagiario/solicitacoes")
            print(f"Status Solicitações: {solicitacoes_response.status_code}")
            
            if solicitacoes_response.status_code == 200:
                solicitacoes = solicitacoes_response.json()
                print(f"Solicitações disponíveis: {len(solicitacoes)}")
                
                if solicitacoes:
                    # Testar confirmação da primeira solicitação
                    primeira_solicitacao = solicitacoes[0]
                    print(f"Testando confirmação da solicitação {primeira_solicitacao['id']}")
                    
                    confirmar_data = {
                        'data_agendamento': '2024-12-20T14:00',
                        'observacoes': 'Teste de confirmação'
                    }
                    
                    confirmar_response = session.post(
                        f"{BASE_URL}/api/estagiario/agendamentos/confirmar/{primeira_solicitacao['id']}",
                        json=confirmar_data
                    )
                    
                    print(f"Status Confirmação: {confirmar_response.status_code}")
                    if confirmar_response.status_code == 200:
                        print("Triagem confirmada com sucesso!")
                        
                        # Verificar se agora aparece nas consultas
                        consultas_response = session.get(f"{BASE_URL}/api/estagiario/consultas")
                        if consultas_response.status_code == 200:
                            consultas = consultas_response.json()
                            print(f"Consultas após confirmação: {len(consultas)}")
                    else:
                        print(f"Erro na confirmação: {confirmar_response.text}")
                else:
                    print("Nenhuma solicitação disponível para teste")
            else:
                print(f"Erro ao listar solicitações: {solicitacoes_response.text}")
        else:
            print("Login falhou, não é possível testar confirmação")
            
    except Exception as e:
        print(f"Erro no teste: {e}")

if __name__ == "__main__":
    print("Iniciando testes das funcionalidades...")
    
    # Executar testes
    test_login_estagiario()
    test_minhas_consultas_estagiario()
    test_api_consultas_estagiario()
    test_confirmar_triagem()
    
    print("\n=== Testes Concluídos ===")
    print("Verifique os resultados acima para identificar possíveis problemas.")
