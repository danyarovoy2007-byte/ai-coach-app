"use client";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/store";

interface ModalProps {
  taskIndex: number;
  onClose: () => void;
}

export function TaskModal({ taskIndex, onClose }: ModalProps) {
  const coach = useStore((s) => s.coach);
  const progress = useStore((s) => s.progress);
  const setProgress = useStore((s) => s.setProgress);
  const telegramId = useStore((s) => s.telegramId);
  const task = coach.tasks[taskIndex];

  if (!task) return null;

  const isDone = taskIndex < progress;
  const isActive = taskIndex === progress;

  const completeTask = async (responseContent?: string) => {
    if (!isActive) {
      onClose();
      return;
    }

    setProgress(progress + 1);

    // Save to API if we have a telegramId
    if (telegramId) {
      try {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegramId,
            taskOrder: task.order,
            format: task.format,
            content: responseContent || JSON.stringify({ completed: true }),
          }),
        });
      } catch {
        // Silently fail — state is already updated locally
      }
    }

    onClose();
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

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-full)",
              background: isDone ? "var(--gradient-cta)" : "var(--bg-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: isDone ? "0 4px 12px rgba(168,106,106,0.25)" : "none",
            }}
          >
            {isDone ? "✓" : task.emoji}
          </div>
          <div>
            <div className="t-cap">Задание {taskIndex + 1} из {coach.tasks.length}</div>
            <div className="t-h3" style={{ margin: "2px 0 0" }}>{task.title}</div>
          </div>
        </div>

        {/* Render based on format */}
        <AnimatePresence mode="wait">
          {task.format === "TEXT" && (
            <TextTask key="text" isDone={isDone} onComplete={completeTask} />
          )}
          {task.format === "CHECKLIST" && (
            <ChecklistTask key="check" isDone={isDone} onComplete={completeTask} />
          )}
          {task.format === "SLIDER" && (
            <SliderTask key="slider" isDone={isDone} onComplete={completeTask} />
          )}
          {task.format === "CHOICE" && (
            <ChoiceTask key="choice" isDone={isDone} onComplete={completeTask} />
          )}
          {task.format === "MEDITATION" && (
            <MeditationTask key="med" isDone={isDone} onComplete={completeTask} />
          )}
          {task.format === "PHOTO" && (
            <PhotoTask key="photo" isDone={isDone} onComplete={completeTask} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ── TEXT ── */
function TextTask({ isDone, onComplete }: { isDone: boolean; onComplete: (content?: string) => void }) {
  const [text, setText] = React.useState("");
  return (
    <div>
      <p className="t-body" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
        {isDone
          ? "Ты уже выполнил это задание. Вот твой ответ:"
          : "Запиши свои мысли. Не оценивай — просто пиши что идёт."}
      </p>
      {isDone ? (
        <div
          className="card"
          style={{
            padding: 16,
            whiteSpace: "pre-wrap",
            fontStyle: "italic",
            color: "var(--text-secondary)",
          }}
        >
          «Я чувствую, что...»
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Я чувствую, что..."
          style={{ minHeight: 160, resize: "vertical" }}
          autoFocus
        />
      )}
      {!isDone && (
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.97 }}
          onClick={() => onComplete(JSON.stringify({ text: text.trim() }))}
          disabled={!text.trim()}
          style={{ width: "100%", marginTop: 16, opacity: text.trim() ? 1 : 0.4 }}
        >
          Сохранить
        </motion.button>
      )}
    </div>
  );
}

/* ── CHECKLIST ── */
function ChecklistTask({ isDone, onComplete }: { isDone: boolean; onComplete: (content?: string) => void }) {
  const items = [
    "Я жив и дышу",
    "У меня есть крыша над головой",
    "Я могу двигаться",
    "Кто-то меня любит",
    "Сегодня было что-то хорошее",
  ];
  const [checked, setChecked] = React.useState<number[]>(isDone ? [0, 1, 2, 3, 4] : []);

  const toggle = (i: number) => {
    if (isDone) return;
    setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));
  };

  const allDone = checked.length === items.length;

  return (
    <div>
      <p className="t-body" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
        {isDone ? "Ты отметил всё:" : "Отметь всё, за что ты благодарен:"}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <motion.button
            key={i}
            whileTap={isDone ? {} : { scale: 0.98 }}
            onClick={() => toggle(i)}
            className={checked.includes(i) ? "chip chip--active" : "chip"}
            style={{
              justifyContent: "flex-start",
              height: 48,
              fontSize: 15,
              borderRadius: "var(--radius-md)",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: checked.includes(i)
                  ? "2px solid white"
                  : "2px solid var(--border-subtle)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {checked.includes(i) && "✓"}
            </span>
            <span style={{ textDecoration: checked.includes(i) ? "line-through" : "none" }}>
              {item}
            </span>
          </motion.button>
        ))}
      </div>
      {!isDone && allDone && (
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onComplete(JSON.stringify({ checked: checked }))}
          style={{ width: "100%", marginTop: 16 }}
        >
          Готово
        </motion.button>
      )}
    </div>
  );
}

/* ── SLIDER ── */
function SliderTask({ isDone, onComplete }: { isDone: boolean; onComplete: (content?: string) => void }) {
  const [value, setValue] = React.useState(isDone ? 5 : 3);
  const moods = ["😰", "😟", "😐", "🙂", "😊"];

  return (
    <div>
      <p className="t-body" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
        {isDone ? "Твоё состояние:" : "Оцени своё состояние сейчас:"}
      </p>
      <div style={{ textAlign: "center", fontSize: 48, margin: "20px 0" }}>
        {moods[value - 1]}
      </div>
      {!isDone && (
        <>
          <input
            type="range"
            min={1}
            max={5}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            style={{
              width: "100%",
              height: 6,
              appearance: "none",
              background: "var(--bg-muted)",
              borderRadius: 3,
              outline: "none",
              cursor: "pointer",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            <span>Очень плохо</span>
            <span>Отлично</span>
          </div>
          <motion.button
            className="btn-primary"
            whileTap={{ scale: 0.97 }}
            onClick={() => onComplete(JSON.stringify({ sliderValue: value }))}
            style={{ width: "100%", marginTop: 20 }}
          >
            Сохранить
          </motion.button>
        </>
      )}
    </div>
  );
}

/* ── CHOICE ── */
function ChoiceTask({ isDone, onComplete }: { isDone: boolean; onComplete: (content?: string) => void }) {
  const values = ["Семья", "Свобода", "Здоровье", "Творчество", "Любовь", "Развитие", "Деньги", "Дружба"];
  const [selected, setSelected] = React.useState<string[]>(isDone ? ["Семья", "Творчество", "Свобода"] : []);

  const toggle = (v: string) => {
    if (isDone) return;
    setSelected((s) =>
      s.includes(v) ? s.filter((x) => x !== v) : s.length < 3 ? [...s, v] : s
    );
  };

  return (
    <div>
      <p className="t-body" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
        {isDone ? "Твои главные ценности:" : "Выбери 3 самые важные ценности:"}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {values.map((v) => {
          const isSelected = selected.includes(v);
          return (
            <motion.button
              key={v}
              whileTap={isDone ? {} : { scale: 0.95 }}
              onClick={() => toggle(v)}
              className={isSelected ? "chip chip--active" : "chip"}
              style={{
                height: 44,
                fontSize: 14,
                borderRadius: "var(--radius-md)",
              }}
            >
              {v}
            </motion.button>
          );
        })}
      </div>
      <div className="t-cap" style={{ marginTop: 12, textAlign: "center" }}>
        {selected.length}/3 выбрано
      </div>
      {!isDone && selected.length === 3 && (
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onComplete(JSON.stringify({ values: selected }))}
          style={{ width: "100%", marginTop: 16 }}
        >
          Сохранить
        </motion.button>
      )}
    </div>
  );
}

/* ── PHOTO ── */
function PhotoTask({ isDone, onComplete }: { isDone: boolean; onComplete: (content?: string) => void }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p className="t-body" style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
        {isDone ? "Ты загрузил фото." : "Сфотографируй что-то, что тебя радует сегодня."}
      </p>
      {isDone ? (
        <div
          className="card"
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          📷 Фото загружено
        </div>
      ) : (
        <motion.button
          className="card"
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            height: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            border: "2px dashed var(--border-subtle)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 40 }}>📷</span>
          <span style={{ color: "var(--text-secondary)" }}>Нажми чтобы открыть камеру</span>
        </motion.button>
      )}
      {!isDone && (
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.97 }}
          onClick={() => onComplete()}
          style={{ width: "100%", marginTop: 16 }}
        >
          Пропустить
        </motion.button>
      )}
    </div>
  );
}

/* ── MEDITATION ── */
function MeditationTask({ isDone, onComplete }: { isDone: boolean; onComplete: (content?: string) => void }) {
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [playing]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div style={{ textAlign: "center" }}>
      <p className="t-body" style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
        {isDone ? "Медитация пройдена." : "Дыхание 4-7-8. Вдох (4с) — задержка (7с) — выдох (8с)."}
      </p>

      {/* Breathing circle */}
      <div style={{ position: "relative", width: 180, height: 180, margin: "20px auto" }}>
        <motion.div
          animate={
            playing
              ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
              : { scale: 1, opacity: 0.6 }
          }
          transition={
            playing
              ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0 }
          }
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "var(--gradient-cta)",
            opacity: 0.6,
            boxShadow: "0 0 40px rgba(168,106,106,0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "var(--font-display)",
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 700 }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {playing ? "Дыши..." : "Нажми старт"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.95 }}
          onClick={() => setPlaying(!playing)}
          style={{ width: 140 }}
        >
          {playing ? "Пауза" : "Старт"}
        </motion.button>
        {time > 0 && (
          <motion.button
            className="btn-outline"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setPlaying(false);
              setTime(0);
            }}
          >
            Сброс
          </motion.button>
        )}
      </div>

      {time >= 60 && (
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onComplete(JSON.stringify({ meditationSeconds: time }))}
          style={{ width: "100%", marginTop: 16 }}
        >
          Завершить медитацию
        </motion.button>
      )}
    </div>
  );
}
