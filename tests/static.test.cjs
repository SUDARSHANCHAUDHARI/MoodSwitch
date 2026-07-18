const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
const css = fs.readFileSync(path.join(projectRoot, "style.css"), "utf8");
const script = fs.readFileSync(path.join(projectRoot, "script.js"), "utf8");

test("required production files exist", () => {
  const files = [
    "index.html",
    "style.css",
    "script.js",
    "favicon.svg",
    "README.md",
    "AGENTS.md",
    ".gitignore",
  ];

  files.forEach((file) => assert.ok(fs.existsSync(path.join(projectRoot, file)), `${file} is missing`));
});

test("DOM IDs are unique and all accessibility references resolve", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const ariaReferences = [...html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)]
    .flatMap((match) => match[1].split(/\s+/));
  const missingReferences = ariaReferences.filter((id) => !ids.includes(id));

  assert.deepEqual(duplicates, []);
  assert.deepEqual(missingReferences, []);
});

test("JavaScript element references resolve to real DOM IDs", () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const scriptIds = [...script.matchAll(/querySelector\("#([^"]+)"\)/g)].map((match) => match[1]);

  assert.deepEqual(scriptIds.filter((id) => !ids.has(id)), []);
});

test("all effect presentation hooks and reduced-motion support exist", () => {
  const visualHooks = [
    "effect-red",
    "effect-disco",
    "effect-table-lamp",
    "effect-moonlight",
    "effect-flicker",
    "effect-everything",
    "effect-ghost",
    "effect-fish",
    "effect-normal",
    "is-relocated",
    "is-upside-down",
  ];

  visualHooks.forEach((hook) => assert.match(css, new RegExp(`\\.${hook}\\b`)));
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("the static app has no remote runtime assets or unsafe HTML execution", () => {
  assert.doesNotMatch(html, /\b(?:src|href)="https?:/i);
  assert.doesNotMatch(script, /\b(?:innerHTML|eval)\b/);
  assert.match(html, /rel="icon" href="favicon\.svg"/);
});

test("CSS braces remain balanced", () => {
  const balance = [...css].reduce(
    (count, character) => count + (character === "{" ? 1 : character === "}" ? -1 : 0),
    0,
  );

  assert.equal(balance, 0);
});
