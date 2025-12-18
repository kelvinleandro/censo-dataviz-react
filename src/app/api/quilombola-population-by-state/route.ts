import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT 
    d.nome_uf, 
    SUM(m.populacao_quilombola) AS total,
    ROUND(SUM(m.populacao_quilombola) / SUM(m.populacao) * 100.0, 2) AS porcentagem
FROM municipio m
JOIN diretorios_brasil_municipio d ON m.id_municipio = d.id_municipio
GROUP BY d.nome_uf
ORDER BY d.nome_uf;`
  );
  return NextResponse.json(data);
}
