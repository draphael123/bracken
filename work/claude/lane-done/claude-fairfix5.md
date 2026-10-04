# FAIRFIX5 - THE HARVEST FAIR's identity, fair-made platforming, clear tent floors, the Wicker Queen tweaks

Branch `claude/fairfix5` (Opus). Base: master 1dd5b181, merged up to master 44c8e47d (batch64: LEVELING) mid-lane, then batch65 4960c892 at the end. After the last merge I re-ran sprinkle-cap, level-quality, mash-gate, harvest-fair --floors and wicker-queen: all green. modulepreload: 1 module unlisted, inside its budget of 15.
Brief: scratch/brief-fairfix5.md + scratch/review-fair-identity.md. Daniel's playtest gate applies to the Queen: nothing about her is final until he plays it.

## 1. CLEAR TENT FLOORS (done first, its own commit b3be290b)

**The cause** (as the review said): the shooting-gallery booth's back board was drawn after the tiles and ran down past the floor row.

**The fix** (src/redraw/fair_rides.js):
- The back board now stops at the floor's top line (`boothFloor`).
- A booth whose floor has gaps gets no board at all. That is the night lane (G3): you see awning and posts only, so the gaps and the spike yard show.
- Every booth and nest floor gets a bulb-lit lip, drawn AFTER the night (`drawLips`).
- Both nests' lanterns are now real lamps (life 1, `hung: 'nest'`), so the night cuts a hole round them.
- The TICKETS plate moved up into the HUD band (y 29, under the purse). At y 60 it had covered the wheel's prize shelf.

**The new check** (tools/harvest-fair.mjs, in the page; `node tools/harvest-fair.mjs --floors` runs it alone):
- It samples the COMPOSED frame (BK.buf, after the night) for each gallery booth and each nest.
- Lip: the lip's luminance must beat the booth's back by 30.
- Floor: every floor cell's body must match the same frame drawn with the galleries hidden (so nothing paints over it).
- Gaps: the lane's gap columns must show what is under them.

**Red on master, then green:**
- **RED on master 1dd5b181 and again on master 44c8e47d** (scratch/fairfix5/floors-red-master.log, floors-red-master2.log).
  - G1: 0/13 cells drawn, 0 lit.
  - G2: 0/7 drawn.
  - G3: 5/13 drawn, 4 lit.
  - Both nests: 0 lit, with no lamp.
- **Green** on the branch.
- Note: tools/footing-art.mjs reads only the tile layer, so a paint-over passes it. That was true before and still is. I left it as it is, and the new check covers the picture.

## 2. THE IDENTITY PASS, zone by zone

Before stills: scratch/fair-identity/ (the review's sweep, master 007b5b54: sheet-fair-0/1/2.png, opening-start.png, sweep-NN).
After stills: scratch/fairfix5/after/:
- the 34-screen sweep under the same names;
- sheet-a-0..3.png;
- opening-start, the nests, g3-nightlane-onplank, awning-teach, gallopers, elevator, railway.

Kit passes are in scratch/fairfix5/kit1..3 and sec1..3.

### The fair's own tile kit
NEW src/redraw/fair_tiles.js, hooked as `L.fairKit` beside the canal and theatre hooks in main.js. The ground, by zone:
- **Turnstiles and midway:** sawdust and straw on russet earth, with duckboard inlays. The stall buildings (terrace, high stall, roof streets) are painted plank roofs over stall fronts.
- **Rides yard:** riveted iron deck plates with brass rivets and a bulb lip, on an iron lattice.
- **Barns:** boards with hay on earth.
- **Bonfire field:** burnt stubble.
- **Back lot:** mud with wagon ruts and duckboards.

Ledges are drawn by what they are:
- awnings with a striped valance and bulb lip;
- painted boardwalk;
- iron decks;
- the scenic railway's track;
- wagon steps;
- barn beams.

Spikes are harrow tines and upturned pitchforks in straw. Slopes wear their zone's ground; the railway's humps wear track.

### Palette
- `set: 'fair'` and `dress: 'fair'`: Waymeet's village set and dressing are gone.
- The mine's 'staging' ledges are gone.
- Straw and russet replace the green grass.

### Lights
- `drawTopLips`: every standable top in the dark keeps its kit's lip over the height night, with chase bulbs on awnings, iron and track.
- The dressing's bulbs come on with the dusk and along the road.
- The night stays the rule for what stands on the footing.

### Landmark
- ONE big lit wheel stands on the skyline from screen one. It uses a very low parallax anchored on the real wheel at col 304: it grows as you come, fades into the real wheel there, then stays at your back.
- The backdrop's two small wheels are gone.
- Waymeet's steeple is now a small mark at the far left.

### Living dressing, in the play layer
src/redraw/fair_world.js `drawDressing`, data in `L.fairDress`:
- the HARVEST FAIR arch of corn sheaves with lit letters, and the turnstile booth;
- the coconut shy front, prize shelves, the hoopla front (its awning is the springy one), tin signs and rope fences;
- the steam generator (puffing, with a flywheel and a cable to the gallopers) and the band organ with its figures;
- prize pumpkins and sheaves with a rosette;
- stooks, and a ride packed under a tarpaulin;
- a living wagon, and the fortune-teller's caravan by the back lot hatch;
- flags.

Also:
- The ghost crowd sways, and FREEZES on the side you face (dressing only).
- Weather: Waymeet's pollen is gone. Chaff and straw blow at the gate; ash falls after the effigy.

### Sound
- New synth beds in src/audio.js: `fair` (a far crowd and laughs, canvas, ride creak and chains, the generator's chug, bells) and `fairlot` (the back lot thinning to a dying generator).
- No downloads. The music is unchanged.

### Foes' look
- A harvest skin for the fair's mummers (`SPR.harvestMummer`): corn-husk mask, straw smock, husk cap, and a sheaf.
- The glow, the frames, the hit box and the AI are unchanged.
- It also dies in that skin (reskinSet). The theatre keeps the painted mask.

### House rule: glint and nudge
Seven fair spots in src/stuck-spots.js, all 'stall' glints:
- the striker pad;
- the gallery targets;
- the loft gate;
- the wheel's cars;
- the yard targets;
- the hayloft gate;
- the back lot hatch.

These sit alongside STUCKFIX's spots for the boats, the maze and the night lane. The stuck check is green.

## 3. FAIR-MADE PLATFORMING (sections 1-4 and 6 built; 5 not built)

**1. The awning bounce.** A springy awning launches you at 0.82 of a rick.
- Teach: the hoopla awning (119-121) throws you up to its prize shelf and a ticket.
- Develop: two awnings (208-209 r26, 211-213 r23) replace the boarding stair. Bounce in place on the second, then drop into the boat. In the probe, 10 of 36 random timings boarded.
- Twist: TEARING awnings (crumble kind 'awning') over the collapsing-stall pit rip on the bounce and come back after 4 s. The bunting zip stays as the other way.

**2. The gallopers.** The midway carousel's horses are platforms, using the Queen's ring at a walk.
- Teach: a ticket hangs from the rounding boards (270).
- Develop: the disc's boards are up over a spiked well (280-285), with bare lips that let you climb out either side. A horse carries you over while the ride turns you.
- Twist: the far hobby-horse rides a galloper, and is hidden and out of reach while its horse is round the back.

**3. The big wheel, developed.**
- The landing is cut back to 309-313.
- The car rims are bulb-lit.
- The car-3 bull's-eye stops the wheel for 4 s. The wheel runs on its own clock, and its frame stops with it.

**4. The hay elevator and bales.**
- Teach: a hay-bale push block (397), with a loft ledge (400-401 r24).
- Develop: a slat conveyor (src/fair-rides.js `slatAt`) runs from the hill top (391, r26) to the corn-top plank (405, r13), past a PITCHFORK MUMMER at its head (the 16th mummer).
- Twist: the belt tips over the rick and the harrow tines. Jump for the hayloft door, or step onto the plank.
- The hayloft is enclosed (boarded floor and west wall), so the belt cannot carry you in under its 12-ticket gate.
- The roofs over the slide road were cut to 387-390 so they don't block the belt.

**6. The scenic railway.**
- The night lane is a timber switchback: track tiles, with trestles behind.
- Two humps are slopes (567-571, 591-594). You walk over them; the probe passed.
- Its targets hang from lamp posts. The first target is a row higher, over the hump.
- The striker at 566, the shutter, and the exam's mummer and barker are unchanged.

**Kept:** 35 tickets. Two moved within their own areas (205 to the hoopla shelf, 346 to the gallopers), so 30 still opens the back lot. Kept too: the Loft, Hayloft and Back Lot gates, both roads, every ride, and every encounter.

**Changes to the encounter set, with reasons:**
- One new mummer at the elevator's head. tools/harvest-fair.mjs now counts 16 and says why.
- The far carousel horse now rides a galloper; it used to stand on the disc.

**Not built:** section 5 (the helter-skelter spiral). That is Q4.

## 4. THE WICKER QUEEN

What changed:
- `ringTell` 1.5 to 3.0 s.
- `RING.horses` 10 to 12 (the beat comment is fixed).
- After `floor`, `ring` and `toss` she is ALIGHT for 3.0 s (`selfAlight`):
  - a blow is worth x1.2, and she takes no burn;
  - it is told by a flare from her spear and flames on her wicker (src/redraw/wicker_fx.js `drawAlight`);
  - it puts up the hint line "HER OWN FIRE CAUGHT HER: CUT HER";
  - it goes through her OPEN_RULE row (`wqOpen`);
  - only the real Queen catches; her copies never do.
- Openings are UNIFIED at x1.2 (`burnMul` 0.7 to 1.2), per Daniel's coordinator note.

Re-tuned with her health (1100 to 1400) and her damage numbers (x0.75). No tell and no opening was shortened.

Test changes (deliberate, with reasons in the files):
- wicker-queen.mjs A11: she still never BURNS open by herself; the self-alight is the one approved exception, one window per fire attack.
- The front run now holds 4 to 6 horses.
- The ring test's loop cap went from 9 to 14 s.

### The bot numbers
`node tools/combat-pilots.mjs fair`, 7 heroes, one fight per page:
- **The 3 seeds replay one fight.** Her fight and the bot's branch for her use no random numbers. `--seed` never even reached the lab before (bossLab re-seeds every row); I fixed combat-pilots so it does, and seeds 2 and 3 were still identical to 1919. So 21 fights = 7 distinct fights x 3, and the rate comes in steps of 1/7.
- **On master 1dd5b181:** 3/7 (43%). Wins took 60-131 s.
- **LEVELING landed mid-lane** (master 44c8e47d). At depth, heroes now have 146 hp, where they had 184. On the new master the Queen is **0/7** (boss left 3-54%, 100-171 s).

On the merged branch I swept her health:

| Health | Wins |
|---|---|
| 1150 | 4/7 |
| 1300 | 4/7 |
| **1400 (shipped)** | **3/7 = 43%** |
| 1500 | 2/7 |
| 1650 | 1/7 |
| 1800 | 0/7 |

At 1400 the winners are pyro, pirate and geomancer (55-89 s). Knight died with her at 12% left, warden at 20%, paladin at 26%, reaper at 40%. 50-55% falls between two steps.

**Other bosses, same tool, same batch64 heroes, 7 heroes** (scratch/fairfix5/pilot/others.log):

| Boss | Wins |
|---|---|
| Cistern Queen (welltown) | 0/7 |
| Jenny Greenteeth (canal) | 2/7 |
| Puppeteer (theatre) | 6/7 |

By those numbers she is not the hardest now: the Cistern Queen is at 0/7. LEVELING moved every baseline. See Q5.

**Mash bot:** `node tools/mash-bot.mjs fair --probe --l1` is **0/6** at L23: boss left 44-85%, chip x0.05, the opening x1.2. The L1 variant is 0/3. The fair's level row was re-stamped first (`--level fair --write`: every hero dies), then the boss row.

**Daniel's playtest gate:** open.

## 5. CHECKS

**Green:**
- harvest-fair (with the new tent-floor check) and wicker-queen
- level-quality (fair gated; level1-pilot re-stamped: 38 hits, 0 deaths, walked 100%) and mash-gate
- stuck, corpses, pixels (floats), soundtest
- frame-cost, sprinkle-cap, push-blocks
- architecture, checkpoints, checkpoint-gaps, dangling-paths
- slopes, slopes-trace (identical: no rebase needed), skins, npc-removal, footing-art, ground-depth, render-layers, dressing, goblin-lint, occluders
- boss-greed, boss-openings, boss-fight-end (solo run: all 51 fights end when the boss dies; inside the shared run it had hung for 35+ minutes while other lanes loaded the machine), tells, hint-shown, audio-assets, boss-music, weapon-skins

**Changed, to allow a briefed design (reasons are in the files):**
- push-blocks: it allowed only one bale in Bracken Wood; it now also allows the fair's one bale.
- sprinkle-cap: the galloper rider is now set on its squad's floor.
- harvest-fair: the collapsing-stall test now accepts tearing awnings. The run/hop carousel test now uses the exam's whole disc, and a new galloper-crossing test was added. The rider test now picks the wheel's horse.
- tools/fair-pilot.mjs: new legs for the awnings (it times the boat with boatAt), the gallopers and the humps.

**Not green, or UNVERIFIED:**
- **textfit:** "DJINN OF THE GREAT WELL" is cut off in the bestiary and boss-jump. That is not fair text and not this lane's.
- **fair-pilot (level 1, stochastic):**
  - knight and warden each passed every new leg in isolated segment runs (199-300);
  - full runs still stop at the carousel or the hall of mirrors when a fight interrupts a leg;
  - pyro fails the tent-pole hop on master 1dd5b181 too (that was there before);
  - the level-1 pilot that gates level-quality is green.
- **WEIGHT:** `origin/claude/weight` exists, but it has not landed on master. I did not merge an unlanded branch. Re-measure when it lands.
- **Headless only:** the new ambient bed is not heard (audio is off in the page tools).

## QUESTIONS FOR DANIEL (the recommended option is built unless it says otherwise)
1. **Unified openings.** Built as your note says: the struck ball, the pits and the self-alight all pay x1.2, retuned with health and x0.75 damage. Rec: keep, and judge it in your playtest.
2. **Name the ticket areas after the zones** (MIDWAY / RIDES / BARNS / BACK LOT)? Rec: yes, counts unchanged. Built the conservative option: kept GATE / STALLS / MIDWAY / HARVEST / LAST ROUND.
3. **The ghost crowd freezes when faced.** Built (dressing only). Rec: keep.
4. **The helter-skelter spiral (section 5).** Not built. Rec: a later lane, now that the slope-track and conveyor pieces exist.
5. **Her target after LEVELING.** The new hero levels dropped every boss's human-bot rate: Cistern 0/7, Jenny 2/7, master Queen 0/7. I shipped health 1400 (3/7, 43%), between your 50-55% target and "keep her the hardest". Rec: re-baseline all the bosses' pilot rows on the batch64 heroes (and again after WEIGHT), then set her at 1300 (4/7) if she still out-ranks them, or 1500 (2/7) to stay the hardest.
6. **The hayloft is now an enclosed loft**, so the new hay elevator cannot carry you in under its 12-ticket gate. Rec: keep.
