#!/usr/bin/env node

/**
 * High-fidelity browser gate for ECHO//SEVEN.
 *
 * Appium/XCUITest drives Mobile Safari on an iPhone SE (3rd generation) iOS
 * Simulator. This is real iOS/Safari behavior, but not evidence for physical
 * GPU speed, heat, memory pressure, hardware touch, haptics, or audio latency.
 */

import { createServer, request as httpRequest } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = resolve(root, process.env.E7_IOS_OUTPUT || 'test-results/ios-safari');
const reportPath = resolve(outputDir, 'report.json');
const steadyPath = resolve(outputDir, 'ios-safari-loop2.png');
const pausePath = resolve(outputDir, 'ios-safari-pause.png');
const appiumUrl = new URL(process.env.APPIUM_URL || 'http://127.0.0.1:4723/');
const externalUrl = process.env.E7_TEST_URL || '';
const udid = process.env.IOS_SIMULATOR_UDID || '';
const platformVersion = process.env.IOS_SIMULATOR_PLATFORM_VERSION || '';
const timeout = Number(process.env.E7_IOS_TIMEOUT || 240000);

mkdirSync(outputDir, { recursive: true });

const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  target: 'iPhone SE (3rd generation) iOS Simulator / Mobile Safari / portrait',
  checks: [],
  interaction: {},
  errors: [],
  failures: [],
  status: 'running',
};

function check(condition, name, detail) {
  const passed = Boolean(condition);
  report.checks.push({ name, passed, detail });
  if (!passed) report.failures.push(`${name}: ${detail}`);
  return passed;
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
  await new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', done);
  });
  const address = server.address();
  return { server, url: `http://127.0.0.1:${address.port}/` };
}

async function waitForHttp(url, waitMs = 60000) {
  const deadline = Date.now() + waitMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(`endpoint did not become reachable: ${lastError?.message || 'timeout'}`);
}

async function webdriver(pathname, { method = 'POST', body } = {}) {
  const url = new URL(pathname.replace(/^\//, ''), appiumUrl);
  const encoded = body === undefined ? '' : JSON.stringify(body);
  const response = await new Promise((resolveRequest, rejectRequest) => {
    const request = httpRequest(url, {
      method,
      headers: body === undefined ? undefined : {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(encoded),
      },
    }, (incoming) => {
      let text = '';
      incoming.setEncoding('utf8');
      incoming.on('data', (chunk) => { text += chunk; });
      incoming.on('end', () => resolveRequest({ ok: incoming.statusCode >= 200 && incoming.statusCode < 300, status: incoming.statusCode, text }));
    });
    request.setTimeout(900000, () => request.destroy(new Error(`WebDriver ${method} ${pathname} exceeded 15 minutes`)));
    request.on('error', rejectRequest);
    if (encoded) request.write(encoded);
    request.end();
  });
  const text = response.text;
  let payload;
  try { payload = text ? JSON.parse(text) : {}; }
  catch { payload = { value: text }; }
  if (!response.ok || payload?.value?.error) {
    throw new Error(`WebDriver ${method} ${pathname}: ${payload?.value?.message || payload?.value || `HTTP ${response.status}`}`);
  }
  return payload.value;
}

let sessionId = '';
const sessionPath = (suffix = '') => `session/${sessionId}${suffix}`;
const execute = (script, args = []) => webdriver(sessionPath('/execute/sync'), { body: { script, args } });

async function waitForScript(script, waitMs = 30000) {
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    try {
      const value = await execute(script);
      if (value) return value;
    } catch (error) {
      report.errors.push(`poll: ${error.message}`);
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error(`Safari condition timed out: ${script.slice(0, 120)}`);
}

async function performActions(actions) {
  await webdriver(sessionPath('/actions'), { body: { actions } });
  await webdriver(sessionPath('/actions'), { method: 'DELETE' }).catch(() => {});
}

const WEB_ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

async function clickElement(selector) {
  const element = await webdriver(sessionPath('/element'), {
    body: { using: 'css selector', value: selector },
  });
  const id = element?.[WEB_ELEMENT_KEY] || element?.ELEMENT;
  if (!id) throw new Error(`Safari did not resolve element: ${selector}`);
  await webdriver(sessionPath(`/element/${encodeURIComponent(id)}/click`), { body: {} });
}

function finger(id, actions) {
  return { type: 'pointer', id, parameters: { pointerType: 'touch' }, actions };
}

const move = (x, y, duration = 0) => ({ type: 'pointerMove', duration, x: Math.round(x), y: Math.round(y), origin: 'viewport' });
const down = () => ({ type: 'pointerDown', button: 0 });
const up = () => ({ type: 'pointerUp', button: 0 });
const pause = (duration) => ({ type: 'pause', duration });

async function tap(x, y) {
  await performActions([finger(`tap-${Date.now()}`, [move(x, y), down(), pause(90), up()])]);
}

async function screenshot(path) {
  const encoded = await webdriver(sessionPath('/screenshot'), { method: 'GET' });
  writeFileSync(path, Buffer.from(encoded, 'base64'));
}

async function injectErrorCapture() {
  await execute(`
    window.__e7IosErrors = [];
    window.addEventListener('error', function (event) {
      window.__e7IosErrors.push(String(event.message || 'error'));
    });
    window.addEventListener('unhandledrejection', function (event) {
      window.__e7IosErrors.push(String(event.reason || 'unhandled rejection'));
    });
    return true;
  `);
}

let localServer = null;

try {
  if (!udid) throw new Error('IOS_SIMULATOR_UDID is required');
  if (!platformVersion) throw new Error('IOS_SIMULATOR_PLATFORM_VERSION is required');
  let baseUrl = externalUrl;
  if (!baseUrl) {
    localServer = await startServer();
    baseUrl = localServer.url;
  }
  report.baseUrl = baseUrl;
  await waitForHttp(baseUrl);
  await waitForHttp(new URL('status', appiumUrl), 90000);

  const created = await webdriver('session', {
    body: {
      capabilities: {
        alwaysMatch: {
          platformName: 'iOS',
          browserName: 'Safari',
          'appium:automationName': 'XCUITest',
          'appium:deviceName': 'iPhone SE (3rd generation)',
          'appium:udid': udid,
          'appium:platformVersion': platformVersion,
          'appium:noReset': true,
          'appium:newCommandTimeout': 300,
          'appium:safariAllowPopups': true,
          'appium:includeSafariInWebviews': true,
          'appium:safariInitialUrl': baseUrl,
          'appium:webviewConnectTimeout': 120000,
          'appium:webviewConnectRetries': 20,
          'appium:simulatorStartupTimeout': 300000,
          'appium:wdaLaunchTimeout': 180000,
          'appium:wdaStartupRetries': 3,
          'appium:wdaStartupRetryInterval': 10000,
          'appium:showXcodeLog': true,
        },
        firstMatch: [{}],
      },
    },
  });
  sessionId = created?.sessionId || '';
  if (!sessionId) {
    const sessions = await webdriver('sessions', { method: 'GET' });
    sessionId = sessions?.at?.(-1)?.id || '';
  }
  if (!sessionId) throw new Error('Appium did not return a session id');

  await webdriver(sessionPath('/orientation'), { body: { orientation: 'PORTRAIT' } });
  const url = new URL(baseUrl);
  url.searchParams.set('e7test', '1');
  await webdriver(sessionPath('/url'), { body: { url: url.href } });
  await waitForScript('return Boolean(window.__E7_TEST__);', timeout);
  await execute('localStorage.clear(); return true;');
  await webdriver(sessionPath('/refresh'), { body: {} });
  await waitForScript('return Boolean(window.__E7_TEST__);', 60000);
  await injectErrorCapture();

  const device = await execute(`
    var snapshot = window.__E7_TEST__.snapshot();
    return {
      viewport: { width: innerWidth, height: innerHeight },
      visualViewport: window.visualViewport ? { width: visualViewport.width, height: visualViewport.height } : null,
      dpr: devicePixelRatio,
      maxTouchPoints: navigator.maxTouchPoints,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      coarse: matchMedia('(pointer: coarse)').matches,
      portrait: matchMedia('(orientation: portrait)').matches,
      renderer: snapshot.renderer,
      buildId: snapshot.buildId,
      triangles: snapshot.triangles
    };
  `);
  report.device = device;
  check(device.viewport.width === 375, 'iPhone SE 3 portrait width', JSON.stringify(device.viewport));
  check(device.viewport.height >= 500 && device.viewport.height <= 667, 'Mobile Safari portrait height', JSON.stringify(device.viewport));
  check(device.dpr === 2, 'iPhone SE 3 DPR', `dpr=${device.dpr}`);
  check(device.maxTouchPoints > 0 && device.coarse && device.portrait, 'portrait touch surface is active', JSON.stringify(device));
  check(/Safari\//.test(device.userAgent) && /Mobile\//.test(device.userAgent), 'actual Mobile Safari user agent is active', device.userAgent);
  check(device.renderer === 'webgl-3d' || device.renderer === 'canvas-2d', 'renderer initializes in Safari', `renderer=${device.renderer}`);
  check(device.triangles <= 50000, 'initial submitted-triangle guard holds', `triangles=${device.triangles}`);

  const layout = await execute(`
    function rect(id) {
      var r = document.getElementById(id).getBoundingClientRect();
      return { id: id, x: r.x, y: r.y, width: r.width, height: r.height };
    }
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      begin: rect('beginButton'),
      how: rect('howButton'),
      settings: rect('settingsButton')
    };
  `);
  report.layout = layout;
  check(layout.documentWidth <= layout.viewportWidth, 'menu has no horizontal overflow', JSON.stringify(layout));
  check([layout.begin, layout.how, layout.settings].every((item) => item.width >= 44 && item.height >= 44), 'menu controls meet 44 CSS px target', JSON.stringify(layout));

  await clickElement('#beginButton');
  await waitForScript("return !document.getElementById('tutorialOverlay').hidden;", 10000);
  await clickElement('#tutorialStartButton');
  await waitForScript(`return ['countdown','playing'].indexOf(window.__E7_TEST__.snapshot().mode) >= 0;`, 10000);
  check(true, 'trusted Safari taps start the first run', url.href);

  await execute(`window.__E7_TEST__.reset({seed: 0xE0072026}); window.__E7_TEST__.setManualClock(false); return true;`);
  const controls = await execute(`
    function rect(id) { var r = document.getElementById(id).getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; }
    return {canvas:rect('gameCanvas'), fire:rect('attackButton'), dash:rect('dashButton')};
  `);
  const before = await execute('return window.__E7_TEST__.snapshot();');
  const moveStartX = controls.canvas.x + controls.canvas.width * 0.20;
  const moveStartY = controls.canvas.y + controls.canvas.height * 0.78;
  const fireX = controls.fire.x + controls.fire.width / 2;
  const fireY = controls.fire.y + controls.fire.height / 2;
  await performActions([
    finger('move-thumb', [move(moveStartX, moveStartY), down(), move(moveStartX + 6, moveStartY - 70, 350), pause(0), pause(0), pause(700), up()]),
    finger('fire-thumb', [pause(0), pause(0), pause(350), move(fireX, fireY), down(), pause(700), up()]),
  ]);
  await new Promise((done) => setTimeout(done, 250));
  const after = await execute('return window.__E7_TEST__.snapshot();');
  const moved = Math.hypot(after.player.x - before.player.x, after.player.y - before.player.y);
  report.interaction.simultaneousMoveFire = { before: before.player, after, moved };
  check(moved > 1, 'trusted two-thumb movement moves the player', `distance=${moved.toFixed(3)}`);
  check(after.recorderLength > before.recorderLength && after.metrics.manualShots > 0, 'trusted second thumb fires during movement', `recorder=${after.recorderLength}, shots=${after.metrics.manualShots}`);
  check(after.inputState.movePointerId === null && after.inputState.firePointerId === null && !after.inputState.fireHeld, 'trusted touch release clears movement and FIRE', JSON.stringify(after.inputState));

  const facingBefore = { x: after.player.facingX, y: after.player.facingY };
  const lookStartX = controls.canvas.x + controls.canvas.width * 0.72;
  const lookY = controls.canvas.y + controls.canvas.height * 0.48;
  await performActions([finger('look-thumb', [move(lookStartX, lookY), down(), move(lookStartX + controls.canvas.width * 0.14, lookY, 450), up()])]);
  await new Promise((done) => setTimeout(done, 250));
  const facingAfter = await execute('return window.__E7_TEST__.snapshot().player;');
  const facingDelta = Math.hypot(facingAfter.facingX - facingBefore.x, facingAfter.facingY - facingBefore.y);
  report.interaction.look = { before: facingBefore, after: { x: facingAfter.facingX, y: facingAfter.facingY }, delta: facingDelta };
  check(facingDelta > 0.02, 'trusted right-side drag changes aim', `delta=${facingDelta.toFixed(5)}`);

  const dashX = controls.dash.x + controls.dash.width / 2;
  const dashY = controls.dash.y + controls.dash.height / 2;
  await clickElement('#dashButton');
  await new Promise((done) => setTimeout(done, 250));
  const dashEvidence = await execute(`
    var snapshot = window.__E7_TEST__.snapshot();
    var found = false;
    for (var tick = Math.max(0, snapshot.tick - 30); tick < snapshot.tick; tick += 1) {
      var frame = window.__E7_TEST__.tapes.currentFrame(tick);
      if (frame && frame.d === 1) found = true;
    }
    return {found:found,tick:snapshot.tick};
  `);
  report.interaction.dash = dashEvidence;
  check(dashEvidence.found, 'trusted DASH tap is recorded', JSON.stringify(dashEvidence));

  await clickElement('#pauseButton');
  await waitForScript(`return window.__E7_TEST__.snapshot().mode === 'paused';`, 10000);
  const paused = await execute('return window.__E7_TEST__.snapshot();');
  await screenshot(pausePath);
  check(!paused.controlsVisible, 'trusted pause tap freezes and hides controls', JSON.stringify(paused));
  await clickElement('#resumeButton');
  await waitForScript(`return window.__E7_TEST__.snapshot().mode === 'playing';`, 10000);
  check(await execute('return window.__E7_TEST__.snapshot().controlsVisible;'), 'trusted resume tap restores controls', 'controls visible');

  await clickElement('#pauseButton');
  await waitForScript(`return window.__E7_TEST__.snapshot().mode === 'paused';`, 10000);
  const preReloadErrors = await execute('return (window.__e7IosErrors || []).slice();');
  report.errors.push(...preReloadErrors);
  await webdriver(sessionPath('/refresh'), { body: {} });
  await waitForScript('return Boolean(window.__E7_TEST__);', 60000);
  await injectErrorCapture();
  const restored = await execute('return window.__E7_TEST__.snapshot();');
  report.interaction.reload = restored;
  check(restored.mode === 'paused' && restored.player !== null, 'Safari reload restores the run paused', `mode=${restored.mode}`);
  check(
    restored.inputState.movePointerId === null && restored.inputState.lookPointerId === null &&
      restored.inputState.firePointerId === null && restored.inputState.dashPointerId === null &&
      !restored.inputState.fireHeld && !restored.inputState.dashQueued,
    'Safari reload releases every touch action',
    JSON.stringify(restored.inputState),
  );

  await execute(`window.__E7_TEST__.checkpoints.load('PERF_WORST'); window.__E7_TEST__.setManualClock(false); return true;`);
  await new Promise((done) => setTimeout(done, 3000));
  const stress = await execute(`return {snapshot:window.__E7_TEST__.snapshot(),invariants:window.__E7_TEST__.assertInvariants()};`);
  report.stress = stress;
  check(stress.invariants.ok, 'Safari stress checkpoint preserves invariants', JSON.stringify(stress.invariants));
  check(stress.snapshot.triangles <= 50000, 'Safari stress submitted-triangle guard holds', `triangles=${stress.snapshot.triangles}`);

  await execute(`window.__E7_TEST__.checkpoints.load('L2_ECHO_START'); window.__E7_TEST__.stepTicks(90); return true;`);
  await new Promise((done) => setTimeout(done, 250));
  await screenshot(steadyPath);
  const errors = await execute('return (window.__e7IosErrors || []).slice();');
  report.errors.push(...errors);
  check(preReloadErrors.length === 0 && errors.length === 0, 'no captured Safari runtime errors', JSON.stringify({ preReloadErrors, errors }));
} catch (error) {
  report.failures.push(error.stack || error.message || String(error));
} finally {
  if (sessionId) await webdriver(sessionPath(), { method: 'DELETE' }).catch((error) => report.errors.push(`session cleanup: ${error.message}`));
  if (localServer?.server) await new Promise((done) => localServer.server.close(done));
  report.status = report.failures.length ? 'failed' : 'passed';
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`[ios-safari] ${report.status.toUpperCase()}: ${report.failures.length} failure(s)`);
for (const failure of report.failures) console.error(`- ${failure}`);
if (report.failures.length) process.exit(1);
