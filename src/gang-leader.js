// src/gang-leader.js - THE GANG LEADER, THE WELL TOWN's mini-boss in the market's courtyard, the Well Square (claude/welltown3, moved from the Kasbah by claude/welltown-polish; Daniel 2026-10-02: the Bandit
// King "feels like a mini" - so he is one now, and the town's boss is THE CISTERN QUEEN under it). The bandits' captain: two curved swords, a sling of
// oil bottles, a quick man. REWORKED by claude/welltown5 (Daniel played him 10-03: keep throwing his molotovs back - he likes it - but he must be
// VULNERABLE otherwise, burning is just MORE damage, he stays fast, and WATER must matter in the fight):
//   TWO SWORDS     DOUBLE CUT (! !: two quick cuts a shield turns) and CROSS CUT (! then a third, quicker), and THE WHIRL (!!: both blades round
//                  him - step out of it or jump it). Only while a blade is MOVING does the other one guard a frontal blow; between and in his tells he
//                  takes your blows whole
//   QUICK          he walks you down and DASHES in when you stand off (GL.dash) - which is what the water is for
//   THE DODGE      now and then (GL.dodge, rare: GL.dodgeCd), struck from the front as he walks in, he slips back out of the blade - TOLD (a dust
//                  kick, his lean back, 'HE SLIPS THE BLADE: HIS RIPOSTE COMES') - and comes straight back with a RIPOSTE (!!: step or roll out)
//   MOLOTOVS       he lobs a lit oil bottle at you (!: the bottle arcs; where it breaks the floor burns, and the fire CATCHES you - you burn until you
//                  douse yourself: E with water in the skin). STRIKE IT BACK: a blow on the bottle sends it home, and it sets HIM alight
//   BURNING        he beats at the flames and staggers off, open (GL.openT >= 3 s, tools/boss-openings.mjs): a blow lands x GL.openMul (1.5), and one
//                  burning takes no more than GL.capK of him (Daniel's mini rule: a third at most - a fifth here)
//   THE WATER      your POUR (the skin, E) on the courtyard floor leaves a PUDDLE (GL.puddleT s). He runs into it and SLIPS - down GL.slipT s, every blow
//                  whole, and when he is up he reaches for a bottle (slow him, then burn him). But a BURNING man who steps in a puddle is PUT OUT
//                  (a hiss of steam): keep the water away from him while he burns. The well head in the courtyard refills the skin (it glints)
// No charge. A MINI (combat3): he keeps his damage taken outside the opening (no chip), answers greed with the minis' reprisal, and hits x1.3.
// main.js calls makeGangLeaderHands(ctx): spawn, owns, update, take, pourable, frame, barName, drawOver, end, read. The bot's reading is glPlan (src/lab.js).

export const GL = {
  hp: 1500, w: 16, h: 30, markH: 44,                 /* (claude/glhotfix, Daniel 10-03: 2900 -> 1500 - he is a MINI) */
  openMul: 1.5, openT: 3.2, capK: 0.2,   /* (Daniel 10-03: burning x1.5, and the per-burn cap stays - no more than a third of him a burning, a fifth here)
  */
  walk: 70, dash: 225, dashAt: 84, keep: 26, gap: [0.26, 0.2],   /* phase two (half health): quicker between blows */
  dashTell: 0.36, dashMax: 0.55, dashCd: 2.2, dashReach: 30,      /* THE DASH (!!): stood off beyond dashAt he gathers and DASHES in with a cut - roll through it, jump it, or pour in his path */
  cutTell: 0.55, cutT: 0.14, cut2Tell: 0.24, crossTell: 0.2, cutReach: 34, cutStep: 72,   /* (each cut steps in at cutStep px/s: a quick man's cut follows you) */
  whirlTell: 0.62, whirlT: 0.5, whirlR: 40,
  throwTell: 0.5, fly: 0.85, fireT: 3.2, fireR: 18, fireTick: 0.5,
  dodge: 0.18, dodgeT: 0.28, dodgeDist: 64, dodgeCd: 5.0, riposteTell: 0.42, recoverT: 0.35,   /* (claude/welltown5: the dodge is RARE now - it was 75%, and it beat the Warden's shield game) */
  reflectR: 16, back: 340,
  mudSlow: 0.4,                           /* MUD (Daniel 10-03): a poured puddle is mud - he moves x mudSlow in it and will not step into it from dry ground (he stops at its edge) */
  puddleT: 9, puddleR: 22, pourAt: 30, slipT: 1.6,  /* THE WATER: a pour's puddle lasts puddleT s, pourAt px in front of you; a slip downs him slipT s */
  burnT: 2.6, burnTick: 0.5,                        /* his fire CATCHES you: you burn this long unless you douse yourself */
  dmg: { cut: 23, whirl: 33, bottle: 16, fire: 7, riposte: 22, burn: 4, dash: 22 },   /* (claude/sweep3: cut 34, whirl 44, riposte 28, dash 28 until the standard bot - it reads his tells a reaction late - won 2/12 at L31; band 70-75%) */
};
/* EVERY CYCLE CHANGES (k % n); phase two from half health. (claude/welltown5: a bottle in most cycles, not every other blow - a bottle struck home
   is a fifth of him, so the bottles pace the fight; his blades and his dash are the danger between them) */
export const CHAINS = {
  1: [['cut', 'throw', 'whirl'], ['cross', 'cut', 'whirl'], ['cut', 'whirl', 'throw', 'cross']],
  2: [['cross', 'whirl', 'cut', 'throw'], ['cut', 'cross', 'whirl'], ['whirl', 'cut', 'throw', 'cross']],
};
export const GL_MODES = { cutTell: '!', cut2Tell: '!', crossTell: '!', whirlTell: '!!', throwTell: '!', riposteTell: '!!', dashTell: '!!' };
const PARRY = new Set(['cut', 'cut2', 'cross']);                 /* (only while a blade is moving: claude/welltown5) */
const SLIPPY = new Set(['dash', 'dodge', 'riposte', 'riposteTell', 'burning']);   /* the modes he is moving FAST in: a puddle takes him (or puts him out) - walking he will not step in it, and in it he is mud-slowed (GL.mudSlow) */
export const glOpen = e => !!e && e.mode === 'burning' && (e.open || 0) > 0;

/* THE MARKET COURTYARD (claude/welltown-polish, Daniel 10-02: he moved from the Kasbah to the market). sx: its first column; R: its floor row. Forty columns,
   his wall at sx-1 (shut behind you) and a solid wall at sx+40 (the fallen street's rubble stands against it: no gate to lift), the great well's head
   (the courtyard's well, wherever the level put it) and a stone trough each side (a row up, boards). The way on past him - THE GREAT WELL's windlass - is fouled
   until he falls (src/well-town-hands.js), so the wall that opens behind you when he dies lets you back to the stair and the well is yours.
   No wall of his own reaches the Great Well's lip: the bucket stands at the floor's level over the shaft, a platform to him as to you. */
export const STAGE = { W: 40, door: 6, well: 27, troughs: [[6, 9], [31, 34]], him: 30 };
export function stageGangLeader(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + STAGE.W;
  air(sx, ex - 1, 0, R - 1);
  block(sx - 1, sx - 1, R - 16, R - STAGE.door - 1); block(ex, ex, R - 16, R - 1);
  for (const [a, b] of STAGE.troughs) for (let x = sx + a; x <= sx + b; x++) set(x, R - 1, T.ONEWAY);
  ent('gangleader', sx + STAGE.him, R - 1, { face: -1, mini: true });
  const mini = { x0: sx * TS, x1: ex * TS, floor: R * TS, y0: (R - 16) * TS, y1: (R + 1) * TS, trigger: (sx + 5) * TS, wallL: sx - 1, wallR: ex, gate: sx - 1, boss: 'gangleader',
    name: 'THE GANG LEADER', music: 'banditking', well: (sx + STAGE.well) * TS + 8 };
  return { mini };
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late and misreads some; it strikes a bottle back when it comes in reach (and lets some go); it pours a puddle in
   his path as he comes in (and misses some), cuts him while he is down, between his blows and as he walks in (stopping a blow short of greed), shields
   the cuts, steps out of the whirl and the fire, douses itself when his fire catches it, fills the skin at the well head when it is dry, and cuts hard
   while he burns.
   s = { P: { x, y, face, ground, atk, burn }, e, F, reach, shield, deflect (the warden: block on the beat), sips, t, rng, mem, greed } -> { gx, face, atk, jump, block, dodge, talk, why } */
export const PLAN = { react: 0.25, miss: 0.14, missBottle: 0.3, missPour: 0.35, stand: 22 };
export function glPlan(s) {
  const { P, e, F, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, talk: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0, sips = s.sips || 0; mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 500) { mem.seen.clear(); mem.roll.clear(); }
  const react = s.eyes ? 0 : PLAN.react, miss = s.eyes ? 0 : PLAN.miss;   /* (claude/sweep3) s.eyes: the lab's perception layer (a v2 profile) already sees each tell a reaction late and misreads some - no second delay on top */
  const key = e.mode + F.act, seen = () => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= react; };
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const A = F.A, lo = A.x0 + 12, hi = A.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x)), side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x), toHim = Math.sign(e.x - P.x) || 1;
  /* alight: douse yourself (a quarter-second late) */
  if (P.burn > 0 && sips > 0 && t - (mem.burnSeen ?? (mem.burnSeen = t)) >= PLAN.react) { out.talk = true; out.why = 'douse yourself'; return out; }
  if (!(P.burn > 0)) mem.burnSeen = undefined;
  /* the bottle: strike it back as it comes */
  const b = F.bottles.find(q => !q.back && Math.abs(q.x - P.x) < 60 && Math.abs(q.y - (P.y - 10)) < (s.eyes ? 80 : 40));   /* (v2: a bottle in the air over you is watched from the throw - no blow started at him that would still be out when it comes down) */
  if (b && !roll('b' + b.id, PLAN.missBottle)) { out.face = Math.sign(b.x - P.x) || P.face; const lead = s.eyes ? 0.08 : 0, bx = b.x + (b.vx || 0) * lead, by = b.y + (b.vy || 0) * lead + 260 * lead * lead;   /* (claude/sweep3, v2: a hand swings a beat before the glass arrives, as the blade's edge comes out late in the swing) */
    if (s.eyes && b.vy > 0 && Math.abs(b.x - P.x) < 30 && b.y - (P.y - 10) < -6 && b.y - (P.y - 10) > -40) { out.atk = P.atk < 0; out.up = true; out.why = 'cut the bottle up and back'; return out; }   /* (v2: one falling on you is met with the rising cut, the blow that reaches over your head) */
    if (Math.abs(bx - P.x) < reach + 6 && Math.abs(by - (P.y - 10)) < 22) out.atk = P.atk < 0; out.why = 'strike the bottle back'; return out; }
  const fire = F.fires.find(f => Math.abs(f.x - P.x) < GL.fireR + 6);
  if (glOpen(e)) { out.gx = clamp(e.x - side * (s.tip ? GL.w / 2 + s.tip : Math.max(8, reach * 0.6))); out.face = toHim; out.atk = ad < reach + 12 && P.atk < 0 && e.open > 0.35; out.why = 'cut him: he burns'; return out; }   /* (not the last blow as the flames go out) */
  const m = e.mode;
  if (m === 'slipped') { out.gx = clamp(e.x - toHim * (s.tip ? GL.w / 2 + s.tip : Math.max(8, reach * 0.6))); out.face = toHim; out.atk = ad < reach + 10 && P.atk < 0 && (s.greed || 0) < 3 && e.modeT > 0.2; out.why = 'cut him: he is down'; return out; }
  if (/Tell$/.test(m) && seen() && !roll(key, miss)) {
    if (m === 'riposteTell' && ad < 90) { out.gx = clamp(e.x + side * 100); if (ad < 60) out.dodge = true; out.why = 'off the riposte'; return out; }
    if ((m === 'cutTell' || m === 'cut2Tell' || m === 'crossTell') && ad < 70) { mem.backT = t + 0.9;
      if (s.deflect && s.eyes && P.live > 0.04) { out.face = toHim; out.why = 'hold the deflect'; return out; }   /* (claude/sweep3, v2 only: her sweep is live - keep it turned on him; backing off turned her shaft away from the cut it was swept for) */
      if (s.deflect && !(P.busy > 0)) { out.face = toHim; out.block = e.modeT < 0.22; out.why = 'deflect the cut on the beat'; return out; }   /* THE WARDEN: her shaft turns a yellow blow swept on the beat */
      if (s.shield) { out.block = true; out.face = toHim; out.why = 'block the cut'; return out; } out.gx = clamp(e.x + side * 80); out.why = 'back off the cut'; return out; }
    if (m === 'whirlTell' && ad < GL.whirlR + 30) { out.gx = clamp(e.x + side * (GL.whirlR + 40)); if (s.eyes && ad < GL.whirlR + 8 && e.modeT < 0.3 && P.ground) { out.jump = true; out.why = 'jump the whirl'; return out; } if (ad < GL.whirlR && e.modeT < 0.2) out.dodge = true; out.why = 'out of the whirl'; return out; }   /* (claude/sweep3, v2: still inside it as it comes - over it, as his tell says) */
    if (m === 'throwTell') { /* the bottle comes: wait for it (above) */ }
    if (m === 'dashTell') { const dry = !(F.puddles || []).some(q => Math.sign(q.x - P.x) === toHim && Math.abs(q.x - P.x) < ad);
      if (sips > 0 && dry && P.ground && ad > 40 && !roll('dpour' + F.act, PLAN.missPour)) { out.face = toHim; out.talk = true; out.why = 'pour in the path of his dash'; return out; }
      if (dry) { mem.dashF = F.act; out.why = 'ready for the dash'; } }
  }
  /* the rest of a combo once its first cut was read: keep out of it (or keep the shield up) */
  if ((m === 'cut' || m === 'cut2Tell' || m === 'cut2' || m === 'cross') && ad < 70 && mem.backT > t) { if (s.deflect && s.eyes && P.live > 0.04) { out.face = toHim; out.why = 'hold the deflect'; return out; } if (s.deflect && s.eyes && !(P.busy > 0)) { out.face = toHim; out.block = true; out.why = 'sweep again for his next cut'; return out; } if (s.deflect && !(P.busy > 0)) { out.face = toHim; out.block = m !== 'cut2Tell' || e.modeT < 0.22; out.why = 'deflect the combo'; return out; } if (s.shield) { out.block = true; out.face = toHim; out.why = 'block the combo'; return out; } out.gx = clamp(e.x + side * 90); out.why = 'out of the combo'; return out; }
  if (m === 'dash' && Math.sign(P.x - e.x) === (e.face || 1) && ad < 70 && mem.dashF === F.act && !roll('dmiss' + F.act, miss)) { out.dodge = ad < 46; out.jump = !out.dodge && P.ground; out.gx = clamp(e.x - side * 60); out.why = 'through the dash'; return out; }
  if (m === 'whirl' && ad < GL.whirlR + 12) { out.gx = clamp(e.x + side * (GL.whirlR + 40)); if (s.eyes && P.ground && ad < GL.whirlR + 4) { out.jump = true; out.why = 'jump the whirl'; return out; } out.dodge = ad < GL.whirlR; out.why = 'out of the whirl'; return out; }
  if (fire) { out.gx = clamp(P.x + (P.x < fire.x ? -40 : 40)); out.why = 'out of the fire'; return out; }
  /* THE WATER: he comes at you - pour in his path (once per approach, and not every time) */
  const wet = (F.puddles || []).some(q => Math.sign(q.x - P.x) === toHim && Math.abs(q.x - P.x) < ad + 10);
  if (m === 'walk' && sips > 0 && ad > 44 && ad < 130 && P.ground && !wet && !roll('pour' + F.act, PLAN.missPour)) { out.face = toHim; out.talk = true; out.why = 'pour in his path'; return out; }
  /* MUD ZONING (claude/glhotfix): he will not step into it - hold the line a step beyond the reach of his blades, strike what he sends, cut him if the weapon reaches */
  if (wet && ad > 40 && /^(walk|recover|cut|cut2|cross|cutTell|cut2Tell|crossTell|throwTell|throw|whirlTell)$/.test(m)) { out.gx = clamp(e.x + side * Math.max(52, Math.min(70, reach + 20))); out.face = toHim; out.atk = ad < reach + 4 && P.atk < 0 && (s.greed || 0) < 3 && m !== 'whirlTell' && m !== 'cutTell'; out.why = 'hold the mud line'; return out; }
  /* a dry skin: the well head (it glints), when he is not on you */
  if (sips <= 0 && A.well != null && (ad > 60 || m === 'recover') && !(F.puddles || []).length) { if (Math.abs(P.x - A.well) < 10 && P.ground) { out.talk = true; out.why = 'fill the skin at the well head'; return out; } out.gx = A.well; out.why = 'to the well head'; return out; }
  /* between his blows, and as he walks in: cut him (a blow short of greed), from where his reach is not */
  if ((m === 'recover' || m === 'walk') && ad < reach + 10 && (s.greed || 0) < 3 && P.atk < 0 && !(s.deflect && m === 'walk' && e.modeT < 0.3)) {   /* (the warden keeps her shaft free for the deflect as his gap runs out) */ out.face = toHim; out.atk = true; out.why = m === 'walk' ? 'cut him as he comes' : 'cut him between his blows'; return out; }
  out.gx = clamp(e.x + side * Math.max(PLAN.stand, reach - 4)); out.face = toHim; out.why = 'close in';   /* (a long reach stands off at its tip: the warden's spear outreaches his swords) */
  return out;
}

/* ---------- THE HANDS ---------- */
export function makeGangLeaderHands(ctx) {
  let F = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.mini && ctx.L.mini.boss === 'gangleader' ? ctx.L.mini : null);
  const R = Math.round;
  H.fight = () => F;
  H.owns = e => e.t === 'gangleader';
  H.clear = () => { F = null; };
  const keyed = (pp, key) => { pp.glKeys = pp.glKeys || new Map(); if (pp.glKeys.size > 60) pp.glKeys.clear(); if (pp.glKeys.has(key)) return true; pp.glKeys.set(key, 1); return false; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (F) { F.hurt[name] = (F.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const live = () => ctx.enemies().find(q => q.t === 'gangleader' && q.alive);
  H.spawn = base => { const Ar = A(); F = { A: Ar || { x0: base.x - 300, x1: base.x + 300, floor: base.y }, cycle: 0, step: 0, chain: CHAINS[1][0].slice(), ph: 1, act: 0, bottles: [], fires: [], puddles: [], dodgeCd: 0, openTaken: 0,
      hurt: {}, n: { cycles: 0, opens: 0, reflects: 0, bottles: 0, dodges: 0, ripostes: 0, capped: 0, whirls: 0, cuts: 0, puddles: 0, slips: 0, doused: 0, caught: 0, selfDoused: 0, parried: 0 }, idN: 0, said: {} };
    for (const pp of ctx.players) pp.glBurn = 0;
    return { ...base, t: 'gangleader', w: GL.w, h: GL.h, hp: ctx.EHP.gangleader, maxHp: ctx.EHP.gangleader, mini: true, noGrav: true, markH: GL.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 }; };
  const set = (e, m, t) => { e.mode = m; e.modeT = t; };
  const tell = (e, m, t) => { set(e, m, t); const Pn = nearest(e); if (m !== 'whirlTell') e.face = Math.sign(Pn.x - e.x) || e.face;   /* he squares up to you at every told blow */ const mk = GL_MODES[m]; if (mk) { ctx.number(e.x, e.y - GL.markH, mk, mk === '!' ? '#ffd36b' : '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(mk !== '!'); } };
  const hit = (e, bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
    if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key)) return; const h0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }));
    if (o.ignite && P.hp < h0 && !P.dead && !(pp.glBurn > 0)) { pp.glBurn = GL.burnT; pp.glBurnTick = GL.burnTick; F.n.caught++;
      if (!F.said.caught) { F.said.caught = 1; ctx.number(P.x, P.y - 30, 'YOU CATCH FIRE: E DOUSES YOU', '#ff9a5c'); } } }); };
  function next(e) {
    if (F.step >= F.chain.length) { F.cycle++; F.n.cycles++; const set2 = CHAINS[F.ph]; F.chain = set2[F.cycle % set2.length].slice(); F.step = 0; }
    const k = F.chain[F.step++]; F.act++; F.cur = { k, id: F.act }; const P = nearest(e); e.face = Math.sign(P.x - e.x) || e.face;
    if (k === 'cut') return tell(e, 'cutTell', GL.cutTell);
    if (k === 'cross') return tell(e, 'crossTell', GL.cutTell * 0.85);
    if (k === 'whirl') { F.n.whirls++; return tell(e, 'whirlTell', GL.whirlTell); }
    if (k === 'throw') { F.cur.x = P.x; return tell(e, 'throwTell', GL.throwTell); }
  }
  const nearest = e => ctx.players.filter(p => !p.dead).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || ctx.hero();
  const after = e => { F.gapNext = GL.gap[F.ph - 1]; set(e, 'recover', GL.recoverT + (F.cur && F.cur.k === 'whirl' ? 0.25 : 0)); };
  /* THE WATER UNDER HIM: a puddle where he stands, on his feet and moving - he slips; burning - it puts him out (and the puddle is spent either way) */
  function wetFeet(e) {
    if (!SLIPPY.has(e.mode)) return; const q = F.puddles.find(p => Math.abs(p.x - e.x) < GL.puddleR + 2); if (!q) return;
    if (e.mode === 'walk' && Math.abs(nearest(e).x - e.x) <= GL.keep + 1 && !e.dashing) return;   /* (standing at you, not moving: a puddle at his feet waits for him to move) */
    q.dead = true; ctx.burst(q.x, F.A.floor - 3, 12, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], 60, 0.5); ctx.sfx.splash && ctx.sfx.splash();
    if (glOpen(e)) { e.open = 0; F.openTaken = 0; F.n.doused++; F.gapNext = 0.2; set(e, 'recover', 0.45); ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.splash && ctx.sfx.splash();
      ctx.burst(e.x, e.y - 18, 16, ['#e8f4f8', '#c8d0d8', '#9aa39a'], 50, 0.9); ctx.number(e.x, e.y - 56, 'THE WATER PUTS HIM OUT', '#9aa39a'); return; }
    F.n.slips++; F.cur = { k: 'slip', id: ++F.act }; e.dashing = false; set(e, 'slipped', GL.slipT); ctx.shake(3); ctx.dust(e.x, e.y, 8);
    if (F.n.slips === 1) ctx.number(e.x, e.y - 56, 'HE SLIPS: CUT HIM', '#8fd160'); else ctx.number(e.x, e.y - 56, 'HE SLIPS', '#8fd160');
  }
  /* MUD: a puddle under x. A step from dry ground into it is refused (he stops at its edge); inside it he is slowed. */
  const mudAt = x => F.puddles.some(q => Math.abs(q.x - x) < GL.puddleR + 2);
  const mudStep = (e, dx) => { if (!dx) return 0; if (mudAt(e.x)) return dx * GL.mudSlow; return mudAt(e.x + dx + Math.sign(dx) * 2) ? 0 : dx; };
  H.update = (e, dt) => {
    if (!F || !e.alive) return; const Ar = F.A, P = nearest(e), fl = Ar.floor; e.y = fl;
    if (e.mode === 'sleep') { set(e, 'wake', 1.4); for (const pp of ctx.players) if (pp.skin) pp.skin.sips = pp.skin.max || 3; }   /* (the square's door checkpoint is a step behind you and refills the skin: he is fought with water, as the Queen is) */
    e.modeT -= dt; F.dodgeCd = Math.max(0, F.dodgeCd - dt); F.dashCd = Math.max(0, (F.dashCd || 0) - dt); if (e.open > 0) e.open = Math.max(0, e.open - dt);
    const fx = e.face || 1, key = 'gl' + (F.cur ? F.cur.id : 0), front = (r, top = 30) => fx > 0 ? [e.x - 8, e.x + r, fl - top, fl] : [e.x - r, e.x + 8, fl - top, fl];
    if (F.ph === 1 && e.hp <= e.maxHp / 2) { F.ph = 2; ctx.number(e.x, e.y - 50, 'HE GOES FASTER: WATCH HIS BOTTLES', '#ff9a5c'); ctx.enrage && ctx.enrage(e); ctx.music && ctx.music('banditking:p2'); }
    stepBottles(e, dt); stepFires(e, dt); stepPuddles(dt); stepBurns(dt);
    e.dashing = false;
    switch (e.mode) {
      case 'wake': if (e.modeT <= 0) { F.chain = CHAINS[1][0].slice(); F.step = 0; set(e, 'walk', 0.5);
        if (!F.said.water) { F.said.water = 1; ctx.number(e.x, e.y - 64, 'WET GROUND SLOWS HIM: POUR TO PEN HIM IN', '#7ab8e8'); } } break;
      case 'recover': if (!F.saidOff && F.n.cuts + F.n.whirls > 0) { F.saidOff = 1; ctx.number(e.x, e.y - 50, 'OFF BALANCE AFTER HIS BLOWS: CUT HIM THEN', '#ffd36b'); } if (e.modeT <= 0) set(e, 'walk', F.gapNext ?? 0.3); break;
      case 'walk': { const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
        if (ad > GL.dashAt && F.dashCd <= 0) { F.dashCd = GL.dashCd; F.cur = { k: 'dash', id: ++F.act }; F.n.dashes = (F.n.dashes || 0) + 1; tell(e, 'dashTell', GL.dashTell); break; }   /* stood off: he gathers to DASH */
        if (ad > GL.keep) e.x += mudStep(e, Math.sign(d) * Math.min(ad - GL.keep, GL.walk * dt));
        if (e.modeT <= 0) next(e); break; }
      case 'dashTell': if (e.modeT <= 0) { set(e, 'dash', GL.dashMax); ctx.sfx.dodge && ctx.sfx.dodge(); } break;
      case 'dash': { const d = P.x - e.x; e.dashing = true; e.x += fx * GL.dash * dt; if (Math.random() < dt * 20) ctx.dust(e.x - fx * 6, fl, 2);
        hit(e, front(GL.dashReach), GL.dmg.dash, 'HIS DASH', { key: key + 'd' });
        if (e.modeT <= 0 || fx * d < 6 || e.x <= Ar.x0 + 14 || e.x >= Ar.x1 - 14) after(e); break; }
      case 'slipped': if (e.modeT <= 0) { F.gapNext = 0.25; set(e, 'recover', 0.3); } break;   /* up again: on with his cycle */
      case 'cutTell': if (e.modeT <= 0) set(e, 'cut', GL.cutT); break;
      case 'cut': case 'cut2': case 'cross': e.x += mudStep(e, fx * GL.cutStep * dt); if (e.mode === 'cut2') { hit(e, front(GL.cutReach), GL.dmg.cut, 'HIS SWORDS', { key: key + 'b', blockable: true }); if (e.modeT <= 0) { F.n.cuts++; after(e); } break; } if (e.mode === 'cross') { hit(e, front(GL.cutReach), GL.dmg.cut, 'HIS SWORDS', { key: key + 'x', blockable: true }); if (e.modeT <= 0) { F.cur.k = 'cut'; tell(e, 'cut2Tell', GL.crossTell); } break; }
        hit(e, front(GL.cutReach), GL.dmg.cut, 'HIS SWORDS', { key: key + 'a', blockable: true }); if (e.modeT <= 0) tell(e, 'cut2Tell', GL.cut2Tell); break;
      case 'cut2Tell': if (e.modeT <= 0) set(e, 'cut2', GL.cutT); break;
      case 'crossTell': if (e.modeT <= 0) set(e, 'cross', GL.cutT); break;
      case 'whirlTell': if (e.modeT <= 0) { set(e, 'whirl', GL.whirlT); ctx.sfx.slash && ctx.sfx.slash(); } break;
      case 'whirl': hit(e, [e.x - GL.whirlR, e.x + GL.whirlR, fl - 26, fl], GL.dmg.whirl, 'THE WHIRL', { key }); if (e.modeT <= 0) after(e); break;
      case 'throwTell': if (e.modeT <= 0) { set(e, 'throw', 0.3); throwBottle(e); } break;
      case 'throw': if (e.modeT <= 0) after(e); break;
      case 'dodge': { e.x += -fx * GL.dodgeDist / GL.dodgeT * dt; e.x = Math.max(Ar.x0 + 16, Math.min(Ar.x1 - 16, e.x)); if (e.modeT <= 0) { F.cur = { k: 'riposte', id: ++F.act }; tell(e, 'riposteTell', GL.riposteTell); } break; }
      case 'riposteTell': if (e.modeT <= 0) { set(e, 'riposte', GL.cutT + 0.1); e.x += fx * 26; } break;
      case 'riposte': hit(e, front(GL.cutReach + 16), GL.dmg.riposte, 'HIS RIPOSTE', { key: key + 'r' }); if (e.modeT <= 0) { F.n.ripostes++; after(e); } break;
      case 'burning': { e.face = Math.sign(P.x - e.x) || e.face;   /* ROOTED and staggered (Daniel 10-03): he stands beating at the flames - no step, no back-pedal */
        if (e.open <= 0) { F.gapNext = 0.2; set(e, 'recover', 0.4); F.openTaken = 0; } break; }
      default: if (e.modeT <= -1) after(e);
    }
    e.x = Math.max(Ar.x0 + 12, Math.min(Ar.x1 - 12, e.x));
    wetFeet(e);
    /* THE WELL HEAD refills the skin: said once, the first time a skin runs dry in his courtyard (the well glints while a skin has room) */
    if (!F.said.well && Ar.well != null && ctx.players.some(pp => pp.skin && pp.skin.sips <= 0)) { F.said.well = 1; ctx.number(Ar.well, fl - 40, 'THE WELL HEAD REFILLS YOUR SKIN', '#7ab8e8'); }
  };
  function throwBottle(e) { const P = nearest(e), fl = F.A.floor, sx = e.x + (e.face || 1) * 8, sy = fl - 34, T = GL.fly, tx = F.cur && F.cur.x != null ? F.cur.x : P.x;
    F.bottles.push({ id: ++F.idN, x: sx, y: sy, vx: (tx - sx) / T, vy: (fl - 6 - sy) / T - 0.5 * 520 * T, g: 520, back: false, key: 'glb' + F.idN }); F.n.bottles++; ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); }
  function stepBottles(e, dt) { const fl = F.A.floor, hb = ctx.attackBox();
    for (const b of F.bottles) {
      if (!b.back && hb && ctx.overlap(hb, { l: b.x - GL.reflectR, r: b.x + GL.reflectR, t: b.y - GL.reflectR, b: b.y + GL.reflectR })) { b.back = true; b.g = 0; F.n.reflects++; ctx.sfx.parry && ctx.sfx.parry(); ctx.sparks(b.x, b.y, ctx.hero().face || 1, 6);
        if (!F.saidBack) { F.saidBack = 1; ctx.number(b.x, b.y - 20, 'STRUCK BACK: IT FLIES HOME', '#8fd160'); } }
      if (b.back) { const dx = e.x - b.x, dy = (e.y - 18) - b.y, d = Math.hypot(dx, dy) || 1; b.vx = dx / d * GL.back; b.vy = dy / d * GL.back; b.x += b.vx * dt; b.y += b.vy * dt;
        if (d < 14) { b.dead = true; light(e, b); } continue; }
      b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      hit(e, [b.x - 5, b.x + 5, b.y - 5, b.y + 5], GL.dmg.bottle, 'HIS BOTTLE', { key: b.key, blockable: true });
      if (b.y >= fl - 2) { b.dead = true; const wetHere = F.puddles.find(q => Math.abs(q.x - b.x) < GL.puddleR + GL.fireR * 0.5);
        if (wetHere) { ctx.burst(b.x, fl - 6, 10, ['#e8f4f8', '#9aa39a'], 50, 0.6); ctx.sfx.hiss && ctx.sfx.hiss(); }   /* broken on wet stone: the oil does not take */
        else { F.fires.push({ x: b.x, t: GL.fireT, tick: 0 }); ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(b.x, fl - 6, 12, ['#ff9a3c', '#ffd36b', '#3a2a12'], 70, 0.6); } } }
    F.bottles = F.bottles.filter(b => !b.dead); }
  function stepFires(e, dt) { const fl = F.A.floor; for (const f of F.fires) { f.t -= dt; f.tick -= dt; if (f.tick <= 0) { f.tick = GL.fireTick; hit(e, [f.x - GL.fireR, f.x + GL.fireR, fl - 10, fl + 2], GL.dmg.fire, 'HIS FIRE', { key: 'glf' + R(f.x) + R(f.t * 2), noKnock: true, ignite: true }); } }
    F.fires = F.fires.filter(f => f.t > 0); }
  function stepPuddles(dt) { for (const q of F.puddles) q.t -= dt; F.puddles = F.puddles.filter(q => q.t > 0 && !q.dead); }
  /* A HERO ALIGHT: a tick at a time until it burns out or the skin puts it out */
  function stepBurns(dt) { for (const pp of ctx.players) { if (!(pp.glBurn > 0)) continue; if (pp.dead) { pp.glBurn = 0; continue; } pp.glBurn -= dt; pp.glBurnTick = (pp.glBurnTick ?? GL.burnTick) - dt;
    if (pp.glBurnTick <= 0) { pp.glBurnTick = GL.burnTick; const e = live(); ctx.asPlayer(pp, () => hurt('ALIGHT', () => ctx.damagePlayer(pp.x - (pp.face || 1) * 4, GL.dmg.burn, { who: e, name: 'ALIGHT', unblockable: true, noKnock: true }))); } } }
  /* HE BURNS: his own bottle, struck home. Open, x GL.openMul, and no more than GL.capK of him in one burning */
  function light(e, b) { if (!e.alive) return; e.open = GL.openT; F.openTaken = 0; F.n.opens++; set(e, 'burning', GL.openT + 0.05); F.bottles = F.bottles.filter(q => q.back); ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.crack && ctx.sfx.crack();
    ctx.burst(e.x, e.y - 18, 22, ['#ff9a3c', '#ffd36b', '#d84a14'], 90, 0.8); ctx.shake(3); if (F.n.opens === 1) ctx.number(e.x, e.y - 56, 'HE IS ALIGHT: CUT HIM - KEEP THE WATER OFF HIM', '#8fd160'); else ctx.number(e.x, e.y - 56, 'HE IS ALIGHT: CUT HIM', '#8fd160'); }
  H.lightForTest = e => light(e, null);
  /* A PUDDLE: a pour on his floor (or a test's) */
  H.puddleAt = x => { if (!F) return null; const Ar = F.A; x = Math.max(Ar.x0 + 14, Math.min(Ar.x1 - 14, x)); const q = { x, t: GL.puddleT }; F.puddles = F.puddles.filter(p => Math.abs(p.x - x) > GL.puddleR); F.puddles.push(q); F.n.puddles++;
    for (const f of F.fires) if (Math.abs(f.x - x) < GL.puddleR + GL.fireR) { f.t = 0; ctx.sfx.hiss && ctx.sfx.hiss(); ctx.burst(f.x, Ar.floor - 6, 8, ['#e8f4f8', '#9aa39a'], 40, 0.6); }   /* and it puts out his fire on the floor */
    return q; };
  /* THE POUR (src/well-town-hands.js asks pourables()): alight, the skin goes over YOU; otherwise a puddle on his floor in front of you */
  const fighting = () => { const e = live(); return F && e && e.mode !== 'sleep' && A() ? e : null; };
  H.pourable = {
    aim: P => { const e = fighting(); if (!e) return null; const Ar = F.A; if (P.x < Ar.x0 || P.x > Ar.x1 || Math.abs(P.y - Ar.floor) > 40) return null;
      if (P.glBurn > 0) return { x: P.x, y: P.y - 14, what: 'self' };
      if (!P.ground || Math.abs(P.y - Ar.floor) > 4) return null; const x = Math.max(Ar.x0 + 14, Math.min(Ar.x1 - 14, P.x + (P.face || 1) * GL.pourAt)); return { x, y: Ar.floor - 2, what: 'floor' }; },
    pour: P => { const a = H.pourable.aim(P); if (!a) return null;
      if (a.what === 'self') { P.glBurn = 0; F.n.selfDoused++; ctx.burst(P.x, P.y - 16, 12, ['#e8f4f8', '#7ab8e8', '#9aa39a'], 50, 0.7); ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.splash && ctx.sfx.splash(); ctx.number(P.x, P.y - 30, 'THE WATER PUTS YOU OUT', '#7ab8e8'); return 'self'; }
      H.puddleAt(a.x); ctx.sfx.splash && ctx.sfx.splash(); if (!F.said.puddle) { F.said.puddle = 1; ctx.number(a.x, F.A.floor - 30, 'MUD: HE STOPS AT ITS EDGE. A DASH SLIPS HIM', '#7ab8e8'); } return 'puddle'; },
  };
  /* A BLOW ON HIM (minis keep their damage): while he burns x GL.openMul up to GL.capK of him; down in a puddle, whole; otherwise whole - unless a blade
     of his is MOVING (the other guards a frontal blow), or he DODGES it (rarely, from the front, as he walks in: and the riposte comes) */
  H.take = (e, dmg, fromX) => { if (!F) return dmg; const P = ctx.hero();
    if (glOpen(e)) { const cap = e.maxHp * GL.capK, d = Math.min(dmg * GL.openMul, Math.max(0, cap - F.openTaken)); if (d < dmg * GL.openMul) F.n.capped++; F.openTaken += d;
      if (F.openTaken >= cap - 0.01) { e.open = Math.min(e.open, 0.3); ctx.number(e.x, e.y - 56, 'THE FLAMES GO OUT', '#9aa39a'); } return d; }
    if (e.mode === 'dodge') { e.chipHit = ctx.time(); return 0; }   /* slipping it: a blade that follows him into his dodge meets air */
    if (e.mode === 'slipped') return dmg;
    const frontal = (e.face || 1) * (P.x - e.x) > -4;
    /* TWO SWORDS: while a blade is moving the other guards - a blow from the front into his cut is turned */
    if (frontal && PARRY.has(e.mode)) { e.chipHit = ctx.time(); F.n.parried++; ctx.sparks(e.x + (e.face || 1) * 8, e.y - 18, e.face || 1, 4); ctx.sfx.clank && ctx.sfx.clank();
      if (!F.saidParry) { F.saidParry = 1; ctx.number(e.x, e.y - 50, 'HIS OTHER BLADE GUARDS: NOT INTO HIS CUTS', '#9aa39a'); } return 0; }
    if (frontal && e.mode === 'walk' && F.dodgeCd <= 0 && Math.random() < GL.dodge) { F.dodgeCd = GL.dodgeCd; F.n.dodges++; set(e, 'dodge', GL.dodgeT); ctx.dust(e.x, e.y, 6); ctx.sfx.dodge && ctx.sfx.dodge();
      ctx.number(e.x, e.y - 50, 'HE SLIPS THE BLADE: HIS RIPOSTE COMES', '#ffd36b'); e.glancedAt = ctx.time(); return 0; }
    return dmg; };
  H.frame = e => { const m = e.mode, w = Math.floor(ctx.time() * 8) % 2; return { stand: 0, wake: 0, walk: 1 + w, recover: 15, cutTell: 3, cut: 4, cut2Tell: 5, cut2: 6, crossTell: 5, cross: 6, whirlTell: 7, whirl: 8 + w,
    throwTell: 10, throw: 11, dodge: 12, riposteTell: 3, riposte: 4, burning: 13 + w, slipped: 16, dashTell: 12, dash: 4 }[m] ?? 0; };
  H.barName = e => 'THE GANG LEADER' + (glOpen(e) ? '  ALIGHT' : e.mode === 'slipped' ? '  DOWN' : '');
  H.end = e => { if (F) { F.bottles = []; F.fires = []; F.puddles = []; } for (const pp of ctx.players) pp.glBurn = 0; };
  H.read = () => F && { n: { ...F.n }, ph: F.ph, cycle: F.cycle, hurt: { ...F.hurt }, bottles: F.bottles.length, fires: F.fires.length, puddles: F.puddles.length };
  /* DRAWING: the puddles, his bottles (lit), the burning floor, his flames and his clock, and a hero alight */
  H.drawOver = (g, cx, cy, time) => { if (!F) return; const fl = F.A.floor, e = live();
    for (const q of F.puddles) { const x = R(q.x - cx), y = R(fl - cy), k = Math.min(1, q.t), r = GL.puddleR; g.globalAlpha = 0.85 * k;   /* MUD: a dark wet patch, a lighter rim, a slow ripple */
      g.fillStyle = '#2a2018'; g.fillRect(x - r, y - 2, r * 2, 3); g.fillStyle = '#3e2f22'; g.fillRect(x - r + 2, y - 3, r * 2 - 4, 2); g.fillStyle = '#5a7a9a'; g.fillRect(x - r + 6, y - 3, r * 2 - 12, 1);
      const rp = (time * 10 + q.x) % 16; g.fillStyle = '#9ac4e4'; g.fillRect(x - R(rp), y - 3, 2, 1); g.fillRect(x + R(rp) - 2, y - 3, 2, 1); g.fillStyle = '#c4ecff'; g.fillRect(x - r + 3 + R(Math.sin(time * 3 + q.x) * 2), y - 3, 3, 1);
      g.globalAlpha = 1; }
    for (const f of F.fires) { const x = R(f.x - cx), y = R(fl - cy); for (let k = -GL.fireR; k < GL.fireR; k += 4) { const h = 5 + 4 * Math.abs(Math.sin(time * 11 + k + f.x)); g.fillStyle = (k / 4) % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(x + k, y - h, 3, h); } g.fillStyle = '#3a2a12'; g.fillRect(x - GL.fireR, y - 1, GL.fireR * 2, 1); }
    for (const b of F.bottles) { const x = R(b.x - cx), y = R(b.y - cy); g.fillStyle = '#5a7a4a'; g.fillRect(x - 2, y - 3, 5, 6); g.fillStyle = '#c9b27c'; g.fillRect(x - 1, y - 5, 2, 2); g.fillStyle = Math.floor(time * 20) % 2 ? '#ffd36b' : '#ff6a2a'; g.fillRect(x - 1, y - 8, 3, 3);
      if (b.back) { g.fillStyle = '#e8f4f8'; g.fillRect(x - Math.sign(b.vx) * 6, y, 4, 1); } else if (!F.saidReflectHint) { ctx.text('STRIKE IT', x, y - 14, '#ffd36b', 'center', 6); } }
    if (F.bottles.length && F.n.reflects) F.saidReflectHint = true;
    if (e && glOpen(e)) { const x = R(e.x - cx), y = R(e.y - cy); for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(x - 10 + k * 4, y - 26 - R(6 * Math.abs(Math.sin(time * 10 + k))), 3, 9); }
      const k = Math.max(0, e.open / GL.openT); g.fillStyle = '#1b1626'; g.fillRect(x - 16, y - 50, 32, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 16, y - 50, R(32 * k), 3); }
    if (e && e.mode === 'slipped') { const x = R(e.x - cx), y = R(e.y - cy), k = Math.max(0, e.modeT / GL.slipT); g.fillStyle = '#1b1626'; g.fillRect(x - 16, y - 30, 32, 3); g.fillStyle = '#7ab8e8'; g.fillRect(x - 16, y - 30, R(32 * k), 3); }
    for (const pp of ctx.players) if (pp.glBurn > 0 && !pp.dead) { const x = R(pp.x - cx), y = R(pp.y - cy); for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(x - 6 + k * 3, y - 18 - R(5 * Math.abs(Math.sin(time * 12 + k))), 2, 7); } }
  };
  return H;
}
