// tools/gq2mech.mjs - THE GOBLIN QUEEN 2's HIGHCROWN MECHANICS, THE NODE HALF (claude/gq2mech). No page, no browser.
//   BELL   a blow on the hall bell (any seat) -> she STORMS to the sound -> 0.9 s tell under the grate -> the grate drops -> PINNED 3.5 s (x1.1 a blow, at most GQ3.mech.pinCap of her bar a pin); 10 s cooldown; a parry on her charge stuns her
//   WINCH  at 66 % and 33 % of her hall bar the west gate rises; 3 blows (each inside 2 s of the last, any seat) drop it and keep the guards out; fail and they join
//   WIRING main.js: the generic bell strike steps aside, the ctx hooks, the x1.1 window and its cap, the 0.4 floor untouched, the texts
//   node tools/gq2mech.mjs
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => readFileSync(path.join(ROOT, f), 'utf8');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS, T } = await imp('src/level.js');
const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js');
const { Q4: Q4T, Q4N: Q4NT } = await import('../src/gq4q.js');   /* (gq4tune-d) hall blows ride Q4N.p1.dmgK */
const GM = GQ3.mech;
const make = (seats = 1) => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, A = Lw.arena;
  const st = { time: 0, parries: 0, dmg: [], spawned: [], gate: [], grate: [], pins: [], said: [], parryNext: false };
  const mk = x => ({ x, y: A.floor, hp: 100, maxHp: 100, dead: false, ground: true, vy: 0, vx: 0, face: 1, hitSet: new Set(), box: null });
  const heroes = Array.from({ length: seats }, (_, i) => mk(A.x0 + (14 + 3 * i) * 16)); let cur = heroes[0];
  const e = { t: 'gqueen', alive: true, x: A.x0 + 38 * 16, y: A.floor, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99 };
  const bell = { t: 'winch', x: 227 * 16 + 8, y: 18 * 16, gate: 225, gy0: 16, gy1: 19, bell: true, bossGate: true, open: 0, drop: true };
  const noop = () => {};
  const ctx = { L: Lw, TS: 16, T, sfx: new Proxy({}, { get: () => noop }), P: () => heroes[0], boss: () => e, bossActive: () => true, enemies: () => [e], props: () => [bell], time: () => st.time,
    number: (x, y, t) => st.said.push(t), burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop,
    damage: (x, d, o) => { st.dmg.push({ x, d, o: o || {}, who: cur }); if (st.parryNext && !(o && o.unblockable)) { st.parries++; st.parryNext = false; } return 'hit'; }, parries: () => st.parries,
    hurt: (en, d) => { en.hp -= d; }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - 14, b: cur.y }),
    endFight: noop, shutWest: noop, layEscape: noop, tiles: noop, spawnEnt: o => st.spawned.push(o), setCheckpoint: noop, flaskMax: () => 3, music: noop, hint: noop, enterRoof: noop, wave: noop, ducking: () => false,
    eachHero: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, allHeroes: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, target: () => heroes[0],
    attackBox: () => cur.box, bell: () => bell, grate: (hold, by) => { st.grate.push({ hold, by, t: st.time }); bell.open = hold; return true; },
    pin: (en, x, by, txt, secs) => { en.mode = 'pinned'; en.modeT = secs; en.pinBy = by; st.pins.push({ by, secs, t: st.time }); return true; },
    westGate: open => st.gate.push({ open, t: st.time }), slamDmg: () => 14 };
  const H = makeGQueenHands(ctx); H.load(); H.reset();
  /* main.js's order: her mode machine moves her (vx eased to the hands' want), pinned / stand are main's own */
  const step = (n, dt = 1 / 60) => {
    for (let i = 0; i < n; i++) {
      st.time += dt; if (bell.open > 0 && !bell.pinned) bell.open -= dt;
      if (!H.step(e, dt)) {
        e.modeT -= dt; e.anim += dt; H.tick(e, dt);
        const w = H.mode(e, dt);
        if (w !== undefined) e.vx += (w - e.vx) * Math.min(1, dt * 5);
        else if (e.mode === 'pinned') { e.vx = 0; if (e.modeT <= 0) { e.mode = 'stand'; e.modeT = 0.4; } }
        else { e.vx = 0; if (e.modeT <= 0 && (e.mode === 'rec' || e.mode === 'stunned')) e.mode = 'stand'; }
        e.x += e.vx * dt;
      }
      H.update(dt); for (const h of heroes) h.box = null;
    }
  };
  const blow = (h, box) => { h.hitSet = new Set(); h.box = box; };
  const bellBox = { l: bell.x - 3, r: bell.x + 3, t: bell.y - 18, b: bell.y - 2 };
  const winchBox = () => { const wx = A.x0 + GM.winchCol * 16 + 8; return { l: wx - 3, r: wx + 3, t: A.floor - 20, b: A.floor - 2 }; };
  return { H, st, heroes, e, bell, A, step, blow, bellBox, winchBox };
};
const ring = (w, h = w.heroes[0]) => { w.blow(h, w.bellBox); w.step(1); };

console.log('== BELL: a blow rings it, she storms to the sound, the grate drops on her');
{ const w = make(); const gx = w.bell.gate * 16 + 8; w.e.x = gx + 300;
  ring(w); const M = w.H.mech();
  ok(M.rings === 1 && w.st.said.includes('YOU RING THE BELL'), 'a blow on the bell rings it (told: YOU RING THE BELL)');
  w.step(2);
  ok(w.e.mode === 'lure' && w.st.said.includes('SHE HEARS IT'), 'she hears it: mode lure, told !! and SHE HEARS IT');
  let sawTell = false, maxV = 0;
  for (let i = 0; i < 60 * 4 && !w.st.grate.length; i++) { w.step(1); maxV = Math.max(maxV, Math.abs(w.e.vx)); if (w.bell.tellUntil > w.st.time) sawTell = true; }
  ok(maxV > 150, 'she storms at speed (' + Math.round(maxV) + ' px/s, was 55-70 walking)');
  ok(sawTell, 'the grate column glows before the drop (tellUntil / tellK, the existing 0.9 s tell)');
  ok(w.st.grate.length === 1 && w.st.grate[0].by === 'lure', 'the grate dropped once, by the lure');
  const t0 = w.st.grate[0].t;
  ok(w.st.pins.length === 1 && w.st.pins[0].by === 'lure' && w.st.pins[0].secs === GM.pin && Math.abs(w.st.pins[0].t - t0) < 0.05, 'under it she is PINNED ' + GM.pin + ' s (pin by lure)');
  ok(w.bell.pinned === w.e && w.bell.open === 9, 'the grate stays down on her (pinned 9 s; main gateStep lets it up when she is free)');
  ok(GM.pin >= 3.5 && GM.pin <= 4.5, 'the window is about 4 s');
  console.log('== BELL: cooldown');
  w.e.mode = 'stand'; w.e.modeT = 0; w.bell.open = 0; w.bell.pinned = null; w.step(30);
  ring(w); w.step(60); ok(M.rings === 1 && w.e.mode !== 'lure' && w.st.said.includes('STILL SWINGING'), 'a second ring inside ' + GM.bellCd + ' s does nothing (STILL SWINGING)');
  w.step(60 * GM.bellCd); w.e.mode = 'stand'; ring(w); w.step(3); ok(M.rings === 2 && w.e.mode === 'lure', 'after the cooldown the bell answers again');
}
console.log('== BELL: queued while she is mid-move; busy modes never interrupted');
{ const w = make(); w.e.mode = 'hallLeap'; w.e.modeT = 99; ring(w); w.step(10); ok(w.e.mode === 'hallLeap', 'mid-leap she is not yanked out of it');
  w.e.mode = 'stand'; w.e.modeT = 0; w.step(3); ok(w.e.mode === 'lure', 'a moment later (inside ' + GM.queue + ' s) she answers the queued ring');
  const v = make(); v.e.mode = 'hallLeap'; v.e.modeT = 99; ring(v); v.step(60 * (GM.queue + 0.5)); v.e.mode = 'stand'; v.e.modeT = 0; v.step(3); ok(v.e.mode !== 'lure', 'a ring she was too busy to hear goes stale after ' + GM.queue + ' s'); }
console.log('== BELL: a miss, a parry on the charge, a blockable charge');
{ const w = make(); const gx = w.bell.gate * 16 + 8; w.e.x = gx + 200; ring(w); w.step(2);
  for (let i = 0; i < 60 * 6 && !w.st.grate.length; i++) { w.step(1); w.e.x = gx + 200; w.e.vx = 0; }   /* held away from the grate (blocked) */
  ok(w.st.grate.length === 1 && w.st.pins.length === 0 && w.e.mode === 'rec', 'if she is NOT under the grate when it drops, no pin (the bell was wasted)');
  const v = make(); v.e.x = gx + 160; v.heroes[0].x = v.e.x - 60; ring(v); v.step(2); v.st.parryNext = true; let stunned = false;
  for (let i = 0; i < 60 * 2; i++) { v.heroes[0].x = v.e.x - 10; v.step(1); if (v.e.mode === 'stunned') { stunned = true; break; } }
  ok(stunned && v.st.grate.length === 0, 'a PARRY on her charge stuns her (the crown/shard skill opening, same verb); the lure is off, no grate');
  const u = make(); u.e.x = gx + 100; ring(u); u.step(2); u.heroes[0].x = u.e.x - 8; u.step(Math.round(60 * GM.wind) - 12);
  ok(u.e.luWind === 1 && u.st.dmg.length === 0 && u.e.vx === 0, '(gq3fix) the charge is TOLD: a ' + GM.wind + ' s wind-up first (planted, her gather pose, no contact blow in it)'); u.step(24);
  ok(u.st.dmg.some(d => d.d === Math.max(1, Math.round(GM.contact * (Q4T ? Q4NT.p1.dmgK : 1))) && !d.o.unblockable), 'the charge is a BLOCKABLE hit (yellow), not a red one'); }
console.log('== BELL: standing under the grate you rang');
{ const w = make(); const gx = w.bell.gate * 16 + 8; w.e.x = gx + 40; w.heroes[0].x = gx + 2; w.heroes[0].y = w.A.floor - 20; ring(w); w.step(2);
  for (let i = 0; i < 60 * 3 && !w.st.grate.length; i++) { w.heroes[0].x = gx + 2; w.step(1); }
  ok(w.st.dmg.some(d => d.o.name === 'THE GRATE' && d.o.unblockable) && Math.abs(w.heroes[0].x - gx) >= 14, 'under it at the drop is a crush and a shove clear (as her own ring): ring it from beside it'); }
console.log('== WINCH: 66 %');
{ const w = make(); w.e.hp = Math.round(2400 * 0.65); w.step(2);
  ok(w.st.gate.length === 1 && w.st.gate[0].open === true, 'at 66 % the west gate rises');
  ok(w.H.mech().wave && w.H.mech().wave.state === 'open' && w.st.said.includes('CRANK THE WINCH'), 'told: CRANK THE WINCH, the wave is open');
  const h = w.heroes[0]; for (let i = 0; i < 3; i++) { w.blow(h, w.winchBox()); w.step(1); w.step(20); }
  ok(w.H.mech().kept === 1 && w.st.gate.at(-1).open === false && !w.H.mech().wave, 'three blows inside the window drop the gate (kept out)');
  w.step(60 * 8); ok(w.st.spawned.length === 0, 'and no guard ever comes through');
  const n0 = w.st.gate.length; w.step(5); ok(w.st.gate.length === n0, '(the 66 % wave fires once per fight)'); }
console.log('== WINCH: fail and the wave joins; 33 % has two');
{ const w = make(); w.e.hp = Math.round(2400 * 0.64); w.step(2); w.step(Math.round(60 * GM.delay) - 30); ok(w.st.spawned.length === 0, 'before the horn runs out, nothing yet');
  w.step(60); ok(w.st.spawned.length === 1 && w.st.spawned[0].t === 'soldier', 'the horn runs out: one soldier joins her (wave 1)');
  w.step(60 * (GM.closeAfter + 0.2)); ok(w.st.gate.at(-1).open === false && !w.H.mech().wave, 'the gate drops behind them');
  w.e.hp = Math.round(2400 * 0.32); w.step(2); w.step(60 * (GM.delay + 0.5));
  ok(w.st.spawned.length === 3 && w.st.spawned.slice(1).map(s => s.t).join() === 'soldier,javelin', 'the 33 % wave: a soldier and a javelin');
  ok(w.st.spawned.every(s => s.x > w.A.x0 / 16 && s.x < w.A.x0 / 16 + 12), 'they come in at the west gate'); }
console.log('== WINCH: the blows must come together; a slow hand starts again');
{ const w = make(); w.e.hp = 1500; w.step(2); const h = w.heroes[0];
  w.blow(h, w.winchBox()); w.step(1); w.step(60 * 2.2); w.blow(h, w.winchBox()); w.step(1); w.step(60 * 2.2); w.blow(h, w.winchBox()); w.step(1);
  ok(w.H.mech().kept === 0 && w.H.mech().wave, 'three blows spread over four and a half seconds (a gap over 2 s each) do not drop it');
  w.step(10); for (let i = 0; i < 3; i++) { w.blow(h, w.winchBox()); w.step(1); w.step(10); } ok(w.H.mech().kept === 1, 'three quick ones do'); }
console.log('== CO-OP: seats 2-4');
for (const n of [2, 3, 4]) {
  const w = make(n), gx = w.bell.gate * 16 + 8; w.e.x = gx + 200;
  ring(w, w.heroes[n - 1]); w.step(2); ok(w.e.mode === 'lure', n + ' seats: the LAST seat rings the bell and she hears it');
  for (let i = 0; i < 60 * 4 && !w.st.pins.length; i++) w.step(1); ok(w.st.pins.length === 1, n + ' seats: she is pinned');
  const v = make(n); v.e.hp = 1500; v.step(2); for (let i = 0; i < 3; i++) { v.blow(v.heroes[n - 1], v.winchBox()); v.step(1); v.step(20); } ok(v.H.mech().kept === 1, n + ' seats: the last seat cranks the winch, the gate drops');
  const x = make(n); x.e.hp = 1500; x.step(2);
  x.blow(x.heroes[0], x.winchBox()); x.step(1); x.step(20); x.blow(x.heroes[n - 1], x.winchBox()); x.step(1); x.step(20); x.blow(x.heroes[1], x.winchBox()); x.step(1);
  ok(x.H.mech().kept === 1, n + ' seats: blows from different seats add up to one crank');
  const y = make(n); y.e.hp = 1500; y.step(2); for (const h of y.heroes) h.x = y.A.x0 - 40; y.step(2); ok(y.heroes.every(h => h.x >= y.A.x0 + 6), n + ' seats: nobody walks out of the open west door');
}
console.log('== OTHER STAGES: nothing here runs off the hall');
{ const w = make(); w.e.stage = 'roof'; w.e.hp = 1000; w.step(5); ok(w.st.gate.length === 0, 'the tower top has no barracks gate (its hatch guards are the hands\' own)'); }
console.log('== WIRING (main.js, level.js, gqueen-hands.js)');
{ const m = rd('src/main.js'), lv = rd('src/level.js'), h = rd('src/gqueen-hands.js');
  ok(/!\(pr\.bell && pr\.bossGate && GQH && GQH\.on\(\)\)/.test(m), 'the generic bell strike steps aside for her hall bell (the hands own it, every seat)');
  ok(/grate: \(hold, by\) => gqGrateDrop\(hold, by\)/.test(m) && /westGate: open => gqWestGate\(open\)/.test(m) && /attackBox: \(\) => attackBox\(\), bell: \(\) => gqBell\(\)/.test(m) && /pin: \(e, x, by, txt, secs\) => gqPinFor/.test(m), 'GQH ctx: attackBox, bell, grate, pin, westGate');
  ok(/e\.pinBy === 'lure'\) dmg = Math\.round\(dmg \* GQ3\.mech\.pinMul\)/.test(m) && GM.pinMul > 1 && GM.pinMul <= 1.35, 'pinned by the lure: x' + GM.pinMul + ' a blow (GQ3.mech.pinMul: a bigger window than her plate)');   /* (claude/hcqueen) the tune lane's number, read from the hands */
  ok(/e\.pinBy === 'lure' && dmg > 0\) dmg = gqPinCap\(e, dmg\)/.test(m) && /function gqPinCap\(e, dmg\) \{ const cap = e\.maxHp \* GQ3\.mech\.pinCap/.test(m) && /e\.gqPinTaken = 0;/.test(m) && GM.pinCap >= 0.1 && GM.pinCap <= 0.25, 'one lured pin takes at most ' + GM.pinCap + ' of her bar (on what lands; then she heaves the grate off, never a zero)');   /* (claude/hcqueen) */
  ok(/OUTSIDE AN OPENING her plate turns a blade to 0\.4/.test(m), 'the 0.4x floor outside openings is untouched');
  ok(/RING THE HALL BELL YOURSELF: she storms to the sound/.test(m) && /crank the winch by the west door/.test(m), 'the bestiary text describes the lure and the winch');
  ok(/RING THE HALL BELL: SHE STORMS TO THE SOUND/.test(lv) && /CRANK THE WINCH BY THE DOOR/.test(lv) && /OR RING THE HALL BELL: SHE STORMS TO THE SOUND/.test(m), 'the hall signs and the first-WARDED tip say it');
  ok(/function gqRing\(/.test(m) && /case 'ringTell'/.test(m), 'her own bell ring stays (a tell for the player standing under the grate)');
  ok(/case 'lure': return lureStep/.test(h) && /mechStep\(dt\)/.test(h) && /mechDraw\(g, cx, cy, t\)/.test(h), 'the hands run the lure, the wave and the greybox winch');
  ok(/labDuty/.test(rd('src/lab.js')), 'the lab bot has a bell / winch duty'); }
console.log(fails ? '\nFAIL: ' + fails : '\nall ok');
process.exit(fails ? 1 : 0);
