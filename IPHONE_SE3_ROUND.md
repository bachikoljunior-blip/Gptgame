# The iPhone SE 3 round

Two tiers of automated phone testing, plus the comparison step that turns them into a round.

## What already existed, and what was added

| Tier | What it proves | Where it lives here | Status |
|---|---|---|---|
| 1 — Playwright WebKit, ubuntu | 375×667 portrait, DPR 2, touch, Mobile Safari UA, layout, two-pointer move-and-fire, pause/resume, reload restore, stress soak, screenshot diff | `tools/test-iphone-webkit.mjs`, run by `.github/workflows/pages.yml` | already on `main` |
| 2 — iPhone SE 3 simulator + Appium, macOS | the same paths in real iOS Safari with trusted multi-touch | `tools/test-ios-safari.mjs`, run by the `ios-safari` job in `pages.yml` | already on `main`; PR #29 tightens it |
| 3 — round comparison | that this round is not **worse** than the last one | `.kit/tools/compare-round.mjs` + `iphone-se3-round.config.json`, run by `.github/workflows/iphone-se3-round.yml` | added |

Tier 3 is the part that was missing. Tiers 1 and 2 judge the current run against fixed limits
— a frame-gap hang guard at 2000 ms, a diff ratio at 0.30, a 50 000-triangle ceiling. Those
catch a build that broke. None catches a build that got worse: p95 frame gap climbing from
18 ms to 39 ms passes every one, because every one was set loose enough not to flake.

## Running one round

```bash
npm run round:iphone            # drive the phone surface, then judge it against the record
npm run round:iphone:selftest   # watch every refusal fire on a deliberately broken round
```

First time there is nothing to compare against, and the comparison says so rather than
passing:

```bash
node .kit/tools/compare-round.mjs --config=iphone-se3-round.config.json --bootstrap
git add tests/baselines/iphone-se3-round.json
```

When a round is slower on purpose — a feature landed and its cost was reviewed — record the
decision instead of silencing it: `--accept`.

## One thing this repository has to fix first

The harness samples frame gaps but **never measures boot time**, and load time is half of what
a round is for. `timings.bootMs` is declared `required` in the config, so until the harness
wraps its boot wait in `Date.now()` and writes the elapsed milliseconds, the round reports
`INCOMPARABLE` and names the missing measurement. That is deliberate: a green round that
measured no load time at all is the failure mode this whole layer exists to refuse.

## What the comparison refuses to do

Each refusal is a failure already on record across these repositories:

- **Compare a round against itself** — a sibling repository shipped an equivalence battery
  that compared its validator against its own output and passed vacuously.
- **Treat a metric that vanished as a metric that passed** — a silently inert gate and a
  passing gate both print nothing and exit 0.
- **Accept byte-identical timings as a new measurement** — two real runs do not reproduce
  milliseconds exactly; if every metric matches, the report was copied.
- **Score a failed run** — a harness that aborted at step three reports a very fast boot.
- **Return a pass when nothing was compared.**

## What none of this is evidence for

Playwright reproduces the viewport, DPR, touch emulation and user agent of an iPhone SE 3. It
runs on a datacentre CPU with a software rasteriser and reproduces none of the phone's
performance: measured in the same container, a sibling repository's harness under the
SwiftShader surrogate reported a **1333 ms median frame gap — 0.75 FPS**. The simulator tier
is closer, because it is real iOS and real Safari, but it is still a Mac.

Neither tier may be cited for sustained 30 FPS on the device, thermal throttling, memory
pressure causing a Safari tab reload, GPU load, real-glass multi-touch, or audio latency.
Those need the physical phone. The comparison exists precisely because the absolute number is
unavailable and the relative one is not.
