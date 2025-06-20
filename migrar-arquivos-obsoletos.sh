#!/bin/bash

echo "📁 MIGRAÇÃO DOS ARQUIVOS ANTIGOS DE CONFIGURAÇÃO"
echo "================================================"

# Criar diretório para arquivos obsoletos
obsolete_dir="firebase-config-obsoletos"
mkdir -p "$obsolete_dir"

echo ""
echo "📦 Movendo arquivos antigos para pasta de obsoletos..."

# Lista dos arquivos antigos
old_files=(
    "firebase-config.js"
    "firebase-config-fixed.js"
    "firebase-config-simple.js"
    "firebase-config-v8.js"
)

moved_count=0

for file in "${old_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$obsolete_dir/"
        echo "  ✅ $file → $obsolete_dir/"
        moved_count=$((moved_count + 1))
    else
        echo "  ℹ️  $file não encontrado"
    fi
done

echo ""
echo "📊 RESULTADO DA MIGRAÇÃO"
echo "======================="
echo "Arquivos movidos: $moved_count"
echo "Arquivo unificado: firebase-config-unified.js"
echo "Arquivos obsoletos em: $obsolete_dir/"

echo ""
echo "🔍 Verificando referências restantes..."

# Verificar se ainda há referências aos arquivos antigos
echo ""
echo "📋 Referências nos arquivos HTML:"
remaining=$(grep -r "firebase-config-\(fixed\|simple\|v8\|[^u]\)" *.html 2>/dev/null | grep -v "firebase-config-unified" | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo "✅ Nenhuma referência antiga encontrada"
else
    echo "⚠️  Ainda há $remaining referência(s) aos arquivos antigos:"
    grep -r "firebase-config-\(fixed\|simple\|v8\|[^u]\)" *.html 2>/dev/null | grep -v "firebase-config-unified"
fi

echo ""
echo "📋 Status atual dos arquivos de configuração:"
echo ""
if [ -f "firebase-config-unified.js" ]; then
    echo "✅ firebase-config-unified.js ($(wc -l < firebase-config-unified.js) linhas) - ATIVO"
else
    echo "❌ firebase-config-unified.js não encontrado!"
fi

echo ""
echo "📂 Arquivos em $obsolete_dir/:"
ls -la "$obsolete_dir/" 2>/dev/null || echo "Pasta vazia"

echo ""
echo "🎯 PRÓXIMOS PASSOS"
echo "=================="
echo ""
echo "1. ✅ Arquivo unificado ativo: firebase-config-unified.js"
echo "2. ✅ Arquivos antigos movidos para: $obsolete_dir/"
echo "3. 🧪 Teste a configuração: teste-config-unificada.html"
echo ""
echo "Para reverter (se necessário):"
echo "• cp $obsolete_dir/* ."
echo "• Reverter referências nos arquivos HTML usando o backup"
echo ""
echo "Para limpar completamente (após confirmação):"
echo "• rm -rf $obsolete_dir/"
echo "• rm -rf firebase-config-backup-*/"
echo ""
echo "✅ Migração concluída!"
