/* src/headmistress.js - THE HEADMISTRESS'S FINAL EXAM, THE MAGE ACADEMY's boss (claude/academy, the OPUS GREYBOX; brief-academy-1016.md: "the boss must USE ALL
   THE LESSONS"). THE FIGHT, PURE: no canvas, no page, no main.js. src/headmistress-hands.js binds it to the world (the lecterns, the cantrips through
   src/academy-hands.js, her ward rail, the dissolving floor, the hurt) and draws it; tools/academy.mjs fights it.
   THE ARENA: THE EXAMINATION - a hall under a low ceiling, two high galleries under the rafters, three lecterns on the floor (LEVITATION / BLINK / CONJURE STEP).
   THE RULE OF THE FIGHT (B14): SHE MARKS ONLY WHAT USES THE LESSON. One lectern lights a phase; read it (touch: the cantrip). A blow that uses the lesson
     stamps CORRECT and she STAGGERS - OPEN x2 for HM.open s (capped HM.openCap of her per opening). Any other blow: x0.4 and a told 'SHOW YOUR WORK' clank.
   P1 LEVITATION (100% -> 70%): she lectures from the RAFTERS, out of a jump's reach, a ring of SHIELD BOOKS round her (a blow through one pops it; they come back).
     CHALK RAIN    told 0.9 s (her chalk raised, red !!): three chalk circles under and beside each hero, then the sigils drop down the column - move off
     THE RULER     told 0.6 s (the ruler drawn back, yellow !): a swat at a hero beside her - blockable
     CORRECT: a blow landed while FLOATING (or from a gallery you floated to), with no more than HM.shield.pass shield books left: she drops to the floor, open.
   P2 BLINK (70% -> 45%): on the floor behind a WARD RAIL of light on the side she faces (floor to ceiling: feet stop at it, a blink passes it).
     CHALK BOLT    told 0.7 s (yellow !): a bolt down her facing side at chest height, through the rail - block it or jump it
     ABOUT FACE    told 0.8 s (she turns her head first): every HM.about.every s, or when someone has stood behind her HM.about.behind s - the rail turns with her
     THE RULER     at her back, told, blockable - lingering behind her is answered
     CORRECT: a blow on her BACK within HM.blinkWindow s of a blink THROUGH a rail.
   P3 CONJURE STEP (45% -> 20%): THE FLOOR IS DISMISSED in told stages (it flickers HM.crumble.tell s, then it is the void; the side ledges stay); she floats at her
     desk over the pit. The pit files a hero back to a ledge (16, spare).
     DISPEL        told 1.0 s (her hand opens, red !!): every conjured step vanishes - jump before it lands, conjure again after
     CHALK RAIN    as P1
     CORRECT: a blow from a conjured step (or just off one).
   FINALE (20% -> 0): rapid calls - 'LEVITATE!' / 'BLINK!' / 'CONJURE!' - she takes that lesson's station (the rafters / the floor behind a rail / over a pit) and
     its lectern lights; answer it: a short opening (HM.fin.open s, capped HM.fin.cap). Unanswered in HM.fin.wait s, she calls the next. Chalk rain between.
   B15: x0.4 outside an opening (every phase, the bell between phases, the calls), x2 in one (capped); never untouchable. A phase cannot pass its floor until
   the move in hand ends. Every move: its own windup pose, release pose, sound (POSE, src/headmistress-hands.js). */

export const HM = {
  hp: 2800, w: 14, h: 30, markH: 46, speed: 60,
  resist: 0.4, openMul: 2, open: 3.0, openCap: 0.12, floors: [0.7, 0.45, 0.2],
  bell: 1.6, blinkWindow: 1.5,
  shield: { n: 4, orbit: 30, regrow: 9, pass: 2 },
  chalk: { tell: 0.9, fall: 0.35, n: 3, spread: 44, w: 12, dmg: 20, cd: 5.5, cdP3: 7, cdFin: 6.5 },
  ruler: { tell: 0.6, act: 0.2, reach: 40, dmg: 22, dmgBack: 24, cd: 2.2 },
  bolt: { tell: 0.7, speed: 230, h: 16, dmg: 22, cd: 3.4 },
  about: { tell: 0.8, every: 5.5, behind: 1.2, railDx: 30 },
  crumble: { tell: 1.5, next: 9 },
  dispel: { tell: 1.0, cd: 6.5 },
  fin: { tell: 1.2, glide: 0.9, wait: 7, open: 1.8, cap: 0.06 },
};
export const LESSON = { 1: 'levitate', 2: 'blink', 3: 'conjure' };
const OPEN_MODES = new Set(['stagger']);
export const hmOpen = e => !!e && OPEN_MODES.has(e.mode) && e.modeT > 0;
export const OPEN_NAME = { stagger: 'CORRECT' };
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; e.modeT0 = t; };

/* THE ARENA'S GEOMETRY from the built level (src/academy.js) */
export function geom(L, TS = 16) {
  const A = L.arena; return { x0: A.x0, x1: A.x1, floorY: A.floor, rafterY: A.rafterY, deskY: A.deskY, ceil: A.ceil, galleries: A.galleries.map(g => g.slice()), pit: A.pit.map(p => p.slice()), ledges: A.ledges.map(l => l.slice()), TS,
    mid: (A.x0 + A.x1) / 2 };
}
export function newFight(G) {
  return { G, ph: 1, lesson: 'levitate', openDealt: 0, opens: 0, cap: HM.openCap, sigils: [], bolts: [], books: [], booksT: 0, pitStage: 0, crumbleT: 0, call: null, callT: 0, calls: 0, lastCall: null, behindT: 0, aboutT: HM.about.every,
    cd: { chalk: 2.0, ruler: 1.0, bolt: 1.5, dispel: 4.0 }, told: {},
    n: { chalks: 0, rulers: 0, bolts: 0, abouts: 0, dispels: 0, crumbles: 0, calls: 0, correct: 0, opens: 0, openHits: 0, work: 0, popped: 0, answered: { levitate: 0, blink: 0, conjure: 0 } }, hurt: {}, won: false };
}
const near = (heroes, x) => heroes.filter(h => h.alive).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
const books = S => S.books.filter(b => !b.dead).length;
export const shieldLeft = books;
const station = (S, lesson) => lesson === 'levitate' ? { x: S.G.mid + (S.calls % 2 ? -1 : 1) * 160, y: S.G.rafterY } : lesson === 'blink' ? { x: S.G.mid + (S.calls % 2 ? 1 : -1) * 60, y: S.G.floorY } : { x: S.G.mid, y: S.G.deskY };

/* IS THIS BLOW AN ANSWER? (the hands ask the cantrips; a test asks a fake) - used: { floated, railBlink, onStep, back } of the striking hero */
export function correct(e, S, used) {
  if (!used) return false; const L = S.ph === 4 ? S.call : S.lesson; if (!L || used.spell !== L) return false;
  if (L === 'levitate') return !!used.floated && (S.ph === 4 || books(S) <= HM.shield.pass);
  if (L === 'blink') return !!used.railBlink && !!used.back;
  if (L === 'conjure') return !!used.onStep;
  return false;
}
/* A BLOW ON HER: [damage, word]. Open x2 (capped per opening), x0.4 otherwise; a CORRECT blow opens her (and lands x2 itself); a phase holds at its floor */
export function takeBlow(e, S, dmg, used, W) {
  let d, word = null;
  if (!hmOpen(e) && !/^(bell|callTell|wake|recover|stagger|glide|crumbleTell)$/.test(e.mode) && correct(e, S, used)) open(e, S, W);   /* (no answer while she is between questions: the bell, a call, her recovery) */
  if (hmOpen(e)) { const cap = S.cap * e.maxHp, room = cap - S.openDealt; d = dmg * HM.openMul <= room ? dmg * HM.openMul : Math.max(dmg * HM.resist, room); S.openDealt = Math.min(cap, S.openDealt + d); S.n.openHits++; }
  else { d = dmg * HM.resist; word = 'WORK'; S.n.work++; }
  const fl = S.ph <= 3 ? HM.floors[S.ph - 1] : 0;
  if (fl > 0 && e.hp - d < e.maxHp * fl) {   /* (claude/nightwalk) only a real floor: at floor 0 (her last phase) the clamp took d = e.hp, rounded it to 2 decimals and left hp at +1e-13 - alive, and every later blow clamped to 0.00: an IMMORTAL Headmistress (seen: 400 blows, hp 1.1e-13) */ d = Math.max(0, e.hp - e.maxHp * fl); if (!S.told['holds' + S.ph]) { S.told['holds' + S.ph] = 1; word = 'HOLDS'; } }
  return [Math.round(d * 100) / 100, word];
}
function open(e, S, W) {
  const fin = S.ph === 4, L = fin ? S.call : S.lesson; S.n.correct++; S.n.opens++; S.opens++; S.openDealt = 0; S.cap = fin ? HM.fin.cap : HM.openCap; S.n.answered[L]++;
  S.sigils = []; S.bolts = [];
  W && W.sound && W.sound('correct'); W && W.say && W.say('correct', e.x, e.y); W && W.fx && W.fx('open', e.x, e.y);
  setMode(e, 'stagger', fin ? HM.fin.open : HM.open); e.fallY = L === 'levitate' && !fin ? S.G.floorY : e.y;
  if (fin) { S.call = null; S.callT = 0; W && W.light && W.light(null); }
}
/* a SHIELD BOOK struck */
export function popBook(S, i, W) { const b = S.books[i]; if (!b || b.dead) return false; b.dead = true; S.n.popped++; W && W.sound && W.sound('pop'); W && W.say && W.say('shield', b.x, b.y); return true; }

/* ONE STEP. heroes: [{ x, y, alive, ground, pp, id }]. W: the world (src/headmistress-hands.js, or the test's fake) */
export function step(e, S, dt, heroes, W) {
  if (!e.alive) return;
  for (const k in S.cd) S.cd[k] = Math.max(0, S.cd[k] - dt);
  e.modeT -= dt;
  stepSigils(S, dt, heroes, W); stepBolts(S, dt, heroes, W); stepBooks(e, S, dt);
  if (S.ph === 3 && S.pitStage === 1 && e.mode !== 'crumbleTell') { S.crumbleT -= dt; if (S.crumbleT <= 0 && !/Tell$/.test(e.mode) && e.mode !== 'stagger' && e.mode !== 'bell' && e.mode !== 'recover') { setMode(e, 'crumbleTell', HM.crumble.tell); W.crumbleTell && W.crumbleTell(2); W.sound('crumbleTell'); W.mark && W.mark('!!', e); return; } }
  const tgt = near(heroes, e.x);
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': if (e.modeT <= 0) beginPhase(e, S, 1, W); return;
    case 'bell': if (e.modeT <= 0) beginPhase(e, S, S.ph + 1, W); return;
    case 'stagger': if (e.fallY !== undefined) e.y += (e.fallY - e.y) * Math.min(1, dt * 6); if (e.modeT <= 0) { setMode(e, 'recover', 0.6); W.sound('recover'); if (S.ph === 1) { for (const b of S.books) b.dead = false; } } return;
    case 'recover': { const P = home(e, S); e.x += (P.x - e.x) * Math.min(1, dt * 4); e.y += (P.y - e.y) * Math.min(1, dt * 4); if (e.modeT <= 0) { e.y = P.y; setMode(e, 'lecture', 0.3); if (S.ph === 4) nextCall(e, S, W); } return; }
    case 'glide': { const k = 1 - Math.max(0, e.modeT) / HM.fin.glide; e.x = e.gx0 + (e.gx1 - e.gx0) * k; e.y = e.gy0 + (e.gy1 - e.gy0) * k; if (e.modeT <= 0) { e.x = e.gx1; e.y = e.gy1; setMode(e, 'lecture', 0.2); W.arrive && W.arrive(S.call, e); } return; }
    case 'crumbleTell': if (e.modeT <= 0) { const stg = S.pitStage + 1; S.pitStage = stg; S.n.crumbles++; W.crumble && W.crumble(stg); W.sound('crumble'); W.say && W.say('crumble', e.x, e.y); S.crumbleT = HM.crumble.next; setMode(e, 'lecture', 0.3); } return;
  }
  if (/Tell$|^chalk$|^ruler$|^bolt$|^about$|^dispel$/.test(e.mode)) { if (e.modeT <= 0) stepMove(e, S, dt, heroes, W, tgt); return; }
  /* A PHASE AT ITS FLOOR, once the move in hand is done: the bell, then the next lesson */
  if (S.ph <= 3 && e.hp <= e.maxHp * HM.floors[S.ph - 1] + 0.01) { setMode(e, 'bell', HM.bell); S.sigils = []; S.bolts = []; W.sound('bell'); W.endPhase && W.endPhase(S.ph); return; }
  return think(e, S, dt, heroes, tgt, W);
}
const home = (e, S) => S.ph === 1 ? { x: e.x, y: S.G.rafterY } : S.ph === 2 ? { x: e.x, y: S.G.floorY } : S.ph === 3 ? { x: e.x, y: S.G.deskY } : station(S, S.lastCall || 'blink');
function beginPhase(e, S, ph, W) {
  S.ph = ph; e.phase = ph; S.openDealt = 0; S.cd.chalk = 2.5;
  if (ph <= 3) { S.lesson = LESSON[ph]; W.light && W.light(S.lesson); W.say && W.say('p' + ph, e.x, e.y); }
  if (ph === 1) { e.y = S.G.rafterY; S.books = Array.from({ length: HM.shield.n }, (_, i) => ({ a: i * Math.PI * 2 / HM.shield.n, x: e.x, y: e.y, dead: false })); }
  if (ph === 2) { S.books = []; e.y = S.G.floorY; e.x = S.G.mid; e.face = -1; S.aboutT = HM.about.every; W.rail && W.rail(e.x + e.face * HM.about.railDx); }
  if (ph === 3) { W.rail && W.rail(null); e.y = S.G.deskY; e.x = S.G.mid; setMode(e, 'crumbleTell', HM.crumble.tell); W.crumbleTell && W.crumbleTell(1); W.sound('crumbleTell'); W.mark && W.mark('!!', e); return; }
  if (ph === 4) { S.lesson = null; W.say && W.say('fin', e.x, e.y); W.restoreFloor && W.restoreFloor(); S.pitStage = 0; nextCall(e, S, W); return; }
  setMode(e, 'lecture', 0.4);
}
/* THE FINALE: she calls the next lesson (never the same twice running), lights its lectern and takes its station */
function nextCall(e, S, W) {
  const opts = ['levitate', 'blink', 'conjure'].filter(l => l !== S.lastCall), L = opts[(S.calls * 7 + 3) % opts.length];
  S.call = L; S.lastCall = L; S.calls++; S.n.calls++; S.callT = 0; W.rail && W.rail(null); W.restoreFloor && W.restoreFloor();
  setMode(e, 'callTell', HM.fin.tell); W.light && W.light(L); W.sound('callTell'); W.say && W.say('call:' + L, e.x, e.y); W.mark && W.mark('!!', e);
}
function think(e, S, dt, heroes, tgt, W) {
  if (!tgt) return;
  const dx = tgt.x - e.x, ad = Math.abs(dx);
  if (S.ph === 4) { S.callT += dt; if (S.callT >= HM.fin.wait && e.mode === 'lecture') { nextCall(e, S, W); return; } }
  /* where she keeps herself */
  if (S.ph === 1) { e.x += Math.sign(dx) * Math.min(ad, HM.speed * 0.6 * dt); e.x = Math.max(S.G.x0 + 40, Math.min(S.G.x1 - 40, e.x)); e.y = S.G.rafterY; e.face = Math.sign(dx) || e.face; }
  if (S.ph === 2) { S.aboutT -= dt; const behind = heroes.some(h => h.alive && Math.sign(h.x - e.x) === -e.face && Math.abs(h.x - e.x) < 120); S.behindT = behind ? S.behindT + dt : 0;
    if (behind && S.behindT > 0.8 && S.cd.ruler <= 0 && heroes.some(h => h.alive && Math.sign(h.x - e.x) === -e.face && Math.abs(h.x - e.x) < HM.ruler.reach)) { e.swatDir = -e.face; setMode(e, 'rulerTell', HM.ruler.tell); W.sound('rulerTell'); W.mark && W.mark('!', e); return; }
    if (S.aboutT <= 0 || S.behindT >= HM.about.behind + 0.8) { setMode(e, 'aboutTell', HM.about.tell); W.sound('aboutTell'); W.mark && W.mark('!', e); return; } }
  if (S.ph === 3) { e.x += Math.sign(dx) * Math.min(ad, HM.speed * 0.4 * dt); e.x = Math.max(S.G.pit[0][0] * S.G.TS + 24, Math.min((S.G.pit[0][1] + 1) * S.G.TS - 24, e.x)); e.y = S.G.deskY; e.face = Math.sign(dx) || e.face;
    if (S.cd.dispel <= 0) { setMode(e, 'dispelTell', HM.dispel.tell); W.sound('dispelTell'); W.mark && W.mark('!!', e); return; } }
  if (S.ph === 1 || S.ph === 3 || S.ph === 4) { if (ad < HM.ruler.reach && Math.abs(tgt.y - e.y) < 30 && S.cd.ruler <= 0) { e.swatDir = Math.sign(dx) || e.face; e.face = e.swatDir; setMode(e, 'rulerTell', HM.ruler.tell); W.sound('rulerTell'); W.mark && W.mark('!', e); return; } }
  if (S.ph === 2 && S.cd.bolt <= 0 && heroes.some(h => h.alive && Math.sign(h.x - e.x) === e.face)) { setMode(e, 'boltTell', HM.bolt.tell); W.sound('boltTell'); W.mark && W.mark('!', e); return; }
  if (S.cd.chalk <= 0) { setMode(e, 'chalkTell', HM.chalk.tell); W.sound('chalkTell'); W.mark && W.mark('!!', e);
    for (const h of heroes) if (h.alive) for (let i = 0; i < HM.chalk.n; i++) S.sigils.push({ x: h.x + (i - (HM.chalk.n - 1) / 2) * HM.chalk.spread, t: HM.chalk.tell + HM.chalk.fall, key: 'ch' + (S.n.chalks + 1) + ':' + h.id + ':' + i });
    return; }
  if (e.mode !== 'lecture') setMode(e, 'lecture', 0.3);
}
/* a move in hand: its windup runs out, it lands */
function stepMove(e, S, dt, heroes, W, tgt) {
  if (e.modeT > 0) return;
  const back = () => setMode(e, 'lecture', 0.3);
  switch (e.mode) {
    case 'chalkTell': setMode(e, 'chalk', 0.35); W.sound('chalk'); S.n.chalks++; return;
    case 'chalk': S.cd.chalk = S.ph === 3 ? HM.chalk.cdP3 : S.ph === 4 ? HM.chalk.cdFin : HM.chalk.cd; back(); return;
    case 'rulerTell': setMode(e, 'ruler', HM.ruler.act); W.sound('ruler'); S.n.rulers++; const dir = e.swatDir || e.face;
      for (const h of heroes) if (h.alive && Math.sign(h.x - e.x) === dir && Math.abs(h.x - e.x) < HM.ruler.reach + 6 && Math.abs(h.y - e.y) < 34) W.hitHero(h, S.ph === 2 ? HM.ruler.dmgBack : HM.ruler.dmg, 'ruler', 'rl' + S.n.rulers + ':' + h.id, { blockable: true }); return;
    case 'ruler': S.cd.ruler = HM.ruler.cd; back(); return;
    case 'boltTell': setMode(e, 'bolt', 0.3); W.sound('bolt'); S.n.bolts++; S.bolts.push({ x: e.x + e.face * 12, y: e.y - HM.bolt.h, dir: e.face, key: 'bt' + S.n.bolts }); return;
    case 'bolt': S.cd.bolt = HM.bolt.cd; back(); return;
    case 'aboutTell': setMode(e, 'about', 0.25); e.face = -e.face; S.n.abouts++; S.aboutT = HM.about.every; S.behindT = 0; W.sound('about'); W.rail && W.rail(e.x + e.face * HM.about.railDx); return;
    case 'about': back(); return;
    case 'dispelTell': setMode(e, 'dispel', 0.3); W.sound('dispel'); S.n.dispels++; W.dispel && W.dispel(); W.say && W.say('dispel', e.x, e.y); return;
    case 'dispel': S.cd.dispel = HM.dispel.cd; back(); return;
    case 'callTell': { const P = station(S, S.call); e.gx0 = e.x; e.gy0 = e.y; e.gx1 = P.x; e.gy1 = P.y; e.face = P.x < S.G.mid ? 1 : -1; setMode(e, 'glide', HM.fin.glide); W.sound('glide'); return; }
  }
}
function stepSigils(S, dt, heroes, W) {
  for (const s of S.sigils) { const was = s.t; s.t -= dt;
    if (was > 0.05 && s.t <= 0.05) for (const h of heroes) if (h.alive && Math.abs(h.x - s.x) < HM.chalk.w && h.y > S.G.ceil && h.y <= S.G.floorY + 4) W.hitHero(h, HM.chalk.dmg, 'chalk', s.key + ':' + h.id, {}); }
  S.sigils = S.sigils.filter(s => s.t > 0);
}
function stepBolts(S, dt, heroes, W) {
  for (const b of S.bolts) { b.x += b.dir * HM.bolt.speed * dt;
    for (const h of heroes) if (h.alive && Math.abs(h.x - b.x) < 8 && Math.abs((h.y - 10) - b.y) < 10) W.hitHero(h, HM.bolt.dmg, 'bolt', b.key + ':' + h.id, { blockable: true }); }
  S.bolts = S.bolts.filter(b => b.x >= S.G.x0 - 8 && b.x <= S.G.x1 + 8);
}
function stepBooks(e, S, dt) { if (S.ph !== 1) return; S.booksT += dt;
  if (S.booksT >= HM.shield.regrow) { S.booksT = 0; for (const b of S.books) b.dead = false; }
  for (const b of S.books) { b.a += dt * 1.4; b.x = e.x + Math.cos(b.a) * HM.shield.orbit; b.y = e.y - 14 + Math.sin(b.a) * HM.shield.orbit * 0.7; } }
