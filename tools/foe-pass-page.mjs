// tools/foe-pass-page.mjs - THE FOE PASS CORE, IN THE PAGE (headless; claude/foepass. The tables and pure rules: tools/foe-pass.mjs).
// On a flat stretch of a level, god mode where the hero's health is not the measure:
//   BREAK     the same cut four times on a hound, a brute, a shield never breaks it (stale); cut / sweep / rise / cut leans harder on the
//             hound and the brute than the mash did; on a goblin's light bar (the sprig) four cuts move nothing and a varied run breaks it
//   REFUND    a broken sworn sword finished by one press: the hero gets his wind and ~3% of his health back (FB.refund)
//   PLUNGE    a broken soldier under a plunge is FINISHED by it (and the hero bounces)
//   AFFIXES   SHIELDED: a cut lands 40% and wears the shell, a heavy shatters it and lands whole; HEAVY: a deeper bar; VOLATILE: dead, it lights
//             a told fuse (the !!) and bursts - a hero beside it is hurt, a hero clear of it is not; HASTED walks faster than its twin
//   PURSUIT   on a live level (the Stockade) a soldier that sees a hero run past comes after him, and walks home when he is gone; on a level
//             that is not live (the Wood) nobody pursues (FPS.pursuits)
//   LEAD      on the Stockade an archer looses ahead of a running hero; in the Wood at him
//   TOLD      a hound's pounce jumped over, unhurt, OVERREACHES (a share of its bar: 'OVER IT')
//   REAPER    his yard's flash station is passed by the ward LET GO as the sword flashes (THROWN BACK, counted) - and not by letting it go
//             as the tell starts
//   PORT=8751 node tools/foe-pass-page.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { FB, refundOf } from '../src/foe-break.js';

const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const C = BK.combat2(), F = BK.foePass(), out = {};
    const setup = (id, hero) => { BK.PROG.hero = hero || 'knight'; BK.load(LEVELS.findIndex(l => l.id === id)); BK.start(); BK.god = true;
      const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
      for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 40 && !spot; x0++) for (let y = 6; y < L.H - 2 && !spot; y++) {
        let ok = true; for (let x = x0; x < x0 + 28 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5].every(k => at(x, y - k) === 0);
        if (ok) spot = [x0 + 6, y]; }
      for (const e of BK.enemies()) e.alive = false; BK.tp(spot[0], spot[1]); BK.sim(20); return spot; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; F.FUSES.length = 0; };
    const one = (spot, t, dx = 2, hp = 999) => { clear(); BK.tp(spot[0], spot[1]); BK.P.vx = 0; BK.sim(5); const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); BK.sim(2); if (hp) { f.hp = hp; f.hp0 = hp; } return f; };
    const K = BK.keys, P = BK.P;
    /* ---- BREAK ---- */
    let spot = setup('wood'); out.break = {};
    for (const t of ['hound', 'brute', 'shield', 'sprig']) for (const [nm, seq] of [['mash', ['light', 'light', 'light', 'light']], ['mix', ['light', 'sweep', 'rise', 'light']]]) {
      const f = one(spot, t); let broke = false; for (const v of seq) { f.poiseCd = 0; C.strike(f, v, 1); if (f.broken > 0) broke = true; BK.sim(6); }
      out.break[t + ':' + nm] = { poise: Math.round(f.poise || 0), broke, max: F.poiseMax(f) }; }
    out.stale = F.FBS.stale; out.varied = F.FBS.varied;
    /* ---- REFUND ---- */
    { const f = one(spot, 'swornsword', 1, 0); for (let n = 0; n < 8 && !(f.broken > 0); n++) { f.poiseCd = 0; C.strike(f, 'heavy', 1); }
      P.x = f.x - 14; P.face = 1; P.vx = 0; P.atk = -1; P.hp = Math.round(P.maxHp * 0.5); P.st = Math.round(P.maxSt * 0.5); P.exhaustT = 0; const hp0 = P.hp, st0 = F.FBS.st, r0 = F.FBS.refunds; BK.god = false;
      BK.press('atk'); for (let k = 0; k < 45 && f.alive; k++) BK.sim(1); BK.god = true;
      out.refund = { dead: !f.alive, refunds: F.FBS.refunds - r0, hp: P.hp - hp0, st: Math.round(F.FBS.st - st0), maxHp: P.maxHp }; }
    /* ---- PLUNGE ---- */
    { const f = one(spot, 'soldier', 3, 999); for (let n = 0; n < 8 && !(f.broken > 0); n++) { f.poiseCd = 0; C.strike(f, 'heavy', 1); } BK.sim(30);   /* (it is thrown by the heavy: let it land, broken) */
      const p0 = F.FBS.plunge; P.x = f.x; P.y = f.y - 40; P.vx = 0; P.vy = 40; P.ground = false; P.face = 1; K.down = true; BK.press('atk');
      let k = 0; while (k++ < 90 && f.alive) BK.sim(1); K.down = false; BK.sim(30);
      out.plunge = { broken: true, dead: !f.alive, plunges: F.FBS.plunge - p0 }; }
    /* ---- AFFIXES ---- */
    { const f = one(spot, 'hound'); F.apply(f, 'shielded'); const s0 = f.faShell, h0 = f.hp; C.strike(f, 'light', 10); const cutLoss = h0 - f.hp, s1 = f.faShell; BK.sim(10);
      const h1 = f.hp; C.strike(f, 'heavy', 10); out.shielded = { shell0: s0, cutLoss, shellAfterCut: s1, shellAfterHeavy: f.faShell, heavyLoss: h1 - f.hp }; }
    { const f = one(spot, 'hound'); const m0 = F.poiseMax(f); F.apply(f, 'heavy'); out.heavy = { bar0: m0, bar: F.poiseMax(f) }; }
    for (const far of [false, true]) { const f = one(spot, 'sprig', far ? 9 : 1, 0); F.apply(f, 'volatile'); f.hp = 1; BK.god = false; P.hp = P.maxHp; const hp0 = P.hp;
      C.strike(f, 'light', 5); P.x = f.x - (far ? 140 : 10); P.vx = 0; BK.sim(30); const lit = F.FUSES.length; BK.sim(200); out['volatile' + (far ? 'Far' : 'Near')] = { dead: !f.alive, lit, hurt: hp0 - P.hp, left: F.FUSES.length }; BK.god = true; P.hp = P.maxHp; }
    { clear(); BK.tp(spot[0], spot[1]); BK.sim(5); const [a] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 14, y: spot[1], face: 1 }), [b] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 22, y: spot[1], face: 1 });
      F.apply(b, 'hasted'); BK.tp(spot[0] - 2, spot[1]); const ax = a.x, bx = b.x; let da = 0, db = 0, la = a.x, lb = b.x;
      for (let k = 0; k < 120; k++) { BK.sim(1); da += Math.abs(a.x - la); db += Math.abs(b.x - lb); la = a.x; lb = b.x; } out.hasted = { plain: Math.round(da), hasted: Math.round(db) }; }
    /* ---- PURSUIT ---- */
    for (const id of ['stockade', 'wood']) { spot = setup(id); const p0 = F.FPS.pursuits; clear(); BK.tp(spot[0], spot[1]); BK.sim(5);
      const [s] = BK.spawnFoe({ t: 'soldier', x: spot[0] + 2, y: spot[1], face: 1 }); s.hp = 999; BK.tp(spot[0] + 13, spot[1]); BK.sim(2); const x0 = s.x;
      K.right = true; for (let k = 0; k < 70; k++) BK.sim(1); K.right = false; BK.sim(20); const chased = s.x - x0;
      BK.tp(Math.min(BK.L.W - 3, spot[0] + 60), spot[1]); for (let k = 0; k < 420; k++) BK.sim(1);
      out['pursue_' + id] = { live: F.live('pursue'), pursuits: F.FPS.pursuits - p0, chased: Math.round(chased), home: Math.round(s.x - x0) }; }
    /* ---- LEAD ---- */
    for (const id of ['stockade', 'wood']) { spot = setup(id); clear(); BK.tp(spot[0], spot[1]); BK.sim(5); const [a] = BK.spawnFoe({ t: 'archer', x: spot[0], y: spot[1], face: 1 }); a.hp = 999;
      BK.tp(spot[0] + 4, spot[1]); BK.sim(2); a.timer = 0; let shot = null, px = 0, pv = 0; a.fpAim = undefined; K.right = true;
      for (let k = 0; k < 160 && !shot; k++) { const n0 = BK.seeds().length; px = P.x; pv = P.vx; BK.sim(1); const s = BK.seeds().slice(n0).find(q => q.owner === a); if (s) shot = { x: s.x, vx: s.vx }; }
      K.right = false; out['lead_' + id] = shot ? { lead: a.fpAim === undefined ? 0 : Math.round(a.fpAim - a.fpAimFrom), heroVx: Math.round(pv) } : { none: true }; }
    /* ---- TOLD: a pounce jumped ---- */
    { spot = setup('wood'); const o0 = F.FPS.overreach, w0 = F.FPS.toldWatch; let tries = 0, got = 0;
      while (tries++ < 6 && !got) { const f = one(spot, 'hound', 5, 999); BK.god = false; P.hp = P.maxHp; f.face = -1; let seen = false, k = 0;
        for (; k < 400; k++) { if (f.mode === 'pounceTell') seen = true; if (seen && f.mode !== 'pounceTell') { BK.press('jump'); K.jump = true; BK.sim(12); K.jump = false; BK.sim(40); break; } BK.sim(1); }
        got = F.FPS.overreach - o0; BK.god = true; }
      out.told = { tries, watched: F.FPS.toldWatch - w0, overreach: F.FPS.overreach - o0 }; }
    /* ---- THE DEATH KNIGHT'S YARD: the ward let go on the flash ---- */
    for (const early of [false, true]) { for (const k in K) K[k] = false; BK.manualSimulation = true; BK.setHero('reaper'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'trial_reaper')); BK.state = 'play'; BK.god = false; BK.sim(30);
      const si = BK.L.trial.findIndex(q => q.kind === 'flash'), st = BK.L.trial[si], d0 = F.dkReturns(); BK.tp(st.x0 + 3, 19); P.vx = 0; P.face = 1; BK.sim(20);
      const foe = () => BK.enemies().filter(e => e.alive && e.x > st.x0 * 16 && e.x < st.gate * 16).sort((a, b) => a.x - b.x)[0];
      let cuts = 0, was = '';
      for (let f = 0; f < 60 * 40 && !st.done && cuts < 6; f++) { const e = foe(); P.hp = P.maxHp; P.st = P.maxSt; if (!e) { BK.sim(1); continue; } P.face = Math.sign(e.x - P.x) || 1; const gap = Math.abs(e.x - P.x); K.right = gap > 26 && e.x > P.x; K.left = gap > 26 && e.x < P.x;
        if (e.mode === 'cutTell') { if (was !== 'cutTell') cuts++; K.block = early ? e.modeT > 0.6 : !e.glint; } else K.block = false;
        was = e.mode; BK.sim(1); }
      for (const k in K) K[k] = false;
      out['reaper' + (early ? 'Early' : '')] = { got: st.got || 0, n: st.n, done: !!st.done, returns: F.dkReturns() - d0, cuts }; }
    return out; })()`, 900000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(R));
const bad = [], must = (ok, msg) => { if (!ok) bad.push(msg); };
for (const t of ['hound', 'brute', 'shield']) { const m = R.break[t + ':mash'], x = R.break[t + ':mix']; must(!m.broke, t + ': four of the same cut broke it (stale must stop a mash)'); must(x.broke || x.poise > m.poise, t + ': a varied run leaned no harder than the mash (' + x.poise + ' vs ' + m.poise + ')'); }
must(!R.break['sprig:mash'].broke && R.break['sprig:mash'].poise === 0, 'sprig: four cuts moved a goblin\'s light bar'); must(R.break['sprig:mix'].broke, 'sprig: a varied run did not break its light bar');
must(R.stale > 0 && R.varied > 0, 'no stale or varied blow was counted (FBS)');
{ const r = R.refund, want = refundOf(r.maxHp); must(r.dead && r.refunds === 1, 'the finisher did not land (dead ' + r.dead + ', refunds ' + r.refunds + ')'); must(r.hp >= want.hp, 'the finisher refunded ' + r.hp + ' hp, not ' + want.hp); must(r.st >= 8, 'the finisher refunded ' + r.st + ' wind'); }
must(R.plunge.dead && R.plunge.plunges === 1, 'a plunge on a broken soldier did not finish it (' + JSON.stringify(R.plunge) + ')');
{ const s = R.shielded; must(s.shellAfterCut < s.shell0 && s.cutLoss === Math.max(1, Math.round((s.shell0 - s.shellAfterCut) * 0.4)), 'SHIELDED: a cut must land 40% of itself and wear the shell by the whole of it (' + JSON.stringify(s) + ')'); must(s.shellAfterHeavy === 0 && s.heavyLoss >= 10, 'SHIELDED: a heavy must shatter the shell and land whole (' + JSON.stringify(s) + ')'); }
must(R.heavy.bar > R.heavy.bar0, 'HEAVY: its bar is no deeper');
must(R.volatileNear.dead && R.volatileNear.lit >= 1 && R.volatileNear.hurt > 0 && R.volatileNear.left === 0, 'VOLATILE: dead beside the hero it must light a fuse, burst and hurt him (' + JSON.stringify(R.volatileNear) + ')');
must(R.volatileFar.lit >= 1 && R.volatileFar.hurt === 0, 'VOLATILE: a hero clear of the burst must not be hurt (' + JSON.stringify(R.volatileFar) + ')');
must(R.hasted.plain > 4 && R.hasted.hasted > R.hasted.plain * 1.1, 'HASTED: it walked no faster than its twin (' + JSON.stringify(R.hasted) + ')');
must(R.pursue_stockade.live && R.pursue_stockade.pursuits >= 1 && R.pursue_stockade.chased > 24, 'PURSUIT: on the Stockade a soldier did not come after a hero running past (' + JSON.stringify(R.pursue_stockade) + ')');
must(R.pursue_stockade.home < R.pursue_stockade.chased, 'PURSUIT: the soldier did not walk home on its leash (' + JSON.stringify(R.pursue_stockade) + ')');
must(!R.pursue_wood.live && R.pursue_wood.pursuits === 0, 'PURSUIT: the Wood is not live, and something pursued there');
must(R.lead_stockade.none || (R.lead_stockade.heroVx < 30 || R.lead_stockade.lead > 20), 'LEAD: on the Stockade the archer shot at a running hero, not ahead of him (' + JSON.stringify(R.lead_stockade) + ')');
must(!R.lead_stockade.none, 'LEAD: the archer on the Stockade never loosed');
must(R.lead_wood.none || Math.abs(R.lead_wood.lead) < 12, 'LEAD: in the Wood the archer led his shot (' + JSON.stringify(R.lead_wood) + ')');
must(R.told.watched >= 1 && R.told.overreach >= 1, 'TOLD: a hound pounce jumped over did not overreach (' + JSON.stringify(R.told) + ')');
must(R.reaper.done && R.reaper.returns >= 2, 'THE DEATH KNIGHT\'S YARD: the ward let go on the flash did not pass the station (' + JSON.stringify(R.reaper) + ')');
must(!R.reaperEarly.got, 'THE DEATH KNIGHT\'S YARD: a ward let go as the tell started was counted as the beat (' + JSON.stringify(R.reaperEarly) + ')');
assert.deepEqual(bad, [], 'the foe pass in the page:\n  ' + bad.join('\n  '));
console.log('foe pass in the page: stale mashes never break, varied runs do; the finisher pays ' + R.refund.hp + ' hp + wind; a plunge finishes; the four affixes; pursuit and the lead on a live level only; a jumped pounce overreaches; the Death Knight\'s yard teaches the ward let go.');
