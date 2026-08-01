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
const verifyingRollbackArtifact = process.env.ROLLBACK_ARTIFACT === "1";
const declaredBuildId = html.match(/var BUILD_ID = "([^"]+)";/)?.[1] ?? "";

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
  toggle(name, force) {
    const shouldAdd = force === undefined ? !this.#values.has(name) : Boolean(force);
    if (shouldAdd) this.#values.add(name);
    else this.#values.delete(name);
    return shouldAdd;
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
    this.rectWidth = 480;
    this.rectHeight = 800;
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
    return {
      left: 0,
      top: 0,
      width: this.rectWidth,
      height: this.rectHeight,
      right: this.rectWidth,
      bottom: this.rectHeight,
    };
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

function makeWebGLContext() {
  let attribute = 0;
  const calls = {
    shaders: [],
    buffers: [],
    subBuffers: [],
    draws: [],
    matrices: [],
    viewports: [],
    failNextBuffer: false,
  };
  const gl = {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    FLOAT: 0x1406,
    DEPTH_TEST: 0x0b71,
    LEQUAL: 0x0203,
    CULL_FACE: 0x0b44,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    DYNAMIC_DRAW: 0x88e8,
    STATIC_DRAW: 0x88e4,
    BLEND: 0x0be2,
    SRC_ALPHA: 0x0302,
    ONE: 1,
    TRIANGLES: 0x0004,
    NO_ERROR: 0,
    SAMPLES: 0x80a9,
    DEPTH_BITS: 0x0d56,
    createShader(type) { return { type, source: "" }; },
    shaderSource(shader, source) {
      shader.source = source;
      calls.shaders.push(source);
    },
    compileShader() {},
    getShaderParameter() { return true; },
    deleteShader() {},
    createProgram() { return {}; },
    attachShader() {},
    linkProgram() {},
    getProgramParameter() { return true; },
    createBuffer() { return {}; },
    getAttribLocation() { return attribute++; },
    getUniformLocation(_program, name) { return { name }; },
    useProgram() {},
    bindBuffer() {},
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    enable() {},
    disable() {},
    depthFunc() {},
    clearColor() {},
    getContextAttributes() { return { antialias: true, depth: true }; },
    getParameter(parameter) {
      if (parameter === gl.SAMPLES) return 4;
      if (parameter === gl.DEPTH_BITS) return 24;
      return 0;
    },
    getError() { return gl.NO_ERROR; },
    viewport(...args) { calls.viewports.push(args); },
    clear() {},
    uniformMatrix4fv(_location, _transpose, matrix) {
      calls.matrices.push(Array.from(matrix));
    },
    uniform3f() {},
    bufferData(_target, data) {
      if (calls.failNextBuffer) {
        calls.failNextBuffer = false;
        throw new Error("synthetic WebGL allocation failure");
      }
      if (typeof data === "number") {
        assert.ok(data > 0);
        calls.buffers.push(data);
        return;
      }
      assert.ok(ArrayBuffer.isView(data));
      assert.ok(data.length > 0);
      assert.ok(Array.from(data).every(Number.isFinite));
      calls.buffers.push(data.length);
    },
    bufferSubData(_target, offset, data) {
      if (calls.failNextBuffer) {
        calls.failNextBuffer = false;
        throw new Error("synthetic WebGL allocation failure");
      }
      assert.equal(offset, 0);
      assert.ok(ArrayBuffer.isView(data));
      assert.ok(data.length > 0);
      assert.ok(Array.from(data).every(Number.isFinite));
      calls.subBuffers.push(data.length);
    },
    blendFunc() {},
    depthMask() {},
    drawArrays(mode, first, count) { calls.draws.push({ mode, first, count }); },
    isContextLost() { return false; },
  };
  return { gl, calls };
}

function makeStorage() {
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
}

function createHarness(options = {}) {
  const elements = new Map();
  const documentListeners = new Map();
  const webgl = options.webgl ? makeWebGLContext() : null;
  const getElement = (id) => {
    if (!elements.has(id)) {
      const element = new FakeElement(id);
      if (id === "gameCanvas") {
        element.width = 480;
        element.height = 800;
        element.getContext = () => makeCanvasContext();
      }
      if (id === "sceneCanvas" && webgl) {
        element.width = 480;
        element.height = 800;
        element.getContext = (kind) => {
          if (options.webgl1Only && kind === "webgl2") return null;
          return kind.startsWith("webgl") || kind === "experimental-webgl" ? webgl.gl : null;
        };
      }
      elements.set(id, element);
    }
    return elements.get(id);
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
  const media = (query = "") => ({
    matches: Boolean(options.reducedMotion && String(query).includes("prefers-reduced-motion")),
    addEventListener() {},
    addListener() {},
  });
  const context = {
    console,
    performance,
    URLSearchParams,
    structuredClone,
    location: { search: "?e7test=1" },
    document,
    navigator: { vibrate() {}, maxTouchPoints: 1 },
    localStorage: options.localStorage ?? makeStorage(),
    sessionStorage: options.sessionStorage ?? makeStorage(),
    matchMedia: media,
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
  return { api: context.__E7_TEST__, context, document, elements, webgl };
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
  assert.match(html, /id="deviceReport"/);
  assert.match(html, /id="copyReportButton"/);
  assert.match(html, /ECHO\/\/SEVEN DEVICE REPORT/);
  assert.match(html, /id="sceneCanvas"/);
  assert.match(html, /id="attackButton"/);
  assert.match(html, /id="crosshair"/);
  assert.match(html, /FIRE \+ AIM/);
  assert.match(html, /FIREやDASHを押したまま左右へ滑らせても照準/);
  assert.match(declaredBuildId, /^\d{4}\.\d{2}\.\d{2}-[a-z]$/);
  if (!verifyingRollbackArtifact) {
    assert.match(html, /class="mission-strip"/);
    assert.match(html, /<strong>15 SEC<\/strong>/);
    assert.match(html, /<strong>REPEAT ×7<\/strong>/);
  }
  assert.match(html, /getContext\("webgl2"/);
  assert.match(html, /attribute vec3 aPosition/);
  assert.match(html, /uniform mat4 uViewProjection/);
  assert.match(html, /renderer3d\.ready && renderer3d\.render\(now\)/);
  scripts.forEach((script, index) => {
    assert.doesNotThrow(() => new vm.Script(script, { filename: "syntax-" + index + ".js" }));
  });
});

test("visual hierarchy keeps loop data legible and enriches both render paths", {
  skip: verifyingRollbackArtifact ? "current visual acceptance is not applicable to the last verified release" : false,
}, () => {
  assert.equal(declaredBuildId, "2026.08.01-f");
  assert.match(html, /#menuTitle::after\s*\{[\s\S]*?content:\s*"07"/);
  assert.match(html, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(html, /ctx\.font = "900 30px ui-monospace, monospace"/);
  assert.match(html, /ctx\.fillText\("YOU " \+ hpValue/);
  assert.match(html, /ctx\.fillText\("ECHO", 330, 91\)/);
  assert.match(html, /var gatePositions = quality === 2 \? \[-8\.4, 10\.2\] : \[10\.2\]/);
  assert.match(html, /var scanY = reducedMotion \? 244 : 108 \+ \(now \* 0\.035\)/);
  assert.match(html, /addRing\(glow, 0, 0\.03, 0, 6\.15/);
});

test("runtime exposes deterministic fixed-step contract only in test mode", () => {
  const { api } = createHarness();
  assert.ok(api);
  assert.deepEqual(
    JSON.parse(JSON.stringify(api.info())),
    {
      buildId: declaredBuildId,
      rulesVersion: 2,
      saveVersion: 2,
      fixedHz: 60,
      loopTicks: 900,
      cameraMode: "first-person",
      attackMode: "manual",
    },
  );
});

test("3D renderer keeps a deterministic Canvas fallback for unsupported devices", () => {
  const { api } = createHarness();
  const state = api.checkpoints.load("L2_ECHO_START");
  assert.equal(state.renderer, "canvas-2d");
  assert.equal(state.echoes, 1);
  assert.match(api.diagnostics.report(), /renderer: Canvas 2D fallback/);
});

test("WebGL path builds finite 3D geometry inside the stress budget", () => {
  const { api, webgl } = createHarness({ webgl: true });
  const state = api.checkpoints.load("PERF_WORST");
  assert.equal(state.renderer, "webgl-3d");
  assert.ok(state.triangles >= 1000, `expected a populated 3D scene, got ${state.triangles}`);
  assert.ok(state.triangles < 12000, `stress scene exceeds triangle budget: ${state.triangles}`);
  assert.ok(webgl.calls.draws.length >= 2);
  assert.ok(webgl.calls.buffers.length >= 2);
  assert.ok(webgl.calls.shaders.some((source) => source.includes("uViewProjection")));
  assert.ok(webgl.calls.shaders.some((source) => source.includes("vFog")));
  assert.ok(webgl.calls.matrices.length > 0);
  assert.ok(webgl.calls.matrices.at(-1).every(Number.isFinite));
  assert.deepEqual(webgl.calls.viewports.at(-1), [0, 0, 480, 800]);
  assert.match(api.diagnostics.report(), /renderer: WebGL 3D/);
  const staticBuilds = state.rendererStaticBuilds;
  const bufferUploads = webgl.calls.buffers.length;
  const subBufferUploads = webgl.calls.subBuffers.length;
  const next = api.stepTicks(1);
  assert.equal(next.rendererStaticBuilds, staticBuilds);
  assert.equal(webgl.calls.buffers.length - bufferUploads, 0, "dynamic GPU capacity should be reused");
  assert.equal(webgl.calls.subBuffers.length - subBufferUploads, 2, "only dynamic solid/glow ranges should update per frame");

  api.lifecycle.adaptiveQualityDrop();
  const qualityOne = api.stepTicks(1);
  api.lifecycle.adaptiveQualityDrop();
  const qualityZero = api.stepTicks(1);
  assert.equal(qualityOne.quality, 1);
  assert.equal(qualityZero.quality, 0);
  assert.ok(qualityZero.triangles < state.triangles, "quality floor should shed decorative geometry");
  assert.ok(qualityZero.triangles < 12000);

  const reduced = createHarness({ webgl: true, reducedMotion: true }).api.checkpoints.load("PERF_WORST");
  assert.equal(reduced.renderer, "webgl-3d");
  assert.ok(reduced.triangles < state.triangles, "reduced motion should omit dynamic scan geometry");
});

test("3D camera, crosshair plane, and manual bullets agree in all cardinal directions", () => {
  const { api } = createHarness({ webgl: true });
  api.checkpoints.load("L2_ECHO_START");
  const pose = api.renderer.cameraPose(240, 470, 0, -1);
  assert.equal(pose.mode, "first-person");
  assert.ok(Math.abs(pose.eye[0]) < 0.001);
  assert.ok(Math.abs(pose.eye[2] - 2.07) < 0.001);
  assert.deepEqual(pose.forward, [0, 0, -1]);

  const forward = api.renderer.projectArenaPoint(240, 350, 240, 470, 0, -1);
  assert.ok(forward);
  assert.equal(forward.visible, true);
  assert.ok(Math.abs(forward.x - 240) < 0.01, `forward aim drifted to ${forward.x}`);
  assert.ok(Math.abs(forward.y - 400) < 0.01, `forward aim height drifted to ${forward.y}`);
  const behind = api.renderer.projectArenaPoint(240, 590, 240, 470, 0, -1);
  assert.ok(behind);
  assert.equal(behind.visible, false);

  for (const distance of [20, 120, 260]) {
    const projected = api.renderer.projectArenaPoint(240, 470 - distance, 240, 470, 0, -1);
    assert.equal(projected.visible, true);
    assert.ok(Math.abs(projected.x - 240) < 0.01);
    assert.ok(Math.abs(projected.y - 400) < 0.01, `aim plane drift at ${distance}px: ${projected.y}`);
  }

  api.checkpoints.load("PLAYER_KO");
  const shakenAim = api.renderer.projectArenaPoint(240, 350, 240, 470, 0, -1, true, 137);
  assert.equal(shakenAim.visible, true);
  assert.ok(Math.abs(shakenAim.x - 240) < 0.01);
  assert.ok(Math.abs(shakenAim.y - 400) < 0.01, "screen shake must roll around the crosshair ray");

  const cardinals = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
  for (const direction of cardinals) {
    const cardinalPose = api.renderer.cameraPose(240, 470, direction.x, direction.y);
    assert.ok(Math.abs(cardinalPose.forward[0] - direction.x) < 0.000001);
    assert.ok(Math.abs(cardinalPose.forward[2] - direction.y) < 0.000001);
    const target = api.renderer.projectArenaPoint(
      240 + direction.x * 120,
      470 + direction.y * 120,
      240,
      470,
      direction.x,
      direction.y,
    );
    assert.equal(target.visible, true);
    assert.ok(Math.abs(target.x - 240) < 0.01);
    assert.ok(Math.abs(target.y - 400) < 0.01);

    api.reset({ seed: 0xcafe });
    api.input.setAim(direction.x, direction.y);
    api.input.fireDown();
    const fired = api.stepTicks(1);
    api.input.fireUp();
    const bullet = fired.friendlyProjectiles.find((candidate) => candidate.actor === 0);
    const speed = Math.hypot(bullet.vx, bullet.vy);
    assert.ok(Math.abs(bullet.vx / speed - direction.x) < 0.000001);
    assert.ok(Math.abs(bullet.vy / speed - direction.y) < 0.000001);
  }
});

test("WebGL 1 shader path remains available on older mobile browsers", () => {
  const { api, webgl } = createHarness({ webgl: true, webgl1Only: true });
  const state = api.checkpoints.load("L7_BOSS_START");
  assert.equal(state.renderer, "webgl-3d");
  assert.ok(webgl.calls.shaders.some((source) => source.includes("attribute vec3 aPosition")));
  assert.ok(webgl.calls.shaders.some((source) => source.includes("gl_FragColor")));
  assert.ok(webgl.calls.draws.length >= 2);
});

test("WebGL render failure falls back to Canvas without stopping the simulation", () => {
  const { api, webgl } = createHarness({ webgl: true });
  api.checkpoints.load("L7_BOSS_START");
  webgl.calls.failNextBuffer = true;
  const fallenBack = api.stepTicks(1);
  assert.equal(fallenBack.renderer, "canvas-2d");
  assert.equal(fallenBack.triangles, 0);
  assert.match(fallenBack.rendererError, /synthetic WebGL allocation failure/);
  assert.equal(fallenBack.tick, 1);
  assert.doesNotThrow(() => api.stepTicks(1));
  assert.equal(api.snapshot().tick, 2);
});

test("WebGL context loss, portrait resize, and restoration preserve the new backing size", () => {
  const { api, context, elements, webgl } = createHarness({ webgl: true });
  const initial = api.checkpoints.load("L2_ECHO_START");
  const scene = elements.get("sceneCanvas");
  let prevented = false;
  scene.listeners.get("webglcontextlost")[0]({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(api.snapshot().renderer, "canvas-2d");
  const overlay = elements.get("gameCanvas");
  overlay.rectWidth = 360;
  overlay.rectHeight = 640;
  context.innerWidth = 360;
  context.innerHeight = 640;
  api.lifecycle.resize();
  assert.equal(scene.width, 360);
  assert.equal(scene.height, 640);
  scene.listeners.get("webglcontextrestored")[0]({});
  const restored = api.stepTicks(1);
  assert.equal(restored.renderer, "webgl-3d");
  assert.ok(restored.rendererStaticBuilds > initial.rendererStaticBuilds);
  assert.ok(restored.triangles > 0);
  assert.deepEqual(webgl.calls.viewports.at(-1), [0, 0, 360, 640]);
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

test("echo replays the recorded manual aim instead of auto-targeting", () => {
  const { api } = createHarness();
  api.checkpoints.load("L2_ECHO_START");
  const state = api.stepTicks(1);
  const echoShot = state.friendlyProjectiles.find((bullet) => bullet.actor === 1);
  assert.ok(echoShot, JSON.stringify({ projectiles: state.friendlyProjectiles, tick: state.tick, mode: state.mode }));
  assert.ok(echoShot.vx > 500);
  assert.ok(Math.abs(echoShot.vy) < 0.001);
  assert.equal(state.metrics.manualShots, 0);
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

test("manual attack never fires without input and records the chosen aim", () => {
  const { api } = createHarness();
  api.checkpoints.load("PRISM_ORBIT");
  api.stepTicks(60);
  assert.equal(api.metrics().manualShots, 0);
  assert.equal(api.snapshot().friendly, 0);

  api.input.setAim(1, 0);
  api.input.fireDown();
  const fired = api.stepTicks(1);
  api.input.fireUp();
  assert.equal(fired.metrics.manualShots, 1);
  assert.ok(fired.friendly > 0);
  assert.ok(Math.abs(fired.player.facingX - 1) < 0.0001);
  assert.ok(Math.abs(fired.player.facingY) < 0.0001);
  const frame = api.tapes.currentFrame(fired.recorderLength - 1);
  assert.equal(frame.f, 1);
  assert.equal(frame.fx, 1);
  assert.equal(frame.fy, 0);

  api.stepTicks(30);
  assert.equal(api.metrics().manualShots, 1);
});

test("holding manual fire repeats only at the configured cadence", () => {
  const { api } = createHarness();
  api.reset({ seed: 71 });
  api.input.setAim(0, -1);
  api.input.fireDown();
  api.stepTicks(25);
  assert.equal(api.metrics().manualShots, 2);
  api.input.fireUp();
  api.stepTicks(30);
  assert.equal(api.metrics().manualShots, 2);
});

test("production pointer handlers split move/look zones and preserve a fast FIRE tap", () => {
  const { api, elements } = createHarness();
  api.reset({ seed: 72 });
  const canvas = elements.get("gameCanvas");
  const attack = elements.get("attackButton");
  const pointer = (pointerId, clientX, clientY) => ({
    pointerId,
    pointerType: "touch",
    button: 0,
    clientX,
    clientY,
    preventDefault() {},
  });

  canvas.listeners.get("pointerdown")[0](pointer(11, 70, 540));
  canvas.listeners.get("pointermove")[0](pointer(11, 70, 480));
  canvas.listeners.get("pointerdown")[0](pointer(12, 310, 320));
  canvas.listeners.get("pointermove")[0](pointer(12, 350, 320));
  canvas.listeners.get("pointerup")[0](pointer(12, 350, 320));
  attack.listeners.get("pointerdown")[0](pointer(13, 320, 570));
  attack.listeners.get("pointerup")[0](pointer(13, 320, 570));

  const state = api.stepTicks(1);
  assert.ok(state.player.x > 240, `view-relative movement did not rotate with aim: ${JSON.stringify(state.player)}`);
  assert.ok(state.player.y < 470);
  assert.ok(state.player.facingX > 0.2);
  assert.equal(state.metrics.manualShots, 1, "a tap released before the tick must still fire once");
  canvas.listeners.get("pointerup")[0](pointer(11, 70, 480));
});

test("FIRE drag combines manual shooting and aim on one action thumb", () => {
  const { api, elements } = createHarness();
  api.reset({ seed: 721 });
  const canvas = elements.get("gameCanvas");
  const attack = elements.get("attackButton");
  const pointer = (pointerId, clientX, clientY) => ({
    pointerId,
    pointerType: "touch",
    button: 0,
    clientX,
    clientY,
    preventDefault() {},
  });

  canvas.listeners.get("pointerdown")[0](pointer(21, 70, 560));
  canvas.listeners.get("pointermove")[0](pointer(21, 70, 500));
  attack.listeners.get("pointerdown")[0](pointer(22, 360, 650));
  attack.listeners.get("pointermove")[0](pointer(22, 404, 650));

  const state = api.stepTicks(1);
  assert.equal(state.inputState.movePointerId, 21);
  assert.equal(state.inputState.firePointerId, 22);
  assert.equal(state.inputState.fireHeld, true);
  assert.equal(state.metrics.manualShots, 1);
  assert.equal(state.metrics.concurrentFire, true);
  assert.ok(state.player.facingX > 0.2, `FIRE drag did not turn aim: ${state.player.facingX}`);
  assert.ok(state.player.x > 240, "view-relative movement did not follow FIRE-drag aim");

  attack.listeners.get("pointerup")[0](pointer(22, 404, 650));
  const released = api.snapshot();
  assert.equal(released.inputState.firePointerId, null);
  assert.equal(released.inputState.fireHeld, false);
});

test("look sensitivity stays consistent across phone widths", () => {
  const facingAfterTenPercentSwipe = (width) => {
    const { api, elements } = createHarness();
    api.reset({ seed: width });
    const canvas = elements.get("gameCanvas");
    canvas.rectWidth = width;
    const pointer = (pointerId, clientX) => ({
      pointerId,
      pointerType: "touch",
      button: 0,
      clientX,
      clientY: 320,
      preventDefault() {},
    });
    const start = width * 0.7;
    canvas.listeners.get("pointerdown")[0](pointer(23, start));
    canvas.listeners.get("pointermove")[0](pointer(23, start + width * 0.1));
    return api.stepTicks(1).player.facingX;
  };

  const narrow = facingAfterTenPercentSwipe(320);
  const standard = facingAfterTenPercentSwipe(480);
  assert.ok(narrow > 0.25 && standard > 0.25);
  assert.ok(Math.abs(narrow - standard) < 0.015, `${narrow} vs ${standard}`);
});

test("floating movement pad reaches a responsive walk from a short thumb drag", () => {
  const { api, elements } = createHarness();
  api.reset({ seed: 722 });
  const canvas = elements.get("gameCanvas");
  const pointer = (pointerId, clientX, clientY) => ({
    pointerId,
    pointerType: "touch",
    button: 0,
    clientX,
    clientY,
    preventDefault() {},
  });
  canvas.listeners.get("pointerdown")[0](pointer(24, 70, 540));
  canvas.listeners.get("pointermove")[0](pointer(24, 85, 540));
  const state = api.snapshot();
  assert.ok(state.inputState.moveX > 0.38, `short drag stayed sluggish: ${state.inputState.moveX}`);
  assert.ok(Math.abs(state.inputState.moveY) < 0.000001);
});

test("the solid core keeps walking and dashing first-person cameras outside", () => {
  const { api } = createHarness();
  const distanceFromCore = (state) => Math.hypot(state.player.x - 240, state.player.y - 410);

  api.reset({ seed: 73 });
  api.input.setAim(0, -1);
  api.input.setTouchMove(0, -1);
  for (let tick = 0; tick < 30; tick += 1) {
    const state = api.stepTicks(1);
    assert.ok(distanceFromCore(state) >= 48 - 0.000001, `walk entered core at tick ${tick}`);
  }

  api.reset({ seed: 74 });
  api.input.setAim(0, -1);
  api.input.setTouchMove(0, -1);
  api.input.dash();
  for (let tick = 0; tick < 12; tick += 1) {
    const state = api.stepTicks(1);
    assert.ok(distanceFromCore(state) >= 48 - 0.000001, `dash entered core at tick ${tick}`);
  }
});

test("look input accumulated while knocked out cannot snap the revived camera", () => {
  const { api } = createHarness();
  const knockedOut = api.checkpoints.load("PLAYER_KO");
  assert.equal(knockedOut.player.active, false);
  const initialFacing = [knockedOut.player.facingX, knockedOut.player.facingY];
  api.input.look(2.4);
  const revived = api.stepTicks(72);
  assert.equal(revived.player.active, true);
  const firstActiveTick = api.stepTicks(1);
  assert.ok(Math.abs(firstActiveTick.player.facingX - initialFacing[0]) < 0.000001);
  assert.ok(Math.abs(firstActiveTick.player.facingY - initialFacing[1]) < 0.000001);
});

test("Canvas and WebGL produce the same 6,300-tick golden gameplay trace", () => {
  const canvasTrace = createHarness().api.diagnostics.goldenTrace(0x6300e7);
  const webglTrace = createHarness({ webgl: true }).api.diagnostics.goldenTrace(0x6300e7);
  assert.deepEqual(JSON.parse(JSON.stringify(webglTrace)), JSON.parse(JSON.stringify(canvasTrace)));
  assert.equal(canvasTrace.totalTicks, 6300);
  assert.equal(canvasTrace.mode, "result");
  assert.deepEqual(canvasTrace.recordings, [900, 900, 900, 900, 900, 900]);
  assert.equal(canvasTrace.recorderLength, 900);
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
  assert.match(html, verifyingRollbackArtifact
    ? /ctx\.font = "800 24px ui-monospace, monospace"/
    : /ctx\.font = "900 30px ui-monospace, monospace"/);
  assert.match(html, verifyingRollbackArtifact
    ? /ctx\.font = "700 18px ui-monospace, monospace"/
    : /ctx\.font = "800 16px ui-monospace, monospace"/);
  for (const width of [320, 375, 390, 430, 480, 600]) {
    const bossHudBottom = (verifyingRollbackArtifact ? 130 : 142) * (width / 480);
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

test("device report captures stress peaks without network telemetry", () => {
  const { api } = createHarness({ webgl: true });
  api.checkpoints.load("PERF_WORST");
  const metrics = api.metrics();
  assert.ok(metrics.maxEnemies >= 64);
  assert.ok(metrics.maxFriendly >= 64);
  assert.ok(metrics.maxHostile >= 40);
  assert.ok(metrics.maxParticles >= 60);
  assert.equal(metrics.backingPixels, 480 * 800 * 2);
  assert.equal(metrics.rendererSamples, 4);
  assert.equal(metrics.rendererDepthBits, 24);
  assert.ok(metrics.framebufferBytes > metrics.backingPixels * 4);
  assert.equal(metrics.sampledFrames, 0);
  const report = api.diagnostics.report();
  assert.ok(report.includes("build: " + declaredBuildId));
  assert.match(report, /peaks: enemies 64/);
  assert.match(report, /framebuffer [0-9.]+ MiB est\./);
  assert.match(report, /samples 4 \/ depth 24bit/);
  assert.doesNotMatch(report, /https?:\/\//);
});

test("diagnostic verdict distinguishes smooth and stalled frame samples", () => {
  const { api } = createHarness();
  api.reset({ seed: 77 });
  api.diagnostics.sampleFrames([1500]);
  assert.equal(api.metrics().suspendedFrameGaps, 1);
  assert.equal(api.metrics().sampledFrames, 0);
  const good = api.diagnostics.sampleFrames(Array(180).fill(16.7));
  assert.equal(good.id, "good");
  const warned = api.diagnostics.sampleFrames(Array(180).fill(50));
  assert.equal(warned.id, "warn");
});

test("simultaneous touch movement, manual FIRE, and DASH are recorded", () => {
  const { api } = createHarness();
  api.reset({ seed: 88 });
  api.input.setTouchMove(1, 0.2);
  api.input.fireDown();
  api.input.dash();
  api.stepTicks(1);
  assert.equal(api.metrics().concurrentDash, true);
  assert.equal(api.metrics().concurrentFire, true);
  assert.equal(api.metrics().manualShots, 1);
  api.input.fireUp();
  api.input.release();
});

test("adaptive quality resizing preserves every active touch action", () => {
  const { api, elements } = createHarness();
  api.reset({ seed: 89 });
  const canvas = elements.get("gameCanvas");
  const attack = elements.get("attackButton");
  const dash = elements.get("dashButton");
  const pointer = (pointerId, clientX, clientY) => ({
    pointerId,
    pointerType: "touch",
    button: 0,
    clientX,
    clientY,
    preventDefault() {},
  });
  canvas.listeners.get("pointerdown")[0](pointer(31, 70, 540));
  canvas.listeners.get("pointermove")[0](pointer(31, 70, 480));
  canvas.listeners.get("pointerdown")[0](pointer(32, 330, 320));
  canvas.listeners.get("pointermove")[0](pointer(32, 370, 320));
  attack.listeners.get("pointerdown")[0](pointer(33, 370, 620));
  dash.listeners.get("pointerdown")[0](pointer(34, 390, 520));

  const resized = api.lifecycle.adaptiveQualityDrop();
  assert.equal(resized.quality, 1);
  assert.equal(resized.inputState.movePointerId, 31);
  assert.equal(resized.inputState.lookPointerId, 32);
  assert.equal(resized.inputState.fireHeld, true);
  assert.equal(resized.inputState.fireQueued, true);
  assert.equal(resized.inputState.dashQueued, true);
  assert.ok(resized.inputState.lookDelta > 0);
  assert.equal(elements.get("movePad").classList.contains("visible"), true);
  assert.equal(attack.classList.contains("is-pressed"), true);
  assert.equal(dash.classList.contains("is-pressed"), true);

  const acted = api.stepTicks(1);
  assert.equal(acted.metrics.manualShots, 1);
  assert.equal(acted.metrics.concurrentFire, true);
  assert.equal(acted.metrics.concurrentDash, true);
  assert.ok(acted.player.facingX > 0.1);
});

test("left-handed layout mirrors both controls and instructional accessibility copy", () => {
  const { document, elements } = createHarness();
  const canvas = elements.get("gameCanvas");
  const tutorialCopy = elements.get("tutorialMoveCopy");
  assert.match(canvas.getAttribute("aria-label"), /左側をドラッグして移動、右側をドラッグして照準/);
  assert.match(tutorialCopy.textContent, /左側をドラッグして移動。右側をドラッグして/);

  document.getElementById("soundSetting").checked = false;
  document.getElementById("hapticsSetting").checked = false;
  document.getElementById("shakeSetting").checked = false;
  document.getElementById("leftHandSetting").checked = true;
  elements.get("settingsDoneButton").listeners.get("click")[0]();

  assert.match(canvas.getAttribute("aria-label"), /右側をドラッグして移動、左側をドラッグして照準/);
  assert.match(tutorialCopy.textContent, /右側をドラッグして移動。左側をドラッグして/);
  assert.notEqual(elements.get("attackButton").style.left, "auto");
  assert.equal(elements.get("attackButton").style.right, "auto");
});

test("background lifecycle pauses are counted separately", () => {
  const { api } = createHarness();
  api.checkpoints.load("L1_T899");
  const paused = api.lifecycle.pause("background");
  assert.equal(paused.mode, "paused");
  assert.equal(paused.metrics.pauses, 1);
  assert.equal(paused.metrics.backgroundPauses, 1);
  assert.equal(paused.metrics.rotationPauses, 0);
});

test("same-tab reload restores combat exactly, paused, with every input released", async () => {
  const sessionStorage = makeStorage();
  const first = createHarness({ sessionStorage });
  first.api.checkpoints.load("L2_ECHO_START");
  first.api.input.setAim(1, 0);
  first.api.input.setTouchMove(0.8, -0.4);
  first.api.input.fireDown();
  first.api.stepTicks(37);
  first.api.input.fireUp();
  const before = first.api.lifecycle.pause("background");
  const raw = sessionStorage.getItem("echoSeven.runCheckpoint");
  assert.ok(raw);
  assert.ok(raw.length < 1800000);

  const second = createHarness({ sessionStorage });
  const restored = second.api.snapshot();
  assert.equal(restored.mode, "paused");
  assert.equal(restored.previousMode, "playing");
  assert.equal(restored.loop, before.loop);
  assert.equal(restored.tick, before.tick);
  assert.equal(restored.coreHp, before.coreHp);
  assert.equal(restored.score, before.score);
  assert.equal(restored.kills, before.kills);
  assert.equal(restored.echoes, before.echoes);
  assert.equal(restored.recorderLength, before.recorderLength);
  assert.deepEqual(JSON.parse(JSON.stringify(restored.player)), JSON.parse(JSON.stringify(before.player)));
  assert.deepEqual(JSON.parse(JSON.stringify(restored.enemies)), JSON.parse(JSON.stringify(before.enemies)));
  assert.deepEqual(restored.inputState, {
    movePointerId: null,
    lookPointerId: null,
    firePointerId: null,
    dashPointerId: null,
    moveX: 0,
    moveY: 0,
    fireHeld: false,
    fireQueued: false,
    dashQueued: false,
    lookDelta: 0,
  });

  first.elements.get("resumeButton").listeners.get("click")[0]();
  second.elements.get("resumeButton").listeners.get("click")[0]();
  await Promise.resolve();
  assert.equal(first.api.snapshot().mode, "playing");
  assert.equal(second.api.snapshot().mode, "playing");
  const uninterrupted = first.api.stepTicks(90);
  const continued = second.api.stepTicks(90);
  assert.equal(continued.tick, before.tick + 90);
  for (const key of ["tick", "coreHp", "score", "kills", "friendly", "hostile", "rngState"]) {
    assert.equal(continued[key], uninterrupted[key], `${key} diverged after restoration`);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(continued.player)), JSON.parse(JSON.stringify(uninterrupted.player)));
  assert.deepEqual(JSON.parse(JSON.stringify(continued.enemies)), JSON.parse(JSON.stringify(uninterrupted.enemies)));
  assert.deepEqual(JSON.parse(JSON.stringify(continued.friendlyProjectiles)), JSON.parse(JSON.stringify(uninterrupted.friendlyProjectiles)));
});

test("late-run checkpoint remains bounded and restores all six echo tapes", () => {
  const sessionStorage = makeStorage();
  const first = createHarness({ sessionStorage });
  const late = first.api.checkpoints.load("L7_BOSS_START");
  assert.equal(late.echoes, 6);
  first.api.diagnostics.sampleFrames(Array.from({ length: 5000 }, (_, index) => 16 + (index % 17) / 7));
  first.api.lifecycle.pause("background");
  const raw = sessionStorage.getItem("echoSeven.runCheckpoint");
  assert.ok(raw);
  assert.ok(raw.length < 1800000, `checkpoint grew to ${raw.length} bytes`);

  const restored = createHarness({ sessionStorage }).api.snapshot();
  assert.equal(restored.mode, "paused");
  assert.equal(restored.previousMode, "playing");
  assert.equal(restored.loop, 7);
  assert.equal(restored.echoes, 6);
  assert.equal(restored.recorderLength, 0);
  assert.equal(restored.metrics.sampledFrames, 3600);
});

test("reload preserves the exact three upgrade offers before resuming selection", async () => {
  const sessionStorage = makeStorage();
  const first = createHarness({ sessionStorage });
  first.api.checkpoints.load("L2_ECHO_START");
  const choice = first.api.stepTicks(900);
  assert.equal(choice.mode, "upgrade");
  assert.equal(choice.upgradeOffers.length, 3);

  const second = createHarness({ sessionStorage });
  const restored = second.api.snapshot();
  assert.equal(restored.mode, "paused");
  assert.equal(restored.previousMode, "upgrade");
  assert.deepEqual(JSON.parse(JSON.stringify(restored.upgradeOffers)), JSON.parse(JSON.stringify(choice.upgradeOffers)));
  second.elements.get("resumeButton").listeners.get("click")[0]();
  await Promise.resolve();
  const resumed = second.api.snapshot();
  assert.equal(resumed.mode, "upgrade");
  assert.deepEqual(JSON.parse(JSON.stringify(resumed.upgradeOffers)), JSON.parse(JSON.stringify(choice.upgradeOffers)));
  assert.equal(second.elements.get("upgradeCards").children.length, 3);
});

test("malformed run checkpoint is discarded without leaving the title screen", () => {
  const sessionStorage = makeStorage();
  sessionStorage.setItem("echoSeven.runCheckpoint", JSON.stringify({
    version: 2,
    rulesVersion: 2,
    rngState: 1,
    fxRngState: 2,
    entityId: 1,
    enemySerial: 1,
    elapsedMs: 0,
    metrics: null,
    game: { mode: "playing", seed: 1 },
  }));
  const { api } = createHarness({ sessionStorage });
  assert.equal(api.snapshot().mode, "menu");
  assert.equal(sessionStorage.getItem("echoSeven.runCheckpoint"), null);
});

test("intentional return to title discards the resumable run", () => {
  const sessionStorage = makeStorage();
  const { api, elements } = createHarness({ sessionStorage });
  api.checkpoints.load("L2_ECHO_START");
  api.lifecycle.pause();
  assert.ok(sessionStorage.getItem("echoSeven.runCheckpoint"));
  elements.get("quitButton").listeners.get("click")[0]();
  assert.equal(api.snapshot().mode, "menu");
  assert.equal(sessionStorage.getItem("echoSeven.runCheckpoint"), null);
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

test("old auto-fire saves retain progress but must see the new manual-fire tutorial", () => {
  const { api } = createHarness();
  const migrated = api.save.importRaw({
    version: 2,
    bestScore: 54321,
    bestLoop: 6,
    wins: 3,
    tutorialSeen: true,
    settings: { sound: false, leftHanded: true },
  });
  assert.equal(migrated.bestScore, 54321);
  assert.equal(migrated.bestLoop, 6);
  assert.equal(migrated.wins, 3);
  assert.equal(migrated.settings.leftHanded, true);
  assert.equal(migrated.tutorialRulesVersion, 0);
  assert.equal(migrated.tutorialSeen, false);

  const current = api.save.importRaw({
    version: 2,
    tutorialRulesVersion: 2,
    tutorialSeen: true,
  });
  assert.equal(current.tutorialRulesVersion, 2);
  assert.equal(current.tutorialSeen, true);
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
