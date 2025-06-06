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
    // Simulação - em produção, usaria o ID do estagiário logado
    const estagiarioId = 1;
    const consultas = await fetchAPI(`/consultas/estagiario/${estagiarioId}`);
    
    if (consultas) {
        // Atualizar interface com as consultas
        atualizarCalendarioConsultas(consultas);
    }
}

async function confirmarTriagemAPI(consultaId) {
    const resultado = await fetchAPI(`/consultas/${consultaId}/confirmar-estagiario`, 'PUT');
    
    if (resultado) {
        mostrarToast('Triagem confirmada com sucesso!');
        // Recarregar consultas para atualizar a interface
        carregarConsultas();
    }
}

async function salvarDisponibilidadeAPI(disponibilidade) {
    const resultado = await fetchAPI('/disponibilidades', 'POST', disponibilidade);
    
    if (resultado) {
        abrirModalSucessoDisponibilidade();
    }
}

// Funções de navegação
function mostrarPagina(pagina) {
    // Ocultar todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar a página selecionada
    document.getElementById(pagina).classList.add('active');
    
    // Atualizar navegação lateral
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Encontrar e ativar o item de navegação correspondente
    const activeNavItem = document.querySelector(`.nav-item[onclick*="${pagina}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Atualizar título da página
    let pageTitle = 'Portal do Estagiário';
    if (pagina === 'pagina-minhas-consultas') {
        pageTitle = 'Minhas Consultas';
    } else if (pagina === 'pagina-meus-horarios') {
        pageTitle = 'Meus Horários';
    } else if (pagina === 'pagina-solicitacoes') {
        pageTitle = 'Solicitações de Triagem';
    } else if (pagina === 'pagina-prontuarios') {
        pageTitle = 'Prontuários';
    } else if (pagina === 'pagina-comunicados') {
        pageTitle = 'Comunicados';
    } else if (pagina === 'pagina-agendar-consulta') {
        pageTitle = 'Agendar Consulta';
    }
    
    document.getElementById('page-title').textContent = pageTitle;
    currentPage = pagina;
    
    // Fechar dropdown se estiver aberto
    if (dropdownOpen) {
        toggleDropdown();
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

function mesAnterior() {
    // Lógica para navegar para o mês anterior
    mostrarToast('Navegando para o mês anterior');
}

function mesSeguinte() {
    // Lógica para navegar para o mês seguinte
    mostrarToast('Navegando para o mês seguinte');
}

// Funções de modal
function abrirModalConfirmacaoTriagem(paciente, data, horario) {
    const modal = document.getElementById('modal-confirmacao-triagem');
    const textoModal = document.getElementById('modal-confirmacao-texto');
    
    // Armazenar dados para uso na confirmação
    modal.dataset.paciente = paciente;
    modal.dataset.data = data;
    modal.dataset.horario = horario;
    
    textoModal.textContent = `Você está prestes a confirmar uma consulta de triagem para ${paciente} no dia ${data} às ${horario}. Deseja Continuar?`;
    
    modal.classList.add('active');
}

function fecharModalConfirmacaoTriagem() {
    const modal = document.getElementById('modal-confirmacao-triagem');
    modal.classList.remove('active');
}

function confirmarTriagem() {
    const modal = document.getElementById('modal-confirmacao-triagem');
    const paciente = modal.dataset.paciente;
    const data = modal.dataset.data;
    const horario = modal.dataset.horario;
    
    // Simulação - em produção, usaria o ID real da consulta
    const consultaId = 1;
    
    // Chamar API para confirmar triagem
    confirmarTriagemAPI(consultaId);
    
    fecharModalConfirmacaoTriagem();
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
function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Função de logout
function logout() {
    // Lógica de logout
    mostrarToast('Saindo do sistema...');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}