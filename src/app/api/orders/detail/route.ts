import { NextRequest, NextResponse } from "next/server";
import { cjClient } from "@/lib/cj";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId } = body;
  const cj = await cjClient.getOrderDetail({ orderId });
  return NextResponse.json(cj);
}


