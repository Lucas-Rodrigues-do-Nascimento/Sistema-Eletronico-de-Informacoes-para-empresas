export const htmlMemorandoTemplate = `
<style>
  .a4-memo { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 24mm 20mm 20mm 20mm; background: #fff; font-family: 'Arial', sans-serif; font-size: 13pt; color: #222; box-sizing: border-box; }
  .memo-cabecalho { text-align: center; margin-bottom: 18px; }
  .memo-cabecalho img { height: 60px; margin-bottom: 6px; }
  .memo-titulo { display: none; }
  .memo-info { margin-bottom: 8px; display: flex; justify-content: space-between; font-size: 1em; }
  .memo-info div { min-width: 120px; }
  .memo-assunto { margin-bottom: 18px; font-weight: bold; }
  .memo-corpo { min-height: 200px; margin-bottom: 32px; line-height: 1.7; }
  .memo-rodape { margin-top: 40px; text-align: right; font-size: 1em; }
  @media print { .a4-memo { box-shadow: none; } }
</style>
<div class="a4-memo">
  <div class="memo-cabecalho">
    <img src="/logo-institucional.png" alt="Logo Corrêa" />
  </div>
  <div class="memo-info">
    <div><strong>Memorando nº:</strong> <span contenteditable="false">___</span></div>
    <div><strong>Data:</strong> <span contenteditable="true">__/__/____</span></div>
  </div>
  <div class="memo-info">
    <div><strong>Para:</strong> <span contenteditable="true">Destinatário</span></div>
    <div><strong>De:</strong> <span contenteditable="true">Remetente</span></div>
  </div>
  <div class="memo-assunto">
    <strong>Assunto:</strong> <span contenteditable="true">Assunto do memorando</span>
  </div>
  <div class="memo-corpo" contenteditable="true">
    <p>Prezado(a),</p>
    <p>[Escreva aqui o texto do memorando. Utilize este espaço para detalhar a comunicação, instruções, solicitações ou informações.]</p>
    <p>Atenciosamente,</p>
  </div>
  <div class="memo-rodape">
    <div><span contenteditable="true">Nome do responsável</span></div>
    <div><span contenteditable="true">Cargo/Função</span></div>
  </div>
</div>
`; 