# ECHO//SEVEN — Persistent Project Memory

Last updated: 2026-07-31 (Asia/Tokyo)
Session status: active; do not archive or finalize until the user explicitly ends the session.

## Project objective

Create the most compelling realistically achievable mobile-first game for the public GitHub repository bachikoljunior-blip/Gptgame, playable from its GitHub Pages URL. The game must be immediately understandable, replayable, polished, offline-capable after load, and dependable in mobile browsers. File layout is an implementation decision rather than a user constraint; the current single-file runtime is retained because it reduces deployment and loading failure modes.

## Current state

- Target repository resolved: bachikoljunior-blip/Gptgame (public, default branch main, initially empty, push/admin access available through the connected GitHub integration).
- Game direction selected: `ECHO//SEVEN`, a portrait action roguelite built around seven 15-second time loops.
- Each loop records the current player's movement and attacks. Earlier recordings replay as allied echoes, turning route planning into the primary strategy.
- Selected visual direction: midnight navy, icy white, acid-lime player/action highlights, coral danger indicators.
- Release candidate build `2026.07.31-c` exists in public/echo-seven.html and is prepared for repository-root index.html.
- Implemented: mobile controls, exact 900-tick loops, six replaying echoes, five ordinary enemy types, seeded wave schedules, three upgrade drafts, final boss and interrupt mechanic, score/best results, settings, procedural audio, haptics, reduced motion, pause/resume, versioned save parsing, adaptive effects, and guarded debug checkpoints.
- Three independent reviews (game logic, mobile UX, quality/release) completed. All confirmed Critical/High findings were fixed; no Critical defects were found.

## Completed work

- Compared three independently generated visual directions.
- Selected the most legible and mobile-appropriate direction.
- Defined initial product gates: explain the core mechanic within 30 seconds; produce meaningful escalation within one run; remain readable without sound; prevent accidental browser gestures; and retain strategic variation between runs.
- Implemented the canonical game in one self-contained HTML file with no external runtime assets.
- Added Node-based static/runtime checks that execute the inline game in a controlled browser-API harness.
- Passed 16 automated tests covering self-containment and syntax, fixed-step rules, loop recording, echo creation, boss spawn/clutch/tie behavior, seeded determinism, telegraph accuracy, rotation pause, keyboard activation, mobile HUD layout, idle rendering, stress entities, save sanitization, and upgrade validation.
- Fixed review findings: deterministic enemy sequencing on replay, boss telegraph/spawn alignment, loss priority on simultaneous core/boss destruction, removal of dead bosses before result rendering, DASHBURST split-child handling, unknown upgrade rejection, rotation pause, pause-menu keyboard behavior, HUD/control overlap, DASH contrast, phone-size HUD typography, and inactive-screen render throttling.

## Rejected or retained alternatives

- Cyan/magenta neon: retained as a reference for kinetic combat feedback, rejected as the main system because glow and color density reduce small-screen readability.
- Amber instrument panel: retained as a reference for tactile time-loop transitions, rejected as the main system because the muted palette and ornamental framing consume too much portrait space.
- External raster assets and remote dependencies: rejected for the first implementation. Canvas primitives and procedural audio improve portability, loading reliability, and iteration speed.

## Design decisions and reasoning

- One self-contained HTML is the canonical game implementation. GitHub Pages will serve it as root index.html.
- Portrait logical playfield targets approximately 480×800 and scales to the viewport. This supports phones while remaining playable on desktop.
- Primary control is drag-to-move with a dedicated DASH action; auto-fire removes the need for a second aiming stick and keeps tactical focus on recorded routes.
- Seven fixed-length loops give the title mechanical meaning and provide a readable run structure.
- Geometric silhouettes distinguish roles independently of color.
- Local-only save data stores settings, best results, aggregate run telemetry, and schema version. No network data collection.
- Seeded random generation will make runs varied while keeping failures reproducible.

## Architecture

- Repository index.html: canonical self-contained game (HTML, CSS, JavaScript, Canvas, procedural WebAudio).
- Repository .github/workflows/pages.yml: GitHub Pages deployment from main. It runs the full test gate, packages only the tested index.html, and deploys via official Pages actions.
- Repository tests/game-core.test.mjs: Node built-in test runner for source validity and guarded runtime checks.
- Repository package.json: dependency-free test command.
- Repository PROJECT_MEMORY.md: this continuous project record.
- Runtime layers inside the single HTML: input, fixed-step simulation, seeded RNG, entities, combat, loop recorder/replay, progression, UI state machine, render/audio/feedback, save/telemetry, and query-gated debug checkpoints.

## Dependencies

- Runtime game: browser platform APIs only; no external libraries or network assets.
- Deployment: GitHub Actions official Pages actions.
- Tests: Node built-in test runner only; no package dependencies.

## Acceptance criteria

- Opens and plays from a single local HTML file without a network connection.
- Primary loop, echo replay, upgrades, boss, win state, loss state, restart, pause, and local best result all function.
- Touch and pointer input do not scroll, zoom, select text, or remain stuck after interruption.
- Keyboard fallback supports desktop testing.
- All important threats are distinguishable by shape and telegraph, not color alone.
- Tutorial can be completed without reading long instructions.
- A run contains seven loops and meaningful upgrade decisions, with a plausible total duration of 3–6 minutes including menus.
- Save parsing survives missing, old, or corrupt data.
- Game pauses on visibility loss and resumes only through an explicit player action.
- Production build, automated tests, interactive playtest, regression review, and performance checks pass.
- Target rendering: 60 FPS on capable phones; stable 30 FPS minimum under the defined entity/particle budgets; DPR is capped and visual effects degrade safely.

## Known bugs

- No confirmed release-blocking game bug remains.
- The cloud browser blocked the local-only preview URL, so actual rendered interaction still needs verification from the published GitHub Pages URL. This is a verification gap, not a confirmed game bug.

## Technical debt

- Exact balance still requires real-device playtest tuning after the first published build.
- Debug checkpoint coverage is useful but not yet a full deterministic 6,300-tick golden-trace suite.
- Session checkpoint currently records diagnostic state but does not restore an interrupted run after a full page reload; UI does not claim that full reload recovery exists.
- DASH occupies a translucent lower-corner touch target over the arena. It meets the 78px minimum target but a later device playtest may justify a larger reserved gameplay-safe region.

## Successful patterns

- Select visual direction using direct mobile-legibility criteria instead of spectacle alone.
- Keep the standalone artifact and hosted experience on one canonical implementation.
- Use deterministic query-gated checkpoints for terminal-tick, boss, lifecycle, save, and stress-state regression tests.
- Separate enemy behavior sequencing from shared entity IDs so projectile counts cannot perturb seeded AI choices.

## Failed patterns

- Direct cloud-browser access to the local preview URL was refused by the browser environment. Do not retry that route; verify the deployed public URL instead.

## Discovered constraints

- Mobile browser audio requires a user gesture.
- Canvas must account for safe areas, dynamic viewport resizing, device pixel ratio, pointer cancellation, visibility changes, and reduced motion.
- Gameplay must remain usable without external files or services.

## Reusable utilities planned

- Seeded pseudo-random generator.
- Object pools for bullets and particles.
- Canvas scaling and safe-area mapper.
- Versioned, corruption-tolerant local save loader.
- Fixed-step simulation accumulator.
- Query-gated debug checkpoint API.

## Testing history

- 2026-07-31: inline JavaScript syntax check passed (1 script, no parse errors).
- 2026-07-31: GAME_HTML=public/echo-seven.html node --test tests/game-core.test.mjs passed 7/7 tests in approximately 0.13 seconds.
- 2026-07-31: three independent reviews found 0 Critical issues and reported 13 High candidates including duplicates; after deduplication and verification, all confirmed release blockers were fixed.
- 2026-07-31: expanded regression gate passed 16/16 tests in approximately 0.31 seconds on Node 22-compatible APIs.
- 2026-07-31: source scan found no external URL, fetch/XHR/WebSocket/sendBeacon, Cookie access, TODO, or FIXME marker in the game HTML.
- Browser rendering test on the local URL was unavailable due environment URL policy; source and runtime-harness tests continued.

## Performance history

- Release candidate size: approximately 112 KB uncompressed and 27 KB gzip-equivalent.
- Node runtime-harness checks complete quickly, but this does not measure real Canvas/GPU performance.
- Runtime caps: 80 enemies, 96 allied projectiles, 64 hostile projectiles, 180 particles, DPR/backing store limited to 1.5 million pixels.
- Adaptive quality reduces effect density and DPR after sustained slow-frame windows. Menu, pause, upgrade, and result screens render Canvas at about 12 FPS (2 FPS with reduced motion) while retaining responsive DOM controls.
- Real frame-time evidence remains required from the published build.

## Highest-impact next task

Publish the tested release candidate and project records to main, then verify the GitHub Actions run and public Pages URL through actual interaction.

## Future tasks

1. Publish the root game and GitHub Pages workflow to Gptgame.
2. Monitor the workflow and verify the final Pages URL.
3. Run live interaction and performance validation on the public build.
4. Tune balance and address any observed mobile-device defects in a later iteration.
