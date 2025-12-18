import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT d.nome_uf, grupo_idade, SUM(populacao) AS total
FROM populacao_grupo_idade_uf p
LEFT JOIN diretorios_brasil_municipio d
  USING(sigla_uf)
GROUP BY d.nome_uf, p.grupo_idade;`
  );
  return NextResponse.json(data);
}
