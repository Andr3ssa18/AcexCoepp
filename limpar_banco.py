#aqui voce pode limpar o banco de dados para testar o sistema

from main import app, db
from models import Agendamento, Disponibilidade, Prontuario

def limpar_banco():
    with app.app_context():
        try:
            # Deletar todos os prontuários (dependem de agendamentos)
            num_prontuarios = Prontuario.query.delete()
            print(f"Deletados {num_prontuarios} prontuários")

            # Deletar todos os agendamentos
            num_agendamentos = Agendamento.query.delete()
            print(f"Deletados {num_agendamentos} agendamentos")

            # Deletar todas as disponibilidades
            num_disponibilidades = Disponibilidade.query.delete()
            print(f"Deletadas {num_disponibilidades} disponibilidades")

            # Commit das alterações
            db.session.commit()
            print("Banco de dados limpo com sucesso!")

        except Exception as e:
            db.session.rollback()
            print(f"Erro ao limpar banco de dados: {e}")

if __name__ == "__main__":
    limpar_banco() 