# BRACKEN — the queue

Companion to `docs/AGENT-HANDOFF.md`. **That document is HOW to work** (worktrees, ports, rules, lessons).
**This one is WHAT to work on, and in what order.** Read the handoff first.

**The law is `RULES-LEVELS-AND-BOSSES.md`** — 626 lines, sections A-R, and most of it is enforced by tools.
Read A (the fight) and F (the shape of a level) before designing either. Four rules were added 2026-09-24: **A10**
phase two must change something you can name, **A11** the opening is caused not waited for, **A12** the arena must
supply what the attacks assume, **F10** every level brings at least one new foe.

**State:** branch `codex/playtest-0919`. Production is **`be6983a`**, deployed 2026-09-24 and verified byte-for-byte
with a clean boot. Full suite green: **108 checks**.

---

## 1. RUNNING NOW — the six lanes

One worktree and one branch each; the file lists in the handoff are the point. **Serialise full suite runs.**

| | lane | state |
|---|---|---|
| **A** | THE ORE ROAD REWORK | brief written and approved (`docs/briefs/ore-road-rework.md`). **The worst level in the game: INDEX 59 against neighbours at 92-113.** Big enough to split into level + Winchmaster. |
| **B** | THE WORLD MAP | side toggle menu, live motion, richer per-region art — **plus the optional/required fix in §3 below**, which is structural rather than cosmetic. |
| **C** | ART | the Buried Dead's own model; the Owl Reeve's 8-frame redraw; posed hurt frames for sprig, shield, soldier, brute. |
| **D** | THE PLAYER-SPEED BUG | 5.75px a step on plain solid at `vx` 92, where a plank correctly gives 0.92. Suspects: `P.driftAcc`, `updateSlide`. **Effort genuinely unknown.** |
| **E** | THE DESERT ARC | 7 briefs, 7 modules, 18 tools — **none wired in, none ever checked.** Verify all 18, fix breakage, then build level 1 only. |
| **F** | LEVEL QUALITY | **re-measure first** — every number taken before `77a559a` was read off a threat table missing five common foes. |

## 2. READY TO BUILD — briefs already exist, no design needed

These were designed on 2026-09-20/21 and live in **`.claude/briefs/`**. Do not redesign them.

| level | unlocks | state | |
|---|---|---|---|
| **THE UNBURIED FIELD** | Death Knight | brief **+ greybox** (`src/draft/unburied-field.js`, `tools/unburied-field-draft.mjs`) | **the closest to ready of anything in this file** |
| **THE POWDER DECK** | Freebooter | brief + pitch. An optional ship level going *between* decks, unlocking doors — deliberately not a fourth above-deck level | |
| **THE CHURCH** | Paladin | brief + pitch. Renames Waymeet's boss to **THE CRUSADER** so the church's own boss is **THE PALADIN** — you beat the Paladin to buy the Paladin | |
| **THE SUNKEN CARAVAN** | — (desert 1) | brief + greybox | lane E |
| desert levels 2-7 | — | briefs in `docs/briefs/` | after level 1 |

## 2a. THE THREE CHECKS THE NEW RULES ASK FOR — cheap, and overdue

A10, A12 and F10 were written 2026-09-24 and **all three are checkable and none is checked.** Every problem they
describe was found by Daniel PLAYING the game, which is the most expensive way to find anything. These are small
tools and they belong in the suite beside `tools/skins.mjs` and `tools/threat-holes.mjs`.

1. **F10 — one new foe a level.** A set difference: every level's roster against the union of every earlier level's.
   Fail when a level introduces nothing. *Would have caught:* the Ore Road shipping with nine foe kinds, one new.
2. **A10 — phase two must change.** Any boss that picks its turns from `e.phase === 2 ? [...] : [...]` can have the
   two lists compared. **Fail when they differ only by an append.** *Would catch, today:* see the fix below.
3. **A12 — the arena supplies what the attacks assume.** An attack's guard conditions live in its resolve branch
   (`P.y > A.floor - 80`, `ad < 44`, `dyP < 40`) and the arena's standable rows are in the grid. Read both, fail when
   nothing in the room can satisfy a condition an attack tests. *Would have caught:* the Buried Dead's nova reaching
   80px over a room whose only tier was 48, and the Paladin's bash reaching 44 over a flat street.

**AND ONE FIX THE NEW RULES DEMAND IMMEDIATELY: THE BURIED DEAD FAILS A10.** He has seven turns before he is enraged
and eight after — the one appended attack that A10 calls the floor rather than the plan. His phase two currently adds
`bodyTell` and changes nothing else. That is my own work from 2026-09-23, caught by the rule Daniel wrote the day
after, and it should be fixed before the rule is used to judge anybody else's boss. `src/buried-dead.js`, the two
`turns` arrays.

## 2b. ELEVEN NEW LEVELS ARE QUEUED — the order, and the scope

The game has **30 real levels**. What is queued is **+11, a 37% expansion**, and it is further along than it looks:
**all eight desert levels have greyboxes**, not just the caravan, and the arc carries its own class (the Sun Priest)
and world boss (the Skeleton King). It is a whole new act, and the sandy path at the end of THE FALLING TOWER is its
doorway.

**THE ORDER, agreed with Daniel 2026-09-24:**

1. **THE ORE ROAD REWORK.** It is live and he rejected it. Fixing a bad level beats adding good ones.
2. **THE MAP REDESIGN — before the levels, not after.** There are 29 level nodes across five regions today and this
   queue adds eleven more, most of them a region the map has never had to hold. A layout built for 29 and stretched
   to 41 is exactly how the left margin already ended up making the mandatory Ore Road read as a detour. The desert
   wants a sixth region designed IN, and every class level needs a spur, which is layout and not decoration.
3. **THE UNBURIED FIELD.** Brief *and* greybox, gates the Death Knight, self-contained. The cheapest real win here.
4. **THE DESERT ARC**, as one sustained push — eight greyboxed levels sharing a tileset, a class and a boss want
   continuity rather than being interleaved with other work.
5. **THE POWDER DECK and THE CHURCH** last; they are the least specified of the three class levels.

**PARKED: the Burial Caverns rework.** Its INDEX turned out fine (108, not the 56 I first reported) once the threat
table was fixed. "It is boring" is real but it is the vaguest item here and it competes with eleven levels that
already have briefs.

**ON SCOPE, honestly:** eleven levels is months at the pace this has been going. If only a subset actually matters
for shipping, saying so aims the work far better than working the list top to bottom.

## 3. THE MAP TELLS THE TRUTH ABOUT WHAT IS OPTIONAL — lane B

Daniel, 2026-09-24: *"the optional levels should be on a side path that are not required to complete... and the other
levels that seem optional like the one before the queen's castle level should not be optional."* `spur: true` hangs a
node off the road on a dashed branch. The map is currently wrong in both directions:

- **THE ORE ROAD is REQUIRED and reads as optional.** Highcrown is gated behind it and its node is exactly on the
  path — the data is right. The SHAPE is wrong: after Stormhold the road dives to the bottom-left corner and climbs
  the left edge (`[82,150] → [54,162] → [22,140] → [18,118] → [18,100] → [30,66]`) with the Undercrown **spur** at
  (18,88) in the middle of it, so the whole margin reads as a cluster of side branches.
- **Correct today:** the Burning Village, Underleaf and the Undercrown are spurs and should stay spurs.
- **The rule for every class level:** THE UNBURIED FIELD, THE POWDER DECK and THE CHURCH are optional unlocks like
  the Burning Village, so each gets `spur: true` **the day it is placed**.

## 4. DECIDED BY DANIEL, 2026-09-24 — build to these

1. **ALL THREE CLASS LEVELS GATE THEIR HERO.** *"All are gated behind their class levels."* So THE UNBURIED FIELD
   gates the Death Knight, THE POWDER DECK the Freebooter, THE CHURCH the Paladin - each needs a `coinNeeds` entry on
   its hero the day its level is placed, exactly as `pyro` has `coinNeeds: 'burning'` today. **THE WARDEN IS THE
   DELIBERATE EXCEPTION** and stays unlocked from the start.
2. **THE PALADIN'S CHARGE STAYS AS IT IS.** *"Paladins slow is fine."* 145px/s behind a 1.6s tell, 4.7s of total
   warning. Live in production. Do not re-tune it.
3. **THE DEATH KNIGHT'S ART GROWS TO MEET HIS HITBOX.** *"Lengthen the art."* The blade box reaches 24px past the
   blade drawn on its live frame (28px on the planted heavy); the fix is the sprite, NOT the box. His reach does not
   change - only the picture of it becomes honest.

4. **ABILITIES, NOT TALENTS — AND PASSIVES COME FROM LEVELLING.** Daniel, 2026-09-24: *"I want abilities, not
   talents. We can remove passives, they become default as you level up. You can see in the hero menu the passives
   that will unlock at certain levels."* The shop tab is already called **SKILLS** in the UI (`TALENTS` is only the
   internal array name, which is what made this sound like a bigger change than it is). So:
   - the shop sells **ACTIVE ABILITIES ONLY** — the F-key kind;
   - **passives stop being purchasable** and unlock automatically at hero levels. Today exactly one is passive,
     `kindle` (Pyromancer), so the migration is one item;
   - **the hero menu lists which passives arrive at which level**, so the player can see what is coming.
   Hero XP and levels already exist (`heroXp`, `levelUp`, the `LV` in the HUD) to hang this on. Every proposal in
   `docs/briefs/hero-kits.md` is now split into abilities (buyable) and passives (level unlocks) accordingly.
5. **THE FOUR BOSSES WRITTEN `0` BECOME `6`.** closedhelm, bellcrab, drownedking and prince in `src/threat.js`, while
   eight other bosses are already 6 and the table states plainly that a boss is a 6. This RAISES those levels' INDEX,
   so re-measure the ramp after it rather than before.
6. **FIRE RESPECTS INVULNERABILITY AND THE OPEN BONUS.** `wardedDamage` folds in the five damage-reduction wards.
   It now also folds in the Archmage's stage gate (which can refuse a blow outright — so burn does nothing while he
   is invulnerable) and the Undead Archmage's `gather` bonus (so burn is doubled while he is open). Damage is damage,
   whether it arrives from a sword or over time.
7. **THE QUEEN'S WALKWAY GOES, AND THE CHANDELIER REPLACES IT.** Her gallery on three breakable pillars is currently
   her ONLY damage window (`gqOpen` is `mode === 'pinned'`). Remove it and **cut the chandelier's chain to drop it on
   her**, which pins her exactly as the gallery did. She already has a chandelier attack (`chandTell`), so the room
   already owns the prop — this needs a cuttable chain, not a new idea. It also makes her opening something you
   CAUSE, which is what makes the False Abbot's bell and the Winchmaster's jammed drum work.

## 5. NEEDS DANIEL — do not decide these alone

1. **Flattening the campaign ramp.** Levels should get harder roughly steadily and this one jumps around. But **every
   measurement of it was taken off the broken threat table**, so its real shape is not yet known — lane F is
   re-measuring. Do NOT rebalance shipped levels on the old numbers. Bring Daniel the corrected picture and a
   proposal; he has not been asked yet and this is the one thing deliberately left open.

## 6. KNOWN DEBT

- **STORMWRECK HARBOR is SHELVED ON PURPOSE.** Daniel, 2026-09-24: *"by out of commission I mean we don't need
  it right now."* It is the only level in `LEVELS` with no map node - it builds, it has content, it has its own suite
  checks, and it is deliberately unreachable. **Leave it alone.** Do not restore it, do not give it a spur, and do not
  count it when measuring the campaign. Nothing is pending here.

- **`audits/` is dated 2026-09-16** and `src/main.js` has moved a long way since. The first item I picked off it was
  already fixed. **Regenerate before working from it** — the audit tools need a page.
- **Three bosses are unpiloted**: the Winchmaster (never), the Pyromancer (moveset changed, old numbers void), the
  False Abbot. ⚠️ **The Abbot's 38% and the Pyromancer's 4/4 against him were both measured while fire was bypassing
  his ward and mean nothing.** Re-pilot before anyone tunes him.
- **Waymeet's new Paladin ledges render as timber planks, not the tombs the code calls them.** Geometry verified
  correct in-engine; it is a masonry/skinning job.
- **Tower flyers drift into the Archmage's sanctum** and can appear to float through its painted walls.
- **Suite throughput, part 2.** 24 minutes, and the ten slowest checks are 58% of it — `profile-cleanup` (244s) and
  `cdp-recovery` (206s) alone are 7½ minutes and test the harness rather than the game. With ports and profiles now
  isolated, 4-way parallel should give 8-10 minutes.
- **Seven levels use stock library music** (theme, theme2, theme3, theme4, cave, town, adventure), and the Ore Road
  uses `mineworks`, a sparse synthesised track with no audio file — which is why it sounds like silence.

## 7. NOT DESIGNED YET

- **THE WARDEN NEEDS TALENTS, NOT A CLASS LEVEL.** Daniel, 2026-09-24: *"we do not need a warden class level (they
  are unlocked from the start)."* So she is unlocked deliberately and the gap is her KIT: she is the only hero with no
  talents at all and Daniel has asked for more Warden abilities by name. Four proposals in `docs/briefs/hero-kits.md`
  §3, rooted in her reach bands, her deflect and VIGIL - none agreed yet.
- **The Burial Caverns rework.** `docs/briefs/burial-caverns-rework.md` — but read its correction header first: it is
  INDEX **108**, not the 56 I first reported, and its problem is SHAPE (1,386 columns, the longest level in the game,
  ~230 columns a place) rather than emptiness.
