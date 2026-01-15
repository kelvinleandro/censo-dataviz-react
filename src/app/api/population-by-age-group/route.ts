import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { csvToJson } from "@/lib/csv";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const year = body?.year ?? 2022;

  const filePath = path.join(
    process.cwd(),
    "csv_exports",
    `population_by_age_group_${year}.csv`
  );
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const data = csvToJson(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}
