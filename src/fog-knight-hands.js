// src/fog-knight-hands.js - THE FOG KNIGHT's HANDS (claude/towpath, the greybox). src/fog-knight.js is the fight (pure: his three phases, his cycles, his
// stances, the burn, the double, the shroud, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow; a shield turns
// only the yellow ones; the FOG LUNGE passes a roll begun in its last beat - one begun sooner is spent before the point arrives: TOO SOON), the heroes'
// LANTERNS (src/towpath-hands.js: lit and near, they burn him; a blow of his that lands gutters yours), THE TOWPATH'S END's own pieces (the swing bridge
// through him - onBridge; the lock drained under his double - onLock; the lock lamps - shroudAt), every blow on him by its ANGLE (take: src/lantern-eater.js
// blowAngle - low / mid / high - and the plunge by the blow's tag, so the pyromancer's firedrop is a plunge), and the drawing (GREYBOX shapes until the art pass).
// THE SHARED READ (design standard B10): OPEN = a gold ring and a timer bar ("THE ARMOUR STANDS EMPTY"); WARDED = a pale shell ring and the word; a turned
// blow CLANKS, flashes and names the stance it met (GUARDS HIGH / GUARDS LOW / FULL GUARD) through src/boss-read.js - never silent. His STANCE is drawn on
// him (the shield up and the visor lit; the sword planted and the fog pooled; the fog wrapped round him) and named over him; THE BURN is a bar over him.
// main.js calls: spawnBoss, owns, on, update, take, drawBoss, drawOver, barName, end, read, show, clear, onBridge, onLock, shroudAt.
import * as FKM from './fog-knight.js';
import { blowAngle } from './lantern-eater.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas } from './px.js';
const { FK } = FKM;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slash: s => (s.foeSlash || s.slash)(), lunge: s => (s.whoosh || s.foeSlash || s.slash)(),
  open: s => (s.bell || s.clank)(), mist: s => (s.hiss || s.whoosh || s.tell)() };

/* THE PLATE: rust-black, empty; fog pours from the joints and the visor; the shield (its device gone) and the long pitted sword. pose by stance and mode */
export function drawPlate(g, x, y, f, o, time) {
  const R = Math.round;
  const { stance, mode, alpha = 1, visor = 1, sag = 0, flash = false } = o;
  g.globalAlpha = alpha;
  const iron = flash ? '#ffffff' : '#2a2422', rust = flash ? '#ffffff' : '#5a3424', edge = flash ? '#ffffff' : '#7a5a48';
  const top = y - 34 + sag;
  /* the fog that holds his shape: wisps from the joints, pooling at his feet in the low guard, a cloak round him in the full */
  const wisp = (wx, wy, n) => { for (let i = 0; i < n; i++) { const a = time * 1.7 + i * 2.3 + wx * 0.1; g.fillStyle = 'rgba(200,208,216,' + (0.35 * alpha).toFixed(2) + ')'; g.fillRect(R(wx + Math.cos(a) * 3), R(wy - ((time * 14 + i * 5) % 12)), 2, 2); } };
  if (stance === 'full' && mode !== 'empty') { g.fillStyle = 'rgba(190,200,210,' + (0.42 * alpha).toFixed(2) + ')'; g.beginPath(); g.ellipse(x, y - 17, 15, 20, 0, 0, Math.PI * 2); g.fill(); }
  if (stance === 'low' && mode !== 'empty') { g.fillStyle = 'rgba(190,200,210,' + (0.4 * alpha).toFixed(2) + ')'; g.beginPath(); g.ellipse(x, y - 2, 16, 4, 0, 0, Math.PI * 2); g.fill(); }
  /* legs (greaves), body (cuirass), helm */
  g.fillStyle = iron; g.fillRect(x - 6, y - 12 + sag * 0.3, 5, 12 - sag * 0.3); g.fillRect(x + 1, y - 12 + sag * 0.3, 5, 12 - sag * 0.3);
  g.fillStyle = rust; g.fillRect(x - 7, top + 10, 14, 13); g.fillStyle = iron; g.fillRect(x - 7, top + 22, 14, 2);
  g.fillStyle = iron; g.fillRect(x - 5, top, 10, 10); g.fillStyle = edge; g.fillRect(x - 5, top, 10, 1);
  const vg = visor > 0.5 ? (flash ? '#ffffff' : '#cfe8ff') : '#5a6a78'; g.fillStyle = vg; g.fillRect(x + f * 1 - 3, top + 4, 7, 1);
  if (visor > 0.5 && !flash) { g.globalAlpha = alpha * (0.3 + 0.15 * Math.sin(time * 5)); g.fillStyle = '#cfe8ff'; g.beginPath(); g.arc(x + f * 1, top + 4, 5, 0, Math.PI * 2); g.fill(); g.globalAlpha = alpha; }
  /* the shield: up at the head in the high guard, at the side otherwise */
  const shY = stance === 'high' && mode !== 'empty' ? top - 2 : top + 10; g.fillStyle = flash ? '#ffffff' : '#3a3a34'; g.fillRect(x + f * 7 - (f > 0 ? 0 : 6), shY, 6, 14); g.fillStyle = '#5a4a3a'; g.fillRect(x + f * 7 - (f > 0 ? 0 : 6) + 1, shY + 1, 4, 1);
  /* the sword: planted point-down in the low guard; raised in his tells; out in the cut and the lunge */
  g.strokeStyle = flash ? '#ffffff' : '#9a948a'; g.lineWidth = 2; g.beginPath();
  if (mode === 'cut' || mode === 'stepCut' || mode === 'lunge') { g.moveTo(x - f * 2, top + 16); g.lineTo(x - f * 2 - f * (mode === 'lunge' ? -34 : -30), top + 18); }
  else if (mode === 'cutTell' || mode === 'stepTell' || mode === 'lungeTell') { g.moveTo(x - f * 4, top + 14); g.lineTo(x - f * 16, top - 10); }
  else if (stance === 'low' && mode !== 'empty') { g.moveTo(x - f * 6, top + 14); g.lineTo(x - f * 8, y + 1); }
  else { g.moveTo(x - f * 6, top + 14); g.lineTo(x - f * 10, top + 34); }
  g.stroke(); g.lineWidth = 1;
  if (mode !== 'empty') { wisp(x - 6, top + 10, 2); wisp(x + 6, top + 10, 2); wisp(x, top + 2, 2); wisp(x, y - 12, 2); }
  g.globalAlpha = 1;
}
/* THE BESTIARY CARD: the plate on the towpath at night, in its full guard */
export function bakeFogKnightCard() {
  const W = 40, Hh = 48, [c, g] = canvas(W, Hh);
  const bg = g.createLinearGradient(0, 0, 0, Hh); bg.addColorStop(0, '#2a3440'); bg.addColorStop(1, '#0e1216'); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
  g.fillStyle = '#3a3028'; g.fillRect(0, 44, W, 4);
  drawPlate(g, 20, 44, -1, { stance: 'full', mode: 'walk', alpha: 1, visor: 1, sag: 0 }, 0.6);
  return { R: [c], L: [c], w: 32, h: 40 };
}

export function makeFogKnightHands(ctx) {
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'fogknight' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'fogknight';
  H.clear = () => { S = null; BOSS_PHASE.fogknight = 1; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.fkKeys = pp.fkKeys || new Map(); if (pp.fkKeys.size > 80) pp.fkKeys.clear(); if (pp.fkKeys.has(key)) return true; pp.fkKeys.set(key, 1); return false; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'fogknight' ? e : null; };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = FKM.newFight(FKM.geom(Ar, ctx.TS)); BOSS_PHASE.fogknight = 1;
    const e = { ...base, t: 'fogknight', w: FK.w, h: FK.h, hp: ctx.EHP.fogknight, maxHp: ctx.EHP.fogknight, noGrav: true, markH: FK.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.y = S.G.floorY; for (const pp of ctx.players) { pp.fkKeys = null; pp.fkRollEnd = -9; } return e; };

  /* ---------- THE WORLD AS HE SEES IT ---------- */
  const heroes = () => ctx.players.map(pp => { const q = ctx.lanternOf(pp); return { x: pp.x, y: pp.y, face: pp.face || 1, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, lit: !!(q && q.has && q.lit), pp }; });
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), time: () => ctx.time(),
      music: ph => { BOSS_PHASE.fogknight = ph; if (ctx.music) ctx.music(ph > 1 ? 'fogknight:p' + ph : 'fogknight'); },
      mark: m => ctx.number(e.x, e.y - FK.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => {
        if (k === 'mist' || k === 'dissolve' || k === 'reform' || k === 'double') ctx.burst(x, y - 18, k === 'dissolve' ? 22 : 14, ['#c8d0d8', '#9aa4ae', '#e8eef2'], 60, 0.7, -20);
        else if (k === 'open') { ctx.ring(x, y - 18, 32, '#ffd36b'); ctx.burst(x, y - 20, 18, ['#c8d0d8', '#e8eef2'], 90, 0.6, -40); }
        else if (k === 'ward') ctx.ring(x, y - 18, 34, '#9ab0c0'); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          if (o.soon && !(P.dodge > 0) && ctx.time() - (pp.fkRollEnd ?? -9) < 0.45) { S.n.soon++; ctx.number(P.x, P.y - 40, 'TOO SOON: ROLL IN ITS LAST BEAT'); }
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock })); if (P.hp < hp0) { any = true; ctx.gutter(pp); } }); return any; },
      lockFull: () => { const k = ctx.lock && ctx.lock('fkLock'); return !k || k.y <= k.hiY + 3; },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    for (const pp of ctx.players) { if (pp.dodge > 0) pp.fkRolling = true; else if (pp.fkRolling) { pp.fkRolling = false; pp.fkRollEnd = ctx.time(); } }
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 84, 'THE FOG KNIGHT: THE FOG IN AN OLD SUIT OF PLATE', '#ffd36b'); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 120, 'FOG IS HIS BODY: YOUR LANTERN BURNS IT OUT OF HIM', '#ffd36b'); }
    const was = e.mode;
    FKM.stepFogKnight(e, S, dt, heroes(), world(e));
    if (was !== e.mode && e.mode === 'stanceTell' && !S.told['st' + S.want]) { S.told['st' + S.want] = 1; ctx.number(e.x, e.y - 66, FKM.STANCE_HOW[S.want] || '', '#ffe9a0'); }
    e.phase = S.ph;
    /* A BLADE THROUGH THE DOUBLE: nothing there (fog) */
    if (S.dbl) for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) return; const hb = ctx.attackBox(); if (!hb) return;
      if (ctx.overlap(hb, { l: S.dbl.x - 9, r: S.dbl.x + 9, t: S.G.floorY - 34, b: S.G.floorY }) && !(S.dblSaid > ctx.time())) { S.dblSaid = ctx.time() + 1.2; ctx.turned({ x: S.dbl.x, y: S.G.floorY, w: 18, h: 34, alive: true, t: 'fogdouble' }, P.x, 'ONLY FOG: HIS VISOR GLOWS'); } });
  };
  /* THE RULE ON HIM: the arena's bridge swung (src/towpath-hands.js), its lock drained */
  H.onBridge = b => { const e = live(); if (!S || !e || !ctx.bossActive) return; FKM.bridgeSwung(e, S, world(e)); };
  H.onLock = what => { const e = live(); if (!S || !e || !ctx.bossActive) return; if (what === 'drained') FKM.lockDrained(e, S, world(e)); };
  /* THE SHROUD at x (phase three): the arena flooded with fog, thinner for every lock lamp alight */
  H.shroudAt = x => { if (!S || !ctx.bossActive || S.ph < 3 || x < S.G.x0 - 40 || x > S.G.x1 + 40) return 0; const lit = (ctx.lamps ? ctx.lamps() : []).filter(l => l.arena && l.lit).length;
    return Math.max(0, Math.min(0.88, S.shroud * (0.86 - 0.22 * lit))); };
  /* A BLOW ON HIM, by its angle: the ward turns everything; open x FK.openMul (one opening FK.openCap of him at most); on guard, his stance turns the wrong angle */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero();
    const tag = Array.isArray(blow) ? blow : blow ? [blow] : [], angle = !blow ? 'burn' : tag.includes('plunge') || P.plunge ? 'plunge' : blowAngle(P);
    const r = FKM.takeAt(e, S, angle);
    if (r.k <= 0) { if (e.mode === 'sleep' || e.mode === 'wake') return 0; S.n[S.ward > 0 ? 'warded' : 'turned']++; e.guardFx = 0.25; e.guardWord = r.word; ctx.turned(e, P.x, r.word === 'FULL GUARD' ? 'FULL GUARD: FROM ABOVE' : r.word); return 0; }
    if (FKM.fkOpen(e)) { const cap = e.maxHp * FK.openCap, d = Math.min(dmg * r.k, Math.max(0, cap - S.openTaken)); S.openTaken += d;
      if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; ctx.number(e.x, e.y - 74, 'THE FOG GATHERS IN HIM AGAIN', '#9aa39a'); } return d; }
    if (angle === 'plunge') S.n.plunges++;
    if (r.reel) FKM.reel(e, S, world(e)); else if (angle !== 'burn') FKM.landed(e, S, world(e), P.x);
    return dmg * r.k; };
  H.barName = e => 'THE FOG KNIGHT' + (FKM.fkOpen(e) ? '  EMPTY' : S && S.ward > 0 ? '  WARDED' : S ? '  ' + FKM.STANCE_WORD[S.stance] : '');
  H.end = e => { if (S) { S.dbl = null; S.shroud = 0; } BOSS_PHASE.fogknight = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, cycle: S.cycle, stance: S.stance, burn: +S.burn.toFixed(2), n: JSON.parse(JSON.stringify(S.n)), ward: S.ward, dbl: !!S.dbl, shroud: +S.shroud.toFixed(2), hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (GREYBOX) ---------- */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, m = e.mode, flash = (e.hurtT || 0) > 0;
    if (m === 'gone') return;
    const alpha = m === 'dissolve' ? Math.max(0.1, e.modeT / FK.dissolveT) : 1;
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(x - 10, y - 1, 20, 2); g.globalAlpha = 1;
    drawPlate(g, x, y, f, { stance: S.stance, mode: m, alpha, visor: 1, sag: FKM.fkOpen(e) ? 6 : m === 'reel' ? 3 : 0, flash }, time);
    if (m === 'sleep') ctx.text('...', x + 8 * f, y - 44, '#c8d8e8', 'center', 6);
    if (e.guardFx > 0) { g.fillStyle = '#ffffff'; g.fillRect(x + f * 10 - 2, y - 38, 5, 14); }
  };
  /* THE DOUBLE, THE STANCE AND THE READ */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'fogknight') return; const G = S.G;
    if (S.dbl) { const D = S.dbl; drawPlate(g, R(D.x - cx), R(G.floorY - cy), D.face || 1, { stance: D.stance, mode: D.mode, alpha: 0.62, visor: 0, sag: 0 }, time);
      if (D.mode === 'cutTell') ctx.text('!', R(D.x - cx), R(G.floorY - 50 - cy), '#ffd36b', 'center', 7); }
    if (e.mode === 'dissolve' && S.stepTo != null) { g.strokeStyle = 'rgba(200,208,216,0.6)'; g.setLineDash([2, 3]); g.beginPath(); g.arc(R(S.stepTo - cx), R(G.floorY - 16 - cy), 14, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }   /* where he will re-form (B12: always followable) */
    const x = R(e.x - cx), y = R(e.y - FK.h / 2 - cy);
    /* THE STANCE, named over him (on guard); a stance he is taking blinks in */
    if (!FKM.fkOpen(e) && !(S.ward > 0) && e.mode !== 'sleep' && e.mode !== 'wake' && e.mode !== 'dissolve') {
      const st = e.mode === 'stanceTell' && S.want ? S.want : S.stance, blink = e.mode === 'stanceTell' && Math.floor(time * 10) % 2;
      if (!FKM.committed(e)) ctx.text(FKM.STANCE_WORD[st], x, R(e.y - FK.h - 30 - cy), blink ? '#ffffff' : st === 'full' ? '#c8d8e8' : st === 'high' ? '#e8d8a0' : '#a8d0e8', 'center', 5); }
    /* THE BURN: a bar over him, filling while a lit lantern is near */
    if (S.burn > 0.01 && !FKM.fkOpen(e)) { const by = R(e.y - FK.h - 20 - cy); g.fillStyle = '#1b1626'; g.fillRect(x - 14, by, 28, 2); g.fillStyle = '#ff9a3c'; g.fillRect(x - 14, by, R(28 * S.burn), 2); }
    if (FKM.fkOpen(e)) { const kk = Math.max(0, e.open / FK.openT);
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 24, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = R(e.y - FK.h - 26 - cy); ctx.text('OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * Math.min(1, kk)), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, R(e.y - FK.h - 22 - cy), '#c8d8e8', 'center', 5); }
    if (e.mode === 'reel') ctx.text('REELING', x, R(e.y - FK.h - 22 - cy), '#8fd160', 'center', 5);
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, R(e.y - FK.h - 40 - cy) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
