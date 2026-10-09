// src/temple-guardian.js - THE TEMPLE GUARDIAN, REWORKED (claude/monastery2; scratch/brief-temple2.md, Daniel 2026-10-08: "a little too
// difficult", "you fall through the stone blocks it raises", "much bigger - keep its look").
// The monks' stone guardian in the Monastery's temple hall (t 'golem', a mini: src/level.js theMonastery 6b). A CONSTRUCT keyed fight
// (design-standard B14): stone takes a blade at TG.take (0.4, B15's floor - never the old x0.05/nothing) and says why (a clank and the key's
// word: RING A BELL / THROW IT); its KEYS are the level's two verbs aimed at it -
//   THE BELL IS A NOTE: a hall bell struck while the guardian stands inside that bell's drawn reach STAGGERS it (bellNote, shared with every
//     bell on the mountain: the same ring dazes goblins, birds and priests on the level's bridges and yards);
//   THE BLOCKS ARE AMMO: it raises blocks of its hall floor; INTERACT takes one, ATTACK throws it (src/carry-throw.js 'stone': the told arc),
//     and a block that lands on it STAGGERS it. When it is HURT (each quarter broken, and on a clock in its second half) it tears its blocks
//     up and HURLS them at you (a told arc and a landing ring: block or step off it).
// STAGGERED it stands still (B4) under a GOLD ring with a bar that runs out (B10) and every blow pays TG.open (x2); then a told WARD of
// TG.wardT seconds (B3: a pale shell - no bell or block staggers it, blades at the floor) so it cannot be chain-locked.
// Its moves (one told windup at a time): STAMP (!!, close: a wave each way along the floor - jump it), SWEEP (LOW: its staff along the
// floor - jump it), THROW rubble (!, at range - block it), RAISE (blocks either side), HURL (its blocks, when hurt) and, new, BELL TOLL
// (THE BELLS: its staff on the floor - a ring of sound runs out along the floor each way, jump it, and the hall's bells SWING and cannot be
// struck until they settle).
// THE FALL-THROUGH BUG: the old shroud laid T.ICE, and src/slopes.js's landing test (moveBodySquare: SOLID/CRATE/PALISADE/PORT/CLIMB/SOFT -
// not ICE) let a falling hero through the top of what was a wall from the side. Its blocks are T.SOLID now (rubble-skinned), never laid on
// a body, and a body inside one is put out on top (unstick) - tools/temple-guardian.mjs drops, walks and stands every hero on them.
// main.js wires it: makeGuardian(ctx) once; spawn (the 'golem' case: w/h), updateGolem -> G.update, hurtEnemy0 -> G.take, the hall bells
// (updateMonkProps) -> G.bellNote, the carry (throwCarry / P.carry), drawing (G.drawWorld after the creatures, G.drawOver over the dark).
import * as CT from './carry-throw.js';

export const TG = {
  scale: 2, w: 56, h: 66,                   // drawn at twice the old 40x40 (its own look, pixel for pixel); its body box
  take: 0.4, open: 2.0, wardTake: 0.4,      // a blade outside its opening (B15's floor), in its stagger, and while its ward is up
  staggerT: 1.7, staggerT2: 1.5, wardT: 3.5, // s staggered (phase 1 / 2), s its told ward after
  bellRx: 84,                               // px either side of a hall bell its note reaches the floor (drawn under each bell)
  noteR: 96, noteT: 0.45, dazeT: 1.5,       // the note's ring: px and s it grows; s a goblin, bird or priest in it is dazed
  walk: 34, walk2: 44, stop: 52,            // px/s; px short of you it stops
  stompT: 5.0, stompT2: 4.0, stompR: 64, stompHit: 46,
  sweepT: 6.5, sweepT2: 5.0, sweepNear: 1.8, sweepNear2: 1.3, sweepR: 92, sweepTell: 0.8,
  throwT: 5.5, throwT2: 4.0,
  raiseT: 9, raiseT2: 7, raiseAt: 4, maxBlocks: 2,     // s between raises; tiles either side of it the blocks rise; most standing at once
  hurlT1: 10, hurlT2: 7, hurlTell: 0.85, hurlFly: 0.95, hurlDmg: 30, sweepDmg: 28, stompDmg: 32, hurlR: 16,   // phase two hurls on this clock; the told lift; its flight; its blow; px it splashes
  tollFirst: 7, tollT: 8.5, tollT2: 7, tollTell: 0.85, tollV: 170, tollDmg: 24, swingT: 1.8,   // BELL TOLL: s to the first, between; the tell; its ring's px/s; the blow; s the bells swing
  takeR: 26, carryV: 52, thrown: 30,        // px a hand reaches a block from; walk while carrying one; a thrown block's blow on any other foe
};
CT.addKind('stone', { aims: { low: { vx: 110, vy: -130 }, mid: { vx: 175, vy: -210 }, high: { vx: 120, vy: -320 } }, g: 700, r: 5, ring: 12, dots: 14 });

export const WORDS = { bell: 'RING A BELL', throw: 'THROW IT', ward: 'WARDED' };
/* the lines it teaches (each one is in src/hint-lines.js CALL_LINES, so number() shows it in the hint box) */
export const LINES = { stagger: 'THE NOTE STAGGERS IT: CUT IT', staggerThrow: 'THE STONE STAGGERS IT: CUT IT', ward: 'IT WARDS ITSELF', raise: 'IT RAISES STONE: TAKE ONE (INTERACT)',
  take: 'ATTACK THROWS THE STONE', hurl: 'IT HURLS ITS STONE', toll: 'THE BELLS SWING', swinging: 'THE BELL IS SWINGING', notUnder: 'IT IS NOT UNDER THE BELL', rings: 'IT RINGS',
  hint1: 'A BELL STRUCK WITH IT IN THE BELL\'S REACH STAGGERS IT. SO DOES ITS OWN STONE, THROWN.', warded: 'WARDED' };

export const guardianOpen = e => !!e && e.open > 0;                       // its stagger (boss-greed OPEN_RULE, the lab's read)
export const guardianWarded = e => !!e && e.ward > 0;
/* is the guardian inside a hall bell's reach? (the drawn band under it: the floor, either side by TG.bellRx) */
export const inBellReach = (bell, e) => !!bell && !!e && Math.abs(e.x - bell.x) <= TG.bellRx && e.y > bell.y;

export function makeGuardian(ctx) {
  let G = null;   // this load's state: blocks, notes (bell rings), tolls (floor rings), hurled stones
  const TS = ctx.TS, T = ctx.T;
  const st = () => { const L = ctx.L; if (!G || G.L !== L) G = { L, blocks: [], notes: [], tolls: [], said: {}, firstRaise: true }; return G; };
  const once = k => { const s = st(); if (s.said[k]) return false; s.said[k] = 1; return true; };
  const say = (x, y, t, c) => ctx.number(x, y, t, c || '#ffd36b');
  const A = e => (e && e.mini ? ctx.L.mini : ctx.L.arena);
  const fyOf = e => Math.floor(A(e).floor / TS) - 1;                     // the row a block's foot stands in (on the hall floor)

  /* ---------- THE BLOCKS: two tiles of SOLID (rubble-skinned) standing on the hall floor ---------- */
  const cellsOf = b => [[b.tx, b.fy - 1], [b.tx, b.fy]];
  const lay = (b, on) => { for (const [x, y] of cellsOf(b)) { const i = y * ctx.LW() + x; if (on) { if (ctx.grid()[i] === T.AIR) { ctx.grid()[i] = T.SOLID; ctx.spr()[i] = ctx.rubble(); } }
    else if (ctx.grid()[i] === T.SOLID) { ctx.grid()[i] = T.AIR; ctx.spr()[i] = null; } } ctx.resolveTiles(); };
  const boxOfBlock = b => ({ l: b.tx * TS, r: (b.tx + 1) * TS, t: (b.fy - 1) * TS, b: (b.fy + 1) * TS });
  const touches = (bx, body, pad = 1) => !!body && body.x + body.w / 2 + pad > bx.l && body.x - body.w / 2 - pad < bx.r && body.y + pad > bx.t && body.y - body.h - pad < bx.b;
  const standing = () => st().blocks.filter(b => b.state === 'stand');
  function raiseAt(e, tx) {
    const s = st(), M = A(e), fy = fyOf(e); if (tx * TS <= M.x0 + 8 || (tx + 1) * TS >= M.x1 - 8) return null;
    const b = { tx, fy, state: 'stand', by: 'golem' }, bx = boxOfBlock(b);
    for (const [x, y] of cellsOf(b)) if (ctx.grid()[y * ctx.LW() + x] !== T.AIR) return null;
    for (const p of ctx.players()) if (!p.dead && touches(bx, p, 3)) return null;          /* NEVER ON A BODY: no block rises on a hero (no soft-lock) */
    if (touches(bx, e, 2)) return null;
    if (s.blocks.some(q => q.state === 'stand' && Math.abs(q.tx - tx) < 2)) return null;
    s.blocks.push(b); lay(b, true); ctx.burst(tx * TS + 8, fy * TS + 8, 10, ['#c8bca8', '#6a6258', '#9a9082'], 60, 0.5); ctx.dust(tx * TS + 8, (fy + 1) * TS, 6);
    return b;
  }
  /* a body caught inside SOLID it did not walk into (a block, or a tile the hall put back) is lifted out on top - never left in the stone */
  function unstick(p) {
    if (!p || p.dead) return; const l = Math.floor((p.x - p.w / 2 + 0.5) / TS), r = Math.floor((p.x + p.w / 2 - 0.5) / TS), t = Math.floor((p.y - p.h + 0.5) / TS), bt = Math.floor((p.y - 0.5) / TS);
    for (const b of standing()) { if (b.tx < l || b.tx > r) continue; if (b.fy < t || b.fy - 1 > bt) continue; p.y = (b.fy - 1) * TS; p.vy = Math.min(0, p.vy); p.ground = true; return true; }
    return false;
  }
  function shatter(b, x, y) { b.state = 'gone'; ctx.SFX.stone(); ctx.SFX.crack(); ctx.burst(x, y - 8, 14, ['#c8bca8', '#9a9082', '#6a6258'], 80, 0.6); ctx.dust(x, y, 6); }

  /* ---------- THE PLAYER'S HANDS: take a standing block (INTERACT), carry it, throw it (ATTACK: main.js throwCarry -> launch) ---------- */
  function take(p) {
    if (!p || p.dead || p.carry || !p.ground) return false; const s = st(); if (!s.L.mini) return false;
    const b = standing().filter(q => Math.abs(q.tx * TS + 8 - p.x) < TG.takeR && Math.abs(p.y - (q.fy + 1) * TS) < 6 || (Math.abs(q.tx * TS + 8 - p.x) < 12 && Math.abs(p.y - (q.fy - 1) * TS) < 3)).sort((a, c) => Math.abs(a.tx * TS + 8 - p.x) - Math.abs(c.tx * TS + 8 - p.x))[0];
    if (!b) return false;
    lay(b, false); b.state = 'held'; b.by = 'player'; b.holder = p; b.x = p.x; b.y = p.y - p.h - 2; b.hurtWas = p.hurt > 0; b.thrKind = 'stone'; b.noClimb = true; b.t = 'tgblock';
    b.launch = q => CT.launchOf('stone', q, ctx.keys()); p.carry = b; ctx.SFX.clank(); ctx.SFX.stone();
    if (once('take')) ctx.number(p.x, p.y - 34, 'ATTACK THROWS THE STONE');
    return true;
  }
  /* ---------- THE NOTE: one ring for every bell on the mountain ---------- */
  function bellNote(pr, o = {}) {
    const s = st(); s.notes.push({ x: pr.x, y: pr.y - 12, t: 0 }); ctx.SFX.seaBell(); let dazed = 0;
    for (const q of ctx.enemies()) { if (!q.alive || q === o.except || q.t === 'golem' || q.maxHp && (q === ctx.boss() || q.mini || q.elite)) continue;
      if (Math.hypot(q.x - pr.x, (q.y - (q.h || 16) / 2) - (pr.y - 12)) > TG.noteR) continue;
      q.stagger = Math.max(q.stagger || 0, TG.dazeT); q.blessT = 0; q.flash = 0.2; q.vx = 0; q.dazedT = TG.dazeT; dazed++; }
    let res = 'rings';
    if (pr.guard) { const gd = ctx.enemies().find(q => q.alive && q.t === 'golem' && q.mode !== 'sleep');
      if (gd && (pr.tollT || 0) <= 0) { if (inBellReach(pr, gd)) res = stagger(gd, 'bell') ? 'stagger' : 'ward'; else { res = 'far'; ctx.number(pr.x, pr.y - 36, 'IT IS NOT UNDER THE BELL', '#9aa39a'); if (!(ctx.PROG.guardTold > 1)) { ctx.PROG.guardTold = (ctx.PROG.guardTold || 0) + 1; ctx.hint(LINES.hint1, 4.5); } } } }
    return { res, dazed };
  }
  /* ---------- ITS STAGGER (the two keys) and its WARD ---------- */
  function stagger(e, by) {
    if (e.ward > 0 || e.open > 0 || e.hp <= 0) { if (e.ward > 0) { ctx.turned(e, ctx.P.x, WORDS.ward); } return false; }
    const t = e.phase === 2 ? TG.staggerT2 : TG.staggerT; e.mode = 'stagger'; e.modeT = t; e.open = t; e.openMax = t; e.stagger = t; e.vx = 0; e.openBy = by; e.keys = (e.keys || 0) + 1;
    ctx.ringAt(e.x, e.y - 30, 44, '#ffd36b', 0.6); ctx.shakeCam(6); ctx.zoomKick(1.08, 0.25); ctx.SFX.golemShatter(); ctx.hitstop(0.08);
    ctx.burst(e.x, e.y - 40, 18, ['#c8bca8', '#ffd36b', '#9a9082'], 90, 0.7);
    if (by === 'bell') ctx.number(e.x, e.y - e.h - 14, 'THE NOTE STAGGERS IT: CUT IT', '#ffd36b'); else ctx.number(e.x, e.y - e.h - 14, 'THE STONE STAGGERS IT: CUT IT', '#ffd36b');
    return true;
  }
  function take_(e, dmg, fromX) {   /* hurtEnemy0's multiplier for a blow on it, said */
    if (e.mode === 'sleep' || e.mode === 'wake') return 0;
    if (e.open > 0) return dmg * TG.open;
    ctx.turned(e, fromX, e.ward > 0 ? WORDS.ward : standing().length ? WORDS.throw : WORDS.bell);
    return Math.max(1, Math.round(dmg * (e.ward > 0 ? TG.wardTake : TG.take)));
  }
  /* ---------- THE AI ---------- */
  function update(e, dt) {
    const s = st(), M = A(e), floor = M.floor, p2 = e.phase === 2, P = ctx.P; e.modeT -= dt; e.hitT = Math.max(0, (e.hitT || 0) - dt); e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300; e.anim = (e.anim || 0) + dt;
    e.open = Math.max(0, (e.open || 0) - dt); e.ward = Math.max(0, (e.ward || 0) - dt); e.lastHurt = e.lastHurt ?? e.hp;
    const d = P.x - e.x, ad = Math.abs(d), ph = P.dead ? 1e9 : ad;
    if (e.mode === 'sleep') return;
    e.keyWord = e.ward > 0 ? WORDS.ward : standing().length ? WORDS.throw : WORDS.bell;
    /* a quarter of it breaks away: it is HURT - it tears its blocks up and hurls them (two raised first if it has none) */
    const facet = Math.min(3, Math.floor((e.maxHp - e.hp) / (e.maxHp / 4)));
    if (facet > (e.facets || 0)) { e.facets = facet; if (facet >= 2 && e.phase !== 2) { e.phase = 2; ctx.number(e.x, e.y - e.h - 22, 'THE GUARDIAN WAKES FULLY', '#ff9a5c'); }
      ctx.burst(e.x, e.y - 40, 20, ['#9a9082', '#c8bca8', '#6a6258'], 90, 0.8); ctx.SFX.golemShatter(); ctx.shakeCam(5); e.hurlDue = true; }
    let want = 0;
    const keys = ['stompT', 'throwT', 'raiseT', 'sweepT', 'tollT', 'hurlT'];
    if (e.mode === 'walk') for (const k of keys) e[k] = (e[k] ?? 4) - dt;
    switch (e.mode) {
      case 'wake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 1; e.tollT = TG.tollFirst; e.raiseT = 2.5; e.stompT = 3; e.throwT = 4.5; e.sweepT = 4; e.hurlT = TG.hurlT1; } break;
      case 'stagger': want = 0; e.vx = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.5; e.open = 0; e.stagger = 0; e.ward = TG.wardT; ctx.ringAt(e.x, e.y - 34, 40, '#d8e2ee', 0.5); ctx.SFX.golemChime(); ctx.number(e.x, e.y - e.h - 14, 'IT WARDS ITSELF', '#d8e2ee'); } break;
      case 'walk': { e.face = Math.sign(d) || e.face; want = ad > TG.stop ? e.face * (p2 ? TG.walk2 : TG.walk) : 0;
        e.nearT = ad < TG.sweepR && !P.dead ? (e.nearT || 0) + dt : 0;
        if (e.modeT <= 0 && !P.dead) {
          const stand = standing().length;
          if (e.hurlDue && stand) { e.hurlDue = false; startHurl(e); }
          else if (e.hurlDue) { e.hurlDue = false; e.mode = 'raiseTell'; e.modeT = 0.5; e.hurlAfter = true; ctx.number(e.x, e.y - e.h - 12, 'IT RAISES STONE', '#c8bca8'); ctx.SFX.hiss(); }
          else if (e.sweepT <= 0 && e.nearT > (p2 ? TG.sweepNear2 : TG.sweepNear)) { e.sweepT = p2 ? TG.sweepT2 : TG.sweepT; e.nearT = 0; e.mode = 'sweepTell'; e.modeT = TG.sweepTell; say(e.x, e.y - e.h - 12, 'LOW', '#ff6b6b'); ctx.SFX.golemChime(); }
          else if (e.stompT <= 0 && ad < TG.stompR) { e.stompT = p2 ? TG.stompT2 : TG.stompT; e.mode = 'stompTell'; e.modeT = 0.7; say(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); ctx.SFX.golemChime(); }
          else if (e.tollT <= 0) { e.tollT = p2 ? TG.tollT2 : TG.tollT; e.mode = 'tollTell'; e.modeT = TG.tollTell; say(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); ctx.number(e.x, e.y - e.h - 22, 'THE BELLS SWING', '#ffd36b'); ctx.SFX.golemChime(); for (const b of ctx.props()) if (b.t === 'tbell' && b.guard) b.tollT = TG.tollTell + TG.swingT; }
          else if (e.raiseT <= 0 && stand < TG.maxBlocks) { e.raiseT = p2 ? TG.raiseT2 : TG.raiseT; e.mode = 'raiseTell'; e.modeT = 0.6; ctx.number(e.x, e.y - e.h - 12, 'IT RAISES STONE', '#c8bca8'); ctx.SFX.hiss(); }
          else if (e.hurlT <= 0 && stand) { e.hurlT = p2 ? TG.hurlT2 : TG.hurlT1; startHurl(e); }
          else if (e.throwT <= 0 && (ad > 70 || P.y < floor - 20)) { e.throwT = p2 ? TG.throwT2 : TG.throwT; e.mode = 'throwTell'; e.modeT = 0.6; say(e.x, e.y - e.h - 12, '!', '#ffd36b'); ctx.SFX.buzz(); }
        } break; }
      case 'stompTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'stomp'; e.modeT = 0.55; ctx.shakeCam(8); ctx.SFX.golemStomp(); ctx.zoomKick(1.08, 0.2); ctx.dust(e.x - 20, e.y, 10); ctx.dust(e.x + 20, e.y, 10);
          for (const dd of [-1, 1]) ctx.waves().push({ x: e.x + dd * 30, y: floor, dir: dd, life: 1.6, sp: p2 ? 170 : 140 });
          if (!P.dead && ad < TG.stompHit && Math.abs(P.y - e.y) < 22 && P.ground) ctx.damagePlayer(e.x, TG.stompDmg, { unblockable: true, up: true }); } break;
      case 'stomp': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; } break;
      case 'throwTell': e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'throw'; e.modeT = 0.5; const n = p2 ? 4 : 3;
          for (let k = 0; k < n; k++) { const sx = e.x + e.face * 22, sy = e.y - 52, Tf = 0.75 + k * 0.12, Gv = 380, dx = P.x - sx, dy = (P.y - 8) - sy; ctx.seeds().push({ x: sx, y: sy, vx: Math.max(-230, Math.min(230, dx / Tf)), vy: dy / Tf - 0.5 * Gv * Tf, dead: false, life: 3, g: Gv, shard: true }); }
          ctx.SFX.golemThrow(); } break;
      case 'throw': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.7; } break;
      case 'raiseTell': want = 0; if (e.modeT <= 0) { e.mode = 'raise'; e.modeT = 0.6; const ctx0 = Math.floor(e.x / TS); let n = 0;
          for (const sx of [-TG.raiseAt, TG.raiseAt, -TG.raiseAt - 3, TG.raiseAt + 3]) { if (standing().length >= TG.maxBlocks || n >= 2) break; if (raiseAt(e, ctx0 + sx)) n++; }
          if (n) { ctx.SFX.crack(); ctx.shakeCam(3); if (s.firstRaise) { s.firstRaise = false; ctx.number(e.x, e.y - e.h - 22, 'IT RAISES STONE: TAKE ONE (INTERACT)', '#ffd36b'); } } } break;
      case 'raise': want = 0; if (e.modeT <= 0) { if (e.hurlAfter && standing().length) { e.hurlAfter = false; startHurl(e); } else { e.hurlAfter = false; e.mode = 'walk'; e.modeT = 0.8; } } break;
      case 'hurlTell': want = 0; e.face = Math.sign(d) || e.face; { const hb = e.hurl; if (hb && hb.state === 'lift') { hb.x = e.x + e.face * 18; hb.y = e.y - e.h - 6 - 10 * Math.min(1, 1 - e.modeT / TG.hurlTell); } }
        if (e.modeT <= 0) { const hb = e.hurl; e.mode = 'hurl'; e.modeT = 0.5; if (hb && hb.state === 'lift') { const Tf = TG.hurlFly, Gv = 640; hb.state = 'fly'; hb.by = 'golem'; hb.vx = (hb.aimX - hb.x) / Tf; hb.vy = (hb.aimY - hb.y) / Tf - 0.5 * Gv * Tf; hb.g = Gv; ctx.SFX.golemThrow(); ctx.SFX.throwWhoosh(); } } break;
      case 'hurl': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.7; if (e.hurlLeft > 0 && standing().length) { e.hurlLeft--; startHurl(e); } } break;
      case 'tollTell': want = 0; if (e.modeT <= 0) { e.mode = 'toll'; e.modeT = 0.6; ctx.shakeCam(5); ctx.SFX.golemStomp(); ctx.SFX.seaBell(); ctx.zoomKick(1.06, 0.2);
          for (const dd of [-1, 1]) s.tolls.push({ x: e.x + dd * 24, y: floor, dir: dd, life: 2.6, sp: TG.tollV, hit: false });
          for (const b of ctx.props()) if (b.t === 'tbell' && b.guard) { b.tollT = TG.swingT; b.swing = TG.swingT; } } break;
      case 'toll': want = 0; if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; } break;
      case 'sweepTell': want = 0; e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 0.45; e.hitT = 0; ctx.SFX.charge(); ctx.shakeCam(3); ctx.dust(e.x + e.face * 44, floor, 10); } break;
      case 'sweep': want = 0; if (!P.dead && e.hitT <= 0 && P.ground && Math.abs(P.y - e.y) < 20 && ad < TG.sweepR) { e.hitT = 0.8; ctx.damagePlayer(e.x, TG.sweepDmg, { unblockable: true, up: true }); P.vx = (Math.sign(P.x - e.x) || 1) * 200; say(P.x, P.y - 24, 'SWEPT', '#ff6b6b'); }
        if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; } break;
    }
    if (e.mode !== 'stagger' && e.stagger > 0) { e.stagger = Math.max(0, e.stagger - dt); want = 0; }
    e.vx += (want - e.vx) * Math.min(1, dt * 5);
    const r = ctx.moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
    e.x = Math.max(M.x0 + e.w / 2 + 2, Math.min(M.x1 - e.w / 2 - 2, e.x));
    s.modeTime = s.modeTime || {}; const mk = e.mode.replace(/Tell$/, ''); s.modeTime[mk] = (s.modeTime[mk] || 0) + dt;   /* (how long each move holds its cycle: tools/temple-guardian.mjs, no move over ~35%) */
  }
  function startHurl(e) {
    const P = ctx.P, bs = standing().sort((a, c) => Math.abs(a.tx * TS + 8 - e.x) - Math.abs(c.tx * TS + 8 - e.x)); const b = bs[0]; if (!b) { e.mode = 'walk'; e.modeT = 0.5; return; }
    lay(b, false); b.state = 'lift'; b.by = 'golem'; b.x = b.tx * TS + 8; b.y = (b.fy + 1) * TS; b.aimX = Math.max(A(e).x0 + 12, Math.min(A(e).x1 - 12, P.x)); b.aimY = P.ground ? P.y : Math.min(A(e).floor, P.y + 30);
    e.hurl = b; e.mode = 'hurlTell'; e.modeT = TG.hurlTell; e.hurlLeft = e.phase === 2 ? 1 : 0;
    say(e.x, e.y - e.h - 12, '!', '#ffd36b'); if (once('hurl')) ctx.number(e.x, e.y - e.h - 22, 'IT HURLS ITS STONE', '#ff9a5c'); ctx.SFX.hiss(); ctx.SFX.stone();
  }
  /* ---------- THE WORLD: blocks in hand and in flight, the notes, the tolls ---------- */
  function step(dt) {
    const s = st(); if (!s.L || !s.L.mini) return; const P = ctx.P, gd = ctx.enemies().find(q => q.alive && q.t === 'golem');
    for (const p of ctx.players()) unstick(p);
    for (const b of s.blocks) {
      if (b.state === 'held') { const p = b.holder; if (!p || p.dead || p.carry !== b) { if (p && p.carry === b) p.carry = null; if (b.state === 'held') shatter(b, p ? p.x : b.x, p ? p.y : b.y); continue; }
        b.x = p.x; b.y = p.y - p.h - 2; if (p.hurt > 0 && !b.hurtWas) { p.carry = null; shatter(b, p.x, p.y); ctx.number(p.x, p.y - 30, 'A BLOW: YOU DROP IT', '#ff9a5c'); continue; } b.hurtWas = p.hurt > 0; continue; }
      if (b.state !== 'fly') continue;
      const k = CT.KINDS.stone; CT.stepArc(b, dt, b.g || k.g);
      const bx = { l: b.x - 7, r: b.x + 7, t: b.y - 14, b: b.y };
      if (b.by === 'player') {
        if (gd && ctx.overlap(bx, ctx.box(gd))) { b.state = 'gone'; ctx.SFX.heavy(); ctx.burst(b.x, b.y - 8, 18, ['#c8bca8', '#9a9082', '#ffd36b'], 100, 0.6); if (!stagger(gd, 'throw')) ctx.hurtEnemy(gd, 6, b.x, false); continue; }
        const foe = ctx.enemies().find(q => q.alive && q !== gd && !q.harmless && ctx.overlap(bx, ctx.box(q))); if (foe) { ctx.hurtEnemy(foe, TG.thrown, b.x, false); shatter(b, b.x, b.y); continue; }
      } else {
        for (const p of ctx.players()) if (!p.dead && ctx.overlap(bx, ctx.box(p))) { ctx.damagePlayer(b.x, TG.hurlDmg, { name: 'ITS STONE' }); b.state = 'gone'; ctx.SFX.heavy(); ctx.shakeCam(4); ctx.burst(b.x, b.y - 8, 14, ['#c8bca8', '#9a9082'], 90, 0.6); break; }
        if (b.state === 'gone') continue;
      }
      const tx = Math.floor(b.x / TS), ty = Math.floor((b.y + 1) / TS);
      if (b.vy >= 0 && (ctx.isSolid(tx, ty) || ctx.isOneWay(ctx.tileAt(tx, ty)))) { const ly = ty * TS; if (b.by === 'golem') for (const p of ctx.players()) if (!p.dead && p.ground && Math.abs(p.x - b.x) < TG.hurlR && Math.abs(p.y - ly) < 10) ctx.damagePlayer(b.x, Math.round(TG.hurlDmg * 0.6), { name: 'ITS STONE' }); ctx.shakeCam(b.by === 'golem' ? 5 : 2); shatter(b, b.x, ly); continue; }
      if (ctx.isSolid(Math.floor((b.x + Math.sign(b.vx || 1) * 6) / TS), Math.floor((b.y - 6) / TS))) { shatter(b, b.x, b.y); continue; }
      if (b.y > s.L.H * TS + 40) b.state = 'gone';
    }
    s.blocks = s.blocks.filter(b => b.state !== 'gone');
    for (const n of s.notes) n.t += dt; s.notes = s.notes.filter(n => n.t < TG.noteT + 0.3);
    for (const w of s.tolls) { w.life -= dt; w.x += w.dir * w.sp * dt; const tx = Math.floor(w.x / TS), ty = Math.floor((w.y - 4) / TS); if (ctx.isSolid(tx, ty)) w.life = 0;
      if (s.L.mini && (w.x < s.L.mini.x0 + 4 || w.x > s.L.mini.x1 - 4)) w.life = 0;
      for (const p of ctx.players()) if (!w.hit && !p.dead && p.ground && Math.abs(p.x - w.x) < 10 && p.y > w.y - 6) { w.hit = true; ctx.damagePlayer(w.x - w.dir * 20, TG.tollDmg, { unblockable: true, up: true, name: 'THE TOLL' }); } }
    s.tolls = s.tolls.filter(w => w.life > 0);
    for (const b of ctx.props()) if (b.t === 'tbell' && b.tollT > 0) b.tollT -= dt;
  }
  /* a fresh attempt (a respawn, a reload): the grid is put back as built by main.js; no block, ring or toll of the last one is left */
  function reset() { const s = st(); for (const b of s.blocks) if (b.state === 'held' && b.holder && b.holder.carry === b) b.holder.carry = null; s.blocks = []; s.notes = []; s.tolls = []; s.firstRaise = true; s.modeTime = {}; }

  /* ---------- DRAWING ---------- */
  function drawStone(g, x, y, lit) { g.fillStyle = '#241e1a'; g.fillRect(x - 8, y - 16, 16, 16); g.fillStyle = lit ? '#b0a492' : '#9a9082'; g.fillRect(x - 7, y - 15, 14, 14); g.fillStyle = '#c8bca8'; g.fillRect(x - 7, y - 15, 14, 2); g.fillStyle = '#6a6258'; g.fillRect(x - 7, y - 3, 14, 2); g.fillRect(x - 2, y - 11, 1, 5); g.fillRect(x + 3, y - 8, 3, 1); }
  function drawWorld(g, cx, cy, time) {
    const s = G; if (!s || !s.L || !s.L.mini || !ctx.miniOn()) { if (s) for (const b of s.blocks) if (b.state === 'held' || b.state === 'fly') drawStone(g, Math.round(b.x - cx), Math.round(b.y - cy)); return; }
    const P = ctx.P, M = s.L.mini, fy = Math.round(M.floor - cy), gd = ctx.enemies().find(q => q.alive && q.t === 'golem' && q.mini);
    /* each hall bell's REACH, drawn on the floor under it: gold while the guardian stands in it and the bell can be struck */
    for (const b of ctx.props()) { if (b.t !== 'tbell' || !b.guard) continue; const x = Math.round(b.x - cx), inR = gd && inBellReach(b, gd), ready = !(b.cool > 0) && !(b.tollT > 0), k = 0.5 + 0.5 * Math.sin(time * (inR && ready ? 12 : 3));
      g.globalAlpha = inR && ready && !(gd.ward > 0) ? 0.45 + 0.35 * k : 0.16 + 0.08 * k; g.fillStyle = inR && ready && !(gd.ward > 0) ? '#ffd36b' : '#e8c88a'; g.fillRect(x - TG.bellRx, fy - 2, TG.bellRx * 2, 2);
      g.fillRect(x - TG.bellRx, fy - 6, 1, 4); g.fillRect(x + TG.bellRx - 1, fy - 6, 1, 4);
      if (inR && ready && !(gd.ward > 0)) { g.globalAlpha = 0.12 + 0.1 * k; g.fillRect(x - 1, Math.round(b.y - cy) + 6, 2, fy - Math.round(b.y - cy) - 6); }
      g.globalAlpha = 1; }
    /* the standing blocks: TAKE ME (a ring while you are near and empty-handed) */
    for (const b of standing()) { const x = Math.round(b.tx * TS + 8 - cx), y = Math.round((b.fy + 1) * TS - cy); if (!P.carry && !P.dead && Math.abs(b.tx * TS + 8 - P.x) < 70 && Math.abs((b.fy + 1) * TS - P.y) < 40) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6 + b.tx); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(x - 9.5, y - 32.5, 19, 33); g.globalAlpha = 1; } }
    /* blocks in hand, rising, and in flight; a hurled one's landing ring */
    for (const b of s.blocks) { if (b.state === 'stand') continue; const x = Math.round(b.x - cx), y = Math.round(b.y - cy); drawStone(g, x, y, b.state === 'lift');
      if ((b.state === 'lift' || b.state === 'fly') && b.by === 'golem') { const ax = Math.round(b.aimX - cx), ay = Math.round(b.aimY - cy), k = 0.5 + 0.5 * Math.sin(time * 16); g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#241e1a'; g.beginPath(); g.ellipse(ax, ay - 1, TG.hurlR, 3, 0, 0, 7); g.fill(); g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(ax + 0.5, ay - 0.5, TG.hurlR + 2, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 1; } }
    /* the tolls: a ring of sound running out along the floor */
    for (const w of s.tolls) { const x = Math.round(w.x - cx), y = Math.round(w.y - cy), a = Math.min(1, w.life); g.globalAlpha = 0.55 * a; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 7, 14, 0, Math.PI, 2 * Math.PI); g.stroke(); g.globalAlpha = 0.3 * a; g.beginPath(); g.ellipse(x - w.dir * 8, y, 5, 10, 0, Math.PI, 2 * Math.PI); g.stroke(); g.globalAlpha = 1; }
  }
  function drawOver(g, cx, cy, time) {
    const s = G; if (!s) return;
    for (const n of s.notes) { const q = Math.min(1, n.t / TG.noteT), r = 8 + (TG.noteR - 8) * q; g.globalAlpha = 0.6 * (1 - Math.max(0, n.t - TG.noteT) / 0.3) * (1 - q * 0.5); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(Math.round(n.x - cx), Math.round(n.y - cy), r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    const P = ctx.P; if (P.carry && P.carry.t === 'tgblock' && !P.dead) { const v = CT.launchOf('stone', P, ctx.keys()), arc = CT.predictArc('stone', P.x, P.y - P.h - 6, v, (px, py) => ctx.isSolid(Math.floor(px / TS), Math.floor(py / TS)) || ctx.isOneWay(ctx.tileAt(Math.floor(px / TS), Math.floor(py / TS))), {}); CT.drawArc(g, arc, cx, cy, time, '#ffd36b'); }
    const gd = ctx.enemies().find(q => q.alive && q.t === 'golem' && q.mini && q.mode !== 'sleep'); if (!gd || !ctx.miniOn()) return;
    const x = Math.round(gd.x - cx), fy = Math.round(gd.y - cy);
    if (gd.open > 0) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.45 + 0.35 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 40 + k * 3, 8, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
      const q = Math.max(0, Math.min(1, gd.open / (gd.openMax || TG.staggerT))); g.fillStyle = '#16131a'; g.fillRect(x - 21, fy - gd.h - 20, 42, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, fy - gd.h - 19, Math.round(40 * q), 3); }   /* THE SHARED OPEN READ (B10) */
    else if (gd.ward > 0) { const k = 0.5 + 0.5 * Math.sin(time * 6); g.globalAlpha = 0.25 + 0.2 * k; g.strokeStyle = '#d8e2ee'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, fy - gd.h / 2, gd.w / 2 + 6, gd.h / 2 + 6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }   /* ITS WARD: a pale shell */
    if (gd.mode === 'sweepTell') { const k = 0.5 + 0.5 * Math.sin(time * 20); g.globalAlpha = 0.35 + 0.4 * k; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(x - TG.sweepR, fy - 3); g.lineTo(x + TG.sweepR, fy - 3); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }   /* THE SWEEP, told where */
  }
  return { update, step, take: (e, dmg, fromX) => take_(e, dmg, fromX), takeBlock: take, bellNote, stagger, reset, unstick, drawWorld, drawOver, state: () => st(), standing };
}
