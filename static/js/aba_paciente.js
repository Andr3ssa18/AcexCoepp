// aba_paciente.js - VERSÃO INTEGRADA E SIMPLIFICADA
console.log("DEBUG: aba_paciente.js CARREGADO E SENDO INTERPRETADO");

// --- Elementos Comuns (Cache de DOM para performance) ---
const elements = {
    pages: document.querySelectorAll('.page'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    toastNotification: document.getElementById('toast-notification'),
    loadingSpinner: document.getElementById('loading-spinner'),
    
    // Modais
    modalDetalhesConsulta: document.getElementById('modal-detalhes-consulta'),
    modalTriagem: document.getElementById('modal-triagem'),
    modalConfirmarPresenca: document.getElementById('modal-confirmar-presenca'),
    modalConfirmarCancelamento: document.getElementById('modal-confirmar-cancelamento'),

    // Página Horários Triagem
    selectDiaSemana: document.getElementById('select-dia-semana'),
    selectPeriodo: document.getElementById('select-periodo'),
    timeSlotsGrid: document.getElementById('time-slots-grid'),
    scheduleSummary: document.getElementById('schedule-summary'),
    selectedWeekdayDisplay: document.getElementById('selected-weekday-display'),
    selectedPeriodDisplay: document.getElementById('selected-period-display'),
    selectedTimeDisplay: document.getElementById('selected-time-display'),
    triagemInfoConfirmacao: document.getElementById('triagem-info-confirmacao'),
    confirmSelectionButton: document.getElementById('confirm-selection-button'),

    // Página Minhas Consultas
    containerMeusAgendamentos: document.getElementById('container-meus-agendamentos'),
    noAppointmentsMessage: document.getElementById('no-appointments-message'),
    detalhesConsultaConteudo: document.getElementById('detalhes-consulta-conteudo'),
    btnConfirmarPresencaModal: document.getElementById('btn-confirmar-presenca-modal'),
    btnConfirmarCancelamentoFinal: document.getElementById('btn-confirmar-cancelamento-final'),

    // Página Consulta Confirmada
    consultaConfirmadaData: document.getElementById('consulta-confirmada-data'),
    consultaConfirmadaHorario: document.getElementById('consulta-confirmada-horario'),
    consultaConfirmadaLocal: document.getElementById('consulta-confirmada-local'),
    consultaConfirmadaQrcode: document.getElementById('consulta-confirmada-qrcode'),

    // Campos Minha Conta
    inputsMeusDados: document.querySelectorAll('#sub-aba-meus-dados input, #sub-aba-meus-dados select'),
    notifEmail: document.getElementById('notif-email'),
    notifSms: document.getElementById('notif-sms'),
    notifApp: document.getElementById('notif-app'),
    notifOfertas: document.getElementById('notif-ofertas'),
    senhaAtualInput: document.getElementById('senha-atual'),
    novaSenhaInput: document.getElementById('nova-senha'),
    confirmarNovaSenhaInput: document.getElementById('confirmar-nova-senha'),
    errorSenhaAtual: document.getElementById('error-senha-atual'),
    errorNovaSenha: document.getElementById('error-nova-senha'),
    errorConfirmarNovaSenha: document.getElementById('error-confirmar-nova-senha'),

    // Página Não Posso Comparecer
    motivoNaoPosso: document.getElementById('motivo-nao-posso'),
};

// --- Estado Global (para dados temporários e gerenciamento de modais/ações) ---
const appState = {
    currentActivePage: 'pagina-principal',
    selectedTriagem: {
        diaSemana: null,
        periodo: null,
        horario: null
    },
    botaoHorarioAtivo: null, // Referência ao botão de horário selecionado
    consultaEmContexto: null, // Variável para armazenar a consulta em ação (confirmar, cancelar, etc.)
    
    preferenciasNotificacao: {
        email: true,
        sms: false,
        app: true,
        ofertas: false
    },

    // Seus dados de horários por período, agora dentro de appState
    horariosPorPeriodo: {
        'Manhã': ["08:00", "09:00", "10:00", "11:00"],
        'Tarde': ["13:00", "14:00", "15:00", "16:00"],
        'Noite': ["18:00", "19:00", "20:00", "21:00"]
    }
};

// --- Funções Utilitárias ---

function showToast(message, type = 'success') {
    const toast = elements.toastNotification;
    toast.textContent = message;
    toast.className = 'toast'; // Remove classes anteriores
    toast.classList.add('show');
    toast.classList.add(type);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showSpinner() {
    elements.loadingSpinner.classList.add('active');
}

function hideSpinner() {
    elements.loadingSpinner.classList.remove('active');
}

function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    // Garante que a data está no formato YYYY-MM-DD
    const parts = dataString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dataString; // Retorna original se não for YYYY-MM-DD
}

function calcularHoraFim(horaInicio) {
    if (!horaInicio) return '';
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const data = new Date(); // Data arbitrária para cálculo
    data.setHours(horas, minutos, 0, 0);
    data.setHours(data.getHours() + 1); // Adiciona 1 hora
    return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

// --- Funções de Navegação e Modais ---

function goToPage(pageId) {
    elements.pages.forEach(p => p.classList.remove('active'));
    const paginaAtiva = document.getElementById(pageId);
    if (paginaAtiva) {
        paginaAtiva.classList.add('active');
        appState.currentActivePage = pageId; // Atualiza o estado da página ativa
    }

    // Fecha todos os modais ao mudar de página
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.classList.remove('modal-active'); // Garante que o corpo não tem a classe modal-active

    // Ações específicas ao mudar de página
    if (pageId === 'pagina-consultas') {
        atualizarListaConsultas();
    } else if (pageId === 'pagina-horarios-triagem') {
        resetTriagemSelection(); // Reseta os campos da triagem
        updateAvailableTimes(); // Garante que os horários são carregados ao entrar na página
    } else if (pageId === 'pagina-meus-dados') {
        // Assegura que a primeira sub-aba 'Meus Dados' está ativa ao entrar na página
        // E carrega as preferências de notificação
        showSubTab('sub-aba-meus-dados', document.querySelector('.tab-button.active') || document.querySelector('.tab-button'));
        carregarPreferenciasNotificacao();
    }
}

function toggleDropdown() {
    elements.dropdownMenu.classList.toggle("show");
}

function showSubTab(subTabId, buttonElement) {
    document.querySelectorAll('.sub-tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(subTabId).classList.add('active');

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

function openModal(modalElement) {
    modalElement.classList.add('active');
    document.body.classList.add('modal-active'); // Adiciona a classe ao body para evitar scroll
}

// --- Funções da Página "Minha Conta" ---

function enableEditMode() {
    elements.inputsMeusDados.forEach(input => {
        // Mantém disabled para campos que não devem ser editáveis pelo paciente (Nome Completo, Data Nasc, CPF)
        if (input.id !== 'nome-completo' && input.id !== 'data-nascimento' && input.id !== 'cpf') {
            input.disabled = false;
        }
    });
    showToast("Campos habilitados para edição.", "info");
}

function saveAccountData() {
    showSpinner();

    // Coleta os dados dos campos editáveis
    const formData = new FormData();
    formData.append('genero', document.getElementById('genero').value);
    formData.append('telefone', document.getElementById('telefone').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('endereco', document.getElementById('endereco').value); // O endereço já está combinado

    fetch('/atualizar_dados_paciente', {
        method: 'POST',
        body: new URLSearchParams(formData) // Envia como form-urlencoded
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast(data.message, 'success');
            // Desabilita os campos novamente após o sucesso
            elements.inputsMeusDados.forEach(input => {
                if (input.id !== 'nome-completo' && input.id !== 'data-nascimento' && input.id !== 'cpf') {
                    input.disabled = true;
                }
            });
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erro ao salvar dados:', error);
        showToast('Ocorreu um erro de comunicação. Tente novamente.', 'error');
    })
    .finally(() => {
        hideSpinner();
    });
}

function carregarPreferenciasNotificacao() {
    elements.notifEmail.checked = appState.preferenciasNotificacao.email;
    elements.notifSms.checked = appState.preferenciasNotificacao.sms;
    elements.notifApp.checked = appState.preferenciasNotificacao.app;
    elements.notifOfertas.checked = appState.preferenciasNotificacao.ofertas;
}

function saveNotificationPreferences() {
    showSpinner();
    setTimeout(() => {
        hideSpinner();
        appState.preferenciasNotificacao.email = elements.notifEmail.checked;
        appState.preferenciasNotificacao.sms = elements.notifSms.checked;
        appState.preferenciasNotificacao.app = elements.notifApp.checked;
        appState.preferenciasNotificacao.ofertas = elements.notifOfertas.checked;
        showToast("Preferências de notificação salvas (simulado)!", "success");
    }, 800);
}

function changePassword() {
    const senhaAtual = elements.senhaAtualInput.value;
    const novaSenha = elements.novaSenhaInput.value;
    const confirmarNovaSenha = elements.confirmarNovaSenhaInput.value;

    elements.errorSenhaAtual.textContent = '';
    elements.errorNovaSenha.textContent = '';
    elements.errorConfirmarNovaSenha.textContent = '';

    let hasError = false;

    if (!senhaAtual) {
        elements.errorSenhaAtual.textContent = 'Digite sua senha atual.';
        hasError = true;
    }
    if (!novaSenha) {
        elements.errorNovaSenha.textContent = 'Digite sua nova senha.';
        hasError = true;
    } else if (novaSenha.length < 6) {
        elements.errorNovaSenha.textContent = 'A nova senha deve ter no mínimo 6 caracteres.';
        hasError = true;
    }
    if (novaSenha !== confirmarNovaSenha) {
        elements.errorConfirmarNovaSenha.textContent = 'As senhas não coincidem.';
        hasError = true;
    }

    if (hasError) {
        showToast("Por favor, corrija os erros no formulário.", "error");
        return;
    }

    showSpinner();
    setTimeout(() => {
        hideSpinner();
        showToast("Senha alterada (simulado)!", "success");
        elements.senhaAtualInput.value = '';
        elements.novaSenhaInput.value = '';
        elements.confirmarNovaSenhaInput.value = '';
    }, 800);
}

// --- Funções da Página "Horários de Triagem" ---

function updateAvailableTimes() {
    const diaSemana = elements.selectDiaSemana.value;
    const periodo = elements.selectPeriodo.value;
    elements.timeSlotsGrid.innerHTML = '';
    
    // Limpa mensagens de erro e resumo ao mudar a seleção
    document.getElementById('error-dia-semana').textContent = '';
    document.getElementById('error-periodo').textContent = '';
    document.getElementById('error-horario-especifico').textContent = '';
    
    appState.selectedTriagem.horario = null; // Reseta o horário selecionado da triagem
    elements.scheduleSummary.style.display = 'none';

    if (appState.botaoHorarioAtivo) {
        appState.botaoHorarioAtivo.classList.remove('selected');
        appState.botaoHorarioAtivo = null;
    }

    if (diaSemana && periodo) {
        const horariosDoPeriodo = appState.horariosPorPeriodo[periodo] || [];
        if (horariosDoPeriodo.length > 0) {
            horariosDoPeriodo.forEach(horario => {
                const button = document.createElement('button');
                button.classList.add('time-slot-button');
                button.textContent = `${horario} - ${calcularHoraFim(horario)}`;
                button.dataset.time = horario; // Guarda o horário no dataset
                button.addEventListener('click', () => selectTriagemTime(button));
                elements.timeSlotsGrid.appendChild(button);
            });
        } else {
            elements.timeSlotsGrid.innerHTML = '<p class="no-available-slots">Nenhum horário disponível para o período selecionado.</p>';
        }
    } else {
        elements.timeSlotsGrid.innerHTML = '<p class="no-available-slots">Selecione o dia da semana e o período para ver os horários.</p>';
    }
}

function selectTriagemTime(button) {
    if (appState.botaoHorarioAtivo) {
        appState.botaoHorarioAtivo.classList.remove('selected');
    }
    button.classList.add('selected');
    appState.botaoHorarioAtivo = button;

    appState.selectedTriagem.diaSemana = elements.selectDiaSemana.value;
    appState.selectedTriagem.periodo = elements.selectPeriodo.value;
    appState.selectedTriagem.horario = button.dataset.time; // Pega do dataset do botão

    elements.selectedWeekdayDisplay.textContent = appState.selectedTriagem.diaSemana;
    elements.selectedPeriodDisplay.textContent = appState.selectedTriagem.periodo;
    elements.selectedTimeDisplay.textContent = `${appState.selectedTriagem.horario} - ${calcularHoraFim(appState.selectedTriagem.horario)}`;
    elements.scheduleSummary.style.display = 'block';

    document.getElementById('error-horario-especifico').textContent = '';
}

function validateAndOpenTriagemModal() {
    let hasError = false;
    if (!appState.selectedTriagem.diaSemana) {
        document.getElementById('error-dia-semana').textContent = 'Selecione o dia da semana.';
        hasError = true;
    }
    if (!appState.selectedTriagem.periodo) {
        document.getElementById('error-periodo').textContent = 'Selecione o período.';
        hasError = true;
    }
    if (!appState.selectedTriagem.horario) {
        document.getElementById('error-horario-especifico').textContent = 'Selecione um horário específico.';
        hasError = true;
    }

    if (hasError) {
        showToast("Por favor, preencha todos os campos obrigatórios.", "error");
        return;
    }

    elements.triagemInfoConfirmacao.textContent = `${appState.selectedTriagem.diaSemana} - ${appState.selectedTriagem.periodo} às ${appState.selectedTriagem.horario}`;
    openModal(elements.modalTriagem);
}

async function confirmTriagemRequest() {
    // Desabilita o botão para evitar múltiplos cliques
    const confirmButton = document.getElementById('btn-confirmar-envio-triagem');
    if (!confirmButton) {
        console.error('Botão de confirmação não encontrado');
        return;
    }

    if (confirmButton.disabled) {
        return; // Evita múltiplas chamadas simultâneas
    }
    
    confirmButton.disabled = true;
    confirmButton.textContent = 'Enviando...';

    closeModal(elements.modalTriagem);
    showSpinner();

    const { diaSemana, periodo, horario } = appState.selectedTriagem;
    if (!diaSemana || !periodo || !horario) {
        showToast('Por favor, selecione todos os campos necessários.', 'error');
        confirmButton.disabled = false;
        confirmButton.textContent = 'CONFIRMAR';
        hideSpinner();
        return;
    }

    const observacoes = `Paciente solicitou atendimento na ${diaSemana}, no período da ${periodo}, por volta das ${horario}.`;

    try {
        const response = await fetch('/api/agendamentos/solicitar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ observacoes }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ocorreu um erro ao enviar a solicitação.');
        }

        // Se chegou aqui, a solicitação foi bem-sucedida
        showToast('Solicitação de triagem enviada com sucesso!', 'success');
        resetTriagemSelection();
        goToPage('pagina-triagem-sucesso');
    } catch (error) {
        console.error('Erro ao solicitar triagem:', error);
        showToast(error.message || 'Erro de comunicação com o servidor. Tente novamente.', 'error');
    } finally {
        hideSpinner();
        // Reabilita o botão independentemente do resultado
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'CONFIRMAR';
        }
    }
}

// Função para resetar a seleção de triagem
function resetTriagemSelection() {
    appState.selectedTriagem = {
        diaSemana: null,
        periodo: null,
        horario: null
    };

    // Resetar os selects
    const selectDiaSemana = document.getElementById('select-dia-semana');
    const selectPeriodo = document.getElementById('select-periodo');
    if (selectDiaSemana) selectDiaSemana.value = '';
    if (selectPeriodo) selectPeriodo.value = '';

    // Limpar a grade de horários
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    if (timeSlotsGrid) timeSlotsGrid.innerHTML = '';

    // Esconder o resumo
    const scheduleSummary = document.getElementById('schedule-summary');
    if (scheduleSummary) scheduleSummary.style.display = 'none';

    // Limpar mensagens de erro
    const errorElements = [
        'error-dia-semana',
        'error-periodo',
        'error-horario-especifico'
    ];
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '';
    });
}

// --- Funções da Página "Minhas Consultas" ---

// Função para comparar datas e horários de consultas para ordenação
function compareAppointments(a, b) {
    const dataA = a.data_agendamento ? new Date(a.data_agendamento) : (a.data_solicitacao ? new Date(a.data_solicitacao) : null);
    const dataB = b.data_agendamento ? new Date(b.data_agendamento) : (b.data_solicitacao ? new Date(b.data_solicitacao) : null);

    // Priorizar agendamentos com data_agendamento
    if (a.data_agendamento && !b.data_agendamento) return -1;
    if (!a.data_agendamento && b.data_agendamento) return 1;

    // Se ambos têm ou não têm data_agendamento, ordenar pela data (agendamento ou solicitação)
    if (dataA && dataB) {
        return dataB - dataA; // Mais recentes primeiro
    } else if (dataA) {
        return -1; // A com data vem antes
    } else if (dataB) {
        return 1;  // B com data vem antes
    }
    return 0;
}

async function atualizarListaConsultas() {
    elements.containerMeusAgendamentos.innerHTML = '';
    elements.noAppointmentsMessage.style.display = 'none';
    showSpinner();

    try {
        const response = await fetch('/api/agendamentos/paciente');
        let agendamentos = await response.json();

        if (!response.ok) {
            throw new Error(agendamentos.error || 'Falha ao buscar agendamentos.');
        }

        if (agendamentos.length === 0) {
            elements.noAppointmentsMessage.style.display = 'block';
            elements.containerMeusAgendamentos.style.display = 'none';
            return;
        }

        elements.containerMeusAgendamentos.style.display = 'grid';
        agendamentos.sort(compareAppointments);

        // Filtra apenas as solicitações de triagem não concluídas e consultas ativas
        const consultasFiltradas = agendamentos.filter(ag => {
            // Mantém apenas solicitações de triagem não concluídas
            if (ag.tipo_atendimento === 'Solicitação de Triagem') {
                return ag.status === 'solicitado';
            }
            // Mantém apenas consultas ativas
            if (ag.tipo_atendimento === 'Consulta') {
                return ['confirmado', 'agendado'].includes(ag.status);
            }
            return false;
        });

        if (consultasFiltradas.length === 0) {
            elements.noAppointmentsMessage.textContent = 'Nenhuma consulta ou solicitação ativa encontrada.';
            elements.noAppointmentsMessage.style.display = 'block';
            elements.containerMeusAgendamentos.style.display = 'none';
            return;
        }

        consultasFiltradas.forEach(agendamento => {
            const card = document.createElement('div');
            card.className = 'card';
            card.id = `agendamento-${agendamento.id}`;

            const cardInfo = document.createElement('div');
            cardInfo.className = 'card-info';
            const tituloAgendamento = document.createElement('h3');
            const detalhesAgendamento = document.createElement('p');

            if (agendamento.tipo_atendimento === 'Solicitação de Triagem') {
                tituloAgendamento.textContent = `Solicitação de Triagem`;
                const dataSolicitacao = new Date(agendamento.data_solicitacao);
                detalhesAgendamento.textContent = `Enviada em: ${dataSolicitacao.toLocaleDateString('pt-BR')} às ${dataSolicitacao.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
            } else {
                tituloAgendamento.textContent = `Consulta Agendada`;
                const dataAg = new Date(agendamento.data_agendamento);
                detalhesAgendamento.innerHTML = `
                    Data: ${dataAg.toLocaleDateString('pt-BR')} às ${dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<br>
                    Estagiário(a): ${agendamento.estagiario_nome || 'A definir'}
                `;
            }

            cardInfo.appendChild(tituloAgendamento);
            cardInfo.appendChild(detalhesAgendamento);

            const cardActions = document.createElement('div');
            cardActions.className = 'card-actions';
            
            const statusBadge = document.createElement('div');
            statusBadge.className = `status-badge ${agendamento.status.replace('_', '-')}`;
            statusBadge.textContent = agendamento.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            cardActions.appendChild(statusBadge);

            const botaoDetalhes = document.createElement('button');
            botaoDetalhes.className = 'btn btn-outline';
            botaoDetalhes.textContent = 'Ver Detalhes';
            botaoDetalhes.onclick = () => viewAppointmentDetails(agendamento);
            cardActions.appendChild(botaoDetalhes);

            card.appendChild(cardInfo);
            card.appendChild(cardActions);
            elements.containerMeusAgendamentos.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        showToast('Erro ao carregar agendamentos. Tente novamente.', 'error');
    } finally {
        hideSpinner();
    }
}

function viewAppointmentDetails(consulta) {
    console.log("[viewAppointmentDetails] Iniciada com consulta:", consulta ? JSON.parse(JSON.stringify(consulta)) : consulta);
    appState.consultaEmContexto = consulta; // Define a consulta em contexto
    const conteudo = elements.detalhesConsultaConteudo;

    let dataExibicao = "A definir";
    let horarioExibicao = "A definir";

    if (consulta.data_agendamento) {
        const dataAg = new Date(consulta.data_agendamento);
        dataExibicao = dataAg.toLocaleDateString('pt-BR');
        horarioExibicao = dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (consulta.tipo_atendimento === 'Solicitação de Triagem' && consulta.data_solicitacao) {
        const dataSol = new Date(consulta.data_solicitacao);
        dataExibicao = `Solicitado em ${dataSol.toLocaleDateString('pt-BR')}`;
        horarioExibicao = dataSol.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    conteudo.innerHTML = `
        <p><strong>Tipo:</strong> ${consulta.tipo_atendimento}</p>
        <p><strong>Estagiário/a:</strong> ${consulta.estagiario_nome || (consulta.tipo_atendimento === 'Solicitação de Triagem' ? 'Aguardando atribuição' : 'Não definido')}</p>
        <p><strong>Data:</strong> ${dataExibicao}</p>
        <p><strong>Horário:</strong> ${horarioExibicao}</p>
        <p><strong>Local:</strong> COEPP - Fundação Santo André (Sala a ser definida)</p>
        <p><strong>Status:</strong> <span class="status-text ${consulta.status.replace('_', '-')}">${consulta.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></p>
    `;

    // Adicionar botões de ação condicionalmente
    if (consulta.status !== 'cancelado_paciente' && consulta.status !== 'cancelado_estagiario' && consulta.status !== 'finalizado') {
        conteudo.innerHTML += `
                <h3 style="margin-top: 20px;">Ações</h3>
                <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: center;">
                    <button class="action-button danger" id="btn-detalhes-cancelar-${consulta.id}">Cancelar Agendamento</button>
                    ${consulta.data_agendamento ? '<button class="action-button warning" disabled>Reagendar (Em breve)</button>' : ''}
                </div>`;
        
        // Adiciona o event listener dinamicamente para garantir que 'consulta' seja o objeto correto.
        // Usar setTimeout para garantir que o elemento está no DOM antes de adicionar o listener.
        setTimeout(() => {
            const cancelButton = document.getElementById(`btn-detalhes-cancelar-${consulta.id}`);
            if (cancelButton) {
                console.log(`[viewAppointmentDetails] Botão #btn-detalhes-cancelar-${consulta.id} ENCONTRADO. Adicionando onclick.`);
                cancelButton.onclick = () => {
                    console.log(`[viewAppointmentDetails] Botão #btn-detalhes-cancelar-${consulta.id} CLICADO. Chamando openCancelAppointmentModal com:`, consulta ? JSON.parse(JSON.stringify(consulta)) : consulta);
                    openCancelAppointmentModal(consulta); 
                };
            } else {
                console.error(`[viewAppointmentDetails] ERRO: Botão #btn-detalhes-cancelar-${consulta.id} NÃO encontrado no DOM.`);
            }
        }, 0);
    }
    openModal(elements.modalDetalhesConsulta);
}

async function cancelAppointment() {
    if (!appState.consultaEmContexto) {
        showToast('Erro: Nenhuma consulta selecionada.', 'error');
        return;
    }

    showSpinner();
    try {
        const response = await fetch(`/api/agendamentos/${appState.consultaEmContexto.id}/cancelar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast(data.message, 'success');
            closeModal(elements.modalConfirmarCancelamento);
            await atualizarListaConsultas(); // Atualiza a lista após o cancelamento
            goToPage('pagina-consultas');
        } else {
            showToast(data.error || 'Erro ao cancelar a consulta.', 'error');
        }
    } catch (error) {
        console.error('Erro ao cancelar consulta:', error);
        showToast('Erro de comunicação com o servidor. Tente novamente.', 'error');
    } finally {
        hideSpinner();
    }
}

function openCancelAppointmentModal(consulta) {
    if (!consulta) {
        showToast('Erro: Nenhuma consulta selecionada.', 'error');
        return;
    }
    appState.consultaEmContexto = consulta;
    openModal(elements.modalConfirmarCancelamento);
}

function showCannotAttendPage(consulta) { // Renomeada de 'mostrarPaginaNaoPosso'
    appState.consultaEmContexto = consulta;
    goToPage('pagina-nao-posso-comparecer');
}

function closeCannotAttendPage() { // Renomeada de 'fecharNaoPosso'
    goToPage('pagina-consultas');
    elements.motivoNaoPosso.value = ''; // Limpa o campo de texto
    appState.consultaEmContexto = null;
}

function sendCannotAttendReasonAndCancel() { // Renomeada de 'enviarNaoPosso'
    if (!appState.consultaEmContexto) {
        showToast('Erro: Nenhuma consulta selecionada.');
        return;
    }
    
    const motivo = elements.motivoNaoPosso.value;
    if (!motivo.trim()) {
        showToast('Por favor, informe o motivo da sua ausência.', "error");
        return;
    }
    
    showSpinner();
    setTimeout(() => {
        hideSpinner();
        // No lugar de alterar o estado local, chamamos a função de cancelamento que interage com o backend
        // e depois atualiza a lista.
        // A lógica de "motivo" pode ser adicionada ao corpo da requisição de cancelamento se necessário.
        // Por ora, vamos apenas cancelar.
        if (appState.consultaEmContexto) {
            cancelAppointment(); // Reutiliza a função de cancelamento
            goToPage('pagina-consultas');
            elements.motivoNaoPosso.value = ''; // Limpa o campo
            appState.consultaEmContexto = null;
            showToast('Solicitação de cancelamento enviada.', "success");
        } else {
            showToast('Erro ao cancelar consulta.', "error");
        }
    }, 1500);
}

// Função para gerar o QR Code
function generateQRCode() { // Renomeada de 'gerarQRCode'
    const qrCodeContainer = elements.consultaConfirmadaQrcode;
    
    // Limpa o conteúdo anterior
    qrCodeContainer.innerHTML = '';
    
    const qrCodeImg = document.createElement('img');
    
     const consultaInfo = appState.consultaEmContexto ? {
         paciente: document.getElementById('nome-completo') ? document.getElementById('nome-completo').value : "Paciente",
         data: appState.consultaEmContexto.data_agendamento ? new Date(appState.consultaEmContexto.data_agendamento).toLocaleDateString('pt-BR') : 'A Definir',
         hora: appState.consultaEmContexto.data_agendamento ? new Date(appState.consultaEmContexto.data_agendamento).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : 'A Definir',
         local: 'COEPP - Fundação Santo André',  // Local fixo por enquanto
         tipo: appState.consultaEmContexto.tipo_atendimento,
         estagiario: appState.consultaEmContexto.estagiario_nome || "A definir",
         id: appState.consultaEmContexto.id
     } : {
         // Dados mínimos para um QR code válido, mesmo sem consulta
         paciente: document.getElementById('nome-completo') ? document.getElementById('nome-completo').value : "Paciente",
         data: 'A Definir',
         hora: 'A Definir',
         local: 'COEPP - Fundação Santo André',
         tipo: 'Solicitação de Triagem',
         estagiario: 'A Definir',
         id: 'Sem agendamento'
     };
    
    const qrData = JSON.stringify(consultaInfo);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    qrCodeImg.src = qrCodeUrl;
    qrCodeImg.alt = "QR Code da consulta";
    qrCodeImg.style.width = "100%";
    qrCodeImg.style.height = "100%";
    
    qrCodeContainer.appendChild(qrCodeImg);
}

// Função para baixar o QR Code
function downloadQRCode() { // Renomeada de 'baixarQRCode'
    const qrCodeImg = elements.consultaConfirmadaQrcode.querySelector('img');
    
    if (!qrCodeImg) {
        showToast('Erro: QR Code não encontrado.', "error");
        return;
    }
    
    const downloadLink = document.createElement('a');
    
    const dataFormatada = elements.consultaConfirmadaData.textContent.replace(/\//g, '-');
    const horario = elements.consultaConfirmadaHorario.textContent.replace('h', '-');
    const fileName = `consulta_${dataFormatada}_${horario}.png`;
    
    downloadLink.href = qrCodeImg.src;
    downloadLink.download = fileName;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showToast('QR Code baixado com sucesso!', "success");
}

// --- Event Listeners (Melhor prática para separar HTML e JS) ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded disparado!");
    goToPage('pagina-principal'); // Inicia na página principal

    // Eventos do Header
    const profileElement = document.querySelector('.profile');
    if (profileElement) {
        profileElement.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique se propague para o window
            toggleDropdown();
        });
    }

    // Adiciona evento de clique para os itens do menu
    if (elements.dropdownMenu) {
        elements.dropdownMenu.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.dataset.page) {
                event.preventDefault(); // Previne o comportamento padrão do link
                goToPage(link.dataset.page);
                toggleDropdown(); // Fecha o menu após o clique
            }
        });
    }

    // Fecha o dropdown se clicar fora dele
    window.addEventListener('click', (event) => {
        if (elements.dropdownMenu && elements.dropdownMenu.classList.contains('show')) {
            if (!profileElement.contains(event.target)) {
                toggleDropdown();
            }
        }
    });

    // Eventos da página "Minha Conta"
    const editButton = document.querySelector('#sub-aba-meus-dados .form-group-actions .action-button.secondary');
    if (editButton) editButton.addEventListener('click', enableEditMode);
    
    const saveAccountButton = document.querySelector('#sub-aba-meus-dados .action-buttons .action-button.primary');
    if (saveAccountButton) saveAccountButton.addEventListener('click', saveAccountData);
    
    const saveNotifButton = document.querySelector('#sub-aba-notificacoes .action-button.primary');
    if (saveNotifButton) saveNotifButton.addEventListener('click', saveNotificationPreferences);
    
    const changePassButton = document.querySelector('#sub-aba-mudar-senha .action-button.primary');
    if (changePassButton) changePassButton.addEventListener('click', changePassword);
    
    // Eventos da página "Horários de Triagem"
    elements.selectDiaSemana.addEventListener('change', updateAvailableTimes);
    elements.selectPeriodo.addEventListener('change', updateAvailableTimes);
    elements.confirmSelectionButton.addEventListener('click', validateAndOpenTriagemModal);

    // Eventos dos Modais
    document.querySelector('#modal-detalhes-consulta .modal-action-buttons .action-button.secondary').addEventListener('click', () => closeModal(elements.modalDetalhesConsulta));
    document.querySelector('#modal-triagem .modal-action-buttons .action-button.secondary').addEventListener('click', () => closeModal(elements.modalTriagem));
    document.querySelector('#modal-triagem .modal-action-buttons .action-button.primary').addEventListener('click', confirmTriagemRequest);
    document.querySelector('#modal-confirmar-cancelamento .modal-action-buttons .action-button.secondary').addEventListener('click', () => closeModal(elements.modalConfirmarCancelamento));
    
    if (elements.btnConfirmarCancelamentoFinal) {
        console.log("[DOMContentLoaded] Botão #btn-confirmar-cancelamento-final ENCONTRADO. Adicionando listener.");
        elements.btnConfirmarCancelamentoFinal.addEventListener('click', () => {
            console.log("[DOMContentLoaded] Botão #btn-confirmar-cancelamento-final CLICADO. Chamando cancelAppointment().");
            cancelAppointment();
        });
    } else {
        console.error("[DOMContentLoaded] ERRO: Botão #btn-confirmar-cancelamento-final NÃO encontrado no DOM.");
    }
    // Eventos da Página "Consulta Confirmada"
    document.querySelector('.consulta-confirmada-download').addEventListener('click', downloadQRCode);
    document.querySelector('.consulta-confirmada-voltar').addEventListener('click', () => goToPage('pagina-consultas'));

    // Eventos da Página "Não Posso Comparecer"
    document.querySelector('#pagina-nao-posso-comparecer .action-button.secondary').addEventListener('click', closeCannotAttendPage);
    document.querySelector('#pagina-nao-posso-comparecer .action-button.primary').addEventListener('click', sendCannotAttendReasonAndCancel);
});

// --- Definição ÚNICA de closeModal ---
function closeModal(modalElement) {
    console.log("[closeModal] Fechando modal:", modalElement ? modalElement.id : 'Elemento Nulo');
    if (modalElement) {
        modalElement.classList.remove('active');
    }
    // Só remove modal-active do body se nenhum outro modal estiver aberto
    if (!document.querySelector('.modal-overlay.active')) {
        document.body.classList.remove('modal-active');
    }
    console.log("[closeModal] Limpando appState.consultaEmContexto.");
    appState.consultaEmContexto = null; // Limpa o contexto da consulta ao fechar modais
}

// --- Mapeamento para funções globais (para compatibilidade com `onclick` no HTML) ---
// Mantenha estes se seu HTML ainda usa `onclick="funcao()"`.
// Em um projeto novo, você removeria todos os onclicks e usaria apenas addEventListener.
// Remove as funções globais que não são mais necessárias para o menu
window.mostrarPagina = goToPage;
window.mostrarSubAba = showSubTab;

// --- Funções da Página "Minha Conta" ---
window.habilitarEdicao = enableEditMode;
window.salvarDados = saveAccountData;
window.salvarNotificacoes = saveNotificationPreferences;
window.mudarSenha = changePassword;

// --- Funções da Página "Horários de Triagem" ---
window.atualizarHorariosDisponiveis = updateAvailableTimes;
window.validarEabrirModalTriagem = validateAndOpenTriagemModal;
window.enviarSolicitacaoTriagem = confirmTriagemRequest; // Mapeando o nome antigo para o novo, se o HTML ainda usar

// --- Funções da Página "Minhas Consultas" ---
window.atualizarListaConsultas = atualizarListaConsultas; // Caso seja chamada diretamente
window.mostrarDetalhesConsulta = viewAppointmentDetails; // Detalhes da consulta
window.mostrarPaginaNaoPosso = showCannotAttendPage; // Abre a página "Não posso comparecer"
window.enviarNaoPosso = sendCannotAttendReasonAndCancel; // Envia o motivo e cancela
window.fecharNaoPosso = closeCannotAttendPage; // Fecha a página "Não posso comparecer"

window.fecharModalDetalhes = () => closeModal(elements.modalDetalhesConsulta);
window.cancelarConsulta = () => openCancelAppointmentModal(appState.consultaEmContexto); // Abre o modal de cancelamento a partir dos detalhes
window.abrirModalConfirmarCancelamento = openCancelAppointmentModal; // Para botões diretos
window.fecharModalConfirmarCancelamento = () => closeModal(elements.modalConfirmarCancelamento); // Já existe no addEventListener
window.executarCancelamentoFinal = cancelAppointment; // Ação final de cancelamento

window.fecharModalTriagem = () => closeModal(elements.modalTriagem);

window.gerarQRCode = generateQRCode; // Mantido se houver chamadas diretas
window.baixarQRCode = downloadQRCode; // Mantido se houver chamadas diretas