// src/hawk-mistress-hands.js - THE HAWK-MISTRESS's HANDS (claude/ksar, the greybox). src/hawk-mistress.js is the fight (pure: her three phases, her cycles,
// the hawk, her openings, the bot's reading); this binds it to the world: her told blows on the heroes (keyed once a blow; a shield turns only the yellow
// ones), THE COURTYARD's GONGS (the level's: src/ksar-hands.js rings and cuts them and tells her when a hero rings one - onRing), THE FLASKS (a flash in
// reach of her hawk - onFlash), her GUARD (phase two: a runner rings a gong, a door opens, a blade comes down), the burning store (phase three: the fire at
// the yard's ends, the roof ledges crumbling), and the drawing (GREYBOX shapes until the art pass).
// THE SHARED READ (design standard B10): OPEN = a gold ring round her and a timer bar; WARDED = a pale shell ring and the word; HER GAUNTLET = a turned
// blow CLANKS, flashes and says HER GAUNTLET: GO ROUND / HIT HIGH (the first times) - never silent.
// main.js calls: spawnBoss, owns, on, update, take, drawBack, drawBoss, drawOver, barName, end, read, show, clear, onRing, onFlash, hawk.
import * as HMM from './hawk-mistress.js';
import { BOSS_PHASE } from './boss-music.js';
const { HM } = HMM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), lash: s => (s.whip || s.slash)(), slash: s => (s.foeSlash || s.slash)(),
  hawk: s => (s.hawk || s.hiss)(), whistle: s => (s.whistle || s.bell || s.tell)(false), blast: s => (s.boom || s.crack)() };

export function makeHawkMistressHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'hawkmistress' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'hawkmistress';
  H.clear = () => { S = null; BOSS_PHASE.hawkmistress = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.hmKeys = pp.hmKeys || new Map(); if (pp.hmKeys.size > 80) pp.hmKeys.clear(); if (pp.hmKeys.has(key)) return true; pp.hmKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'hawkmistress' ? e : null; };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = HMM.newFight(HMM.geom(Ar, ctx.TS)); BOSS_PHASE.hawkmistress = 1;
    const e = { ...base, t: 'hawkmistress', w: HM.w, h: HM.h, hp: ctx.EHP.hawkmistress, maxHp: ctx.EHP.hawkmistress, noGrav: true, markH: HM.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.y = S.G.floorY; S.hawk.x = e.x; S.hawk.y = S.G.floorY - HM.hawkAlt; for (const pp of ctx.players) pp.hmKeys = null; return e; };

  /* ---------- THE WORLD AS SHE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, air: !pp.ground && !pp.climb, alive: ctx.upright(pp) && !pp.dead, pp }));
  const gongs = () => (ctx.gongs ? ctx.gongs() : []).filter(g => g.arena).map(g => ({ id: g.id, x: g.x * ctx.TS + 8, cut: g.cut, hum: g.hum }));
  const racks = () => (ctx.racks ? ctx.racks() : []).filter(s => s.arena).map(s => ({ id: s.id, x: s.x * ctx.TS + 8, n: s.left }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { BOSS_PHASE.hawkmistress = ph; if (ctx.music) ctx.music(ph > 1 ? 'hawkmistress:p' + ph : 'hawkmistress'); },
      mark: m => ctx.number(e.x, e.y - HM.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => {
        if (k === 'land') ctx.burst(x, y - 4, 10, ['#c8a070', '#8a6a3a', '#e0c090'], 70, 0.5);
        else if (k === 'crack') ctx.burst(x, y - 10, 8, ['#e8d0a0', '#8a5a32'], 60, 0.4);
        else if (k === 'feint') ctx.dust(x, y, 3);
        else if (k === 'flash') { ctx.burst(x, y, 30, ['#ffffff', '#fff6c8', '#e8f4ff'], 140, 0.6); S.flashFx = 0.4; }
        else if (k === 'open') ctx.ring(x, y - 16, 30, '#ffd36b');
        else if (k === 'ward') ctx.ring(x, y - 16, 34, '#9ab0c0');
        else if (k === 'mark') ctx.ring(x, y - 4, HM.diveR, '#ff6b6b'); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock })); if (P.hp < hp0) any = true; }); return any; },
      gongs, guards: () => ctx.enemies().filter(q => q.alive && q.hmGuard).length,
      guardRing: id => { const r = ctx.ringGong ? ctx.ringGong(id, 'guard') : 'cut'; if (r !== 'rung') return false;
        const G = S.G, g = gongs().find(q => q.id === id), door = G.doors.slice().sort((a, b) => Math.abs(a - (g ? g.x : 0)) - Math.abs(b - (g ? g.x : 0)))[0];
        const b = ctx.spawnGuard(door, G.floorY); if (b) { b.hmGuard = true; ctx.burst(door, G.floorY - 12, 8, ['#a8302a', '#5a1e1e'], 40, 0.5); if (!S.told.guard) { S.told.guard = 1; ctx.number(door, G.floorY - 50, 'THE GONG CALLS HER GUARD DOWN', '#ff9a5c'); } } return !!b; },
      crumble: () => { /* a roof ledge loses a tile off an end (the longest first; never under 2 tiles) */
        const G = S.G; S.ledgeLen = S.ledgeLen || G.ledges.map(l => ({ ...l, a: l.c0, b: l.c1 }));
        const l = S.ledgeLen.filter(q => q.b - q.a >= 2).sort((p, q) => (q.b - q.a) - (p.b - p.a))[0]; if (!l) return false;
        const c = (S.n.crumbles % 2) ? l.a++ : l.b--; ctx.cellOpen(c, l.row); ctx.burst(c * ctx.TS + 8, l.row * ctx.TS + 4, 8, ['#b08a5a', '#ff9a3c', '#3a2a12'], 60, 0.7); ctx.sfx.crack && ctx.sfx.crack();
        if (!S.told.roof) { S.told.roof = 1; ctx.number(c * ctx.TS, l.row * ctx.TS - 30, 'THE ROOF GOES', '#ff6b6b'); } return true; },
    };
  }

  /* ---------- ONE FRAME OF HER ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 80, 'THE HAWK-MISTRESS, CHIEF OF THE KSAR', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 110, 'HER HAWK IS HER EYES: A GONG SENDS IT OFF, A FLASH BLINDS IT', '#ffd36b'); }
    HMM.stepHawkMistress(e, S, dt, heroes(), world(e));
    e.phase = S.ph; S.flashFx = Math.max(0, (S.flashFx || 0) - dt);
    /* A BLADE THROUGH THE HAWK: nothing there (it is her kit, not a foe) */
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) return; const hb = ctx.attackBox(); if (!hb) return;
      if (ctx.overlap(hb, { l: S.hawk.x - 8, r: S.hawk.x + 8, t: S.hawk.y - 6, b: S.hawk.y + 6 }) && !(S.hawkSaid > ctx.time())) { S.hawkSaid = ctx.time() + 1.5; ctx.number(S.hawk.x, S.hawk.y - 14, 'IT RIDES THE AIR', '#9aa39a'); } });
  };
  /* THE RULE ON HER: a hero's ring on a courtyard gong, a flash (src/ksar-hands.js) */
  H.onRing = g => { const e = live(); if (!S || !e || !ctx.bossActive) return; HMM.ringHeard(e, S, world(e)); };
  H.onFlash = (x, y) => { const e = live(); if (!S || !e || !ctx.bossActive) return; HMM.flashAt(e, S, world(e), x, y); };
  H.hawk = () => (S && live() ? S.hawk : null);
  /* A BLOW ON HER: the ward turns everything; her gauntlet turns the front while she is on guard; open, x openMul (one opening openCap of her at most) */
  H.take = (e, dmg) => { if (!S) return dmg; const P = ctx.hero(), t = ctx.time();
    if (e.mode === 'sleep' || e.mode === 'wake') return 0;
    if (S.ward > 0) { e.chipHit = t; S.n.warded++; e.guardFx = 0.25; e.guardWord = 'WARDED'; ctx.sfx.clank && ctx.sfx.clank(); return 0; }
    if (HMM.hmOpen(e) || e.broken > 0) { const cap = e.maxHp * HM.openCap, d = Math.min(dmg * HM.openMul, Math.max(0, cap - S.openTaken)); S.openTaken += d;
      if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 70, 'SHE GATHERS HERSELF', '#9aa39a'); } return d; }
    if (HMM.guarded(e, P.x, P.y, !P.ground && !P.climb)) { e.chipHit = t; S.n.guarded++; e.guardFx = 0.25; e.guardWord = S.n.guarded < 6 ? ['HER GAUNTLET: GO ROUND', 'HER GAUNTLET: HIT HIGH'][S.n.guarded % 2] : 'HER GAUNTLET';
      ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x + (Math.sign(P.x - e.x) || 1) * 10, e.y - 20, Math.sign(P.x - e.x) || 1, 5); return 0; }
    return dmg; };
  H.barName = e => 'THE HAWK-MISTRESS' + (HMM.hmOpen(e) ? '  OPEN' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { for (const q of ctx.enemies()) if (q.alive && q.hmGuard) { q.alive = false; ctx.burst(q.x, q.y, 8, ['#a8302a', '#5a1e1e'], 50, 0.5); } if (S) S.runner = null; BOSS_PHASE.hawkmistress = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, hawk: S.hawk.mode, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (GREYBOX) ---------- */
  /* the courtyard: the back wall's walk (the runners), the guard doors, the burning store's ends (phase three) */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    g.fillStyle = '#6a4a30'; g.fillRect(R(G.x0 - cx), R(G.wallY - 6 - cy), G.x1 - G.x0, 6);
    for (const d of G.doors) { g.fillStyle = '#3a2416'; g.fillRect(R(d - 10 - cx), R(G.floorY - 30 - cy), 20, 30); g.fillStyle = '#7a5a3a'; g.fillRect(R(d - 10 - cx), R(G.floorY - 32 - cy), 20, 3); }
    if (S.runner) { const r = S.runner, gg = gongs().find(q => q.id === r.gong), k = 1 - r.t / r.t0, x = r.from + ((gg ? gg.x : r.from) - r.from) * k;
      g.fillStyle = '#5a1e1e'; g.fillRect(R(x - 3 - cx), R(G.wallY - 18 - cy), 6, 12); ctx.text('!', R(x - cx), R(G.wallY - 24 - cy), Math.floor(time * 10) % 2 ? '#ff6b6b' : '#fff6e0', 'center', 6);
      if (gg) { g.strokeStyle = 'rgba(255,107,107,0.5)'; g.beginPath(); g.moveTo(R(x - cx), R(G.wallY - cy)); g.lineTo(R(gg.x - cx), R(G.floorY - 46 - cy)); g.stroke(); } }
    if (S.ph === 3) for (const [a, b] of G.fire) for (let x = a; x < b; x += 4) { const h = 6 + 5 * Math.abs(Math.sin(time * 9 + x)); g.fillStyle = (x / 4) % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(R(x - cx), R(G.floorY - h - cy), 3, h); }
  };
  /* HER: a falconer in a red-brown coat, the whip coiled at her hip, a leather gauntlet on her left arm; her pose by mode (greybox) */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, m = e.mode, flash = (e.hurtT || 0) > 0;
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(x - 10, y - 1, 20, 2); g.globalAlpha = 1;
    const coat = flash ? '#ffffff' : '#7a3a2a', skin = flash ? '#ffffff' : '#c89870';
    g.fillStyle = coat; g.fillRect(x - 6, y - 26, 12, 18); g.fillRect(x - 7, y - 10, 14, 4);   /* the coat */
    g.fillStyle = '#3a2418'; g.fillRect(x - 5, y - 8, 4, 8); g.fillRect(x + 1, y - 8, 4, 8);     /* boots */
    g.fillStyle = skin; g.fillRect(x - 4, y - 33, 8, 7); g.fillStyle = '#2a1a12'; g.fillRect(x - 5, y - 35, 10, 3); g.fillRect(x + f * 3, y - 31, 1, 1);   /* head, a dark hood */
    const guard = m === 'walk' || m === 'recover' || m === 'feintHold';
    g.fillStyle = '#c9a060'; if (guard || m === 'whistle') g.fillRect(x + f * 6 - 2, y - 30, 5, 8); else g.fillRect(x - f * 8 - 2, y - 22, 5, 6);   /* the GAUNTLET up in front of her (on guard) */
    if (m === 'lashTell' || m === 'markLashTell') { g.strokeStyle = '#3a2418'; g.beginPath(); g.moveTo(x - f * 4, y - 24); g.quadraticCurveTo(x - f * 20, y - 44, x - f * 6, y - 40); g.stroke(); }
    if (m === 'lash' || m === 'markLash') { g.strokeStyle = '#3a2418'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + f * 6, y - 20); const tx = m === 'markLash' && S.mark ? S.mark.x - cx : x + f * HM.lashReach; g.quadraticCurveTo((x + tx) / 2, y - 30, tx, y - 6); g.stroke(); g.lineWidth = 1; }
    if (m === 'cutTell' || m === 'cut') { g.fillStyle = '#e8e8f0'; g.fillRect(x + f * 8, y - 20, f * 9, 2); }
    if (m === 'whistle') ctx.text('~', x + f * 4, y - 40 - R(Math.sin(time * 8) * 2), '#e8f4ff', 'center', 7);
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; g.fillRect(x + f * 8 - 2, y - 32, 5, 12); }
  };
  /* THE HAWK, the marks, and THE READ (open ring + timer, ward shell, the gauntlet's word) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'hawkmistress') return; const G = S.G;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', k = S.hawk;
    /* THE HAWK: a hawk over her (wings beating), blinded it flaps with white stars, home it sits on her glove; its shadow on the floor when it spots or dives */
    { const hx = R(k.x - cx), hy = R(k.y - cy), w = k.mode === 'home' ? 0 : Math.sin(time * (k.mode === 'blind' ? 30 : 12)) * 5;
      g.fillStyle = '#5a3a22'; g.fillRect(hx - 4, hy - 2, 8, 5); g.fillStyle = '#8a6a3a'; g.fillRect(hx - 11, hy - 3 + R(w), 7, 2); g.fillRect(hx + 4, hy - 3 + R(w), 7, 2); g.fillStyle = '#e8d070'; g.fillRect(hx + (e.face || 1) * 4, hy - 1, 2, 2);
      if (k.mode === 'blind') for (let i = 0; i < 3; i++) { const a = time * 7 + i * 2.1; g.fillStyle = '#ffffff'; g.fillRect(hx + R(Math.cos(a) * 9), hy - 8 + R(Math.sin(a) * 3), 2, 2); }
      if (k.mode === 'wheel' || k.mode === 'blind') ctx.text(k.mode === 'wheel' ? 'WHEELING' : 'BLIND', hx, hy - 14, '#ffd36b', 'center', 5); }
    if (S.mark && (e.mode === 'spotTell' || e.mode === 'markLashTell' || e.mode === 'diveTell' || k.mode === 'dive')) { const x = R(S.mark.x - cx), y = R(G.floorY - 2 - cy), r = e.mode === 'diveTell' || k.mode === 'dive' ? HM.diveR : HM.markR;
      g.fillStyle = 'rgba(30,10,10,0.55)'; g.fillRect(x - r, y, r * 2, 3); g.strokeStyle = blink; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 2); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 2); g.stroke(); }
    if (S.flashFx > 0) { g.globalAlpha = S.flashFx * 1.5; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(R(e.x - cx), R(e.y - 14 - cy), HM.flashR, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    /* THE READ (B10) */
    const x = R(e.x - cx), y = R(e.y - HM.h / 2 - cy);
    if (HMM.hmOpen(e)) { const kk = Math.max(0, e.open / HM.openT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 24, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.y - HM.h - 26 - cy); ctx.text('OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(e.y - HM.h - 22 - cy), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, R(e.y - HM.h - 34 - cy) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
