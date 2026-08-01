#!/usr/bin/env node

/**
 * Fast browser gate for the primary ECHO//SEVEN phone surface.
 *
 * Playwright WebKit uses the built-in iPhone SE (3rd gen) portrait profile.
 * Synthetic PointerEvents cover deterministic multi-pointer behavior because
 * Playwright WebKit exposes one touchscreen contact; the iOS/Appium gate covers
 * trusted multi-touch in actual Mobile Safari.
 */

import { createServer } from 'node:http';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { chromium, devices, webkit } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = resolve(root, process.env.E7_WEBKIT_OUTPUT || 'test-results/iphone-webkit');
const baselinePath = resolve(root, 'tests/baselines/iphone-se3-webkit-loop2.png');
const actualPath = resolve(outputDir, 'iphone-se3-webkit-loop2.png');
const candidatePath = resolve(outputDir, 'iphone-se3-webkit-baseline-candidate.png');
const diffPath = resolve(outputDir, 'iphone-se3-webkit-diff.png');
const reportPath = resolve(outputDir, 'report.json');
const tracePath = resolve(outputDir, 'trace.zip');
const browserName = process.env.E7_BROWSER || 'webkit';
const externalUrl = process.env.E7_TEST_URL || '';
const requireBaseline = process.env.E7_REQUIRE_BASELINE === '1';

mkdirSync(outputDir, { recursive: true });

const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  target: 'iPhone SE (3rd gen) portrait / Playwright WebKit',
  browser: browserName,
  checks: [],
  errors: { page: [], console: [], request: [], http: [] },
  screenshots: {},
  interaction: {},
  visualRegression: null,
  status: 'running',
  failures: [],
};

function check(condition, name, detail) {
  const passed = Boolean(condition);
  report.checks.push({ name, passed, detail });
  if (!passed) report.failures.push(`${name}: ${detail}`);
  return passed;
}

function quantile(values, fraction) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

function imageStats(png) {
  let sum = 0;
  let sumSq = 0;
  let dark = 0;
  const pixels = png.width * png.height;
  for (let index = 0; index < png.data.length; index += 4) {
    const luma = 0.2126 * png.data[index] + 0.7152 * png.data[index + 1] + 0.0722 * png.data[index + 2];
    sum += luma;
    sumSq += luma * luma;
    if (luma < 4) dark++;
  }
  const mean = sum / pixels;
  return {
    width: png.width,
    height: png.height,
    meanLuma: +mean.toFixed(3),
    lumaStdDev: +Math.sqrt(Math.max(0, sumSq / pixels - mean * mean)).toFixed(3),
    nearBlackRatio: +(dark / pixels).toFixed(5),
  };
}

function compareScreenshot() {
  const actual = PNG.sync.read(readFileSync(actualPath));
  const stats = imageStats(actual);
  const result = {
    baseline: baselinePath.slice(root.length + 1),
    baselinePresent: existsSync(baselinePath),
    actual: actualPath.slice(root.length + 1),
    threshold: 0.25,
    maximumDiffRatio: 0.30,
    diff: null,
    diffPixels: null,
    diffRatio: null,
    stats,
  };
  check(stats.meanLuma > 5 && stats.meanLuma < 248, 'render has usable luminance', JSON.stringify(stats));
  check(stats.lumaStdDev > 12, 'render is not flat or cleared', JSON.stringify(stats));
  check(stats.nearBlackRatio < 0.82, 'render is not predominantly black', JSON.stringify(stats));
  if (!result.baselinePresent) {
    copyFileSync(actualPath, candidatePath);
    report.screenshots.baselineCandidate = candidatePath.slice(root.length + 1);
    if (requireBaseline) check(false, 'visual baseline exists', `promote ${candidatePath.slice(root.length + 1)} to ${baselinePath.slice(root.length + 1)}`);
    return result;
  }
  const baseline = PNG.sync.read(readFileSync(baselinePath));
  if (baseline.width !== actual.width || baseline.height !== actual.height) {
    check(false, 'visual baseline dimensions match', `${baseline.width}x${baseline.height} != ${actual.width}x${actual.height}`);
    return result;
  }
  const diff = new PNG({ width: actual.width, height: actual.height });
  const diffPixels = pixelmatch(baseline.data, actual.data, diff.data, actual.width, actual.height, {
    threshold: result.threshold,
    includeAA: false,
    diffColor: [255, 68, 68],
  });
  result.diffPixels = diffPixels;
  result.diffRatio = +(diffPixels / (actual.width * actual.height)).toFixed(6);
  result.diff = diffPath.slice(root.length + 1);
  writeFileSync(diffPath, PNG.sync.write(diff));
  check(result.diffRatio <= result.maximumDiffRatio, 'visual regression stays within tolerance', `ratio=${result.diffRatio}, limit=${result.maximumDiffRatio}`);
  return result;
}

async function startServer() {
  const html = readFileSync(resolve(root, 'index.html'));
  const server = createServer((request, response) => {
    const path = new URL(request.url || '/', 'http://127.0.0.1').pathname;
    if (path === '/' || path === '/index.html') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : html);
      return;
    }
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('not found');
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  return { server, url: `http://127.0.0.1:${address.port}/` };
}

async function pointer(page, elementId, type, pointerId, x, y, isPrimary = true) {
  await page.evaluate(({ elementId, type, pointerId, x, y, isPrimary }) => {
    const target = document.getElementById(elementId);
    if (!target) throw new Error(`missing pointer target ${elementId}`);
    target.dispatchEvent(new PointerEvent(type, {
      pointerId,
      pointerType: 'touch',
      isPrimary,
      clientX: x,
      clientY: y,
      width: 18,
      height: 18,
      pressure: type === 'pointerup' || type === 'pointercancel' ? 0 : 0.65,
      button: 0,
      buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
      bubbles: true,
      cancelable: true,
      composed: true,
    }));
  }, { elementId, type, pointerId, x, y, isPrimary });
}

let localServer = null;
let browser = null;
let context = null;
let page = null;

try {
  let baseUrl = externalUrl;
  if (!baseUrl) {
    localServer = await startServer();
    baseUrl = localServer.url;
  }
  report.baseUrl = baseUrl;

  const browserType = browserName === 'chromium' ? chromium : webkit;
  browser = await browserType.launch({ headless: true });
  const profile = devices['iPhone SE (3rd gen)'];
  context = await browser.newContext({
    ...profile,
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    recordVideo: { dir: resolve(outputDir, 'video'), size: profile.viewport },
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('pageerror', (error) => report.errors.page.push(error.stack || error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.console.push(message.text());
  });
  page.on('requestfailed', (request) => report.errors.request.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' }));
  page.on('response', (response) => {
    if (response.status() >= 400) report.errors.http.push({ url: response.url(), status: response.status() });
  });

  const url = new URL(baseUrl);
  url.searchParams.set('e7test', '1');
  const entry = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => Boolean(window.__E7_TEST__), null, { timeout: 30000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__E7_TEST__), null, { timeout: 30000 });

  const device = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    dpr: devicePixelRatio,
    maxTouchPoints: navigator.maxTouchPoints,
    userAgent: navigator.userAgent,
    coarse: matchMedia('(pointer: coarse)').matches,
    portrait: matchMedia('(orientation: portrait)').matches,
    renderer: window.__E7_TEST__.snapshot().renderer,
    buildId: window.__E7_TEST__.info().buildId,
  }));
  report.device = device;
  check(entry?.status() === 200, 'entry responds successfully', `status=${entry?.status()}`);
  check(device.viewport.width === 375 && device.viewport.height === 667, 'iPhone SE 3 portrait viewport', JSON.stringify(device.viewport));
  check(device.dpr === 2, 'iPhone SE 3 DPR', `dpr=${device.dpr}`);
  check(device.maxTouchPoints > 0 && device.coarse && device.portrait, 'portrait touch surface is active', JSON.stringify(device));
  check(/Safari\//.test(device.userAgent) && /Mobile\//.test(device.userAgent), 'Safari mobile user agent is active', device.userAgent);
  check(device.renderer === 'webgl-3d' || device.renderer === 'canvas-2d', 'renderer initializes', `renderer=${device.renderer}`);

  const menuLayout = await page.evaluate(() => {
    const shell = document.getElementById('gameShell').getBoundingClientRect();
    const controls = ['beginButton', 'howButton', 'settingsButton'].map((id) => {
      const element = document.getElementById(id);
      const rect = element.getBoundingClientRect();
      return { id, width: rect.width, height: rect.height };
    });
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      shell: { left: shell.left, right: shell.right, top: shell.top, bottom: shell.bottom },
      controls,
    };
  });
  report.layout = menuLayout;
  check(menuLayout.documentWidth <= menuLayout.viewportWidth, 'menu has no horizontal page overflow', JSON.stringify(menuLayout));
  check(menuLayout.controls.every((control) => control.width >= 44 && control.height >= 44), 'visible menu controls meet 44 CSS px target', JSON.stringify(menuLayout.controls));

  await page.locator('#beginButton').tap();
  await page.waitForFunction(() => !document.getElementById('tutorialOverlay').hidden);
  await page.locator('#tutorialStartButton').tap();
  await page.waitForFunction(() => ['countdown', 'playing'].includes(window.__E7_TEST__.snapshot().mode));
  check(true, 'trusted menu and tutorial taps start a run', page.url());

  await page.evaluate(() => {
    window.__E7_TEST__.reset({ seed: 0xE0072026 });
    window.__E7_TEST__.setManualClock(true);
  });
  const canvasRect = await page.locator('#gameCanvas').boundingBox();
  const fireRect = await page.locator('#attackButton').boundingBox();
  const dashRect = await page.locator('#dashButton').boundingBox();
  if (!canvasRect || !fireRect || !dashRect) throw new Error('combat controls have no layout boxes');

  const before = await page.evaluate(() => window.__E7_TEST__.snapshot());
  const moveX = canvasRect.x + canvasRect.width * 0.20;
  const moveY = canvasRect.y + canvasRect.height * 0.78;
  await pointer(page, 'gameCanvas', 'pointerdown', 41, moveX, moveY, true);
  await pointer(page, 'gameCanvas', 'pointermove', 41, moveX + 8, moveY - 72, true);
  await pointer(page, 'attackButton', 'pointerdown', 42, fireRect.x + fireRect.width / 2, fireRect.y + fireRect.height / 2, false);
  await page.evaluate(() => window.__E7_TEST__.stepTicks(30));
  const during = await page.evaluate(() => window.__E7_TEST__.snapshot());
  await pointer(page, 'attackButton', 'pointerup', 42, fireRect.x + fireRect.width / 2, fireRect.y + fireRect.height / 2, false);
  await pointer(page, 'gameCanvas', 'pointerup', 41, moveX + 8, moveY - 72, true);
  const after = await page.evaluate(() => window.__E7_TEST__.snapshot());
  const moved = Math.hypot(after.player.x - before.player.x, after.player.y - before.player.y);
  report.interaction.simultaneousMoveFire = { before: before.player, during, after: after.player, moved };
  check(moved > 1, 'two-pointer movement moves the player', `distance=${moved.toFixed(3)}`);
  check(during.friendly > 0 && during.player.shotCooldown > 0, 'second pointer fires during movement', `friendly=${during.friendly}, cooldown=${during.player.shotCooldown}`);
  check(after.inputState.movePointerId === null && after.inputState.firePointerId === null && !after.inputState.fireHeld, 'pointer release clears movement and FIRE', JSON.stringify(after.inputState));

  const facingBefore = { x: after.player.facingX, y: after.player.facingY };
  const lookStartX = canvasRect.x + canvasRect.width * 0.72;
  const lookY = canvasRect.y + canvasRect.height * 0.48;
  await pointer(page, 'gameCanvas', 'pointerdown', 51, lookStartX, lookY, true);
  await pointer(page, 'gameCanvas', 'pointermove', 51, lookStartX + canvasRect.width * 0.14, lookY, true);
  await page.evaluate(() => window.__E7_TEST__.stepTicks(2));
  await pointer(page, 'gameCanvas', 'pointerup', 51, lookStartX + canvasRect.width * 0.14, lookY, true);
  const facingAfter = await page.evaluate(() => window.__E7_TEST__.snapshot().player);
  const facingDelta = Math.hypot(facingAfter.facingX - facingBefore.x, facingAfter.facingY - facingBefore.y);
  report.interaction.look = { before: facingBefore, after: { x: facingAfter.facingX, y: facingAfter.facingY }, delta: facingDelta };
  check(facingDelta > 0.02, 'right-side drag changes first-person aim', `delta=${facingDelta.toFixed(5)}`);

  await pointer(page, 'dashButton', 'pointerdown', 61, dashRect.x + dashRect.width / 2, dashRect.y + dashRect.height / 2, true);
  const dashQueued = await page.evaluate(() => window.__E7_TEST__.snapshot().inputState.dashQueued);
  await page.evaluate(() => window.__E7_TEST__.stepTicks(11));
  const dashEvidence = await page.evaluate(() => {
    const snapshot = window.__E7_TEST__.snapshot();
    const frames = [];
    for (let tick = Math.max(0, snapshot.tick - 12); tick < snapshot.tick; tick++) {
      frames.push(window.__E7_TEST__.tapes.currentFrame(tick));
    }
    return { found: frames.some((frame) => frame?.d === 1), frames };
  });
  await pointer(page, 'dashButton', 'pointerup', 61, dashRect.x + dashRect.width / 2, dashRect.y + dashRect.height / 2, true);
  report.interaction.dash = { queued: dashQueued, ...dashEvidence };
  check(dashQueued && dashEvidence.found, 'DASH pointer is recorded by the fixed update', JSON.stringify(report.interaction.dash));

  await page.locator('#pauseButton').tap();
  await page.waitForFunction(() => window.__E7_TEST__.snapshot().mode === 'paused');
  const paused = await page.evaluate(() => window.__E7_TEST__.snapshot());
  const pausedShot = resolve(outputDir, 'pause.png');
  await page.screenshot({ path: pausedShot });
  report.screenshots.pause = pausedShot.slice(root.length + 1);
  check(!paused.controlsVisible, 'trusted pause tap hides combat controls', JSON.stringify(paused));
  await page.locator('#resumeButton').tap();
  await page.waitForFunction(() => window.__E7_TEST__.snapshot().mode === 'playing');
  check((await page.evaluate(() => window.__E7_TEST__.snapshot().controlsVisible)), 'trusted resume tap restores combat controls', 'controls visible');

  await page.locator('#pauseButton').tap();
  await page.waitForFunction(() => window.__E7_TEST__.snapshot().mode === 'paused');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__E7_TEST__));
  const restored = await page.evaluate(() => window.__E7_TEST__.snapshot());
  report.interaction.reload = restored;
  check(restored.mode === 'paused' && restored.player !== null, 'same-tab reload restores the active run paused', `mode=${restored.mode}`);
  check(
    restored.inputState.movePointerId === null && restored.inputState.lookPointerId === null &&
      restored.inputState.firePointerId === null && restored.inputState.dashPointerId === null &&
      !restored.inputState.fireHeld && !restored.inputState.dashQueued,
    'reload releases every touch action',
    JSON.stringify(restored.inputState),
  );
  await page.locator('#resumeButton').tap();
  await page.waitForFunction(() => window.__E7_TEST__.snapshot().mode === 'playing');

  await page.evaluate(() => {
    window.__E7_TEST__.checkpoints.load('PERF_WORST');
    window.__E7_TEST__.setManualClock(false);
    window.__e7Frames = [];
    window.__e7FrameSampling = true;
    let previous = performance.now();
    const sample = (now) => {
      if (!window.__e7FrameSampling) return;
      window.__e7Frames.push(now - previous);
      previous = now;
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.waitForTimeout(3000);
  const soak = await page.evaluate(() => {
    window.__e7FrameSampling = false;
    return {
      frames: window.__e7Frames.slice(1),
      snapshot: window.__E7_TEST__.snapshot(),
      invariants: window.__E7_TEST__.assertInvariants(),
    };
  });
  report.soak = {
    samples: soak.frames.length,
    medianFrameGapMs: quantile(soak.frames, 0.5),
    p95FrameGapMs: quantile(soak.frames, 0.95),
    maximumFrameGapMs: soak.frames.length ? Math.max(...soak.frames) : null,
    mode: soak.snapshot.mode,
    renderer: soak.snapshot.renderer,
    triangles: soak.snapshot.triangles,
    metrics: soak.snapshot.metrics,
    invariants: soak.invariants,
  };
  check(soak.frames.length >= 30, 'automated stress play continues producing frames', `samples=${soak.frames.length}`);
  check((report.soak.p95FrameGapMs ?? Infinity) < 2000, 'runner frame-gap hang guard', `p95=${report.soak.p95FrameGapMs}`);
  check(soak.invariants.ok, 'stress checkpoint preserves game invariants', JSON.stringify(soak.invariants));
  check(soak.snapshot.triangles <= 50000, 'stress scene stays inside submitted-triangle guard', `triangles=${soak.snapshot.triangles}`);

  await page.evaluate(() => {
    window.__E7_TEST__.checkpoints.load('L2_ECHO_START');
    window.__E7_TEST__.stepTicks(90);
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: actualPath });
  report.screenshots.loop2 = actualPath.slice(root.length + 1);
  report.visualRegression = compareScreenshot();

  check(report.errors.page.length === 0, 'no page errors', `${report.errors.page.length} error(s)`);
  check(report.errors.console.length === 0, 'no console errors', `${report.errors.console.length} error(s)`);
  check(report.errors.request.length === 0, 'no failed requests', `${report.errors.request.length} failure(s)`);
  check(report.errors.http.length === 0, 'no HTTP error responses', `${report.errors.http.length} error response(s)`);
} catch (error) {
  report.failures.push(error.stack || error.message || String(error));
} finally {
  if (context) {
    try { await context.tracing.stop({ path: tracePath }); }
    catch (error) { report.failures.push(`trace: ${error.message}`); }
  }
  if (page) await page.close().catch(() => {});
  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
  if (localServer?.server) await new Promise((done) => localServer.server.close(done));
  report.status = report.failures.length ? 'failed' : 'passed';
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`[iphone-webkit] ${report.status.toUpperCase()}: ${report.failures.length} failure(s)`);
if (report.visualRegression?.diffRatio != null) console.log(`[iphone-webkit] visual diff ratio=${report.visualRegression.diffRatio}`);
for (const failure of report.failures) console.error(`- ${failure}`);
if (report.failures.length) process.exit(1);
