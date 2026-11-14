# SKY2TUNE (claude/sky2tune, off sky2art 2e96ca365 + master 7e1d5aeda merged clean) - 11-14 18:51, STOPPED EARLY (credit)
VERDICT: NOT IN BAND. Last measured n=36 = 83 pct [68-92] (hp 2000, re-hook 2.6/1.9/1.5, DOWN 4.0 s/22, fixed pyro bot) - too easy. Branch tip = see git log (settings below are NOT re-measured: hp 2600). READY-FOR-DANIEL-PLAY only as a look (?sky2=1); do NOT flip. Preview: https://bracken-nine.vercel.app does NOT have it (needs a flag-OFF batch first); play locally with ?sky2=1.
## Tune table (practiced bot, kit flasks, L16, tools/boss-rates.mjs highlines, BRACKEN_SKY2=1; kn/wa/py wins)
| step | setting | n | kn | wa | py | notes |
| base | hp1700 rehook 3.5/2.5/2.0 DOWN 4.0/22 (grey as built) | 6 | 2/2 | 2/2 | 0/2 | 67 pct |
| base | same | 36 | 12/12 | 12/12 | 0/12 | 67 pct [50-80] DEGENERATE: pyro died every fight at boss 62-77 pct left, 230 s, 0 holds |
| 1 | rehook 2.5/1.8/1.4 | 12 | 1/4 | 3/4 | 0/4 | 33 pct too hard for knight |
| 1b | rehook 3.0/2.2/1.7 | 12 | 4/4 | 2/4 | 0/4 | 50 pct |
| 2 | + DOWN 5.0 s/30 | 12 | 4/4 | 4/4 | 0/4 | 67; pyro still 0 |
| BOT FIX | sky2Plan: pyro stood 40-90 px off him ("ranged"), his flame is 30-48 px; now stands 26-30 px | 12 | 4/4 | 4/4 | 3/4 | 92 pct (with DOWN 5.0/30) |
| 3 | DOWN back 4.0/22, rehook 3.0/2.2/1.7 | 12 | 4/4 | 2/4 | 4/4 | 83 |
| 4 | rehook 2.6/1.9/1.5 | 12 | 3/4 | 4/4 | 3/4 | 83 |
| 5 | + hp 2000 | 12 | 4/4 | 3/4 | 3/4 | 83 |
| 5 | same | 36 | 9/12 | 11/12 | 10/12 | 83 pct [68-92]; fights 75-220 s |
| 6 | hp 2600 | 12 | 4/4 | 4/4 | 2/4 | 83 (hp barely moves it) |
| 7 | + DOWN 3.0 s/15 | not measured | | | | tools/sky2.mjs NO SOFT-LOCK (enraged phase 1, crane dark, 3 seats) FAILED at this setting: reverted, never run |
Where bots died: only pyro (before the fix, boss ~65 pct left); after the fix losses were few and not logged per attack (boss-rates rows only carry total damage).
## Settings on the branch NOW (src/skyhook2.js): hp 2600, rehook [2.6,1.9,1.5], DOWN t4.0 mul2 cap0.22 (unchanged), camPad 30, pyro bot fix. Proofs at this tip: sky2 257 OK, skyhook 173 OK.
## NEXT STEP for whoever resumes
Levers help but the bots still win ~83 pct: hp is the weak knob. Turn the next ones: DOWN window 3.5/18 (3.0/15 broke the no-soft-lock proof: look at why before using it), WEIGHT re-hang 6 -> 8 s, SMASHED cap 30 -> 22, skip dmg 14 -> 16. n=12 each, then ONE n=36 on seeds 13-24 (SEED0=12). Re-measure pyro after the bot fix at n=36 (only n=12 so far).
## LOOK (real page, ?sky2=1 via BRACKEN_SKY2=1, 1920x1080 camera WIDE, also 1280x720 and 2560x1080; console errors [] everywhere)
Stills: scratch\lane-reports\sky2tune\look, look2 (attack sequences), look-sizes, look3. NO sheet.png made (credit). Tool: tools/sky2tune-look.mjs (--part=stills|attacks|crane|heroes|softlock|perf|off).
FIXED: (1) SKYHOOK RODE OFF THE TOP OF THE SCREEN: with the hero on the floor the view top is 184 px over it; sky line/crowns 216-272 px up. Added main.js camY hook (boss skyhook) + hands H.camY (Crypt Mother pattern): camera rises, hero feet + plate stay in view. (2) cdp.mjs BRACKEN_SKY2=1 door (the plan listed it, it did not exist). (3) pyro bot (above).
STILL WRONG, NOT FIXED (design/art): at the smallest fight view (270 px high) crown poses (hook/cut/swing/rivet/crane-guy tells, phase/enrage tell) are still above the top edge; only their ground/line tells show (hook line, dots, red streak). REC: lower crowns + sky line ~36 px (geom2 + crown art) - Daniel's call.
Checked OK: lamps/words readable over the cave; POINTS hold UI ("HOLD IT!" bar, gold chain); A1 streak + foot circle + iron block; A2 yellow dots; crane tell ghost tub + sweep at chest height, wall safe; SMASHED/DOWN brackets; fray red band + chevrons; enrage bar red; no backdrop gaps at 2560x1080.
Weak: crane red arc is faint over the cave (only the ghost tub at the far end reads); a red boxed X appears at the top edge for off-screen tells (reads as "close").
Flag OFF = live: 2 stills at 1920x1080 sha-identical master vs branch; sky2 proofs green.
Heroes: knight/warden/paladin/berserker/reaper/pyro strike POINTS, WEIGHT and CRANE 18/18. Ranged (pirate/geomancer/ranger) erratic in my hold-atk harness (hits at 45-130 px sometimes, CRANE only within 30 px of the lever, maybe the winch feet at +-56) - NOT proven; needs a human check.
Soft-lock: both lines cut 15 s, he keeps acting; after restring rides again. Co-op 2 seats (coop-boss-rates, 4 fights) ran clean (knight 2/2, pyro 0/2, partner AI). Frame time (headless software): step 7.9 ms (skip fight) / 5.8 ms (perch) ON vs 5.8 OFF.
NOT CHECKED: sheet, 1920 stills of every state re-taken after camera fix (only some), 3-4 seats, a human playtest, warden-specific deaths, levers-off bot in the page.
## QUESTIONS (rec first)
1. Lower the crowns/sky line 36 px so the tells fit a 270 view? REC yes (SKY2ART follow-up).
2. Keep the pyro bot fix (flame range)? REC yes: it was the reason pyro read 0 pct.
3. SK.points.onRise stays on (as asked).
