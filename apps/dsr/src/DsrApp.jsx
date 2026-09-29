import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarX,
  ListChecks,
  Mail,
  Send,
  Sparkles,
  User,
  X
} from "lucide-react";

import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Calendar } from "@shared/components/ui/calendar";
import { Card, CardContent } from "@shared/components/ui/card";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { cn } from "@shared/lib/utils";
import DatePicker from "@shared/components/DatePicker";
import {
  buildGmailUrl,
  formatDayDate,
  formatShortDate,
  fromDateID,
  getCurrentWeekDays,
  getDateRange,
  isWeekend,
  toDateID
} from "@shared/utils";

import { DEFAULTS } from "../config";
import { dsrStore as store } from "../store";

const MODES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "custom", label: "Custom Range" }
];

function Section({ icon: Icon, title, description, action, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/20">
            <Icon className="h-5 w-5" />
          </span>
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function resolveInitialCc(savedCc) {
  if (!savedCc) return DEFAULTS.cc;
  if (!savedCc.includes("abhishek.gadkari@programming.com")) {
    const oldDefault = "rohit.dudani@programming.com, suraksha.devadiga@programming.com";
    if (savedCc.trim() === oldDefault) {
      return DEFAULTS.cc;
    }
    return `${savedCc.trim().replace(/,+$/, "")}, abhishek.gadkari@programming.com`;
  }
  return savedCc;
}

export default function DsrApp() {
  const draft = store.loadDraft();

  const [mode, setMode] = useState(draft?.mode || "today");
  const [to, setTo] = useState(draft?.to ?? DEFAULTS.to);
  const [cc, setCc] = useState(() => resolveInitialCc(draft?.cc));
  const [name, setName] = useState(draft?.name ?? DEFAULTS.name);
  const [designation, setDesignation] = useState(draft?.designation ?? DEFAULTS.designation);
  const [empCode, setEmpCode] = useState(draft?.empCode ?? DEFAULTS.empCode);
  const [manager, setManager] = useState(draft?.manager ?? DEFAULTS.manager);
  const [startTime, setStartTime] = useState(draft?.startTime ?? DEFAULTS.startTime);
  const [leaveTime, setLeaveTime] = useState(draft?.leaveTime ?? DEFAULTS.leaveTime);
  const [customStart, setCustomStart] = useState(draft?.customStart || "");
  const [customEnd, setCustomEnd] = useState(draft?.customEnd || "");
  const [excluded, setExcluded] = useState(draft?.excluded || []);
  const [sameActivity, setSameActivity] = useState(draft?.sameActivity || false);
  const [sharedActivity, setSharedActivity] = useState(draft?.sharedActivity || "");
  const [activities, setActivities] = useState(draft?.activities || {});
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const currentDraft = {
    mode,
    to,
    cc,
    name,
    designation,
    empCode,
    manager,
    startTime,
    leaveTime,
    customStart,
    customEnd,
    excluded,
    sameActivity,
    sharedActivity,
    activities
  };

  useEffect(() => {
    const t = setTimeout(() => store.saveDraft(currentDraft), 400);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    if (!cc.includes("abhishek.gadkari@programming.com")) {
      setCc((prev) => resolveInitialCc(prev));
    }
  }, []);

  const mailDays = useMemo(() => {
    const today = new Date();

    if (mode === "today") {
      if (isWeekend(today) || excluded.includes(toDateID(today))) return [];
      return [today];
    }

    if (mode === "week") {
      return getCurrentWeekDays(today).filter((d) => {
        if (isWeekend(d)) return false;
        return !excluded.includes(toDateID(d));
      });
    }

    if (!customStart || !customEnd) return [];

    const start = fromDateID(customStart);
    const end = fromDateID(customEnd);

    return getDateRange(start, end).filter((d) => {
      if (isWeekend(d)) return false;
      return !excluded.includes(toDateID(d));
    });
  }, [mode, customStart, customEnd, excluded]);

  function handleExcludeChange(dates) {
    setExcluded((dates || []).map(toDateID));
    setError("");
  }

  function removeExcluded(dateID) {
    setExcluded((prev) => prev.filter((id) => id !== dateID));
    setError("");
  }

  function setActivity(dateID, value) {
    setActivities((prev) => ({ ...prev, [dateID]: value }));
  }

  function validate() {
    const required = [
      [to, "To"],
      [cc, "CC"],
      [name, "Name"],
      [designation, "Designation"],
      [empCode, "Employee Code"],
      [manager, "Manager Name"],
      [startTime, "Start Time"],
      [leaveTime, "Leaving Time"]
    ];

    for (const [value, label] of required) {
      if (!value.trim()) return `${label} is required`;
    }

    if (mode === "custom") {
      if (!customStart) return "Start date is required";
      if (!customEnd) return "End date is required";
      if (customStart > customEnd) {
        return "Start date must be on or before the end date";
      }
    }

    if (mailDays.length === 0) {
      return mode === "today"
        ? "Today is a weekend or excluded date, no mail will be generated"
        : "No working days found. Add a date range or clear excluded dates.";
    }

    if (sameActivity && mode !== "today") {
      if (!sharedActivity.trim()) return "Activity is required";
    } else {
      for (const d of mailDays) {
        const id = toDateID(d);
        if (!(activities[id] || "").trim()) {
          return `${formatDayDate(d)} activity is required`;
        }
      }
    }

    return null;
  }

  function handleGenerate() {
    const err = validate();
    setError(err || "");
    if (err) return;

    let count = 0;
    for (const d of mailDays) {
      const id = toDateID(d);
      const activity =
        sameActivity && mode !== "today" ? sharedActivity : activities[id] || "";

      const subject = `Status Report of ${d.toLocaleDateString("en-US", { weekday: "long" })} ${formatShortDate(d)}`;

      const body = `Name:- ${name}
Designation:- ${designation}
EMP Code:- ${empCode}
RM Name:- ${manager}
Start Time:- ${startTime}
Leaving Time:- ${leaveTime}

Activities

${activity}`;

      window.open(buildGmailUrl({ to, cc, subject, body }), "_blank");
      store.submitDsr(id, activity);
      count++;
    }

    setToast(
      `Opened ${count} Gmail draft${count !== 1 ? "s" : ""} and saved to history for the timesheet.`
    );
    window.setTimeout(() => setToast(""), 5000);
  }

  const modeDescriptions = {
    today: "Generate a single draft for today.",
    week: "Monday – Friday of the current week.",
    custom: "Pick a start and end date for the report period."
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          {toast}
        </div>
      )}

      <Section icon={Sparkles} title="Select Mode" description={modeDescriptions[mode]}>
        <div className="flex gap-1.5 rounded-2xl border bg-muted/40 p-1.5">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                mode === m.value
                  ? "bg-white text-primary shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Section>

      <Section
        icon={Mail}
        title="Email Configuration"
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setTo(DEFAULTS.to);
              setCc(DEFAULTS.cc);
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset to defaults
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="To">
            <Input value={to} onChange={(e) => setTo(e.target.value)} className="h-11 rounded-xl" />
          </Field>
          <Field label="CC" hint="Comma separated recipients">
            <Input value={cc} onChange={(e) => setCc(e.target.value)} className="h-11 rounded-xl" />
          </Field>
        </div>
      </Section>

      <Section icon={User} title="Employee Details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
          </Field>
          <Field label="Designation">
            <Input value={designation} onChange={(e) => setDesignation(e.target.value)} className="h-11 rounded-xl" />
          </Field>
          <Field label="Employee Code">
            <Input value={empCode} onChange={(e) => setEmpCode(e.target.value)} className="h-11 rounded-xl" />
          </Field>
          <Field label="Manager / RM Name">
            <Input value={manager} onChange={(e) => setManager(e.target.value)} className="h-11 rounded-xl" />
          </Field>
          <Field label="Start Time">
            <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-11 rounded-xl" />
          </Field>
          <Field label="Leaving Time">
            <Input value={leaveTime} onChange={(e) => setLeaveTime(e.target.value)} className="h-11 rounded-xl" />
          </Field>
        </div>
      </Section>

      {mode === "custom" && (
        <Section
          icon={CalendarDays}
          title="Custom Date Range"
          description="Choose the start and end dates of the report period."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start Date">
              <DatePicker value={customStart} onChange={setCustomStart} placeholder="Pick start date" />
            </Field>
            <Field label="End Date">
              <DatePicker value={customEnd} onChange={setCustomEnd} placeholder="Pick end date" />
            </Field>
          </div>
        </Section>
      )}

      {mode !== "today" && (
        <Section
          icon={CalendarX}
          title="Exclude Dates"
          description="Click the dates you want to skip — leaves, holidays, etc."
        >
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card/80 p-2 shadow-sm">
              <Calendar
                mode="multiple"
                selected={excluded.map(fromDateID)}
                onSelect={handleExcludeChange}
                disabled={isWeekend}
                className="mx-auto rounded-xl border"
              />
            </div>

            {excluded.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Excluded:
                </span>
                {excluded.map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="gap-1.5 rounded-lg py-1.5 pl-3 pr-1.5 font-normal"
                  >
                    {formatShortDate(fromDateID(id))}
                    <button
                      type="button"
                      onClick={() => removeExcluded(id)}
                      className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {mode !== "today" && (
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-muted/30 px-4 py-3.5 transition-colors hover:bg-muted/50">
          <Checkbox
            id="sameActivity"
            checked={sameActivity}
            onCheckedChange={(checked) => setSameActivity(!!checked)}
          />
          <span className="text-sm font-medium">
            Use Same Activity For All Days
          </span>
        </label>
      )}

      <Section
        icon={ListChecks}
        title={mode === "today" ? "Activity" : "Daily Activities"}
        description={
          mode === "today"
            ? "Enter the status for today."
            : "Enter the status for each working day."
        }
      >
        {sameActivity && mode !== "today" ? (
          <div className="rounded-2xl border bg-card/80 p-4 shadow-sm">
            <Field label={`Activity for ${mailDays.length} working day${mailDays.length !== 1 ? "s" : ""}`}>
              <Textarea
                value={sharedActivity}
                onChange={(e) => setSharedActivity(e.target.value)}
                placeholder="Enter activity for all days"
                className="min-h-28 rounded-xl"
              />
            </Field>
          </div>
        ) : mailDays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-muted-foreground/30 bg-card/60 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "today"
                ? "Today is a weekend or excluded date, so no mail will be generated."
                : mode === "custom" && (!customStart || !customEnd)
                  ? "Select a start and end date to see the mail days."
                  : "No working days found. Extend the range or clear excluded dates."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {mailDays.map((d) => {
              const id = toDateID(d);
              return (
                <Card key={id} className="rounded-2xl bg-card/80 shadow-sm">
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {formatDayDate(d)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sameActivity ? "Shared activity" : "Status for this day"}
                      </p>
                    </div>
                    <Textarea
                      value={activities[id] || ""}
                      onChange={(e) => setActivity(id, e.target.value)}
                      placeholder="Enter status for this day"
                      className="min-h-28 rounded-xl"
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <Button
        size="lg"
        onClick={handleGenerate}
        className="h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500"
      >
        Generate Gmail Drafts
      </Button>
    </div>
  );
}
