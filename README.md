# 🚀 PROTON - Sistema de Gestão Interna

O **PROTON** é um sistema administrativo interno focado em **gestão de processos, documentos e colaboradores**, desenvolvido com tecnologias modernas para garantir **segurança, performance e escalabilidade**.

---

## 🛠️ Tecnologias Utilizadas

### 🔹 Frontend
- **Next.js** (`app/` router)
- **React** (18/19)
- **TypeScript**
- **Tailwind CSS** (estilização rápida e responsiva)
- **Shadcn/UI** (biblioteca de componentes moderna baseada em Tailwind)
- **Radix UI** (Popover, Combobox, acessibilidade)
- **CMDK** (Command menu e busca em selects)
- **Sonner** (sistema de notificações/toasts)
- **clsx/cn** (utilitário para manipular classes CSS)

### 🔹 Backend (APIs internas Next.js)
- **Prisma ORM** (gestão de banco de dados)
- **MySQL** (banco de dados relacional)
- **bcryptjs** (criptografia de senhas)
- **pdf-lib** (geração e assinatura de PDFs)
- **SHA-256** (controle de integridade de documentos)
- **Puppeteer** (planejado para renderizar documentos em PDF)

### 🔹 Outras Tecnologias
- **Radix UI Popover + Command** (para select multi seleção moderna)
- **QR Code nos documentos assinados** (para verificação de autenticidade)

---

## 📋 Funcionalidades Principais

- ✅ **Login com autenticação segura** (email e senha criptografados)
- ✅ **Cadastro e gestão de colaboradores**
- ✅ **Gerenciamento de permissões de acesso** (múltiplas permissões por colaborador)
- ✅ **Cadastro e gestão de setores**
- ✅ **Controle de processos e tramitação entre setores**
- ✅ **Criação e gestão de documentos internos e externos**
- ✅ **Assinatura digital de documentos internos**
- ✅ **Geração de QR Code para verificação de documentos assinados**
- ✅ **Arquivamento e reabertura de processos**
- ✅ **Visualização e download de documentos em PDF**

---
## 🏗️ Estrutura do Projeto:

📦 src/
 ┣ 📂 app/
 ┃ ┣ 📂 api/
 ┃ ┃ ┣ 📂 colaboradores/        # Endpoints de CRUD para colaboradores (cadastrar, listar, editar, excluir)
 ┃ ┃ ┣ 📂 permissoes/            # Endpoints de CRUD para permissões
 ┃ ┃ ┣ 📂 setores/               # Endpoints para gerenciamento de setores
 ┃ ┃ ┣ 📂 processos/             # Endpoints para processos (criar, tramitar, arquivar)
 ┃ ┃ ┗ 📂 documentos/            # Endpoints para upload e assinatura de documentos
 ┃ ┣ 📂 cadastros/
 ┃ ┃ ┣ 📂 colaboradores/         # Página de cadastro e listagem de colaboradores
 ┃ ┃ ┣ 📂 setores/               # Página de cadastro de setores
 ┃ ┃ ┣ 📂 tipo-de-processo/       # Página para cadastrar tipos de processos
 ┃ ┃ ┗ 📂 tipo-de-documento/      # Página para cadastrar tipos de documentos
 ┃ ┣ 📂 controle-de-processos/
 ┃ ┃ ┗ 📜 page.tsx               # Tela principal de controle e tramitação de processos
 ┃ ┗ 📂 login/
 ┃ ┃ ┗ 📜 page.tsx               # Tela de login de acesso ao sistema
 ┣ 📂 components/
 ┃ ┣ 📂 ui/
 ┃ ┃ ┣ 📜 button.tsx             # Componente de botão (Shadcn)
 ┃ ┃ ┣ 📜 input.tsx              # Componente de input (Shadcn)
 ┃ ┃ ┣ 📜 label.tsx              # Componente de label (Shadcn)
 ┃ ┃ ┣ 📜 breadcrumb.tsx         # Componente de breadcrumb (navegação)
 ┃ ┃ ┣ 📜 multi-select.tsx       # Componente de MultiSelect com busca (permissões)
 ┃ ┃ ┣ 📜 modalEditarColaborador.tsx # Modal para editar colaborador
 ┃ ┃ ┣ 📜 modalExcluirColaborador.tsx # Modal para excluir colaborador
 ┃ ┃ ┣ 📜 modalVisualizarColaborador.tsx # Modal para visualizar dados do colaborador
 ┃ ┃ ┗ 📜 modalAlterarSenha.tsx  # Modal para alterar senha de colaborador
 ┣ 📂 lib/
 ┃ ┣ 📜 prisma.ts                # Configuração do Prisma Client para acesso ao banco
 ┃ ┣ 📜 utils.ts                 # Funções utilitárias (ex: cn() para classes Tailwind)
 ┃ ┗ 📜 auth.ts                  # (opcional) Gerenciamento de autenticação e sessão
 ┗ 📂 prisma/
   ┣ 📜 schema.prisma             # Definição dos modelos do banco de dados Prisma (Colaborador, Setor, Permissão, Processo, etc.)
   ┗ 📜 seed.ts                   # Script para inserir dados iniciais no banco (ex: permissões padrão, setores)

