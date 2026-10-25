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
import * as BBA from './redraw/battering_beast_art.js';   /* (claude/palisadeart) every picture of him and his clearing: src/redraw/battering_beast_art.js */
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
  H.take = (e, dmg, fromX, pl, tag) => { if (!S) return dmg; const [d, word] = BBM.takeBlow(e, S, dmg, pl);
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 20, e.y - 20, sd, 4);
      if (!S.told.hide && word === 'ARMOURED') { S.told.hide = 1; ctx.hint && ctx.hint('HIS ARMOUR TURNS A CUT. KNOCK OUT A SCAFFOLD PROP: ON HIM, OR IN HIS PATH, HE STICKS IN THE WRECK. OR COME DOWN ON HIS BACK.'); } }
    return d; };
  H.barName = e => 'THE BATTERING BEAST' + (BBM.bbOpen(e) ? '  ' + (BBM.OPEN_NAME[e.mode] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : '');
  H.end = () => { if (S) { S.stakes = []; S.waves = []; } BOSS_PHASE.batteringbeast = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, harness: { ...S.harness }, scafs: S.scafs.map(s => ({ id: s.id, x: s.x, st: s.st })), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const e = live(), x = X(cx), y = Y(cy), G = S.G;
    /* THE OLD FOREST GATE at the clearing's west wall (the gate you came through), and the palisade's unfinished end at its east */
    const gx = x(G.x0) - 4, fy = y(G.floorY); if (gx > -80) BBA.drawGate(g, gx, fy);
    const px = x(G.x1) + 2; if (px < ctx.VW() + 60) BBA.drawEnd(g, px, fy, time);
    for (const s of S.scafs) { if (s.st === 'down' || s.st === 'pin') continue; const hot = e && ctx.bossActive && s.st === 'stand' && BBM.underLine(s, e.x, BB.w / 2 - 6);
      BBA.drawScaf(g, s, x, y, G.floorY, time, !ctx.bossActive ? null : hot ? (Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffd36b') : 'rgba(255,211,107,0.55)', BBM.lineOf, BB.scaf.fall); } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, m = e.mode, x = e.x - cx, y = e.y - cy, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06, p = POSE[m] || POSE.walk;
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(R(x - 30), R(y - 2), 60, 3); g.globalAlpha = 1;
    const step = Math.floor(time * (m === 'charge' || m === 'loose' ? 11 : 6)), cut = S.harness.cut, fr = flash ? BBA.whiteOf(m, cut, step) : BBA.frame(m, cut, step, S.ph);   /* (claude/palisadeart) his baked frame: every windup and release its own picture */
    g.save(); g.translate(R(x + (p.shake ? Math.sin(time * 50) * 2 : 0)), R(y)); g.scale(f, 1); g.drawImage(fr, -BBA.AX, -BBA.AY);
    if (S.ph > 1 && !cut && m !== 'sleep' && m !== 'dead') { const on = Math.floor(time * 6) % 2; g.fillStyle = on ? '#ffd36b' : '#d8a020'; g.fillRect(-3, -37, 6, 4); g.fillStyle = on ? '#fff6d0' : '#a07418'; g.fillRect(-1, -36, 2, 2); }   /* THE BUCKLE glints (P2): where the hands cut */
    g.restore(); e.lastSet = BBA.deadSet(); e.lastFrame = 0; e.lastBigF = 1;   /* the body he leaves when he falls (main.js spawnCorpse) */
    if (m === 'chargeTell' && Math.random() < 0.5) ctx.dust(e.x + f * 20, e.y, 1); };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss, G = S.G, x = X(cx), y = Y(cy);
    for (const s of S.scafs) if (s.st === 'down' || s.st === 'pin') BBA.drawScaf(g, s, x, y, G.floorY, time, null, BBM.lineOf, BB.scaf.fall);
    if (!ctx.bossActive || !e || e.t !== 'batteringbeast') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    for (const c of S.stakes) { const q = BBM.stakeAt(c, G.floorY); g.save(); g.translate(x(q.x), y(q.y)); g.rotate(q.k * 6); rect(g, -6, -1, 12, 3, '#a8783e'); rect(g, 5, -2, 3, 5, '#e0c890'); g.restore();
      g.strokeStyle = blink; g.strokeRect(x(c.tx) - BB.volley.r, y(c.ty ?? G.floorY) - 3, BB.volley.r * 2, 3); }
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
export function bakeBatteringBeastCard() { return BBA.bakeCard(); }   /* (claude/palisadeart) two of his baked poses, scaled to a card */

