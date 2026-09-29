import { useState, useEffect, useCallback } from "react";

export function useRouter(apps = []) {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((to) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, "", to);
      setPathname(to);
    }
  }, []);

  const cleanPath = (p) => (p && p.length > 1 ? p.replace(/\/+$/, "") : p || "/");
  const current = cleanPath(pathname);

  let activeApp = apps.find((app) => {
    const appRoute = cleanPath(app.route);
    return current === appRoute || (appRoute !== "/" && current.startsWith(appRoute + "/"));
  });

  if (!activeApp && apps.length > 0) {
    activeApp = apps[0];
  }

  return {
    pathname: current,
    activeApp,
    navigate
  };
}
