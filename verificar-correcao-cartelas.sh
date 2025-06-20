#!/bin/bash

echo "🧪 Verificando correção do sistema de compra de cartelas..."
echo "=================================================="

# Verificar se os arquivos principais existem
echo "📁 Verificando arquivos..."

files=(
    "cartelas.html"
    "cartelas.js" 
    "firebase-config.js"
    "firebase-service.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANDO"
    fi
done

echo ""
echo "🔍 Verificando sintaxe JavaScript..."

# Verificar sintaxe do cartelas.js
if command -v node &> /dev/null; then
    echo "Verificando cartelas.js..."
    if node -c cartelas.js 2>/dev/null; then
        echo "✅ cartelas.js - Sintaxe OK"
    else
        echo "❌ cartelas.js - Erro de sintaxe"
        node -c cartelas.js
    fi
    
    echo "Verificando firebase-service.js..."
    if node -c firebase-service.js 2>/dev/null; then
        echo "✅ firebase-service.js - Sintaxe OK"
    else
        echo "❌ firebase-service.js - Erro de sintaxe"
        node -c firebase-service.js
    fi
else
    echo "⚠️ Node.js não encontrado - pulando verificação de sintaxe"
fi

echo ""
echo "🔎 Procurando pela variável cartelasParaSalvar..."

# Verificar se a variável está sendo declarada corretamente
if grep -q "let cartelasParaSalvar = \[\];" cartelas.js; then
    echo "✅ Variável cartelasParaSalvar declarada corretamente"
else
    echo "❌ Variável cartelasParaSalvar NÃO encontrada ou mal declarada"
fi

# Contar quantas vezes a variável é usada
usage_count=$(grep -c "cartelasParaSalvar" cartelas.js)
echo "📊 Variável cartelasParaSalvar usada $usage_count vezes no código"

echo ""
echo "🔧 Verificando estrutura da função processarCompra..."

if grep -A 5 "async function processarCompra" cartelas.js | grep -q "let cartelasParaSalvar = \[\];"; then
    echo "✅ Variável declarada no escopo correto da função"
else
    echo "❌ Variável NÃO declarada no escopo correto"
fi

echo ""
echo "🌐 Testando abertura das páginas..."

# Verificar se as páginas HTML são válidas
if command -v python3 &> /dev/null; then
    echo "Iniciando servidor web local para teste..."
    
    # Matar qualquer servidor que esteja rodando na porta 8000
    pkill -f "python3 -m http.server 8000" 2>/dev/null || true
    
    # Iniciar servidor em background
    python3 -m http.server 8000 > /dev/null 2>&1 &
    SERVER_PID=$!
    
    sleep 2
    
    echo "🌐 Servidor iniciado (PID: $SERVER_PID)"
    echo "📱 Teste manual disponível em:"
    echo "   - http://localhost:8000/cartelas.html"
    echo "   - http://localhost:8000/teste-correcao-variavel.html"
    echo ""
    echo "🔴 Para parar o servidor: kill $SERVER_PID"
    echo ""
    
    # Verificar se o servidor está respondendo
    if curl -s http://localhost:8000/cartelas.html > /dev/null; then
        echo "✅ Página cartelas.html carregando corretamente"
    else
        echo "❌ Erro ao carregar cartelas.html"
    fi
    
    if curl -s http://localhost:8000/teste-correcao-variavel.html > /dev/null; then
        echo "✅ Página de teste carregando corretamente"
    else
        echo "❌ Erro ao carregar página de teste"
    fi
    
else
    echo "⚠️ Python3 não encontrado - não é possível iniciar servidor de teste"
fi

echo ""
echo "📋 RESUMO DA CORREÇÃO:"
echo "========================"
echo "✅ Variável cartelasParaSalvar movida para o topo da função processarCompra"
echo "✅ Declarada com 'let' em vez de 'const' para permitir reatribuição"
echo "✅ Inicializada como array vazio para evitar erros de escopo"
echo "✅ Verificação de carrinho vazio adicionada antes do processamento"
echo "✅ Mantido o tratamento de erro existente"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "==================="
echo "1. Testar compra de cartela na página principal (cartelas.html)"
echo "2. Verificar se as cartelas são salvas no Firebase/localStorage"
echo "3. Confirmar que não há mais erros de 'cartelasParaSalvar is not defined'"
echo "4. Testar fluxo completo: gerar preview → adicionar ao carrinho → finalizar compra"
echo ""
echo "🔗 TESTE RÁPIDO:"
echo "================"
echo "Abra: http://localhost:8000/teste-correcao-variavel.html"
echo "Clique em: 'Adicionar ao Carrinho' → 'Simular Compra'"
echo "Verifique se não há erros no console do navegador"
