/**
 * BINGO ARRAIÁ INEC - SISTEMA DE CARTELAS DO COMPRADOR
 * ===================================================
 * 
 * Arquivo consolidado para visualização e acompanhamento de cartelas
 * Todas as funcionalidades reunidas para evitar inconsistências
 * 
 * Funcionalidades:
 * - Login/consulta por telefone
 * - Visualização de cartelas compradas
 * - Marcação automática de números
 * - Verificação de BINGO
 * - Sistema de alertas e notificações
 * - Integração com Firebase
 */

console.log('🚀 [CARTELAS] Carregando sistema de cartelas consolidado...');

// ===== VARIÁVEIS GLOBAIS =====
let compradorAtual = null;
let cartelasComprador = [];
let numerosSorteados = [];
let marcacoes = {};
let cartelasArmadas = new Set();
let cartelasBingo = new Set();
let alertasBingoMostrados = new Set();

// ===== INICIALIZAÇÃO =====
window.addEventListener('load', () => {
    console.log('📄 [CARTELAS] Página carregada, inicializando...');
    setTimeout(inicializarSistema, 500);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 [CARTELAS] DOM carregado, configurando backup...');
    setTimeout(() => {
        if (!window.sistemaInicializado) {
            console.log('🔄 [CARTELAS] Executando inicialização de backup...');
            inicializarSistema();
        }
    }, 1000);
});

async function inicializarSistema() {
    if (window.sistemaInicializado) {
        console.log('ℹ️ [CARTELAS] Já foi inicializado, pulando...');
        return;
    }
    
    console.log('🔄 [CARTELAS] Iniciando sistema de cartelas...');
    window.sistemaInicializado = true;
    
    try {
        // Verificar Firebase
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK não carregado');
        }
        
        // Inicializar Firebase se necessário
        if (!firebase.apps.length) {
            if (typeof firebaseConfig !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase inicializado');
            } else {
                throw new Error('Configuração Firebase não encontrada');
            }
        }
        
        // Configurar eventos
        configurarEventos();
        
        console.log('🎉 [CARTELAS] Sistema inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ [CARTELAS] Erro na inicialização:', error);
        mostrarAlerta('❌ Erro ao carregar sistema. Recarregue a página.', 'error');
    }
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function configurarEventos() {
    console.log('🔧 [CARTELAS] Configurando eventos...');
    
    // Formulário de consulta
    const formConsulta = document.getElementById('form-consulta');
    if (formConsulta) {
        formConsulta.onsubmit = (e) => {
            e.preventDefault();
            fazerLogin();
        };
    }
    
    // Botão de consulta
    const btnConsulta = document.getElementById('btn-consultar');
    if (btnConsulta) {
        btnConsulta.onclick = (e) => {
            e.preventDefault();
            fazerLogin();
        };
    }
    
    // Enter no campo telefone
    const telefoneInput = document.getElementById('consulta-telefone');
    if (telefoneInput) {
        telefoneInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                fazerLogin();
            }
        };
    }
    
    console.log('✅ [CARTELAS] Eventos configurados');
}

// ===== SISTEMA DE LOGIN/CONSULTA =====
async function fazerLogin() {
    console.log('🚀 [LOGIN] Iniciando consulta de cartelas...');
    
    const telefoneInput = document.getElementById('consulta-telefone');
    
    if (!telefoneInput) {
        console.error('❌ [LOGIN] Campo telefone não encontrado');
        mostrarAlerta('Erro: Campo de telefone não encontrado', 'error');
        return;
    }
    
    const telefone = telefoneInput.value.trim();
    
    if (!telefone) {
        mostrarAlerta('📱 Informe o telefone para consultar suas cartelas', 'warning');
        telefoneInput.focus();
        return;
    }
    
    try {
        mostrarAlerta('🔍 Buscando suas cartelas...', 'info');
        
        // Normalizar telefone
        const telefoneNormalizado = telefone.replace(/\D/g, '');
        console.log('📱 [LOGIN] Telefone original:', telefone);
        console.log('📱 [LOGIN] Telefone normalizado:', telefoneNormalizado);
        
        // Garantir que Firebase está inicializado
        if (!firebase.apps.length) {
            console.log('🔥 [LOGIN] Inicializando Firebase...');
            if (typeof firebaseConfig !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                console.log('✅ [LOGIN] Firebase inicializado');
            } else {
                throw new Error('Configuração Firebase não encontrada');
            }
        }
        
        // Buscar cartelas no Firebase
        const cartelas = await buscarCartelasComprador(telefoneNormalizado);
        
        console.log('📦 [LOGIN] Cartelas encontradas:', cartelas.length);
        
        if (cartelas.length === 0) {
            console.log('❌ [LOGIN] Nenhuma cartela encontrada');
            mostrarAlerta('❌ Nenhuma cartela encontrada com este telefone. Verifique se o número está correto.', 'error');
            return;
        }
        
        // Buscar números sorteados
        console.log('🎲 [LOGIN] Buscando números sorteados...');
        const numeros = await buscarNumerosSorteados();
        console.log('🎲 [LOGIN] Números sorteados encontrados:', numeros.length);
        
        // Configurar dados do comprador
        const primeiraCartela = cartelas[0];
        compradorAtual = {
            nome: primeiraCartela.nome || primeiraCartela.comprador || 'Comprador',
            telefone: telefoneNormalizado,
            email: primeiraCartela.email || ''
        };
        
        console.log('👤 [LOGIN] Comprador configurado:', compradorAtual);
        
        cartelasComprador = cartelas;
        numerosSorteados = numeros;
        
        // Fazer transição para área de cartelas
        console.log('🎨 [LOGIN] Fazendo transição para área de cartelas...');
        mostrarAreaCartelas();
        
        mostrarAlerta(`✅ ${cartelas.length} cartela(s) encontrada(s)!`, 'success');
        
    } catch (error) {
        console.error('❌ [LOGIN] Erro na consulta:', error);
        mostrarAlerta('❌ Erro ao buscar cartelas. Verifique sua conexão e tente novamente.', 'error');
    }
}

// ===== BUSCA DE DADOS NO FIREBASE =====
async function buscarCartelasComprador(telefone) {
    console.log('🔍 [FIREBASE] Buscando cartelas do comprador...');
    
    try {
        // Aguardar inicialização do Firebase se necessário
        if (typeof initializeFirebaseUnified === 'function') {
            await initializeFirebaseUnified();
        }
        
        const db = firebase.firestore();
        let cartelas = [];
        
        // Buscar por telefone exato
        console.log('🔍 [FIREBASE] Buscando por telefone:', telefone);
        const queryTelefone = await db.collection('cartelas').where('telefone', '==', telefone).get();
        queryTelefone.forEach(doc => {
            console.log('📦 [FIREBASE] Cartela encontrada:', doc.id, doc.data());
            cartelas.push({ id: doc.id, ...doc.data() });
        });
        
        // Se não encontrou, tentar formatos alternativos
        if (cartelas.length === 0) {
            console.log('🔍 [FIREBASE] Tentando formatos alternativos do telefone...');
            
            // Tentar com formatação (XX) XXXXX-XXXX
            if (telefone.length === 11) {
                const telefoneFormatado = `(${telefone.slice(0,2)}) ${telefone.slice(2,7)}-${telefone.slice(7)}`;
                console.log('🔍 [FIREBASE] Tentando formato:', telefoneFormatado);
                const queryFormatado = await db.collection('cartelas').where('telefone', '==', telefoneFormatado).get();
                queryFormatado.forEach(doc => {
                    console.log('📦 [FIREBASE] Cartela encontrada (formatado):', doc.id, doc.data());
                    cartelas.push({ id: doc.id, ...doc.data() });
                });
            }
            
            // Tentar buscar todos e filtrar manualmente (fallback)
            if (cartelas.length === 0) {
                console.log('🔍 [FIREBASE] Buscando todas as cartelas para filtro manual...');
                const todasCartelas = await db.collection('cartelas').get();
                todasCartelas.forEach(doc => {
                    const data = doc.data();
                    const telefoneDoc = data.telefone ? data.telefone.replace(/\D/g, '') : '';
                    if (telefoneDoc === telefone) {
                        console.log('📦 [FIREBASE] Cartela encontrada (filtro manual):', doc.id, data);
                        cartelas.push({ id: doc.id, ...data });
                    }
                });
            }
        }
        
        console.log('📦 [FIREBASE] Total de cartelas encontradas:', cartelas.length);
        return cartelas;
        
    } catch (error) {
        console.error('❌ [FIREBASE] Erro ao buscar cartelas:', error);
        throw error;
    }
}

async function buscarNumerosSorteados() {
    console.log('🎲 [FIREBASE] Buscando números sorteados...');
    
    try {
        const db = firebase.firestore();
        
        // Método 1: Tentar coleção numeros-sorteados
        try {
            const snapshot = await db.collection('numeros-sorteados').get();
            if (!snapshot.empty) {
                const numeros = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const numero = data.numero || data.value || parseInt(doc.id);
                    if (numero && !isNaN(numero)) {
                        numeros.push(numero);
                    }
                });
                
                if (numeros.length > 0) {
                    console.log('✅ [FIREBASE] Números encontrados na coleção numeros-sorteados:', numeros.length);
                    return numeros.sort((a, b) => a - b);
                }
            }
        } catch (error) {
            console.log('⚠️ [FIREBASE] Coleção numeros-sorteados não acessível');
        }
        
        // Método 2: Tentar coleção numerosSorteados
        try {
            const snapshot = await db.collection('numerosSorteados').get();
            if (!snapshot.empty) {
                const numeros = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const numero = data.numero || data.value || parseInt(doc.id);
                    if (numero && !isNaN(numero)) {
                        numeros.push(numero);
                    }
                });
                
                if (numeros.length > 0) {
                    console.log('✅ [FIREBASE] Números encontrados na coleção numerosSorteados:', numeros.length);
                    return numeros.sort((a, b) => a - b);
                }
            }
        } catch (error) {
            console.log('⚠️ [FIREBASE] Coleção numerosSorteados não acessível');
        }
        
        console.log('ℹ️ [FIREBASE] Nenhum número sorteado encontrado');
        return [];
        
    } catch (error) {
        console.error('❌ [FIREBASE] Erro ao buscar números sorteados:', error);
        return [];
    }
}

// ===== INTERFACE DO USUÁRIO - DADOS DO COMPRADOR =====
function mostrarAreaCartelas() {
    console.log('🎨 [UI] Mostrando área de cartelas...');
    
    const loginSection = document.getElementById('login-comprador');
    const cartelasSection = document.getElementById('area-cartelas');
    
    if (loginSection) loginSection.style.display = 'none';
    if (cartelasSection) {
        cartelasSection.style.display = 'block';
        
        // Preencher dados do comprador
        preencherDadosComprador();
        
        // Exibir cartelas
        exibirCartelas();
        
        // Atualizar status do sorteio
        atualizarStatusSorteio();
        
        // Configurar botões (HTML)
        configurarBotoesHTML();
    }
}

function preencherDadosComprador() {
    if (!compradorAtual) return;
    
    // Elementos específicos do HTML
    const nomeSpan = document.getElementById('nome-comprador-logado');
    const telefoneSpan = document.getElementById('telefone-comprador-logado');
    const emailSpan = document.getElementById('email-comprador-logado');
    const totalSpan = document.getElementById('total-cartelas-comprador');
    
    if (nomeSpan) nomeSpan.textContent = `👤 ${compradorAtual.nome}`;
    if (telefoneSpan) telefoneSpan.textContent = `📱 ${compradorAtual.telefone}`;
    if (emailSpan) emailSpan.textContent = `📧 ${compradorAtual.email || 'Não informado'}`;
    if (totalSpan) totalSpan.textContent = `🎫 ${cartelasComprador.length} cartela(s)`;
}

function atualizarStatusSorteio() {
    const ultimoNumero = document.getElementById('ultimo-numero');
    const totalSorteados = document.getElementById('total-sorteados');
    const listaSorteados = document.getElementById('numeros-sorteados-lista');
    
    if (ultimoNumero) {
        if (numerosSorteados.length > 0) {
            ultimoNumero.textContent = numerosSorteados[numerosSorteados.length - 1];
        } else {
            ultimoNumero.textContent = '-';
        }
    }
    
    if (totalSorteados) {
        totalSorteados.textContent = numerosSorteados.length;
    }
    
    if (listaSorteados) {
        if (numerosSorteados.length > 0) {
            listaSorteados.innerHTML = numerosSorteados.map(num => 
                `<span class="numero-sorteado">${num}</span>`
            ).join(' ');
        } else {
            listaSorteados.textContent = 'Nenhum número sorteado ainda';
        }
    }
}

// ===== INTERFACE DO USUÁRIO - CARTELAS =====
function exibirCartelas() {
    console.log('🎫 [UI] Exibindo cartelas...');
    
    const container = document.getElementById('lista-cartelas-comprador');
    if (!container) {
        console.error('❌ [UI] Container de cartelas não encontrado');
        return;
    }
    
    container.innerHTML = '';
    
    if (!cartelasComprador || cartelasComprador.length === 0) {
        container.innerHTML = '<p class="sem-cartelas">Nenhuma cartela encontrada</p>';
        return;
    }
    
    cartelasComprador.forEach(cartela => {
        const cartelaElement = criarElementoCartela(cartela);
        container.appendChild(cartelaElement);
    });
}

function criarElementoCartela(cartela) {
    const div = document.createElement('div');
    div.className = 'cartela-item';
    div.id = `cartela-${cartela.id}`;
    
    // Processar números da cartela
    let numerosCartela = [];
    if (Array.isArray(cartela.numeros)) {
        numerosCartela = cartela.numeros;
    } else if (typeof cartela.numeros === 'string') {
        try {
            numerosCartela = JSON.parse(cartela.numeros);
        } catch (e) {
            console.warn('Erro ao fazer parse dos números da cartela:', e);
            numerosCartela = [];
        }
    }
    
    if (!Array.isArray(numerosCartela)) {
        numerosCartela = [];
    }
    
    // Criar cabeçalho BINGO
    const bingoHeader = `
        <div class="bingo-header">
            <div class="bingo-letter b">B</div>
            <div class="bingo-letter i">I</div>
            <div class="bingo-letter n">N</div>
            <div class="bingo-letter g">G</div>
            <div class="bingo-letter o">O</div>
        </div>
    `;
    
    // Criar grid de números
    let numerosHtml = '';
    if (numerosCartela.length > 0) {
        numerosHtml = numerosCartela.map(numero => {
            const marcado = marcacoes[cartela.id] && marcacoes[cartela.id].includes(numero);
            const sorteado = numerosSorteados.includes(numero);
            
            let classe = 'numero-cartela';
            if (marcado) classe += ' marcado';
            if (sorteado && !marcado) classe += ' sorteado-pendente';
            
            return `<div class="${classe}" onclick="alternarMarcacao('${cartela.id}', ${numero})">${numero}</div>`;
        }).join('');
    } else {
        numerosHtml = '<p class="erro-cartela">⚠️ Cartela sem números válidos</p>';
    }
    
    // Status da cartela
    const vendida = cartela.vendida || cartela.status === 'vendida';
    const statusClass = vendida ? 'vendida' : 'pendente';
    const statusText = vendida ? '✅ Paga' : '⏳ Pendente';
    
    // Calcular marcados
    const totalMarcados = marcacoes[cartela.id] ? marcacoes[cartela.id].length : 0;
    const totalNumeros = numerosCartela.length;
    
    div.innerHTML = `
        <div class="cartela-header">
            <h3>🎫 Cartela ${cartela.id}</h3>
            <span class="status-cartela ${statusClass}">${statusText}</span>
        </div>
        ${bingoHeader}
        <div class="cartela-grid">
            ${numerosHtml}
        </div>
        <div class="cartela-info">
            <span class="info-item">🎯 ${totalNumeros} números</span>
            <span class="info-item" id="marcados-${cartela.id}">✅ ${totalMarcados} marcados</span>
            ${cartelasBingo.has(cartela.id) ? '<span class="info-item bingo">🎉 BINGO!</span>' : ''}
        </div>
    `;
    
    return div;
}

// ===== SISTEMA DE MARCAÇÃO =====
function alternarMarcacao(cartelaId, numero) {
    console.log(`🎯 [MARCACAO] Alternando marcação: cartela ${cartelaId}, número ${numero}`);
    
    if (!marcacoes[cartelaId]) {
        marcacoes[cartelaId] = [];
    }
    
    const index = marcacoes[cartelaId].indexOf(numero);
    if (index > -1) {
        // Desmarcar
        marcacoes[cartelaId].splice(index, 1);
    } else {
        // Marcar
        marcacoes[cartelaId].push(numero);
    }
    
    // Atualizar interface
    atualizarVisualizacaoCartela(cartelaId);
    
    // Verificar BINGO
    verificarBingo(cartelaId);
}

function atualizarVisualizacaoCartela(cartelaId) {
    const cartela = cartelasComprador.find(c => c.id === cartelaId);
    if (!cartela) return;
    
    const container = document.getElementById(`cartela-${cartelaId}`);
    if (!container) return;
    
    // Atualizar números
    const numerosElements = container.querySelectorAll('.numero-cartela');
    numerosElements.forEach(element => {
        const numero = parseInt(element.textContent);
        const marcado = marcacoes[cartelaId] && marcacoes[cartelaId].includes(numero);
        const sorteado = numerosSorteados.includes(numero);
        
        element.className = 'numero-cartela';
        if (marcado) element.classList.add('marcado');
        if (sorteado && !marcado) element.classList.add('sorteado-pendente');
    });
    
    // Atualizar contador
    const contadorElement = document.getElementById(`marcados-${cartelaId}`);
    if (contadorElement) {
        const totalMarcados = marcacoes[cartelaId] ? marcacoes[cartelaId].length : 0;
        contadorElement.textContent = `✅ ${totalMarcados} marcados`;
    }
}

// ===== VERIFICAÇÃO DE BINGO =====
function verificarBingo(cartelaId) {
    const cartela = cartelasComprador.find(c => c.id === cartelaId);
    if (!cartela) return;
    
    let numerosCartela = [];
    if (Array.isArray(cartela.numeros)) {
        numerosCartela = cartela.numeros;
    } else if (typeof cartela.numeros === 'string') {
        try {
            numerosCartela = JSON.parse(cartela.numeros);
        } catch (e) {
            return;
        }
    }
    
    const numerosMarcados = marcacoes[cartelaId] || [];
    const todosMarcados = numerosCartela.every(numero => numerosMarcados.includes(numero));
    
    if (todosMarcados && numerosCartela.length > 0) {
        if (!cartelasBingo.has(cartelaId)) {
            cartelasBingo.add(cartelaId);
            mostrarModalBingo(cartelaId);
        }
    } else {
        cartelasBingo.delete(cartelaId);
    }
}

function mostrarModalBingo(cartelaId) {
    if (alertasBingoMostrados.has(cartelaId)) return;
    
    alertasBingoMostrados.add(cartelaId);
    
    console.log('🎉 [BINGO] BINGO na cartela:', cartelaId);
    
    const modal = document.getElementById('modal-bingo');
    const infoDiv = document.getElementById('cartela-bingo-info');
    
    if (modal && infoDiv) {
        infoDiv.innerHTML = `
            <div class="cartela-bingo">
                <strong>🎫 Cartela ${cartelaId}</strong>
                <p>🏆 Procure a organização para retirar seu prêmio!</p>
            </div>
        `;
        modal.style.display = 'flex';
    }
    
    // Atualizar visualização da cartela
    atualizarVisualizacaoCartela(cartelaId);
}

function fecharModalBingo() {
    const modal = document.getElementById('modal-bingo');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== FUNÇÕES DOS BOTÕES DE AÇÃO (HTML) =====
function marcarTodosNumeros() {
    console.log('✅ [ACAO] Marcando todos os números sorteados...');
    
    if (!cartelasComprador || cartelasComprador.length === 0) {
        mostrarAlerta('❌ Nenhuma cartela encontrada para marcar.', 'error');
        return;
    }
    
    if (!numerosSorteados || numerosSorteados.length === 0) {
        mostrarAlerta('⚠️ Nenhum número foi sorteado ainda.', 'warning');
        return;
    }
    
    let totalMarcados = 0;
    
    cartelasComprador.forEach(cartela => {
        if (!marcacoes[cartela.id]) {
            marcacoes[cartela.id] = [];
        }
        
        let numerosCartela = [];
        if (Array.isArray(cartela.numeros)) {
            numerosCartela = cartela.numeros;
        } else if (typeof cartela.numeros === 'string') {
            try {
                numerosCartela = JSON.parse(cartela.numeros);
            } catch (e) {
                return;
            }
        }
        
        numerosCartela.forEach(numero => {
            if (numerosSorteados.includes(numero) && !marcacoes[cartela.id].includes(numero)) {
                marcacoes[cartela.id].push(numero);
                totalMarcados++;
            }
        });
        
        atualizarVisualizacaoCartela(cartela.id);
        verificarBingo(cartela.id);
    });
    
    mostrarAlerta(`✅ ${totalMarcados} números marcados automaticamente!`, 'success');
}

function limparMarcacoes() {
    console.log('🔄 [ACAO] Limpando todas as marcações...');
    
    marcacoes = {};
    cartelasBingo.clear();
    alertasBingoMostrados.clear();
    
    cartelasComprador.forEach(cartela => {
        atualizarVisualizacaoCartela(cartela.id);
    });
    
    mostrarAlerta('🔄 Todas as marcações foram removidas.', 'info');
}

function verificarBingo() {
    console.log('🎉 [ACAO] Verificando BINGO em todas as cartelas...');
    
    let totalBingo = 0;
    
    cartelasComprador.forEach(cartela => {
        const tinha = cartelasBingo.has(cartela.id);
        verificarBingo(cartela.id);
        if (!tinha && cartelasBingo.has(cartela.id)) {
            totalBingo++;
        }
    });
    
    if (totalBingo > 0) {
        mostrarAlerta(`🎉 ${totalBingo} BINGO(s) encontrado(s)!`, 'success');
    } else if (cartelasBingo.size > 0) {
        mostrarAlerta(`🎉 Você já tem ${cartelasBingo.size} BINGO(s)!`, 'info');
    } else {
        mostrarAlerta('⚠️ Nenhum BINGO encontrado ainda.', 'warning');
    }
}

// ===== FUNÇÕES DOS BOTÕES DE TESTE (HTML) =====
function forcarAtualizacaoNumeros() {
    console.log('🔄 [TESTE] Forçando atualização dos números...');
    
    mostrarAlerta('🔄 Atualizando números...', 'info');
    
    buscarNumerosSorteados().then(numeros => {
        numerosSorteados = numeros;
        
        // Atualizar status do sorteio
        atualizarStatusSorteio();
        
        // Atualizar visualização das cartelas
        cartelasComprador.forEach(cartela => {
            atualizarVisualizacaoCartela(cartela.id);
        });
        
        mostrarAlerta(`✅ ${numeros.length} números sorteados carregados!`, 'success');
        
    }).catch(error => {
        console.error('❌ [TESTE] Erro ao atualizar:', error);
        mostrarAlerta('❌ Erro ao atualizar números.', 'error');
    });
}

function testarBuscaNumeros() {
    console.log('🧪 [TESTE] Testando busca de números...');
    
    buscarNumerosSorteados().then(numeros => {
        console.log('🧪 [TESTE] Números encontrados:', numeros);
        mostrarAlerta(`🧪 Teste: ${numeros.length} números encontrados. Veja o console.`, 'info');
    }).catch(error => {
        console.error('🧪 [TESTE] Erro no teste:', error);
        mostrarAlerta('🧪 Erro no teste. Veja o console.', 'error');
    });
}

function forcarDadosSimulados() {
    console.log('🎮 [TESTE] Forçando dados simulados...');
    
    // Números simulados para teste
    numerosSorteados = [1, 5, 12, 23, 34, 45, 56, 67, 78, 89];
    
    // Atualizar interface
    atualizarStatusSorteio();
    
    cartelasComprador.forEach(cartela => {
        atualizarVisualizacaoCartela(cartela.id);
    });
    
    mostrarAlerta('🎮 Dados simulados carregados para teste!', 'success');
}

// ===== FUNÇÕES DE LOGOUT =====
function fazerLogout() {
    console.log('🚪 [LOGOUT] Fazendo logout...');
    
    // Limpar dados
    compradorAtual = null;
    cartelasComprador = [];
    numerosSorteados = [];
    marcacoes = {};
    cartelasArmadas.clear();
    cartelasBingo.clear();
    alertasBingoMostrados.clear();
    
    // Mostrar tela de login
    const loginSection = document.getElementById('login-comprador');
    const cartelasSection = document.getElementById('area-cartelas');
    
    if (loginSection) loginSection.style.display = 'block';
    if (cartelasSection) cartelasSection.style.display = 'none';
    
    // Limpar campo telefone
    const telefoneInput = document.getElementById('consulta-telefone');
    if (telefoneInput) telefoneInput.value = '';
    
    mostrarAlerta('🚪 Logout realizado com sucesso!', 'info');
}

// ===== CONFIGURAÇÃO DE BOTÕES HTML =====
function configurarBotoesHTML() {
    console.log('🔧 [UI] Botões HTML já configurados via onclick no HTML');
}

// ===== FUNÇÕES GLOBAIS DE NAVEGAÇÃO =====
function verificarAcessoAdmin() {
    console.log('🔐 [NAV] Redirecionando para área administrativa...');
    window.location.href = 'admin.html';
}

// ===== SISTEMA DE ALERTAS =====
function mostrarAlerta(mensagem, tipo = 'info') {
    console.log(`🔔 [ALERTA] ${tipo.toUpperCase()}: ${mensagem}`);
    
    const alertContainer = document.getElementById('alert-msg');
    if (alertContainer) {
        const alertMessage = alertContainer.querySelector('.alert-message');
        if (alertMessage) {
            alertMessage.textContent = mensagem;
        }
        alertContainer.className = `alert alert-${tipo}`;
        alertContainer.style.display = 'block';
        
        setTimeout(() => {
            if (alertContainer) {
                alertContainer.style.display = 'none';
            }
        }, 4000);
    } else {
        // Fallback para alert nativo
        alert(mensagem);
    }
}

function fecharAlert() {
    const alertContainer = document.getElementById('alert-msg');
    if (alertContainer) {
        alertContainer.style.display = 'none';
    }
}

console.log('✅ [CARTELAS] Sistema de cartelas consolidado carregado!');