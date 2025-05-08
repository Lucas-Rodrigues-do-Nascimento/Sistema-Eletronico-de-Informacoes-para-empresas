# Refatoração do Sistema de Gestão de Documentos/Processos

## Melhorias Implementadas

### 1. Serviço Unificado de Geração de PDF
Foi criado um módulo centralizado que encapsula toda a lógica de geração de PDF usando Puppeteer, eliminando duplicação de código.

**Arquivo:** `src/lib/pdfGenerator.ts`

**Funcionalidades:**
- `prepareHTML()`: Prepara o HTML para geração de PDF, adicionando cabeçalhos conforme necessário
- `generatePDFFromHTML()`: Gera o PDF a partir do HTML formatado
- `debugHTMLFormatting()`: Função utilitária para depuração

**Tipos de cabeçalhos disponíveis:**
- Simple: Logo simples centralizado
- Complete: Logo, nome da empresa e cabeçalho institucional completo

### 2. Padronização de Rotas
O sistema agora possui duas estruturas claras de rotas:

**Documentos no contexto de processos:**
- GET `/api/processos/[id]/documentos`: Lista documentos de um processo
- POST `/api/processos/[id]/documentos`: Cria novo documento em um processo
- GET `/api/processos/[id]/documentos/[docId]`: Obtém conteúdo de um documento específico
- PATCH `/api/processos/[id]/documentos/[docId]`: Atualiza um documento no contexto do processo
- DELETE `/api/processos/[id]/documentos/[docId]`: Remove um documento do processo

**Operações diretas em documentos:**
- GET `/api/documentos/[id]`: Obtém metadados de um documento
- POST `/api/documentos/[id]/acoes/editar`: Edita um documento existente
- POST `/api/documentos/[id]/acoes/assinar`: Assina um documento
- GET `/api/documentos/[id]/acoes/verificar`: Verifica assinatura de um documento

### 3. Transição de Rotas
Para compatibilidade com código existente, mantivemos temporariamente algumas rotas antigas, mas implementamos:
- As novas rotas em `/api/documentos/[id]/acoes/...` que seguem um padrão consistente
- Rotas antigas como `/api/documento/[id]/editar` continuam funcionando para compatibilidade

### 4. Centralização dos Templates de Documentos

Os templates HTML de documentos foram extraídos do componente principal e centralizados em arquivos separados:

**Arquivos de Templates:**
- `src/lib/templates/documentos/memorando.ts`: Template de memorando
- `src/lib/templates/documentos/despacho.ts`: Template de despacho
- `src/lib/templates/documentos/simples.ts`: Templates de requisição, ordem, justificativa e pagamento

**Arquivo de Índice:**
- `src/lib/templates/index.ts`: Exporta todos os templates e oferece funções utilitárias

**Benefícios:**
- Redução do tamanho do componente `ProcessosCliente.tsx`
- Centralização da lógica relacionada a templates
- Facilidade para adicionar ou modificar templates
- Interface TypeScript para tipos de documento com metadados adicional

**Uso:**
```typescript
import { templatesDocumentos, getTemplateHtml } from '@/lib/templates';

// Obter todos os templates
const todosTemplates = templatesDocumentos;

// Obter HTML específico por ID
const htmlMemorado = getTemplateHtml('memorando');
```

## Como Usar o Serviço PDF

```typescript
import { generatePDFFromHTML } from '@/lib/pdfGenerator';

// Exemplo básico
const pdfBuffer = await generatePDFFromHTML(htmlString);

// Exemplo com opções personalizadas
const pdfBuffer = await generatePDFFromHTML(
  htmlString,
  { 
    format: 'A4', 
    printBackground: true,
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
  },
  { 
    headerStyle: 'complete',
    addHeader: true,
    useAbsolutePaths: true
  }
);
```

## Próximos Passos

1. ✅ **Refatorar os modelos de documentos**: Extrair os templates HTML para um local centralizado
2. ✅ **Ampliar o serviço de PDF**: Adicionar mais opções de formatação e personalização
3. ✅ **Deprecated API**: Marcar as APIs antigas como deprecated e completar a migração
4. **Documentação Swagger**: Adicionar documentação padronizada para todas as rotas API
5. **Melhorar estrutura de componentes React**: Separar templates de documentos dos componentes UI

## Depreciação de APIs Antigas

As seguintes rotas foram marcadas como deprecated e serão removidas em uma versão futura:

| Rota Antiga | Nova Rota |
|-------------|-----------|
| `/api/documento/[id]/editar` | `/api/documentos/[id]/acoes/editar` |
| `/api/documento/[id]/assinar` | `/api/documentos/[id]/acoes/assinar` |
| `/api/documento/[id]/verificar` | `/api/documentos/[id]/acoes/verificar` |

### Implementação

1. Adicionamos tags `@deprecated` nos arquivos de rotas antigas
2. Incluímos cabeçalhos HTTP de depreciação:
   - `Deprecation: true`
   - `Sunset: 2024-12-31` (data prevista para remoção)
   - `Link: </api/documentos/[id]/acoes/...>; rel="successor-version"`
3. Retornamos avisos nos responses JSON indicando a nova rota a ser utilizada
4. Atualizamos os componentes principais para usar as novas rotas:
   - `ModalAssinatura.tsx`
   - `verificar-assinatura/page.tsx` 