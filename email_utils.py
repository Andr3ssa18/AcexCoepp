from flask_mail import Message
from main import mail, app
import logging
import secrets
from datetime import datetime, timedelta
from models import Paciente, Estagiario  # Corrigido: importar os modelos corretos

logger = logging.getLogger(__name__)

# Dicionário temporário para armazenar tokens (em produção, use banco de dados)
password_reset_tokens = {}

def verificar_email_existe(email):
    """
    Verifica se o email existe no banco de dados (paciente ou estagiário)
    """
    try:
        # Verificar se o email existe como paciente
        paciente = Paciente.query.filter_by(email=email).first()
        if paciente:
            logger.info(f"Email encontrado como paciente: {email}")
            return True
        
        # Verificar se o email existe como estagiário
        estagiario = Estagiario.query.filter_by(emailfsa=email).first()
        if estagiario:
            logger.info(f"Email encontrado como estagiário: {email}")
            return True
        
        logger.warning(f"Email não encontrado no banco de dados: {email}")
        return False
        
    except Exception as e:
        logger.error(f"Erro ao verificar email no banco de dados: {str(e)}")
        return False

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
            subject='Consulta Confirmada - COEPP',
            sender=username,
            recipients=[paciente_email]
        )
        
        # Corpo do email em HTML
        msg.html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #074276, #64a1d7);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }}
        .header p {{
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .welcome-text {{
            font-size: 18px;
            color: #555;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
        }}
        .appointment-card {{
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #074276;
        }}
        .appointment-details {{
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
        }}
        .detail-item {{
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
        }}
        .detail-item:last-child {{
            border-bottom: none;
        }}
        .detail-icon {{
            font-size: 20px;
            margin-right: 15px;
            width: 30px;
            text-align: center;
        }}
        .detail-content {{
            flex: 1;
        }}
        .detail-label {{
            font-weight: 600;
            color: #074276;
            font-size: 14px;
            margin-bottom: 4px;
        }}
        .detail-value {{
            color: #333;
            font-size: 16px;
            font-weight: 500;
        }}
        .instructions {{
            background-color: #e8f4fd;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #28a745;
        }}
        .instructions h3 {{
            color: #055a9c;
            margin: 0 0 15px 0;
            font-size: 16px;
            display: flex;
            align-items: center;
        }}
        .instructions h3:before {{
            content: "💡";
            margin-right: 10px;
            font-size: 18px;
        }}
        .instructions ul {{
            margin: 0;
            padding-left: 20px;
            color: #055a9c;
        }}
        .instructions li {{
            margin-bottom: 8px;
            line-height: 1.5;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
        }}
        .logo {{
            font-size: 20px;
            font-weight: 700;
            color: #074276;
            margin-bottom: 10px;
            font-family: 'Times New Roman', Times, serif;
        }}
        .contact-info {{
            background-color: #fff9e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border: 1px solid #ffeaa7;
        }}
        .contact-info p {{
            margin: 5px 0;
            color: #856404;
            font-size: 14px;
        }}
        @media only screen and (max-width: 600px) {{
            .container {{
                margin: 10px;
            }}
            .header {{
                padding: 30px 20px;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .appointment-card {{
                padding: 20px;
            }}
            .detail-item {{
                flex-direction: column;
                align-items: flex-start;
                text-align: left;
            }}
            .detail-icon {{
                margin-right: 0;
                margin-bottom: 8px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>COEPP</h1>
            <p>Centro de Orientação e Estudos Psicológicos</p>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                <p><strong>Olá, {nome_paciente}!</strong></p>
                <p>Sua consulta foi confirmada com sucesso! 🎉</p>
            </div>

            <div class="appointment-card">
                <div class="appointment-details">
                    <div class="detail-item">
                        <div class="detail-icon">📅</div>
                        <div class="detail-content">
                            <div class="detail-label">DATA DA CONSULTA</div>
                            <div class="detail-value">{data_consulta}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">⏰</div>
                        <div class="detail-content">
                            <div class="detail-label">HORÁRIO</div>
                            <div class="detail-value">{hora_consulta}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">👨‍⚕️</div>
                        <div class="detail-content">
                            <div class="detail-label">PROFISSIONAL</div>
                            <div class="detail-value">{profissional}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">📍</div>
                        <div class="detail-content">
                            <div class="detail-label">LOCAL</div>
                            <div class="detail-value">COEPP - Fundação Santo André</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="instructions">
                <h3>Instruções Importantes</h3>
                <ul>
                    <li><strong>Chegue com 15 minutos de antecedência</strong> para o atendimento</li>
                    <li>Traga documento de identificação com foto</li>
                    <li>Em caso de impedimento, cancele com antecedência</li>
                </ul>
            </div>

            <div class="contact-info">
                <p><strong>📞 Precisa de ajuda?</strong></p>
                <p>Entre em contato conosco em caso de dúvidas</p>
                <p>☎ (11) 4979-3458</p>
            </div>
            
            <p style="text-align: center; color: #666; font-style: italic; margin-top: 25px;">
                Estamos ansiosos para atendê-lo(a)!
            </p>
        </div>
        
        <div class="footer">
            <div class="logo">COEPP</div>
            <p><strong>Centro de Orientação e Estudos Psicológicos</strong></p>
            <p>Fundação Santo André</p>
            <p>Este é um email automático, por favor não responda.</p>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
                &copy; {datetime.now().year} COEPP - Todos os direitos reservados
            </p>
        </div>
    </div>
</body>
</html>
        """
        
        # Versão texto simples melhorada
        msg.body = f"""
CONSULTA CONFIRMADA - COEPP

Olá {nome_paciente},

Sua consulta foi confirmada com sucesso! 🎉

📅 DATA: {data_consulta}
⏰ HORÁRIO: {hora_consulta}
👨‍⚕️ PROFISSIONAL: {profissional}
📍 LOCAL: COEPP - Fundação Santo André

📋 INSTRUÇÕES IMPORTANTES:
• Chegue com 15 minutos de antecedência
• Traga documento de identificação com foto
• Em caso de impedimento, cancele com antecedência

📞 PRECISA DE AJUDA?
Entre em contato conosco em caso de dúvidas ou necessidade de remarcação.

Estamos ansiosos para atendê-lo(a)!

---
COEPP - Centro de Orientação e Estudos Psicológicos
Fundação Santo André
Este é um email automático, por favor não responda.
        """
        
        # Enviar email
        mail.send(msg)
        logger.info(f"✅ Email de confirmação de consulta enviado com sucesso para {paciente_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email de confirmação de consulta: {str(e)}")
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
        app.config['MAIL_USERNAME'] = 'fundacaofsaacex@gmail.com'
        app.config['MAIL_PASSWORD'] = 'zdmd efek cxjc lgtj'
        
        logger.info("Configuração de email carregada")
        return True
    except Exception as e:
        logger.error(f"Erro na configuração: {e}")
        return False

def gerar_token_redefinicao(email):
    """
    Gera um token único para redefinição de senha
    """
    try:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(minutes=30) 
        
        # Armazenar token temporariamente
        password_reset_tokens[token] = {
            'email': email,
            'expires_at': expires_at,
            'used': False
        }
        
        logger.info(f"Token de redefinição gerado para: {email} (expira em: {expires_at})")
        return token
        
    except Exception as e:
        logger.error(f"Erro ao gerar token: {str(e)}")
        return None

def validar_token_redefinicao(token):
    """
    Valida se um token de redefinição é válido
    """
    try:
        # Limpar tokens expirados primeiro
        limpar_tokens_expirados()
        
        token_data = password_reset_tokens.get(token)
        
        if not token_data:
            logger.warning(f"Token inválido: {token}")
            return None
        
        if token_data['used']:
            logger.warning(f"Token já utilizado: {token}")
            return None
        
        if datetime.now() > token_data['expires_at']:
            logger.warning(f"Token expirado: {token}")
            del password_reset_tokens[token]
            return None
        
        return token_data['email']
        
    except Exception as e:
        logger.error(f"Erro ao validar token: {str(e)}")
        return None

def marcar_token_como_usado(token):
    """
    Marca um token como utilizado
    """
    try:
        if token in password_reset_tokens:
            password_reset_tokens[token]['used'] = True
            logger.info(f"Token marcado como usado: {token}")
            return True
        return False
    except Exception as e:
        logger.error(f"Erro ao marcar token como usado: {str(e)}")
        return False

def limpar_tokens_expirados():
    """
    Limpa tokens expirados do dicionário
    """
    try:
        now = datetime.now()
        tokens_para_remover = []
        
        for token, data in password_reset_tokens.items():
            if now > data['expires_at']:
                tokens_para_remover.append(token)
        
        for token in tokens_para_remover:
            del password_reset_tokens[token]
        
        if tokens_para_remover:
            logger.info(f"Tokens expirados removidos: {len(tokens_para_remover)}")
            
    except Exception as e:
        logger.error(f"Erro ao limpar tokens expirados: {str(e)}")

def enviar_email_redefinicao_senha(email, reset_url):
    """
    Envia email com link para redefinição de senha
    """
    try:
        # Verificar se o email é válido
        if not email or '@' not in email:
            logger.warning(f"Email inválido: {email}")
            return False

        # Verificar configurações
        username = app.config.get('MAIL_USERNAME')
        password = app.config.get('MAIL_PASSWORD')
        
        if not username or not password:
            logger.warning("Credenciais de email não configuradas")
            return False

        logger.info(f"Tentando enviar email de redefinição para: {email}")
        
        # Criar mensagem
        msg = Message(
            subject='Redefinição de Senha - COEPP',
            sender=username,
            recipients=[email]
        )
        
        # Corpo do email em HTML
        msg.html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #074276, #64a1d7);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }}
        .header p {{
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .welcome-text {{
            font-size: 18px;
            color: #555;
            margin-bottom: 25px;
            line-height: 1.7;
        }}
        .button-container {{
            text-align: center;
            margin: 30px 0;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #074276, #64a1d7);
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(7, 66, 118, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }}
        .button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(7, 66, 118, 0.4);
        }}
        .link-text {{
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 14px;
            color: #495057;
            text-align: center;
        }}
        .security-note {{
            background-color: #fff9e6;
            border-left: 4px solid #ffc107;
            padding: 20px;
            border-radius: 6px;
            margin: 25px 0;
        }}
        .security-note strong {{
            color: #856404;
            display: block;
            margin-bottom: 10px;
            font-size: 16px;
        }}
        .security-note ul {{
            margin: 10px 0;
            padding-left: 20px;
            color: #856404;
        }}
        .security-note li {{
            margin-bottom: 8px;
            line-height: 1.5;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
        }}
        .logo {{
            font-size: 20px;
            font-weight: 700;
            color: #074276;
            margin-bottom: 10px;
            font-family: 'Times New Roman', Times, serif;
        }}
        .info-box {{
            background-color: #e8f4fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #074276;
        }}
        .info-box p {{
            margin: 0;
            color: #055a9c;
            font-weight: 500;
        }}
        @media only screen and (max-width: 600px) {{
            .container {{
                margin: 10px;
            }}
            .header {{
                padding: 30px 20px;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .button {{
                padding: 14px 30px;
                font-size: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>COEPP</h1>
            <p>Centro de Orientação e Estudos Psicológicos</p>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                <p><strong>Olá!</strong></p>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema de agendamentos do COEPP.</p>
            </div>

            <div class="info-box">
                <p>🔐 Para sua segurança, clique no botão abaixo para criar uma nova senha:</p>
            </div>
            
            <div class="button-container">
                <a href="{reset_url}" class="button" style="color: white !important;">
                    🔑 Redefinir Minha Senha
                </a>
            </div>
            
            <p style="text-align: center; color: #666; margin: 20px 0;">
                <strong>Ou copie e cole este link no seu navegador:</strong>
            </p>
            
            <div class="link-text">
                {reset_url}
            </div>
            
            <div class="security-note">
                <strong>⚠️ Informações Importantes:</strong>
                <ul>
                    <li>Este link é válido por <strong>30 minutos</strong></li> 
                    <li>Se você não solicitou esta redefinição, ignore este email</li>
                    <li>Nunca compartilhe seu link de redefinição com outras pessoas</li>
                    <li>Após redefinir, faça login com sua nova senha</li>
                </ul>
            </div>
            
            <p style="color: #666; text-align: center; font-style: italic;">
                Se você tiver alguma dúvida ou precisar de ajuda, entre em contato conosco.<br>
                ☎ (11) 4979-3458
            </p>
        </div>
        
        <div class="footer">
            <div class="logo">COEPP</div>
            <p><strong>Centro de Orientação e Estudos Psicológicos</strong></p>
            <p>Fundação Santo André</p>
            <p>Este é um email automático, por favor não responda.</p>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
                &copy; {datetime.now().year} COEPP - Todos os direitos reservados
            </p>
        </div>
    </div>
</body>
</html>
        """
        
        # Versão texto simples melhorada
        msg.body = f"""
REDEFINIÇÃO DE SENHA - COEPP

Olá!

Recebemos uma solicitação para redefinir a senha da sua conta no sistema de agendamentos do COEPP.

Para criar uma nova senha, acesse o link abaixo:
{reset_url}

INFORMAÇÕES IMPORTANTES:
• Este link é válido por 30 minutos  
• Se você não solicitou esta redefinição, ignore este email
• Nunca compartilhe seu link de redefinição com outras pessoas
• Após redefinir, faça login com sua nova senha

Se você tiver alguma dúvida ou precisar de ajuda, entre em contato conosco.

---
COEPP - Centro de Orientação e Estudos Psicológicos
Fundação Santo André
Este é um email automático, por favor não responda.
        """
        
        # Enviar email
        mail.send(msg)
        logger.info(f"✅ Email de redefinição enviado com sucesso para {email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email de redefinição: {str(e)}")
        return False
