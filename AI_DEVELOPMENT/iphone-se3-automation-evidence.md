# iPhone SE 3 automation checkpoint

Date: 2026-08-01 (Asia/Tokyo)
Corrective branch: `agent/premerge-ios-gate`
Corrective base: `0aa981dfc4110811044876dbf5746239147e06a7` (`origin/main`)

Overall status: `complete_unverified`. PR #28 is merged and target Playwright WebKit is
verified. The first main Mobile Safari attempt failed before session creation because the
runner paired default Xcode 16.4 with an iOS 26.2 simulator; the corrective pre-merge
Safari run, ordered deployment, and final public verification remain open.

## Release path prepared

The existing `.github/workflows/pages.yml` now orders:

1. continuity/floor checks and all 51 deterministic tests;
2. Playwright WebKit with the iPhone SE (3rd generation) portrait descriptor at
   `375×667 / DPR 2`, including a required WebKit-generated visual baseline;
3. on PR and main candidates, Appium/XCUITest trusted touch in actual Mobile Safari on
   the matching iOS Simulator;
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

Chromium is not counted as target WebKit or Mobile Safari evidence. Corrected PR #28 run
`30700429788` passed the target WebKit gate against the reviewed baseline with a `0.01298`
(1.298%) visual-diff ratio; Quality run `30700429834` also passed. PR #28 was then
squash-merged as `0aa981dfc4110811044876dbf5746239147e06a7`.

The first main custom Pages run `30719618371` rebuilt and passed WebKit, then failed before
Mobile Safari existed. Its Appium log shows an iPhone SE (3rd generation) on iOS 26.2 was
driven with default Xcode 16.4; WebDriverAgent never opened port 8100, so this is neither a
game pass nor a game failure. Same-SHA legacy Pages run `30719617989` had already reported
successful publication, proving that a main-only Safari job cannot enforce ordering.

The corrective delivery runs Mobile Safari on PRs as well as main, pins
`/Applications/Xcode_26.2.app/Contents/Developer` to the iOS 26.2 runtime, raises WDA
startup to 180 seconds with three attempts, and records full Xcode output. Deploy remains
main-only and depends on deterministic/WebKit plus Safari. A cache-busted public fetch
after the failed custom run is byte-identical to `origin/main:index.html`, remains artifact
`69f72f7b` / build k, and independently passes 51/51.

PR #29 run `30724796112` then passed Quality and the required-baseline WebKit journey.
Its simulator selection and boot step also passed with the exact Xcode 26.2/iOS 26.2
pairing, but Appium session creation reached its separate default 120-second simulator
startup ceiling. No browser session or gameplay assertion existed in that failed job.
The retry sets `appium:simulatorStartupTimeout` to a bounded 300 seconds while retaining
the existing 180-second WDA launch budget and diagnostic logs; it remains a blocking
pre-merge check rather than being reclassified as success.

## Explicit non-claims

The simulator does not measure physical GPU speed, thermal throttling, memory-pressure
reloads, actual hand reach, haptics, speakers, or audio latency. Automated frame gaps are
hang/regression guards, not physical-phone FPS. Those facts remain unmeasured and
non-blocking under the user's routine-device-check replacement instruction.
