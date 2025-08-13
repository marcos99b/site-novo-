import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateStockByVariantIds } from "@/lib/cjStock";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const variantIds: string[] = body.variantIds || [];
  const variants = await prisma.variant.findMany({
    where: variantIds.length ? { cjVariantId: { in: variantIds } } : {},
  });
  const vids = variants.map((v: { cjVariantId: string }) => v.cjVariantId);
  if (vids.length === 0) return NextResponse.json({ updated: 0 });

  const { updated, results } = await updateStockByVariantIds(vids);
  return NextResponse.json({ updated, results });
}


