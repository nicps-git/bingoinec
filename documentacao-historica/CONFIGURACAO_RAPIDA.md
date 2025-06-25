# 🚀 CONFIGURAÇÃO RÁPIDA - FIREBASE BINGO

## ⚡ PASSOS ESSENCIAIS

### 1. 🔥 Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique "Criar projeto"
3. Nome: "bingo-arraia-inec" (ou seu nome)
4. Ative Analytics (opcional)

### 2. 🗄️ Configurar Firestore
1. No projeto, vá em "Firestore Database"
2. Clique "Criar banco de dados"
3. Comece em "Modo de teste" (importante!)
4. Escolha localização (us-central1 recomendado)

### 3. 🔧 Obter Configuração
1. Vá em "Configurações do projeto" (⚙️)
2. Role até "Seus aplicativos"
3. Clique no ícone `</>`  para "Web"
4. Nome do app: "Bingo Arraiá"
5. Copie o objeto `firebaseConfig`

### 4. ⚙️ Configurar Projeto Local
Edite o arquivo `firebase-config-simple.js`:

```javascript
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id", 
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 5. 🛡️ Configurar Regras de Segurança
1. Instale Firebase CLI: `npm install -g firebase-tools`
2. Faça login: `firebase login`
3. Inicie projeto: `firebase init firestore`
4. Faça deploy: `firebase deploy --only firestore`

### 6. 🎮 Testar Sistema
1. Abra `index.html` em servidor local
2. Acesse admin via `admin.html` 
3. Configure números e preços
4. Teste sorteio e venda de cartelas

## 🆘 SOLUÇÃO DE PROBLEMAS

### ❌ "Firebase is not defined"
- Verifique se os scripts estão carregando na ordem correta
- Confirme se está usando servidor web (não file://)

### ❌ "Permission denied" 
- Confirme que as regras foram deployadas
- Verifique se Firestore está em "modo de teste"

### ❌ Dados não salvam
- Abra DevTools e verifique erros no Console
- Confirme se projectId está correto
- Teste conexão com internet

## 📞 SUPORTE
Se precisar de ajuda, verifique:
1. Console do navegador (F12)
2. Firebase Console > Usage
3. Regras de segurança no Firestore

## ✅ CHECKLIST RÁPIDO
- [ ] Projeto Firebase criado
- [ ] Firestore ativado em modo teste  
- [ ] Configuração copiada para o arquivo local
- [ ] Firebase CLI instalado
- [ ] Regras deployadas
- [ ] Sistema testado localmente

🎯 **Pronto! Seu bingo está funcionando com Firebase!**
