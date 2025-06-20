document.addEventListener('DOMContentLoaded', async () => {
    // ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
    if (!window.bingoAuth || !window.bingoAuth.isAuthenticated()) {
        alert('Acesso não autorizado! Você será redirecionado para a página de login.');
        window.location.href = 'login.html';
        return;
    }
    
    updateUserInfo();
    
    // ===== ELEMENTOS DO DOM =====
    console.log('🔍 Buscando elementos DOM...');
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

    // Verificar se todos os elementos essenciais foram encontrados
    const elementos = {
        numeroInicialInput, numeroFinalInput, salvarConfigBtn, resetarJogoBtn, 
        irParaBingoBtn, limparHistoricoBtn, gerarCartelaBtn, verVendasBtn, 
        modalVendas, closeModal
    };
    
    const elementosFaltando = Object.entries(elementos).filter(([nome, el]) => !el);
    if (elementosFaltando.length > 0) {
        console.error('❌ Elementos DOM não encontrados:', elementosFaltando.map(([nome]) => nome));
        alert('Erro: Alguns elementos da página não foram encontrados. Recarregue a página.');
        return;
    }
    
    console.log('✅ Todos os elementos DOM encontrados');

    let configuracoes = {};
    let numerosSorteados = [];
    let cartelas = [];

    // Aguardar FirebaseService estar disponível
    console.log('🔥 Aguardando Firebase estar pronto...');
    
    try {
        // Usar nova função de aguardar Firebase
        const service = await window.waitForFirebase(15000); // 15 segundos timeout
        window.firebaseService = service;
        console.log('✅ Firebase pronto para uso!');
        
    } catch (error) {
        console.error('❌ Erro ao aguardar Firebase:', error);
        alert('❌ Erro ao carregar sistema Firebase. Verifique sua conexão com a internet e recarregue a página.');
        return;
    }

    // ===== FUNÇÕES PRINCIPAIS =====

    // Carregar dados do Firebase
    async function carregarDados() {
        try {
            configuracoes = await window.firebaseService.carregarConfiguracoes();
            numerosSorteados = await window.firebaseService.carregarNumerosSorteados();
            cartelas = await window.firebaseService.carregarCartelas();

            // Também verificar localStorage como fallback
            const cartelasLocais = JSON.parse(localStorage.getItem('bingo_cartelas_vendidas') || '[]');
            if (cartelasLocais.length > 0 && cartelas.length === 0) {
                cartelas = cartelasLocais;
                console.log('📂 Usando dados locais como fallback');
            }

            atualizarTodosDisplays();
            console.log('✅ Dados carregados do Firebase');
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            // Carregar dados locais como fallback
            carregarDadosLocais();
        }
    }

    function carregarDadosLocais() {
        configuracoes = JSON.parse(localStorage.getItem('bingo_configuracoes') || '{"numeroInicial": 1, "numeroFinal": 75, "precoCartela": 5.00}');
        numerosSorteados = JSON.parse(localStorage.getItem('numeros_sorteados') || '[]');
        cartelas = JSON.parse(localStorage.getItem('bingo_cartelas_vendidas') || '[]');
        atualizarTodosDisplays();
        console.log('📂 Dados carregados do localStorage');
    }

    function atualizarTodosDisplays() {
        atualizarDisplay();
        atualizarRangeAtual();
        atualizarHistorico();
        atualizarEstatisticasCartelas();
    }

    function atualizarDisplay() {
        if (!numeroInicialInput || !numeroFinalInput) return;
        
        const inicial = parseInt(numeroInicialInput.value) || 1;
        const final = parseInt(numeroFinalInput.value) || 75;
        const total = final - inicial + 1;
        const restantes = total - numerosSorteados.length;

        if (totalNumerosSpan) totalNumerosSpan.textContent = `Total de números: ${total}`;
        if (numerosRestantesSpan) numerosRestantesSpan.textContent = restantes;
        if (numerosSorteadosCountSpan) numerosSorteadosCountSpan.textContent = numerosSorteados.length;
    }

    function atualizarRangeAtual() {
        if (configuracoes && rangeAtualSpan) {
            rangeAtualSpan.textContent = `${configuracoes.numeroInicial || 1} - ${configuracoes.numeroFinal || 75}`;
        }
    }

    function atualizarHistorico() {
        if (!historicoContainer) return;
        
        if (numerosSorteados.length === 0) {
            historicoContainer.innerHTML = '<p class="sem-historico">Nenhum número sorteado ainda</p>';
        } else {
            const numerosHtml = numerosSorteados.map(num => 
                `<span class="numero-sorteado">${num}</span>`
            ).join('');
            historicoContainer.innerHTML = numerosHtml;
        }
    }

    function atualizarEstatisticasCartelas() {
        const geradas = cartelas.length;
        const vendidas = cartelas.filter(c => c.vendida).length;
        const total = cartelas.filter(c => c.vendida).reduce((sum, c) => sum + (c.preco || 0), 0);

        if (cartelasGeradasSpan) cartelasGeradasSpan.textContent = geradas;
        if (cartelasVendidasSpan) cartelasVendidasSpan.textContent = vendidas;
        if (totalArrecadadoSpan) totalArrecadadoSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // ===== FUNÇÕES DOS BOTÕES =====

    async function salvarConfiguracoes() {
        console.log('💾 Salvando configurações...');
        
        if (!numeroInicialInput || !numeroFinalInput || !precoCartelaInput) {
            alert('Erro: Elementos de input não encontrados');
            return;
        }
        
        try {
            const config = {
                numeroInicial: parseInt(numeroInicialInput.value),
                numeroFinal: parseInt(numeroFinalInput.value),
                precoCartela: parseFloat(precoCartelaInput.value),
                jogoAtivo: true
            };

            if (window.firebaseService) {
                await window.firebaseService.salvarConfiguracoes(config);
            }
            
            // Salvar também localmente
            localStorage.setItem('bingo_configuracoes', JSON.stringify(config));
            configuracoes = config;
            
            atualizarTodosDisplays();
            alert('✅ Configurações salvas com sucesso!');
            console.log('✅ Configurações salvas');
            
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            alert('❌ Erro ao salvar configurações: ' + error.message);
        }
    }

    async function resetarJogo() {
        if (!confirm('⚠️ ATENÇÃO: Isso irá resetar TODOS os dados do jogo (números sorteados, cartelas, etc.). Continuar?')) {
            return;
        }

        console.log('🔄 Resetando jogo...');
        
        try {
            if (window.firebaseService) {
                await window.firebaseService.resetarJogo();
            }
            
            // Limpar dados locais
            localStorage.removeItem('numeros_sorteados');
            localStorage.removeItem('bingo_cartelas_vendidas');
            
            numerosSorteados = [];
            cartelas = [];
            
            atualizarTodosDisplays();
            alert('✅ Jogo resetado com sucesso!');
            console.log('✅ Jogo resetado');
            
        } catch (error) {
            console.error('❌ Erro ao resetar jogo:', error);
            alert('❌ Erro ao resetar jogo: ' + error.message);
        }
    }

    function limparHistorico() {
        if (!confirm('Deseja limpar o histórico de números sorteados?')) {
            return;
        }

        numerosSorteados = [];
        localStorage.setItem('numeros_sorteados', JSON.stringify([]));
        atualizarHistorico();
        atualizarDisplay();
        alert('✅ Histórico limpo!');
    }

    function irParaBingo() {
        window.open('index.html', '_blank');
    }

    async function gerarNovaCartela() {
        console.log('🎫 Gerando nova cartela...');
        
        try {
            const preco = parseFloat(precoCartelaInput?.value || 5);
            const novaCartela = {
                id: Date.now().toString(),
                numeros: gerarNumerosCartela(),
                preco: preco,
                vendida: false,
                dataGeracao: new Date().toISOString()
            };

            if (window.firebaseService) {
                await window.firebaseService.salvarCartela(novaCartela);
            }
            
            cartelas.push(novaCartela);
            localStorage.setItem('bingo_cartelas_vendidas', JSON.stringify(cartelas));
            
            atualizarEstatisticasCartelas();
            alert(`✅ Nova cartela gerada! ID: ${novaCartela.id}`);
            console.log('✅ Cartela gerada:', novaCartela.id);
            
        } catch (error) {
            console.error('❌ Erro ao gerar cartela:', error);
            alert('❌ Erro ao gerar cartela: ' + error.message);
        }
    }

    function gerarNumerosCartela() {
        const numeros = [];
        const inicial = configuracoes.numeroInicial || 1;
        const final = configuracoes.numeroFinal || 75;
        
        while (numeros.length < 15) {
            const num = Math.floor(Math.random() * (final - inicial + 1)) + inicial;
            if (!numeros.includes(num)) {
                numeros.push(num);
            }
        }
        
        return numeros.sort((a, b) => a - b);
    }

    function verVendas() {
        if (!modalVendas || !listaCartelas) {
            alert('Erro: Modal de vendas não encontrado');
            return;
        }
        
        console.log('💰 Abrindo modal de vendas...');
        
        const cartelasVendidas = cartelas.filter(c => c.vendida);
        
        if (cartelasVendidas.length === 0) {
            listaCartelas.innerHTML = '<p>Nenhuma cartela vendida ainda.</p>';
        } else {
            let html = '<div class="vendas-lista">';
            cartelasVendidas.forEach(cartela => {
                html += `
                    <div class="cartela-vendida">
                        <strong>ID: ${cartela.id}</strong><br>
                        Comprador: ${cartela.nomeComprador || 'N/A'}<br>
                        Telefone: ${cartela.telefone || 'N/A'}<br>
                        Preço: R$ ${(cartela.preco || 0).toFixed(2).replace('.', ',')}<br>
                        Data: ${cartela.dataVenda ? new Date(cartela.dataVenda).toLocaleString() : 'N/A'}
                    </div>
                `;
            });
            html += '</div>';
            listaCartelas.innerHTML = html;
        }
        
        modalVendas.style.display = 'block';
    }

    function updateUserInfo() {
        const adminUserSpan = document.getElementById('admin-user');
        const sessionTimeSpan = document.getElementById('session-time');
        
        if (window.bingoAuth && window.bingoAuth.isAuthenticated()) {
            const user = window.bingoAuth.getCurrentUser();
            if (adminUserSpan) adminUserSpan.textContent = `👤 ${user.email}`;
            
            const loginTime = new Date(user.loginTime);
            if (sessionTimeSpan) sessionTimeSpan.textContent = `⏰ ${loginTime.toLocaleTimeString()}`;
        }
    }

    function logout() {
        if (confirm('Deseja realmente sair do sistema?')) {
            window.bingoAuth.logout();
            window.location.href = 'login.html';
        }
    }

    // ===== CONFIGURAR EVENT LISTENERS =====
    console.log('🔧 Configurando event listeners...');
    
    // Verificar se todos os botões existem antes de adicionar listeners
    if (salvarConfigBtn) {
        salvarConfigBtn.addEventListener('click', salvarConfiguracoes);
        console.log('✅ Event listener adicionado: salvar-config');
    } else {
        console.error('❌ Botão salvar-config não encontrado');
    }
    
    if (resetarJogoBtn) {
        resetarJogoBtn.addEventListener('click', resetarJogo);
        console.log('✅ Event listener adicionado: resetar-jogo');
    } else {
        console.error('❌ Botão resetar-jogo não encontrado');
    }
    
    if (limparHistoricoBtn) {
        limparHistoricoBtn.addEventListener('click', limparHistorico);
        console.log('✅ Event listener adicionado: limpar-historico');
    } else {
        console.error('❌ Botão limpar-historico não encontrado');
    }
    
    if (irParaBingoBtn) {
        irParaBingoBtn.addEventListener('click', irParaBingo);
        console.log('✅ Event listener adicionado: ir-para-bingo');
    } else {
        console.error('❌ Botão ir-para-bingo não encontrado');
    }
    
    if (gerarCartelaBtn) {
        gerarCartelaBtn.addEventListener('click', gerarNovaCartela);
        console.log('✅ Event listener adicionado: gerar-cartela');
    } else {
        console.error('❌ Botão gerar-cartela não encontrado');
    }
    
    if (verVendasBtn) {
        verVendasBtn.addEventListener('click', verVendas);
        console.log('✅ Event listener adicionado: ver-vendas');
    } else {
        console.error('❌ Botão ver-vendas não encontrado');
    }

    // Atualizar total de números quando os inputs mudarem
    if (numeroInicialInput) {
        numeroInicialInput.addEventListener('input', atualizarDisplay);
        console.log('✅ Event listener adicionado: numero-inicial');
    }
    
    if (numeroFinalInput) {
        numeroFinalInput.addEventListener('input', atualizarDisplay);
        console.log('✅ Event listener adicionado: numero-final');
    }

    // Fechar modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (modalVendas) modalVendas.style.display = 'none';
        });
        console.log('✅ Event listener adicionado: close-modal');
    }

    if (modalVendas) {
        window.addEventListener('click', (event) => {
            if (event.target === modalVendas) {
                modalVendas.style.display = 'none';
            }
        });
    }

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
        
        .vendas-lista {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .cartela-vendida {
            border: 1px solid #ddd;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            background: #f9f9f9;
        }
    `;
    document.head.appendChild(style);

    // Carregar dados iniciais
    console.log('📊 Carregando dados iniciais...');
    await carregarDados();
    
    console.log('✅ Admin panel totalmente carregado e configurado!');
});
