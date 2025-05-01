import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { compare } from "bcryptjs";

/* Tipos extras para autocomplete */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      setor?: number | null;
      permissao?: string | null;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    setor?: number | null;
    permissao?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const user = await prisma.colaborador.findUnique({
          where: { email: credentials.email },
          include: {
            permissoes: true,
            setor: true, // ✅ adiciona o setor para garantir que setorId venha corretamente
          },
        });

        if (!user || !user.senha) return null;

        const valid = await compare(credentials.senha, user.senha);
        if (!valid) return null;

        return {
          id: user.id.toString(),
          name: user.nome,
          email: user.email,
          setor: user.setorId ?? null,
          permissao: user.permissoes?.[0]?.codigo ?? null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Primeira autenticação
      if (user) {
        token.id = user.id;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
        token.setor = (user as any).setor ?? (user as any).setorId ?? null;
        token.permissao = (user as any).permissao ?? null;
      }

      // Atualização manual da sessão (ex: troca de setor)
      if (trigger === "update") {
        const colaborador = await prisma.colaborador.findUnique({
          where: { id: parseInt(token.id as string) },
          include: {
            permissoes: true,
            setor: true,
          },
        });

        token.setor = colaborador?.setorId ?? null;
        token.permissao = colaborador?.permissoes?.[0]?.codigo ?? null;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        setor: token.setor as number | null,
        permissao: token.permissao as string | null,
      };
      return session;
    },
  },
};
