// src/battering-beast-hands.js - THE BATTERING BEAST's HANDS (claude/palisadewood). src/battering-beast.js is the fight (pure); this binds it to the world: his told blows on
// the heroes (keyed once a blow; a shield turns only the yellow sweep, and jars), THE CLEARING'S TWO SCAFFOLDS (a hero's blow on a prop knocks it: strike(hb); the ranger's
// arrow knocks one too; the deck's boards go and come back), THE BUCKLE (P2), the handlers' stakes, (claude/beast3) THE HORNSMAN's horn (a blow or an arrow on him
// while it is up: ORDER LOST), the volley's lanes and arrows, the archers on the walls, THE WALL BREAKER's run, the rolling timbers and THE BREACH's rubble step (solid cells) - and the drawing.
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
  timber: s => { (s.heavy || s.thud)(); (s.crack || s.thud)(); }, clank: s => (s.clank || s.thud)(),
  horn: s => (s.hornDraw || s.gobShout || s.tell)(), hornDraw: s => (s.hornDraw || s.tell)(), blast: s => (s.hornBlast || s.roar)(), arrows: s => (s.arrowWhistle || s.thud)(), burst: s => { (s.crack || s.thud)(); (s.fire || s.whoosh || s.thud)(); } };   /* (claude/palisade2) the handlers' horn on an order; a pitch pot bursting */

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
  stuck: { head: [6, 6], ram: [20, -6, 0.3], legs: 'brace', sunk: 6, hand: 'flail', eye: 'red', timber: true }, tear: { head: [-2, -4], ram: [12, -16, -0.3], legs: 'splay', shake: true, hand: 'cling' },
  loose: { head: [6, 2], legs: 'run', noRam: true, hand: 'none', eye: 'red' },
  /* (claude/palisade2) THE NEW MOVES, each its own windup and release (B16) */
  sweepMid: { head: [2, 0], ram: [-20, -6, -0.45], legs: 'stand', twist: -1, hand: 'hold' }, sweepBack: { head: [-2, 2], ram: [-24, -4, -0.35], legs: 'lunge', twist: -1, hand: 'hold' },
  potTell: { head: [0, 1], ram: [10, -12, 0], legs: 'stand', hand: 'pot' }, pot: { head: [0, 1], ram: [10, -12, 0], legs: 'stand', hand: 'lob' },
  batterTell: { head: [4, 8], ram: [14, -9, 0.1], legs: 'brace', pitch: 0.06, hand: 'whip', eye: 'red' }, batter: { head: [8, 6], ram: [22, -8, 0], legs: 'lunge', pitch: 0.04, hand: 'cling', eye: 'red', shake: true },
  unchain: { rear: true, head: [-4, -12], ram: [2, -24, -0.8], hand: 'flail', eye: 'red' },
  flailTell: { head: [-6, -6], legs: 'brace', noRam: true, hand: 'none', eye: 'red', chain: 'coil' }, flail: { head: [8, 4], legs: 'lunge', noRam: true, hand: 'none', eye: 'red', chain: 'out' },
  kickTell: { head: [-2, 6], legs: 'kickTell', noRam: true, hand: 'none', eye: 'red', pitch: 0.12 }, kick: { head: [0, 8], legs: 'kick', noRam: true, hand: 'none', eye: 'red', pitch: 0.2 },
  /* (claude/beast3) THE VOLLEY ORDER (the Hornsman's horn up, the blast, the order lost) and THE WALL BREAKER (the turn, the run, the slam, the recoil off the breach) */
  orderTell: { head: [-2, -6], ram: [8, -9, 0], legs: 'brace', hand: 'whip', horn: 'up' }, order: { head: [2, 2], ram: [8, -9, 0.05], legs: 'stand', hand: 'cling', horn: 'blast' },
  lost: { head: [-4, 4], ram: [6, -8, 0.2], legs: 'splay', hand: 'flail', horn: 'reel' },
  wallTell: { head: [6, 12], legs: 'paw', noRam: true, hand: 'none', eye: 'red', pitch: 0.12 }, wallRun: { head: [12, 12], legs: 'run', noRam: true, hand: 'none', eye: 'red', pitch: 0.15 },
  wallHit: { head: [14, 8], legs: 'brace', noRam: true, hand: 'none', eye: 'red', shake: true }, wallBack: { head: [0, 6], legs: 'splay', noRam: true, hand: 'none', eye: 'shut' },
};
export function makeBatteringBeastHands(ctx) {
  let S = null; const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'batteringbeast' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'batteringbeast';
  H.clear = () => { S = null; fall = null; BOSS_PHASE.batteringbeast = 1; };
  let fall = null;   /* (claude/beast3art) THE HORNSMAN FALLS: the tumble off the gantry, drawn in drawOver (world x, y of his body, the beast's facing, the clock at the first frame) */
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'batteringbeast' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.bbKeys = pp.bbKeys || new Map(); if (pp.bbKeys.size > 120) pp.bbKeys.clear(); if (pp.bbKeys.has(key)) return true; pp.bbKeys.set(key, 1); return false; };
  const deckSet = (id, on) => { const s = S && S.scafs[id]; if (!s) return; const [x0, x1, row] = s.cols; for (let x = x0; x <= x1; x++) ctx.cellSet(x, row, on ? ctx.T.ONEWAY : ctx.T.AIR); };
  /* (claude/beast3) THE BREACH's rubble step: solid cells against the east wall (on), or cleared (a fresh fight starts with the palisade whole); a hero or a crewman where it lands is lifted onto it */
  const rubbleSet = on => { if (!S) return; const [c0, c1, row] = BBM.rubbleCols(S.G), TS = ctx.TS;
    for (let x = c0; x <= c1; x++) ctx.cellSet(x, row, on ? ctx.T.SOLID : ctx.T.AIR);
    if (on) for (const b of [...ctx.players, ...S.adds]) if (b && b.x > c0 * TS - 6 && b.x < (c1 + 1) * TS + 6 && b.y > row * TS - 2 && b.y <= (row + 1) * TS + 2) { b.y = row * TS; b.vy = Math.min(0, b.vy || 0); } };
  H.rubble = on => rubbleSet(on);   /* (for tools/beast3-shots.mjs) */
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = BBM.newFight(BBM.geom(Ar, ctx.TS)); BOSS_PHASE.batteringbeast = 1; for (const s of S.scafs) deckSet(s.id, true); rubbleSet(false);
    const hp = ctx.EHP.batteringbeast || BB.hp;
    const e = { ...base, t: 'batteringbeast', w: BB.w, h: BB.h, hp, maxHp: hp, noGrav: true, markH: BB.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0 };
    e.x = base.x; e.y = S.G.floorY; for (const pp of ctx.players) pp.bbKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  const bzD = d => ctx.heroId && ctx.heroId() === 'berserker' ? Math.round(d * BB.bz.hurt) : ctx.heroId && ctx.heroId() === 'pyro' ? Math.max(1, Math.round(d * BB.py.hurt)) : d;
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.batteringbeast = ph; },
      mark: m => ctx.number(e.x, e.y - BB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      dust: (x, y, n) => ctx.dust(x, y, n), deck: (id, on) => deckSet(id, on),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 20, 40, '#ffd36b'); ctx.burst(x, y - 20, 14, ['#8a5a32', '#c9a060', '#5a3a1d'], 100, 0.7); } else if (k === 'ward') ctx.ring(x, y - 20, 42, '#c8d8e8'); else if (k === 'blast') { S.blastT = 0.6; } },
      rubble: on => { rubbleSet(on); ctx.burst(BBM.wallX(S) + 30, S.G.floorY - 30, 26, ['#8a5a32', '#c9a060', '#5a5560', '#3e2614'], 150, 1); },   /* (claude/beast3) THE BREACH */
      hornFalls: () => { fall = { x: e.x - (e.face || 1) * 2, y: e.y - 31, f: e.face || 1, t0: null }; const hb = BBM.hornBox(e); ctx.burst((hb[0] + hb[1]) / 2, hb[2] + 10, 14, ['#a8442a', '#5a5e6c', '#d8c08a'], 120, 0.8); },   /* (claude/beast3) the Hornsman knocked off the gantry */
      splinter: s => { const [lo, hi] = BBM.lineOf(s); ctx.burst((lo + hi) / 2, S.G.floorY - 6, 16, ['#8a5a32', '#c9a060', '#3e2614'], 110, 0.7); },
      gate: () => { ctx.burst(S.G.x0 + 4, S.G.floorY - 30, 12, ['#6a4a2a', '#c9a060'], 90, 0.6); },
      palisade: () => { ctx.burst(S.G.x1 - 6, S.G.floorY - 30, 22, ['#8a5a32', '#c9a060', '#6a8a3a'], 140, 0.9); },
      loose: () => { ctx.burst(e.x, e.y - BB.h - 10, 16, ['#6a8a3a', '#3e5a22', '#7a5030'], 120, 0.8); S.stakes = []; S.pots = []; },
      add: (x, y, d) => ctx.spawn ? ctx.spawn({ t: 'sprig', x, y, vx: d * 90, vy: -180, w: 8, h: 10, hp: Math.round((ctx.EHP.sprig || 10) * BB.unchain.addHp), speed: 30, face: d, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0.7, bbHandler: true, cnSkin: 'siegecrew' }) : null,   /* (claude/palisade2) THE HANDLERS ON FOOT: two goblins bucked off his back */
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
    for (const pp of ctx.players) for (const a of (pp.rgArrows || [])) { if (a.state !== 'fly') continue; const s = S.scafs.find(q => q.st === 'stand' && Math.abs(a.x - q.x) < 8 && a.y > S.G.floorY - 50 && a.y < S.G.floorY); if (s) { a.state = 'drop'; a.vx *= -0.1; a.vy = -40; BBM.knockProp(S, s, w); continue; }
      if (BBM.hornUp(e, S)) { const hb = BBM.hornBox(e); if (a.x > hb[0] && a.x < hb[1] && a.y > hb[2] && a.y < hb[3]) { a.state = 'drop'; a.vx *= -0.1; a.vy = -40; BBM.hornStruck(e, S, w); } } }   /* (claude/beast3) an arrow in the Hornsman while the horn is up: ORDER LOST */
    S.blastT = Math.max(0, (S.blastT || 0) - dt);
    BBM.stepBeast(e, S, dt, heroes(), w);
    e.phase = S.ph; e.open = BBM.bbOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* A HERO'S BLOW (main.js attackBox): on a prop, it goes; on the buckle (P2), a cut */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const w = world(e);
    for (const s of S.scafs) { if (s.st !== 'stand') continue; const box = { l: s.x - 8, r: s.x + 8, t: S.G.floorY - 40, b: S.G.floorY };
      if (hb.l < box.r && hb.r > box.l && hb.t < box.b && hb.b > box.t && ctx.hitOnce(s)) BBM.knockProp(S, s, w); }
    if (BBM.hornUp(e, S)) { const [l, r, t, b] = BBM.hornBox(e); if (hb.l < r && hb.r > l && hb.t < b && hb.b > t && ctx.hitOnce(S.horn)) BBM.hornStruck(e, S, w); }   /* (claude/beast3) a blow on the Hornsman while the horn is up: ORDER LOST */
  };
  H.take = (e, dmg, fromX, pl, tag) => { if (!S) return dmg; const [d, word] = BBM.takeBlow(e, S, dmg, pl);
    if (word) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 20, e.y - 20, sd, 4);
      if (!S.told.hide && word === 'ARMOURED') { S.told.hide = 1; ctx.hint && ctx.hint('HIS ARMOUR TURNS A CUT. KNOCK OUT A SCAFFOLD PROP: ON HIM, OR IN HIS PATH, HE STICKS IN THE WRECK. OR COME DOWN ON HIS BACK.'); } }
    return d; };
  H.barName = e => 'THE BATTERING BEAST' + (BBM.bbOpen(e) ? '  ' + (BBM.OPEN_NAME[e.mode] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : '');
  H.end = () => { if (S) { S.stakes = []; S.lanes = []; S.timbers = []; S.pots = []; S.fires = []; for (const a of S.adds) if (a && a.alive) { a.alive = false; a.dying = 0.4; } S.adds = []; } BOSS_PHASE.batteringbeast = 1; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, harness: { ...S.harness }, horn: { ...S.horn }, breach: S.breach, lanes: S.lanes.length, timbers: S.timbers.length, scafs: S.scafs.map(s => ({ id: s.id, x: s.x, st: s.st })), n: JSON.parse(JSON.stringify(S.n)), hurt: { ...(S.hurt || {}) } };
  const X = cx => v => R(v - cx), Y = cy => v => R(v - cy);
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const e = live(), x = X(cx), y = Y(cy), G = S.G;
    /* THE OLD FOREST GATE at the clearing's west wall (the gate you came through), and the palisade's unfinished end at its east */
    const gx = x(G.x0) - 4, fy = y(G.floorY); if (gx > -80) BBA.drawGate(g, gx, fy);
    const px = x(G.x1) - 60; /* (claude/beast3) drawn just inside the east wall, over the rubble cells: the camera stops at the wall, so the end stood off-screen before */ if (px < ctx.VW() + 60) BBA.drawEnd(g, px, fy, time, S.breach, S.crack, e && e.mode === 'wallHit' ? 1 - Math.max(0, e.modeT) / BB.wall.slam : 0);   /* (claude/beast3) cracked by LOOSE, leaning in the slam, BREACHED */
    /* (claude/beast3) THE PALISADE'S ARCHERS: one on the old gate's lintel, one on the palisade's next rank - they draw on the Hornsman's horn and loose on the blast */
    const ap = !e || !ctx.bossActive ? 'idle' : e.mode === 'orderTell' && !S.horn.down ? 'draw' : e.mode === 'order' ? 'loose' : 'idle';
    if (gx > -80) BBA.drawArcher(g, gx + 4, fy - 106, 1, ap, time); if (px < ctx.VW() + 60) BBA.drawArcher(g, px + 47, fy - 70, -1, ap, time + 0.3);
    for (const s of S.scafs) { if (s.st === 'down' || s.st === 'pin') continue; const hot = e && ctx.bossActive && s.st === 'stand' && BBM.underLine(s, e.x, BB.w / 2 - 6);
      const sx = s.shake > 0 ? Math.round(Math.sin(time * 70) * 2) : 0, xs = sx ? v => x(v) + sx : x;   /* (claude/palisade2) BATTERED: the scaffold shakes before it collapses */
      BBA.drawScaf(g, s, xs, y, G.floorY, time, !ctx.bossActive ? null : hot ? (Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffd36b') : 'rgba(255,211,107,0.55)', BBM.lineOf, BB.scaf.fall, s.shake > 0 ? Math.min(1, 1 - s.shake / BB.batter.shake) : 0);
      if (s.shake > 0) { const on = Math.floor(time * 10) % 2; g.fillStyle = on ? '#ff6b6b' : '#ffd36b'; const w0 = R((s.x1 - s.x0) * Math.min(1, s.shake / BB.batter.shake)); g.fillRect(x(s.x0), y(s.deckY) - 4, w0, 2);
        for (let k = 0; k < 4; k++) { g.fillStyle = '#c9a060'; g.fillRect(x(s.x0) + ((k * 23 + Math.floor(time * 30)) % Math.max(1, R(s.x1 - s.x0))), y(s.deckY) + 2 + ((time * 60 + k * 7) % 30), 2, 2); } } } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, m = e.mode, x = e.x - cx, y = e.y - cy, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06, p = POSE[m] || POSE.walk;
    g.globalAlpha = 0.3; g.fillStyle = '#10060a'; g.fillRect(R(x - 30), R(y - 2), 60, 3); g.globalAlpha = 1;
    const step = Math.floor(time * (m === 'charge' || m === 'loose' || m === 'wallRun' ? 11 : 6)), cut = S.harness.cut, solo = S.horn.down, fr = flash ? BBA.whiteOf(m, cut, step, solo) : BBA.frame(m, cut, step, S.ph, solo);   /* (claude/beast3) solo: the Hornsman knocked off the gantry */   /* (claude/palisadeart) his baked frame: every windup and release its own picture */
    g.save(); g.translate(R(x + (p.shake ? Math.sin(time * 50) * 2 : 0)), R(y)); g.scale(f, 1); g.drawImage(fr, -BBA.AX, -BBA.AY);
    g.restore(); e.lastSet = BBA.deadSet(); e.lastFrame = 0; e.lastBigF = 1;   /* the body he leaves when he falls (main.js spawnCorpse) */
    if (m === 'chargeTell' && Math.random() < 0.5) ctx.dust(e.x + f * 20, e.y, 1); };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const e = ctx.boss, G = S.G, x = X(cx), y = Y(cy);
    for (const s of S.scafs) if (s.st === 'down' || s.st === 'pin') BBA.drawScaf(g, s, x, y, G.floorY, time, null, BBM.lineOf, BB.scaf.fall);
    if (S.breach) { const [c0, c1] = BBM.rubbleCols(G); BBA.drawRubble(g, x(c0 * ctx.TS), x((c1 + 1) * ctx.TS), y(G.floorY), S.breach); }   /* (claude/beast3) THE BREACH: the rubble step stays */
    if (!ctx.bossActive || !e || e.t !== 'batteringbeast') return;
    const blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* (claude/beast3) THE VOLLEY ORDER's LANES: marked on the floor (and faintly up the column - a deck is no shelter) from the first beat of the horn; wave one red, wave two orange;
       they blink faster as they come; the arrows come down the last BB.order.flight s and stand in the floor a moment after */
    const fyy = y(G.floorY);
    for (const q of S.lanes) { const l = x(q.l), r2 = x(q.r), w2 = r2 - l;
      if (q.done) { g.globalAlpha = Math.max(0, Math.min(1, q.stuck / 0.3)); for (let k = 0; k < 4; k++) BBA.drawArrowStuck(g, l + 5 + R((k + 0.5) * (w2 - 10) / 4), fyy, k); g.globalAlpha = 1; continue; }
      const col = q.wave === 1 ? '#ff4a2a' : '#ff9a5c', soon = q.t < 0.5, on = Math.floor(time * (soon ? 16 : 6)) % 2;
      g.globalAlpha = 0.13 + (soon ? 0.1 : 0); g.fillStyle = col; g.fillRect(l, fyy - BB.order.top, w2, BB.order.top); g.globalAlpha = 1;
      g.globalAlpha = 0.5 + (soon ? 0.3 : 0); g.fillStyle = col; g.fillRect(l, fyy - BB.order.top, 1, BB.order.top); g.fillRect(r2 - 1, fyy - BB.order.top, 1, BB.order.top); g.globalAlpha = 1;   /* (claude/beast3art) the column's edges: a deck is no shelter */
      const cx2 = BBA.drawLane(g, l, r2, fyy, col, on, soon);   /* (claude/beast3art) hazard-striped boards, end stakes with pennants, a numbered sign plate */
      ctx.text(String(q.wave), cx2, fyy - 31, on ? '#fff6e0' : col, 'center', 7);
      if (q.t < BB.order.flight) { const k = 1 - q.t / BB.order.flight; for (let n = 0; n < 4; n++) BBA.drawArrow(g, l + 5 + R((n + 0.5) * (w2 - 10) / 4), R(fyy - 170 + k * 168 - ((n * 13) % 22))); } }   /* the arrows coming down */
    /* (claude/beast3) THE HORNSMAN's horn: a bar filling over him through the tell (the level's read), the blast's rings going out */
    if (BBM.hornUp(e, S)) { const hb = BBM.hornBox(e), hx = x((hb[0] + hb[1]) / 2), hy = y(hb[2]) - 8, k = 1 - Math.max(0, e.modeT) / BB.order.tell, w0 = 18, pulse = 0.6 + 0.4 * Math.sin(time * (8 + k * 14));
      rect(g, hx - w0 / 2 - 1, hy - 1, w0 + 2, 4, '#120804'); g.globalAlpha = pulse; rect(g, hx - w0 / 2, hy, Math.max(1, R(w0 * k)), 2, k > 0.7 ? '#ff6b6b' : '#ff9a5c'); g.globalAlpha = 1;
      g.strokeStyle = Math.floor(time * 10) % 2 ? '#ffd36b' : '#ff9a5c'; g.strokeRect(x(hb[0]) + 0.5, y(hb[2]) + 0.5, R(hb[1] - hb[0]), R(hb[3] - hb[2])); }
    if (S.blastT > 0) { const hb = BBM.hornBox(e), f = e.face || 1, k = 1 - S.blastT / 0.6, ox = x(f > 0 ? hb[1] : hb[0]), oy = y(hb[2]) + 6;
      for (let n = 0; n < 3; n++) { const rr = 8 + k * 60 + n * 14; g.globalAlpha = Math.max(0, 1 - k) * (1 - n * 0.2); g.fillStyle = n ? '#ff9a5c' : '#ffd870'; for (let t2 = -5; t2 <= 5; t2++) { const an = t2 * 0.12; g.fillRect(R(ox + f * Math.cos(an) * rr), R(oy + Math.sin(an) * rr * 0.9), 2, 2); } } g.globalAlpha = 1; }
    /* (claude/beast3) THE WALL BREAKER: his road to the wall in red dots through the turn, the wall's mark at its end */
    if (e.mode === 'wallTell') { const st = BBM.chargeStop(S, e.x, 1); g.globalAlpha = 0.4; g.fillStyle = '#ff6b6b'; for (let q2 = e.x; q2 < st.x; q2 += 10) g.fillRect(x(q2), fyy - 1, 6, 1); g.globalAlpha = 1;
      const on = Math.floor(time * 10) % 2; g.fillStyle = st.scaf ? (on ? '#ffd36b' : '#fff6e0') : (on ? '#ff6b6b' : '#ffd36b'); g.fillRect(x(st.x + BB.w / 2 + 3) - 1, fyy - 18, 2, 16); }
    /* (claude/beast3art) THE SLAM: a flash and a ring of dust at the wall where his head lands, the first beats of wallHit */
    if (e.mode === 'wallHit') { const k = 1 - Math.max(0, e.modeT) / BB.wall.slam, wx = x(e.x + (e.face || 1) * 12), ky = Math.min(1, k * 2.2);   /* at his shoulder: the wall and his head land at the screen edge, so the flash is drawn where it can be seen */
      if (k < 0.45) { g.globalAlpha = 1 - k / 0.45; g.fillStyle = '#fff6d0'; g.fillRect(wx - 8, fyy - 46, 3, 24); g.fillRect(wx - 14, fyy - 38, 12, 3); g.fillRect(wx - 12, fyy - 30, 9, 3); g.fillStyle = '#ffd36b'; for (let q2 = 0; q2 < 8; q2++) { const an = q2 * 0.8 + 0.2; g.fillRect(R(wx - 6 - Math.cos(an) * 18 * ky), R(fyy - 34 + Math.sin(an) * 18 * ky), 2, 2); } g.globalAlpha = 1; }
      for (let q2 = 0; q2 < 10; q2++) { const rr = 6 + k * 44 + q2 * 3; g.globalAlpha = Math.max(0, 0.7 - k * 0.8); g.fillStyle = q2 & 1 ? '#c9a878' : '#8a7050'; g.fillRect(R(wx - 4 - rr * (0.4 + (q2 % 3) * 0.3)), R(fyy - 3 - (q2 % 4) * 3 - k * 10), 4, 3); } g.globalAlpha = 1; }
    if (fall) { if (fall.t0 == null) fall.t0 = time; const tt = time - fall.t0; if (tt > 1.6) fall = null; else BBA.drawHornsmanFall(g, x(fall.x), y(fall.y), fall.f, tt, fyy); }   /* (claude/beast3art) THE HORNSMAN FALLS */
    /* (claude/beast3) THE ROLLING TIMBERS: teetering on the broken wall, dropping, then rolling west; a red streak ahead of each one rolling */
    for (const q of S.timbers) { const p = BBM.timberAt(q, S); if (p.rolling) { g.globalAlpha = 0.45; g.fillStyle = blink; for (let k = 1; k < 4; k++) g.fillRect(x(p.x) - 10 - k * 8, fyy - 2, 5, 1); g.globalAlpha = 1; }
      if (p.rolling) BBA.drawDustTrail(g, x(p.x), fyy, time + (q.rot || 0));   /* (claude/beast3art) a dust trail behind each rolling timber */
      if (p.waiting) { for (let k = 0; k < 3; k++) { g.fillStyle = k & 1 ? '#c9a060' : '#8a6a40'; g.fillRect(R(x(p.x) - 5 + k * 5), R(y(p.y) + 9 + ((time * 50 + k * 9) % 22)), 1, 2); } }   /* it teeters on the wall top: the chips falling from under it */
      BBA.drawTimber(g, x(p.x), y(p.y), p.waiting ? Math.sin(time * 18) * 0.35 : (q.rot || 0), p.waiting ? Math.sin(time * 22) * 0.25 : 0); }
    for (const c of S.stakes) { const q = BBM.stakeAt(c, G.floorY); g.save(); g.translate(x(q.x), y(q.y)); g.rotate(q.k * 6); rect(g, -6, -1, 12, 3, '#a8783e'); rect(g, 5, -2, 3, 5, '#e0c890'); g.restore();
      g.strokeStyle = blink; g.strokeRect(x(c.tx) - BB.volley.r, y(c.ty ?? G.floorY) - 3, BB.volley.r * 2, 3); }
    /* (claude/palisade2) THE PITCH POTS in flight (a clay pot, a flame) and their red rings; the BURNING PITCH where they burst */
    for (const c of S.pots) { const q = BBM.stakeAt(c, G.floorY); BBA.drawPot(g, x(q.x), y(q.y), time * 9 + c.tx * 0.1, time);   /* (claude/palisade2art) a clay pot turning in flight, a lit rag, embers */
      g.strokeStyle = blink; g.strokeRect(x(c.tx) - BB.pots.r, y(c.ty) - 3, BB.pots.r * 2, 3); }
    for (const f of S.fires) BBA.drawPitch(g, x(f.x), y(G.floorY), BB.pots.r, Math.min(1, f.life / 0.5), time);   /* (claude/palisade2art) BURNING PITCH: a glossy black pool, three heights of flame, embers, smoke */
    /* THE ORDER'S FLAG (P1): a handler raises it on the gantry for the whole windup - the colour names the order */
    /* (claude/palisade2art) the flag now flies from his drawn gantry (battering_beast_art.js, the pose's `flag` colour = BBM.ORDER's) */
    /* THE CHAIN FLAIL's band (P2): where the chain will go, LOW or HIGH, drawn through the windup */
    if (e.mode === 'flailTell') { const [l, r2, t2, b2] = BBM.flailBox(e, S), on = Math.floor(time * 10) % 2; g.globalAlpha = 0.45; g.fillStyle = S.flailHigh ? '#ff6b6b' : '#ffd36b';
      for (let q = l; q < r2; q += 8) g.fillRect(x(q), y((t2 + b2) / 2), 5, 1); g.globalAlpha = 1; g.fillStyle = on ? '#ffffff' : (S.flailHigh ? '#ff6b6b' : '#ffd36b'); g.fillRect(x(e.face > 0 ? r2 : l) - 1, y(t2), 2, R(b2 - t2)); }
    if (e.mode === 'flail') { const [l, r2, t2, b2] = BBM.flailBox(e, S), my = y((t2 + b2) / 2); for (let q = l; q < r2; q += 5) { rect(g, x(q), my - 1 + ((q >> 3) & 1), 4, 2, '#7a7a86'); rect(g, x(q), my - 1 + ((q >> 3) & 1), 4, 1, '#c8c8d6'); } }
    if (e.mode === 'kickTell') { const [l, r2] = BBM.kickBox(e, S); g.globalAlpha = 0.4; g.fillStyle = '#ffd36b'; for (let q = l; q < r2; q += 7) g.fillRect(x(q), y(G.floorY) - 1, 4, 1); g.globalAlpha = 1; }
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

