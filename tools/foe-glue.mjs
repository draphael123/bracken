// tools/foe-glue.mjs - PACK GLUE (claude/lategameb; src/foe-glue.js). Static, no browser: the stance machine, the starters, the recall line, hold fire and the pin shot are driven
// against a stub world; main.js's hooks and the marks are checked as text. Run: node tools/foe-glue.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as GL from '../src/foe-glue.js';
const bad = [], must = (ok, msg) => { if (!ok) bad.push(msg); };
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const say = [], sfx = [], pushed = [];
const api = { act: () => 3, safeStep: () => true, move: (e, dx) => { e.x += dx; }, fall: () => ({ ground: true }), say: (e, w) => say.push(w), sfx: k => sfx.push(k), seed: s => pushed.push(s) };
const mk = (t, x, o) => ({ t, x, y: 100, w: 10, h: 18, alive: true, face: 1, hp: 30, mode: 'walk', stagger: 0, vx: 0, vy: 0, cd: 0, ...o });
const hero = (x, o) => ({ x, y: 100, dead: false, ...o });
const run = (enemies, heroes, seconds, o = {}) => { for (let t = 0; t < seconds; t += 1 / 60) { GL.frame({ heroes, enemies, seeds: o.seeds || [], dt: 1 / 60, time: (o.t0 || 0) + t, api: o.api || api });
  for (const e of enemies) GL.hold(e, GL.nearestHero(heroes, e), 1 / 60, o.api || api); } };

/* ---- PLATE STEP: a tideguard covers a winding scout when the hero closes ---- */
{ const g = mk('tideguard', 200, { face: -1 }), s = mk('scout', 250, { mode: 'aim' }), h = hero(100), all = [g, s]; say.length = 0;
  run(all, [h], 0.1);
  must(g.glS && g.glS.kind === 'plate', 'PLATE STEP: the tideguard starts a stance beside a winding scout with the hero closing');
  must(say.includes('PLATE STEP'), 'PLATE STEP is said (a word over it)');
  const tx = g.glS ? g.glS.tx : 0; must(Math.abs(tx - (s.x - GL.GLUE.plate.gap)) < 1, 'it steps to the hero side of the scout (' + tx + ')');
  run(all, [h], 1.0); must(g.glS && g.glS.ph === 'hold' && Math.abs(g.x - tx) < 4, 'it reaches the spot and PLANTS: ' + JSON.stringify(g.glS));
  must(GL.guarding(g), 'planted = guarding');
  must(GL.turns(g, false, true, api) === true && g.glClank > 0, 'a light cut off its front is turned (clank)');
  must(GL.turns(g, false, false, api) === false, 'a sweep (not "front") goes under');
  must(GL.take(g, 20, 0, false) === 4 && GL.take(g, 20, 0, true) === 20 && GL.take(g, 20, 999, false) === 20, 'a skill off the front lands at 0.2, a heavy / plunge whole, from behind whole');
  must(GL.take(g, 1, 0, false) >= 1, 'never to nothing');
  const g2 = JSON.parse(JSON.stringify(g)); Object.assign(g2, { glS: { ...g.glS } }); must(GL.turns(g2, true, true, api) === false && g2.glS.ph === 'rec' && g2.stagger > 0, 'a heavy blow BREAKS the stance (it reels, plate down)');
  run(all, [h], 2.5); must(!g.glS && g.glCd > 0, 'it ends: stance cleared, on a cooldown (' + g.glCd.toFixed(2) + ')');
  must(!GL.guarding(g), 'the guard is down once it ends'); }
/* recovery is an OPENING: while in 'rec' nothing is turned */
{ const g = mk('tideguard', 200), s = mk('scout', 250, { mode: 'aim' }), h = hero(100); run([g, s], [h], 0.1); run([g, s], [h], 1.0); g.glS.ph = 'rec'; must(GL.turns(g, false, true, api) === false, 'the recovery (plate down) turns nothing'); }
/* gates: act, elite, hero far, no partner, ledge */
{ const mkp = o => { const g = mk('tideguard', 200, o), s = mk('scout', 250, { mode: 'aim' }); return [g, s]; };
  let a = mkp(); run(a, [hero(100)], 0.1, { api: { ...api, act: () => 2 } }); must(!a[0].glS, 'act II: no plate step (the gate)');
  a = mkp({ elite: true }); run(a, [hero(100)], 0.1); must(!a[0].glS, 'an elite never takes a stance');
  a = mkp(); run(a, [hero(600)], 0.1); must(!a[0].glS, 'a far hero: nothing');
  a = mkp(); a[1].mode = 'walk'; run(a, [hero(100)], 0.1); must(!a[0].glS, 'a scout not winding and the hero not on it: nothing');
  a = mkp(); run(a, [hero(100)], 0.1, { api: { ...api, safeStep: () => false } }); must(!a[0].glS, 'a ledge between: no step');
  a = mkp({ stagger: 0.5 }); run(a, [hero(100)], 0.1); must(!a[0].glS, 'a staggered tideguard does not start');
  a = mkp(); a[0].x = 20; run(a, [hero(100)], 0.1); must(!a[0].glS, 'hero past the spot: nothing'); }
/* staggered out of it */
{ const g = mk('tideguard', 200), s = mk('scout', 250, { mode: 'aim' }), h = hero(100); run([g, s], [h], 0.1); g.stagger = 0.6; GL.hold(g, h, 1 / 60, api); must(!g.glS, 'a stagger knocks it out of the stance'); }

/* ---- BRACE: a shield covers an archer's draw (act V) ---- */
{ const sh = mk('shield', 200), ar = mk('archer', 240, { draw: 0.5 }), h = hero(100); say.length = 0;
  run([sh, ar], [h], 0.1, { api: { ...api, act: () => 5 } });
  must(sh.glS && sh.glS.kind === 'brace' && sh.glS.ph === 'hold', 'BRACE: the shield plants where it stands at once');
  must(say.includes('BRACED'), 'BRACED is said');
  must(GL.turns(sh, false, true, api) && !GL.turns(sh, false, false, api), 'braced: a light cut off the front turned, a sweep goes under');
  run([sh, ar], [h], 3, { api: { ...api, act: () => 5 } }); must(!sh.glS, 'the brace ends');
  const sh2 = mk('shield', 200), ar2 = mk('archer', 240, { draw: 0.5 }); run([sh2, ar2], [hero(100)], 0.1, { api: { ...api, act: () => 4 } }); must(!sh2.glS, 'act IV: no brace (the gate is act V)');
  const sh3 = mk('shield', 200), ar3 = mk('archer', 150, { draw: 0.5 }); run([sh3, ar3], [hero(100)], 0.1, { api: { ...api, act: () => 5 } }); must(!sh3.glS, 'an archer on the HERO side of the shield: the shield is not between them');
  const sh4 = mk('shield', 200), ar4 = mk('archer', 240, { draw: 0 }); run([sh4, ar4], [hero(100)], 0.1, { api: { ...api, act: () => 5 } }); must(!sh4.glS, 'an archer not drawing: no brace'); }

/* ---- RECALL LINE: a missed harpoon is hauled back ---- */
{ GL.reset(); const sc = mk('scout', 250, { mode: 'throw' }), h = hero(100), seeds = [];
  const s = { x: 100, y: 95, vx: -200, vy: 0, jav: true, arrow: true, dead: false, owner: sc, life: 1 }; seeds.push(s); pushed.length = 0;
  GL.frame({ heroes: [h], enemies: [sc], seeds, dt: 1 / 60, time: 0, api });   /* tracked */
  s.x = 40; s.y = 100; GL.frame({ heroes: [h], enemies: [sc], seeds, dt: 1 / 60, time: 0.02, api });   /* flew past the hero's old place and sticks far from him */
  s.dead = true; seeds.length = 0; GL.frame({ heroes: [h], enemies: [sc], seeds, dt: 1 / 60, time: 0.04, api });
  must(GL.RECALLS.length === 1, 'RECALL: a missed harpoon starts a taut line (' + GL.RECALLS.length + ')');
  must(pushed.length === 0, 'the haul-back is not thrown at once (a told beat)');
  for (let t = 0; t < 0.6; t += 1 / 60) GL.frame({ heroes: [h], enemies: [sc], seeds, dt: 1 / 60, time: 0.1 + t, api });
  must(pushed.length === 1 && pushed[0].jav && pushed[0].arrow && pushed[0].glRecall && pushed[0].vx > 0 && pushed[0].owner === sc, 'then it hauls the harpoon back toward the scout, a real seed of its own: ' + JSON.stringify(pushed[0] && { vx: pushed[0].vx, jav: pushed[0].jav }));
  must(pushed[0] && pushed[0].life > 0.3 && pushed[0].life < 3, 'finite flight');
  GL.frame({ heroes: [h], enemies: [sc], seeds: [pushed[0]], dt: 1 / 60, time: 1, api }); pushed[0].dead = true;
  const before = GL.RECALLS.length; GL.frame({ heroes: [h], enemies: [sc], seeds: [], dt: 1 / 60, time: 1.1, api }); must(GL.RECALLS.length === before, 'the hauled harpoon is never recalled again (no chain)');
  /* a harpoon that struck the hero is spent */
  GL.reset(); const sc2 = mk('scout', 300), h2 = hero(100), t2 = { x: 102, y: 95, jav: true, arrow: true, dead: false, owner: sc2, life: 1 }; const sl = [t2];
  GL.frame({ heroes: [h2], enemies: [sc2], seeds: sl, dt: 1 / 60, time: 0, api }); t2.dead = true; GL.frame({ heroes: [h2], enemies: [sc2], seeds: [], dt: 1 / 60, time: 0.02, api }); must(GL.RECALLS.length === 0, 'a harpoon that struck or was parried at the hero is not recalled');
  /* a reflected one is the hero\'s */
  GL.reset(); const sc3 = mk('scout', 300), t3 = { x: 20, y: 95, jav: true, arrow: true, dead: false, owner: sc3, life: 1, reflected: true }; GL.frame({ heroes: [hero(100)], enemies: [sc3], seeds: [t3], dt: 1 / 60, time: 0, api }); t3.dead = true; GL.frame({ heroes: [hero(100)], enemies: [sc3], seeds: [], dt: 1 / 60, time: 0.02, api }); must(GL.RECALLS.length === 0, 'a reflected harpoon is not recalled');
  /* the scout killed while the line is taut: slack */
  GL.reset(); const sc4 = mk('scout', 300), t4 = { x: 20, y: 100, jav: true, arrow: true, dead: false, owner: sc4, life: 1 }; GL.frame({ heroes: [hero(100)], enemies: [sc4], seeds: [t4], dt: 1 / 60, time: 0, api }); t4.dead = true; GL.frame({ heroes: [hero(100)], enemies: [sc4], seeds: [], dt: 1 / 60, time: 0.02, api }); sc4.alive = false; pushed.length = 0;
  for (let t = 0; t < 0.7; t += 1 / 60) GL.frame({ heroes: [hero(100)], enemies: [sc4], seeds: [], dt: 1 / 60, time: 0.1 + t, api }); must(pushed.length === 0 && GL.RECALLS.length === 0, 'kill the scout and the line goes slack'); }
GL.reset();

/* ---- HOLD FIRE: the scout throws behind its front ---- */
{ const sc = mk('scout', 300, { cd: 0 }), td = mk('tideguard', 250), h = hero(100), all = [sc, td];
  GL.frame({ heroes: [h], enemies: all, seeds: [], dt: 1 / 60, time: 0, api }); must(sc.cd >= 0.15, 'HOLD FIRE: a scout with a tideguard NOT on the hero is held (cd ' + sc.cd + ')');
  td.x = 120; sc.cd = 0; GL.frame({ heroes: [h], enemies: all, seeds: [], dt: 1 / 60, time: 1, api }); must(sc.cd === 0, 'the tideguard on the hero: it throws');
  td.x = 250; sc.cd = 0; sc.glHold = 0; let held = 0; for (let t = 0; t < 6; t += 1 / 60) { sc.cd = Math.max(0, sc.cd - 1 / 60); GL.frame({ heroes: [h], enemies: all, seeds: [], dt: 1 / 60, time: 2 + t, api }); if (sc.cd > 0.1) held += 1 / 60; }
  must(held < GL.GLUE.holdFire.max + 0.3 && held > 1, 'never held longer than ' + GL.GLUE.holdFire.max + ' s (held ' + held.toFixed(2) + ')');
  const lone = mk('scout', 300, { cd: 0 }); GL.frame({ heroes: [h], enemies: [lone], seeds: [], dt: 1 / 60, time: 0, api }); must(lone.cd === 0, 'a lone scout throws as ever');
  const aim = mk('scout', 300, { cd: 0, mode: 'aim' }); GL.frame({ heroes: [h], enemies: [aim, td], seeds: [], dt: 1 / 60, time: 0, api }); must(aim.cd === 0, 'a throw already winding is never taken back'); }

/* ---- PIN SHOT ---- */
{ const ar = mk('archer', 300, { loose: 0.16, timer: 2.4, draw: 0 }), h = hero(100, { dodge: 0 }), a4 = { ...api, act: () => 4 }; say.length = 0;
  GL.frame({ heroes: [h], enemies: [ar], seeds: [], dt: 1 / 60, time: 10, api: a4 }); must(ar.timer === 2.4, 'no roll, no pin');
  h.dodge = 0.3; GL.frame({ heroes: [h], enemies: [ar], seeds: [], dt: 1 / 60, time: 10.2, api: a4 });
  must(ar.timer <= 0.05 && ar.glPin && say.includes('PIN SHOT'), 'PIN SHOT: a rolled arrow brings the next draw at once, said');
  must(GL.pinLead(ar) === GL.GLUE.pin.lead && ar.glPin === false && GL.pinLead(ar) === 0, 'the lead is read once, then cleared');
  const ar2 = mk('archer', 300, { loose: 0.16, timer: 2.4 }), h2 = hero(100, { dodge: 0.3 }); GL.frame({ heroes: [h2], enemies: [ar2], seeds: [], dt: 1 / 60, time: 10, api: { ...api, act: () => 3 } }); must(ar2.timer === 2.4, 'act III: no pin shot (act IV+)');
  const ar3 = mk('archer', 300, { loose: 0.16, timer: 2.4 }), h3 = hero(100, { dodge: 0 }); GL.frame({ heroes: [h3], enemies: [ar3], seeds: [], dt: 1 / 60, time: 10, api: a4 }); h3.dodge = 0.3; GL.frame({ heroes: [h3], enemies: [ar3], seeds: [], dt: 1 / 60, time: 11.5, api: a4 }); must(ar3.timer === 2.4, 'a roll long after the loose (past the window) is not punished');
  const el = mk('archer', 300, { loose: 0.16, timer: 2.4, elite: true }), h4 = hero(100, { dodge: 0.3 }); GL.frame({ heroes: [h4], enemies: [el], seeds: [], dt: 1 / 60, time: 10, api: a4 }); must(el.timer === 2.4, 'an elite archer has its own moves'); }

/* ---- main.js calls every hook (a rule nothing calls is a wish) ---- */
for (const [what, re] of [['the frame', /GLU\.frame\(\{/], ['the hold', /GLU\.hold\(e, /], ['the turn in the melee loop', /GLU\.turns\(e, /], ['the take in hurtEnemy0', /GLU\.take\(e, /], ['the draw', /GLU\.draw\(g, e, cx, cy, time\)/], ['the lines', /GLU\.drawLines\(/],
  ['the pin lead', /GLU\.pinLead\(e\)/], ['the reset', /GLU\.reset\(\)/], ['the words', /GLU\.WORDS/]]) must(re.test(MAIN), 'main.js does not call ' + what);
for (const w of GL.WORDS) must(MAIN.includes(w) || /GLU\.WORDS/.test(MAIN), 'the word ' + w + ' is a move word');

assert.deepEqual(bad, [], 'pack glue:\n  ' + bad.join('\n  '));
console.log('pack glue: plate step (tideguard covers a winding scout / netter), brace (shield covers an archer, act V), recall line, hold fire, pin shot - stance machine, gates, openings and main.js hooks hold.');
