import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function POST(
  req: NextRequest,
  context: Awaited<{ params: { id: string } }>
) {
  const { params } = await context;
  const formData = await req.formData();
  const tipo = formData.get("tipo") as string;
  const conteudo = formData.get("conteudo") as string;

  if (!tipo || !conteudo) {
    return new Response("Dados incompletos", { status: 400 });
  }

  await prisma.documento.create({
    data: {
      processoId: Number(params.id),
      nome: `${tipo.toUpperCase()}_${Date.now()}.txt`,
      tipo: "criado",
      conteudo,
    },
  });

  revalidatePath(`/controle-de-processos/${params.id}`);
  redirect(`/controle-de-processos/${params.id}`);
}
