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

    sortearBtn.addEventListener('click', sortearNumero);

    numeroSorteadoEl.textContent = '?';
    
    // Carregar dados salvos
    carregarDados();
    
    // Adicionar estilos extras dinamicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        @keyframes explode {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            100% { transform: scale(2) rotate(360deg); opacity: 0; }
        }
        
        @keyframes danca-festa {
            0% { transform: translateY(0) rotate(0deg) scale(1); }
            50% { transform: translateY(-20px) rotate(180deg) scale(1.3); }
            100% { transform: translateY(0) rotate(360deg) scale(1); }
        }
        
        @keyframes comida-festa {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.5) rotate(180deg); }
            100% { transform: scale(1) rotate(360deg); }
        }
        
        @keyframes contador-pulsa {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Bingo game loaded');
});
