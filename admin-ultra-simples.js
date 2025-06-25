// ADMIN.JS ULTRA SIMPLIFICADO - FUNCIONAL
console.log('🚀 [ADMIN] Carregando admin ultra simplificado...');

// Aguardar que a página carregue completamente
window.addEventListener('load', () => {
    console.log('📄 [ADMIN] Página totalmente carregada, iniciando...');
    
    // Aguardar mais tempo para garantir que todos os scripts carregaram
    setTimeout(iniciarAdmin, 2000);
});

// Backup: se não funcionar com load, tentar com DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 [ADMIN] DOM carregado, configurando backup...');
    
    // Aguardar ainda mais para o backup
    setTimeout(() => {
        if (!window.adminInicializado) {
            console.log('🔄 [ADMIN] Executando inicialização de backup...');
            iniciarAdmin();
        }
    }, 3000);
});

async function iniciarAdmin() {
    // Evitar inicialização dupla
    if (window.adminInicializado) {
        console.log('ℹ️ [ADMIN] Já foi inicializado, pulando...');
        return;
    }
    
    console.log('🔄 [ADMIN] Iniciando sistema admin...');
    window.adminInicializado = true;
    
    try {
        // 1. Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não está disponível');
        }
        console.log('✅ Firebase SDK disponível');
        
        // 2. Inicializar Firebase se necessário
        if (!firebase.apps.length) {
            if (typeof firebaseConfig !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase inicializado');
            } else {
                throw new Error('firebaseConfig não encontrado');
            }
        }
        
        // 3. Configurar variáveis globais
        window.db = firebase.firestore();
        window.auth = firebase.auth();
        console.log('✅ Firestore e Auth configurados');
        
        // 4. Configurar botões IMEDIATAMENTE
        configurarBotoesSimples();
        
        // 5. Tentar carregar dados (sem bloquear se falhar)
        try {
            await carregarDadosBasicos();
        } catch (dataError) {
            console.warn('⚠️ Erro ao carregar dados, mas continuando:', dataError);
            // Definir valores padrão
            definirValoresPadrao();
        }
        
        // 6. Atualizar status
        atualizarStatusCarregamento();
        
        console.log('🎉 [ADMIN] Sistema admin funcionando!');
        
    } catch (error) {
        console.error('❌ [ADMIN] Erro crítico:', error);
        alert(`Erro na inicialização: ${error.message}\n\nVerifique sua conexão com a internet.`);
    }
}

// Configurar botões de forma muito simples
function configurarBotoesSimples() {
    console.log('🔧 [ADMIN] Configurando botões...');
    
    // Salvar Configurações
    const btnSalvar = document.getElementById('salvar-config');
    if (btnSalvar) {
        btnSalvar.onclick = async () => {
            console.log('💾 Salvando configurações...');
            
            try {
                const numeroInicial = parseInt(document.getElementById('numero-inicial')?.value) || 1;
                const numeroFinal = parseInt(document.getElementById('numero-final')?.value) || 75;
                const precoCartela = parseFloat(document.getElementById('preco-cartela')?.value) || 5.00;
                
                await window.db.collection('configuracoes').doc('bingo').set({
                    numeroInicial,
                    numeroFinal,
                    precoCartela,
                    jogoAtivo: true,
                    ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                alert('✅ Configurações salvas com sucesso!');
                console.log('✅ Configurações salvas');
                
                // Atualizar interface
                atualizarTotalNumeros();
                
            } catch (error) {
                console.error('❌ Erro ao salvar:', error);
                alert(`Erro ao salvar: ${error.message}`);
            }
        };
        console.log('✅ Botão salvar configurado');
    }
    
    // Resetar Jogo
    const btnResetar = document.getElementById('resetar-jogo');
    if (btnResetar) {
        btnResetar.onclick = async () => {
            if (!confirm('⚠️ Resetar o jogo? Isso vai limpar todos os números sorteados!')) {
                return;
            }
            
            console.log('🔄 Resetando jogo...');
            
            try {
                // Limpar números sorteados
                const snapshot = await window.db.collection('numeros-sorteados').get();
                const batch = window.db.batch();
                
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                
                await batch.commit();
                
                alert('✅ Jogo resetado com sucesso!');
                console.log('✅ Jogo resetado');
                
                // Atualizar contadores
                atualizarContadores();
                
            } catch (error) {
                console.error('❌ Erro ao resetar:', error);
                alert(`Erro ao resetar: ${error.message}`);
            }
        };
        console.log('✅ Botão resetar configurado');
    }
    
    // Ir para Bingo
    const btnBingo = document.getElementById('ir-para-bingo');
    if (btnBingo) {
        btnBingo.onclick = () => {
            console.log('🎪 Indo para o bingo...');
            window.location.href = 'index.html';
        };
        console.log('✅ Botão bingo configurado');
    }
    
    // Limpar Histórico
    const btnLimpar = document.getElementById('limpar-historico');
    if (btnLimpar) {
        btnLimpar.onclick = async () => {
            if (!confirm('⚠️ Limpar histórico de números sorteados?')) {
                return;
            }
            
            console.log('🗑️ Limpando histórico...');
            
            try {
                const snapshot = await window.db.collection('numeros-sorteados').get();
                const batch = window.db.batch();
                
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                
                await batch.commit();
                
                alert('✅ Histórico limpo com sucesso!');
                console.log('✅ Histórico limpo');
                
                // Atualizar contadores
                atualizarContadores();
                
            } catch (error) {
                console.error('❌ Erro ao limpar:', error);
                alert(`Erro ao limpar: ${error.message}`);
            }
        };
        console.log('✅ Botão limpar configurado');
    }
    
    // Gerar Cartela (implementação completa)
    const btnGerar = document.getElementById('gerar-cartela');
    if (btnGerar) {
        btnGerar.onclick = async () => {
            console.log('🎫 Gerando nova cartela...');
            
            try {
                // Obter configurações atuais
                const numeroInicial = parseInt(document.getElementById('numero-inicial')?.value) || 1;
                const numeroFinal = parseInt(document.getElementById('numero-final')?.value) || 75;
                const precoCartela = parseFloat(document.getElementById('preco-cartela')?.value) || 5.00;
                
                // Gerar números aleatórios únicos
                const numerosCartela = gerarNumerosCartela(numeroInicial, numeroFinal);
                
                // Criar objeto da cartela
                const cartela = {
                    numeros: numerosCartela,
                    numeroInicial,
                    numeroFinal,
                    preco: precoCartela,
                    dataGeracao: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'disponivel',
                    id: gerarIdCartela()
                };
                
                // Salvar no Firebase
                await window.db.collection('cartelas').add(cartela);
                
                // Mostrar cartela gerada
                mostrarCartelaGerada(cartela);
                
                // Atualizar contadores
                await atualizarContadoresCartelas();
                
                console.log('✅ Cartela gerada com sucesso:', cartela);
                
            } catch (error) {
                console.error('❌ Erro ao gerar cartela:', error);
                alert(`Erro ao gerar cartela: ${error.message}`);
            }
        };
        console.log('✅ Botão gerar cartela configurado');
    }
    
    // Ver Vendas (implementação completa)
    const btnVendas = document.getElementById('ver-vendas');
    if (btnVendas) {
        btnVendas.onclick = async () => {
            console.log('💰 Carregando vendas...');
            
            try {
                await mostrarModalVendas();
                
            } catch (error) {
                console.error('❌ Erro ao carregar vendas:', error);
                alert(`Erro ao carregar vendas: ${error.message}`);
            }
        };
        console.log('✅ Botão vendas configurado');
    }
    
    // Configurar eventos de input para recalcular
    const inputInicial = document.getElementById('numero-inicial');
    const inputFinal = document.getElementById('numero-final');
    
    if (inputInicial) {
        inputInicial.addEventListener('input', atualizarTotalNumeros);
    }
    if (inputFinal) {
        inputFinal.addEventListener('input', atualizarTotalNumeros);
    }
    
    console.log('🎯 [ADMIN] Todos os botões configurados!');
}

// Carregar dados básicos do Firebase
async function carregarDadosBasicos() {
    console.log('📊 [ADMIN] Carregando dados do Firebase...');
    
    try {
        // Carregar configurações
        const configDoc = await window.db.collection('configuracoes').doc('bingo').get();
        
        if (configDoc.exists) {
            const config = configDoc.data();
            console.log('✅ Configurações carregadas:', config);
            
            // Atualizar campos
            const inputInicial = document.getElementById('numero-inicial');
            const inputFinal = document.getElementById('numero-final');
            const inputPreco = document.getElementById('preco-cartela');
            
            if (inputInicial && config.numeroInicial) {
                inputInicial.value = config.numeroInicial;
            }
            if (inputFinal && config.numeroFinal) {
                inputFinal.value = config.numeroFinal;
            }
            if (inputPreco && config.precoCartela) {
                inputPreco.value = config.precoCartela.toFixed(2);
            }
        } else {
            console.log('ℹ️ Nenhuma configuração encontrada, usando padrões');
            definirValoresPadrao();
        }
        
        // Carregar números sorteados
        await carregarNumerosSorteados();
        
        // Carregar contadores de cartelas
        await atualizarContadoresCartelas();
        
        // Atualizar interface
        atualizarTotalNumeros();
        atualizarContadores();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        throw error;
    }
}

// Definir valores padrão
function definirValoresPadrao() {
    console.log('📝 [ADMIN] Definindo valores padrão...');
    
    const inputInicial = document.getElementById('numero-inicial');
    const inputFinal = document.getElementById('numero-final');
    const inputPreco = document.getElementById('preco-cartela');
    
    if (inputInicial && !inputInicial.value) inputInicial.value = '1';
    if (inputFinal && !inputFinal.value) inputFinal.value = '75';
    if (inputPreco && !inputPreco.value) inputPreco.value = '5.00';
    
    atualizarTotalNumeros();
}

// Carregar números sorteados
async function carregarNumerosSorteados() {
    try {
        const snapshot = await window.db.collection('numeros-sorteados').get();
        const numerosSorteados = snapshot.size;
        
        console.log(`📊 Números sorteados: ${numerosSorteados}`);
        
        // Atualizar display
        const spanSorteados = document.getElementById('numeros-sorteados-count');
        if (spanSorteados) {
            spanSorteados.textContent = numerosSorteados;
        }
        
        return numerosSorteados;
        
    } catch (error) {
        console.error('❌ Erro ao carregar números sorteados:', error);
        return 0;
    }
}

// Atualizar total de números
function atualizarTotalNumeros() {
    const inputInicial = document.getElementById('numero-inicial');
    const inputFinal = document.getElementById('numero-final');
    const spanTotal = document.getElementById('total-numeros');
    const spanRange = document.getElementById('range-atual');
    const spanRestantes = document.getElementById('numeros-restantes');
    
    if (inputInicial && inputFinal && spanTotal && spanRange) {
        const inicial = parseInt(inputInicial.value) || 1;
        const final = parseInt(inputFinal.value) || 75;
        const total = Math.max(0, final - inicial + 1);
        
        spanTotal.textContent = total;
        spanRange.textContent = `${inicial} - ${final}`;
        
        // Calcular restantes
        const sorteados = parseInt(document.getElementById('numeros-sorteados-count')?.textContent) || 0;
        const restantes = Math.max(0, total - sorteados);
        
        if (spanRestantes) {
            spanRestantes.textContent = restantes;
        }
    }
}

// Atualizar contadores
async function atualizarContadores() {
    try {
        await carregarNumerosSorteados();
        atualizarTotalNumeros();
    } catch (error) {
        console.error('❌ Erro ao atualizar contadores:', error);
    }
}

// Atualizar status de carregamento
function atualizarStatusCarregamento() {
    console.log('🔄 [ADMIN] Atualizando status...');
    
    // Atualizar elementos específicos de carregamento
    const adminUser = document.getElementById('admin-user');
    if (adminUser && adminUser.textContent.includes('Carregando')) {
        adminUser.textContent = '👤 Admin Conectado';
    }
    
    const sessionTime = document.getElementById('session-time');
    if (sessionTime && sessionTime.textContent.includes('Carregando')) {
        const agora = new Date();
        sessionTime.textContent = `⏰ ${agora.toLocaleTimeString()}`;
    }
    
    // Remover qualquer indicador de carregamento genérico
    const carregandoElements = document.querySelectorAll('[data-loading="true"]');
    carregandoElements.forEach(el => {
        el.removeAttribute('data-loading');
        if (el.textContent.includes('Carregando')) {
            el.textContent = el.textContent.replace('Carregando...', 'Pronto ✅');
        }
    });
    
    // Procurar por elementos com texto "Carregando" e atualizá-los
    const todosElementos = document.querySelectorAll('*');
    todosElementos.forEach(el => {
        if (el.textContent && el.textContent.includes('Carregando...')) {
            if (el.id === 'admin-user') {
                el.textContent = '👤 Admin Conectado';
            } else if (el.id === 'session-time') {
                const agora = new Date();
                el.textContent = `⏰ ${agora.toLocaleTimeString()}`;
            } else {
                el.textContent = el.textContent.replace('Carregando...', 'Conectado ✅');
            }
        }
    });
    
    console.log('✅ [ADMIN] Status de carregamento atualizado');
}

// Função de logout
function logout() {
    if (confirm('Deseja realmente sair da administração?')) {
        console.log('🚪 Fazendo logout...');
        window.location.href = 'index.html';
    }
}

// Funções auxiliares para gerar cartelas

// Gerar números únicos para a cartela
function gerarNumerosCartela(numeroInicial, numeroFinal) {
    const totalNumeros = numeroFinal - numeroInicial + 1;
    const quantidadeNumeros = Math.min(15, totalNumeros); // Máximo 15 números por cartela
    
    const numerosDisponiveis = [];
    for (let i = numeroInicial; i <= numeroFinal; i++) {
        numerosDisponiveis.push(i);
    }
    
    // Embaralhar e pegar os primeiros números
    const numerosEscolhidos = [];
    for (let i = 0; i < quantidadeNumeros; i++) {
        const indiceAleatorio = Math.floor(Math.random() * numerosDisponiveis.length);
        numerosEscolhidos.push(numerosDisponiveis.splice(indiceAleatorio, 1)[0]);
    }
    
    return numerosEscolhidos.sort((a, b) => a - b);
}

// Gerar ID único para a cartela
function gerarIdCartela() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CART-${timestamp}-${random}`;
}

// Mostrar cartela gerada em modal
function mostrarCartelaGerada(cartela) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const conteudo = document.createElement('div');
    conteudo.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 500px;
        width: 90%;
        text-align: center;
    `;
    
    conteudo.innerHTML = `
        <h2>🎫 Cartela Gerada com Sucesso!</h2>
        <div style="margin: 20px 0;">
            <strong>ID:</strong> ${cartela.id}<br>
            <strong>Preço:</strong> R$ ${cartela.preco.toFixed(2)}<br>
            <strong>Range:</strong> ${cartela.numeroInicial} - ${cartela.numeroFinal}
        </div>
        <div style="margin: 20px 0;">
            <strong>Números da Cartela:</strong>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin: 10px 0;">
                ${cartela.numeros.map(num => 
                    `<div style="background: #007bff; color: white; padding: 10px; border-radius: 5px; font-weight: bold;">${num}</div>`
                ).join('')}
            </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            ✅ Fechar
        </button>
        <button onclick="imprimirCartela('${cartela.id}')" 
                style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            🖨️ Imprimir
        </button>
    `;
    
    modal.appendChild(conteudo);
    document.body.appendChild(modal);
    
    // Remover modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Função para imprimir cartela
function imprimirCartela(cartelaId) {
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
        <html>
        <head>
            <title>Cartela de Bingo - ${cartelaId}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .cartela { border: 2px solid #000; padding: 20px; margin: 20px auto; max-width: 400px; }
                .header { text-align: center; margin-bottom: 20px; }
                .numeros { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }
                .numero { border: 1px solid #000; padding: 15px; text-align: center; font-weight: bold; font-size: 18px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="cartela">
                <div class="header">
                    <h1>🎪 BINGO ARRAIÁ INEC</h1>
                    <p>Cartela: ${cartelaId}</p>
                </div>
                <div class="numeros" id="numeros-cartela">
                    <!-- Números serão inseridos aqui -->
                </div>
                <div class="footer">
                    <p>Data: ${new Date().toLocaleDateString()}</p>
                    <p>Boa sorte! 🍀</p>
                </div>
            </div>
            <script>
                // Buscar dados da cartela do localStorage ou do banco
                window.print();
                setTimeout(() => window.close(), 1000);
            </script>
        </body>
        </html>
    `);
    janelaImpressao.document.close();
}

// Atualizar contadores de cartelas
async function atualizarContadoresCartelas() {
    try {
        console.log('📊 Atualizando contadores de cartelas...');
        
        // Buscar todas as cartelas
        const snapshot = await window.db.collection('cartelas').get();
        
        let cartelasGeradas = 0;
        let cartelasVendidas = 0;
        let totalArrecadado = 0;
        
        snapshot.forEach(doc => {
            const cartela = doc.data();
            cartelasGeradas++;
            
            if (cartela.status === 'vendida' || cartela.status === 'paga') {
                cartelasVendidas++;
                totalArrecadado += cartela.preco || 0;
            }
        });
        
        // Atualizar interface
        const spanGeradas = document.getElementById('cartelas-geradas');
        const spanVendidas = document.getElementById('cartelas-vendidas');
        const spanArrecadado = document.getElementById('total-arrecadado');
        
        if (spanGeradas) spanGeradas.textContent = cartelasGeradas;
        if (spanVendidas) spanVendidas.textContent = cartelasVendidas;
        if (spanArrecadado) spanArrecadado.textContent = `R$ ${totalArrecadado.toFixed(2)}`;
        
        console.log('✅ Contadores atualizados:', { cartelasGeradas, cartelasVendidas, totalArrecadado });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar contadores:', error);
    }
}

// Modal de vendas
async function mostrarModalVendas() {
    console.log('📊 Carregando dados de vendas...');
    
    try {
        // Buscar todas as cartelas
        const snapshot = await window.db.collection('cartelas').get();
        
        const cartelas = [];
        snapshot.forEach(doc => {
            cartelas.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`📊 ${cartelas.length} cartelas encontradas`);
        
        // Criar modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const conteudo = document.createElement('div');
        conteudo.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 800px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
        `;
        
        // Gerar estatísticas
        const geradas = cartelas.length;
        const vendidas = cartelas.filter(c => c.status === 'vendida' || c.status === 'paga').length;
        const disponiveis = cartelas.filter(c => c.status === 'disponivel').length;
        const totalArrecadado = cartelas
            .filter(c => c.status === 'vendida' || c.status === 'paga')
            .reduce((total, c) => total + (c.preco || 0), 0);
        
        conteudo.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>💰 Relatório de Vendas</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">
                    ✕ Fechar
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #1976d2;">${geradas}</div>
                    <div style="color: #666;">Cartelas Geradas</div>
                </div>
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #388e3c;">${vendidas}</div>
                    <div style="color: #666;">Cartelas Vendidas</div>
                </div>
                <div style="background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #f57c00;">${disponiveis}</div>
                    <div style="color: #666;">Disponíveis</div>
                </div>
                <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #7b1fa2;">R$ ${totalArrecadado.toFixed(2)}</div>
                    <div style="color: #666;">Total Arrecadado</div>
                </div>
            </div>
            
            <h3>📋 Lista de Cartelas</h3>
            <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">ID</th>
                            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Números</th>
                            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Preço</th>
                            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Status</th>
                            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cartelas.map(cartela => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 12px;">
                                    ${cartela.id?.substring(0, 15)}...
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                                    ${cartela.numeros ? cartela.numeros.length : 'N/A'} números
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                                    R$ ${(cartela.preco || 0).toFixed(2)}
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                                    <span style="padding: 3px 8px; border-radius: 3px; font-size: 12px; color: white; background: ${getStatusColor(cartela.status)};">
                                        ${getStatusText(cartela.status)}
                                    </span>
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                                    <button onclick="verDetalhesCartela('${cartela.id}')" 
                                            style="background: #17a2b8; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                                        👁️ Ver
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="exportarRelatorio()" 
                        style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    📊 Exportar Relatório
                </button>
                <button onclick="atualizarContadoresCartelas()" 
                        style="background: #ffc107; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    🔄 Atualizar Dados
                </button>
            </div>
        `;
        
        modal.appendChild(conteudo);
        document.body.appendChild(modal);
        
        // Remover modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao mostrar vendas:', error);
        throw error;
    }
}

// Funções auxiliares para o modal de vendas
function getStatusColor(status) {
    switch (status) {
        case 'vendida':
        case 'paga':
            return '#28a745';
        case 'disponivel':
            return '#6c757d';
        case 'reservada':
            return '#ffc107';
        default:
            return '#6c757d';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'vendida':
            return '✅ Vendida';
        case 'paga':
            return '💰 Paga';
        case 'disponivel':
            return '🔓 Disponível';
        case 'reservada':
            return '⏰ Reservada';
        default:
            return '❓ Indefinido';
    }
}

// Ver detalhes da cartela
async function verDetalhesCartela(cartelaId) {
    try {
        const doc = await window.db.collection('cartelas').doc(cartelaId).get();
        
        if (doc.exists) {
            const cartela = { id: doc.id, ...doc.data() };
            
            alert(`
🎫 Detalhes da Cartela
                
ID: ${cartela.id}
Números: ${cartela.numeros ? cartela.numeros.join(', ') : 'N/A'}
Preço: R$ ${(cartela.preco || 0).toFixed(2)}
Status: ${getStatusText(cartela.status)}
Range: ${cartela.numeroInicial} - ${cartela.numeroFinal}
Data: ${cartela.dataGeracao ? 'Disponível' : 'N/A'}
            `);
        } else {
            alert('Cartela não encontrada!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar detalhes:', error);
        alert(`Erro ao carregar detalhes: ${error.message}`);
    }
}

// Exportar relatório
function exportarRelatorio() {
    alert('📊 Função de exportar relatório será implementada em breve!');
}

console.log('📄 [ADMIN] Script ultra simplificado carregado - aguardando página...');
