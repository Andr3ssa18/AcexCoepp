// Variáveis globais
let currentPage = 'pagina-minhas-consultas';
let dropdownOpen = false;
const API_URL = 'http://localhost:5000/api';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos dos botões
    document.getElementById('btn-todos-dias').addEventListener('click', selecionarTodosDias);
    document.getElementById('btn-todos-periodos').addEventListener('click', selecionarTodosPeriodos);
    document.getElementById('btn-salvar-disponibilidade').addEventListener('click', salvarDisponibilidade);
    
    // Configurar navegação do calendário
    document.getElementById('prev-month').addEventListener('click', mesAnterior);
    document.getElementById('next-month').addEventListener('click', mesSeguinte);
    
    // Inicializar página ativa
    mostrarPagina('pagina-minhas-consultas');
    
    // Carregar dados iniciais
    carregarConsultas();

    // Adiciona o evento de busca quando a página de prontuários é carregada
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', buscarPaciente);
    }
});

// Funções de API
async function fetchAPI(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro na requisição');
        }
        
        return result;
    } catch (error) {
        console.error('Erro na API:', error);
        mostrarToast(`Erro: ${error.message}`);
        return null;
    }
}

async function carregarConsultas() {
    try {
        const response = await fetch('/api/estagiario/consultas');
        const consultas = await response.json();
        
        if (response.ok && consultas) {
            // Atualizar interface com as consultas
            atualizarListaConsultas(consultas);
        } else {
            console.error('Erro ao carregar consultas:', consultas.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        mostrarToast('Erro ao carregar consultas', 'error');
    }
}

// Função corrigida para confirmar triagem
async function confirmarTriagemAPI(solicitacaoId, dataAgendamento, observacoes) {
    try {
        const response = await fetch(`/api/estagiario/agendamentos/confirmar/${solicitacaoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data_agendamento: dataAgendamento,
                observacoes: observacoes || 'Triagem confirmada pelo estagiário'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao confirmar triagem');
        }

        mostrarToast('Triagem confirmada com sucesso! A consulta agora aparece para o paciente.', 'success');
        await carregarSolicitacoes(); // Recarrega a lista de solicitações
        fecharModalConfirmacaoTriagem(); // Fecha o modal após a confirmação
        
        // Opcional: Recarregar também as consultas do estagiário
        await carregarConsultas();
        
    } catch (error) {
        console.error('Erro ao confirmar triagem:', error);
        mostrarToast(error.message || 'Erro ao confirmar triagem', 'error');
    }
}

// Função melhorada para carregar consultas do estagiário
async function carregarConsultas() {
    try {
        const response = await fetch('/api/estagiario/consultas');
        const consultas = await response.json();
        
        if (response.ok && consultas) {
            atualizarListaConsultas(consultas);
        } else {
            console.error('Erro ao carregar consultas:', consultas.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        mostrarToast('Erro ao carregar consultas', 'error');
    }
}

// Função melhorada para atualizar a lista de consultas
function atualizarListaConsultas(consultas) {
    const consultasContainer = document.querySelector('.consultas-dia');
    
    if (!consultasContainer) {
        console.error('Container de consultas não encontrado');
        return;
    }
    
    if (!consultas || consultas.length === 0) {
        consultasContainer.innerHTML = `
            <h3>Consultas do dia</h3>
            <div class="info-message">
                <p>Nenhuma consulta agendada para hoje.</p>
            </div>
        `;
        return;
    }
    
    // Filtrar consultas confirmadas
    const consultasConfirmadas = consultas.filter(consulta => 
        consulta.status === 'confirmado' || consulta.status === 'agendado'
    );
    
    if (consultasConfirmadas.length === 0) {
        consultasContainer.innerHTML = `
            <h3>Consultas do dia</h3>
            <div class="info-message">
                <p>Nenhuma consulta confirmada para hoje.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <h3>Consultas Confirmadas</h3>
        <div class="consultas-lista">
    `;
    
    consultasConfirmadas.forEach(consulta => {
        const dataFormatada = consulta.data_agendamento ? 
            new Date(consulta.data_agendamento).toLocaleDateString('pt-BR') : 'Data a definir';
        const horarioFormatado = consulta.data_agendamento ? 
            new Date(consulta.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horário a definir';
        
        html += `
            <div class="consulta-item status-confirmado">
                <div class="consulta-header">
                    <h4>Consulta com ${consulta.paciente_nome || 'Paciente'}</h4>
                    <span class="status-badge status-confirmado">Confirmada</span>
                </div>
                <div class="consulta-details">
                    <p><strong>Data:</strong> ${dataFormatada}</p>
                    <p><strong>Horário:</strong> ${horarioFormatado}</p>
                    <p><strong>Paciente:</strong> ${consulta.paciente_nome || 'N/A'}</p>
                    <p><strong>Tipo:</strong> ${consulta.tipo_atendimento}</p>
                    ${consulta.observacoes_estagiario ? `<p><strong>Observações:</strong> ${consulta.observacoes_estagiario}</p>` : ''}
                </div>
                <div class="consulta-actions">
                    <button class="btn btn-primary" onclick="finalizarConsulta(${consulta.id})">
                        Finalizar Consulta
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    consultasContainer.innerHTML = html;
}

async function salvarDisponibilidadeAPI(disponibilidade) {
    const resultado = await fetchAPI('/disponibilidades', 'POST', disponibilidade);
    
    if (resultado) {
        abrirModalSucessoDisponibilidade();
    }
}

// Funções de navegação
function mostrarPagina(paginaId) {
    // Esconde todas as páginas
    document.querySelectorAll('.page').forEach(pagina => {
        pagina.style.display = 'none';
    });
    
    // Mostra a página selecionada
    document.getElementById(paginaId).style.display = 'block';
    
    // Atualiza o menu ativo
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[onclick="mostrarPagina('${paginaId}')"]`).classList.add('active');

    // Carrega as solicitações quando a página de solicitações é exibida
    if (paginaId === 'pagina-solicitacoes') {
        carregarSolicitacoes();
    }
    
    // Carrega as consultas quando a página de minhas consultas é exibida
    if (paginaId === 'pagina-minhas-consultas') {
        carregarConsultas();
    }
}

// Funções do dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    if (dropdownOpen) {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
    dropdownOpen = !dropdownOpen;
}

// Funções da página de Meus Horários
function selecionarTodosDias() {
    const checkboxes = document.querySelectorAll('input[name="dia"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    mostrarToast('Todos os dias selecionados');
}

function selecionarTodosPeriodos() {
    const checkboxes = document.querySelectorAll('input[name="periodo"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    mostrarToast('Todos os períodos selecionados');
}

function salvarDisponibilidade() {
    // Coletar dados do formulário
    const diasSemana = Array.from(document.querySelectorAll('input[name="dia"]:checked'))
        .map(checkbox => checkbox.value);
    
    const periodos = Array.from(document.querySelectorAll('input[name="periodo"]:checked'))
        .map(checkbox => checkbox.value);
    
    const horarioEspecifico = document.querySelector('.form-control').value;
    
    // Validar dados
    if (diasSemana.length === 0) {
        mostrarToast('Selecione pelo menos um dia da semana');
        return;
    }
    
    if (periodos.length === 0) {
        mostrarToast('Selecione pelo menos um período');
        return;
    }
    
    // Preparar dados para API
    const disponibilidade = {
        estagiario_id: 1, // Simulação - em produção, usaria o ID do estagiário logado
        dias_semana: diasSemana,
        periodos: periodos,
        horario_especifico: horarioEspecifico || null
    };
    
    // Enviar para API
    salvarDisponibilidadeAPI(disponibilidade);
}

// Funções do calendário
function atualizarCalendarioConsultas(consultas) {
    // Implementação simplificada - em produção, atualizaria o calendário com as consultas
    console.log('Atualizando calendário com consultas:', consultas);
    
    // Adicionar indicadores de consulta nos dias correspondentes
    consultas.forEach(consulta => {
        const data = new Date(consulta.data);
        const dia = data.getDate();
        
        // Encontrar a célula do calendário correspondente ao dia
        const celulas = document.querySelectorAll('.calendar-day .day-number');
        celulas.forEach(celula => {
            if (parseInt(celula.textContent) === dia) {
                // Verificar se já existe um indicador
                const pai = celula.parentElement;
                if (!pai.querySelector('.appointment-indicator')) {
                    const indicador = document.createElement('div');
                    indicador.className = 'appointment-indicator';
                    pai.appendChild(indicador);
                }
            }
        });
    });
}

// Função para atualizar a lista de consultas na página "Minhas Consultas"
function atualizarListaConsultas(consultas) {
    const consultasContainer = document.querySelector('.consultas-dia');
    
    if (!consultasContainer) {
        console.error('Container de consultas não encontrado');
        return;
    }
    
    if (!consultas || consultas.length === 0) {
        consultasContainer.innerHTML = `
            <h3>Consultas do dia</h3>
            <p>Nenhuma consulta encontrada.</p>
        `;
        return;
    }
    
    let html = `
        <h3>Consultas Confirmadas</h3>
        <div class="consultas-lista">
    `;
    
    consultas.forEach(consulta => {
        const statusClass = getStatusClass(consulta.status);
        const dataAgendamento = consulta.data_agendamento || 'Não agendada';
        const pacienteNome = consulta.paciente_nome || 'N/A';
        
        html += `
            <div class="consulta-item ${statusClass}">
                <div class="consulta-header">
                    <h4>Consulta #${consulta.id}</h4>
                    <span class="status-badge ${statusClass}">${consulta.status}</span>
                </div>
                <div class="consulta-details">
                    <p><strong>Paciente:</strong> ${pacienteNome}</p>
                    <p><strong>Data de Solicitação:</strong> ${consulta.data_solicitacao || 'N/A'}</p>
                    <p><strong>Data de Agendamento:</strong> ${dataAgendamento}</p>
                    <p><strong>Observações:</strong> ${consulta.observacoes_paciente || 'Nenhuma'}</p>
                </div>
                <div class="consulta-actions">
                    ${getAcoesConsulta(consulta)}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    consultasContainer.innerHTML = html;
}

// Função para obter a classe CSS baseada no status da consulta
function getStatusClass(status) {
    switch(status) {
        case 'solicitado':
            return 'status-solicitado';
        case 'confirmado':
            return 'status-confirmado';
        case 'concluido':
            return 'status-concluido';
        case 'cancelado':
            return 'status-cancelado';
        default:
            return 'status-default';
    }
}

// Função para obter as ações disponíveis para cada consulta
function getAcoesConsulta(consulta) {
    switch(consulta.status) {
        case 'confirmado':
            return `
                <button class="btn btn-primary" onclick="finalizarConsulta(${consulta.id})">
                    Finalizar Consulta
                </button>
            `;
        case 'concluido':
            return '<span class="text-muted">Consulta Finalizada</span>';
        case 'solicitado':
            return '<span class="text-muted">Aguardando Confirmação</span>';
        default:
            return '<span class="text-muted">Nenhuma Ação</span>';
    }
}

// Função para finalizar uma consulta
async function finalizarConsulta(consultaId) {
    if (confirm('Deseja finalizar esta consulta?')) {
        try {
            const observacoes = prompt('Adicione observações sobre a consulta (opcional):') || '';
            
            const response = await fetch(`/api/estagiario/consultas/${consultaId}/concluir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    observacoes: observacoes
                })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarToast('Consulta finalizada com sucesso!', 'success');
                // Recarrega a lista de consultas
                await carregarConsultas();
            } else {
                throw new Error(data.error || 'Erro ao finalizar consulta');
            }
        } catch (error) {
            console.error('Erro ao finalizar consulta:', error);
            mostrarToast(error.message || 'Erro ao finalizar consulta', 'error');
        }
    }
}

function mesAnterior() {
    // Lógica para navegar para o mês anterior
    mostrarToast('Navegando para o mês anterior');
}

function mesSeguinte() {
    // Lógica para navegar para o mês seguinte
    mostrarToast('Navegando para o mês seguinte');
}

// Funções de modal
function abrirModalConfirmacaoTriagem(paciente, data, solicitacaoId) {
    const modal = document.getElementById('modal-confirmacao-triagem');
    const textoModal = document.getElementById('modal-confirmacao-texto');
    
    // Armazenar dados para uso na confirmação
    modal.dataset.paciente = paciente;
    modal.dataset.data = data;
    modal.dataset.solicitacaoId = solicitacaoId;
    
    textoModal.textContent = `Você está prestes a confirmar uma consulta de triagem para ${paciente}. Defina a data e horário da consulta abaixo:`;
    
    // Definir data mínima como hoje
    const hoje = new Date();
    const dataMinima = hoje.toISOString().split('T')[0];
    document.getElementById('data-consulta').min = dataMinima;
    
    // Limpar campos
    document.getElementById('data-consulta').value = '';
    document.getElementById('hora-consulta').value = '';
    document.getElementById('observacoes-consulta').value = '';
    
    modal.classList.add('active');
}

function confirmarTriagem() {
    const modal = document.getElementById('modal-confirmacao-triagem');
    const solicitacaoId = modal.dataset.solicitacaoId;
    
    if (!solicitacaoId) {
        mostrarToast('Erro: ID da solicitação não encontrado', 'error');
        return;
    }

    // Validar campos obrigatórios
    const dataConsulta = document.getElementById('data-consulta').value;
    const horaConsulta = document.getElementById('hora-consulta').value;
    const observacoes = document.getElementById('observacoes-consulta').value;

    if (!dataConsulta) {
        mostrarToast('Por favor, selecione a data da consulta', 'error');
        return;
    }

    if (!horaConsulta) {
        mostrarToast('Por favor, selecione o horário da consulta', 'error');
        return;
    }

    // Combinar data e hora no formato correto
    const dataAgendamento = `${dataConsulta}T${horaConsulta}`;

    confirmarTriagemAPI(solicitacaoId, dataAgendamento, observacoes);
}

function fecharModalConfirmacaoTriagem() {
    const modal = document.getElementById('modal-confirmacao-triagem');
    modal.classList.remove('active');
    document.body.classList.remove('modal-active');
}

function abrirModalSucessoDisponibilidade() {
    const modal = document.getElementById('modal-sucesso-disponibilidade');
    modal.classList.add('active');
}

function fecharModalSucessoDisponibilidade() {
    const modal = document.getElementById('modal-sucesso-disponibilidade');
    modal.classList.remove('active');
}

// Funções de toast
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Função de logout
async function logout() {
    try {
        mostrarToast('Deslogando do sistema...');
        const response = await fetch('/logout');
        if (response.ok) {
            window.location.href = '/login';
        } else {
            throw new Error('Erro ao fazer logout');
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        mostrarToast('Erro ao deslogar. Tente novamente.', 'error');
    }
}

// Função para carregar as solicitações de triagem
async function carregarSolicitacoes() {
    const solicitacoesList = document.querySelector('.solicitacoes-list');
    
    // Limpa completamente a lista antes de carregar
    solicitacoesList.innerHTML = '<div class="loading">Carregando solicitações...</div>';

    try {
        const response = await fetch('/api/estagiario/solicitacoes');
        if (!response.ok) {
            throw new Error('Erro ao carregar solicitações');
        }

        const solicitacoes = await response.json();

        // Limpa a lista novamente antes de adicionar as novas solicitações
        solicitacoesList.innerHTML = '';

        if (solicitacoes.length === 0) {
            solicitacoesList.innerHTML = `
                <div class="info-message">
                    <p>Nenhuma solicitação de triagem pendente no momento.</p>
                </div>
            `;
            return;
        }

        // Cria um Set para rastrear IDs já processados
        const idsProcessados = new Set();
        
        solicitacoes.forEach(solicitacao => {
            // Verifica se este ID já foi processado
            if (idsProcessados.has(solicitacao.id)) {
                return;
            }
            idsProcessados.add(solicitacao.id);

            const solicitacaoElement = document.createElement('div');
            solicitacaoElement.className = 'solicitacao-item';
            solicitacaoElement.id = `solicitacao-${solicitacao.id}`;
            solicitacaoElement.innerHTML = `
                <div class="solicitacao-header">
                    <div class="solicitacao-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                    </div>
                    <div class="solicitacao-info">
                        <h3>${solicitacao.paciente_nome}</h3>
                        <div class="solicitacao-details">
                            <p><strong>Solicitado em:</strong> ${solicitacao.data_solicitacao}</p>
                            <p><strong>Observações:</strong> ${solicitacao.observacoes_paciente || 'Nenhuma observação'}</p>
                        </div>
                    </div>
                </div>
                <div class="solicitacao-status">
                    <div class="status-badge pendente">Pendente</div>
                    <div class="solicitacao-actions">
                        <button class="btn btn-primary" onclick="abrirModalConfirmacaoTriagem('${solicitacao.paciente_nome}', '${solicitacao.data_solicitacao}', '${solicitacao.id}')">
                            Confirmar Triagem
                        </button>
                    </div>
                </div>
            `;
            solicitacoesList.appendChild(solicitacaoElement);
        });

    } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        solicitacoesList.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar solicitações. Por favor, tente novamente.</p>
            </div>
        `;
    }
}

// Funções da página Minha Conta
async function atualizarDadosContato() {
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/api/estagiario/dados', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telefone: telefone,
                email: email
            })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarToast('Dados atualizados com sucesso!');
        } else {
            throw new Error(data.error || 'Erro ao atualizar dados');
        }
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        mostrarToast(error.message, 'error');
    }
}

async function alterarSenha() {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        mostrarToast('Por favor, preencha todos os campos', 'error');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarToast('As senhas não coincidem', 'error');
        return;
    }

    if (novaSenha.length < 8 || novaSenha.length > 20) {
        mostrarToast('A senha deve ter entre 8 e 20 caracteres', 'error');
        return;
    }

    try {
        const response = await fetch('/api/estagiario/senha', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha_atual: senhaAtual,
                nova_senha: novaSenha
            })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarToast('Senha alterada com sucesso!');
            // Limpar os campos
            document.getElementById('senha-atual').value = '';
            document.getElementById('nova-senha').value = '';
            document.getElementById('confirmar-senha').value = '';
        } else {
            throw new Error(data.error || 'Erro ao alterar senha');
        }
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        mostrarToast(error.message, 'error');
    }
}

// Funções para a página de prontuários
let searchTimeout;

function buscarPaciente() {
    const searchInput = document.querySelector('.search-input');
    const prontuariosList = document.querySelector('.prontuarios-list');
    
    if (!searchInput || !prontuariosList) {
        console.error('Elementos de busca não encontrados');
        return;
    }
    
    // Limpa o timeout anterior se existir
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Aguarda 500ms após o usuário parar de digitar
    searchTimeout = setTimeout(async () => {
        const nome = searchInput.value.trim();
        
        // Mostra mensagem informativa para busca mínima
        if (nome.length === 0) {
            prontuariosList.innerHTML = '<div class="info-message">Digite o nome do paciente para buscar.</div>';
            return;
        }
        
        if (nome.length < 3) {
            prontuariosList.innerHTML = '<div class="info-message">Digite pelo menos 3 caracteres para buscar.</div>';
            return;
        }
        
        try {
            // Mostra loading enquanto busca
            prontuariosList.innerHTML = '<div class="loading">Buscando pacientes...</div>';
            
            const response = await fetch(`/api/estagiario/buscar-paciente?nome=${encodeURIComponent(nome)}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data || !Array.isArray(data)) {
                throw new Error('Resposta inválida da API');
            }
            
            if (data.length === 0) {
                prontuariosList.innerHTML = '<div class="info-message">Nenhum paciente encontrado.</div>';
                return;
            }
            
            // Exibe os resultados com tratamento seguro para dados ausentes
            prontuariosList.innerHTML = data.map(paciente => {
                // Validação segura dos dados do paciente
                const nomePaciente = paciente.nome || 'Nome não informado';
                const emailPaciente = paciente.email || 'Email não informado';
                const telefonePaciente = paciente.telefone || 'Telefone não informado';
                const consultas = Array.isArray(paciente.consultas) ? paciente.consultas : [];

                return `
                    <div class="prontuario-item">
                        <div class="prontuario-info">
                            <h3>${nomePaciente}</h3>
                            <p><strong>Email:</strong> ${emailPaciente}</p>
                            <p><strong>Telefone:</strong> ${telefonePaciente}</p>
                            ${consultas.length > 0 ? `
                                <div class="consultas-previas">
                                    <h4>Consultas Anteriores:</h4>
                                    ${consultas.map(consulta => {
                                        const dataConsulta = consulta.data || 'Data não informada';
                                        const observacoesConsulta = consulta.observacoes || 'Sem observações';
                                        return `
                                            <div class="consulta-previa">
                                                <p><strong>Data:</strong> ${dataConsulta}</p>
                                                <p><strong>Observações:</strong> ${observacoesConsulta}</p>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : '<p class="no-consultas">Nenhuma consulta anterior registrada.</p>'}
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
            prontuariosList.innerHTML = `
                <div class="error-message">
                    <p>Erro ao buscar pacientes: ${error.message}</p>
                    <button class="btn btn-secondary" onclick="buscarPaciente()">Tentar Novamente</button>
                </div>
            `;
        }
    }, 500);
}

// Função para abrir o modal de finalização de consulta
function abrirModalFinalizarConsulta(consultaId) {
    document.getElementById('modal-finalizar-consulta').style.display = 'flex';
}

function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length >= 1) {
        valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    }
    if (valor.length > 10) {
        valor = valor.slice(0, 10) + "-" + valor.slice(10);
    }
    input.value = valor;
}

// Função para fechar o modal de finalização de consulta
function fecharModalFinalizarConsulta() {
    document.getElementById('modal-finalizar-consulta').style.display = 'none';
}

// Função para confirmar a finalização da consulta
function confirmarFinalizacaoConsulta() {
    const observacoes = document.querySelector('#modal-finalizar-consulta textarea').value;
    const proximaConsulta = document.querySelector('#modal-finalizar-consulta select').value;

    // Aqui você pode adicionar a lógica para enviar os dados para o backend
    // Por exemplo:
    // fetch('/api/finalizar-consulta', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         observacoes,
    //         proximaConsulta
    //     })
    // });

    // Mostrar mensagem de sucesso
    mostrarToast('Consulta finalizada com sucesso!');
    
    // Fechar o modal
    fecharModalFinalizarConsulta();
    
    // Atualizar a lista de consultas
    // atualizarListaConsultas();
}

// Variável para armazenar o tipo de exclusão
let tipoExclusao = '';

// Função para confirmar exclusão de agendamentos
function confirmarExclusaoAgendamentos() {
    tipoExclusao = 'agendamentos';
    document.getElementById('modal-exclusao-texto').textContent = 
        'Tem certeza que deseja excluir todos os agendamentos?';
    document.getElementById('modal-confirmacao-exclusao').style.display = 'flex';
}

// Função para confirmar exclusão de disponibilidade
function confirmarExclusaoDisponibilidade() {
    tipoExclusao = 'disponibilidade';
    document.getElementById('modal-exclusao-texto').textContent = 
        'Tem certeza que deseja excluir todas as disponibilidades?';
    document.getElementById('modal-confirmacao-exclusao').style.display = 'flex';
}

// Função para fechar o modal de exclusão
function fecharModalExclusao() {
    document.getElementById('modal-confirmacao-exclusao').style.display = 'none';
}

// Função para confirmar a exclusão
function confirmarExclusao() {
    // Aqui você pode adicionar a lógica para enviar a requisição ao backend
    // Por exemplo:
    // fetch(`/api/excluir-${tipoExclusao}`, {
    //     method: 'DELETE'
    // });
    // Mostrar mensagem de sucesso
    mostrarToast(`${tipoExclusao === 'agendamentos' ? 'Agendamentos' : 'Disponibilidades'} excluídos com sucesso!`);
    
    // Fechar o modal
    fecharModalExclusao();
}
