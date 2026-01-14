import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT d.nome_uf,
       d.nome_regiao,
       ROUND(AVG(i.idade_mediana)::numeric, 2) AS idade_mediana,
       ROUND(AVG(m.taxa_alfabetizacao)::numeric, 2) AS taxa_alfabetizacao
FROM indice_envelhecimento_raca i
JOIN diretorios_brasil_municipio d USING(id_municipio)
JOIN municipio m USING(id_municipio)
WHERE i.ano = 2022
GROUP BY d.nome_uf, d.nome_regiao
ORDER BY d.nome_uf;`
  );
  return NextResponse.json(data);
}
