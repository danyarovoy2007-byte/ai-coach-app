"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "./Icons";
import { NeuronMark } from "./NeuronMark";

const GOALS = ["Снизить тревогу", "Уверенность", "Сон", "Фокус", "Деньги", "Любовь"];
const EXPERIENCES = ["Новичок", "Есть практика", "Опытный"];

interface OnboardingForm {
  name: string;
  age: string;
  experience: string;
  goal: string;
}

export function OnboardingScreen({
  onComplete,
}: {
  onComplete: (form: OnboardingForm) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>({
    name: "",
    age: "",
    experience: "",
    goal: "",
  });

  const totalSteps = 3; // 0 = name, 1 = experience, 2 = goal

  const canNext = (): boolean => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return form.experience !== "";
    if (step === 2) return form.goal !== "";
    return true;
  };

  const next = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete(form);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        padding: "60px 20px 32px",
        zIndex: 40,
      }}
    >
      {/* Atmosphere */}
      <div className="atmo">
        <div className="atmo-orb atmo-orb--rose" />
        <div className="atmo-orb atmo-orb--gold" />
      </div>

      {/* Progress dots */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          marginBottom: 40,
          position: "relative",
          zIndex: 2,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 999,
              background:
                i === step
                  ? "var(--gradient-cta)"
                  : i < step
                  ? "var(--accent)"
                  : "var(--border-subtle)",
              transition: "all 0.35s var(--ease-in)",
            }}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 2,
          }}
        >
          {step === 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NeuronMark size="lg" animated={false} />
              <h1 className="t-h1" style={{ margin: "32px 0 8px", textAlign: "center" }}>
                Как тебя зовут?
              </h1>
              <p className="t-body-it" style={{ marginBottom: 24, textAlign: "center" }}>
                Коуч будет обращаться к тебе по имени
              </p>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Твоё имя"
                autoFocus
                style={{
                  maxWidth: 280,
                  textAlign: "center",
                  fontSize: 20,
                  padding: "14px 20px",
                  borderRadius: "var(--radius-md)",
                }}
                onKeyDown={(e) => e.key === "Enter" && form.name.trim() && next()}
              />
            </div>
          )}

          {step === 1 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h1 className="t-h1" style={{ margin: "0 0 8px" }}>
                Твой опыт
              </h1>
              <p className="t-body-it" style={{ marginBottom: 28 }}>
                Это поможет коучу подобрать подход
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {EXPERIENCES.map((exp) => (
                  <button
                    key={exp}
                    className={form.experience === exp ? "chip chip--active" : "chip"}
                    onClick={() => setForm({ ...form, experience: exp })}
                    style={{
                      height: 52,
                      fontSize: 16,
                      justifyContent: "center",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h1 className="t-h1" style={{ margin: "0 0 8px" }}>
                Что хочешь проработать?
              </h1>
              <p className="t-body-it" style={{ marginBottom: 28 }}>
                Выбери главный фокус на сейчас
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    className={form.goal === goal ? "chip chip--active" : "chip"}
                    onClick={() => setForm({ ...form, goal })}
                    style={{
                      height: 52,
                      fontSize: 15,
                      justifyContent: "center",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <button
        className="btn-primary"
        onClick={next}
        disabled={!canNext()}
        style={{
          width: "100%",
          opacity: canNext() ? 1 : 0.4,
          position: "relative",
          zIndex: 2,
        }}
      >
        {step < totalSteps - 1 ? "Дальше" : "В путь"}
      </button>
    </motion.div>
  );
}
