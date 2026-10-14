# claude/paladin2: PALADIN 2 - HOLY GROUND + LIGHT SPENT (Opus kit + mechanics, 2026-10-13)

Brief: scratch/brief-paladin2.md (Daniel 10-12). Base: origin/master a0e14160. Branch: claude/paladin2. Port 8881.
STOPPED after mechanics + a 3-seed sanity run (the Sonnet tune lane does the 12-seed measuring; the Sonnet art lane does the frames/FX below).

## WHAT IS BUILT
He is a ZONE-HOLDER now. The core is a new module, **src/holy-ground.js** (`HG` table, `makeHolyGround(api)`, `spendLight`).

| Input | Old | New |
|---|---|---|
| TAP C | MEND (50 Light, +20 hp, root) | **CONSECRATE**: one holy circle at his feet (r 44 px, 9 s, 18 wind). Tapped again after 1.2 s it MOVES (the old one goes out). |
| TAP C *in his circle* | - | **SPENDS LIGHT**: full bar = **JUDGEMENT**; 35 Light = **EMPOWER** (flare 12 dmg + stagger on what is in it, r 60, 12 s, burns x2); too little = re-plant where he stands |
| UP + C | - | **HAMMER THROW** (25 Light): the hammer of light out 112 px and back, 9 dmg each way (tag `shot`). Too little Light: NO LIGHT, nothing thrown, no aegis |
| HOLD X *in his circle* | overhead + hammerfall waves | **SMITE** (20 Light): the overhead x1.5 and its waves x1.5 + burn. Out of the circle: the plain overhead (no Light) |
| HOLD C | AEGIS | AEGIS (unchanged) **+ it covers a co-op partner standing in his circle** (any side, never a RED blow; the paladin pays 10 wind, gains 5 Light) |
| parry | aegis on the beat (src/riposte.js) | unchanged |
| plunge | HAMMER OF DAWN | unchanged, and if he has no circle the landing PLANTS one (free) |
| kneel by a holy light | fills Light (crouchfix) | unchanged |
| judgement | full bar + C anywhere (this also blocked the aegis at full Light) | full bar + tap C IN HIS CIRCLE; holding C at full Light is now the aegis |

Inside his own circle: his blows land **x1.2** (swingDmg), he mends **2% max hp/s** (a partner in it 1%), foes in it **burn 4 every 0.4 s** (x amul).
The circle is drawn the whole time: gold floor ellipse, rim, inner ring, a post of light at each edge, the rim blinks for its last 1.5 s; empowered = whiter, taller posts.

MEND as an input is gone (the circle is his healing). Its talents are re-pointed: LITANY = the circle mends twice as fast; MERCY = wind comes back in it.

### Skill slots (no longer the Death Knight's 1/4/8 shape: a ground zone at L1-4, a throw at L4, a line at L8)
- CONSECRATE and BLESSED HAMMER are base kit, so their nodes became PASSIVES that grow them: **HALLOWED GROUND** (L1: circle +8 px, +3 s) and **BLESSED HAMMER** (L4: the throw flies a third further and burns). Old saves: `equipped()` already drops a passive from a slot; a bought node stays owned and is on.
- His actives on their own ladder **1 / 3 / 7 / 9 / 14 / 20**: HAMMER LEAP L1 (now carries his circle to where it lands - the zone-holder's move), DIVINE SHIELD L3, SPEAR OF LIGHT L7, HOLY CHARGE L9, DAWNBURST 14, HOLY WRATH 20. Prices follow the ladder (tools/talents.mjs PRICE_AT).
- B14 keys with base kit: plunge (Hammer of Dawn), rise, sweep, behind, heavy (overhead/smite), riposte (aegis beat), throw (carried props as every hero). The hammer throw is tagged `shot`, NOT `throw`, on purpose: it must not open a THROW IT boss without the prop (question 3).

### The API for LIT CHURCH 2's hero-boss
`makeHolyGround(api)` with `api = { time, g, parts, targets(circle), hurt(target, dmg, circle), healers(circle), heal(body, n, circle) }`; then
`plant(owner, x, y, {r, life, side})`, `empower(c, {r, life})`, `move(c, x, y)`, `of(owner)`, `inside(c, body)`, `standing(owner)`, `covering(body, ok)`, `update(dt)`, `draw(cx, cy)`, `clear()`, `read()`;
`spendLight(owner, n)`. An owner is any body with `{x, y, light}`. The boss lane makes ITS OWN instance with `side: 'foe'` and targets = the heroes, hurt = damagePlayer (the module never reaches into main.js); the sanctuary lamps feed `boss.light` and his Judgement/Empower/Smite call `spendLight(boss, HG.x.cost)`. The same `HG` table gives him the hero's numbers.

## FILES
src/holy-ground.js (new), src/main.js (C handling, castHammer/holyTap/plantCircle/empowerCircle, swingDmg x1.2, smite, plunge plant, leap carry, partner cover in damagePlayer0, meter prompt, BK.holy/holyHands/holyHurt, hero words, yard drill names), src/progression-catalog.js, src/skill-glyphs.js, src/controls.js (card rows), src/level.js (the wood sign, the paladin yard: HOLY GROUND / THE HAMMER stations, judgement text), src/hero-poses.js + src/chars.js (placeholder EMPOWER pose), src/bot-profile.js, src/lab.js (the paladin bot plants/empowers), tools/paladin-kit.mjs (new), tools/skill-icons.mjs + tools/skill-passives.mjs (counts: two actives became passives - a stated design change, not a weakened test).

## CHECKS
All green, run one at a time on port 8881:
- **tools/paladin-kit.mjs (new)**: one circle at his feet for 18 wind; the replant wait; the move; mend in (+4.8 hp / 2 s) and none out; burn in (16) and none out; swing out 14 / in 17 (x1.2, burn subtracted); empower spends 35 (r 44 -> 60); judgement in the circle; the hammer throw spends 25 and hits; too little Light throws nothing (no aegis, no circle); smite in the circle spends 20 and none out; the life (9 s); co-op: partner in his circle under his aegis covered (he pays 10 wind), RED never, outside never, aegis down never.
- settings-tabs, crouch-b (kneel at holy lights unchanged), riposte (paladin aegis beat parry unchanged), ability-poses (67/67 actives own a pose), skill-menu (paladin 6 actives / 23 passives), skill-icons, skill-passives, talents, leveling, progression, blow-tags, signs, comments, dangling-paths.
- textfit `hints,hud,practice,store,tree,pick,menu --strict`: 0 of every class (1115 screens).
- online-coop: OK (the partner cover itself is proved in local co-op by paladin-kit; online is the same `players[]`).
- syntax: every touched file parses (`node --check`).
- mash spot (paladin, arena only, 2 seeds): wood 0/2, stockade 0/2, marsh **1/2 WIN** - identical on master a0e14160 (same seed, same 32.4 s), so pre-existing; the mash bot never presses C, so the new kit cannot change it. The paladin is not in the gated knight/warden/pyro set.

## SANITY (3 seeds, profile human, practiced, campaign level)
Win rates are HIGH for both heroes on these early (L3) bosses, so the useful number is the fight length (practiced, mean of 3):

| Boss | knight wins / mean s | OLD paladin (master) wins / mean s | NEW paladin wins / mean s |
|---|---|---|---|
| wood | 3/3, 101 s | 3/3, 75 s | 3/3, 38 s |
| stockade | 2/3, 52 s | 3/3, 46 s | 3/3, 41 s |
| marsh | 3/3, 26 s | 3/3, 37 s | 3/3, 40 s |
| burning | 3/3, 108 s | 3/3, 61 s | 3/3, 67 s |

All ways (practiced/first/built, 56 fights): knight 100/83/100/100%, paladin 100% everywhere. The new kit is close to the old paladin except WOOD (75 -> 38 s): the
circle's burn (10/s at full uptime) is strongest on a slow boss that stands in it. For the TUNE lane: HG.burn / HG.tick and HG.hitMul are the knobs; a boss-side
burn multiplier (e.g. x0.5 on e.maxHp in main.js HGR.hurt) is the obvious first try. The bot plants/empowers (src/lab.js palHallow) so the rates include the kit.

## ART NEEDS (for the Sonnet art lane)
1. EMPOWER pose `sanctify` (src/chars.js paladinKitPoses, 2 frames, PLACEHOLDER): windup = maul straight up two-handed over the helm, head lit; release = driven down into the circle, light columns both sides.
2. CONSECRATE plant: the existing `hallow` pose is reused (its own windup + release from lane P) - check it still reads as "planting" when tapped often (maybe a quicker 0.25 s variant).
3. HAMMER THROW: reuses `hurlH` (Blessed Hammer's own windup + release); the projectile is still the old 12 px light blob - draw a proper spinning hammer-of-light (2-4 frames) and a catch flash on return.
4. SMITE: the overhead's frames are shared with the plain overhead; a white-gold head glow + a light column on release so a SMITE reads apart from the plain heavy; holy (burning) waves need their own colour vs the brown hammerfall dust.
5. THE CIRCLE (src/holy-ground.js draw): greybox ellipse + rim posts. Wants a real ground sigil (runes round the rim, a cross/sun at the centre), the empowered state (taller posts, motes), the going-out blink, and a 1-px plant "ring outward" on plant/move.
6. PARTNER AEGIS: a thin light tether from the paladin's aegis to the covered partner + a small ward flash on the partner (now: two rings and the word HIS AEGIS).
7. HUD: the Light bar could show the spend marks (35 empower, 25 throw, 20 smite) as ticks.
8. Hero card / store portrait text already updated; the yard's two new stations want their straw men placed for the throw (one at 16 tiles today).

## REDS / NOT RUN
- No red checks. Not run here (the suite / later lanes): textfit-full, the full `npm run check`, 12-seed boss-rates (tune lane), mash-gate stamps.
- Pre-existing: mash paladin marsh 1/2 (above).
- tools/paladin-enrage.mjs, src/paladin-boss.js and the Lit Church boss are untouched (LIT CHURCH 2 rebuilds the boss on this kit).

## QUESTIONS FOR DANIEL
1. MEND is gone as an input (the circle heals him instead: 2%/s, LITANY 4%/s). REC: keep it gone - one tap verb, healing tied to holding ground. BUILT: gone.
2. JUDGEMENT now needs his circle (full bar + tap C in it); at full Light outside it, the tap plants the circle first and the HUD says FULL: C IN CIRCLE. REC: keep (it makes Judgement a zone spend and frees the aegis at full Light). BUILT: so.
3. The HAMMER THROW is tagged `shot`, not `throw`, so it cannot open a THROW IT key (those stay the carried prop's). REC: keep. BUILT: shot.
4. The audit's BRACE-LITE dodge (aegis-lite absorb on the dodge input) is NOT built: it duplicates the aegis, the parry beat and his shoulder (which already turns a frontal blow). REC: skip; his 'can't leave' weakness is now the circle itself (strong in it, plain out of it). BUILT: nothing.
5. HAMMER OF DAWN plants a free circle where it lands only when he has none (so it cannot be pogo-spammed to drag the circle). REC: keep.
