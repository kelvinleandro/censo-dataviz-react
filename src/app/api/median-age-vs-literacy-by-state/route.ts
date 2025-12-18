import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT d.nome_uf,
       AVG(i.idade_mediana) AS idade_med,
       AVG(m.taxa_alfabetizacao) AS taxa_alfab
FROM indice_envelhecimento_raca i
JOIN diretorios_brasil_municipio d USING(id_municipio)
JOIN municipio m USING(id_municipio)
WHERE i.ano = 2022
GROUP BY d.nome_uf
ORDER BY d.nome_uf;`
  );
  return NextResponse.json(data);
}
