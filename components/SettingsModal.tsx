"use client";
import React from "react";
import { motion } from "motion/react";
import { useStore } from "@/store";

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const coach = useStore((s) => s.coach);
  const setCoach = useStore((s) => s.setCoach);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const progress = useStore((s) => s.progress);
  const setProgress = useStore((s) => s.setProgress);
  const setMessages = useStore((s) => s.setMessages);

  const [accentInput, setAccentInput] = React.useState(coach.accentColor);
  const [nameInput, setNameInput] = React.useState(coach.name);

  const applyAccent = () => {
    setCoach({ ...coach, accentColor: accentInput, name: nameInput });
  };

  const resetAll = () => {
    if (confirm("Сбросить весь прогресс и историю чата?")) {
      setProgress(0);
      setMessages([]);
    }
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="modal-sheet"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.36, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="modal-grab" />

        <h2 className="t-h2" style={{ margin: "0 0 20px" }}>Настройки</h2>

        {/* Theme */}
        <div style={{ marginBottom: 24 }}>
          <div className="t-cap" style={{ marginBottom: 8 }}>Тема</div>
          <button
            className="btn-outline"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{ width: "100%" }}
          >
            {theme === "light" ? "🌙 Переключить на тёмную" : "☀️ Переключить на светлую"}
          </button>
        </div>

        {/* Coach name */}
        <div style={{ marginBottom: 24 }}>
          <div className="t-cap" style={{ marginBottom: 8 }}>Имя коуча</div>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={applyAccent}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* Accent color */}
        <div style={{ marginBottom: 24 }}>
          <div className="t-cap" style={{ marginBottom: 8 }}>Цвет акцента</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="color"
              value={accentInput}
              onChange={(e) => {
                setAccentInput(e.target.value);
                setCoach({ ...coach, accentColor: e.target.value });
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--border-subtle)",
                padding: 2,
                cursor: "pointer",
              }}
            />
            <input
              value={accentInput}
              onChange={(e) => setAccentInput(e.target.value)}
              onBlur={applyAccent}
              placeholder="#A86A6A"
              style={{ flex: 1, boxSizing: "border-box", fontFamily: "monospace", fontSize: 14 }}
            />
          </div>
          {/* Preview */}
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {["--accent-soft", "--accent", "--accent-bold", "--accent-deep"].map((v) => (
              <div
                key={v}
                style={{
                  flex: 1,
                  height: 24,
                  borderRadius: "var(--radius-sm)",
                  background: `var(${v})`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div className="t-cap" style={{ marginBottom: 8 }}>Прогресс: {progress} из {coach.tasks.length}</div>
          <div className="progress" style={{ height: 8, borderRadius: 4 }}>
            <span
              className="progress__fill"
              style={{ width: `${Math.round((progress / coach.tasks.length) * 100)}%`, borderRadius: 4 }}
            />
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ borderTop: "1px solid color-mix(in oklab, var(--accent-deep) 30%, transparent)", paddingTop: 20 }}>
          <div className="t-cap" style={{ marginBottom: 8, color: "var(--accent-deep)" }}>
            Опасная зона
          </div>
          <button
            className="btn-outline"
            onClick={resetAll}
            style={{
              width: "100%",
              borderColor: "color-mix(in oklab, var(--accent-deep) 40%, transparent)",
              color: "var(--accent-deep)",
            }}
          >
            Сбросить весь прогресс
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
