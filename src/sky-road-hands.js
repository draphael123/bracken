// src/sky-road-hands.js - THE SKY ROAD's rule and machines (claude/skyroad, the GREYBOX, 2026-10-05; brief docs/concepts/sky-road.md).
// src/sky-road.js builds the level; this binds it to the game. main.js owns the world and calls:
//   reset, on, thermal (from the vent update: a prop with thermal: true), player (glide + the cloud sea, after gravity), update, strike, interact,
//   mover (the reel's cage), harpy (her SNATCH), kiteHover (the goblin kites ride their thermal), riderStep (THE GOBLIN KITE-RIDER, a CV-style machine),
//   riderHurt / riderStruck, props (the guide's extra props), drawWorld, drawSky, drawHud, read (tools).
// THE RULE: THE SUN WARMS THE ROCK AND THE AIR OVER IT RISES: RIDE IT, GLIDE INTO IT - AND A CLOUD ON IT KILLS IT.
//   - A THERMAL lifts a hero standing or falling in its column up to its top (it overshoots the reach model's top by THERMAL.over px, so you crest
//     and drift onto the ledge). It is LIVE when its source is on (natural; a sun-stone struck round; the disc lit) and no CLOUD's shadow (nor a crag
//     hawk circling over it, nor the Roc's storm) is on its foot. Its strength fades in and out (THERMAL.fadeIn/fadeOut): a shadow's edge is seen
//     creeping toward the column first, and a column about to die flickers.
//   - THE RIDER'S CLOAK: taken off its mast at the station. Hold jump as you fall: you GLIDE (GLIDE.fall px/s down). Gliding in a column lifts harder.
//   - THE CLOUD SEA: below every chasm. A fall into it costs CATCH.dmg (unblockable, told THE DROP) and the updraft under it throws you back to the
//     last solid footing you stood on (never a crumbling span or a mover). Never an untold death.
// Every capital line it says goes through ctx.number with a line listed in src/hint-lines.js.
import { DISC } from './sky-road.js';

export const THERMAL = { lift: 150, glideLift: 205, over: 40, crest: 26, fadeIn: 0.8, fadeOut: 0.45, warn: 1.2 };
export const GLIDE = { fall: 40 };
export const CATCH = { dmg: 14, below: 2 };                          /* rows under the cloud sea's top at which the updraft has you */
export const SNATCH = { t: 1.5, climb: 46, drift: 64, mash: 0.25, cd: 3 };   /* s she holds you, px/s up and out, s each press takes off, s before she dives again */
export const RIDER = { hp: 16, ride: 22, sight: 190, tell: 0.7, speed: 250, over: 34, dmg: 12, cd: 2.4, sink: 46, rise: 90, walk: 52, reach: 24, kickTell: 0.45, kickDmg: 9, kickCd: 1.1, w: 14, h: 14 };
export const REEL = { up: 3.4, down: 5 };                             /* s for the kite to haul the cage the whole way up; s for it to sink back */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mod = (a, n) => ((a % n) + n) % n;

export function makeSkyRoadHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().skyroad);
  H.reset = () => {
    S = null; const lv = L(); if (!lv || !lv.skyroad) return;
    const stones = new Map(); for (const e of lv.ents) if (e.t === 'sunstone') stones.set(e.id, { id: e.id, x: e.x * TS + 8, y: (e.y + 1) * TS, on: false, turnT: 0, arena: e.x * TS >= lv.arena.x0 });
    const d = lv.ents.find(e => e.t === 'sundisc'), c = lv.ents.find(e => e.t === 'cloak'), lo = lv.ents.find(e => e.t === 'loft');
    const keep = S && S.L === lv;   /* a respawn keeps the cloak (taken once); a fresh load of the level takes it back */
    S = { L: lv, stones, disc: d ? { x: d.x * TS + 8, y: (d.y + 1) * TS, litAt: -99, until: -99, turnT: 0 } : null,
      cloak: keep ? S.cloak : false, cloakAt: c ? { x: c.x * TS + 8, y: (c.y + 1) * TS } : null, loft: lo ? { x: lo.x * TS + 8, y: (lo.y + 1) * TS, open: keep ? S.loft && S.loft.open : false } : null,
      reelK: 0, safe: null, said: new Set(), n: { catches: 0, glides: 0, snatches: 0, stones: 0, disc: 0, rides: 0 }, hung: keep ? S.hung : false };
    if (ctx.crumbleInit) ctx.crumbleInit();
  };
  /* the cloak survives a death on the level (it is the level's tool, taken once); a new load of the level takes it back off you */
  H.load = () => { S = null; H.reset(); };
  const say = (key, x, y, line, col) => { if (S.said.has(key)) return; S.said.add(key); ctx.number(x, y, line, col || '#bfe6f5'); };

  /* ---------- CLOUDS: each bank's clouds at time t ---------- */
  const cloudsNow = () => { const out = [], t = ctx.time();
    for (const z of (L().clouds || [])) { const P = z.w + z.gap, o = mod(z.phase + z.speed * t, P);
      for (let left = z.x0 - z.w + o - P; left < z.x1; left += P) { const a = Math.max(z.x0, left), b = Math.min(z.x1, left + z.w); if (b > a) out.push({ a, b, z, left }); } }
    return out; };
  /* will a cloud be on x within s seconds? (the flicker that tells a column it is about to die) */
  const cloudAt = (x, dtAhead) => { const t = ctx.time() + (dtAhead || 0);
    for (const z of (L().clouds || [])) { if (x < z.x0 || x >= z.x1) continue; const P = z.w + z.gap, o = mod(z.phase + z.speed * t, P), rel = mod(x - (z.x0 - z.w + o), P); if (rel < z.w) return true; }
    return false; };
  const hawkOver = x => ctx.enemies().some(e => e.alive && e.cnSkin === 'craghawk' && e.st && e.st.mode === 'circle' && Math.abs(e.x - x) < 26);
  H.cloudAt = cloudAt;

  /* ---------- THE SOURCE: natural, a stone, the disc ---------- */
  const sourceOn = pr => { if (!pr.src) return true; const [k, id] = pr.src.split(':');
    if (k === 'stone') { const s = S.stones.get(id); return !!(s && s.on); }
    if (k === 'disc') { const d = S.disc, t = ctx.time(); return !!(d && t < d.until && t >= d.litAt + (pr.order || 0) * DISC.stagger); }
    return true; };
  const shadedBy = pr => cloudAt(pr.x) ? 'cloud' : hawkOver(pr.x) ? 'hawk' : (ctx.rocShade && ctx.rocShade(pr)) ? 'storm' : null;
  H.live = pr => !!pr && pr.k > 0.25;

  /* ---------- A THERMAL, every frame (from main.js's vent loop) ---------- */
  H.thermal = (pr, dt) => {
    if (!S) return; if (pr.k === undefined) { pr.k = 0; pr.top = pr.y - pr.h - THERMAL.over; }
    const src = sourceOn(pr), sh = src ? shadedBy(pr) : null, want = src && !sh;
    pr.shade = sh; pr.src0 = src; pr.soon = want && cloudAt(pr.x, THERMAL.warn);
    pr.k = want ? Math.min(1, pr.k + dt / THERMAL.fadeIn) : Math.max(0, pr.k - dt / THERMAL.fadeOut); pr.active = pr.k > 0.25;
    if (pr.k <= 0.05) return;
    for (const p of ctx.players()) {
      if (!p || p.dead || p.plunge || p.climb || p.swim || p.snatched) continue;   /* (a plunge cuts down through the air: the Roc's thermal plunge) */
      if (Math.abs(p.x - pr.x) >= pr.w || p.y > pr.y + 2 || p.y <= pr.top) continue;
      const below = p.y - pr.top, crest = clamp(below / THERMAL.crest, 0, 1), up = (p.gliding ? THERMAL.glideLift : THERMAL.lift) * pr.k * crest;
      if (up > 6) { p.vy = Math.min(p.vy, -up); if (p.ground) { p.ground = false; p.onMover = null; } p.canCut = false; p.coyote = 0; }
      else if (p.vy > 20) p.vy = 20;   /* the crest: it holds you there, bobbing, while you drift off onto the ledge */
      if (!pr.rode) { pr.rode = true; S.n.rides++; }
      if (!p.sayRise) { p.sayRise = true; ctx.number(p.x, p.y - 24, 'THE HOT AIR CARRIES YOU UP', '#ffe9a0'); }
    }
  };

  /* ---------- THE HERO: the glide, the cloud sea, the cloak, his last solid footing ---------- */
  H.player = (dt, p, jumpHeld) => {
    if (!S || !p || p.dead) return;
    if (S.cloakAt && !S.cloak && Math.abs(p.x - S.cloakAt.x) < 14 && Math.abs(p.y - S.cloakAt.y) < 24) { S.cloak = true; ctx.sfx.sting && ctx.sfx.sting(); ctx.burst(p.x, p.y - 12, 14, ['#c9463d', '#efe6d2', '#ffd36b'], 70, 0.6); ctx.number(p.x, p.y - 30, "THE RIDER'S CLOAK: HOLD JUMP TO GLIDE", '#ffd36b'); }
    if (S.cloakAt && !S.cloak && p.x > S.cloakAt.x + 3 * TS) S.cloak = true;   /* past the mast you carry it (a checkpoint past the station, a load at the Eyrie: the road cannot be walked without it) */
    const can = S.cloak && !S.hung && jumpHeld && !p.ground && !p.plunge && !p.climb && !p.swim && !p.snatched && !(p.hurt > 0) && p.vy > GLIDE.fall;
    if (can) { p.vy = GLIDE.fall; if (!p.gliding) S.n.glides++; p.gliding = true; if (Math.random() < dt * 16) ctx.parts.push({ x: p.x - (p.face || 1) * 6 + (Math.random() - 0.5) * 8, y: p.y - 15, vx: -(p.face || 1) * 30, vy: 12, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#c9463d' : '#efe6d2', size: 1, grav: 0 }); }
    else if (p.ground || !jumpHeld || p.vy < 0 && !p.gliding) p.gliding = false;
    /* the last SOLID footing: rock under both feet, not a crumbling span, not a mover */
    if (p.ground && !p.onMover) { const tx = Math.floor(p.x / TS), ty = Math.floor((p.y + 2) / TS), cr = (L().crumbles || []).some(c => ty === c.row && tx >= c.x0 - 1 && tx <= c.x1 + 1);
      if (!cr && ctx.solidAt(tx, ty) && ctx.solidAt(Math.floor((p.x - 5) / TS), ty) && ctx.solidAt(Math.floor((p.x + 5) / TS), ty)) S.safe = { x: p.x, y: p.y }; }
    if (p.y > L().cloudSea + CATCH.below * TS) {
      S.n.catches++; ctx.burst(p.x, L().cloudSea, 18, ['#ffffff', '#eaeff6', '#d6dfec'], 110, 0.7, -200, 2); ctx.sfx.puff && ctx.sfx.puff();
      ctx.damage(p.x, CATCH.dmg, { unblockable: true, noKnock: true, name: 'THE DROP' });
      if (!p.dead && p.hp > 0) { const s = S.safe || ctx.checkpoint(); p.x = s.x; p.y = s.y; p.vx = 0; p.vy = 0; p.onMover = null; p.gliding = false; ctx.number(p.x, p.y - 30, 'THE UPDRAFT THROWS YOU BACK', '#bfe6f5'); }
    }
  };
  H.hasCloak = () => !!(S && S.cloak && !S.hung);
  H.hang = () => { if (S) S.hung = true; };   /* the Roc is down: the cloak goes back on a mast (src/roc-eyrie.js says when) */

  /* ---------- EVERY FRAME: stones, the disc, the riders' horn, the reel ---------- */
  H.update = dt => {
    if (!S) return;
    for (const s of S.stones.values()) s.turnT = Math.max(0, s.turnT - dt);
    if (S.disc) S.disc.turnT = Math.max(0, S.disc.turnT - dt);
    /* THE HORN CALLS THE RIDERS: every kite-rider in range is called into a swoop the moment a hornblower winds it */
    for (const e of ctx.enemies()) { if (e.t !== 'horn') continue; if (!e.alive || e.mode !== 'blow') { e.skyCall = false; continue; } if (e.skyCall) continue; e.skyCall = true;
      let n = 0; for (const r of ctx.enemies()) if (r.alive && r.t === 'kiterider' && r.st && r.st.fly && Math.abs(r.x - e.x) < 360) { r.st.called = true; n++; }
      if (n) say('horn', e.x, e.y - 30, 'THE HORN CALLS THE KITE-RIDERS', '#ff9a5c'); }
    /* THE ROC IS DOWN: the cloak goes back on a mast at the Eyrie (the level's tool does not follow you down the road) */
    { const A = L().arena, P = ctx.players()[0]; if (A && S.cloak && !S.hung && P && P.x > A.x0 && !ctx.enemies().some(e => e.t === 'roc' && e.alive)) { S.hung = true; ctx.number(P.x, P.y - 30, 'THE CLOAK GOES BACK ON ITS MAST', '#ffd36b'); } }
    /* a stone the disc lit: say so once */
    if (S.disc && ctx.time() < S.disc.until && !S.said.has('discRoad')) say('discRoad', S.disc.x, S.disc.y - 50, 'THE DISC TURNS: THE ROAD OF AIR RISES', '#ffd36b');
    if (S.disc && S.disc.until > 0 && ctx.time() > S.disc.until && S.disc.until > S.disc.litAt) { S.disc.litAt = -99; S.disc.until = -99; ctx.number(S.disc.x, S.disc.y - 40, 'THE SUN HAS MOVED OFF THE DISC', '#ffb070'); }
  };

  /* ---------- A BLOW ON A STONE OR THE DISC ---------- */
  H.strike = hb => {
    if (!S || !hb) return;
    for (const s of S.stones.values()) { if (s.on || hb.r < s.x - 9 || hb.l > s.x + 9 || hb.b < s.y - 18 || hb.t > s.y) continue;
      s.on = true; s.turnT = 0.6; S.n.stones++; ctx.sfx.stone && ctx.sfx.stone(); ctx.sfx.sting && ctx.sfx.sting(); ctx.shake(2); ctx.burst(s.x, s.y - 10, 12, ['#ffd36b', '#fff6c8', '#c8a050'], 70, 0.6);
      ctx.number(s.x, s.y - 30, 'THE STONE TURNS TO THE SUN: THE AIR RISES', '#ffd36b'); }
    const d = S.disc; if (d && !(hb.r < d.x - 14 || hb.l > d.x + 14 || hb.b < d.y - 34 || hb.t > d.y) && d.turnT <= 0) {
      const t = ctx.time(); d.turnT = 0.8; d.litAt = t < d.until ? d.litAt : t; d.until = t + DISC.live; S.n.disc++; S.said.delete('discRoad');
      ctx.sfx.stone && ctx.sfx.stone(); ctx.sfx.golemChime && ctx.sfx.golemChime(); ctx.shake(4); ctx.burst(d.x, d.y - 24, 20, ['#ffd36b', '#fff6c8', '#e0a040'], 110, 0.8); }
  };
  /* ---------- E AT THE LOFT: the cloths ---------- */
  H.interact = p => {
    if (!S || !S.loft || S.loft.open || !p) return false; const lo = S.loft; if (Math.abs(p.x - lo.x) > 22 || Math.abs(p.y - lo.y) > 24) return false;
    if (ctx.questGot() < ctx.questN()) { ctx.number(lo.x, lo.y - 30, 'THE LOFT WANTS FOUR CLOTHS', '#ffb070'); return true; }
    lo.open = true; const lv = L(); for (const v of (lv.vaultDoors || [])) for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) ctx.cellSet(x, y, ctx.T.AIR);
    ctx.sfx.sting && ctx.sfx.sting(); ctx.burst(lo.x - 30, lo.y - 30, 18, ['#c9463d', '#efe6d2', '#ffd36b'], 80, 0.8); ctx.number(lo.x, lo.y - 30, "THE RIDERS' LOFT OPENS", '#8fd160'); return true;
  };

  /* ---------- THE GREAT KITE REEL: the cage ---------- */
  const reelHot = () => { const r = L().reel; if (!r) return false; const s = S.stones.get(r.stone); return !!(s && s.on) && !cloudAt(r.x); };
  H.mover = (m, dt) => {
    if (!S || m.sky !== 'reel') return false;
    const oy = m.y, hot = reelHot(); S.reelK = hot ? Math.min(1, S.reelK + dt / REEL.up) : Math.max(0, S.reelK - dt / REEL.down);
    m.y = m.y0 + (m.y1 - m.y0) * S.reelK; m.dx = 0; m.dy = m.y - oy; m.hot = hot;
    if (hot && S.reelK > 0.05 && S.reelK < 0.95 && Math.random() < dt * 2) ctx.sfx.clank && ctx.sfx.clank();
    return true;
  };

  /* ---------- THE GOBLIN KITES ride their thermal: high in the sun, sunk into reach when it dies ---------- */
  const thermNear = (x, y) => { let best = null, bd = 1e9; for (const pr of ctx.props()) { if (pr.t !== 'vent' || !pr.thermal) continue; const d = Math.abs(pr.x - x); if (d < 70 && d < bd && y < pr.y) { bd = d; best = pr; } } return best; };
  H.thermNear = thermNear;
  H.kiteHover = e => {
    if (!S) return; if (e.skyHy === undefined) { e.skyHy = e.hy; let ty = Math.floor(e.hy / TS); while (ty < L().H - 1 && !ctx.solidAt(Math.floor(e.hx / TS), ty)) ty++; e.skyLow = Math.min(ty * TS - 28, e.hy + 160); }
    const pr = thermNear(e.hx, e.hy); const want = pr && pr.k > 0.4 ? e.skyHy : e.skyLow; e.hy += clamp(want - e.hy, -40 * (1 / 60), 70 * (1 / 60));
  };

  /* ---------- THE CRAG HARPY'S SNATCH (on the Sky Road her dive that lands takes you) ---------- */
  H.harpy = (e, dt, P) => {
    if (!S) return false;
    if (e.mode === 'dive' && !e.hit && !P.dead && !P.snatched && Math.abs(P.x - e.x) < 10 && Math.abs((P.y - 8) - e.y) < 12) {
      e.hit = true; const res = ctx.damage(e.x, Math.round(ctx.DMG.harpy * 0.5), { name: 'THE SNATCH' });
      if (res === 'blocked') { e.mode = 'downed'; e.modeT = 1.6; e.vy = -60; e.stagger = 1.6; ctx.number(e.x, e.y - 12, 'KNOCKED DOWN', '#8fd160'); ctx.sfx.screech(); return true; }
      if (res === 'hit' && !P.dead) { e.mode = 'snatch'; e.modeT = SNATCH.t; e.sdir = Math.sign(e.x - (S.safe ? S.safe.x : e.hx)) || (e.dvx > 0 ? 1 : -1); P.snatched = e; S.n.snatches++; ctx.sfx.screech(); ctx.number(P.x, P.y - 30, 'SHE HAS YOU: STRUGGLE', '#ff6b6b'); return true; }
      e.mode = 'rise'; e.modeT = 1; return true;
    }
    if (e.mode !== 'snatch') return false;
    e.modeT -= dt; e.anim = (e.anim || 0) + dt;
    if (P.dead || e.stagger > 0 || !e.alive) { H.drop(e, P); return true; }
    if (ctx.pressed()) { e.modeT -= SNATCH.mash; e.x += (Math.random() - 0.5) * 4; }
    e.y -= SNATCH.climb * dt; e.x += e.sdir * SNATCH.drift * dt; e.face = e.sdir;
    P.x = e.x; P.y = e.y + 18; P.vx = 0; P.vy = 0; P.ground = false; P.onMover = null;
    if (e.modeT <= 0) H.drop(e, P);
    return true;
  };
  H.drop = (e, P) => { if (P.snatched === e) { P.snatched = null; P.vy = 40; ctx.number(P.x, P.y - 26, 'SHE LETS GO', '#ffe9a0'); } e.mode = 'rise'; e.modeT = 1.4; e.cd = SNATCH.cd; };

  /* ---------- THE GOBLIN KITE-RIDER (the one new foe): a CV-style machine (main.js updateDesertFoe runs it; s = e.st) ----------
     ride      circles at its thermal's top (it needs the air: a dead thermal and it SINKS, lands and fights on foot - your opening)
     swoopTell  a yellow ! and a dashed line to where you stand (RIDER.tell s): the swoop is a kick a shield turns - and a turned swoop knocks him out of the sky
     swoop     down the line at RIDER.speed; climb back up to the air after it
     fall      his line is cut (any blow while he flies): he falls with the kite gone, and fights on foot - or the cloud sea has him
     foot / kickTell / kick   on his feet: he walks at you and kicks; while his kite is whole and his thermal comes back, he goes up again */
  H.newRider = (x, y, home) => ({ kind: 'kiterider', x, y, home, a: (x % 7) * 0.9, mode: 'ride', t: 0, cd: 1 + (x % 5) * 0.3, face: -1, frame: 0, fly: true, kite: true, vx: 0 });
  H.riderStep = (s, w, dt) => {
    const out = [], ev = (t, o) => out.push({ t, ...(o || {}) }); s.t -= dt; s.cd -= dt;
    const pr = thermNear(s.home, s.y), live = !!(pr && pr.k > 0.4), top = pr ? pr.top + RIDER.over : s.y;
    const dx = w.px - s.x, dy = w.py - 8 - s.y, ad = Math.abs(dx);
    switch (s.mode) {
      case 'ride': s.a += dt * 2.2; s.frame = 0; { const tx = s.home + Math.cos(s.a) * RIDER.ride, ty = top + Math.sin(s.a * 2) * 6; s.x += (tx - s.x) * Math.min(1, dt * 3); s.y += (ty - s.y) * Math.min(1, dt * 2.5); }
        s.face = Math.sign(dx) || s.face;
        if (!live) { s.mode = 'sink'; ev('sink'); break; }
        if ((s.called || s.cd <= 0) && ad < RIDER.sight && dy > -20 && dy < 220) { s.called = false; s.mode = 'swoopTell'; s.t = RIDER.tell; s.tx = w.px; s.ty = w.py - 8; s.frame = 3; ev('tell', { what: 'swoop', mark: '!' }); }
        break;
      case 'swoopTell': s.frame = 3; s.face = Math.sign(s.tx - s.x) || s.face; if (s.t <= 0) { const d = Math.hypot(s.tx - s.x, s.ty - s.y) || 1; s.vx = (s.tx - s.x) / d * RIDER.speed; s.vy = (s.ty - s.y) / d * RIDER.speed; s.t = (d + 40) / RIDER.speed; s.mode = 'swoop'; s.frame = 1; } break;
      case 'swoop': s.x += s.vx * dt; s.y += s.vy * dt; s.frame = 1; ev('hit', { what: 'swoop', box: [s.x - 8, s.x + 8, s.y - 8, s.y + 8], dmg: RIDER.dmg, blockable: true });
        if (s.t <= 0 || w.solid(s.x, s.y + 6)) { s.mode = 'climb'; s.cd = RIDER.cd; } break;
      case 'climb': s.frame = 0; s.x += (s.home - s.x) * Math.min(1, dt * 1.6); s.y += (top - s.y) * Math.min(1, dt * 1.6); s.face = Math.sign(s.home - s.x) || s.face;
        if (!live) { s.mode = 'sink'; break; } if (Math.abs(s.y - top) < 10) s.mode = 'ride'; break;
      case 'sink': s.frame = 2; s.y += RIDER.sink * dt; s.x += (s.home - s.x) * Math.min(1, dt); if (live) { s.mode = 'climb'; break; }
        if (w.solid(s.x, s.y + 2)) { s.fly = false; s.mode = 'foot'; s.t = 0.6; ev('land', { x: s.x, y: s.y }); }
        else if (s.y > w.sea) { s.fly = false; s.mode = 'fall'; } break;
      case 'fall': s.frame = 2; if (w.ground) { s.mode = 'foot'; s.t = 0.6; ev('land', { x: s.x, y: s.y }); } break;
      case 'foot': s.frame = 4 + (Math.floor(w.time * 8) % 2); s.face = Math.sign(dx) || s.face;
        if (s.kite && live && ad > 70) { s.mode = 'launch'; s.fly = true; ev('launch'); break; }
        if (s.t <= 0 && ad < RIDER.reach && Math.abs(dy) < 24 && s.cd <= 0) { s.mode = 'kickTell'; s.t = RIDER.kickTell; s.frame = 6; ev('tell', { what: 'kick', mark: '!' }); }
        else if (ad > 16 && ad < 260 && Math.abs(dy) < 60) s.x += s.face * RIDER.walk * dt; break;
      case 'kickTell': s.frame = 6; if (s.t <= 0) { s.mode = 'kick'; s.t = 0.2; s.frame = 7; } break;
      case 'kick': s.frame = 7; ev('hit', { what: 'kick', box: [s.x + (s.face > 0 ? 0 : -RIDER.reach), s.x + (s.face > 0 ? RIDER.reach : 0), s.y - 14, s.y], dmg: RIDER.kickDmg, blockable: true }); if (s.t <= 0) { s.mode = 'foot'; s.cd = RIDER.kickCd; s.t = 0.3; } break;
      case 'launch': s.frame = 0; s.y -= RIDER.rise * dt; s.x += (s.home - s.x) * Math.min(1, dt * 1.5); if (s.y <= top + 4) s.mode = 'ride'; if (!live) { s.fly = false; s.mode = 'fall'; } break;
    }
    return out;
  };
  /* a blow on him while he flies cuts his line: the kite goes, he falls */
  H.riderHurt = (e, fromX) => { const s = e.st; if (!s || !s.fly) return; s.fly = false; s.kite = false; s.mode = 'fall'; e.vy = -60; ctx.number(e.x, e.y - 30, 'THE LINE IS CUT', '#ffd36b'); ctx.sfx.crack && ctx.sfx.crack();
    ctx.burst(e.x, e.y - 24, 10, ['#c9463d', '#efe6d2', '#5a4232'], 70, 0.8); };
  /* his swoop taken on a shield knocks him out of the sky the same way (his kite holds: he goes up again once the air is back) */
  H.riderStruck = (e, res) => { const s = e.st; if (!s || res !== 'blocked' || s.mode !== 'swoop') return; s.fly = false; s.mode = 'fall'; s.cd = 1.5; e.vy = -80; e.stagger = 0.6; ctx.number(e.x, e.y - 24, 'KNOCKED OUT OF THE SKY', '#8fd160'); };

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`) ---------- */
  H.props = () => { if (!S) return []; const out = []; for (const s of S.stones.values()) out.push({ t: 'sunstone', x: s.x, y: s.y, on: s.on });
    if (S.disc) out.push({ t: 'sundisc', x: S.disc.x, y: S.disc.y, on: ctx.time() < S.disc.until });
    if (S.cloakAt) out.push({ t: 'cloak', x: S.cloakAt.x, y: S.cloakAt.y, on: S.cloak });
    if (S.loft) out.push({ t: 'loft', x: S.loft.x, y: S.loft.y, on: S.loft.open }); return out; };
  H.read = () => S ? { cloak: S.cloak, hung: S.hung, reelK: S.reelK, stones: [...S.stones.values()].map(s => ({ id: s.id, on: s.on })), disc: S.disc ? { until: S.disc.until, litAt: S.disc.litAt } : null, loft: S.loft && S.loft.open, safe: S.safe, n: { ...S.n } } : null;
  H.setStone = (id, on) => { const s = S && S.stones.get(id); if (s) s.on = on; };
  H.stone = id => S && S.stones.get(id);
  H.resetArena = () => { if (!S) return; for (const s of S.stones.values()) if (s.arena) s.on = false; };

  /* ---------- DRAWING (greybox: plain shapes; the Sonnet art pass replaces them) ---------- */
  /* THE SKY: the cloud banks high over their zones, and their shadows down over the rock and the air */
  H.drawSky = (g, cx, cy, VW, VH, time) => {
    if (!S) return;
    for (const c of cloudsNow()) { const x0 = Math.round(c.a - cx), x1 = Math.round(c.b - cx); if (x1 < -40 || x0 > VW + 40) continue;
      g.globalAlpha = 0.16; g.fillStyle = '#28304a'; g.fillRect(x0, 0, x1 - x0, VH); g.globalAlpha = 1;   /* the shadow: down through everything */
      const top = 6, w = c.z.w, lx = Math.round(c.left - cx);
      for (let k = 0; k < 5; k++) { const px = lx + w * (k + 0.5) / 5, r = 10 + (k % 2) * 5; g.fillStyle = '#d6dfec'; g.beginPath(); g.arc(px, top + 14, r, 0, 7); g.fill(); g.fillStyle = '#f4f6fa'; g.beginPath(); g.arc(px - 3, top + 10, r * 0.6, 0, 7); g.fill(); }
      g.fillStyle = '#d6dfec'; g.fillRect(lx + 4, top + 14, w - 8, 10); }
  };
  /* THE THERMALS: shimmer columns, dimmed by their state; a column about to die flickers; a dead one shows its rock dark */
  H.drawThermal = (g, pr, cx, cy, time) => {
    if (!S) return; const x = Math.round(pr.x - cx), foot = Math.round(pr.y - cy), top = Math.round((pr.top ?? (pr.y - pr.h - THERMAL.over)) - cy), k = pr.k || 0;
    if (x < -40 || x > 600 || foot < -20 || top > 400) return;
    const flick = pr.soon && Math.floor(time * 10) % 2 ? 0.45 : 1;
    if (k > 0.03) { g.globalAlpha = 0.10 * k * flick; g.fillStyle = '#ffe9a0'; g.fillRect(x - pr.w, top, pr.w * 2, foot - top); g.globalAlpha = 1;
      for (let i = 0; i < 9; i++) { const ph = (time * (60 + i * 7) + i * 41) % Math.max(20, foot - top), yy = foot - ph, xx = x + Math.sin(time * 3 + i * 1.7 + yy * 0.05) * (pr.w - 4);
        g.globalAlpha = (0.25 + 0.4 * k) * flick * (1 - ph / Math.max(20, foot - top)); g.fillStyle = i % 3 ? '#fff6c8' : '#ffb84a'; g.fillRect(Math.round(xx), Math.round(yy), 1, 4); }
      g.globalAlpha = 1; }
    /* the rock it rises from: hot when lit, grey when a cloud or no sun is on it */
    g.fillStyle = k > 0.25 ? '#ffb84a' : pr.src0 === false ? '#4a4a5a' : '#8a8aa0'; g.fillRect(x - 7, foot - 2, 14, 2);
    if (pr.shade === 'hawk' && k < 0.5) { g.fillStyle = '#5a4a3a'; g.fillRect(x - 3, foot - 4, 6, 2); }
  };
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const lv = L();
    /* THE SUN-STONES: a dark slab face-down; struck, it turns gold face to the sun */
    for (const s of S.stones.values()) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy); if (x < -30 || x > VW + 30) continue;
      const turning = s.turnT > 0, lift = turning ? Math.round(6 * Math.sin((1 - s.turnT / 0.6) * Math.PI)) : 0;
      g.fillStyle = '#2a2430'; g.fillRect(x - 8, y - 12 - lift, 16, 12); g.fillStyle = s.on ? '#ffc850' : '#55505e'; g.fillRect(x - 7, y - 11 - lift, 14, 10);
      g.fillStyle = s.on ? '#fff6c8' : '#6e6878'; g.fillRect(x - 5, y - 9 - lift, 4, 3); if (s.on) { g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 4); g.fillStyle = '#ffe9a0'; g.fillRect(x - 10, y - 16, 20, 4); g.globalAlpha = 1; } }
    /* THE SUN-DISC and its beam over the chasm */
    if (S.disc) { const d = S.disc, x = Math.round(d.x - cx), y = Math.round(d.y - cy), lit = ctx.time() < d.until;
      g.fillStyle = '#3a3040'; g.fillRect(x - 2, y - 20, 4, 20); g.fillStyle = '#2a2430'; g.beginPath(); g.arc(x, y - 30, 13, 0, 7); g.fill(); g.fillStyle = lit ? '#ffd36b' : '#a07a40'; g.beginPath(); g.arc(x, y - 30, 11, 0, 7); g.fill();
      g.fillStyle = lit ? '#fff6c8' : '#c8a060'; g.beginPath(); g.arc(x - 3, y - 33, 4, 0, 7); g.fill();
      const road = ctx.props().filter(pr => pr.t === 'vent' && pr.thermal && pr.src === 'disc:disc'); const far = road.length ? road[road.length - 1] : null;
      if (far) { g.globalAlpha = lit ? 0.35 + 0.1 * Math.sin(time * 6) : 0.12; g.strokeStyle = lit ? '#fff6c8' : '#c8a060'; g.lineWidth = lit ? 3 : 1; g.setLineDash(lit ? [] : [4, 4]); g.beginPath(); g.moveTo(x, y - 30);
        g.lineTo(Math.round(far.x - cx), Math.round(far.y - cy)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
        for (const pr of road) { g.globalAlpha = 0.5; g.fillStyle = lit ? '#ffd36b' : '#7a6040'; g.fillRect(Math.round(pr.x - cx) - 3, Math.round(pr.y - cy) - 6, 6, 4); g.globalAlpha = 1; } }
      if (lit) { const left = d.until - ctx.time(); if (left < 4 && Math.floor(time * 6) % 2) { g.fillStyle = '#ff9a5c'; g.fillRect(x - 12, y - 46, 24, 2); } } }
    /* THE CLOAK on its mast (until taken), and THE MASTS of the station */
    for (const dc of (lv.decor || [])) { const x = Math.round(dc.x * TS + 8 - cx);
      if (dc.kind === 'mast') { const y = Math.round((dc.y + 1) * TS - cy); g.fillStyle = '#5a4232'; g.fillRect(x - 1, y - 40, 3, 40); g.fillRect(x - 10, y - 40, 20, 2);
        if (!S.cloak) { g.fillStyle = '#c9463d'; g.fillRect(x - 9, y - 38, 18, 14); g.fillStyle = '#efe6d2'; g.fillRect(x - 9, y - 38, 18, 3); g.fillRect(x - 1, y - 35, 2, 11); }
        if (S.hung) { g.fillStyle = '#c9463d'; g.fillRect(x - 9, y - 38, 18, 14); } }
      else if (dc.kind === 'flue') { const y0 = Math.round(dc.y0 * TS - cy), y1 = Math.round((dc.y1 + 1) * TS - cy); g.fillStyle = '#4e4652'; g.fillRect(x - 8, y0, 24, y1 - y0); g.fillStyle = '#6e6470'; g.fillRect(x - 6, y0, 4, y1 - y0); g.fillStyle = '#2a2430'; g.fillRect(x - 10, y0 - 3, 28, 4); }
      else if (dc.kind === 'nest') { const y = Math.round((dc.y + 1) * TS - cy); g.fillStyle = '#7a5a3a'; g.beginPath(); g.ellipse(x, y - 3, 14, 4, 0, 0, 7); g.fill(); g.fillStyle = '#c8b090'; g.fillRect(x - 6, y - 6, 3, 2); g.fillRect(x + 2, y - 7, 3, 2); }
      else if (dc.kind === 'kiteplat') { const y = Math.round(dc.y * TS - cy); g.strokeStyle = '#d8c8a8'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 30, y); g.lineTo(x - 10, y - 90); g.moveTo(x + 30, y); g.lineTo(x + 10, y - 90); g.stroke();
        g.fillStyle = '#c9463d'; g.beginPath(); g.moveTo(x, y - 120); g.lineTo(x + 26, y - 96); g.lineTo(x, y - 80); g.lineTo(x - 26, y - 96); g.fill(); }
      else if (dc.kind === 'bridgehead') { const y = Math.round((dc.y + 1) * TS - cy); g.fillStyle = '#8a8478'; g.fillRect(x - 20, y - 70, 10, 70); g.fillRect(x - 24, y - 74, 18, 6); } }
    /* THE GREAT KITE REEL: the flue's hot air, the war-kite on it, and its line to the cage */
    if (lv.reel) { const r = lv.reel, cage = ctx.movers().find(m => m.sky === 'reel'), hot = cage && cage.hot, kx = Math.round(r.x - cx + Math.sin(time * 0.9) * 6), ky = Math.round(r.kiteY - cy + (1 - S.reelK) * 120 + Math.sin(time * 1.3) * 3);
      if (hot) { for (let i = 0; i < 8; i++) { const ph = (time * 70 + i * 23) % 140; g.globalAlpha = 0.5 * (1 - ph / 140); g.fillStyle = '#ffe9a0'; g.fillRect(Math.round(r.x - cx + Math.sin(time * 3 + i) * 8), Math.round(r.top - cy - ph), 1, 4); } g.globalAlpha = 1; }
      if (cage) { const mx = Math.round(cage.x + 16 - cx), my = Math.round(cage.y - cy); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(kx, ky + 22); g.lineTo(mx, my - 18); g.stroke();
        g.fillStyle = '#5a4232'; g.fillRect(mx - 16, my - 18, 2, 18); g.fillRect(mx + 14, my - 18, 2, 18); g.fillRect(mx - 16, my - 20, 32, 3); }
      g.fillStyle = '#2a2430'; g.beginPath(); g.moveTo(kx, ky - 26); g.lineTo(kx + 30, ky); g.lineTo(kx, ky + 22); g.lineTo(kx - 30, ky); g.closePath(); g.fill();
      g.fillStyle = hot ? '#c9463d' : '#8a4a40'; g.beginPath(); g.moveTo(kx, ky - 24); g.lineTo(kx + 27, ky); g.lineTo(kx, ky + 20); g.lineTo(kx - 27, ky); g.closePath(); g.fill(); g.fillStyle = '#efe6d2'; g.fillRect(kx - 1, ky - 22, 2, 42); g.fillRect(kx - 25, ky - 1, 50, 2); }
    /* THE RIDERS' LOFT's woven door (until it opens) */
    if (!S.loft || !S.loft.open) for (const v of (lv.vaultDoors || [])) { const x = Math.round(v.x0 * TS - cx), y = Math.round(v.y0 * TS - cy), h = (v.y1 - v.y0 + 1) * TS; g.fillStyle = '#6a4a2a'; g.fillRect(x, y, TS, h); g.fillStyle = '#a07848';
      for (let k = 0; k < h; k += 5) g.fillRect(x + (k % 10 ? 2 : 8), y + k, 6, 2); g.fillStyle = '#c9463d'; g.fillRect(x + 4, y + 6, 8, 6); }
    /* THE KITE-RIDERS' lines (the kite drawn over the goblin) and the snatch's talons */
    for (const e of ctx.enemies()) { if (!e.alive) continue;
      if (e.t === 'kiterider' && e.st && e.st.kite && e.st.fly) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy) - 14; g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y - 18); g.stroke();
        g.fillStyle = '#2a2430'; g.beginPath(); g.moveTo(x - 4, y - 34); g.lineTo(x + 12, y - 22); g.lineTo(x - 4, y - 14); g.lineTo(x - 20, y - 22); g.closePath(); g.fill(); g.fillStyle = e.st.mode === 'swoopTell' && Math.floor(time * 12) % 2 ? '#ffd36b' : '#3a8a4a'; g.beginPath(); g.moveTo(x - 4, y - 32); g.lineTo(x + 10, y - 22); g.lineTo(x - 4, y - 16); g.lineTo(x - 18, y - 22); g.closePath(); g.fill();
        if (e.st.mode === 'swoopTell') { g.globalAlpha = 0.6; g.strokeStyle = '#ffd36b'; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(x, y + 8); g.lineTo(Math.round(e.st.tx - cx), Math.round(e.st.ty - cy)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; } }
      if (e.t === 'harpy' && e.mode === 'snatch') { const x = Math.round(e.x - cx), y = Math.round(e.y - cy); g.fillStyle = '#c6a553'; g.fillRect(x - 5, y + 4, 2, 8); g.fillRect(x + 3, y + 4, 2, 8); } }
  };
  /* THE HUD: the cloak (a small kite-cloth mark under the health while you carry it) */
  H.drawHud = (g, x, y) => { if (!S || !S.cloak || S.hung) return; g.fillStyle = '#c9463d'; g.fillRect(x, y, 10, 8); g.fillStyle = '#efe6d2'; g.fillRect(x, y, 10, 2); g.fillRect(x + 4, y + 2, 2, 6); };
  return H;
}
