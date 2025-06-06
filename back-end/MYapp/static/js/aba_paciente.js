let consultasAgendadas = [
    {
        estagiario: "Equipe de Triagem",
        diaSemana: "Quarta-feira",
        periodo: "Tarde",
        hora: "14:00",
        tipo: "Triagem",
        local: "Online (via Google Meet)",
        status: "pendente"
    },
    {
        estagiario: "Mariana Silva",
        data: "2025-06-01",
        hora: "10:00",
        tipo: "Presencial",
        local: "Sala 12, COEPP - Fundação Santo André",
        status: "pendente"
    },
    {
        estagiario: "João Pereira",
        data: "2025-05-25",
        hora: "16:00",
        tipo: "Online",
        local: "Link enviado por e-mail",
        status: "confirmado"
    }
];
let diaSemanaSelecionado = null;
let periodoSelecionado = null;
let horarioEspecificoSelecionado = null;
let botaoHorarioAtivo = null;
let consultaEmContexto = null; // Variável para armazenar a consulta em ação (confirmar, cancelar, etc.)

let preferenciasNotificacao = {
    email: true,
    sms: false,
    app: true,
    ofertas: false
};

const horariosPorPeriodo = {
    'Manhã': ["08:00", "09:00", "10:00", "11:00"],
    'Tarde': ["13:00", "14:00", "15:00", "16:00"],
    'Noite': ["18:00", "19:00", "20:00", "21:00"]
};

function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

window.onclick = function(event) {
    const dropdown = document.getElementById('dropdownMenu');
    const profile = document.querySelector('.profile');
    if (dropdown && profile && !profile.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
}

// *** FUNÇÃO CORRIGIDA ***
function mostrarPagina(idPagina) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const paginaAtiva = document.getElementById(idPagina);
    if (paginaAtiva) {
        paginaAtiva.classList.add('active');
    }

    // CORREÇÃO: Fecha todos os modais de forma genérica, sem chamar
    // as funções 'fechar...' que limpam o contexto da consulta.
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.classList.remove('modal-active');

    if (idPagina === 'pagina-consultas') {
        atualizarListaConsultas();
    }
    if (idPagina === 'pagina-horarios-triagem') {
        // Resetar os campos da triagem ao entrar na página
        document.getElementById('select-dia-semana').value = "";
        document.getElementById('select-periodo').value = "";
        document.getElementById('time-slots-grid').innerHTML = '';
        document.getElementById('schedule-summary').style.display = 'none';
        diaSemanaSelecionado = null;
        periodoSelecionado = null;
        horarioEspecificoSelecionado = null;
        if (botaoHorarioAtivo) {
            botaoHorarioAtivo.classList.remove('selected');
            botaoHorarioAtivo = null;
        }
        document.getElementById('error-dia-semana').textContent = '';
        document.getElementById('error-periodo').textContent = '';
        document.getElementById('error-horario-especifico').textContent = '';
    }
    if (idPagina === 'pagina-meus-dados') {
        mostrarSubAba('sub-aba-meus-dados', document.querySelector('.tabs-navigation .tab-button'));
        carregarPreferenciasNotificacao();
    }
}


function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function calcularHoraFim(horaInicio) {
    if (!horaInicio) return '';
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const data = new Date();
    data.setHours(horas, minutos, 0, 0);
    data.setHours(data.getHours() + 1);
    return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

function mostrarLoading(mostrar) {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = mostrar ? 'block' : 'none';
}

function mostrarToast(mensagem) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function atualizarListaConsultas() {
    const container = document.getElementById('container-meus-agendamentos');
    const noAppointmentsMessage = document.getElementById('no-appointments-message');

    if (!container || !noAppointmentsMessage) return;

    while (container.children.length > 0) {
        container.removeChild(container.lastChild);
    }

    const consultasExibidas = consultasAgendadas.filter(c => c.status !== 'cancelado');

    if (consultasExibidas.length === 0) {
        noAppointmentsMessage.style.display = 'flex';
        container.style.display = 'none';
    } else {
        noAppointmentsMessage.style.display = 'none';
        container.style.display = 'grid';

        consultasExibidas.sort((a, b) => {
            const diasOrdem = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
            if (a.data && b.data) {
                return new Date(`${a.data}T${a.hora}:00`) - new Date(`${b.data}T${b.hora}:00`);
            } else if (a.data) return -1;
            else if (b.data) return 1;
            else {
                const indexA = diasOrdem.indexOf(a.diaSemana);
                const indexB = diasOrdem.indexOf(b.diaSemana);
                if (indexA !== indexB) return indexA - indexB;
                return a.hora.localeCompare(b.hora);
            }
        });

        consultasExibidas.forEach(consulta => {
            const card = document.createElement('div');
            card.className = 'card';

            const cardInfo = document.createElement('div');
            cardInfo.className = 'card-info';

            const tituloAgendamento = document.createElement('h3');
            if (consulta.tipo === "Triagem") {
                tituloAgendamento.textContent = `${consulta.diaSemana} - ${consulta.periodo}`;
            } else {
                const horaNum = parseInt(consulta.hora.split(':')[0]);
                const periodo = horaNum < 12 ? "Manhã" : "Tarde";
                tituloAgendamento.textContent = `${periodo} - ${formatarDataParaExibicao(consulta.data)}`;
            }

            const detalhesAgendamento = document.createElement('p');
            detalhesAgendamento.textContent = `${consulta.hora} - ${consulta.estagiario} (${consulta.tipo})`;

            cardInfo.appendChild(tituloAgendamento);
            cardInfo.appendChild(detalhesAgendamento);

            const cardActions = document.createElement('div');
            cardActions.className = 'card-actions';

            if (consulta.status === 'confirmado') {
                const confirmadoIcon = document.createElement('div');
                confirmadoIcon.className = 'confirmed-icon';
                confirmadoIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg><span>Confirmado</span>`;
                cardActions.appendChild(confirmadoIcon);
            } else {
                const btnConfirmar = document.createElement('button');
                btnConfirmar.textContent = 'Confirmar Presença';
                btnConfirmar.className = 'action-button small primary';
                btnConfirmar.onclick = () => abrirModalConfirmarPresenca(consulta);
                cardActions.appendChild(btnConfirmar);

                const btnNaoPosso = document.createElement('button');
                btnNaoPosso.textContent = 'Não Posso';
                btnNaoPosso.className = 'action-button small secondary';
                btnNaoPosso.onclick = () => mostrarPaginaNaoPosso(consulta);
                cardActions.appendChild(btnNaoPosso);
            }

            const botaoDetalhes = document.createElement('button');
            botaoDetalhes.textContent = 'Detalhes';
            botaoDetalhes.className = 'action-button small';
            botaoDetalhes.onclick = () => mostrarDetalhesConsulta(consulta);
            cardActions.appendChild(botaoDetalhes);

            card.appendChild(cardInfo);
            card.appendChild(cardActions);
            container.appendChild(card);
        });
    }
}

function mostrarDetalhesConsulta(consulta) {
    const modal = document.getElementById('modal-detalhes-consulta');
    const conteudo = document.getElementById('detalhes-consulta-conteudo');

    let dataExibicao = consulta.data ? formatarDataParaExibicao(consulta.data) : consulta.diaSemana;
    let horaFimExibicao = calcularHoraFim(consulta.hora);

    conteudo.innerHTML = `
        <p><strong>Estagiário/a:</strong> ${consulta.estagiario}</p>
        <p><strong>Data:</strong> ${dataExibicao}</p>
        <p><strong>Horário:</strong> ${consulta.hora} - ${horaFimExibicao}</p>
        <p><strong>Tipo:</strong> ${consulta.tipo}</p>
        <p><strong>Local:</strong> ${consulta.local}</p>
        <p><strong>Status:</strong> ${consulta.status === 'confirmado' ? 'Confirmado' : 'Pendente'}</p>
        <h3 style="margin-top: 20px;">Ações</h3>
        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: center;">
            <button class="action-button danger" onclick='cancelarConsulta()'>Cancelar</button>
            <button class="action-button warning">Reagendar</button>
        </div>
    `;
    
    consultaEmContexto = consulta;
    modal.classList.add('active');
    document.body.classList.add('modal-active');
}

function fecharModalDetalhes() {
    const modal = document.getElementById('modal-detalhes-consulta');
    modal.classList.remove('active');
    document.body.classList.remove('modal-active');
    consultaEmContexto = null;
}

function cancelarConsulta() {
    if (consultaEmContexto) {
        abrirModalConfirmarCancelamento(consultaEmContexto);
    } else {
        mostrarToast('Erro: Nenhuma consulta selecionada para cancelar.');
    }
}

function abrirModalConfirmarCancelamento(consulta) {
    if (!consulta) return;
    consultaEmContexto = consulta;
    const modal = document.getElementById('modal-confirmar-cancelamento');
    modal.classList.add('active');
    document.body.classList.add('modal-active');
    
    document.getElementById('btn-confirmar-cancelamento-final').onclick = executarCancelamentoFinal;
}

function fecharModalConfirmarCancelamento() {
    const modal = document.getElementById('modal-confirmar-cancelamento');
    modal.classList.remove('active');
    if (!document.querySelector('#modal-detalhes-consulta.active')) {
        document.body.classList.remove('modal-active');
    }
}

function executarCancelamentoFinal() {
    if (consultaEmContexto) {
        const index = consultasAgendadas.findIndex(c => c === consultaEmContexto);

        if (index > -1) {
            consultasAgendadas[index].status = 'cancelado';
            mostrarToast('Consulta cancelada com sucesso.');
        } else {
            mostrarToast('Erro ao cancelar consulta.');
        }

        fecharModalConfirmarCancelamento();
        fecharModalDetalhes(); // Garante que o modal de detalhes também feche
        mostrarPagina('pagina-consultas');
    }
}

function atualizarHorariosDisponiveis() {
    diaSemanaSelecionado = document.getElementById('select-dia-semana').value;
    periodoSelecionado = document.getElementById('select-periodo').value;
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    timeSlotsGrid.innerHTML = '';
    horarioEspecificoSelecionado = null;
    document.getElementById('schedule-summary').style.display = 'none';

    if (botaoHorarioAtivo) {
        botaoHorarioAtivo.classList.remove('selected');
        botaoHorarioAtivo = null;
    }

    document.getElementById('error-dia-semana').textContent = '';
    document.getElementById('error-periodo').textContent = '';
    document.getElementById('error-horario-especifico').textContent = '';

    if (diaSemanaSelecionado && periodoSelecionado) {
        const horarios = horariosPorPeriodo[periodoSelecionado];
        if (horarios && horarios.length > 0) {
            horarios.forEach(hora => {
                const timeButton = document.createElement('button');
                timeButton.className = 'time-slot-button';
                timeButton.textContent = `${hora} - ${calcularHoraFim(hora)}`;
                timeButton.dataset.time = hora;
                timeButton.onclick = () => selecionarHorarioEspecifico(timeButton);
                timeSlotsGrid.appendChild(timeButton);
            });
        } else {
            timeSlotsGrid.innerHTML = '<p class="no-slots-message">Nenhum horário disponível para este período.</p>';
        }
    } else {
        timeSlotsGrid.innerHTML = '<p class="no-slots-message">Selecione o Dia da Semana e o Período para ver os horários disponíveis.</p>';
    }
}

function selecionarHorarioEspecifico(timeButton) {
    if (botaoHorarioAtivo) {
        botaoHorarioAtivo.classList.remove('selected');
    }
    timeButton.classList.add('selected');
    botaoHorarioAtivo = timeButton;
    horarioEspecificoSelecionado = timeButton.dataset.time;

    document.getElementById('selected-weekday-display').textContent = diaSemanaSelecionado;
    document.getElementById('selected-period-display').textContent = periodoSelecionado;
    document.getElementById('selected-time-display').textContent = `${horarioEspecificoSelecionado} - ${calcularHoraFim(horarioEspecificoSelecionado)}`;
    document.getElementById('schedule-summary').style.display = 'block';
    document.getElementById('error-horario-especifico').textContent = '';
}

function validarEabrirModalTriagem() {
    let isValid = true;
    if (!diaSemanaSelecionado) {
        document.getElementById('error-dia-semana').textContent = 'Por favor, selecione um dia da semana.';
        isValid = false;
    }
    if (!periodoSelecionado) {
        document.getElementById('error-periodo').textContent = 'Por favor, selecione um período.';
        isValid = false;
    }
    if (!horarioEspecificoSelecionado) {
        document.getElementById('error-horario-especifico').textContent = 'Por favor, selecione um horário específico.';
        isValid = false;
    }
    if (isValid) {
        document.getElementById('triagem-info-confirmacao').textContent = `${diaSemanaSelecionado} - ${periodoSelecionado} às ${horarioEspecificoSelecionado}`;
        const modal = document.getElementById('modal-triagem');
        modal.classList.add('active');
        document.body.classList.add('modal-active');
    } else {
        mostrarToast('Por favor, preencha todos os campos obrigatórios.');
    }
}

function fecharModalTriagem() {
    const modal = document.getElementById('modal-triagem');
    modal.classList.remove('active');
}

function confirmarTriagem() {
    if (!diaSemanaSelecionado || !periodoSelecionado || !horarioEspecificoSelecionado) {
        mostrarToast('Erro: Informações da triagem incompletas.');
        fecharModalTriagem();
        return;
    }
    fecharModalTriagem();
    mostrarLoading(true);
    setTimeout(() => {
        mostrarLoading(false);
        const novoAgendamentoTriagem = {
            estagiario: "Equipe de Triagem",
            diaSemana: diaSemanaSelecionado,
            periodo: periodoSelecionado,
            hora: horarioEspecificoSelecionado,
            tipo: "Triagem",
            local: "Online (via Google Meet)",
            status: "pendente"
        };
        consultasAgendadas.push(novoAgendamentoTriagem);
        mostrarPagina('pagina-triagem-sucesso');
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarPagina('pagina-principal');
});

// Funções de "Minha Conta"
function habilitarEdicao() {
    document.querySelectorAll('#sub-aba-meus-dados input, #sub-aba-meus-dados select').forEach(input => {
        if (input.id !== 'nome-completo' && input.id !== 'data-nascimento' && input.id !== 'cpf') {
            input.disabled = false;
        }
    });
}

function salvarDados() {
    mostrarLoading(true);
    setTimeout(() => {
        mostrarLoading(false);
        mostrarToast('Dados salvos com sucesso!');
        document.querySelectorAll('#sub-aba-meus-dados input, #sub-aba-meus-dados select').forEach(input => {
            input.disabled = true;
        });
    }, 1000);
}

function carregarPreferenciasNotificacao() {
    document.getElementById('notif-email').checked = preferenciasNotificacao.email;
    document.getElementById('notif-sms').checked = preferenciasNotificacao.sms;
    document.getElementById('notif-app').checked = preferenciasNotificacao.app;
    document.getElementById('notif-ofertas').checked = preferenciasNotificacao.ofertas;
}

function salvarNotificacoes() {
    mostrarLoading(true);
    setTimeout(() => {
        mostrarLoading(false);
        preferenciasNotificacao.email = document.getElementById('notif-email').checked;
        preferenciasNotificacao.sms = document.getElementById('notif-sms').checked;
        preferenciasNotificacao.app = document.getElementById('notif-app').checked;
        preferenciasNotificacao.ofertas = document.getElementById('notif-ofertas').checked;
        mostrarToast('Preferências de notificação salvas com sucesso!');
    }, 1000);
}

function mudarSenha() {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarNovaSenha = document.getElementById('confirmar-nova-senha').value;
    
    // Limpar mensagens de erro anteriores
    document.getElementById('error-senha-atual').textContent = '';
    document.getElementById('error-nova-senha').textContent = '';
    document.getElementById('error-confirmar-nova-senha').textContent = '';
    
    let isValid = true;
    
    if (!senhaAtual) {
        document.getElementById('error-senha-atual').textContent = 'Por favor, digite sua senha atual.';
        isValid = false;
    }
    
    if (!novaSenha) {
        document.getElementById('error-nova-senha').textContent = 'Por favor, digite a nova senha.';
        isValid = false;
    } else if (novaSenha.length < 6) {
        document.getElementById('error-nova-senha').textContent = 'A senha deve ter pelo menos 6 caracteres.';
        isValid = false;
    }
    
    if (!confirmarNovaSenha) {
        document.getElementById('error-confirmar-nova-senha').textContent = 'Por favor, confirme a nova senha.';
        isValid = false;
    } else if (novaSenha !== confirmarNovaSenha) {
        document.getElementById('error-confirmar-nova-senha').textContent = 'As senhas não coincidem.';
        isValid = false;
    }
    
    if (isValid) {
        mostrarLoading(true);
        setTimeout(() => {
            mostrarLoading(false);
            mostrarToast('Senha alterada com sucesso!');
            document.getElementById('senha-atual').value = '';
            document.getElementById('nova-senha').value = '';
            document.getElementById('confirmar-nova-senha').value = '';
        }, 1500);
    }
}

function mostrarSubAba(idSubAba, botaoClicado) {
    // Esconde todas as sub-abas
    document.querySelectorAll('.sub-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove a classe 'active' de todos os botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostra a sub-aba selecionada
    document.getElementById(idSubAba).classList.add('active');
    
    // Adiciona a classe 'active' ao botão clicado
    botaoClicado.classList.add('active');
}

function abrirModalConfirmarPresenca(consulta) {
    consultaEmContexto = consulta;
    const modal = document.getElementById('modal-confirmar-presenca');
    modal.classList.add('active');
    document.body.classList.add('modal-active');
}

function fecharModalConfirmarPresenca() {
    const modal = document.getElementById('modal-confirmar-presenca');
    modal.classList.remove('active');
    document.body.classList.remove('modal-active');
    consultaEmContexto = null;
}

function mostrarPaginaNaoPosso(consulta) {
    consultaEmContexto = consulta;
    mostrarPagina('pagina-nao-posso-comparecer');
}

function fecharNaoPosso() {
    mostrarPagina('pagina-consultas');
    consultaEmContexto = null;
}

function enviarNaoPosso() {
    if (!consultaEmContexto) {
        mostrarToast('Erro: Nenhuma consulta selecionada.');
        return;
    }
    
    const motivo = document.getElementById('motivo-nao-posso').value;
    if (!motivo.trim()) {
        mostrarToast('Por favor, informe o motivo da sua ausência.');
        return;
    }
    
    mostrarLoading(true);
    setTimeout(() => {
        mostrarLoading(false);
        const index = consultasAgendadas.findIndex(c => c === consultaEmContexto);
        if (index > -1) {
            consultasAgendadas[index].status = 'cancelado';
            mostrarToast('Consulta cancelada com sucesso.');
            mostrarPagina('pagina-consultas');
            consultaEmContexto = null;
        } else {
            mostrarToast('Erro ao cancelar consulta.');
        }
    }, 1500);
}

// Função para confirmar presença na consulta e mostrar a nova tela
function confirmarPresencaConsulta() {
    if (!consultaEmContexto) {
        mostrarToast('Erro: Nenhuma consulta selecionada para confirmar.');
        return;
    }
    
    mostrarLoading(true);
    setTimeout(() => {
        mostrarLoading(false);
        
        // Atualiza o status da consulta para confirmado
        const index = consultasAgendadas.findIndex(c => c === consultaEmContexto);
        if (index > -1) {
            consultasAgendadas[index].status = 'confirmado';
            
            // Preenche os dados na tela de consulta confirmada
            const dataFormatada = consultaEmContexto.data 
                ? formatarDataParaExibicao(consultaEmContexto.data) 
                : "29/05/2029"; // Data padrão da imagem de referência
            
            const horarioFormatado = consultaEmContexto.hora.replace(':', 'h');
            
            document.getElementById('consulta-confirmada-data').textContent = dataFormatada;
            document.getElementById('consulta-confirmada-horario').textContent = horarioFormatado;
            document.getElementById('consulta-confirmada-local').textContent = consultaEmContexto.local;
            
            // Gera o QR Code
            gerarQRCode();
            
            // Fecha o modal e mostra a página de confirmação
            fecharModalConfirmarPresenca();
            mostrarPagina('pagina-consulta-confirmada');
        } else {
            mostrarToast('Erro ao confirmar consulta.');
        }
    }, 1500);
}

// Função para gerar o QR Code
function gerarQRCode() {
    const qrCodeContainer = document.getElementById('consulta-confirmada-qrcode');
    
    // Limpa o conteúdo anterior
    qrCodeContainer.innerHTML = '';
    
    // Cria o elemento de imagem para o QR Code
    const qrCodeImg = document.createElement('img');
    
    // Dados para o QR Code (informações da consulta)
    const consultaInfo = consultaEmContexto ? {
        paciente: "Paciente de Oliveira Santos",
        data: consultaEmContexto.data || "2029-05-29",
        hora: consultaEmContexto.hora,
        local: consultaEmContexto.local,
        tipo: consultaEmContexto.tipo,
        estagiario: consultaEmContexto.estagiario
    } : {
        paciente: "Paciente de Oliveira Santos",
        data: "2029-05-29",
        hora: "14:00",
        local: "Sala 12, COEPP - Fundação Santo André",
        tipo: "Presencial",
        estagiario: "Mariana Silva"
    };
    
    // Converte os dados para string JSON
    const qrData = JSON.stringify(consultaInfo);
    
    // Gera a URL para o QR Code usando a API do QR Server
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    // Define a URL da imagem
    qrCodeImg.src = qrCodeUrl;
    qrCodeImg.alt = "QR Code da consulta";
    qrCodeImg.style.width = "100%";
    qrCodeImg.style.height = "100%";
    
    // Adiciona a imagem ao container
    qrCodeContainer.appendChild(qrCodeImg);
}

// Função para baixar o QR Code
function baixarQRCode() {
    const qrCodeImg = document.querySelector('#consulta-confirmada-qrcode img');
    
    if (!qrCodeImg) {
        mostrarToast('Erro: QR Code não encontrado.');
        return;
    }
    
    // Cria um link temporário para download
    const downloadLink = document.createElement('a');
    
    // Define o nome do arquivo
    const dataFormatada = document.getElementById('consulta-confirmada-data').textContent.replace(/\//g, '-');
    const horario = document.getElementById('consulta-confirmada-horario').textContent;
    const fileName = `consulta_${dataFormatada}_${horario}.png`;
    
    // Configura o link para download
    downloadLink.href = qrCodeImg.src;
    downloadLink.download = fileName;
    
    // Adiciona o link ao documento, clica nele e depois remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    mostrarToast('QR Code baixado com sucesso!');
}