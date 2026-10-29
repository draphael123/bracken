// src/bzchief-hands.js - THE BERSERKER CHIEFTAIN's HANDS (claude/warcairn, the OPUS GREYBOX). src/bzchief.js is the fight (pure: his phases, cycles, rage, frenzy, the beat
// rule, the openings, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow; a shield turns only the yellow ones), the WAR CAIRN RING's
// two drums (src/war-cairn-hands.js strikes them: a hero's beat comes here as onBeat; he takes one in P3: ctx.takeDrum), the outer slabs his ground-splitter cracks
// (ctx.cellSet: broken = rubble spikes, the ring narrows), and the GREYBOX drawing over his body (his body is the hero's own sheet: main.js SPR.bzchief, the generic enemy
// draw x BZC.scale, frame = bzcFrame): his RAGE bar under his health bar (main.js reads rageOf), the hatchet in flight / in the floor, the split, the marks, the B10 read.
// THE SHARED READ (B10): OPEN = a gold ring and a timer bar (HE LOSES THE BEAT / HIS AXES ARE IN THE STONE); WARDED = a pale shell ring and the word; TAKE IT = the crossed
// axes flare and the word names the answer - never silent.
// main.js calls: spawnBoss, owns, on, update, take, frame, drawOver, barName, rageOf, end, read, show, clear, onBeat, drums.
import * as WCW from './redraw/warcairn_world_art.js';   /* (claude/warcairnart) his hatchet and crossed axes, drawn */
import * as BZM from './bzchief.js';
import { BOSS_PHASE } from './boss-music.js';
const { BZC } = BZM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slam: s => (s.heavy || s.slash)(), slash: s => (s.slash || s.heavy)(), growl: s => (s.growl || s.roar || s.tell)(false),
  roar: s => (s.roar || s.boreRoar || s.tell)(), leap: s => (s.pJump || s.whoosh || s.slash)(), crack: s => (s.crack || s.clank)(), throw: s => (s.throwWhoosh || s.whoosh || s.slash)(), clank: s => (s.clank || s.tell)() };

export function makeBzChiefHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'bzchief' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'bzchief';
  H.clear = () => { if (S) restoreSlabs(); S = null; BOSS_PHASE.bzchief = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.bzcKeys = pp.bzcKeys || new Map(); if (pp.bzcKeys.size > 80) pp.bzcKeys.clear(); if (pp.bzcKeys.has(key)) return true; pp.bzcKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'bzchief' ? e : null; };
  /* THE OUTER SLABS: cracked (drawn), broken (rubble spikes: the ring narrows) - put back whole on a reset */
  function setSlab(i, state) { if (!S) return; const sl = S.G.slabs[i]; if (!sl) return; if (state >= 2) for (let x = sl.c0; x <= sl.c1; x++) ctx.cellSet(x, sl.row - 1, ctx.T.SPIKE);
    if (state >= 2) ctx.burst((sl.x0 + sl.x1) / 2, S.G.floorY - 6, 16, ['#8a8478', '#5a564e', '#c8c0b0'], 90, 0.6); }
  function restoreSlabs() { if (!S || !S.G) return; for (const sl of S.G.slabs) for (let x = sl.c0; x <= sl.c1; x++) if (ctx.tileAt(x, sl.row - 1) === ctx.T.SPIKE) ctx.cellSet(x, sl.row - 1, ctx.T.AIR); }

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    if (S) restoreSlabs();
    S = BZM.newFight(BZM.geom(Ar, ctx.TS)); BOSS_PHASE.bzchief = 1;
    const hpK = (BZC.heroHp && ctx.heroT && BZC.heroHp[ctx.heroT()]) || 1, hp = Math.round(ctx.EHP.bzchief * hpK);
    const e = { ...base, t: 'bzchief', w: BZC.w, h: BZC.h, hp, maxHp: hp, noGrav: true, markH: BZC.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, vx: 0, bzRage: 0 };
    e.y = S.G.floorY; for (const pp of ctx.players) pp.bzcKeys = null; return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    return {
      time: () => ctx.time(),
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.bzchief = ph; },
      mark: m => ctx.number(e.x, e.y - BZC.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      mend: n => { if (e.alive && e.hp < e.maxHp) { const h0 = e.hp; e.hp = Math.min(e.maxHp, e.hp + n); ctx.number(e.x, e.y - 74, '+' + R(e.hp - h0), '#ff9a5c'); } },
      drums: k => { if (ctx.drumsAnswer) ctx.drumsAnswer(k); },
      drumsAt: () => H.drums(),
      takeDrum: id => { if (ctx.takeDrum) ctx.takeDrum(id); },
      crack: (i, st) => { setSlab(i, st); ctx.shake(st >= 2 ? 4 : 2); },
      fx: (k, x, y) => {
        if (k === 'open') { ctx.ring(x, y - 22, 34, '#ffd36b'); ctx.burst(x, y - 30, 14, ['#ffd36b', '#fff6c8', '#c8281e'], 80, 0.5); }
        else if (k === 'ward') ctx.ring(x, y - 22, 38, '#c8b8a8');
        else if (k === 'frenzy') { ctx.ring(x, y - 22, 46, '#ff4a3a'); ctx.burst(x, y - 30, 18, ['#ff4a3a', '#ff9a5c', '#fff6c8'], 100, 0.6); }
        else if (k === 'stuck') { ctx.ring(x, y - 4, 18, '#ffd36b'); ctx.dust(x, y, 10); }
        else if (k === 'chop' || k === 'split') { ctx.dust(x, y, k === 'split' ? 16 : 8); ctx.burst(x, y - 4, 10, ['#8a8478', '#c8c0b0'], 70, 0.4); } },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp, dk = (BZC.heroDmg && ctx.heroT && BZC.heroDmg[ctx.heroT()]) || 1; let res; hurt(name, () => { res = ctx.damagePlayer(e.x, Math.round(d * dk), { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }); }); if (P.hp < hp0) any = true;
          if (o.blockable && (res === 'blocked' || (ctx.answered && ctx.answered(res)))) BZM.blowTurned(e, S, world(e), !!(ctx.answered && ctx.answered(res))); }); return any; },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 90, BZM.BZC_SAY.wake, '#ff9a5c'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 130, BZM.BZC_SAY.rule, '#ffd36b'); }
    BZM.stepChief(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
  };
  /* A BEAT on one of the ring's drums (src/war-cairn-hands.js, by a hero) */
  H.onBeat = (id, by) => { const e = live(); if (!S || !e || !ctx.bossActive) return 'idle'; const r = BZM.beatOn(e, S, world(e), id, by); if (r === 'break') S.broke = { t: ctx.time() }; return r; };
  /* the ring's drums, as the fight and the bot read them */
  H.drums = () => { const ds = ctx.arenaDrums ? ctx.arenaDrums() : []; return ds.map(d => ({ ...d, his: !!(S && S.hisDrum === d.id) })); };
  /* A BLOW ON HIM: src/bzchief.js blowOn - TAKE IT turns the front (x0.4, feeds him; a heavy or a plunge breaks it), walking x0.7, committed whole, open x2 / x1.5 */
  H.take = (e, dmg, blow, tag) => { if (!S) return dmg; const P = ctx.hero(), t = ctx.time();
    const heavy = !!(ctx.blowHas && (ctx.blowHas(tag, 'heavy') || ctx.blowHas(tag, 'plunge'))) || !!(P && P.heavy);
    const r = BZM.blowOn(e, S, world(e), dmg, heavy, P ? P.x : e.x);
    if (r.read === 'parry') { if (P && ctx.shove) ctx.shove(P, Math.sign(P.x - e.x) || 1); e.guardFx = 0.25; e.guardWord = 'PARRIED'; return r.dmg; }
    if (r.read === 'take') { e.guardFx = 0.25; e.guardWord = S.n.takenOn < 6 ? ['HE TAKES IT', 'A HEAVY BLOW BREAKS IT'][S.n.takenOn % 2] : 'HE TAKES IT'; ctx.sfx.clank && ctx.sfx.clank();
      ctx.sparks(e.x + (Math.sign((P ? P.x : e.x) - e.x) || 1) * 12, e.y - 22, Math.sign((P ? P.x : e.x) - e.x) || 1, 5); return r.dmg; }
    if (r.read === 'ward') { e.guardFx = 0.2; e.guardWord = 'WARDED'; return r.dmg; }
    if (r.read === 'walk') { e.guardFx = 0.12; e.guardWord = ''; return r.dmg; }
    e.angleHit = t;   /* (a blow while he is committed or open is the right blow: not greed - src/main.js greedHit) */
    return r.dmg; };
  H.frame = e => BZM.bzcFrame(e);
  H.barName = e => 'THE BERSERKER CHIEFTAIN' + (BZM.bzcOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : S && S.frenzy > 0 ? '  FRENZY' : '');
  H.rageOf = () => (S ? { rage: S.rage / BZC.rage.max, frenzy: S.frenzy / BZC.frenzy.t, locked: S.ph < 2 } : null);
  H.end = e => { if (S) { S.waves = []; S.axe = null; } if (e) { e.mode = 'yield'; } BOSS_PHASE.bzchief = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, rage: R(S.rage), frenzy: +S.frenzy.toFixed(2), ward: +S.ward.toFixed(2), oneHand: S.oneHand, hisDrum: S.hisDrum,
    cracked: S.cracked.slice(), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (flat shapes over the hero's own sheet; the clan art is src/redraw/warcairn_clan_art.js) ---------- */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'bzchief') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', fy = R(G.floorY - cy), x = R(e.x - cx), y = R(e.y - cy), m = e.mode, f = e.face || 1;
    /* THE CRACKED SLABS: a dark seam across each cracked one (a broken one is rubble: the tiles) */
    for (const sl of G.slabs) { const st = S.cracked[sl.i]; if (st !== 1) continue; g.fillStyle = '#2a2622'; for (let k = 0; k < 6; k++) g.fillRect(R(sl.x0 - cx) + 6 + k * 9, fy + ((k * 3) % 4), 6, 1); }
    /* THE HATCHET: in flight (spinning), or standing in the floor */
    if (S.axe) { const ax = R(S.axe.x - cx), ay = R(S.axe.y - cy); WCW.chiefHatchet(g, ax, ay, time, !!S.axe.fly); if (!S.axe.fly && S.oneHand) ctx.text('HIS HATCHET', ax, ay - 20, '#ffd36b', 'center', 5); }
    /* THE SPLIT running the floor */
    for (const w of S.waves) { g.fillStyle = '#c8c0b0'; g.fillRect(R(w.x - cx) - 3, fy - 10, 6, 10); g.fillStyle = '#ff6b3c'; g.fillRect(R(w.x - cx) - 1, fy - 12, 2, 3); }
    /* THE POUNCE: where he will land (the coil) */
    if (m === 'coil' && S.leapX != null) { g.strokeStyle = blink; g.beginPath(); g.moveTo(R(S.leapX - cx) - 10, fy - 2); g.lineTo(R(S.leapX - cx) + 10, fy - 2); g.stroke(); }
    /* TAKE IT: the crossed axes flare over him */
    if (m === 'take') { WCW.crossedAxes(g, x + f * 6, y - 32, e.takeHitT > 0, time);
      ctx.text('TAKE IT', x, y - 78, '#ff9a5c', 'center', 6); }
    if (m === 'warcry') ctx.text('WAR CRY', x, y - 78, '#ff6b6b', 'center', 6);
    if (m === 'drumWalk') ctx.text('TO THE DRUM', x, y - 78, '#ff6b6b', 'center', 6);
    if (m === 'splitTell') ctx.text('GROUND-SPLITTER', x, y - 78, '#ff6b6b', 'center', 6);
    if (m === 'sleep') ctx.text('Z', x + 8 * f, y - 56 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
    /* HIS FRENZY: a red haze on him */
    if (S.frenzy > 0) { g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 14); g.fillStyle = '#ff2a1a'; g.fillRect(x - 12, y - 44, 24, 44); g.globalAlpha = 1; }
    if (e.guardFx > 0) e.guardFx = Math.max(0, e.guardFx - 1 / 60);
    /* HIS RAGE: a red bar over him (main.js draws it under his health bar too) */
    const by = R(e.y - BZC.h * BZC.scale - 14 - cy), bx = Math.max(40, Math.min(ctx.VW() - 40, x));
    g.fillStyle = '#1b1626'; g.fillRect(bx - 18, by, 36, 3); g.fillStyle = S.frenzy > 0 ? (Math.floor(time * 10) % 2 ? '#ff4a3a' : '#ffd36b') : S.ph < 2 ? '#8a3a32' : '#e0322a';
    g.fillRect(bx - 18, by, R(36 * (S.frenzy > 0 ? S.frenzy / BZC.frenzy.t : S.rage / BZC.rage.max)), 3);
    /* THE READ (B10) */
    const yy = R(e.y - BZC.h * BZC.scale / 2 - cy);
    if (BZM.bzcOpen(e)) { const kk = Math.max(0, e.open / (m === 'stuck' ? BZC.stuck.t : BZC.open.t));
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 28, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text(m === 'stuck' ? 'STUCK' : 'HE LOSES THE BEAT', x, by - 10, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by - 5, 36, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 18, by - 5, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8b8a8'; g.lineWidth = 2; g.beginPath(); g.arc(x, yy, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, by - 10, '#c8b8a8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, by - 20 - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
