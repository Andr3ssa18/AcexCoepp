# 📧 Configurar Email - Guia Simples

## Como ativar o envio de emails

### 1. Criar arquivo .env
Crie um arquivo chamado `.env` na pasta do projeto:

```
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_de_app
```

### 2. Configurar Gmail
1. Ative a verificação em duas etapas no Google
2. Vá em "Senhas de app" 
3. Gere uma senha para "Email"
4. Use essa senha no arquivo .env

### 3. Testar
1. Reinicie o servidor: `python main.py`
2. Acesse: `http://localhost:5000/teste-email`

## ✅ Pronto!
O sistema funcionará com ou sem email configurado. 