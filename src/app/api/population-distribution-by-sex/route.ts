import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT grupo_idade, sexo, SUM(populacao) AS total
FROM populacao_grupo_idade_sexo_raca
WHERE ano = 2022
GROUP BY grupo_idade, sexo;`
  );
  return NextResponse.json(data);
}
