import { Suspense, useEffect, useState } from "react";

import PageHeader from "@shared/components/PageHeader";
import Sidebar from "./components/Sidebar";
import { registry } from "./registry";
import { useRouter } from "./router";
import {
  downloadIcs,
  ensureSchedule,
  evaluateReminders,
  reminderState,
  requestNotificationPermission
} from "./reminders";

export default function App() {
  const { activeApp, navigate } = useRouter(registry);
  const [reminders, setReminders] = useState(null);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    ensureSchedule();

    requestNotificationPermission().then(() => {
      setReminders(reminderState());
    });

    function tick() {
      const fired = evaluateReminders();
      if (fired.length) {
        setBanner(
          `${fired.map((f) => f.title).join(" · ")} — time to act now.`
        );
        window.setTimeout(() => setBanner(""), 8000);
      }
      setReminders(reminderState());
    }

    tick();
    const interval = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  async function handleEnableNotifications() {
    await requestNotificationPermission();
    setReminders(reminderState());
  }

  function handleDownloadIcs() {
    downloadIcs();
    setBanner("Imported the reminder schedule (.ics) — your phone calendar will now repeat it.");
    window.setTimeout(() => setBanner(""), 8000);
  }

  if (!activeApp) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-muted-foreground">
        No apps registered.
      </div>
    );
  }

  const AppComponent = activeApp.component;

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar
        apps={registry}
        activeApp={activeApp}
        onNavigate={navigate}
        reminders={reminders}
        onEnableNotifications={handleEnableNotifications}
        onDownloadIcs={handleDownloadIcs}
      />

      <main className="w-full min-w-0 flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          {banner && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
              {banner}
            </div>
          )}

          <PageHeader
            icon={activeApp.icon}
            title={activeApp.title}
            description={activeApp.description}
          />

          <Suspense
            fallback={
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading {activeApp.title}…
              </div>
            }
          >
            <AppComponent />
          </Suspense>

          <footer className="pt-4 text-center text-xs text-muted-foreground">
            Reminders: every Friday 6 PM · every 2nd of month 6 PM
          </footer>
        </div>
      </main>
    </div>
  );
}
