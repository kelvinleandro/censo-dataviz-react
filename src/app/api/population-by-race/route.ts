import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT 
    cor_raca,
    SUM(populacao) as total,
    ROUND(
        SUM(populacao) * 100.0 / (
            SELECT SUM(populacao)
            FROM populacao_grupo_idade_sexo_raca
            WHERE ano = 2022
        ), 2
    ) AS porcentagem
FROM populacao_grupo_idade_sexo_raca
WHERE ano = 2022
GROUP BY cor_raca
ORDER BY cor_raca;`
  );
  return NextResponse.json(data);
}
