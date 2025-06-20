document.addEventListener('DOMContentLoaded', () => {
    // ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
    // Verificar se o usuário está autenticado antes de carregar a página
    if (!window.bingoAuth || !window.bingoAuth.isAuthenticated()) {
        alert('Acesso não autorizado! Você será redirecionado para a página de login.');
        window.location.href = 'login.html';
        return;
    }
    
    // Exibir informações do usuário logado
    updateUserInfo();
    
    // ===== ELEMENTOS DO DOM =====
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

    // Elementos do sistema de cartelas
    const precoCartelaInput = document.getElementById('preco-cartela');
    const gerarCartelaBtn = document.getElementById('gerar-cartela');
    const verVendasBtn = document.getElementById('ver-vendas');
    const cartelasGeradasSpan = document.getElementById('cartelas-geradas');
    const cartelasVendidasSpan = document.getElementById('cartelas-vendidas');
    const totalArrecadadoSpan = document.getElementById('total-arrecadado');
    const modalVendas = document.getElementById('modal-vendas');
    const listaCartelas = document.getElementById('lista-cartelas');
    const closeModal = document.querySelector('.close');

    // Chaves para localStorage
    const STORAGE_KEYS = {
        numeroInicial: 'bingo_numero_inicial',
        numeroFinal: 'bingo_numero_final',
        numerosSorteados: 'bingo_numeros_sorteados',
        numerosDisponiveis: 'bingo_numeros_disponiveis',
        cartelas: 'bingo_cartelas',
        precoCartela: 'bingo_preco_cartela'
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

    // ===== FUNÇÕES DE AUTENTICAÇÃO E SESSÃO =====

    function updateUserInfo() {
        const user = window.bingoAuth.getCurrentUser();
        if (user) {
            const adminUserSpan = document.getElementById('admin-user');
            const sessionTimeSpan = document.getElementById('session-time');
            
            if (adminUserSpan) {
                adminUserSpan.textContent = `👤 ${user.email}`;
            }
            
            if (sessionTimeSpan) {
                const loginTime = new Date(user.loginTime);
                const timeString = loginTime.toLocaleTimeString('pt-BR');
                sessionTimeSpan.textContent = `⏰ Login: ${timeString}`;
            }
        }
    }

    function logout() {
        if (confirm('Tem certeza que deseja sair da administração?')) {
            if (window.bingoAuth) {
                window.bingoAuth.logout();
            } else {
                // Fallback se bingoAuth não estiver disponível
                localStorage.removeItem('bingoAdminSession');
                window.location.href = 'login.html';
            }
        }
    }

    // Auto-refresh da sessão quando há atividade na página
    let adminActivityTimer;

    function resetAdminActivityTimer() {
        clearTimeout(adminActivityTimer);
        adminActivityTimer = setTimeout(() => {
            if (window.bingoAuth) {
                window.bingoAuth.extendSession();
            }
        }, 5 * 60 * 1000); // Estender sessão a cada 5 minutos de atividade
    }

    // Adicionar listeners para atividade do usuário
    document.addEventListener('mousedown', resetAdminActivityTimer);
    document.addEventListener('keydown', resetAdminActivityTimer);
    document.addEventListener('click', resetAdminActivityTimer);

    // Verificar sessão periodicamente
    setInterval(() => {
        if (window.bingoAuth && !window.bingoAuth.isAuthenticated()) {
            alert('Sua sessão expirou! Você será redirecionado para a página de login.');
            window.location.href = 'login.html';
        }
    }, 60000); // Verificar a cada minuto

    // Sistema de Cartelas
    function carregarPrecoCartela() {
        const preco = localStorage.getItem(STORAGE_KEYS.precoCartela) || '5.00';
        precoCartelaInput.value = preco;
    }

    function salvarPrecoCartela() {
        localStorage.setItem(STORAGE_KEYS.precoCartela, precoCartelaInput.value);
    }

    function gerarNumeroCartela() {
        const cartelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.cartelas) || '[]');
        return cartelas.length + 1;
    }

    function gerarCartela() {
        const inicial = parseInt(numeroInicialInput.value) || 1;
        const final = parseInt(numeroFinalInput.value) || 75;
        const preco = parseFloat(precoCartelaInput.value) || 5.00;
        
        // Validar range
        if (final - inicial + 1 < 25) {
            alert('⚠️ O range deve ter pelo menos 25 números para gerar uma cartela!');
            return;
        }

        const numeroCartela = gerarNumeroCartela();
        const cartela = {
            id: Date.now(),
            numero: numeroCartela,
            preco: preco,
            numeros: gerarNumerosCartela(inicial, final),
            dataGeracao: new Date().toISOString(),
            vendida: false,
            comprador: null,
            dataVenda: null
        };

        // Salvar cartela
        const cartelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.cartelas) || '[]');
        cartelas.push(cartela);
        localStorage.setItem(STORAGE_KEYS.cartelas, JSON.stringify(cartelas));

        // Abrir modal de vendas automaticamente
        abrirModalVendas();
        atualizarEstatisticasCartelas();
        
        // Feedback
        gerarCartelaBtn.textContent = '✅ Cartela Gerada!';
        setTimeout(() => {
            gerarCartelaBtn.textContent = '🎫 Gerar Nova Cartela';
        }, 2000);
    }

    function gerarNumerosCartela(min, max) {
        // Gerar números para cartela de bingo 5x5
        const numeros = [];
        const ranges = [
            { min: min, max: Math.min(min + 14, max) }, // B
            { min: Math.min(min + 15, max), max: Math.min(min + 29, max) }, // I  
            { min: Math.min(min + 30, max), max: Math.min(min + 44, max) }, // N
            { min: Math.min(min + 45, max), max: Math.min(min + 59, max) }, // G
            { min: Math.min(min + 60, max), max: max } // O
        ];

        for (let col = 0; col < 5; col++) {
            const colNums = [];
            const range = ranges[col];
            
            // Gerar 5 números únicos para cada coluna
            while (colNums.length < 5) {
                const num = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                if (!colNums.includes(num)) {
                    colNums.push(num);
                }
            }
            
            colNums.sort((a, b) => a - b);
            numeros.push(colNums);
        }

        // Espaço livre no centro
        numeros[2][2] = 'FREE';
        
        return numeros;
    }

    function abrirModalVendas() {
        modalVendas.style.display = 'block';
        carregarListaCartelas();
    }

    function fecharModalVendas() {
        modalVendas.style.display = 'none';
    }

    function carregarListaCartelas() {
        const cartelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.cartelas) || '[]');
        listaCartelas.innerHTML = '';

        if (cartelas.length === 0) {
            listaCartelas.innerHTML = '<p class="sem-historico">Nenhuma cartela gerada ainda</p>';
            return;
        }

        cartelas.reverse().forEach(cartela => {
            const cartelaEl = criarElementoCartela(cartela);
            listaCartelas.appendChild(cartelaEl);
        });
    }

    function criarElementoCartela(cartela) {
        const div = document.createElement('div');
        div.className = `cartela-item ${cartela.vendida ? 'vendida' : 'pendente'}`;
        
        div.innerHTML = `
            <div class="cartela-header">
                <div class="cartela-numero">Cartela #${cartela.numero}</div>
                <div class="cartela-preco">R$ ${cartela.preco.toFixed(2)}</div>
                <div class="status-venda ${cartela.vendida ? 'vendida' : 'pendente'}">
                    ${cartela.vendida ? '✅ Vendida' : '⏳ Pendente'}
                </div>
            </div>
            
            <div class="cartela-bingo">
                <div class="cell header">B</div>
                <div class="cell header">I</div>
                <div class="cell header">N</div>
                <div class="cell header">G</div>
                <div class="cell header">O</div>
                ${cartela.numeros.map((col, colIndex) => 
                    col.map((num, rowIndex) => 
                        `<div class="cell ${num === 'FREE' ? 'free' : ''}">${num === 'FREE' ? '★' : num}</div>`
                    ).join('')
                ).join('')}
            </div>
            
            ${cartela.vendida ? `
                <div class="comprador-info">
                    <strong>👤 Comprador:</strong> ${cartela.comprador || 'N/A'}<br>
                    <strong>📅 Data da Venda:</strong> ${new Date(cartela.dataVenda).toLocaleString('pt-BR')}
                </div>
            ` : ''}
            
            <div class="cartela-actions">
                ${!cartela.vendida ? `
                    <button class="btn-confirmar" onclick="confirmarVenda(${cartela.id})">
                        ✅ Confirmar Venda
                    </button>
                ` : ''}
                <button class="btn-remover" onclick="removerCartela(${cartela.id})">
                    🗑️ Remover
                </button>
            </div>
        `;
        
        return div;
    }

    function confirmarVenda(cartelaId) {
        const comprador = prompt('💰 Nome do comprador:');
        if (!comprador) return;

        const cartelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.cartelas) || '[]');
        const cartela = cartelas.find(c => c.id === cartelaId);
        
        if (cartela) {
            cartela.vendida = true;
            cartela.comprador = comprador;
            cartela.dataVenda = new Date().toISOString();
            
            localStorage.setItem(STORAGE_KEYS.cartelas, JSON.stringify(cartelas));
            carregarListaCartelas();
            atualizarEstatisticasCartelas();
            
            alert(`🎉 Venda confirmada para ${comprador}!`);
        }
    }

    function removerCartela(cartelaId) {
        if (!confirm('🗑️ Tem certeza que deseja remover esta cartela?')) return;

        const cartelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.cartelas) || '[]');
        const novasCartelas = cartelas.filter(c => c.id !== cartelaId);
        
        localStorage.setItem(STORAGE_KEYS.cartelas, JSON.stringify(novasCartelas));
        carregarListaCartelas();
        atualizarEstatisticasCartelas();
    }

    function atualizarEstatisticasCartelas() {
        const cartelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.cartelas) || '[]');
        const vendidas = cartelas.filter(c => c.vendida);
        const totalArrecadado = vendidas.reduce((total, cartela) => total + cartela.preco, 0);

        cartelasGeradasSpan.textContent = cartelas.length;
        cartelasVendidasSpan.textContent = vendidas.length;
        totalArrecadadoSpan.textContent = `R$ ${totalArrecadado.toFixed(2)}`;
    }

    // Tornar funções globais para os botões inline
    window.confirmarVenda = confirmarVenda;
    window.removerCartela = removerCartela;

    // Event listeners
    numeroInicialInput.addEventListener('input', atualizarInformacoes);
    numeroFinalInput.addEventListener('input', atualizarInformacoes);
    salvarConfigBtn.addEventListener('click', salvarConfiguracoes);
    resetarJogoBtn.addEventListener('click', resetarJogo);
    irParaBingoBtn.addEventListener('click', irParaBingo);
    limparHistoricoBtn.addEventListener('click', limparHistorico);

    // Event listeners do sistema de cartelas
    precoCartelaInput.addEventListener('change', salvarPrecoCartela);
    gerarCartelaBtn.addEventListener('click', gerarCartela);
    verVendasBtn.addEventListener('click', abrirModalVendas);
    closeModal.addEventListener('click', fecharModalVendas);
    
    // Fechar modal clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === modalVendas) {
            fecharModalVendas();
        }
    });
    gerarCartelaBtn.addEventListener('click', gerarCartela);
    precoCartelaInput.addEventListener('change', salvarPrecoCartela);

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
    carregarPrecoCartela();
    atualizarEstatisticasCartelas();
    
    console.log('Admin panel loaded with authentication');
});
