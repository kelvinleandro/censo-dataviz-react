import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `WITH envelhecimento AS (
    SELECT
        cor_raca,
        SUM(CASE 
            WHEN grupo_idade IN (
                '60 a 64 anos','65 a 69 anos','70 a 74 anos',
                '75 a 79 anos','80 a 84 anos','85 a 89 anos',
                '90 a 94 anos','95 a 99 anos','100 anos ou mais'
            ) THEN populacao ELSE 0 END
        )::numeric
        /
        NULLIF(
            SUM(CASE 
                WHEN grupo_idade IN ('0 a 4 anos','5 a 9 anos','10 a 14 anos')
                THEN populacao ELSE 0 END
            ), 0
        ) * 100 AS indice_envelhecimento
    FROM populacao_grupo_idade_sexo_raca
    WHERE ano = 2022
    GROUP BY cor_raca
),
alfabetizacao AS (
    SELECT
        cor_raca,
        SUM(CASE WHEN alfabetizacao = 'Alfabetizadas' THEN populacao ELSE 0 END)
        * 100.0 / SUM(populacao) AS taxa_alfabetizacao
    FROM alfabetizacao_grupo_idade_sexo_raca
    GROUP BY cor_raca
)
SELECT
    e.cor_raca,
    ROUND(e.indice_envelhecimento::numeric, 2) AS indice_envelhecimento,
    ROUND(a.taxa_alfabetizacao::numeric, 2) AS taxa_alfabetizacao
FROM envelhecimento e
JOIN alfabetizacao a USING (cor_raca)
ORDER BY indice_envelhecimento DESC;`
  );
  return NextResponse.json(data);
}
