import { useMemo, useState } from "react";
import { DEFAULTS } from "@apps/dsr/config";
import { dsrStore as store } from "@apps/dsr/store";
import { formatShortDate, toDateID } from "@shared/utils";

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

export function buildMailtoUrl({ to, cc, subject, body }) {
  const params = [];
  if (cc) params.push(`cc=${encodeURIComponent(cc)}`);
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) {
    const normalizedBody = body.replace(/\r?\n/g, "\r\n");
    params.push(`body=${encodeURIComponent(normalizedBody)}`);
  }
  const query = params.length > 0 ? `?${params.join("&")}` : "";
  return `mailto:${to}${query}`;
}

export default function WidgetDsrApp() {
  const today = useMemo(() => new Date(), []);
  const todayId = useMemo(() => toDateID(today), [today]);

  const draft = useMemo(() => {
    try {
      return store.loadDraft();
    } catch {
      return null;
    }
  }, []);

  const to = draft?.to ?? DEFAULTS.to;
  const cc = resolveInitialCc(draft?.cc);
  const name = draft?.name ?? DEFAULTS.name;
  const designation = draft?.designation ?? DEFAULTS.designation;
  const empCode = draft?.empCode ?? DEFAULTS.empCode;
  const manager = draft?.manager ?? DEFAULTS.manager;
  const startTime = draft?.startTime ?? DEFAULTS.startTime;
  const leaveTime = draft?.leaveTime ?? DEFAULTS.leaveTime;

  const initialText =
    draft?.activities?.[todayId] ??
    (draft?.sameActivity ? draft?.sharedActivity : "") ??
    draft?.widgetText ??
    "";

  const [text, setText] = useState(initialText);

  const mailtoUrl = useMemo(() => {
    const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = formatShortDate(today);
    const subject = `Status Report of ${weekday} ${formattedDate}`;

    const body = `Name:- ${name}
Designation:- ${designation}
EMP Code:- ${empCode}
RM Name:- ${manager}
Start Time:- ${startTime}
Leaving Time:- ${leaveTime}

Activities

${text}`;

    return buildMailtoUrl({ to, cc, subject, body });
  }, [today, to, cc, name, designation, empCode, manager, startTime, leaveTime, text]);

  function handleChange(e) {
    const nextVal = e.target.value;
    setText(nextVal);
    try {
      const currentDraft = store.loadDraft() || {};
      const updated = {
        ...currentDraft,
        activities: {
          ...(currentDraft.activities || {}),
          [todayId]: nextVal
        },
        sharedActivity: nextVal,
        widgetText: nextVal
      };
      store.saveDraft(updated);
    } catch {
      // storage unavailable
    }
  }

  function handleSendClick() {
    if (text.trim()) {
      try {
        store.submitDsr(todayId, text.trim());
      } catch {
        // storage unavailable
      }
    }
  }

  const dateBadge = today.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background p-2 text-foreground select-none">
      {/* Header */}
      <div className="flex-shrink-0 mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-primary/10 text-primary">
            <svg
              className="h-2 w-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </span>
          <span className="text-[10px] font-bold tracking-tight text-foreground">
            DSR
          </span>
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">
          {dateBadge}
        </span>
      </div>

      {/* Textarea */}
      <div className="relative min-h-0 flex-1">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Enter today's status..."
          className="absolute inset-0 h-full w-full resize-none rounded-lg border border-input bg-card p-1.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        />
      </div>

      {/* Send DSR link */}
      <div className="flex-shrink-0 mt-1">
        <a
          href={mailtoUrl}
          onClick={handleSendClick}
          className="flex h-7 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-[11px] font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.98] no-underline"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span>Send DSR</span>
        </a>
      </div>
    </div>
  );
}
