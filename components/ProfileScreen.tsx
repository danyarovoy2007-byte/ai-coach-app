"use client";
import React from "react";
import { motion } from "motion/react";
import { Icon } from "./Icons";
import { useStore } from "@/store";

export function ProfileScreen() {
  const coach = useStore((s) => s.coach);
  const clientName = useStore((s) => s.clientName);
  const progress = useStore((s) => s.progress);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const unlockedAchievements = useStore((s) => s.unlockedAchievements);

  const pct = Math.round((progress / coach.tasks.length) * 100);
  const daysInRow = Math.min(progress, 12);

  return (
    <div
      className="no-scrollbar"
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        background: "var(--bg-primary)",
        paddingBottom: 100,
      }}
    >
      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, padding: "60px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "linear-gradient(135deg, var(--accent-soft), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--text-primary)",
              border: "2px solid color-mix(in oklab, var(--accent) 40%, transparent)",
            }}
          >
            {(clientName || "Я")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div className="t-h2" style={{ margin: 0 }}>
              {clientName || "Гость"}
            </div>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{
                background: "transparent",
                border: 0,
                color: "var(--accent-bold)",
                padding: 0,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 4,
                cursor: "pointer",
              }}
            >
              {theme === "light" ? "Тёмная тема" : "Светлая тема"}
            </button>
          </div>
          <button
            className="tap"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "var(--bg-muted)",
              border: "1px solid var(--border-subtle)",
              display: "grid",
              placeItems: "center",
              color: "var(--text-secondary)",
            }}
          >
            <Icon.Gear size={20} />
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginTop: 24,
          }}
        >
          {[
            { num: String(daysInRow), lbl: "Дней подряд" },
            { num: String(progress), lbl: "Заданий" },
            { num: `${pct}%`, lbl: "Прогресс" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card"
              style={{
                borderRadius: 20,
                padding: "14px 12px",
                textAlign: "center",
              }}
            >
              <div
                className="t-display"
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                }}
              >
                {s.num}
              </div>
              <div className="t-cap" style={{ marginTop: 4, fontSize: 10 }}>
                {s.lbl}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 24 }}>
          <div className="t-cap" style={{ marginBottom: 10 }}>
            Общий прогресс: {coach.programTitle}
          </div>
          <div className="progress" style={{ height: 8, borderRadius: 4 }}>
            <span
              className="progress__fill"
              style={{ width: `${pct}%`, borderRadius: 4 }}
            />
          </div>
        </div>

        {/* Quote */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderLeft: "2px solid var(--accent-bold)",
          }}
        >
          <p className="t-body-it" style={{ color: "var(--text-secondary)", margin: 0 }}>
            «Что активируется вместе — связывается вместе.»
          </p>
          <p className="t-cap" style={{ marginTop: 8 }}>
            HEBB · 1949
          </p>
        </div>

        {/* Achievements */}
        <div style={{ marginTop: 32 }}>
          <h3 className="t-h3" style={{ margin: "0 0 14px" }}>
            Достижения
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { key: "first_step", title: "Первый шаг", desc: "Выполнил первое задание", xp: 50 },
              { key: "three_days", title: "Три дня подряд", desc: "Формируется привычка", xp: 150 },
              { key: "week_streak", title: "Неделя в потоке", desc: "7 дней практики", xp: 300 },
              { key: "full_path", title: "Весь путь", desc: "Все 11 заданий пройдены", xp: 500 },
              { key: "first_meditation", title: "Осознанность", desc: "Завершил первую медитацию", xp: 100 },
              { key: "first_chat", title: "Откровенный разговор", desc: "Первый диалог с коучем", xp: 75 },
            ].map((a, i) => {
              const isUnlocked = unlockedAchievements.some((ua) => ua.key === a.key);
              return (<motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={isUnlocked ? "card-glass" : "card"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  opacity: isUnlocked ? 1 : 0.5,
                  filter: isUnlocked ? "none" : "grayscale(0.5)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-full)",
                    background: isUnlocked
                      ? "var(--gradient-gold)"
                      : "var(--bg-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isUnlocked
                      ? "0 4px 16px rgba(201,168,76,0.30)"
                      : "none",
                  }}
                >
                  {isUnlocked ? (
                    <Icon.Star size={16} />
                  ) : (
                    <Icon.Lock size={14} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {a.desc}
                  </div>
                </div>
                {isUnlocked && <span className="badge">+{a.xp} XP</span>}
              </motion.div>
            );
            })}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginTop: 28 }}>
          <h3 className="t-h3" style={{ margin: "0 0 10px" }}>
            Заметки для коуча
          </h3>
          <textarea
            placeholder="Что хочешь обсудить на следующей сессии? Это видят только ты и твой коуч."
            style={{
              minHeight: 80,
              resize: "vertical",
              borderRadius: "var(--radius-md)",
            }}
          />
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
