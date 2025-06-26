// CARTELAS.JS - VERSÃO SIMPLES E FUNCIONAL
console.log('🎫 Carregando cartelas.js...');

// Variáveis globais
let cartelaAtual = null;
let carrinho = [];
let configuracoes = {
    numeroInicial: 1,
    numeroFinal: 75,
    precoCartela: 5.00
};

// Recuperar carrinho do localStorage
function carregarCarrinhoDoStorage() {
    try {
        const carrinhoStorage = localStorage.getItem('bingo-carrinho');
        if (carrinhoStorage) {
            const carrinhoRecuperado = JSON.parse(carrinhoStorage);
            if (Array.isArray(carrinhoRecuperado)) {
                carrinho = carrinhoRecuperado;
                window.carrinho = carrinho;
                console.log('🔄 Carrinho recuperado do localStorage:', carrinho);
                return true;
            }
        }
    } catch (error) {
        console.warn('⚠️ Erro ao recuperar carrinho do localStorage:', error);
    }
    return false;
}

// Variáveis Firebase
let firebaseService = null;

// Função principal para gerar cartela (renomeada para evitar conflito)
function gerarCartelaCompleta() {
    console.log('🎲 Gerando nova cartela completa...');
    
    try {
        // Gerar números aleatórios
        const numeros = [];
        const numeroInicial = 1;
        const numeroFinal = 75;
        
        // Criar array de números disponíveis
        const disponiveis = [];
        for (let i = numeroInicial; i <= numeroFinal; i++) {
            disponiveis.push(i);
        }
        
        // Escolher 24 números aleatórios (padrão do BINGO sem o espaço livre central)
        for (let i = 0; i < 24; i++) {
            const indice = Math.floor(Math.random() * disponiveis.length);
            numeros.push(disponiveis.splice(indice, 1)[0]);
        }
        
        // Ordenar números
        numeros.sort((a, b) => a - b);
        
        // Criar objeto da cartela
        cartelaAtual = {
            id: `CART-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            numeros: numeros,
            preco: 5.00,
            status: 'preview'
        };
        
        console.log('📋 Cartela gerada:', cartelaAtual);
        
        // Mostrar cartela na tela
        mostrarCartela(cartelaAtual);
        
        console.log('✅ Cartela exibida com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao gerar cartela:', error);
        alert('Erro ao gerar cartela: ' + error.message);
    }
}

// Inicializar Firebase
async function inicializarFirebase() {
    try {
        console.log('🔥 Inicializando Firebase...');
        
        // Verificar se firebase está disponível
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK não disponível ainda');
            return;
        }
        
        // Verificar se a função de inicialização unificada existe
        if (typeof initializeFirebaseUnified === 'function') {
            await initializeFirebaseUnified();
            console.log('✅ Firebase inicializado via função unificada');
        } else if (typeof FirebaseService !== 'undefined') {
            firebaseService = new FirebaseService();
            console.log('✅ Firebase Service criado');
        } else {
            console.warn('⚠️ Nenhuma função de inicialização encontrada');
        }
        
        // Verificar se FirebaseDB está disponível
        if (window.FirebaseDB) {
            console.log('✅ FirebaseDB disponível e pronto para uso');
        } else {
            console.warn('⚠️ FirebaseDB não foi inicializado');
        }
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
    }
}

// Função para verificar acesso admin (corrige erro do console)
function verificarAcessoAdmin() {
    console.log('🔐 Redirecionando para área administrativa...');
    window.location.href = 'admin.html';
}

// Expor variáveis e funções globais para sincronização
window.carrinho = carrinho;
window.atualizarCarrinho = atualizarCarrinho;
window.verificarAcessoAdmin = verificarAcessoAdmin;

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM carregado, aguardando Firebase...');
    
    // Carregar carrinho do localStorage
    carregarCarrinhoDoStorage();
    
    // VALIDAÇÃO CRÍTICA: Aguardar Firebase estar disponível
    console.log('⏳ Aguardando Firebase estar disponível...');
    let tentativas = 0;
    const maxTentativas = 100; // 10 segundos máximo
    
    while ((!window.FirebaseDB || typeof firebase === 'undefined' || !firebase.firestore) && tentativas < maxTentativas) {
        await new Promise(resolve => setTimeout(resolve, 100));
        tentativas++;
        
        if (tentativas % 10 === 0) {
            console.log(`⏳ Aguardando Firebase... tentativa ${tentativas}/${maxTentativas}`);
        }
    }
    
    if (window.FirebaseDB && typeof firebase !== 'undefined' && firebase.firestore) {
        console.log(`✅ Firebase disponível após ${tentativas * 100}ms`);
        console.log('🔥 Firebase services disponíveis:', {
            app: !!firebase.app,
            firestore: !!firebase.firestore,
            FirebaseDB: !!window.FirebaseDB
        });
    } else {
        console.error('❌ ERRO CRÍTICO: Firebase não disponível após timeout!');
        console.error('🔍 Estado do Firebase:', {
            firebase: typeof firebase,
            FirebaseDB: !!window.FirebaseDB,
            firestore: typeof firebase !== 'undefined' ? !!firebase.firestore : false
        });
        
        // Mostrar alerta crítico para usuário
        setTimeout(() => {
            alert('❌ SISTEMA INDISPONÍVEL\n\nO sistema de banco de dados não está carregado.\nRecarregue a página e aguarde até que tudo esteja funcionando antes de usar.');
        }, 1000);
    }
    
    setTimeout(function() {
        configurarBotaoGerar();
        configurarOutrosBotoes();
        atualizarCarrinho();
        
        // Sincronizar com interface se há itens no carrinho simples
        sincronizarCarrinhoInicial();
        
        setTimeout(inicializarFirebase, 500);
        
        // Verificar status do sistema após inicialização
        setTimeout(() => {
            verificarStatusSistema();
        }, 2000);
        
        // Iniciar limpeza periódica de reservas (apenas se Firebase disponível)
        if (window.FirebaseDB && typeof firebase !== 'undefined' && firebase.firestore) {
            setTimeout(() => {
                limparReservasExpiradas();
                setInterval(limparReservasExpiradas, 5 * 60 * 1000); // A cada 5 minutos
            }, 2000);
        }
    }, 100);
});

// Sincronizar carrinho inicial com interface
function sincronizarCarrinhoInicial() {
    const itensSimples = document.querySelectorAll('#carrinho-lista .item-carrinho');
    if (itensSimples.length > 0 && carrinho.length === 0) {
        console.log('🔄 Sincronizando carrinho inicial...');
        
        // Criar cartelas fictícias para cada item da interface
        for (let i = 0; i < itensSimples.length; i++) {
            // Gerar 24 números únicos de 1 a 75
            const numerosUnicos = [];
            const disponiveis = Array.from({length: 75}, (_, idx) => idx + 1);
            for (let j = 0; j < 24; j++) {
                const indice = Math.floor(Math.random() * disponiveis.length);
                numerosUnicos.push(disponiveis.splice(indice, 1)[0]);
            }
            
            const cartela = {
                id: `CART-SYNC-${Date.now()}-${i}`,
                numeros: numerosUnicos.sort((a, b) => a - b),
                preco: 5.00,
                status: 'no-carrinho'
            };
            carrinho.push(cartela);
        }
        
        console.log(`✅ ${carrinho.length} cartela(s) sincronizada(s)`);
    }
}

// Função dedicada para configurar o botão gerar
function configurarBotaoGerar() {
    console.log('🎯 Configurando botão gerar...');
    
    const btnGerar = document.getElementById('gerar-preview');
    
    if (!btnGerar) {
        console.error('❌ Botão gerar-preview não encontrado no DOM');
        return;
    }
    
    console.log('✅ Botão encontrado:', btnGerar);
    
    // Verificar se Firebase está disponível antes de configurar
    if (!window.FirebaseDB || typeof firebase === 'undefined' || !firebase.firestore) {
        console.warn('⚠️ Firebase não disponível - botão será desabilitado');
        btnGerar.disabled = true;
        btnGerar.textContent = '❌ Sistema Indisponível (Firebase não carregado)';
        btnGerar.title = 'O Firebase não está carregado. Recarregue a página.';
        return;
    }
    
    // Configuração mais direta - apenas onclick
    btnGerar.onclick = async function() {
        console.log('🖱️ CLIQUE DETECTADO!');
        
        // Verificação crítica do Firebase no momento do clique
        if (!window.FirebaseDB || typeof firebase === 'undefined' || !firebase.firestore) {
            console.error('❌ Firebase não disponível, tentando inicializar...');
            
            // Tentar inicializar Firebase primeiro
            try {
                await inicializarFirebase();
                
                // Aguardar um pouco e tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (!window.FirebaseDB || typeof firebase === 'undefined' || !firebase.firestore) {
                    alert('❌ Sistema indisponível: Firebase não está funcionando. Por favor, recarregue a página e aguarde o carregamento completo.');
                    return;
                }
            } catch (error) {
                console.error('❌ Falha ao inicializar Firebase:', error);
                alert('❌ Erro de sistema: ' + error.message + '\nRecarregue a página.');
                return;
            }
        }
        
        // Verificar se a função corrigida está disponível
        if (typeof gerarCartelaCorrigida === 'function') {
            console.log('✅ Usando gerarCartelaCorrigida');
            await gerarCartelaCorrigida();
        } else {
            console.error('❌ gerarCartelaCorrigida não disponível');
            alert('❌ Função de geração não está disponível. Recarregue a página.');
            return;
        }
        
        return false;
    };
    
    btnGerar.disabled = false;
    btnGerar.textContent = '🎲 Gerar Nova Cartela';
    btnGerar.title = 'Gerar cartela com reserva temporária no banco';
    
    console.log('✅ Botão configurado com validação Firebase');
}

// Função wrapper para executar geração
function executarGeracao() {
    console.log('🎲 Executando geração de cartela...');
    
    try {
        gerarCartelaCompleta();
    } catch (error) {
        console.error('❌ Erro ao executar gerarCartelaCompleta:', error);
        alert('Erro: ' + error.message);
    }
}

// Mostrar cartela na interface
function mostrarCartela(cartela) {
    console.log('🎫 === EXIBINDO CARTELA ===');
    console.log('📋 Dados da cartela:', cartela);
    console.log('🔢 Números da cartela:', cartela.numeros);
    
    const container = document.getElementById('cartela-preview');
    if (!container) {
        console.error('❌ Container cartela-preview não encontrado');
        return;
    }
    
    // IMPORTANTE: Armazenar números globalmente para acesso posterior
    window.numerosCartelaAtual = cartela.numeros;
    window.cartelaAtualExibida = cartela;
    console.log('💾 Números armazenados globalmente:', window.numerosCartelaAtual);
    
    // HTML da cartela com formato BINGO 5x5 (24 números + espaço livre central)
    container.innerHTML = `
        <div style="background: white; color: black; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
            <h3 style="margin: 0 0 15px 0; text-align: center;">🎫 Cartela ${cartela.id.substring(5, 15)}</h3>
            
            <!-- Header BINGO -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin: 10px 0;">
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">B</div>
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">I</div>
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">N</div>
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">G</div>
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">O</div>
            </div>
            
            <!-- Grid de números (5x5 com espaço livre central) -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin: 15px 0;">
                ${cartela.numeros.slice(0, 12).map(num => 
                    `<div style="background: #4CAF50; color: white; padding: 12px; text-align: center; border-radius: 5px; font-weight: bold; font-size: 16px;">${num}</div>`
                ).join('')}
                <div style="background: #f39c12; color: white; padding: 12px; text-align: center; border-radius: 5px; font-weight: bold; font-size: 14px;">⭐<br>LIVRE</div>
                ${cartela.numeros.slice(12).map(num => 
                    `<div style="background: #4CAF50; color: white; padding: 12px; text-align: center; border-radius: 5px; font-weight: bold; font-size: 16px;">${num}</div>`
                ).join('')}
            </div>
            
            <p style="text-align: center; margin: 15px 0 0 0; font-size: 18px; font-weight: bold;">
                💰 Preço: R$ ${cartela.preco.toFixed(2)} | 🎯 ${cartela.numeros.length} números
            </p>
        </div>
    `;
    
    // Habilitar botão comprar
    const btnComprar = document.getElementById('comprar-cartela');
    if (btnComprar) {
        btnComprar.disabled = false;
        btnComprar.textContent = '🛒 Adicionar ao Carrinho';
    }
    
    console.log('✅ Cartela exibida na interface');
}

// Configurar outros botões
function configurarOutrosBotoes() {
    // Botão adicionar ao carrinho - usar versão corrigida
    const btnComprar = document.getElementById('comprar-cartela');
    if (btnComprar) {
        btnComprar.addEventListener('click', function() {
            console.log('🛒 Botão comprar clicado');
            if (typeof adicionarAoCarrinhoCorrigida === 'function') {
                console.log('✅ Usando adicionarAoCarrinhoCorrigida');
                adicionarAoCarrinhoCorrigida();
            } else {
                console.warn('⚠️ adicionarAoCarrinhoCorrigida não disponível, usando fallback');
                adicionarAoCarrinho();
            }
        });
        console.log('✅ Botão comprar configurado com versão corrigida');
    }
    
    // Botão finalizar compra
    const btnFinalizar = document.getElementById('finalizar-compra');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', abrirModal);
        console.log('✅ Botão finalizar configurado');
    }
    
    // Form de checkout - usar sempre a versão corrigida
    const formCheckout = document.getElementById('form-checkout');
    if (formCheckout) {
        console.log('📝 Formulário encontrado:', formCheckout);
        
        // Remover listeners anteriores se existirem
        formCheckout.removeEventListener('submit', processarCompra);
        formCheckout.removeEventListener('submit', processarCompraCorrigida);
        
        // Função para garantir que a versão corrigida seja usada
        const processarCompraWrapper = async function(event) {
            console.log('💳 Wrapper de compra chamado');
            
            if (typeof processarCompraCorrigida === 'function') {
                console.log('✅ Usando processarCompraCorrigida');
                return await processarCompraCorrigida(event);
            } else {
                console.warn('⚠️ processarCompraCorrigida não disponível, usando fallback');
                return await processarCompra(event);
            }
        };
        
        // Adicionar listener wrapper
        formCheckout.addEventListener('submit', processarCompraWrapper);
        console.log('✅ Form checkout configurado com wrapper de função corrigida');
        
        // Teste direto do listener
        console.log('🧪 Testando se listener foi adicionado...');
        
    } else {
        console.error('❌ Formulário form-checkout não encontrado!');
    }
    
    // Botão limpar carrinho
    const btnLimpar = document.getElementById('limpar-carrinho');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparCarrinho);
        console.log('✅ Botão limpar configurado');
    }
}

// Adicionar cartela ao carrinho
function adicionarAoCarrinho() {
    if (!cartelaAtual) {
        alert('Gere uma cartela primeiro!');
        return;
    }
    
    console.log('🛒 === ADICIONAR AO CARRINHO ===');
    console.log('📋 Cartela atual:', cartelaAtual);
    console.log('🔍 Números da cartela atual:', cartelaAtual.numeros);
    
    // Verificar se há divergência com a interface
    if (typeof extrairNumerosDoPreview === 'function') {
        const numerosInterface = extrairNumerosDoPreview();
        console.log('🔍 Números extraídos da interface:', numerosInterface);
        
        if (numerosInterface.length > 0 && JSON.stringify(cartelaAtual.numeros) !== JSON.stringify(numerosInterface)) {
            console.warn('⚠️ DIVERGÊNCIA DETECTADA! Corrigindo...');
            console.warn('📋 Cartela atual:', cartelaAtual.numeros);
            console.warn('🖥️ Interface:', numerosInterface);
            cartelaAtual.numeros = numerosInterface; // Corrigir usando interface
        }
    }
    
    // Adicionar cópia ao carrinho
    const cartelaCopia = { ...cartelaAtual };
    carrinho.push(cartelaCopia);
    
    console.log('💾 Cartela adicionada ao carrinho:', cartelaCopia);
    console.log('🛒 Carrinho atual:', carrinho);
    
    // Sincronizar com variável global
    window.carrinho = carrinho;
    
    // Salvar no localStorage para persistência
    try {
        localStorage.setItem('bingo-carrinho', JSON.stringify(carrinho));
        console.log('💾 Carrinho salvo no localStorage');
    } catch (error) {
        console.warn('⚠️ Erro ao salvar carrinho no localStorage:', error);
    }
    
    // Limpar cartela atual
    cartelaAtual = null;
    
    // Limpar preview
    const container = document.getElementById('cartela-preview');
    if (container) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><p>Clique em "Gerar Cartela" para ver sua cartela</p></div>';
    }
    
    // Desabilitar botão comprar
    const btnComprar = document.getElementById('comprar-cartela');
    if (btnComprar) {
        btnComprar.disabled = true;
        btnComprar.textContent = '🛒 Comprar Esta Cartela';
    }
    
    // Atualizar carrinho
    atualizarCarrinho();
    
    console.log('✅ Cartela adicionada ao carrinho');
}

// Função completa para adicionar ao carrinho (com integração Firebase)
function adicionarAoCarrinhoCompleta() {
    console.log('🛒 Adicionando ao carrinho (versão completa)...');
    adicionarAoCarrinho();
}

// Atualizar carrinho
function atualizarCarrinho() {
    const lista = document.getElementById('carrinho-lista');
    const total = document.getElementById('carrinho-total');
    
    if (lista) {
        if (carrinho.length === 0) {
            lista.innerHTML = '<p class="carrinho-vazio">Carrinho vazio</p>';
        } else {
            lista.innerHTML = carrinho.map((cartela, index) => `
                <div class="item-carrinho" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
                    <span>Cartela ${index + 1}</span>
                    <span>R$ ${cartela.preco.toFixed(2)}</span>
                    <button onclick="removerDoCarrinho(${index})" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">❌</button>
                </div>
            `).join('');
        }
    }
    
    if (total) {
        const valorTotal = carrinho.reduce((sum, cartela) => sum + cartela.preco, 0);
        total.textContent = `R$ ${valorTotal.toFixed(2)}`;
    }
    
    // Habilitar/desabilitar botão finalizar
    const btnFinalizar = document.getElementById('finalizar-compra');
    if (btnFinalizar) {
        btnFinalizar.disabled = carrinho.length === 0;
    }
}

// Remover do carrinho
function removerDoCarrinho(index) {
    console.log('🗑️ Removendo item', index);
    carrinho.splice(index, 1);
    // Sincronizar com variável global
    window.carrinho = carrinho;
    atualizarCarrinho();
}

// Limpar carrinho
function limparCarrinho() {
    console.log('🧹 Limpando carrinho...');
    carrinho = [];
    // Sincronizar com variável global
    window.carrinho = carrinho;
    atualizarCarrinho();
}

// Abrir modal
function abrirModal() {
    console.log('🎯 === ABRINDO MODAL ===');
    console.log('🛒 Carrinho atual:', carrinho);
    console.log('📊 Tamanho do carrinho:', carrinho.length);
    
    if (carrinho.length === 0) {
        console.log('❌ Carrinho vazio, não abrindo modal');
        alert('Carrinho vazio!');
        return;
    }
    
    const modal = document.getElementById('modal-checkout');
    console.log('🔍 Modal encontrado:', !!modal);
    
    if (modal) {
        modal.style.display = 'block';
        console.log('✅ Modal exibido');
        
        // Atualizar resumo da compra
        const resumoCartelas = document.getElementById('resumo-cartelas');
        console.log('🔍 Resumo cartelas encontrado:', !!resumoCartelas);
        
        if (resumoCartelas) {
            resumoCartelas.innerHTML = `
                <p>${carrinho.length} cartela(s) selecionada(s)</p>
                ${carrinho.map((cartela, index) => 
                    `<p>Cartela ${index + 1}: R$ ${cartela.preco.toFixed(2)}</p>`
                ).join('')}
            `;
            console.log('✅ Resumo atualizado');
        }
        
        const totalFinal = document.getElementById('total-final');
        if (totalFinal) {
            const total = carrinho.reduce((sum, cartela) => sum + cartela.preco, 0);
            totalFinal.textContent = `R$ ${total.toFixed(2)}`;
        }
        
        console.log('💳 Modal aberto');
    }
}

// Fechar modal
function fecharModal() {
    const modal = document.getElementById('modal-checkout');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função global para fechar modal (usada no HTML)
function fecharCheckout() {
    fecharModal();
}

// Processar compra e gravar no Firebase
async function processarCompra(event) {
    console.log('🎯 === PROCESSAR COMPRA CHAMADA ===');
    console.log('📋 Event:', event);
    console.log('📋 Event type:', event.type);
    console.log('📋 Target:', event.target);
    
    event.preventDefault();
    
    console.log('💰 Processando compra...');
    console.log('🔥 Firebase disponível:', typeof firebase !== 'undefined');
    console.log('🔥 FirebaseDB disponível:', !!window.FirebaseDB);
    
    // === SINCRONIZAÇÃO CRÍTICA DO CARRINHO ===
    console.log('🔄 Verificando sincronização do carrinho...');
    console.log('🛒 Carrinho local:', carrinho);
    console.log('🌐 Carrinho global:', window.carrinho);
    
    // Priorizar carrinho com mais itens ou o global se existir
    if (window.carrinho && window.carrinho.length > 0) {
        if (carrinho.length === 0 || window.carrinho.length > carrinho.length) {
            carrinho = [...window.carrinho];
            console.log('🔄 Carrinho sincronizado com dados globais:', carrinho);
        }
    }
    
    // Se ainda não há carrinho, tentar recuperar do localStorage
    if (carrinho.length === 0) {
        try {
            const carrinhoStorage = localStorage.getItem('bingo-carrinho');
            if (carrinhoStorage) {
                const carrinhoRecuperado = JSON.parse(carrinhoStorage);
                if (Array.isArray(carrinhoRecuperado) && carrinhoRecuperado.length > 0) {
                    carrinho = carrinhoRecuperado;
                    console.log('🔄 Carrinho recuperado do localStorage:', carrinho);
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao recuperar carrinho do localStorage:', error);
        }
    }
    
    console.log('📊 Carrinho final para processamento:', carrinho);
    console.log('📊 Total de itens no carrinho:', carrinho.length);
    
    try {
        // Verificar se o Firebase está disponível
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não está carregado. Verifique os scripts no HTML.');
        }
        
        // Verificar se FirebaseDB foi inicializado
        if (!window.FirebaseDB) {
            console.warn('⚠️ FirebaseDB não disponível, tentando inicializar...');
            
            // Tentar inicializar Firebase manualmente
            if (typeof initializeFirebaseUnified === 'function') {
                await initializeFirebaseUnified();
            } else {
                throw new Error('Função de inicialização do Firebase não encontrada');
            }
            
            // Verificar novamente
            if (!window.FirebaseDB) {
                throw new Error('Falha ao inicializar FirebaseDB');
            }
        }
        
        // Obter dados do formulário
        const form = event.target;
        const formData = new FormData(form);
        
        const comprador = {
            nome: formData.get('nome') || document.getElementById('nome-comprador').value,
            telefone: formData.get('telefone') || document.getElementById('telefone-comprador').value
        };
        
        console.log('👤 Dados do comprador:', comprador);
        
        // Validar dados obrigatórios
        if (!comprador.nome || !comprador.nome.trim()) {
            alert('Nome é obrigatório!');
            return;
        }
        
        if (!comprador.telefone || !comprador.telefone.trim()) {
            alert('Telefone é obrigatório!');
            return;
        }
        
        // Verificar se há cartelas no carrinho
        // Primeiro, sincronizar carrinho com os dados globais
        if (window.carrinho && window.carrinho.length > 0) {
            carrinho = window.carrinho;
            console.log('🔄 Carrinho sincronizado com dados globais:', carrinho);
        }
        
        if (!carrinho || carrinho.length === 0) {
            alert('Carrinho vazio! Adicione cartelas antes de finalizar.');
            console.error('❌ Carrinho está vazio:', carrinho);
            return;
        }
        
        console.log('🛒 Carrinho atual detalhado:', carrinho);
        console.log(`📊 Total de cartelas no carrinho: ${carrinho.length}`);
        
        // VERIFICAÇÃO CRÍTICA: Log detalhado dos números de cada cartela
        carrinho.forEach((cartela, index) => {
            console.log(`🎫 Cartela ${index + 1}:`, {
                id: cartela.id,
                numeros: cartela.numeros,
                quantidade: cartela.numeros?.length || 0,
                preco: cartela.preco
            });
        });
        
        // Mostrar loading
        const btnSubmit = form.querySelector('button[type="submit"]');
        let textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = '⏳ Salvando no Firebase...';
        btnSubmit.disabled = true;
        
        console.log(`💾 Preparando ${carrinho.length} cartela(s) para salvar...`);
        
        // Preparar cartelas para salvar
        const cartelasParaSalvar = carrinho.map((cartela, index) => {
            console.log(`📋 Preparando cartela ${index + 1} para salvamento:`, cartela);
            
            const cartelaPreparada = {
                id: cartela.id,
                numeros: cartela.numeros, // MANTER números originais do carrinho
                preco: cartela.preco,
                status: 'vendida',
                comprador: {
                    nome: comprador.nome.trim(),
                    telefone: normalizarTelefone(comprador.telefone)
                },
                nome: comprador.nome.trim(),
                telefone: normalizarTelefone(comprador.telefone),
                dataCompra: new Date(),
                timestamp: Date.now()
            };
            
            console.log(`📋 Cartela ${index + 1} preparada - NÚMEROS FINAIS:`, cartelaPreparada.numeros);
            console.log(`📋 Cartela ${index + 1} preparada COMPLETA:`, cartelaPreparada);
            return cartelaPreparada;
        });
        
        console.log(`💾 Preparando ${cartelasParaSalvar.length} cartela(s) para salvar`);
        
        // Salvar cada cartela
        const resultados = [];
        console.log('🔥 Tentando salvar cartelas no Firebase...');
        
        // Verificar se FirebaseDB está disponível
        if (!window.FirebaseDB) {
            throw new Error('FirebaseDB não está disponível. Verifique se o firebase-config.js foi carregado.');
        }
        
        for (let i = 0; i < cartelasParaSalvar.length; i++) {
            const cartela = cartelasParaSalvar[i];
            console.log(`💾 Salvando cartela ${i + 1}/${cartelasParaSalvar.length}:`, cartela);
            
            try {                        // Usar o método saveCartela do FirebaseDB (VERSÃO CORRIGIDA)
                        console.log('🔥 Usando método FirebaseDB.saveCartela CORRIGIDO (método do admin)');
                        const resultado = await window.FirebaseDB.saveCartela(cartela);
                
                if (resultado.success) {
                    console.log(`✅ Cartela ${cartela.id} salva com ID Firebase: ${resultado.id}`);
                    resultados.push({ id: resultado.id, status: 'sucesso', original: cartela.id });
                } else {
                    throw new Error('Falha ao salvar cartela');
                }
                
            } catch (error) {
                console.error(`❌ Erro ao salvar cartela ${cartela.id}:`, error);
                resultados.push({ id: cartela.id, status: 'erro', erro: error.message });
            }
        }
        
        // Analisar resultados
        const sucessos = resultados.filter(r => r.status === 'sucesso').length;
        const erros = resultados.filter(r => r.status !== 'sucesso').length;
        
        console.log(`📊 RESULTADO FINAL: ${sucessos} sucessos, ${erros} erros`);
        console.log('📋 Detalhes:', resultados);
        
        if (sucessos > 0) {
            alert(`✅ ${sucessos} cartela(s) gravada(s) com sucesso no Firebase!${erros > 0 ? ` (${erros} erro(s))` : ''}`);
            
            // Limpar carrinho
            carrinho = [];
            // Sincronizar com variável global
            window.carrinho = carrinho;
            
            // Limpar localStorage
            try {
                localStorage.removeItem('bingo-carrinho');
                console.log('🧹 Carrinho removido do localStorage');
            } catch (error) {
                console.warn('⚠️ Erro ao limpar localStorage:', error);
            }
            
            atualizarCarrinho();
            
            // Fechar modal
            fecharModal();
            
            // Resetar formulário
            form.reset();
            
            console.log('🎉 Compra processada com sucesso!');
        } else {
            alert('❌ ERRO: Nenhuma cartela foi salva. Verifique sua conexão e tente novamente.');
            console.error('❌ FALHA TOTAL: Nenhuma cartela foi salva');
        }
        
    } catch (error) {
        console.error('❌ Erro crítico no processamento:', error);
        alert(`❌ Erro crítico: ${error.message}`);
    } finally {
        // Restaurar botão
        const btnSubmit = event.target.querySelector('button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
        }
    }
}

// Normalizar telefone (remover formatação)
function normalizarTelefone(telefone) {
    if (!telefone) return '';
    return telefone.toString().replace(/\D/g, '');
}

console.log('✅ Cartelas.js carregado - aguardando DOM...');

// ===== CORREÇÃO CRÍTICA: SISTEMA DE RESERVA TEMPORÁRIA =====
// Esta correção grava a cartela temporariamente no banco durante a geração
// e confirma a venda na finalização, eliminando divergências

window.ultimaCartelaGerada = null; // Fonte única da verdade
window.cartelaReservada = null; // Cartela reservada no banco

// Função para gravar reserva temporária no Firebase
async function gravarReservaTemporaria(cartela) {
    console.log('💾 === GRAVANDO RESERVA TEMPORÁRIA ===');
    console.log('📋 Cartela para reservar:', cartela);
    
    try {
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('⚠️ Firebase não disponível - usando modo local');
            return { success: true, id: cartela.id, modo: 'local' };
        }
        
        const db = firebase.firestore();
        
        // Preparar dados da reserva temporária
        const reservaTemporaria = {
            id: cartela.id,
            numeros: cartela.numeros,
            preco: cartela.preco,
            status: 'reservada-temporariamente',
            dataReserva: firebase.firestore.FieldValue.serverTimestamp(),
            expiracaoReserva: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
            sessao: `sessao-${Date.now()}`
        };
        
        console.log('💾 Dados da reserva:', reservaTemporaria);
        
        // Salvar no Firestore
        await db.collection('cartelas').doc(cartela.id).set(reservaTemporaria);
        
        console.log('✅ RESERVA TEMPORÁRIA GRAVADA:', cartela.id);
        
        return { 
            success: true, 
            id: cartela.id, 
            modo: 'firebase',
            numeros: cartela.numeros 
        };
        
    } catch (error) {
        console.error('❌ Erro ao gravar reserva temporária:', error);
        // Em caso de erro, continuar em modo local
        return { 
            success: true, 
            id: cartela.id, 
            modo: 'local-fallback',
            erro: error.message 
        };
    }
}

// Função para confirmar reserva (finalizar venda)
async function confirmarReserva(cartelaId, dadosComprador) {
    console.log('✅ === CONFIRMANDO RESERVA ===');
    console.log('🆔 ID da cartela:', cartelaId);
    console.log('👤 Dados do comprador:', dadosComprador);
    
    try {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('⚠️ Firebase não disponível - confirmação local');
            return { success: true, modo: 'local' };
        }
        
        const db = firebase.firestore();
        
        // Buscar reserva existente
        const docRef = db.collection('cartelas').doc(cartelaId);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            throw new Error('Reserva não encontrada no banco');
        }
        
        const reservaData = doc.data();
        console.log('📋 Reserva encontrada:', reservaData);
        
        // Atualizar para cartela vendida
        const cartelaVendida = {
            ...reservaData,
            status: 'vendida',
            comprador: {
                nome: dadosComprador.nome.trim(),
                telefone: normalizarTelefone(dadosComprador.telefone)
            },
            nome: dadosComprador.nome.trim(),
            telefone: normalizarTelefone(dadosComprador.telefone),
            dataVenda: firebase.firestore.FieldValue.serverTimestamp(),
            dataCompra: new Date(),
            timestamp: Date.now(),
            // Manter números originais da reserva
            numerosOriginais: reservaData.numeros,
            numerosConfirmados: reservaData.numeros
        };
        
        console.log('💾 Confirmando venda:', cartelaVendida);
        
        // Atualizar documento
        await docRef.set(cartelaVendida);
        
        console.log('✅ RESERVA CONFIRMADA E CARTELA VENDIDA:', cartelaId);
        
        return { 
            success: true, 
            id: cartelaId, 
            modo: 'firebase',
            numeros: reservaData.numeros 
        };
        
    } catch (error) {
        console.error('❌ Erro ao confirmar reserva:', error);
        return { 
            success: false, 
            erro: error.message 
        };
    }
}

// Função para cancelar reserva (se usuário sair sem comprar)
async function cancelarReserva(cartelaId) {
    console.log('❌ === CANCELANDO RESERVA ===');
    console.log('🆔 ID da cartela:', cartelaId);
    
    try {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('⚠️ Firebase não disponível - cancelamento local');
            return { success: true, modo: 'local' };
        }
        
        const db = firebase.firestore();
        
        // Remover reserva temporária
        await db.collection('cartelas').doc(cartelaId).delete();
        
        console.log('✅ RESERVA CANCELADA:', cartelaId);
        
        return { success: true, id: cartelaId };
        
    } catch (error) {
        console.error('❌ Erro ao cancelar reserva:', error);
        return { success: false, erro: error.message };
    }
}

// Função corrigida para gerar cartela COM RESERVA TEMPORÁRIA
async function gerarCartelaCorrigida() {
    console.log('🎲 === GERAÇÃO COM RESERVA TEMPORÁRIA ===');
    
    try {
        // Se já há uma cartela reservada, cancelar primeiro
        if (window.cartelaReservada) {
            console.log('🗑️ Cancelando reserva anterior...');
            await cancelarReserva(window.cartelaReservada.id);
        }
        
        // Gerar números aleatórios uma única vez
        const numeros = [];
        const disponiveis = [];
        
        for (let i = 1; i <= 75; i++) {
            disponiveis.push(i);
        }
        
        for (let i = 0; i < 24; i++) {
            const indice = Math.floor(Math.random() * disponiveis.length);
            numeros.push(disponiveis.splice(indice, 1)[0]);
        }
        
        numeros.sort((a, b) => a - b);
        
        // Criar cartela
        const cartela = {
            id: `CART-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            numeros: [...numeros], // Cópia dos números
            preco: 5.00,
            status: 'preview'
        };
        
        console.log('📋 CARTELA GERADA:', cartela);
        console.log('🔢 NÚMEROS GERADOS:', numeros);
        
        // PASSO CRÍTICO: Gravar reserva temporária no banco
        const resultadoReserva = await gravarReservaTemporaria(cartela);
        
        if (resultadoReserva.success) {
            // Armazenar como fonte única da verdade
            window.ultimaCartelaGerada = cartela;
            window.cartelaAtual = cartela;
            window.numerosCartelaAtual = [...numeros];
            window.cartelaReservada = cartela; // Marcar como reservada
            
            console.log('� RESERVA TEMPORÁRIA CRIADA:', resultadoReserva);
            
            // Mostrar na interface
            mostrarCartelaCorrigida(cartela, resultadoReserva);
            
            return cartela;
        } else {
            throw new Error('Falha ao criar reserva temporária');
        }
        
    } catch (error) {
        console.error('❌ Erro na geração com reserva:', error);
        alert('Erro ao gerar cartela: ' + error.message);
        throw error;
    }
}

// Função corrigida para mostrar cartela com informações de reserva
function mostrarCartelaCorrigida(cartela, resultadoReserva = null) {
    console.log('🎫 === EXIBIÇÃO COM RESERVA TEMPORÁRIA ===');
    console.log('📋 Cartela a exibir:', cartela);
    console.log('💾 Resultado da reserva:', resultadoReserva);
    
    const container = document.getElementById('cartela-preview');
    if (!container) {
        console.error('❌ Container não encontrado');
        return;
    }
    
    // Usar números da fonte única
    const numeros = cartela.numeros;
    
    // Determinar status da reserva
    let statusReserva = '⚠️ Modo local';
    let corStatus = '#ffc107';
    
    if (resultadoReserva) {
        if (resultadoReserva.modo === 'firebase') {
            statusReserva = '✅ Reservada no banco';
            corStatus = '#28a745';
        } else if (resultadoReserva.modo === 'local-fallback') {
            statusReserva = '⚠️ Fallback local';
            corStatus = '#ffc107';
        }
    }
    
    container.innerHTML = `
        <div style="background: white; color: black; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
            <h3 style="margin: 0 0 15px 0; text-align: center;">🎫 Cartela ${cartela.id.substring(5, 15)}</h3>
            
            <!-- Status da Reserva -->
            <div style="background: ${corStatus}; color: white; padding: 8px; border-radius: 5px; text-align: center; margin-bottom: 15px; font-weight: bold;">
                ${statusReserva}
            </div>
            
            <!-- Header BINGO -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin: 10px 0;">
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">B</div>
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">I</div>
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">N</div>
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">G</div>
                <div style="background: #e74c3c; color: white; text-align: center; font-size: 1.2em; font-weight: bold; padding: 8px; border-radius: 5px;">O</div>
            </div>
            
            <!-- Grid de números -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin: 15px 0;">
                ${numeros.slice(0, 12).map(num => 
                    `<div style="background: #4CAF50; color: white; padding: 12px; text-align: center; border-radius: 5px; font-weight: bold; font-size: 16px;">${num}</div>`
                ).join('')}
                <div style="background: #f39c12; color: white; padding: 12px; text-align: center; border-radius: 5px; font-weight: bold; font-size: 14px;">⭐<br>LIVRE</div>
                ${numeros.slice(12).map(num => 
                    `<div style="background: #4CAF50; color: white; padding: 12px; text-align: center; border-radius: 5px; font-weight: bold; font-size: 16px;">${num}</div>`
                ).join('')}
            </div>
            
            <p style="text-align: center; margin: 15px 0 0 0; font-size: 18px; font-weight: bold;">
                💰 Preço: R$ ${cartela.preco.toFixed(2)} | 🎯 ${cartela.numeros.length} números
            </p>
        </div>
    `;
    
    // Habilitar botões
    const btnComprar = document.getElementById('comprar-cartela');
    if (btnComprar) {
        btnComprar.disabled = false;
        btnComprar.textContent = '🛒 Adicionar ao Carrinho';
    }
    
    const btnGerar = document.getElementById('gerar-cartela');
    if (btnGerar) {
        btnGerar.disabled = false;
        btnGerar.textContent = '🎲 Gerar Nova Cartela';
    }
    
    console.log('✅ CARTELA EXIBIDA COM RESERVA TEMPORÁRIA:', cartela);
}

// Função corrigida para adicionar ao carrinho (com reserva temporária)
function adicionarAoCarrinhoCorrigida() {
    console.log('🛒 === ADICIONAR AO CARRINHO COM RESERVA ===');
    
    if (!window.cartelaReservada) {
        alert('Gere uma cartela primeiro!');
        console.error('❌ Nenhuma cartela reservada encontrada');
        return;
    }
    
    console.log('📋 Cartela reservada:', window.cartelaReservada);
    
    // A cartela já está no banco como reserva temporária
    // Apenas adicionar ao carrinho LOCAL para interface
    const cartelaParaCarrinho = {
        ...window.cartelaReservada,
        numeros: [...window.cartelaReservada.numeros], // Manter números da reserva
        statusLocal: 'no-carrinho'
    };
    
    console.log('💾 ADICIONANDO AO CARRINHO LOCAL:', cartelaParaCarrinho);
    console.log('🔢 NÚMEROS (DA RESERVA):', cartelaParaCarrinho.numeros);
    
    // Adicionar ao carrinho
    if (!window.carrinho) window.carrinho = [];
    window.carrinho.push(cartelaParaCarrinho);
    carrinho = window.carrinho;
    
    // Salvar no localStorage
    try {
        localStorage.setItem('bingo-carrinho', JSON.stringify(carrinho));
    } catch (error) {
        console.warn('⚠️ Erro ao salvar no localStorage:', error);
    }
    
    // Limpar preview
    const container = document.getElementById('cartela-preview');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>🎫 Cartela adicionada ao carrinho!</p>
                <p style="font-size: 12px; color: #28a745;">✅ Reserva temporária mantida no banco</p>
                <p style="font-size: 12px;">Clique em "Gerar Cartela" para ver uma nova cartela</p>
            </div>
        `;
    }
    
    // Limpar referências locais (mas manter reserva no banco)
    window.ultimaCartelaGerada = null;
    window.cartelaAtual = null;
    // NÃO limpar cartelaReservada - ela será confirmada na finalização
    
    // Desabilitar botão
    const btnComprar = document.getElementById('comprar-cartela');
    if (btnComprar) {
        btnComprar.disabled = true;
        btnComprar.textContent = '🛒 Comprar Esta Cartela';
    }
    
    // Atualizar carrinho
    if (typeof atualizarCarrinho === 'function') {
        atualizarCarrinho();
    }
    
    console.log('✅ CARTELA ADICIONADA AO CARRINHO (RESERVA MANTIDA)');
    console.log('🛒 CARRINHO ATUAL:', carrinho);
}

// Função corrigida para processar compra (confirmar reservas)
async function processarCompraCorrigida(event) {
    console.log('💳 === PROCESSAR COMPRA - CONFIRMAR RESERVAS ===');
    
    if (event) event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const comprador = {
        nome: formData.get('nome'),
        telefone: formData.get('telefone')
    };
    
    console.log('👤 Dados do comprador:', comprador);
    
    if (!comprador.nome || !comprador.telefone) {
        alert('Preencha todos os campos!');
        return;
    }
    
    // Usar carrinho global
    const carrinhoAtual = window.carrinho || carrinho || [];
    
    if (carrinhoAtual.length === 0) {
        alert('Carrinho vazio!');
        console.error('❌ Carrinho vazio');
        return;
    }
    
    console.log('🛒 CARRINHO PARA CONFIRMAR:', carrinhoAtual);
    
    // Mostrar loading
    const btnSubmit = form.querySelector('button[type="submit"]');
    let textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = '⏳ Confirmando reservas...';
    btnSubmit.disabled = true;
    
    try {
        const resultados = [];
        
        // Confirmar cada reserva temporária
        for (let i = 0; i < carrinhoAtual.length; i++) {
            const cartela = carrinhoAtual[i];
            console.log(`� Confirmando reserva ${i + 1}/${carrinhoAtual.length}:`, cartela.id);
            
            const resultado = await confirmarReserva(cartela.id, comprador);
            
            if (resultado.success) {
                console.log(`✅ Reserva ${cartela.id} confirmada`);
                resultados.push({ 
                    id: cartela.id, 
                    status: 'confirmada',
                    numeros: resultado.numeros || cartela.numeros
                });
            } else {
                console.error(`❌ Falha ao confirmar reserva ${cartela.id}:`, resultado.erro);
                resultados.push({ 
                    id: cartela.id, 
                    status: 'erro', 
                    erro: resultado.erro 
                });
            }
        }
        
        // Analisar resultados
        const sucessos = resultados.filter(r => r.status === 'confirmada').length;
        const erros = resultados.filter(r => r.status === 'erro').length;
        
        console.log(`� RESULTADO FINAL: ${sucessos} confirmadas, ${erros} erros`);
        console.log('📋 Detalhes:', resultados);
        
        if (sucessos > 0) {
            // Mostrar números das cartelas confirmadas
            let mensagem = `✅ ${sucessos} cartela(s) confirmada(s) com sucesso!\n\n`;
            
            resultados.filter(r => r.status === 'confirmada').forEach((resultado, index) => {
                mensagem += `Cartela ${index + 1} (${resultado.id}): [${resultado.numeros.join(', ')}]\n`;
            });
            
            if (erros > 0) {
                mensagem += `\n⚠️ ${erros} erro(s) ocorreram.`;
            }
            
            alert(mensagem);
            
            // Limpar carrinho e reservas
            window.carrinho = [];
            carrinho = [];
            window.cartelaReservada = null;
            
            // Limpar localStorage
            try {
                localStorage.removeItem('bingo-carrinho');
                console.log('🧹 Carrinho removido do localStorage');
            } catch (error) {
                console.warn('⚠️ Erro ao limpar localStorage:', error);
            }
            
            if (typeof atualizarCarrinho === 'function') {
                atualizarCarrinho();
            }
            
            // Fechar modal
            if (typeof fecharModal === 'function') {
                fecharModal();
            }
            
            // Resetar formulário
            form.reset();
            
            console.log('🎉 COMPRA PROCESSADA - RESERVAS CONFIRMADAS!');
        } else {
            alert('❌ ERRO: Nenhuma reserva foi confirmada. Verifique sua conexão e tente novamente.');
            console.error('❌ FALHA TOTAL: Nenhuma reserva confirmada');
        }
        
    } catch (error) {
        console.error('❌ Erro crítico no processamento:', error);
        alert(`❌ Erro crítico: ${error.message}`);
    } finally {
        // Restaurar botão
        if (btnSubmit) {
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
        }
    }
}

// Registrar função globalmente logo após definição
if (typeof processarCompraCorrigida === 'function') {
    window.processarCompraCorrigida = processarCompraCorrigida;
    window.processarCompra = processarCompraCorrigida; // Alias para substituir a versão antiga
    console.log('🌐 processarCompraCorrigida registrada globalmente');
}

// Registrar função globalmente logo após definição
if (typeof gerarCartelaCorrigida === 'function') {
    window.gerarCartelaCorrigida = gerarCartelaCorrigida;
    window.gerarCartela = gerarCartelaCorrigida; // Alias
    console.log('🌐 gerarCartelaCorrigida registrada globalmente');
}

// Registrar função globalmente logo após definição
if (typeof adicionarAoCarrinhoCorrigida === 'function') {
    window.adicionarAoCarrinhoCorrigida = adicionarAoCarrinhoCorrigida;
    window.adicionarAoCarrinhoCompleta = adicionarAoCarrinhoCorrigida;
    console.log('🌐 adicionarAoCarrinhoCorrigida registrada globalmente');
}

// ===== SISTEMA DE LIMPEZA DE RESERVAS EXPIRADAS =====
async function limparReservasExpiradas() {
    console.log('🧹 === LIMPEZA DE RESERVAS EXPIRADAS ===');
    
    try {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.log('⚠️ Firebase não disponível - limpeza pulada');
            return;
        }
        
        const db = firebase.firestore();
        const agora = new Date();
        
        // Buscar reservas temporárias expiradas
        const snapshot = await db.collection('cartelas')
            .where('status', '==', 'reservada-temporariamente')
            .where('expiracaoReserva', '<', agora)
            .get();
        
        if (snapshot.empty) {
            console.log('✅ Nenhuma reserva expirada encontrada');
            return;
        }
        
        console.log(`🗑️ Encontradas ${snapshot.size} reservas expiradas`);
        
        // Remover reservas expiradas
        const batch = db.batch();
        snapshot.forEach(doc => {
            console.log(`❌ Removendo reserva expirada: ${doc.id}`);
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✅ ${snapshot.size} reservas expiradas removidas`);
        
    } catch (error) {
        console.error('❌ Erro na limpeza de reservas:', error);
    }
}

// Função para cancelar reserva local quando usuário sair
function cancelarReservaLocal() {
    if (window.cartelaReservada) {
        console.log('🗑️ Cancelando reserva local ao sair...');
        cancelarReserva(window.cartelaReservada.id);
        window.cartelaReservada = null;
    }
}

// Configurar limpeza automática e eventos de saída
window.addEventListener('beforeunload', () => {
    // Cancelar reserva se usuário sair sem comprar
    cancelarReservaLocal();
});

// Limpeza periódica de reservas expiradas (a cada 5 minutos)
setInterval(limparReservasExpiradas, 5 * 60 * 1000);

// Limpeza inicial após 10 segundos
setTimeout(limparReservasExpiradas, 10000);

console.log('🔧 SISTEMA DE RESERVA TEMPORÁRIA CONFIGURADO');

// ===== INICIALIZAÇÃO DOM =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM carregado - aplicando correções finais...');
    
    // Garantir que as funções corrigidas estejam disponíveis
    setTimeout(() => {
        // Configurar botão gerar
        const btnGerar = document.getElementById('gerar-preview');
        if (btnGerar) {
            btnGerar.onclick = async function() {
                console.log('🎯 Botão gerar clicado - usando função com reserva temporária');
                await gerarCartelaCorrigida();
            };
            console.log('✅ Botão gerar configurado com reserva temporária');
        }
        
        // Configurar botão adicionar ao carrinho
        const btnComprar = document.getElementById('comprar-cartela');
        if (btnComprar) {
            btnComprar.onclick = function() {
                console.log('🛒 Botão comprar clicado - usando função corrigida');
                adicionarAoCarrinhoCorrigida();
            };
            console.log('✅ Botão comprar configurado com função corrigida');
        }
        
        // Configurar formulário de checkout
        const formCheckout = document.getElementById('form-checkout');
        if (formCheckout) {
            formCheckout.onsubmit = async function(e) {
                console.log('💳 Formulário submetido - confirmando reservas');
                await processarCompraCorrigida(e);
            };
            console.log('✅ Formulário configurado para confirmar reservas');
        }
        
        console.log('🎉 TODAS AS CORREÇÕES APLICADAS COM SUCESSO!');
        
        // ===== REGISTRAR FUNÇÕES GLOBALMENTE (FINAL) =====
        console.log('🔧 Registrando funções globalmente...');
        
        // Registrar funções corrigidas globalmente
        if (typeof gerarCartelaCorrigida === 'function') {
            window.gerarCartelaCorrigida = gerarCartelaCorrigida;
            window.gerarCartela = gerarCartelaCorrigida; // Alias
            console.log('🌐 gerarCartelaCorrigida registrada globalmente');
        } else {
            console.error('❌ gerarCartelaCorrigida não encontrada');
        }
        
        if (typeof adicionarAoCarrinhoCorrigida === 'function') {
            window.adicionarAoCarrinhoCorrigida = adicionarAoCarrinhoCorrigida;
            window.adicionarAoCarrinhoCompleta = adicionarAoCarrinhoCorrigida;
            console.log('✅ adicionarAoCarrinhoCorrigida registrada globalmente');
        } else {
            console.error('❌ adicionarAoCarrinhoCorrigida não encontrada');
        }
        
        if (typeof processarCompraCorrigida === 'function') {
            window.processarCompraCompleta = processarCompraCorrigida;
            console.log('✅ processarCompraCorrigida registrada globalmente');
        } else {
            console.error('❌ processarCompraCorrigida não encontrada');
        }
        
        // Registrar outras funções
        if (typeof abrirModal === 'function') {
            window.abrirModalCompleto = abrirModal;
            console.log('✅ abrirModal registrada globalmente');
        }
        
        console.log('🔧 TODAS AS FUNÇÕES REGISTRADAS - Sistema pronto para uso!');
    }, 100);
});

// Fallback para caso DOM já esteja carregado
if (document.readyState === 'loading') {
    console.log('⏳ Aguardando DOM...');
} else {
    console.log('✅ DOM já carregado - aplicando correções...');
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

// Função para verificar e exibir status do sistema
function verificarStatusSistema() {
    const firebaseOk = window.FirebaseDB && typeof firebase !== 'undefined' && firebase.firestore;
    const funcoesOk = typeof gerarCartelaCorrigida === 'function' && typeof adicionarAoCarrinhoCorrigida === 'function' && typeof processarCompraCorrigida === 'function';
    
    console.log('🔍 === STATUS DO SISTEMA ===');
    console.log('🔥 Firebase disponível:', firebaseOk);
    console.log('⚙️ Funções corrigidas disponíveis:', funcoesOk);
    console.log('📱 FirebaseDB:', !!window.FirebaseDB);
    console.log('🔧 Firebase SDK:', typeof firebase !== 'undefined');
    console.log('🗃️ Firestore:', typeof firebase !== 'undefined' ? !!firebase.firestore : false);
    
    // Mostrar aviso visual se não estiver tudo ok
    const statusDiv = document.getElementById('status-sistema');
    if (statusDiv) {
        if (firebaseOk && funcoesOk) {
            statusDiv.innerHTML = '✅ Sistema Online - Firebase Ativo';
            statusDiv.style.background = '#d4edda';
            statusDiv.style.color = '#155724';
            statusDiv.style.display = 'block';
        } else {
            statusDiv.innerHTML = '⚠️ Sistema em Modo Degradado - Algumas funcionalidades podem não funcionar';
            statusDiv.style.background = '#fff3cd';
            statusDiv.style.color = '#856404';
            statusDiv.style.display = 'block';
        }
        
        // Esconder depois de 5 segundos se estiver tudo ok
        if (firebaseOk && funcoesOk) {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    return { firebaseOk, funcoesOk };
}

// Chamar função de verificação de status ao carregar o script
setTimeout(verificarStatusSistema, 1000);