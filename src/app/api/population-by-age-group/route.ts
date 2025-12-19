import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT 
    CASE 
        WHEN idade_num <= 10 THEN '0 a 14 anos'
        WHEN idade_num <= 20 THEN '15 a 24 anos'
        WHEN idade_num <= 30 THEN '25 a 34 anos'
        WHEN idade_num <= 40 THEN '35 a 44 anos'
        WHEN idade_num <= 50 THEN '45 a 54 anos'
        WHEN idade_num <= 60 THEN '55 a 64 anos'
        WHEN idade_num <= 70 THEN '65 a 74 anos'
        ELSE '75 anos ou mais'
    END AS idade_grupo,
    SUM(populacao) AS total
FROM (
    SELECT 
        populacao,
        CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) AS idade_num
    FROM populacao_grupo_idade_sexo_raca
    WHERE ano = 2022
) sub
GROUP BY idade_grupo
ORDER BY MIN(idade_num);`
  );
  return NextResponse.json(data);
}
