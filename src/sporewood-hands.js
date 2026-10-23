// src/sporewood-hands.js - SPOREWOOD 2, THE MOTHER'S KNOT: the level's rule and machines (claude/sporewood2, the OPUS GREYBOX, 2026-10-22; brief
// scratch/brief-sporewood2-1015.md, recipe scratch/review-rootway-recipe-1014.md). src/sporewood.js builds the level; this binds it to the game.
// main.js owns the world and calls: reset (spawnEntities), update, strike (a blow's box), props (the guide's), drawSky (THE MOTHER'S KNOT on the skyline),
// drawWorld (the puffs, the spores, the knots, the dark buds' and seed caps' marks, the area banner), read (tools), addSpring (the boss's spring spores).
// THE RULE (L.rule): THE CAPS GROW INTO STEPS, AND THE SPORES HELP YOU.
//   THE BUDS are main.js's growcap movers. Two kinds of this level's own, which main.js's growcap step asks this module about (growsUnder):
//     dark   (m.dark) grows under a hero only while it is LIT: a lantern cap (glowbud) burning within SP.litX / SP.litY of it. A struck lantern also wakes it at
//            once (main.js wakeMycelium). Unlit, standing on it says so.
//     seed   (m.seed) never grows under a hero: a BLOW on it grows it (strike) - and its PAIR with it (m.pair: a stair of two steps) - and it stands SP.seedHold
//            (or its own hold) as a STEP, then withers. THE MOTHER's
//            hollow is ringed with them (m.mother: src/mother-cap2.js withers them in her second phase).
//   THE SPORES HELP YOU:
//     LANTERN CAP  (main.js's glowbud: a blow lights it 14 s and wakes the buds near it) - here it also DAZZLES a lurker in its light: out of his cap, no lunge.
//     MEND PUFF    (ent 'mendpuff') walk into it or strike it: it bursts and mends SP.mend of your health over SP.mendT s. Once a life (it grows back on a death).
//     PUFFBALL     (ent 'springpuff') strike it: it bursts into a SPRING SPORE that hangs SP.springLife s - land on it and it throws you as a bounce cap does
//                  (hold jump: higher; plunge onto it: highest). It grows back. THE MOTHER's spore bloom and her brood make the same spring spores (addSpring).
//     ROOT KNOT    (ent 'rootknot') opens only FROM ABOVE: a plunge onto it opens its root door (stays open). A blade on it clanks FROM ABOVE (B10/B14).
// Every capital line it says goes through ctx.number with a line listed in SPW_SAY (and src/hint-lines.js).
import { SPRING_MOVE } from './hero-move.js'; import * as SW2ART from './redraw/sporewood2_world.js';
export const SP = { litX: 120, litY: 80, dazzle: 0.7, mend: 0.08, mendT: 1.0, mendR: 12, springLife: 6, springRegrow: 8, springW: 13, seedHold: 12, knotW: 12, knotH: 12 };
export const SPW_SAY = {
  lit: 'THE LANTERN CAP LIGHTS', dazzled: 'DAZZLED', dark: 'THIS BUD IS DARK: LIGHT A LANTERN CAP', mend: 'THE SPORES MEND YOU', spring: 'A SPRING SPORE',
  seed: 'THE SEED CAP GROWS', knot: 'THE KNOT OPENS', above: 'FROM ABOVE',
};

export function makeSporewoodHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().sporewood2);
  const say = (x, y, k, col = '#c9ffb0') => ctx.number(x, y, SPW_SAY[k], col);
  const once = k => { if (S.said.has(k)) return false; S.said.add(k); return true; };
  const P0 = () => ctx.players()[0];
  const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

  /* ---------- RESET (every load and every respawn) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.sporewood2) { S = null; return; }
    const keep = S && S.L === lv ? S : null;
    const knots = (lv.ents || []).filter(e => e.t === 'rootknot').map(e => { const was = keep && keep.knots.find(k => k.x === e.x && k.y === e.y);
      return { x: e.x, y: e.y, door: e.door, open: !!(was && was.open), px: e.x * TS + 8, py: (e.y + 1) * TS }; });
    for (const k of knots) if (k.open) openDoor(k, true);
    S = { L: lv, said: keep ? keep.said : new Set(), sec: -1, banner: null, knots,
      mends: (lv.ents || []).filter(e => e.t === 'mendpuff').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS, state: 'whole', t: 0, heal: 0 })),
      puffs: (lv.ents || []).filter(e => e.t === 'springpuff').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS, state: 'whole', t: 0 })),
      springs: [], lit: new Map(), darkSaid: 0,
      n: keep ? keep.n : { lit: 0, dazzled: 0, mended: 0, springs: 0, bounces: 0, seeds: 0, knots: 0 } };
    /* THE WALKER's machine hands (tools/level-walk.mjs workOf) work a prop with a numeric `hits` that is not `done`: an unlit lantern cap */
    for (const pr of ctx.props()) if (pr.t === 'glowbud') { pr.hits = pr.hits || 0; pr.done = (pr.lit || 0) > 2; }
  };
  H.load = () => { S = null; H.reset(); };
  function openDoor(k, quiet) {
    k.open = true; const [x0, x1, y0, y1] = k.door || [0, -1, 0, -1];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ctx.cellSet(x, y, ctx.T.AIR);
    if (!quiet) { ctx.shake(3); ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(k.px, k.py - 6, 14, ['#8fd160', '#6a5446', '#e0b0f0'], 90, 0.6); if (S) S.n.knots++; }
  }

  /* ---------- THE BUDS: does this one grow under a hero now? (main.js's growcap step asks) ---------- */
  const litNear = m => { const cx = m.x + m.w / 2, cy = m.y0; for (const pr of ctx.props()) if (pr.t === 'glowbud' && (pr.lit || 0) > 0 && Math.abs(pr.x - cx) < SP.litX && Math.abs(pr.y - cy) < SP.litY) return true; return false; };
  H.growsUnder = m => { if (!S) return true; if (m.seed) return false; if (m.dark) return !!m.lit; return true; };

  /* ---------- SPRING SPORES (the puffballs here; the Mother's bloom and brood through addSpring) ---------- */
  H.addSpring = (x, y, life, o) => { if (!S) return null; const s = { x, y, life: life || SP.springLife, max: life || SP.springLife, t: 0, ...(o || {}) }; S.springs.push(s); S.n.springs++; return s; };
  function stepSprings(dt) {
    S.springs = S.springs.filter(s => (s.life -= dt) > 0);
    for (const p of ctx.players()) { if (!p || p.dead) continue; const prevY = p.y - (p.vy || 0) * dt - 1;
      for (const s of S.springs) { const top = s.y - 4;
        if ((p.vy || 0) <= 0 || Math.abs(p.x - s.x) > SP.springW || prevY > top + 2 || p.y < top) continue;
        const held = ctx.keys().jump, pl = !!p.plunge; p.y = top; p.vy = pl ? SPRING_MOVE.BOUNCE_PLUNGED : held ? SPRING_MOVE.BOUNCE_HELD : SPRING_MOVE.BOUNCE; p.ground = false; if (pl) { p.plunge = false; p.canCut = false; }
        s.t = 0.25; S.n.bounces++; ctx.sfx.bounce ? ctx.sfx.bounce() : ctx.sfx.puff && ctx.sfx.puff(); ctx.burst(s.x, top, 6, ['#c9a0ff', '#fff1ff', '#bff0f0'], 50, 0.35);
        if (once('spring')) say(s.x, top - 18, 'spring', '#e0c8ff'); } }
  }

  /* ---------- UPDATE ---------- */
  H.update = dt => {
    if (!S) return; const lv = L(), P = P0(); if (!P) return;
    /* the area banner: the name of the place you have come into */
    const secs = lv.sections || []; const si = secs.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS);
    if (si >= 0 && si !== S.sec) { if (S.sec >= 0 || si > 0) S.banner = { name: secs[si].name, t: 0 }; S.sec = si; }
    if (S.banner) { S.banner.t += dt; if (S.banner.t > 3.4) S.banner = null; }
    /* THE LANTERN CAPS: a fresh light is said, wakes its dark buds (main.js) and dazzles the lurkers in it */
    const buds = ctx.props().filter(pr => pr.t === 'glowbud');
    for (const pr of buds) { const was = S.lit.get(pr) || 0, now = pr.lit || 0; pr.hits = pr.hits || 0; pr.done = now > 2;
      if (now > was + 1) { S.n.lit++; if (once('lit')) say(pr.x, pr.y - 30, 'lit', '#bff0f0'); }
      S.lit.set(pr, now); }
    for (const e of ctx.enemies()) { if (!e.alive || e.t !== 'lurker') continue;
      const inLight = buds.some(pr => (pr.lit || 0) > 0 && pr.light && Math.hypot(pr.x - e.x, pr.y - 8 - (e.y - 6)) < pr.light.r * 1.3);   /* (the light as drawn: main.js cuts its hole r x 1.3) */
      if (!inLight) { e.dazzled = 0; continue; }
      if (e.mode === 'hide' || e.mode === 'springTell') { e.mode = 'rest'; e.modeT = Math.max(e.modeT || 0, SP.dazzle); e.vx = 0; if (!e.dazzled) { S.n.dazzled++; say(e.x, e.y - 22, 'dazzled', '#bff0f0'); } }
      else if (e.mode === 'rest') e.modeT = Math.max(e.modeT || 0, SP.dazzle);
      e.dazzled = 1; }
    /* THE DARK BUDS: lit or not, and a hero on an unlit one is told */
    for (const m of ctx.movers()) { if (m.kind !== 'growcap' || !m.dark) continue; m.lit = litNear(m);
      if (!m.lit && m.state === 'bud' && P.onMover === m && Math.abs(P.vx) < 25) { S.darkSaid += dt; if (S.darkSaid > 0.6) { S.darkSaid = -3; say(m.x + m.w / 2, m.y - 24, 'dark', '#c9a0ff'); } } }
    /* MEND PUFFS: walked into */
    for (const q of S.mends) { if (q.state === 'whole') { for (const p of ctx.players()) if (p && !p.dead && Math.abs(p.x - q.x) < SP.mendR && Math.abs(p.y - 6 - (q.y - 6)) < 14) burstMend(q, p); }
      else if (q.state === 'mending') { q.t += dt; const p = q.who; if (p && !p.dead && q.heal > 0) { const d = Math.min(q.heal, (SP.mend * p.maxHp / SP.mendT) * dt); q.heal -= d; ctx.heal(p, d); } if (q.t > SP.mendT + 0.6) q.state = 'spent'; } }
    /* PUFFBALLS: grow back */
    for (const q of S.puffs) if (q.state === 'gone') { q.t -= dt; if (q.t <= 0) q.state = 'whole'; }
    stepSprings(dt);
    /* ROOT KNOTS: a plunge onto one opens it (from above: falling, over it, feet at its top) */
    for (const k of S.knots) { if (k.open) continue;
      for (const p of ctx.players()) if (p && !p.dead && p.plunge && (p.vy || 0) > 0 && Math.abs(p.x - k.px) < SP.knotW + 2 && p.y >= k.py - SP.knotH - 4 && p.y <= k.py + 4) {
        openDoor(k); say(k.px, k.py - 30, 'knot', '#8fd160'); p.plunge = false; p.vy = -300; p.ground = false; p.canCut = false; break; } }
  };
  function burstMend(q, p) { q.state = 'mending'; q.t = 0; q.who = p; q.heal = SP.mend * p.maxHp; S.n.mended++; ctx.sfx.puff && ctx.sfx.puff(); ctx.sfx.heal && ctx.sfx.heal();
    ctx.burst(q.x, q.y - 8, 16, ['#a6e04a', '#dfffa0', '#ffffff'], 60, 0.7); say(q.x, q.y - 26, 'mend', '#a6e04a'); }

  /* ---------- A BLOW ---------- */
  H.strike = hb => {
    if (!S || !hb) return; const P = P0();
    for (const q of S.mends) if (q.state === 'whole' && overlap(hb, { l: q.x - 8, r: q.x + 8, t: q.y - 14, b: q.y })) burstMend(q, P);
    for (const q of S.puffs) if (q.state === 'whole' && overlap(hb, { l: q.x - 7, r: q.x + 7, t: q.y - 13, b: q.y })) {
      q.state = 'gone'; q.t = SP.springRegrow + SP.springLife; ctx.sfx.puff && ctx.sfx.puff(); ctx.burst(q.x, q.y - 8, 14, ['#e8e0d0', '#c9a0ff', '#fff1ff'], 70, 0.6);
      H.addSpring(q.x, q.y - 8, SP.springLife); }
    /* SEED CAPS: a blow grows one (her hollow's too - src/mother-cap2.js may refuse one she is withering: m.noSeed) */
    for (const m of ctx.movers()) { if (m.kind !== 'growcap' || !m.seed || m.state !== 'bud' || m.cd > 0 || m.noSeed) continue;
      if (!overlap(hb, { l: m.x - 2, r: m.x + m.w + 2, t: m.y - 18, b: m.y + 10 })) continue;
      for (const q of m.pair ? ctx.movers().filter(q => q.kind === 'growcap' && q.seed && q.pair === m.pair && q.state === 'bud' && !(q.cd > 0) && !q.noSeed) : [m]) { q.state = 'grow'; q.k = 0; q.hold = q.hold || SP.seedHold; }   /* A PAIR GROWS AS ONE: a stair of two steps toward the way on (her knot) */
      m.struck = (m.struck || 0) + 1; S.n.seeds++; ctx.sfx.puff && ctx.sfx.puff(); ctx.burst(m.x + m.w / 2, m.y, 10, ['#8fd160', '#dfffa0', '#e0b0f0'], 60, 0.5);
      if (once(m.mother ? 'seedM' : 'seed')) say(m.x + m.w / 2, m.y - 22, 'seed', '#dfffa0'); }
    /* a ROOT KNOT turns a blade: it opens FROM ABOVE */
    for (const k of S.knots) if (!k.open && !(P && P.plunge) && overlap(hb, { l: k.px - SP.knotW, r: k.px + SP.knotW, t: k.py - SP.knotH, b: k.py })) {
      if (ctx.turned) ctx.turned(k.px, k.py - 8, SPW_SAY.above); else say(k.px, k.py - 24, 'above', '#ffd36b'); }
  };

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`) ---------- */
  H.props = () => { if (!S) return []; const out = [];
    for (const k of S.knots) out.push({ t: 'rootknot', x: k.px, y: k.py, on: k.open });
    return out; };
  H.read = () => S ? { sec: S.sec, banner: S.banner ? S.banner.name : null, n: { ...S.n }, knots: S.knots.map(k => ({ x: k.x, y: k.y, open: k.open })),
    mends: S.mends.map(q => q.state), puffs: S.puffs.map(q => ({ x: q.x, y: q.y, state: q.state })), springs: S.springs.map(s => ({ x: s.x, y: s.y, life: s.life })) } : null;
  /* THE WALKER (tools/level-walk.mjs via src/walk-hints.js): the next lock on the way - an unlit lantern cap by a dark bud, an unstruck seed cap, a knot */
  H.walkHint = (P, route) => {
    if (!S || !P) return null; const lv = L(), px = P.x, py = P.y;
    if (lv.arena && px > lv.arena.x0 - 8 * TS) return null;
    /* a dark bud ahead on his floor, not lit: the lantern cap nearest it */
    for (const m of ctx.movers()) { if (m.kind !== 'growcap' || !m.dark || m.lit || m.state !== 'bud') continue; const cx = m.x + m.w / 2;
      if (cx < px - 3 * TS || cx > px + 14 * TS || Math.abs(m.y0 - py) > 2 * TS) continue;
      const lt = ctx.props().filter(pr => pr.t === 'glowbud' && Math.abs(pr.x - cx) < SP.litX && Math.abs(pr.y - m.y0) < SP.litY).sort((a, b) => Math.abs(a.x - cx) - Math.abs(b.x - cx))[0];
      if (lt) { const side = px <= lt.x ? -1 : 1; return { x: lt.x + side * 14, y: lt.y, key: 'atk', face: -side, r: 16 }; } }
    /* a WEB across the way, at his height, within three tiles ahead: stand off it and cut it (one cut clears the curtain) */
    if (ctx.tileAt) for (const dir of [1, -1]) { const tx0 = Math.floor(px / TS), ty = Math.floor((py - 4) / TS); for (let d = 1; d <= 3; d++) { const tx = tx0 + dir * d; if (ctx.tileAt(tx, ty) === ctx.T.WEB || ctx.tileAt(tx, ty - 1) === ctx.T.WEB) { if (dir < 0 && !(route && route.some(([rx]) => rx < tx0 - 1))) break; return { x: tx * TS + 8 - dir * 18, y: py, key: "atk", face: dir, r: 4 }; } } }
    /* THE SEED STAIR (not her hollow's): standing on the low step, struck - the pair grows and the low one lifts him; up, a hop to the high one */
    for (const lo of ctx.movers().filter(q => q.kind === 'growcap' && q.seed && !q.mother && q.pair)) {
      const pair = ctx.movers().filter(q => q.kind === 'growcap' && q.seed && q.pair === lo.pair).sort((a, b) => a.rise - b.rise); if (pair[0] !== lo) continue; const hi = pair[pair.length - 1];
      const cx = lo.x + lo.w / 2; if (cx < px - 4 * TS || cx > px + 12 * TS) continue;
      if (P.onMover === hi) return null;
      if (P.onMover === lo && lo.state === 'up' && hi.state === 'up') return { x: lo.x + lo.w / 2, y: lo.y, hop: Math.sign(hi.x - lo.x) || 1, hold: 22, land: hi.x + hi.w / 2, r: 4 };
      const dir = Math.sign(hi.x - lo.x) || 1;
      if (P.onMover === lo && lo.state === 'bud' && !(lo.cd > 0)) return { x: P.x, y: P.y, key: 'atk', face: dir, r: 4 };   /* on the low bud: strike, facing the high one - the pair grows, the low one lifts him */
      if (P.onMover === lo) return { x: P.x, y: P.y, key: null, hold: true, r: 4 };
      if (lo.state === 'bud' && !(lo.cd > 0) && hi.state === 'bud' && Math.abs(lo.y0 + 8 - py) < 2 * TS) return { x: dir > 0 ? lo.x - 10 : lo.x + lo.w + 10, y: lo.y0 + 8, hop: dir, hold: 7, land: lo.x + lo.w / 2, r: 14 }; }   /* (a bud is landed on from above: a hop onto it) */
    return null;
  };

  /* ---------- DRAWING (src/redraw/sporewood2_world.js, the art pass) ---------- */
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return;
    SW2ART.drawWorld(g, S, SP, cx, cy, VW, VH, time);   /* (claude/sporewood2art) the puffs, spring spores and root knots, drawn (src/redraw/sporewood2_world.js); the buds' and seed caps' own marks are in drawGrowcap */
    /* the area banner */
    if (S.banner && ctx.text) { const a = Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4 + 0.2); g.globalAlpha = Math.max(0, Math.min(1, a)); g.fillStyle = 'rgba(24,12,30,0.62)'; g.fillRect(VW / 2 - 110, 26, 220, 18);
      g.fillStyle = '#c9a0ff'; g.fillRect(VW / 2 - 110, 26, 220, 1); g.fillRect(VW / 2 - 110, 43, 220, 1); ctx.text(S.banner.name, VW / 2, 31, '#efe6ff', 'center'); g.globalAlpha = 1; }
  };
  /* THE MOTHER'S KNOT on the skyline (src/redraw/sporewood_knot.js) */
  H.drawSky = (g, cx, cy, VW, VH, time, dY) => { const lv = L(); if (ctx.knotArt) ctx.knotArt(g, cx, cy, VW, VH, lv, time, dY); };
  return H;
}
