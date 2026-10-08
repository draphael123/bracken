// tools/lantern-eater.mjs - THE LANTERN-EATER, the boss at the end of THE FOG CANAL (claude/lanterneater, Daniel 10-07: Jenny Greenteeth's raft duel "just
// isn't working, clunky" - he kept the raft and approved a beast under the basin). src/lantern-eater.js is the fight (its header is the design). This replaces
// tools/greenteeth.mjs, rule for rule (a deliberate design change, Daniel's - the same strictness, on the new boss):
// PURE (src/lantern-eater.js, no page):
//   - ITS FOUR BLOWS (the gulp, the snap, the hunt, the swell) ARE TOLD with their mark, answer and height (src/marks.js rows) and nothing of Jenny's is left
//     in the tables; EVERY BLOW FIRES in a fuzz of all three phases; ONE NEW BLOW A PHASE (gulp, snap, hunt), the swell in every phase
//   - VULNERABILITY KEYS (design standard B14): phase one the dangling LURE (a HIGH blow lands whole), phase two the GUMS at the rail (a LOW blow), phase three
//     the lure again (HIGH); a blow at the wrong height is the ward (a twentieth) and is NAMED (TOO LOW / TOO HIGH); out of reach (its ward, the swell, idle)
//     everything is the ward; every blow's angle is read from the swing (blowAngle)
//   - THE READ: phase one's two lights are one lure and one real lamp, at opposite ends of the raft; the lure SWAYS (moves) and never flickers, the lamp
//     hangs still and FLICKERS; a blow on the lamp takes nothing; the gulp comes up under the LURE
//   - REACHABLE EVERY CYCLE (B12/B13): every attack cycle of phases one and two puts its keyed part in reach; phase three's lure comes every cycle the light is up
//   - THE OPENING COMES FROM FIGHTING IT, at least 3 s: the lure struck at its key is snagged (every angle lands, x openMul, at most its share); the snap
//     stepped out of sticks its teeth in the raft; LEFT ALONE A MINUTE (in any phase, never striking, never stepping out) it never opens; after every opening
//     it is WARDED (told, a twentieth) for LE.wardT
//   - PHASE THREE: the lamps are snuffed (told); the lantern DIMMED, no lure comes and it bites copies; RAISED, the lure comes and so does the hunt; dimmed
//     in the hunt's tell, the hunt takes a copy (no blow lands)
//   - FIERCER EACH PHASE (quicker gaps and tells - every tell >= 0.5 s); the human bot is not perfect (src/lantern-eater.js PLAN)
// THE STAGE: THE FOG CANAL (src/fog-canal.js section 7): claude/canal4's raft chamber, foreshadowed (the lamps that are not lamps, the bargemen's line)
// IN THE PAGE: walked onto the raft it wakes and the raft goes out; FOR EVERY HERO a real jump attack lands whole on the dangling lure and a
//   plain swing clanks, and a real low sweep lands whole on its gums at the rail and a plain swing clanks there; the real lamp struck takes nothing; phase
//   three's lantern dims and rises to a real swing; open, a real swing lands; a fall into its water is handed back onto the raft; its death ends the fight
//   and the raft drifts to the east landing.
//   node tools/lantern-eater.mjs            (PORT from tools/ports.mjs)       node tools/lantern-eater.mjs --pure    (no page)
import { openPage } from './cdp.mjs';
import * as M from '../src/lantern-eater.js';
import { MARK, ANSWER, HEIGHT, BY_HAND } from '../src/marks.js';
import { OPEN_RULE, OWN_WARD } from '../src/boss-greed.js';
import { TURN_WORD } from '../src/boss-read.js';
import { LEVELS, T } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, SX = 20, R = 21, A = M.geom(SX, R, TS), LE = M.LE;
/* a raft and a world: o.dodge - the hero is never in a zone or a band (he steps out / jumps) */
function rig(o = {}) {
  const show = M.newShow(A); M.startFight(show);
  const e = M.newLanternEater({ t: 'lanterneater', x: A.mid, y: A.deck, hp: o.hp ?? LE.hp, maxHp: LE.hp, alive: true });
  e.mode = 'wake'; e.modeT = 1.6;
  const hero = { x: A.mid, y: A.deck, ground: true, swim: false, onRaft: true, alive: true };
  const log = { zones: [], bands: [], lines: [], sounds: [], events: {}, pulled: 0, tells: new Set(), maxTells: 0 };
  const r0 = { dodge: !!o.dodge };
  const c = { heroes: [hero], say: () => {}, sound: k => log.sounds.push(k), number: (x, y, t) => log.lines.push(t),
    zone: ([x0, x1], b, d, name, key) => { log.zones.push({ x0, x1, d, name, key }); return !r0.dodge && hero.x > x0 - 5 && hero.x < x1 + 5 ? 1 : 0; },
    band: (kind, b, x0, x1, d, name, key) => { log.bands.push({ kind, x0, x1, d, name, key }); return !r0.dodge && hero.x >= x0 && hero.x <= x1 ? 1 : 0; },
    pull: () => { log.pulled++; }, raft: () => {} };
  const step = () => { const ev = M.stepShow(e, show, DT, c); for (const v of ev) log.events[v.t] = (log.events[v.t] || 0) + 1;
    const live = ['gulpTell', 'snapTell', 'huntTell', 'swellTell'].filter(m => e.mode === m || (m === 'swellTell' && show.swell && show.swell.st === 'tell')); log.maxTells = Math.max(log.maxTells, live.length); if (/Tell$/.test(e.mode)) log.tells.add(e.mode); return ev; };
  const run = (n, f) => { for (let i = 0; i < n; i++) { if (f) f(i); step(); } };
  const at = x => { const [a, b] = M.raftEnds(show); hero.x = Math.max(a + 10, Math.min(b - 10, x)); hero.y = M.deckY(show); hero.ground = true; hero.onRaft = true; };
  return { show, e, hero, log, c, step, run, at, r0 };
}
const until = (r, pred, n = 600, f) => { for (let i = 0; i < n; i++) { if (pred()) return true; if (f) f(i); r.step(); } return pred(); };
const awake = r => { until(r, () => r.e.mode !== 'wake', 400); return r; };
const toPhase = (r, ph) => { if (ph >= 2) { r.e.hp = LE.hp * (ph === 2 ? 0.6 : 0.3); if (ph === 3) r.e.phase = 2; until(r, () => r.e.phase === ph && !['phase', 'snuff'].includes(r.e.mode), 60 * 20); } return r; };
/* stand clear of whatever is coming (the dodging hero): away from the gulp, the hunt, the snap's mark */
const dodgeTo = r => { const S = r.show, e = r.e, [a, b] = M.raftEnds(S), far = x => (x - a > b - x ? a + 14 : b - 14);
  if (e.mode === 'gulpTell' && S.gulp) r.at(far(S.gulp.x)); else if (e.mode === 'huntTell' && S.hunt) r.at(far(S.hunt.x)); else if (e.mode === 'snapTell' && S.snap && S.snap.fixed) r.at(far(S.snap.x)); };

// ---- THE MARKS: its four blows told, with their answer and height; nothing of Jenny's left in the tables ----
{ const ROWS = { gulpTell: ['!!', 'dodge', 'low'], snapTell: ['!!', 'dodge', 'low'], huntTell: ['!!', 'dodge', 'low'], swellTell: ['!!', 'jump', 'low'] };
  for (const [m, [mk, an, hg]] of Object.entries(ROWS)) { const k = 'lanterneater|' + m; ok(MARK[k] === mk && BY_HAND[k] === mk, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + mk); ok(ANSWER[k] === an, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + an); ok(HEIGHT[k] === hg, k + ' is ' + JSON.stringify(HEIGHT[k]) + ' high, not ' + hg);
    const mv = M.MOVES[m.replace(/Tell$/, '')]; ok(mv && mv.mark === mk && mv.answer === an && mv.h === hg, 'the fight\'s own row for ' + m + ' disagrees with src/marks.js'); }
  ok(Object.keys(M.MOVES).sort().join() === 'gulp,hunt,snap,swell', 'its blows are not the gulp, the snap, the hunt and the swell: ' + Object.keys(M.MOVES));
  for (const T0 of [MARK, BY_HAND, ANSWER, HEIGHT]) ok(!Object.keys(T0).some(k => k.startsWith('greenteeth|')), 'a JENNY GREENTEETH row is still in src/marks.js (she is benched)');
  ok(typeof OPEN_RULE.lanterneater === 'function' && !OPEN_RULE.greenteeth && OWN_WARD.has('lanterneater') && !OWN_WARD.has('greenteeth'), 'src/boss-greed.js does not know it (or still knows Jenny)');
  ok(typeof TURN_WORD.lanterneater === 'function' && TURN_WORD.lanterneater({ mode: 'gulpTell', part: 'lure' }) === 'TOO LOW' && TURN_WORD.lanterneater({ mode: 'jaws' }) === 'TOO HIGH', 'its turned blow does not name the wrong height (src/boss-read.js)'); }

// ---- EVERY BLOW FIRES, ONE NEW BLOW A PHASE, ONE WINDUP AT A TIME: a fuzz of each phase, the hero moved about the deck (and the light kept up) ----
{ const byPhase = { 1: {}, 2: {}, 3: {} }; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; let maxTells = 0;
  for (const ph of [1, 2, 3]) { const r = toPhase(awake(rig({ dodge: true })), ph), n0 = { ...r.show.n };
    r.run(60 * 90, i => { if (i % 90 === 0) r.at(M.raftEnds(r.show)[0] + 20 + rnd() * 184); if (r.e.phase !== ph) r.e.hp = LE.hp * (ph === 1 ? 0.9 : ph === 2 ? 0.6 : 0.3); });
    for (const k of ['gulp', 'snap', 'hunt', 'swell', 'stuck', 'lights', 'surface']) byPhase[ph][k] = r.show.n[k] - (n0[k] || 0); maxTells = Math.max(maxTells, r.log.maxTells); }
  for (const k of ['gulp', 'snap', 'hunt', 'swell']) ok([1, 2, 3].some(p => byPhase[p][k] > 0), 'ITS ' + k.toUpperCase() + ' never fired in a fuzz of all three phases: ' + JSON.stringify(byPhase));
  ok(byPhase[1].swell > 0 && byPhase[2].swell > 0 && byPhase[3].swell > 0, 'the swell did not come in every phase: ' + JSON.stringify(byPhase));
  ok(byPhase[1].gulp > 0 && byPhase[2].snap > 0 && byPhase[3].hunt > 0, 'a phase\'s new blow did not come in its phase: ' + JSON.stringify(byPhase));
  ok(!byPhase[1].snap && !byPhase[1].hunt && !byPhase[2].hunt && !byPhase[2].gulp && !byPhase[3].snap && !byPhase[3].gulp, 'a blow came outside its phase: ' + JSON.stringify(byPhase));
  ok(maxTells <= 1, 'two windups at once (' + maxTells + '): one at a time');
  ok(M.NEW_MOVE[1] === 'gulp' && M.NEW_MOVE[2] === 'snap' && M.NEW_MOVE[3] === 'hunt', 'one new blow a phase is not gulp / snap / hunt');
  ok(byPhase[1].lights >= 5 && byPhase[2].surface >= 4 && byPhase[3].lights >= 4, 'its keyed part did not come round every cycle (B12/B13): ' + JSON.stringify(byPhase)); }

// ---- THE KEYS (B14) ----
{ const r = awake(rig({ dodge: true })), S = r.show, e = r.e;
  ok(until(r, () => e.mode === 'gulpTell', 60 * 10) && e.part === 'lure', 'phase one: the lights never came down to dangle the lure over its mouth');
  ok(M.keyOf(e) === 'high' && M.leTakeAt(e, S, 'high') === 1 && M.leTakeAt(e, S, 'mid') === LE.ward && M.leTakeAt(e, S, 'low') === LE.ward, 'phase one, the lure dangling over the gulp: a high blow on the lure must land whole, a mid or low one at the ward');
  ok(r.log.lines.includes('TWO LIGHTS: THE LAMP FLICKERS. THE LURE SWAYS: HIT IT HIGH') && r.log.lines.includes('THE LURE IS ITS WEAK POINT: JUMP AND STRIKE, OR UP AND STRIKE'), 'the read and the key were not told when the lights came');
  ok(M.KEY_WORD.high === 'TOO LOW' && M.KEY_WORD.low === 'TOO HIGH', 'a turned blow does not say what was wrong with it');
  const P = (o) => Object.assign({ ground: true, swim: false, atk: 0.05, swingKind: null }, o);
  ok(M.blowAngle(P({ ground: false })) === 'high' && M.blowAngle(P({ swingKind: 'rise' })) === 'high' && M.blowAngle(P({ swingKind: 'airUp', ground: false })) === 'high' && M.blowAngle(P({ plunge: true, ground: false })) === 'high', 'a jump attack, the rising cut, the air up-swing and the plunge are not HIGH');
  ok(M.blowAngle(P({ swingKind: 'sweep' })) === 'low' && M.blowAngle(P({ caTrip: true, swingKind: 'sweep' })) === 'low', 'the low sweep (and the knight\'s trip) is not LOW');
  ok(M.blowAngle(P({})) === 'mid' && M.blowAngle(P({ heavy: true })) === 'mid' && M.blowAngle(P({ atk: -1 })) === 'mid', 'a plain standing swing (or a heavy, or a shot) is not MID');
  for (const m of ['idle', 'swell', 'swellTell', 'ward', 'rise', 'lights']) { const q = awake(rig({ dodge: true })); q.e.mode = m; ok(M.leTakeAt(q.e, q.show, 'high') === LE.ward && M.leTakeAt(q.e, q.show, 'low') === LE.ward, 'out of reach (' + m + ') a blow is not the ward'); }
  const q = toPhase(awake(rig({ dodge: true })), 2); ok(until(q, () => q.e.mode === 'jaws', 60 * 15, () => dodgeTo(q)), 'phase two: its jaws never came up at the rail');
  ok(M.keyOf(q.e) === 'low' && M.leTakeAt(q.e, q.show, 'low') === 1 && M.leTakeAt(q.e, q.show, 'high') === LE.ward && M.leTakeAt(q.e, q.show, 'mid') === LE.ward && q.log.lines.includes('IT SURFACES BESIDE THE RAFT: HIT ITS GUMS LOW'), 'phase two: its gums are not keyed LOW (told)');
  const [x0, x1] = M.raftEnds(q.show); ok(Math.abs(q.e.x - x0) < 12 || Math.abs(q.e.x - x1) < 12, 'phase two: its jaws are not at the raft\'s rail: ' + q.e.x + ' (' + x0 + '-' + x1 + ')');
  const w = toPhase(awake(rig({ dodge: true })), 3); ok(until(w, () => w.e.mode === 'huntTell' && w.e.part === 'lure', 60 * 15) && M.keyOf(w.e) === 'high' && M.leTakeAt(w.e, w.show, 'high') === 1 && M.leTakeAt(w.e, w.show, 'low') === LE.ward, 'phase three: the lure at your light is not keyed HIGH'); }

// ---- THE READ: one lure, one lamp, opposite ends; the lure sways and never flickers, the lamp hangs still and flickers; the gulp comes under the lure ----
{ let both = 0, opp = 0, swayOK = 0, lampOK = 0, gulpOK = 0, gulps = 0;
  for (let k = 0; k < 6; k++) { const r = awake(rig({ dodge: true })), S = r.show; until(r, () => r.e.mode === 'gulpTell', 60 * 15);
    const lure = S.lights.find(L => L.kind === 'lure'), lamp = S.lights.find(L => L.kind === 'lamp'), [a, b] = M.raftEnds(S), mid = (a + b) / 2;
    if (lure && lamp && S.lights.length === 2) both++; if (lure && lamp && Math.sign(lure.x - mid) === -Math.sign(lamp.x - mid)) opp++;
    let sx = new Set(), fl = new Set(), lx = new Set(); r.run(85, () => { sx.add(Math.round((lure.x + lure.sway) * 2)); fl.add(lamp.flick); lx.add(Math.round(lamp.x + lamp.sway)); });
    if (Math.max(...sx) - Math.min(...sx) >= 16 && lure.flick === 1) swayOK++; if (lx.size === 1 && fl.size >= 2) lampOK++;
    if (r.show.gulp) { gulps++; if (Math.abs(r.show.gulp.x - lure.x) < 1) gulpOK++; } }
  ok(both === 6 && opp === 6, 'phase one\'s lights are not one lure and one lamp at opposite ends (' + both + ', ' + opp + ' of 6)');
  ok(swayOK === 6 && lampOK === 6, 'the lure does not sway steadily or the lamp does not hang still and flicker (' + swayOK + ', ' + lampOK + ' of 6)');
  ok(gulps === 6 && gulpOK === 6, 'the gulp does not come up under the lure (' + gulpOK + ' of ' + gulps + ')');
  const r = awake(rig()); until(r, () => r.e.mode === 'gulpTell', 60 * 10); const lamp = r.show.lights.find(L => L.kind === 'lamp');
  const hb = { l: lamp.x - 6, r: lamp.x + 6, t: lamp.y - 16, b: lamp.y - 2 }; const s0 = M.strikeAt(r.e, r.show, hb, new Set());
  ok(s0.some(q => q.what === 'lamp') && r.show.n.lampHit === 1 && !r.show.snagged, 'a swing at the real lamp is not told as the lamp (or it snagged the lure)'); }

// ---- LEFT ALONE A MINUTE (never striking, never stepping out) it never opens - in any phase ----
for (const ph of [1, 2, 3]) { const r = toPhase(awake(rig()), ph); let opened = 0; const mid = () => { const [a, b] = M.raftEnds(r.show); return (a + b) / 2; };
  r.run(60 * 60, () => { r.at(mid() - 40); if (M.leOpen(r.e)) opened++; if (r.e.phase !== ph) r.e.hp = LE.hp * (ph === 1 ? 0.9 : ph === 2 ? 0.6 : 0.3); });
  ok(opened === 0, 'phase ' + ph + ': left alone for a minute it was open ' + opened + ' frames');
  if (ph === 2) ok(r.show.n.snap > 0 && r.show.n.snapHit === r.show.n.snap, 'a snap that landed on the hero still stuck its teeth (' + r.show.n.snap + ' snaps, ' + r.show.n.snapHit + ' hit)'); }

// ---- THE OPENINGS: the lure snagged; the snap stepped out of; each open >= 3 s, every angle, its share; then WARDED, told ----
{ const r = awake(rig({ dodge: true })); until(r, () => r.e.mode === 'gulpTell', 60 * 10); ok(M.snag(r.e, r.show) === 'jerk' && !r.show.snagged && M.snag(r.e, r.show) === 'snag' && LE.snagN === 2, 'two keyed blows on the dangling lure did not jerk it, then snag it'); r.step();
  ok(M.leOpen(r.e) && r.e.part === 'lure' && r.e.modeT >= 3 - 0.02 && M.leTakeAt(r.e, r.show, 'mid') === LE.openMul && M.leTakeAt(r.e, r.show, 'low') === LE.openMul, 'the snagged lure is not open to every angle for 3 s or more');
  ok(r.log.lines.includes('THE LURE IS SNAGGED: CUT IT'), 'the snag was not said');
  let got = 0; for (let i = 0; i < 20; i++) got += M.leCap(r.e, 100); ok(got <= LE.openCap * LE.hp + 20 * 100 * LE.ward && got >= LE.openCap * LE.hp - 1, 'twenty heavy blows in one opening took ' + got + ' (the share is ' + Math.round(LE.openCap * LE.hp) + ')');
  let t = 0; while (M.leOpen(r.e) && t < 600) { r.step(); t++; } ok(t * DT >= 3 - 0.02, 'the snag ran ' + (t * DT).toFixed(2) + ' s');
  ok(r.e.mode === 'ward' && M.leTakeAt(r.e, r.show, 'high') === LE.ward && r.log.lines.includes('IT DRAWS BACK: WARDED A MOMENT'), 'after the opening it was not warded (told)');
  let wt = 0; while (r.e.mode === 'ward' && wt < 600) { r.step(); wt++; } ok(wt * DT >= LE.wardT - 0.05 && LE.wardT >= 2.5 && LE.wardT <= 3.5, 'the ward ran ' + (wt * DT).toFixed(2) + ' s (B3: about three)');
  const q = toPhase(awake(rig()), 2); let stuck = false;
  until(q, () => (stuck = M.leOpen(q.e)), 60 * 30, () => { const S = q.show; if (q.e.mode === 'snapTell' && S.snap && S.snap.fixed) { const [a, b] = M.raftEnds(S); q.at(S.snap.x - a > b - S.snap.x ? a + 14 : b - 14); } });
  ok(stuck && q.e.part === 'jaws' && q.e.modeT >= 3 - 0.05 && q.log.lines.includes('ITS TEETH ARE IN THE TIMBER: CUT IT'), 'stepping out of the fixed snap did not stick its teeth in the raft, open for 3 s or more (' + JSON.stringify(q.show.n) + ')');
  ok(LE.openT >= 3, 'the opening is under 3 s'); }

// ---- PHASE THREE: the lamps snuffed; the lantern dimmed - copies bitten, no lure; raised - the lure and the hunt; dimmed in the hunt's tell it takes a copy ----
{ const r = toPhase(awake(rig({ dodge: true })), 3); ok(r.log.lines.includes('IT SNUFFS EVERY LAMP: YOUR LANTERN IS THE ONLY LIGHT') && r.show.dark > 0.5, 'phase three did not snuff the lamps (told, dark)');
  until(r, () => r.e.mode === 'huntTell' || r.e.mode === 'lights', 60 * 10); ok(M.strikeLantern(r.e, r.show, r.c) === 'dim' && !r.show.lantern.lit, 'the lantern did not dim when struck');
  let dangles = 0; r.run(60 * 12, () => { r.show.lantern.cd = 1; if (r.e.mode === 'huntTell' || r.e.mode === 'lights') dangles++; });
  ok(dangles === 0 && r.show.n.decoy >= 3 && r.log.lines.includes('YOUR LANTERN IS DIM: IT HUNTS THE COPIES') && r.log.lines.includes('RAISE YOUR LIGHT: THE LURE COMES ONLY TO A LIT LANTERN'), 'dimmed, a lure still came or no copies were bitten (or nothing said so): ' + JSON.stringify({ dangles, decoy: r.show.n.decoy }));
  r.show.lantern.cd = 0; ok(M.strikeLantern(r.e, r.show, r.c) === 'raise' && r.show.lantern.lit, 'the lantern did not rise when struck again');
  ok(until(r, () => r.e.mode === 'huntTell' && r.e.part === 'lure', 60 * 10), 'raised, the lure did not come to the light (over the hunt)');
  ok(r.show.hunt && Math.abs(r.show.hunt.x - M.lanternX(r.show)) < 1 && Math.abs(r.show.lure.x - M.lanternX(r.show)) <= LE.huntR, 'raised, the hunt is not under the lantern with the lure over it');
  const z0 = r.log.zones.length; r.show.lantern.cd = 0; M.strikeLantern(r.e, r.show, r.c); r.run(60 * 2);
  ok(r.show.n.huntCopy >= 1 && !r.log.zones.slice(z0).some(z => z.name === M.MOVE_NAME.hunt), 'dimmed in the hunt\'s tell, the hunt still came down on the lantern'); }

// ---- FIERCER EACH PHASE; every tell at least half a second ----
{ for (const [k, mv] of Object.entries(M.MOVES)) ok(mv.tell * LE.tellK[2] >= 0.5, 'ITS ' + k.toUpperCase() + ' is told ' + (mv.tell * LE.tellK[2]).toFixed(2) + ' s in phase three (at least 0.5)');
  ok(LE.gap[0] > LE.gap[1] && LE.gap[1] > LE.gap[2] && LE.tellK[0] > LE.tellK[1] && LE.tellK[1] > LE.tellK[2], 'it is not fiercer each phase (gap ' + LE.gap + ', tells ' + LE.tellK + ')');
  ok(LE.phaseT >= 1.5 && LE.snuffT >= 1.5 && LE.surfaceT >= 0.6, 'its turns are told too short'); }

// ---- THE SWELL: told, then a band along the deck (a jump clears it) ----
{ const r = awake(rig()); ok(until(r, () => r.show.n.swell > 0 && !r.show.swell, 60 * 60, () => r.at(A.mid)), 'the swell never ran along the deck (' + JSON.stringify(r.show.n) + ')');
  ok(r.log.bands.some(b => b.name === M.MOVE_NAME.swell && b.kind === 'low') && r.log.lines.includes('IT PASSES UNDER THE RAFT: JUMP THE SWELL'), 'the swell drew no low band, or was not taught'); }

// ---- THE HUMAN BOT ----
ok(M.PLAN.react >= 0.2 && M.PLAN.missDodge > 0 && M.PLAN.wrongAngle > 0 && M.PLAN.misLight > 0 && M.PLAN.readT >= 0.3, 'the bot plays perfectly (PLAN ' + JSON.stringify(M.PLAN) + ')');

// ---- THE STAGE (the canal's) ----
{ const lv = LEVELS.find(l => l.id === 'canal'); ok(lv && !lv.hidden, 'the canal is not the level that holds it');
  if (lv) { const L = lv.build(), A2 = L.arena, g = (x, y) => L.grid[y * L.W + x], sx = A2.lock.sx, Rr = A2.lock.R;
    ok(A2 && A2.boss === 'lanterneater' && A2.music === 'lanterneater', 'the raft chamber is not its arena with its music');
    const w = A2.wallR - A2.wallL; ok(w >= 36 && w <= 44, 'the chamber is ' + w + ' wide (rule A7: about forty)');
    ok(A2.trigger > (sx + M.STAGE.land + 1) * 16, 'the trigger is not out on the raft (past the west landing)'); ok(L.ents.some(e => e.t === 'check' && e.x < A2.wallL), 'no checkpoint stands outside the chamber');
    ok(L.ents.filter(e => e.t === 'lanterneater').length === 1 && !L.ents.some(e => e.t === 'greenteeth'), 'it is not in the chamber once (or Jenny still is)');
    ok([1, 2, 3].every(k => g(sx + k, Rr) === T.SOLID) && [1, 2, 3].every(k => g(sx + 39 - k, Rr) === T.SOLID), 'the landings inside its doors are not stone at the deck\'s height');
    ok([...Array(M.STAGE.depth).keys()].every(k => g(sx + 20, Rr + k) === T.AIR) && g(sx + 20, Rr + M.STAGE.depth) === T.SOLID, 'its water is not ' + M.STAGE.depth + ' rows deep over a bed');
    ok((L.pools || []).some(p => p.lock && p.leWater && !p.swim && !p.shallow), 'its water is not a deep pool that bites (and hands you back)');
    ok((L.moversExtra || []).filter(m => m.leRaft).length === 1 && L.moversExtra.find(m => m.leRaft).w === LE.raftW, 'there is not one raft');
    ok(L.waterHurts, 'the canal does not hand a hero back out of its water');
    const D = L.canal; ok((D.lures || []).length >= 3 && (D.lures || []).some(([x]) => x < 250) && L.ents.some(e => e.t === 'sign' && e.x >= 380 && e.x < sx && /FLICKERS/.test(e.text) && /SWAYS/.test(e.text)),
      'it is not foreshadowed (B8): the lamps that are not lamps glimpsed in the fog before the basin, and the bargemen\'s line at its door'); } }

if (!process.argv.includes('--pure')) {
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const {HERO_IDS}=await import('/src/progression.js');BK.manualSimulation=true;BK.SET.speed=1;const out={heroes:{}};
    const boot=h=>{BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='canal'));BK.start();BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(A.lock.sx+2,A.lock.R-1);BK.sim(20);BK.tp(A.start[0],A.start[1]);BK.sim(60*4);return BK.boss;};
    const e=boot('knight'),S=BK.lanternEaterHands().show(),P=BK.P,m=BK.movers().find(q=>q.leRaft);
    out.woke={active:BK.bossActive&&e&&e.t==='lanterneater',mode:e.mode,onRaft:P.onMover===m,raftX:Math.round(S.raft.x),mid:S.A.moorMid};
    /* FOR EVERY HERO: on the dangling lure a real jump attack lands whole (and snags it), a plain swing clanks; on its gums at the rail a real low sweep lands whole, a plain swing clanks */
    for(const h of HERO_IDS){ boot(h); const SS=BK.lanternEaterHands().show(),ee=BK.boss,k=BK.keys;const o={};
      const hold=(mode)=>{SS.swell=null;SS.snagged=false;ee.mode=mode;ee.modeT=9;ee.modeLen=9;SS.snagHits=0;ee.hp=ee.maxHp*(mode==='jaws'?0.6:0.9);ee.phase=mode==='jaws'?2:1;BK.P.inv=99;BK.P.hp=BK.P.maxHp;BK.P.st=BK.P.maxSt;};
      const runBlow=(mode,fn)=>{const [a,b]=[SS.raft.x,SS.raft.x+SS.raft.w];const n0={...SS.n};
        if(mode==='gulpTell'){const lx=a+SS.raft.w/2;SS.lights=[{kind:'lure',x:lx,y:SS.A.deck-${M.LE.dangleY},sway:0,ph:0}];SS.lure=SS.lights[0];SS.gulp={x:lx,id:999};BK.P.x=lx-10;}
        else{SS.jaws={side:1,x:b+6};BK.P.x=b-10;}
        hold(mode);BK.P.y=SS.A.deck;BK.P.vx=0;BK.P.vy=0;BK.P.face=1;BK.sim(8);hold(mode);const h0=ee.hp;fn();let open=false;for(let i=0;i<60;i++){if(ee.mode==='open')open=true;if(!open)hold(mode);if(mode==='gulpTell'&&SS.lure)SS.lure.sway=0;BK.sim(1);}k.down=k.up=k.left=k.right=false;
        return {keyHits:(SS.n.keyHits||0)-(n0.keyHits||0),clank:SS.n.clank-n0.clank,angle:ee.lastAngle,open,took:h0-ee.hp};};
      o.jump=runBlow('gulpTell',()=>{BK.press('jump');for(let i=0;i<10;i++)BK.sim(1);BK.P.face=1;BK.press('atk');});
      o.plain=runBlow('gulpTell',()=>{BK.press('atk');});
      o.sweep=runBlow('jaws',()=>{k.down=true;BK.sim(3);BK.press('atk');BK.sim(4);});
      o.plainJaws=runBlow('jaws',()=>{BK.press('atk');});
      out.heroes[h]=o; }
    /* THE REAL LAMP: a real swing takes nothing */
    { const e2=boot('knight'),S2=BK.lanternEaterHands().show();const lx=S2.raft.x+40;S2.lights=[{kind:'lamp',x:lx,y:S2.A.deck-${M.LE.dangleY},sway:0,ph:0,flick:1}];e2.mode='gulpTell';e2.modeT=9;S2.lure=null;S2.gulp={x:lx+80,id:998};
      BK.P.x=lx-14;BK.P.y=S2.A.deck;BK.P.face=1;BK.P.inv=99;BK.sim(2);const h0=e2.hp,n0=S2.n.lampHit;BK.press('jump');for(let i=0;i<10;i++)BK.sim(1);BK.press('atk');for(let i=0;i<30;i++){e2.mode='gulpTell';e2.modeT=9;S2.lure=null;BK.sim(1);}
      out.lamp={hit:S2.n.lampHit-n0,took:h0-e2.hp};
    /* PHASE THREE: a real swing at the lantern dims it, another raises it */
      e2.hp=e2.maxHp*0.3;e2.phase=3;e2.mode='idle';e2.modeT=99;S2.lights=[];S2.lantern.lit=true;S2.lantern.cd=0;const lx2=S2.raft.x+S2.raft.w/2-38;BK.P.x=lx2-16;BK.P.y=S2.A.deck;BK.P.face=1;BK.sim(4);
      const sw=()=>{e2.mode='idle';e2.modeT=99;BK.press('atk');for(let i=0;i<30;i++){e2.mode='idle';e2.modeT=99;BK.sim(1);}return S2.lantern.lit;};
      out.lantern={afterOne:sw(),afterTwo:(S2.lantern.cd=0,sw())};
    /* OPEN (snagged): a real plain swing lands */
      e2.phase=1;e2.hp=e2.maxHp*0.9;const lx3=S2.raft.x+60;S2.lights=[{kind:'lure',x:lx3,y:S2.A.deck-${M.LE.dangleY},sway:0,ph:0}];S2.lure=S2.lights[0];e2.mode='open';e2.modeT=3;e2.openLen=3;e2.capLen=e2.capLeft=200;e2.part='lure';
      BK.P.x=lx3-14;BK.P.y=S2.A.deck;BK.P.face=1;BK.sim(2);const h1=e2.hp;BK.press('atk');for(let i=0;i<20;i++){e2.modeT=Math.max(e2.modeT,2);BK.P.inv=99;BK.sim(1);}out.open={dmg:h1-e2.hp,open:BK.bossOpen(e2)};
    /* A FALL INTO ITS WATER: bitten, and handed back onto the raft */
      e2.mode='idle';e2.modeT=99;BK.P.inv=0;BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;BK.P.x=S2.raft.x-30;BK.P.y=S2.A.deck+40;BK.P.vy=0;BK.P.onMover=null;let back=false;for(let i=0;i<60;i++){e2.mode='idle';e2.modeT=99;BK.sim(1);if(BK.P.onMover&&BK.P.onMover.leRaft)back=true;}
      out.fall={bit:hp0-BK.P.hp,back,x:Math.round(BK.P.x),raft:[Math.round(S2.raft.x),Math.round(S2.raft.x+S2.raft.w)]};BK.god=true;
    /* ITS DEATH ENDS THE FIGHT; the raft drifts to the east landing */
      e2.hp=1;e2.mode='open';e2.modeT=2;BKT.hurtEnemy(e2,99,e2.x-10,false);for(let i=0;i<60*6&&BK.bossActive;i++){BK.P.inv=99;BK.sim(1);}for(let i=0;i<60*6;i++){BK.state='play';BK.sim(1);}
      out.death={alive:e2.alive,active:BK.bossActive,raftX:Math.round(S2.raft.x),moorE:S2.A.moorE}; }
    return out;})()`, 900000);
  const w = r.woke; ok(w.active && w.mode !== 'sleep' && w.onRaft && Math.abs(w.raftX - w.mid) < 4, 'walked onto the raft it did not wake and take the raft out: ' + JSON.stringify(w));
  for (const [h, o] of Object.entries(r.heroes)) {
    ok(o.jump.keyHits > 0 && o.jump.angle === 'high', h + ': a real jump attack did not land whole on the dangling lure: ' + JSON.stringify(o.jump));
    ok(o.plain.clank > 0 && o.plain.keyHits === 0 && !o.plain.open, h + ': a plain standing swing did not clank on the lure: ' + JSON.stringify(o.plain));
    ok(o.sweep.keyHits > 0 && o.sweep.angle === 'low', h + ': a real low sweep did not land whole on its gums at the rail: ' + JSON.stringify(o.sweep));
    ok(o.plainJaws.clank > 0 && o.plainJaws.keyHits === 0, h + ': a plain standing swing did not clank on its gums: ' + JSON.stringify(o.plainJaws)); }
  ok(r.lamp.hit >= 1 && r.lamp.took === 0, 'the real lamp struck was not told, or it hurt the beast: ' + JSON.stringify(r.lamp));
  ok(r.lantern.afterOne === false && r.lantern.afterTwo === true, 'phase three: a real swing at the lantern did not dim it, and another raise it: ' + JSON.stringify(r.lantern));
  ok(r.open.dmg >= 5 && r.open.open, 'snagged open, a real swing did not bite: ' + JSON.stringify(r.open));
  ok(r.fall.bit > 0 && r.fall.back && r.fall.x >= r.fall.raft[0] && r.fall.x <= r.fall.raft[1], 'a fall into its water was not bitten and handed back onto the raft: ' + JSON.stringify(r.fall));
  ok(!r.death.alive && !r.death.active && Math.abs(r.death.raftX - r.death.moorE) < 4, 'its death did not end the fight and send the raft to the east landing: ' + JSON.stringify(r.death));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }
}

if (bad.length) { console.log('LANTERN-EATER: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  lantern-eater  its four blows told and fired, one new blow a phase and one windup at a time, its keys (the lure HIGH, its gums LOW, the wrong height named), the read (a swaying lure, a flickering lamp, opposite ends, the gulp under the lure), its keyed part in reach every cycle, the openings from fighting it (snagged, the snap stepped out of: 3 s, its share), left alone it never opens and after each it is warded, the lamps snuffed and the lantern dimmed and raised, fiercer each phase, a human bot, the stage foreshadowed' + (process.argv.includes('--pure') ? ' (pure only)' : ', and in the page for every hero'));
