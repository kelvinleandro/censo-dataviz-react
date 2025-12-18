import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `WITH populacao_por_estado AS (
    SELECT 
        d.nome_uf,
        SUM(p.populacao) AS total_estado
    FROM populacao_grupo_idade_sexo_raca p
    JOIN diretorios_brasil_municipio d 
        ON p.id_municipio = d.id_municipio::varchar
    GROUP BY d.nome_uf
)
SELECT 
    d.nome_uf,
    p.cor_raca,
    SUM(p.populacao) AS total,
    ROUND(SUM(p.populacao) * 100.0 / pe.total_estado, 2) AS porcentagem
FROM populacao_grupo_idade_sexo_raca p
JOIN diretorios_brasil_municipio d 
    ON p.id_municipio = d.id_municipio::varchar
JOIN populacao_por_estado pe
    ON pe.nome_uf = d.nome_uf
GROUP BY d.nome_uf, p.cor_raca, pe.total_estado
ORDER BY d.nome_uf, p.cor_raca;`
  );
  return NextResponse.json(data);
}
