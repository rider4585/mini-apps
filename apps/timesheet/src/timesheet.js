import XLSX from "xlsx-js-style";

import { toDateID } from "@shared/utils";

const INDIGO = "FF4F46E5";
const INDIGO_LIGHT = "FFEEF2FF";
const SLATE_BORDER = { rgb: "FFCBD5E1" };
const THIN = { style: "thin", color: SLATE_BORDER };
const BORDER = { top: THIN, bottom: THIN, left: THIN, right: THIN };

function cellAddr(row, col) {
  return XLSX.utils.encode_cell({ r: row, c: col });
}

function styleCell(ws, row, col, style) {
  const addr = cellAddr(row, col);
  if (!ws[addr]) ws[addr] = { t: "s", v: "" };
  ws[addr].s = { ...(ws[addr].s || {}), ...style };
}

export function monthShortName(year, month) {
  return new Date(year, month, 1).toLocaleString("en-US", { month: "short" });
}

export function monthLongName(year, month) {
  return new Date(year, month, 1).toLocaleString("en-US", { month: "long" });
}

export function timesheetSubject(year, month) {
  const mm = String(month + 1).padStart(2, "0");
  const yy = String(year).slice(-2);
  return `Timesheet Submission - Siemens - Raviraj Bugge - ${mm}-${yy}`;
}

export function timesheetBody(year, month) {
  return `Please find attached my timesheet for the month of ${monthLongName(year, month)}.

Please let me know if you need any additional information or if there are any issues with the document.

Thank you,

Raviraj Bugge`;
}

export function buildDayRows({
  year,
  month,
  profile,
  history,
  leaves = [],
  customActivities = {}
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const dateID = toDateID(date);
    const isWeekend = dow === 0 || dow === 6;
    const isLeave = leaves.includes(dateID);
    const working = !isWeekend;

    const activityText =
      customActivities[dateID] !== undefined
        ? customActivities[dateID]
        : (history[dateID] || "");

    rows.push({
      date,
      dateID,
      dateStr: `${d}/${month + 1}/${year}`,
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      isWeekend,
      isLeave,
      timeIn: working ? profile.timeIn : "",
      timeOut: working ? profile.timeOut : "",
      workCode: "",
      billable: working ? (isLeave ? "0 hours" : profile.billableDefault) : "",
      nonBillable: "",
      comments: "",
      activities: working && !isLeave ? activityText : ""
    });
  }

  return rows;
}

export function buildTimesheet({ year, month, profile, rows }) {
  const headerPairs = [
    ["Name:", profile.name],
    ["Title/Designation:", profile.title],
    ["Department:", profile.department],
    ["Reporting Head:", profile.reportingHead],
    ["Client:", profile.client],
    ["Project:", profile.project],
    ["Location:", profile.location]
  ];

  const aoa = [[" TimeSheet"]];
  aoa.push([]);
  for (const pair of headerPairs) aoa.push(pair);
  aoa.push([]);
  aoa.push([
    "Date",
    "Day",
    "Time In",
    "Time Out",
    "Work Code",
    "Billable Hours",
    "Non Billable Hours",
    "Comments",
    "Work Activities Done"
  ]);
  for (const r of rows) {
    aoa.push([
      r.dateStr,
      r.day,
      r.timeIn,
      r.timeOut,
      r.workCode,
      r.billable,
      r.nonBillable,
      r.comments,
      r.activities
    ]);
  }
  aoa.push([]);
  aoa.push(["Client Signature:"]);

  const ws = XLSX.utils.aoa_to_sheet(aoa, { cellStyles: true });

  ws["!cols"] = [
    { wch: 11 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 80 }
  ];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

  const firstDataRow = 11;

  // Title
  styleCell(ws, 0, 0, {
    font: { sz: 16, bold: true, color: { rgb: "FF1E293B" } },
    fill: { fgColor: { rgb: INDIGO_LIGHT } },
    alignment: { vertical: "center" }
  });

  // Header label/value rows (rows 2..8)
  for (let r = 2; r <= 8; r++) {
    styleCell(ws, r, 0, { font: { bold: true, color: { rgb: "FF334155" } } });
  }

  // Table header row
  for (let c = 0; c <= 8; c++) {
    styleCell(ws, 10, c, {
      font: { bold: true, color: { rgb: "FFFFFFFF" } },
      fill: { fgColor: { rgb: INDIGO } },
      alignment: { horizontal: "center", vertical: "center" },
      border: BORDER
    });
  }

  // Day rows
  rows.forEach((r, i) => {
    const row = firstDataRow + i;
    const muted = r.isWeekend || r.isLeave;
    for (let col = 0; col <= 8; col++) {
      const style = { border: BORDER };
      if (muted) {
        style.font = { color: { rgb: "FF94A3B8" } };
        style.fill = { fgColor: { rgb: "FFF1F5F9" } };
      }
      styleCell(ws, row, col, style);
    }
    styleCell(ws, row, 8, {
      alignment: { wrapText: true, vertical: "top" }
    });
  });

  // Footer
  const sigRow = 12 + rows.length;
  styleCell(ws, sigRow, 0, {
    font: { bold: true, color: { rgb: "FF334155" } }
  });

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: `Timesheet ${monthLongName(year, month)} ${year}`
  };
  XLSX.utils.book_append_sheet(wb, ws, `${monthShortName(year, month)}${year}`);

  return wb;
}

export function downloadTimesheet({ year, month, profile, rows }) {
  const wb = buildTimesheet({ year, month, profile, rows });
  const filename = `Timesheet ${monthLongName(year, month)} ${year}.xlsx`;
  XLSX.writeFile(wb, filename);
}
