import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  // Endpoint simples para gatilhar revalidações e futuros jobs
  revalidatePath("/catalogo");
  return NextResponse.json({ ok: true });
}


