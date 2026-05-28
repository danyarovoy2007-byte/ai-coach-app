/* Telegram Mini App SDK wrapper */

let tgApp: any = null;

export function getTelegramApp() {
  if (typeof window === "undefined") return null;
  if (tgApp) return tgApp;

  // Try to get Telegram WebApp
  const w = window as any;
  if (w.Telegram?.WebApp) {
    tgApp = w.Telegram.WebApp;
    tgApp.ready();
    tgApp.expand();
    return tgApp;
  }
  return null;
}

export function getTelegramUser() {
  const app = getTelegramApp();
  if (!app?.initDataUnsafe?.user) return null;
  return {
    id: String(app.initDataUnsafe.user.id),
    firstName: app.initDataUnsafe.user.first_name || "",
    lastName: app.initDataUnsafe.user.last_name || "",
    username: app.initDataUnsafe.user.username || "",
  };
}

export function getTelegramTheme(): "light" | "dark" {
  const app = getTelegramApp();
  if (app?.colorScheme === "dark") return "dark";
  return "light";
}

export function getSafeAreaInsets() {
  const app = getTelegramApp();
  if (app) {
    return {
      top: app.contentSafeAreaInset?.top || 0,
      bottom: app.contentSafeAreaInset?.bottom || 0,
    };
  }
  return { top: 0, bottom: 0 };
}

export function isTelegramWebView(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).Telegram?.WebApp;
}

export function onThemeChange(cb: (theme: "light" | "dark") => void) {
  const app = getTelegramApp();
  if (app) {
    app.onEvent("themeChanged", () => {
      cb(app.colorScheme === "dark" ? "dark" : "light");
    });
  }
}

export function openTelegramLink(url: string) {
  const app = getTelegramApp();
  if (app?.openTelegramLink) {
    app.openTelegramLink(url);
  } else if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
}
