// tools/church3-foes.mjs - THE ORDER / UNDEAD PALADIN and THE UNDEAD PRIEST (claude/church3). Node only: the pure AIs in a fake world. What it holds:
//   - one AI, two skins: the living order paladin's divine shield turns everything (the Crusader family's exception) and OFFERS THE GLEAM; the undead's is cracked (>= 0.4x, B15)
//   - the break: a PARRY on the gleamed strike shatters it (a plain block does not); a flame in the striking hand cracks the undead's; shattered it is whole, staggered (B4), then a told mend
//   - every move its own windup + release frame (B16) and its mark in src/marks.js; the gleam comes at least every OPL.gleam.maxGap s while he fights
//   - the undead priest raises (capped), mends the dead, snuffs a light in his reach, bolts (told !), a blow cuts a cast, and a FLAME near him breaks his cast and he flees
//   - they stand in the Lit Church (crypt) and the reuse list names them; the bestiary has all three
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as OPF from '../src/order-paladin.js';
import * as UPF from '../src/undead-priest.js';
import { BY_HAND, ANSWER } from '../src/marks.js';
import { FIGHT } from '../src/flame.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), lc = readFileSync(new URL('../src/lit-church.js', import.meta.url), 'utf8');
const mkX = (o = {}) => { const X = { said: [], marks: [], strikes: [], raised: [], mended: [], snuffed: [], heroes: () => X.H, H: [{ x: 100, y: 200, dead: false }], foes: () => X.F, F: [], undead: q => q.t === 'wight' || q.t === 'deadpaladin', maxOf: q => q.maxHp0 || q.hp,
  number: (x, y, s) => X.said.push(s), mark: (e, m) => X.marks.push(m), sfx: {}, burst() {}, fall() {}, walk: (e, dx) => { e.x += dx; return Math.abs(dx); }, solid: () => false,
  strike: (e, b, d, name, q) => { X.strikes.push({ name, d }); return X.res || null; }, flameNear: () => X.flame || null, raise: (e, x) => { const w = { t: 'wight', x, y: e.y, alive: true, hp: 30 }; X.raised.push(w); X.F.push(w); return w; },
  mend: (q, k) => { X.mended.push(q); q.hp = Math.min(X.maxOf(q), q.hp + X.maxOf(q) * k); }, lights: () => X.L || [], snuff: id => { X.snuffed.push(id); return true; }, ...o }; return X; };
const run = (fn, e, X, secs) => { for (let i = 0; i < secs * 60; i++) fn(e, 1 / 60, X); };

/* ---------- THE PALADIN FOE ---------- */
const pal = t => OPF.newPaladinFoe({ t, x: 130, y: 200, hp: OPF.OPL.hp[t], alive: true, face: -1 });
{ const X = mkX(), L = pal('orderpaladin'), U = pal('deadpaladin');
  ok(OPF.takePaladinFoe(L, 40, X) === 0 && OPF.takePaladinFoe(U, 40, X) === Math.round(40 * OPF.OPL.cracked) && OPF.OPL.cracked >= 0.4, 'ONE AI, TWO SKINS: the living paladin\'s divine shield turns everything (x0, the Crusader family\'s exception), the undead\'s is CRACKED (x' + OPF.OPL.cracked + ', B15)');
  ok(OPF.takePaladinFoe(L, 40, X, { flame: true }) === 0 && L.shield === 1, '(a flame does not crack the LIVING shield - it is holy too)');
  ok(OPF.takePaladinFoe(U, 40, X, { flame: true }) === 40 && U.shield === 0 && U.opl.flameBreaks === 1 && X.said.some(s => /FLAME CRACKS/.test(s)), 'a blow struck with a FLAME IN THE HAND cracks the undead\'s shield open (src/flame.js: the church\'s taper) - and that blow lands whole');
  ok(OPF.takePaladinFoe(U, 40, X) === 40, 'shattered, his blows land whole'); }
{ const X = mkX(), e = pal('deadpaladin'); let gleams = 0, t = 0; const seen = new Set();
  for (let i = 0; i < 60 * 30; i++) { OPF.stepPaladinFoe(e, 1 / 60, X); seen.add(e.mode); if (e.mode === 'gleamTell' && e.modeT > OPF.OPL.gleam.tell - 1 / 59) gleams++; X.H[0].x = e.x - 24; }
  ok(seen.has('bashTell') && seen.has('gleamTell') && gleams >= 30 / (OPF.OPL.gleam.maxGap + OPF.OPL.gleam.tell + OPF.OPL.cd[1]) - 1, 'he fights: the shield bash and THE GLEAM, offered at least every ' + OPF.OPL.gleam.maxGap + ' s (' + gleams + ' in 30 s)');
  ok(X.marks.length && X.marks.every(m => m === '!') && X.said.some(s => /GLEAM/.test(s)), 'both are told (yellow !: a shield turns them) and the gleam names its answer: PARRY IT'); }
{ const X = mkX(), e = pal('deadpaladin'); e.mode = 'gleam'; e.modeT = 0.2; X.res = 'block'; OPF.stepPaladinFoe(e, 1 / 60, X); ok(e.shield === 1, 'a plain BLOCK of the gleamed strike breaks nothing');
  const f = pal('orderpaladin'); f.mode = 'gleam'; f.modeT = 0.2; X.res = 'parry'; OPF.stepPaladinFoe(f, 1 / 60, X);
  ok(f.shield === 0 && f.mode === 'shattered' && f.brokenT > 0 && f.opl.parryBreaks === 1 && X.said.some(s => /SHATTERS/.test(s)), 'a PARRY on the gleam SHATTERS the shield (living too): whole, told');
  const x0 = f.x; run(OPF.stepPaladinFoe, f, X, OPF.OPL.stun - 0.05); ok(Math.abs(f.x - x0) < 0.01, 'shattered he is staggered still (B4) for ' + OPF.OPL.stun + ' s');
  run(OPF.stepPaladinFoe, f, X, OPF.OPL.broken); ok(f.mode === 'mend' || f.shield === 1, 'then a told MEND (the light creeps back)'); run(OPF.stepPaladinFoe, f, X, OPF.OPL.mendT + 0.1); ok(f.shield === 1 && X.said.some(s => /STANDS AGAIN/.test(s)), 'and the shield stands again'); }
{ const fr = m => OPF.oplFrame({ mode: m }); const pairs = [[fr('bashTell'), fr('bash')], [fr('gleamTell'), fr('gleam')]]; const all = pairs.flat();
  ok(new Set(all).size === all.length && all.every(f => f > 0 && f < OPF.FRAMES - 1) && fr('shattered') !== fr('mend'), 'every move its own windup + release frame (B16): ' + JSON.stringify(pairs)); }
for (const t of ['orderpaladin', 'deadpaladin']) for (const [m, mv] of Object.entries(OPF.MOVES)) ok(BY_HAND[t + '|' + m] === mv.mark && ANSWER[t + '|' + m] === mv.answer, t + ' ' + m + ' wears ' + mv.mark + ' in src/marks.js');

/* ---------- THE UNDEAD PRIEST ---------- */
const pri = () => UPF.newDeadPriest({ t: 'deadpriest', x: 220, y: 200, hp: UPF.UPR.hp, alive: true, face: -1 });
{ const X = mkX(), e = pri(); let t = 0; while (!X.raised.length && t < 6) { UPF.stepDeadPriest(e, 1 / 60, X); t += 1 / 60; }
  ok(X.raised.length === 1 && X.said.some(s => /RAISES THE DEAD/.test(s)), 'he RAISES THE DEAD (a told rite: the word, his own pose)');
  e.raiseCd = 0; e.mode = 'keep'; e.modeT = 0; e.raised.push({ alive: true }, { alive: true }); UPF.stepDeadPriest(e, 1 / 60, X); ok(e.mode !== 'raiseTell', 'at most ' + UPF.UPR.raise.cap + ' of his up at once'); }
{ const X = mkX(), e = pri(); e.raiseCd = 99; const w = { t: 'wight', x: 240, y: 200, alive: true, hp: 10, maxHp0: 40 }; X.F.push(w); let t = 0; while (!X.mended.length && t < 6) { UPF.stepDeadPriest(e, 1 / 60, X); t += 1 / 60; }
  ok(X.mended.includes(w) && w.hp > 10, 'he MENDS his dead (told)'); }
{ const X = mkX(), e = pri(); e.raiseCd = 99; e.mendCd = 99; X.L = [{ id: 'candleB', x: 260 }]; let t = 0; while (!X.snuffed.length && t < 6) { UPF.stepDeadPriest(e, 1 / 60, X); t += 1 / 60; }
  ok(X.snuffed[0] === 'candleB', 'he SNUFFS a light in his reach (more dark, more dead)'); }
{ const X = mkX(), e = pri(); e.raiseCd = 99; e.mendCd = 99; e.snuffCd = 99; e.boltCd = 0; let t = 0; while (e.mode !== 'boltTell' && t < 4) { UPF.stepDeadPriest(e, 1 / 60, X); t += 1 / 60; }
  ok(e.mode === 'boltTell' && X.marks.includes('!'), 'the GRAVE BOLT is told (yellow !)'); run(UPF.stepDeadPriest, e, X, 1.4); ok(X.strikes.some(s => s.name === UPF.NAME.bolt), 'and it flies at you'); }
{ const X = mkX(), e = pri(); e.mode = 'raiseTell'; e.modeT = 1; UPF.takeDeadPriest(e, 10, X); ok(e.mode === 'keep' && e.upr.cut === 1, 'a blow that lands CUTS a cast'); }
{ const X = mkX(), e = pri(); e.mode = 'raiseTell'; e.modeT = 1; X.flame = { x: 180, y: 200 }; const x0 = e.x; UPF.stepDeadPriest(e, 1 / 60, X);
  ok(e.mode === 'flee' && e.upr.cut === 1 && X.said.some(s => /FLEES/.test(s)), 'A FLAME NEAR HIM (src/flame.js FIGHT.scare ' + FIGHT.scare + ' px): his cast breaks off and he FLEES');
  run(UPF.stepDeadPriest, e, X, 1); ok(e.x > x0 + 30, '(away from the flame: ' + Math.round(e.x - x0) + ' px)'); const r0 = X.raised.length; run(UPF.stepDeadPriest, e, X, 3); ok(X.raised.length === r0 && !/Tell$/.test(e.mode), 'and casts nothing while it is near'); }
{ const fr = m => UPF.uprFrame({ mode: m }); const pairs = [['boltTell', 'bolt'], ['raiseTell', 'raise'], ['mendTell', 'mend'], ['snuffTell', 'snuff']].map(([a, b]) => [fr(a), fr(b)]), all = pairs.flat();
  ok(new Set(all).size === all.length && all.every(f => f > 0 && f < UPF.FRAMES - 1), 'every cast its own windup + release frame (B16): ' + JSON.stringify(pairs)); }
for (const [m, mv] of Object.entries(UPF.MOVES)) ok(BY_HAND['deadpriest|' + m] === mv.mark && (!mv.answer || ANSWER['deadpriest|' + m] === mv.answer), 'deadpriest ' + m + ' wears ' + (mv.mark || 'no mark') + ' in src/marks.js');

/* ---------- PLACED, AND IN THE BOOK ---------- */
ok((lc.match(/ent\('deadpaladin'/g) || []).length >= 2 && (lc.match(/ent\('deadpriest'/g) || []).length >= 2, 'THE LIT CHURCH\'s crypt has them: two undead paladins and two undead priests');
for (const t of ['orderpaladin', 'deadpaladin', 'deadpriest']) ok(new RegExp("\\{ t: '" + t + "', name: ").test(main) && new RegExp('SPR\\.' + t + ' = C3A\\.bakeSet').test(main) && new RegExp(t + ": '").test(main), t + ': a bestiary card, a sheet (greybox) and a short name');
console.log('ok  church3-foes  ' + n + ' checks: one AI two skins (whole / cracked divine shield), the gleam and its parry, the flame cracks the undead, B4 stagger then a told mend, the undead priest (raise capped, mend, snuff, the bolt, a blow cuts a cast, a flame breaks it and he flees), B16 frames, marks, placed + carded');
