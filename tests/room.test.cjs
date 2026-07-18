const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const scriptSource = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

class MockClassList {
  constructor(owner) {
    this.owner = owner;
    this.values = new Set();
  }

  add(...names) {
    names.forEach((name) => {
      this.values.add(name);
      this.owner.classHistory.push({ action: "add", name });
    });
  }

  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }

  toggle(name, force) {
    const enabled = force === undefined ? !this.values.has(name) : force;
    enabled ? this.add(name) : this.remove(name);
    return enabled;
  }

  contains(name) {
    return this.values.has(name);
  }
}

class MockElement {
  constructor(id) {
    this.id = id;
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.classHistory = [];
    this.classList = new MockClassList(this);
    this.disabled = false;
    this.textContent = "";
    this.value = 0;
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  focus() {}
}

const elementIds = [
  "room-frame",
  "room-transform",
  "wall-switch",
  "state-label",
  "effect-name",
  "effect-detail",
  "attempt-count",
  "attempt-progress",
  "cycle-label",
  "sound-toggle",
  "sound-label",
  "reset-button",
];

function createRuntime(randomValues = []) {
  const elements = Object.fromEntries(elementIds.map((id) => [id, new MockElement(id)]));
  const documentListeners = {};
  const timers = new Map();
  const timerHistory = [];
  let nextTimerId = 1;
  let randomIndex = 0;

  const document = {
    hidden: false,
    activeElement: null,
    querySelector(selector) {
      return elements[selector.slice(1)];
    },
    addEventListener(type, listener) {
      documentListeners[type] = listener;
    },
  };

  const window = {
    setTimeout(callback, delay) {
      const id = nextTimerId++;
      timerHistory.push(delay);
      const handle = setTimeout(() => {
        timers.delete(id);
        callback();
      }, 0);
      timers.set(id, handle);
      return id;
    },
    clearTimeout(id) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    },
  };

  const deterministicMath = Object.create(Math);
  deterministicMath.random = () => randomValues[randomIndex++] ?? 0.5;

  const context = vm.createContext({
    Array,
    console,
    document,
    Math: deterministicMath,
    Object,
    Promise,
    Set,
    String,
    window,
  });

  vm.runInContext(scriptSource, context, { filename: "script.js" });

  return {
    elements,
    timers,
    timerHistory,
    operate: elements["wall-switch"].listeners.click,
    reset: elements["reset-button"].listeners.click,
  };
}

test("an active transition rejects re-entry and recovers to idle", async () => {
  const runtime = createRuntime([0.5, 0.5]);
  const firstRun = runtime.operate();

  await runtime.operate();
  assert.equal(runtime.elements["attempt-count"].textContent, "01");
  assert.equal(runtime.elements["wall-switch"].disabled, true);

  await firstRun;
  assert.equal(runtime.elements["room-frame"].dataset.state, "idle");
  assert.equal(runtime.elements["wall-switch"].disabled, false);
});

test("all ten failure outcomes are reachable", async () => {
  const expectedClasses = [
    "effect-red",
    "effect-disco",
    "effect-table-lamp",
    "effect-moonlight",
    "effect-flicker",
    "effect-everything",
    "effect-moved",
    "effect-ghost",
    "effect-upside",
    "effect-fish",
  ];

  for (const [index, expectedClass] of expectedClasses.entries()) {
    const runtime = createRuntime([0.5, (index + 0.01) / expectedClasses.length]);
    await runtime.operate();
    assert.ok(
      runtime.elements["room-frame"].classHistory.some((entry) => entry.name === expectedClass),
      `${expectedClass} was not selected`,
    );
  }
});

test("the rare normal-light outcome remains reachable", async () => {
  const runtime = createRuntime([0.01]);
  await runtime.operate();

  assert.ok(
    runtime.elements["room-frame"].classHistory.some((entry) => entry.name === "effect-normal"),
  );
});

test("the tenth attempt guarantees exactly three seconds of normal light", async () => {
  const runtime = createRuntime();

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    await runtime.operate();
  }

  assert.equal(runtime.elements["attempt-count"].textContent, "10");
  assert.equal(runtime.elements["attempt-progress"].value, 0);
  assert.ok(runtime.timerHistory.includes(3000));
  assert.equal(
    runtime.elements["room-frame"].classHistory.filter((entry) => entry.name === "effect-normal").length,
    1,
  );
});

test("reset cancels pending work and clears room state", () => {
  const runtime = createRuntime();
  void runtime.operate();

  runtime.reset();

  assert.equal(runtime.timers.size, 0);
  assert.equal(runtime.elements["attempt-count"].textContent, "00");
  assert.equal(runtime.elements["room-frame"].dataset.state, "idle");
  assert.equal(runtime.elements["wall-switch"].attributes["aria-pressed"], "false");
});
