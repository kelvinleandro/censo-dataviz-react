import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT 
    idade_grupo, 
    sexo, 
    SUM(populacao) AS total
FROM (
    SELECT 
        sexo,
        populacao,
        CASE 
            WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 15 THEN '0 a 14 anos'
            WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 25 THEN '15 a 24 anos'
            WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 35 THEN '25 a 34 anos'
            WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 45 THEN '35 a 44 anos'
            WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 55 THEN '45 a 54 anos'
            WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 65 THEN '55 a 64 anos'
            WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 75 THEN '65 a 74 anos'
            ELSE '75 anos ou mais'
        END AS idade_grupo,
        CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) AS idade_num
    FROM populacao_grupo_idade_sexo_raca
    WHERE ano = 2022
) 
GROUP BY idade_grupo, sexo
ORDER BY MIN(idade_num), sexo;`
  );
  return NextResponse.json(data);
}
