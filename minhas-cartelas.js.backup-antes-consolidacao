// ===== SISTEMA DE ACOMPANHAMENTO DE CARTELAS =====

// Variáveis globais para as funções dos botões
let compradorAtual = null;
let cartelasComprador = [];
let numerosSorteados = [];
let marcacoes = {};
let cartelasArmadas = new Set();
let cartelasBingo = new Set();
let alertasBingoMostrados = new Set();

// Função global para verificar acesso admin
function verificarAcessoAdmin() {
    console.log('🔐 Redirecionando para área administrativa...');
    window.location.href = 'admin.html';
}

// ===== FUNÇÕES DOS BOTÕES DE AÇÃO (GLOBAIS) =====

// Marcar todos os números sorteados automaticamente
function marcarTodosNumeros() {
    console.log('✅ Marcando todos os números sorteados...');
    
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
        
        // Garantir que numeros é um array
        let numerosCartela = [];
        if (Array.isArray(cartela.numeros)) {
            numerosCartela = cartela.numeros;
        } else if (typeof cartela.numeros === 'string') {
            try {
                numerosCartela = JSON.parse(cartela.numeros);
            } catch (e) {
                console.warn('Erro ao fazer parse dos números da cartela:', e);
                return;
            }
        }
        
        // Marcar todos os números da cartela que foram sorteados
        numerosCartela.forEach(numero => {
            if (numerosSorteados.includes(numero) && !marcacoes[cartela.id].includes(numero)) {
                marcacoes[cartela.id].push(numero);
                totalMarcados++;
            }
        });
    });
    
    // Salvar marcações
    const chave = compradorAtual ? (compradorAtual.telefone || compradorAtual.email) : 'temp';
    localStorage.setItem(`bingo_marcacoes_${chave}`, JSON.stringify(marcacoes));
    
    // Tentar atualizar display se as funções existirem
    if (typeof atualizarCartelas === 'function') {
        atualizarCartelas();
    }
    if (typeof verificarStatusCartelas === 'function') {
        verificarStatusCartelas();
    }
    
    mostrarAlerta(`✅ ${totalMarcados} números marcados automaticamente!`, 'success');
    console.log(`✅ Total de números marcados: ${totalMarcados}`);
}

// Limpar todas as marcações
function limparMarcacoes() {
    console.log('🗑️ Limpando todas as marcações...');
    
    if (!cartelasComprador || cartelasComprador.length === 0) {
        mostrarAlerta('❌ Nenhuma cartela encontrada.', 'error');
        return;
    }
    
    if (confirm('🗑️ Tem certeza que deseja limpar todas as marcações?')) {
        // Limpar marcações de todas as cartelas
        cartelasComprador.forEach(cartela => {
            marcacoes[cartela.id] = [];
        });
        
        // Salvar no localStorage
        const chave = compradorAtual ? (compradorAtual.telefone || compradorAtual.email) : 'temp';
        localStorage.setItem(`bingo_marcacoes_${chave}`, JSON.stringify(marcacoes));
        
        // Limpar conjuntos de status
        cartelasArmadas.clear();
        cartelasBingo.clear();
        alertasBingoMostrados.clear();
        
        // Tentar atualizar display se a função existir
        if (typeof atualizarCartelas === 'function') {
            atualizarCartelas();
        }
        
        mostrarAlerta('🗑️ Todas as marcações foram removidas!', 'success');
        console.log('✅ Marcações limpas com sucesso');
    }
}

// Verificar se alguma cartela fez BINGO
function verificarBingo() {
    console.log('🎉 Verificando BINGO...');
    
    if (!cartelasComprador || cartelasComprador.length === 0) {
        mostrarAlerta('❌ Nenhuma cartela encontrada.', 'error');
        return;
    }
    
    let cartelasBingoEncontradas = [];
    let cartelasArmadasLista = [];
    
    cartelasComprador.forEach((cartela, index) => {
        const numerosMarcados = contarNumerosMarcados(cartela.id);
        
        if (numerosMarcados === 24) {
            cartelasBingoEncontradas.push({
                cartela: cartela,
                index: index + 1,
                numerosMarcados: numerosMarcados
            });
        } else if (numerosMarcados === 23) {
            cartelasArmadasLista.push({
                cartela: cartela,
                index: index + 1,
                numerosMarcados: numerosMarcados
            });
        }
    });
    
    // Verificar resultados
    if (cartelasBingoEncontradas.length > 0) {
        let mensagem = '🏆🎉 PARABÉNS! VOCÊ FEZ BINGO! 🎉🏆\n\n';
        
        cartelasBingoEncontradas.forEach(item => {
            mensagem += `🎫 Cartela #${item.index} (ID: ${item.cartela.id})\n`;
            mensagem += `✅ ${item.numerosMarcados}/24 números marcados\n\n`;
        });
        
        mensagem += '🎊 Procure IMEDIATAMENTE os organizadores para validar seu prêmio!';
        
        alert(mensagem);
        mostrarAlerta('🏆 BINGO! Procure os organizadores agora!', 'success');
        
    } else if (cartelasArmadasLista.length > 0) {
        let mensagem = '🔥 CARTELAS ARMADAS! 🔥\n\n';
        
        cartelasArmadasLista.forEach(item => {
            mensagem += `🎫 Cartela #${item.index} (ID: ${item.cartela.id})\n`;
            mensagem += `⚡ ${item.numerosMarcados}/24 números marcados - Falta apenas 1!\n\n`;
        });
        
        mensagem += '🎯 Você está muito perto do BINGO!';
        
        alert(mensagem);
        mostrarAlerta('🔥 Cartelas armadas! Falta pouco para o BINGO!', 'warning');
        
    } else {
        // Calcular estatísticas
        let totalMarcados = 0;
        let melhorCartela = 0;
        
        cartelasComprador.forEach(cartela => {
            const marcados = contarNumerosMarcados(cartela.id);
            totalMarcados += marcados;
            if (marcados > melhorCartela) {
                melhorCartela = marcados;
            }
        });
        
        const mediaMarcados = Math.round(totalMarcados / cartelasComprador.length);
        
        let mensagem = '📊 RELATÓRIO DAS SUAS CARTELAS:\n\n';
        mensagem += `🎫 Total de cartelas: ${cartelasComprador.length}\n`;
        mensagem += `🎯 Melhor cartela: ${melhorCartela}/24 números\n`;
        mensagem += `📈 Média geral: ${mediaMarcados}/24 números\n`;
        mensagem += `🎲 Números sorteados: ${numerosSorteados.length}\n\n`;
        
        if (melhorCartela >= 20) {
            mensagem += '⚡ Você está bem perto do BINGO!';
        } else if (melhorCartela >= 15) {
            mensagem += '📈 Bom progresso! Continue assim!';
        } else if (melhorCartela >= 10) {
            mensagem += '🎯 No caminho certo!';
        } else {
            mensagem += '🎲 Ainda há muito jogo pela frente!';
        }
        
        alert(mensagem);
        mostrarAlerta('📊 Nenhum BINGO ainda, mas continue tentando!', 'info');
    }
    
    console.log('✅ Verificação de BINGO concluída');
}

// Fechar modal de BINGO
function fecharModalBingo() {
    const modalBingo = document.getElementById('modal-bingo');
    if (modalBingo) {
        modalBingo.style.display = 'none';
    }
}

// Fechar alerta
function fecharAlert() {
    const alertMsg = document.getElementById('alert-msg');
    if (alertMsg) {
        alertMsg.style.display = 'none';
    }
}

// Função auxiliar para contar números marcados
function contarNumerosMarcados(cartelaId) {
    if (!marcacoes[cartelaId]) {
        return 0;
    }
    
    // Garantir que é um array
    const marcacoesDaCartela = Array.isArray(marcacoes[cartelaId]) ? marcacoes[cartelaId] : [];
    return marcacoesDaCartela.length;
}

// Função auxiliar para mostrar alertas (versão simplificada para funcionar globalmente)
function mostrarAlerta(mensagem, tipo = 'info') {
    console.log(`🔔 [${tipo.toUpperCase()}] ${mensagem}`);
    
    // Tentar usar o elemento de alerta se existir
    const alertMsg = document.getElementById('alert-msg');
    if (alertMsg) {
        const alertMessage = alertMsg.querySelector('.alert-message');
        if (alertMessage) {
            alertMessage.textContent = mensagem;
        } else {
            // Se não encontrou .alert-message, definir o texto diretamente
            alertMsg.innerHTML = `
                <span class="alert-icon">ℹ️</span>
                <span class="alert-message">${mensagem}</span>
                <button class="alert-close" onclick="fecharAlert()">&times;</button>
            `;
        }
        
        // Definir classes de alerta
        alertMsg.className = `alert alert-${tipo}`;
        alertMsg.style.display = 'block';
        
        // Auto-ocultar após 5 segundos
        setTimeout(() => {
            if (alertMsg) {
                alertMsg.style.display = 'none';
            }
        }, 5000);
    } else {
        console.warn('⚠️ Elemento alert-msg não encontrado, usando alert simples');
        // Fallback para alert simples
        alert(mensagem);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 [MINHAS-CARTELAS] Script iniciado!');
    console.log('📅 [MINHAS-CARTELAS] DOM carregado, inicializando sistema...');
    
    // Elementos do DOM
    const loginComprador = document.getElementById('login-comprador');
    const areaCartelas = document.getElementById('area-cartelas');
    const formConsulta = document.getElementById('form-consulta');
    const telefoneInput = document.getElementById('consulta-telefone');
    const emailInput = document.getElementById('consulta-email');
    const alertMsg = document.getElementById('alert-msg');
    
    console.log('🔍 [MINHAS-CARTELAS] Elementos DOM encontrados:', {
        loginComprador: !!loginComprador,
        areaCartelas: !!areaCartelas,
        formConsulta: !!formConsulta,
        telefoneInput: !!telefoneInput,
        emailInput: !!emailInput,
        alertMsg: !!alertMsg
    });

    // Elementos da área de cartelas
    const nomeCompradorSpan = document.getElementById('nome-comprador-logado');
    const telefoneCompradorSpan = document.getElementById('telefone-comprador-logado');
    const emailCompradorSpan = document.getElementById('email-comprador-logado');
    const totalCartelasSpan = document.getElementById('total-cartelas-comprador');
    const ultimoNumeroSpan = document.getElementById('ultimo-numero');
    const totalSorteadosSpan = document.getElementById('total-sorteados');
    const numerosSorteadosLista = document.getElementById('numeros-sorteados-lista');
    const listaCartelasComprador = document.getElementById('lista-cartelas-comprador');
    const modalBingo = document.getElementById('modal-bingo');
    const cartelaBingoInfo = document.getElementById('cartela-bingo-info');

    // Inicialização robusta do Firebase Service
    console.log('🔥 [MINHAS-CARTELAS] Inicializando sistema...');
    console.log('🔍 [MINHAS-CARTELAS] Verificando dependências globais:', {
        firebase: typeof firebase,
        FirebaseService: typeof FirebaseService
    });
    
    let firebaseService = null;
    let sistemaInicializado = false;
    
    // Função para inicializar Firebase Service
    async function inicializarSistema() {
        try {
            console.log('� Verificando dependências...');
            
            // Verificar se Firebase SDK está carregado
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK não carregado');
            }
            console.log('✅ Firebase SDK carregado');
            
            // Tentar criar instância do Firebase Service
            if (typeof FirebaseService !== 'undefined') {
                firebaseService = new FirebaseService();
                console.log('✅ Firebase Service instanciado');
                
                // Testar conexão
                try {
                    const conexaoOk = await firebaseService.verificarConexao();
                    if (conexaoOk) {
                        console.log('✅ Conexão com Firebase estabelecida');
                        sistemaInicializado = true;
                        return true;
                    } else {
                        console.warn('⚠️ Conexão fraca, mas continuando...');
                        sistemaInicializado = true;
                        return true;
                    }
                } catch (connError) {
                    console.warn('⚠️ Erro na verificação de conexão, mas continuando:', connError.message);
                    sistemaInicializado = true;
                    return true;
                }
            } else {
                console.warn('⚠️ Classe FirebaseService não encontrada, usando fallback');
                // Criar fallback direto
                firebaseService = {
                    db: firebase.firestore(),
                    async carregarCartelasPorComprador(telefone, email) {
                        const snapshot = await this.db.collection('cartelas').where('telefone', '==', telefone).get();
                        const cartelas = [];
                        snapshot.forEach(doc => cartelas.push({ id: doc.id, ...doc.data() }));
                        return cartelas;
                    },
                    async carregarNumerosSorteados() {
                        const snapshot = await this.db.collection('numeros-sorteados').orderBy('timestamp', 'desc').get();
                        const numeros = [];
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            if (data.numero) numeros.push(data.numero);
                        });
                        return numeros.reverse();
                    },
                    escutarNumerosSorteados(callback) {
                        // Listener em tempo real para números sorteados
                        return this.db.collection('numeros-sorteados')
                            .orderBy('timestamp', 'desc')
                            .onSnapshot((snapshot) => {
                                const numeros = [];
                                snapshot.forEach(doc => {
                                    const data = doc.data();
                                    if (data.numero) numeros.push(data.numero);
                                });
                                callback(numeros.reverse());
                            });
                    }
                };
                sistemaInicializado = true;
                return true;
            }
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
            mostrarAlerta(`Erro de inicialização: ${error.message}. Recarregue a página.`, 'error');
            return false;
        }
    }
    
    // Aguardar inicialização
    console.log('⏳ [MINHAS-CARTELAS] Aguardando inicialização do sistema...');
    
    // Tentar inicializar imediatamente
    console.log('🎯 [MINHAS-CARTELAS] Tentativa 1 de inicialização...');
    const inicializado = await inicializarSistema();
    
    if (!inicializado) {
        // Se falhou, tentar novamente após 2 segundos
        console.log('🔄 [MINHAS-CARTELAS] Tentando novamente em 2 segundos...');
        setTimeout(async () => {
            console.log('🎯 [MINHAS-CARTELAS] Tentativa 2 de inicialização...');
            const tentativa2 = await inicializarSistema();
            if (!tentativa2) {
                console.error('❌ [MINHAS-CARTELAS] Sistema não conseguiu inicializar após 2 tentativas');
                mostrarAlerta('Sistema não conseguiu inicializar. Recarregue a página.', 'error');
            } else {
                console.log('🎉 [MINHAS-CARTELAS] Sistema inicializado na segunda tentativa!');
            }
        }, 2000);
    } else {
        console.log('🎉 [MINHAS-CARTELAS] Sistema inicializado com sucesso na primeira tentativa!');
    }

    // ===== FUNÇÕES PRINCIPAIS =====

    // Normalizar telefone (remover formatação) - VERSÃO PADRONIZADA
    function normalizarTelefone(telefone) {
        if (!telefone) return '';
        // Remove todos os caracteres que não são números
        const telefoneNumerico = telefone.toString().replace(/\D/g, '');
        console.log('📱 [LOGIN] Normalizando telefone:', {
            original: telefone,
            normalizado: telefoneNumerico,
            tamanho: telefoneNumerico.length
        });
        return telefoneNumerico;
    }

        async function fazerLogin() {
        try {
            console.log('🚀 [DEBUG] ===== INICIANDO PROCESSO DE LOGIN =====');
            console.log('🚀 [DEBUG] Timestamp:', new Date().toISOString());
            
            const telefone = telefoneInput.value.trim();
            const email = emailInput.value.trim();

            console.log('📝 [DEBUG] Dados informados RAW:', { 
                telefone: telefone, 
                email: email,
                telefoneLength: telefone.length,
                emailLength: email.length,
                telefoneInputExists: !!telefoneInput,
                emailInputExists: !!emailInput
            });

            if (!telefone && !email) {
                console.log('⚠️ [DEBUG] Nenhum dado informado - mostrando alerta');
                mostrarAlerta('⚠️ Informe pelo menos o telefone ou email.', 'warning');
                return;
            }

            console.log('🔍 [DEBUG] Verificando inicialização do sistema...');
            console.log('🔍 [DEBUG] sistemaInicializado:', sistemaInicializado);
            console.log('🔍 [DEBUG] firebaseService:', !!firebaseService);

            console.log('🔍 [DEBUG] Buscando cartelas...');
            mostrarAlerta('🔍 Buscando suas cartelas...', 'info');

            // Verificar se sistema foi inicializado
            if (!sistemaInicializado || !firebaseService) {
                console.error('❌ [DEBUG] Sistema não inicializado');
                mostrarAlerta('❌ Erro: Sistema não inicializado. Recarregue a página.', 'error');
                return;
            }

            console.log('🔥 [DEBUG] Firebase Service disponível, carregando cartelas...');
            
            // Normalizar telefone para busca
            const telefoneNormalizado = telefone ? normalizarTelefone(telefone) : null;
            console.log('📱 [DEBUG] Telefone normalizado:', {
                original: telefone,
                normalizado: telefoneNormalizado,
                lengthOriginal: telefone.length,
                lengthNormalizado: telefoneNormalizado ? telefoneNormalizado.length : 0
            });
            
            // Buscar cartelas no Firebase
            console.log('🔍 [DEBUG] Chamando firebaseService.carregarCartelasPorComprador...');
            const cartelas = await firebaseService.carregarCartelasPorComprador(telefoneNormalizado, email);

            console.log('📦 [DEBUG] Cartelas carregadas:', {
                quantidade: cartelas.length,
                cartelas: cartelas.map(c => ({
                    id: c.id,
                    comprador: c.comprador,
                    telefone: c.telefone,
                    email: c.email
                }))
            });

            if (!cartelas || cartelas.length === 0) {
                console.log('❌ Nenhuma cartela encontrada');
                mostrarAlerta('❌ Nenhuma cartela encontrada com estes dados.', 'error');
                return;
            }

            console.log('✅ Cartelas encontradas:', cartelas.length);

            // Configurar comprador (compatível com novo formato)
            const primeiraCartela = cartelas[0];
            console.log('🔍 [DEBUG] Primeira cartela completa:', primeiraCartela);
            
            // Função auxiliar para extrair string de qualquer formato
            function extrairTexto(valor) {
                if (!valor) return '';
                if (typeof valor === 'string') return valor;
                if (typeof valor === 'object' && valor.nome) return valor.nome;
                return converterParaTexto(valor);
            }
            
            compradorAtual = {
                nome: extrairTexto(primeiraCartela.nome) || 
                      extrairTexto(primeiraCartela.comprador) || 
                      'Nome não informado',
                telefone: extrairTexto(primeiraCartela.telefone) || 
                         telefoneNormalizado || 
                         'Telefone não informado',
                email: extrairTexto(primeiraCartela.email) || 
                       email || 
                       'Email não informado'
            };
            
            console.log('👤 [DEBUG] Comprador configurado:', compradorAtual);

            cartelasComprador = cartelas;

            // Carregar marcações do localStorage (sessão local)
            marcacoes = JSON.parse(localStorage.getItem(`bingo_marcacoes_${telefone || email}`) || '{}');

            // Carregar dados do jogo
            numerosSorteados = await firebaseService.carregarNumerosSorteados();

            console.log('🎯 Configurações carregadas, mostrando área das cartelas...');

            mostrarAreaCartelas();
            configurarListenersSorteio();
            atualizarCartelas();

            // Timeout de segurança para garantir transição
            setTimeout(() => {
                if (loginComprador.style.display !== 'none') {
                    console.log('⚠️ Forçando transição por timeout...');
                    loginComprador.style.display = 'none';
                    areaCartelas.style.display = 'block';
                }
            }, 2000);

            mostrarAlerta('✅ Login realizado com sucesso!', 'success');

        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);
            mostrarAlerta('❌ Erro ao buscar cartelas. Tente novamente.', 'error');
        }
    }

    // Mostrar área das cartelas
    function mostrarAreaCartelas() {
        console.log('🎯 mostrarAreaCartelas() - Executando transição...');
        console.log('📱 loginComprador element:', loginComprador);
        console.log('🎫 areaCartelas element:', areaCartelas);
        
        if (!loginComprador || !areaCartelas) {
            console.error('❌ Elementos não encontrados para transição!');
            alert('❌ Erro: Elementos da interface não encontrados. Recarregue a página.');
            return;
        }
        
        console.log('🔄 Ocultando área de login...');
        loginComprador.style.display = 'none';
        
        console.log('✅ Mostrando área de cartelas...');
        areaCartelas.style.display = 'block';

        // Preencher informações do comprador
        console.log('📝 Preenchendo dados do comprador...');
        console.log('👤 Comprador atual:', compradorAtual);
        
        if (nomeCompradorSpan) nomeCompradorSpan.textContent = compradorAtual.nome;
        if (telefoneCompradorSpan) telefoneCompradorSpan.textContent = compradorAtual.telefone;
        if (emailCompradorSpan) emailCompradorSpan.textContent = compradorAtual.email || 'Não informado';
        if (totalCartelasSpan) totalCartelasSpan.textContent = cartelasComprador.length;
        
        console.log('✅ Transição para área de cartelas concluída!');
    }

    // Configurar listeners para atualizações em tempo real
    function configurarListenersSorteio() {
        // Verificar se o sistema está inicializado
        if (!sistemaInicializado || !firebaseService) {
            console.warn('⚠️ Sistema não inicializado, listeners não configurados');
            return;
        }
        
        // Verificar se a função existe no service
        if (typeof firebaseService.escutarNumerosSorteados !== 'function') {
            console.warn('⚠️ Método escutarNumerosSorteados não disponível no Firebase Service');
            return;
        }
        
        // Listener para novos números sorteados
        firebaseService.escutarNumerosSorteados((novosNumeros) => {
            numerosSorteados = novosNumeros;
            atualizarNumerosSorteados();
            verificarStatusCartelas();
        });
    }

    // Atualizar display dos números sorteados
    function atualizarNumerosSorteados() {
        totalSorteadosSpan.textContent = numerosSorteados.length;
        
        if (numerosSorteados.length > 0) {
            ultimoNumeroSpan.textContent = numerosSorteados[numerosSorteados.length - 1];
        } else {
            ultimoNumeroSpan.textContent = '-';
        }

        // Atualizar lista de números sorteados
        numerosSorteadosLista.innerHTML = numerosSorteados.length > 0 
            ? numerosSorteados.map(n => `<span class="numero-sorteado">${n}</span>`).join('')
            : '<span class="sem-numeros">Nenhum número sorteado ainda</span>';
    }

    // Atualizar cartelas do comprador
    function atualizarCartelas() {
        console.log('🎫 atualizarCartelas() - Iniciando...');
        console.log('📋 Lista cartelas element:', listaCartelasComprador);
        console.log('🎫 Cartelas do comprador:', cartelasComprador.length);
        
        if (!listaCartelasComprador) {
            console.error('❌ Elemento lista-cartelas-comprador não encontrado!');
            return;
        }
        
        listaCartelasComprador.innerHTML = '';

        cartelasComprador.forEach((cartela, index) => {
            console.log(`🃏 Processando cartela ${index + 1}/${cartelasComprador.length}:`, cartela);
            
            const cartelaDiv = document.createElement('div');
            cartelaDiv.className = 'cartela-comprador';
            cartelaDiv.id = `cartela-${cartela.id}`;

            // Garantir que temos 24 números + espaço livre (25 total)
            let numerosCartela = [];
            if (Array.isArray(cartela.numeros)) {
                numerosCartela = [...cartela.numeros];
            } else if (typeof cartela.numeros === 'string') {
                // Se for string, tentar fazer parse
                try {
                    numerosCartela = JSON.parse(cartela.numeros);
                } catch (e) {
                    console.warn('Erro ao fazer parse dos números:', e);
                    numerosCartela = [];
                }
            }
            
            console.log('🎯 Números da cartela:', numerosCartela);
            
            // Organizar números em grid 5x5 com espaço livre no centro
            const grid = [];
            for (let i = 0; i < 25; i++) {
                if (i === 12) { // Posição central (espaço livre)
                    grid.push({ numero: 'FREE', isFree: true });
                } else {
                    const numeroIndex = i < 12 ? i : i - 1; // Ajustar índice para pular o centro
                    const numero = numerosCartela[numeroIndex];
                    if (numero !== undefined) {
                        grid.push({ numero: numero, isFree: false });
                    } else {
                        grid.push({ numero: 0, isFree: false }); // Fallback
                    }
                }
            }

            const numerosHtml = grid.map((cell, index) => {
                if (cell.isFree) {
                    return `<div class="numero-cell free-space">⭐</div>`;
                }
                
                const isSorteado = numerosSorteados.includes(cell.numero);
                const isMarcado = marcacoes[cartela.id] && marcacoes[cartela.id].includes(cell.numero);
                
                return `<div class="numero-cell ${isSorteado ? 'sorteado' : ''} ${isMarcado ? 'marcado' : ''}" 
                            onclick="alternarMarcacao('${cartela.id}', ${cell.numero})">
                            ${cell.numero}
                        </div>`;
            }).join('');

            const numerosMarcados = contarNumerosMarcados(cartela.id);
            const status = getStatusCartela(numerosMarcados);

            cartelaDiv.innerHTML = `
                <div class="cartela-header">
                    <h3>🎫 Cartela #${index + 1}</h3>
                    <div class="cartela-status ${status.classe}">
                        ${status.texto} (${numerosMarcados}/24)
                    </div>
                </div>
                <div class="bingo-header">
                    <div class="bingo-letter">B</div>
                    <div class="bingo-letter">I</div>
                    <div class="bingo-letter">N</div>
                    <div class="bingo-letter">G</div>
                    <div class="bingo-letter">O</div>
                </div>
                <div class="bingo-grid">
                    ${numerosHtml}
                </div>
                <div class="cartela-info">
                    <p><strong>ID:</strong> ${cartela.id}</p>
                    <p><strong>Preço:</strong> R$ ${(cartela.preco || 0).toFixed(2)}</p>
                    <p><strong>Comprada em:</strong> ${formatarDataCompra(cartela)}</p>
                </div>
            `;

            listaCartelasComprador.appendChild(cartelaDiv);
        });

        atualizarNumerosSorteados();
        verificarStatusCartelas();
    }

    // Função auxiliar para formatar data
    function formatarDataCompra(cartela) {
        try {
            // Tentar diferentes formatos de data
            let data = null;
            
            if (cartela.dataCompra) {
                if (cartela.dataCompra.seconds) {
                    // Timestamp do Firebase
                    data = new Date(cartela.dataCompra.seconds * 1000);
                } else if (typeof cartela.dataCompra === 'string') {
                    data = new Date(cartela.dataCompra);
                } else if (cartela.dataCompra instanceof Date) {
                    data = cartela.dataCompra;
                }
            } else if (cartela.dataVenda) {
                if (cartela.dataVenda.seconds) {
                    data = new Date(cartela.dataVenda.seconds * 1000);
                } else {
                    data = new Date(cartela.dataVenda);
                }
            } else if (cartela.timestamp) {
                data = new Date(cartela.timestamp);
            }
            
            if (data && !isNaN(data.getTime())) {
                return data.toLocaleString('pt-BR');
            } else {
                return 'Data não disponível';
            }
        } catch (error) {
            console.warn('Erro ao formatar data da cartela:', error);
            return 'Data não disponível';
        }
    }

    // Alternar marcação de número
    function alternarMarcacao(cartelaId, numero) {
        if (!marcacoes[cartelaId]) {
            marcacoes[cartelaId] = [];
        }

        const index = marcacoes[cartelaId].indexOf(numero);
        if (index > -1) {
            marcacoes[cartelaId].splice(index, 1);
        } else {
            // Só marcar se o número foi sorteado
            if (numerosSorteados.includes(numero)) {
                marcacoes[cartelaId].push(numero);
            } else {
                mostrarAlerta('⚠️ Só é possível marcar números já sorteados!', 'warning');
                return;
            }
        }

        // Salvar marcações no localStorage
        const chave = compradorAtual.telefone || compradorAtual.email;
        localStorage.setItem(`bingo_marcacoes_${chave}`, JSON.stringify(marcacoes));

        atualizarCartelas();
    }

    // Contar números marcados
    function contarNumerosMarcados(cartelaId) {
        return marcacoes[cartelaId] ? marcacoes[cartelaId].length : 0;
    }

    // Obter status da cartela
    function getStatusCartela(numerosMarcados) {
        if (numerosMarcados === 24) {
            return { texto: '🏆 BINGO!', classe: 'bingo' };
        } else if (numerosMarcados === 23) {
            return { texto: '🔥 ARMADO!', classe: 'armado' };
        } else if (numerosMarcados >= 20) {
            return { texto: '⚡ Quase lá!', classe: 'perto' };
        } else if (numerosMarcados >= 10) {
            return { texto: '📈 Progredindo', classe: 'progresso' };
        } else {
            return { texto: '🎯 Começando', classe: 'inicio' };
        }
    }

    // Verificar status das cartelas para alertas
    function verificarStatusCartelas() {
        cartelasComprador.forEach(cartela => {
            const numerosMarcados = contarNumerosMarcados(cartela.id);
            
            // Verificar ARMADO (23 números)
            if (numerosMarcados === 23 && !cartelasArmadas.has(cartela.id)) {
                cartelasArmadas.add(cartela.id);
                mostrarAlertaArmado(cartela.id);
                tocarSomAlerta();
            }

            // Verificar BINGO (24 números)
            if (numerosMarcados === 24 && !cartelasBingo.has(cartela.id)) {
                cartelasBingo.add(cartela.id);
                
                if (!alertasBingoMostrados.has(cartela.id)) {
                    alertasBingoMostrados.add(cartela.id);
                    mostrarModalBingo(cartela);
                    tocarSomBingo();
                }
            }

            // Se saiu do estado armado, remover do conjunto
            if (numerosMarcados !== 23 && cartelasArmadas.has(cartela.id)) {
                cartelasArmadas.delete(cartela.id);
            }
        });
    }

    // Mostrar alerta de armado
    function mostrarAlertaArmado(cartelaId) {
        const alertaDiv = document.createElement('div');
        alertaDiv.className = 'alerta-flutuante armado';
        alertaDiv.innerHTML = `
            <div class="alerta-content">
                <h3>🔥 CARTELA ARMADA! 🔥</h3>
                <p>Cartela ${cartelaId} está com 23 números!</p>
                <p>Falta apenas 1 número para o BINGO!</p>
            </div>
        `;
        
        document.body.appendChild(alertaDiv);
        
        setTimeout(() => {
            alertaDiv.remove();
        }, 5000);
    }

    // Mostrar modal de BINGO
    function mostrarModalBingo(cartela) {
        cartelaBingoInfo.innerHTML = `
            <h2>🏆 PARABÉNS! 🏆</h2>
            <p>Você fez <strong>BINGO</strong> na cartela:</p>
            <div class="bingo-cartela-info">
                <p><strong>ID:</strong> ${cartela.id}</p>
                <p><strong>Comprador:</strong> ${cartela.comprador}</p>
                <p><strong>Telefone:</strong> ${cartela.telefone}</p>
            </div>
            <p class="bingo-instrucoes">
                🎉 Procure imediatamente os organizadores para validar seu prêmio!
            </p>
        `;
        
        modalBingo.style.display = 'block';
        criarConfeteBingo();
    }

    // Tocar som de alerta
    function tocarSomAlerta() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+X2um4gBDWI0fPTgjEFJHzC7OSURAkTYLXp8qZdEgZOp+fzq2EgBTuH1fDZgjAYJHzH7+WNQQ8SXqnh7+2EKjYFKnzOSsVoEvN+iLpN4aWQQJJjLDv');
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignora erro se não conseguir tocar
        } catch (error) {
            // Ignora erro de áudio
        }
    }

    // Tocar som de BINGO
    function tocarSomBingo() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+X2um4gBDWI0fPTgjEFJHzC7OSURAkTYLXp8qZdEgZOp+fzq2EgBTuH1fDZgjAYJHzH7+WNQQ8SXqnh7+2EKjYFKnzOSsVoEvN+iLpN4aWQQJJjLDv');
            audio.volume = 0.5;
            audio.play().catch(() => {}); // Ignora erro se não conseguir tocar
        } catch (error) {
            // Ignora erro de áudio
        }
    }

    // Criar confete de BINGO
    function criarConfeteBingo() {
        const elementos = ['🎉', '🎊', '🏆', '⭐', '🌟', '✨', '🎈', '🎁'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confete = document.createElement('div');
                confete.textContent = elementos[Math.floor(Math.random() * elementos.length)];
                confete.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    font-size: ${Math.random() * 30 + 20}px;
                    z-index: 10000;
                    pointer-events: none;
                    animation: confetti-fall 4s ease-out forwards;
                `;
                document.body.appendChild(confete);
                
                setTimeout(() => confete.remove(), 4000);
            }, i * 100);
        }
    }

    // Sair (voltar ao login)
    function sair() {
        if (confirm('Deseja realmente sair?')) {
            compradorAtual = null;
            cartelasComprador = [];
            numerosSorteados = [];
            marcacoes = {};
            cartelasArmadas.clear();
            cartelasBingo.clear();
            alertasBingoMostrados.clear();

            loginComprador.style.display = 'block';
            areaCartelas.style.display = 'none';
            
            // Limpar form
            telefoneInput.value = '';
            emailInput.value = '';
        }
    }

    // Função de emergência para forçar transição
    window.forcarTransicao = function() {
        console.log('🚨 TRANSIÇÃO FORÇADA - Executando...');
        
        const login = document.getElementById('login-comprador');
        const area = document.getElementById('area-cartelas');
        
        if (login) {
            login.style.display = 'none';
            console.log('✅ Login ocultado');
        }
        
        if (area) {
            area.style.display = 'block';
            console.log('✅ Área de cartelas mostrada');
        }
        
        // Dados de teste se necessário
        if (!compradorAtual) {
            compradorAtual = {
                nome: 'Usuário Teste',
                telefone: '(11) 99999-9999',
                email: 'teste@email.com'
            };
        }
        
        // Preencher dados básicos
        const nomeEl = document.getElementById('nome-comprador-logado');
        const telEl = document.getElementById('telefone-comprador-logado');
        const emailEl = document.getElementById('email-comprador-logado');
        const totalEl = document.getElementById('total-cartelas-comprador');
        
        if (nomeEl) nomeEl.textContent = compradorAtual.nome;
        if (telEl) telEl.textContent = compradorAtual.telefone;
        if (emailEl) emailEl.textContent = compradorAtual.email;
        if (totalEl) totalEl.textContent = cartelasComprador.length || '0';
        
        console.log('🎉 Transição forçada concluída!');
        alert('🎉 Área de cartelas exibida! (Modo de emergência)');
    };

    // ===== EVENT LISTENERS =====
    
    // Submit do formulário de consulta - COM VALIDAÇÃO
    if (formConsulta) {
        console.log('✅ [LISTENER] Adicionando listener ao formulário form-consulta');
        formConsulta.addEventListener('submit', (e) => {
            console.log('🎯 [SUBMIT] Formulário de consulta submetido!');
            e.preventDefault();
            console.log('🚀 [SUBMIT] Chamando fazerLogin()...');
            fazerLogin();
        });
        console.log('✅ [LISTENER] Listener adicionado com sucesso');
    } else {
        console.error('❌ [LISTENER] Formulário form-consulta não encontrado!');
        console.error('❌ [LISTENER] Elementos disponíveis:', document.querySelectorAll('form'));
    }

    // Fechar modal de BINGO se existir
    const modalClose = document.querySelector('.modal .close');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modalBingo.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modalBingo) {
            modalBingo.style.display = 'none';
        }
    });

    // Fechar modal de BINGO
    function fecharModalBingo() {
        const modalBingo = document.getElementById('modal-bingo');
        if (modalBingo) {
            modalBingo.style.display = 'none';
        }
    }

    // Tornar função global
    window.fecharModalBingo = fecharModalBingo;

    // Tornar funções globais
    window.alternarMarcacao = alternarMarcacao;

    // CSS para animações
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

        .alerta-flutuante {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.5s ease-out;
        }

        .alerta-flutuante.armado {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Debug: adicionar logs detalhados
    console.log('🔧 Iniciando debug do sistema de login...');
    console.log('📝 Elementos encontrados:', {
        loginComprador: !!loginComprador,
        areaCartelas: !!areaCartelas,
        formConsulta: !!formConsulta,
        telefoneInput: !!telefoneInput,
        emailInput: !!emailInput,
        alertMsg: !!alertMsg
    });

    console.log('✅ Sistema de acompanhamento carregado com Firebase');
});

// ===== FUNÇÕES GLOBAIS =====

// Função para forçar transição em caso de emergência
function forcarTransicao() {
    console.log('🚨 Função de emergência ativada!');
    
    const loginSection = document.getElementById('login-comprador');
    const cartelasSection = document.getElementById('area-cartelas');
    
    if (loginSection && cartelasSection) {
        console.log('🔄 Forçando transição...');
        loginSection.style.display = 'none';
        cartelasSection.style.display = 'block';
        
        // Preencher dados mockados para teste
        const nomeSpan = document.getElementById('nome-comprador-logado');
        const telefoneSpan = document.getElementById('telefone-comprador-logado');
        const emailSpan = document.getElementById('email-comprador-logado');
        const totalSpan = document.getElementById('total-cartelas-comprador');
        
        if (nomeSpan) nomeSpan.textContent = 'TESTE EMERGÊNCIA';
        if (telefoneSpan) telefoneSpan.textContent = '(11) 99999-9999';
        if (emailSpan) emailSpan.textContent = 'teste@exemplo.com';
        if (totalSpan) totalSpan.textContent = '0';
        
        alert('🚨 Transição forçada! Este é apenas um modo de teste.');
    } else {
        console.error('❌ Elementos não encontrados para transição forçada!');
        alert('❌ Erro: Elementos da interface não encontrados.');
    }
}

// Função para logout do comprador
function fazerLogout() {
    console.log('🚪 Fazendo logout...');
    
    if (confirm('Deseja realmente sair e voltar à tela de login?')) {
        const loginSection = document.getElementById('login-comprador');
        const cartelasSection = document.getElementById('area-cartelas');
        
        // Limpar campos
        const telefoneInput = document.getElementById('consulta-telefone');
        const emailInput = document.getElementById('consulta-email');
        
        if (telefoneInput) telefoneInput.value = '';
        if (emailInput) emailInput.value = '';
        
        // Mostrar login novamente
        if (loginSection && cartelasSection) {
            cartelasSection.style.display = 'none';
            loginSection.style.display = 'block';
        }
        
        console.log('✅ Logout realizado com sucesso');
    }
}

// Função para atualizar sorteio manualmente
async function atualizarSorteio() {
    console.log('🔄 Atualizando dados do sorteio...');
    
    // Mostrar indicador de carregamento
    const btnAtualizar = document.querySelector('.btn-atualizar');
    if (!btnAtualizar) {
        console.error('❌ Botão atualizar não encontrado');
        return;
    }
    
    const textoOriginal = btnAtualizar.textContent;
    btnAtualizar.textContent = '🔄 Atualizando...';
    btnAtualizar.disabled = true;
    
    try {
        // Aguardar Firebase estar pronto
        let servicoFirebase = window.firebaseService;
        
        if (!servicoFirebase) {
            console.log('⏳ Aguardando Firebase estar pronto...');
            if (typeof window.waitForFirebase === 'function') {
                servicoFirebase = await window.waitForFirebase(10000);
                console.log('✅ Firebase carregado com sucesso');
            } else {
                throw new Error('Firebase não está disponível');
            }
        }
        
        if (!servicoFirebase) {
            throw new Error('Não foi possível conectar ao Firebase');
        }
        
        console.log('✅ Firebase conectado, carregando dados...');
        
        // Carregar números sorteados do Firebase
        const numerosSorteadosCarregados = await servicoFirebase.carregarNumerosSorteados();
        console.log('✅ Números sorteados carregados:', numerosSorteadosCarregados);
        
        // Atualizar interface
        numerosSorteados = numerosSorteadosCarregados;
        if (typeof atualizarNumerosSorteados === 'function') {
            atualizarNumerosSorteados();
        }
        
        // Recarregar e atualizar cartelas com novos números
        if (compradorAtual && compradorAtual.telefone) {
            console.log('🔄 Recarregando cartelas do comprador...');
            const cartelas = await servicoFirebase.carregarCartelasPorComprador(
                compradorAtual.telefone, 
                compradorAtual.email
            );
            
            if (cartelas && cartelas.length > 0) {
                cartelasComprador = cartelas;
                console.log(`✅ ${cartelas.length} cartelas recarregadas`);
                
                // Tentar atualizar interface se as funções existirem
                if (typeof atualizarCartelas === 'function') {
                    atualizarCartelas();
                }
                if (typeof verificarStatusCartelas === 'function') {
                    verificarStatusCartelas();
                }
            } else {
                console.log('⚠️ Nenhuma cartela encontrada para este comprador');
            }
        } else {
            console.log('⚠️ Dados do comprador não disponíveis');
        }
        
        // Mostrar confirmação visual
        mostrarNotificacao('✅ Dados atualizados com sucesso!', 'sucesso');
        console.log('✅ Atualização concluída com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar sorteio:', error);
        mostrarNotificacao(`❌ Erro ao atualizar: ${error.message}`, 'erro');
    } finally {
        // Restaurar botão
        setTimeout(() => {
            btnAtualizar.textContent = textoOriginal;
            btnAtualizar.disabled = false;
        }, 1000);
    }
}

// Função para mostrar notificação temporária
function mostrarNotificacao(mensagem, tipo = 'info') {
    console.log(`📢 Notificação: ${mensagem} (${tipo})`);
    
    try {
        // Remover notificação existente
        const notificacaoExistente = document.querySelector('.notificacao-temp');
        if (notificacaoExistente) {
            notificacaoExistente.remove();
        }
        
        // Criar nova notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao-temp notificacao-${tipo}`;
        notificacao.innerHTML = `
            <div class="notificacao-conteudo">
                <span class="notificacao-texto">${mensagem}</span>
                <button class="notificacao-fechar" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Adicionar estilos inline para garantir funcionamento
        const cores = {
            sucesso: '#4CAF50',
            erro: '#f44336',
            aviso: '#FF9800',
            info: '#2196F3'
        };
        
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${cores[tipo] || cores.info};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-weight: bold;
            max-width: 300px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        // Adicionar estilos para o botão fechar
        const btnFechar = notificacao.querySelector('.notificacao-fechar');
        if (btnFechar) {
            btnFechar.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                margin-left: 10px;
                padding: 0 5px;
            `;
        }
        
        document.body.appendChild(notificacao);
        
        // Auto remover após 4 segundos
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (notificacao.parentNode) {
                        notificacao.remove();
                    }
                }, 300);
            }
        }, 4000);
        
    } catch (error) {
        console.error('❌ Erro ao mostrar notificação:', error);
        // Fallback para alert simples
        alert(mensagem);
    }

// Função para converter qualquer valor em string legível
function converterParaTexto(valor) {
    if (!valor) return '';
    if (typeof valor === 'string') return valor;
    if (typeof valor === 'number') return valor.toString();
    if (typeof valor === 'object') {
        // Se for objeto, tentar pegar propriedade nome
        if (valor.nome) return String(valor.nome);
        if (valor.comprador) return String(valor.comprador);
        // Se não tiver propriedades úteis, usar toString
        const stringValue = Object.prototype.toString.call(valor);
        if (stringValue === '[object Object]') {
            // Tentar converter para JSON legível
            try {
                const json = JSON.stringify(valor);
                return json.length < 50 ? json : 'Objeto complexo';
            } catch (e) {
                return 'Valor não identificado';
            }
        }
        return String(valor);
    }
    return String(valor);
}
