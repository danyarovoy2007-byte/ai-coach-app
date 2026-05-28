"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "./Icons";
import { useStore } from "@/store";

/* ── Quick topics: coaching methodologies + rhythms ── */
const METHODOLOGIES = [
  { label: "🪞 ICF-сессия", prompt: "Давай проведём ICF-сессию. Помоги мне прояснить, что сейчас со мной происходит, через открытые вопросы." },
  { label: "🎯 GROW", prompt: "У меня есть задача. Проведи меня по модели GROW: Цель → Реальность → Варианты → Воля." },
  { label: "🎡 Колесо баланса", prompt: "Давай сделаем Колесо баланса. Помоги оценить все сферы жизни и найти самую проседающую." },
  { label: "💎 Ценности", prompt: "Хочу разобраться в своих ценностях через Co-Active подход. Что для меня сейчас важнее всего?" },
];

const RHYTHMS = [
  { label: "🌅 Утро", prompt: "Давай утреннюю практику — 5 минут настройки на день." },
  { label: "🌙 Вечер", prompt: "Давай вечернюю рефлексию — подведём итоги дня." },
];

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <div
      style={{
        alignSelf: "flex-start",
        padding: "10px 14px",
        background: "var(--bg-card)",
        borderRadius: "14px 14px 14px 4px",
        display: "flex",
        gap: 4,
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {[0, 0.15, 0.3].map((d, i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            animation: `typing-dot 1.4s ${d}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Message bubble ── */
function MessageBubble({ role, text }: { role: "AI" | "USER"; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: role === "USER" ? 50 : -20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={role === "AI" ? "msg--ai" : "msg--user"}
    >
      {text}
    </motion.div>
  );
}

export function ChatScreen() {
  const coach = useStore((s) => s.coach);
  const messages = useStore((s) => s.messages);
  const addMessage = useStore((s) => s.addMessage);
  const telegramId = useStore((s) => s.telegramId);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Welcome message on first mount
  useEffect(() => {
    if (messages.length === 0) {
      const id = `welcome-${Date.now()}`;
      setTimeout(() => {
        addMessage({
          id,
          role: "AI",
          text: `Привет! Я твой AI-коуч. Расскажи, как ты сейчас?`,
          time: "сейчас",
        });
      }, 500);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg = {
        id: Date.now().toString(),
        role: "USER" as const,
        text: text.trim(),
        time: "сейчас",
      };
      addMessage(userMsg);
      setInput("");
      setIsTyping(true);

      // Save user message to API + check first_chat achievement
      if (telegramId) {
        fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telegramId, role: "USER", text: userMsg.text }),
        }).catch(() => {});

        // Unlock "first chat" achievement on first message
        if (messages.filter((m) => m.role === "USER").length === 0) {
          fetch("/api/achievements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telegramId, achievementKey: "first_chat" }),
          }).catch(() => {});
        }
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.map((m) => ({
              role: m.role === "AI" ? "assistant" : "user",
              content: m.text,
            })),
            newMessage: text.trim(),
            coachName: coach.name,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const aiMsg = {
            id: (Date.now() + 1).toString(),
            role: "AI" as const,
            text: data.reply,
            time: "сейчас",
          };
          addMessage(aiMsg);

          // Save AI response to API
          if (telegramId) {
            fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ telegramId, role: "AI", text: aiMsg.text }),
            }).catch(() => {});
          }
        } else {
          throw new Error("API error");
        }
      } catch {
        // Fallback response if API is not available
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "AI",
          text: "Я слышу тебя. Расскажи подробнее — что ты чувствуешь прямо сейчас? Где в теле это ощущается?",
          time: "сейчас",
        });
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping, addMessage, coach.name]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Voice input via Web Speech API
  const toggleVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div className="m-header">
        <div className="m-header__avatar">{coach.avatarLetter}</div>
        <div className="m-header__meta">
          <div className="m-header__name">{coach.name}</div>
          <div className="m-header__sub" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span className="dot-online" /> AI-коуч · онлайн
          </div>
        </div>
        <button
          className="m-header__action"
          style={{ color: isListening ? "var(--accent-deep)" : "var(--accent-bold)" }}
          onClick={toggleVoice}
        >
          <Icon.Mic size={22} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Coach intro */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "14px 0 20px" }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "var(--radius-full)",
                  background: "linear-gradient(135deg, var(--accent-soft), var(--accent))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  border: "3px solid color-mix(in oklab, var(--accent) 30%, transparent)",
                  boxShadow: "0 8px 24px rgba(168,106,106,0.18)",
                }}
              >
                {coach.avatarLetter}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 5,
                  right: 5,
                  width: 20,
                  height: 20,
                  borderRadius: "var(--radius-full)",
                  background: "var(--sage-deep)",
                  border: "2.5px solid var(--bg-primary)",
                  boxShadow: "0 0 10px rgba(122,142,120,0.35)",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: 15,
                color: "var(--text-secondary)",
                marginTop: 10,
                letterSpacing: "-0.005em",
              }}
            >
              Я здесь. Не спеши.
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} text={m.text} />
          ))}
        </AnimatePresence>

        {isTyping && <TypingDots />}
      </div>

      {/* Quick commands */}
      <div
        style={{
          padding: "0 16px 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Methodologies */}
        <div
          className="no-scrollbar"
          style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 6, paddingRight: 16 }}
        >
          {METHODOLOGIES.map((m) => (
            <button
              key={m.label}
              className="chip"
              onClick={() => sendMessage(m.prompt)}
              disabled={isTyping}
            >
              {m.label}
            </button>
          ))}
        </div>
        {/* Daily rhythms */}
        <div className="no-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {RHYTHMS.map((r) => (
            <button
              key={r.label}
              className="chip"
              style={{ fontSize: 12, height: 34, padding: "0 12px" }}
              onClick={() => sendMessage(r.prompt)}
              disabled={isTyping}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div
        style={{
          padding: "8px 12px 12px",
          background: "var(--bg-primary)",
          borderTop: "1px solid color-mix(in oklab, var(--border-subtle) 80%, transparent)",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        <input
          type="text"
          placeholder="Напиши сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            borderRadius: 20,
            padding: "10px 16px",
            fontSize: 14,
          }}
        />
        <motion.button
          className="btn-icon"
          whileTap={{ scale: 0.9 }}
          onClick={toggleVoice}
          style={{
            background: isListening ? "var(--accent-soft)" : "var(--bg-muted)",
            border: isListening ? "2px solid var(--accent-bold)" : "1px solid var(--border-subtle)",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isListening ? "var(--accent-deep)" : "var(--text-secondary)",
          }}
        >
          <Icon.Mic size={18} />
        </motion.button>
        <motion.button
          className="btn-icon"
          whileTap={{ scale: 0.9, rotate: 15 }}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          style={{
            opacity: input.trim() && !isTyping ? 1 : 0.4,
          }}
        >
          <Icon.Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}
