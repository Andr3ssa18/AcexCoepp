document.addEventListener('DOMContentLoaded', function() {
    const radioYes = document.getElementById('radioYes');
    const radioNo = document.getElementById('radioNo');
    

    const navigationButtons = document.querySelectorAll('.botoes-navegacao .botao-navegacao');
    const nextButton = navigationButtons.length > 1 ? navigationButtons[1] : null; 
    const prevButton = navigationButtons.length > 0 ? navigationButtons[0] : null;

    const minhasConsultasURL = '/minhas_consultas';
    const abaPacientesURL = '/aba_pacientes';

    if (nextButton) {
        
        nextButton.addEventListener('click', function(event) {
            event.preventDefault(); // Evita o envio padrão do formulário

            if (!radioYes.checked && !radioNo.checked) {
                alert('Por favor, selecione uma opção (Sim ou Não) para continuar.');
                return;
            }

            if (radioYes.checked) {
                window.location.href = minhasConsultasURL;
            } else {
                window.location.href = abaPacientesURL;
            }
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    window.voltar = function() {
        window.history.back();
    };
});
