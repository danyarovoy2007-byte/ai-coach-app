import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const coach = await prisma.coach.findUnique({ where: { slug } });
      return NextResponse.json({ coach });
    }

    const coaches = await prisma.coach.findMany({ take: 20 });
    return NextResponse.json({ coaches });
  } catch (error) {
    console.error("GET /api/coach error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, name, title, avatarUrl, accentColor, programTitle, tasks } = await req.json();
    if (!slug || !name) {
      return NextResponse.json({ error: "slug and name required" }, { status: 400 });
    }

    const coach = await prisma.coach.upsert({
      where: { slug },
      create: {
        slug,
        name,
        title: title || "",
        avatarUrl,
        accentColor: accentColor || "#A86A6A",
        programTitle: programTitle || "Путь к себе",
        tasks: JSON.stringify(tasks || []),
      },
      update: {
        name,
        title: title || "",
        avatarUrl,
        accentColor: accentColor || "#A86A6A",
        programTitle: programTitle || "Путь к себе",
        tasks: tasks ? JSON.stringify(tasks) : undefined,
      },
    });

    return NextResponse.json({ coach });
  } catch (error) {
    console.error("POST /api/coach error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}
