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

// Registrar função completa globalmente
window.gerarCartelaCompleta = gerarCartelaCompleta;
window.gerarCartela = gerarCartelaCompleta; // Alias para compatibilidade
window.adicionarAoCarrinhoCompleta = adicionarAoCarrinhoCompleta;
window.abrirModalCompleto = abrirModal;
window.processarCompraCompleta = processarCompra;

// Expor variáveis e funções globais para sincronização
window.carrinho = carrinho;
window.atualizarCarrinho = atualizarCarrinho;
window.verificarAcessoAdmin = verificarAcessoAdmin;

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM carregado, configurando eventos...');
    
    // Carregar carrinho do localStorage
    carregarCarrinhoDoStorage();
    
    // Aguardar Firebase estar disponível
    console.log('⏳ Aguardando Firebase...');
    let tentativas = 0;
    const maxTentativas = 50; // 5 segundos máximo
    
    while ((!window.FirebaseDB || typeof firebase === 'undefined') && tentativas < maxTentativas) {
        await new Promise(resolve => setTimeout(resolve, 100));
        tentativas++;
    }
    
    if (window.FirebaseDB && typeof firebase !== 'undefined') {
        console.log('✅ Firebase disponível após', tentativas * 100, 'ms');
    } else {
        console.warn('⚠️ Firebase não disponível após timeout, continuando...');
    }
    
    setTimeout(function() {
        configurarBotaoGerar();
        configurarOutrosBotoes();
        atualizarCarrinho();
        
        // Sincronizar com interface se há itens no carrinho simples
        sincronizarCarrinhoInicial();
        
        setTimeout(inicializarFirebase, 500);
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
            const disponiveis = Array.from({length: 75}, (_, i) => i + 1);
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
    
    // Configuração mais direta - apenas onclick
    btnGerar.onclick = function() {
        console.log('🖱️ CLIQUE DETECTADO!');
        gerarCartelaCompleta();
        return false;
    };
    
    console.log('✅ Botão configurado');
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
    const container = document.getElementById('cartela-preview');
    if (!container) {
        console.error('❌ Container cartela-preview não encontrado');
        return;
    }
    
    // HTML da cartela com formato BINGO 5x5 (24 números + espaço livre)
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
    // Botão adicionar ao carrinho
    const btnComprar = document.getElementById('comprar-cartela');
    if (btnComprar) {
        btnComprar.addEventListener('click', adicionarAoCarrinho);
        console.log('✅ Botão comprar configurado');
    }
    
    // Botão finalizar compra
    const btnFinalizar = document.getElementById('finalizar-compra');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', abrirModal);
        console.log('✅ Botão finalizar configurado');
    }
    
    // Form de checkout
    const formCheckout = document.getElementById('form-checkout');
    if (formCheckout) {
        console.log('📝 Formulário encontrado:', formCheckout);
        
        // Remover listeners anteriores se existirem
        formCheckout.removeEventListener('submit', processarCompra);
        
        // Adicionar novo listener
        formCheckout.addEventListener('submit', processarCompra);
        console.log('✅ Form checkout configurado com processarCompra');
        
        // Teste direto do listener
        console.log('🧪 Testando se listener foi adicionado...');
        
        // Adicionar também listener no botão submit para debug
        const btnSubmit = formCheckout.querySelector('button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.addEventListener('click', function(e) {
                console.log('🖱️ Botão submit clicado!');
                console.log('📋 Form será submetido...');
            });
            console.log('✅ Listener de debug adicionado ao botão submit');
        }
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
    
    console.log('🛒 Adicionando ao carrinho...');
    
    // Adicionar cópia ao carrinho
    carrinho.push({ ...cartelaAtual });
    
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
        
        // Mostrar loading
        const btnSubmit = form.querySelector('button[type="submit"]');
        let textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = '⏳ Salvando no Firebase...';
        btnSubmit.disabled = true;
        
        console.log(`💾 Preparando ${carrinho.length} cartela(s) para salvar...`);
        
        // Preparar cartelas para salvar
        const cartelasParaSalvar = carrinho.map((cartela, index) => {
            const cartelaPreparada = {
                id: cartela.id,
                numeros: cartela.numeros,
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
            
            console.log(`📋 Cartela ${index + 1} preparada:`, cartelaPreparada);
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

// Função de teste para debug
window.testarProcessarCompra = function() {
    console.log('🧪 === TESTE DIRETO PROCESSAR COMPRA ===');
    
    // Simular event
    const fakeEvent = {
        preventDefault: function() { console.log('preventDefault chamado'); },
        type: 'submit',
        target: document.getElementById('form-checkout')
    };
    
    processarCompra(fakeEvent);
};

// Função para adicionar cartela de teste diretamente
window.adicionarCartelaTest = function() {
    console.log('🧪 Adicionando cartela de teste...');
    
    // Gerar 24 números únicos de 1 a 75
    const numerosUnicos = [];
    const disponiveis = Array.from({length: 75}, (_, i) => i + 1);
    for (let j = 0; j < 24; j++) {
        const indice = Math.floor(Math.random() * disponiveis.length);
        numerosUnicos.push(disponiveis.splice(indice, 1)[0]);
    }
    
    const cartelaTest = {
        id: `TEST-${Date.now()}`,
        numeros: numerosUnicos.sort((a, b) => a - b),
        preco: 5.00,
        status: 'preview'
    };
    
    carrinho.push(cartelaTest);
    window.carrinho = carrinho;
    
    // Salvar no localStorage
    try {
        localStorage.setItem('bingo-carrinho', JSON.stringify(carrinho));
    } catch {}
    
    atualizarCarrinho();
    console.log('✅ Cartela de teste adicionada:', cartelaTest);
};

// Função para preencher formulário automaticamente
window.preencherFormulario = function() {
    const nomeInput = document.getElementById('nome-comprador');
    const telefoneInput = document.getElementById('telefone-comprador');
    
    if (nomeInput) nomeInput.value = 'Teste Debug';
    if (telefoneInput) telefoneInput.value = '(11) 99999-0001';
    
    console.log('✅ Formulário preenchido automaticamente');
};

console.log('✅ Cartelas.js carregado - aguardando DOM...');