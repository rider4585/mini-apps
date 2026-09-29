import { useState } from "react";
import { format } from "date-fns";
import {
  Bell,
  BellRing,
  CalendarClock,
  CalendarDays,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Send
} from "lucide-react";

import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@shared/components/ui/dialog";
import { APP_NAME } from "@shared/lib/constants";
import { cn } from "@shared/lib/utils";
import ThemeToggle from "@shared/components/ThemeToggle";

const SIDEBAR_KEY = "dsr-mg:sidebar:v1";

function useCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
      return false;
    }
  });
  function toggle() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, c ? "0" : "1");
      } catch {
        // ignore
      }
      return !c;
    });
  }
  return { collapsed, toggle };
}

function LogoMark({ className }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 shadow-md shadow-indigo-500/30",
        className
      )}
    >
      <Send className="h-5 w-5 text-white" />
    </span>
  );
}

function BrandText() {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold tracking-tight text-foreground">
        {APP_NAME}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        Status & timesheet tool
      </p>
    </div>
  );
}

function ReminderRow({ icon: Icon, label, when, accent }) {
  return (
    <li className="flex items-center gap-2.5 text-xs">
      <Icon className={cn("h-3.5 w-3.5 shrink-0", accent)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium tabular-nums text-foreground">
        {when ? format(when, "EEE, dd MMM 6:00 PM") : "–"}
      </span>
    </li>
  );
}

function ReminderPanel({ reminders, onEnableNotifications, onDownloadIcs }) {
  return (
    <div className="space-y-3 rounded-2xl border bg-muted/40 p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Bell className="h-4 w-4 text-primary" />
        Reminders
      </div>

      <ul className="space-y-2.5">
        <ReminderRow
          icon={CalendarDays}
          label="Daily status"
          when={reminders?.dsr}
          accent="text-indigo-600 dark:text-indigo-400"
        />
        <ReminderRow
          icon={CalendarClock}
          label="Timesheet"
          when={reminders?.timesheet}
          accent="text-violet-600 dark:text-violet-400"
        />
      </ul>

      <div className="grid gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onEnableNotifications}
          className="w-full justify-start gap-2"
        >
          <BellRing className="h-4 w-4" />
          {reminders?.permission === "granted"
            ? "Notifications on"
            : "Enable notifications"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDownloadIcs}
          className="w-full justify-start gap-2"
        >
          <Download className="h-4 w-4" />
          Add to phone calendar
        </Button>
      </div>

      <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
        Every Friday 6 PM for the daily status, and on the 2nd of each month at
        6 PM for the timesheet.
      </p>
    </div>
  );
}

export default function Sidebar({
  apps = [],
  activeApp,
  onNavigate,
  reminders,
  onEnableNotifications,
  onDownloadIcs
}) {
  const { collapsed, toggle } = useCollapsed();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* ---------- Mobile top bar ---------- */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <LogoMark className="h-9 w-9 rounded-lg" />
          <BrandText />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSheetOpen(true)}
            aria-label="Open reminders"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* ---------- Desktop rail (sticky + collapsible) ---------- */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-card/60 backdrop-blur transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-72"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 px-4 pt-5",
            collapsed ? "flex-col gap-3" : "justify-between"
          )}
        >
          {collapsed ? (
            <>
              <LogoMark />
              <div className="flex flex-col gap-1">
                <ThemeToggle />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggle}
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <LogoMark />
                <BrandText />
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggle}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3">
          {apps.map((item) => {
            const Icon = item.icon;
            const active = activeApp?.id === item.id;
            const label = item.title || item.label;
            const description = item.description;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.route)}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl py-3 text-left transition-colors",
                  collapsed ? "justify-center px-0" : "px-3",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                </span>
                {!collapsed && (
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {label}
                    </span>
                    {description && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {description}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 pb-5 pt-3">
            <ReminderPanel
              reminders={reminders}
              onEnableNotifications={onEnableNotifications}
              onDownloadIcs={onDownloadIcs}
            />
          </div>
        )}
      </aside>

      {/* ---------- Mobile bottom nav ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div
          className="grid gap-2 px-4 py-2"
          style={{ gridTemplateColumns: `repeat(${apps.length || 1}, minmax(0, 1fr))` }}
        >
          {apps.map((item) => {
            const Icon = item.icon;
            const active = activeApp?.id === item.id;
            const label = item.title || item.label;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ---------- Mobile reminders sheet ---------- */}
      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="bottom-0 left-0 right-0 top-auto w-full max-w-full translate-x-0 translate-y-0 rounded-t-2xl p-6 pb-10 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:pb-6">
          <DialogHeader className="text-left">
            <DialogTitle>Reminders</DialogTitle>
            <DialogDescription>
              Your recurring reminders and how to receive them on your phone.
            </DialogDescription>
          </DialogHeader>
          <ReminderPanel
            reminders={reminders}
            onEnableNotifications={onEnableNotifications}
            onDownloadIcs={onDownloadIcs}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
