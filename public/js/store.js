const state = {
  tab: "tab-intel",
  country: null,
  iso2: "",
  currency: "USD"
};

const subscribers = new Map();

export const store = {
  get(key) {
    return state[key];
  },
  set(key, value) {
    if (Object.is(state[key], value)) return;
    state[key] = value;
    for (const fn of subscribers.get(key) || []) {
      try {
        fn(value);
      } catch (err) {
        console.warn("[store] subscriber error:", err);
      }
    }
  },
  on(key, fn) {
    if (!subscribers.has(key)) subscribers.set(key, []);
    subscribers.get(key).push(fn);
    return () => {
      subscribers.set(key, (subscribers.get(key) || []).filter((f) => f !== fn));
    };
  }
};

window.store = store;
