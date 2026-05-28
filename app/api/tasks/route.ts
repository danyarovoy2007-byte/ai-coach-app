import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get("telegramId");
    if (!telegramId) {
      return NextResponse.json({ error: "telegramId required" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { telegramId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const responses = await prisma.taskResponse.findMany({
      where: { clientId: client.id },
      orderBy: { taskOrder: "asc" },
    });

    return NextResponse.json({ responses, progress: client.progress });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { telegramId, taskOrder, format, content } = await req.json();
    if (!telegramId || taskOrder === undefined || !format) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { telegramId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Upsert task response
    const response = await prisma.taskResponse.upsert({
      where: {
        clientId_taskOrder: { clientId: client.id, taskOrder },
      },
      create: { clientId: client.id, taskOrder, format, content },
      update: { format, content },
    });

    // Update progress if this is the current task
    if (taskOrder === client.progress) {
      await prisma.client.update({
        where: { id: client.id },
        data: { progress: client.progress + 1 },
      });
    }

    return NextResponse.json({ response, newProgress: client.progress + 1 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}
