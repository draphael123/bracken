# FOEVARIETY lane (claude/foevariety, off claude/foecast 503e2985d). 11-05, code-only: NO browser opened. Not merged, not deployed.

## What changed (new src/foe-variety.js; ~12 small anchored edits in src/main.js; audio aliases; cast rows)
- CLUB GOBLIN (cnSkin clubsprig) = the unarmed sprig, armed. REC TAKEN (arm it, not retire): the sprig already had a TOLD bite-hop (yellow !, sit-back); it just looked unarmed. Now: club overlaid on its own frames (raised on the tell, thrust on the bite), reach 42 (was 34), and a hit that lands throws you back (170) + 50 ms hit-stop, like the shield shove. Block still turns it. Bestiary row CLUB GOBLIN.
- FIRE ARCHER (firearcher): orange palette, ember glint at the bow while drawing + hiss, flame-head arrow with ember trail; lands as the existing fire patch. Existing hand-placed fire:true archers now WEAR this skin at spawn (no data change).
- ROCK ARCHER (rockarcher): grey palette, thud on draw, tumbling stone with dust trail; on floor/wall it SHATTERS into 3 skipping shards (6 dmg, 0.6 s, parry/shield kills them); breaks without shards if it hits you or was reflected. Death card names THE ROCK / THE SHARDS.
- VENOM ARCHER (venomarcher, marsh/fen/leaf): purple/green palette, dripping green arrow, a hit that LANDS poisons (existing poisonPlayer), a block does not.
- All shots stay s.arrow + owner: parry/reflect/shield behave as the base arrow. Tell (glint+sound) and trail on every variant. Death burst in the variant colour; club splinters.
- FROST variant NOT built: the game has no player chill/slow consumer (P.chillT is set once, never read). Needs a design call (below).
- IMPACT: hit-stop, knockback, flash/recoil, death burst and finish stop are already systemic (src/juice.js, hurtEnemy0), so no new per-foe machinery. Added: variant death bursts, club knock + stop, and voice aliases (hurt/die fall back to a family voice) for hornsman, stiltwalker, butcher, attendant, trophyhunter, bonegob + the 4 new skins. Audit crude (tools/_fv-voices.mjs); LISTEN pass owed.
- Art: palette swaps via bakeArcher(palette) + club overlay; contact sheet checked in node (tools/_fv-sheet.mjs). Filenames clear of ad-block words.

## Cast (CAST_SWAPS rows in src/cast-pass.js; rows gained `skin` and `allow:[perch]`). foe-cast generic share / curve INDEX, before -> after
| level | generic | INDEX | rows |
|---|---|---|---|
| fenroad | 53 -> 37% | 71 -> 71 | 3 archers venom, 5 sprigs club |
| stockade | 74 -> 62% | 86 -> 83 | 2 fire + 1 rock archer, 2 club, 2 pike->sapper (plain-only: most of its generics are scripted stk/horn/cook roles; ceiling set 64%) |
| underleaf | 85 -> 45% | 77 -> 77 | 3 venom archers (over leafarcher), 5 sprig->thief (herbthief skin); lint now counts herb jarthrowers as their own kind |
| palisadewood | 90 -> 53% | 105 -> 108 | 6 fire + 3 rock archers, 8 club sprigs, 5 pike->sapper |
| kings | 62 -> 43% | 103 -> 105 | 2 rock archers, 4 club, 2 shield->sentry, 1 hound->thief |
All within ~+-5%. Stockade misses the <=50 target (plain-swap limit) - Q2. Family rule: variants are the archer's/sprig's own kind in a skin; one-new-foe passes (snuffer kept out of underleaf: it is Hanging's own foe). No goblins added past the Queen; foe-cast-lint ok (ceilings: stockade .64, palisadewood .58; underleaf/kings removed).

## Checks run
foe-cast-lint ok, one-new-foe ok, goblin-lint ok, foe-footing fenroad ok, curve before/after, level-quality (only pilot+mash stale), node --check main/audio/foe-variety, node sprite bake. NOT run: tools/check.mjs, corpses/textfit (may open a browser; one was started by mistake and stopped).

## STALE GATE ROWS (browser re-run): level1-pilot --write + mash-bot --level --write for fenroad, stockade, underleaf, palisadewood, kings (+ kitchengate, still stale from foecast). Re-stamp after merge.

## BROWSER OWED (proof lane)
Stills: each of the 4 skins idle/draw/loose/hurt/death; club tell+bite; fire arrow flight + landing patch; rock arc + shatter on floor and wall (shard readability, 6 dmg feels fair); venom drip + POISONED; bestiary cards (4 new) + text fit. Rates: parry/reflect of each variant home to the archer; shards killed by parry; club knock into a pit/spike (fair?); frame time in the palisade (9 variant archers) and stockade; boss win-rates not affected. Listen: new voice aliases. Check Palisade archers on perches still hit-test and that pilot/mash on 5 levels stay in band (club knock raises danger a little: sprigs now ~45% of the sprig count with a club).

## QUESTIONS (rec first)
1. Frost archer for crags/scree/hanging: add a small player CHILL (slow 0.8 s on hit, 2 s) as a real status? rec yes, one follow-up lane (new status = design call).
2. Stockade/palisade generics (62/53%): allow swap rows over the scripted stk/horn roles to reach <=50%? rec no; accept, they are taught lessons.
3. Tighten GENERIC_MAX to 50% after proof? rec yes except stockade/palisade ceilings.
4. Add foe-cast-lint to tools/check.mjs at merge (from foecast). rec yes.
5. Real sling art for the rock archer (currently a bow in grey)? rec later, polish lane.
