// src/hurricane3.js - THE HURRICANE DECK 3's own systems (claude/hurricane3, the OPUS rework of scratch/brief-hurricane3-1018.md + the APPROVED review
// scratch/review-hurricane-1018.md, Daniel 10-18 'all recs'). The level is theHurricane() in src/level.js (L.h3); src/main.js keeps her ROLL (updateRoll: the heel on
// the ground, and now IN THE AIR - downhill long, uphill short), her WAVE (updateWash), the LIGHTNING (updateStrikes), the FELLED masts and THE CAPTAIN. This module is:
//   SHE IS SINKING (L.h3.sink)  the open sea outside her (p.h3sea: swimmable, DEADLY - the quiet drain, src/main.js) climbs her in told STEPS as you cross each one
//                               (a hull groan, the bell, the waterline gauge): her hold, her gun deck, her stern. From the mizzen top it CHASES you up the rigging
//                               (THE RISING SEA: rubber-banded on your feet, never above its cap before the fight), and in his fight it climbs his mast by phase.
//                               A respawn wakes to the step of the shrine you woke at (L.h3.checkSteps).
//   THE WAIST FLOODS (L.h3.floods) low -> warn (three strokes of the bell, a foam line where the water will stand, 'A SEA TO WINDWARD') -> rise -> high -> fall. A
//                               swimmable pool (p.h3flood) driven by poolLevel: flooded you swim up to the galley roof, drained you walk the floor and the hold.
//   HER CASKS (movers kind 'cask', m.h3)  lashed until a blow parts the lashing; then her heel runs them downhill - a HAZARD while they run (>55 px/s), a STEP when
//                               one fetches up against a bitt or a house (the reach model reads L.caskSteps). One lost overboard comes back to its chocks.
//   HER LIGHTNING RODS ('lightrod' ents)  a rod CHARGES (its chain glows and crackles - the last two seconds told) and the bolt comes down its chain to the chain's end.
//                               STRIKE THE CHAIN onto the iron and the next bolt goes where the chain now leads: rod 1 BURNS the tarred net off the main hatch
//                               (burn: cells, destroyed - broken stays broken), rod 2 FELLS her mizzen topmast into a bridge (fell: L.felled index). The mast rod
//                               is THE CAPTAIN's key: his fight drives it (bossRod).
//   HER SAILS                    each over a gust zone: slack, then FILLING and SNAPPING through the gust's told build-up, full while it blows (the wind told where you
//                               stand); the rain slants with it (drawn here over the zone).
//   THE AREA BANNERS            L.h3.sections, by box (she is walked out and back).
// GREYBOX drawing throughout (the art list is in the lane report). main.js calls: on, clear, update(dt), strike(hb), mover(m, dt), drawMover(g, m, cx, cy, t),
//   drawBack(g, cx, cy, t), drawOver(g, cx, cy, t), hud(g, t), seaY(), step(), bossRod(dt, live), rodInfo(id), fightSea(phase), read().
const R = Math.round;
import { makeHurricane3Art } from './redraw/hurricane3_art.js';
export const H3 = {
  /* THE CASKS: heel push px/s2, top speed, friction (share kept a second off the heel), the speed past which a running cask hurts, its blow */
  caskAcc: 210, caskTop: 115, caskFric: 0.25, caskHurt: 55, caskDmg: 12, caskBack: 8,
  /* THE RODS: seconds to charge, the told tail, a struck chain jumps the charge to at least this, the bolt's reach round the chain's end (px), cool after a bolt */
  rodCharge: 7, rodTell: 2, rodJump: 0.55, rodHit: 20, rodCool: 2.5, bossRodT: 9.5,
  /* THE FIGHT'S SEA: px/s it climbs when his phase calls for more */
  fightRise: 18, stepRise: 26,
};
export const H3_SAY = { step0: 'SHE SETTLES', rising: 'THE SEA IS COMING UP HER: CLIMB, AND DO NOT STOP', topSafe: 'THE SEA HOLDS UNDER THE MAIN TOP, FOR NOW',
  flood: 'A SEA TO WINDWARD: HER WAIST WILL FLOOD', floodUp: 'HER WAIST IS FLOODED: SWIM UP WITH IT', floodDown: 'SHE DRAINS', lash: 'THE LASHING PARTS: SHE WILL RUN IT ON THE NEXT HEEL',
  chain: 'THE CHAIN IS ON THE IRON: THE NEXT BOLT COMES DOWN IT. STAND CLEAR', charging: 'THE ROD IS CHARGING', burnt: 'THE BOLT BURNS THE TARRED NET OFF THE HATCH',
  felled: 'THE BOLT FELLS HER MIZZEN TOPMAST: A BRIDGE TO THE STAYS', grounded: 'THE BOLT RUNS DOWN THE CHAIN INTO HER DECK', struck: 'STRUCK',
  t1: 'THE SEA TAKES THE TOPSAIL YARD', t2: 'THE SEA TAKES THE TOPGALLANT. UP TO THE ROYAL YARD' };
export function makeHurricane3(ctx) {
  const H = {}; let S = null;
  const TS = 16, lv = () => ctx.L, on = () => !!(lv() && lv().h3);
  H.on = on;
  /* (claude/hurricane3art) THE ART PASS: src/redraw/hurricane3_art.js draws what this module's greybox drew, with the ship kit of the Hurricane 2 + the Flotilla 3 */
  let ART = null; const art = () => ART || (ART = makeHurricane3Art({ get L() { return lv(); }, T: ctx.T, VW: ctx.VW, felledDown: i => ctx.felledDown(i), gustNow: z => ctx.gustNow(z), text: (...a) => ctx.text(...a), hero: () => ctx.hero(), bossActive: () => ctx.bossActive(), rodTold: k => H.rodTold(k), H3 }, ctx.kit()));
  H.art = art;
  const hero = () => ctx.hero();
  const seaPool = () => (lv().pools || []).find(p => p.h3sea);
  const inBox = (P, b) => { const tx = P.x / TS, ty = P.y / TS; return tx >= b[0] && tx <= b[1] + 1 && ty >= b[2] && ty <= b[3] + 1; };
  /* the step a shrine wakes to: the nearest entry of L.h3.checkSteps to the checkpoint (a boss jump wakes at the main top) */
  function stepFor(cp) { const list = lv().h3.checkSteps || []; let best = 0, bd = 1e9; for (const [x, y, s] of list) { const d = Math.hypot(cp.x / TS - x, cp.y / TS - y); if (d < bd) { bd = d; best = s; } } return best; }
  function seaFor(step) { const K = lv().h3.sink; return step >= 4 ? K.rise.cap : K.steps[Math.min(step, K.steps.length - 1)]; }
  function fresh() { const K = lv().h3; S = { L: lv(), step: 0, rising: false, seaY: K.sink.steps[0], told: {}, banner: null, sec: -1, fightPh: 0, gauge: 0, groan: 0,
    floods: (K.floods || []).map(f => ({ ...f, ph: 'low', t: f.first ?? f.low, k: 0, toll: 0 })),
    rods: (K.rods || []).map(r => ({ ...r, charge: 0, connected: false, done: false, cool: 0, tellSnd: 0, glow: 0, bolt: 0 })), boss: { charge: 0, glow: 0, bolt: 0 } }; }
  /* a load builds fresh state; a respawn (spawnEntities calls clear again on the same level) rewinds it to the shrine's step */
  H.clear = () => { if (!on()) { S = null; return; } if (!S || S.L !== lv()) fresh(); rewind(); };
  function rewind() { const cp = ctx.checkpoint(); S.step = cp ? stepFor(cp) : 0; S.rising = false; S.seaY = seaFor(S.step); S.fightPh = 0; S.banner = null; S.sec = -1;
    for (const f of S.floods) { f.ph = 'low'; f.t = f.first ?? f.low; f.k = 0; f.toll = 0; }
    for (const r of S.rods) { r.charge = 0; r.cool = 0; r.glow = 0; r.bolt = 0; if (!r.done) r.connected = false; }
    S.boss = { charge: 0, glow: 0, bolt: 0 };
    /* a burnt net stays burnt (its cells are in the destroyed set); a felled topmast stays down (src/main.js seaReset lays it again) */
    applySea(); applyFloods(); }
  function applySea() { const p = seaPool(); if (p) { p.y = S.seaY; } }
  function applyFloods() { for (const f of S.floods) { const p = (lv().pools || []).find(q => q.h3flood === f.id); if (p) ctx.poolLevel(p, p.loY + (p.hiY - p.loY) * f.k); } }
  H.seaY = () => (S ? S.seaY : 0); H.step = () => (S ? S.step : 0);

  /* ---------- SHE IS SINKING ---------- */
  function sink(dt) { const K = lv().h3.sink, P = hero(); if (!P) return;
    if (!ctx.bossActive()) {
      if (!P.dead) for (let i = 0; i < K.at.length; i++) if (S.step < i + 1 && inBox(P, K.at[i])) { S.step = i + 1; S.groan = 1.2; ctx.cue(K.say[i], '#ff9a7a', 3); ctx.sound('groan'); ctx.shake(5); }
      if (S.step === 3 && !S.rising && !P.dead && inBox(P, K.rise.at)) { S.rising = true; S.groan = 1.2; ctx.cue(K.rise.say, '#ff6b6b', 3.2); ctx.sound('groan'); ctx.shake(6); }
      const cp = ctx.checkpoint(); if (cp && S.step < 4 && stepFor(cp) >= 4) { S.step = 4; S.rising = false; ctx.cue(H3_SAY.topSafe, '#a8cfc6', 2.4); }
      let want = seaFor(S.step);
      if (S.rising && S.step === 3) { const gap = S.seaY - P.y, Rz = K.rise, rate = P.dead ? 0 : gap > Rz.far ? Rz.fast : gap > Rz.near ? Rz.base : Rz.slow;
        S.seaY = Math.max(Rz.cap, S.seaY - rate * dt); want = S.seaY; }
      if (S.seaY > want) S.seaY = Math.max(want, S.seaY - H3.stepRise * dt); else if (!S.rising) S.seaY = want;
    } else {   /* HIS FIGHT: the sea climbs his mast by phase (the Captain's update sets S.fightPh) */
      if (S.seaY > K.rise.cap) S.seaY = K.rise.cap;   /* (his fight starts with her down to the main yard, however you came: a boss jump wakes at the main top) */
      const want = K.fight[Math.max(0, Math.min(K.fight.length - 1, S.fightPh))]; if (S.seaY > want) S.seaY = Math.max(want, S.seaY - H3.fightRise * dt); }
    S.groan = Math.max(0, S.groan - dt);
    applySea(); }
  /* the Captain says which phase's sea (0, 1, 2); a new one is told once */
  H.fightSea = ph => { if (!S) return; if (ph > S.fightPh) { S.fightPh = ph; S.groan = 1.2; ctx.cue(ph === 1 ? H3_SAY.t1 : H3_SAY.t2, '#ff6b6b', 3); ctx.sound('groan'); ctx.shake(6); } };

  /* ---------- THE WAIST FLOODS ---------- */
  function floods(dt) { const P = hero();
    for (const f of S.floods) { const p = (lv().pools || []).find(q => q.h3flood === f.id); if (!p) continue;
      const near = P && Math.abs(P.x / TS - (f.x0 + f.x1) / 2) < 70;
      f.t -= dt;
      if (f.t <= 0) { const nx = { low: 'warn', warn: 'rise', rise: 'high', high: 'fall', fall: 'low' }[f.ph]; f.ph = nx; f.t = f[nx]; f.toll = 0;
        if (near) { if (nx === 'rise') { ctx.sound('wave'); ctx.shake(4); if (!S.told.fu) { S.told.fu = 1; ctx.cue(H3_SAY.floodUp, '#bfe6f5', 2.4); } } else if (nx === 'fall') ctx.sound('splash'); } }
      if (f.ph === 'warn' && near) { const n = Math.min(3, 1 + Math.floor((f.warn - f.t) / (f.warn / 3))); if (n > f.toll) { f.toll = n; ctx.sound('bell'); if (n === 1 && !S.told.fl) { S.told.fl = 1; ctx.cue(H3_SAY.flood, '#a8cfc6', 2.6); } } }
      const u = f.ph === 'rise' ? 1 - f.t / f.rise : f.ph === 'fall' ? f.t / f.fall : f.ph === 'high' ? 1 : 0, uu = Math.max(0, Math.min(1, u));
      f.k = uu * uu * (3 - 2 * uu);
      ctx.poolLevel(p, p.loY + (p.hiY - p.loY) * f.k); p.flow = f.ph === 'rise' ? -10 : f.ph === 'fall' ? 10 : 0; } }

  /* ---------- HER CASKS ---------- */
  const footAt = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return ctx.isSolid(tx, ty) || ctx.oneWay(tx, ty); };
  H.mover = (m, dt) => { if (!on() || m.kind !== 'cask') return false; const ox = m.x, oy = m.y;
    if (m.gone) { m.back -= dt; m.broken = true; if (m.back <= 0) { m.gone = false; m.broken = false; m.x = m.x0; m.y = m.y0; m.vx = 0; m.vy = 0; m.lashed = false; } m.dx = 0; m.dy = 0; return true; }
    if (m.lashed) { m.dx = 0; m.dy = 0; return true; }
    const cxm = m.x + 8, bot = m.y + 16;
    /* the floor under it, or a fall */
    const floor = footAt(m.x + 3, bot + 1) || footAt(m.x + 13, bot + 1);
    if (!floor) { m.vy = Math.min(360, (m.vy || 0) + 900 * dt); m.y += m.vy * dt; const nb = m.y + 16;
      if (footAt(m.x + 3, nb) || footAt(m.x + 13, nb)) { m.y = Math.floor(nb / TS) * TS - 16; m.vy = 0; ctx.sound('thud'); } }
    else m.vy = 0;
    /* her heel runs it downhill */
    const hl = ctx.heel(); if (hl.on && ctx.onDeck(cxm, m.y + 16)) { m.vx += hl.dir * H3.caskAcc * hl.k * dt; if (Math.abs(m.vx) > H3.caskTop) m.vx = Math.sign(m.vx) * H3.caskTop; }
    else m.vx *= Math.pow(H3.caskFric, dt);
    if (Math.abs(m.vx) > 1) { const d = Math.sign(m.vx), nx = m.x + m.vx * dt, lead = d > 0 ? nx + 16 : nx, tx = Math.floor(lead / TS);
      const hit = ctx.isSolid(tx, Math.floor((m.y + 2) / TS)) || ctx.isSolid(tx, Math.floor((m.y + 14) / TS));
      if (hit) { const sp = Math.abs(m.vx); m.x = d > 0 ? tx * TS - 16 : (tx + 1) * TS; m.vx = 0; if (sp > 40) { ctx.sound('thud'); ctx.dust(m.x + 8 + d * 8, m.y + 16, 4); } }
      else m.x = nx; }
    else m.vx = 0;
    /* overboard, or into the sea: it comes back to its chocks */
    const sp = seaPool(); if (m.y > ctx.LH() * TS || (sp && m.y + 8 > sp.y && m.x + 8 > sp.x0 && m.x + 8 < sp.x1)) { m.gone = true; m.back = H3.caskBack; ctx.sound('splash'); ctx.burst(m.x + 8, m.y, 8, ['#8a5a32', '#c9b27c'], 50, 0.4); }
    m.dx = m.x - ox; m.dy = m.y - oy;
    /* RUNNING, IT HURTS: the hero it runs into (not one riding it), and her hands */
    m.hitT = Math.max(0, (m.hitT || 0) - dt);
    if (Math.abs(m.vx) > H3.caskHurt && m.hitT <= 0) { const cb = { l: m.x, r: m.x + 16, t: m.y, b: m.y + 16 }, d = Math.sign(m.vx);
      for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = hero(); if (P.dead || P.onMover === m) return; const pb = ctx.box(P);
        if (Math.sign(P.x - (m.x + 8)) === d && ctx.overlap(cb, { l: pb.l + 1, r: pb.r - 1, t: pb.t + 2, b: pb.b })) { m.hitT = 0.8; const res = ctx.damagePlayer(m.x + 8, H3.caskDmg, { unblockable: true, name: 'A LOOSE CASK' }); if (res) { P.vx = d * 170; P.vy = -120; P.ground = false; } m.vx *= 0.4; } });
      if (m.hitT <= 0) for (const e of ctx.enemies()) if (e.alive && !e.maxHp && !(e.gone > 0) && !e.harmless && ctx.overlap(cb, ctx.box(e))) { m.hitT = 0.4; ctx.hurtEnemy(e, 14, m.x + 8 - d * 8); if (e.alive) { ctx.knockFoe(e, d, Math.abs(m.vx) + 40); e.heeled = 2.5; } m.vx *= 0.5; break; } }
    return true; };

  /* ---------- A BLOW: a cask's lashing, a rod's chain ---------- */
  H.strike = hb => { if (!on() || !hb || !S) return; const P = hero();
    for (const m of ctx.movers()) { if (m.kind !== 'cask' || m.gone || (P.hitSet && P.hitSet.has(m))) continue;
      if (!ctx.overlap(hb, { l: m.x, r: m.x + 16, t: m.y, b: m.y + 16 })) continue; if (P.hitSet) P.hitSet.add(m);
      if (m.lashed) { m.lashed = false; ctx.sound('snap'); ctx.burst(m.x + 8, m.y + 4, 8, ['#c9b27c', '#8a5a32'], 70, 0.4); if (!S.told.lash) { S.told.lash = 1; ctx.number(m.x + 8, m.y - 22, H3_SAY.lash, '#ffd36b'); } }
      else { m.vx += (P.face || 1) * (P.heavy ? 150 : 90); ctx.sound('thud'); } }
    for (const r of S.rods) { if (r.boss || r.done) continue; const bx = r.x * TS, by = (r.y + 1) * TS;
      if (!ctx.overlap(hb, { l: bx - 4, r: bx + 20, t: by - 30, b: by })) continue; if (P.hitSet && P.hitSet.has(r)) continue; if (P.hitSet) P.hitSet.add(r);
      if (!r.connected) { r.connected = true; r.charge = Math.max(r.charge, H3.rodJump); ctx.sound('clank'); ctx.sparks(bx + 8, by - 12, P.face || 1, 8); ctx.number(bx + 8, by - 44, H3_SAY.chain, '#9ab8ff'); } } };

  /* ---------- HER RODS ---------- */
  function rods(dt) { const P = hero();
    for (const r of S.rods) { r.glow = Math.max(0, r.glow - dt); r.bolt = Math.max(0, r.bolt - dt); if (r.burnT > 0) r.burnT -= dt; if (r.boss || r.done) continue;
      const near = P && !P.dead && Math.abs(P.x / TS - r.x) < 24 && Math.abs(P.y / TS - r.y) < 14;
      if (r.cool > 0) { r.cool -= dt; continue; }
      if (!near) { r.charge = Math.max(0, r.charge - dt * 0.2); continue; }
      /* HER SEA WITCH by the chain calls the sky onto it: it charges near twice as fast (kill her, or time the chain) */
      const witch = ctx.enemies().some(e => e.alive && e.t === 'seawitch' && Math.abs(e.x - (r.x * TS + 8)) < 7 * TS && Math.abs(e.y - (r.y + 1) * TS) < 4 * TS); r.witch = witch;
      r.charge += dt / H3.rodCharge * (witch ? 1.8 : 1);
      if (r.charge > 1 - H3.rodTell / H3.rodCharge) { r.tellSnd -= dt; if (r.tellSnd <= 0) { r.tellSnd = 0.35; ctx.sound('crackle'); } if (!S.told['rc' + r.id]) { S.told['rc' + r.id] = 1; ctx.number(r.x * TS + 8, (r.y - 2) * TS, H3_SAY.charging, '#9ab8ff'); } }
      if (r.charge >= 1) rodFire(r); } }
  function rodFire(r) { r.charge = 0; r.cool = H3.rodCool; r.bolt = 0.35; r.glow = 0.6;
    const bx = r.x * TS + 8, by = (r.y + 1) * TS;
    ctx.bolt(bx, by, r.top[1] * TS); ctx.sound('thunder'); ctx.flash(0.4); ctx.shake(6);
    /* whoever stands at the chain's end takes it */
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = hero(); if (!P.dead && Math.abs(P.x - bx) < H3.rodHit && Math.abs(P.y - by) < 40) { ctx.damagePlayer(bx, ctx.skybolt(), { up: true, unblockable: true, name: 'THE ROD' }); ctx.number(P.x, P.y - 34, H3_SAY.struck, '#dfe8ff'); } });
    for (const e of ctx.enemies()) if (e.alive && !e.maxHp && Math.abs(e.x - bx) < 26 && Math.abs(e.y - by) < 40) ctx.hurtEnemy(e, 30, bx);
    if (!r.connected) { ctx.burst(bx, by - 4, 14, ['#dfe8ff', '#9ab8ff', '#ffffff'], 110, 0.5); return; }
    r.done = true; if (r.burn) r.burnT = 3;   /* (art only: the burning net smoulders for three seconds) */
    if (r.burn) { const [x0, x1, y0, y1] = r.burn; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ctx.destroyCell(x, y);
      ctx.resolve(); for (let x = x0; x <= x1; x++) ctx.burst(x * TS + 8, y0 * TS + 4, 6, ['#ff9a5c', '#ffd36b', '#3a2a1a'], 90, 0.7);
      ctx.bolt((x0 + x1 + 1) / 2 * TS, y0 * TS, r.top[1] * TS); ctx.cue(H3_SAY.burnt, '#8fd160', 2.6); ctx.sound('fire'); }
    if (r.fell !== undefined) { ctx.fell(r.fell); ctx.cue(H3_SAY.felled, '#8fd160', 2.6); } }
  /* THE MAST ROD in his fight (src/main.js updateCaptain): live -> it charges; returns true the frame it strikes. charge 0..1 is read for the tell (B10: glow, crackle, the column) */
  H.bossRod = (dt, live) => { if (!S) return false; const B = S.boss; B.glow = Math.max(0, B.glow - dt); B.bolt = Math.max(0, B.bolt - dt);
    if (!live) { B.charge = Math.max(0, B.charge - dt); return false; }
    B.charge += dt / H3.bossRodT; if (B.charge > 1 - H3.rodTell / H3.bossRodT) { B.tellSnd = (B.tellSnd || 0) - dt; if (B.tellSnd <= 0) { B.tellSnd = 0.3; ctx.sound('crackle'); } }
    if (B.charge >= 1) { B.charge = 0; B.bolt = 0.4; B.glow = 0.8; return true; } return false; };
  H.bossRodState = () => (S ? S.boss : null);
  H.rodTold = k => k > 1 - H3.rodTell / H3.bossRodT;
  H.rodInfo = id => (S ? S.rods.find(r => r.id === id) : null);
  H.heel = () => ctx.heel(); H.gustNow = z => ctx.gustNow(z);   /* (for the walker: her heel now - on, dir, k - and a gust) */

  /* ---------- THE BANNERS ---------- */
  function banner(dt) { const P = hero(); if (!P) return; const secs = lv().h3.sections || [];
    const k = secs.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS && P.y >= s.y0 * TS && P.y < (s.y1 + 1) * TS);
    if (k >= 0 && k !== S.sec) { S.banner = { name: secs[k].name, t: 3 }; S.sec = k; }
    if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; } }

  H.drawSea = (g, p, x0, x1, y, h, cx, cy, time) => art().sea(g, p, x0, x1, y, h, cx, cy, time, !!p.h3flood);
  H.update = dt => { if (!on() || !S) return; sink(dt); floods(dt); rods(dt); banner(dt); S.gauge += (((S.step >= 4 ? 4 : S.step) + (S.rising ? 0.5 : 0)) - S.gauge) * Math.min(1, dt * 2); };

  /* ---------- DRAWING (GREYBOX) ---------- */
  const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  H.drawMover = (g, m, cx, cy, time) => { if (m.kind !== 'cask' || m.gone) return; const x = R(m.x - cx), y = R(m.y - cy); if (x < -20 || x > ctx.VW() + 20) return;
    if (ctx.kit) { art().cask(g, m, x, y, time, Math.abs(m.vx) > H3.caskHurt && Math.floor(time * 10) % 2); return; }
    const roll = Math.abs(m.vx) > 4 ? Math.floor(time * 10 * Math.sign(m.vx)) & 1 : 0;
    rc(g, x + 1, y + 1, 14, 15, '#4a3018'); rc(g, x + 2, y + 2, 12, 13, '#8a5a32'); rc(g, x + 2, y + 2, 12, 2, '#a8743a');
    for (const yy of [4, 11]) rc(g, x + 1, y + yy + roll, 14, 2, '#2a2630');   /* her hoops */
    if (m.lashed) { rc(g, x - 1, y + 6, 18, 1, '#e0cc9c'); rc(g, x - 1, y + 9, 18, 1, '#b59a62'); rc(g, x + 15, y + 6, 3, 4, '#c9b27c'); }   /* the lashing: STRIKE it */
    if (Math.abs(m.vx) > H3.caskHurt && Math.floor(time * 10) % 2) rc(g, x + (m.vx > 0 ? 14 : 0), y - 3, 2, 2, '#ff6b6b'); };
  /* her masts and her sails, behind the bodies (the mainmast and the mizzen are not tiles below their shrouds: drawn) */
  H.drawBack = (g, cx, cy, time) => { if (!on() || !S) return; if (ctx.kit) { art().drawBack(g, cx, cy, time, S); return; } const vw = ctx.VW(), vh = ctx.VH();
    const mast = (x, top, base, w) => { const sx = R(x * TS - cx); if (sx < -20 || sx > vw + 20) return; rc(g, sx - w / 2, R(top * TS - cy), w, (base - top) * TS, '#5a4630'); rc(g, sx - w / 2, R(top * TS - cy), 2, (base - top) * TS, '#8a7454'); for (let y = top + 2; y < base; y += 5) rc(g, sx - w / 2 - 1, R(y * TS - cy), w + 2, 2, '#2a2630'); };
    mast(301, 3, 36, 8);   /* THE MAINMAST, deck to truck */
    const r2 = S.rods.find(r => r.id === 'r2'); mast(467, r2 && r2.done ? 30 : 14, 36, 7);   /* THE MIZZEN (her topmast goes when rod 2 fells it) */
    if (!ctx.felledDown(0)) mast(173, 13, 36, 7);   /* THE FOREMAST until the sky lays her over */
    /* HER STAYS (greybox: the art pass draws them laid and tarred): the mizzen-main stay from her mizzen masthead to the main top, and the lifts every stays platform hangs on */
    const line = (x0, y0, x1, y1, col = '#8a7040') => { const n = Math.max(2, R(Math.hypot(x1 - x0, y1 - y0) / 3)); for (let i = 0; i <= n; i++) { const u = i / n; rc(g, x0 + (x1 - x0) * u - cx, y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * 6 - cy, 1, 1, col); } };
    const sx0 = 467 * TS, sy0 = (r2 && r2.done ? 26 : 14) * TS, sx1 = 302 * TS, sy1 = 24 * TS, stayY = x => sy0 + (sy1 - sy0) * (x - sx0) / (sx1 - sx0);
    if (Math.max(sx0, sx1) > cx - 40 && Math.min(sx0, sx1) < cx + vw + 40) line(sx0, sy0, sx1, sy1, '#b59a62');
    for (const m of (lv().ents || [])) { if (m.t !== 'mast' || !m.h3) continue; const x = m.x * TS + 8; if (x < cx - 80 || x > cx + vw + 80) continue;
      if (m.h3 === 'stay') { const y = (m.y + 1) * TS; for (const dx of [-40, 40]) line(x + dx, stayY(x + dx), x + dx, y, '#e0cc9c'); }
      if (m.h3 === 'davits') { const y = (m.y + 1) * TS; for (const dx of [-56, 56]) { rc(g, x + dx - 2 - cx, y - 20 - cy, 4, 20 + 3 * TS, '#3a3a44'); rc(g, x + dx - (dx > 0 ? 12 : -2) - cx, y - 22 - cy, 14, 3, '#3a3a44'); line(x + dx - (dx > 0 ? 10 : -10), y - 20, x + dx - (dx > 0 ? 10 : -10), y, '#e0cc9c'); } } }
    for (const s of (lv().h3.sails || [])) { const z = (lv().gusts || [])[s.gust]; const G = z ? ctx.gustNow(z) : { on: false, tell: -1, dir: 1 };
      const fill = G.on ? 1 : G.tell >= 0 ? G.tell : 0.08, snap = G.tell >= 0 && Math.floor(time * 12) % 2 ? 2 : 0, x = R(s.x * TS - cx), y0 = R(s.y0 * TS - cy), h = (s.y1 - s.y0) * TS;
      if (x < -60 || x > vw + 60) continue;
      rc(g, x - 1, y0 - 2, 2, h + 4, '#5a4630');   /* its yard / gaff */
      const bulge = R((G.dir || 1) * (4 + 16 * fill) + (G.dir || 1) * snap);
      for (let k = 0; k < h; k += 2) { const u = k / h, bx = R(Math.sin(u * Math.PI) * bulge); rc(g, Math.min(x, x + bx), y0 + k, Math.abs(bx) + 1, 2, k % 6 < 2 ? '#d8d0b8' : '#b8ae98'); }
      if (G.tell >= 0 && Math.floor(time * 8) % 2) ctx.text('SNAP', x + (G.dir || 1) * 14, y0 - 6, '#ffd36b', 'center', 5); }
    /* the slanting rain where a gust blows */
    for (const z of (lv().gusts || [])) { if (z.arena && !ctx.bossActive()) continue; if (z.x1 < cx || z.x0 > cx + vw) continue; const G = ctx.gustNow(z); if (!G.on) continue;
      g.globalAlpha = 0.45; for (let k = 0; k < 30; k++) { const x = z.x0 + ((k * 61 + time * 300) % Math.max(1, z.x1 - z.x0)), y = z.y0 + ((k * 37 + time * 420) % Math.max(1, z.y1 - z.y0)); rc(g, x - cx, y - cy, 1, 1, '#c8d8e8'); rc(g, x - cx + G.dir, y - cy + 1, 1, 1, '#c8d8e8'); rc(g, x - cx + G.dir * 2, y - cy + 2, 1, 1, '#a8b8c8'); } g.globalAlpha = 1; }
    /* the waist's foam line: where the water will stand, while the bell tolls */
    for (const f of S.floods) { const p = (lv().pools || []).find(q => q.h3flood === f.id); if (!p) continue; if (f.ph === 'warn') { g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 12); for (let x = p.x0; x < p.x1; x += 6) rc(g, x - cx, p.hiY - cy - 1, 4, 2, '#eefaff'); g.globalAlpha = 1; } }
  };
  /* the rods: their chains, the charge, the bolt; the tarred net; the gauge in the world (a waterline mark on her mainmast) */
  H.drawOver = (g, cx, cy, time) => { if (!on() || !S) return; if (ctx.kit) { art().drawOver(g, cx, cy, time, S); return; } const vw = ctx.VW();
    for (const r of S.rods) { const tx = r.top[0] * TS + 8, ty = r.top[1] * TS, ex = r.x * TS + 8, ey = (r.y + 1) * TS - 4;
      if (Math.max(tx, ex) < cx - 40 || Math.min(tx, ex) > cx + vw + 40) continue;
      const k = r.boss ? S.boss.charge : r.charge, told = r.boss ? H.rodTold(k) : k > 1 - H3.rodTell / H3.rodCharge, glow = r.boss ? S.boss.glow : r.glow;
      rc(g, tx - 1 - cx, ty - 14 - cy, 2, 14, '#3a3a44'); rc(g, tx - 2 - cx, ty - 16 - cy, 4, 3, told ? '#9ab8ff' : '#6a6a76');   /* the rod */
      if (!r.boss) { const n = Math.max(2, R(Math.hypot(ex - tx, ey - ty) / 4)); for (let i = 0; i <= n; i++) { const u = i / n, x = tx + (ex - tx) * u + Math.sin(u * 9 + time * 2) * (r.connected ? 0 : 2), y = ty + (ey - ty) * u;
          rc(g, x - cx, y - cy, 2, 2, told && (i + Math.floor(time * 20)) % 3 === 0 ? '#dfe8ff' : r.connected ? '#8a8a96' : '#5a5a66'); }
        rc(g, ex - 4 - cx, ey - 2 - cy, 8, 4, r.connected ? '#9ab8ff' : '#3a3a44');   /* the chain's end: STRIKE it onto the iron */
        if (!r.done && !r.connected && Math.abs(ctx.hero().x - ex) < 90) ctx.text('STRIKE THE CHAIN', ex - cx, ey - 30 - cy, '#9ab8ff', 'center', 5); }
      if (k > 0.05 && !r.done) { g.globalAlpha = Math.min(1, k) * (told ? 0.6 + 0.4 * Math.sin(time * 30) : 0.35); rc(g, tx - 4 - cx, ty - 20 - cy, 8, 8, '#9ab8ff'); g.globalAlpha = 1; }
      if (glow > 0) { g.globalAlpha = Math.min(1, glow * 2); rc(g, tx - 6 - cx, ty - 22 - cy, 12, 12, '#ffffff'); g.globalAlpha = 1; } }
    /* the tarred net over the main hatch, until rod 1 burns it */
    const r1 = S.rods.find(r => r.burn); if (r1 && !r1.done) { const [x0, x1, y0, y1] = r1.burn; for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) { const sx = x * TS - cx, sy = y * TS - cy; if (sx < -16 || sx > vw) continue;
        rc(g, sx, sy, TS, TS, '#1a1510'); for (let q = 0; q < TS; q += 4) { rc(g, sx + q, sy, 1, TS, '#4a3a20'); rc(g, sx, sy + q, TS, 1, '#4a3a20'); } } }
  };
  /* THE HUD: the waterline gauge (she is going down: a little hull, the sea climbing it by step) and the area banner */
  H.hud = (g, time) => { if (!on() || !S) return; const vw = ctx.VW(); const x = vw - 62, y = 22, w = 44, h = 22;
    if (ctx.kit) { art().hud(g, S, time, vw); ctx.text('SHE SINKS', x + w / 2, y + h + 7, '#a8cfc6', 'center', 4); if (S.banner) { const k = Math.min(1, S.banner.t / 0.4, (3 - S.banner.t) / 0.3 + 0.2); g.globalAlpha = Math.max(0, Math.min(1, k)); ctx.text(S.banner.name, vw / 2, 34, '#ffd36b', 'center', 8); g.globalAlpha = 1; } return; }
    g.globalAlpha = 0.85; rc(g, x - 2, y - 2, w + 4, h + 4, 'rgba(10,14,20,0.6)'); g.globalAlpha = 1;
    rc(g, x + 4, y + 10, w - 8, 8, '#5a4630'); rc(g, x + 2, y + 10, 4, 4, '#5a4630'); for (const mx of [12, 22, 32]) rc(g, x + mx, y + 1, 1, 9, '#8a7454');   /* her hull and three masts */
    const lvl = Math.min(1, S.gauge / 4.5), wy = R(y + h - 2 - lvl * (h - 4));
    g.globalAlpha = 0.75; rc(g, x, wy, w, y + h - wy, S.groan > 0 && Math.floor(time * 8) % 2 ? '#ff6b6b' : '#2e7a88'); g.globalAlpha = 1; rc(g, x, wy, w, 1, '#eefaff');
    ctx.text('SHE SINKS', x + w / 2, y + h + 7, '#a8cfc6', 'center', 4);
    if (S.banner) { const k = Math.min(1, S.banner.t / 0.4, (3 - S.banner.t) / 0.3 + 0.2); g.globalAlpha = Math.max(0, Math.min(1, k)); ctx.text(S.banner.name, vw / 2, 34, '#ffd36b', 'center', 8); g.globalAlpha = 1; } };
  H.read = () => S && { step: S.step, rising: S.rising, seaY: R(S.seaY), fightPh: S.fightPh, floods: S.floods.map(f => ({ id: f.id, ph: f.ph, k: +f.k.toFixed(2) })), rods: S.rods.map(r => ({ id: r.id, charge: +r.charge.toFixed(2), connected: r.connected, done: r.done, witch: !!r.witch })), boss: { charge: +S.boss.charge.toFixed(2) }, banner: S.banner && S.banner.name };
  return H;
}
