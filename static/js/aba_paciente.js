// aba_paciente.js - VERSÃO ORGANIZADA
console.log("DEBUG: aba_paciente.js CARREGADO E SENDO INTERPRETADO");

// =============================================================================
// CONFIGURAÇÕES E ESTADO
// =============================================================================

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

    // Mudar Horário
    mudarDiaSemana: document.getElementById('mudar-dia-semana'),
    mudarPeriodo: document.getElementById('mudar-periodo'),
    mudarTimeSlotsGrid: document.getElementById('mudar-time-slots-grid'),
    mudarPreferenceSummary: document.getElementById('mudar-preference-summary'),
    mudarSelectedWeekdayDisplay: document.getElementById('mudar-selected-weekday-display'),
    mudarSelectedPeriodDisplay: document.getElementById('mudar-selected-period-display'),
    mudarSelectedTimeDisplay: document.getElementById('mudar-selected-time-display')
};

// --- Estado Global ---
const appState = {
    currentActivePage: 'pagina-principal',
    selectedTriagem: {
        diaSemana: null,
        periodo: null,
        horario: null
    },
    botaoHorarioAtivo: null,
    consultaEmContexto: null,
    
    preferenciasNotificacao: {
        email: true,
        sms: false,
        app: true,
        ofertas: false
    },

    horariosPorPeriodo: {
        'Manhã': ["08:00", "09:00", "10:00", "11:00"],
        'Tarde': ["13:00", "14:00", "15:00", "16:00"],
        'Noite': ["18:00", "19:00", "20:00", "21:00"]
    },

    preferenciasHorario: null
};

// =============================================================================
// FUNÇÕES UTILITÁRIAS
// =============================================================================

function showToast(message, type = 'success') {
    const toast = elements.toastNotification;
    toast.textContent = message;
    toast.className = 'toast';
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
    const parts = dataString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataString;
}

function calcularHoraFim(horaInicio) {
    if (!horaInicio) return '';
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const data = new Date();
    data.setHours(horas, minutos, 0, 0);
    data.setHours(data.getHours() + 1);
    return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
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

// =============================================================================
// NAVEGAÇÃO E MODAIS
// =============================================================================

function goToPage(pageId) {
    elements.pages.forEach(p => p.classList.remove('active'));
    const paginaAtiva = document.getElementById(pageId);
    if (paginaAtiva) {
        paginaAtiva.classList.add('active');
        appState.currentActivePage = pageId;
    }

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.classList.remove('modal-active');

    if (pageId === 'pagina-consultas') {
        atualizarListaConsultas();
    } else if (pageId === 'pagina-meus-dados') {
        setTimeout(() => {
            const primeiraAba = document.querySelector('.tab-button');
            if (primeiraAba) {
                showSubTab('sub-aba-meus-dados', primeiraAba);
            }
        }, 50);
        carregarPreferenciasNotificacao();
    }
}

function toggleDropdown() {
    elements.dropdownMenu.classList.toggle("show");
}

function showSubTab(subTabId, buttonElement) {
    console.log("Mostrando sub-aba:", subTabId);
    
    document.querySelectorAll('.sub-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const subTabElement = document.getElementById(subTabId);
    if (subTabElement) {
        subTabElement.classList.add('active');
    }
    
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

function openModal(modalElement) {
    modalElement.classList.add('active');
    document.body.classList.add('modal-active');
}

function closeModal(modalElement) {
    console.log("[closeModal] Fechando modal:", modalElement ? modalElement.id : 'Elemento Nulo');
    if (modalElement) {
        modalElement.classList.remove('active');
    }
    if (!document.querySelector('.modal-overlay.active')) {
        document.body.classList.remove('modal-active');
    }
    console.log("[closeModal] Limpando appState.consultaEmContexto.");
    appState.consultaEmContexto = null;
}

// =============================================================================
// MINHA CONTA
// =============================================================================

function enableEditMode() {
    elements.inputsMeusDados.forEach(input => {
        if (input.id !== 'nome-completo' && input.id !== 'data-nascimento' && input.id !== 'cpf') {
            input.disabled = false;
        }
    });
    showToast("Campos habilitados para edição.", "info");
}

function saveAccountData() {
    showSpinner();

    const formData = new FormData();
    formData.append('genero', document.getElementById('genero').value);
    formData.append('telefone', document.getElementById('telefone').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('endereco', document.getElementById('endereco').value);

    fetch('/atualizar_dados_paciente', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast(data.message, 'success');
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

// =============================================================================
// HORÁRIOS DE TRIAGEM
// =============================================================================

function updateAvailableTimes() {
    const diaSemana = elements.selectDiaSemana.value;
    const periodo = elements.selectPeriodo.value;
    elements.timeSlotsGrid.innerHTML = '';
    
    document.getElementById('error-dia-semana').textContent = '';
    document.getElementById('error-periodo').textContent = '';
    document.getElementById('error-horario-especifico').textContent = '';
    
    appState.selectedTriagem.horario = null;
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
                button.dataset.time = horario;
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
    appState.selectedTriagem.horario = button.dataset.time;

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
    const confirmButton = document.getElementById('btn-confirmar-envio-triagem');
    if (!confirmButton) {
        console.error('Botão de confirmação não encontrado');
        return;
    }

    if (confirmButton.disabled) {
        return;
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

        showToast('Solicitação de triagem enviada com sucesso!', 'success');
        resetTriagemSelection();
        goToPage('pagina-triagem-sucesso');
    } catch (error) {
        console.error('Erro ao solicitar triagem:', error);
        showToast(error.message || 'Erro de comunicação com o servidor. Tente novamente.', 'error');
    } finally {
        hideSpinner();
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'CONFIRMAR';
        }
    }
}

function resetTriagemSelection() {
    appState.selectedTriagem = {
        diaSemana: null,
        periodo: null,
        horario: null
    };

    const selectDiaSemana = document.getElementById('select-dia-semana');
    const selectPeriodo = document.getElementById('select-periodo');
    if (selectDiaSemana) selectDiaSemana.value = '';
    if (selectPeriodo) selectPeriodo.value = '';

    const timeSlotsGrid = document.getElementById('time-slots-grid');
    if (timeSlotsGrid) timeSlotsGrid.innerHTML = '';

    const scheduleSummary = document.getElementById('schedule-summary');
    if (scheduleSummary) scheduleSummary.style.display = 'none';

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

// =============================================================================
// MINHAS CONSULTAS
// =============================================================================

function compareAppointments(a, b) {
    const dataA = a.data_agendamento ? new Date(a.data_agendamento) : (a.data_solicitacao ? new Date(a.data_solicitacao) : null);
    const dataB = b.data_agendamento ? new Date(b.data_agendamento) : (b.data_solicitacao ? new Date(b.data_solicitacao) : null);

    if (a.data_agendamento && !b.data_agendamento) return -1;
    if (!a.data_agendamento && b.data_agendamento) return 1;

    if (dataA && dataB) {
        return dataB - dataA;
    } else if (dataA) {
        return -1;
    } else if (dataB) {
        return 1;
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

        const consultasFiltradas = agendamentos.filter(ag => {
            if (ag.tipo_atendimento === 'Solicitação de Triagem') {
                return ag.status === 'solicitado';
            }
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
    appState.consultaEmContexto = consulta;
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

    if (consulta.status !== 'cancelado_paciente' && consulta.status !== 'cancelado_estagiario' && consulta.status !== 'finalizado') {
        conteudo.innerHTML += `
                <h3 style="margin-top: 20px;">Ações</h3>
                <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: center;">
                    <button class="action-button danger" id="btn-detalhes-cancelar-${consulta.id}">Cancelar Agendamento</button>
                    ${consulta.data_agendamento ? '<button class="action-button warning" disabled>Reagendar (Em breve)</button>' : ''}
                </div>`;
        
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
            await atualizarListaConsultas();
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

function showCannotAttendPage(consulta) {
    appState.consultaEmContexto = consulta;
    goToPage('pagina-nao-posso-comparecer');
}

function closeCannotAttendPage() {
    goToPage('pagina-consultas');
    elements.motivoNaoPosso.value = '';
    appState.consultaEmContexto = null;
}

function sendCannotAttendReasonAndCancel() {
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
        if (appState.consultaEmContexto) {
            cancelAppointment();
            goToPage('pagina-consultas');
            elements.motivoNaoPosso.value = '';
            appState.consultaEmContexto = null;
            showToast('Solicitação de cancelamento enviada.', "success");
        } else {
            showToast('Erro ao cancelar consulta.', "error");
        }
    }, 1500);
}

// =============================================================================
// CONSULTA CONFIRMADA E QR CODE
// =============================================================================

function generateQRCode() {
    const qrCodeContainer = elements.consultaConfirmadaQrcode;
    qrCodeContainer.innerHTML = '';
    
    const qrCodeImg = document.createElement('img');
    
     const consultaInfo = appState.consultaEmContexto ? {
         paciente: document.getElementById('nome-completo') ? document.getElementById('nome-completo').value : "Paciente",
         data: appState.consultaEmContexto.data_agendamento ? new Date(appState.consultaEmContexto.data_agendamento).toLocaleDateString('pt-BR') : 'A Definir',
         hora: appState.consultaEmContexto.data_agendamento ? new Date(appState.consultaEmContexto.data_agendamento).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : 'A Definir',
         local: 'COEPP - Fundação Santo André',
         tipo: appState.consultaEmContexto.tipo_atendimento,
         estagiario: appState.consultaEmContexto.estagiario_nome || "A definir",
         id: appState.consultaEmContexto.id
     } : {
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

function downloadQRCode() {
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

// =============================================================================
// MUDAR HORÁRIO
// =============================================================================

function inicializarMudarHorario() {
    if (elements.mudarDiaSemana) {
        elements.mudarDiaSemana.addEventListener('change', atualizarHorariosMudar);
    }
    if (elements.mudarPeriodo) {
        elements.mudarPeriodo.addEventListener('change', atualizarHorariosMudar);
    }
    
    carregarPreferenciasHorarioSalvas();
}

function atualizarHorariosMudar() {
    const dia = elements.mudarDiaSemana ? elements.mudarDiaSemana.value : '';
    const periodo = elements.mudarPeriodo ? elements.mudarPeriodo.value : '';
    const timeSlotsGrid = elements.mudarTimeSlotsGrid;
    const summary = elements.mudarPreferenceSummary;
    
    if (!timeSlotsGrid) return;
    
    timeSlotsGrid.innerHTML = '';
    
    if (!dia || !periodo) {
        if (summary) summary.style.display = 'none';
        return;
    }
    
    let horarios = [];
    if (periodo === 'Manhã') {
        horarios = ['08:00', '09:00', '10:00', '11:00'];
    } else if (periodo === 'Tarde') {
        horarios = ['13:00', '14:00', '15:00', '16:00'];
    } else if (periodo === 'Noite') {
        horarios = ['18:00', '19:00', '20:00', '21:00'];
    }
    
    horarios.forEach(horario => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = horario;
        timeSlot.onclick = () => selecionarHorarioMudar(horario, timeSlot);
        timeSlotsGrid.appendChild(timeSlot);
    });
    
    atualizarResumoMudar();
}

function selecionarHorarioMudar(horario, element) {
    document.querySelectorAll('#mudar-time-slots-grid .time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    if (elements.mudarSelectedTimeDisplay) {
        elements.mudarSelectedTimeDisplay.textContent = horario;
    }
    atualizarResumoMudar();
}

function atualizarResumoMudar() {
    const dia = elements.mudarDiaSemana ? elements.mudarDiaSemana.value : '';
    const periodo = elements.mudarPeriodo ? elements.mudarPeriodo.value : '';
    const horarioSelecionado = document.querySelector('#mudar-time-slots-grid .time-slot.selected');
    const summary = elements.mudarPreferenceSummary;
    
    if (dia && periodo && horarioSelecionado && summary) {
        if (elements.mudarSelectedWeekdayDisplay) {
            elements.mudarSelectedWeekdayDisplay.textContent = dia;
        }
        if (elements.mudarSelectedPeriodDisplay) {
            elements.mudarSelectedPeriodDisplay.textContent = periodo;
        }
        if (elements.mudarSelectedTimeDisplay) {
            elements.mudarSelectedTimeDisplay.textContent = horarioSelecionado.textContent;
        }
        summary.style.display = 'block';
    } else if (summary) {
        summary.style.display = 'none';
    }
}

function salvarPreferenciasHorario() {
    const dia = elements.mudarDiaSemana ? elements.mudarDiaSemana.value : '';
    const periodo = elements.mudarPeriodo ? elements.mudarPeriodo.value : '';
    const horarioSelecionado = document.querySelector('#mudar-time-slots-grid .time-slot.selected');
    
    let isValid = true;
    
    if (!dia) {
        document.getElementById('error-mudar-dia-semana').textContent = 'Selecione um dia da semana';
        isValid = false;
    } else {
        document.getElementById('error-mudar-dia-semana').textContent = '';
    }
    
    if (!periodo) {
        document.getElementById('error-mudar-periodo').textContent = 'Selecione um período';
        isValid = false;
    } else {
        document.getElementById('error-mudar-periodo').textContent = '';
    }
    
    if (!horarioSelecionado) {
        document.getElementById('error-mudar-horario-especifico').textContent = 'Selecione um horário específico';
        isValid = false;
    } else {
        document.getElementById('error-mudar-horario-especifico').textContent = '';
    }
    
    if (!isValid) return;
    
    const preferencias = {
        dia: dia,
        periodo: periodo,
        horario: horarioSelecionado.textContent
    };
    
    showSpinner();
    setTimeout(() => {
        hideSpinner();
        localStorage.setItem('preferenciasHorario', JSON.stringify(preferencias));
        showToast('Preferências de horário salvas com sucesso!', 'success');
    }, 1000);
}

function carregarPreferenciasHorarioSalvas() {
    const preferenciasSalvas = localStorage.getItem('preferenciasHorario');
    if (preferenciasSalvas) {
        const preferencias = JSON.parse(preferenciasSalvas);
        
        if (elements.mudarDiaSemana) elements.mudarDiaSemana.value = preferencias.dia;
        if (elements.mudarPeriodo) elements.mudarPeriodo.value = preferencias.periodo;
        
        atualizarHorariosMudar();
        
        setTimeout(() => {
            const timeSlots = document.querySelectorAll('#mudar-time-slots-grid .time-slot');
            timeSlots.forEach(slot => {
                if (slot.textContent === preferencias.horario) {
                    slot.classList.add('selected');
                    atualizarResumoMudar();
                }
            });
        }, 100);
    }
}

function limparPreferenciasHorario() {
    if (elements.mudarDiaSemana) elements.mudarDiaSemana.value = '';
    if (elements.mudarPeriodo) elements.mudarPeriodo.value = '';
    if (elements.mudarTimeSlotsGrid) elements.mudarTimeSlotsGrid.innerHTML = '';
    if (elements.mudarPreferenceSummary) elements.mudarPreferenceSummary.style.display = 'none';
    
    document.getElementById('error-mudar-dia-semana').textContent = '';
    document.getElementById('error-mudar-periodo').textContent = '';
    document.getElementById('error-mudar-horario-especifico').textContent = '';
    
    localStorage.removeItem('preferenciasHorario');
    
    showToast('Preferências limpas!', 'info');
}

// =============================================================================
// EVENT LISTENERS E INICIALIZAÇÃO
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded disparado!");
    goToPage('pagina-principal');

    // Eventos do Header
    const profileElement = document.querySelector('.profile');
    if (profileElement) {
        profileElement.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown();
        });
    }

    if (elements.dropdownMenu) {
        elements.dropdownMenu.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.dataset.page) {
                event.preventDefault();
                goToPage(link.dataset.page);
                toggleDropdown();
            }
        });
    }

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
    if (elements.selectDiaSemana) {
        elements.selectDiaSemana.addEventListener('change', updateAvailableTimes);
    }
    if (elements.selectPeriodo) {
        elements.selectPeriodo.addEventListener('change', updateAvailableTimes);
    }
    if (elements.confirmSelectionButton) {
        elements.confirmSelectionButton.addEventListener('click', validateAndOpenTriagemModal);
    }

    // Eventos dos Modais
    document.querySelector('#modal-detalhes-consulta .modal-action-buttons .action-button.secondary')?.addEventListener('click', () => closeModal(elements.modalDetalhesConsulta));
    document.querySelector('#modal-triagem .modal-action-buttons .action-button.secondary')?.addEventListener('click', () => closeModal(elements.modalTriagem));
    document.querySelector('#modal-triagem .modal-action-buttons .action-button.primary')?.addEventListener('click', confirmTriagemRequest);
    document.querySelector('#modal-confirmar-cancelamento .modal-action-buttons .action-button.secondary')?.addEventListener('click', () => closeModal(elements.modalConfirmarCancelamento));
    
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
    document.querySelector('.consulta-confirmada-download')?.addEventListener('click', downloadQRCode);
    document.querySelector('.consulta-confirmada-voltar')?.addEventListener('click', () => goToPage('pagina-consultas'));

    // Eventos da Página "Não Posso Comparecer"
    document.querySelector('#pagina-nao-posso-comparecer .action-button.secondary')?.addEventListener('click', closeCannotAttendPage);
    document.querySelector('#pagina-nao-posso-comparecer .action-button.primary')?.addEventListener('click', sendCannotAttendReasonAndCancel);

    // Inicializar funcionalidade "Mudar Horário"
    inicializarMudarHorario();
});

// =============================================================================
// MAPEAMENTO PARA FUNÇÕES GLOBAIS (compatibilidade com onclick no HTML)
// =============================================================================

window.mostrarPagina = goToPage;
window.mostrarSubAba = showSubTab;

// Página "Minha Conta"
window.habilitarEdicao = enableEditMode;
window.salvarDados = saveAccountData;
window.salvarNotificacoes = saveNotificationPreferences;
window.mudarSenha = changePassword;

// Página "Horários de Triagem"
window.atualizarHorariosDisponiveis = updateAvailableTimes;
window.validarEabrirModalTriagem = validateAndOpenTriagemModal;
window.enviarSolicitacaoTriagem = confirmTriagemRequest;

// Página "Minhas Consultas"
window.atualizarListaConsultas = atualizarListaConsultas;
window.mostrarDetalhesConsulta = viewAppointmentDetails;
window.mostrarPaginaNaoPosso = showCannotAttendPage;
window.enviarNaoPosso = sendCannotAttendReasonAndCancel;
window.fecharNaoPosso = closeCannotAttendPage;

window.fecharModalDetalhes = () => closeModal(elements.modalDetalhesConsulta);
window.cancelarConsulta = () => openCancelAppointmentModal(appState.consultaEmContexto);
window.abrirModalConfirmarCancelamento = openCancelAppointmentModal;
window.fecharModalConfirmarCancelamento = () => closeModal(elements.modalConfirmarCancelamento);
window.executarCancelamentoFinal = cancelAppointment;

window.fecharModalTriagem = () => closeModal(elements.modalTriagem);

window.gerarQRCode = generateQRCode;
window.baixarQRCode = downloadQRCode;

// Funcionalidade "Mudar Horário"
window.salvarPreferenciasHorario = salvarPreferenciasHorario;
window.limparPreferenciasHorario = limparPreferenciasHorario;