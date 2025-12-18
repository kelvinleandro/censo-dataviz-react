import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query(
    `SELECT cor_raca, ROUND(AVG(idade_mediana), 2) AS idade_med
FROM indice_envelhecimento_raca
WHERE ano = 2022
GROUP BY cor_raca;`
  );
  return NextResponse.json(data);
}
