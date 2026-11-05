// src/bot-profile.js - WHO THE BOSS BOT IS (claude/bot2, Daniel 10-05: "the human-speed bot disagrees with my feel").
//
// Every knob of the boss lab's human model in ONE table. src/lab.js bossLab takes opts.profile (a name here, or an object) and reads
// nothing else; tools/bot-calibrate.mjs fits the knobs to Daniel's recorded fights (src/playrec.js) or, until there are logs, to his
// reported feel. Times are REAL milliseconds (a person's hands do not speed up when the game runs at 0.6): the lab turns them into frames
// at 60 a second, whatever SET.speed is.
//
//   legacy     THE OLD BOT, exactly: no perception layer, no triage fixes. Every suite check that drives bossLab calibrated its thresholds
//              on it, so it stays the DEFAULT for a bossLab call that names no profile (boss-navigation, normal-health, small-adds,
//              lab-reach, lab-clock, combat-replay, queen-court, pyre-pilot, mother-pilot, herald-pirate, unburied-fights, puppeteer).
//   human      THE BOSS STANDARD from claude/bot2 on: the calibrated player. It reacts only to what is DRAWN (a windup's change of pose and
//              its mark, the boss's open state, his greed ring), each read 200-450 ms late; it reads a tell's remaining time with an
//              error; sometimes it misreads a tell (answers the wrong one: jumps a duck); after landing a hit it is sometimes GREEDY and
//              swings once or twice more through a tell; it does not see foes off the screen (it hears a windup there, later); and it
//              sometimes forgets to keep a roll's stamina back. tools/harnesscard-rates.mjs and tools/boss-rates.mjs use it.
//   (first)    first: true on any profile = A FIRST ATTEMPT: it has never seen this boss - each tell is misread far more often until it
//              has seen it learnAfter times, its timing is twice as rough, and his first opening costs it openDiscover s to notice.
export const PROFILES = {
  legacy: { name: 'legacy', perceive: false, v2: false },
  human: {
    name: 'human', perceive: true, v2: true,
    /* CALIBRATED 2026-10-05 night (tools/bot-calibrate.mjs --feel, d=0.3 of the one dial; grid 0.3/0.6/0.9 x 4 bosses x 3 heroes x 3 seeds): the
       Puppeteer 56% (good: 55), Jenny 78% (easy: 80), the Djinn 56% (a little too hard: 42); the Death Knight sits at 63-100% under every dial
       (his hands read hidden state) and is left out of the fit - see work/claude/lane-done/claude-bot2.md. Refit when the recorder's logs arrive. */
    /* REFIT 2026-10-06 (claude/retune2, after BOT READS removed the double reaction): tools/bot-calibrate.mjs --feel, grid 0.3/0.6/0.9/1.2 x 4 bosses x 3 heroes x 4 seeds
       (n=12 a cell). d=0.9 = the lowest loss over ALL FOUR bosses (14.6; d=1.2 14.8, d=0.6 17.5, d=0.3 35.4): Death Knight 75 (hard: 30), Djinn 75 (a little too hard: 42, a
       feel from before DJINN5 made him easier), Puppeteer 58 (good: 55), Jenny 67 (easy: 80, a feel from before CANAL4 rebuilt her). The tool's own pick, d=1.2, fits only the
       Puppeteer and Jenny (it drops the two it cannot explain) and lies past the dial's 0-1 range. The d=0.3 profile is kept as human03. */
    rtMin: 254, rtMax: 578, rtMode: 386,   // reaction to a change it can SEE, ms: triangular(min, mode, max), drawn per read
    rtUnmarked: 120,                       // + ms when the windup wears no mark and says nothing (a pose alone)
    rtHeard: 180,                          // + ms for a windup off the screen, known only by its tell sound
    timingSd: 0.06,                        // s of game time: the error in reading how long a tell has left (per read)
    misread: 0.146,                         // chance a tell is answered as another tell of his it has seen (or not answered at all)
    greed: 0.413, greedSwings: [1, 2],      // chance after a landed hit to stay in for 1-2 more swings, blind to his next tell
    staminaSlip: 0.2,                      // share of the fight it is not minding the roll it should keep back (re-rolled every 3 s)
    openRt: 1.0,                           // his OPEN is noticed with the same reaction (x this)
    planReact: 0.396,                      // (claude/flasklever) s: the clock every per-boss plan puts on a NON-mode read (a rock, a hook, a band, a lever): plan jitter -0.04..+0.06 -> mean 0.406 s, the profile's own mean reaction (src/lab.js bossLab sets each PLAN.react to it; the plans' 0.25 s was a quicker man)
    parryTry: 0.6, parryLead: 0.09,       // (claude/flasklever) the share of yellow tells a SHIELD hero (knight/paladin/geomancer) tries to PARRY (guard raised only in the tell's last parryLead s, so it lands inside the 0.11 s beat); the rest are blocked held-from-the-start, as before
    mixHeavy: true,                        // (claude/flasklever) a held HEAVY is wound into his OPENINGS only (src/lab.js mixedHeavy): verb mixing without a heavy into a live boss
    drinkBig: 0.4,                         // (claude/rangercanal) ...and drinks AT ONCE after a single blow of this share of the bar (or more) while the next one would kill it: a bar 1 pt above drinkAt after a 64% gulp is not 'healthy' (the Ranger's canal deaths)
    bkKit: true, bkTiers: true, bkFree: true, bkPerfect: 0.3, bkSpike: 0.2,     // (claude/bkbot) THE BLOOD KNIGHT'S WHOLE KIT in the hands (src/lab.js bkHands): BLOOD PRICE in openings, BLOOD STEP timed to a PERFECT step bkPerfect of the time, the crouch's BLOOD SPIKE on bkSpike of blockable tells (the rest the ward-release parry), the held tiers, flasks that do not waste a debt; +bk turns it on, +nobk off
    drinkAt: 0.35,                         // (claude/survival) drinks a flask (BK.drinkFlask) under this share of the bar, while one is held; legacy never drinks
    first: false, firstMisread: 0.5, learnAfter: 2, firstTiming: 2, openDiscover: 0.9,
  },
};
/* (claude/botbuilt, Daniel 11-03) PERSON: an OPT-IN profile (never the default, 'human' keeps every calibrated number). human, plus what a real hand does that the dice above do not:
   tellTable   the per-boss PARRY_TELLS table (a windup that is not named *Tell, e.g. the Hornet Queen's dive) counts as a parry tell
   guardMean/guardSd  the guard goes up N(+25 ms, 40 ms) late around the landing frame (the 0.11 s perfect window decides), and guardLapse of the tells get no guard at all
   skillSpread a per-seed player: the reaction times are scaled by a draw from [0.85, 1.3], so a row is a spread of players, not one man
   fatigueAfter/fatigueMult  after 120 s in one fight the reactions are 15% slower */
PROFILES.person = { ...PROFILES.human, name: 'person', tellTable: true, guardMean: 0.025, guardSd: 0.04, guardLapse: 0.08, skillSpread: [0.85, 1.3], fatigueAfter: 120, fatigueMult: 1.15 };
PROFILES.human03 = { ...PROFILES.human, name: 'human03', rtMin: 218, rtMax: 446, rtMode: 302, misread: 0.062, greed: 0.19 };   /* BOT2's d=0.3 human, for re-reading old tables */
export const STANDARD = 'human';   /* the profile the boss standard (50-60% across knight / warden / pyro) is measured with */
export function profileOf(p) {
  if (!p) return PROFILES.legacy;
  if (typeof p === 'string') { const [name, ...mods] = p.split('+'); const base = PROFILES[name]; if (!base) throw Error('no bot profile ' + name);
    return mods.reduce((o, m) => m === 'first' ? { ...o, first: true, name: o.name + '+first' } : m === 'tells' ? { ...o, tellTable: true, name: o.name + '+tells' } : m === 'dry' ? { ...o, drinkAt: 0, name: o.name + '+dry' } : m === 'tiers' ? { ...o, bkTiers: true, name: o.name + '+tiers' } : m === 'bk' ? { ...o, bkKit: true, bkTiers: true, name: o.name + '+bk' } : m === 'nobk' ? { ...o, bkKit: false, bkTiers: false, name: o.name + '+nobk' } : /^spike\d+$/.test(m) ? { ...o, bkSpike: +m.slice(5) / 100, name: o.name + '+' + m } : /^x_[A-Za-z]+_[0-9p]+$/.test(m) ? { ...o, [m.split('_')[1]]: +m.split('_')[2].replace('p', '.'), name: o.name + '+' + m } : /^perf\d+$/.test(m) ? { ...o, bkPerfect: +m.slice(4) / 100, name: o.name + '+' + m } : o, base); }   /* +tiers (claude/bkfeel): THE BLOOD KNIGHT's hands wind his held tiers in an opening (src/lab.js rotHold) - opt-in, so no standing row moves */   /* +dry (claude/survival): the same hands, no flask drunk - the boss rows as they were measured before the flask */
  return { ...(PROFILES[p.base || 'human']), ...p };
}
/* THE BUILD a player carries at a level (claude/bot2 #3). 'bare' = the even card and no skills (the lab's floor, as BKT.setHeroLevel
   leaves him). 'typical' = a card leaning on health and damage as players pick (45% vigor, 35% might, 20% endurance), the milestone perks a
   fighter takes (iron hide, great heart, mastery...), and the loadout he would have bought by then: his best damaging skills unlocked at
   that level, as many as his slots hold (ONE, two from L30: Daniel 11-01), at rank one. Gold is flush from the eighth wood on (scratch/audit-econ.md),
   so "affordable" is "unlocked". */
export const TYPICAL_SKILLS = {   /* each hero's damaging actives, best first (tools/skill-balance-probe.mjs: damage per cast) */
  knight: ['swordOfRealm', 'groundSlam', 'lunge', 'whirlwind', 'disarm', 'shieldThrow'],
  warden: ['rainOfSpears', 'spearDance', 'javelin', 'setSpears', 'skewer', 'wheel', 'harrier'],
  pyro: ['meteor', 'fireWall', 'wisp', 'vent', 'flameRing', 'cinderStep'],
  paladin: ['lightLance', 'holyCharge', 'hammerLeap'] /* (claude/paladin2: CONSECRATE is his C now, not a slot) */, pirate: ['broadside', 'powderKeg', 'boarding', 'grapeshot', 'heavySeas', 'keelhaul'] /* (claude/botbuilt 2: K x hits, skill-k.js; blackSpot and rum are buffs, left out) */, reaper: ['soulReap', 'boneArmor', 'gravecall', 'summonSkeleton', 'bidden', 'unholyGround'] /* (claude/dkhero) BLOOD MAIL (L14) and BLOODLETTING (L20): the lab's skill hands cast them for a v2 profile; (claude/bkkit2) and THE RED HOST before them - BLOOD BOLT (L8), BLOODWORMS (L1), DRAIN (L8), RED GROUND (L4) */, geomancer: ['boulder', 'spikeRow', 'golem', 'faultLine'] /* (stoneStep/entomb are utility; AVALANCHE is the ult hand's) */, berserker: ['bzCleave', 'bzStorm', 'bzRampage', 'bzSpin'] /* (the rest are buffs) */, ranger: ['rgVolley', 'rgHawk', 'rgRain', 'rgBearTrap', 'rgLeap'] /* (rgSmoke/rgRefill/rgHeart/rgWildHunt are utility or buffs) */,
};
export const TYPICAL_PERKS = ['iron', 'heart', 'arcane', 'light', 'lungs', 'focus'];
export function typicalCard(lv) { const n = Math.max(0, Math.min(50, Math.floor(lv || 0))), v = Math.round(n * 0.45), m = Math.round(n * 0.35), e = Math.max(0, n - v - m), ms = {};
  [25, 30, 35, 40, 45, 50].filter(k => k <= n).forEach((k, i) => { ms[k] = TYPICAL_PERKS[i]; });
  return { v: Math.min(25, v), e: Math.min(25, e), m: Math.min(25, m), ms }; }
/* (claude/walker) THE LEVEL WALKER's card (tools/level-walk.mjs): typicalCard, plus the EARLY milestones a player has taken by then (L5-20, the
   small perks: RICH TONIC, his own perk, GRIT, MENDING) and his own perk at L30 in place of the pool's second pick. typicalCard itself is left as it
   is (the boss rates' 'built' way reads it). */
export const TYPICAL_MINOR = { 5: 'tonic', 15: 'grit', 20: 'mend' };
export function typicalWalkCard(h, lv, ownAt = n => null) { const c = typicalCard(lv), n = Math.max(0, Math.floor(lv || 0));
  for (const k of [5, 10, 15, 20]) if (k <= n) { const id = k === 10 ? ownAt(k) : TYPICAL_MINOR[k]; if (id) c.ms[k] = id; }
  if (n >= 30) { const own = ownAt(30); if (own) c.ms[30] = own; }
  return c; }
/* RANGE of a skill for the hands, px from the hero to the boss's near edge: a cast at range, or a blow in his face */
export const SKILL_RANGE = { shieldThrow: 150, javelin: 170, harrier: 150, rainOfSpears: 140, meteor: 150, wisp: 140, fireWall: 90, vent: 60, lightLance: 240,
  swordOfRealm: 70, groundSlam: 50, lunge: 80, whirlwind: 40, disarm: 40, spearDance: 50, setSpears: 60, skewer: 50, wheel: 45, flameRing: 50, cinderStep: 50, holyCharge: 90, consecrate: 40, boneArmor: 160, soulReap: 110,
  gravecall: 180, summonSkeleton: 150, bidden: 90, unholyGround: 36,
  /* (claude/botbuilt 2, derived from each skill's code in src/main.js / berserker.js / ranger.js / geomancer.js: reach to the boss's near edge) */
  hammerLeap: 100 /* lands ~140 px on, a 42 px blast */, grapeshot: 70 /* reach 74+8/tal */, broadside: 170 /* beam <= 210 px */, keelhaul: 100 /* hook <= 130 */, boarding: 90 /* hook 80+14/tal, dash 420 */, heavySeas: 140 /* lateFoes 160 */, powderKeg: 80 /* keg 44 ahead, blast 52 */,
  bzSpin: 30 /* r 36 */, bzCleave: 50 /* box 62 */, bzRampage: 110 /* 300 px/s x 0.45 s */, bzStorm: 140 /* hatchets 260 px/s arcing, 1.1 s */,
  rgVolley: 200 /* arrows 420 px/s, g 520 */, rgHawk: 200 /* quarry 220 */, rgRain: 90 /* lands 80 ahead, r 32 */, rgBearTrap: 60 /* set 48 ahead */, rgLeap: 40 /* hops back, plunge arrow */,
  boulder: 200 /* rolls 190 px/s 3.2 s */, spikeRow: 85 /* five spikes 20..80 ahead */, golem: 150 /* strikes within 200 */, faultLine: 110 /* splits 130 */, entomb: 60 /* seal reach 72 */ };   /* (claude/bkkit2) THE RED HOST: the bolt from range, the worms near, DRAIN inside its hold, the pool under the boss */

/* (claude/botbuilt) PARRY_TELLS: per boss (the foe's .t), the windups that are NOT named *Tell but a player parries all the same. The regex /Tell$/ in src/lab.js humanGuard
   missed them (the Hornet Queen's stoop is mode 'dive', her wind-up 'aim'). A value is a function (boss, P) -> seconds until the blow lands, or 1 = the mode's own clock (modeT).
   Read only by a profile with tellTable (person, or any profile +tells); 'human' and 'legacy' read the regex alone, so no standing row moves. Add a boss here when the census of its modes finds a parry windup the regex cannot see. */
/* (claude/botbuilt 2) CENSUS of the Act I demo bosses (old tusker, hornet queen, bullfrog, bog troll, gorm, berserker chieftain, pyromancer): every windup but the Hornet Queen's stoop is already a *Tell mode the regex sees. Ambiguous, left OUT: bog troll pileWind (post swing; a roll-under, not a parry), chieftain coil (pounce wind-up; blow = the landing), hornet queen aim (not a hit). rootway/spore/palisade/underleaf bosses keep their modes in hands files, not censused. */
export const PARRY_TELLS = {
  hornetqueen: { dive: (b, P) => (b.vy || 0) > 0 ? Math.max(0, (P.y - b.y)) / Math.max(60, b.vy) : 99 },   /* the stoop lands where her feet-line meets the hero: distance over her fall speed (src/hornet-queen-plan.js uses the same eta) */
};
/* (claude/botbuilt) THE ULTIMATE HAND's reach: centre-to-centre px (ad, with min for the ranger's line) and the vertical slack. Heroes not listed use 'default'. */
export const ULT_RANGE = { default: { ad: 220, dy: 40 }, knight: { ad: 140, dy: 24 }, geomancer: { ad: 220, dy: 40 }, ranger: { min: 50, ad: 300, dy: 30 } };
/* (claude/botbuilt) LOUD BUILD CHECK: what a built fight will silently NOT cast. noRange = slot skills with no SKILL_RANGE entry (the hands skip them), empty = the hero's typical list is empty (nothing is ever slotted). */
export function buildGaps(h, kit) { const noRange = (kit || []).filter(id => !(id in SKILL_RANGE) && id !== 'boneArmor'); return { noRange, empty: !(TYPICAL_SKILLS[h] || []).length }; }
