// src/app/administracao/layout.tsx
'use client' // Precisa ser client-side para useSession

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return; // Aguarda a sessão carregar
    }

    if (status === "unauthenticated") {
      // Middleware já deve ter pego isso, mas é uma segurança extra
      router.replace("/login?callbackUrl=/administracao");
      return;
    }

    // Se autenticado, mas sem permissão ADMIN
    if (session && !session.user.permissoes?.includes('ADMIN')) {
      console.warn("[AdminLayout] Usuário sem permissão ADMIN, redirecionando.");
      // Idealmente, redirecionar para uma página de "Acesso Negado"
      // ou para a página principal com uma mensagem.
      router.replace("/controle-de-processos?error=unauthorized_admin_layout");
    }
  }, [session, status, router]);

  // Enquanto carrega ou se já redirecionou, não mostra nada ou um loader
  if (status === "loading" || (status === "authenticated" && !session.user.permissoes?.includes('ADMIN'))) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verificando acesso...</p>
      </div>
    );
  }

  // Se tem permissão ADMIN, renderiza o conteúdo da administração
  return <>{children}</>;
}