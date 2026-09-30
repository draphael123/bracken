// tools/puppeteer.mjs - THE PUPPETEER, the Maskwright's Theatre's boss (claude/puppeteer; PUPPETEER3 after Daniel played the second build). src/puppeteer.js
// is the fight (its header is the design). Every rule below was proved red first on a sabotaged copy (the lane report lists the sabotages).
// PURE (src/puppeteer.js, no page):
//   - THE DUO: the Harlequin is FAST AND WEAK (short tells, small blows, quick feet, little health) and the Brute SLOW AND HEAVY (long tells, 28+ a blow,
//     a long recovery after every swing, more health) - by their own numbers
//   - DAMAGE READS: a puppet's health falls under blows and at nothing it drops; a string is cut WHENEVER a blow crosses it (slack or gold); a GOLD cut
//     (in a windup) cancels the blow and staggers; a SLACK cut does not cancel, but the limb it held is gone: the Brute's ARM cut, no more chop or grab;
//     his BACK cut, no more slam; the Harlequin's one string cut, he drops
//   - A DROPPED PUPPET stays down its told time (PUP.downT) and is then strung again; one down lowers his bar (PUP.hangLow); BOTH down drag him to the
//     boards, OPEN (x PUP.openMul) for PUP.downOpenT s, said in the hint box; the hard way - his line struck from the gallery - jolts him open for PUP.joltT
//     s and not again for PUP.joltCd s; anywhere else a blow on him is PUP.ward; a minute left alone opens nothing
//   - THE PHASES: 1, the duo never START together; 2, they strike together, and the Brute's slam breaks the boards (a pit that mends once it is empty);
//     the slam reaches a hero on a flat or in a pit; 3, the Brute is packed away, the masterpiece comes with the Harlequin, and both down drag him down
//   - every attack fires (rule A3) and wears its mark, answer and height; the scene change lays its flats
// THE STAGE: the standalone level (walls, trigger past the door, a checkpoint outside, ~40 wide, the gallery, the batten, the duo, his music, R+2 solid)
// IN THE PAGE: a body blow takes a puppet's health (and the number shows); a real swing across a string cuts it; both dropped, he comes down open and a
//   blow bites; the pin rail is free from the start; the gallery is iron; his death ends the fight; and THE HUMAN BOT wins a fight while taking real damage.
//   node tools/puppeteer.mjs        (PORT from tools/ports.mjs)
import { openPage } from './cdp.mjs';
import * as M from '../src/puppeteer.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { LEVELS } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, R = 20, SX = 14, FLOOR = R * TS, GAL = (R - 9) * TS, P = M.PUP;
const A = { x0: (SX + 1) * TS, x1: (SX + 39) * TS, floor: FLOOR, gallery: GAL, gx0: (SX + 3) * TS, gx1: (SX + 39) * TS, sx: SX, TS, y0: (R - 15) * TS };
function rig(o = {}) {
  const show = M.newShow(A), e = M.newPuppeteer({ t: 'puppeteer', x: o.bx ?? (SX + 30) * TS, y: GAL, hp: o.hp ?? 720, maxHp: 720, alive: true });
  e.mode = 'work'; e.modeT = 0; e.phase = o.phase || 1;
  const mk = (t, x) => M.newPuppet({ t, x, y: FLOOR, alive: true, face: -1 }, show);
  const bru = mk('marionette', o.bruX ?? 420), har = mk('harlequin', o.harX ?? 640);
  if (o.noHarl) { har.alive = false; har.mode = 'packed'; } if (o.noBrute) { bru.alive = false; bru.mode = 'packed'; }
  const hero = { x: o.x ?? 390, y: FLOOR, face: 1, alive: true, ground: true, stillT: 0 };
  const log = { hits: [], bands: [], lines: [], tiles: [], pits: [], events: {}, summons: 0 };
  const c = { heroes: [hero], say: () => {}, sound: () => {}, number: (x, y, t) => log.lines.push(t),
    hit: (box, d, name, opt = {}) => log.hits.push({ box, d, name, opt }), band: (...a) => log.bands.push(a), tile: (x, y, t) => log.tiles.push({ x, y, t }),
    pit: (x0, x1, open) => log.pits.push({ x0, x1, open }), pack: p => { p.alive = false; },
    summon: (t, x, y) => { log.summons++; M.newPuppet({ t, x, y, alive: true, face: -1 }, show); return null; } };
  const step = () => { hero.lastFloor = M.heroFloor(show, { ...hero, lastFloor: hero.lastFloor }); const ev = M.stepShow(e, show, DT, c); for (const v of ev) log.events[v.t] = (log.events[v.t] || 0) + 1; return ev; };
  const boxAt = (px, py, face = 1) => face > 0 ? { l: px + 2, r: px + 26, t: py - 28, b: py } : { l: px - 26, r: px - 2, t: py - 28, b: py };
  return { show, e, bru, har, hero, log, c, step, boxAt };
}
const until = (r, pred, n = 600) => { for (let i = 0; i < n; i++) { if (pred()) return true; r.step(); } return pred(); };
const strOf = (r, p, k) => M.stringsOf(r.e, r.show).find(q => q.p === p && q.k === k);
const boxOn = s => ({ l: s.x1 - 4, r: s.x1 + 4, t: s.y1 - 4, b: s.y1 + 4 });

// ---- THE DUO, by their numbers ----
{ const h = P.harl, b = P.brute;
  ok(h.jab <= 10 && h.kick <= 12 && h.jabTell <= 0.5 && h.kickTell <= 0.6 && h.speed >= 2 * b.speed, 'the Harlequin is not fast and weak: jab ' + h.jab + ', tells ' + h.jabTell + '/' + h.kickTell + ', speed ' + h.speed);
  ok(b.chop >= 28 && b.slam >= 28 && b.grab >= 28 && b.chopTell >= 1.0 && b.slamTell >= 1.0 && b.grabTell >= 1.0 && b.recover >= 1.2, 'the Brute is not slow and heavy: ' + JSON.stringify({ chop: b.chop, slam: b.slam, grab: b.grab, tells: [b.chopTell, b.slamTell, b.grabTell], recover: b.recover }));
  ok(h.hp < b.hp, 'the Harlequin (' + h.hp + ') is no more fragile than the Brute (' + b.hp + ')'); }
// ---- DAMAGE READS: health falls and at nothing the puppet drops ----
{ const r = rig({ noHarl: true, x: 200 }); r.bru.hp -= 50; r.step(); ok(!M.heaped(r.bru) && r.bru.hp === P.brute.hp - 50, 'blows on the Brute did not simply take his health');
  r.bru.hp = 0; r.step(); ok(M.heaped(r.bru) && r.log.events.heap === 1, 'the Brute with no health left did not drop'); }
// ---- A SLACK CUT: cut, no cancel, the limb gone ----
{ const r = rig({ noHarl: true, x: 200, bruX: 420 }); r.step(); const s = strOf(r, r.bru, 'arm');
  ok(s && !s.taut, 'the Brute hanging has no slack arm string to test');
  const c = M.strikeStrings(r.e, r.show, boxOn(s), new Set()); ok(c.length === 1 && c[0].limb === 'arm' && !c[0].gold, 'a swing across the Brute\'s SLACK arm string did not cut it');
  r.hero.x = 400; let chop = 0, grab = 0, slam = 0; for (let i = 0; i < 60 * 20; i++) { r.step(); if (r.bru.mode === 'chopTell') chop++; if (r.bru.mode === 'grabTell') grab++; if (r.bru.mode === 'slamTell') slam++; if (M.heaped(r.bru)) break; }
  ok(chop === 0 && grab === 0 && slam > 0, 'with his arm string cut the Brute still chopped or grabbed (chop ' + chop + ', grab ' + grab + ', slam ' + slam + ')'); }
{ const r = rig({ noHarl: true, x: 200, bruX: 420 }); r.step(); r.bru.str[1].cut = true;   /* (the back string, and only it) */
  r.hero.x = 400; let slam = 0, other = 0; for (let i = 0; i < 60 * 20; i++) { r.step(); if (r.bru.mode === 'slamTell') slam++; if (r.bru.mode === 'chopTell' || r.bru.mode === 'grabTell') other++; }
  ok(slam === 0 && other > 0, 'with his back string cut the Brute still slammed (slam ' + slam + ', chop/grab ' + other + ')'); }
// ---- A GOLD CUT cancels the blow ----
{ const r = rig({ noHarl: true, x: 400, bruX: 425 }); ok(until(r, () => /Tell$/.test(r.bru.mode), 600), 'the Brute never wound up at a hero 25 px away');
  const s = strOf(r, r.bru, r.bru.mode === 'slamTell' ? 'arm' : 'back'); ok(s && s.taut, 'a string of the Brute winding up is not gold');
  const c = M.strikeStrings(r.e, r.show, boxOn(s), new Set()); r.step();
  ok(c.length === 1 && c[0].gold && r.bru.mode === 'stagger' && r.log.events.cancel === 1, 'a GOLD cut did not cancel the Brute\'s blow (mode ' + r.bru.mode + ')');
  for (let i = 0; i < 60; i++) r.step(); ok(!r.log.hits.some(h => h.name === 'THE BRUTE' || h.name === 'THE SLAM'), 'the cancelled blow landed anyway'); }
// ---- THE HARLEQUIN: one cut drops him; down his told time; then strung again ----
{ const r = rig({ noBrute: true, x: 200, harX: 460 }); r.step(); const s = strOf(r, r.har, 'cross'); M.strikeStrings(r.e, r.show, boxOn(s), new Set()); r.step();
  ok(M.heaped(r.har), 'one cut did not drop the Harlequin');
  let t = 0; while (M.heaped(r.har) && t < 60 * 20) { r.step(); t++; if (r.e.mode !== 'work' && r.e.mode !== 'hang1') break; } }
{ const r = rig({ x: 200 }); r.har.hp = 0; r.step(); r.step(); let t = 0; while (M.heaped(r.har) && t < 60 * 20) { r.step(); t++; }
  ok(Math.abs(t * DT - P.downT.harlequin) < 0.1, 'a dropped Harlequin stayed down ' + (t * DT).toFixed(2) + ' s, not ' + P.downT.harlequin);
  ok(r.har.hp === r.har.maxHp && M.stringsLeft(r.har) === 1, 'the Harlequin came back without his health or his string'); }
// ---- HIS BAR: one down lowers it; both down drag him to the boards, open ----
{ const r = rig({ x: 200 }); r.har.hp = 0; for (let i = 0; i < 90; i++) r.step();
  ok(Math.abs(r.e.y - (GAL + P.hangLow)) < 2 && r.e.mode === 'hang1', 'one puppet down and his bar did not sink ' + P.hangLow + ' px (y ' + r.e.y + ')');
  ok(!M.pupOpen(r.e) && M.pupTake(r.e) === P.ward, 'with one puppet down he is already open');
  r.bru.hp = 0; ok(until(r, () => r.e.mode === 'downed', 120), 'both puppets down and he was not dragged to the boards (mode ' + r.e.mode + ')');
  ok(r.e.y === FLOOR && M.pupOpen(r.e) && M.pupTake(r.e) === P.openMul, 'dragged down he is not on the boards open at ' + P.openMul);
  ok(r.log.lines.includes("HE'S DOWN - STRIKE HIM"), 'his fall was not said in the hint box');
  let t = 0; while (r.e.mode === 'downed' && t < 600) { r.step(); t++; } ok(Math.abs(t * DT - P.downOpenT) < 0.05, 'the open window is ' + (t * DT).toFixed(2) + ' s, not ' + P.downOpenT);
  ok(until(r, () => r.e.mode === 'work' && !M.heaped(r.bru) && !M.heaped(r.har), 60 * 6), 'after the window he did not haul himself up and string the duo again'); }
{ const r = rig({ x: 250 }); let opened = 0; for (let i = 0; i < 60 * 60; i++) { r.hero.x = 250; r.step(); if (M.pupOpen(r.e)) opened++; }
  ok(opened === 0, 'left alone for a minute he was open ' + opened + ' frames'); }
// ---- THE HARD WAY: his line from the gallery ----
{ const r = rig({ x: 200 }); r.step(); const l = M.hangLine(r.e, r.show);
  ok(M.strikeLine(r.e, r.show, { l: l.x0 - 4, r: l.x0 + 4, t: l.y1 - 10, b: l.y1 }) && r.e.mode === 'jolted' && M.pupOpen(r.e) && r.e.y === GAL, 'a blow on his line did not jolt him open onto the gallery');
  let t = 0; while (r.e.mode === 'jolted' && t < 600) { r.step(); t++; } ok(Math.abs(t * DT - P.joltT) < 0.05, 'the jolt is ' + (t * DT).toFixed(2) + ' s, not ' + P.joltT);
  ok(!M.strikeLine(r.e, r.show, { l: l.x0 - 4, r: l.x0 + 4, t: l.y1 - 10, b: l.y1 }), 'his line jolted him again at once (the cooldown is ' + P.joltCd + ' s)'); }
// ---- THE PHASES ----
{ const r = rig({ x: 430, bruX: 450, harX: 410 }); let together = 0, starts = 0;
  for (let i = 0; i < 60 * 60; i++) { const b0 = r.bru.mode, h0 = r.har.mode; r.hero.x = 430 + 20 * Math.sin(i / 50); r.step();
    const bs = /Tell$/.test(r.bru.mode) && !/Tell$/.test(b0), hs = /Tell$/.test(r.har.mode) && !/Tell$/.test(h0); if (bs && hs) together++; if (bs || hs) starts++;
    for (const p of [r.bru, r.har]) if (M.heaped(p)) { p.hp = p.maxHp; p.mode = 'hang'; p.str.forEach(s => s.cut = false); p.alive = true; } }
  ok(starts > 10 && together === 0, 'phase 1: the duo started windups on the same frame ' + together + ' times (of ' + starts + ')'); }
{ const r = rig({ x: 430, bruX: 450, harX: 410, hp: 450 }); r.e.phase = 2; let both = 0;
  for (let i = 0; i < 60 * 60; i++) { r.hero.x = 430 + 20 * Math.sin(i / 50); r.step(); if (/Tell$|^(jab|kick)$/.test(r.har.mode) && /Tell$|^(chop|slam|grab)$/.test(r.bru.mode)) both++;
    for (const p of [r.bru, r.har]) if (M.heaped(p)) { p.hp = p.maxHp; p.mode = 'hang'; p.str.forEach(s => s.cut = false); p.alive = true; } }
  ok(both > 30, 'phase 2: the duo never struck together (' + both + ' frames)');
  ok(r.log.pits.some(q => q.open) && r.log.pits.some(q => !q.open), 'phase 2: the Brute\'s slam did not break the boards (and mend them)'); }
{ const r = rig({ noHarl: true, x: 430, bruX: 470, hp: 450 }); r.e.phase = 2; r.hero.y = FLOOR - 48; let slam = 0;
  for (let i = 0; i < 60 * 20; i++) { r.step(); if (r.log.hits.some(h => h.name === 'THE SLAM' && h.box[3] === FLOOR - 48)) { slam++; break; } }
  ok(slam > 0, 'a hero standing on a flat was out of the Brute\'s reach (the slam must shake the flat)'); }
{ const r = rig({ hp: 230, x: 300 }); r.e.phase = 2; r.step();
  ok(r.e.phase === 3 && r.bru.mode === 'packed' && !M.heaped(r.har) && r.log.summons === 1, 'phase 3: the Brute was not packed away for the masterpiece, or the Harlequin went too');
  const mp = r.show.puppets.find(p => p.t === 'masterpiece'); ok(mp && mp.maxHp === P.master.hp && mp.str.length === 4, 'the masterpiece has not its health and four strings');
  if (mp) { until(r, () => mp.mode === 'hang', 300); mp.hp = 0; r.har.hp = 0; ok(until(r, () => r.e.mode === 'downed', 200), 'phase 3: the masterpiece and the Harlequin down did not drag him down'); } }
// ---- EVERY ATTACK FIRES; THE MARKS ----
{ const fired = {}; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const ph of [1, 2, 3]) { const r = rig({ hp: ph === 1 ? 720 : ph === 2 ? 450 : 200, x: 420 }); if (ph > 1) r.e.phase = ph - 1;
    for (let i = 0; i < 60 * 60; i++) { if (i % 120 === 0) { r.hero.x = A.x0 + 60 + rnd() * (A.x1 - A.x0 - 120); r.hero.y = ph > 1 && rnd() < 0.3 ? GAL : FLOOR; const mp = r.show.puppets.find(p => p.t === 'masterpiece'); if (ph === 3 && mp && rnd() < 0.5) { r.hero.x = mp.x + (rnd() < 0.5 ? -40 : 40); r.hero.y = FLOOR; } } r.step();
      for (const k of ['jab', 'kick', 'chop', 'slam', 'grab', 'swat', 'stomp', 'reach', 'whip']) if (r.show.n[k]) fired[k] = true; } }
  for (const k of ['jab', 'kick', 'chop', 'slam', 'grab', 'swat', 'stomp', 'reach', 'whip']) ok(fired[k], 'THE ' + k.toUpperCase() + ' never fired in a fuzz of the three phases (rule A3)'); }
const ROWS = { 'harlequin|jabTell': ['!', 'block', 'low'], 'harlequin|kickTell': ['!!', 'jump', 'low'], 'marionette|chopTell': ['!!', 'dodge', 'low'], 'marionette|slamTell': ['!!', 'jump', 'low'],
  'marionette|grabTell': ['!!', 'dodge', 'low'], 'masterpiece|swatTell': ['!', 'block', 'low'], 'masterpiece|stompTell': ['!!', 'dodge', 'low'], 'masterpiece|reachTell': ['!!', 'duck', 'high'],
  'puppeteer|whipLowTell': ['!!', 'jump', 'low'], 'puppeteer|whipHighTell': ['!!', 'duck', 'high'] };
for (const [k, [m, a, hgt]] of Object.entries(ROWS)) { ok(MARK[k] === m, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + m); ok(ANSWER[k] === a, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + a); ok(HEIGHT[k] === hgt, k + ' is ' + JSON.stringify(HEIGHT[k]) + ', not ' + hgt); }
// ---- THE STAGE ----
{ const lv = LEVELS.find(l => l.id === 'puppetstage'); ok(lv && lv.hidden, 'the standalone stage is not a hidden level');
  if (lv) { const L = lv.build(), A2 = L.arena; ok(A2 && A2.boss === 'puppeteer' && A2.music === 'puppeteer', 'the stage is not his arena with his music');
    const w = A2.wallR - A2.wallL; ok(w >= 36 && w <= 44, 'the stage is ' + w + ' wide');
    ok(A2.trigger > (A2.wallL + 1) * 16 && L.ents.some(e => e.t === 'check' && e.x < A2.wallL), 'the trigger is not past the door, or no checkpoint stands outside');
    ok(L.ents.filter(e => e.t === 'puppeteer').length === 1 && L.ents.some(e => e.t === 'marionette') && L.ents.some(e => e.t === 'harlequin'), 'he and his duo are not on the stage');
    ok((L.moversExtra || []).some(m => m.batten), 'the stage has no batten');
    let under = 0; for (let x = A2.wallL + 1; x < A2.wallR; x++) if (L.grid[(A2.stage.R + 2) * L.W + x] === 1) under++; ok(under >= 36, 'row R+2 under the stage is not solid: ' + under); } }

// ---- IN THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='puppetstage'));BK.state='play';BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};
    const e=boot(),PH=BK.puppeteerHands(),S=PH.show(),A=BK.L.arena,P=BK.P;
    out.woke=BK.bossActive&&e&&e.t==='puppeteer';out.iron=PH.read().iron;out.free=S.free;
    const bru=S.puppets.find(p=>p.t==='marionette'),har=S.puppets.find(p=>p.t==='harlequin');
    const hp0=bru.hp;BKT.hurtEnemy(bru,20,bru.x-10,false);out.body={lost:hp0-bru.hp,alive:bru.alive,flash:bru.flash>0};
    const bh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.ward=bh-e.hp;
    /* a real swing across the Brute's arm string */
    har.x=A.x1-30;S.gap=9;let q=null;for(let i=0;i<30;i++){BK.sim(1);q=(await import('/src/puppeteer.js')).stringsOf(e,S).find(s=>s.p===bru&&s.k==='arm');}
    P.x=q.x1-14;P.y=A.floor;P.face=1;P.vx=0;BK.sim(2);const l0=bru.str.filter(s=>!s.cut).length;BK.press('atk');BK.sim(14);out.swing={l0,l1:bru.str.filter(s=>!s.cut).length};
    for(const p of [bru,har])p.hp=0;let f=0;for(;f<400&&e.mode!=='downed';f++)BK.sim(1);
    const oh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.open={mode:e.mode,y:e.y,dmg:oh-e.hp,floor:A.floor,bar:BK.bossOpen(e)};
    const e3=boot();e3.hp=1;e3.mode='downed';e3.modeT=3;BKT.hurtEnemy(e3,99,e3.x-10,false);for(let i=0;i<200&&BK.bossActive;i++){BK.P.inv=99;BK.sim(1);}
    const S3=BK.puppeteerHands().show();out.death={alive:e3.alive,active:BK.bossActive,curtain:S3.curtain>0};
    /* THE HUMAN BOT: one whole fight, the knight, normal health */
    const o=await BK.bossLab({bosses:['puppetstage'],heroes:['knight'],healthMode:'normal',maxSecs:300,salt:1});const row=o.rows[0];
    out.bot={out:row.outcome,taken:Math.round(row.health.damageTaken),secs:row.secs};
    return out;})()`, 900000);
  ok(r.woke, 'the fight did not wake past the stage door');
  ok(r.iron >= 30, 'the fly gallery does not wear the iron grating (' + r.iron + ')');
  ok(r.free === true, 'the pin rail is not free from the start (the hard way must always be there)');
  ok(r.body.lost === 20 && r.body.alive && r.body.flash, 'a blow on the Brute\'s body did not take its health: ' + JSON.stringify(r.body));
  ok(r.ward > 0 && r.ward <= Math.ceil(50 * P.ward) + 2, 'a blow on him hanging was not warded at ' + P.ward + ' (' + r.ward + ' of 50)');
  ok(r.swing.l1 === r.swing.l0 - 1, 'a real swing across the Brute\'s string did not cut it: ' + JSON.stringify(r.swing));
  ok(r.open.mode === 'downed' && r.open.y === r.open.floor && r.open.bar && r.open.dmg >= 45, 'both puppets down, he did not come down open to a full blow: ' + JSON.stringify(r.open));
  ok(!r.death.alive && !r.death.active && r.death.curtain, 'his death did not end the fight and bring the curtain down: ' + JSON.stringify(r.death));
  ok(r.bot.out === 'win' && r.bot.taken >= 10, 'the human bot (knight, salt 1) did not win while taking real damage: ' + JSON.stringify(r.bot));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }

if (bad.length) { console.log('PUPPETEER: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  puppeteer  the duo (fast weak, slow heavy), damage reads (health, any cut, the gold cancel, limp limbs), drop both and he comes down open, the jolt, the phases, every attack, the stage, and in the page with the human bot');
