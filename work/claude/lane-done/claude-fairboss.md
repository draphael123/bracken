# claude/fairboss - THE WICKER QUEEN on a moving carousel

Base: claude/housekeep a6d58b4 (master 5d25df0 + the Maypole Ribbon relic). Lane: boss mechanics (fair L3's boss only; the level layout is the fairlevel lane's, the boss track the fairmusic lane's).

Daniel's verdict (2026-09-30): "I'd like the boss to be in a moving carousel and you have to jump on horses to avoid some attacks. Visually she looks good."
His choice: the platform SPINS and the carousel HORSES BOB on their poles as moving platforms.

## What changed

**The arena is one great carousel now** (src/wicker-carousel.js is the ride, pure; src/redraw/carousel_ring.js draws it).
- **The floor ring turns.** It carries a hero standing on the boards toward the far wall at 16 / 24 / 34 px/s by phase. A hero runs 92, so he can always walk against it. It carries her too, but only while she stands (frozen in a look, or during her blows). When she walks, she strides against it at her own pace. The ride starts when she wakes and winds down when she dies. The boards scroll so you can see it turning.
- **Ten painted horses on brass poles.** Five are on the front run at any time, and those are platforms. They ride the ring and bob between 16 and 40 px over the boards, so a jump (51 px) always reaches them and a standing hero (14 px) walks under them. Each horse bobs on its own beat. At the far end a horse goes round the back, drawn small and dim behind the centre column, and stops being a platform; a rider still on it is set down on the boards.
- **Look:** the canopy is striped red and cream the length of the green. The maypole is the centre column now, with band-organ pipes at its foot. The bonfire is the engine's firebox beside it (iron box, chimney, smoke). Her own art is unchanged.
- **Phases quicken the ride, and each quickening is told.** The bulbs flash red, the calliope plays, and "FULL DARK: THE RIDE QUICKENS" / "SHE IS ALIGHT: THE RIDE QUICKENS" show in the hint box. The new speed comes in 1.5 s later and eases up. The horses' bob also gets faster each phase (3.6 / 2.8 / 2.2 s), and the pattern changes: neighbours alternate, then a rolling quarter-step, then thirds.

**Her blows are a read between UP and DOWN** (src/wicker-queen.js). Every one is red `!!` and unblockable, told, and has ANSWER and HEIGHT rows in src/marks.js:
| blow | tell | answer | height |
|---|---|---|---|
| LOW LASH | 1.0 s, "LOW: JUMP IT" | jump, or ride a horse | low |
| **THE FLOOR BURNS** (new) | 1.5 s, the boards glow the length of the ride, "THE FLOOR BURNS: RIDE A HORSE" | get up on a horse (a hero on the boards burns and is thrown up) | low |
| HIGH LASH (now reaches riders: 10-64 px) | 1.0 s, "HIGH: DUCK IT" | get down on the boards and duck | high |
| **HER SICKLE, THROWN** (new) | 0.8 s, a red line at the height it will fly, "HER SICKLE FLIES: DUCK" | duck on the boards; it flies out to the wall and back | high |
| THE REAP (unchanged) | 0.6 s red eye glow | look at her (cancels) | low |
| THE CROWNING (unchanged, max 2 mummers) | no mark | - | - |

- She throws the sickle only at a turned back from 110 px or more away, never at a hero who is looking at her. It is the price of the lure.
- No new blow is told while her sickle is in the air, because a low blow under a flying sickle would have no answer. There is also a 1.4 s breath between blows.
- The old phase-3 fire trail is gone (fire on a moving floor read badly). Phase 3 burns the floor more often instead.

**The opening is kept (the fire) and made part of the carousel.** Look at her while she stands on the firebox's embers and she catches and burns open (1.35x damage; 0.25x elsewhere). There are two ways onto the fire:
- **Upstream: the ride brings her.** Hold her in your look and the ride carries her onto the fire. She starts upstream, so the first burn is the ride's lesson ("THE RIDE BRINGS HER TO THE FIRE").
- **Downstream: the lure.** After a burn she is flung off downstream and the embers are banked. Turn your back and she walks to you against the ride, across the fire; turn on her there ("LEAD HER ONTO THE FIRE, THEN FACE HER").

The facing rule, full dark (near look; 144 px with the Maypole Ribbon) and the crowning are unchanged.

**Her teaching lines now actually show.** Before, every line she said ("SHE BURNS: CUT HER" and the rest) went through number() and was silently dropped: the archfix lesson. They are now in src/hint-lines.js and reach the hint box. The hint-shown check is green, with no new silent lines.

**Music hook for the fairmusic lane:**
- Each frame of the fight the game calls `music.tempo(rate)` if audio.js has a `music.tempo`. The rate is 1.0 on the first ride and about 2.1 at the fastest.
- `BK.fairRing()` returns `{ on, speed, phase, quicken, rate }`.
- The arena track is still 'houndmaster' until that lane swaps it.

**Bot (src/lab.js):**
- Floor blows: it gets onto the nearest front horse that won't go round under it, and hops to the next one near the far end.
- High blows: it steps off the horse and ducks. Against the sickle it keeps its back to her mid-lure.
- Upstream: it stands beside her looking, and the ride brings them both.
- Downstream: it lures from the firebox's near edge.

**Tests:**
- tools/wicker-queen.mjs is rewritten to assert the new design: 30+ new pure assertions, the level, and a 14-step page run including a real-keys jump onto a horse.
- Mutations checked: raising the horses past the jump, lowering the sickle or the high lash, a flat speed-up, and allowing blows under a flying sickle each make it fail.
- tools/boss-openings.mjs had to quiet her new cooldowns (floorCd, throwCd) in its forced scenario, the same way it already quiets lashCd and crownCd. The assertion itself is unchanged.
- New tool: tools/fairboss-shot.mjs (one still).

## Numbers (bot pilots, normal health, salt 1, one life)
| hero | before | after |
|---|---|---|
| knight | win 61.3 s, 11 taken, 6 burns | win 77.2 s, 50 taken, 5 burns |
| warden | win 61.1 s, 0 taken, 6 burns | win 105.7 s, 16 taken, 6 burns |
| pyro | win 90.2 s, 0 taken, 8 burns | win 107.6 s, 74 taken, 8 burns |
| total | 3/3, median win 61.3 s | 3/3, median win 105.7 s (inside the 90-150 s band) |

Her hp is unchanged (640).

Stills: work/claude/fairboss/before.png (the old green, low lash told) and work/claude/fairboss/after.png (the carousel mid-fight, the floor told to burn, the knight up on a horse).

## Checks (all run by name, all green)
wicker-queen, harvest-fair, boss-fight-end, boss-openings, architecture, checkpoints, skins, dangling-paths, npc-removal, slopes-trace, hint-shown, audio-assets, tells.
- "mummer" is not a separate check; the mummers are covered by harvest-fair.
- slopes-trace is unchanged ("every frame of every level identical"), so no rebase was needed.
- `tells --write` added the two new MARK rows.

## UNVERIFIED
- Daniel's hands. The bot wins 3/3, which is above the house band of 60-75% wins. Its damage taken rose from 0-11 to 16-74.
- Co-op on the carousel: two riders on one horse, and a partner's look while you ride.
- Heroes other than knight, warden and pyro. The horse heights fit every hero's jump by the numbers only.
- Touch controls, and how the hint-box lines compete in a busy phase 3.
- Whether the fairlevel lane's edits to src/harvest-fair.js touch the lines this lane changed: the moversExtra array, the boss section, the `lamps` line.

## QUESTIONS FOR DANIEL (each has the recommended option already built)
1. **Ride direction.** It always turns one way, toward the far wall. Or should it reverse at each phase ("THE RIDE TURNS BACK")? Rec: keep one way. It is simpler to read, and the lure and "the ride brings her" stay learnable.
2. **Does the ride carry her while she walks?** Built: no. It carries her only while she stands, so the lure works and "hold her and the ride brings her" is the carousel's half of the opening. If you want her carried always, the lure gets much slower. Rec: keep.
3. **Difficulty.** The bot wins 3/3 with a median of 106 s. If your hands find it easy, rec: raise the floor-burn cadence or shorten the bank. Don't add hp.
4. **Her start.** She starts upstream so the first burn teaches the ride. Rec: keep.
5. **Sounds.** The new blows reuse her existing sounds (the floor uses the catch/burn fire, the throw uses the sickle and swish), and the quickening uses the calliope. Rec: let the fairmusic lane add a steam-whistle for the quickening and a whirr for the thrown sickle.
6. **Opening.** The fire opening is kept rather than "exposed when a horse carries you over her". Rec: keep; it is proven and readable. A crown strike from a horse could be a phase-3 extra later if you want one.
