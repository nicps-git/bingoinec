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

document.addEventListener('DOMContentLoaded', () => {
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

    // Chaves para localStorage
    const STORAGE_KEYS = {
        cartelas: 'bingo_cartelas',
        numerosSorteados: 'bingo_numeros_sorteados',
        compradorLogado: 'bingo_comprador_logado',
        marcacoes: 'bingo_marcacoes_comprador'
    };

    let compradorAtual = null;
    let cartelasComprador = [];
    let numerosSorteados = [];
    let marcacoes = {};

    // Inicialização
    function inicializar() {
        verificarCompradorLogado();
        setupEventListeners();
        aplicarMascaraTelefone();
        
        console.log('Sistema de acompanhamento de cartelas carregado');
    }

    function verificarCompradorLogado() {
        const compradorSalvo = localStorage.getItem(STORAGE_KEYS.compradorLogado);
        if (compradorSalvo) {
            try {
                compradorAtual = JSON.parse(compradorSalvo);
                carregarAreaCartelas();
            } catch (error) {
                console.error('Erro ao carregar comprador salvo:', error);
                localStorage.removeItem(STORAGE_KEYS.compradorLogado);
            }
        }
    }

    function setupEventListeners() {
        formConsulta.addEventListener('submit', buscarCartelas);
        
        // Limpar campos quando focar no outro
        telefoneInput.addEventListener('focus', () => {
            emailInput.value = '';
        });
        
        emailInput.addEventListener('focus', () => {
            telefoneInput.value = '';
        });
    }

    function aplicarMascaraTelefone() {
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value.replace(/(\d{0,2})/, '($1');
                } else if (value.length <= 7) {
                    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
            }
            
            e.target.value = value;
        });
    }

    function buscarCartelas(event) {
        event.preventDefault();
        
        const telefone = telefoneInput.value.trim();
        const email = emailInput.value.trim();
        
        if (!telefone && !email) {
            mostrarAlert('Por favor, digite seu telefone ou e-mail para consultar suas cartelas.');
            return;
        }

        const cartelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.cartelas) || '[]');
        const cartelasEncontradas = cartelas.filter(cartela => {
            if (telefone) {
                const telefoneCartela = cartela.telefone ? cartela.telefone.replace(/\D/g, '') : '';
                const telefoneConsulta = telefone.replace(/\D/g, '');
                return telefoneCartela === telefoneConsulta;
            }
            if (email) {
                return cartela.email && cartela.email.toLowerCase() === email.toLowerCase();
            }
            return false;
        });

        if (cartelasEncontradas.length === 0) {
            mostrarAlert('Nenhuma cartela encontrada com os dados informados. Verifique se você digitou corretamente o telefone ou e-mail usado na compra.');
            return;
        }

        // Salvar comprador logado
        compradorAtual = {
            nome: cartelasEncontradas[0].comprador,
            telefone: cartelasEncontradas[0].telefone,
            email: cartelasEncontradas[0].email || 'Não informado',
            loginTime: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.compradorLogado, JSON.stringify(compradorAtual));
        cartelasComprador = cartelasEncontradas;
        
        carregarAreaCartelas();
    }

    function carregarAreaCartelas() {
        if (!compradorAtual) return;

        // Ocultar login e mostrar área de cartelas
        loginComprador.style.display = 'none';
        areaCartelas.style.display = 'block';

        // Atualizar informações do comprador
        nomeCompradorSpan.textContent = compradorAtual.nome;
        telefoneCompradorSpan.textContent = `📱 ${compradorAtual.telefone}`;
        emailCompradorSpan.textContent = `📧 ${compradorAtual.email}`;
        totalCartelasSpan.textContent = `🎫 ${cartelasComprador.length} cartela(s)`;

        // Carregar dados do sorteio
        carregarDadosSorteio();
        
        // Carregar marcações salvas
        carregarMarcacoes();
        
        // Renderizar cartelas
        renderizarCartelas();
    }

    function carregarDadosSorteio() {
        numerosSorteados = JSON.parse(localStorage.getItem(STORAGE_KEYS.numerosSorteados) || '[]');
        atualizarStatusSorteio();
    }

    function atualizarStatusSorteio() {
        if (numerosSorteados.length === 0) {
            ultimoNumeroSpan.textContent = '-';
            totalSorteadosSpan.textContent = '0';
            numerosSorteadosLista.innerHTML = 'Nenhum número sorteado ainda';
        } else {
            const ultimoNumero = numerosSorteados[numerosSorteados.length - 1];
            ultimoNumeroSpan.textContent = ultimoNumero;
            totalSorteadosSpan.textContent = numerosSorteados.length;
            
            // Renderizar lista de números sorteados
            numerosSorteadosLista.innerHTML = '';
            numerosSorteados.forEach(numero => {
                const span = document.createElement('span');
                span.className = 'numero-sorteado';
                span.textContent = numero;
                numerosSorteadosLista.appendChild(span);
            });
        }
    }

    function carregarMarcacoes() {
        const marcacoesSalvas = localStorage.getItem(STORAGE_KEYS.marcacoes);
        if (marcacoesSalvas) {
            try {
                marcacoes = JSON.parse(marcacoesSalvas);
            } catch (error) {
                console.error('Erro ao carregar marcações:', error);
                marcacoes = {};
            }
        }
    }

    function salvarMarcacoes() {
        localStorage.setItem(STORAGE_KEYS.marcacoes, JSON.stringify(marcacoes));
    }

    function renderizarCartelas() {
        listaCartelasComprador.innerHTML = '';

        cartelasComprador.forEach((cartela, index) => {
            const cartelaDiv = document.createElement('div');
            cartelaDiv.className = 'cartela-comprador';
            cartelaDiv.id = `cartela-${cartela.id}`;

            // Verificar se é BINGO
            const isBingo = verificarBingoCartela(cartela);
            if (isBingo) {
                cartelaDiv.classList.add('cartela-bingo-vencedora');
            }

            cartelaDiv.innerHTML = `
                <div class="cartela-header">
                    <div class="cartela-numero">🎫 Cartela #${cartela.numero || index + 1}</div>
                    ${isBingo ? '<div class="bingo-indicator">🎉 BINGO! 🎉</div>' : ''}
                </div>
                <div class="cartela-visual" data-cartela-id="${cartela.id}">
                    ${renderizarCartelaVisual(cartela)}
                </div>
                <div class="cartela-stats">
                    <span>📅 Comprada em: ${new Date(cartela.dataVenda).toLocaleDateString('pt-BR')}</span>
                    <span>✅ Números marcados: <span id="marcados-${cartela.id}">0</span>/${contarNumerosCartela(cartela)}</span>
                </div>
            `;

            listaCartelasComprador.appendChild(cartelaDiv);
            
            // Adicionar event listeners aos números
            const numerosCartela = cartelaDiv.querySelectorAll('.numero-cell');
            numerosCartela.forEach(numeroEl => {
                const numero = parseInt(numeroEl.dataset.numero);
                if (!isNaN(numero)) {
                    numeroEl.addEventListener('click', () => {
                        toggleMarcacao(cartela.id, numero);
                    });
                }
            });

            // Atualizar contador de marcados
            atualizarContadorMarcados(cartela.id);
        });
    }

    function renderizarCartelaVisual(cartela) {
        // Criar estrutura visual de BINGO (5x5)
        let html = `
            <div class="cartela-bingo-visual">
                <div class="bingo-header">
                    <div class="bingo-letter">B</div>
                    <div class="bingo-letter">I</div>
                    <div class="bingo-letter">N</div>
                    <div class="bingo-letter">G</div>
                    <div class="bingo-letter">O</div>
                </div>
                <div class="bingo-grid">
        `;

        // Se a cartela tem números em formato de matriz (5x5)
        if (Array.isArray(cartela.numeros) && Array.isArray(cartela.numeros[0])) {
            // Formato matriz 5x5
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    const numero = cartela.numeros[col][row];
                    const isCenter = col === 2 && row === 2;
                    const isFree = numero === 'FREE' || isCenter;
                    const cartelaId = cartela.id;
                    const isSorteado = !isFree && numerosSorteados.includes(numero);
                    const isMarcado = !isFree && marcacoes[cartelaId] && marcacoes[cartelaId].includes(numero);
                    
                    let classes = 'numero-cell';
                    if (isFree) classes += ' free-space';
                    if (isSorteado) classes += ' sorteado';
                    if (isMarcado) classes += ' marcado';
                    
                    html += `<div class="${classes}" data-numero="${isFree ? 'FREE' : numero}">
                        ${isFree ? '★' : numero}
                    </div>`;
                }
            }
        } else {
            // Formato array simples - converter para 5x5
            const numeros = Array.isArray(cartela.numeros) ? cartela.numeros : [];
            let numeroIndex = 0;
            
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    const isCenter = col === 2 && row === 2;
                    const numero = isCenter ? 'FREE' : numeros[numeroIndex++];
                    const isFree = isCenter;
                    const cartelaId = cartela.id;
                    const isSorteado = !isFree && numero && numerosSorteados.includes(numero);
                    const isMarcado = !isFree && numero && marcacoes[cartelaId] && marcacoes[cartelaId].includes(numero);
                    
                    let classes = 'numero-cell';
                    if (isFree) classes += ' free-space';
                    if (isSorteado) classes += ' sorteado';
                    if (isMarcado) classes += ' marcado';
                    
                    html += `<div class="${classes}" data-numero="${isFree ? 'FREE' : numero || ''}">
                        ${isFree ? '★' : numero || ''}
                    </div>`;
                }
            }
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    function contarNumerosCartela(cartela) {
        if (Array.isArray(cartela.numeros) && Array.isArray(cartela.numeros[0])) {
            // Formato matriz 5x5 - contar números válidos (excluindo FREE)
            let count = 0;
            for (let col = 0; col < cartela.numeros.length; col++) {
                for (let row = 0; row < cartela.numeros[col].length; row++) {
                    const numero = cartela.numeros[col][row];
                    if (numero !== 'FREE' && !isNaN(numero)) {
                        count++;
                    }
                }
            }
            return count;
        } else {
            // Formato array simples
            return Array.isArray(cartela.numeros) ? cartela.numeros.length : 24; // 25 - 1 FREE space
        }
    }

    function toggleMarcacao(cartelaId, numero) {
        if (!marcacoes[cartelaId]) {
            marcacoes[cartelaId] = [];
        }

        const index = marcacoes[cartelaId].indexOf(numero);
        if (index > -1) {
            marcacoes[cartelaId].splice(index, 1);
        } else {
            marcacoes[cartelaId].push(numero);
        }

        salvarMarcacoes();
        atualizarNumeroVisual(cartelaId, numero);
        atualizarContadorMarcados(cartelaId);
        
        // Verificar se fez BINGO
        const cartela = cartelasComprador.find(c => c.id === cartelaId);
        if (cartela && verificarBingoCartela(cartela)) {
            mostrarModalBingo(cartela);
        }
    }

    function atualizarNumeroVisual(cartelaId, numero) {
        const numeroEl = document.querySelector(`[data-cartela-id="${cartelaId}"] [data-numero="${numero}"]`);
        if (numeroEl) {
            const isMarcado = marcacoes[cartelaId] && marcacoes[cartelaId].includes(numero);
            if (isMarcado) {
                numeroEl.classList.add('marcado');
            } else {
                numeroEl.classList.remove('marcado');
            }
        }
    }

    function atualizarContadorMarcados(cartelaId) {
        const contador = document.getElementById(`marcados-${cartelaId}`);
        if (contador) {
            const totalMarcados = marcacoes[cartelaId] ? marcacoes[cartelaId].length : 0;
            contador.textContent = totalMarcados;
        }
    }

    function verificarBingoCartela(cartela) {
        if (!marcacoes[cartela.id] && numerosSorteados.length === 0) return false;
        
        const marcadosCartela = marcacoes[cartela.id] || [];
        let numerosVerificar = [];
        
        // Coletar todos os números da cartela (exceto FREE)
        if (Array.isArray(cartela.numeros) && Array.isArray(cartela.numeros[0])) {
            // Formato matriz 5x5
            for (let col = 0; col < cartela.numeros.length; col++) {
                for (let row = 0; row < cartela.numeros[col].length; row++) {
                    const numero = cartela.numeros[col][row];
                    if (numero !== 'FREE' && !isNaN(numero)) {
                        numerosVerificar.push(numero);
                    }
                }
            }
        } else {
            // Formato array simples
            numerosVerificar = Array.isArray(cartela.numeros) ? cartela.numeros : [];
        }
        
        // Verificar se todos os números foram sorteados OU marcados manualmente
        return numerosVerificar.every(numero => 
            numerosSorteados.includes(numero) || marcadosCartela.includes(numero)
        );
    }

    function mostrarModalBingo(cartela) {
        cartelaBingoInfo.innerHTML = `
            <h3>🎫 Cartela #${cartela.numero}</h3>
            <p><strong>Parabéns, ${compradorAtual.nome}!</strong></p>
            <p>Você completou todos os números da cartela!</p>
            <div style="margin: 15px 0; padding: 15px; background: rgba(255,215,0,0.2); border-radius: 10px;">
                <strong>📞 Procure imediatamente a organização do evento para validar seu BINGO!</strong>
            </div>
        `;
        modalBingo.style.display = 'flex';
        
        // Adicionar classe de BINGO à cartela
        const cartelaDiv = document.getElementById(`cartela-${cartela.id}`);
        if (cartelaDiv) {
            cartelaDiv.classList.add('cartela-bingo');
        }
        
        // Efeito sonoro ou vibração (se disponível)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    // Funções públicas (acessíveis via onclick)
    window.fazerLogout = function() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem(STORAGE_KEYS.compradorLogado);
            localStorage.removeItem(STORAGE_KEYS.marcacoes);
            compradorAtual = null;
            cartelasComprador = [];
            marcacoes = {};
            
            loginComprador.style.display = 'block';
            areaCartelas.style.display = 'none';
            
            // Limpar formulário
            formConsulta.reset();
        }
    };

    window.atualizarSorteio = function() {
        carregarDadosSorteio();
        renderizarCartelas();
        mostrarAlert('Dados do sorteio atualizados!');
    };

    window.marcarTodosNumeros = function() {
        cartelasComprador.forEach(cartela => {
            let numerosSorteadosNaCartela = [];
            
            // Coletar números sorteados baseado na estrutura da cartela
            if (Array.isArray(cartela.numeros) && Array.isArray(cartela.numeros[0])) {
                // Formato matriz 5x5
                for (let col = 0; col < cartela.numeros.length; col++) {
                    for (let row = 0; row < cartela.numeros[col].length; row++) {
                        const numero = cartela.numeros[col][row];
                        if (numero !== 'FREE' && numerosSorteados.includes(numero)) {
                            numerosSorteadosNaCartela.push(numero);
                        }
                    }
                }
            } else {
                // Formato array simples
                numerosSorteadosNaCartela = cartela.numeros.filter(numero => 
                    numerosSorteados.includes(numero)
                );
            }
            
            if (!marcacoes[cartela.id]) {
                marcacoes[cartela.id] = [];
            }
            
            numerosSorteadosNaCartela.forEach(numero => {
                if (!marcacoes[cartela.id].includes(numero)) {
                    marcacoes[cartela.id].push(numero);
                }
            });
        });
        
        salvarMarcacoes();
        renderizarCartelas();
        mostrarAlert('Todos os números sorteados foram marcados nas suas cartelas!');
    };

    window.limparMarcacoes = function() {
        if (confirm('Tem certeza que deseja limpar todas as marcações das suas cartelas?')) {
            marcacoes = {};
            salvarMarcacoes();
            renderizarCartelas();
            mostrarAlert('Todas as marcações foram removidas!');
        }
    };

    window.verificarBingo = function() {
        const cartelasBingo = cartelasComprador.filter(cartela => verificarBingoCartela(cartela));
        
        if (cartelasBingo.length > 0) {
            let mensagem = `🎉 Parabéns! Você fez BINGO em ${cartelasBingo.length} cartela(s):\n\n`;
            cartelasBingo.forEach(cartela => {
                mensagem += `🎫 Cartela #${cartela.numero}\n`;
            });
            mensagem += '\n📞 Procure imediatamente a organização do evento para validar!';
            
            alert(mensagem);
        } else {
            mostrarAlert('Ainda não há BINGO em nenhuma das suas cartelas. Continue acompanhando o sorteio!');
        }
    };

    window.fecharModalBingo = function() {
        modalBingo.style.display = 'none';
    };

    window.fecharAlert = function() {
        alertMsg.style.display = 'none';
    };

    function mostrarAlert(mensagem) {
        const alertMessage = alertMsg.querySelector('.alert-message');
        alertMessage.textContent = mensagem;
        alertMsg.style.display = 'flex';
        
        // Auto fechar após 5 segundos
        setTimeout(() => {
            alertMsg.style.display = 'none';
        }, 5000);
    }

    // Inicializar quando a página carregar
    inicializar();

    // Atualizar automaticamente a cada 30 segundos
    setInterval(() => {
        if (compradorAtual && areaCartelas.style.display !== 'none') {
            carregarDadosSorteio();
            
            // Re-renderizar apenas se houver novos números sorteados
            const ultimoTotal = document.getElementById('total-sorteados').textContent;
            if (parseInt(ultimoTotal) !== numerosSorteados.length) {
                renderizarCartelas();
            }
        }
    }, 30000);

    console.log('Sistema de minhas cartelas carregado com sucesso');
});
