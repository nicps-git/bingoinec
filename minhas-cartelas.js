// ===== SISTEMA DE ACOMPANHAMENTO DE CARTELAS =====

// Função global para verificar acesso admin
function verificarAcessoAdmin() {
    console.log('🔐 Redirecionando para área administrativa...');
    window.location.href = 'admin.html';
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

    let compradorAtual = null;
    let cartelasComprador = [];
    let numerosSorteados = [];
    let marcacoes = {};

    // Estados das cartelas para alertas
    let cartelasArmadas = new Set(); // Cartelas com 23 números
    let cartelasBingo = new Set(); // Cartelas com BINGO
    let alertasBingoMostrados = new Set(); // Para evitar spam de alertas

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
            console.log('🚀 [DEBUG] Iniciando processo de login...');
            
            const telefone = telefoneInput.value.trim();
            const email = emailInput.value.trim();

            console.log('📝 [DEBUG] Dados informados RAW:', { 
                telefone: telefone, 
                email: email,
                telefoneLength: telefone.length,
                emailLength: email.length
            });

            if (!telefone && !email) {
                console.log('⚠️ [DEBUG] Nenhum dado informado');
                mostrarAlerta('⚠️ Informe pelo menos o telefone ou email.', 'warning');
                return;
            }

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

            // Configurar comprador
            compradorAtual = {
                nome: cartelas[0].comprador,
                telefone: cartelas[0].telefone,
                email: cartelas[0].email
            };

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
            console.log(`🃏 Processando cartela ${index + 1}/${cartelasComprador.length}:`, cartela.id);
            
            const cartelaDiv = document.createElement('div');
            cartelaDiv.className = 'cartela-comprador';
            cartelaDiv.id = `cartela-${cartela.id}`;

            const numerosHtml = cartela.numeros.map(numero => {
                const isSorteado = numerosSorteados.includes(numero);
                const isMarcado = marcacoes[cartela.id] && marcacoes[cartela.id].includes(numero);
                
                return `<div class="numero-cartela ${isSorteado ? 'sorteado' : ''} ${isMarcado ? 'marcado' : ''}" 
                            onclick="alternarMarcacao('${cartela.id}', ${numero})">
                            ${numero}
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
                <div class="cartela-grid">
                    ${numerosHtml}
                </div>
                <div class="cartela-info">
                    <p><strong>ID:</strong> ${cartela.id}</p>
                    <p><strong>Preço:</strong> R$ ${(cartela.preco || 0).toFixed(2)}</p>
                    <p><strong>Comprada em:</strong> ${new Date(cartela.dataVenda).toLocaleString()}</p>
                </div>
            `;

            listaCartelasComprador.appendChild(cartelaDiv);
        });

        atualizarNumerosSorteados();
        verificarStatusCartelas();
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

    // Mostrar alerta
    function mostrarAlerta(mensagem, tipo) {
        alertMsg.textContent = mensagem;
        alertMsg.className = `alert ${tipo}`;
        alertMsg.style.display = 'block';

        setTimeout(() => {
            alertMsg.style.display = 'none';
        }, 5000);
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
    
    // Submit do formulário de consulta
    formConsulta.addEventListener('submit', (e) => {
        console.log('📝 Formulário de consulta submetido!');
        e.preventDefault();
        fazerLogin();
    });

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
function atualizarSorteio() {
    console.log('🔄 Atualizando dados do sorteio...');
    alert('🔄 Funcionalidade de atualização será implementada em breve.');
}
