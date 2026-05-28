"use client";
import React from "react";
import { motion } from "motion/react";
import { Icon } from "./Icons";
import type { Tab } from "@/store";

const NAV_ITEMS: { id: Tab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "chat", label: "Коуч", Icon: Icon.Chat },
  { id: "quest", label: "Путь", Icon: Icon.Path },
  { id: "profile", label: "Я", Icon: Icon.User },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav
      className="m-nav"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            className={`m-nav__btn ${isActive ? "m-nav__btn--active" : ""}`}
            onClick={() => onChange(item.id)}
          >
            <item.Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
