// Função para aguardar sistema de autenticação estar disponível
function waitForAuthSystem() {
    return new Promise((resolve) => {
        if (typeof window.bingoAuth !== 'undefined') {
            resolve();
            return;
        }
        
        const checkAuth = () => {
            if (typeof window.bingoAuth !== 'undefined') {
                resolve();
            } else {
                setTimeout(checkAuth, 100);
            }
        };
        
        checkAuth();
    });
}

// Função para aguardar todas as dependências estarem disponíveis
function waitForAllDependencies() {
    return new Promise((resolve, reject) => {
        let tentativas = 0;
        const maxTentativas = 50; // 5 segundos
        
        const checkDependencies = () => {
            tentativas++;
            
            const dependencias = {
                'Firebase SDK': typeof firebase !== 'undefined',
                'Firebase Config': typeof firebaseConfig !== 'undefined', 
                'FirebaseService': typeof FirebaseService !== 'undefined',
                'BingoAuth': typeof window.bingoAuth !== 'undefined'
            };
            
            const dependenciasFaltando = Object.entries(dependencias)
                .filter(([nome, carregado]) => !carregado)
                .map(([nome]) => nome);
            
            if (dependenciasFaltando.length === 0) {
                console.log('✅ [DEBUG] Todas as dependências disponíveis');
                resolve();
                return;
            }
            
            if (tentativas >= maxTentativas) {
                reject(new Error(`Timeout: Dependências não carregaram: ${dependenciasFaltando.join(', ')}`));
                return;
            }
            
            console.log(`🔄 [DEBUG] Aguardando dependências (${tentativas}/${maxTentativas}):`, dependenciasFaltando);
            setTimeout(checkDependencies, 100);
        };
        
        checkDependencies();
    });
}

// Função principal de inicialização
async function initializeAdmin() {
    console.log('🔐 [ADMIN] Inicializando área administrativa...');
    
    try {
        // Tentar aguardar dependências com timeout menor
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout na verificação de dependências')), 3000);
        });
        
        const waitDeps = waitForAllDependencies();
        
        await Promise.race([waitDeps, timeout]);
        console.log('🔐 [ADMIN] Todas as dependências carregadas');
        
        // Verificar autenticação de forma mais flexível
        if (typeof window.bingoAuth !== 'undefined') {
            let autenticado = window.bingoAuth.isAuthenticated();
            console.log('🔐 [ADMIN] Status autenticação inicial:', autenticado);
            
            if (!autenticado) {
                console.log('🔐 [ADMIN] Usuário não autenticado, solicitando login...');
                autenticado = window.bingoAuth.requireAuth();
                console.log('🔐 [ADMIN] Resultado da autenticação:', autenticado);
                
                if (!autenticado) {
                    console.log('❌ [ADMIN] Autenticação cancelada/falhou, redirecionando...');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                    return;
                }
            }
            
            console.log('✅ [ADMIN] Usuário autenticado com sucesso');
            updateUserInfo();
        } else {
            console.warn('⚠️ [ADMIN] Sistema de autenticação não disponível, continuando sem autenticação');
        }
        
        // Continuar com a inicialização da página admin
        await initializeAdminPage();
        
    } catch (error) {
        console.error('❌ [ADMIN] Erro na inicialização:', error);
        throw error; // Re-throw para o catch principal
    }
}

async function initializeAdminPage() {
    
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

    // Inicialização robusta do Firebase Service
    console.log('🔥 [ADMIN] Inicializando Firebase Service...');
    
    let firebaseService = null;
    let sistemaInicializado = false;
    
    // Função para inicializar Firebase Service
    async function inicializarFirebase() {
        try {
            console.log('� [ADMIN] Verificando dependências...');
            
            // Verificar se Firebase SDK está carregado
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK não carregado');
            }
            console.log('✅ [ADMIN] Firebase SDK carregado');
            
            // Tentar criar instância do Firebase Service
            if (typeof FirebaseService !== 'undefined') {
                firebaseService = new FirebaseService();
                console.log('✅ [ADMIN] Firebase Service instanciado');
                
                // Testar conexão
                try {
                    const conexaoOk = await firebaseService.verificarConexao();
                    if (conexaoOk) {
                        console.log('✅ [ADMIN] Conexão com Firebase estabelecida');
                        sistemaInicializado = true;
                        window.firebaseService = firebaseService; // Para compatibilidade
                        return true;
                    } else {
                        console.warn('⚠️ [ADMIN] Conexão fraca, mas continuando...');
                        sistemaInicializado = true;
                        window.firebaseService = firebaseService;
                        return true;
                    }
                } catch (connError) {
                    console.warn('⚠️ [ADMIN] Erro na verificação de conexão, mas continuando:', connError.message);
                    sistemaInicializado = true;
                    window.firebaseService = firebaseService;
                    return true;
                }
            } else {
                throw new Error('Classe FirebaseService não encontrada');
            }
            
        } catch (error) {
            console.error('❌ [ADMIN] Erro ao inicializar Firebase:', error.message);
            return false;
        }
    }
    
    // Tentar inicializar Firebase
    const firebaseInicializado = await inicializarFirebase();
    
    if (!firebaseInicializado) {
        console.error('❌ [ADMIN] Firebase não conseguiu inicializar');
        alert('❌ Erro ao carregar sistema Firebase. Verifique sua conexão com a internet e recarregue a página.');
        return;
    }
    
    console.log('🎉 [ADMIN] Firebase inicializado com sucesso!');

    // ===== FUNÇÕES PRINCIPAIS =====

    // Carregar dados do Firebase
    async function carregarDados() {
        try {
            console.log('📦 [ADMIN] Carregando dados...');
            
            if (sistemaInicializado && firebaseService) {
                configuracoes = await firebaseService.carregarConfiguracoes();
                numerosSorteados = await firebaseService.carregarNumerosSorteados();
                cartelas = await firebaseService.carregarCartelas();
                console.log('✅ [ADMIN] Dados carregados do Firebase');
            } else {
                console.warn('⚠️ [ADMIN] Firebase não disponível, carregando dados locais');
                carregarDadosLocais();
            }

            // Também verificar localStorage como fallback
            const cartelasLocais = JSON.parse(localStorage.getItem('bingo_cartelas_vendidas') || '[]');
            if (cartelasLocais.length > 0 && cartelas.length === 0) {
                cartelas = cartelasLocais;
                console.log('📂 [ADMIN] Usando dados locais como fallback');
            }

            atualizarTodosDisplays();
            
        } catch (error) {
            console.error('❌ [ADMIN] Erro ao carregar dados:', error);
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
        console.log('💾 [ADMIN] Salvando configurações...');
        
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

            // Tentar salvar no Firebase
            if (sistemaInicializado && firebaseService && typeof firebaseService.salvarConfiguracoes === 'function') {
                await firebaseService.salvarConfiguracoes(config);
                console.log('✅ [ADMIN] Configurações salvas no Firebase');
            } else {
                console.warn('⚠️ [ADMIN] Firebase não disponível, salvando apenas localmente');
            }
            
            // Salvar também localmente
            localStorage.setItem('bingo_configuracoes', JSON.stringify(config));
            configuracoes = config;
            
            atualizarTodosDisplays();
            alert('✅ Configurações salvas com sucesso!');
            console.log('✅ [ADMIN] Configurações salvas');
            
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            alert('❌ Erro ao salvar configurações: ' + error.message);
        }
    }

    async function resetarJogo() {
        if (!confirm('⚠️ ATENÇÃO: Isso irá resetar TODOS os dados do jogo (números sorteados, cartelas, etc.). Continuar?')) {
            return;
        }

        console.log('🔄 [ADMIN] Resetando jogo...');
        
        try {
            // Tentar resetar no Firebase
            if (sistemaInicializado && firebaseService && typeof firebaseService.resetarJogo === 'function') {
                await firebaseService.resetarJogo();
                console.log('✅ [ADMIN] Jogo resetado no Firebase');
            } else {
                console.warn('⚠️ [ADMIN] Firebase não disponível, resetando apenas dados locais');
            }
            
            // Limpar dados locais
            localStorage.removeItem('numeros_sorteados');
            localStorage.removeItem('bingo_cartelas_vendidas');
            
            numerosSorteados = [];
            cartelas = [];
            
            atualizarTodosDisplays();
            alert('✅ Jogo resetado com sucesso!');
            console.log('✅ [ADMIN] Jogo resetado');
            
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
        window.open('bingo-original.html', '_blank');
    }

    async function gerarNovaCartela() {
        console.log('🎫 [ADMIN] Gerando nova cartela...');
        
        try {
            // Verificar se sistema está inicializado
            if (!sistemaInicializado || !firebaseService) {
                throw new Error('Sistema Firebase não inicializado');
            }
            
            const preco = parseFloat(precoCartelaInput?.value || 5);
            const novaCartela = {
                id: Date.now().toString(),
                numeros: gerarNumerosCartela(),
                preco: preco,
                vendida: false,
                dataGeracao: new Date().toISOString()
            };

            console.log('💾 [ADMIN] Salvando cartela no Firebase...');
            if (firebaseService && typeof firebaseService.salvarCartela === 'function') {
                await firebaseService.salvarCartela(novaCartela);
                console.log('✅ [ADMIN] Cartela salva no Firebase');
            } else {
                console.warn('⚠️ [ADMIN] FirebaseService.salvarCartela não disponível, salvando apenas localmente');
            }
            
            cartelas.push(novaCartela);
            localStorage.setItem('bingo_cartelas_vendidas', JSON.stringify(cartelas));
            
            atualizarEstatisticasCartelas();
            alert(`✅ Nova cartela gerada! ID: ${novaCartela.id}`);
            console.log('✅ [ADMIN] Cartela gerada:', novaCartela.id);
            
        } catch (error) {
            console.error('❌ [ADMIN] Erro ao gerar cartela:', error);
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
            const user = window.bingoAuth.currentUser;
            if (adminUserSpan) adminUserSpan.textContent = `👤 ${user.username}`;
            
            const authTime = localStorage.getItem('admin_auth_time');
            if (authTime && sessionTimeSpan) {
                const loginTime = new Date(parseInt(authTime));
                sessionTimeSpan.textContent = `⏰ ${loginTime.toLocaleTimeString()}`;
            }
        }
    }

    function logout() {
        if (confirm('Deseja realmente sair do sistema?')) {
            window.bingoAuth.logout();
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
}

// Função de inicialização simples como fallback
async function initializeAdminSimple() {
    console.log('🔄 [SIMPLE] Inicialização simples do admin...');
    
    // Inicializar Firebase básico
    if (!firebase.apps.length) {
        if (typeof firebaseConfig !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
        } else {
            throw new Error('firebaseConfig não encontrado');
        }
    }
    
    // Configurar variáveis globais básicas
    window.db = window.db || firebase.firestore();
    window.auth = window.auth || firebase.auth();
    
    // Pular autenticação por enquanto para debug
    console.log('⚠️ [SIMPLE] Pulando autenticação para debug');
    
    // Configurar botões básicos
    setupBasicButtons();
    
    console.log('✅ [SIMPLE] Inicialização simples concluída');
}

// Configurar botões básicos
function setupBasicButtons() {
    console.log('🔄 [SIMPLE] Configurando botões básicos...');
    
    // Botão salvar configurações
    const salvarConfigBtn = document.getElementById('salvar-config');
    if (salvarConfigBtn) {
        salvarConfigBtn.onclick = () => {
            console.log('🔄 Botão salvar config clicado');
            alert('Função em desenvolvimento - modo debug');
        };
        console.log('✅ Botão salvar-config configurado');
    } else {
        console.error('❌ Botão salvar-config não encontrado');
    }
    
    // Botão resetar jogo
    const resetarJogoBtn = document.getElementById('resetar-jogo');
    if (resetarJogoBtn) {
        resetarJogoBtn.onclick = () => {
            console.log('🔄 Botão resetar jogo clicado');
            alert('Função em desenvolvimento - modo debug');
        };
        console.log('✅ Botão resetar-jogo configurado');
    } else {
        console.error('❌ Botão resetar-jogo não encontrado');
    }
    
    // Botão ir para bingo
    const irParaBingoBtn = document.getElementById('ir-para-bingo');
    if (irParaBingoBtn) {
        irParaBingoBtn.onclick = () => {
            console.log('🔄 Botão ir para bingo clicado');
            window.location.href = 'bingo-original.html';
        };
        console.log('✅ Botão ir-para-bingo configurado');
    } else {
        console.error('❌ Botão ir-para-bingo não encontrado');
    }
    
    // Botão gerar cartela
    const gerarCartelaBtn = document.getElementById('gerar-cartela');
    if (gerarCartelaBtn) {
        gerarCartelaBtn.onclick = () => {
            console.log('🔄 Botão gerar cartela clicado');
            alert('Função em desenvolvimento - modo debug');
        };
        console.log('✅ Botão gerar-cartela configurado');
    } else {
        console.error('❌ Botão gerar-cartela não encontrado');
    }
    
    // Outros botões...
    const verVendasBtn = document.getElementById('ver-vendas');
    if (verVendasBtn) {
        verVendasBtn.onclick = () => {
            console.log('🔄 Botão ver vendas clicado');
            alert('Função em desenvolvimento - modo debug');
        };
        console.log('✅ Botão ver-vendas configurado');
    }
    
    console.log('✅ [SIMPLE] Botões básicos configurados');
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 [DEBUG] DOM carregado, iniciando admin...');
    
    try {
        // Aguardar um pouco para garantir que os scripts carregaram
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar dependências básicas
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK não carregado');
        }
        
        if (typeof FirebaseService === 'undefined') {
            throw new Error('FirebaseService não carregado');
        }
        
        console.log('✅ [DEBUG] Dependências básicas ok, iniciando...');
        
        await initializeAdmin();
        
    } catch (error) {
        console.error('❌ [ADMIN] Erro ao inicializar:', error);
        console.error('❌ [ADMIN] Stack trace:', error.stack);
        
        // Mostrar erro específico para debug
        const errorMessage = `Erro ao inicializar área administrativa: ${error.message}`;
        console.error(errorMessage);
        
        // Tentar uma inicialização mais simples
        console.log('🔄 [DEBUG] Tentando inicialização simples...');
        try {
            await initializeAdminSimple();
        } catch (simpleError) {
            console.error('❌ [ADMIN] Falha na inicialização simples:', simpleError);
            alert(`${errorMessage}\n\nDetalhes: ${simpleError.message}\n\nRecarregue a página.`);
        }
    }
});
