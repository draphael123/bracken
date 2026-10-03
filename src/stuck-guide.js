// src/stuck-guide.js - THE SHARED "WHAT NEXT" GUIDE (claude/stuckfix; Daniel 10-02/10-03: "not always clear what you need to do; you get stuck").
// One module for the whole game, lifted from src/canal-hands.js (claude/canalfix3) and src/red-gorge-hands.js (claude/redgorge):
//   - THE GLINT: a warm pulsing star and ring over the thing the route needs next; off the screen, a chevron at the screen edge.
//   - THE STALL NUDGE: after NUDGE.after s with no headway towards it, one short line naming the thing (never how to work it), again only after NUDGE.again s.
//   - THE WAY ARROW's stall feed: a stalled spot hands main.js its target, so the edge arrow (Settings: Way-on arrow = STALL by default) points at cranks,
//     winches, ropes, baskets and wells too, not only keys, shrines and the exit.
// WHERE the guide applies is DATA: src/stuck-spots.js holds each level's route list ("spots": a hero zone, the target tile(s), the nudge line, what is done).
// The canal feeds the same glint / stall clock from its own live target (holdTarget); the Red Gorge still carries its own copy of the code (batch59 is on
// src/red-gorge*.js) and moves onto this module after that merges. Greybox art: a star and a ring, plain shapes.
import { STUCK } from './stuck-spots.js';

export const NUDGE = { after: 10, again: 25, near: 48 };   /* s without headway before the nudge, s before it says it again, px of headway that counts (3 tiles) */
export const NUDGE_MAX = 62;                               /* one line of the hint box */

/* THE STALL CLOCK, one per thing the route needs: C = { t, best, said }. d = the hero's distance to it; a hero a few tiles nearer than he has been, or one who
   works it (reset), starts the clock again. True when the nudge is due now (the caller says the line) */
export const newStall = () => ({ key: null, t: 0, best: 1e9, said: -1 });
export function stallTick(C, d, dt, clock, reset) {
  if (d < C.best - NUDGE.near) { C.best = d; C.t = 0; } if (reset) C.t = 0;
  C.t += dt; if (C.t >= NUDGE.after && (C.said < 0 || clock - C.said >= NUDGE.again)) { C.said = clock; return true; }
  return false;
}

/* THE GLINT at screen (x, y): a pulsing ring and star; off the screen, a chevron at its edge pointing the way */
export function drawGlint(g, x, y, VW, VH, time) {
  const k = 0.5 + 0.5 * Math.sin(time * 5);
  if (x >= -8 && x <= VW + 8 && y >= -8 && y <= VH + 8) { g.globalAlpha = 0.35 + 0.45 * k; g.strokeStyle = '#ffe9a0'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 9 + 3 * k, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff6c8'; const r = 3 + Math.round(3 * k); g.fillRect(x - r, y, r * 2 + 1, 1); g.fillRect(x, y - r, 1, r * 2 + 1); g.fillRect(x - 1, y - 1, 3, 3); g.globalAlpha = 1; return; }
  const ex = Math.max(10, Math.min(VW - 10, x)), ey = Math.max(14, Math.min(VH - 14, y)), dx = Math.sign(x - ex), dy = Math.sign(y - ey); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#ffe9a0';
  for (let i = 0; i < 4; i++) g.fillRect(ex + dx * (i - 3) - (dy ? i : 0), ey + dy * (i - 3) - (dx ? i : 0), dy ? i * 2 + 1 : 1, dx ? i * 2 + 1 : 1);
  g.globalAlpha = 1;
}

/* ---------------- THE ROUTE LIST: which spot, which step, which targets ---------------- */
/* a state test: [propType, col, row, field] - the prop of that type within a tile and a half of (col, row) has `field` set ('!field': not set). No such prop: false */
function holds(env, [t, c, r, f]) {
  const neg = f[0] === '!', k = neg ? f.slice(1) : f; const p = env.props.find(q => q.t === t && Math.abs(q.x / env.TS - c - 0.5) <= 1.5 && Math.abs(q.y / env.TS - r) <= 2.5);
  return p ? (neg ? !p[k] : !!p[k]) : false;
}
const matches = (o, want) => !!o && Object.keys(want).every(k => o[k] === want[k]);
/* a target to pixels: a tile (col, row) = the middle of that tile's foot; a mover = its middle, a little above the top */
function pixelsOf(env, s) {
  if (s.mover) return env.movers.filter(q => matches(q, s.mover)).map(m => ({ x: m.x + (m.w || 16) / 2, y: m.y + 6 }));
  const list = s.ats || (s.at ? [s.at] : []); return list.map(([c, r]) => ({ x: c * env.TS + 8, y: (r + 1) * env.TS }));
}
/* WHAT THE ROUTE NEEDS NEXT FOR A HERO AT (col, row) on `levelId`: the first spot whose zone holds him, and in it the first step that is not done.
   { id, key, line, targets: [{x, y}], glint } or null. Pure (the tool runs it against the built level). */
export function resolve(levelId, col, row, env, spots = STUCK) {
  for (const sp of spots[levelId] || []) {
    const [c0, r0, c1, r1] = sp.zone; if (col < c0 || col > c1 + 1 || row < r0 || row > r1 + 1) continue;
    const steps = sp.steps || [sp];
    for (let i = 0; i < steps.length; i++) { const s = steps[i];
      if (s.zone && (col < s.zone[0] || col > s.zone[2] + 1 || row < s.zone[1] || row > s.zone[3] + 1)) continue;
      if (s.off && env.hero && matches(env.hero.onMover, s.off)) continue;   /* (not while he stands on it) */
      if (s.when && !holds(env, s.when)) continue; if (s.done && holds(env, s.done)) continue;
      const targets = pixelsOf(env, s); if (!targets.length) continue;
      return { id: sp.id, key: sp.id + (sp.steps ? '#' + i : ''), line: s.line || sp.line, targets, glint: s.glint || sp.glint || 'always' }; }
  }
  return null;
}

/* ---------------- THE LIVE GUIDE (main.js hands it a context) ---------------- */
export function makeGuide(ctx) {
  let lv = null, C = newStall(), cur = null, clock = 0, n = { nudges: 0 }, last = null;
  const env = () => ({ TS: ctx.TS, props: ctx.props(), movers: ctx.movers() });
  const G = {
    reset(levelId) { lv = levelId; C = newStall(); cur = null; clock = 0; n = { nudges: 0 }; last = null; },
    on: () => !!lv && !!STUCK[lv],
    update(dt) {
      if (!G.on()) { cur = null; return; } clock += dt; const e = env(), TS = ctx.TS;
      let hit = null, d = 1e9;
      for (const P of ctx.players()) { if (!P || P.dead > 0) continue; const r = resolve(lv, Math.floor(P.x / TS), Math.floor((P.y - 1) / TS), { ...e, hero: P }); if (!r) continue;
        const dd = Math.min(...r.targets.map(t => Math.hypot(P.x - t.x, P.y - t.y))); if (!hit) hit = r; if (r.key === hit.key) d = Math.min(d, dd); }
      if (!hit) { cur = null; C = newStall(); return; }
      if (hit.key !== C.key) { C = newStall(); C.key = hit.key; }
      cur = hit; const fire = stallTick(C, d, dt, clock, false);
      if (fire) { n.nudges++; last = hit.line; ctx.hint(hit.line); }
    },
    /* the stalled thing, for the way arrow: its nearest target, once NUDGE.after s have passed with no headway; `any` = the target even before the stall */
    target(any) { if (!cur || (!any && C.t < NUDGE.after)) return null; const P = ctx.players()[0]; const t = cur.targets.slice().sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
      return { x: t.x, y: t.y - 18, kind: 'guide', stalled: C.t >= NUDGE.after }; },
    draw(g, cx, cy, VW, VH, time) {
      if (!cur || (cur.glint === 'stall' && C.t < NUDGE.after)) return;
      for (const t of cur.targets) drawGlint(g, Math.round(t.x - cx), Math.round(t.y - 18 - cy), VW, VH, time); },
    read: () => ({ lv, key: cur && cur.key, line: cur && cur.line, t: C.t, nudges: n.nudges, lastNudge: last, targets: cur ? cur.targets : [] }),
  };
  return G;
}
