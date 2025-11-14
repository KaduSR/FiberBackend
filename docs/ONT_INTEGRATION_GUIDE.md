# Guia de Integração com ONTs Huawei via GenieACS

## Visão Geral

Este guia explica como integrar o aplicativo FiberNet com ONTs Huawei usando GenieACS para acesso automático aos dispositivos conectados via TR-069/CWMP.

## ✅ Solução Implementada: GenieACS

O projeto agora usa **GenieACS**, um ACS (Auto Configuration Server) open-source profissional que permite gerenciamento completo das ONTs Huawei.

## 🚀 Quick Start

### 1. Instalar GenieACS

Siga o guia completo em `docs/GENIEACS_SETUP_GUIDE.md` ou quick start:

```bash
# Ubuntu/Debian
sudo npm install -g genieacs
sudo systemctl enable genieacs-cwmp genieacs-nbi genieacs-fs genieacs-ui
sudo systemctl start genieacs-cwmp genieacs-nbi genieacs-fs genieacs-ui
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas configurações
npm start
```

### 3. Configurar ONTs

Na interface web da ONT (192.168.1.1):
- TR-069 → ACS URL: `http://seu-servidor:7547`
- Periodic Inform: Ativado
- Interval: 300 segundos

### 4. Configurar App Mobile

Edite `.env` no projeto:
```env
EXPO_PUBLIC_ONT_API_URL=http://seu-servidor:3000/api
EXPO_PUBLIC_ONT_API_KEY=sua_chave_secreta
```

### 5. Testar

```bash
# Verificar ONTs conectadas
curl http://localhost:7557/devices

# Testar via backend
curl -H "x-api-key: sua_chave" \
  http://localhost:3000/api/ont/HWTC12345678/info
```

## 📁 Estrutura do Projeto

```
backend/
├── server.js              # Servidor Express principal
├── package.json           # Dependências
├── .env.example          # Configurações
├── routes/
│   └── ont.js            # Rotas da API
└── services/
    └── genieacs.js       # Serviço GenieACS

docs/
├── ONT_INTEGRATION_GUIDE.md      # Este arquivo
└── GENIEACS_SETUP_GUIDE.md       # Instalação GenieACS
```

## 🔧 Funcionalidades Implementadas

✅ Informações da ONT (modelo, firmware, sinal óptico)  
✅ Lista de dispositivos conectados (WiFi + Ethernet)  
✅ Bloqueio/desbloqueio de dispositivos  
✅ Reinicialização remota da ONT  
✅ Atualização de dados em tempo real  
✅ API Key authentication  
✅ Rate limiting  
✅ CORS configurável

## Arquitetura Necessária

Para acessar dados reais das ONTs Huawei dos seus clientes, você precisa de:

### 1. Backend com TR-069/CWMP

O **TR-069 (CWMP - CPE WAN Management Protocol)** é o protocolo padrão para gerenciamento remoto de ONTs.

**Componentes necessários:**
- **ACS (Auto Configuration Server)**: Servidor central que gerencia as ONTs
- **API REST**: Interface entre o app móvel e o ACS
- **Banco de Dados**: Para armazenar informações de contratos e ONTs

### 2. Integração com IXC Software

O IXC já possui funcionalidades de gerenciamento de ONTs. Verifique se você pode:
- Usar a API do IXC para acessar dados das ONTs
- Integrar com o ACS do IXC (se disponível)
- Sincronizar dados de dispositivos conectados

## Protocolos Suportados pelas ONTs Huawei

### TR-069/CWMP (Recomendado)

**Vantagens:**
- Protocolo padrão da indústria
- Suporte nativo nas ONTs Huawei
- Gerenciamento completo remoto

**Endpoints TR-069 típicos:**
```
# Informações da ONT
Device.DeviceInfo.ModelName
Device.DeviceInfo.SerialNumber
Device.DeviceInfo.SoftwareVersion
Device.DeviceInfo.UpTime
Device.DeviceInfo.Temperature

# Sinal óptico
Device.Optical.Interface.1.OpticalSignalLevel (RX)
Device.Optical.Interface.1.TransmitOpticalLevel (TX)

# Dispositivos conectados via Ethernet
Device.Hosts.Host.{i}.PhysAddress (MAC Address)
Device.Hosts.Host.{i}.IPAddress
Device.Hosts.Host.{i}.HostName
Device.Hosts.Host.{i}.Active

# Dispositivos WiFi
Device.WiFi.AccessPoint.{i}.AssociatedDevice.{i}.MACAddress
Device.WiFi.AccessPoint.{i}.AssociatedDevice.{i}.SignalStrength
Device.WiFi.AccessPoint.{i}.AssociatedDevice.{i}.LastDataDownlinkRate
Device.WiFi.AccessPoint.{i}.AssociatedDevice.{i}.LastDataUplinkRate

# Controle de dispositivos
Device.WiFi.AccessPoint.{i}.AssociatedDevice.{i}.Block (true/false)

# Reiniciar ONT
Device.DeviceInfo.Reboot
```

### SNMP (Alternativa)

**Vantagens:**
- Mais simples de implementar
- Bom para monitoramento

**Limitações:**
- Somente leitura (geralmente)
- Menos detalhes que TR-069

### HTTP API (Se disponível)

Algumas ONTs Huawei possuem interface web com API REST interna, mas:
- Não é padrão em todos os modelos
- Requer credenciais administrativas
- Acesso apenas na rede local

## Arquitetura Backend Recomendada

```
┌─────────────────┐
│   App FiberNet  │
│   (React Native)│
└────────┬────────┘
         │ HTTPS/REST
         ▼
┌─────────────────┐
│  Backend API    │
│  (Node.js/PHP)  │
└────────┬────────┘
         │ TR-069/CWMP
         ▼
┌─────────────────┐
│   ACS Server    │
│ (GenieACS/etc)  │
└────────┬────────┘
         │ TR-069
         ▼
┌─────────────────┐
│   ONT Huawei    │
│  (Cliente final)│
└─────────────────┘
```

## Implementação Backend

### 1. Escolher um ACS

**Opções open-source:**
- **GenieACS**: Popular, Node.js based
- **FreeTR69**: Java based
- **EasyCwmp**: C based

**Opções comerciais:**
- Já integrado no IXC (verificar)
- Plataformas de provedores ISP

### 2. API REST Intermediária

Crie endpoints REST que o app pode consumir:

```typescript
// GET /api/ont/:contractId/info
// Retorna informações da ONT

// GET /api/ont/:contractId/devices
// Lista dispositivos conectados

// POST /api/ont/:contractId/device/:macAddress/block
// Bloqueia/desbloqueia dispositivo

// POST /api/ont/:contractId/reboot
// Reinicia a ONT
```

### 3. Exemplo de Backend (Node.js + GenieACS)

```javascript
// server.js
const express = require('express');
const axios = require('axios');

const app = express();
const GENIEACS_URL = 'http://localhost:7557';

// Obter dispositivos conectados
app.get('/api/ont/:serialNumber/devices', async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    // Query GenieACS
    const response = await axios.get(
      `${GENIEACS_URL}/devices/${encodeURIComponent(serialNumber)}/tasks?query=Device.Hosts.Host`
    );
    
    const devices = parseDevicesFromResponse(response.data);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bloquear dispositivo
app.post('/api/ont/:serialNumber/device/:mac/block', async (req, res) => {
  try {
    const { serialNumber, mac } = req.params;
    const { block } = req.body;
    
    // Envia comando para ACS
    await axios.post(`${GENIEACS_URL}/devices/${serialNumber}/tasks`, {
      name: 'setParameterValues',
      parameterValues: [
        [`Device.WiFi.AccessPoint.1.AssociatedDevice.${mac}.Block`, block]
      ]
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Configuração no App

### 1. Configure a URL da API

Edite o arquivo `.env`:

```env
EXPO_PUBLIC_ONT_API_URL=https://seu-servidor.com.br/api
```

### 2. Serviço já está implementado

O arquivo `services/ontDevicesService.ts` já está pronto para consumir sua API. Ele automaticamente:
- Usa dados reais quando `EXPO_PUBLIC_ONT_API_URL` está configurado
- Usa dados mock para desenvolvimento quando a URL não está configurada

## Segurança

### Autenticação

Adicione autenticação JWT ao backend:

```typescript
// No app, adicione token aos headers
const response = await fetch(`${this.apiBaseUrl}/ont/${contractId}/devices`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  },
});
```

### Permissões

- Valide que o usuário tem acesso ao contrato
- Limite operações críticas (bloqueio, reinício)
- Registre todas as ações em log

## Modelos de ONT Huawei Suportados

As principais ONTs Huawei com suporte TR-069:

- **HG8245H5**: Fibra GPON, 4 portas Ethernet, WiFi dual-band
- **HG8245Q2**: GPON, WiFi AC, 4 portas GE
- **HG8145V5**: GPON, WiFi AC, 4 portas GE, 2 POTS
- **HG8546M**: GPON, WiFi 6, 4 portas GE
- **EG8145V5**: GPON enterprise

## Teste e Validação

### Modo Mock (Atual)

O app já funciona com dados mock para demonstração:
- 6 dispositivos exemplo
- Informações da ONT simuladas
- Todas as funcionalidades visuais prontas

### Modo Produção

Após implementar o backend:
1. Configure `EXPO_PUBLIC_ONT_API_URL`
2. O serviço automaticamente mudará para usar a API real
3. Teste cada funcionalidade

## Próximos Passos

1. **Decisão de Infraestrutura**
   - Usar ACS do IXC (se disponível)
   - Implementar ACS próprio (GenieACS recomendado)

2. **Desenvolvimento Backend**
   - Implementar API REST
   - Integrar com ACS
   - Configurar segurança

3. **Configuração ONTs**
   - Habilitar TR-069
   - Configurar URL do ACS
   - Definir credenciais

4. **Testes**
   - Validar conexão ACS ↔ ONT
   - Testar comandos básicos
   - Validar segurança

## Recursos Adicionais

- **GenieACS Documentation**: https://genieacs.com/
- **TR-069 Specification**: https://www.broadband-forum.org/technical/download/TR-069.pdf
- **Huawei ONT Manuals**: Portal de suporte Huawei

## Suporte

Para dúvidas sobre implementação:
- Consulte a documentação do IXC sobre gerenciamento de ONTs
- Entre em contato com o suporte Huawei
- Comunidades de provedores ISP no Brasil
