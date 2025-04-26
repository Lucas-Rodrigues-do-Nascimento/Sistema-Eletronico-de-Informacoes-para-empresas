// middleware.ts
import { NextResponse } from "next/server";
import { getToken }   from "next-auth/jwt";

export async function middleware(req: Request & { nextUrl: any }) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  // rota pública? libera
  if (!req.nextUrl.pathname.startsWith("/controle-de-processos"))
    return NextResponse.next();

  // se TEM token → segue
  if (token) return NextResponse.next();

  // senão → vai pro /login mantendo ?callbackUrl=...
  const login = new URL("/login", req.url);
  login.searchParams.set("callbackUrl", req.url);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/controle-de-processos/:path*"],
};
