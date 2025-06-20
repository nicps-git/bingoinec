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

document.addEventListener('DOMContentLoaded', () => {
    const sortearBtn = document.getElementById('sortear-btn');
    const numeroSorteadoEl = document.getElementById('numero-sorteado');
    const numerosAnterioresEl = document.getElementById('numeros-anteriores');
    const contadorEl = document.getElementById('contador-numeros');
    const fogosEl = document.getElementById('fogos');

    // Estados das cartelas para alertas (sistema global)
    let cartelasArmadas = new Set(); // Cartelas com 23 números
    let cartelasBingo = new Set(); // Cartelas com BINGO
    let alertasBingoMostrados = new Set(); // Para evitar spam de alertas
    
    // Chaves para localStorage
    const STORAGE_KEYS = {
        numeroInicial: 'bingo_numero_inicial',
        numeroFinal: 'bingo_numero_final',
        numerosSorteados: 'bingo_numeros_sorteados',
        numerosDisponiveis: 'bingo_numeros_disponiveis'
    };

    let numerosSorteados = [];
    let numerosDisponiveis = [];

    // Carregar configurações e dados salvos
    function carregarDados() {
        const numeroInicial = parseInt(localStorage.getItem(STORAGE_KEYS.numeroInicial)) || 1;
        const numeroFinal = parseInt(localStorage.getItem(STORAGE_KEYS.numeroFinal)) || 75;
        
        // Carregar números sorteados
        numerosSorteados = JSON.parse(localStorage.getItem(STORAGE_KEYS.numerosSorteados) || '[]');
        
        // Carregar números disponíveis ou criar se não existir
        const numerosDisponiveisSalvos = localStorage.getItem(STORAGE_KEYS.numerosDisponiveis);
        if (numerosDisponiveisSalvos) {
            numerosDisponiveis = JSON.parse(numerosDisponiveisSalvos);
        } else {
            // Criar range baseado nas configurações
            numerosDisponiveis = Array.from({ length: numeroFinal - numeroInicial + 1 }, (_, i) => i + numeroInicial);
            localStorage.setItem(STORAGE_KEYS.numerosDisponiveis, JSON.stringify(numerosDisponiveis));
        }
        
        // Restaurar números sorteados na tela
        numerosSorteados.forEach(numero => {
            const li = document.createElement('li');
            li.textContent = numero;
            numerosAnterioresEl.appendChild(li);
        });
        
        atualizarContador();
    }

    // Salvar dados no localStorage
    function salvarDados() {
        localStorage.setItem(STORAGE_KEYS.numerosSorteados, JSON.stringify(numerosSorteados));
        localStorage.setItem(STORAGE_KEYS.numerosDisponiveis, JSON.stringify(numerosDisponiveis));
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
        contadorEl.textContent = numerosSorteados.length;
        if (numerosSorteados.length > 0) {
            contadorEl.style.animation = 'contador-pulsa 0.5s ease-out';
            setTimeout(() => {
                contadorEl.style.animation = '';
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

    function sortearNumero() {
        if (numerosDisponiveis.length === 0) {
            numeroSorteadoEl.textContent = 'FIM!';
            numeroSorteadoEl.style.background = 'linear-gradient(135deg, #ff5722, #f44336)';
            numeroSorteadoEl.style.animation = 'pulse 1s infinite';
            sortearBtn.disabled = true;
            sortearBtn.textContent = '🎉 Festa Acabou!';
            criarConfete();
            criarFogosArtificio();
            tocarSomFesta();
            return;
        }

        // Animação de sorteio
        sortearBtn.disabled = true;
        sortearBtn.textContent = '🎲 Sorteando...';
        
        // Animar elementos da festa
        animarQuadrilha();
        tocarSomFesta();
        
        // Efeito de roleta
        let contador = 0;
        const roletaInterval = setInterval(() => {
            const numeroTemp = Math.floor(Math.random() * 75) + 1;
            numeroSorteadoEl.textContent = numeroTemp;
            numeroSorteadoEl.classList.add('animate');
            
            contador++;
            if (contador >= 15) {
                clearInterval(roletaInterval);
                
                // Sortear número real
                const randomIndex = Math.floor(Math.random() * numerosDisponiveis.length);
                const numero = numerosDisponiveis.splice(randomIndex, 1)[0];
                
                setTimeout(() => {
                    numerosSorteados.push(numero);
                    numeroSorteadoEl.textContent = numero;
                    numeroSorteadoEl.classList.add('animate');
                    
                    // Adicionar à lista com animação
                    const li = document.createElement('li');
                    li.textContent = numero;
                    li.classList.add('novo');
                    numerosAnterioresEl.appendChild(li);
                    
                    // Salvar dados
                    salvarDados();
                    
                    // Atualizar contador
                    atualizarContador();
                    
                    // Animar comidas
                    animarComidas();
                    
                    // Remover classe de animação após um tempo
                    setTimeout(() => {
                        li.classList.remove('novo');
                        numeroSorteadoEl.classList.remove('animate');
                    }, 600);
                    
                    // Reabilitar botão
                    sortearBtn.disabled = false;
                    if (numerosDisponiveis.length > 0) {
                        sortearBtn.textContent = '🎯 Próximo Número';
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
        
        const cartelasAnterioresArmadas = new Set(cartelasArmadas);
        const cartelasAnterioresBingo = new Set(cartelasBingo);
        
        cartelasArmadas.clear();
        cartelasBingo.clear();
        
        cartelasVendidas.forEach(cartela => {
            const numerosPreenchidos = contarNumerosPreenchidos(cartela);
            const cartelaId = cartela.id;
            
            if (numerosPreenchidos === 24) {
                // BINGO completo (24 números + 1 FREE = 25 total)
                cartelasBingo.add(cartelaId);
                
                // Mostrar alerta apenas se for novo BINGO
                if (!cartelasAnterioresBingo.has(cartelaId) && !alertasBingoMostrados.has(cartelaId)) {
                    mostrarAlertaBingo(cartela);
                    alertasBingoMostrados.add(cartelaId);
                }
            } else if (numerosPreenchidos === 23) {
                // Cartela armada (23 números preenchidos)
                cartelasArmadas.add(cartelaId);
                
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
                    if (numero !== 'FREE' && !isNaN(numero) && numerosSorteados.includes(numero)) {
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
    carregarDados();
    
    // Event listener para o botão de sortear
    sortearBtn.addEventListener('click', sortearNumero);
    
    console.log('Bingo game loaded with alerts system');
});
