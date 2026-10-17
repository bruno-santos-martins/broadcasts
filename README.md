# 🚀 UnniBlack — Plataforma de Gestão e Disparos Inteligentes de WhatsApp

Sistema completo e resiliente em arquitetura **Monorepo** para gerenciamento de conexões, contatos e transmissões em massa (broadcasts) agendadas de WhatsApp. 

Construído sob o **Paradigma Funcional Estrito**, com sincronização em tempo real via **WebSockets (Cloud Firestore)**, backend serverless com **Cloud Functions v2 (Cloud Scheduler)** e interface reativa moderna com **React 19, Vite, TypeScript, Tailwind CSS e Material UI**.

---

## 🏛️ Arquitetura e Decisões de Engenharia

### 1. Multi-Tenancy e Estrutura Plana do Firestore (Sem Subcoleções)
- **Zero Subcoleções:** Todas as entidades residem em coleções raiz no Cloud Firestore:
  - `/connections`: Instâncias e números de WhatsApp.
  - `/contacts`: Catálogo de contatos associados a uma conexão.
  - `/broadcasts`: Mensagens disparadas imediatamente ou agendadas para o futuro.
- **Isolamento de Dados:** Cada documento armazena obrigatoriamente o campo `userId`, atrelado diretamente ao `uid` do Firebase Authentication. As regras de segurança (`firestore.rules`) bloqueiam qualquer leitura ou escrita cruzada entre tenants.

### 2. Paradigma Funcional
- Sem classes, heranças ou uso de `this`.
- Todas as operações de banco de dados são compostas por funções puras assíncronas.
- Reatividade no client gerida exclusivamente através de Custom Hooks React (`useAuth`, `useConnections`, `useContacts`, `useBroadcasts`).

### 3. Worker Assíncrono com Cron Job (Cloud Functions v2)
- Uma Cloud Function com gatilho agendado (`onSchedule`) executa a cada 1 minuto (`schedule: 'every 1 minutes'`).
- Busca documentos com `status == 'SCHEDULED'` cujo `scheduledAt <= Timestamp.now()`.
- Efetua a transição atômica de status para `'SENT'` via `db.batch()`, dividindo em blocos seguros de até 500 operações.
- Quando o worker atualiza o Firestore na nuvem, a interface do usuário reflete a mudança **instantaneamente** na tela sem necessidade de recarregar a página (F5), graças aos listeners nativos `onSnapshot`.

---

## 📂 Estrutura do Monorepo

```text
desafio_gcp_zap/
├── firebase.json            # Configuração do Firebase e portas padrão dos Emuladores
├── firestore.rules          # Regras de segurança multi-tenant no Firestore
├── firestore.indexes.json   # Definição de índices compostos
├── .firebaserc              # Vínculo com o projeto padrão no GCP/Firebase
├── package.json             # Orquestrador raiz do Monorepo (concurrently)
│
├── functions/               # Backend Serverless (Firebase Cloud Functions v2)
│   ├── src/
│   │   ├── config/          # Singleton seguro do Firebase Admin SDK
│   │   ├── types/           # Tipagens do Firestore e Status de Disparo
│   │   ├── repositories/    # Consultas Firestore e Batch updates atômicos
│   │   ├── use-cases/       # Orquestração da fila de disparos (Worker)
│   │   └── index.ts         # Exportação da Cloud Function agendada e trigger HTTP
│   └── package.json         # Scripts de compilação e deploy da Function
│
└── web/                     # Frontend SPA (React 19, Vite, TypeScript)
    ├── src/
    │   ├── components/      # Componentes funcionais e modais (UnniBlack Design)
    │   ├── contexts/        # AuthContext reativo conectado ao Firebase Auth
    │   ├── hooks/           # Custom Hooks com listeners em tempo real (onSnapshot)
    │   ├── pages/           # Telas: Login, Conexões, Contatos e Disparos
    │   ├── services/        # SDK client do Firestore e Authentication
    │   └── types/           # Interfaces e DTOs tipados
    └── package.json         # Dependências do frontend
```

---

## 🛠️ Como Subir o Projeto Localmente (Desenvolvimento)

O projeto está configurado para iniciar o ambiente completo (Backend Watch + Emuladores do Firebase + Frontend Vite) com **um único comando na raiz**:

### Pré-requisitos
- **Node.js**: Versão 20+ instalada.
- **Java**: JRE 11+ instalado (necessário para rodar o Firebase Firestore Emulator).
- **Firebase CLI**: Instalado globalmente (`npm install -g firebase-tools`).

### Passo a Passo

1. **Instalar dependências de todo o projeto:**
   ```bash
   # Na raiz do projeto:
   npm install
   npm --prefix functions install
   npm --prefix web install
   ```

2. **Subir tudo em paralelo:**
   ```bash
   npm run dev
   ```

O comando executará simultaneamente:
- `FUNCTIONS:WATCH`: Compilação contínua do TypeScript do backend (`tsc --watch`).
- `EMULATORS`: Firebase Emulator Suite (Auth na porta `9099`, Firestore na `8080`, Functions na `5001` e UI na `4000`).
- `WEB:VITE`: Servidor de desenvolvimento do Frontend na porta `5173`.

---

## 🌐 URLs e Acessos Locais

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:5173](http://localhost:5173) | Interface gráfica completa (Login, Conexões, Contatos, Disparos) |
| **Emulator Suite UI** | [http://localhost:4000](http://localhost:4000) | Painel visual do Firebase para gerenciar dados e logs |
| **Firestore Emulator** | [http://localhost:4000/firestore](http://localhost:4000/firestore) | Visualizador de coleções e documentos em tempo real |
| **Trigger Manual da Function** | [Endpoint HTTP](http://localhost:5001/desafio-gcp-zap/us-central1/triggerProcessScheduledBroadcasts) | Aciona o processamento imediato dos disparos agendados |

---

## ☁️ Como Subir para Produção no Google Cloud Platform (GCP) / Firebase

Quando for publicar o projeto na nuvem do Google:

### 1. Autenticar no Firebase
```bash
firebase login
```

### 2. Selecionar o Projeto da GCP
```bash
firebase use SEU_PROJECT_ID
```
*(Substitua `SEU_PROJECT_ID` pelo ID do projeto criado no [Console do Firebase / GCP](https://console.firebase.google.com)).*

### 3. Fazer Deploy Completo
Na raiz do projeto, execute:
```bash
npm run deploy
```
Este comando executará:
- Compilação do TypeScript das Cloud Functions.
- Publicação da Cloud Function v2 (`processScheduledBroadcasts`) associada ao Google Cloud Scheduler.
- Publicação das regras de segurança multi-tenant (`firestore.rules`).
- Publicação das configurações de índices (`firestore.indexes.json`).

> **Deploy Apenas das Functions:**
> ```bash
> npm run deploy:functions
> ```

---

## 🛡️ Regras de Segurança Multi-Tenant (`firestore.rules`)

As coleções `/connections`, `/contacts` e `/broadcasts` são protegidas por regras estritas:
- Leitura (`read`), exclusão (`delete`) e atualização (`update`) são permitidas **apenas se** `resource.data.userId == request.auth.uid`.
- Criação (`create`) é permitida **apenas se** o usuário estiver autenticado e `request.resource.data.userId == request.auth.uid`.
- Qualquer tentativa de alterar a posse do documento ou acessar coleções inexistentes é rejeitada automaticamente pelo Firebase com código `403 (PERMISSION_DENIED)`.
