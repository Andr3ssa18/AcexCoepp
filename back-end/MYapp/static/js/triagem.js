document.addEventListener('DOMContentLoaded', function() {
    const radioYes = document.getElementById('radioYes');
    const radioNo = document.getElementById('radioNo');
    const agreeTerms = document.getElementById('agreeTerms');
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    
    // URLs para redirecionamento
    const minhasConsultasURL = '/minhas_consultas';
    const abaPacientesURL = '/aba_pacientes';

    // Listener para o botão "Próximo"
    nextButton.addEventListener('click', function(event) {
        event.preventDefault();

        if (!radioYes.checked && !radioNo.checked) {
            alert('Por favor, selecione uma opção (Sim ou Não) para continuar.');
            return;
        }

        if (!agreeTerms.checked) {
            alert('Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.');
            agreeTerms.classList.add('input-error');
            return;
        }

        // Remove a classe de erro se os termos foram aceitos
        agreeTerms.classList.remove('input-error');

        // Redireciona com base na seleção
        if (radioYes.checked) {
            window.location.href = minhasConsultasURL;
        } else {
            window.location.href = abaPacientesURL;
        }
    });

    // Listener para o botão "Voltar"
    prevButton.addEventListener('click', function() {
        window.history.back();
    });

    // Remove a classe de erro quando os termos são aceitos
    agreeTerms.addEventListener('change', function() {
        if (agreeTerms.checked) {
            agreeTerms.classList.remove('input-error');
        }
    });
});