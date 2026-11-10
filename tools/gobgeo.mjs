// tools/gobgeo.mjs - THE GOBLIN GEOMANCER and HIGHCROWN's REFLECTED ROCKS, THE NODE HALF (claude/gobgeo). No page, no browser.
//   RULES   his brain: told rock lob (0.75 s), slate volley every third, shell burst close (orbit spent -> SPENT), a blow cancels a tell; the lob lands where it aims;
//           his front is guarded while stone orbits him (x0.35), his back / an empty orbit / his own rock are whole; the held rock is his weak spot
//   HANDS   a fake room: a rock PARRIED (the shared parry counter) or STRUCK (a blow on it) flies BACK and smashes the first thing in its path - a seal (the gate's cells
//           open), a shield goblin from the front (off balance, no damage), a chandelier (it falls), a gate bell (its guards run to it), a goblin, and him (staggered);
//           a plain block breaks it; a roll lets it fly on; a seal whose Geomancer is dead fails on its own (never a soft-lock); 1-4 seats
//   LAYOUT  Highcrown keeps its 765 columns; the teach gate and its seal in the Captains Hall with one Geomancer behind it; the shield-bearer; the chandelier between the
//           floor and the ledge Geomancer; tower 1's old stone between the walk and its roof Geomancer (and the sealed chamber behind it); tower 2's gate bell between the
//           walk and its roof Geomancer, the guards that answer it; the pins of crown-exam (three unstable lamps, the balcony guards) untouched
//   WIRING  main.js: import, EHP, DMG, spawn, take (with the tag), the update branch, the frame, the sheet + HAS_HURT, the bestiary card, the shield wall covers him
//   node tools/gobgeo.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GG, GG_MODES, newGeo, geoStep, lob, fan, geoTake, geoStruck, sweep } from '../src/gob-geomancer.js';
import { install } from './node-canvas.mjs';
install();
globalThis.window = globalThis.window || {};
const { makeGobGeoHands } = await import('../src/gobgeo-hands.js');
const { LEVELS, T } = await import('../src/level.js');
const { GOBGEO } = await import('../src/gobgeo-level.js'); const { SH_HALL } = await import('../src/gq4l.js');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

/* ---------------- RULES ---------------- */
{ const s = { x: 100, y: 200, face: -1, stagger: 0, maxHp: GG.hp, ...newGeo({ post: 100 }) }; s.cd = 0;
  const w = { tx: 250, ty: 200, ahead: () => true, roll: () => 0.5, tokWait: false };
  let r = geoStep(s, 1 / 60, w); ok(s.mode === 'rockTell' && r.events.some(e => e.ev === 'tell' && e.move === 'rockTell'), 'in range, his cooldown done: the rock lob is TOLD first (rockTell)');
  ok(s.face === 1, 'he turns to the hero he means');
  let t = 0, ev = null; while (t < 2 && !ev) { r = geoStep(s, 1 / 60, w); t += 1 / 60; ev = r.events.find(e => e.ev === 'rock'); }
  ok(ev && Math.abs(t - GG.rock.tell) < 0.05, 'the rock flies at the END of its 0.75 s tell (' + t.toFixed(2) + ' s)');
  ok(s.orbit === GG.orbit.max - 1, 'a lobbed rock is one of his orbit');
  s.cd = 0; s.mode = 'idle'; geoStep(s, 1 / 60, w); s.cd = 0; s.mode = 'idle'; s.n = 2; geoStep(s, 1 / 60, w); ok(s.mode === 'slateTell', 'every third throw is the SLATE VOLLEY');
  s.mode = 'idle'; s.cd = 0; s.orbit = 2; s.shellCd = 0; geoStep(s, 1 / 60, { ...w, tx: 130 }); ok(s.mode === 'shellTell', 'close in (< 52 px) with stone round him: the SHELL BURST');
  let shell = null; for (let k = 0; k < 60 && !shell; k++) shell = geoStep(s, 1 / 60, { ...w, tx: 130 }).events.find(e => e.ev === 'shell'); ok(shell && s.orbit === 0 && s.spent > 0, 'the shell burst spends his orbit: SPENT');
  s.mode = 'idle'; s.cd = 0; s.n = 0; s.orbit = 3; geoStep(s, 1 / 60, w); ok(s.mode === 'rockTell', 'again'); s.stagger = 0.5; r = geoStep(s, 1 / 60, w); ok(s.mode === 'stagger' && r.events.some(e => e.ev === 'cancel'), 'a blow (a stagger) breaks the tell: nothing is thrown');
  s.stagger = 0; s.mode = 'idle'; s.cd = 0; geoStep(s, 1 / 60, { ...w, tokWait: true }); ok(s.mode !== 'rockTell', 'the attack-token board says wait: he waits');
  s.cd = 5; s.x = 100; geoStep(s, 1 / 60, { ...w, tx: 120 }); ok(true, 'walk'); const r2 = geoStep(s, 1 / 60, { ...w, tx: 120 }); ok(r2.vx < 0, 'too close: he backs away (keeps 90-170 px)');
  const r3 = geoStep(s, 1 / 60, { ...w, tx: 120, ahead: () => false }); ok(r3.vx === 0, 'never off his ledge');
  s.x = 100 - GG.leash - 2; const r4 = geoStep(s, 1 / 60, { ...w, tx: 60 }); ok(r4.vx >= 0, 'never past his leash');
  ok(GG_MODES.length === 3 && GG_MODES.every(m => m.endsWith('Tell')), 'three windups, each a ...Tell (the told mark reads them)'); }
{ const v = lob(0, 0, 160, 40); let x = 0, y = 0, vy = v.vy; for (let t = 0; t < v.T; t += 1 / 240) { x += v.vx / 240; vy += GG.rock.g / 240; y += vy / 240; } ok(Math.abs(x - 160) < 3 && Math.abs(y - 40) < 6, 'the lob lands where it is aimed (' + x.toFixed(0) + ',' + y.toFixed(0) + ')');
  const f = fan(0, 0, 100, 0); ok(f.length === GG.slate.n && Math.abs(Math.atan2(f[0].vy, f[0].vx) - Math.atan2(f[2].vy, f[2].vx)) > 0.3, 'the volley is a fan of three'); }
{ const s = { x: 100, y: 200, face: 1, ...newGeo(), maxHp: GG.hp };
  let r = geoTake(s, 10, { tag: 'cut', fromX: 140 }); ok(r.dmg === Math.round(10 * GG.ward.mul) && s.orbit === 2, 'a blow into his FRONT with stone round him: WARDED x' + GG.ward.mul + ', a chunk knocked away');
  r = geoTake(s, 10, { tag: 'cut', fromX: 60 }); ok(r.dmg === 10, 'from BEHIND: whole');
  r = geoTake(s, 10, { tag: 'plunge', fromX: 140, above: true }); ok(r.dmg === 10, 'from above: whole');
  r = geoTake(s, 10, { tag: 'reflect', fromX: 140 }); ok(r.dmg === 10, 'his own rock sent back: whole');
  s.orbit = 0; r = geoTake(s, 10, { tag: 'cut', fromX: 140 }); ok(r.dmg === 10, 'an empty orbit: whole');
  s.orbit = 2; s.mode = 'rockTell'; s.held = true; r = geoTake(s, 10, { tag: 'cut', fromX: 140 }); ok(r.held && r.dmg === 10 + GG.held.bonus && r.stagger > 0, 'struck while the rock is over his head: it falls on HIM (the weak spot)');
  s.mode = 'idle'; s.spent = 1; r = geoTake(s, 10, { tag: 'cut', fromX: 140 }); ok(r.dmg === 15, 'SPENT after his shell burst: x1.5');
  s.spent = 0; s.orbit = 3; const h = geoStruck(s); ok(h.dmg >= GG.back.dmg && h.stagger === GG.back.stagger && s.orbit === 0, 'his own rock home: ' + h.dmg + ' (>= a third of his bar), STAGGERED ' + h.stagger + ' s, his orbit dropped');
  ok(GG.ward.mul >= 0.3, 'never untouchable: his guard lets a third through'); }
{ const hit = sweep(0, 0, 300, 0, 0.2, (x) => x > 40 ? 'T' : null, () => false); ok(hit.hit === 'T' && hit.x <= 44, 'a sent-back rock meets the FIRST thing in its path (swept, not tunnelled)');
  const wall = sweep(0, 0, 300, 0, 0.2, () => null, x => x > 20); ok(wall.wall && wall.x <= 24, 'and a wall stops it'); }

/* ---------------- HANDS: a fake room ---------------- */
function room(o = {}) {
  const TS = 16, floor = 20 * TS;
  const st = { time: 0, parries: 0, enemies: [], props: [], opened: [], hurt: [], off: [], dmg: [], nums: [] };
  const heroes = (o.heroes || [{ x: 100, y: floor }]).map((h, i) => ({ dead: false, x: h.x, y: h.y, face: 1, hitSet: new Set(), seat: i, mode: h.mode || 'hit', swing: !!h.swing }));
  let cur = heroes[0];
  const L = { rocklocks: o.locks || [] };
  const ctx = { L, TS, EHP: { gobgeo: GG.hp }, sfx: new Proxy({}, { get: () => () => {} }), time: () => st.time, hero: () => cur, enemies: () => st.enemies, props: () => st.props, boss: () => null, VW: () => 480,
    number: (x, y, t) => st.nums.push(t), burst() {}, dust() {}, ring() {}, shake() {},
    eachHero: fn => { for (const h of heroes) { if (h.dead) continue; const p = cur; cur = h; fn(h); cur = p; } },
    damagePlayer: () => { st.dmg.push(cur.seat); if (cur.mode === 'parry') { st.parries++; return 'blocked'; } if (cur.mode === 'block') return 'blocked'; if (cur.mode === 'roll') return false; return 'hit'; },
    parries: () => st.parries, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: e => ({ l: e.x - e.w / 2, r: e.x + e.w / 2, t: e.y - e.h, b: e.y }),
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - 26, b: cur.y }), attackBox: () => cur.swing ? { l: cur.x, r: cur.x + 30, t: cur.y - 30, b: cur.y } : null,
    hurtAs: (tag, e, d) => { st.hurt.push({ tag, t: e.t, d }); e.hp -= d; if (e.hp <= 0) e.alive = false; }, offBalance: (e, secs) => { st.off.push(e.t); e.broken = secs; },
    moveBody: () => ({ ground: true }), solidAt: (x, y) => y > floor || x < 0 || x > 1600, standable: (tx, ty) => ty >= 20,
    openCells: cells => st.opened.push(...cells) };
  const H = makeGobGeoHands(ctx); H.load();
  const geo = (x, o2 = {}) => { const e = H.spawn({ x, y: floor, vx: 0, vy: 0, face: -1, alive: true, stagger: 0, anim: 0 }, { face: -1, ...o2 }); e.maxHp = e.hp; st.enemies.push(e); return e; };
  const run = (secs, fn) => { for (let t = 0; t < secs; t += 1 / 60) { st.time += 1 / 60; for (const e of st.enemies) if (e.alive && e.t === 'gobgeo') { if (e.stagger > 0) e.stagger = Math.max(0, e.stagger - 1 / 60); H.foeUpdate(e, 1 / 60); } H.update(1 / 60); if (fn && fn()) return true; } return false; };
  return { st, H, ctx, heroes, geo, run, floor, TS };
}
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'parry' }] }); const g = w.geo(240); g.cd = 0;
  w.run(4, () => w.st.hurt.length > 0);
  ok(w.st.dmg.length >= 1, 'his rock reaches the hero'); ok(w.st.hurt.some(h => h.t === 'gobgeo' && h.tag === 'reflect'), 'PARRIED: it flies back and strikes HIM (tagged reflect)');
  ok(g.stagger > 0 && g.orbit === 0, 'he is STAGGERED, his orbit dropped'); ok(w.H.read().n.parried >= 1, 'counted as a parry'); }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'hit', swing: true }] }); const g = w.geo(240); g.cd = 0;
  w.run(4, () => w.st.hurt.length > 0); ok(w.st.hurt.some(h => h.t === 'gobgeo') && w.H.read().n.struck >= 1, 'a BLOW that meets the rock sends it back too (every hero has a blow)'); }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'block' }] }); const g = w.geo(240); g.cd = 0; w.run(3); ok(!w.st.hurt.length && w.st.dmg.length >= 1, 'a plain BLOCK breaks the rock: nothing goes back'); void g; }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'roll' }] }); const g = w.geo(240); g.cd = 0; let passed = false; w.run(3, () => { const r = w.H.read().rocks; if (r.length && r[0].x < 96) passed = true; return passed; }); ok(passed, 'rolled through: the rock flies on'); void g; }
{ const lock = { id: 'L1', kind: 'seal', x: 10, y: 18, box: [10, 10, 10, 19], cells: [[10, 10, 19]], seal: 'L1' };
  const w = room({ heroes: [{ x: 120, y: 320, mode: 'parry' }], locks: [lock] }); const g = w.geo(240, { seal: 'L1' }); g.cd = 0; void g;
  w.run(4, () => w.st.opened.length > 0); ok(w.st.opened.length === 1 && w.st.opened[0][0] === 10, 'a rock sent back across the barred gate SHATTERS ITS SEAL: the gate opens'); ok(!w.st.hurt.length, 'the seal took the rock, not him'); }
{ const lock = { id: 'L2', kind: 'seal', x: 10, y: 18, box: [10, 10, 10, 19], cells: [[10, 10, 19]], seal: 'L2' };
  const w = room({ heroes: [{ x: 140, y: 320, mode: 'hit' }], locks: [lock] }); const g = w.geo(240, { seal: 'L2' }); g.alive = false;
  w.run(GG.sealFail + 0.5); ok(w.st.opened.length === 1, 'his seal FAILS on its own once he is dead and you are near (never a soft-lock)'); }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'parry' }] }); const g = w.geo(260); g.cd = 0; const sh = { t: 'shield', x: 200, y: 320, w: 10, h: 14, face: -1, alive: true, hp: 20 }; w.st.enemies.push(sh);
  w.run(4, () => w.st.off.length > 0); ok(w.st.off[0] === 'shield' && !w.st.hurt.length, 'his shield-bearer from the front: SHIELD KNOCKED ASIDE (off balance), no damage');
  const w2 = room({ heroes: [{ x: 100, y: 320, mode: 'parry' }] }); const g2 = w2.geo(260); g2.cd = 0; void g2; w2.st.enemies.push({ t: 'shield', x: 200, y: 320, w: 10, h: 14, face: 1, alive: true, hp: 20 });
  w2.run(4, () => w2.st.hurt.length > 0); ok(w2.st.hurt[0].t === 'shield' && w2.st.hurt[0].tag === 'reflect', 'a shield turned away: the rock strikes him (reflect)'); }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'parry' }] }); const g = w.geo(300); g.cd = 0; g.y = 220; const lamp = { t: 'weight', lamp: true, state: 'hang', x: 220, y: 160, len: 96 }; w.st.props.push(lamp);
  const sold = { t: 'soldier', x: 222, y: 320, w: 10, h: 14, alive: true, hp: 30, face: -1 }; w.st.enemies.push(sold);
  w.run(4, () => lamp.state === 'fall'); ok(lamp.state === 'fall', 'sent back up at him, the rock meets the CHANDELIER: it falls'); lamp.state = 'down'; lamp.fy = 320;
  w.run(0.2); ok(w.st.hurt.some(h => h.t === 'soldier' && h.d === GG.lamp.dmg), 'and lands on whoever is under it'); }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'parry' }] }); const g = w.geo(300, { perch: true }); g.cd = 0; g.y = 120; const bell = { t: 'gatebell', id: 'B', x: 250, y: 190, gx: 264, gate: 16, gy0: 15, gy1: 19, ringT: -1, tolled: 0, rewind: 0, rings: [], down: 0, up: false };
  w.st.props.push(bell); const gd = { t: 'heavy', x: 180, y: 320, w: 16, h: 22, alive: true, hp: 120, answers: 'B', face: -1 }; w.st.enemies.push(gd);
  w.run(4, () => gd.answerT > 0); ok(gd.answerT > 0 && gd.answerX === 264 && bell.ringT >= 0, 'sent back up at him, the rock RINGS THE GATE BELL: its guards run to it (src/bell-gate.js drops the gate on them)'); }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'parry' }, { x: 60, y: 320, mode: 'hit' }, { x: 40, y: 320, mode: 'hit' }, { x: 20, y: 320, mode: 'hit' }] }); const g = w.geo(240); g.cd = 0;
  w.run(4, () => w.st.hurt.length > 0); ok(w.st.dmg[0] === 0 && w.st.hurt.some(h => h.t === 'gobgeo'), '4 seats: the front seat\'s parry sends it home'); }
{ const w = room({ heroes: [{ x: 140, y: 320, mode: 'hit' }] }); const g = w.geo(170); g.cd = 0; g.orbit = 3; w.run(1.5); ok(w.st.dmg.length >= 1 && g.spent >= 0, 'close in: his SHELL BURST reaches you'); }

/* ---------------- LAYOUT ---------------- */
const L = LEVELS.find(l => l.id === 'crown').build(), W = L.W, at = (x, y) => L.grid[y * W + x];
ok(W === 841 + SH_HALL, 'Highcrown is 841 columns (gq3: the Queen Stair +64, the tower top +12); the Geomancer rooms are laid into columns that are there (' + W + ')');
const geos = L.ents.filter(e => e.t === 'gobgeo'); ok(geos.length === 8, 'eight Geomancers: teach, shield, chandelier, the secret, the last walk (the five of gobgeo) + gq3: the stair grille, the geode store, the burning tower (' + geos.length + ')');
ok(geos.filter(e => e.x < L.arena.x0 / 16).length === 7 && geos.filter(e => e.x > L.arena.x1 / 16).length === 1, 'seven of them BEFORE the Queen hall (the Captains Hall, the battlements, gq3 the stair), one in the burning tower AFTER it (gq3: the tower is past her flee portal)');
const TG = GOBGEO.TEACH, seal = L.rocklocks.find(k => k.id === 'gg-teach');
ok(seal && seal.kind === 'seal', 'the teach gate has its seal');
for (let y = TG.rows[0]; y <= TG.rows[1]; y++) ok(at(TG.gate, y) === T.PORT, 'the teach gate is down across the hall at row ' + y);
const g1 = geos.find(e => e.seal === 'gg-teach'); ok(g1 && g1.x > TG.gate, 'ONE Geomancer behind the teach gate, bound to its seal');
ok(!L.ents.some(e => ['soldier', 'javelin', 'heavy', 'pike', 'shield', 'archer', 'hound'].includes(e.t) && e.y >= 15 && e.y <= 19 && e.x > 430 && e.x < TG.gate), 'nothing else on your side of the teach gate: safe');
ok((L.reachDoors || []).some(d => d.x0 === TG.gate), 'the reach model knows every hero opens it (a parry)');
const sb = L.ents.find(e => e.t === 'shield' && e.x === GOBGEO.SHIELD.guard); ok(sb && geos.some(e => e.x === GOBGEO.SHIELD.geo), 'the shield-bearer and the Geomancer behind him');
const lamp = L.ents.find(e => e.t === 'weight' && e.x === GOBGEO.LAMP.lamp); ok(lamp && lamp.unstable && lamp.lamp, 'the third chandelier is the hall\'s own');
{ const gl = geos.find(e => e.x === GOBGEO.LAMP.geo); const gx = gl.x * 16 + 8, gy = (gl.y + 1) * 16 - 11, lx = lamp.x * 16 + 8, lt = lamp.y * 16, lb = lamp.y * 16 + lamp.len * 16 + 16;
  let hitN = 0; for (let hx = 445; hx <= 466; hx++) { const x0 = hx * 16 + 8, y0 = 20 * 16 - 14, k = (lx - x0) / (gx - x0), y = y0 + (gy - y0) * k; if (y >= lt && y <= lb) hitN++; }
  ok(hitN === 22, 'from anywhere on the hall floor 445-466, the line home to the ledge Geomancer crosses the chandelier (' + hitN + '/22)'); }
ok(at(GOBGEO.LAMP.net, 15) === T.NET && at(GOBGEO.LAMP.ledge[0], GOBGEO.LAMP.row) === T.NET, 'his ledge has a net up to it');
const sec = L.rocklocks.find(k => k.id === 'gg-secret'); ok(sec && sec.kind === 'crack', 'tower 1\'s old stone is a rocklock');
{ const R0 = GOBGEO.T1.room; let enclosed = true; for (let y = R0[2] - 1; y <= R0[3] + 1; y++) for (let x = R0[0] - 1; x <= R0[1] + 1; x++) { const inside = x >= R0[0] && x <= R0[1] && y >= R0[2] && y <= R0[3]; if (!inside && at(x, y) !== T.SOLID) enclosed = false; if (inside && at(x, y) !== T.AIR) enclosed = false; }
  ok(enclosed, 'the chamber in tower 1 is air, sealed in stone until the old stone gives');
  ok(L.ents.some(e => e.t === 'mend' && e.x >= R0[0] && e.x <= R0[1]) && L.ents.filter(e => e.t === 'coin' && e.x >= R0[0] && e.x <= R0[1] && e.y >= R0[2] && e.y <= R0[3]).length >= 3, 'and it pays: coins and a mend');
  const g4 = geos.find(e => e.x === GOBGEO.T1.geo); const gx = g4.x * 16 + 8, gy = (g4.y + 1) * 16 - 11, fx = GOBGEO.T1.face * 16;
  let hitN = 0, tries = 0; for (let hx = 543; hx <= 554; hx++) { tries++; const x0 = hx * 16 + 8, y0 = 22 * 16 - 14, k = (fx - x0) / (gx - x0), y = y0 + (gy - y0) * k; if (y >= sec.box[2] * 16 && y <= (sec.box[3] + 1) * 16) hitN++; }
  ok(hitN === tries, 'from the walk within his sight, the line home to the tower-1 Geomancer meets the old stone first (' + hitN + '/' + tries + ')');
  ok(at(GOBGEO.T1.ledge[0], GOBGEO.T1.ledge[2]) === T.ONEWAY && GOBGEO.T1.steps.every(([a, , r]) => at(a, r) === T.ONEWAY), 'stone steps and a ledge up to it'); }
{ const T2 = GOBGEO.T2, bell = L.ents.find(e => e.t === 'gatebell' && e.id === 'gg-t2'); ok(bell && bell.gate === T2.gate, 'tower 2 has its gate bell over the arch');
  for (let y = T2.gy[0]; y <= T2.gy[1]; y++) ok(at(T2.gate, y) === T.AIR, 'the arch is open (the bell drops its gate) at row ' + y);
  ok(L.ents.filter(e => e.answers === 'gg-t2').length === 2, 'the shield-bearer and the heavy answer it');
  const g5 = geos.find(e => e.x === T2.geo); const gx = g5.x * 16 + 8, gy = (g5.y + 1) * 16 - 11, bx = T2.bell * 16 + 8, bt = (T2.bellRow + 1) * 16 - 100, bb = (T2.bellRow + 1) * 16 + 30;
  let hitN = 0, tries = 0; for (let hx = 586; hx <= 598; hx++) { tries++; const x0 = hx * 16 + 8, y0 = 22 * 16 - 14, k = (bx - x0) / (gx - x0), y = y0 + (gy - y0) * k; if (y >= bt && y <= bb) hitN++; }
  ok(hitN === tries, 'from the last walk, the line home to the tower-2 Geomancer rings the bell (' + hitN + '/' + tries + ')'); }
{ const cap = L.ents.filter(e => e.t === 'weight' && e.unstable && e.x > 429 && e.x < 482); ok(cap.length === 3, 'crown-exam\'s pin: the Captains Hall keeps three falling lamps');
  ok(cap.every(w => L.ents.some(e => (e.t === 'soldier' || e.t === 'javelin') && Math.abs(e.x - (w.x + 2)) <= 1 && e.y === 13)), 'and every balcony its guard'); }

/* ---------------- WIRING ---------------- */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
for (const [re, why] of [[/import \{ makeGobGeoHands \} from '\.\/gobgeo-hands\.js'/, 'the hands are imported'], [/gobgeo: GGN\.hp/, 'EHP.gobgeo'], [/gobgeoRock: GGN\.rock\.dmg/, 'DMG rows'],
  [/case 'gobgeo': \{ if \(GGH\) enemies\.push\(GGH\.spawn\(base, e\)\)/, 'the spawn case'], [/if \(e\.t === 'gobgeo' && GGH\) dmg = GGH\.take\(e, dmg, tag\)/, 'take gets the blow\'s tag'],
  [/if \(GGH && GGH\.owns\(e\)\) \{[^}]*GGH\.foeUpdate\(e, dt\)/, 'the update branch'], [/frame = GGH\.frame\(e\)/, 'his frame'], [/SPR\.gobgeo = GGA\.sheet\(\); HAS_HURT\.add\('gobgeo'\)/, 'the sheet and its hurt pose'],
  [/\{ t: 'gobgeo', name: 'GOBLIN GEOMANCER'/, 'the bestiary card'], [/const COVERED = new Set\(\[[^\]]*'gobgeo'/, 'the shield wall covers him'], [/parries: \(\) => RP\.stats\.parries[^\n]*attackBox: \(\) => attackBox\(\)/, 'the parry counter and the blow box reach the hands'],
  [/GGH\.update\(dt\)/, 'his stone flies once a frame'], [/GGH\.drawOver\(g, cx, cy, time\)/, 'drawn']]) ok(re.test(main), 'main.js: ' + why);
console.log('gobgeo: all ok (' + n + ' asserts)');
