// aba_paciente.js - VERSÃO FINAL CONSOLIDADA E CORRIGIDA
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

    // Página Horários Triagem - SELEÇÃO MÚLTIPLA
    diasSemanaContainer: document.getElementById('dias-semana-container'),
    periodosContainer: document.getElementById('periodos-container'),
    horariosEspecificosContainer: document.getElementById('horarios-especificos-container'),
    scheduleSummary: document.getElementById('schedule-summary'),
    selectedPreferencesDisplay: document.getElementById('selected-preferences-display'),
    triagemInfoConfirmacao: document.getElementById('triagem-info-confirmacao'),
    confirmSelectionButton: document.getElementById('confirm-selection-button'),

    // Página Mudar Horário
    mudarDiasSemanaContainer: document.getElementById('mudar-dias-semana-container'),
    mudarPeriodosContainer: document.getElementById('mudar-periodos-container'),
    mudarHorariosEspecificosContainer: document.getElementById('mudar-horarios-especificos-container'),
    mudarScheduleSummary: document.getElementById('mudar-schedule-summary'),
    mudarSelectedPreferencesDisplay: document.getElementById('mudar-selected-preferences-display'),
    mudarConfirmSelectionButton: document.getElementById('mudar-confirm-selection-button'),

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

    // Campos Minha Conta - CORRIGIDO: Removidos elementos que não existem no HTML
    inputsMeusDados: document.querySelectorAll('#sub-aba-meus-dados input, #sub-aba-meus-dados select'),
    notifEmail: document.getElementById('notif-email'),
    notifApp: document.getElementById('notif-app'),
    senhaAtualInput: document.getElementById('senha-atual'),
    novaSenhaInput: document.getElementById('nova-senha'),
    confirmarNovaSenhaInput: document.getElementById('confirmar-nova-senha'),
    errorSenhaAtual: document.getElementById('error-senha-atual'),
    errorNovaSenha: document.getElementById('error-nova-senha'),
    errorConfirmarNovaSenha: document.getElementById('error-confirmar-nova-senha'),

    // Página Não Posso Comparecer
    motivoNaoPosso: document.getElementById('motivo-nao-posso'),
};

// --- Estado Global ---
const appState = {
    currentActivePage: 'pagina-principal',
    selectedTriagem: {
        diasSemana: [], // Array para múltiplos dias
        periodos: [],   // Array para múltiplos períodos
        horariosEspecificos: [] // Array para horários específicos
    },
    selectedPreferenciasHorario: {
        diasSemana: [], // Array para múltiplos dias
        periodos: [],   // Array para múltiplos períodos
        horariosEspecificos: [] // Array para horários específicos
    },
    consultaEmContexto: null,
    
    // CORRIGIDO: Removidas preferências que não existem no HTML
    preferenciasNotificacao: {
        email: true,
        app: true
    },

    // Horários disponíveis por período (CORRIGIDO - usando formato 24h)
    horariosPorPeriodo: {
        'Manhã': ["08:00", "09:00", "10:00", "11:00"],
        'Tarde': ["13:00", "14:00", "15:00", "16:00"],
        'Noite': ["17:00", "18:00", "19:00"]
    },

    diasDaSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    periodosDisponiveis: ['Manhã', 'Tarde', 'Noite']
};

// =============================================================================
// FUNÇÕES UTILITÁRIAS
// =============================================================================

function showToast(message, type = 'success') {
    const toast = elements.toastNotification;
    if (!toast) {
        console.warn('Elemento toast não encontrado');
        return;
    }
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add('show', type);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showSpinner() {
    if (elements.loadingSpinner) {
        elements.loadingSpinner.classList.add('active');
    }
}

function hideSpinner() {
    if (elements.loadingSpinner) {
        elements.loadingSpinner.classList.remove('active');
    }
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

// =============================================================================
// NAVEGAÇÃO E MODAIS
// =============================================================================

function mostrarPagina(pageId) {
    console.log(`[mostrarPagina] Tentando mostrar página: ${pageId}`);
    
    if (!elements.pages || elements.pages.length === 0) {
        console.error('Nenhuma página encontrada no DOM');
        return;
    }
    
    elements.pages.forEach(p => p.classList.remove('active'));
    const paginaAtiva = document.getElementById(pageId);
    
    if (paginaAtiva) {
        paginaAtiva.classList.add('active');
        appState.currentActivePage = pageId;
        console.log(`[mostrarPagina] Página ${pageId} ativada com sucesso`);
    } else {
        console.error(`[mostrarPagina] Página não encontrada: ${pageId}`);
    }

    // Fechar todos os modais
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.classList.remove('modal-active');

    // Ações específicas por página
    if (pageId === 'pagina-consultas') {
        atualizarListaConsultas();
    } else if (pageId === 'pagina-meus-dados') {
        setTimeout(() => {
            const primeiraAba = document.querySelector('.tab-button');
            if (primeiraAba) {
                mostrarSubAba('sub-aba-meus-dados', primeiraAba);
            }
        }, 50);
        carregarPreferenciasNotificacao();
    } else if (pageId === 'pagina-horarios-triagem') {
        inicializarSelecaoHorarios();
    }
}

function toggleDropdown() {
    if (elements.dropdownMenu) {
        elements.dropdownMenu.classList.toggle("show");
    }
}

function mostrarSubAba(subTabId, buttonElement) {
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
        
        // Inicializar a aba "Mudar Horário" quando for aberta
        if (subTabId === 'sub-aba-mudar-horario') {
            inicializarMudarHorario();
        }
    }
    
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

function openModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('active');
        document.body.classList.add('modal-active');
    }
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
// SELEÇÃO DE HORÁRIOS DE TRIAGEM (MÚLTIPLOS) - CORRIGIDO
// =============================================================================

function inicializarSelecaoHorarios() {
    // Limpar seleções anteriores
    appState.selectedTriagem = {
        diasSemana: [],
        periodos: [],
        horariosEspecificos: []
    };
    
    // Criar botões para dias da semana
    criarBotoesSelecao(elements.diasSemanaContainer, appState.diasDaSemana, 'diasSemana');
    
    // Criar botões para períodos
    criarBotoesSelecao(elements.periodosContainer, appState.periodosDisponiveis, 'periodos');
    
    // Inicialmente esconder horários específicos
    if (elements.horariosEspecificosContainer) {
        elements.horariosEspecificosContainer.style.display = 'none';
    }
    if (elements.scheduleSummary) {
        elements.scheduleSummary.style.display = 'none';
    }
}

function criarBotoesSelecao(container, opcoes, tipo) {
    if (!container) {
        console.error('Container não encontrado para criar botões');
        return;
    }
    
    container.innerHTML = '';
    
    opcoes.forEach(opcao => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'selection-button';
        botao.textContent = opcao;
        botao.dataset.value = opcao;
        
        botao.addEventListener('click', () => {
            toggleSelecao(botao, tipo, opcao);
        });
        
        container.appendChild(botao);
    });
}

function toggleSelecao(botao, tipo, valor) {
    botao.classList.toggle('selected');
    
    const arraySelecionado = appState.selectedTriagem[tipo];
    const index = arraySelecionado.indexOf(valor);
    
    if (index > -1) {
        // Remover se já estiver selecionado
        arraySelecionado.splice(index, 1);
    } else {
        // Adicionar se não estiver selecionado
        arraySelecionado.push(valor);
    }
    
    // Atualizar interface baseado nas seleções
    atualizarInterfaceAposSelecao();
}

function atualizarInterfaceAposSelecao() {
    // Mostrar/ocultar horários específicos baseado nas seleções
    if (appState.selectedTriagem.diasSemana.length > 0 && appState.selectedTriagem.periodos.length > 0) {
        mostrarHorariosEspecificos();
        if (elements.horariosEspecificosContainer) {
            elements.horariosEspecificosContainer.style.display = 'block';
        }
    } else {
        if (elements.horariosEspecificosContainer) {
            elements.horariosEspecificosContainer.style.display = 'none';
        }
        if (elements.scheduleSummary) {
            elements.scheduleSummary.style.display = 'none';
        }
    }
    
    // Atualizar resumo
    atualizarResumoSelecao();
}

function mostrarHorariosEspecificos() {
    const container = elements.horariosEspecificosContainer;
    if (!container) return;
    
    container.innerHTML = '<h3>Horários Específicos</h3>';
    
    // Para cada período selecionado, mostrar os horários disponíveis
    appState.selectedTriagem.periodos.forEach(periodo => {
        const horarios = appState.horariosPorPeriodo[periodo];
        if (horarios) {
            const periodoSection = document.createElement('div');
            periodoSection.className = 'periodo-section';
            periodoSection.innerHTML = `<h4>${periodo}</h4>`;
            
            const horariosGrid = document.createElement('div');
            horariosGrid.className = 'horarios-grid';
            
            horarios.forEach(horario => {
                const horarioBtn = document.createElement('button');
                horarioBtn.type = 'button';
                horarioBtn.className = 'horario-button';
                horarioBtn.textContent = horario;
                horarioBtn.dataset.periodo = periodo;
                horarioBtn.dataset.horario = horario;
                
                // Verificar se já está selecionado
                const jaSelecionado = appState.selectedTriagem.horariosEspecificos.some(h => 
                    h.periodo === periodo && h.horario === horario
                );
                
                if (jaSelecionado) {
                    horarioBtn.classList.add('selected');
                }
                
                horarioBtn.addEventListener('click', () => {
                    toggleHorarioEspecifico(horarioBtn, periodo, horario);
                });
                
                horariosGrid.appendChild(horarioBtn);
            });
            
            periodoSection.appendChild(horariosGrid);
            container.appendChild(periodoSection);
        }
    });
}

function toggleHorarioEspecifico(botao, periodo, horario) {
    botao.classList.toggle('selected');
    
    const horarioObj = { periodo, horario };
    const arrayHorarios = appState.selectedTriagem.horariosEspecificos;
    const index = arrayHorarios.findIndex(h => 
        h.periodo === periodo && h.horario === horario
    );
    
    if (index > -1) {
        // Remover se já estiver selecionado
        arrayHorarios.splice(index, 1);
    } else {
        // Adicionar se não estiver selecionado
        arrayHorarios.push(horarioObj);
    }
    
    atualizarResumoSelecao();
}

function atualizarResumoSelecao() {
    const resumo = elements.selectedPreferencesDisplay;
    const summaryContainer = elements.scheduleSummary;
    
    if (!resumo || !summaryContainer) return;
    
    if (appState.selectedTriagem.diasSemana.length === 0 && 
        appState.selectedTriagem.periodos.length === 0 && 
        appState.selectedTriagem.horariosEspecificos.length === 0) {
        summaryContainer.style.display = 'none';
        return;
    }
    
    let htmlResumo = '';
    
    // Dias selecionados
    if (appState.selectedTriagem.diasSemana.length > 0) {
        htmlResumo += `<p><strong>Dias:</strong> ${appState.selectedTriagem.diasSemana.join(', ')}</p>`;
    }
    
    // Períodos selecionados
    if (appState.selectedTriagem.periodos.length > 0) {
        htmlResumo += `<p><strong>Períodos:</strong> ${appState.selectedTriagem.periodos.join(', ')}</p>`;
    }
    
    // Horários específicos selecionados
    if (appState.selectedTriagem.horariosEspecificos.length > 0) {
        // Agrupar horários por período para melhor exibição
        const horariosPorPeriodo = {};
        appState.selectedTriagem.horariosEspecificos.forEach(h => {
            if (!horariosPorPeriodo[h.periodo]) {
                horariosPorPeriodo[h.periodo] = [];
            }
            horariosPorPeriodo[h.periodo].push(h.horario);
        });
        
        htmlResumo += `<p><strong>Horários Preferenciais:</strong></p>`;
        Object.keys(horariosPorPeriodo).forEach(periodo => {
            htmlResumo += `<p style="margin-left: 10px;">${periodo}: ${horariosPorPeriodo[periodo].join(', ')}</p>`;
        });
    }
    
    resumo.innerHTML = htmlResumo;
    summaryContainer.style.display = 'block';
}

function validarEabrirModalTriagem() {
    // Validação mínima - pelo menos um dia, um período e um horário específico
    if (appState.selectedTriagem.diasSemana.length === 0) {
        showToast('Por favor, selecione pelo menos um dia da semana.', 'error');
        return;
    }
    
    if (appState.selectedTriagem.periodos.length === 0) {
        showToast('Por favor, selecione pelo menos um período.', 'error');
        return;
    }
    
    if (appState.selectedTriagem.horariosEspecificos.length === 0) {
        showToast('Por favor, selecione pelo menos um horário específico.', 'error');
        return;
    }
    
    // Prepara informações para o modal (MELHORADO)
    let infoText = '';
    
    infoText += `<strong>Dias Preferidos:</strong> ${appState.selectedTriagem.diasSemana.join(', ')}<br>`;
    infoText += `<strong>Períodos Preferidos:</strong> ${appState.selectedTriagem.periodos.join(', ')}<br>`;
    
    // Horários específicos
    const horariosPorPeriodo = {};
    appState.selectedTriagem.horariosEspecificos.forEach(h => {
        if (!horariosPorPeriodo[h.periodo]) {
            horariosPorPeriodo[h.periodo] = [];
        }
        horariosPorPeriodo[h.periodo].push(h.horario);
    });
    
    infoText += `<strong>Horários Preferenciais:</strong><br>`;
    Object.keys(horariosPorPeriodo).forEach(periodo => {
        infoText += `• ${periodo}: ${horariosPorPeriodo[periodo].join(', ')}<br>`;
    });
    
    if (elements.triagemInfoConfirmacao) {
        elements.triagemInfoConfirmacao.innerHTML = infoText;
    }
    openModal(elements.modalTriagem);
}

// FUNÇÃO PRINCIPAL CORRIGIDA - ENVIO DA TRIAGEM
async function enviarSolicitacaoTriagem() {
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

    try {
        // Validação final
        if (appState.selectedTriagem.diasSemana.length === 0 || 
            appState.selectedTriagem.periodos.length === 0 || 
            appState.selectedTriagem.horariosEspecificos.length === 0) {
            throw new Error('Seleção incompleta. Por favor, selecione dia, período e horários.');
        }

        // FORMATO CORRETO DOS DADOS PARA O BACKEND
        // CORREÇÃO CRÍTICA: Criar observações detalhadas e estruturadas
        const observacoes = criarObservacoesDetalhadas();
        
        const dadosParaEnvio = {
            tipo_atendimento: 'Solicitação de Triagem',
            status: 'solicitado',
            observacoes: observacoes,
            data_solicitacao: new Date().toISOString(),
            // Adicionando dados estruturados para facilitar o processamento
            preferencias_paciente: {
                dias_semana: appState.selectedTriagem.diasSemana,
                periodos: appState.selectedTriagem.periodos,
                horarios_especificos: appState.selectedTriagem.horariosEspecificos
            }
        };

        console.log('Enviando dados para triagem:', dadosParaEnvio);

        const response = await fetch('/api/agendamentos/solicitar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosParaEnvio),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro no servidor ao enviar a solicitação.');
        }

        showToast('Solicitação de triagem enviada com sucesso!', 'success');
        resetTriagemSelection();
        mostrarPagina('pagina-triagem-sucesso');
        
    } catch (error) {
        console.error('Erro ao solicitar triagem:', error);
        showToast(error.message || 'Erro de comunicação com o servidor. Tente novamente.', 'error');
        
        // Reabre o modal em caso de erro para o usuário tentar novamente
        setTimeout(() => {
            openModal(elements.modalTriagem);
        }, 500);
    } finally {
        hideSpinner();
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'CONFIRMAR';
        }
    }
}

// FUNÇÃO MELHORADA PARA CRIAR OBSERVAÇÕES DETALHADAS
function criarObservacoesDetalhadas() {
    const { diasSemana, periodos, horariosEspecificos } = appState.selectedTriagem;
    
    let observacoes = "SOLICITAÇÃO DE TRIAGEM - PREFERÊNCIAS DO PACIENTE\n\n";
    
    // Dias da semana
    observacoes += `📅 DIAS PREFERIDOS: ${diasSemana.join(', ')}\n`;
    
    // Períodos
    observacoes += `⏰ PERÍODOS PREFERIDOS: ${periodos.join(', ')}\n\n`;
    
    // Horários específicos agrupados por período
    observacoes += "🕐 HORÁRIOS ESPECÍFICOS SELECIONADOS:\n";
    
    const horariosPorPeriodo = {};
    horariosEspecificos.forEach(h => {
        if (!horariosPorPeriodo[h.periodo]) {
            horariosPorPeriodo[h.periodo] = [];
        }
        horariosPorPeriodo[h.periodo].push(h.horario);
    });
    
    Object.keys(horariosPorPeriodo).forEach(periodo => {
        observacoes += `• ${periodo}: ${horariosPorPeriodo[periodo].join(', ')}\n`;
    });
    
    observacoes += `\n📋 RESUMO: Paciente está disponível nas ${diasSemana.length > 1 ? 'dias' : 'dia'} ${diasSemana.join(', ')} `;
    observacoes += `nos períodos da ${periodos.join(', ')} `;
    observacoes += `nos horários específicos informados acima.`;
    
    return observacoes;
}

function resetTriagemSelection() {
    appState.selectedTriagem = {
        diasSemana: [],
        periodos: [],
        horariosEspecificos: []
    };
    
    // Resetar interface - limpar todos os botões selecionados
    document.querySelectorAll('#dias-semana-container .selection-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelectorAll('#periodos-container .selection-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelectorAll('.horario-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (elements.horariosEspecificosContainer) {
        elements.horariosEspecificosContainer.innerHTML = '';
        elements.horariosEspecificosContainer.style.display = 'none';
    }
    if (elements.scheduleSummary) {
        elements.scheduleSummary.style.display = 'none';
    }
}

// =============================================================================
// MUDAR HORÁRIO - FUNCIONALIDADE COMPLETA
// =============================================================================

function inicializarMudarHorario() {
    console.log("Inicializando aba Mudar Horário");
    
    // Limpar seleções anteriores
    appState.selectedPreferenciasHorario = {
        diasSemana: [],
        periodos: [],
        horariosEspecificos: []
    };
    
    // Criar botões para dias da semana
    criarBotoesSelecaoMudarHorario(elements.mudarDiasSemanaContainer, appState.diasDaSemana, 'diasSemana');
    
    // Criar botões para períodos
    criarBotoesSelecaoMudarHorario(elements.mudarPeriodosContainer, appState.periodosDisponiveis, 'periodos');
    
    // Inicialmente esconder horários específicos
    if (elements.mudarHorariosEspecificosContainer) {
        elements.mudarHorariosEspecificosContainer.style.display = 'none';
    }
    if (elements.mudarScheduleSummary) {
        elements.mudarScheduleSummary.style.display = 'none';
    }
    
    // Carregar preferências salvas se existirem
    carregarPreferenciasSalvas();
}

function criarBotoesSelecaoMudarHorario(container, opcoes, tipo) {
    if (!container) return;
    
    container.innerHTML = '';
    
    opcoes.forEach(opcao => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'selection-button';
        botao.textContent = opcao;
        botao.dataset.value = opcao;
        
        botao.addEventListener('click', () => {
            toggleSelecaoMudarHorario(botao, tipo, opcao);
        });
        
        container.appendChild(botao);
    });
}

function toggleSelecaoMudarHorario(botao, tipo, valor) {
    botao.classList.toggle('selected');
    
    const arraySelecionado = appState.selectedPreferenciasHorario[tipo];
    const index = arraySelecionado.indexOf(valor);
    
    if (index > -1) {
        // Remover se já estiver selecionado
        arraySelecionado.splice(index, 1);
    } else {
        // Adicionar se não estiver selecionado
        arraySelecionado.push(valor);
    }
    
    // Atualizar interface baseado nas seleções
    atualizarInterfaceAposSelecaoMudarHorario();
}

function atualizarInterfaceAposSelecaoMudarHorario() {
    // Mostrar/ocultar horários específicos baseado nas seleções
    if (appState.selectedPreferenciasHorario.diasSemana.length > 0 && appState.selectedPreferenciasHorario.periodos.length > 0) {
        mostrarHorariosEspecificosMudarHorario();
        if (elements.mudarHorariosEspecificosContainer) {
            elements.mudarHorariosEspecificosContainer.style.display = 'block';
        }
    } else {
        if (elements.mudarHorariosEspecificosContainer) {
            elements.mudarHorariosEspecificosContainer.style.display = 'none';
        }
        if (elements.mudarScheduleSummary) {
            elements.mudarScheduleSummary.style.display = 'none';
        }
    }
    
    // Atualizar resumo
    atualizarResumoSelecaoMudarHorario();
}

function mostrarHorariosEspecificosMudarHorario() {
    const container = elements.mudarHorariosEspecificosContainer;
    if (!container) return;
    
    container.innerHTML = '<h3>Horários Específicos Preferidos</h3>';
    
    // Para cada período selecionado, mostrar os horários disponíveis
    appState.selectedPreferenciasHorario.periodos.forEach(periodo => {
        const horarios = appState.horariosPorPeriodo[periodo];
        if (horarios) {
            const periodoSection = document.createElement('div');
            periodoSection.className = 'periodo-section';
            periodoSection.innerHTML = `<h4>${periodo}</h4>`;
            
            const horariosGrid = document.createElement('div');
            horariosGrid.className = 'horarios-grid';
            
            horarios.forEach(horario => {
                const horarioBtn = document.createElement('button');
                horarioBtn.type = 'button';
                horarioBtn.className = 'horario-button';
                horarioBtn.textContent = horario;
                horarioBtn.dataset.periodo = periodo;
                horarioBtn.dataset.horario = horario;
                
                // Verificar se já está selecionado
                const jaSelecionado = appState.selectedPreferenciasHorario.horariosEspecificos.some(h => 
                    h.periodo === periodo && h.horario === horario
                );
                
                if (jaSelecionado) {
                    horarioBtn.classList.add('selected');
                }
                
                horarioBtn.addEventListener('click', () => {
                    toggleHorarioEspecificoMudarHorario(horarioBtn, periodo, horario);
                });
                
                horariosGrid.appendChild(horarioBtn);
            });
            
            periodoSection.appendChild(horariosGrid);
            container.appendChild(periodoSection);
        }
    });
}

function toggleHorarioEspecificoMudarHorario(botao, periodo, horario) {
    botao.classList.toggle('selected');
    
    const horarioObj = { periodo, horario };
    const arrayHorarios = appState.selectedPreferenciasHorario.horariosEspecificos;
    const index = arrayHorarios.findIndex(h => 
        h.periodo === periodo && h.horario === horario
    );
    
    if (index > -1) {
        // Remover se já estiver selecionado
        arrayHorarios.splice(index, 1);
    } else {
        // Adicionar se não estiver selecionado
        arrayHorarios.push(horarioObj);
    }
    
    atualizarResumoSelecaoMudarHorario();
}

function atualizarResumoSelecaoMudarHorario() {
    const resumo = elements.mudarSelectedPreferencesDisplay;
    const summaryContainer = elements.mudarScheduleSummary;
    
    if (!resumo || !summaryContainer) return;
    
    if (appState.selectedPreferenciasHorario.diasSemana.length === 0 && 
        appState.selectedPreferenciasHorario.periodos.length === 0 && 
        appState.selectedPreferenciasHorario.horariosEspecificos.length === 0) {
        summaryContainer.style.display = 'none';
        return;
    }
    
    let htmlResumo = '';
    
    // Dias selecionados
    if (appState.selectedPreferenciasHorario.diasSemana.length > 0) {
        htmlResumo += `<p><strong>Dias Preferidos:</strong> ${appState.selectedPreferenciasHorario.diasSemana.join(', ')}</p>`;
    }
    
    // Períodos selecionados
    if (appState.selectedPreferenciasHorario.periodos.length > 0) {
        htmlResumo += `<p><strong>Períodos Preferidos:</strong> ${appState.selectedPreferenciasHorario.periodos.join(', ')}</p>`;
    }
    
    // Horários específicos selecionados
    if (appState.selectedPreferenciasHorario.horariosEspecificos.length > 0) {
        // Agrupar horários por período para melhor exibição
        const horariosPorPeriodo = {};
        appState.selectedPreferenciasHorario.horariosEspecificos.forEach(h => {
            if (!horariosPorPeriodo[h.periodo]) {
                horariosPorPeriodo[h.periodo] = [];
            }
            horariosPorPeriodo[h.periodo].push(h.horario);
        });
        
        htmlResumo += `<p><strong>Horários Preferenciais:</strong></p>`;
        Object.keys(horariosPorPeriodo).forEach(periodo => {
            htmlResumo += `<p style="margin-left: 10px;">${periodo}: ${horariosPorPeriodo[periodo].join(', ')}</p>`;
        });
    }
    
    resumo.innerHTML = htmlResumo;
    summaryContainer.style.display = 'block';
}

function carregarPreferenciasSalvas() {
    // Simular carregamento de preferências salvas (em uma aplicação real, isso viria de uma API)
    const preferenciasSalvas = JSON.parse(localStorage.getItem('preferenciasHorarioPaciente') || 'null');
    
    if (preferenciasSalvas) {
        appState.selectedPreferenciasHorario = preferenciasSalvas;
        
        // Atualizar interface com as preferências salvas
        atualizarInterfaceComPreferenciasSalvas();
        showToast('Preferências carregadas com sucesso!', 'success');
    }
}

function atualizarInterfaceComPreferenciasSalvas() {
    // Atualizar botões de dias da semana
    document.querySelectorAll('#mudar-dias-semana-container .selection-button').forEach(botao => {
        const valor = botao.dataset.value;
        if (appState.selectedPreferenciasHorario.diasSemana.includes(valor)) {
            botao.classList.add('selected');
        } else {
            botao.classList.remove('selected');
        }
    });
    
    // Atualizar botões de períodos
    document.querySelectorAll('#mudar-periodos-container .selection-button').forEach(botao => {
        const valor = botao.dataset.value;
        if (appState.selectedPreferenciasHorario.periodos.includes(valor)) {
            botao.classList.add('selected');
        } else {
            botao.classList.remove('selected');
        }
    });
    
    // Atualizar interface
    atualizarInterfaceAposSelecaoMudarHorario();
}

async function salvarPreferenciasHorario() {
    // Validação mínima
    if (appState.selectedPreferenciasHorario.diasSemana.length === 0) {
        showToast('Por favor, selecione pelo menos um dia da semana.', 'error');
        return;
    }
    
    if (appState.selectedPreferenciasHorario.periodos.length === 0) {
        showToast('Por favor, selecione pelo menos um período.', 'error');
        return;
    }
    
    if (appState.selectedPreferenciasHorario.horariosEspecificos.length === 0) {
        showToast('Por favor, selecione pelo menos um horário específico.', 'error');
        return;
    }
    
    showSpinner();

    try {
        // Simular salvamento (em uma aplicação real, isso seria uma chamada API)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Salvar no localStorage para demonstração
        localStorage.setItem('preferenciasHorarioPaciente', JSON.stringify(appState.selectedPreferenciasHorario));
        
        showToast('Preferências de horário salvas com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar preferências:', error);
        showToast('Erro ao salvar preferências. Tente novamente.', 'error');
    } finally {
        hideSpinner();
    }
}

function limparPreferenciasHorario() {
    // Limpar estado
    appState.selectedPreferenciasHorario = {
        diasSemana: [],
        periodos: [],
        horariosEspecificos: []
    };
    
    // Limpar interface
    document.querySelectorAll('#mudar-dias-semana-container .selection-button').forEach(botao => {
        botao.classList.remove('selected');
    });
    
    document.querySelectorAll('#mudar-periodos-container .selection-button').forEach(botao => {
        botao.classList.remove('selected');
    });
    
    if (elements.mudarHorariosEspecificosContainer) {
        elements.mudarHorariosEspecificosContainer.innerHTML = '';
        elements.mudarHorariosEspecificosContainer.style.display = 'none';
    }
    if (elements.mudarScheduleSummary) {
        elements.mudarScheduleSummary.style.display = 'none';
    }
    
    // Limpar do localStorage
    localStorage.removeItem('preferenciasHorarioPaciente');
    
    showToast('Preferências limpas com sucesso!', 'success');
}

// =============================================================================
// MINHA CONTA - FUNCIONALIDADES COMPLETAS
// =============================================================================

function habilitarEdicao() {
    if (!elements.inputsMeusDados || elements.inputsMeusDados.length === 0) {
        console.error('Elementos de inputs não encontrados');
        return;
    }
    
    elements.inputsMeusDados.forEach(input => {
        if (input.id !== 'nome-completo' && input.id !== 'data-nascimento' && input.id !== 'cpf') {
            input.disabled = false;
        }
    });
    showToast("Campos habilitados para edição.", "info");
}

function salvarDados() {
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
            if (elements.inputsMeusDados) {
                elements.inputsMeusDados.forEach(input => {
                    if (input.id !== 'nome-completo' && input.id !== 'data-nascimento' && input.id !== 'cpf') {
                        input.disabled = true;
                    }
                });
            }
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
    if (elements.notifEmail) {
        elements.notifEmail.checked = appState.preferenciasNotificacao.email;
    }
    if (elements.notifApp) {
        elements.notifApp.checked = appState.preferenciasNotificacao.app;
    }
}

function salvarNotificacoes() {
    showSpinner();
    setTimeout(() => {
        hideSpinner();
        if (elements.notifEmail) {
            appState.preferenciasNotificacao.email = elements.notifEmail.checked;
        }
        if (elements.notifApp) {
            appState.preferenciasNotificacao.app = elements.notifApp.checked;
        }
        showToast("Preferências de notificação salvas (simulado)!", "success");
    }, 800);
}

async function mudarSenha() {
    console.log("DEBUG: Função mudarSenha() chamada");
    
    if (!elements.senhaAtualInput || !elements.novaSenhaInput || !elements.confirmarNovaSenhaInput) {
        console.error("Elementos de senha não encontrados");
        showToast("Erro: Campos de senha não carregados corretamente.", "error");
        return;
    }

    const senhaAtual = elements.senhaAtualInput.value;
    const novaSenha = elements.novaSenhaInput.value;
    const confirmarNovaSenha = elements.confirmarNovaSenhaInput.value;

    // Limpar mensagens de erro anteriores e estilos
    limparErrosSenha();

    let hasError = false;

    // Validações básicas
    if (!senhaAtual) {
        mostrarErro('error-senha-atual', 'Digite sua senha atual.');
        elements.senhaAtualInput.classList.add('error');
        hasError = true;
    }

    if (!novaSenha) {
        mostrarErro('error-nova-senha', 'Digite sua nova senha.');
        elements.novaSenhaInput.classList.add('error');
        hasError = true;
    } else if (novaSenha.length < 6) {
        mostrarErro('error-nova-senha', 'A nova senha deve ter no mínimo 6 caracteres.');
        elements.novaSenhaInput.classList.add('error');
        hasError = true;
    }

    if (!confirmarNovaSenha) {
        mostrarErro('error-confirmar-nova-senha', 'Confirme sua nova senha.');
        elements.confirmarNovaSenhaInput.classList.add('error');
        hasError = true;
    } else if (novaSenha !== confirmarNovaSenha) {
        mostrarErro('error-confirmar-nova-senha', 'As senhas não coincidem.');
        elements.confirmarNovaSenhaInput.classList.add('error');
        hasError = true;
    }

    if (hasError) {
        showToast("Por favor, corrija os erros no formulário.", "error");
        return;
    }

    showSpinner();

    try {
        // Chamada API real para alterar senha
        const response = await fetch('/api/paciente/alterar-senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                senha_atual: senhaAtual,
                nova_senha: novaSenha,
                confirmar_senha: confirmarNovaSenha
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Senha alterada com sucesso!", "success");
            // Limpar campos
            limparFormularioSenha();
        } else {
            // Tratar erros específicos do servidor
            if (data.error && data.error.includes('senha atual')) {
                mostrarErro('error-senha-atual', 'Senha atual incorreta.');
                elements.senhaAtualInput.classList.add('error');
                showToast("Senha atual incorreta. Tente novamente.", "error");
            } else {
                showToast(data.error || "Erro ao alterar senha. Tente novamente.", "error");
            }
        }

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        showToast("Erro de conexão. Tente novamente.", "error");
    } finally {
        hideSpinner();
    }
}

// Funções auxiliares para manipulação de erros
function limparErrosSenha() {
    // Limpar mensagens de erro
    const errorElements = [
        'error-senha-atual',
        'error-nova-senha', 
        'error-confirmar-nova-senha'
    ];
    
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('show');
            element.textContent = '';
        }
    });
    
    // Limpar classes de erro dos inputs
    if (elements.senhaAtualInput) elements.senhaAtualInput.classList.remove('error');
    if (elements.novaSenhaInput) elements.novaSenhaInput.classList.remove('error');
    if (elements.confirmarNovaSenhaInput) elements.confirmarNovaSenhaInput.classList.remove('error');
}

function mostrarErro(elementId, mensagem) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = mensagem;
        element.classList.add('show');
    }
}

function limparFormularioSenha() {
    if (elements.senhaAtualInput) elements.senhaAtualInput.value = '';
    if (elements.novaSenhaInput) elements.novaSenhaInput.value = '';
    if (elements.confirmarNovaSenhaInput) elements.confirmarNovaSenhaInput.value = '';
    limparErrosSenha();
}

// Adicionar event listeners para limpar erros quando o usuário digitar
document.addEventListener('DOMContentLoaded', function() {
    // Limpar erro da senha atual ao digitar
    if (elements.senhaAtualInput) {
        elements.senhaAtualInput.addEventListener('input', function() {
            this.classList.remove('error');
            const errorElement = document.getElementById('error-senha-atual');
            if (errorElement) errorElement.classList.remove('show');
        });
    }
    
    // Limpar erro da nova senha ao digitar
    if (elements.novaSenhaInput) {
        elements.novaSenhaInput.addEventListener('input', function() {
            this.classList.remove('error');
            const errorElement = document.getElementById('error-nova-senha');
            if (errorElement) errorElement.classList.remove('show');
        });
    }
    
    // Limpar erro da confirmação ao digitar
    if (elements.confirmarNovaSenhaInput) {
        elements.confirmarNovaSenhaInput.addEventListener('input', function() {
            this.classList.remove('error');
            const errorElement = document.getElementById('error-confirmar-nova-senha');
            if (errorElement) errorElement.classList.remove('show');
        });
    }
});

// =============================================================================
// MINHAS CONSULTAS - FUNCIONALIDADES COMPLETAS
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

// Função melhorada para carregar consultas do paciente
async function atualizarListaConsultas() {
    if (!elements.containerMeusAgendamentos || !elements.noAppointmentsMessage) {
        console.error('Elementos de consultas não encontrados');
        return;
    }
    
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

        // Filtrar apenas consultas ativas (solicitações pendentes e consultas confirmadas)
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
                let dataFormatada = 'Data não disponível';
                if (agendamento.data_solicitacao) {
                    try {
                        const dataSolicitacao = new Date(agendamento.data_solicitacao);
                        if (!isNaN(dataSolicitacao.getTime())) {
                            dataFormatada = `Enviada em: ${dataSolicitacao.toLocaleDateString('pt-BR')} às ${dataSolicitacao.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
                        }
                    } catch (e) {
                        console.error('Erro ao formatar data:', e);
                    }
                }
                detalhesAgendamento.textContent = dataFormatada;
            } else {
                tituloAgendamento.textContent = `Consulta Agendada`;
                let dataInfo = 'Data: A definir';
                let horarioInfo = '';
                
                if (agendamento.data_agendamento) {
                    try {
                        const dataAg = new Date(agendamento.data_agendamento);
                        if (!isNaN(dataAg.getTime())) {
                            dataInfo = `Data: ${dataAg.toLocaleDateString('pt-BR')}`;
                            horarioInfo = `Horário: ${dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                        }
                    } catch (e) {
                        console.error('Erro ao formatar data:', e);
                    }
                }
                
                detalhesAgendamento.innerHTML = `
                    ${dataInfo}<br>
                    ${horarioInfo}<br>
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
            botaoDetalhes.onclick = () => mostrarDetalhesConsulta(agendamento);
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

// Função melhorada para mostrar detalhes da consulta com sistema de rolagem
function mostrarDetalhesConsulta(consulta) {
    console.log("[mostrarDetalhesConsulta] Iniciada com consulta:", consulta);
    appState.consultaEmContexto = consulta;
    
    if (!elements.modalDetalhesConsulta) {
        console.error('Modal de detalhes não encontrado');
        return;
    }
    
    // Criar estrutura do modal com scroll mantendo design original
    elements.modalDetalhesConsulta.innerHTML = `
        <div class="modal-content">
            <div class="detalhes-consulta-header">
                <h2>Detalhes da Consulta</h2>
            </div>
            <div class="detalhes-consulta-body" id="detalhes-consulta-body">
                <div class="detalhes-consulta-container">
                    <!-- Conteúdo será preenchido aqui mantendo o design original -->
                </div>
            </div>
            <div class="detalhes-consulta-footer">
                <button class="action-button secondary" onclick="fecharModalDetalhes()">Fechar</button>
            </div>
        </div>
    `;
    
    const container = document.querySelector('.detalhes-consulta-container');
    
    if (!container) {
        console.error('Container de detalhes não encontrado');
        return;
    }
    
    // Adicionar loading state
    container.innerHTML = `
        <div class="detalhes-loading">
            <div class="spinner" style="width: 40px; height: 40px; border-width: 4px;"></div>
            <p style="margin-top: 1rem;">Carregando detalhes da consulta...</p>
        </div>
    `;
    
    // Simular carregamento (em produção, remover este timeout)
    setTimeout(() => {
        preencherDetalhesConsulta(container, consulta);
    }, 500);
    
    openModal(elements.modalDetalhesConsulta);
}

// Função para preencher os detalhes da consulta mantendo design original
function preencherDetalhesConsulta(container, consulta) {
    if (!consulta) {
        container.innerHTML = `
            <div class="detalhes-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#dc3545">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h3 style="margin: 1rem 0 0.5rem 0;">Erro ao carregar</h3>
                <p>Não foi possível carregar os detalhes da consulta.</p>
            </div>
        `;
        return;
    }

    let dataExibicao = "A definir";
    let horarioExibicao = "A definir";

    if (consulta.data_agendamento) {
        try {
            const dataAg = new Date(consulta.data_agendamento);
            if (!isNaN(dataAg.getTime())) {
                dataExibicao = dataAg.toLocaleDateString('pt-BR');
                horarioExibicao = dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
        } catch (e) {
            console.error('Erro ao formatar data de agendamento:', e);
        }
    } else if (consulta.tipo_atendimento === 'Solicitação de Triagem' && consulta.data_solicitacao) {
        try {
            const dataSol = new Date(consulta.data_solicitacao);
            if (!isNaN(dataSol.getTime())) {
                dataExibicao = `Solicitado em ${dataSol.toLocaleDateString('pt-BR')}`;
                horarioExibicao = dataSol.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
        } catch (e) {
            console.error('Erro ao formatar data de solicitação:', e);
        }
    }

    const tipoAtendimento = consulta.tipo_atendimento === 'Solicitação de Triagem' ? 'Solicitação de Triagem' : 'Consulta';
    const statusClass = consulta.status.replace('_', '-');

    let html = `
        <div class="detalhes-consulta-info">
            <div class="detalhes-consulta-item">
                <span class="detalhes-consulta-label">Tipo:</span>
                <span class="detalhes-consulta-valor">${tipoAtendimento}</span>
            </div>
            
            <div class="detalhes-consulta-item">
                <span class="detalhes-consulta-label">Estagiário(a):</span>
                <span class="detalhes-consulta-valor">${consulta.estagiario_nome || (consulta.tipo_atendimento === 'Solicitação de Triagem' ? 'Aguardando atribuição' : 'Não definido')}</span>
            </div>
            
            <div class="detalhes-consulta-item">
                <span class="detalhes-consulta-label">Data:</span>
                <span class="detalhes-consulta-valor">${dataExibicao}</span>
            </div>
            
            <div class="detalhes-consulta-item">
                <span class="detalhes-consulta-label">Horário:</span>
                <span class="detalhes-consulta-valor">${horarioExibicao}</span>
            </div>
            
            <div class="detalhes-consulta-item">
                <span class="detalhes-consulta-label">Local:</span>
                <span class="detalhes-consulta-valor">COEPP - Fundação Santo André (Sala a ser definida)</span>
            </div>
            
            <div class="detalhes-consulta-item">
                <span class="detalhes-consulta-label">Status:</span>
                <span class="detalhes-consulta-valor">
                    <span class="status-text ${statusClass}">
                        ${consulta.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                </span>
            </div>
        </div>
    `;

    // Adicionar observações se existirem
    if (consulta.observacoes_estagiario) {
        html += `
            <div class="detalhes-consulta-item">
                <span class="detalhes-consulta-label">Observações:</span>
                <span class="detalhes-consulta-valor">${consulta.observacoes_estagiario}</span>
            </div>
        `;
    }

    // Adicionar ações se a consulta não estiver cancelada ou finalizada
    if (consulta.status !== 'cancelado_paciente' && consulta.status !== 'cancelado_estagiario' && consulta.status !== 'finalizado') {
        html += `
            <div class="detalhes-consulta-acoes">
                <button class="action-button danger" id="btn-detalhes-cancelar-${consulta.id}">
                    Cancelar ${consulta.tipo_atendimento === 'Solicitação de Triagem' ? 'Solicitação' : 'Consulta'}
                </button>
                ${consulta.data_agendamento ? `
                    <button class="action-button warning" disabled>
                        Reagendar (Em breve)
                    </button>
                ` : ''}
            </div>
        `;
    }

    container.innerHTML = html;

    // Configurar evento do botão de cancelamento
    setTimeout(() => {
        const cancelButton = document.getElementById(`btn-detalhes-cancelar-${consulta.id}`);
        if (cancelButton) {
            console.log(`[preencherDetalhesConsulta] Botão #btn-detalhes-cancelar-${consulta.id} ENCONTRADO.`);
            cancelButton.onclick = () => {
                console.log(`[preencherDetalhesConsulta] Botão cancelar clicado para consulta:`, consulta);
                abrirModalConfirmarCancelamento(consulta);
            };
        } else {
            console.log(`[preencherDetalhesConsulta] Botão de cancelamento não encontrado (pode ser normal para consultas finalizadas/canceladas)`);
        }
    }, 100);
}

// Função atualizada para fechar o modal
function fecharModalDetalhes() {
    if (elements.modalDetalhesConsulta) {
        // Restaurar estrutura original do modal para próxima abertura
        elements.modalDetalhesConsulta.innerHTML = `
            <div class="modal-content">
                <h2>Detalhes da Consulta</h2>
                <div id="detalhes-consulta-conteudo">
                    <!-- Conteúdo será preenchido dinamicamente -->
                </div>
                <div class="modal-action-buttons">
                    <button class="action-button secondary" onclick="fecharModalDetalhes()">Fechar</button>
                </div>
            </div>
        `;
        
        // Atualizar referência ao conteúdo
        elements.detalhesConsultaConteudo = document.getElementById('detalhes-consulta-conteudo');
    }
    
    closeModal(elements.modalDetalhesConsulta);
}

async function executarCancelamentoFinal() {
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
            fecharModalConfirmarCancelamento();
            await atualizarListaConsultas();
            mostrarPagina('pagina-consultas');
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

function abrirModalConfirmarCancelamento(consulta) {
    if (!consulta) {
        showToast('Erro: Nenhuma consulta selecionada.', 'error');
        return;
    }
    appState.consultaEmContexto = consulta;
    openModal(elements.modalConfirmarCancelamento);
}

function fecharModalConfirmarCancelamento() {
    closeModal(elements.modalConfirmarCancelamento);
}

function fecharModalDetalhes() {
    closeModal(elements.modalDetalhesConsulta);
}

// =============================================================================
// CONSULTA CONFIRMADA - FUNCIONALIDADES
// =============================================================================

function gerarQRCode() {
    const qrCodeContainer = elements.consultaConfirmadaQrcode;
    if (!qrCodeContainer) return;
    
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

function baixarQRCode() {
    const qrCodeImg = elements.consultaConfirmadaQrcode ? elements.consultaConfirmadaQrcode.querySelector('img') : null;
    
    if (!qrCodeImg) {
        showToast('Erro: QR Code não encontrado.', "error");
        return;
    }
    
    const downloadLink = document.createElement('a');
    
    const dataFormatada = elements.consultaConfirmadaData ? elements.consultaConfirmadaData.textContent.replace(/\//g, '-') : 'data';
    const horario = elements.consultaConfirmadaHorario ? elements.consultaConfirmadaHorario.textContent.replace('h', '-') : 'hora';
    const fileName = `consulta_${dataFormatada}_${horario}.png`;
    
    downloadLink.href = qrCodeImg.src;
    downloadLink.download = fileName;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showToast('QR Code baixado com sucesso!', "success");
}

// =============================================================================
// NÃO POSSO COMPARECER - FUNCIONALIDADES
// =============================================================================

function mostrarPaginaNaoPosso(consulta) {
    appState.consultaEmContexto = consulta;
    mostrarPagina('pagina-nao-posso-comparecer');
}

function fecharNaoPosso() {
    mostrarPagina('pagina-consultas');
    if (elements.motivoNaoPosso) {
        elements.motivoNaoPosso.value = '';
    }
    appState.consultaEmContexto = null;
}

function enviarNaoPosso() {
    if (!appState.consultaEmContexto) {
        showToast('Erro: Nenhuma consulta selecionada.');
        return;
    }
    
    const motivo = elements.motivoNaoPosso ? elements.motivoNaoPosso.value : '';
    if (!motivo.trim()) {
        showToast('Por favor, informe o motivo da sua ausência.', "error");
        return;
    }
    
    showSpinner();
    setTimeout(() => {
        hideSpinner();
        if (appState.consultaEmContexto) {
            executarCancelamentoFinal();
            mostrarPagina('pagina-consultas');
            if (elements.motivoNaoPosso) {
                elements.motivoNaoPosso.value = '';
            }
            appState.consultaEmContexto = null;
            showToast('Solicitação de cancelamento enviada.', "success");
        } else {
            showToast('Erro ao cancelar consulta.', "error");
        }
    }, 1500);
}

// =============================================================================
// EVENT LISTENERS E INICIALIZAÇÃO
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded disparado!");
    mostrarPagina('pagina-principal');

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
                mostrarPagina(link.dataset.page);
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
    if (editButton) editButton.addEventListener('click', habilitarEdicao);
    
    const saveAccountButton = document.querySelector('#sub-aba-meus-dados .action-buttons .action-button.primary');
    if (saveAccountButton) saveAccountButton.addEventListener('click', salvarDados);
    
    const saveNotifButton = document.querySelector('#sub-aba-notificacoes .action-button.primary');
    if (saveNotifButton) saveNotifButton.addEventListener('click', salvarNotificacoes);
    
    const changePassButton = document.querySelector('#sub-aba-mudar-senha .action-button.primary');
    if (changePassButton) changePassButton.addEventListener('click', mudarSenha);

    // Eventos da página "Horários de Triagem"
    if (elements.confirmSelectionButton) {
        elements.confirmSelectionButton.addEventListener('click', validarEabrirModalTriagem);
    }

    // Eventos da página "Mudar Horário"
    if (elements.mudarConfirmSelectionButton) {
        elements.mudarConfirmSelectionButton.addEventListener('click', salvarPreferenciasHorario);
    }

    // Eventos dos Modais
    document.querySelector('#modal-detalhes-consulta .modal-action-buttons .action-button.secondary')?.addEventListener('click', fecharModalDetalhes);
    document.querySelector('#modal-triagem .modal-action-buttons .action-button.secondary')?.addEventListener('click', () => closeModal(elements.modalTriagem));
    document.querySelector('#modal-triagem .modal-action-buttons .action-button.primary')?.addEventListener('click', enviarSolicitacaoTriagem);
    document.querySelector('#modal-confirmar-cancelamento .modal-action-buttons .action-button.secondary')?.addEventListener('click', fecharModalConfirmarCancelamento);
    
    if (elements.btnConfirmarCancelamentoFinal) {
        console.log("[DOMContentLoaded] Botão #btn-confirmar-cancelamento-final ENCONTRADO. Adicionando listener.");
        elements.btnConfirmarCancelamentoFinal.addEventListener('click', executarCancelamentoFinal);
    } else {
        console.error("[DOMContentLoaded] ERRO: Botão #btn-confirmar-cancelamento-final NÃO encontrado no DOM.");
    }

    // Eventos da Página "Consulta Confirmada"
    document.querySelector('.consulta-confirmada-download')?.addEventListener('click', baixarQRCode);
    document.querySelector('.consulta-confirmada-voltar')?.addEventListener('click', () => mostrarPagina('pagina-consultas'));

    // Eventos da Página "Não Posso Comparecer"
    document.querySelector('#pagina-nao-posso-comparecer .action-button.secondary')?.addEventListener('click', fecharNaoPosso);
    document.querySelector('#pagina-nao-posso-comparecer .action-button.primary')?.addEventListener('click', enviarNaoPosso);
});

// =============================================================================
// MAPEAMENTO PARA FUNÇÕES GLOBAIS (compatibilidade com onclick no HTML)
// =============================================================================

window.mostrarPagina = mostrarPagina;
window.mostrarSubAba = mostrarSubAba;

// Página "Minha Conta"
window.habilitarEdicao = habilitarEdicao;
window.salvarDados = salvarDados;
window.salvarNotificacoes = salvarNotificacoes;
window.mudarSenha = mudarSenha;

// Página "Horários de Triagem"
window.validarEabrirModalTriagem = validarEabrirModalTriagem;
window.enviarSolicitacaoTriagem = enviarSolicitacaoTriagem;
window.fecharModalTriagem = () => closeModal(elements.modalTriagem);

// Página "Mudar Horário"
window.salvarPreferenciasHorario = salvarPreferenciasHorario;
window.limparPreferenciasHorario = limparPreferenciasHorario;

// Página "Minhas Consultas"
window.atualizarListaConsultas = atualizarListaConsultas;
window.mostrarDetalhesConsulta = mostrarDetalhesConsulta;
window.fecharModalDetalhes = fecharModalDetalhes;
window.cancelarConsulta = () => abrirModalConfirmarCancelamento(appState.consultaEmContexto);
window.abrirModalConfirmarCancelamento = abrirModalConfirmarCancelamento;
window.fecharModalConfirmarCancelamento = fecharModalConfirmarCancelamento;
window.executarCancelamentoFinal = executarCancelamentoFinal;

// Página "Consulta Confirmada"
window.gerarQRCode = gerarQRCode;
window.baixarQRCode = baixarQRCode;

// Página "Não Posso Comparecer"
window.mostrarPaginaNaoPosso = mostrarPaginaNaoPosso;
window.enviarNaoPosso = enviarNaoPosso;
window.fecharNaoPosso = fecharNaoPosso;

console.log("DEBUG: aba_paciente.js completamente carregado e inicializado");
