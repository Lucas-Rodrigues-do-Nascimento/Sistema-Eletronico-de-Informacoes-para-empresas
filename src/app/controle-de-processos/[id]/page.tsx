// src/app/controle-de-processos/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import ProcessosCliente from '@/components/ProcessosCliente'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button' // Para o botão Voltar
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react' // Ícones
import { toast } from 'sonner'; // Importar toast se ainda for usar

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const [isValidated, setIsValidated] = useState(false); // Controla se a validação inicial do ID da URL foi feita
  const [isValidIdFormat, setIsValidIdFormat] = useState(false); // Controla se o ID da URL TEM o formato correto
  const [processoIdParaComponente, setProcessoIdParaComponente] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null); // Erro de permissão vindo do ProcessosCliente
  const [pageError, setPageError] = useState<string | null>(null); // Erro de ID inválido nesta página

  // Extrai o ID da URL de forma segura
  const idParam = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  useEffect(() => {
    // Só executa a validação UMA VEZ após os params estarem disponíveis
    if (params?.id !== undefined && !isValidated) {
        console.log(`[ID Page] Validando parâmetro da URL: ${idParam}`);

        if (idParam && /^\d+$/.test(idParam)) { // Verifica se idParam existe E se ele contém APENAS dígitos
            const numericId = Number(idParam);
            if (numericId > 0) {
                console.log(`[ID Page] ID numérico válido na URL: ${numericId}`);
                setIsValidIdFormat(true);
                setProcessoIdParaComponente(idParam);
            } else {
                console.error(`[ID Page] ID numérico da URL inválido (<= 0): ${idParam}.`);
                setIsValidIdFormat(false);
                setPageError("O ID do processo na URL é inválido (não pode ser zero ou negativo).");
            }
        } else {
             // Se o idParam NÃO contiver apenas dígitos (ex: "consultar", "novo")
             // OU se for undefined (o que não deveria acontecer se params.id !== undefined)
             if(idParam !== undefined) {
                console.warn(`[ID Page] Parâmetro da URL não é um ID numérico válido: ${idParam}.`);
                setIsValidIdFormat(false);
                setPageError("O formato do ID do processo na URL é inválido.");
             } else {
                 // Caso raro: params.id existe mas idParam é undefined (não deveria acontecer com a lógica acima)
                 console.log("[ID Page] idParam ainda indefinido, apesar de params.id existir. Aguardando...");
                 setIsValidated(false); // Permite revalidar se params mudar
                 return;
             }
        }
        setIsValidated(true); // Marca que a tentativa de validação foi feita
    }
  }, [params?.id, isValidated, router]); // Removido idParam e numericId das dependências

  // Callback para ser chamada pelo ProcessosCliente em caso de erro de permissão 403 da API
  const handlePermissionDenied = () => {
    console.log("[ID Page] handlePermissionDenied foi chamado pelo ProcessosCliente.");
    setPermissionError("Acesso Negado: Você não tem permissão para visualizar os detalhes deste processo.");
  };


  // --- RENDERIZAÇÃO ---

  // 1. Enquanto a validação inicial do formato do ID da URL está acontecendo
  if (!isValidated) {
    console.log("[ID Page] Render: Aguardando validação inicial do parâmetro da URL...");
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Verificando informações do processo...</p>
        </div>
    );
  }

  // 2. Se o ID da URL teve um formato inválido (detectado por esta página)
  if (!isValidIdFormat) {
    console.log(`[ID Page] Render: Formato de ID da URL inválido. Erro: ${pageError}`);
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">ID de Processo Inválido</h2>
            <p className="text-gray-600 mb-6 text-center">{pageError || "O identificador do processo fornecido na URL não é válido."}</p>
            <Button onClick={() => router.push('/controle-de-processos')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Controle de Processos
            </Button>
        </div>
    );
  }

  // 3. Se houve um erro de permissão vindo do ProcessosCliente (API retornou 403)
  if (permissionError) {
    console.log(`[ID Page] Render: Erro de permissão. Mensagem: ${permissionError}`);
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <ShieldAlert className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-yellow-700 mb-2">Acesso Negado</h2>
        <p className="text-gray-600 mb-6 text-center">{permissionError}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  // 4. Se o ID da URL tem formato válido e não houve erro de permissão ainda, renderiza ProcessosCliente
  // O ProcessosCliente fará o fetch e poderá chamar handlePermissionDenied.
  // É importante que processoIdParaComponente seja uma string válida aqui.
  if (processoIdParaComponente) {
    console.log(`[ID Page] Render: Renderizando ProcessosCliente com ID: ${processoIdParaComponente}`);
    return <ProcessosCliente processoId={processoIdParaComponente} onPermissionDenied={handlePermissionDenied} />;
  }

  // 5. Fallback: Se chegou aqui, algo muito inesperado aconteceu (isValidIdFormat é true, mas processoIdParaComponente é null)
  console.error("[ID Page] Render: Estado inconsistente - ID com formato válido mas processoIdParaComponente é null.");
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <ShieldAlert className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-xl font-semibold text-orange-700 mb-2">Erro Inesperado</h2>
        <p className="text-gray-600 mb-6 text-center">Ocorreu um erro inesperado ao tentar carregar a página do processo.</p>
        <Button onClick={() => router.push('/controle-de-processos')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Controle de Processos
        </Button>
    </div>
  );
}