# claude/waymeetpal (sonnet, 10-19): THE WAYMEET PALADIN (id closedhelm, "THE CRUSADER", waymeet L25) into the act-IV band 57-63
Base claude/batch104 f95390f0. Changed: src/main.js (EHP closedhelm 3600 -> 3900; DUEL_HERO closedhelm knight 0.62 -> 0.5, warden 2.2 -> 2.8, pyro 1.7 -> 2.2), docs/mash-bot.json (waymeet boss rows re-stamped).
No resistance touched (guard 0.4x on his openings only, as wardgap left it), no new immunity, wall untouched.
The pyro/gap-closer question: the told LEAP (2edcddf8) is already in the base; the pyro still wins by rolling through the sword. That is a hero-answer change (Daniel's call, see questions), so numbers only here.

## RATES (campaign L25, profile human, flasks kit, practiced; knight/warden/pyro)
| state | n/hero | knight | warden | pyro | pooled | mean fight |
| before (3600, 0.62/2.2/1.7) | 12 | 5/12 | 12/12 | 11/12 | 28/36 = 78% | 47-160 s by hero |
| after (3900, 0.5/2.8/2.2), seeds 1-12 | 12 | 6/12 | 8/12 | 9/12 | 23/36 = 64% | ~98 s |
| after, seeds 1-24 | 24 | 12/24 | 16/24 | 15/24 | 43/72 = 60% | 99.6 s |
Dry (human+dry, n=6): before knight 0/6 warden 5/6 pyro 3/6 = 44%; after 0/6, 2/6, 4/6 = 33%. Knight 0/6 dry is not new (it was 0/6 before): his sword is the lever, the flask is what the knight lives on. Dry is not the band's yardstick.
Every hero >= 3/12 on the 12-seed read. A first tune (3900, 0.5/3.0/2.4) read 61% at n=12 and 57% at n=24 (a hair low), so warden/pyro were eased to 2.8/2.2.

## CHECKS
Green: node --check, boss-openings, boss-fight-end (64/64), boss-greed, paladin-boss (170 checks), mash-gate (47 levels). Mash 0/6 re-measured and re-stamped for waymeet's boss (all dead in 24-53 s, boss left 89-99%).
Red, pre-existing and not from this lane: tools/blow-tags.mjs asserts two untagged hurtEnemy0 hooks (SKD.towerTake, FOA.shellTake) on the base (stockade2 / foe pass merges); my diff touches no hook.
Not run: full suite.

## QUESTIONS FOR DANIEL (rec first)
1. Pyro/warden beat him by outranging or rolling through his sword. Rec: leave (every hero >= 3/12, 60% pooled), the told LEAP is already there. Alt: roll opens him only in the last beat of his swing (a hero-answer change, not built).
2. His blows on the kiters are big per hit now (warden x2.8, pyro x2.2). Rec keep (as the Captain's CAP_HERO); play him as the warden.
3. Knight is 0/6 dry. Rec leave (bosses are tuned with flasks).
