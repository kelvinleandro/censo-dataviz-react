import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { csvToJson } from "@/lib/csv";

export async function GET() {
  const filePath = path.join(process.cwd(), 'csv_exports', 'median_age_by_race.csv');
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = csvToJson(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}