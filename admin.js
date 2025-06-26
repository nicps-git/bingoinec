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
        btnVerVendas.onclick = async () => {
            console.log('💰 Carregando vendas...');
            await mostrarModalVendas();
        };
        console.log('✅ Botão ver vendas configurado');
    }
    
    // Configurar modal de vendas
    const modal = document.getElementById('modal-vendas');
    const closeBtn = modal?.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    // Fechar modal clicando fora
    if (modal) {
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
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
        const userInfo = getUserInfo();
        if (userInfo) {
            userSpan.textContent = `👤 ${userInfo.email}`;
            userSpan.style.color = '#4CAF50';
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
    try {
        const modal = document.getElementById('modal-vendas');
        const listaDiv = document.getElementById('lista-cartelas');
        
        if (!modal || !listaDiv) return;
        
        // Mostrar loading
        listaDiv.innerHTML = '<div style="text-align: center; padding: 20px;">📊 Carregando vendas...</div>';
        modal.style.display = 'block';
        
        // Carregar cartelas
        const snapshot = await window.db.collection('cartelas').orderBy('dataGeracao', 'desc').get();
        
        if (snapshot.empty) {
            listaDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Nenhuma cartela encontrada</div>';
            return;
        }
        
        const cartelas = [];
        snapshot.forEach(doc => {
            cartelas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Separar vendidas e não vendidas
        const vendidas = cartelas.filter(c => c.vendida);
        const naoVendidas = cartelas.filter(c => !c.vendida);
        
        const precoCartela = parseFloat(document.getElementById('preco-cartela')?.value) || 5.00;
        const totalArrecadado = vendidas.length * precoCartela;
        
        listaDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 20px; border-radius: 15px; margin-bottom: 20px; border: 2px solid #4CAF50;">
                <h4 style="margin: 0 0 15px 0; color: #2e7d32;">📊 Resumo das Vendas</h4>
                <div style="display: grid; gap: 10px;">
                    <div><strong>Total de Cartelas:</strong> ${cartelas.length}</div>
                    <div><strong>Cartelas Vendidas:</strong> ${vendidas.length}</div>
                    <div><strong>Cartelas Disponíveis:</strong> ${naoVendidas.length}</div>
                    <div><strong>Total Arrecadado:</strong> R$ ${totalArrecadado.toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
            
            ${vendidas.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h5 style="color: #4CAF50;">✅ Cartelas Vendidas (${vendidas.length})</h5>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; padding: 10px;">
                        ${vendidas.map(cartela => `
                            <div style="background: #f8f9fa; margin: 5px 0; padding: 10px; border-radius: 8px; border-left: 4px solid #4CAF50;">
                                <strong>ID:</strong> ${cartela.id}<br>
                                <strong>Cliente:</strong> ${cartela.nomeComprador || 'Não informado'}<br>
                                <strong>Valor:</strong> R$ ${precoCartela.toFixed(2).replace('.', ',')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${naoVendidas.length > 0 ? `
                <div>
                    <h5 style="color: #ff9800;">⏳ Cartelas Disponíveis (${naoVendidas.length})</h5>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; padding: 10px;">
                        ${naoVendidas.slice(0, 10).map(cartela => `
                            <div style="background: #fff3e0; margin: 5px 0; padding: 10px; border-radius: 8px; border-left: 4px solid #ff9800;">
                                <strong>ID:</strong> ${cartela.id}<br>
                                <strong>Status:</strong> Disponível para venda
                            </div>
                        `).join('')}
                        ${naoVendidas.length > 10 ? `<div style="text-align: center; color: #666; font-style: italic;">... e mais ${naoVendidas.length - 10} cartelas</div>` : ''}
                    </div>
                </div>
            ` : ''}
        `;
        
        console.log('✅ Modal de vendas carregado');
        
    } catch (error) {
        console.error('❌ Erro ao carregar vendas:', error);
        const listaDiv = document.getElementById('lista-cartelas');
        if (listaDiv) {
            listaDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #f44336;">❌ Erro ao carregar vendas</div>';
        }
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
        adminPanel.classList.remove('status-connected', 'status-disconnected', 'status-loading');
        if (conectado === null) {
            adminPanel.classList.add('status-loading');
        } else if (conectado) {
            adminPanel.classList.add('status-connected');
        } else {
            adminPanel.classList.add('status-disconnected');
        }
    }
}

// Sistema de toast notifications
function mostrarToast(mensagem, tipo = 'info', duracao = 3000) {
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
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após duração
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duracao);
}
