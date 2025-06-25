// ===== FUNÇÕES DE VERIFICAÇÃO DE ACESSO =====

function verificarAcessoAdmin() {
    if (window.bingoAuth && window.bingoAuth.isAuthenticated()) {
        window.location.href = 'admin.html';
    } else {
        if (confirm('Para acessar a área administrativa, é necessário fazer login. Deseja ir para a página de login?')) {
            window.location.href = 'login.html';
        }
    }
}

// ===== VARIÁVEIS GLOBAIS DO BINGO =====
let bingoGlobal = {
    sortearBtn: null,
    numeroSorteadoEl: null,
    numerosAnterioresEl: null,
    contadorEl: null,
    fogosEl: null,
    numerosSorteados: [],
    numerosDisponiveis: [],
    configuracoes: {},
    cartelasArmadas: new Set(),
    cartelasBingo: new Set(),
    alertasBingoMostrados: new Set(),
    inicializado: false
};

// ===== SISTEMA DE PRÊMIOS: QUINA E BINGO =====

// Estado dos prêmios
let premiosGlobal = {
    quinaEncontrada: false,
    bingoEncontrado: false,
    vencedorQuina: null,
    vencedorBingo: null,
    cartelasVerificadas: new Set()
};

// Verificar se uma coluna está completa (QUINA)
function verificarQuina(numerosCartela, numerosSorteados) {
    // Converter cartela para formato array simples se necessário
    let numerosArray = [];
    
    if (Array.isArray(numerosCartela) && Array.isArray(numerosCartela[0])) {
        // Formato matriz 5x5 - converter para array
        for (let col = 0; col < numerosCartela.length; col++) {
            for (let row = 0; row < numerosCartela[col].length; row++) {
                if (numerosCartela[col][row] !== 'FREE' && !isNaN(numerosCartela[col][row])) {
                    numerosArray.push(numerosCartela[col][row]);
                }
            }
        }
    } else if (Array.isArray(numerosCartela)) {
        // Formato array simples - usar diretamente
        numerosArray = numerosCartela.filter(num => !isNaN(num));
    } else {
        console.warn('⚠️ Formato de cartela não reconhecido:', numerosCartela);
        return { temQuina: false };
    }
    
    // Garantir que temos exatamente 24 números
    if (numerosArray.length !== 24) {
        console.warn('⚠️ Cartela não tem 24 números:', numerosArray.length, numerosArray);
        return { temQuina: false };
    }
    
    // Organizar cartela em matriz 5x5 com espaço livre no centro
    // Layout: 0  1  2  3  4
    //         5  6  7  8  9
    //        10 11 XX 12 13  (XX = LIVRE)
    //        14 15 16 17 18
    //        19 20 21 22 23
    
    const matriz = [
        [numerosArray[0], numerosArray[5], numerosArray[10], numerosArray[14], numerosArray[19]], // Coluna B (0)
        [numerosArray[1], numerosArray[6], numerosArray[11], numerosArray[15], numerosArray[20]], // Coluna I (1)
        [numerosArray[2], numerosArray[7], 'LIVRE', numerosArray[16], numerosArray[21]],          // Coluna N (2) - com LIVRE
        [numerosArray[3], numerosArray[8], numerosArray[12], numerosArray[17], numerosArray[22]], // Coluna G (3)
        [numerosArray[4], numerosArray[9], numerosArray[13], numerosArray[18], numerosArray[23]]  // Coluna O (4)
    ];
    
    const nomesColunas = ['B', 'I', 'N', 'G', 'O'];
    
    // Verificar cada coluna
    for (let col = 0; col < 5; col++) {
        const coluna = matriz[col];
        let numerosCompletos = 0;
        
        for (let numero of coluna) {
            if (numero === 'LIVRE' || numerosSorteados.includes(numero)) {
                numerosCompletos++;
            }
        }
        
        // Se uma coluna tem todos os 5 números/espaços marcados
        if (numerosCompletos === 5) {
            return {
                temQuina: true,
                coluna: col + 1,
                nomeColuna: nomesColunas[col],
                numerosColuna: coluna
            };
        }
    }
    
    return { temQuina: false };
}

// Verificar se a cartela está completa (BINGO)
function verificarBingo(numerosCartela, numerosSorteados) {
    // Converter cartela para formato array simples se necessário
    let numerosArray = [];
    
    if (Array.isArray(numerosCartela) && Array.isArray(numerosCartela[0])) {
        // Formato matriz 5x5 - converter para array
        for (let col = 0; col < numerosCartela.length; col++) {
            for (let row = 0; row < numerosCartela[col].length; row++) {
                if (numerosCartela[col][row] !== 'FREE' && !isNaN(numerosCartela[col][row])) {
                    numerosArray.push(numerosCartela[col][row]);
                }
            }
        }
    } else if (Array.isArray(numerosCartela)) {
        // Formato array simples - usar diretamente
        numerosArray = numerosCartela.filter(num => !isNaN(num));
    } else {
        console.warn('⚠️ Formato de cartela não reconhecido:', numerosCartela);
        return { temBingo: false, numerosCompletos: 0 };
    }
    
    // Contar números sorteados
    let numerosCompletos = 0;
    
    for (let numero of numerosArray) {
        if (numerosSorteados.includes(numero)) {
            numerosCompletos++;
        }
    }
    
    // BINGO = todos os números marcados (24 para cartela de 24 números)
    const totalNumerosCartela = numerosArray.length;
    return {
        temBingo: numerosCompletos === totalNumerosCartela,
        numerosCompletos: numerosCompletos,
        totalNumeros: totalNumerosCartela
    };
}

// Verificar todas as cartelas vendidas em busca de prêmios
async function verificarPremios(numeroRecemSorteado) {
    if (!firebaseService) {
        console.log('⚠️ Firebase não disponível para verificar prêmios');
        return;
    }
    
    try {
        console.log('🔍 Verificando prêmios após sortear número:', numeroRecemSorteado);
        
        // Buscar todas as cartelas vendidas
        const cartelas = await firebaseService.buscarTodasCartelas();
        
        if (!cartelas || cartelas.length === 0) {
            console.log('📋 Nenhuma cartela vendida encontrada');
            return;
        }
        
        console.log(`🎫 Verificando ${cartelas.length} cartela(s) vendida(s)`);
        
        for (let cartela of cartelas) {
            if (!cartela.numeros || !Array.isArray(cartela.numeros)) {
                continue;
            }
            
            // Verificar QUINA primeiro (se ainda não foi encontrada)
            if (!premiosGlobal.quinaEncontrada) {
                const resultadoQuina = verificarQuina(cartela.numeros, bingoGlobal.numerosSorteados);
                
                if (resultadoQuina.temQuina) {
                    premiosGlobal.quinaEncontrada = true;
                    premiosGlobal.vencedorQuina = cartela;
                    
                    console.log('🏆 QUINA ENCONTRADA!', cartela);
                    
                    // Anunciar QUINA
                    anunciarQuina(cartela, resultadoQuina);
                    
                    // Salvar prêmio no Firebase
                    await salvarPremioNoFirebase('QUINA', cartela, resultadoQuina);
                }
            }
            
            // Verificar BINGO (se ainda não foi encontrado)
            if (!premiosGlobal.bingoEncontrado) {
                const resultadoBingo = verificarBingo(cartela.numeros, bingoGlobal.numerosSorteados);
                
                if (resultadoBingo.temBingo) {
                    premiosGlobal.bingoEncontrado = true;
                    premiosGlobal.vencedorBingo = cartela;
                    
                    console.log('🎉 BINGO ENCONTRADO!', cartela);
                    
                    // Anunciar BINGO
                    anunciarBingo(cartela, resultadoBingo);
                    
                    // Salvar prêmio no Firebase
                    await salvarPremioNoFirebase('BINGO', cartela, resultadoBingo);
                    
                    // Se já tem BINGO, pode encerrar o jogo
                    if (confirm('🎉 BINGO! O jogo foi concluído. Deseja encerrar o sorteio?')) {
                        encerrarJogo();
                    }
                    
                    break; // Para de verificar outras cartelas
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar prêmios:', error);
    }
}

// Anunciar QUINA
function anunciarQuina(cartela, resultado) {
    console.log('🏆 ANUNCIANDO QUINA!');
    
    // Efeitos visuais
    criarConfete();
    tocarSomFesta();
    
    // Modal/Alert de QUINA
    const nomeComprador = cartela.nome || cartela.comprador?.nome || 'Ganhador';
    const telefone = cartela.telefone || cartela.comprador?.telefone || '';
    
    const mensagem = `
🏆🎉 QUINA! 🎉🏆

🎫 Primeira QUINA encontrada!
👤 Ganhador: ${nomeComprador}
📱 Telefone: ${telefone}
📋 Cartela: ${cartela.id}
📍 Coluna ${resultado.nomeColuna} completa!

🎊 Parabéns! Procure os organizadores para receber seu prêmio!
    `;
    
    alert(mensagem);
    
    // Adicionar indicação visual na tela
    adicionarIndicacaoPremio('QUINA', nomeComprador);
}

// Anunciar BINGO
function anunciarBingo(cartela, resultado) {
    console.log('🎉 ANUNCIANDO BINGO!');
    
    // Efeitos visuais intensos
    criarConfete();
    criarFogosArtificio();
    tocarSomFesta();
    
    // Modal/Alert de BINGO
    const nomeComprador = cartela.nome || cartela.comprador?.nome || 'Ganhador';
    const telefone = cartela.telefone || cartela.comprador?.telefone || '';
    
    const mensagem = `
🎉🏆 BINGO! 🏆🎉

🎫 CARTELA COMPLETA!
👤 GRANDE VENCEDOR: ${nomeComprador}
📱 Telefone: ${telefone}
📋 Cartela: ${cartela.id}
🎯 ${resultado.numerosCompletos}/24 números completos!

🏆 PARABÉNS! VOCÊ GANHOU O PRÊMIO PRINCIPAL!
🎊 Procure IMEDIATAMENTE os organizadores!
    `;
    
    alert(mensagem);
    
    // Adicionar indicação visual na tela
    adicionarIndicacaoPremio('BINGO', nomeComprador);
}

// Adicionar indicação visual de prêmio na tela
function adicionarIndicacaoPremio(tipo, nomeGanhador) {
    const container = document.querySelector('.main-container') || document.body;
    
    const premioDiv = document.createElement('div');
    premioDiv.className = `premio-anuncio premio-${tipo.toLowerCase()}`;
    premioDiv.innerHTML = `
        <div class="premio-conteudo">
            <h2>${tipo === 'QUINA' ? '🏆 QUINA!' : '🎉 BINGO!'}</h2>
            <p>Ganhador: <strong>${nomeGanhador}</strong></p>
            <div class="premio-tipo">${tipo === 'QUINA' ? '1º Prêmio: QUINA' : '2º Prêmio: BINGO'}</div>
        </div>
    `;
    
    container.appendChild(premioDiv);
    
    // Remover após 10 segundos
    setTimeout(() => {
        if (premioDiv.parentNode) {
            premioDiv.parentNode.removeChild(premioDiv);
        }
    }, 10000);
}

// Salvar prêmio no Firebase
async function salvarPremioNoFirebase(tipo, cartela, resultado) {
    if (!firebaseService) return;
    
    try {
        const premio = {
            tipo: tipo,
            timestamp: new Date(),
            cartela: cartela,
            ganhador: {
                nome: cartela.nome || cartela.comprador?.nome || '',
                telefone: cartela.telefone || cartela.comprador?.telefone || ''
            },
            detalhes: resultado,
            numerosSorteados: [...bingoGlobal.numerosSorteados]
        };
        
        await firebaseService.salvarPremio(tipo, premio);
        console.log(`✅ Prêmio ${tipo} salvo no Firebase`);
        
    } catch (error) {
        console.error(`❌ Erro ao salvar prêmio ${tipo}:`, error);
    }
}

// Encerrar jogo após BINGO
function encerrarJogo() {
    bingoGlobal.sortearBtn.disabled = true;
    bingoGlobal.sortearBtn.textContent = '🏆 Jogo Encerrado';
    
    // Exibir resumo final
    const resumo = `
🎊 JOGO ENCERRADO! 🎊

${premiosGlobal.quinaEncontrada ? 
    `🏆 1º Prêmio (QUINA): ${premiosGlobal.vencedorQuina?.nome || 'Ganhador da Quina'}` : 
    '❌ Nenhuma QUINA foi encontrada'}

${premiosGlobal.bingoEncontrado ? 
    `🎉 2º Prêmio (BINGO): ${premiosGlobal.vencedorBingo?.nome || 'Ganhador do Bingo'}` : 
    '❌ Nenhum BINGO foi encontrado'}

📊 Total de números sorteados: ${bingoGlobal.numerosSorteados.length}
🎪 Obrigado por participar do Bingo Arraiá INEC!
    `;
    
    alert(resumo);
}

// ===== FUNÇÃO PRINCIPAL DE SORTEIO (ESCOPO GLOBAL) =====
window.sortearNumero = function() {
    if (!bingoGlobal.inicializado) {
        console.error('❌ Sistema não inicializado ainda!');
        alert('Aguarde a inicialização do sistema...');
        return;
    }
    
    console.log('🎲 Função sortearNumero chamada');
    
    if (bingoGlobal.numerosDisponiveis.length === 0) {
        bingoGlobal.numeroSorteadoEl.textContent = 'FIM!';
        bingoGlobal.numeroSorteadoEl.style.background = 'linear-gradient(135deg, #ff5722, #f44336)';
        bingoGlobal.numeroSorteadoEl.style.animation = 'pulse 1s infinite';
        bingoGlobal.sortearBtn.disabled = true;
        bingoGlobal.sortearBtn.textContent = '🎉 Festa Acabou!';
        criarConfete();
        criarFogosArtificio();
        tocarSomFesta();
        return;
    }

    console.log(`📊 ${bingoGlobal.numerosDisponiveis.length} números disponíveis para sorteio`);

    // Animação de sorteio
    bingoGlobal.sortearBtn.disabled = true;
    bingoGlobal.sortearBtn.textContent = '🎲 Sorteando...';
    
    // Animar elementos da festa
    animarQuadrilha();
    tocarSomFesta();
    
    // Efeito de roleta
    let contador = 0;
    const roletaInterval = setInterval(() => {
        const numeroTemp = Math.floor(Math.random() * 75) + 1;
        bingoGlobal.numeroSorteadoEl.textContent = numeroTemp;
        bingoGlobal.numeroSorteadoEl.classList.add('animate');
        
        contador++;
        if (contador >= 15) {
            clearInterval(roletaInterval);
            
            // Sortear número real
            const randomIndex = Math.floor(Math.random() * bingoGlobal.numerosDisponiveis.length);
            const numero = bingoGlobal.numerosDisponiveis.splice(randomIndex, 1)[0];
            
            setTimeout(() => {
                bingoGlobal.numerosSorteados.push(numero);
                bingoGlobal.numeroSorteadoEl.textContent = numero;
                bingoGlobal.numeroSorteadoEl.classList.add('animate');
                
                console.log(`🎯 Número sorteado: ${numero}`);
                
                // Adicionar à lista com animação
                const li = document.createElement('li');
                li.textContent = numero;
                li.classList.add('novo');
                bingoGlobal.numerosAnterioresEl.appendChild(li);
                
                // Salvar dados no Firebase
                salvarNumeroNoFirebase(numero);
                
                // Atualizar contador
                atualizarContador();
                
                // Animar comidas
                animarComidas();
                
                // Remover classe de animação após um tempo
                setTimeout(() => {
                    li.classList.remove('novo');
                    bingoGlobal.numeroSorteadoEl.classList.remove('animate');
                }, 600);
                
                // Reabilitar botão
                bingoGlobal.sortearBtn.disabled = false;
                if (bingoGlobal.numerosDisponiveis.length > 0) {
                    bingoGlobal.sortearBtn.textContent = '🎯 Próximo Número';
                }
                
                // Confete para cada número
                criarConfetePequeno();
                
                // *** INTEGRAÇÃO SISTEMA DE PRÊMIOS DUPLOS ***
                // Verificar prêmios (QUINA e BINGO) em todas as cartelas vendidas
                setTimeout(async () => {
                    await verificarPremios(numero);
                }, 500);
                
                // Verificar status das cartelas locais após o sorteio
                setTimeout(() => {
                    verificarStatusCartelas();
                }, 1000); // Delay para permitir que o número seja processado
            }, 500);
        }
    }, 80);
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Bingo Arraiá INEC...');
    
    // Inicializar elementos DOM
    bingoGlobal.sortearBtn = document.getElementById('sortear-btn');
    bingoGlobal.numeroSorteadoEl = document.getElementById('numero-sorteado');
    bingoGlobal.numerosAnterioresEl = document.getElementById('numeros-anteriores');
    bingoGlobal.contadorEl = document.getElementById('contador-numeros');
    bingoGlobal.fogosEl = document.getElementById('fogos');

    // Verificar se todos os elementos foram encontrados
    if (!bingoGlobal.sortearBtn || !bingoGlobal.numeroSorteadoEl || !bingoGlobal.numerosAnterioresEl || !bingoGlobal.contadorEl) {
        console.error('❌ Elementos DOM não encontrados!');
        alert('Erro: Elementos da página não foram encontrados. Recarregue a página.');
        return;
    }
    
    console.log('✅ Elementos DOM encontrados');

    // Verificar conexão com Firebase
    console.log('🔥 Verificando conexão com Firebase...');
    const conexaoOk = await firebaseService.verificarConexao();
    if (!conexaoOk) {
        alert('❌ Erro de conexão com Firebase. Verifique sua conexão com a internet.');
        return;
    }

    async function carregarDados() {
        try {
            // Carregar configurações
            bingoGlobal.configuracoes = await firebaseService.carregarConfiguracoes();
            console.log('✅ Configurações carregadas:', bingoGlobal.configuracoes);
            
            // Carregar números sorteados
            bingoGlobal.numerosSorteados = await firebaseService.carregarNumerosSorteados();
            console.log('✅ Números sorteados carregados:', bingoGlobal.numerosSorteados.length);
            
            // Criar números disponíveis baseado nas configurações
            const numeroInicial = bingoGlobal.configuracoes.numeroInicial || 1;
            const numeroFinal = bingoGlobal.configuracoes.numeroFinal || 75;
            const todosNumeros = Array.from({ length: numeroFinal - numeroInicial + 1 }, (_, i) => i + numeroInicial);
            bingoGlobal.numerosDisponiveis = todosNumeros.filter(num => !bingoGlobal.numerosSorteados.includes(num));
            
            // Restaurar números sorteados na tela
            bingoGlobal.numerosAnterioresEl.innerHTML = '';
            bingoGlobal.numerosSorteados.forEach(numero => {
                const li = document.createElement('li');
                li.textContent = numero;
                bingoGlobal.numerosAnterioresEl.appendChild(li);
            });
            
            atualizarContador();
            
            // Configurar listeners em tempo real
            configurarListeners();
            
            // Configurar event listener do botão de sortear após carregar dados
            console.log('🔧 Configurando event listener do botão de sortear...');
            
            // Remover qualquer listener existente
            const novoBotao = bingoGlobal.sortearBtn.cloneNode(true);
            bingoGlobal.sortearBtn.parentNode.replaceChild(novoBotao, bingoGlobal.sortearBtn);
            bingoGlobal.sortearBtn = novoBotao;
            
            // Adicionar event listener
            bingoGlobal.sortearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🎯 BOTÃO CLICADO!');
                window.sortearNumero();
            });
            
            console.log('✅ Event listener configurado');
            
            // Habilitar botão se há números disponíveis
            if (bingoGlobal.numerosDisponiveis.length > 0) {
                bingoGlobal.sortearBtn.disabled = false;
                bingoGlobal.sortearBtn.textContent = '🎲 Sortear';
                console.log(`✅ Botão habilitado. ${bingoGlobal.numerosDisponiveis.length} números disponíveis.`);
            } else {
                bingoGlobal.sortearBtn.disabled = true;
                bingoGlobal.sortearBtn.textContent = '🎉 Fim do Jogo!';
                console.log('🎉 Jogo finalizado - todos os números foram sorteados.');
            }
            
            bingoGlobal.inicializado = true;
            console.log('✅ Inicialização concluída com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            alert('Erro ao carregar dados do Firebase. Tente recarregar a página.');
        }
    }

    // Configurar listeners em tempo real
    function configurarListeners() {
        // Escutar mudanças nos números sorteados
        firebaseService.escutarNumerosSorteados((numeros) => {
            if (JSON.stringify(numeros) !== JSON.stringify(bingoGlobal.numerosSorteados)) {
                console.log('🔄 Números sorteados atualizados em tempo real');
                bingoGlobal.numerosSorteados = numeros;
                
                // Atualizar números disponíveis
                const numeroInicial = bingoGlobal.configuracoes.numeroInicial || 1;
                const numeroFinal = bingoGlobal.configuracoes.numeroFinal || 75;
                const todosNumeros = Array.from({ length: numeroFinal - numeroInicial + 1 }, (_, i) => i + numeroInicial);
                bingoGlobal.numerosDisponiveis = todosNumeros.filter(num => !bingoGlobal.numerosSorteados.includes(num));
                
                // Atualizar interface
                atualizarInterfaceNumeros();
                atualizarContador();
                
                // Verificar prêmios automaticamente quando números são sincronizados
                if (bingoGlobal.numerosSorteados.length > 0) {
                    const ultimoNumero = bingoGlobal.numerosSorteados[bingoGlobal.numerosSorteados.length - 1];
                    setTimeout(async () => {
                        await verificarPremios(ultimoNumero);
                    }, 500);
                }
                
                // Verificar cartelas locais após mudança
                setTimeout(() => {
                    verificarStatusCartelas();
                }, 1000);
            }
        });
    }

    function atualizarInterfaceNumeros() {
        bingoGlobal.numerosAnterioresEl.innerHTML = '';
        bingoGlobal.numerosSorteados.forEach(numero => {
            const li = document.createElement('li');
            li.textContent = numero;
            bingoGlobal.numerosAnterioresEl.appendChild(li);
        });
    }

    // Sons de festa junina (simulados com vibração se disponível)
    function tocarSomFesta() {
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Tentar reproduzir som se disponível
        try {
            if (typeof Audio !== 'undefined') {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEgBSuCz/LZfiQAA');
                audio.volume = 0.4;
                audio.play().catch(() => console.log('Som não disponível'));
            }
        } catch (e) {
            console.log('Som de festa não disponível');
        }
    }

    // Confete especial para prêmios
    function criarConfete() {
        const elementosConfete = ['🏆', '🎉', '🎊', '✨', '🌟', '⭐', '🥇', '👑', '🎪', '🌽', '🔥', '🎈'];
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const confete = document.createElement('div');
                confete.className = 'confetti-premio';
                confete.style.position = 'fixed';
                confete.style.left = Math.random() * 100 + 'vw';
                confete.style.top = '-50px';
                confete.style.fontSize = Math.random() * 1.5 + 1.5 + 'em';
                confete.style.zIndex = '9999';
                confete.style.pointerEvents = 'none';
                confete.style.color = ['#FFD700', '#FF6B35', '#FF1744', '#00BCD4', '#4CAF50'][Math.floor(Math.random() * 5)];
                confete.style.animation = `confetti-fall ${Math.random() * 4 + 4}s linear forwards`;
                confete.textContent = elementosConfete[Math.floor(Math.random() * elementosConfete.length)];
                
                document.body.appendChild(confete);
                
                setTimeout(() => {
                    if (confete.parentNode) {
                        confete.remove();
                    }
                }, 8000);
            }, i * 60);
        }
    }

    // Fogos de artifício para BINGO
    function criarFogosArtificio() {
        const fogosEl = document.getElementById('fogos') || document.body;
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const fogo = document.createElement('div');
                fogo.style.position = 'fixed';
                fogo.style.left = Math.random() * 100 + 'vw';
                fogo.style.top = Math.random() * 50 + 'vh';
                fogo.style.fontSize = Math.random() * 2 + 2 + 'em';
                fogo.style.zIndex = '9998';
                fogo.style.pointerEvents = 'none';
                fogo.textContent = ['💥', '✨', '🎆', '🎇', '🌟', '⭐'][Math.floor(Math.random() * 6)];
                fogo.style.animation = 'explode 1.5s ease-out forwards';
                fogo.style.color = ['#FFD700', '#FF6B35', '#FF1744', '#9C27B0', '#00BCD4'][Math.floor(Math.random() * 5)];
                
                fogosEl.appendChild(fogo);
                
                setTimeout(() => {
                    if (fogo.parentNode) {
                        fogo.remove();
                    }
                }, 1500);
            }, i * 150);
        }
    }

    // Atualizar contador
    function atualizarContador() {
        bingoGlobal.contadorEl.textContent = bingoGlobal.numerosSorteados.length;
        if (bingoGlobal.numerosSorteados.length > 0) {
            bingoGlobal.contadorEl.style.animation = 'contador-pulsa 0.5s ease-out';
            setTimeout(() => {
                bingoGlobal.contadorEl.style.animation = '';
            }, 500);
        }
    }

    // Criar confetes temáticos
    function criarConfetePequeno() {
        const elementosConfete = ['🌽', '🎪', '🎈'];
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const confete = document.createElement('div');
                confete.className = 'confetti';
                confete.style.left = Math.random() * 100 + 'vw';
                confete.textContent = elementosConfete[Math.floor(Math.random() * elementosConfete.length)];
                confete.style.fontSize = '1.2em';
                confete.style.background = 'none';
                document.body.appendChild(confete);
                
                setTimeout(() => confete.remove(), 3000);
            }, i * 50);
        }
    }

    function verificarStatusCartelas() {
        const cartelas = JSON.parse(localStorage.getItem('bingo_cartelas') || '[]');
        const cartelasVendidas = cartelas.filter(c => c.vendida);
        
        if (cartelasVendidas.length === 0) return;
        
        const cartelasAnterioresArmadas = new Set(bingoGlobal.cartelasArmadas);
        const cartelasAnterioresBingo = new Set(bingoGlobal.cartelasBingo);
        
        bingoGlobal.cartelasArmadas.clear();
        bingoGlobal.cartelasBingo.clear();
        
        cartelasVendidas.forEach(cartela => {
            const numerosPreenchidos = contarNumerosPreenchidos(cartela);
            const cartelaId = cartela.id;
            
            if (numerosPreenchidos === 24) {
                // BINGO completo (24 números + 1 FREE = 25 total)
                bingoGlobal.cartelasBingo.add(cartelaId);
                
                // Mostrar alerta apenas se for novo BINGO
                if (!cartelasAnterioresBingo.has(cartelaId) && !bingoGlobal.alertasBingoMostrados.has(cartelaId)) {
                    mostrarAlertaBingo(cartela);
                    bingoGlobal.alertasBingoMostrados.add(cartelaId);
                }
            } else if (numerosPreenchidos === 23) {
                // Cartela armada (23 números preenchidos)
                bingoGlobal.cartelasArmadas.add(cartelaId);
                
                // Mostrar alerta apenas se for nova cartela armada
                if (!cartelasAnterioresArmadas.has(cartelaId)) {
                    mostrarAlertaArmada(cartela);
                }
            }
        });
    }

    function contarNumerosPreenchidos(cartela) {
        let preenchidos = 0;

        // Contar baseado na estrutura da cartela
        if (Array.isArray(cartela.numeros) && Array.isArray(cartela.numeros[0])) {
            // Formato matriz 5x5
            for (let col = 0; col < cartela.numeros.length; col++) {
                for (let row = 0; row < cartela.numeros[col].length; row++) {
                    const numero = cartela.numeros[col][row];
                    if (numero !== 'FREE' && !isNaN(numero) && bingoGlobal.numerosSorteados.includes(numero)) {
                        preenchidos++;
                    }
                }
            }
        } else {
            // Formato array simples
            const numeros = Array.isArray(cartela.numeros) ? cartela.numeros : [];
            numeros.forEach(numero => {
                if (numerosSorteados.includes(numero)) {
                    preenchidos++;
                }
            });
        }

        return preenchidos;
    }

    function mostrarAlertaArmada(cartela) {
        const alertaDiv = criarAlertaFlutuante('armada', {
            titulo: '⚠️ CARTELA ARMADA!',
            mensagem: `${cartela.comprador} está com cartela #${cartela.numero} ARMADA!\nApenas 1 número faltando para BINGO!`,
            comprador: cartela.comprador,
            telefone: cartela.telefone,
            cor: '#FF6B35'
        });
        
        // Auto remover após 10 segundos
        setTimeout(() => {
            if (alertaDiv && alertaDiv.parentNode) {
                alertaDiv.remove();
            }
        }, 10000);
        
        // Som de alerta (se disponível)
        reproducirSomAlerta();
    }

    function mostrarAlertaBingo(cartela) {
        const alertaDiv = criarAlertaFlutuante('bingo', {
            titulo: '🎉 BINGO! 🎉',
            mensagem: `PARABÉNS ${cartela.comprador}!\nCartela #${cartela.numero} fez BINGO!\nTodos os 24 números foram preenchidos!`,
            comprador: cartela.comprador,
            telefone: cartela.telefone,
            cor: '#FFD700'
        });
        
        // Auto remover após 20 segundos
        setTimeout(() => {
            if (alertaDiv && alertaDiv.parentNode) {
                alertaDiv.remove();
            }
        }, 20000);
        
        // Efeitos especiais
        criarConfeteBingo();
        reproducirSomVitoria();
        
        // Parar sorteio automaticamente se estiver em andamento
        if (sortearBtn && !sortearBtn.disabled) {
            console.log('🎉 BINGO detectado! Recomenda-se parar o sorteio para validação.');
        }
    }

    function criarAlertaFlutuante(tipo, dados) {
        const alertaDiv = document.createElement('div');
        alertaDiv.className = `alerta-flutuante alerta-${tipo}`;
        alertaDiv.innerHTML = `
            <div class="alerta-header">
                <h3>${dados.titulo}</h3>
                <button class="alerta-fechar" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="alerta-body">
                <p><strong>👤 ${dados.comprador}</strong></p>
                <p>📞 ${dados.telefone || 'N/A'}</p>
                <p>${dados.mensagem.replace(/\n/g, '<br>')}</p>
                <div class="alerta-timestamp">
                    📅 ${new Date().toLocaleString('pt-BR')}
                </div>
            </div>
        `;
        
        // Adicionar à página
        document.body.appendChild(alertaDiv);
        
        // Animação de entrada
        setTimeout(() => {
            alertaDiv.classList.add('alerta-show');
        }, 100);
        
        return alertaDiv;
    }

    function criarConfeteBingo() {
        const elementos = ['🎉', '🎊', '✨', '🎈', '🌟', '⭐', '🥳', '🎁', '🏆', '👑', '🎪', '🌽', '🔥'];
        
        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                const confete = document.createElement('div');
                confete.style.position = 'fixed';
                confete.style.left = Math.random() * 100 + 'vw';
                confete.style.top = '-50px';
                confete.style.fontSize = Math.random() * 2 + 1.5 + 'em';
                confete.style.zIndex = '9999';
                confete.style.pointerEvents = 'none';
                confete.style.animation = `confetti-fall ${Math.random() * 4 + 4}s linear forwards`;
                confete.textContent = elementos[Math.floor(Math.random() * elementos.length)];
                
                document.body.appendChild(confete);
                
                setTimeout(() => {
                    if (confete.parentNode) {
                        confete.remove();
                    }
                }, 8000);
            }, i * 80);
        }
    }

    function reproducirSomAlerta() {
        // Tentar reproduzir som de alerta
        try {
            if (typeof Audio !== 'undefined') {
                // Criar tom de alerta usando Web Audio API ou som simples
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEgBSuCz/LZfiQAA');
                audio.volume = 0.3;
                audio.play().catch(() => {});
            }
        } catch (e) {
            console.log('Som de alerta não disponível');
        }
    }

    function reproducirSomVitoria() {
        // Tentar reproduzir som de vitória
        try {
            if (typeof Audio !== 'undefined') {
                // Som de vitória mais elaborado
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEgBSuCz/LZfiQAA');
                audio.volume = 0.4;
                audio.play().catch(() => {});
            }
        } catch (e) {
            console.log('Som de vitória não disponível');
        }
    }

    // Carregar dados ao inicializar
    await carregarDados();
    
    console.log('✅ Bingo game loaded with alerts system');
});
