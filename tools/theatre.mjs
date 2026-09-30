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
  // FEWER, BETTER: placed by hand, every foe in a named encounter
  ok(foes.every(e => typeof e.squad === 'string' || e.t === 'bat' || e.t === 'spider'), 'a foe stands in no named encounter: ' + foes.filter(e => !e.squad && e.t !== 'bat' && e.t !== 'spider').map(e => e.t + '@' + e.x).join(' '));
  ok(!L.ents.some(e => e.garrison), 'sprinkled garrison stands in the theatre');
  ok(L.ents.filter(e => e.t === 'drunk').every(e => e.footlights && D.spots.some(s => Math.abs(s.x - (e.x * TS + 8)) < 400)), 'a drunk in a box is not the audience (footlights) or has no lamp to see by');
  // CHECKPOINTS (Daniel: fewer), the silvers, THE PUPPETEER's room
  const ck = L.ents.filter(e => e.t === 'check'); ok(ck.length === 3, 'the theatre has ' + ck.length + ' checkpoints, not three');
  ok(L.ents.filter(e => e.t === 'silver').length === 3, 'the theatre does not carry the campaign\'s three silvers');
  const M = L.mainStage; ok(M && M.door > 0 && M.x1 - M.x0 >= 30 && ck.some(e => e.x < M.door && e.x >= M.door - 10) && L.ents.some(e => e.t === 'gate' && e.x > M.door), 'THE MAIN STAGE (the Puppeteer\'s room: a door, a checkpoint before it, a room and a gate) is not there: ' + JSON.stringify(M));
  ok(!L.ents.some(e => ['npc', 'stray', 'captive', 'folk'].includes(e.t)), 'an NPC or stray stands in the theatre');
}

// ---------------- THE PAGE ----------------
if (!NOPAGE && lv) {
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false, fonts: false });
  try {
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, out = {};
      BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); const fi = LEVELS.findIndex(l => l.id === 'theatre');
      const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(2); };
      const TH = () => BK.theatre(), P = BK.P;
      // 1. THE LAMP HOLDS IT: the mummer at 60 stands in the first lamp's light with the hero's back to it for three seconds
      fresh(); BK.enemies().filter(e => e.t === 'mummer' && e.x < 50 * TS).forEach(e => e.alive = false);
      const m = BK.enemies().find(e => e.t === 'mummer' && Math.abs(e.x - (60 * TS + 8)) < 20); BK.tp(50, 33); P.face = -1; const x0 = m.x;
      for (let i = 0; i < 180; i++) { P.face = -1; BK.sim(1); } out.held = Math.abs(m.x - x0);
      TH().spots[0].i = 1; TH().spots[0].from = 1; TH().spots[0].k = 1; for (let i = 0; i < 180; i++) { P.face = -1; BK.sim(1); } out.freed = Math.abs(m.x - x0);
      // 2. A ROPE-LOCK: strike line A's lock from batten A, and it flies out
      fresh(); BK.tp(133, 32); BK.sim(10); P.face = 1; BK.press('atk'); BK.sim(12); out.lineA = TH().lines.find(l => l.id === 'A').out; BK.sim(150);
      out.battenA = Math.round(BK.movers().find(q => q.line === 'A' && q.role === 'batten').y / TS); out.rideA = Math.round(P.y / TS);
      // 3. THE SANDBAG LANDS: line D flown, and its bag comes down on the mummer waiting under it
      fresh(); BK.tp(150, 15); const u = BK.enemies().find(e => e.t === 'mummer' && Math.abs(e.x - (160 * TS + 8)) < 24); const hp0 = u ? u.hp : -1;
      TH().lines.find(l => l.id === 'D').out = true; for (let i = 0; i < 150; i++) { P.face = 1; BK.sim(1); } out.bag = [hp0, u ? (u.alive ? u.hp : 0) : -1];
      // 4. A WINCH: the dock's ground row slides to its far end, in the grid
      fresh(); BK.tp(111, 33); BK.sim(10); P.face = 1; BK.press('atk'); BK.sim(90); const f0 = TH().flats[0]; out.flat = [f0.at, f0.b, BK.L.grid[33 * BK.L.W + f0.b], BK.L.grid[33 * BK.L.W + f0.a]];
      // 5. THE SHOW: the curtain goes up on the stage; the traps drop on their cues; the audience throws only at a lit hero
      fresh(); BK.tp(214, 33); BK.sim(30); out.show = TH().show.on; let dropped = false;
      for (let i = 0; i < 900 && !dropped; i++) { BK.sim(1); dropped = TH().traps.some(t => t.state === 'open' && BK.L.grid[t.row * BK.L.W + t.x0] === 0); } out.trap = dropped;
      fresh(); for (const s of TH().spots) { s.off = true; s.show = false; } BK.enemies().filter(e => e.t === 'mummer').forEach(e => e.alive = false);
      const dr = BK.enemies().find(e => e.t === 'drunk' && e.x > 215 * TS && e.x < 222 * TS); BK.tp(206, 33); let dark = 0;
      for (let i = 0; i < 400; i++) { BK.sim(1); if (dr.mode === 'lobTell' || dr.mode === 'bottleTell') dark++; }
      const s1 = TH().spots[5]; s1.off = false; s1.aims = [[P.x, 34 * TS]]; s1.i = 0; s1.from = 0; s1.k = 1; s1.cue = 0; let lit = 0;
      for (let i = 0; i < 600; i++) { BK.sim(1); if (dr.mode === 'lobTell' || dr.mode === 'bottleTell') lit++; } out.audience = [dark, lit];
      // 6. THE STAR TRAP: stand on the spring, hold jump, and it throws you up through the stage floor
      fresh(); BK.tp(226, 38); BK.sim(20); BK.keys.right = true; BK.keys.jump = true; BK.press('jump'); let top = 1e9;
      for (let i = 0; i < 150; i++) { BK.sim(1); if (P.x > 229 * TS) BK.keys.right = false; top = Math.min(top, P.y); } BK.keys.jump = false; out.star = Math.round(top);
      return out; })()`, 600000);
    ok(r.held < 1, 'a mummer in a lamp\'s light moved with the hero\'s back to it (' + r.held.toFixed(1) + ' px)');
    ok(r.freed > 16, 'a mummer out of the light did not creep when nobody looked (' + r.freed.toFixed(1) + ' px): the lamp is not what held it');
    ok(r.lineA === true && r.battenA === 25 && r.rideA <= 25, 'a struck rope-lock did not fly batten A out with the hero on it: ' + JSON.stringify([r.lineA, r.battenA, r.rideA]));
    ok(r.bag[0] > 0 && r.bag[1] < r.bag[0], 'line D\'s sandbag did not land on the mummer under it: ' + JSON.stringify(r.bag));
    ok(r.flat[0] === r.flat[1] && r.flat[2] === 1 && r.flat[3] === 0, 'the winch did not slide the ground row along its track in the grid: ' + JSON.stringify(r.flat));
    ok(r.show && r.trap, 'the curtain did not go up on the stage, or no stage trap dropped on its cue');
    ok(r.audience[0] === 0 && r.audience[1] > 0, 'the audience threw at a hero in the dark, or not at one in the light (dark ' + r.audience[0] + ', lit ' + r.audience[1] + ')');
    ok(r.star < 34 * TS - 8, 'the star trap does not throw a hero up through the stage floor (top ' + r.star + ' px, the floor is ' + 34 * TS + ')');
    if (pg.errors.length) fails.push('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
if (fails.length) { console.log('theatre: ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('ok  theatre  the rig (lamps, lines, flats, traps, cues) holds; the level sits between Waymeet and the fair with its own track, reaches five floors, teaches, develops, twists and examines all three machines, pre-teaches the facing rule, keeps three checkpoints and leaves the Puppeteer his room' + (NOPAGE ? ' (page skipped)' : '; and in the page the lamp holds a mummer, a lock flies a batten, the sandbag lands, the winch slides a flat, the curtain rises, the traps drop, the audience throws only at the lit, the star trap throws you through the stage'));
