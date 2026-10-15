# claude/cisternqueen3 - THE CISTERN QUEEN 3 (Daniel 10-14: "unclear"; scratch/brief-cisternqueen3-1014.md)

Base: master c33c3204. Port 8938. This was an OPUS lane, and it mostly removed systems. A sonnet tune lane comes next.

## What changed
**Removed (the brief's REMOVE list):**
- The stinger PURSE, BREAK, MOULT and REEL are gone: `tailPurse`, `breakStinger`, `moult`, `tailLeft`, `BROKEN_FOR` and `STING_MOVES`.
- The HOT / DOUSED / STEAM loop is gone: `douse`, `qWet`, the slowed tells and walk, the flooded-dive slip, the steam opening and the "douse on the floor" pour.
- The bot's steam and douse branches are gone.

**1. STRIKE THE STINGER (B10, B15).** Her stinger is how you hurt her.
- **The free stinger**, wherever her tail carries it, takes a blow WHOLE (x1.0). Each of her moves allows at most `tipCap` 2.5% of her health from it. After that she curls it away: blows land at x0.4, told "SHE CURLS IT AWAY", and the steel brackets show on it.
- **A stuck stinger** (lance, pin, slam, sting, bloom) takes x1.75 under its sting cap (unchanged).
- **Her shell and claws, front or back,** take x0.4 (the back was 0.55). The clank says "STRIKE THE STINGER".
- **In every opening** her tail lies on the floor behind her. The stinger there is big and gold and takes x1.9. Her body takes x1.0. Both count against the same `openCap`.
- **boss-greed:** a blow on the stinger is never counted as greed. Thrashing is not an opening.

**2. SET HER ALIGHT (fire stuns her).** Three fires set her alight:
- a thrown torch on her floor oil
- her burrow running up into burning oil
- a hero's own fire held on her for 2.5 s

She THRASHES for 0.8 s (her heat burns anyone close, and she drops off a wall or the wellhead to the floor). Then she SAGS for 3.6 s: this is the opening, with her tail drooped to the floor. After that comes her ward (B3), then BLACKENED for 10 s (told "HER SHELL IS BLACKENED: NOT YET"). When it ends, "HER SHELL COOLS: FIRE TAKES HER AGAIN". In the flood she is wet and fire never takes her (told).

**3. SHE SURFACES: THROW WATER.**
- **The jars:** two jar racks stand by the springs. E takes a jar, and E again sets it down. The jar uses the jug's told arc (UP lobs, DOWN tosses short), and ATTACK throws it. The rack refills 4 s later. A blow on you spills the jar. You cannot climb while carrying one.
- **The burst window** opens 0.45 s before she bursts out (the spot shows a bulge, dust and a rumble) and closes 0.6 s after she is out. It covers the strike, the dune wave surfacing, and her phase-two skitter out of a tunnel.
- **Water in the window:** a jar, the skin's pour on her spot, or the bucket by the sump makes her SLIP. She is drawn on her back for 3.4 s, with the stinger drawn exactly where a blow finds it.
- **Water early or late** is a splash, told "A SPLASH: THROW AS SHE SURFACES".

**4. Hint lines** are said where they are used and routed in hint-lines:
- "STRIKE THE STINGER" when she wakes and on her shell's turn
- "SET HER ALIGHT: SHE FALLS" when she steps onto unlit oil that would catch
- "SHE SURFACES: THROW WATER" at the first burst tell
- "E TAKES A JAR: THROW IT AS SHE SURFACES" at a full rack

Usable oil glows amber while fire can take her, and full racks glint. The 16 dead rework lines are unrouted (hint-shown).

**5. The phases keep their arenas.**
- P2: the wall pour from her ledge and the wellhead pour or bucket (ON HER BACK) are kept.
- P3: the grab break (REARING) and the stuck stinger are kept.
- The B17 moveset is unchanged: 8, 8 and 5 told attacks.

**Bot (`queenPlan`):**
- It takes a jar in phase one, gets off her spot and throws on the burst (low, mid or lob, whichever lands on the spot).
- It pours the skin only in the window.
- It stands off her while she thrashes.
- It cuts the stinger in openings.
- It sets the jar down to cut, and outside phase one.
- It never swings while carrying a jar (a swing would throw it).
- Its torch plan only runs when fire can take her.

**Wiring:**
- main.js: `CQH.interact` comes before the torch and the pour, and the hands ctx gains `T`, `cellGet`, `keys` and `oilCells`.
- lab.js passes `jar` and `tipPays` to the bot.

## Checks (PORT 8938, one page at a time)
- **GREEN:**
  - cistern-queen: 162 checks, up from 147
  - boss-openings: slip 3.4 s, ablaze 3.6 s, fallen 3.2 s, rear 3.2 s
  - underwell, damage-caps (11), boss-greed, boss-fight-end (63/63), boss-read, tells, mark-integrity, weak-bosses
  - hint-shown, after unrouting the dead lines
  - textfit `hints,plates --strict`: 0 issues
- **Mash 0/6** (stamped in docs/mash-bot.json, boss row): she keeps 75-94%.
- **Not run:** cast-poses (not on master), the full suite (not this lane's).

## Rates (boss-rates underwell, practiced, L36, profile human, flasks kit, 3 seeds)
**knight 2/3, warden 0/3, pyro 1/3 = 33%. This is LOW, by 27 points, and the warden is at zero.** The bot opens her 9-37 times a fight; it dies in long fights. For the sonnet tune lane:
- First try her blows dmgK 2.9 -> about 2.2-2.4, keeping hp at 2300.
- Then try `tipCap` 0.025 -> 0.035.
- Re-measure on 12 seeds.

## Deliberately changed tests (Daniel's design change, stated in each)
- **cistern-queen:**
  - The pour on the mound now counts only in the burst window (stricter: a pour before the window spends nothing).
  - The fire check is now: she thrashes, sags open for at least 3 s with her stinger on the floor, is warded, blackened and told, and relights only after she cools (told).
  - The rework's loop and purse sections are replaced by: everything gone, alight, water window, flipped draw, every opening's stinger, stinger take, jars.
- **boss-openings:**
  - "E at her on the open floor": DOUSED is gone, so the check is now that E neither opens nor wets her. The old check wanted one sip spent.
  - The slip is now taken in the window.
  - ABLAZE is added to the ">= 3 s" openings.
- **underwell:** the lob now drives her up ALIGHT: she thrashes, then sags open for more than 2.5 s, named on her bar. It was SCORCHED.
- **damage-caps:** the `cisternqueenTail` row now holds her planted stinger's own cap. The purse it held is gone.

## ART (for the art lane; everything below is greybox)
1. **THRASH** (alight): its own windup and flail frames (B16). It reuses the stinger-broken reel frame today.
2. **SAG** (ablaze opening): down on her belly, the tail drooped flat to the floor, embers in the seams. Today it is crouch + splay + the char palette.
3. **SLIP onto her back:** a skid-and-flip frame with a splash. It reuses `fallen` (flipped) today.
4. **The tail lying to the floor** in every opening: check the drawn path reads at game scale.
5. **WATER JARS:** the clay jar (on the rack, in the hand, in flight), the rack, and the shatter splash. Today these are rect jars and a plank rack.
6. **The burst tell:** a clearer "throw now" cue at the spot when the window opens (a wet ring?). Today it is the bulge, dust and a 1-px shake.
7. **The usable-oil glow** (an amber strip today) and the rack glint.
8. **Unused now:** the stinger-broken stump and the DOUSED drip pass (except the slip's wet shell).

## QUESTIONS FOR DANIEL
1. **The free stinger's cap.** Built: x1.0 up to 2.5% of her a move, then she curls it away (x0.4, told). Recommendation: keep it so she doesn't melt. The alternative is no cap.
2. **Jars in phase two.** Built: a jar knocks her down only as she bursts out of a tunnel. On her wall or the wellhead a jar just splashes; the ledge pour and the bucket still bring her down. Recommendation: keep. The alternative is that a jar knocks her off her wall too, which makes it easy from the floor.
3. **The skin's pour.** Built: it still works, but only on her spot in the window (it is the level's own verb). Recommendation: keep.
4. **The pyro's fire.** Built: it sets her alight after 2.5 s held on her, under the same 10 s blackened cooldown. Recommendation: keep.
5. **Her back.** The brief said "shell + claws at 0.4", so it went from x0.55 to x0.4. Recommendation: keep (one read: STRIKE THE STINGER).
6. **B14 key adjacency.** The Djinn (Well Town) also uses a thrown pail. Check the road order: Well Town -> Underwell.
