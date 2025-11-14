# 🔐 Guia de Autenticação IXC - FiberNet App

## Documentação Oficial

**Referência:** [https://wikiapiprovedor.ixcsoft.com.br/#6](https://wikiapiprovedor.ixcsoft.com.br/#6)

---

## Método de Autenticação

### Endpoint

```
POST /webservice/Sessao_Usuario_Controle/login_token
```

### Headers Obrigatórios

```http
Content-Type: application/json
Accept: application/json
Authorization: Basic {TOKEN_BASE64}
```

**IMPORTANTE:** O token no header `Authorization` deve ser o **token de acesso à API do IXC** (fornecido pelo suporte IXC) codificado em Base64.

---

## Payload de Login

### Para Hotsite (Área do Cliente)

```json
{
  "login": "cliente@email.com",
  "senha": "senha_do_cliente"
}
```

**Campo `login`:** E-mail cadastrado do cliente no sistema IXC  
**Campo `senha`:** Senha do cliente para acesso ao hotsite

---

## Resposta de Sucesso

```json
{
  "token": "abc123xyz456...",
  "id_contrato": 12345,
  "nome_cliente": "João da Silva",
  "email": "cliente@email.com",
  "telefone": "(11) 99999-9999",
  "status_contrato": "Ativo"
}
```

### Campos Retornados

- **token**: Token de sessão do cliente (usar em requisições subsequentes)
- **id_contrato**: ID do contrato no IXC (necessário para todas as operações)
- **nome_cliente**: Nome completo do cliente
- **email**: E-mail do cliente
- **telefone**: Telefone de contato
- **status_contrato**: Status do contrato (Ativo, Vencido, Bloqueado, etc.)

---

## Resposta de Erro

### Credenciais Inválidas

```json
{
  "error": "AUTH_ERROR",
  "message": "E-mail ou senha inválidos",
  "code": 401
}
```

### Token de API Inválido

```json
{
  "error": "UNAUTHORIZED",
  "message": "Token de API inválido ou expirado",
  "code": 403
}
```

---

## Implementação no App FiberNet

### 1. Serviço de Autenticação (IXCService.ts)

```typescript
async login(email: string, senha: string): Promise<IXCAuthResponse> {
  const endpoint = '/login_token';
  const payload = {
    login: email,
    senha: senha,
  };

  const response = await fetch(`${this.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${btoa(IXC_API_TOKEN)}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('E-mail ou senha inválidos');
  }

  const data = await response.json();

  // Armazenar token e ID do contrato
  this._token = data.token;
  this._idContrato = data.id_contrato;

  return data;
}
```

### 2. Tela de Login (login.tsx)

```typescript
const handleLogin = async () => {
  if (!email || !password) {
    setError('Por favor, preencha todos os campos');
    return;
  }

  // Validar formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('Por favor, insira um e-mail válido');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    await login(email, password);
    router.replace('/(tabs)');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Erro ao fazer login');
  } finally {
    setIsLoading(false);
  }
};
```

---

## Credenciais Demo (Mock)

### Para Testes sem API Real

```
E-mail: test@fibernet.com
Senha: 123456
```

Essas credenciais funcionam no **modo mock** (desenvolvimento) e retornam dados simulados.

---

## Segurança

### Tokens

1. **Token de API (Header):**
   - Fornecido pelo IXC
   - Codificado em Base64
   - **Nunca** compartilhar ou expor no código-fonte
   - Armazenar em variável de ambiente (`EXPO_PUBLIC_IXC_API_TOKEN`)

2. **Token de Sessão (Response):**
   - Gerado após login bem-sucedido
   - Usar em todas as requisições subsequentes
   - Armazenar de forma segura (AsyncStorage com criptografia)
   - Limpar ao fazer logout

### Boas Práticas

- ✅ **Sempre validar formato de e-mail** antes de enviar requisição
- ✅ **Usar HTTPS** em produção
- ✅ **Implementar rate limiting** para prevenir ataques de força bruta
- ✅ **Criptografar dados sensíveis** em armazenamento local
- ✅ **Implementar timeout** nas requisições (30s máximo)
- ❌ **Nunca logar senhas** em console ou logs
- ❌ **Nunca armazenar senhas** localmente

---

## Fluxo de Autenticação Completo

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente                              │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 1. Digita e-mail e senha
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  App FiberNet                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Validação Local                                │   │
│  │  - Formato de e-mail                            │   │
│  │  - Campos obrigatórios                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 2. POST /login_token
                          │    Header: Authorization: Basic {TOKEN_API_BASE64}
                          │    Body: { login, senha }
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  IXC ERP API                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Validação de Credenciais                       │   │
│  │  - Token de API válido?                         │   │
│  │  - E-mail existe?                               │   │
│  │  - Senha correta?                               │   │
│  │  - Contrato ativo?                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 3. Resposta
                          │    { token, id_contrato, ... }
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  App FiberNet                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Armazenamento Seguro                           │   │
│  │  - AsyncStorage: token_sessao                   │   │
│  │  - Context: user data                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 4. Redireciona para /tabs
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Dashboard (Autenticado)                    │
│  - Exibe dados do cliente                               │
│  - Usa token_sessao em todas requisições               │
└─────────────────────────────────────────────────────────┘
```

---

## Requisições Autenticadas

Após login bem-sucedido, todas as requisições devem incluir:

### Header Authorization

```http
Authorization: Basic {TOKEN_SESSAO_BASE64}
```

**IMPORTANTE:** Codificar o **token de sessão** (retornado no login) em Base64.

### Payload com ID do Contrato

```json
{
  "id_contrato": 12345,
  // ... outros parâmetros
}
```

### Exemplo: Consultar Sinal

```bash
curl -X POST \
  https://api.fibernet.com.br/webservice/Sessao_Usuario_Controle/consultarSinal \
  -H "Authorization: Basic {TOKEN_SESSAO_BASE64}" \
  -H "Content-Type: application/json" \
  -d '{
    "id_contrato": 12345
  }'
```

---

## Tratamento de Erros

### Sessão Expirada

```json
{
  "error": "SESSION_EXPIRED",
  "message": "Sessão expirada. Faça login novamente.",
  "code": 401
}
```

**Ação:** Redirecionar para tela de login e limpar dados armazenados.

### Contrato Bloqueado

```json
{
  "error": "CONTRACT_BLOCKED",
  "message": "Contrato bloqueado por inadimplência",
  "code": 403
}
```

**Ação:** Exibir alerta e redirecionar para tela de faturas.

---

## Configuração de Produção

### 1. Obter Token de API

Entre em contato com o suporte do IXC:
- **E-mail:** suporte@ixcsoft.com.br
- **Telefone:** (Consulte documentação IXC)

### 2. Configurar .env

```env
# URL base do IXC
EXPO_PUBLIC_IXC_API_URL=https://api.fibernet.com.br/webservice/Sessao_Usuario_Controle

# Token de API fornecido pelo IXC (não codificar aqui)
EXPO_PUBLIC_IXC_API_TOKEN=seu_token_fornecido_ixc
```

### 3. Codificar Token em Base64

O token deve ser codificado automaticamente no código:

```typescript
const encodedToken = Buffer.from(process.env.EXPO_PUBLIC_IXC_API_TOKEN).toString('base64');
```

---

## Testes

### Testar Login com cURL

```bash
# Substitua {TOKEN_API} pelo token fornecido pelo IXC
curl -X POST \
  https://api.fibernet.com.br/webservice/Sessao_Usuario_Controle/login_token \
  -H "Authorization: Basic $(echo -n '{TOKEN_API}' | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "cliente@email.com",
    "senha": "senha_cliente"
  }'
```

### Testar no App (Modo Mock)

1. Configurar `.env`:
```env
EXPO_PUBLIC_MODE=mock
```

2. Usar credenciais demo:
```
E-mail: test@fibernet.com
Senha: 123456
```

---

## Suporte

### Documentação Oficial IXC

- Wiki da API: [https://wikiapiprovedor.ixcsoft.com.br/](https://wikiapiprovedor.ixcsoft.com.br/)
- Seção de Autenticação: [https://wikiapiprovedor.ixcsoft.com.br/#6](https://wikiapiprovedor.ixcsoft.com.br/#6)

### Contato IXC

- **E-mail:** suporte@ixcsoft.com.br
- **Site:** [https://ixcsoft.com.br/](https://ixcsoft.com.br/)

---

## Checklist de Implementação

- [x] Validar formato de e-mail no frontend
- [x] Implementar login com e-mail e senha
- [x] Codificar token de API em Base64
- [x] Armazenar token de sessão com segurança
- [x] Incluir id_contrato em todas requisições
- [x] Tratar erro de credenciais inválidas
- [x] Tratar erro de sessão expirada
- [x] Implementar logout e limpeza de dados
- [x] Adicionar timeout nas requisições
- [x] Implementar modo mock para testes
- [ ] Configurar token de API real (produção)
- [ ] Testar com credenciais reais
- [ ] Implementar refresh token (se disponível)
- [ ] Adicionar autenticação biométrica (opcional)

---

**Última atualização:** 13/11/2025  
**Versão do App:** 1.0.0  
**Versão da API IXC:** Consulte documentação oficial
