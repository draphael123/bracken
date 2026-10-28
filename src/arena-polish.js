// src/arena-polish.js - THE ARENA POLISH PACK (claude/arenapolish, Daniel-approved 10-28 from scratch/arena-audit-1028.md, shortlist items 1, 4, 6, 9, 10).
// Pure DRAWING + a tint resolver: no collision, no tuning, no entity, nothing a level hash covers (grid, ents, movers, ambushes). Arenas opt in with data:
//   arena.tintFn   the NAME of a phase-tint resolver below ('fields' | 'underwell' | 'rootway' | 'harbor' | 'waymeet')
//   arena.phaseTints  [[colour, alpha], ...] by boss.phase (1-based) - the generic helper any arena can use with no code
//   arena.flavour  the NAME of the arena's dressing drawn behind the actors ('fields' | 'rootway' | 'harbor' | 'waymeet'; the Underwell's lamps are drawn by the hall, drawWallLamps)
// THE PHASE-TINT HELPER (audit shortlist #1): every arena used to have ONE fixed tint (arena.tint / arena.tintA). tintNow() eases the veil toward the phase's
// target (or the resolver's), so a boss file that already sets e.phase / e.mode makes its room change colour for nothing. No resolver and no phaseTints = the
// arena's own tint, untouched (exact old behaviour, no state).
const R = Math.round, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const glow = (g, x, y, r, a, col) => { if (a <= 0.002 || r < 1) return; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };

/* ------------------------------------------------------------ THE TINT HELPER ------------------------------------------------------------ */
export const hexRgb = c => { const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c || ''); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0]; };
const rgbHex = v => '#' + v.map(n => clamp(R(n), 0, 255).toString(16).padStart(2, '0')).join('');
export const TINT_EASE = 4;   /* 1/s: a surge's tell (0.85 s) reads, a phase change settles in about a second */

/* the resolvers: (A, boss, o) -> [colour, alpha] or null (= the arena's own tint). o = { moon, cq, time }. Pure; read-only. */
export const TINT_FNS = {
  /* THE HEXED FIELDS: the moon's clock (FLD.moon, already running) - warm ember light while it is lit, cold blue as the cloud comes, near-black under it */
  fields: (A, b, o) => { const mo = o.moon; if (!mo) return null; return mo.ph === 'dark' ? ['#0a1030', 0.16] : mo.ph === 'warn' ? ['#2a2850', 0.11] : null; },
  /* THE UNDERWELL: lamp-oil amber, going to black as the hall's oil is spent; ablaze she lights it orange; the flood turns it to cold wet slate */
  underwell: (A, b, o) => { const cq = o.cq; if (cq && cq.flood) return ['#1a2a3a', 0.14]; if (b && (b.mode === 'ablaze' || b.mode === 'thrash')) return ['#ff7a22', 0.12];
    const ph = clamp((b && b.phase) || 1, 1, 3); return [['#c8842a', 0.075], ['#8a5a1e', 0.1], ['#2a1a0a', 0.15]][ph - 1]; },
  /* THE ROOTWAY: the lodge's amber dusk, reddening as he shoots the hoists */
  rootway: (A, b) => { const ph = clamp((b && b.phase) || 1, 1, 3); return [['#c89040', 0.07], ['#b0602a', 0.09], ['#8a2a1a', 0.12]][ph - 1]; },
  /* STORMWRECK HARBOR: the sea in the light - a surge's tell darkens it (high) or brightens it (low); HIGH TIDE (phase 2) is deeper */
  harbor: (A, b) => { const ph = clamp((b && b.phase) || 1, 1, 2), m = (b && b.mode) || '';
    if (m === 'highTell') return ['#0a3c4e', 0.2]; if (m === 'lowTell') return ['#3ab0b8', 0.15]; if (m === 'pressureTell' || m === 'twinTell') return ['#256f78', 0.15];
    return ph === 2 ? ['#1d5a6a', 0.15] : ['#256f78', 0.11]; },
  /* WAYMEET: the street at dusk; the lamp lights for the brand - the room goes warm and low */
  waymeet: (A, b) => { const ph = (b && b.phase) || 1; if (ph >= 3 || (b && b.mode === 'brandTell')) return ['#8a4a10', 0.14]; return ph === 2 ? ['#4a3020', 0.115] : null; },
};

export function targetTint(A, boss, o) {
  let c = A.tint, a = A.tintA || 0.14;
  const fn = A.tintFn && TINT_FNS[A.tintFn];
  if (fn) { const r = fn(A, boss, o || {}); if (r) { c = r[0]; a = r[1]; } }
  else if (A.phaseTints && A.phaseTints.length) { const r = A.phaseTints[clamp(((boss && boss.phase) || 1) - 1, 0, A.phaseTints.length - 1)]; if (r) { c = r[0]; a = r[1]; } }
  return [c, a];
}
export const makeTint = () => ({ A: null, rgb: null, a: 0, t: 0 });
/* the veil to draw this frame: { c, a } (c a '#rrggbb' string). `S` is makeTint()'s state - eased toward the target, snapped when the arena changes or a long gap passes */
export function tintNow(S, A, boss, time, o) {
  const dynamic = !!(A.tintFn || (A.phaseTints && A.phaseTints.length));
  if (!dynamic) return { c: A.tint, a: A.tintA || 0.14 };
  const [c, a] = targetTint(A, boss, o), rgb = hexRgb(c), dt = S.A === A ? clamp(time - S.t, 0, 0.1) : 1;
  if (S.A !== A || !S.rgb || time - S.t > 0.5) { S.A = A; S.rgb = rgb; S.a = a; S.t = time; return { c: rgbHex(rgb), a }; }
  const k = 1 - Math.exp(-dt * TINT_EASE); S.rgb = S.rgb.map((v, i) => v + (rgb[i] - v) * k); S.a += (a - S.a) * k; S.t = time;
  return { c: rgbHex(S.rgb), a: S.a };
}

/* ------------------------------------------------------------ THE DRAWING ------------------------------------------------------------ */
/* o = { A, L, boss, bossActive, cx, cy, VW, VH, time, TS, fld, cq } - everything is read; nothing is written but the module's own `mem` */
const mem = { bell: { ring: 0, glint: 0, at: 0 }, lamp: 0 };
export function drawFlavour(g, o) {
  const A = o.A; if (!A || !A.flavour) return;
  if (A.flavour === 'fields') drawFields(g, o); else if (A.flavour === 'rootway') drawRootway(g, o);
  else if (A.flavour === 'harbor') drawHarbor(g, o); else if (A.flavour === 'waymeet') drawWaymeet(g, o);
}
const onScreen = (x, o, m = 24) => x > o.cx - m && x < o.cx + o.VW + m;

/* ---- THE HEXED FIELDS: MOONLIGHT ON THE ARENA. A pale pool of light on the king's floor while the moon is lit; it thins as the cloud comes (the warning flickers it)
   and is gone under the cloud - the same clock that holds the phantom planks, drawn where he stands. */
function drawFields(g, o) {
  const { A, fld, cx, cy, time } = o; if (!fld || !fld.moon) return; const mo = fld.moon, M = (o.L.fields || {}).moon || {};
  const lit = clamp(1 - mo.k, 0, 1), warn = mo.ph === 'warn' && M.warn ? 1 - mo.t / M.warn : 0, flick = mo.ph === 'warn' && mo.t < 0.9 && Math.floor(time * 14) % 2 ? 0.55 : 1;
  const a = 0.2 * lit * (1 - 0.6 * clamp(warn, 0, 1)) * flick; if (a < 0.01) return;
  const x0 = A.x0 - cx, x1 = A.x1 - cx, y = A.floor - cy; if (x1 < 0 || x0 > o.VW) return;
  /* the pool: a flat ellipse of cold light, wide as the arena, brightest under the moon's side (the arena's right third) */
  g.save(); g.translate(R((x0 + x1) / 2 + (x1 - x0) * 0.12), y - 1); g.scale(1, 0.16);
  const r = (x1 - x0) * 0.55, gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, 'rgba(205,220,255,' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(205,220,255,0)'); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore();
  /* two slanted shafts of it down from the dark, so the light has a source */
  g.save(); g.globalAlpha = a * 0.55; g.fillStyle = '#cfdcff';
  for (const f of [0.62, 0.78]) { const sx = A.x0 + (A.x1 - A.x0) * f - cx; if (sx < -30 || sx > o.VW + 30) continue; g.beginPath(); g.moveTo(sx - 5, y - 110); g.lineTo(sx + 7, y - 110); g.lineTo(sx + 26, y); g.lineTo(sx + 8, y); g.closePath(); g.fill(); }
  g.restore();
}

/* ---- THE UNDERWELL: the hall's WALL LAMPS (not the wall torches the level teaches you to take: these are oil lamps in niches, caged, and not for the hand). Lit while the
   hall is dry; the flood puts them out; her fire makes them flare; soot dims them. Drawn by the hall's drawBack with its own state S. */
export function drawWallLamps(g, G, S, cx, cy, time) {
  if (!G || !S) return; const w = G.x1 - G.x0, flood = !!S.flood, hot = (S.scorch || 0) > 0, sooty = (S.charT || 0) > 0;
  const spots = [[0.05, 150], [0.3, 100], [0.7, 100], [0.95, 150]];
  for (let i = 0; i < spots.length; i++) { const [f, up] = spots[i], x = R(G.x0 + w * f - cx), y = R(G.floor - up - cy); if (x < -30 || x > 700) continue;
    /* the niche and the cage: a dark arch in the wall, an iron frame, a brass bowl */
    fr(g, '#1a1612', x - 6, y - 8, 12, 14); fr(g, '#2a2420', x - 5, y - 7, 10, 12); fr(g, '#3a3028', x - 7, y - 9, 14, 1); fr(g, '#3a3028', x - 7, y + 5, 14, 2);
    fr(g, '#5a4a2a', x - 4, y + 2, 8, 2); fr(g, '#8a6a2a', x - 3, y + 1, 6, 1); fr(g, '#201a12', x - 3, y, 6, 1);
    if (flood) { /* dark: a thread of smoke off the dead wick */
      const k = (time * 0.5 + i * 0.3) % 1; g.globalAlpha = 0.35 * (1 - k); fr(g, '#8a8a90', x + Math.sin(time * 2 + i) * 2, y - 2 - k * 12, 1, 3); g.globalAlpha = 1; fr(g, '#4a3a2a', x - 1, y - 1, 2, 1); continue; }
    const fl = 0.75 + 0.25 * Math.sin(time * 9 + i * 2.1) + 0.1 * Math.sin(time * 23 + i), sc = hot ? 1.5 : sooty ? 0.6 : 1, h = Math.max(2, R((5 + fl * 2) * sc));
    glow(g, x, y - 3, (hot ? 58 : sooty ? 22 : 36) * (0.9 + 0.1 * fl), (hot ? 0.34 : sooty ? 0.1 : 0.22) * fl, '255,170,70');
    fr(g, '#d84a14', x - 2, y - 2, 4, 2); fr(g, '#ff7a22', x - 1, y - 1 - R(h * 0.6), 3, R(h * 0.6)); fr(g, '#ffb84a', x, y - 1 - R(h * 0.85), 1, R(h * 0.5)); fr(g, '#fff2c0', x, y - 1 - h, 1, 1);
    /* the cage bars over the flame */
    fr(g, 'rgba(20,16,12,0.75)', x - 4, y - 7, 1, 8); fr(g, 'rgba(20,16,12,0.75)', x + 3, y - 7, 1, 8); }
}

/* ---- THE ROOTWAY: THE HUNTMASTER'S LAIR. Trophy strings across the stand (skulls, antlers, tusks on cord), bone chimes under the two perches that stir when he is near,
   and spores drifting in the dark the lair now keeps (the level adds a dark zone over the stand; its lanterns are holes in it). */
function trophy(g, kind, x, y, sway) {
  x = R(x + sway); y = R(y);
  if (kind === 0) { /* a skull: bone, two dark sockets, a jaw */
    fr(g, '#d8cfb8', x - 3, y, 6, 5); fr(g, '#b8ae98', x - 2, y + 5, 4, 2); fr(g, '#2a2018', x - 2, y + 2, 1, 2); fr(g, '#2a2018', x + 1, y + 2, 1, 2); fr(g, '#8a8070', x - 3, y + 4, 6, 1); }
  else if (kind === 1) { /* antlers: a brow beam and three tines each side */
    fr(g, '#3a2a1a', x - 1, y, 2, 3); fr(g, '#b09a70', x - 6, y - 1, 5, 1); fr(g, '#b09a70', x + 1, y - 1, 5, 1);
    for (const sx of [-1, 1]) { fr(g, '#c8b488', x + sx * 5 - (sx < 0 ? 0 : 0), y - 5, 1, 4); fr(g, '#c8b488', x + sx * 3, y - 4, 1, 3); fr(g, '#c8b488', x + sx * 6, y - 3, 1, 2); } }
  else { /* a tusk, curved */
    fr(g, '#e8e0cc', x - 1, y, 3, 3); fr(g, '#e8e0cc', x, y + 3, 2, 3); fr(g, '#d8cfb8', x + 1, y + 6, 2, 2); fr(g, '#a89c80', x + 2, y + 8, 1, 1); fr(g, '#8a7a58', x - 1, y - 1, 3, 1); }
}
function drawRootway(g, o) {
  const { A, cx, cy, time } = o; const x0 = A.x0, x1 = A.x1, fl = A.floor, TS = o.TS; if (x1 - cx < -20 || x0 - cx > o.VW + 20) return;
  const boss = o.boss, bx = boss && boss.alive ? boss.x : -9999;
  /* THE TROPHY STRINGS: three cords from wall to wall, sagging, a trophy hung at intervals */
  const rows = [[fl - 11 * TS, 14, 0], [fl - 9.2 * TS, 10, 3], [fl - 12.6 * TS, 8, 6]];
  rows.forEach(([ya, sag, seed], ri) => {
    const xa = x0 + 2, xb = x1 - 2, n = 7; let last = null;
    for (let px = xa; px <= xb; px += 2) { const t = (px - xa) / (xb - xa), y = ya + Math.sin(t * Math.PI) * sag; if (px < cx - 4 || px > cx + o.VW + 4) continue; fr(g, ri === 1 ? '#3a2a18' : '#2a1c10', px - cx, y - cy, 2, 1); if (px % 8 === 0) fr(g, '#5a4228', px - cx, y - cy + 1, 1, 1); }
    for (let i = 1; i < n; i++) { const t = i / n + ((i * 7 + seed) % 5) * 0.012, px = xa + (xb - xa) * t, y = ya + Math.sin(t * Math.PI) * sag; if (!onScreen(px, o)) continue;
      const near = Math.abs(bx - px) < 70 ? 1.6 : 1, sway = Math.sin(time * 1.3 + i * 1.9 + ri) * 1.2 * near, len = 4 + ((i + seed) % 3) * 2;
      fr(g, '#2a1c10', px - cx + sway * 0.5, y - cy, 1, len); trophy(g, (i + ri) % 3, px - cx, y - cy + len, sway); }
  });
  /* THE BONE CHIMES under each perch: a bone bar, five strands of cut bone, stirred when he comes near */
  for (const [pa, pb, py] of (A.perches || [])) { const mx = (pa + pb + 1) * TS / 2, y = (py + 1) * TS + 2; if (!onScreen(mx, o, 40)) continue;
    const stir = Math.abs(bx - mx) < 90 ? 1 : 0, amp = 0.8 + stir * 2.2;
    fr(g, '#b8ae98', mx - cx - 14, y - cy, 28, 2); fr(g, '#8a8070', mx - cx - 14, y - cy + 2, 28, 1);
    for (let i = 0; i < 5; i++) { const len = 6 + ((i * 5) % 4) * 3, sx = mx - cx - 11 + i * 5.5 + Math.sin(time * 2.1 + i * 1.3) * amp; fr(g, '#2a1c10', mx - cx - 11 + i * 5.5, y - cy + 3, 1, 3); fr(g, i % 2 ? '#d8cfb8' : '#c8bc9c', sx - 1, y - cy + 6, 2, len); fr(g, '#8a8070', sx - 1, y - cy + 6 + len, 2, 1); } }
  /* SPORES in the lair's dark: pale teal motes rising from the floor, a few, slow (the stand's pods are the only pink-gold light; these are only air) */
  for (let i = 0; i < 16; i++) { const k = (time * 0.07 + i * 0.0625) % 1, px = x0 + ((i * 193) % (x1 - x0)) + Math.sin(time * 0.8 + i) * 6, py = fl - 6 - k * 150; if (!onScreen(px, o)) continue;
    g.globalAlpha = Math.sin(k * Math.PI) * 0.6; fr(g, i % 3 ? '#9ae8d0' : '#f0c890', px - cx, py - cy, 1, 1); } g.globalAlpha = 1;
}

/* ---- STORMWRECK HARBOR: THE SEA BEYOND THE GATE. A swell of sea rises behind the portcullis (higher in HIGH TIDE, and on each surge's tell), and spray puffs off the quay
   at both walls, thicker as the tide climbs. The duel itself is unchanged. */
function drawHarbor(g, o) {
  const { A, cx, cy, time } = o; if (A.x1 - cx < -140 || A.x0 - cx > o.VW + 20) return; const b = o.boss, ph = (b && b.phase) || 1, m = (b && b.mode) || '';
  const surge = m === 'highTell' ? 1 : m === 'lowTell' ? 0.5 : 0; const rise = (ph === 2 ? 1 : 0) * 14 + surge * 10;
  /* the sea past the gate: a slab of water, a foam line that heaves, drawn over the gate's bars at low alpha so they still read */
  const gx = A.x1 - cx, top = A.floor - cy - 8 - rise + Math.sin(time * 1.4) * 3;
  g.globalAlpha = 0.5; fr(g, '#1d5a66', gx + 1, top, 150, A.floor - cy - top + 2); g.globalAlpha = 0.35; fr(g, '#4aa8b0', gx + 1, top + 3, 150, 2); g.globalAlpha = 1;
  for (let x = 0; x < 150; x += 6) { const wy = top + Math.sin(time * 2.2 + x * 0.35) * 1.6; fr(g, '#d8f4f0', gx + 2 + x, wy, 3, 1); }
  /* the spray off the quay: pale puffs lifting and falling at the foot of each wall */
  const wall = [A.x0 + 6, A.x1 - 6], n = 5 + ph * 3 + (surge ? 4 : 0);
  for (const wx of wall) for (let i = 0; i < n; i++) { const k = (time * (0.5 + 0.08 * i) + i * 0.37) % 1, dir = wx < (A.x0 + A.x1) / 2 ? 1 : -1, px = wx + dir * (k * 22 + (i % 3) * 3), py = A.floor - 4 - Math.sin(k * Math.PI) * (10 + ph * 5 + surge * 8);
    if (!onScreen(px, o)) continue; g.globalAlpha = 0.75 * Math.sin(k * Math.PI); fr(g, i % 2 ? '#e8faf6' : '#a8dcd8', px - cx, py - cy, i % 3 ? 1 : 2, i % 3 ? 1 : 2); } g.globalAlpha = 1;
}

/* ---- WAYMEET: THE BELL AND THE LAMP. A chapel bell hangs in a timber yoke over the stand and rings on each of his glints (a bright ring, a swing, widening arcs); a lychgate
   lamp on its post stands cold until the BRAND, then lights and throws a warm pool on the floor. Both are scenery; the duel is as it was. */
function drawWaymeet(g, o) {
  const { A, cx, cy, time, TS } = o; if (A.x1 - cx < -20 || A.x0 - cx > o.VW + 20) return; const b = o.boss, B = mem.bell;
  const gl = b && b.alive && b.glint ? 1 : 0; if (gl && !B.glint) { B.ring = 1; B.at = time; } B.glint = gl; B.ring = Math.max(0, B.ring - (1 / 60) * 1.1);
  /* the bell: yoke between two posts high on the stand's left, a bronze bell swinging from it */
  const bxw = A.x0 + 7 * TS, byw = A.floor - 8.5 * TS, bx = R(bxw - cx), by = R(byw - cy);
  if (onScreen(bxw, o, 40)) {
    fr(g, '#3a2a1a', bx - 14, by - 3, 28, 3); fr(g, '#5a4228', bx - 14, by - 3, 28, 1); fr(g, '#3a2a1a', bx - 15, by - 3, 3, 20); fr(g, '#3a2a1a', bx + 12, by - 3, 3, 20); fr(g, '#2a1c10', bx - 15, by + 17, 3, 3); fr(g, '#2a1c10', bx + 12, by + 17, 3, 3);
    const ang = Math.sin((time - B.at) * 11) * 0.5 * B.ring, ox = bx, oy = by; g.save(); g.translate(ox, oy); g.rotate(ang);
    fr(g, '#2a1c10', -1, 0, 2, 4); fr(g, '#8a6a2a', -4, 4, 8, 2); fr(g, '#a8842e', -5, 6, 10, 4); fr(g, '#c8a040', -6, 10, 12, 4); fr(g, '#8a6a2a', -7, 14, 14, 2); fr(g, '#e8c860', -4, 7, 1, 6); fr(g, '#4a3a14', -1, 16, 2, 3);
    if (B.ring > 0.3) fr(g, '#fff3b0', -6, 11, 2, 3);
    g.restore();
    for (let r = 0; r < 3; r++) { const k = clamp((time - B.at) * 1.6 - r * 0.28, 0, 1); if (B.ring <= 0.02 || k <= 0 || k >= 1) continue; g.globalAlpha = (1 - k) * 0.6 * B.ring; g.strokeStyle = '#fff3b0'; g.lineWidth = 1; g.beginPath(); g.arc(bx, by + 12, 8 + k * 26, 0, 7); g.stroke(); }
    g.globalAlpha = 1; }
  /* the lamp: a lychgate lamp on an iron post at the right of the stand; lit for the brand */
  const lxw = A.x1 - 5 * TS, lx = R(lxw - cx), fy = R(A.floor - cy); if (onScreen(lxw, o, 60)) {
    const lit = b && b.alive && ((b.phase || 1) >= 3 || b.mode === 'brandTell'); mem.lamp += ((lit ? 1 : 0) - mem.lamp) * 0.06; const k = mem.lamp;
    fr(g, '#2a2a30', lx - 1, fy - 44, 2, 44); fr(g, '#2a2a30', lx - 4, fy - 3, 8, 3); fr(g, '#3a3a44', lx - 5, fy - 46, 10, 2); fr(g, '#2a2a30', lx - 4, fy - 56, 8, 1);
    fr(g, '#1a1a20', lx - 4, fy - 55, 1, 9); fr(g, '#1a1a20', lx + 3, fy - 55, 1, 9);
    fr(g, k > 0.5 ? '#ffc860' : '#3a4048', lx - 3, fy - 54, 6, 8);
    if (k > 0.04) { const fl = 0.85 + 0.15 * Math.sin(time * 10); glow(g, lx, fy - 50, 30 * k * fl, 0.36 * k, '255,190,100');
      g.save(); g.translate(lx, fy - 1); g.scale(1, 0.16); const r = 70 * k, gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, 'rgba(255,190,100,' + (0.26 * k * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,190,100,0)'); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore(); } }
}
