// src/kitchen-hands.js - THE KITCHEN GATE: the level's rule and machines (claude/kitchengate, the OPUS GREYBOX, 2026-10-25; concept scratch/concept-kitchengate.md).
// src/kitchen-gate.js builds the level; this binds it to the game. main.js owns the world and calls:
//   reset (spawnEntities), update, strike (a hero's blow: the bellows), mover (a great spit's spits, every frame - updateMovers), butcher (THE BUTCHER's frame: his own
//   machine), takeFoe (a blow on the butcher: x2 while he burns), props (the guide's), hoist / read (tools, the pilot bot), drawWorld (the fires and their gauges, the
//   bellows, the coppers and their steam, the great spits, the grease trails and the tallow doors, the grease floors, the great pot's fire, the recipe pages and the
//   spice vault's grate, the area banner), butcherOver (his apron, his cleaver, his flames).
// THE RULE (L.rule): STRIKE A BELLOWS AND ITS FIRE ROARS: THE SPIT OVER IT TURNS, THE COPPER ON IT STEAMS, THE GREASE BY IT BURNS.
//   A FIRE (L.kgFires) is banked: embers. Its BELLOWS (L.hoists, the cleat shape) takes a blow: the fire ROARS for K.roar s - the heat gauge over the bellows drains as it
//   burns down (the rule's state, drawn where you stand) - and while it roars it works what it serves:
//     a COPPER (L.kgPots) steams: a column from its mouth to `top` that lifts whoever stands in it (K.lift)
//     THE GREAT SPIT (L.kgWheels) turns: four spits round a hub over the fire pit, a full turn in WHEEL.period s; it stops where it is when the fire dies
//     a GREASE TRAIL (L.kgTrails) catches: the flame runs along it (K.trailV px/s), burning whatever stands on it (a hero K.burnDmg a beat; a cook; THE BUTCHER - he
//       burns: STUNNED, and a blade takes him double), and a TALLOW DOOR at its end MELTS (gone for the attempt). A trail with no door greases back over (K.regrease s).
//   THE OVERTURNED POT (L.kgRace): past its trigger the cook tips the great grease pot (told: !! and the line) and the floor burns from the pot east at race.v px/s; the
//     flame burns race.behind s behind its front, then goes out. A death lays it again.
//   THE RECIPE PAGES (L.kgPages): picked up on a touch; all three open THE SPICE VAULT's grate (L.kgVault). They stay picked up through a death.
// THE BUTCHER (the level's ONE new foe, e.t 'butcher'): a goblin cook the size of a door with a cleaver and a bloody apron. TWO TOLD BLOWS, each its own pose: THE CLEAVER
//   (raised high, a red !!, no shield turns it: step back) and THE HACK (cocked low, a yellow !, the shield holds it). His cleaver is heavy: ON GREASE the chop's weight
//   SLIDES him on past you (his back is yours a breath). BURNING GREASE stops him dead: STUNNED in the flames, blades x2.
// Every capital line it says goes through ctx.number with a line listed here (KG_SAY) and in src/hint-lines.js.
import { WHEEL } from './kitchen-gate.js';
import * as KA from './redraw/kitchen_art.js';   /* (claude/kitchengateart) the machines, the butcher's sheet, the halls */
export const K = { roar: 8, restoke: 0.6, lift: 240, colW: 13, trailV: 150, burnFor: 2.6, burnDmg: 9, burnEvery: 0.5, foeBurn: 14, melt: 0.9, regrease: 5, pageR: 14,
  butcher: { hp: 64, speed: 24, near: 210, reach: 34, chopTell: 0.85, chop: 24, chopRest: 1.15, hackTell: 0.55, hack: 15, hackRest: 0.6, slide: 130, burn: 2.6, burnMul: 2 } };
export const KG_SAY = {
  roar: 'THE FIRE ROARS', steam: 'THE COPPER STEAMS: STAND IN IT', turns: 'THE GREAT SPIT TURNS', dies: 'THE FIRE DIES DOWN', catches: 'THE GREASE CATCHES: OFF THE TRAIL',
  melts: 'THE TALLOW DOOR MELTS', race: 'THE GREASE POT GOES OVER: RUN!', page: 'A RECIPE PAGE', vault: 'THE SPICE VAULT OPENS', burns: 'HE BURNS', slides: 'HE SLIDES ON THE GREASE',
  bellows: 'STRIKE THE BELLOWS', regrease: 'THE GREASE RUNS BACK', cleaver: 'THE CLEAVER: STEP BACK',
};
/* a spit's place on its wheel at angle a: { x (its middle), y (its top) } */
export const spitAt = (w, a) => ({ x: w.x + Math.cos(a) * WHEEL.R, y: w.y + Math.sin(a) * WHEEL.R });
export const spitAngle = (w, ang, k) => ang + k * Math.PI * 2 / WHEEL.n;
/* THE BUTCHER's skin (greybox): the club goblin's frames, gone a meaty red-brown (his apron and cleaver are drawn over him: butcherOver) - main.js SPR.butcher */
export function bakeButcherSet() { return KA.bakeButcher(); }   /* (claude/kitchengateart) his own seven frames: idle, walk x2, raise, slam, wind, sweep */
export const butcherFrameOf = KA.butcherFrameOf;

export function makeKitchenHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().kitchen);
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, KG_SAY[k], col);
  const once = k => { if (S.said.has(k)) return false; S.said.add(k); return true; };
  const sfx = (...ks) => { for (const k of ks) { const f = ctx.sfx && ctx.sfx[k]; if (f) { try { f(); } catch {} return; } } };
  const clearCells = d => { for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) ctx.cellSet(x, y, ctx.T.AIR); };
  const roaring = f => !!f && f.roarT > 0;

  /* ---------- RESET (every load and every respawn: the grid was laid again, the foes spawned again) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.kitchen) { S = null; return; }
    const keep = S && S.L === lv ? S : null;
    const fires = new Map(), wheels = new Map(), trails = new Map(), doors = new Map();
    for (const d of lv.kgFires || []) fires.set(d.id, { d, roarT: 0, pump: 0 });
    for (const d of lv.kgWheels || []) wheels.set(d.id, { d, ang: d.rest });
    for (const d of lv.kgDoors || []) { const was = keep && keep.doors.get(d.id), gone = was && was.state === 'gone'; doors.set(d.id, { d, state: gone ? 'gone' : 'whole', t: 0 }); if (gone) clearCells(d); }
    for (const d of lv.kgTrails || []) { const dr = d.door ? doors.get(d.door) : null; trails.set(d.id, { d, state: dr && dr.state === 'gone' ? 'burnt' : 'raw', front: 0, t: 0, beat: 0 }); }
    const pages = keep ? keep.pages : new Set(), vaultOpen = keep ? keep.vaultOpen : false;
    if (vaultOpen && lv.kgVault) clearCells(lv.kgVault);
    S = { L: lv, fires, wheels, trails, doors, pages, vaultOpen, said: keep ? keep.said : new Set(), sec: -1, banner: null, race: { state: 'armed', front: 0, t: 0 }, burnKey: new Map(),
      n: keep ? keep.n : { stokes: 0, lifts: 0, rides: 0, burns: 0, melts: 0, foeBurns: 0, races: 0, raceHits: 0, pages: 0, butcherSlides: 0, butcherBurns: 0 } };
  };

  /* ---------- A BLOW ON A BELLOWS: the fire roars ---------- */
  function stoke(f, by) {
    if (!f || f.roarT > K.roar - K.restoke) return false;
    const was = f.roarT > 0; f.roarT = K.roar; f.pump = 0.5; S.n.stokes++;
    const x = f.d.bx * TS + 8, y = (f.d.by + 1) * TS; sfx('puff', 'whoosh'); sfx('charge', 'tell'); ctx.burst(f.d.fx * TS + 8, f.d.f * TS - 6, 12, ['#ffd36b', '#ff9a3c', '#fff6c8'], 90, 0.5);
    if (!was) { if (once('roar')) say(x, y - 44, 'roar', '#ff9a5c');
      if (f.d.pots.length && once('steam')) say(x, y - 30, 'steam'); if (f.d.wheels.length && once('turns')) say(x, y - 30, 'turns'); }
    return true;
  }
  H.stoke = id => { const f = S && S.fires.get(id); return f ? stoke(f, null) : false; };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!S) return; const lv = L(), ps = ctx.players(), P = ps[0];
    for (const f of S.fires.values()) { if (f.roarT > 0) { f.roarT = Math.max(0, f.roarT - dt); if (f.roarT === 0) sfx('puff'); } f.pump = Math.max(0, f.pump - dt); }
    /* THE GREAT SPITS turn while their fire roars */
    for (const w of S.wheels.values()) if (roaring(S.fires.get(w.d.fire))) w.ang -= dt * Math.PI * 2 / WHEEL.period;
    /* THE COPPERS' STEAM lifts */
    for (const pd of lv.kgPots || []) { if (!roaring(S.fires.get(pd.fire))) continue; const x = pd.x * TS + 8, bot = pd.f * TS + 2, top = pd.top * TS;
      for (const p of ps) { if (!p || p.dead || p.zip) continue; if (Math.abs(p.x - x) < K.colW && p.y <= bot && p.y > top) { if (p.ground) S.n.lifts++; ctx.asPlayer(p, () => { p.vy = Math.min(p.vy, -K.lift); p.ground = false; p.canCut = false; p.plunge = false; }); } } }
    /* THE GREASE TRAILS */
    for (const t of S.trails.values()) { const d = t.d, f = S.fires.get(d.fire), x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS;
      if (t.state === 'raw' && roaring(f)) { t.state = 'burning'; t.front = x0; t.t = 0; S.n.burns++; sfx('fireWhoosh', 'whoosh', 'puff'); if (once('catches')) say(x0 + 40, d.f * TS - 40, 'catches', '#ff6b3c'); }
      if (t.state === 'burning') { t.front = Math.min(x1, t.front + K.trailV * dt);
        burnAlong(x0, t.front, d.f, 'trail:' + d.id, dt);
        if (t.front >= x1) { t.t += dt;
          const dr = d.door ? S.doors.get(d.door) : null; if (dr && dr.state === 'whole') { dr.state = 'melting'; dr.t = 0; sfx('sizzle', 'puff'); }
          if (t.t >= K.burnFor) { t.state = 'burnt'; t.t = 0; } } }
      else if (t.state === 'burnt' && !d.door) { t.t += dt; if (t.t >= K.regrease) { t.state = 'raw'; t.t = 0; if (once('regrease')) say((x0 + x1) / 2, d.f * TS - 30, 'regrease', '#c9b27c'); } } }
    for (const dr of S.doors.values()) if (dr.state === 'melting') { dr.t += dt; if (Math.random() < 0.5) ctx.dust((dr.d.x0 + 1) * TS, (dr.d.y1 + 1) * TS, 1);
      if (dr.t >= K.melt) { dr.state = 'gone'; clearCells(dr.d); S.n.melts++; ctx.shake(3); say((dr.d.x0 + 1) * TS, dr.d.y0 * TS - 10, 'melts', '#8fd160'); } }
    /* THE OVERTURNED POT */
    const rc = lv.kgRace, R = S.race;
    if (rc && P) { if (R.state === 'armed' && !P.dead && P.x > rc.trig * TS && Math.abs(P.y - rc.f * TS) < 4 * TS) { R.state = 'on'; R.front = rc.x0 * TS; R.t = 0; S.n.races++; ctx.shake(5); sfx('heavy', 'thud'); sfx('fireWhoosh', 'whoosh');
        ctx.number(rc.pot[0] * TS + 8, rc.pot[1] * TS - 18, '!!', '#ff6b6b'); say(rc.pot[0] * TS + 60, rc.f * TS - 56, 'race', '#ff6b3c'); }
      if (R.state === 'on') { R.t += dt; R.front = Math.min(rc.x1 * TS, R.front + rc.v * dt); const lo = Math.max(rc.x0 * TS, R.front - rc.v * rc.behind);
        burnAlong(lo, R.front, rc.f, 'race', dt, true);
        if (lo >= rc.x1 * TS - 2) R.state = 'out'; } }
    /* THE RECIPE PAGES and THE SPICE VAULT */
    (lv.kgPages || []).forEach(([px, py], i) => { if (S.pages.has(i)) return; const x = px * TS + 8, y = (py + 1) * TS;
      for (const p of ps) if (p && !p.dead && Math.abs(p.x - x) < K.pageR && Math.abs(p.y - y) < 20) { S.pages.add(i); S.n.pages++; sfx('coin', 'pickup'); ctx.number(x, y - 30, KG_SAY.page + ' ' + S.pages.size + '/3', '#ffe9a0'); break; } });
    if (!S.vaultOpen && lv.kgVault && S.pages.size >= lv.kgVault.need) { S.vaultOpen = true; clearCells(lv.kgVault); sfx('clank', 'thud'); say(lv.kgVault.x0 * TS + 16, lv.kgVault.y0 * TS - 20, 'vault', '#ffe9a0'); }
    /* THE NAMED AREAS: the banner when you come into one */
    if (P && lv.sections) { const k = lv.sections.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS); if (k >= 0 && k !== S.sec) { S.banner = { name: lv.sections[k].name, t: 3.4 }; S.sec = k; } }
    if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
  };
  /* FIRE ON THE FLOOR from x0 to x1 (px) on floor row f: a hero standing in it takes K.burnDmg a beat; a foe K.foeBurn; THE BUTCHER burns (stunned, x2) */
  function burnAlong(x0, x1, f, key, dt, race) {
    if (x1 <= x0) return; const fy = f * TS;
    for (const p of ctx.players()) { if (!p || p.dead || !p.ground || Math.abs(p.y - fy) > 3 || p.x < x0 - 4 || p.x > x1 + 4) continue;
      const k = (S.burnKey.get(p) || 0) - dt; if (k > 0) { S.burnKey.set(p, k); continue; } S.burnKey.set(p, K.burnEvery);
      let res = null; ctx.asPlayer(p, () => { res = ctx.damage(p.x + (race ? -10 : 0), K.burnDmg, { name: race ? 'THE GREASE FIRE' : 'BURNING GREASE', unblockable: true, fire: true }); }); if (res === 'hit' && race) S.n.raceHits++; }
    for (const e of ctx.enemies()) { if (!e.alive || e.boss || e.t === 'bat' || Math.abs(e.y - fy) > 4 || e.x < x0 || e.x > x1) continue;
      e.kgBurnT = (e.kgBurnT || 0) - dt; if (e.kgBurnT > 0) continue; e.kgBurnT = K.burnEvery;
      if (e.t === 'butcher') { if (!(e.kgBurn > 0)) { S.n.butcherBurns++; say(e.x, e.y - 34, 'burns', '#ff9a3c'); } e.kgBurn = K.butcher.burn; e.mode = 'burn'; e.modeT = K.butcher.burn; e.stagger = Math.max(e.stagger || 0, 0.4); continue; }
      S.n.foeBurns++; if (ctx.hurtFoe) ctx.hurtFoe(e, K.foeBurn, x0); }
  }

  /* ---------- A HERO'S BLOW (main.js attackBox): a bellows it lands on stokes its fire ---------- */
  H.strike = hb => { if (!S || !hb) return;
    for (const f of S.fires.values()) { const d = f.d, box = { l: d.bx * TS - 3, r: d.bx * TS + 19, t: (d.by + 1) * TS - 22, b: (d.by + 1) * TS };
      if (hb.l < box.r && hb.r > box.l && hb.t < box.b && hb.b > box.t && (!ctx.hitOnce || ctx.hitOnce(f))) stoke(f, hb); } };

  /* ---------- A GREAT SPIT's spit (main.js updateMovers): where its wheel has it ---------- */
  H.mover = (m, dt) => { if (!S) return; const w = S.wheels.get(m.wheel); if (!w) return; const q = spitAt(w.d, spitAngle(w.d, w.ang, m.k)); m.x = q.x - m.w / 2; m.y = q.y; };

  /* ---------- THE BUTCHER (main.js updateEnemies: his own machine) ---------- */
  const onSlick = (x, f) => (L().slick || []).some(z => x > z[0] * TS && x < (z[1] + 1) * TS && f === z[2]);
  H.butcher = (e, dt) => {
    const B = K.butcher, P = ctx.players()[0], d = P ? P.x - e.x : 0, ad = Math.abs(d), near = P && !P.dead && ad < B.near && Math.abs(e.y - P.y) < 40;
    if (ctx.seen && near) ctx.seen('butcher');
    e.vy = Math.min(270, (e.vy || 0) + 1000 * dt); e.modeT -= dt; e.kgBurn = Math.max(0, (e.kgBurn || 0) - dt);
    let want = 0;
    if (e.kgBurn > 0) { e.mode = 'burn'; if (Math.random() < dt * 12) ctx.burst(e.x + (Math.random() - 0.5) * 12, e.y - 8 - Math.random() * 10, 1, ['#ffd36b', '#ff6b2c'], 40, 0.4); }
    else if (e.mode === 'burn') { e.mode = 'rest'; e.modeT = 0.5; }
    else if (e.mode === 'walk' || !e.mode) { e.mode = 'walk'; if (near && !(e.stagger > 0)) { e.face = Math.sign(d) || e.face; want = ad > B.reach - 6 ? e.face * B.speed : 0;
        if (ad <= B.reach) { const chop = Math.random() < 0.55; e.mode = chop ? 'raise' : 'wind'; e.modeT = chop ? B.chopTell : B.hackTell; e.kgAct = (e.kgAct || 0) + 1;
          ctx.number(e.x, e.y - e.h - 12, chop ? '!!' : '!', chop ? '#ff6b6b' : '#ffd36b'); sfx('charge', 'tell'); } } }
    else if (e.mode === 'raise' && e.modeT <= 0) { e.mode = 'slam'; e.modeT = 0.3; ctx.shake(4); sfx('heavy', 'thud'); ctx.dust(e.x + e.face * 14, e.y, 8);
      if (P && !P.dead && Math.sign(P.x - e.x) === e.face && ad < B.reach + 10 && Math.abs(P.y - e.y) < 22) ctx.damage(e.x, B.chop, { who: e, name: 'THE CLEAVER', unblockable: true });
      if (onSlick(e.x, Math.round(e.y / TS))) { e.vx = e.face * B.slide; e.kgSlid = true; S.n.butcherSlides++; if (once('slides')) say(e.x, e.y - 34, 'slides', '#8fd160'); } }
    else if (e.mode === 'wind' && e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 0.3; sfx('slash', 'tell');
      if (P && !P.dead && Math.sign(P.x - e.x) === e.face && ad < B.reach + 12 && Math.abs(P.y - e.y) < 20) { const res = ctx.damage(e.x, B.hack, { who: e, name: 'THE HACK' }); if (res === 'blocked') e.stagger = 0.6; } }
    else if ((e.mode === 'slam' || e.mode === 'sweep') && e.modeT <= 0) { const slid = e.kgSlid, wasChop = e.mode === 'slam'; e.kgSlid = false; e.mode = 'rest'; e.modeT = wasChop ? B.chopRest + (slid ? 0.4 : 0) : B.hackRest; }
    else if (e.mode === 'rest' && e.modeT <= 0) e.mode = 'walk';
    if (e.stagger > 0 && (e.mode === 'raise' || e.mode === 'wind')) { e.mode = 'rest'; e.modeT = 0.8; }
    const slide = e.mode === 'slam' || (e.mode === 'rest' && Math.abs(e.vx) > 30 && onSlick(e.x, Math.round(e.y / TS)));
    e.vx += (want - e.vx) * Math.min(1, dt * (slide ? 1.2 : 6));
    const r = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0;
    e.anim = (e.anim || 0) + dt;
    return true;
  };
  /* a blow on THE BUTCHER: double while he burns */
  H.takeFoe = (e, dmg) => (e.t === 'butcher' && e.kgBurn > 0 ? Math.round(dmg * K.butcher.burnMul) : dmg);

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`), the tools, the pilot bot ---------- */
  const fireDone = f => roaring(f) || f.d.trails.some(id => { const t = S.trails.get(id); const dr = t && t.d.door ? S.doors.get(t.d.door) : null; return dr && dr.state !== 'whole'; });
  H.props = () => { if (!S) return []; const out = [];
    for (const f of S.fires.values()) out.push({ t: 'kgbellows', id: f.d.id, x: f.d.bx * TS + 8, y: (f.d.by + 1) * TS, on: fireDone(f) });
    return out; };
  H.hoist = id => { const f = S && S.fires.get(id); return f ? { state: fireDone(f) ? 'cut' : 'hang', d: (L().hoists || []).find(h => h.id === id) } : null; };
  H.read = () => S ? { fires: [...S.fires.values()].map(f => ({ id: f.d.id, roar: +f.roarT.toFixed(2) })), wheels: [...S.wheels.values()].map(w => ({ id: w.d.id, ang: +w.ang.toFixed(3) })),
    trails: [...S.trails.values()].map(t => ({ id: t.d.id, state: t.state, front: Math.round(t.front) })), doors: [...S.doors.values()].map(d => ({ id: d.d.id, state: d.state })),
    race: { state: S.race.state, front: Math.round(S.race.front) }, pages: S.pages.size, vault: S.vaultOpen, banner: S.banner ? S.banner.name : null, sec: S.sec, n: JSON.parse(JSON.stringify(S.n)) } : null;

  /* ---------- DRAWING (claude/kitchengateart): src/redraw/kitchen_art.js draws every machine; this only places them ---------- */
  const R = Math.round;
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const lv = L(), inX = (x, m = 80) => x - cx > -m && x - cx < VW + m;
    /* THE GREASE FLOORS: a glossy amber skin on the floor's top */
    for (const [x0, x1, f] of lv.slick || []) { if (!inX(x0 * TS, 600) || x0 * TS - cx > VW || (x1 + 1) * TS - cx < 0) continue; KA.drawSlick(g, R(x0 * TS - cx), R(f * TS - cy), (x1 - x0 + 1) * TS, time, x0); }
    /* THE FIRES and their BELLOWS (the heat gauge over each bellows: the roar left) */
    for (const f of S.fires.values()) { const d = f.d, fx = d.fx * TS + 8; if (!inX(fx, 200)) continue; const fy = R(d.f * TS - cy), on = roaring(f), sx = R(fx - cx);
      KA.drawFire(g, d, sx, fy, on, time);
      KA.drawBellows(g, R(d.bx * TS + 8 - cx), R((d.by + 1) * TS - cy), f.pump, !on && !fireDone(f), Math.max(0, Math.min(1, f.roarT / K.roar)), time); }
    /* THE COPPERS and their steam */
    for (const pd of lv.kgPots || []) { const x = R(pd.x * TS + 8 - cx), y = R(pd.f * TS - cy); if (x < -80 || x > VW + 80) continue; KA.drawCopper(g, x, y, R(y - (pd.top * TS - cy)), roaring(S.fires.get(pd.fire)), time, pd.x); }
    /* THE GREAT SPITS */
    for (const w of S.wheels.values()) { const d = w.d, hx = R(d.x - cx), hy = R(d.y - cy); if (hx < -120 || hx > VW + 120) continue;
      const sp = []; for (let k = 0; k < WHEEL.n; k++) { const q = spitAt(d, spitAngle(d, w.ang, k)); sp.push({ x: R(q.x - cx), y: R(q.y - cy) }); }
      KA.drawWheel(g, d, hx, hy, sp, w.ang, R(d.f * TS - cy), WHEEL, roaring(S.fires.get(d.fire)), time); }
    /* THE GREASE TRAILS */
    for (const t of S.trails.values()) { const d = t.d, x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS; if (!inX(x0, 400)) continue; KA.drawTrail(g, R(x0 - cx), R(x1 - cx), R(d.f * TS - cy), t.state, R(t.front - cx), time, d.x0); }
    /* THE TALLOW DOORS */
    for (const dr of S.doors.values()) { if (dr.state === 'gone') continue; const d = dr.d, x = R(d.x0 * TS - cx); if (x < -60 || x > VW + 60) continue; KA.drawDoor(g, x, R(d.y0 * TS - cy), (d.x1 - d.x0 + 1) * TS, (d.y1 - d.y0 + 1) * TS, dr.state === 'melting' ? dr.t / K.melt : 0, time); }
    /* THE OVERTURNED POT: the great pot (tipped once it goes), the fire along the grease */
    const rc = lv.kgRace; if (rc && inX(rc.pot[0] * TS, 600)) { KA.drawPot(g, R(rc.pot[0] * TS + 8 - cx), R((rc.pot[1] + 1) * TS - cy), S.race.state !== 'armed', time);
      if (S.race.state === 'on') { const lo = Math.max(rc.x0 * TS, S.race.front - rc.v * rc.behind); KA.drawTrail(g, R(lo - cx), R(S.race.front - cx), R(rc.f * TS - cy), 'burning', R(S.race.front - cx), time, 7); } }
    /* THE RECIPE PAGES, THE SPICE VAULT's grate */
    (lv.kgPages || []).forEach(([px, py], i) => { if (S.pages.has(i)) return; const x = R(px * TS + 8 - cx), y = R((py + 1) * TS - cy) - 8 + Math.sin(time * 2 + i) * 2; if (x < -20 || x > VW + 20) return; KA.drawPage(g, x, R(y), i, time); });
    if (lv.kgVault && !S.vaultOpen) { const v = lv.kgVault, x = R(v.x0 * TS - cx), y = R(v.y0 * TS - cy); KA.drawVault(g, x, y, (v.x1 - v.x0 + 1) * TS, S.pages.size);
      ctx.text && ctx.text(S.pages.size + '/3', x + TS, y - 8, '#e8dcb0', 'center', 5); }
    /* THE AREA BANNER */
    if (S.banner && ctx.text) { const a = Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4); g.globalAlpha = Math.max(0, a); ctx.text(S.banner.name, R(VW / 2), 34, '#ffe0b0', 'center', 8); g.globalAlpha = 1; }
  };
  /* THE BUTCHER's flames while he burns (his body, apron and cleaver are his own sheet: KA.bakeButcher) */
  H.butcherOver = (g, e, cx, cy, time) => { if (!e.alive) return; if (e.mode === 'burn') KA.butcherBurn(g, R(e.x - cx), R(e.y - cy), time); };
  return H;
}
