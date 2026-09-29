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
    // storage full / unavailable
  }
}

export const timesheetStore = {
  loadProfile() {
    return load("profile:v1", null);
  },
  saveProfile(p) {
    save("profile:v1", p);
  },
  getTsState() {
    return load("ts:v1", {});
  },
  setTsState(s) {
    save("ts:v1", s);
  },
  tsMonthKey(year, month) {
    return `${year}-${String(month + 1).padStart(2, "0")}`;
  },
  historyForMonth(year, month) {
    const h = load("history:v1", {});
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
    const out = {};
    for (const id of Object.keys(h)) {
      if (id.startsWith(prefix)) out[id] = h[id];
    }
    return out;
  }
};

export const store = timesheetStore;
