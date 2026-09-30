// tools/theatre.mjs - THE MASKWRIGHT'S THEATRE (claude/theatre, the greybox). docs/briefs/maskwright-theatre.md.
//   PURE (src/theatre-rig.js, no page): the limelight's pool and its beam (scenery between blocks it), a struck lamp swings, a cued lamp keeps its
//     cues only while the show runs and comes off them when struck; a fly line's batten and sandbag go opposite ways and stop at their stops, and a
//     sandbag coming down lands on what is under it; a flat steps a column at a time and waits while its way is not clear; the stage traps and the
//     cued flat keep their timing, and both are told before they move.
//   THE LEVEL (src/maskwright-theatre.js, wired in src/level.js, the map in src/main.js): between WAYMEET and THE HARVEST FAIR on the road and on the
//     map, its own track, its brief; five floors the route reaches; every machine TAUGHT, DEVELOPED, TWISTED and EXAMINED where the level says;
//     the facing rule PRE-TAUGHT (the first foe is one masked player alone, with the rule on a sign); three checkpoints; placed by hand, every foe
//     in a named encounter; the audience has a lamp to see by; THE PUPPETEER's room and door left for claude/puppeteer.
//   THE PAGE: a mummer in a lamp's light does not move with every back turned; struck out of the light, it does; a rope-lock flies its batten
//     and the sandbag lands on a foe; a winch slides its flat in the grid; the curtain goes up when a hero reaches the stage and the traps drop on
//     their cues; the audience throws only at a lit hero; the star trap throws a hero up through the stage.
// usage: node tools/theatre.mjs [--no-page]
import { readFileSync, existsSync } from 'node:fs';
import * as R from '../src/theatre-rig.js';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { HOUSE } from '../src/maskwright-theatre.js';   /* THEATRE2: the house was grown in at the front; backstage columns below are written as X(backstage column) */
const X = x => x + HOUSE;
import { MARK } from '../src/marks.js';
const NOPAGE = process.argv.includes('--no-page');
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const TS = 16, DT = 1 / 60;

// ---------------- PURE ----------------
{ const s = R.newSpot({ x: 100, y: 40, aims: [[200, 200], [60, 200]], r: 30 });
  ok(R.inPool(R.poolOf(s), 205, 200) && !R.inPool(R.poolOf(s), 250, 200) && !R.inPool(R.poolOf(s), 205, 120), 'a lamp\'s pool does not cover its floor, or covers too much');
  const open = () => false, wall = (x, y) => x > 140 && x < 150 && y > 100;
  ok(R.beamClear(s, open) && !R.beamClear(s, wall), 'scenery between a lamp and its pool does not darken it');
  ok(!!R.litBy([s], 200, 200, open) && !R.litBy([s], 200, 200, wall), 'litBy disagrees with the beam');
  R.strikeSpot(s); for (let i = 0; i < 60; i++) R.spotStep(s, DT, false);
  ok(s.i === 1 && Math.abs(R.poolOf(s).x - 60) < 1, 'a struck lamp does not swing to its next aim');
  const c = R.newSpot({ x: 0, y: 0, aims: [[10, 0], [20, 0], [30, 0]], r: 10, cue: 1 });
  for (let i = 0; i < 180; i++) R.spotStep(c, DT, false); ok(c.i === 0, 'a cued lamp moved before the show');
  for (let i = 0; i < 125; i++) R.spotStep(c, DT, true); ok(c.i === 2, 'a cued lamp does not keep its cue (on ' + c.i + ')');
  R.strikeSpot(c); const i0 = c.i; for (let i = 0; i < 300; i++) R.spotStep(c, DT, true); ok(c.held && c.i === i0, 'a struck cued lamp does not come off its cue'); }
{ const bat = { role: 'batten', x: 0, w: 48, y: 500, yIn: 500, yOut: 300 }, bag = { role: 'bag', x: 100, w: 32, y: 200, yIn: 200, yOut: 480 };
  for (let i = 0; i < 400; i++) { R.flyStep(bat, true, DT); R.flyStep(bag, true, DT); }
  ok(bat.y === 300 && bag.y === 480, 'a flown line does not take its batten up and its sandbag down to their stops (' + bat.y + ', ' + bag.y + ')');
  for (let i = 0; i < 400; i++) { R.flyStep(bat, false, DT); R.flyStep(bag, false, DT); } ok(bat.y === 500 && bag.y === 200, 'a line struck back does not come back in');
  const foe = { l: 104, r: 116, t: 470, b: 494 }; ok(R.bagLands({ x: 100, w: 32, y: 460 }, foe, 3) && !R.bagLands({ x: 100, w: 32, y: 460 }, foe, 0) && !R.bagLands({ x: 200, w: 32, y: 460 }, foe, 3), 'a sandbag coming down does not land on what is under it (or lands on what is not)'); }
{ const f = { axis: 'x', a: 10, b: 14, w: 2, y0: 5, y1: 6, at: 10, to: 14 };
  let n = 0; while (f.at !== 14 && n++ < 500) R.flatStep(f, DT, () => true);
  ok(f.at === 14 && Math.abs(n * DT - 4 * R.RIG.flatStep) < 0.1, 'a flat does not step a column every ' + R.RIG.flatStep + ' s (' + (n * DT).toFixed(2) + ' s for four)');
  f.to = 10; for (let i = 0; i < 100; i++) R.flatStep(f, DT, () => false); ok(f.at === 14, 'a flat moved into a way that was not clear');
  ok(R.flatCells(f, 14).length === 4 && R.flatCells({ axis: 'y', x0: 3, w: 2, h: 3 }, 7).length === 6, 'flatCells miscounts'); }
{ ok(R.actAt(0) === 1 && R.actAt(R.ACT.len + 1) === 2 && R.actAt(3 * R.ACT.len) === 3 && R.actBell(R.ACT.len - 0.5) === 2 && R.actBell(1) === 0 && R.curtainFall(R.ACT.len) === 0 && Math.abs(R.curtainFall(2 * R.ACT.len + R.ACT.fall / 2) - 0.5) < 1e-9, 'the acts do not keep time (a bell before each, the curtain down over act three)');
  const c = { every: 2, max: 2, t: 0 }; let n = 0; for (let i = 0; i < 600; i++) if (R.chorusStep(c, 1 / 60, true, 0, false)) n++; let m = 0; for (let i = 0; i < 600; i++) if (R.chorusStep(c, 1 / 60, true, 0, true)) m++;
  ok(n >= 4 && m === 0, 'the chorus does not keep coming, or comes through a doorway somebody is standing in (' + n + ', ' + m + ')'); }
{ const tr = { cue: { period: 6, open: 1.6, at: 0 } };
  ok(R.trapPhase(tr, 0.5) === 'open' && R.trapPhase(tr, 3) === 'shut' && R.trapPhase(tr, 5.5) === 'warn' && R.trapPhase({}, 1) === 'shut', 'a stage trap is not open, shut and told (warn) on its cue');
  const f = { cue: { period: 7, hold: 3.5, at: 1 } }; ok(R.flatCue(f, 2).posB && !R.flatCue(f, 5).posB && R.flatCue(f, 7.5).warn, 'the cued flat does not change on its cue with a warning'); }

// ---------------- THE LEVEL ----------------
const lv = LEVELS.find(l => l.id === 'theatre'), fair = LEVELS.find(l => l.id === 'fair');
ok(!!lv, 'there is no level with id "theatre"');
let L = null;
if (lv) {
  L = lv.build(); const D = L.theatre, A = D.arcs;
  ok(lv.needs === 'waymeet' && fair && fair.needs === 'theatre', 'the road does not run WAYMEET -> the theatre -> THE HARVEST FAIR (theatre needs ' + lv.needs + ', fair needs ' + (fair && fair.needs) + ')');
  ok(/MASKWRIGHT/.test(lv.name) && /LIGHT/.test(lv.rule || ''), 'the level is not named, or its rule does not say the light');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), nodes = src.slice(src.indexOf('const INLAND_NODES'), src.indexOf('const INLAND_PATH'));
  const ids = [...nodes.matchAll(/id: '([a-z]+)', kind: 'level'/g)].map(m => m[1]);
  ok(ids.indexOf('theatre') === ids.indexOf('waymeet') + 1 && ids.indexOf('fair') === ids.indexOf('theatre') + 1, 'the map does not run Waymeet, the theatre, the fair: ' + ids.join(','));
  ok(L.music === 'theatre' && existsSync(new URL('../audio/theatre.ogg', import.meta.url)), 'the theatre does not play its own track (audio/theatre.ogg)');
  ok(existsSync(new URL('../docs/briefs/maskwright-theatre.md', import.meta.url)), 'the brief (docs/briefs/maskwright-theatre.md) is not committed');
  // FIVE FLOORS, and the route reaches every one of them
  const RF = floodReach(L, T, { rides: true }), rows = new Set([...RF.seen].map(k => +k.split(',')[1]));
  for (const [n, r] of [['the grid', 7], ['the fly floor', 15], ['the boxes', 24], ['the stage', 33], ['the under-stage', 43]]) ok(rows.has(r), n + ' (row ' + r + ') is not reached');
  // EVERY MACHINE, TAUGHT, DEVELOPED, TWISTED, EXAMINED where the level says
  const inn = ([a, b], x) => x >= a && x <= b;
  const at = { spot: D.spots.map(s => Math.floor(s.x / TS)).concat(D.spots.flatMap(s => s.aims.map(q => Math.floor(q[0] / TS)))),
    fly: L.moversExtra.filter(m => m.kind === 'fly').map(m => Math.floor(m.x / TS)).concat(L.ents.filter(e => e.t === 'flylock' && e.line).map(e => e.x)),
    flat: D.flats.flatMap(f => f.axis === 'y' ? [f.x0] : [f.a, f.b]) };
  for (const m of ['spot', 'fly', 'flat']) for (const beat of ['teach', 'develop', 'twist', 'exam']) ok(A[m] && A[m][beat] && at[m].some(x => inn(A[m][beat], x)), 'the ' + m + ' is not ' + beat.toUpperCase() + ' in its columns ' + JSON.stringify(A[m] && A[m][beat]));
  ok(D.spots.some(s => s.cue) && D.flats.some(f => f.cue) && D.traps.some(t => t.cue), 'the performance has no cued lamp, flat or trap');
  // THE FACING RULE, PRE-TAUGHT for the fair: the first foe is ONE mummer, alone in its stretch, and a sign says the rule
  const FOES = new Set(['mummer', 'drunk', 'swornsword', 'bat', 'spider']);
  const foes = L.ents.filter(e => FOES.has(e.t)).sort((a, b) => a.x - b.x);
  ok(foes[0] && foes[0].t === 'mummer' && inn(A.facing.teach, foes[0].x) && foes.filter(e => inn(A.facing.teach, e.x)).length === 1, 'the first foe is not one masked player alone in the stage door (' + (foes[0] && foes[0].t + '@' + foes[0].x) + ')');
  ok(L.ents.some(e => e.t === 'sign' && inn(A.facing.teach, e.x) && /FACE ONE AND IT STOPS/.test(e.text)), 'no sign in the stage door says the facing rule');
  ok(L.ents.some(e => e.t === 'sign' && inn(A.spot.teach, e.x) && /LIGHT IS SEEN/.test(e.text)), 'no sign teaches the limelight where it is taught');
  // ---- THEATRE2 (the review): the opening is not a corridor; the lamp is a LOCK twice; the exam combines; the show can be reached; no sign spoils a twist ----
  { const route = RF, onRow = r => [...RF.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= X(34) && x <= X(88) && y === r; });
    ok(onRow(24) && L.ents.some(e => e.t === 'sign') && !L.ents.some(e => FOES.has(e.t) && e.x >= X(60) && e.x <= X(64) && e.y === 33), 'the dressing rooms (row 24 over 34-88) are not reached');
    const g0 = L.grid, at = (x, y) => g0[y * L.W + x];
    ok([...Array(5).keys()].every(k => at(X(60) + k, 33) === T.SOLID) && at(X(58), 30) === 9, 'the costume store does not end at the racks with a rope up through the hatch (the climb you MUST take)');
    const ch = D.choruses || []; ok(ch.length >= 1 && ch.every(c => D.spots.some(s => s.aims.some(a => Math.abs(a[0] - (c.x * TS + 8)) < 20 && Math.abs(a[1] - (c.y + 1) * TS) < 20))), 'LOCK ONE: no wardrobe chorus with a lamp that can be swung onto its doorway');
    const pin = D.spots.find(s => s.aims.length >= 3 && foes.filter(e => e.t === 'mummer' && s.aims.some(a => Math.abs(a[0] - (e.x * TS + 8)) < 20 && Math.abs(a[1] - (e.y + 1) * TS) < 20)).length >= 2 && foes.filter(e => e.t === 'mummer' && Math.abs(e.x * TS + 8 - s.x) < 7 * TS).some(e => e.x * TS + 8 < s.x) && foes.filter(e => e.t === 'mummer' && Math.abs(e.x * TS + 8 - s.x) < 7 * TS).some(e => e.x * TS + 8 > s.x));
    ok(!!pin, 'LOCK TWO: no drop between two players, one either side, under a lamp that can be swung onto either before you go down');
    // THE EXAM COMBINES: the wing flat decides which of the follow spot's aims is clear
    const wf = D.flats.find(f => /wing flat/.test(f.name)), fs2 = D.spots.find(s => s.always);
    if (wf && fs2) { const grid = pos => { const g = new Uint8Array(L.grid); for (const [x, y, t] of wf.base) g[y * L.W + x] = t; for (let y = wf.y0; y <= wf.y1; y++) for (let x = pos; x < pos + wf.w; x++) g[y * L.W + x] = T.SOLID; return (px, py) => g[Math.floor(py / TS) * L.W + Math.floor(px / TS)] === T.SOLID; };
      const clearAt = (pos, i) => R.beamClear({ ...fs2, i, from: i, k: 1 }, grid(pos));
      ok(!clearAt(wf.a, 0) && clearAt(wf.b, 0) && clearAt(wf.a, 1), 'THE EXAM: the wing flat does not decide the follow spot (shut, it should shadow the winch spot; open, light it; the batten foot always lit)'); }
    else ok(false, 'THE EXAM: no wing flat or no always-running follow spot');
    ok(L.ents.some(e => e.t === 'drunk' && e.footlights && e.x > X(225) && e.x < X(250)), 'THE EXAM: no audience over the far wing');
    // THE DOOR GUARD IS LURED, not crushed by riding: no sandbag falls where he stands, and a sandbag near him has a lock of its own
    const el = L.ents.find(e => e.elite), bags = L.moversExtra.filter(m => m.kind === 'fly' && m.role === 'bag');
    ok(el && !bags.some(m => el.x * TS + 8 > m.x - 4 && el.x * TS + 8 < m.x + m.w + 4) && bags.some(m => Math.abs(m.x - el.x * TS) < 8 * TS && L.moversExtra.filter(q => q.line === m.line).length === 1), 'THE DOOR GUARD stands under a sandbag, or has no sandbag of its own to be lured under');
    // THE SHOW CAN BE REACHED: both boxes on foot, a prompt desk
    ok([[X(158), X(162)], [X(216), X(221)]].every(([a, b]) => [...RF.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= a && x <= b && y === 24; })) && L.ents.some(e => e.t === 'cuelever'), 'a box cannot be reached on foot, or there is no prompt desk');
    // THE SUMP'S FLAT RUNS ON A CUE (no winch) with an understudy on it
    const sf = D.flats.find(f => /floor flat/.test(f.name)); ok(sf && sf.cue && sf.cue.always && !sf.winch && foes.some(e => e.t === 'mummer' && e.y === 43 && e.x >= sf.b && e.x < sf.b + sf.w), 'the sump\'s floor flat is not on a cue of its own with an understudy standing on it');
    // NO SIGN SPOILS A TWIST
    const spoil = L.ents.filter(e => e.t === 'sign' && /RIDE THE WEIGHT|TRAP AT STAGE LEFT|BATTEN IS A BRIDGE|FLOWN OUT|ON A TRACK|ALL OF IT/.test(e.text)); ok(!spoil.length, 'a sign spoils a twist: ' + spoil.map(e => e.text).join(' | ')); }
  // ---- THEATRE2 UPGRADES (Daniel's picks) ----
  { const seen = (x0, x1, y) => [...RF.seen].some(k => { const [x, yy] = k.split(',').map(Number); return x >= x0 && x <= x1 && yy === y; });
    const at = (x, y) => L.grid[y * L.W + x];
    // A. THE HOUSE: vertical - the dress circle, raked stalls, the pit and its drum, the apron - and the chandelier
    const tops = new Set(); for (let x = 19; x <= 46; x++) { let y = 0; while (y < L.H && at(x, y) !== T.SOLID || y < 26) y++; tops.add(y); }
    ok(D.sections[0][0] === 'THE HOUSE' && seen(18, 38, 23) && seen(47, 56, 41) && seen(57, 71, 33) && tops.size >= 5 && L.grid.some((t, i) => t === T.BOUNCER && i % L.W >= 47 && i % L.W <= 56), 'THE HOUSE is not the dress circle over raked stalls, a pit with its drum, and the apron (' + tops.size + ' stall heights)');
    ok(L.moversExtra.some(m => m.chandelier) && L.ents.some(e => e.t === 'flylock' && e.line === 'CH' && e.x < HOUSE), 'THE HOUSE has no chandelier on a line with its lock');
    // C. THE STAGEHAND (the one new foe), and THE MIRROR ROOM
    const sh = L.ents.filter(e => e.t === 'stagehand'); ok(sh.length >= 2 && sh.length <= 4 && sh.every(e => e.squad), 'there are ' + sh.length + ' stagehands, not 2-4 in named encounters');
    ok(MARK['stagehand|swingTell'] === '!!' && MARK['stagehand|dropTell'] === '!!', 'the stagehand\'s tells are not in the mark table (node tools/tells.mjs --write)');
    ok((D.mirrors || []).some(m => foes.some(e => e.t === 'mummer' && e.x >= m.x0 && e.x <= m.x1 && e.y === m.y)) && L.ents.some(e => e.t === 'sign' && /MIRROR/.test(e.text)), 'no mirror room with a player in it and its sign');
    // B. THE ACTS: a cloth that flies in, a flat that becomes a wall, a way off that opens in act three; D. THE GLIMPSE
    ok(D.flats.some(f => f.acts && f.acts[2] === 'B' && /cloth/.test(f.name)) && D.flats.some(f => f.acts && f.acts[2] === 'A' && f.acts[3] === 'B') && D.traps.some(t => t.act3open) && D.glimpse && (D.boxes || []).length === 2, 'the performance is not in acts (a cloth for act two, the scene flat a wall then open, the way off open in act three), or there is no glimpse');
    ok(foes.filter(e => e.t === 'mummer').length <= 17, 'too many mummers (' + foes.filter(e => e.t === 'mummer').length + '): the stagehands were to bring the count down'); }
  // FEWER, BETTER: placed by hand, every foe in a named encounter
  ok(foes.every(e => typeof e.squad === 'string' || e.t === 'bat' || e.t === 'spider'), 'a foe stands in no named encounter: ' + foes.filter(e => !e.squad && e.t !== 'bat' && e.t !== 'spider').map(e => e.t + '@' + e.x).join(' '));
  ok(!L.ents.some(e => e.garrison), 'sprinkled garrison stands in the theatre');
  ok(L.ents.filter(e => e.t === 'drunk').every(e => e.footlights && D.spots.some(s => Math.abs(s.x - (e.x * TS + 8)) < 400)), 'a drunk in a box is not the audience (footlights) or has no lamp to see by');
  // CHECKPOINTS (Daniel: fewer), the silvers, THE PUPPETEER's room
  const ck = L.ents.filter(e => e.t === 'check'); ok(ck.length === 4 && !ck.some(e => e.filled), 'the theatre has ' + ck.length + ' checkpoints, not the four it places (THEATRE2: the house made the route 520 tiles; the 175-tile rule needs four)');
  ok(L.ents.filter(e => e.t === 'silver').length === 3, 'the theatre does not carry the campaign\'s three silvers');
  const M = L.mainStage; ok(M && M.door > 0 && M.x1 - M.x0 >= 30 && ck.some(e => e.x < M.door && e.x >= M.door - 10) && L.ents.some(e => e.t === 'gate' && e.x > M.door), 'THE MAIN STAGE (the Puppeteer\'s room: a door, a checkpoint before it, a room and a gate) is not there: ' + JSON.stringify(M));
  ok(!L.ents.some(e => ['npc', 'stray', 'captive', 'folk'].includes(e.t)), 'an NPC or stray stands in the theatre');
}

// ---------------- THE PAGE ----------------
if (!NOPAGE && lv) {
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false, fonts: false });
  try {
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, out = {}, HX = ${HOUSE};
      BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); const fi = LEVELS.findIndex(l => l.id === 'theatre');
      const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(2); };
      const TH = () => BK.theatre(), P = BK.P;
      // 1. THE LAMP HOLDS IT: the mummer at 54 stands in the first lamp's light with the hero's back to it for three seconds
      fresh(); BK.enemies().filter(e => e.t === 'mummer' && e.x < (40 + HX) * TS || e.t === 'bat').forEach(e => e.alive = false);
      const m = BK.enemies().find(e => e.t === 'mummer' && Math.abs(e.x - ((54 + HX) * TS + 8)) < 20); BK.tp(46 + HX, 33); P.face = -1; const x0 = m.x;
      for (let i = 0; i < 180; i++) { P.face = -1; BK.sim(1); } out.held = Math.abs(m.x - x0);
      TH().spots[0].i = 1; TH().spots[0].from = 1; TH().spots[0].k = 1; for (let i = 0; i < 180; i++) { P.face = -1; BK.sim(1); } out.freed = Math.abs(m.x - x0);
      // 2. A ROPE-LOCK: strike line A's lock from batten A, and it flies out
      fresh(); BK.tp(133 + HX, 32); BK.sim(10); P.face = 1; BK.press('atk'); BK.sim(12); out.lineA = TH().lines.find(l => l.id === 'A').out; BK.sim(150);
      out.battenA = Math.round(BK.movers().find(q => q.line === 'A' && q.role === 'batten').y / TS); out.rideA = Math.round(P.y / TS);
      // 3. THE SANDBAG LANDS: line D flown, and its bag comes down on the mummer waiting under it
      fresh(); BK.tp(150 + HX, 15); const u = BK.enemies().find(e => e.t === 'mummer' && Math.abs(e.x - ((160 + HX) * TS + 8)) < 24); const hp0 = u ? u.hp : -1;
      TH().lines.find(l => l.id === 'D').out = true; for (let i = 0; i < 150; i++) { P.face = 1; BK.sim(1); } out.bag = [hp0, u ? (u.alive ? u.hp : 0) : -1];
      // 4. A WINCH: the dock's ground row slides to its far end, in the grid
      fresh(); BK.tp(111 + HX, 33); BK.sim(10); P.face = 1; BK.press('atk'); BK.sim(90); const f0 = TH().flats.find(f => /ground row/.test(f.name)); out.flat = [f0.at, f0.b, BK.L.grid[33 * BK.L.W + f0.b], BK.L.grid[33 * BK.L.W + f0.a]];
      // 5. THE SHOW: the curtain goes up on the stage; the traps drop on their cues; the audience throws only at a lit hero
      fresh(); BK.tp(214 + HX, 33); BK.sim(30); out.show = TH().show.on; let dropped = false;
      for (let i = 0; i < 900 && !dropped; i++) { BK.sim(1); dropped = TH().traps.some(t => t.state === 'open' && BK.L.grid[t.row * BK.L.W + t.x0] === 0); } out.trap = dropped;
      fresh(); for (const s of TH().spots) { s.off = true; s.show = false; } BK.enemies().filter(e => e.t === 'mummer').forEach(e => e.alive = false);
      const dr = BK.enemies().find(e => e.t === 'drunk' && e.x > (215 + HX) * TS && e.x < (222 + HX) * TS); BK.tp(206 + HX, 33); let dark = 0;
      for (let i = 0; i < 400; i++) { BK.sim(1); if (dr.mode === 'lobTell' || dr.mode === 'bottleTell') dark++; }
      const s1 = TH().spots.find(s => Math.abs(s.x - ((216 + HX) * TS + 8)) < 4); s1.off = false; s1.aims = [[P.x, 34 * TS]]; s1.i = 0; s1.from = 0; s1.k = 1; s1.cue = 0; let lit = 0;
      for (let i = 0; i < 600; i++) { BK.sim(1); if (dr.mode === 'lobTell' || dr.mode === 'bottleTell') lit++; } out.audience = [dark, lit];
      // 6. THE STAR TRAP: stand on the spring, hold jump, and it throws you up through the stage floor
      fresh(); BK.tp(226 + HX, 38); BK.sim(20); BK.keys.right = true; BK.keys.jump = true; BK.press('jump'); let top = 1e9;
      for (let i = 0; i < 150; i++) { BK.sim(1); if (P.x > (229 + HX) * TS) BK.keys.right = false; top = Math.min(top, P.y); } BK.keys.jump = false; out.star = Math.round(top);
      // 7. LOCK ONE, THE CHORUS: past the wardrobe they keep coming; the lamp on its doorway plugs it
      fresh(); BK.tp(60 + HX, 24); P.face = 1; let seen = 0; for (let i = 0; i < 600; i++) { P.face = 1; BK.sim(1); } seen = BK.enemies().filter(e => e.alive && e.chorusOf).length;
      BK.enemies().filter(e => e.chorusOf).forEach(e => e.alive = false); const cl = TH().spots.find(s => Math.abs(s.x - ((48 + HX) * TS + 8)) < 4); cl.i = 1; cl.from = 1; cl.k = 1;
      for (let i = 0; i < 900; i++) { P.face = 1; BK.sim(1); } const pl = BK.enemies().filter(e => e.alive && e.chorusOf); out.chorus = [seen, pl.length, pl.length ? Math.round(Math.abs(pl[0].x - ((36 + HX) * TS + 8))) : -1];
      // 8. THE BATS go for a hero in the light and leave one in the dark
      fresh(); for (const s of TH().spots) { s.off = true; s.show = false; } BK.enemies().filter(e => e.t !== 'bat').forEach(e => e.alive = false); BK.tp(100 + HX, 33);
      const bat = BK.enemies().find(e => e.t === 'bat' && Math.abs(e.x - ((100 + HX) * TS + 8)) < 20); let flewDark = 0; for (let i = 0; i < 240; i++) { BK.sim(1); if (bat.mode === 'fly' && bat.tgt && bat.tgt.who === 'P') flewDark++; }
      const b0 = TH().spots.find(s => Math.abs(s.x - ((90 + HX) * TS + 8)) < 4); b0.off = false; b0.aims = [[P.x, 34 * TS]]; b0.i = 0; b0.from = 0; b0.k = 1; bat.cd = 0; let flewLit = 0;
      for (let i = 0; i < 240; i++) { BK.sim(1); if (bat.mode === 'fly' && bat.tgt && bat.tgt.who === 'P') flewLit++; } out.bat = [flewDark, flewLit];
      // 9. THE CHANDELIER: its line struck, it comes down on the stagehand under it
      fresh(); BK.tp(20, 23); const sg = BK.enemies().find(e => e.t === 'stagehand' && Math.abs(e.x - (41 * TS + 8)) < 20); const sh0 = sg ? sg.hp : -1; TH().lines.find(l => l.id === 'CH').out = true; for (let i = 0; i < 320; i++) BK.sim(1); out.chand = [sh0, sg ? (sg.alive ? sg.hp : 0) : -1];
      // 10. THE DRUM: in the pit, hold jump, and it throws you up past the apron's edge
      fresh(); BK.tp(54, 39); BK.sim(20); BK.keys.right = true; BK.keys.jump = true; BK.press('jump'); let dtop = 1e9; for (let i = 0; i < 150; i++) { BK.sim(1); if (P.x > 56 * TS) BK.keys.right = false; dtop = Math.min(dtop, P.y); } BK.keys.jump = false; BK.keys.right = false; out.drum = Math.round(dtop);
      // 11. THE MIRROR ROOM: back turned, the dresser in the mirrors cannot move
      fresh(); BK.enemies().filter(e => e.chorusOf).forEach(e => e.alive = false); const dz = BK.enemies().find(e => e.t === 'mummer' && Math.abs(e.x - ((80 + HX) * TS + 8)) < 20); BK.tp(73 + HX, 24); P.face = -1; const dx0 = dz.x;
      for (let i = 0; i < 180; i++) { P.face = -1; BK.sim(1); } out.mirror = Math.abs(dz.x - dx0);
      // 12. THE STAGEHAND swings on a hero who stands in front of him (no god mode)
      fresh(); BK.god = false; const s2 = BK.enemies().find(e => e.t === 'stagehand' && Math.abs(e.x - (45 * TS + 8)) < 20); BK.tp(43, 35); P.face = 1; const hp1 = P.hp; let told = false; for (let i = 0; i < 360; i++) { BK.sim(1); if (s2.mode === 'swingTell') told = true; } out.hand = [told, hp1 - P.hp]; BK.god = true;
      // 13. THE ACTS: the cloth in act two, the scene flat a wall; act three opens the way off and brings the curtain down; left on the stage, the show starts over
      fresh(); BK.tp(214 + HX, 33); BK.sim(10); const S = TH().show, cloth = TH().flats.find(f => /cloth/.test(f.name)), scene = TH().flats.find(f => /scene change/.test(f.name)), exit = TH().traps.find(t => t.act3open);
      while (S.t < 14 + 3) { P.hp = P.maxHp; BK.sim(10); } out.act2 = [S.act, cloth.at === cloth.b, scene.at === scene.a];
      while (S.t < 28 + 3) { P.hp = P.maxHp; BK.sim(10); } out.act3 = [S.act, scene.at === scene.b, exit.state === 'open', S.fall > 0];
      let reset = false; for (let i = 0; i < 400 && !reset; i++) { P.hp = P.maxHp; BK.sim(10); if (S.t < 5) reset = true; } out.over = reset;
      // 14. THE CHEER: a cast member cut down in the light throws you a flower
      fresh(); BK.tp(200 + HX, 33); BK.sim(10); const cm = BK.enemies().find(e => e.t === 'mummer' && e.cast); const sp = TH().spots.find(s => Math.abs(s.x - ((216 + HX) * TS + 8)) < 4); sp.aims = [[cm.x, 34 * TS]]; sp.i = 0; sp.from = 0; sp.k = 1; sp.cue = 0; sp.off = false;
      BK.sim(5); P.hp = P.maxHp - 20; const hc = P.hp; cm.alive = false; BK.sim(3); out.cheer = P.hp - hc;
      return out; })()`, 600000);
    ok(r.held < 1, 'a mummer in a lamp\'s light moved with the hero\'s back to it (' + r.held.toFixed(1) + ' px)');
    ok(r.freed > 16, 'a mummer out of the light did not creep when nobody looked (' + r.freed.toFixed(1) + ' px): the lamp is not what held it');
    ok(r.lineA === true && r.battenA === 25 && r.rideA <= 25, 'a struck rope-lock did not fly batten A out with the hero on it: ' + JSON.stringify([r.lineA, r.battenA, r.rideA]));
    ok(r.bag[0] > 0 && r.bag[1] < r.bag[0], 'line D\'s sandbag did not land on the mummer under it: ' + JSON.stringify(r.bag));
    ok(r.flat[0] === r.flat[1] && r.flat[2] === 1 && r.flat[3] === 0, 'the winch did not slide the ground row along its track in the grid: ' + JSON.stringify(r.flat));
    ok(r.show && r.trap, 'the curtain did not go up on the stage, or no stage trap dropped on its cue');
    ok(r.audience[0] === 0 && r.audience[1] > 0, 'the audience threw at a hero in the dark, or not at one in the light (dark ' + r.audience[0] + ', lit ' + r.audience[1] + ')');
    ok(r.chorus[0] >= 1 && r.chorus[1] === 1 && r.chorus[2] < 20, 'LOCK ONE: the wardrobe did not keep sending players, or the lamp on its door did not plug it with one (' + JSON.stringify(r.chorus) + ')');
    ok(r.bat[0] === 0 && r.bat[1] > 0, 'the bats went for a hero in the dark, or not for one in the light (' + JSON.stringify(r.bat) + ')');
    ok(r.chand[0] > 0 && r.chand[1] < r.chand[0], 'the chandelier did not come down on the stagehand under it: ' + JSON.stringify(r.chand));
    ok(r.drum < 34 * TS - 8, 'the kettle drum does not throw a hero up past the apron (top ' + r.drum + ')');
    ok(r.mirror < 1, 'the dresser moved in the mirror room with the hero\'s back to it (' + r.mirror + ' px)');
    ok(r.hand[0] && r.hand[1] > 0, 'the stagehand did not tell and land his swing on a hero in front of him: ' + JSON.stringify(r.hand));
    ok(r.act2[0] === 2 && r.act2[1] && r.act2[2] && r.act3[0] === 3 && r.act3[1] && r.act3[2] && r.act3[3] && r.over, 'the acts did not change the stage (act 2 ' + r.act2 + ', act 3 ' + r.act3 + ', start over ' + r.over + ')');
    ok(r.cheer > 0, 'no cheer (a flower) for a kill made in the light: ' + r.cheer);
    ok(r.star < 34 * TS - 8, 'the star trap does not throw a hero up through the stage floor (top ' + r.star + ' px, the floor is ' + 34 * TS + ')');
    if (pg.errors.length) fails.push('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
if (fails.length) { console.log('theatre: ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('ok  theatre  the rig (lamps, lines, flats, traps, cues) holds; the level sits between Waymeet and the fair with its own track, reaches five floors, teaches, develops, twists and examines all three machines, pre-teaches the facing rule in the house, locks two rooms with light, combines the exam, runs the show in acts, keeps four checkpoints and leaves the Puppeteer his room' + (NOPAGE ? ' (page skipped)' : '; and in the page the lamp holds a mummer, a lock flies a batten, the sandbag lands, the winch slides a flat, the curtain rises, the traps drop, the audience throws only at the lit, the star trap throws you through the stage; the chandelier and the drum, the mirror, the stagehand, the acts and the cheer'));
