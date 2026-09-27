# claude/music - the lane report

Twelve CC0 tracks from OpenGameArt, downloaded in two rounds (the original six, then four
more approvals plus a WAV->OGG conversion round), each licence line read on its own page
before the file was pulled, each wired into TRACKS/MUSIC_NAMES/the level or arena/mini that
plays it, and each confirmed to decode in the running page.

## Files (audio/, sizes as downloaded/converted)

| file | size | source | licence (as quoted on the page) |
|---|---|---|---|
| burning.mp3 | 1,324,559 B (~1.3 MB) | "Fire Level" by Spring Spring - opengameart.org/content/fire-level | "CC0" |
| pyroboss.ogg | 859,480 B (~0.9 MB) | "Evil boss music" by Kosmo The Cat - opengameart.org/content/evil-boss-music | "CC0" |
| minicharge.ogg | 1,822,789 B (~1.8 MB) | "Charge!" by Centurion_of_war - opengameart.org/content/charge | "CC0" |
| monastery.ogg | 2,282,779 B (~2.3 MB) | "rpgchip07_the_shrine_of_mysteries" from "15 Melodic RPG Chiptunes" by Aureolus_Omicron - opengameart.org/content/15-melodic-rpg-chiptunes | "CC0. No credit required." |
| northumberland.mp3 | 4,135,726 B (~4.1 MB) | "The Fair Flower of Northumberland" by Spring Spring - opengameart.org/content/northumberland | "CC0" |
| windcaller.ogg | 2,796,698 B (~2.8 MB) | "Hard Boss Battle 1" by MintoDog - opengameart.org/content/hard-boss-battle-1 | "CC0" |
| hangingvillage.ogg | 678,630 B (~0.7 MB) | "Dark Shrine Loop" by qubodup - opengameart.org/content/dark-shrine-loop | "CC0" |
| sporewood.mp3 | 466,283 B (~0.5 MB) | "Mysterious Ambience (song21)" by cynicmusic - opengameart.org/content/mysterious-ambience-song21 | multi-licensed (CC0/GPL/CC-BY-SA); CC0 option used |
| duneworm.ogg | 482,454 B | "Negev Fight Loop" from "Desert Calmness and Fighting (Orchestral)" by Dizzy Crow - opengameart.org/content/desert-calmness-and-fighting-orchestral-141 | "CC0" (WAV, converted to OGG) |
| lance.ogg | 614,180 B | "Boss Battle #3 [8-bit re-upload]" V3 by nene - opengameart.org/content/boss-battle-3-8-bit-re-upload | "CC0" (WAV, converted to OGG) |
| caravan.ogg | 357,538 B | "Desert Theme - 8bit Chiptune Theme" by Wolfgang_ - opengameart.org/content/desert-theme-8bit-chiptune-theme | "CC0" (WAV, converted to OGG) |
| monasterygolem.ogg | 1,388,677 B | "Boss Battle #6 [8-bit]" V1 by nene - opengameart.org/content/boss-battle-6-8-bit | "CC0" (WAV, converted to OGG) |

Every licence line was read directly on the OGA page (grepped for CC0/GPL/BY-SA) before any
download; none required stopping. Full attribution is in `audio/CREDITS.txt` (three new
sections appended, dated 2026-09-26).

The Boss Battle #6 source WAV has one corrupt packet near its end (ffmpeg's own warning,
99.6s of a 44 kHz stereo PCM file uploaded to OGA). A first pass with the same flags used for
the others truncated to 89s; `-err_detect ignore_err -ignore_length 1` recovered the full
duration and that's the file that shipped.

## Where each plays

| track | plays on |
|---|---|
| burning.mp3 | THE BURNING VILLAGE's level track (was quarry.ogg, kept for the Quarry Pass) |
| pyroboss.ogg | THE PYROMANCER's boss arena, in the Burning Village (was hilltroll.ogg, kept for the Hill Troll) |
| minicharge.ogg | every mini-boss fight, as the shared fallback in main.js (`L.mini.music \|\| 'minicharge'`, was `'boss'`); no mini names its own track except the one below |
| monastery.ogg | THE MONASTERY's level track (was sunspire.ogg, kept for the Sunspire) |
| northumberland.mp3 | GALE MOOR's level track (was adventure.mp3, kept - still sold at the store) |
| windcaller.ogg | THE WINDCALLER's boss arena, Gale Moor's summit (was musMountain.ogg, kept - part of MintoDog's stage-select set) |
| hangingvillage.ogg | THE HANGING VILLAGE's level track (was town.mp3, kept - still sold at the store) |
| sporewood.mp3 | SPOREWOOD's level track (was cave.mp3, kept - still the Mineworks' theme) |
| duneworm.ogg | THE DUNE WORM's boss arena, the Sunken Caravan's hollow (was boss2.ogg, kept for the Goblin Chieftain) |
| caravan.ogg | THE SUNKEN CARAVAN's level track (was musBeach.ogg, kept - part of the same stage-select set) |
| lance.ogg | THE QUEEN'S LANCE's boss arena, Stormhold (was musCastle.ogg, kept - part of the same stage-select set) |
| monasterygolem.ogg | THE MONASTERY's GOLEM mini, its own track overriding the shared mini fallback |

All five old borrowed tracks (quarry, hilltroll, sunspire, adventure, musMountain, town,
cave, boss2, musBeach, musCastle) are untouched in TRACKS/audio/ - every one of them is
still played somewhere else, so nothing was deleted.

## Checks run (all green)

- `syntax` - every touched file parses
- `comments` - no swallowed code
- `homepaths` - no hardcoded home-directory path
- `dangling-paths` - every repo path cited resolves in a fresh clone
- `content-audit` - 21 pre-existing items, none new from this lane
- `audit` - clean
- `dune-worm` - all four told attacks still land after the boss's music change
- `bandits` - all passed
- `burning-village` - "the burning village keeps its promises"
- `moor-wind` - unaffected by the level's own music change
- `additional-areas-runtime` - Harbor/Buried Dead unaffected, music decodes
- in-page: `tools/audit-audio.mjs music` decoded all 88 tracks in TRACKS, including all
  twelve new ones, with real `secs`/`sr`/`ch` - no decode failures

`npm run check` (the full 169-check suite) was **not** run, per the lane's instructions
(named checks only, one headless Chrome at a time).

## ffmpeg

Installed via `winget install --id Gyan.FFmpeg -e --accept-source-agreements
--accept-package-agreements` (Daniel's approval, part C). Version 9.0.2, the official Gyan
build. It landed under
`%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_...\ffmpeg-9.0.2-full_build\bin\`
and was not (yet) added to PATH - each conversion in this lane called it by full path. If
another lane wants it on PATH, that's a separate, explicit step.

## Unverified / for Daniel

- `monasterygolem.ogg`'s peak reads 1.175 in the decode pass (the source WAV's corrupt
  packet, salvaged with `-ignore_length`) - a hair of clipping is possible right at that
  spot. It plays and loops fine in the audit; a by-ear pass on the actual mini fight would
  catch anything the numbers don't.
- `pyroboss.ogg`, `minicharge.ogg`, `lance.ogg` and `monasterygolem.ogg` all have a real
  loop-seam jump (0.18-0.39 in the decode pass, vs near-zero for the composed tracks) - the
  engine's equal-power crossfade (`LOOP_XF`, src/audio.js) covers it the same way it covers
  every other found loop in the library, but it's a rougher seam than the ones built
  specifically for BRACKEN.
- No by-ear playthrough was done (headless Chrome only) - Daniel may want to sound-test the
  Burning Village, Monastery, Gale Moor, Hanging Village, Sporewood, Sunken Caravan,
  Stormhold and any mini fight once, since a decode pass measures "plays" not "sounds
  right at this volume next to its neighbours."

Commits on `claude/music` (pushed):
1. Six CC0 tracks (Burning Village, Pyromancer, minis, Monastery, Gale Moor, Windcaller)
2. Two more CC0 tracks (Hanging Village, Sporewood)
3. Four CC0 tracks converted from WAV via ffmpeg (Dune Worm, Queen's Lance, Sunken Caravan,
   Monastery's Golem mini)

`origin/master` had not moved since this branch was cut; `git merge origin/master` reported
"Already up to date."
