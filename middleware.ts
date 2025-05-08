// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'; // Usar NextRequest para tipagem correta
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) { // Tipar req como NextRequest
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  console.log(`[Middleware] Path: ${pathname}, Token: ${token ? 'USUÁRIO AUTENTICADO' : 'NÃO AUTENTICADO'}`);

  // Rotas que são sempre públicas (não precisam de login)
  const rotasPublicas = [
    "/login",
    "/", // Se sua página inicial for pública
    "/api/auth", // Rotas do NextAuth
    // Adicione outras rotas públicas se necessário, ex: /sobre, /contato
  ];

  // Verifica se a rota atual é uma das públicas (ou começa com uma delas)
  if (rotasPublicas.some(rota => pathname === rota || (rota.endsWith('/') && pathname.startsWith(rota)) || pathname.startsWith(`${rota}/`))) {
    console.log("[Middleware] Rota pública, permitindo acesso.");
    return NextResponse.next();
  }

  // Se chegou aqui, a rota não é uma das listadas como públicas e precisa de autenticação
  if (!token) {
    console.log(`[Middleware] Usuário não autenticado tentando acessar ${pathname}. Redirecionando para login.`);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search); // Inclui query params no callback
    return NextResponse.redirect(loginUrl);
  }

  // Se tem token (está logado):
  // Verifica acesso à área de Administração
  if (pathname.startsWith("/administracao")) {
    const userPermissoes: string[] = (token.permissoes as string[]) || []; // Pega permissões do token
    console.log("[Middleware] Acessando /administracao. Permissões do token:", userPermissoes);
    if (!userPermissoes.includes('ADMIN')) {
      console.log("[Middleware] Usuário SEM permissão ADMIN para /administracao. Redirecionando.");
      // Redireciona para a página principal com um indicador de erro ou para uma página de acesso negado
      const acessoNegadoUrl = new URL('/controle-de-processos', req.url); // Ou uma página /acesso-negado
      acessoNegadoUrl.searchParams.set('error', 'admin_unauthorized');
      return NextResponse.redirect(acessoNegadoUrl);
    }
    console.log("[Middleware] Usuário COM permissão ADMIN para /administracao. Permitindo acesso.");
  }

  // Se chegou até aqui, o usuário está autenticado e:
  // - Não está tentando acessar /administracao, OU
  // - Está tentando acessar /administracao E TEM a permissão ADMIN.
  // Ou está acessando outras rotas protegidas como /controle-de-processos, /pesquisar etc.
  console.log(`[Middleware] Usuário autenticado acessando ${pathname}. Permitindo acesso.`);
  return NextResponse.next();
}

export const config = {
  // O matcher agora precisa cobrir todas as rotas que queremos proteger
  // (exceto as estritamente públicas já tratadas acima).
  // Este matcher amplo pega quase tudo, e a lógica do middleware decide.
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto pelos que começam com:
     * - api/public (Rotas de API que você quer que sejam públicas)
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (arquivo favicon)
     * - arquivos com extensão (ex: .png, .jpg) - para evitar rodar em assets
     */
    '/((?!api/public|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};