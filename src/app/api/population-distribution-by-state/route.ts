import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `WITH dados_agrupados AS (
    SELECT 
        nome_uf, 
        idade_grupo, 
        SUM(populacao) AS total,
        -- Mantendo o identificador numérico para ordenar corretamente depois
        MIN(idade_num) AS ordem_idade
    FROM (
        SELECT 
            d.nome_uf,
            p.populacao,
            CASE 
                WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 15 THEN '0 a 14 anos'
                WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 25 THEN '15 a 24 anos'
                WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 35 THEN '25 a 34 anos'
                WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 45 THEN '35 a 44 anos'
                WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 55 THEN '45 a 54 anos'
                WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 65 THEN '55 a 64 anos'
                WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 75 THEN '65 a 74 anos'
                ELSE '75 anos ou mais'
            END AS idade_grupo,
            CASE 
                WHEN p.grupo_idade ~ '^[0-9]' 
                THEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) 
                ELSE 999 
            END AS idade_num
        FROM populacao_grupo_idade_uf p
        LEFT JOIN (SELECT DISTINCT sigla_uf, nome_uf FROM diretorios_brasil_municipio) d
          USING(sigla_uf)
        WHERE p.grupo_idade ~ '^[0-9]'
    ) sub
    GROUP BY nome_uf, idade_grupo
)

SELECT 
    nome_uf,
    idade_grupo,
    total AS populacao_grupo,
    SUM(total) OVER(PARTITION BY nome_uf) AS populacao_estado,
    ROUND(total / SUM(total) OVER(PARTITION BY nome_uf) * 100, 2) AS proporcao
FROM dados_agrupados
ORDER BY nome_uf, ordem_idade;`
  );
  return NextResponse.json(data);
}
