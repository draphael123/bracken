// tools/bones.mjs - THE SKELETON SET (claude/beastsbones, src/bones.js): SKELETON SOLDIER, ARCHER and MAGE. NODE ONLY: no page, no port, no Chrome.
//   the step (every tell has its length and enters with its mark; a blow in a cast cancels it; the soldier's ward x0.4 into his front and the three breaks - heavy blow, parry, behind /
//   above; the shield rush ends with his back open; the mage's backstep lands clear of ALL heroes, on floor, never through a wall, on a cooldown; the wisp turns at most 60 deg/s and lives
//   2.5 s; the grave row runs 180 px/s for 160 px and is jumped; the archer's volley is three marks and three lobs) and the tables (EHP, THREAT, MARK / ANSWER / HEIGHT, SIG, voices,
//   death material, sprites, the flag OFF = no live level spawns any of the three, the placement rows find their targets).
//   node tools/bones.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
import * as B from '../src/bones.js';
import { BONES_PLACEMENTS, applyBonesPlacements, placementProblems } from '../src/bones-placements.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { THREAT } from '../src/threat.js';
import { LEVELS } from '../src/level.js';
import { materialOf } from '../src/death-fx.js';
install();
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const near = (a, b, e) => Math.abs(a - b) <= e;
const DT = 1 / 60, hero = (x, y = 0, id = 0) => ({ x, y, alive: true, id });
const W = (heroes, extra = {}) => ({ heroes, canStep: () => true, floorAt: () => true, wallBetween: () => false, ...extra });
/* run a foe for secs; collects [time, event]; world is a function of (s) so a test can move a hero */
const run = (s, w, secs, onEv) => { const evs = []; for (let t = 0; t < secs; t += DT) { const world = typeof w === 'function' ? w(s, t) : w; for (const v of B.bonesStep(s, world, DT)) { evs.push([+t.toFixed(3), v]); if (onEv) onEv(v, s, t); } if (s.vx) s.x += s.vx * DT; } return evs; };
const mk = { skelsoldier: B.newSkelSoldier, skelarcher: B.newSkelArcher, skelmage: B.newSkelMage };

console.log('node: the set\'s tell table');
{ for (const [k, [mark, ans, hgt]] of Object.entries(B.BONE_TELLS)) {
    ok(MARK[k] === mark && (!mark || (ANSWER[k] === ans && HEIGHT[k] === hgt)), k + ': mark ' + JSON.stringify(MARK[k]) + (mark ? ', answer ' + ANSWER[k] + ', ' + HEIGHT[k] : ' (no blow)') + ' - the same in src/marks.js and src/bones.js');
    if (mark === '!') ok(ans === 'block', k + ': a yellow ! is answered with the shield');
    if (mark === '!!') ok(ans !== 'block', k + ': a red !! is not answered with the shield (' + ans + ')');
    if (ans === 'duck') ok(hgt === 'high', k + ': a duck answer is a HIGH blow');
    if (ans === 'jump') ok(hgt === 'low', k + ': a jump answer is a LOW blow'); }
  const answers = new Set(Object.values(B.BONE_TELLS).map(r => r[1]).filter(Boolean));
  ok(['block', 'dodge', 'jump'].every(a => answers.has(a)), 'the set asks for block, dodge and jump (and the aimed shot is duckable): ' + [...answers].join(', ')); }

console.log('node: the soldier');
{ const C = B.BONE_SOLDIER;
  let s = B.newSkelSoldier(0, 0, 1), ev = run(s, W([hero(36)]), 3);
  const tt = ev.find(([, v]) => v.t === 'thrustTell'), th = ev.find(([, v]) => v.t === 'thrust');
  ok(tt && th && near(th[0] - tt[0], C.thrustTell, 0.05) && th[1].dmg === C.thrustDmg, 'the thrust is told ' + C.thrustTell + ' s first (' + (th && (th[0] - tt[0]).toFixed(2)) + ' s), ' + C.thrustDmg + ' damage over the rim');
  ok(th && th[1].box[1] - th[1].box[0] >= C.thrustReach, 'the thrust reaches ' + C.thrustReach + ' px');
  s = B.newSkelSoldier(0, 0, 1); s.cd = 0; run(s, W([hero(36)]), 0.2);   /* struck in the tell: a shield does not flinch - a light blow does not cancel it */ ok(s.mode === 'thrustTell', 'in his thrust windup (' + s.mode + ')');
  const r1 = B.soldierTake(s, { fromX: 30 }); ok(r1.k === C.ward && r1.why === 'front' && B.soldierStruck(s, r1.why) === null && s.mode === 'thrustTell', 'a light cut into his front: x' + C.ward + ' (WARDED), never immune, and it does not cancel his thrust');
  const r2 = B.soldierTake(s, { fromX: 30, heavy: true }); ok(r2.why === 'heavy' && r2.k === 1 && s.guard >= C.wardBreak - 1e-6, 'a HEAVY blow into his front: whole, and the shield is knocked aside ' + C.wardBreak + ' s');
  B.soldierStruck(s, 'heavy'); ok(s.mode === 'stunned' && s.open, 'and it breaks his thrust (he is open: ' + s.mode + ')');
  const r3 = B.soldierTake(s, { fromX: 30 }); ok(r3.k === 1, 'while the guard is broken or he is open every blow lands whole');
  s = B.newSkelSoldier(0, 0, 1); ok(B.soldierTake(s, { fromX: -30 }).why === 'behind' && B.soldierTake(s, { fromX: -30 }).k === 1, 'a blow from BEHIND is whole (jump over him, or a partner)');
  ok(B.soldierTake(s, { fromX: 30, plunge: true }).why === 'above' && B.soldierTake(s, { fromX: 30, plunge: true }).k === 1, 'a PLUNGE from above is whole');
  s.mode = 'thrust'; B.soldierParried(s); ok(s.mode === 'stunned' && s.open && near(s.t, C.parryOpen, 1e-6) && B.soldierTake(s, { fromX: 30 }).k === 1, 'a PARRY of his thrust throws the shield arm wide: open ' + C.parryOpen + ' s, every blow whole');
  ok(C.ward >= 0.4 - 1e-9 && C.ward > 0, 'never immune: the ward is x' + C.ward + ' (B15: >= 0.4 outside an opening)');
  s = B.newSkelSoldier(0, 0, 1); ev = run(s, W([hero(80)]), 3);
  const rt = ev.find(([, v]) => v.t === 'rushTell'), ru = ev.find(([, v]) => v.t === 'rush'), re = ev.find(([, v]) => v.t === 'rushEnd');
  ok(rt && ru && near(ru[0] - rt[0], C.rushTell, 0.05) && ru[1].dmg === C.rushDmg, 'the shield rush is told ' + C.rushTell + ' s (a red !!, low: jump it)');
  ok(re && near(s.x, C.rushDist, 14), 'and runs ' + C.rushDist + ' px (ended at x=' + s.x.toFixed(0) + ')');
  /* land behind him: he is turned the other way for C.turn s */
  s.face = 1; s.turnT = C.turn; const behind = B.soldierTake(s, { fromX: s.x - 30 }); ok(behind.why === 'behind' && behind.k === 1, 'a hero who jumped the rush is BEHIND him: his back is open');
  let faced = null; s.mode = 'stand'; s.cd = 9; for (let t = 0; t < 1.2 && faced === null; t += DT) { B.bonesStep(s, W([hero(s.x - 40)]), DT); if (s.face === -1) faced = +t.toFixed(2); }
  ok(faced !== null && near(faced, C.turn, 0.08), 'he turns round in ' + C.turn + ' s (' + faced + ')');
  /* a ledge stops his walk and his rush */
  s = B.newSkelSoldier(0, 0, 1); run(s, W([hero(300)], { canStep: () => false }), 1); ok(near(s.x, 0, 1e-6), 'he holds a ledge (canStep)'); }

console.log('node: the archer');
{ const C = B.BONE_ARCHER;
  let s = B.newSkelArcher(0, 0, 1), ev = run(s, W([hero(150, 0)]), 8);
  const at = ev.find(([, v]) => v.t === 'aimTell'), a = ev.find(([, v]) => v.t === 'aim'), vt = ev.find(([, v]) => v.t === 'volleyTell'), vols0 = ev.filter(([, v]) => v.t === 'volley'), vols = vols0.slice(0, 3);
  ok(at && a && near(a[0] - at[0], C.aimTell, 0.05) && a[1].dmg === C.aimDmg, 'the aimed shot is told ' + C.aimTell + ' s (a draw and a glint line), ' + C.aimDmg + ' damage');
  ok(a && near(Math.hypot(a[1].vx, a[1].vy), C.arrowSpeed, 1) && a[1].vx > 0, 'a fast flat arrow (' + C.arrowSpeed + ' px/s) at where you stood at the full draw');
  ok(vt && vt[1].spots.length === 3 && new Set(vt[1].spots).size === 3, 'the volley tells THREE landing marks (' + (vt && vt[1].spots.join(', ')) + ')');
  ok(vols.length === C.volleyN && near(vols[0][0] - vt[0], C.volleyTell, 0.05) && vols.every(([, v]) => v.dmg === C.volleyDmg), 'then three lobbed arrows x ' + C.volleyDmg + ', told ' + C.volleyTell + ' s');
  ok(vols[1][1].delay > vols[0][1].delay && vols[2][1].delay > vols[1][1].delay, 'staggered, not at once');
  const p0 = B.lobAt({ x: 0, y: -20, toX: 100, floorY: 0, flight: 0.75 }, 0.75); ok(near(p0.x, 100, 1e-6) && near(p0.y, 0, 1e-6), 'a lobbed arrow lands on its mark');
  s = B.newSkelArcher(0, 0, 1); run(s, W([hero(60)]), 1); ok(s.x < 0, 'he backs off a hero who closes (x=' + s.x.toFixed(1) + ')');
  s = B.newSkelArcher(0, 0, 1); run(s, W([hero(60)], { canStep: () => false }), 1); ok(near(s.x, 0, 1e-6), 'and never off a ledge');
  const shots = ev.filter(([, v]) => v.t === 'aim' || v.t === 'volley').map(([t]) => t).filter((t, i, a) => i === 0 || t - a[i - 1] > 0.3);
  ok(shots.length >= 3 && shots.every((t, i) => i === 0 || t - shots[i - 1] >= C.cd - 0.05), 'he shoots on a cooldown: ' + shots.length + ' shots in 8 s, never closer than ' + C.cd + ' s apart');
  s = B.newSkelArcher(0, 0, 1); s.mode = 'aimTell'; s.t = 0.4; ok(B.bonesStruck(s) === 'cancel' && s.mode === 'stunned', 'a blow in the draw cancels the shot (small family)');
  s = B.newSkelArcher(0, 0, 1); s.mode = 'volleyTell'; s.t = 0.5; ok(B.bonesStruck(s) === 'cancel', 'a blow in the volley\'s tell cancels it');
  s = B.newSkelArcher(0, 0, 1); run(s, W([hero(300)]), 1); ok(s.x > 0, 'and walks up to ' + C.keepMax + ' px of a hero who is further off'); }

console.log('node: the mage');
{ const C = B.BONE_MAGE;
  let s = B.newSkelMage(0, 0, 1), ev = run(s, W([hero(150)]), 10);
  const wt = ev.find(([, v]) => v.t === 'wispTell'), w = ev.find(([, v]) => v.t === 'wisp'), gt = ev.find(([, v]) => v.t === 'graveTell'), g = ev.find(([, v]) => v.t === 'grave');
  ok(wt && w && near(w[0] - wt[0], C.wispTell, 0.05) && w[1].dmg === C.wispDmg, 'the bone wisp is told ' + C.wispTell + ' s (the orb forms), ' + C.wispDmg + ' damage');
  ok(gt && g && near(g[0] - gt[0], C.graveTell, 0.05) && g[1].dmg === C.graveDmg && g[1].speed === C.graveSpeed && g[1].len === C.graveLen, 'the grave row is told ' + C.graveTell + ' s (he kneels), ' + C.graveDmg + ' damage, runs ' + C.graveSpeed + ' px/s for ' + C.graveLen + ' px');
  s = B.newSkelMage(0, 0, 1); s.mode = 'wispTell'; s.t = 0.4; ok(B.bonesStruck(s) === 'cancel', 'any blow cancels a cast (wisp)');
  s = B.newSkelMage(0, 0, 1); s.mode = 'graveTell'; s.t = 0.4; ok(B.bonesStruck(s) === 'cancel', 'any blow cancels a cast (grave row)');
  /* the wisp: weakly homing - turns at most C.wispTurn deg/s, and lives C.wispLife s */
  { const b = { x: 0, y: 0, vx: C.wispSpeed, vy: 0, t: 0, alive: true }; let maxTurn = 0, last = 0; const tgt = { x: 0, y: 100 };
    for (let t = 0; t < 1; t += DT) { B.wispStep(b, tgt, DT); const a = Math.atan2(b.vy, b.vx); maxTurn = Math.max(maxTurn, Math.abs(a - last)); last = a; }
    ok(near(Math.abs(Math.atan2(b.vy, b.vx)) * 180 / Math.PI, C.wispTurn, 2) && maxTurn * 180 / Math.PI * 60 <= C.wispTurn + 1, 'the wisp turns at most ' + C.wispTurn + ' deg/s (after 1 s it has turned ' + (Math.atan2(b.vy, b.vx) * 180 / Math.PI).toFixed(1) + ' deg)');
    const b2 = { x: 0, y: 0, vx: C.wispSpeed, vy: 0, t: 0, alive: true }; let life = 0; while (b2.alive && life < 5) { B.wispStep(b2, { x: 500, y: 0 }, DT); life += DT; } ok(near(life, C.wispLife, 0.05), 'and lives ' + C.wispLife + ' s (' + life.toFixed(2) + ')');
    ok(C.wispSpeed <= 90, 'and is slow (' + C.wispSpeed + ' px/s): the gobmage\'s bolt is straight, this one follows'); }
  /* the grave row */
  { const r = B.newGraveRow(0, 1); let t = 0; while (r.alive && t < 3) { B.graveStep(r, DT); t += DT; } ok(near(t, C.graveLen / C.graveSpeed, 0.05) && near(r.x, C.graveLen, 4), 'the row runs ' + C.graveLen + ' px in ' + t.toFixed(2) + ' s (' + C.graveSpeed + ' px/s) and stops');
    const r2 = B.newGraveRow(0, 1); r2.x = 50;
    ok(B.graveHits(r2, hero(50, 0), 0) && !B.graveHits(r2, hero(50, -14), 0) && !B.graveHits(r2, hero(90, 0), 0), 'it hits a hero on the floor under the crest, not one who jumped it (14 px up) and not one beside it'); }
  /* the backstep */
  { s = B.newSkelMage(100, 0, -1); const hs = [hero(120), hero(60, 0, 1)]; ev = run(s, W(hs), 1.5);
    const bt = ev.find(([, v]) => v.t === 'backstepTell'), bl = ev.find(([, v]) => v.t === 'blink');
    ok(bt && bl && near(bl[0] - bt[0], C.stepTell, 0.05), 'a hero within ' + C.closeIn + ' px: a told puff (' + C.stepTell + ' s), then he blinks');
    ok(bl && hs.every(h => Math.abs(h.x - bl[1].to) >= C.stepFarMin) && Math.abs(bl[1].to - bl[1].from) >= C.stepMin && Math.abs(bl[1].to - bl[1].from) <= C.stepMax + 1e-6, 'the blink lands ' + C.stepMin + '-' + C.stepMax + ' px away and clear of ALL heroes (to x=' + (bl && bl[1].to) + ', heroes at 120 and 60)');
    s = B.newSkelMage(0, 0, 1); ev = run(s, W([hero(20)], { floorAt: x => x < 0 || x > 5 ? false : true }), 1);
    ok(!ev.some(([, v]) => v.t === 'blink'), 'never off a ledge: no floor to land on, no blink');
    s = B.newSkelMage(0, 0, 1); ev = run(s, W([hero(20)], { wallBetween: () => true }), 1); ok(!ev.some(([, v]) => v.t === 'blink'), 'never through a wall');
    s = B.newSkelMage(100, 0, -1); const evs2 = run(s, W([hero(120)]), 5), n = evs2.filter(([, v]) => v.t === 'blink').length; ok(n <= 2, 'on a ' + C.stepCd + ' s cooldown (' + n + ' blinks in 5 s with a hero who stays close)'); }
  /* a hero out of reach: he keeps his distance */
  s = B.newSkelMage(0, 0, 1); s.cd = 9; s.stepCdT = 9; run(s, W([hero(100)]), 1); ok(s.x < 0, 'keeps ' + C.keepMin + '-' + C.keepMax + ' px: backs off a hero at 100 (x=' + s.x.toFixed(1) + ')');
  s = B.newSkelMage(0, 0, 1); s.cd = 9; run(s, W([hero(300)]), 1); ok(s.x > 0, 'and closes on one at 300'); }

console.log('node: the tables');
{ const main = rd('src/main.js'), audio = rd('src/audio.js');
  for (const t of B.BONE_IDS) {
    ok(new RegExp(t + ': BNS\\.BONE_\\w+\\.hp').test(main), t + ' has an EHP row (BNS.BONE_*.hp)');
    ok(new RegExp("case '" + t + "'").test(main), t + ' has a spawn case in main.js (the pen and the tools use it)');
    ok(THREAT[t] > 0, t + ' is weighed in src/threat.js (' + THREAT[t] + ')');
    ok(materialOf(t) === 'bone', t + ' collapses in BONE (src/death-fx.js)');
    ok(new RegExp('\\b' + t + ': \\{ kit:').test(audio), t + ' has a voice row (src/audio.js CAST)');
    ok(new RegExp(t + ": 'SKELETON").test(main), t + ' has a bestiary short name'); }
  ok(/BNS\.BONES_SHIPS \? \[/.test(main) && /t: 'skelsoldier'/.test(main) && /t: 'skelarcher'/.test(main) && /t: 'skelmage'/.test(main), 'three bestiary cards, shown only while BONES_SHIPS');
  ok(/SPR\.skelsoldier = BNA\.bakeSkeletonSoldier\(\)/.test(main) && /HAS_HURT\.add\(k\)/.test(main), 'sprites bake and carry a death frame (HAS_HURT)');
  const BA = await import('../src/redraw/bones_art.js');
  for (const [k, fn, n] of [['skelsoldier', BA.bakeSkeletonSoldier, 13], ['skelarcher', BA.bakeSkeletonArcher, 12], ['skelmage', BA.bakeSkeletonMage, 14]]) { const sp = fn(); ok(sp.R.length === n && sp.L.length === n && sp.white.R.length === n && sp.w === 10 && sp.h === 20, k + ' sprite: ' + sp.R.length + ' frames, hit box ' + sp.w + 'x' + sp.h + ' (palette-block placeholder)'); }
  const { boneFrame } = await import('../src/bones-hands.js');
  const frames = { skelsoldier: [['thrustTell', 6], ['thrust', 7], ['rushTell', 8], ['rush', 9], ['stunned', 10]], skelarcher: [['aimTell', 6], ['aim', 7], ['volleyTell', 8], ['volley', 9]], skelmage: [['wispTell', 6], ['wisp', 7], ['graveTell', 8], ['grave', 9], ['backstepTell', 10]] };
  for (const [k, rows] of Object.entries(frames)) ok(rows.every(([m, f]) => boneFrame({ t: k, mode: m, anim: 0, vx: 0, st: { mode: m } }) === f), k + ': every tell and blow has its own pose'); }

console.log('node: the flag and the placements');
{ ok(B.BONES_SHIPS === false, 'BONES_SHIPS is false: nothing is live');
  const ids = new Set(B.BONE_IDS), live = [];
  for (const lv of LEVELS) { let L; try { L = lv.build(); } catch { continue; } const all = [...(L.ents || []), ...(L.ambushes || []).flatMap(A => (A.waves || []).flat().map(f => ({ t: f[0] }))), ...(L.garrison || []).map(r => ({ t: Array.isArray(r) ? r[0] : r.t }))];
    for (const e of all) if (e && ids.has(e.t)) live.push(lv.id + ':' + e.t); }
  ok(live.length === 0, 'flag OFF: no live level spawns any of the three (' + (live.join(', ') || 'none') + ')');
  const mage = LEVELS.find(l => l.id === 'mage').build(), tower = LEVELS.find(l => l.id === 'fallingtower').build();
  ok(placementProblems('mage', mage.ents).length === 0 && placementProblems('fallingtower', tower.ents).length === 0, 'every placement row finds its target at its tile (' + BONES_PLACEMENTS.length + ' rows, mage + fallingtower)');
  ok(applyBonesPlacements('mage', mage.ents) === mage.ents && applyBonesPlacements('fallingtower', tower.ents) === tower.ents, 'flag off: the same ents array comes back untouched (the level hash does not move)');
  const on = applyBonesPlacements('mage', mage.ents, true), onT = applyBonesPlacements('fallingtower', tower.ents, true);
  const swaps = (a, b) => a.reduce((n, e, i) => n + (e.t !== b[i].t ? 1 : 0), 0);
  ok(on.length === mage.ents.length && onT.length === tower.ents.length && swaps(mage.ents, on) === 3 && swaps(tower.ents, onT) === 4, 'flag forced on: same length and order, 3 swaps in the Folly and 4 in the Tower (soldier, archer, mage / soldier, archer, soldier, mage)');
  ok(on.filter(e => e.t === 'skelmage').length === 1 && onT.filter(e => e.t === 'skelmage').length === 1, 'one mage a room');
  ok(on.filter(e => e.t === 'skelarcher').length <= 2 && onT.filter(e => e.t === 'skelarcher').length <= 2, 'archers 1-2 a room');
  ok(placementProblems('mage', []).length === 3 && placementProblems('fallingtower', mage.ents).length === 4, 'a row whose target is missing is reported (an empty Folly: 3 problems; the Folly ents handed to the Tower: 4)'); }

console.log('node: the hands (a mock game: flat floor, recorded calls)');
{ const { mockGame } = await import('./beasts-mock.mjs'), { makeBonesHands } = await import('../src/bones-hands.js');
  const mkE = (g, t, x, extra = {}) => g.add({ t, x, y: 0, w: 10, h: 20, hp: B.BONES_HP[t], face: -1, ...extra });
  const secs = (g, H, s, keep = true) => { for (let i = 0; i < Math.round(s * 60); i++) { g.frame(H); if (keep) g.players.forEach(p => { if (p.hp < 30) p.hp = 100; }); } };
  /* the soldier: a thrust over the rim (blockable), a rush (unblockable); a parry opens him; the ward in the hands */
  { const g = mockGame([{ x: 36 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelsoldier', 0); e.st = B.newSkelSoldier(0, 0, 1); e.st.cd = 0; secs(g, H, 3);
    ok(g.marks.some(m => m[0] === 'skelsoldier' && m[1] === '!') && g.hits.some(h => h.d === B.BONE_SOLDIER.thrustDmg && !h.o.unblockable && h.name === 'SKELETON SOLDIER'), 'the thrust is a yellow ! and lands blockable'); }
  { const g = mockGame([{ x: 80 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelsoldier', 0); e.st = B.newSkelSoldier(0, 0, 1); e.st.cd = 0; secs(g, H, 3);
    ok(g.marks.some(m => m[0] === 'skelsoldier' && m[1] === '!!') && g.hits.some(h => h.d === B.BONE_SOLDIER.rushDmg && h.o.unblockable), 'the shield rush is a red !! and lands unblockable'); }
  { const g = mockGame([{ x: 36 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelsoldier', 0); e.st = B.newSkelSoldier(0, 0, 1); e.st.cd = 0; g.parryNext = true; let opened = false;
    for (let i = 0; i < 200 && !opened; i++) { g.frame(H); if (H.read().parries > 0) opened = true; } ok(opened && e.st.mode === 'stunned' && e.st.open && e.mode === 'stunned', 'a parried thrust throws the shield arm wide: he is open (' + e.mode + ')'); }
  { const g = mockGame([{ x: 100 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelsoldier', 0); e.st = B.newSkelSoldier(0, 0, 1);
    const front = H.take(e, 10, { fromX: 30 }), heavy = H.take(e, 10, { fromX: 30, heavy: true }), after = H.take(e, 10, { fromX: 30 });
    ok(near(front, 4, 1e-9) && g.calls['clank'] === 1 && g.numbers.includes('WARDED'), 'into his front: x0.4, a clank, WARDED over him (' + front + ')');
    ok(heavy === 10 && after === 10 && g.numbers.includes('GUARD BROKEN'), 'a heavy blow breaks the guard (' + heavy + '), and the next lands whole (' + after + ')');
    const e2 = mkE(g, 'skelsoldier', 300); e2.st = B.newSkelSoldier(300, 0, 1); ok(H.take(e2, 10, { fromX: 270 }) === 10 && H.take(e2, 10, { fromX: 330, plunge: true }) === 10, 'from behind, or a plunge: whole');
    ok(e.stagger === 0, 'and a shield never flinches (stagger held at 0 in the hands)'); }
  /* the archer: an aimed arrow (blockable, flat), a volley (three lobs on the marks, unblockable) */
  { const g = mockGame([{ x: 150 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelarcher', 0); e.st = B.newSkelArcher(0, 0, 1); e.st.cd = 0; e.st.last = 'volley'; let arrowsSeen = 0; for (let i = 0; i < 60 * 3; i++) { g.frame(H); g.players[0].hp = 100; arrowsSeen = Math.max(arrowsSeen, H.read().arrows); }
    ok(g.marks.some(m => m[0] === 'skelarcher' && m[1] === '!') && g.hits.some(h => h.d === B.BONE_ARCHER.aimDmg && !h.o.unblockable && h.name === 'SKELETON ARCHER'), 'the aimed shot is a yellow ! and its arrow hits blockable (' + g.hits.filter(h => h.d === B.BONE_ARCHER.aimDmg).length + ' hit)'); }
  { const g = mockGame([{ x: 150 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelarcher', 0); e.st = B.newSkelArcher(0, 0, 1); e.st.cd = 0; e.st.last = 'aim'; secs(g, H, 3.2);
    const lobs = g.hits.filter(h => h.d === B.BONE_ARCHER.volleyDmg);
    ok(g.marks.some(m => m[0] === 'skelarcher' && m[1] === '!!') && lobs.length >= 1 && lobs.every(h => h.o.unblockable), 'the volley is a red !! and its lobs land unblockable on whoever stands in the marks (' + lobs.length + ' of 3 on a hero standing at the middle mark)'); }
  { const g = mockGame([{ x: 150 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelarcher', 0); e.st = B.newSkelArcher(0, 0, 1); e.st.cd = 0; e.st.last = 'aim'; let motes = 0, f = 0; for (; f < 60 * 3.2; f++) { g.frame(H); motes = Math.max(motes, H.motes.length); }
    ok(motes === 3, 'three bone-dust motes mark the landing spots while he tells it (' + motes + ')'); }
  { const g = mockGame([{ x: 150 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelarcher', 0); e.st = B.newSkelArcher(0, 0, 1); e.st.cd = 0; e.st.last = 'volley'; for (let i = 0; i < 30; i++) { g.frame(H); } ok(e.st.mode === 'aimTell', 'in the draw'); H.take(e, 3, { fromX: 20 }); ok(e.st.mode === 'stunned' && e.mode === 'stunned', 'a blow in the draw cancels the shot (hands.take)'); }
  /* the mage: the wisp follows and is popped by a blow; the grave row hits a hero on the floor and passes under a jumper; the backstep */
  { const g = mockGame([{ x: 150 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelmage', 0); e.st = B.newSkelMage(0, 0, 1); e.st.cd = 0; let wisps = 0; const hp0 = g.players[0].hp;
    for (let i = 0; i < 60 * 8; i++) { g.frame(H); g.players[0].hp = 100; wisps = Math.max(wisps, H.read().wisps); }
    ok(g.marks.some(m => m[0] === 'skelmage' && m[1] === '!') && wisps >= 1, 'the bone wisp is a yellow ! (' + wisps + ' in flight)');
    ok(g.hits.some(h => h.d === B.BONE_MAGE.wispDmg && !h.o.unblockable), 'and a wisp that reaches him lands blockable'); }
  { const g = mockGame([{ x: 150 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelmage', 0); e.st = B.newSkelMage(0, 0, 1); e.st.cd = 0; e.st.last = 'grave'; let popped = false;
    for (let i = 0; i < 60 * 3; i++) { g.frame(H); if (H.wisps.length && !popped) { const w = H.wisps[0]; g.swing = { p: g.players[0], box: { l: w.x - 6, r: w.x + 6, t: w.y - 6, b: w.y + 6 } }; } if (H.read().pops) { popped = true; g.swing = null; } g.players[0].hp = 100; }
    ok(popped && H.read().wisps === 0, 'a blow on the wisp pops it (POPPED)' + (g.numbers.includes('POPPED') ? '' : ' - word missing')); }
  { const g = mockGame([{ x: 120 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelmage', 0); e.st = B.newSkelMage(0, 0, 1); e.st.cd = 0; e.st.last = 'wisp'; e.st.stepCdT = 99; secs(g, H, 3);
    ok(g.marks.some(m => m[0] === 'skelmage' && m[1] === '!!') && g.hits.some(h => h.d === B.BONE_MAGE.graveDmg && h.o.unblockable), 'the grave row is a red !! and its crest lands unblockable on a hero on the floor'); }
  { const g = mockGame([{ x: 120, y: -16 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelmage', 0); e.st = B.newSkelMage(0, 0, 1); e.st.cd = 0; e.st.last = 'wisp'; e.st.stepCdT = 99; secs(g, H, 3);
    ok(!g.hits.some(h => h.d === B.BONE_MAGE.graveDmg), 'a hero who JUMPED the crest (16 px up) is not touched'); }
  { const g = mockGame([{ x: 25 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelmage', 0); e.st = B.newSkelMage(0, 0, 1); e.st.cd = 99; secs(g, H, 1.2);
    ok(H.read().blinks === 1 && Math.abs(e.x - 25) >= B.BONE_MAGE.stepFarMin && g.numbers.includes('BACKSTEP'), 'a hero at 25 px: he blinks away to x=' + e.x.toFixed(0) + ' (BACKSTEP)'); }
  { const g = mockGame([{ x: 2000 }]), H = makeBonesHands(g.ctx), e = mkE(g, 'skelsoldier', 0); secs(g, H, 3); ok(e.x === 0 && !g.hits.length, 'out of sight (520 px) the dead only stand'); }
}


console.log(bad ? '\nbones: ' + bad + ' FAILED' : '\nok  bones          the soldier\'s ward and its three breaks, the archer\'s told shots, the mage\'s wisp / grave row / backstep, the tables, the flag off, the placement rows');
process.exit(bad ? 1 : 0);
