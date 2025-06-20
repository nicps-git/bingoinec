#!/bin/bash

echo "🧪 Teste Completo: Compra → Admin"
echo "================================="

echo "📋 Este teste irá:"
echo "1. Verificar se o servidor está rodando"
echo "2. Simular uma compra de cartela"
echo "3. Verificar se aparece no admin"
echo "4. Mostrar dados salvos"
echo ""

# Verificar se o servidor está rodando
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Servidor local rodando em http://localhost:8000"
else
    echo "❌ Servidor não está rodando. Iniciando servidor..."
    python3 -m http.server 8000 > /dev/null 2>&1 &
    SERVER_PID=$!
    echo "🌐 Servidor iniciado (PID: $SERVER_PID)"
    sleep 2
fi

echo ""
echo "🔗 Links para teste manual:"
echo "📱 Comprar cartela: http://localhost:8000/cartelas.html" 
echo "👨‍💼 Painel admin: http://localhost:8000/admin.html"
echo "🔍 Diagnóstico: http://localhost:8000/diagnostico-gravacao-compras.html"
echo ""

echo "📝 ROTEIRO DE TESTE:"
echo "==================="
echo ""

echo "PASSO 1: Comprar uma cartela"
echo "→ Abrir: http://localhost:8000/cartelas.html"
echo "→ Clicar em 'Gerar Preview'"
echo "→ Clicar em 'Comprar Cartela'"
echo "→ Clicar em 'Finalizar Compra'"
echo "→ Preencher formulário:"
echo "   - Nome: João Teste"
echo "   - Telefone: (85) 99999-9999"
echo "   - Email: joao@teste.com"
echo "→ Clicar em 'Finalizar Compra'"
echo "→ Verificar se aparece mensagem de sucesso"
echo ""

echo "PASSO 2: Verificar no admin"
echo "→ Abrir: http://localhost:8000/admin.html"
echo "→ Fazer login (se necessário): admin / admin123"
echo "→ Verificar se 'Cartelas Vendidas' mostra 1"
echo "→ Clicar em 'Ver Vendas'"
echo "→ Verificar se a cartela aparece na lista"
echo ""

echo "PASSO 3: Diagnóstico (se não funcionar)"
echo "→ Abrir: http://localhost:8000/diagnostico-gravacao-compras.html"
echo "→ Verificar conexão Firebase"
echo "→ Clicar em 'Listar Cartelas Firebase'"
echo "→ Clicar em 'Listar Cartelas localStorage'"
echo "→ Verificar onde estão os dados"
echo ""

echo "🔧 VERIFICAÇÕES AUTOMÁTICAS:"
echo "============================"

# Verificar se os arquivos estão presentes
echo "📁 Verificando arquivos principais..."
files=("cartelas.html" "admin.html" "cartelas.js" "admin.js" "firebase-service.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - FALTANDO"
    fi
done

echo ""
echo "🔥 Verificando configuração Firebase..."

# Verificar se firebase-config.js existe
if [ -f "firebase-config.js" ]; then
    echo "  ✅ firebase-config.js existe"
    
    # Verificar se contém as configurações básicas
    if grep -q "apiKey" firebase-config.js && grep -q "projectId" firebase-config.js; then
        echo "  ✅ Configurações Firebase presentes"
    else
        echo "  ❌ Configurações Firebase incompletas"
    fi
else
    echo "  ❌ firebase-config.js não encontrado"
fi

echo ""
echo "🗄️ Verificando dados locais..."

# Simular verificação de localStorage (através de um HTML temporário)
cat > verificar-localstorage.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Verificação localStorage</title></head>
<body>
<script>
const cartelas = JSON.parse(localStorage.getItem('bingo_cartelas_vendidas') || '[]');
const carrinho = JSON.parse(localStorage.getItem('bingo_carrinho') || '[]');
console.log('Cartelas vendidas:', cartelas.length);
console.log('Carrinho:', carrinho.length);
document.write(`<p>Cartelas vendidas: ${cartelas.length}</p>`);
document.write(`<p>Itens no carrinho: ${carrinho.length}</p>`);
if (cartelas.length > 0) {
    document.write('<h3>Última cartela:</h3>');
    const ultima = cartelas[cartelas.length - 1];
    document.write(`<p>Comprador: ${ultima.comprador || 'Não informado'}</p>`);
    document.write(`<p>Telefone: ${ultima.telefone || 'Não informado'}</p>`);
    document.write(`<p>Data: ${ultima.dataVenda || ultima.timestamp || 'Não informada'}</p>`);
}
</script>
</body>
</html>
EOF

echo "  📄 Arquivo de verificação criado: verificar-localstorage.html"
echo "  🔗 Abrir: http://localhost:8000/verificar-localstorage.html"

echo ""
echo "⚠️  POSSÍVEIS PROBLEMAS E SOLUÇÕES:"
echo "==================================="
echo ""

echo "PROBLEMA: Cartela não aparece no admin"
echo "SOLUÇÕES:"
echo "→ Verificar console do navegador por erros"
echo "→ Verificar se Firebase está conectado"
echo "→ Verificar se as regras do Firestore permitem leitura/escrita"
echo "→ Verificar se o admin está lendo do localStorage também"
echo ""

echo "PROBLEMA: Erro 'Permission denied'"
echo "SOLUÇÃO:"
echo "→ Executar: firebase deploy --only firestore:rules"
echo "→ Verificar regras em firestore.rules"
echo ""

echo "PROBLEMA: Dados apenas no localStorage"
echo "SOLUÇÕES:"
echo "→ Verificar conexão com internet"
echo "→ Verificar configuração Firebase"
echo "→ Verificar se firebaseService.js está carregado"
echo ""

echo "✅ TESTE PREPARADO!"
echo "==================="
echo "Agora siga os passos do roteiro para testar o sistema completo."
echo ""
echo "💡 Dica: Abra as páginas em abas separadas e use F12 para ver o console."
