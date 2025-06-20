document.addEventListener('DOMContentLoaded', async () => {
    // ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
    if (!window.bingoAuth || !window.bingoAuth.isAuthenticated()) {
        alert('Acesso não autorizado! Você será redirecionado para a página de login.');
        window.location.href = 'login.html';
        return;
    }
    
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

    let configuracoes = {};
    let numerosSorteados = [];
    let cartelas = [];

    // Verificar conexão com Firebase
    console.log('🔥 Verificando conexão com Firebase...');
    const conexaoOk = await firebaseService.verificarConexao();
    if (!conexaoOk) {
        alert('❌ Erro de conexão com Firebase. Verifique sua conexão com a internet.');
        return;
    }

    // ===== FUNÇÕES PRINCIPAIS =====

    // Carregar dados do Firebase
    async function carregarDados() {
        try {
            configuracoes = await firebaseService.carregarConfiguracoes();
            numerosSorteados = await firebaseService.carregarNumerosSorteados();
            cartelas = await firebaseService.carregarCartelas();

            numeroInicialInput.value = configuracoes.numeroInicial || 1;
            numeroFinalInput.value = configuracoes.numeroFinal || 75;
            precoCartelaInput.value = configuracoes.precoCartela || 5.00;

            atualizarDisplay();
            atualizarEstatisticasCartelas();
            
            console.log('✅ Dados carregados do Firebase');
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            alert('Erro ao carregar dados. Tente recarregar a página.');
        }
    }

    // Calcular total de números
    function calcularTotalNumeros() {
        const inicial = parseInt(numeroInicialInput.value) || 1;
        const final = parseInt(numeroFinalInput.value) || 75;
        
        if (inicial > final) return 0;
        return final - inicial + 1;
    }

    // Atualizar display principal
    function atualizarDisplay() {
        const inicial = parseInt(numeroInicialInput.value) || 1;
        const final = parseInt(numeroFinalInput.value) || 75;
        const total = calcularTotalNumeros();
        
        totalNumerosSpan.textContent = `Total de números: ${total}`;
        rangeAtualSpan.textContent = `${inicial} - ${final}`;
        numerosSorteadosCountSpan.textContent = numerosSorteados.length;
        numerosRestantesSpan.textContent = total - numerosSorteados.length;
        
        carregarHistorico();
    }

    // Carregar histórico de números sorteados
    function carregarHistorico() {
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
    async function salvarConfiguracoes() {
        if (!validarInputs()) return;
        
        try {
            const inicial = parseInt(numeroInicialInput.value);
            const final = parseInt(numeroFinalInput.value);
            const preco = parseFloat(precoCartelaInput.value) || 5.00;
            
            await firebaseService.salvarConfiguracoes({
                numeroInicial: inicial,
                numeroFinal: final,
                precoCartela: preco,
                jogoAtivo: true
            });
            
            configuracoes = {
                numeroInicial: inicial,
                numeroFinal: final,
                precoCartela: preco,
                jogoAtivo: true
            };
            
            // Feedback visual
            salvarConfigBtn.textContent = '✅ Salvo!';
            salvarConfigBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            
            setTimeout(() => {
                salvarConfigBtn.textContent = '💾 Salvar Configurações';
                salvarConfigBtn.style.background = '';
            }, 2000);
            
            atualizarDisplay();
            criarConfeteSucesso();
            alert('🎉 Configurações salvas com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            alert('❌ Erro ao salvar configurações. Tente novamente.');
        }
    }

    // Resetar jogo
    async function resetarJogo() {
        if (confirm('🔄 Tem certeza que deseja resetar o jogo? Isso apagará todo o histórico de números sorteados.')) {
            try {
                await firebaseService.resetarJogo();
                numerosSorteados = [];
                carregarHistorico();
                atualizarDisplay();
                alert('🎮 Jogo resetado com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao resetar jogo:', error);
                alert('❌ Erro ao resetar jogo. Tente novamente.');
            }
        }
    }

    // Limpar histórico
    async function limparHistorico() {
        if (confirm('🗑️ Tem certeza que deseja limpar o histórico de números sorteados?')) {
            try {
                await firebaseService.resetarJogo();
                numerosSorteados = [];
                carregarHistorico();
                atualizarDisplay();
                alert('🗑️ Histórico limpo com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao limpar histórico:', error);
                alert('❌ Erro ao limpar histórico. Tente novamente.');
            }
        }
    }

    // Ir para bingo
    function irParaBingo() {
        window.location.href = 'index.html';
    }

    // Atualizar estatísticas das cartelas
    function atualizarEstatisticasCartelas() {
        const cartelasGeradas = cartelas.length;
        const cartelasVendidas = cartelas.filter(c => c.vendida).length;
        const totalArrecadado = cartelas.filter(c => c.vendida).reduce((sum, c) => sum + (c.preco || 0), 0);

        cartelasGeradasSpan.textContent = cartelasGeradas;
        cartelasVendidasSpan.textContent = cartelasVendidas;
        totalArrecadadoSpan.textContent = `R$ ${totalArrecadado.toFixed(2)}`;
    }

    // Gerar nova cartela
    async function gerarNovaCartela() {
        try {
            const inicial = configuracoes.numeroInicial || 1;
            const final = configuracoes.numeroFinal || 75;
            const preco = configuracoes.precoCartela || 5.00;

            // Gerar números da cartela
            const numeros = [];
            while (numeros.length < 24) {
                const numero = Math.floor(Math.random() * (final - inicial + 1)) + inicial;
                if (!numeros.includes(numero)) {
                    numeros.push(numero);
                }
            }
            numeros.sort((a, b) => a - b);

            const cartela = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                numeros: numeros,
                preco: preco,
                vendida: false,
                dataGeracao: new Date().toISOString()
            };

            await firebaseService.salvarCartela(cartela);
            cartelas.push(cartela);
            atualizarEstatisticasCartelas();

            alert(`🎫 Nova cartela gerada!\nID: ${cartela.id}\nNúmeros: ${numeros.join(', ')}`);
        } catch (error) {
            console.error('❌ Erro ao gerar cartela:', error);
            alert('❌ Erro ao gerar cartela. Tente novamente.');
        }
    }

    // Ver vendas
    function verVendas() {
        const cartelasVendidas = cartelas.filter(c => c.vendida);
        
        if (cartelasVendidas.length === 0) {
            alert('📋 Nenhuma cartela vendida ainda.');
            return;
        }

        let html = '<div class="lista-vendas">';
        cartelasVendidas.forEach((cartela, index) => {
            html += `
                <div class="venda-item">
                    <h4>Cartela #${index + 1}</h4>
                    <p><strong>ID:</strong> ${cartela.id}</p>
                    <p><strong>Comprador:</strong> ${cartela.comprador}</p>
                    <p><strong>Telefone:</strong> ${cartela.telefone}</p>
                    <p><strong>Email:</strong> ${cartela.email || 'Não informado'}</p>
                    <p><strong>Preço:</strong> R$ ${(cartela.preco || 0).toFixed(2)}</p>
                    <p><strong>Data:</strong> ${new Date(cartela.dataVenda).toLocaleString()}</p>
                    <div class="cartela-numeros">
                        <strong>Números:</strong> ${cartela.numeros.join(', ')}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        listaCartelas.innerHTML = html;
        modalVendas.style.display = 'block';
    }

    // Criar confete de sucesso
    function criarConfeteSucesso() {
        const elementos = ['🎉', '🎊', '✨', '🎈', '🌟', '⭐'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confete = document.createElement('div');
                confete.textContent = elementos[Math.floor(Math.random() * elementos.length)];
                confete.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    font-size: ${Math.random() * 20 + 20}px;
                    z-index: 9999;
                    pointer-events: none;
                    animation: confetti-fall 3s ease-out forwards;
                `;
                document.body.appendChild(confete);
                
                setTimeout(() => confete.remove(), 3000);
            }, i * 100);
        }
    }

    // Função para informações do usuário
    function updateUserInfo() {
        const userInfoEl = document.getElementById('user-info');
        if (userInfoEl && window.bingoAuth) {
            const user = window.bingoAuth.getCurrentUser();
            userInfoEl.innerHTML = `
                <span>👤 ${user.email}</span>
                <button onclick="logout()" class="logout-btn">🚪 Sair</button>
            `;
        }
    }

    // Logout
    function logout() {
        if (confirm('Deseja realmente sair do sistema?')) {
            window.bingoAuth.logout();
            window.location.href = 'login.html';
        }
    }

    // ===== EVENT LISTENERS =====
    salvarConfigBtn.addEventListener('click', salvarConfiguracoes);
    resetarJogoBtn.addEventListener('click', resetarJogo);
    limparHistoricoBtn.addEventListener('click', limparHistorico);
    irParaBingoBtn.addEventListener('click', irParaBingo);
    gerarCartelaBtn.addEventListener('click', gerarNovaCartela);
    verVendasBtn.addEventListener('click', verVendas);

    // Atualizar total de números quando os inputs mudarem
    numeroInicialInput.addEventListener('input', atualizarDisplay);
    numeroFinalInput.addEventListener('input', atualizarDisplay);

    // Fechar modal
    closeModal.addEventListener('click', () => {
        modalVendas.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalVendas) {
            modalVendas.style.display = 'none';
        }
    });

    // Tornar funções globais
    window.logout = logout;

    // CSS para animação de confete
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

    // Carregar dados iniciais
    await carregarDados();
    
    console.log('✅ Admin panel carregado com Firebase');
});
