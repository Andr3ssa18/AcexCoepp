# AcexCoepp - Sistema de Triagem e Gestão de Pacientes

## Visão Geral
O AcexCoepp é um sistema web desenvolvido para gerenciar o processo de triagem e atendimento de pacientes, com foco especial em estudantes pisicologia. O sistema até o momento permite o cadastro de pacientes, triagem inicial, solicitações de atendimento e acompanhamento do status dos casos.

## Funcionalidades Principais

### 1. Autenticação e Controle de Acesso
- Login seguro para diferentes tipos de usuários (pacientes e estagiários)
- Sistema de cadastro de novos usuários
- Proteção de rotas baseada em perfil de acesso

### 2. Módulo de Pacientes
- Cadastro completo de pacientes com informações pessoais
- Sistema de triagem com classificação de prioridade
- Acompanhamento do status do atendimento
- Histórico de solicitações

### 3. Módulo de Estagiários
- Visualização de solicitações de atendimento
- Gerenciamento de status dos casos
- Interface para atualização de informações
- Sistema de notificações

### 4. Interface Responsiva
- Design adaptativo para diferentes dispositivos
- Layout otimizado para desktop, tablet e mobile
- Experiência de usuário consistente em todas as plataformas

## Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3 (com variáveis CSS para temas)
- JavaScript
- Design responsivo
- Animações e transições suaves

### Backend
- Python
- Framework web
- Sistema de autenticação
- Banco de dados

## Estrutura do Projeto exemplo:

```
├── MYapp/
│   ├── static/
│   │   ├── css/
│   │   │   ├── aba_estagiario.css
│   │   │   ├── aba_paciente.css
│   │   │   ├── cadastroaluno.css
│   │   │   └── login.css
│   │   └── js/
│   │       └── main.js
│   ├── templates/
│   │   ├── aba_estagiario.html
│   │   ├── aba_paciente.html
│   │   ├── cadastroaluno.html
│   │   └── login.html
│   └── app.py
```

## Características Técnicas

### Design System
- Paleta de cores consistente
- Tipografia padronizada
- Componentes reutilizáveis
- Sistema de grid responsivo

### Responsividade
- Breakpoints otimizados:
  - Desktop: > 1200px
  - Tablet: 768px - 1199px
  - Mobile: 320px - 767px
- Layout fluido
- Elementos adaptáveis

### Segurança
- Autenticação segura
- Proteção contra CSRF
- Validação de dados
- Sanitização de inputs

## Instalação e Configuração

1. Clone o repositório
2. Instale as dependências
3. Configure as variáveis de ambiente
4. Execute o servidor de desenvolvimento

## Uso

### Pacientes
1. Acesse a página de login
2. Faça login ou cadastre-se
3. Preencha o formulário de triagem
4. Acompanhe o status do atendimento

### Estagiários
1. Acesse a página de login
2. Faça login com credenciais de estagiário
3. Visualize as solicitações pendentes
4. Gerencie os casos atribuídos

## Manutenção e Suporte
- Atualizações regulares
- Correção de bugs
- Melhorias de performance
- Suporte técnico


## Licença
Este projeto está sob a licença [alunos da FSA do curso de sistemas de informação 3B] 