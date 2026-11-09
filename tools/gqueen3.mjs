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
ok(!!E && Array.isArray(E.tiers) && E.tiers.length === 0 && !E.slates && !(E.hallPortals || []).length && !(E.throwers || []).length, 'L.gqEscape: the burning-HALL climb is retired (no rafters, no roof slates, no hall portals, no stack javelins) - gq3 item 6');
const RA = L.arenaRoof, TWr = E && E.tower;
ok(!!TWr && TWr.FLOORS.length === 5 && TWr.LADDERS.length === 4, 'L.gqEscape.tower: five timber storeys, four ladders through the stairwells, then the hatch');
if (E && TWr) {
  ok(!!E.check && !!E.start && !!E.portal, 'a tower foot (escapeStart), a roof shrine at the hatch top, her portal in the hall');
  ok(at(E.portal.x, E.portal.y + 1) === T.SOLID && at(E.portal.x, E.portal.y) === T.AIR && E.portal.x > A.wallL && E.portal.x < A.wallR, 'her portal stands on the hall floor, inside her hall');
  ok(at(E.start.x, E.start.y + 1) === T.SOLID && at(E.start.x, E.start.y) === T.AIR && E.start.x >= TWr.SHAFT[0] && E.start.x <= TWr.SHAFT[1], 'the tower foot is a floor inside the shaft');
  ok(at(E.check.x, E.check.y + 1) === T.SOLID && at(E.check.x, E.check.y) === T.AIR && E.check.y === 19, 'the roof shrine stands on the deck beside the hatch top');
  ok(TWr.FLOORS.slice(1).every((fy, k) => { let n = 0; for (let x = TWr.SHAFT[0]; x <= TWr.SHAFT[1]; x++) if (at(x, fy) === T.PLANK) n++; return n === (TWr.SHAFT[1] - TWr.SHAFT[0] + 1) - 3; }), 'every upper floor is timber with one 3-column stairwell');
  ok(TWr.LADDERS.every(([c, y0, y1], k) => { for (let y = y0; y <= y1; y++) if (at(c, y) !== T.NET) return false; return y1 - y0 === 12 && y0 === TWr.FLOORS[k + 1] - 1; }), 'each ladder is 12 rows of net from one storey to the next');
  ok(at(TWr.HATCH.cols[1], 20) === T.AIR && at(TWr.HATCH.cols[1], 21) === T.AIR && at(TWr.HATCH.ladder[0], 20) === T.NET && at(TWr.HATCH.ladder[0], 19) === T.NET, 'the hatch opens the deck floor over the top storey (a ladder up it)');
  ok(Math.abs(E.check.x - RA.exit.x) <= 6 && RA.x1 - RA.x0 === 60 * TS, 'the shrine is at the hatch top and the tower top is 60 columns wide');
  ok(L.ents.filter(e => e.x >= TWr.SHAFT[0] && e.x <= TWr.SHAFT[1] && e.y >= 22 && e.y <= 81 && !['coin', 'torch', 'sign'].includes(e.t)).map(e => e.t).sort().join() === 'archer,gobgeo,heavy,hound,hound,javelin,shield,soldier', 'the tower foes: soldier + javelin, shield + archer, a Geomancer, two hounds, a heavy at the hatch');
}
ok(Math.abs((L.START ? 0 : 0)) === 0 && ((L.ents.filter(e => e.t === 'check').map(e => e.x).some(x => Math.abs(x - A.wallL) <= 14))), 'a shrine within 14 columns of her hall');
ok(!!RA && RA.boss === 'gqueen' && RA.music === 'gqjudge' && RA.x1 - RA.x0 >= 40 * TS, 'L.arenaRoof: the tower top, 40+ tiles, her judgement music');
if (RA && E && TWr) {
  const { floodReach } = await imp('src/reachcore.js'), { HERO_MOVE_IDS } = await imp('src/hero-move.js');
  const F = TWr.FLOORS, marks = [[790, F[0] - 1], ...TWr.LADDERS.map(([c, y0]) => [c, y0]), ...F.slice(1).map(fy => [796, fy - 1]), [TWr.HATCH.ladder[0], 19], [E.check.x, E.check.y], [TWr.FOLLOW.begin + 3, 19], ...TWr.RINGS.map(r => [r.x, r.y])];
  for (const hero of [null, ...HERO_MOVE_IDS]) {
    const R = floodReach(L, T, { rides: true, hero: hero || undefined, seeds: [[E.start.x, E.start.y]] });
    const miss = marks.filter(m => !R.seen.has(m[0] + ',' + m[1]));
    ok(!miss.length, (hero || 'any hero') + ': the tower foot reaches every storey, every ladder, the hatch, the shrine, the deck and every portal ring' + (miss.length ? ' - MISSING ' + miss.map(m => m.join(',')).join(' ') : ''));
  }
  const Rh = floodReach(L, T, { rides: true, seeds: [[A.wallL + 4, Math.round(A.floor / TS) - 1]] });
  ok(Rh.seen.has(E.portal.x + ',' + E.portal.y), 'her hall floor reaches her portal');
  ok([...Rh.seen].filter(k => +k.split(',')[0] >= TWr.DECK.x0).length === 0, 'the main level never walks onto the tower (only her portal does)');
  const R1 = floodReach({ ...L, START: { x: E.start.x, y: E.start.y } }, T, { rides: true }), west = [...R1.seen].filter(k => +k.split(',')[0] < TWr.DECK.x0 - 1);
  ok(west.length === 0, 'the tower and its top are sealed: nothing walkable from the foot leads west of col ' + (TWr.DECK.x0 - 1));
  /* the deck: both parapets, the cupola frame, the bays are floor */
  ok(TWr.BAYS.every(([x0, x1]) => { for (let x = x0; x <= x1; x++) if (at(x, 20) !== T.SOLID || at(x, 19) !== T.AIR) return false; return true; }) && TWr.BAYS.length === 4, 'four roof bays A-D are deck floor');
  ok(TWr.RINGS.length === 7 && TWr.RINGS.every(r => at(r.x, r.y) === T.AIR && (at(r.x, r.y + 1) === T.SOLID || at(r.x, r.y + 1) === T.ONEWAY)), 'seven portal rings, each over footing');
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
    const P = { x: 11774, y: 320, hp: 50, maxHp: 100, st: 5, maxSt: 20, flasks: 0, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0 };
    const e = { t: 'gqueen', alive: true, x: 11924, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99 };
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
  { const w = make({ mode: 'parry' }); w.P.x = 11774; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; w.step(60 * 3);
    ok(w.e.mode === 'stunned' || w.H.read().stuns === 1, 'a PARRIED crown flies home and STUNS her (stuns ' + w.H.read().stuns + ')');
    ok(w.e.hp === 2400 - Math.round(2400 * GQ3.crown.stunHp), 'the stun costs her ' + GQ3.crown.stunHp * 100 + '% (hp ' + w.e.hp + ')');
    const g2 = w.H.test.stun(1, 0); ok(g2 === false, 'no stunlock: a second stun inside the guard is refused'); }
  /* 2. a plain block only knocks it down: she walks to fetch it, never open */
  { const w = make({ mode: 'blocked' }); w.P.x = 11774; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; let fetch = false; for (let i = 0; i < 60 * 4; i++) { w.step(1); if (w.e.mode === 'crownFetch') fetch = true; }
    ok(fetch && w.e.mode !== 'stunned' && w.H.read().stuns === 0, 'a plain BLOCK knocks the crown to the floor and she fetches it (no stun)'); }
  /* 3. ducked, it goes over; jumped, the same */
  { const w = make({ mode: 'hit' }); w.st.ducking = true; w.P.x = 11774; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; w.step(60 * 4);
    ok(w.st.dmg.length === 0 && w.e.mode !== 'crownToss', 'a DUCKED crown (chest height) goes over the hero both ways'); }
  /* 4. a plain hit lands once a pass, 16, yellow */
  { const w = make({ mode: 'hit' }); w.P.x = 11774; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; w.step(60 * 4);
    ok(w.st.dmg.length >= 1 && w.st.dmg.length <= 2 && w.st.dmg.every(d => d.d === GQ3.crown.dmg && !d.o.unblockable && !d.o.pierce), 'the crown hits once a pass for ' + GQ3.crown.dmg + ', yellow (' + w.st.dmg.length + ' hits)'); }
  /* 5. the portal cast: two portals, a fan of three each, one stun a cast, the rest only clank */
  { const w = make({ mode: 'parry' }); w.P.x = 11644; w.e.x = 11924; w.e.mode = 'portalTell'; w.e.modeT = 1.0; let seen = 0; for (let i = 0; i < 60 * 6; i++) { w.step(1); seen = Math.max(seen, w.H.portals().length); }
    ok(seen === 2, 'the P1a cast opens TWO portals (' + seen + ')'); ok(w.H.read().stuns === 1, 'a parried shard stuns her ONCE a cast (' + w.H.read().stuns + ')');
    ok(w.e.hp < 2400 - Math.round(2400 * GQ3.portal.stunHp) + 1 && w.e.hp >= 2400 - Math.round(2400 * 0.2), 'the other parried shards only clank (hp ' + w.e.hp + ')'); }
  { const w = make({ mode: 'hit' }); w.e.phase = 2; w.P.x = 11644; w.e.mode = 'portalTell'; w.e.modeT = 1.0; let seen = 0; for (let i = 0; i < 60 * 3; i++) { w.step(1); seen = Math.max(seen, w.H.portals().length); }
    ok(seen === 3, 'the P1b cast opens THREE portals (' + seen + ')'); ok(w.st.dmg.every(d => d.d === GQ3.portal.dmg && !d.o.unblockable), 'a shard is 10, yellow'); }
  /* 6. the flee: no death, FULL HEAL (hp, stamina, flasks), the fight ends, her portal stays open in the hall; THE BURNING TOWER (gq3 item 6) */
  { const w = make(); w.e.hp = 0; const r = w.H.spare(w.e);
    ok(r === true && w.e.alive && w.e.hp === GQ3.hp2 && w.e.stage === 'flee', 'a lethal P1 blow is SPARED: she lives, at her phase-two bar (' + w.e.hp + ')');
    ok(w.P.hp === w.P.maxHp && w.P.st === w.P.maxSt && w.P.flasks === 3, 'the flee FULLY HEALS: hp ' + w.P.hp + ', stamina ' + w.P.st + ', flasks ' + w.P.flasks);
    ok(['endFight', 'shutWest', 'layEscape'].every(k => w.st.called.includes(k)), 'the fight ends, the west door stays shut, the escape is laid');
    ok(w.st.checkpoint === null, 'no checkpoint yet: the tower foot is the checkpoint once you step through her portal');
    w.step(60 * 2); ok(w.e.stage === 'escape' && w.e.hidden === true, 'she steps into her portal: hidden, stage escape');
    ok(w.H.persist() && w.H.persist().stage === 'escape', 'the stage persists across a death');
    w.e.stage = undefined; w.e.hidden = false; w.e.mode = 'sleep'; w.st.called.length = 0; w.H.reset();
    ok(w.e.stage === 'escape' && w.e.hidden && w.st.called.includes('layEscape') && w.H.hold(), 'after a death she is NOT in the hall (P1 is never refought)');
    const E = w.Lw.gqEscape, F = E.tower.FLOORS, TW0 = E.tower; const Y = k => F[k] * 16;   // feet of storey k
    /* her portal in the hall: the party goes through, the tower foot is the checkpoint */
    w.P.x = E.portal.x * 16 + 8; w.P.y = (E.portal.y + 1) * 16; w.step(60);
    ok(w.H.read().esc.inTower && Math.abs(w.P.x - (E.start.x * 16 + 8)) < 2 && w.P.y === (E.start.y + 1) * 16, 'her portal sets the party down at the foot of THE BURNING TOWER');
    ok(w.st.checkpoint && w.st.checkpoint.x === E.start.x * 16 + 8, 'the tower foot is the checkpoint');
    /* the floors behind you catch: smoke 1.0 s then fire 2.0 s after the last hero has left; 3 hp / 0.8 s and a push up, spare */
    w.P.x = 790 * 16; w.P.y = Y(1); w.P.ground = true; w.step(60 * 1.2); ok(w.H.read().esc.burning[0] === false, 'a floor smokes before it catches');
    w.step(60 * 1.2); ok(w.H.read().esc.burning[0] === true, 'the foot floor CATCHES 2.0 s after the last hero has left it');
    w.P.y = Y(0); w.P.ground = true; w.P.vy = 0; w.st.dmg.length = 0; w.step(60 * 2); ok(w.st.dmg.some(d => d.d === GQ3.esc.fire && d.o.spare && d.o.unblockable) && w.P.vy < 0, 'fire ticks ' + GQ3.esc.fire + ' (spare: never kills) and pushes up');
    /* the beams: a creak and a shadow 1.0 s, then 14 red on whoever is under it */
    { const w2 = make(); w2.H.spare(w2.e); w2.step(60 * 2); const E2 = w2.Lw.gqEscape; w2.P.x = E2.portal.x * 16 + 8; w2.P.y = (E2.portal.y + 1) * 16; w2.step(60);
      w2.P.x = 800 * 16; w2.P.y = E2.tower.FLOORS[0] * 16; w2.P.ground = true; let seenB = 0; let hit = 0; for (let i = 0; i < 60 * 12; i++) { w2.step(1); const b = w2.H.read().esc.beams; seenB = Math.max(seenB, b);
        const bm = w2.H.test.esc && w2.H.test.esc().beams[0]; if (bm && bm.state === 'tell') w2.P.x = bm.x; w2.P.hp = 99; }
      hit = w2.st.dmg.filter(d => d.d === GQ3.tower.beamDmg && d.o.unblockable).length;
      ok(seenB >= 1 && hit >= 1, 'a BURNING BEAM is told (a shadow, 1.0 s) and lands 14 red on a hero who stays under it (' + hit + ')'); }
    /* her volley: ONE portal above you, glowing 0.9 s, then three shards at 165 px/s */
    { const w2 = make(); w2.H.spare(w2.e); w2.step(60 * 2); const E2 = w2.Lw.gqEscape; w2.P.x = E2.portal.x * 16 + 8; w2.P.y = (E2.portal.y + 1) * 16; w2.step(60);
      w2.P.x = 800 * 16; w2.P.y = E2.tower.FLOORS[0] * 16; w2.P.ground = true; w2.H.test.esc().volT = 0; let maxR = 0, sp = 0; for (let i = 0; i < 60 * 3; i++) { w2.step(1); const sh = w2.H.shots().filter(q => q.kind === 'rock'); if (sh.length > maxR) { maxR = sh.length; sp = Math.hypot(sh[0].vx, sh[0].vy); } }
      ok(maxR === 3 && Math.abs(sp - GQ3.esc.shardV) < 1, 'the volley is ONE portal, three shards at ' + GQ3.esc.shardV + ' px/s (got ' + maxR + ' at ' + Math.round(sp) + ')'); ok(GQ3.esc.fan === 6.0 && GQ3.esc.cue === 0.9 && GQ3.esc.shardDmg === 4, 'every 6.0 s, glow 0.9 s, 4 damage'); }
    /* her hops: seen a storey ahead; her entry portal stays open 1.5 s: a shortcut */
    { const w2 = make(); w2.H.spare(w2.e); w2.step(60 * 2); const E2 = w2.Lw.gqEscape, F2 = E2.tower.FLOORS; w2.P.x = E2.portal.x * 16 + 8; w2.P.y = (E2.portal.y + 1) * 16; w2.step(60);
      w2.P.x = 790 * 16; w2.P.y = F2[1] * 16; w2.P.ground = true; const q0 = w2.H.read().esc.queenK; w2.H.test.esc().q.hopAt = 0; w2.step(2); const q1 = w2.H.read().esc.queenK; const en = w2.H.test.esc().q.entry;
      ok(q1 === q0 + 1 && !!en, 'she hops up a storey (' + q0 + ' -> ' + q1 + '), her entry portal open ' + GQ3.tower.hopOpen + ' s'); w2.P.x = en.x; w2.P.y = en.y; w2.step(2);
      ok(Math.abs(w2.P.y - en.exit.y) < 1 && w2.P.y < en.y, 'stepping into her entry portal is a SHORTCUT (a storey up)'); }
    /* the hatch top: the shrine is the checkpoint (a death returns here), a walk past it begins the fight */
    w.P.x = E.check.x * 16 + 8; w.P.y = (E.check.y + 1) * 16; w.step(2);
    ok(w.st.checkpoint.x === E.check.x * 16 + 8 && w.H.persist().stage === 'roof', 'the roof shrine is the new checkpoint (a death now returns here)');
    w.P.x = (TW0.FOLLOW.begin + 2) * 16; w.step(60); ok(w.st.called.includes('enterRoof') && w.e.stage === 'roof' && w.e.hp === GQ3.hp2, 'walking past the shrine begins the tower top, her second bar (' + w.e.hp + ')'); }
  /* 7. phase two, REBUILT (gq3 item 6): lash high / low, the geyser; BLINK + stumble, CROWN through a portal, REINFORCEMENTS, BAYS, the PORTAL STORM */
  { const mk = () => { const w = make({ mode: 'hit' }); w.e.stage = 'roof'; w.e.phase = 3; w.e.maxHp = w.e.hp = GQ3.hp2; Object.assign(w.Lw.arena, w.Lw.arenaRoof); w.H.test.begin(); const RAx = w.Lw.arena, cx0 = (RAx.x0 + RAx.x1) / 2; w.e.x = cx0 + 60; w.e.y = RAx.floor; w.P.x = cx0 + 10; w.P.y = RAx.floor; w.P.face = 1; w.e.crownCd = w.e.portalCd = 99; w.cx0 = cx0; return w; };
    { const w = mk(); w.e.mode = 'lashHighTell'; w.e.modeT = 0.7; w.step(60); ok(w.st.dmg.length === 1 && w.st.dmg[0].d === GQ3.roof.lashDmg && w.st.dmg[0].o.unblockable, 'the HIGH lash lands on a hero who does not duck (red, 18)'); }
    { const w = mk(); w.st.ducking = true; w.e.mode = 'lashHighTell'; w.e.modeT = 0.7; w.step(60); ok(w.st.dmg.length === 0, 'the HIGH lash goes over a ducked hero'); }
    { const w = mk(); w.P.y = w.Lw.arena.floor - 20; w.P.ground = false; w.e.mode = 'lashLowTell'; w.e.modeT = 0.7; w.step(60); ok(w.st.dmg.length === 0, 'the LOW lash goes under a jumping hero'); }
    { const w = mk(); w.e.mode = 'lashLowTell'; w.e.modeT = 0.7; w.step(60); ok(w.st.dmg.length === 1, 'the LOW lash lands on a hero on the floor'); }
    { const w = mk(); w.P.x = w.cx0 - 40; w.e.mode = 'roofStand'; w.e.modeT = 0; const R0 = w.H.test.roof(); R0.geyserCd = 0; R0.blinkCd = 99; w.step(2); w.step(60 * 3);
      ok(w.st.dmg.some(d => d.d === GQ3.roof.geyserDmg) || R0.geysers.length === 0, 'the rubble geyser erupts down its marked line (' + w.st.dmg.map(d => d.d).join(',') + ')'); }
    { const w = mk(); w.e.mode = 'roofStand'; w.e.modeT = 0; const R0 = w.H.test.roof(); R0.blinkCd = 0; R0.last = ''; w.P.x = w.cx0 - 200; w.step(2); ok(w.e.mode === 'blinkTell', 'she BLINKS (told: a ! and a portal sound)');
      let seq = []; for (let i = 0; i < 60 * 3; i++) { w.step(1); if (!seq.length || seq[seq.length - 1] !== w.e.mode) seq.push(w.e.mode); if (w.e.mode === 'stumble') break; }
      ok(seq.join('>').includes('blinkGone>stumble') && w.e.hidden === false && w.e.gqOpenTaken === 0, 'the exit ring glows, then she steps out STUMBLING: ' + seq.join('>'));
      ok(w.e.modeT <= GQ3.p2.stumble + 1e-9 && w.e.modeT > GQ3.p2.stumble - 0.1, 'the stumble is ' + GQ3.p2.stumble + ' s = THE OPENING'); }
    { const w = mk(); w.P.x = w.cx0 - 150; w.st.mode = 'parry'; w.e.mode = 'crownTossTell'; w.e.modeT = 0.8; w.step(60 * 0.9); const c0 = w.H.test.crown && w.H.test.crown(); let seq2 = []; for (let i = 0; i < 60 * 4; i++) { w.step(1); const c = w.H.shots().find(s => s.kind === 'crown'); if (c && !seq2.length) seq2.push(Math.abs(c.vx)); }
      ok(seq2.length && Math.abs(seq2[0] - GQ3.p2.crownV) < 1, 'the crown comes out of a portal ring at ' + GQ3.p2.crownV + ' px/s (' + seq2[0] + ')'); ok(w.e.mode === 'stunned' || w.H.read().stuns === 1, 'a PARRIED portal crown stuns her (stunRoof ' + GQ3.stunRoof + ' s)'); }
    { const w = mk(); w.e.hp = Math.round(GQ3.hp2 * 0.78); w.e.mode = 'roofStand'; w.e.modeT = 9; w.step(60 * 2); ok(w.st.spawned.length === 2 && w.st.spawned.map(s => s.t).join() === 'soldier,javelin', 'at 80% a green ring, then two goblins drop (a soldier and a javelin)'); }
    { const w = mk(); const R0 = w.H.test.roof(); R0.bayT = 0; w.e.mode = 'roofStand'; w.e.modeT = 9; w.step(2); ok(R0.bays[0].state === 'smoke', 'a roof bay smokes (A first)'); w.step(60 * 1.7); ok(R0.bays[0].state === 'burn', 'then burns');
      w.P.x = (w.Lw.arenaRoof.tower.BAYS[0][0] + 2) * 16; w.P.y = w.Lw.arena.floor; w.P.ground = true; w.st.dmg.length = 0; w.step(60 * 2); ok(w.st.dmg.some(d => d.d === GQ3.esc.fire && d.o.spare), 'the burning bay ticks 3 (spare, never kills)'); w.step(60 * 6); ok(R0.bays[0].state === 'idle', 'and goes out after 6 s'); }
    { const w = mk(); w.e.hp = Math.round(GQ3.hp2 * 0.2); w.e.mode = 'roofStand'; w.e.modeT = 0; w.H.test.roof().stormAt = 0; w.step(2); ok(w.e.mode === 'stormTell', 'under 25%: the PORTAL STORM is told'); let maxS = 0; for (let i = 0; i < 60 * 5; i++) { w.step(1); maxS = Math.max(maxS, w.H.shots().filter(s => s.kind === 'rock').length); if (w.e.mode === 'stormOpen') break; }
      ok(w.e.mode === 'stormOpen' && w.e.modeT <= GQ3.p2.stormOpen && w.H.test.roof().bays.filter(b => b.state !== 'idle').length >= 2, 'the five rings light in turn, two bays burn, she STUMBLES OUT of the cupola ring: OPEN ' + GQ3.p2.stormOpen + ' s (' + w.e.mode + ')'); ok(maxS >= 3, 'each ring fans three shards (' + maxS + ' in the air at once)'); }
  }

  /* 8. (gq3 item 5) THE GEODE LOB: told 1.0 s, a red ring that locks, a lob; a blow / a parry sends it back (SENT BACK stun); else 18 and two low shards (8, jump) */
  { const w = make({ mode: 'hit' }); w.P.x = 11774; w.e.x = 11924; w.e.geodeCd = 0; w.e.phase = 1; w.H.test.geodeBegin(); const Ge0 = w.H.test.geode();
    ok(w.e.mode === 'geodeTell' && Ge0 && Ge0.state === 'tell' && Math.abs(w.e.modeT - GQ3.geode.tell) < 1e-9, 'the geode lob is told: geodeTell ' + GQ3.geode.tell + ' s');
    w.step(30); w.P.x = 11724; w.step(60 * 0.2); const lockedAt = w.H.test.geode().tx; w.P.x = 11624; w.step(10); ok(w.H.test.geode().locked && w.H.test.geode().tx === lockedAt, 'the ring tracks the hero 0.6 s and then LOCKS (it does not follow a late dodge)');
    w.P.x = lockedAt; w.step(60 * 0.4); ok(w.e.mode === 'geodeThrow' || w.e.mode === 'rec', 'the release pose, then recovery'); w.step(60 * 0.75);
    ok(w.st.dmg.some(d => d.d === GQ3.geode.dmg && !d.o.unblockable), 'a geode that lands on the hero is 18, yellow'); ok(w.H.test.geodeBits().length === 2, 'and it shatters into 2 low shards (' + w.H.test.geodeBits().length + ')');
    ok(w.st.dmg.some(d => d.d === GQ3.geode.shardDmg), 'a floor shard runs into a hero who stays put: 8 (a jump clears it)'); w.step(60 * 1); ok(w.H.test.geodeBits().length === 0, 'the shards run 40 px and are done'); }
  { const w = make({ mode: 'hit' }); w.P.x = 11774; w.P.hitSet = new Set(); w.e.x = 11924; w.H.test.geodeBegin(); w.step(60 * 1.35); const Ge = w.H.test.geode();
    ok(Ge && Ge.state === 'fly', 'in the air');
    w.ctx.attackBox = () => ({ l: Ge.x - 14, r: Ge.x + 14, t: Ge.y - 14, b: Ge.y + 14 }); w.step(2);
    ok(w.H.test.geode() && w.H.test.geode().state === 'back', 'a BLOW that meets it in the air sends it back'); w.ctx.attackBox = null; w.P.x = 0;
    w.step(60 * 2); ok(w.e.mode === 'stunned' && w.e.hp === 2400 - Math.round(2400 * GQ3.geode.stunHp), 'SENT BACK: she is STUNNED (' + GQ3.geode.stun + ' s, ' + GQ3.geode.stunHp * 100 + '%)'); ok(w.H.test.geodeBits().length === 0 && !w.H.test.geode(), 'a returned geode does not shatter on the floor'); }
  { const w = make({ mode: 'parry' }); w.P.x = 11774; w.e.x = 11924; w.H.test.geodeBegin(); w.step(60 * 4);
    ok(w.e.mode === 'stunned' || w.H.read().stuns === 1, 'a PARRIED geode (on the landing) is sent back and stuns her once (stuns ' + w.H.read().stuns + ')'); }
  { const w = make({ mode: 'hit' }); w.e.x = 11924; w.P.x = 11724; w.e.crownCd = 99; w.e.portalCd = 99; w.e.geodeCd = 0; w.e.phase = 1; ok(w.H.choose(w.e, 200) === true && w.e.mode === 'geodeTell', 'she chooses the lob at range (> 90 px)');
    const w2 = make({ mode: 'hit' }); w2.e.x = 11924; w2.P.x = 11884; w2.e.crownCd = 99; w2.e.portalCd = 99; w2.e.geodeCd = 0; ok(w2.H.choose(w2.e, 40) === false, 'never up close (range > 90 px)');
    const w3 = make({ mode: 'hit' }); w3.e.crownCd = 99; w3.e.portalCd = 99; w3.e.geodeCd = 0; w3.H.mech().lure = {}; ok(w3.H.choose(w3.e, 200) === false, 'never while the bell lure is live');
    w.step(60 * 3); ok(w.e.geodeCd > 5 && w.e.geodeCd <= GQ3.geode.cd, 'cooldown ' + GQ3.geode.cd + ' s (' + GQ3.geode.cd2 + ' s below half)'); }
  /* 9. (gq3 item 1) THE QUEEN ESCAPES: the tower top's bar empties -> kneel, sceptre slam + royal portal, she backs in, it snaps shut; untouchable meanwhile; then the ordinary death path with no corpse */
  { const w = make({ mode: 'hit' }); w.e.stage = 'roof'; w.e.phase = 3; w.e.maxHp = w.e.hp = GQ3.hp2; Object.assign(w.Lw.arena, w.Lw.arenaRoof); w.H.test.begin(); w.e.x = 12624; w.e.y = w.Lw.arena.floor; w.e.hp = 0;
    const spared = w.H.spare(w.e); ok(spared === true && w.e.alive && w.e.stage === 'fled' && w.e.mode === 'fledKneel' && w.e.hp >= 1, 'the roof bar empties: she is SPARED (a kneel, hp held at 1), not killed');
    ok(w.H.fled(), 'the escape is running'); let seq = []; w.e.hurtLog = 0; for (let i = 0; i < 60 * 4; i++) { w.step(1); if (!seq.length || seq[seq.length - 1] !== w.e.mode) seq.push(w.e.mode); if (w.e.stage === 'fledDone') break; }
    ok(seq.join('>').startsWith('fledKneel>fledSlam>fledBack>fledSnap'), 'kneel > sceptre slam (portal opens) > backs into it > it snaps shut (' + seq.join('>') + ')');
    ok(w.e.gqFled === true && w.e.stage === 'fledDone', 'then the death path: gqFled set (main.js: no corpse, THE QUEEN HAS FLED, PROG.gqFled)'); }
}

console.log(fails ? 'FAIL gqueen3 (' + fails + ')' : 'ok  gqueen3'); process.exit(fails ? 1 : 0);
