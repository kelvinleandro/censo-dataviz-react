import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT 
    sexo,
    ROUND(
      (
        SUM(CASE WHEN alfabetizacao = 'Alfabetizadas' THEN populacao ELSE 0 END) * 100
        / SUM(populacao)
      )::numeric,
      2
    ) AS taxa_percentual
FROM alfabetizacao_grupo_idade_sexo_raca
GROUP BY sexo;`
  );
  return NextResponse.json(data);
}
