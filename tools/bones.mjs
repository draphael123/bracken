// tools/bones.mjs - THE SKELETON SET (claude/foes, src/bones.js): SKELETON SOLDIER, SKELETON ARCHER, SKELETON MAGE. NODE ONLY (no page, no port, no Chrome).
//   The step: every tell's length and mark, a blow in a tell cancels it, the soldier's SHIELD GUARD (front x0.4, never immune) and its three breaks (a heavy blow, a parry, behind / above),
//   the rush and the turn (his back is open), the archer's flat shot and three-mark arc volley, the mage's weakly HOMING wisp (turn cap), the GRAVE ROW's speed and length, the told BACKSTEP
//   (clear of ALL heroes, on a floor, a cooldown); the tables; the placement rows (every row finds its target in the live levels; BONES_SHIPS false = the live builds untouched).
//   The page half (stills, fightLab n=6, the Mage's Folly / Falling Tower WALK) is OWED to a browser lane.
//   node tools/bones.mjs
import { readFileSync } from 'node:fs';
import * as N from '../src/bones.js';
import { BONE_PLACEMENTS, BONE_LEVELS, bonesPlace } from '../src/bones-placements.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { THREAT } from '../src/threat.js';
import { SIG } from '../src/told-attacks.js';
import { MATERIAL_OF } from '../src/death-fx.js';
import { COMMON_BLOWS } from '../src/combat.js';
import { POISE_EXTRA } from '../src/poise-break.js';
import { ROSTER } from '../src/foe-react.js';
import { LEVELS } from '../src/level.js';
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const DT = 1 / 60, hero = (x, y = 0, p) => ({ x, y, alive: true, face: 1, p: p || { x } });
const world = (heroes, o = {}) => ({ heroes, canStep: () => true, floorOk: () => true, rand: () => 0.3, busy: false, tokWait: false, ...o });
function run(s, w, secs, on, each) { const evs = []; for (let t = 0; t < secs; t += DT) { const r = N.boneStep(s, typeof w === 'function' ? w(t) : w, DT); for (const v of r) { evs.push([+t.toFixed(3), v]); if (on) on(v, s, t); } if (each) each(s, t); s.x += s.vx * DT; } return evs; }
const firstTell = (evs, move) => evs.find(([, v]) => v.t === 'tell' && v.move === move);
const firstOf = (evs, f) => evs.find(([, v]) => f(v));

ok(N.BONES_SHIPS === false, 'BONES_SHIPS is false: no live level holds a skeleton, no bestiary card');
ok(N.SOLDIER.hp === 44 && N.ARCHER.hp === 22 && N.MAGE.hp === 18 && N.SOLDIER.w === 10 && N.SOLDIER.h === 20, 'hp 44 / 22 / 18 (x1.05 on the act IV dial = 46 / 23 / 19), one 10x20 body');

/* ---- the SOLDIER ---- */
{ const s = N.newBone('skelsoldier', 0, 0, 1); s.cd = 0; const ev = run(s, world([hero(30)]), 2);
  const t = firstTell(ev, 'thrustTell'), k = firstOf(ev, v => v.t === 'strike' && v.move === 'thrustTell');
  ok(t && t[1].mark === '!' && k && Math.abs(k[0] - t[0] - 0.5) < 0.06 && k[1].dmg === 10 && !k[1].unblock, 'the THRUST over the rim: a yellow !, ' + N.SOLDIER.thrustTell + ' s, a 10, blockable (' + (k && (k[0] - t[0]).toFixed(2)) + ')');
  const p = N.newBone('skelsoldier', 0, 0, 1); N.boneParried(p); ok(p.mode === 'parried' && p.open >= 1.2 && p.guardDown >= 1.2, 'a PARRY throws the shield arm wide: open ' + p.open + ' s with the guard down'); }
{ const s = N.newBone('skelsoldier', 0, 0, 1); s.cd = 0; let rushT = null, dist = 0, x0 = null, turnFace = [];
  const jumper = t => world([hero(t < 1.4 ? 70 : -40)]);   /* the hero is jumped over: after the rush he is BEHIND the soldier */
  const ev = run(s, jumper, 3, (v, st, t) => { if (v.t === 'tell' && v.move === 'rushTell') rushT = t; if (v.t === 'strike' && v.move === 'rushTell' && x0 === null) x0 = st.x; }, (st, t) => { if (rushT != null && t > rushT + N.SOLDIER.rushTell + N.SOLDIER.rushT && t < rushT + N.SOLDIER.rushTell + N.SOLDIER.rushT + 0.5) turnFace.push(st.face); });
  const k = ev.filter(([, v]) => v.t === 'strike' && v.move === 'rushTell');
  ok(rushT != null && firstTell(ev, 'rushTell')[1].mark === '!!', 'the SHIELD RUSH: a red !!'); ok(k.length && k.every(([, v]) => v.unblock && v.dmg === 8 && v.shove), 'told 0.7 s, then an 8 + a shove, unblockable (jump over him: HEIGHT low)');
  ok(turnFace.length > 10 && turnFace.every(f => f === 1), 'he does NOT turn for ' + N.SOLDIER.turn + ' s after the rush: his back is open (' + turnFace.length + ' frames still facing the way he ran)'); }
{ const s = N.newBone('skelsoldier', 0, 0, 1), fromFront = 60, fromBehind = -60;
  const a = N.soldierTake(s, fromFront); ok(a.k === 0.4 && a.warded, 'a blow into his FRONT is warded x0.4 (never immune: B15)');
  ok(N.soldierTake(s, fromBehind).k === 1 && N.soldierTake(s, fromBehind).say === 'FROM BEHIND', 'a blow from BEHIND lands whole (jump over him, or a co-op partner)');
  ok(N.soldierTake(s, fromFront, { plunge: true }).k === 1, 'a blow from ABOVE (a plunge) lands whole');
  const h = N.soldierTake(s, fromFront, { heavy: true }); ok(h.k === 1 && h.broke && s.guardDown >= 1.5 && N.soldierTake(s, fromFront).k === 1, 'a HEAVY blow knocks the shield aside ' + N.SOLDIER.broken + ' s (the next blows land whole)');
  s.guardDown = 0; N.boneStep(s, world([hero(500)]), DT); N.boneParried(s); ok(N.soldierTake(s, fromFront).k === 1, 'a PARRY of his thrust drops the guard too');
  const t = N.newBone('skelsoldier', 0, 0, 1); for (let i = 0; i < 200; i++) N.boneStep(t, world([hero(500)]), DT); t.guardDown = 1; for (let i = 0; i < 70; i++) N.boneStep(t, world([hero(500)]), DT); ok(t.guardDown === 0 && N.soldierTake(t, fromFront).k === 0.4, 'and the shield comes back up when the break runs out'); }
{ for (const [m, name] of [['thrustTell', 'thrust'], ['rushTell', 'rush']]) { const s = N.newBone('skelsoldier', 0, 0, 1); s.mode = m; ok(N.boneStruck(s) === m && s.mode === 'stand', 'a blow in the ' + name + ' tell cancels it'); } }

/* ---- the ARCHER ---- */
{ const s = N.newBone('skelarcher', 0, 0, 1); s.cd = 0; const ev = run(s, world([hero(150, -7)]), 2.2);
  const t = firstTell(ev, 'aimTell'), sh = firstOf(ev, v => v.t === 'shot');
  ok(t && t[1].mark === '!' && sh && Math.abs(sh[0] - t[0] - 0.8) < 0.06, 'the AIMED SHOT: a yellow !, a full draw ' + N.ARCHER.aimTell + ' s, then the arrow (' + (sh && (sh[0] - t[0]).toFixed(2)) + ')');
  const v = sh[1]; ok(Math.abs(Math.hypot(v.vx, v.vy) - 260) < 1 && v.dmg === 9 && v.vx > 0, 'a fast flat arrow (260 px/s), a 9, toward your chest');
  ok(v.y >= -N.ARCHER.shotY - 1 && v.y <= -N.ARCHER.shotY + 1 && Math.abs(v.vy / v.vx) < 0.3, 'level at head-and-chest height (it flies over a ducking hero: HEIGHT high)'); }
{ const s = N.newBone('skelarcher', 0, 0, 1); s.cd = 0; const rand = () => 0.9; const ev = run(s, world([hero(150)], { rand }), 3.2);
  const t = firstTell(ev, 'volleyTell'), lobs = ev.filter(([, v]) => v.t === 'lob');
  ok(t && t[1].mark === '!!' && t[1].spots.length === 3 && Math.abs(t[1].spots[1] - 150) < 1 && Math.abs(t[1].spots[2] - t[1].spots[0] - 68) < 1, 'the ARC VOLLEY: a red !!, three dust-mote marks on the floor ' + t[1].spots.map(x => x | 0).join('/') + ' (the hero at 150), told ' + N.ARCHER.volleyTell + ' s');
  ok(lobs.length === 3 && Math.abs(lobs[0][0] - t[0] - N.ARCHER.volleyTell) < 0.06 && Math.abs(lobs[1][0] - lobs[0][0] - 0.18) < 0.03 && lobs.every(([, v]) => v.dmg === 6), 'three lobbed arrows x 6, a beat apart, after the tell');
  const l = lobs[0][1], T = N.ARCHER.volleyFlight, x = l.x + l.vx * T, y = l.y + l.vy * T + 0.5 * l.g * T * T; ok(Math.abs(x - l.spot) < 0.5 && Math.abs(y - (-2)) < 0.5, 'each lob comes down ON its mark (x ' + x.toFixed(1) + ' vs ' + l.spot.toFixed(1) + ') - step off the marks and it misses'); }
{ const s = N.newBone('skelarcher', 100, 0, 1); let ev = run(s, world([hero(150)], {}), 1); ok(s.x < 100, 'he keeps his distance: a hero inside 100 px and he BACKS OFF (x ' + s.x.toFixed(0) + ')');
  const f = N.newBone('skelarcher', 0, 0, 1); f.cd = 99; run(f, world([hero(340)]), 1); ok(f.x > 0, 'and comes up to a hero who stands off (x ' + f.x.toFixed(0) + ')');
  const e = N.newBone('skelarcher', 100, 0, 1); e.cd = 99; run(e, world([hero(150)], { canStep: () => false }), 1); ok(e.x === 100, 'but never off a ledge (canStep)'); for (const m of ['aimTell', 'volleyTell']) { const q = N.newBone('skelarcher', 0, 0, 1); q.mode = m; ok(N.boneStruck(q) === m && q.mode === 'stand', 'a blow in the ' + m + ' cancels it'); } }

/* ---- the MAGE ---- */
{ const s = N.newBone('skelmage', 0, 0, 1); s.cd = 0; const rand = () => 0.9; const ev = run(s, world([hero(150)], { rand }), 2);
  const t = firstTell(ev, 'wispTell'), w = firstOf(ev, v => v.t === 'wisp');
  ok(t && t[1].mark === '!' && w && Math.abs(w[0] - t[0] - 0.9) < 0.06 && w[1].dmg === 9 && w[1].life === 2.5, 'the BONE WISP: a yellow !, the orb forms ' + N.MAGE.wispTell + ' s, then a 9 with a 2.5 s life'); }
{ const p = { x: 0, y: -20, ang: 0, life: 2.5 }, h = [{ x: 0, y: 130, alive: true }];   /* a hero straight below the heading: it can turn only 60 deg/s */
  let t = 0; while (N.wispStep(p, h, DT) && t < 1) t += DT; const deg = p.ang * 180 / Math.PI;
  ok(Math.abs(deg - 60) < 3, 'the wisp is WEAKLY homing: turns at most ' + N.MAGE.wispTurn + ' deg/s (' + deg.toFixed(1) + ' deg after 1 s)');
  const q = { x: 0, y: -20, ang: 0, life: 2.5 }; let n = 0, dist = 0, px = 0; while (N.wispStep(q, [{ x: 400, y: 0, alive: true }], DT)) { n++; } ok(Math.abs(n * DT - 2.5) < 0.05, 'and dies at its life (' + (n * DT).toFixed(2) + ' s)'); }
{ const s = N.newBone('skelmage', 0, 0, 1); s.cd = 0; const rand = () => 0.1; const ev = run(s, world([hero(100)], { rand }), 2.2);
  const t = firstTell(ev, 'graveTell'), g = firstOf(ev, v => v.t === 'grave');
  ok(t && t[1].mark === '!!' && g && Math.abs(g[0] - t[0] - 0.8) < 0.06 && g[1].speed === 180 && g[1].len === 160 && g[1].dmg === 10, 'the GRAVE ROW: a red !!, kneels ' + N.MAGE.graveTell + ' s, a crest at 180 px/s for 160 px, a 10 (jump the crest: HEIGHT low)');
  const row = { x0: 0, dir: 1, run: 0, len: 160 }; let last = null, n = 0; for (let x; (x = N.graveStep(row, DT)) !== null;) { last = x; n++; } ok(Math.abs(last - 160) < 4 && Math.abs(n * DT - 160 / 180) < 0.03, 'the crest runs ' + last.toFixed(0) + ' px in ' + (n * DT).toFixed(2) + ' s, then is spent'); }
{ const h = hero(20), s = N.newBone('skelmage', 0, 0, 1); s.cd = 99; const ev = run(s, world([h]), 1);   /* the BACKSTEP */
  const bt = firstTell(ev, 'x') || firstOf(ev, v => v.t === 'blinkTell'), bl = firstOf(ev, v => v.t === 'blink');
  ok(bt && bl && Math.abs(bl[0] - bt[0] - 0.3) < 0.06, 'a hero within 36 px: a told green puff (blinkTell), then the blink ' + N.MAGE.blinkTell + ' s later');
  const d = Math.abs(bl[1].x1 - bl[1].x0); ok(d >= 80 && d <= 120 && bl[1].x1 < bl[1].x0, 'it lands ' + d.toFixed(0) + ' px away (80-120), AWAY from the hero (x ' + bl[1].x1.toFixed(0) + ')');
  const two = [hero(20), hero(-60)], s2 = N.newBone('skelmage', 0, 0, 1); s2.cd = 99; const e2 = run(s2, world(two, { rand: () => 0.5 }), 1), b2 = firstOf(e2, v => v.t === 'blink');
  ok(!b2 || two.every(h2 => Math.abs(h2.x - b2[1].x1) > N.MAGE.blinkR), 'with two heroes it lands clear of BOTH (' + (b2 ? b2[1].x1.toFixed(0) : 'no blink') + ')');
  const s3 = N.newBone('skelmage', 0, 0, 1); s3.cd = 99; const e3 = run(s3, world([h], { floorOk: x => x > -60 }), 1), b3 = firstOf(e3, v => v.t === 'blink'); ok(b3 && b3[1].x1 > -60, 'never off a ledge: a floor test (floorOk) that refuses the far side sends it the other way or nowhere');
  const s4 = N.newBone('skelmage', 0, 0, 1); s4.cd = 99; const e4 = run(s4, world([h], { floorOk: () => false }), 1); ok(!e4.some(([, v]) => v.t === 'blink'), 'with no floor on either side it does not blink at all');
  const s5 = N.newBone('skelmage', 0, 0, 1); s5.cd = 99; let blinks = 0; run(s5, world([hero(s5.x + 10)]), 3.5, v => { if (v.t === 'blink') blinks++; }, st => {}); ok(blinks <= 1, 'cooldown ' + N.MAGE.blinkCd + ' s: ' + blinks + ' blink in 3.5 s of being crowded'); }
{ for (const m of ['wispTell', 'graveTell', 'blinkTell']) { const q = N.newBone('skelmage', 0, 0, 1); q.mode = m; ok(N.boneStruck(q) === m && q.mode === 'stand', 'a blow in the ' + m + ' cancels it (any blow cancels a cast)'); } }

/* ---- the pack ---- */
{ const s = N.newBone('skelarcher', 0, 0, 1); s.cd = 0; ok(!run(s, world([hero(150)], { busy: true }), 1).some(([, v]) => v.t === 'tell'), 'another one busy (or the token purse shut): no windup'); }

/* ---- the frames ---- */
{ const { install } = await import('./node-canvas.mjs'); install();
  const A = await import('../src/redraw/bones_art.js');
  for (const [k, fn, n] of [['skelsoldier', A.bakeSkelSoldier, 13], ['skelarcher', A.bakeSkelArcher, 12], ['skelmage', A.bakeSkelMage, 14]]) { const set = fn();
    ok(set.R.length === n && set.L.length === n && set.white.R.length === n && set.w === 10 && set.h === 20, k + ' bakes ' + n + ' frames, hit box ' + set.w + 'x' + set.h + ', ax ' + set.ax + ' ay ' + set.ay);
    const fr = new Set(); for (const mode of ['stand', 'walk', 'thrustTell', 'thrust', 'rushTell', 'rush', 'overshoot', 'parried', 'aimTell', 'shoot', 'volleyTell', 'volley', 'wispTell', 'cast', 'graveTell', 'grave', 'blinkTell', 'blinkRest']) for (let a = 0; a < 2; a += 0.1) fr.add(N.boneFrame({ kind: k, mode }, a, false)); fr.add(N.boneFrame({ kind: k, mode: 'stand' }, 0, true)); fr.add(N.BONE_FRAMES[k].death);
    ok([...fr].every(f => f >= 0 && f < n), k + ': every frame index the step can ask for is on the sheet'); } }

/* ---- the tables ---- */
const main = rd('src/main.js');
for (const [id, nm] of [['skelsoldier', 'SOLDIER'], ['skelarcher', 'ARCHER'], ['skelmage', 'MAGE']]) ok(new RegExp(id + ': BNS\\.' + nm + '\\.hp').test(main), 'EHP.' + id + ' is the module\'s hp');
for (const k of Object.keys(N.BONE_DMG)) ok(COMMON_BLOWS.includes(k) && /\.\.\.BNS\.BONE_DMG/.test(main), 'DMG.' + k + ' = ' + N.BONE_DMG[k] + ', scaled by the act dial (COMMON_BLOWS)');
for (const [k, mark] of Object.entries(N.BONE_TELLS)) { ok(MARK[k] === mark, k + ' wears ' + mark); ok(ANSWER[k] && (mark === '!' ? ANSWER[k] === 'block' : ANSWER[k] !== 'block') && (HEIGHT[k] === 'high' || HEIGHT[k] === 'low') && (ANSWER[k] !== 'duck' || HEIGHT[k] === 'high') && (ANSWER[k] !== 'jump' || HEIGHT[k] === 'low'), k + ' is answered (' + ANSWER[k] + ', ' + HEIGHT[k] + ')'); }
ok(MARK['skelmage|blinkTell'] === '' && !ANSWER['skelmage|blinkTell'], 'the BACKSTEP is no blow: no mark, no answer row');
ok(new Set(Object.keys(N.BONE_TELLS).map(k => ANSWER[k])).size >= 3, 'block + jump + dodge from the three alone');
ok(THREAT.skelsoldier > 0 && THREAT.skelarcher > 0 && THREAT.skelmage > 0, 'threat weights ' + [THREAT.skelsoldier, THREAT.skelarcher, THREAT.skelmage] + ' (zombie ' + THREAT.zombie + ', apprentice ' + THREAT.apprentice + ': near-like swaps)');
ok(SIG.skelsoldier.mode === 'thrustTell' && SIG.skelarcher.mode === 'aimTell' && SIG.skelmage.mode === 'wispTell', 'one SIG signature each');
ok(['skelsoldier', 'skelarcher', 'skelmage'].every(t => MATERIAL_OF.bone.includes(t)), 'death by material: bone (a heap, no reassembly)');
ok(/skelsoldier: \{ kit:/.test(rd('src/audio.js')) && /skelmage: \{ kit:/.test(rd('src/audio.js')), 'voice rows (existing kits: SOUND TODO)');
ok(POISE_EXTRA.has('skelsoldier') && /'hornsman', 'snowrunner', 'skelarcher', 'skelmage'/.test(main), 'poise: the soldier medium (POISE_EXTRA), the archer and the mage small');
ok(ROSTER[4].front.includes('skelsoldier') && ROSTER[4].back.includes('skelarcher') && ROSTER[4].back.includes('skelmage'), 'foe-react ROSTER act IV: the soldier fronts, the archer and the mage hang back');
ok(/if \(BNS\.BONES_SHIPS\) BEASTS\.push\(/.test(main) && /t: 'skelsoldier', name: 'SKELETON SOLDIER'/.test(main), 'the bestiary cards exist and are pushed ONLY behind BONES_SHIPS');

/* ---- the HANDS in node (a fake ctx, tools/foe-ctx-fake.mjs): the shield guard through take, the arrows / lobs / wisp / grave row in flight, the blink, a parry reaching the soldier ---- */
{ const { fakeCtx } = await import('./foe-ctx-fake.mjs'), { makeBoneHands } = await import('../src/bones-hands.js'), realRand = Math.random;
  const mk = (seats, kind, x = 0, face = 1) => { const F = fakeCtx(seats), H = makeBoneHands(F.ctx), e = H.spawn(F.base(x, face), { t: kind, face }); F.enemies.push(e); e.st.cd = 0; return { F, H, e }; };
  const go = (r, n, dt = DT) => { for (let i = 0; i < n; i++) { r.e.hp0 = r.e.hp; r.H.foeUpdate(r.e, dt); r.H.update(dt); } };
  Math.random = () => 0.1;
  try {
    { const r = mk([{ x: 30 }], 'skelsoldier'); ok(r.H.owns(r.e) && r.e.w === 10 && r.e.h === 20 && r.e.hp === 44 && r.e.bone === true, 'the hands spawn a soldier (10x20, hp 44)');
      ok(r.H.take(r.e, 10, 60, 'light', false) === 4, 'take: a blow into his front lands x0.4 (10 -> 4)'); ok(r.H.take(r.e, 10, -60, 'light', false) === 10, 'from behind: whole'); ok(r.H.take(r.e, 10, 60, 'light', true) === 10, 'from above (a plunge): whole');
      ok(r.H.take(r.e, 10, 60, ['heavy', 'shot'], false) === 10 && r.e.st.guardDown >= 1.5 && r.H.take(r.e, 10, 60, 'light', false) === 10, 'a HEAVY blow (a tag array too) breaks the guard: this and the next blows land whole');
      const q = mk([{ x: 30 }], 'skelsoldier'); q.F.st.heavy = true; ok(q.H.take(q.e, 10, 60, null, false) === 10, 'a held heavy swing (the hero is mid-heavy: ctx.heavyBlow) breaks it too'); }
    { const r = mk([{ x: 30 }], 'skelsoldier'); go(r, 70); ok(r.F.hits().filter(l => l[2] === 'THE THRUST').length === 1, 'the THRUST lands once (a 10)'); }
    { const r = mk([{ x: 30, parryT: 0.1 }], 'skelsoldier'); r.F.st.res = 'blocked'; go(r, 60); ok(r.e.st.mode === 'parried' && r.e.st.guardDown > 0 && r.F.log.some(l => l[0] === 'num' && l[1] === 'SHIELD ARM WIDE'), 'a PARRIED thrust: the shield arm thrown wide, open, guard down'); }
    { const r = mk([{ x: 70 }], 'skelsoldier'); r.e.st.cd = 0; Math.random = () => 0.1; go(r, 130); const rush = r.F.hits().filter(l => l[2] === 'THE SHIELD RUSH'); ok(rush.length <= 1, 'the SHIELD RUSH (when he picks it) lands at most once per attack (' + rush.length + ')'); }
    { const r = mk([{ x: 150 }], 'skelarcher'); r.e.st.cd = 0; Math.random = () => 0.1; go(r, 130); ok(r.F.hits().filter(l => l[2] === 'THE AIMED SHOT').length === 1, 'the AIMED SHOT arrow flies and finds the hero once (a 9)');
      const d = mk([{ x: 150, ducking: true }], 'skelarcher'); d.e.st.cd = 0; go(d, 130); ok(d.F.hits().length === 0, 'the same shot at a DUCKING hero flies over him (it is level: HIGH) - no hit tried at all'); }
    { const r = mk([{ x: 150 }], 'skelarcher'); r.e.st.cd = 0; Math.random = () => 0.9; go(r, 70); ok(!r.e.st.mode.startsWith('aim'), 'rand 0.9 picks the volley'); go(r, 200); const h = r.F.hits().filter(l => l[2] === 'THE ARC VOLLEY'); ok(h.length === 1 && h[0][1] === 6, 'the ARC VOLLEY: one of the three arrows lands on a hero who stays (the middle mark), a 6, unblockable');
      const m = mk([{ x: 150 }], 'skelarcher'); m.e.st.cd = 0; go(m, 66); m.F.heroes[0].x = 300; go(m, 200); ok(m.F.hits().filter(l => l[2] === 'THE ARC VOLLEY').length === 0, 'a hero who steps off the marks in the tell is not hit'); Math.random = () => 0.1; }
    { const r = mk([{ x: 150 }], 'skelmage'); r.e.st.cd = 0; Math.random = () => 0.9; r.F.heroes[0].y = 0; go(r, 40); ok(r.e.st.mode.startsWith('wisp'), 'the mage tells the wisp'); go(r, 200); ok(r.F.hits().filter(l => l[2] === 'THE BONE WISP').length === 1, 'the BONE WISP follows and finds the hero once (a 9)');
      const p = mk([{ x: 150 }], 'skelmage'); p.e.st.cd = 0; go(p, 56); p.F.st.attack = { l: 0, r: 400, t: -60, b: 10 }; go(p, 120); ok(p.F.hits().length === 0 && p.F.log.some(l => l[0] === 'num' && l[1] === 'POPPED'), 'a hero\'s blow on the wisp POPS it: no hit'); Math.random = () => 0.1; }
    { const r = mk([{ x: 100 }], 'skelmage'); r.e.st.cd = 0; Math.random = () => 0.1; go(r, 80); go(r, 100); ok(r.F.hits().filter(l => l[2] === 'THE GRAVE ROW').length === 1, 'the GRAVE ROW crest reaches the hero and strikes once (a 10, unblockable)');
      const j = mk([{ x: 100, y: -24 }], 'skelmage'); j.e.st.cd = 0; j.F.heroes[0].y = -24; go(j, 180); ok(j.F.hits().filter(l => l[2] === 'THE GRAVE ROW').length === 0, 'a hero in the air over the crest (jumped it) is not struck'); }
    { const r = mk([{ x: 20 }], 'skelmage'); r.e.st.cd = 99; go(r, 40); ok(Math.abs(r.e.x - 20) > 36 + 4 && Math.abs(r.e.x - 0) >= 80 && r.e.x < 0, 'the BACKSTEP moves the body itself (x ' + r.e.x.toFixed(0) + '), clear of the hero and away from him'); }
  } finally { Math.random = realRand; } }

/* ---- the placements ---- */
{ const lv = id => LEVELS.find(l => l.id === id); let allFound = true;
  for (const id of BONE_LEVELS) { const L = lv(id).build(), missed = bonesPlace(L, id, { force: true, report: true }); if (missed.length) { allFound = false; ok(false, id + ': rows that found nothing: ' + JSON.stringify(missed)); } }
  ok(allFound && BONE_PLACEMENTS.length === 7, 'all ' + BONE_PLACEMENTS.length + ' rows find their `from` at their `at` in the live builds (' + BONE_LEVELS.join(', ') + ')');
  const L = lv('mage').build(); bonesPlace(L, 'mage', { force: true });
  const sw = (L.ents || []).filter(e => N.isBone(e.t)); ok(sw.length === 3 && sw.map(e => e.t).sort().join() === 'skelarcher,skelmage,skelsoldier', 'THE MAGE\'S FOLLY gets a soldier, an archer and a mage (' + sw.map(e => e.t + '@' + e.x + ',' + e.y).join(' ') + ')');
  const F = lv('fallingtower').build(); bonesPlace(F, 'fallingtower', { force: true }); const fb = (F.ents || []).filter(e => N.isBone(e.t)); ok(fb.length === 4 && fb.filter(e => e.t === 'skelsoldier').length === 2, 'THE FALLING TOWER gets two soldiers, an archer and a mage (' + fb.map(e => e.t + '@' + e.x + ',' + e.y).join(' ') + ')');
  ok(sw.every(e => e.face !== undefined) && (L.ents.find(e => e.x === 221 && e.y === 5) || {}).squad === 'mage-2', 'the swap keeps the ent\'s squad and facing');
  const clean = lv('mage').build(), again = lv('mage').build(); ok(JSON.stringify(clean.ents) === JSON.stringify(again.ents) && !(clean.ents || []).some(e => N.isBone(e.t)), 'BONES_SHIPS false: the live build() has no skeleton and builds the same every time (no wrapper installed, the level hash does not move)');
  ok(/if \(BONES_SHIPS\) for \(const lv of LEVELS\)/.test(rd('src/level.js')), 'src/level.js wraps the builds with bonesPlace ONLY inside `if (BONES_SHIPS)`');
  const hits = []; for (const l of LEVELS) { let B; try { B = l.build(); } catch { continue; } for (const e of B.ents || []) if (N.isBone(e.t)) hits.push(l.id + ':' + e.t); for (const r of B.garrison || []) if (Array.isArray(r) && N.isBone(r[0])) hits.push(l.id + ':' + r[0]); }
  ok(hits.length === 0, 'no live level spawns a skeleton soldier, archer or mage (' + (hits.join(', ') || 'none') + ')'); }
console.log(bad ? 'bones: ' + bad + ' FAIL' : 'bones: ok');
process.exit(bad ? 1 : 0);
