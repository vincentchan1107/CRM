import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const stats = await getDashboard(6);
  return NextResponse.json(stats);
}
