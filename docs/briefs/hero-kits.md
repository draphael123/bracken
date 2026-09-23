# FOUR HEROES WITH NO KIT — the brief

Daniel, 2026-09-23: *"I think we also had the idea of adding more abilities to the warden."* Chasing that turned up
something larger.

**This is a brief. Nothing here is built.** Strike through what you don't want.

---

## 1. The gap

There are **eight talents in the game**, and they belong to two heroes:

| hero | talents | class level |
|---|---|---|
| Pyromancer | 5 — Fire Wall, Cinder Step, Vent, Kindle, Wisp | **The Burning Village** |
| Knight | 3 — Shield Throw, Ground Slam, Rising Cut | — |
| **Death Knight** | **0** | — |
| **Freebooter** | **0** | — |
| **Paladin** | **0** | — |
| **Warden** | **0** | — |

These four are not *thin* heroes — their base kits are the deepest in the game. The Death Knight has an entire blood
economy; the Warden has reach bands, a deflect, VIGIL and the Phalanx; the Paladin has LIGHT, Mend, Aegis and
Judgement; the Freebooter has the pistol, the hook, rum and a parry. What they have is **nothing to buy and nothing to
choose**, so the Skills & Loadout screen is empty for two thirds of the cast.

**The sharpest single instance:** the Death Knight's own hero card says *"Buy skills with coins and equip them in
Skills & Loadout. At full blood, TAP F for the equipped skill or HOLD F for Blood Surge."* **The slot exists, the
prompt exists, and there is nothing that can go in it.**

## 1b. ABILITIES ARE BOUGHT; PASSIVES COME WITH LEVELS — Daniel, 2026-09-24

*"I want abilities, not talents. We can remove passives, they become default as you level up. You can see in the hero
menu the passives that will unlock at certain levels."*

The shop tab is **already called SKILLS** in the UI — `TALENTS` is only the internal array name, which is what made
this read as a change to something already dropped. The rule from here:

- **the shop sells ACTIVE ABILITIES ONLY** — the F-key kind;
- **passives are never bought.** They unlock automatically at hero levels, and the hero menu shows which arrive when;
- today exactly **one** existing skill is passive — `kindle` (Pyromancer) — so the migration of what already exists
  is a single item.

Hero XP and levels already exist (`heroXp`, `levelUp`, the `LV` in the HUD) to hang the unlocks on.

**Every proposal below is marked.** As written they come to **eight abilities and eight passives** — two of each per
hero, which also answers the open question about scope: two *purchases* a hero rather than four.

## 2. The shape an existing talent takes

`{ id, name, price, desc, needs: <level id>, needsName, hero, passive? }` — bought with coins, gated behind a level
you must have finished, mostly `F`-key actives with one passive each. Prices run 80–120. I'd keep all of that.

## 3. THE WARDEN — the one Daniel asked for

Her whole identity is **distance**: the last quarter of the shaft hits half again as hard, the middle glances, the
haft shoves people back out to the point. So her talents should be about *keeping* the range, not adding damage.

- **BRACE** *(ABILITY — bought in the shop)* — plant the butt in the ground. A charge that runs onto the point is spitted **whatever colour
  it is**. Today only a YELLOW charge spits, which means her signature move is switched off against half the game.
- **THE LONG WATCH** *(PASSIVE — arrives with a hero level, not bought)* — the tip band widens from the last quarter of the shaft to the last third. A pure
  reach buff, which is the most Warden thing possible.
- **SWEEP THE LINE** *(ABILITY — bought in the shop)* — a low horizontal arc that knocks a whole row back out to point range. Her one real
  weakness is being crowded; this answers it with her own vocabulary instead of a panic button.
- **THE STANDARD** *(PASSIVE — arrives with a hero level, not bought)* — the Phalanx she plants also stops what flies at it, and keeps filling VIGIL
  while it stands.

## 4. THE DEATH KNIGHT — fill the empty slot first

- **BLOOD DRAWN** *(ABILITY — bought in the shop)* — hurl the planted blade; it drags back through everything in the line, and every hit on
  the way home returns blood.
- **GRAVE CHILL** *(ABILITY — bought in the shop)* — the freeze from Blood Surge, on a tap, for a fraction of the bar.
- **HAEMORRHAGE** *(PASSIVE — arrives with a hero level, not bought)* — the nova's marks spread to whatever a marked foe touches.
- **SECOND HEART** *(PASSIVE — arrives with a hero level, not bought)* — a full ward that breaks no longer reels him. Once a fight.

## 5. THE FREEBOOTER

- **POWDER AND SHOT** *(PASSIVE — arrives with a hero level, not bought)* — gold loads two chambers, so there is a second shot before the reload.
- **GRAPPLE SHOT** *(ABILITY — bought in the shop)* — the hook fires along the pistol's line and pulls **you** to the foe, not him to you.
- **DUTCH COURAGE** *(PASSIVE — arrives with a hero level, not bought)* — rum's reckless phase widens the parry window instead of only raising the risk.
- **BROADSIDE** *(ABILITY — bought in the shop)* — a spread that takes a whole row, through guards, and empties him.

## 6. THE PALADIN

- **CONSECRATE** *(ABILITY — bought in the shop)* — ground that burns the dead and refills LIGHT while he stands in it. He already takes
  double against the dead; this makes that a place as well as a number.
- **REBUKE** *(ABILITY — bought in the shop)* — Aegis released outward as a shove that staggers what it turns.
- **LAY ON HANDS** *(PASSIVE — arrives with a hero level, not bought)* — Mend also clears venom and bleed.
- **OATHBOUND** *(PASSIVE — arrives with a hero level, not bought)* — LIGHT fills from blows he *takes*, not only from blows he turns aside.

## 7. Class levels — CORRECTED 2026-09-24

**I got this wrong the first time.** I wrote that only the Pyromancer has a class level and offered to design the
rest. Three of them were designed on 2026-09-20 and 09-21 and live in **`.claude/briefs/`**, a directory I had not
opened. Nobody should redesign them.

| level | unlocks | state |
|---|---|---|
| **THE BURNING VILLAGE** | Pyromancer | BUILT, and the only hero with a `coinNeeds` unlock gate wired |
| **THE UNBURIED FIELD** (`.claude/briefs/unburied-field.md`) | Death Knight | brief + **greybox** `src/draft/unburied-field.js`, with `tools/unburied-field-draft.mjs` |
| **THE POWDER DECK** (`.claude/briefs/the-powder-deck.md` + `-pitch.md`) | Freebooter | brief, no greybox |
| **THE CHURCH** (`.claude/briefs/the-lit-church.md` + `-pitch.md`) | Paladin | brief, no greybox. Renames Waymeet's boss to THE CRUSADER so the church's own boss can be THE PALADIN |
| — | **Warden** | **no class level WANTED** - Daniel, 2026-09-24: *"we do not need a warden class level (they are unlocked from the start)."* Her gap is TALENTS, of which she has none |
| — | Knight | starting hero; no unlock needed |

**THE UNBURIED FIELD IS THE ONE THAT IS NEARLY READY** — brief plus a greybox that passes its own draft tool. It is
the obvious next class level to build, and it needs no new design work.

**AND THE GATE IS NOT WIRED FOR ANYONE ELSE.** Only `pyro` has `coinNeeds`; the Death Knight, Freebooter, Paladin and
Warden can all be bought with no level behind them, so the design these briefs assume — beat the level, unlock the
hero — is implemented exactly once out of six.

## 8. What I will not decide alone

- **Prices and gating.** Which level each talent hangs off changes the campaign's shape, not just a number.
- **Whether four talents each is right.** The Pyromancer has five, the Knight three. Sixteen new talents is a lot of
  surface to balance and might be better as two each.
- **Whether the class levels are new levels or existing ones re-flagged.**
- **BRACE in particular.** Letting the Warden spit a RED charge is a real power increase, not a fix — red is supposed
  to mean "leave". It may be better as "a red charge is stopped but not spitted".
