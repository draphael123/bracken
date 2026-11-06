// src/ksar3-hands.js - KSAR 3's HANDS (claude/ksar3, the OPUS GREYBOX, 11-06). Binds the pure modules to the world; only a level with L.ksar3 (behind ?ksar3=1) wakes it.
//   THE SUN-SHADE STALKER (src/sun-stalker.js): its machine, its look (mirage-kit stalkerLook: nearly invisible in the glare, plain in shade, a told shimmer), its lunge.
//   THE GONG-MASTER (src/gong-master.js): the mini's fight, the yard's gongs (src/ksar-hands.js rings, cuts and - for him - re-hangs them), his called bandits.
//   THE MIRAGES (src/mirage-kit.js, the desert kit's: wired here for the first time): L.mirages shimmer and fade as you come; never footing.
// HAWK-MISTRESS 2 is src/hawk-mistress-hands.js's (the arena's hm.v2); this file does not touch her.
// GREYBOX drawing only (plain shapes + pose names) until the art lane. main.js calls: on, clear, owns, spawn, update, take, tick, onCut, drawFoe, drawWorld, drawOver, read.
import * as SK from './sun-stalker.js';
import * as GMM from './gong-master.js';
import { mirageInit, mirageStep } from './mirage-kit.js';
import { shadeZones, inShade, roofShade } from './sunstroke.js';
const { GM } = GMM;
const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), gong: s => (s.gong ? s.gong(true) : (s.bell || s.clank)()), slam: s => (s.boom || s.thud || s.crack)(),
  cymbal: s => (s.clank || s.parry)(), rope: s => (s.ratchet || s.tell)(false), clank: s => (s.clank || s.parry)(), shimmer: s => (s.hiss || s.tell)(false), slash: s => (s.foeSlash || s.slash)() };

export function makeKsar3Hands(ctx) {
  let K = null;
  const H = {}, R = Math.round, TS = () => ctx.TS;
  const L = () => ctx.L;
  H.on = () => !!(L() && L().ksar3);
  H.owns = e => !!e && (e.t === 'sunstalker' || e.t === 'gongmaster');
  const state = () => { const l = L(); if (!l || !l.ksar3) return null; if (!K || K.L !== l) K = { L: l, F: null, gm: null, zones: shadeZones(l), mir: mirageInit(l), said: {}, n: { stalkerHits: 0, stalkersDown: 0, mirSeen: 0, adds: 0 } }; return K; };
  H.clear = () => { const k = state(); if (k) { k.F = null; k.gm = null; } };   /* a respawn: the Gong-Master's fight starts again (his gongs keep what the yard's rule kept) */
  const say = (key, x, y, t, c) => { const k = state(); if (!k || k.said[key]) return; k.said[key] = 1; ctx.number(x, y, t, c || '#ffd36b'); };
  const snd = k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch { /* no sound */ } };

  /* ---------- SPAWN (main.js spawnEnt) ---------- */
  H.spawn = (e, base) => {
    if (e.t === 'sunstalker') { const st = SK.newStalker(base.x, base.y, { face: e.face || -1, x0: (e.x0 ?? e.x - 5) * TS() + 8, x1: (e.x1 ?? e.x + 5) * TS() + 8 });
      return { ...base, t: 'sunstalker', w: SK.STALK.w, h: SK.STALK.h, hp: ctx.EHP.sunstalker || SK.STALK.hp, noGrav: true, markH: SK.STALK.markH, face: st.face, mode: st.mode, st, squad: e.squad, look: { alpha: 0.1, shimmer: 0 } }; }
    if (e.t === 'gongmaster') return { ...base, t: 'gongmaster', w: GM.w, h: GM.h, hp: ctx.EHP.gongmaster || GM.hp, maxHp: ctx.EHP.gongmaster || GM.hp, mini: true, noGrav: true, markH: GM.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    return null;
  };

  /* ---------- THE WORLD AS THEY SEE IT ---------- */
  const exposure = (x, y) => { const k = state(); if (!k) return 'sun'; if (inShade(k.zones, x, y) || roofShade(ctx.tileAt, x, y - 10, t => t === ctx.T.SOLID)) return 'shade';
    if (ctx.noSun && ctx.noSun(x)) return 'shade'; return 'hot'; };   /* the Ksar's roofs are white-hot: the open sun is GLARE for him */
  const hitHeroes = (who, bx, d, name, o = {}) => { let any = false;
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
      if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return;
      if (o.low && !P.ground) return; if (o.duck && P.ducking) return;
      pp.k3Keys = pp.k3Keys || new Map(); if (pp.k3Keys.size > 80) pp.k3Keys.clear(); const key = o.key || name; if (pp.k3Keys.has(key)) return; pp.k3Keys.set(key, 1);
      const hp0 = P.hp; ctx.damagePlayer(who.x, d, { who, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); if (P.hp < hp0) any = true; }); return any; };
  const nearestHero = e => ctx.players.filter(p => !p.dead).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || ctx.hero();

  /* ---------- ONE FRAME OF EACH ---------- */
  H.update = (e, dt) => { const k = state(); if (!k || !e.alive) return;
    if (e.t === 'sunstalker') { const P = nearestHero(e);
      e.look = SK.stepStalker(e.st, e, dt, { x: P.x, y: P.y, alive: !P.dead }, { exposure, hit: (bx, d, o) => { const r = hitHeroes(e, bx, d, 'THE STALKER', o); if (r) k.n.stalkerHits++; return r; },
        sound: snd, mark: m => ctx.number(e.x, e.y - SK.STALK.markH, m, '#ffd36b'),
        said: (where, q) => say('stalker', q.x, q.y - 40, where === 'shade' ? 'IN THE SHADE YOU SEE HIM' : 'A SHIMMER IN THE GLARE: SOMETHING STANDS THERE', '#ffd36b') });
      e.mode = e.st.mode; e.hurt = Math.max(0, (e.hurt || 0) - dt); return; }
    if (e.t === 'gongmaster') { if (!ctx.miniActive || !ctx.miniActive()) return;
      if (!k.F) { const M = k.L.mini; k.F = GMM.newGongFight(GMM.gmGeom(M, TS())); k.gm = e; e.y = k.F.G.floorY; }
      if (e.mode === 'sleep') { e.mode = 'wake'; e.modeT = 1.4; ctx.number(e.x, e.y - 80, 'THE GONG-MASTER, BELL-KEEPER OF THE KSAR', '#ffd36b'); snd('gong'); }
      GMM.stepGongMaster(e, k.F, dt, ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, ducking: !!pp.ducking, pp })), world(e));
      if (!k.F.told.rule && e.mode !== 'wake' && e.mode !== 'sleep') { k.F.told.rule = 1; ctx.number((k.F.G.x0 + k.F.G.x1) / 2, k.F.G.floorY - 120, 'CUT A GONG ROPE AND HE IS SILENCED', '#ffd36b'); }
      e.phase = k.F.ph; }
  };
  function world(e) { const k = state(), G = k.F.G;
    return { number: (x, y, t, c) => ctx.number(x, y, t, c), sound: snd, shake: n => ctx.shake(n), music: ph => { if (ctx.music) ctx.music(ph > 1 ? 'banditking:p2' : 'banditking'); },
      mark: m => ctx.number(e.x, e.y - GM.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (kind, x, y) => { if (kind === 'open') ctx.ring(x, y - 16, 30, '#ffd36b'); else if (kind === 'ward') ctx.ring(x, y - 16, 34, '#9ab0c0'); else if (kind === 'wave') ctx.burst(x, y - 4, 12, ['#d9b36a', '#8a6a3a', '#e0c090'], 90, 0.5);
        else if (kind === 'slam' || kind === 'crash') ctx.burst(x, y - 4, 16, ['#c8a070', '#8a6a3a', '#e0c090'], 100, 0.6); else if (kind === 'gongfall') ctx.burst(x, y - 20, 14, ['#d9b36a', '#ffd36b', '#8a6a3a'], 80, 0.6); },
      hit: (bx, d, name, o) => hitHeroes(e, bx, d, name, o),
      gongs: () => ((ctx.gongs && ctx.gongs()) || []).filter(g => g.gm).map(g => ({ id: g.id, x: g.x * TS() + 8, cut: g.cut })),
      ring: id => (ctx.ringGong ? ctx.ringGong(id, 'guard') : 'cut'),
      rehang: id => { if (ctx.rehang) ctx.rehang(id); },
      call: n => { let got = 0; for (let i = 0; i < n; i++) { const door = G.doors[(k.n.adds + i) % G.doors.length]; const b = ctx.spawnGuard ? ctx.spawnGuard(door, G.floorY) : null; if (b) { b.gmAdd = true; got++; ctx.burst(door, G.floorY - 12, 8, ['#a8302a', '#5a1e1e'], 40, 0.5); } } k.n.adds += got; return got; },
      adds: () => ctx.enemies().filter(q => q.alive && q.gmAdd).length };
  }
  /* A ROPE CUT IN HIS YARD (src/ksar-hands.js cut -> ctx.bossCut) */
  H.onCut = g => { const k = state(); if (!k || !k.F || !k.gm || !k.gm.alive || !g.gm) return null; return GMM.ropeCut(k.gm, k.F, world(k.gm), g.id); };
  H.take = (e, dmg) => { const k = state(); if (!k) return dmg; if (e.t === 'gongmaster') return k.F ? GMM.gmTake(e, k.F, dmg) : 0; if (e.t === 'sunstalker') e.hurt = 0.2; return dmg; };
  H.end = () => { for (const q of ctx.enemies()) if (q.alive && q.gmAdd) { q.alive = false; ctx.burst(q.x, q.y, 8, ['#a8302a', '#5a1e1e'], 50, 0.5); } };
  /* THE LEVEL'S FRAME: the mirages */
  H.tick = dt => { const k = state(); if (!k) return;
    for (const ev of mirageStep(k.mir, dt, { seats: ctx.players, time: ctx.time(), profile: 'glare' })) { k.n.mirSeen++; const m = k.mir.list.find(q => q.def.id === ev.id); if (m) say('mirage', (m.px[0] + m.px[2]) / 2, m.px[1] - 20, ev.kind === 'shade' ? 'A MIRAGE - IT SHIMMERS: NO SHADE THERE' : 'A MIRAGE - IT SHIMMERS'); }
    if (k.gm && !k.gm.alive && !k.ended) { k.ended = true; H.end(); }
  };

  /* ---------- DRAWING (GREYBOX) ---------- */
  H.drawFoe = (g, e, cx, cy, time) => {
    if (e.t === 'sunstalker') { const L0 = e.look || { alpha: 1, shimmer: 0 }, x = R(e.x - cx + L0.shimmer * Math.sin(time * 30)), y = R(e.y - cy), f = e.face || 1;
      g.globalAlpha = Math.max(0.04, Math.min(1, L0.alpha));
      g.fillStyle = '#e8dcc0'; g.fillRect(x - 5, y - 18, 10, 14); g.fillStyle = '#c9b27c'; g.fillRect(x - 5, y - 6, 10, 6); g.fillStyle = '#3a2a1a'; g.fillRect(x - 3 + f, y - 15, 6, 2);   /* sun-bleached robe, the veil's slit */
      g.fillStyle = '#d0d8e0'; g.fillRect(f > 0 ? x + 5 : x - 11, y - 11, 6, 1);   /* the knife */
      g.globalAlpha = 1;
      if (L0.telling) { g.strokeStyle = 'rgba(255,240,200,0.7)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 7 + i * 7, y - 22); g.lineTo(x - 7 + i * 7 + R(Math.sin(time * 40 + i) * 2), y + 1); g.stroke(); } ctx.text('skCommit', x, y + 8, '#9aa39a', 'center', 4); }
      return; }
    if (e.t === 'gongmaster') { const k = state(), x = R(e.x - cx), y = R(e.y - (e.yOff ? -e.yOff : 0) - cy), f = e.face || 1, open = GMM.gmOpen(e);
      const yy = R(e.y + (e.yOff || 0) - cy);
      g.fillStyle = '#7a3a22'; g.fillRect(x - 9, yy - 30, 18, 22); g.fillStyle = '#c9a040'; for (let i = 0; i < 4; i++) g.fillRect(x - 7 + i * 4, yy - 24, 2, 2);   /* the brass-studded coat */
      g.fillStyle = '#5a3a24'; g.fillRect(x - 8, yy - 8, 6, 8); g.fillRect(x + 2, yy - 8, 6, 8); g.fillStyle = '#e8c8a0'; g.fillRect(x - 5, yy - 36, 10, 7);
      const up = e.mode === 'slamTell' || e.mode === 'strikeTell', mx = x + f * (up ? 4 : 14), my = up ? yy - 50 : yy - 18;   /* the mallet: overhead in a tell, out front otherwise */
      g.fillStyle = '#8a8a8a'; g.fillRect(Math.min(x, mx) , my + 4, Math.abs(mx - x) + 2, 2); g.fillStyle = '#c9a040'; g.fillRect(mx - 5, my - 2, 10, 8);
      if (open) { const k0 = e.open / (e.openT0 || GM.openT); g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x, yy - 16, 26, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#ffd36b'; g.fillRect(x - 16, yy - 48, R(32 * k0), 3); ctx.text('SILENCED', x, yy - 54, '#ffd36b', 'center', 5); }
      else if (k && k.F && k.F.ward > 0) { g.strokeStyle = '#9ab0c0'; g.beginPath(); g.arc(x, yy - 16, 28, 0, Math.PI * 2); g.stroke(); }
      if (e.pose) ctx.text(e.pose, x, yy + 9, '#9aa39a', 'center', 4); }
  };
  H.drawWorld = (g, cx, cy, time) => { const k = state(); if (!k) return;
    for (const m of k.mir.list) { if (m.alpha <= 0.01) continue; const [x0, y0, x1, y1] = m.px, sx = R(m.shimmer); g.globalAlpha = 0.55 * m.alpha;
      if (m.def.kind === 'shade') { g.fillStyle = '#c84a3a'; g.fillRect(R(x0 - cx) + sx, R(y0 - cy), R(x1 - x0), 3); g.fillStyle = '#efe0c0'; for (let x = x0; x < x1; x += 8) g.fillRect(R(x - cx) + sx, R(y0 - cy), 4, 3);
        g.fillStyle = 'rgba(80,60,120,0.18)'; g.fillRect(R(x0 - cx) + sx, R(y0 + 3 - cy), R(x1 - x0), R(y1 - y0 - 3)); }   /* a striped awning painted on the haze, its false shade */
      else { g.fillStyle = '#b8864e'; g.fillRect(R(x0 - cx) + sx, R(y0 - cy), R(x1 - x0), R(y1 - y0)); g.fillStyle = '#e0b878'; g.fillRect(R(x0 - cx) + sx, R(y0 - cy), R(x1 - x0), 2); }   /* a roof's mud-brick lip, shimmering */
      g.globalAlpha = 1; }
  };
  H.drawOver = (g, cx, cy, time) => { const k = state(); if (!k || !k.F || !k.gm || !k.gm.alive) return; const F = k.F, G = F.G;
    for (const w of F.waves) { const x = R(w.x - cx), y = R(G.floorY - cy); g.fillStyle = '#e0c090'; g.fillRect(x - GM.waveW, y - 4, GM.waveW * 2, 4); g.fillStyle = '#ffd36b'; g.fillRect(x - 2, y - GM.waveH, 4, GM.waveH); }
    if (F.cym) { const x = R(F.cym.x - cx), y = R(F.cym.y - cy); g.fillStyle = '#e0b040'; g.beginPath(); g.arc(x, y, GM.cymR, 0, Math.PI * 2); g.fill(); ctx.text(F.cym.ht === 'high' ? 'DUCK' : 'JUMP', x, y - 10, F.cym.ht === 'high' ? '#bfe6f5' : '#ffd36b', 'center', 4); }
    if (F.mark) { const x = R(F.mark.x - cx), y = R(G.floorY - 2 - cy), blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0'; g.fillStyle = 'rgba(30,10,10,0.55)'; g.fillRect(x - GM.swingR, y, GM.swingR * 2, 3); g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke(); }
    for (const r of F.rehang) if (r.told) { const gg = ((ctx.gongs && ctx.gongs()) || []).find(q => q.id === r.id); if (gg) ctx.text('RE-HANGING', R(gg.x * TS() + 8 - cx), R(G.archY - 8 - cy), '#ff9a5c', 'center', 5); }
  };
  H.read = () => { const k = state(); return k && { n: { ...k.n }, gm: k.F ? { ph: k.F.ph, n: { ...k.F.n }, mode: k.gm && k.gm.mode, hp: k.gm && k.gm.hp } : null, mirages: k.mir.list.map(m => ({ id: m.def.id, a: +m.alpha.toFixed(2) })) }; };
  return H;
}
