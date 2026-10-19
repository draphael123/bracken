// src/party.js - THE PARTY (claude/tavern, CO-OP PHASE 2, Daniel 10-12 brief-tavern.md): up to FOUR players - local pads and online guests
// mixed - each with his own COLOUR, a FLOOR RING under his feet and a NAME TAG over his head; ONE SHARED CAMERA that zooms out a little to fit
// them all; and THE LEASH, which pulls a player left too far behind up to the leader in a told puff. Pure tables and pure functions only: main.js
// owns the bodies and the drawing, this file owns the numbers, so tools/tavern.mjs can hold them to the brief without a page.
//
// THE SAVE. PROG.tavern = { seen: { <station>: 1 }, colours: [c1, c2, c3, c4], ring: bool, drills: { throw, revive, team } } - all of it optional.
// cleanTavern() reads ANY shape (missing, null, an old save, a hand-edited one) into a whole one and never throws; nothing else in the save changes,
// so an old save loads exactly as it did and simply has the defaults (OLD SAVES FINE).

export const MAX_PLAYERS = 4;

/* THE COLOURS a player can wear (the wardrobe's COLOUR row): his ring, his tag, his HUD plate's name. Eight, each readable on the dark inn floor and
   on a bright wood; the defaults are P1 gold, P2 the green P2 has always been, P3 blue, P4 rose. */
export const COLOURS = [
  { id: 'gold', name: 'GOLD', c: '#ffd36b', d: '#8a6a1d' },
  { id: 'green', name: 'GREEN', c: '#8fd160', d: '#3f6e2c' },
  { id: 'blue', name: 'BLUE', c: '#6bb8ff', d: '#2a5a8a' },
  { id: 'rose', name: 'ROSE', c: '#ff7a9a', d: '#8a2a44' },
  { id: 'violet', name: 'VIOLET', c: '#c9a0ff', d: '#5a3a8a' },
  { id: 'teal', name: 'TEAL', c: '#5fe0c8', d: '#1f6a5c' },
  { id: 'ember', name: 'EMBER', c: '#ff9a4a', d: '#8a4a1a' },
  { id: 'bone', name: 'BONE', c: '#e8e0d0', d: '#7a7060' },
];
export const SEAT_DEFAULT = ['gold', 'green', 'blue', 'rose'];
const colourById = id => COLOURS.find(c => c.id === id) || null;

/* ANY SAVE IN, A WHOLE TAVERN RECORD OUT */
export function cleanTavern(raw) {
  const t = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const seen = {}; if (t.seen && typeof t.seen === 'object' && !Array.isArray(t.seen)) for (const k in t.seen) if (t.seen[k] && /^[a-z]+$/.test(k)) seen[k] = 1;
  const colours = SEAT_DEFAULT.map((d, i) => (Array.isArray(t.colours) && colourById(t.colours[i]) ? t.colours[i] : d));
  const drills = {}; for (const k of DRILL_IDS) drills[k] = Math.max(0, Math.min(999, (t.drills && +t.drills[k]) | 0));
  return { seen, colours, ring: t.ring !== false, drills };
}
/* seat n (1..4): his colour, from the save's record */
export const colourOf = (tav, n) => colourById(cleanTavern(tav).colours[(n - 1) % MAX_PLAYERS]) || COLOURS[0];
/* the wardrobe's step: the next colour along that NO OTHER SEATED PLAYER is wearing (two players never share one) */
export function stepColour(cur, dir, taken = []) {
  let i = Math.max(0, COLOURS.findIndex(c => c.id === cur));
  for (let k = 0; k < COLOURS.length; k++) { i = (i + dir + COLOURS.length) % COLOURS.length; if (!taken.includes(COLOURS[i].id)) return COLOURS[i].id; }
  return cur;
}
/* the tag over his head: P1..P4, or ALLY for the computer partner, or the seat and ONLINE for a far guest in the tavern */
export const tagOf = p => (p.ai ? 'ALLY' : 'P' + p.n);

/* ===== THE SHARED CAMERA =====
   One picture for everyone (no split screen; an online guest gets the same stream). It frames the MIDPOINT of the upright players and, when they pull
   apart, steps OUT A LITTLE: the 'coop' view is the normal 320x180 picture drawn one whole pixel-scale step smaller, capped at 1.25x (400x225), so the
   art keeps whole pixels and the game never shrinks much. Wide when the party spans more than wideAt of the normal frame across (or wideAtY down);
   back to normal only once it is inside normalAt for `hold` seconds, so it does not pump on every jump. A boss's own zoom always wins (it is wider). */
export const CAM = { wideAt: 0.6, wideAtY: 0.55, normalAt: 0.4, normalAtY: 0.35, hold: 1.2, capW: 400, capH: 225, three: true };
/* the size of the 'coop' view for a display (css px): one integer scale step down from the normal view's, capped */
export function coopViewSize(dw, dh) {
  const S0 = Math.max(1, Math.floor(Math.min(dw / 320, dh / 180)));
  if (S0 <= 1) return [Math.max(320, Math.min(CAM.capW, Math.floor(dw))), Math.max(180, Math.min(CAM.capH, Math.floor(dh)))];
  const S1 = S0 - 1;
  return [Math.max(320, Math.min(CAM.capW, Math.floor(dw / S1))), Math.max(180, Math.min(CAM.capH, Math.floor(dh / S1)))];
}
/* the spread of a party: the box the upright ones stand in (a downed hero still counts - his partner has to get back to him) */
export function spreadOf(bodies) {
  const b = bodies.filter(p => p && !p.dead); if (!b.length) return { w: 0, h: 0 };
  const xs = b.map(p => p.x), ys = b.map(p => p.y);
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
/* the hysteresis: cur = { wide, t } (t: how long the party has been inside the normal box), returns the next one. n: how many in the party - three
   or four always take the wider view (CAM.three: four heroes in 320 px is a crowd) */
export function camStep(cur, spread, n, dt, VW0 = 320, VH0 = 180) {
  const c = cur || { wide: false, t: 0 };
  if (n < 2) return { wide: false, t: 0 };
  if (CAM.three && n >= 3) return { wide: true, t: 0 };
  const out = spread.w > VW0 * CAM.wideAt || spread.h > VH0 * CAM.wideAtY, inside = spread.w < VW0 * CAM.normalAt && spread.h < VH0 * CAM.normalAtY;
  if (out) return { wide: true, t: 0 };
  if (!c.wide) return { wide: false, t: 0 };
  const t = inside ? c.t + dt : 0;
  return t >= CAM.hold ? { wide: false, t: 0 } : { wide: true, t };
}

/* ===== THE LEASH =====
   The frame is a wall across (main.js coopSoftStop: a hero at the edge of the picture stops there), so on flat ground nobody is ever lost. A player is
   TOO FAR BEHIND when:
     - he is OFF THE PICTURE up or down by more than `offY` px (left on a lower floor, stranded on a ledge the camera has climbed away from), or
     - the party is stretched across the WHOLE frame (the leader held at the front edge and pushing on) and he is the one at the back edge.
   Then a meter fills over `build` s - TOLD: a rope line from him to the leader and CATCH UP over his head - and at full he is pulled up beside the
   leader in a puff (smoke where he stood and where he lands, PULLED ALONG), with `inv` s of grace. It never pulls a downed, dead, carried or thrown
   hero, never pulls INTO the air (it waits for the leader to be on the ground), and drains at `drain`x when the reason goes away. */
export const LEASH = { offY: 40, stretch: 0.9, build: 1.6, drain: 2, inv: 1, cool: 2, side: 14 };
/* who leads: the upright hero furthest along toward the exit (gateX; the furthest right without one); P1 on a tie */
export function leaderOf(bodies, gateX) {
  let best = null, bv = -1e9;
  bodies.forEach((p, i) => { if (!p || p.dead || p.down > 0) return; const v = gateX == null ? p.x : -Math.abs(gateX - p.x); if (v > bv + 0.5 || best == null) { bv = v; best = i; } });
  return best == null ? 0 : best;
}
/* why is this hero on the leash right now (or '' if he is not): pure, so the check can put every case through it */
export function leashWhy(p, lead, cam, edge = 10) {
  if (!p || !lead || p === lead || p.dead || p.down > 0 || p.held || p.flying) return '';
  if (p.y < cam.y - LEASH.offY || p.y - 14 > cam.y + cam.h + LEASH.offY) return 'off';
  const span = cam.w - 2 * edge;
  if (Math.abs(lead.x - p.x) >= span * LEASH.stretch && lead.pushing) return 'stretch';
  return '';
}
/* one step of one hero's meter: returns { m, pull } */
export function leashStep(m, why, dt, leadGround) {
  if (!why) return { m: Math.max(0, m - dt * LEASH.drain / LEASH.build), pull: false };
  const n = Math.min(1, m + dt / LEASH.build);
  return { m: n, pull: n >= 1 && !!leadGround };
}

/* ===== THE PARTNER DRILLS (the tavern's training yard): what each one asks, and its count on the chalk board ===== */
export const DRILL_IDS = ['throw', 'revive', 'team'];
export const DRILLS = {
  throw: { name: 'THROW', line: 'GRAB YOUR PARTNER AND THROW HIM INTO THE HAY TARGET' },
  revive: { name: 'REVIVE', line: 'RING THE SPARRING BELL: ONE OF YOU GOES DOWN. STAND ON HIM TO LIFT HIM' },
  team: { name: 'TEAM HIT', line: 'TWO OF YOU STRIKE THE SAME DUMMY WITHIN A SECOND' },
};
export const TEAM_WINDOW = 1.0;   // s: two different players' blows on one dummy inside this count as a team hit
