import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `WITH base AS (
    SELECT
        cor_raca,
        CASE
            WHEN grupo_idade IN (
                '0 a 4 anos', '5 a 9 anos', '10 a 14 anos'
            ) THEN 'jovem'
            WHEN grupo_idade IN (
                '60 a 64 anos', '65 a 69 anos', '70 a 74 anos',
                '75 a 79 anos', '80 a 84 anos', '85 a 89 anos',
                '90 a 94 anos', '95 a 99 anos', '100 anos ou mais'
            ) THEN 'idoso'
        END AS faixa,
        SUM(populacao) AS pop
    FROM populacao_grupo_idade_sexo_raca
    WHERE ano = 2022
    GROUP BY cor_raca, faixa
)
SELECT
    cor_raca,
    ROUND(
        (
            SUM(CASE WHEN faixa = 'idoso' THEN pop END)
            /
            NULLIF(SUM(CASE WHEN faixa = 'jovem' THEN pop END), 0)
            * 100
        )::numeric
    , 2) AS indice_envelhecimento
FROM base
GROUP BY cor_raca
ORDER BY indice_envelhecimento DESC;`
  );
  return NextResponse.json(data);
}
