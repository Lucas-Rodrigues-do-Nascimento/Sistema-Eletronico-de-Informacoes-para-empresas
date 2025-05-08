# Serviço Unificado de Geração de PDF

Este documento detalha como utilizar o serviço centralizado de geração de PDF do sistema PROTON.

## Visão Geral

O serviço de PDF foi criado para centralizar toda a lógica de geração de documentos PDF no sistema, oferecendo:

1. Interface única para converter HTML em PDF
2. Formatação padronizada com cabeçalhos consistentes
3. Opções de personalização para diferentes tipos de documentos
4. Ferramentas de depuração para desenvolvimento

## Arquitetura

O serviço utiliza o Puppeteer para renderizar HTML em PDF de alta qualidade. A biblioteca está encapsulada em uma API de alto nível que simplifica a geração de documentos.

```
src/lib/pdfGenerator.ts   <- Serviço principal
src/lib/templates/        <- Templates HTML para documentos
```

## Como Usar

### Importação

```typescript
import { generatePDFFromHTML, PDFGeneratorOptions, HeaderStyle } from '@/lib/pdfGenerator';
```

### Exemplo Básico

```typescript
// Exemplo simples de geração de PDF
const html = `<h1>Memorando</h1><p>Conteúdo do memorando</p>`;
const pdfBuffer = await generatePDFFromHTML(html);

// Retornar o PDF em uma API
return new Response(pdfBuffer, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="documento.pdf"',
  },
});
```

### Opções Avançadas

```typescript
// Usando opções avançadas
const pdfBuffer = await generatePDFFromHTML(
  html,
  {
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div style="text-align: right; font-size: 8px; margin-right: 15mm;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
    footerTemplate: '<div style="text-align: center; font-size: 8px;">Documento gerado em: {{DATA}}</div>',
  },
  {
    headerStyle: 'complete',
    addHeader: true,
    useAbsolutePaths: false,
    debug: false,
  }
);
```

## Opções de Configuração

### Opções do Puppeteer (Primeiro Parâmetro)

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `format` | string | 'A4' | Formato do papel ('A4', 'Letter', etc.) |
| `printBackground` | boolean | true | Imprimir cores e imagens de fundo |
| `margin` | object | { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' } | Margens do documento |
| `displayHeaderFooter` | boolean | false | Exibir cabeçalho e rodapé |
| `headerTemplate` | string | '' | Template HTML para cabeçalho |
| `footerTemplate` | string | '' | Template HTML para rodapé |
| `landscape` | boolean | false | Orientação paisagem |

### Opções do Gerador (Segundo Parâmetro)

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `headerStyle` | 'none' \| 'simple' \| 'complete' | 'none' | Estilo do cabeçalho institucional |
| `addHeader` | boolean | false | Adicionar cabeçalho institucional |
| `useAbsolutePaths` | boolean | false | Usar caminhos absolutos nas URLs |
| `debug` | boolean | false | Modo de depuração |
| `baseUrl` | string | '' | URL base para recursos relativos |

## Estilos de Cabeçalho

### 'none'
Não adiciona cabeçalho institucional.

### 'simple'
Adiciona apenas o logo centralizado.

```html
<div class="header-simple">
  <img src="/images/logo.png" alt="Logo" class="logo" />
</div>
```

### 'complete'
Adiciona cabeçalho institucional completo com logo, nome da empresa e informações adicionais.

```html
<div class="header-complete">
  <div class="logo-container">
    <img src="/images/logo.png" alt="Logo" class="logo" />
  </div>
  <div class="header-text">
    <h1>PROTON - Sistema de Gestão de Processos</h1>
    <h2>Documento Oficial</h2>
  </div>
</div>
```

## Exemplos de Uso Comuns

### Documento com Cabeçalho Completo

```typescript
// Rota de API para gerar documentos
export async function POST(req: Request) {
  const { html, titulo } = await req.json();
  
  // Adiciona o cabeçalho completo
  const pdfBuffer = await generatePDFFromHTML(
    html,
    { 
      format: 'A4', 
      printBackground: true 
    },
    { 
      headerStyle: 'complete', 
      addHeader: true 
    }
  );
  
  // Configura o nome do arquivo com base no título
  const filename = titulo 
    ? `${titulo.toLowerCase().replace(/\s+/g, '-')}.pdf` 
    : 'documento.pdf';
  
  // Retorna o PDF configurando os headers apropriados
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
```

### Visualização de PDF em Tela

```typescript
// Componente para visualizar PDF
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="pdf-viewer">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      <div className="controls">
        <button 
          disabled={pageNumber <= 1} 
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Anterior
        </button>
        <span>
          Página {pageNumber} de {numPages || '--'}
        </span>
        <button 
          disabled={pageNumber >= (numPages || 1)} 
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
```

## Melhores Práticas

### 1. Estrutura HTML para Documentos

Use uma estrutura HTML semântica e adequada para documentos:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #333;
    }
    .titulo {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 1.5cm;
    }
    .conteudo {
      text-align: justify;
      margin-bottom: 1cm;
    }
    .assinatura {
      margin-top: 2cm;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="titulo">MEMORANDO Nº 123/2024</div>
  
  <div class="conteudo">
    <!-- Conteúdo do documento -->
  </div>
  
  <div class="assinatura">
    <p>João Silva</p>
    <p>Diretor Administrativo</p>
  </div>
</body>
</html>
```

### 2. CSS para Impressão

Utilize CSS específico para impressão:

```html
<style>
  @page {
    margin: 2cm;
  }
  
  @media print {
    .no-print {
      display: none;
    }
  }
  
  .page-break {
    page-break-after: always;
  }
</style>
```

### 3. Depuração de Documentos

Quando tiver problemas com a formatação, use o modo de depuração:

```typescript
// Modo de depuração - salva o HTML formatado antes da conversão para PDF
const html = getDocumentTemplate(tipoDocumento, dados);
const debugHtml = await prepareHTML(html, { 
  debug: true,
  headerStyle: 'complete',
  addHeader: true
});

// O HTML formatado será salvo em um arquivo temporário
console.log('HTML de depuração salvo em:', debugHtml.debugFilePath);
```

## Personalizando o Serviço

### Adicionando Novos Estilos de Cabeçalho

Para adicionar um novo estilo de cabeçalho, edite o arquivo `pdfGenerator.ts`:

1. Adicione o novo estilo no tipo `HeaderStyle`:

```typescript
export type HeaderStyle = 'none' | 'simple' | 'complete' | 'minimal';
```

2. Adicione a implementação do HTML para o novo estilo:

```typescript
function getHeaderHtml(style: HeaderStyle): string {
  switch (style) {
    case 'simple':
      return `<div class="header-simple">...</div>`;
    case 'complete':
      return `<div class="header-complete">...</div>`;
    case 'minimal':
      return `<div class="header-minimal">
        <img src="/images/logo-small.png" alt="Logo" class="logo-small" />
        <div class="minimal-text">Documento PROTON</div>
      </div>`;
    case 'none':
    default:
      return '';
  }
}
```

### Incorporando Fontes Personalizadas

```typescript
// Adicione fontes personalizadas no HTML para consistência
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @font-face {
      font-family: 'Roboto';
      src: url('data:font/woff2;base64,${robotoFontBase64}') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    
    body {
      font-family: 'Roboto', Arial, sans-serif;
    }
  </style>
</head>
<body>
  ${conteudo}
</body>
</html>
`;
```

## Resolução de Problemas

### Problema: Imagens não aparecem no PDF

**Solução**: Certifique-se de que as imagens estão usando caminhos absolutos ou base64:

```typescript
// Use a opção useAbsolutePaths
const pdfBuffer = await generatePDFFromHTML(
  html,
  { format: 'A4' },
  { useAbsolutePaths: true }
);

// Ou converta as imagens para base64
function imageToBase64(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(imagePath, (err, data) => {
      if (err) return reject(err);
      const ext = path.extname(imagePath).slice(1);
      const base64 = `data:image/${ext};base64,${data.toString('base64')}`;
      resolve(base64);
    });
  });
}
```

### Problema: Quebras de Página Incorretas

**Solução**: Adicione classes CSS específicas para controlar quebras de página:

```html
<style>
  .avoid-break {
    break-inside: avoid;
  }
  
  .force-break {
    break-after: page;
  }
  
  h2, h3 {
    break-after: avoid;
  }
</style>
```

## Expansões Futuras

Algumas ideias para melhorias do serviço de PDF:

1. **Assinatura Digital Visível**: Incorporar imagem da assinatura e selo de QR Code
2. **Temas de Cores**: Adicionar temas diferentes para documentos
3. **Marca d'água**: Adicionar opção para marca d'água (ex: "CONFIDENCIAL", "RASCUNHO")
4. **Cache de PDFs**: Implementar sistema de cache para documentos frequentes
5. **Número de Páginas**: Melhorar formatação com contagem de páginas no rodapé

## Referências

- [Documentação do Puppeteer](https://pptr.dev/)
- [Melhores Práticas de CSS para Impressão](https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/)
- [Guia de Acessibilidade para PDFs](https://www.w3.org/WAI/WCAG21/Techniques/pdf/) 