import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `WITH base AS (
  SELECT
    sexo,
    CASE
      WHEN sexo = 'Homens' THEN populacao
      ELSE -populacao
    END AS populacao,
    idade_inicial AS idade
  FROM populacao_grupo_idade_sexo_raca
  WHERE ano = 2022
)
SELECT
  CASE
    WHEN idade < 15 THEN '0 a 14 anos'
    WHEN idade < 25 THEN '15 a 24 anos'
    WHEN idade < 35 THEN '25 a 34 anos'
    WHEN idade < 45 THEN '35 a 44 anos'
    WHEN idade < 55 THEN '45 a 54 anos'
    WHEN idade < 65 THEN '55 a 64 anos'
    WHEN idade < 75 THEN '65 a 74 anos'
    ELSE '75 anos ou mais'
  END AS idade_grupo,
  sexo,
  SUM(populacao) AS total
FROM base
GROUP BY idade_grupo, sexo
ORDER BY MIN(idade), sexo;`
  );
  return NextResponse.json(data);
}
