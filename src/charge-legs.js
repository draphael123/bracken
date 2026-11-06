/* THE LEGS OF A HERO WHO WALKS WHILE HE HOLDS THE CHARGE (claude/chargefeet, Daniel 11-04).
   The held swing is a whole-body frame (the knight's windup, the paladin's verdict lift, the Blood Knight's price hold, the berserker's rage wind,
   the geomancer's stave, the warden's lunge, the ranger's draw): none of them has a leg layer, so a hero walking under one slid with his feet frozen
   in the planted stance. Here the pose keeps its upper body and takes the legs of his own RUN cycle under it: a composite frame (the pose's rows
   above the hip, the run frame's legs from the hip down, in a band round the body so a long weapon or a shield that hangs low is left as drawn),
   built once per pose frame x run frame, and kept off the key list (non-enumerable) so the contact sheets and art audits never see it.
   Visual only: nothing here touches speed, the charge or any timer. */
export const LEG_ROWS = 4;          /* rows above the feet (set.ay) where the legs start: below this line the run frame's legs replace the pose's (the run frame's shield / weapon hang higher than that) */
export const LEG_BAND = 7;          /* columns either side of the body's centre taken from the run frame */
export const RUN_FRAMES = 6;
/* the keys that ARE the held charge, in the hero draw chain (main.js, the P.charge / knightWinding branches) */
export const CHARGE_KEYS = new Set(['windup', 'brace', 'heavy', 'vWind', 'vHold', 'priceHold', 'gWind', 'gWind3', 'bzWind2', 'bzWind3', 'rendWind', 'sunderWind', 'crescentWind', 'exsWind', 'moonWind', 'rgDraw2', 'rgDraw3', 'rgKneelDraw', 'crouch']);

/* the columns [lo, hi] (absolute, within LEG_BAND of the body centre pa) the pose's two bottom rows stand in: its feet */
function feet(pc, pa, ay) {
  const w = pc.width, d = pc.getContext('2d').getImageData(0, Math.max(0, ay - 1), w, 2).data; let lo = 1e9, hi = -1e9;
  for (let r = 0; r < 2; r++) for (let x = 0; x < w; x++) if (d[(r * w + x) * 4 + 3] > 40 && Math.abs(x - pa) <= LEG_BAND) { if (x < lo) lo = x; if (x > hi) hi = x; }
  return hi < lo ? null : [lo, hi];
}
const SIDES = ['R', 'L'];
function build(set, dir, key) {
  const pose = set[dir][key], run = set[dir].run; if (!pose || !run) return null;
  const poses = Array.isArray(pose) ? pose : [pose], runs = Array.isArray(run) ? run : [run], n = Math.min(RUN_FRAMES, runs.length), out = [];
  for (const pc of poses) for (let r = 0; r < n; r++) {
    const rc = runs[r], c = document.createElement('canvas'); c.width = pc.width; c.height = pc.height;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(pc, 0, 0);
    const pa = dir === 'L' ? pc.width - set.ax : set.ax, ra = dir === 'L' ? rc.width - set.ax : set.ax;   /* each canvas's body centre column */
    const y0 = Math.max(0, set.ay - LEG_ROWS), h = Math.min(pc.height, rc.height) - y0, ext = feet(pc, pa, set.ay);
    if (h > 0 && ext) {   /* only the columns the pose's own FEET stand in: the run frame's low-held shield / sword / offhand sits just beside them and must not come along (the doubled shield, Daniel 11-05) */
      const lo = ext[0], w = ext[1] - ext[0] + 1;
      g.clearRect(lo, y0, w, h); g.drawImage(rc, ra + (lo - pa), y0, w, h, lo, y0, w, h);
    }
    for (const k of Object.keys(pc)) if (!(k in c) && !k.startsWith('__')) c[k] = pc[k];   /* tip, rgo...: what the pose carries about itself */
    out.push(c);
  }
  out.runN = n; return out;
}
/* the composite key for a pose frame: [key, frame] on the set, or null when the set has no run cycle / no such pose to build it from */
export function legsPose(set, key, frame, runFrame) {
  if (!set || !set.R || !set.R[key] || !set.R.run) return null;
  const ck = 'cf:' + key;
  for (const d of SIDES) if (!Object.prototype.hasOwnProperty.call(set[d], ck)) { const b = build(set, d, key); if (!b) return null; Object.defineProperty(set[d], ck, { value: b, enumerable: false, configurable: true }); }
  const a = set.R[ck], np = Array.isArray(set.R[key]) ? set.R[key].length : 1, f = ((frame % np) + np) % np;
  return [ck, f * a.runN + (((runFrame % a.runN) + a.runN) % a.runN)];
}
