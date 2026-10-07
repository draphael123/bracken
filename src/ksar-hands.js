// src/ksar-hands.js - THE BANDIT KSAR's HANDS (claude/ksar, the greybox). src/ksar.js builds the level; this binds its rule to the game:
// THE GONGS (E rings one; a blade on it cuts its rope - the disc falls silent for good), THE CALL (a rung gong calls every fort bandit in its EARSHOT off his
// post: he runs to it, musters, walks back - and fights you if you are there), THE LOOKOUTS (one who sees you, or hears a hawk shriek, runs for his gong
// and rings it unless its rope is cut), THE PLANTED SENTRIES (they hold their gong and strike it on the alarm), THE HAWK SCOUTS' eyes (src/ksar-foes.js:
// a roof over you or smoke between hides you; a shriek is the alarm), THE THROW (src/carry-throw.js 'keg' / 'flask': E takes one, ATTACK throws it in the
// told arc): a KEG fizzes and BLASTS (foes, you, a BRICKED ARCH, the next keg - a CHAIN), a FLASK flashes (a hawk blinded, bandits stunned, a puff of
// smoke), THE SMOKE THROWER's pots (smoke: no sightline passes it), THE GATE WINCH (E hauls the portcullis a notch while no one of the gatehouse holds the
// brake), THE STRONGROOM (five seals), the whip apprentice's lash (reach, and a pull), the glint and the 10 s nudge (STUCK_HANDS.ksar), and the drawing
// (GREYBOX shapes until the art pass). The courtyard's gongs and flasks are the same rule: a hero's ring or flash there goes to THE HAWK-MISTRESS
// (ctx.bossRing / ctx.bossFlash, src/hawk-mistress-hands.js).
// main.js calls: reset, on, update, hold, world, evs, onHit, interact, smokeStep, noSun, drawWorld, drawOver, drawHud, read, handsState, arcOf.
import * as CT from './carry-throw.js';
import { CUTTHROAT } from './desert-foes.js';
import { HAWK } from './ksar-foes.js';
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';

/* THE NUMBERS. hum: s a rung gong hums (rung again in it, nothing); muster: s a called man stands at the gong; callV: px/s he runs to it; sight: px a lookout or a
   sentry sees along his facing (rows: sightY); runV: a lookout's run; strikeT: a sentry's told swing at his gong; kegFuse / kickFuse / chainFuse: s from landing /
   a blow / a neighbour's blast to the BLAST; kegR: px the blast hurts in; breakR: px it breaks brick in; chainR: px it lights the next keg in; kegDmg / kegHero: its
   blow on a foe / on you; flashR: px a flash blinds in (a hawk) / stunR: stuns a bandit in; stunT; smokeR / smokeT: a cloud; potDmg: a smoke pot's knock;
   lashReach: the whip apprentice's lash; pull: px/s it pulls you; brakeR: tiles from the winch a gatehouse man holds the brake; dropT: s a braked gate drops a notch;
   haulCd: s between hauls; refill: s a stack takes to put one back */
export const KS = { hum: 4, muster: 3.2, callV: 82, sight: 150, sightY: 40, runV: 96, strikeT: 1.0, patrolV: 30, kegFuse: 0.9, kickFuse: 1.1, chainFuse: 0.45,
  kegR: 64, breakR: 62, chainR: 150, kegDmg: 60, kegHero: 28, flashR: 84, stunR: 52, stunT: 1.6, smokeR: 44, smokeT: 6, potDmg: 10, lashReach: 62, pull: 170,
  brakeR: 3, dropT: 1.1, haulCd: 0.32, refill: 8, gongR: 20, takeR: 18, stoneDmg: 16, holeEvery: 0.9, holeTell: 0.45, holeDmg: 14 };   /* THE MURDER HOLES: while the gatehouse is manned, a stone every holeEvery s on a hero at the gate or in its passage (told: dust and a mark, holeTell s) */
CT.addKind('keg', { aims: { low: { vx: 70, vy: -120 }, mid: { vx: 125, vy: -190 }, high: { vx: 95, vy: -300 } }, g: 700, r: 4, ring: 12, dots: 14 });
CT.addKind('flask', { aims: { low: { vx: 110, vy: -130 }, mid: { vx: 170, vy: -210 }, high: { vx: 120, vy: -330 } }, g: 640, r: 3, ring: 10, dots: 14 });
const FORT = new Set(['ksarblade', 'gonglookout', 'whipapprentice', 'shieldsentry', 'smokethrower', 'wallslinger']);

export function makeKsarHands(ctx) {
  let K = null;
  const H = {};
  const TS = () => ctx.TS, T = () => ctx.T;
  const once = k => { if (K.said[k]) return false; K.said[k] = 1; return true; };
  const number = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');   /* (every teaching line is a src/hint-lines.js line: tools/hint-shown.mjs reads these calls) */
  H.on = () => !!K;
  H.state = () => K;
  H.noSun = x => !!K && !!K.L.arena && x >= K.L.arena.x0;   /* the sun is the desert's backdrop here as in the Glass Sea; the courtyard's fight is in shade */

  /* ---------- RESET: a fresh load builds the rule's state; a respawn keeps what is cut, broken, spent and pinned ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.ksar) { K = null; return; }
    if (!K || K.L !== L) {
      K = { L, said: {}, clock: 0, gongs: (L.gongs || []).map(g => ({ ...g, cut: false, hum: 0, ring: 0, rungBy: '' })), barricades: (L.barricades || []).map(b => ({ ...b, broken: false })),
        setKegs: (L.setKegs || []).map(k => ({ ...k, st: 'set', t: 0 })), weak: (L.weak || []).map(([x, y]) => ({ x, y, broken: false })), gate: L.gate ? { ...L.gate, notch: 0, pinned: false, dropT: 0, cd: 0 } : null,
        vault: (L.vaultDoors || []).map(v => ({ ...v, open: false })),
        n: { rings: 0, heroRings: 0, cuts: 0, calls: 0, alarms: 0, lookoutRuns: 0, lookoutRings: 0, sentryRings: 0, shrieks: 0, kegsThrown: 0, flasksThrown: 0, blasts: 0, chainBlasts: 0, kicks: 0, broken: 0,
          flashes: 0, stuns: 0, blinds: 0, smokes: 0, hauls: 0, braked: 0, drops: 0, pinned: 0, pulls: 0, nudges: 0, hidden: 0 } };
    }
    K.stacks = (K.L.stacks || []).map(s => ({ ...s, left: s.n, t: 0 }));
    K.items = []; K.smokes = []; K.fx = []; K.drops = []; K.holeT = 0; K.glint = null; K.stalls = {}; K.stallKey = null; K.arc = null;
    for (const g of K.gongs) { g.hum = 0; g.ring = 0; if (g.arena) g.cut = false; }   /* (fix pass) the courtyard's gongs hang again for a new attempt at her */
    for (const k of K.setKegs) if (k.st === 'lit') k.st = 'set';
    if (K.gate && !K.gate.pinned) K.gate.notch = 0;
    for (const pp of ctx.players) { if (pp.carry && (pp.carry.t === 'kskeg' || pp.carry.t === 'ksflask')) pp.carry = null; pp.ksPullK = 0; }
    bindFoes();
    if (typeof window !== 'undefined' && window.BK) Object.assign(window.BK, { ksar: () => K, ksarHands: () => H, walkHint: () => H.walkHint(ctx.hero()) });
  };
  /* every placed fort bandit learns his role from his ent (spawnEnt does not copy it: its xpKey names the ent) */
  function bindFoes() {
    const ts = TS();
    for (const e of ctx.enemies()) { if (!e.alive || e.ks || e.hmGuard) continue; const k = e.xpKey != null ? parseInt(e.xpKey, 10) : -1, src = k >= 0 ? K.L.ents[k] : null;
      if (!src || (!src.ks && e.t !== 'hawkscout')) continue;
      if (e.t === 'hawkscout') continue;
      e.ks = { role: src.ks, post: e.x, gong: src.gong || null, patrol: src.patrol ? [src.patrol[0] * ts + 8, src.patrol[1] * ts + 8] : null, st: src.asleep || src.ks === 'reserve' ? 'asleep' : src.ks === 'gatehouse' ? 'room' : 'post', t: 0, hp: e.hp, dir: e.face || -1 }; }
  }
  const gongOf = id => K.gongs.find(g => g.id === id);
  const gx = g => g.x * TS() + 8, gy = g => (g.y + 1) * TS();
  const foes = () => ctx.enemies().filter(e => e.alive && e.ks);

  /* ---------- THE GONGS ---------- */
  /* RING a gong (by: 'hero' | 'bandit' | 'guard'): every fort bandit in its earshot is CALLED to it; a hero's ring in the courtyard sends the hawk off */
  function ring(g, by) {
    if (!g || g.cut) return 'cut';
    if (g.hum > 0) { if (by === 'hero' && (K.clock - (g.humSaid || -9) > 2)) { g.humSaid = K.clock; number(gx(g), gy(g) - 50, 'IT STILL HUMS', '#9aa39a'); } return 'hum'; }
    g.hum = KS.hum; g.ring = 1.4; g.rungBy = by; K.n.rings++; if (by === 'hero') K.n.heroRings++;
    ctx.sfx.gong ? ctx.sfx.gong(!!g.great) : (ctx.sfx.bell ? ctx.sfx.bell() : ctx.sfx.clank && ctx.sfx.clank()); ctx.shake(g.great ? 3 : 1);
    const ts = TS(), x = gx(g), y = gy(g); let called = 0;
    for (const e of foes()) { if (e.ks.role === 'planted' || Math.abs(e.x - x) > g.ear * ts || Math.abs(e.y - y) > g.earY * ts) continue;
      call(e, g); called++; }
    K.n.calls += called;
    if (by === 'hero') { if (once('ringHero') || called > 1) number(x, y - 56, called ? 'YOU RING IT: EVERY BANDIT IN EARSHOT COMES' : 'NO ONE IN EARSHOT ANSWERS', '#ffd36b'); }
    else if (by === 'bandit' && (once('ringBandit') || K.clock - (K.ringSaid || -9) > 6)) { K.ringSaid = K.clock; number(ctx.hero().x, ctx.hero().y - 40, 'THE GONG! THEY ARE CALLED', '#ff9a5c'); }
    if (g.arena && by === 'hero' && ctx.bossRing) ctx.bossRing(g);
    return 'rung';
  }
  H.ringGong = (id, by) => ring(gongOf(id), by || 'guard');
  /* CALLED: off his post to the gong (a spread so they do not stand in one body), a muster, then home - or a fight if you are there */
  function call(e, g) {
    const ts = TS(), side = Math.sign(e.x - gx(g)) || 1, spread = ((e.xpKey ? parseInt(e.xpKey, 10) : 0) % 3) * 10;
    e.ks.st = e.ks.st === 'room' ? 'exit' : 'called'; e.ks.tx = gx(g) + side * (14 + spread); e.ks.gong2 = g.id; e.ks.t = 0; e.ks.mark = 1.6;
    if (e.ks.role === 'lookout' && e.ks.st === 'called' && e.ks.gong !== g.id) e.ks.st = 'called';
  }
  /* CUT a gong's rope: the disc falls, silent for good */
  function cut(g) { if (g.cut) return;
    if (g.great) { if (K.clock - (g.chainSaid || -9) > 3) { g.chainSaid = K.clock; number(gx(g), gy(g) - 56, 'THE GREAT GONG HANGS ON A CHAIN', '#9aa39a'); ctx.sfx.clank && ctx.sfx.clank(); } return; }   /* (no soft lock: its call is the only way the gatehouse empties) */
    g.cut = true; K.n.cuts++; if (g.bridge) lowerBridge(g); ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(gx(g), gy(g) - 30, 10, ['#d9b36a', '#8a6a3a', '#ffd36b'], 60, 0.6);
    number(gx(g), gy(g) - 56, 'THE ROPE IS CUT: THE GONG IS SILENT', '#8fd160');
    for (const e of foes()) if (e.ks.gong === g.id && (e.ks.st === 'run' || e.ks.st === 'strike')) { e.ks.st = 'fight'; number(e.x, e.y - 30, 'THE ROPE IS CUT!', '#ff9a5c'); } }
  H.cutGong = id => cut(gongOf(id));
  /* THE ROOF BRIDGE (fix pass, review MUST 3: CUT REQUIRED): the bridge gong's rope holds the bridge up on the far side of the widest drop; cut, the bridge comes down for good */
  function lowerBridge(g) { const [x0, x1, row] = g.bridge, ts = TS(); for (let x = x0; x <= x1; x++) { ctx.cellSet(x, row, T().ONEWAY); ctx.burst(x * ts + 8, row * ts, 3, ['#8a6a3a', '#c9a060'], 50, 0.5); } ctx.sfx.thud && ctx.sfx.thud(); ctx.shake(3); K.n.bridges = (K.n.bridges || 0) + 1;
    number((x0 + x1) / 2 * ts, row * ts - 30, 'THE ROPE IS CUT: THE BRIDGE COMES DOWN', '#8fd160'); }
  /* THE ALARM: a hawk's shriek (or a blow on a sleeping lookout): every lookout in reach runs for his gong, every sentry strikes his */
  function alarm(x, y, r) { const ts = TS();
    for (const e of foes()) { if (Math.abs(e.x - x) > r * ts || Math.abs(e.y - y) > 14 * ts) continue;
      if (e.ks.role === 'lookout' && ['post', 'asleep', 'patrol'].includes(e.ks.st)) startRun(e);
      if (e.ks.role === 'planted' && e.ks.st === 'post') startStrike(e); } }
  function startRun(e) { const g = gongOf(e.ks.gong); if (!g || g.cut || g.hum > 0) { e.ks.st = 'fight'; return; }
    e.ks.st = 'run'; e.ks.t = 0; K.n.lookoutRuns++; ctx.number(e.x, e.y - 30, '!', '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(false);
    if (once('lookoutRun') || K.clock - (K.runSaid || -9) > 8) { K.runSaid = K.clock; number(e.x, e.y - 44, 'HE RUNS FOR THE GONG: CUT ITS ROPE', '#ff9a5c'); } }
  function startStrike(e) { const g = gongOf(e.ks.gong); if (!g || g.cut || g.hum > 0) return; e.ks.st = 'strike'; e.ks.t = KS.strikeT; ctx.number(e.x, e.y - 30, '!', '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(false);
    if (once('sentryStrike')) number(e.x, e.y - 44, 'THE SENTRY STRIKES HIS GONG', '#ff9a5c'); }

  /* ---------- SIGHT: a roof over the hero, or smoke between, hides him ---------- */
  const inSmoke = (x, y) => K.smokes.some(s => Math.hypot(s.x - x, s.y - y) < s.r);
  const smokeBetween = (ax, ay, bx, by) => K.smokes.some(s => { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, k = Math.max(0, Math.min(1, ((s.x - ax) * dx + (s.y - ay) * dy) / L2)); return Math.hypot(ax + dx * k - s.x, ay + dy * k - s.y) < s.r * 0.85; });
  const roofed = P => { const ts = TS(), tx = Math.floor(P.x / ts), fy = Math.floor((P.y - 1) / ts); for (let y = fy - 2; y >= fy - 9; y--) if (ctx.cellGet(tx, y) === T().SOLID) return true; return false; };
  const underCanvas = P => (K.L.shade || []).some(([x0, x1, y0, y1]) => P.x >= x0 && P.x <= x1 && P.y - 2 >= y0 && P.y - 2 <= y1);   /* an awning, a hut, a roof walk: shade is cover */
  const hiddenFrom = (vx, vy, P, roof) => inSmoke(P.x, P.y - 10) || smokeBetween(vx, vy, P.x, P.y - 10) || (roof && (roofed(P) || underCanvas(P)));
  H.hidden = (vx, vy, P) => !!K && hiddenFrom(vx, vy, P, true);
  const sees = (e, P) => { const d = P.x - e.x; return !P.dead && Math.abs(d) < KS.sight && Math.abs(P.y - e.y) < KS.sightY && Math.sign(d) === (e.face || 1) && !hiddenFrom(e.x, e.y - 14, P, false); };

  /* ---------- THE FORT'S MEN: main.js asks before a foe's own machine runs. true = the hands move him this frame (asleep, called, running, stunned) ---------- */
  const fall = (e, dt) => { e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); ctx.moveFoeY(e, e.vy * dt); };
  /* (fix pass) a called man stops at a lip: a breach's rubble, a gap between the roofs, the raised bridge - he never walks off one (true: as far as he goes) */
  const lipAhead = (e, s) => { const ts = TS(), tx = Math.floor((e.x + s * 8) / ts), fy = Math.floor((e.y + 1) / ts); for (let y = fy; y <= fy + 1; y++) if (ctx.standable(tx, y) && ctx.cellGet(tx, y) !== T().SPIKE) return false; return true; };
  const walk = (e, tx, v, dt) => { const d = tx - e.x; if (Math.abs(d) < 3) return true; const s = Math.sign(d); e.face = s; if (e.st) e.st.face = s; if (lipAhead(e, s)) { e.vx = 0; return true; }
    const x0 = e.x; ctx.moveFoe(e, s * Math.min(Math.abs(d), v * dt)); if (e.st) { e.st.x = e.x; e.st.frame = Math.floor(K.clock * 8) % 2; e.st.mode = 'walk'; } e.mode = 'walk'; e.anim = (e.anim || 0) + dt; e.vx = s * v;
    return Math.abs(e.x - x0) < v * dt * 0.2; };   /* (true: there, or blocked - a wall, a tower's foot) */
  H.hold = (e, dt) => {
    if (!K || !e.alive || !e.ks) return false;
    const q = e.ks, P = ctx.hero(), ts = TS();
    if (e.hp < q.hp - 0.01) { q.hp = e.hp; if (q.st === 'asleep') { q.st = q.role === 'lookout' ? 'post' : 'fight'; if (q.role === 'lookout') startRun(e); } else if (q.role === 'lookout' && (q.st === 'post' || q.st === 'patrol')) startRun(e); }
    q.hp = e.hp; if (q.mark > 0) q.mark -= dt;
    if (e.ksStun > 0) { e.ksStun -= dt; fall(e, dt); e.vx = 0; return true; }
    switch (q.st) {
      case 'asleep': fall(e, dt); e.vx = 0; e.mode = 'sleep'; return true;
      case 'room': return false;   /* the gatehouse squad: their own machines, behind the grille */
      case 'exit': { const gr = K.gate && K.gate.grille; if (gr && e.x > (gr.x + 1) * ts && e.y < (gr.y1 + 2) * ts) { walk(e, gr.x * ts, KS.callV, dt); if (e.x <= (gr.x + 1) * ts + 6) { e.x = gr.x * ts - 6; if (e.st) e.st.x = e.x; e.vy = 0; } fall(e, dt); return true; }
        q.st = 'called'; return true; }
      case 'called': { const there = walk(e, q.tx, KS.callV, dt); fall(e, dt);
        if (Math.abs(P.x - e.x) < 70 && Math.abs(P.y - e.y) < 30 && !P.dead) { q.st = 'fight'; q.post = e.x; return false; }   /* you are there: he fights */
        if (there) { q.st = 'muster'; q.t = KS.muster; } return true; }
      case 'muster': q.t -= dt; fall(e, dt); e.vx = 0; e.face = Math.sign(Math.sin(K.clock * 1.3 + e.x)) || 1; if (e.st) e.st.face = e.face;
        if (Math.abs(P.x - e.x) < 110 && Math.abs(P.y - e.y) < 30 && !P.dead) { q.st = 'fight'; return false; }
        if (q.t <= 0) { q.st = 'return'; if (q.role === 'gatehouse' && K.gate) q.post = K.gate.winch[0] * ts + 8 + ((parseInt(e.xpKey, 10) || 0) % 3 - 1) * 12; } return true;
      case 'return': { const there = walk(e, q.post, KS.callV * 0.8, dt); fall(e, dt);
        if (Math.abs(P.x - e.x) < 70 && Math.abs(P.y - e.y) < 30 && !P.dead) { q.st = 'fight'; return false; }
        if (there) q.st = q.role === 'lookout' ? 'post' : 'fight'; return true; }
      case 'run': { const g = gongOf(q.gong); if (!g || g.cut) { q.st = 'fight'; return false; } const there = walk(e, gx(g) - (e.x < gx(g) ? 12 : -12), KS.runV, dt); fall(e, dt);
        if (there || Math.abs(e.x - gx(g)) < 16) { if (ring(g, 'bandit') === 'rung') K.n.lookoutRings++; q.st = 'fight'; } return true; }
      case 'strike': { q.t -= dt; fall(e, dt); e.vx = 0; const g = gongOf(q.gong); if (!g || g.cut) { q.st = 'post'; return false; }
        if (q.t <= 0) { if (ring(g, 'bandit') === 'rung') K.n.sentryRings++; q.st = 'post'; } return true; }
      case 'post': {
        if (q.role === 'planted') { e.x = Math.max(q.post - 20, Math.min(q.post + 20, e.x)); if (sees(e, P) && Math.abs(P.x - e.x) < 110) startStrike(e); return false; }
        if (q.role === 'lookout') { if (sees(e, P)) { startRun(e); return true; }
          if (q.patrol) { const tx = q.dir > 0 ? q.patrol[1] : q.patrol[0]; if (walk(e, tx, KS.patrolV, dt)) q.dir = -q.dir; fall(e, dt); return true; }
          fall(e, dt); e.vx = 0; return true; }
        return false; }
    }
    return false;
  };
  /* THE MACHINES' WORLD (main.js updateDesertFoe, before a machine steps): a hawk scout's eyes and blindness; a whip apprentice's reach */
  H.world = (e, s, w) => { if (!K) return; const P = ctx.hero();
    if (e.t === 'hawkscout') { w.hidden = hiddenFrom(e.x, e.y, P, true); if (w.hidden) K.n.hidden++; w.blind = e.ksBlindNew || 0; e.ksBlindNew = 0; w.ground = P.y; return; }
    if (e.cnSkin === 'whipapprentice') { const d = w.px - e.x; w.px = e.x + d * (CUTTHROAT.reach / KS.lashReach); }   /* his machine reads you a lash's length nearer: he lashes from there */
  };
  /* THE MACHINES' EVENTS (after it steps): a hawk's 'spot' is the alarm; the apprentice's slash is a LASH with reach */
  H.evs = (e, s, evs) => { if (!K) return;
    for (const v of evs) {
      if (v.t === 'spot') { K.n.shrieks++; K.fx.push({ k: 'shriek', x: v.x, y: v.y, t: 0.8 }); ctx.sfx.hawk ? ctx.sfx.hawk() : ctx.sfx.hiss && ctx.sfx.hiss(); alarm(v.x, ctx.hero().y, HAWK.earshot);
        if (once('shriek') || K.clock - (K.shriekSaid || -9) > 10) { K.shriekSaid = K.clock; number(ctx.hero().x, ctx.hero().y - 44, 'THE HAWK SHRIEKS: THE LOOKOUTS RUN', '#ff9a5c'); } }
      if (v.t === 'hit' && FORT.has(e.cnSkin) && !v.ksMul && v.stone) { v.ksMul = 1; v.dmg = KS.stoneDmg; }   /* THE FORT HITS HARD: a slinger's stone off a parapet as a gorge stone (its men's blows: L.foeHit in main.js damagePlayer0) */
      if (v.t === 'hit' && v.what === 'slash' && e.cnSkin === 'whipapprentice') { const f = e.face || 1; v.box = [f > 0 ? e.x + 2 : e.x - KS.lashReach, f > 0 ? e.x + KS.lashReach : e.x - 2, e.y - 16, e.y - 2]; v.lash = true; } } };
  /* A BLOW THAT LANDED: the lash PULLS you a step toward him (out of cover) */
  H.onHit = (e, v, landed, P) => { if (!K || !landed || !v.lash || P.dead) return; const d = Math.sign(e.x - P.x) || 1; P.vx = d * KS.pull; P.ksPullK = 0.25; K.n.pulls++;
    if (once('lash')) number(P.x, P.y - 34, 'THE LASH PULLS YOU IN', '#ff9a5c'); };

  /* ---------- THE THROW: kegs and flasks ---------- */
  const solidPx = (x, y, falling) => { const ts = TS(), t = ctx.cellGet(Math.floor(x / ts), Math.floor(y / ts)); return t === T().SOLID || (falling && ctx.standable(Math.floor(x / ts), Math.floor(y / ts)) && (y % ts) < 6); };
  const isItem = q => !!(q && (q.t === 'kskeg' || q.t === 'ksflask'));
  const held = P => (P && isItem(P.carry) ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - 18 });
  const foeAtPx = (x, y) => ctx.enemies().find(e => e.alive && !e.harmless && Math.abs(e.x - x) < (e.w || 10) / 2 + 3 && y > e.y - (e.h || 14) - 2 && y < e.y + 2) || null;
  const hawkAtPx = (x, y) => (ctx.bossHawk ? (() => { const k = ctx.bossHawk(); return k && Math.hypot(k.x - x, k.y - y) < 16 ? k : null; })() : null);
  H.arcOf = P => { const q = held(P); if (!q) return null; const h = handAt(P), v = CT.launchOf(q.thrKind, P, ctx.keys ? ctx.keys() : {});
    return CT.predictArc(q.thrKind, h.x, h.y, v, solidPx, { stopAt: (x, y) => foeAtPx(x, y) || hawkAtPx(x, y) || null }); };
  const newItem = (P, kind) => ({ t: kind === 'keg' ? 'kskeg' : 'ksflask', thrKind: kind, state: 'held', holder: P, x: P.x, y: P.y - 18, vx: 0, vy: 0, fuse: 0, noClimb: kind === 'keg', hurtWas: P.hurt > 0,
    launch: PP => CT.launchOf(kind, PP, ctx.keys ? ctx.keys() : {}) });
  function stepItems(dt) {
    for (const q of K.items) {
      if (q.state === 'held') { const P = q.holder;
        if (!P || P.dead || P.carry !== q) { if (P && P.carry === q) P.carry = null; if (P && P.dead) { q.state = 'gone'; continue; } q.state = 'lie'; q.holder = null; continue; }
        const h = handAt(P); q.x = h.x; q.y = h.y;
        if (P.hurt > 0 && !q.hurtWas) { P.carry = null; q.state = 'lie'; q.holder = null; q.x = P.x; q.y = P.y; if (once('dropped')) number(P.x, P.y - 34, 'A BLOW: YOU DROP IT', '#ff9a5c'); }
        q.hurtWas = P.hurt > 0; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = 1; if (q.thrKind === 'keg') K.n.kegsThrown++; else K.n.flasksThrown++; } q.holder = null;
        const px = q.x, py = q.y, k = CT.KINDS[q.thrKind]; CT.stepArc(q, dt, k.g);
        const hitFoe = foeAtPx(q.x, q.y), hitHawk = hawkAtPx(q.x, q.y);
        if (hitFoe || hitHawk) { land(q); continue; }
        if (solidPx(q.x + Math.sign(q.vx) * k.r, py, false) && !solidPx(px, py, false)) { q.x = px; q.y = py; land(q); continue; }
        if (q.vy < 0 && solidPx(q.x, q.y - k.r, false)) q.vy = 0;
        if (q.vy >= 0 && solidPx(q.x, q.y + k.r, true)) { land(q); continue; }
        if (q.y > ctx.L.H * TS()) q.state = 'gone'; continue; }
      if (q.state === 'fuse') { q.fuse -= dt; if (Math.random() < dt * 20) ctx.burst(q.x, q.y - 8, 1, ['#ffd36b', '#ff6a2a'], 30, 0.3); if (q.fuse <= 0) { q.state = 'gone'; blast(q.x, q.y - 4, 'keg'); } continue; }
    }
    K.items = K.items.filter(q => q.state !== 'gone');
  }
  function land(q) { q.vx = 0; q.vy = 0;
    if (q.thrKind === 'flask') { q.state = 'gone'; flash(q.x, q.y); return; }
    q.state = 'fuse'; q.fuse = KS.kegFuse; ctx.sfx.thud ? ctx.sfx.thud() : ctx.sfx.clank && ctx.sfx.clank(); ctx.sfx.hiss && ctx.sfx.hiss(); }
  /* THE BLAST: foes and heroes in it, the brick in reach, the next keg in reach (a CHAIN) */
  function blast(x, y, from) {
    const ts = TS(); K.n.blasts++; if (from === 'chain') K.n.chainBlasts++;
    ctx.sfx.boom ? ctx.sfx.boom() : ctx.sfx.crack && ctx.sfx.crack(); ctx.shake(5); ctx.burst(x, y, 26, ['#ff9a3c', '#ffd36b', '#3a2a12', '#c9b27c'], 120, 0.8); K.fx.push({ k: 'blast', x, y, t: 0.45 });
    for (const e of ctx.enemies()) if (e.alive && !e.harmless && Math.hypot(e.x - x, e.y - 8 - y) < KS.kegR + (e.w || 10) / 2) { if (e.t === 'hawkmistress') continue; ctx.hurtFoe(e, KS.kegDmg); if (e.ks && e.ks.st !== 'fight') e.ks.st = 'fight'; }
    for (const pp of ctx.players) if (!pp.dead && Math.hypot(pp.x - x, pp.y - 8 - y) < KS.kegR) ctx.asPlayer(pp, () => ctx.hurtHero(x, KS.kegHero, { unblockable: true, name: 'THE BLAST' }));
    for (const b of K.barricades) { if (b.broken) continue; let near = false; for (let cy = b.y0; cy <= b.y1 && !near; cy++) for (let cx = b.x0; cx <= b.x1; cx++) if (Math.hypot(cx * ts + 8 - x, cy * ts + 8 - y) < KS.breakR) { near = true; break; }
      if (near) { b.broken = true; K.n.broken++; for (let cy = b.y0; cy <= b.y1; cy++) for (let cx = b.x0; cx <= b.x1; cx++) { ctx.cellOpen(cx, cy); ctx.burst(cx * ts + 8, cy * ts + 8, 4, ['#b08a5a', '#7a5a3a', '#e0c090'], 70, 0.7); }
        number(x, y - 40, 'THE BRICK GIVES: THE ARCH IS OPEN', '#8fd160'); } }
    for (const w of K.weak) if (!w.broken && Math.hypot(w.x * ts + 8 - x, w.y * ts + 8 - y) < KS.breakR) { w.broken = true; ctx.cellOpen(w.x, w.y); ctx.burst(w.x * ts + 8, w.y * ts + 4, 5, ['#b08a5a', '#7a5a3a'], 60, 0.6); if (once('roofHole')) number(x, y - 40, 'THE ROOF IS HOLED: A CELLAR UNDER IT', '#ffd36b'); }
    for (const k of K.setKegs) if (k.st === 'set' && Math.hypot(k.x * ts + 8 - x, (k.y + 1) * ts - 6 - y) < KS.chainR) { k.st = 'lit'; k.t = KS.chainFuse; k.by = 'chain'; }
    for (const q of K.items) if (q.thrKind === 'keg' && (q.state === 'lie') && Math.hypot(q.x - x, q.y - y) < KS.chainR * 0.5) { q.state = 'fuse'; q.fuse = KS.chainFuse; }
  }
  /* THE FLASH: a hawk in reach is blinded (a scout, or hers), bandits close by are stunned, and a puff of smoke is left */
  function flash(x, y) { K.n.flashes++; ctx.sfx.flash ? ctx.sfx.flash() : ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(x, y - 6, 18, ['#ffffff', '#fff6c8', '#d8e8f0'], 110, 0.5); K.fx.push({ k: 'flash', x, y, t: 0.35 });
    for (const e of ctx.enemies()) { if (!e.alive) continue; const d = Math.hypot(e.x - x, e.y - 6 - y);
      if (e.t === 'hawkscout' && d < KS.flashR) { e.ksBlindNew = HAWK.blind; K.n.blinds++; if (once('blindScout')) number(e.x, e.y - 20, 'THE FLASH BLINDS THE HAWK', '#ffd36b'); }
      else if (e.ks && d < KS.stunR) { e.ksStun = KS.stunT; K.n.stuns++; } }
    K.smokes.push({ x, y: y - 10, r: KS.smokeR * 0.7, t: KS.smokeT * 0.6, t0: KS.smokeT * 0.6 });
    if (ctx.bossFlash) ctx.bossFlash(x, y); }
  /* THE SMOKE THROWER's pot (main.js's bombs, a 'smoke' one): it flies as his stick does and bursts in SMOKE where it lands - a knock, and a cloud */
  H.smokeStep = (b, dt) => { if (!K) return false; const ts = TS();
    b.vy += 700 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.fuse -= dt;
    const tx = Math.floor(b.x / ts), ty = Math.floor(b.y / ts), landed = ctx.cellGet(tx, ty) === T().SOLID || (b.vy > 0 && ctx.standable(tx, ty) && b.y % ts < 6) || b.fuse <= 0;
    if (!landed) return true;
    b.dead = true; K.n.smokes++; K.smokes.push({ x: b.x, y: b.y - 12, r: KS.smokeR, t: KS.smokeT, t0: KS.smokeT }); ctx.sfx.puff ? ctx.sfx.puff() : ctx.sfx.hiss && ctx.sfx.hiss();
    ctx.burst(b.x, b.y - 8, 14, ['#d8d0c8', '#a8a098', '#e8e4dc'], 50, 1.0);
    for (const pp of ctx.players) if (!pp.dead && Math.abs(pp.x - b.x) < 18 && Math.abs(pp.y - 8 - b.y) < 22) ctx.asPlayer(pp, () => ctx.hurtHero(b.x, KS.potDmg, { unblockable: true, noKnock: true, name: 'A SMOKE POT' }));
    if (once('smoke')) number(b.x, b.y - 40, 'SMOKE: NO EYE SEES THROUGH IT', '#c8c0b8'); return true; };

  /* ---------- INTERACT (E): set down / take up what you carry; ring a gong; take from a stack; haul the winch; the strongroom ---------- */
  H.interact = P => {
    if (!K || P.dead) return false; const ts = TS();
    const h = held(P); if (h) { P.carry = null; h.state = 'lie'; h.holder = null; h.x = P.x + (P.face || 1) * 8; h.y = P.y; return true; }
    if (P.carry) return false;
    const lying = K.items.find(q => q.state === 'lie' && Math.abs(q.x - P.x) < KS.takeR && Math.abs(q.y - P.y) < 16);
    if (lying) { lying.state = 'held'; lying.holder = P; lying.hurtWas = P.hurt > 0; P.carry = lying; ctx.sfx.clank && ctx.sfx.clank(); return true; }
    /* (fix pass, review MUST 5) A FALLEN COURTYARD GONG: E hangs it back on its frame - a cut there never kills her ring opening for good */
    const fg = K.gongs.find(q => q.cut && q.arena && Math.abs(gx(q) - P.x) <= KS.gongR && Math.abs(gy(q) - P.y) <= 18);
    if (fg) { fg.cut = false; fg.hum = 0.6; K.n.rehung = (K.n.rehung || 0) + 1; ctx.sfx.clank && ctx.sfx.clank(); number(gx(fg), gy(fg) - 56, 'YOU HANG THE GONG BACK: IT CAN RING', '#ffd36b'); return true; }
    const g = K.gongs.find(q => !q.cut && Math.abs(gx(q) - P.x) <= KS.gongR && Math.abs(gy(q) - P.y) <= 18);
    if (g) { if (ring(g, 'hero') === 'rung') ctx.burst(gx(g), gy(g) - 26, 8, ['#ffd36b', '#e0b060'], 50, 0.5); return true; }
    const st = K.stacks.find(s => Math.abs(s.x * ts + 8 - P.x) <= KS.takeR && Math.abs((s.y + 1) * ts - P.y) <= 18);
    if (st) { if (st.left <= 0) { number(st.x * ts + 8, st.y * ts - 20, st.kind === 'keg' ? 'THE STACK IS EMPTY: WAIT' : 'THE RACK IS EMPTY: WAIT', '#9aa39a'); return true; }
      st.left--; st.t = KS.refill; const q = newItem(P, st.kind); K.items.push(q); P.carry = q; ctx.sfx.clank && ctx.sfx.clank();
      if (once('take' + st.kind)) number(P.x, P.y - 34, st.kind === 'keg' ? 'A POWDER KEG: ATTACK THROWS IT - UP LOBS, DOWN TOSSES SHORT' : 'A FLASH FLASK: ATTACK THROWS IT', '#ffd36b'); return true; }
    const G = K.gate; if (G && Math.abs(G.winch[0] * ts + 8 - P.x) <= 28 && Math.abs((G.winch[1] + 1) * ts - P.y) <= 18) { haul(P); return true; }
    const v = K.vault.find(q => !q.open && Math.abs(q.x * ts + 8 - P.x) <= 30 && P.y > q.y0 * ts && P.y <= (q.y1 + 2) * ts);
    if (v) { if (ctx.questGot() >= v.seals) openVault(v); else number(P.x, P.y - 34, 'THE STRONGROOM WANTS FIVE CARAVAN SEALS', '#9aa39a'); return true; }
    return false;
  };
  function openVault(v) { v.open = true; const ts = TS(); for (let y = v.y0; y <= v.y1; y++) { ctx.cellOpen(v.x, y); ctx.burst(v.x * ts + 8, y * ts + 8, 3, ['#d9b36a', '#8a6a3a'], 40, 0.5); } ctx.sfx.gateLift && ctx.sfx.gateLift(); number(v.x * ts, v.y0 * ts - 20, 'THE STRONGROOM OPENS', '#8fd160'); }
  /* THE GATE WINCH */
  const squad = () => ctx.enemies().filter(e => e.alive && e.ks && e.ks.role === 'gatehouse');
  function braked() { const G = K.gate, ts = TS(); if (!G) return false; const [r0, r1, y0, y1] = [G.room[0], G.room[1], G.room[2], G.room[3]];
    return squad().some(e => (e.ks.st !== 'exit' && e.x >= r0 * ts && e.x <= (r1 + 1) * ts && e.y >= y0 * ts && e.y <= (y1 + 2) * ts) || (e.ks.st !== 'called' && e.ks.st !== 'exit' && Math.abs(e.x - (G.winch[0] * ts + 8)) <= KS.brakeR * ts && Math.abs(e.y - (G.winch[1] + 1) * ts) < 24)); }   /* (a man called off it lets go: one running past the winch does not hold it) */
  H.braked = () => !!K && braked();
  function haul(P) { const G = K.gate, ts = TS();
    if (G.pinned) { number(P.x, P.y - 34, 'THE GATE IS PINNED UP', '#9aa39a'); return; }
    if (braked()) { K.n.braked++; if (K.clock - (K.brakeSaid || -9) > 2.5) { K.brakeSaid = K.clock; number(P.x, P.y - 34, 'THE BRAKE IS ON: THE GATEHOUSE HOLDS IT', '#ff9a5c'); } ctx.sfx.clank && ctx.sfx.clank(); return; }
    if (G.cd > 0) return; G.cd = KS.haulCd; G.notch++; K.n.hauls++; G.dropT = KS.dropT; ctx.sfx.ratchet && ctx.sfx.ratchet(); setGate();
    if (G.notch >= G.notches) { G.pinned = true; K.n.pinned++; for (let y = G.y0; y <= G.y1; y++) ctx.cellOpen(G.x, y); ctx.sfx.gateLift && ctx.sfx.gateLift(); number(P.x, P.y - 34, 'THE GATE IS UP: THE PAWL HOLDS IT', '#8fd160'); }
    else number(G.x * ts, G.y0 * ts - 20, 'THE GATE RISES', '#ffd36b'); }
  /* the portcullis's cells: notch k lifts its bottom k rows clear (a hero under it holds it open: it never closes on you) */
  function setGate() { const G = K.gate, ts = TS(); if (G.pinned) return;
    for (let y = G.y0; y <= G.y1; y++) { const open = y > G.y1 - G.notch; const occupied = ctx.players.some(pp => !pp.dead && Math.abs(pp.x - (G.x * ts + 8)) < 14 && pp.y > y * ts && pp.y - 14 < (y + 1) * ts);
      if (open) ctx.cellSet(G.x, y, T().AIR); else if (!occupied) ctx.cellSet(G.x, y, T().SOLID); } }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!K) return; K.clock += dt; const ts = TS(), P0 = ctx.hero();
    if (!K.bound || K.boundN !== ctx.enemies().length) { bindFoes(); K.bound = 1; K.boundN = ctx.enemies().length; }
    for (const g of K.gongs) { g.hum = Math.max(0, g.hum - dt); g.ring = Math.max(0, g.ring - dt); }
    for (const s of K.stacks) if (s.left < s.n) { s.t -= dt; if (s.t <= 0) { s.left++; s.t = KS.refill; } }
    for (const s of K.smokes) s.t -= dt; K.smokes = K.smokes.filter(s => s.t > 0);
    for (const f of K.fx) f.t -= dt; K.fx = K.fx.filter(f => f.t > 0);
    stepItems(dt);
    /* A BLADE ON A GONG CUTS ITS ROPE; A BLOW ON A SET KEG LIGHTS IT */
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) return; const hb = ctx.attackBox(); if (!hb) return;
      for (const g of K.gongs) if (!g.cut && ctx.overlap(hb, { l: gx(g) - 10, r: gx(g) + 10, t: gy(g) - 46, b: gy(g) - 6 })) cut(g);
      for (const k of K.setKegs) if (k.st === 'set' && ctx.overlap(hb, { l: k.x * ts - 2, r: k.x * ts + 18, t: (k.y + 1) * ts - 16, b: (k.y + 1) * ts })) { k.st = 'lit'; k.t = KS.kickFuse; k.by = 'kick'; K.n.kicks++; ctx.sfx.hiss && ctx.sfx.hiss();
        number(k.x * ts + 8, k.y * ts - 18, 'THE FUSE IS LIT: GET CLEAR', '#ff6b6b'); } });
    /* A FLAME LIGHTS POWDER: an ember, a fire on the floor, at a set keg or a lying one */
    if (ctx.flames) { const fl = ctx.flames(); if (fl.length) { for (const k of K.setKegs) if (k.st === 'set' && fl.some(f => Math.abs(f.x - (k.x * ts + 8)) < 12 && Math.abs(f.y - ((k.y + 1) * ts - 6)) < 14)) { k.st = 'lit'; k.t = KS.kickFuse; k.by = 'kick'; K.n.kicks++; ctx.sfx.hiss && ctx.sfx.hiss(); }
      for (const q of K.items) if (q.thrKind === 'keg' && q.state === 'lie' && fl.some(f => Math.abs(f.x - q.x) < 12 && Math.abs(f.y - (q.y - 6)) < 14)) { q.state = 'fuse'; q.fuse = KS.kickFuse; } } }
    for (const k of K.setKegs) if (k.st === 'lit') { k.t -= dt; if (k.t <= 0) { k.st = 'spent'; blast(k.x * ts + 8, (k.y + 1) * ts - 6, k.by === 'chain' ? 'chain' : 'kick'); } }
    /* THE GATE: braked, a raised gate drops a notch at a time until it is pinned */
    const G = K.gate; if (G) { G.cd = Math.max(0, G.cd - dt);
      if (!G.pinned && G.notch > 0 && braked()) { G.dropT -= dt; if (G.dropT <= 0) { G.dropT = KS.dropT; G.notch--; K.n.drops++; setGate(); ctx.sfx.clank && ctx.sfx.clank(); if (P0 && Math.abs(P0.x - G.x * ts) < 300) number(G.x * ts, G.y0 * ts - 20, 'THE BRAKE BITES: THE GATE DROPS', '#ff9a5c'); } } }
    /* THE MURDER HOLES: the gatehouse's guard room drops stones on whoever stands at its gate or in its passage while it is manned (ring the great gong and it empties) */
    if (G && !G.pinned) { const manned = squad().some(e => e.ks.st === 'room'), ts2 = TS(); K.holeT = Math.max(0, K.holeT - dt);
      for (const pp of ctx.players) { if (pp.dead || !manned) continue; const tx = Math.floor(pp.x / ts2), ty = Math.floor((pp.y - 1) / ts2);
        if (tx >= G.x - 2 && tx <= G.room[1] + 3 && ty >= G.y0 - 1 && ty <= G.y1 && K.holeT <= 0) { K.holeT = KS.holeEvery; K.drops.push({ x: pp.x, y: G.y0 * ts2, t: KS.holeTell, key: 'hole' + (K.n.holes = (K.n.holes || 0) + 1) });
          if (once('holes')) number(pp.x, pp.y - 40, 'MURDER HOLES: THE GATEHOUSE IS MANNED', '#ff9a5c'); } } }
    for (const d of K.drops) { d.t -= dt; if (Math.random() < dt * 30) ctx.burst(d.x + (Math.random() - 0.5) * 8, d.y + 2, 1, ['#c8a070', '#8a6a3a'], 20, 0.3);
      if (d.t <= 0 && !d.done) { d.done = true; ctx.burst(d.x, (G ? G.y1 + 1 : 34) * TS() - 4, 6, ['#8a7a6a', '#c8a070'], 60, 0.4); ctx.sfx.thud && ctx.sfx.thud();
        for (const pp of ctx.players) if (!pp.dead && Math.abs(pp.x - d.x) < 12 && pp.y > d.y && pp.y < d.y + 6 * TS()) ctx.asPlayer(pp, () => ctx.hurtHero(d.x, KS.holeDmg, { unblockable: true, name: 'THE MURDER HOLES' })); } }
    K.drops = K.drops.filter(d => d.t > -0.3);
    /* THE FIRST LOOK at a thing: a line once (what it is, never the trick) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 60;
      for (const g of K.gongs) if (!g.cut && near(gx(g), gy(g), 90) && g.great && once('great')) number(P0.x, P0.y - 34, 'THE GREAT GONG: ITS EARSHOT REACHES THE GATEHOUSE', '#ffd36b');
      if (G && near(G.winch[0] * ts, (G.winch[1] + 1) * ts, 90) && once('winch')) number(P0.x, P0.y - 34, braked() ? 'THE BRAKE IS ON: THE GATEHOUSE HOLDS IT' : 'THE GATE WINCH: E HAULS IT', '#ffd36b');
      for (const k of K.setKegs) if (k.st === 'set' && near(k.x * ts, (k.y + 1) * ts, 120) && once('setKegs')) { number(P0.x, P0.y - 34, 'A KEG CHAIN: ONE BLAST SETS OFF THE NEXT', '#ffd36b'); break; } }
    stall(P0, dt);
  };

  /* ---------- A PLAYER'S HANDS AT THE RULE'S LOCKS (tools/level-walk.mjs asks BK.walkHint(): where a player goes next and what he presses there) ----------
     The walker's bot fights and walks the route; it has no idea a gong is rung or a keg thrown. A player does: at the gate he rings THE GREAT GONG and hauls the
     winch, at the store he kicks the first keg and stands clear, at THE ROOF BRIDGE he cuts its gong's rope, at THE HAWK TOWER he takes a keg and throws it at the
     bricked door. { x, y, key: 'talk'|'atk'|null, face } in world px, or null (nothing to work here) */
  H.walkHint = P => {
    if (!K || !P || P.dead) return null; const ts = TS(), c = P.x / ts, G = K.gate, here = (x, row, key, face) => ({ x: x * ts + 8, y: (row + 1) * ts, key, face: face || 0 });
    if (G && !G.pinned && c > 226 && c < 258) { const gg = gongOf('great');
      if (braked()) return gg && gg.hum <= 0 && !squad().some(e => ['called', 'exit', 'muster'].includes(e.ks.st)) ? here(gg.x, gg.y, 'talk', 1) : here(G.winch[0], G.winch[1], null, 1);
      return here(G.winch[0], G.winch[1], 'talk', 1); }
    const arch = K.barricades.find(b => b.id === 'storeArch');
    if (arch && !arch.broken && c > 386 && c < 446) { const k0 = K.setKegs.find(k => k.chain && k.st === 'set'), lit = K.setKegs.some(k => k.chain && k.st === 'lit');
      return lit || !k0 ? here(390, 24, null, 1) : here(k0.x - 1, k0.y, 'atk', 1); }
    const bg = K.gongs.find(g => g.bridge && !g.cut);
    if (bg && c > 490 && c < 524 && Math.abs(P.y - gy(bg)) < 3 * ts) return here(bg.x - 1, bg.y, 'atk', 1);
    const ta = K.barricades.find(b => b.id === 'towerArch');
    if (ta && !ta.broken && c > 531 && c < 562) { const q = held(P), st = K.stacks.find(s => s.id === 'towerKegs');
      if (K.items.some(i => i.thrKind === 'keg' && i.state === 'fuse')) return here(ta.x0 - 9, 20, null, 1);
      if (q && q.thrKind === 'keg') return here(ta.x0 - 6, 20, 'atk', 1);
      if (st && st.left > 0) return here(st.x, st.y, 'talk', 1); }
    return null; };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.ksar) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'gong') { const g = gongOf(id); return g ? (g.cut ? 'cut' : 'hung') : ''; }
    if (kind === 'gate') return K.gate ? (K.gate.pinned ? 'open' : braked() ? 'braked' : 'free') : '';
    if (kind === 'arch') { const b = K.barricades.find(q => q.id === id); return b ? (b.broken ? 'broken' : 'whole') : ''; }
    if (kind === 'vault') { const v = K.vault.find(q => q.id === id); return v ? (v.open ? 'open' : ctx.questGot() >= v.seals ? 'due' : 'shut') : ''; }
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('ksar', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (GREYBOX: plain shapes until the art pass) ---------- */
  const R = Math.round;
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), inX = (x, m = 60) => x > cx - m && x < cx + vw + m, L = K.L, P = ctx.hero();
    /* the decor: the guard huts' awnings, the parapet's crenels, the minaret, the stalls, a banner */
    for (const d of L.decor || []) { const x0 = (d.x0 ?? d.x) * ts, x1 = ((d.x1 ?? d.x) + 1) * ts; if (x1 < cx - 40 || x0 > cx + vw + 40) continue;
      if (d.kind === 'parapet') { g.fillStyle = '#9a7650'; for (let x = Math.max(x0, Math.floor(cx / 32) * 32); x < Math.min(x1, cx + vw + 32); x += 32) g.fillRect(R(x - cx), R(d.y * ts - 8 - cy), 14, 8); }
      else if (d.kind === 'hut') { g.fillStyle = 'rgba(40,24,16,0.35)'; g.fillRect(R(x0 + ts - cx), R((d.y + 1) * ts - cy), x1 - x0 - 2 * ts, (d.floor - d.y - 1) * ts); g.fillStyle = '#a8423a'; for (let x = x0; x < x1; x += 8) g.fillRect(R(x - cx), R((d.y + 1) * ts - cy), 4, 5); }
      else if (d.kind === 'minaret') { g.fillStyle = '#b8946a'; g.fillRect(R(d.x * ts - 6 - cx), R(d.top * ts - cy), 28, (d.y - d.top + 1) * ts); g.fillStyle = '#e8d0a0'; g.fillRect(R(d.x * ts - 10 - cx), R(d.top * ts - 8 - cy), 36, 8); }
      else if (d.kind === 'souqroof') { g.fillStyle = '#6a4a30'; for (const px of [x0 + 2, x1 - 4, (x0 + x1) / 2]) g.fillRect(R(px - cx), R((d.y + 1) * ts - cy), 3, 5 * ts); }
      if (d.kind === 'stall' || d.kind === 'souqroof') { g.fillStyle = d.kind === 'stall' ? '#c86a3a' : '#7a5a3a'; for (let x = x0; x < x1; x += 8) g.fillRect(R(x - cx), R(d.y * ts - 2 - cy), 4, 4); }
      else if (d.kind === 'awning') { g.fillStyle = '#6a4a30'; g.fillRect(R(x0 + 1 - cx), R(d.y * ts - cy), 2, 30); g.fillRect(R(x1 - 3 - cx), R(d.y * ts - cy), 2, 30); for (let x = x0; x < x1; x += 8) { g.fillStyle = (x / 8) % 2 ? '#c8a050' : '#a8402e'; g.fillRect(R(x - cx), R(d.y * ts + 8 - cy), 8, 5); } }
      else if (d.kind === 'banner') { g.fillStyle = '#5a1e1e'; g.fillRect(R(d.x * ts + 6 - cx), R(d.y * ts - 30 - cy), 2, 30); g.fillStyle = '#a8302a'; g.fillRect(R(d.x * ts + 8 - cx), R(d.y * ts - 30 - cy), 10, 14); } }
    /* THE BRICKED ARCHES (whole: rough mud-brick with a crack, a red ring once a keg is in your hand) */
    for (const b of K.barricades) { if (b.broken || !inX(b.x0 * ts)) continue; for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) { const px = R(x * ts - cx), py = R(y * ts - cy);
        g.fillStyle = (x + y) % 2 ? '#8a6440' : '#9a7450'; g.fillRect(px, py, ts, ts); g.fillStyle = '#5a3e26'; g.fillRect(px, py + 7, ts, 1); g.fillRect(px + ((y % 2) ? 4 : 11), py, 1, 7); g.fillRect(px + ((y % 2) ? 9 : 2), py + 8, 1, 8); }
      g.strokeStyle = '#3a2416'; g.beginPath(); g.moveTo(R(b.x0 * ts + 4 - cx), R(b.y0 * ts + 2 - cy)); g.lineTo(R(b.x0 * ts + 10 - cx), R((b.y0 + b.y1) / 2 * ts - cy)); g.lineTo(R(b.x0 * ts + 5 - cx), R((b.y1 + 1) * ts - 2 - cy)); g.stroke();
      if (held(P) && held(P).thrKind === 'keg' || K.setKegs.some(k => k.st !== 'spent' && Math.abs(k.x - b.x0) < 6)) { const p = 0.5 + 0.5 * Math.sin(time * 6); g.strokeStyle = 'rgba(255,107,107,' + (0.4 + 0.4 * p).toFixed(2) + ')'; g.strokeRect(R(b.x0 * ts - 2 - cx), R(b.y0 * ts - 2 - cy), (b.x1 - b.x0 + 1) * ts + 4, (b.y1 - b.y0 + 1) * ts + 4); } }
    /* THE GATE: the portcullis's bars over its closed cells, the grille over the guard room, the winch and its gauge */
    const G = K.gate; if (G && inX(G.x * ts, 200)) {
      for (let y = G.y0; y <= G.y1; y++) { if (G.pinned || y > G.y1 - G.notch) continue; const px = R(G.x * ts - cx), py = R(y * ts - cy); g.fillStyle = '#2a2624'; g.fillRect(px, py, ts, ts); g.fillStyle = '#6a6460'; for (let k = 2; k < ts; k += 5) g.fillRect(px + k, py, 2, ts); g.fillRect(px, py + 7, ts, 2); }
      { const gr = G.grille; for (let y = gr.y0; y <= gr.y1; y++) { const px = R(gr.x * ts - cx), py = R(y * ts - cy); g.fillStyle = '#1e1a18'; g.fillRect(px, py, ts, ts); g.fillStyle = '#7a7470'; for (let k = 1; k < ts; k += 4) g.fillRect(px + k, py, 2, ts); } }
      const wx = R(G.winch[0] * ts + 8 - cx), wy = R((G.winch[1] + 1) * ts - cy); g.fillStyle = '#5a4030'; g.fillRect(wx - 9, wy - 14, 18, 14); g.fillStyle = '#8a8480'; g.beginPath(); g.arc(wx, wy - 14, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3a2a1e'; const a = time * (braked() ? 0 : 1) + G.notch * 1.2; g.fillRect(wx + R(Math.cos(a) * 6) - 1, wy - 14 + R(Math.sin(a) * 6) - 1, 3, 3);
      /* THE GAUGE beside it (A3: the gate's state where you stand): notches up, and the brake's lamp */
      for (let i = 0; i < G.notches; i++) { g.fillStyle = (G.pinned || i < G.notch) ? '#8fd160' : '#3a3430'; g.fillRect(wx + 12, wy - 6 - i * 5, 5, 4); }
      g.fillStyle = G.pinned ? '#8fd160' : braked() ? (Math.floor(time * 4) % 2 ? '#ff6b6b' : '#a83a3a') : '#ffd36b'; g.fillRect(wx - 16, wy - 24, 5, 5);
      if (!G.pinned) ctx.text(braked() ? 'BRAKE' : 'FREE', wx - 14, wy - 30, braked() ? '#ff9a5c' : '#ffd36b', 'center', 5); }
    /* THE VAULT DOOR */
    for (const v of K.vault) { if (v.open || !inX(v.x * ts)) continue; for (let y = v.y0; y <= v.y1; y++) { const px = R(v.x * ts - cx), py = R(y * ts - cy); g.fillStyle = '#4a3a2a'; g.fillRect(px, py, ts, ts); g.fillStyle = '#c9a050'; g.fillRect(px + 2, py + 3, ts - 4, 2); } }
    /* THE GONGS: the frame, the rope, the disc (a cut one lies on the floor); near you its EARSHOT as a bracket on the floor; rung, NOISE RINGS out to it */
    for (const q of K.gongs) { const x = R(gx(q) - cx), y = R(gy(q) - cy); if (!inX(gx(q), q.ear * ts)) continue; const big = q.great ? 1.4 : 1;
      if (inX(gx(q), 80)) { g.fillStyle = '#5a4030'; g.fillRect(x - 11, y - 44, 3, 44); g.fillRect(x + 8, y - 44, 3, 44); g.fillRect(x - 12, y - 46, 24, 3);
        if (!q.cut) { g.fillStyle = '#d9b36a'; g.fillRect(x - 1, y - 43, 2, 10); const sw = q.ring > 0 ? Math.sin(time * 30) * 2 * q.ring : 0; g.fillStyle = '#c99a3a'; g.beginPath(); g.arc(x + sw, y - 24, 9 * big, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(x - 2 + sw, y - 26, 3 * big, 0, Math.PI * 2); g.fill(); }
        else { g.fillStyle = '#d9b36a'; g.fillRect(x - 1, y - 43, 2, 4); g.fillStyle = '#8a6a2a'; g.fillRect(x - 10 * big, y - 4, 20 * big, 4); } }
      if (!q.cut && P && Math.abs(P.x - gx(q)) < q.ear * ts && Math.abs(P.y - gy(q)) < q.earY * ts) { g.globalAlpha = 0.35; g.fillStyle = '#ffd36b'; const l = R(gx(q) - q.ear * ts - cx), r2 = R(gx(q) + q.ear * ts - cx);
        g.fillRect(l, y - 1, 2, -8); g.fillRect(r2, y - 1, 2, -8); for (let xx = l; xx < r2; xx += 12) g.fillRect(xx, y - 1, 4, 1); g.globalAlpha = 1; }
      if (q.ring > 0) { const k = 1 - q.ring / 1.4; g.strokeStyle = 'rgba(255,211,107,' + (0.8 * (1 - k)).toFixed(2) + ')'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { const rr = (k + i * 0.18) % 1 * q.ear * ts; g.beginPath(); g.arc(x, y - 24, rr, Math.PI, Math.PI * 2); g.stroke(); } g.lineWidth = 1; } }
    /* THE STACKS (kegs, flasks: how many are left) */
    for (const s of K.stacks) { if (!inX(s.x * ts)) continue; const x = R(s.x * ts + 8 - cx), y = R((s.y + 1) * ts - cy);
      for (let i = 0; i < s.left; i++) drawThing(g, s.kind, x - 6 + (i % 2) * 10, y - (i >> 1) * 9, time, false); if (s.left <= 0) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x - 8, y - 2, 16, 2); } }
    /* THE SET KEGS AND THE CHAIN: a dotted fuse-line keg to keg and on to the arch (the chain shows its target before it goes) */
    const live = K.setKegs.filter(k => k.st !== 'spent');
    for (let i = 0; i < live.length; i++) { const k = live[i], x = R(k.x * ts + 8 - cx), y = R((k.y + 1) * ts - cy); if (!inX(k.x * ts, 200)) continue;
      drawThing(g, 'keg', x, y, time, k.st === 'lit');
      const nx = live[i + 1] ? live[i + 1].x * ts + 8 : null, b = K.barricades.find(q => !q.broken && Math.abs(q.x0 - k.x) < 6);
      const tx = nx != null && nx - k.x * ts < KS.chainR + 12 ? nx : b ? b.x0 * ts + 8 : null;
      if (tx != null) { g.fillStyle = k.st === 'lit' ? '#ff9a3c' : 'rgba(255,211,107,0.55)'; const off = (time * 20) % 6; for (let xx = x + 8 + off; xx < tx - cx - 6; xx += 6) g.fillRect(R(xx), y - 3, 2, 1); }
      if (k.st === 'lit') { g.strokeStyle = '#ff6b6b'; g.beginPath(); g.arc(x, y - 6, KS.kegR * (0.6 + 0.4 * Math.sin(time * 12)), 0, Math.PI * 2); g.stroke(); } }
    /* WHAT IS CARRIED, THROWN, LYING OR FIZZING */
    for (const q of K.items) { if (!inX(q.x)) continue; drawThing(g, q.thrKind, R(q.x - cx), R(q.y - cy + (q.state === 'held' ? 6 : 0)), time, q.state === 'fuse');
      if (q.state === 'fuse') { g.strokeStyle = '#ff6b6b'; g.beginPath(); g.arc(R(q.x - cx), R(q.y - 6 - cy), KS.kegR, 0, Math.PI * 2); g.stroke(); } }
    /* THE FORT'S MEN: asleep (Z), called (a gong over his head), running for his gong (a red !), striking it; a lookout's sightline */
    for (const e of ctx.enemies()) { if (!e.alive || !e.ks || !inX(e.x)) continue; const x = R(e.x - cx), y = R(e.y - cy), q = e.ks;
      if (q.st === 'asleep') ctx.text('Z', x + 6 + R(Math.sin(time * 2 + e.x) * 2), y - 24 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
      else if (q.st === 'called' || q.st === 'exit' || q.st === 'muster') { g.fillStyle = '#c99a3a'; g.beginPath(); g.arc(x, y - 30, 3, 0, Math.PI * 2); g.fill(); }
      else if (q.st === 'run' || q.st === 'strike') ctx.text('!', x, y - 30, Math.floor(time * 10) % 2 ? '#ff6b6b' : '#fff6e0', 'center', 7);
      if (q.role === 'lookout' && (q.st === 'post') && P) { const f = e.face || 1, seen = sees(e, P); g.fillStyle = seen ? 'rgba(255,90,90,0.18)' : 'rgba(255,240,180,0.10)'; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + f * KS.sight, y - 14 - 22); g.lineTo(x + f * KS.sight, y + 2); g.closePath(); g.fill(); }
      if (e.ksStun > 0) { for (let i = 0; i < 3; i++) { const a = time * 5 + i * 2.1; g.fillStyle = '#fff6c8'; g.fillRect(x + R(Math.cos(a) * 7), y - 22 + R(Math.sin(a) * 2), 2, 2); } } }
    for (const d of K.drops || []) { if (!inX(d.x)) continue; const x = R(d.x - cx), fy = R(((K.gate ? K.gate.y1 + 1 : 34) * ts) - cy);
      if (d.t > 0) { g.fillStyle = Math.floor(time * 14) % 2 ? '#ff6b6b' : '#fff6e0'; g.fillRect(x - 6, fy - 2, 12, 2); } else { g.fillStyle = '#8a7a6a'; g.fillRect(x - 3, R(d.y - cy) + R(-d.t * 300), 6, 6); } }
    if (K.glint && K.glint.show) drawGlint(g, R(K.glint.x - cx), R(K.glint.y - 18 - cy), vw, ctx.VH(), time);
  };
  function drawThing(g, kind, x, y, time, lit) {
    if (kind === 'keg') { g.fillStyle = '#5a3a22'; g.fillRect(x - 5, y - 10, 10, 10); g.fillStyle = '#8a5a32'; g.fillRect(x - 4, y - 9, 8, 8); g.fillStyle = '#2a2a2a'; g.fillRect(x - 5, y - 8, 10, 1); g.fillRect(x - 5, y - 3, 10, 1);
      g.fillStyle = lit ? (Math.floor(time * 16) % 2 ? '#ffd36b' : '#ff6a2a') : '#c9b27c'; g.fillRect(x - 1, y - 13, 2, 3); }
    else { g.fillStyle = '#d8e0e8'; g.fillRect(x - 2, y - 7, 5, 7); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 6, 2, 4); g.fillStyle = '#8a6a3a'; g.fillRect(x - 1, y - 9, 3, 2); }
  }
  /* OVER EVERYTHING: the told arc of what is in your hand, the smoke, the blasts and flashes, the hawks' shrieks */
  H.drawOver = (g, cx, cy, time) => { if (!K) return; const P = ctx.hero(), R0 = Math.round;
    for (const s of K.smokes) { const k = Math.min(1, s.t / 1.2), x = R0(s.x - cx), y = R0(s.y - cy); for (let i = 0; i < 7; i++) { const a = i * 0.9 + time * 0.4, rr = s.r * (0.55 + 0.25 * Math.sin(time + i));
        g.globalAlpha = 0.38 * k; g.fillStyle = i % 2 ? '#d8d0c8' : '#b8b0a8'; g.beginPath(); g.arc(x + Math.cos(a) * s.r * 0.35, y + Math.sin(a) * s.r * 0.25, rr, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; }
    for (const f of K.fx) { const x = R0(f.x - cx), y = R0(f.y - cy);
      if (f.k === 'blast') { g.globalAlpha = Math.min(1, f.t * 3); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, KS.kegR * (1 - f.t), 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      else if (f.k === 'flash') { g.globalAlpha = Math.min(1, f.t * 3); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y - 6, KS.flashR * (1 - f.t * 1.5), 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      else if (f.k === 'shriek') { g.strokeStyle = 'rgba(255,107,107,' + (f.t).toFixed(2) + ')'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x, y, (1 - f.t) * 60 + i * 10, 0, Math.PI * 2); g.stroke(); } } }
    const q = held(P); if (q && !P.dead) { K.arc = H.arcOf(P); CT.drawArc(g, K.arc, cx, cy, time, q.thrKind === 'keg' ? '#ff9a3c' : '#e8f4ff'); } else K.arc = null;
  };
  /* THE HUD: the sun meter is the desert's (main.js); the drawn rule state is in the world */
  H.drawHud = () => false;   /* (the sun meter is main.js's own: the desert's) */
  H.read = () => K && { n: { ...K.n }, gongs: K.gongs.map(g => ({ id: g.id, cut: g.cut, hum: +g.hum.toFixed(2) })), gate: K.gate && { notch: K.gate.notch, pinned: K.gate.pinned, braked: braked() },
    arches: K.barricades.map(b => ({ id: b.id, broken: b.broken })), kegs: K.setKegs.map(k => k.st), stacks: K.stacks.map(s => ({ id: s.id, left: s.left })), smokes: K.smokes.length,
    items: K.items.map(q => ({ t: q.thrKind, st: q.state, x: R(q.x), y: R(q.y) })), glint: K.glint && K.glint.key, lastNudge: K.lastNudge || null,
    foes: ctx.enemies().filter(e => e.alive && e.ks).map(e => ({ t: e.cnSkin, role: e.ks.role, st: e.ks.st, x: R(e.x / 16), y: R(e.y / 16) })), vault: K.vault.map(v => v.open) };
  return H;
}
