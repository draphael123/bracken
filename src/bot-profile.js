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
    rtMin: 218, rtMax: 446, rtMode: 302,   // reaction to a change it can SEE, ms: triangular(min, mode, max), drawn per read
    rtUnmarked: 120,                       // + ms when the windup wears no mark and says nothing (a pose alone)
    rtHeard: 180,                          // + ms for a windup off the screen, known only by its tell sound
    timingSd: 0.06,                        // s of game time: the error in reading how long a tell has left (per read)
    misread: 0.062,                         // chance a tell is answered as another tell of his it has seen (or not answered at all)
    greed: 0.19, greedSwings: [1, 2],      // chance after a landed hit to stay in for 1-2 more swings, blind to his next tell
    staminaSlip: 0.2,                      // share of the fight it is not minding the roll it should keep back (re-rolled every 3 s)
    openRt: 1.0,                           // his OPEN is noticed with the same reaction (x this)
    first: false, firstMisread: 0.5, learnAfter: 2, firstTiming: 2, openDiscover: 0.9,
  },
};
export const STANDARD = 'human';   /* the profile the boss standard (50-60% across knight / warden / pyro) is measured with */
export function profileOf(p) {
  if (!p) return PROFILES.legacy;
  if (typeof p === 'string') { const [name, ...mods] = p.split('+'); const base = PROFILES[name]; if (!base) throw Error('no bot profile ' + name);
    return mods.reduce((o, m) => m === 'first' ? { ...o, first: true, name: o.name + '+first' } : o, base); }
  return { ...(PROFILES[p.base || 'human']), ...p };
}
/* THE BUILD a player carries at a level (claude/bot2 #3). 'bare' = the even card and no skills (the lab's floor, as BKT.setHeroLevel
   leaves him). 'typical' = a card leaning on health and damage as players pick (45% vigor, 35% might, 20% endurance), the milestone perks a
   fighter takes (iron hide, great heart, mastery...), and the loadout he would have bought by then: his best damaging skills unlocked at
   that level, as many as his slots hold (two, three from L16), at rank one. Gold is flush from the eighth wood on (scratch/audit-econ.md),
   so "affordable" is "unlocked". */
export const TYPICAL_SKILLS = {   /* each hero's damaging actives, best first (tools/skill-balance-probe.mjs: damage per cast) */
  knight: ['swordOfRealm', 'groundSlam', 'lunge', 'whirlwind', 'disarm', 'shieldThrow'],
  warden: ['rainOfSpears', 'spearDance', 'javelin', 'setSpears', 'poleSpring', 'skewer', 'wheel', 'harrier'],
  pyro: ['meteor', 'fireWall', 'wisp', 'vent', 'flameRing', 'cinderStep'],
  paladin: ['lightLance', 'holyCharge', 'consecrate'], pirate: [], reaper: [], geomancer: [],
};
export const TYPICAL_PERKS = ['iron', 'heart', 'arcane', 'light', 'lungs', 'focus'];
export function typicalCard(lv) { const n = Math.max(0, Math.min(50, Math.floor(lv || 0))), v = Math.round(n * 0.45), m = Math.round(n * 0.35), e = Math.max(0, n - v - m), ms = {};
  [25, 30, 35, 40, 45, 50].filter(k => k <= n).forEach((k, i) => { ms[k] = TYPICAL_PERKS[i]; });
  return { v: Math.min(25, v), e: Math.min(25, e), m: Math.min(25, m), ms }; }
/* RANGE of a skill for the hands, px from the hero to the boss's near edge: a cast at range, or a blow in his face */
export const SKILL_RANGE = { shieldThrow: 150, javelin: 170, harrier: 150, rainOfSpears: 140, meteor: 150, wisp: 140, fireWall: 90, vent: 60, lightLance: 150,
  swordOfRealm: 70, groundSlam: 50, lunge: 80, whirlwind: 40, disarm: 40, spearDance: 50, setSpears: 60, poleSpring: 60, skewer: 50, wheel: 45, flameRing: 50, cinderStep: 50, holyCharge: 90, consecrate: 40 };
