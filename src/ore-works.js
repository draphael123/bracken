// src/ore-works.js - THE ORE ROAD'S MINOR PASS (claude/oreroadminor, Daniel 10-26: "a good level - additions only"): DARK STRETCHES, THE LAMPS YOU STRIKE, and THE COUNTERWEIGHT LIFTS.
//
//   THE SENTENCE (still the level's): A LOADED BUCKET RIDES LOW AND AN EMPTIED ONE RIDES HIGH. This pass says it again with weights you carry.
//
//   THE DARK. Three stretches of the mine go black (a dark zone: L.darkZones, the engine's own - the light is a hole in it): THE LOADING HOUSE (the yard's roofed station), THE SORTING TOWER's middle deck and the
//   STEEP LINE's span over the gorge. In a dark stretch you see only what you carry (a lamp-hand a little wider than the mine's own) and what GLINTS: every standable edge, every rope top and every skip's ore
//   shows a gold glint (a rust-red one on a rusted skip) drawn OVER the dark, and the islands that keep a lamp of their own stay lit - so the next safe footing is hinted even unlit (A6: never a blind jump).
//   THE LAMPS YOU STRIKE. A cold mine lamp hangs in each stretch. HIT IT - a blade, an ember, or an ORE ROCK thrown from where you stand - and it lights, and with it the whole stretch, FOR GOOD (a mark: it stays
//   lit through a death): the dark lifts to the mine's own, and the pit lamps along the stretch light one after another. Taught safe (the house: a blade, at chest height), tested (the tower's lamp is out of
//   reach: THROW a rock up at it) and remixed (the steep line's lamp hangs over the pillar's edge: you must light it to read the skips).
//   THE ORE ROCK (the Winchmaster's own kind, src/winch-rocks.js) is on a PILE here and there: E takes one, ATTACK throws it (the told arc, the ring closes on what it will hit), a blow drops it.
//   THE COUNTERWEIGHT LIFT. Two buckets on a pulley, drawn rope and sheave and a WEIGHT GAUGE: the high bucket takes ore, the low pan - the one you stand on - RISES by as much as the ore weighs. Fill the
//   gauge (the teaching lift wants ONE rock, the testing one TWO and a lob) and the pan lifts you to a stone pier with a purse on it; the ore tips out after the gauge runs down and the pan comes back.
// PURE but for ctx (main.js builds it). Data: L.oreWorks = { zones, lamps, heaps, lifts, glints } (src/ore-road.js buildOreRoad).
import * as CT from './carry-throw.js';
import * as OCR from './ore-carts.js';
export const OW = { reachX: 14, reachY: 16, lampW: 9, lampH: 11, pan: { w: 26, h: 6 }, bucketW: 20, bucketH: 14, rise: 34, fall: 46, ripple: 280, headlamp: 52, col: '#ffd36b', rust: '#c8583a' };
CT.addKind('orerock', CT.KINDS.orerock || { aims: { low: { vx: 115, vy: -170 }, mid: { vx: 150, vy: -265 }, high: { vx: 95, vy: -340 } }, g: 640, r: 3, ring: 10, dots: 14 });

/* THE GEOMETRY OF A LIFT, pure so the tool and the level share it. lf: { x (the pan's west edge, px), yLow (the deck the pan rests on), yHigh (the deck it rises to), aTravel (px the bucket drops while the pan rises), need, hold } */
export function liftGeom(lf) {
  const pw = OW.pan.w, ax = lf.x - 22, rimLow = lf.yLow - OW.bucketH;   /* the bucket sits on the lower deck when it is loaded down; it hangs aTravel px higher while the pan is down */
  return { yHigh: lf.yHigh, rise: lf.yLow - lf.yHigh, bx0: lf.x, bx1: lf.x + pw, ax, rimLow, rimHigh: rimLow - lf.aTravel, beamY: lf.yHigh - 46, heapX: ax - 32 };
}

export function makeOreWorks(ctx) {
  let D = null, zones = [], lamps = [], heaps = [], lifts = [], glints = [], rocks = [], ripple = [], near = null, arc = null, t = 0, told = {}, carts = [], debris = [], rollT = 0, nearCart = null;
  const W = { n: { taken: 0, thrown: 0, lit: 0, loaded: 0, rose: 0, dropped: 0, shoved: 0, rams: 0, smashed: 0, tripped: 0 } };
  const held = P => (P && P.carry && P.carry.t === 'orerock' && P.carry.ow ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - 18 });
  const bucketBox = lf => { const y = lf.rim; return { l: lf.g.ax - OW.bucketW / 2 - 1, r: lf.g.ax + OW.bucketW / 2 + 1, t: y - 2, b: y + OW.bucketH }; };
  const lampBox = lp => ({ l: lp.x - OW.lampW, r: lp.x + OW.lampW, t: lp.y - OW.lampH, b: lp.y + OW.lampH });
  const inB = (b, x, y) => x > b.l && x < b.r && y > b.t && y < b.b;
  /* what a thrown rock can strike: a cold lamp, a lift's bucket (while it can still take ore) */
  const targetAt = (x, y) => { for (const lp of lamps) if (!lp.lit && inB(lampBox(lp), x, y)) return { k: 'lamp', o: lp };
    for (const lf of lifts) if (lf.state === 'rest' && lf.load < lf.need && inB(bucketBox(lf), x, y)) return { k: 'bucket', o: lf }; return null; };
  const arcFor = (P, aim) => { const h = handAt(P), a = CT.KINDS.orerock.aims[aim];
    return CT.predictArc('orerock', h.x, h.y, { vx: (P.face || 1) * a.vx, vy: a.vy }, ctx.solidPx, { stopAt: (x, y) => targetAt(x, y) }); };
  const newRock = P => ({ t: 'orerock', thrKind: 'orerock', ow: true, state: 'held', holder: P, x: P.x, y: P.y - 18, vx: 0, vy: 0, hurtWas: P.hurt > 0, launch: PP => CT.launchOf('orerock', PP, ctx.keys ? ctx.keys() : {}) });
  const zoneOf = id => zones.find(z => z.id === id);
  const inZone = (z, x, y) => x > z.x0 && x < z.x1 && y > z.y0 && y < z.y1;

  /* THE CARTS' HANDS: the cart's box (a blade's reach is OC.hitPad past it), and what a rolling cart rams (a foe whose feet are on the rail and whose body meets the cart) */
  const cartBox = c => ({ l: c.x - OCR.OC.w / 2, r: c.x + OCR.OC.w / 2, t: c.y - OCR.OC.h - 4, b: c.y + 2 });
  const ramsFor = (c, r) => {
    if (!ctx.enemies) return 0; let k = 0;
    for (const e of ctx.enemies()) {
      if (!e.alive || (e.gone | 0) > 0 || c.rammed.has(e) || !(e.hp > 0) || Math.abs(c.v) < OCR.OC.vRam || Math.abs(e.y - c.y) > 12) continue;
      const b = ctx.box(e); if (b.r < r.l || b.l > r.r) continue;
      const dir = Math.sign(c.v) || 1; c.rammed.add(e); ctx.hurtFoe(e, OCR.OC.ram, c.x - dir * 12); e.vx = dir * 170; c.v *= OCR.OC.ramKeep; k++; W.n.rams++;
      ctx.burst(e.x, e.y - 10, 8, ['#9a9aa8', '#ffd36b', '#ff9a5c'], 90, 0.4); ctx.number(e.x, e.y - 34, 'RAMMED', '#ff9a5c'); if (ctx.sfx.clank) ctx.sfx.clank(); if (ctx.sfx.thud) ctx.sfx.thud(); ctx.shake(2);
    } return k;
  };
  W.on = () => !!(ctx.L() && ctx.L().oreWorks);
  W.data = () => ({ zones, lamps, heaps, lifts, glints, carts });
  W.held = () => !!held(ctx.P());
  W.reset = () => {
    const L = ctx.L(); D = L && L.oreWorks; rocks = []; ripple = []; near = null; arc = null; t = 0; zones = []; lamps = []; heaps = []; lifts = []; glints = [];
    for (const k of Object.keys(W.n)) W.n[k] = 0;
    { const arr = ctx.movers(); for (let i = arr.length - 1; i >= 0; i--) if (arr[i].kind === 'orecw') arr.splice(i, 1); }   /* (a respawn runs reset again: never a second pan) */
    if (!D) return;
    zones = (L.darkZones || []).filter(z => z.ow);
    /* a DIM stretch puts its own pit lamps out until its lamp is struck (the light of a pit lamp reaches through a floor: they are part of the dark) */
    for (const z of zones) { z.id = z.ow; z.lit = false; z.dark = z.darkVal; z.lamps = z.dim ? ctx.props().filter(pr => pr.t === 'minerlamp' && pr.x > z.x0 - 8 && pr.x < z.x1 + 8 && pr.y > z.y0 - 150 && pr.y < z.y1 + 16) : []; for (const pr of z.lamps) pr.lit = false; }
    lamps = D.lamps.map(d => ({ ...d, lit: false, swing: 0, hitCd: 0 }));
    /* THE CARTS (src/ore-carts.js): each one home on its rail, its barricade whole again (the cells come back from the level's own grid) */
    debris = []; rollT = 0; nearCart = null;
    carts = (D.carts || []).map(d => { const c = OCR.makeCart(d); c.pulled = 0; if (d.bar) { for (const [x, y] of d.cells) ctx.mendCell(x, y); } return c; });
    if (carts.some(c => c.bar)) ctx.resolve();
    heaps = D.heaps.map(d => ({ ...d }));
    glints = D.glints.map(d => ({ ...d }));
    lifts = D.lifts.map(d => { const g = liftGeom(d), lf = { ...d, g, load: 0, state: 'rest', holdT: 0, p: 0, rim: g.rimHigh, y: d.yLow };
      lf.m = { kind: 'orecw', x: g.bx0, y: d.yLow, w: OW.pan.w, h: OW.pan.h, dx: 0, dy: 0, lift: lf.id }; ctx.movers().push(lf.m); return lf; });
    /* lit for good: a lamp struck before stays struck (marks persist through a death) */
    for (const lp of lamps) if (ctx.marks && ctx.marks.has('orelamp:' + lp.id)) light(lp, true);
  };
  /* LIGHT A LAMP: it and its stretch, for good. quiet = a restore (no sparks, the pit lamps light at once) */
  function light(lp, quiet) {
    if (lp.lit) return; lp.lit = true; lp.swing = quiet ? 0 : 1; W.n.lit++;
    for (const q of lamps) if (q !== lp && q.zone === lp.zone && !q.lit) { q.lit = true; q.swing = quiet ? 0 : 0.6; }   /* (a stretch with a second lamp: the whole stretch lights, so both burn) */
    const z = zoneOf(lp.zone); if (z) { z.lit = true; z.dark = z.litDark; }
    if (ctx.marks) ctx.marks.add('orelamp:' + lp.id);
    if (z) for (const pr of z.lamps) if (!pr.lit) { if (quiet) pr.lit = true; else ripple.push({ pr, at: t + Math.abs(pr.x - lp.x) / OW.ripple }); }
    if (!quiet) { ctx.burst(lp.x, lp.y, 12, ['#fff6c8', '#ffd36b', '#ff9a5c'], 70, 0.6); ctx.number(lp.x, lp.y - 22, 'LIT: THE STRETCH LIGHTS FOR GOOD', OW.col); if (ctx.sfx.spark) ctx.sfx.spark(); if (ctx.sfx.clank) ctx.sfx.clank(); }
  }
  W.light = light;
  W.interact = P => {
    if (!W.on() || !P || P.dead) return false;
    const h = held(P);
    if (h) { P.carry = null; h.state = 'gone'; W.n.dropped++; ctx.burst(P.x + (P.face || 1) * 6, P.y - 4, 5, ['#7a6a50', '#b09a5a'], 40, 0.4); return true; }
    if (P.carry) return false;
    const hp = heaps.find(q => Math.abs(P.x - q.x) < OW.reachX + 8 && Math.abs(P.y - q.y) < OW.reachY); if (!hp) return false;
    const q = newRock(P); rocks.push(q); P.carry = q; W.n.taken++;
    if (ctx.sfx.stone) ctx.sfx.stone(); else if (ctx.sfx.clank) ctx.sfx.clank();
    ctx.number(P.x, P.y - 34, 'A ROCK: ATTACK THROWS IT', OW.col); return true;
  };
  function loadLift(lf, x, y) {
    lf.load = Math.min(lf.need, lf.load + 1); W.n.loaded++;
    ctx.burst(x, y, 8, ['#7a6a50', '#b09a5a', '#ffd36b'], 60, 0.5); if (ctx.sfx.clank) ctx.sfx.clank(); if (ctx.sfx.stone) ctx.sfx.stone();
    if (lf.load >= lf.need) { lf.state = 'rise'; ctx.number(lf.g.ax, lf.rim - 18, 'THE WEIGHT TAKES: THE PAN RISES', OW.col); if (ctx.sfx.heavy) ctx.sfx.heavy(); }
    else ctx.number(lf.g.ax, lf.rim - 18, 'ONE ROCK IN: ONE MORE', OW.col);
  }
  W.update = dt => {
    t += dt; const P = ctx.P(), keys = ctx.keys ? ctx.keys() : {};
    { const h0 = held(P), A = ctx.L() && ctx.L().arena; if (h0 && A && P.x > A.x0 - 40) { P.carry = null; h0.state = 'gone'; ctx.number(P.x, P.y - 34, 'THE ROCK STAYS OUTSIDE', '#9aa39a'); } }   /* (the drum house has its own rocks: src/winch-rocks.js) */
    /* the ripple of pit lamps catching */
    for (const r of ripple) if (t >= r.at && !r.done) { r.done = true; r.pr.lit = true; ctx.burst(r.pr.x, r.pr.y - 8, 5, ['#ffd36b', '#fff6c8'], 40, 0.4); }
    ripple = ripple.filter(r => !r.done);
    /* the lamps: struck by a blade, an ember */
    for (const lp of lamps) { lp.swing = Math.max(0, lp.swing - dt * 0.9); lp.hitCd = Math.max(0, lp.hitCd - dt); if (lp.lit || !P || P.dead) continue;
      const hb = ctx.attackBox(), b = lampBox(lp), struck = hb && !P.plunge && hb.r > b.l && hb.l < b.r && hb.b > b.t && hb.t < b.b;
      const emb = (ctx.embers ? ctx.embers() : []).find(e => Math.abs(e.x - lp.x) < 14 && Math.abs(e.y - lp.y) < 16);
      const jb = ctx.jetBox ? ctx.jetBox() : null, jet = !!jb && jb.r > b.l && jb.l < b.r && jb.b > b.t && jb.t < b.b;   /* the pyromancer's flame jet */
      const ar = (P.rgArrows || []).find(a => a.state === 'fly' && Math.abs(a.x - lp.x) < OW.lampW + 5 && Math.abs(a.y - lp.y) < OW.lampH + 5);   /* the ranger's arrow in flight */
      if (struck || emb || jet || ar) { if (emb) emb.life = 0; if (ar) { ar.state = 'drop'; ar.vx = 0; ar.vy = -40; } light(lp); } }
    /* the rocks */
    for (const q of rocks) {
      if (q.state === 'held') { const H = q.holder;
        if (!H || H.dead || H.carry !== q) { if (H && H.carry === q) H.carry = null; q.state = 'gone'; continue; }
        const h = handAt(H); q.x = h.x; q.y = h.y;
        if (H.hurt > 0 && !q.hurtWas) { H.carry = null; q.state = 'gone'; W.n.dropped++; ctx.number(H.x, H.y - 34, 'A BLOW: YOU DROP THE ROCK', '#ff9a5c'); ctx.burst(H.x, H.y - 6, 6, ['#7a6a50', '#b09a5a'], 50, 0.5); continue; }
        q.hurtWas = H.hurt > 0; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = true; W.n.thrown++; } q.holder = null;
        const k = CT.KINDS.orerock, px = q.x, py = q.y; CT.stepArc(q, dt, k.g);
        const hit = targetAt(q.x, q.y);
        if (hit) { q.state = 'gone'; if (hit.k === 'lamp') { ctx.burst(q.x, q.y, 6, ['#7a6a50', '#b09a5a'], 50, 0.4); light(hit.o); } else loadLift(hit.o, q.x, q.y); continue; }
        if (ctx.solidPx(q.x + Math.sign(q.vx) * k.r, py, false) && !ctx.solidPx(px, py, false)) { q.state = 'gone'; ctx.burst(px, py, 6, ['#7a6a50', '#b09a5a', '#3a3440'], 60, 0.5); if (ctx.sfx.stone) ctx.sfx.stone(); continue; }
        if (q.vy < 0 && ctx.solidPx(q.x, q.y - k.r, false)) q.vy = 0;
        if (q.vy >= 0 && ctx.solidPx(q.x, q.y + k.r, true)) { q.state = 'gone'; ctx.burst(q.x, q.y, 6, ['#7a6a50', '#b09a5a', '#3a3440'], 60, 0.5); if (ctx.sfx.stone) ctx.sfx.stone(); continue; }
        q.t0 = (q.t0 || 0) + dt; if (q.t0 > 4) q.state = 'gone'; continue; }
    }
    rocks = rocks.filter(q => q.state !== 'gone');
    /* THE CARTS: a blade shoves one (it rolls away from you), it rams what stands on its rail, breaks a barricade with speed enough, and at the line's end trips a chain; never a floor, never a ride */
    nearCart = null; rollT -= dt; let rolling = false;
    for (const c of carts) {
      const hb = ctx.attackBox();
      if (hb && P && !P.dead && !P.plunge && !P.hitSet.has(c)) { const bx = cartBox(c), pad = OCR.OC.hitPad;
        if (hb.r > bx.l - pad && hb.l < bx.r + pad && hb.b > bx.t && hb.t < bx.b) { P.hitSet.add(c);
          const dir = Math.sign(c.x - P.x) || (P.face || 1), how = OCR.shove(c, dir, P.vx || 0); W.n.shoved++;
          ctx.burst(c.x - dir * 9, c.y - 4, 7, ['#9a9aa8', '#ffd36b', '#fff6c8'], 80, 0.35); if (ctx.sfx.clank) ctx.sfx.clank(); if (how === 'launch' && ctx.sfx.screech) ctx.sfx.screech();
          ctx.number(c.x, c.y - 32, how === 'launch' ? 'ROLLING' : 'FASTER', OW.col); } }
      const ev = OCR.stepCart(c, dt, ramsFor);
      if (c.st === 'roll' && Math.abs(c.v) > 40) { rolling = true; if (Math.random() < dt * 16) ctx.burst(c.x - Math.sign(c.v) * 10, c.y - 1, 1, ['#9a9aa8', '#ffd36b'], 30, 0.25); }
      for (const e of ev) {
        if (e === 'smash') { const r = c.bar, dir = Math.sign(c.v) || 1; for (const [x, y] of c.cells) ctx.openCell(x, y); ctx.resolve(); if (ctx.art) ctx.art.spawnDebris(debris, r, dir); W.n.smashed++;
          ctx.burst((r.l + r.r) / 2, (r.t + r.b) / 2, 18, ['#7a5632', '#c8a266', '#fff6c8', '#9a9aa8'], 130, 0.6); ctx.number((r.l + r.r) / 2, r.t - 10, 'THE BARRICADE BREAKS', OW.col); ctx.shake(4); if (ctx.sfx.stone) ctx.sfx.stone(); if (ctx.sfx.thud) ctx.sfx.thud(); if (ctx.sfx.heavy) ctx.sfx.heavy(); }
        else if (e === 'bump') { ctx.number(c.x, c.y - 32, 'TOO SLOW: BACK UP AND SHOVE IT', '#ff9a5c'); if (ctx.sfx.thud) ctx.sfx.thud(); ctx.shake(1); }
        else if (e === 'end') { ctx.burst(c.x + (c.v >= 0 ? 1 : -1) * 10, c.y - 4, 8, ['#ffd36b', '#fff6c8', '#9a9aa8'], 90, 0.35); if (ctx.sfx.clank) ctx.sfx.clank(); if (ctx.sfx.screech) ctx.sfx.screech(); }
        else if (e === 'trip') { W.n.tripped++; const lp = lamps.find(q => q.id === c.trip.lamp); ctx.number(c.x, c.y - 44, 'THE CHAIN PULLS', OW.col); if (ctx.sfx.heavy) ctx.sfx.heavy(); if (lp) light(lp); }
      }
      c.pulled = c.tripped ? Math.min(1, (c.pulled || 0) + dt * 3) : 0;
      if (P && !P.dead && c.st === 'rest' && W.n.shoved < 1 && Math.abs(P.x - c.x) < 110 && Math.abs(P.y - c.y) < 40) nearCart = c;
    }
    if (rolling && rollT <= 0 && ctx.sfx.cartRoll) { ctx.sfx.cartRoll(); rollT = 0.17; }
    if (ctx.art && debris.length) debris = ctx.art.stepDebris(debris, dt);
    /* the lifts: ore in, the pan up, held while the gauge runs down, then the ore tips out and the pan comes home */
    for (const lf of lifts) { const oy = lf.m.y, travel = lf.g.rise;
      if (lf.state === 'rise') { lf.m.y = Math.max(lf.g.yHigh, lf.m.y - OW.rise * dt); if (lf.m.y <= lf.g.yHigh) { lf.state = 'top'; lf.holdT = lf.hold; W.n.rose++; } }
      else if (lf.state === 'top') { lf.holdT -= dt; if (lf.holdT <= 0) { lf.state = 'fall'; lf.load = 0; ctx.number(lf.g.ax, lf.g.rimLow - 6, 'THE ORE TIPS OUT: THE PAN COMES DOWN', '#ff9a5c'); ctx.burst(lf.g.ax, lf.g.rimLow, 10, ['#7a6a50', '#b09a5a', '#3a3440'], 70, 0.6); if (ctx.sfx.stone) ctx.sfx.stone(); } }
      else if (lf.state === 'fall') { lf.m.y = Math.min(lf.yLow, lf.m.y + OW.fall * dt); if (lf.m.y >= lf.yLow) lf.state = 'rest'; }
      /* a hero standing on the pan where it rests is carried: the engine's mover landing only catches a hero who is FALLING onto one, and the floor already holds this one */
      if (P && !P.dead && P.ground && !P.onMover && lf.state !== 'rest' && P.x + 4 > lf.m.x && P.x - 4 < lf.m.x + lf.m.w && Math.abs(P.y - oy) < 3) P.onMover = lf.m;
      lf.m.dy = lf.m.y - oy; lf.p = (lf.yLow - lf.m.y) / travel; lf.rim = lf.g.rimHigh + lf.p * lf.aTravel;
      if (lf.m.dy < 0 && Math.random() < dt * 10) ctx.burst(lf.m.x + Math.random() * lf.m.w, lf.m.y + 6, 1, ['#8a919c'], 20, 0.3); }
    near = null;
    if (P && !P.dead && !P.carry) near = heaps.find(q => Math.abs(P.x - q.x) < OW.reachX + 8 && Math.abs(P.y - q.y) < OW.reachY) || null;
    arc = held(P) && !P.dead ? arcFor(P, CT.aimOf('orerock', P.face || 1, keys).aim) : null;
  };
  /* THE DARK'S HOLES (main.js's dark pass): what you carry in a stretch, a cold lamp's ember, the piles, a lit lamp's pool, and the glints */
  W.holes = (hole, cx, cy) => {
    const P = ctx.P(), VW = ctx.VW(); if (!D) return;
    for (const z of zones) { if (z.x1 < cx - 60 || z.x0 > cx + VW + 60) continue;
      if (!z.lit && P && !P.dead && inZone(z, P.x, P.y)) hole(P.x - cx, P.y - 8 - cy, OW.headlamp, 0.8); }
    for (const lp of lamps) { if (lp.x < cx - 140 || lp.x > cx + VW + 140) continue; hole(lp.x - cx, lp.y - cy, lp.lit ? 118 : 18, lp.lit ? 1 : 0.55); }
    for (const c of carts) { if (c.x < cx - 80 || c.x > cx + VW + 80) continue; hole(c.x - cx, c.y - 12 - cy, 30, 0.75);   /* a cart carries its own lantern */
      if (c.bar && !c.broken) hole((c.bar.l + c.bar.r) / 2 - cx, (c.bar.t + c.bar.b) / 2 - cy, 26, 0.55); if (c.trip) hole(c.trip.x - cx, c.y - 10 - cy, 20, 0.55); }
    for (const q of heaps) if (q.x > cx - 40 && q.x < cx + VW + 40) hole(q.x - cx, q.y - 8 - cy, 26, 0.7);
    for (const lf of lifts) if (lf.g.ax > cx - 80 && lf.g.ax < cx + VW + 80) { hole(lf.g.ax - cx, lf.rim + 6 - cy, 26, 0.7); hole(lf.m.x + lf.m.w / 2 - cx, lf.m.y - cy, 22, 0.6); }
    for (const g of glints) { const z = zoneOf(g.zone); if (z && !z.lit && g.x > cx - 20 && g.x < cx + VW + 20) hole(g.x - cx, g.y - 2 - cy, 14, 0.5); }
    for (const m of ctx.movers()) if (m.kind === 'bucket' && m.vis && m.x > cx - 40 && m.x < cx + VW + 40) { const z = zones.find(q => !q.lit && m.x > q.x0 && m.x < q.x1); if (z) hole(m.x + m.w / 2 - cx, m.y + 4 - cy, 24, 0.65); }
  };
  /* ---------- THE LOOK ---------- */
  const R = Math.round;
  function drawLamp(g, lp, cx, cy, time) {
    const x = R(lp.x - cx), top = R(lp.top - cy), sw = Math.sin(time * 3.1 + lp.x) * (lp.swing * 3 + (lp.lit ? 0.4 : 0.15)), y = R(lp.y - cy), bx = R(x + sw * 0.6);
    g.fillStyle = '#1b1622'; g.fillRect(x - 3, top - 1, 7, 3); g.fillStyle = '#5a6270'; g.fillRect(x - 2, top, 5, 1); g.fillStyle = '#8a919c'; g.fillRect(x - 2, top, 5, 1);   /* the hook plate it hangs from */
    for (let yy = top + 2, k = 0; yy < y - 9; yy += 3, k++) { const cxk = R(x + sw * ((yy - top) / Math.max(8, y - top)) * 0.6); g.fillStyle = '#1b1622'; g.fillRect(cxk - 1, yy, 3, 3); g.fillStyle = k % 2 ? '#6a7280' : '#9aa3b0'; g.fillRect(cxk, yy, 1, 2); }   /* the chain */
    g.fillStyle = '#1b1622'; g.fillRect(bx - 6, y - 11, 13, 22);                                                   /* the cage: outline */
    g.fillStyle = '#3a4048'; g.fillRect(bx - 5, y - 10, 11, 3); g.fillRect(bx - 5, y + 7, 11, 3); g.fillStyle = '#6a7280'; g.fillRect(bx - 5, y - 10, 11, 1); g.fillRect(bx - 5, y + 7, 11, 1);   /* the caps */
    if (lp.lit) { g.fillStyle = '#7a3a18'; g.fillRect(bx - 4, y - 7, 9, 14); g.fillStyle = '#ff9a5c'; g.fillRect(bx - 4, y - 5, 9, 12); g.fillStyle = '#ffd36b'; g.fillRect(bx - 3, y - 6, 7, 11); g.fillStyle = '#fff6c8'; const f = Math.floor(time * 11 + lp.x) % 3; g.fillRect(bx - 1, y - 5 - (f === 0 ? 1 : 0), 3, 7 + (f === 0 ? 1 : 0)); }
    else { g.fillStyle = '#0c0a10'; g.fillRect(bx - 4, y - 7, 9, 14); g.fillStyle = '#1c1820'; g.fillRect(bx - 4, y - 7, 2, 14); const em = 0.5 + 0.5 * Math.sin(time * 1.7 + lp.x * 0.1); g.fillStyle = em > 0.55 ? '#6a3a22' : '#3a2418'; g.fillRect(bx, y + 2, 1, 2); g.fillStyle = '#2a2830'; g.fillRect(bx - 5, y - 3, 1, 9); }   /* sooted glass, one dull ember */
    g.fillStyle = '#4a525c'; for (const dx of [-5, 0, 5]) g.fillRect(bx + dx, y - 7, 1, 14);                      /* the bars */
    g.fillStyle = '#1b1622'; g.fillRect(bx - 1, y + 11, 3, 2);
  }
  function drawHeap(g, q, cx, cy, time, nearIt) {
    const x = R(q.x - cx), y = R(q.y - cy);
    g.fillStyle = '#1b1622'; g.fillRect(x - 11, y - 8, 23, 9); g.fillRect(x - 8, y - 12, 15, 5); g.fillStyle = '#5e5040'; g.fillRect(x - 10, y - 7, 21, 7); g.fillRect(x - 7, y - 11, 13, 5);
    g.fillStyle = '#7a6a50'; g.fillRect(x - 10, y - 7, 19, 5); g.fillRect(x - 7, y - 11, 11, 4); g.fillStyle = '#a8925a'; g.fillRect(x - 7, y - 11, 11, 1); g.fillRect(x - 10, y - 7, 6, 1); g.fillRect(x + 1, y - 6, 7, 1);
    g.fillStyle = '#35291f'; g.fillRect(x - 3, y - 7, 1, 7); g.fillRect(x + 4, y - 5, 1, 5);
    g.fillStyle = '#c8a24a'; for (const [dx, dy] of [[-6, -5], [-1, -9], [5, -4], [2, -2], [-8, -2]]) g.fillRect(x + dx, y + dy, 1, 1);
    if ((Math.floor(time * 2.5 + q.x) % 3) === 0) { g.fillStyle = '#ffe9a0'; g.fillRect(x + 2, y - 9, 1, 1); }
    g.fillStyle = '#1b1622'; g.fillRect(x + 7, y - 4, 4, 5); g.fillStyle = '#8a919c'; g.fillRect(x + 8, y - 3, 2, 3);   /* a shovel-plate */
    if (nearIt && ctx.text) ctx.text('E: A ROCK', x, y - 20, OW.col, 'center');
  }
  function drawLift(g, lf, cx, cy, time) {
    const G = lf.g, mx = R(lf.m.x - cx), my = R(lf.m.y - cy), ax = R(G.ax - cx), beam = R(G.beamY - cy), post = R(G.bx1 - cx) + 6, topY = R(G.yHigh - cy);
    if (ax < -60 || ax > ctx.VW() + 120) return;
    const iron = (x, y, w, h) => { g.fillStyle = '#1b1622'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#4a525c'; g.fillRect(x, y, w, h); g.fillStyle = '#8a919c'; g.fillRect(x, y, w, 1); g.fillStyle = '#2e333a'; g.fillRect(x, y + h - 1, w, 1); };
    iron(post - 2, beam - 8, 5, topY - beam + 8);                                                            /* the post up from the pier */
    for (let k = 0; k < 4; k++) { g.fillStyle = '#6a7280'; g.fillRect(post - 3 + k * 1, beam + 4 + k * 4, 2, 2); }   /* its brace */
    iron(ax - 10, beam - 3, post - ax + 14, 5);                                                              /* the beam over both */
    g.fillStyle = '#e6dba8'; for (let x = ax - 8; x < post; x += 12) g.fillRect(x, beam - 1, 1, 1);          /* rivets */
    const wheel = (x) => { g.fillStyle = '#1b1622'; g.fillRect(x - 5, beam - 2, 11, 11); g.fillStyle = '#5a6270'; g.fillRect(x - 4, beam - 1, 9, 9); g.fillStyle = '#9aa3b0'; g.fillRect(x - 4, beam - 1, 9, 1); g.fillStyle = '#1b1622'; g.fillRect(x - 1, beam + 2, 3, 3); const a = (lf.p * 9 + time * 0.0) % 1; g.fillStyle = '#d8b04a'; g.fillRect(x + R(Math.cos(a * 6.28) * 3), beam + 3 + R(Math.sin(a * 6.28) * 3), 1, 1); };
    const bxC = mx + OW.pan.w / 2; wheel(ax); wheel(bxC);
    g.fillStyle = '#3a2a22'; g.fillRect(ax, beam + 8, bxC - ax, 1); g.fillStyle = '#6a4a34'; g.fillRect(ax, beam + 8, bxC - ax, 1);   /* the rope over the sheaves */
    const rope = (x, y0, y1) => { for (let y = y0; y < y1; y += 2) { g.fillStyle = (y >> 1) % 2 ? '#6a4a34' : '#4a3626'; g.fillRect(x, y, 1, 2); } };
    rope(ax, beam + 9, R(lf.rim - cy));                                                                       /* down to the bucket */
    rope(mx + 2, beam + 9, my); rope(mx + OW.pan.w - 3, beam + 9, my); g.fillStyle = '#d8b04a'; g.fillRect(bxC - 1, beam + 8, 3, 2);   /* and to the pan, by two hangers off a brass ring */
    /* the bucket (the high one takes the ore) */
    const by = R(lf.rim - cy), bw = OW.bucketW;
    g.fillStyle = '#1b1622'; g.fillRect(ax - bw / 2 - 1, by - 3, bw + 2, OW.bucketH + 4); g.fillStyle = '#5a6270'; g.fillRect(ax - bw / 2, by, bw, OW.bucketH - 1); g.fillStyle = '#3a4048'; g.fillRect(ax - bw / 2 + 2, by + 3, bw - 4, OW.bucketH - 5); g.fillStyle = '#8a919c'; g.fillRect(ax - bw / 2, by, bw, 1);
    g.fillStyle = '#7a6a50'; const heap = lf.load; if (heap > 0) { g.fillRect(ax - bw / 2 + 2, by - 3, bw - 4, 4); g.fillStyle = '#a8925a'; g.fillRect(ax - bw / 2 + 2, by - 3, bw - 4, 1); g.fillStyle = '#ffd36b'; g.fillRect(ax - 2, by - 2, 1, 1); g.fillRect(ax + 3, by - 1, 1, 1); }
    g.fillStyle = '#e6dba8'; g.fillRect(ax - bw / 2 + 1, by + 1, 1, 1); g.fillRect(ax + bw / 2 - 2, by + 1, 1, 1);
    g.fillStyle = '#c8583a'; g.fillRect(ax - 3, by + 6, 6, 2);                                                 /* a painted weight band */
    /* the pan (the low one is the floor you stand on) */
    g.fillStyle = '#1b1622'; g.fillRect(mx - 1, my - 1, OW.pan.w + 2, OW.pan.h + 3); g.fillStyle = '#4a525c'; g.fillRect(mx, my, OW.pan.w, OW.pan.h); g.fillStyle = '#9aa3b0'; g.fillRect(mx, my, OW.pan.w, 1); g.fillStyle = '#2e333a'; g.fillRect(mx, my + OW.pan.h - 1, OW.pan.w, 1);
    g.fillStyle = '#ffd36b'; for (let x = mx + 3; x < mx + OW.pan.w - 2; x += 5) g.fillRect(x, my + 2, 2, 1);   /* hazard studs along its lip: step on, step off */
    /* THE WEIGHT GAUGE: a glass tube on the post, one pip a rock, filling; once the pan is up the gold runs down it as the hold runs out */
    const gx = post + 5, gy = topY - 34, gh = 28;
    g.fillStyle = '#1b1622'; g.fillRect(gx - 2, gy - 2, 8, gh + 4); g.fillStyle = '#0c0a10'; g.fillRect(gx - 1, gy - 1, 6, gh + 2); g.fillStyle = '#3a4048'; g.fillRect(gx, gy, 4, gh);
    const fill = lf.state === 'top' || lf.state === 'rise' ? (lf.state === 'top' ? lf.holdT / lf.hold : 1) : lf.load / lf.need, fh = R(gh * fill);
    g.fillStyle = lf.state === 'top' ? '#9ad0ff' : '#ffd36b'; g.fillRect(gx, gy + gh - fh, 4, fh); g.fillStyle = '#fff6c8'; g.fillRect(gx, gy + gh - fh, 1, fh);
    g.fillStyle = '#1b1622'; for (let k = 1; k < lf.need; k++) g.fillRect(gx - 1, gy + gh - R(gh * k / lf.need), 6, 1);
    g.fillStyle = '#d8b04a'; g.fillRect(gx - 2, gy - 3, 8, 1); g.fillStyle = '#c8583a'; g.fillRect(gx - 2, gy + gh + 2, 8, 1);   /* brass cap, red foot */
    if (lf.state === 'rest' && lf.load === 0 && ctx.text) ctx.text('ORE', ax, beam - 8, '#8a919c', 'center');
  }
  W.drawWorld = (g, cx, cy, time) => {
    if (!D) return; const VW = ctx.VW();
    if (ctx.art) for (const c of carts) { if (c.x1 < cx - 60 || c.x0 > cx + VW + 60) continue;
      const open = c.bar && c.broken, endX = c.bar ? (open ? c.ext : c.bar.l) : c.x1;
      ctx.art.drawRail(g, c, cx, cy, time, endX, !c.bar || open);
      if (c.trip) { const lp = lamps.find(q => q.id === c.trip.lamp); if (lp) ctx.art.drawTrip(g, c.trip.x, c.y, lp.y + 11, cx, cy, time, c.pulled || 0); }
      if (c.bar && !c.broken) ctx.art.drawBarricade(g, c.bar, cx, cy, time, c.st === 'roll');
      ctx.art.drawCart(g, c, cx, cy, time, true); }
    if (ctx.art && debris.length) ctx.art.drawDebris(g, debris, cx, cy);
    for (const lf of lifts) drawLift(g, lf, cx, cy, time);
    for (const q of heaps) if (q.x > cx - 40 && q.x < cx + VW + 40) drawHeap(g, q, cx, cy, time, near === q);
    for (const lp of lamps) if (lp.x > cx - 40 && lp.x < cx + VW + 40) drawLamp(g, lp, cx, cy, time);
    for (const q of rocks) { const x = R(q.x - cx), y = R(q.y - cy);
      g.fillStyle = '#2a2430'; g.fillRect(x - 4, y - 4, 8, 7); g.fillStyle = '#7a6a50'; g.fillRect(x - 3, y - 3, 6, 5); g.fillStyle = '#b09a5a'; g.fillRect(x - 3, y - 3, 6, 1); g.fillStyle = '#ffd36b'; g.fillRect(x + 1, y - 1, 1, 1); }
  };
  /* OVER THE DARK: the glints (every standable edge, rope top and skip's ore), a cold lamp's ember, the told arc, and a lit lamp's warm pool */
  W.drawOver = (g, cx, cy, time) => {
    if (!D) return; const VW = ctx.VW(), P = ctx.P();
    for (const gl of glints) { const z = zoneOf(gl.zone); if (!z || z.lit || gl.x < cx - 10 || gl.x > cx + VW + 10) continue;
      const k = 0.5 + 0.5 * Math.sin(time * 2.6 + gl.x * 0.37), x = R(gl.x - cx), y = R(gl.y - cy); g.globalAlpha = 0.45 + 0.5 * k; g.fillStyle = gl.rope ? '#e6dba8' : '#ffd36b'; g.fillRect(x, y - 1, 1, 1); if (k > 0.55) { g.fillRect(x - 1, y - 1, 3, 1); g.fillRect(x, y - 2, 1, 3); } g.globalAlpha = 1; }
    for (const m of ctx.movers()) if (m.kind === 'bucket' && m.vis && m.x > cx - 30 && m.x < cx + VW + 30) { const z = zones.find(q => !q.lit && m.x > q.x0 && m.x < q.x1); if (!z) continue;
      const k = 0.5 + 0.5 * Math.sin(time * 3 + m.x * 0.05), x = R(m.x + m.w / 2 - cx), y = R(m.y - cy); g.globalAlpha = 0.5 + 0.45 * k; g.fillStyle = m.cracked ? OW.rust : '#ffd36b';
      g.fillRect(x - 2, y - 3, 1, 1); g.fillRect(x + 2, y - 4, 1, 1); g.fillRect(x, y - 2, 1, 1); if (k > 0.5) { g.fillRect(x - 1, y - 3, 3, 1); g.fillRect(x, y - 4, 1, 3); } g.globalAlpha = 1; }
    for (const lp of lamps) { if (lp.x < cx - 60 || lp.x > cx + VW + 60) continue; const x = R(lp.x - cx), y = R(lp.y - cy);
      if (lp.lit) { const gr = g.createRadialGradient(x, y, 2, x, y, 70); gr.addColorStop(0, 'rgba(255,214,130,0.22)'); gr.addColorStop(1, 'rgba(255,214,130,0)'); g.fillStyle = gr; g.fillRect(x - 70, y - 70, 140, 140); }
      else { const k = 0.5 + 0.5 * Math.sin(time * 1.7 + lp.x * 0.1); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#ff9a5c'; g.fillRect(x, y + 2, 2, 2); g.globalAlpha = 1; } }
    if (arc) CT.drawArc(g, arc, cx, cy, time, arc.land && arc.land.hit ? '#ffd36b' : '#c8ccd4');
    if (nearCart && ctx.text) ctx.text('ATTACK: SHOVE THE CART', R(nearCart.x - cx), R(nearCart.y - cy) - 34, OW.col, 'center');
    if (P && !P.dead) for (const lp of lamps) if (!lp.lit && Math.abs(P.x - lp.x) < 70 && Math.abs(P.y - lp.y) < 90 && ctx.text) ctx.text(lp.trip ? 'A COLD LAMP: SHOVE THE CART' : 'A COLD LAMP: STRIKE IT', R(lp.x - cx), R(lp.y - cy) - 24, OW.col, 'center');
  };
  return W;
}
