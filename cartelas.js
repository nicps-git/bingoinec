// ===== FUNÇÕES DE VERIFICAÇÃO DE ACESSO =====

function verificarAcessoAdmin() {
    if (window.bingoAuth && window.bingoAuth.isAuthenticated()) {
        window.location.href = 'admin.html';
    } else {
        if (confirm('Para acessar a área administrativa, é necessário fazer login. Deseja ir para a página de login?')) {
            window.location.href = 'login.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando página de cartelas...');
    
    const precoCartelaSpan = document.getElementById('preco-cartela');
    const cartelasDisponiveisSpan = document.getElementById('cartelas-disponiveis');
    const cartelaPreview = document.getElementById('cartela-preview');
    const gerarPreviewBtn = document.getElementById('gerar-preview');
    const comprarCartelaBtn = document.getElementById('comprar-cartela');
    const carrinhoLista = document.getElementById('carrinho-lista');
    const carrinhoTotal = document.getElementById('carrinho-total');
    const finalizarCompraBtn = document.getElementById('finalizar-compra');
    const limparCarrinhoBtn = document.getElementById('limpar-carrinho');
    const modalCheckout = document.getElementById('modal-checkout');
    const formCheckout = document.getElementById('form-checkout');
    const closeModal = document.querySelector('.close');

    console.log('📋 Elementos DOM obtidos');

    let cartelaAtual = null;
    let carrinho = [];
    let configuracoes = {};

    console.log('📊 Variáveis inicializadas');

    // Verificar conexão com Firebase
    console.log('🔥 Verificando conexão com Firebase...');
    
    let conexaoOk = false;
    let statusFirebase = 'desconhecido';
    
    try {
        // Verificar se Firebase está carregado
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK não carregado');
        }
        
        if (typeof firebaseService === 'undefined') {
            throw new Error('Firebase Service não carregado');
        }
        
        // Tentar verificar conexão
        conexaoOk = await firebaseService.verificarConexao();
        statusFirebase = conexaoOk ? 'conectado' : 'offline';
        
    } catch (error) {
        console.error('❌ Erro ao verificar conexão Firebase:', error);
        statusFirebase = 'erro: ' + error.message;
    }
    
    console.log(`🔥 Status Firebase: ${statusFirebase}`);
    
    if (!conexaoOk) {
        console.warn('⚠️ Modo offline - usando armazenamento local como backup');
    }

    // Carregar dados iniciais
    async function carregarDados() {
        try {
            // Tentar carregar configurações do Firebase
            configuracoes = await firebaseService.carregarConfiguracoes();
            console.log('✅ Configurações carregadas do Firebase');
        } catch (error) {
            console.error('❌ Erro ao carregar configurações do Firebase:', error);
            // Usar configurações padrão
            configuracoes = {
                numeroInicial: 1,
                numeroFinal: 75,
                precoCartela: 5.00
            };
            console.log('🔧 Usando configurações padrão');
        }
        
        const preco = configuracoes.precoCartela || 5.00;
        precoCartelaSpan.textContent = `R$ ${preco.toFixed(2)}`;
        
        // Carregar carrinho do localStorage temporariamente (apenas sessão)
        carrinho = JSON.parse(localStorage.getItem('bingo_carrinho') || '[]');
        atualizarCarrinho();
        
        console.log('✅ Dados carregados - sistema pronto');
    }

    // Gerar preview da cartela
    function gerarPreview() {
        const inicial = configuracoes.numeroInicial || 1;
        const final = configuracoes.numeroFinal || 75;
        
        if (final - inicial + 1 < 25) {
            alert('⚠️ Range insuficiente para gerar cartela. Configure no painel administrativo.');
            return;
        }

        cartelaAtual = {
            id: Date.now(),
            numeros: gerarNumerosCartela(inicial, final),
            preco: configuracoes.precoCartela || 5.00
        };

        exibirCartela(cartelaAtual);
        comprarCartelaBtn.disabled = false;
    }

    // Gerar números da cartela
    function gerarNumerosCartela(min, max) {
        const numeros = [];
        const totalRange = max - min + 1;
        const colSize = Math.floor(totalRange / 5);
        
        const ranges = [
            { min: min, max: Math.min(min + colSize - 1, max) },
            { min: Math.min(min + colSize, max), max: Math.min(min + (colSize * 2) - 1, max) },
            { min: Math.min(min + (colSize * 2), max), max: Math.min(min + (colSize * 3) - 1, max) },
            { min: Math.min(min + (colSize * 3), max), max: Math.min(min + (colSize * 4) - 1, max) },
            { min: Math.min(min + (colSize * 4), max), max: max }
        ];

        for (let col = 0; col < 5; col++) {
            const colNums = [];
            const range = ranges[col];
            
            if (range.min > range.max) continue;
            
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
        if (numeros[2]) {
            numeros[2][2] = 'FREE';
        }
        
        return numeros;
    }

    // Exibir cartela no preview
    function exibirCartela(cartela) {
        const html = `
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
        `;
        
        cartelaPreview.innerHTML = html;
        
        // Animação de entrada
        const cells = cartelaPreview.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.style.opacity = '0';
            cell.style.transform = 'scale(0)';
            setTimeout(() => {
                cell.style.transition = 'all 0.3s ease';
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            }, index * 50);
        });
    }

    // Adicionar cartela ao carrinho
    function adicionarAoCarrinho() {
        if (!cartelaAtual) return;

        const item = {
            id: cartelaAtual.id,
            numeros: cartelaAtual.numeros,
            preco: cartelaAtual.preco,
            dataAdicao: new Date().toISOString()
        };

        carrinho.push(item);
        localStorage.setItem('bingo_carrinho', JSON.stringify(carrinho));
        
        atualizarCarrinho();
        
        // Reset preview
        cartelaAtual = null;
        cartelaPreview.innerHTML = '<div class="cartela-vazia"><p>✅ Cartela adicionada ao carrinho!<br>Gere uma nova cartela para continuar.</p></div>';
        comprarCartelaBtn.disabled = true;

        // Feedback visual
        comprarCartelaBtn.textContent = '✅ Adicionada!';
        setTimeout(() => {
            comprarCartelaBtn.textContent = '💳 Comprar Esta Cartela';
        }, 2000);
    }

    // Atualizar exibição do carrinho
    function atualizarCarrinho() {
        if (carrinho.length === 0) {
            carrinhoLista.innerHTML = '<p class="carrinho-vazio">Carrinho vazio</p>';
            carrinhoTotal.textContent = 'R$ 0,00';
            finalizarCompraBtn.disabled = true;
            return;
        }

        const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
        
        carrinhoLista.innerHTML = carrinho.map((item, index) => `
            <div class="carrinho-item">
                <div>
                    <strong>Cartela #${index + 1}</strong><br>
                    <small>R$ ${item.preco.toFixed(2)}</small>
                </div>
                <button onclick="removerDoCarrinho(${index})" class="btn-danger" style="padding: 5px 10px; font-size: 12px;">
                    🗑️
                </button>
            </div>
        `).join('');

        carrinhoTotal.textContent = `R$ ${total.toFixed(2)}`;
        finalizarCompraBtn.disabled = false;
    }

    // Remover item do carrinho
    function removerDoCarrinho(index) {
        carrinho.splice(index, 1);
        localStorage.setItem('bingo_carrinho', JSON.stringify(carrinho));
        atualizarCarrinho();
    }

    // Limpar carrinho
    function limparCarrinho() {
        if (carrinho.length === 0) return;
        
        if (confirm('🗑️ Deseja limpar todo o carrinho?')) {
            carrinho = [];
            localStorage.setItem('bingo_carrinho', JSON.stringify(carrinho));
            atualizarCarrinho();
        }
    }

    // Abrir modal de checkout
    function abrirCheckout() {
        if (carrinho.length === 0) return;

        const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
        
        // Preencher resumo
        document.getElementById('resumo-cartelas').innerHTML = `
            <p><strong>${carrinho.length} cartela(s) selecionada(s)</strong></p>
            ${carrinho.map((item, index) => `
                <p>Cartela #${index + 1}: R$ ${item.preco.toFixed(2)}</p>
            `).join('')}
        `;
        
        document.getElementById('total-final').textContent = `R$ ${total.toFixed(2)}`;
        
        modalCheckout.style.display = 'block';
    }

    // Fechar modal de checkout
    function fecharCheckout() {
        modalCheckout.style.display = 'none';
        formCheckout.reset();
    }

    // Processar compra
    async function processarCompra(event) {
        event.preventDefault();
        
        const formData = new FormData(formCheckout);
        const comprador = {
            nome: document.getElementById('nome-comprador').value,
            telefone: document.getElementById('telefone-comprador').value,
            email: document.getElementById('email-comprador').value || null
        };

        // Declarar variável cartelasParaSalvar no topo da função
        let cartelasParaSalvar = [];

        try {
            // Desabilitar botão para evitar duplo envio
            const submitBtn = formCheckout.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processando...';

            console.log('💳 Iniciando processamento da compra...');
            console.log('🛒 Carrinho:', carrinho);
            console.log('👤 Comprador:', comprador);

            // Verificar se o carrinho não está vazio
            if (!carrinho || carrinho.length === 0) {
                throw new Error('Carrinho está vazio');
            }

            // Preparar cartelas para salvar no formato correto
            cartelasParaSalvar = carrinho.map(item => ({
                id: `cartela_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                numeros: item.numeros,
                preco: item.preco,
                vendida: true,
                comprador: comprador.nome,
                telefone: comprador.telefone,
                email: comprador.email,
                dataVenda: new Date().toISOString(),
                timestamp: new Date()
            }));

            console.log('🎫 Cartelas preparadas para salvar:', cartelasParaSalvar.length);

            // Verificar se o Firebase está disponível
            let salvoComSucesso = false;
            
            if (typeof firebaseService !== 'undefined') {
                try {
                    // Tentar salvar no Firebase
                    console.log('🔥 Tentando salvar no Firebase...');
                    
                    // Salvar todas as cartelas no Firebase
                    for (let i = 0; i < cartelasParaSalvar.length; i++) {
                        const cartela = cartelasParaSalvar[i];
                        console.log(`💾 Salvando cartela ${i + 1}/${cartelasParaSalvar.length}:`, cartela.id);
                        
                        await firebaseService.salvarCartela(cartela);
                        console.log(`✅ Cartela ${cartela.id} salva com sucesso`);
                    }
                    
                    salvoComSucesso = true;
                    console.log('✅ Todas as cartelas salvas no Firebase');
                    
                } catch (firebaseError) {
                    console.error('❌ Erro do Firebase:', firebaseError);
                    console.log('💾 Salvando localmente como backup...');
                    
                    // Salvar localmente como fallback
                    const cartelasLocais = JSON.parse(localStorage.getItem('bingo_cartelas_vendidas') || '[]');
                    cartelasLocais.push(...cartelasParaSalvar);
                    localStorage.setItem('bingo_cartelas_vendidas', JSON.stringify(cartelasLocais));
                    
                    salvoComSucesso = true;
                    console.log('✅ Cartelas salvas localmente como backup');
                }
            } else {
                console.log('💾 Firebase não disponível, salvando localmente...');
                
                // Salvar localmente
                const cartelasLocais = JSON.parse(localStorage.getItem('bingo_cartelas_vendidas') || '[]');
                cartelasLocais.push(...cartelasParaSalvar);
                localStorage.setItem('bingo_cartelas_vendidas', JSON.stringify(cartelasLocais));
                
                salvoComSucesso = true;
                console.log('✅ Cartelas salvas localmente');
            }
            
            if (!salvoComSucesso) {
                throw new Error('Não foi possível salvar as cartelas');
            }

            // Limpar carrinho
            carrinho = [];
            localStorage.setItem('bingo_carrinho', JSON.stringify(carrinho));

            // Fechar modal
            fecharCheckout();
            atualizarCarrinho();

            // Sucesso
            alert(`🎉 Compra realizada com sucesso!\n\n👤 Comprador: ${comprador.nome}\n📱 Telefone: ${comprador.telefone}\n🎫 Cartelas: ${cartelasParaSalvar.length}\n\nSuas cartelas foram registradas no sistema!`);
            
            // Criar confete
            criarConfeteSucesso();

        } catch (error) {
            console.error('❌ Erro detalhado ao processar compra:', error);
            console.error('❌ Stack trace:', error.stack);
            
            // Mostrar erro mais específico
            let mensagemErro = 'Erro ao processar compra. ';
            if (error.message.includes('Firebase Service')) {
                mensagemErro += 'Sistema offline. Verifique sua conexão.';
            } else if (error.message.includes('Permission denied')) {
                mensagemErro += 'Problema de permissão no banco de dados.';
            } else if (error.message.includes('Network')) {
                mensagemErro += 'Problema de conexão. Verifique sua internet.';
            } else {
                mensagemErro += `Detalhes: ${error.message}`;
            }
            
            alert('❌ ' + mensagemErro);
        } finally {
            // Reabilitar botão
            const submitBtn = formCheckout.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = '🎉 Finalizar Compra';
        }
    }

    // Criar confete de sucesso
    function criarConfeteSucesso() {
        const elementos = ['🎉', '🎊', '✨', '🎈', '🌟', '⭐'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confete = document.createElement('div');
                confete.style.position = 'fixed';
                confete.style.left = Math.random() * 100 + 'vw';
                confete.style.top = '-50px';
                confete.style.fontSize = '2em';
                confete.style.zIndex = '3000';
                confete.style.pointerEvents = 'none';
                confete.style.animation = 'confetti-fall 4s linear forwards';
                confete.textContent = elementos[Math.floor(Math.random() * elementos.length)];
                
                document.body.appendChild(confete);
                
                setTimeout(() => confete.remove(), 4000);
            }, i * 100);
        }
    }

    // Event listeners
    console.log('🔗 Configurando event listeners...');
    
    gerarPreviewBtn.addEventListener('click', () => {
        console.log('🎯 Botão Gerar Preview clicado!');
        gerarPreview();
    });
    
    comprarCartelaBtn.addEventListener('click', () => {
        console.log('🛒 Botão Comprar clicado!');
        adicionarAoCarrinho();
    });
    
    finalizarCompraBtn.addEventListener('click', abrirCheckout);
    limparCarrinhoBtn.addEventListener('click', limparCarrinho);
    formCheckout.addEventListener('submit', processarCompra);
    closeModal.addEventListener('click', fecharCheckout);
    
    // Fechar modal clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === modalCheckout) {
            fecharCheckout();
        }
    });

    // Tornar função global
    window.removerDoCarrinho = removerDoCarrinho;
    window.fecharCheckout = fecharCheckout;

    // Adicionar estilos de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Carregar dados ao iniciar
    console.log('📊 Carregando dados iniciais...');
    await carregarDados();
    
    console.log('✅ Cartelas page loaded - Sistema pronto!');
});
