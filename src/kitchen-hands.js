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
import { dish as drawDish } from './redraw/grubbag_art.js';   /* (claude/kitchengate2) the serving lines' dishes and bombs are LORD GRUBBAG's own */
export const K = { line: { fuse: 4.2, batV: 230, blast: 30, blastDmg: 10, box: 9, paid: 2 }, flareDmg: 9, flareBeat: 0.5,   /* (claude/kitchengate2) the serving lines' bombs; the stove flares */
  roar: 8, restoke: 0.6, lift: 240, colW: 13, trailV: 150, burnFor: 2.6, burnDmg: 9, burnEvery: 0.5, foeBurn: 14, melt: 0.9, regrease: 5, pageR: 14,
  butcher: { hp: 64, speed: 24, near: 210, reach: 34, chopTell: 0.85, chop: 24, chopRest: 1.15, hackTell: 0.55, hack: 15, hackRest: 0.6, slide: 130, burn: 2.6, burnMul: 2 },
  /* (claude/kitchengate2) THE ATTENDANT: the thief turned serving man. He keeps his distance and THROWS PLATES (a told arc onto the ring where you stand); close in and he raises his TRAY (a blow
     from the front is turned: go round him, or come down on him); then he swings it */
  attendant: { hp: 30, speed: 44, near: 230, min: 54, max: 190, aimT: 0.6, throwT: 0.25, rest: 1.0, cd: 1.6, plate: { flight: 0.8, r: 11, dmg: 9, apex: 46 }, guardAt: 40, guardT: 0.9, bashTell: 0.32, bashT: 0.3, bash: 8, bashRest: 0.9, guardCd: 2.2 } };
export const KG_SAY = {
  roar: 'THE FIRE ROARS', steam: 'THE COPPER STEAMS: STAND IN IT', turns: 'THE GREAT SPIT TURNS', dies: 'THE FIRE DIES DOWN', catches: 'THE GREASE CATCHES: OFF THE TRAIL',
  melts: 'THE TALLOW DOOR MELTS', race: 'THE GREASE POT GOES OVER: RUN!', page: 'A RECIPE PAGE', vault: 'THE SPICE VAULT OPENS', burns: 'HE BURNS', slides: 'HE SLIDES ON THE GREASE',
  knocked: 'KNOCKED OFF THE LINE', batted: 'BATTED ALONG', fizz: 'IT GOES OFF ON THE LINE', flare: 'THE STOVE FLARES: TIME IT', bellows: 'STRIKE THE BELLOWS', regrease: 'THE GREASE RUNS BACK', cleaver: 'THE CLEAVER: STEP BACK', tray: 'THE TRAY: GO ROUND HIM', plates: 'HE THROWS PLATES: OFF THE RING',
  handoff: 'JUMP IN THE RED: HOOK TO HOOK', haul: 'THE CHAIN HAULS YOU UP', flue: 'THE FLUE: TAKE A HOOK AS ITS FLAME DIES',   /* (claude/kitchengate3) THE HANGING LARDER and THE CARVERY */
};
/* a spit's place on its wheel at angle a: { x (its middle), y (its top) } */
export const spitAt = (w, a) => ({ x: w.x + Math.cos(a) * WHEEL.R, y: w.y + Math.sin(a) * WHEEL.R });
export const spitAngle = (w, ang, k) => ang + k * Math.PI * 2 / WHEEL.n;
/* THE BUTCHER's skin (greybox): the club goblin's frames, gone a meaty red-brown (his apron and cleaver are drawn over him: butcherOver) - main.js SPR.butcher */
export function bakeButcherSet() { return KA.bakeButcher(); }
export function bakeAttendantSet() { return KA.bakeAttendant(); }   /* (claude/kitchengate2) THE ATTENDANT's frames: idle, walk x2, aim, throw, guard, bash */
export const attendantFrameOf = KA.attendantFrameOf;   /* (claude/kitchengateart) his own seven frames: idle, walk x2, raise, slam, wind, sweep */
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
    const belts = (lv.kgBelts || []).map(d => ({ d, items: [], t: d.every * 0.4, n: 0, scroll: 0, counter: ctx.tileAt ? ctx.tileAt(d.x0, d.f) === ctx.T.ONEWAY : false }));   /* (claude/kitchengate2) THE SERVING LINES */
    S = { L: lv, fires, wheels, trails, doors, pages, vaultOpen, said: keep ? keep.said : new Set(), sec: -1, banner: null, race: { state: 'armed', front: 0, t: 0 }, burnKey: new Map(), belts, clock: 0, itemId: 0, flareKey: new Map(), paid: keep && keep.paid ? keep.paid : {},
      n: keep ? keep.n : { stokes: 0, lifts: 0, rides: 0, burns: 0, melts: 0, foeBurns: 0, races: 0, raceHits: 0, pages: 0, butcherSlides: 0, butcherBurns: 0, carried: 0, knocked: 0, bats: 0, fizz: 0, flareHits: 0, flareFoes: 0 } };
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
    /* (claude/kitchengate2) THE SERVING LINES and THE STOVE FLARES */
    S.clock += dt; for (const b of S.belts) stepBelt(b, dt, ps); for (const f of lv.kgFlares || []) stepFlare(f, dt, ps);
    /* THE RECIPE PAGES and THE SPICE VAULT */
    (lv.kgPages || []).forEach(([px, py], i) => { if (S.pages.has(i)) return; const x = px * TS + 8, y = (py + 1) * TS;
      for (const p of ps) if (p && !p.dead && Math.abs(p.x - x) < K.pageR && Math.abs(p.y - y) < 20) { S.pages.add(i); S.n.pages++; sfx('coin', 'pickup'); ctx.number(x, y - 30, KG_SAY.page + ' ' + S.pages.size + '/3', '#ffe9a0'); break; } });
    if (!S.vaultOpen && lv.kgVault && S.pages.size >= lv.kgVault.need) { S.vaultOpen = true; clearCells(lv.kgVault); sfx('clank', 'thud'); say(lv.kgVault.x0 * TS + 16, lv.kgVault.y0 * TS - 20, 'vault', '#ffe9a0'); }
    /* (claude/kitchengate3) THE HOOK-TO-HOOK HOP, THE HAUL LINE, THE FLUE: told once each, the first time a hero takes such a rail */
    for (const p of ps) { const z = p && p.zip; if (!z || !z.meat) continue; const k = z.flue ? 'flue' : z.hop ? 'handoff' : z.haul ? 'haul' : null; if (k && once(k)) say(p.x, p.y - 40, k, k === 'flue' ? '#ff9a5c' : '#ffd36b'); if (z.hop) S.n.hopRides = (S.n.hopRides || 0) + dt; }
    /* THE NAMED AREAS: the banner when you come into one */
    if (P && lv.sections) { const k = lv.sections.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS); if (k >= 0 && k !== S.sec) { S.banner = { name: lv.sections[k].name, t: 3.4 }; S.sec = k; } }
    if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
  };
  /* ---------- (claude/kitchengate2) A SERVING LINE: it carries whoever stands on it (and its cooks, on a line that says so); dishes ride it, and bombs ---------- */
  const solidOrShelf = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS), t = ctx.tileAt ? ctx.tileAt(tx, ty) : null; return t === ctx.T.SOLID || t === ctx.T.ONEWAY || (ctx.solidAt && ctx.solidAt(tx, ty)); };
  function boom(x, y, key) { ctx.burst(x, y - 6, 18, ['#ff9a3c', '#ffd36b', '#4a4440'], 120, 0.6); sfx('boom', 'heavy', 'thud'); ctx.shake(3);
    for (const p of ctx.players()) { if (!p || p.dead || Math.abs(p.x - x) > K.line.blast || p.y < y - K.line.blast - 10 || p.y > y + 14) continue; ctx.asPlayer(p, () => ctx.damage(x, K.line.blastDmg, { name: 'A BOMB', unblockable: true })); }
    for (const e of ctx.enemies()) { if (!e.alive || e.boss || Math.abs(e.x - x) > K.line.blast || Math.abs(e.y - y) > K.line.blast) continue; if (ctx.hurtFoe) ctx.hurtFoe(e, K.foeBurn, x); } }
  function stepBelt(b, dt, ps) {
    const d = b.d, x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS, fy = d.f * TS, v = d.v * d.dir; b.scroll += v * dt;
    for (const p of ps) { if (!p || p.dead || p.zip || !p.ground || Math.abs(p.y - fy) > 3 || p.x < x0 - 2 || p.x > x1 + 2) continue;
      const nx = p.x + v * dt; if (!(ctx.solidAt && ctx.solidAt(Math.floor((nx + d.dir * 6) / TS), Math.floor((p.y - 8) / TS)))) { ctx.asPlayer(p, () => { p.x = nx; }); S.n.carried += dt; } }
    if (d.foes) for (const e of ctx.enemies()) { if (!e.alive || e.boss || e.t === 'bat' || Math.abs(e.y - fy) > 3 || e.x < x0 + 6 || e.x > x1 - 6) continue; e.x = Math.max(x0 + 6, Math.min(x1 - 6, e.x + v * dt)); }
    b.t -= dt; if (b.t <= 0) { b.t = d.every; b.n++; const kind = d.bomb && b.n % d.bomb === 0 ? 'bomb' : 'dish'; b.items.push({ id: ++S.itemId, kind, x: d.dir > 0 ? x0 + 6 : x1 - 6, y: fy, state: 'ride', fuse: kind === 'bomb' ? K.line.fuse : 0 }); }
    for (const it of b.items) {
      if (it.state === 'ride' || it.state === 'bat') { it.x += (it.state === 'bat' ? K.line.batV * d.dir : v) * dt;
        if (it.kind === 'bomb') { it.fuse -= dt; if (it.fuse <= 0) { it.state = 'gone'; S.n.fizz++; boom(it.x, fy, it.id); if (once('fizz')) say(it.x, fy - 34, 'fizz', '#ff9a5c'); continue; } }
        if (d.dir > 0 ? it.x >= x1 - 4 : it.x <= x0 + 4) { it.vx = v * (it.state === 'bat' ? 3 : 1.5); it.vy = -40; it.state = 'fall'; } }
      else if (it.state === 'fall') { it.vy += 600 * dt; it.x += it.vx * dt; it.y += it.vy * dt;
        if (it.vy > 0 && (solidOrShelf(it.x, it.y) || it.y > fy + 400)) { it.state = 'gone'; if (it.kind === 'bomb') boom(it.x, Math.floor(it.y / TS) * TS, it.id); else { ctx.burst(it.x, it.y - 4, 10, ['#c8ccd4', '#a0602a', '#e8dcc0'], 90, 0.5); sfx('crack', 'thud'); } } } }
    b.items = b.items.filter(q => q.state !== 'gone');
  }
  /* ---------- A STOVE FLARE: glow (the tell) -> flame -> out, on its rhythm ---------- */
  const flareState = f => { const t = ((S.clock + f.phase) % f.period + f.period) % f.period; return t < f.tell ? ['glow', t / f.tell] : t < f.tell + f.on ? ['flame', (t - f.tell) / f.on] : ['out', 0]; };
  H.flareState = id => { const f = (L().kgFlares || []).find(q => q.id === id); return f && S ? flareState(f)[0] : null; };
  /* (claude/kitchengate3) THE FLUE's rhythm ahead: is it out of flame for the whole of [now + t0, now + t1]? (a rail's z.flue: the pilot takes its hook only when it is - the player reads the glow) */
  const flareAt = (f, dt) => { const t = ((S.clock + dt + f.phase) % f.period + f.period) % f.period; return t < f.tell ? 'glow' : t < f.tell + f.on ? 'flame' : 'out'; };
  H.flueClear = z => { if (!S || !z || !z.flue) return true; const f = (L().kgFlares || []).find(q => q.id === z.flue.id); if (!f) return true; for (let t = z.flue.tIn - 0.12; t <= z.flue.tOut + 0.12; t += 0.04) if (flareAt(f, t) === 'flame') return false; return true; };
  function stepFlare(f, dt, ps) {
    const [st] = flareState(f); if (st !== 'flame') return; const x0 = f.x0 * TS - 4, x1 = (f.x1 + 1) * TS + 4, fy = f.f * TS;
    for (const p of ps) { if (!p || p.dead || p.x < x0 || p.x > x1 || p.y > fy + 2 || p.y < fy - f.h) continue;
      const k = (S.flareKey.get(p) || 0) - dt; if (k > 0) { S.flareKey.set(p, k); continue; } S.flareKey.set(p, K.flareBeat);
      let res = null; ctx.asPlayer(p, () => { res = ctx.damage(p.x, K.flareDmg, { name: 'THE STOVE FLARE', unblockable: true, fire: true }); }); if (res === 'hit') S.n.flareHits++; if (once('flare')) say((x0 + x1) / 2, fy - f.h - 14, 'flare', '#ff9a5c'); }
    for (const e of ctx.enemies()) { if (!e.alive || e.boss || e.t === 'bat' || e.x < x0 || e.x > x1 || Math.abs(e.y - fy) > 4) continue; e.kgBurnT = (e.kgBurnT || 0) - dt; if (e.kgBurnT > 0) continue; e.kgBurnT = K.burnEvery;
      if (e.t === 'butcher') { e.kgBurn = K.butcher.burn; e.mode = 'burn'; e.modeT = K.butcher.burn; continue; } S.n.flareFoes++; if (ctx.hurtFoe) ctx.hurtFoe(e, K.foeBurn, (x0 + x1) / 2); }
  }
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
    /* (claude/kitchengate2) a blow on a serving line's dish knocks it off (a coin falls out); on a bomb it bats it along */
    for (const b of S.belts) for (const it of b.items) { if (it.state !== 'ride' && it.state !== 'bat') continue; const bx = { l: it.x - K.line.box, r: it.x + K.line.box, t: it.y - K.line.box * 2, b: it.y };
      if (!(hb.l < bx.r && hb.r > bx.l && hb.t < bx.b && hb.b > bx.t) || (ctx.hitOnce && !ctx.hitOnce(it))) continue;
      if (it.kind === 'bomb') { if (it.state !== 'bat') { it.state = 'bat'; S.n.bats++; sfx('clank', 'thud'); if (once('batted')) say(it.x, it.y - 30, 'batted'); } continue; }
      const P = ctx.players()[0]; it.state = 'fall'; it.vx = (Math.sign(it.x - (P ? P.x : it.x - 1)) || 1) * 70; it.vy = -130; S.n.knocked++; if (ctx.coin && (S.paid[b.d.id] || 0) < K.line.paid) { S.paid[b.d.id] = (S.paid[b.d.id] || 0) + 1; ctx.coin(it.x, it.y - 12); }   /* (a coin from the first few on each line only: never a farm) */ sfx('crack', 'thud'); if (once('knocked')) say(it.x, it.y - 30, 'knocked', '#8fd160'); }
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
  /* ---------- THE ATTENDANT (claude/kitchengate2; main.js updateEnemies: his own machine) ---------- */
  const surfaceUnder = (x, y) => { const T = ctx.T, tx = Math.floor(x / TS); for (let ty = Math.floor((y - 2) / TS); ty < (L().H || 99); ty++) { const t = ctx.tileAt ? ctx.tileAt(tx, ty) : null; if (t === T.SOLID || t === T.ONEWAY || (ctx.solidAt && ctx.solidAt(tx, ty))) return ty * TS; } return y; };
  H.attendant = (e, dt) => { if (!S) return false;
    const A = K.attendant, ps = ctx.players().filter(p => p && !p.dead), P = ps.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    e.vy = Math.min(270, (e.vy || 0) + 1000 * dt); e.modeT -= dt; e.kgCd = Math.max(0, (e.kgCd || 0) - dt); e.kgGcd = Math.max(0, (e.kgGcd || 0) - dt); e.plates = e.plates || [];
    const d = P ? P.x - e.x : 0, ad = Math.abs(d), near = P && ad < A.near && Math.abs(P.y - e.y) < 90;
    if (ctx.seen && near) ctx.seen('attendant');
    let want = 0;
    if (e.delayT > 0) { e.delayT -= dt; e.mode = 'walk'; }
    else if (e.stagger > 0 && (e.mode === 'aim' || e.mode === 'guard' || e.mode === 'bashTell')) { e.mode = 'rest'; e.modeT = 0.6; }
    else if (e.mode === 'walk' || !e.mode) { e.mode = 'walk'; if (near) { e.face = Math.sign(d) || e.face;
        const facingMe = P.face === -Math.sign(d) || P.atk >= 0;
        if (ad < A.guardAt && e.kgGcd <= 0 && facingMe) { e.mode = 'guard'; e.modeT = A.guardT; e.kgGcd = A.guardCd; if (once('tray')) say(e.x, e.y - 34, 'tray', '#c8d8e8'); }
        else if (ad >= A.min && ad <= A.max && e.kgCd <= 0) { e.mode = 'aim'; e.modeT = A.aimT; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('charge', 'tell'); }
        else want = ad > A.max ? e.face * A.speed : ad < A.min ? -e.face * A.speed * 0.8 : 0; } }
    else if (e.mode === 'aim' && e.modeT <= 0) { e.mode = 'throw'; e.modeT = A.throwT; e.kgCd = A.cd; sfx('throwWhoosh', 'whoosh');
      const tx = P ? P.x : e.x + e.face * 80, ty = P ? (P.ground ? P.y : surfaceUnder(P.x, P.y)) : e.y;
      e.plates.push({ x0: e.x + e.face * 6, y0: e.y - 22, tx, ty, t: 0, T: A.plate.flight, key: 'ap' + (e.kgAct = (e.kgAct || 0) + 1) });
      if (once('plates')) say(e.x, e.y - 40, 'plates'); }
    else if (e.mode === 'throw' && e.modeT <= 0) { e.mode = 'rest'; e.modeT = A.rest; }
    else if (e.mode === 'guard' && e.modeT <= 0) { e.mode = 'bashTell'; e.modeT = A.bashTell; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); sfx('charge', 'tell'); }
    else if (e.mode === 'bashTell' && e.modeT <= 0) { e.mode = 'bash'; e.modeT = A.bashT; sfx('slash', 'tell');
      if (P && Math.sign(P.x - e.x) === e.face && ad < 26 && Math.abs(P.y - e.y) < 20) ctx.asPlayer(P, () => ctx.damage(e.x, A.bash, { who: e, name: 'THE TRAY' })); }
    else if (e.mode === 'bash' && e.modeT <= 0) { e.mode = 'rest'; e.modeT = A.bashRest; }
    else if (e.mode === 'rest' && e.modeT <= 0) e.mode = 'walk';
    e.vx += (want - e.vx) * Math.min(1, dt * 6);
    const r = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0;
    e.anim = (e.anim || 0) + dt;
    stepPlates(e, dt);
    return true;
  };
  /* his plates: a told arc onto the ring where you stood (the ring blinks on that surface) */
  function stepPlates(e, dt) { const A = K.attendant;
    for (const q of e.plates) { q.t += dt; if (q.t < q.T || q.done) continue; q.done = true; ctx.dust(q.tx, q.ty, 4); sfx('crack', 'thud');
      for (const p of ctx.players()) { if (!p || p.dead) continue; if (Math.abs(p.x - q.tx) < A.plate.r + 5 && p.y > q.ty - 24 && p.y < q.ty + 3) ctx.asPlayer(p, () => ctx.damage(q.tx, A.plate.dmg, { who: e, name: 'A PLATE' })); } }
    e.plates = e.plates.filter(q => !q.done); }
  H.plateAt = q => { const k = Math.max(0, Math.min(1, q.t / q.T)), H2 = K.attendant.plate.apex + Math.abs(q.ty - q.y0) / 2; return { x: q.x0 + (q.tx - q.x0) * k, y: q.y0 + (q.ty - q.y0) * k - H2 * 4 * k * (1 - k), k }; };
  /* a blow on THE BUTCHER: double while he burns; on THE ATTENDANT behind his raised tray: turned (from the front, and not from above) */
  H.takeFoe = (e, dmg) => { if (e.t === 'butcher' && e.kgBurn > 0) return Math.round(dmg * K.butcher.burnMul);
    if (e.t === 'attendant' && e.mode === 'guard') { const P = ctx.players()[0]; if (P && Math.sign(P.x - e.x) === e.face && P.y > e.y - e.h) { ctx.number(e.x, e.y - e.h - 8, 'TRAY', '#c8d8e8'); sfx('clank', 'thud'); return 0; } }
    return dmg; };

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`), the tools, the pilot bot ---------- */
  const fireDone = f => roaring(f) || f.d.trails.some(id => { const t = S.trails.get(id); const dr = t && t.d.door ? S.doors.get(t.d.door) : null; return dr && dr.state !== 'whole'; });
  H.props = () => { if (!S) return []; const out = [];
    for (const f of S.fires.values()) out.push({ t: 'kgbellows', id: f.d.id, x: f.d.bx * TS + 8, y: (f.d.by + 1) * TS, on: fireDone(f) });
    return out; };
  H.hoist = id => { const f = S && S.fires.get(id); return f ? { state: fireDone(f) ? 'cut' : 'hang', d: (L().hoists || []).find(h => h.id === id) } : null; };
  H.read = () => S ? { fires: [...S.fires.values()].map(f => ({ id: f.d.id, roar: +f.roarT.toFixed(2) })), wheels: [...S.wheels.values()].map(w => ({ id: w.d.id, ang: +w.ang.toFixed(3) })),
    trails: [...S.trails.values()].map(t => ({ id: t.d.id, state: t.state, front: Math.round(t.front) })), doors: [...S.doors.values()].map(d => ({ id: d.d.id, state: d.state })),
    race: { state: S.race.state, front: Math.round(S.race.front) }, belts: S.belts.map(b => ({ id: b.d.id, items: b.items.map(q => ({ kind: q.kind, x: Math.round(q.x), state: q.state })) })), flares: (lv => (lv.kgFlares || []).map(f => ({ id: f.id, st: flareState(f)[0] })))(L()), pages: S.pages.size, vault: S.vaultOpen, banner: S.banner ? S.banner.name : null, sec: S.sec, n: JSON.parse(JSON.stringify(S.n)) } : null;

  /* ---------- DRAWING (claude/kitchengateart): src/redraw/kitchen_art.js draws every machine; this only places them ---------- */
  const R = Math.round;
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const lv = L(), inX = (x, m = 80) => x - cx > -m && x - cx < VW + m;
    /* (claude/kitchengate2) THE KITCHEN'S DRESSING (greybox props, behind everything), THE MEAT-HOOK RAILS' hooks, THE SERVING LINES, THE STOVE FLARES */
    for (const p of lv.kgProps || []) { const x = p.x * TS + 8; if (!inX(x, 120)) continue; KA.drawProp(g, p.kind, R(x - cx), R(p.f * TS - cy), time, p.x); }
    for (const z of lv.zipLines || []) if (z.meat && (inX(z.x0, 400) || inX(z.x1, 400))) KA.drawMeatRail(g, z, cx, cy, S.clock, VW);
    for (const b of S.belts) { const d = b.d, x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS; if (!inX(x0, 600) || x0 - cx > VW + 40 || x1 - cx < -40) continue; KA.drawLine(g, R(x0 - cx), R(x1 - cx), R(d.f * TS - cy), b.scroll, d.dir, b.counter, time);
      for (const it of b.items) { const ix = R(it.x - cx), iy = R(it.y - cy); drawDish(g, false, ix, iy - 4, it.kind, time); if (it.kind === 'bomb' && it.state !== 'fall') { const k = Math.max(0, it.fuse / K.line.fuse); rect(g, ix - 9, iy - 28, 18, 3, '#1b1626'); rect(g, ix - 9, iy - 28, R(18 * k), 3, k < 0.3 ? (Math.floor(time * 10) % 2 ? '#ff4a2a' : '#ffd36b') : '#ff9a3c'); } } }
    for (const f of lv.kgFlares || []) { const x0 = f.x0 * TS, x1 = (f.x1 + 1) * TS; if (!inX(x0, 200)) continue; const [st, k] = flareState(f); KA.drawFlare(g, R(x0 - cx), R(x1 - cx), R(f.f * TS - cy), st, k, f.h, time, f.bed); }
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
    /* THE ATTENDANTS' PLATES in the air, and the ring each will land on */
    { const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0'; for (const e of ctx.enemies()) { if (e.t !== 'attendant' || !e.plates) continue; for (const q of e.plates) { const p = H.plateAt(q); KA.drawPlate(g, p.x - cx, p.y - cy, p.k * 9); g.strokeStyle = blink; g.strokeRect(R(q.tx - cx) - 11, R(q.ty - cy) - 3, 22, 3); } } }
    /* THE AREA BANNER */
    if (S.banner && ctx.text) { const a = Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4); g.globalAlpha = Math.max(0, a); ctx.text(S.banner.name, R(VW / 2), 34, '#ffe0b0', 'center', 8); g.globalAlpha = 1; }
  };
  /* THE BUTCHER's flames while he burns (his body, apron and cleaver are his own sheet: KA.bakeButcher) */
  H.butcherOver = (g, e, cx, cy, time) => { if (!e.alive) return; if (e.mode === 'burn') KA.butcherBurn(g, R(e.x - cx), R(e.y - cy), time); };
  return H;
}
