// src/lamplit-fire.js - THE LAMPLIT STREET 3's FIRE (claude/lamplit3, Daniel 10-18: "there's no fire for the most part, so you can't actually do much").
// The street's rule stays THE LAMPS ARE AIR; this is what you DO with the fire you carry between them. src/main.js keeps the flame in your hand (P.wick:
// taken at any burning lamp, brazier or burning oil; a blow puts it out; under the water it lasts WICK_WET s) and this module adds the verbs to it:
//   LIGHT (E)      beside a dead lamp with fire in hand, INTERACT lights it (a blade through it still does: the bosses' relight openings are unchanged)
//   THROW (E)      anywhere else, INTERACT throws the fire in a TOLD ARC (src/flame.js throwFlame on src/carry-throw.js's aim: UP lobs, DOWN tosses short).
//                  It lights a dead lamp it strikes (a lamp you cannot reach), catches the oil it lands in, burns a foe, burns a TAR NET; the water takes it
//   THE OIL        lamp oil lies in the street (L.lpOil spans: puddles, GUTTERS that run along a ledge to a lamp, slicks FLOATING on the flooded street). A cell
//                  CATCHES, BURNS OIL.burn s and passes itself on to the cells beside it (a gutter is a fuse): a burning pool LIGHTS the dead lamps over it,
//                  burns what stands in it (you too), burns a TAR NET beside it, sets off an OIL CASK; then it is spent and SEEPS BACK in OIL.back s
//   OIL CASKS      the whale-oil tanks of the lamp works, riveted iron, dripping: they keep the oil under them fed; a blow SPILLS a wide slick; fire beside
//                  one BURSTS it (a told red ring: a threat and a tool)
//   OIL VALVES     a brass wheel on the lamp main: INTERACT or a blow fills its gutter again (a spent fuse is never a softlock)
//   TAR NETS       the drowned fleet's nets, tarred, hung across a way (L.lpSnags, solid): fire takes them and they are gone for the run (marks)
//   DARK UNTIL LIT the level's dark (L.lpDark) is near-black; every lamp lit opens a wide pool of light (main.js: a city lamp's light is L.lpDark.lampR)
//                  and every burning cell, thrown flame and cask fire is a hole in it (holes)
// main.js calls: reset, on, update(dt, hb), interact (the E press, before the generic ones), holes, drawWorld, drawOver, read, takeAt. Teaching lines are SAY
// (routed in src/hint-lines.js SAY_LINES).
import { FLAME_THROW, throwFlame, stepThrownFlame, thrownHoles, drawThrownFlame } from './flame.js';
import * as CT from './carry-throw.js';
import { lpPostDraw, lpBracketDraw } from './redraw/lamplit3_tiles.js';

/* THE NUMBERS. OIL: catch = s a cell smoulders before it burns; burn s it burns (gutter: a fuse burns shorter); spread s before it lights the cells beside it; back s
   before spent oil seeps back (caskBack under a cask); tick s between two burns on what stands in it; dmg on a hero (unblockable), foeDmg on a foe; lampR px a dead
   lamp's foot may stand from a burning cell (along) and lampUp px over it. CASK: spill = cells a blow spills each side; burstR px / burstDmg / burstFoe its burst;
   cool s before it is full again. SNAG: catch s a tar net burns before it is gone. USE: px from a dead lamp that INTERACT lights it (else it throws) */
export const OIL = { catch: 0.25, burn: 6, gutter: 4, spread: 0.07, back: 18, caskBack: 6, tick: 0.5, dmg: 9, foeDmg: 16, lampR: 30, lampUp: 70, take: 18 };
export const CASK = { spill: 3, burstR: 44, burstDmg: 14, burstFoe: 34, cool: 22, tell: 0.5 };
export const SNAG = { catch: 0.8 };
export const USE = { lampR: 26 };
CT.addKind('flame', FLAME_THROW);
/* WHAT THE STREET SAYS (routed in src/hint-lines.js SAY_LINES: they go through number() as variables) */
export const LP3_SAY = {
  lit: 'YOUR FIRE LIGHTS THE LAMP', throw: 'E BESIDE A DEAD LAMP LIGHTS IT. E ANYWHERE ELSE THROWS YOUR FIRE', thrownLamp: 'THROWN FIRE LIGHTS THE LAMP',
  catch: 'THE OIL CATCHES', oilLamp: 'THE BURNING OIL LIGHTS THE LAMP', seep: 'THE OIL SEEPS BACK', doused: 'THE WATER TAKES IT',
  spill: 'THE CASK SPILLS ITS OIL', caskTell: 'THE CASK IS GOING UP: GET CLEAR', caskBurst: 'THE CASK BURSTS', valve: 'THE OIL MAIN RUNS: THE GUTTER IS FULL',
  netCatch: 'THE TAR NET CATCHES', netGone: 'THE NET BURNS AWAY', netCold: 'A TAR NET: FIRE TAKES IT', takeOil: 'FIRE FROM THE BURNING OIL', burnFoe: 'IT BURNS',
};

export function makeLamplitFire(ctx) {
  let F = null;
  const H = {};
  const TS = () => ctx.TS;
  const once = k => { if (F.said[k]) return false; F.said[k] = 1; return true; };
  const say = (x, y, k, col) => ctx.number(x, y, LP3_SAY[k], col || '#ffd36b');
  const key = (x, y) => y * 4096 + x;
  const cellAt = (x, y) => F.cells.get(key(x, y)) || null;
  const cxOf = c => c.x * TS() + 8, cyOf = c => (c.y + 1) * TS() - (c.fl || 0);   /* a cell's middle along, and the surface it lies on (a floating cell: the water's) */

  H.on = () => !!F;
  H.reset = () => {
    const L = ctx.L(); if (!L || !L.lpFire) { F = null; return; }
    /* every load and every respawn lays it all again from the props (they are new objects each time); what was SAID is kept for the same level, and a burnt net stays burnt (marks) */
    const said = F && F.L === L ? F.said : {};
    {
      F = { L, said, cells: new Map(), list: [], casks: [], valves: [], snags: [], thrown: [], posts: L.lpPosts || [], n: { lit: 0, thrown: 0, thrownLamp: 0, catches: 0, oilLamps: 0, burns: 0, foeBurns: 0, spills: 0, bursts: 0, valves: 0, nets: 0, doused: 0, eLit: 0 } };
      const add = (x, y, o) => { const k = key(x, y); if (F.cells.has(k)) return F.cells.get(k); const c = { x, y, st: 'oil', t: 0, gutter: !!(o && o.gutter), float: !!(o && o.float), cask: null, fl: 0 }; F.cells.set(k, c); F.list.push(c); return c; };
      for (const [x0, x1, y, o] of L.lpOil || []) for (let x = x0; x <= x1; x++) add(x, y, o);
      for (const c of F.list) if (c.float) { const p = ctx.poolAt(cxOf(c)); if (p) c.fl = Math.round((c.y + 1) * TS() - p.y) - 2; }   /* OIL FLOATS: drawn and lit on the water's surface */
      for (const pr of ctx.props()) {
        if (pr.t === 'oilcask') { const tx = Math.floor(pr.x / TS()), ty = Math.floor((pr.y - 1) / TS()); const cs = { pr, tx, ty, st: 'full', t: 0, cool: 0, cells: [] };
          for (let dx = -1; dx <= 1; dx++) { const c = add(tx + dx, ty); c.cask = cs; cs.cells.push(c); } F.casks.push(cs); }
        else if (pr.t === 'oilvalve') F.valves.push({ pr, run: pr.run || null, cd: 0 });
        else if (pr.t === 'tarnet') { const s = (L.lpSnags || []).find(q => q.id === pr.id); if (s) F.snags.push({ pr, s, st: 'whole', t: 0 }); }
      }
    }
    for (const s of F.snags) if (ctx.marks.has('lpsnag:' + s.s.id) && s.st !== 'gone') burnAway(s, true);
    for (const s of F.snags) s.pr.burnt = s.st === 'gone';
    if (typeof window !== 'undefined' && window.BK) window.BK.lamplitFire = () => H;
  };

  /* ---------- THE OIL ---------- */
  function ignite(c, from) { if (!c || c.st !== 'oil') return false; c.st = 'catch'; c.t = OIL.catch; c.from = from || null; F.n.catches++; return true; }
  function igniteNear(px, py, r) { let any = false; for (const c of F.list) if (c.st === 'oil' && Math.abs(cxOf(c) - px) <= r && Math.abs(cyOf(c) - py) <= Math.max(14, r * 0.7)) { ignite(c); any = true; } return any; }
  const burning = c => c.st === 'burn';
  function burnAway(s, quiet) { s.st = 'gone'; s.pr.burnt = true; ctx.marks.add('lpsnag:' + s.s.id); F.n.nets++;
    for (let y = s.s.y0; y <= s.s.y1; y++) for (let x = s.s.x0; x <= s.s.x1; x++) ctx.cellSet(x, y, ctx.T.AIR);
    if (!quiet) { const mx = (s.s.x0 + s.s.x1 + 1) / 2 * TS(), my = (s.s.y0 + s.s.y1 + 1) / 2 * TS(); say(mx, my - 20, 'netGone', '#8fd160'); ctx.sfx('crack'); ctx.burst(mx, my, 24, ['#1a1a1e', '#ff9a3c', '#ffd36b', '#4a5058'], 80, 0.9); ctx.shake(3); } }
  function netCatch(s) { if (s.st !== 'whole') return; s.st = 'catch'; s.t = SNAG.catch; ctx.sfx('ignite'); const mx = (s.s.x0 + s.s.x1 + 1) / 2 * TS(); say(mx, s.s.y0 * TS() - 8, 'netCatch', '#ff9a3c'); }
  const snagAt = (tx, ty) => F.snags.find(s => s.st === 'whole' && tx >= s.s.x0 - 1 && tx <= s.s.x1 + 1 && ty >= s.s.y0 - 1 && ty <= s.s.y1 + 1) || null;
  function caskBurst(cs) { if (cs.st !== 'full') return; cs.st = 'tell'; cs.t = CASK.tell; say(cs.pr.x, cs.pr.y - 40, 'caskTell', '#ff6b6b'); ctx.sfx('gutter'); }
  function caskPop(cs) {
    cs.st = 'empty'; cs.cool = CASK.cool; F.n.bursts++; const x = cs.pr.x, y = cs.pr.y - 10;
    say(x, y - 30, 'caskBurst', '#ff9a3c'); ctx.sfx('boom'); ctx.shake(6); ctx.ring(x, y, CASK.burstR, '#ff9a3c', 0.5); ctx.burst(x, y, 30, ['#ff9a3c', '#ffd36b', '#fff6c8', '#3a2418'], 140, 0.8);
    igniteNear(x, y + 10, CASK.burstR); fireAt(x, y, CASK.burstR, CASK.burstDmg, CASK.burstFoe, 'THE CASK');
    for (const c of cs.cells) if (c.st === 'oil') ignite(c);
  }
  /* A BURST OF FIRE at (x, y): the oil in reach catches, dead lamps in reach light, a tar net in reach catches, and what stands in it is burned (the Wickling's burst
     and a cask's go through here: the threat and the tool are one fire) */
  function fireAt(x, y, r, heroDmg, foeDmg, name) {
    igniteNear(x, y, r);
    for (const pr of ctx.lamps()) if (!pr.lit && Math.abs(pr.x - x) <= r && Math.abs(pr.y - 30 - y) <= r + 20) { ctx.light(pr); F.n.oilLamps++; }
    for (const s of F.snags) if (s.st === 'whole') { const sx = (s.s.x0 + s.s.x1 + 1) / 2 * TS(), sy = (s.s.y0 + s.s.y1 + 1) / 2 * TS(); if (Math.abs(sx - x) <= r + 8 && Math.abs(sy - y) <= (s.s.y1 - s.s.y0 + 1) * TS() / 2 + r) netCatch(s); }
    for (const cs of F.casks) if (cs.st === 'full' && Math.hypot(cs.pr.x - x, cs.pr.y - 10 - y) <= r) caskBurst(cs);
    if (heroDmg) for (const pp of ctx.players()) if (!pp.dead && Math.hypot(pp.x - x, pp.y - 10 - y) <= r * 0.75) ctx.hurtHero(pp, x, heroDmg, name);
    if (foeDmg) for (const e of ctx.enemies()) if (e.alive && !e.harmless && Math.hypot(e.x - x, e.y - (e.h || 10) / 2 - y) <= r) ctx.hurtFoe(e, foeDmg, x);
  }
  H.fireAt = (x, y, r, heroDmg, foeDmg, name) => { if (F) fireAt(x, y, r, heroDmg, foeDmg, name); };
  H.igniteNear = (x, y, r) => !!F && igniteNear(x, y, r);
  /* is there fire at (x, y) for a hero to take (burning oil, a lying flame) */
  H.takeAt = (x, y) => { if (!F) return false; for (const c of F.list) if (burning(c) && Math.abs(cxOf(c) - x) < OIL.take && Math.abs(cyOf(c) - y) < 22) return true;
    for (const f of F.thrown) if (f.st === 'lie' && Math.abs(f.x - x) < 14 && Math.abs(f.y - y) < 20) return true; return false; };
  H.burningAt = (x, y) => !!F && F.list.some(c => burning(c) && Math.abs(cxOf(c) - x) < 9 && y > cyOf(c) - 14 && y < cyOf(c) + 4);

  /* ---------- INTERACT (E): light the dead lamp beside you, or throw your fire. True when the press was used ---------- */
  H.interact = P => {
    if (!F || P.dead || !(P.wick > 0) || ctx.talkBusy()) return false;
    const pr = ctx.lamps().find(q => !q.lit && Math.abs(q.x - P.x) <= USE.lampR && P.y > q.y - 56 && P.y < q.y + 20);
    if (pr) { ctx.relight(pr); P.wick = 0; F.n.eLit++; F.n.lit++; return true; }
    const f = throwFlame(P.x + (P.face || 1) * 6, P.y - 22, P.face || 1, ctx.keys()); f.owner = P; F.thrown.push(f); P.wick = 0; F.n.thrown++; ctx.sfx('throwWhoosh');
    if (once('throw')) say(P.x, P.y - 40, 'throw'); return true;
  };
  /* the arc you would throw, told: from the hand, on the numbers it flies (drawn while fire is in your hand and no dead lamp is beside you) */
  const solidPx = (px, py, falling) => ctx.solidPx(px, py, falling);
  const arcFor = P => { const f = throwFlame(P.x + (P.face || 1) * 6, P.y - 22, P.face || 1, ctx.keys()); return CT.predictArc('flame', f.x, f.y, f, solidPx, { stopAt: (x, y) => lampHit(x, y) || (ctx.inWater(x, y) ? 'water' : null) }); };
  const lampHit = (x, y) => ctx.lamps().find(q => !q.lit && Math.abs(q.x - x) < 9 && y > q.y - 50 && y < q.y) || null;

  /* ---------- EVERY FRAME ---------- */
  H.update = (dt, hb) => {
    if (!F) return; const P = ctx.hero();
    /* the oil: catching, burning, passing itself on, spent, seeping back */
    let anyBurn = false;
    for (const c of F.list) {
      if (c.st === 'catch') { c.t -= dt; if (c.t <= 0) { c.st = 'burn'; c.t = c.gutter ? OIL.gutter : OIL.burn; c.spreadT = OIL.spread; F.n.burns++; if (once('catch')) say(cxOf(c), cyOf(c) - 24, 'catch', '#ff9a3c'); } }
      else if (c.st === 'burn') { anyBurn = true; c.t -= dt;
        if (c.spreadT > 0) { c.spreadT -= dt; if (c.spreadT <= 0) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) ignite(cellAt(c.x + dx, c.y + dy), c); }
        if (Math.random() < dt * 9) ctx.parts({ x: cxOf(c) + (Math.random() - 0.5) * 14, y: cyOf(c) - 2, vx: (Math.random() - 0.5) * 8, vy: -40 - Math.random() * 40, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#ff9a3c' : '#ffd36b', size: 1 + (Math.random() < 0.3 ? 1 : 0), grav: -20, fire: true });
        if (c.t <= 0) { c.st = 'spent'; c.t = c.cask ? OIL.caskBack : OIL.back; } }
      else if (c.st === 'spent') { c.t -= dt; if (c.t <= 0 && !(c.cask && c.cask.st !== 'full')) { c.st = 'oil'; c.t = 0; if (once('seep')) say(cxOf(c), cyOf(c) - 18, 'seep', '#9fb4bd'); } }
    }
    /* what the fire does: lamps over it light, a net beside it catches, a cask beside it bursts, what stands in it burns, and a hero with no fire takes some */
    if (anyBurn) for (const c of F.list) { if (!burning(c)) continue; const x = cxOf(c), y = cyOf(c);
      for (const pr of ctx.lamps()) if (!pr.lit && !(pr.gut > 0) && Math.abs(pr.x - x) <= OIL.lampR && pr.y - y <= 24 && y - pr.y <= OIL.lampUp) { ctx.light(pr); F.n.oilLamps++; say(pr.x, pr.y - 60, 'oilLamp', '#ffd36b'); }
      const s = snagAt(c.x, c.y); if (s) netCatch(s);
      for (const cs of F.casks) if (cs.st === 'full' && Math.abs(cs.tx - c.x) <= 2 && Math.abs(cs.ty - c.y) <= 1 && !cs.cells.includes(c)) caskBurst(cs);
      for (const cs of F.casks) if (cs.st === 'full' && cs.cells.includes(c) && c.from && !cs.cells.includes(c.from)) caskBurst(cs);
      for (const pp of ctx.players()) if (!pp.dead && Math.abs(pp.x - x) < 9 && pp.y > y - 14 && pp.y < y + 4) { pp.lpBurnT = (pp.lpBurnT || 0) - dt; if (pp.lpBurnT <= 0) { pp.lpBurnT = OIL.tick; ctx.hurtHero(pp, x, OIL.dmg, 'THE BURNING OIL'); } }
      for (const e of ctx.enemies()) if (e.alive && !e.harmless && Math.abs(e.x - x) < (e.w || 10) / 2 + 6 && Math.abs(e.y - y) < 14) { if (ctx.isWickling(e)) { ctx.wicklingFire(e); continue; } e.lpBurnT = (e.lpBurnT || 0) - dt; if (e.lpBurnT <= 0) { e.lpBurnT = OIL.tick; F.n.foeBurns++; ctx.hurtFoe(e, OIL.foeDmg, x); } }
    }
    if (P && !P.dead && !(P.wick > 0) && H.takeAt(P.x, P.y - 4)) { ctx.takeFire(P); if (once('takeOil')) say(P.x, P.y - 40, 'takeOil'); }
    /* the casks: a told burst, the slow refill */
    for (const cs of F.casks) { if (cs.st === 'tell') { cs.t -= dt; if (cs.t <= 0) caskPop(cs); } else if (cs.st === 'empty') { cs.cool -= dt; if (cs.cool <= 0) { cs.st = 'full'; for (const c of cs.cells) if (c.st === 'spent') { c.st = 'oil'; c.t = 0; } } }
      else if (cs.st === 'full' && hb && !P.hitSet.has(cs.pr) && overlap(hb, { l: cs.pr.x - 10, r: cs.pr.x + 10, t: cs.pr.y - 26, b: cs.pr.y })) { P.hitSet.add(cs.pr); spill(cs); }
      if (cs.st === 'full' && Math.random() < dt * 1.6) ctx.parts({ x: cs.pr.x + (Math.random() - 0.5) * 8, y: cs.pr.y - 4, vx: 0, vy: 20, life: 0.4, max: 0.4, col: '#2a2a30', size: 1, grav: 300 }); }
    /* the valves: a blow or E fills the gutter */
    for (const v of F.valves) { if (v.cd > 0) v.cd -= dt; if (v.cd <= 0 && hb && !P.hitSet.has(v.pr) && overlap(hb, { l: v.pr.x - 9, r: v.pr.x + 9, t: v.pr.y - 22, b: v.pr.y })) { P.hitSet.add(v.pr); turnValve(v); } }
    /* the nets: catching, then gone */
    for (const s of F.snags) if (s.st === 'catch') { s.t -= dt; if (Math.random() < dt * 40) ctx.parts({ x: (s.s.x0 + Math.random() * (s.s.x1 - s.s.x0 + 1)) * TS(), y: (s.s.y0 + Math.random() * (s.s.y1 - s.s.y0 + 1)) * TS(), vx: (Math.random() - 0.5) * 10, vy: -40, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#ff9a3c' : '#ffd36b', size: 2, grav: -20, fire: true }); if (s.t <= 0) burnAway(s); }
    /* the thrown fire */
    for (const f of F.thrown) {
      if (f.st === 'fly') { const was = f.st, r = stepThrownFlame(f, dt, solidPx); f.gone = f.gone || false;
        const lp = lampHit(f.x, f.y); if (lp) { ctx.light(lp); F.n.thrownLamp++; say(lp.x, lp.y - 60, 'thrownLamp'); f.gone = true; continue; }
        const tx = Math.floor(f.x / TS()), ty = Math.floor(f.y / TS());
        const hitFoe = ctx.enemies().find(e => e.alive && !e.harmless && Math.abs(e.x - f.x) < (e.w || 10) / 2 + 4 && f.y > e.y - (e.h || 10) - 4 && f.y < e.y + 2);
        if (hitFoe) { if (ctx.isWickling(hitFoe)) ctx.wicklingFire(hitFoe); else { ctx.hurtFoe(hitFoe, FLAME_THROW.hit, f.x); hitFoe.lpBurnT = 0; say(hitFoe.x, hitFoe.y - (hitFoe.h || 10) - 10, 'burnFoe', '#ff9a3c'); } igniteNear(f.x, f.y + 8, 10); f.gone = true; continue; }
        const sn = snagAt(tx, ty) || snagAt(tx + Math.sign(f.vx || 1), ty); if (sn && ctx.cellGet(tx + Math.sign(f.vx || 1), ty) === ctx.T.SOLID || (sn && r !== 'fly')) { netCatch(sn); f.gone = true; continue; }
        if (ctx.inWater(f.x, f.y)) { if (!igniteNear(f.x, f.y, 12)) { F.n.doused++; say(f.x, f.y - 16, 'doused', '#9fb4bd'); ctx.sfx('puff'); ctx.burst(f.x, f.y, 8, ['#bfe6f5', '#8a919c'], 40, 0.5); } f.gone = true; continue; }
        if (r !== 'fly') { if (igniteNear(f.x, f.y + 4, 12)) { f.gone = true; continue; } ctx.sfx('ignite'); }
        void was; }
      else { if (f.t >= FLAME_THROW.lie) f.gone = true; else if (igniteNear(f.x, f.y + 4, 10)) f.gone = true; }
      if (f.y > ctx.L().H * TS() || f.t > 8) f.gone = true;
    }
    if (F.thrown.some(f => f.gone)) F.thrown = F.thrown.filter(f => !f.gone);
    /* a lying flame is taken up again by walking onto it (the auto-take above) */
    if (P && P.wick > 0) for (const f of F.thrown) if (f.st === 'lie' && Math.abs(f.x - P.x) < 14 && Math.abs(f.y - P.y) < 20) f.gone = true;
    /* the first tar net you come to says what it is */
    if (P) for (const s of F.snags) if (s.st === 'whole' && Math.abs((s.s.x0 + 0.5) * TS() - P.x) < 70 && Math.abs(s.s.y1 * TS() - P.y) < 80 && once('net')) say(P.x, P.y - 40, 'netCold', '#ff9a5c');
  };
  function spill(cs) { F.n.spills++; say(cs.pr.x, cs.pr.y - 36, 'spill', '#c9b27c'); ctx.sfx('splash');
    for (let dx = -CASK.spill; dx <= CASK.spill; dx++) { const x = cs.tx + dx, y = cs.ty; if (ctx.cellGet(x, y + 1) !== ctx.T.SOLID && ctx.cellGet(x, y + 1) !== ctx.T.ONEWAY) continue; let c = cellAt(x, y); if (!c) { c = { x, y, st: 'oil', t: 0, gutter: false, float: false, cask: null, fl: 0, spilt: true }; F.cells.set(key(x, y), c); F.list.push(c); } else if (c.st === 'spent') { c.st = 'oil'; c.t = 0; } }
    ctx.burst(cs.pr.x, cs.pr.y - 6, 12, ['#1a1a1e', '#3a3a40', '#6a6a70'], 60, 0.5); }
  function turnValve(v) { if (!v.run) return; v.cd = 1.2; F.n.valves++; const [x0, x1, y] = v.run; let n = 0;
    for (let x = x0; x <= x1; x++) { const c = cellAt(x, y); if (c && c.st === 'spent') { c.st = 'oil'; c.t = 0; n++; } }
    say(v.pr.x, v.pr.y - 34, 'valve', '#c9b27c'); ctx.sfx('clank'); ctx.sfx('gateLift'); v.pr.spin = 1; void n; }
  H.interactValve = P => { if (!F) return false; const v = F.valves.find(q => q.cd <= 0 && Math.abs(q.pr.x - P.x) < 18 && Math.abs(q.pr.y - P.y) < 24); if (!v) return false; turnValve(v); return true; };
  const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

  /* ---------- THE LIGHT IT THROWS ---------- */
  H.holes = (hole, cx, cy) => { if (!F) return; const vw = ctx.VW(); let k = 0;
    for (const c of F.list) { if (!burning(c) && c.st !== 'catch') continue; const x = cxOf(c); if (x < cx - 80 || x > cx + vw + 80) continue; if ((k++ % 2) === 0) hole(x - cx, cyOf(c) - 10 - cy, burning(c) ? 52 : 26); }
    for (const cs of F.casks) if (cs.st === 'tell') hole(cs.pr.x - cx, cs.pr.y - 14 - cy, 40);
    for (const s of F.snags) if (s.st === 'catch') hole((s.s.x0 + s.s.x1 + 1) / 2 * TS() - cx, (s.s.y0 + s.s.y1 + 1) / 2 * TS() - cy, 64);
    thrownHoles(hole, F.thrown, cx, cy); };

  /* ---------- DRAWING (GREYBOX shapes until the art pass: tools/lamplit3.mjs lists them) ---------- */
  H.drawBack = (g, cx, cy, time) => { if (!F) return; const vw = ctx.VW();
    for (const [x, r0, r1] of F.posts) { const px = x * TS() + 8; if (px < cx - 20 || px > cx + vw + 20) continue; lpPostDraw(g, px - cx, (r0 + 1) * TS() - cy, (r1 + 1) * TS() - cy, time); }
    for (const [x, y, dir] of ctx.L().lpBrackets || []) { const px = x * TS() + 8 + dir * 7; if (px < cx - 20 || px > cx + vw + 20) continue; lpBracketDraw(g, px - cx, (y + 1) * TS() - 10 - cy, -dir); } };
  H.drawWorld = (g, cx, cy, time) => {
    if (!F) return; const vw = ctx.VW(), R = Math.round;
    for (const c of F.list) { const x = c.x * TS(), y = cyOf(c); if (x < cx - 20 || x > cx + vw + 20) continue; const X = R(x - cx), Y = R(y - cy);
      if (c.st === 'oil') { g.fillStyle = c.float ? '#14181c' : '#0e0e12'; g.fillRect(X, Y - 2, 16, 2); g.fillStyle = c.float ? '#7a6a9a' : '#5a5a72'; g.fillRect(X + ((c.x * 5) % 9), Y - 2, 4, 1); if (c.float) { g.fillStyle = '#3a6a6a'; g.fillRect(X + ((c.x * 3) % 11), Y - 1, 3, 1); } if (c.gutter) { g.fillStyle = '#2a3036'; g.fillRect(X, Y, 16, 1); } }
      else if (c.st === 'catch') { g.fillStyle = '#0e0e12'; g.fillRect(X, Y - 2, 16, 2); g.fillStyle = '#ff6b2c'; for (let i = 0; i < 16; i += 4) if ((Math.floor(time * 20) + i) % 3 === 0) g.fillRect(X + i, Y - 3, 2, 1); }
      else if (c.st === 'burn') { g.fillStyle = '#2a140a'; g.fillRect(X, Y - 1, 16, 1); const k = Math.min(1, c.t / 1.2); for (let i = 0; i < 16; i += 3) { const h = R((3 + ((Math.sin(time * 13 + (c.x * 16 + i) * 0.7) + 1) * 3)) * (0.5 + 0.5 * k)); g.fillStyle = ((c.x * 16 + i) >> 2) & 1 ? '#ff9a3c' : '#ffd36b'; g.fillRect(X + i, Y - 1 - h, 2, h); } }
      else { g.fillStyle = '#1a1614'; g.fillRect(X, Y - 1, 16, 1); } }
    for (const cs of F.casks) { const x = R(cs.pr.x - cx), y = R(cs.pr.y - cy); if (x < -30 || x > vw + 30) continue;   /* a riveted whale-oil tank on iron feet (no staves: this city's casks are iron) */
      const full = cs.st === 'full' || cs.st === 'tell', tell = cs.st === 'tell', fl = Math.floor(time * 16) % 2;
      g.fillStyle = '#16191c'; g.fillRect(x - 8, y - 2, 3, 2); g.fillRect(x + 5, y - 2, 3, 2);
      g.fillStyle = tell && fl ? '#5a2a1a' : '#2b3136'; g.fillRect(x - 9, y - 24, 18, 22); g.fillStyle = '#454e55'; g.fillRect(x - 9, y - 24, 18, 2); g.fillRect(x - 9, y - 14, 18, 1); g.fillRect(x - 9, y - 5, 18, 1);
      g.fillStyle = '#94a4ae'; for (let i = -7; i <= 7; i += 4) { g.fillRect(x + i, y - 23, 1, 1); g.fillRect(x + i, y - 13, 1, 1); }
      g.fillStyle = '#5e3622'; g.fillRect(x - 6, y - 12, 2, 5); g.fillRect(x + 3, y - 20, 2, 4);
      g.fillStyle = full ? '#0e0e12' : '#2a2a30'; g.fillRect(x - 1, y - 6, 3, 2); if (full) { g.fillStyle = '#3a3a48'; g.fillRect(x, y - 4, 1, 2 + (Math.floor(time * 3) % 2)); }
      if (tell) { const q = 1 - Math.max(0, cs.t) / CASK.tell; g.globalAlpha = 0.4 + 0.4 * fl; g.strokeStyle = '#ff6b6b'; g.setLineDash([3, 3]); g.beginPath(); g.arc(x, y - 10, CASK.burstR * (0.6 + 0.4 * q), 0, 7); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
      if (cs.st === 'empty') { g.globalAlpha = 0.5; g.fillStyle = '#0e0e12'; g.fillRect(x - 7, y - 22, 14, 6); g.globalAlpha = 1; } }
    for (const v of F.valves) { const x = R(v.pr.x - cx), y = R(v.pr.y - cy); if (x < -20 || x > vw + 20) continue; if (v.pr.spin > 0) v.pr.spin = Math.max(0, v.pr.spin - 1 / 60);   /* a brass wheel on the lamp main */
      g.fillStyle = '#2b3136'; g.fillRect(x - 2, y - 14, 4, 14); g.fillStyle = '#16191c'; g.fillRect(x - 10, y - 4, 20, 3); const a = (v.pr.spin || 0) * 12 + time * 0.2;
      g.strokeStyle = '#c9a040'; g.lineWidth = 1; g.beginPath(); g.arc(x + 0.5, y - 16.5, 6, 0, 7); g.stroke(); g.fillStyle = '#e8c870'; for (let k = 0; k < 4; k++) g.fillRect(R(x + Math.cos(a + k * 1.57) * 5), R(y - 16 + Math.sin(a + k * 1.57) * 5), 1, 1); g.fillStyle = '#7a5c1c'; g.fillRect(x - 1, y - 17, 3, 3); }
    for (const s of F.snags) if (s.st === 'catch') { const x0 = s.s.x0 * TS() - cx, y0 = s.s.y0 * TS() - cy, w = (s.s.x1 - s.s.x0 + 1) * TS(), h = (s.s.y1 - s.s.y0 + 1) * TS(); g.globalAlpha = 0.35; g.fillStyle = '#ff9a3c'; g.fillRect(R(x0), R(y0), w, h); g.globalAlpha = 1; }
    drawThrownFlame(g, F.thrown, cx, cy, time);
  };
  H.drawOver = (g, cx, cy, time) => { if (!F) return; const P = ctx.hero(); if (!P || P.dead || !(P.wick > 0) || ctx.talkBusy()) return;
    if (ctx.lamps().some(q => !q.lit && Math.abs(q.x - P.x) <= USE.lampR && P.y > q.y - 56 && P.y < q.y + 20)) return;   /* beside a dead lamp E lights it: no arc */
    CT.drawArc(g, arcFor(P), cx, cy, time, '#ffb060'); };
  H.read = () => F && { n: { ...F.n }, cells: F.list.length, burning: F.list.filter(burning).length, oil: F.list.filter(c => c.st === 'oil').length, casks: F.casks.map(c => c.st), valves: F.valves.length,
    nets: F.snags.map(s => ({ id: s.s.id, st: s.st })), thrown: F.thrown.map(f => ({ x: Math.round(f.x), y: Math.round(f.y), st: f.st })) };
  H.cellsRaw = () => F ? F.list : [];
  return H;
}
