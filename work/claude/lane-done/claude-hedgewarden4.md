# claude/hedgewarden4: THE HEDGE WARDEN, a told 3 s opening you ANSWER, and the mash bot loses

## What changed
- **HIS OPENING IS ANSWERED, NOT WAITED OUT (B13).** A move of his that you meet puts him in a new mode `stuck` (sword in the lawn, stands still, B4),
  open 3 s, gold ring + timer bar over him (B10), a hero's blows pay x1.6 inside it:
  - his CUT, RUSH or THORN LASH guarded/parried on the beat (`answered(res)`), or the lash/rush jumped clean over;
  - his ROOTS jumped over, or burnt out at a brazier while you stand within 80 px of it.
  Word over him: HIS SWORD IS STUCK: OPEN (roots) / ANSWERED: HE IS OPEN. Not answerable again for 2.5 s after it ends (anti-chain, B3, silent).
  Thorns stay unanswerable-but-leavable. The burning stump at a brazier stays as the second opening (felled in `stuck` at a fire runs straight into it).
- **On the chip.** `hedgewarden` joins CHIP_MINI (src/boss-greed.js): outside an opening a hero blow is a twentieth; the existing turned-blow clank +
  "A SCRATCH: WAIT FOR HIS OPENING" (B10) and the mini purse (an opening is a third of him at most) apply. Greed reprisal unchanged.
- **hp 486 -> 600** (still modest) so the opening-driven fight is not over in 35 s.
- src/hedge-warden.js: `hedgeAnswered`, `stuck` mode/frame 12, `stepRoots` answer hook; hedgeOpen = burning OR stuck.
  src/main.js: 3 small hooks (`answered`, `answer`, import). src/lab.js: the bot swings only into his opening, meets cut/lash/rush on the beat,
  warden hero deflects the cut on the beat.
- tools/boss-openings.mjs: new probe + assertions (alone never open; answered = stuck, open >2.5 s, once; blow inside >= 40 of 40, outside a scratch; ends, no instant re-open).
  No assertion weakened.

## Rates (campaign level L26, normal health, bot = tools/harnesscard-rates.mjs --mode=new)
| | knight | warden | pyro |
|---|---|---|---|
| master (bosswave2 baseline) | - | - | - (mash 5/6) |
| 486 hp, bot before deflect | 3/3 | 2/5 | 4/5 |
| 486 hp, warden bot deflects cut | - | 6/6 | - |
| **600 hp (final)** | 5/5 | 5/5 | 5/5 |
Fights 34-59 s (knight/pyro), 76-120 s (warden). Hero took 0 (knight, pyro) and 24-52 (warden).
**NOT in the 70-75% band: the human bot is at the ceiling (15/15).** The L26 hero takes ~0 damage from a bot that answers every tell, so more damage/hp
did not move it much; I did not keep pushing (CPU). See questions.

## Mash bot (tools/mash-bot.mjs witchlight --mini-only, 2 seeds x knight/warden/pyro): **0/6** (all DEAD; boss left 46-97%). Was 5/6.
Re-stamped level THEN boss (docs/mash-bot.json, level row: no hero cleared it dead-free, all three stamped).

## Checks green
boss-openings, boss-greed, witchlight, tells, answer-tags, hint-shown, mash-gate.

## QUESTIONS FOR DANIEL
1. Human bot sits at 100% vs the 70-75% mini target (the bot guards/deflects/jumps perfectly). Rec: accept pending your playtest (a person will answer
   fewer tells); alt: raise his damage ~x1.5 and shorten the tells' windows - a playtest call, not a bot call.
2. hp 486 -> 600. Rec: keep. Alt: back to 486 (fight 35-45 s for knight/pyro).
3. Answering by a jump over the lash/rush opens him too (not only a guard). Rec: keep (B11: every hero, base movement).
