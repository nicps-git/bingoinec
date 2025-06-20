// ===== SISTEMA DE ACOMPANHAMENTO DE CARTELAS =====

// Função global para verificar acesso admin
function verificarAcessoAdmin() {
    if (window.bingoAuth && window.bingoAuth.isAuthenticated()) {
        window.location.href = 'admin.html';
    } else {
        if (confirm('Para acessar a área administrativa, é necessário fazer login. Deseja ir para a página de login?')) {
            window.location.href = 'login.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos do DOM
    const loginComprador = document.getElementById('login-comprador');
    const areaCartelas = document.getElementById('area-cartelas');
    const formConsulta = document.getElementById('form-consulta');
    const telefoneInput = document.getElementById('consulta-telefone');
    const emailInput = document.getElementById('consulta-email');
    const alertMsg = document.getElementById('alert-msg');

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

    // Verificar conexão com Firebase
    console.log('🔥 Verificando conexão com Firebase...');
    const conexaoOk = await firebaseService.verificarConexao();
    if (!conexaoOk) {
        alert('❌ Erro de conexão com Firebase. Verifique sua conexão com a internet.');
        return;
    }

    // ===== FUNÇÕES PRINCIPAIS =====

    // Fazer login do comprador
    async function fazerLogin() {
        try {
            const telefone = telefoneInput.value.trim();
            const email = emailInput.value.trim();

            if (!telefone && !email) {
                mostrarAlerta('⚠️ Informe pelo menos o telefone ou email.', 'warning');
                return;
            }

            mostrarAlerta('🔍 Buscando suas cartelas...', 'info');

            // Buscar cartelas no Firebase
            const cartelas = await firebaseService.carregarCartelasPorComprador(telefone, email);

            if (!cartelas || cartelas.length === 0) {
                mostrarAlerta('❌ Nenhuma cartela encontrada com estes dados.', 'error');
                return;
            }

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

            mostrarAreaCartelas();
            configurarListenersSorteio();
            atualizarCartelas();

            mostrarAlerta('✅ Login realizado com sucesso!', 'success');

        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);
            mostrarAlerta('❌ Erro ao buscar cartelas. Tente novamente.', 'error');
        }
    }

    // Mostrar área das cartelas
    function mostrarAreaCartelas() {
        loginComprador.style.display = 'none';
        areaCartelas.style.display = 'block';

        // Preencher informações do comprador
        nomeCompradorSpan.textContent = compradorAtual.nome;
        telefoneCompradorSpan.textContent = compradorAtual.telefone;
        emailCompradorSpan.textContent = compradorAtual.email || 'Não informado';
        totalCartelasSpan.textContent = cartelasComprador.length;
    }

    // Configurar listeners para atualizações em tempo real
    function configurarListenersSorteio() {
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
        listaCartelasComprador.innerHTML = '';

        cartelasComprador.forEach((cartela, index) => {
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

    // ===== EVENT LISTENERS =====
    
    // Submit do formulário de consulta
    formConsulta.addEventListener('submit', (e) => {
        e.preventDefault();
        fazerLogin();
    });

    // Botão sair
    document.getElementById('sair-btn').addEventListener('click', sair);

    // Fechar modal de BINGO
    document.querySelector('.modal .close').addEventListener('click', () => {
        modalBingo.style.display = 'none';
    });

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

    console.log('✅ Sistema de acompanhamento carregado com Firebase');
});
