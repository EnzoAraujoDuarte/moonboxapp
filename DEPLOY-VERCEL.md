# 🚀 Deploy do Frontend MoonBox na Vercel

Este guia explica como fazer deploy apenas do **frontend** do MoonBox na Vercel, mantendo o backend separado.

## 📋 Pré-requisitos

- ✅ Conta na [Vercel](https://vercel.com)
- ✅ Repositório GitHub: `https://github.com/EnzoAraujoDuarte/MoonBox.git`
- ✅ Node.js 18+ instalado localmente (para testes)

## 🔧 Configuração do Projeto

### 1. Estrutura do Repositório
```
moonbox/
├── frontend/          # App Next.js (será deployado)
├── backend/           # API Node.js (não será deployado)
├── blocks/            # App Blocks do Shopify
├── vercel.json        # Configuração da Vercel
└── DEPLOY-VERCEL.md   # Este guia
```

### 2. Arquivo vercel.json
O arquivo `vercel.json` já está configurado para:
- Fazer build apenas da pasta `frontend/`
- Usar Next.js como framework
- Gerar build estático (`output: 'export'`)
- Redirecionar todas as rotas para o frontend

## 🚀 Deploy na Vercel

### Método 1: Via Dashboard da Vercel (Recomendado)

1. **Acesse a Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub

2. **Importe o Projeto**
   - Clique em **"New Project"**
   - Selecione **"Import Git Repository"**
   - Cole a URL: `https://github.com/EnzoAraujoDuarte/MoonBox.git`
   - Clique em **"Import"**

3. **Configure o Deploy**
   - **Project Name**: `moonbox-frontend` (ou nome de sua escolha)
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: Deixe em branco (usará o `vercel.json`)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/out`
   - **Install Command**: `cd frontend && npm install`

4. **Variáveis de Ambiente** (se necessário)
   ```
   NEXT_PUBLIC_BACKEND_URL=https://sua-api-backend.com
   NEXT_PUBLIC_SHOPIFY_APP_URL=https://moonbox-frontend.vercel.app
   ```

5. **Deploy**
   - Clique em **"Deploy"**
   - Aguarde o build completar (2-3 minutos)
   - Sua URL será algo como: `https://moonbox-frontend.vercel.app`

### Método 2: Via CLI da Vercel

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login na Vercel**
   ```bash
   vercel login
   ```

3. **Deploy do Projeto**
   ```bash
   cd moonbox
   vercel --prod
   ```

4. **Configurar durante o deploy**
   - Project name: `moonbox-frontend`
   - Directory: `.` (raiz do projeto)
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/out`

## ⚙️ Configurações Avançadas

### 1. Domínio Personalizado
1. No dashboard da Vercel, vá para **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções da Vercel

### 2. Variáveis de Ambiente
```bash
# Produção
NEXT_PUBLIC_BACKEND_URL=https://sua-api-backend.herokuapp.com
NEXT_PUBLIC_SHOPIFY_APP_URL=https://moonbox.seudominio.com

# Desenvolvimento
NEXT_PUBLIC_BACKEND_URL=http://localhost:8081
NEXT_PUBLIC_SHOPIFY_APP_URL=http://localhost:3000
```

### 3. Configuração de Build Personalizada
Se precisar de configurações específicas, edite o `vercel.json`:

```json
{
  "version": 2,
  "name": "moonbox-frontend",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/out"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_BACKEND_URL": "https://sua-api-backend.com"
  }
}
```

## 🔄 Deploy Automático

### 1. Configurar Webhook
A Vercel automaticamente faz redeploy quando você faz push para o repositório GitHub.

### 2. Branch de Produção
- **main/master**: Deploy automático para produção
- **develop**: Deploy para preview (opcional)

### 3. Preview Deployments
Cada Pull Request gera um deploy de preview automaticamente.

## 🧪 Testando o Deploy

### 1. Verificar Build Local
```bash
cd frontend
npm run build
npm run start
```

### 2. Testar URLs
- **Homepage**: `https://sua-url.vercel.app`
- **Wishlist**: `https://sua-url.vercel.app/wishlist`
- **Health Check**: Verificar se não há erros 404

### 3. Verificar Logs
No dashboard da Vercel:
- Vá para **Functions > View Function Logs**
- Monitore erros de build ou runtime

## 🐛 Solução de Problemas

### Build Falha
```bash
# Erro comum: dependências não encontradas
Error: Cannot find module 'next'

# Solução: Verificar se o install command está correto
"installCommand": "cd frontend && npm install"
```

### Rotas 404
```bash
# Problema: Rotas do Next.js não funcionam
# Solução: Verificar se output: 'export' está no next.config.js
```

### Variáveis de Ambiente
```bash
# Problema: Backend URL não definida
# Solução: Adicionar NEXT_PUBLIC_BACKEND_URL nas settings da Vercel
```

### CORS Issues
```bash
# Problema: Frontend não consegue acessar backend
# Solução: Configurar CORS no backend para aceitar domínio da Vercel
```

## 📊 Monitoramento

### 1. Analytics da Vercel
- Ative o Vercel Analytics no dashboard
- Monitore performance e uso

### 2. Logs de Erro
- Configure alertas para erros 5xx
- Monitore tempo de resposta

### 3. Uptime Monitoring
- Use serviços como UptimeRobot
- Configure alertas para downtime

## 🔒 Segurança

### 1. Variáveis Sensíveis
- Nunca commite chaves de API no código
- Use variáveis de ambiente da Vercel
- Prefixe com `NEXT_PUBLIC_` apenas se necessário no cliente

### 2. Headers de Segurança
Configure no `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 💰 Custos

### Plano Free da Vercel
- ✅ 100GB de bandwidth/mês
- ✅ Domínios ilimitados
- ✅ Deploy automático
- ✅ SSL gratuito
- ✅ Edge Network global

### Quando Upgradar
- Mais de 100GB de bandwidth
- Necessidade de analytics avançados
- Suporte prioritário

## 🚀 Próximos Passos

1. **Deploy do Backend**
   - Considere Heroku, Railway ou Render
   - Configure variáveis de ambiente
   - Teste integração completa

2. **Domínio Personalizado**
   - Registre um domínio
   - Configure DNS
   - Ative SSL

3. **Monitoramento**
   - Configure alertas
   - Monitore performance
   - Analise métricas de uso

## 📞 Suporte

### Recursos Úteis
- [Documentação da Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Comandos Úteis
```bash
# Ver logs do deploy
vercel logs

# Listar deployments
vercel ls

# Remover projeto
vercel remove moonbox-frontend

# Ver informações do projeto
vercel inspect
```

---

✅ **Resumo**: Com esta configuração, seu frontend estará rodando na Vercel com deploy automático, SSL gratuito e CDN global. O backend pode ser deployado separadamente em outro serviço.