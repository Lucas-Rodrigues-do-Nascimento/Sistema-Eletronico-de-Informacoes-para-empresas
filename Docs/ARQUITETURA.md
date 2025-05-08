# Arquitetura do Sistema PROTON

Este documento descreve a arquitetura técnica do sistema PROTON, incluindo componentes, fluxo de dados e decisões de design.

## Visão Geral da Arquitetura

O PROTON é construído como uma aplicação web moderna utilizando o framework Next.js com o app router, combinando renderização do lado do servidor (SSR) e componentes do lado do cliente. A arquitetura segue um design modular com separação clara de responsabilidades.

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ Componentes │ │    Pages    │ │  Stores (Zustand)   │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       API ROUTES                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  Processos  │ │ Documentos  │ │    Autenticação     │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    CAMADA DE SERVIÇOS                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ PDF Service │ │ Auth Service│ │  Permissões Service │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       DATA ACCESS                           │
│                      PRISMA ORM                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    BANCO DE DADOS                           │
│                        MySQL                                │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### Frontend

- **Páginas da Aplicação**: Implementadas como componentes React no diretório `app/`
- **Componentes UI**: Baseados em Shadcn/UI e Radix para consistência e acessibilidade
- **Gerenciamento de Estado**: Combinação de React Hooks para estado local e Zustand para estado global
- **Comunicação com API**: SWR para data fetching com cache e revalidação

### Backend

- **API Routes**: Implementadas usando as API Routes do Next.js no diretório `app/api`
- **Autenticação**: NextAuth.js para gerenciamento de sessões e autenticação
- **Permissões**: Sistema próprio de verificação de permissões por funcionalidade
- **Serviços**:
  - Serviço de PDF: Abstração sobre Puppeteer para geração de documentos
  - Serviço de Templates: Centralização de templates HTML para documentos
  - Serviço de Autenticação: Verificação de credenciais e sessões

### Persistência de Dados

- **ORM**: Prisma para mapeamento objeto-relacional e migrações
- **Banco de Dados**: MySQL para armazenamento relacional
- **Cache**: Estratégias de cache SWR no cliente para otimização

## Fluxo de Dados

### Criação de Processo

```
┌──────────────┐     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Formulário   │     │ API Route    │    │ Serviço de   │    │  Database    │
│ de Processo  │────▶│ /processos   │───▶│ Processos    │───▶│  (Prisma)    │
└──────────────┘     └──────────────┘    └──────────────┘    └──────────────┘
                            │                                        │
                            ▼                                        │
                     ┌──────────────┐                                │
                     │  Notificação │◀───────────────────────────────┘
                     │  ao usuário  │
                     └──────────────┘
```

### Geração e Assinatura de Documento

```
┌──────────────┐     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Editor de    │     │ API Route    │    │ Serviço de   │    │ HTML to PDF  │
│ Documento    │────▶│ /documentos  │───▶│ Templates    │───▶│ (Puppeteer)  │
└──────────────┘     └──────────────┘    └──────────────┘    └──────────────┘
        ▲                   │                                        │
        │                   ▼                                        ▼
┌──────────────┐     ┌──────────────┐                         ┌──────────────┐
│ Exibição do  │     │ Serviço de   │                         │ Armazenamento│
│ PDF no cliente│◀───│ Assinatura   │◀────────────────────────│ do PDF       │
└──────────────┘     └──────────────┘                         └──────────────┘
```

## Modelo de Dados

O modelo de dados do PROTON é centrado em entidades-chave relacionadas através de chaves estrangeiras:

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   Processo    │      │   Documento   │      │   Movimentacao│
├───────────────┤      ├───────────────┤      ├───────────────┤
│ id            │──┐   │ id            │      │ id            │
│ numero        │  │   │ nome          │      │ processoId    │──┐
│ tipo          │  │   │ tipo          │      │ deSetor       │  │
│ especificacao │  │   │ processoId    │──┐   │ paraSetor     │  │
│ interessado   │  │   │ conteudo      │  │   │ observacoes   │  │
│ acesso        │  │   │ conteudoHtml  │  │   └───────────────┘  │
│ observacoes   │  │   │ arquivo       │  │           ▲          │
│ setorOrigemId │  │   │ arquivoFisico │  └───────────┘          │
│ criadorId     │  │   │ assinadoPor   │                         │
└───────────────┘  │   │ assinadoEm    │                         │
        ▲          │   └───────────────┘                         │
        │          │           ▲                                 │
        │          └───────────┘                                 │
        │                                                        │
        └────────────────────────────────────────────────────────┘
```

### Relações Principais

- Um **Processo** possui múltiplos **Documentos**
- Um **Processo** possui múltiplas **Movimentações** entre setores
- Um **Processo** pertence a um **Setor** de origem
- Um **Processo** possui um **Colaborador** criador
- Um **Colaborador** possui múltiplas **Permissões**
- Um **Colaborador** pertence a um **Setor**
- Um **Setor** pertence a uma **Unidade/Loja**

## Autenticação e Autorização

### Fluxo de Autenticação

1. Usuário submete credenciais (email/senha) na página de login
2. Credenciais são verificadas contra o banco de dados
3. Se válidas, uma sessão é criada utilizando NextAuth
4. O token da sessão é armazenado em cookies seguros
5. Requisições subsequentes incluem o token para autenticação

### Fluxo de Autorização

1. Usuário tenta acessar um recurso ou funcionalidade
2. O sistema verifica a sessão do usuário
3. As permissões do usuário são carregadas (através de seu ID)
4. O sistema verifica se o usuário possui a permissão necessária
5. Acesso é concedido ou negado baseado nas permissões

```
┌──────────────┐     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Requisição   │     │ Middleware   │    │ Serviço de   │    │ Base de Dados│
│ do Cliente   │────▶│ de Auth      │───▶│ Permissões   │───▶│ (Permissões) │
└──────────────┘     └──────────────┘    └──────────────┘    └──────────────┘
                            │                    │                   │
                            ▼                    ▼                   │
                     ┌──────────────┐    ┌──────────────┐           │
                     │ Autorizado?  │    │  Verificação │◀──────────┘
                     │   Sim/Não    │◀───│  de Acesso   │
                     └──────────────┘    └──────────────┘
```

## Geração de PDF

O serviço de geração de PDF é um componente central do sistema, responsável por converter templates HTML em documentos PDF formatados. O processo envolve:

1. Seleção do template HTML correspondente ao tipo de documento
2. Preenchimento do template com dados dinâmicos
3. Adição de cabeçalho institucional conforme configuração
4. Renderização do HTML utilizando Puppeteer
5. Conversão para PDF e retorno do buffer

```
┌──────────────┐     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Template HTML│     │ Preprocessor │    │ Chromium     │    │ PDF Buffer   │
│ + Dados      │────▶│ (Headers)    │───▶│ (Puppeteer)  │───▶│              │
└──────────────┘     └──────────────┘    └──────────────┘    └──────────────┘
```

## Considerações de Escalabilidade

A arquitetura do PROTON foi projetada para escalar adequadamente em diferentes dimensões:

### Escalabilidade Vertical

- Otimização de consultas ao banco de dados através de índices e relações eficientes
- Implementação de caching (SWR) para reduzir o número de requisições repetidas
- Otimização de recursos através de carregamento lazy de componentes

### Escalabilidade Horizontal

- API Routes sem estado, permitindo múltiplas instâncias
- Banco de dados separado do servidor de aplicação
- Sessões armazenadas em cookies, não em memória

## Considerações de Segurança

- **Autenticação**: Senha armazenada com hash bcrypt
- **Autorização**: Verificação granular de permissões
- **CSRF**: Proteção contra Cross-Site Request Forgery
- **XSS**: Sanitização de entrada de dados do usuário
- **SQL Injection**: Prevenção através do uso de Prisma ORM com parâmetros preparados

## Escolhas Tecnológicas e Justificativas

| Tecnologia | Alternativas Consideradas | Justificativa para Escolha |
|------------|---------------------------|----------------------------|
| Next.js | Create React App, Remix | SSR, rotas API integradas, melhor SEO e performance inicial |
| MySQL | PostgreSQL, MongoDB | Natureza relacional dos dados, familiaridade da equipe |
| Prisma | Sequelize, TypeORM | Tipagem forte, migrações automáticas, queries seguras |
| Tailwind | Styled Components, MUI | Desenvolvimento rápido, bundle size menor, customização |
| Zustand | Redux, MobX | API simples, menor boilerplate, bom desempenho |
| Puppeteer | PDFKit, jsPDF | Renderização fiel de HTML complexo, suporte a cabeçalhos |

## Próximos Passos na Arquitetura

1. **API Gateway**: Implementar um gateway API para melhor controle de acesso
2. **Microsserviços**: Separar funcionalidades em serviços independentes para melhor manutenção
3. **Testes Automatizados**: Aumentar cobertura de testes para garantir estabilidade
4. **Monitoramento**: Implementar sistema de logging e monitoramento de performance
5. **CDN**: Configurar CDN para ativos estáticos e melhorar performance global 