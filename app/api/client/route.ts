import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get("telegramId");
    if (!telegramId) {
      return NextResponse.json({ error: "telegramId required" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { telegramId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error("GET /api/client error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { telegramId, name, age, experience, goal, coachId } = await req.json();
    if (!telegramId || !name) {
      return NextResponse.json({ error: "telegramId and name required" }, { status: 400 });
    }

    const existing = await prisma.client.findUnique({ where: { telegramId } });

    if (existing) {
      const updated = await prisma.client.update({
        where: { telegramId },
        data: { name, age, experience, goal, coachId: coachId || existing.coachId },
      });
      return NextResponse.json({ client: updated });
    }

    // Ensure default coach exists
    let coach = coachId
      ? await prisma.coach.findUnique({ where: { id: coachId } })
      : await prisma.coach.findFirst();

    if (!coach) {
      coach = await prisma.coach.create({
        data: {
          slug: "default",
          name: "Инна Луна",
          title: "Психолог, гештальт-подход · 10 лет",
          programTitle: "Путь к себе",
        },
      });
    }

    const client = await prisma.client.create({
      data: { telegramId, name, age, experience, goal, coachId: coach.id },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error("POST /api/client error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}
