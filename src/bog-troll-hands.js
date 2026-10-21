// src/bog-troll-hands.js - THE BOG TROLL's HANDS (claude/fenroad). src/bog-troll.js is the fight (pure); this binds it to the world: his told blows on the
// heroes (keyed once a blow: the burst throws you up, the drag pulls you in), the crossing's ROTTEN sections and the road he rips (src/fen-road-hands.js
// sectionAt / collapse / rip), the clods - and the drawing.
// GREYBOX ART (readable; the art lane draws it - see the lane report's ART NOTES): every move its OWN windup and release pose (B16) - the burst (arms up
// through the splintering boards), up waist-deep (hands on the boards), the drag's windup (one arm raised back over his shoulder, weed dripping) and the
// drag (the arm flung out flat along the boards), the scoop (leaning down, a hand in the fen) and the hurl (the arm thrown forward), STUCK (sunk to the
// chest in the broken boards, arms flailing, head thrown back), the heave (both hands pushing up off the boards), the rip's grip (both hands on the
// boardwalk's edge, hunched) and the rip (a length of road torn up over his head), sinking, and his wake. THE SHARED READ (B10): OPEN = a gold ring and
// a timer bar (STUCK); WARDED = a pale ring and the word; PEAT HIDE = a turned blow CLANKS, sparks and says so.
// main.js calls: spawnBoss, owns, on, update, take, drawBoss, drawOver, barName, end, read, show, clear, phase, plan (the bot's view).
import * as BTM from './bog-troll.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
import * as FRA from './redraw/fen_road_art.js';
import * as BTA from './redraw/bog_troll_art.js';   /* (claude/fenroadart) his drawn sprites: one baked + outlined sprite per pose */
const { BT } = BTM;
const R = Math.round;
const SOUND = { roar: s => (s.trollRoar || s.boreRoar || s.roar)(), gurgle: s => (s.trollBubble || s.splash)(), bubble: s => (s.trollBubble || s.splash)(), bulge: s => (s.trollBulge || s.creak || s.thud)(),
  burst: s => { (s.trollBurst || s.splash)(); (s.crack || s.thud)(); }, stuck: s => { (s.trollGroan || s.thud)(); (s.crack || s.thud)(); }, sink: s => (s.splash || s.thud)(),
  dragTell: s => (s.trollDragTell || s.snort || s.tell)(), drag: s => (s.trollDrag || s.throwWhoosh || s.thud)(), scoop: s => (s.trollScoop || s.thud)(), hurl: s => (s.trollHurl || s.throwWhoosh || s.thud)(),
  clod: s => (s.splash || s.thud)(), rip: s => { (s.trollRip || s.crack)(); (s.heavy || s.thud)(); }, clank: s => (s.clank || s.thud)() };
const C = { hide: '#5a6a4a', hideL: '#7a8a62', hideD: '#3e4a32', belly: '#6e7a56', peat: '#3e2c1c', weed: '#2e4a22', eye: '#ffcf6a', red: '#ff4a2a', tusk: '#e8dcc0', mouth: '#2a1a14', board: '#6a5038', boardD: '#3a2818' };
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); };
const ell = (g, x, y, rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(R(x), R(y), Math.max(1, rx), Math.max(1, ry), 0, 0, 7); g.fill(); };
const limb = (g, x0, y0, x1, y1, col, wd) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(R(x0), R(y0)); g.lineTo(R(x1), R(y1)); g.stroke(); g.lineCap = 'butt'; g.lineWidth = 1; };
/* THE POSE A MODE WEARS (local px, facing right, origin = the road's top under his middle; the water line is 16 px below it). torso: [dy (how high his
   shoulders stand), lean]; armF / armB: the near (facing) and far hand [x, y]; head: [dx, dy, tilt]; mouth: open; wreck: broken boards round him. */
export const POSE = {
  up: { torso: [0, 0], armF: [22, 0], armB: [-20, 0], head: [6, 0, 0] },
  recover: { torso: [2, 0.05], armF: [20, 0], armB: [-18, 0], head: [6, 2, 0.1] },
  roar: { torso: [-4, -0.1], armF: [20, -40], armB: [-20, -40], head: [2, -4, -0.4], mouth: true },
  wake: { torso: [-2, -0.05], armF: [18, -36], armB: [-18, -32], head: [4, -2, -0.3], mouth: true },
  burst: { torso: [-6, -0.1], armF: [16, -44], armB: [-16, -42], head: [4, -4, -0.3], mouth: true, splinter: true },
  stuckIn: { torso: [-4, 0], armF: [16, -40], armB: [-16, -38], head: [4, -2, -0.2], mouth: true, splinter: true },
  dragTell: { torso: [2, -0.12], armF: [-26, -40], armB: [-18, 0], head: [8, 0, 0.1], weed: true },
  drag: { torso: [4, 0.15], armF: [70, 0], armB: [-18, 0], head: [10, 2, 0.15] },
  hurlTell: { torso: [8, 0.25], armF: [20, 18], armB: [-20, 0], head: [12, 6, 0.3], clod: true },
  hurl: { torso: [-2, -0.15], armF: [30, -34], armB: [-18, 0], head: [6, -2, -0.2] },
  stuck: { torso: [14, 0], armF: [24, -20], armB: [-24, -16], head: [2, 4, -0.5], mouth: true, wreck: true, flail: true },
  heave: { torso: [8, 0.05], armF: [22, 0], armB: [-22, 0], head: [6, 2, 0.1], wreck: true },
  sink: { torso: [10, 0], armF: [16, 6], armB: [-16, 6], head: [6, 4, 0] },
  ripTell: { torso: [6, 0.3], armF: [30, 2], armB: [22, 2], head: [12, 4, 0.3], grip: true },
  rip: { torso: [-6, -0.15], armF: [14, -50], armB: [-12, -50], head: [4, -4, -0.3], mouth: true, planks: true },
};
/* HIS BODY (greybox): a hunched mossy bulk from the water up, a small head slung forward, an underbite with two tusks, long arms; peat caked on him */
function drawTroll(g, p, flash, time, ph, sinkK = 0) {
  const ty = (p.torso ? p.torso[0] : 0) + sinkK, lean = p.torso ? p.torso[1] : 0, base = 16, top = -30 + ty, hide = flash ? '#ffffff' : C.hide;
  g.save(); g.beginPath(); g.rect(-200, -200, 400, 200 + base); g.clip();   /* nothing under the water line is drawn */
  if (p.wreck) { for (let i = -3; i <= 3; i++) { const a = i * 0.35 + Math.sin(time * 9 + i) * (p.flail ? 0.05 : 0); g.save(); g.translate(i * 7, 2); g.rotate(a); rect(g, -6, -2, 12, 4, C.board); rect(g, -6, 1, 12, 1, C.boardD); g.restore(); } }
  g.save(); g.translate(0, base); g.rotate(lean); g.translate(0, -base);
  ell(g, 0, (top + base) / 2 + 2, 19, (base - top) / 2 + 2, hide); ell(g, 2, (top + base) / 2 + 6, 12, (base - top) / 2 - 4, flash ? '#ffffff' : C.belly);
  rect(g, -14, top + 6, 6, 4, C.peat); rect(g, 8, top + 14, 5, 3, C.peat); rect(g, -6, top + 20, 4, 3, C.peat);
  ell(g, -8, top + 4, 8, 5, flash ? '#ffffff' : C.hideL);   /* the hump of his shoulders */
  if (ph > 1) for (let i = 0; i < 4; i++) rect(g, -14 + i * 6, top - 1 - (i % 2), 2, 3, C.weed);   /* weed standing up off his back in phase two */
  const hx = (p.head ? p.head[0] : 6) + 8, hy = top + (p.head ? p.head[1] : 0) + 4;
  g.save(); g.translate(hx, hy); g.rotate(p.head ? p.head[2] : 0);
  ell(g, 0, 0, 8, 7, hide); rect(g, -2, -3, 3, 2, p.mouth || p.flail ? C.red : C.eye); rect(g, 3, -3, 2, 2, p.mouth || p.flail ? C.red : C.eye);
  if (p.mouth) { rect(g, -3, 2, 9, 4, C.mouth); } rect(g, -1, 2, 2, 4, C.tusk); rect(g, 4, 2, 2, 4, C.tusk);
  g.restore();
  g.restore();
  const sh = [10, top + 10], shB = [-10, top + 10], fl = p.flail ? Math.sin(time * 18) * 8 : 0;
  const aF = p.armF || [20, 0], aB = p.armB || [-20, 0];
  limb(g, shB[0], shB[1], aB[0] - fl, aB[1] + ty * 0.3, flash ? '#ffffff' : C.hideD, 6); ell(g, aB[0] - fl, aB[1] + ty * 0.3, 5, 4, C.hideD);
  limb(g, sh[0], sh[1], aF[0] + fl, aF[1] + (p.flail ? -fl : 0), hide, 7); ell(g, aF[0] + fl, aF[1] + (p.flail ? -fl : 0), 6, 5, hide);
  for (let i = 0; i < 3; i++) rect(g, aF[0] + fl + 3, aF[1] - 2 + i * 2 + (p.flail ? -fl : 0), 4, 1, C.hideD);   /* fingers */
  if (p.weed) { for (let i = 0; i < 3; i++) rect(g, aF[0] - 3 + i * 3, aF[1] + 4, 1, 6 + ((time * 10 + i) % 4), C.weed); if (Math.floor(time * 8) % 2) rect(g, aF[0], aF[1] + 12, 1, 2, '#9fb3a6'); }
  if (p.clod) ell(g, aF[0] + 2, aF[1] - 2, 5, 4, C.peat);
  if (p.planks) { g.save(); g.translate(1, -52); g.rotate(-0.15); rect(g, -26, -3, 52, 6, C.board); rect(g, -26, 2, 52, 2, C.boardD); for (let i = -24; i < 26; i += 16) rect(g, i, -3, 1, 6, C.boardD); g.restore(); }
  if (p.grip) { rect(g, aF[0] - 4, aF[1] - 3, 10, 3, C.board); rect(g, aB[0] - 4, aB[1] - 3, 10, 3, C.board); }
  if (p.splinter) for (let i = 0; i < 6; i++) { const a = i * 1.05 + time * 4; rect(g, Math.cos(a) * 22, -6 - Math.abs(Math.sin(a)) * 18, 4, 2, C.board); }
  g.restore();
}

export function makeBogTrollHands(ctx) {
  let S = null; const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'bogtroll' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'bogtroll';
  H.phase = () => (S ? S.ph : 1);
  H.clear = () => { S = null; BOSS_PHASE.bogtroll = 1; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'bogtroll' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.btKeys = pp.btKeys || new Map(); if (pp.btKeys.size > 120) pp.btKeys.clear(); if (pp.btKeys.has(key)) return true; pp.btKeys.set(key, 1); return false; };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = BTM.newFight(BTM.geom(Ar, ctx.TS)); BOSS_PHASE.bogtroll = 1;
    const hp = ctx.EHP.bogtroll || BT.hp;
    const e = { ...base, t: 'bogtroll', w: BT.w, h: BT.h, hp, maxHp: hp, noGrav: true, markH: BT.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0 };
    e.x = base.x; e.y = S.G.floorY + BT.under; for (const pp of ctx.players) pp.btKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    const FR = ctx.fen();
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.bogtroll = ph; },
      mark: m => ctx.number(e.x, S.G.floorY - BT.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 14, 34, '#ffd36b'); ctx.burst(x, y - 8, 16, ['#6a5038', '#3a2818', '#9fb3a6'], 110, 0.7); } else if (k === 'ward') ctx.ring(x, y - 14, 36, '#c8d8e8'); },
      splash: (x, n = 18) => ctx.burst(x, S.G.waterY, n, ['#9fb3a6', '#e6efe6', '#3e2c1c', '#6a5038'], 120, 0.6),
      sectionAt: x => (FR ? FR.sectionAt(x) : null), collapse: sec => (FR ? FR.collapse(sec) : false),
      rip: () => { if (FR) FR.rip(A().rip || []); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true }); });
          if (res === 'hit') { if (o.up) { P.vy = o.up; P.ground = false; } if (o.pull) { P.vx = o.pull; P.vy = Math.min(P.vy || 0, -90); P.ground = false; S.n.dragged++; ctx.number(P.x, P.y - 30, BTM.BT_SAY.dragged, '#ff9a5c'); } } }); },
    };
  }
  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, S.G.floorY - 90, BTM.BT_SAY.wake, '#ffd36b'); SOUND.roar(ctx.sfx); ctx.shake(6); ctx.burst(e.x, S.G.waterY, 26, ['#9fb3a6', '#e6efe6', '#3e2c1c'], 130, 0.8); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 120, BTM.BT_SAY.rule, '#ffd36b'); }
    BTM.stepTroll(e, S, dt, heroes(), world(e));
    e.w = e.mode === 'stuck' || e.mode === 'stuckIn' ? BT.stuck.w : BT.w;   /* stuck, he is sprawled across the wreck: struck from the boards that hold at its ends */
    e.phase = S.ph; e.open = BTM.btOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* A BLOW ON HIM (B15; src/bog-troll.js takeBlow) - the turned share clanks and says why */
  H.take = (e, dmg) => { if (!S) return dmg; const [d, word] = BTM.takeBlow(e, S, dmg);
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 16, S.G.floorY - 16, sd, 4);
      if (!S.told.hide && word === BTM.BT_SAY.hide) { S.told.hide = 1; ctx.hint && ctx.hint('HIS PEAT HIDE TURNS A BLOW. STAND ON A ROTTEN SECTION AND STEP OFF AS HIS BULGE SETS: HE STICKS IN IT.'); } }
    return d; };
  H.barName = e => 'THE BOG TROLL' + (BTM.btOpen(e) ? '  ' + (BTM.OPEN_NAME[e.mode] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : '');
  H.end = () => { if (S) S.clods = []; BOSS_PHASE.bogtroll = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, ripped: S.ripped, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  /* THE BOT'S VIEW (src/lab.js): the rotten sections standing, and the water where there are no boards (ripped or collapsed) */
  H.plan = () => { const FR = ctx.fen(), TS = ctx.TS; if (!S || !FR) return null;
    const secs = FR.sections().map(s => ({ x0: s.x0 * TS, x1: (s.x0 + s.w) * TS, ok: s.st === 'up' || s.st === 'bow', bow: s.st === 'bow' ? s.t : 0, hold: s.hold }));
    const holes = [...S.G.rip.filter(() => S.ripped), ...FR.sections().filter(s => s.st === 'under' || s.st === 'gone').map(s => (s.hole ? [s.hole[0] * TS, (s.hole[1] + 1) * TS] : [s.x0 * TS, (s.x0 + s.w) * TS]))];
    return { secs, holes }; };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const m = e.mode; if (m === 'sleep' || m === 'under' || m === 'burstTell') return;
    const f = e.face || 1, x = e.x - cx, y = S.G.floorY - cy, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06, p = POSE[m] || POSE.up;
    const sinkK = Math.max(0, e.y - (S.G.floorY + BT.up));
    const spr = BTA.trollSprite(m, p, time, S.ph, flash, sinkK); g.save(); g.translate(R(x), R(y)); g.scale(f, 1); g.drawImage(spr, -BTA.TROLL_ANCHOR.ax, -BTA.TROLL_ANCHOR.ay); g.restore(); };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss; const G = S.G, X = v => R(v - cx), Y = v => R(v - cy);
    if (!ctx.bossActive || !e || e.t !== 'bogtroll') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* WHERE HE SWIMS: bubbles over him; THE BULGE: the boards over him lift (amber while it follows you, red when it sets) */
    if (e.mode === 'under' || e.mode === 'sleep' && ctx.bossActive) for (let i = 0; i < 3; i++) { const q = (time * 2.5 + i * 0.33) % 1; g.globalAlpha = 1 - q; rect(g, X(e.x) - 6 + i * 6, Y(G.waterY) - q * 6, 2, 2, '#cfe0d0'); g.globalAlpha = 1; }
    if (e.mode === 'burstTell') { const k = 1 - Math.max(0, e.modeT) / (BT.burst.track + BT.burst.lock), col = e.locked ? blink : '#ffb347', bx = X(e.lockX), by = Y(G.floorY);
      FRA.drawBulge(g, bx, by, k, e.locked, time);
      g.globalAlpha = 0.85; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.ellipse(bx, by - 2, BT.burst.r + 2, 5, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      for (let i = 0; i < 4; i++) { const q = (time * 3 + i * 0.25) % 1; g.globalAlpha = 1 - q; rect(g, bx - 9 + i * 6, Y(G.waterY) - q * 8, 2, 2, '#cfe0d0'); g.globalAlpha = 1; } }
    /* THE DRAG's reach along the boards while he winds it */
    if (e.mode === 'dragTell') { const f = e.face || 1, a = e.x + f * 14, b = e.x + f * (14 + BT.drag.reach); g.globalAlpha = 0.45 + 0.3 * Math.sin(time * 14); g.fillStyle = '#ff6b6b'; for (let q = Math.min(a, b); q < Math.max(a, b); q += 9) g.fillRect(X(q), Y(G.floorY) - 2, 5, 2); g.globalAlpha = 1; }
    /* THE RIP's boards flash red first */
    if (e.mode === 'ripTell') for (const [a, b] of G.rip) { g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 16); g.fillStyle = '#ff4a2a'; g.fillRect(X(a), Y(G.floorY), R(b - a), 4); g.globalAlpha = 1; }
    for (const c of S.clods) { const q = BTM.clodAt(c, G.floorY); FRA.drawClod(g, X(q.x), Y(q.y), time);
      g.strokeStyle = blink; g.beginPath(); g.ellipse(X(c.tx), Y(G.floorY) - 1, BT.hurl.r, 3, 0, 0, 7); g.stroke(); }
    /* THE READ (B10) */
    const x = X(e.x), y = Y(G.floorY - 10);
    if (BTM.btOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1));
      g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = Y(G.floorY - 52); ctx.text(BTM.OPEN_NAME[e.mode] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0 && !BTM.btUnder(e) && e.mode !== 'sink') { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 32, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      ctx.text('WARDED', x, Y(G.floorY - 50), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, Y(G.floorY - 62) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
/* HIS BESTIARY CARD: two of his poses (up, the drag's windup) - main.js SPR.bogtrollCard (the bestiary reads SPR[t + 'Card'].R) */
export function bakeBogTrollCard() { return BTA.bakeTrollCard(POSE, BT, whiten, flipX); }
export function bakeBogTrollCardGreybox() {
  const fr = [POSE.up, POSE.dragTell].map((p, i) => { const [c, g] = canvas(64, 48); g.imageSmoothingEnabled = false; g.save(); g.translate(30, 30); g.scale(0.7, 0.7); drawTroll(g, p, false, i * 0.3, 1); g.restore(); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 30, ay: 40, w: BT.w, h: BT.h };
}
export const _drawTroll = drawTroll;   /* (tools / the art sheet draw a pose) */
