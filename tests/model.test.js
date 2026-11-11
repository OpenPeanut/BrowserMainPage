import test from "node:test";
import assert from "node:assert/strict";
import {
  readState,
  safeUrl,
  directUrl,
  searchUrl,
  rememberSearch,
} from "../src/model.js";

test("search URLs encode user text and use each engine parameter", () => {
  for (const [engine, parameter] of [
    ["google", "q"],
    ["bing", "q"],
    ["baidu", "wd"],
  ]) {
    const url = new URL(searchUrl(" 中文 & a+b?# ", engine));
    assert.equal(url.searchParams.get(parameter), "中文 & a+b?#");
    assert.equal([...url.searchParams].length, 1);
  }
});
test("bookmarks reject executable schemes and credentials", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///etc/passwd",
    "https://user:password@example.com",
    "bad url",
    "",
  ])
    assert.throws(() => safeUrl(url));
  assert.equal(safeUrl("example.com/path?q=1"), "https://example.com/path?q=1");
});
test("direct navigation distinguishes URLs from search terms", () => {
  assert.equal(
    directUrl("github.com/openpeanut"),
    "https://github.com/openpeanut",
  );
  assert.equal(directUrl("localhost:8080"), "https://localhost:8080/");
  assert.equal(
    directUrl("https://example.com?q=hello"),
    "https://example.com/?q=hello",
  );
  assert.equal(directUrl("hello world"), null);
  assert.equal(directUrl("javascript:alert(1)"), null);
});
test("storage errors and malformed data fall back safely", () => {
  assert.equal(readState(undefined).bookmarks.length, 10);
  assert.equal(
    readState({ getItem: () => "{broken" }).settings.engine,
    "google",
  );
  const state = readState({
    getItem: () =>
      JSON.stringify({
        settings: { engine: "__proto__", theme: "dark", motion: "yes" },
        bookmarks: [
          { id: "x", name: "unsafe", url: "javascript:alert(1)" },
          null,
        ],
        history: [null, 1, "hello"],
      }),
  });
  assert.equal(state.settings.engine, "google");
  assert.equal(state.settings.theme, "cloud");
  assert.deepEqual(state.bookmarks, []);
  assert.deepEqual(state.history, ["hello"]);
});
test("empty bookmarks remain empty and duplicate IDs are removed", () => {
  assert.deepEqual(
    readState({ getItem: () => '{"bookmarks":[]}' }).bookmarks,
    [],
  );
  const bookmark = { id: "a", name: "Example", url: "https://example.com" };
  assert.equal(
    readState({
      getItem: () => JSON.stringify({ bookmarks: [bookmark, bookmark] }),
    }).bookmarks.length,
    1,
  );
});
test("search history is bounded and deduplicated", () => {
  assert.deepEqual(rememberSearch(["a", "b"], "b"), ["b", "a"]);
  assert.equal(
    rememberSearch(
      Array.from({ length: 8 }, (_, i) => String(i)),
      "new",
    ).length,
    8,
  );
});
