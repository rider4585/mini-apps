const NS = "dsr-mg:";

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {}
}

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const pad = (n) => String(n).padStart(2, "0");

function localKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseKey(k) {
  const [date, time] = k.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function at1800(d) {
  const x = new Date(d);
  x.setHours(18, 0, 0, 0);
  return x;
}

export function nextFriday18(date = new Date()) {
  const ref = at1800(date);
  const add = (5 - ref.getDay() + 7) % 7;
  const f = new Date(ref);
  f.setDate(ref.getDate() + add);
  if (f <= date) f.setDate(f.getDate() + 7);
  return f;
}

export function nextMonth2nd18(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), 2, 18, 0, 0, 0);
  if (d <= date) d.setMonth(d.getMonth() + 1);
  return d;
}

export function requestNotificationPermission() {
  if (!("Notification" in window)) return Promise.resolve("unsupported");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  return Notification.permission === "default"
    ? Notification.requestPermission()
    : Promise.resolve(Notification.permission);
}

export function showNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/icons/icon-192.png",
        tag: title
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function getSchedule() {
  return load("schedule:v1", {
    dsr: null,
    timesheet: null,
    notifiedDsr: null,
    notifiedTimesheet: null
  });
}

export function setSchedule(s) {
  save("schedule:v1", s);
}

export function ensureSchedule() {
  const now = new Date();
  const s = getSchedule();
  const pending = (t) => t && now - t < DAY;

  const fix = (existing, compute) => {
    const parsed = existing ? parseKey(existing) : null;
    return parsed && pending(parsed) ? existing : localKey(compute(now));
  };

  const next = {
    ...s,
    dsr: fix(s.dsr, nextFriday18),
    timesheet: fix(s.timesheet, nextMonth2nd18)
  };
  setSchedule(next);
  return next;
}

export function evaluateReminders() {
  const now = new Date();
  const fired = [];
  const s = getSchedule();
  if (!s) return fired;

  const check = (type, notifiedKey, title, body) => {
    if (!s[type]) return;
    const t = parseKey(s[type]);
    if (now >= t && now - t < DAY && s[notifiedKey] !== s[type]) {
      const shown = showNotification(title, body);
      fired.push({ type, title, shown });

      let cur = getSchedule();
      setSchedule({ ...cur, [notifiedKey]: s[type] });

      const advance =
        type === "dsr"
          ? new Date(t.getTime() + 7 * DAY)
          : nextMonth2nd18(t);

      cur = getSchedule();
      setSchedule({ ...cur, [type]: localKey(advance) });
    }
  };

  check(
    "dsr",
    "notifiedDsr",
    "DSR Reminder",
    "It's Friday 6:00 PM — time to send your daily status report."
  );
  check(
    "timesheet",
    "notifiedTimesheet",
    "Timesheet Reminder",
    "It's the 2nd of the month — submit your timesheet to accounts@mobileprogramming.com."
  );

  return fired;
}

export function reminderState() {
  const s = ensureSchedule();
  return {
    permission:
      "Notification" in window ? Notification.permission : "unsupported",
    dsr: s.dsr ? parseKey(s.dsr) : null,
    timesheet: s.timesheet ? parseKey(s.timesheet) : null
  };
}

function icsFloating(d) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T180000`;
}

function icsStamp(now) {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "") + "Z";
}

export function buildIcs() {
  const now = new Date();
  const stamp = icsStamp(now);
  const uid = `dsr-${Date.now()}`;
  const friday = nextFriday18(now);
  const month2nd = nextMonth2nd18(now);
  const fridayEnd = new Date(friday.getTime() + HOUR);
  const month2ndEnd = new Date(month2nd.getTime() + HOUR);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DSR Mail Generator//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}-dsr`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsFloating(friday)}`,
    `DTEND:${icsFloating(fridayEnd)}`,
    "SUMMARY:DSR Reminder - send daily status report",
    "DESCRIPTION:Every Friday 6:00 PM reminder to send your daily status report.",
    "RRULE:FREQ=WEEKLY;BYDAY=FR",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:DSR Reminder - send your daily status report",
    "TRIGGER;RELATED=START:P0S",
    "END:VALARM",
    "END:VEVENT",
    "BEGIN:VEVENT",
    `UID:${uid}-timesheet`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsFloating(month2nd)}`,
    `DTEND:${icsFloating(month2ndEnd)}`,
    "SUMMARY:Timesheet submission - submit timesheet to accounts@mobileprogramming.com",
    "DESCRIPTION:Every 2nd of the month 6:00 PM reminder to submit the timesheet.",
    "RRULE:FREQ=MONTHLY;BYMONTHDAY=2",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Timesheet submission reminder",
    "TRIGGER;RELATED=START:P0S",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.join("\r\n") + "\r\n";
}

export function downloadIcs() {
  const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dsr-mail-reminders.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
