import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(`SELECT 1 as value;`);
  return NextResponse.json(data);
}
