import { useCallback, useSyncExternalStore } from "react";

import { themeStore } from "@/lib/theme-store";

export function useTheme() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    themeStore.get
  );

  const toggle = useCallback(() => {
    themeStore.set(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, toggle };
}