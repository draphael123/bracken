// src/charms3.js - TWELVE MORE CHARMS, EARNED BY FEATS (claude/charms4-d). Pure data and numbers, no game, no page. Same pattern as src/charms2.js.
//
// STILL ONE CHARM WORN, PER HERO (PROG.charmOf[h] / PROG.charm). Gated by a FEAT each (store lockOf -> main.js featDone), not by a count. A feat is "kind:N":
// the kinds are in FEATS below; each is written ONLY while the flag is on, into PROG.c3 (an unknown top-level key: it passes migrate/validate like PROG.c2).
//
// DARK: CHARMS3_SHIP is false. While it is false rows() is [] (the shop is exactly today's), worn() is null for every id, every multiplier is exactly 1 and
// nothing here writes a save. window.__CHARMS3 = true (tools only: Page.addScriptToEvaluateOnNewDocument, env BRACKEN_CHARMS3=1 in tools/cdp.mjs) boots it ON.
//
// RULES (plan sec 5): no damage or mitigation beyond IRON CHARM, no flask charms, no hero trait in disguise (SLIPSTREAM / AIR ROLL / LIGHT STEP / MOMENTUM / HANGING CUT /
// EXECUTIONER and each hero's passives are moves or hit rules; none of these twelve is: they are information, timing windows, the camera, the map, a purse rule).
// FOUR are real trade-offs: SURE FOOT (jump 4% lower), SCOUT'S CAP (less seen behind), GRAVEDIGGER'S SPADE (recovers 80% of a purse), TELL-LENS (a vignette).
export const CHARMS3_SHIP = false;
let ship = CHARMS3_SHIP || (typeof window !== 'undefined' && window.__CHARMS3 === true);
export const setCharms3Ship = v => { ship = !!v; return ship; };   /* tools and the lab only */
export const charms3Ship = () => ship;

/* the campaign order main.js hands over once (ids of the non-hidden levels, in LEVELS order): MAGPIE'S feat reads the first four */
let campaign = [];
export const setCampaign = ids => { campaign = Array.isArray(ids) ? ids.slice() : []; };
export const FIRST_N = 4;

const bits = m => ((m | 0) & 1) + (((m | 0) >> 1) & 1) + (((m | 0) >> 2) & 1);
export const clearedCount = prog => Object.values(prog || {}).filter(v => v && typeof v === 'object' && !Array.isArray(v) && v.cleared).length;
export const fullSilverLevels = prog => Object.values(prog || {}).filter(v => v && typeof v === 'object' && !Array.isArray(v) && ((v.silver | 0) & 7) === 7).length;
export const silverFirstFour = prog => campaign.slice(0, FIRST_N).reduce((n, id) => n + bits(prog && prog[id] && prog[id].silver), 0);

/* ---- PROG.c3: written only with the flag on. f = the one-shot feats done (kind: 1), streak = woods cleared in a row without a fall, heroLv = { level id: [hero ids that cleared it] } ---- */
const hasC3 = prog => !!(prog && prog.c3 && typeof prog.c3 === 'object' && !Array.isArray(prog.c3));
export const c3 = prog => { if (!hasC3(prog)) prog.c3 = { f: {}, streak: 0, heroLv: {} }; const c = prog.c3; if (!c.f || typeof c.f !== 'object' || Array.isArray(c.f)) c.f = {}; if (!Number.isFinite(c.streak)) c.streak = 0; if (!c.heroLv || typeof c.heroLv !== 'object' || Array.isArray(c.heroLv)) c.heroLv = {}; return c; };
const fOf = (prog, k) => hasC3(prog) && prog.c3.f && prog.c3.f[k] ? 1 : 0;
const streakOf = prog => hasC3(prog) && Number.isFinite(prog.c3.streak) ? prog.c3.streak : 0;
const heroBest = prog => hasC3(prog) && prog.c3.heroLv ? Math.max(0, ...Object.values(prog.c3.heroLv).map(a => Array.isArray(a) ? a.length : 0)) : 0;

/* ---- THE FEATS. kind: { need, done(prog, n), have(prog), vet?: how an old save is credited, words(prog): the shop line (<= ~60 characters, progress inside) } ----
   VETERAN CREDIT (old saves): silverin / silver1life read what the save already holds (credited); firstgold is credited to a save with 40+ woods cleared (it can no longer be a first visit);
   every other feat must be done again (each is a thing a veteran can do in an evening: they are not counters, so nothing is lost by starting at the flip). */
export const FIRST_GOLD_VET = 40, FULL_SILVER_VET = 3;
export const FEATS = {
  silverin:   { need: 12, have: p => silverFirstFour(p), done: (p, n) => silverFirstFour(p) >= n, words: p => 'all 12 silver of the first four woods (' + Math.min(12, silverFirstFour(p)) + ' of 12)' },
  clean:      { need: 3,  have: p => streakOf(p), done: (p, n) => streakOf(p) >= n, words: p => 'clear 3 woods in a row without a fall (' + Math.min(3, streakOf(p)) + ' of 3)' },
  silver1life: { need: 1, have: p => fOf(p, 'silver1life') || (fullSilverLevels(p) >= FULL_SILVER_VET ? 1 : 0), done: p => !!(fOf(p, 'silver1life') || fullSilverLevels(p) >= FULL_SILVER_VET), words: () => 'find all 3 silver of one wood without a fall' },
  purseback:  { need: 1, have: p => fOf(p, 'purseback'), done: p => !!fOf(p, 'purseback'), words: () => 'what a thief carries, a hunter returns', riddle: true },
  firstgold:  { need: 1, have: p => fOf(p, 'firstgold') || (clearedCount(p) >= FIRST_GOLD_VET ? 1 : 0), done: p => !!(fOf(p, 'firstgold') || clearedCount(p) >= FIRST_GOLD_VET), words: () => 'win gold on a wood the first time you clear it' },
  swiftgold:  { need: 1, have: p => fOf(p, 'swiftgold'), done: p => !!fOf(p, 'swiftgold'), words: () => 'win gold with the SWIFT CHARM worn' },
  cleanspikes: { need: 1, have: p => fOf(p, 'cleanspikes'), done: p => !!fOf(p, 'cleanspikes'), words: () => 'clear a wood with spikes and never touch one' },
  minino:     { need: 1, have: p => fOf(p, 'minino'), done: p => !!fOf(p, 'minino'), words: () => 'beat a mini-boss without taking a hit' },
  heroclear:  { need: 3, have: p => heroBest(p), done: (p, n) => heroBest(p) >= n, words: p => 'clear one wood with three different heroes (' + Math.min(3, heroBest(p)) + ' of 3)' },
  bossrevive: { need: 1, have: p => fOf(p, 'bossrevive'), done: p => !!fOf(p, 'bossrevive'), words: () => 'revive an ally in the middle of a boss fight' },
  ribbongold: { need: 1, have: p => fOf(p, 'ribbongold'), done: p => !!fOf(p, 'ribbongold'), words: () => "win gold with the RUNNER'S RIBBON worn" },
  bossnoflask: { need: 1, have: p => fOf(p, 'bossnoflask'), done: p => !!fOf(p, 'bossnoflask'), words: () => 'beat a boss without drinking a flask' },
};
export const featKinds = Object.keys(FEATS);
export const isFeat = f => featKinds.includes(String(f || '').split(':')[0]);
export const featNeed = f => +String(f).split(':')[1] || 0;
export const featDone = (f, prog) => { const k = String(f).split(':')[0], F = FEATS[k]; return !!F && F.done(prog, featNeed(f)); };
export const featProgress = (f, prog) => { const k = String(f).split(':')[0], F = FEATS[k]; if (!F) return ''; const n = featNeed(f); return F.need > 1 ? Math.min(F.have(prog), n) + ' OF ' + n : (F.done(prog, n) ? 'DONE' : 'NOT YET'); };
export const featWords = (f, prog) => { const F = FEATS[String(f).split(':')[0]]; return F ? F.words(prog) : ''; };

/* THE TWELVE. tier: 1 early, 2 mid, 3 hard/late. Exactly one of needs / feat (feats only here). featName is a function of the save: it carries the progress. riddle: the shop shows '???' and the line until it is earned. */
const ROW = (id, name, price, tier, desc, feat, extra = {}) => ({ id, name, price, tier, desc, feat, featName: p => featWords(feat, p), ...extra });
export const CHARMS3 = [
  ROW('magpie',  "MAGPIE'S EYE",     70,  1, 'silver within 14 tiles glints, and an edge pip points to it', 'silverin:12'),
  ROW('surefoot', 'SURE FOOT',        80,  1, 'a longer grace after a ledge, but a jump 4% lower', 'clean:3'),
  ROW('ink',      "CARTOGRAPHER'S INK", 60, 1, 'the map pins the silver and medal you have won on every wood', 'silver1life:1'),
  ROW('spade',    "GRAVEDIGGER'S SPADE", 50, 1, 'your purse is found from further off, but only four in five coins come back', 'purseback:1', { riddle: true }),
  ROW('northstar', 'NORTH STAR',     70,  2, 'lost for 20 seconds? an arrow at the edge of the screen points to the way out', 'firstgold:1'),
  ROW('scout',    "SCOUT'S CAP",      60,  2, 'the camera leads further ahead, so less is seen behind you', 'swiftgold:1'),
  ROW('redthread', 'RED THREAD',     70,  2, 'spikes glow with a red thread within 5 tiles', 'cleanspikes:1'),
  ROW('bone',     'BONE-READER',      70,  2, 'a foe you have struck shows its health. never a boss', 'minino:1'),
  ROW('crumbs',   'BREADCRUMBS',      60,  2, 'a trail of crumbs marks where you have already walked', 'heroclear:3'),
  ROW('brother',  'BROTHERHOOD KNOT', 80,  3, 'an ally you lift is up in two thirds of the usual time', 'bossrevive:1'),
  ROW('hourglass', 'HOURGLASS',       90, 3, 'a clock on the screen counts you against the next medal', 'ribbongold:1'),
  ROW('tell',     'TELL-LENS',       100, 3, 'a foe winding up a blow is ringed in red, but the corners of the screen darken', 'bossnoflask:1'),
];
export const CHARM3_IDS = CHARMS3.map(c => c.id);
export const rows = () => ship ? CHARMS3.map(c => ({ ...c })) : [];
export const worn = charm => ship && CHARM3_IDS.includes(charm) ? charm : null;
/* the shop's lock-state sort (recommended + built for 27 rows): what you can wear or buy first, the locked last by tier then price; flag off = the list as it is */
export const sortRows = (list, lockedOf) => { if (!ship) return list; const tier = k => k.tier || 0; const a = list.map((k, i) => ({ k, i, l: k.id === 'none' ? 0 : lockedOf(k) ? 1 : 0 }));
  a.sort((x, y) => x.l - y.l || (x.l ? tier(x.k) - tier(y.k) || x.i - y.i : x.i - y.i)); return a.map(o => o.k); };
/* a riddle row hides its name and shows only the line until it is earned */
export const hideRiddle = (k, locked) => ship && k.riddle && locked ? { ...k, name: '???', desc: featWords(k.feat, {}), featName: () => featWords(k.feat, {}) } : k;

/* ---- THE NUMBERS ---- */
export const COYOTE_MUL = 1.5, JUMP_MUL = 0.96;
export const SILVER_RANGE_TILES = 14, THREAD_TILES = 5, NORTH_IDLE_S = 20, NORTH_GAIN_PX = 8;
export const CAM_LEAD_PX = 28;
export const SPADE = { keep: 0.8, reach: 2.2 };   /* a purse is found from 2.2x as far off, and 80% of the coins come back */
export const BROTHER_REVIVE = 2 / 3;
export const sureFootCoyote = (charm, base) => worn(charm) === 'surefoot' ? base * COYOTE_MUL : base;
export const jumpMul = charm => worn(charm) === 'surefoot' ? JUMP_MUL : 1;
export const camLead = (charm, face) => worn(charm) === 'scout' ? CAM_LEAD_PX * (face < 0 ? -1 : 1) : 0;
export const spadeReach = charm => worn(charm) === 'spade' ? SPADE.reach : 1;
export const spadeKeep = (charm, n) => worn(charm) === 'spade' ? Math.floor(n * SPADE.keep) : n;
export const reviveTime = (charm, t) => worn(charm) === 'brother' ? t * BROTHER_REVIVE : t;
export const silverNear = (charm, dx, dy, ts = 16) => worn(charm) === 'magpie' && Math.hypot(dx, dy) <= SILVER_RANGE_TILES * ts;
export const threadNear = (charm, dx, dy, ts = 16) => worn(charm) === 'redthread' && Math.hypot(dx, dy) <= THREAD_TILES * ts;
/* NORTH STAR: the player has not got nearer the exit by NORTH_GAIN_PX for NORTH_IDLE_S seconds */
export function northStep(st, dist, now) { if (st.best === undefined || dist < st.best - NORTH_GAIN_PX) { st.best = dist; st.t = now; } return now - st.t >= NORTH_IDLE_S; }

/* ---- THE RUN (this life of the wood: reset when a wood loads, never saved) ---- */
export const run = { hazard: false, silver: 0, hits0: 0, miniHits0: -1, miniOn: false, north: {}, trail: [] };
export const reset = () => { run.hazard = false; run.silver = 0; run.hits0 = 0; run.miniHits0 = -1; run.miniOn = false; run.north = {}; run.trail.length = 0; };
export const noteHazard = () => { if (ship) run.hazard = true; };
export const noteSilver = () => { if (ship) run.silver++; };
export const noteMiniStart = hitsTaken => { if (ship) { run.miniOn = true; run.miniHits0 = hitsTaken; } };
export function noteMiniEnd(prog, hitsTaken, clean) { if (!ship || !run.miniOn) return false; run.miniOn = false; if (clean && hitsTaken === run.miniHits0) return set(prog, 'minino'); return false; }
export const noteDeath = prog => { if (!ship) return false; c3(prog).streak = 0; run.silver = 0; return true; };
const set = (prog, k) => { const f = c3(prog).f; if (f[k]) return false; f[k] = 1; return true; };
export function noteRevive(prog, helperIsPlayerOne, inFight) { if (!ship || !helperIsPlayerOne || !inFight) return false; return set(prog, 'bossrevive'); }
export function notePurse(prog, where) { if (!ship || where !== 'foe') return false; return set(prog, 'purseback'); }
/* THE WIN. ctx: { id, hero, charm, medal (0..3 now), wasCleared, deaths, hits, drinks, boss (the wood has a boss arena), spikes (the wood has spike tiles), clean (a real, unaided, solo run) }
   returns the list of feats this win completed. `clean` is false under assist / god mode / dev / playtest jumps / the maker / rush / co-op, so none of this can be cheesed there. */
export function onWin(prog, ctx) {
  if (!ship || !ctx || !ctx.clean) return [];
  const got = [], mark = k => { if (set(prog, k)) got.push(k); }, c = c3(prog);
  if (ctx.id === 'wood') { /* the first wood never earns a feat by accident (it counts towards nothing here) */ }
  else {
    if (ctx.deaths === 0) { c.streak = Math.min(99, c.streak + 1); } else c.streak = 0;
    if (!ctx.wasCleared && ctx.medal === 3) mark('firstgold');
    if (ctx.medal === 3 && ctx.charm === 'swift') mark('swiftgold');
    if (ctx.medal === 3 && ctx.charm === 'ribbon') mark('ribbongold');
    if (ctx.spikes && !run.hazard && ctx.deaths === 0) mark('cleanspikes');
    if (ctx.boss && ctx.drinks === 0 && ctx.deaths === 0) mark('bossnoflask');
    if (run.silver >= 3 && ctx.deaths === 0) mark('silver1life');
    const a = c.heroLv[ctx.id] = Array.isArray(c.heroLv[ctx.id]) ? c.heroLv[ctx.id] : []; if (ctx.hero && !a.includes(ctx.hero) && a.length < 12 && Object.keys(c.heroLv).length <= 120) a.push(ctx.hero);
  }
  return got;
}
