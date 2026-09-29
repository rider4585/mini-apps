const KEY = "dsr-mg:theme";

let current = null;
const listeners = new Set();

function read() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // storage unavailable
  }
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export const themeStore = {
  get: () => current ?? (current = read()),
  set(theme) {
    current = theme;
    apply(theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // ignore
    }
    listeners.forEach((l) => l(theme));
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};