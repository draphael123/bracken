# THE SUNKEN CARAVAN: amendments to its brief (`bracken/.claude/briefs/sunken-caravan.md`)

The original brief stands, except where the desert arc (`docs/desert-arc-brief.md`, 2026-09-21) changed it:
- **No sandstorm act.** The storm belongs to THE SEALED PYRAMID's face and the Skeleton King's last phase. Level 1 keeps a haze on
  the horizon as a tease. The seven sections are now THE WAY DOWN, THE CARAVAN ROAD, THE OX LINE, THE DUNE SEA, THE TRADERS' CAMP,
  THE SINKING WAY, THE HOLLOW'S RIM (`src/draft/sunken-caravan.js`, passing `tools/draft-level.mjs` and `tools/caravan-level.mjs`).
- **The machine:** THE AWNING WINCH at the traders' camp rolls the great awning out over the yard, which makes the yard shade.
- **Built ahead:** sunstroke, quicksand, the Dune Worm's state machine, the scorpion, vulture and sand goblin behaviour, the art
  (`docs/caravan-mechanics.md` lists it all).
- **Numbers the build must keep:** shade resets sunstroke in 1.2 s; no walk in the sun over 7.5 s; quicksand escapes at 6 presses
  a second in 0.5 s and never at 2; the worm's commit always bursts where it locked; its lunge lands at least 48 px off a wall.
