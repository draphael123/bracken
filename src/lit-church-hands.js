// src/lit-church-hands.js - THE LIT CHURCH's HANDS (claude/litchurch, the greybox). src/lit-church.js builds the level; this binds its rule to the game:
// THE ROOMS (each LIT while a lamp in it burns, DARK when all are out - drawn: the room's dark, and its name and state when you come in), THE FLAME (E at a
// fire puts a taper in your hand: it burns FLAME.life s and a blow that lands on you puts it out; E at a dark lamp with it lights the lamp), THE SNUFF (a blade
// through a lit lamp), THE CLERGY (a priest's bolt and heal are the room's light: lit x1.3, dark x0.7; he walks to a snuffed lamp and re-lights it - a told
// rite a blow cuts; an ACOLYTE runs for it and lights it in a breath; THE ARCHDEACON prays over his whole room), THE DEAD (a dark room's GRATES bring them up -
// told: the grate glows cold first; a lit room burns them), THE DOORS (the porch lamp lifts the west door's bars; the seal lamp's light holds the crypt hatch;
// the three chapel lamps light the rood screen's sconces - the third by hand; lamp three cracks the crossing's crypt grate), THE ORGAN (a struck BELLOWS lifts
// you up its pipe; E at the KEY DESK holds a chord: a told gust west along the gallery), THE DARK RISES (lamp three lit: the dark comes up the crypt well behind
// you; a lit sconce on a landing holds it below a while and gives you a fresh flame; reach the crossing and the nave goes dark behind you), THE RELIQUARY
// (five candle stubs: a silver and the sacristy door), the glint and the 10 s nudge (STUCK_HANDS.church), and the drawing (GREYBOX shapes until the art pass).
// THE SANCTUARY's lamps are the rule too: a blade through one there tells THE PALADIN (ctx.bossLamp, src/paladin-boss-hands.js) and he kindles them (H.light).
// main.js calls: reset, on, update, hold, interact, holes, drawWorld, drawOver, drawHud, read, handsState, walkHint, lampsOf, light, foeMul.
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';

/* (deadDark: the dead's blows x this in a dark room) THE NUMBERS. FLAME: life s a taper burns, takeR/useR px you reach a fire / a lamp in, glow px it lights round you. LC: litMul/darkMul a priest's blows by his room's
   light, knightLit a knight's; heal: of the healed one's health (x litHeal lit / x darkHeal dark), healCd/healTell/healR; relightT a priest's rite, acoRelightT an
   acolyte's, priestV/acoV their walk; riseEvery/riseTell/riseCap/riseNear a dark room's grates; burnDps the light on the dead; bellowsT/lift a bellows' breath;
   chordTell/chordT/gustAir/gustGround the key desk's chord; darkV px/s the rising dark climbs, darkTick/darkPct its bite, holdT s a sconce holds it, darkSpawn its
   dead; archHealCd/archHealTell/archHeal THE ARCHDEACON's prayer over his room */
export const FLAME = { life: 14, takeR: 24, useR: 26, glow: 70 };
export const LC = { litMul: 1.3, darkMul: 0.7, knightLit: 1.15, heal: 0.16, litHeal: 1.5, darkHeal: 0.5, healCd: 7, healTell: 1.0, healR: 130, relightT: 1.5, acoRelightT: 0.6,
  priestV: 44, acoV: 92, riseEvery: 4.5, riseTell: 1.0, riseCap: 3, deadDark: 1.8, riseNear: 260, burnDps: 16, bellowsT: 2.8, lift: 230, chordTell: 0.55, chordT: 2.6, gustAir: 300, gustGround: 150,
  darkV: 24, darkTick: 0.6, darkPct: 0.06, holdT: 5, darkSpawn: 4.5, archHealCd: 9, archHealTell: 1.4, archHeal: 0.2, archRelight: 1.0 };
/* what a dark room's grates bring up (by room; the rest bring wights and haunts) */
const RISE = { graveyard: ['wight'], narthex: ['haunt'], nave: ['wight', 'haunt', 'boo'], transept: ['haunt', 'wight'], gallery: ['boo', 'haunt'], ossuary: ['wight', 'haunt'], altar: ['wight', 'haunt'], south: ['wight', 'haunt', 'boo'], tower: ['boo'] };
const RELIGHT = new Set(['lamp', 'sconce', 'arena']);   /* what the clergy light again (a chapel lamp, the rood screen's sconces and the seal are not theirs) */

export function makeLitChurchHands(ctx) {
  let K = null;
  const H = {};
  const TS = () => ctx.TS, T = () => ctx.T;
  const once = k => { if (K.said[k]) return false; K.said[k] = 1; return true; };
  const number = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');   /* (every teaching line is a src/hint-lines.js line: tools/hint-shown.mjs reads these calls) */
  H.on = () => !!K;
  H.state = () => K;
  const px = l => l.x * TS() + 8, py = l => (l.y + 1) * TS();   /* a lamp's / source's foot in world px */

  /* ---------- RESET: a fresh load builds the rule's state; a respawn keeps every lamp as it was, every door opened, the stubs and the reliquary ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.litchurch) { K = null; return; }
    if (!K || K.L !== L) {
      K = { L, said: {}, clock: 0, lamps: (L.lamps || []).map(l => ({ ...l, lit: !!l.lit, hold: l.hold ? LC.holdT : 0, by: l.lit ? 'laid' : '' })), sources: (L.sources || []).map(s => ({ ...s })),
        bellows: (L.bellows || []).map(b => ({ ...b, air: 0 })), desks: (L.desks || []).map(d => ({ ...d, tell: 0, on: 0 })), grates: (L.grates || []).map(g => ({ ...g, t: 0, glow: 0 })),
        doors: (L.doors || []).map(d => ({ ...d, open: false })), rooms: (L.rooms || []).map(r => ({ ...r, lit: false, was: null })),
        dark: { st: 'idle', y: 0, t: 0, spawnT: 0, tickT: 0 }, escaped: false,
        n: { lit: 0, litByHero: 0, snuffed: 0, relit: 0, relitByAco: 0, ritesCut: 0, heals: 0, healsCut: 0, archHeals: 0, risen: 0, burnt: 0, flames: 0, flamesOut: 0, flamesDied: 0,
          breaths: 0, lifts: 0, chords: 0, gusted: 0, doors: 0, darkHolds: 0, darkBites: 0, nudges: 0 } };
      const ro = K.L.rooms.find(r => r.rises); if (ro) K.dark.y = (ro.rises.floor) * TS();
    }
    K.fx = []; K.glint = null; K.stalls = {}; K.stallKey = null;
    for (const b of K.bellows) b.air = 0; for (const d of K.desks) { d.tell = 0; d.on = 0; } for (const g of K.grates) { g.t = 0; g.glow = 0; }
    for (const pp of ctx.players) { pp.lcFlame = 0; pp.lcHp = pp.hp; }
    /* THE DARK RISES again from the bottom on a new attempt, until you have got out of the well once */
    if (!K.escaped) { const ro = K.L.rooms.find(r => r.rises); K.dark.st = lampOf('chapel3') && lampOf('chapel3').lit ? 'armed' : 'idle'; if (ro) K.dark.y = ro.rises.floor * TS(); }
    for (const d of K.doors) if (d.open) setDoor(d, true);
    rooms();
    if (typeof window !== 'undefined' && window.BK) Object.assign(window.BK, { litChurch: () => K, litChurchHands: () => H, walkHint: () => H.walkHint(ctx.hero()) });
  };
  const lampOf = id => K.lamps.find(l => l.id === id);
  const roomOf = id => K.rooms.find(r => r.id === id);
  /* the room a point is in: the smallest box that holds it (the well stands inside the altar room) */
  function roomAt(wx, wy) { const ts = TS(), tx = wx / ts, ty = (wy - 1) / ts; let best = null, area = 1e9;
    for (const r of K.rooms) if (tx >= r.x0 && tx < r.x1 + 1 && ty >= r.y0 && ty < r.y1 + 1) { const a = (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1); if (a < area) { area = a; best = r; } } return best; }
  H.roomAt = (x, y) => (K ? roomAt(x, y) : null);
  const lit = id => { const r = roomOf(id); return !!r && r.lit; };
  /* EVERY ROOM'S STATE, and its dark drawn: lit while a lamp in it burns */
  function rooms() { if (!K) return;
    for (const r of K.rooms) { r.lit = K.lamps.some(l => l.room === r.id && l.lit); }
    for (const z of K.L.darkZones || []) { const r = roomOf(z.room); if (!r) continue; z.dark = r.lit ? (r.outside ? 0.22 : r.dark ? 0.32 : 0.12) : (r.outside ? 0.6 : r.dark ? 0.86 : 0.74); } }
  H.lit = id => !!K && lit(id);

  /* ---------- THE DOORS ---------- */
  function setDoor(d, open) { for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) { if (open) ctx.cellOpen(x, y); else ctx.cellSet(x, y, T().PORT); } }
  function openDoor(id) { const d = K.doors.find(q => q.id === id); if (!d || d.open) return; d.open = true; K.n.doors++; setDoor(d, true); ctx.sfx.gateLift && ctx.sfx.gateLift(); ctx.shake(2);
    const ts = TS(), x = (d.x0 + d.x1 + 1) / 2 * ts, y = d.y0 * ts - 24; for (let yy = d.y0; yy <= d.y1; yy++) ctx.burst(x, yy * ts + 8, 3, ['#ffe9a8', '#c9b27c'], 40, 0.5);
    switch (id) {   /* (each line a literal: src/hint-lines.js routes it, tools/hint-shown.mjs reads it) */
      case 'west': number(x, y, 'THE WEST DOOR OPENS', '#8fd160'); break;
      case 'hatch': number(x, y, 'THE SEAL IS OUT: THE CRYPT HATCH OPENS', '#8fd160'); break;
      case 'rood': number(x, y, 'THE ROOD SCREEN OPENS', '#8fd160'); break;
      case 'cryptgrate': number(x, y, 'THE CRYPT GRATE IN THE CROSSING CRACKS OPEN', '#8fd160'); break;
      case 'reliquary': number(x, y, 'THE RELIQUARY OPENS', '#8fd160'); break;
      case 'sacristy': number(x, y, 'THE SACRISTY DOOR IS UNBARRED: A WAY BACK TO THE CRYPT', '#8fd160'); break;
    } }
  H.door = id => (K ? (K.doors.find(q => q.id === id) || {}).open : false);

  /* ---------- A LAMP LIT, A LAMP SNUFFED ---------- */
  function lightLamp(l, by) {
    if (!l || l.lit) return false; l.lit = true; l.by = by; K.n.lit++; if (by === 'hero') K.n.litByHero++; if (by === 'priest' || by === 'acolyte') { K.n.relit++; if (by === 'acolyte') K.n.relitByAco++; }
    if (l.hold) l.hold = LC.holdT;
    ctx.sfx.ignite ? ctx.sfx.ignite() : ctx.sfx.whoosh && ctx.sfx.whoosh(); ctx.burst(px(l), py(l) - 22, 8, ['#ffd36b', '#fff6c8', '#ff9a3c'], 50, 0.5);
    if (by === 'hero' && once('firstLight')) number(px(l), py(l) - 44, 'THE ROOM IS LIT: THE PRIESTS ARE STRONG IN IT', '#ffd36b');
    if (l.opens === 'west') openDoor('west');
    if (l.kind === 'chapel') { const rs = K.lamps.find(q => q.kind === 'rood' && q.of === l.id && !q.hand); if (rs && !rs.lit) { rs.lit = true; K.n.lit++; }
      number(px(l), py(l) - 44, l.id === 'chapel1' ? 'LAMP ONE BURNS: A SCONCE ON THE ROOD SCREEN' : l.id === 'chapel2' ? 'LAMP TWO BURNS: A SCONCE ON THE ROOD SCREEN' : 'LAMP THREE BURNS: THE CRYPT CRACKS', '#8fd160');
      if (l.cracks) crack(); }
    if (l.kind === 'rood' || l.kind === 'chapel') { if (K.lamps.filter(q => q.kind === 'rood').every(q => q.lit)) openDoor('rood'); }
    if (l.kind === 'arena' && ctx.bossKindled) ctx.bossKindled(l);
    if (l.room === 'well' && l.hold) { for (const e of ctx.enemies()) if (e.alive && e.lc && e.lc.room === 'well' && e.lc.st === 'asleep' && Math.abs(e.y - py(l)) < 4.5 * TS())   /* (only the landing's own: each sconce is its own trade) */ { e.lc.st = 'free'; ctx.number(e.x, e.y - 30, '!', '#ff6b6b'); }
      if (once('wellWake')) number(px(l), py(l) - 40, 'THE LIGHT WAKES THE CLERGY ON THE STAIR', '#ff9a5c'); }
    rooms(); return true; }
  function snuff(l, by) {
    if (!l || !l.lit || l.kind === 'chapel' || l.kind === 'rood') return false; l.lit = false; l.by = ''; K.n.snuffed++;
    ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(px(l), py(l) - 22, 6, ['#6a6a7a', '#3a3a4a', '#c8c8d0'], 40, 0.6);
    if (l.opens === 'hatch') openDoor('hatch');
    if (l.kind === 'arena' && by === 'hero' && ctx.bossLamp) ctx.bossLamp(l);
    if (by === 'hero') { const r = roomOf(l.room); rooms();
      if (r && !r.lit && once('firstDark') && !r.arena) number(px(l), py(l) - 44, 'THE ROOM IS DARK: THE PRIESTS WEAKEN, AND THE DEAD COME UP', '#ff9a5c'); }
    rooms(); return true; }
  H.light = id => (K ? lightLamp(lampOf(id), 'boss') : false);   /* THE PALADIN's kindling (src/paladin-boss-hands.js) */
  H.lampsOf = room => (K ? K.lamps.filter(l => l.room === room).map(l => ({ id: l.id, x: px(l), lit: l.lit })) : []);
  /* LAMP THREE: the crossing's crypt grate cracks open (the way up), and the dark is ARMED - it rises when you set foot in the well */
  function crack() { openDoor('cryptgrate');
    if (!K.escaped) K.dark.st = 'armed'; ctx.shake(6); ctx.sfx.crack && ctx.sfx.crack(); }

  /* ---------- THE FLAME IN YOUR HAND ---------- */
  const fires = () => K.sources.map(s => ({ x: px(s), y: py(s), src: s })).concat(K.lamps.filter(l => l.lit && l.kind !== 'rood').map(l => ({ x: px(l), y: py(l), lamp: l })));
  const near = (P, x, y, r) => Math.abs(P.x - x) <= r && P.y > y - 40 && P.y < y + 20;
  H.interact = P => {
    if (!K || P.dead) return false;
    /* a DARK LAMP with a flame in hand: light it */
    const dark = K.lamps.filter(l => !l.lit && l.kind !== 'rood' && near(P, px(l), py(l), FLAME.useR)).concat(K.lamps.filter(l => !l.lit && l.kind === 'rood' && l.hand && near(P, px(l), py(l) + 16, FLAME.useR + 10)));
    if (dark.length) { const l = dark.sort((a, b) => Math.abs(px(a) - P.x) - Math.abs(px(b) - P.x))[0];
      if (P.lcFlame > 0) { lightLamp(l, 'hero'); return true; }
      if (l.kind === 'chapel' && once('chapelNeeds')) number(P.x, P.y - 40, 'A CHAPEL LAMP WANTS A FLAME: E AT A FIRE TAKES ONE', '#9aa39a');
      else if (K.clock - (K.needSaid || -9) > 2.5) { K.needSaid = K.clock; number(P.x, P.y - 40, 'A FLAME LIGHTS IT: E AT A FIRE TAKES ONE', '#9aa39a'); } return true; }
    /* A FIRE: take a flame */
    const f = fires().filter(q => near(P, q.x, q.y, FLAME.takeR)).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (f) { P.lcFlame = FLAME.life; P.lcHp = P.hp; K.n.flames++; ctx.sfx.ignite ? ctx.sfx.ignite() : ctx.sfx.whoosh && ctx.sfx.whoosh(); ctx.burst(P.x, P.y - 30, 6, ['#ffd36b', '#ff9a3c'], 30, 0.4);
      if (once('flame')) number(P.x, P.y - 44, 'A FLAME: IT BURNS DOWN. A BLOW PUTS IT OUT', '#ffd36b'); return true; }
    /* THE KEY DESK: a chord */
    const d = K.desks.find(q => near(P, px(q), py(q), 24));
    if (d) { if (d.tell <= 0 && d.on <= 0) { d.tell = LC.chordTell; K.n.chords++; ctx.sfx.organ ? ctx.sfx.organ() : ctx.sfx.horn && ctx.sfx.horn(); if (once('chord')) number(P.x, P.y - 44, 'THE CHORD: THE GUST BLOWS WEST', '#ffd36b'); } return true; }
    /* THE RELIQUARY */
    const rq = K.doors.find(q => q.id === 'reliquary' && !q.open && Math.abs((q.x0 * TS() + 8) - P.x) <= 26 && P.y > q.y0 * TS() && P.y <= (q.y1 + 2) * TS());
    if (rq) { if (ctx.questGot() >= 5) { openDoor('reliquary'); openDoor('sacristy'); }
      else number(P.x, P.y - 34, 'THE RELIQUARY WANTS FIVE CANDLE STUBS', '#9aa39a'); return true; }
    return false; };

  /* ---------- THE CLERGY AND THE DEAD: main.js asks before a foe's own machine runs. true = the hands move him this frame ---------- */
  function bind() { for (const e of ctx.enemies()) { if (!e.alive || e.lc) continue; const k = e.xpKey != null ? parseInt(e.xpKey, 10) : -1, src = k >= 0 ? K.L.ents[k] : null;
      if (!src || !src.lc) { if (e.lcRisen) e.lc = { role: 'dead', room: e.lcRisen, st: 'free', hp: e.hp }; continue; }
      e.lc = { role: src.lc, room: src.room, home: e.x, st: src.asleep ? 'asleep' : 'free', t: 0, hp: e.hp, cd: 2 + (k % 5) * 0.7, lamp: null }; } }
  const fall = (e, dt) => { e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); ctx.moveFoeY(e, e.vy * dt); };
  const walk = (e, tx, v, dt) => { const d = tx - e.x; if (Math.abs(d) < 4) { e.vx = 0; return true; } const s = Math.sign(d); e.face = s;
    const ts = TS(), ftx = Math.floor((e.x + s * 8) / ts), fty = Math.floor((e.y + 1) / ts); if (!ctx.standable(ftx, fty)) { e.vx = 0; return true; }   /* never off an edge */
    const x0 = e.x; ctx.moveFoe(e, s * Math.min(Math.abs(d), v * dt)); e.mode = 'walk'; e.vx = s * v; e.anim = (e.anim || 0) + dt; return Math.abs(e.x - x0) < v * dt * 0.2; };
  /* the snuffed lamp a priest or an acolyte would go for: in his room, his kind */
  const wantLamp = (e, q) => K.lamps.filter(l => !l.lit && l.room === q.room && RELIGHT.has(l.kind) && Math.abs(py(l) - e.y) < 60).sort((a, b) => Math.abs(px(a) - e.x) - Math.abs(px(b) - e.x))[0] || null;
  /* THE LIGHT ON A FOE'S BLOWS (main.js damagePlayer0 reads e.lcMul) */
  H.foeMul = e => (e && e.lc ? e.lcMul || 1 : 1);
  H.hold = (e, dt) => {
    if (!K || !e.alive) return false;
    if (!e.lc) { if (e.lcRisen) e.lc = { role: 'dead', room: e.lcRisen, st: 'free', hp: e.hp }; else return false; }
    const q = e.lc, P = ctx.hero(), lt = lit(q.room), hit = e.hp < q.hp - 0.01; q.hp = e.hp;
    if (q.role === 'priest') e.lcMul = lt ? LC.litMul : LC.darkMul; else if (q.role === 'knight') e.lcMul = lt ? LC.knightLit : 1; else if (q.role === 'dead') e.lcMul = lt ? 1 : LC.deadDark; else e.lcMul = 1;   /* the dark is the dead's: in it they hit harder */
    if (q.role === 'dead') { /* THE LIGHT BURNS THE DEAD: in a lit room they smoke and sink */
      if (lt && !roomOf(q.room).arena) { q.burn = (q.burn || 0) + LC.burnDps * dt; if (Math.random() < dt * 12) ctx.burst(e.x, e.y - 10, 1, ['#fff6c8', '#ffd36b'], 30, 0.4);
        if (q.burn >= 4) { const d = Math.floor(q.burn); q.burn -= d; ctx.hurtFoe(e, d); if (!e.alive) K.n.burnt++; if (once('burnDead')) number(e.x, e.y - 30, 'THE LIGHT BURNS THE DEAD', '#ffd36b'); } }
      return false; }
    if (hit && (q.st === 'rite' || q.st === 'heal')) { if (q.st === 'rite') { K.n.ritesCut++; q.relCd = 2.5; number(e.x, e.y - 34, 'THE RITE IS CUT', '#8fd160'); } else { K.n.healsCut++; number(e.x, e.y - 34, 'THE PRAYER IS CUT', '#8fd160'); } q.st = 'free'; q.cd = 3; }
    if (q.st === 'asleep') { if (hit) { q.st = 'free'; return false; } fall(e, dt); e.vx = 0; e.mode = q.role === 'acolyte' ? 'walk' : e.mode; return true; }
    q.cd -= dt; q.relCd = Math.max(0, (q.relCd || 0) - dt);
    const dP = P && !P.dead ? Math.abs(P.x - e.x) : 1e9, sameY = P && Math.abs(P.y - e.y) < 40;
    if (q.role === 'acolyte') return holdAcolyte(e, q, dt, dP, sameY);
    if (q.role !== 'priest') return false;
    const arch = e.cnSkin === 'archdeacon';
    switch (q.st) {
      case 'rite': q.t -= dt; e.vx = 0; fall(e, dt); if (Math.random() < dt * 14) ctx.burst(e.x + (e.face || 1) * 8, e.y - 18, 1, ['#ffd36b', '#fff6c8'], 20, 0.4);
        if (q.t <= 0) { if (q.lamp && !q.lamp.lit) { lightLamp(q.lamp, 'priest'); number(px(q.lamp), py(q.lamp) - 40, 'HE RE-LIGHTS THE LAMP', '#ff9a5c'); } q.st = 'free'; q.cd = 2; } return true;
      case 'heal': q.t -= dt; e.vx = 0; fall(e, dt); if (Math.random() < dt * 18) ctx.burst(e.x, e.y - 20 - Math.random() * 10, 1, ['#ffd36b', '#fff6c8'], 24, 0.5);
        if (q.t <= 0) { pray(e, q, arch); q.st = 'free'; q.cd = arch ? LC.archHealCd : LC.healCd; } return true;
      case 'toLamp': { const l = q.lamp; if (!l || l.lit) { q.st = 'free'; return false; }
        if (dP < 46 && sameY) { q.st = 'free'; return false; }   /* you are on him: he fights */
        fall(e, dt); if (walk(e, px(l) - (Math.sign(px(l) - e.x) || 1) * 10, LC.priestV * (arch ? 1.2 : 1), dt)) { q.st = 'rite'; q.t = arch ? LC.archRelight : LC.relightT; if (once('rite')) number(e.x, e.y - 34, 'HE RE-LIGHTS IT: A BLOW CUTS THE RITE', '#ffd36b'); }
        return true; }
    }
    /* FREE: pray (allies hurt, his heal ready), or go for a snuffed lamp (you are not on him), or fight (his own machine) */
    if (q.cd <= 0 && (e.mode === 'keep' || !e.mode || e.mode === 'walk')) {
      const hurt = ctx.enemies().some(o => o.alive && o.lc && o.lc.room === q.room && o.lc.role !== 'dead' && o.maxHp0 && o.hp < o.maxHp0 * 0.75 && Math.abs(o.x - e.x) < (arch ? 400 : LC.healR));
      if (hurt) { q.st = 'heal'; q.t = arch ? LC.archHealTell : LC.healTell; number(e.x, e.y - 34, arch ? 'THE ARCHDEACON PRAYS OVER HIS ROOM' : 'HE PRAYS: A BLOW CUTS IT', '#ffd36b'); return true; } }
    const l = q.relCd > 0 ? null : wantLamp(e, q); if (l && !(dP < 70 && sameY) && (e.mode === 'keep' || !e.mode || e.mode === 'walk')) { q.st = 'toLamp'; q.lamp = l; return true; }
    return false; };
  /* a prayer: every one of his own in reach (his whole room, for the Archdeacon) mends - by the room's light */
  function pray(e, q, arch) { const k = lit(q.room) ? LC.litHeal : LC.darkHeal; let n = 0;
    for (const o of ctx.enemies()) { if (!o.alive || !o.lc || o.lc.room !== q.room || o.lc.role === 'dead' || !o.maxHp0) continue; if (!arch && Math.abs(o.x - e.x) > LC.healR) continue;
      const add = Math.round(o.maxHp0 * (arch ? LC.archHeal : LC.heal) * k), h0 = o.hp; o.hp = Math.min(o.maxHp0, o.hp + add); if (o.hp > h0) { n++; ctx.number(o.x, o.y - 26, '+' + Math.round(o.hp - h0), '#ffd36b'); } }
    K.n.heals++; if (arch) K.n.archHeals++; ctx.sfx.chime ? ctx.sfx.chime() : ctx.sfx.bell && ctx.sfx.bell(); ctx.burst(e.x, e.y - 20, 12, ['#ffd36b', '#fff6c8'], 70, 0.6);
    if (n && once(lit(q.room) ? 'healLit' : 'healDark')) number(e.x, e.y - 44, lit(q.room) ? 'IN THE LIGHT HIS PRAYER HEALS DEEP' : 'IN THE DARK HIS PRAYER IS THIN', lit(q.room) ? '#ff9a5c' : '#8fd160'); }
  /* THE ACOLYTE: he does not fight. A snuffed lamp in his room - he runs for it with his taper and lights it in a breath; otherwise he keeps out of your reach */
  function holdAcolyte(e, q, dt, dP, sameY) {
    fall(e, dt);
    if (q.st === 'rite') { q.t -= dt; e.vx = 0; if (q.t <= 0) { if (q.lamp && !q.lamp.lit) { lightLamp(q.lamp, 'acolyte'); number(px(q.lamp), py(q.lamp) - 40, 'THE ACOLYTE LIGHTS IT', '#ff9a5c'); } q.st = 'free'; } return true; }
    const l = wantLamp(e, q);
    if (l) { if (once('acoRun')) number(e.x, e.y - 30, 'AN ACOLYTE RUNS FOR THE LAMP: CATCH HIM', '#ff9a5c');
      if (walk(e, px(l) - (Math.sign(px(l) - e.x) || 1) * 8, LC.acoV, dt)) { q.st = 'rite'; q.t = LC.acoRelightT; q.lamp = l; } return true; }
    if (dP < 72 && sameY) { const P = ctx.hero(); walk(e, e.x - (Math.sign(P.x - e.x) || 1) * 40, LC.acoV * 0.8, dt); return true; }   /* he keeps out of reach */
    if (Math.abs(e.x - q.home) > 6) walk(e, q.home, LC.acoV * 0.5, dt); else { e.vx = 0; e.mode = 'walk'; }
    return true; }

  /* ---------- THE GRATES: a dark room's dead come up (told: the grate glows cold first) ---------- */
  function stepGrates(dt) { const P = ctx.hero(); if (!P || P.dead) return; const ts = TS();
    for (const g of K.grates) { const r = roomOf(g.room); if (!r || r.lit || r.arena) { g.t = 0; g.glow = 0; continue; }
      const gx = g.x * ts + 8, gy = g.y * ts; if (Math.abs(P.x - gx) > LC.riseNear || Math.abs(P.y - gy) > 140) { g.t = Math.min(g.t, LC.riseEvery - LC.riseTell - 0.01); g.glow = 0; continue; }
      const up = ctx.enemies().filter(e => e.alive && e.lc && e.lc.role === 'dead' && e.lc.room === g.room && e.lcRisen).length; if (up >= LC.riseCap) { g.glow = 0; continue; }
      g.t += dt; g.glow = g.t > LC.riseEvery - LC.riseTell ? 1 : 0;
      if (g.t >= LC.riseEvery) { g.t = 0; g.glow = 0; const list = RISE[g.room] || ['wight', 'haunt'], kind = list[(K.n.risen + g.x) % list.length];
        const e = ctx.spawn(kind, g.x, g.y - 1); if (e) { e.lcRisen = g.room; e.lc = { role: 'dead', room: g.room, st: 'free', hp: e.hp }; K.n.risen++; ctx.burst(gx, gy - 6, 10, ['#9ab0e0', '#3a4a7a', '#e8f0ff'], 60, 0.6); ctx.sfx.hiss && ctx.sfx.hiss();
          if (once('rise')) number(gx, gy - 40, 'THE DARK LETS THE DEAD UP', '#ff6b6b'); } } } }

  /* ---------- THE ORGAN: a bellows' breath lifts you up its pipe; the key desk's chord blows west ---------- */
  function stepOrgan(dt) { const ts = TS();
    for (const b of K.bellows) { b.air = Math.max(0, b.air - dt); if (b.air <= 0) continue; const x0 = (b.x - 1) * ts - 6, x1 = (b.x + 2) * ts + 6, top = b.top * ts, bot = (b.y + 1) * ts + 2, mid = b.x * ts + 8, kk = ctx.keys();
      if (Math.random() < dt * 30) ctx.burst(x0 + Math.random() * (x1 - x0), bot - Math.random() * (bot - top), 1, ['#e8dcc0', '#c9b27c'], 20, 0.5);
      for (const pp of ctx.players) { if (pp.dead || pp.x < x0 || pp.x > x1 || pp.y < top - 4 || pp.y > bot) continue; if (pp.y > top + 18) { pp.vy = Math.min(pp.vy, -LC.lift); pp.ground = false; } else pp.vy = Math.min(pp.vy, 10);
        if (!kk.left && !kk.right) pp.vx += ((mid - pp.x) * 3 - pp.vx) * Math.min(1, dt * 6);   /* the breath holds you in its column until you steer off it */
        if (!pp.lcLift) { pp.lcLift = 1; K.n.lifts++; } } }
    for (const pp of ctx.players) if (pp.lcLift && !K.bellows.some(b => b.air > 0)) pp.lcLift = 0;
    for (const d of K.desks) { if (d.tell > 0) { d.tell -= dt; if (d.tell <= 0) d.on = LC.chordT; continue; } if (d.on <= 0) continue; d.on -= dt;
      const x0 = d.x0 * ts, x1 = (d.x1 + 1) * ts, y0 = d.y0 * ts, y1 = (d.y1 + 1) * ts;
      for (const pp of ctx.players) { if (pp.dead || pp.x < x0 || pp.x > x1 || pp.y < y0 || pp.y > y1 + 2) continue; const braced = pp.ground && (ctx.keys().down || ctx.keys().block);
        const want = d.dir * (pp.ground ? LC.gustGround : LC.gustAir) * (braced ? 0.4 : 1); pp.vx += (want - pp.vx) * Math.min(1, dt * (pp.ground ? 8 : 8)); pp.gustT = 0.25; if (!pp.lcGust) { pp.lcGust = 1; K.n.gusted++; } }
      for (const e of ctx.enemies()) if (e.alive && !e.maxHp && e.x > x0 && e.x < x1 && e.y > y0 && e.y < y1 + 2 && !e.noGrav) ctx.moveFoe(e, d.dir * 50 * dt);   /* it blows them west too: off the broken loft */
      if (d.on <= 0) for (const pp of ctx.players) pp.lcGust = 0; } }

  /* ---------- THE DARK RISES (the well, after lamp three) ---------- */
  function stepDark(dt) { const D = K.dark, ro = K.L.rooms.find(r => r.rises); if (!ro || D.st === 'idle' || D.st === 'done') return; const ts = TS(), P = ctx.hero();
    const inWell = P && !P.dead && P.x > (ro.x0 - 12) * ts && P.x < (ro.x1 + 12) * ts && P.y > (ro.rises.top) * ts && P.y <= ro.rises.floor * ts;
    if (D.st === 'armed') { if (inWell && P.y <= (ro.rises.floor - 2) * ts) { D.st = 'tell'; D.t = 1.4; number(P.x, P.y - 44, 'THE DARK RISES: CLIMB', '#ff6b6b'); ctx.sfx.roar && ctx.sfx.roar(); ctx.shake(3); } return; }
    if (D.st === 'tell') { D.t -= dt; if (D.t <= 0) D.st = 'rising'; return; }
    /* a LIT sconce just over the dark's top holds it there (it burns down holding it, then gutters out) */
    const holder = K.lamps.filter(l => l.room === ro.id && l.lit && l.hold > 0 && py(l) <= D.y + 2 && py(l) > D.y - 2.2 * ts).sort((a, b) => py(b) - py(a))[0];
    if (holder) { holder.hold -= dt; if (!holder.holdSaid) { holder.holdSaid = 1; K.n.darkHolds++; number(px(holder), py(holder) - 30, 'THE LIGHT HOLDS IT BELOW', '#8fd160'); }
      if (holder.hold <= 0) { snuff(holder, 'dark'); number(px(holder), py(holder) - 30, 'THE DARK SNUFFS IT', '#ff6b6b'); } }
    else D.y = Math.max(ro.rises.top * ts, D.y - LC.darkV * dt);
    /* IN THE DARK: it bites, it takes your flame, its dead come up at its edge */
    for (const pp of ctx.players) { if (pp.dead || pp.x < ro.x0 * ts - 200 || pp.x > (ro.x1 + 1) * ts + 200) continue; if (pp.y - 6 > D.y) { if (pp.lcFlame > 0) { pp.lcFlame = 0; K.n.flamesOut++; number(pp.x, pp.y - 36, 'THE DARK TAKES YOUR FLAME', '#ff6b6b'); }
        pp.lcDarkT = (pp.lcDarkT || 0) - dt; if (pp.lcDarkT <= 0) { pp.lcDarkT = LC.darkTick; K.n.darkBites++; ctx.asPlayer(pp, () => ctx.hurtHero(pp.x, 0, { unblockable: true, noKnock: true, name: 'THE DARK', pct: LC.darkPct })); } } }
    D.spawnT -= dt; if (D.spawnT <= 0 && P && !P.dead && inWell) { D.spawnT = LC.darkSpawn; const up = ctx.enemies().filter(e => e.alive && e.lcRisen === 'well').length;
      if (up < 3) { const tx = Math.floor((P.x + (Math.random() < 0.5 ? -40 : 40)) / ts), e = ctx.spawn('haunt', Math.max(ro.x0, Math.min(ro.x1, tx)), Math.floor(D.y / ts)); if (e) { e.lcRisen = 'well'; e.lc = { role: 'dead', room: 'well', st: 'free', hp: e.hp }; K.n.risen++; } } }
    /* OUT: on the crossing's floor - the dark fills the crypt behind you, and comes up through the nave's grates */
    if (P && !P.dead && P.y <= (ro.rises.top - 1) * ts + 2 && P.x > 150 * ts && P.x < 179 * ts) { D.st = 'done'; K.escaped = true; D.y = (ro.rises.top + 1) * ts;
      for (const l of K.lamps) if ((l.room === 'nave' || l.room === 'narthex') && l.lit) { l.lit = false; l.by = ''; }
      rooms(); number(P.x, P.y - 48, 'THE DARK COMES UP THE GRATES: THE NAVE IS DARK BEHIND YOU', '#ff6b6b'); ctx.shake(4); } }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!K) return; K.clock += dt; const ts = TS(), P0 = ctx.hero();
    if (!K.bound || K.boundN !== ctx.enemies().length) { bind(); K.bound = 1; K.boundN = ctx.enemies().length; for (const e of ctx.enemies()) if (e.lc && !e.maxHp0) e.maxHp0 = e.maxHp || e.hp; }
    for (const f of K.fx) f.t -= dt; K.fx = K.fx.filter(f => f.t > 0);
    /* THE FLAME burns down, and a blow that lands puts it out */
    for (const pp of ctx.players) { if (pp.lcFlame > 0) { pp.lcFlame = Math.max(0, pp.lcFlame - dt); if (pp.lcFlame <= 0) { K.n.flamesDied++; if (once('flameDied') || K.clock - (K.diedSaid || -9) > 6) { K.diedSaid = K.clock; ctx.number(pp.x, pp.y - 36, 'THE FLAME BURNS OUT', '#9aa39a'); } }
        else if (pp.hp < (pp.lcHp ?? pp.hp) - 0.01 || pp.dead) { pp.lcFlame = 0; K.n.flamesOut++; ctx.number(pp.x, pp.y - 36, 'THE BLOW PUTS YOUR FLAME OUT', '#ff9a5c'); } }
      pp.lcHp = pp.hp; }
    /* A BLADE THROUGH A LIT LAMP SNUFFS IT; A BLOW ON A BELLOWS MAKES ITS PIPE BREATHE */
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) return; const hb = ctx.attackBox(); if (!hb) return;
      for (const l of K.lamps) if (l.lit && ctx.overlap(hb, { l: px(l) - 7, r: px(l) + 7, t: py(l) - (l.kind === 'sconce' ? 26 : 34), b: py(l) - 6 })) snuff(l, 'hero');
      for (const b of K.bellows) if (b.air < LC.bellowsT - 0.4 && ctx.overlap(hb, { l: b.x * ts - 6, r: b.x * ts + 22, t: (b.y + 1) * ts - 16, b: (b.y + 1) * ts })) { b.air = LC.bellowsT; K.n.breaths++; ctx.sfx.whoosh ? ctx.sfx.whoosh() : ctx.sfx.thud && ctx.sfx.thud();
        if (once('breath')) number(b.x * ts + 8, (b.y + 1) * ts - 40, 'THE PIPE BREATHES: RIDE IT UP', '#ffd36b'); } });
    rooms(); stepOrgan(dt); stepGrates(dt); stepDark(dt);
    /* THE FIRST LOOK at a room: its name and its state, once */
    if (P0 && !P0.dead) { const r = roomAt(P0.x, P0.y); if (r && r !== K.inRoom) { K.inRoom = r; K.roomT = 2.2; } K.roomT = Math.max(0, (K.roomT || 0) - dt); }
    stall(P0, dt);
  };

  /* ---------- A PLAYER'S HANDS AT THE RULE'S LOCKS (tools/level-walk.mjs asks BK.walkHint(): where a player goes next and what he presses there) ----------
     { x, y, key: 'talk'|'atk'|null, face } in world px, or null. The walker fights and walks; it does not know a lamp wants a flame, so this says: take a flame at
     the fire nearest the lamp the route needs, carry it there, press E; strike the bellows and stand in its breath; play the chord and run west into it */
  H.walkHint = P => {
    if (!K || !P || P.dead) return null; const ts = TS(), c = P.x / ts, row = (P.y - 1) / ts, here = (x, r, key, face) => ({ x: x * ts + 8, y: (r + 1) * ts, key, face: face || 0 });
    const { nave: NF, gallery: GF, crypt: CF } = K.L.rows, TR = NF - 9;   /* TR: the north transept's floor (its feet row is TR - 1) */
    const want = (l, fireId) => { if (!l || l.lit) return null; if (P.lcFlame > 1) return here(l.x, l.y, 'talk', Math.sign(l.x * ts + 8 - P.x) || 1); const s = K.sources.find(q => q.id === fireId); return s ? here(s.x, s.y, 'talk', 1) : null; };
    if (c < 44 && row > NF - 16) return want(lampOf('porch'), 'brazier');
    if (row > TR - 2 && row < NF && c >= 150 && c <= 179 && !lampOf('chapel1').lit) return here(156, TR + 1, null, 1);   /* (up the piers) */
    if (row > GF && row < TR + 0.5 && c >= 158 && c <= 179) { if (!lampOf('chapel1').lit) return want(lampOf('chapel1'), 'votive1'); const b = K.bellows.find(q => q.id === 'transept'); return b.air > 0.3 ? Object.assign(here(b.x, b.y, null, 1), { lift: true }) : here(b.x - 1, b.y, 'atk', 1); }
    if (row < GF && c >= 56 && c <= 179) { const d = K.desks[0];
      if (c > 106) return d.on > 0.6 ? Object.assign(here(94, GF - 1, null, -1), { jump: c < 109, run: true }) : here(d.x, d.y, 'talk', -1);
      if (!lampOf('chapel2').lit) return want(lampOf('chapel2'), 'votive2'); return here(52, GF - 1, null, -1); }
    if (row > GF && row < GF + 5 && c < 56) { const s = lampOf('seal'); return s.lit ? here(s.x - 1, s.y, 'atk', 1) : here(47, s.y, null, -1); }
    if (row > NF && c < 179) { const l3 = lampOf('chapel3'); if (!l3.lit) return c > 140 ? want(l3, 'vigil') : null;
      if (!K.escaped) { /* THE RELAY UP THE WELL: on each landing, light its sconce with the flame you carry, or take a fresh one off it when yours is low (the top one always: the carry to the screen) */
        const here2 = K.lamps.find(l => l.room === 'well' && l.hold && Math.abs(py(l) - P.y) < 20 && Math.abs(px(l) - P.x) < 6 * ts); const top = here2 && here2.id === 'wellC';
        if (here2 && !here2.lit && P.lcFlame > 0) return here(here2.x, here2.y, 'talk', -1);
        if (here2 && here2.lit && P.lcFlame < (top ? 12 : 6)) return here(here2.x, here2.y, 'talk', -1);
        return null; } }
    if (row > TR && row < NF && c >= 150 && c <= 179 && !lampOf('rood3').lit) { const r3 = lampOf('rood3'); if (P.lcFlame > 0) return here(r3.x, NF - 1, 'talk', 1); return null; }
    return null; };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.church) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'lamp') { const l = lampOf(id); return l ? (l.lit ? 'lit' : 'dark') : ''; }
    if (kind === 'door') { const d = K.doors.find(q => q.id === id); return d ? (d.open ? 'open' : 'shut') : ''; }
    if (kind === 'flame') return ctx.hero() && ctx.hero().lcFlame > 0 ? 'held' : 'none';
    if (kind === 'stubs') return ctx.questGot() >= 5 && !(K.doors.find(q => q.id === 'reliquary') || {}).open ? 'due' : 'short';
    if (kind === 'need') { const l = lampOf(id); if (!l) return ''; return l.lit ? 'done' : ctx.hero() && ctx.hero().lcFlame > 0 ? 'lamp' : 'fire'; }
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('church', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- THE LIGHT IN THE DARK (main.js's dark pass: a hole for every lit lamp, every fire, the flame in your hand) ---------- */
  H.holes = (hole, cx, cy) => { if (!K) return; const vw = ctx.VW(), inX = x => x > cx - 120 && x < cx + vw + 120;
    for (const l of K.lamps) if (l.lit && inX(px(l))) hole(px(l) - cx, py(l) - (l.kind === 'sconce' || l.kind === 'rood' ? 18 : 26) - cy, l.kind === 'arena' ? 90 : l.kind === 'chapel' ? 96 : l.kind === 'sconce' || l.kind === 'rood' ? 56 : 84);
    for (const s of K.sources) if (inX(px(s))) hole(px(s) - cx, py(s) - 12 - cy, 64);
    for (const pp of ctx.players) if (pp.lcFlame > 0 && !pp.dead) hole(pp.x - cx, pp.y - 30 - cy, FLAME.glow * (0.6 + 0.4 * Math.min(1, pp.lcFlame / 4)));
    for (const b of K.bellows) if (b.air > 0 && inX(b.x * TS())) hole(b.x * TS() + 8 - cx, (b.y + 1) * TS() - 30 - cy, 30, 0.4); };

  /* ---------- DRAWING (GREYBOX: plain shapes until the art pass) ---------- */
  const R = Math.round;
  function drawLamp(g, l, cx, cy, time) { const x = R(px(l) - cx), y = R(py(l) - cy), f = 0.5 + 0.5 * Math.sin(time * 9 + l.x);
    if (l.kind === 'sconce' || l.kind === 'rood') { g.fillStyle = '#4a4458'; g.fillRect(x - 3, y - 18, 6, 3); g.fillRect(x - 1, y - 15, 2, 6); g.fillStyle = '#e8e0c8'; g.fillRect(x - 1, y - 22, 3, 4); }
    else if (l.kind === 'chapel') { g.fillStyle = '#5a4a3a'; g.fillRect(x - 9, y - 10, 18, 10); g.fillStyle = '#c9a050'; g.fillRect(x - 6, y - 22, 12, 4); g.fillRect(x - 1, y - 18, 3, 8); g.fillStyle = '#e8d0a0'; g.fillRect(x - 10, y - 11, 20, 1); }
    else if (l.kind === 'seal') { g.fillStyle = '#6a6a8a'; g.fillRect(x - 1, y - 28, 2, 26); g.fillStyle = '#a8a8c8'; g.fillRect(x - 5, y - 30, 10, 3); }
    else { g.fillStyle = '#5a5060'; g.fillRect(x - 1, y - 26, 3, 26); g.fillRect(x - 5, y - 1, 11, 1); g.fillStyle = '#8a7a5a'; g.fillRect(x - 5, y - 30, 11, 4); }
    const top = l.kind === 'sconce' || l.kind === 'rood' ? y - 24 : l.kind === 'chapel' ? y - 26 : l.kind === 'seal' ? y - 34 : y - 34;
    if (l.lit) { const big = l.kind === 'chapel' ? 1.5 : 1; g.globalAlpha = 0.25 + 0.1 * f; g.fillStyle = l.kind === 'seal' ? '#d8e0ff' : '#ffd36b'; g.beginPath(); g.arc(x, top, 9 * big, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      g.fillStyle = l.kind === 'seal' ? '#e8f0ff' : '#ff9a3c'; g.fillRect(x - 1, top - 3 - R(f * 2), 3, 5); g.fillStyle = '#fff6c8'; g.fillRect(x, top - 1 - R(f), 1, 3); }
    else { g.fillStyle = '#2a2a34'; g.fillRect(x - 1, top - 1, 3, 2); if (Math.random() < 0.02) ctx.burst(px(l), py(l) + (top - y) - 2, 1, ['#6a6a7a'], 10, 0.8); }
    if (l.kind === 'rood' && !l.lit) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 4); g.strokeStyle = '#ffd36b'; g.strokeRect(x - 3, y - 25, 7, 8); g.globalAlpha = 1; }
    if (l.hold && l.lit && K.dark.st === 'rising' && l.holdSaid) { const k = Math.max(0, l.hold / LC.holdT); g.fillStyle = '#1b1626'; g.fillRect(x - 8, y - 30, 16, 2); g.fillStyle = '#ffd36b'; g.fillRect(x - 8, y - 30, R(16 * k), 2); } }
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), inX = (x, m = 60) => x > cx - m && x < cx + vw + m;
    /* THE DOORS: the west door's bars, the hatch's bars of light (the seal), the crossing's grate, the rood screen's door, the reliquary's and the sacristy's */
    for (const d of K.doors) { if (d.open || !inX(d.x0 * ts, 80)) continue; const x0 = R(d.x0 * ts - cx), y0 = R(d.y0 * ts - cy), w = (d.x1 - d.x0 + 1) * ts, h = (d.y1 - d.y0 + 1) * ts;
      if (d.id === 'hatch') { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 3); g.fillStyle = '#d8e0ff'; for (let x = x0 + 2; x < x0 + w; x += 5) g.fillRect(x, y0, 2, h); g.globalAlpha = 1; }
      else { g.fillStyle = d.id === 'rood' ? '#5a4a3a' : '#3a3440'; g.fillRect(x0, y0, w, h); g.fillStyle = d.id === 'rood' ? '#8a6a3a' : '#6a6478'; for (let x = x0 + 2; x < x0 + w; x += 4) g.fillRect(x, y0, 1, h); g.fillRect(x0, y0, w, 1); g.fillRect(x0, y0 + R(h / 2), w, 1); } }
    /* THE GRATES: iron bars in the floor; a dark room's glows cold before its dead come up */
    for (const q of K.grates) { if (!inX(q.x * ts)) continue; const x = R(q.x * ts - cx), y = R(q.y * ts - cy); g.fillStyle = '#1a1820'; g.fillRect(x + 1, y - 1, 14, 3); g.fillStyle = '#5a5668'; for (let i = 0; i < 4; i++) g.fillRect(x + 2 + i * 4, y - 1, 1, 3);
      if (q.glow > 0) { g.globalAlpha = 0.4 + 0.4 * Math.sin(time * 14); g.fillStyle = '#9ab0e0'; g.fillRect(x, y - 6, 16, 6); g.globalAlpha = 1; } }
    /* THE FIRES (sources): the brazier, the votive stands, the vigil candle */
    for (const s of K.sources) { if (!inX(px(s))) continue; const x = R(px(s) - cx), y = R(py(s) - cy), f = Math.sin(time * 11 + s.x);
      if (s.kind === 'brazier') { g.fillStyle = '#3a3036'; g.fillRect(x - 6, y - 8, 12, 8); g.fillRect(x - 1, y - 12, 2, 4); g.fillStyle = '#ff6b2c'; g.fillRect(x - 5, y - 14 - R(f), 10, 6); g.fillStyle = '#ffd36b'; g.fillRect(x - 3, y - 16 - R(f), 6, 4); }
      else { g.fillStyle = '#4a3a2a'; g.fillRect(x - 7, y - 10, 14, 10); g.fillStyle = '#e8e0c8'; for (let i = -5; i <= 5; i += 3) g.fillRect(x + i, y - 14, 2, 4); g.fillStyle = '#ffd36b'; for (let i = -5; i <= 5; i += 3) g.fillRect(x + i, y - 17 - R(Math.abs(Math.sin(time * 9 + i)) * 1.5), 2, 3); } }
    for (const l of K.lamps) if (inX(px(l))) drawLamp(g, l, cx, cy, time);
    /* THE BELLOWS: a leather bellows on its frame and a gauge; breathing, it heaves */
    for (const b of K.bellows) { if (!inX(b.x * ts)) continue; const x = R(b.x * ts + 8 - cx), y = R((b.y + 1) * ts - cy), k = b.air > 0 ? Math.abs(Math.sin(time * 10)) : 0;
      g.fillStyle = '#5a3a2a'; g.fillRect(x - 9, y - 8 + R(k * 2), 18, 8 - R(k * 2)); g.fillStyle = '#7a5a3a'; g.fillRect(x - 9, y - 10 + R(k * 3), 18, 2); g.fillStyle = '#3a3036'; g.fillRect(x - 10, y - 1, 20, 1);
      if (b.air > 0) { g.globalAlpha = 0.18; g.fillStyle = '#e8dcc0'; g.fillRect(R((b.x - 1) * ts - cx), R(b.top * ts - cy), ts * 3, y - R(b.top * ts - cy)); g.globalAlpha = 1;
        g.fillStyle = '#1b1626'; g.fillRect(x - 9, y - 16, 18, 2); g.fillStyle = '#e8dcc0'; g.fillRect(x - 9, y - 16, R(18 * b.air / LC.bellowsT), 2); } }
    /* THE KEY DESK and its gust: a told wheeze (dust gathering at the pipes), then the gust's streaks west */
    for (const d of K.desks) { if (!inX(d.x * ts, 300)) continue; const x = R(d.x * ts + 8 - cx), y = R((d.y + 1) * ts - cy);
      g.fillStyle = '#4a3a2a'; g.fillRect(x - 8, y - 12, 16, 12); g.fillStyle = '#e8e0c8'; g.fillRect(x - 7, y - 13, 14, 2); g.fillStyle = '#1a1820'; for (let i = -6; i < 7; i += 2) g.fillRect(x + i, y - 13, 1, 1);
      if (d.tell > 0 || d.on > 0) { const y0 = d.y0 * ts, y1 = (d.y1 + 1) * ts; g.globalAlpha = d.tell > 0 ? 0.35 : 0.6; g.fillStyle = '#e8dcc0';
        for (let i = 0; i < 26; i++) { const sx = ((i * 97 + time * (d.on > 0 ? 420 : 60) * -d.dir) % ((d.x1 - d.x0 + 1) * ts) + (d.x1 - d.x0 + 1) * ts) % ((d.x1 - d.x0 + 1) * ts) + d.x0 * ts, sy = y0 + ((i * 53) % (y1 - y0)); g.fillRect(R(sx - cx), R(sy - cy), d.on > 0 ? 10 : 3, 1); }
        g.globalAlpha = 1; ctx.text(d.tell > 0 ? 'THE PIPES DRAW BREATH' : 'THE GUST', x, y - 24, d.tell > 0 ? '#ffd36b' : '#e8dcc0', 'center', 5); } }
    /* THE RELIQUARY's door: a stub count on it */
    for (const d of K.doors) if (d.id === 'reliquary' && !d.open && inX(d.x0 * ts)) ctx.text(Math.min(5, ctx.questGot()) + '/5', R(d.x0 * ts + 8 - cx), R(d.y0 * ts - 8 - cy), '#ffe9a8', 'center', 5);
    /* THE CLERGY's tells: a priest's rite and prayer glow gold over him; asleep, a Z; a priest's light pip by his room (lit gold, dark grey) */
    for (const e of ctx.enemies()) { if (!e.alive || !e.lc || !inX(e.x)) continue; const x = R(e.x - cx), y = R(e.y - cy), q = e.lc;
      if (q.st === 'asleep') ctx.text('Z', x + 6 + R(Math.sin(time * 2 + e.x) * 2), y - 26 - R((time * 8) % 8), '#c8d8e8', 'center', 6);
      else if (q.st === 'rite' || q.st === 'heal') { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 12); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 14, q.st === 'heal' ? 16 : 10, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      if (q.role === 'priest') { g.fillStyle = lit(q.room) ? '#ffd36b' : '#5a5a6a'; g.fillRect(x - 1, y - (e.h || 22) - 6, 3, 3); }
      if (q.role === 'acolyte') { g.fillStyle = '#e8e0c8'; g.fillRect(x + (e.face || 1) * 5, y - 16, 1, 6); g.fillStyle = '#ffd36b'; g.fillRect(x + (e.face || 1) * 5, y - 18, 1, 2); } }
    if (K.glint && K.glint.show) drawGlint(g, R(K.glint.x - cx), R(K.glint.y - 18 - cy), vw, ctx.VH(), time);
  };
  /* OVER EVERYTHING: the rising dark, and the flame in your hand */
  H.drawOver = (g, cx, cy, time) => { if (!K) return; const ts = TS(), D = K.dark, ro = K.L.rooms.find(r => r.rises);
    if (ro && (D.st === 'rising' || D.st === 'tell'))   /* (once you are out it sinks back into the crypt's own dark: a respawn at the altar is not a black room) */ { const alt = K.L.rooms.find(r => r.id === 'altar') || ro, x0 = R(alt.x0 * ts - cx), x1 = R((alt.x1 + 1) * ts - cx), top = R(D.y - cy), bot = R((ro.rises.floor + 1) * ts - cy);
      if (bot > 0 && top < ctx.VH()) { g.globalAlpha = 0.82; g.fillStyle = '#0a0612'; g.fillRect(x0, top, x1 - x0, bot - top); g.globalAlpha = 0.6; g.fillStyle = '#3a2a5a';
        for (let x = x0; x < x1; x += 4) g.fillRect(x, top - 2 + R(Math.sin(time * 3 + x * 0.2) * 2), 4, 3); g.globalAlpha = 1; } }
    for (const pp of ctx.players) { if (!(pp.lcFlame > 0) || pp.dead) continue; const x = R(pp.x - cx), y = R(pp.y - 30 - cy), k = Math.min(1, pp.lcFlame / FLAME.life), f = Math.sin(time * 13);
      g.fillStyle = '#e8e0c8'; g.fillRect(x + 6, y + 2, 2, R(2 + 8 * k)); g.fillStyle = pp.lcFlame < 3 && Math.floor(time * 8) % 2 ? '#ff6b2c' : '#ff9a3c'; g.fillRect(x + 6, y - 2 - R(f), 2, 4); g.fillStyle = '#fff6c8'; g.fillRect(x + 6, y - 1 - R(f), 1, 2);
      g.fillStyle = '#1b1626'; g.fillRect(x - 8, y - 8, 16, 2); g.fillStyle = '#ffd36b'; g.fillRect(x - 8, y - 8, R(16 * k), 2); } };
  /* THE HUD: the room you are in, LIT or DARK, as you come into it (and the flame's seconds) */
  H.drawHud = (g, P) => { if (!K || !K.inRoom || !(K.roomT > 0) || K.inRoom.arena) return false; const r = K.inRoom, a = Math.min(1, K.roomT);
    g.globalAlpha = a; ctx.text(r.name + (r.lit ? ': LIT' : ': DARK'), R(ctx.VW() / 2), 30, r.lit ? '#ffd36b' : '#9ab0c0', 'center', 6); g.globalAlpha = 1; return false; };
  H.read = () => K && { n: { ...K.n }, lamps: Object.fromEntries(K.lamps.map(l => [l.id, l.lit])), rooms: Object.fromEntries(K.rooms.map(r => [r.id, r.lit])), doors: Object.fromEntries(K.doors.map(d => [d.id, d.open])),
    dark: { st: K.dark.st, y: R(K.dark.y / 16) }, escaped: K.escaped, flame: ctx.hero() ? +(ctx.hero().lcFlame || 0).toFixed(1) : 0, glint: K.glint && K.glint.key, lastNudge: K.lastNudge || null,
    foes: ctx.enemies().filter(e => e.alive && e.lc).map(e => ({ t: e.cnSkin || e.t, role: e.lc.role, st: e.lc.st, room: e.lc.room, x: R(e.x / 16), y: R(e.y / 16) })) };
  return H;
}
