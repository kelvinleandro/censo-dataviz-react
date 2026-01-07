import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT 
       d.nome_uf,
       SUM(m.populacao_indigena_terra_indigena)::int AS em_terra_indigena,
       SUM(m.populacao_indigena)::int AS total_indigena
     FROM municipio m
     JOIN diretorios_brasil_municipio d ON m.id_municipio = d.id_municipio
     GROUP BY d.nome_uf
     ORDER BY d.nome_uf;`
  );
  return NextResponse.json(data);
}