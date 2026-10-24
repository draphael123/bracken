// src/battering-beast-hands.js - THE BATTERING BEAST's HANDS (claude/palisadewood). src/battering-beast.js is the fight (pure); this binds it to the world: his told blows on
// the heroes (keyed once a blow; a shield turns only the yellow sweep, and jars), THE CLEARING'S TWO SCAFFOLDS (a hero's blow on a prop knocks it: strike(hb); the ranger's
// arrow knocks one too; the deck's boards go and come back), THE BUCKLE (P2), the handlers' stakes, the trample's rings - and the drawing.
// GREYBOX ART (readable shapes; the sonnet art lane draws him - see the lane report's ART NOTES): every move its OWN windup and release pose (B16, POSE below) - the charge's
// windup (head low behind the ram, a fore hoof raking, the handlers' whips up) and the run (long and low), the crash (ram buried, reeling, stars), the sweep's cock (ram swung
// back, body twisted) and the swing (ram low and across), the volley (the handlers stood up on his back, arms back) and the throw (arms down), the rear (up on his hind legs)
// and the stamp (fore feet down, flat), STUCK (sunk in timber, legs braced, the ram jammed), the tear (timber flying), LOOSE (no ram, no handlers, bolting), sleep and wake.
// THE SHARED READ (B10): OPEN = a gold ring and a timer bar (STUCK / DAZED / LOOSE); WARDED = a pale ring and the word; ARMOURED = a turned blow CLANKS, sparks and says so.
// main.js calls: spawnBoss, owns, on, update, take, strike, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as BBM from './battering-beast.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
const { BB } = BBM;

const SOUND = { snort: s => (s.boarSnort || s.snort || s.tell)(), charge: s => (s.boarCharge || s.badgerCharge || s.tell)(), ram: s => { (s.heavy || s.thud)(); (s.crack || s.thud)(); },
  grunt: s => (s.boarGrunt || s.snort || s.tell)(), sweep: s => (s.slash || s.tell)(), shout: s => (s.gobShout || s.tell)(), throw: s => (s.thud || s.tell)(), stake: s => (s.thud || s.stone)(),
  rear: s => (s.roar || s.tell)(), stomp: s => (s.heavy || s.thud)(), roar: s => (s.boreRoar || s.roar)(), creak: s => (s.creak || s.crack)(),
  timber: s => { (s.heavy || s.thud)(); (s.crack || s.thud)(); }, clank: s => (s.clank || s.thud)() };

const C = { hide: '#5a4a3e', hideD: '#3a2e26', hideL: '#7a6a5a', plate: '#8a8a92', plateD: '#5a5a62', plateL: '#b4b4bc', ram: '#7a5030', ramD: '#4a2e18', iron: '#3a3a42', ironL: '#7a7a86',
  horn: '#e0d4b0', eye: '#ffcf6a', red: '#ff4a2a', gob: '#6a8a3a', gobD: '#3e5a22', strap: '#3a2414', buckle: '#ffd36b', tim: '#8a5a32', timL: '#b07a44', timD: '#5a3a1d', rope: '#d8c08a' };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
/* THE POSE A MODE WEARS (local px, facing right, his feet at 0,0): body lift/pitch, head [dx, dy], ram [dx, dy, angle], legs, handlers - windup and release never the same picture */
export const POSE = {
  sleep: { lie: true, ram: [8, -6, 0], hand: 'sit', eye: 'shut' }, wake: { head: [0, 2], ram: [10, -12, 0], legs: 'stand', hand: 'sit' },
  walk: { head: [0, 0], ram: [12, -14, 0], legs: 'walk', hand: 'sit' }, recover: { head: [0, 3], ram: [10, -11, 0.1], legs: 'stand', hand: 'sit' },
  chargeTell: { head: [3, 7], ram: [10, -8, 0.15], legs: 'paw', pitch: 0.1, hand: 'whip', eye: 'red' }, charge: { head: [6, 5], ram: [18, -10, 0], legs: 'run', pitch: 0.05, hand: 'duck', eye: 'red' },
  dazed: { head: [-3, 5], ram: [6, -4, 0.4], legs: 'splay', hand: 'flail', eye: 'shut', stars: true },
  sweepTell: { head: [-3, -1], ram: [-14, -12, -0.7], legs: 'stand', twist: -1, hand: 'hold' }, sweep: { head: [4, 3], ram: [20, -4, 0.35], legs: 'lunge', twist: 1, hand: 'hold' },
  volleyTell: { head: [0, 1], ram: [10, -12, 0], legs: 'stand', hand: 'stand' }, volley: { head: [0, 1], ram: [10, -12, 0], legs: 'stand', hand: 'throw' },
  trampleTell: { rear: true, head: [-4, -14], ram: [4, -26, -0.6], hand: 'cling', eye: 'red' }, trample: { head: [4, 6], ram: [14, -6, 0.2], legs: 'splay', pitch: 0.12, hand: 'cling' },
  stuck: { head: [6, 6], ram: [20, -6, 0.3], legs: 'brace', sunk: 6, hand: 'flail', eye: 'red', timber: true }, tear: { head: [-2, -4], ram: [12, -16, -0.3], legs: 'splay', shake: true, hand: 'cling' },
  loose: { head: [6, 2], legs: 'run', noRam: true, hand: 'none', eye: 'red' },
};
/* HIS BODY (greybox): a great plated ox-thing, a ram slung under its chin on chains, two goblin handlers on a saddle-frame on its back */
function drawBeast(g, name, p, flash, time, ph, harnessCut) {
  const lift = p.rear ? -10 : 0, sunk = p.sunk || 0, step = (Math.floor(time * 7) & 1);
  g.save(); g.translate(0, sunk); if (p.pitch) g.rotate(p.pitch); if (p.rear) g.rotate(-0.45);
  const legs = p.lie ? [] : [[-22, 0], [-12, 0], [10, 0], [20, 0]];
  legs.forEach(([lx], k) => { const sw = p.legs === 'walk' || p.legs === 'run' ? ((k + step) % 2 ? 3 : -3) * (p.legs === 'run' ? 2 : 1) : p.legs === 'splay' ? (k < 2 ? -4 : 4) : p.legs === 'brace' ? (k < 2 ? -6 : 2) : p.legs === 'paw' && k === 2 ? (step ? 5 : -2) : 0;
    rect(g, lx + sw, -12, 6, 12, C.hideD); rect(g, lx + sw - 1, -3, 8, 3, '#1a120c'); });
  const by = p.lie ? -14 : -12 + lift;
  rect(g, -28, by - 26, 56, 26, flash ? '#ffffff' : C.hide); rect(g, -28, by - 26, 56, 3, C.hideL);
  for (let k = 0; k < 4; k++) { rect(g, -24 + k * 12, by - 24, 11, 9, C.plate); rect(g, -24 + k * 12, by - 24, 11, 2, C.plateL); rect(g, -24 + k * 12, by - 16, 11, 1, C.plateD); }
  const [hx, hy] = p.head || [0, 0]; rect(g, 24 + hx, by - 22 + hy, 16, 14, flash ? '#ffffff' : C.hideD); rect(g, 26 + hx, by - 24 + hy, 12, 4, C.plate);
  rect(g, 36 + hx, by - 28 + hy, 3, 8, C.horn); rect(g, 26 + hx, by - 28 + hy, 3, 8, C.horn);
  rect(g, 34 + hx, by - 18 + hy, 3, 3, p.eye === 'red' ? C.red : p.eye === 'shut' ? C.hideD : C.eye);
  /* THE RAM on its chains */
  if (!p.noRam && !harnessCut) { const [rx, ry, ra] = p.ram || [12, -14, 0]; g.save(); g.translate(rx + 10, by + ry + 8); g.rotate(ra);
    rect(g, -18, -5, 40, 10, C.ram); rect(g, -18, -5, 40, 2, '#a07040'); rect(g, 20, -7, 8, 14, C.iron); rect(g, 22, -6, 4, 12, C.ironL); rect(g, -6, -10, 2, 6, C.iron); rect(g, 8, -10, 2, 6, C.iron); g.restore(); }
  /* the harness and its BUCKLE (glints in P2) */
  if (!harnessCut) { rect(g, -26, by - 8, 52, 3, C.strap); rect(g, -4, by - 30, 3, 26, C.strap); if (ph > 1) { const on = Math.floor(time * 6) % 2; rect(g, -6, by - 32, 8, 7, on ? C.buckle : '#c09030'); } }
  /* THE HANDLERS on the saddle-frame */
  if (p.hand !== 'none' && !harnessCut) for (const [ox, k] of [[-18, 0], [2, 1]]) { const up = p.hand === 'stand' || p.hand === 'throw' ? -6 : p.hand === 'duck' ? 3 : 0, hy0 = by - 26 - 12 + up;
    rect(g, ox, hy0, 7, 10, C.gob); rect(g, ox + 1, hy0 - 6, 6, 6, C.gobD);
    const arm = p.hand === 'whip' ? -10 : p.hand === 'stand' ? -9 : p.hand === 'throw' ? 4 : p.hand === 'flail' ? (step ? -8 : 2) : p.hand === 'cling' ? 6 : -2;
    rect(g, ox + 6, hy0 + 2 + Math.min(0, arm), 2, Math.abs(arm) + 2, C.gobD); if (p.hand === 'stand' || p.hand === 'whip') rect(g, ox + 7, hy0 + arm - 3, 2, 8, p.hand === 'whip' ? C.rope : C.timL); }
  if (p.timber) for (let k = 0; k < 4; k++) rect(g, -30 + k * 16, by - 6 - (k % 2) * 8, 18, 4, C.tim);
  g.restore();
  if (p.stars) for (let k = 0; k < 3; k++) { const a = time * 5 + k * 2.1; rect(g, 30 + Math.cos(a) * 10, by - 36 + Math.sin(a) * 4, 3, 3, '#ffe9a0'); }
}
/* A SCAFFOLD: standing (deck on two posts, braces, the PROP at its inner foot with its wedge, rope and strain marks), tipping, a WRECK on the floor, spent (stumps), rising */
function scafDraw(g, s, X, Y, floorY, time, lineCol, ctxTS) {
  const fy = Y(floorY), x0 = X(s.x0), x1 = X(s.x1), dy = Y(s.deckY);
  if (s.st === 'stand' || s.st === 'fall') { const k = s.st === 'fall' ? 1 - s.t / BB.scaf.fall : 0;
    g.save(); g.translate(s.dir > 0 ? x1 : x0, fy); g.rotate(s.dir * k * k * Math.PI / 2); g.translate(-(s.dir > 0 ? x1 : x0), -fy);
    rect(g, x0, dy, x1 - x0, 4, C.tim); rect(g, x0, dy, x1 - x0, 1, C.timL); rect(g, x0 + 2, dy + 4, 3, fy - dy - 4, C.timD); rect(g, x1 - 5, dy + 4, 3, fy - dy - 4, C.timD);
    g.strokeStyle = C.timD; g.beginPath(); g.moveTo(x0 + 3, dy + 4); g.lineTo(x1 - 4, fy); g.stroke(); g.restore();
    if (s.st === 'stand') { const px = X(s.x); rect(g, px - 2, dy + 2, 4, fy - dy - 2, C.tim); rect(g, px - 3, dy + 10, 6, 2, C.rope); rect(g, px - 3, dy + 18, 6, 2, C.rope);
      g.fillStyle = '#ff9a5c'; const sh = Math.sin(time * 18) > 0 ? 1 : 0; g.fillRect(px + 3 + sh, dy + 6, 2, 1); g.fillRect(px + 5 + sh, dy + 7, 2, 1); g.fillRect(px + 3 + sh, dy + 8, 2, 1);
      g.fillStyle = '#c9a060'; g.beginPath(); g.moveTo(px - s.dir * 7, fy); g.lineTo(px + s.dir * 3, fy); g.lineTo(px - s.dir * 7, fy - 6); g.closePath(); g.fill();
      if (Math.floor(time * 3) % 2) rect(g, px - s.dir * 9, fy - 8, 2, 2, '#ffd36b');
      if (lineCol) { const [lo, hi] = BBM.lineOf(s); g.fillStyle = lineCol; for (let q = lo; q < hi; q += 8) g.fillRect(X(q), fy - 1, 5, 2); } }
    return; }
  if (s.st === 'down' || s.st === 'pin') { const [lo, hi] = BBM.lineOf(s); for (let q = lo; q < hi; q += 10) { rect(g, X(q), fy - 8 - ((q / 10) % 2) * 4, 12, 4, C.tim); rect(g, X(q) + 4, fy - 14, 3, 14, C.timD); } return; }
  if (s.st === 'spent') { rect(g, x0 + 2, fy - 4, 3, 4, C.timD); rect(g, x1 - 5, fy - 4, 3, 4, C.timD); if (s.t < 2) { const k = 1 - s.t / 2; rect(g, x0 + 2, fy - (fy - dy) * k, 3, (fy - dy) * k, C.timD); rect(g, x1 - 5, fy - (fy - dy) * k, 3, (fy - dy) * k, C.timD); } }
}

export function makeBatteringBeastHands(ctx) {
  let S = null; const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'batteringbeast' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'batteringbeast';
  H.clear = () => { S = null; BOSS_PHASE.batteringbeast = 1; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'batteringbeast' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.bbKeys = pp.bbKeys || new Map(); if (pp.bbKeys.size > 120) pp.bbKeys.clear(); if (pp.bbKeys.has(key)) return true; pp.bbKeys.set(key, 1); return false; };
  const deckSet = (id, on) => { const s = S && S.scafs[id]; if (!s) return; const [x0, x1, row] = s.cols; for (let x = x0; x <= x1; x++) ctx.cellSet(x, row, on ? ctx.T.ONEWAY : ctx.T.AIR); };
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = BBM.newFight(BBM.geom(Ar, ctx.TS)); BOSS_PHASE.batteringbeast = 1; for (const s of S.scafs) deckSet(s.id, true);
    const hp = ctx.EHP.batteringbeast || BB.hp;
    const e = { ...base, t: 'batteringbeast', w: BB.w, h: BB.h, hp, maxHp: hp, noGrav: true, markH: BB.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0 };
    e.x = base.x; e.y = S.G.floorY; for (const pp of ctx.players) pp.bbKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  const bzD = d => ctx.heroId && ctx.heroId() === 'berserker' ? Math.round(d * BB.bz.hurt) : d;
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.batteringbeast = ph; },
      mark: m => ctx.number(e.x, e.y - BB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      dust: (x, y, n) => ctx.dust(x, y, n), deck: (id, on) => deckSet(id, on),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 20, 40, '#ffd36b'); ctx.burst(x, y - 20, 14, ['#8a5a32', '#c9a060', '#5a3a1d'], 100, 0.7); } else if (k === 'ward') ctx.ring(x, y - 20, 42, '#c8d8e8'); },
      splinter: s => { const [lo, hi] = BBM.lineOf(s); ctx.burst((lo + hi) / 2, S.G.floorY - 6, 16, ['#8a5a32', '#c9a060', '#3e2614'], 110, 0.7); },
      gate: () => { ctx.burst(S.G.x0 + 4, S.G.floorY - 30, 12, ['#6a4a2a', '#c9a060'], 90, 0.6); },
      palisade: () => { ctx.burst(S.G.x1 - 6, S.G.floorY - 30, 22, ['#8a5a32', '#c9a060', '#6a8a3a'], 140, 0.9); },
      loose: () => { ctx.burst(e.x, e.y - BB.h - 10, 16, ['#6a8a3a', '#3e5a22', '#7a5030'], 120, 0.8); S.stakes = []; },
      trunkBlow: d => { e.hp = Math.max(1, e.hp - d); e.flash = 0.15; ctx.number(e.x, e.y - BB.h - 10, '-' + d, '#ff6b6b'); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(e.x, bzD(d), { who: e, name, unblockable: !o.blockable }); });
          if (res === 'hit' && o.knock) { P.vx = o.knock; P.vy = Math.min(P.vy || 0, -140); }
          if (res === 'blocked' && o.blockChip && !(P.parryT > 0.2)) { const c = Math.max(1, Math.round(d * o.blockChip)); P.hp = Math.max(1, P.hp - c); if (S) { S.hurt = S.hurt || {}; S.hurt[name + 'Chip'] = (S.hurt[name + 'Chip'] || 0) + c; } if (o.knock) P.vx = o.knock * 0.7; ctx.number(P.x, P.y - 30, BBM.BB_SAY.jarred, '#ff9a5c'); } }); },
      hitHero: (h, d, name, key) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (key && keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer(e.x, bzD(d), { who: e, name, unblockable: true })); }); },
    };
  }
  H.update = (e, dt) => {
    if (!S || !e.alive) return; if (!A()) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = 1.8; ctx.number(e.x, e.y - 76, BBM.BB_SAY.wake, '#ffd36b'); SOUND.roar(ctx.sfx); ctx.shake(5); }
    if (S.woke && !S.told.rule && e.mode !== 'wake') { S.told.rule = 1; ctx.number(S.G.mid, S.G.floorY - 120, BBM.BB_SAY.rule, '#ffd36b'); }
    const w = world(e);
    for (const pp of ctx.players) for (const a of (pp.rgArrows || [])) { if (a.state !== 'fly') continue; const s = S.scafs.find(q => q.st === 'stand' && Math.abs(a.x - q.x) < 8 && a.y > S.G.floorY - 50 && a.y < S.G.floorY); if (s) { a.state = 'drop'; a.vx *= -0.1; a.vy = -40; BBM.knockProp(S, s, w); } }
    BBM.stepBeast(e, S, dt, heroes(), w);
    e.phase = S.ph; e.open = BBM.bbOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* A HERO'S BLOW (main.js attackBox): on a prop, it goes; on the buckle (P2), a cut */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const w = world(e);
    for (const s of S.scafs) { if (s.st !== 'stand') continue; const box = { l: s.x - 8, r: s.x + 8, t: S.G.floorY - 40, b: S.G.floorY };
      if (hb.l < box.r && hb.r > box.l && hb.t < box.b && hb.b > box.t && ctx.hitOnce(s)) BBM.knockProp(S, s, w); }
    if (S.ph > 1 && !S.harness.cut) { const bx = BBM.buckleBox(e); if (hb.l < bx.r && hb.r > bx.l && hb.t < bx.b && hb.b > bx.t && ctx.hitOnce(S.harness)) { S.harness.lastT = ctx.time(); BBM.hitBuckle(e, S, w); } } };
  H.take = (e, dmg, fromX, pl) => { if (!S) return dmg; const [d, word] = BBM.takeBlow(e, S, dmg, pl);
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 20, e.y - 20, sd, 4);
      if (!S.told.hide && word === 'ARMOURED') { S.told.hide = 1; ctx.hint && ctx.hint('HIS ARMOUR TURNS A CUT. KNOCK OUT A SCAFFOLD PROP: ON HIM, OR IN HIS PATH, HE STICKS IN THE WRECK. OR COME DOWN ON HIS BACK.'); } }
    return d; };
  H.barName = e => 'THE BATTERING BEAST' + (BBM.bbOpen(e) ? '  ' + (BBM.OPEN_NAME[e.mode] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : '');
  H.end = () => { if (S) { S.stakes = []; S.waves = []; } BOSS_PHASE.batteringbeast = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, harness: { ...S.harness }, scafs: S.scafs.map(s => ({ id: s.id, x: s.x, st: s.st })), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const e = live(), x = X(cx), y = Y(cy), G = S.G;
    /* THE OLD FOREST GATE at the clearing's west wall (the gate you came through), and the palisade's unfinished end at its east */
    const gx = x(G.x0) - 14, fy = y(G.floorY); if (gx > -60) { rect(g, gx - 10, fy - 70, 24, 70, '#4a3020'); rect(g, gx - 14, fy - 76, 32, 8, '#3a2414'); for (let k = 0; k < 4; k++) rect(g, gx - 8 + k * 5, fy - 64, 2, 60, '#2e1c10'); rect(g, gx - 10, fy - 40, 24, 3, '#6a6a72'); }
    const px = x(G.x1) + 2; if (px < ctx.VW() + 60) for (let k = 0; k < 4; k++) { rect(g, px + k * 6, fy - 60 + (k % 2) * 6, 5, 60, '#6a4428'); rect(g, px + k * 6 + 1, fy - 64 + (k % 2) * 6, 3, 4, '#c9a060'); }
    for (const s of S.scafs) { if (s.st === 'down' || s.st === 'pin') continue; const hot = e && ctx.bossActive && s.st === 'stand' && BBM.underLine(s, e.x, BB.w / 2 - 6);
      scafDraw(g, s, x, y, G.floorY, time, !ctx.bossActive ? null : hot ? (Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffd36b') : 'rgba(255,211,107,0.55)'); } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, m = e.mode, x = e.x - cx, y = e.y - cy, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06, p = POSE[m] || POSE.walk;
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(R(x - 30), R(y - 2), 60, 3); g.globalAlpha = 1;
    g.save(); g.translate(R(x + (p.shake ? Math.sin(time * 50) * 2 : 0)), R(y)); g.scale(f, 1); drawBeast(g, m, p, flash, time, S.ph, S.harness.cut); g.restore();
    if (m === 'chargeTell' && Math.random() < 0.5) ctx.dust(e.x + f * 20, e.y, 1); };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss, G = S.G, x = X(cx), y = Y(cy);
    for (const s of S.scafs) if (s.st === 'down' || s.st === 'pin') scafDraw(g, s, x, y, G.floorY, time, null);
    if (!ctx.bossActive || !e || e.t !== 'batteringbeast') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    for (const c of S.stakes) { const q = BBM.stakeAt(c, G.floorY); g.save(); g.translate(x(q.x), y(q.y)); g.rotate(q.k * 6); rect(g, -6, -1, 12, 3, '#a8783e'); rect(g, 5, -2, 3, 5, '#e0c890'); g.restore();
      g.strokeStyle = blink; g.strokeRect(x(c.tx) - BB.volley.r, y(G.floorY) - 3, BB.volley.r * 2, 3); }
    for (const q of S.waves) for (let k = 0; k < 3; k++) rect(g, x(q.x) - q.dir * k * 6 - 3, y(G.floorY) - 5 - (k % 2) * 3, 6, 5, k ? '#6a4a2a' : '#8e6a40');
    if (e.mode === 'chargeTell') { const st = BBM.chargeStop(S, e.x, e.face || 1); g.globalAlpha = 0.35; g.fillStyle = '#ff6b6b'; for (let q = Math.min(e.x, st.x); q < Math.max(e.x, st.x); q += 10) g.fillRect(x(q), y(G.floorY) - 1, 6, 1); g.globalAlpha = 1;
      const ex = x(st.x + (e.face || 1) * (BB.w / 2 + 3)), ey = y(G.floorY), on = Math.floor(time * 10) % 2; g.fillStyle = st.scaf ? (on ? '#ffd36b' : '#fff6e0') : (on ? '#ff6b6b' : '#ffd36b'); g.fillRect(ex - 1, ey - 18, 2, 16); }
    for (const s of BBM.wrecks(S)) { const [lo, hi] = BBM.lineOf(s), fy = y(G.floorY); g.globalAlpha = 0.85; g.fillStyle = '#ffd36b'; for (const q of [lo, hi]) g.fillRect(x(q) - 1, fy - 15, 2, 13); g.globalAlpha = 1; }
    const ex = x(e.x), ey = y(e.y - BB.h / 2);
    if (BBM.bbOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.strokeRect(ex - 36, ey - 30, 72, 56); g.lineWidth = 1; g.globalAlpha = 1;
      const by = y(e.y - 62); ctx.text(BBM.OPEN_NAME[e.mode] || 'OPEN', ex, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(ex - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(ex - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.strokeRect(ex - 38, ey - 32, 76, 60); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', ex, y(e.y - BB.h - 30), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, ex, y(e.y - BB.h - 44) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
  };
  return H;
}
/* HIS BESTIARY CARD: two of his poses (walk, the charge's windup) - main.js SPR.batteringbeastCard */
export function bakeBatteringBeastCard() {
  const fr = [['walk', POSE.walk], ['chargeTell', POSE.chargeTell]].map(([n, p], i) => { const [c, g] = canvas(64, 40); g.imageSmoothingEnabled = false; g.save(); g.translate(28, 38); g.scale(0.5, 0.5); drawBeast(g, n, p, false, i * 0.3, 1, false); g.restore(); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 28, ay: 38, w: 56, h: 40 };
}
export const _drawBeast = drawBeast;
