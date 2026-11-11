// Baidu's original JSONP endpoint works from static GitHub Pages without a proxy.
// Keep callbacks unique so concurrent or delayed responses cannot overwrite each other.
export function fetchBaiduSuggestions(query, { signal, timeout = 4000 } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const callback = `peanutSuggest_${crypto.randomUUID().replaceAll("-", "")}`;
    const script = document.createElement("script");
    const url = new URL("https://www.baidu.com/sugrec");
    url.search = new URLSearchParams({
      prod: "pc",
      json: "1",
      wd: query,
      cb: callback,
    });
    let settled = false;
    const finish = (error, data) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      script.remove();
      script.onerror = script.onload = null;
      if (error) {
        // A removed script can still finish in flight. Absorb its late callback.
        window[callback] = () => {};
        setTimeout(() => {
          delete window[callback];
        }, 60_000);
        reject(error);
      } else {
        delete window[callback];
        const rows = Array.isArray(data?.g) ? data.g : [];
        resolve(
          [
            ...new Set(
              rows
                .map((item) => item?.q)
                .filter(
                  (text) =>
                    typeof text === "string" &&
                    text.trim() &&
                    text.length <= 2048,
                ),
            ),
          ].slice(0, 8),
        );
      }
    };
    const abort = () => finish(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(
      () => finish(new Error("Suggestion request timed out")),
      timeout,
    );
    window[callback] = (data) => finish(null, data);
    signal?.addEventListener("abort", abort, { once: true });
    script.onerror = () => finish(new Error("Suggestion request failed"));
    script.onload = () => {
      if (!settled) finish(new Error("Missing suggestion callback"));
    };
    script.src = url.href;
    script.async = true;
    script.referrerPolicy = "no-referrer";
    document.head.append(script);
  });
}

export function attachSearchSuggestions({
  input,
  panel,
  area,
  getBookmarks,
  getHistory,
  search,
  navigate,
}) {
  let timer;
  let request;
  let revision = 0;
  let composing = false;
  let remote = [];
  let open = false;
  let status = "";

  input.setAttribute("aria-controls", panel.id);
  input.setAttribute("aria-expanded", "false");

  function cancel() {
    clearTimeout(timer);
    revision += 1;
    request?.abort();
    request = null;
  }

  function hide() {
    cancel();
    open = false;
    panel.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }

  function render() {
    if (!open) return;
    const query = input.value.trim().toLowerCase();
    const links = query
      ? getBookmarks()
          .filter((item) =>
            `${item.name} ${item.url}`.toLowerCase().includes(query),
          )
          .slice(0, 3)
      : [];
    const history = getHistory()
      .filter(
        (item) =>
          (!query || item.toLowerCase().includes(query)) &&
          !remote.includes(item),
      )
      .slice(0, 4);
    const items = [
      ...remote.map((text) => ({ text, detail: "百度联想 ↗" })),
      ...links.map((link) => ({
        text: link.name,
        detail: "打开网站 ↗",
        url: link.url,
      })),
      ...history.map((text) => ({ text, detail: "搜索记录 ↗" })),
    ];
    const selected = panel.contains(document.activeElement)
      ? document.activeElement.dataset.key
      : null;
    panel.replaceChildren();
    panel.hidden = items.length === 0 && !status;
    input.setAttribute("aria-expanded", String(!panel.hidden));
    if (panel.hidden) return;
    panel.append(
      Object.assign(document.createElement("div"), {
        className: "suggestion-label",
        textContent: remote.length
          ? "搜索推荐 · 百度提供"
          : status || "快捷网站与本地搜索记录",
      }),
    );
    for (const item of items) {
      const button = Object.assign(document.createElement("button"), {
        className: "suggestion-item",
        type: "button",
      });
      button.dataset.key = `${item.url || "search"}:${item.text}`;
      button.append(
        Object.assign(document.createElement("span"), {
          textContent: item.text,
        }),
        Object.assign(document.createElement("small"), {
          textContent: item.detail,
        }),
      );
      button.addEventListener("click", () => {
        hide();
        if (item.url) navigate(item.url);
        else {
          input.value = item.text;
          search(item.text);
        }
      });
      panel.append(button);
      if (selected === button.dataset.key)
        button.focus({ preventScroll: true });
    }
    if (selected && !panel.contains(document.activeElement))
      input.focus({ preventScroll: true });
  }

  function refresh() {
    cancel();
    remote = [];
    status = "";
    open = !composing;
    if (composing) {
      hide();
      return;
    }
    const query = input.value.trim();
    if (query) status = "正在获取搜索推荐…";
    render();
    if (!query) return;
    const currentRevision = revision;
    timer = setTimeout(async () => {
      request = new AbortController();
      try {
        const results = await fetchBaiduSuggestions(query, {
          signal: request.signal,
        });
        if (revision !== currentRevision || !open) return;
        remote = results;
        status = results.length ? "" : "暂无搜索推荐，按回车直接搜索";
      } catch (error) {
        if (
          revision !== currentRevision ||
          !open ||
          error.name === "AbortError"
        )
          return;
        status = "搜索推荐暂不可用，按回车仍可搜索";
      }
      render();
    }, 180);
  }

  input.addEventListener("input", (event) => {
    if (!event.isComposing && !composing) refresh();
  });
  input.addEventListener("compositionstart", () => {
    composing = true;
    hide();
  });
  input.addEventListener("compositionend", () => {
    composing = false;
    refresh();
  });
  input.addEventListener("focus", (event) => {
    if (!panel.contains(event.relatedTarget)) refresh();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!area.contains(event.target)) hide();
  });
  area.addEventListener("focusout", (event) => {
    if (!area.contains(event.relatedTarget)) hide();
  });
  area.addEventListener("keydown", (event) => {
    if (event.isComposing || composing) return;
    if (event.key === "Escape") {
      input.focus();
      hide();
      return;
    }
    if (panel.hidden || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const options = [input, ...panel.querySelectorAll("button")];
    const direction = event.key === "ArrowDown" ? 1 : -1;
    options[
      (options.indexOf(document.activeElement) + direction + options.length) %
        options.length
    ].focus();
  });
  return {
    hide,
    get composing() {
      return composing;
    },
  };
}
