# BRACKEN — the queue

Companion to `docs/AGENT-HANDOFF.md`. **That document is HOW to work** (worktrees, ports, rules, lessons).
**This one is WHAT to work on, and in what order.** Read the handoff first.

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

## 4. NEEDS DANIEL — do not decide these alone

1. **STORMWRECK HARBOR is out of the game.** It is the **only** level in `LEVELS` with no map node: it builds, it has
   content, it has suite checks, and it is unreachable. **Restore it or retire it?**
2. **Hero unlocks are implemented once out of six.** Only `pyro` carries a `coinNeeds` gate (the Burning Village).
   The Death Knight, Freebooter, Paladin and Warden are all buyable with no level behind them — so the design every
   class-level brief assumes barely exists yet.
3. **The four bosses weighted `0`** in `src/threat.js` (closedhelm, bellcrab, drownedking, prince) while eight others
   are `6`. The table says a boss is a 6.
4. **The Paladin's charge is now 4.7s** of total warning (was 3.3s). That is what was asked for; it may be too
   telegraphed. Needs a human hand on it.
5. **The Queen's walkway.** Daniel asked for it removed; it is her ONLY damage window (`gqOpen` is `mode==='pinned'`
   and only her own gallery pins her). Ask again before deleting.
6. **The Death Knight's hitbox** reaches 24px past the blade the art draws — shorten the box or lengthen the art?
   That is a call about his reach.
7. **Burn and the two non-ward multipliers** — `wardedDamage` folds in the five wards, deliberately not the
   Archmage's stage gate (which can refuse a blow) or the Undead Archmage's `gather` bonus.
8. **Sixteen proposed talents** across four heroes (`docs/briefs/hero-kits.md`). Is four each right, or two?
9. **Flattening the ramp** means editing shipped levels. Bring numbers and a proposal, do not rebalance the campaign
   unasked.

## 5. KNOWN DEBT

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

## 6. NOT DESIGNED YET

- **A Warden class level.** She is the only hero with neither a class level nor a single talent, and Daniel has asked
  for more Warden abilities specifically. Proposals in `docs/briefs/hero-kits.md` §3; nothing is agreed.
- **The Burial Caverns rework.** `docs/briefs/burial-caverns-rework.md` — but read its correction header first: it is
  INDEX **108**, not the 56 I first reported, and its problem is SHAPE (1,386 columns, the longest level in the game,
  ~230 columns a place) rather than emptiness.
