import { ENGINES, ICONS } from "./data.js";
import {
  readState,
  safeUrl,
  directUrl,
  searchUrl,
  rememberSearch,
  STORAGE_KEY,
} from "./model.js";
import { attachSearchSuggestions } from "./suggestions.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let storage;
try {
  storage = window.localStorage;
} catch {
  /* Storage may be disabled by browser policy. */
}
const state = readState(storage);
let editing = false;
let toastTimer;
const input = $("#search-input");
const suggestions = $("#suggestions");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function svg(name) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  element.setAttribute("viewBox", "0 0 24 24");
  element.setAttribute("aria-hidden", "true");
  element.innerHTML = Object.hasOwn(ICONS, name) ? ICONS[name] : "";
  return element;
}
$$("[data-icon]").forEach((element) =>
  element.append(svg(element.dataset.icon)),
);

function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2800);
}

function persist(message) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (message) toast(message);
  } catch {
    toast("浏览器暂不允许保存，当前页面仍可正常使用");
  }
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  $("#clock").replaceChildren(
    document.createTextNode(hours),
    Object.assign(document.createElement("span"), { textContent: ":" }),
    document.createTextNode(minutes),
  );
  $("#clock").dateTime = `${hours}:${minutes}`;
  $("#clock").setAttribute("aria-label", `当前时间 ${hours}:${minutes}`);
  const hour = now.getHours();
  const greeting =
    hour < 6
      ? "夜深了，记得好好休息。"
      : hour < 11
        ? "早上好，今天也有新的可能。"
        : hour < 14
          ? "中午好，给自己一点闲暇。"
          : hour < 18
            ? "下午好，让灵感慢慢发生。"
            : "晚上好，把时间留给喜欢的事。";
  $("#greeting").textContent = state.settings.name
    ? `${state.settings.name}，${greeting}`
    : greeting;
  $("#date-line").textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);
  $("#short-date").textContent = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(now)
    .toUpperCase();
}

function applySettings() {
  const { engine, theme, motion, newTab } = state.settings;
  document.body.dataset.theme = theme;
  document.body.classList.toggle("motion-off", !motion);
  $$("[data-engine]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.engine === engine),
    ),
  );
  const form = $("#search-form");
  form.action = ENGINES[engine].action;
  form.target = newTab ? "_blank" : "_self";
  form.rel = "noopener noreferrer";
  input.name = ENGINES[engine].parameter;
  input.setAttribute(
    "aria-label",
    `使用 ${ENGINES[engine].name} 搜索或输入网址`,
  );
  const button = $("#motion-button");
  const active = motion && !reducedMotion.matches;
  button.replaceChildren(
    Object.assign(document.createElement("span"), { className: "live-dot" }),
    document.createTextNode(
      reducedMotion.matches
        ? "跟随系统 · 静止"
        : motion
          ? "流光已开启"
          : "流光已暂停",
    ),
  );
  button.setAttribute("aria-pressed", String(active));
  updateClock();
  renderBookmarks();
}

function renderBookmarks() {
  const grid = $("#bookmark-grid");
  grid.replaceChildren();
  grid.classList.toggle("editing", editing);
  $("#bookmark-count").textContent = state.bookmarks.length;
  $("#edit-button").textContent = editing ? "完成" : "整理";
  $("#edit-button").setAttribute("aria-pressed", String(editing));
  for (const [index, bookmark] of state.bookmarks.entries()) {
    const card = document.createElement(editing ? "button" : "a");
    card.className = "bookmark-card";
    card.style.setProperty("--index", index);
    if (editing) {
      card.type = "button";
      card.setAttribute("aria-label", `编辑 ${bookmark.name}`);
      card.addEventListener("click", () => openBookmark(bookmark));
    } else {
      card.href = bookmark.url;
      card.target = state.settings.newTab ? "_blank" : "_self";
      card.rel = "noopener noreferrer";
    }
    const colors = [
      "graphite",
      "pink",
      "blue",
      "orange",
      "amber",
      "mint",
      "violet",
      "green",
      "cyan",
      "slate",
    ];
    const icon = Object.assign(document.createElement("span"), {
      className: `bookmark-icon ${colors.includes(bookmark.color) ? bookmark.color : "blue"}`,
    });
    if (Object.hasOwn(ICONS, bookmark.icon)) icon.append(svg(bookmark.icon));
    else icon.textContent = [...bookmark.name][0];
    const name = Object.assign(document.createElement("span"), {
      className: "bookmark-name",
      textContent: bookmark.name,
    });
    const description = Object.assign(document.createElement("span"), {
      className: "bookmark-description",
      textContent: bookmark.description || new URL(bookmark.url).hostname,
    });
    const arrow = Object.assign(document.createElement("span"), {
      className: "bookmark-arrow",
      textContent: editing ? "编辑" : "↗",
    });
    arrow.setAttribute("aria-hidden", "true");
    card.append(icon, name, description, arrow);
    card.addEventListener("pointermove", (event) => {
      if (
        !state.settings.motion ||
        reducedMotion.matches ||
        event.pointerType === "touch"
      )
        return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--y", `${event.clientY - bounds.top}px`);
    });
    grid.append(card);
  }
  if (!state.bookmarks.length)
    grid.append(
      Object.assign(document.createElement("p"), {
        className: "empty-state",
        textContent: "留一点空白，或点右上角 + 添加喜欢的网站。",
      }),
    );
}

function navigate(url) {
  if (state.settings.newTab) {
    // A native anchor preserves standard browser navigation and popup behavior.
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } else window.location.assign(url);
}

function submitSearch(query) {
  const text = query.trim();
  if (!text) {
    input.focus();
    return;
  }
  const destination = directUrl(text);
  if (!destination) {
    state.history = rememberSearch(state.history, text);
    persist();
  }
  autocomplete.hide();
  navigate(destination || searchUrl(text, state.settings.engine));
}

const autocomplete = attachSearchSuggestions({
  input,
  panel: suggestions,
  area: $(".search-area"),
  getBookmarks: () => state.bookmarks,
  getHistory: () => state.history,
  search: submitSearch,
  navigate,
});
$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!autocomplete.composing) submitSearch(input.value);
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.target.closest("input, textarea, [contenteditable], dialog")
  ) {
    event.preventDefault();
    input.focus();
  }
});
$$("[data-engine]").forEach((button) =>
  button.addEventListener("click", () => {
    state.settings.engine = button.dataset.engine;
    applySettings();
    persist();
  }),
);

$("#settings-button").addEventListener("click", () => {
  $("#display-name").value = state.settings.name;
  $(`input[name="theme"][value="${state.settings.theme}"]`).checked = true;
  $("#motion-setting").checked = state.settings.motion;
  $("#new-tab-setting").checked = state.settings.newTab;
  $("#settings-dialog").showModal();
});
$("#settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  Object.assign(state.settings, {
    name: $("#display-name").value.trim(),
    theme: $('input[name="theme"]:checked').value,
    motion: $("#motion-setting").checked,
    newTab: $("#new-tab-setting").checked,
  });
  applySettings();
  persist("已保存，首页有了你的样子");
  $("#settings-dialog").close();
});
$$(".close-dialog").forEach((button) =>
  button.addEventListener("click", () => button.closest("dialog").close()),
);
$$("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      dialog.close();
  }),
);

function openBookmark(bookmark) {
  $("#bookmark-form").reset();
  $("#bookmark-error").textContent = "";
  $("#bookmark-id").value = bookmark?.id || "";
  $("#bookmark-name").value = bookmark?.name || "";
  $("#bookmark-url").value = bookmark?.url || "";
  $("#bookmark-dialog-title").textContent = bookmark
    ? "编辑常去的地方"
    : "添加常去的地方";
  $("#delete-bookmark").hidden = !bookmark;
  $("#bookmark-dialog").showModal();
}
$("#add-button").addEventListener("click", () => openBookmark());
$("#edit-button").addEventListener("click", () => {
  editing = !editing;
  renderBookmarks();
});
$("#bookmark-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#bookmark-name").value.trim();
  if (!name) {
    $("#bookmark-error").textContent = "给这个网站起个名字吧";
    return;
  }
  let url;
  try {
    url = safeUrl($("#bookmark-url").value);
  } catch {
    $("#bookmark-error").textContent = "请输入有效的 HTTP 或 HTTPS 网址";
    return;
  }
  const id = $("#bookmark-id").value;
  const existing = state.bookmarks.find((item) => item.id === id);
  if (existing) Object.assign(existing, { name, url });
  else {
    if (state.bookmarks.length >= 100) {
      $("#bookmark-error").textContent = "最多可以保存 100 个快捷网站";
      return;
    }
    state.bookmarks.push({
      id: crypto.randomUUID(),
      name,
      url,
      description: "",
      color: "blue",
      icon: "",
    });
  }
  persist("网站已保存");
  renderBookmarks();
  $("#bookmark-dialog").close();
});
$("#delete-bookmark").addEventListener("click", () => {
  state.bookmarks = state.bookmarks.filter(
    (item) => item.id !== $("#bookmark-id").value,
  );
  persist("网站已移除");
  renderBookmarks();
  $("#bookmark-dialog").close();
});
$("#motion-button").addEventListener("click", () => {
  state.settings.motion = !state.settings.motion;
  applySettings();
  persist();
});
$("#focus-button").addEventListener("click", () => {
  const active = document.body.classList.toggle("focus-mode");
  $("#focus-button").setAttribute("aria-pressed", String(active));
  $("#focus-button").replaceChildren(
    svg("focus"),
    document.createTextNode(active ? "回到日常" : "专注一下"),
  );
});
reducedMotion.addEventListener("change", applySettings);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateClock();
});
setInterval(() => {
  if (!document.hidden) updateClock();
}, 1000);
applySettings();
