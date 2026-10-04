// fair-games.js - THE HARVEST FAIR's GAMES AND SIGHT (claude/fairlevel). Pure, no DOM, no globals of main.js; tools/harvest-fair.mjs proves it headless and in the page. main.js holds the
// hands (updateFairGames, the sight and the mirror in updateMummer, the night overlay).
//
//   THE HIGH STRIKER  a pad on the road under a bell. A HEAVY blow on it (a held heavy, the third cut, a dash cut, or a plunge onto it) rings the bell and THROWS you straight up (`launch`);
//                     a light blow only hops you. The first heavy ring pays tickets. Every hero has a heavy blow (the Geomancer's is her spur; the pad takes a plunge too).
//   THE GALLERY       targets hung at chest height. Hit all of them (any blow that reaches: every hero's melee does) inside `window` seconds and the planks run up the stall (tiles) and it pays.
//   TICKETS           the fair's own level-local keys (rec: level-local; no existing currency fits a fair). Earned from the games, found in secrets; never spent - held, they open the
//                     ticket gates (src/fair-keys.js; claude/fairfix2 retired the prize booth, claude/fairfix3 its last text). State lives in the level's own FAIR record.
//   THE NIGHT         the light goes out with HEIGHT (and inside the hall of mirrors): `sightFor` says how far a look reaches a foe standing where it stands. A foe in a lit lantern's light
//                     is seen as far as ever; one in the dark is seen only within `dim` px (the Maypole ribbon's x1.5 reach helps).
//   THE MIRROR        in the hall, a hero facing a TRUE mirror within `reach` px sees behind him too (`mirrorSees`): a foe at his back is looked at. A CRACKED mirror does not.
//   THE BLIND CORNER  in the corn maze the walls stop your look (`blocked`), and so does any wall in a box the level names (L.blinds: the exam's blind stall).
//   MORE THAN ONE HALL (claude/fairfix): L.halls lists every covered dark place with glass in it (the hall of mirrors, the last round's carousel canopy); L.hall is the
//                     first. L.unlit lists stretches of the road with no light at all ([x0, x1] columns): the door guard's. Both are dark as the tops are dark.
import { TS } from './mummer.js';
export const GAMES = { strikerCd: 0.9, hop: -250, ticketR: 13, boothR: 30, padHalf: 16, window: 12, targetR: 9 };
export const TEXT = { reset: 'THE TARGETS RESET', planks: 'THE PLANKS RUN UP', bars: 'THE CAGE OPENS', bell: 'THE BELL RINGS', booth: 'THE PRIZE BOOTH', short: 'NOT ENOUGH TICKETS', sold: 'A SILVER: SOLD' };   /* (booth/short/sold: only a level that still builds a booth - none does since claude/fairfix2) */

/* ---------------- the night and the mirror (pure) ---------------- */
export const nightK = (N, yPx) => (N ? Math.max(0, Math.min(1, (N.start - yPx / TS) / (N.start - N.full))) : 0);
export const inHall = (H, x, y) => !!H && x >= H.x0 * TS - 6 && x <= (H.x1 + 1) * TS + 6 && y >= (H.roof + 2) * TS && y <= H.floor * TS + 4;
export const hallsOf = L => (L && (L.halls || (L.hall ? [L.hall] : []))) || [];
export const hallAt = (L, x, y) => hallsOf(L).find(H => inHall(H, x, y)) || null;
/* an unlit stretch of the road (L.unlit [[x0, x1] columns]): no lamp, no dusk glow, nothing - as dark as the tops */
export const unlitAt = (L, x) => !!(L && L.unlit) && L.unlit.some(([a, b]) => x >= a * TS && x < (b + 1) * TS);
/* is this spot in the light of a lit lantern? lamps: { x (col), y (row), lit, life } as the game keeps them (FAIR.lamps) */
export function lampLit(lamps, x, y, r = 64) {
  for (const l of lamps || []) { if (!l.lit || !(l.life > 0)) continue; const lx = l.x * TS + 8, ly = (l.y + 1) * TS - 30; if (Math.abs(lx - x) <= r && Math.abs(ly - y) <= r) return true; }
  return false; }
/* how far can a hero LOOK at a foe standing here? null = as far as ever; { sight, sightY } = only this far (mummer.js takes it as w.sight / w.sightY) */
export function sightFor(L, lamps, e) {
  const N = L && L.fairNight; if (!N) return null;
  const x = e.x, y = e.y - 8;
  if (lampLit(lamps, x, y, N.lampR)) return null;
  const k = hallAt(L, x, e.y - 4) || unlitAt(L, x) ? 1 : nightK(N, e.y);
  return k < 0.5 ? null : { sight: N.dim, sightY: N.dim }; }
/* does this hero see behind him? (facing a true mirror within reach, inside the hall) */
export function mirrorSees(L, h) {
  const H = L && hallAt(L, h.x, h.y - 4); if (!H || !H.mirrors) return false;
  const dir = h.face >= 0 ? 1 : -1;
  for (const m of H.mirrors) { if (m.kind !== 'true') continue; const x0 = m.x0 * TS, x1 = (m.x1 + 1) * TS;
    if (dir > 0 ? (x1 > h.x && x0 - h.x <= H.reach) : (x0 < h.x && h.x - x1 <= H.reach)) return true; }
  return false; }
/* the corn maze's walls stop a look: a straight line from the hero's eye to the foe's chest, tile by tile (`solidAt(tx, ty)`). Only where the level says (L.maze.blind) */
export function blocked(L, solidAt, e, h) {
  const Bs = [L && L.maze && L.maze.blind, ...((L && L.blinds) || [])].filter(Boolean); if (!Bs.length) return false;
  const inB = (x, y) => Bs.some(B => x >= B[0] * TS && x <= (B[1] + 1) * TS && y >= B[2] && y <= B[3]);
  if (!inB(e.x, e.y) && !inB(h.x, h.y)) return false;
  const x0 = h.x, y0 = h.y - 12, x1 = e.x, y1 = e.y - 10, n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6));
  const barred = (tx, ty) => ((L && L.cages) || []).some(([a, b, c, d]) => tx >= a && tx <= b && ty >= c && ty <= d);   /* (claude/fairfix3) iron BARS are not a wall: you see through a cage */
  for (let i = 1; i < n; i++) { const t = i / n, tx = Math.floor((x0 + (x1 - x0) * t) / TS), ty = Math.floor((y0 + (y1 - y0) * t) / TS); if (solidAt(tx, ty) && !barred(tx, ty)) return true; }
  return false; }

/* ---------------- the state a level load starts with ---------------- */
export function newGames(L) {
  return { tickets: 0, taken: new Set(), spent: 0, total: (L.tickets || []).length + (L.strikers || []).reduce((n, s) => n + (s.tickets || 0), 0),   /* total: every ticket the level holds (src/fair-keys.js ticketTotal) */
    strikers: (L.strikers || []).map((s, i) => ({ ...s, i, ring: 0, cd: 0, paid: false, hits: 0, pad: { x: s.x * TS + 8, y: s.row * TS } })),
    galleries: (L.galleries || (L.gallery ? [L.gallery] : [])).map((g, i) => ({ i, id: g.id || i + 1, targets: g.targets.map(t => ({ ...t, hit: false, flash: 0 })), t: 0, open: false, opened: 0, window: g.window || GAMES.window, planks: g.planks || [], bars: g.bars || [], say: g.say || null })),   /* bars: a CAGE's bars a bull's-eye drops (claude/fairfix2); say: what opening it says */
    booth: L.booth ? { ...L.booth, sv: null, bought: false } : null, upWas: false, ringEv: 0 };
}

/* one frame of the games. heroes: [{ x, y, ground, dead, box (the attack box or null), heavy, plunge, up, hit (a Set, one hit per swing), n }].
   fx: { launch(h, vy), say(text), sound(name), open(planks), open2(nest) }. Returns nothing: the state and the fx are the result. */
export function step(G, L, heroes, fx, dt) {
  for (const s of G.strikers) { s.ring = Math.max(0, s.ring - dt); s.cd = Math.max(0, s.cd - dt); }
  for (const Gy of G.galleries) for (const t of Gy.targets) t.flash = Math.max(0, t.flash - dt);
  for (const h of heroes) { if (h.dead) continue;
    /* THE STRIKERS */
    for (const s of G.strikers) { if (s.cd > 0) continue;
      const nearX = Math.abs(h.x - s.pad.x) <= GAMES.padHalf, onPad = nearX && Math.abs(h.y - s.pad.y) <= 4 && h.ground;
      const rect = { l: s.pad.x - GAMES.padHalf, r: s.pad.x + GAMES.padHalf, t: s.pad.y - 12, b: s.pad.y + 2 };
      const rise = h.heavy && !(G.heavyWas && G.heavyWas[h.n || 0]) && onPad;   /* a heavy blow begun ON the pad counts even where its blade is a thrown javelin or a jet of flame (the ranged heroes) */
      const struck = rise || (h.box && h.box.r > rect.l && h.box.l < rect.r && h.box.b > rect.t && h.box.t < rect.b && !(h.hit && h.hit.has(s)));
      const plunged = h.plunge && nearX && h.y >= s.pad.y - 14 && h.y <= s.pad.y + 3;
      if (!struck && !plunged) continue;
      if (h.hit && struck) h.hit.add(s);
      const heavy = plunged || h.plunge || h.heavy, standing = onPad || nearX;   /* a plunge is a heavy blow: it comes down on the pad with your whole weight */
      s.cd = heavy ? GAMES.strikerCd : 0.3; s.ring = 1; s.hits++;
      if (heavy) { fx.sound('bell'); if (standing || plunged) fx.launch(h, s.launch); if (!s.paid) { s.paid = true; G.tickets += s.tickets; fx.say(TEXT.bell); fx.tickets && fx.tickets(s.tickets); } }
      else { fx.sound('tink'); if (standing) fx.launch(h, GAMES.hop); }
    }
    /* THE GALLERY */
    for (const Gy of G.galleries) if (!Gy.open && h.box) for (const t of Gy.targets) { if (t.hit) continue;
      const cx = t.px ?? t.x * TS + 8, cy = t.py ?? t.row * TS + 8, b = h.box;   /* (px/py: a bull's-eye hung on a ride, moved with it: src/fair-keys.js liveTargets) */
      if (b.r > cx - GAMES.targetR && b.l < cx + GAMES.targetR && b.b > cy - GAMES.targetR && b.t < cy + GAMES.targetR && !(h.hit && h.hit.has(t))) { if (h.hit) h.hit.add(t); t.hit = true; t.flash = 0.3; if (!Gy.t) Gy.t = 0.0001; fx.sound('tink'); } }
    /* THE TICKETS lying about (a touch) */
    (L.tickets || []).forEach((tk, i) => { if (G.taken.has(i)) return; const cx = tk.x * TS + 8, cy = tk.row * TS + 8;
      if (Math.abs(h.x - cx) < GAMES.ticketR && Math.abs(h.y - 8 - cy) < 15) { G.taken.add(i); G.tickets++; fx.sound('coin'); fx.tickets && fx.tickets(1); } });
    /* THE PRIZE BOOTH */
    const B = G.booth;
    if (B && !B.bought) { const bx = B.x * TS + 8;
      if (Math.abs(h.x - bx) <= GAMES.boothR && Math.abs(h.y - (B.row + 1) * TS) <= 6) {
        if (!G.boothTold) { G.boothTold = true; fx.say(TEXT.booth); }
        if (h.up && !G.upWas) { if (G.tickets >= B.cost) { G.tickets -= B.cost; G.spent += B.cost; B.bought = true; fx.buy && fx.buy(B); fx.say(TEXT.sold); } else fx.say(TEXT.short); } }
      else G.boothTold = false; }
  }
  G.upWas = heroes.some(h => h.up && !h.dead); G.heavyWas = G.heavyWas || {}; for (const h of heroes) G.heavyWas[h.n || 0] = !!h.heavy;
  /* THE GALLERY's clock: the window opens on the first hit; all hit inside it and the planks run up; miss the window and the targets reset */
  for (const Gy of G.galleries) if (!Gy.open && Gy.t > 0) { Gy.t += dt;
    if (Gy.targets.every(t => t.hit)) { Gy.open = true; Gy.opened = 1; fx.open(Gy.planks, Gy.bars, Gy); fx.say(Gy.say || (Gy.bars.length && !Gy.planks.length ? TEXT.bars : TEXT.planks)); fx.sound('open'); }
    else if (Gy.t > Gy.window) { Gy.t = 0; for (const t of Gy.targets) t.hit = false; fx.say(TEXT.reset); } }
}
