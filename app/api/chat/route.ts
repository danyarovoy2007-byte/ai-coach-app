import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Ты — персональный коуч. Не помощник, не консультант, не учитель. Коуч. Твоя задача — помогать думать яснее, видеть слепые зоны и принимать сильные решения через осознание.

## Принципы работы

1. Сначала слушай, потом веди. Начинай с открытых вопросов.
2. Не давай советов первым. Помоги найти ответ самостоятельно.
3. Возвращай к ценностям и большой картине.
4. Замечай повторяющиеся паттерны.
5. Если пользователь уходит в избегание — мягко подсвечивай.
6. Завершай сессию конкретным шагом.

## Методики (выбирай под запрос)

- ICF — прояснение через открытые вопросы (осознание, понимание себя)
- GROW — структура «Цель-Реальность-Варианты-Воля» (конкретная задача)
- Колесо баланса — аудит всех сфер жизни
- Co-Active — работа с ценностями и смыслом

## Тон

- Обращение на «ты». Уважительный и тёплый.
- Спокойная глубина. Не наигранная мотивация.
- Прямой, но с заботой.
- Без эзотерики и общих фраз.
- Короткие сообщения. Не лекции.

## Запрещено

- Давать оценки решениям («это плохая идея»)
- Морализировать
- Заменять терапию — если запрос требует психолога, скажи прямо
- Льстить
- Длинные монологи`;

export async function POST(req: NextRequest) {
  try {
    const { messages, newMessage, coachName } = await req.json();

    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: SYSTEM_PROMPT.replace("персональный коуч", `${coachName || "персональный коуч"}`),
      messages: [
        ...(messages || []).slice(-15),
        { role: "user", content: newMessage },
      ],
    };

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      // Return fallback if no API key configured
      return NextResponse.json({
        reply: getFallbackReply(newMessage, coachName),
      });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Claude API error:", err);
      return NextResponse.json({
        reply: getFallbackReply(newMessage, coachName),
      });
    }

    const data = await res.json();
    const reply =
      data.content?.[0]?.text || getFallbackReply(newMessage, coachName);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: "Я здесь. Расскажи, что у тебя сейчас в фокусе?",
    });
  }
}

function getFallbackReply(message: string, coachName?: string): string {
  const input = message.toLowerCase();

  if (input.includes("тревог") || input.includes("страх") || input.includes("боюсь")) {
    return "Тревога — это не сбой. Это сигнал, что что-то важно. Где в теле ты её чувствуешь? Голова, грудь, живот?";
  }
  if (input.includes("сплю") || input.includes("сон") || input.includes("устал")) {
    return "Тело устало, а голова продолжает. Что последнее ты делаешь перед тем, как лечь?";
  }
  if (input.includes("привет") || input.includes("здрав")) {
    return `Привет! Я здесь. Что у тебя сегодня в фокусе?`;
  }
  if (input.includes("цель") || input.includes("хочу") || input.includes("мечт")) {
    return "Звучит важно. А что за этим стоит? Что изменится в твоей жизни, когда ты этого достигнешь?";
  }
  if (input.includes("отношен") || input.includes("любов") || input.includes("партн")) {
    return "Отношения — зеркало. Что в них отражается про тебя самого?";
  }
  if (input.includes("уверен") || input.includes("страх") || input.includes("боюсь")) {
    return "Уверенность — не отсутствие страха. Это действие несмотря на него. Вспомни момент, когда ты уже делал что-то несмотря на страх.";
  }

  return "Я слышу. Расскажи подробнее — что ты чувствуешь прямо сейчас? Не думай о правильных словах, просто опиши ощущение.";
}
