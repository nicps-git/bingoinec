#!/bin/bash

echo "🎪 ===== TESTE DO SISTEMA DE LOGIN DO BINGO INEC ===== 🎪"
echo ""

# Verificar se os arquivos necessários existem
echo "📁 Verificando arquivos do sistema..."
files=("index.html" "admin.html" "cartelas.html" "login.html" "login.js" "login.css")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - ARQUIVO FALTANDO!"
        exit 1
    fi
done

echo ""
echo "🔐 Credenciais configuradas:"
echo "   📧 E-mail: admin@bingoinec.org.br"
echo "   🔑 Senha: wooFestadeComida"
echo ""

echo "🚀 Iniciando servidor local..."
python3 -m http.server 8001 &
SERVER_PID=$!

# Aguardar o servidor iniciar
sleep 2

echo "🌐 Servidor rodando em: http://localhost:8001"
echo ""

echo "📋 Fluxo de teste sugerido:"
echo "1. 🎪 Acesse: http://localhost:8001 (página principal)"
echo "2. ⚙️ Clique em 'Admin' (deve redirecionar para login)"
echo "3. 🔐 Faça login com as credenciais acima"
echo "4. ✅ Verifique se consegue acessar o admin"
echo "5. 🚪 Teste o logout"
echo "6. 🧪 Use a página de teste: http://localhost:8001/teste-login.html"
echo ""

echo "⚠️  DICAS IMPORTANTES:"
echo "   • O admin só é acessível após login"
echo "   • A sessão expira em 8 horas"
echo "   • Atividade do usuário renova a sessão automaticamente"
echo "   • Logs de acesso são salvos no localStorage"
echo ""

echo "🛑 Para parar o servidor, pressione Ctrl+C"
echo "   Ou execute: kill $SERVER_PID"
echo ""

# Aguardar interrupção
wait $SERVER_PID
