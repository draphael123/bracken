// tools/gq6fix.mjs - GQ6FIX (Daniel 11-13, Highcrown pass 6): the tower top's ENTRY + TEACH, the bells, the labels. NODE ONLY, no page. The page-side proofs are tools/gq6fix-entry.mjs / -teach.mjs / -bells.mjs / -lag.mjs.
//   node tools/gq6fix.mjs                    flag ON (the default): she stands on the hero's side of the cupola, the first blink waits, the teach comes OUT OF HER after her own told move,
//                                            its prompt + plate are routed to the screen, the Highcrown labels are MOVE_WORDS, the Princess's dressing bell hangs out of reach
//   BRACKEN_GQ6FIX=0 node tools/gq6fix.mjs   flag OFF: the batch182 entry (she starts at the far east end), the old bell height
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path'; import fs from 'node:fs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS, T } = await imp('src/level.js'); const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js'); const { Q52, Q52N } = await imp('src/gq5q2.js'); const { Q6, Q6N } = await imp('src/gq6fix.js'); const { Q4N } = await imp('src/gq4q.js');
const GPm = await imp('src/goblin-princess.js'); const { P5 } = await imp('src/gq5p.js'); const HSm = await imp('src/hero-strikes.js');
const TS = 16; console.log('flags: GQ5Q2 ' + Q52 + '  GQ6FIX ' + Q6 + '  GQ5P ' + P5);
const make = () => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, st = { time: 0, parries: 0, dmg: [], numbers: [], hints: [], spawned: [], tiles: [] };
  const mk = x => ({ x, y: 320, hp: 100, maxHp: 100, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0, hitSet: new Set(), box: null, rgArrows: [], hatchets: [], bzAxe: null });
  const heroes = [mk(14344)]; let cur = heroes[0];
  const e = { t: 'gqueen', alive: true, x: 0, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99, geodeCd: 99, throneX: 0 };
  const noop = () => {};
  const ctx = { L: Lw, TS, T, sfx: new Proxy({}, { get: () => noop }), P: () => cur, boss: () => e, bossActive: () => true, enemies: () => [e], props: () => [], time: () => st.time,
    number: (x, y, t) => st.numbers.push(t), burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop, players: () => heroes, attackBox: () => cur.box,
    damage: (x, d, o) => { st.dmg.push({ d, o: o || {} }); return 'hit'; }, parries: () => st.parries,
    hurt: (en, d) => { en.hp -= d; }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - 14, b: cur.y }),
    endFight: noop, shutWest: noop, layEscape: noop, tiles: noop, spawnEnt: o => st.spawned.push(o), setCheckpoint: noop, flaskMax: () => 3, music: noop, hint: m => st.hints.push(m),
    enterRoof: () => { Object.assign(Lw.arena, Lw.arenaRoof); }, wave: noop, ducking: () => false,
    eachHero: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, allHeroes: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, target: () => heroes[0] };
  const H = makeGQueenHands(ctx); H.load(); H.reset();
  HSm.configure({ eachSeat: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, hero: () => heroes[0], attackBox: () => cur.box, overlap: (a, b) => ctx.overlap(a, b), players: () => heroes, embers: () => [], tracers: () => [], hammers: () => [], scythe: () => null, stones: () => [] });
  const w = { H, st, heroes, e, ctx, Lw };
  w.step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; e.modeT -= dt; e.anim += dt; H.tick(e, dt);
    if (!(H.step(e, dt))) { const v = e.stage === 'roof' ? H.roofStep(e, dt) : H.mode(e, dt); if (v !== undefined) e.vx = 0; } H.update(dt); for (const h of heroes) h.box = null; } };
  return w;
};
/* the node world starts where roofBegin does, her at the position toRoof gives her (src/main.js's escape owns the real portal step; tools/gq6fix-entry.mjs times it in a page) */
const roof = () => { const w = make(), { e, Lw, H } = w; e.stage = 'roof'; e.phase = 3; e.maxHp = e.hp = GQ3.hp2; Object.assign(Lw.arena, Lw.arenaRoof); const RA = Lw.arena; e.y = RA.floor;
  const hx = RA.exit.x * TS + 8; e.x = Q6 ? Math.max(RA.x0 + 40, hx - Q6N.dx) : RA.x1 - 6 * TS; w.heroes[0].x = hx; w.heroes[0].y = RA.floor; e.mode = 'wake'; e.modeT = Q6 ? Q6N.card : 1.6; H.test.begin(); w.RA = RA; w.hx = hx; return w; };

console.log('== A. entry');
{ const w = roof(), { e, hx, RA } = w;
  if (Q6) { ok(e.x < hx && hx - e.x <= Q6N.dx + 1 && e.x >= RA.x0 + 40, 'she is ' + Math.round(hx - e.x) + ' px WEST of the arrival ring, inside the deck: x ' + e.x + ' vs hero ' + hx);
    const cu = RA.tower.CUPOLA.x0 * TS; ok(e.x < cu && hx < cu, 'both stand west of the cupola block (x ' + cu + '): nothing to climb to meet her');
    ok(Q6N.card === 1.0 && Q6N.firstBlink >= 8, 'the roof card is ' + Q6N.card + ' s and the first blink waits ' + Q6N.firstBlink + ' s'); }
  else ok(e.x === RA.x1 - 6 * TS, 'flag OFF: she starts at the far east end (x ' + e.x + ')'); }

console.log('== B. the teach comes out of her');
if (Q6) {
  const w = roof(), { e, st } = w, G = w.H.q52(); e.mode = 'roofStand'; e.modeT = 0.6;
  let tellAt = -1, shard = null, shardAt = -1;
  for (let i = 0; i < 60 * 6 && !shard; i++) { w.step(1); if (/volleyTell/.test(e.mode) && tellAt < 0) tellAt = st.time; const s = w.H.shots().filter(x => x.p2); if (s.length && !shard) { shard = s[0]; shardAt = st.time; } if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; }
  ok(tellAt > 0 && tellAt <= 2.0, 'her own told move (the sceptre-up volley pose + "!") begins at ' + tellAt.toFixed(2) + ' s of the fight');
  ok(shard && shardAt - tellAt >= Q6N.tellT - 0.05 && shardAt - tellAt <= Q6N.tellT + 0.1, 'the shard leaves her ' + (shardAt - tellAt).toFixed(2) + ' s after the tell');
  ok(shard && Math.abs(shard.x - (e.x + Math.sign(w.heroes[0].x - e.x) * 22)) < 14 && Math.abs(shard.y - (e.y - 44)) < 14, 'from HER hand (x ' + (shard && Math.round(shard.x)) + ', y ' + (shard && Math.round(shard.y)) + '), not a ring: her x ' + Math.round(e.x));
  ok(shard && Math.abs(Math.hypot(shard.vx, shard.vy) - Q52N.teach.v) < 1 && !!G.state().teach.shard && G.state().teach.shard.teach && G.state().teach.shard.glint, 'slow (' + Q52N.teach.v + ' px/s), gold glint, the teach shard');
  ok(st.hints.filter(m => m === Q52N.hint).length >= 2 && st.numbers.includes(Q52N.plate[0]) && st.numbers.includes(Q52N.plate[1]), 'the rule hint is said again with the tell, and the two-line plate comes with it (after the name card, not under it)');
  ok(st.numbers.includes('STRIKE IT!'), '"STRIKE IT!" is said at the shard');
  const h = w.heroes[0]; h.box = { l: shard.x - 14, r: shard.x + 14, t: shard.y - 14, b: shard.y + 14 }; h.hitSet = new Set(); const hp0 = e.hp; st.numbers.length = 0; w.step(1);
  for (let i = 0; i < 60 * 3 && e.hp === hp0; i++) w.step(1);
  ok(hp0 - e.hp === Math.round(e.maxHp * Q4N.p2.shardPct), 'a struck shard takes ' + (hp0 - e.hp) + ' hp = ' + Q4N.p2.shardPct * 100 + '% of her bar (unchanged)');
  ok(st.numbers.includes('STRUCK - 8%!') && !st.numbers.includes('STRUCK -8'), 'the hit confirm on her says STRUCK - 8%! once (the teach\'s own line)');
  G.state().teach.done = true; st.numbers.length = 0; e.mode = 'roofStand'; e.modeT = 0; w.H.test.q4().volleyCd = 0; w.H.test.startQ4('volley'); for (let i = 0; i < 60 * 3; i++) { w.step(1); if (w.H.shots().some(x => x.p2 && !x.teach)) break; }
  const s2 = w.H.shots().filter(x => x.p2 && !x.teach)[0];
  if (s2) { h.box = { l: s2.x - 14, r: s2.x + 14, t: s2.y - 14, b: s2.y + 14 }; h.hitSet = new Set(); const hp1 = e.hp; w.step(1); for (let i = 0; i < 60 * 3 && e.hp === hp1; i++) w.step(1); ok(e.hp < hp1 && st.numbers.includes('STRUCK -8'), 'a later reflected stone: hp -' + (hp1 - e.hp) + ', "STRUCK -8" on her'); } else ok(false, 'a volley shard to reflect');
} else ok(true, 'flag OFF: the batch182 teach (tools/gq5q2.mjs proves it)');

console.log('== C. her first blink waits');
{ const w = roof(), { e } = w; e.mode = 'roofStand'; e.modeT = 0.2; let blinked = -1; for (let i = 0; i < 60 * 8 && blinked < 0; i++) { w.step(1); if (e.mode === 'blinkTell' && blinked < 0) blinked = w.st.time; if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; }
  if (Q6) ok(blinked < 0, 'no blink in the first 8 s of the fight (' + (blinked < 0 ? 'none' : blinked.toFixed(1) + ' s') + ')'); else ok(true, 'flag OFF: first blink at ' + (blinked < 0 ? 'none in 8 s' : blinked.toFixed(1) + ' s')); }

console.log('== D. the Highcrown labels are routed (number() drops a capital string that is not a MOVE_WORD or a hint line)');
{ const src = fs.readFileSync(path.join(ROOT, 'src/main.js'), 'utf8'); const i0 = src.indexOf('const MOVE_WORDS = new Set(['), mw = src.slice(i0, i0 + 6000);
  const need = ['STRIKE IT!', 'STRUCK - 8%!', 'STRUCK -', 'THE HOISTS RISE', 'RING!', 'THE FLOOR BURNS', 'THE FIRE', 'LOWERING', 'WARDED - REFLECT HER STONES', 'WARDED - RING THE BELL', 'NOTHING IN THE BELL', 'THE BELL SWINGS', 'STRIKE HER STONES BACK AT HER', 'AND WHEN SHE HIDES IN THE BELL, RING IT.'];
  for (const k of need) ok(mw.includes("'" + k + "'"), 'MOVE_WORDS has "' + k + '"'); }

console.log('== E. the Princess\'s dressing bell');
{ const hang = GPm.GP.bell.hang; ok(P5 && Q6 ? hang === 4 : hang === 7, 'bell hangs ' + hang + ' rows under the roof (' + (P5 && Q6 ? 'GQ5P retired the mechanic: it is dressing, out of reach' : 'flags off: 7, as before') + ')'); }
console.log(fails ? 'FAIL gq6fix (' + fails + ')' : 'ok  gq6fix'); process.exit(fails ? 1 : 0);
