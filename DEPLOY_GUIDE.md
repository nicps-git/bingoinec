# 🚀 Guia de Deploy do Bingo Arraiá INEC no Netlify

## Método 1: Deploy via Drag & Drop (Mais Fácil)

### 1. Prepare os arquivos
Certifique-se de que você tem todos estes arquivos na pasta Bingo:
- ✅ `index.html` (página principal)
- ✅ `admin.html` (administração)
- ✅ `style.css` (estilos principais)
- ✅ `admin.css` (estilos admin)
- ✅ `script.js` (JavaScript principal)
- ✅ `admin.js` (JavaScript admin)
- ✅ `inec.png` (logo da empresa)
- ✅ `netlify.toml` (configuração)

### 2. Acesse o Netlify
1. Vá para: https://netlify.com
2. Faça login ou crie uma conta gratuita

### 3. Deploy
1. No dashboard, clique em **"Add new site"**
2. Escolha **"Deploy manually"**
3. **Arraste a pasta Bingo** inteira para a área de upload
4. Aguarde o deploy completar

### 4. Configure o domínio (opcional)
1. Clique em **"Domain settings"**
2. Edite o nome do site para algo como: `bingo-arraia-inec`
3. Sua URL será: `https://bingo-arraia-inec.netlify.app`

---

## Método 2: Deploy via Git (Automático)

### 1. Initialize Git
```bash
cd /home/nicps/Documents/Projetos/Bingo
git init
git add .
git commit -m "🎪 Primeiro commit - Bingo Arraiá INEC"
```

### 2. Push para GitHub
1. Crie um repositório no GitHub
2. Conecte e faça push:
```bash
git remote add origin https://github.com/SEU_USUARIO/bingo-arraia-inec.git
git push -u origin main
```

### 3. Conecte no Netlify
1. No Netlify, clique **"New site from Git"**
2. Conecte com GitHub
3. Selecione o repositório
4. Deploy será automático a cada commit!

---

## 🎯 URLs de Acesso

Após o deploy, você terá:
- **🎪 Bingo**: `https://SEU-SITE.netlify.app/`
- **⚙️ Admin**: `https://SEU-SITE.netlify.app/admin.html`

---

## 🔧 Configurações Importantes

O arquivo `netlify.toml` já está configurado com:
- ✅ Cache otimizado
- ✅ Redirect `/admin` → `/admin.html`
- ✅ Fallback para 404

---

## 📱 Teste Final

1. **Funcionalidade**: Teste o sorteio de números
2. **Administração**: Configure ranges e resetar jogo
3. **Responsivo**: Teste em mobile e desktop
4. **Persistência**: Verifique se dados são salvos

---

## 🎉 Pronto!

Seu **Bingo Arraiá INEC** está no ar! 🌽✨

**Compartilhe a URL com sua equipe e boa festa junina!** 🎪
