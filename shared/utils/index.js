export function toDateID(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateID(id) {
  const [y, m, d] = id.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function formatShortDate(date) {
  const dayNum = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${dayNum}-${month}-${year}`;
}

export function formatDayDate(date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return `${weekday}, ${formatShortDate(date)}`;
}

export function getCurrentWeekDays(today = new Date()) {
  const monday = addDays(today, -today.getDay() + 1);
  const days = [];
  for (let i = 0; i < 5; i++) {
    days.push(addDays(monday, i));
  }
  return days;
}

export function getDateRange(startDate, endDate) {
  const dates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

export function buildGmailUrl({ to, cc, subject, body }) {
  return (
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(to)}` +
    `&cc=${encodeURIComponent(cc)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}