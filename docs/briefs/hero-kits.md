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

## 2. The shape an existing talent takes

`{ id, name, price, desc, needs: <level id>, needsName, hero, passive? }` — bought with coins, gated behind a level
you must have finished, mostly `F`-key actives with one passive each. Prices run 80–120. I'd keep all of that.

## 3. THE WARDEN — the one Daniel asked for

Her whole identity is **distance**: the last quarter of the shaft hits half again as hard, the middle glances, the
haft shoves people back out to the point. So her talents should be about *keeping* the range, not adding damage.

- **BRACE** *(active)* — plant the butt in the ground. A charge that runs onto the point is spitted **whatever colour
  it is**. Today only a YELLOW charge spits, which means her signature move is switched off against half the game.
- **THE LONG WATCH** *(passive)* — the tip band widens from the last quarter of the shaft to the last third. A pure
  reach buff, which is the most Warden thing possible.
- **SWEEP THE LINE** *(active)* — a low horizontal arc that knocks a whole row back out to point range. Her one real
  weakness is being crowded; this answers it with her own vocabulary instead of a panic button.
- **THE STANDARD** *(passive, VIGIL)* — the Phalanx she plants also stops what flies at it, and keeps filling VIGIL
  while it stands.

## 4. THE DEATH KNIGHT — fill the empty slot first

- **BLOOD DRAWN** *(active)* — hurl the planted blade; it drags back through everything in the line, and every hit on
  the way home returns blood.
- **GRAVE CHILL** *(active)* — the freeze from Blood Surge, on a tap, for a fraction of the bar.
- **HAEMORRHAGE** *(passive)* — the nova's marks spread to whatever a marked foe touches.
- **SECOND HEART** *(passive)* — a full ward that breaks no longer reels him. Once a fight.

## 5. THE FREEBOOTER

- **POWDER AND SHOT** *(passive)* — gold loads two chambers, so there is a second shot before the reload.
- **GRAPPLE SHOT** *(active)* — the hook fires along the pistol's line and pulls **you** to the foe, not him to you.
- **DUTCH COURAGE** *(passive)* — rum's reckless phase widens the parry window instead of only raising the risk.
- **BROADSIDE** *(active)* — a spread that takes a whole row, through guards, and empties him.

## 6. THE PALADIN

- **CONSECRATE** *(active)* — ground that burns the dead and refills LIGHT while he stands in it. He already takes
  double against the dead; this makes that a place as well as a number.
- **REBUKE** *(active)* — Aegis released outward as a shove that staggers what it turns.
- **LAY ON HANDS** *(passive)* — Mend also clears venom and bleed.
- **OATHBOUND** *(passive)* — LIGHT fills from blows he *takes*, not only from blows he turns aside.

## 7. Class levels

The Burning Village is the Pyromancer's and it is the only one. Four more would complete the set — one per hero,
each teaching its hero's kit the way the Village teaches fire. **I have not designed these**, because a class level
is a level, and I don't build levels you haven't seen a brief for. If you want them, say so and they get briefs of
their own.

## 8. What I will not decide alone

- **Prices and gating.** Which level each talent hangs off changes the campaign's shape, not just a number.
- **Whether four talents each is right.** The Pyromancer has five, the Knight three. Sixteen new talents is a lot of
  surface to balance and might be better as two each.
- **Whether the class levels are new levels or existing ones re-flagged.**
- **BRACE in particular.** Letting the Warden spit a RED charge is a real power increase, not a fix — red is supposed
  to mean "leave". It may be better as "a red charge is stopped but not spitted".
