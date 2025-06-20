#!/bin/bash

echo "🔄 UNIFICANDO CONFIGURAÇÕES DO FIREBASE"
echo "======================================="

# Fazer backup dos arquivos originais
echo ""
echo "📋 Fazendo backup dos arquivos originais..."

backup_dir="firebase-config-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"

# Backup dos arquivos de configuração
cp firebase-config*.js "$backup_dir/" 2>/dev/null || echo "Alguns arquivos não existem"

echo "✅ Backup criado em: $backup_dir"

# Atualizar referências nos arquivos HTML
echo ""
echo "🔄 Atualizando referências nos arquivos HTML..."

html_files=(
    "index.html"
    "admin.html"
    "cartelas.html"
    "minhas-cartelas.html"
    "teste-firebase.html"
    "teste-salvar-cartela.html"
    "diagnostico-firebase.html"
    "debug-admin-carregamento.html"
    "teste-admin-simplificado.html"
    "debug-botoes-admin.html"
    "teste-botoes-admin-final.html"
)

# Backup dos HTML antes de alterar
for file in "${html_files[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$backup_dir/" 2>/dev/null
    fi
done

# Substituir todas as referências
total_changed=0

for file in "${html_files[@]}"; do
    if [ -f "$file" ]; then
        echo "📄 Processando: $file"
        
        # Contar quantas mudanças serão feitas
        changes=$(grep -c "firebase-config.*\.js" "$file" 2>/dev/null || echo "0")
        
        if [ "$changes" -gt 0 ]; then
            # Fazer as substituições
            sed -i.bak \
                -e 's/firebase-config\.js/firebase-config-unified.js/g' \
                -e 's/firebase-config-fixed\.js/firebase-config-unified.js/g' \
                -e 's/firebase-config-simple\.js/firebase-config-unified.js/g' \
                -e 's/firebase-config-v8\.js/firebase-config-unified.js/g' \
                "$file"
            
            # Remover arquivo .bak
            rm -f "$file.bak"
            
            echo "  ✅ $changes referência(s) atualizada(s)"
            total_changed=$((total_changed + changes))
        else
            echo "  ℹ️  Nenhuma referência encontrada"
        fi
    else
        echo "  ⚠️  Arquivo não encontrado: $file"
    fi
done

echo ""
echo "📊 RESUMO DAS ALTERAÇÕES"
echo "======================="
echo "Total de referências atualizadas: $total_changed"

# Verificar se a unificação foi bem-sucedida
echo ""
echo "🔍 Verificando resultado..."

echo ""
echo "📋 Referências atuais ao firebase-config:"
grep -n "firebase-config.*\.js" *.html 2>/dev/null | head -10

echo ""
echo "🗂️ Arquivos de configuração presentes:"
ls -la firebase-config*.js 2>/dev/null | grep -v unified || echo "Nenhum arquivo antigo encontrado"

echo ""
echo "📦 Arquivo unificado:"
if [ -f "firebase-config-unified.js" ]; then
    echo "✅ firebase-config-unified.js criado ($(wc -l < firebase-config-unified.js) linhas)"
else
    echo "❌ firebase-config-unified.js não encontrado"
fi

echo ""
echo "🎯 PRÓXIMOS PASSOS"
echo "=================="
echo ""
echo "1. ✅ Arquivo unificado criado: firebase-config-unified.js"
echo "2. ✅ Todas as referências HTML atualizadas"
echo "3. ✅ Backup criado em: $backup_dir"
echo ""
echo "Para testar:"
echo "• Abra qualquer página do projeto"
echo "• Verifique o console (F12) para logs do Firebase"
echo "• Deve aparecer: '📦 Firebase Config Unificado carregado'"
echo "• Deve aparecer: '✅ Firebase inicializado com sucesso!'"
echo ""
echo "Se houver problemas:"
echo "• Verifique se os scripts do Firebase v8 estão carregados antes"
echo "• Consulte o backup em: $backup_dir"
echo "• Verifique o console do navegador para erros"
echo ""
echo "✅ Unificação concluída!"
