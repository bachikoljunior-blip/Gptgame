# ECHO//SEVEN — Element Reference Benchmarks

> **Governed by `AGENTS.md`.** The standing rules it carries — never reproduce a reference's
> content, never name one in what ships, a criterion may be made stricter freely and weakened
> only on proof it is unreachable, external assets and network calls are allowed — are **not
> restated here**. Read them there.
>
> The section "Authority, elements, selection, and comparison" below was set by user
> instruction on 2026-08-02 and governs the rest of this file. **Everything after it predates
> that instruction and has not been re-derived under it** — the eight elements, the four
> references, and every criterion. Read them as the previous state, not the current answer.
>
> The "Deliberate limits" cells describe what each reference is and is not useful **for**.
> They are scope notes, not a second copy of the copying rule.

Status date: 2026-08-02 (Asia/Tokyo)

Selection status: **`not measured` against the four axes below.** The current set was chosen
from official descriptions and review aggregates before those axes existed, and has never
been re-checked against them.

Essentials-to-elements coverage: **`not measured` — no such list exists.** The eight elements
below were never derived from a written list of what the concept cannot exist without, so
whether they account for it is unknown, and anything they leave unclaimed is currently
undetectable.

Blind comparison, per element: **`not measured` — never run for any element.** Under the rule
below this makes every element's criterion `not satisfied` or `not measured`, including the
ones this file previously recorded as verified. Those records remain accurate about what was
measured; they were never a comparison against a reference.

Routine iPhone browser gate: `prepared_not_executed` — Playwright WebKit at `375×667 / DPR 2`, then iPhone SE (3rd generation) iOS Simulator Mobile Safari through Appium

Physical-phone-only properties: explicitly unmeasured and non-blocking for routine delivery; GPU speed, thermals, memory pressure, hand reach, haptics, speakers, and audio latency must never be inferred from either automated runner

## Authority, elements, selection, and comparison

Set by user instruction on 2026-08-02. The user's latest explicit game concept is always
authoritative. This file converts that concept into elements, one reference work per element,
and the criteria each becomes. It never replaces the concept and never authorizes copying.

### What counts as an element

**An element is something the concept cannot exist without.** If the concept still stands with
the thing removed, it is not an element: no reference, no criterion, no comparison.

**The essentials are read out of the concept itself.** Take the stated concept a clause at a
time and ask of each: does the concept survive without this? What survives its removal is not
essential. The list is not brainstormed from the genre, and it is not read off the build —
what exists today is evidence of what was made, not of what the concept requires.

**Divide those essentials at a granularity that can actually be compared.** A division is an
element only if this build and a reference can be set beside each other on it, as images,
video or text. A split too fine or too vague to judge that way is merged upward or restated
until it can be.

**The divisions must together account for every essential.** Nothing the concept cannot exist
without may be left unclaimed — not by falling between two divisions, and not by being set
aside because it was awkward to split. Deriving the elements therefore starts from the list
of essentials and ends by naming which element claims each one. **An essential no element
claims means the derivation is unfinished**, not something to be noticed later.

Every word in this section is about the list of elements. None of it refers to the game's
space, geometry or level layout.

Granularity is what measurability decides — never coverage. An essential that no division
makes comparable still gets an element, which reads `not measured` and names what is missing.
It is not dropped for being hard to judge, and the list is not drawn from how the code
happens to be organised.

### Selecting a reference work for each element

Every element gets its own reference: the shipped work that sets the bar for **that element
alone**. Four axes, and a replacement must be at least as strong on all four.

1. **The quality of that element** in that work.
2. **Expert and player reception.**
3. **Long-term reputation.**
4. **Fit to this concept.**

**Device class and production scale are deliberately not axes.** The bar is what the element
should be, not what is convenient to reach here. A reference out of reach at this scale is a
recorded shortfall, never a reason to pick a weaker reference.

Change a reference only when it stops fitting the concept — never because another title became
interesting. Record the reason.

### Blind comparison is how an element is judged

An element's criterion is `satisfied` only after a blind comparison was actually run **and its
findings were repaired**.

- **Material.** The real reference work and the build under development, as **images, video and
  text**. Not recollection, not an official description, not a review score, not a pixel metric
  standing in for a comparison. Fetching reference material for this purpose is allowed.
- **Blind.** The judge is not told which side is which. Filenames, watermarks, resolution, UI
  language and aspect ratio are levelled first, or the comparison is refused rather than run
  with a tell in it.
- **The question.** Shown these unlabelled, which is stronger on this element alone, and why.
- **Repair.** A comparison that produced findings and no repair leaves the element
  `not satisfied` — never `satisfied with notes`.
- **Re-compare.** The repair is judged by a fresh blind pass, not by whoever made it.

A comparison that could not be run is `not measured`, naming what was missing. That is a normal
outcome. Calling a recollection, an official screenshot, or an automated pixel check a blind
comparison is not.

### When the concept changes

1. **Re-derive the elements.** What is essential to the concept may have moved.
2. An element that left the concept is **retired**, and its reference and criteria go with it.
   **Retiring is not weakening** and needs no unreachability proof — record which instruction
   removed it.
3. For each surviving element, re-check whether its reference still fits. Change it only under
   the four axes above.
4. Re-derive the affected criteria. Making one stricter is free.
5. Weakening a surviving criterion is governed by `AGENTS.md`. The proof it demands is stored
   here as evidence.
6. Record what changed, why, and under which instruction, in `AI_DEVELOPMENT/STATE.yaml`.

## Current concept

Repository product evidence baseline: main product revision `036ed206c988a72c6bd549b531a2830c20fec7b1`, public artifact `d9e7db13cef617a4604beead48082479e64a27c2413446ebbbca695d36dcf923`, product build `2026.08.01-i`; the later state-only main checkpoint is `4c1aa5fd955c9af680b78104c01657b571877e15`.

ECHO//SEVEN is a portrait, mobile-first, first-person 3D action roguelite for a self-contained browser runtime. A run has seven 15-second loops. Movement, aim, manual shots, and DASH events from each loop are replayed by allied echoes in later loops. The player defends a core, chooses one of three upgrades after loops 2, 4, and 6, and fights SEPTAGON with six echoes in loop 7.

The product priorities that control benchmark selection are:

- immediate two-thumb touch control on small phones;
- exact and understandable time-loop causality;
- readable first-person combat, threat telegraphs, and enemy roles;
- meaningful short-run upgrade choices;
- a unified geometric visual language that works without external runtime assets;
- useful sound, haptics, and muted-play feedback;
- deterministic behavior, graceful Canvas fallback, and local recovery; the 30/60 FPS product target remains, while automated runners enforce resource caps and relative hang/regression guards without pretending to measure physical-phone FPS.

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

Evidence required for routine delivery: existing pointer/camera/golden-trace checks, Playwright WebKit at the target viewport, and trusted two-thumb Appium actions in the matching iOS Simulator Mobile Safari. Existing deterministic behavior is `complete_verified`; both new target-browser gates are `prepared_not_executed`. Physical comfort and hit feel remain optional, unmeasured tuning evidence.

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

Evidence required: DOM/CSS assertions, production pointer tests, target-width captures, trusted iOS Simulator Safari taps, and the automated first-run path. Existing layout/input checks plus build-k menu/result and expanded-diagnostics captures at 320×568/375×667 are `complete_verified`; the new WebKit and iOS Simulator passes, 480-width capture, and physical touch are `prepared_not_executed`. Physical reach remains optional and cannot be inferred from the simulator.

### 6. Visuals, animation, and transitions

Primary reference: **SUPERHOT**. Mobile visibility validator: **Call of Duty: Mobile**.

Pass criteria:

- ECHO//SEVEN retains its original midnight-navy, icy-white, acid-lime, coral, and cyan identity; no benchmark palette or recognizable composition is copied;
- geometry, light, fog, emission, outline, depth, and motion establish a readable foreground/midground/background hierarchy;
- player actions, echo actions, enemy threats, core damage, loop rewind, upgrade choice, victory, and defeat each have a distinct beginning, peak, and recovery state;
- high and reduced quality modes preserve gameplay information even when decorative density, DPR, or particles fall;
- Canvas fallback communicates the same mandatory states even when it cannot match WebGL richness.

Evidence required: matched captures from menu, loop 1, loop 2, boss charge, victory/defeat, reduced quality, Canvas fallback, target WebKit, and iOS Simulator Safari. The build-h target-size capture matrix is `complete_verified`; the new target-browser captures, direct reference footage, and motion comparison are `prepared_not_executed`, so the visual pass is not benchmark-complete. Physical rendering is optional evidence, not a routine release gate.

### 7. Audio and haptics

Primary reference: **SUPERHOT** for economical state cues. Combat-role validator: **Gunfire Reborn**.

Pass criteria:

- FIRE, DASH, player hit, kill, core hit, loop transition, upgrade, boss charge/break, victory, and defeat are distinguishable without looking at internal state;
- repeated fire and echo density do not mask core-damage or boss-charge warnings;
- audio starts only after a valid user gesture, resumes safely, respects the sound setting, releases voices, and remains within the voice cap;
- haptics are short, optional, disabled with reduced motion, and never the sole carrier of required information;
- muted play remains fully understandable.

Evidence required for routine delivery: source event inventory, automated voice/resume metrics, gesture-safe resume, and muted-play parity. Public build j adds distinct rising boss-charge, brittle charge-break, and low core-impact identities on the real combat branches; deterministic routing, critical-voice reservation, prior-build applicability, a valid-hash missing-routing negative, PR/main workflows, and the independently fetched public artifact are `complete_verified`. Dedicated defeat and ambient identities remain `prepared_not_executed`; speakers, recorded-phone comparison, and audio latency remain physical-only, unmeasured, non-blocking properties.

### 8. Performance, stability, recovery, and fallback

Primary reference: **Call of Duty: Mobile** for device-scalable presentation. Combat-load validator: **Gunfire Reborn Mobile**.

Pass criteria:

- retain the target of 60 FPS on capable phones and stable 30 FPS minimum, but never convert runner frame gaps into physical-phone FPS evidence;
- routine automation rejects hangs, non-finite state, budget overruns, and relative regressions at the defined worst-case checkpoint;
- adaptive quality may reduce DPR and decorative work, but never input, simulation rate, collision, telegraphs, HUD information, or save correctness;
- caps remain enforced for enemies, friendly and hostile projectiles, particles, triangles, Canvas pixels, and audio voices;
- WebGL 2, WebGL 1, context loss, render failure, resize, Canvas fallback, pause, backgrounding, and same-tab restoration preserve a playable deterministic run;
- public delivery identifies and verifies the exact content artifact being served, and a failed candidate restores the last verified artifact.

Evidence required for routine delivery: automated stress/golden/recovery tests, WebKit and iOS Simulator Safari stress reports, explicit resource caps, and the public artifact revision check. Existing source behavior and the content-addressed build-k public artifact are `complete_verified`; both new phone-browser gates are `prepared_not_executed`. Physical FPS, heat, and memory pressure remain optional measurements and may not be claimed from the runners.

## Current quality gap at selection time

| Element | Verified current strength | Remaining gap versus the assigned reference |
|---|---|---|
| Loop/echo | Exact 900-tick tapes, deterministic replay, six-echo final loop, final-tick tests, target-size LOOP 01/02 captures, and build-i handoff cards that name the recorded loop, armed echo, next loop, and active replay count | The explicit handoff improves the static causal reading, but stills do not prove that overlapping actions remain understandable in motion; footage and a fresh-viewer check remain absent. |
| Combat/camera | Manual-fire gating, two-thumb FIRE-drag aim, camera/crosshair/projectile agreement, deterministic stress trace, and a visibly targeted crosshair at both target sizes | Target WebKit and trusted iOS Simulator two-thumb evidence are prepared but not executed; physical comfort and hit feel remain optional and unmeasured. |
| Enemy/boss | Five ordinary roles, seeded schedules, aligned boss spawn/telegraph, charge interrupt, and target-size boss-charge captures in WebGL, reduced-motion WebGL, and Canvas | Threat-priority readability has not been judged from motion or by a fresh viewer. |
| Upgrades | Three unique category-based offers and validated application | Build diversity and choice tension have not been measured across repeated full runs. |
| UI/touch | Safe-area-aware controls, 48–118 px buttons, left-handed mirroring, labeled YOU/CORE/time/ECHO HUD, and exact 320×568/375×667 menu/result evidence with a 12 px secondary-type floor, full `REPEAT ×7`, no document-width overflow, undersized buttons, or button overlap | Build h repairs the exact 320×568 tutorial's focus-induced initial scroll, and build k removes 9–11 px menu/result labels. Target WebKit and iOS Simulator first-run/touch reports are prepared but not executed; physical thumb reach, 480-width, and touch feel remain optional or unmeasured. |
| Visuals | Original palette, geometric silhouettes, WebGL/Canvas fallback, adaptive effects, and a 40-capture target-size matrix covering menu, loops, combat, target state, boss, result, reduced motion, and fallback without page, renderer, or invariant errors | Static captures cannot establish transition timing or echo causality in motion; target WebKit/iOS Safari, blind, expert, and direct matched-reference review remain absent. |
| Audio | Procedural, local-only, gesture-safe cues with distinct boss charge/break/impact identities and a 10/14 general/critical voice reserve | Dedicated defeat and ambient identity remain absent; speaker and latency behavior remain unmeasured physical-only properties. |
| Performance/stability | 51 current-source and current-public tests covering artifact tamper rejection, responsive-layout regressions, explicit caps, adaptive DPR/quality, exact reload restoration, content-addressed identity, automatic restoration, and probe-free delivery | Target WebKit and iOS Simulator stress gates are prepared but not executed. Physical FPS/thermal/memory behavior remains unmeasured and will not be inferred from runner timing. |

No numeric “overall score” may hide a blocking failure. An element passes only when its applicable hard gates pass and its evidence status is accurate.

## Browser evidence added during continuation

Existing browser evidence and the prepared gates are kept distinct. The first was live public GitHub Pages in cloud Chrome at a centered 560×936 CSS px Canvas shell. The second used the unbundled candidate HTML in headless Chromium with exact 320×568 and 375×667 mobile/touch viewports, software WebGL plus forced Canvas fallback, and a capture-only hidden diagnostics panel; that browser lacked Japanese glyph coverage, so its geometry and computed-size evidence does not prove Japanese glyph appearance. The prepared routine replacement adds Playwright WebKit and an actual iOS Simulator Mobile Safari session; none of these methods measures physical-only performance or feel.

- `complete_verified` for public build i/artifact `d9e7db13…`: the loop boundary names the sealed loop, newly armed echo count, next loop, and count of recorded paths that will replay. Source, assembled candidate, PR, main, and independently fetched public HTML pass 49/49; four exact 320×568/375×667 WebGL captures cover recorded/replay states without page, renderer, shell-overflow, control-overlap, undersized-button, narrow-text, or invariant failures. Public cloud Chrome confirmed the exact artifact, menu-to-playing start, and no game-origin console errors; its throttled background clock did not provide a natural 15-second transition review.
- `complete_verified` for public build j/artifact `afad352f…`: source, assembled candidate, PR, main, and independently fetched public HTML pass 50/50. Public cloud Chrome returned the same artifact, moved from `SIGNAL START` to playing mode, kept `FIRE` and `DASH` visible, and produced no game-origin console errors; the only observed errors came from an unrelated Chrome extension.
- `complete_verified` for public build k/artifact `69f72f7b…`: 14 exact 320×568/375×667 captures cover collapsed menu/result, expanded diagnostics at the top, and its scrollable action bottom across WebGL, Canvas, and reduced motion where applicable. No visible text is below 12 px, no document/shell horizontal overflow, undersized button, button overlap, page/renderer error, or invariant failure occurred. Initial review caught `REPEAT ×7` truncation at 320 px; reducing its value tracking from 0.05 em to 0.015 em restored the full label before the final captures. The result details intentionally scroll vertically, and a bottom capture verifies all actions remain reachable. PR #25, all main workflows, and an independent public 51/51 pass succeeded; public cloud Chrome returned the exact build/artifact, computed all seven target selectors at 12 px, measured root and menu widths without horizontal overflow, and accepted `SIGNAL START` into the correct `LIVE RECORDING` countdown. Its background animation clock remained throttled, so this live pass does not claim the later FIRE/DASH state.
- `complete_verified`: the earlier public build-f cloud pass exposed a 414 px title client width with a 511 px scroll width and a 560/584 px menu-overlay client/scroll width. Build g repaired that overflow; its public artifact `47d85a25…` passed 47/47 and cloud Chrome showed the full title at 560/560 px.
- `complete_verified`: exact target-size reproduction on build g found a separate tutorial defect at 320×568: initial autofocus scrolled the long overlay to its bottom, hiding the title and first instruction. Build h resets the overlay to the top and focuses with `preventScroll`; the exact repaired capture opens on `TACTICAL BRIEF`, the title, and step 1, while a separate bottom-scroll capture shows steps 2–3 and both actions.
- `complete_verified`: build h/artifact `93298f8c…` produced 40 captures across both target sizes. The matrix covers menu, tutorial top/bottom, settings, LOOP 01/02, combat, targeted crosshair, boss charge, result, pause, upgrade, reduced motion, WebGL, and Canvas fallback. It recorded zero document/shell horizontal overflows, undersized buttons, button overlaps, page errors, renderer errors, or invariant failures.
- `complete_verified`: the targeted crosshair carried its `targeted` state at both sizes; boss-charge threat treatment and the primary HUD/actions remained visible in WebGL, reduced-motion WebGL, and Canvas. Against the Call of Duty: Mobile/Gunfire Mobile touch-HUD criterion, ECHO//SEVEN retains only two large labeled combat actions plus two utility buttons rather than adopting their denser compositions.
- `complete_verified`: against the SUPERHOT separation criterion, the captures preserve ECHO//SEVEN's original navy field, coral threats, lime target state, and geometric silhouettes across both renderers; no reference palette, asset, or recognizable composition was imported.
- `complete_verified`: PR #19, main Quality run `30695280123`, ordered Pages run `30695280118`, and legacy same-SHA run `30695279819` succeeded. A cache-busted public artifact passed 48/48; live cloud Chrome returned artifact `93298f8c…`, focused `tutorialTitle`, retained `scrollTop=0`, kept the heading visible, and measured tutorial overlay width 560/560 px.
- `complete_unverified`: LOOP 01/02 stills and the echo-count HUD show distinct states, but they cannot prove the Lemnis Gate-derived causal-readability criterion. Loop-transition footage and a fresh-viewer explanation check remain necessary.
- `prepared_not_executed`: target Playwright WebKit and iOS Simulator Mobile Safari runs, full loop-transition footage, fresh-viewer review, blind/expert review, and direct matched-reference gameplay comparison.
- Explicitly unmeasured and non-blocking: physical iPhone/Android GPU/thermal/memory behavior, real hand reach/feel, haptics, speakers, and audio latency.

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
- No blind comparison, expert approval, optional physical-phone comparison, or source-blind visual review has been completed; none is implied by the prepared automated gates.
- Official descriptions, screenshots/footage, repository evidence, automated tests, and review aggregates are different evidence types and must not be described as interchangeable.
- Future comparisons must name the build, device or viewport, checkpoint, actions, capture method, expected criterion, observed result, and reviewer independence level.
- A benchmark is a quality and problem-solving reference only. Characters, fiction, maps, encounters, UI compositions, assets, sound, music, animation, and recognizable designs must remain original.
