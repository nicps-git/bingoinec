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

document.addEventListener('DOMContentLoaded', () => {
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

    // Chaves para localStorage
    const STORAGE_KEYS = {
        numeroInicial: 'bingo_numero_inicial',
        numeroFinal: 'bingo_numero_final',
        cartelas: 'bingo_cartelas',
        precoCartela: 'bingo_preco_cartela',
        carrinho: 'bingo_carrinho'
    };

    let cartelaAtual = null;
    let carrinho = [];

    // Carregar dados iniciais
    function carregarDados() {
        const preco = parseFloat(localStorage.getItem(STORAGE_KEYS.precoCartela)) || 5.00;
        precoCartelaSpan.textContent = `R$ ${preco.toFixed(2)}`;
        
        carrinho = JSON.parse(localStorage.getItem(STORAGE_KEYS.carrinho) || '[]');
        atualizarCarrinho();
    }

    // Gerar preview da cartela
    function gerarPreview() {
        const inicial = parseInt(localStorage.getItem(STORAGE_KEYS.numeroInicial)) || 1;
        const final = parseInt(localStorage.getItem(STORAGE_KEYS.numeroFinal)) || 75;
        
        if (final - inicial + 1 < 25) {
            alert('⚠️ Range insuficiente para gerar cartela. Configure no painel administrativo.');
            return;
        }

        cartelaAtual = {
            id: Date.now(),
            numeros: gerarNumerosCartela(inicial, final),
            preco: parseFloat(localStorage.getItem(STORAGE_KEYS.precoCartela)) || 5.00
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
        localStorage.setItem(STORAGE_KEYS.carrinho, JSON.stringify(carrinho));
        
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
        localStorage.setItem(STORAGE_KEYS.carrinho, JSON.stringify(carrinho));
        atualizarCarrinho();
    }

    // Limpar carrinho
    function limparCarrinho() {
        if (carrinho.length === 0) return;
        
        if (confirm('🗑️ Deseja limpar todo o carrinho?')) {
            carrinho = [];
            localStorage.setItem(STORAGE_KEYS.carrinho, JSON.stringify(carrinho));
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
    function processarCompra(event) {
        event.preventDefault();
        
        const formData = new FormData(formCheckout);
        const comprador = {
            nome: document.getElementById('nome-comprador').value,
            telefone: document.getElementById('telefone-comprador').value,
            email: document.getElementById('email-comprador').value || null
        };

        // Salvar cartelas como vendidas
        const cartelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.cartelas) || '[]');
        
        carrinho.forEach((itemCarrinho, index) => {
            const cartela = {
                id: itemCarrinho.id,
                numero: cartelas.length + index + 1,
                preco: itemCarrinho.preco,
                numeros: itemCarrinho.numeros,
                dataGeracao: itemCarrinho.dataAdicao,
                vendida: true,
                comprador: comprador.nome,
                telefone: comprador.telefone,
                email: comprador.email,
                dataVenda: new Date().toISOString()
            };
            
            cartelas.push(cartela);
        });

        localStorage.setItem(STORAGE_KEYS.cartelas, JSON.stringify(cartelas));

        // Limpar carrinho
        carrinho = [];
        localStorage.setItem(STORAGE_KEYS.carrinho, JSON.stringify(carrinho));

        // Fechar modal
        fecharCheckout();
        atualizarCarrinho();

        // Sucesso
        alert(`🎉 Compra realizada com sucesso!\n\n👤 Comprador: ${comprador.nome}\n📱 Telefone: ${comprador.telefone}\n🎫 Cartelas: ${cartelas.length}\n\nSuas cartelas foram registradas no sistema!`);
        
        // Criar confete
        criarConfeteSucesso();
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
    gerarPreviewBtn.addEventListener('click', gerarPreview);
    comprarCartelaBtn.addEventListener('click', adicionarAoCarrinho);
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
    carregarDados();
    
    console.log('Cartelas page loaded');
});
