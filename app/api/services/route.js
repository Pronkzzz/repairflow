import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      services: { where: { active: true }, orderBy: { name: "asc" } },
      models: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json({ categories });
}
