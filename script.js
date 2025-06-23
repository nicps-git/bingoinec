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
                
                // Verificar status das cartelas após o sorteio
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
                
                // Verificar cartelas após mudança
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
            navigator.vibrate([100, 50, 100, 50, 100]);
        }
    }

    // Criar fogos de artifício
    function criarFogosArtificio() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const fogo = document.createElement('div');
                fogo.style.position = 'absolute';
                fogo.style.left = Math.random() * 100 + '%';
                fogo.style.top = Math.random() * 50 + '%';
                fogo.style.fontSize = '2em';
                fogo.textContent = ['💥', '✨', '🎆', '🎇'][Math.floor(Math.random() * 4)];
                fogo.style.animation = 'explode 1s ease-out forwards';
                fogosEl.appendChild(fogo);
                
                setTimeout(() => fogo.remove(), 1000);
            }, i * 200);
        }
    }

    // Animar caipiras dançando
    function animarQuadrilha() {
        const caipiras = document.querySelectorAll('.caipira');
        caipiras.forEach((caipira, index) => {
            setTimeout(() => {
                caipira.style.animation = 'danca-festa 1s ease-in-out';
                setTimeout(() => {
                    caipira.style.animation = 'danca 2s ease-in-out infinite';
                }, 1000);
            }, index * 300);
        });
    }

    // Animar comidas
    function animarComidas() {
        const comidas = document.querySelectorAll('.comida');
        comidas.forEach((comida, index) => {
            setTimeout(() => {
                comida.style.animation = 'comida-festa 0.8s ease-out';
                setTimeout(() => {
                    comida.style.animation = 'delicia 3s ease-in-out infinite';
                }, 800);
            }, index * 150);
        });
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
    function criarConfete() {
        const elementosConfete = ['🌽', '🎪', '🎈', '⭐', '🎆', '🎇', '🔥', '🪗'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confete = document.createElement('div');
                confete.className = 'confetti';
                confete.style.left = Math.random() * 100 + 'vw';
                confete.style.animationDelay = Math.random() * 2 + 's';
                confete.textContent = elementosConfete[Math.floor(Math.random() * elementosConfete.length)];
                confete.style.fontSize = '1.5em';
                confete.style.background = 'none';
                document.body.appendChild(confete);
                
                setTimeout(() => confete.remove(), 3000);
            }, i * 100);
        }
    }

    // Função para salvar número sorteado no Firebase
    async function salvarNumeroNoFirebase(numero) {
        try {
            await firebaseService.salvarNumeroSorteado(numero);
            console.log(`✅ Número ${numero} salvo no Firebase`);
        } catch (error) {
            console.error(`❌ Erro ao salvar número ${numero}:`, error);
            // Não bloquear a interface em caso de erro de salvamento
        }
    }

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
