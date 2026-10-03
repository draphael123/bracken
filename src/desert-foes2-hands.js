// src/desert-foes2-hands.js - THE DESERT'S SECOND CAST, its HANDS (claude/desertfoes). src/desert-foes2.js is the rules (pure); this binds them to the
// game: THE BURNING PATCHES a fire scorpion leaves (they tick a hero who stands in them; the skin's POUR puts one out - a pourable for
// src/well-town-hands.js - and so does the gorge's water), THE VENOM a venom scorpion's sting puts in you (the Cistern Queen's stacks on the venom HUD,
// worn off here when she is not in the room to wear them off), THE SANDWORM's flood (the gorge's horn drives it under), and A DYNAMITE CHARGE IN
// THE FLOOD (its fuse fizzles). main.js calls: reset, update, onHit, onDeath, wormWorld, wet, pourable, drawWorld, read. Every teaching line goes
// through ctx.number with a line listed in src/hint-lines.js.
import { PATCH, VENOM, newPatch, patchStep, pourPatch, dousePatches, venomOn, venomTick } from './desert-foes2.js';
import { drawPatch } from './redraw/desert_foes2.js';

export const FIRE_SKIN = 'firescorpion', VENOM_SKIN = 'venomscorpion';
export function makeDesertFoes2Hands(ctx) {
  let DF = null;
  const H = {};
  const once = k => { if (DF.said[k]) return false; DF.said[k] = 1; return true; };   /* a teaching line once a level (each call below a literal: tools/hint-shown reads them) */
  H.reset = () => { const L = ctx.L; if (!L) { DF = null; return; }
    if (!DF || DF.L !== L) DF = { L, said: {}, patches: [], n: { patches: 0, doused: 0, flooded: 0, burns: 0, venom: 0, flushed: 0, fizzled: 0 } };
    DF.patches = [];   /* a respawn: the fires are out */
    if (window.BK) Object.assign(window.BK, { desertFoes2: () => DF, desertFoes2Hands: () => H }); };
  H.on = () => !!DF;
  const groundY = (x, y) => { const ts = ctx.TS; let ty = Math.floor((y - 2) / ts); for (let k = 0; k < 4; k++, ty++) if (ctx.standable(Math.floor(x / ts), ty)) return ty * ts; return null; };
  const addPatch = (e, x, y, life) => { const gy = groundY(x, y); if (gy === null || !DF) return null;
    const mine = DF.patches.filter(p => !p.out && p.from === e); if (mine.length >= PATCH.max) mine[0].out = true;
    const p = newPatch(x, gy, e, life); DF.patches.push(p); DF.n.patches++; return p; };

  /* A SCORPION'S BLOW, from main.js updateDesertFoe: v the machine's 'hit' event, landed = it took health off the hero */
  H.onHit = (e, v, landed, P) => { if (!DF || !e.cnSkin) return;
    if (e.cnSkin === FIRE_SKIN && v.what === 'sting') { const x = (v.box[0] + v.box[1]) / 2; const p = addPatch(e, x, e.y);
      if (p) { ctx.sfx.fireWhoosh ? ctx.sfx.fireWhoosh() : ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(p.x, p.y - 4, 8, ['#ff8a2a', '#ffd36b', '#c8281e'], 50, 0.5); } }
    if (e.cnSkin === VENOM_SKIN && v.what === 'sting' && landed && P) { venomOn(P, 1, VENOM); DF.n.venom++; if (once('venom')) ctx.number(P.x, P.y - 30, 'VENOM: YOUR STAMINA COMES BACK SLOWER', '#8fe04a'); } };
  /* a fire scorpion dies in a burst of its own fire */
  H.onDeath = e => { if (!DF || e.cnSkin !== FIRE_SKIN) return; const p = addPatch(e, e.x, e.y, PATCH.deathLife); if (p) ctx.burst(p.x, p.y - 6, 12, ['#ff8a2a', '#ffd36b', '#c8281e', '#2a1410'], 70, 0.6); };

  /* THE GORGE'S WATER where it runs now (the flood, a burst), or null off the gorge */
  const gorge = () => ctx.gorge && ctx.gorge();
  H.wet = (x, y) => { const G = gorge(); return !!(G && G.wetAt && G.wetAt(x, y)); };
  /* the world a SANDWORM reads: is the gorge's horn or its torrent on over its bed (a channel's columns) */
  H.wormWorld = s => { const G = gorge(), st = G && G.state && G.state(); if (!st) return false; if (st.phase === 'dry' && !G.wetAt(s.x, s.y - 6)) return false;
    const ts = ctx.TS, tx = Math.floor(s.x / ts), ty = Math.floor((s.y - 6) / ts); return (st.channels || []).some(c => tx >= c.x0 - 1 && tx <= c.x1 + 1 && ty >= c.y0 && ty <= c.y1); };
  H.flushed = (e, x, y) => { if (!DF) return; DF.n.flushed++; if (once('flush')) ctx.number(x, y - 26, 'THE HORN DRIVES IT UNDER', '#7ab8e8'); };
  H.fizzled = (x, y) => { if (!DF) return; DF.n.fizzled++; ctx.burst(x, y - 4, 8, ['#e8f4f8', '#9aa39a', '#7ab8e8'], 40, 0.6); ctx.sfx.hiss && ctx.sfx.hiss(); if (once('fizzle')) ctx.number(x, y - 24, 'THE FLOOD DOUSES THE FUSE', '#7ab8e8'); };

  /* THE POUR (src/well-town-hands.js asks pourables()): the near burning patch in front of you */
  H.pourable = { aim: P => { if (!DF) return null; const p = pourPatch(DF.patches, P.x, P.y, P.face || 1, 48); return p ? { x: p.x, y: p.y - 5 } : null; },
    pour: P => { if (!DF) return false; const p = pourPatch(DF.patches, P.x, P.y, P.face || 1, 48); if (!p) return false; const n = dousePatches(DF.patches, p); DF.n.doused += n;
      ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(p.x, p.y - 6, 12, ['#e8f4f8', '#9aa39a', '#7ab8e8'], 50, 0.8); ctx.number(P.x, P.y - 30, 'THE PATCH GOES OUT', '#8fd160'); return true; } };

  H.update = dt => {
    if (!DF) return;
    const heroes = ctx.players.filter(pp => !pp.dead), P0 = ctx.hero();
    for (const p of DF.patches) { if (p.out) continue;
      if (H.wet(p.x, p.y - 4)) { p.out = true; p.doused = true; DF.n.flooded++; ctx.burst(p.x, p.y - 4, 8, ['#e8f4f8', '#9aa39a'], 40, 0.6); continue; }   /* the gorge's water puts it out */
      for (const pp of patchStep(p, heroes.map(q => ({ x: q.x, y: q.y, w: q.w || 10, pp: q })), dt)) ctx.asPlayer(pp.pp, () => { DF.n.burns++; ctx.hurtHero(ctx.hero().x, PATCH.dmg, { unblockable: true, noKnock: true, name: 'THE BURNING PATCH' }); });
      if (P0 && Math.abs(P0.x - p.x) < 110 && Math.abs(P0.y - p.y) < 50) if (once('patch')) ctx.number(P0.x, P0.y - 30, 'WATER PUTS IT OUT', '#7ab8e8'); }
    DF.patches = DF.patches.filter(p => !p.out);
    if (DF.said.patch && DF.glintT === undefined) DF.glintT = 6;   /* THE GLINT over the patches for six seconds after the first is seen (the line says water; the glint says where) */
    if (DF.glintT > 0) DF.glintT -= dt;
    /* THE VENOM wears off a stack at a time (when THE CISTERN QUEEN is in the room, her hands wear it off: src/cistern-queen-hands.js) */
    if (!ctx.enemies().some(q => q.alive && q.t === 'cisternqueen')) for (const pp of ctx.players) if (pp.cqVenom && pp.cqVenom.length) venomTick(pp, dt, VENOM); else if (pp.venomSlow !== undefined && pp.venomSlow !== 1 && !(pp.cqVenom && pp.cqVenom.length)) pp.venomSlow = 1;
  };

  /* THE PATCHES on the floor, and over the first one you see, the glint (it says WHAT puts it out: water) */
  H.drawWorld = (g, cx, cy, time) => { if (!DF) return; const vw = ctx.VW();
    for (const p of DF.patches) { if (p.out || p.x < cx - 30 || p.x > cx + vw + 30) continue; drawPatch(g, p.x - cx, p.y - cy, p.t / p.life, time, PATCH.w);
      if (DF.glintT > 0) { const k = 0.5 + 0.5 * Math.sin(time * 5), x = Math.round(p.x - cx), y = Math.round(p.y - 22 - cy); g.globalAlpha = 0.35 + 0.45 * k; g.strokeStyle = '#bfe4ff'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 6 + 2 * k, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
    /* THE FIRE SCORPIONS smoulder: an ember now and then off the shell */
    for (const e of ctx.enemies()) if (e.alive && e.cnSkin === FIRE_SKIN && e.x > cx - 20 && e.x < cx + vw + 20) { const a = (time * 1.7 + e.x * 0.013) % 1; g.globalAlpha = 1 - a; g.fillStyle = a < 0.5 ? '#ffd36b' : '#ff6a2a'; g.fillRect(Math.round(e.x - cx - 4 + ((e.x * 7) % 9)), Math.round(e.y - 8 - a * 12 - cy), 1, 1); g.globalAlpha = 1; } };
  H.read = () => DF && { n: { ...DF.n }, patches: DF.patches.filter(p => !p.out).map(p => ({ x: Math.round(p.x), y: p.y, t: +p.t.toFixed(2) })) };
  return H;
}
