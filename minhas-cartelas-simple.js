// VERSÃO SIMPLIFICADA DO MINHAS-CARTELAS.JS PARA TESTE

console.log('🚀 [SIMPLE] Script minhas-cartelas-simple.js carregado');

// Função de alerta simples
function mostrarAlerta(mensagem, tipo = 'info') {
    console.log(`🔔 [${tipo.toUpperCase()}] ${mensagem}`);
    
    const alertMsg = document.getElementById('alert-msg');
    if (alertMsg) {
        const alertMessage = alertMsg.querySelector('.alert-message');
        if (alertMessage) {
            alertMessage.textContent = mensagem;
        }
        alertMsg.className = `alert alert-${tipo}`;
        alertMsg.style.display = 'block';
        
        setTimeout(() => {
            if (alertMsg) {
                alertMsg.style.display = 'none';
            }
        }, 3000);
    } else {
        alert(mensagem);
    }
}

// Função de login com busca real no Firebase
async function fazerLogin() {
    console.log('🚀 [REAL] fazerLogin() chamada!');
    
    const telefoneInput = document.getElementById('consulta-telefone');
    
    if (!telefoneInput) {
        console.error('❌ [REAL] Input de telefone não encontrado');
        mostrarAlerta('Erro: Campo de telefone não encontrado', 'error');
        return;
    }
    
    const telefone = telefoneInput.value.trim();
    
    console.log('📝 [REAL] Dados:', { telefone });
    
    if (!telefone) {
        mostrarAlerta('Informe o telefone para consultar', 'warning');
        return;
    }
    
    try {
        mostrarAlerta('🔍 Buscando suas cartelas...', 'info');
        
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não está disponível');
        }
        
        console.log('🔥 [REAL] Firebase disponível, buscando cartelas...');
        
        // Normalizar telefone (remover formatação)
        const telefoneNormalizado = telefone ? telefone.replace(/\D/g, '') : '';
        console.log('📱 [REAL] Telefone normalizado:', telefoneNormalizado);
        
        // Buscar cartelas no Firestore
        const db = firebase.firestore();
        let cartelas = [];
        
        // Buscar por telefone
        console.log('🔍 [REAL] Buscando por telefone:', telefoneNormalizado);
        const queryTelefone = await db.collection('cartelas').where('telefone', '==', telefoneNormalizado).get();
        queryTelefone.forEach(doc => {
            cartelas.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('📦 [REAL] Cartelas encontradas:', cartelas.length);
        
        if (cartelas.length === 0) {
            mostrarAlerta('❌ Nenhuma cartela encontrada com este telefone.', 'error');
            return;
        }
        
        // Configurar dados do comprador
        const primeiraCartela = cartelas[0];
        const compradorInfo = {
            nome: primeiraCartela.nome || primeiraCartela.comprador || 'Nome não informado',
            telefone: primeiraCartela.telefone || telefoneNormalizado || 'Telefone não informado',
            email: primeiraCartela.email || 'Email não informado'
        };
        
        console.log('👤 [REAL] Dados do comprador:', compradorInfo);
        
        // Buscar números sorteados - USANDO FUNÇÃO COM FALLBACK
        const numerosSorteados = await buscarNumerosSorteadosComFallback();
        console.log('🎲 [REAL] Números sorteados (com fallback):', numerosSorteados.length, numerosSorteados);
        
        // Fazer transição para área de cartelas
        const loginComprador = document.getElementById('login-comprador');
        const areaCartelas = document.getElementById('area-cartelas');
        
        if (loginComprador && areaCartelas) {
            // Preencher dados do comprador
            preencherDadosComprador(compradorInfo, cartelas.length);
            
            // Exibir cartelas
            exibirCartelas(cartelas, numerosSorteados);
            
            // Atualizar status do sorteio
            atualizarStatusSorteio(numerosSorteados);
            
            // Fazer transição
            loginComprador.style.display = 'none';
            areaCartelas.style.display = 'block';
            
            mostrarAlerta('✅ Login realizado com sucesso!', 'success');
            console.log('✅ [REAL] Login e transição concluídos');
        } else {
            console.error('❌ [REAL] Elementos de transição não encontrados');
            mostrarAlerta('❌ Erro na transição', 'error');
        }
        
    } catch (error) {
        console.error('❌ [REAL] Erro ao buscar cartelas:', error);
        mostrarAlerta('❌ Erro ao buscar cartelas. Tente novamente.', 'error');
    }
}

// Função para forçar transição (botão de emergência)
// Função de logout
function fazerLogout() {
    console.log('🚪 [SIMPLE] Fazendo logout...');
    const loginComprador = document.getElementById('login-comprador');
    const areaCartelas = document.getElementById('area-cartelas');
    
    if (loginComprador && areaCartelas) {
        loginComprador.style.display = 'block';
        areaCartelas.style.display = 'none';
        
        // Limpar campos
        const telefoneInput = document.getElementById('consulta-telefone');
        if (telefoneInput) telefoneInput.value = '';
        
        mostrarAlerta('Logout realizado', 'info');
    }
}

// Função para verificar acesso admin
function verificarAcessoAdmin() {
    console.log('🔐 Redirecionando para área administrativa...');
    window.location.href = 'admin.html';
}

// Função para fechar alert
function fecharAlert() {
    const alertMsg = document.getElementById('alert-msg');
    if (alertMsg) {
        alertMsg.style.display = 'none';
    }
}

// Função para buscar números sorteados do Firebase - VERSÃO DIAGNÓSTICA
async function buscarNumerosSorteados() {
    try {
        console.log('🔍 [FIREBASE] === INICIANDO BUSCA DE NÚMEROS SORTEADOS ===');
        
        if (typeof firebase === 'undefined') {
            console.error('❌ [FIREBASE] Firebase não está disponível');
            return [];
        }
        
        const db = firebase.firestore();
        console.log('🔥 [FIREBASE] Firestore conectado');
        
        // Método 1: Buscar todos os documentos primeiro para diagnóstico
        console.log('🔍 [FIREBASE] Método 1: Listando todas as coleções...');
        
        try {
            const allCollections = await db.listCollections();
            console.log('📂 [FIREBASE] Coleções disponíveis:', allCollections.map(col => col.id));
        } catch (err) {
            console.log('⚠️ [FIREBASE] Não foi possível listar coleções (normal em alguns ambientes)');
        }
        
        // Método 2: Tentar diferentes nomes de coleção
        const possiveisColecoes = [
            'numeros-sorteados',
            'numerosSorteados', 
            'numeros_sorteados',
            'sorteio',
            'bingo-sorteio',
            'sorteados'
        ];
        
        for (const nomeColecao of possiveisColecoes) {
            console.log(`� [FIREBASE] Tentando coleção: "${nomeColecao}"`);
            
            try {
                const snapshot = await db.collection(nomeColecao).limit(5).get();
                console.log(`📊 [FIREBASE] Coleção "${nomeColecao}": ${snapshot.size} documentos encontrados`);
                
                if (snapshot.size > 0) {
                    console.log(`✅ [FIREBASE] Coleção "${nomeColecao}" tem dados! Analisando...`);
                    
                    const documentos = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        console.log(`📄 [FIREBASE] Documento ${doc.id}:`, data);
                        documentos.push({ id: doc.id, ...data });
                    });
                    
                    // Se encontrou documentos, buscar todos
                    if (documentos.length > 0) {
                        console.log(`🎯 [FIREBASE] Usando coleção "${nomeColecao}" - buscando todos os dados...`);
                        
                        const snapshotCompleto = await db.collection(nomeColecao).get();
                        const numerosEncontrados = [];
                        const todosDocumentos = [];
                        
                        snapshotCompleto.forEach(doc => {
                            const data = doc.data();
                            todosDocumentos.push({ id: doc.id, ...data });
                            
                            // Tentar diferentes campos para o número
                            const camposNumero = ['numero', 'number', 'value', 'num', 'sorteado'];
                            let numeroEncontrado = null;
                            
                            for (const campo of camposNumero) {
                                if (data[campo] !== undefined && data[campo] !== null) {
                                    numeroEncontrado = data[campo];
                                    break;
                                }
                            }
                            
                            if (numeroEncontrado !== null) {
                                numerosEncontrados.push({
                                    numero: numeroEncontrado,
                                    timestamp: data.timestamp || data.createdAt || data.date || new Date(),
                                    documento: data
                                });
                            }
                        });
                        
                        console.log(`📊 [FIREBASE] Total de documentos: ${todosDocumentos.length}`);
                        console.log(`🎯 [FIREBASE] Números válidos encontrados: ${numerosEncontrados.length}`);
                        console.log(`📄 [FIREBASE] Primeiros documentos:`, todosDocumentos.slice(0, 3));
                        
                        if (numerosEncontrados.length > 0) {
                            // Ordenar por timestamp
                            numerosEncontrados.sort((a, b) => {
                                const timeA = a.timestamp?.seconds || a.timestamp?.getTime?.() / 1000 || 0;
                                const timeB = b.timestamp?.seconds || b.timestamp?.getTime?.() / 1000 || 0;
                                return timeA - timeB;
                            });
                            
                            const numeros = numerosEncontrados.map(item => item.numero);
                            console.log(`✅ [FIREBASE] Números ordenados:`, numeros);
                            return numeros;
                        }
                    }
                }
            } catch (colError) {
                console.log(`⚠️ [FIREBASE] Erro ao acessar coleção "${nomeColecao}":`, colError.message);
            }
        }
        
        // Método 3: Tentar busca na raiz do documento
        console.log('🔍 [FIREBASE] Método 3: Verificando documento raiz...');
        try {
            const docRaiz = await db.doc('bingo/sorteio').get();
            if (docRaiz.exists) {
                const data = docRaiz.data();
                console.log('📄 [FIREBASE] Documento raiz encontrado:', data);
                
                if (data.numerosSorteados && Array.isArray(data.numerosSorteados)) {
                    console.log('✅ [FIREBASE] Números encontrados no documento raiz:', data.numerosSorteados);
                    return data.numerosSorteados;
                }
            }
        } catch (docError) {
            console.log('⚠️ [FIREBASE] Documento raiz não encontrado');
        }
        
        console.log('❌ [FIREBASE] Nenhum número sorteado encontrado em nenhuma estrutura');
        return [];
        
    } catch (error) {
        console.error('❌ [FIREBASE] Erro geral na busca:', error);
        return [];
    }
}

// NOVA FUNÇÃO SIMPLIFICADA PARA BUSCAR NÚMEROS SORTEADOS
async function buscarNumerosSorteadosSimples() {
    try {
        console.log('🎯 [SIMPLE] === BUSCA SIMPLIFICADA DE NÚMEROS SORTEADOS ===');
        
        if (typeof firebase === 'undefined') {
            console.error('❌ [SIMPLE] Firebase não disponível');
            return [];
        }
        
        const db = firebase.firestore();
        console.log('🔥 [SIMPLE] Firestore conectado');
        
        // MÉTODO 1: Exatamente como no firebase-service.js
        try {
            console.log('🎯 [SIMPLE] Usando método do firebase-service.js...');
            const snapshot = await db.collection('numeros-sorteados').orderBy('dataSorteio', 'asc').get();
            console.log(`📊 [SIMPLE] Encontrados ${snapshot.size} documentos na coleção 'numeros-sorteados'`);
            
            const numeros = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`📄 [SIMPLE] Doc ${doc.id}:`, data);
                if (data.numero !== undefined && data.numero !== null) {
                    numeros.push(data.numero);
                }
            });
            
            console.log(`✅ [SIMPLE] Resultado: ${numeros.length} números encontrados:`, numeros);
            return numeros;
            
        } catch (error) {
            console.error('❌ [SIMPLE] Erro na busca:', error);
            
            // FALLBACK: Tentar sem orderBy
            try {
                console.log('🔄 [SIMPLE] Tentando fallback sem orderBy...');
                const snapshot = await db.collection('numeros-sorteados').get();
                console.log(`📊 [SIMPLE] Fallback: ${snapshot.size} documentos encontrados`);
                
                const numeros = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    console.log(`📄 [SIMPLE] Fallback Doc ${doc.id}:`, data);
                    if (data.numero !== undefined && data.numero !== null) {
                        numeros.push(data.numero);
                    }
                });
                
                console.log(`✅ [SIMPLE] Fallback resultado: ${numeros.length} números:`, numeros);
                return numeros;
                
            } catch (fallbackError) {
                console.error('❌ [SIMPLE] Fallback também falhou:', fallbackError);
                return [];
            }
        }
        
    } catch (generalError) {
        console.error('❌ [SIMPLE] Erro geral:', generalError);
        return [];
    }
}

// Função para preencher dados do comprador na interface
function preencherDadosComprador(compradorInfo, totalCartelas) {
    console.log('👤 [REAL] Preenchendo dados do comprador...');
    
    const nomeEl = document.getElementById('nome-comprador-logado');
    const telefoneEl = document.getElementById('telefone-comprador-logado');
    const emailEl = document.getElementById('email-comprador-logado');
    const totalEl = document.getElementById('total-cartelas-comprador');
    
    if (nomeEl) nomeEl.textContent = compradorInfo.nome;
    if (telefoneEl) telefoneEl.textContent = `📱 ${compradorInfo.telefone}`;
    if (emailEl) emailEl.textContent = `📧 ${compradorInfo.email}`;
    if (totalEl) totalEl.textContent = `🎫 ${totalCartelas} cartela(s)`;
    
    console.log('✅ [REAL] Dados do comprador preenchidos');
}

// Função para atualizar status do sorteio
function atualizarStatusSorteio(numerosSorteados) {
    console.log('🎲 [REAL] Atualizando status do sorteio...');
    console.log('🎲 [REAL] Números recebidos:', numerosSorteados);
    
    const ultimoNumeroEl = document.getElementById('ultimo-numero');
    const totalSorteadosEl = document.getElementById('total-sorteados');
    const numerosListaEl = document.getElementById('numeros-sorteados-lista');
    
    if (numerosSorteados.length > 0) {
        const ultimoNumero = numerosSorteados[numerosSorteados.length - 1];
        
        console.log('🎯 [REAL] Último número:', ultimoNumero);
        console.log('🎯 [REAL] Total:', numerosSorteados.length);
        
        if (ultimoNumeroEl) {
            ultimoNumeroEl.textContent = ultimoNumero;
            ultimoNumeroEl.style.background = 'linear-gradient(135deg, #ff6b35, #f7931e)';
            ultimoNumeroEl.style.color = 'white';
            ultimoNumeroEl.style.padding = '5px 10px';
            ultimoNumeroEl.style.borderRadius = '50%';
            ultimoNumeroEl.style.fontWeight = 'bold';
            ultimoNumeroEl.style.fontSize = '1.2em';
        }
        
        if (totalSorteadosEl) {
            totalSorteadosEl.textContent = numerosSorteados.length;
            totalSorteadosEl.style.fontWeight = 'bold';
            totalSorteadosEl.style.color = '#28a745';
        }
        
        if (numerosListaEl) {
            // Criar lista visual dos números sorteados
            numerosListaEl.innerHTML = numerosSorteados.map(num => 
                `<span class="numero-sorteado" style="
                    display: inline-block;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 3px 8px;
                    margin: 2px;
                    border-radius: 50%;
                    font-weight: bold;
                    font-size: 0.9em;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    animation: pulse-numero 0.5s ease-out;
                ">${num}</span>`
            ).join('');
            
            // Scroll para o final da lista
            numerosListaEl.scrollLeft = numerosListaEl.scrollWidth;
        }
    } else {
        console.log('⚠️ [REAL] Nenhum número sorteado ainda');
        
        if (ultimoNumeroEl) {
            ultimoNumeroEl.textContent = '-';
            ultimoNumeroEl.style.background = '#6c757d';
            ultimoNumeroEl.style.color = 'white';
            ultimoNumeroEl.style.padding = '5px 10px';
            ultimoNumeroEl.style.borderRadius = '50%';
        }
        if (totalSorteadosEl) totalSorteadosEl.textContent = '0';
        if (numerosListaEl) {
            numerosListaEl.innerHTML = '<em style="color: #6c757d;">Nenhum número sorteado ainda</em>';
        }
    }
    
    console.log('✅ [REAL] Status do sorteio atualizado');
}

// Função para exibir cartelas do comprador
function exibirCartelas(cartelas, numerosSorteados) {
    console.log('🎫 [REAL] Exibindo cartelas do comprador...');
    console.log('🎫 [REAL] Cartelas:', cartelas.length);
    console.log('🎫 [REAL] Números sorteados:', numerosSorteados.length);
    
    const listaCartelasEl = document.getElementById('lista-cartelas-comprador');
    if (!listaCartelasEl) {
        console.error('❌ [REAL] Container de cartelas não encontrado');
        return;
    }
    
    listaCartelasEl.innerHTML = '';
    
    cartelas.forEach((cartela, index) => {
        const cartelaDiv = document.createElement('div');
        cartelaDiv.className = 'cartela-comprador';
        cartelaDiv.id = `cartela-${cartela.id}`;
        
        // Verificar se cartela tem números válidos
        if (!cartela.numeros || !Array.isArray(cartela.numeros)) {
            console.warn('⚠️ [REAL] Cartela sem números válidos:', cartela.id);
            cartelaDiv.innerHTML = `
                <div class="cartela-header">
                    <h3>🎫 Cartela #${index + 1}</h3>
                    <span class="cartela-id">ID: ${cartela.id}</span>
                </div>
                <div class="cartela-erro">
                    ❌ Cartela com dados inválidos
                </div>
            `;
            listaCartelasEl.appendChild(cartelaDiv);
            return;
        }
        
        console.log(`🎫 [REAL] Processando cartela ${index + 1}:`, cartela.numeros);
        
        // Criar grid BINGO com formatação correta
        const headerHtml = `
            <div class="bingo-header" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin-bottom: 5px;">
                <div class="bingo-letra" style="background: #dc3545; color: white; text-align: center; font-weight: bold; padding: 8px; border-radius: 4px;">B</div>
                <div class="bingo-letra" style="background: #dc3545; color: white; text-align: center; font-weight: bold; padding: 8px; border-radius: 4px;">I</div>
                <div class="bingo-letra" style="background: #dc3545; color: white; text-align: center; font-weight: bold; padding: 8px; border-radius: 4px;">N</div>
                <div class="bingo-letra" style="background: #dc3545; color: white; text-align: center; font-weight: bold; padding: 8px; border-radius: 4px;">G</div>
                <div class="bingo-letra" style="background: #dc3545; color: white; text-align: center; font-weight: bold; padding: 8px; border-radius: 4px;">O</div>
            </div>
        `;
        
        // Criar grid de números (formato BINGO 5x5)
        let gridHtml = '<div class="bingo-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin: 10px 0;">';
        
        // Assumindo que temos 24 números + 1 espaço livre
        // Ordem: primeiras 12, então LIVRE, depois últimas 12
        for (let i = 0; i < 25; i++) {
            if (i === 12) {
                // Espaço livre no centro
                gridHtml += `<div class="numero-cell livre" style="
                    background: linear-gradient(135deg, #ffc107, #ffca28);
                    color: white;
                    text-align: center;
                    font-weight: bold;
                    padding: 10px 5px;
                    border-radius: 6px;
                    min-height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2em;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">⭐</div>`;
            } else {
                const numeroIndex = i < 12 ? i : i - 1;
                const numero = cartela.numeros[numeroIndex];
                
                if (numero !== undefined) {
                    const marcado = numerosSorteados.includes(numero);
                    const baseStyle = `
                        background: ${marcado ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #f8f9fa, #e9ecef)'};
                        color: ${marcado ? 'white' : '#495057'};
                        text-align: center;
                        font-weight: bold;
                        padding: 10px 5px;
                        border-radius: 6px;
                        cursor: pointer;
                        min-height: 35px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ${marcado ? 'animation: pulse-marcado 1s ease-out;' : ''}
                    `;
                    
                    gridHtml += `<div class="numero-cell ${marcado ? 'marcado' : ''}" 
                                      data-numero="${numero}" 
                                      style="${baseStyle}"
                                      onclick="toggleNumero(this, ${numero})">${numero}</div>`;
                }
            }
        }
        
        gridHtml += '</div>';
        
        // Calcular estatísticas
        const numerosMarcados = cartela.numeros.filter(num => numerosSorteados.includes(num)).length;
        const totalNumeros = cartela.numeros.length;
        const progresso = Math.round((numerosMarcados / totalNumeros) * 100);
        
        // Determinar status
        let status, statusColor;
        if (progresso === 100) {
            status = '🏆 BINGO!';
            statusColor = '#dc3545';
        } else if (progresso >= 80) {
            status = '⚠️ Quase lá!';
            statusColor = '#ffc107';
        } else if (progresso >= 50) {
            status = '🎯 Boa chance!';
            statusColor = '#17a2b8';
        } else {
            status = '🎮 Em jogo';
            statusColor = '#6c757d';
        }
        
        cartelaDiv.innerHTML = `
            <div class="cartela-header" style="border-bottom: 2px solid #dee2e6; padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #495057;">🎫 Cartela #${index + 1}</h3>
                <div class="cartela-stats" style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                    <span class="progresso" style="
                        background: ${statusColor};
                        color: white;
                        padding: 3px 8px;
                        border-radius: 12px;
                        font-size: 0.8em;
                        font-weight: bold;
                    ">${numerosMarcados}/${totalNumeros} (${progresso}%)</span>
                    <span class="cartela-id" style="color: #6c757d; font-size: 0.8em;">ID: ${cartela.id}</span>
                </div>
            </div>
            ${headerHtml}
            ${gridHtml}
            <div class="cartela-info" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 0.9em;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span><strong>Preço:</strong> R$ ${(cartela.preco || 0).toFixed(2)}</span>
                    <span style="color: ${statusColor}; font-weight: bold;">${status}</span>
                </div>
                <div style="font-size: 0.8em; color: #6c757d;">
                    Data: ${cartela.timestamp ? new Date(cartela.timestamp.seconds * 1000).toLocaleDateString('pt-BR') : 'N/A'}
                </div>
            </div>
        `;
        
        listaCartelasEl.appendChild(cartelaDiv);
    });
    
    // Aplicar marcação automática após exibir todas as cartelas
    if (numerosSorteados.length > 0) {
        console.log('🎯 [REAL] Aplicando marcação automática após exibir cartelas...');
        setTimeout(() => {
            marcarNumerosNasCartelas(numerosSorteados);
        }, 100);
    }
    
    console.log(`✅ [REAL] ${cartelas.length} cartela(s) exibida(s) com efeitos visuais`);
}

// Função para atualizar status e cartelas (botão Atualizar)
async function atualizarSorteio() {
    console.log('🔄 [REAL] Atualizando dados do sorteio...');
    mostrarAlerta('🔄 Atualizando dados...', 'info');
    
    try {
        // Usar função simplificada
        const numerosSorteados = await buscarNumerosSorteadosSimples();
        console.log('🎲 [REAL] Números obtidos na atualização:', numerosSorteados);
        
        atualizarStatusSorteio(numerosSorteados);
        
        // Marcar números nas cartelas existentes
        if (numerosSorteados.length > 0) {
            marcarNumerosNasCartelas(numerosSorteados);
        }
        
        mostrarAlerta(`✅ Atualizado! ${numerosSorteados.length} números sorteados`, 'success');
        
    } catch (error) {
        console.error('❌ [REAL] Erro ao atualizar:', error);
        mostrarAlerta('❌ Erro ao atualizar dados', 'error');
    }
}

// Função para toggle manual de números (clique na cartela)
function toggleNumero(elemento, numero) {
    console.log('🎯 [AÇÃO] Toggle número:', numero);
    
    if (elemento.classList.contains('marcado')) {
        // Desmarcar
        elemento.classList.remove('marcado');
        elemento.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
        elemento.style.color = '#495057';
        elemento.style.animation = '';
    } else {
        // Marcar
        elemento.classList.add('marcado');
        elemento.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
        elemento.style.color = 'white';
        elemento.style.animation = 'pulse-marcado 0.5s ease-out';
    }
    
    // Recalcular estatísticas da cartela
    atualizarEstatisticasCartela(elemento.closest('.cartela-comprador'));
}

// Função para marcar todos os números sorteados
function marcarTodosNumeros() {
    console.log('✅ [AÇÃO] Marcando todos os números sorteados...');
    
    const cartelas = document.querySelectorAll('.cartela-comprador');
    let totalMarcados = 0;
    
    cartelas.forEach(cartela => {
        const numeroCells = cartela.querySelectorAll('.numero-cell[data-numero]');
        numeroCells.forEach(cell => {
            const numero = parseInt(cell.dataset.numero);
            if (!isNaN(numero)) {
                // Simular que todos os números estão sorteados (para demonstração)
                // Em implementação real, verificaria contra números sorteados do Firebase
                cell.classList.add('marcado');
                cell.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                cell.style.color = 'white';
                cell.style.animation = 'pulse-marcado 0.5s ease-out';
                totalMarcados++;
            }
        });
        
        atualizarEstatisticasCartela(cartela);
    });
    
    mostrarAlerta(`✅ ${totalMarcados} números marcados automaticamente!`, 'success');
    console.log(`✅ [AÇÃO] ${totalMarcados} números marcados`);
}

// Função para limpar todas as marcações
function limparMarcacoes() {
    console.log('🗑️ [AÇÃO] Limpando todas as marcações...');
    
    const cartelas = document.querySelectorAll('.cartela-comprador');
    let totalLimpos = 0;
    
    cartelas.forEach(cartela => {
        const numeroCells = cartela.querySelectorAll('.numero-cell.marcado[data-numero]');
        numeroCells.forEach(cell => {
            cell.classList.remove('marcado');
            cell.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
            cell.style.color = '#495057';
            cell.style.animation = '';
            totalLimpos++;
        });
        
        atualizarEstatisticasCartela(cartela);
    });
    
    mostrarAlerta(`🗑️ ${totalLimpos} marcações removidas!`, 'info');
    console.log(`✅ [AÇÃO] ${totalLimpos} marcações limpas`);
}

// Função para verificar BINGO
function verificarBingo() {
    console.log('🎉 [AÇÃO] Verificando BINGO...');
    
    const cartelas = document.querySelectorAll('.cartela-comprador');
    const cartelasBingo = [];
    
    cartelas.forEach((cartela, index) => {
        const numeroCells = cartela.querySelectorAll('.numero-cell[data-numero]');
        const numerosMarcados = cartela.querySelectorAll('.numero-cell.marcado[data-numero]');
        
        const totalNumeros = numeroCells.length;
        const marcados = numerosMarcados.length;
        const progresso = Math.round((marcados / totalNumeros) * 100);
        
        if (progresso === 100) {
            cartelasBingo.push({
                numero: index + 1,
                id: cartela.id.replace('cartela-', ''),
                marcados: marcados,
                total: totalNumeros
            });
        }
    });
    
    if (cartelasBingo.length > 0) {
        // Criar efeitos de comemoração
        criarConfete();
        
        const mensagem = cartelasBingo.length === 1 
            ? `🎉 BINGO! Cartela #${cartelasBingo[0].numero} completou 100%!`
            : `🎉 MÚLTIPLOS BINGOS! ${cartelasBingo.length} cartelas completaram 100%!`;
        
        mostrarAlerta(mensagem, 'success');
        
        // Destacar cartelas vencedoras
        cartelasBingo.forEach(bingo => {
            const cartelaEl = document.getElementById(`cartela-${bingo.id}`);
            if (cartelaEl) {
                cartelaEl.style.border = '3px solid #dc3545';
                cartelaEl.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.5)';
                cartelaEl.style.animation = 'pulse-bingo 2s ease-in-out infinite';
            }
        });
        
        console.log('🏆 [AÇÃO] BINGO encontrado:', cartelasBingo);
    } else {
        mostrarAlerta('🎯 Nenhum BINGO encontrado ainda. Continue jogando!', 'info');
        console.log('🎯 [AÇÃO] Nenhum BINGO encontrado');
    }
}

// Função para atualizar estatísticas de uma cartela
function atualizarEstatisticasCartela(cartelaEl) {
    const numeroCells = cartelaEl.querySelectorAll('.numero-cell[data-numero]');
    const numerosMarcados = cartelaEl.querySelectorAll('.numero-cell.marcado[data-numero]');
    
    const totalNumeros = numeroCells.length;
    const marcados = numerosMarcados.length;
    const progresso = Math.round((marcados / totalNumeros) * 100);
    
    // Atualizar display de progresso
    const progressoEl = cartelaEl.querySelector('.progresso');
    if (progressoEl) {
        progressoEl.textContent = `${marcados}/${totalNumeros} (${progresso}%)`;
        
        // Atualizar cor baseada no progresso
        let cor;
        if (progresso === 100) {
            cor = '#dc3545';
        } else if (progresso >= 80) {
            cor = '#ffc107';
        } else if (progresso >= 50) {
            cor = '#17a2b8';
        } else {
            cor = '#6c757d';
        }
        
        progressoEl.style.backgroundColor = cor;
    }
}

// Função para criar confete (efeito visual)
function criarConfete() {
    console.log('🎊 [EFEITO] Criando confete...');
    
    const elementos = ['🎉', '🎊', '✨', '🎈', '🌟', '⭐', '🥳', '🎁', '🏆', '👑'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confete = document.createElement('div');
            confete.style.position = 'fixed';
            confete.style.left = Math.random() * 100 + 'vw';
            confete.style.top = '-50px';
            confete.style.fontSize = Math.random() * 1.5 + 1 + 'em';
            confete.style.zIndex = '9999';
            confete.style.pointerEvents = 'none';
            confete.style.animation = `confete-cair ${Math.random() * 3 + 3}s linear forwards`;
            confete.textContent = elementos[Math.floor(Math.random() * elementos.length)];
            
            document.body.appendChild(confete);
            
            setTimeout(() => {
                if (confete.parentNode) {
                    confete.remove();
                }
            }, 6000);
        }, i * 100);
    }
}

// ===== ADICIONAR ESTILOS CSS DINÂMICOS =====
function adicionarEstilosDinamicos() {
    const styleId = 'estilos-dinamicos-bingo';
    
    // Verificar se já foi adicionado
    if (document.getElementById(styleId)) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Animações para números marcados */
        @keyframes pulse-marcado {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1.05); }
        }
        
        @keyframes pulse-numero {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* Efeito hover para números */
        .numero-cell:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        }
        
        /* Estilos para números marcados */
        .numero-cell.marcado {
            background: linear-gradient(135deg, #28a745, #20c997) !important;
            color: white !important;
            font-weight: bold !important;
            transform: scale(1.05) !important;
            border: 2px solid #1e7e34 !important;
            box-shadow: 0 0 10px rgba(40, 167, 69, 0.5) !important;
        }
        
        /* Estilos para botões de teste */
        .btn-teste {
            background: #17a2b8;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 0 3px;
        }
        
        .btn-teste:hover {
            background: #138496;
        }
        
        .botoes-teste {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Animação para confete */
        @keyframes confete {
            0% { 
                transform: scale(0) rotate(0deg);
                opacity: 1;
            }
            100% { 
                transform: scale(1) rotate(360deg);
                opacity: 0;
            }
        }
        
        .confete {
            animation: confete 1s ease-out;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ [CSS] Estilos dinâmicos adicionados');
}

// ===== INICIALIZAÇÃO =====
function inicializarInterface() {
    console.log('🎨 [INIT] Inicializando interface...');
    
    // Adicionar estilos dinâmicos
    adicionarEstilosDinamicos();
    
    console.log('✅ [INIT] Interface inicializada');
}

// Adicionar estilos CSS para animações
function adicionarEstilosAnimacao() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-marcado {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(40, 167, 69, 0.7); }
            100% { transform: scale(1); }
        }
        
        @keyframes pulse-numero {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes pulse-bingo {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(220, 53, 69, 0.8); }
            100% { transform: scale(1); }
        }
        
        @keyframes confete-cair {
            0% {
                transform: translateY(-100px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(calc(100vh + 100px)) rotate(360deg);
                opacity: 0;
            }
        }
        
        .numero-sorteado:hover {
            transform: scale(1.1);
            transition: transform 0.2s ease;
        }
        
        .cartela-comprador:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }
        
        .numero-cell:hover {
            transform: scale(1.05);
            transition: transform 0.2s ease;
        }
        
        .bingo-letra {
            animation: pulse-numero 2s ease-in-out infinite;
        }
        
        .bingo-letra:nth-child(1) { animation-delay: 0s; }
        .bingo-letra:nth-child(2) { animation-delay: 0.2s; }
        .bingo-letra:nth-child(3) { animation-delay: 0.4s; }
        .bingo-letra:nth-child(4) { animation-delay: 0.6s; }
        .bingo-letra:nth-child(5) { animation-delay: 0.8s; }
    `;
    document.head.appendChild(style);
    console.log('✅ [STYLE] Estilos de animação adicionados');
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 [DOM] DOM carregado - inicializando...');
    inicializarInterface();
});

// Fallback para caso o DOM já esteja carregado
if (document.readyState === 'loading') {
    console.log('⏳ [DOM] Aguardando DOM...');
} else {
    console.log('✅ [DOM] DOM já carregado - inicializando imediatamente...');
    inicializarInterface();
}

console.log('🎉 [SCRIPT] Script minhas-cartelas-simple.js totalmente carregado!');

// Inicialização quando DOM carrega
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 [SIMPLE] DOM carregado - inicializando versão simplificada');
    
    // Verificar elementos principais
    const loginComprador = document.getElementById('login-comprador');
    const areaCartelas = document.getElementById('area-cartelas');
    const formConsulta = document.getElementById('form-consulta');
    const telefoneInput = document.getElementById('consulta-telefone');
    const alertMsg = document.getElementById('alert-msg');
    
    console.log('🔍 [SIMPLE] Elementos encontrados:', {
        loginComprador: !!loginComprador,
        areaCartelas: !!areaCartelas,
        formConsulta: !!formConsulta,
        telefoneInput: !!telefoneInput,
        alertMsg: !!alertMsg
    });
    
    // Adicionar listener ao formulário
    if (formConsulta) {
        console.log('✅ [SIMPLE] Adicionando listener ao formulário');
        
        formConsulta.addEventListener('submit', (e) => {
            console.log('🎯 [SIMPLE] SUBMIT CAPTURADO!');
            e.preventDefault();
            fazerLogin();
        });
        
        console.log('✅ [SIMPLE] Listener adicionado com sucesso');
    } else {
        console.error('❌ [SIMPLE] Formulário não encontrado!');
        
        // Tentar encontrar todos os formulários
        const allForms = document.querySelectorAll('form');
        console.log('🔍 [SIMPLE] Formulários disponíveis:', allForms.length);
        allForms.forEach((form, index) => {
            console.log(`Form ${index}:`, {
                id: form.id,
                className: form.className,
                tagName: form.tagName
            });
        });
    }
    
    // Garantir que as funções estejam globais
    window.fazerLogin = fazerLogin;
    window.forcarTransicao = forcarTransicao;
    window.fazerLogout = fazerLogout;
    window.verificarAcessoAdmin = verificarAcessoAdmin;
    window.fecharAlert = fecharAlert;
    window.mostrarAlerta = mostrarAlerta;
    window.atualizarSorteio = atualizarSorteio;
    window.buscarNumerosSorteados = buscarNumerosSorteados;
    window.marcarTodosNumeros = marcarTodosNumeros;
    window.limparMarcacoes = limparMarcacoes;
    window.verificarBingo = verificarBingo;
    window.toggleNumero = toggleNumero;
    window.criarConfete = criarConfete;
    window.testarFirebase = testarFirebase;
    
    // Adicionar estilos de animação
    adicionarEstilosAnimacao();
    
    // Inicializar interface
    inicializarInterface();
    
    console.log('✅ [SIMPLE] Funções globais configuradas');
    console.log('🎉 [SIMPLE] Inicialização concluída!');
});

console.log('📝 [SIMPLE] Script minhas-cartelas-simple.js finalizado');

// FUNÇÃO PARA TESTAR BUSCA DE NÚMEROS DIRETAMENTE NA INTERFACE
async function testarBuscaNumeros() {
    console.log('🧪 [TESTE] === TESTANDO BUSCA DE NÚMEROS NA INTERFACE ===');
    
    try {
        const numeros = await buscarNumerosSorteadosSimples();
        console.log('🎯 [TESTE] Resultado da busca:', numeros);
        
        // Mostrar resultado na interface
        mostrarAlerta(`🎲 Teste: ${numeros.length} números encontrados: ${numeros.join(', ')}`, 'info');
        
        // Atualizar interface com os números encontrados
        if (numeros.length > 0) {
            atualizarStatusSorteio(numeros);
        }
        
        return numeros;
        
    } catch (error) {
        console.error('❌ [TESTE] Erro no teste:', error);
        mostrarAlerta('❌ Erro no teste de busca de números', 'error');
        return [];
    }
}

// FUNÇÃO PARA FORÇAR ATUALIZAÇÃO DOS NÚMEROS
async function forcarAtualizacaoNumeros() {
    console.log('🔄 [ATUALIZAR] Forçando atualização dos números...');
    
    try {
        const numeros = await buscarNumerosSorteadosComFallback();
        console.log('🎯 [ATUALIZAR] Números obtidos:', numeros);
        
        // Atualizar interface
        atualizarStatusSorteio(numeros);
        
        // Marcar números nas cartelas se existirem
        const cartelasContainer = document.getElementById('cartelas-container');
        if (cartelasContainer && numeros.length > 0) {
            console.log('🎯 [ATUALIZAR] Marcando números nas cartelas...');
            marcarNumerosNasCartelas(numeros);
        }
        
        mostrarAlerta(`✅ Atualizado! ${numeros.length} números sorteados`, 'success');
        
    } catch (error) {
        console.error('❌ [ATUALIZAR] Erro na atualização:', error);
        mostrarAlerta('❌ Erro ao atualizar números', 'error');
    }
}

// FUNÇÃO PARA MARCAR NÚMEROS NAS CARTELAS
function marcarNumerosNasCartelas(numerosSorteados) {
    console.log('🎯 [MARCAR] Marcando números nas cartelas:', numerosSorteados);
    
    const cartelas = document.querySelectorAll('.cartela');
    
    cartelas.forEach((cartela, indexCartela) => {
        console.log(`🎫 [MARCAR] Processando cartela ${indexCartela + 1}`);
        
        const celulas = cartela.querySelectorAll('.cell');
        
        celulas.forEach(celula => {
            const numero = celula.textContent.trim();
            
            if (numero && numero !== 'LIVRE' && numerosSorteados.includes(parseInt(numero))) {
                console.log(`✅ [MARCAR] Marcando número ${numero} na cartela ${indexCartela + 1}`);
                
                // Adicionar classe de marcado
                celula.classList.add('marcado');
                
                // Adicionar estilo inline para garantir
                celula.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                celula.style.color = 'white';
                celula.style.fontWeight = 'bold';
                celula.style.transform = 'scale(1.05)';
                celula.style.border = '2px solid #1e7e34';
                celula.style.boxShadow = '0 0 10px rgba(40, 167, 69, 0.5)';
            }
        });
    });
    
    console.log('✅ [MARCAR] Marcação de números concluída');
}

// FUNÇÃO ALTERNATIVA COM DADOS SIMULADOS PARA DEMONSTRAÇÃO
async function buscarNumerosSorteadosComFallback() {
    try {
        console.log('🎯 [FALLBACK] Tentando buscar números reais primeiro...');
        
        // Tentar buscar dados reais
        const numerosReais = await buscarNumerosSorteadosSimples();
        
        if (numerosReais && numerosReais.length > 0) {
            console.log('✅ [FALLBACK] Dados reais encontrados:', numerosReais);
            return numerosReais;
        }
        
        // Se não encontrou dados reais, usar dados simulados
        console.log('⚠️ [FALLBACK] Nenhum dado real encontrado, usando dados simulados...');
        
        const numerosSimulados = [3, 7, 15, 23, 31, 42, 56, 64, 72];
        
        console.log('🎮 [FALLBACK] Usando números simulados:', numerosSimulados);
        mostrarAlerta('🎮 Usando dados simulados para demonstração', 'info');
        
        return numerosSimulados;
        
    } catch (error) {
        console.error('❌ [FALLBACK] Erro na busca com fallback:', error);
        
        // Em caso de erro, retornar dados mínimos
        const numerosFallback = [5, 12, 23, 34, 41];
        console.log('🔄 [FALLBACK] Usando dados de emergência:', numerosFallback);
        mostrarAlerta('🔄 Usando dados de emergência', 'warning');
        
        return numerosFallback;
    }
}

// FUNÇÃO PARA USAR DADOS SIMULADOS DIRETAMENTE
function forcarDadosSimulados() {
    console.log('🎮 [DEMO] Forçando uso de dados simulados...');
    
    const numerosDemo = [1, 8, 15, 22, 29, 36, 43, 50, 57, 64, 71];
    
    console.log('🎯 [DEMO] Números de demonstração:', numerosDemo);
    
    // Atualizar interface
    atualizarStatusSorteio(numerosDemo);
    marcarNumerosNasCartelas(numerosDemo);
    
    mostrarAlerta(`🎮 Demonstração: ${numerosDemo.length} números simulados aplicados!`, 'success');
    
    return numerosDemo;
}
