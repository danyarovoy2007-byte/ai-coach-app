import { create } from "zustand";

/* ── Color helpers for white-label ── */
const hexToRgb = (hex: string): [number, number, number] | null => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
};

const lighten = (hex: string, factor: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const mix = (c: number) => Math.round(c + (255 - c) * factor);
  return `rgb(${mix(rgb[0])}, ${mix(rgb[1])}, ${mix(rgb[2])})`;
};

const darken = (hex: string, factor: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const mix = (c: number) => Math.round(c * factor);
  return `rgb(${mix(rgb[0])}, ${mix(rgb[1])}, ${mix(rgb[2])})`;
};

/* ── Types ── */

export type Tab = "quest" | "chat" | "profile";

export interface CoachConfig {
  name: string;
  title: string;
  avatarLetter: string;
  accentColor: string;
  programTitle: string;
  tasks: TaskDef[];
}

export interface TaskDef {
  order: number;
  title: string;
  emoji: string;
  format: "TEXT" | "CHECKLIST" | "MEDITATION" | "SLIDER" | "PHOTO" | "CHOICE";
}

export interface Message {
  id: string;
  role: "AI" | "USER";
  text: string;
  time: string;
}

export interface Achievement {
  key: string;
  title: string;
  description: string;
  xp: number;
  unlockedAt?: string;
}

export interface AppState {
  /* Theme */
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;

  /* Routing */
  tab: Tab;
  setTab: (t: Tab) => void;
  subRoute: string | null;
  setSubRoute: (r: string | null) => void;

  /* Coach config (white-label) */
  coach: CoachConfig;
  setCoach: (c: CoachConfig) => void;

  /* User */
  clientName: string;
  setClientName: (n: string) => void;
  progress: number;
  setProgress: (p: number) => void;

  /* Chat */
  messages: Message[];
  addMessage: (m: Message) => void;
  setMessages: (ms: Message[]) => void;

  /* Task modal */
  activeTaskIndex: number | null;
  setActiveTaskIndex: (i: number | null) => void;

  /* Achievements */
  unlockedAchievements: Achievement[];
  setAchievements: (a: Achievement[]) => void;

  /* Telegram user */
  telegramId: string | null;
  setTelegramId: (id: string) => void;
}

/* ── Default coach ── */
const DEFAULT_COACH: CoachConfig = {
  name: "Инна Луна",
  title: "Психолог, гештальт-подход · 10 лет",
  avatarLetter: "И",
  accentColor: "#A86A6A",
  programTitle: "Путь к себе",
  tasks: [
    { order: 1, title: "Дневник эмоций", emoji: "🌸", format: "TEXT" },
    { order: 2, title: "Письмо себе", emoji: "✉️", format: "TEXT" },
    { order: 3, title: "Благодарность", emoji: "✨", format: "CHECKLIST" },
    { order: 4, title: "Сканирование тела", emoji: "🧘", format: "MEDITATION" },
    { order: 5, title: "Карта чувств", emoji: "🎯", format: "SLIDER" },
    { order: 6, title: "Внутренний ребёнок", emoji: "📷", format: "PHOTO" },
    { order: 7, title: "Мои ценности", emoji: "💎", format: "CHOICE" },
    { order: 8, title: "Письмо прощения", emoji: "💌", format: "TEXT" },
    { order: 9, title: "Утренний ритуал", emoji: "🌅", format: "CHECKLIST" },
    { order: 10, title: "Дыхание 4-7-8", emoji: "🫁", format: "MEDITATION" },
    { order: 11, title: "Письмо Инне", emoji: "💫", format: "TEXT" },
  ],
};

/* ── Store ── */
export const useStore = create<AppState>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    set({ theme });
  },

  tab: "quest",
  setTab: (tab) => set({ tab }),
  subRoute: null,
  setSubRoute: (subRoute) => set({ subRoute }),

  coach: DEFAULT_COACH,
  setCoach: (coach) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement.style;
      const hex = coach.accentColor;

      // Derive accent family: lighter, darker, glow, gradient stops
      const rgb = hexToRgb(hex);
      if (rgb) {
        root.setProperty("--accent", hex);
        root.setProperty("--accent-bold", hex);
        root.setProperty("--accent-deep", darken(hex, 0.75));
        root.setProperty("--accent-soft", lighten(hex, 0.55));
        root.setProperty("--accent-glow", lighten(hex, 0.35));
        root.setProperty("--gradient-cta", `linear-gradient(135deg, ${hex}, ${darken(hex, 0.8)})`);
        root.setProperty("--gradient-gold", `linear-gradient(135deg, ${lighten(hex, 0.5)}, ${hex})`);
      }
    }
    set({ coach });
  },

  clientName: "",
  setClientName: (clientName) => set({ clientName }),
  progress: 0,
  setProgress: (progress) => set({ progress }),

  messages: [],
  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  setMessages: (messages) => set({ messages }),

  activeTaskIndex: null,
  setActiveTaskIndex: (activeTaskIndex) => set({ activeTaskIndex }),

  unlockedAchievements: [],
  setAchievements: (unlockedAchievements) => set({ unlockedAchievements }),

  telegramId: null,
  setTelegramId: (telegramId) => set({ telegramId }),
}));
