// src/huntmaster.js - THE GOBLIN HUNTMASTER, THE ROOTWAY's boss (claude/rootway, the OPUS GREYBOX, 2026-10-07; brief .claude/briefs/brief-rootway.md;
// booked 10-07 as Daniel's pick for the Rootway bridge, .claude/briefs/bridge-levels-2026-10-01.md #4).
// The goblins' master of the hunt: a lean goblin in a bone trophy MASK, a great bow, a quiver on a strap, a bracer, a skinning knife.
// A DUELIST (design standard B11): always hittable, he GUARDS BY ANGLE - between his moves (walking, recovering, standing) the great bow is held across him
// and a blow from his FRONT at his height is turned (a clank, a flash, GO ROUND through src/boss-read.js); from BEHIND, from the AIR (a jump, a plunge) or
// while he DRAWS, slashes, leaps or lands he takes it whole. No chip (src/boss-greed.js FULL_DAMAGE); greed still counts outside his openings (the mash reprisal).
// HIS KEY (B14, PR-reflect): A GOLD-GLINTING ARROW STRUCK BACK flies home and breaks the phase's WEAK POINT - P1 the QUIVER STRAP (his volleys lose an arrow),
//   P2 the BRACER (his draw slows), P3 the TROPHY MASK (THE BIG OPENING). A break opens him (HM.openT, x HM.openMul; the mask HM.maskT, x HM.maskMul); a gold arrow
//   sent home once the phase's point is broken still staggers him HM.stagT. RED (poisoned) arrows are not turned by a blade: dodge them, jump them.
//   The read: gold glint + a yellow ! = strike it back; a red trail + a red !! = get out of its way.
// THE LEVEL'S VERB (B1): a boss hoist's cage cut down on him (src/rootway-hands.js) - he is CAUGHT, open HM.caughtT x HM.openMul. His perches stand under the
//   cages: he leaps up to one, you cut its rope.
// B3: after every opening a told HM.ward s WARD (a ring, HE GUARDS): no blade lands, an arrow sent home glances off. B4: open, he stands still.
// B12: his LEAP is told (a crouch), once a cycle at most, never in or right after an opening; a bud under each perch lets every hero follow.
// PHASES (one new told move each): P1 the aimed shot, the volley, the knife, the leap. P2 (HM.p2 of his blood) THE POISONED SPLIT SHOT: three fanned, the outer
//   two RED, and where a red one lands the floor stays poisoned HM.poisonT s (the arena changes). P3 (HM.p3) THE HOIST-DROP SHOT: he shoots the rope of the cage
//   over YOU (its shadow on the floor first) - the rule turned on you.
// main.js calls makeHuntmaster(ctx): spawnBoss, owns, on, update, take, caught (a boss cage landed), drawBoss, drawOver, barName, end, read, fight.
export const HM = {
  hp: 1080, w: 14, h: 26, markH: 44,
  p2: 0.67, p3: 0.34,
  walk: 54, keep: [96, 150], back: 70, turnLag: 0.35,
  draw: 0.78, volleyDraw: 0.9, splitDraw: 0.95, hoistTell: 1.0, bracerK: 1.45, loose: 0.28,
  gap: [0.8, 0.65, 0.55],
  arrowV: 290, redV: 250, arrowDmg: 7, redDmg: 8, poisonTick: 3, poisonEvery: 0.5, poisonFor: 1.6, poisonT: 3, poisonR: 18, fan: 0.14,
  slashAt: 36, slashTell: 0.45, slash: 0.18, slashReach: 34, slashDmg: 12,
  leapTell: 0.5, leapT: 0.72, landT: 0.35, perchT: 4, leapCd: 1,
  backV: 340, backDmg: 14, reflectR: 12,
  cageDmg: 20, openT: 3.5, openMul: 1.5, maskT: 5, maskMul: 2, stagT: 1.2, stagMul: 1.25, caughtT: 3, ward: 3, stagWard: 1.5,
};
/* each cycle is a list; the phase's new move joins at its turn (k % n) */
const CYCLE = {
  1: [['aim', 'volley', 'aim', 'leap'], ['volley', 'aim', 'aim', 'volley'], ['aim', 'aim', 'volley', 'aim']],
  2: [['split', 'aim', 'volley', 'leap'], ['aim', 'split', 'split', 'aim'], ['volley', 'split', 'aim', 'volley']],
  3: [['hoist', 'split', 'aim', 'leap'], ['split', 'hoist', 'volley', 'aim'], ['aim', 'hoist', 'split', 'volley']],   /* (a leap one cycle in three: the perch is a place he goes, not where he lives) */
};
export const HM_MODES = { aimTell: '!', volleyTell: '!', splitTell: '!!', hoistTell: '!!', slashTell: '!' };   /* the marks (src/marks.js): a yellow ! a blade or a shield answers, a red !! you get out of */
const GUARDS = new Set(['walk', 'recover', 'stand']);
const WEAK = { 1: 'THE QUIVER STRAP', 2: 'THE BRACER', 3: 'THE MASK' };
export const hmOpen = e => !!e && (e.mode === 'open' || e.mode === 'caught') && (e.open || 0) > 0;

export function makeHuntmaster(ctx) {
  const TS = ctx.TS, H = {}; let F = null;
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.huntmaster ? ctx.L.arena : null);
  const R = Math.round;
  H.on = () => !!A();
  H.owns = e => e.t === 'huntmaster';
  H.fight = () => F;
  H.clear = () => { F = null; };
  const live = () => F && F.e && F.e.alive ? F.e : null;
  const nearest = e => ctx.players.filter(p => !p.dead).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || ctx.hero();
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    F = { A: Ar, ph: 1, cyc: 0, i: 0, list: CYCLE[1][0].slice(), arrows: [], pools: [], weak: { 1: false, 2: false, 3: false }, leapUsed: false, perchT: 0, faceT: 0, aimId: 0, said: {}, hurt: {},
      perches: (Ar.perches || []).map(([x0, x1, row]) => ({ x0: x0 * TS + 8, x1: (x1 + 1) * TS - 8, y: row * TS })),
      n: { shots: 0, gold: 0, red: 0, back: 0, breaks: 0, staggers: 0, glanced: 0, caught: 0, opens: 0, slashes: 0, leaps: 0, hoistShots: 0, turned: 0, cycles: 0, redStruck: 0 } };
    const e = { ...base, t: 'huntmaster', w: HM.w, h: HM.h, hp: ctx.EHP.huntmaster, maxHp: ctx.EHP.huntmaster, noGrav: true, markH: HM.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, ward: 0, phase: 1, perch: -1, vy: 0 };
    F.e = e; return e; };
  const set = (e, m, t) => { e.mode = m; e.modeT = t; };
  const tell = (e, m, t) => { set(e, m, t); const mk = HM_MODES[m]; if (mk) { ctx.number(e.x, e.y - HM.markH, mk, mk === '!' ? '#ffd36b' : '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(mk !== '!'); } };
  const floorY = () => F.A.floor;
  const groundY = e => e.perch >= 0 ? F.perches[e.perch].y : floorY();
  const clampX = (e, x) => e.perch >= 0 ? Math.max(F.perches[e.perch].x0, Math.min(F.perches[e.perch].x1, x)) : Math.max(F.A.x0 + 14, Math.min(F.A.x1 - 14, x));
  const hurtHero = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); F.hurt[name] = (F.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); };
  const once = k => { if (F.said[k]) return false; F.said[k] = 1; return true; };   /* a line said once a fight (every line is a literal in a number() call: src/hint-lines.js routes them) */

  /* THE NEXT MOVE: off the cycle; up close the knife; a leap at most once a cycle */
  function next(e) {
    const P = nearest(e), ad = Math.abs(P.x - e.x), dy = Math.abs(P.y - e.y);
    e.face = Math.sign(P.x - e.x) || e.face;
    if (ad < HM.slashAt && dy < 26) { F.n.slashes++; return tell(e, 'slashTell', HM.slashTell); }
    if (F.i >= F.list.length) { F.cyc++; F.n.cycles++; const L2 = CYCLE[F.ph]; F.list = L2[F.cyc % L2.length].slice(); F.i = 0; F.leapUsed = false; }
    let k = F.list[F.i++];
    if (k === 'leap') { if (F.leapUsed || !F.perches.length) k = 'aim'; else { F.leapUsed = true; return tell(e, 'leapTell', HM.leapTell); } }
    if (k === 'hoist') { const cg = cageOver(P); if (!cg) k = 'aim'; else { F.hoist = cg.id; F.hoistX = cg.x; F.n.hoistShots++; return tell(e, 'hoistTell', HM.hoistTell); } }
    const slow = F.weak[2] ? HM.bracerK : 1;
    if (k === 'volley') return tell(e, 'volleyTell', HM.volleyDraw * slow);
    if (k === 'split') return tell(e, 'splitTell', HM.splitDraw * slow);
    return tell(e, 'aimTell', HM.draw * slow);
  }
  /* the boss cage hanging over a hero (P3's hoist-drop shot), from the Rootway's hands */
  const cageOver = P => { const hs = ctx.rw ? ctx.rw.bossHoists() : []; let best = null; for (const h of hs) if (h.up && Math.abs(h.x - P.x) < 72 && (!best || Math.abs(h.x - P.x) < Math.abs(best.x - P.x))) best = h; return best; };   /* (the cage nearest you, within a few strides: the shot drops it where you were going) */
  const after = e => set(e, 'recover', HM.gap[F.ph - 1]);
  /* AN ARROW: gold (struck back flies home) or red (poisoned: a blade does not turn it) */
  function loose(e, kind, ang, aimAt) { const sx = e.x + (e.face || 1) * 8, sy = e.y - 18, v = kind === 'red' ? HM.redV : HM.arrowV;
    const a0 = Math.atan2(aimAt.y - sy, aimAt.x - sx), a = a0 + ang;
    F.arrows.push({ id: ++F.aimId, kind, x: sx, y: sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 2.2, back: false, said: false }); F.n.shots++; if (kind === 'red') F.n.red++; else F.n.gold++; }
  function shoot(e, what) { const P = nearest(e), at = { x: P.x, y: P.y - 10 };
    ctx.sfx.bow ? ctx.sfx.bow() : ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh();
    if (what === 'aim') loose(e, 'gold', 0, at);
    else if (what === 'volley') { const n = F.weak[1] ? 2 : 3; for (let k = 0; k < n; k++) loose(e, 'gold', (k - (n - 1) / 2) * HM.fan, at); }
    else if (what === 'split') { loose(e, 'gold', 0, at); loose(e, 'red', -HM.fan * 1.3, at); loose(e, 'red', HM.fan * 1.3, at); } }
  /* OPEN: still where he stands (B4); the ward follows (B3) */
  function open(e, mode, t, mul) { if (!e.alive) return; set(e, mode, t + 0.05); e.open = t; e.openMul = mul; e.ward = 0; e.vy = 0; F.n.opens++; ctx.shake(4); ctx.sfx.crack && ctx.sfx.crack();
    ctx.burst(e.x, e.y - 18, 16, ['#ffd36b', '#e8dcc0', '#8a6a48'], 80, 0.6); }
  /* A BOSS CAGE LANDED (src/rootway-hands.js): on him, he is CAUGHT */
  H.caught = (id, x, ly) => { const e = live(); if (!e || !F) return false; if (Math.abs(e.x - x) > 22 || Math.abs(e.y - ly) > 20) return false;
    if (e.ward > 0) { ctx.number(e.x, e.y - 50, 'HE GUARDS: THE CAGE GLANCES OFF', '#9aa39a'); return false; }
    if (hmOpen(e)) return false;
    F.n.caught++; selfHurt(e, HM.cageDmg, x); if (e.alive) { open(e, 'caught', HM.caughtT, HM.openMul); ctx.number(e.x, e.y - 56, 'CAUGHT IN HIS OWN CAGE: CUT HIM', '#8fd160'); } return true; };

  H.update = (e, dt) => {
    if (!F || !e.alive) return; const Ar = F.A, P = nearest(e);
    e.modeT -= dt; e.ward = Math.max(0, (e.ward || 0) - dt); if (e.open > 0) e.open = Math.max(0, e.open - dt);
    stepArrows(e, dt); stepPools(dt);
    /* the phases: by his blood, never in an opening */
    if (!hmOpen(e)) { const k = e.hp / e.maxHp;
      if (F.ph === 1 && k <= HM.p2) { F.ph = 2; e.phase = 2; F.cyc = 0; F.i = 0; F.list = CYCLE[2][0].slice(); ctx.number(e.x, e.y - 60, 'RED ARROWS ARE POISON: DODGE THEM, NEVER STRIKE', '#ff6b6b'); ctx.enrage && ctx.enrage(e); }
      else if (F.ph === 2 && k <= HM.p3) { F.ph = 3; e.phase = 3; F.cyc = 0; F.i = 0; F.list = CYCLE[3][0].slice(); ctx.number(e.x, e.y - 60, 'HE SHOOTS THE HOISTS: WATCH THE CAGE OVER YOU', '#ff6b6b'); ctx.enrage && ctx.enrage(e); } }
    if (e.perch >= 0) F.perchT += dt;   /* his time on a perch runs whatever he does there */
    /* he turns to you a beat late while he guards (go round him, and you have that beat) */
    if (GUARDS.has(e.mode)) { const want = Math.sign(P.x - e.x) || e.face; if (want !== e.face) { F.faceT += dt; if (F.faceT >= HM.turnLag) { e.face = want; F.faceT = 0; } } else F.faceT = 0; }
    switch (e.mode) {
      case 'sleep': set(e, 'wake', 1.2); if (once('wake')) ctx.number(e.x, e.y - 60, 'HIS GOLD ARROWS: STRIKE THEM BACK', '#ffd36b'); break;
      case 'wake': if (e.modeT <= 0) { F.list = CYCLE[1][0].slice(); F.i = 0; set(e, 'walk', 0.6); } break;
      case 'walk': case 'stand': { const d = P.x - e.x, ad = Math.abs(d);
        if (e.perch < 0) { /* he keeps his range: back off when you come in, come on when you stand off */
          let want = 0; if (ad < HM.keep[0]) want = -Math.sign(d) * HM.back; else if (ad > HM.keep[1]) want = Math.sign(d) * HM.walk;
          const nx = clampX(e, e.x + want * dt); e.x = nx; e.mode = Math.abs(want) > 1 && nx !== e.x - want * dt ? 'walk' : e.mode; }
        else if (F.perchT > HM.perchT) { F.perchT = 0; tell(e, 'leapTell', HM.leapTell); e.leapDown = true; break; }   /* (you followed him up: he stays and fights you there - his knife - until his time is up) */
        if (e.modeT <= 0) next(e); break; }
      case 'recover': if (e.modeT <= 0) set(e, 'walk', 0.2); break;
      case 'aimTell': case 'volleyTell': case 'splitTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { shoot(e, e.mode.replace('Tell', '')); set(e, 'loose', HM.loose); } break;
      case 'loose': if (e.modeT <= 0) after(e); break;
      case 'hoistTell': e.face = Math.sign(F.hoistX - e.x) || e.face; if (e.modeT <= 0) { if (ctx.rw) ctx.rw.cutHoist(F.hoist); ctx.sfx.bow ? ctx.sfx.bow() : ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); F.hoist = null; set(e, 'loose', HM.loose); } break;
      case 'slashTell': if (e.modeT <= 0) set(e, 'slash', HM.slash); break;
      case 'slash': { const fx = e.face || 1, fl = e.y; hit(e, fx > 0 ? [e.x - 6, e.x + HM.slashReach, fl - 24, fl] : [e.x - HM.slashReach, e.x + 6, fl - 24, fl], HM.slashDmg, 'HIS KNIFE', 'hs' + F.n.slashes, true); if (e.modeT <= 0) after(e); break; }
      case 'leapTell': if (e.modeT <= 0) { /* to the perch farther from you, or back down to the floor */
          let to; if (e.perch >= 0 || e.leapDown) { to = { x: clampX({ perch: -1 }, e.x + (Math.sign(Ar.x0 + (Ar.x1 - Ar.x0) / 2 - e.x) || 1) * 70), y: floorY(), perch: -1 }; }
          else { const pp = F.perches.map((p, i) => ({ i, x: (p.x0 + p.x1) / 2, y: p.y })).sort((a, b) => Math.abs(b.x - P.x) - Math.abs(a.x - P.x))[0]; to = { x: pp.x, y: pp.y, perch: pp.i }; }
          e.leapDown = false; e.lf = { x0: e.x, y0: e.y, x1: to.x, y1: to.y, perch: to.perch, t: 0 }; set(e, 'leap', HM.leapT); F.n.leaps++; ctx.sfx.dodge && ctx.sfx.dodge(); ctx.dust(e.x, e.y, 6); } break;
      case 'leap': { const f = e.lf, k = Math.min(1, 1 - e.modeT / HM.leapT); e.x = f.x0 + (f.x1 - f.x0) * k; e.y = f.y0 + (f.y1 - f.y0) * k - Math.sin(k * Math.PI) * 52; e.face = Math.sign(P.x - e.x) || e.face;
        if (e.modeT <= 0) { e.x = f.x1; e.y = f.y1; e.perch = f.perch; F.perchT = 0; set(e, 'land', HM.landT); ctx.dust(e.x, e.y, 8); ctx.sfx.thud && ctx.sfx.thud(); } break; }
      case 'land': if (e.modeT <= 0) set(e, 'walk', 0.4); break;
      case 'open': case 'caught': e.vy = 0; if (e.open <= 0) { e.ward = e.openMul === HM.stagMul ? HM.stagWard : HM.ward; set(e, 'recover', 0.3); ctx.number(e.x, e.y - 50, 'HE GUARDS', '#9aa39a'); } break;
      default: if (e.modeT <= -1) after(e);
    }
    /* standing where he stands (a perch, or the floor); off a perch a cage knocked him from, he falls */
    if (e.mode !== 'leap') { if (e.perch >= 0) { const p = F.perches[e.perch]; if (e.x < p.x0 - 10 || e.x > p.x1 + 10) e.perch = -1; }
      const gy = groundY(e); if (e.y < gy - 1) { e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); e.y = Math.min(gy, e.y + e.vy * dt); } else { e.y = gy; e.vy = 0; } }
    e.x = Math.max(Ar.x0 + 12, Math.min(Ar.x1 - 12, e.x));
  };
  function hit(e, bx, d, name, key, blockable) { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
    if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return; pp.hmKeys = pp.hmKeys || new Set(); if (pp.hmKeys.has(key)) return; pp.hmKeys.add(key); if (pp.hmKeys.size > 80) pp.hmKeys.clear();
    hurtHero(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !blockable })); }); }
  /* THE ARROWS: in flight, struck back (gold), turned by nothing (red) */
  function stepArrows(e, dt) {
    const hb = ctx.attackBox(), P0 = ctx.hero();
    for (const a of F.arrows) {
      if (a.back) { const dx = e.x - a.x, dy = (e.y - 16) - a.y, d = Math.hypot(dx, dy) || 1; a.vx = dx / d * HM.backV; a.vy = dy / d * HM.backV; a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
        if (d < 14) { a.dead = true; home(e, a); } if (a.life <= 0) a.dead = true; continue; }
      /* a blade (or the warden's sweep) that meets it */
      const box = { l: a.x - HM.reflectR, r: a.x + HM.reflectR, t: a.y - HM.reflectR, b: a.y + HM.reflectR };
      const sweep = P0 && !P0.dead && (P0.deflectT || 0) > 0 && Math.abs(a.x - P0.x) < 22 && Math.abs(a.y - (P0.y - 10)) < 20;
      if ((hb && ctx.overlap(hb, box)) || sweep) {
        if (a.kind === 'gold') { a.back = true; a.life = 1.6; F.n.back++; ctx.sfx.parry && ctx.sfx.parry(); ctx.sparks(a.x, a.y, P0.face || 1, 6); if (once('back')) ctx.number(a.x, a.y - 20, 'STRUCK BACK: IT FLIES HOME', '#8fd160'); continue; }
        if (!a.said) { a.said = true; F.n.redStruck++; ctx.number(a.x, a.y - 20, 'POISON: DODGE IT', '#ff6b6b'); } }
      a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
      if (ctx.solidAt(Math.floor(a.x / TS), Math.floor(a.y / TS)) || a.y > F.A.floor + 4) { a.dead = true; if (a.kind === 'red') poolAt(a.x); continue; }
      if (a.life <= 0) { a.dead = true; continue; }
      for (const pp of ctx.players) { if (pp.dead || a.dead) continue; if (!ctx.overlap({ l: a.x - 3, r: a.x + 3, t: a.y - 3, b: a.y + 3 }, ctx.box(pp))) continue;
        a.dead = true; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (a.kind === 'gold') hurtHero('HIS ARROW', () => ctx.damagePlayer(a.x - a.vx * 0.05, HM.arrowDmg, { who: e, name: 'HIS ARROW' }));
          else { const h0 = P.hp; hurtHero('THE RED ARROW', () => ctx.damagePlayer(a.x - a.vx * 0.05, HM.redDmg, { who: e, name: 'THE RED ARROW', unblockable: true })); if (P.hp < h0) { pp.hmPoison = HM.poisonFor; pp.hmPoisonT = HM.poisonEvery; if (once('poisoned')) ctx.number(P.x, P.y - 30, 'THE POISON IS IN YOU', '#9ad85a'); } } }); }
    }
    F.arrows = F.arrows.filter(a => !a.dead);
    /* poison on a hero: a tick at a time */
    for (const pp of ctx.players) { if (!(pp.hmPoison > 0)) continue; if (pp.dead) { pp.hmPoison = 0; continue; } pp.hmPoison -= dt; pp.hmPoisonT -= dt;
      if (pp.hmPoisonT <= 0) { pp.hmPoisonT = HM.poisonEvery; ctx.asPlayer(pp, () => hurtHero('POISON', () => ctx.damagePlayer(pp.x, HM.poisonTick, { who: e, name: 'POISON', unblockable: true, noKnock: true }))); } }
  }
  /* A GOLD ARROW COMES HOME: the phase's weak point breaks (THE BIG OPENING at the mask), or he staggers; in his ward it glances off */
  function home(e, a) {
    if (!e.alive) return;
    if (e.ward > 0) { F.n.glanced++; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x, e.y - 18, 1, 4); ctx.number(e.x, e.y - 50, 'HE GUARDS: IT GLANCES OFF', '#9aa39a'); return; }
    if (hmOpen(e)) { selfHurt(e, HM.backDmg, a.x); return; }
    const ph = F.ph; selfHurt(e, HM.backDmg, a.x); if (!e.alive) return;
    if (!F.weak[ph]) { F.weak[ph] = true; F.n.breaks++;
      open(e, 'open', ph === 3 ? HM.maskT : HM.openT, ph === 3 ? HM.maskMul : HM.openMul);
      if (ph === 1) ctx.number(e.x, e.y - 56, 'THE QUIVER STRAP SNAPS: HE IS OPEN', '#8fd160'); else if (ph === 2) ctx.number(e.x, e.y - 56, 'THE BRACER BREAKS: HE IS OPEN', '#8fd160'); else ctx.number(e.x, e.y - 56, 'THE MASK BREAKS: HE IS OPEN', '#8fd160'); }
    else { F.n.staggers++; open(e, 'open', HM.stagT, HM.stagMul); ctx.number(e.x, e.y - 56, 'HIS OWN ARROW: HE STAGGERS', '#8fd160'); }
  }
  /* what his own gear does to him (his arrow come home, his cage) lands whole: his guard is for blades */
  function selfHurt(e, d, x) { F.self = true; try { ctx.hurt(e, d, x); } finally { F.self = false; } }
  function poolAt(x) { x = Math.max(F.A.x0 + 10, Math.min(F.A.x1 - 10, x)); F.pools.push({ x, t: HM.poisonT, tick: 0 }); }
  function stepPools(dt) { const e = live(); for (const q of F.pools) { q.t -= dt; q.tick -= dt;
      for (const pp of ctx.players) if (!pp.dead && Math.abs(pp.x - q.x) < HM.poisonR && Math.abs(pp.y - F.A.floor) < 6 && q.tick <= 0) { q.tick = HM.poisonEvery; ctx.asPlayer(pp, () => hurtHero('POISON', () => ctx.damagePlayer(q.x, HM.poisonTick, { who: e, name: 'POISON', unblockable: true, noKnock: true }))); } }
    F.pools = F.pools.filter(q => q.t > 0); }

  /* A BLOW ON HIM: whole, except a blow from his FRONT at his height while he guards (B11: GO ROUND, or from the air), and nothing in his ward (B3) */
  H.take = (e, dmg, fromX, plunge) => { if (!F) return dmg; const P = ctx.hero();
    if (F.self) return dmg;
    if (hmOpen(e)) return dmg * (e.openMul || HM.openMul);
    if (e.ward > 0) { F.n.turned++; ctx.turned && ctx.turned(e, fromX, 'HE GUARDS'); return 0; }
    const frontal = (e.face || 1) * (fromX - e.x) > -2, air = !!plunge || (P && !P.ground) || (P && P.y < e.y - 14);
    if (GUARDS.has(e.mode) && frontal && !air) { F.n.turned++; ctx.turned && ctx.turned(e, fromX, 'GO ROUND'); if (once('round')) ctx.number(e.x, e.y - 60, 'HE GUARDS HIS FRONT: GO ROUND, OR FROM ABOVE', '#ffd36b'); return 0; }
    return dmg; };
  H.barName = e => 'THE GOBLIN HUNTMASTER' + (e.mode === 'caught' ? '  CAUGHT' : hmOpen(e) ? '  OPEN' : e.ward > 0 ? '  GUARDING' : '');
  H.end = () => { if (F) { F.arrows = []; F.pools = []; } for (const pp of ctx.players) pp.hmPoison = 0; };
  H.read = () => F && { ph: F.ph, weak: { ...F.weak }, n: { ...F.n }, hurt: { ...F.hurt }, arrows: F.arrows.map(a => ({ id: a.id, kind: a.kind, x: a.x, y: a.y, vx: a.vx, vy: a.vy, back: a.back })), pools: F.pools.map(q => ({ x: q.x, t: q.t })), hoist: F.hoist || null, hoistX: F.hoistX, perches: F.perches };

  /* ---------- DRAWING (GREYBOX: plain shapes until the art pass) ---------- */
  H.drawBoss = (g, e, cx, cy, time) => {
    if (!F) return; const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, m = e.mode, open = hmOpen(e), crouch = m === 'leapTell' || m === 'land' || m === 'caught';
    const by = y - (crouch ? 20 : 24), skin = '#4a6a2a', skinD = '#2e4a1a', leather = '#5a3a22', bone = '#e8dcc0';
    if (e.flash > 0) g.globalAlpha = 0.6;
    /* legs and body */
    g.fillStyle = skinD; g.fillRect(x - 4, y - 8, 3, 8); g.fillRect(x + 1, y - 8, 3, 8);
    g.fillStyle = leather; g.fillRect(x - 6, by + 4, 12, 13); g.fillStyle = '#7a5232'; g.fillRect(x - 6, by + 4, 12, 2);
    /* the quiver on its strap (P1's weak point) - gone once broken */
    if (!F.weak[1]) { g.fillStyle = '#6a3a1a'; g.fillRect(x - f * 9 - 2, by, 5, 14); g.fillStyle = '#ffd36b'; g.fillRect(x - f * 9 - 2, by - 3, 1, 3); g.fillRect(x - f * 9, by - 3, 1, 3); g.fillRect(x - f * 9 + 2, by - 3, 1, 3);
      g.fillStyle = '#c9a060'; g.fillRect(x - 6, by + 5, 12, 1); }
    /* the head and the TROPHY MASK (P3's weak point): a bone skull face, eye sockets lit */
    g.fillStyle = skin; g.fillRect(x - 5, by - 8, 10, 10); g.fillRect(x - 9, by - 6, 4, 2); g.fillRect(x + 5, by - 6, 4, 2);
    if (!F.weak[3]) { g.fillStyle = bone; g.fillRect(x - 4 + f, by - 7, 8, 7); g.fillStyle = '#2a1a12'; g.fillRect(x - 2 + f, by - 5, 2, 2); g.fillRect(x + 1 + f, by - 5, 2, 2); g.fillStyle = open ? '#8fd160' : '#ff9a3c'; g.fillRect(x - 2 + f, by - 5, 1, 1); g.fillRect(x + 1 + f, by - 5, 1, 1); }
    else { g.fillStyle = '#ffe27a'; g.fillRect(x - 2 + f, by - 5, 1, 1); g.fillRect(x + 1 + f, by - 5, 1, 1); g.fillStyle = bone; g.fillRect(x - 6 + f * 6, by - 9, 3, 3); }
    /* the arms, the bracer (P2's weak point) and the great bow: across him while he guards, drawn while he aims, the knife up on the slash */
    const drawn = /Tell$/.test(m) && m !== 'slashTell' && m !== 'leapTell' || m === 'loose';
    g.fillStyle = skin; g.fillRect(x + f * 4 - 1, by + 6, 3, 6);
    if (!F.weak[2]) { g.fillStyle = '#8a6a48'; g.fillRect(x + f * 4 - 1, by + 9, 3, 3); g.fillStyle = '#c9a060'; g.fillRect(x + f * 4 - 1, by + 9, 3, 1); }
    g.strokeStyle = '#6a4a22'; g.lineWidth = 2; g.beginPath();
    if (drawn) { g.arc(x + f * 8, by + 8, 13, f > 0 ? -1.2 : Math.PI - 1.2, f > 0 ? 1.2 : Math.PI + 1.2); g.stroke(); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + f * 12, by - 3); g.lineTo(x - f * (m === 'loose' ? -2 : 4), by + 8); g.lineTo(x + f * 12, by + 19); g.stroke();
      const k = Math.min(1, 1 - Math.max(0, e.modeT) / (m === 'aimTell' ? HM.draw : HM.volleyDraw)); g.fillStyle = m === 'splitTell' || m === 'hoistTell' ? '#ff6b6b' : '#ffd36b'; g.globalAlpha = 0.5 + 0.5 * k; g.fillRect(x + f * 14 - 1, by + 7, 3, 3); g.globalAlpha = 1; }
    else if (m === 'slashTell' || m === 'slash') { g.stroke(); g.fillStyle = '#c9d1dc'; g.fillRect(x + f * (m === 'slash' ? 10 : 2), by + (m === 'slash' ? 8 : -4), f * 9, 2); }
    else { g.moveTo(x - 9, by - 4); g.quadraticCurveTo(x + f * 4, by + 8, x - 9, by + 22); g.stroke(); }   /* across him: his guard */
    g.globalAlpha = 1;
    /* OPEN: the gold ring and its timer (B10); CAUGHT: the cage's bars over him; THE WARD: a pale ring */
    if (open) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.45 + 0.35 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, by + 6, 20, 0, 7); g.stroke(); g.globalAlpha = 1;
      const t0 = m === 'caught' ? HM.caughtT : F.weak[3] && e.openMul === HM.maskMul ? HM.maskT : e.openMul === HM.stagMul ? HM.stagT : HM.openT, kk = Math.max(0, e.open / t0); g.fillStyle = '#1b1626'; g.fillRect(x - 16, by - 20, 32, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 16, by - 20, R(32 * kk), 3); }
    if (m === 'caught') { g.fillStyle = '#4a4a52'; for (let k = -2; k <= 2; k++) g.fillRect(x + k * 7, y - 32, 2, 32); g.fillRect(x - 16, y - 32, 32, 2); }
    if (e.ward > 0) { const k = 0.5 + 0.5 * Math.sin(time * 12); g.globalAlpha = 0.25 + 0.3 * k; g.strokeStyle = '#d8e2ee'; g.lineWidth = 1; g.beginPath(); g.arc(x, by + 6, 22, 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (m === 'leapTell') { g.fillStyle = '#ffd36b'; g.fillRect(x - 6, y + 1, 12, 1); }
  };
  /* his arrows, the poisoned floor, the hoist-drop shot's shadow, the struck-back arrow's trail */
  H.drawOver = (g, cx, cy, time) => {
    if (!F) return; const e = live(), fl = R(F.A.floor - cy);
    for (const q of F.pools) { const x = R(q.x - cx), k = Math.min(1, q.t); g.globalAlpha = 0.6 * k; g.fillStyle = '#4a8a2a'; g.fillRect(x - HM.poisonR, fl - 2, HM.poisonR * 2, 2); g.fillStyle = '#9ad85a'; for (let i = -HM.poisonR + 3; i < HM.poisonR; i += 7) g.fillRect(x + i, fl - 3 - R(Math.abs(Math.sin(time * 4 + i)) * 2), 2, 1); g.globalAlpha = 1; }
    if (e && e.mode === 'hoistTell' && F.hoistX != null) { const x = R(F.hoistX - cx), k = Math.max(0, 1 - e.modeT / HM.hoistTell); g.globalAlpha = 0.2 + 0.4 * k; g.fillStyle = '#1a1210'; g.fillRect(x - TS, fl - 3, 2 * TS, 3); g.globalAlpha = 1;
      if (Math.floor(time * 12) % 2) { g.fillStyle = '#ff6b6b'; g.fillRect(x - TS, fl - 4, 2 * TS, 1); } }
    for (const a of F.arrows) { const x = R(a.x - cx), y = R(a.y - cy), d = Math.hypot(a.vx, a.vy) || 1, ux = a.vx / d, uy = a.vy / d;
      g.strokeStyle = a.kind === 'red' ? '#a83a2a' : '#c9a060'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - ux * 9, y - uy * 9); g.lineTo(x, y); g.stroke();
      g.fillStyle = a.kind === 'red' ? '#ff4a3a' : (Math.floor(time * 16 + a.id) % 2 ? '#fff6c8' : '#ffd36b'); g.fillRect(x - 1, y - 1, 3, 3);   /* the head: a gold glint, or red */
      if (a.kind === 'red') { g.globalAlpha = 0.5; g.fillStyle = '#ff6b6b'; g.fillRect(R(x - ux * 14), R(y - uy * 14), 2, 2); g.fillStyle = '#9ad85a'; g.fillRect(R(x - ux * 5), R(y - uy * 5) + 2, 1, 1); g.globalAlpha = 1; }
      if (a.back) { g.fillStyle = '#e8f4f8'; g.fillRect(R(x - ux * 12), R(y - uy * 12), 2, 1); } }
    for (const pp of ctx.players) if (pp.hmPoison > 0 && !pp.dead) { const x = R(pp.x - cx), y = R(pp.y - cy); g.fillStyle = '#9ad85a'; for (let k = 0; k < 3; k++) g.fillRect(x - 4 + k * 4, y - 22 - R(3 * Math.abs(Math.sin(time * 8 + k))), 2, 2); }
  };
  return H;
}

/* ---------- THE HUMAN-SPEED BOT'S PLAN (src/lab.js, the boss lab) ----------
   What a player reads: his marks a reaction late (some misread), the arrows in the air (gold or red), the shadow under a cage, his ring. v2 ONLY (o.eyes) it
   STRIKES GOLD ARROWS BACK - faces the arrow and swings as it comes into reach (some let go) - the human key; the legacy bot blocks or rolls them. It dodges
   or jumps a red one; steps out from under a cage he aims at; cuts a perch's rope when he stands under its cage; climbs a bud to follow him; cuts him from
   behind or from a jump while he guards; cuts hard while he is open.
   o = { P: { x, y, face, ground, atk, vy, busy }, e, R (read), A, reach, shield, deflect (the warden), cleats: [{ id, x, up, cx }], buds: [{ x, top }], t, rng, mem, eyes, greed }
   -> { gx, face, atk, jump, block, dodge, why } */
export const PLAN = { react: 0.25, miss: 0.15, missBack: 0.3 };
export function hmPlan(o) {
  const { P, e, R, A, reach } = o, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, why: '' };
  const mem = o.mem || {}, rng = o.rng || Math.random, t = o.t || 0; mem.roll = mem.roll || new Map(); if (mem.roll.size > 400) mem.roll.clear();
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const lo = A.x0 + 14, hi = A.x1 - 14, clamp = x => Math.max(lo, Math.min(hi, x)), dx = e.x - P.x, ad = Math.abs(dx), toHim = Math.sign(dx) || 1;
  if (mem.seenMode !== e.mode) { mem.seenMode = e.mode; mem.seenAt = t; }
  const seen = o.eyes || t - mem.seenAt >= PLAN.react;
  const sameFloor = Math.abs(e.y - P.y) < 20;
  /* OPEN or CAUGHT: cut him (a blow short of greed is not needed - he is open) */
  if (hmOpen(e)) { if (!sameFloor && e.y < P.y - 20) { const b = (o.buds || []).sort((a, q) => Math.abs(a.x - e.x) - Math.abs(q.x - e.x))[0]; if (b) { out.gx = b.x; out.why = 'up the bud to him'; if (Math.abs(P.x - b.x) < 6 && P.ground && P.y <= b.top + 2) out.jump = true; return out; } }
    out.gx = clamp(e.x - toHim * Math.max(10, reach * 0.6)); out.face = toHim; out.atk = ad < reach + 10 && P.atk < 0 && Math.abs(e.y - P.y) < 30; out.why = 'cut him: he is open'; return out; }
  /* THE ARROWS */
  const R0 = R || { arrows: [] };
  for (const a of R0.arrows) { if (a.back) continue; const rx = a.x - P.x, ry = a.y - (P.y - 10), come = rx * a.vx < 0 || Math.abs(rx) < 8;
    if (!come || Math.abs(rx) > 90 || Math.abs(ry) > 40) continue;
    if (a.kind === 'gold' && o.eyes && !roll('b' + a.id, PLAN.missBack)) {   /* (each arrow its own roll: some let go) */ out.face = Math.sign(rx) || P.face; out.gx = P.x;
      if (Math.hypot(rx, ry) < reach + 6 + Math.hypot(a.vx, a.vy) * 0.07 && Math.abs(ry) < 26 && P.atk < 0) out.atk = true; out.why = 'strike his arrow back'; return out; }   /* (the swing comes out a beat after the press: met a beat early) */
    if (a.kind === 'gold' && o.shield && !roll('s' + a.id, PLAN.miss)) { out.block = true; out.face = Math.sign(rx) || P.face; out.why = 'block the arrow'; return out; }
    if (o.deflect && a.kind === 'gold' && !(P.busy > 0) && !roll('w' + a.id, PLAN.missBack)) { out.block = Math.abs(rx) < 40; out.face = Math.sign(rx) || P.face; out.why = 'sweep the arrow'; return out; }
    if (Math.abs(rx) < 46) { if (a.kind === 'red' && P.ground && ry > -6 && !roll('j' + a.id, 0.5)) { out.jump = true; out.why = 'jump the red arrow'; return out; } out.dodge = true; out.why = a.kind === 'red' ? 'roll the red arrow' : 'roll the arrow'; return out; } }
  /* THE POISONED FLOOR */
  for (const q of R0.pools || []) if (Math.abs(q.x - P.x) < 22 && P.ground) { out.gx = clamp(P.x + (P.x < q.x ? -40 : 40)); out.why = 'off the poison'; return out; }
  /* THE HOIST-DROP SHOT: out from under the cage */
  if (e.mode === 'hoistTell' && seen && R0.hoistX != null && Math.abs(P.x - R0.hoistX) < 40) { out.gx = clamp(R0.hoistX + (P.x < R0.hoistX ? -56 : 56)); if (Math.abs(P.x - R0.hoistX) < 20 && e.modeT < 0.3) out.dodge = true; out.why = 'out from under the cage'; return out; }
  /* HIS KNIFE: block, sweep, or step back */
  if ((e.mode === 'slashTell' || e.mode === 'slash') && seen && ad < 60 && !roll('k' + Math.round(t * 2), PLAN.miss)) { out.face = toHim;
    if (o.deflect && !(P.busy > 0)) { out.block = e.modeT < 0.22 || e.mode === 'slash'; out.why = 'sweep the knife'; return out; }
    if (o.shield) { out.block = true; out.why = 'block the knife'; return out; } out.gx = clamp(e.x - toHim * 70); if (ad < 52 && (e.mode === 'slash' || e.modeT < 0.2) && P.ground) out.dodge = true; out.why = 'out of the knife'; return out; }
  /* HE IS ON A PERCH: cut the rope of the cage over him (the level's verb), else up the bud */
  if (e.y < A.floor - 20) { const c = (o.cleats || []).filter(q => q.up && Math.abs(q.x - e.x) < 24)[0];
    if (c && !(e.ward > 0) && Math.abs(P.x - c.cx) < 200) { out.gx = c.cx - 6; out.face = 1; if (Math.abs(P.x - (c.cx - 6)) < 8 && P.ground && P.atk < 0) { out.face = Math.sign(c.cx - P.x) || 1; out.atk = true; } out.why = 'cut the rope over him'; return out; }
    const b = (o.buds || []).sort((a, q) => Math.abs(a.x - e.x) - Math.abs(q.x - e.x))[0];
    if (b) { if (P.y < A.floor - 20) { out.gx = clamp(e.x - toHim * 14); out.face = toHim; out.atk = ad < reach + 8 && P.atk < 0 && sameFloor; out.why = 'on his perch: cut him'; return out; }
      out.gx = b.x; if (Math.abs(P.x - b.x) < 6) out.gx = P.x; if (b.grown && Math.abs(P.x - b.x) < 10 && P.ground) out.jump = true; out.why = 'up the bud to his perch'; return out; } }
  /* HE GUARDS HIS FRONT: stand off his knife; cut him from a jump over his guard, or from behind when he turns late */
  const guarding = ['walk', 'recover', 'stand'].includes(e.mode) && !(e.ward > 0), standoff = Math.max(50, reach + 22);
  if (e.ward > 0) { out.gx = clamp(e.x - toHim * 70); out.face = toHim; out.why = 'he guards: wait it out'; return out; }
  if (!P.ground && P.atk < 0 && ad < reach + 10 && sameFloor && (o.greed || 0) < 3) { out.atk = true; out.face = toHim; out.gx = e.x; out.why = 'cut him from the air'; return out; }
  if (guarding && sameFloor) { const front = (e.face || 1) * (P.x - e.x) > 0;
    if (!front && ad < reach + 10 && P.atk < 0 && (o.greed || 0) < 3) { out.atk = true; out.face = toHim; out.why = 'cut him from behind'; return out; }
    if (front && ad < standoff + 8 && P.ground && (o.greed || 0) < 3 && !roll('jj' + Math.floor(t * 1.2), 0.5)) { out.jump = true; out.gx = e.x + toHim * 6; out.face = toHim; out.why = 'over his guard'; return out; }
    out.gx = clamp(e.x - toHim * standoff); out.face = toHim; out.why = 'stand off his knife'; return out; }
  /* HE DRAWS: both hands on the bow, his front is open - in, and cut him (a swing that meets his arrow as it leaves the string sends it home) */
  if (/Tell$/.test(e.mode) && e.mode !== 'slashTell' && e.mode !== 'leapTell' && e.mode !== 'hoistTell' && sameFloor && seen && ad < reach + 70) { out.gx = clamp(e.x - toHim * Math.max(12, reach - 8)); out.face = toHim;
    if (ad < reach + 8 && P.atk < 0 && (o.greed || 0) < 3) out.atk = true; out.why = 'cut him as he draws'; return out; }
  out.gx = clamp(e.x - toHim * standoff); out.face = toHim; out.why = 'close in';
  return out;
}
