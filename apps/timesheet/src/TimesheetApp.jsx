import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Info,
  Mail,
  User
} from "lucide-react";

import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { cn } from "@shared/lib/utils";
import { buildGmailUrl, toDateID } from "@shared/utils";

import { TIMESHEET_EMAIL, TIMESHEET_PROFILE_DEFAULTS } from "../config";
import { timesheetStore as store } from "../store";
import {
  buildDayRows,
  downloadTimesheet,
  monthLongName,
  timesheetBody,
  timesheetSubject
} from "./timesheet";

function Field({ label, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function TimesheetApp() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [profile, setProfile] = useState(
    store.loadProfile() || TIMESHEET_PROFILE_DEFAULTS
  );
  const [tsState, setTsState] = useState(store.getTsState());
  const [toast, setToast] = useState("");

  const monthKey = store.tsMonthKey(year, month);
  const monthData = tsState[monthKey] || {};
  const leaves = useMemo(
    () => monthData.leaves || [],
    [monthData]
  );
  const customActivities = useMemo(
    () => monthData.activities || {},
    [monthData]
  );

  const history = useMemo(() => store.historyForMonth(year, month), [year, month]);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const t = setTimeout(() => store.saveProfile(profile), 400);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    const t = setTimeout(() => store.setTsState(tsState), 400);
    return () => clearTimeout(t);
  });

  function shift(delta) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function toggleLeave(dateID) {
    setTsState((prev) => {
      const cur = prev[monthKey]?.leaves || [];
      const next = cur.includes(dateID)
        ? cur.filter((id) => id !== dateID)
        : [...cur, dateID];
      return { ...prev, [monthKey]: { ...prev[monthKey], leaves: next } };
    });
  }

  function setProfileField(key, value) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleActivityChange(dateID, value) {
    setTsState((prev) => {
      const cur = prev[monthKey] || {};
      const curActs = cur.activities || {};
      return {
        ...prev,
        [monthKey]: {
          ...cur,
          activities: {
            ...curActs,
            [dateID]: value
          }
        }
      };
    });
  }

  function handleRevertSingleActivity(dateID) {
    setTsState((prev) => {
      const cur = prev[monthKey] || {};
      const prevActs = { ...(cur.activities || {}) };
      delete prevActs[dateID];
      return {
        ...prev,
        [monthKey]: {
          ...cur,
          activities: prevActs
        }
      };
    });
  }

  function handleResetMonthActivities() {
    setTsState((prev) => {
      const cur = prev[monthKey] || {};
      const { activities: _, ...rest } = cur;
      return {
        ...prev,
        [monthKey]: rest
      };
    });
  }

  const rows = useMemo(
    () => buildDayRows({ year, month, profile, history, leaves, customActivities }),
    [year, month, profile, history, leaves, customActivities]
  );

  const submittedCount = Object.keys(history).length;

  function handleDownload() {
    downloadTimesheet({ year, month, profile, rows });
    setToast(
      `Downloaded "Timesheet ${monthLongName(year, month)} ${year}.xlsx". Attach it to the Gmail draft after opening it.`
    );
    window.setTimeout(() => setToast(""), 6000);
  }

  function handleOpenGmail() {
    const url = buildGmailUrl({
      to: TIMESHEET_EMAIL.to,
      cc: TIMESHEET_EMAIL.cc,
      subject: timesheetSubject(year, month),
      body: timesheetBody(year, month)
    });
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
          {toast}
        </div>
      )}

      {/* Month selector */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-md shadow-indigo-500/25">
              <CalendarRange className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold leading-tight text-foreground">
                {monthLongName(year, month)} {year}
              </p>
              <p className="text-sm text-muted-foreground">
                {daysInMonth} days · {submittedCount} DSR
                {submittedCount !== 1 ? "s" : ""} recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => shift(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="month"
              value={`${year}-${String(month + 1).padStart(2, "0")}`}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m] = e.target.value.split("-").map(Number);
                  setYear(y);
                  setMonth(m - 1);
                }
              }}
              className="h-9 w-40"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => shift(1)}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Gmail draft windows opened from this app cannot attach files.
            Download the .xlsx below and attach it to the draft before sending.
          </span>
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Timesheet Details
              </h2>
              <p className="text-sm text-muted-foreground">
                Used in the header section and day rows of the Excel export.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name">
              <Input value={profile.name} onChange={(e) => setProfileField("name", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Title / Designation">
              <Input value={profile.title} onChange={(e) => setProfileField("title", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Department">
              <Input value={profile.department} onChange={(e) => setProfileField("department", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Reporting Head">
              <Input value={profile.reportingHead} onChange={(e) => setProfileField("reportingHead", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Client">
              <Input value={profile.client} onChange={(e) => setProfileField("client", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Project">
              <Input value={profile.project} onChange={(e) => setProfileField("project", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Location" className="sm:col-span-2 lg:col-span-3">
              <Input value={profile.location} onChange={(e) => setProfileField("location", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Time In">
              <Input value={profile.timeIn} onChange={(e) => setProfileField("timeIn", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Time Out">
              <Input value={profile.timeOut} onChange={(e) => setProfileField("timeOut", e.target.value)} className="h-10 rounded-lg" />
            </Field>
            <Field label="Billable Hours (default)">
              <Input value={profile.billableDefault} onChange={(e) => setProfileField("billableDefault", e.target.value)} className="h-10 rounded-lg" />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Day rows / leave management */}
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Monthly Day Rows
                </h2>
                <p className="text-sm text-muted-foreground">
                  Toggle “Leave” to bill 0 hours. Work activities pull from DSR history and are editable below.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {Object.keys(customActivities).length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetMonthActivities}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  title="Revert all manually edited activities for this month back to DSR history"
                >
                  Reset all to DSR
                </Button>
              )}
              <Badge variant="secondary">
                {leaves.length} leave{leaves.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 font-semibold">Day</th>
                  <th className="px-3 py-2.5 font-semibold">Time In</th>
                  <th className="px-3 py-2.5 font-semibold">Time Out</th>
                  <th className="px-3 py-2.5 font-semibold">Billable</th>
                  <th className="px-3 py-2.5 font-semibold">Leave</th>
                  <th className="min-w-[340px] px-3 py-2.5 font-semibold">Activities (editable)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isCustomized =
                    customActivities[r.dateID] !== undefined &&
                    history[r.dateID] !== undefined &&
                    customActivities[r.dateID] !== history[r.dateID];

                  return (
                    <tr
                      key={r.dateID}
                      className={cn(
                        "border-t",
                        r.isWeekend || r.isLeave ? "bg-muted/30" : ""
                      )}
                    >
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                        {format(r.date, "dd/MM/yyyy")}
                      </td>
                      <td className="px-3 py-2">{r.day}</td>
                      <td className="whitespace-nowrap px-3 py-2">{r.timeIn || "–"}</td>
                      <td className="whitespace-nowrap px-3 py-2">{r.timeOut || "–"}</td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                        {r.billable || "–"}
                      </td>
                      <td className="px-3 py-2">
                        {r.isWeekend ? (
                          <span className="text-xs text-muted-foreground">Off</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleLeave(r.dateID)}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                              r.isLeave
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground hover:bg-muted/70"
                            )}
                          >
                            {r.isLeave ? "Leave" : "Working"}
                          </button>
                        )}
                      </td>
                      <td className="min-w-[340px] px-3 py-2">
                        {r.isWeekend ? (
                          <span className="text-xs text-muted-foreground">–</span>
                        ) : r.isLeave ? (
                          <span className="text-xs italic text-muted-foreground">On leave (0 hrs)</span>
                        ) : (
                          <div className="space-y-1">
                            <textarea
                              rows={1}
                              value={r.activities}
                              onChange={(e) => handleActivityChange(r.dateID, e.target.value)}
                              placeholder="No DSR recorded — type activity here..."
                              className="w-full min-h-[34px] resize-y rounded-lg border border-input bg-background/80 px-2.5 py-1.5 text-xs leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            {isCustomized && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                  Manually modified
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRevertSingleActivity(r.dateID)}
                                  className="text-muted-foreground underline transition-colors hover:text-foreground"
                                >
                                  Revert to DSR
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          onClick={handleDownload}
          className="h-14 rounded-2xl from-slate-800 to-slate-950 text-base font-semibold shadow-lg shadow-slate-500/20 transition-all hover:from-slate-700 hover:to-slate-900"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Timesheet (.xlsx)
        </Button>
        <Button
          size="lg"
          onClick={handleOpenGmail}
          variant="outline"
          className="h-14 rounded-2xl border-primary/30 text-base font-semibold text-primary hover:bg-primary/5"
        >
          <Mail className="mr-2 h-5 w-5" />
          Open Gmail Draft
        </Button>
      </div>
    </div>
  );
}
