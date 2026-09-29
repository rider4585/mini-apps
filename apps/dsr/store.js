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
  } catch {
    // storage full / unavailable - fail silently, app still works in-memory
  }
}

export const dsrStore = {
  // ------- DSR history -------
  getHistory() {
    return load("history:v1", {});
  },
  submitDsr(dateID, text) {
    const h = load("history:v1", {});
    const t = (text || "").trim();
    if (t) h[dateID] = t;
    else delete h[dateID];
    save("history:v1", h);
  },
  historyForMonth(year, month) {
    const h = load("history:v1", {});
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
    const out = {};
    for (const id of Object.keys(h)) {
      if (id.startsWith(prefix)) out[id] = h[id];
    }
    return out;
  },

  // ------- DSR draft persistence -------
  loadDraft() {
    const d = load("draft:v1", null);
    if (!d) return null;
    if (d.cc && !d.cc.includes("abhishek.gadkari@programming.com")) {
      const oldDefault = "rohit.dudani@programming.com, suraksha.devadiga@programming.com";
      if (d.cc.trim() === oldDefault) {
        d.cc = "rohit.dudani@programming.com, suraksha.devadiga@programming.com, abhishek.gadkari@programming.com";
      } else {
        d.cc = `${d.cc.trim().replace(/,+$/, "")}, abhishek.gadkari@programming.com`;
      }
      save("draft:v1", d);
    }
    return d;
  },
  saveDraft(d) {
    save("draft:v1", d);
  }
};

export const store = dsrStore;
