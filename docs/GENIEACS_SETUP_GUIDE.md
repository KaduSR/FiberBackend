# Guia Completo de Instalação e Configuração do GenieACS

## 📋 Visão Geral

Este guia mostra como instalar e configurar o GenieACS para gerenciar ONTs Huawei da FiberNet via TR-069/CWMP.

## 🖥️ Instalação do GenieACS

### Ubuntu/Debian

#### 1. Instalar Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Instalar MongoDB

```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### 3. Instalar GenieACS

```bash
sudo npm install -g genieacs
```

#### 4. Criar Usuário do Sistema

```bash
sudo useradd --system --no-create-home --user-group genieacs
```

#### 5. Criar Estrutura de Diretórios

```bash
sudo mkdir -p /opt/genieacs/ext
sudo chown -R genieacs:genieacs /opt/genieacs
```

#### 6. Criar Arquivo de Configuração

```bash
sudo nano /opt/genieacs/genieacs.env
```

Conteúdo:
```env
GENIEACS_CWMP_ACCESS_LOG_FILE=/var/log/genieacs/genieacs-cwmp-access.log
GENIEACS_NBI_ACCESS_LOG_FILE=/var/log/genieacs/genieacs-nbi-access.log
GENIEACS_FS_ACCESS_LOG_FILE=/var/log/genieacs/genieacs-fs-access.log
GENIEACS_UI_ACCESS_LOG_FILE=/var/log/genieacs/genieacs-ui-access.log
GENIEACS_DEBUG_FILE=/var/log/genieacs/genieacs-debug.yaml

# MongoDB
GENIEACS_MONGODB_CONNECTION_URL=mongodb://127.0.0.1/genieacs

# Extensões
GENIEACS_EXT_DIR=/opt/genieacs/ext

# UI
GENIEACS_UI_JWT_SECRET=secret_change_me_in_production
```

#### 7. Criar Diretório de Logs

```bash
sudo mkdir -p /var/log/genieacs
sudo chown -R genieacs:genieacs /var/log/genieacs
```

#### 8. Criar Services do systemd

**genieacs-cwmp.service** (TR-069 Server - porta 7547):
```bash
sudo nano /etc/systemd/system/genieacs-cwmp.service
```

```ini
[Unit]
Description=GenieACS CWMP
After=network.target

[Service]
User=genieacs
EnvironmentFile=/opt/genieacs/genieacs.env
ExecStart=/usr/bin/genieacs-cwmp
Restart=always

[Install]
WantedBy=multi-user.target
```

**genieacs-nbi.service** (Northbound Interface API - porta 7557):
```bash
sudo nano /etc/systemd/system/genieacs-nbi.service
```

```ini
[Unit]
Description=GenieACS NBI
After=network.target

[Service]
User=genieacs
EnvironmentFile=/opt/genieacs/genieacs.env
ExecStart=/usr/bin/genieacs-nbi
Restart=always

[Install]
WantedBy=multi-user.target
```

**genieacs-fs.service** (File Server - porta 7567):
```bash
sudo nano /etc/systemd/system/genieacs-fs.service
```

```ini
[Unit]
Description=GenieACS FS
After=network.target

[Service]
User=genieacs
EnvironmentFile=/opt/genieacs/genieacs.env
ExecStart=/usr/bin/genieacs-fs
Restart=always

[Install]
WantedBy=multi-user.target
```

**genieacs-ui.service** (Web UI - porta 3000):
```bash
sudo nano /etc/systemd/system/genieacs-ui.service
```

```ini
[Unit]
Description=GenieACS UI
After=network.target

[Service]
User=genieacs
EnvironmentFile=/opt/genieacs/genieacs.env
ExecStart=/usr/bin/genieacs-ui
Restart=always

[Install]
WantedBy=multi-user.target
```

#### 9. Iniciar Serviços

```bash
sudo systemctl daemon-reload

sudo systemctl enable genieacs-cwmp
sudo systemctl enable genieacs-nbi
sudo systemctl enable genieacs-fs
sudo systemctl enable genieacs-ui

sudo systemctl start genieacs-cwmp
sudo systemctl start genieacs-nbi
sudo systemctl start genieacs-fs
sudo systemctl start genieacs-ui
```

#### 10. Verificar Status

```bash
sudo systemctl status genieacs-cwmp
sudo systemctl status genieacs-nbi
sudo systemctl status genieacs-fs
sudo systemctl status genieacs-ui
```

## 🌐 Acessar Interface Web

Abra o navegador em: `http://seu-servidor:3000`

## 🔧 Configuração das ONTs Huawei

### Via Interface Web da ONT

1. Acesse a ONT via navegador (geralmente `http://192.168.1.1`)
2. Login com credenciais de administrador
3. Navegue até **Gerenciamento** → **TR-069**
4. Configure:

```
ACS URL: http://seu-servidor:7547
ACS Username: (vazio ou conforme sua config)
ACS Password: (vazio ou conforme sua config)
Periodic Inform Enable: Ativado
Periodic Inform Interval: 300 (segundos)
Connection Request Username: admin
Connection Request Password: admin
Connection Request Port: 7547
```

5. Salve e aguarde a ONT conectar

### Via CLI (Telnet/SSH)

```bash
# Conectar na ONT
telnet 192.168.1.1

# Login
Username: root
Password: admin

# Configurar TR-069
enable
config
cwmp
set acs url http://seu-servidor:7547
set acs username ""
set acs password ""
set inform enable 1
set inform interval 300
set cpe username admin
set cpe password admin
commit
```

## 📊 Verificar Conexão

### No GenieACS

```bash
curl http://localhost:7557/devices | jq
```

### Via Interface Web

1. Acesse `http://seu-servidor:3000`
2. Clique em **Devices**
3. Você deve ver suas ONTs listadas

## 🔍 Explorar Parâmetros da ONT

### Listar Todos os Parâmetros

```bash
curl http://localhost:7557/devices/HWTC12345678 | jq
```

### Parâmetros Importantes

```bash
# Informações do dispositivo
DeviceID.Manufacturer
DeviceID.ModelName
DeviceID.SerialNumber
DeviceID.SoftwareVersion

# Sinal óptico
Device.Optical.Interface.1.OpticalSignalLevel
Device.Optical.Interface.1.TransmitOpticalLevel

# Dispositivos conectados
Device.Hosts.Host
Device.WiFi.AccessPoint.1.AssociatedDevice
```

## 🎯 Criar Presets no GenieACS

Presets automatizam tarefas comuns.

### Via Interface Web

1. Acesse **Admin** → **Presets**
2. Clique em **New**
3. Crie preset para refresh:

```javascript
// Nome: refresh_all
// Intervalo: Vazio
// Condição: Vazio
// Configuração:
declare("Device.Hosts.Host.*", {path: 1});
declare("Device.WiFi.AccessPoint.*.AssociatedDevice.*", {path: 1});
```

### Via API

```bash
curl -X POST http://localhost:7557/presets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "refresh_all",
    "configuration": "declare(\"Device.Hosts.Host.*\", {path: 1});\ndeclare(\"Device.WiFi.AccessPoint.*.AssociatedDevice.*\", {path: 1});"
  }'
```

## 🚀 Integração com Backend FiberNet

### 1. Configure o Backend

```bash
cd backend
cp .env.example .env
nano .env
```

```env
GENIEACS_URL=http://localhost:7557
API_KEY=sua_chave_secreta
```

### 2. Inicie o Backend

```bash
npm install
npm start
```

### 3. Configure o App Mobile

Edite `.env` no projeto React Native:

```env
EXPO_PUBLIC_ONT_API_URL=http://seu-servidor:3000/api
```

### 4. Teste a Integração

```bash
# Via backend
curl -H "x-api-key: sua_chave" \
  http://localhost:3000/api/ont/HWTC12345678/info
```

## 🔐 Segurança em Produção

### 1. Firewall

```bash
# Permitir apenas IPs necessários
sudo ufw allow from 192.168.1.0/24 to any port 7547  # TR-069 (ONTs)
sudo ufw allow from SEU_IP to any port 7557          # API (Backend)
sudo ufw allow from SEU_IP to any port 3000          # UI
```

### 2. Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/genieacs
server {
    listen 80;
    server_name genieacs.fibernet.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 7547;
    server_name acs.fibernet.com.br;

    location / {
        proxy_pass http://localhost:7547;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. HTTPS com Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d genieacs.fibernet.com.br
```

## 📈 Monitoramento

### Logs em Tempo Real

```bash
sudo tail -f /var/log/genieacs/genieacs-cwmp-access.log
sudo tail -f /var/log/genieacs/genieacs-nbi-access.log
```

### Status dos Serviços

```bash
sudo systemctl status genieacs-*
```

## 🐛 Troubleshooting

### ONT Não Conecta

1. Verifique firewall:
   ```bash
   sudo ufw status
   ```

2. Verifique se CWMP está rodando:
   ```bash
   sudo systemctl status genieacs-cwmp
   sudo netstat -tlnp | grep 7547
   ```

3. Verifique logs:
   ```bash
   sudo journalctl -u genieacs-cwmp -f
   ```

### Erro de Permissão

```bash
sudo chown -R genieacs:genieacs /opt/genieacs
sudo chown -R genieacs:genieacs /var/log/genieacs
```

### MongoDB Não Conecta

```bash
sudo systemctl status mongodb
sudo systemctl restart mongodb
```

## 📚 Recursos Adicionais

- [GenieACS GitHub](https://github.com/genieacs/genieacs)
- [GenieACS Wiki](https://github.com/genieacs/genieacs/wiki)
- [TR-069 Documentation](https://www.broadband-forum.org/technical/download/TR-069.pdf)
- [Huawei ONT Manuals](https://carrier.huawei.com/)

## 💡 Dicas

1. **Backup Regular do MongoDB**:
   ```bash
   mongodump --db genieacs --out /backup/genieacs-$(date +%Y%m%d)
   ```

2. **Atualizar GenieACS**:
   ```bash
   sudo npm update -g genieacs
   sudo systemctl restart genieacs-*
   ```

3. **Performance**: Para muitas ONTs (>1000), considere aumentar recursos do MongoDB

4. **Desenvolvimento**: Use Docker para ambiente de testes:
   ```bash
   docker run -d --name genieacs \
     -p 7547:7547 -p 7557:7557 -p 7567:7567 -p 3000:3000 \
     drumsergio/genieacs
   ```
