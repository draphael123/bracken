// tools/warden-reach.mjs - WARDEN'S REACH POWER + LOOK, THE THROW PIPS AND THE TETHER SPEAR, static (claude/wardenult, Daniel 11-07; NO browser, NO puppeteer).
//   node tools/warden-reach.mjs
import fs from 'node:fs';
import { WID } from '../src/warden-id.js';
import { WTH, WTH_PIPS, wthTier, wthPips, WTH_TEXT } from '../src/warden-throw.js';
import { K_WARDEN_REACH } from '../src/skill-k.js';
import { RPOSE, reachGeom, reachPoseFor, SH } from '../src/warden-reach.js';
import { SKILLS } from '../src/progression-catalog.js';
let n = 0; const ok = (c, m) => { n++; if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('ok  ', m); };
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const main = read('src/main.js'), chars = read('src/chars.js');
/* 1. POWER */
ok(K_WARDEN_REACH.perHit === 1.4 && K_WARDEN_REACH.final === 4, 'ult power: per hit x1.4, final thrust x4.0');
ok(WID.reach.bossStagger === 1.2 && WID.reach.finalStagger === 1.2, 'ult stagger: final 1.2 s on a boss and on a small foe');
ok(WID.reach.poiseHit > 0 && WID.reach.poiseCap > 0 && WID.reach.poiseCap < 1, 'hits lean on a boss bar but never to a break on their own (cap ' + WID.reach.poiseCap + ')');
ok(/reachStagAt/.test(main) && /time - \(e\.reachStagAt/.test(main), 'boss stagger is once per ult (reachStagAt gate: never a lock)');
/* 2. THROWS IN THE ULT */
ok(wthTier(0.25, true) === 3 && wthTier(0.1, true) === 0 && wthTier(0.25, false) === 0 && wthTier(1.5, false) === 3, 'ult throw: always the PIN once wound (0.20 s); outside, 1.45 s');
ok(WTH.ult.wind < WTH.steps[2] / 5 && WTH.ult.cost < WTH.cost[2] && WTH.ult.dmg === 2.0 * 1.4, 'ult throw: wind-up ' + WTH.ult.wind + ' s vs 1.45, cost ' + WTH.ult.cost + ' vs ' + WTH.cost[2] + ', dmg x' + WTH.ult.dmg);
ok(!/P\.wReachT > 0\)\) \{ if \(st0 > 0\)/.test(main), 'wthTick no longer bails in the ult');
/* 3. PIPS */
ok(WTH_PIPS.col.length === 3 && new Set(WTH_PIPS.col).size === 3 && WTH_PIPS.word.join() === 'QUICK,HEAVY,PIN', 'three pips, three colours, QUICK/HEAVY/PIN');
ok(wthPips(0.1) === 0 && wthPips(0.31) === 1 && wthPips(0.81) === 2 && wthPips(1.46) === 3, 'pips fill at 0.30 / 0.80 / 1.45 s');
ok(wthPips(0.05, true) === 0 && wthPips(0.07, true) === 1 && wthPips(0.14, true) === 2 && wthPips(0.2, true) === 3, 'ult pips fill across 0.20 s');
ok(/SPEAR THROW/.test(WTH_TEXT) && /PIPS/.test(WTH_TEXT) && /THREE PIPS/.test(main.match(/id: 'warden'[^\n]*/)[0]), 'controls text and the hero card name the three pips');
ok(/wthPipsDraw\(cx, cy\)/.test(main) && /SFX\.fbStep\(st\)/.test(main), 'pips are drawn and each tier dings');
/* 4. LOOK: every pose has both hands on the shaft, and the point reaches the hitbox */
for (const [k, fr] of Object.entries(RPOSE)) { const arr = fr.length; ok(arr >= 1 && fr.every(p => Number.isFinite(p.fx + p.fy + p.rx + p.ry + p.T)), 'pose ' + k + ': ' + arr + ' frame(s) with two grips'); }
ok(RPOSE.reachA.length === 4 && RPOSE.reachB.length === 4 && RPOSE.reachC.length === 4 && RPOSE.reachRun.length === 6, 'attack poses carry 4 beats (+ the rest = reachHold); run is the 6-frame cycle');
{ const g = reachGeom('reachA', 2); ok(g.tx >= 90 && g.tx <= 100 && Math.abs(g.ty - g.ry) < 6, 'thrust full beat: point ' + g.tx + ' px out (hit line ' + 44 * WID.reach.mul + '), nearly level (dy ' + (g.ty - g.ry).toFixed(1) + ')'); }
for (const k of Object.keys(RPOSE)) for (let i = 0; i < RPOSE[k].length; i++) { const g = reachGeom(k, i), L = Math.hypot(g.tx - g.bx, g.ty - g.by); if (!(L > 40 && g.fx > g.rx && Math.abs(g.ty - g.fy) < 30)) ok(false, k + i + ' shaft ' + L.toFixed(0) + ' px / bad slope'); }
ok(true, 'every pose: the shaft is >40 px, the lead hand ahead of the rear hand, the point within 30 px of the hand line');
for (const [a, b] of [['atk', 'reachA'], ['atkB', 'reachB'], ['atkC', 'reachC'], ['run', 'reachRun'], ['idle', 'reachHold'], ['javWind', 'reachWind'], ['javThrow', 'reachThrow'], ['fall', 'reachJump']]) ok(reachPoseFor(a, 1)[0] === b, 'key ' + a + ' -> ' + b);
ok(reachPoseFor('hurt', 0) === null && reachPoseFor('roll', 0) === null && reachPoseFor('climb', 0) === null, 'hurt / roll / climb stay as drawn (armed)');
ok(SH.X === 19 && /const sh = \[BX \+ 8, BY \+ 7\]/.test(chars) && /BX = 11, BY = 6/.test(chars), 'shoulder constants match chars.js (BX 11, BY 6 -> 19, 13)');
ok(/WARDEN_REACH_POSES/.test(chars) && /arm2: \[OFF\[0\], OFF\[1\], X \+ p\.rx, Y \+ p\.ry\]/.test(chars), 'chars.js bakes both arms from the table');
ok(/drawReachShaft\(cx, cy, key, frame, dY, dFace\)/.test(main) && /rp \? K\.bare : K|\|\| rp\)\)/.test(main), 'main.js draws the shaft through the hands and uses the bare set');
/* 5. TETHER SPEAR */
{ const s = SKILLS.find(q => q.id === 'javelin'); ok(s && s.name === 'TETHER SPEAR' && s.hero === 'warden' && s.level === 9, 'skill id javelin kept (saves unchanged), shown as TETHER SPEAR (F, L9)'); ok(/YANK/.test(s.desc), 'catalog text says it yanks'); }
ok(!/name": "JAVELIN"/.test(read('src/progression-catalog.js')), 'no skill is still named JAVELIN');
ok(/function tetherYank/.test(main) && /!lcBig\(e\)/.test(main.match(/function tetherYank[\s\S]{0,400}/)[0]) && /TETHERED/.test(main), 'recall yanks a pinned foe; a boss is only staggered (TETHERED), never pulled');
console.log(n + ' checks' + (process.exitCode ? ' - RED' : ' - GREEN'));
