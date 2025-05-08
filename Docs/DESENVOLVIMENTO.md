# Guia de Desenvolvimento - PROTON

Este documento contém diretrizes e boas práticas para o desenvolvimento do sistema PROTON.

## Fluxo de Trabalho de Desenvolvimento

### Branches

- `main` - Branch principal, contém o código em produção
- `develop` - Branch de desenvolvimento, integra as features antes de irem para produção
- `feature/nome-da-feature` - Branches para desenvolvimento de novas funcionalidades
- `bugfix/nome-do-bug` - Branches para correção de bugs
- `refactor/nome-da-refatoracao` - Branches para refatorações

### Processo de Desenvolvimento

1. Crie uma branch a partir de `develop` para sua feature/bugfix
2. Desenvolva e teste localmente
3. Faça commits com mensagens descritivas
4. Abra um Pull Request para `develop`
5. Após review e aprovação, faça merge para `develop`
6. Periodicamente, `develop` é mesclado com `main` para release

## Padrões de Código

### Nomenclatura

- **Arquivos e pastas**: Use camelCase para componentes React e kebab-case para outros arquivos
- **Componentes React**: Use PascalCase (ex: `ButtonPrimary.tsx`)
- **Funções e variáveis**: Use camelCase (ex: `getUserData()`)
- **Constantes**: Use SNAKE_CASE_MAIÚSCULO (ex: `MAX_FILE_SIZE`)
- **Interfaces/Types**: Prefixe com I ou T (ex: `IUsuario` ou `TDocumento`)

### Estrutura de Componentes React

```typescript
// Import externos primeiro
import React from 'react';
import { useRouter } from 'next/router';

// Depois imports internos
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

// Interfaces e types
interface ComponenteProps {
  prop1: string;
  prop2?: number;
}

// Componente
export function MeuComponente({ prop1, prop2 = 0 }: ComponenteProps) {
  // Estado e hooks
  const [estado, setEstado] = React.useState<string>('');
  const router = useRouter();
  
  // Funções
  const handleClick = () => {
    // lógica
  };
  
  // JSX
  return (
    <div>
      {/* Conteúdo do componente */}
    </div>
  );
}
```

### API Routes

Para novas API routes, siga o padrão RESTful:

```typescript
// src/app/api/recursos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/recursos
export async function GET(req: NextRequest) {
  try {
    // Implementação
    return NextResponse.json({ data: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Mensagem de erro' }, { status: 500 });
  }
}

// POST /api/recursos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validação e implementação
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Mensagem de erro' }, { status: 500 });
  }
}
```

Para endpoints dinâmicos:

```typescript
// src/app/api/recursos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // Implementação
}
```

## Padrões de UI

### Componentes UI

Utilizamos a biblioteca Shadcn/UI como base para nossos componentes de interface. Para garantir consistência:

1. Evite criar novos componentes visuais sem verificar se já existe algo similar na biblioteca
2. Estenda os componentes existentes para necessidades específicas
3. Mantenha o tema e o design system consistentes

### Responsividade

O sistema deve ser totalmente responsivo, seguindo os breakpoints do Tailwind:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

Exemplo de uso:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Conteúdo */}
</div>
```

## Gerenciamento de Estado

### Zustand para Estado Global

Para estado global, utilizamos Zustand. Crie stores específicas para cada domínio da aplicação:

```typescript
// src/stores/useProcessoStore.ts
import { create } from 'zustand';

interface ProcessoState {
  processos: Processo[];
  loading: boolean;
  fetchProcessos: () => Promise<void>;
  // Outros estados e ações
}

export const useProcessoStore = create<ProcessoState>((set) => ({
  processos: [],
  loading: false,
  fetchProcessos: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/processos');
      const data = await response.json();
      set({ processos: data, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  // Implementações das outras ações
}));
```

### Estado Local com React Hooks

Para estado de componentes locais, use os hooks do React:

```tsx
const [isOpen, setIsOpen] = useState(false);
const toggleOpen = () => setIsOpen(!isOpen);
```

## Comunicação com APIs

### Padrão para Requisições

Utilize SWR para requisições que exigem cache e revalidação:

```tsx
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function MeuComponente() {
  const { data, error, isLoading, mutate } = useSWR('/api/endpoint', fetcher);
  
  // Uso dos dados
}
```

Para mutações e requisições mais complexas, crie funções de API específicas:

```typescript
// src/lib/api/processos.ts
export async function criarProcesso(data: ProcessoInput) {
  const response = await fetch('/api/processos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao criar processo');
  }
  
  return response.json();
}
```

## Tratamento de Erros

### Frontend

Use o componente de toast para erros de usuário:

```tsx
import { toast } from 'sonner';

try {
  await enviarFormulario(data);
  toast.success('Operação realizada com sucesso!');
} catch (error) {
  toast.error('Erro ao realizar operação. Tente novamente.');
  console.error(error);
}
```

### Backend (API Routes)

Padronize as respostas de erro:

```typescript
if (!autorizado) {
  return NextResponse.json(
    { error: 'Não autorizado para acessar este recurso' },
    { status: 403 }
  );
}

try {
  // Lógica
} catch (error) {
  console.error('Erro ao processar requisição:', error);
  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  );
}
```

## Autenticação e Autorização

### Verificação de Permissões

Utilize o sistema de permissões para verificar acesso a funcionalidades:

```typescript
// Hook de permissão
import { useAuth } from '@/lib/auth';

function MeuComponente() {
  const { user, hasPermission } = useAuth();
  
  if (!hasPermission('processos.editar')) {
    return <AcessoNegado />;
  }
  
  return (
    // Conteúdo para usuários autorizados
  );
}
```

### Middleware de Autenticação

Para rotas protegidas no backend, use middlewares:

```typescript
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

## Testes

### Testes Unitários

Use Jest para testes unitários de funções e componentes:

```typescript
// src/__tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renderiza corretamente', () => {
    render(<Button>Texto</Button>);
    expect(screen.getByText('Texto')).toBeInTheDocument();
  });
  
  it('chama o handler de clique', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Clique</Button>);
    screen.getByText('Clique').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Testes de Integração

Use Cypress para testes de integração:

```typescript
// cypress/e2e/processos.cy.ts
describe('Processos', () => {
  beforeEach(() => {
    cy.login(); // Comando customizado para login
    cy.visit('/controle-de-processos');
  });
  
  it('deve listar processos', () => {
    cy.get('[data-testid="processo-item"]').should('have.length.greaterThan', 0);
  });
  
  it('deve criar um novo processo', () => {
    cy.get('[data-testid="novo-processo-btn"]').click();
    cy.get('input[name="especificacao"]').type('Teste Cypress');
    // Mais interações...
    cy.get('button[type="submit"]').click();
    cy.contains('Processo criado com sucesso').should('be.visible');
  });
});
```

## Performance

### Otimizações

- Use `next/image` para otimização de imagens
- Implemente carregamento lazy para componentes pesados
- Utilize memoização para funções e componentes com cálculos intensivos

```tsx
import { useMemo } from 'react';
import { useProcessoStore } from '@/stores/processoStore';

function ProcessoStats() {
  const processos = useProcessoStore((state) => state.processos);
  
  // Memoização de cálculos pesados
  const estatisticas = useMemo(() => {
    return {
      total: processos.length,
      arquivados: processos.filter(p => p.arquivado).length,
      emTramitacao: processos.filter(p => !p.arquivado).length,
      // Outros cálculos...
    };
  }, [processos]);
  
  return (
    // Renderização das estatísticas
  );
}
```

## Documentação

### Comentários de Código

Para funções e componentes complexos, adicione comentários descritivos:

```typescript
/**
 * Gera um hash seguro para documento usando SHA-256
 * @param conteudo - Conteúdo do documento (HTML/texto)
 * @param metadata - Metadados adicionais para hash (opcionais)
 * @returns String do hash SHA-256
 */
export async function gerarHashDocumento(
  conteudo: string, 
  metadata?: Record<string, any>
): Promise<string> {
  // Implementação...
}
```

### JSDoc para API e Componentes

Use JSDoc para documentar componentes e funções de API:

```typescript
/**
 * Componente de seleção de setor com busca
 * @component
 * @example
 * <SeletorSetor 
 *   valor={setorId} 
 *   onChange={setSetorId} 
 *   unidadeId={unidadeId} 
 * />
 */
export function SeletorSetor({
  valor,
  onChange,
  unidadeId,
  disabled = false,
}: SeletorSetorProps) {
  // Implementação...
}
```

## Considerações para Refatoração Futura

Ao implementar novas funcionalidades ou manutenções, considere estes pontos para melhoria contínua:

1. **Separação de Templates e UI**: Mover templates de documentos para arquivos dedicados
2. **Documentação de API**: Adicionar documentação Swagger para todos os endpoints
3. **Redução de Acoplamento**: Diminuir dependências entre componentes
4. **Acessibilidade**: Melhorar suporte para leitores de tela e navegação por teclado
5. **Testes Automatizados**: Aumentar a cobertura de testes do sistema 