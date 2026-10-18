# claude/musickraken - THE KRAKEN gets "The Kraken" (leohpaz); "Ready Cannons and Fire" reserved for KRAKEN 3

Base: origin/claude/batch97 a0bd2c1a. Downloads (Daniel approved exactly three WAVs from the Ocean music pack; page licence box re-read 10-17: CC-BY 4.0 / CC-BY 3.0, used under 4.0) in bracken-lanes/music-dl-1017kraken (outside the repo, untrusted, nothing run from it).

| id | file | treatment | final |
|---|---|---|---|
| kraken | audio/kraken.ogg (replaces madameberry "Castle Boss") | 06_the_kraken_intro (20.8 s) + 06_the_kraken_loop (48.0 s) joined; intro plays once, then loops from 20.8 s (TRACK_INTRO kraken: 20.8); the author's loop seam is unaltered (end/start samples continue smoothly, checked); +2.4 dB, limiter | 995 KB, 68.8 s, -12.7 LUFS, peak -0.6 dBFS |
| kraken2 | audio/kraken2.ogg (new, unwired) | 07_ready_cannons_and_fire, whole 32.0 s file loops (smooth seam); +0.9 dB, limiter | 441 KB, 32.0 s, -12.6 LUFS, peak -0.9 dBFS |

- Credits: MUSIC_CREDITS kraken (both tracks, one line) + kraken2; credits page (CC_BY row); audio/CREDITS.txt (old Castle Boss line replaced by a note; causeway.ogg Solemn Tide unchanged); Sound Test rows via MUSIC_NAMES + MUSIC_CREDITS_ROW (kraken, kraken2 were not in the Sound Test before).
- Castle Boss: nothing else used kraken.ogg's track, so it is gone (file overwritten).
- tools/boss-music.mjs re-pointed: asserts causeway arena music 'kraken' and that kraken/kraken2 are in the Sound Test with the Leonardo Paz credit.
- Checks: boss-music ok; soundtest ok; textfit soundtest,credits --strict: kraken/kraken2 rows fit; the only red is PRE-EXISTING (gqueen Sound Test row from musicgq, TRUNCATED "Courtroom... + Sinister Boss Appears!..." too long).
- KRAKEN 3 wiring: music.play('kraken2') at the raft phase (add 'kraken2' to nothing else; credit/Sound Test already done).

## Questions (recommendations)
1. The Kraken loop is 48 s (about 69 s with the intro): short for a long fight. Rec: ship as is; a layer or a mid-fight swap to kraken2 at 50% HP would add variety before KRAKEN 3.
2. musicgq's gqueen Sound Test row truncates (textfit). Rec: shorten MUSIC_CREDITS_ROW.gqueen to '"Courtroom" — Spring Spring' in a tiny follow-up (not touched here).
