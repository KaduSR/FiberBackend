# 🚀 Guia Completo de Configuração - FiberNet App

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Configuração do Aplicativo Mobile](#configuração-do-aplicativo-mobile)
4. [Configuração do Backend](#configuração-do-backend)
5. [Integração com GenieACS (ONTs)](#integração-com-genieacs-onts)
6. [Integração com IXC Software](#integração-com-ixc-software)
7. [Integração com APIs Externas](#integração-com-apis-externas)
8. [Integração com IA (FiberBot Inteligente)](#integração-com-ia-fiberbot-inteligente)
9. [Testes e Validação](#testes-e-validação)
10. [Deploy em Produção](#deploy-em-produção)

---

## 🎯 Visão Geral

O aplicativo FiberNet oferece:
- ✅ **Dashboard Inteligente** com status em tempo real
- ✅ **FiberBot com IA** que aprende hábitos do cliente
- ✅ **Gerenciamento de ONT** via TR-069/CWMP
- ✅ **Teste de Velocidade** (Ookla SpeedTest)
- ✅ **Monitoramento de Serviços** (DownDetector)
- ✅ **Sistema Financeiro** (Faturas e Pagamentos)
- ✅ **Suporte Técnico** (Abertura de OS)
- ✅ **Notícias de Tecnologia**

---

## 📦 Requisitos

### Software Necessário

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Expo CLI** (`npm install -g expo-cli`)
- **MongoDB** (para GenieACS)
- **Git** ([Download](https://git-scm.com/))

### Serviços Opcionais

- **GenieACS** (gerenciamento de ONTs)
- **IXC Software** (ERP do provedor)
- **OpenAI API** ou **OnSpace AI** (FiberBot inteligente)
- **DownDetector API** (monitoramento de serviços)
- **SpeedTest API Server** (testes de velocidade)

---

## 📱 Configuração do Aplicativo Mobile

### 1. Clonar o Projeto

```bash
git clone https://github.com/fibernet/app.git
cd app
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# =======================================
# CONFIGURAÇÃO DO BACKEND FIBERNET
# =======================================
# URL do seu backend Node.js (GenieACS + IXC)
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3000/api

# API Key para autenticação (mesmo valor do backend)
EXPO_PUBLIC_BACKEND_API_KEY=sua_chave_secreta_aqui

# =======================================
# INTELIGÊNCIA ARTIFICIAL (FIBERBOT)
# =======================================
# Opção 1: OpenAI (GPT-4)
EXPO_PUBLIC_AI_PROVIDER=openai
EXPO_PUBLIC_OPENAI_API_KEY=sk-...

# Opção 2: OnSpace AI (Built-in)
# EXPO_PUBLIC_AI_PROVIDER=onspace
# EXPO_PUBLIC_ONSPACE_API_KEY=sua_chave_onspace

# Opção 3: Sem IA (modo básico)
# EXPO_PUBLIC_AI_PROVIDER=none

# =======================================
# APIS EXTERNAS
# =======================================
# DownDetector API (monitoramento de serviços)
# Opcional: deixe vazio para usar dados mock
EXPO_PUBLIC_DOWNDETECTOR_API_KEY=

# SpeedTest API (testes de velocidade)
# URL do servidor Ookla SpeedTest API
# https://github.com/Lifailon/Ookla-SpeedTest-API
EXPO_PUBLIC_SPEEDTEST_API_URL=http://192.168.1.100:8080

# =======================================
# IXC SOFTWARE (ERP)
# =======================================
# URL base do IXC
EXPO_PUBLIC_IXC_API_URL=https://api.fibernet.com.br/webservice/Sessao_Usuario_Controle

# =======================================
# MODO DE OPERAÇÃO
# =======================================
# mock = Dados de demonstração
# production = APIs reais
EXPO_PUBLIC_MODE=mock
```

### 4. Iniciar o Aplicativo

**Modo Desenvolvimento:**

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

**Visualizar no Celular:**

1. Instale o app **Expo Go** no seu celular
2. Execute `npm start`
3. Escaneie o QR code

---

## 🖥️ Configuração do Backend

### 1. Navegar para o Diretório Backend

```bash
cd backend
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
nano .env
```

```env
# =======================================
# SERVIDOR
# =======================================
PORT=3000
NODE_ENV=production

# =======================================
# GENIEACS (TR-069 PARA ONTS)
# =======================================
GENIEACS_URL=http://localhost:7557
GENIEACS_USER=admin
GENIEACS_PASSWORD=admin

# =======================================
# IXC SOFTWARE
# =======================================
IXC_API_URL=https://api.fibernet.com.br/webservice/Sessao_Usuario_Controle
IXC_TOKEN=seu_token_ixc_base64

# =======================================
# SEGURANÇA
# =======================================
# API Key (deve ser a mesma do app mobile)
API_KEY=sua_chave_secreta_aqui

# JWT Secret (para tokens de sessão)
JWT_SECRET=seu_jwt_secret_super_secreto

# =======================================
# CORS
# =======================================
# IPs/URLs permitidos (separados por vírgula)
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081

# =======================================
# RATE LIMITING
# =======================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =======================================
# INTELIGÊNCIA ARTIFICIAL
# =======================================
# Opção 1: OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Opção 2: OnSpace AI
# AI_PROVIDER=onspace
# ONSPACE_API_KEY=...
```

### 4. Iniciar o Backend

**Modo Desenvolvimento:**

```bash
npm run dev
```

**Modo Produção (com PM2):**

```bash
npm install -g pm2
pm2 start server.js --name fibernet-backend
pm2 save
pm2 startup
```

### 5. Verificar se está Funcionando

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T10:00:00.000Z",
  "environment": "production"
}
```

---

## 📡 Integração com GenieACS (ONTs)

### Por que GenieACS?

O GenieACS permite gerenciar remotamente as ONTs Huawei via protocolo TR-069/CWMP:
- Listar dispositivos conectados
- Verificar sinal óptico
- Reiniciar equipamento remotamente
- Bloquear/desbloquear dispositivos

### 1. Instalar GenieACS

Siga o guia completo: [`GENIEACS_SETUP_GUIDE.md`](./GENIEACS_SETUP_GUIDE.md)

**Resumo:**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb
sudo npm install -g genieacs
```

### 2. Configurar ONTs Huawei

Acesse a interface web da ONT (geralmente `http://192.168.1.1`):

```
ACS URL: http://SEU_SERVIDOR:7547
ACS Username: (vazio)
ACS Password: (vazio)
Periodic Inform: Ativado
Inform Interval: 300 segundos
```

### 3. Testar Conexão

```bash
# Listar ONTs conectadas
curl http://localhost:7557/devices | jq

# Ver detalhes de uma ONT
curl http://localhost:7557/devices/HWTC12345678 | jq
```

### 4. Integrar com Backend

No arquivo `backend/.env`:

```env
GENIEACS_URL=http://localhost:7557
```

Teste via backend:

```bash
curl -H "x-api-key: sua_chave" \
  http://localhost:3000/api/ont/HWTC12345678/info
```

---

## 🔌 Integração com IXC Software

### 1. Obter Credenciais do IXC

Entre em contato com o suporte do IXC para obter:
- URL da API
- Token de autenticação (Base64)

### 2. Configurar no Backend

```env
IXC_API_URL=https://api.fibernet.com.br/webservice/Sessao_Usuario_Controle
IXC_TOKEN=c2V1X3Rva2VuX2Jhc2U2NA==
```

### 3. Testar Autenticação

**IMPORTANTE:** Conforme documentação IXC (https://wikiapiprovedor.ixcsoft.com.br/#6), para acesso ao hotsite (área do cliente), use **e-mail e senha**:

```bash
curl -X POST \
  https://api.fibernet.com.br/webservice/Sessao_Usuario_Controle/login_token \
  -H "Authorization: Basic c2V1X3Rva2VuX2Jhc2U2NA==" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "cliente@email.com",
    "senha": "senha123"
  }'
```

**Observação:** O campo `login` deve conter o **e-mail cadastrado** do cliente no IXC.
```

### 4. Endpoints Disponíveis

O backend FiberNet usa os seguintes endpoints do IXC:

- `POST /login_token` - Autenticação
- `POST /consultarSinal` - Status do sinal óptico
- `POST /getFaturas` - Listar faturas
- `POST /getFaturaPDF` - Gerar boleto/PIX
- `POST /resetarEquipamento` - Reiniciar ONT
- `POST /abrirOS` - Abrir chamado técnico
- `POST /listarOS` - Listar chamados

---

## 🌐 Integração com APIs Externas

### DownDetector API

**1. Obter API Key:**

Acesse [https://downdetectorapi.com/](https://downdetectorapi.com/) e crie uma conta.

**2. Configurar:**

```env
# .env (app mobile)
EXPO_PUBLIC_DOWNDETECTOR_API_KEY=sua_chave_downdetector
```

**3. Serviços Monitorados:**

- Instagram
- WhatsApp
- Facebook
- Netflix
- YouTube
- TikTok
- Twitter/X
- Spotify

**4. Modo Mock (Sem API Key):**

Se não configurar a API key, o app usa dados simulados para demonstração.

### Ookla SpeedTest API

**1. Instalar Servidor SpeedTest:**

```bash
git clone https://github.com/Lifailon/Ookla-SpeedTest-API
cd Ookla-SpeedTest-API
npm install
npm start
```

**2. Configurar:**

```env
# .env (app mobile)
EXPO_PUBLIC_SPEEDTEST_API_URL=http://192.168.1.100:8080
```

**3. Testar:**

```bash
curl http://localhost:8080/speedtest
```

---

## 🤖 Integração com IA (FiberBot Inteligente)

### Por que Integrar com IA?

O FiberBot com IA pode:
- ✅ Aprender hábitos do cliente (horários de uso, serviços favoritos)
- ✅ Diagnosticar problemas automaticamente (IPTV, sinal, velocidade)
- ✅ Fazer perguntas contextuais
- ✅ Analisar padrões de reclamação
- ✅ Sugerir soluções personalizadas

### Opção 1: OpenAI (Recomendado)

**1. Obter API Key:**

Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**2. Configurar no App:**

```env
# .env (app mobile)
EXPO_PUBLIC_AI_PROVIDER=openai
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
```

**3. Configurar no Backend:**

```env
# backend/.env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
```

**4. Custo Estimado:**

- Modelo: GPT-4o-mini (rápido e econômico)
- Custo: ~$0.15 por 1M tokens de entrada / $0.60 por 1M tokens de saída
- Média: ~$0.01 por 100 conversas

### Opção 2: OnSpace AI (Gratuito para Desenvolvedores)

**1. Criar Conta OnSpace:**

Acesse [https://onspace.ai](https://onspace.ai) e crie uma conta.

**2. Obter API Key:**

No dashboard, vá em **Settings** → **API Keys**

**3. Configurar:**

```env
# .env (app mobile)
EXPO_PUBLIC_AI_PROVIDER=onspace
EXPO_PUBLIC_ONSPACE_API_KEY=sua_chave_onspace
```

```env
# backend/.env
AI_PROVIDER=onspace
ONSPACE_API_KEY=sua_chave_onspace
```

### Opção 3: Modo Básico (Sem IA)

Se não configurar nenhuma IA, o FiberBot funciona com regras básicas:

```env
EXPO_PUBLIC_AI_PROVIDER=none
```

**Funcionalidades Limitadas:**
- ❌ Não aprende hábitos
- ❌ Perguntas genéricas
- ✅ Regras básicas funcionam (sinal, reinício, downdetector)

### Testando a IA

Após configurar, teste no app:

1. Abra a aba **Suporte**
2. Digite: "Meu IPTV está travando"
3. FiberBot deve:
   - Perguntar qual serviço (Netflix, YouTube, etc.)
   - Analisar o sinal óptico
   - Sugerir soluções específicas
   - Aprender que você usa IPTV

---

## 🧪 Testes e Validação

### 1. Testar Backend Isolado

```bash
# Health check
curl http://localhost:3000/health

# ONT Info
curl -H "x-api-key: sua_chave" \
  http://localhost:3000/api/ont/HWTC12345678/info

# Dispositivos conectados
curl -H "x-api-key: sua_chave" \
  http://localhost:3000/api/ont/HWTC12345678/devices
```

### 2. Testar Aplicativo Mobile

**Modo Mock (sem APIs):**

```env
EXPO_PUBLIC_MODE=mock
```

```bash
npm start
```

**Modo Produção (com APIs):**

```env
EXPO_PUBLIC_MODE=production
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3000/api
EXPO_PUBLIC_BACKEND_API_KEY=sua_chave
```

```bash
npm start
```

### 3. Checklist de Funcionalidades

- [ ] Login funciona
- [ ] Dashboard mostra status
- [ ] Teste de velocidade executa
- [ ] Dispositivos conectados aparecem
- [ ] FiberBot responde perguntas
- [ ] DownDetector verifica serviços
- [ ] Faturas são listadas
- [ ] Reinício remoto funciona
- [ ] Abertura de OS funciona
- [ ] Notícias são carregadas

---

## 🚀 Deploy em Produção

### Backend (VPS/Cloud)

**1. Escolher Provedor:**
- DigitalOcean
- AWS EC2
- Google Cloud
- Azure

**2. Instalar Servidor:**

```bash
# Conectar via SSH
ssh root@seu-servidor.com

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar projeto
git clone https://github.com/fibernet/backend.git
cd backend

# Instalar dependências
npm install

# Configurar .env (produção)
nano .env

# Instalar PM2
npm install -g pm2
pm2 start server.js --name fibernet-backend
pm2 startup
pm2 save
```

**3. Configurar Firewall:**

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # API
sudo ufw allow 7547/tcp # TR-069 (ONTs)
sudo ufw enable
```

**4. Configurar Nginx (Reverse Proxy):**

```nginx
# /etc/nginx/sites-available/fibernet-api
server {
    listen 80;
    server_name api.fibernet.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fibernet-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**5. Configurar HTTPS (Let's Encrypt):**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.fibernet.com.br
```

### App Mobile (Expo/EAS)

**1. Criar Conta Expo:**

```bash
npx expo login
```

**2. Configurar EAS:**

```bash
npm install -g eas-cli
eas build:configure
```

**3. Build Android:**

```bash
eas build -p android
```

**4. Build iOS:**

```bash
eas build -p ios
```

**5. Publicar Update OTA:**

```bash
eas update
```

---

## 📊 Monitoramento

### Logs do Backend

```bash
# PM2 logs
pm2 logs fibernet-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Métricas

```bash
# Status PM2
pm2 status

# Monitoramento em tempo real
pm2 monit
```

---

## ❓ Troubleshooting

### Problema: "Cannot connect to backend"

**Solução:**

1. Verifique se backend está rodando:
   ```bash
   curl http://localhost:3000/health
   ```

2. Verifique firewall:
   ```bash
   sudo ufw status
   ```

3. Verifique .env do app:
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://IP_CORRETO:3000/api
   ```

### Problema: "ONT not found"

**Solução:**

1. Verifique se ONT está conectada no GenieACS:
   ```bash
   curl http://localhost:7557/devices
   ```

2. Verifique configuração TR-069 na ONT

3. Verifique logs do GenieACS:
   ```bash
   sudo journalctl -u genieacs-cwmp -f
   ```

### Problema: "AI not responding"

**Solução:**

1. Verifique API key:
   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=sk-...
   ```

2. Teste API diretamente:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $EXPO_PUBLIC_OPENAI_API_KEY"
   ```

3. Verifique créditos OpenAI

---

## 📞 Suporte

### Documentação Adicional

- [GenieACS Setup Guide](./GENIEACS_SETUP_GUIDE.md)
- [ONT Integration Guide](./ONT_INTEGRATION_GUIDE.md)
- [Backend README](../backend/README.md)

### Comunidade

- GitHub Issues: [https://github.com/fibernet/app/issues](https://github.com/fibernet/app/issues)
- Discord: [https://discord.gg/fibernet](https://discord.gg/fibernet)
- Email: suporte@fibernet.com.br

---

## ✅ Checklist Final

Antes de colocar em produção, verifique:

- [ ] Backend rodando com PM2
- [ ] GenieACS configurado e ONTs conectando
- [ ] HTTPS configurado (Let's Encrypt)
- [ ] Firewall configurado corretamente
- [ ] Backup do MongoDB configurado
- [ ] Monitoramento ativo (PM2, logs)
- [ ] API Keys em produção (não usar keys de desenvolvimento)
- [ ] CORS configurado para domínio de produção
- [ ] Rate limiting ativo
- [ ] App testado em dispositivos reais (iOS e Android)
- [ ] Integração IXC funcionando
- [ ] IA funcionando (se configurada)
- [ ] Todas as funcionalidades testadas

---

## 🎉 Pronto!

Seu aplicativo FiberNet está completo e pronto para uso! 🚀

Para dúvidas ou suporte, consulte a documentação ou entre em contato.
