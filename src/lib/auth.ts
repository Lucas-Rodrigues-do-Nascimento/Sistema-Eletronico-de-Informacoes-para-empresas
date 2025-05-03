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
      setorNome?: string | null;
      permissoes: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    setor?: number | null;
    setorNome?: string | null;
    permissoes: string[];
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
            setor: true,
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
          setorNome: user.setor?.nome ?? null,
          permissoes: user.permissoes.map((p) => p.codigo),
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
      if (user) {
        token.id = user.id;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
        token.setor = (user as any).setor ?? null;
        token.setorNome = (user as any).setorNome ?? null;
        token.permissoes = (user as any).permissoes ?? [];
        console.log("🔐 Permissões inseridas no token:", token.permissoes);
      }

      if (trigger === "update") {
        const colaborador = await prisma.colaborador.findUnique({
          where: { id: parseInt(token.id as string) },
          include: {
            permissoes: true,
            setor: true,
          },
        });

        token.setor = colaborador?.setorId ?? null;
        token.setorNome = colaborador?.setor?.nome ?? null;
        token.permissoes = colaborador?.permissoes.map((p) => p.codigo) ?? [];
        console.log("🔄 Permissões atualizadas no token:", token.permissoes);
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        setor: token.setor as number | null,
        setorNome: token.setorNome as string | null,
        permissoes: token.permissoes as string[],
      };
      console.log("📦 Sessão criada com permissões:", session.user.permissoes);
      return session;
    },
  },
};
