import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_ACHIEVEMENTS = [
  { key: "first_step", title: "Первый шаг", description: "Выполнил первое задание", xp: 50, condition: "progress >= 1" },
  { key: "three_days", title: "Три дня подряд", description: "Выполнил 3 задания", xp: 150, condition: "progress >= 3" },
  { key: "week_streak", title: "Недельная привычка", description: "Выполнил 7 заданий", xp: 300, condition: "progress >= 7" },
  { key: "full_path", title: "Весь путь", description: "Прошёл все 11 заданий", xp: 500, condition: "progress >= 11" },
  { key: "first_meditation", title: "Осознанность", description: "Завершил первую медитацию", xp: 100, condition: "tasks.meditation >= 1" },
  { key: "first_chat", title: "Откровенный разговор", description: "Первый диалог с коучем", xp: 75, condition: "messages >= 1" },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get("telegramId");
    if (!telegramId) {
      return NextResponse.json({ error: "telegramId required" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { telegramId },
      include: { achievements: { include: { achievement: true } } },
    });

    if (!client) {
      return NextResponse.json({ achievements: [], unlocked: [] });
    }

    return NextResponse.json({
      achievements: client.achievements.map((a: { achievement: { key: string; title: string; description: string; xp: number }; unlockedAt: Date }) => ({
        key: a.achievement.key,
        title: a.achievement.title,
        description: a.achievement.description,
        xp: a.achievement.xp,
        unlockedAt: a.unlockedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/achievements error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { telegramId, achievementKey } = await req.json();
    if (!telegramId || !achievementKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { telegramId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Ensure achievement exists
    const def = DEFAULT_ACHIEVEMENTS.find((a) => a.key === achievementKey);
    if (!def) {
      return NextResponse.json({ error: "Unknown achievement" }, { status: 400 });
    }

    let achievement = await prisma.achievement.findUnique({ where: { key: achievementKey } });
    if (!achievement) {
      achievement = await prisma.achievement.create({
        data: { key: def.key, title: def.title, description: def.description, xp: def.xp, condition: "{}" },
      });
    }

    const unlocked = await prisma.clientAchievement.upsert({
      where: { clientId_achievementId: { clientId: client.id, achievementId: achievement.id } },
      create: { clientId: client.id, achievementId: achievement.id },
      update: {},
    });

    return NextResponse.json({ unlocked });
  } catch (error) {
    console.error("POST /api/achievements error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}
