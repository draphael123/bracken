// src/stilt-walker.js - THE GOBLIN STILT-WALKER (claude/fenroad; scratch/brief-fenroad-1020.md, Daniel 10-20: "a boardwalk lookout on tall stilts with a long gaff ...
// REUSE him in other levels (Stockade walkway lookouts, later camps/bogs) - build him as a general bestiary foe"). A GENERAL FOE: ent('stiltwalker', x, y,
// { face, horn: true, pack: [{ dx, y, t }] }) anywhere; a CV machine (main.js updateDesertFoe runs it: this step says where he goes and what he strikes).
//   A REACH FRONTLINER: he keeps a gaff's length off you (he backs off a hero who closes) and walks slowly on his stilts.
//   HIS TOLD ATTACK - THE DOWNWARD GAFF JAB: he draws the gaff up and back over his head (a yellow !, his own windup pose), then drives it down at a
//     standing hero's head and shoulders: DUCK under it (a ducked hero is under its box) or PARRY it (a shield turns it; a parry on the beat is the
//     universal parry). Answered by a duck, it OVERREACHES (src/told-attacks.js SIG: the duck row).
//   HIS STILTS ARE HIS WEAKNESS: a LOW blow - the low sweep, the running slide, a heavy from the ground - CUTS A STILT and he TOPPLES: down on his
//     back, BROKEN (main.js floorFoe), so the next blow is the foe-pass FINISHER (src/finishers.js). Up again he is a goblin with a knife (stiltless).
//   HIS HORN (horn: true): seeing you he lowers the gaff and winds the horn - the Stockade's horn bar over him (main.js drawHornTell) - and if it
//     sounds, his crew (pack) comes (main.js hornSounds). Strike him (a stagger breaks his breath) or topple him before it fills.
export const STILT = {
  hp: 32, w: 10, h: 30, hLow: 14, walk: 30, walkLow: 42, sight: 200, keep: 30, back: 22,
  jabAt: 50, jabTell: 0.55, jab: 0.18, jabReach: 46, jabDmg: 14, jabTop: 16, jabBot: 9, recover: 0.6, cd: 1.3,
  stabAt: 20, stabTell: 0.42, stab: 0.12, stabDmg: 8, stabCd: 1.1,
  horn: 2.0, hornSee: 172,
  topple: 0.45, down: 2.6, getup: 0.5,
};
export const SW_SAY = { topple: 'A STILT CUT: HE TOPPLES' };
/* the blow that cuts a stilt: a LOW blow (main.js's blow tags) - the low sweep and the running slide ('sweep'), or a HEAVY struck from the ground */
export const cutsStilt = (blow, heroGround) => { const has = v => blow === v || (Array.isArray(blow) && blow.includes(v)); return has('sweep') || (has('heavy') && !!heroGround); };
export const newStilt = (x, y, o = {}) => ({ kind: 'stiltwalker', x, y, face: o.face || -1, mode: 'walk', t: 0, cd: 0.8 + (Math.floor(x) % 4) * 0.2, frame: 0, stilts: true, horn: !!o.horn, hornT: 0, blown: false, seen: false });
/* ONE FRAME OF HIM. w = { px, py (the hero), time, ducking }. Returns the CV events: { t: 'tell'|'hit'|'horn' } */
export function stiltStep(s, w, dt) {
  const out = [], ev = (t, o) => out.push({ t, ...(o || {}) }); s.t -= dt; s.cd -= dt;
  const dx = w.px - s.x, dy = w.py - s.y, ad = Math.abs(dx), f = s.face || -1, step = Math.floor(w.time * 5) % 2;
  if (!s.stilts && (s.mode === 'walk' || s.mode === 'jabTell' || s.mode === 'jab' || s.mode === 'hornTell')) s.mode = 'walkLow';
  switch (s.mode) {
    case 'walk': {
      s.frame = 1 + step; if (ad < 260 && Math.abs(dy) < 80) s.face = Math.sign(dx) || s.face;
      /* THE HORN: he must SEE you (on the screen with him, the Stockade's rule), then he winds it */
      if (s.horn && !s.blown && ad < STILT.hornSee && Math.abs(dy) < 120) { s.mode = 'hornTell'; s.hornT = 0; s.frame = 5; ev('tell', { what: 'horn' }); break; }
      if (s.cd <= 0 && ad < STILT.jabAt && Math.abs(dy) < 28) { s.mode = 'jabTell'; s.t = STILT.jabTell; s.frame = 3; ev('tell', { what: 'jab', mark: '!' }); break; }
      if (ad < STILT.sight && Math.abs(dy) < 60) { if (ad > STILT.keep + 6) s.x += s.face * STILT.walk * dt; else if (ad < STILT.back) s.x -= s.face * STILT.walk * 0.8 * dt; else s.frame = 0; }
      else s.frame = 0;
      break; }
    case 'hornTell': s.frame = 5; s.hornT += dt; if (ad > STILT.hornSee * 1.5) { s.hornT = Math.max(0, s.hornT - dt * 2); if (s.hornT <= 0) s.mode = 'walk'; }
      if (s.hornT >= STILT.horn) { s.blown = true; s.mode = 'recover'; s.t = 0.6; ev('horn'); } break;
    case 'jabTell': s.frame = 3; if (s.t <= 0) { s.mode = 'jab'; s.t = STILT.jab; } break;
    case 'jab': s.frame = 4; ev('hit', { what: 'gaff', box: f > 0 ? [s.x + 6, s.x + STILT.jabReach, s.y - STILT.jabTop, s.y - STILT.jabBot] : [s.x - STILT.jabReach, s.x - 6, s.y - STILT.jabTop, s.y - STILT.jabBot], dmg: STILT.jabDmg, blockable: true });
      if (s.t <= 0) { s.mode = 'recover'; s.t = STILT.recover; s.cd = STILT.cd; } break;
    case 'recover': s.frame = s.stilts ? 0 : 8; if (s.t <= 0) s.mode = s.stilts ? 'walk' : 'walkLow'; break;
    case 'topple': s.frame = 6; if (s.t <= 0) { s.mode = 'down'; s.t = STILT.down; } break;
    case 'down': s.frame = 7; if (s.t <= 0) { s.mode = 'getup'; s.t = STILT.getup; } break;
    case 'getup': s.frame = 7; if (s.t <= 0) { s.mode = 'walkLow'; s.cd = 0.5; } break;
    /* STILTLESS: a goblin with a knife (the gaff's broken haft) */
    case 'walkLow': s.frame = 8 + step; s.face = Math.sign(dx) || s.face;
      if (s.cd <= 0 && ad < STILT.stabAt && Math.abs(dy) < 16) { s.mode = 'stabTell'; s.t = STILT.stabTell; s.frame = 10; ev('tell', { what: 'slash', mark: '!' }); break; }
      if (ad < 220 && Math.abs(dy) < 50 && ad > 10) s.x += s.face * STILT.walkLow * dt; break;
    case 'stabTell': s.frame = 10; if (s.t <= 0) { s.mode = 'stab'; s.t = STILT.stab; } break;
    case 'stab': s.frame = 11; ev('hit', { what: 'knife', box: f > 0 ? [s.x, s.x + 18, s.y - 12, s.y - 2] : [s.x - 18, s.x, s.y - 12, s.y - 2], dmg: STILT.stabDmg, blockable: true });
      if (s.t <= 0) { s.mode = 'recover'; s.t = 0.45; s.cd = STILT.stabCd; } break;
    default: s.mode = s.stilts ? 'walk' : 'walkLow';
  }
  return out;
}
/* A STILT CUT (main.js, a low blow landed): he topples. Returns true when it took (on his stilts, not already falling) */
export function cutStilt(s) { if (!s || !s.stilts) return false; s.stilts = false; s.mode = 'topple'; s.t = STILT.topple; s.frame = 6; s.hornT = 0; return true; }

/* ---------- GREYBOX SHEET (the art lane draws him; this is the contract: one frame per pose) ----------
   0 idle  1-2 walk (stilts stride)  3 JAB WINDUP (gaff up and back over his head)  4 JAB (driven down and forward)  5 HORN (gaff grounded, horn at his mouth)
   6 TOPPLE (tipping, a stilt snapped)  7 DOWN (on his back, stilts broken)  8-9 stiltless walk  10 STAB WINDUP  11 STAB  12 hurt */
export function bakeStiltWalker(canvas, flipX, whiten) {
  const CW = 40, CH = 44, ax = 20, ay = 43;
  const C = { skin: '#7aa04a', skinD: '#55783a', eye: '#ffd36b', cloth: '#6a4a8a', clothD: '#4a3266', stilt: '#8a6a40', stiltD: '#5a4428', strap: '#c9b27c', gaff: '#9a8a70', hook: '#c9d1dc', horn: '#e8dcc0', out: '#1b1626' };
  const frames = [];
  const r = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const line = (g, x0, y0, x1, y1, c, wd = 1) => { g.strokeStyle = c; g.lineWidth = wd; g.beginPath(); g.moveTo(x0 + 0.5, y0 + 0.5); g.lineTo(x1 + 0.5, y1 + 0.5); g.stroke(); };
  /* a goblin body: feet at (bx, by), facing right */
  const body = (g, bx, by, o = {}) => {
    r(g, bx - 3, by - 10, 6, 7, C.cloth); r(g, bx - 3, by - 4, 6, 1, C.clothD);                     // tunic
    r(g, bx - 3, by - 15, 6, 5, C.skin); r(g, bx + 3, by - 13, 2, 1, C.skin); r(g, bx - 5, by - 14, 2, 2, C.skinD);   // head, nose, ear
    r(g, bx + 1, by - 13, 1, 1, C.eye);
    if (o.legs !== false) { r(g, bx - 2, by - 3, 1, 3, C.skinD); r(g, bx + 1, by - 3, 1, 3, C.skinD); }
  };
  const stilts = (g, bx, by, stride, broken) => {   /* two poles from the goblin's feet (strapped at the shin) to the floor */
    const a = stride ? 3 : 1, b = stride ? -2 : -1;
    line(g, bx - 1, by - 16, bx - 1 + b, by, C.stilt, 2); if (!broken) line(g, bx + 1, by - 16, bx + 1 + a, by, C.stilt, 2); else line(g, bx + 1, by - 16, bx + 4, by - 9, C.stilt, 2);
    r(g, bx - 2, by - 14, 4, 1, C.strap); };
  const draw = (fn) => { const [c, g] = canvas(CW, CH); g.imageSmoothingEnabled = false; fn(g); frames.push(c); };
  const tall = (g, stride, gaff, extra) => { const bx = ax, by = ay - 16; stilts(g, bx, ay, stride, false); body(g, bx, by); gaff(g, bx, by); if (extra) extra(g, bx, by); };
  const gaffRest = (g, bx, by) => { line(g, bx + 3, by - 8, bx + 12, by + 10, C.gaff); r(g, bx + 12, by + 9, 2, 1, C.hook); r(g, bx + 13, by + 10, 1, 2, C.hook); };
  draw(g => tall(g, 0, gaffRest));                                                                                                  // 0 idle
  draw(g => tall(g, 1, gaffRest)); draw(g => tall(g, 0, gaffRest));                                                                 // 1-2 walk
  draw(g => tall(g, 0, (g2, bx, by) => { line(g2, bx + 2, by - 10, bx - 9, by - 24, C.gaff); r(g2, bx - 11, by - 26, 3, 1, C.hook); r(g2, bx - 11, by - 25, 1, 2, C.hook); r(g2, bx + 2, by - 11, 2, 2, C.skin); }));   // 3 JAB WINDUP: up and back
  draw(g => tall(g, 1, (g2, bx, by) => { line(g2, bx + 3, by - 9, bx + 22, by + 4, C.gaff); r(g2, bx + 21, by + 4, 3, 1, C.hook); r(g2, bx + 23, by + 5, 1, 2, C.hook); r(g2, bx + 3, by - 9, 2, 2, C.skin); }));   // 4 JAB: down and forward
  draw(g => tall(g, 0, (g2, bx, by) => { line(g2, bx - 4, by - 6, bx - 6, by + 14, C.gaff); }, (g2, bx, by) => { r(g2, bx + 3, by - 14, 4, 2, C.horn); r(g2, bx + 7, by - 15, 2, 4, C.horn); r(g2, bx + 2, by - 12, 2, 2, C.skin); }));   // 5 HORN
  draw(g => { g.save(); g.translate(ax, ay); g.rotate(0.5); g.translate(-ax, -ay); stilts(g, ax, ay, 0, true); body(g, ax, ay - 16); gaffRest(g, ax, ay - 16); g.restore(); });   // 6 TOPPLE
  draw(g => { r(g, ax - 12, ay - 5, 9, 4, C.cloth); r(g, ax - 3, ay - 5, 5, 4, C.skin); r(g, ax + 1, ay - 4, 1, 1, C.eye); line(g, ax - 14, ay - 2, ax - 22, ay - 1, C.stilt, 2); line(g, ax + 4, ay - 1, ax + 12, ay - 3, C.stiltD, 2); line(g, ax - 6, ay - 7, ax + 6, ay - 9, C.gaff); r(g, ax - 6, ay - 9, 1, 1, '#ffd36b'); r(g, ax, ay - 11, 1, 1, '#ffd36b'); });   // 7 DOWN
  const low = (g, stride, arm) => { body(g, ax, ay); if (stride) { r(g, ax - 3, ay - 3, 1, 3, C.skinD); r(g, ax + 2, ay - 3, 1, 3, C.skinD); } arm(g); };
  draw(g => low(g, 0, g2 => { line(g2, ax + 3, ay - 7, ax + 7, ay - 5, C.gaff); })); draw(g => low(g, 1, g2 => { line(g2, ax + 3, ay - 7, ax + 7, ay - 6, C.gaff); }));   // 8-9 stiltless walk
  draw(g => low(g, 0, g2 => { line(g2, ax - 1, ay - 9, ax - 6, ay - 13, C.gaff); r(g2, ax - 7, ay - 14, 2, 1, C.hook); }));                                     // 10 STAB WINDUP
  draw(g => low(g, 1, g2 => { line(g2, ax + 3, ay - 7, ax + 13, ay - 6, C.gaff); r(g2, ax + 13, ay - 7, 2, 2, C.hook); }));                                     // 11 STAB
  draw(g => tall(g, 0, gaffRest, (g2, bx, by) => { r(g2, bx - 3, by - 15, 6, 1, '#ffffff'); }));                                                                 // 12 hurt
  const R = frames, Lf = frames.map(flipX), white = frames.map(c => whiten(c));
  return { R, L: Lf, white: { R: white, L: white.map(flipX) }, ax, ay, w: STILT.w, h: STILT.h };
}
