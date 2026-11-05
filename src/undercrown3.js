// src/undercrown3.js - THE UNDERCROWN 3's HANDS (claude/undercrown3, the OPUS greybox; plan-undercrown-1104.md A, Daniel 11-04 12:17 + 15:32).
// The world side of FIREDAMP (src/firedamp.js: the model) and of the FALLEN PILLARS (src/fallen-pillar.js: the rules). main.js makes one of these
// with a context and calls: reset() on every spawn of the level, update(dt) every frame, fireman(e, dt) for a miner marked fireman, the Prince's
// hooks (princeTick / princeMode / princeCross / princeWatch / princeK), drawBand/drawOver, and read() for the lab and the tools.
// GREYBOX: every shape is an alpha rect or a line (the art lane owns the gas band, the doors, the canary cage, the fireman, the scorch).
//
// WHAT IT DOES
//   THE BAND      each chamber's gas, drawn as a pale band under its roof as deep as it is full; flickering bright while a fuse burns.
//   FLAMES        a lit miners' lamp (its flame, 12 px over its foot), a lit lamp STRUCK (it FLARES FD.FLARE px up), the pyromancer's embers, a
//                 fire on the floor, THE FIREMAN's candle on a pole, THE PRINCE's spark (P3) - in a READY band, each lights a TOLD fuse (FD.FUSE).
//   THE BLAST     along the band: a hero whose top is in it takes DMG (a ducked hero, 8 px, is under every band: Daniel's "duck under it"); a foe in
//                 it is burnt and staggered (the fireman's wet sacking: not him); every slab post whose top is in it BREAKS (a blast takes posts
//                 from a distance); a plug in it is blown out; THE PRINCE in it (not his own spark) is SCORCHED: staggered, every blow x2.
//   WIND DOORS    a brattice, struck, swings open or shut (hitCd): an open one levels two chambers. A slab's hole follows its slab (src/firedamp.js).
//   THE CANARY    one caged per chamber: sings slower as the gas rises, stops at READY ('gas rising': one hiss + a once-a-level tip).
//   THE FIREMAN   a navvy in wet sacking with a candle on a pole: in a READY chamber with a hero in it he raises the pole (told: '!!', 1 s) and
//                 lights it; then he walks away from it. He cannot be burnt, and dies to a sword like any navvy.
//   THE PRINCE    his tomb starts to gather from his SECOND phase (the diggers re-prop while it fills); in his THIRD he lights it himself, told
//                 (HE STRIKES A SPARK, '!!', 1 s, then the fuse). Fallen pillars: a told HOP onto a shelf, a told DUCK under a ramp, never
//                 while pinned/scorched/reeling (that is the opening). The watchdog lets him through after FALLEN.STUCK_T s of no progress.
import * as FDM from './firedamp.js';
import { FD } from './firedamp.js';
import * as FP from './fallen-pillar.js';
import { FALLEN } from './fallen-pillar.js';
import * as UA from './redraw/uc3_art.js';   /* (claude/uc3art) the gas, the doors, the cage, the pole, the rubble */

export const UC3K = {
  dmgHero: 22,        // a hero in the burning band (unblockable; a duck is the answer)
  dmgFoe: 60,         // a foe in it (most navvies die; a troll does not)
  foeStagger: 1.2,
  princeDmg: 40,      // the Prince in a blast he did not light
  princeScorch: 1.8,  // s scorched: staggered, x2 (princeK)
  princeK: 2,
  princeLightCd: 9,   // s between his own sparks (P3)
  princeLightTell: 1.0,
  firemanTell: 1.0, firemanCd: 6, firemanRange: 170,
  postBlast: 99,      // a post in the band breaks outright
};
export const UC3_WORDS = ['FIREDAMP', 'IT FLARES', 'SCORCHED', 'OPEN', 'SHUT', 'HE VAULTS IT', 'HE DUCKS UNDER'];

export function makeUndercrown3Hands(ctx) {
  let st = null, cages = [], doors = [], said = {}, flareCd = new WeakMap(), lightCdT = 0, blasts = [], soots = [], artOff = false;   /* (claude/uc3art) blasts: the roll of fire (0.6 s); soots: what a burn left under the roof, for the level */
  const sfx = n => { const f = ctx.sfx && ctx.sfx[n]; if (typeof f === 'function') f(); };
  const on = () => !!(ctx.L && ctx.L.uc3 && ctx.L.firedamp && st);
  function reset() {
    const L = ctx.L; st = null; cages = []; doors = []; said = {}; blasts = []; soots = [];
    if (!L || !L.uc3 || !L.firedamp) return;
    st = FDM.makeFiredamp(L.firedamp);
    for (const e of L.ents || []) {
      if (e.t === 'canarycage') { const c = st.byId.get(e.chamber); if (c) cages.push({ x: e.x * ctx.TS + 8, y: (e.y + 1) * ctx.TS, c, songT: 0.5 }); }
      if (e.t === 'brattice') { const d = st.doors.find(q => q.id === e.door); if (d) doors.push({ x: e.x * ctx.TS + 8, y0: (e.y0 ?? e.y - 3) * ctx.TS, y1: (e.y + 1) * ctx.TS, d, hitCd: 0 }); }
    }
  }
  /* THE TOMB starts again with every attempt: clean air, no source until his second phase */
  function tombReset() { if (!st) return; const c = st.byId.get('tomb'); if (c) { c.fill = 0; c.on = false; c.fuse = 0; c.rest = 0; c.wasReady = false; } lightCdT = 0; }

  /* A FLAME at (x, y), reaching `reach` px up; byPrince: his own spark (he is not burnt by it) */
  function flameAt(x, y, reach = 0, byPrince = false) {
    const c = FDM.lightAt(st, x, y, reach); if (!c) return null;
    c.byPrince = byPrince; c.flameX = x; c.flameY = Math.max(y - reach, c.y0 * ctx.TS + 6);
    ctx.number(x, c.flameY - 6, '!!', '#ff6b6b'); sfx('hiss'); sfx('fuse');
    if (!said.fuse) { said.fuse = 1; ctx.hint('FIREDAMP', 'A FLAME IN THE GAS: IT BURNS ALONG THE ROOF IN A MOMENT. DUCK UNDER THE BAND.'); }
    return c;
  }

  function blast(c, box) {
    const TS = ctx.TS, players = ctx.players();
    blasts.push({ box: { l: box.l, r: box.r, t: box.t, b: box.b }, age: 0 }); soots.push({ l: box.l, w: box.r - box.l, t: c.y0 * TS, d: Math.max(6, box.b - box.t), seed: soots.length + 1 }); if (soots.length > 14) soots.shift();
    sfx('thunder'); sfx('heavy'); ctx.shake(8);
    for (let x = box.l; x < box.r; x += 10) { const y = box.t + Math.random() * Math.max(4, box.b - box.t); ctx.parts.push({ x, y, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 30, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#ffd36b' : '#ff9a5c', size: 3, grav: -20, fire: true }); }
    ctx.number((box.l + box.r) / 2, box.t + 10, 'FIREDAMP', '#ff9a5c');
    /* the heroes: a top in the band takes it; ducked (8 px) or sliding, you are under it */
    for (const p of players) { if (!p || p.dead) continue; const h = (p.ducking || p.lowSlide) ? ctx.DUCK_H : (p.h || 14);
      if (FDM.inBlast(box, { x: p.x, y: p.y, w: p.w, h })) ctx.asPlayer(p, () => ctx.damagePlayer(c.flameX ?? p.x, UC3K.dmgHero, { unblockable: true, up: true, name: 'THE FIREDAMP' })); }
    /* the foes */
    for (const e of ctx.enemies()) { if (!e.alive || e.harmless || e.fireman) continue;
      if (!FDM.inBlast(box, e)) continue;
      if (e.t === 'prince') { if (!c.byPrince) scorch(e); continue; }
      if (e.maxHp) { ctx.hurtEnemy(e, Math.round(UC3K.dmgFoe * 0.4), e.x + 1); continue; }   /* (another boss: a chip) */
      ctx.hurtEnemy(e, UC3K.dmgFoe, e.x + 1); if (e.alive) e.stagger = Math.max(e.stagger || 0, UC3K.foeStagger); }
    /* the posts: a post whose top is in the band breaks (the slab does what a cut does) */
    for (const pr of ctx.props()) { if (pr.t !== 'timber' || pr.broken || !pr.slab) continue;
      const top = (pr.slab.row + 1) * TS; if (FDM.pointInBlast(box, pr.x, top + 1)) { pr.hp = 0; ctx.cutPost(pr); } }
    /* the plugs */
    for (const pl of st.plugs) { if (pl.blown || pl.chamber !== c.id) continue; pl.blown = true; for (const [x, y] of pl.cells) ctx.cellSet(x, y, 0); ctx.resolveTiles(); }
  }
  function scorch(e) {
    if (e.mode === 'sunk' || e.mode === 'sleep' || e.mode === 'wake' || !e.alive) return;
    e.hp -= UC3K.princeDmg; if (e.hp <= 0) { e.hp = 1; ctx.hurtEnemy(e, 1, e.x + 1); return; }
    e.mode = 'scorched'; e.modeT = UC3K.princeScorch; e.vx = 0; e.fpGhost = false; e.n = e.n || {}; e.n.scorched = (e.n.scorched || 0) + 1;
    ctx.number(e.x, e.y - e.h - 18, 'SCORCHED', '#ffd36b'); sfx('bossHurt');
    if (!said.scorch) { said.scorch = 1; ctx.hint('tombScorch', 'THE GAS TOOK HIM: WHILE HE IS SCORCHED, EVERY BLOW LANDS TWICE.'); }
  }

  function update(dt) {
    if (!on()) return;
    const TS = ctx.TS;
    /* the slabs' holes and dams */
    for (const rt of ctx.slabs()) FDM.slabDoors(st, rt.id, rt.state);
    /* the wind doors: struck open or shut */
    const hb = ctx.attackBox();
    for (const w of doors) { w.hitCd = Math.max(0, w.hitCd - dt);
      if (hb && w.hitCd <= 0 && hb.r > w.x - 6 && hb.l < w.x + 6 && hb.b > w.y0 && hb.t < w.y1) { w.hitCd = 0.45; w.d.open = !w.d.open; sfx('clank'); ctx.number(w.x, w.y0 - 6, w.d.open ? 'OPEN' : 'SHUT', '#c9b27c');
        if (!said.door) { said.door = 1; ctx.hint('FIREDAMP', 'AN OPEN WIND DOOR LETS THE GAS THROUGH. SHUT, IT HOLDS IT.'); } } }
    /* the flames */
    for (const pr of ctx.props()) { if (pr.t !== 'minerlamp' || !pr.lit) continue;
      flameAt(pr.x, pr.y - 12);
      /* A LIT LAMP STRUCK FLARES: its flame jumps up into a band over it */
      const cd = flareCd.get(pr) || 0; if (cd > 0) { flareCd.set(pr, cd - dt); continue; }
      if (hb && hb.r > pr.x - 6 && hb.l < pr.x + 6 && hb.b > pr.y - 16 && hb.t < pr.y + 2) { flareCd.set(pr, 0.5);
        for (let k = 0; k < 8; k++) ctx.parts.push({ x: pr.x + (Math.random() - 0.5) * 4, y: pr.y - 12, vx: (Math.random() - 0.5) * 20, vy: -FD.FLARE * 2.4 * (0.6 + Math.random() * 0.5), life: 0.4, max: 0.4, col: '#ffd36b', size: 2, grav: 0, fire: true });
        ctx.number(pr.x, pr.y - 26, 'IT FLARES', '#ffd36b'); sfx('spark'); flameAt(pr.x, pr.y - 12, FD.FLARE); } }
    for (const b of ctx.embers()) flameAt(b.x, b.y);
    for (const f of ctx.fires()) if (!(f.delay > 0)) flameAt(f.x, f.y - 6);
    /* the gas */
    for (const ev of FDM.step(st, dt)) {
      if (ev.t === 'blast') blast(ev.c, ev.box);
      else if (ev.t === 'ready') { const near = cages.some(k => k.c === ev.c && Math.hypot(k.x - ctx.hero().x, k.y - ctx.hero().y) < 260);
        if (near) { sfx('hiss'); if (!said.ready) { said.ready = 1; ctx.hint('FIREDAMP', 'THE CANARY HAS STOPPED: THE GAS WILL TAKE A FLAME NOW.'); } } }
    }
    /* the fuses fizz along the roof */
    for (const c of st.chambers) if (c.fuse > 0 && Math.random() < dt * 40) { const x = (c.x0 + Math.random() * (c.x1 - c.x0 + 1)) * TS; ctx.parts.push({ x, y: FDM.bandBottom(c) - 2, vx: 0, vy: -10, life: 0.3, max: 0.3, col: '#dfffa0', size: 1, grav: 0 }); }
    /* the canaries */
    const P = ctx.hero();
    for (const k of cages) { const s = FDM.canary(k.c); if (s.silent) continue; k.songT -= dt;
      if (k.songT <= 0) { k.songT = s.gap; k.sing = 0.6; if (Math.hypot(k.x - P.x, k.y - P.y) < 220) { sfx('bird'); ctx.number(k.x + (Math.random() - 0.5) * 6, k.y - 20, '~', '#ffe6a0'); } } }
    lightCdT = Math.max(0, lightCdT - dt);
    for (const b of blasts) b.age += dt; blasts = blasts.filter(b => b.age < 0.7); for (const k of cages) k.sing = Math.max(0, (k.sing || 0) - dt);
  }

  /* THE FIREMAN (a miner with e.fireman): true = this frame was his */
  function fireman(e, dt) {
    if (!on() || !e.alive) return false;
    const c = FDM.chamberAt(st, e.x, e.y - 4); e.fmCd = Math.max(0, (e.fmCd || 0) - dt);
    if (e.mode === 'fireTell') { e.vx = 0; e.modeT -= dt; e.poleY = e.y - 34;
      if (Math.random() < dt * 30) ctx.parts.push({ x: e.x + e.face * 6, y: e.poleY, vx: 0, vy: -12, life: 0.3, max: 0.3, col: '#ffd36b', size: 2, grav: -20, fire: true });
      if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0; e.fmCd = UC3K.firemanCd; const lit = flameAt(e.x + e.face * 6, e.poleY, 0); if (!lit) ctx.number(e.x, e.y - 30, '?', '#9aa39a'); e.face = -e.face; }
      return true; }
    if (!c || !FDM.ready(c) || c.fuse > 0 || e.fmCd > 0 || e.stagger > 0) return false;
    const P = ctx.hero(); if (P.dead) return false;
    if (FDM.chamberAt(st, P.x, P.y - 4) !== c || Math.abs(P.x - e.x) > UC3K.firemanRange) return false;
    e.mode = 'fireTell'; e.modeT = UC3K.firemanTell; e.vx = 0; ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); ctx.number(e.x, e.y - e.h - 24, 'HE RAISES THE POLE', '#ff9a5c'); sfx('spark');
    return true;
  }

  /* ---- THE PRINCE ---- */
  function princeTick(e, dt) {
    if (!on()) return; const c = st.byId.get('tomb'); if (!c) return;
    if (e.phase >= 2 && !c.on) { c.on = true; if (!said.tomb) { said.tomb = 1; ctx.number(e.x, e.y - e.h - 30, 'THE TOMB BREATHES', '#a6e04a'); sfx('hiss'); } }
    /* P3: HE STRIKES A SPARK himself, told, when his tomb is ready */
    if (e.phase >= 3 && e.mode === 'stalk' && e.modeT <= 0 && FDM.ready(c) && !(c.fuse > 0) && lightCdT <= 0) {
      e.mode = 'lightTell'; e.modeT = UC3K.princeLightTell; lightCdT = UC3K.princeLightCd;
      ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); ctx.number(e.x, e.y - e.h - 24, 'HE STRIKES A SPARK', '#ff6b6b'); sfx('spark'); }
  }
  /* the modes this file owns: returns the walk he wants this frame (or null: not his) */
  function princeMode(e, dt) {
    const m = e.mode;
    if (m === 'lightTell') { if (Math.random() < dt * 20) ctx.parts.push({ x: e.x + e.face * 10, y: e.y - 6, vx: (Math.random() - 0.5) * 60, vy: -60, life: 0.3, max: 0.3, col: '#fff6c8', size: 1, grav: 200 });
      if (e.modeT <= 0) { const c = st && st.byId.get('tomb'); if (c) { c.fill = Math.max(c.fill, FD.READY); flameAt((c.x0 + c.x1 + 1) * ctx.TS / 2, c.y0 * ctx.TS + 4, 0, true); } e.mode = 'stalk'; e.modeT = 0.4; }
      return 0; }
    if (m === 'scorched') { e.vx = 0; if (Math.random() < dt * 10) ctx.parts.push({ x: e.x + (Math.random() - 0.5) * 16, y: e.y - e.h + Math.random() * 20, vx: 0, vy: -20, life: 0.6, max: 0.6, col: '#5a5460', size: 2, grav: -10 });
      if (e.modeT <= 0) { e.mode = 'stalk'; e.modeT = 0.5; } return 0; }
    if (m === 'hopTell') { e.vx = 0; if (e.modeT <= 0) { e.mode = 'hop'; e.modeT = 1.4; e.vy = FALLEN.HOP_VY; e.hopUp = false; sfx('heavy'); } return 0; }
    if (m === 'hop') { if (e.vy < 0) e.hopUp = true; if ((e.hopUp && e.vy >= 0 && e.onGround) || e.modeT <= 0) { e.mode = 'stalk'; e.modeT = 0.3; } return e.crossDir * FALLEN.HOP_VX; }
    if (m === 'duckTell') { e.vx = 0; if (e.modeT <= 0) { e.mode = 'duck'; e.modeT = 4; e.fpGhost = true; sfx('stone'); } return 0; }
    if (m === 'duck') { const p = e.crossP, past = !p || (e.crossDir > 0 ? e.x - e.w / 2 > p.r + 2 : e.x + e.w / 2 < p.l - 2);
      if (past || e.modeT <= 0) { e.mode = 'stalk'; e.modeT = 0.3; e.fpGhost = false; } return e.crossDir * FALLEN.DUCK_VX; }
    return null;
  }
  /* a pillar in his way as he walks: start the told cross. want: the walk he wants (px/s) */
  function princeCross(e, want) {
    if (!ctx.L || !ctx.L.uc3 || !want || e.mode !== 'stalk') return false;
    const spans = FP.pillarSpans(ctx.slabs().filter(s => s.tomb));
    const x = FP.princeCross(e, spans, Math.sign(want), ctx.tileAt || null); if (!x) return false;
    e.crossDir = x.dir; e.crossP = x.pillar; e.n = e.n || {};
    if (x.how === 'hop') { e.mode = 'hopTell'; e.modeT = FALLEN.HOP_TELL; e.n.hop = (e.n.hop || 0) + 1; ctx.number(e.x, e.y - e.h - 12, 'HE VAULTS IT', '#c9b27c'); }
    else { e.mode = 'duckTell'; e.modeT = FALLEN.DUCK_TELL; e.n.duck = (e.n.duck || 0) + 1; ctx.number(e.x, e.y - e.h - 12, 'HE DUCKS UNDER', '#c9b27c'); }
    sfx('stone'); return true;
  }
  /* the watchdog: no dead time - stuck past FALLEN.STUCK_T s (wanting to move, not held), he ghosts through for GHOST_T s */
  function princeWatch(e, dt, want) {
    if (!ctx.L || !ctx.L.uc3) return; e.fpW = e.fpW || {};
    if (e.fpGhostT > 0) { e.fpGhostT -= dt; if (e.fpGhostT <= 0 && e.mode !== 'duck') e.fpGhost = false; return; }
    if (FP.stuckStep(e.fpW, e, dt, !!want && e.mode === 'stalk', FP.princeStays(e))) { e.fpW.t = 0; e.fpGhost = true; e.fpGhostT = FALLEN.GHOST_T; e.n = e.n || {}; e.n.stuck = (e.n.stuck || 0) + 1; }
  }
  const princeK = e => (e.mode === 'scorched' ? UC3K.princeK : 1);

  /* ---- DRAWN (greybox) ---- */
  function drawBand(g, cx, cy, VW, VH, time) {
    if (!on()) return;
    if (!artOff) { try { return artBand(g, cx, cy, VW, VH, time); } catch (err) { artOff = true; console.warn('uc3 art off (greybox):', err && err.message); } }
    greyBand(g, cx, cy, VW, VH, time);
  }
  function artBand(g, cx, cy, VW, VH, time) {
    const TS = ctx.TS;
    for (const sc of soots) { const l = sc.l - cx; if (l + sc.w < 0 || l > VW) continue; UA.drawSoot(g, l, sc.w, sc.t - cy, sc.d, sc.seed); }
    for (const c of st.chambers) {
      const l = c.x0 * TS - cx, r = (c.x1 + 1) * TS - cx, t = c.y0 * TS - cy, d = FDM.bandPx(c);
      if (r < 0 || l > VW || t > VH || t + FDM.roomPx(c) < 0 || d < 1) continue;
      UA.drawGas(g, l, t, r - l, d, time, { hot: c.fuse > 0, rdy: FDM.ready(c), fill: c.fill });
    }
    for (const b of blasts) UA.drawBlast(g, { l: b.box.l - cx, r: b.box.r - cx, t: b.box.t - cy, b: b.box.b - cy }, b.age);
    for (const w of doors) { const x = w.x - cx; if (x < -12 || x > VW + 12) continue; UA.drawBrattice(g, x, w.y0 - cy, w.y1 - cy, !!w.d.open, time, w.hitCd > 0 ? w.hitCd / 0.45 : 0); }
    for (const k of cages) { const x = k.x - cx; if (x < -12 || x > VW + 12) continue; UA.drawCage(g, x, k.y - cy, time, !!FDM.canary(k.c).silent, (k.sing || 0) / 0.6, k.c.fill); }
  }
  function greyBand(g, cx, cy, VW, VH, time) {
    const TS = ctx.TS;
    for (const c of st.chambers) {
      const l = c.x0 * TS - cx, r = (c.x1 + 1) * TS - cx, t = c.y0 * TS - cy, d = FDM.bandPx(c);
      if (r < 0 || l > VW || t > VH || t + FDM.roomPx(c) < 0 || d < 1) continue;
      const hot = c.fuse > 0, rdy = FDM.ready(c);
      g.globalAlpha = hot ? 0.38 + 0.2 * Math.sin(time * 40) : rdy ? 0.3 : 0.18 + 0.1 * c.fill;
      g.fillStyle = hot ? '#dfffa0' : '#9ab89a'; g.fillRect(Math.round(l), Math.round(t), Math.round(r - l), Math.round(d));
      g.globalAlpha = rdy ? 0.7 : 0.4; g.fillStyle = hot ? '#fff6c8' : '#c8e0c0';   /* the band's lower edge, rippling: what you read */
      for (let x = Math.max(0, Math.round(l)); x < Math.min(VW, Math.round(r)); x += 4) g.fillRect(x, Math.round(t + d + Math.sin(time * 2 + x * 0.15) * 1.2), 3, 1);
    }
    g.globalAlpha = 1;
    for (const w of doors) { const x = Math.round(w.x - cx), y0 = Math.round(w.y0 - cy), y1 = Math.round(w.y1 - cy); if (x < -10 || x > VW + 10) continue;
      g.fillStyle = '#6a5a44'; if (w.d.open) { g.fillRect(x - 6, y0, 2, y1 - y0); } else { g.fillRect(x - 3, y0, 6, y1 - y0); g.fillStyle = '#4a3e30'; for (let y = y0 + 3; y < y1; y += 6) g.fillRect(x - 3, y, 6, 1); } }
    for (const k of cages) { const x = Math.round(k.x - cx), y = Math.round(k.y - cy); if (x < -10 || x > VW + 10) continue;
      g.fillStyle = '#8a7a5a'; g.fillRect(x - 4, y - 18, 8, 1); g.fillRect(x - 4, y - 18, 1, 8); g.fillRect(x + 3, y - 18, 1, 8); g.fillRect(x - 4, y - 11, 8, 1); g.fillRect(x, y - 10, 1, 10);
      const s = FDM.canary(k.c); g.fillStyle = '#ffd34a'; g.fillRect(x - 1, s.silent ? y - 13 : y - 16, 3, 2); }
  }
  function drawFireman(g, e, cx, cy, time) {
    if (!e.fireman || !e.alive) return;
    if (!artOff) { try { const top0 = e.mode === 'fireTell' ? Math.round(e.y - 34 - cy) : Math.round(e.y - 24 - cy); return UA.drawPole(g, e.x + e.face * 6 - cx, e.y - 8 - cy, top0, e.face, time, e.mode === 'fireTell'); } catch (err) { artOff = true; } } const x = Math.round(e.x + e.face * 6 - cx), yb = Math.round(e.y - 8 - cy), top = e.mode === 'fireTell' ? Math.round(e.y - 34 - cy) : Math.round(e.y - 24 - cy);
    g.fillStyle = '#5a4a36'; g.fillRect(x, top, 1, yb - top); g.fillStyle = (Math.floor(time * 12) % 2) ? '#ffd36b' : '#fff6c8'; g.fillRect(x - 1, top - 3, 3, 3);
  }
  const read = () => (on() ? { chambers: FDM.read(st), doors: st.doors.map(d => ({ id: d.id, open: d.open })), fuse: st.chambers.some(c => c.fuse > 0) } : null);
  /* for the lab: the chamber a point is in, with its band */
  const chamber = (x, y) => { if (!on()) return null; const c = FDM.chamberAt(st, x, y); return c ? { id: c.id, fill: c.fill, ready: FDM.ready(c), fuse: c.fuse, band: FDM.bandBottom(c), y0: c.y0 * ctx.TS } : null; };
  /* (claude/uc3art) the rubble chocks / heaps under a fallen slab: main.js calls it after the slabs, before the creatures */
  function drawRubble(g, slabs, cx, cy, TS, time) { if (!on() || artOff) return; try { for (const rt of slabs) UA.drawFallenRubble(g, rt, cx, cy, TS, time); } catch (err) { artOff = true; } }
  return { on, reset, drawRubble, tombReset, update, fireman, princeTick, princeMode, princeCross, princeWatch, princeK, drawBand, drawFireman, read, chamber, state: () => st };
}
