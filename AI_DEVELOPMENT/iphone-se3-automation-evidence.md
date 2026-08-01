# iPhone SE 3 automation checkpoint

Date: 2026-08-01 (Asia/Tokyo)
Branch: `agent/iphone-se3-automation`
Base: `ea0a90e9c53a20d45c5caf3dfb829e9a1078f17e` (`origin/main`)

Overall status: `complete_unverified`. Implementation and local surrogate checks are
complete; target Playwright WebKit and iOS Simulator Mobile Safari are
`prepared_not_executed`. No merge or deployment occurred.

## Release path prepared

The existing `.github/workflows/pages.yml` now orders:

1. continuity/floor checks and all 51 deterministic tests;
2. Playwright WebKit with the iPhone SE (3rd generation) portrait descriptor at
   `375×667 / DPR 2`, including a required WebKit-generated visual baseline;
3. on non-PR candidates, Appium/XCUITest trusted touch in actual Mobile Safari on the
   matching iOS Simulator;
4. only then, the existing content-addressed Pages candidate, public revision check, and
   automatic restoration path.

Each browser gate retains screenshots, video, trace or Appium logs, and a JSON report.

Pinned test dependencies were inspected from installed/npm metadata: Playwright 1.56.1 is
Apache-2.0, pixelmatch 7.2.0 is ISC, pngjs 7.0.0 is MIT, and Appium 3.6.0 plus the XCUITest
driver 12.1.3 are Apache-2.0 and accept the workflow's Node 22/npm 10+ runtime.

## Executed evidence

- `npm test`: `51/51` passed after reconciling the automation changes onto build k.
- `npm run test:continuity`: passed with objective
  `iphone-se3-automation-2026-08-01`.
- The full Playwright harness passed with `E7_BROWSER=chromium` as a local surrogate:
  `375×667`, DPR 2, touch/coarse pointer, first-run menu/tutorial taps, two-pointer
  movement plus FIRE, aim drag, DASH recording, pause/resume, same-tab paused reload with
  cleared input, worst-case stress invariants, submitted-triangle guard, non-flat image,
  and zero page/console/request/HTTP failures.
- Level C negative probe: `E7_REQUIRE_BASELINE=1` rejected the missing target baseline and
  emitted `test-results/iphone-webkit/iphone-se3-webkit-baseline-candidate.png` for later
  promotion to `tests/baselines/iphone-se3-webkit-loop2.png`.
- Level C negative probe: the iOS harness rejected a run with no
  `IOS_SIMULATOR_UDID` before creating a session.
- `FLOOR_RANGE_FILES=... npm run gate:floor`: Level C review digest matched the governed
  tree.

Chromium is not counted as target WebKit or Mobile Safari evidence. The target gates remain
open until GitHub Actions executes them and the first WebKit baseline is promoted.

## Explicit non-claims

The simulator does not measure physical GPU speed, thermal throttling, memory-pressure
reloads, actual hand reach, haptics, speakers, or audio latency. Automated frame gaps are
hang/regression guards, not physical-phone FPS. Those facts remain unmeasured and
non-blocking under the user's routine-device-check replacement instruction.
