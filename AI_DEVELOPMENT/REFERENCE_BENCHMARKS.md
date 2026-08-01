# ECHO//SEVEN — Element Reference Benchmarks

Status date: 2026-08-01 (Asia/Tokyo)

Selection status: `complete_verified` against the sources listed below

Direct side-by-side gameplay comparison: `prepared_not_executed`

Physical-phone comparison: `prepared_not_executed`

## Authority and update rule

The user's latest explicit game concept is always authoritative. This file converts that concept into a small set of element-specific reference works and review criteria; it does not replace the concept or authorize copying.

When the concept changes:

1. update only the affected concept clauses, elements, references, and criteria;
2. preserve unaffected requirements and verified evidence;
3. replace a reference only when it no longer fits and the replacement has equal or better evidence and applicability;
4. never lower a criterion to make the current implementation pass;
5. record what changed and why in `AI_DEVELOPMENT/STATE.yaml`.

## Current concept

Repository evidence baseline: main `b6c6a495fe52891d450f9b21a036ebb512a0a334` (state/benchmark checkpoint), public artifact `197e0c47b7b78e663969ffe530c8493497c3311129ada2dba77fbaa851de1882`, product build `2026.08.01-f`. Candidate build `2026.08.01-g`, artifact `47d85a25222acbfab21a91448f6dc72bef6a54e091e91f34a73a58a0dc3a80ec`, repairs the first defect found by the browser pass below and remains unpublished until its delivery checks complete.

ECHO//SEVEN is a portrait, mobile-first, first-person 3D action roguelite for a self-contained browser runtime. A run has seven 15-second loops. Movement, aim, manual shots, and DASH events from each loop are replayed by allied echoes in later loops. The player defends a core, chooses one of three upgrades after loops 2, 4, and 6, and fights SEPTAGON with six echoes in loop 7.

The product priorities that control benchmark selection are:

- immediate two-thumb touch control on small phones;
- exact and understandable time-loop causality;
- readable first-person combat, threat telegraphs, and enemy roles;
- meaningful short-run upgrade choices;
- a unified geometric visual language that works without external runtime assets;
- useful sound, haptics, and muted-play feedback;
- deterministic behavior, graceful Canvas fallback, local recovery, and stable 30 FPS minimum with 60 FPS on capable phones.

## Elements intentionally excluded

No reference is selected for open-world exploration, world building, story, dialogue, characters, factions, quests, narrative choices, inventory, loot rarity, multiplayer, or monetization. Those are not part of the current concept. Their omission is deliberate, not a quality gap. If the user adds one of them, select a reference only for the newly active element.

## Minimal reference set

| Reference work | Primary elements | Why it fits | Deliberate limits |
|---|---|---|---|
| **Lemnis Gate** | loop structure, persistent prior actions, causal readability, route planning | Its short FPS turns retain earlier actions, making it the closest concrete reference for understanding overlapping recorded behavior. OpenCritic recorded an 80 average and “Strong” rating from 21 critics. | It is not a live-service, stability, visual-style, business, or scope reference. It was delisted and its online servers closed; use official descriptions and preserved footage only. Do not copy operatives, maps, objectives, round rules, or presentation. |
| **SUPERHOT** | visual hierarchy, threat/background separation, time-state communication, concise feedback | Its first-person encounters use a deliberately restricted visual language so state and danger remain readable. The official description centers one clear time mechanic; Steam's English-review snapshot was 90% positive across 16,200 reviews on 2026-08-01. | Do not copy its white/red/black palette, crystalline characters, typography, level layouts, slow-time rule, replay treatment, or fiction. It is not the movement-speed or touch-control reference. |
| **Gunfire Reborn / Gunfire Reborn Mobile** | FPS combat loop, movement/camera feel, enemy-role differentiation, roguelite upgrade synergy, boss readability | Official materials define it as an FPS/roguelite/RPG with distinct heroes, random weapons, and build combinations; an official mobile version exists. Steam's English-review snapshot was 95% positive across 36,639 reviews on 2026-08-01. | Do not copy heroes, weapons, scrolls, levels, low-poly art, loot structure, or long-run progression. ECHO//SEVEN needs only the transferable combat and build-choice principles appropriate to a 3–6 minute run. |
| **Call of Duty: Mobile** | touch controls, camera handling, HUD hierarchy, input customization principles, enemy visibility, scalable mobile presentation | Activision documents a touch HUD with customizable controls, and later added separate graphics settings plus stronger enemy outlining. Metacritic's 2026-08-01 snapshot records an 81 critic score and 7.0 user score. Its long-running phone-first deployment makes it the most applicable reference for two-thumb input and device-aware presentation. | Do not copy HUD layout, icons, maps, weapons, modes, branding, monetization, aim automation, or content density. It is a touch and mobile-operability validator, not the creative direction or scope target. |

The four works are not averaged into a single style. Each owns only the elements listed above. If two works apply, the first named below is the primary design reference and the second is a constrained validator.

## Element mapping and acceptance criteria

### 1. Time loop and echoes

Primary reference: **Lemnis Gate**. Visual-state validator: **SUPERHOT**.

Pass criteria:

- every completed loop creates exactly one 900-tick recording and later loops reproduce its route, facing, manual-fire ticks, and DASH events deterministically;
- current player, each echo, enemy threats, spawn previews, and the protected core remain distinguishable by shape or motion as well as color;
- a loop transition makes “what was recorded”, “what now replays”, and “what changed” understandable without a long text explanation;
- damage, failure, boss interruption, and final-tick outcomes can be traced to observable current or recorded actions;
- visual additions never obscure the causal order or make an echo look like live player input.

Evidence required: deterministic trace and checkpoint tests; captured loop-1/loop-2/boss footage; a fresh-viewer explanation check. The first exists. Footage and fresh-viewer checks are `prepared_not_executed`.

### 2. Combat, movement, and camera

Primary reference: **Gunfire Reborn Mobile**. Touch validator: **Call of Duty: Mobile**.

Pass criteria:

- movement, yaw, FIRE, and DASH respond on the next eligible fixed update and never remain active after cancellation, pause, rotation, backgrounding, or restoration;
- movement plus aim plus FIRE or DASH is practical with two thumbs and never requires a third ordinary-combat touch;
- crosshair, first-person camera, muzzle plane, projectile direction, target response, and cardinal directions agree;
- shots never occur without explicit input; hold cadence and cooldown feedback are predictable;
- enemy contact, projectiles, spawn telegraphs, boss charge, hit confirmation, kill confirmation, and DASH invulnerability are visually and audibly separable;
- motion, shake, glow, and particles reinforce impact without hiding the target or destabilizing aim.

Evidence required: existing pointer/camera/golden-trace checks plus a physical-phone feel pass. Automated behavior is `complete_verified`; physical feel is `prepared_not_executed`.

### 3. Enemy behavior and boss communication

Primary reference: **Gunfire Reborn**. Clarity validator: **SUPERHOT**.

Pass criteria:

- each enemy role is identifiable before it deals damage by silhouette, path, animation, spawn language, or projectile pattern—not color alone;
- deterministic AI remains learnable without becoming identical in tactical effect on every seed;
- SEPTAGON telegraphs its location and charge window before the consequence, and the visual, audio, HUD, and actual collision timing agree;
- the player can identify the highest-priority threat during the stress checkpoint without reading internal labels;
- additional behavior may increase tactical choice, but may not exceed entity, triangle, allocation, or frame-time budgets.

Evidence required: seeded replay, telegraph-alignment, stress, and boss-clutch tests plus checkpoint footage. Tests are `complete_verified`; footage comparison is `prepared_not_executed`.

### 4. Upgrades and short-run progression

Primary reference: **Gunfire Reborn**.

Pass criteria:

- each draft presents one weapon, one echo, and one survival option when valid, with three unique choices;
- title, glyph, and one short description communicate the changed behavior before selection;
- options create materially different routes or timing decisions rather than only larger numbers;
- selected effects are visible or audible during play and remain compatible with echo replay;
- no option silently invalidates the core 15-second planning loop or makes another category irrelevant.

Evidence required: unique-offer and validation tests, deterministic seeded runs with representative builds, and a playtest choice log. Static validity is `complete_verified`; comparative build quality is `prepared_not_executed`.

### 5. UI, tutorial, and touch layout

Primary reference: **Call of Duty: Mobile**. Minimal-hierarchy validator: **SUPERHOT**.

Pass criteria:

- primary action targets remain at least 44 CSS px, respect safe areas, do not overlap HUD or each other, and mirror coherently in left-handed mode;
- the title, tutorial, pause, upgrades, result, and diagnostics have a clear first/second/third reading order at 320–480 CSS px widths;
- ordinary instructional and decision text is not forced into 9–11 px type on the target phone;
- cooldown, target state, health/core state, time remaining, loop count, echo count, and boss charge use distinct shapes, positions, or motion as well as color;
- browser scrolling, zooming, selection, callouts, and stuck pointers do not interrupt play;
- a new player can begin, move, aim, fire, DASH, understand the next echo, and pause without outside instructions.

Evidence required: DOM/CSS assertions, production pointer tests, 320/375/480-width captures, and first-run observation. Automated layout/input checks are `complete_verified`; captures and observation are `prepared_not_executed`.

### 6. Visuals, animation, and transitions

Primary reference: **SUPERHOT**. Mobile visibility validator: **Call of Duty: Mobile**.

Pass criteria:

- ECHO//SEVEN retains its original midnight-navy, icy-white, acid-lime, coral, and cyan identity; no benchmark palette or recognizable composition is copied;
- geometry, light, fog, emission, outline, depth, and motion establish a readable foreground/midground/background hierarchy;
- player actions, echo actions, enemy threats, core damage, loop rewind, upgrade choice, victory, and defeat each have a distinct beginning, peak, and recovery state;
- high and reduced quality modes preserve gameplay information even when decorative density, DPR, or particles fall;
- Canvas fallback communicates the same mandatory states even when it cannot match WebGL richness.

Evidence required: matched captures from menu, loop 1, loop 2, boss charge, victory/defeat, reduced quality, and Canvas fallback. Direct visual comparison is `prepared_not_executed`; no visual pass may be called benchmark-complete before it exists.

### 7. Audio and haptics

Primary reference: **SUPERHOT** for economical state cues. Combat-role validator: **Gunfire Reborn**.

Pass criteria:

- FIRE, DASH, player hit, kill, core hit, loop transition, upgrade, boss charge/break, victory, and defeat are distinguishable without looking at internal state;
- repeated fire and echo density do not mask core-damage or boss-charge warnings;
- audio starts only after a valid user gesture, resumes safely, respects the sound setting, releases voices, and remains within the voice cap;
- haptics are short, optional, disabled with reduced motion, and never the sole carrier of required information;
- muted play remains fully understandable.

Evidence required: source event inventory, automated voice/resume metrics, and recorded phone audio. The current source has bounded procedural cues, but it lacks dedicated boss-charge, boss-break, defeat, and ambient identities; this gap is `complete_verified` by source inspection. Recorded-phone comparison is `prepared_not_executed`.

### 8. Performance, stability, recovery, and fallback

Primary reference: **Call of Duty: Mobile** for device-scalable presentation. Combat-load validator: **Gunfire Reborn Mobile**.

Pass criteria:

- target 60 FPS on capable phones and stable 30 FPS minimum under the defined worst-case checkpoint;
- adaptive quality may reduce DPR and decorative work, but never input, simulation rate, collision, telegraphs, HUD information, or save correctness;
- caps remain enforced for enemies, friendly and hostile projectiles, particles, triangles, Canvas pixels, and audio voices;
- WebGL 2, WebGL 1, context loss, render failure, resize, Canvas fallback, pause, backgrounding, and same-tab restoration preserve a playable deterministic run;
- public delivery identifies and verifies the exact content artifact being served, and a failed candidate restores the last verified artifact.

Evidence required: automated stress/golden/recovery tests, on-device diagnostic report, public artifact revision check, and real-device seven-loop run. Automated source behavior and the currently observed build-f public marker are `complete_verified`; replacement of the deployment-race-prone commit marker is tracked in `STATE.yaml`; physical-device evidence is `prepared_not_executed`.

## Current quality gap at selection time

| Element | Verified current strength | Remaining gap versus the assigned reference |
|---|---|---|
| Loop/echo | Exact 900-tick tapes, deterministic replay, six-echo final loop, final-tick tests | No captured comparison proving that overlapping causality is as easy to read as the mechanic is to execute. |
| Combat/camera | Manual-fire gating, two-thumb FIRE-drag aim, camera/crosshair/projectile agreement, deterministic stress trace | Physical-phone responsiveness, comfort, hit feel, and sustained aim stability remain unmeasured. |
| Enemy/boss | Five ordinary roles, seeded schedules, aligned boss spawn/telegraph, charge interrupt | Threat-priority readability has not been judged from current live footage. |
| Upgrades | Three unique category-based offers and validated application | Build diversity and choice tension have not been measured across repeated full runs. |
| UI/touch | Safe-area-aware controls, 48–118 px buttons, left-handed mirroring, no-overlap test, labeled YOU/CORE/time/ECHO HUD, and a three-phase title briefing | The first real-browser pass found build f's title 97 px wider than its content box at the 560 px game shell; build g repairs that candidate defect. A few secondary labels remain 10–12 px, and target-phone captures, first-run observation, and reach tests are still absent. |
| Visuals | Original palette, geometric silhouettes, WebGL 1/2, Canvas fallback, adaptive effects, layered panels, stronger crosshair, arena light gates/lane markers/beacons, and an enriched fallback scene | Menu, tutorial, LOOP 01 Canvas fallback, pause, and settings were inspected in a cloud Chrome shell, but matched target-size menu/gameplay/boss/result/reduced-quality/WebGL captures have not been completed or compared side by side. |
| Audio | Procedural, local-only, gesture-safe cues with a 14-voice cap | Cue vocabulary is sparse and lacks dedicated boss/defeat/ambient identity; phone recording is absent. |
| Performance/stability | 46 candidate/public tests including artifact tamper rejection, explicit caps, adaptive DPR/quality, exact reload restoration, content-addressed public identity, remotely exercised automatic restoration, and successful probe-free delivery | No physical iPhone/Android seven-loop diagnostic run; automated and public evidence does not substitute for that measurement. |

No numeric “overall score” may hide a blocking failure. An element passes only when its applicable hard gates pass and its evidence status is accurate.

## Browser evidence added during continuation

Capture method: live public GitHub Pages build f in cloud Chrome, outer viewport 1363×936 CSS px, centered game shell 560×936 CSS px, Canvas fallback active. This is real-browser evidence for the observed shell only; it is not a physical-phone or exact target-viewport substitute.

- `complete_verified`: the title block exposed a 414 px client width with a 511 px scroll width, while the menu overlay exposed a 560 px client width with a 584 px scroll width. The visible title crossed the panel edge and created horizontal scrolling.
- `complete_verified`: tutorial, LOOP 01 Canvas fallback, pause, and settings rendered with a clear primary/secondary/tertiary hierarchy at that shell size; no game-origin blocking console error was observed. Extension-origin metadata errors are unrelated to the game and are excluded.
- `complete_verified`: build g changes the title from viewport-capped 64 px type to `clamp(28px, 9vw, 50px)`, tightens letter spacing responsively, removes the conflicting 36 px narrow override, and makes overlay scrolling vertical-only. Source and assembled candidate pass the dedicated rejection test plus the full 47-test suite.
- `prepared_not_executed`: exact 320×568 and 375×667 captures. A data-URL viewport wrapper was rejected by the cloud browser URL policy; no indirect workaround was attempted.
- `prepared_not_executed`: LOOP 02, targeted crosshair, boss charge, victory/defeat, reduced-quality, reduced-motion, WebGL, fresh-viewer, blind, expert, reference-matched, and physical-phone comparisons.

## Evidence sources used for selection

Accessed 2026-08-01. These sources support selection, not a claim that ECHO//SEVEN has already matched the games.

- Lemnis Gate official mechanism and retained actions: https://news.xbox.com/en-us/2021/09/28/lemnis-gate-available-today-with-xbox-game-pass/
- Lemnis Gate short-map design constraints: https://news.xbox.com/en-us/2021/06/11/lemnis-gate-xbox-game-pass-this-summer/
- Lemnis Gate critic aggregate: https://opencritic.com/game/11613/lemnis-gate
- Lemnis Gate shutdown limitation: https://store.steampowered.com/news/app/950180/view/3678916525459103536
- SUPERHOT official description and press material: https://superhotgame.com/superhot and https://superhotgame.com/presskit
- SUPERHOT player-review snapshot and product footage: https://store.steampowered.com/app/322500/SUPERHOT/
- Gunfire Reborn official description: https://505games.com/games/gunfire-reborn/
- Gunfire Reborn Mobile official description: https://gfrm.yijoys.com/en/news/news_530.shtm
- Gunfire Reborn player-review snapshot and product footage: https://store.steampowered.com/app/1217060/Gunfire_Reborn/
- Call of Duty: Mobile official touch-control description: https://blog.activision.com/pt/call-of-duty/2019-10/Getting-a-Grip-on-the-Call-of-Duty-Mobile-Controls
- Call of Duty: Mobile official mobile-product description: https://www.activision.com/games/call-of-duty/call-of-duty-mobile
- Call of Duty: Mobile enemy-visibility and graphics-setting update: https://www.callofduty.com/ca/en/blog/2025/03/call-of-duty-mobile-season-three-cyber-mirage-battle-pass-announcement
- Call of Duty: Mobile critic/player aggregate: https://www.metacritic.com/game/call-of-duty-mobile-2019/

## Comparison integrity

- No member of the current run has claimed to have played these reference games during this run.
- No blind comparison, expert approval, physical-phone comparison, or source-blind visual review has been completed.
- Official descriptions, screenshots/footage, repository evidence, automated tests, and review aggregates are different evidence types and must not be described as interchangeable.
- Future comparisons must name the build, device or viewport, checkpoint, actions, capture method, expected criterion, observed result, and reviewer independence level.
- A benchmark is a quality and problem-solving reference only. Characters, fiction, maps, encounters, UI compositions, assets, sound, music, animation, and recognizable designs must remain original.
