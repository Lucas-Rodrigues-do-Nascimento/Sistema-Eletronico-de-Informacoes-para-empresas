export const htmlDespachoTemplate = `
<style>
  .a4-despacho { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 24mm 20mm 20mm 20mm; background: #fff; font-family: 'Arial', sans-serif; font-size: 13pt; color: #222; box-sizing: border-box; }
  .despacho-cabecalho { text-align: center; margin-bottom: 18px; }
  .despacho-cabecalho img { height: 60px; margin-bottom: 6px; }
  .despacho-titulo { display: none; }
  .despacho-info { margin-bottom: 18px; display: flex; justify-content: space-between; font-size: 1em; }
  .despacho-info div { min-width: 120px; }
  .despacho-corpo { min-height: 200px; margin-bottom: 32px; line-height: 1.7; }
  .despacho-rodape { margin-top: 40px; text-align: right; font-size: 1em; }
  @media print { .a4-despacho { box-shadow: none; } }
</style>
<div class="a4-despacho">
  <div class="despacho-cabecalho">
    <img src="/logo-institucional.png" alt="Logo Corrêa" />
  </div>
  <div class="despacho-info">
    <div><strong>Despacho nº:</strong> <span contenteditable="true">___</span></div>
    <div><strong>Data:</strong> <span contenteditable="true">__/__/____</span></div>
  </div>
  <div class="despacho-corpo" contenteditable="true">
    <p>[Digite aqui o texto do despacho, instruções, decisões ou encaminhamentos.]</p>
  </div>
  <div class="despacho-rodape">
    <div><span contenteditable="true">Nome do responsável</span></div>
    <div><span contenteditable="true">Cargo/Função</span></div>
  </div>
</div>
`; 