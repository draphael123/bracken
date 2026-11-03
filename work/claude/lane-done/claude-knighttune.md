# claude/knighttune (sonnet, 11-03) - KNIGHT RETUNE vs the demo bosses. NOT merged, NOT deployed.
Branch off claude/batch140 5f856e7e. One change: src/main.js KNIGHT_DMG = 1.1 (knight-side x on swordDmg(), the pyro 0.7 pattern; skills scale with it). Bosses untouched; guard chain, windows, stamina, flasks, resist floors untouched.
## Rates (knight, human profile, practiced, WITH campaign-kit flasks, normal; tools/boss-rates.mjs; logs scratch\kt\*.log)
| boss (L) | before 1.0 n=6 | 1.2 n=6 / seeds 7-12 | 1.15 n=12 | 1.1 n=12 (KEPT) |
| wood (3) | 6/6 | - | - | - (tutorial, trivially high) |
| hornetsnest (3) | 2/6 33% | 4/6, 6/6 | 10/12 | 7/12 58% |
| stockade (4) | 2/6 33% | 5/6, 5/6 | 10/12 | 8/12 67% |
| burning (5) | 3/6 50% | 3/6, 5/6 | 8/12 | 7/12 58% |
| pooled | 7/18 = 39% (13/24 = 54% with wood) | 28/36 = 78% | 28/36 = 78% | 22/36 = 61% IN BAND |
swordDmg is rounded, so the cut steps by whole points at low level: 1.15 and 1.2 land on the same step (78%, high), 1.1 the step below (61%). 1.1 is the only value in band; it sits at the low edge, n=36 noise is about +-8 points.
## Checks
GREEN: tools/knight-chain.mjs, leveling.mjs, blow-tags.mjs. hero-pass knight: 2 FAILS (UP+C wind-up / shield charge) are IDENTICAL on untouched claude/batch140 - batch139 (781ef29e, which fixes hero-pass) is not merged into 140. puppeteer.mjs: knight salt 2 times out (4081 taken) on this tree - the salt 2->7 + bot fixes live in 139, not here; re-measure after 139 -> 140 is merged.
## Open / owed
1. Knight vs Hornet Queen: the bot's guard stats show 0 perfect guards on her stings, so the chain engine never runs there; the rate is carried by damage. Rec: leave (her tells are unblockable-style); note only.
2. Bot perfect guard is more reliable than a human's (0.09 s lead inside a 0.11 s window); no change made - rates are as the gate measures them.
3. Owed after the 139->140 merge: puppeteer knight rate, hero-pass knight green, ram lord knight (was 1/6 at hp 7200), Hornet Queen pooled (57%, knight is one cell), pyroboss/warden unaffected.
4. Rec for Daniel: keep 1.1. Alt if a human feels it low: widen the perfect window 0.11 -> 0.13 in perfectWindow() (identity-positive, not measured).
