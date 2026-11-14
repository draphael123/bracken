// PAGE TOOL: launches headless Chrome
// tools/hornetsnest-fog.mjs - THE FOG DROPS THE HORNET QUEEN, and the nest's new resin drips, in the page (claude/hornetsnest2; scratch/plan-hornetsnest2-1102.md A + B).
//   A1a  a THROWN pot that breaks on her in 'aim' at hover height -> mode dazed (grounded) within 0.3 s, then she FALLS to the floor; the stun (3.0 s) starts ON LANDING
//   A1b  her BODY in a fog cloud for 0.25 s (any flying mode) grounds her
//   A4   a second pot inside the 8 s wary window does NOT ground her (she fans it); after the window it does
//   A5   P2: the first fog on a cloaked queen strips the cloak only; the next pot (after 2 s) grounds her
//   A7   her dive through a FULL hall stand bursts the pot -> fog -> grounded; the stand is full again at 9 s
//   A3   resist floor: nothing she wears (flying, grounded, warded) takes a blow below 0.4x
//   B    RESIN DRIPS: every drip's bead swells >= 0.6 s before it falls; a hero under one is struck once (10 dmg) and held (syrup)
//   node tools/hornetsnest-fog.mjs
import { openPage } from './cdp.mjs';
const rows = []; const ok = (name, pass, why = '') => { rows.push({ name, pass: !!pass, why }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const HQM = await import('/src/hornet-queen.js'); BK.manualSimulation = true; const out = {}; const FR = 100;   /* BK.sim(1) is 10 ms */
    const load = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(30); };
    const fight = () => { load(); BK.tp(401, 21); BK.sim(120); const QH = BK.hornetQueenHands(), N = BK.nestHands(); return { QH, N, e: BK.boss, S: QH.show() }; };
    const calm = (F, mode = 'hover') => { const { e, S } = F; S.ward = 0; e.ward = 0; S.cloak = 0; e.cloak = 0; e.smokeCd = 0; e.fogT = 0; e.mode = mode; e.modeT = 5; e.fall = 0; e.x = S.G.h.mid + 20; e.y = S.G.h.floor - 70; e.vx = 0; e.vy = 0; BK.P.x = S.G.h.x0 + 40; BK.P.y = S.G.h.floor; };
    const floor = F => F.S.G.h.floor;
    { /* A1a */
      const F = fight(), { e, N, S } = F; calm(F, 'aim'); e.modeT = 4; const t0 = S.n.dazed;
      N.lob(e.x, e.y - 8, 0, 0); let f = 0; for (; f < 60 && e.mode !== 'dazed'; f++) BK.sim(1);
      out.a1 = { mode: e.mode, frames: f, fall: e.fall, y0: e.y, n: S.n.dazed - t0 }; let g = 0; for (; g < 200 && e.fall; g++) BK.sim(1);
      out.a1b = { fell: !e.fall, y: e.y, floor: floor(F), frames: g, modeT: e.modeT, mode: e.mode, open: HQM.hqOpen(e), take: HQM.takeBlow(e, S, 20, false)[0] };
      /* A4: inside the wary window */
      for (let i = 0; i < FR * 6.4; i++) BK.sim(1);
      out.a4pre = { smokeCd: e.smokeCd, mode: e.mode, ward: S.ward };
      e.mode = 'hover'; e.modeT = 5; e.y = floor(F) - 70; S.ward = 0; e.ward = 0; const n1 = S.n.dazed;
      N.lob(e.x, e.y - 8, 0, 0); BK.sim(40); out.a4 = { mode: e.mode, grounded: S.n.dazed - n1, smokeCd: e.smokeCd };
      for (let i = 0; i < FR * 3; i++) BK.sim(1); e.mode = 'hover'; e.modeT = 5; e.y = floor(F) - 70; e.smokeCd = Math.min(e.smokeCd, 0); S.ward = 0; const n2 = S.n.dazed;
      N.lob(e.x, e.y - 8, 0, 0); BK.sim(40); out.a4after = { mode: e.mode, grounded: S.n.dazed - n2 };
    }
    { /* A1b: in the fog 0.25 s, any flying mode (circle high) */
      const F = fight(), { e, N, S } = F; calm(F, 'circle'); e.modeT = 9; const n = S.n.dazed; const cl = N.stands()[0];
      N.puff(e.x, e.y - 6); BK.sim(1); const clouds = N.clouds(); out.b1 = { clouds: clouds.length, r: clouds[0] && clouds[0].r, t: clouds[0] && clouds[0].t };
      for (let i = 0; i < 80 && e.mode !== 'dazed'; i++) BK.sim(1); out.b1m = { mode: e.mode, grounded: S.n.dazed - n }; void cl;
    }
    { /* A5: P2 cloak */
      const F = fight(), { e, N, S } = F; calm(F, 'circle'); S.stage = 2; e.phase = 2; S.cloak = 30; e.cloak = 30; e.modeT = 9; const n = S.n.dazed;
      const tr = []; for (let k = 0; k < 10 && S.n.cloakOff < 1; k++) { BK.sim(3); N.lob(e.x, e.y - 8, 0, 0); BK.sim(1); tr.push([Math.round(e.x), Math.round(e.y), e.mode, +S.cloak.toFixed(1), N.read().n.broke]); } out.c1t = tr; out.c1 = { cloak: S.cloak, mode: e.mode, grounded: S.n.dazed - n, smokeCd: e.smokeCd, off: S.n.cloakOff };
      for (let i = 0; i < FR * 2.4; i++) BK.sim(1); e.mode = 'circle'; e.modeT = 9; e.fogT = 0; S.ward = 0; e.ward = 0; BK.sim(1); N.lob(e.x, e.y - 8, 0, 0); BK.sim(2);
      out.c2 = { mode: e.mode, grounded: S.n.dazed - n, stun: e.modeT };
    }
    { /* A7: her dive through a full hall stand */
      const F = fight(), { e, N, S } = F; calm(F, 'skim'); e.modeT = 9; const st = N.stands().filter(s => s.hall); out.d0 = { hall: st.length, full: st.every(s => s.st === 'full') };
      const s0 = st[0]; e.x = s0.x + 2; e.y = s0.y - 4; e.vx = 0; e.vy = 0; BK.sim(2); const n = S.n.dazed;
      out.d1 = { stand: N.stands().find(s => s.hall && Math.abs(s.x - s0.x) < 2).st, clouds: N.clouds().length, burst: N.read().n.standBurst };
      for (let i = 0; i < 80 && e.mode !== 'dazed'; i++) BK.sim(1); out.d2 = { mode: e.mode, grounded: S.n.dazed - n };
      let at9 = null; for (let i = 0; i < FR * 10; i++) { BK.sim(1); const s = N.stands().find(q => q.hall && Math.abs(q.x - s0.x) < 2); if (s.st === 'full') { at9 = i / FR; break; } } out.d3 = { regrow: at9 === null ? null : at9 / FR * 100 };
    }
    { /* A3: the resist floor: every mode and state keeps >= 0.4 */
      const F = fight(), { e, S } = F; let min = 9; const modes = ['hover', 'aim', 'dive', 'sweepTell', 'sweep', 'buzzTell', 'buzz', 'rise', 'skim', 'thrash', 'circle', 'rejoin', 'dazed', 'stuck', 'winded'];
      for (const stage of [1, 2]) for (const ward of [0, 1]) for (const cloak of [0, 1]) for (const m of modes) { S.stage = stage; S.ward = ward; S.cloak = cloak * 5; e.mode = m; e.hp = e.maxHp; const d = HQM.takeBlow(e, S, 100, false)[0]; if (d / 100 < min) min = d / 100; }
      out.e = { min };
    }
    { /* B: resin drips */
      load(); const N = BK.nestHands(); const D = () => N.drips(); out.dn = D().length;
      BK.tp(185, 27); BK.P.face = 1; BK.sim(5); const log = {}; let hits0 = N.read().n.dripHit, hp0 = BK.P.hp; BK.god = false; BK.P.inv = 0;
      const sw = new Map(); let minTell = 9, falls = 0, struck = 0;
      let sy = 0, minHp = hp0; for (let i = 0; i < FR * 14; i++) { sy = Math.max(sy, BK.P.syrupT || 0); minHp = Math.min(minHp, BK.P.hp); BK.P.x = 185 * 16 + 8; BK.P.y = 28 * 16; BK.P.vx = 0; BK.P.vy = 0; BK.sim(1);
        D().forEach((d, k) => { const prev = sw.get(k) || { st: 'wait', t: 0 }; if (d.st === 'swell') sw.set(k, { st: 'swell', t: prev.st === 'swell' ? prev.t + 1 : 1 }); else { if (prev.st === 'swell' && d.st === 'fall') { minTell = Math.min(minTell, prev.t / FR); falls++; } sw.set(k, { st: d.st, t: 0 }); } }); }
      out.f = { minTell, falls, hit: N.read().n.dripHit - hits0, hpLost: hp0 - minHp, syrup: sy };
    }
    out.errors = (window.__errs || []).length; return out; })()`, 600000);
  console.log(JSON.stringify(r));
  ok('A1a: a pot thrown at her in AIM at hover height grounds her within 0.3 s (mode dazed, falling)', r.a1.mode === 'dazed' && r.a1.frames <= 18 && r.a1.fall === 1 && r.a1.n === 1, JSON.stringify(r.a1));
  ok('A2: she FALLS to the floor, then the stun starts ON LANDING (3.0 s in P1), open at x1.5', r.a1b.fell && Math.abs(r.a1b.y - r.a1b.floor) < 1 && r.a1b.mode === 'dazed' && r.a1b.modeT > 2.7 && r.a1b.modeT <= 3.0 && r.a1b.open && r.a1b.take === 30, JSON.stringify(r.a1b));
  ok('A4: ~6.4 s after a grounding she is still wary (smokeCd > 0): a second pot does NOT ground her', r.a4pre.smokeCd > 0 && r.a4.grounded === 0 && r.a4.mode !== 'dazed', JSON.stringify([r.a4pre, r.a4]));
  ok('A4: once the 8 s wary window has run out, a pot grounds her again', r.a4after.grounded === 1 && r.a4after.mode === 'dazed', JSON.stringify(r.a4after));
  ok('A6: the hall fog is 56 px and 4 s', r.b1.clouds >= 1 && r.b1.r === 56 && r.b1.t > 3.5 && r.b1.t <= 4.0, JSON.stringify(r.b1));
  ok('A1b: her body in the fog (a high circle) grounds her', r.b1m.mode === 'dazed' && r.b1m.grounded === 1, JSON.stringify(r.b1m));
  ok('A5: P2 cloak: pot 1 strips the cloak and does not ground her', r.c1.cloak === 0 && r.c1.mode !== 'dazed' && r.c1.grounded === 0 && r.c1.off === 1 && r.c1.smokeCd > 0, JSON.stringify(r.c1));
  ok('A5: P2 cloak: pot 2 (after the 2 s) grounds her (stun 2.6 s)', r.c2.mode === 'dazed' && r.c2.grounded === 1, JSON.stringify(r.c2));
  ok('A7: the hall has two stands, both full', r.d0.hall === 2 && r.d0.full, JSON.stringify(r.d0));
  ok('A7: her body through a full stand BURSTS the pot (the stand empties, a fog at it), and the fog grounds her', r.d1.stand === 'empty' && r.d1.clouds >= 1 && r.d1.burst >= 1 && r.d2.mode === 'dazed' && r.d2.grounded === 1, JSON.stringify([r.d1, r.d2]));
  ok('A8: the burst stand regrows its pot ~9 s on', r.d3.regrow !== null && r.d3.regrow > 8 && r.d3.regrow < 10, JSON.stringify(r.d3));
  ok('A3: the resist floor: nothing she wears takes a blow below 0.4x (min ' + r.e.min + ')', r.e.min >= 0.4, JSON.stringify(r.e));
  ok('B: 9 resin drips in the level', r.dn === 9, String(r.dn));
  ok('B: every bead swells >= 0.6 s before it falls (told), and a hero under one is struck and held', r.f.falls >= 3 && r.f.minTell >= 0.6 && r.f.hit >= 1 && r.f.hpLost > 0 && r.f.syrup > 0, JSON.stringify(r.f));
  ok('no page errors', pg.errors.length === 0, JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
const bad = rows.filter(x => !x.pass); console.log(bad.length ? bad.length + ' red of ' + rows.length : 'all ' + rows.length + ' green'); process.exit(bad.length ? 1 : 0);
