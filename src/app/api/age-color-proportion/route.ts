import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `WITH base AS (
    SELECT
        cor_raca,
        CASE
            WHEN grupo_idade IN ('0 a 4 anos','5 a 9 anos','10 a 14 anos')
                THEN 'Jovens (0-14)'
            WHEN grupo_idade IN (
                '15 a 19 anos','20 a 24 anos','25 a 29 anos',
                '30 a 34 anos','35 a 39 anos','40 a 44 anos',
                '45 a 49 anos','50 a 54 anos','55 a 59 anos'
            ) THEN 'Adultos (15-59)'
            ELSE 'Idosos (60+)'
        END AS ciclo_vida,
        SUM(populacao) AS pop
    FROM populacao_grupo_idade_sexo_raca
    WHERE ano = 2022
    GROUP BY cor_raca, ciclo_vida
),
totais AS (
    SELECT cor_raca, SUM(pop) AS total
    FROM base
    GROUP BY cor_raca
)
SELECT
    b.cor_raca,
    b.ciclo_vida,
    ROUND((b.pop * 100.0 / t.total)::numeric, 2) AS percentual
FROM base b
JOIN totais t USING (cor_raca)
ORDER BY cor_raca, ciclo_vida;`
  );
  return NextResponse.json(data);
}
