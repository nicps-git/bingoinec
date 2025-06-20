document.addEventListener('DOMContentLoaded', () => {
    const numeroInicialInput = document.getElementById('numero-inicial');
    const numeroFinalInput = document.getElementById('numero-final');
    const totalNumerosSpan = document.getElementById('total-numeros');
    const rangeAtualSpan = document.getElementById('range-atual');
    const numerosSorteadosCountSpan = document.getElementById('numeros-sorteados-count');
    const numerosRestantesSpan = document.getElementById('numeros-restantes');
    const historicoContainer = document.getElementById('historico-numeros');
    
    const salvarConfigBtn = document.getElementById('salvar-config');
    const resetarJogoBtn = document.getElementById('resetar-jogo');
    const irParaBingoBtn = document.getElementById('ir-para-bingo');
    const limparHistoricoBtn = document.getElementById('limpar-historico');

    // Chaves para localStorage
    const STORAGE_KEYS = {
        numeroInicial: 'bingo_numero_inicial',
        numeroFinal: 'bingo_numero_final',
        numerosSorteados: 'bingo_numeros_sorteados',
        numerosDisponiveis: 'bingo_numeros_disponiveis'
    };

    // Carregar configurações salvas
    function carregarConfiguracoes() {
        const numeroInicial = localStorage.getItem(STORAGE_KEYS.numeroInicial) || '1';
        const numeroFinal = localStorage.getItem(STORAGE_KEYS.numeroFinal) || '75';
        
        numeroInicialInput.value = numeroInicial;
        numeroFinalInput.value = numeroFinal;
        
        atualizarInformacoes();
        carregarHistorico();
    }

    // Calcular total de números
    function calcularTotalNumeros() {
        const inicial = parseInt(numeroInicialInput.value) || 1;
        const final = parseInt(numeroFinalInput.value) || 75;
        
        if (inicial > final) {
            return 0;
        }
        
        return final - inicial + 1;
    }

    // Atualizar informações na tela
    function atualizarInformacoes() {
        const inicial = parseInt(numeroInicialInput.value) || 1;
        const final = parseInt(numeroFinalInput.value) || 75;
        const total = calcularTotalNumeros();
        
        totalNumerosSpan.textContent = `Total de números: ${total}`;
        rangeAtualSpan.textContent = `${inicial} - ${final}`;
        
        // Carregar números sorteados do localStorage
        const numerosSorteados = JSON.parse(localStorage.getItem(STORAGE_KEYS.numerosSorteados) || '[]');
        const numerosNoRange = numerosSorteados.filter(num => num >= inicial && num <= final);
        
        numerosSorteadosCountSpan.textContent = numerosNoRange.length;
        numerosRestantesSpan.textContent = total - numerosNoRange.length;
    }

    // Carregar histórico de números sorteados
    function carregarHistorico() {
        const numerosSorteados = JSON.parse(localStorage.getItem(STORAGE_KEYS.numerosSorteados) || '[]');
        
        historicoContainer.innerHTML = '';
        
        if (numerosSorteados.length === 0) {
            historicoContainer.innerHTML = '<p class="sem-historico">Nenhum número sorteado ainda</p>';
        } else {
            numerosSorteados.forEach(numero => {
                const numeroEl = document.createElement('div');
                numeroEl.className = 'numero-historico';
                numeroEl.textContent = numero;
                historicoContainer.appendChild(numeroEl);
            });
        }
    }

    // Validar inputs
    function validarInputs() {
        const inicial = parseInt(numeroInicialInput.value);
        const final = parseInt(numeroFinalInput.value);
        
        if (isNaN(inicial) || isNaN(final)) {
            alert('⚠️ Por favor, insira números válidos!');
            return false;
        }
        
        if (inicial < 1 || final < 1) {
            alert('⚠️ Os números devem ser maiores que 0!');
            return false;
        }
        
        if (inicial > final) {
            alert('⚠️ O número inicial deve ser menor ou igual ao número final!');
            return false;
        }
        
        if (final - inicial + 1 > 999) {
            alert('⚠️ O range não pode ter mais de 999 números!');
            return false;
        }
        
        return true;
    }

    // Salvar configurações
    function salvarConfiguracoes() {
        if (!validarInputs()) {
            return;
        }
        
        const inicial = parseInt(numeroInicialInput.value);
        const final = parseInt(numeroFinalInput.value);
        
        // Salvar no localStorage
        localStorage.setItem(STORAGE_KEYS.numeroInicial, inicial.toString());
        localStorage.setItem(STORAGE_KEYS.numeroFinal, final.toString());
        
        // Gerar nova lista de números disponíveis
        const numerosDisponiveis = Array.from({ length: final - inicial + 1 }, (_, i) => i + inicial);
        localStorage.setItem(STORAGE_KEYS.numerosDisponiveis, JSON.stringify(numerosDisponiveis));
        
        // Feedback visual
        salvarConfigBtn.textContent = '✅ Salvo!';
        salvarConfigBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        
        setTimeout(() => {
            salvarConfigBtn.textContent = '💾 Salvar Configurações';
            salvarConfigBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        }, 2000);
        
        atualizarInformacoes();
        
        // Criar confete de sucesso
        criarConfeteSucesso();
        
        alert('🎉 Configurações salvas com sucesso!');
    }

    // Resetar jogo
    function resetarJogo() {
        if (confirm('🔄 Tem certeza que deseja resetar o jogo? Isso apagará todo o histórico de números sorteados.')) {
            localStorage.removeItem(STORAGE_KEYS.numerosSorteados);
            localStorage.removeItem(STORAGE_KEYS.numerosDisponiveis);
            
            // Recriar números disponíveis com o range atual
            const inicial = parseInt(numeroInicialInput.value) || 1;
            const final = parseInt(numeroFinalInput.value) || 75;
            const numerosDisponiveis = Array.from({ length: final - inicial + 1 }, (_, i) => i + inicial);
            localStorage.setItem(STORAGE_KEYS.numerosDisponiveis, JSON.stringify(numerosDisponiveis));
            
            carregarHistorico();
            atualizarInformacoes();
            
            alert('🎮 Jogo resetado com sucesso!');
        }
    }

    // Limpar histórico
    function limparHistorico() {
        if (confirm('🗑️ Tem certeza que deseja limpar o histórico de números sorteados?')) {
            localStorage.removeItem(STORAGE_KEYS.numerosSorteados);
            carregarHistorico();
            atualizarInformacoes();
            
            alert('🧹 Histórico limpo com sucesso!');
        }
    }

    // Ir para o bingo
    function irParaBingo() {
        window.location.href = 'index.html';
    }

    // Criar confete de sucesso
    function criarConfeteSucesso() {
        const elementos = ['🎉', '✨', '🎊', '⭐', '🌟'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const confete = document.createElement('div');
                confete.style.position = 'fixed';
                confete.style.left = Math.random() * 100 + 'vw';
                confete.style.top = '-50px';
                confete.style.fontSize = '2em';
                confete.style.zIndex = '2000';
                confete.style.pointerEvents = 'none';
                confete.style.animation = 'confetti-fall 3s linear forwards';
                confete.textContent = elementos[Math.floor(Math.random() * elementos.length)];
                
                document.body.appendChild(confete);
                
                setTimeout(() => confete.remove(), 3000);
            }, i * 100);
        }
    }

    // Event listeners
    numeroInicialInput.addEventListener('input', atualizarInformacoes);
    numeroFinalInput.addEventListener('input', atualizarInformacoes);
    salvarConfigBtn.addEventListener('click', salvarConfiguracoes);
    resetarJogoBtn.addEventListener('click', resetarJogo);
    irParaBingoBtn.addEventListener('click', irParaBingo);
    limparHistoricoBtn.addEventListener('click', limparHistorico);

    // Validação em tempo real
    numeroInicialInput.addEventListener('blur', () => {
        if (parseInt(numeroInicialInput.value) > parseInt(numeroFinalInput.value)) {
            numeroFinalInput.value = numeroInicialInput.value;
            atualizarInformacoes();
        }
    });

    numeroFinalInput.addEventListener('blur', () => {
        if (parseInt(numeroFinalInput.value) < parseInt(numeroInicialInput.value)) {
            numeroInicialInput.value = numeroFinalInput.value;
            atualizarInformacoes();
        }
    });

    // Adicionar animação de confete ao CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Carregar configurações ao iniciar
    carregarConfiguracoes();
});
