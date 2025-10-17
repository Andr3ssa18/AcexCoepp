function highlightPageSize() {
  const buttons = document.querySelectorAll(".size-option");
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      buttons.forEach((b) => {
        if (b !== button) {
          b.setAttribute("aria-pressed", "false");
        }
      });
    });

    if (index === 0) {
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }
  });
}

function setupPagination() {
  const pages = document.querySelectorAll(".page.number");
  pages.forEach((page) => {
    page.addEventListener("click", () => {
      pages.forEach((p) => p.classList.remove("current"));
      page.classList.add("current");
      page.setAttribute("aria-current", "page");
      pages.forEach((p) => {
        if (p !== page) {
          p.removeAttribute("aria-current");
        }
      });
    });
  });
}

// Funções do Modal
function buscarDadosEstagiario(estagiarioId) {
  // Simular dados do estagiário (em produção, fazer requisição AJAX)
  const dadosEstagiario = {
    id: estagiarioId,
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    ra: '123456',
    telefone: '(11) 99999-9999',
    grupo: 'A',
    semestre: '5',
    status: 'Ativo',
    dataCadastro: '15/03/2023',
    totalConsultas: 25,
    consultasHoje: 2,
    consultasSemana: 5,
    ultimaConsulta: 'Hoje às 14:30'
  };

  // Preencher modal com os dados
  document.getElementById('modal-nome').textContent = dadosEstagiario.nome;
  document.getElementById('modal-email').textContent = dadosEstagiario.email;
  document.getElementById('modal-ra').textContent = dadosEstagiario.ra;
  document.getElementById('modal-telefone').textContent = dadosEstagiario.telefone;
  document.getElementById('modal-grupo').textContent = dadosEstagiario.grupo;
  document.getElementById('modal-semestre').textContent = dadosEstagiario.semestre + 'º Semestre';
  document.getElementById('modal-status').textContent = dadosEstagiario.status;
  document.getElementById('modal-data-cadastro').textContent = dadosEstagiario.dataCadastro;
  document.getElementById('modal-total-consultas').textContent = dadosEstagiario.totalConsultas;
  document.getElementById('modal-consultas-hoje').textContent = dadosEstagiario.consultasHoje;
  document.getElementById('modal-consultas-semana').textContent = dadosEstagiario.consultasSemana;
  document.getElementById('modal-ultima-consulta').textContent = dadosEstagiario.ultimaConsulta;

  // Abrir modal
  document.getElementById('estagiarioModal').style.display = 'block';
}

function fecharModal() {
  document.getElementById('estagiarioModal').style.display = 'none';
}

function editarEstagiarioModal() {
  // Fechar modal e redirecionar para edição
  fecharModal();
  const estagiarioId = document.getElementById('modal-ra').textContent;
  editarEstagiario(estagiarioId);
}

// Funções dos Filtros
function aplicarFiltros() {
  const filtros = {
    ra: document.getElementById('filter-ra').value,
    grupo: document.getElementById('filter-grupo').value,
    semestre: document.getElementById('filter-semestre').value,
    status: document.getElementById('filter-status').value
  };

  // Filtrar linhas da tabela
  const linhas = document.querySelectorAll('tbody tr');
  linhas.forEach(linha => {
    let mostrar = true;
    
    // Verificar filtro de RA
    if (filtros.ra) {
      const ra = linha.querySelector('td[data-label="RA"]').textContent;
      if (!ra.toLowerCase().includes(filtros.ra.toLowerCase())) {
        mostrar = false;
      }
    }
    
    // Verificar filtro de grupo
    if (filtros.grupo) {
      const grupo = linha.querySelector('.grupo-badge').textContent;
      if (grupo !== filtros.grupo) {
        mostrar = false;
      }
    }
    
    // Verificar filtro de semestre
    if (filtros.semestre) {
      const semestre = linha.querySelector('td[data-label="Semestre"]').textContent;
      if (semestre !== filtros.semestre) {
        mostrar = false;
      }
    }
    
    // Mostrar ou ocultar linha
    linha.style.display = mostrar ? '' : 'none';
  });
}

function limparTodosFiltros() {
  document.getElementById('filter-ra').value = '';
  document.getElementById('filter-grupo').value = '';
  document.getElementById('filter-semestre').value = '';
  document.getElementById('filter-status').value = '';
  
  // Mostrar todas as linhas
  const linhas = document.querySelectorAll('tbody tr');
  linhas.forEach(linha => {
    linha.style.display = '';
  });
}

document.addEventListener("DOMContentLoaded", () => {
  highlightPageSize();
  setupPagination();
  
  // Adicionar event listeners aos filtros
  const filterRa = document.getElementById('filter-ra');
  const filterGrupo = document.getElementById('filter-grupo');
  const filterSemestre = document.getElementById('filter-semestre');
  const filterStatus = document.getElementById('filter-status');
  
  if (filterRa) filterRa.addEventListener('input', aplicarFiltros);
  if (filterGrupo) filterGrupo.addEventListener('change', aplicarFiltros);
  if (filterSemestre) filterSemestre.addEventListener('change', aplicarFiltros);
  if (filterStatus) filterStatus.addEventListener('change', aplicarFiltros);

  // Fechar modal ao clicar fora dele
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('estagiarioModal');
    if (event.target === modal) {
      fecharModal();
    }
  });
});
