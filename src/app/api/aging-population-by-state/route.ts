import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT d.nome_uf, AVG(i.idade_mediana) AS idade_mediana_media
FROM indice_envelhecimento_raca i
JOIN diretorios_brasil_municipio d 
  ON i.id_municipio = d.id_municipio
WHERE i.ano = 2022
GROUP BY d.nome_uf
ORDER BY idade_mediana_media DESC;`
  );
  return NextResponse.json(data);
}
