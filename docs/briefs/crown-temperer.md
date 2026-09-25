# THE TEMPERER — a new foe for HIGHCROWN (brief)

Daniel, 2026-09-24: *"I like the temperer goblin."* **Built** (cc9dd41, e964fc3): three in Highcrown, at 255, 621 (it was 624, over nothing, until 2026-09-25) and 727,
proved by `tools/temperer.mjs`. What follows is the brief as it was approved.

Rule it satisfies: **F10** — every level brings at least one foe the game has never seen, and it is not its boss.
Highcrown currently fails F10: its only new creatures are the Goblin Queen and the Forgemaster.

---

## The gap, measured

Highcrown places fourteen foe kinds and they are a **complete army** — soldier, heavy, brute, shield, pike, javelin,
archer, sentry, gobmage, hearthgob, hound, harpy, goat, rockgoblin. Melee, reach, ranged, guard, caster, beasts.
Nothing is missing from it as an army, which is why it is hard to see what it lacks.

What it lacks is not a *role*. It is this: **every foe in this game arrives at full strength and stays there.** There
is no enemy anywhere in BRACKEN whose power is something it has to GO AND GET, and therefore nothing you can prevent.

And Highcrown is the level that should have one, because **the castle is full of fire nobody uses**: an anvil at 542,
a hammer at 534, a boiler at 560, six hotplates from 482 to 570 — and six braziers scattered right across the level
at columns 187, 252, 263, 619, 718 and 740. The Forgemaster is its mini. The whole place is a working forge and not
one regular foe touches any of it.

## The one line

**He breaks off the fight, runs to the nearest fire, and comes back with the blade glowing.**

## The three states

| | |
|---|---|
| **COLD** | An ordinary goblin with a long blade. Slower than a soldier, no shield. On his own he is nothing much. |
| **GOING** | He disengages and runs for the nearest lit brazier. **He does not defend himself while running.** |
| **HOT** | At the fire for about a second and a half, then back — and while hot his next blow is **unblockable** and sets you alight. The glow fades on a timer whether he lands it or not. |

## What it asks of the player

**A question about attention, in a room full of other goblins.** He is the least dangerous thing on the screen right
up until he isn't, and the moment he turns and runs you have to decide: break off what you are doing and chase, or
eat the hot blow.

- **Catch him at the fire** and he is defenceless — the opening is generous and obvious, and you caused it.
- **Let him go** and you are fighting a soldier plus an unblockable, which in a hall with a heavy in it is a real cost.
- **Put the brazier out** *(see below)* and he has nowhere to go.

This is **A11 turned inside out.** Everywhere else in the game the player causes an opening in the boss; here the
player *prevents* the enemy causing one in itself. Same lesson, read from the other side, which is exactly what makes
it worth building rather than being another goblin with a different weapon.

## Told attacks

Three, and the third only exists while he is hot:

1. **THE LONG CUT** *(yellow, blockable)* — a slow overhand with a two-hander. His ordinary blow.
2. **THE SHOULDER** *(yellow)* — a short shove to make room when you crowd him, so he can break off. It is how he
   starts a run, and it is the tell that he is about to go.
3. **THE QUENCH** *(red, unblockable, HOT ONLY)* — the glowing blade comes down and the ground where it lands stays
   alight for a moment. One use, and the glow is spent whether it hits or not.

## Silhouette

**Read him by the blade, not the body.** Cold, he is a plain goblin with an over-long two-hander — deliberately
unremarkable, because the point is that you stop watching him. Hot, the blade is the brightest thing in the room and
throws light on the wall behind him, so a player who has learned him can see across a hall that someone is coming
with a hot blade. The run itself is the real telegraph: **a goblin running AWAY from you in this game means one
thing only.**

## Where he goes

The halls with braziers in them — **187, 252, 263, 619, 718, 740** — never the forge hall itself (482–570), which
belongs to the Forgemaster and does not want a second fire idea in it.

Two or three in the level, always with other goblins. **Alone he is a non-event, and that is correct**: he is a tax on
your attention during someone else's fight, not a duel.

## What to check

- `tools/one-new-foe.mjs` — Highcrown should **leave the grandfather list** when he lands. The tool fails if a level
  sits on that list without needing to, so it is self-cleaning.
- `src/threat.js` — he needs a weight the day he is placed or `tools/threat-holes.mjs` fails. He is worth more than
  his blows because of what he costs you in attention, like the Runner: compare `soldier: 3`, `runner: 1.5`
  ("worth more than the hurt he does, because what he costs you is everybody else"). **3**.
- `tools/tells.mjs` — three tells: two `!`, one `!!`.
- **A3** — his heat cooldown must be initialised, or he will simply never run and nothing will tell you.

## What I have not decided

- **Whether braziers can be put out.** It is the better answer — it gives the player a way to solve the room rather
  than react to it — but the Lamplit Street already owns "lights that go out", and a second level with extinguishable
  fire risks reading as the same idea twice. **Daniel's call.**
- **Whether the hot blow should set the ground alight or just the player.** Ground fire is `hearthgob`-adjacent and
  Highcrown already has firevents and firepits; it may be one hazard too many in a hall.
- **The name.** Daniel said "temperer goblin" and it reads well, but tempering is what you do AFTER quenching — if
  that bothers anyone, the honest smithing word for heating to work it is *forging*, and THE FORGEHAND is available.
