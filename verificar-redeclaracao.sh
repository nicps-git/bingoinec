#!/bin/bash

echo "🔍 VERIFICANDO REDECLARAÇÃO DE VARIÁVEIS"
echo "========================================"

# Verificar redeclaração de 'app' em todos os arquivos JS
echo ""
echo "🔎 Procurando redeclaração da variável 'app'..."

files=(
    "firebase-config.js"
    "firebase-config-v8.js"
    "firebase-config-fixed.js"
    "firebase-config-simple.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo ""
        echo "📄 Analisando: $file"
        
        # Contar declarações de 'const app'
        count=$(grep -c "const app" "$file" 2>/dev/null || echo "0")
        
        if [ "$count" -eq 0 ]; then
            echo "ℹ️  Nenhuma declaração 'const app' encontrada"
        elif [ "$count" -eq 1 ]; then
            echo "✅ Apenas 1 declaração 'const app' encontrada - OK"
        else
            echo "❌ $count declarações 'const app' encontradas - ERRO!"
            echo "    Linhas com 'const app':"
            grep -n "const app" "$file"
        fi
        
        # Verificar outras possíveis redeclarações
        let_count=$(grep -c "let app" "$file" 2>/dev/null || echo "0")
        var_count=$(grep -c "var app" "$file" 2>/dev/null || echo "0")
        
        if [ "$let_count" -gt 0 ]; then
            echo "⚠️  $let_count declarações 'let app' encontradas"
        fi
        
        if [ "$var_count" -gt 0 ]; then
            echo "⚠️  $var_count declarações 'var app' encontradas"
        fi
        
    else
        echo "⚠️  Arquivo $file não encontrado"
    fi
done

echo ""
echo "🔎 Verificando também outros arquivos importantes..."

# Verificar outros arquivos que podem ter conflitos
other_files=(
    "script.js"
    "admin.js"
    "cartelas.js"
    "firebase-service.js"
)

total_errors=0

for file in "${other_files[@]}"; do
    if [ -f "$file" ]; then
        count=$(grep -c "const app" "$file" 2>/dev/null || echo "0")
        if [ "$count" -gt 1 ]; then
            echo "❌ $file: $count declarações 'const app'"
            total_errors=$((total_errors + 1))
        fi
    fi
done

echo ""
echo "📊 RESUMO"
echo "========="

if [ "$total_errors" -eq 0 ]; then
    echo "✅ Nenhuma redeclaração de variável detectada!"
    echo "✅ O erro 'Cannot redeclare block-scoped variable' deve estar resolvido."
else
    echo "❌ $total_errors arquivos ainda têm redeclarações"
    echo "❌ Necessário corrigir os arquivos listados acima"
fi

echo ""
echo "💡 DICA: Para testar em navegador:"
echo "   1. Abra o DevTools (F12)"
echo "   2. Vá para a aba Console"
echo "   3. Recarregue a página"
echo "   4. Verifique se não há erros de redeclaração"
