# claude/queen4 - THE CISTERN QUEEN, Daniel 10-07 (Opus) - DONE

## What changed

### 1. THE VENOM BLOOM replaces the DEATH ROLL (P3's new move, B5)
- The tell is `bloomTell`, 0.85 s. It is told four ways: a red !! (no shield takes it), the hiss, the word "VENOM BLOOM: OUT OF THE RING BEFORE IT BLOOMS" (the first two times), and VENOM BLOOM! on her bar every time.
- During the tell she plants: legs splayed, claws down, tail arched high, stinger glowing green.
- The ring it will fill is drawn on the water from the first frame: a blinking green/red dashed ellipse, 72 px either side, with posts marking both edges.
- She then drives the stinger into the floodwater (0.16 s). A green slick spreads from it over 1.4 s, with a bright edge you can see growing out toward the ring.
- Then it **blooms** for 0.3 s: venom is thrown up across the whole ring. It does 26 x dmgK damage and adds 2 venom stacks to anyone standing on the floor inside the ring. You are safe outside the ring or up on a ledge.
- After the bloom she tugs the stinger free (0.35 s).
- **The stinger is exposed while it is in the water** (the drive, the spread, the bloom and the tug) and wears the gold ring:
  - a hit on it does x stingMul;
  - the total is capped at one sting (stingCap, 7% of her health), so it stays inside the fight's opening caps;
  - it pays off for players who stay close and then get out before the bloom.
- **ENRAGED combo:** SNAP-SNAP-STING now leads into the VENOM BLOOM; the stinger already in the water blooms.
- Supporting changes:
  - the mark, answer (dodge) and height (low) rows;
  - MARK regenerated (`tells --write`);
  - the hint line;
  - sounds and a burst effect;
  - the well-town concept doc.
- **Bot answers:**
  - Both the v1 and v2 bots get out of the ring and then wait the bloom out.
  - A v2 bot that is already close cuts the stinger first, but only when there is still time to escape.

### 2. BROOD SHIELD cut from her fight (design change)
- Removed from her phase-3 cycles, along with `broodTell`, the brood spawner and drowning, her keep-back, the bot's brood branch, the hands' spawnBrood/drown, and the two brood hint lines.
- The flood's line is now "THE CISTERN FLOODS: THE WALL OF THE SHAFT GIVES".
- The brood stay in the level as foes.

### 3. Animation pass ("her animations jumping around look really awkward")
- **S.view** (src/cistern-queen.js `view` / `stepView` / `framePoint`) is one eased transform. The art draws her with it, and `tipOf` finds the stinger's hitbox with it, so the stinger you see is the stinger you hit.
- Every former pop is now motion:
  - **To a wall:** she scuttles across the floor (330 px/s), turns her back to the wall through a squash, and backs up it tail-first (0.5 s).
  - **Wall to wall:** she climbs down her wall (0.4 s), scuttles across, and climbs the other. The old 0.7 s diagonal glide is gone.
  - **Shaft:** she scuttles under it and leaps up, flipping to grip (0.55 s). She drops out of it (0.4 s). The pounce is an arc out of the shaft onto the marked spot; she is no longer set over the spot at the tell's end. Its hitbox and window are unchanged.
  - **Burrow:** she sinks into the sand over the dive tell while dirt flies, and bursts back up in 0.22 s (strike, charge end, slip, fire).
  - **Ambush:** she crawls down her wall into the tunnel's mouth during the tell's first 0.4 s; she is visible and hittable until she is in. She comes out of the tunnel's mouth in a burst of dirt, clipped so she emerges from the wall.
  - **Falls and repositions** (off her wall onto her back, the flood's start) are eased with gravity, not popped. Rotations are capped at 12 rad/s, and turnarounds and flips are squashes.
  - **Anticipation and follow-through:** she pulls back before every blow, thrusts into it, and eases out afterwards. The crouch before the lunge, pounce and slam is now in the transform, so it moves her stinger too.
  - **Legs:** a six-frame gait wave keyed to the ground she covers, so no moonwalking. Legs churn while she digs and scrabble on the wall.
  - **Breathing idle:** a four-beat heave while she stands, clings, hangs or is planted.
- Tell lengths are unchanged.
- Visual check: `PORT=8720 node tools/cisternqueen-motion.mjs` writes contact sheets per move to work/claude/queen4/after/ (not committed, not in the suite).

### 4. A bot gap fixed (not a design change)
- The bot never answered THE STINGER SLAM: there was no `sslamTell` branch, so every slam landed. It was the warden's biggest damage source (about 55 hp per fight).
- The bot now steps off the red ring, the way a player reads it.

## Rates
Measured at her campaign level, L32, with `PORT=8720 node tools/boss-rates.mjs underwell --ways=practiced --seeds=8 --jobs=2 --profile=human` (dry: the human profile never drinks).

| Health | Damage | Bot | Knight | Warden | Pyro | Overall |
|---|---|---|---|---|---|---|
| 1650 | x0.55 (master) | before the slam fix | 6/8 | 5/8 | 8/8 | 79% (high) |
| 1900 | x0.62 | before the slam fix | 7/8 | 3/8 | 5/8 | 63% |
| 1950 | x0.62 | before the slam fix | 6/8 | 2/8 | 8/8 | 67% |
| **1950** | **x0.62** | **slam answered (final)** | **4/8** | **3/8** | **7/8** | **58%, in band** |

- In the final run no hero is at 0, and fights last 63-139 s (about 92 s on average).
- The Venom Bloom landed 0 times on the bot in the diagnostic fights (both bots escape the ring).
- **Mash bot (boss, re-stamped via `tools/mash-bot.mjs underwell --write`): 0/6.** Knight and warden die; pyro times out with her at 70%.
- The level hash did not move (no level data changed), so the level row was not re-stamped. mash-gate is 40/40.

## Assertions changed by Daniel's design changes (tools/cistern-queen.mjs)
- The P3 spec now has Venom Bloom in the Death Roll's place and no Brood Shield.
- The phase-3 run now expects the bloom, and asserts no brood and no roll.
- The enraged-combo check now asserts that the bloom follows.

## Checks added
- No brood or roll row anywhere.
- **Nothing pops**, in all three phases:
  - the drawn body moves at most 45 px a frame;
  - turns at most 0.33 rad a frame;
  - flips at most 0.25 / 0.2 a frame;
  - and she is never hidden for a single frame.
- Her trips are seen: crawl/climb, descend/crawl/climb, crawl/leap/pounce.
- The bloom:
  - it is told, with its ring drawn from the first frame;
  - the slick's edge grows from the stinger to the ring;
  - the stinger is exposed through it, capped at one sting;
  - it hits once with 2 stacks in the ring, and not outside the ring or on a ledge.

## Green (PORT 8720 only)
- cistern-queen: 116
- tells
- answer-tags
- hint-shown
- boss-read
- boss-openings
- boss-greed
- boss-fight-end
- corpses
- underwell
- mash-gate

## QUESTIONS FOR DANIEL (rec first)
1. **"Up on rubble":** the only high ground in her flooded hall is the two ledges, which you reach by rope ladder. Out of the ring is the main answer.
   - Rec: keep it as built.
   - Alternative: when the shaft's wall breaks at P3, two rubble heaps fall into the hall to stand on. That is a runtime tile change, so it is not built.
2. **Bloom difficulty:** the bot never got caught by the bloom (2.25 s told in all).
   - Rec: keep it for your playtest.
   - If it feels free in your hands, shorten the spread from 1.4 s to 1.1 s, or widen the ring from 72 to 84 px.
3. **Her trips to the walls are slower and visible now** (about 1-2.5 s scuttling per wall switch). She is hittable from behind while she scuttles, which is why her health went to 1950 and her damage to x0.62.
   - Rec: keep.
   - If phase two drags, raise CQ.crawl from 330 to 420.
4. **The bot's new stinger-slam answer** moved the warden's numbers: it was taking the slam every time.
   - Rec: keep. A player reads the red ring.
