import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT cor_raca, grupo_idade, SUM(populacao) AS total
FROM populacao_grupo_idade_sexo_raca
WHERE ano = 2022
GROUP BY cor_raca, grupo_idade
ORDER BY cor_raca, grupo_idade;`
  );
  return NextResponse.json(data);
}
