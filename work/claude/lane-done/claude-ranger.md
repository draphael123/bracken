# claude/ranger - THE RANGER, the fourth free starter (OPUS kit build, 2026-10-14)

Brief: scratch/brief-ranger.md (+ brief-riposte.md, brief-plunges.md, design-standard B10/B14/B15/B16). Base: origin/master 2cf3294b (BATCH91 live).
Branch: claude/ranger. Port 8903 throughout. **ART IS PLACEHOLDER** (a Sonnet art lane follows Thursday - the full list is below). **NO TUNING** was done
(a Sonnet tune lane follows); every number is a first pick, kept in one table (src/ranger.js `RG`).

## THE KIT (src/ranger.js; numbers in `RG`)
| Move | Input | What it does |
|---|---|---|
| QUICK SHOT | tap X | let go before the draw starts (0.14 s): an arrow from the quiver, weak (x0.6), SHORT - it arcs and is at her feet ~70 px out (measured). Tag `shot`. Works in the air and IN THE BACKFLIP. |
| THE DRAW | hold X | ROOTED while she draws (0.55 s to full). Let go: an arrow that goes harder (x0.9 -> x1.7) and further the longer it was drawn - a full one lands ~140-150 px out (under half a screen). Past half a draw it is tagged `heavy` (B14 heavy key). Held at full she keeps it (3 s, then it goes). |
| KNIFE | X point-blank (a foe inside 18 px) or with an EMPTY quiver | the ordinary swing, short (box 17 out) and a little lighter (x0.75). DOWN+X on her feet = the knife's low sweep (`sweep`). Hold X empty = a knife stab (heavy). X early in a FORWARD roll = the knife's dash attack. |
| RISING SHOT | UP+X | an arrow steeply up (`rise`: B14 FROM BELOW, the wing family's key). |
| DOWNWARD SHOT (her plunge) | DOWN+X in the air | an arrow straight down (`plunge`: B14 FROM ABOVE) and a small HOP UP off the release - she stays above the fight. Empty: a knife plunge. |
| THE QUIVER | - | 5 arrows. A loosed arrow STICKS (floor, wall, or the foe it hit - it falls when the foe does) and GLINTS; walk over it to take it back. One trickles back every 6 s (never stuck). Lost after 30 s lying, or off the level. |
| HUNTER'S FOCUS | - | fills ONLY from arrows that land from the SWEET SPOT (52-138 px from where they were loosed - not point-blank, not at the end of the flight). Full: |
| - MARK | UP+C | the nearest foe ahead (300 px, walls do not hide it) is MARKED 10 s: every blow on it lands x1.33 (from anyone); a red reticle drawn on the late pass (over walls/dark). |
| - PIERCING SHOT | a FULL draw with full focus | flat, fast, through every foe in a line (240 px), x1.9, `heavy`. |
| BOW-BASH (her PARRY) | tap C | a short shove (17 px, small damage, knocks small foes back). Tapped AS a yellow blow lands (the shared tap beat, RP_K.tap) = THE PARRY via src/riposte.js: nothing taken, the foe reels (shared reaction) and is KNOCKED BACK OUT TO RANGE, and her NEXT ARROW is the riposte (tag `riposte`, x2). Red !! = TOO STRONG. Off the beat the bash is no guard: the blow lands. |
| SNARE | DOWN+C on the ground | a cord loop at her feet (1 at a time; 14 s). A common foe that walks in is HELD 1.6 s (elite 0.8); a boss/mini is only CHECKED (poise lean + a 0.2 s flinch - never a lock, B3/B13). |
| BACKFLIP | dodge | away from what she faces (she does not turn), up off the ground; the roll's grace; X in it is a quick shot. Holding the way she faces = an ordinary forward roll. |

Every B14 key with base kit: plunge (downward shot), rise (rising shot), sweep (knife low sweep), behind (position), throw (carry-throw, shared), heavy (half+ draw / knife stab), riposte (bash on the beat -> next arrow), verb (level). tools/ranger.mjs proves the tags.

## HERO CONTRACT
- HEROES entry (desc), HERO_LOOP, TBR `THE BOW / THE HUNT / THE WILD` + TREE_WHO, 90 hp, perks FULL QUIVER / PATIENT EYE, HERO_SHORT, pick lines/role/preview/SIG (VOLLEY), trial name (HUNTER'S FOCUS), HUD (focus bar + an arrow-stroke per arrow in the quiver; plate: FOCUS: UP+C MARK / QUIVER EMPTY), controls card (shoot/knife, draw, snare, rising shot, downward shot, bow-bash, mark, BACKFLIP), crouch hint (snare), voice (women's kit pitched up), parry tone, dance jingle (hunting horn), commit row, roll cost/len, run x1.04, finisher BROUGHT DOWN, flask head box, DASH_STRIKE row (knife in).
- TALENTS: 9 actives on the STARTERS' ladder (L1 VOLLEY, L3 THE HAWK, L5 LEAP BACK, L7 BEAR TRAP, L9 ARROW RAIN, L12 SMOKE ARROW, L14 SECOND QUIVER, L17 HEARTSEEKER, L20 THE WILD HUNT) + 21 passives (one a level 1-19, capstones 22/23/24), each with a consumer (rgTal), icons (RG_ICONS) and glyphs.
- HER TRIAL YARD (trial_ranger, appended): quick shot, full draw, take arrows back, bow-bash on the flash, the marks, backflip, downward shot, dash, sweep, focus/mark, skills.
- ROSTER: Knight/Warden/Geomancer/RANGER are the free starters (DEFAULT_HEROES + hero-roster STARTERS). The Berserker is BUYABLE (10 silver; locked card = silhouette + "BUY IN THE STORE - 10 SILVER"). A slot that owns him keeps him; a device roster written while he was a starter keeps him (parseRoster keeps every listed hero).
- CO-OP / ONLINE: all her state lives on the hero object (P.rgQ, P.rgArrows, P.rgFocus...), main.js runs/draws her through asPlayer, so a P2 ranger carries her own quiver; the online guest picks from coopPickList (the roster), where she is open as a starter.
- BOT: lab.js LAB_REACH.ranger is live - 64 (stand-off at the sweet spot) with arrows, 16 (knife) without; she taps C on the beat like the warden/berserker (DEFLECTS).

CHECKS / SANITY / ART LIST / QUESTIONS: below.
