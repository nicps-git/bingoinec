/**
 * BINGO ARRAIÁ INEC - SISTEMA ADMINISTRATIVO
 * ==========================================
 * 
 * Arquivo único consolidado para administração do Bingo
 * Todas as funcionalidades em um só lugar para evitar inconsistências
 * 
 * Funcionalidades:
 * - Configuração de números e preços
 * - Gestão de cartelas e vendas  
 * - Histórico de números sorteados
 * - Estatísticas em tempo real
 * - Sistema de feedback visual
 * - Autenticação integrada
 */
console.log('🚀 [ADMIN] Carregando sistema administrativo consolidado...');

// ===== FUNÇÃO MOSTRARTOAST - FALLBACK GARANTIDO =====
// Garantir que a função mostrarToast sempre existe no contexto admin
if (typeof mostrarToast === 'undefined' || !window.mostrarToast) {
    console.log('🔧 [ADMIN] Criando função mostrarToast como fallback...');
    
    function mostrarToast(mensagem, tipo = 'info', duracao = 3000) {
        console.log(`🍞 [TOAST] ${tipo.toUpperCase()}: ${mensagem}`);
        
        // Remover toast anterior se existir
        const toastAnterior = document.getElementById('toast-notification');
        if (toastAnterior) {
            toastAnterior.remove();
        }
        
        // Criar novo toast
        const toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: bold;
            max-width: 350px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            word-wrap: break-word;
        `;
        
        toast.textContent = mensagem;
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após duração
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, duracao);
    }
    
    // Tornar disponível globalmente
    window.mostrarToast = mostrarToast;
    console.log('✅ [ADMIN] Função mostrarToast criada e disponível globalmente');
} else {
    console.log('✅ [ADMIN] Função mostrarToast já disponível');
}

// ===== INICIALIZAÇÃO DO SISTEMA =====

// Aguardar que a página carregue completamente
window.addEventListener('load', () => {
    console.log('📄 [ADMIN] Página totalmente carregada, iniciando...');
    
    // Aguardar mais tempo para garantir que todos os scripts carregaram
    setTimeout(iniciarAdminMelhorado, 1000);
});

// Backup: se não funcionar com load, tentar com DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 [ADMIN] DOM carregado, configurando backup...');
    
    // Aguardar ainda mais para o backup
    setTimeout(() => {
        if (!window.adminInicializado) {
            console.log('🔄 [ADMIN] Executando inicialização de backup...');
            iniciarAdminMelhorado();
        }
    }, 2000);
});

async function iniciarAdminMelhorado() {
    // Evitar inicialização dupla
    if (window.adminInicializado) {
        console.log('ℹ️ [ADMIN] Já foi inicializado, pulando...');
        return;
    }
    
    console.log('🔄 [ADMIN] Iniciando sistema admin melhorado...');
    window.adminInicializado = true;
    
    // Mostrar loading na interface
    definirStatusConexao(null);
    
    try {
        // Verificar Firebase
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK não foi carregado');
        }
        
        // Inicializar Firebase
        if (typeof initFirebaseSimple === 'function') {
            if (!initFirebaseSimple()) {
                throw new Error('Falha na inicialização do Firebase');
            }
        } else {
            // Fallback: inicialização manual
            if (!firebase.apps || !firebase.apps.length) {
                if (typeof firebaseConfig !== 'undefined') {
                    firebase.initializeApp(firebaseConfig);
                    console.log('✅ Firebase inicializado (fallback)');
                } else {
                    throw new Error('Configuração do Firebase não encontrada');
                }
            }
            
            // Configurar variáveis globais (fallback)
            window.db = firebase.firestore();
            window.auth = firebase.auth();
        }
        
        // Configurar botões
        configurarBotoesSimples();
        
        // Carregar dados
        await carregarDadosBasicos();
        await carregarHistoricoNumeros();
        
        // Atualizar status
        atualizarStatusCarregamento();
        definirStatusConexao(true);
        
        // Toast de sucesso
        mostrarToast('🎉 Sistema admin carregado com sucesso!', 'success');
        
        console.log('🎉 [ADMIN] Sistema funcionando perfeitamente!');
        
    } catch (error) {
        console.error('❌ [ADMIN] Erro crítico:', error);
        definirStatusConexao(false);
        mostrarErroConexao(`Erro crítico: ${error.message}`);
        mostrarToast('❌ Falha ao carregar sistema admin', 'error');
    }
}

function mostrarErroConexao(mensagem) {
    // Criar elemento de erro se não existir
    let errorDiv = document.getElementById('error-connection');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-connection';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 90%;
            text-align: center;
            font-weight: bold;
        `;
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
        <div>❌ ${mensagem}</div>
        <button onclick="location.reload()" style="
            background: white;
            color: #ff4444;
            border: none;
            padding: 8px 16px;
            margin-top: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        ">🔄 Tentar Novamente</button>
    `;
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
                mostrarLoading(btnSalvar, true);
                
                const numeroInicial = parseInt(document.getElementById('numero-inicial')?.value) || 1;
                const numeroFinal = parseInt(document.getElementById('numero-final')?.value) || 75;
                const precoCartela = parseFloat(document.getElementById('preco-cartela')?.value) || 5.00;
                
                // Validações
                if (numeroInicial >= numeroFinal) {
                    throw new Error('O número inicial deve ser menor que o número final');
                }
                
                if (numeroFinal - numeroInicial > 200) {
                    throw new Error('Range muito grande (máximo 200 números)');
                }
                
                if (precoCartela <= 0) {
                    throw new Error('Preço da cartela deve ser maior que zero');
                }
                
                await window.db.collection('configuracoes').doc('bingo').set({
                    numeroInicial,
                    numeroFinal,
                    precoCartela,
                    jogoAtivo: true,
                    ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Feedback visual de sucesso
                mostrarFeedback(btnSalvar, 'success');
                mostrarFeedback('admin-panel', 'success');
                
                // Atualizar interface
                atualizarTotalNumeros();
                
                // Toast de sucesso
                mostrarToast('✅ Configurações salvas com sucesso!', 'success');
                
                console.log('✅ Configurações salvas com sucesso');
                
            } catch (error) {
                console.error('❌ Erro ao salvar:', error);
                
                // Feedback visual de erro
                mostrarFeedback(btnSalvar, 'error');
                
                // Toast de erro
                mostrarToast(`❌ Erro ao salvar: ${error.message}`, 'error');
                
            } finally {
                mostrarLoading(btnSalvar, false);
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
    
    // Atualizar Números
    const btnAtualizar = document.getElementById('atualizar-numeros');
    if (btnAtualizar) {
        btnAtualizar.onclick = async () => {
            console.log('🔄 Atualizando números...');
            
            try {
                await atualizarContadores();
                await carregarHistoricoNumeros();
                alert('✅ Números atualizados com sucesso!');
                console.log('✅ Números atualizados');
                
            } catch (error) {
                console.error('❌ Erro ao atualizar:', error);
                alert(`Erro ao atualizar: ${error.message}`);
            }
        };
        console.log('✅ Botão atualizar configurado');
    }
    
    // Diagnosticar Números
    const btnDiagnosticar = document.getElementById('diagnosticar-numeros');
    if (btnDiagnosticar) {
        btnDiagnosticar.onclick = async () => {
            console.log('🔍 Diagnosticando números...');
            
            try {
                const snapshot = await window.db.collection('numeros-sorteados').get();
                const numeros = [];
                snapshot.forEach(doc => {
                    numeros.push(doc.data().numero);
                });
                
                numeros.sort((a, b) => a - b);
                
                const diagnostico = `
🔍 DIAGNÓSTICO COMPLETO:
• Total de números sorteados: ${numeros.length}
• Números: ${numeros.join(', ')}
• Status da conexão: ✅ Conectado
• Última verificação: ${new Date().toLocaleString()}
                `;
                
                alert(diagnostico);
                console.log('✅ Diagnóstico concluído');
                
            } catch (error) {
                console.error('❌ Erro no diagnóstico:', error);
                alert(`Erro no diagnóstico: ${error.message}`);
            }
        };
        console.log('✅ Botão diagnosticar configurado');
    }
    
    // Gerar Cartela
    const btnGerarCartela = document.getElementById('gerar-cartela');
    if (btnGerarCartela) {
        btnGerarCartela.onclick = () => {
            console.log('🎫 Redirecionando para gerar cartela...');
            window.location.href = 'cartelas.html';
        };
        console.log('✅ Botão gerar cartela configurado');
    }
    
    // Ver Vendas
    const btnVerVendas = document.getElementById('ver-vendas');
    if (btnVerVendas) {
        btnVerVendas.onclick = async (e) => {
            e.preventDefault();
            console.log('💰 [ADMIN] Botão Ver Vendas clicado');
            try {
                await mostrarModalVendas();
            } catch (error) {
                console.error('❌ Erro ao abrir modal:', error);
                if (typeof mostrarToast === 'function') {
                    mostrarToast('❌ Erro ao carregar vendas: ' + error.message, 'error');
                } else {
                    alert('❌ Erro ao carregar vendas: ' + error.message);
                }
            }
        };
        console.log('✅ Botão ver vendas configurado');
    } else {
        console.warn('⚠️ Botão ver-vendas não encontrado');
    }
    
    // Configurar modal de vendas
    const modal = document.getElementById('modal-vendas');
    if (modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                console.log('❌ Fechando modal de vendas');
                fecharModalVendas();
            };
        }
        
        // Fechar modal clicando fora
        modal.onclick = (event) => {
            if (event.target === modal) {
                console.log('❌ Fechando modal (clique fora)');
                fecharModalVendas();
            }
        };
        
        console.log('✅ Modal de vendas configurado');
    } else {
        console.warn('⚠️ Modal modal-vendas não encontrado');
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
    console.log('📊 [ADMIN] Carregando dados básicos...');
    
    try {
        // Carregar configurações
        const configDoc = await window.db.collection('configuracoes').doc('bingo').get();
        if (configDoc.exists) {
            const config = configDoc.data();
            
            // Preencher campos
            const inputInicial = document.getElementById('numero-inicial');
            const inputFinal = document.getElementById('numero-final');
            const inputPreco = document.getElementById('preco-cartela');
            
            if (inputInicial) inputInicial.value = config.numeroInicial || 1;
            if (inputFinal) inputFinal.value = config.numeroFinal || 75;
            if (inputPreco) inputPreco.value = (config.precoCartela || 5.00).toFixed(2);
            
            console.log('✅ Configurações carregadas');
        }
        
        // Carregar contadores
        await atualizarContadores();
        
        // Atualizar total de números
        atualizarTotalNumeros();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados básicos:', error);
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
        console.log('📊 Carregando números sorteados...');
        
        const snapshot = await window.db.collection('numeros-sorteados').get();
        const numerosSorteados = snapshot.size;
        
        console.log(`✅ Números sorteados carregados: ${numerosSorteados}`);
        
        return numerosSorteados;
        
    } catch (error) {
        console.error('❌ Erro ao carregar números sorteados:', error);
        
        // Tentar coleção alternativa
        try {
            console.log('🔄 Tentando coleção alternativa...');
            const snapshotAlt = await window.db.collection('numerosSorteados').get();
            const numerosSorteadosAlt = snapshotAlt.size;
            console.log(`✅ Números sorteados (alternativo): ${numerosSorteadosAlt}`);
            return numerosSorteadosAlt;
        } catch (altError) {
            console.error('❌ Erro na coleção alternativa:', altError);
            return 0;
        }
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
        console.log('📊 Atualizando contadores...');
        
        // Números sorteados
        const numerosSorteados = await carregarNumerosSorteados();
        
        // Cartelas
        let totalCartelas = 0;
        let cartelasVendidas = 0;
        
        try {
            const cartelasSnapshot = await window.db.collection('cartelas').get();
            totalCartelas = cartelasSnapshot.size;
            cartelasVendidas = cartelasSnapshot.docs.filter(doc => {
                const data = doc.data();
                return data.vendida === true || data.status === 'vendida';
            }).length;
        } catch (cartelasError) {
            console.warn('⚠️ Erro ao carregar cartelas:', cartelasError);
            totalCartelas = 0;
            cartelasVendidas = 0;
        }
        
        // Atualizar interface
        const spanSorteados = document.getElementById('numeros-sorteados-count');
        const spanCartelas = document.getElementById('cartelas-geradas');
        const spanVendidas = document.getElementById('cartelas-vendidas');
        const spanArrecadado = document.getElementById('total-arrecadado');
        
        if (spanSorteados) {
            spanSorteados.textContent = numerosSorteados;
            spanSorteados.style.color = numerosSorteados > 0 ? '#4CAF50' : '#666';
        }
        if (spanCartelas) {
            spanCartelas.textContent = totalCartelas;
            spanCartelas.style.color = totalCartelas > 0 ? '#2196F3' : '#666';
        }
        if (spanVendidas) {
            spanVendidas.textContent = cartelasVendidas;
            spanVendidas.style.color = cartelasVendidas > 0 ? '#4CAF50' : '#666';
        }
        
        // Calcular arrecadação
        const precoCartela = parseFloat(document.getElementById('preco-cartela')?.value) || 5.00;
        const totalArrecadado = cartelasVendidas * precoCartela;
        if (spanArrecadado) {
            spanArrecadado.textContent = `R$ ${totalArrecadado.toFixed(2).replace('.', ',')}`;
            spanArrecadado.style.color = totalArrecadado > 0 ? '#4CAF50' : '#666';
        }
        
        // Atualizar números restantes
        const inputInicial = document.getElementById('numero-inicial');
        const inputFinal = document.getElementById('numero-final');
        if (inputInicial && inputFinal) {
            const inicial = parseInt(inputInicial.value) || 1;
            const final = parseInt(inputFinal.value) || 75;
            const total = Math.max(0, final - inicial + 1);
            const restantes = Math.max(0, total - numerosSorteados);
            
            const spanRestantes = document.getElementById('numeros-restantes');
            if (spanRestantes) {
                spanRestantes.textContent = restantes;
                spanRestantes.style.color = restantes > 0 ? '#ff9800' : '#f44336';
            }
        }
        
        console.log(`✅ Contadores atualizados: ${numerosSorteados} sorteados, ${totalCartelas} cartelas, ${cartelasVendidas} vendidas`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar contadores:', error);
        
        // Mostrar erro na interface
        const elementos = ['numeros-sorteados-count', 'cartelas-geradas', 'cartelas-vendidas', 'total-arrecadado', 'numeros-restantes'];
        elementos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = 'Erro';
                elemento.style.color = '#f44336';
            }
        });
    }
}

// Atualizar status de carregamento
function atualizarStatusCarregamento() {
    const userSpan = document.getElementById('admin-user');
    const timeSpan = document.getElementById('session-time');
    
    if (userSpan) {
        // Obter informações da sessão do localStorage
        const sessionData = localStorage.getItem('bingoAdminSession');
        if (sessionData) {
            try {
                const userInfo = JSON.parse(sessionData);
                userSpan.textContent = `👤 ${userInfo.email}`;
                userSpan.style.color = '#4CAF50';
            } catch (error) {
                userSpan.textContent = '👤 Admin Conectado';
                userSpan.style.color = '#4CAF50';
            }
        } else {
            userSpan.textContent = '👤 Admin Conectado';
            userSpan.style.color = '#4CAF50';
        }
    }
    
    if (timeSpan) {
        if (typeof getSessionTimeString === 'function') {
            timeSpan.textContent = `⏰ ${getSessionTimeString()}`;
        } else {
            const now = new Date();
            timeSpan.textContent = `⏰ ${now.toLocaleTimeString()}`;
        }
        timeSpan.style.color = '#2196F3';
    }
    
    console.log('✅ Status de carregamento atualizado');
}

// Função logout para os botões do header
function logout() {
    if (confirm('🚪 Deseja realmente sair da área administrativa?')) {
        console.log('🚪 Redirecionando para página principal...');
        window.location.href = 'index.html';
    }
}

// Configurar navegação do header
function configurarNavegacao() {
    // Os links já estão configurados no HTML
    // Apenas garantir que o logout funcione
    const logoutBtns = document.querySelectorAll('.btn-logout, [onclick*="logout"]');
    logoutBtns.forEach(btn => {
        btn.onclick = logout;
    });
}

// Carregar histórico de números sorteados
async function carregarHistoricoNumeros() {
    const historicoDiv = document.getElementById('historico-numeros');
    if (!historicoDiv) {
        console.warn('⚠️ Elemento historico-numeros não encontrado');
        return;
    }
    
    try {
        console.log('📚 Carregando histórico de números...');
        
        // Mostrar loading
        historicoDiv.innerHTML = '<p style="text-align: center; color: #666;">📊 Carregando histórico...</p>';
        
        // Tentar carregar com ordenação
        let snapshot;
        try {
            snapshot = await window.db.collection('numeros-sorteados').orderBy('timestamp', 'desc').get();
        } catch (orderError) {
            console.warn('⚠️ Erro na ordenação, carregando sem ordenar:', orderError);
            // Fallback: carregar sem ordenação
            snapshot = await window.db.collection('numeros-sorteados').get();
        }
        
        if (snapshot.empty) {
            historicoDiv.innerHTML = '<p class="sem-historico">Nenhum número sorteado ainda</p>';
            console.log('ℹ️ Nenhum número no histórico');
            return;
        }
        
        const numeros = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            numeros.push({
                numero: data.numero || data.value || parseInt(doc.id),
                timestamp: data.timestamp || new Date()
            });
        });
        
        // Ordenar por número se não conseguiu ordenar por timestamp
        if (!snapshot.metadata?.fromCache) {
            numeros.sort((a, b) => {
                if (a.timestamp && b.timestamp) {
                    return b.timestamp.toMillis() - a.timestamp.toMillis();
                }
                return b.numero - a.numero;
            });
        }
        
        // Exibir últimos 25 números
        const ultimosNumeros = numeros.slice(0, 25);
        
        historicoDiv.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 15px;">
                ${ultimosNumeros.map((item, index) => `
                    <div style="
                        background: linear-gradient(135deg, ${index < 5 ? '#4CAF50, #45a049' : '#2196f3, #1976d2'});
                        color: white;
                        padding: 8px 12px;
                        border-radius: 15px;
                        font-weight: bold;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        min-width: 35px;
                        text-align: center;
                        transition: transform 0.2s ease;
                    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                        ${item.numero}
                    </div>
                `).join('')}
            </div>
            <div style="text-align: center; color: #666; font-size: 0.9em;">
                ${ultimosNumeros.length} de ${numeros.length} números sorteados
                ${numeros.length > 25 ? '(mostrando os mais recentes)' : ''}
            </div>
        `;
        
        console.log(`✅ Histórico carregado: ${numeros.length} números`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        
        // Tentar coleção alternativa
        try {
            console.log('🔄 Tentando coleção alternativa para histórico...');
            const snapshotAlt = await window.db.collection('numerosSorteados').get();
            
            if (!snapshotAlt.empty) {
                const numerosAlt = [];
                snapshotAlt.forEach(doc => {
                    const data = doc.data();
                    numerosAlt.push(data.numero || parseInt(doc.id));
                });
                
                numerosAlt.sort((a, b) => b - a);
                
                historicoDiv.innerHTML = `
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 15px;">
                        ${numerosAlt.slice(0, 25).map(numero => `
                            <div style="
                                background: linear-gradient(135deg, #ff9800, #f57c00);
                                color: white;
                                padding: 8px 12px;
                                border-radius: 15px;
                                font-weight: bold;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                                min-width: 35px;
                                text-align: center;
                            ">
                                ${numero}
                            </div>
                        `).join('')}
                    </div>
                    <div style="text-align: center; color: #666; font-size: 0.9em;">
                        ${numerosAlt.length} números (fonte alternativa)
                    </div>
                `;
                
                console.log('✅ Histórico alternativo carregado');
                return;
            }
        } catch (altError) {
            console.error('❌ Erro na coleção alternativa:', altError);
        }
        
        // Se tudo falhou, mostrar erro
        historicoDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #f44336; margin-bottom: 15px;">❌ Erro ao carregar histórico</p>
                <button onclick="carregarHistoricoNumeros()" style="
                    background: #2196f3;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 15px;
                    cursor: pointer;
                ">🔄 Tentar Novamente</button>
            </div>
        `;
    }
}

// Mostrar modal de vendas
async function mostrarModalVendas() {
    console.log('💰 [ADMIN] Abrindo modal de vendas...');
    
    try {
        const modal = document.getElementById('modal-vendas');
        const listaDiv = document.getElementById('lista-cartelas');
        
        console.log('🔍 Verificando elementos:', {
            modal: !!modal,
            listaDiv: !!listaDiv,
            db: !!window.db
        });
        
        if (!modal || !listaDiv) {
            const erro = 'Modal ou lista não encontrados';
            console.error('❌', erro);
            mostrarToast('❌ Erro: ' + erro, 'error');
            return;
        }
        
        // Mostrar modal e loading
        console.log('📋 Abrindo modal...');
        modal.style.display = 'block';
        listaDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><div style="font-size: 24px; margin-bottom: 10px;">📊</div><p>Carregando dados das vendas...</p></div>';
        
        // Verificar conexão com Firebase
        if (!window.db) {
            throw new Error('Banco de dados não conectado');
        }
        
        // Carregar cartelas do Firebase
        console.log('📡 Buscando cartelas no Firebase...');
        const snapshot = await window.db.collection('cartelas')
            .orderBy('dataGeracao', 'desc')
            .get();
        
        const cartelas = [];
        snapshot.forEach(doc => {
            cartelas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`📊 ${cartelas.length} cartelas encontradas`);
        
        // Calcular estatísticas
        const vendidas = cartelas.filter(c => c.vendida === true);
        const disponiveis = cartelas.filter(c => !c.vendida);
        const precoCartela = parseFloat(document.getElementById('preco-cartela')?.value) || 5.00;
        const totalArrecadado = vendidas.length * precoCartela;
        
        console.log('📈 Estatísticas:', {
            total: cartelas.length,
            vendidas: vendidas.length,
            disponiveis: disponiveis.length,
            arrecadado: totalArrecadado
        });
        
        // Atualizar resumo no modal
        atualizarResumoModal(cartelas.length, vendidas.length, disponiveis.length, totalArrecadado);
        
        // Renderizar lista de cartelas
        if (cartelas.length === 0) {
            listaDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                    <h4>Nenhuma cartela encontrada</h4>
                    <p>Ainda não foram geradas cartelas para este bingo.</p>
                    <button onclick="gerarCartelaTeste()" class="btn-primary" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🎫 Gerar Cartela de Teste
                    </button>
                </div>
            `;
        } else {
            renderizarListaCartelasModal(cartelas, precoCartela);
        }
        
        console.log('✅ Modal de vendas carregado com sucesso');
        mostrarToast('📊 Dados de vendas atualizados!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao carregar vendas:', error);
        
        const listaDiv = document.getElementById('lista-cartelas');
        if (listaDiv) {
            listaDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #d32f2f;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h4>Erro ao carregar vendas</h4>
                    <p>${error.message}</p>
                    <button onclick="mostrarModalVendas()" class="btn-primary" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Tentar Novamente
                    </button>
                </div>
            `;
        }
        
        mostrarToast(`❌ Erro ao carregar vendas: ${error.message}`, 'error');
    }
}

function atualizarResumoModal(total, vendidas, disponiveis, arrecadado) {
    const elementos = {
        'total-cartelas': total,
        'cartelas-vendidas-modal': vendidas,
        'cartelas-disponiveis': disponiveis,
        'total-arrecadado-modal': `R$ ${arrecadado.toFixed(2).replace('.', ',')}`
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    });
}

function renderizarListaCartelasModal(cartelas, precoCartela) {
    const listaDiv = document.getElementById('lista-cartelas');
    const vendidas = cartelas.filter(c => c.vendida);
    const disponiveis = cartelas.filter(c => !c.vendida);
    
    let html = '';
    
    // Seção de cartelas vendidas
    if (vendidas.length > 0) {
        html += `
            <div class="secao-cartelas">
                <h4 style="color: #4CAF50; margin-bottom: 15px;">✅ Cartelas Vendidas (${vendidas.length})</h4>
                ${vendidas.slice(0, 10).map(cartela => renderizarCartelaItem(cartela, precoCartela, true)).join('')}
                ${vendidas.length > 10 ? `<div style="text-align: center; color: #666; font-style: italic; margin: 10px 0;">... e mais ${vendidas.length - 10} cartelas vendidas</div>` : ''}
            </div>
        `;
    }
    
    // Seção de cartelas disponíveis
    if (disponiveis.length > 0) {
        html += `
            <div class="secao-cartelas" style="margin-top: 20px;">
                <h4 style="color: #ff9800; margin-bottom: 15px;">⏳ Cartelas Disponíveis (${disponiveis.length})</h4>
                ${disponiveis.slice(0, 10).map(cartela => renderizarCartelaItem(cartela, precoCartela, false)).join('')}
                ${disponiveis.length > 10 ? `<div style="text-align: center; color: #666; font-style: italic; margin: 10px 0;">... e mais ${disponiveis.length - 10} cartelas disponíveis</div>` : ''}
            </div>
        `;
    }
    
    listaDiv.innerHTML = html;
}

function renderizarCartelaItem(cartela, preco, vendida) {
    const dataFormatada = cartela.dataGeracao ? 
        new Date(cartela.dataGeracao.toDate()).toLocaleDateString('pt-BR') : 
        'Data não disponível';
    
    return `
        <div class="cartela-item ${vendida ? 'vendida' : 'disponivel'}">
            <div class="cartela-info">
                <div class="cartela-id">ID: ${cartela.id.substring(0, 12)}...</div>
                <div class="cartela-status">
                    ${vendida ? 
                        `✅ Vendida - ${cartela.nomeComprador || 'Cliente não informado'}` : 
                        '⏳ Disponível para venda'
                    }
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    Gerada em: ${dataFormatada} | Preço: R$ ${preco.toFixed(2).replace('.', ',')}
                </div>
            </div>
            <div class="cartela-actions">
                <button onclick="visualizarCartela('${cartela.id}')" class="btn-info" style="background: #2196F3; color: white;">
                    👁️ Ver
                </button>
                ${!vendida ? `
                    <button onclick="marcarComoVendida('${cartela.id}')" class="btn-success" style="background: #4CAF50; color: white;">
                        💰 Vender
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function fecharModalVendas() {
    const modal = document.getElementById('modal-vendas');
    if (modal) {
        modal.style.display = 'none';
    }
}

function exportarRelatorio() {
    mostrarToast('📊 Funcionalidade de exportação será implementada em breve!', 'info');
}

function atualizarDados() {
    mostrarModalVendas();
}

async function marcarComoVendida(cartelaId) {
    const nomeComprador = prompt('Nome do comprador:');
    if (!nomeComprador) return;
    
    try {
        await window.db.collection('cartelas').doc(cartelaId).update({
            vendida: true,
            nomeComprador: nomeComprador,
            dataVenda: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        mostrarToast('✅ Cartela marcada como vendida!', 'success');
        mostrarModalVendas(); // Atualizar modal
        
    } catch (error) {
        console.error('❌ Erro ao marcar cartela como vendida:', error);
        mostrarToast('❌ Erro ao marcar cartela como vendida', 'error');
    }
}

function visualizarCartela(cartelaId) {
    // Implementar visualização da cartela
    window.open(`cartela-preview.html?id=${cartelaId}`, '_blank');
}

// Função para gerar cartela de teste
async function gerarCartelaTeste() {
    console.log('🎫 Gerando cartela de teste...');
    
    try {
        if (!window.db) {
            throw new Error('Banco de dados não conectado');
        }
        
        // Gerar números aleatórios para a cartela
        const cartela = {
            numeros: [
                [1, 16, 31, 46, 61],
                [2, 17, 32, 47, 62],
                [3, 18, 'FREE', 48, 63],
                [4, 19, 34, 49, 64],
                [5, 20, 35, 50, 65]
            ],
            dataGeracao: firebase.firestore.FieldValue.serverTimestamp(),
            vendida: Math.random() > 0.5, // 50% chance de estar vendida
            nomeComprador: Math.random() > 0.5 ? 'Cliente Teste' : null,
            telefone: Math.random() > 0.5 ? '(11) 99999-0000' : null
        };
        
        await window.db.collection('cartelas').add(cartela);
        
        mostrarToast('✅ Cartela de teste criada com sucesso!', 'success');
        console.log('✅ Cartela de teste criada');
        
        // Recarregar modal
        setTimeout(() => {
            mostrarModalVendas();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro ao gerar cartela de teste:', error);
        mostrarToast('❌ Erro ao gerar cartela: ' + error.message, 'error');
    }
}

// Utilidades de feedback visual
function mostrarLoading(elemento, mostrar = true) {
    if (typeof elemento === 'string') {
        elemento = document.getElementById(elemento);
    }
    
    if (!elemento) return;
    
    if (mostrar) {
        elemento.classList.add('loading');
    } else {
        elemento.classList.remove('loading');
    }
}

function mostrarFeedback(elemento, tipo = 'success') {
    if (typeof elemento === 'string') {
        elemento = document.getElementById(elemento);
    }
    
    if (!elemento) return;
    
    elemento.classList.add(`${tipo}-flash`);
    setTimeout(() => {
        elemento.classList.remove(`${tipo}-flash`);
    }, 600);
}

function definirStatusConexao(conectado = true) {
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel) {
        if (conectado) {
            adminPanel.style.opacity = '1';
            adminPanel.style.filter = 'none';
        } else {
            adminPanel.style.opacity = '0.5';
            adminPanel.style.filter = 'grayscale(100%)';
        }
    }
}

// Função para gerar cartela de teste
async function gerarCartelaTeste() {
    console.log('🎫 Gerando cartela de teste...');
    
    try {
        if (!window.db) {
            throw new Error('Banco de dados não conectado');
        }
        
        // Gerar números aleatórios para a cartela
        const cartela = {
            numeros: [
                [1, 16, 31, 46, 61],
                [2, 17, 32, 47, 62],
                [3, 18, 'FREE', 48, 63],
                [4, 19, 34, 49, 64],
                [5, 20, 35, 50, 65]
            ],
            dataGeracao: firebase.firestore.FieldValue.serverTimestamp(),
            vendida: Math.random() > 0.5, // 50% chance de estar vendida
            nomeComprador: Math.random() > 0.5 ? 'Cliente Teste' : null,
            telefone: Math.random() > 0.5 ? '(11) 99999-0000' : null
        };
        
        await window.db.collection('cartelas').add(cartela);
        
        mostrarToast('✅ Cartela de teste criada com sucesso!', 'success');
        console.log('✅ Cartela de teste criada');
        
        // Recarregar modal
        setTimeout(() => {
            mostrarModalVendas();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro ao gerar cartela de teste:', error);
        mostrarToast('❌ Erro ao gerar cartela: ' + error.message, 'error');
    }
}
