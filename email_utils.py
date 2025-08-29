from flask_mail import Message
from main import mail, app
import logging

logger = logging.getLogger(__name__)

def enviar_email_confirmacao_consulta(paciente_email, nome_paciente, data_consulta, hora_consulta, profissional):
    """
    Envia um email de confirmação de consulta para o paciente
    """
    try:
        # Verificar se o email é válido
        if not paciente_email or '@' not in paciente_email:
            logger.warning(f"Email inválido: {paciente_email}")
            return False

        # Verificar configurações
        username = app.config.get('MAIL_USERNAME')
        password = app.config.get('MAIL_PASSWORD')
        
        if not username or not password:
            logger.warning("Credenciais de email não configuradas")
            return True

        logger.info(f"Tentando enviar email para: {paciente_email}")
        logger.info(f"Usando servidor: {app.config.get('MAIL_SERVER')}:{app.config.get('MAIL_PORT')}")
        
        # Criar mensagem
        msg = Message(
            subject='Consulta Confirmada - FSA',
            sender=username,
            recipients=[paciente_email]
        )
        
        # Corpo do email
        msg.body = f"""
Olá {nome_paciente},

Sua consulta foi confirmada!

Data: {data_consulta}
Horário: {hora_consulta}
Profissional: {profissional}

Chegue com 15 minutos de antecedência.

Equipe FSA
        """
        
        # Enviar email
        mail.send(msg)
        logger.info(f"✅ Email enviado com sucesso para {paciente_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email: {str(e)}")
        logger.error(f"Detalhes do erro: {type(e).__name__}")
        return False

def configurar_email_simples():
    """
    Configuração simples do email - apenas para teste
    """
    try:
        # Configurações básicas para Gmail
        app.config['MAIL_SERVER'] = 'smtp.gmail.com'
        app.config['MAIL_PORT'] = 587
        app.config['MAIL_USE_TLS'] = True
        app.config['MAIL_USERNAME'] = 'fundacaofsaacex@gmail.com'  # Substitua pelo seu email
        app.config['MAIL_PASSWORD'] = 'zdmd efek cxjc lgtj'     # Substitua pela sua senha de app
        
        logger.info("Configuração de email carregada")
        return True
    except Exception as e:
        logger.error(f"Erro na configuração: {e}")
        return False 