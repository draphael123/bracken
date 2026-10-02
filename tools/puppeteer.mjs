// tools/puppeteer.mjs - THE PUPPETEER, the Maskwright's Theatre's boss (claude/puppeteer; PUPPETEER3 after Daniel played the second build; THEATRE3 after
// he played the live theatre: "extremely easy", and the mash bot won 5 of 6). src/puppeteer.js is the fight (its header is the design). Every rule below
// was proved red first on the old code or a sabotaged copy (the lane reports list them).
// PURE (src/puppeteer.js, no page):
//   - THE DUO: the Harlequin is FAST AND WEAK (short tells, small blows, quick feet, little health) and the Brute SLOW AND HEAVY (long tells, 28+ a blow,
//     a long recovery after every swing, more health) - by their own numbers
//   - THE GREEN WINDOW (THEATRE3): a puppet is hurt - its health, a string cut - only while it glows green (its told recovery, or the stagger of a gold
//     cut); a swing across a slack string any other time CLANKS (show.clanks) and cuts nothing; a GOLD cut (in a windup) still cancels the blow
//   - limbs: the Brute's ARM cut, no more chop or grab; his BACK cut, no more slam; the Harlequin's one string cut, he drops
//   - A DROPPED PUPPET stays down its told time (PUP.downT x cycleK) and is then strung again; one down lowers his bar (PUP.hangLow)
//   - BOTH DOWN NO LONGER OPENS HIM: his bar goes SLACK for PUP.slackT s on the fly gallery, he is not open, and left alone he strings them again.
//     A blow on the SLACK bar cuts it: he falls to the boards, OPEN (x PUP.openMul) for PUP.downOpenT s (>= 3), said in the hint box; a blow on a TAUT bar
//     clanks and opens nothing; anywhere else a blow on him is PUP.ward; a minute left alone opens nothing
//   - HE FIGHTS BACK in the opening (a told low flail, !!), THE HOUSE throws told props all fight (a shadow and a mark >= 0.9 s before it lands, every
//     third a sandbag), and EACH CYCLE he re-strings faster and adds a move (his sandbag, the house in pairs, the second chop)
//   - THE PHASES: 1, the duo never START together; 2, they strike together, and the Brute's slam breaks the boards (a pit that mends once it is empty);
//     the slam reaches a hero on a flat or in a pit; 3, the Brute is packed away, the masterpiece comes with the Harlequin, and both down slacken his bar
//   - every attack fires (rule A3) and wears its mark, answer and height; the scene change lays its flats
// THE STAGE: the theatre's main stage (walls, trigger past the door, a checkpoint outside, ~40 wide, the gallery, the batten, the duo, his music, R+2 solid)
// IN THE PAGE: a body blow outside the green window clanks, inside it takes the puppet's health; a real swing across a green string cuts it; both dropped,
//   his bar is slack and he is NOT open; a real swing at the slack bar from the gallery drops him open and a blow bites; the pin rail is free from the start;
//   the gallery is iron; his death ends the fight; and THE HUMAN BOT wins a fight while taking real damage. The page section runs on a pinned dice, so the
//   bot's row never depends on how the earlier sections happened to roll (claude/theatre3: the 'taken >= 10' row used to come and go).
//   node tools/puppeteer.mjs        (PORT from tools/ports.mjs)
import { openPage } from './cdp.mjs';
import * as M from '../src/puppeteer.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const DEPTH = Math.max(1, depthsOf(LEVELS).theatre ?? 1);   /* the human bot fights at the theatre's campaign depth, no skills (as tools/combat-pilots.mjs and tools/mash-bot.mjs) */

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, R = 20, SX = 14, FLOOR = R * TS, GAL = (R - 9) * TS, P = M.PUP;
const A = { x0: (SX + 1) * TS, x1: (SX + 39) * TS, floor: FLOOR, gallery: GAL, gx0: (SX + 3) * TS, gx1: (SX + 39) * TS, sx: SX, TS, y0: (R - 15) * TS };
function rig(o = {}) {
  const show = M.newShow(A), e = M.newPuppeteer({ t: 'puppeteer', x: o.bx ?? (SX + 30) * TS, y: GAL, hp: o.hp ?? 720, maxHp: 720, alive: true });
  e.mode = 'work'; e.modeT = 0; e.phase = o.phase || 1;
  if (o.quiet) show.houseCd = 1e9;   /* (the house kept quiet, for the rows that count blows) */
  const mk = (t, x) => M.newPuppet({ t, x, y: FLOOR, alive: true, face: -1 }, show);
  const bru = mk('marionette', o.bruX ?? 420), har = mk('harlequin', o.harX ?? 640);
  if (o.noHarl) { har.alive = false; har.mode = 'packed'; } if (o.noBrute) { bru.alive = false; bru.mode = 'packed'; }
  const hero = { x: o.x ?? 390, y: FLOOR, face: 1, alive: true, ground: true, stillT: 0 };
  const log = { hits: [], bands: [], lines: [], tiles: [], pits: [], events: {}, summons: 0 };
  const c = { heroes: [hero], say: () => {}, sound: () => {}, number: (x, y, t) => log.lines.push(t),
    hit: (box, d, name, opt = {}) => log.hits.push({ box, d, name, opt }), band: (...a) => log.bands.push(a), tile: (x, y, t) => log.tiles.push({ x, y, t }),
    pit: (x0, x1, open) => log.pits.push({ x0, x1, open }), pack: p => { p.alive = false; },
    summon: (t, x, y) => { log.summons++; M.newPuppet({ t, x, y, alive: true, face: -1 }, show); return null; } };
  const step = () => { hero.lastFloor = M.heroFloor(show, { ...hero, lastFloor: hero.lastFloor }); const ev = M.stepShow(e, show, DT, c); for (const v of ev) log.events[v.t] = (log.events[v.t] || 0) + 1; return ev; };
  return { show, e, bru, har, hero, log, c, step };
}
const until = (r, pred, n = 600) => { for (let i = 0; i < n; i++) { if (pred()) return true; r.step(); } return pred(); };
const strOf = (r, p, k) => M.stringsOf(r.e, r.show).find(q => q.p === p && q.k === k);
const boxOn = s => ({ l: s.x1 - 4, r: s.x1 + 4, t: s.y1 - 4, b: s.y1 + 4 });
const bothDown = r => { r.bru.hp = 0; r.har.hp = 0; return until(r, () => r.e.mode === 'slack', 240); };

// ---- THE DUO, by their numbers ----
{ const h = P.harl, b = P.brute;
  ok(h.jab <= 10 && h.kick <= 12 && h.jabTell <= 0.5 && h.kickTell <= 0.6 && h.speed >= 2 * b.speed, 'the Harlequin is not fast and weak: jab ' + h.jab + ', tells ' + h.jabTell + '/' + h.kickTell + ', speed ' + h.speed);
  ok(b.chop >= 28 && b.slam >= 28 && b.grab >= 28 && b.chopTell >= 1.0 && b.slamTell >= 1.0 && b.grabTell >= 1.0 && b.recover >= 1.2, 'the Brute is not slow and heavy: ' + JSON.stringify({ chop: b.chop, slam: b.slam, grab: b.grab, tells: [b.chopTell, b.slamTell, b.grabTell], recover: b.recover }));
  ok(h.hp < b.hp, 'the Harlequin (' + h.hp + ') is no more fragile than the Brute (' + b.hp + ')'); }
// ---- DAMAGE READS: health falls and at nothing the puppet drops ----
{ const r = rig({ noHarl: true, x: 200, quiet: true }); r.bru.hp -= 50; r.step(); ok(!M.heaped(r.bru) && r.bru.hp === P.brute.hp - 50, 'the Brute\'s health is not simply his health');
  r.bru.hp = 0; r.step(); ok(M.heaped(r.bru) && r.log.events.heap === 1, 'the Brute with no health left did not drop'); }
// ---- THE GREEN WINDOW: hurt only in the told recovery (or a gold cut's stagger) ----
{ const r = rig({ noHarl: true, x: 400, bruX: 425, quiet: true }); r.step();
  ok(!M.hurtable(r.bru), 'the Brute hanging (not spent) can be hurt');
  const s = strOf(r, r.bru, 'arm'); ok(s && !s.taut, 'the Brute hanging has no slack arm string to test');
  const c0 = M.strikeStrings(r.e, r.show, boxOn(s), new Set()); ok(c0.length === 0 && r.show.clanks.length === 1 && M.stringsLeft(r.bru) === 2, 'a swing across the Brute\'s SLACK string while he is not spent cut it (or did not clank): ' + JSON.stringify({ cuts: c0.length, clanks: r.show.clanks.length }));
  r.show.clanks.length = 0;
  ok(until(r, () => r.bru.mode === 'recover', 60 * 12), 'the Brute never recovered after a blow');
  ok(M.hurtable(r.bru), 'the Brute in his recovery does not glow green (hurtable)');
  const s2 = strOf(r, r.bru, 'arm'), c1 = s2 ? M.strikeStrings(r.e, r.show, boxOn(s2), new Set()) : [];
  ok(c1.length === 1 && c1[0].limb === 'arm' && !c1[0].gold, 'a swing across the Brute\'s string in his GREEN recovery did not cut it');
  r.hero.x = 400; let chop = 0, grab = 0, slam = 0; for (let i = 0; i < 60 * 20; i++) { r.step(); if (r.bru.mode === 'chopTell') chop++; if (r.bru.mode === 'grabTell') grab++; if (r.bru.mode === 'slamTell') slam++; if (M.heaped(r.bru)) break; }
  ok(chop === 0 && grab === 0 && slam > 0, 'with his arm string cut the Brute still chopped or grabbed (chop ' + chop + ', grab ' + grab + ', slam ' + slam + ')'); }
{ const r = rig({ noHarl: true, x: 200, bruX: 420, quiet: true }); r.step(); r.bru.str[1].cut = true;   /* (the back string, and only it) */
  r.hero.x = 400; let slam = 0, other = 0; for (let i = 0; i < 60 * 20; i++) { r.step(); if (r.bru.mode === 'slamTell') slam++; if (r.bru.mode === 'chopTell' || r.bru.mode === 'grabTell') other++; }
  ok(slam === 0 && other > 0, 'with his back string cut the Brute still slammed (slam ' + slam + ', chop/grab ' + other + ')'); }
// ---- A GOLD CUT cancels the blow, and the stagger glows green ----
{ const r = rig({ noHarl: true, x: 400, bruX: 425, quiet: true }); ok(until(r, () => /Tell$/.test(r.bru.mode), 600), 'the Brute never wound up at a hero 25 px away');
  const s = strOf(r, r.bru, r.bru.mode === 'slamTell' ? 'arm' : 'back'); ok(s && s.taut, 'a string of the Brute winding up is not gold');
  const c = M.strikeStrings(r.e, r.show, boxOn(s), new Set()); r.step();
  ok(c.length === 1 && c[0].gold && r.bru.mode === 'stagger' && r.log.events.cancel === 1 && M.hurtable(r.bru), 'a GOLD cut did not cancel the Brute\'s blow into a green stagger (mode ' + r.bru.mode + ')');
  for (let i = 0; i < 60; i++) r.step(); ok(!r.log.hits.some(h => h.name === 'THE BRUTE' || h.name === 'THE SLAM'), 'the cancelled blow landed anyway'); }
// ---- THE HARLEQUIN: one cut drops him; down his told time; then strung again ----
{ const r = rig({ noBrute: true, x: 470, harX: 460, quiet: true }); ok(until(r, () => r.har.mode === 'recover', 60 * 8), 'the Harlequin never recovered after his blows');
  ok(P.harl.rest >= 0.5, 'the Harlequin\'s green window is under half a second (' + P.harl.rest + ')');
  const s = strOf(r, r.har, 'cross'); M.strikeStrings(r.e, r.show, boxOn(s), new Set()); r.step();
  ok(M.heaped(r.har), 'one green cut did not drop the Harlequin'); }
{ const r = rig({ x: 200, quiet: true }); r.har.hp = 0; r.step(); r.step(); let t = 0; while (M.heaped(r.har) && t < 60 * 20) { r.step(); t++; }
  ok(Math.abs(t * DT - P.downT.harlequin) < 0.1, 'a dropped Harlequin stayed down ' + (t * DT).toFixed(2) + ' s, not ' + P.downT.harlequin);
  ok(r.har.hp === r.har.maxHp && M.stringsLeft(r.har) === 1, 'the Harlequin came back without his health or his string'); }
// ---- HIS BAR: one down lowers it; both down SLACKEN it - not open; left alone he strings them again ----
{ const r = rig({ x: 200, quiet: true }); r.har.hp = 0; for (let i = 0; i < 90; i++) r.step();
  ok(Math.abs(r.e.y - (GAL + P.hangLow)) < 2 && r.e.mode === 'hang1', 'one puppet down and his bar did not sink ' + P.hangLow + ' px (y ' + r.e.y + ')');
  ok(!M.pupOpen(r.e) && M.pupTake(r.e) === P.ward, 'with one puppet down he is already open');
  r.bru.hp = 0; ok(until(r, () => r.e.mode === 'slack', 120), 'both puppets down and his bar did not go slack (mode ' + r.e.mode + ')');
  ok(r.log.lines.includes('HIS BAR IS SLACK: CLIMB AND CUT IT'), 'his slack bar was not said in the hint box');
  let opened = 0, t = 0; while (r.show.slack > 0 && t < 60 * 30) { r.step(); t++; if (M.pupOpen(r.e) || r.e.mode === 'descend') opened++; }
  ok(opened === 0, 'both puppets down (and his bar left alone) opened him: ' + opened + ' frames');
  ok(Math.abs(t * DT - P.slackT) < 0.1, 'his bar stayed slack ' + (t * DT).toFixed(2) + ' s, not ' + P.slackT);
  ok(until(r, () => r.e.mode === 'work' && !M.heaped(r.bru) && !M.heaped(r.har), 60 * 3) && r.show.n.restrung === 1, 'left alone, he did not string both again'); }
// ---- THE CUT: a blow on the slack bar drops him OPEN; a taut bar clanks ----
{ const r = rig({ x: 200, quiet: true }); r.step(); r.e.slackBar = false;
  ok(M.cutBar(r.e, r.show, M.barBox(r.e)) === 'taut' && !M.pupOpen(r.e) && r.e.mode !== 'descend', 'a blow on his TAUT bar did more than clank');
  ok(bothDown(r), 'both down: no slack'); until(r, () => Math.abs(r.e.y - GAL) < 1, 120); r.step();
  ok(M.barSlack(r.e, r.show) && r.e.slackBar, 'his slack bar does not read slack');
  const bb = M.barBox(r.e); ok(bb.b - bb.t >= 12 && GAL - bb.b <= 8 && GAL - bb.t <= 24, 'the slack bar is not at a blade\'s height off the gallery: ' + JSON.stringify(bb));
  r.hero.x = r.e.x - 20; r.hero.y = GAL; ok(M.cutBar(r.e, r.show, { l: bb.l - 6, r: bb.l + 10, t: GAL - 16, b: GAL - 2 }) === 'cut', 'a blow on his SLACK bar did not cut it');
  ok(until(r, () => r.e.mode === 'downed', 120) && r.e.y === FLOOR && M.pupOpen(r.e) && M.pupTake(r.e) === P.openMul, 'his bar cut, he did not fall to the boards open at ' + P.openMul);
  ok(r.log.lines.includes("HE'S DOWN - STRIKE HIM"), 'his fall was not said in the hint box');
  r.hero.x = r.e.x + 30; r.hero.y = FLOOR; let t = 0, flails = 0; while (M.pupOpen(r.e) && t < 600) { r.step(); t++; if (r.e.mode === 'flailTell' && r.e.modeT > P.flailTell - DT * 1.5) flails++; }
  ok(Math.abs(t * DT - P.downOpenT) < 0.05 && P.downOpenT >= 3, 'the open window is ' + (t * DT).toFixed(2) + ' s, not ' + P.downOpenT + ' (>= 3)');
  ok(flails >= 2 && r.log.hits.some(h => h.name === 'THE FLAIL' && h.opt.unblockable && h.box[2] >= FLOOR - P.lowTop - 2), 'he did not fight back from the boards (a told low flail, unblockable): ' + flails + ' flails');
  ok(until(r, () => r.e.mode === 'work' && !M.heaped(r.bru) && !M.heaped(r.har), 60 * 6) && r.show.cycle === 1, 'after the window he did not haul himself up, change the scene and string the duo again'); }
{ const r = rig({ x: 250 }); let opened = 0; for (let i = 0; i < 60 * 60; i++) { r.hero.x = 250; r.step(); if (M.pupOpen(r.e)) opened++; }
  ok(opened === 0, 'left alone for a minute he was open ' + opened + ' frames'); }
// ---- THE HOUSE throws, told; every third a sandbag ----
{ const r = rig({ x: 300 }); const born = new Map(); let landed = 0, bags = 0, early = 0;
  for (let i = 0; i < 60 * 50; i++) { for (const d of r.show.drops) if (!born.has(d.id)) born.set(d.id, i); r.hero.x = 300 + 60 * Math.sin(i / 90); const n0 = r.log.hits.length; r.step();
    for (const h of r.log.hits.slice(n0)) if (h.name === 'THE HOUSE' || h.name === 'THE SANDBAG') { landed++; if (h.opt.unblockable) bags++; } }
  for (const [id, f] of born) { const d = r.show.drops.find(q => q.id === id); if (d && d.t > d.len) early++; }
  ok(landed >= 10 && bags >= 3 && r.show.n.prop >= 7, 'the house did not throw all fight (a prop every ~3 s, every third a sandbag): ' + JSON.stringify({ landed, bags, n: r.show.n.prop }));
  ok(P.house.tell >= 0.9 && r.log.lines.filter(l => l === '!' || l === '!!').length >= landed && early === 0, 'a thrown prop was not told (a mark and a shadow >= 0.9 s before it lands)'); }
// ---- EACH CYCLE: faster, and a new move ----
{ ok(M.cycleK(1) < M.cycleK(0) && M.cycleK(2) < M.cycleK(1) && M.cycleK(3) < M.cycleK(2) && M.cycleK(9) >= P.restringMin, 'he does not re-string faster each cycle: ' + [0, 1, 2, 3].map(M.cycleK));
  for (let k = 1; k <= 3; k++) ok(M.movesOf(k).length === M.movesOf(k - 1).length + 1, 'cycle ' + k + ' adds no move: ' + M.movesOf(k));
  const r = rig({ x: 300, quiet: true }); r.show.cycle = 1; for (let i = 0; i < 60 * (P.flyBag.every + 1); i++) r.step(); ok(r.show.n.flybag >= 1, 'cycle 1: his sandbag never came');
  const r2 = rig({ x: 300 }); r2.show.cycle = 2; for (let i = 0; i < 60 * 8; i++) r2.step(); ok(r2.show.n.pair >= 1, 'cycle 2: the house never threw a pair');
  const r3 = rig({ noHarl: true, x: 400, bruX: 425, quiet: true }); r3.show.cycle = 3; for (let i = 0; i < 60 * 20; i++) { r3.step(); if (M.heaped(r3.bru)) break; } ok(r3.show.n.chop2 >= 1, 'cycle 3: the Brute never chopped twice');
  const r4 = rig({ x: 200, quiet: true }); r4.show.cycle = 2; r4.har.hp = 0; r4.step(); r4.step(); ok(Math.abs(r4.har.downT - P.downT.harlequin * M.cycleK(2)) < 0.05, 'cycle 2: a dropped Harlequin is not strung again sooner'); }
// ---- THE PHASES ----
{ const r = rig({ x: 430, bruX: 450, harX: 410, quiet: true }); let together = 0, starts = 0;
  for (let i = 0; i < 60 * 60; i++) { const b0 = r.bru.mode, h0 = r.har.mode; r.hero.x = 430 + 20 * Math.sin(i / 50); r.step();
    const bs = /Tell$/.test(r.bru.mode) && !/Tell$/.test(b0), hs = /Tell$/.test(r.har.mode) && !/Tell$/.test(h0); if (bs && hs) together++; if (bs || hs) starts++;
    for (const p of [r.bru, r.har]) if (M.heaped(p)) { p.hp = p.maxHp; p.mode = 'hang'; p.str.forEach(s => s.cut = false); p.alive = true; } }
  ok(starts > 10 && together === 0, 'phase 1: the duo started windups on the same frame ' + together + ' times (of ' + starts + ')'); }
{ const r = rig({ x: 430, bruX: 450, harX: 410, hp: 450, quiet: true }); r.e.phase = 2; let both = 0;
  for (let i = 0; i < 60 * 60; i++) { r.hero.x = 430 + 20 * Math.sin(i / 50); r.step(); if (/Tell$|^(jab|kick)$/.test(r.har.mode) && /Tell$|^(chop|slam|grab)$/.test(r.bru.mode)) both++;
    for (const p of [r.bru, r.har]) if (M.heaped(p)) { p.hp = p.maxHp; p.mode = 'hang'; p.str.forEach(s => s.cut = false); p.alive = true; } }
  ok(both > 30, 'phase 2: the duo never struck together (' + both + ' frames)');
  ok(r.log.pits.some(q => q.open) && r.log.pits.some(q => !q.open), 'phase 2: the Brute\'s slam did not break the boards (and mend them)'); }
{ const r = rig({ noHarl: true, x: 430, bruX: 470, hp: 450, quiet: true }); r.e.phase = 2; r.hero.y = FLOOR - 48; let slam = 0;
  for (let i = 0; i < 60 * 20; i++) { r.step(); if (r.log.hits.some(h => h.name === 'THE SLAM' && h.box[3] === FLOOR - 48)) { slam++; break; } }
  ok(slam > 0, 'a hero standing on a flat was out of the Brute\'s reach (the slam must shake the flat)'); }
{ const r = rig({ hp: 230, x: 300, quiet: true }); r.e.phase = 2; r.step();
  ok(r.e.phase === 3 && r.bru.mode === 'packed' && !M.heaped(r.har) && r.log.summons === 1, 'phase 3: the Brute was not packed away for the masterpiece, or the Harlequin went too');
  const mp = r.show.puppets.find(p => p.t === 'masterpiece'); ok(mp && mp.maxHp === P.master.hp && mp.str.length === 4, 'the masterpiece has not its health and four strings');
  if (mp) { until(r, () => mp.mode === 'hang', 300); mp.hp = 0; r.har.hp = 0; ok(until(r, () => r.e.mode === 'slack', 200), 'phase 3: the masterpiece and the Harlequin down did not slacken his bar'); } }
// ---- EVERY ATTACK FIRES; THE MARKS ----
{ const fired = {}; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const ph of [1, 2, 3]) { const r = rig({ hp: ph === 1 ? 720 : ph === 2 ? 450 : 200, x: 420 }); if (ph > 1) r.e.phase = ph - 1;
    for (let i = 0; i < 60 * 60; i++) { if (i % 120 === 0) { r.hero.x = A.x0 + 60 + rnd() * (A.x1 - A.x0 - 120); r.hero.y = ph > 1 && rnd() < 0.3 ? GAL : FLOOR; const mp = r.show.puppets.find(p => p.t === 'masterpiece'); if (ph === 3 && mp && rnd() < 0.5) { r.hero.x = mp.x + (rnd() < 0.5 ? -40 : 40); r.hero.y = FLOOR; } } r.step();
      for (const k of ['jab', 'kick', 'chop', 'slam', 'grab', 'swat', 'stomp', 'reach', 'whip', 'prop', 'bag']) if (r.show.n[k]) fired[k] = true; } }
  for (const k of ['jab', 'kick', 'chop', 'slam', 'grab', 'swat', 'stomp', 'reach', 'whip', 'prop', 'bag']) ok(fired[k], 'THE ' + k.toUpperCase() + ' never fired in a fuzz of the three phases (rule A3)'); }
const ROWS = { 'harlequin|jabTell': ['!', 'block', 'low'], 'harlequin|kickTell': ['!!', 'jump', 'low'], 'marionette|chopTell': ['!!', 'dodge', 'low'], 'marionette|slamTell': ['!!', 'jump', 'low'],
  'marionette|grabTell': ['!!', 'dodge', 'low'], 'masterpiece|swatTell': ['!', 'block', 'low'], 'masterpiece|stompTell': ['!!', 'dodge', 'low'], 'masterpiece|reachTell': ['!!', 'duck', 'high'],
  'puppeteer|whipLowTell': ['!!', 'jump', 'low'], 'puppeteer|whipHighTell': ['!!', 'duck', 'high'], 'puppeteer|flailTell': ['!!', 'jump', 'low'] };
for (const [k, [m, a, hgt]] of Object.entries(ROWS)) { ok(MARK[k] === m, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + m); ok(ANSWER[k] === a, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + a); ok(HEIGHT[k] === hgt, k + ' is ' + JSON.stringify(HEIGHT[k]) + ', not ' + hgt); }
// ---- THE STAGE ----
{ const lv = LEVELS.find(l => l.id === 'theatre'); ok(lv && !lv.hidden, 'the Maskwright Theatre (his stage) is missing or hidden');
  if (lv) { const L = lv.build(), A2 = L.arena; ok(A2 && A2.boss === 'puppeteer' && A2.music === 'puppeteer', 'the stage is not his arena with his music');
    const w = A2.wallR - A2.wallL; ok(w >= 36 && w <= 44, 'the stage is ' + w + ' wide');
    ok(A2.trigger > (A2.wallL + 1) * 16 && L.ents.some(e => e.t === 'check' && e.x < A2.wallL), 'the trigger is not past the door, or no checkpoint stands outside');
    ok(L.ents.filter(e => e.t === 'puppeteer').length === 1 && L.ents.some(e => e.t === 'marionette') && L.ents.some(e => e.t === 'harlequin'), 'he and his duo are not on the stage');
    ok((L.moversExtra || []).some(m => m.batten), 'the stage has no batten');
    let under = 0; for (let x = A2.wallL + 1; x < A2.wallR; x++) if (L.grid[(A2.stage.R + 2) * L.W + x] === 1) under++; ok(under >= 36, 'row R+2 under the stage is not solid: ' + under); } }

// ---- IN THE PAGE ----
if (process.argv.includes("--no-page")) { for (const b of bad) console.log("  - " + b); process.exit(bad.length ? 1 : 0); }
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js'),PMm=await import('/src/puppeteer.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    let seed=4242;const real=Math.random;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};   /* (a pinned dice for the whole page section: nothing below may depend on how an unseeded frame rolled) */
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='theatre'));BK.state='play';BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};
    const e=boot(),PH=BK.puppeteerHands(),S=PH.show(),A=BK.L.arena,P=BK.P;S.houseCd=1e9;
    out.woke=BK.bossActive&&e&&e.t==='puppeteer';out.iron=PH.read().iron;out.free=S.free;
    const bru=S.puppets.find(p=>p.t==='marionette'),har=S.puppets.find(p=>p.t==='harlequin');
    bru.mode='hang';const hp0=bru.hp;BKT.hurtEnemy(bru,20,bru.x-10,false);out.clank={lost:hp0-bru.hp,clanks:S.n.clank};
    bru.mode='recover';bru.modeT=9;const hp1=bru.hp;BKT.hurtEnemy(bru,20,bru.x-10,false);out.body={lost:hp1-bru.hp,alive:bru.alive,flash:bru.flash>0};
    const bh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.ward=bh-e.hp;
    /* a real swing across the Brute's arm string, in his green recovery */
    har.x=A.x1-30;S.gap=9;let q=null;for(let i=0;i<30;i++){bru.mode='recover';bru.modeT=9;BK.sim(1);q=PMm.stringsOf(e,S).find(s=>s.p===bru&&s.k==='arm');}
    P.x=q.x1-14;P.y=A.floor;P.face=1;P.vx=0;BK.sim(2);const l0=bru.str.filter(s=>!s.cut).length;BK.press('atk');BK.sim(14);out.swing={l0,l1:bru.str.filter(s=>!s.cut).length};
    for(const p of [bru,har])p.hp=0;let f=0;for(;f<400&&e.mode!=='slack';f++)BK.sim(1);for(let i=0;i<90;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}
    out.slack={mode:e.mode,open:BK.bossOpen(e),y:e.y,gal:A.stage.gallery};
    /* up on the gallery beside him: a real swing at his slack bar */
    const bb=PMm.barBox(e);P.x=bb.l-14;P.y=A.stage.gallery;P.vx=0;P.vy=0;P.face=1;BK.sim(2);P.x=Math.min(P.x,e.x-14);P.face=1;BK.press('atk');BK.sim(14);
    out.cut={mode:e.mode,barCut:S.n.barCut};for(f=0;f<120&&e.mode!=='downed';f++)BK.sim(1);
    const oh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.open={mode:e.mode,y:e.y,dmg:oh-e.hp,floor:A.floor,bar:BK.bossOpen(e)};
    const e3=boot();const rl0=BK.props().find(q=>q.t==='relic'&&q.bossDrop);out.relic={kind:rl0&&rl0.kind,hiddenBefore:!!(rl0&&rl0.hidden)};e3.hp=1;e3.mode='downed';e3.openT=3;BKT.hurtEnemy(e3,99,e3.x-10,false);for(let i=0;i<200&&BK.bossActive;i++){BK.P.inv=99;BK.sim(1);}
    { const rl=BK.props().find(q=>q.t==='relic'&&q.bossDrop);out.relic.shownAfter=!!(rl&&!rl.hidden);BK.sim(240);if(rl){BK.P.inv=99;BK.P.relic=null;BK.P.x=rl.x;BK.P.y=rl.y;BK.sim(3);}out.relic.held=BK.P.relic;out.relic.saved=BKT.PROG.theatre&&BKT.PROG.theatre.relic;BK.sim(120);
      const snare=rel=>{BK.P.relic=rel;BK.P.snare=1;BK.sim(40);return BK.P.snare;};out.relic.snareWith=snare('cutstring');out.relic.snareWithout=snare(null);BK.P.relic=null; }
    const S3=BK.puppeteerHands().show();out.death={alive:e3.alive,active:BK.bossActive,curtain:S3.curtain>0};
    Math.random=real;
    /* THE HUMAN BOT: one whole fight, the knight at the level's depth with no skills, normal health (bossLab pins its own dice per row) */
    {const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG;P0.xp.knight=xpFloor(${DEPTH});P0.skillOwned.knight={};P0.loadouts.knight=[];if(P0.talents)P0.talents.knight={};}
    const o=await BK.bossLab({bosses:['theatre'],heroes:['knight'],healthMode:'normal',maxSecs:300,salt:1});const row=o.rows[0];
    out.bot={out:row.outcome,taken:Math.round(row.health.damageTaken),secs:row.secs};
    return out;})()`, 900000);
  ok(r.woke, 'the fight did not wake past the stage door');
  ok(r.iron >= 30, 'the fly gallery does not wear the iron grating (' + r.iron + ')');
  ok(r.free === true, 'the pin rail is not free from the start (the way up must always be there)');
  ok(r.clank.lost === 0 && r.clank.clanks >= 1, 'a blow on the Brute outside his green window took his health (or did not clank): ' + JSON.stringify(r.clank));
  ok(r.body.lost === 20 && r.body.alive && r.body.flash, 'a blow on the Brute in his green window did not take its health: ' + JSON.stringify(r.body));
  ok(r.ward > 0 && r.ward <= Math.ceil(50 * P.ward) + 2, 'a blow on him hanging was not warded at ' + P.ward + ' (' + r.ward + ' of 50)');
  ok(r.swing.l1 === r.swing.l0 - 1, 'a real swing across the Brute\'s green string did not cut it: ' + JSON.stringify(r.swing));
  ok(r.slack.mode === 'slack' && !r.slack.open && Math.abs(r.slack.y - r.slack.gal) < 2, 'both puppets down, he is not kneeling on the gallery with a slack bar - or he is open: ' + JSON.stringify(r.slack));
  ok(r.cut.barCut === 1 && r.open.mode === 'downed' && r.open.y === r.open.floor && r.open.bar && r.open.dmg >= 45, 'a real swing at his slack bar did not drop him open to a full blow: ' + JSON.stringify({ cut: r.cut, open: r.open }));
  ok(!r.death.alive && !r.death.active && r.death.curtain, 'his death did not end the fight and bring the curtain down: ' + JSON.stringify(r.death));
  ok(r.relic.kind === 'cutstring' && r.relic.hiddenBefore && r.relic.shownAfter && r.relic.held === 'cutstring' && r.relic.saved === 'cutstring', 'THE CUT STRING is not the Puppeteer reward (hidden until he falls, then a pickup that is held and saved): ' + JSON.stringify(r.relic));
  ok(r.relic.snareWith <= 0 && r.relic.snareWithout > 0.2, 'THE CUT STRING does not free a snare in half the time: ' + JSON.stringify(r.relic));
  ok(r.bot.out === 'win' && r.bot.taken >= 10, 'the human bot (knight, salt 1) (L' + DEPTH + ') did not win while taking real damage: ' + JSON.stringify(r.bot));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }

if (bad.length) { console.log('PUPPETEER: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  puppeteer  the duo (fast weak, slow heavy), the green window (a clank otherwise; the gold cancel; limp limbs), both down slackens his bar and the cut drops him open 3 s while he flails back, the house throws, each cycle faster with a new move, the phases, every attack, the stage, and in the page with the human bot');
