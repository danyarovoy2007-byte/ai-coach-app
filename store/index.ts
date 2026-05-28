import { create } from "zustand";

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
      document.documentElement.style.setProperty("--accent-bold", coach.accentColor);
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

  telegramId: null,
  setTelegramId: (telegramId) => set({ telegramId }),
}));
