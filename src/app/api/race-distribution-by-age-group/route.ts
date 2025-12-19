import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT 
    idade_grupo,
    cor_raca,
    SUM(populacao) AS total,
    -- Porcentagem dentro de cada faixa etária (ideal para Barras 100%)
    ROUND(
        SUM(populacao) * 100.0 / SUM(SUM(populacao)) OVER (PARTITION BY idade_grupo), 2
    ) AS porcentagem_na_idade
FROM (
    SELECT 
        cor_raca,
        populacao,
        CASE 
            WHEN grupo_idade ~ '^[0-9]' THEN
                CASE 
                    WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 15 THEN '0 a 14 anos'
                    WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 25 THEN '15 a 24 anos'
                    WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 35 THEN '25 a 34 anos'
                    WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 45 THEN '35 a 44 anos'
                    WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 55 THEN '45 a 54 anos'
                    WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 65 THEN '55 a 64 anos'
                    WHEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 75 THEN '65 a 74 anos'
                    ELSE '75 anos ou mais'
                END
            ELSE 'Idade ignorada'
        END AS idade_grupo,
        CASE WHEN grupo_idade ~ '^[0-9]' THEN CAST(regexp_replace(grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) ELSE 999 END AS idade_num
    FROM populacao_grupo_idade_sexo_raca
    WHERE ano = 2022
) sub
GROUP BY idade_grupo, cor_raca
ORDER BY idade_grupo, cor_raca;`
  );
  return NextResponse.json(data);
}
