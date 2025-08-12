import { NextRequest, NextResponse } from "next/server";
import { cjClient } from "@/lib/cj";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pageNum = body.pageNum || 1;
  const pageSize = body.pageSize || 20;
  const cj = await cjClient.listOrders({ pageNum, pageSize });
  return NextResponse.json(cj);
}


