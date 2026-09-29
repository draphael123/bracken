# claude/archmage2 — THE ARCHMAGE, harder

Brief (Daniel, 2026-09-29): "the Archmage fight is a bit too easy." This is the Mage's Folly's boss, id `archmage`. The
Falling Tower's undead archmage (`undeadmage`, tools/archmage-pilot.mjs, tools/archmage-rings.mjs) is a different boss and
was not touched. Four things were decided, and all four are built. His health is unchanged (720 in EHP). Every new blow is
told with a mark and has an answer tag. Nothing stun-locks.

## What changed (src/main.js, the Archmage's section; src/lab.js; src/marks.js)

1. **The ward fights back.**
   - He still wards with three runes, but only two circle him now. The third sits on a stack of his books, 5 tiles tall,
     that rises out of the floor at whichever end of the room is nearer to him. The spot has to be clear of you and of him
     and must be bare floor.
   - While the stack is up, the books hold its rune: a blow on it says THE BOOKS HOLD IT.
   - Strike the stack's own rune at its foot (lit and blinking, on the side facing the room) and the stack slides down into
     the floor, a course at a time. This is the library's rune/slide rule. Its rune comes down to sword height.
   - **Reseal:** once the first rune is cut, the others have 6 s. The countdown shows 3-2-1 over him, and the cut runes
     hang as ghosts that brighten as time runs out. If any rune is still standing at 0, every cut rune seals again and the
     stack rises again with its rune on it (THE WARD SEALS AGAIN).
   - The ward now lasts up to 22 s before he gives up (it was 14).
   - Fix along the way: a bolt he casts during his ward now goes back into the ward. Before, it dropped him to idle, and
     idle started a fresh ward, so every rune came back and a last rune cut during the bolt was wasted.
2. **The room attacks in each rewrite.** Each one is a mode of his, has a mark over him and a marker where it lands, and
   has an ANSWER row. The first comes 2.5 s into each room, then one every 6.5 s. None comes while he is open, while you
   have reached him, or while you are in the acid.
   - **THE FLOOD — `crushTell`, `!!`, dodge.** A stack of books shakes in the dark over your footing, and a red column is
     drawn down to where you stand (0.9 s tell). Then the stack slams down. It is unblockable (24) and catches you standing
     or mid-jump. Stepping out from under it answers it.
   - **THE ORRERY — `booksTell`, `!`, block.** Three books come off the wall about 180 px away (never nearer than 90),
     hang there shaking for 0.8 s, then fly at your chest height one after another (210 px/s, 0.3 s apart). A shield turns
     them. Other heroes roll through them or jump them.
   - **TURNED OVER — `glyphTell`, `!!`, dodge.** A violet glyph with a red rim opens on the ceiling under your feet
     (0.9 s tell). When it fires, it takes you whether you are standing or mid-jump: the room rights itself for you alone,
     costing 8 unblockable damage with no knockback. 0.7 s before the end, IT TURNS AGAIN is shown, and 1.6 s later you are
     turned over again, back onto the ceiling. The floor under this room is plain floor, so this is never a fall to your
     death. Stepping off the glyph during the tell answers it.
3. **Paired spells from stage 2 — `pairTell`, `!!`, dodge.**
   - A red circle lands under you and a yellow circle lands 48 px to one side, and both hit together (0.9 s tell). The
     yellow one goes on his side, or on the other side if a wall is there.
   - There is always an answer: the side away from the yellow circle is clear, and a jump straight up clears both.
   - He never pairs in the duel (stage 1).
   - Timing: one pair every 5.5 s. There is a gap of at least 1.5 s between a pair and a room attack.
4. **A shorter opening.**
   - Two clean blows and he recovers (HE RECOVERS). Only the hero's own blows count (`hurtAs`): a burn ticking on him does
     not, and a sweep that hits him twice within 0.15 s counts once.
   - The window is 2.6 s in the duel (was 4.6) and 3.2 s in the rooms (was 5.5).
   - A blow while he is open now does 3x (was 2x), so two blows are a real piece of him. The old per-opening cap of 18% of
     his health still applies.
   - The next ward comes 4.5 s after an opening in the duel (was 6).

The bot: `mageAdvice` and the lab now handle all of this. They slide the stack first, then cut its rune, then the two
circling him. They roll out from under the crush and off the glyph late in the tell, jump over a pair, and block the books
(heroes without a shield jump them). The stack has its art drawn in `drawMageTiles`. The crush, the books, the glyph, the
second circle, the sealed rune and the ghost runes are drawn in `drawMageOverlay`. The bestiary card and the ward hint say
what he does now. Numbers live in `ARCH` (src/main.js) and are exposed to tools as `BK.archCfg()`.

## Numbers, BEFORE / AFTER (tools/folly-pilot.mjs: knight / warden / pyro, seed 1, NORMAL health, 240 s cap)

| hero   | before                                   | after                                    |
|--------|------------------------------------------|------------------------------------------|
| knight | death 46.5 s, he had 30% left, 5 openings | death 72.7 s, he had 42% left, 8 openings |
| warden | **win 78.4 s**, 8 openings               | death 62.9 s, he had 35% left, 9 openings |
| pyro   | death 28.1 s, he had 66% left, 2 openings | death 34.6 s, he had 66% left, 3 openings |

- Wins went from 1/3 to 0/3.
- Before, the bot landed up to 8-18 damage frames in one opening (the free combo). After, it lands 2.
- What hurt it after: the crush (knight, 48), the pair (warden, 32), plus his bolts and touching him, as before.
- The bot is a weak player: it lost 2 of 3 fights before this change too. These numbers show direction, not a verdict.

## Checks (named runs only)

- New: **archmage-folly**, added to tools/check.mjs. It proves all four decisions in the page on a real fight. It is red
  on master a840ae8: 23 fails, run from a throwaway `git worktree` of that commit. It is green on the branch.
- Green on the branch:
  - The 7 required checks: architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (unchanged, no
    rebase), npc-removal.
  - The level's own checks: folly-runtime, archmage-room, archmage-rings, tower-ascent, tower-collapse, tower-cutouts,
    tower-flyers, tower-hall, watchtowers, courtyard, witchlight, additional-areas.
  - The combat tables: tells (`--write` run; the four new rows are generated), answer-tags, boss-openings, zoom-coverage.
- **untold-told** is flaky on the crow, on master as well as on this branch. It failed once on the branch during the batch
  run. After that I ran it twice on each: master passed once and failed once, the branch passed both times. None of this
  lane's rows touch the crow.

## Unverified

- Nobody has played this by hand. The told windows (0.8-0.9 s), the 6 s reseal and the 2.6 s / 3.2 s openings were set
  by reading the code and running the bot, not by Daniel's hands.
- The whole fight is longer now. An opening is 2 blows at 3x, so a knight does about 75 per opening, against up to 129
  before. The duel is about 4 openings instead of 2. I measured this only with the normal-health bot, which died each
  time; I did not run a refill-health pilot to time a full win.
- The art for the stack, crush, books and glyph is drawn in code (rectangles and ellipses in the room's own colours). It
  is not baked sprites, and no screenshot was taken.
- The stack is tiles, and it is cleared if you die in the middle of a ward (`mageReset`). The flood's own stacks
  (`MG.stacks`) are not cleared the same way after a death mid-flood. That is older code and I did not touch it.

## Questions for Daniel (each with my recommendation; the recommended option is what is built)

1. **One room attack per rewrite, or all three everywhere?** Built: the flood crushes, the orrery throws books, and the
   room turned over opens glyphs, each where it makes sense. Recommend keeping it that way; mixing them would crowd the
   rooms.
2. **Open multiplier 3x (was 2x).** With 2 blows per opening the fight has about twice as many openings as before, so it
   is harder and longer, not only harder. Recommend playing it at 3x. If it drags, go to 4x (about as many openings as
   before, each one shorter) rather than giving more blows per opening.
3. **The stack slides DOWN into the floor.** The library's shelves slide UP into a recess, but this stack rises out of
   the floor carrying the rune, so sliding it down is what brings the rune to you. Recommend keeping it.
4. **Reseal at 6 s, stack at the end nearer to him.** That is enough to slide the stack, cut its rune and run back to cut
   both runes circling him, if you take the stack first; take it last and the ward seals again. Recommend 6 s. Use 5 s
   for harder, 7 s if it feels unfair.
5. **The glyph deals 8 damage when it takes you.** A flip on its own would do no harm, and the audit only marks a blow.
   Recommend keeping the small hit. The alternative is a mark-free flip (a quiet windup), which would give it no answer
   tag.
