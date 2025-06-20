#!/bin/bash

echo "🎪 Preparando deploy do Bingo Arraiá INEC para Netlify..."

# Verificar se a CLI do Netlify está instalada
if ! command -v netlify &> /dev/null; then
    echo "📦 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

# Fazer login no Netlify (se necessário)
echo "🔐 Verificando autenticação Netlify..."
netlify status || netlify login

# Deploy do site
echo "🚀 Fazendo deploy..."
netlify deploy --prod --dir .

echo "✅ Deploy concluído!"
echo "🌽 Seu Bingo Arraiá INEC está no ar!"
echo ""
echo "📱 Para acessar:"
echo "- Site principal: [URL fornecida pelo Netlify]"
echo "- Administração: [URL]/admin.html"
echo ""
echo "🎉 Boa festa junina!"
