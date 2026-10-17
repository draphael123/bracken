// src/admirals-champion-hands.js - THE ADMIRAL'S CHAMPION's HANDS (claude/flotilla2, the greybox). src/admirals-champion.js is the fight (pure: his two phases, his
// cycles, his blows, the knockdown, the tilt, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow; a shield turns only
// the yellow combo), THE CHAIN HOOK's haul, THE TILT's slide (a hero on a net or in the air is not on the deck), THE LASHING's gap (the hulls rock apart: the
// edge column of each hull opens over the harbour, then closes again once nobody is in it), THE DECK GUNS' round shot on him (src/main.js updateBalls calls
// onBall), every blow on him (take: B15 - his plate never turns a blow to nothing), and the drawing (GREYBOX shapes until the art pass: src/redraw/champion_art.js).
// THE SHARED READ (design standard B10): OPEN = a gold ring and a timer bar (KNOCKED FLAT / THE BLADE IS IN THE DECK); WARDED = a grey ring and the word; a blow on
// his plate CLANKS, flashes and says HIS PLATE through src/boss-read.js - and still lands at CH.plate (never silent, never nothing).
// main.js calls: spawnBoss, owns, on, update, take, onBall, drawBoss, drawOver, drawDead, barName, end, read, show, clear.
import * as ACM from './admirals-champion.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas } from './px.js';
import * as ART from './redraw/champion_art.js';
const { CH } = ACM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slash: s => (s.foeSlash || s.slash)(), lunge: s => (s.whoosh || s.foeSlash || s.slash)(),
  slam: s => (s.whoosh || s.slash)(), open: s => (s.bell || s.clank)(), chain: s => (s.chain || s.clank)(), leap: s => (s.pJump || s.whoosh || s.tell)(), land: s => (s.thud || s.crack)(),
  flat: s => { (s.crack || s.clank)(); (s.thud || s.clank)(); }, clank: s => s.clank(), creak: s => (s.creak || s.crack || s.thud)() };

/* THE BESTIARY CARD: the champion on the lashings at dusk, the blade grounded */
export function bakeChampionCard() {
  const W = 72, Hh = 84, [c, g] = canvas(W, Hh);
  const bg = g.createLinearGradient(0, 0, 0, Hh); bg.addColorStop(0, '#3a2a30'); bg.addColorStop(1, '#141018'); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
  g.fillStyle = '#4a3a2a'; g.fillRect(0, 76, W, 8); g.fillStyle = '#8a7454'; g.fillRect(0, 76, W, 1);
  ART.drawChampion(g, 34, 76, 1, { mode: 'walk', p: 0 }, 0);
  return { R: [c], L: [c], w: 40, h: 62 };
}
export function makeChampionHands(ctx) {
  let S = null, WORD = null, GAP = { open: false, want: false };
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'champion' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'champion';
  H.clear = () => { if (S && GAP.open) setGap(false, true); S = null; WORD = null; GAP = { open: false, want: false }; BOSS_PHASE.champion = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.acKeys = pp.acKeys || new Map(); if (pp.acKeys.size > 80) pp.acKeys.clear(); if (pp.acKeys.has(key)) return true; pp.acKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'champion' ? e : null; };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = ACM.newFight(ACM.geom(Ar, ctx.TS)); S.landedOn = []; BOSS_PHASE.champion = 1; WORD = null; GAP = { open: false, want: false };
    const e = { ...base, t: 'champion', w: CH.w, h: CH.h, hp: ctx.EHP.champion, maxHp: ctx.EHP.champion, noGrav: true, markH: CH.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.acKeys = null; return e; };

  /* ---------- THE LASHING: the hulls rock apart (the edge column of each hull, deck to waterline, opens) and come together again ---------- */
  function gapCells() { const C = S.G.cols, out = []; for (const x of [C.g0 - 1, C.g1 + 1]) for (let y = C.R; y <= C.R + 7; y++) out.push([x, y]); return out; }
  function setGap(open, force = false) { if (!S) return; const cells = gapCells();
    if (!open && !force) { /* close only once nobody stands in a column that is coming back */
      const busy = ctx.players.some(pp => !pp.dead && cells.some(([x, y]) => Math.floor(pp.x / ctx.TS) === x && Math.floor((pp.y - 1) / ctx.TS) >= y - 2 && Math.floor((pp.y - 1) / ctx.TS) <= y)) || (ctx.boss && cells.some(([x]) => Math.floor(ctx.boss.x / ctx.TS) === x));
      if (busy) { GAP.want = false; GAP.retry = true; return; } }
    for (const [x, y] of cells) ctx.cellSet(x, y, open ? 0 : ctx.grid0(x, y)); ctx.resolve(); GAP.open = open; GAP.retry = false;
    if (open) { ctx.number(S.G.gapMid, S.G.floorY - 60, 'THE HULLS ROCK APART', '#ff9a5c'); ctx.burst(S.G.gapMid, S.G.floorY, 16, ['#c9b27c', '#6a5a44', '#e8dcc0'], 90, 0.7, -30); }
    else ctx.number(S.G.gapMid, S.G.floorY - 60, 'TOGETHER AGAIN', '#c9b27c'); }

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, face: pp.face || 1, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, dodge: (pp.dodge || 0) > 0, holding: !!(pp.climb || pp.cling), pp }));
  function world(e) {
    const hitOne = (pp, bx, d, name, o) => { let any = false; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
        if (bx && !ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return; if (o.ground && !P.ground) return; if (keyed(pp, o.key || name)) return;
        const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, blow: name, unblockable: !o.blockable, noKnock: !!o.noKnock })); if (P.hp < hp0) { any = true;
          if (S.landedOn) { S.landedOn.push({ name, dx: R(P.x - e.x), dy: R(P.y - e.y), ground: !!P.ground, dodge: +(P.dodge || 0).toFixed(2), mode: e.mode, bot: S.botWhy || '' }); if (S.landedOn.length > 40) S.landedOn.shift(); } } }); return any; };
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { BOSS_PHASE.champion = ph; if (ctx.music) ctx.music(ph > 1 ? 'champion:p' + ph : 'champion'); },
      mark: m => ctx.number(e.x, e.y - CH.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      word: (ee, line, mode) => { WORD = { line, mode, t: ctx.time() }; },
      fx: (k, x, y) => {
        if (k === 'flat') { ctx.ring(x, y - 18, 34, '#ffd36b'); ctx.burst(x, y - 10, 22, ['#e8dcc0', '#9aa39a', '#ffd36b'], 120, 0.7, -40); }
        else if (k === 'ward') ctx.ring(x, y - 22, 36, '#9ab0c0');
        else if (k === 'land' || k === 'splinter') ctx.burst(x, y - 2, k === 'land' ? 20 : 14, ['#c9b27c', '#6a5a44', '#e8dcc0'], 110, 0.6, -60);
        else if (k === 'tear') ctx.burst(x, y - 30, 18, ['#5c5c66', '#8a4a2a', '#c9b27c'], 100, 0.7, -40); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) if (hitOne(pp, bx, d, name, o)) any = true; return any; },
      hook: (pp, d, name, key) => hitOne(pp, null, d, name, { key, noKnock: true }),
      drag: (pp, toX, v, dt) => ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; const dd = toX - P.x; P.vx = Math.sign(dd) * Math.min(v, Math.abs(dd) / Math.max(dt, 1 / 120)); }),
      /* THE TILT: the deck heels and you slide toward the lashing (walking against it holds you) */
      slide: (pp, dx) => { if (!pp.dead) pp.x = Math.max(S.G.x0 + 10, Math.min(S.G.x1 - 10, pp.x + dx)); },
      gap: open => { if (open) setGap(true); else { GAP.want = false; setGap(false); } },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 96, "THE ADMIRAL'S CHAMPION: THE FLEET'S LAST WORD", '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 130, 'HIS PLATE TURNS A BLADE. HIS OWN GUNS WILL PUT HIM DOWN', '#ffd36b'); }
    if (GAP.retry && S) setGap(false);
    ACM.stepChampion(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
    if (WORD && (!/Tell$/.test(e.mode) || ctx.time() - WORD.t > 2)) WORD = null;
  };
  /* A ROUND SHOT met him (src/main.js updateBalls): true = it is spent on him */
  H.onBall = (e, b) => { if (!S || !e || e.t !== 'champion') return false; const r = ACM.cannonHit(e, S, world(e)); if (r === 'air') return false; if (r === 'flat') { ctx.shake(7); ctx.hitstop && ctx.hitstop(0.12); } return true; };
  /* A BLOW ON HIM: never nothing (B15) - his plate CH.plate, his ward CH.ward, his recovery x1, stuck x CH.stuckMul, flat x CH.flatMul (one knockdown CH.flatCap of him at most) */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero();
    const r = ACM.takeAt(e, S);
    if (r.k <= 0) return 0;
    if (r.word) { S.n[S.ward > 0 ? 'warded' : 'plated']++; e.guardFx = 0.25; e.guardWord = r.word; ctx.turned(e, P.x, r.word, { stop: false }); }
    if (ACM.chFlat(e)) { const cap = e.maxHp * CH.flatCap, d = Math.min(dmg * r.k, Math.max(0, cap - S.taken)); S.taken += d;
      if (S.taken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 80, 'HE IS GETTING UP', '#9aa39a'); } return d; }
    ACM.landed(e, S); return dmg * r.k; };
  H.barName = e => "THE ADMIRAL'S CHAMPION" + (ACM.chFlat(e) ? '  KNOCKED FLAT' : ACM.chStuck(e) ? (e.mode === 'stuck' ? '  BLADE STUCK' : '  ANCHOR STUCK') : S && S.ward > 0 ? '  WARDED' : S && S.ph === 2 ? '  THE ANCHOR' : '');
  H.end = e => { if (S && e && e.t === 'champion' && (!e.alive || e.hp <= 0)) S.dead = { x: e.x, y: S.G.floorY, f: e.face || 1, t0: null, anchor: !!S.anchor };
    if (S) { S.hook = null; S.hooked = null; S.sweep = null; S.tilt = null; S.leap = null; if (GAP.open) setGap(false, true); } BOSS_PHASE.champion = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, open: ctx.boss ? ctx.boss.open : 0, gap: GAP.open, tilt: S.tilt ? { ...S.tilt } : null,
    hook: !!S.hook, hooked: !!S.hooked, leap: S.leap ? R(S.leap.x1) : null, anchor: !!S.anchor, hurt: { ...(S.hurt || {}) }, landedOn: (S.landedOn || []).slice(), G: S.G };

  /* ---------- DRAWING (GREYBOX: src/redraw/champion_art.js) ---------- */
  const TELL_T = { comboTell: CH.comboTell, slamTell: CH.slamTell, thrustTell: CH.thrustTell, leapTell: CH.leapTell, tearTell: CH.tearTell, sweepTell: CH.sweepTell, hookTell: CH.hookTell, tiltTell: CH.tiltTell, wake: 1.6 };
  const prog = e => { const T = TELL_T[e.mode]; return T ? Math.max(0, Math.min(1, 1 - Math.max(0, e.modeT) / T)) : 0; };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, flash = (e.hurtT || 0) > 0;
    g.globalAlpha = 0.3; g.fillStyle = '#04080a'; g.beginPath(); g.ellipse(x, R(S.G.floorY - cy), 22, 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    ART.drawChampion(g, x, y, f, { mode: e.mode, p: prog(e), flash, anchor: !!S.anchor && e.mode !== 'tearTell' }, time);
    if (e.mode === 'sleep') ctx.text('...', x + 10 * f, y - 70, '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; g.fillRect(x + f * 14 - 3, y - 54, 6, 22); }
  };
  H.drawDead = (g, cx, cy, time) => { if (!S || !S.dead) return; const D = S.dead; if (D.t0 === null) D.t0 = time; ART.drawDeadChampion(g, R(D.x - cx), R(D.y - cy), D.f, (time - D.t0) / 1.6, time, D.anchor); };
  /* THE LASHING, THE TILT, THE CHAIN, THE MARKS AND THE READ */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G, fy = R(G.floorY - cy);
    ART.drawLashing(g, R(G.gap[0] - cx) - (GAP.open ? 16 : 0), R(G.gap[1] - cx) + (GAP.open ? 16 : 0), fy, time, GAP.open);
    if (!ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'champion') return;
    if (S.tilt) { const [a, b] = G.hulls[S.tilt.hull]; ART.drawTilt(g, R(a - cx), R(b - cx), fy, S.tilt.dir, S.tilt.t / CH.tiltT, time); if (Math.floor(time * 4) % 2) ctx.text('THE DECK TILTS', R((a + b) / 2 - cx), fy - 70, '#ffd36b', 'center', 5); }
    if (S.hook) { const L = S.hook; ART.drawChain(g, R(e.x + (e.face || 1) * 14 - cx), R(e.y - 30 - cy), R(L.x - cx), R(L.y - cy), time, !!S.hooked); ART.drawAnchor(g, R(L.x - cx), R(L.y - cy), Math.atan2(L.uy, L.ux), 1); }
    if ((e.mode === 'slamTell' || e.mode === 'tiltTell') && S.slamX != null) ART.drawSlamMark(g, R(S.slamX - cx), fy, CH.slamFar - CH.slamNear, prog(e), time);
    if ((e.mode === 'leapTell' || e.mode === 'leap') && S.leap) { ART.drawLeapMark(g, R(S.leap.x1 - cx), fy, CH.landR, prog(e), time); if (Math.floor(time * 8) % 2) ctx.text('!!', R(S.leap.x1 - cx), fy - 40, '#ff6b6b', 'center', 7); }
    if (e.mode === 'sweepTell' || e.mode === 'sweep') { g.globalAlpha = e.mode === 'sweep' ? 0.5 : 0.18 + 0.2 * prog(e); g.strokeStyle = '#ff9a7a'; g.beginPath(); g.ellipse(R(e.x - cx), fy - 12, CH.sweepR, 8, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    if (S.sweep) { const ax = R(S.sweep.x - cx); ART.drawChain(g, R(e.x - cx), fy - 26, ax, fy - 10, time, true); ART.drawAnchor(g, ax, fy - 10, Math.PI / 2, 1.1); }   /* the anchor where it is on its pass (the bot reads S.sweep.x) */
    const x = R(e.x - cx), y = R(e.y - CH.h / 2 - cy), top = R(e.y - CH.h - cy);
    if (WORD && /Tell$/.test(e.mode)) ctx.text(WORD.line, x, top - 58, Math.floor(time * 6) % 2 ? '#ff9a7a' : '#ffffff', 'center', 5);
    if (ACM.chOpen(e)) { const T = ACM.chFlat(e) ? CH.flatT : e.mode === 'stuckA' ? CH.stuckAT : CH.stuckT, kk = Math.max(0, e.open / T);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 32, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = top - 30; ctx.text(ACM.chFlat(e) ? 'OPEN: FLAT' : 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 20, by, 40, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, by, R(40 * Math.min(1, kk)), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, top - 26, '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, top - 44 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
