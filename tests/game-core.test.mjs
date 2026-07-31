import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = process.env.GAME_HTML
  ? path.resolve(process.env.GAME_HTML)
  : path.resolve(here, "../index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(
  (match) => match[1],
);

class FakeClassList {
  #values = new Set();
  add(...names) {
    names.forEach((name) => this.#values.add(name));
  }
  remove(...names) {
    names.forEach((name) => this.#values.delete(name));
  }
  contains(name) {
    return this.#values.has(name);
  }
}

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.hidden = false;
    this.inert = false;
    this.disabled = false;
    this.checked = false;
    this.dataset = {};
    this.style = { setProperty() {} };
    this.classList = new FakeClassList();
    this.children = [];
    this.textContent = "";
    this.innerHTML = "";
    this.offsetWidth = 480;
    this.listeners = new Map();
  }
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  querySelector() {
    return this.children[0] ?? null;
  }
  setAttribute(name, value) {
    this[name] = String(value);
  }
  getAttribute(name) {
    return this[name] ?? null;
  }
  focus() {}
  contains() {
    return false;
  }
  setPointerCapture() {}
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 480, height: 800, right: 480, bottom: 800 };
  }
}

function makeCanvasContext() {
  const gradient = { addColorStop() {} };
  const base = {
    createRadialGradient() {
      return gradient;
    },
    measureText(text) {
      return { width: String(text).length * 8 };
    },
    setTransform() {},
  };
  return new Proxy(base, {
    get(target, property) {
      if (property in target) return target[property];
      return () => {};
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    },
  });
}

function createHarness() {
  const elements = new Map();
  const documentListeners = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) {
      const element = new FakeElement(id);
      if (id === "gameCanvas") {
        element.width = 480;
        element.height = 800;
        element.getContext = () => makeCanvasContext();
      }
      elements.set(id, element);
    }
    return elements.get(id);
  };

  const storage = () => {
    const data = new Map();
    return {
      getItem(key) {
        return data.has(key) ? data.get(key) : null;
      },
      setItem(key, value) {
        data.set(key, String(value));
      },
      removeItem(key) {
        data.delete(key);
      },
      clear() {
        data.clear();
      },
    };
  };

  const document = {
    hidden: false,
    getElementById: getElement,
    createElement: () => new FakeElement(),
    addEventListener(type, handler) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(handler);
    },
    dispatchEvent(event) {
      for (const handler of documentListeners.get(event.type) ?? []) handler(event);
    },
  };
  const media = {
    matches: false,
    addEventListener() {},
    addListener() {},
  };
  const context = {
    console,
    performance,
    URLSearchParams,
    structuredClone,
    location: { search: "?e7test=1" },
    document,
    navigator: { vibrate() {}, maxTouchPoints: 1 },
    localStorage: storage(),
    sessionStorage: storage(),
    matchMedia: () => media,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    setTimeout: (fn) => {
      fn();
      return 1;
    },
    clearTimeout() {},
    devicePixelRatio: 1,
    visualViewport: { addEventListener() {} },
    addEventListener() {},
    innerWidth: 480,
    innerHeight: 800,
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  scripts.forEach((script, index) => {
    new vm.Script(script, { filename: "inline-" + index + ".js" }).runInContext(context);
  });
  return { api: context.__E7_TEST__, context, document, elements };
}

test("single HTML is self-contained and syntactically valid", () => {
  assert.equal(scripts.length, 1);
  assert.doesNotMatch(html, /<script[^>]+\bsrc\s*=/i);
  assert.doesNotMatch(html, /<link[^>]+\bhref\s*=\s*["']https?:/i);
  assert.doesNotMatch(html, /<img[^>]+\bsrc\s*=\s*["']https?:/i);
  assert.doesNotMatch(html, /GAME_SCRIPT|TODO|FIXME/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /touch-action:\s*none/);
  assert.match(html, /prefers-reduced-motion/);
  scripts.forEach((script, index) => {
    assert.doesNotThrow(() => new vm.Script(script, { filename: "syntax-" + index + ".js" }));
  });
});

test("runtime exposes deterministic fixed-step contract only in test mode", () => {
  const { api } = createHarness();
  assert.ok(api);
  assert.deepEqual(
    JSON.parse(JSON.stringify(api.info())),
    {
      buildId: "2026.07.31-c",
      rulesVersion: 1,
      saveVersion: 2,
      fixedHz: 60,
      loopTicks: 900,
    },
  );
});

test("loop boundary creates exactly one 900-tick recording", () => {
  const { api } = createHarness();
  api.checkpoints.load("L1_T899");
  const result = api.stepTicks(1);
  assert.equal(result.echoes, 1);
  assert.equal(result.recorderLength, 900);
  assert.equal(api.assertInvariants().ok, true);
});

test("loop two begins with one valid echo", () => {
  const { api } = createHarness();
  const state = api.checkpoints.load("L2_ECHO_START");
  assert.equal(state.loop, 2);
  assert.equal(state.echoes, 1);
  assert.equal(state.tick, 0);
  assert.equal(api.assertInvariants().ok, true);
});

test("boss checkpoint starts final loop with six echoes and spawns boss", () => {
  const { api } = createHarness();
  api.checkpoints.load("L7_BOSS_START");
  const state = api.stepTicks(30);
  assert.equal(state.loop, 7);
  assert.equal(state.echoes, 6);
  assert.ok(state.enemies.some((enemy) => enemy.type === "S"));
  assert.equal(api.assertInvariants().ok, true);
});

test("boss clutch resolves as a final-tick victory without duplicate bosses", () => {
  const { api } = createHarness();
  const loaded = api.checkpoints.load("BOSS_CLUTCH");
  assert.equal(loaded.enemies.filter((enemy) => enemy.type === "S").length, 1);
  const result = api.stepTicks(1);
  assert.equal(result.mode, "result");
  assert.equal(result.loop, 7);
  assert.equal(result.enemies.filter((enemy) => enemy.type === "S").length, 0);
});

test("same checkpoint seed replays Prism behavior deterministically", () => {
  const { api } = createHarness();
  const run = () => {
    const frames = [];
    frames.push(api.checkpoints.load("PRISM_ORBIT"));
    for (let tick = 0; tick < 45; tick += 1) frames.push(api.stepTicks(1));
    return frames.map((state) => ({
      tick: state.tick,
      enemies: state.enemies,
      friendly: state.friendly,
      hostile: state.hostile,
      rngState: state.rngState,
    }));
  };
  assert.deepEqual(run(), run());
});

test("boss appears exactly at its telegraphed position", () => {
  const { api } = createHarness();
  const loaded = api.checkpoints.load("BOSS_TELEGRAPH");
  const before = loaded.enemies.find((enemy) => enemy.type === "S");
  assert.ok(before);
  const stepped = api.stepTicks(1);
  const after = stepped.enemies.find((enemy) => enemy.type === "S");
  assert.ok(after);
  assert.ok(Math.hypot(after.x - before.x, after.y - before.y) < 0.001);
});

test("core collapse wins the same-tick tie against boss destruction", () => {
  const { api } = createHarness();
  const loaded = api.checkpoints.load("TIE_BREAK");
  assert.equal(loaded.coreHp, 1);
  assert.equal(loaded.enemies.filter((enemy) => enemy.type === "S").length, 1);
  const result = api.stepTicks(1);
  assert.equal(result.mode, "result");
  assert.equal(result.won, false);
  assert.ok(result.coreHp <= 0);
});

test("coarse landscape resize pauses and cannot advance until resumed", () => {
  const { api, context } = createHarness();
  api.checkpoints.load("L1_T899");
  context.innerWidth = 800;
  context.innerHeight = 400;
  context.matchMedia = () => ({ matches: true, addEventListener() {}, addListener() {} });
  const paused = api.lifecycle.resize();
  assert.equal(paused.mode, "paused");
  assert.equal(paused.tick, 899);
  assert.equal(paused.controlsVisible, false);
  assert.equal(api.stepTicks(5).tick, 899);
});

test("pause-menu buttons retain native keyboard activation", () => {
  const { api, document, elements } = createHarness();
  api.checkpoints.load("L1_T899");
  api.lifecycle.pause();
  const restart = elements.get("restartButton");
  restart.tagName = "BUTTON";
  let prevented = false;
  document.dispatchEvent({
    type: "keydown",
    code: "Enter",
    target: restart,
    preventDefault() { prevented = true; },
  });
  assert.equal(prevented, false);
  assert.equal(api.snapshot().mode, "paused");
  restart.listeners.get("click")[0]({});
  assert.equal(api.snapshot().mode, "countdown");
});

test("mobile HUD reserves a non-overlapping control rail and readable type", () => {
  assert.match(html, /top:\s*calc\(var\(--safe-top\) \+ max\(146px, 30vw\)\)/);
  assert.match(html, /radial-gradient\(circle, #07111d 0 61%, transparent 62%\)/);
  assert.match(html, /ctx\.font = "800 24px ui-monospace, monospace"/);
  assert.match(html, /ctx\.font = "700 18px ui-monospace, monospace"/);
  for (const width of [320, 375, 390, 430, 480, 600]) {
    const bossHudBottom = 130 * (width / 480);
    const controlRailTop = Math.max(146, width * 0.3);
    assert.ok(controlRailTop > bossHudBottom, `${width}px HUD overlaps controls`);
  }
});

test("inactive screens throttle expensive Canvas rendering", () => {
  assert.match(html, /idleRenderInterval = reducedMotion \? 500 : 84/);
  assert.match(html, /if \(simulationActive \|\| testMode \|\| now - lastRenderAt >= idleRenderInterval\)/);
});

test("performance checkpoint approaches configured entity caps", () => {
  const { api } = createHarness();
  const state = api.checkpoints.load("PERF_WORST");
  assert.ok(state.enemies.length >= 64);
  assert.ok(state.friendly >= 64);
  assert.ok(state.hostile >= 40);
  assert.equal(api.assertInvariants().ok, true);
});

test("save sanitizer survives malformed values and clamps progress", () => {
  const { api } = createHarness();
  const imported = api.save.importRaw({
    version: 1,
    bestScore: -500,
    bestLoop: 99,
    wins: "4",
    settings: { sound: false, leftHanded: true },
  });
  assert.equal(imported.bestScore, 0);
  assert.equal(imported.bestLoop, 7);
  assert.equal(imported.wins, 4);
  assert.equal(imported.settings.sound, false);
  assert.equal(imported.settings.leftHanded, true);
});

test("upgrade offer has three unique options", () => {
  const { api } = createHarness();
  api.reset({ seed: 1234 });
  const offers = api.upgrades.offers();
  assert.equal(offers.length, 3);
  assert.equal(new Set(offers).size, 3);
  assert.equal(api.upgrades.choose(offers[0]), true);
  assert.equal(api.upgrades.choose(offers[0]), false);
  const beforeInvalid = api.snapshot().upgrades;
  assert.equal(api.upgrades.choose("__INVALID__"), false);
  assert.deepEqual(api.snapshot().upgrades, beforeInvalid);
});
