import { useState } from "react";

import { fromDateID, isWeekend, toDateID, formatShortDate } from "../utils";

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MultiDatePicker({ selected, onToggle }) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const firstOfMonth = new Date(view.y, view.m, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.y, view.m, d));

  function shift(delta) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <div className="date-picker">
      <div className="dp-header">
        <button type="button" className="dp-nav" onClick={() => shift(-1)} title="Previous month">
          &#8249;
        </button>
        <span className="dp-title">
          {MONTH_NAMES[view.m]} {view.y}
        </span>
        <button type="button" className="dp-nav" onClick={() => shift(1)} title="Next month">
          &#8250;
        </button>
      </div>

      <div className="dp-weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="dp-grid">
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const id = toDateID(date);
          const isSelected = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              disabled={isWeekend(date)}
              className={`dp-day${isSelected ? " selected" : ""}`}
              onClick={() => onToggle(id)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="dp-selected">
          {selected.map((id) => (
            <span key={id} className="chip">
              <span>{formatShortDate(fromDateID(id))}</span>
              <button type="button" className="chip-remove" onClick={() => onToggle(id)}>
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}