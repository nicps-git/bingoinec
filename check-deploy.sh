#!/bin/bash

echo "🎪 Verificando arquivos para deploy do Bingo Arraiá INEC..."
echo ""

# Lista de arquivos necessários
files=(
    "index.html"
    "admin.html"
    "style.css"
    "admin.css"
    "script.js"
    "admin.js"
    "netlify.toml"
    "package.json"
    "README.md"
)

all_good=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (FALTANDO)"
        all_good=false
    fi
done

echo ""

# Verificar logo
if [ -f "inec.png" ]; then
    echo "✅ inec.png (logo)"
else
    echo "⚠️  inec.png (logo) - Adicione a logo da INEC"
fi

echo ""

if [ "$all_good" = true ]; then
    echo "🎉 Todos os arquivos estão prontos!"
    echo "🚀 Você pode fazer o deploy no Netlify!"
    echo ""
    echo "📖 Consulte DEPLOY_GUIDE.md para instruções detalhadas"
else
    echo "❌ Alguns arquivos estão faltando"
    echo "🔧 Verifique os arquivos marcados acima"
fi

echo ""
echo "🌽 Boa sorte com seu Arraiá INEC! ✨"
