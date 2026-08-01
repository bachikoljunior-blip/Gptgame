# iPhone SE 3 automation checkpoint

Date: 2026-08-01 (Asia/Tokyo)
Branch: `agent/iphone-se3-automation`
Base: `ea0a90e9c53a20d45c5caf3dfb829e9a1078f17e` (`origin/main`)

Overall status: `complete_unverified`. Implementation, local surrogate checks, and the
first target Playwright WebKit evidence run are complete. The inspected WebKit baseline
is promoted; the corrected PR rerun, iOS Simulator Mobile Safari, merge, and deployment
remain open.

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
- PR #28 Quality run `30699678924` passed. Its first Pages/WebKit run `30699678903`
  exercised the full target WebKit interaction path with zero page, console, request, or
  HTTP errors and produced a healthy `750×1334` gameplay candidate. The run rejected two
  review conditions: the intentionally missing baseline and Linux WebKit reporting
  `navigator.maxTouchPoints=0` even though the Playwright iPhone profile has touch enabled,
  the coarse-pointer query is true, and real `tap()` calls succeeded.
- The candidate was visually inspected and promoted to
  `tests/baselines/iphone-se3-webkit-loop2.png` (SHA-256
  `00ee1ebe02a4897186c696864cbe0504ff8cdda7201b6319ad37f3bbb21e990a`). The harness now
  treats the descriptor, mobile flag, coarse pointer, and successful real taps as the
  emulated-touch contract while retaining `maxTouchPoints` only as a diagnostic; it does
  not spoof the browser value or claim physical multi-touch.
- The corrected harness plus promoted baseline passed locally in Chromium surrogate mode
  with zero failures and a `0.01298` visual-diff ratio.

Chromium is not counted as target WebKit or Mobile Safari evidence. The initial target
WebKit run is accepted as execution evidence but not a passing release gate; the corrected
target rerun and main-only Mobile Safari gate remain open.

## Explicit non-claims

The simulator does not measure physical GPU speed, thermal throttling, memory-pressure
reloads, actual hand reach, haptics, speakers, or audio latency. Automated frame gaps are
hang/regression guards, not physical-phone FPS. Those facts remain unmeasured and
non-blocking under the user's routine-device-check replacement instruction.
