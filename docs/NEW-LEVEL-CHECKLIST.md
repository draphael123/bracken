# NEW LEVEL CHECKLIST - the process and every lesson (build lanes AND reviewers)

Written 2026-10-01 from Daniel's playtests of the Harvest Fair ("a prototype - just walk right") and the Maskwright's Theatre, the Puppeteer fight,
and the 09-28 to 09-30 decisions. `docs/LEVEL-DESIGN-GUIDE.md` is the feel; `docs/LEVEL-QUALITY.md` is the measured bar (`tools/level-quality.mjs`);
this is the order of work and the list of mistakes already paid for. A build lane ticks every box before it reports; a reviewer walks the same list
against THE MAGE'S FOLLY (Daniel's benchmark) and says which box is empty, with a file and a column.

## The process (no step is skipped, none is run by the same lane that built the one before)

1. **CONCEPT, one page, approved by Daniel before ANY build.** Template below. The worked example is `docs/concepts/the-lit-church.md` (approved
   concept) with `docs/concepts/the-lit-church-brief.md` (the older build brief that holds the detail). A lane that is handed a level with no
   approved concept writes the concept, puts the questions in its report, and stops short of a build.
2. **GREYBOX (Opus).** Geometry, the foes of every encounter, the gadgets, the signs and the checkpoints, placeholder art, no new music. It must walk
   with real keys (a scripted pilot like `tools/theatre-pilot.mjs`, no god mode) before anyone reviews it.
3. **REVIEW against THE MAGE'S FOLLY.** A separate reviewer lane runs `node tools/level-quality.mjs <id>` beside `mage`, walks the level by hand
   with `?level=<id>` (below), and writes a numbered fix list. The reviewer's questions are the lessons below, nothing softer.
4. **FIXES (Opus)** until the review has no open item.
5. **ART + MUSIC (Sonnet).** Backdrop, tiles, props, foe art, the level's own track. Nothing in this step moves a collision cell or a foe.
6. **THE GATE.** Add the id to `GATE` in `tools/level-quality.mjs`; run the level's pilot (`node tools/level1-pilot.mjs <id> --write`) and commit
   `docs/level1-pilot.json`; the required checks (architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace, npc-removal and the
   level's own) are green. Only then is it "done" - and the playtest by Daniel's hands decides what "good" is.

## The concept page (copy this; one page, plain words)

    # <THE NAME> - CONCEPT (approved by Daniel <date>)
    THEME:        the one idea, in one sentence, and what the player does with it with their own hands
    PLACEMENT:    id, name, `needs`, where it sits on the map; what clearing it unlocks (a hero, a road)
    THREE MECHANICS (each REQUIRED somewhere; say where the exam combines them)
      1. ...  taught safely / developed under pressure / twisted / combined / examined
      2. ...
      3. ...
    FOES          NEW (at most one or two, each with the role it fills) and REUSED (name the existing kinds first; goblins do not fit a fair,
                  knights and drunks do). An off-theme foe's proven AI is RESKINNED before a new one is built. Say each foe's role
                  (melee / ranged / support / heavy / runner) and how each one interacts with the three mechanics. A ranged foe is present.
    ENCOUNTERS    the designed ones (shield over archer, healer to kill first, a lone heavy on a ledge) - not an even sprinkle
    SET PIECE     the big moment, and the AGENCY in it: what the player chooses and does so that it does not resolve itself
    COLLECTIBLES  what each collectible / interactive UNLOCKS (a gate, a relic, a shortcut, a hero) and the HUD line that says so
    BOSS          name, the readable tells, the OPENING and what causes it, phase two's change, the pilot target
    MUSIC         its own track (synth is fine; no borrowed or stock tracks, no downloads)
    BACKDROP      per section, what the eye sees; props that fit the place
    SIZE / RULES  columns, checkpoints, silvers, ambushes, the checks the level adds
    PROCESS / SCHEDULE   who builds, who reviews, what it waits on

## The lessons (each is a box; each one has already cost a lane a rework)

### Shape and pace
- [ ] **No walk-right opener.** The first screen asks for something (a jump, a read, a choice, a foe to answer), not "hold right". The Fair's flat
      672-column corridor is the failure. Measured: `flat`, `bands`, `route`, `encounters` in level-quality.
- [ ] **Every mechanic is REQUIRED somewhere.** A gadget the player can walk past is decoration. Each of the three mechanics blocks the way at least once
      (a lock, a gap, a door, a foe that cannot be passed without it). The Theatre made the lamp a LOCK twice for this reason.
- [ ] **The exam combines.** The last stretch before the boss uses two or more of the mechanics at once (the Theatre's flat decides the follow spot). A
      level that teaches three things and examines one is unfinished.
- [ ] **Taught, developed, twisted, combined, examined.** One rule carried to the end, not used once and dropped (guide section 1).
- [ ] **No repeated shapes.** Three identical towers are three problems made into one.
- [ ] **Height and branches.** Several height bands, dead-end pockets with a reward, a route that climbs and drops (measured: `bands`, `route`).
- [ ] **Slopes draw.** Any slope collision cell (tile ids 20-25) must be painted by a diagonal tile of its own kind and the level must be one the tile
      painter reaches (`slopes` in level-quality; the Ore Road and the old Fair fail). An invisible walkable slope reads as a bug.
- [ ] **Checkpoints: few, spaced, and one before every boss, mini or ambush door.** At most about one per 200 route tiles (the measured floor is 90
      route tiles each, and no walked gap over 175: `checkpoint-gaps`, `checkpoints`). Fewer checkpoints are on purpose: death costs something
      (Salt and Sanctuary direction), so the level must be built to be learned, not spammed.

### Set pieces, signs and the things that happen
- [ ] **A set piece has AGENCY.** The player decides where to stand, what to light, what to break, when to run. If the player could put the pad down
      and it would play out, it is a cutscene. Write the player's choice into the concept.
- [ ] **Nothing resolves itself.** No slide that carries you across, no carousel that delivers you, no sandbag that falls without being cut, no door
      that opens on a timer when it should open on an act. If a machine moves, the player started it or can stop it.
- [ ] **Signs never spoil a twist.** A sign teaches a rule or names a place; it never says what the room will do next. The Theatre's spoiler signs were
      cut in THEATRE2. Teaching text is routed through `src/hint-lines.js` (capital text elsewhere is silently dropped; `hint-shown` enforces it).
- [ ] **No NPCs outside shops** (removed in batch34: only the Marsh ferryman and the Burning Village captives remain). Quest relics are direct pickups.

### Foes
- [ ] **Fewer, better foes.** No sprinkled filler. Every foe is in a designed encounter, at a chokepoint, on a ledge, by spikes, water or barrels.
      A foe is deadly through damage and AI, never through more hp. Every 200 columns holds one designed encounter (`encounters`, `sprinkle-cap`).
- [ ] **Every foe interacts with the level's mechanics** (the lamp lights priests, bats go for the lit, the follow spot is the mummer's tell). A foe that
      ignores the mechanics could stand in any level, and should be removed from this one.
- [ ] **A RANGED foe is present** (an archer, a thrower, a caster). Measured: `ranged` (kinds in `ROLES.ranged`, `tools/level-quality.mjs`).
- [ ] **Role mix: at least three roles** among melee, ranged, support (healer, horn, banner, snuffer), heavy (plate, a big told swing) and runner (a
      thief, a hound, a bomb carrier). Measured: `roles`. A level of melee plus archers is two roles and a sprinkle.
- [ ] **REUSE fitting foes.** Knights, drunks and swornswords fit a fair; goblins do not. Check the bestiary before building. **RESKIN before you
      build**: an off-theme foe's proven AI (a caster for a priest, a thief for an acolyte) in the level's art and voice beats a new AI with new bugs.
      At most one or two truly new foes per level (`one-new-foe` check) - new foes are Opus work and costly in credits.
- [ ] **Every foe is told.** A wind-up the player can read, then a window. No untold off-screen shots, no stun-locks, no knockback into pits without a
      warning (guide section 2).

### Collectibles and interactives
- [ ] **A collectible or interactive UNLOCKS something, and the HUD says what.** Candle stubs light a candle; all lit open the reliquary (a relic and a
      shortcut). A lever opens a gate. A key fits a lock gate. A pickup that opens nothing is clutter. Write it as `L.unlocks = [{ kind, opens, hud }]`
      on the level (measured: `unlocks`); the HUD or callout line goes in `src/hint-lines.js` and the reviewer reads it in play.
- [ ] **Secrets are off the route and worth it:** at least two silvers or relics (`secrets`), reachable by a real jump.

### Feel at level 1
- [ ] **The LEVEL-1 NO-ABILITY run must take real damage.** A fresh knight (level 1, no talents, no bought skills) walked by the pilot bot with no god
      mode takes real blows. A level that costs that hero nothing is a walk. Measured: `pilot` (`node tools/level1-pilot.mjs <id> --write` stamps the
      level's data hash into `docs/level1-pilot.json`; a gated level with no row, or a stale one after an edit, fails).
- [ ] **Every hero can do it** (the shield-bracing lesson): test the Pyromancer and the Freebooter beside the Knight. No softlocks: the real jump is
      about 3.2-4.5 tiles, not the reach model's 6; walk it with real keys.

### Mash test (target rule; report-only until the combat pass lands, `MASH_ENFORCE` in tools/level-quality.mjs)
- [ ] **A player who only mashes attack LOSES.** `node tools/mash-bot.mjs <id> --level <id> --write`: the mash bot (no block, dodge, jump or mechanic) must lose to the level's
      boss with the knight, the warden and the pyromancer, and must die or drop under 40% health in the level. Daniel's target is Hollow Knight / Salt and Sanctuary: a first
      attempt at a boss usually ends in death. Commit `docs/mash-bot.json`; the gate's `mash` row reads it. See `docs/BOSS-AUDIT.md` for where the campaign stands.

### Music and look
- [ ] **Its own music.** A synth track written for the level (a `wantTrack === '<name>'` branch in `src/audio.js`, no file) is as good as a rendered
      one. No borrowed, reused or stock tracks (`SHARED_MUSIC` is empty on purpose), and never a download. New SFX need an audio-table entry (`audio-assets`).
- [ ] **A place, not a recolour.** Its own backdrop per section, props that fit (no wood ledges in a desert), the lit/dark state visible in the art.

### Playtest hook
- [ ] **`?level=<id>[&hero=<id>]` starts any level at its own entrance** (`tools/level-jump.mjs`, `docs/PLAYTEST.md`): never writes a save, full health,
      no god mode. A new level is playable from the URL before it is reachable from the map; the reviewer uses it.

### Boss (the Puppeteer lessons; the full boss rules are in `RULES-LEVELS-AND-BOSSES.md` and guide section 4)
- [ ] **Readability first.** A body that is immune with no sign, or feedback the player cannot see, reads as "nothing works". Every immune moment is shown
      (a bar, a glow, a name) and every hit that does nothing says why.
- [ ] **He always fights.** The boss is never idle while the player waits for a timer; between openings he still pressures (the Puppeteer drops
      sandbags, swings the spotlight, moves scenery).
- [ ] **Every cycle changes.** The second pass of his pattern differs from the first (a new pairing, a new move, a told scene change) so the fight is not
      memorised in a minute.
- [ ] **Short, EARNED openings, at least 3 s.** The player CAUSES the opening with the level's own mechanic (the Paladin's: starve his light; the
      Queen's: she breaks her own pillars); `boss-openings` asserts a window of at least 3 seconds. No opening that arrives on its own clock.
- [ ] **x0.05 chip otherwise.** Hits outside an opening do almost nothing, so openings are the only way and the player learns to wait for them.
- [ ] **Piloted by a human-speed bot (about 250 ms reaction)**, three heroes by one seed (knight, warden, pyro), one BEFORE and one AFTER a change,
      21+ runs for a new boss with a 60-75% win rate for the human bot (the Lit Church concept's target). Bot numbers guide; Daniel's hands decide.

### Lane hygiene (each cost a batch)
- [ ] **The design brief is committed.** Briefs that lived only on one laptop (gitignored) made "works on my machine" a suite bug.
- [ ] **No local paths or personal data** in a committed file (the repo is public; `homepaths` checks).
- [ ] **Every file and line a report or comment cites exists** (`dangling-paths`); a comment names the lane and date it came from.
- [ ] **Required checks** for any lane that changes a level or boss: architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace
      (unchanged for OTHER levels; `--rebase=<id>` only your own, and say why), npc-removal, plus the level's own.
- [ ] **Fix causes, never weaken a test.** Prove a new assertion fails on the old code before trusting that it passes.
- [ ] **Don't decide beyond the brief.** Write QUESTIONS FOR DANIEL with a recommendation, build the conservative option, never wait.

## The reviewer's pass (about an hour, with the greybox in hand)

1. `node tools/level-quality.mjs <id> mage` - read the two side by side; the failing measure names the box above.
2. `?level=<id>` on three heroes: walk it with real keys. Where did you stop reading and start holding right? That stretch is the bug.
3. For each mechanic find the column where it is REQUIRED; for the exam find the stretch that combines two. No column found is a finding.
4. For the set piece write one sentence on what the player chose. No sentence is a finding.
5. Read every sign: does it spoil? Read every collectible: what does it open, and where does the HUD say so?
6. List foes by role; find the ranged one; find a foe that ignores the mechanics (it goes).
7. Return the numbered list with file and column for each item, and say what you did NOT check.
