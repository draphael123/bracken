// src/well-town-hands.js - THE WELL TOWN's HANDS (claude/welltown, the greybox). src/well-town.js builds the level; this binds its rule to the game:
// THE SKIN (fill at a well, pour on mud and fire and the burning king, drink for the sun), THE MUD WALLS and THE FIRES (barricades: solid until
// poured), THE GREAT WELL's WINDLASS (the bucket moves only when a windlass is struck), THE DRY CISTERN and its vault, and THE WATER-THIEF
// (the cutthroat's AI, src/desert-foes.js, with a cut that takes a sip and a run for a well). main.js calls: reset, update, interact, bucket,
// thiefStep, stole, drawWorld, drawHud, read. Every teaching line goes through ctx.number with a line listed in src/hint-lines.js (the hint box).
import { cutthroatStep } from './desert-foes.js';
import * as WTP from './redraw/welltown_props.js';
import { drawSeal } from './redraw/djinn_art.js';   /* (claude/djinn2) THE BINDING WORKS' seals */
export const WORKS = { tremorTop: 10, tremorBottom: 3.5, shakeTop: 1, shakeBottom: 3 };   /* THE BINDING WORKS: s between tremors at the top of the works and at the bottom, and how hard */

export const SKINMAX = 3, WELL_R = 24, POUR_R = 48, DRINK_AT = 0.2;
export const BUCKET = { down: 80, up: 64 };                      /* px/s: the brake off, it runs down; wound, it comes up slower */
export const THIEF = { hp: 26, run: 96, runT: 3.5, dmg: 6 };     /* THE WATER-THIEF: lighter than the cutthroat, and quicker away */
export const FIRE = { tick: 0.7, dmg: 3, reach: 6 };             /* a barricade's heat, a tick at its face */
export const DEEP = { wind: 2.0 };                               /* THE DEEP WELL (the exam's): a blow on its windlass winds its bucket up in this long, and a fill sends it down again */
export const FOLLOW = { after: 1.6 };                            /* THE GREAT WELL's ride is contested: this long after the bucket goes, the well head's men are down the shaft after you */
/* THE STEAM WORKS' VENTS (claude/djinn3): a vent on its rhythm GLOWS (told) for glow s, then JETS for jet s, then rests; a jet costs dmg (steam: steamDmg)
   a tick and throws you back. A POUR caps a dry vent for cap s (a vent under water cannot be capped: time it). THE BELLOWS VENT (always) never stops:
   lit, its fire is a wall - capped, the way through; it does not relight on top of anyone */
export const VENT = { glow: 0.8, jet: 1.1, cap: 5.0, dmg: 10, steamDmg: 8, tick: 0.5, knock: 150 };

export function makeWellTownHands(ctx) {
  let WT = null;
  const H = {};
  const cellsOf = m => { const out = []; for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) out.push([x, y]); return out; };
  const skinOf = pp => (pp.skin || (pp.skin = { sips: 0, max: SKINMAX }));
  const maxOf = pp => SKINMAX;   /* (no relic grows the skin: Daniel 10-02, relics are leaving the game - the vault pays silver and coins) */

  /* ---------- RESET: a fresh load is a fresh town; a respawn keeps what was poured (the walls stay open, the cistern stays full) ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !(L.welltown || L.skinRule)) { WT = null; return; }   /* (claude/underwell: THE UNDERWELL carries the skin too - L.skinRule) */
    if (!WT || WT.L !== L) {
      const TS = ctx.TS, ents = L.ents;
      WT = { L, said: {}, n: { fills: 0, pours: 0, drinks: 0, walls: 0, fires: 0, stolen: 0, back: 0, rides: 0 },
        wells: ents.filter(e => e.t === 'skinwell').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS, arena: !!e.arena, deep: !!e.deep, up: false, wind: 0, jar: e.jar ? (e.sips || 1) : 0, left: e.jar ? (e.sips || 1) : 0, drip: !!e.drip })),
        walls: (L.mudWalls || []).map(m => ({ ...m, open: false })),
        fires: [], cistern: null, vault: (L.vaultDoors || []).map(m => ({ ...m, open: false })), windlasses: [], carriers: new Set(), vt: 0,
        vents: ents.filter(e => e.t === 'flamevent').map(e => ({ x0: e.x, x1: e.x + (e.w || 1) - 1, y0: e.y - (e.h || 5) + 1, y1: e.y, period: e.period || 3.6, phase: e.phase || 0, always: !!e.always, steam: !!e.steam, capT: 0, st: 'rest', cd: 0, lit: false })) };
      /* A FIRE IS A BARRICADE: a burning column across the way, solid until it is poured out */
      for (const e of ents.filter(q => q.t === 'oilfire')) { let y0 = e.y; while (y0 > 0 && ctx.cellGet(e.x, y0 - 1) === ctx.T.AIR) y0--;
        const f = { x0: e.x, x1: e.x, y0, y1: e.y, lit: true, cd: 0, kind: e.barricade ? 'barricade' : e.gateway ? 'gateway' : 'stall' }; WT.fires.push(f);
        for (const [x, y] of cellsOf(f)) ctx.cellBuild(x, y, ctx.T.SOLID); }
      const c = ents.find(e => e.t === 'cistern'); if (c) WT.cistern = { x: c.x * TS + 8, y: (c.y + 1) * TS, full: false };
      WT.windlasses = ents.filter(e => e.t === 'windlass').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS, top: !!e.top, bucket: e.bucket, deep: !!e.deep, cd: 0 }));
      for (const pp of ctx.players) { skinOf(pp); pp.skin.max = maxOf(pp); }
    } else {
      /* A RESPAWN (Daniel, 10-02): the checkpoint refills the skin - a death on the roof with an empty skin is not a walk back down the tower */
      for (const pp of ctx.players) { const sk = skinOf(pp); sk.max = maxOf(pp); sk.sips = sk.max; }
    }
    /* (claude/djinn3) every vent uncapped again; THE BELLOWS lit (its fire a wall) */
    for (const v of WT.vents) { v.capT = 0; v.cd = 0; if (v.always) ventWall(v, true); }
    for (const pp of ctx.players) { skinOf(pp); pp.skin.max = maxOf(pp); }
    /* the foes are made again on a respawn: the deep well's bucket is down again, and the well head's men may follow you again */
    for (const w of WT.wells) { if (w.deep) { w.up = false; w.wind = 0; } if (w.jar) w.left = w.jar; }
    WT.followT = 0; WT.followed = false;
    const m = ctx.movers().find(q => q.windlass); if (m) { m.locked = true; if (WT.bucketY !== undefined) m.y = WT.bucketY; m.dir = 0; }
    if (window.BK) Object.assign(window.BK, { welltown: () => WT, welltownHands: () => H });
    /* THE PHONE'S ACTION BUTTON (the claude/mobile lane's touch module reads BK.touchVerbs): what E would do here, as one word and the press that does it */
    if (window.BK && window.BK.touchVerbs && !window.BK.touchVerbs.includes(H.welltownVerb)) window.BK.touchVerbs.push(H.welltownVerb);
  };
  /* THE BELLOWS' WALL (claude/djinn3): lit, its cells are built solid (a fire you cannot walk through); capped, open */
  const ventWall = (v, lit) => { v.lit = lit; for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) ctx.cellBuild(x, y, lit ? ctx.T.SOLID : ctx.T.AIR); };
  const ventBox = v => ({ l: v.x0 * 16 + 2, r: (v.x1 + 1) * 16 - 2, t: v.y0 * 16, b: (v.y1 + 1) * 16 });
  /* where a vent is in its rhythm: 'rest' | 'glow' | 'jet' (a capped one is 'capped') */
  const ventState = v => { if (v.capT > 0) return 'capped'; if (v.always) return 'jet'; const p = ((WT.vt + v.phase) % v.period + v.period) % v.period;
    return p >= v.period - VENT.jet ? 'jet' : p >= v.period - VENT.jet - VENT.glow ? 'glow' : 'rest'; };
  H.ventState = ventState; H.cell = (x, y) => ctx.cellGet(x, y);   /* (the harness reads a vent's cells) */
  H.on = () => !!WT;
  H.state = () => WT;

  /* ---------- INTERACT (E): fill at a well, fill the dry cistern, pour on what is in front, or drink ---------- */
  const nearWell = (x, y) => WT.wells.find(w => Math.abs(w.x - x) <= WELL_R && Math.abs(w.y - y) <= 20);
  /* WHAT A POUR WOULD LAND ON, in front of you: a mud wall, a fire, or a boss that takes water (ctx.pourables(): each { aim(P) -> {x, y} | null,
     pour(P) -> truthy }). Its near face between your body and POUR_R ahead (a step or two short of it still reaches), and at your height */
  const pourTarget = P => {
    const face = P.face || 1;
    const hits = m => { const gap = face > 0 ? m.x0 * 16 - P.x : P.x - (m.x1 + 1) * 16; return gap >= -10 && gap <= POUR_R && P.y > m.y0 * 16 && P.y - 14 <= (m.y1 + 1) * 16; };
    const at = (kind, m) => ({ kind, m, x: face > 0 ? m.x0 * 16 + 3 : (m.x1 + 1) * 16 - 3, y: Math.max(m.y0 * 16 + 6, Math.min((m.y1 + 1) * 16 - 6, P.y - 12)) });
    const wall = WT.walls.find(m => !m.open && hits(m)); if (wall) return at('wall', wall);
    const f = WT.fires.find(m => m.lit && hits(m)); if (f) return at('fire', f);
    const v = WT.vents.find(q => !q.steam && q.capT <= 0 && hits(q)); if (v) return at('vent', v);   /* (claude/djinn3) A DRY VENT: a pour caps it */
    for (const b of (ctx.pourables ? ctx.pourables() : [])) { const p = b && b.aim && b.aim(P); if (p) return { kind: 'boss', b, x: p.x, y: p.y }; }
    return null;
  };
  H.interact = pp => {
    if (!WT) return false; const P = pp, sk = skinOf(P); sk.max = maxOf(P);
    const w = nearWell(P.x, P.y);
    /* a DEEP well gives nothing until its bucket is wound up (its windlass); a fill sends the bucket down again */
    if (w && w.deep && !w.up && sk.sips < sk.max) { ctx.number(P.x, P.y - 30, 'THE BUCKET IS DOWN: STRIKE THE WINDLASS', '#ffd36b'); ctx.sfx.buzz && ctx.sfx.buzz(); return true; }
    /* a FULL skin at a well falls through to the pour (or the drink): beside a spring in her hall, E at the Queen must pour, not be swallowed */
    /* A WATER JAR: what is in it (a sip), once a life - not a well */
    if (w && w.jar) { if (w.left > 0 && sk.sips < sk.max) { const n = Math.min(w.left, sk.max - sk.sips); w.left -= n; sk.sips += n; WT.n.jars = (WT.n.jars || 0) + 1; ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(w.x, w.y - 12, 5, ['#7ab8e8', '#e8f4f8'], 40, 0.4); if (w.drip) ctx.number(P.x, P.y - 30, 'A DRIP: ONE SIP', '#7ab8e8'); else ctx.number(P.x, P.y - 30, 'A JAR: ONE SIP', '#7ab8e8'); return true; } }
    else if (w && sk.sips < sk.max) { if (w.deep) w.up = false; sk.sips = sk.max; WT.n.fills++; ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(w.x, w.y - 12, 8, ['#7ab8e8', '#e8f4f8'], 50, 0.5);
      if (!WT.said.full) { WT.said.full = 1; ctx.number(P.x, P.y - 30, 'YOUR SKIN IS FULL: E POURS, E DRINKS', '#7ab8e8'); } return true; }
    const c = WT.cistern;
    if (c && !c.full && Math.abs(c.x - P.x) <= WELL_R && Math.abs(c.y - P.y) <= 20) {
      if (ctx.questGot() >= ctx.questN()) { c.full = true; for (const v of WT.vault) { v.open = true; for (const [x, y] of cellsOf(v)) ctx.cellOpen(x, y); }
        ctx.sfx.splash && ctx.sfx.splash(); ctx.shake(3); ctx.burst(c.x, c.y - 10, 18, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], 70, 0.8); ctx.number(c.x, c.y - 34, 'THE CISTERN FILLS: THE VAULT OPENS', '#8fd160'); }
      else ctx.number(c.x, c.y - 34, 'THE DRY CISTERN WANTS FOUR WATER-SKINS', '#ffd36b');
      return true; }
    if (sk.sips <= 0) { ctx.number(P.x, P.y - 30, 'YOUR SKIN IS EMPTY: FILL IT AT A WELL', '#ff9a5c'); ctx.sfx.buzz && ctx.sfx.buzz(); return true; }
    /* POUR: in front of you, the nearest thing water changes */
    const face = P.face || 1, t = pourTarget(P);
    const wall = t && t.kind === 'wall' ? t.m : null;
    if (wall) { sk.sips--; WT.n.pours++; WT.n.walls++; wall.open = true; for (const [x, y] of cellsOf(wall)) ctx.cellOpen(x, y);
      ctx.sfx.splash && ctx.sfx.splash(); ctx.dust(wall.x0 * 16 + 8, (wall.y1 + 1) * 16, 10); ctx.burst(wall.x0 * 16 + 8, wall.y0 * 16 + 20, 12, ['#7a5a3a', '#4e3622', '#7ab8e8'], 60, 0.6);
      ctx.number(P.x, P.y - 30, 'THE MUD GIVES WAY', '#8fd160'); return true; }
    const f = t && t.kind === 'fire' ? t.m : null;
    if (f) { sk.sips--; WT.n.pours++; WT.n.fires++; f.lit = false; for (const [x, y] of cellsOf(f)) ctx.cellOpen(x, y);
      ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(f.x0 * 16 + 8, f.y0 * 16 + 10, 16, ['#e8f4f8', '#9aa39a', '#7ab8e8'], 50, 0.9);
      ctx.number(P.x, P.y - 30, 'THE FIRE IS OUT - GO', '#8fd160'); return true; }
    const vt = t && t.kind === 'vent' ? t.m : null;
    if (vt) { sk.sips--; WT.n.pours++; WT.n.caps = (WT.n.caps || 0) + 1; vt.capT = VENT.cap; if (vt.always) ventWall(vt, false);
      ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.splash && ctx.sfx.splash(); ctx.burst((vt.x0 + vt.x1 + 1) * 8, (vt.y1 + 1) * 16 - 6, 16, ['#e8f4f8', '#9aa39a', '#7ab8e8'], 50, 0.9);
      if (vt.always) ctx.number(P.x, P.y - 30, 'THE BELLOWS IS CAPPED: GO, BEFORE IT BLOWS', '#8fd160'); else ctx.number(P.x, P.y - 30, 'CAPPED: THE VENT HISSES, AND HOLDS', '#8fd160'); return true; }
    const k = t && t.kind === 'boss' ? t.b.pour(P) : (ctx.king && ctx.king.pour(P));
    if (k) { sk.sips--; WT.n.pours++; ctx.burst(P.x + face * 24, P.y - 16, 10, ['#7ab8e8', '#e8f4f8'], 60, 0.5); return true; }
    /* nothing to pour on: DRINK, when the sun is on you (a sip spent on nothing is not taken) */
    if (P.sun && P.sun.v > DRINK_AT) { sk.sips--; WT.n.drinks++; P.sun.v = 0; P.sun.tick = 0.7; P.sun.n = 0; ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(P.x, P.y - 18, 6, ['#7ab8e8', '#e8f4f8'], 30, 0.4); ctx.number(P.x, P.y - 30, 'THE SUN LETS GO OF YOU', '#7ab8e8'); return true; }
    if (w && !w.jar) { ctx.sfx.ui && ctx.sfx.ui(); return true; }   /* a full skin at a well, nothing to pour on and no sun: the well has nothing more to give */
    return false;
  };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!WT) return;
    const hb = ctx.attackBox();
    /* THE WINDLASSES: a blow on one sends the bucket the other way (with whoever stands on it) */
    for (const w of WT.windlasses) { w.cd = Math.max(0, w.cd - dt);
      if (hb && w.cd <= 0 && w.deep && ctx.overlap(hb, { l: w.x - 16, r: w.x + 16, t: w.y - 28, b: w.y })) { const dw = WT.wells.filter(q => q.deep).sort((a, b) => Math.abs(a.x - w.x) - Math.abs(b.x - w.x))[0];
        w.cd = 0.8; if (!dw || dw.up || dw.wind > 0) continue; dw.wind = DEEP.wind; WT.n.winds = (WT.n.winds || 0) + 1; ctx.sfx.clank && ctx.sfx.clank(); ctx.sfx.ropeHaul && ctx.sfx.ropeHaul(); ctx.sparks(w.x, w.y - 14, ctx.hero().face || 1, 4);
        ctx.number(w.x, w.y - 34, 'THE BUCKET COMES UP: HOLD THE WELL', '#ffd36b'); continue; }
      if (w.deep) continue;
      /* THE GREAT WELL's windlass stands in THE MARKET COURTYARD (claude/welltown-polish): while THE GANG LEADER lives it is fouled - a blow only rings off it, so the well is no way out of his fight */
      if (w.top && hb && w.cd <= 0 && ctx.enemies().some(q => q.alive && q.t === 'gangleader') && ctx.overlap(hb, { l: w.x - 16, r: w.x + 16, t: w.y - 28, b: w.y })) { w.cd = 0.8; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(w.x, w.y - 14, ctx.hero().face || 1, 3);
        if (!WT.said.fouled) { WT.said.fouled = 1; ctx.number(w.x, w.y - 34, 'THE WINDLASS IS FOULED: FINISH HIM FIRST', '#ff9a5c'); } continue; }
      if (hb && w.cd <= 0 && ctx.overlap(hb, { l: w.x - 16, r: w.x + 16, t: w.y - 28, b: w.y })) { const m = ctx.movers().find(q => q.windlass === w.bucket); if (!m || m.dir) continue;
        w.cd = 0.8; const atTop = m.y <= m.y0 + 1; m.dir = atTop ? 1 : -1; WT.n.rides++; if (atTop && !WT.followed) WT.followT = FOLLOW.after; ctx.sfx.clank && ctx.sfx.clank(); ctx.sfx.ropeHaul && ctx.sfx.ropeHaul(); ctx.sparks(w.x, w.y - 14, ctx.hero().face || 1, 4);
        ctx.number(w.x, w.y - 34, atTop ? 'STRIKE THE WINDLASS: THE BUCKET GOES DOWN' : 'THE BUCKET GOES UP', '#ffd36b'); } }
    /* THE BINDING WORKS (claude/djinn2): the ground shakes, more often and harder the deeper you are (told once); a crack lets a burst of sand go */
    const Wk = WT.L.works, Ph = ctx.hero();
    if (Wk && Ph && !Ph.dead) { const tx = Ph.x / 16, ty = Ph.y / 16;
      if (tx >= Wk.x0 && tx <= Wk.x1 && ty >= Wk.y0 && ty <= Wk.y1 + 1) { const k = Math.max(0, Math.min(1, (ty - Wk.y0) / (Wk.y1 - Wk.y0)));
        WT.tremor = (WT.tremor ?? 3) - dt; if (WT.tremor <= 0) { WT.tremor = WORKS.tremorTop + (WORKS.tremorBottom - WORKS.tremorTop) * k; WT.n.tremors = (WT.n.tremors || 0) + 1;
          ctx.shake(Math.round(WORKS.shakeTop + (WORKS.shakeBottom - WORKS.shakeTop) * k)); ctx.sfx.rubble ? ctx.sfx.rubble() : ctx.sfx.thud && ctx.sfx.thud();
          const near = (WT.L.cracks || []).filter(c => Math.abs(c.x - Ph.x) < 200).sort((a, b) => Math.abs(a.x - Ph.x) - Math.abs(b.x - Ph.x))[0]; if (near) ctx.dust(near.x, near.y + 4, 6);
          if (!WT.said.tremor) { WT.said.tremor = 1; ctx.number(Ph.x, Ph.y - 30, 'THE GROUND SHAKES: SOMETHING STIRS BELOW', '#ff9a5c'); } } }
      else WT.tremor = 3; }
    /* THE STEAM WORKS' VENTS (claude/djinn3): the rhythm, the cap's clock, the jet on whoever stands in it; THE BELLOWS relights when its cap blows -
       never on top of anyone (it waits until the tunnel under it is clear) */
    WT.vt += dt;
    for (const v of WT.vents) { v.cd = Math.max(0, v.cd - dt);
      if (v.capT > 0) { v.capT -= dt; if (v.capT <= 0) { const bx = ventBox(v), inIt = ctx.players.some(pp => !pp.dead && ctx.overlap(bx, { l: pp.x - 6, r: pp.x + 6, t: pp.y - 20, b: pp.y }));
          if (v.always && inIt) v.capT = 0.05; else { v.capT = 0; if (v.always) { ventWall(v, true); ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.hiss && ctx.sfx.hiss(); } } } }
      const st = ventState(v); if (st !== v.st) { if (st === 'jet' && !v.always) { if (v.steam) { ctx.sfx.hiss && ctx.sfx.hiss(); } else { ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.hiss && ctx.sfx.hiss(); } } v.st = st; }
      if (st !== 'jet') continue; const bx = ventBox(v);
      for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || v.cd > 0) return; if (!ctx.overlap(bx, { l: P.x - 5, r: P.x + 5, t: P.y - 18, b: P.y })) return;
        v.cd = VENT.tick; const dir = Math.sign(P.x - (v.x0 + v.x1 + 1) * 8) || -(P.face || 1); ctx.hurtHero(P.x - dir * 8, v.steam ? VENT.steamDmg : VENT.dmg, { unblockable: true, name: v.steam ? 'THE STEAM' : 'THE VENT' }); P.vx = dir * VENT.knock;
        if (v.steam) { if (!WT.said.steam) { WT.said.steam = 1; ctx.number(P.x, P.y - 30, 'STEAM UNDER THE WATER: GO WHEN THE BUBBLES STOP', '#e8f4f8'); } }
        else if (!WT.said.vent) { WT.said.vent = 1; ctx.number(P.x, P.y - 30, 'THE VENT BURNS: WAIT FOR IT, OR POUR ON IT', '#ff9a5c'); } }); }
    /* the bellows, the first time you stand before it */
    { const Pb = ctx.hero(), bel = WT.vents.find(v => v.always && v.capT <= 0); if (bel && Pb && !WT.said.bellows && Math.abs(bel.x0 * 16 - Pb.x) < 60 && Math.abs((bel.y1 + 1) * 16 - Pb.y) < 24) { WT.said.bellows = 1; ctx.number(Pb.x, Pb.y - 30, 'THE BELLOWS NEVER STOPS: POUR ON IT', '#ffd36b'); } }
    /* THE DEEP WELL winds up */
    for (const w of WT.wells) if (w.deep && w.wind > 0) { w.wind -= dt; if (w.wind <= 0) { w.wind = 0; w.up = true; ctx.sfx.splash && ctx.sfx.splash(); ctx.burst(w.x, w.y - 12, 6, ['#7ab8e8', '#e8f4f8'], 40, 0.4); } }
    /* THE RIDE IS CONTESTED: the bucket gone, the well head's men (L.ents follow: true) come down the shaft after you, to the bucket's foot */
    if (WT.followT > 0) { WT.followT -= dt; if (WT.followT <= 0) { WT.followed = true; const m = ctx.movers().find(q => q.windlass); const TS = ctx.TS;
      const fol = ctx.enemies().filter(q => q.alive && WT.L.ents[parseInt(q.xpKey)] && WT.L.ents[parseInt(q.xpKey)].follow);
      if (m && fol.length) { const foot = m.y1, mx = m.x + m.w / 2; fol.forEach((q, i) => { q.x = mx + (i % 2 ? 1 : -1) * (40 + 12 * i); q.y = foot - 3 * TS; q.vx = 0; q.vy = 0; if (q.st) q.st.x = q.x; ctx.dust(q.x, foot, 6); });
        ctx.number(mx, foot - 40, 'THEY COME DOWN THE WELL AFTER YOU', '#ff9a5c'); } } }
    /* THE FIRES' HEAT: a tick at a burning barricade's face */
    for (const f of WT.fires) { if (!f.lit) continue; f.cd = Math.max(0, f.cd - dt);
      for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || f.cd > 0) return; const l = f.x0 * 16 - FIRE.reach, r = (f.x1 + 1) * 16 + FIRE.reach;
        if (P.x + 5 > l && P.x - 5 < r && P.y > f.y0 * 16 && P.y - 14 < (f.y1 + 1) * 16) { f.cd = FIRE.tick; ctx.hurtHero(P.x - (P.face || 1) * 8, FIRE.dmg, { unblockable: true, noKnock: true, name: 'THE FIRE' });
          if (!WT.said['f' + f.x0]) { WT.said['f' + f.x0] = 1; ctx.number(P.x, P.y - 30, 'IT BURNS: POUR YOUR SKIN ON IT', '#ff9a5c'); } } }); }
    /* THE MUD WALLS: say what they want, once each, the first time one is in front of you */
    const P = ctx.hero();
    for (const m of WT.walls) if (!m.open && !WT.said['m' + m.x0] && Math.abs(m.x0 * 16 + 8 - P.x) < 40 && P.y > m.y0 * 16 && P.y - 14 <= (m.y1 + 1) * 16) { WT.said['m' + m.x0] = 1; ctx.number(P.x, P.y - 30, 'MUD: POUR YOUR SKIN ON IT', '#ffd36b'); }
    /* THE WINDLASS and THE DRY CISTERN: what each is for, the first time you stand by it */
    const top = WT.windlasses.find(w => w.top);
    if (top && !WT.said.windlass && !ctx.enemies().some(q => q.alive && q.t === 'gangleader') && Math.abs(top.x - P.x) < 48 && Math.abs(top.y - P.y) < 24) { WT.said.windlass = 1; ctx.number(P.x, P.y - 30, 'STRIKE THE WINDLASS: THE BUCKET GOES DOWN', '#ffd36b'); }
    const cs = WT.cistern;
    if (cs && !cs.full && !WT.said.cistern && Math.abs(cs.x - P.x) < 48 && Math.abs(cs.y - P.y) < 24 && ctx.questGot() < ctx.questN()) { WT.said.cistern = 1; ctx.number(P.x, P.y - 30, 'THE DRY CISTERN WANTS FOUR WATER-SKINS', '#ffd36b'); }
    /* THE SUN AND THE SKIN: the first time the sun has you and there is water, say so */
    if (!WT.said.sun && P.sun && P.sun.v > 0.6 && skinOf(P).sips > 0) { WT.said.sun = 1; ctx.number(P.x, P.y - 30, 'THE SUN IS OUT: DRINK FROM YOUR SKIN (E)', '#ffd36b'); }
    /* A THIEF CUT DOWN gives back what he took; one who got away with it (his run done) has drunk it */
    const live = new Set(ctx.enemies());
    for (const e of [...WT.carriers]) { if (e.alive && live.has(e) && e.st.mode === 'flee') continue; WT.carriers.delete(e);
      if (e.alive && live.has(e)) { e.st.carry = 0; continue; }
      const pp = e.st.from || P, sk = skinOf(pp); sk.sips = Math.min(sk.max || SKINMAX, sk.sips + e.st.carry); e.st.carry = 0; WT.n.back++;
      ctx.burst(e.x, e.y - 12, 8, ['#7ab8e8', '#e8f4f8'], 50, 0.5); ctx.number(e.x, e.y - 30, 'THE SIP IS BACK', '#8fd160'); }
  };

  /* ---------- THE BUCKET: called from updateMovers before the generic lift (it moves only on the windlass) ---------- */
  H.bucket = (m, dt) => {
    const oy = m.y; m.dx = 0;
    if (m.dir) { m.y += m.dir * (m.dir > 0 ? BUCKET.down : BUCKET.up) * dt; if (m.y >= m.y1) { m.y = m.y1; m.dir = 0; ctx.sfx.thud && ctx.sfx.thud(); } else if (m.y <= m.y0) { m.y = m.y0; m.dir = 0; ctx.sfx.clank && ctx.sfx.clank(); } }
    m.dy = m.y - oy; if (WT) WT.bucketY = m.y; return true;
  };

  /* ---------- THE WATER-THIEF (the cutthroat's machine, src/desert-foes.js, plus the run) ---------- */
  H.thiefStep = (s, w, dt) => {
    if (s.mode === 'flee') { s.t -= dt; s.x += s.face * THIEF.run * dt; s.frame = Math.floor(w.time * 10) % 2;
      if (s.t <= 0) { s.mode = 'walk'; s.cd = 0.9; s.face = -s.face; } return []; }
    return cutthroatStep(s, w, dt);
  };
  /* his cut landed on a hero: a sip goes with him, and he runs (away from you, for a well) */
  H.stole = (e, pp) => { if (!e.st || e.st.carry) return; const sk = skinOf(pp); if (sk.sips <= 0) return;
    sk.sips--; e.st.carry = 1; e.st.from = pp; e.st.mode = 'flee'; e.st.t = THIEF.runT; e.st.face = Math.sign(e.x - pp.x) || 1; if (WT) { WT.n.stolen++; WT.carriers.add(e); }
    ctx.burst(pp.x, pp.y - 14, 6, ['#7ab8e8', '#e8f4f8'], 60, 0.5); ctx.number(pp.x, pp.y - 30, 'HE CUT YOUR SKIN: CATCH HIM', '#ff9a5c'); };

  /* ---------- WHAT E DOES NOW (no side effects): the HUD's live verb, the pour marker and the pour-arc read it (claude/welltown3: WELL CLARITY) ---------- */
  H.verbNow = pp => {
    if (!WT || !pp) return null; const P = pp, sk = skinOf(P); sk.max = maxOf(P);
    const w = nearWell(P.x, P.y);
    if (w && w.deep && !w.up && sk.sips < sk.max) return { verb: 'WIND' };
    if (w && w.jar) { if (w.left > 0 && sk.sips < sk.max) return { verb: 'FILL' }; }
    else if (w && sk.sips < sk.max) return { verb: 'FILL' };
    const c = WT.cistern; if (c && !c.full && Math.abs(c.x - P.x) <= WELL_R && Math.abs(c.y - P.y) <= 20) return { verb: 'POUR IN' };
    if (sk.sips <= 0) return { verb: 'EMPTY' };
    const t = pourTarget(P); if (t) return { verb: 'POUR', target: t };
    if (P.sun && P.sun.v > DRINK_AT) return { verb: 'DRINK' };
    return null;
  };

  /* the verb as one word, or null (pure: the HUD's own read) - 'FILL' | 'POUR' | 'DRINK' | 'WIND' | null */
  H.welltownVerb = () => { const v = WT && H.verbNow(ctx.hero()); if (!v || v.verb === 'EMPTY') return null; return { verb: v.verb === 'POUR IN' ? 'POUR' : v.verb, key: v.verb === 'WIND' ? 'atk' : 'talk' }; };   /* (the touch module's hook shape: { verb, key }; the windlass is struck, the rest is INTERACT) */

  /* ---------- DRAWING: src/redraw/welltown_props.js draws each thing; this says where, and what state it is in ---------- */
  H.drawWorld = (g, cx, cy, time) => {
    if (!WT) return; const R = Math.round, vw = ctx.VW();
    const on = x => x > cx - 40 && x < cx + vw + 40;
    const Pd = ctx.hero(), skd = Pd && skinOf(Pd), carry = !!skd && skd.sips > 0, room = !!skd && skd.sips < (skd.max || SKINMAX);
    /* THE BINDING SEALS (claude/djinn2): carved rings that glow from inside, brighter the deeper; and SAND TRICKLING from the vault's cracks */
    for (const sl of (WT.L.seals || [])) if (on(sl.x)) drawSeal(g, R(sl.x - cx), R(sl.y - cy), -1, time, sl.glow);
    for (const c of (WT.L.cracks || [])) { if (!on(c.x)) continue; const x = R(c.x - cx), y = R(c.y - cy); g.fillStyle = '#2a2018'; g.fillRect(x - 3, y, 6, 1); g.fillRect(x - 1, y + 1, 2, 1);
      for (let i = 0; i < 6; i++) { const ph = (time * 0.9 + i / 6 + c.x * 0.003) % 1; g.globalAlpha = 0.9 - ph * 0.6; g.fillStyle = i % 2 ? '#d8b070' : '#f2dca0'; g.fillRect(x + ((i * 3) % 3) - 1, y + 2 + R(ph * 70), 1, 2); } g.globalAlpha = 1; }
    /* THE SHADE'S CASTERS (claude/welltown5): the cloths strung over the squares and the old well's roof, over the tint main.js lays under them */
    for (const k of (WT.L.casters || [])) { if (k.x1 < cx - 40 || k.x0 > cx + vw + 40) continue; WTP.drawCaster(g, R(k.x0 - cx), R(k.x1 - cx), R(k.y - cy), R(k.floor - cy), k, time); }
    /* THE WELLS: the only blue in the town. A well that can fill your skin now GLINTS (a white star on its water) */
    for (const w of WT.wells) { if (!on(w.x)) continue; const x = R(w.x - cx), y = R(w.y - cy);
      const fillable = room && (w.jar ? w.left > 0 : !(w.deep && !w.up));
      WTP.drawWell(g, x, y, { deep: w.deep, up: w.up, wind: w.wind > 0 ? 1 - w.wind / DEEP.wind : 0, jar: !!w.jar, left: w.left, glint: fillable ? 1 : 0 }, time);
      if (fillable) { const ph = (time * 1.4 + w.x * 0.01) % 1, gx = x - 5 + Math.floor((w.x * 7) % 9), gy = y - (w.jar ? 15 : 8); if (ph < 0.35) { const k = ph < 0.18 ? 2 : 1; g.fillStyle = '#ffffff'; g.fillRect(gx, gy - k, 1, 2 * k + 1); g.fillRect(gx - k, gy, 2 * k + 1, 1); } }
      /* E over it while you stand by it and it can give (as doors and shops say E); a deep well that is down says WIND */
      if (skd && room && Math.abs(Pd.x - w.x) < WELL_R + 24 && Math.abs(Pd.y - w.y) < 28) { if (w.jar ? w.left > 0 : true) ctx.text(w.deep && !w.up ? 'E  WIND' : 'E', x, y - (w.jar ? 24 : 34) - Math.round(Math.abs(Math.sin(time * 3))), '#e8f4f8', 'center', 6); } }
    /* THE MUD WALLS and THE FIRES: cracked and smouldering; while you carry water the near ones say so (a POUR marker over them) */
    const near = m => Pd && Math.abs((m.x0 + m.x1 + 1) * 8 - Pd.x) < 150 && Math.abs((m.y1 + 1) * 16 - Pd.y) < 80;
    const marker = (mx, my) => { const b = Math.round(Math.sin(time * 4) * 2), x = R(mx - cx), y = R(my - cy) + b; g.fillStyle = '#3a7ab8'; g.fillRect(x - 2, y - 2, 5, 5); g.fillRect(x - 1, y - 4, 3, 2); g.fillRect(x, y - 5, 1, 1); g.fillStyle = '#e8f4f8'; g.fillRect(x - 1, y - 1, 1, 2);
      ctx.text('POUR', x, y - 13, '#7ab8e8', 'center', 6); };
    for (const m of WT.walls) { if (!on(m.x0 * 16)) continue; const x = R(m.x0 * 16 - cx), y = R(m.y0 * 16 - cy), w = (m.x1 - m.x0 + 1) * 16, h = (m.y1 - m.y0 + 1) * 16;
      const wet = !m.open && carry && near(m) ? 1 : 0; WTP.drawMudWall(g, x, y, w, h, { open: m.open, wet }, time); if (wet) marker((m.x0 + m.x1 + 1) * 8, m.y0 * 16 - 10); }
    for (const f of WT.fires) { if (!on(f.x0 * 16)) continue; const x = R(f.x0 * 16 - cx), y = R(f.y0 * 16 - cy), h = (f.y1 - f.y0 + 1) * 16;
      const wet = f.lit && carry && near(f) ? 1 : 0; WTP.drawFire(g, x, y, h, { lit: f.lit, wet }, time); if (wet) marker((f.x0 + f.x1 + 1) * 8, f.y0 * 16 - 10); }
    /* THE STEAM WORKS (claude/djinn3): the flooded trough's standing water, and every vent - its grate, its glow (told), its jet, its cap's hiss and clock */
    for (const pl of (WT.L.wtPools || [])) { if (pl.x1 < cx - 40 || pl.x0 > cx + vw + 40) continue; WTP.drawPool(g, R(pl.x0 - cx), R(pl.x1 - cx), R(pl.top - cy), R(pl.floor - cy), time); }
    for (const v of WT.vents) { const vx = (v.x0 + v.x1 + 1) * 8; if (!on(vx)) continue; const st = ventState(v);
      const k = st === 'glow' ? 1 - (((v.period - VENT.jet) - (((WT.vt + v.phase) % v.period + v.period) % v.period)) / VENT.glow) : 0;
      WTP.drawVent(g, R(v.x0 * 16 - cx), R((v.y1 + 1) * 16 - cy), (v.x1 - v.x0 + 1) * 16, (v.y1 - v.y0 + 1) * 16, { st, k: Math.max(0, Math.min(1, k)), steam: v.steam, always: v.always, cap: v.capT > 0 ? v.capT / VENT.cap : 0 }, time);
      if (!v.steam && st !== 'capped' && carry && near({ x0: v.x0, x1: v.x1, y1: v.y1 })) marker(vx, v.y0 * 16 - 10); }
    /* THE WINDLASSES and the great well's bucket and rope */
    const m = ctx.movers().find(q => q.windlass);
    for (const w of WT.windlasses) { if (!on(w.x)) continue; WTP.drawWindlass(g, R(w.x - cx), R(w.y - cy), { top: w.top, deep: w.deep, struck: Math.max(0, w.cd / 0.8) }, time); }
    if (m && on(m.x)) { const top = WT.windlasses.find(w => w.top); WTP.drawBucket(g, R(m.x - cx), R(m.y - cy), m.w, top ? R(top.y - 14 - cy) : null); }
    /* THE DRY CISTERN and its vault */
    const c = WT.cistern; if (c && on(c.x)) WTP.drawCistern(g, R(c.x - cx), R(c.y - cy), { full: c.full, got: ctx.questGot() });
    for (const v of WT.vault) if (!v.open && on(v.x0 * 16)) WTP.drawVaultDoor(g, R(v.x0 * 16 - cx), R(v.y0 * 16 - cy), (v.y1 - v.y0 + 1) * 16);
    /* A THIEF RUNNING WITH YOUR SIP: a blue drop over him */
    for (const e of ctx.enemies()) if (e.alive && e.t === 'waterthief' && e.st && e.st.carry && on(e.x)) { const x = R(e.x - cx), y = R(e.y - (e.h || 18) - 12 - cy) + Math.round(Math.sin(time * 8) * 1.5); g.fillStyle = '#7ab8e8'; g.fillRect(x - 2, y, 4, 4); g.fillRect(x - 1, y - 2, 2, 2); }
    /* THE POUR ARC: where a pour would land, dotted from your hand, while there is something in front of you to pour on */
    const v = Pd && !Pd.dead && H.verbNow(Pd);
    if (v && v.verb === 'POUR' && v.target) { const x0 = Pd.x + (Pd.face || 1) * 6, y0 = Pd.y - 16, x1 = v.target.x, y1 = v.target.y, n = 9, ph = (time * 3) % 1;
      for (let i = 0; i <= n; i++) { const k = (i + ph) / (n + 1), xx = x0 + (x1 - x0) * k, yy = y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 14; g.fillStyle = i % 2 ? '#7ab8e8' : '#e8f4f8'; g.fillRect(R(xx - cx), R(yy - cy), 2, 2); }
      g.fillStyle = 'rgba(122,184,232,0.45)'; g.fillRect(R(x1 - cx) - 5, R(y1 - cy) - 1, 10, 3); }
  };
  /* THE SKIN on the HUD, under the sun meter: a drop a sip, and what E does now (FILL, POUR, DRINK; a deep well's bucket says WIND) */
  const VERB_COL = { FILL: '#e8f4f8', 'POUR IN': '#8fd160', POUR: '#8fd160', DRINK: '#7ab8e8', WIND: '#ffd36b', EMPTY: '#ff9a5c' };
  H.drawHud = (g, P) => {
    if (!WT || !P) return; const sk = skinOf(P), x = 22, y = 64;
    ctx.text('SKIN', x - 12, y + 2, '#7ab8e8', 'left', 6);
    for (let i = 0; i < (sk.max || SKINMAX); i++) { const dx = x + 12 + i * 8; g.fillStyle = 'rgba(20,20,40,0.6)'; g.fillRect(dx - 1, y - 1, 7, 8); g.fillStyle = i < sk.sips ? '#3a7ab8' : '#1a2430'; g.fillRect(dx, y, 5, 6); if (i < sk.sips) { g.fillStyle = '#7ab8e8'; g.fillRect(dx + 1, y + 1, 2, 2); } }
    const v = !P.dead && H.verbNow(P);
    if (v) ctx.text(v.verb === 'EMPTY' ? 'FILL AT A WELL' : v.verb === 'WIND' ? 'STRIKE THE WINDLASS' : 'E: ' + v.verb, x + 12 + (sk.max || SKINMAX) * 8 + 3, y + 2, VERB_COL[v.verb] || '#e8f4f8', 'left', 6);
  };
  H.read = () => WT && { n: { ...WT.n }, walls: WT.walls.map(m => m.open), fires: WT.fires.map(f => f.lit), cistern: WT.cistern && WT.cistern.full, vault: WT.vault.map(v => v.open), sips: skinOf(ctx.hero()).sips,
    vents: WT.vents.map(v => ({ x: v.x0, st: ventState(v), capT: +v.capT.toFixed(2), lit: v.lit, steam: v.steam, always: v.always })) };
  return H;
}
