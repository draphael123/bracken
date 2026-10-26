// tools/blood-kit.mjs — THE BLOOD KNIGHT'S BLOOD KIT (claude/bloodknight, scratch/brief-bloodknight-1017.md 2-5; src/blood-kit.js BLOOD, main.js hooks).
// Pure (Node), on src/blood-kit.js, this fails when:
//   - BLOOD DEBT: a blow does not leave debt.share of it as debt; the debt does not drain to nothing in ~debt.drainT s, or drains while the blade is
//     wound (freeze); a heal does not fill the segment first; it passes debt.cap of max health or the health he lost; a reclaim heals above pre-hit
//   - THE TIERS: a hold does not reach T1..T5 at tiers.at - by the HOLD ALONE (claude/bkfeel 10-21: no tier needs debt; Daniel "a much longer charge ... five tiers"); the
//     tiers are not spread over a long hold (T5 >= 2.4 s) or a later tier is not heavier; a T4/T5 does not spend the debt it is fed
//   - BLOOD PRICE takes his last point, or does not put what it took on the bar as debt
// In the page (Stockade floor, the hero 'reaper' held where he stands), this fails when:
//   - a real blow on him leaves no red segment, or it does not drain away; one of his cuts that lands on a straw man wins none of it back, or
//     wins back more than he lost; with no debt his cut heals him at all (no other passive heal: the drag drinks nothing)
//   - holding X and letting go at each tier's time does not bring down that tier (REND / SUNDER / CRIMSON CRESCENT / EXSANGUINATE / BLOOD MOON);
//     T4 does not come down with no debt (it must: the hold alone reaches it); T4 / T5 on a debt does not spend it, or a fed T4 that lands drinks none of it back;
//     the CRESCENT sends no wave; a heavy that lands does not BLEED; held past tiers.auto it does not come down by itself
//   - (claude/bkfeel) THE PARRY: a ward let go as a blow lands is not THROWN BACK with the freeze + the crimson held breath + the wash; the foe is shoved out of his reach or
//     does not reel BLOOD.parry.stagger; his riposte window is not BLOOD.parry.window or not heavy; the debt comes back without the bar's pulse; a C TAPPED too short to stand
//     the ward up (the flick) does not throw the blow back
//   - DOWN+C (BLOOD PRICE) does not cost price.pct of his health as debt, or does not edge the blade (a cut lands harder)
//   - kneeling AS a low blow lands is not a BLOOD SPIKE (the blow turned, the attacker struck, ALL the debt reclaimed); a kneel held long is the
//     plain low guard (turned, no spike)
//   - crouched over a body gives him anything (the harvest is gone)
//   - (claude/bkkit2) BLOOD SPIKE: a plain (not low) blow landing AS the kneel begins is not spiked with the wash; a blow on a long kneel is; an attacker far off is struck
//   - (claude/bkkit2) THE RED HOST: BLOODWORMS / BLOOD BOLT / RED GROUND are not paid in blood (debt) or win none of it back when they land; the worms do not bite or a
//     thrall rises; the bolt does not bleed; DRAIN does not hold, pull blood into the debt and let go, or is spent with nothing in reach; RED GROUND does not hold his
//     debt or bite, bleed and slow a foe standing in it
//   - the hero, the boss, the trial and the shop still say DEATH KNIGHT; the page throws
//   node tools/blood-kit.mjs            (PORT from tools/ports.mjs, or PORT=)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLOOD, tierFor, tierByTime, debtStep, debtReclaim, debtSpend, payPrice, payBlood, drainGive, reclaimOf, spendMul, vitaeOf, frenzySteal, heartOf, sprayKind, lashBox } from '../src/blood-kit.js';
import { openPage, ROOT } from './cdp.mjs';

const bad = [];
const ok = (c, m) => { if (!c) bad.push(m); };
const near = (a, b, e = 0.6) => Math.abs(a - b) <= e;

/* ---------------- PURE ---------------- */
{ const T = BLOOD.tiers, M = 95, D = BLOOD.debt;
  for (let i = 0; i < 5; i++) ok(tierFor(T.at[i] + 0.01, M, M) === i + 1 && tierFor(T.at[i] - 0.01, M, M) === i, 'tier at ' + T.at[i] + ' s is not T' + (i + 1));
  ok(tierFor(T.at[3] + 0.01, 0, M) === 4 && tierFor(T.at[4] + 0.01, 0, M) === 5, 'T4/T5 are not reached by the hold alone (claude/bkfeel: debt empowers, never gates)');
  ok(T.at[4] >= 2.4 && T.auto > T.at[4] && T.at.every((a, i) => !i || a - T.at[i - 1] >= 0.4), 'the five tiers are not spread over a long hold: ' + T.at);
  ok(T.mul.slice(1).every((m, i, a) => !i || m > a[i - 1]), 'a later tier is not heavier: ' + T.mul);
  const p = { hp: M, maxHp: M }; debtStep(p, 0.016); p.hp -= 20; debtStep(p, 0.016);
  ok(near(p.bd, 20 * D.share), 'a 20 blow left ' + p.bd + ' debt (want ' + 20 * D.share + ')');
  const q = { ...p }; for (let i = 0; i < 60; i++) debtStep(q, 1 / 60, { freeze: true }); ok(near(q.bd, p.bd), 'the debt drained while the blade was wound');
  let t = 0; while (p.bd > 0 && t < 10) { debtStep(p, 1 / 60); t += 1 / 60; } ok(t > D.drainT - 0.3 && t < D.drainT + 0.3, 'the debt drained in ' + t.toFixed(2) + ' s (want ~' + D.drainT + ')');
  const h = { hp: 60, maxHp: M }; debtStep(h, 0); h.hp = 40; debtStep(h, 0); const b0 = h.bd; h.hp += 4; debtStep(h, 0); ok(near(h.bd, b0 - 4), 'a heal did not fill the segment first: ' + b0 + ' -> ' + h.bd);
  const r = { hp: 90, maxHp: M }; debtStep(r, 0); r.hp = 10; debtStep(r, 0); ok(r.bd <= D.cap * M + 1e-6, 'the debt passed its cap: ' + r.bd);
  const got = debtReclaim(r, 999); ok(r.hp <= 90 && near(got, D.cap * M), 'a reclaim went above the health before the hit (or not to the segment): hp ' + r.hp + ' got ' + got);
  ok(reclaimOf(16) > 0 && reclaimOf(0) === D.reclaimMin, 'reclaimOf is off');
  const s = { hp: 50, maxHp: M, bd: 12 }; ok(debtSpend(s) === 12 && s.bd === 0 && spendMul(12, M) > 1.3, 'a spend did not take it all or add power');
  const pr = { hp: 1, maxHp: M }; ok(payPrice(pr) === 0 && pr.hp === 1, 'the price took his last point');
  /* (claude/bkkit2) THE RED HOST's price is BLOOD PRICE's rule at its own pct; DRAIN fills the debt first and heals only `over` of the rest */
  const hb = { hp: 1, maxHp: M }; ok(payBlood(hb, 0.06) === 0 && hb.hp === 1, 'a Red Host spell took his last point');
  const hc = { hp: 80, maxHp: M }; debtStep(hc, 0); const hp6 = payBlood(hc, BLOOD.host.worms.price); ok(hp6 === Math.round(M * BLOOD.host.worms.price) && near(hc.bd, hp6) && hc.hp === 80 - hp6, 'a Red Host spell is not paid on the bar as debt: ' + JSON.stringify(hc));
  const dg = { hp: 50, maxHp: M, bd: 4 }; const g1 = drainGive(dg, 10); ok(near(dg.bd, 0) && near(g1, 4 + 6 * BLOOD.host.drain.over) && near(dg.hp, 50 + g1), 'DRAIN did not fill the debt first and heal ' + BLOOD.host.drain.over + ' of the rest: ' + JSON.stringify({ g1, dg }));
  ok(Object.values(BLOOD.host).every(s => s.cd > 0) && BLOOD.spike.any === true, 'BLOOD.host has a spell with no wait, or BLOOD SPIKE is not on any blow');
  const pr2 = { hp: 80, maxHp: M }; debtStep(pr2, 0); const paid = payPrice(pr2); debtStep(pr2, 0); ok(paid === Math.round(M * BLOOD.price.pct) && near(pr2.bd, paid) && pr2.hp === 80 - paid, 'the price is not on the bar as debt: ' + JSON.stringify({ paid, pr2 }));
  /* (claude/bkblood) THE BLOOD PASS: a LONGER rally (window >= 4.5 s, share >= 0.6, cap >= 0.3), bleeding foes and the frenzy win more back, VITAE fills from what is reclaimed and nothing else,
     the frenzy's lifesteal is capped, the heartbeat quickens with the debt, flesh bleeds and stone sparks, THE BLOOD LASH reaches past the steel */
  ok(D.drainT >= 4.5 && D.share >= 0.6 && D.cap >= 0.3 && D.hold >= 0.6, 'the rally is not the LOUD LONGER one (drainT ~5, share ~0.6-0.7, cap ~0.35): ' + JSON.stringify(D));
  ok(reclaimOf(20, { bleeding: true }) > reclaimOf(20) && reclaimOf(20, { frenzy: true }) >= 20, 'a bleeding foe / the frenzy does not win more back: ' + [reclaimOf(20), reclaimOf(20, { bleeding: true }), reclaimOf(20, { frenzy: true })]);
  const v = { hp: 50, maxHp: M, bd: 30 }; debtReclaim(v, 10); ok(near(v.bkVitIn, 10) && near(vitaeOf(BLOOD.vitae.per * M, M), 100), 'a reclaim is not VITAE, or ' + BLOOD.vitae.per + ' of max health reclaimed does not fill it: ' + JSON.stringify(v));
  const fs = { hp: 50, maxHp: M }; let st = 0; for (let i = 0; i < 40; i++) st += frenzySteal(fs, 20); ok(st > 0 && st <= BLOOD.frenzy.stealCap * M + 1e-6, 'the frenzy lifesteal is not capped at ' + BLOOD.frenzy.stealCap + ' of max health: ' + st);
  const h0 = heartOf(0, M), h1 = heartOf(0.1 * M, M), h2 = heartOf(D.cap * M, M); ok(h0.bps === 0 && h1.bps > 0 && h2.bps > h1.bps && h2.k > h1.k, 'the heartbeat does not quicken with the debt: ' + JSON.stringify([h0, h1, h2]));
  ok(sprayKind('brute', undefined) === 'blood' && sprayKind('construct', undefined) === 'sparks' && sprayKind('golem', 'stone') === 'sparks' && sprayKind('skeleton', 'bone') === 'dust', 'blood/sparks by what is struck is off');
  const lb = lashBox(100, 100, 1, 0.2, 31); ok(lb && lb.r - 100 >= 31 + BLOOD.lash.reach - 1 && !lashBox(100, 100, 1, 0.13, 31), 'THE BLOOD LASH does not reach ' + BLOOD.lash.reach + ' px past the steel (late in the cut only): ' + JSON.stringify(lb));
}

/* ---------------- THE WORDS (source) ---------------- */
{ const main = readFileSync(join(ROOT, 'src/main.js'), 'utf8'), level = readFileSync(join(ROOT, 'src/level.js'), 'utf8');
  ok(/\{ id: 'reaper', name: 'THE BLOOD KNIGHT'/.test(main), 'the hero is not THE BLOOD KNIGHT');
  ok(/\{ t: 'bloodknight', name: 'THE BLOOD KNIGHT'/.test(main), 'the bestiary boss is not THE BLOOD KNIGHT');
  ok(/'THE BLOOD KNIGHT  OPEN' : 'THE BLOOD KNIGHT'/.test(main), 'the boss bar is not THE BLOOD KNIGHT');
  ok(/"THE BLOOD KNIGHT'S TRIAL"/.test(level), 'the trial is not THE BLOOD KNIGHT\'S TRIAL');
  ok(!/['"`][^'"`\n]*DEATH KNIGHT[^'"`\n]*['"`]/.test(main.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'a string in main.js still says DEATH KNIGHT');
  ok(/bkReclaimAll\('THROWN BACK'\)/.test(main), 'the ward-release parry does not reclaim the debt');
}

/* ---------------- THE PAGE ---------------- */
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.dk2 || !BK.dk2().blood) return { err: 'no BK.dk2().blood' };
    BK.SET.speed = 1;
    const { LEVELS } = await import('/src/level.js');
    const out = {}, D = () => BK.dk2(), B = () => BK.dk2().blood(), P = () => BK.P;
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); for (const e of D().enemies) e.alive = false; };
    setUp('reaper');
    const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x];
    let spot = null;
    for (let x0 = 8; x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + 20 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5].every(k => at(x, y - k) === 0); if (ok) spot = { x: x0 + 8, y }; }
    if (!spot) return { err: 'no flat floor' };
    const keysOff = () => { for (const k in BK.keys) BK.keys[k] = false; };
    const place = (hp) => { const p = P(); p.x = spot.x * 16 + 8; p.y = (spot.y + 1) * 16; p.vx = p.vy = 0; p.face = 1; p.hp = hp ?? p.maxHp; p.st = p.maxSt; p.atk = -1; p.atkRec = 0; p.heavy = false; p.combo = 0; p.dodge = 0; p.hurt = 0; p.inv = 0;
      p.bd = 0; p.bdLast = p.hp; p.bkEdgeT = 0; p.bkPriceCd = 0; keysOff(); BK.sim(20); p.bd = 0; p.bdLast = p.hp; };
    const dummy = dx => { const n0 = D().enemies.length; D().spawn({ t: 'dummy', x: spot.x + dx, y: spot.y }); const e = D().enemies[n0]; e.x = P().x + dx * 16; e.y = P().y; return e; };
    const blow = (dmg, o) => { P().inv = 0; P().hurt = 0; return String(D().hit(P().x + 20, dmg, o || {})); };
    const free = () => { let k = 0; while ((P().atk >= 0 || P().atkRec > 0) && k < 240) { BK.sim(1); k++; } BK.sim(4); };
    /* 1. THE DEBT: a blow, the segment, the drain */
    place(); P().face = -1; const hp0 = P().hp; blow(20); BK.sim(12);   /* (past the hit-stop) */ const lost = hp0 - P().hp; out.debt = { lost, bd: +B().bd.toFixed(2) };
    BK.sim(Math.round(60 * (B().BLOOD.debt.drainT + 0.3))); out.debt.after = +B().bd.toFixed(2); out.debt.hpAfter = P().hp;
    /* 2. RECLAIM: hit, then cut a straw man; and with no debt a cut heals nothing */
    place(); P().face = -1; const hpA = P().hp; blow(20); BK.sim(30);   /* (past the hit-stop and the flinch) */ P().face = 1; const dm = dummy(2); const hpHit = P().hp, bdHit = B().bd;
    for (let i = 0; i < 2; i++) { BK.keys.atk = true; BK.press('atk'); BK.sim(2); BK.keys.atk = false; free(); }
    out.reclaim = { pre: hpA, hit: hpHit, bd: +bdHit.toFixed(2), after: P().hp, bdAfter: +B().bd.toFixed(2), stat: D().stats().reclaimed };
    place(P().maxHp - 30); const hpN = P().hp; for (let i = 0; i < 3; i++) { BK.keys.atk = true; BK.press('atk'); BK.sim(2); BK.keys.atk = false; free(); } out.noDebtHeal = P().hp - hpN; dm.alive = false;
    /* 3. THE TIERS: hold X to each tier's time and let go */
    const T = B().BLOOD.tiers, quick = B().quick;
    const hold = (secs, setup) => { place(P().maxHp - 40); if (setup) setup(); const d2 = dummy(2); d2.hp = d2.maxHp = 9999; BK.keys.atk = true; let n = 0, said = false; const N = Math.round(secs * 60);
      for (; n < N; n++) { BK.sim(1); if (P().heavy) break; } BK.keys.atk = false; BK.sim(1); const r = { tier: P().bkTier || 0, heavy: !!P().heavy, bdAtFire: +B().bd.toFixed(2), spent: +(P().bkSpent || 0).toFixed(2), auto: n < N };
      let bw = 0; for (let k = 0; k < 40; k++) { const b = D().box(); if (b) bw = Math.max(bw, b.r - b.l); if (B().waves) r.wave = true; BK.sim(1); } r.box = bw; r.bleed = (d2.bleed || 0) > 0; free(); d2.alive = false; return r; };
    out.tiers = {};
    for (let i = 0; i < 3; i++) out.tiers['t' + (i + 1)] = hold(T.at[i] * quick + 0.06);
    out.tiers.t4dry = hold(T.at[3] * quick + 0.06);
    out.tiers.t5dry = hold(T.at[4] * quick + 0.06);
    let hpFed = 0; out.tiers.t4 = hold(T.at[3] * quick + 0.06, () => { P().bd = B().BLOOD.empower.min * P().maxHp + 6; P().bdLast = P().hp; hpFed = P().hp; }); out.tiers.t4.healed = +(P().hp - hpFed).toFixed(2);
    out.tiers.t5 = hold(T.at[4] * quick + 0.06, () => { P().bd = Math.min(P().maxHp * B().BLOOD.debt.cap, 0.14 * P().maxHp + 3); P().bdLast = P().hp; });
    out.tiers.auto = hold(T.auto + 0.8);
    /* 4. BLOOD PRICE: DOWN+C */
    place(80); const hpP = P().hp; BK.keys.down = true; BK.sim(15); BK.keys.block = true; BK.sim(2); BK.keys.block = false; BK.keys.down = false; BK.sim(2);
    out.price = { paid: hpP - P().hp, bd: +B().bd.toFixed(2), edge: +B().edge.toFixed(2), prices: D().stats().prices, warding: !!P().warding };
    /* 5. BLOOD SPIKE: kneel as the low blow lands; a long kneel is the plain guard */
    const foe = () => { const n0 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x + 1, y: spot.y }); const e = D().enemies[n0]; e.x = P().x + 18; e.y = P().y; e.mode = 'walk'; e.hp = e.maxHp = 400; return e; };
    place(60); P().bd = 20; P().bdLast = P().hp; const f1 = foe(), fh = f1.hp, s0 = D().stats().spikes, hpS = P().hp; BK.keys.down = true; BK.sim(4);
    const rS = blow(10, { who: f1, low: true }); BK.sim(2);
    out.spike = { r: rS, spikes: D().stats().spikes - s0, foeHurt: fh - f1.hp, healed: P().hp - hpS, bd: +B().bd.toFixed(2) }; keysOff(); f1.alive = false; BK.sim(10);
    place(60); const f2 = foe(), fh2 = f2.hp, s1 = D().stats().spikes; BK.keys.down = true; BK.sim(40); const rL = blow(10, { who: f2, low: true }); BK.sim(2);
    out.longKneel = { r: rL, spikes: D().stats().spikes - s1, foeHurt: fh2 - f2.hp }; keysOff(); f2.alive = false; BK.sim(10);
    /* 7. (claude/bkfeel) THE PARRY: the ward stood up and let go as the blow lands; then THE FLICK (C tapped too short for the ward) */
    const parryOnce = (frames) => { place(70); P().bd = 15; P().bdLast = P().hp; P().novaCd = 0; P().wardRetDone = true; const f = foe(); delete f.maxHp; f.mode = 'idle'; const n0 = B().thrown, fl0 = B().flicks;
      BK.keys.block = true; BK.sim(frames); BK.keys.block = false; BK.sim(1); const hpB = P().hp, r = blow(10, { who: f }), b0 = B(), dx0 = Math.abs(f.x - P().x);
      const o = { r, thrown: b0.thrown - n0, flicks: b0.flicks - fl0, stop: +b0.stop.toFixed(3), slow: +b0.slow.toFixed(3), parryAt: b0.parryAt !== null, rip: +b0.rip.toFixed(2), ripHeavy: b0.ripHeavy, bd: +b0.bd.toFixed(2), healed: P().hp - hpB, rec: !!(b0.recFx && b0.recFx.all), stagger: +(f.stagger || 0).toFixed(2) };
      BK.sim(20); o.dx = Math.round(Math.abs(f.x - P().x)); o.dx0 = Math.round(dx0); o.reeling = (f.stagger || 0) > 0 || (f.rpHold || 0) > 0; keysOff(); f.alive = false; BK.sim(30); return o; };
    out.parry = parryOnce(12);
    out.flick = parryOnce(2);
    /* 5b. (claude/bkkit2) BLOOD SPIKE ON ANY BLOW: a plain (not low) blow inside the beat is spiked; outside it, it is not; an attacker far off is not struck but the blow is turned */
    place(60); P().bd = 20; P().bdLast = P().hp; const f3 = foe(), fh3 = f3.hp, s3 = D().stats().spikes, w3 = B().spikeWash; BK.keys.down = true; BK.sim(4); const rA = blow(10, { who: f3 }); BK.sim(2);
    out.spikeAny = { r: rA, spikes: D().stats().spikes - s3, foeHurt: fh3 - f3.hp, bd: +B().bd.toFixed(2), wash: B().spikeWash !== w3, pose: P().lastKey || null }; keysOff(); f3.alive = false; BK.sim(10);
    place(60); const f4 = foe(), s4 = D().stats().spikes; BK.keys.down = true; BK.sim(40); const rB = blow(10, { who: f4 }); BK.sim(2); out.lateAny = { r: rB, spikes: D().stats().spikes - s4 }; keysOff(); f4.alive = false; BK.sim(10);
    place(60); const f5 = foe(); f5.x = P().x + 220; const fh5 = f5.hp, s5 = D().stats().spikes; BK.keys.down = true; BK.sim(4); const rC = blow(10, { who: f5 }); BK.sim(2); out.farSpike = { r: rC, spikes: D().stats().spikes - s5, foeHurt: fh5 - f5.hp }; keysOff(); f5.alive = false; BK.sim(10);
    /* 5c. (claude/bloodstep) THE PERFECT STEP: a blow met inside the BLOOD STEP's untouchable window is no hit, bleeds off BLOOD.step.debt of his debt, edges the blade; once a second; a hazard (no attacker) or a blow after the window gives nothing */
    { const stepOn = () => { const p = P(); p.dodge = 0.2; p.dodgeMax = 0.2; p.dodgeInv = 0.14; p.kPoseK = 'shadowStep'; p.kPoseT = 0.2; p.bkEdgeT = 0; };
      place(60); P().bd = 20; P().bdLast = P().hp; P().bkPerfectAt = -9; const f6 = foe(); stepOn(); const hp6 = P().hp, bd6 = P().bd, r6 = blow(10, { who: f6 }); const got6 = P().hp - hp6, edge6 = P().bkEdgeT;
      P().inv = 0; P().hurt = 0; stepOn(); P().bkEdgeT = 0; const hp7 = P().hp, r7 = blow(10, { who: f6 }); const got7 = P().hp - hp7;
      BK.sim(70); place(60); P().bd = 20; P().bdLast = P().hp; stepOn(); P().dodgeInv = 0; const r8 = blow(10, { who: f6 }); const bdAfterLate = P().bd;
      place(60); P().bd = 20; P().bdLast = P().hp; P().bkPerfectAt = -9; stepOn(); const r9 = blow(10, {}); const got9 = P().bd;
      out.perfect = { r6, got6, drop6: +(bd6 - P().bd).toFixed(2), edge6, r7, got7, late: String(r8), lateBd: +bdAfterLate.toFixed(2), r9, bd9: +got9.toFixed(2), want: Math.round(P().maxHp * B().BLOOD.step.debt) }; keysOff(); f6.alive = false; BK.sim(10); }
    /* 10. (claude/bkblood) VITAE + CRIMSON FRENZY + THE BLOOD LASH + THE RALLY FELT */
    { place(60); P().harvest = 0; P().bkVitae = 0; P().bd = 20; P().bdLast = P().hp; const dm2 = dummy(2), d0 = D().pass();
      for (let i = 0; i < 2; i++) { BK.keys.atk = true; BK.press('atk'); BK.sim(2); BK.keys.atk = false; free(); }
      const d1 = D().pass(); out.vitae = { got: +(d1.vitae - 0).toFixed(2), drinks: d1.drinks - d0.drinks, sprays: d1.sprays - d0.sprays, kind: d1.sprayKind, beats: d1.beats - d0.beats };
      place(P().maxHp - 30); P().harvest = 0; for (let i = 0; i < 2; i++) { BK.keys.atk = true; BK.press('atk'); BK.sim(2); BK.keys.atk = false; free(); } out.vitae.noDebt = +(P().harvest || 0).toFixed(2);
      dm2.alive = false; const n1 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x, y: spot.y }); const kb = D().enemies[n1]; kb.x = P().x + 20; kb.y = P().y; D().kill(kb); BK.sim(5); out.vitae.kill = +(P().harvest || 0).toFixed(2);
      place(60); P().harvest = 100; const f0 = D().pass(); BK.keys.throw = true; BK.press('throw'); BK.sim(30); BK.keys.throw = false; BK.sim(2); const f1 = D().pass();
      out.frenzy = { t: +f1.frenzyT.toFixed(2), n: f1.frenzies - f0.frenzies, vitae: f1.vitae, inv: +f1.inv.toFixed(2) };
      P().bd = 20; P().bdLast = P().hp; const dm3 = dummy(2), hpF = P().hp; BK.keys.atk = true; BK.press('atk'); BK.sim(2); BK.keys.atk = false; free(); out.frenzy.won = +(P().hp - hpF).toFixed(2); out.frenzy.vitaeAfter = +(P().harvest || 0).toFixed(2);
      P().bd = 0; P().bdLast = P().hp; P().hp = 50; P().bdLast = 50; for (let i = 0; i < 6; i++) { BK.keys.atk = true; BK.press('atk'); BK.sim(2); BK.keys.atk = false; free(); } out.frenzy.stole = +D().pass().stole.toFixed(2); dm3.alive = false;
      BK.sim(Math.round(60 * (B().BLOOD.frenzy.t + 0.5))); out.frenzy.over = +D().pass().frenzyT.toFixed(2);
      /* THE LASH: three cuts at a straw man past the steel's reach - only the third (the lash) finds it, and it bleeds */
      place(80); P().combo = 0; const far = dummy(0); far.x = P().x + 46; far.hp = far.maxHp = 9999; const l0 = D().pass(); let w = [0, 0, 0];
      for (let i = 0; i < 3; i++) { const hp1 = D().pass().sprays; BK.keys.atk = true; BK.press('atk'); BK.sim(2); BK.keys.atk = false; let k = 0; while ((P().atk >= 0) && k < 120) { const b = D().box(); if (b) w[i] = Math.max(w[i], b.r - P().x); BK.sim(1); k++; } BK.sim(1); w[i] = [w[i], D().pass().sprays - hp1]; }
      out.lash = { w, hits: D().pass().lashHits - l0.lashHits, bleed: (far.bleed || 0) > 0, pose: P().lastKey || null }; far.alive = false; keysOff(); BK.sim(30); }
    /* 6. NO HARVEST: crouched over a body */
    place(P().maxHp - 30); const n0 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x, y: spot.y }); const br = D().enemies[n0]; br.x = P().x + 2; br.y = P().y; D().kill(br); BK.sim(3);
    const hpH = P().hp; P().bdLast = P().hp; P().bd = 0; BK.keys.down = true; BK.sim(90); BK.keys.down = false; out.harvest = { bodies: D().bodies.length, healed: P().hp - hpH };
    /* 8. (claude/bkkit2) THE RED HOST: each spell cast on F, paid in blood, landed, won back */
    const H = () => D().host();
    const cast = (id, dx, pre) => { BKT.setHeroLevel('reaper', 20); place(P().maxHp - 30); BKT.PROG.skillOwned.reaper = { [id]: true }; BKT.PROG.loadouts.reaper = [id]; P().cds = {}; P().harvest = 0; for (const e of D().enemies) e.alive = false;
      const d = dx === null ? null : dummy(dx); if (pre) pre(d); const h0 = H(), hp0 = P().hp; BK.press('throw'); BK.sim(1); const o = { paid: H().paid - h0.paid, hpDrop: hp0 - P().hp, bd: +B().bd.toFixed(2), cd: H().cds[id] || 0 }; return { o, d, h0 }; };
    { const { o, d, h0 } = cast('summonSkeleton', 4); o.worms = H().worms; BK.sim(240); const h = H(); Object.assign(o, { bites: h.bites - h0.bites, back: +(h.back - h0.back).toFixed(2), after: h.worms, risen: h.risen, bleed: (d.bleed || 0) > 0 || d.hp < 9999 }); out.worms = o; d.alive = false; }
    { const { o, d, h0 } = cast('gravecall', 5); BK.sim(40); const h = H(); Object.assign(o, { hits: h.boltHits - h0.boltHits, back: +(h.back - h0.back).toFixed(2), bdAfter: +B().bd.toFixed(2), bleed: (d.bleed || 0) > 0 }); out.bolt = o; d.alive = false; }
    { const { o, d, h0 } = cast('bidden', 3, () => { P().bd = 12; P().bdLast = P().hp; }); o.on = H().drainOn; BK.sim(90); const h = H(); Object.assign(o, { drained: +(h.drained - h0.drained).toFixed(2), bdAfter: +B().bd.toFixed(2), on: o.on, offAfter: !h.drainOn, hurt: d.hp < 9999 }); out.drain = o; d.alive = false; }
    { const { o } = cast('bidden', null); BK.sim(5); o.drains = H().drains; out.drainNone = o; }
    { const { o, h0 } = cast('unholyGround', null, () => { const n0 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x, y: spot.y }); const e = D().enemies[n0]; e.x = P().x + 20; e.y = P().y; e.hp = e.maxHp = 400; e.mode = 'idle'; out._pf = e; });
      const e = out._pf; delete out._pf; BK.sim(50); const h = H(); Object.assign(o, { pools: h.pools, hold: h.poolHold, foeHurt: 400 - e.hp, bleed: (e.bleed || 0) > 0, wade: (e.bkPoolT || 0) > 0, back: +(h.back - h0.back).toFixed(2) }); out.pool = o; e.alive = false; }
    /* 9. (claude/bkkit2) HIS YARD's tree step is THE RED HOST: with nothing learned, BLOODWORMS is lent on F, its price is shown (not taken), and three bites open the gate */
    { for (const k in BK.keys) BK.keys[k] = false; BK.setHero('reaper'); BK.reset({ fresh: true }); BKT.PROG.skillOwned.reaper = {}; BKT.PROG.loadouts.reaper = []; BK.applyUpgrades(); BK.load(LEVELS.findIndex(l => l.id === 'trial_reaper')); BK.state = 'play'; BK.god = false; BK.sim(30);
      const si = BK.L.trial.findIndex(q => q.kind === 'host'), st = BK.L.trial[si]; if (st) { BK.tp(st.x0 + 3, 19); P().vx = 0; P().face = 1; BK.sim(20); P().harvest = 0; const hp0 = P().hp; BK.press('throw'); for (let f = 0; f < 600 && !st.done; f++) BK.sim(1); out.trial = { si, done: !!st.done, got: st.got || 0, n: st.n, hpTaken: hp0 - P().hp, lent: BKT.skillAt(0) }; } else out.trial = { si }; }
    return out; })()`, 240000);
  console.log(JSON.stringify(R, null, 1));
  if (R.err) bad.push(R.err); else {
    const Db = BLOOD.debt;
    ok(R.debt.lost > 0 && near(R.debt.bd, R.debt.lost * Db.share, 1), 'a real blow left ' + R.debt.bd + ' debt for ' + R.debt.lost + ' lost (want x' + Db.share + ')');
    ok(R.debt.after < 0.01, 'the debt did not drain away: ' + R.debt.after);
    ok(R.reclaim.after > R.reclaim.hit && R.reclaim.after <= R.reclaim.pre && R.reclaim.stat > 0, 'his landed cuts did not win the debt back (or won back more than he lost): ' + JSON.stringify(R.reclaim));
    ok(R.noDebtHeal <= 0, 'with no debt his cuts healed him ' + R.noDebtHeal + ' (no other passive heal)');
    for (let i = 1; i <= 3; i++) { const t = R.tiers['t' + i]; ok(t.tier === i && t.bleed, 'a T' + i + ' hold brought down T' + t.tier + (t.bleed ? '' : ' and did not bleed the straw man') + ': ' + JSON.stringify(t)); }
    ok(R.tiers.t3.wave, 'the CRIMSON CRESCENT sent no wave');
    ok(R.tiers.t4dry.tier === 4 && R.tiers.t4dry.spent === 0 && R.tiers.t5dry.tier === 5 && R.tiers.t5dry.spent === 0, 'T4/T5 did not come down by the hold alone with no debt: ' + JSON.stringify([R.tiers.t4dry, R.tiers.t5dry]));
    ok(R.tiers.t4.tier === 4 && R.tiers.t4.spent > 0 && R.tiers.t4.bdAtFire === 0 && R.tiers.t4.healed > 0, 'EXSANGUINATE on a debt did not come down, spend it, or drink some back as it landed: ' + JSON.stringify(R.tiers.t4));
    ok(R.tiers.t5.tier === 5 && R.tiers.t5.spent > 0, 'BLOOD MOON on a big debt did not come down or spend it: ' + JSON.stringify(R.tiers.t5));
    ok(R.tiers.auto.auto && R.tiers.auto.tier >= 1, 'held past ' + BLOOD.tiers.auto + ' s the heavy did not come down by itself: ' + JSON.stringify(R.tiers.auto));
    const want = Math.round(95 * BLOOD.price.pct);
    ok(R.price.paid >= want - 1 && R.price.paid <= want + 3 && near(R.price.bd, R.price.paid, 1.5) && R.price.edge > 0 && R.price.prices === 1 && !R.price.warding, 'DOWN+C is not the BLOOD PRICE (cost ~' + want + ' as debt, blade edged, no ward): ' + JSON.stringify(R.price));
    ok(R.spike.r === 'blocked' && R.spike.spikes === 1 && R.spike.foeHurt > 0 && R.spike.healed > 0 && R.spike.bd < 0.01, 'a kneel AS the low blow landed was not a BLOOD SPIKE: ' + JSON.stringify(R.spike));
    ok(R.longKneel.r === 'blocked' && R.longKneel.spikes === 0, 'a kneel held long was not the plain low guard: ' + JSON.stringify(R.longKneel));
    const PP = BLOOD.parry, PR = R.parry, FL = R.flick;
    ok(PR.r === 'blocked' && PR.thrown === 1 && PR.parryAt && PR.stop >= PP.stop - 0.02 && PR.slow > 0, 'the ward let go as the blow landed was not THROWN BACK with the freeze and the held breath: ' + JSON.stringify(PR));
    ok(PR.rip >= PP.window - 0.05 && PR.ripHeavy, 'his riposte window after a THROWN BACK is not ' + PP.window + ' s and heavy: ' + JSON.stringify(PR));
    ok(PR.stagger >= PP.stagger - 0.05 && PR.dx <= 48 && PR.reeling, 'the parried foe was shoved out of his reach or does not reel: ' + JSON.stringify(PR));
    ok(PR.bd < 0.01 && PR.healed > 0 && PR.rec, 'the parry did not reclaim ALL the debt with the bar pulse: ' + JSON.stringify(PR));
    ok(FL.r === 'blocked' && FL.thrown === 1 && FL.flicks === 1, 'a C tapped too short for the ward (THE FLICK) did not throw the blow back: ' + JSON.stringify(FL));
    /* (claude/bkkit2) */
    ok(R.spikeAny.r === 'blocked' && R.spikeAny.spikes === 1 && R.spikeAny.foeHurt > 0 && R.spikeAny.bd < 0.01 && R.spikeAny.wash, 'a plain blow landing AS the kneel began was not a BLOOD SPIKE (with the wash): ' + JSON.stringify(R.spikeAny));
    ok(R.lateAny.spikes === 0, 'a blow on a long kneel was spiked (the spike is only on the beat): ' + JSON.stringify(R.lateAny));
    ok(R.perfect.r6 === 'false' && R.perfect.got6 >= 1 && Math.abs(R.perfect.got6 - R.perfect.want) <= 1 && R.perfect.edge6 > 0 && R.perfect.r7 === 'false' && R.perfect.got7 === 0, 'the PERFECT STEP did not give ' + R.perfect.want + ' hp back once (and edge the blade, and only once a second): ' + JSON.stringify(R.perfect));
    ok(R.perfect.late !== 'false' || R.perfect.lateBd >= 19.5, 'a blow after the step window was refunded: ' + JSON.stringify(R.perfect));
    ok(R.perfect.bd9 >= 19.5, 'a blow with no attacker (a hazard) was refunded: ' + JSON.stringify(R.perfect));
    ok(R.farSpike.r === 'blocked' && R.farSpike.spikes === 1 && R.farSpike.foeHurt === 0, 'a blow from a foe far off, on the beat, was not turned - or the spikes struck it across the room: ' + JSON.stringify(R.farSpike));
    const pct = k => Math.round(95 * BLOOD.host[k].price);
    ok(R.worms.paid > 0 && R.worms.worms >= BLOOD.host.worms.n && R.worms.cd > 0 && R.worms.bites >= 2 && R.worms.back > 0 && R.worms.after === 0 && R.worms.risen === 0, 'BLOODWORMS was not paid in blood, did not bite, or won nothing back (or raised a thrall): ' + JSON.stringify(R.worms));
    ok(R.bolt.paid > 0 && R.bolt.hits === 1 && R.bolt.back > 0 && R.bolt.bleed && R.bolt.cd > 0, 'BLOOD BOLT was not paid in blood, did not land, bleed, or win its price back: ' + JSON.stringify(R.bolt));
    ok(R.drain.on && R.drain.drained > 0 && R.drain.bdAfter < 12 && R.drain.offAfter && R.drain.cd > 0, 'DRAIN did not hold, pull blood into the debt, or let go: ' + JSON.stringify(R.drain));
    ok(R.drainNone.cd === 0 && R.drainNone.drains === 0, 'DRAIN with nothing in reach was spent: ' + JSON.stringify(R.drainNone));
    ok(R.pool.paid > 0 && R.pool.pools === 1 && R.pool.hold && R.pool.foeHurt > 0 && R.pool.bleed && R.pool.wade && R.pool.back > 0, 'RED GROUND was not paid in blood, or did not hold his debt, bite, bleed and slow a foe in it and win a drop back: ' + JSON.stringify(R.pool));
    void pct;
    ok(R.trial && R.trial.done && R.trial.lent === 'summonSkeleton' && R.trial.hpTaken <= 0, 'the yard RED HOST step was not lent BLOODWORMS on F, took health, or was not done by three bites: ' + JSON.stringify(R.trial));
    /* (claude/bkblood) */
    ok(R.vitae.got > 0 && R.vitae.drinks >= 1 && R.vitae.sprays >= 2 && R.vitae.kind === 'sparks' /* a straw man is wood: sparks, no blood */ && R.vitae.noDebt === 0 && R.vitae.kill === 0, 'VITAE did not fill from reclaimed blood only (or a drink / blood spray was missing; a kill or a cut with no debt filled it): ' + JSON.stringify(R.vitae));
    ok(R.vitae.beats >= 1, 'no heartbeat while he owed: ' + JSON.stringify(R.vitae));
    ok(R.frenzy.n === 1 && R.frenzy.t > 0 && R.frenzy.vitae === 0 && R.frenzy.inv === 0, 'HOLD F on full VITAE was not CRIMSON FRENZY (no invulnerability, B15): ' + JSON.stringify(R.frenzy));
    ok(R.frenzy.won >= 14 && R.frenzy.vitaeAfter === 0 && R.frenzy.stole > 0 && R.frenzy.stole <= BLOOD.frenzy.stealCap * 95 + 0.5 && R.frenzy.over === 0, 'the frenzy did not win a whole blow back, lifesteal (capped) past the debt, keep VITAE empty, or end: ' + JSON.stringify(R.frenzy));
    ok(R.lash.w[2][0] >= R.lash.w[1][0] + BLOOD.lash.reach - 4 && R.lash.w[0][1] === 0 && R.lash.w[1][1] === 0 && R.lash.w[2][1] > 0 && R.lash.hits >= 1 && R.lash.bleed, 'THE BLOOD LASH (the third cut) does not reach past the steel and bleed what it finds: ' + JSON.stringify(R.lash));
    ok(R.harvest.healed <= 0, 'crouched over a body he drew ' + R.harvest.healed + ' (the harvest is gone): ' + JSON.stringify(R.harvest));
  }
  ok(pg.errors.length === 0, 'page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
if (bad.length) { console.error('BLOOD-KIT FAIL\n- ' + bad.join('\n- ')); process.exit(1); }
console.log('blood-kit: BLOOD DEBT, the five tiers (by the hold alone, debt-fed), THE PARRY (+ the flick), BLOOD PRICE, BLOOD SPIKE, no harvest, THE BLOOD KNIGHT by name - all hold');
