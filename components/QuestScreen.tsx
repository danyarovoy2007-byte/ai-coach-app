"use client";
import React from "react";
import { motion } from "motion/react";
import { Icon } from "./Icons";
import { useStore } from "@/store";

export function QuestScreen() {
  const coach = useStore((s) => s.coach);
  const progress = useStore((s) => s.progress);
  const setActiveTaskIndex = useStore((s) => s.setActiveTaskIndex);

  const tasks = coach.tasks;
  const dayIdx = Math.min(progress, tasks.length - 1);
  const pct = Math.round((progress / tasks.length) * 100);

  // SVG path layout
  const W = 350;
  const ROW = 74;
  const TOP = 46;
  const CL = 68;
  const CR = 278;
  const R = 22;

  const nodes = tasks.map((_, i) => {
    const j = ((i * 137) % 7) - 3;
    return {
      x: (i % 2 === 0 ? CL : CR) + j,
      y: TOP + i * ROW,
      i,
    };
  });

  let d = `M ${nodes[0].x} ${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const p0 = nodes[i - 1];
    const p1 = nodes[i];
    const goR = p1.x > p0.x;
    d += ` C ${goR ? p0.x + 100 : p0.x - 100} ${p0.y + 20}, ${goR ? p1.x - 100 : p1.x + 100} ${p1.y - 20}, ${p1.x} ${p1.y}`;
  }
  const H = TOP + (nodes.length - 1) * ROW + 80;

  return (
    <div
      className="no-scrollbar"
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        background: "var(--bg-primary)",
        paddingBottom: 80,
      }}
    >
      {/* Header */}
      <div className="m-header">
        <div className="m-header__avatar">{coach.avatarLetter}</div>
        <div className="m-header__meta">
          <div className="m-header__name">{coach.name}</div>
          <div className="m-header__sub">
            {coach.programTitle} · день {dayIdx + 1}
          </div>
        </div>
        <button className="m-header__action">
          <Icon.Sparkle size={16} />
        </button>
      </div>

      {/* Atmosphere */}
      <div className="atmo">
        <div className="atmo-orb atmo-orb--rose" />
        <div className="atmo-orb atmo-orb--gold" />
      </div>

      {/* Daily task card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: "14px 18px", position: "relative", zIndex: 1 }}
      >
        <div className="card-daily" style={{ padding: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-full)",
                background: "var(--gradient-cta)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 4px 12px rgba(168,106,106,0.25)",
              }}
            >
              {tasks[dayIdx].emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 17,
                  letterSpacing: "-0.01em",
                }}
              >
                Задание {dayIdx + 1}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginTop: 3,
                }}
              >
                {tasks[dayIdx].title}
              </div>
            </div>
            <motion.button
              className="btn-primary"
              whileTap={{ scale: 0.96 }}
              style={{ height: 42, padding: "0 20px", fontSize: 14 }}
              onClick={() => setActiveTaskIndex(dayIdx)}
            >
              Начать
            </motion.button>
          </div>
          <div className="progress">
            <span className="progress__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </motion.div>

      {/* SVG Path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: "0 20px", position: "relative", zIndex: 1 }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ display: "block" }}
        >
          {/* Background path */}
          <path
            d={d}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Completed portion */}
          <path
            d={d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeDasharray={`${progress * 76} ${H * 2}`}
            strokeLinecap="round"
            opacity="0.9"
          />

          {nodes.map((n, i) => {
            const done = i < progress;
            const active = i === progress;
            const locked = i > progress;

            return (
              <g
                key={i}
                transform={`translate(${n.x},${n.y})`}
                style={{ cursor: locked ? "default" : "pointer" }}
                onClick={() => !locked && setActiveTaskIndex(i)}
              >
                {/* Active glow ring */}
                {active && (
                  <>
                    <motion.circle
                      r={R + 16}
                      fill="var(--accent)"
                      initial={{ opacity: 0.03 }}
                      animate={{ opacity: [0.03, 0.1, 0.03], r: [R + 12, R + 24, R + 12] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <circle
                      r={R + 7}
                      fill="none"
                      stroke="var(--accent-bold)"
                      strokeWidth="2"
                      opacity="0.55"
                    />
                  </>
                )}

                {/* Node */}
                <circle
                  r={R}
                  fill={
                    done
                      ? "url(#g-rose)"
                      : active
                      ? "var(--bg-primary)"
                      : "var(--bg-muted)"
                  }
                  stroke={
                    done
                      ? "var(--accent-deep)"
                      : active
                      ? "var(--accent-bold)"
                      : "var(--border-subtle)"
                  }
                  strokeWidth={active ? 2.5 : 1.2}
                />

                {/* Content */}
                {done ? (
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="14"
                    fill="var(--accent-deep)"
                    fontWeight="700"
                  >
                    ✓
                  </text>
                ) : active ? (
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="15"
                    fontWeight="700"
                    fill="var(--accent-bold)"
                  >
                    {i + 1}
                  </text>
                ) : (
                  <g transform="translate(-7, -7)">
                    <Icon.Lock size={14} />
                  </g>
                )}

                {/* Label */}
                <text
                  x={i % 2 === 0 ? R + 14 : -(R + 14)}
                  y="4"
                  textAnchor={i % 2 === 0 ? "start" : "end"}
                  dominantBaseline="central"
                  fontFamily="var(--font-body)"
                  fontSize="12"
                  fill={locked ? "var(--text-muted)" : "var(--text-primary)"}
                  fontWeight={active ? 600 : 400}
                >
                  {tasks[i].title}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="g-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-soft)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Achievement */}
      {progress >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.16,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{ padding: "10px 18px 18px", position: "relative", zIndex: 1 }}
        >
          <div
            className="card-glass"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "var(--radius-full)",
                background: "var(--gradient-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(201,168,76,0.30)",
              }}
            >
              <Icon.Star size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {progress >= 10
                  ? "Весь путь пройден!"
                  : progress >= 7
                  ? "Больше половины!"
                  : "Три дня подряд"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {progress >= 10
                  ? "Ты прошёл все задания"
                  : progress >= 7
                  ? "Формируется привычка"
                  : "Формируется привычка"}
              </div>
            </div>
            <span className="badge">+100 XP</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
