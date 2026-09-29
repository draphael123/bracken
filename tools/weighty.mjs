// tools/weighty.mjs — COMBAT: CLASSIC / WEIGHTY (claude/ssproto, Daniel 2026-09-29: a Salt & Sanctuary-style prototype behind ONE switch).
//
// The switch (src/weighty.js) is off by default and every rule is asked through it. This fails when:
//   THE SWITCH   a fresh page is not classic, ?combat= and the saved setting do not decide it the documented way (combatFrom), or the
//                common blows are not x1.25 with it off and x1.4 with it on (and x1.25 again when it goes off)
//   OFF          the Hornet Queen is not the classic fight: her swarm must still turn most of a blow, her health must be the classic
//                number, her mark must be up from the first frame of a windup; a jump must still come out of a swing; a Kingswood
//                brute must still flinch to the first cut, a shield must never parry, a pike must not tell from lunge range, and an
//                archer at 90 px must not back off
//   ON           the Queen takes a whole blow outside her openings with her swarm up, an opening (winded) still pays MORE, and her
//                health is raised by queen.hp; a jump and a dodge pressed during a swing or its recovery do nothing (the recovery is
//                there, by the blow's weight) and a jump after it works; her dive is sometimes HELD (the windups are not all one
//                length), one is a FEINT that throws nothing, wears no mark and hands to a real told dive; the mark arrives part-way
//                (markAt) into every windup, after the pose; in Kingswood a brute swings through two cuts and the next BREAKS him, a
//                shield hit three times on its guard PARRIES (the hero reels) and COUNTERS on a yellow ! that lands, a brute FEINTS
//                (pose, no mark, no blow), a pike LUNGES from range and lands, an archer at 90 px backs off; and the Kingswood foes the
//                rules touch never hurt a standing hero without a windup of their own in the three seconds before
//   the page throws.
//   node tools/weighty.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { WEIGHTY, combatFrom } from '../src/weighty.js';

const bad = [];
// ---- THE SWITCH, in Node ----
for (const [p, s, want] of [[null, undefined, 'classic'], [null, 'classic', 'classic'], [null, 'weighty', 'weighty'], ['weighty', undefined, 'weighty'], ['classic', 'weighty', 'classic'], ['nonsense', undefined, 'classic']])
  if (combatFrom(p, s) !== want) bad.push(`combatFrom(${p}, ${s}) is ${combatFrom(p, s)}, not ${want}`);

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    BK.manualSimulation = true; BK.SET.speed = 1;
    const out = { fresh: BK.combat() };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk', 'dodge']) K[k] = false; };
    /* ---- THE COMMON BLOWS ---- */
    const dm = () => BK.dmgCommon();
    const c0 = dm(); BK.setCombat('weighty'); const w = dm(); BK.setCombat('classic'); const c1 = dm();
    out.dmg = { n: Object.keys(c0).length, offOk: Object.values(c0).every(([b, v]) => v === Math.round(b * 1.25)), onOk: Object.values(w).every(([b, v]) => v === Math.round(b * ${WEIGHTY.commonDamage})),
      backOk: JSON.stringify(c0) === JSON.stringify(c1), sample: c0.archer ? [c0.archer, w.archer] : null };

    /* ---- THE HORNET QUEEN ---- */
    const boot = (id, hero) => { BK.setHero(hero || 'knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === id)); BK.state = 'play'; BK.god = true;
      const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(150); return BK.boss; };
    const queenBlows = () => { const b = boot('wood'); const r = { maxHp: b.maxHp };
      b.mode = 'call'; b.modeT = 0; BK.sim(2); r.drones = BK.enemies().filter(d => d.alive && d.t === 'wasp' && d.drone).length;
      BK.P.heavy = false; BK.P.heavySwing = false;
      b.mode = 'hover'; b.modeT = 9; b.hp = b.maxHp; let h0 = b.hp; BKT.hurtEnemy(b, 20, b.x - 12, false); r.hover = h0 - b.hp;
      b.mode = 'winded'; b.modeT = 9; h0 = b.hp; BKT.hurtEnemy(b, 20, b.x - 12, false); r.winded = h0 - b.hp;
      return r; };
    /* her windups, watched: the mark over each (what the screen draws: BK.markShown), when it arrives, how long each windup is, and the feints */
    const BASES = ${JSON.stringify([0.8, 0.6, 0.55].map(b => +(b * WEIGHTY.queen.windK + 0.02).toFixed(3)))};   /* her dive windups unheld (x windK, and a frame) */
    const queenWatch = (secs, loaded) => { const b = boot('wood'); const rnd = Math.random; if (loaded) Math.random = () => 0.01;   /* loaded: every pick a dive, every other dive a feint */ const P = BK.P; P.x = (BK.L.arena.x0 + BK.L.arena.x1) / 2; none();
      const r = { aims: [], feints: 0, feintMarked: 0, afterFeint: [], markAtStart: 0, windups: 0, fracs: [], poseFirst: 0 };
      let prev = b.mode, cur = null;
      for (let f = 0; f < secs * 60; f++) {
        BK.sim(1); b.hp = b.maxHp; P.hp = P.maxHp;
        const m = b.mode, told = BK.telling(b), shown = BK.markShown(b);
        if (m !== prev) {
          if (cur && cur.m === prev) { cur.len = f - cur.f0; if (cur.m === 'aim') r.aims.push(cur.len / 60); if (cur.mark != null) r.fracs.push(+((cur.mark - cur.f0) / cur.len).toFixed(2)); }
          if (prev === 'feintOff') r.afterFeint.push(m);
          cur = told ? { m, f0: f, mark: null } : null;
          if (told) { r.windups++; if (shown) r.markAtStart++; else r.poseFirst++; }
          if (m === 'feint') r.feints++;
        }
        if ((m === 'feint' || m === 'feintOff') && (shown || told)) r.feintMarked++;
        if (cur && cur.mark == null && shown) cur.mark = f;
        prev = m;
        if (!loaded && r.aims.some(a => BASES.every(q => Math.abs(a - q) > 0.06)) && r.aims.length >= 6 && f > 60 * 40) break;   /* until one is seen held */
      }
      Math.random = rnd; r.aims = r.aims.map(x => +x.toFixed(2)); return r; };
    out.qOff = queenBlows(); out.qOffWatch = queenWatch(30);
    BK.setCombat('weighty'); out.qOn = queenBlows(); out.qOnWatch = queenWatch(240); out.qOnLoaded = queenWatch(20, true); BK.setCombat('classic');

    /* ---- THE BLADE COMMITS ---- */
    const flat = id => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === id)); BK.start(); BK.god = false;
      const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
      for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
        let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
        if (ok) spot = [x0 + 9, y]; }
      return spot; };
    const home = spot => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; none(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.vx = 0; BK.P.face = 1; };
    const commit = () => { const spot = flat('stockade'); const P = BK.P, r = {};
      home(spot); BK.press('atk'); K.atk = true; BK.sim(1); K.atk = false; BK.sim(3); r.swinging = P.atk >= 0; BK.press('jump'); K.jump = true; BK.sim(2); K.jump = false; r.jumpInSwing = P.vy < -50 || !P.ground;
      BK.sim(40); home(spot); BK.press('atk'); K.atk = true; BK.sim(1); K.atk = false;
      let f = 0; while (P.atk >= 0 && f < 90) { BK.sim(1); f++; } r.recovery = +BK.recovery().toFixed(2);
      if (BK.recovery() > 0.05) { BK.press('jump'); K.jump = true; BK.sim(1); K.jump = false; BK.sim(1); r.jumpInRec = P.vy < -50 || !P.ground; }
      BK.sim(30); home(spot); BK.press('atk'); K.atk = true; BK.sim(1); K.atk = false; f = 0; while (P.atk >= 0 && f < 90) { BK.sim(1); f++; }
      if (BK.recovery() > 0.05) { BK.press('dodge'); K.dodge = true; BK.sim(1); K.dodge = false; BK.sim(1); r.dodgeInRec = P.dodge > 0; }
      f = 0; while (BK.recovery() > 0 && f < 60) { BK.sim(1); f++; } BK.sim(10); BK.press('jump'); K.jump = true; BK.sim(2); K.jump = false; r.jumpAfter = P.vy < -50 || !P.ground;
      return r; };
    out.cOff = commit(); BK.setCombat('weighty'); out.cOn = commit(); BK.setCombat('classic');

    /* ---- KINGSWOOD ---- */
    const kings = () => { const spot = flat('kings'); const P = BK.P, X = spot[0] * 16 + 8, r = {};
      const put = (t, dx) => { home(spot); const [e] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); if (e) { e.hp = 999; e.face = -1; } return e; };
      /* POISE: three light cuts on a brute in his overhead's windup */
      { const e = put('brute', 2); BK.sim(1); e.mode = 'raise'; e.modeT = 5; e.stagger = 0; const seq = [];
        for (let i = 0; i < 3; i++) { P.heavy = false; P.heavySwing = false; BKT.hurtEnemy(e, 4, X, false); seq.push({ st: +(e.stagger || 0).toFixed(2), broken: +(e.broken || 0).toFixed(2) }); BK.sim(1); seq[i].mode = e.mode; e.stagger = Math.min(e.stagger, e.broken > 0 ? 9 : 0); }
        r.poise = seq; }
      /* THE PARRY: three swings on a shield's guard, then its counter */
      { const e = put('shield', 2); let pr = null, marks = new Set(), hit = 0, tells = 0; const hp0 = P.hp;
        for (let i = 0; i < 3; i++) { P.x = e.x - 18; P.vx = 0; P.face = 1; e.face = -1; P.hurt = 0; BK.press('atk'); K.atk = true; BK.sim(1); K.atk = false; for (let k = 0; k < 20 && e.mode !== 'counterTell'; k++) BK.sim(1); if (e.mode === 'counterTell') break; }
        pr = { reel: +(P.hurt || 0).toFixed(2), mode: e.mode };
        for (let k = 0; k < 90; k++) { const h = P.hp; if (e.mode === 'counterTell') { tells++; marks.add(BK.markShown(e)); } BK.sim(1); if (P.hp < h) hit++; if (e.mode === 'counterTell') { P.x = e.x - 16; P.vx = 0; } }
        r.parry = { ...pr, tells, marks: [...marks], hit }; }
      /* THE FEINT: a brute beside a hero, the dice loaded for a feint */
      { const e = put('brute', 1.5); const rnd = Math.random; Math.random = () => 0.01; let feint = 0, feintMark = 0, feintTold = 0, lost = 0, after = null, prev = e.mode;
        try { for (let k = 0; k < 150; k++) { const h = P.hp; BK.sim(1); P.hp = Math.max(P.hp, 1); P.x = e.x - 20; P.vx = 0; if (e.mode === 'feint') { feint++; if (BK.markShown(e)) feintMark++; if (BK.telling(e)) feintTold++; if (P.hp < h) lost++; } if (prev === 'feint' && e.mode !== 'feint' && !after) after = e.mode; if (prev === 'rest' && after === 'rest' && e.mode !== 'rest' && e.mode !== 'walk') after = 'rest>' + e.mode + (BK.markShown(e) || '-'); prev = e.mode; } } finally { Math.random = rnd; }
        r.feint = { frames: feint, feintMark, feintTold, lost, after }; }
      /* THE LUNGE: a pike 70 px off */
      { const e = put('pike', 4.4); const x0 = e.x; let told = null, moved = 0, hit = 0; const hp0 = P.hp;
        for (let k = 0; k < 90; k++) { const h = P.hp; BK.sim(1); P.x = X; P.vx = 0; if (e.mode === 'tell' && told == null) told = BK.markShown(e); moved = Math.max(moved, Math.abs(e.x - x0)); if (P.hp < h) hit++; }
        r.lunge = { told, moved: Math.round(moved), hit }; }
      /* THE ARCHER keeps its range: 90 px off */
      { const e = put('archer', 5.6); const d0 = Math.abs(e.x - X); for (let k = 0; k < 40; k++) { BK.sim(1); P.x = X; P.vx = 0; P.hp = P.maxHp; } r.archer = { d0: Math.round(d0), d1: Math.round(Math.abs(e.x - X)) }; }
      /* NO UNTOLD HITS from what the rules touch: each beside a standing hero for eight seconds */
      r.untold = {};
      for (const [t, dx] of [['brute', 2], ['shield', 2], ['pike', 4], ['archer', 7]]) { const e = put(t, dx); let last = -99, untold = 0, hits = 0;
        for (let k = 0; k < 480; k++) { const now = k / 60, h = P.hp; P.hp = P.maxHp; P.inv = 0; P.x = X; P.vx = 0; P.face = Math.sign(e.x - P.x) || 1; const h1 = P.hp; BK.sim(1);
          if (e.alive && BK.telling(e)) last = now; if (P.hp < h1) { hits++; if (now - last > 3) untold++; } if (P.dead) { P.dead = 0; P.hp = P.maxHp; } }
        r.untold[t] = { hits, untold }; }
      return r; };
    out.kOff = kings(); BK.setCombat('weighty'); out.kOn = kings(); BK.setCombat('classic');
    return out;
  })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(R, null, 1).replace(/\n\s+/g, ' '));
const Q = WEIGHTY.queen;
// ---- THE SWITCH ----
if (R.fresh !== 'classic') bad.push(`a fresh page is ${R.fresh}, not classic`);
if (!R.dmg.n || !R.dmg.offOk) bad.push('with the switch off the common blows are not x1.25');
if (!R.dmg.onOk) bad.push(`with the switch on the common blows are not x${WEIGHTY.commonDamage}`);
if (!R.dmg.backOk) bad.push('switched on and off again, the common blows are not what they were');
// ---- OFF: classic ----
if (!(R.qOff.drones >= 2)) bad.push(`the queen's call put up ${R.qOff.drones} drones (the test needs two)`);
if (!(R.qOff.hover < 20 * 0.6)) bad.push(`switch off, her swarm up, a blow of 20 took ${R.qOff.hover}: the classic swarm armour is gone`);
if (R.qOn.maxHp !== Math.round(R.qOff.maxHp * Q.hp)) bad.push(`switch on, her health is ${R.qOn.maxHp}, not ${R.qOff.maxHp} x ${Q.hp}`);
if (R.qOffWatch.poseFirst || !R.qOffWatch.markAtStart) bad.push(`switch off, ${R.qOffWatch.poseFirst} of her windups started with no mark (classic: the mark from the first frame)`);
if (R.qOffWatch.feints) bad.push('switch off, she feinted');
if (!R.cOff.swinging || !R.cOff.jumpInSwing) bad.push('switch off, a jump no longer comes out of a swing (the classic controls moved)');
if (R.cOff.recovery) bad.push('switch off, a swing left a recovery');
if (!(R.kOff.poise[0].st > 0)) bad.push('switch off, a brute no longer flinches to the first cut');
if (R.kOff.parry.mode === 'counterTell' || R.kOff.parry.tells) bad.push('switch off, a shield parried');
if (R.kOff.feint.frames) bad.push('switch off, a brute feinted');
if (R.kOff.lunge.told) bad.push('switch off, a pike told a thrust from 70 px');
if (R.kOff.archer.d1 > R.kOff.archer.d0 + 8) bad.push('switch off, an archer at 90 px backed off');
// ---- ON ----
if (!(R.qOn.drones >= 2)) bad.push(`switch on, the call put up ${R.qOn.drones} drones`);
if (R.qOn.hover !== 20) bad.push(`switch on, with her swarm up, a blow of 20 took ${R.qOn.hover}: she is not always hittable`);
if (!(R.qOn.winded > R.qOn.hover)) bad.push(`switch on, winded took ${R.qOn.winded} against ${R.qOn.hover}: the opening is no bonus`);
const W = R.qOnWatch, WL = R.qOnLoaded;
if (W.markAtStart) bad.push(`switch on, ${W.markAtStart} of her windups wore the mark from the first frame (the body first, then the icon)`);
if (!W.fracs.length || W.fracs.some(f => f < 0.38 || f > 0.62)) bad.push(`switch on, the mark arrived at ${JSON.stringify(W.fracs)} of the windup, not ${Q.markAt}`);
if (W.fracs.length < W.windups - 1) bad.push(`switch on, ${W.windups} windups and only ${W.fracs.length} showed a mark before they ended: every attack stays told`);
if (!(WL.feints >= 2)) bad.push('switch on, with the dice loaded for it she never feinted');
if (WL.feintMarked) bad.push(`switch on, a feint wore a mark or read as a windup (${WL.feintMarked} frames): a feint throws nothing`);
if (!WL.afterFeint.length || WL.afterFeint.some(m => m !== 'aim')) bad.push(`switch on, a feint handed to ${JSON.stringify(WL.afterFeint)}, not a told dive`);
if (!W.aims.some(a => [0.8, 0.6, 0.55].every(b => Math.abs(a - (b * Q.windK + 0.02)) > 0.06))) bad.push(`switch on, no dive windup was held past its beat (${JSON.stringify(W.aims)})`);
const C = R.cOn;
if (!(C.recovery >= WEIGHTY.recovery.light - 0.02)) bad.push(`switch on, a swing ended with a recovery of ${C.recovery}`);
if (C.jumpInSwing) bad.push('switch on, a jump came out of a swing');
if (C.jumpInRec !== false) bad.push(`switch on, a jump came out of the recovery (${C.jumpInRec})`);
if (C.dodgeInRec !== false) bad.push(`switch on, a dodge came out of the recovery (${C.dodgeInRec})`);
if (!C.jumpAfter) bad.push('switch on, no jump once the recovery was over');
const po = R.kOn.poise;
if (!(po[0].st <= 0 && po[1].st <= 0 && po[0].mode === 'raise' && po[1].mode === 'raise')) bad.push(`switch on, a brute did not swing through two cuts: ${JSON.stringify(po)}`);
if (!(po[2].broken > 0)) bad.push(`switch on, the third cut did not break the brute: ${JSON.stringify(po[2])}`);
const pa = R.kOn.parry;
if (!(pa.reel > 0) || !pa.tells) bad.push(`switch on, three cuts on a shield's guard did not parry and counter: ${JSON.stringify(pa)}`);
if (pa.marks.some(m => m !== '!')) bad.push(`switch on, the shield's counter wore ${JSON.stringify(pa.marks)}, not a yellow !`);
if (!pa.hit) bad.push('switch on, the shield counter never landed on a hero who stood in it');
const fe = R.kOn.feint;
if (!fe.frames) bad.push('switch on, a brute never feinted (dice loaded for it)');
if (fe.feintMark || fe.feintTold || fe.lost) bad.push(`switch on, a brute's feint wore a mark, read as a windup or hurt: ${JSON.stringify(fe)}`);
const lu = R.kOn.lunge;
if (lu.told !== '!' || !(lu.moved > 20) || !lu.hit) bad.push(`switch on, a pike 70 px off did not lunge on a told thrust and land: ${JSON.stringify(lu)}`);
if (!(R.kOn.archer.d1 > R.kOn.archer.d0 + 8)) bad.push(`switch on, an archer 90 px off did not back off: ${JSON.stringify(R.kOn.archer)}`);
for (const [t, u] of Object.entries(R.kOn.untold)) if (u.untold) bad.push(`switch on, a Kingswood ${t} hurt a standing hero ${u.untold} time(s) with no windup in the three seconds before`);
for (const [t, u] of Object.entries(R.kOff.untold)) if (u.untold) bad.push(`switch off, a Kingswood ${t} hurt a standing hero ${u.untold} time(s) with no windup in the three seconds before`);
assert.deepEqual(bad, [], 'weighty:\n  ' + bad.join('\n  '));
console.log(`the switch is off by default and classic with it off; on, the Queen is always hittable (openings a bonus, health x${Q.hp}), a swing commits (recovery ${C.recovery}s),` +
  ` her dive holds and feints (${WL.feints} feints loaded, dive windups ${Math.min(...W.aims)}-${Math.max(...W.aims)}s), the mark arrives ${Q.markAt} into each windup, and Kingswood's brute breaks, shield parries and counters, brute feints, pike lunges and archer backs off - all told`);
