// src/glassblower-hands.js - BURIED CITY 5's HANDS (claude/bc5, 11-10, the SONNET code lane). Binds the pure modules to the world; only a level with L.bc5 (behind ?bc5=1) wakes it.
//   THE GLASSBLOWER (src/glassblower.js): the mini's fight in THE GLASSBLOWER'S HALL - his moves, his two hourglasses (the hall's risers and sinkers run on them: the level's
//     own FLIP, src/buried-city-flip.js), the cooled gobs that are a one-row step, and the opening: a hero's blow on the glinting hourglass (the flip's hook, below).
//   THE SAND GRASPER (src/sand-grasper.js): its machine, its boil and rise, its grab and HOLD (the mummy's, src/sealed-pyramid-hands.js stepGrabs: a blow tears you loose).
// GREYBOX drawing only (plain shapes + pose names) until the art lane. main.js calls: on, clear, owns, spawn, update, take, tick, drawFoe, drawWorld, drawOver, read.
import * as GBM from './glassblower.js';
import * as SG from './sand-grasper.js';
import { BC5_SAY } from './buried-city5.js';
const { GB } = GBM, { GRASP } = SG;
const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), lob: s => (s.slingWhirl || s.tell || s.clank)(false), blast: s => (s.hiss || s.puff || s.clank)(),
  flip: s => (s.ratchet || s.gateLift || s.clank)(), shatter: s => (s.crack || s.clank)(), clank: s => (s.clank || s.parry)(), boil: s => (s.puff || s.hiss || s.tell)(false), grab: s => (s.heavy || s.thud || s.clank)() };

export function makeGlassblowerHands(ctx) {
  let K = null, hooked = false;
  const H = {}, R = Math.round, TS = () => ctx.TS;
  const L = () => ctx.L;
  H.on = () => !!(L() && L().bc5);
  H.owns = e => !!e && (e.t === 'glassblower' || e.t === 'sandgrasper');
  const state = () => { const l = L(); if (!l || !l.bc5) return null; if (!K || K.L !== l) K = { L: l, F: null, gb: null, said: {}, steps: new Map(), ended: false, n: { grabs: 0, torn: 0, rises: 0, opens: 0 } }; return K; };
  const clearSteps = k => { for (const [col] of k.steps) { const row = k.L.mini.gb.R - 1; if (ctx.cellGet(col, row) === ctx.T.ONEWAY) ctx.cellSet(col, row, ctx.T.AIR); } k.steps.clear(); };
  H.clear = () => { const k = state(); if (k) { clearSteps(k); k.F = null; k.gb = null; k.ended = false; } for (const pp of ctx.players) pp.bcGrab = null; };   /* a respawn: his fight starts again (the mini stays dead once won: PROG) */
  const say = (key, x, y, t, c) => { const k = state(); if (!k || k.said[key]) return; k.said[key] = 1; ctx.number(x, y, t, c || '#ffd36b'); };
  const snd = n => { const f = SOUND[n]; if (f) try { f(ctx.sfx); } catch { /* no sound */ } };

  /* ---------- SPAWN (main.js spawnEnt) ---------- */
  H.spawn = (e, base) => {
    if (e.t === 'glassblower') return { ...base, t: 'glassblower', w: GB.w, h: GB.h, hp: ctx.EHP.glassblower || GB.hp, maxHp: ctx.EHP.glassblower || GB.hp, mini: true, noGrav: true, markH: GB.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    if (e.t === 'sandgrasper') { const st = SG.newGrasper(base.x, base.y, { face: e.face || -1 });
      return { ...base, t: 'sandgrasper', w: GRASP.w, h: GRASP.h, hp: ctx.EHP.sandgrasper || GRASP.hp, noGrav: true, markH: GRASP.markH, face: st.face, mode: st.mode, st, squad: e.squad, rose: false }; }
    return null;
  };

  /* ---------- THE WORLD AS THEY SEE IT ---------- */
  const hitHeroes = (who, bx, d, name, o = {}) => { let any = false;
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
      if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return;
      if (o.low && !P.ground) return; if (o.duck && P.ducking) return;
      pp.bc5Keys = pp.bc5Keys || new Map(); if (pp.bc5Keys.size > 80) pp.bc5Keys.clear(); const key = o.key || name; if (pp.bc5Keys.has(key)) return; pp.bc5Keys.set(key, 1);
      const dd = who.t === 'glassblower' && GB.capFrac ? Math.min(d, Math.max(1, Math.round((P.maxHp || 100) * GB.capFrac))) : d;   /* (claude/bc5fix) the damage cap */
      const hp0 = P.hp; ctx.damagePlayer(who.x, dd, { who, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); if (P.hp < hp0) any = true; }); return any; };
  const nearestHero = e => ctx.players.filter(p => !p.dead).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || ctx.hero();
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, ducking: !!pp.ducking, pp }));
  const flipFor = () => { const b = ctx.bch ? ctx.bch() : null; return b && b.flip; };

  /* A HERO'S BLOW ON A GLASS (src/buried-city-flip.js calls this through the hands' struckHooks): the mini only listens while its fight is on */
  H.struck = (g) => { const k = state(); if (!k || !k.F || !k.gb || !k.gb.alive || !ctx.miniActive()) return; GBM.hourStruck(k.gb, k.F, world(k.gb), g.id); if (k.gb.mode === 'buried') k.n.opens++; };
  function hook() { if (hooked) return; const b = ctx.bch ? ctx.bch() : null; if (!b || !b.struckHooks) return; b.struckHooks.push(g => H.struck(g)); hooked = true; }

  /* ---------- ONE FRAME OF EACH ---------- */
  H.update = (e, dt) => { const k = state(); if (!k || !e.alive) return; hook();
    if (e.t === 'sandgrasper') return stepGrasper(k, e, dt);
    if (e.t === 'glassblower') { if (!ctx.miniActive || !ctx.miniActive()) return;
      if (!k.F) { const M = k.L.mini; k.F = GBM.newGlassFight(GBM.gbGeom(M, TS())); k.gb = e; e.y = k.F.G.floorY; }
      if (e.mode === 'sleep') { e.mode = 'wake'; e.modeT = 1.4; ctx.number(e.x, e.y - 80, BC5_SAY.gbIntro, '#ffd36b'); snd('flip'); }
      GBM.stepGlassblower(e, k.F, dt, heroes(), world(e)); e.phase = k.F.ph; }
  };
  function world(e) { const k = state(), G = k.F.G;
    return { number: (x, y, t, c) => ctx.number(x, y, t, c), sound: snd, shake: n => ctx.shake(n), music: ph => { if (ctx.music) ctx.music(ph > 1 ? 'banditking:p2' : 'banditking'); },
      mark: m => ctx.number(e.x, e.y - GB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (kind, x, y) => { if (kind === 'open') ctx.ring(x, y - 16, 30, '#ffd36b'); else if (kind === 'ward') ctx.ring(x, y - 16, 34, '#9ab0c0'); else if (kind === 'gob') ctx.burst(x, y - 4, 12, ['#ff9a3c', '#ffd36b', '#fff0b0'], 90, 0.5); else if (kind === 'shatter') ctx.burst(x, y - 8, 14, ['#bfe6f5', '#ffffff', '#9ac8e0'], 110, 0.55); },
      hit: (bx, d, name, o) => hitHeroes(e, bx, d, name, o),
      flip: id => { const f = flipFor(); return f ? f.flipById(id) : false; },
      step: (x, on) => { const col = Math.floor(x / TS()), row = G.floorY / TS() - 1; if (on) { if (ctx.cellGet(col, row) === ctx.T.AIR) { ctx.cellSet(col, row, ctx.T.ONEWAY); k.steps.set(col, 1); } } else if (k.steps.has(col)) { if (ctx.cellGet(col, row) === ctx.T.ONEWAY) ctx.cellSet(col, row, ctx.T.AIR); k.steps.delete(col); } } };
  }
  /* ---------- THE SAND GRASPER ---------- */
  function stepGrasper(k, e, dt) { const P = nearestHero(e), s = e.st;
    if (s.mode === 'hold') { const held = ctx.players.some(pp => pp.bcGrab && pp.bcGrab.e === e); if (!held) { s.mode = 'recover'; s.t = GRASP.recover; } }
    /* a hero is held: it waits; else the machine runs. A grasper of a draining room rises as the sand leaves it (the hands stood it up: sandWait); any other when you come near */
    const evs = s.mode === 'hold' ? [] : SG.graspStep(s, { px: P.x, py: P.y, time: ctx.time(), woke: e.woke }, dt);
    e.x = s.x; e.face = s.face; e.mode = s.mode; e.pose = s.pose; e.hurt = Math.max(0, (e.hurt || 0) - dt);
    for (const v of evs) {
      if (v.t === 'boil') { snd('boil'); ctx.burst(e.x, e.y - 2, 10, ['#e6c98a', '#a87a40'], 50, 0.8); say('boil', e.x, e.y - 30, BC5_SAY.grBoil, '#ffd36b'); }
      else if (v.t === 'rise') { snd('boil'); ctx.burst(e.x, e.y - 8, 14, ['#e6c98a', '#a87a40', '#7a5a30'], 80, 0.7); k.n.rises++; e.rose = true; }
      else if (v.t === 'tell') { snd('tellHard'); ctx.number(e.x, e.y - GRASP.markH, v.mark, '#ff6b6b'); say('roll', e.x, e.y - 52, BC5_SAY.grRoll, '#ffd36b'); }
      else if (v.t === 'hit') { snd('grab'); const landed = hitHeroes(e, v.box, v.dmg, 'THE SAND GRASPER', { key: 'grasp' + e.x + ctx.time().toFixed(1), blockable: false });
        if (landed && v.grab) { for (const pp of ctx.players) if (!pp.dead && Math.abs(pp.x - e.x) < GRASP.grabR + 14 && Math.abs(pp.y - e.y) < 26) { pp.bcGrab = { e, t: GRASP.hold, tick: GRASP.tick }; k.n.grabs++; ctx.number(pp.x, pp.y - 30, BC5_SAY.grHold, '#ff6b6b'); } s.mode = 'hold'; s.pose = 'grHold'; e.mode = 'hold'; e.pose = 'grHold'; } }
    }
  }
  /* the hold (the mummy's, src/sealed-pyramid-hands.js): drawn in, a squeeze a tick, ends when it is struck (take), when its time is up, or when it dies */
  function stepGrabs(dt) { for (const pp of ctx.players) { const g = pp.bcGrab; if (!g) continue; const e = g.e;
    if (pp.dead || !e.alive || (g.t -= dt) <= 0) { pp.bcGrab = null; continue; }
    pp.x += ((e.x + (e.face || 1) * 9) - pp.x) * Math.min(1, dt * 6); pp.vx = 0; if (pp.vy < 0) pp.vy = 0;
    if ((g.tick -= dt) <= 0) { g.tick = GRASP.tick; ctx.asPlayer(pp, () => ctx.damagePlayer(e.x, GRASP.dmg.squeeze, { unblockable: true, noKnock: true, who: e, name: 'THE SAND GRASPER\'S GRIP' })); } } }
  /* A BLOW ON THEM: the grasper lets go when struck (the mummy's rule); the Glassblower takes it as his fight says (buried x1.75, warded x0.4, otherwise x0.5 - never 0) */
  H.take = (e, dmg) => { const k = state(); if (!k) return dmg;
    if (e.t === 'glassblower') return k.F ? GBM.gbTake(e, k.F, dmg) : 0;
    if (e.t === 'sandgrasper') { for (const pp of ctx.players) if (pp.bcGrab && pp.bcGrab.e === e) { pp.bcGrab = null; k.n.torn++; ctx.number(pp.x, pp.y - 30, BC5_SAY.grTear, '#8fd160'); }
      e.hurt = 0.2; const d = SG.graspTake(e, dmg); if (d > 0 && e.st && e.st.mode === 'hold') { e.st.mode = 'recover'; e.st.t = GRASP.recover; } return d; }
    return dmg; };
  /* THE LEVEL'S FRAME: the holds; the mini's steps cleared when he falls */
  H.tick = dt => { const k = state(); if (!k) return; hook(); stepGrabs(dt);
    if (k.gb && !k.gb.alive && !k.ended) { k.ended = true; clearSteps(k); } };
  H.end = () => { const k = state(); if (k) { k.ended = true; clearSteps(k); } };

  /* ---------- DRAWING (GREYBOX) ---------- */
  H.drawFoe = (g, e, cx, cy, time) => {
    if (e.t === 'sandgrasper') { const s = e.st, x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, pose = s ? s.pose : 'grWalk';
      if (pose === 'grBoil' || e.mode === 'buried' || e.mode === 'boil') { const a = e.mode === 'boil' ? 1 : 0.35; g.globalAlpha = a; g.fillStyle = '#a87a40'; for (let i = 0; i < 4; i++) g.fillRect(x - 8 + i * 4 + R(Math.sin(time * 14 + i) * 1), y - 3 - (i % 2) * 2, 3, 3); g.globalAlpha = 1; return; }
      g.fillStyle = '#c9b27c'; g.fillRect(x - 5, y - 16, 10, 14); g.fillStyle = '#8a6a3a'; g.fillRect(x - 5, y - 4, 10, 4); g.fillStyle = '#3a2a1a'; g.fillRect(x - 3 + f, y - 13, 6, 2);   /* a drowned body, sand to the shoulders */
      const up = pose === 'grWind' || pose === 'grHold', out = pose === 'grGrab';   /* ARMS: up and wide in the tell, forward in the grab */
      g.fillStyle = '#d9c28a'; if (up) { g.fillRect(x - 11, y - 24, 3, 12); g.fillRect(x + 8, y - 24, 3, 12); } else if (out) g.fillRect(f > 0 ? x + 5 : x - 18, y - 12, 13, 3); else { g.fillRect(x - 9, y - 12, 3, 8); g.fillRect(x + 6, y - 12, 3, 8); }
      if (pose === 'grRise') { g.fillStyle = '#a87a40'; g.fillRect(x - 9, y - 6, 18, 6); }
      if (pose === 'grRecover') { g.fillStyle = 'rgba(255,211,107,0.8)'; g.fillRect(x - 5, y - 28, 10, 2); ctx.text('OPEN', x, y - 30, '#ffd36b', 'center', 4); }
      return; }
    if (e.t === 'glassblower') { const k = state(), x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, open = GBM.gbOpen(e), pose = e.pose || 'gbIdle';
      g.fillStyle = '#6a4a2a'; g.fillRect(x - 9, y - 30, 18, open ? 12 : 22); g.fillStyle = '#c8b090'; g.fillRect(x - 5, y - 36, 10, 7);   /* the scorched apron, the head */
      if (!open) { g.fillStyle = '#4a3220'; g.fillRect(x - 8, y - 8, 6, 8); g.fillRect(x + 2, y - 8, 6, 8); }
      const up = pose === 'gbGobWind' || pose === 'gbFlipWind' || pose === 'gbBulbWind', px = x + f * (up ? 6 : 16), py = up ? y - 52 : y - 22;   /* the blowpipe: raised in a windup, out front otherwise */
      g.fillStyle = '#8a8a8a'; g.fillRect(Math.min(x, px), py + 4, Math.abs(px - x) + 2, 2);
      g.fillStyle = pose === 'gbGobWind' || pose === 'gbGobRel' ? '#ff9a3c' : '#c8a060'; g.fillRect(px - 3, py, 7, 7);   /* the gather on its end: glowing when he lobs */
      if (open) { g.fillStyle = '#e6c98a'; g.fillRect(x - 14, y - 18, 28, 18); g.fillStyle = '#a87a40'; g.fillRect(x - 14, y - 18, 28, 2);   /* buried to the waist */
        const k0 = e.open / (e.openT0 || GB.openT); g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 16, 26, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#ffd36b'; g.fillRect(x - 16, y - 48, R(32 * k0), 3); ctx.text('BURIED', x, y - 54, '#ffd36b', 'center', 5); }
      else if (k && k.F && k.F.ward > 0) { g.strokeStyle = '#9ab0c0'; g.beginPath(); g.arc(x, y - 16, 28, 0, Math.PI * 2); g.stroke(); }
      if (pose) ctx.text(pose, x, y + 9, '#9aa39a', 'center', 4); }
  };
  H.drawWorld = (g, cx, cy, time) => { const k = state(); if (!k || !k.F || !k.gb || !k.gb.alive) return;
    /* HIS HOURGLASS GLINTS (the one he turned): a gold sparkle ring and a timer over it - the opening, told */
    const G = k.F.G, gl = k.F.glint; if (!gl) return; const q = G.glasses.find(a => a.id === gl.id); if (!q) return; const x = R(q.x - cx), y = R(G.floorY - 22 - cy), a = 0.5 + 0.5 * Math.sin(time * 12);
    g.strokeStyle = 'rgba(255,230,140,' + (0.45 + a * 0.5) + ')'; g.beginPath(); g.arc(x, y, 14 + a * 3, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#ffd36b'; g.fillRect(x - 12, y - 24, R(24 * Math.max(0, gl.t / GB.glintT)), 2); ctx.text('STRIKE', x, y - 28, '#ffd36b', 'center', 4);
  };
  H.drawOver = (g, cx, cy, time) => { const k = state(); if (!k || !k.F || !k.gb || !k.gb.alive) return; const F = k.F, G = F.G;
    for (const gb of F.gobs) { const x = R(gb.x - cx);
      if (gb.fly) { g.fillStyle = '#ff9a3c'; g.beginPath(); g.arc(x, R(gb.y - cy), 4, 0, Math.PI * 2); g.fill(); const mk = R(gb.tx - cx), my = R(G.floorY - 2 - cy); g.strokeStyle = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0'; g.beginPath(); g.moveTo(mk - 6, my - 6); g.lineTo(mk + 6, my + 2); g.moveTo(mk + 6, my - 6); g.lineTo(mk - 6, my + 2); g.stroke(); }
      else if (gb.hot > 0) { g.fillStyle = '#ff7a2a'; g.beginPath(); g.moveTo(x - 6, R(G.floorY - cy)); g.lineTo(x, R(G.floorY - GB.gobH - cy)); g.lineTo(x + 6, R(G.floorY - cy)); g.fill(); ctx.text('HOT', x, R(G.floorY - GB.gobH - 4 - cy), '#ff9a5c', 'center', 4); }
      else if (gb.cooled) { g.fillStyle = '#9ac8e0'; g.fillRect(x - 6, R(G.floorY - 8 - cy), 12, 8); ctx.text('STEP', x, R(G.floorY - 12 - cy), '#bfe6f5', 'center', 4); } }
    if (F.blast) { const B = F.blast, a = Math.min(B.x, B.far ?? B.x), b = Math.max(B.x, B.far ?? B.x); g.fillStyle = 'rgba(255,170,70,0.5)'; g.beginPath(); g.moveTo(R(B.x - cx), R(G.floorY - 4 - cy)); g.lineTo(R((B.dir > 0 ? b : a) - cx), R(G.floorY - GB.blastH - cy)); g.lineTo(R((B.dir > 0 ? b : a) - cx), R(G.floorY - cy)); g.fill(); }
    for (const s of F.shards) { g.fillStyle = s.ht === 'low' ? '#bfe6f5' : '#ffffff'; g.fillRect(R(s.x - cx) - 3, R(s.y - cy) - 3, 6, 6); ctx.text(s.ht === 'low' ? 'JUMP' : 'BLOCK', R(s.x - cx), R(s.y - 8 - cy), '#bfe6f5', 'center', 4); }
  };
  H.read = () => { const k = state(); return k && { n: { ...k.n }, gb: k.F ? { ph: k.F.ph, n: { ...k.F.n }, mode: k.gb && k.gb.mode, hp: k.gb && k.gb.hp, glint: k.F.glint && k.F.glint.id } : null }; };
  return H;
}
