# PROTON - Sistema de Gestão de Processos e Documentos

## Visão Geral

O PROTON é um sistema de gestão interna desenvolvido para facilitar o controle de processos, documentos e colaboradores em uma organização. Ele oferece uma interface moderna e intuitiva para gerenciar o fluxo de documentos, tramitação de processos entre setores, assinatura digital de documentos e controle de acesso com diferentes níveis de permissão.

## Tecnologias Utilizadas

### Frontend
- **Next.js** (app router) - Framework React para renderização do lado do servidor
- **React** (versões 18/19) - Biblioteca para construção de interfaces
- **TypeScript** - Superset tipado de JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/UI** - Biblioteca de componentes baseada em Tailwind e Radix UI
- **Radix UI** - Componentes acessíveis e sem estilo
- **CMDK** - Componente para menus de comando e buscas
- **Sonner** - Sistema de notificações toast
- **TipTap** - Editor de texto rico para criação de documentos

### Backend
- **Next.js API Routes** - APIs serverless integradas
- **Prisma ORM** - ORM para acesso ao banco de dados
- **MySQL** - Banco de dados relacional
- **bcrypt/bcryptjs** - Biblioteca para criptografia de senhas
- **jsonwebtoken** - Implementação de JWT para autenticação
- **NextAuth** - Framework de autenticação para Next.js

### Processamento de Documentos
- **Puppeteer** - Navegador headless para geração de PDFs
- **pdf-lib** - Biblioteca para manipulação de documentos PDF
- **QRCode** - Geração de códigos QR para verificação de autenticidade
- **pdfjs-dist** - Renderização de PDFs no navegador
- **react-pdf** - Componente React para visualização de PDFs

## Estrutura do Projeto

```
📦 src/
 ┣ 📂 app/
 ┃ ┣ 📂 api/                    # APIs do sistema
 ┃ ┃ ┣ 📂 processos/            # Endpoints para processos
 ┃ ┃ ┣ 📂 documentos/           # Endpoints para documentos (nova API)
 ┃ ┃ ┣ 📂 documento/            # Endpoints para documentos (legado)
 ┃ ┃ ┣ 📂 colaboradores/        # Endpoints para gestão de colaboradores
 ┃ ┃ ┣ 📂 setores/              # Endpoints para setores
 ┃ ┃ ┣ 📂 permissoes/           # Endpoints para permissões
 ┃ ┃ ┗ 📂 auth/                 # Endpoints para autenticação
 ┃ ┣ 📂 administracao/          # Páginas de administração
 ┃ ┣ 📂 cadastros/              # Páginas de cadastros
 ┃ ┣ 📂 controle-de-processos/  # Interface principal de processos
 ┃ ┣ 📂 login/                  # Página de login
 ┃ ┣ 📂 perfil/                 # Página de perfil do usuário
 ┃ ┣ 📂 verificar-assinatura/   # Verificação de documentos assinados
 ┃ ┗ 📂 selecionar-setor/       # Seleção de setor ativo
 ┣ 📂 components/               # Componentes reutilizáveis
 ┣ 📂 lib/                      # Bibliotecas e utilitários
 ┃ ┣ 📜 pdfGenerator.ts         # Serviço unificado de PDF
 ┃ ┣ 📂 templates/              # Templates de documentos
 ┃ ┣ 📂 autorizacao/            # Lógica de autorização
 ┃ ┣ 📜 utils.ts                # Funções utilitárias
 ┃ ┗ 📜 prisma.ts               # Cliente Prisma
 ┣ 📂 types/                    # Definições de tipos
 ┗ 📂 stores/                   # Gerenciamento de estado (Zustand)
```

## Modelos de Dados

### Principais Entidades

#### Processo
Representa um processo administrativo completo que contém documentos e pode ser tramitado entre setores.
- Possui número, tipo, especificação, interessado
- Controle de acesso (público/restrito)
- Setor de origem e movimentações entre setores
- Documentos associados
- Estado de arquivamento

#### Documento
Representa um documento dentro de um processo.
- Pode ser um documento interno (gerado no sistema) ou externo (upload)
- Possui tipo, conteúdo HTML (para documentos internos) ou arquivo físico
- Suporta assinatura digital com hash e código de verificação
- Histórico de criação e modificação

#### Colaborador
Representa um usuário do sistema.
- Dados pessoais (nome, email, CPF, telefone)
- Cargo
- Setor associado
- Permissões de acesso
- Credenciais de login

#### Setor
Representa um departamento ou setor da organização.
- Nome
- Unidade/Loja associada
- Colaboradores associados
- Processos originados

#### Permissão
Define capacidades de acesso no sistema.
- Nome e código único
- Descrição
- Colaboradores associados

## Funcionalidades Principais

### Gestão de Processos
- Criação de processos administrativos com número sequencial
- Tramitação entre setores com registro de movimentações
- Controle de acesso e visualização
- Arquivamento e reabertura de processos
- Acompanhamento de histórico completo

### Gestão de Documentos
- Criação de documentos internos a partir de templates (memorandos, despachos, etc.)
- Upload de documentos externos
- Visualização em formato PDF
- Assinatura digital com registro de data/hora e cargo
- Verificação de autenticidade via QR Code

### Gestão de Colaboradores
- Cadastro completo de colaboradores
- Atribuição de permissões granulares
- Definição de setores e unidades
- Gerenciamento de senhas e acesso

### Segurança e Controle de Acesso
- Autenticação segura com senhas criptografadas
- Controle de permissões por funcionalidade
- Registro de ações dos usuários
- Verificação de assinaturas em documentos

## APIs do Sistema

### Processos
- `GET /api/processos`: Lista processos com filtros
- `POST /api/processos`: Cria novo processo
- `GET /api/processos/[id]`: Obtém detalhes de um processo
- `PATCH /api/processos/[id]`: Atualiza processo
- `DELETE /api/processos/[id]`: Exclui processo (se permitido)
- `POST /api/processos/[id]/tramitar`: Tramita processo para outro setor
- `POST /api/processos/[id]/arquivar`: Arquiva processo

### Documentos
- `GET /api/processos/[id]/documentos`: Lista documentos de um processo
- `POST /api/processos/[id]/documentos`: Cria novo documento em um processo
- `GET /api/processos/[id]/documentos/[docId]`: Obtém documento específico
- `PATCH /api/processos/[id]/documentos/[docId]`: Atualiza documento
- `DELETE /api/processos/[id]/documentos/[docId]`: Remove documento
- `POST /api/documentos/[id]/acoes/editar`: Edita documento
- `POST /api/documentos/[id]/acoes/assinar`: Assina documento
- `GET /api/documentos/[id]/acoes/verificar`: Verifica assinatura

### Colaboradores e Setores
- `GET /api/colaboradores`: Lista colaboradores
- `POST /api/colaboradores`: Cria colaborador
- `GET /api/setores`: Lista setores
- `POST /api/setores`: Cria setor
- `GET /api/permissoes`: Lista permissões disponíveis

## Recentes Melhorias (Refatoração)

### Serviço Unificado de Geração de PDF
- Implementação de módulo centralizado para geração de PDFs
- Funções reutilizáveis para formatação HTML e conversão para PDF
- Opções de cabeçalhos personalizados
- Depuração facilitada

### Padronização de Rotas API
- Estrutura consistente de endpoints
- Separação clara entre rotas de processos e documentos
- Ações específicas em documentos via `/acoes/{acao}`
- Compatibilidade com código legado durante transição

### Centralização dos Templates de Documentos
- Templates HTML extraídos para arquivos separados
- Sistema de tipos para validação de parâmetros
- Funções utilitárias para recuperação de templates
- Facilidade para adicionar ou modificar templates

## Próximos Passos

- **Documentação Swagger**: Adicionar documentação padronizada para todas as rotas API
- **Melhorar estrutura de componentes React**: Separar templates de documentos dos componentes UI
- **Dashboard inteligente**: Implementar dashboard com métricas e KPIs
- **Notificações em tempo real**: Alertas de novas tramitações e documentos
- **Busca avançada**: Implementar busca em texto completo nos documentos

## Requisitos de Sistema

- Node.js 18+ (recomendado 20+)
- MySQL 8.0+
- Ambiente para execução de Puppeteer (Chrome/Chromium)
- Mínimo de 4GB de RAM para desenvolvimento

## Instalação e Configuração

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Configure o arquivo `.env` com variáveis de ambiente
4. Execute as migrações do Prisma com `npx prisma migrate dev`
5. Popule o banco de dados com `npx prisma db seed`
6. Inicie o servidor de desenvolvimento com `npm run dev`

## Variáveis de Ambiente

```
# Database
DATABASE_URL="mysql://user:password@localhost:3306/proton"

# Authentication
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
``` 