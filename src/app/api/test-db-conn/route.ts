import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    "SELECT id_municipio, nome FROM diretorios_brasil_municipio LIMIT 2;"
  );
  return NextResponse.json(data);
}
