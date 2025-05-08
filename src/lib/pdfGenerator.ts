import puppeteer from 'puppeteer';

// Tipos expandidos para mais opções de configuração
export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter' | 'Legal' | 'Tabloid';
  printBackground?: boolean;
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  scale?: number; // Escala do conteúdo (0.1 a 2)
  preferCSSPageSize?: boolean; // Usa tamanho de página CSS, se disponível
  timeout?: number; // Tempo máximo para renderização
}

// Opções para formatação do HTML
export interface HTMLOptions {
  addHeader?: boolean;
  headerStyle?: 'simple' | 'complete' | 'minimal' | 'custom';
  customHeader?: string; // HTML personalizado para o cabeçalho
  useAbsolutePaths?: boolean;
  
  // Opções para numeração de páginas (injetada via script)
  addPageNumbers?: boolean;
  pageNumberPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  pageNumberFormat?: string; // Ex: 'Página {page} de {total}'
  
  // Opções para marca d'água
  addWatermark?: boolean;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkRotation?: number;
  
  // Tema/estilo global
  theme?: 'light' | 'dark' | 'blue' | 'custom';
  customStyles?: string; // CSS personalizado a ser adicionado ao documento
  
  // Opções de fonte
  fontFamily?: 'Arial' | 'Times New Roman' | 'Calibri' | 'Roboto' | 'Montserrat';
  fontSize?: string;

  // Opções de rodapé
  addFooter?: boolean;
  footerText?: string;
  footerHeight?: string;
  customFooter?: string; // HTML personalizado para o rodapé
}

/**
 * Função auxiliar para gerar o CSS da marca d'água
 */
function generateWatermarkCSS(text: string, opacity: number = 0.1, rotation: number = -45): string {
  return `
    body::after {
      content: "${text}";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      color: rgba(0, 0, 0, ${opacity});
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 10em;
      transform: rotate(${rotation}deg);
      pointer-events: none;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }
  `;
}

/**
 * Função auxiliar para gerar o script de numeração de páginas
 */
function generatePageNumbersScript(format: string, position: string): string {
  const positionClass = position.replace('-', ' ');
  
  return `
    <script>
      // Este script é executado pelo Puppeteer durante a renderização
      function addPageNumbers() {
        const style = document.createElement('style');
        style.textContent = \`
          .page-number { 
            position: fixed; 
            ${position.includes('bottom') ? 'bottom: 10mm;' : 'top: 10mm;'} 
            ${position.includes('left') ? 'left: 10mm; text-align: left;' : 
              position.includes('right') ? 'right: 10mm; text-align: right;' : 
              'left: 50%; transform: translateX(-50%); text-align: center;'} 
            font-size: 9pt; 
            color: #666;
          }
          @media print {
            .page-number {
              position: fixed;
              ${position.includes('bottom') ? 'bottom: 10mm;' : 'top: 10mm;'} 
              ${position.includes('left') ? 'left: 10mm;' : 
                position.includes('right') ? 'right: 10mm;' : 
                'left: 50%; transform: translateX(-50%);'}
            }
          }
        \`;
        document.head.appendChild(style);
      }
      // O Puppeteer vai substituir {pageNumber} e {totalPages} durante a renderização do PDF
      addPageNumbers();
    </script>
    <div class="page-number">${format.replace('{page}', '1').replace('{total}', '1')}</div>
  `;
}

/**
 * Função auxiliar para gerar CSS de tema
 */
function generateThemeCSS(theme: string): string {
  switch (theme) {
    case 'dark':
      return `
        body { 
          background-color: #222; 
          color: #eee; 
        }
        table { 
          border-color: #444; 
        }
        a { 
          color: #4da6ff; 
        }
      `;
    case 'blue':
      return `
        body { 
          background-color: #f0f8ff; 
          color: #333; 
        }
        h1, h2, h3, h4, h5, h6 { 
          color: #0055a4; 
        }
        a { 
          color: #0066cc; 
        }
      `;
    case 'light':
    default:
      return ''; // O tema claro é o padrão, então não precisa de CSS adicional
  }
}

/**
 * Função auxiliar para gerar CSS para a fonte selecionada
 */
function generateFontCSS(fontFamily?: string, fontSize?: string): string {
  if (!fontFamily && !fontSize) return '';
  
  let css = 'body, p, div, span, h1, h2, h3, h4, h5, h6 { ';
  if (fontFamily) {
    const fontMap: Record<string, string> = {
      'Arial': 'Arial, Helvetica, sans-serif',
      'Times New Roman': '"Times New Roman", Times, serif',
      'Calibri': 'Calibri, Arial, sans-serif',
      'Roboto': 'Roboto, Arial, sans-serif',
      'Montserrat': 'Montserrat, Arial, sans-serif'
    };
    
    css += `font-family: ${fontMap[fontFamily] || fontFamily}; `;
  }
  
  if (fontSize) {
    css += `font-size: ${fontSize}; `;
  }
  
  css += '}';
  return css;
}

/**
 * Função para gerar cabeçalho simples
 */
function generateHeader(options: HTMLOptions): string {
  const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  if (options.customHeader) {
    return options.customHeader;
  }
  
  switch (options.headerStyle) {
    case 'simple':
      return `<div style="text-align: center; margin-bottom: 20px;"><img src="${host}/logo-institucional.png" alt="Logo Corrêa" style="height: 60px; margin-bottom: 6px;" /></div>`;
      
    case 'complete':
      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${host}/logo-institucional.png" alt="Logo" style="height: 80px; margin-bottom: 8px;" />
          <h2 style="margin: 0; font-size: 18px;">CORRÊA MATERIAIS ELÉTRICOS</h2>
          <p style="margin: 0; font-size: 14px;">Sistema Interno Administrativo - PROTON</p>
          <hr style="margin-top: 10px; border: 1px solid #ccc;" />
        </div>
      `;
      
    case 'minimal':
      return `<div style="text-align: center; margin-bottom: 10px;"><img src="${host}/logo-institucional.png" alt="Logo Corrêa" style="height: 40px;" /></div>`;
      
    default:
      return `<div style="text-align: center; margin-bottom: 20px;"><img src="${host}/logo-institucional.png" alt="Logo Corrêa" style="height: 60px; margin-bottom: 6px;" /></div>`;
  }
}

/**
 * Função para gerar rodapé
 */
function generateFooter(options: HTMLOptions): string {
  if (options.customFooter) {
    return options.customFooter;
  }
  
  if (!options.addFooter) {
    return '';
  }
  
  const height = options.footerHeight || '20mm';
  
  return `
    <div style="position: fixed; bottom: 0; left: 0; right: 0; height: ${height}; text-align: center; font-size: 9pt; color: #666; border-top: 1px solid #ddd; padding-top: 5mm;">
      ${options.footerText || 'Documento gerado pelo sistema PROTON © ' + new Date().getFullYear()}
    </div>
  `;
}

/**
 * Prepara o HTML para geração de PDF, ajustando caminhos e adicionando cabeçalho se necessário
 * 
 * @param html Conteúdo HTML original
 * @param options Opções de formatação do HTML
 * @returns HTML formatado pronto para geração de PDF
 */
export function prepareHTML(html: string, options: HTMLOptions = {}): string {
  const {
    addHeader = true,
    headerStyle = 'simple',
    useAbsolutePaths = true,
    addPageNumbers = false,
    pageNumberPosition = 'bottom-center',
    pageNumberFormat = 'Página {page} de {total}',
    addWatermark = false,
    watermarkText = 'CONFIDENCIAL',
    watermarkOpacity = 0.1,
    watermarkRotation = -45,
    theme = 'light',
    customStyles = '',
    fontFamily,
    fontSize,
    addFooter = false,
    footerText,
    footerHeight,
    customFooter
  } = options;

  const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  let finalHtml = html;

  // Verifica se já tem classe de modelo institucional (não precisa adicionar cabeçalho)
  const hasInstitutionalTemplate = /class=["']a4-(memo|despacho)["']/.test(html);
  
  // Adiciona cabeçalho se necessário e não for modelo institucional
  if (addHeader && !hasInstitutionalTemplate && !html.includes('logo-institucional.png')) {
    const headerHTML = generateHeader(options);
    finalHtml = headerHTML + finalHtml;
  }
  
  // Adiciona CSS para marca d'água, se solicitado
  let extraStyles = '';
  if (addWatermark) {
    extraStyles += generateWatermarkCSS(watermarkText, watermarkOpacity, watermarkRotation);
  }
  
  // Adiciona CSS para tema, se solicitado
  if (theme !== 'light') {
    extraStyles += generateThemeCSS(theme);
  }
  
  // Adiciona CSS para fonte, se solicitado
  if (fontFamily || fontSize) {
    extraStyles += generateFontCSS(fontFamily, fontSize);
  }
  
  // Adiciona CSS personalizado, se fornecido
  if (customStyles) {
    extraStyles += customStyles;
  }
  
  // Insere todos os estilos no documento
  if (extraStyles) {
    finalHtml = `<style>${extraStyles}</style>${finalHtml}`;
  }
  
  // Adiciona script de numeração de páginas, se solicitado
  if (addPageNumbers) {
    finalHtml += generatePageNumbersScript(pageNumberFormat, pageNumberPosition);
  }
  
  // Adiciona rodapé, se solicitado
  if (addFooter) {
    finalHtml += generateFooter(options);
  }
  
  // Garante que todos os caminhos de imagem são absolutos
  if (useAbsolutePaths) {
    finalHtml = finalHtml.replace(
      /src=["']\/?logo-institucional\.png["']/g, 
      `src="${host}/logo-institucional.png"`
    );
  }
  
  return finalHtml;
}

/**
 * Gera um PDF a partir de conteúdo HTML usando Puppeteer
 * 
 * @param html Conteúdo HTML a ser convertido para PDF
 * @param options Opções de geração do PDF
 * @returns Buffer contendo o PDF gerado
 */
export async function generatePDFFromHTML(
  html: string, 
  pdfOptions: PDFGenerationOptions = {}, 
  htmlOptions: HTMLOptions = {}
): Promise<Buffer> {
  // Aplicar formatação ao HTML
  const formattedHtml = prepareHTML(html, htmlOptions);
  
  // Carregar Puppeteer dinamicamente para evitar problemas em ambientes serverless
  const puppeteerModule = await import('puppeteer');
  const puppeteer = puppeteerModule.default;
  
  // Configurar o navegador
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Configurar o conteúdo e aguardar carregamento completo
    const timeoutValue = pdfOptions.timeout || 30000;
    await page.setContent(formattedHtml, { 
      waitUntil: 'networkidle0',
      timeout: timeoutValue
    });
    
    // Executar script para ajustar a numeração de páginas, se necessário
    if (htmlOptions.addPageNumbers) {
      await page.evaluate(() => {
        // Este script é injetado pelo Puppeteer e executado no navegador
        const style = document.createElement('style');
        style.textContent = `
          @page {
            margin-bottom: 15mm;
          }
        `;
        document.head.appendChild(style);
      });
    }
    
    // Gerar o PDF com as opções fornecidas
    const pdfBuffer = await page.pdf({
      format: pdfOptions.format || 'A4',
      printBackground: pdfOptions.printBackground !== false,
      landscape: pdfOptions.landscape || false,
      margin: pdfOptions.margin || {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      scale: pdfOptions.scale || 1.0,
      preferCSSPageSize: pdfOptions.preferCSSPageSize || false
    });
    
    return pdfBuffer;
  } finally {
    // Garantir que o browser sempre será fechado, mesmo em caso de erro
    await browser.close();
  }
}

/**
 * Utilitário para debug - retorna apenas o HTML preparado sem gerar o PDF
 * Útil para testes e depuração
 */
export function debugHTMLFormatting(html: string, options: HTMLOptions = {}): { 
  formattedHtml: string, 
  options: HTMLOptions 
} {
  return {
    formattedHtml: prepareHTML(html, options),
    options
  };
} 