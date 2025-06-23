#!/bin/bash

echo "🎲 Teste do Botão de Sorteio - Bingo Arraiá INEC"
echo "=============================================="
echo ""

# Verificar se os arquivos existem
echo "📁 Verificando arquivos necessários..."

files=(
    "index.html"
    "script.js"
    "firebase-config-unified.js"
    "firebase-service.js"
    "styles.css"
)

missing_files=0
for file in "${files[@]}"; do
    if [ -f "/home/nicps/Documents/Projetos/Bingo/$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - AUSENTE"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    echo ""
    echo "❌ $missing_files arquivo(s) ausente(s). Verifique a estrutura do projeto."
    exit 1
fi

echo ""
echo "📋 Verificando sintaxe do JavaScript..."

# Verificar sintaxe do script.js
if node -c "/home/nicps/Documents/Projetos/Bingo/script.js" 2>/dev/null; then
    echo "✅ script.js - Sintaxe OK"
else
    echo "❌ script.js - Erro de sintaxe"
    node -c "/home/nicps/Documents/Projetos/Bingo/script.js"
    exit 1
fi

# Verificar sintaxe do firebase-config-unified.js
if node -c "/home/nicps/Documents/Projetos/Bingo/firebase-config-unified.js" 2>/dev/null; then
    echo "✅ firebase-config-unified.js - Sintaxe OK"
else
    echo "❌ firebase-config-unified.js - Erro de sintaxe"
    node -c "/home/nicps/Documents/Projetos/Bingo/firebase-config-unified.js"
    exit 1
fi

# Verificar sintaxe do firebase-service.js
if node -c "/home/nicps/Documents/Projetos/Bingo/firebase-service.js" 2>/dev/null; then
    echo "✅ firebase-service.js - Sintaxe OK"
else
    echo "❌ firebase-service.js - Erro de sintaxe"
    node -c "/home/nicps/Documents/Projetos/Bingo/firebase-service.js"
    exit 1
fi

echo ""
echo "🔍 Verificando correções implementadas..."

# Verificar se a função salvarDados foi substituída
if grep -q "salvarNumeroNoFirebase" "/home/nicps/Documents/Projetos/Bingo/script.js"; then
    echo "✅ Função salvarNumeroNoFirebase - Implementada"
else
    echo "❌ Função salvarNumeroNoFirebase - NÃO encontrada"
fi

# Verificar se o event listener foi movido para carregarDados
if grep -A 10 "configurarListeners();" "/home/nicps/Documents/Projetos/Bingo/script.js" | grep -q "addEventListener.*sortearNumero"; then
    echo "✅ Event listener do botão - Movido para carregarDados()"
else
    echo "⚠️  Event listener do botão - Verificar posicionamento"
fi

# Verificar se não há duplicação de event listeners
listener_count=$(grep -c "addEventListener.*sortearNumero" "/home/nicps/Documents/Projetos/Bingo/script.js")
if [ "$listener_count" -eq 1 ]; then
    echo "✅ Event listener único - OK"
else
    echo "⚠️  Event listeners duplicados encontrados: $listener_count"
fi

echo ""
echo "📊 Resumo das correções implementadas:"
echo "  🔧 Substituída função salvarDados() inexistente por salvarNumeroNoFirebase()"
echo "  🔧 Movido event listener para após carregamento dos dados"
echo "  🔧 Removida duplicação de event listeners"
echo "  🔧 Adicionado aguardo (await) para carregarDados()"

echo ""
echo "✅ Verificação concluída!"
echo ""
echo "🎮 Para testar o botão de sorteio:"
echo "   1. Abra file:///home/nicps/Documents/Projetos/Bingo/index.html"
echo "   2. Aguarde a inicialização do Firebase"
echo "   3. Clique no botão '🎲 Sortear'"
echo ""
echo "🔗 Links de teste:"
echo "   - Página principal: file:///home/nicps/Documents/Projetos/Bingo/index.html"
echo "   - Teste direto: file:///home/nicps/Documents/Projetos/Bingo/teste-direto-sorteio.html"
echo "   - Teste completo: file:///home/nicps/Documents/Projetos/Bingo/teste-botao-sorteio.html"
