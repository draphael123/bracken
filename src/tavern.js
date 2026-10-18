// src/tavern.js - THE TAVERN (claude/tavern, CO-OP PHASE 2; Daniel 10-12, scratch brief-tavern.md + brief-onlinecoop.md 'ADDED 10-03').
// WAYMEET'S CROSSROADS INN: one warm room - the fireplace, the long tables and their drinkers, the bar, a window onto the road - that is co-op's home.
// Up to four players (local pads and online guests mixed) meet here, dress, practise together and take the road. It is open from the start.
//
// THE STATIONS, west to east (a player walks up and presses INTERACT - E/T, UP on a pad, the touch USE button):
//   DOOR          the way in and out. Players WALK IN through it as they join (a pad's JUMP or START anywhere in the room; an online guest when he has
//                 picked his hero). P1 at the door: OUT TO THE MAP (the party comes too). Anyone else: LEAVE THE PARTY.
//   INVITE BOARD  the online room: HOST A GAME / JOIN A FRIEND (src/online.js's board); while a room is open its CODE is chalked on the board.
//   CAMPAIGN TABLE  the map table: TAKE THE ROAD - the party, as it stands in the room, goes to the map armed for the next wood.
//   WARDROBE      that player's own card: HERO, WEAPON (a weapon skin), COLOUR (his ring, tag and plate) and RING (the floor ring on/off, for everyone).
//   TRAINING YARD the back of the room: straw dummies; the PARTNER DRILLS board (THROW into the hay target, REVIVE off the sparring bell, TEAM HIT on
//                 one dummy) with a chalk tally; the PRACTICE door (the game's Practice yards live here now).
//   ARENA PIT     roped off, signed COMING SOON (versus is a later lane, brief-versus.md).
// FIRST VISIT: every station glints (a sparkle and a bobbing mark) until it has been used once (PROG.tavern.seen), and the first time a player comes
// near one a line says what it does. NOTHING HERE HURTS OR ENDS: no death cost, a down clock that runs out just stands you up.
//
// main.js owns the bodies, the room's load and the screens; this module owns the stations: makeTavern(api) -> { on, layout, tick, hands, draw,
// drawHud, dummyHit, thrown, revived, debug }. The greybox furniture is drawn here with plain fills (ART list: TAVERN_ART below).
import { DRILLS, DRILL_IDS, TEAM_WINDOW, cleanTavern, COLOURS, stepColour, colourOf } from './party.js';

/* THE ROOM, in tiles (src/level.js theTavern paints it from this): floor top at row FLOOR, everything stands on row FLOOR - 1 */
export const ROOM = { W: 68, H: 26, FLOOR: 20, CEIL: 12, wallL: 1, wallR: 66 };
export const STATIONS = [
  { id: 'door', x: 3, name: 'THE DOOR', verb: 'LEAVE', first: 'THE DOOR: FRIENDS WALK IN HERE. P1 TAKES THE PARTY OUT TO THE MAP.' },
  { id: 'board', x: 7, name: 'THE INVITE BOARD', verb: 'INVITE', first: 'THE INVITE BOARD: HOST AN ONLINE ROOM AND CHALK ITS CODE UP, OR JOIN A FRIEND\'S.' },
  { id: 'table', x: 36, name: 'THE CAMPAIGN TABLE', verb: 'THE ROAD', first: 'THE CAMPAIGN TABLE: TAKE THE ROAD TOGETHER - THE WHOLE PARTY GOES TO THE MAP.' },
  { id: 'wardrobe', x: 40, name: 'THE WARDROBE', verb: 'DRESS', first: 'THE WARDROBE: YOUR HERO, YOUR WEAPON, YOUR COLOUR AND THE FLOOR RINGS.' },
  { id: 'drills', x: 45, name: 'PARTNER DRILLS', verb: 'DRILLS', first: 'PARTNER DRILLS: THROW YOUR PARTNER INTO THE HAY, LIFT HIM OFF THE BELL, STRIKE A DUMMY TOGETHER.' },
  { id: 'bell', x: 48, name: 'THE SPARRING BELL', verb: 'RING', first: 'THE SPARRING BELL: RING IT AND A PARTNER GOES DOWN - STAND ON HIM TO LIFT HIM.' },
  { id: 'practice', x: 58, name: 'THE PRACTICE YARDS', verb: 'PRACTICE', first: 'THE PRACTICE YARDS: THE HERO TRIALS AND THE OPEN YARD, THROUGH THIS DOOR.' },
  { id: 'arena', x: 62, name: 'THE ARENA PIT', verb: 'ARENA', first: 'THE ARENA PIT: FRIENDS AGAINST FRIENDS. COMING SOON.' },
];
export const DUMMIES = [51, 54];   /* the straw men, in tiles */
export const TARGET = { x: 56, r: 22 };   /* the hay target on the yard floor: its centre (tile) and how near (px) a thrown partner lands for a BULLSEYE */
export const START = { x: 5, y: 19 };     /* where P1 stands up, just inside the door */
export const REACH = { x: 18, y: 22 };    /* px: how near a player stands to use a station */
export const WALK_IN = { from: 1.6, t: 0.9, speed: 52 };   /* a joiner appears in the doorway (tile x) and walks in this long */
export const DOWN_T_TAVERN = 12;          /* s: a sparring-bell down in the tavern (the woods' is 20); it runs out to ON YOUR FEET, never a death */

/* THE ART THE SONNET ART LANE PAINTS (the greybox draws each as plain fills; tools/tavern.mjs holds this list to the stations) */
export const TAVERN_ART = [
  ['tiles', 'inn floorboards (worn oak, a hearth-stone patch before the fire), the plastered back wall with timber framing, the beamed ceiling, the yard\'s packed-sand floor and its open back wall'],
  ['door', 'the inn door in the west wall: oak with iron straps, a lamp over it, swung open while somebody walks in (2 frames: shut / open), the road and a signpost seen through it'],
  ['board', 'THE INVITE BOARD: a cork-and-timber notice board with pinned bills and a chalk slate for the four-letter room code (blank / chalked)'],
  ['table', 'THE CAMPAIGN TABLE: a heavy map table with the world map spread on it, pins and a candle; the party standing round it reads as planning'],
  ['wardrobe', 'THE WARDROBE: a tall painted cupboard, doors open on hanging cloaks and a weapon rack, a standing mirror beside it'],
  ['drills', 'THE DRILLS BOARD: a chalkboard with three drawn drills (THROW, REVIVE, TEAM HIT) and tally marks'],
  ['bell', 'THE SPARRING BELL: a small brass bell on a post with a pull rope (rest / swinging frames)'],
  ['dummies', 'two tavern straw dummies (sack heads, a dented pot helm) - the training yard\'s own, not the open yard\'s'],
  ['target', 'THE HAY TARGET: a ring of hay bales on the yard floor with a painted bullseye'],
  ['practice', 'THE PRACTICE DOOR: an arched yard gate with the practice yards\' light behind it'],
  ['arena', 'THE ARENA PIT: a sunken sanded pit behind a rope on posts, a COMING SOON board and a stage board beside it (empty frame for the VERSUS lane)'],
  ['dressing', 'the warm room: the fireplace (lit, a cauldron), long tables with benches and Waymeet\'s drinkers, the bar with casks and the barkeep, a window onto the road (day/night), hanging lanterns, a hearth glow light'],
  ['glint', 'the first-visit glint (a 4-frame sparkle) and the bobbing ! over an unused station'],
  ['rings', 'the floor ring under each hero (an ellipse in his colour, 2 frames of shimmer) and the name tag plate (P1..P4)'],
];

export function makeTavern(api) {
  const st = { cardFor: new Map(), near: new Map(), saidFirst: new Set(), fly: new Set(), teamLast: new Map(), msgs: [], bellT: 0, doorT: 0, stats: { joins: 0, leaves: 0, uses: {}, team: 0, bulls: 0, revives: 0, bells: 0 } };
  const on = () => !!api.L() && !!api.L().tavern;
  const TS = api.TS;
  const sx = s => s.x * TS + TS / 2, floorY = () => (ROOM.FLOOR) * TS;
  const tav = () => { const P = api.PROG(), c = cleanTavern(P.tavern); if (!P.tavern || JSON.stringify(c) !== JSON.stringify(P.tavern)) P.tavern = c; return P.tavern; };   /* (kept the same object while it is already whole) */
  const seen = id => !!tav().seen[id];
  const markSeen = id => { const t = tav(); if (!t.seen[id]) { t.seen[id] = 1; api.save(); } };
  const say = (p, msg, col = '#ffd36b') => api.number(p.x, p.y - 34, msg, col);

  /* the nearest station a player can use, or null */
  function stationNear(p) {
    if (!p || p.dead || p.down > 0 || !p.ground) return null;
    let best = null, bd = 1e9;
    for (const s of STATIONS) { const d = Math.abs(sx(s) - p.x); if (d < REACH.x && Math.abs(p.y - floorY()) < REACH.y && d < bd) { bd = d; best = s; } }
    return best;
  }
  /* the key a player presses, for the prompt */
  const keyFor = p => (p.n === 1 ? api.p1Key() : p.src && p.src.kind === 'online' ? 'E' : 'UP');

  function use(s, p) {
    st.stats.uses[s.id] = (st.stats.uses[s.id] || 0) + 1;
    const wasNew = !seen(s.id); markSeen(s.id);
    if (s.id === 'door') { if (p.n === 1) api.toMap(); else { api.leave(p); st.stats.leaves++; } return; }
    if (s.id === 'board') { api.openOnline(); return; }
    if (s.id === 'table') { api.takeRoad(); return; }
    if (s.id === 'wardrobe') { st.cardFor.set(p, { row: 0 }); api.sfx('uiSel'); return; }
    if (s.id === 'drills') { api.hint(DRILL_IDS.map(k => DRILLS[k].name + ': ' + DRILLS[k].line).join('.  '), 7); return; }
    if (s.id === 'bell') { ringBell(p); return; }
    if (s.id === 'practice') { api.practice(); return; }
    if (s.id === 'arena') { say(p, 'COMING SOON', '#ff9a5c'); api.hint('THE ARENA PIT IS ROPED OFF: FRIENDS AGAINST FRIENDS IS COMING SOON.', 4); api.sfx('ui'); if (wasNew) api.sfx('sting'); return; }
  }
  /* THE SPARRING BELL: a partner goes DOWN (the nearest other upright player); alone, it says it wants a partner */
  function ringBell(p) {
    st.bellT = 0.8; api.sfx('bell');
    const others = api.players().filter(q => q !== p && !q.dead && !(q.down > 0));
    if (!others.length) { say(p, 'IT WANTS A PARTNER', '#9aa39a'); api.hint('THE BELL KNOCKS A PARTNER DOWN FOR THE REVIVE DRILL. A FRIEND JOINS ON A PAD (JUMP) OR ONLINE (THE BOARD).', 5); return; }
    others.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
    api.down(others[0]); st.stats.bells++;
    api.hint('REVIVE DRILL: STAND ON ' + api.tagOf(others[0]) + ' TO LIFT HIM.', 4);
  }

  /* ===== a player's hands while his wardrobe card is up: called in his own pass, before his update; true = the card ate his keys ===== */
  const ROWS = ['HERO', 'WEAPON', 'COLOUR', 'RING'];
  function hands(p, pr, keys) {
    const c = st.cardFor.get(p); if (!c) return false;
    if (!on() || p.dead || p.down > 0 || p.ptH || p.ptF || Math.abs(p.x - sx(STATIONS.find(s => s.id === 'wardrobe'))) > REACH.x * 2) { st.cardFor.delete(p); return false; }   /* knocked down, lifted, thrown or pulled away: the card goes */
    if (pr.down) { c.row = (c.row + 1) % ROWS.length; api.sfx('ui'); }
    if (pr.up) { c.row = (c.row + ROWS.length - 1) % ROWS.length; api.sfx('ui'); }
    const dir = pr.left ? -1 : pr.right ? 1 : 0;
    if (dir) change(p, ROWS[c.row], dir);
    if (pr.talk || pr.atk || pr.dodge) { st.cardFor.delete(p); api.sfx('menuClose'); }
    for (const k in pr) pr[k] = false;
    for (const k of ['left', 'right', 'up', 'down', 'jump', 'atk', 'dodge', 'block', 'throw']) keys[k] = false;
    return true;
  }
  function change(p, row, dir) {
    if (row === 'HERO') { const list = api.heroesFor(p); if (!list.length) return; const i = list.indexOf(p.hero); const h = list[(i + dir + list.length) % list.length]; api.setHero(p, h); api.sfx('equip'); }
    else if (row === 'WEAPON') { const list = api.weapons(); if (!list.length) return; const cur = api.weaponOf(p); const i = Math.max(0, list.indexOf(cur)); api.setWeapon(p, list[(i + dir + list.length) % list.length]); api.sfx('equip'); }
    else if (row === 'COLOUR') { const t = tav(); const taken = api.players().filter(q => q !== p).map(q => t.colours[(q.n - 1) % 4]); t.colours[(p.n - 1) % 4] = stepColour(t.colours[(p.n - 1) % 4], dir, taken); api.save(); api.sfx('ui'); }
    else if (row === 'RING') { const t = tav(); t.ring = !t.ring; api.save(); api.sfx('ui'); }
  }

  /* ===== once a frame, after the passes ===== */
  function tick(dt) {
    if (!on()) { st.cardFor.clear(); return; }
    st.bellT = Math.max(0, st.bellT - dt); st.doorT = Math.max(0, st.doorT - dt);
    for (const p of api.players()) {
      const s = stationNear(p); st.near.set(p, s);
      if (s && !st.saidFirst.has(s.id) && !seen(s.id)) { st.saidFirst.add(s.id); api.hint(s.first, 5); }
      const pr = p.n === 1 ? api.p1Press() : p.press || {};
      if (s && pr.talk && !st.cardFor.has(p)) { if (p.n === 1) api.eatTalk(); else pr.talk = false; use(s, p); }
      /* THE THROW DRILL: a partner who was flying (src/partner-throw.js ptF) and has landed - where? */
      if (p.ptF) st.fly.add(p); else if (st.fly.has(p)) { st.fly.delete(p); thrown(p, p.x); }
      /* the walk-in: a joiner is walked in from the doorway by the room, not by his own keys */
      if (p.walkIn > 0) { p.walkIn = Math.max(0, p.walkIn - dt); }
    }
    for (const [p] of st.cardFor) if (!api.players().includes(p)) st.cardFor.delete(p);
  }
  /* a joiner's keys while he walks in: the room holds RIGHT for him (he is in the doorway) */
  function walking(p, keys) {
    if (!(p.walkIn > 0)) { if (p.walkHeld) { p.walkHeld = false; keys.right = false; } return false; }   /* (and lets go of RIGHT after: his own hands only write a key that CHANGES) */
    for (const k in keys) keys[k] = false; keys.right = true; p.walkHeld = true; return true;
  }

  /* ===== the drills ===== */
  function dummyHit(e, p) {
    if (!on() || !p) return;
    const last = st.teamLast.get(e), now = api.time();
    if (last && last.p !== p && now - last.t <= TEAM_WINDOW && !last.paid) { last.paid = true; drill('team', p, e.x, e.y - 30, 'TEAM HIT'); }
    st.teamLast.set(e, { p, t: now, paid: false });
  }
  function thrown(victim, x) {
    if (!on() || !victim) return;
    if (Math.abs(x - (TARGET.x * TS + TS / 2)) <= TARGET.r) drill('throw', victim, x, floorY() - 30, 'BULLSEYE');
  }
  function revived(helper, p) { if (!on() || !helper) return; drill('revive', helper, p.x, p.y - 36, 'LIFTED'); }
  function drill(id, p, x, y, word) {
    const t = tav(); t.drills[id] = Math.min(999, (t.drills[id] | 0) + 1); api.save();
    if (id === 'team') st.stats.team++; else if (id === 'throw') st.stats.bulls++; else st.stats.revives++;
    api.number(x, y, word + '  ' + t.drills[id], '#8fd160'); api.sfx('sting');
  }

  /* ===== the furniture, in the world (greybox fills), behind the heroes ===== */
  function draw(g, cx, cy, time) {
    if (!on()) return;
    const fy = floorY() - cy, X = tx => Math.round(tx * TS + TS / 2 - cx);
    const box = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    /* THE DOOR (west wall): oak, iron straps, open while someone walks in */
    { const x = X(STATIONS[0].x) - 7, open = api.players().some(p => p.walkIn > 0) || st.doorT > 0;
      box(x - 2, fy - 34, 18, 34, '#2a1a0e'); box(x, fy - 32, 14, 32, open ? '#0e0c16' : '#6a4424');
      if (open) { box(x + 1, fy - 20, 12, 1, '#c9b27c'); box(x + 2, fy - 12, 3, 12, '#3a5a24'); } else { box(x, fy - 26, 14, 2, '#3a3040'); box(x, fy - 10, 14, 2, '#3a3040'); box(x + 11, fy - 17, 2, 2, '#c9d1dc'); }
      box(x + 4, fy - 40, 6, 4, '#ffd36b'); }
    /* THE INVITE BOARD: cork in timber, bills, and the chalk slate with the room code */
    { const x = X(STATIONS[1].x) - 13, y = fy - 40, code = api.roomCode();
      box(x, y, 26, 22, '#5c3a1d'); box(x + 2, y + 2, 22, 18, '#a07a4a'); box(x + 4, y + 4, 7, 6, '#e8dcc0'); box(x + 14, y + 3, 8, 5, '#d8c8a0');
      box(x + 4, y + 12, 18, 7, '#1e2a22'); if (code) api.text(code, x + 13, y + 13, '#e8f0e8', 'center', 6); else box(x + 7, y + 15, 12, 1, '#4a5a4a');
      box(x + 11, y + 22, 4, 18, '#3a2410'); }
    /* THE CAMPAIGN TABLE: the map on a heavy table, a candle */
    { const x = X(STATIONS[2].x) - 16; box(x, fy - 14, 32, 4, '#5c3a1d'); box(x + 2, fy - 10, 3, 10, '#3a2410'); box(x + 27, fy - 10, 3, 10, '#3a2410');
      box(x + 3, fy - 16, 26, 2, '#d8c8a0'); box(x + 8, fy - 16, 3, 1, '#3a6a2a'); box(x + 17, fy - 16, 5, 1, '#2a5a8a'); box(x + 13, fy - 17, 1, 1, '#c9463d');
      box(x + 26, fy - 21, 2, 5, '#e8e0d0'); if (Math.floor(time * 6) % 2) box(x + 26, fy - 23, 2, 2, '#ffd36b'); else box(x + 26, fy - 23, 2, 2, '#ff9a4a'); }
    /* THE WARDROBE: a tall cupboard, doors open on cloaks in the four colours; the mirror */
    { const x = X(STATIONS[3].x) - 11; box(x, fy - 42, 22, 42, '#4a2c18'); box(x + 2, fy - 40, 18, 36, '#1a120c');
      COLOURS.slice(0, 4).forEach((c, i) => box(x + 3 + i * 4, fy - 36, 3, 14, c.c)); box(x + 3, fy - 38, 16, 1, '#8a6a3a');
      box(x + 24, fy - 26, 7, 26, '#3a2410'); box(x + 25, fy - 25, 5, 16, '#8aa8b8'); box(x + 26, fy - 24, 1, 8, '#dfe8ff'); }
    /* THE DRILLS BOARD: a chalkboard with the three drills and their tallies */
    { const x = X(STATIONS[4].x) - 14, y = fy - 38, t = tav();
      box(x, y, 28, 20, '#3a2410'); box(x + 2, y + 2, 24, 16, '#1e2a22');
      DRILL_IDS.forEach((k, i) => { const n = Math.min(10, t.drills[k] | 0); box(x + 4, y + 4 + i * 5, 3, 3, ['#ffd36b', '#8fd160', '#6bb8ff'][i]); for (let j = 0; j < n; j++) box(x + 9 + j * 2, y + 4 + i * 5, 1, 3, '#e8f0e8'); });
      box(x + 12, y + 20, 4, 18, '#3a2410'); }
    /* THE SPARRING BELL on its post */
    { const x = X(STATIONS[5].x), sw = st.bellT > 0 ? Math.round(Math.sin(time * 30) * 2) : 0;
      box(x - 1, fy - 30, 3, 30, '#3a2410'); box(x - 6, fy - 31, 12, 2, '#3a2410');
      box(x - 3 + sw, fy - 29, 7, 6, '#c9962a'); box(x - 4 + sw, fy - 23, 9, 1, '#ffe27a'); box(x + sw, fy - 22, 1, 6, '#c9b27c'); }
    /* THE HAY TARGET on the yard floor */
    { const x = X(TARGET.x); for (const [r, c] of [[22, '#c9a040'], [14, '#e0c088'], [6, '#c9463d']]) { g.globalAlpha = 0.85; g.fillStyle = c; g.beginPath(); g.ellipse(x, fy - 1, r, 3, 0, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
      box(x - 26, fy - 8, 8, 8, '#c9a040'); box(x + 18, fy - 8, 8, 8, '#c9a040'); box(x - 25, fy - 6, 6, 1, '#8a6a1d'); box(x + 19, fy - 6, 6, 1, '#8a6a1d'); }
    /* THE PRACTICE DOOR: an arch with the yards' light in it */
    { const x = X(STATIONS[6].x) - 9; box(x, fy - 36, 18, 36, '#5a5a64'); box(x + 3, fy - 32, 12, 32, '#2a2a34'); const k = 0.5 + 0.5 * Math.sin(time * 2);
      g.globalAlpha = 0.35 + 0.3 * k; box(x + 4, fy - 30, 10, 30, '#ffd36b'); g.globalAlpha = 1; }
    /* THE ARENA PIT: roped off, COMING SOON */
    { const x = X(STATIONS[7].x) - 20; box(x, fy - 2, 40, 2, '#8a6a3a'); box(x + 2, fy - 1, 36, 1, '#c9a040');
      for (const px of [x, x + 13, x + 26, x + 39]) box(px, fy - 14, 2, 14, '#3a2410');
      g.strokeStyle = '#c9b27c'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, fy - 12); g.quadraticCurveTo(x + 7, fy - 8, x + 14, fy - 12); g.quadraticCurveTo(x + 20, fy - 8, x + 27, fy - 12); g.quadraticCurveTo(x + 33, fy - 8, x + 40, fy - 12); g.stroke();
      box(x + 8, fy - 34, 24, 13, '#5c3a1d'); box(x + 9, fy - 33, 22, 11, '#2a1a0e'); api.text('SOON', x + 20, fy - 31, '#ff9a5c', 'center', 6); }
    /* THE GLINTS: a sparkle and a bobbing mark over every station not used yet */
    for (const s of STATIONS) if (!seen(s.id)) { const x = X(s.x), y = fy - 50 + Math.round(Math.sin(time * 4 + s.x) * 2), k = Math.floor(time * 8 + s.x) % 4;
      g.fillStyle = '#fff6c8'; if (k < 2) { g.fillRect(x - 3 + k, y - 9, 1, 1); g.fillRect(x + 3 - k, y - 6, 1, 1); } g.fillStyle = '#ffd36b'; g.fillRect(x, y - 6, 2, 5); g.fillRect(x, y, 2, 2); }
    /* THE PROMPT over the station a player stands at: his key and the verb, in his colour */
    for (const p of api.players()) { const s = st.near.get(p); if (!s || st.cardFor.has(p)) continue; const lab = keyFor(p) + ' ' + (s.id === 'door' && p.n !== 1 ? 'LEAVE PARTY' : s.verb);
      api.text(lab, X(s.x), fy - 60 - (p.n - 1) * 8, colourOf(api.PROG().tavern, p.n).c, 'center', 6); }
  }
  /* ===== the wardrobe cards, on the screen ===== */
  function drawHud(VW, VH) {
    if (!on()) return;
    let i = 0;
    for (const [p, c] of st.cardFor) {
      const w = 132, h = 58, x = Math.round(VW / 2 - w / 2 + (i - (st.cardFor.size - 1) / 2) * (w + 4)), y = 26; i++;
      api.board(x, y, w, h); const col = colourOf(api.PROG().tavern, p.n);
      api.text(api.tagOf(p) + ' WARDROBE', x + w / 2, y + 4, col.c, 'center', 6);
      const vals = [api.heroName(p.hero), api.weaponName(api.weaponOf(p)), col.name, tav().ring ? 'ON' : 'OFF'];
      ROWS.forEach((r, k) => { const yy = y + 15 + k * 9, sel = k === c.row; api.text((sel ? '> ' : '  ') + r, x + 6, yy, sel ? '#a8e06e' : '#c2c9c2', 'left', 6); api.text((sel ? '< ' : '') + vals[k] + (sel ? ' >' : ''), x + w - 6, yy, sel ? '#fff6e0' : '#c2c9c2', 'right', 6); });
      api.text('UP/DOWN  LEFT/RIGHT  E CLOSE', x + w / 2, y + h - 8, '#8a8f80', 'center', 6);
    }
  }
  function debug() { return { on: on(), stations: STATIONS.map(s => ({ id: s.id, x: sx(s), seen: seen(s.id) })), cards: [...st.cardFor].map(([p, c]) => ({ n: p.n, row: ROWS[c.row] })), near: [...st.near].map(([p, s]) => ({ n: p.n, s: s ? s.id : null })), stats: JSON.parse(JSON.stringify(st.stats)), tavern: JSON.parse(JSON.stringify(tav())) }; }
  function reset() { st.cardFor.clear(); st.near.clear(); st.teamLast.clear(); st.saidFirst.clear(); st.fly.clear(); st.bellT = 0; }
  return { on, tick, hands, walking, draw, drawHud, dummyHit, thrown, revived, use: (id, p) => { const s = STATIONS.find(q => q.id === id); if (s) use(s, p); }, stationNear, debug, reset, door: () => { st.doorT = 1; } };
}
