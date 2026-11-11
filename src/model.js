import { DEFAULT_SETTINGS, DEFAULT_BOOKMARKS, ENGINES } from "./data.js";

export const STORAGE_KEY = "peanut-start:v1";

export function workCountdown(now = new Date()) {
  const target = new Date(now);
  target.setHours(20, 30, 0, 0);
  const totalMinutes = Math.max(0, Math.ceil((target - now) / 60_000));
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

export function safeUrl(value) {
  const text = String(value).trim();
  if (!text || /\s/.test(text)) throw new Error("请输入有效的网址");
  const hostWithPort = /^[\w.-]+:\d+(?:[/?#]|$)/.test(text);
  const url = new URL(
    !hostWithPort && /^[a-z][a-z\d+.-]*:/i.test(text)
      ? text
      : `https://${text}`,
  );
  if (
    !["https:", "http:"].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new Error("仅支持不带登录信息的 HTTP 或 HTTPS 网址");
  }
  return url.href;
}

export function directUrl(value) {
  const text = value.trim();
  if (
    !/^(https?:\/\/|localhost(?=[:/]|$)|(?:[\w-]+\.)+[a-z]{2,}(?=[:/?#]|$)|(?:\d{1,3}\.){3}\d{1,3}(?=[:/]|$))/i.test(
      text,
    )
  )
    return null;
  try {
    return safeUrl(text);
  } catch {
    return null;
  }
}

export function searchUrl(query, engine) {
  const config = ENGINES[engine] || ENGINES.google;
  const url = new URL(config.action);
  url.searchParams.set(config.parameter, query.trim());
  return url.href;
}

export function initialState() {
  return {
    settings: { ...DEFAULT_SETTINGS },
    bookmarks: DEFAULT_BOOKMARKS.map((item) => ({ ...item })),
    history: [],
  };
}

export function readState(storage) {
  const state = initialState();
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return state;
    const settings = saved.settings || {};
    for (const key of ["motion", "newTab"])
      if (typeof settings[key] === "boolean")
        state.settings[key] = settings[key];
    if (Object.hasOwn(ENGINES, settings.engine))
      state.settings.engine = settings.engine;
    if (["cloud", "mint", "peach"].includes(settings.theme))
      state.settings.theme = settings.theme;
    if (typeof settings.name === "string")
      state.settings.name = settings.name.slice(0, 24);
    if (Array.isArray(saved.bookmarks)) {
      const ids = new Set();
      state.bookmarks = saved.bookmarks
        .filter((item) => {
          try {
            if (
              !item ||
              typeof item.id !== "string" ||
              !item.id ||
              ids.has(item.id) ||
              typeof item.name !== "string" ||
              !item.name.trim() ||
              typeof item.url !== "string"
            )
              return false;
            safeUrl(item.url);
            ids.add(item.id);
            return true;
          } catch {
            return false;
          }
        })
        .slice(0, 100)
        .map((item) => ({
          id: item.id,
          name: item.name.slice(0, 30),
          url: safeUrl(item.url),
          icon: typeof item.icon === "string" ? item.icon : "",
          color: typeof item.color === "string" ? item.color : "blue",
          description:
            typeof item.description === "string"
              ? item.description.slice(0, 60)
              : "",
        }));
    }
    if (Array.isArray(saved.history))
      state.history = saved.history
        .filter((item) => typeof item === "string")
        .slice(0, 8)
        .map((item) => item.slice(0, 2048));
  } catch {
    /* Unavailable or malformed browser storage falls back to usable defaults. */
  }
  return state;
}

export function rememberSearch(history, query) {
  return [query, ...history.filter((item) => item !== query)].slice(0, 8);
}
