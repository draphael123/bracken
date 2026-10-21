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
//   - the hero, the boss, the trial and the shop still say DEATH KNIGHT; the page throws
//   node tools/blood-kit.mjs            (PORT from tools/ports.mjs, or PORT=)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLOOD, tierFor, tierByTime, debtStep, debtReclaim, debtSpend, payPrice, reclaimOf, spendMul } from '../src/blood-kit.js';
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
  const s = { hp: 50, maxHp: M, bd: 12 }; ok(debtSpend(s) === 12 && s.bd === 0 && spendMul(12, M) > 1.4, 'a spend did not take it all or add power');
  const pr = { hp: 1, maxHp: M }; ok(payPrice(pr) === 0 && pr.hp === 1, 'the price took his last point');
  const pr2 = { hp: 80, maxHp: M }; debtStep(pr2, 0); const paid = payPrice(pr2); debtStep(pr2, 0); ok(paid === Math.round(M * BLOOD.price.pct) && near(pr2.bd, paid) && pr2.hp === 80 - paid, 'the price is not on the bar as debt: ' + JSON.stringify({ paid, pr2 }));
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
    /* 6. NO HARVEST: crouched over a body */
    place(P().maxHp - 30); const n0 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x, y: spot.y }); const br = D().enemies[n0]; br.x = P().x + 2; br.y = P().y; D().kill(br); BK.sim(3);
    const hpH = P().hp; P().bdLast = P().hp; P().bd = 0; BK.keys.down = true; BK.sim(90); BK.keys.down = false; out.harvest = { bodies: D().bodies.length, healed: P().hp - hpH };
    return out; })()`, 180000);
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
    ok(R.harvest.healed <= 0, 'crouched over a body he drew ' + R.harvest.healed + ' (the harvest is gone): ' + JSON.stringify(R.harvest));
  }
  ok(pg.errors.length === 0, 'page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
if (bad.length) { console.error('BLOOD-KIT FAIL\n- ' + bad.join('\n- ')); process.exit(1); }
console.log('blood-kit: BLOOD DEBT, the five tiers (by the hold alone, debt-fed), THE PARRY (+ the flick), BLOOD PRICE, BLOOD SPIKE, no harvest, THE BLOOD KNIGHT by name - all hold');
