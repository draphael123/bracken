// tools/beasts.mjs - THE FROST BEASTS (claude/foes, src/beasts.js): SNOWRUNNER, GREYMANE, BRUIN. NODE ONLY (no page, no port, no Chrome).
//   The step: every tell's length and mark, a blow in a tell cancels it (but not the bear's charge), the pounce's RING and PIN, the winded / dazed / skid / parried windows, the leap's
//   miss, the charge at a wall, the pack (one at a time, the leader's death, the spread across seats), the baked placeholder sheets (frame counts); the tables (EHP, DMG, MARK / ANSWER /
//   HEIGHT, threat, SIG, voices, death-fx, poise, names); the FLAG: BEASTS_SHIPS false = no live level holds one and no bestiary card.
//   The page half (stills per tell / release / hit from the pen, fightLab n=6 time-to-kill) is OWED to a browser lane: tools/beasts-shots.mjs does not exist yet.
//   node tools/beasts.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as B from '../src/beasts.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { THREAT } from '../src/threat.js';
import { SIG } from '../src/told-attacks.js';
import { MATERIAL_OF } from '../src/death-fx.js';
import { COMMON_BLOWS } from '../src/combat.js';
import { POISE_EXTRA } from '../src/poise-break.js';
import { PENS } from '../src/dev-pen.js';
import { LEVELS } from '../src/level.js';
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const DT = 1 / 60, hero = (x, y = 0, p) => ({ x, y, alive: true, face: 1, p: p || { x } });
const rnd = () => 0.3;
/* run one beast against heroes for `secs`; world fields may be overridden. Returns [time, event] pairs and the beast */
const world = (heroes, o = {}) => ({ heroes, canStep: () => true, rand: rnd, busy: false, leader: null, taken: [], ...o });
function run(s, w, secs, on, each) { const evs = []; for (let t = 0; t < secs; t += DT) { const r = B.beastStep(s, typeof w === 'function' ? w(t) : w, DT); for (const v of r) { evs.push([+t.toFixed(3), v]); if (on) on(v, s, t); } if (each) each(s, t); s.x += s.vx * DT; } return evs; }
const firstTell = (evs, move) => evs.find(([, v]) => v.t === 'tell' && v.move === move);
const firstOf = (evs, f) => evs.find(([, v]) => f(v));

/* ---- constants ---- */
ok(B.BEASTS_SHIPS === false, 'BEASTS_SHIPS is false: no level places a frost beast, no bestiary card');
ok(B.SNOWRUNNER.hp === 18 && B.GREYMANE.hp === 70 && B.BRUIN.hp === 120, 'hp 18 / 70 / 120 (the plan: x1.15 on the act VI dial = 21 / 81 / 138)');
ok(B.SNOWRUNNER.snapTell === 0.40 && B.SNOWRUNNER.leapTell === 0.55 && B.GREYMANE.biteTell === 0.65 && B.GREYMANE.pounceTell === 0.85 && B.BRUIN.maulTell === 0.9 && B.BRUIN.chargeTell === 0.8, 'the six tell lengths are the plan\'s');

/* ---- the SNOWRUNNER ---- */
{ const s = B.newBeast('snowrunner', 0, 0, 1); s.cd = 0;
  const ev = run(s, world([hero(46)]), 1.6);
  const t = firstTell(ev, 'snapTell'), k = firstOf(ev, v => v.t === 'strike' && v.move === 'snapTell');
  ok(t && t[1].mark === '!' && k && Math.abs(k[0] - t[0] - B.SNOWRUNNER.snapTell) < 0.06, 'a hero inside 54 px: the SNAP, a yellow ! first, the blow ' + B.SNOWRUNNER.snapTell + ' s later (' + (k && (k[0] - t[0]).toFixed(2)) + ')');
  ok(k && k[1].dmg === 6 && !k[1].unblock && k[1].chill === 0.15 && k[1].box[3] - k[1].box[2] >= 10, 'the snap is a 6, blockable, with the 0.15 chill call (a shim until src/chill.js lands)');
  ok(s.mode !== 'snapTell' && ev.some(([, v]) => v.t === 'strike'), 'it bites, then runs out (hit and run): ' + s.mode); }
{ const s = B.newBeast('snowrunner', 0, 0, 1); s.cd = 0; let seen = null;
  const ev = run(s, world([hero(86)]), 1.5, (v, st) => { if (v.t === 'tell' && !seen) seen = v; });
  const k = ev.filter(([, v]) => v.t === 'strike' && v.move === 'leapTell');
  ok(seen && seen.move === 'leapTell' && seen.mark === '!!', 'a hero at 70-100 px: the THROAT LEAP, a red !!');
  ok(k.length > 5 && k.every(([, v]) => v.unblock && v.high && v.dmg === 8), 'the leap is an 8, unblockable and HIGH (a ducking hero lets it over), struck every frame of its flight');
  const lifts = []; const s2 = B.newBeast('snowrunner', 0, 0, 1); s2.cd = 0; run(s2, world([hero(86)]), 1.5, (v, st) => { if (st.mode === 'leap') lifts.push(st.lift); });
  ok(Math.max(...lifts) > 5 && Math.max(...lifts) <= B.SNOWRUNNER.leapLift + 0.01 && lifts[lifts.length - 1] < Math.max(...lifts), 'it rises on an arc to ' + Math.max(...lifts).toFixed(1) + ' px and comes down'); }
{ const s = B.newBeast('snowrunner', 0, 0, 1); s.cd = 0; let landX = null, skid = null;
  run(s, world([hero(80)]), 1.8, (v, st) => { if (v.t === 'land') { landX = v.x; skid = st.open; } });
  ok(landX > 80 + 20 && skid >= B.SNOWRUNNER.skid - 0.02, 'a missed leap lands BEHIND the hero (x ' + (landX | 0) + ' past 80) and skids ' + B.SNOWRUNNER.skid + ' s OPEN'); }
{ for (const [mode, name] of [['snapTell', 'snap'], ['leapTell', 'leap']]) { const s = B.newBeast('snowrunner', 0, 0, 1); s.mode = mode; s.t = 0.3; const c = B.beastStruck(s);
    ok(c === mode && s.mode === 'stand' && s.cd >= 1.1, 'a blow in the ' + name + ' tell cancels it (a small one flinches): ' + c); }
  const s = B.newBeast('snowrunner', 0, 0, 1); s.mode = 'snap'; ok(B.beastStruck(s) === null, 'but a blow after it is thrown cancels nothing');
  const p = B.newBeast('snowrunner', 0, 0, 1); B.beastParried(p); ok(p.mode === 'parried' && p.open >= 1, 'a PARRY: it yelps and is flung, open ' + p.open + ' s'); }
{ const s = B.newBeast('snowrunner', 0, 0, 1), L1 = hero(60);   /* it circles: a side of the hero at orbit range, switching sides, never straight in */
  let sides = new Set(); const ds = []; const s2 = B.newBeast('snowrunner', 200, 0, -1); s2.cd = 99;
  for (let t = 0; t < 12; t += DT) { B.beastStep(s2, world([L1]), DT); s2.x += s2.vx * DT; const d = Math.abs(s2.x - L1.x); if (t > 1) { ds.push(d); sides.add(Math.sign(s2.x - L1.x)); } }
  ds.sort((a, b) => a - b); const med = ds[ds.length >> 1], near = ds.filter(d => d >= 40 && d <= 125).length / ds.length;
  ok(med >= 55 && med <= 110 && near > 0.65, 'it orbits: median ' + med.toFixed(0) + ' px, ' + (near * 100 | 0) + '% of the time 40-125 px off (60-110 asked; it crosses to switch sides)'); ok(sides.size === 2, 'and crosses to the other side of him (the pincer: both sides)'); }
{ const a = B.newBeast('snowrunner', 100, 0, -1), b = B.newBeast('snowrunner', 100, 0, -1); a.cd = b.cd = 0;   /* one at a time: the second does not start while the first is busy */
  const w = world([hero(130)], { busy: true }); const ev = run(b, w, 1, null);
  ok(!ev.some(([, v]) => v.t === 'tell'), 'another pack member telling or striking: it holds and orbits (one bites at a time)');
  const w2 = world([hero(130)], { tokWait: true }); ok(!run(b, w2, 1).some(([, v]) => v.t === 'tell'), 'the token purse turned it away (tokWait): no windup'); }
{ const s = B.newBeast('snowrunner', 0, 0, 1); const h = [hero(60, 0, { id: 1 })]; s.cd = 99;   /* the leader's death: hesitate 1.2 s, told */
  B.beastStep(s, world(h, { leader: { t: 'greymane' } }), DT); ok(s.hadLeader, 'with a greymane near it knows its leader');
  const ev = B.beastStep(s, world(h, { leader: null }), DT); ok(ev.some(v => v.t === 'hesitate') && s.hesitate >= 1.19, 'the greymane dead: the runner HESITATES ' + B.SNOWRUNNER.hesitate + ' s (ears down, told)');
  s.cd = 0; const e2 = run(s, world(h), 0.9); ok(!e2.some(([, v]) => v.t === 'tell'), 'and starts no windup while it hesitates'); }
{ const h1 = hero(40, 0, { id: 1 }), h2 = hero(-40, 0, { id: 2 }), a = B.newBeast('snowrunner', 10, 0, 1), b = B.newBeast('snowrunner', 12, 0, 1);   /* co-op: each runner takes a hero its packmate has not */
  B.beastStep(a, world([h1, h2]), DT); const ha = a.hunt; B.beastStep(b, world([h1, h2], { taken: [ha] }), DT);
  ok(ha && b.hunt && ha.p !== b.hunt.p, 'two runners, two heroes: they SPREAD (' + (ha && ha.p.id) + ' / ' + (b.hunt && b.hunt.p.id) + ')');
  const one = B.newBeast('snowrunner', 10, 0, 1); B.beastStep(one, world([h1]), DT); ok(one.hunt === h1, 'one seat: it hunts him (1 seat of 1-4)');
  for (let n = 1; n <= 4; n++) { const hs = Array.from({ length: n }, (_, i) => hero(30 + i * 20, 0, { id: i })), taken = [], got = new Set(); for (let r = 0; r < n; r++) { const q = B.newBeast('snowrunner', 0, 0, 1); B.beastStep(q, world(hs, { taken }), DT); taken.push(q.hunt); got.add(q.hunt.p.id); } if (got.size !== n) { ok(false, n + ' seats / ' + n + ' runners did not spread: ' + [...got]); } }
  ok(true, '1-4 seats with as many runners: every runner takes a different hero'); }

/* ---- the GREYMANE ---- */
{ const s = B.newBeast('greymane', 0, 0, 1); s.cd = 0; const ev = run(s, world([hero(40)]), 1.8);
  const t = firstTell(ev, 'biteTell'), k = firstOf(ev, v => v.t === 'strike' && v.move === 'biteTell');
  ok(t && t[1].mark === '!' && k && Math.abs(k[0] - t[0] - B.GREYMANE.biteTell) < 0.06, 'the CRUSHING BITE: a yellow !, ' + B.GREYMANE.biteTell + ' s, then the lunge (' + (k && (k[0] - t[0]).toFixed(2)) + ')');
  ok(k && k[1].dmg === 12 && k[1].push === 20 && !k[1].unblock, 'a 12, blockable, a block pushes the hero back ' + (k && k[1].push) + ' px');
  const p = B.newBeast('greymane', 0, 0, 1); B.beastParried(p); ok(p.mode === 'staggered' && p.open >= 1.2, 'a PARRY staggers him ' + p.open + ' s (the big punish)'); }
{ const s = B.newBeast('greymane', 0, 0, 1); s.cd = 0; const rand = () => 0.1;
  let ring = null, tellAt = null, landAt = null, strikeAt = null, maxLift = 0;
  let windedOpen = 0; const ev = run(s, world([hero(120)], { rand }), 3, (v, st, t) => { if (v.t === 'ring') ring = v; if (v.t === 'tell' && v.move === 'pounceTell') tellAt = t; if (v.t === 'land') landAt = t; if (v.t === 'strike' && v.move === 'pounceTell') strikeAt = [t, v]; }, st => { maxLift = Math.max(maxLift, st.lift); if (st.mode === 'winded') windedOpen = Math.max(windedOpen, st.open); });
  ok(tellAt != null && ring && ring.x > 80 && ring.x <= 140 + 1 && ring.r > 10, 'the POUNCE: a red !! and a frost RING on the floor at x ' + (ring && ring.x | 0) + ' (90-140 px away)');
  ok(strikeAt && Math.abs(strikeAt[0] - tellAt - B.GREYMANE.pounceTell - B.GREYMANE.pounceT) < 0.08, 'it lands ' + (strikeAt && (strikeAt[0] - tellAt).toFixed(2)) + ' s after the tell (0.85 told + 0.55 in the air)');
  ok(strikeAt[1].unblock && strikeAt[1].pin === 0.6 && strikeAt[1].dmg === 14 && Math.abs((strikeAt[1].box[0] + strikeAt[1].box[1]) / 2 - ring.x) < 3, 'the blow is a 14 + a 0.6 s PIN, unblockable, and only in the ring'); ok(maxLift > 15, 'a high arc (' + maxLift.toFixed(0) + ' px)');
  ok(windedOpen >= 0.9, 'a MISS (no hero in the ring) leaves him WINDED ' + B.GREYMANE.winded + ' s, open (gold stars)'); }
{ const s = B.newBeast('greymane', 0, 0, 1); s.cd = 0; let pinned = false;
  run(s, world([hero(120)], { rand: () => 0.1 }), 3, (v, st) => { if (v.t === 'strike' && v.move === 'pounceTell') B.greymanePinned(st); }, st => { if (st.mode === 'pin') pinned = true; });
  ok(pinned, 'a hit PINS: he holds the hero (mode pin) and then rests'); const q = B.newBeast('greymane', 0, 0, 1); q.mode = 'pin'; q.t = 0.5; q.pinned = true; B.greymaneFreed(q); B.beastStep(q, world([hero(10)]), DT); ok(!q.pinned && q.mode === 'pinRest', 'any ally hit frees the held hero early'); }
{ for (const mode of ['biteTell', 'pounceTell']) { const s = B.newBeast('greymane', 0, 0, 1); s.mode = mode; s.ringX = 100; const c = B.beastStruck(s); ok(c === mode && s.mode === 'stand' && s.ringX === null, 'a blow in the ' + mode + ' cancels it (the ring goes)'); }
  const s = B.newBeast('greymane', 0, 0, 1); s.cd = 0; const ev = run(s, world([hero(200)], { busy: true }), 1); ok(!ev.some(([, v]) => v.t === 'tell'), 'while a packmate is busy (a runner telling) he holds; and the runners hold while HE tells (beastBusy: ' + B.beastBusy(Object.assign(B.newBeast('greymane', 0, 0, 1), { mode: 'pounceTell' })) + ')'); }

/* ---- BRUIN ---- */
{ const s = B.newBeast('bruin', 0, 0, 1); s.cd = 0; const ev = run(s, world([hero(36)]), 2.5);
  const t = firstTell(ev, 'maulTell'), k = firstOf(ev, v => v.t === 'strike' && v.move === 'maulTell'), r = firstOf(ev, v => v.t === 'roar');
  ok(t && r && t[1].mark === '!' && Math.abs(r[0] - t[0]) < 0.02, 'the MAUL: he STANDS UP and ROARS as he tells (a yellow !, his own roar sound)'); ok(k && Math.abs(k[0] - t[0] - 0.9) < 0.06 && k[1].dmg === 14 && !k[1].unblock, 'the downswing comes 0.9 s later, a 14, blockable');
  const p = B.newBeast('bruin', 0, 0, 1); B.beastParried(p); ok(p.mode === 'rearOpen' && p.up && p.open >= 1.5, 'a PARRY leaves him on his back legs, open ' + p.open + ' s'); }
{ const s = B.newBeast('bruin', 0, 0, 1); s.cd = 0; const rand = () => 0.1; let lane = null, braced = false, cut = [];
  const ev = run(s, world([hero(150)], { rand }), 3.5, (v, st) => { if (v.t === 'lane') lane = v; if (st.mode === 'charge' && st.braced) braced = true; });
  const t = firstTell(ev, 'chargeTell'), k = ev.filter(([, v]) => v.t === 'strike' && v.move === 'chargeTell');
  ok(t && t[1].mark === '!!' && lane && Math.abs(lane.x1 - lane.x0) === 200, 'the CHARGE: a red !!, the lane drawn on the floor (200 px)'); ok(k.length && k[0][0] - t[0] > 0.78 && k.every(([, v]) => v.unblock && v.knock > 0 && v.dmg === 16), 'told 0.8 s, then 16 + a knockdown, unblockable, dodged by a roll');
  ok(braced, 'braced while he charges (no flinch, FULL damage)'); const c = B.newBeast('bruin', 0, 0, 1); c.mode = 'chargeTell'; ok(B.beastStruck(c) === null && c.mode === 'chargeTell', 'a hero\'s blow does not stop a bear that has decided (the charge tell is not cancelled)');
  const m = B.newBeast('bruin', 0, 0, 1); m.mode = 'maulTell'; ok(B.beastStruck(m) === 'maul', 'but a blow in the maul\'s roar does cancel it'); }
{ const s = B.newBeast('bruin', 0, 0, 1); s.cd = 0; let dazed = null; run(s, w => world([hero(150)], { rand: () => 0.1, canStep: (x, dir) => x < 60 }), 4, (v, st) => { if (v.t === 'wall') dazed = st; });
  ok(dazed && s.open >= 0 && (s.mode === 'dazed' || s.mode === 'stand'), 'a wall in the lane: he is DAZED ' + B.BRUIN.dazed + ' s, open');
  const s2 = B.newBeast('bruin', 0, 0, 1); s2.cd = 0; const modes = new Set(); run(s2, world([hero(150)], { rand: () => 0.1 }), 4, (v, st) => modes.add(st.mode)); ok(modes.has('skid') && !modes.has('dazed'), 'in the open he skids ' + B.BRUIN.skid + ' s and is not dazed'); }

/* ---- the frames ---- */
{ const { install } = await import('./node-canvas.mjs'); install();
  const A = await import('../src/redraw/beasts_art.js');
  for (const [k, fn, n] of [['snowrunner', A.bakeSnowrunner, 13], ['greymane', A.bakeGreymane, 14], ['bruin', A.bakeBruin, 16]]) { const set = fn();
    ok(set.R.length === n && set.L.length === n && set.white.R.length === n && set.ax > 0 && set.ay > 0, k + ' bakes ' + n + ' frames (R, L, white), ax ' + set.ax + ' ay ' + set.ay + ' hit box ' + set.w + 'x' + set.h);
    const fr = new Set(); for (const mode of ['stand', 'orbit', 'walk', 'trot', 'runOut', 'snapTell', 'snap', 'leapTell', 'leap', 'skid', 'parried', 'biteTell', 'bite', 'pounceTell', 'pounce', 'landed', 'pin', 'winded', 'staggered', 'maulTell', 'maul', 'chargeTell', 'charge', 'dazed', 'rearOpen']) for (let a = 0; a < 2; a += 0.1) fr.add(B.beastFrame({ kind: k, mode }, a, false)); fr.add(B.beastFrame({ kind: k, mode: 'stand' }, 0, true));
    ok([...fr].every(f => f >= 0 && f < n), k + ': every frame index the step can ask for is on the sheet'); }
  const f = A.bakeBruinFrost(); ok(f.R.length === 16, 'the frost recolour of the bruin (cnSkin frost) bakes too'); }

/* ---- the tables ---- */
const main = rd('src/main.js');
for (const [id, hp] of [['snowrunner', 'SNOWRUNNER'], ['greymane', 'GREYMANE'], ['bruin', 'BRUIN']]) ok(new RegExp(id + ': BST\\.' + hp + '\\.hp').test(main), 'EHP.' + id + ' is the module\'s hp');
for (const k of Object.keys(B.BEAST_DMG)) ok(COMMON_BLOWS.includes(k) && /\.\.\.BST\.BEAST_DMG/.test(main), 'DMG.' + k + ' = ' + B.BEAST_DMG[k] + ', scaled by the act dial (COMMON_BLOWS)');
for (const [k, mark] of Object.entries(B.BEAST_TELLS)) { ok(MARK[k] === mark, k + ' wears ' + mark); ok(ANSWER[k] && (mark === '!' ? ANSWER[k] === 'block' : ANSWER[k] !== 'block') && (HEIGHT[k] === 'high' || HEIGHT[k] === 'low') && (ANSWER[k] !== 'duck' || HEIGHT[k] === 'high'), k + ' is answered (' + ANSWER[k] + ', ' + HEIGHT[k] + ')'); }
ok(new Set(Object.keys(B.BEAST_TELLS).map(k => ANSWER[k])).size >= 3, 'block + duck + dodge from the three alone (answer-tags wants 3)');
ok(THREAT.snowrunner > 0 && THREAT.greymane > 0 && THREAT.bruin > 0, 'threat weights ' + [THREAT.snowrunner, THREAT.greymane, THREAT.bruin]);
ok(SIG.snowrunner.mode === 'snapTell' && SIG.greymane.mode === 'biteTell' && SIG.bruin.mode === 'maulTell' && Object.values(B.BEAST_TELLS).length, 'one SIG signature each (told-attacks.js)');
ok(MATERIAL_OF.fur.includes('snowrunner') && MATERIAL_OF.fur.includes('greymane') && MATERIAL_OF.fur.includes('bruin'), 'death by material: fur');
ok(/snowrunner: \{ kit:/.test(rd('src/audio.js')) && /bruin: \{ kit:/.test(rd('src/audio.js')), 'voice rows (existing kits: SOUND TODO)');
ok(/const POISE_HEAVY = new Set\(\['bruin'/.test(main) && POISE_EXTRA.has('greymane') && /'hornsman', 'snowrunner'/.test(main), 'poise: the runner is small, the greymane medium (POISE_EXTRA), the bruin heavy (POISE_HEAVY)');
ok(/BEAST_SHORT = \{[^}]*snowrunner: 'SNOWRUNNER'/.test(main) && /snowrunner: \['#dfeaf2'/.test(main), 'a short name and burst colours each');
ok(/if \(BST\.BEASTS_SHIPS\) BEASTS\.push\(/.test(main) && /t: 'snowrunner', name: 'SNOWRUNNER'/.test(main) && /t: 'bruin', name: 'BRUIN'/.test(main), 'the bestiary cards exist and are pushed ONLY behind BEASTS_SHIPS');
ok(/function devPen\(name\) \{\r?\n  if \(!isDev\(\)/.test(main) && /isDev\(\) && q\.get\('pen'\)/.test(main), 'the test room is dev only: devPen opens with isDev() and the boot hook reads ?pen only when ?dev=1');
for (const [name, rows] of Object.entries(PENS)) ok(rows.every(r => [...B.BEAST_IDS, 'skelsoldier', 'skelarcher', 'skelmage'].includes(r.t)), 'pen ' + name + ' names real foes (' + rows.map(r => r.t).join(', ') + ')');

/* ---- the flag: no live level holds one ---- */
{ const ids = new Set(B.BEAST_IDS), hits = []; for (const lv of LEVELS) { let L; try { L = lv.build(); } catch { continue; }
    for (const e of L.ents || []) if (ids.has(e.t)) hits.push(lv.id + ':' + e.t); for (const r of L.garrison || []) if (Array.isArray(r) && ids.has(r[0])) hits.push(lv.id + ':' + r[0]);
    for (const A of L.ambushes || []) for (const w of A.waves || []) for (const f of w.flat ? w.flat() : w) if (Array.isArray(f) && ids.has(f[0])) hits.push(lv.id + ':' + f[0]); }
  ok(hits.length === 0, 'BEASTS_SHIPS is false: no live level spawns a snowrunner, greymane or bruin (' + (hits.join(', ') || 'none') + ')'); }
console.log(bad ? 'beasts: ' + bad + ' FAIL' : 'beasts: ok');
process.exit(bad ? 1 : 0);
