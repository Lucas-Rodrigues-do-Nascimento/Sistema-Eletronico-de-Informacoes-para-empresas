// src/app/api/debug-session/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Rota GET que devolve a sessão que o servidor enxerga
 * Ex.: http://localhost:3000/api/debug-session
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("🩺 /api/debug-session →", session);
  return NextResponse.json(session);
}
