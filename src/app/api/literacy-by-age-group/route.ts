import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT grupo_idade,
       ROUND(SUM(CASE WHEN alfabetizacao = 'Alfabetizadas' THEN populacao ELSE 0 END) * 100.0 /
       SUM(populacao), 2) AS taxa_alfabetizacao
FROM alfabetizacao_grupo_idade_sexo_raca
GROUP BY grupo_idade
ORDER BY grupo_idade;`
  );
  return NextResponse.json(data);
}
