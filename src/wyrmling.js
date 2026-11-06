// src/wyrmling.js - THE WYRMLING, the airship's one new foe (claude/airship, 11-06, OPUS greybox; brief-desertairship-1104 s3, Daniel 10-16: "a small thunder wyrm,
// the boss's brood - one shared AI + an element table, THREE skins"). Pure: no DOM, no main.js; src/airship-hands.js runs it, draws it (greybox) and lays
// its element on a hero. tools/airship.mjs checks it.
//
// A WYRMLING HOVERS AND SLITHERS IN THE RIGGING (a lazy figure-eight round its post; noGrav). It has two told blows (B16 poses + own sounds):
//   SPIT  ('!!' - nothing turns it, step out of it): the head draws back with the element's glow (spitTell), then a glob flies at where you stood (spit).
//   COIL/BITE ('!' - a shield turns it): it coils (coilTell), then lunges and BITES (bite). A bite that lands LEAVES THE ELEMENT ON YOU:
//          SHOCK  a brief jitter (the hero's move stutters) + a stamina sap            - SHIPS NOW (the airship)
//          FROST  a CHILL (slow)                                                       - the mountain's skin (Frostfall), table only
//          FIRE   a BURN (a short damage-over-time)                                    - the mountain's skin (the fire arc), table only
//   CLEANSE: a roll (dodge) shakes it off, so does standing by a warm station (a stoked burner or a brazier) - src/airship-hands.js.
// Two blows of a sword do not kill it (hp ~ a cutthroat's); a stomp knocks it from the air (staggered).
// POSES (src/redraw art owed, B16): idle, spitTell, spit, coilTell, bite, hurt, die. SOUNDS: wyrmHiss, wyrmSpitTell, wyrmSpit, wyrmCoil, wyrmBite, wyrmHurt, wyrmDie.

export const WYRMLING = { hp: 34, w: 16, h: 10, sight: 190, hover: 18, drift: 26, spitR: [60, 180], spitTell: 0.7, spitFly: 0.65, globR: 9, spitCd: 2.6,
  biteR: 30, coilTell: 0.55, bite: 0.2, biteReach: 22, lunge: 160, recover: 0.6, biteCd: 1.8, staggerT: 0.8, spitDmg: 9, biteDmg: 11 };
/* THE ELEMENT TABLE (one AI, three skins). `ships`: only SHOCK is live (brief Q5 rec). col / glow drive the greybox + the art lane's palettes. */
export const ELEMENT = {
  shock: { ships: true, name: 'SHOCK', col: '#9ad8ff', glow: '#e8f6ff', spit: 'a spark', bite: { kind: 'shock', t: 0.9, jitter: 0.12, sap: 0.25 }, word: 'SHOCKED - ROLL IT OFF' },
  frost: { ships: false, name: 'FROST', col: '#bfe6f5', glow: '#ffffff', spit: 'an ice shard', bite: { kind: 'chill', t: 2.2, slow: 0.6 }, word: 'CHILLED' },
  fire: { ships: false, name: 'FIRE', col: '#ff9a3c', glow: '#ffd36b', spit: 'an ember glob', bite: { kind: 'burn', t: 2.4, dps: 3 }, word: 'BURNING' },
};
export const WYRM_POSES = { idle: 'wlIdle', spitTell: 'wlSpitWind', spit: 'wlSpitRel', coilTell: 'wlCoilWind', bite: 'wlBite', hurt: 'wlHurt', die: 'wlDie' };
export const WYRM_SOUNDS = { idle: 'wyrmHiss', spitTell: 'wyrmSpitTell', spit: 'wyrmSpit', coilTell: 'wyrmCoil', bite: 'wyrmBite', hurt: 'wyrmHurt', die: 'wyrmDie' };
export const elementOf = el => ELEMENT[el] || ELEMENT.shock;

export function newWyrmling(x, y, el = 'shock') {
  return { kind: 'wyrmling', el: ELEMENT[el] ? el : 'shock', x, y, hx: x, hy: y, mode: 'idle', t: 0, ph: Math.random() * 6, face: -1, spitCd: 1.2, biteCd: 0.8, glob: null, tx: 0, ty: 0, hitKey: 0, hp: WYRMLING.hp };
}
/* w = { px, py (the hero's feet), time } -> events [{ ev: 'tell'|'spit'|'bite'|'glob'|'pop', box?, dmg, el, key }] */
export function wyrmStep(s, dt, w) {
  const out = [], W = WYRMLING, dx = w.px - s.x, dy = (w.py - 8) - s.y, d = Math.hypot(dx, dy);
  s.t -= dt; s.spitCd -= dt; s.biteCd -= dt; s.ph += dt;
  /* the glob in flight (its own clock) */
  if (s.glob) { const g = s.glob; g.t += dt; const k = Math.min(1, g.t / W.spitFly); g.x = g.x0 + (g.x1 - g.x0) * k; g.y = g.y0 + (g.y1 - g.y0) * k - Math.sin(Math.PI * k) * 18;
    out.push({ ev: 'glob', box: [g.x - W.globR, g.x + W.globR, g.y - W.globR, g.y + W.globR], dmg: W.spitDmg, el: s.el, key: g.key });
    if (k >= 1) { out.push({ ev: 'pop', x: g.x, y: g.y }); s.glob = null; } }
  switch (s.mode) {
    case 'idle': {   /* hover round its post; face the hero; pick a blow */
      s.x = s.hx + Math.sin(s.ph * 0.9) * W.drift; s.y = s.hy + Math.sin(s.ph * 1.8) * 6; if (Math.abs(dx) > 2) s.face = Math.sign(dx);
      if (d < W.sight) {
        if (d < W.biteR + 14 && s.biteCd <= 0) { s.mode = 'coilTell'; s.t = W.coilTell; out.push({ ev: 'tell', move: 'coilTell' }); }
        else if (d >= W.spitR[0] && d <= W.spitR[1] && s.spitCd <= 0 && !s.glob) { s.mode = 'spitTell'; s.t = W.spitTell; s.tx = w.px; s.ty = w.py - 6; out.push({ ev: 'tell', move: 'spitTell' }); }
        else if (d > W.spitR[1] * 0.6) { s.hx += Math.sign(dx) * 30 * dt; }   /* it slithers along the rigging toward you */
      } break; }
    case 'spitTell': if (s.t <= 0) { s.mode = 'spit'; s.t = 0.25; s.hitKey++; s.glob = { x0: s.x, y0: s.y, x1: s.tx, y1: s.ty, x: s.x, y: s.y, t: 0, key: 'wlg' + s.hitKey }; s.spitCd = W.spitCd; out.push({ ev: 'spit' }); } break;
    case 'spit': if (s.t <= 0) { s.mode = 'idle'; } break;
    case 'coilTell': if (s.t <= 0) { s.mode = 'bite'; s.t = W.bite; s.hitKey++; s.lx = Math.sign(dx) || s.face; s.face = s.lx; } break;
    case 'bite': { s.x += s.lx * W.lunge * dt; const r = W.biteReach, bx = s.x + s.lx * 6;
      out.push({ ev: 'bite', box: [bx - r / 2, bx + r / 2, s.y - 8, s.y + 10], dmg: W.biteDmg, el: s.el, key: 'wlb' + s.hitKey });
      if (s.t <= 0) { s.mode = 'recover'; s.t = W.recover; s.biteCd = W.biteCd; } break; }
    case 'recover': s.x += (s.hx - s.x) * Math.min(1, dt * 2); if (s.t <= 0) s.mode = 'idle'; break;
    case 'stagger': s.y += 40 * dt; if (s.t <= 0) { s.mode = 'recover'; s.t = W.recover; } break;
  }
  return out;
}
export const wyrmStagger = s => { s.mode = 'stagger'; s.t = WYRMLING.staggerT; };
/* THE ELEMENT ON A HERO (pure): p.wlEl = { kind, t, ... } from the bite row; a roll or warmth cleanses. -> { jitter, sapNow, slow, dps } for this frame */
export function elementApply(p, el) { const b = elementOf(el).bite; p.wlEl = { ...b, el, t: b.t, sapped: false }; return p.wlEl; }
export function elementStep(p, dt, o = {}) {
  const q = p.wlEl; if (!q) return null;
  if (o.roll || o.warm) { p.wlEl = null; return { cleansed: o.roll ? 'roll' : 'warm' }; }
  q.t -= dt; if (q.t <= 0) { p.wlEl = null; return { ended: true }; }
  const r = {};
  if (q.kind === 'shock') { r.jitter = Math.floor((q.t / q.jitter)) % 2 === 0; if (!q.sapped) { q.sapped = true; r.sap = q.sap; } }
  else if (q.kind === 'chill') r.slow = q.slow;
  else if (q.kind === 'burn') r.dps = q.dps;
  return r;
}
