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
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { telegramId, role, text } = await req.json();
    if (!telegramId || !role || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { telegramId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: { clientId: client.id, role, text },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
}
