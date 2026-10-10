import * as RWA from './redraw/rootway_art.js';   /* THE HUNTMASTER's pose painter (the art pass) */
// src/huntmaster.js - THE GOBLIN HUNTMASTER, THE ROOTWAY's boss (claude/rootway greybox 10-07; REWORKED claude/rootway2 2026-10-09 from Daniel's live playtest:
// "the boss only fires arrows and jumps around" - brief scratch/brief-rootway2.md B, all four new moves, the long stagger + hit cap, the dodge roll).
// The goblins' master of the hunt: a lean goblin in a bone trophy MASK, a great bow, a quiver on a strap, a bracer, a skinning knife, a NET, a HUNTING HORN and
// a bag of JAW TRAPS. A DUELIST (design standard B11) who KEEPS HIS DISTANCE: always hittable, he GUARDS BY ANGLE between his moves (walking, recovering,
// standing) - the great bow across him turns a blow from his FRONT at his height to HM.guardMul (B15: never totally shut, the clank says GO ROUND); from
// BEHIND, from the AIR (a jump, a plunge) or while he draws, throws, blows or sets a trap he takes it whole. No chip (src/boss-greed.js FULL_DAMAGE).
// HIS OPENING (B10/B14): SEND HIS OWN GOLD ARROW HOME (strike it back) or HIT HIM WITH A THROWN SPORE POD (src/hunt-pods.js) and he STAGGERS LONG -
//   HM.stagLong s, gold OPEN ring + timer, he drops off his perch, he stands still (B4) - so you can cross the stand to him. But only THREE BLOWS' WORTH lands (HM.hitCap x HM.blowRef: the pips)
//   land (x HM.openMul, x HM.maskMul once the mask is broken); the next one ends it and his told WARD follows (B3: HM.ward s, a pale ring, HE GUARDS - blows
//   at HM.wardMul, B15). A parry (the warden's sweep) turns the arrow home softly: a short stagger (HM.stagT, HM.softCap blows).
//   The first gold arrow home in each phase also breaks that phase's weak point - P1 the QUIVER STRAP (his volleys lose an arrow), P2 the BRACER (his draw
//   slows), P3 the TROPHY MASK (his openings pay HM.maskMul).
// THE LEVEL'S VERB (B1): a boss hoist's cage cut down on him (src/rootway-hands.js) - he is CAUGHT, the same opening (HM.caughtT, the hit cap).
// HIS MOVES - every one TOLD (a sound, a word, a colour; src/marks.js), one windup at a time, a new one each phase (B5):
//   P1  the aimed shot ('!'), the volley ('!'), NEW: THE NET THROW ('!!' - roll through it; caught, you are held HM net s and he looses a HEAVY ARROW, '!!')
//   P2  NEW: THE SNARES ('!!' - he leaps about the stand setting JAW TRAPS, src/snares.js: jump them, or spring them with a thrown pod);
//       the poisoned split shot (red arrows: dodge them); THE HUNTING HORN once (two goblin ARCHERS onto the root perches)
//   P3  NEW: THE HOIST-DROP SHOT ('!!' - the cage over YOU, its shadow first); the horn once more
//   ALWAYS: rush him and he draws THE KNIFE FLURRY (a told '!' windup, then three cuts - punishes mashing); come in under his guard and he may DODGE ROLL
//   away (B12: once a cycle at most, never in or right after an opening, never off the stand - he lands where you can follow).
// The read (B10): gold glint + a yellow ! = strike it back; a red trail + a red !! = get out of its way; a pale rope ball + !! = roll through it.
// main.js calls makeHuntmaster(ctx): spawnBoss, owns, on, update, take, caught (a boss cage landed), podHit (a thrown pod), drawBoss, drawOver, barName, end, read, fight.
export const HM = {
  hp: 940, w: 14, h: 26, markH: 44,
  p2: 0.7, p3: 0.38,
  walk: 54, keep: [96, 150], back: 70, turnLag: 0.35,
  draw: 0.78, volleyDraw: 0.9, splitDraw: 0.95, hoistTell: 1.0, bracerK: 1.45, loose: 0.28,
  gap: [0.8, 0.7, 0.6],
  arrowV: 290, redV: 250, arrowDmg: 10, redDmg: 12, poisonTick: 4, poisonEvery: 0.5, poisonFor: 1.6, poisonT: 3, poisonR: 18, fan: 0.14,
  /* THE NET THROW: a told throw (netTell), a slow lobbed net you ROLL THROUGH; caught = held `net` s and a HEAVY ARROW on its way (heavyTell) */
  netTell: 0.7, netV: 200, netLift: -150, netG: 260, netR: 13, net: 1.1, netDmg: 3, heavyTell: 0.42, heavyV: 330, heavyDmg: 14,
  /* THE SNARES: a told crouch, then hops about the stand dropping JAW TRAPS (src/snares.js) - at most snareMax set at once */
  snareTell: 0.6, snareHop: 0.34, snareN: 3, snareMax: 4, snareSpread: 46,
  /* THE HUNTING HORN: once a phase from P2 - two goblin archers onto the root perches */
  hornTell: 1.1, hornAdds: 2, addLife: 15, addHp: 12,   /* (his bows stay addLife s, then fall back off the perches; addHp: two or three blows) */
  /* THE KNIFE FLURRY: rush him and the knife comes out (a told windup), three cuts a step apart */
  flurryAt: 46, flurryTell: 0.5, flurryCuts: 3, flurryCut: 0.2, flurryReach: 34, flurryDmg: 9, flurryStep: 9,
  /* THE DODGE ROLL (B12): away from a blade up close, once a cycle, never in or within rollAfter s of an opening */
  rollAt: 30, roll: 0.42, rollDist: 92, rollAfter: 2.5,
  leapTell: 0.5, leapT: 0.72, landT: 0.35, perchT: 4, leapCd: 1,
  backV: 340, backDmg: 14, reflectR: 16, strikeR: 30,
  cageDmg: 20, openMul: 1.5, maskMul: 2, stagLong: 3.75, hitCap: 3, blowRef: 15, maxBlows: 4, stagT: 1.4, softCap: 1, caughtT: 3.75, ward: 3, wardMul: 0.4, guardMul: 0.4,
};
/* each cycle is a list; the phase's new move joins at its turn (k % n). 'horn' is once a phase (a second one reads as 'aim') */
const CYCLE = {
  1: [['aim', 'net', 'volley', 'leap'], ['volley', 'aim', 'net', 'aim'], ['net', 'aim', 'leap', 'volley']],
  2: [['horn', 'snare', 'split', 'aim', 'leap'], ['split', 'net', 'snare', 'aim'], ['snare', 'aim', 'split', 'net', 'leap']],
  3: [['horn', 'hoist', 'snare', 'split', 'aim'], ['split', 'hoist', 'net', 'aim', 'leap'], ['hoist', 'snare', 'aim', 'split', 'net']],
};
export const HM_MODES = { aimTell: '!', volleyTell: '!', splitTell: '!!', hoistTell: '!!', netTell: '!!', heavyTell: '!!', snareTell: '!!', hornTell: '', flurryTell: '!' };   /* the marks (src/marks.js): a yellow ! a blade or a shield answers, a red !! you get out of */
/* (each move says its name as it winds up - literal number() calls, so src/hint-lines.js routes them: tools/hint-shown.mjs) */
const GUARDS = new Set(['walk', 'recover', 'stand']);
export const hmOpen = e => !!e && (e.mode === 'open' || e.mode === 'caught') && (e.open || 0) > 0;

export function makeHuntmaster(ctx) {
  const TS = ctx.TS, H = {}; let F = null;
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.huntmaster ? ctx.L.arena : null);
  const R = Math.round;
  H.on = () => !!A();
  H.owns = e => e.t === 'huntmaster';
  H.fight = () => F;
  H.clear = () => { if (ctx.snares) ctx.snares.clearBoss(); F = null; };
  const live = () => F && F.e && F.e.alive ? F.e : null;
  const nearest = e => ctx.players.filter(p => !p.dead).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || ctx.hero();
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    F = { A: Ar, ph: 1, cyc: 0, i: 0, list: CYCLE[1][0].slice(), arrows: [], pools: [], nets: [], adds: [], weak: { 1: false, 2: false, 3: false }, leapUsed: false, rollUsed: false, horned: {}, perchT: 0, faceT: 0, aimId: 0, said: {}, hurt: {}, sinceOpen: 99,
      perches: (Ar.perches || []).map(([x0, x1, row]) => ({ x0: x0 * TS + 8, x1: (x1 + 1) * TS - 8, y: row * TS })),
      n: { shots: 0, gold: 0, red: 0, back: 0, breaks: 0, staggers: 0, longStag: 0, podStag: 0, glanced: 0, caught: 0, opens: 0, capped: 0, flurries: 0, leaps: 0, hoistShots: 0, turned: 0, cycles: 0, redStruck: 0,
        nets: 0, netted: 0, netRolled: 0, heavy: 0, snares: 0, trapsSet: 0, horns: 0, adds: 0, rolls: 0, wardHits: 0, guardHits: 0 } };
    const e = { ...base, t: 'huntmaster', w: HM.w, h: HM.h, hp: ctx.EHP.huntmaster, maxHp: ctx.EHP.huntmaster, noGrav: true, markH: HM.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, ward: 0, phase: 1, perch: -1, vy: 0 };
    F.e = e; return e; };
  const set = (e, m, t) => { e.mode = m; e.modeT = t; };
  const tell = (e, m, t) => { set(e, m, t); const mk = HM_MODES[m]; if (mk) { ctx.number(e.x, e.y - HM.markH, mk, mk === '!' ? '#ffd36b' : '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(mk !== '!'); }
    const y = e.y - HM.markH - 12; if (m === 'netTell') ctx.number(e.x, y, 'HIS NET: ROLL THROUGH IT', '#e8dcc0'); else if (m === 'heavyTell') ctx.number(e.x, y, 'THE HEAVY ARROW', '#ff6b6b'); else if (m === 'snareTell') ctx.number(e.x, y, 'HE SETS HIS SNARES', '#ff6b6b'); else if (m === 'hornTell') ctx.number(e.x, y, 'THE HUNTING HORN', '#ff9a5c'); else if (m === 'flurryTell') ctx.number(e.x, y, 'HIS KNIFE', '#ffd36b');
    if (m === 'splitTell' && once('red')) ctx.number(e.x, y - 12, 'RED ARROWS ARE POISON: DODGE THEM, NEVER STRIKE', '#ff6b6b'); };
  const floorY = () => F.A.floor;
  const groundY = e => e.perch >= 0 ? F.perches[e.perch].y : floorY();
  const clampX = (e, x) => e.perch >= 0 ? Math.max(F.perches[e.perch].x0, Math.min(F.perches[e.perch].x1, x)) : Math.max(F.A.x0 + 14, Math.min(F.A.x1 - 14, x));
  const hurtHero = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); F.hurt[name] = (F.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); };
  const once = k => { if (F.said[k]) return false; F.said[k] = 1; return true; };   /* a line said once a fight (every line is a literal in a number() call: src/hint-lines.js routes them) */
  const trapsUp = () => ctx.snares ? ctx.snares.read().jaws.filter(j => j.boss && j.state !== 'sprung').length : 0;

  /* THE NEXT MOVE: off the cycle; rushed, the knife flurry; a leap at most once a cycle; the horn once a phase */
  function next(e) {
    const P = nearest(e), ad = Math.abs(P.x - e.x), dy = Math.abs(P.y - e.y);
    e.face = Math.sign(P.x - e.x) || e.face;
    if (ad < HM.flurryAt && dy < 26) { F.n.flurries++; return tell(e, 'flurryTell', HM.flurryTell); }
    if (F.i >= F.list.length) { F.cyc++; F.n.cycles++; const L2 = CYCLE[F.ph]; F.list = L2[F.cyc % L2.length].slice(); F.i = 0; F.leapUsed = false; F.rollUsed = false; }
    let k = F.list[F.i++];
    if (k === 'leap') { if (F.leapUsed || !F.perches.length) k = 'aim'; else { F.leapUsed = true; return tell(e, 'leapTell', HM.leapTell); } }
    if (k === 'horn') { if (F.horned[F.ph] || !F.perches.length) k = 'aim'; else { F.horned[F.ph] = true; F.n.horns++; ctx.sfx.hornDraw && ctx.sfx.hornDraw(); return tell(e, 'hornTell', HM.hornTell); } }
    if (k === 'snare') { if (!ctx.snares || trapsUp() >= HM.snareMax || e.perch >= 0) k = 'aim'; else { F.n.snares++; return tell(e, 'snareTell', HM.snareTell); } }
    if (k === 'net') { F.n.nets++; return tell(e, 'netTell', HM.netTell); }
    if (k === 'hoist') { const cg = cageOver(P); if (!cg) k = 'aim'; else { F.hoist = cg.id; F.hoistX = cg.x; F.n.hoistShots++; return tell(e, 'hoistTell', HM.hoistTell); } }
    const slow = F.weak[2] ? HM.bracerK : 1;
    if (k === 'volley') return tell(e, 'volleyTell', HM.volleyDraw * slow);
    if (k === 'split') return tell(e, 'splitTell', HM.splitDraw * slow);
    return tell(e, 'aimTell', HM.draw * slow);
  }
  /* the boss cage hanging over a hero (P3's hoist-drop shot), from the Rootway's hands */
  const cageOver = P => { const hs = ctx.rw ? ctx.rw.bossHoists() : []; let best = null; for (const h of hs) if (h.up && Math.abs(h.x - P.x) < 72 && (!best || Math.abs(h.x - P.x) < Math.abs(best.x - P.x))) best = h; return best; };
  const after = e => set(e, 'recover', HM.gap[F.ph - 1]);
  /* AN ARROW: gold (struck back flies home), red (poisoned: a blade does not turn it), heavy (the net's punish: nothing turns it) */
  function loose(e, kind, ang, aimAt) { const sx = e.x + (e.face || 1) * 8, sy = e.y - 18, v = kind === 'red' ? HM.redV : kind === 'heavy' ? HM.heavyV : HM.arrowV;
    const a0 = Math.atan2(aimAt.y - sy, aimAt.x - sx), a = a0 + ang;
    F.arrows.push({ id: ++F.aimId, kind, x: sx, y: sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 2.2, back: false, said: false }); F.n.shots++; if (kind === 'red') F.n.red++; else if (kind === 'gold') F.n.gold++; else F.n.heavy++; }
  function shoot(e, what) { const P = nearest(e), at = { x: P.x, y: P.y - 10 };
    ctx.sfx.bow ? ctx.sfx.bow() : ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh();
    if (what === 'aim') loose(e, 'gold', 0, at);
    else if (what === 'volley') { const n = F.weak[1] ? 2 : 3; for (let k = 0; k < n; k++) loose(e, 'gold', (k - (n - 1) / 2) * HM.fan, at); }
    else if (what === 'split') { loose(e, 'gold', 0, at); loose(e, 'red', -HM.fan * 1.3, at); loose(e, 'red', HM.fan * 1.3, at); }
    else if (what === 'heavy') loose(e, 'heavy', 0, at); }
  /* THE NET: lobbed at you, slow, wide - a roll's frames take you through it */
  function throwNet(e) { const P = nearest(e), sx = e.x + (e.face || 1) * 8, sy = e.y - 20, T = Math.max(0.35, Math.min(0.9, Math.abs(P.x - sx) / HM.netV));
    const vx = (P.x - sx) / T, vy = ((P.y - 12) - sy - 0.5 * HM.netG * T * T) / T;
    F.nets.push({ x: sx, y: sy, vx, vy: Math.max(HM.netLift, Math.min(60, vy)), life: 1.6 }); ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); }
  /* OPEN: still where he stands (B4) - off his perch he drops; the hit cap and the ward follow (B3) */
  function open(e, mode, t, mul, cap) { if (!e.alive) return; set(e, mode, t + 0.05); e.open = t; e.openT0 = t; e.openHits = 0; e.hitCap = cap; e.capLeft = cap * HM.blowRef; e.openMul = mul * (F.weak[3] ? HM.maskMul / HM.openMul : 1); e.ward = 0; e.vy = 0; F.n.opens++; F.sinceOpen = 0;
    if (e.perch >= 0) { e.perch = -1; }   /* (he drops off his perch: the stagger knocks him down to the floor, where you can reach him) */
    ctx.shake(4); ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(e.x, e.y - 18, 16, ['#ffd36b', '#e8dcc0', '#8a6a48'], 80, 0.6); }
  const longStag = (e, how) => { F.n.longStag++; open(e, 'open', HM.stagLong, HM.openMul, HM.hitCap); ctx.number(e.x, e.y - 56, how === 'pod' ? 'THE POD BURSTS IN HIS FACE: HE STAGGERS' : 'HIS OWN ARROW: HE STAGGERS', '#8fd160');
    if (once('cap')) ctx.number(e.x, e.y - 68, 'HE IS OPEN: THREE BLOWS, THEN HE GUARDS', '#ffd36b'); };
  /* A BOSS CAGE LANDED (src/rootway-hands.js): on him, he is CAUGHT */
  H.caught = (id, x, ly) => { const e = live(); if (!e || !F) return false; if (Math.abs(e.x - x) > 22 || Math.abs(e.y - ly) > 20) return false;
    if (e.ward > 0) { ctx.number(e.x, e.y - 50, 'HE GUARDS: THE CAGE GLANCES OFF', '#9aa39a'); return false; }
    if (hmOpen(e)) return false;
    F.n.caught++; selfHurt(e, HM.cageDmg, x); if (e.alive) { open(e, 'caught', HM.caughtT, HM.openMul, HM.hitCap); ctx.number(e.x, e.y - 56, 'CAUGHT IN HIS OWN CAGE: CUT HIM', '#8fd160'); } return true; };
  /* A THROWN SPORE POD (src/hunt-pods.js) bursts on him: the long stagger - in his ward it glances off; open, it is a small blow */
  H.podHit = (e, x) => { if (!F || !e.alive) return 'none';
    if (e.ward > 0) { F.n.glanced++; ctx.sfx.clank && ctx.sfx.clank(); ctx.number(e.x, e.y - 50, 'HE GUARDS: IT GLANCES OFF', '#9aa39a'); return 'warded'; }
    if (hmOpen(e)) return 'open';
    if (e.mode === 'roll' || F.sinceOpen < 0.5) return 'none';
    F.n.podStag++; longStag(e, 'pod'); return 'stagger'; };

  H.update = (e, dt) => {
    if (!F || !e.alive) return; const Ar = F.A, P = nearest(e);
    e.modeT -= dt; e.ward = Math.max(0, (e.ward || 0) - dt); if (e.open > 0) e.open = Math.max(0, e.open - dt); if (!hmOpen(e)) F.sinceOpen += dt;
    stepArrows(e, dt); stepPools(dt); stepNets(e, dt);
    for (const a of F.adds) if (a.alive && (a.hmLife -= dt) <= 0) { a.alive = false; a.hp = 0; ctx.burst(a.x, a.y - 6, 6, ['#5a7a32', '#8a6a48'], 50, 0.4); ctx.number(a.x, a.y - 24, 'HIS BOWS FALL BACK', '#9aa39a'); }   /* (his bows fall back off the perches: the horn is a stretch of the fight, not the rest of it) */
    F.adds = F.adds.filter(a => a.alive);
    /* the phases: by his blood, never in an opening */
    if (!hmOpen(e)) { const k = e.hp / e.maxHp;
      if (F.ph === 1 && k <= HM.p2) { F.ph = 2; e.phase = 2; F.cyc = 0; F.i = 0; F.list = CYCLE[2][0].slice(); ctx.number(e.x, e.y - 60, 'HE SETS HIS SNARES: JUMP THEM, OR THROW A POD ON THEM', '#ff6b6b'); ctx.enrage && ctx.enrage(e); }
      else if (F.ph === 2 && k <= HM.p3) { F.ph = 3; e.phase = 3; F.cyc = 0; F.i = 0; F.list = CYCLE[3][0].slice(); ctx.number(e.x, e.y - 60, 'HE SHOOTS THE HOISTS: WATCH THE CAGE OVER YOU', '#ff6b6b'); ctx.enrage && ctx.enrage(e); } }
    if (e.perch >= 0) F.perchT += dt;   /* his time on a perch runs whatever he does there */
    /* he turns to you a beat late while he guards (go round him, and you have that beat) */
    if (GUARDS.has(e.mode)) { const want = Math.sign(P.x - e.x) || e.face; if (want !== e.face) { F.faceT += dt; if (F.faceT >= HM.turnLag) { e.face = want; F.faceT = 0; } } else F.faceT = 0; }
    /* THE DODGE ROLL (B12): a blade up close while he guards on the floor - he rolls away, once a cycle, never in or right after an opening */
    if (GUARDS.has(e.mode) && e.perch < 0 && !F.rollUsed && !(e.ward > 0) && F.sinceOpen > HM.rollAfter && P && !P.dead && Math.abs(P.x - e.x) < HM.rollAt && Math.abs(P.y - e.y) < 20 && (P.atk >= 0 || P.attacking)) {
      const away = Math.sign(e.x - P.x) || -(e.face || 1); let tx = clampX(e, e.x + away * HM.rollDist); if (Math.abs(tx - e.x) < HM.rollDist * 0.5) tx = clampX(e, e.x - away * HM.rollDist);   /* (against a wall he rolls past you instead: never off the stand) */
      F.rollUsed = true; F.n.rolls++; e.rl = { x0: e.x, x1: tx }; set(e, 'roll', HM.roll); ctx.sfx.dodge && ctx.sfx.dodge(); ctx.dust(e.x, e.y, 6); }
    switch (e.mode) {
      case 'sleep': set(e, 'wake', 1.2); if (once('wake')) ctx.number(e.x, e.y - 60, 'HIS GOLD ARROWS: STRIKE THEM BACK', '#ffd36b'); break;
      case 'wake': if (e.modeT <= 0) { F.list = CYCLE[1][0].slice(); F.i = 0; set(e, 'walk', 0.6); } break;
      case 'walk': case 'stand': { const d = P.x - e.x, ad = Math.abs(d);
        if (e.perch < 0) { /* he keeps his range: back off when you come in, come on when you stand off */
          let want = 0; if (ad < HM.keep[0]) want = -Math.sign(d) * HM.back; else if (ad > HM.keep[1]) want = Math.sign(d) * HM.walk;
          e.x = clampX(e, e.x + want * dt); }
        else if (F.perchT > HM.perchT) { F.perchT = 0; tell(e, 'leapTell', HM.leapTell); e.leapDown = true; break; }   /* (you followed him up: he stays and fights you there - his knife - until his time is up) */
        if (e.modeT <= 0) next(e); break; }
      case 'recover': if (e.modeT <= 0) set(e, 'walk', 0.2); break;
      case 'aimTell': case 'volleyTell': case 'splitTell': case 'heavyTell': e.face = Math.sign(P.x - e.x) || e.face;
        if (e.modeT <= 0) { shoot(e, e.mode.replace('Tell', '')); set(e, 'loose', HM.loose); } break;
      case 'netTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { throwNet(e); set(e, 'loose', HM.loose); } break;
      case 'loose': if (e.modeT <= 0) { if (F.punish) { F.punish = false; tell(e, 'heavyTell', HM.heavyTell); } else after(e); } break;
      case 'hoistTell': e.face = Math.sign(F.hoistX - e.x) || e.face; if (e.modeT <= 0) { if (ctx.rw) ctx.rw.cutHoist(F.hoist); ctx.sfx.bow ? ctx.sfx.bow() : ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); F.hoist = null; set(e, 'loose', HM.loose); } break;
      case 'hornTell': if (e.modeT <= 0) { ctx.sfx.hornBlast && ctx.sfx.hornBlast(); callAdds(e); set(e, 'loose', HM.loose * 2); } break;
      case 'snareTell': if (e.modeT <= 0) { F.snareK = 0; snareHop(e, P); } break;
      case 'snareHop': { const f = e.sh, k = Math.min(1, 1 - e.modeT / HM.snareHop); e.x = f.x0 + (f.x1 - f.x0) * k; e.y = floorY() - Math.sin(k * Math.PI) * 26;
        if (e.modeT <= 0) { e.x = f.x1; e.y = floorY(); if (ctx.snares) { ctx.snares.place(e.x, floorY()); F.n.trapsSet++; } ctx.sfx.clank && ctx.sfx.clank(); ctx.dust(e.x, e.y, 4);
          if (++F.snareK < HM.snareN && trapsUp() < HM.snareMax) snareHop(e, P); else after(e); } break; }
      case 'flurryTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { F.cutK = 0; set(e, 'flurry', HM.flurryCut); } break;
      case 'flurry': { const fx = e.face || 1, fl = e.y; hit(e, fx > 0 ? [e.x - 6, e.x + HM.flurryReach, fl - 24, fl] : [e.x - HM.flurryReach, e.x + 6, fl - 24, fl], HM.flurryDmg, 'HIS KNIFE', 'hf' + F.n.flurries + ':' + F.cutK, true);
        if (e.modeT <= 0) { if (++F.cutK < HM.flurryCuts) { e.x = clampX(e, e.x + fx * HM.flurryStep); ctx.sfx.swish && ctx.sfx.swish(); set(e, 'flurry', HM.flurryCut); } else after(e); } break; }
      case 'roll': { const f = e.rl, k = Math.min(1, 1 - e.modeT / HM.roll); e.x = f.x0 + (f.x1 - f.x0) * (1 - (1 - k) * (1 - k)); if (e.modeT <= 0) { e.x = f.x1; set(e, 'walk', 0.25); ctx.dust(e.x, e.y, 5); } break; }
      case 'leapTell': if (e.modeT <= 0) { /* to the perch farther from you, or back down to the floor */
          let to; if (e.perch >= 0 || e.leapDown) { to = { x: clampX({ perch: -1 }, e.x + (Math.sign(Ar.x0 + (Ar.x1 - Ar.x0) / 2 - e.x) || 1) * 70), y: floorY(), perch: -1 }; }
          else { const pp = F.perches.map((p, i) => ({ i, x: (p.x0 + p.x1) / 2, y: p.y })).sort((a, b) => Math.abs(b.x - P.x) - Math.abs(a.x - P.x))[0]; to = { x: pp.x, y: pp.y, perch: pp.i }; }
          e.leapDown = false; e.lf = { x0: e.x, y0: e.y, x1: to.x, y1: to.y, perch: to.perch, t: 0 }; set(e, 'leap', HM.leapT); F.n.leaps++; ctx.sfx.dodge && ctx.sfx.dodge(); ctx.dust(e.x, e.y, 6); } break;
      case 'leap': { const f = e.lf, k = Math.min(1, 1 - e.modeT / HM.leapT); e.x = f.x0 + (f.x1 - f.x0) * k; e.y = f.y0 + (f.y1 - f.y0) * k - Math.sin(k * Math.PI) * 52; e.face = Math.sign(P.x - e.x) || e.face;
        if (e.modeT <= 0) { e.x = f.x1; e.y = f.y1; e.perch = f.perch; F.perchT = 0; set(e, 'land', HM.landT); ctx.dust(e.x, e.y, 8); ctx.sfx.thud && ctx.sfx.thud();
          if (e.perch >= 0) { F.n.perched = (F.n.perched || 0) + 1; ctx.number(e.x, e.y - 60, 'HIS CAGE HANGS OVER HIM: JUMP AND CUT ITS ROPE', '#8fd160'); } } break; }
      case 'land': if (e.modeT <= 0) set(e, 'walk', 0.4); break;
      case 'open': case 'caught': if (e.y >= groundY(e) - 1) e.vy = 0; if (e.open <= 0) { e.ward = HM.ward; set(e, 'recover', 0.3); ctx.number(e.x, e.y - 50, 'HE GUARDS', '#9aa39a'); } break;
      default: if (e.modeT <= -1) after(e);
    }
    /* standing where he stands (a perch, or the floor); off a perch a cage knocked him from, he falls */
    if (e.mode !== 'leap' && e.mode !== 'snareHop') { if (e.perch >= 0) { const p = F.perches[e.perch]; if (e.x < p.x0 - 10 || e.x > p.x1 + 10) e.perch = -1; }
      const gy = groundY(e); if (e.y < gy - 1) { e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); e.y = Math.min(gy, e.y + e.vy * dt); } else { e.y = gy; e.vy = 0; } }
    e.x = Math.max(Ar.x0 + 12, Math.min(Ar.x1 - 12, e.x));
  };
  /* A SNARE HOP: to a spot by you (never on you: a stride either side), a trap where he lands */
  function snareHop(e, P) { const base = P ? P.x : e.x, offs = [-1, 1, -2, 2], o = offs[F.snareK % offs.length] * HM.snareSpread;
    let tx = clampX({ perch: -1 }, base + o); if (Math.abs(tx - base) < HM.snareSpread * 0.6) tx = clampX({ perch: -1 }, base - o);   /* (against a wall: the other side of you) */
    e.sh = { x0: e.x, x1: tx }; e.face = Math.sign(tx - e.x) || e.face; set(e, 'snareHop', HM.snareHop); }
  /* THE HUNTING HORN: two goblin archers onto the root perches (Daniel's own ask: the add-summon is OK here) */
  function callAdds(e) { if (!ctx.spawn) return; ctx.shake(3);
    const spots = F.perches.map(p => ({ x: Math.round(((p.x0 + p.x1) / 2) / TS), y: Math.round(p.y / TS) - 1 })).slice(0, HM.hornAdds);
    for (const s of spots) { const got = ctx.spawn({ t: 'archer', x: s.x, y: s.y, face: s.x * TS < e.x ? 1 : -1, cnSkin: 'gobscout', perch: true }); for (const a of got) { a.hmAdd = true; a.hmLife = HM.addLife; a.hp = Math.min(a.hp, HM.addHp); a.maxHp = a.hp; a.timer = Math.max(a.timer || 0, 1.6); F.adds.push(a); F.n.adds++; } }
    ctx.number(e.x, e.y - 60, 'THE HORN CALLS HIS BOWS: CUT THEM OFF THE PERCHES', '#ff9a5c'); }
  function hit(e, bx, d, name, key, blockable) { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
    if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return; pp.hmKeys = pp.hmKeys || new Set(); if (pp.hmKeys.has(key)) return; pp.hmKeys.add(key); if (pp.hmKeys.size > 80) pp.hmKeys.clear();
    hurtHero(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !blockable })); }); }
  /* THE NETS in flight: a roll goes through one (its frames), anything else is caught - held, and the heavy arrow comes */
  function stepNets(e, dt) {
    for (const n of F.nets) { n.vy += HM.netG * dt; n.x += n.vx * dt; n.y += n.vy * dt; n.life -= dt;
      if (n.life <= 0 || n.y > F.A.floor + 2 || ctx.solidAt(Math.floor(n.x / TS), Math.floor(n.y / TS))) { n.dead = true; continue; }
      for (const pp of ctx.players) { if (pp.dead || n.dead) continue; const b = ctx.box(pp); if (!ctx.overlap({ l: n.x - HM.netR, r: n.x + HM.netR, t: n.y - HM.netR, b: n.y + HM.netR }, b)) continue;
        if (n.through && n.through.has(pp)) continue;
        ctx.asPlayer(pp, () => { const res = ctx.damagePlayer(n.x, HM.netDmg, { who: e, name: 'HIS NET', unblockable: true, noKnock: true });
          if (res === 'hit') { n.dead = true; F.n.netted++; pp.snare = Math.max(pp.snare || 0, HM.net); pp.vx = 0; ctx.number(pp.x, pp.y - 30, 'NETTED: STRUGGLE FREE', '#c9b27c');
            if (e.alive && !hmOpen(e)) { if (e.mode === 'loose') F.punish = true; else if (GUARDS.has(e.mode)) tell(e, 'heavyTell', HM.heavyTell); } }
          else { (n.through = n.through || new Set()).add(pp); F.n.netRolled++; if (once('netRoll')) ctx.number(pp.x, pp.y - 30, 'THROUGH THE NET', '#8fd160'); } }); }
    }
    F.nets = F.nets.filter(n => !n.dead);
  }
  /* THE ARROWS: in flight, struck back (gold), turned by nothing (red, heavy) */
  function stepArrows(e, dt) {
    const hb = ctx.attackBox(), P0 = ctx.hero();
    for (const a of F.arrows) {
      if (a.back) { const dx = e.x - a.x, dy = (e.y - 16) - a.y, d = Math.hypot(dx, dy) || 1; a.vx = dx / d * HM.backV; a.vy = dy / d * HM.backV; a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
        if (d < 14) { a.dead = true; home(e, a); } if (a.life <= 0) a.dead = true; continue; }
      /* a blade (or the warden's sweep) that meets it */
      const box = { l: a.x - HM.reflectR, r: a.x + HM.reflectR, t: a.y - HM.reflectR, b: a.y + HM.reflectR };
      const sweep = P0 && !P0.dead && (P0.deflectT || 0) > 0 && Math.abs(a.x - P0.x) < 22 && Math.abs(a.y - (P0.y - 10)) < 20;
      const struck = hb && ctx.overlap(hb, box) && Math.abs(a.x - P0.x) < HM.strikeR && Math.abs(a.y - (P0.y - 12)) < 26;   /* (struck back CLOSE IN - an arrow is met at arm's length, not at a spear's: every hero's window the same width) */
      if (struck || sweep) {
        if (a.kind === 'gold') { a.back = true; a.soft = !struck; a.life = 1.6; F.n.back++; if (a.soft) F.n.softBack = (F.n.softBack || 0) + 1; ctx.sfx.parry && ctx.sfx.parry(); ctx.sparks(a.x, a.y, P0.face || 1, 6); if (once('back')) ctx.number(a.x, a.y - 20, 'STRUCK BACK: IT FLIES HOME', '#8fd160'); continue; }
        if (!a.said) { a.said = true; F.n.redStruck++; ctx.number(a.x, a.y - 20, 'POISON: DODGE IT', '#ff6b6b'); } }
      a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
      if (ctx.solidAt(Math.floor(a.x / TS), Math.floor(a.y / TS)) || a.y > F.A.floor + 4) { a.dead = true; if (a.kind === 'red') poolAt(a.x); continue; }
      if (a.life <= 0) { a.dead = true; continue; }
      for (const pp of ctx.players) { if (pp.dead || a.dead) continue; if (!ctx.overlap({ l: a.x - 3, r: a.x + 3, t: a.y - 3, b: a.y + 3 }, ctx.box(pp))) continue;
        a.dead = true; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (a.kind === 'gold') hurtHero('HIS ARROW', () => ctx.damagePlayer(a.x - a.vx * 0.05, HM.arrowDmg, { who: e, name: 'HIS ARROW' }));
          else if (a.kind === 'heavy') hurtHero('THE HEAVY ARROW', () => ctx.damagePlayer(a.x - a.vx * 0.05, HM.heavyDmg, { who: e, name: 'THE HEAVY ARROW', unblockable: true }));
          else { const h0 = P.hp; hurtHero('THE RED ARROW', () => ctx.damagePlayer(a.x - a.vx * 0.05, HM.redDmg, { who: e, name: 'THE RED ARROW', unblockable: true })); if (P.hp < h0) { pp.hmPoison = HM.poisonFor; pp.hmPoisonT = HM.poisonEvery; if (once('poisoned')) ctx.number(P.x, P.y - 30, 'THE POISON IS IN YOU', '#9ad85a'); } } }); }
    }
    F.arrows = F.arrows.filter(a => !a.dead);
    /* poison on a hero: a tick at a time */
    for (const pp of ctx.players) { if (!(pp.hmPoison > 0)) continue; if (pp.dead) { pp.hmPoison = 0; continue; } pp.hmPoison -= dt; pp.hmPoisonT -= dt;
      if (pp.hmPoisonT <= 0) { pp.hmPoisonT = HM.poisonEvery; ctx.asPlayer(pp, () => hurtHero('POISON', () => ctx.damagePlayer(pp.x, HM.poisonTick, { who: e, name: 'POISON', unblockable: true, noKnock: true }))); } }
  }
  /* A GOLD ARROW COMES HOME: the long stagger (and the phase's weak point breaks the first time); a parry's soft one only a short stagger; in his ward it glances off */
  function home(e, a) {
    if (!e.alive) return;
    if (e.ward > 0) { F.n.glanced++; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x, e.y - 18, 1, 4); ctx.number(e.x, e.y - 50, 'HE GUARDS: IT GLANCES OFF', '#9aa39a'); return; }
    if (hmOpen(e)) { selfHurt(e, HM.backDmg, a.x); return; }
    const ph = F.ph; selfHurt(e, HM.backDmg, a.x); if (!e.alive) return;
    /* a PARRY - the warden's sweep - turns his arrow home but not hard enough: a short stagger. A BLADE that STRIKES it is the long one */
    if (a.soft) { F.n.staggers++; open(e, 'open', HM.stagT, HM.openMul, HM.softCap); if (once('soft')) ctx.number(e.x, e.y - 56, 'A PARRY ONLY STAGGERS HIM: STRIKE IT', '#ffd36b'); return; }
    if (!F.weak[ph]) { F.weak[ph] = true; F.n.breaks++;
      if (ph === 1) ctx.number(e.x, e.y - 68, 'THE QUIVER STRAP SNAPS: HE IS OPEN', '#8fd160'); else if (ph === 2) ctx.number(e.x, e.y - 68, 'THE BRACER BREAKS: HE IS OPEN', '#8fd160'); else ctx.number(e.x, e.y - 68, 'THE MASK BREAKS: HE IS OPEN', '#8fd160'); }
    F.n.staggers++; longStag(e, 'arrow');
  }
  /* what his own gear does to him (his arrow come home, his cage) lands whole: his guard is for blades */
  function selfHurt(e, d, x) { F.self = true; try { ctx.hurt(e, d, x); } finally { F.self = false; } }
  function poolAt(x) { x = Math.max(F.A.x0 + 10, Math.min(F.A.x1 - 10, x)); F.pools.push({ x, t: HM.poisonT, tick: 0 }); }
  function stepPools(dt) { const e = live(); for (const q of F.pools) { q.t -= dt; q.tick -= dt;
      for (const pp of ctx.players) if (!pp.dead && Math.abs(pp.x - q.x) < HM.poisonR && Math.abs(pp.y - F.A.floor) < 6 && q.tick <= 0) { q.tick = HM.poisonEvery; ctx.asPlayer(pp, () => hurtHero('POISON', () => ctx.damagePlayer(q.x, HM.poisonTick, { who: e, name: 'POISON', unblockable: true, noKnock: true }))); } }
    F.pools = F.pools.filter(q => q.t > 0); }

  /* A BLOW ON HIM: whole, except a blow from his FRONT at his height while he guards (B11/B15: x HM.guardMul, GO ROUND, or from the air), his ward x HM.wardMul (B3/B15);
     open, the first HM.hitCap blows pay x openMul and the next one ends it (the hit cap) */
  H.take = (e, dmg, fromX, plunge) => { if (!F) return dmg; const P = ctx.hero();
    if (F.self) return dmg;
    if (hmOpen(e)) { F.n.openDmg = (F.n.openDmg || 0) + dmg; F.n.openBlows = (F.n.openBlows || 0) + 1; e.openHits = (e.openHits || 0) + 1; const left = e.capLeft ?? (e.hitCap || HM.hitCap) * HM.blowRef, use = Math.min(dmg, Math.max(0, left)), d = use * (e.openMul || HM.openMul); e.capLeft = left - dmg;
      if (e.capLeft <= 0.01 || e.openHits >= HM.maxBlows) { e.open = 0; F.n.capped++; }   /* (THE HIT CAP is THREE BLOWS' WORTH (hitCap x blowRef of a blow): a heavy spear fills it in two and a bit, a quick sword in three, a light flame in four (never more than maxBlows) - the blow that fills it lands what is left, and he is up out of it; the ward follows) */
      return d; }
    if (e.ward > 0) { F.n.turned++; F.n.wardHits++; ctx.turned && ctx.turned(e, fromX, 'HE GUARDS'); return Math.max(1, Math.round(dmg * HM.wardMul)); }
    const frontal = (e.face || 1) * (fromX - e.x) > -2, air = !!plunge || (P && !P.ground) || (P && P.y < e.y - 14);
    if (GUARDS.has(e.mode) && frontal && !air) { F.n.turned++; F.n.guardHits++; ctx.turned && ctx.turned(e, fromX, 'GO ROUND'); if (once('round')) ctx.number(e.x, e.y - 60, 'HE GUARDS HIS FRONT: GO ROUND, OR FROM ABOVE', '#ffd36b'); return Math.max(1, Math.round(dmg * HM.guardMul)); }
    return dmg; };
  H.barName = e => 'THE GOBLIN HUNTMASTER' + (e.mode === 'caught' ? '  CAUGHT' : hmOpen(e) ? '  OPEN' : e.ward > 0 ? '  GUARDING' : '');
  H.end = () => { if (F) { F.arrows = []; F.pools = []; F.nets = []; for (const a of F.adds) if (a.alive) { a.alive = false; a.hp = 0; } F.adds = []; } if (ctx.snares) ctx.snares.clearBoss(); for (const pp of ctx.players) pp.hmPoison = 0; };
  H.read = () => F && { ph: F.ph, weak: { ...F.weak }, n: { ...F.n }, hurt: { ...F.hurt }, arrows: F.arrows.map(a => ({ id: a.id, kind: a.kind, x: a.x, y: a.y, vx: a.vx, vy: a.vy, back: a.back })), pools: F.pools.map(q => ({ x: q.x, t: q.t })),
    nets: F.nets.map(n => ({ x: n.x, y: n.y, vx: n.vx, vy: n.vy })), traps: ctx.snares ? ctx.snares.read().jaws.filter(j => j.boss) : [], adds: F.adds.filter(a => a.alive).map(a => ({ x: a.x, y: a.y, hp: a.hp })),
    hoist: F.hoist || null, hoistX: F.hoistX, perches: F.perches, hits: F.e ? F.e.openHits || 0 : 0, hitCap: F.e ? F.e.hitCap || HM.hitCap : HM.hitCap, capLeft: F.e ? F.e.capLeft : 0, spent: !!F.e && hmOpen(F.e) && (F.e.capLeft <= 0.01 || (F.e.openHits || 0) >= HM.maxBlows), rollUsed: F.rollUsed, sinceOpen: F.sinceOpen };

  /* ---------- DRAWING (src/redraw/rootway_art.js paintHuntmaster draws him; the new moves borrow its poses until the art pass - the net, the horn and the traps drawn here) ---------- */
  const POSE = { netTell: 'aimTell', heavyTell: 'aimTell', hornTell: 'aimTell', snareTell: 'leapTell', snareHop: 'leap', flurryTell: 'slashTell', flurry: 'slash', roll: 'leap', sleep: 'land' };
  H.drawBoss = (g, e, cx, cy, time) => {
    if (!F) return; const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, m = e.mode, open = hmOpen(e);
    const by = y - 24, dk = m === 'aimTell' ? HM.draw : m === 'volleyTell' ? HM.volleyDraw : m === 'splitTell' ? HM.splitDraw : m === 'heavyTell' ? HM.heavyTell : m === 'netTell' ? HM.netTell : m === 'hornTell' ? HM.hornTell : HM.hoistTell;
    RWA.paintHuntmaster(g, { x, y, f, mode: POSE[m] || m, t: time, weak: F.weak, open, perch: e.perch, hurt: e.flash > 0, draw: Math.min(1, 1 - Math.max(0, e.modeT) / dk) });
    if (m === 'netTell') { /* the NET in his off hand, swung: a pale coil of rope with its weights */ const sw = R(Math.sin(time * 14) * 3); g.fillStyle = '#6a5a3a'; g.fillRect(x - f * 10 - 5 + sw, y - 30, 10, 8); g.fillStyle = '#e8dcc0'; for (let k = 0; k < 10; k += 3) g.fillRect(x - f * 10 - 5 + sw + k, y - 29, 1, 6); g.fillStyle = '#8a8490'; g.fillRect(x - f * 10 - 6 + sw, y - 22, 2, 2); g.fillRect(x - f * 10 + 4 + sw, y - 22, 2, 2); }
    if (m === 'hornTell') { /* THE HUNTING HORN to his mouth: a curled horn, and the breath rings when it sounds */ g.fillStyle = '#e8dcc0'; g.fillRect(x + f * 4 - (f < 0 ? 9 : 0), y - 24, 9, 3); g.fillStyle = '#b8a888'; g.fillRect(x + f * 12 - (f < 0 ? 4 : 0), y - 27, 4, 7);
      const k = 1 - Math.max(0, e.modeT) / HM.hornTell; g.globalAlpha = 0.5 * k; g.strokeStyle = '#ff9a5c'; g.lineWidth = 1; g.beginPath(); g.arc(x + f * 16, y - 24, 6 + 10 * k, -1, 1); g.stroke(); g.globalAlpha = 1; }
    if (m === 'flurryTell' && Math.floor(time * 12) % 2) { g.fillStyle = '#ffd36b'; g.fillRect(x + f * 8 - 1, y - 28, 2, 2); }   /* the knife's glint before the flurry */
    if (m === 'snareTell') { g.fillStyle = '#9a929c'; g.fillRect(x - 4, y - 14, 8, 3); g.fillStyle = '#ff6b6b'; if (Math.floor(time * 12) % 2) g.fillRect(x - 1, y - 16, 2, 2); }   /* a jaw trap in his hands */
    /* OPEN: the gold ring and its timer (B10), and the blows left in it (pips); CAUGHT: the cage's bars over him; THE WARD: a pale ring */
    if (open) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.45 + 0.35 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, by + 6, 20, 0, 7); g.stroke(); g.globalAlpha = 1;
      const kk = Math.max(0, e.open / (e.openT0 || HM.stagLong)); g.fillStyle = '#1b1626'; g.fillRect(x - 16, by - 20, 32, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 16, by - 20, R(32 * kk), 3);
      const cap = e.hitCap || HM.hitCap, left = Math.max(0, (e.capLeft ?? cap * HM.blowRef) / HM.blowRef); for (let i = 0; i < cap; i++) { const f = Math.max(0, Math.min(1, left - i)); g.fillStyle = '#3a3438'; g.fillRect(x - cap * 3 + i * 6 + 1, by - 25, 4, 3); if (f > 0) { g.fillStyle = '#ffd36b'; g.fillRect(x - cap * 3 + i * 6 + 1, by - 25, Math.max(1, Math.round(4 * f)), 3); } } }   /* (the pips: three blows' worth, each emptying as the blows land) */
    if (m === 'caught') { /* THE CAGE'S BARS: bound timber with iron straps, tied at the top, over him */
      for (let k = -2; k <= 2; k++) { g.fillStyle = '#5a3c26'; g.fillRect(x + k * 7 - 1, y - 34, 4, 34); g.fillStyle = '#a07448'; g.fillRect(x + k * 7 - 1, y - 34, 1, 34); g.fillStyle = '#3a2618'; g.fillRect(x + k * 7 + 2, y - 34, 1, 34); }
      g.fillStyle = '#3a3438'; g.fillRect(x - 17, y - 36, 34, 3); g.fillRect(x - 17, y - 3, 34, 3); g.fillRect(x - 17, y - 20, 34, 2); g.fillStyle = '#8a8490'; g.fillRect(x - 17, y - 36, 34, 1); g.fillRect(x - 17, y - 3, 34, 1);
      g.fillStyle = '#cdb88a'; for (const k of [-2, 0, 2]) g.fillRect(x + k * 7 - 2, y - 21, 6, 2); }
    if (e.ward > 0) { const k = 0.5 + 0.5 * Math.sin(time * 12); g.globalAlpha = 0.25 + 0.3 * k; g.strokeStyle = '#d8e2ee'; g.lineWidth = 1; g.beginPath(); g.arc(x, by + 6, 22, 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (m === 'leapTell') { g.fillStyle = '#ffd36b'; g.fillRect(x - 6, y + 1, 12, 1); }
    if (m === 'roll') { g.globalAlpha = 0.35; g.fillStyle = '#c9b27c'; g.fillRect(x - 10, y - 3, 20, 3); g.globalAlpha = 1; }
  };
  /* his arrows, his nets, the poisoned floor, the hoist-drop shot's shadow, the struck-back arrow's trail */
  H.drawOver = (g, cx, cy, time) => {
    if (!F) return; const e = live(), fl = R(F.A.floor - cy);
    for (const q of F.pools) { const x = R(q.x - cx), k = Math.min(1, q.t), r = HM.poisonR;   /* THE POISONED FLOOR: a bubbling pool of the red arrow's sap - dark green, a lit skin, bubbles that rise and pop, a pale rim (never the gold's colour) */
      g.globalAlpha = 0.8 * k; g.fillStyle = '#1e4a1a'; g.fillRect(x - r - 1, fl - 3, r * 2 + 2, 3); g.fillStyle = '#3f8a2a'; g.fillRect(x - r, fl - 3, r * 2, 2); g.fillStyle = '#7ac84a'; g.fillRect(x - r + 2, fl - 3, r * 2 - 4, 1); g.fillStyle = '#c8f08a'; for (let i = -r + 4; i < r - 2; i += 9) g.fillRect(x + i + R(Math.sin(time * 3 + i) * 1.5), fl - 3, 3, 1);
      for (let i = -r + 4; i < r - 3; i += 6) { const ph = (time * 1.6 + i * 0.37) % 1, by = fl - 3 - R(ph * 7); g.globalAlpha = 0.85 * k * (1 - ph * ph); g.fillStyle = '#d8ffa8'; g.fillRect(x + i, by, 2, 2); g.fillStyle = '#4a9a2a'; g.fillRect(x + i + 1, by + 1, 1, 1); }
      g.globalAlpha = 0.5 * k; g.fillStyle = '#e8ffd0'; g.fillRect(x - r - 2, fl - 2, 2, 2); g.fillRect(x + r, fl - 2, 2, 2); g.globalAlpha = 1; }
    if (e && e.mode === 'hoistTell' && F.hoistX != null) { const x = R(F.hoistX - cx), k = Math.max(0, 1 - e.modeT / HM.hoistTell); g.globalAlpha = 0.2 + 0.4 * k; g.fillStyle = '#1a1210'; g.fillRect(x - TS, fl - 3, 2 * TS, 3); g.globalAlpha = 1;
      if (Math.floor(time * 12) % 2) { g.fillStyle = '#ff6b6b'; g.fillRect(x - TS, fl - 4, 2 * TS, 1); } }
    for (const n of F.nets) { /* HIS NET in the air: a spread square of pale rope, weighted at the corners, spinning */ const x = R(n.x - cx), y = R(n.y - cy), r = HM.netR, s = Math.sin(time * 9) * 0.3;
      g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.globalAlpha = 0.9; for (let k = -r; k <= r; k += 5) { g.beginPath(); g.moveTo(x + k, y - r + R(k * s)); g.lineTo(x + k - R(r * s), y + r); g.stroke(); g.beginPath(); g.moveTo(x - r, y + k); g.lineTo(x + r, y + k + R(r * s)); g.stroke(); } g.globalAlpha = 1;
      g.fillStyle = '#8a8490'; for (const [dx, dy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) g.fillRect(x + dx - 1, y + dy - 1, 3, 3); }
    for (const a of F.arrows) { const x = R(a.x - cx), y = R(a.y - cy), d = Math.hypot(a.vx, a.vy) || 1, ux = a.vx / d, uy = a.vy / d;
      g.strokeStyle = a.kind === 'red' ? '#a83a2a' : a.kind === 'heavy' ? '#3a2a20' : '#c9a060'; g.lineWidth = a.kind === 'heavy' ? 2 : 1; g.beginPath(); g.moveTo(x - ux * (a.kind === 'heavy' ? 13 : 9), y - uy * (a.kind === 'heavy' ? 13 : 9)); g.lineTo(x, y); g.stroke(); g.lineWidth = 1;
      if (a.kind === 'red' || a.kind === 'heavy') { /* the RED arrow is BARBED (a 5 px head, two barbs swept back, a dark fletch) - so gold and red read by shape; the HEAVY one is a black-shafted broadhead */
        const px = -uy, py = ux, s = a.kind === 'heavy' ? 4 : 3; g.fillStyle = a.kind === 'heavy' ? '#ff6b6b' : '#ff4a3a'; g.beginPath(); g.moveTo(x + ux * s, y + uy * s); g.lineTo(x - ux * s + px * s, y - uy * s + py * s); g.lineTo(x - ux * 1, y - uy * 1); g.lineTo(x - ux * s - px * s, y - uy * s - py * s); g.closePath(); g.fill();
        g.fillStyle = '#3a1418'; g.fillRect(R(x - ux * 9 + px * 1.5) - 1, R(y - uy * 9 + py * 1.5) - 1, 2, 2); g.fillRect(R(x - ux * 9 - px * 1.5) - 1, R(y - uy * 9 - py * 1.5) - 1, 2, 2); }
      else { /* GOLD: a pale-vaned shaft, a SQUARE glinting head (square on purpose: the red one is barbed) and a star that winks */
        const px = -uy, py = ux; g.fillStyle = '#fff6c8'; g.fillRect(R(x - ux * 9 + px * 1.5) - 1, R(y - uy * 9 + py * 1.5) - 1, 2, 2); g.fillRect(R(x - ux * 9 - px * 1.5) - 1, R(y - uy * 9 - py * 1.5) - 1, 2, 2); g.fillRect(R(x - ux * 7 + px * 1.5) - 1, R(y - uy * 7 + py * 1.5) - 1, 2, 1); g.fillRect(R(x - ux * 7 - px * 1.5) - 1, R(y - uy * 7 - py * 1.5) - 1, 2, 1);
        g.fillStyle = Math.floor(time * 16 + a.id) % 2 ? '#fff6c8' : '#ffd36b'; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = '#8a5a14'; g.fillRect(x + 2, y, 1, 1);
        if (Math.floor(time * 10 + a.id) % 3 === 0) { g.fillStyle = '#ffffff'; g.fillRect(x, y - 3, 1, 7); g.fillRect(x - 3, y, 7, 1); } }
      if (a.kind === 'red') { g.globalAlpha = 0.5; g.fillStyle = '#ff6b6b'; g.fillRect(R(x - ux * 14), R(y - uy * 14), 2, 2); g.fillStyle = '#9ad85a'; g.fillRect(R(x - ux * 5), R(y - uy * 5) + 2, 1, 1); g.globalAlpha = 1; }
      if (a.back) { g.fillStyle = '#e8f4f8'; g.fillRect(R(x - ux * 12), R(y - uy * 12), 2, 1); } }
    for (const pp of ctx.players) if (pp.hmPoison > 0 && !pp.dead) { const x = R(pp.x - cx), y = R(pp.y - cy); g.fillStyle = '#9ad85a'; for (let k = 0; k < 3; k++) g.fillRect(x - 4 + k * 4, y - 22 - R(3 * Math.abs(Math.sin(time * 8 + k))), 2, 2); }
  };
  return H;
}

/* ---------- THE HUMAN-SPEED BOT'S PLAN (src/lab.js, the boss lab) ----------
   What a player reads: his marks a reaction late (some misread), the arrows and nets in the air, the traps on the floor, the shadow under a cage, his ring and
   its pips. v2 ONLY (o.eyes) it STRIKES GOLD ARROWS BACK - faces the arrow and swings as it comes into reach (some let go) - the human key; the legacy bot
   blocks or rolls them. It rolls through a net; struggles out of a hold; jumps a jaw trap in its way; dodges or jumps a red arrow; steps out from under a cage
   he aims at; cuts a perch's rope when he stands under its cage; climbs a bud to follow him; backs off his knife; cuts him from behind or a jump while he guards;
   crosses the stand and cuts hard while he is open (and stops when the pips are spent).
   o = { P: { x, y, face, ground, atk, vy, busy, snare }, e, R (read), A, reach, shield, deflect (the warden), cleats: [{ id, x, up, cx }], buds: [{ x, top }], t, rng, mem, eyes, greed }
   -> { gx, face, atk, jump, block, dodge, why } */
export const PLAN = { react: 0.25, miss: 0.15, missBack: 0.3, missNet: 0.25, missTrap: 0.2 };
export function hmPlan(o) {
  const { P, e, R, A, reach } = o, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, why: '' };
  const mem = o.mem || {}, rng = o.rng || Math.random, t = o.t || 0; mem.roll = mem.roll || new Map(); if (mem.roll.size > 400) mem.roll.clear();
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const lo = A.x0 + 14, hi = A.x1 - 14, clamp = x => Math.max(lo, Math.min(hi, x)), dx = e.x - P.x, ad = Math.abs(dx), toHim = Math.sign(dx) || 1;
  if (mem.seenMode !== e.mode) { mem.seenMode = e.mode; mem.seenAt = t; }
  const seen = o.eyes || t - mem.seenAt >= PLAN.react;
  const sameFloor = Math.abs(e.y - P.y) < 20;
  const R0 = R || { arrows: [] };
  /* HELD (a net, a trap): struggle - every press works it loose */
  if (P.snare > 0) { out.atk = P.atk < 0; out.jump = P.ground && Math.floor(t * 10) % 2 === 0; out.why = 'struggle free'; return out; }
  /* A JAW TRAP in the way: jump it (some walk in) */
  const trapAhead = gx => { if (gx == null || !P.ground) return null; const dir = Math.sign(gx - P.x); if (!dir) return null; return (R0.traps || []).find(j => j.state === 'set' && (j.x - P.x) * dir > 0 && Math.abs(j.x - P.x) < 22 && Math.abs(j.y - P.y) < 6) || null; };
  const withTraps = res => { const j = trapAhead(res.gx); if (j && !roll('t' + Math.round(j.x) + ':' + Math.floor(t / 3), PLAN.missTrap)) { res.jump = true; res.why += ' (over a trap)'; } return res; };
  /* OPEN or CAUGHT: cut him - until the pips are spent */
  if (hmOpen(e)) { if (R0.spent) { out.gx = clamp(e.x - toHim * 60); out.face = toHim; out.why = 'the pips are spent: out'; return withTraps(out); }
    if (!sameFloor && e.y < P.y - 20) { const b = (o.buds || []).sort((a, q) => Math.abs(a.x - e.x) - Math.abs(q.x - e.x))[0]; if (b) { out.gx = b.x; out.why = 'up the bud to him'; if (Math.abs(P.x - b.x) < 6 && P.ground && P.y <= b.top + 2) out.jump = true; return out; } }
    out.gx = clamp(e.x - toHim * Math.max(10, reach * 0.6)); out.face = toHim; out.atk = ad < reach + 10 && P.atk < 0 && Math.abs(e.y - P.y) < 30; out.why = 'cut him: he is open'; return withTraps(out); }
  /* THE ARROWS FROM HIS BOWS (the horn's archers): a shield takes one, the warden sweeps it, anyone else rolls or jumps it (some do not see it) */
  for (const s of o.shots || []) { const rx = s.x - P.x, ry = s.y - (P.y - 8); if (!(rx * s.vx < 0 || Math.abs(rx) < 8) || Math.abs(rx) > 48 || Math.abs(ry) > 30) continue;
    if (roll('a' + s.id, PLAN.miss)) break; out.face = Math.sign(rx) || P.face;
    if (o.shield || (o.deflect && !(P.busy > 0))) { out.block = true; out.why = 'take an arrow from his bows'; return out; }
    if (P.ground) { if (ry < -4 || roll('aj' + s.id, 0.5)) out.dodge = true; else out.jump = true; out.why = 'out of an arrow from his bows'; return out; } }
  /* HIS NET: roll through it as it comes in (some do not) */
  for (const n of R0.nets || []) { const rx = n.x - P.x, ry = n.y - (P.y - 12), come = rx * n.vx < 0 || Math.abs(rx) < 10;
    if (!come || Math.abs(rx) > 70 || Math.abs(ry) > 50) continue;
    if (roll('n' + Math.round(n.vx) + ':' + Math.floor(t), PLAN.missNet)) { out.why = 'misread the net'; break; }
    if (Math.abs(rx) < 34 && P.ground && !(P.busy > 0)) { out.dodge = true; out.gx = clamp(P.x + Math.sign(rx || toHim) * 40); out.why = 'roll through the net'; return out; }
    out.gx = P.x; out.why = 'wait for the net'; return out; }
  /* THE ARROWS */
  for (const a of R0.arrows) { if (a.back) continue; const rx = a.x - P.x, ry = a.y - (P.y - 10), come = rx * a.vx < 0 || Math.abs(rx) < 8;
    if (!come || Math.abs(rx) > 90 || Math.abs(ry) > 40) continue;
    if (a.kind === 'gold' && o.eyes && !roll('b' + a.id, PLAN.missBack)) {   /* (each arrow its own roll: some let go) */ out.face = Math.sign(rx) || P.face; out.gx = P.x;
      const near = Math.hypot(rx, ry) < reach + 6 + Math.hypot(a.vx, a.vy) * 0.07;
      if (near && Math.abs(ry) < 26 && P.atk < 0) out.atk = true;
      else if (Math.abs(rx) < 40 && !(P.atk < 0)) {   /* (mid-swing he cannot meet it - a player takes it on the shield, sweeps it, or rolls it, not his chest) */
        if (o.shield) { out.block = true; out.why = 'block the arrow (mid-swing)'; return out; }
        if (o.deflect && !(P.busy > 0)) { out.block = true; out.why = 'sweep the arrow (mid-swing)'; return out; }
        if (P.ground) { out.dodge = true; out.why = 'roll the arrow (mid-swing)'; return out; } }
      out.why = 'strike his arrow back'; return out; }
    if (a.kind === 'gold' && o.shield && !roll('s' + a.id, PLAN.miss)) { out.block = true; out.face = Math.sign(rx) || P.face; out.why = 'block the arrow'; return out; }
    if (o.deflect && a.kind === 'gold' && !(P.busy > 0) && !roll('w' + a.id, PLAN.missBack)) { out.block = Math.abs(rx) < 40; out.face = Math.sign(rx) || P.face; out.why = 'sweep the arrow'; return out; }
    if (Math.abs(rx) < 46) { if (a.kind !== 'gold' && P.ground && ry > -6 && !roll('j' + a.id, 0.5)) { out.jump = true; out.why = 'jump the red arrow'; return out; } out.dodge = true; out.why = a.kind === 'red' ? 'roll the red arrow' : 'roll the arrow'; return out; } }
  /* THE POISONED FLOOR */
  for (const q of R0.pools || []) if (Math.abs(q.x - P.x) < 22 && P.ground) { out.gx = clamp(P.x + (P.x < q.x ? -40 : 40)); out.why = 'off the poison'; return withTraps(out); }
  /* THE HOIST-DROP SHOT: out from under the cage */
  if (e.mode === 'hoistTell' && seen && R0.hoistX != null && Math.abs(P.x - R0.hoistX) < 40) { out.gx = clamp(R0.hoistX + (P.x < R0.hoistX ? -56 : 56)); if (Math.abs(P.x - R0.hoistX) < 20 && e.modeT < 0.3) out.dodge = true; out.why = 'out from under the cage'; return withTraps(out); }
  /* HIS KNIFE FLURRY: block, sweep, or step back out of it */
  if ((e.mode === 'flurryTell' || e.mode === 'flurry') && seen && ad < 64 && !roll('k' + Math.round(t * 2), PLAN.miss)) { out.face = toHim;
    if (o.deflect && !(P.busy > 0)) { out.block = e.modeT < 0.22 || e.mode === 'flurry'; out.why = 'sweep the knife'; return out; }
    if (o.shield) { out.block = true; out.why = 'block the knife'; return out; } out.gx = clamp(e.x - toHim * 80); if (ad < 52 && (e.mode === 'flurry' || e.modeT < 0.2) && P.ground) out.dodge = true; out.why = 'out of the knife'; return withTraps(out); }
  /* THE HORN'S BOWS on the perches: up the bud and cut them off (a player reads 'CUT THEM OFF THE PERCHES') - unless he is on that perch himself */
  { const ads = (R0.adds || []).filter(a => !(e.y < A.floor - 20 && Math.abs(a.x - e.x) < 70)).sort((a, q) => Math.abs(a.x - P.x) - Math.abs(q.x - P.x)); const a = ads[0];
    if (a) { const up = Math.abs(P.y - a.y) < 20, d = a.x - P.x;
      if (up) { out.gx = clamp(a.x - Math.sign(d || 1) * Math.max(10, reach * 0.6)); out.face = Math.sign(d) || P.face; out.atk = Math.abs(d) < reach + 8 && P.atk < 0; out.why = 'cut his bow off the perch'; return out; }
      const b = (o.buds || []).sort((x, q) => Math.abs(x.x - a.x) - Math.abs(q.x - a.x))[0];
      if (b && P.y > A.floor - 20) { out.gx = b.x; if (Math.abs(P.x - b.x) < 6) out.gx = P.x; if (b.grown && Math.abs(P.x - b.x) < 10 && P.ground) out.jump = true; out.why = 'up the bud to his bow'; return withTraps(out); } } }
  /* HE IS ON A PERCH: cut the rope of the cage over him (the level's verb), else up the bud */
  if (e.y < A.floor - 20 && e.mode !== 'leap' && e.mode !== 'snareHop') { const c = (o.cleats || []).filter(q => q.up && Math.abs(q.x - e.x) < 24)[0];
    if (c && !(e.ward > 0) && Math.abs(P.x - c.cx) < 420) { out.gx = c.cx - 6; out.face = 1; if (Math.abs(P.x - (c.cx - 6)) < 8) { out.face = Math.sign(c.cx - P.x) || 1; if (P.ground) out.jump = true; else if (P.y < A.floor - 18 && P.atk < 0) out.atk = true; } out.why = 'cut the rope over him'; return withTraps(out); }
    const b = (o.buds || []).sort((a, q) => Math.abs(a.x - e.x) - Math.abs(q.x - e.x))[0];
    if (b) { if (P.y < A.floor - 20) { out.gx = clamp(e.x - toHim * 14); out.face = toHim; out.atk = ad < reach + 8 && P.atk < 0 && sameFloor; out.why = 'on his perch: cut him'; return out; }
      out.gx = b.x; if (Math.abs(P.x - b.x) < 6) out.gx = P.x; if (b.grown && Math.abs(P.x - b.x) < 10 && P.ground) out.jump = true; out.why = 'up the bud to his perch'; return withTraps(out); } }
  /* HE GUARDS HIS FRONT: stand off his knife; cut him from a jump over his guard, or from behind when he turns late */
  const guarding = ['walk', 'recover', 'stand'].includes(e.mode) && !(e.ward > 0), standoff = Math.max(50, reach + 22);
  if (e.ward > 0) { out.gx = clamp(e.x - toHim * 70); out.face = toHim; out.why = 'he guards: wait it out'; return withTraps(out); }
  if (!P.ground && P.atk < 0 && ad < reach + 10 && sameFloor && (o.greed || 0) < 3) { out.atk = true; out.face = toHim; out.gx = e.x; out.why = 'cut him from the air'; return out; }
  if (guarding && sameFloor) { const front = (e.face || 1) * (P.x - e.x) > 0;
    if (!front && ad < reach + 10 && P.atk < 0 && (o.greed || 0) < 3) { out.atk = true; out.face = toHim; out.why = 'cut him from behind'; return out; }
    if (front && ad < standoff + 8 && P.ground && (o.greed || 0) < 3 && !roll('jj' + Math.floor(t * 1.2), 0.5)) { out.jump = true; out.gx = e.x + toHim * 6; out.face = toHim; out.why = 'over his guard'; return out; }
    out.gx = clamp(e.x - toHim * standoff); out.face = toHim; out.why = 'stand off his knife'; return withTraps(out); }
  /* HE DRAWS (or throws, or blows): both hands busy, his front is open - in, and cut him (a swing that meets his arrow as it leaves the string sends it home) */
  if (/Tell$/.test(e.mode) && !/^(flurry|leap|hoist|snare)Tell$/.test(e.mode) && sameFloor && seen && ad < reach + 70) { out.gx = clamp(e.x - toHim * Math.max(12, reach - 8)); out.face = toHim;
    if (ad < reach + 8 && P.atk < 0 && (o.greed || 0) < 3) out.atk = true; out.why = 'cut him as he draws'; return withTraps(out); }
  out.gx = clamp(e.x - toHim * standoff); out.face = toHim; out.why = 'close in';
  return withTraps(out);
}
