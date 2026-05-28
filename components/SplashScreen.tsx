"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NeuronMark } from "./NeuronMark";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 600);
    const t2 = setTimeout(() => setStage(2), 1100);
    const t3 = setTimeout(() => setStage(3), 2200);
    const t4 = setTimeout(onDone, 2800);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <AnimatePresence>
      {stage < 3 && (
        <motion.div
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--bg-primary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          {/* Glow */}
          <div
            className="atmo"
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
          >
            <div
              className="atmo-orb atmo-orb--rose"
              style={{
                opacity: stage >= 1 ? 0.12 : 0.04,
                transition: "opacity 1.2s var(--ease-in)",
              }}
            />
            <div
              className="atmo-orb atmo-orb--gold"
              style={{
                opacity: stage >= 2 ? 0.08 : 0.02,
                transition: "opacity 1.2s var(--ease-in)",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: 56 }}
          >
            <NeuronMark size="xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 16 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="t-h1"
            style={{ margin: 0 }}
          >
            AI-Coach
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: stage >= 2 ? 0.7 : 0, y: stage >= 2 ? 0 : 14 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="t-body-it"
            style={{ marginTop: 14, maxWidth: 260, textAlign: "center" }}
          >
            Твой персональный коуч в Telegram
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
