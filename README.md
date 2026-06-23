# 🚀 Prova NestJS — Sistema de Autenticação com Microsserviços

Solução robusta e escalável desenvolvida em **NestJS** para **gerenciamento, criação, consulta e autenticação de usuários**, utilizando uma arquitetura distribuída de **Microsserviços**.

A comunicação entre a API pública (Gateway) e o serviço interno de negócios (Microsserviço) é realizada de forma síncrona/assíncrona via protocolo nativo **TCP**, garantindo o desacoplamento total entre as camadas.



---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **NestJS** | ^11.0 | Framework principal |
| **TypeScript** | ^5.7 | Linguagem base |
| **@nestjs/microservices** | ^11.1 | Transporte TCP entre serviços |
| **@nestjs/jwt** | ^11.0 | Geração e validação de tokens JWT |
| **@nestjs/passport** | ^11.0 | Estratégia de autenticação |
| **bcrypt** | ^6.0 | Hash seguro de senhas |
| **@nestjs/swagger** | ^11.4 | Documentação interativa da API |
| **class-validator** | ^0.15 | Validação de DTOs |

---

## 🏗️ Arquitetura do Sistema

O ecossistema é dividido em **dois processos independentes** que rodam em paralelo e se comunicam via TCP:

```
Cliente / Frontend
       │
       │  HTTP (porta 3000)
       ▼
┌─────────────────────┐
│    API GATEWAY      │  → Recebe requisições HTTP
│   (main.ts)         │  → Valida DTOs
│                     │  → Configura CORS global
│                     │  → Expõe documentação Swagger
└──────────┬──────────┘
           │
           │  TCP (porta 3001)
           ▼
┌─────────────────────┐
│  USER MICROSERVICE  │  → Processa regras de negócio
│ (main-microservice) │  → Cria e autentica usuários
│                     │  → Gerencia persistência (in-memory)
│                     │  → Gera tokens JWT
└─────────────────────┘
```

### 1. API Gateway — Porta `3000`

- Ponto de entrada externo para todas as requisições HTTP
- Configura liberação global de **CORS** (aceita qualquer origem)
- Ativa **ValidationPipe** globalmente para validar todos os DTOs
- Disponibiliza a documentação interativa via **Swagger**
- Não processa dados diretamente — despacha comandos via TCP ao microsserviço e aguarda a resposta com `firstValueFrom()`

### 2. User Microservice — Porta `3001`

- Isolado do mundo externo, escuta apenas conexões TCP internas
- Implementa a lógica de criação de usuários com `bcrypt` para hash de senhas
- Executa a autenticação validando credenciais e retornando um token **JWT**
- Mantém os usuários em memória (array em tempo de execução)
- Responde aos padrões de mensagem: `create_user`, `login_user`, `find_all_users`

---

## ✅ Requisitos Atendidos

| # | Requisito | Status |
|---|---|---|
| 1 | Métodos de Login, Criação e Consulta de usuários | ✅ |
| 2 | Autenticação com JWT + validação via Guard customizado | ✅ |
| 3 | CORS liberado globalmente no Gateway | ✅ |
| 4 | Documentação completa de endpoints com `@nestjs/swagger` | ✅ |
| 5 | Arquitetura em Microsserviços via `Transport.TCP` | ✅ |

---

## 🔧 Instalação

**Pré-requisito:** Node.js **v18 ou superior** instalado.

Na raiz do projeto (`prov.nest`), instale todas as dependências com um único comando:

```bash
npm install
```

---

## ▶️ Como Executar a Aplicação

Por se tratar de uma arquitetura de microsserviços, é **obrigatório manter dois terminais abertos simultaneamente** para que os componentes se comuniquem.

### Terminal 1 — API Gateway (HTTP)

```bash
npm run start:dev
```

Sobe o servidor HTTP com hot-reload. Ao iniciar, você verá no console:

```
API Gateway rodando em: http://localhost:3000
Documentação Swagger em: http://localhost:3000/api/docs
```

### Terminal 2 — Microsserviço de Usuários (TCP)

```bash
npm run start:ms
```

Inicializa o listener TCP. Ao iniciar, você verá no console:

```
🤖 Microsserviço de Autenticação/Usuários rodando via TCP na porta 3001
```

> ⚠️ **Atenção:** O Gateway não consegue processar nenhuma requisição sem que o microsserviço esteja ativo. Sempre suba os dois processos antes de realizar testes.

---

## 🧪 Endpoints Disponíveis

Acesse `http://localhost:3000/api/docs` com os dois serviços ativos para testar visualmente pela interface do Swagger.

### 📌 Base URL: `http://localhost:3000`

---

### 👤 Criar Usuário

- **Método:** `POST`
- **Rota:** `/auth/register`
- **Autenticação:** Não requerida

**Payload (JSON):**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta de sucesso (`201 Created`):**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com"
}
```

**Resposta de erro — e-mail já cadastrado (`400 Bad Request`):**

```json
{
  "message": "E-mail já cadastrado no sistema.",
  "statusCode": 400
}
```

---

### 🔑 Autenticar Usuário (Login)

- **Método:** `POST`
- **Rota:** `/auth/login`
- **Autenticação:** Não requerida

**Payload (JSON):**

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta de sucesso (`200 OK`):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta de erro — credenciais inválidas (`401 Unauthorized`):**

```json
{
  "message": "Credenciais inválidas.",
  "statusCode": 401
}
```

---

### 📋 Consultar Todos os Usuários

- **Método:** `GET`
- **Rota:** `/auth/users`
- **Autenticação:** 🔒 **Requerida — Bearer JWT Token**

**Header obrigatório:**

```
Authorization: Bearer <seu_access_token>
```

**Resposta de sucesso (`200 OK`):**

```json
[
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com"
  }
]
```

> As senhas nunca são retornadas — o campo `password` é omitido em todas as respostas.

---

## 🔐 Como Usar a Autenticação JWT no Swagger

1. Acesse `http://localhost:3000/api/docs`
2. Utilize o endpoint `POST /auth/register` para criar um usuário
3. Utilize o endpoint `POST /auth/login` com as credenciais criadas
4. Copie o valor do campo `access_token` retornado
5. Clique no botão **"Authorize 🔓"** no topo da página do Swagger
6. Cole o token no campo `Bearer` e confirme
7. O endpoint protegido `GET /auth/users` já estará acessível

---

## 📁 Estrutura do Projeto

```
prov.nest/
├── src/
│   ├── dtos/
│   │   ├── create-user.dto.ts    # Validação de campos do registro
│   │   └── login.dto.ts          # Validação de campos do login
│   ├── app.controller.ts         # Rotas HTTP + MessagePatterns TCP
│   ├── app.module.ts             # Módulo raiz (JWT + ClientesTCP)
│   ├── app.service.ts            # Regras de negócio (criar, autenticar, listar)
│   ├── jwt-auth.guard.ts         # Guard para proteção de rotas com JWT
│   ├── main.ts                   # Bootstrap do API Gateway (porta 3000)
│   └── main-microservice.ts      # Bootstrap do Microsserviço TCP (porta 3001)
├── test/
│   └── app.e2e-spec.ts
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 📋 Outros Scripts Disponíveis

```bash
# Build para produção
npm run build

# Rodar em produção (após o build)
npm run start:prod

# Rodar testes unitários
npm test

# Rodar testes com cobertura
npm run test:cov

# Rodar testes E2E
npm run test:e2e

# Formatar código com Prettier
npm run format

# Lint e correção automática
npm run lint
```

---

## ⚙️ Variáveis de Configuração

As seguintes configurações estão definidas diretamente no código. Para ambientes de produção, recomenda-se externalizá-las via variáveis de ambiente (`.env`):

| Configuração | Valor Atual | Localização |
|---|---|---|
| `JWT_SECRET` | `PROVA_NEST_SECRET_KEY_2026` | `app.module.ts` |
| `JWT_EXPIRATION` | `1h` | `app.module.ts` |
| `GATEWAY_PORT` | `3000` | `main.ts` |
| `MICROSERVICE_PORT` | `3001` | `main-microservice.ts` |
| `CORS_ORIGIN` | `*` (qualquer origem) | `main.ts` |