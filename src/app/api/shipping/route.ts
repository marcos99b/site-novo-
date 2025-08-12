import { NextRequest, NextResponse } from "next/server";
import { cjClient } from "@/lib/cj";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const quote = await cjClient.freightCalculate(body);
  return NextResponse.json(quote);
}


