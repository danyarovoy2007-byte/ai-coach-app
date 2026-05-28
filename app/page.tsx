"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "@/store";
import {
  getTelegramUser,
  getTelegramTheme,
  onThemeChange,
  isTelegramWebView,
} from "@/lib/telegram";
import { SplashScreen } from "@/components/SplashScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { QuestScreen } from "@/components/QuestScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { BottomNav } from "@/components/BottomNav";
import { TaskModal } from "@/components/TaskModal";
import { SettingsModal } from "@/components/SettingsModal";
import type { Tab } from "@/store";

type Route = "splash" | "onboarding" | "main";

export default function Home() {
  const [route, setRoute] = useState<Route>("splash");
  const [clientExists, setClientExists] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const setClientName = useStore((s) => s.setClientName);
  const setTelegramId = useStore((s) => s.setTelegramId);
  const setTheme = useStore((s) => s.setTheme);
  const activeTaskIndex = useStore((s) => s.activeTaskIndex);
  const setActiveTaskIndex = useStore((s) => s.setActiveTaskIndex);
  const setMessages = useStore((s) => s.setMessages);
  const setProgress = useStore((s) => s.setProgress);
  const setAchievements = useStore((s) => s.setAchievements);

  // Init Telegram
  useEffect(() => {
    const user = getTelegramUser();
    if (user) {
      setClientName(user.firstName);
      setTelegramId(user.id);

      // Load existing data from API
      Promise.all([
        fetch(`/api/client?telegramId=${user.id}`).then((r) => r.ok ? r.json() : null),
        fetch(`/api/messages?telegramId=${user.id}`).then((r) => r.ok ? r.json() : null),
        fetch(`/api/tasks?telegramId=${user.id}`).then((r) => r.ok ? r.json() : null),
        fetch(`/api/achievements?telegramId=${user.id}`).then((r) => r.ok ? r.json() : null),
      ])
        .then(([clientData, messagesData, tasksData, achievementsData]) => {
          if (clientData?.client) {
            setClientName(clientData.client.name);
            setProgress(clientData.client.progress || 0);
            setClientExists(true);
          }
          if (messagesData?.messages?.length > 0) {
            const msgs = messagesData.messages.map((m: { id: string; role: string; text: string }) => ({
              id: m.id,
              role: m.role === "ASSISTANT" || m.role === "AI" ? "AI" as const : "USER" as const,
              text: m.text,
              time: "",
            }));
            setMessages(msgs);
          }
          if (achievementsData?.achievements) {
            setAchievements(achievementsData.achievements);
          }
        })
        .catch(() => {});
    }

    const tgTheme = getTelegramTheme();
    setTheme(tgTheme);
    onThemeChange((t) => setTheme(t));
  }, []);

  const handleOnboardingComplete = useCallback(
    async (form: { name: string; age: string; experience: string; goal: string }) => {
      setClientName(form.name);
      setRoute("main");

      // Save client to API
      const tgUser = getTelegramUser();
      if (tgUser) {
        try {
          await fetch("/api/client", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              telegramId: tgUser.id,
              name: form.name,
              age: form.age ? parseInt(form.age) : undefined,
              experience: form.experience,
              goal: form.goal,
            }),
          });
        } catch {
          // Silently fail — local state is already updated
        }
      }
    },
    []
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
      <AnimatePresence mode="wait">
        {route === "splash" && (
          <SplashScreen
            key="splash"
            onDone={() => setRoute(clientExists ? "main" : "onboarding")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {route === "onboarding" && (
          <OnboardingScreen
            key="onboard"
            onComplete={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      {route === "main" && (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ position: "absolute", inset: 0 }}
        >
          <AnimatePresence mode="wait">
            {tab === "quest" && (
              <motion.div
                key="quest"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "absolute", inset: 0 }}
              >
                <QuestScreen />
              </motion.div>
            )}
            {tab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "absolute", inset: 0 }}
              >
                <ChatScreen />
              </motion.div>
            )}
            {tab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "absolute", inset: 0 }}
              >
                <ProfileScreen onSettingsClick={() => setShowSettings(true)} />
              </motion.div>
            )}
          </AnimatePresence>

          <BottomNav active={tab} onChange={setTab} />

          {/* Task Modal */}
          <AnimatePresence>
            {activeTaskIndex !== null && (
              <TaskModal
                taskIndex={activeTaskIndex}
                onClose={() => setActiveTaskIndex(null)}
              />
            )}
            {showSettings && (
              <SettingsModal onClose={() => setShowSettings(false)} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
