export const htmlRequisicaoTemplate = `
<style>
  .a4-requisicao { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 24mm 20mm 20mm 20mm; background: #fff; font-family: 'Arial', sans-serif; font-size: 13pt; color: #222; box-sizing: border-box; }
  .requisicao-cabecalho { text-align: center; margin-bottom: 18px; }
  .requisicao-cabecalho img { height: 60px; margin-bottom: 6px; }
  .requisicao-titulo { font-size: 18pt; text-align: center; margin-bottom: 20px; font-weight: bold; }
  .requisicao-corpo { min-height: 250px; margin-bottom: 32px; line-height: 1.7; }
  @media print { .a4-requisicao { box-shadow: none; } }
</style>
<div class="a4-requisicao">
  <div class="requisicao-cabecalho">
    <img src="/logo-institucional.png" alt="Logo Corrêa" />
  </div>
  <div class="requisicao-titulo">
    REQUISIÇÃO DE MATERIAIS/SERVIÇOS
  </div>
  <div class="requisicao-corpo" contenteditable="true">
    <p>Digite o conteúdo da requisição aqui...</p>
  </div>
</div>
`;

export const htmlOrdemTemplate = `
<style>
  .a4-ordem { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 24mm 20mm 20mm 20mm; background: #fff; font-family: 'Arial', sans-serif; font-size: 13pt; color: #222; box-sizing: border-box; }
  .ordem-cabecalho { text-align: center; margin-bottom: 18px; }
  .ordem-cabecalho img { height: 60px; margin-bottom: 6px; }
  .ordem-titulo { font-size: 18pt; text-align: center; margin-bottom: 20px; font-weight: bold; }
  .ordem-corpo { min-height: 250px; margin-bottom: 32px; line-height: 1.7; }
  @media print { .a4-ordem { box-shadow: none; } }
</style>
<div class="a4-ordem">
  <div class="ordem-cabecalho">
    <img src="/logo-institucional.png" alt="Logo Corrêa" />
  </div>
  <div class="ordem-titulo">
    ORDEM DE SERVIÇO
  </div>
  <div class="ordem-corpo" contenteditable="true">
    <p>Digite o conteúdo da ordem de serviço aqui...</p>
  </div>
</div>
`;

export const htmlJustificativaTemplate = `
<style>
  .a4-justificativa { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 24mm 20mm 20mm 20mm; background: #fff; font-family: 'Arial', sans-serif; font-size: 13pt; color: #222; box-sizing: border-box; }
  .justificativa-cabecalho { text-align: center; margin-bottom: 18px; }
  .justificativa-cabecalho img { height: 60px; margin-bottom: 6px; }
  .justificativa-titulo { font-size: 18pt; text-align: center; margin-bottom: 20px; font-weight: bold; }
  .justificativa-corpo { min-height: 250px; margin-bottom: 32px; line-height: 1.7; }
  @media print { .a4-justificativa { box-shadow: none; } }
</style>
<div class="a4-justificativa">
  <div class="justificativa-cabecalho">
    <img src="/logo-institucional.png" alt="Logo Corrêa" />
  </div>
  <div class="justificativa-titulo">
    JUSTIFICATIVA
  </div>
  <div class="justificativa-corpo" contenteditable="true">
    <p>Digite o conteúdo da justificativa aqui...</p>
  </div>
</div>
`;

export const htmlPagamentoTemplate = `
<style>
  .a4-pagamento { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 24mm 20mm 20mm 20mm; background: #fff; font-family: 'Arial', sans-serif; font-size: 13pt; color: #222; box-sizing: border-box; }
  .pagamento-cabecalho { text-align: center; margin-bottom: 18px; }
  .pagamento-cabecalho img { height: 60px; margin-bottom: 6px; }
  .pagamento-titulo { font-size: 18pt; text-align: center; margin-bottom: 20px; font-weight: bold; }
  .pagamento-corpo { min-height: 250px; margin-bottom: 32px; line-height: 1.7; }
  @media print { .a4-pagamento { box-shadow: none; } }
</style>
<div class="a4-pagamento">
  <div class="pagamento-cabecalho">
    <img src="/logo-institucional.png" alt="Logo Corrêa" />
  </div>
  <div class="pagamento-titulo">
    SOLICITAÇÃO DE PAGAMENTO
  </div>
  <div class="pagamento-corpo" contenteditable="true">
    <p>Digite os detalhes da solicitação de pagamento aqui...</p>
  </div>
</div>
`; 