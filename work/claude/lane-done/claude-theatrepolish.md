# THEATREPOLISH (Sonnet): the Puppeteer's relic and his track in the Sound Test

## What changed
1. THE CUT STRING, the Puppeteer's relic (the theatre had none).
   - Effect: what snares you lets go twice as fast. The snare timer (the Puppeteer's grab, src/puppeteer-hands.js) runs at double speed, and the Holdfast's grip lasts half as long. Modest, and distinct from every other relic. The hands' grab is the only snare source in the game, so it works against the Puppeteer himself on a replay and against holdfasts elsewhere.
   - Wiring follows the Maypole Ribbon: `ent('relic', ..., { kind: 'cutstring', bossDrop: true })` in stagePuppeteer (src/puppeteer.js). It is hidden until he falls, then appears where he hung (case 'puppeteer' in the boss-death switch in src/main.js).
   - Name, description and colour are in RELICS (src/main.js). The icon is `PROP.relic.cutstring`: a control-bar end with one whole string and one cut. The pickup, HUD slot, "LOST on death" and PROG[level].relic save all use the existing relic code. Old saves have no `theatre.relic` and simply read as none.
   - Teaching text: none needed. The relic name goes through number() as a variable like every other relic (its lowercase description always shows), so src/hint-lines.js is untouched (hint-shown rejects a routed line no literal number() call says).
   - Asserted in tools/theatre.mjs (exactly one relic, cutstring, bossDrop, inside the arena) and tools/puppeteer.mjs (page: hidden before, shown after, picked up, held and saved, a snare of 1 s is gone in 0.67 s with it and not without it). tools/npc-removal.mjs expected relic kinds gets 'cutstring'.
2. 'puppeteer' is in the Sound Test: added to MUSIC_NAMES (src/audio.js) after 'theatre'. It stays in NO_FILE_BY_DESIGN, exactly as archmage/goblinroyal/drownedking do (a synth track has no file). Like every song it shows as '???' until heard in play (old-save safe). tools/boss-music.mjs now asserts it is in MUSIC_NAMES.
The fight is untouched (open window stays 3.0 s). No bot pilots: the relic only changes the snare timer, not the fight's tuning.

## Checks
Green: theatre, puppeteer, boss-fight-end, boss-openings, audio-assets, boss-music, progression, progression-runtime, skins, textfit, hint-shown, dangling-paths, architecture, checkpoints, npc-removal, slopes-trace (unchanged), soundtest, collectables.

## QUESTIONS FOR DANIEL
- The snare only comes from the Puppeteer's grab and the Holdfast, so the relic is a niche effect. Recommendation: keep it (modest, on-theme). Alternative: also halve the hold time of the drowned hands.
