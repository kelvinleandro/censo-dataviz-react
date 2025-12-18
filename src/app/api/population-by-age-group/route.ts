import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT grupo_idade,
       SUM(populacao) AS total
FROM populacao_grupo_idade_sexo_raca
WHERE ano = 2022
GROUP BY grupo_idade
ORDER BY CAST( regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER );`
  );
  return NextResponse.json(data);
}
