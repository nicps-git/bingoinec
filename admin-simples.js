// ADMIN.JS SIMPLIFICADO - DEBUG
console.log('🔄 [ADMIN] Iniciando versão simplificada...');

// Variáveis globais
let firebaseService = null;
let configuracoes = {};

// Função de inicialização simplificada
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 [ADMIN] DOM carregado');
    
    try {
        // Aguardar Firebase carregar
        await aguardarFirebase();
        
        // Inicializar Firebase Service
        firebaseService = new FirebaseService();
        console.log('✅ [ADMIN] Firebase Service criado');
        
        // Configurar botões
        configurarBotoes();
        
        // Carregar dados iniciais
        await carregarDadosIniciais();
        
        console.log('✅ [ADMIN] Inicialização concluída com sucesso');
        
    } catch (error) {
        console.error('❌ [ADMIN] Erro:', error);
        alert(`Erro na inicialização: ${error.message}`);
    }
});

// Aguardar Firebase estar disponível
function aguardarFirebase() {
    return new Promise((resolve, reject) => {
        let tentativas = 0;
        const maxTentativas = 30;
        
        const verificar = () => {
            tentativas++;
            
            if (typeof firebase !== 'undefined' && typeof FirebaseService !== 'undefined') {
                console.log('✅ [ADMIN] Firebase disponível');
                resolve();
                return;
            }
            
            if (tentativas >= maxTentativas) {
                reject(new Error('Timeout: Firebase não carregou'));
                return;
            }
            
            console.log(`🔄 [ADMIN] Aguardando Firebase... (${tentativas}/${maxTentativas})`);
            setTimeout(verificar, 200);
        };
        
        verificar();
    });
}

// Configurar eventos dos botões
function configurarBotoes() {
    console.log('🔄 [ADMIN] Configurando botões...');
    
    // Botão Salvar Configurações
    const salvarBtn = document.getElementById('salvar-config');
    if (salvarBtn) {
        salvarBtn.onclick = salvarConfiguracoes;
        console.log('✅ Botão salvar configurado');
    }
    
    // Botão Resetar Jogo
    const resetarBtn = document.getElementById('resetar-jogo');
    if (resetarBtn) {
        resetarBtn.onclick = resetarJogo;
        console.log('✅ Botão resetar configurado');
    }
    
    // Botão Ir para Bingo
    const bingoBtn = document.getElementById('ir-para-bingo');
    if (bingoBtn) {
        bingoBtn.onclick = () => window.location.href = 'index.html';
        console.log('✅ Botão bingo configurado');
    }
    
    // Botão Gerar Cartela
    const gerarBtn = document.getElementById('gerar-cartela');
    if (gerarBtn) {
        gerarBtn.onclick = gerarCartela;
        console.log('✅ Botão gerar cartela configurado');
    }
    
    // Botão Ver Vendas
    const vendasBtn = document.getElementById('ver-vendas');
    if (vendasBtn) {
        vendasBtn.onclick = verVendas;
        console.log('✅ Botão ver vendas configurado');
    }
    
    // Botão Limpar Histórico
    const limparBtn = document.getElementById('limpar-historico');
    if (limparBtn) {
        limparBtn.onclick = limparHistorico;
        console.log('✅ Botão limpar histórico configurado');
    }
    
    console.log('✅ [ADMIN] Todos os botões configurados');
}

// Carregar dados iniciais
async function carregarDadosIniciais() {
    console.log('🔄 [ADMIN] Carregando dados iniciais...');
    
    try {
        // Carregar configurações
        configuracoes = await firebaseService.carregarConfiguracoes();
        console.log('✅ Configurações carregadas:', configuracoes);
        
        // Atualizar interface
        atualizarInterface();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        // Não falhar por isso, apenas log
    }
}

// Atualizar interface com dados
function atualizarInterface() {
    console.log('🔄 [ADMIN] Atualizando interface...');
    
    // Número inicial
    const numeroInicial = document.getElementById('numero-inicial');
    if (numeroInicial && configuracoes.numeroInicial) {
        numeroInicial.value = configuracoes.numeroInicial;
    }
    
    // Número final
    const numeroFinal = document.getElementById('numero-final');
    if (numeroFinal && configuracoes.numeroFinal) {
        numeroFinal.value = configuracoes.numeroFinal;
    }
    
    // Preço cartela
    const precoCartela = document.getElementById('preco-cartela');
    if (precoCartela && configuracoes.precoCartela) {
        precoCartela.value = configuracoes.precoCartela;
    }
    
    // Calcular total de números
    calcularTotalNumeros();
    
    console.log('✅ [ADMIN] Interface atualizada');
}

// Calcular total de números
function calcularTotalNumeros() {
    const numeroInicial = document.getElementById('numero-inicial');
    const numeroFinal = document.getElementById('numero-final');
    const totalSpan = document.getElementById('total-numeros');
    const rangeSpan = document.getElementById('range-atual');
    
    if (numeroInicial && numeroFinal && totalSpan && rangeSpan) {
        const inicio = parseInt(numeroInicial.value) || 1;
        const fim = parseInt(numeroFinal.value) || 75;
        const total = fim - inicio + 1;
        
        totalSpan.textContent = total;
        rangeSpan.textContent = `${inicio} a ${fim}`;
    }
}

// Eventos dos inputs para recalcular
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const numeroInicial = document.getElementById('numero-inicial');
        const numeroFinal = document.getElementById('numero-final');
        
        if (numeroInicial) {
            numeroInicial.addEventListener('input', calcularTotalNumeros);
        }
        if (numeroFinal) {
            numeroFinal.addEventListener('input', calcularTotalNumeros);
        }
    }, 1000);
});

// Funções dos botões
async function salvarConfiguracoes() {
    console.log('🔄 [ADMIN] Salvando configurações...');
    
    try {
        const numeroInicial = document.getElementById('numero-inicial');
        const numeroFinal = document.getElementById('numero-final');
        const precoCartela = document.getElementById('preco-cartela');
        
        const config = {
            numeroInicial: parseInt(numeroInicial?.value) || 1,
            numeroFinal: parseInt(numeroFinal?.value) || 75,
            precoCartela: parseFloat(precoCartela?.value) || 5.00,
            jogoAtivo: true
        };
        
        await firebaseService.salvarConfiguracoes(config);
        
        alert('✅ Configurações salvas com sucesso!');
        console.log('✅ [ADMIN] Configurações salvas');
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert(`Erro ao salvar configurações: ${error.message}`);
    }
}

async function resetarJogo() {
    if (!confirm('⚠️ Tem certeza que deseja resetar o jogo? Isso vai limpar todos os números sorteados!')) {
        return;
    }
    
    console.log('🔄 [ADMIN] Resetando jogo...');
    
    try {
        await firebaseService.resetarJogo();
        alert('✅ Jogo resetado com sucesso!');
        console.log('✅ [ADMIN] Jogo resetado');
        
    } catch (error) {
        console.error('❌ Erro ao resetar:', error);
        alert(`Erro ao resetar jogo: ${error.message}`);
    }
}

async function gerarCartela() {
    console.log('🔄 [ADMIN] Gerando cartela...');
    
    try {
        // Aqui você pode implementar a lógica de geração
        alert('🎫 Função de gerar cartela em desenvolvimento');
        
    } catch (error) {
        console.error('❌ Erro ao gerar cartela:', error);
        alert(`Erro ao gerar cartela: ${error.message}`);
    }
}

async function verVendas() {
    console.log('🔄 [ADMIN] Carregando vendas...');
    
    try {
        // Aqui você pode implementar a visualização de vendas
        alert('💰 Função de ver vendas em desenvolvimento');
        
    } catch (error) {
        console.error('❌ Erro ao carregar vendas:', error);
        alert(`Erro ao carregar vendas: ${error.message}`);
    }
}

async function limparHistorico() {
    if (!confirm('⚠️ Tem certeza que deseja limpar o histórico de números sorteados?')) {
        return;
    }
    
    console.log('🔄 [ADMIN] Limpando histórico...');
    
    try {
        await firebaseService.limparNumerosSorteados();
        alert('✅ Histórico limpo com sucesso!');
        console.log('✅ [ADMIN] Histórico limpo');
        
    } catch (error) {
        console.error('❌ Erro ao limpar histórico:', error);
        alert(`Erro ao limpar histórico: ${error.message}`);
    }
}

// Função de logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        if (window.bingoAuth) {
            window.bingoAuth.logout();
        }
        window.location.href = 'index.html';
    }
}

console.log('✅ [ADMIN] Script simplificado carregado');
