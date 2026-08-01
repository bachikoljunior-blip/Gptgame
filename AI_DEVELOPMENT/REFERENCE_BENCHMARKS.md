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

Repository evidence baseline: main `29d13e31e56145639cf425c43d30b040ceb5c0c7`, public artifact `93298f8c72fa670affcd7ab40e1b66ac5f60f561783ef0cdfe0dc9f70955eb8a`, product build `2026.08.01-h`.

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

Evidence required: DOM/CSS assertions, production pointer tests, 320/375/480-width captures, and first-run observation. Automated layout/input checks and build-h 320×568/375×667 Chromium captures are `complete_verified`; 480-width capture, physical touch, and first-run observation are `prepared_not_executed`.

### 6. Visuals, animation, and transitions

Primary reference: **SUPERHOT**. Mobile visibility validator: **Call of Duty: Mobile**.

Pass criteria:

- ECHO//SEVEN retains its original midnight-navy, icy-white, acid-lime, coral, and cyan identity; no benchmark palette or recognizable composition is copied;
- geometry, light, fog, emission, outline, depth, and motion establish a readable foreground/midground/background hierarchy;
- player actions, echo actions, enemy threats, core damage, loop rewind, upgrade choice, victory, and defeat each have a distinct beginning, peak, and recovery state;
- high and reduced quality modes preserve gameplay information even when decorative density, DPR, or particles fall;
- Canvas fallback communicates the same mandatory states even when it cannot match WebGL richness.

Evidence required: matched captures from menu, loop 1, loop 2, boss charge, victory/defeat, reduced quality, and Canvas fallback. The build-h target-size capture matrix is `complete_verified`; direct reference footage, motion comparison, and physical-device review are `prepared_not_executed`, so the visual pass is not benchmark-complete.

### 7. Audio and haptics

Primary reference: **SUPERHOT** for economical state cues. Combat-role validator: **Gunfire Reborn**.

Pass criteria:

- FIRE, DASH, player hit, kill, core hit, loop transition, upgrade, boss charge/break, victory, and defeat are distinguishable without looking at internal state;
- repeated fire and echo density do not mask core-damage or boss-charge warnings;
- audio starts only after a valid user gesture, resumes safely, respects the sound setting, releases voices, and remains within the voice cap;
- haptics are short, optional, disabled with reduced motion, and never the sole carrier of required information;
- muted play remains fully understandable.

Evidence required: source event inventory, automated voice/resume metrics, and recorded phone audio. Public build j adds distinct rising boss-charge, brittle charge-break, and low core-impact identities on the real combat branches; deterministic routing, critical-voice reservation, prior-build applicability, a valid-hash missing-routing negative, PR/main workflows, and the independently fetched public artifact are `complete_verified`. Dedicated defeat and ambient identities plus recorded-phone comparison remain `prepared_not_executed`.

### 8. Performance, stability, recovery, and fallback

Primary reference: **Call of Duty: Mobile** for device-scalable presentation. Combat-load validator: **Gunfire Reborn Mobile**.

Pass criteria:

- target 60 FPS on capable phones and stable 30 FPS minimum under the defined worst-case checkpoint;
- adaptive quality may reduce DPR and decorative work, but never input, simulation rate, collision, telegraphs, HUD information, or save correctness;
- caps remain enforced for enemies, friendly and hostile projectiles, particles, triangles, Canvas pixels, and audio voices;
- WebGL 2, WebGL 1, context loss, render failure, resize, Canvas fallback, pause, backgrounding, and same-tab restoration preserve a playable deterministic run;
- public delivery identifies and verifies the exact content artifact being served, and a failed candidate restores the last verified artifact.

Evidence required: automated stress/golden/recovery tests, on-device diagnostic report, public artifact revision check, and real-device seven-loop run. Automated source behavior and the currently observed content-addressed build-g public artifact are `complete_verified`; physical-device evidence is `prepared_not_executed`.

## Current quality gap at selection time

| Element | Verified current strength | Remaining gap versus the assigned reference |
|---|---|---|
| Loop/echo | Exact 900-tick tapes, deterministic replay, six-echo final loop, final-tick tests, target-size LOOP 01/02 captures, and build-i handoff cards that name the recorded loop, armed echo, next loop, and active replay count | The explicit handoff improves the static causal reading, but stills do not prove that overlapping actions remain understandable in motion; footage and a fresh-viewer check remain absent. |
| Combat/camera | Manual-fire gating, two-thumb FIRE-drag aim, camera/crosshair/projectile agreement, deterministic stress trace, and a visibly targeted crosshair at both target sizes | Physical-phone responsiveness, comfort, hit feel, and sustained aim stability remain unmeasured. |
| Enemy/boss | Five ordinary roles, seeded schedules, aligned boss spawn/telegraph, charge interrupt, and target-size boss-charge captures in WebGL, reduced-motion WebGL, and Canvas | Threat-priority readability has not been judged from motion or by a fresh viewer. |
| Upgrades | Three unique category-based offers and validated application | Build diversity and choice tension have not been measured across repeated full runs. |
| UI/touch | Safe-area-aware controls, 48–118 px buttons, left-handed mirroring, labeled YOU/CORE/time/ECHO HUD, and exact 320×568/375×667 menu/tutorial/settings/pause/upgrade/result evidence with no document-width overflow, undersized buttons, or button overlap | Build h repairs the exact 320×568 tutorial's focus-induced initial scroll. A few secondary labels remain 10–12 px; physical first-run, thumb reach, and touch-feel tests remain absent. |
| Visuals | Original palette, geometric silhouettes, WebGL/Canvas fallback, adaptive effects, and a 40-capture target-size matrix covering menu, loops, combat, target state, boss, result, reduced motion, and fallback without page, renderer, or invariant errors | Static captures cannot establish transition timing, echo causality in motion, or parity on a physical phone; blind, expert, and direct matched-reference review remain absent. |
| Audio | Procedural, local-only, gesture-safe cues with a 14-voice cap | Cue vocabulary is sparse and lacks dedicated boss/defeat/ambient identity; phone recording is absent. |
| Performance/stability | 48 source, assembled-candidate, and current-public tests covering artifact tamper rejection, responsive-layout regressions, explicit caps, adaptive DPR/quality, exact reload restoration, content-addressed identity, automatic restoration, and probe-free delivery | No physical iPhone/Android seven-loop diagnostic run; local headless and public automation do not substitute for that measurement. |

No numeric “overall score” may hide a blocking failure. An element passes only when its applicable hard gates pass and its evidence status is accurate.

## Browser evidence added during continuation

Two browser methods are kept distinct. The first was live public GitHub Pages in cloud Chrome at a centered 560×936 CSS px Canvas shell. The second used the unbundled candidate HTML in headless Chromium with exact 320×568 and 375×667 mobile/touch viewports, software WebGL plus forced Canvas fallback, Japanese test fonts, and a capture-only hidden diagnostics panel. Neither method substitutes for physical Safari/Chrome touch testing.

- `complete_verified` for public build j/artifact `afad352f…`: source, assembled candidate, PR, main, and independently fetched public HTML pass 50/50. Public cloud Chrome returned the same artifact, moved from `SIGNAL START` into playing mode, exposed visible FIRE/DASH controls, and logged no game-origin errors; three observed errors came only from the cloud-browser extension.
- `complete_verified` for public build i/artifact `d9e7db13…`: the loop boundary names the sealed loop, newly armed echo count, next loop, and count of recorded paths that will replay. Source, assembled candidate, PR, main, and independently fetched public HTML pass 49/49; four exact 320×568/375×667 WebGL captures cover recorded/replay states without page, renderer, shell-overflow, control-overlap, undersized-button, narrow-text, or invariant failures. Public cloud Chrome confirmed the exact artifact, menu-to-playing start, and no game-origin console errors; its throttled background clock did not provide a natural 15-second transition review.
- `complete_verified`: the earlier public build-f cloud pass exposed a 414 px title client width with a 511 px scroll width and a 560/584 px menu-overlay client/scroll width. Build g repaired that overflow; its public artifact `47d85a25…` passed 47/47 and cloud Chrome showed the full title at 560/560 px.
- `complete_verified`: exact target-size reproduction on build g found a separate tutorial defect at 320×568: initial autofocus scrolled the long overlay to its bottom, hiding the title and first instruction. Build h resets the overlay to the top and focuses with `preventScroll`; the exact repaired capture opens on `TACTICAL BRIEF`, the title, and step 1, while a separate bottom-scroll capture shows steps 2–3 and both actions.
- `complete_verified`: build h/artifact `93298f8c…` produced 40 captures across both target sizes. The matrix covers menu, tutorial top/bottom, settings, LOOP 01/02, combat, targeted crosshair, boss charge, result, pause, upgrade, reduced motion, WebGL, and Canvas fallback. It recorded zero document/shell horizontal overflows, undersized buttons, button overlaps, page errors, renderer errors, or invariant failures.
- `complete_verified`: the targeted crosshair carried its `targeted` state at both sizes; boss-charge threat treatment and the primary HUD/actions remained visible in WebGL, reduced-motion WebGL, and Canvas. Against the Call of Duty: Mobile/Gunfire Mobile touch-HUD criterion, ECHO//SEVEN retains only two large labeled combat actions plus two utility buttons rather than adopting their denser compositions.
- `complete_verified`: against the SUPERHOT separation criterion, the captures preserve ECHO//SEVEN's original navy field, coral threats, lime target state, and geometric silhouettes across both renderers; no reference palette, asset, or recognizable composition was imported.
- `complete_verified`: PR #19, main Quality run `30695280123`, ordered Pages run `30695280118`, and legacy same-SHA run `30695279819` succeeded. A cache-busted public artifact passed 48/48; live cloud Chrome returned artifact `93298f8c…`, focused `tutorialTitle`, retained `scrollTop=0`, kept the heading visible, and measured tutorial overlay width 560/560 px.
- `complete_unverified`: LOOP 01/02 stills and the echo-count HUD show distinct states, but they cannot prove the Lemnis Gate-derived causal-readability criterion. Loop-transition footage and a fresh-viewer explanation check remain necessary.
- `prepared_not_executed`: physical iPhone/Android rendering, real touch reach/feel, recorded phone audio, full loop-transition footage, fresh-viewer review, blind/expert review, and direct matched-reference gameplay comparison.

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
