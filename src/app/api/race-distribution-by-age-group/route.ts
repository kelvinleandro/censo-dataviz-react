import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT 
    idade_grupo,
    cor_raca,
    SUM(populacao) AS total,
    ROUND(
        (
            SUM(populacao) * 100
            / SUM(SUM(populacao)) OVER (PARTITION BY idade_grupo)
        )::numeric,
        2
    ) AS porcentagem_na_idade
FROM (
    SELECT 
        cor_raca,
        populacao,
        CASE 
            WHEN grupo_idade ~ '^[0-9]' THEN
                CASE 
                    WHEN idade_num < 15 THEN '0 a 14 anos'
                    WHEN idade_num < 25 THEN '15 a 24 anos'
                    WHEN idade_num < 35 THEN '25 a 34 anos'
                    WHEN idade_num < 45 THEN '35 a 44 anos'
                    WHEN idade_num < 55 THEN '45 a 54 anos'
                    WHEN idade_num < 65 THEN '55 a 64 anos'
                    WHEN idade_num < 75 THEN '65 a 74 anos'
                    ELSE '75 anos ou mais'
                END
            ELSE 'Idade ignorada'
        END AS idade_grupo,
        idade_num
    FROM (
        SELECT 
            cor_raca,
            populacao,
            grupo_idade,
            CAST(substring(grupo_idade FROM '^\\d+') AS INTEGER) AS idade_num
        FROM populacao_grupo_idade_sexo_raca
        WHERE ano = 2022
          AND grupo_idade ~ '^[0-9]'
    ) t
) sub
GROUP BY idade_grupo, cor_raca
ORDER BY idade_grupo, cor_raca;`
  );
  return NextResponse.json(data);
}
