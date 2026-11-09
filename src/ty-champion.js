/* src/ty-champion.js - THE CHAMPION, THE TOURNEY's boss (claude/tourney, the OPUS GREYBOX; brief section 2, Daniel Q3 = A). THE FIGHT, PURE: no canvas, no page,
   no main.js. src/ty-champion-hands.js binds it to the world (the heroes he hits, the squire, the rival knights, the horse he takes from you) and draws it;
   tools/tourney.mjs fights it. (Boss id 'tychampion': 'champion' is THE ADMIRAL'S CHAMPION's.)
   Undefeated in the lists three summers running: plate, a gold-bossed shield, a barded charger. His fight is TIMING ON HORSEBACK - not THE CRUSADER's parry window.
   THE ARENA: the lists, west to east; his pavilion at the east end, where his SQUIRE keeps the spare lances.
   P1 MOUNTED JOUST (100% -> 50%): you ride too (src/tourney-hands.js: the arena's ride is two-way). Pass after pass down the lists:
     THE PASS        he wheels, then charges; at CT.joust.drop px his lance drops (told 0.7 s at a gallop: '!!', the GOLD BOSS on his shield glints)
                     CROSS HIM WITH YOUR LANCE COUCHED, at pace, meeting him = CLEAN: his lance SHATTERS -> LANCELESS (open x2) until his squire brings another.
                     Cross him uncouched = his hit (22, a knock); with your guard up = a glance (11).
     THE FEINT       from the third pass his lance drops late (CT.joust.feint px): hold the couch too early and your arm tires before you meet
     LANCE SWEEP     close to him while he wheels: told 0.55 s, a sweep (16, blockable)
     THE SQUIRE      runs a new lance out of the pavilion; strike him (a blow or the lance) and he drops it and runs - the next one comes CT.squire.again s later.
                     The opening ends when he is armed again, or at CT.open.max s (he rides to the pavilion for it himself - not an opening)
     UNHORSED        the third shattered lance - or a clean pass with him at the P1 floor - puts him over his horse's tail: OPEN x2 for CT.unhorse.open s. -> P2
   P2 UNHORSED, ON FOOT (50% -> 0): your horse is led off; flail and shield.
     FLAIL SWING     told 0.6 s, 18, blockable              OVERHEAD   told 0.9 s ('!!'), 26, unblockable - a whiff and the flail is MIRED: OPEN x2 for 1.3 s
     SHIELD RUSH     told 0.7 s, a rush across the lists, 16 + a knock, blockable
     A RIVAL         the herald's horn (told 1.0 s): one rival knight at a time walks out of the pavilion
     HIS SHIELD      a blow from in front of him outside an opening is x0.45; from behind him, x1 (he turns quickly)
   B15: x0.45 outside an opening, x2 in one (capped at CT.openCap of his health per opening); never untouchable. P1 cannot go under 50% (the floor holds;
   the next clean pass unhorses him). Every move: its own windup pose, its own release pose, its own sound (POSE / SOUND, src/ty-champion-hands.js). */

export const TC = {
  hp: 2800, w: 26, h: 34, footW: 14, footH: 30, markH: 50,
  resist: 0.45, behind: 1, openMul: 2, openCap: 0.14, floorP1: 0.5,
  joust: { speed: 240, drop: 170, feint: 92, feintFrom: 2, cross: 22, minPace: 110, dmg: 22, glance: 11, knock: 220, end: 44, wheel: 0.8, wake: 1.4 },
  swipe: { tell: 0.55, act: 0.2, reach: 44, dmg: 16, cd: 2.0 },
  open: { max: 9, slow: 600 },
  squire: { speed: 150, delay: 0.5, again: 2.5, arm: 0.6, w: 8, h: 14 },
  unhorse: { open: 2.5, shatters: 3, rise: 0.6 },
  foot: { speed: 54 },
  flail: { tell: 0.6, act: 0.2, reach: 44, dmg: 18, cd: 1.3 },
  over: { tell: 0.9, act: 0.25, reach: 48, dmg: 26, mired: 1.3, recover: 0.5, every: 3 },
  rush: { tell: 0.7, act: 0.6, speed: 260, dmg: 16, knock: 240, lo: 70, hi: 220, cd: 4.5, recover: 0.5 },
  horn: { tell: 1.0, every: 20, first: 6 },
};
const OPEN_MODES = new Set(['lanceless', 'unhorsed', 'mired']);
export const tcOpen = e => !!e && OPEN_MODES.has(e.mode) && e.modeT > 0;
export const OPEN_NAME = { lanceless: 'LANCELESS', unhorsed: 'UNHORSED', mired: 'MIRED' };

/* THE ARENA'S GEOMETRY from the built level (src/tourney.js) */
export function geom(L, TS = 16) { const A = L.arena; return { x0: A.x0, x1: A.x1, floorY: A.floor, pav: A.pavilion, rivalX: A.rivalX * TS + 8, TS }; }
export function newFight(G) {
  return { G, ph: 1, passes: 0, shatters: 0, crossed: new Set(), squire: null, openDealt: 0, openT: 0, k: 0, cd: { swipe: 1.0, flail: 0.8, over: 0, rush: 2.5, horn: TC.horn.first },
    told: {}, rivals: 0, n: { passes: 0, clean: 0, hits: 0, glances: 0, feints: 0, swipes: 0, squires: 0, squireStops: 0, opens: 0, openHits: 0, coatHits: 0, backHits: 0, flails: 0, overs: 0, mired: 0, rushes: 0, horns: 0, fetches: 0 },
    hurt: {}, won: false };
}
const near = (heroes, x) => heroes.filter(h => h.alive).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; e.modeT0 = t; };
const clampX = (S, x) => Math.max(S.G.x0 + 14, Math.min(S.G.x1 - 14, x));

/* A BLOW ON HIM: [damage, word]. fromX: where the blow came from (his shield faces e.face) */
export function takeBlow(e, S, dmg, fromX) {
  let d, word = null;
  if (tcOpen(e)) { const cap = TC.openCap * e.maxHp, room = cap - S.openDealt; d = dmg * TC.openMul <= room ? dmg * TC.openMul : Math.max(dmg * TC.resist, room); S.openDealt = Math.min(cap, S.openDealt + d); S.n.openHits++; }
  else if (S.ph === 2 && fromX !== undefined && Math.sign(fromX - e.x) === -(e.face || 1) && !/Tell$/.test(e.mode)) { d = dmg * TC.behind; S.n.backHits++; }   /* behind his shield: a full blow */
  else { d = dmg * TC.resist; word = 'SHIELD'; S.n.coatHits++; }
  if (S.ph === 1 && e.hp - d < e.maxHp * TC.floorP1) { d = Math.max(0, e.hp - e.maxHp * TC.floorP1); if (!S.told.holds) { S.told.holds = 1; word = 'HOLDS'; } }
  return [Math.round(d * 100) / 100, word];
}
/* the squire struck (a hero's blow or lance on him): he drops the lance and runs */
export function stopSquire(e, S, W) {
  const q = S.squire; if (!q || q.st !== 'run') return false;
  q.st = 'fled'; S.n.squireStops++; W.sound('squireDrop'); W.say && W.say('squireStop', q.x, S.G.floorY); q.t = TC.squire.again; return true;
}
function begin(e, S, W) { setMode(e, 'wheel', TC.joust.wheel); }
/* ONE STEP. heroes: [{ x, y, alive, ground, ducking, blocking, mounted, couched, pace, pp, id }]. W: the world (src/ty-champion-hands.js, or the test's fake) */
export function step(e, S, dt, heroes, W) {
  if (!e.alive) return;
  for (const k in S.cd) S.cd[k] = Math.max(0, S.cd[k] - dt);
  e.modeT -= dt;
  stepSquire(e, S, dt, W);
  const tgt = near(heroes, e.x);
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': e.vx = 0; if (e.modeT <= 0) begin(e, S, W); return;
  }
  return S.ph === 1 ? stepP1(e, S, dt, heroes, tgt, W) : stepP2(e, S, dt, heroes, tgt, W);
}
/* ---------------- P1: THE JOUST ---------------- */
function stepP1(e, S, dt, heroes, tgt, W) {
  switch (e.mode) {
    case 'wheel': { e.vx += (0 - e.vx) * Math.min(1, dt * 6); e.x = clampX(S, e.x + e.vx * dt);
      /* a hero close while he wheels: the sweep */
      if (tgt && S.cd.swipe <= 0 && Math.abs(tgt.x - e.x) < TC.swipe.reach && e.lance) { e.face = Math.sign(tgt.x - e.x) || e.face; setMode(e, 'swipeTell', TC.swipe.tell); W.sound('swipeTell'); W.mark && W.mark('!', e); return; }
      if (e.modeT <= 0) { const atW = e.x < S.G.x0 + TC.joust.end * 2, atE = e.x > S.G.x1 - TC.joust.end * 2;
        e.face = atW ? 1 : atE ? -1 : (tgt ? Math.sign(tgt.x - e.x) || e.face : e.face);
        if (!e.lance) { setMode(e, 'fetch', 6); S.n.fetches++; return; }
        S.passes++; S.n.passes++; S.crossed = new Set(); e.lanceDown = false; e.feint = S.passes > TC.joust.feintFrom; if (e.feint) S.n.feints++;
        setMode(e, 'pass', 8); W.sound('charge'); }
      return; }
    case 'swipeTell': e.vx *= 0.9; if (e.modeT <= 0) { setMode(e, 'swipe', TC.swipe.act); W.sound('swipe'); S.n.swipes++;
        for (const h of heroes) if (h.alive && Math.sign(h.x - e.x) === e.face && Math.abs(h.x - e.x) < TC.swipe.reach && Math.abs(h.y - e.y) < 34) W.hitHero(h, TC.swipe.dmg, 'swipe', 'sw' + S.n.swipes, { blockable: true }); }
      return;
    case 'swipe': if (e.modeT <= 0) { S.cd.swipe = TC.swipe.cd; setMode(e, 'wheel', 0.4); } return;
    case 'pass': { e.vx += (e.face * TC.joust.speed - e.vx) * Math.min(1, dt * 4); e.x = clampX(S, e.x + e.vx * dt);
      /* the lance drops at its distance from the nearest hero ahead (a feint: late) */
      const ahead = heroes.filter(h => h.alive && Math.sign(h.x - e.x) === e.face).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
      if (!e.lanceDown && ahead && Math.abs(ahead.x - e.x) <= (e.feint ? TC.joust.feint : TC.joust.drop)) { e.lanceDown = true; W.sound(e.feint ? 'feint' : 'drop'); W.mark && W.mark('!!', e); W.say && W.say(e.feint ? 'feint' : 'lance', e.x, e.y); }
      /* THE CROSSING: once per hero per pass */
      for (const h of heroes) { if (!h.alive || S.crossed.has(h.id)) continue; const dx = h.x - e.x;
        if (Math.abs(dx) > TC.joust.cross || Math.abs(h.y - e.y) > 30 || (dx !== 0 && Math.sign(dx) !== e.face)) continue; S.crossed.add(h.id);   /* (a hero behind him is not met: only one in front of his lance) */
        const meets = h.mounted && h.couched && Math.abs(h.pace) >= TC.joust.minPace && Math.sign(h.pace) === -e.face;
        if (meets) { clean(e, S, h, W); return; }
        if (e.lanceDown) { if (h.blocking && Math.sign(dx) === e.face) { S.n.glances++; W.hitHero(h, TC.joust.glance, 'glance', 'gl' + S.passes + ':' + h.id, { blockable: false }); W.say && W.say('glance', h.x, h.y); }
          else { S.n.hits++; W.hitHero(h, TC.joust.dmg, 'joust', 'js' + S.passes + ':' + h.id, { knock: e.face * TC.joust.knock }); } } }
      if ((e.face > 0 && e.x >= S.G.x1 - TC.joust.end) || (e.face < 0 && e.x <= S.G.x0 + TC.joust.end) || e.modeT <= 0) { e.lanceDown = false; setMode(e, 'wheel', TC.joust.wheel); }
      return; }
    case 'lanceless': { e.vx += (0 - e.vx) * Math.min(1, dt * 3); e.x = clampX(S, e.x + e.vx * dt); S.openT += dt; if (tgt) e.face = Math.sign(tgt.x - e.x) || e.face;
      if (S.openT >= TC.open.max) { setMode(e, 'fetch', 6); S.n.fetches++; S.squire = null; return; }   /* he will not wait: he rides for the pavilion himself (not an opening) */
      if (e.modeT <= 0) setMode(e, 'lanceless', 0.5);   /* (held open while the squire runs: an opening is measured by S.openT, capped at TC.open.max) */
      return; }
    case 'arm': e.vx = 0; if (e.modeT <= 0) { e.lance = true; setMode(e, 'wheel', TC.joust.wheel); W.say && W.say('armed', e.x, e.y); } return;
    case 'fetch': { const dx = S.G.pav - e.x; e.face = Math.sign(dx) || 1; e.vx = e.face * TC.joust.speed * 0.7; e.x = clampX(S, e.x + e.vx * dt);
      if (Math.abs(dx) < 20 || e.modeT <= 0) { e.vx = 0; setMode(e, 'arm', TC.squire.arm); } return; }
    case 'unhorsed': e.vx *= 0.9; e.x = clampX(S, e.x + e.vx * dt); if (e.modeT <= 0) { setMode(e, 'rise', TC.unhorse.rise); W.sound('rise'); } return;
    case 'rise': if (e.modeT <= 0) { S.ph = 2; e.phase = 2; setMode(e, 'walk', 0.4); W.music && W.music(2); W.say && W.say('foot', e.x, e.y); } return;
    default: setMode(e, 'wheel', 0.3);
  }
}
/* A CLEAN HIT: his lance shatters (and the lance's blow lands); the third, or one at the floor, unhorses him */
function clean(e, S, h, W) {
  S.n.clean++; S.shatters++; e.lance = false; e.lanceDown = false; S.openDealt = 0; S.openT = 0; S.n.opens++;
  W.sound('shatter'); W.shake && W.shake(6); W.say && W.say('clean', e.x, e.y);
  const unhorse = S.shatters >= TC.unhorse.shatters || e.hp <= e.maxHp * TC.floorP1 + 0.5;
  if (unhorse) { setMode(e, 'unhorsed', TC.unhorse.open); e.vx = -e.face * 60; W.sound('unhorse'); W.say && W.say('unhorsed', e.x, e.y); W.dismount && W.dismount(); S.squire = null; }
  else { setMode(e, 'lanceless', 0.5); S.squire = { x: S.G.pav, st: 'wait', t: TC.squire.delay }; S.n.squires++; W.say && W.say('squire', S.G.pav, S.G.floorY); }
  W.lanceHit && W.lanceHit(e, h);   /* the couched lance's own blow (it is the opening's first) */
}
function stepSquire(e, S, dt, W) {
  const q = S.squire; if (!q) return;
  q.t -= dt;
  if (q.st === 'wait' && q.t <= 0) { q.st = 'run'; W.sound('squire'); }
  else if (q.st === 'run') { const dx = e.x - q.x; q.x += Math.sign(dx) * Math.min(Math.abs(dx), TC.squire.speed * dt); q.face = Math.sign(dx) || -1;
    if (Math.abs(dx) < 14 && e.mode === 'lanceless') { q.st = 'back'; setMode(e, 'arm', TC.squire.arm); S.openT = 0; W.sound('arm'); } }
  else if (q.st === 'fled') { q.x += TC.squire.speed * 1.3 * dt * (Math.sign(S.G.pav - q.x) || 1); if (q.t <= 0) { S.squire = { x: S.G.pav, st: 'run', t: 0 }; S.n.squires++; W.say && W.say('squire', S.G.pav, S.G.floorY); } }
  else if (q.st === 'back') { q.x += TC.squire.speed * dt * (Math.sign(S.G.pav - q.x) || 1); if (Math.abs(S.G.pav - q.x) < 10) S.squire = null; }
}
/* ---------------- P2: ON FOOT ---------------- */
function stepP2(e, S, dt, heroes, tgt, W) {
  const m = e.mode;
  if (m === 'mired' || m === 'recover') { e.vx = 0; if (e.modeT <= 0) setMode(e, 'walk', 0.3); return; }
  if (m === 'rush') { e.x = clampX(S, e.x + e.face * TC.rush.speed * dt);
    for (const h of heroes) if (h.alive && Math.abs(h.x - e.x) < 18 && Math.abs(h.y - e.y) < 30) W.hitHero(h, TC.rush.dmg, 'rush', 'ru' + S.n.rushes, { blockable: true, knock: e.face * TC.rush.knock });
    if (e.modeT <= 0 || e.x <= S.G.x0 + 16 || e.x >= S.G.x1 - 16) { S.cd.rush = TC.rush.cd; setMode(e, 'recover', TC.rush.recover); } return; }
  if (m === 'flail') { if (e.modeT <= 0) { S.cd.flail = TC.flail.cd; setMode(e, 'walk', 0.3); } return; }
  if (m === 'over') { if (e.modeT <= 0) setMode(e, e.overHit ? 'recover' : 'mired', e.overHit ? TC.over.recover : TC.over.mired); if (e.mode === 'mired') { S.n.mired++; S.openDealt = 0; S.n.opens++; W.sound('mired'); W.say && W.say('mired', e.x, e.y); } return; }
  if (m === 'horn') { if (e.modeT <= 0) setMode(e, 'walk', 0.3); return; }
  if (/Tell$/.test(m)) { if (e.modeT > 0) return;
    switch (m) {
      case 'flailTell': setMode(e, 'flail', TC.flail.act); W.sound('flail'); S.n.flails++; S.k++;
        for (const h of heroes) if (h.alive && Math.sign(h.x - e.x) === e.face && Math.abs(h.x - e.x) < TC.flail.reach && Math.abs(h.y - e.y) < 30) W.hitHero(h, TC.flail.dmg, 'flail', 'fl' + S.n.flails, { blockable: true }); return;
      case 'overTell': setMode(e, 'over', TC.over.act); W.sound('over'); S.n.overs++; S.k++; e.overHit = false;
        for (const h of heroes) if (h.alive && Math.sign(h.x - e.x) === e.face && Math.abs(h.x - e.x) < TC.over.reach && Math.abs(h.y - e.y) < 34) { e.overHit = true; W.hitHero(h, TC.over.dmg, 'over', 'ov' + S.n.overs, { blockable: false, knock: e.face * 160 }); }
        W.shake && W.shake(5); return;
      case 'rushTell': setMode(e, 'rush', TC.rush.act); W.sound('rush'); S.n.rushes++; S.k++; return;
      case 'hornTell': setMode(e, 'horn', 0.4); S.n.horns++; S.cd.horn = TC.horn.every; W.callRival && W.callRival(S.G.rivalX); return;
    } }
  /* walking: he turns to the nearest hero (quickly - his shield follows you) and closes */
  if (!tgt) { e.vx = 0; return; }
  const dx = tgt.x - e.x, ad = Math.abs(dx); e.face = Math.sign(dx) || e.face;
  if (S.cd.horn <= 0 && !(W.rivalsAlive && W.rivalsAlive() > 0)) { setMode(e, 'hornTell', TC.horn.tell); W.sound('horn'); W.say && W.say('horn', e.x, e.y); W.mark && W.mark('!', e); return; }
  if (ad < TC.over.reach - 4 && S.cd.flail <= 0 && S.k % TC.over.every === TC.over.every - 1) { setMode(e, 'overTell', TC.over.tell); W.sound('overTell'); W.mark && W.mark('!!', e); return; }
  if (ad < TC.flail.reach - 4 && S.cd.flail <= 0) { setMode(e, 'flailTell', TC.flail.tell); W.sound('flailTell'); W.mark && W.mark('!', e); return; }
  if (ad > TC.rush.lo && ad < TC.rush.hi && S.cd.rush <= 0) { setMode(e, 'rushTell', TC.rush.tell); W.sound('rushTell'); W.mark && W.mark('!', e); return; }
  e.vx = ad > 28 ? e.face * TC.foot.speed : 0; e.x = clampX(S, e.x + e.vx * dt);
  if (e.mode !== 'walk') setMode(e, 'walk', 0.3);
}
