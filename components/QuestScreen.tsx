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

  // SVG snake path — more organic layout
  const W = 350;
  const ROW = 76;
  const TOP = 50;
  const CL = 64;
  const CR = 282;
  const R = 23;

  const nodes = tasks.map((_, i) => {
    const offset = Math.sin(i * 0.8) * 10;
    const stagger = (i % 3 - 1) * 8;
    return {
      x: (i % 2 === 0 ? CL : CR) + offset + stagger,
      y: TOP + i * ROW,
      i,
    };
  });

  let d = `M ${nodes[0].x} ${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const p0 = nodes[i - 1];
    const p1 = nodes[i];
    const goR = p1.x > p0.x;
    const dx = Math.abs(p1.x - p0.x);
    const dy = Math.abs(p1.y - p0.y);
    const cpx = dx * 0.6;
    const cpy = dy * 0.5;
    d += ` C ${goR ? p0.x + cpx : p0.x - cpx} ${p0.y + cpy}, ${goR ? p1.x - cpx : p1.x + cpx} ${p1.y - cpy}, ${p1.x} ${p1.y}`;
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

      {/* Atmosphere glow orbs */}
      <div className="atmo">
        <div className="atmo-orb atmo-orb--rose" />
        <div className="atmo-orb atmo-orb--gold" />
      </div>

      {/* Daily task card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: "14px 18px", position: "relative", zIndex: 1 }}
      >
        <div
          className="card-daily"
          style={{
            padding: 20,
            border: "1px solid color-mix(in oklab, var(--accent-soft) 60%, transparent)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "var(--radius-full)",
                background: "var(--gradient-cta)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                boxShadow: "0 4px 16px rgba(168,106,106,0.22)",
                flexShrink: 0,
              }}
            >
              {tasks[dayIdx].emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                  marginBottom: 2,
                }}
              >
                Задание {dayIdx + 1}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {tasks[dayIdx].title}
              </div>
            </div>
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              style={{ height: 44, padding: "0 22px", fontSize: 14, flexShrink: 0 }}
              onClick={() => setActiveTaskIndex(dayIdx)}
            >
              Начать
            </motion.button>
          </div>
          {/* Progress bar */}
          <div className="progress" style={{ height: 6, borderRadius: 3 }}>
            <span className="progress__fill" style={{ width: `${pct}%`, borderRadius: 3 }} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            <span>{pct}% пройдено</span>
            <span>{tasks.length - progress} осталось</span>
          </div>
        </div>
      </motion.div>

      {/* SVG Snake Path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: "0 20px", position: "relative", zIndex: 1 }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          style={{ display: "block", maxWidth: W, margin: "0 auto" }}
        >
          <defs>
            {/* Glow filter */}
            <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Gradients */}
            <linearGradient id="g-path" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-soft)" />
              <stop offset="50%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-deep)" />
            </linearGradient>
            <linearGradient id="g-node" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-deep)" />
            </linearGradient>

            {/* Active node pulse animation */}
            <radialGradient id="g-pulse">
              <stop offset="0%" stopColor="var(--accent-bold)" stopOpacity="0.3">
                <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="var(--accent-bold)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background path (dotted) */}
          <path
            d={d}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="2.5"
            strokeDasharray="5 5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Completed path segment */}
          {progress > 0 && (
            <path
              d={d}
              fill="none"
              stroke="url(#g-path)"
              strokeWidth="3"
              strokeDasharray={`${progress * 76} ${H * 2}`}
              strokeLinecap="round"
              opacity="0.85"
              style={{
                transition: "stroke-dasharray 0.8s var(--ease-in)",
              }}
            />
          )}

          {/* Nodes */}
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
                {/* Active pulse ring */}
                {active && (
                  <circle
                    r={R + 18}
                    fill="url(#g-pulse)"
                    filter="url(#node-glow)"
                  />
                )}

                {/* Active ring */}
                {active && (
                  <circle
                    r={R + 6}
                    fill="none"
                    stroke="var(--accent-bold)"
                    strokeWidth="2.5"
                    opacity="0.6"
                  >
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="r" values={String(R + 6)} from={String(R + 6)} to={String(R + 12)} dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Main node circle */}
                <circle
                  r={R}
                  fill={
                    done
                      ? "url(#g-node)"
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
                  strokeWidth={active ? 2.5 : 1.5}
                  style={{
                    filter: done ? "url(#node-glow)" : "none",
                    transition: "all 0.5s var(--ease-in)",
                  }}
                />

                {/* Node content */}
                {done ? (
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="15"
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
                    fontSize="14"
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
                  x={i % 2 === 0 ? R + 15 : -(R + 15)}
                  y="5"
                  textAnchor={i % 2 === 0 ? "start" : "end"}
                  dominantBaseline="central"
                  fontFamily="var(--font-body)"
                  fontSize="12"
                  fill={locked ? "var(--text-muted)" : "var(--text-primary)"}
                  fontWeight={active ? 600 : 400}
                  style={{ transition: "all 0.4s ease" }}
                >
                  {tasks[i].title}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* Achievement card */}
      {progress >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{ padding: "10px 18px 18px", position: "relative", zIndex: 1 }}
        >
          <div
            className="card-glass"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "var(--radius-full)",
                background: "var(--gradient-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(201,168,76,0.35)",
                flexShrink: 0,
              }}
            >
              <Icon.Star size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 15,
                  marginBottom: 3,
                }}
              >
                {progress >= tasks.length
                  ? "Весь путь пройден!"
                  : progress >= 7
                  ? "Больше половины!"
                  : "Три дня подряд"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {progress >= tasks.length
                  ? "Ты прошёл все задания. Горжусь тобой."
                  : progress >= 7
                  ? "Нейронные связи укрепляются с каждым днём."
                  : "Первые 3 дня — самые важные. Ты справился."}
              </div>
            </div>
            <span className="badge">
              +{progress >= tasks.length ? 500 : progress >= 7 ? 300 : 150} XP
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
