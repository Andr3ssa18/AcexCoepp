# 🚀 Guia Completo para PythonAnywhere

## 📋 **Passo a Passo para Subir seu Site**

### **1. Criar conta no PythonAnywhere**
- Acesse: https://www.pythonanywhere.com/
- Crie uma conta gratuita (ou paga para mais recursos)
- Faça login no painel

### **2. Fazer Upload dos Arquivos**
- No painel, vá em **Files**
- Crie uma pasta para seu projeto (ex: `acexcoep`)
- Faça upload de TODOS os arquivos do seu projeto
- **IMPORTANTE**: Mantenha a estrutura de pastas

### **3. Configurar o Ambiente Virtual**
```bash
# No terminal do PythonAnywhere
cd acexcoep
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### **4. Configurar o Web App**
- No painel, vá em **Web**
- Clique em **Add a new web app**
- Escolha **Flask**
- Selecione **Python 3.9** (ou versão compatível)
- Escolha a pasta do seu projeto

### **5. Configurar o WSGI**
- No arquivo WSGI, substitua o conteúdo por:
```python
import sys
import os

# Adicionar o diretório do projeto ao path
path = '/home/SEU_USUARIO/acexcoep'
if path not in sys.path:
    sys.path.append(path)

# Importar a aplicação Flask
from main import app

# Para o PythonAnywhere
if __name__ == "__main__":
    app.run()
```

### **6. Configurar Variáveis de Ambiente**
No terminal do PythonAnywhere:
```bash
export FLASK_ENV=production
export SECRET_KEY=sua_chave_secreta_aqui
export MAIL_USERNAME=fundacaofsaacex@gmail.com
export MAIL_PASSWORD=zdmd efek cxjc lgtj
```

### **7. Configurar o Banco de Dados**
```bash
# No terminal, dentro do ambiente virtual
python3
>>> from main import app
>>> from db import db
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### **8. Reiniciar o Web App**
- No painel **Web**, clique em **Reload**
- Aguarde alguns segundos

### **9. Acessar seu Site**
- Seu site estará disponível em: `https://SEU_USUARIO.pythonanywhere.com`

## ⚠️ **Problemas Comuns e Soluções**

### **Erro de Importação**
- Verifique se todas as dependências estão instaladas
- Confirme se o path no WSGI está correto

### **Erro de Banco de Dados**
- Execute `db.create_all()` no contexto da aplicação
- Verifique permissões de escrita na pasta

### **Erro de Email**
- Configure as variáveis de ambiente corretamente
- Verifique se o Gmail permite "apps menos seguros"

## 🔧 **Configurações Adicionais**

### **Domínio Personalizado (Pago)**
- Configure DNS para apontar para o PythonAnywhere
- Adicione o domínio no painel Web

### **HTTPS (Pago)**
- Ative SSL no painel Web
- Configure certificados se necessário

### **Backup Automático**
- Configure backup automático dos arquivos
- Faça backup regular do banco de dados

## 📞 **Suporte**
- Documentação oficial: https://help.pythonanywhere.com/
- Fórum da comunidade
- Suporte por email (planos pagos)

## 🎯 **Próximos Passos**
1. Teste todas as funcionalidades
2. Configure monitoramento
3. Otimize performance
4. Configure backup automático
5. Monitore logs regularmente
