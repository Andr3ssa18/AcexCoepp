document.addEventListener('DOMContentLoaded', function() {
    const radioYes = document.getElementById('radioYes');
    const radioNo = document.getElementById('radioNo');
    const agreeTerms = document.getElementById('agreeTerms');
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    
    // URL para redirecionamento para Minhas Consultas
    // Esta deve ser a rota EXATA definida no seu app.py para minhas_consultas.
    const minhasConsultasURL = '/minhas_consultas'; // CONFIRMADO: "/minhas_consultas" SEM o "/paciente"
    const proximaEtapaTriagemURL = '/paciente/triagem/etapa3'; // URL para a próxima etapa da triagem se 'No' for selecionado

    // Listener para o botão "Próximo"
    nextButton.addEventListener('click', function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário HTML

        if (radioYes.checked) {
            // Se "Yes" for selecionado, verifica a aceitação dos termos e redireciona para Minhas Consultas
            if (agreeTerms.checked) {
                window.location.href = minhasConsultasURL;
            } else {
                alert('Você deve aceitar os Termos de Uso e a Política de Privacidade para prosseguir com suas consultas.');
                agreeTerms.classList.add('input-error'); 
            }
        } else if (radioNo.checked) {
            // Se "No" for selecionado, verifica a aceitação dos termos e redireciona para a próxima etapa da triagem
            if (agreeTerms.checked) {
                window.location.href = proximaEtapaTriagemURL;
            } else {
                alert('Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.');
                agreeTerms.classList.add('input-error'); 
            }
        } else {
            // Se nenhuma opção de rádio for selecionada
            alert('Por favor, selecione uma opção (Sim ou Não) para continuar.');
        }
    });

    // Listener para o botão "Voltar"
    prevButton.addEventListener('click', function() {
        window.history.back(); 
    });

    agreeTerms.addEventListener('change', function() {
        if (agreeTerms.checked) {
            agreeTerms.classList.remove('input-error');
        }
    });
});