import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT cor_raca, ROUND(AVG(indice_envelhecimento), 2) AS indice_medio
FROM indice_envelhecimento_raca
WHERE ano = 2022
GROUP BY cor_raca
ORDER BY indice_medio;`
  );
  return NextResponse.json(data);
}
