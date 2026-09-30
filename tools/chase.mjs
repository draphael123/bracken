// tools/chase.mjs - THE CHASE ENGINE (claude/chase): the reusable chaser for the Minecart road, the Rockslide and the Ore Road collapse.
// The Falling Tower's spiral stair uses it (claude/towerscroll: tools/tower-chase.mjs); this fails when the ENGINE (src/chase.js + its hook in src/main.js) breaks:
//   PURE (src/chase.js, no page):
//     - THE CHASER advances, monotonically, and THE RUBBER BAND holds: with a hero running 60..92 px/s the gap never falls under rubber.min
//       (never unfair on a first try) and with a hero running 300 px/s it never passes rubber.max x LEASH (never no threat)
//     - THE WARNING comes BEFORE the speed-up: every 'warn' precedes its 'speedup', the chaser is still at the old speed when it is told, and a
//       curve row with no warning text is a lint failure
//     - CONTACT: a kill chase says 'kill'; a hurt chase says 'hurt' with its dmg, falls back to rubber.min and holds, so it cannot chain-hit
//     - AUTOSCROLL: the camera's edge is never behind the front (minus the edge margin) and never so far ahead that the hero is off it, both ways
//       along both axes; off, the camera is left alone
//     - START / END LINES: idle before the trigger, starts at the crossing (at spec.from), a hero already past the safe line never starts it, the
//       safe line ends it and the chaser crashes at the line and stops; a vertical chase going up works the same
//     - BEAMS: a standing hero under a beam is hit, a ducked one (clears) passes, one above it or beside it is not hit, a timed beam is raised on time
//     - THE LINT (chaseProblems): a good spec passes; no warning, no checkpoint, a rubber.max off the screen, a safe line behind the start are caught
//     - the glow and the rumble: none far, some near, steady in reduce motion; the rumble stays under the shake budget
//   IN THE PAGE:
//     - ONLY THE LEVELS LISTED HAVE L.chases (every level's build: the Falling Tower's rising dark, the Harvest Fair's ghost train), and each passes the lint with its own
//       checkpoints; the page without ?chase= has no chase and the demo is off
//     - ?chase=demo is the ONLY way in: the demo is up, bossJump.on is set, the whole run never writes the save
//     - the demo: it starts when the hero crosses the line, the warning is told before it speeds up, the camera is pushed, the front kills a hero who
//       stands (config 'kill'), hurts him (config 'hurt'), a death RESETS it (idle, at the checkpoint), the safe line ends it
//     - THE BEAM in the page: a standing hero under a beam loses health, a ducked one (duckClears) does not
//     - the cart's and the boat's beams answer duckClears now, not the down key
//   node tools/chase.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { chaseSpec, newChase, chaseStep, chaseCam, chaseDanger, chaseGap, beamHit, chaseProblems, drawGlow, drawChaser, rumbleFor, LEASH, MIN_FAIR, MAX_SCREEN } from '../src/chase.js';
import { SHAKE_CAP } from '../src/juice.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, cp = xs => xs.map(x => ({ x, y: 0 })), CP = cp([900]);
const BASE = { id: 't', trigger: 1000, end: 3000, gap0: 200, curve: [[0, 60], [400, 90, 'ROOF GROANS'], [900, 120, 'IT QUICKENS']], lead: 1.6 };
/* run a hero at a fixed speed along the axis from x0; returns everything the run produced */
function run(cfg, speed, { x0 = 900, secs = 40, stopAt = null, hero0 = null } = {}) {
  const sp = chaseSpec(cfg), st = newChase(); let x = hero0 ?? x0, gapMin = 1e9, gapMax = 0, evs = [], last = st.pos, mono = true, plateau = [];
  for (let i = 0; i < secs * 60; i++) {
    const v = stopAt !== null && (x - stopAt) * sp.dir >= 0 ? 0 : speed; x += sp.dir * v * DT;
    const e = chaseStep(sp, st, x, DT); for (const q of e) evs.push({ ...q, i, speed: st.speed, dist: st.dist });
    if (st.phase === 'run') { const g = chaseGap(sp, st, x); gapMin = Math.min(gapMin, g); gapMax = Math.max(gapMax, g); if ((st.pos - last) * sp.dir < -1e-9) mono = false; last = st.pos; }
    if (st.phase === 'done' && v === 0) break; if (evs.some(q => q.k === 'contact') && sp.contact === 'kill') break;
  }
  return { sp, st, x, gapMin, gapMax, evs, mono };
}

// ---- THE CHASER ADVANCES and THE RUBBER BAND ----
for (const sv of [60, 92]) {
  const r = run(BASE, sv, { x0: 900, secs: 60 });
  const started = r.evs.find(q => q.k === 'start'); ok(!!started, `hero at ${sv}: the chase never started`);
  ok(r.mono, `hero at ${sv}: the chaser went backwards`);
  ok(r.st.dist > 200 || r.st.phase === 'done', `hero at ${sv}: the chaser barely moved (${Math.round(r.st.dist)} px)`);
  ok(r.gapMin >= r.sp.rubber.min - 12, `hero at ${sv}: the gap fell to ${Math.round(r.gapMin)} px, under rubber.min ${r.sp.rubber.min}: a first try would not be fair`);
  ok(!r.evs.some(q => q.k === 'contact'), `hero at ${sv}: a hero running flat out was caught`);
}
{ const r = run(BASE, 300, { x0: 900, secs: 12 });
  ok(r.gapMax <= r.sp.rubber.max * LEASH + 1, `hero at 300: the gap reached ${Math.round(r.gapMax)} px, past the leash ${Math.round(r.sp.rubber.max * LEASH)}: no threat`);
  ok(r.gapMax > r.sp.rubber.max, 'hero at 300: the gap never passed rubber.max, so the leash was never tested'); }
{ const sp = chaseSpec(BASE); ok(sp.rubber.min >= MIN_FAIR && sp.rubber.max <= MAX_SCREEN, 'the default rubber band is not inside the fair range');
  const lo = chaseSpec({ ...BASE, rubber: { min: 5, max: 20 }, gap0: 10 }); ok(lo.rubber.min >= MIN_FAIR && lo.gap0 >= lo.rubber.min, 'a rubber.min or gap0 under MIN_FAIR is not raised to it'); }
{ const r = run(BASE, 0, { x0: 1010, secs: 30 }); ok(r.evs.some(q => q.k === 'contact'), 'a hero who stands still was never caught (the chaser must never stop)'); }

// ---- THE WARNING is told BEFORE the speed-up ----
{ const r = run(BASE, 92, { x0: 900, secs: 60 }), warns = r.evs.filter(q => q.k === 'warn'), ups = r.evs.filter(q => q.k === 'speedup');
  ok(warns.length === 2 && ups.length === 2, `expected 2 warnings and 2 speed-ups, got ${warns.length} and ${ups.length}`);
  for (let i = 0; i < Math.min(warns.length, ups.length); i++) {
    ok(warns[i].i < ups[i].i, `warning ${i} came after (or with) its speed-up`);
    ok(warns[i].dist < warns[i].at, `warning ${i} was told at dist ${Math.round(warns[i].dist)}, not before the row at ${warns[i].at}`);
    ok(warns[i].speed < ups[i].speed - 1e-9 || warns[i].speed <= (i ? BASE.curve[i][1] : BASE.curve[0][1]) + 0.5, `warning ${i}: the chaser was already speeding up when it was told`);
    ok(warns[i].text === BASE.curve[i + 1][2], `warning ${i} text is ${warns[i].text}`); }
  // and every frame: the speed is never above a row's speed unless that row's warning was told before
  const sp = chaseSpec(BASE), st = newChase(); let x = 900, told = new Set(), bad1 = null;
  for (let i = 0; i < 3600 && !bad1; i++) { x += 92 * DT; for (const q of chaseStep(sp, st, x, DT)) if (q.k === 'warn') told.add(q.i);
    for (let j = 1; j < sp.curve.length; j++) if (st.speed > sp.curve[j - 1].speed + 0.5 && !told.has(j) && st.speed > (sp.curve[j - 1].speed)) bad1 = `speed ${Math.round(st.speed)} at dist ${Math.round(st.dist)} with row ${j} not yet told`; }
  ok(!bad1, 'a speed-up with no warning: ' + bad1);
  // the warning gives a real lead: at least lead seconds of travel at the speed then
  ok(warns[0] && (warns[0].at - warns[0].dist) / Math.max(1, warns[0].speed) >= 1.0, 'the first warning leaves less than a second before the speed-up'); }
ok(chaseProblems([{ ...BASE, curve: [[0, 60], [400, 90]] }], CP).some(m => /no warning/.test(m)), 'a curve row with no warning text was not flagged');

// ---- CONTACT ----
{ const r = run({ ...BASE, contact: 'kill' }, 0, { x0: 1010, secs: 30 }), c = r.evs.find(q => q.k === 'contact'); ok(c && c.mode === 'kill', 'a kill chase did not say kill on contact'); }
{ const sp = chaseSpec({ ...BASE, contact: 'hurt', dmg: 33 }), st = newChase(); let x = 1010, hits = [], holdSeen = 0, gapAfter = null;
  for (let i = 0; i < 60 * 30; i++) { for (const q of chaseStep(sp, st, x, DT)) if (q.k === 'contact') { hits.push({ i, ...q }); gapAfter = chaseGap(sp, st, x); } if (st.hold > 0) holdSeen++; }
  ok(hits.length >= 2 && hits[0].mode === 'hurt' && hits[0].dmg === 33, 'a hurt chase did not say hurt with its dmg: ' + JSON.stringify(hits[0]));
  ok(hits.length >= 2 && hits[1].i - hits[0].i >= 0.6 * 60, 'a hurt chase hit again inside its hold (' + (hits[1] ? hits[1].i - hits[0].i : '-') + ' frames): it chain-hits');
  ok(holdSeen > 0, 'a hurt chase never held after the hit'); ok(gapAfter !== null && gapAfter >= sp.rubber.min - 1, 'a hurt chase did not fall back to rubber.min'); }

// ---- AUTOSCROLL ----
{ const sp = chaseSpec({ ...BASE, autoscroll: true }), st = newChase(); st.phase = 'run'; st.pos = 1500; const hero = 1650, VW = 320, e = sp.edge;
  ok(chaseCam(sp, st, 1400, VW, hero) >= st.pos - e, 'autoscroll: a camera lagging behind the front was not pushed');
  ok(chaseCam(sp, st, 1400, VW, hero) === st.pos - e, 'autoscroll: the push is not exactly to the front minus the edge');
  ok(chaseCam(sp, st, 2200, VW, hero) <= hero - e, 'autoscroll: a camera far ahead left the hero off the screen behind it');
  ok(chaseCam(sp, st, 1560, VW, hero) === 1560, 'autoscroll: a camera in the middle was moved');
  const off = chaseSpec({ ...BASE }); ok(chaseCam(off, st, 1400, VW, hero) === 1400, 'autoscroll off still moved the camera');
  const back = chaseSpec({ ...BASE, dir: -1, trigger: 3000, end: 1000, autoscroll: true }), s2 = newChase(); s2.phase = 'run'; s2.pos = 2000;
  ok(chaseCam(back, s2, 2100, VW, 1850) <= s2.pos + e - VW, 'autoscroll dir -1: the far edge was left behind the front');
  ok(chaseCam(back, s2, 1000, VW, 1850) >= 1850 + e - VW, 'autoscroll dir -1: a camera far ahead lost the hero');
  // the invariant in motion: a hero at every speed, the camera pulled toward him by a slow follow, is never behind the edge unless caught
  const r = { sp: chaseSpec({ ...BASE, autoscroll: true }), st: newChase() }; let x = 990, cam = 900, worst = 0;
  for (let i = 0; i < 60 * 30; i++) { x += 70 * DT; chaseStep(r.sp, r.st, x, DT); const t = x - 160; cam += (t - cam) * 0.08; if (r.st.phase === 'run') { cam = chaseCam(r.sp, r.st, cam, 320, x); worst = Math.max(worst, cam - x + 0); ok(x >= cam + 0, 'autoscroll: the hero fell behind the screen edge while free (cam ' + Math.round(cam) + ', hero ' + Math.round(x) + ')'); } }
}

// ---- START / END LINES, and the vertical chase ----
{ const sp = chaseSpec(BASE), st = newChase();
  for (let i = 0; i < 100; i++) chaseStep(sp, st, 900, DT); ok(st.phase === 'idle', 'the chaser started before the hero crossed the start line');
  const ev = chaseStep(sp, st, 1001, DT); ok(ev.some(q => q.k === 'start') && st.phase === 'run', 'crossing the start line did not start the chase');
  ok(Math.abs(st.pos - (1000 - 200)) < 5, 'the chaser did not start at trigger - gap0: ' + st.pos);
  const st2 = newChase(); chaseStep(sp, st2, 3500, DT); ok(st2.phase === 'idle', 'a hero already past the safe line started the chase');
  let x = 2990, evs = []; for (let i = 0; i < 600; i++) { x += 92 * DT; for (const q of chaseStep(sp, st, x, DT)) evs.push(q.k); }
  ok(evs.includes('end') && st.phase === 'done', 'crossing the safe line did not end the chase'); ok(evs.includes('crash'), 'the chaser did not crash at the safe line');
  ok(Math.abs(st.pos - sp.end) < 1 && st.speed === 0, 'the chaser did not stop at the safe line: ' + st.pos);
  ok(!evs.includes('contact'), 'the chase made contact after it ended');
  const up = chaseSpec({ id: 'u', axis: 'y', dir: -1, trigger: 3000, end: 1000, curve: [[0, 70]] }), su = newChase(); let y = 3100, evu = [];
  for (let i = 0; i < 60 * 40 && su.phase !== 'done'; i++) { y -= 92 * DT; for (const q of chaseStep(up, su, y, DT)) evu.push(q.k); }
  ok(evu[0] === 'start' && evu.includes('end') && !evu.includes('contact'), 'the vertical chase up did not run start..end clean: ' + evu.join(','));
  ok(su.pos < 3300 && su.pos <= 3000 + 1, 'the vertical chase did not move the way it was told (pos ' + Math.round(su.pos) + ')'); }

// ---- BEAMS ----
{ const b = { x0: 100, x1: 150, y: 200, th: 6 }, stand = { l: 120, r: 130, t: 200 - 14 + 3, b: 200 + 3 }, duck = { l: 120, r: 130, t: 200 - 8 + 3, b: 200 + 3 };
  // a hero whose feet are at 203: standing head 189 (under the beam's underside at 200), ducked head 195 (the beam is above his head only when y <= feet - 8)
  ok(beamHit({ l: 120, r: 130, t: 186, b: 200 }, false, b, 0), 'a standing hero under a beam was not hit');
  ok(!beamHit({ l: 120, r: 130, t: 192, b: 200 }, true, b, 0), 'a ducked hero (clears) was hit by a beam');
  ok(!beamHit({ l: 120, r: 130, t: 100, b: 150 }, false, b, 0), 'a hero above the beam was hit');
  ok(!beamHit({ l: 200, r: 210, t: 186, b: 200 }, false, b, 0), 'a hero beside the beam was hit');
  const timed = { ...b, period: 3, up: 1.2 }; ok(!beamHit({ l: 120, r: 130, t: 186, b: 200 }, false, timed, 0.5), 'a timed beam was live while raised'); ok(beamHit({ l: 120, r: 130, t: 186, b: 200 }, false, timed, 2), 'a timed beam was not live when lowered');
  void stand; void duck; }

// ---- THE LINT ----
{ const good = { ...BASE }; ok(chaseProblems([good], cp([900, 400])).length === 0, 'a good spec was flagged: ' + chaseProblems([good], cp([900, 400])).join('; '));
  ok(chaseProblems([good], cp([100])).some(m => /checkpoint/.test(m)), 'a chase with no checkpoint before its start line was not flagged');
  ok(chaseProblems([{ ...good, rubber: { max: 500 } }], CP).some(m => /off the screen|over/.test(m)), 'a rubber.max off the screen was not flagged');
  ok(chaseProblems([{ ...good, curve: [[0, 300]] }], CP).some(m => /pull away/.test(m)), 'a chaser too fast for the hero to pull away from was not flagged');
  ok(chaseProblems([{ ...good, rubber: { min: 20 } }], CP).some(m => /unfair/.test(m)), 'a rubber.min under the fair floor was not flagged');
  ok(chaseProblems([{ ...good, end: 500 }], CP).some(m => /past the start/.test(m)), 'a safe line behind the start line was not flagged');
  ok(chaseProblems([{ ...good, trigger: 'x' }], CP).length > 0, 'a spec with no trigger number was not flagged'); }

// ---- GLOW and RUMBLE ----
{ const sp = chaseSpec(BASE), st = newChase(); st.phase = 'run'; st.pos = 1000;
  const far = chaseDanger(sp, st, 1000 + 400), near = chaseDanger(sp, st, 1000 + 80), mid = chaseDanger(sp, st, 1000 + 180); ok(far === 0 && near > 0.8 && mid > 0 && mid < near, `the danger does not rise as the front closes: ${far} ${mid} ${near}`);
  ok(rumbleFor(0) === null && rumbleFor(0.05) === null, 'a far chaser rumbles'); const r1 = rumbleFor(1); ok(r1 && r1.n > 0 && r1.n <= SHAKE_CAP, 'the rumble is not inside the shake budget: ' + JSON.stringify(r1));
  const mk = () => { const a = []; return { a, g: { createLinearGradient: () => ({ addColorStop: (o, c) => a.push(c) }), fillRect() {}, save() {}, restore() {}, set fillStyle(v) {} } }; };
  const m1 = mk(); drawGlow(m1.g, sp, st, 0, 320, 180, 1, false); ok(m1.a.length === 0, 'the glow drew with no danger');
  const alphaAt = (t, still) => { const m = mk(); drawGlow(m.g, sp, st, 0.7, 320, 180, t, still); return m.a[0]; };
  ok(!!alphaAt(1, false), 'the glow drew nothing near the front'); ok(alphaAt(1, true) === alphaAt(2.37, true), 'reduce motion: the glow still pulses'); ok(alphaAt(0.1, false) !== alphaAt(0.2, false), 'the glow never pulses');
  const gm = { fillStyle: '', fillRect() {}, save() {}, restore() {} }; let threw = null; try { for (const look of ['rock', 'fire', 'drill']) for (const axis of ['x', 'y']) for (const dir of [1, -1]) drawChaser(gm, chaseSpec({ ...BASE, look, axis, dir }), { ...st }, 900, 900, 320, 180, 1); } catch (e) { threw = e.message; }
  ok(!threw, 'drawChaser threw: ' + threw); }

// ---- THE PAGE ----
const pg = await openPage({ audio: false, fonts: false }); const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAVE = { hero: 'knight', heroes: { knight: true }, wood: { cleared: true, mini: true, medal: 2 } };
async function nav(url) {
  try { await pg.evalp('(()=>{localStorage.clear();localStorage.setItem("bracken.progress.0",' + JSON.stringify(JSON.stringify(SAVE)) + ');window.__gone=1;setTimeout(()=>location.href=' + JSON.stringify(url) + ',30);})()', 3000); } catch { /* the page is going away */ }
  const search = url.replace(/^[^?]*/, '');
  for (let i = 0; i < 400; i++) { await sleep(150); const r = await pg.evalp('!window.__gone&&typeof window.BK==="object"&&!!window.BK.chase&&location.search===' + JSON.stringify(search), 3000).catch(() => false); if (r) return; }
  throw new Error('page never came up on ' + url);
}
let R = null, R0 = null;
try {
  await nav('/?nochase=1');
  R0 = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const CH = await import('/src/chase.js'); const withChases = [], lint = {};
    for (const lv of LEVELS) { let b; try { b = lv.build(); } catch { continue; } if (b.chases !== undefined) { withChases.push(lv.id); lint[lv.id] = CH.chaseProblems(b.chases, b.ents.filter(e => e.t === 'check').map(e => ({ x: e.x * 16 + 8, y: (e.y + 1) * 16 })).concat([{ x: b.START.x * 16 + 8, y: (b.START.y + 1) * 16 }])); } }
    return { withChases, lint, n: LEVELS.length, on: BK.chase.on(), demoOn: BK.chase.demoOn, bj: BK.bossJump.on, chases: (BK.L && BK.L.chases) };
  })()`, 120000);
  await nav('/?chase=demo');
  R = await pg.evalp(`(async()=>{
    BK.manualSimulation = true;
    const snap = () => JSON.stringify(Object.keys(localStorage).filter(k => k !== 'bracken.settings').sort().map(k => [k, localStorage.getItem(k)])); const seed = snap(); const out = { seed: /progress/.test(seed), demoOn: BK.chase.demoOn, bj: BK.bossJump.on, on: BK.chase.on(), problems: BK.chase.problems(), state: BK.state };
    const sp = () => BK.chase.specs()[0], S = () => BK.chase.states()[0], K = BK.keys;
    const none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clearFoes = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    out.spec = { music: sp().music, contact: sp().contact, trigger: sp().trigger, end: sp().end, beams: sp().beams.length, autoscroll: sp().autoscroll };
    clearFoes(); BK.P.inv = 0; out.before = S().phase; out.hp0 = BK.P.hp; out.hero0 = BK.P.x;
    // ---- a run: walk right, camera invariant every frame, warning before speed-up ----
    const run = { started: false, warnedAt: null, upAt: null, camBad: null, maxGap: 0, minGap: 1e9, ended: false, dead: false, frames: 0 };
    let lastSpeed = 0; K.right = true;
    for (let i = 0; i < 60 * 40; i++) { BK.god = true; BK.P.hp = BK.P.maxHp; BK.sim(1); BK.step(0); const s = S(); run.frames++;
      if (s.phase === 'run') { run.started = true; run.maxGap = Math.max(run.maxGap, s.gap); run.minGap = Math.min(run.minGap, s.gap);
        if (s.warnT > 0 && run.warnedAt === null) run.warnedAt = { dist: s.dist, speed: s.speed };
        if (s.speed > 63 && run.upAt === null) run.upAt = { dist: s.dist, warnedFirst: run.warnedAt !== null };
        lastSpeed = s.speed;
        const v = BK.view; const camL = v.x; if (camL > BK.P.x - 2 + 0) run.camBad = 'hero behind the camera edge ' + Math.round(camL) + ' vs ' + Math.round(BK.P.x);
        if (camL < s.pos - sp().edge - 1 && camL > 1) run.camBad = 'camera edge ' + Math.round(camL) + ' behind the front ' + Math.round(s.pos); }
      if (s.phase === 'done') { run.ended = true; break; } }
    none(); out.run = run; out.musicHeardOn = S().music; BK.sim(200); out.crashed = S().phase;
    BK.chase.reset();
    // ---- a hero who STANDS is caught (kill): dead, then the chase is back at idle ----
    BK.god = false; BK.P.hp = BK.P.maxHp; BK.tp(Math.round(sp().trigger / 16) + 1, Math.round(BK.P.y / 16) - 1); BK.P.inv = 0; BK.sim(2);
    out.standStart = S().phase; let d0 = null;
    for (let i = 0; i < 60 * 30; i++) { BK.sim(1); if (BK.P.dead > 0 || BK.P.hp <= 0) { d0 = i; break; } }
    out.caughtAt = d0; out.diedHp = BK.P.hp; BK.sim(150); out.afterRespawn = S(); out.respawnX = BK.P.x; out.dead2 = BK.P.dead;
    // ---- hurt config: heavy damage, not death, the chaser falls back ----
    sp().contact = 'hurt'; sp().dmg = 30; BK.P.inv = 0; BK.P.hp = BK.P.maxHp; BK.tp(Math.round(sp().trigger / 16) + 1, Math.round(BK.P.y / 16) - 1); BK.sim(2); const hp1 = BK.P.hp; let hurtAt = null;
    for (let i = 0; i < 60 * 30; i++) { BK.sim(1); if (BK.P.hp < hp1) { hurtAt = i; break; } }
    out.hurt = { at: hurtAt, lost: hp1 - BK.P.hp, alive: BK.P.dead <= 0 && BK.P.hp > 0, hold: S().hold, gap: S().gap }; sp().contact = 'kill'; BK.P.hp = BK.P.maxHp; BK.P.inv = 5;
    BK.chase.reset();
    BK.god = false; BK.tp(Math.round(sp().trigger / 16) - 2, Math.round(BK.P.y / 16) - 1); BK.sim(30);
    // ---- the BEAM in the page: standing is hit, ducked is not ----
    const b = sp().beams[0]; b.period = 0; BK.chase.beamCd = 0; const bx = Math.round((b.x0 + b.x1) / 2 / 16);
    const beamTrial = duck => { none(); BK.god = false; BK.P.inv = 0; BK.P.hp = BK.P.maxHp; BK.chase.beamCd = 0; BK.tp(bx, Math.round((b.y + 11) / 16) - 1); BK.P.hurt = 0; BK.P.vx = 0; BK.sim(40); BK.P.hurt = 0; BK.P.inv = 0; BK.P.hp = BK.P.maxHp; BK.chase.beamCd = 0; K.down = duck; BK.sim(12);
      const hp = BK.P.hp; const ducking = BK.duck().ducking, clears = BK.duck().clears(b.y); for (let i = 0; i < 40; i++) { BK.P.x = bx * 16 + 8; BK.P.vx = 0; BK.sim(1); if (duck) K.down = true; } const r = { hp0: hp, hp1: BK.P.hp, ducking, clears }; K.down = false; return r; };
    out.beamStand = beamTrial(false); out.beamDuck = beamTrial(true);
    out.saveSame = snap() === seed;
    return out;
  })()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(/m\.kind === 'cart' && !duckClears\(P,/.test(src), "the cart's beam does not answer duckClears");
ok(/aboard && !P\.dead && !duckClears\(P,/.test(src), "the boat's beam does not answer duckClears");
ok(!/m\.kind === 'cart' && !keys\.down/.test(src) && !/aboard && !P\.dead && !keys\.down/.test(src), 'a cart or boat beam still reads the down key');
ok(/shakeCam\(r\.n\)/.test(src), 'the rumble does not go through shakeCam (the shake budget)');
ok(/chaseDemo\(q\.get\('hero'\)\)/.test(src) && /if \(q\.get\('chase'\) === 'demo'\)/.test(src), 'the demo is not behind ?chase=demo');
ok((src.match(/chaseDemo\(/g) || []).length === 2, 'chaseDemo is called from somewhere other than the param and the BK tool');

console.log('level scan', JSON.stringify(R0));
ok(R0.n > 40, 'the level scan saw too few levels'); ok(JSON.stringify(R0.withChases) === JSON.stringify(['fallingtower', 'fair']), 'the levels with L.chases are not the ones listed (the Falling Tower spiral stair; the Harvest Fair ghost train, claude/fairfix; a new chase lane adds its level here): ' + R0.withChases.join(', '));
for (const [id, p] of Object.entries(R0.lint)) ok(p.length === 0, id + ' fails the chase lint: ' + p.join('; '));
ok(R0.on === false && R0.demoOn === false && R0.bj === false && !R0.chases, 'the page without ?chase= has a chase or is in playtest mode: ' + JSON.stringify(R0));
const D = R; console.log('demo', JSON.stringify(D));
ok(D.demoOn === true && D.bj === true && D.on === true, 'the demo is not up behind ?chase=demo, or is not marked never-save');
ok(D.problems.length === 0, 'the demo fails the level lint: ' + D.problems.join('; '));
ok(D.spec.music === 'boss' && D.spec.autoscroll && D.spec.beams === 1, 'the demo spec lost its music, autoscroll or beam');
ok(D.before === 'idle', 'the demo chaser is not idle before the hero crosses the line: ' + D.before);
ok(D.run.started, 'the demo chase never started when the hero walked across its line');
ok(D.run.warnedAt !== null, 'the demo never told a warning'); ok(D.run.upAt && D.run.upAt.warnedFirst, 'the demo chaser sped up with no warning before it');
ok(D.run.minGap >= 100 && D.run.maxGap <= 330, `the demo gap left the rubber band: ${Math.round(D.run.minGap)}..${Math.round(D.run.maxGap)}`);
ok(D.run.camBad === null, 'autoscroll: ' + D.run.camBad); ok(D.run.ended, 'the demo never ended when the hero walked to the safe line');
ok(D.crashed === 'done', 'the demo did not stay done after the safe line: ' + D.crashed);
ok(D.standStart === 'run', 'the demo did not start on the standing hero'); ok(D.caughtAt !== null, 'a hero who stood still was never killed by a kill chase');
ok(D.afterRespawn.phase === 'idle' && D.afterRespawn.dist === 0, 'a death did not reset the chase: ' + JSON.stringify(D.afterRespawn)); ok(D.dead2 <= 0, 'the hero was never respawned');
ok(D.respawnX < D.spec.trigger, 'the hero respawned past the start line (no checkpoint before it): ' + D.respawnX);
ok(D.hurt.at !== null && D.hurt.lost >= 15 && D.hurt.lost <= 60 && D.hurt.alive, 'a hurt chase did not hurt for about its dmg and leave him alive: ' + JSON.stringify(D.hurt));
ok(D.hurt.hold > 0 || D.hurt.gap >= 100, 'a hurt chase did not fall back after the hit: ' + JSON.stringify(D.hurt));
ok(D.beamStand.ducking === false && D.beamStand.hp1 < D.beamStand.hp0, 'a standing hero under a beam lost nothing: ' + JSON.stringify(D.beamStand));
ok(D.beamDuck.ducking === true && D.beamDuck.clears === true && D.beamDuck.hp1 === D.beamDuck.hp0, 'a ducked hero under a beam was hurt or did not duck: ' + JSON.stringify(D.beamDuck));
ok(D.seed && D.saveSame, 'the demo run wrote the save (or the seed was not there): ' + JSON.stringify({ seed: D.seed, same: D.saveSame }));

assert.deepEqual(bad, [], 'the chase engine:\n  ' + bad.join('\n  '));
console.log('the chase engine holds: the chaser advances inside its rubber band (never under ' + MIN_FAIR + ' px, never past the leash), every speed-up is warned first, contact kills or hurts by config, autoscroll pushes the camera both ways on both axes, lines start and end it, a death resets it, beams answer the duck, and only the listed levels have L.chases (each passing the lint); ?chase=demo is the only way in.');
