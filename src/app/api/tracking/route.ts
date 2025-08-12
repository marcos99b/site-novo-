import { NextRequest, NextResponse } from "next/server";
import { cjClient } from "@/lib/cj";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { trackingNumber } = body;
  const cj = await cjClient.getTrackInfo({ trackingNumber });
  return NextResponse.json(cj);
}


