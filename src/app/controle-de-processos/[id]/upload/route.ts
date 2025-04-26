import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const processoId = Number(context.params.id);

  if (isNaN(processoId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get('arquivo') as File;

  if (!file || !file.name) {
    return NextResponse.json(
      { error: 'Arquivo não enviado.' },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const safeFileName = `${timestamp}_${file.name}`;
  const filePath = path.join(process.cwd(), 'public', 'uploads', safeFileName);

  // Salva o arquivo no disco
  await writeFile(filePath, buffer);

  // Salva no banco como anexo externo
  await prisma.documento.create({
    data: {
      processoId,
      nome: safeFileName,
      tipo: 'externo',
      conteudo: buffer.toString('base64'), // Salva conteúdo no banco também
    },
  });

  const redirectUrl = new URL(`/controle-de-processos/${processoId}`, request.url);
  return NextResponse.redirect(redirectUrl);
}
