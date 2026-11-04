// tools/gqueen3.mjs - THE GOBLIN QUEEN 3, THE NODE HALF (claude/gqueen3, scratch/plan-goblinqueen3-1104.md section 8). No page, no browser.
//   LEVEL    the hall has no pillar, no roof rod and no cuttable chandelier; her bell + grate stay; the escape table (L.gqEscape) is laid inside the hall and every tier is within every hero's legs
//            (src/reach-hero.js, as tools/gorm-scaffold-reach.mjs); the hole opens onto the roof walk; the roof has its shrine and her portal; the tower top (L.arenaRoof) is SEALED from the main level;
//            a checkpoint within 14 columns of each arena; every escape ledge anchored.
//   SOURCE   (static, src/main.js + src/gqueen-hands.js) the crown, the shards and the storm are hit through gqHit and never `unblockable` / `pierce`; GREED.chipBy.gqueen >= 0.4; gqOpen names stunned + the roof;
//            every new mode has its MARK / ANSWER / HEIGHT row; the flee full-heals (hp, stamina, flasks); the stun guard is >= 1.0 s; the pillar / plate / chandelier-pin machinery is gone.
//   node tools/gqueen3.mjs        (GQ_ROOT=<checkout> runs it against another checkout: the plan's "prove it RED on master")
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = process.env.GQ_ROOT ? path.resolve(process.env.GQ_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => existsSync(path.join(ROOT, f)) ? readFileSync(path.join(ROOT, f), 'utf8') : '';
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
const TS = 16;
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');   /* code only: a comment may say the word */
const fnBody = (src, name) => { const i = src.search(new RegExp('function ' + name + '\\b')); if (i < 0) return ''; let d = 0, st = false; for (let k = src.indexOf('{', i); k < src.length; k++) { if (src[k] === '{') { d++; st = true; } else if (src[k] === '}') { d--; if (st && d === 0) return src.slice(i, k + 1); } } return ''; };

const { LEVELS, T } = await imp('src/level.js');
const L = LEVELS.find(l => l.id === 'crown').build();
const A = L.arena, W = L.W, at = (x, y) => L.grid[y * W + x];

/* ================= LEVEL ================= */
console.log('== LEVEL');
ok(!L.ents.some(e => e.t === 'qpillar'), 'no cracked pillar (qpillar) in her hall');
ok(!L.ents.some(e => e.t === 'rod'), 'no roof lightning rod (the roof phase is retired)');
ok(!L.ents.some(e => e.t === 'weight' && e.gq && !e.scenery), 'no chandelier weight is hers to cut (every gq chandelier is scenery)');
{ const wn = L.ents.find(e => e.t === 'winch' && e.bossGate && e.bell);
  ok(!!wn && at(wn.gate, wn.gy0) === T.AIR, 'her hall bell + its grate (winch bossGate) stay, the grate up'); }
const E = L.gqEscape;
ok(!!E && Array.isArray(E.tiers) && E.tiers.length >= 5, 'L.gqEscape: five burning tiers T1..T5 (+ T6, the step inside the hole)');
if (E) {
  const x0 = A.wallL + 1, x1 = A.wallR - 1;
  ok(E.tiers.every(t => t.x0 >= x0 && t.x1 <= x1 && t.row >= 9 && t.row <= 17), 'every tier is inside her hall (cols ' + x0 + '-' + x1 + ', rows 9-17; T6 is the step in the hole)');
  ok(E.tiers.filter(t => t.collapse).length === 1, 'exactly one tier collapses (T4)');
  ok(A.hole && A.hole.y1 <= 9 && at(A.hole.x0, A.hole.y0) === T.SOLID, 'the hole is roof stone until the flee opens it (rows 8-9)');
  ok(!!E.check && !!E.start && !!E.portal && E.hallPortals && E.hallPortals.length === 2, 'escapeStart on T1, a roof shrine, her portal, two hall portals');
  ok(E.check && at(E.check.x, E.check.y + 1) === T.SOLID && at(E.check.x, E.check.y) === T.AIR, 'the roof shrine stands on roof stone');
  ok(E.portal && at(E.portal.x, E.portal.y + 1) === T.SOLID && at(E.portal.x, E.portal.y) === T.AIR && E.portal.x > E.check.x, 'her portal stands on the roof walk past the shrine');
  ok(E.supports && E.tiers.every((t, i) => E.supports.filter(s => s.tier === i).length >= 2), 'every escape ledge is anchored (two chains a tier)');
  ok(E.throwers && E.throwers.length === 2 && E.slates && E.slates.x1 - E.slates.x0 >= 3, 'two roof throwers and a stretch of collapsing slates');
  ok(Math.abs(E.check.x - (L.arenaRoof ? L.arenaRoof.wallL : 0)) <= 14, 'the roof shrine is within 14 columns of the tower-top arena');
}
ok(Math.abs((L.START ? 0 : 0)) === 0 && ((L.ents.filter(e => e.t === 'check').map(e => e.x).some(x => Math.abs(x - A.wallL) <= 14))), 'a shrine within 14 columns of her hall');
const RA = L.arenaRoof;
ok(!!RA && RA.boss === 'gqueen' && RA.music === 'gqjudge' && RA.x1 - RA.x0 >= 40 * TS, 'L.arenaRoof: the tower top, 40+ tiles, her judgement music');
if (RA && E) {
  const { floodReach } = await imp('src/reachcore.js'), { HERO_MOVE_IDS } = await imp('src/hero-move.js');
  /* the level as the flee lays it: the tiers, the hole */
  const g2 = new Uint8Array(L.grid);
  for (let y = A.hole.y0; y <= A.hole.y1; y++) for (let x = A.hole.x0; x <= A.hole.x1; x++) g2[y * W + x] = T.AIR;
  for (const t of E.tiers) for (let x = t.x0; x <= t.x1; x++) g2[t.row * W + x] = T.ONEWAY;
  const L2 = { ...L, grid: g2 }, fl = Math.round(A.floor / TS) - 1, start = [A.wallL + 4, fl];
  const marks = [[E.tiers[0].x0 + 1, E.tiers[0].row - 1], ...E.tiers.map(t => [Math.floor((t.x0 + t.x1) / 2), t.row - 1]), [E.check.x, E.check.y], [E.portal.x, E.portal.y]];
  for (const hero of [null, ...HERO_MOVE_IDS]) {
    const R = floodReach(L2, T, { rides: true, hero: hero || undefined, seeds: [start] });
    const miss = marks.filter(m => !R.seen.has(m[0] + ',' + m[1]));
    ok(!miss.length, (hero || 'any hero') + ': the floor reaches every tier, the roof shrine and her portal' + (miss.length ? ' - MISSING ' + miss.map(m => m.join(',')).join(' ') : ''));
  }
  /* SEALED: from the tower top's portal exit nothing walkable leads west of its wall; from the level, nothing leads east of col 609 */
  const R1 = floodReach({ ...L, START: { x: RA.exit.x, y: RA.exit.y } }, T, { rides: true }), west = [...R1.seen].filter(k => +k.split(',')[0] < RA.wallL);
  ok(west.length === 0, 'the tower top is sealed: nothing walkable from its portal exit leads west of col ' + RA.wallL);
  const R2 = floodReach(L2, T, { rides: true, seeds: [start] }), east = [...R2.seen].filter(k => +k.split(',')[0] > E.portal.x + 2);
  ok(east.length === 0, 'the main level never walks onto the tower top (only her portal does)');
}

/* ================= SOURCE ================= */
console.log('== SOURCE');
const main = strip(rd('src/main.js')), hands = rd('src/gqueen-hands.js'), handsCode = strip(hands);
ok(hands.length > 0, 'src/gqueen-hands.js exists');
{ const hit = fnBody(handsCode, 'gqHit');
  ok(hit.includes('ctx.damage(') && !/unblockable|pierce/.test(hit), 'gqHit asks damagePlayer for a yellow, blockable blow (no unblockable, no pierce) and reads the shared parry counter');
  ok(/parries\(\)/.test(hit), 'gqHit reads RP.stats.parries (every hero\'s beat path covers it)');
  for (const f of ['crownStep', 'rockStep', 'stormStep']) { const b = fnBody(handsCode, f);
    ok(b.includes('gqHit(') && !/unblockable|pierce|gqRed\(/.test(b), f + ': hits through gqHit, never unblockable / pierce'); }
  ok(!/ctx\.damage\([^)]*(unblockable|pierce)/.test(fnBody(handsCode, 'gqHit')), 'no parryable blow is flagged red'); }
{ const gr = rd('src/boss-greed.js'), m = /chipBy:\s*\{[^}]*?gqueen:\s*([0-9.]+)/.exec(gr);
  ok(!!m && +m[1] >= 0.4, 'GREED.chipBy.gqueen >= 0.4 (' + (m ? m[1] : 'missing') + ')'); }
{ const g = /const gqOpen = e =>([^\n]*)/.exec(main);
  ok(!!g && /stunned/.test(g[1]) && /roof/.test(g[1]) && /pinned/.test(g[1]), 'gqOpen = pinned || stunned || stage roof'); }
{ const mk = await imp('src/marks.js'), modes = ['crownTossTell', 'portalTell', 'lashHighTell', 'lashLowTell', 'ambushTell', 'geyserTell', 'stormTell'];
  for (const m of modes) { const k = 'gqueen|' + m; ok(!!mk.MARK[k] && mk.ANSWER[k] !== undefined && !!mk.HEIGHT[k], k + ' has its MARK, ANSWER and HEIGHT rows'); }
  ok(mk.QUIET.has('updateGQueen|fleeTell'), 'fleeTell is QUIET (no blow)');
  for (const dead of ['chandTell', 'gLeapTell', 'gDropTell', 'leapTell', 'slateTell', 'shadowTell']) ok(!mk.MARK['gqueen|' + dead] && !mk.HEIGHT['gqueen|' + dead], 'the dead row gqueen|' + dead + ' is gone'); }
{ const sp = ((/H\.spare = [\s\S]*?\n  };/.exec(handsCode) || [''])[0]) + fnBody(handsCode, 'fullHeal');
  ok(/\.hp\s*=\s*[^;]*maxHp/.test(sp) && /\.st\s*=/.test(sp) && /flaskMax/.test(sp), 'the flee FULLY HEALS: hp, stamina and flasks (SV.flaskMax)');
  ok(/persist\s*=/.test(handsCode), 'the escape persists across a death (persist, as King Gorm)'); }
{ const sg = /stunGuard:\s*([0-9.]+)/.exec(hands); ok(!!sg && +sg[1] >= 1.0, 'the stun guard is >= 1.0 s (' + (sg ? sg[1] : 'missing') + ')'); }
for (const f of ['gqPillar', 'drawQPillar', 'gqPillarsStand', 'gqChip', 'gqShatter', 'drawGqPlate', 'gqChandsHang']) ok(!new RegExp('function ' + f).test(main), 'the ' + f + ' machinery is gone from main.js');
ok(!/case 'chandTell'/.test(main) && !/gqPin\(e, pr\.x, 'chandelier'/.test(main), 'the chandelier pin is gone');
ok(/GQH\.hit|makeGQueenHands/.test(main), 'main.js wires GQH (the hands)');
const ck = rd('tools/check.mjs');
ok(!/'queen-court'|'queen-chandelier'/.test(ck) || /superseded/i.test(ck), 'queen-court / queen-chandelier are retired from check.mjs (they assert pillars and a plate)');
ok(/'gqueen3'/.test(ck), 'tools/gqueen3.mjs is registered in check.mjs');


/* ================= HANDS (a fake world: no page) ================= */
console.log('== HANDS (src/gqueen-hands.js in a fake world)');
{
  const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js');
  const make = (opt = {}) => {
    const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W;
    const st = { time: 0, parries: 0, mode: opt.mode || 'hit', dmg: [], called: [], active: true, tiles: [], spawned: [], checkpoint: null };
    const P = { x: 9150, y: 320, hp: 50, maxHp: 100, st: 5, maxSt: 20, flasks: 0, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0 };
    const e = { t: 'gqueen', alive: true, x: 9300, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99 };
    const noop = () => {};
    const ctx = { L: Lw, TS: 16, T, sfx: new Proxy({}, { get: () => noop }), P: () => P, boss: () => e, bossActive: () => st.active, enemies: () => [e], props: () => [], time: () => st.time,
      number: noop, burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop,
      damage: (x, d, o) => { st.dmg.push({ x, d, o: o || {} }); if (st.mode === 'parry') st.parries++; return st.mode === 'hit' ? 'hit' : 'blocked'; }, parries: () => st.parries,
      hurt: (en, d) => { en.hp -= d; if (en.hp <= 0) H.spare(en); }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
      hurtBox: () => ({ l: P.x - 5, r: P.x + 5, t: P.y - (st.ducking ? 8 : 14), b: P.y }),
      endFight: () => { st.active = false; st.called.push('endFight'); }, shutWest: () => st.called.push('shutWest'), layEscape: () => st.called.push('layEscape'), tiles: (r, a, b, how) => st.tiles.push([r, a, how]),
      spawnEnt: o => st.spawned.push(o), setCheckpoint: (x, y) => { st.checkpoint = { x, y }; }, flaskMax: () => 3, music: n => st.called.push('music:' + n), hint: noop, enterRoof: () => { Object.assign(Lw.arena, Lw.arenaRoof); st.called.push('enterRoof'); }, wave: () => st.called.push('wave'), ducking: () => !!st.ducking };
    const H = makeGQueenHands(ctx); H.load(); H.reset();
    /* main.js's own frame: modeT counts down, her mode is asked, the hands update */
    const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; e.modeT -= dt; e.anim += dt; H.tick(e, dt); if (!(H.step(e, dt))) { const w = e.stage === 'roof' ? H.roofStep(e, dt) : H.mode(e, dt); if (w !== undefined) e.vx = 0; } H.update(dt); } };
    return { H, st, P, e, ctx, step, Lw };
  };
  /* 1. a parried crown stuns her: home, then STUNNED 3.5 s and 4% */
  { const w = make({ mode: 'parry' }); w.P.x = 9150; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; w.step(60 * 3);
    ok(w.e.mode === 'stunned' || w.H.read().stuns === 1, 'a PARRIED crown flies home and STUNS her (stuns ' + w.H.read().stuns + ')');
    ok(w.e.hp === 2400 - Math.round(2400 * GQ3.crown.stunHp), 'the stun costs her ' + GQ3.crown.stunHp * 100 + '% (hp ' + w.e.hp + ')');
    const g2 = w.H.test.stun(1, 0); ok(g2 === false, 'no stunlock: a second stun inside the guard is refused'); }
  /* 2. a plain block only knocks it down: she walks to fetch it, never open */
  { const w = make({ mode: 'blocked' }); w.P.x = 9150; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; let fetch = false; for (let i = 0; i < 60 * 4; i++) { w.step(1); if (w.e.mode === 'crownFetch') fetch = true; }
    ok(fetch && w.e.mode !== 'stunned' && w.H.read().stuns === 0, 'a plain BLOCK knocks the crown to the floor and she fetches it (no stun)'); }
  /* 3. ducked, it goes over; jumped, the same */
  { const w = make({ mode: 'hit' }); w.st.ducking = true; w.P.x = 9150; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; w.step(60 * 4);
    ok(w.st.dmg.length === 0 && w.e.mode !== 'crownToss', 'a DUCKED crown (chest height) goes over the hero both ways'); }
  /* 4. a plain hit lands once a pass, 16, yellow */
  { const w = make({ mode: 'hit' }); w.P.x = 9150; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; w.step(60 * 4);
    ok(w.st.dmg.length >= 1 && w.st.dmg.length <= 2 && w.st.dmg.every(d => d.d === GQ3.crown.dmg && !d.o.unblockable && !d.o.pierce), 'the crown hits once a pass for ' + GQ3.crown.dmg + ', yellow (' + w.st.dmg.length + ' hits)'); }
  /* 5. the portal cast: two portals, a fan of three each, one stun a cast, the rest only clank */
  { const w = make({ mode: 'parry' }); w.P.x = 9020; w.e.x = 9300; w.e.mode = 'portalTell'; w.e.modeT = 1.0; let seen = 0; for (let i = 0; i < 60 * 6; i++) { w.step(1); seen = Math.max(seen, w.H.portals().length); }
    ok(seen === 2, 'the P1a cast opens TWO portals (' + seen + ')'); ok(w.H.read().stuns === 1, 'a parried shard stuns her ONCE a cast (' + w.H.read().stuns + ')');
    ok(w.e.hp < 2400 - Math.round(2400 * GQ3.portal.stunHp) + 1 && w.e.hp >= 2400 - Math.round(2400 * 0.2), 'the other parried shards only clank (hp ' + w.e.hp + ')'); }
  { const w = make({ mode: 'hit' }); w.e.phase = 2; w.P.x = 9020; w.e.mode = 'portalTell'; w.e.modeT = 1.0; let seen = 0; for (let i = 0; i < 60 * 3; i++) { w.step(1); seen = Math.max(seen, w.H.portals().length); }
    ok(seen === 3, 'the P1b cast opens THREE portals (' + seen + ')'); ok(w.st.dmg.every(d => d.d === GQ3.portal.dmg && !d.o.unblockable), 'a shard is 10, yellow'); }
  /* 6. the flee: no death, FULL HEAL (hp, stamina, flasks), the fight ends, the hall is laid, escapeStart is the checkpoint */
  { const w = make(); w.e.hp = 0; const r = w.H.spare(w.e);
    ok(r === true && w.e.alive && w.e.hp === GQ3.hp2 && w.e.stage === 'flee', 'a lethal P1 blow is SPARED: she lives, at her phase-two bar (' + w.e.hp + ')');
    ok(w.P.hp === w.P.maxHp && w.P.st === w.P.maxSt && w.P.flasks === 3, 'the flee FULLY HEALS: hp ' + w.P.hp + ', stamina ' + w.P.st + ', flasks ' + w.P.flasks);
    ok(['endFight', 'shutWest', 'layEscape'].every(k => w.st.called.includes(k)), 'the fight ends, the west door stays shut, the hall is laid');
    ok(w.st.checkpoint && w.st.checkpoint.x === w.Lw.gqEscape.start.x * 16 + 8, 'escapeStart (on T1) is the checkpoint');
    w.step(60 * 2); ok(w.e.stage === 'escape' && w.e.hidden === true, 'she steps into her portal: hidden, stage escape');
    ok(w.H.persist() && w.H.persist().stage === 'escape', 'the stage persists across a death');
    /* a death: reset puts her back in the escape, the hall laid again, never P1 */
    w.e.stage = undefined; w.e.hidden = false; w.e.mode = 'sleep'; w.st.called.length = 0; w.H.reset();
    ok(w.e.stage === 'escape' && w.e.hidden && w.st.called.includes('layEscape') && w.H.hold(), 'after a death the hall is laid again and she is NOT in it (P1 is never refought)');
    /* the fire floor: a gentle tick, a push up, never a kill (spare) */
    w.P.x = 9300; w.P.y = w.Lw.arena.floor; w.P.ground = true; w.st.dmg.length = 0; w.step(60 * 3);
    ok(w.st.dmg.some(d => d.d === GQ3.esc.fire && d.o.spare), 'the burning floor ticks ' + GQ3.esc.fire + ' and never kills (spare)');
    ok(w.P.vy < 0, 'and pushes the hero up');
    /* the burning rafter T4 goes under a foot, tile by tile, and comes back */
    const T4 = w.Lw.gqEscape.tiers.find(t => t.collapse); w.P.x = (T4.x0 + 3) * 16 + 8; w.P.y = T4.row * 16; w.P.ground = true; w.st.tiles.length = 0; w.step(60 * 1);
    ok(w.st.tiles.some(t => t[2] === 'drop' && t[0] === T4.row), 'a burning rafter goes under a foot (0.6 s a tile)'); w.P.x = 0; w.step(60 * 8);
    ok(w.st.tiles.some(t => t[2] === 'lay'), 'and is laid again');
    /* the shrine, then her portal */
    const E = w.Lw.gqEscape; w.P.x = E.check.x * 16 + 8; w.P.y = (E.check.y + 1) * 16; w.step(2);
    ok(w.st.checkpoint.x === E.check.x * 16 + 8 && w.H.persist().stage === 'roof', 'the roof shrine is the new checkpoint (a death now returns here)');
    w.P.x = E.portal.x * 16 + 8; w.step(60); ok(w.st.called.includes('enterRoof') && w.e.stage === 'roof' && w.e.hp === GQ3.hp2, 'her portal: the tower top, her second bar (' + w.e.hp + ')');
    ok(Math.abs(w.P.x - (w.Lw.arenaRoof.exit.x * 16 + 8)) < 2, 'the hero is set down at the island portal exit'); }
  /* 7. phase two: lash high / low, the geyser, the ambush, the storm, the guards */
  { const mk = () => { const w = make({ mode: 'hit' }); w.e.stage = 'roof'; w.e.phase = 3; w.e.maxHp = w.e.hp = GQ3.hp2; Object.assign(w.Lw.arena, w.Lw.arenaRoof); w.H.test.begin(); w.e.x = 10000; w.e.y = w.Lw.arena.floor; w.P.x = 9950; w.P.y = w.Lw.arena.floor; w.P.face = 1; w.e.crownCd = w.e.portalCd = 99; return w; };
    { const w = mk(); w.e.mode = 'lashHighTell'; w.e.modeT = 0.7; w.step(60); ok(w.st.dmg.length === 1 && w.st.dmg[0].d === GQ3.roof.lashDmg && w.st.dmg[0].o.unblockable, 'the HIGH lash lands on a hero who does not duck (red, 18)'); }
    { const w = mk(); w.st.ducking = true; w.e.mode = 'lashHighTell'; w.e.modeT = 0.7; w.step(60); ok(w.st.dmg.length === 0, 'the HIGH lash goes over a ducked hero'); }
    { const w = mk(); w.P.y = w.Lw.arena.floor - 20; w.P.ground = false; w.e.mode = 'lashLowTell'; w.e.modeT = 0.7; w.step(60); ok(w.st.dmg.length === 0, 'the LOW lash goes under a jumping hero'); }
    { const w = mk(); w.e.mode = 'lashLowTell'; w.e.modeT = 0.7; w.step(60); ok(w.st.dmg.length === 1, 'the LOW lash lands on a hero on the floor'); }
    { const w = mk(); w.P.x = 9900; w.e.mode = 'roofStand'; w.e.modeT = 0; w.H.test.roof().geyserCd = 0; w.H.test.roof().ambushCd = 99; w.step(2); w.step(60 * 3);
      ok(w.st.dmg.some(d => d.d === GQ3.roof.geyserDmg) || w.H.test.roof().geysers.length === 0, 'the rubble geyser erupts down its marked line (' + w.st.dmg.map(d => d.d).join(',') + ')'); }
    { const w = mk(); w.e.mode = 'ambushTell'; w.e.modeT = GQ3.roof.ambushTell; w.H.test.roof().ambushX = w.P.x - 46; w.step(60 * 1.2); ok(w.st.dmg.some(d => d.d === GQ3.roof.ambushDmg && !d.o.unblockable), 'the ambush: she steps out behind you into a YELLOW sweep (a parry pays)'); }
    { const w = mk(); w.st.mode = 'parry'; w.e.hp = Math.round(GQ3.hp2 * 0.25); w.e.x = 9980; w.H.test.roof().storm = { ang: Math.PI, hitAt: 0 }; w.P.x = 9980 - GQ3.roof.orbitR; w.P.y = w.e.y - 30 + 0.0; w.step(60 * 2);
      ok(w.e.mode === 'stunned' && w.H.test.roof().storm === null, 'a parried storm crown breaks into her: STUNNED, the storm ends'); }
    { const w = mk(); w.e.hp = Math.round(GQ3.hp2 * 0.65); w.e.mode = 'roofStand'; w.e.modeT = 9; w.step(60 * 2); ok(w.st.spawned.length === 2 && w.st.spawned.map(s => s.t).join() === 'soldier,javelin', 'at 66% two guards come up a hatch (a soldier and a javelin)'); }
  }
}

console.log(fails ? 'FAIL gqueen3 (' + fails + ')' : 'ok  gqueen3'); process.exit(fails ? 1 : 0);
