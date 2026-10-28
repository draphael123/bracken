// src/admiral-hands.js - THE ADMIRAL's HANDS (claude/flotilla3, the greybox). src/flotilla-boss.js is the fight (pure: his plates, his two phases, his cycles, his blows,
// the pistol shots, the keg, the broadside's cells, the grapnel line, the list, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once
// a blow; a shield turns only the yellow cutlass and flurry), THE LIST's slide, THE LASHING's harbour (a hero who goes in is HAULED OUT, the Champion's rule kept),
// THE DECK GUNS' round shot on him (src/main.js updateBalls calls onBall: A PLATE BLOWN), a blow on his KEG (struck back at him) or on his GRAPNEL LINE (cut: he drops),
// every blow on him (take: the armour CHIPS - Daniel's approved 0.15x - and his plate holds him above AD.floor until the guns have it off), and the drawing (GREYBOX:
// src/redraw/admiral_art.js until the ART pass).
// THE SHARED READ (B10): OPEN = a gold ring and a timer bar (STAGGERED / RELOADING / SOAKED / THE AXE IN THE DECK / KNOCKED FLAT); WARDED = a grey ring and the word;
// a blow on his iron CLANKS, throws sparks and says IRON PLATE through src/boss-read.js - and still lands (never silent, never nothing).
// main.js calls: spawnBoss, owns, on, update, take, onBall, strike, drawBoss, drawOver, drawDead, barName, end, read, show, clear.
import * as ADM from './flotilla-boss.js';
import { canvas } from './px.js';
import * as ART from './redraw/admiral_art.js';
const { AD } = ADM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slash: s => (s.foeSlash || s.slash)(), slam: s => (s.whoosh || s.slash)(), open: s => (s.bell || s.clank)(),
  pistol: s => (s.gun || s.musket || s.crack || s.boom)(), fuse: s => (s.fuse || s.tell)(), boom: s => s.boom(), whistle: s => (s.whistle || s.tell)(true), gunports: s => (s.creak || s.clank)(),
  broadside: s => { s.boom(); (s.crack || s.boom)(); }, swing: s => (s.whoosh || s.pJump || s.tell)(), land: s => (s.thud || s.crack)(), snap: s => (s.crack || s.clank)(), splash: s => (s.splash || s.thud || s.crack)(),
  crunch: s => { (s.crack || s.clank)(); (s.stone || s.clank)(); s.clank(); }, flat: s => { (s.crack || s.clank)(); (s.thud || s.clank)(); }, clank: s => s.clank(), creak: s => (s.creak || s.crack || s.thud)() };

/* THE BESTIARY CARD: the Admiral on his quarterdeck at night, the cutlass grounded */
export function bakeAdmiralCard() {
  const W = 72, Hh = 84, [c, g] = canvas(W, Hh);
  const bg = g.createLinearGradient(0, 0, 0, Hh); bg.addColorStop(0, '#1a1a34'); bg.addColorStop(1, '#0c0a14'); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
  g.fillStyle = '#ffd36b'; g.fillRect(8, 14, 2, 2); g.fillRect(60, 20, 2, 2);   /* two lanterns */
  g.fillStyle = '#4a3a2a'; g.fillRect(0, 76, W, 8); g.fillStyle = '#8a7454'; g.fillRect(0, 76, W, 1);
  ART.drawAdmiralCard(g, 36, 76, 1, 0.3);
  return { R: [c], L: [c], w: 40, h: 56 };
}
export function makeAdmiralHands(ctx) {
  const splashes = [], falls = [];
  let S = null, WORD = null, LIST = false;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'admiral' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'admiral';
  H.clear = () => { S = null; WORD = null; LIST = false; splashes.length = 0; falls.length = 0; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.adKeys = pp.adKeys || new Map(); if (pp.adKeys.size > 80) pp.adKeys.clear(); if (pp.adKeys.has(key)) return true; pp.adKeys.set(key, 1); return false; };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = ADM.newFight(ADM.geom(Ar, ctx.TS)); S.landedOn = []; WORD = null; LIST = false;
    const e = { ...base, t: 'admiral', w: AD.w, h: AD.h, hp: ctx.EHP.admiral, maxHp: ctx.EHP.admiral, noGrav: true, markH: AD.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, plates: AD.plates };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.adKeys = null; return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, face: pp.face || 1, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, dodge: (pp.dodge || 0) > 0, holding: !!(pp.climb || pp.cling), pp }));
  function world(e) {
    const hitOne = (pp, bx, d, name, o) => { let any = false; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
        if (bx && !ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return; if (o.ground && !P.ground) return; if (keyed(pp, o.key || name)) return;
        const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d * ADM.tuneOf(ctx.heroId && ctx.heroId()).in, { who: e, name, blow: name, unblockable: !o.blockable, noKnock: !!o.shove }));
        if (P.hp < hp0) { any = true;
          if (o.shove && !P.dead) { const k = ADM.hullOf(S.G, P.x), [a, b] = S.G.hulls[k]; P.vx = (k === 0 ? -1 : 1) * 150; if (P.x < a + 20 || P.x > b - 20) P.vx = 0; }   /* the broadside's shove: ALONG the deck, away from the lashing - never overboard (review Q3) */
          if (S.landedOn) { S.landedOn.push({ name, dx: R(P.x - e.x), dy: R(P.y - e.y), ground: !!P.ground, dodge: +(P.dodge || 0).toFixed(2), mode: e.mode, bot: S.botWhy || '' }); if (S.landedOn.length > 40) S.landedOn.shift(); } } }); return any; };
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { if (ctx.music) ctx.music('admiral'); },
      mark: m => ctx.number(e.x, e.y - AD.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      word: (ee, line, mode) => { WORD = { line, mode, t: ctx.time() }; },
      fx: (k, x, y, w) => {
        if (k === 'plate') { falls.push({ x, y, which: w, t: ctx.time() }); ctx.ring(x, y - 22, 36, '#ffd36b'); ctx.burst(x, y - 22, 26, ['#a8aeb8', '#4a4e58', '#ffd36b', '#fff6c8'], 150, 0.7, -40); ctx.hitstop && ctx.hitstop(0.12); }
        else if (k === 'flat') { ctx.ring(x, y - 16, 32, '#ffd36b'); ctx.burst(x, y - 10, 20, ['#e8dcc0', '#6a1c1e', '#ffd36b'], 120, 0.7, -40); }
        else if (k === 'ward') ctx.ring(x, y - 20, 34, '#9ab0c0');
        else if (k === 'land' || k === 'splinter') ctx.burst(x, y - 2, k === 'land' ? 18 : 14, ['#c9b27c', '#6a5a44', '#e8dcc0'], 110, 0.6, -60);
        else if (k === 'blast') { ctx.ring(x, y - 8, AD.kegR + 8, '#ff9a5c'); ctx.burst(x, y - 8, 26, ['#ffd36b', '#ff9a5c', '#c9463d', '#3a3a44'], 160, 0.9, 120); }
        else if (k === 'volley') ctx.burst(x, y - 4, 16, ['#ffd36b', '#9aa39a', '#e8dcc0', '#3a3a44'], 140, 0.6, -80);
        else if (k === 'splash') { splashes.push({ x, hx: x, t: ctx.time() }); ctx.burst(x, y, 14, ['#bfe6f5', '#dff2f8', '#7a8a3a'], 110, 0.6, -90); }
        else if (k === 'snap') ctx.burst(x, y, 10, ['#c9b27c', '#e8dcc0'], 90, 0.5, -20);
        else if (k === 'muzzle') ctx.burst(x, y, 8, ['#fff6c8', '#ffd36b', '#9aa39a'], 90, 0.3, -10);
        else if (k === 'list') ctx.burst(x, y - 20, 18, ['#4a4e58', '#a8aeb8', '#6a1c1e'], 120, 0.7, -40); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) if (hitOne(pp, bx, d, name, o)) any = true; return any; },
      slide: (pp, dx) => { if (!pp.dead) pp.x = Math.max(S.G.x0 + 10, Math.min(S.G.x1 - 10, pp.x + dx)); },
      list: on => { LIST = !!on; },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 90, ADM.AD_SAY.woke, '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 128, ADM.AD_SAY.rule, '#ffd36b'); }
    /* THE HARBOUR IN THE LASHING (A10): a hero who goes in costs the hazard's share of his health and is HAULED OUT onto the deck he fell from (the Champion's rule, kept) */
    for (const pp of ctx.players) { if (pp.dead || !(pp.y > S.G.floorY + 20) || pp.x < S.G.gap[0] - 20 || pp.x > S.G.gap[1] + 20) continue;
      const k = pp.x < S.G.gapMid ? 0 : 1, to = k === 0 ? S.G.gap[0] - 34 : S.G.gap[1] + 34;
      splashes.push({ x: pp.x, hx: to, t: ctx.time() }); ctx.hazard(pp, to, S.G.floorY); S.n.hauled++; ctx.number(to, S.G.floorY - 40, ADM.AD_SAY.hauled, '#bfe6f5'); }
    ADM.stepAdmiral(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
    if (WORD && (!/Tell$/.test(e.mode) || ctx.time() - WORD.t > 2)) WORD = null;
  };
  /* A ROUND SHOT met him (src/main.js updateBalls): true = it is spent on him */
  H.onBall = (e, b) => { if (!S || !e || e.t !== 'admiral') return false; const r = ADM.blowPlate(e, S, world(e), 'gun', b.vx || 0); if (r === 'air') return false;
    if (r === 'plate' || r === 'flat') { ctx.shake(7); for (const gn of ctx.props()) if (gn.t === 'cannon' && gn.deck && gn.x > S.G.x0 - 16 && gn.x < S.G.x1 + 16) gn.cool = Math.max(gn.cool || 0, AD.gunHot);
      if (!S.told.hot) { S.told.hot = 1; ctx.number(e.x, e.y - 92, ADM.AD_SAY.hot, '#9aa39a'); } }
    return true; };
  /* A HERO'S BLOW across the deck: on his KEG it strikes it back at him; on his GRAPNEL LINE it cuts it */
  H.strike = hb => { if (!S || !hb || !A()) return; const P = ctx.hero(), e = ctx.boss; if (!e || e.t !== 'admiral' || !e.alive) return;
    const K = S.keg; if (K && !K.back && !K.wet && ctx.overlap(hb, { l: K.x - 8, r: K.x + 8, t: K.y - 14, b: K.y }) && !(P.hitSet && P.hitSet.has(K))) { if (P.hitSet) P.hitSet.add(K);
      ADM.kegStruck(S, Math.sign(e.x - K.x) || -(P.face || 1), world(e)); ctx.sparks && ctx.sparks(K.x, K.y - 8, P.face || 1, 6); }
    const L = ADM.lineOf(e, S); if (L) { for (let i = 0; i <= 12; i++) { const x = L[0] + (L[2] - L[0]) * i / 12, y = L[1] + (L[3] - L[1]) * i / 12; if (x >= hb.l && x <= hb.r && y >= hb.t && y <= hb.b) { ADM.cutLine(e, S, world(e)); break; } } } };
  /* A BLOW ON HIM: never nothing (B15; the armour chip is Daniel's approved exception) - a blow on his line while he swings CUTS it */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero();
    if (e.mode === 'swing' && blow) ADM.cutLine(e, S, world(e));
    const r = ADM.takeAt(e, S), tn = ADM.tuneOf(ctx.heroId && ctx.heroId()).out; dmg *= tn;
    if (r.k <= 0) return 0;
    if (r.word && blow) { S.n[S.ward > 0 ? 'warded' : 'chipped']++; e.guardFx = 0.25; e.guardWord = r.word; ctx.turned(e, P.x, r.word, { stop: false }); if (r.word === 'IRON PLATE' && ctx.sparks) ctx.sparks(e.x, e.y - 24, -(Math.sign(e.x - P.x) || 1), 8); }
    let d = dmg * r.k;
    if (ADM.adFlat(e)) { const cap = e.maxHp * AD.flatCap; d = Math.min(d, Math.max(0, cap - S.taken)); S.taken += d; if (S.taken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 76, ADM.AD_SAY.getting, '#9aa39a'); } }
    /* HIS PLATE HOLDS: armoured, nothing takes him under AD.floor (the guns are the way in) */
    const fl = ADM.floorHp(e, S); if (fl > 0 && e.hp - d < fl) { d = Math.max(0, e.hp - fl); S.n.held++; if (ctx.time() - (S.floorHeld || 0) > 2.5) { S.floorHeld = ctx.time(); ctx.number(e.x, e.y - 84, ADM.AD_SAY.held, '#ffd36b'); } }
    ADM.landed(e, S); return d; };
  H.barName = e => 'THE ADMIRAL' + (e.mode === 'stagger' && e.open > 0 ? '  STAGGERED' : e.mode === 'reload' && e.open > 0 ? '  RELOADING' : e.mode === 'soaked' && e.open > 0 ? '  SOAKED' : e.mode === 'axeStuck' && e.open > 0 ? '  AXE STUCK' : ADM.adFlat(e) ? '  KNOCKED FLAT'
    : S && S.ward > 0 ? '  WARDED' : S && S.plates > 0 ? '  IRON x' + S.plates : '  BARE');
  H.end = e => { if (S && e && e.t === 'admiral' && (!e.alive || e.hp <= 0)) S.dead = { x: e.x, y: S.G.floorY, f: e.face || 1, t0: null };
    if (S) { S.shots = []; S.keg = null; S.lanes = null; S.swing = null; S.list = false; } LIST = false; };
  H.read = () => S && { why: S.botWhy, mode: ctx.boss && ctx.boss.mode, ph: S.ph, plates: S.plates, off: S.off.slice(), cycle: S.cycle, n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, open: ctx.boss ? ctx.boss.open : 0,
    keg: S.keg ? { x: R(S.keg.x), back: S.keg.back, fuse: +S.keg.fuse.toFixed(2) } : null, lanes: S.lanes ? { hit: S.lanes.hit.slice(), fired: S.lanes.fired } : null, swing: S.swing ? R(S.swing.x1) : null, list: S.list,
    shots: S.shots.length, hurt: { ...(S.hurt || {}) }, landedOn: (S.landedOn || []).slice(), G: S.G };

  /* ---------- DRAWING (GREYBOX: src/redraw/admiral_art.js) ---------- */
  const TELL_T = { cutTell: AD.cutTell, pistolTell: AD.pistolTell, pistol2Tell: AD.pistol2Tell, kegTell: AD.kegTell, whistleTell: AD.whistleTell, grapTell: AD.grapTell, listTell: AD.listTell, flurryTell: AD.flurryTell, axeTell: AD.axeTell, wake: 1.6,
    cut: AD.cutT, cutRec: AD.cutRec, kegRec: AD.kegRec, whistleRec: AD.laneT + AD.whistleRec, swing: AD.swingT, landRec: AD.landRec, flurry: AD.flurryT, flurryGap: AD.flurryNext, axe: AD.axeSwingT, axeRec: AD.axeRec,
    reload: AD.reloadT, stagger: AD.staggerT, soaked: AD.soakedT, axeStuck: AD.axeT, flat: AD.flatT, climb: 1.0 };
  const prog = e => { const T = TELL_T[e.mode]; return T ? Math.max(0, Math.min(1, 1 - Math.max(0, e.modeT) / T)) : 0; };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, flash = (e.hurtT || 0) > 0;
    if (!ADM.airborne(e)) { g.globalAlpha = 0.3; g.fillStyle = '#04080a'; g.beginPath(); g.ellipse(x, R(S.G.floorY - cy), 18, 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    ART.drawAdmiral(g, x, y, f, { mode: e.mode, p: prog(e), flash, ward: S.ward > 0 ? S.ward : 0, off: S.off }, time);
    if (e.mode === 'sleep') ctx.text('...', x + 10 * f, y - 62, '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; g.fillRect(x + f * 12 - 3, y - 46, 6, 20); }
  };
  H.drawDead = (g, cx, cy, time) => { if (!S || !S.dead) return; const D = S.dead; if (D.t0 === null) D.t0 = time; ART.drawDeadAdmiral(g, R(D.x - cx), R(D.y - cy), D.f, Math.min(1, (time - D.t0) / 1.6), time); };
  /* THE YARD, THE LINE, THE KEG, THE SHOTS, THE CELLS, THE LIST, THE PLATES FALLING, THE MARKS AND THE READ */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G, fy = R(G.floorY - cy);
    ART.drawYard(g, R(G.yard.x - cx), R(G.yard.y - cy), time);
    ART.drawLanterns(g, [G.x0 + 12 * ctx.TS + 8, G.x0 + 36 * ctx.TS + 8, G.yard.x - 66, G.yard.x + 66].map(x => R(x - cx)), R(G.floorY - cy - 84), time);   /* the lashings at nightfall: ship's lanterns on her masts and the yard's ends */
    if (S.dead && S.dead.t0 !== null) ART.drawEnsign(g, R(G.x1 - cx) - 26, fy, Math.min(1, (time - S.dead.t0) / 3), time);   /* her colours come down */
    for (let i = splashes.length - 1; i >= 0; i--) { const k = (time - splashes[i].t) / 0.9; if (k > 1 || k < 0) { splashes.splice(i, 1); continue; } g.globalAlpha = 1 - k; g.fillStyle = '#dff2f8'; g.fillRect(R(splashes[i].x - cx) - 6, fy + 4 - R(k * 14), 12, 2); g.globalAlpha = 1; }
    for (let i = falls.length - 1; i >= 0; i--) { const k = (time - falls[i].t) / 1.1; if (k > 1 || k < 0) { falls.splice(i, 1); continue; } ART.drawPlateFall(g, R(falls[i].x - cx), R(falls[i].y - cy), k, falls[i].which); }
    if (S.list) ART.drawList(g, R(G.hulls[1][0] - cx), R(G.hulls[1][1] - cx), fy, time);
    if (S.lanes) ART.drawCells(g, S.cells, S.lanes.hit, fy, 1 - Math.max(0, S.lanes.t) / (AD.whistleTell + AD.laneT), S.lanes.fired, time, cx);
    if (S.keg) ART.drawKeg(g, R(S.keg.x - cx), R(S.keg.y - cy), S.keg.fuse, AD.kegFuse, time, S.keg.back);
    for (const s of S.shots) ART.drawShot(g, R(s.x - cx), R(s.y - cy));
    if (!ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'admiral') return;
    const L = ADM.lineOf(e, S); if (L) ART.drawLine(g, R(L[0] - cx), R(L[1] - cy), R(L[2] - cx), R(L[3] - cy));
    if (e.mode === 'grapTell' && S.swing) { ART.drawLine(g, R(G.yard.x - cx), R(G.yard.y - cy), R(e.x - cx), R(e.y - 44 - cy)); }
    if ((e.mode === 'grapTell' || e.mode === 'swing') && S.swing) { ART.drawLandMark(g, R(S.swing.x1 - cx), fy, AD.landR, prog(e), time); if (Math.floor(time * 8) % 2) ctx.text('!!', R(S.swing.x1 - cx), fy - 40, '#ff6b6b', 'center', 7); }
    if (e.mode === 'pistolTell' || e.mode === 'pistol2Tell') { const f = e.face || 1; ART.drawAim(g, R(e.x + f * 16 - cx), R(S.aimY - cy), R(e.x + f * 300 - cx), e.modeT <= AD.pistolLock, time); }
    if (e.mode === 'axeTell' && S.axeX != null) { g.globalAlpha = 0.3 + 0.4 * prog(e); g.fillStyle = '#ff6b6b'; g.fillRect(R(S.axeX - cx) - 22, fy - 2, 44, 2); g.globalAlpha = 1; }
    const x = R(e.x - cx), y = R(e.y - AD.h / 2 - cy), top = R(e.y - AD.h - cy);
    if (WORD && /Tell$/.test(e.mode)) ctx.text(WORD.line, x, top - 56, Math.floor(time * 6) % 2 ? '#ff9a7a' : '#ffffff', 'center', 5);
    if (ADM.adOpen(e)) { const T = TELL_T[e.mode] || 2, kk = Math.max(0, e.open / T);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = top - 30; ctx.text(e.mode === 'reload' ? 'OPEN: RELOADING' : e.mode === 'stagger' ? 'OPEN: STAGGERED' : ADM.adFlat(e) ? 'OPEN: FLAT' : 'OPEN', x, by - 6, '#ffd36b', 'center', 6);
      g.fillStyle = '#1b1626'; g.fillRect(x - 20, by, 40, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, by, R(40 * Math.min(1, kk)), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 32, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, top - 26, '#c8d8e8', 'center', 5); }
    /* HIS IRON: three pips over him, one per plate still on (the rule's state, drawn - A3) */
    if (S.plates > 0 && !ADM.adOpen(e)) for (let i = 0; i < 3; i++) { const on = !S.off.includes(i); g.fillStyle = on ? '#7a808e' : '#2a2c34'; g.fillRect(x - 10 + i * 8, top - 14, 6, 4); if (on) { g.fillStyle = '#a8aeb8'; g.fillRect(x - 10 + i * 8, top - 14, 6, 1); } }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, top - 42 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
