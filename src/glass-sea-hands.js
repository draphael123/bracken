// src/glass-sea-hands.js - THE GLASS SEA's HANDS (claude/glasssea, the greybox). src/glass-sea.js builds the level; this binds its rule to the game:
// THE MIRRORS (E turns one to its next notch, told: TO THE SKY / one way / the other), THE BEAMS (src/light.js trace from each source - the sun overhead,
// the low sunset ray, a campfire under a hood, THE COLOSSUS's GAZE - drawn as a bright line with a TARGET RING where it lands), THE SAND BEDS (a day beam
// on its heap FUSES the bed to glass from the near end, the beam walking across; turned away, it CRUMBLES), THE CRACKS (pits: a fall in is a blow and
// the last safe footing, never a death; by night a crack BOILS with the swarm unless firelight HOLDS it - a campfire near it or a fire beam on its ring),
// THE NIGHT (east of L.sunsetX the sun is gone - main.js asks noSun - and THE COLD fills its meter away from firelight), THE SLICK GLASS (a glass slope's
// slide runs faster), the cast's twists (a day beam DAZZLES a glass scorpion; a glass scorpion SHATTERS into a shard patch; a night hunter FREEZES in
// firelight; skitters will not step into it), the glint and the 10 s nudge (STUCK_HANDS.glasssea), and the drawing (sky, horizon, set, rule - src/redraw/glasssea_art.js, glasssea_set.js, glasssea_tiles.js).
// main.js calls: reset, on, update, interact, noSun, slide, hold, fear, onDeath, drawBack, drawWorld, drawOver, drawHud, read.
// Every teaching line goes through ctx.number with a line listed in src/hint-lines.js.
import { trace, makeOpaque } from './light.js';
import { isSlope, slopeGrade, SLIDE } from './slopes.js';
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';
import * as GSA from './redraw/glasssea_art.js';
import * as GSET from './redraw/glasssea_set.js';
import * as GPL from './redraw/glasssea_props.js';
import { shelfTile } from './redraw/glasssea_tiles.js';

/* THE NUMBERS: fuseT / crumbleT = s for a bed to fuse / crumble end to end; fireR = tiles a campfire's light reaches (warmth, fear, freeze); holdR = tiles from a
   fire to a crack's lip that hold it; boil = the swarm's push off an unheld crack (px/s, the blow, its cd); boilRows = how high the boiling swarm stands over its lip;
   spew = s between skitters out of a boiling crack (max alive from one); fall = the crack's blow; daz = s a glass scorpion stays dazzled; patch = the shard patch
   (s, tiles, the blow, its cd); slide = a glass slope's extra slide (px/s/s, and its cap over the hill's own top speed) */
export const GS = { fuseT: 1.2, crumbleT: 1.0, fireR: 4, holdR: 6, boilV: 190, boilDmg: 9, boilCd: 0.7, boilRows: 5, spew: 2.2, spewMax: 3, spewNear: 16, fallDmg: 20,
  daz: 2.6, patchT: 8, patchW: 2, patchDmg: 5, patchCd: 0.6, slideAcc: 300, slideCap: 1.3, retrace: 0.2, turnR: 22, turnY: 22 };
/* THE COLD (the sun meter's twin, by night): fill = s from warm to full away from fire; cool = s of firelight from full to warm; at full a tick every s, building */
export const COLD = { fill: 6, cool: 1.2, hurtEvery: 1, build: [3, 5, 8] };   /* (the sun meter's own fill: SUN.fill 6 s) */
const DIRWORD = { E: 'EAST', W: 'WEST', N: 'UP', S: 'DOWN' };
const TURN = { '/': { E: 'N', N: 'E', W: 'S', S: 'W' }, '\\': { E: 'S', S: 'E', W: 'N', N: 'W' } };

export function makeGlassSeaHands(ctx) {
  let GSx = null;
  const H = {};
  const once = k => { if (GSx.said[k]) return false; GSx.said[k] = 1; return true; };
  const TS = () => ctx.TS;
  H.on = () => !!GSx;
  H.state = () => GSx;

  /* ---------- RESET: a fresh load builds the rule's state; a respawn keeps the mirrors as they were turned and the beds as they are fused ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.glasssea) { GSx = null; return; }
    if (!GSx || GSx.L !== L) {
      GSx = { L, said: {}, clock: 0, retrace: 0, beams: [], lit: new Set(), fireLit: new Set(), sunLit: new Set(),
        mirrors: (L.mirrors || []).map(m => ({ ...m, n: 0, state: m.notches[0], flash: 0 })),
        beds: (L.beds || []).map(b => ({ ...b, k: 0, set: 0, hit: false })),
        cracks: (L.cracks || []).map(c => ({ ...c, held: false, spewT: 1, out: [], boilT: 0 })),
        fires: [...(L.fires || []), ...L.ents.filter(e => e.t === 'gscampfire' && e.arena).map(e => ({ id: e.id, x: e.x, y: e.y, arena: true }))], patches: [],
        n: { turns: 0, fused: 0, crumbled: 0, held: 0, boils: 0, falls: 0, spewed: 0, dazzled: 0, frozen: 0, shattered: 0, cold: 0, nudges: 0, slides: 0 } };
      for (const c of GSx.cracks) if (c.swarm) { const near = GSx.fires.filter(f => !f.arena && (f.x >= c.x0 - GS.holdR && f.x <= c.x1 + GS.holdR)); c.fireHeld = near.length > 0; }
    }
    GSx.stalls = {}; GSx.glint = null; GSx.stallKey = null; GSx.patches = [];
    for (const pp of ctx.players) { pp.gsCold = { v: 0 }; pp.gsSafe = null; pp.gsBoilK = 0; pp.gsPatchK = 0; }
    retrace();
    if (window.BK) Object.assign(window.BK, { glassSea: () => GSx, glassSeaHands: () => H });
  };

  /* ---------- THE BEAMS ---------- */
  const T = () => ctx.T;
  let opaqueT = null;
  const tileAt = (x, y) => { const m = GSx.mirrors.find(q => q.x === x && q.y === y); if (m && m.state === 'sky') return T().SOLID; return ctx.cellGet(x, y); };
  function receivers() { const R = []; for (const b of GSx.beds) R.push({ x: b.tx, y: b.ty, kind: 'bed', ref: b }); for (const c of GSx.cracks) if (c.ring) R.push({ x: c.ring[0], y: c.ring[1], kind: 'ring', ref: c }); return R; }
  function retrace() {
    if (!GSx) return; if (!opaqueT) opaqueT = makeOpaque(T(), isSlope);
    const L = GSx.L, R = receivers(), ms = GSx.mirrors.filter(m => m.state !== 'sky').map(m => ({ x: m.x, y: m.y, state: m.state }));
    GSx.beams = []; GSx.lit = new Set(); GSx.fireLit = new Set(); GSx.sunLit = new Set();
    for (const b of GSx.beds) b.hit = false; for (const c of GSx.cracks) c.ringHit = false;
    for (const s of L.sources || []) {
      if (s.kind === 'gaze' && !(ctx.gazeOn && ctx.gazeOn())) continue;
      const res = trace(tileAt, [{ x: s.x, y: s.y, dir: s.dir }], ms, R, { opaque: opaqueT, W: L.W, H: L.H });
      const fire = s.kind === 'fire'; let end = null;
      for (const k of res.lit) { GSx.lit.add(k); (fire ? GSx.fireLit : GSx.sunLit).add(k); }
      for (const i of res.hit) { const r = R[i]; end = r;
        if (r.kind === 'bed') { if (!fire) r.ref.hit = true; else if (once('fireBed')) ctx.number(ctx.hero().x, ctx.hero().y - 34, 'FIRELIGHT WILL NOT FUSE SAND: IT WANTS THE SUN', '#ffd36b'); }
        if (r.kind === 'ring') { if (fire) r.ref.ringHit = true; } }
      const last = res.segs[res.segs.length - 1];
      /* (glasssea2) a beam that stops on a mirror turned TO THE SKY lands on its disc (drawn soaking into the face, no ring) */
      let disc = null; if (!end && last) { const d = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] }[last.dir], q = GSx.mirrors.find(m => m.x === last.x1 + d[0] && m.y === last.y1 + d[1] && m.state === 'sky'); if (q) disc = { x: q.x, y: q.y, id: q.id }; }
      GSx.beams.push({ id: s.id, kind: s.kind, segs: res.segs, disc, end: end ? { x: end.x, y: end.y, recv: end.kind } : last ? { x: last.x1, y: last.y1, recv: null } : null });
    }
  }
  /* the next tile a mirror's beam would go, for each notch: told by the dial, and the glint's ring */
  const outDir = (m, inDir) => (m.state === 'sky' ? null : (TURN[m.state] || {})[inDir] || inDir);
  function inDirOf(m) { for (const b of GSx.beams) for (const sg of b.segs) if (sg.x1 === m.x && sg.y1 === m.y) return sg.dir; const s = (GSx.L.sources || []).find(q => q.id === m.id); return s ? s.dir : null; }
  const notchWord = (m, st) => { if (st === 'sky') return 'TO THE SKY'; const d = inDirOf(m) || 'S'; return DIRWORD[(TURN[st] || {})[d] || d]; };
  const say = (t, col) => { const P = ctx.hero(); if (P) ctx.number(P.x, P.y - 34, t, col || '#ffd36b'); };

  /* ---------- INTERACT (E): TURN the mirror in reach ---------- */
  H.interact = P => {
    if (!GSx) return false; const ts = TS();
    const m = GSx.mirrors.find(q => Math.abs(q.x * ts + 8 - P.x) <= GS.turnR && Math.abs((q.y + 2) * ts - P.y) <= GS.turnY); if (!m) return false;
    let next = (m.n + 1) % m.notches.length;
    if (m.shardNotch === next && ctx.questGot() < ctx.questN()) { if (once('vaultStuck') || (GSx.clock - (m.stuckSaid || -9) > 3)) { m.stuckSaid = GSx.clock; ctx.number(m.x * ts + 8, m.y * ts - 18, 'THIS NOTCH IS STUCK: FIVE GLASS SHARDS FREE IT', '#9aa39a'); } next = (next + 1) % m.notches.length; }
    m.n = next; m.state = m.notches[next]; m.flash = 0.4; GSx.n.turns++;
    ctx.sfx.clank && ctx.sfx.clank(); ctx.sfx.ratchet && ctx.sfx.ratchet();
    retrace();
    const told = 'THE MIRROR: ' + notchWord(m, m.state); ctx.number(m.x * ts + 8, m.y * ts - 18, told, '#fff6c8');   /* (a line of CALL_COUNTS: src/hint-lines.js) */
    return true;
  };
  H.noSun = x => !!GSx && x >= GSx.L.sunsetX * TS();
  const night = x => !!GSx && x >= GSx.L.sunsetX * TS() && !(GSx.L.arena && x >= GSx.L.arena.x0);
  H.night = night;

  /* ---------- FIRELIGHT: near a campfire, or on a tile a fire beam lights ---------- */
  const keyOf = (x, y) => x + ',' + y;
  const warmAt = (x, y) => { if (!GSx) return false; const ts = TS(), tx = Math.floor(x / ts), ty = Math.floor((y - 1) / ts);
    for (const f of GSx.fires) if (Math.abs(f.x - tx) <= GS.fireR && ty >= f.y - 4 && ty <= f.y + 1) return true;
    return GSx.fireLit.has(keyOf(tx, ty)) || GSx.fireLit.has(keyOf(tx, ty - 1)); };
  H.warmAt = warmAt;
  const sunLitBox = e => { const ts = TS(); for (let ty = Math.floor((e.y - (e.h || 10)) / ts); ty <= Math.floor((e.y - 1) / ts); ty++) for (let tx = Math.floor((e.x - (e.w || 10) / 2) / ts); tx <= Math.floor((e.x + (e.w || 10) / 2 - 1) / ts); tx++) if (GSx.sunLit.has(keyOf(tx, ty))) return true; return false; };

  /* ---------- THE CAST's TWISTS (main.js updateDesertFoe asks hold before a machine steps, fear before a walker steps) ---------- */
  H.hold = (e, dt) => { if (!GSx || !e.alive) return false;
    if (e.cnSkin === 'glassscorpion') { if (sunLitBox(e)) { if (!(e.gsDaz > 0)) { GSx.n.dazzled++; if (once('dazzle')) ctx.number(e.x, e.y - 22, 'DAZZLED: THE BEAM STUNS GLASS', '#fff6c8'); } e.gsDaz = GS.daz; } if (e.gsDaz > 0) { e.gsDaz -= dt; return true; } return false; }
    if (e.cnSkin === 'nighthunter') { if (warmAt(e.x, e.y)) { if (!e.gsFrozen) { e.gsFrozen = 1; GSx.n.frozen++; if (once('freeze') && Math.abs(ctx.hero().x - e.x) < 220) ctx.number(e.x, e.y - 26, 'FROZEN IN THE FIRELIGHT', '#ffd36b'); } return true; } e.gsFrozen = 0; return false; }
    return false; };
  H.fear = (e, x, y) => { const r = !!GSx && e.t === 'skitter' && (warmAt(x, y) || !!(ctx.colRelayAt && ctx.colRelayAt(x, y)));
    if (r) { GSx.n.feared = (GSx.n.feared || 0) + 1; const P = ctx.hero(); if (P && Math.abs(P.x - e.x) < 200 && once('fearTeach')) ctx.number(e.x, e.y - 22, 'THE SWARM WILL NOT CROSS FIRELIGHT', '#ffd36b'); }   /* (glasssea2: the teach beat, told where it happens) */
    return r; };   /* (and the Colossus's relayed firelight along its floor) */
  H.onDeath = e => { if (!GSx || e.cnSkin !== 'glassscorpion') return; const ts = TS(); GSx.patches.push({ x: e.x, y: e.y, t: GS.patchT }); GSx.n.shattered++;
    ctx.burst(e.x, e.y - 4, 12, ['#e8fff8', '#9ae8d0', '#5ab8a8'], 60, 0.6); if (once('shatter')) ctx.number(e.x, e.y - 24, 'IT SHATTERS: SHARDS IN THE SAND', '#9ae8d0'); };
  /* THE SLICK GLASS: a slide down a glass slope runs on faster than sand's (main.js, after its slide step) */
  H.slide = (P, ss, kind, dt) => { const max = slopeGrade(kind) === 1 ? SLIDE.maxSteep : SLIDE.maxGentle; if (!GSx || !ss.sliding || !kind || P.x < (GSx.L.glassFrom || 0) * TS()) return; const s = Math.sign(ss.vx) || 0; if (!s) return;
    ss.vx += s * GS.slideAcc * dt; const cap = max * GS.slideCap; if (Math.abs(ss.vx) > cap) ss.vx = s * cap; if (!P.gsSlid) { P.gsSlid = 1; GSx.n.slides++; } };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!GSx) return; GSx.clock += dt; const ts = TS(), P0 = ctx.hero(), Tt = T();
    GSx.retrace -= dt; if (GSx.retrace <= 0) { GSx.retrace = GS.retrace; retrace(); }
    for (const m of GSx.mirrors) m.flash = Math.max(0, m.flash - dt);
    /* (glasssea2) THE ROCKING MIRRORS: aimed (turned off the sky), a pulse mirror throws on a rhythm of the level's clock - HOLDS (on: a gold timer), FLICKERS (warn: the
       beam and its glass flicker), DROPS (off: rocked flat to the sky, the glass crumbles), COMES BACK. Turned back to the sky it stays there */
    { let rt = false;
      for (const m of GSx.mirrors) { if (!m.pulse) continue; const Q = m.pulse, per = Q.on + Q.warn + Q.off, aimed = m.n !== 0; let ph = null, st = 'sky', k = 0;
        if (aimed) { const t = ((GSx.clock + (Q.ph || 0)) % per + per) % per; if (t < Q.on) { ph = 'on'; k = 1 - t / Q.on; } else if (t < Q.on + Q.warn) { ph = 'warn'; k = 1 - (t - Q.on) / Q.warn; } else { ph = 'off'; k = (t - Q.on - Q.warn) / Q.off; } st = ph === 'off' ? 'sky' : m.notches[m.n]; }
        if (ph === 'off' && m.pph === 'warn') { GSx.n.drops = (GSx.n.drops || 0) + 1; if (P0 && Math.abs(P0.x - m.x * ts) < 300 && once('pulseDrop')) ctx.number(P0.x, P0.y - 34, 'THE MIRROR ROCKS OFF THE SUN: THE GLASS GOES', '#ffd36b'); }
        m.pph = ph; m.pk = k; if (st !== m.state) { m.state = st; rt = true; } }
      if (rt) retrace();
      for (const b of GSx.beams) { const wm = GSx.mirrors.find(m => m.pulse && m.pph === 'warn' && b.segs.some(sg => (sg.x1 === m.x && sg.y1 === m.y) || (sg.x0 === m.x && sg.y0 === m.y))); b.warnM = !!wm; b.alpha = wm ? (Math.floor(GSx.clock * 12) % 2 ? 0.25 : 1) : 1; }
      for (const bd of GSx.beds) bd.warn = GSx.beams.some(b => b.warnM && b.end && b.end.recv === 'bed' && b.end.x === bd.tx && b.end.y === bd.ty) ? 1 : 0; }
    /* THE BEDS: fuse while a day beam is on the heap, from the near end; crumble from the far end when it is not */
    for (const b of GSx.beds) { const k0 = b.k; b.k = b.hit ? Math.min(1, b.k + dt / (b.fuseT || GS.fuseT)) : Math.max(0, b.k - dt / (b.crumbleT || GS.crumbleT));   /* (glasssea2: a rocking mirror's glass steps fuse and go in a moment) */
      const want = Math.round(b.k * b.tiles.length);
      while (b.set < want) { const [x, y] = b.tiles[b.set++]; ctx.cellSet(x, y, Tt.ONEWAY); if (b.set % 3 === 1) ctx.burst(x * ts + 8, y * ts + 2, 4, ['#e8fff8', '#9ae8d0', '#ffd36b'], 40, 0.4); }
      while (b.set > want) { const [x, y] = b.tiles[--b.set]; ctx.cellSet(x, y, Tt.AIR); if (b.set % 3 === 0) ctx.burst(x * ts + 8, y * ts + 4, 4, ['#c8b48a', '#9ae8d0'], 30, 0.5); }
      if (k0 < 1 && b.k >= 1) { GSx.n.fused++; ctx.sfx.crack && ctx.sfx.crack(); if (P0 && Math.abs(P0.x - b.tx * ts) < 400) say('THE BEAM FUSES THE SAND: ' + (b.label || 'GLASS'), '#9ae8d0'); }
      if (k0 > 0 && b.k <= 0 && !b.hit) { GSx.n.crumbled++; if (P0 && Math.abs(P0.x - b.tx * ts) < 400) ctx.number(ctx.hero().x, ctx.hero().y - 34, 'THE GLASS CRUMBLES BACK TO SAND', '#c8b48a'); } }
    /* THE CRACKS */
    for (const c of GSx.cracks) {
      /* (glasssea2) A SEAM AT DUSK: THE CRACK STIRS - the first time you come near, it glows and hisses, and its swarm climbs out one by one (the teach: they will not cross firelight) */
      if (c.seam) { if (!c.spent && !(c.stirT > 0) && P0 && !P0.dead && P0.x > (c.x0 - (c.wake || 8)) * ts && P0.x < (c.x1 + 3) * ts && Math.abs(P0.y - c.y * ts) < 64) { c.stirT = 0.001; c.n = 0; GSx.n.stirs = (GSx.n.stirs || 0) + 1; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.shake && ctx.shake(2);
          ctx.number((c.x0 + c.x1 + 1) * ts / 2, c.y * ts - 30, 'THE CRACK STIRS', '#c8a8ff'); ctx.burst((c.x0 + c.x1 + 1) * ts / 2, c.y * ts - 2, 14, ['#2a2436', '#9a7ad8', '#e8dcb0'], 50, 0.6); }
        if (c.stirT > 0 && !c.spent) { c.stirT += dt; if (c.n < (c.stir || 3) && c.stirT > 1.0 + c.n * 0.5 && ctx.spawn && P0) { const sx = c.x0 + (c.n % (c.x1 - c.x0 + 1)), b = ctx.spawn({ t: 'skitter', x: sx, y: c.y - 1, face: P0.x < sx * ts ? -1 : 1, squad: 'stir' }); c.n++; if (b) { GSx.n.spewed++; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(b.x, b.y - 4, 8, ['#2a2436', '#9a7ad8', '#e8dcb0'], 40, 0.5); } }
          if (c.n >= (c.stir || 3) && c.stirT > 3.5) c.spent = true; }
        continue; }
      const wasHeld = c.held; c.held = !!c.swarm && (c.fireHeld || c.ringHit);
      if (c.swarm && c.held && !wasHeld && c.ringHit) { GSx.n.held++; if (P0 && Math.abs(P0.x - c.x0 * ts) < 300) ctx.number(ctx.hero().x, ctx.hero().y - 34, 'THE FIRELIGHT HOLDS THE CRACK', '#ffd36b'); }
      const boiling = c.swarm && !c.held && night(c.x0 * ts); c.boiling = boiling;
      if (boiling) { c.out = c.out.filter(q => q.alive); c.spewT -= dt;
        if (P0 && Math.abs(P0.x - (c.x0 + c.x1 + 1) * ts / 2) < GS.spewNear * ts && c.spewT <= 0 && c.out.length < GS.spewMax && ctx.spawn) { c.spewT = GS.spew;
          const side = P0.x < c.x0 * ts ? -1 : 1, b = ctx.spawn({ t: 'skitter', x: side < 0 ? c.x0 - 1 : c.x1 + 1, y: c.y - 1, face: side, squad: 'spew' }); if (b) { c.out.push(b); GSx.n.spewed++; ctx.burst(b.x, b.y - 4, 6, ['#2a2436', '#9a7ad8', '#e8dcb0'], 40, 0.5); } } } }
    /* ON THE HEROES: the crack's boil and its fall, the shard patches, the cold, the safe footing */
    for (const pp of ctx.players) { if (pp.dead) continue; pp.gsBoilK = Math.max(0, (pp.gsBoilK || 0) - dt); pp.gsPatchK = Math.max(0, (pp.gsPatchK || 0) - dt);
      for (const c of GSx.cracks) { if (c.seam) continue; const l = c.x0 * ts, r = (c.x1 + 1) * ts;
        if (c.boiling && pp.x > l - 6 && pp.x < r + 6 && pp.y > (c.y - GS.boilRows) * ts && pp.y < (c.y + 2) * ts && pp.gsBoilK <= 0) { pp.gsBoilK = GS.boilCd; GSx.n.boils++;
          const side = pp.x < (l + r) / 2 ? -1 : 1; ctx.asPlayer(pp, () => { const P = ctx.hero(); ctx.hurtHero(P.x, GS.boilDmg, { unblockable: true, noKnock: true, name: 'THE SWARM' }); P.vx = side * GS.boilV; P.vy = -140; P.ground = false; });
          if (once('boil') || GSx.clock - (GSx.boilSaid || -9) > 6) { GSx.boilSaid = GSx.clock; ctx.number(pp.x, pp.y - 34, 'THE CRACK BOILS WITH THE SWARM: FIRELIGHT HOLDS IT', '#ff9a5c'); } }
        if (pp.x > l + 2 && pp.x < r - 2 && pp.y > (c.y + 1.5) * ts) { GSx.n.falls++; const s = pp.gsSafe; GSx.lastFall = { id: c.id, x: Math.round(pp.x / ts), y: Math.round(pp.y / ts), safe: s && [Math.round(s.x / ts), Math.round(s.y / ts)] };
          ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!c.soft) ctx.hurtHero(P.x, GS.fallDmg, { unblockable: true, noKnock: true, name: 'THE CRACK' }); if (!P.dead && s) ctx.place(pp, s.x, s.y); });
          if (c.soft) { if (once('softFall')) ctx.number(pp.x, pp.y - 34, 'THE GLASS GAVE WAY: BACK TO THE LIP', '#9aa39a'); }   /* (glasssea2: the teaching pit costs nothing) */
          else if (once('fall')) ctx.number(pp.x, pp.y - 34, 'THE CRACK THROWS YOU BACK', '#9aa39a'); } }
      for (const p of GSx.patches) if (Math.abs(pp.x - p.x) < GS.patchW * 8 && Math.abs(pp.y - p.y) < 8 && pp.gsPatchK <= 0) { pp.gsPatchK = GS.patchCd; ctx.asPlayer(pp, () => ctx.hurtHero(ctx.hero().x, GS.patchDmg, { unblockable: true, noKnock: true, name: 'THE GLASS SHARDS' })); }
      /* the last safe footing: on the ground, off any crack's lip and off any fused bed */
      if (pp.ground && !pp.onMover) { const tx = Math.floor(pp.x / ts), fy = Math.floor((pp.y + 2) / ts);
        const nearCrack = GSx.cracks.some(c => !c.seam && tx >= c.x0 - 1 && tx <= c.x1 + 1), onBed = GSx.beds.some(b => b.tiles.some(([x, y]) => x === tx && y === fy));
        if (!nearCrack && !onBed) pp.gsSafe = { x: pp.x, y: pp.y }; }
      /* THE COLD (night, off the arena) */
      const cs = pp.gsCold || (pp.gsCold = { v: 0 });
      if (night(pp.x)) { const warm = warmAt(pp.x, pp.y);
        cs.v = warm ? Math.max(0, cs.v - dt / COLD.cool) : Math.min(1, cs.v + dt / COLD.fill); cs.warm = warm;
        if (cs.v >= 1) { cs.tick = (cs.tick ?? COLD.hurtEvery * 0.5) - dt; if (cs.tick <= 0) { cs.tick += COLD.hurtEvery; const d = COLD.build[Math.min(cs.n || 0, COLD.build.length - 1)]; cs.n = (cs.n || 0) + 1; GSx.n.cold++;
            ctx.asPlayer(pp, () => ctx.hurtHero(ctx.hero().x, d, { unblockable: true, noKnock: true, name: 'THE COLD' })); if (once('cold')) ctx.number(pp.x, pp.y - 34, 'THE COLD BITES: GET TO A FIRE', '#9ad0f0'); } }
        else { cs.tick = COLD.hurtEvery * 0.5; cs.n = 0; } }
      else { cs.v = Math.max(0, cs.v - dt / COLD.cool); cs.n = 0; cs.warm = false; } }
    for (const p of GSx.patches) p.t -= dt; GSx.patches = GSx.patches.filter(p => p.t > 0);
    /* THE FIRST LOOK at a thing: a line once (what it is, never the trick) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 48;
      if (P0.x >= GSx.L.sunsetX * ts && once('sunset')) ctx.number(P0.x, P0.y - 34, 'THE SUN GOES DOWN: THE COLD COMES', '#9ad0f0');
      for (const c of GSx.cracks) if (c.boiling && near((c.x0 + c.x1) * 8, c.y * ts, 120) && once('boilSeen' + c.id)) { ctx.number(P0.x, P0.y - 34, 'A CRACK BOILS: THE SWARM', '#ff9a5c'); break; } }
    stall(P0, dt);
  };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.glasssea) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'bed') { const b = GSx.beds.find(q => q.id === id); return b ? (b.k >= 1 ? 'fused' : 'sand') : ''; }
    if (kind === 'crack') { const c = GSx.cracks.find(q => q.id === id); return c ? (c.held ? 'held' : 'boils') : ''; }
    if (kind === 'mirror') { const m = GSx.mirrors.find(q => q.id === id); return m ? m.notches[m.n] : ''; }   /* (glasssea2: the notch it is SET to - a rocking mirror rocked off the sun is still set) */
    if (kind === 'lit') { const b = GSx.beams.find(q => q.id === id); return b && b.end && b.end.recv ? 'on' : 'off'; }
    return ''; };
  H.handsState = n => (GSx ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('glasssea', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { GSx.glint = null; GSx.stallKey = null; return; } const t = r.targets[0]; GSx.glint = { key: r.key, x: t.x, y: t.y };
    const C = GSx.stalls[r.key] = GSx.stalls[r.key] || newStall(); if (r.key !== GSx.stallKey) { GSx.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, GSx.clock, false)) { GSx.n.nudges++; GSx.lastNudge = r.line; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (src/redraw/glasssea_art.js, glasssea_set.js, glasssea_tiles.js, glasssea_props.js) ---------- */
  /* the sky and the landmark, behind the world: a bleached day, a violet dusk at the obelisk, night with an aurora past it; the Colossus on the horizon, growing as you come */
  H.drawBack = (g, cx, cy, time) => { if (!GSx) return; const L = GSx.L, vw = ctx.VW(), vh = ctx.VH(), ts = TS();
    const midX = cx + vw / 2, sun = L.sunsetX * ts, ax = L.arena ? L.arena.x0 : L.W * ts;
    const k = Math.max(0, Math.min(1, (midX - (sun - 30 * ts)) / (40 * ts)));   /* 0 day .. 1 night */
    const arenaPh = ctx.colPhase ? ctx.colPhase() : 0, target = arenaPh ? [0.55, 1, 0.15][arenaPh - 1] : k;
    /* the hour eases to where it is going (the fight's dusk, night and dawn come over a second or two; a respawn or a new load starts there) */
    const dt = GSx.kT == null ? 1 : Math.max(0, Math.min(0.2, time - GSx.kT)); GSx.kT = time; const easing = (arenaPh || GSx.ph) && Number.isFinite(GSx.ks) && dt <= 0.19;   /* (only the arena's phases ease: a walk, a respawn or a new load is the hour it is) */
    GSx.ks = !Number.isFinite(target) ? k : easing ? GSx.ks + (target - GSx.ks) * Math.min(1, dt * 1.6) : target;
    const kk = GSx.ks; GSx.k = kk; GSx.ph = arenaPh;
    GSA.drawSky(g, vw, vh, kk, time, arenaPh);
    const prog = Math.max(0, Math.min(1, midX / ax));
    GSA.drawHorizon(g, vw, vh, cx, prog, kk, time, midX >= ax - 6 * ts);
  };
  /* is there something to stand a mirror's post on (rows under it), and a fire under a hood */
  const footOf = (m, side = 0) => { const ts = TS(), col = Math.floor((m.x * ts + 8 + side) / ts); for (let yy = m.y + 1; yy < m.y + 9; yy++) { const t = ctx.cellGet(col, yy); if (t === ctx.T.SOLID || t === ctx.T.ONEWAY || isSlope(t)) return yy * ts - (m.y * ts + 8); } return 24; };
  /* THE BEAM'S PATH IN PX (glasssea2, Daniel 10-07 "the light CLIPS THROUGH the mirrors"): the trace is whole tiles, centre to centre; the drawing starts where the light comes
     from (the sun's shaft out of the open sky, the low sunset ray from the west, the fire's flame top, the giant's eyes at the wall) and stops where it lands: a receiver's
     ring (the tile's centre), a disc turned TO THE SKY (its face - the light soaks into the glass, no ring), or a wall (the wall's face). Bounces are the disc's centre (a
     slanted face passes through it). -> { pts: [[x, y]..], bounces: [[x, y]..], stop: 'recv' | 'disc' | 'wall', end: [x, y] } */
  const opaqueAt = (x, y) => { const t = ctx.cellGet(x, y); return t == null || opaqueT(t); };
  function beamPath(b) { const ts = TS(), L = GSx.L, s = (L.sources || []).find(q => q.id === b.id), C = v => v * ts + 8, pts = [], bounces = [];
    if (!s || !b.segs.length) return null;
    const sg0 = b.segs[0]; let x0 = C(sg0.x0), y0 = C(sg0.y0);
    if (s.kind === 'sun') { let y = s.y - 1, n = 0; while (y >= 0 && n++ < 40 && !opaqueAt(s.x, y)) y--; y0 = (y + 1) * ts; }   /* the sun's shaft, out of the open sky */
    else if (s.kind === 'sunset') { let x = s.x - 1, n = 0; while (x >= 0 && n++ < 60 && !opaqueAt(x, s.y)) x--; x0 = (x + 1) * ts; }   /* the low ray, from the west */
    else if (s.kind === 'fire') y0 = (s.y + 2) * ts - 14;   /* out of the flame's top */
    else if (s.kind === 'gaze') x0 = (s.x + 1) * ts;   /* out of the wall the eyes shine through */
    pts.push([x0, y0]);
    for (let i = 0; i < b.segs.length; i++) { const sg = b.segs[i]; pts.push([C(sg.x1), C(sg.y1)]); if (i < b.segs.length - 1) bounces.push([C(sg.x1), C(sg.y1)]); }
    const last = b.segs[b.segs.length - 1], [dx, dy] = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] }[last.dir], e = pts[pts.length - 1];
    let stop = 'wall';
    if (b.end && b.end.recv) stop = 'recv';
    else if (b.disc) { stop = 'disc'; e[0] = C(b.disc.x) - dx * 7; e[1] = C(b.disc.y) - dy * 3; }   /* the face of a disc flat to the sky: 7 px from its pivot along, 3 px across */
    else { e[0] += dx * 8; e[1] += dy * 8; }   /* the wall's face */
    if (pts.length === 2 && pts[0][0] === pts[1][0] && pts[0][1] === pts[1][1]) return { pts: [], bounces, stop, end: e };
    return { pts, bounces, stop, end: e };
  }
  /* a post that would stand in a beam's way: the light comes up into it from below, or goes down from it (src/glass-sea.js marks these mirrors side: their post stands aside on a bracket) */
  const SIDE = 9;
  H.beamPath = b => (GSx ? beamPath(b) : null);
  H.drawWorld = (g, cx, cy, time) => {
    if (!GSx) return; const R = Math.round, vw = ctx.VW(), vh = ctx.VH(), ts = TS(), inX = (x, m = 60) => x > cx - m && x < cx + vw + m, L = GSx.L;
    GSET.drawProps(g, L, T(), cx, cy, vw, vh, time);   /* the supports, the decor kinds, the dressing */
    { const sunX = L.sunsetX * ts; for (const z of L.shade || []) { if (z[1] < cx || z[0] > cx + vw || z[0] > sunX) continue; GSA.drawShade(g, R(z[0] - cx), R(z[1] - cx), R(z[2] - cy), R(z[3] - cy), Math.max(0, Math.min(1, (sunX - z[0]) / (12 * ts)))); } }   /* the day's shade, soft-edged (it fades into the dusk) */
    for (const c of GSx.cracks) { if (!inX(c.x0 * ts, 80) && !inX(c.x1 * ts, 80)) continue; if (c.seam) { GSA.drawSeam && GSA.drawSeam(g, R(c.x0 * ts - cx), R(c.y * ts - cy), (c.x1 - c.x0 + 1) * ts, c.stirT || 0, c.spent, time); continue; }
      GSA.drawCrack(g, R(c.x0 * ts - cx), R(c.y * ts - cy), (c.x1 - c.x0 + 1) * ts, c.swarm ? (c.held ? 'held' : night(c.x0 * ts) ? 'boil' : 'dark') : 'pit', time, GS.boilRows * ts, (L.glasssea && L.pitRow ? L.pitRow : 44) * ts - c.y * ts); }
    const plan = GPL.plan(L, T());
    const mView = GSx.mirrors.filter(m => inX(m.x * ts)).map(m => ({ m, x: R(m.x * ts + 8 - cx), y: R(m.y * ts + 8 - cy), hood: GSx.fires.some(f => f.x === m.x && f.y > m.y && f.y - m.y <= 3), side: m.side ? SIDE : 0, locked: m.shardNotch !== undefined && ctx.questGot() < ctx.questN() }));
    /* 1. THE MIRRORS' POSTS AND TRIPODS, under the light */
    for (const v of mView) GSA.drawMirrorBase(g, v.x, v.y, footOf(v.m, v.side), v.hood, v.side);
    /* 2. THE BEAMS: from where the light comes from to where it lands (beamPath) */
    const paths = []; for (const b of GSx.beams) { const col = b.kind === 'fire' ? 'fire' : b.kind === 'gaze' ? 'gaze' : b.kind === 'sunset' ? 'sunset' : 'sun', P = beamPath(b); if (!P) continue; paths.push([b, P, col]);
      for (let i = 0; i + 1 < P.pts.length; i++) { const [x0, y0] = P.pts[i], [x1, y1] = P.pts[i + 1]; if (Math.max(x0, x1) - cx < -20 || Math.min(x0, x1) - cx > vw + 20) continue; GSA.drawBeam(g, x0 - cx, y0 - cy, x1 - cx, y1 - cy, col, time, b.alpha ?? 1); } }
    /* 3. THE BEDS (the glass over the light that fused it) */
    for (const b of GSx.beds) { if (!inX(b.tx * ts, 400)) continue;
      /* a bed that is still sand: the ghost of the glass it will be (dotted, faint; brighter while a beam is on its heap) */
      for (let i = b.set; i < b.tiles.length; i++) { const [x, y] = b.tiles[i]; const a = b.hit ? 0.5 : 0.2 + 0.06 * Math.sin(time * 3 + x); g.fillStyle = 'rgba(255,236,170,' + a.toFixed(3) + ')'; for (let xx = 0; xx < 16; xx += 4) g.fillRect(R(x * ts - cx) + xx, R(y * ts - cy) + 2, 2, 1); g.fillRect(R(x * ts - cx), R(y * ts - cy) + 2, 1, 3); g.fillRect(R(x * ts - cx) + 15, R(y * ts - cy) + 2, 1, 3); }
      /* the fused tiles' supports, then the slabs (the arch of a long span under it) */
      for (const p of plan.posts) if (p.bed === b.id) { const idx = b.tiles.findIndex(([x, y]) => x === p.x && y === p.y0); if (idx >= 0 && idx < b.set && inX(p.x * ts)) GSET.drawPost(g, p, cx, cy, Math.min(1, 0.4 + b.k)); }
      for (const ar of plan.arches) if (ar.bed === b.id && b.set > 0) GSET.drawArch(g, ar, cx, cy, Math.min(1, b.set / b.tiles.length));
      const warn = b.warn > 0 && Math.floor(time * 14) % 2;   /* (a pulse bed whose mirror is about to rock off: the glass flickers) */
      for (let i = 0; i < b.set; i++) { const [x, y] = b.tiles[i], prev = b.tiles[i - 1], next = b.tiles[i + 1];
        const l = !(prev && prev[1] === y && prev[0] === x - 1), r = !(next && next[1] === y && next[0] === x + 1);
        if (warn) g.globalAlpha = 0.55;
        GSA.drawFused(g, shelfTile(x, y, l, r), R(x * ts - cx), R(y * ts - cy), b.hit ? 1 : b.k, time, b.hit, l, r); g.globalAlpha = 1; }
      GSA.drawHeap(g, R(b.tx * ts + 8 - cx), R((b.ty + 1) * ts - cy), b.hit, time); }
    for (const c of GSx.cracks) if (c.ring && inX(c.ring[0] * ts)) GSA.drawRing(g, R(c.ring[0] * ts + 8 - cx), R(c.ring[1] * ts + 8 - cy), c.ringHit, time, true);
    /* 4. WHERE EACH BEAM LANDS: a target ring on a receiver or a wall (never on a disc: a disc turned to the sky soaks the light into its face) */
    for (const [b, P, col] of paths) if (P.stop !== 'disc' && inX(P.end[0])) GSA.drawRing(g, R(P.end[0] - cx), R(P.end[1] - cy), P.stop === 'recv', time, false, col);
    for (const f of GSx.fires) if (inX(f.x * ts)) GSA.drawFire(g, R(f.x * ts + 8 - cx), R((f.y + 1) * ts - cy), time, f.x);
    /* 5. THE MIRRORS' FACES OVER THE LIGHT (the polished disc, the pivot, the dial), then the glint where a beam bounces and the glow where one soaks into a disc */
    for (const v of mView) GSA.drawMirrorFace(g, v.x, v.y, v.m.state, v.m.n, v.m.notches.length, v.m.flash, time, v.locked, v.hood, v.side);
    for (const [b, P, col] of paths) { for (const [x, y] of P.bounces) if (inX(x)) GSA.drawBounce(g, R(x - cx), R(y - cy), col, time); if (P.stop === 'disc' && inX(P.end[0])) GSA.drawDiscHit(g, R(b.disc.x * ts + 8 - cx), R(b.disc.y * ts + 8 - cy), col, time); }
    for (const v of mView) if (v.m.pulse && GSA.drawPulseTimer) GSA.drawPulseTimer(g, v.x, v.y, v.m, time);
    for (const e of ctx.enemies()) if (e.alive && e.t === 'skitter' && inX(e.x)) GSA.drawSkitterGlow && GSA.drawSkitterGlow(g, R(e.x - cx), R(e.y - cy), time, e.x);   /* (glasssea2) a violet glow under each skitter */
    for (const p of GSx.patches) if (inX(p.x)) GSA.drawPatch(g, R(p.x - cx), R(p.y - cy), p.t / GS.patchT, time);
    for (const e of ctx.enemies()) if (e.alive && e.cnSkin === 'glassscorpion' && e.gsDaz > 0 && inX(e.x)) GSA.drawDazzle(g, R(e.x - cx), R(e.y - 6 - cy), time);
    if (GSx.glint) drawGlint(g, R(GSx.glint.x - cx), R(GSx.glint.y - 18 - cy), vw, vh, time);
  };
  /* THE NIGHT over everything: the dusk's grade, then a blue dark that thins in every fire's light and along every fire beam */
  H.drawOver = (g, cx, cy, time) => { if (!GSx) return; const L = GSx.L, ts = TS(), vw = ctx.VW(), vh = ctx.VH(), sun = L.sunsetX * ts, ax = L.arena ? L.arena.x0 : 1e9;
    const ph = ctx.colPhase ? ctx.colPhase() : 0;
    GSA.drawGrade(g, vw, vh, GSx.k || 0);
    const darkAt = x => { if (x >= ax) return ph === 2 ? 0.42 : ph === 1 ? 0.16 : ph === 3 ? 0.05 : 0.2; return x < sun - 20 * ts ? 0 : Math.min(0.48, (x - (sun - 20 * ts)) / (30 * ts) * 0.48); };
    const lights = []; for (const f of GSx.fires) lights.push({ x: f.x * ts + 8, y: f.y * ts, r: GS.fireR * ts + 10 });
    for (const b of GSx.beams) if (b.kind !== 'sun' && b.kind !== 'sunset') for (const sg of b.segs) { const n = Math.max(Math.abs(sg.x1 - sg.x0), Math.abs(sg.y1 - sg.y0)); for (let i = 0; i <= n; i += 2) lights.push({ x: (sg.x0 + (sg.x1 - sg.x0) * i / Math.max(1, n)) * ts + 8, y: (sg.y0 + (sg.y1 - sg.y0) * i / Math.max(1, n)) * ts + 8, r: 26 }); }
    GSA.drawNight(g, vw, vh, cx, cy, darkAt, lights, time);
    /* (glasssea2) THE SWARM GLOWS: red-hot eyes over the dark, so the night's one new foe is never lost in it */
    for (const e of ctx.enemies()) if (e.alive && e.t === 'skitter' && e.x > cx - 20 && e.x < cx + vw + 20) GSA.drawSkitterEyes && GSA.drawSkitterEyes(g, Math.round(e.x - cx), Math.round(e.y - cy), e.face || 1, time, e.x);
  };
  /* THE HUD: by night THE FROST METER stands where the sun meter does (main.js drawCaravanHud asks first); true = drawn (the sun meter is not) */
  H.drawHud = (g, P) => { if (!GSx || !night(P.x)) return false; const cs = P.gsCold || { v: 0 }; GSA.drawFrostMeter(g, 22, 50, cs.v, cs.warm, ctx.time(), (cs.v >= 1 ? Math.min(3, (cs.n || 0) + 1) : 0)); if (cs.warm) ctx.text('FIRELIGHT', 44, 59, '#ffd36b', 'center', 6); return true; };
  H.read = () => GSx && { n: { ...GSx.n }, mirrors: GSx.mirrors.map(m => ({ id: m.id, state: m.state })), beds: GSx.beds.map(b => ({ id: b.id, k: +b.k.toFixed(2), hit: b.hit })),
    cracks: GSx.cracks.map(c => ({ id: c.id, held: c.held, boiling: !!c.boiling })), glint: GSx.glint && GSx.glint.key, lastNudge: GSx.lastNudge || null, lastFall: GSx.lastFall || null, cold: ctx.hero() && ctx.hero().gsCold ? +ctx.hero().gsCold.v.toFixed(2) : 0 };
  return H;
}
