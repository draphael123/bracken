// tools/puppeteer.mjs - THE PUPPETEER, the Maskwright's Theatre's boss (claude/puppeteer; PUPPETEER3; THEATRE3; PUPPETEER2 2026-10-04: the visit loop,
// the chained lever, his two slow attacks, no fall, four scenes). src/puppeteer.js is the fight (its header is the design). Each rule below was red on
// the THEATRE3 module (it has no lever chain, no stagger, no snare line, no scenes) - run it against git show 1dd5b181:src/puppeteer.js to see.
// PURE (src/puppeteer.js, no page):
//   - THE DUO: the Harlequin FAST AND WEAK, the Brute SLOW AND HEAVY, by their own numbers
//   - THE GREEN WINDOW: a puppet is hurt only while it glows green (its told recovery, or a gold cut's stagger); a swing across a string any other time
//     CLANKS; a GOLD cut (in a windup) cancels the blow; the Brute's ARM cut, no chop or grab; his BACK cut, no slam; the Harlequin's one string, he drops
//   - THE LEVER is chained until both puppets are down (pinStrike 'locked'); both down, it is FREE (said), his bar slack, he is NOT open; left alone
//     PUP.slackT s he strings them again and the lever is chained again
//   - THE VISIT: a hero on the gallery while the lever is free STAGGERS him (open, x PUP.openMul) for PUP.staggerT s (>= 3); then a TOLD knockback
//     (>= 0.9 s) throws every hero on the gallery down (c.fling); then the scene changes and the duo is strung again (cycle + 1). The visit's share of him
//     (PUP.visitCap) spent, the knockback comes at once. A hero on the gallery outside a visit is thrown down too (no new scene). No fall: never on the boards
//   - HIS TWO SLOW ATTACKS: the prop drop (a shadow >= 1.2 s) and the snare line (told >= 1.2 s at its wing, low and high in turn, swept slowly) - never
//     both at once, a long gap between; the drop unblockable; the snare caught holds you
//   - THE SCENES: a shuffled order of STORM / NIGHT / INFERNO / SEA per fight; cycles 0-2 take the first three; the fourth is the finale's mid-cycle shift.
//     STORM a told gust (the puppets drift); NIGHT a puppet out of the spotlights cannot be hurt; INFERNO two sets of traps take turns, told, and the
//     strips between never burn; SEA a told wave rolls the stage, low. One windup at a time: no two tells (his or the scene's) ever run together
//   - THE PHASES: 1 the duo never start together; 2 together, the slam breaks the boards (and they mend); 3 the masterpiece comes with the Harlequin
//   - every attack fires and wears its mark, answer and height
// THE STAGE: the theatre's main stage (walls, trigger past the door, a checkpoint outside, ~40 wide, the gallery, the batten, the duo, his music, R+2 solid)
// IN THE PAGE: the lever is chained at the start (a real swing clunks: the batten stays down); a body blow outside the green window clanks, inside it takes
//   health; a real swing across a green string cuts it; both dropped, the lever is free and a real swing sends the batten up; on the gallery he staggers,
//   a blow lands whole up to the visit's share; the knockback puts the hero back on the boards; his death ends the fight; THE HUMAN BOT wins taking real
//   damage. The page section runs on a pinned dice.
//   node tools/puppeteer.mjs        (PORT from tools/ports.mjs)   --no-page: the pure part only
import { openPage } from './cdp.mjs';
import * as M from '../src/puppeteer.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const DEPTH = Math.max(1, depthsOf(LEVELS).theatre ?? 1);   /* the human bot fights at the theatre's campaign depth, no skills (as tools/combat-pilots.mjs and tools/mash-bot.mjs) */

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, R = 20, SX = 14, FLOOR = R * TS, GAL = (R - 9) * TS, P = M.PUP;
const A = { x0: (SX + 1) * TS, x1: (SX + 39) * TS, floor: FLOOR, gallery: GAL, gx0: (SX + 3) * TS, gx1: (SX + 39) * TS, sx: SX, TS, y0: (R - 15) * TS };
let seed0 = 11; const rnd0 = () => (seed0 = (seed0 * 16807) % 2147483647) / 2147483647;
function rig(o = {}) {
  const show = M.newShow(A, rnd0), e = M.newPuppeteer({ t: 'puppeteer', x: o.bx ?? (SX + 30) * TS, y: GAL, hp: o.hp ?? 720, maxHp: 720, alive: true });
  e.mode = 'work'; e.modeT = 0; e.phase = o.phase || 1; show.scene = o.scene ?? 0;
  if (o.quiet) show.overCd = 1e9;   /* (his two attacks kept quiet, for the rows that count blows) */
  const mk = (t, x) => M.newPuppet({ t, x, y: FLOOR, alive: true, face: -1 }, show);
  const bru = mk('marionette', o.bruX ?? 420), har = mk('harlequin', o.harX ?? 640);
  if (o.noHarl) { har.alive = false; har.mode = 'packed'; } if (o.noBrute) { bru.alive = false; bru.mode = 'packed'; }
  const hero = { x: o.x ?? 390, y: FLOOR, face: 1, alive: true, ground: true, stillT: 0 };
  const log = { hits: [], bands: [], lines: [], tiles: [], pits: [], flings: [], events: {}, evlog: [], summons: 0 };
  const c = { heroes: [hero], say: () => {}, sound: () => {}, number: (x, y, t) => log.lines.push(t),
    hit: (box, d, name, opt = {}) => log.hits.push({ box, d, name, opt }), band: (...a) => log.bands.push(a), tile: (x, y, t) => log.tiles.push({ x, y, t }),
    pit: (x0, x1, open) => log.pits.push({ x0, x1, open }), pack: p => { p.alive = false; }, fling: (h, dir) => { log.flings.push({ h, dir }); h.y = FLOOR; h.ground = true; },
    summon: (t, x, y) => { log.summons++; M.newPuppet({ t, x, y, alive: true, face: -1 }, show); return null; } };
  const step = () => { hero.lastFloor = M.heroFloor(show, { ...hero, lastFloor: hero.lastFloor }); const ev = M.stepShow(e, show, DT, c); for (const v of ev) { log.events[v.t] = (log.events[v.t] || 0) + 1; log.evlog.push(v); } return ev; };
  return { show, e, bru, har, hero, log, c, step };
}
const until = (r, pred, n = 600) => { for (let i = 0; i < n; i++) { if (pred()) return true; r.step(); } return pred(); };
const strOf = (r, p, k) => M.stringsOf(r.e, r.show).find(q => q.p === p && q.k === k);
const boxOn = s => ({ l: s.x1 - 4, r: s.x1 + 4, t: s.y1 - 4, b: s.y1 + 4 });
const bothDown = r => { r.bru.hp = 0; r.har.hp = 0; return until(r, () => r.e.mode === 'slack', 240); };
const onGallery = r => { r.hero.y = GAL; r.hero.ground = true; r.hero.x = A.gx0 + 40; };

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
// ---- THE LEVER: chained until both are down; both down it is free, his bar slack - not open; left alone, chained again ----
{ const r = rig({ x: 200, quiet: true }); r.step();
  const bat = { st: 'down', t: 0, y: FLOOR, up: GAL, down: FLOOR };
  ok(!r.show.free && M.pinStrike(bat, r.show.free) === 'locked' && bat.st === 'down', 'the lever is not chained while his puppets stand (a strike sent the batten up)');
  r.har.hp = 0; for (let i = 0; i < 90; i++) r.step();
  ok(Math.abs(r.e.y - (GAL + P.hangLow)) < 2 && r.e.mode === 'hang1' && !r.show.free, 'one puppet down: his bar did not sink ' + P.hangLow + ' px, or the lever came free with one still standing (y ' + r.e.y + ')');
  ok(!M.pupOpen(r.e) && M.pupTake(r.e) === P.ward, 'with one puppet down he is already open');
  r.bru.hp = 0; ok(until(r, () => r.e.mode === 'slack', 120), 'both puppets down and his bar did not go slack (mode ' + r.e.mode + ')');
  ok(r.show.free && r.log.events.unchain === 1 && M.pinStrike({ ...bat }, r.show.free) === 'free', 'both down, the chain did not come off the lever');
  ok(r.log.lines.includes('THE LEVER IS FREE: RIDE UP TO HIM'), 'the free lever was not said in the hint box');
  let opened = 0, t = 0; while (r.show.slack > 0 && t < 60 * 30) { r.step(); t++; if (M.pupOpen(r.e)) opened++; }
  ok(opened === 0, 'both puppets down (and nobody up on the gallery) opened him: ' + opened + ' frames');
  ok(Math.abs(t * DT - P.slackT) < 0.1, 'the lever stayed free ' + (t * DT).toFixed(2) + ' s, not ' + P.slackT);
  ok(until(r, () => r.e.mode === 'work' && !M.heaped(r.bru) && !M.heaped(r.har), 60 * 3) && r.show.n.restrung === 1 && !r.show.free, 'left alone, he did not string both again and chain the lever'); }
// ---- THE VISIT: up on the gallery he staggers, open; then the told knockback; then a new scene and the duo again. No fall ----
{ const r = rig({ x: 200, quiet: true }); r.show.order = [2, 3, 1, 4]; ok(bothDown(r), 'both down: no slack');
  for (let i = 0; i < 60 * 3; i++) r.step();
  ok(Math.abs(r.e.x - (A.gx0 + P.slumpX)) < 4 && Math.abs(r.e.y - GAL) < 1, 'with the lever free he did not stumble to the batten end of the gallery (x ' + Math.round(r.e.x) + ')');
  onGallery(r); r.step();
  ok(r.e.mode === 'staggered' && M.pupOpen(r.e) && M.pupTake(r.e) === P.openMul && r.e.y === GAL, 'a hero on the gallery did not stagger him there, open at ' + P.openMul + ' (mode ' + r.e.mode + ', y ' + r.e.y + ')');
  ok(r.log.lines.includes('HE REELS: STRIKE HIM') && r.show.visitLeft === Math.round(720 * P.visitCap), 'the stagger was not said, or the visit\'s share is not ' + P.visitCap + ' of him (' + r.show.visitLeft + ')');
  let t = 0; while (M.pupOpen(r.e) && t < 600) { r.step(); t++; }
  ok(Math.abs(t * DT - P.staggerT) < 0.05 && P.staggerT >= 3, 'the stagger is ' + (t * DT).toFixed(2) + ' s, not ' + P.staggerT + ' (>= 3)');
  ok(r.e.mode === 'knockTell' && P.knockTell >= 0.9 && r.log.lines.includes('HE THROWS YOU OFF THE GALLERY'), 'the knockback was not told (>= 0.9 s, said): ' + r.e.mode);
  ok(until(r, () => r.log.flings.length > 0, 90) && r.log.flings[0].h === r.hero && Math.abs(r.log.events.knockTell ? 1 : 0) === 1, 'the knockback did not throw the hero off the gallery');
  ok(until(r, () => r.e.mode === 'work' && !M.heaped(r.bru) && !M.heaped(r.har), 60 * 4) && r.show.cycle === 1 && r.show.scene === 3, 'after the knockback the scene did not change to the next in the order and the duo was not strung again (cycle ' + r.show.cycle + ', scene ' + r.show.scene + ')');
  ok(!r.log.evlog.some(v => v.t === 'downed') && r.e.y <= GAL + P.hangLow + 1, 'he fell to the boards (PUPPETEER2: no fall)'); }
{ const r = rig({ x: 200, quiet: true }); ok(bothDown(r), 'both down: no slack (cap)'); for (let i = 0; i < 60 * 2; i++) r.step(); onGallery(r); r.step();
  r.show.visitLeft = 0; r.step(); ok(r.e.mode === 'knockTell', 'the visit\'s share spent, the knockback did not come at once (mode ' + r.e.mode + ')'); }
{ const r = rig({ x: 200, quiet: true }); for (let i = 0; i < 30; i++) r.step(); onGallery(r); const c0 = r.show.cycle; r.step();
  ok(r.e.mode === 'knockTell' && !M.pupOpen(r.e), 'a hero on the gallery outside a visit was not thrown down (or it opened him): ' + r.e.mode);
  until(r, () => r.e.mode === 'work', 120); ok(r.log.flings.length === 1 && r.show.cycle === c0, 'the throw outside a visit did not land, or it changed the scene'); }
{ const r = rig({ x: 250 }); let opened = 0; for (let i = 0; i < 60 * 60; i++) { r.hero.x = 250; r.hero.y = FLOOR; r.step(); if (M.pupOpen(r.e)) opened++; }
  ok(opened === 0, 'left alone for a minute he was open ' + opened + ' frames'); }
// ---- HIS TWO SLOW ATTACKS: told, taking turns, never both at once, a long gap between ----
{ const r = rig({ x: 300, noHarl: true, noBrute: true }); const born = new Map(); let both = 0, landed = 0, snared = 0, early = 0; const starts = [], ends = []; let busy0 = false;
  for (let i = 0; i < 60 * 70; i++) { r.hero.x = 300 + 80 * Math.sin(i / 120); const nb = r.log.bands.length, nh = r.log.hits.length; r.step();
    for (const d of r.show.drops) if (!born.has(d.id)) { born.set(d.id, i); if (d.len < 1.2) early++; }
    if (r.show.drops.length && r.show.snare) both++;
    for (const h of r.log.hits.slice(nh)) if (h.name === 'THE PROP DROP') { landed++; if (!h.opt.unblockable) early++; }
    for (const b of r.log.bands.slice(nb)) if (b[5] === 'THE SNARE LINE' && b[7] && b[7].snare > 0) snared++;
    const busy = !!(r.show.drops.length || r.show.snare); if (busy && !busy0) starts.push(i * DT); if (!busy && busy0) ends.push(i * DT); busy0 = busy; }
  const gaps = starts.slice(1).map((s, k) => s - ends[k]);
  ok(r.show.n.prop >= 3 && r.show.n.snare >= 3 && both === 0, 'his prop drop and snare line did not take turns (never both at once): ' + JSON.stringify({ prop: r.show.n.prop, snare: r.show.n.snare, both }));
  ok(landed >= 3 && early === 0 && P.drop.tell >= 1.2 && P.snare.tell >= 1.2, 'his prop drop is not told (a shadow >= 1.2 s) and unblockable, or the snare line is told under 1.2 s');
  ok(gaps.length >= 4 && Math.min(...gaps) >= 4 - 0.05 && Math.min(...P.over.gap) >= 3.5, 'his two attacks come without a long gap between (>= 4 s in phase 1, >= 3.5 s in any): ' + gaps.map(g => g.toFixed(1)) + ' / ' + P.over.gap);
  ok(snared > 0 && P.snare.speed <= 130, 'the snare line does not sweep slowly across the stage holding whoever it catches');
  ok(r.log.lines.some(l => l === 'THE SNARE LINE, LOW: JUMP IT' || l === 'THE SNARE LINE, HIGH: DUCK IT'), 'the snare line was never said'); }
{ const r = rig({ x: 300, noHarl: true, noBrute: true }); const kinds = new Set(); for (let i = 0; i < 60 * 70; i++) { r.step(); if (r.show.snare) kinds.add(r.show.snare.kind); }
  ok(kinds.has('low') && kinds.has('high'), 'the snare line does not come at both told heights: ' + [...kinds]);
  for (const k of ['low', 'high']) { const [t, b] = M.snareBand(k, FLOOR); const duck = { t: FLOOR - 10, b: FLOOR }, jump = { t: FLOOR - 44, b: FLOOR - 16 };
    ok(k === 'low' ? !M.bandCatches(k, FLOOR, jump) : !M.bandCatches(k, FLOOR, duck), 'the snare line ' + k + ' cannot be ' + (k === 'low' ? 'jumped' : 'ducked') + ' [' + t + ', ' + b + ']'); } }
// ---- THE SCENES ----
{ const seen = new Set(); for (let s = 1; s < 40; s++) { let q = (s * 2654435761) % 2147483647 || 1; for (let w = 0; w < 5; w++) q = (q * 16807) % 2147483647; const o = M.sceneOrder(() => (q = (q * 16807) % 2147483647) / 2147483647); ok(o.slice().sort().join() === '1,2,3,4', 'a fight\'s scene order is not the four scenes: ' + o); seen.add(o.join()); }
  ok(seen.size >= 8, 'the scene order hardly varies between fights (' + seen.size + ' orders in 39)');
  ok(M.SCENES.slice(1).map(s => s.key).join() === 'storm,night,inferno,sea', 'the four scenes are not STORM, NIGHT, INFERNO, SEA'); }
{ /* the wake brings the first scene; cycles 1 and 2 the next two; the finale's first puppet down brings the fourth */
  const r = rig({ x: 200, quiet: true }); r.show.order = [4, 1, 3, 2]; r.e.mode = 'wake'; r.e.modeT = 0.1; until(r, () => r.e.mode === 'work', 300);
  ok(r.show.scene === 4 && r.log.lines.includes('DROP BOTH PUPPETS: THE LEVER FREES'), 'the wake did not bring the first scene of the order (scene ' + r.show.scene + ')');
  const r2 = rig({ x: 300, hp: 230, quiet: true }); r2.show.order = [4, 1, 3, 2]; r2.show.scene = 3; r2.show.cycle = 2; r2.e.phase = 2; r2.step();
  const mp = r2.show.puppets.find(p => p.t === 'masterpiece'); r2.har.hp = 0; until(r2, () => !r2.show.change && r2.show.scene === 2, 240);
  ok(r2.show.shifted && r2.show.scene === 2 && r2.log.lines.includes('THE SCENE SHIFTS') && mp && !M.heaped(mp), 'the finale\'s first puppet down did not shift to the fourth scene mid-cycle (scene ' + r2.show.scene + ')'); }
{ /* STORM: told by the curtains, then the gust; the puppets drift with it */
  const r = rig({ x: 200, scene: 1, quiet: true, noHarl: true, bruX: 500 }); let tell = 0, on = 0, x0 = null, drift = 0;
  for (let i = 0; i < 60 * 12; i++) { r.hero.x = 200; r.step(); const G = r.show.gust; if (G && G.ph === 'tell') { tell++; x0 = r.bru.x; } if (G && G.ph === 'on') { on++; if (x0 !== null) drift = Math.max(drift, Math.abs(r.bru.x - x0)); } }
  ok(tell * DT >= 1.2 && on * DT >= 2 && r.log.lines.includes('THE WIND RISES: HOLD DOWN TO BRACE'), 'the storm\'s gust is not told >= 1.2 s, or never blows, or is not said: ' + JSON.stringify({ tell: tell * DT, on: on * DT }));
  ok(drift > 20, 'the gust did not push the puppets (' + drift.toFixed(1) + ' px)'); }
{ /* NIGHT: a spent puppet out of the spotlights cannot be hurt; in one it can */
  const r = rig({ x: 200, scene: 2, quiet: true, noHarl: true }); r.step(); ok(r.show.spots && r.show.spots.length === 2, 'the night has no spotlights');
  r.bru.mode = 'recover'; r.bru.modeT = 9; r.bru.x = r.show.spots[0].x; r.step(); const litOk = M.hurtable(r.bru);
  r.bru.x = (r.show.spots[0].x + r.show.spots[1].x) / 2; r.show.spots[0].v = r.show.spots[1].v = 0; r.step(); const darkOk = M.hurtable(r.bru) || !r.bru.dark;
  ok(litOk && !darkOk, 'at night a spent puppet is not hurt only in the light: ' + JSON.stringify({ litOk, darkOk, spots: r.show.spots.map(s => s.x), x: r.bru.x })); }
{ /* INFERNO: two sets of trapdoors take turns, each told; the strips between never burn */
  const r = rig({ x: 200, scene: 3, quiet: true, noHarl: true, noBrute: true }); let tellT = 0; const sets = [], cover = new Set();
  for (let i = 0; i < 60 * 16; i++) { const nh = r.log.hits.length; r.step(); if (r.show.trap && r.show.trap.ph === 'tell') tellT++;
    for (const h of r.log.hits.slice(nh)) if (h.name === 'THE TRAPDOOR FLAMES') { for (let x = h.box[0]; x < h.box[1]; x += 4) cover.add(Math.floor(x / TS) - SX); if (!sets.length || sets[sets.length - 1] !== r.show.trap.set) sets.push(r.show.trap.set); } }
  const strips = []; for (let c = 4; c <= 37; c++) if (!M.TRAPS.some(([a, b]) => c >= a && c <= b)) strips.push(c);
  ok(sets.length >= 3 && sets.every((s, k) => k === 0 || s !== sets[k - 1]) && tellT * DT >= 2 * 1.2, 'the inferno\'s trap sets do not take turns, told: ' + JSON.stringify({ sets, tell: tellT * DT }));
  ok(strips.length >= 5 && strips.every(c => !cover.has(c)), 'a strip between the traps burned: ' + strips.filter(c => cover.has(c))); }
{ /* SEA: a told wave rolls the stage, low */
  const r = rig({ x: 200, scene: 4, quiet: true, noHarl: true, noBrute: true }); let tell = 0, low = 0;
  for (let i = 0; i < 60 * 14; i++) { const nb = r.log.bands.length; r.step(); if (r.show.wave && r.show.wave.ph === 'tell') tell++; for (const b of r.log.bands.slice(nb)) if (b[5] === 'THE WAVE' && b[0] === 'low') low++; }
  ok(tell * DT >= 1.2 && low > 30 && r.show.n.wave >= 1 && r.log.lines.includes('A WAVE IN THE WINGS: JUMP IT'), 'the sea\'s wave is not told >= 1.2 s, or does not roll low across the stage: ' + JSON.stringify({ tell: tell * DT, low, n: r.show.n.wave })); }
{ /* ONE WINDUP AT A TIME: in every scene, no two tells (his or the scene's) run together */
  for (const sc of [1, 3, 4]) { const r = rig({ x: 300, scene: sc, noHarl: true, noBrute: true }); let two = 0;
    for (let i = 0; i < 60 * 60; i++) { r.hero.x = 300 + 100 * Math.sin(i / 100); r.step(); const S = r.show;
      const n = (S.drops.length ? 1 : 0) + (S.snare && S.snare.ph === 'tell' ? 1 : 0) + (S.gust && S.gust.ph === 'tell' ? 1 : 0) + (S.trap && S.trap.ph === 'tell' ? 1 : 0) + (S.wave && S.wave.ph === 'tell' ? 1 : 0); if (n > 1) two++; }
    ok(two === 0, 'scene ' + M.SCENES[sc].key + ': two tells ran together ' + two + ' frames'); } }
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
{ const r = rig({ hp: 230, x: 300, quiet: true }); r.e.phase = 2; r.show.order = [1, 2, 3, 0]; r.step();
  ok(r.e.phase === 3 && r.bru.mode === 'packed' && !M.heaped(r.har) && r.log.summons === 1, 'phase 3: the Brute was not packed away for the masterpiece, or the Harlequin went too');
  const mp = r.show.puppets.find(p => p.t === 'masterpiece'); ok(mp && mp.maxHp === P.master.hp && mp.str.length === 4, 'the masterpiece has not its health and four strings');
  if (mp) { until(r, () => mp.mode === 'hang', 300); mp.hp = 0; r.har.hp = 0; ok(until(r, () => r.e.mode === 'slack', 200) && r.show.free, 'phase 3: the masterpiece and the Harlequin down did not free the lever'); } }
// ---- EVERY ATTACK FIRES; THE MARKS ----
{ const fired = {}; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const ph of [1, 2, 3]) { const r = rig({ hp: ph === 1 ? 720 : ph === 2 ? 450 : 200, x: 420 }); if (ph > 1) r.e.phase = ph - 1;
    for (let i = 0; i < 60 * 90; i++) { if (i % 120 === 0) { r.hero.x = A.x0 + 60 + rnd() * (A.x1 - A.x0 - 120); r.hero.y = ph > 1 && rnd() < 0.3 ? FLOOR - 48 : FLOOR; const mp = r.show.puppets.find(p => p.t === 'masterpiece'); if (ph === 3 && mp && rnd() < 0.5) { r.hero.x = mp.x + (rnd() < 0.5 ? -40 : 40); r.hero.y = FLOOR; } } r.step();
      for (const k of ['jab', 'kick', 'chop', 'slam', 'grab', 'swat', 'stomp', 'reach', 'prop', 'snare']) if (r.show.n[k]) fired[k] = true; } }
  for (const k of ['jab', 'kick', 'chop', 'slam', 'grab', 'swat', 'stomp', 'reach', 'prop', 'snare']) ok(fired[k], 'THE ' + k.toUpperCase() + ' never fired in a fuzz of the three phases (rule A3)'); }
const ROWS = { 'harlequin|jabTell': ['!', 'block', 'low'], 'harlequin|kickTell': ['!!', 'jump', 'low'], 'marionette|chopTell': ['!!', 'dodge', 'low'], 'marionette|slamTell': ['!!', 'jump', 'low'],
  'marionette|grabTell': ['!!', 'dodge', 'low'], 'masterpiece|swatTell': ['!', 'block', 'low'], 'masterpiece|stompTell': ['!!', 'dodge', 'low'], 'masterpiece|reachTell': ['!!', 'duck', 'high'],
  'puppeteer|snareLowTell': ['!!', 'jump', 'low'], 'puppeteer|snareHighTell': ['!!', 'duck', 'high'], 'puppeteer|dropTell': ['!!', 'dodge', 'low'] };
for (const [k, [m, a, hgt]] of Object.entries(ROWS)) { ok(MARK[k] === m, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + m); ok(ANSWER[k] === a, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + a); ok(HEIGHT[k] === hgt, k + ' is ' + JSON.stringify(HEIGHT[k]) + ', not ' + hgt); }
{ const r = rig({ x: 300, noHarl: true, noBrute: true }); const casts = new Set(); for (let i = 0; i < 60 * 40; i++) { r.step(); if (r.e.cast) casts.add(r.e.cast); }
  ok(['dropTell', 'snareLowTell', 'snareHighTell'].every(k => casts.has(k)), 'his two attacks are not told under the modes their marks are filed by: ' + [...casts]); }
// ---- THE STAGE ----
{ const lv = LEVELS.find(l => l.id === 'theatre'); ok(lv && !lv.hidden, 'the Maskwright Theatre (his stage) is missing or hidden');
  if (lv) { const L = lv.build(), A2 = L.arena; ok(A2 && A2.boss === 'puppeteer' && A2.music === 'puppeteer', 'the stage is not his arena with his music');
    const w = A2.wallR - A2.wallL; ok(w >= 36 && w <= 44, 'the stage is ' + w + ' wide');
    ok(A2.trigger > (A2.wallL + 1) * 16 && L.ents.some(e => e.t === 'check' && e.x < A2.wallL), 'the trigger is not past the door, or no checkpoint stands outside');
    ok(L.ents.filter(e => e.t === 'puppeteer').length === 1 && L.ents.some(e => e.t === 'marionette') && L.ents.some(e => e.t === 'harlequin'), 'he and his duo are not on the stage');
    ok((L.moversExtra || []).some(m => m.batten), 'the stage has no batten');
    let under = 0; for (let x = A2.wallL + 1; x < A2.wallR; x++) if (L.grid[(A2.stage.R + 2) * L.W + x] === 1) under++; ok(under >= 36, 'row R+2 under the stage is not solid: ' + under); } }

// ---- IN THE PAGE ----
if (process.argv.includes("--no-page")) { for (const b of bad) console.log("  - " + b); console.log(bad.length ? 'PURE: ' + bad.length + ' problem(s)' : 'ok  puppeteer (pure part)'); process.exit(bad.length ? 1 : 0); }
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js'),PMm=await import('/src/puppeteer.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    let seed=4242;const real=Math.random;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};   /* (a pinned dice for the whole page section) */
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='theatre'));BK.state='play';BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};
    const e=boot(),PH=BK.puppeteerHands(),S=PH.show(),A=BK.L.arena,P=BK.P,bat=S.batten;S.overCd=1e9;
    out.woke=BK.bossActive&&e&&e.t==='puppeteer';out.iron=PH.read().iron;for(let i=0;i<240&&PH.read().sceneKey==='bare';i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}out.scene=PH.read().sceneKey;
    /* THE LEVER, CHAINED: a real swing at it from the batten clunks; the batten stays down */
    P.x=A.stage.pinX-12;P.y=A.floor;P.face=1;P.vx=0;BK.sim(2);P.face=1;BK.press('atk');BK.sim(16);out.locked={free:S.free,bat:bat.st,n:S.n.locked};
    const bru=S.puppets.find(p=>p.t==='marionette'),har=S.puppets.find(p=>p.t==='harlequin');
    for(const p of S.puppets)p.dark=false;S.spots=null;
    bru.mode='hang';const hp0=bru.hp;BKT.hurtEnemy(bru,20,bru.x-10,false);out.clank={lost:hp0-bru.hp,clanks:S.n.clank};
    bru.mode='recover';bru.modeT=9;bru.dark=false;const hp1=bru.hp;BKT.hurtEnemy(bru,20,bru.x-10,false);out.body={lost:hp1-bru.hp,alive:bru.alive,flash:bru.flash>0};
    const bh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.ward=bh-e.hp;
    /* a real swing across the Brute's arm string, in his green recovery */
    har.x=A.x1-30;S.gap=9;let q=null;for(let i=0;i<30;i++){bru.mode='recover';bru.modeT=9;BK.sim(1);bru.dark=false;q=PMm.stringsOf(e,S).find(s=>s.p===bru&&s.k==='arm');}
    P.x=q.x1-14;P.y=A.floor;P.face=1;P.vx=0;BK.sim(2);const l0=bru.str.filter(s=>!s.cut).length;bru.dark=false;BK.press('atk');BK.sim(14);out.swing={l0,l1:bru.str.filter(s=>!s.cut).length};
    for(const p of [bru,har])p.hp=0;let f=0;for(;f<400&&e.mode!=='slack';f++)BK.sim(1);for(let i=0;i<120;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}
    out.slack={mode:e.mode,open:BK.bossOpen(e),free:S.free,y:e.y,gal:A.stage.gallery};
    /* THE LEVER, FREE: a real swing from the batten sends it up; step off onto the gallery */
    P.x=bat.x+bat.w-7;P.y=bat.y;P.vx=0;P.vy=0;P.face=1;BK.sim(3);P.face=1;BK.press('atk');let rose=false;for(let i=0;i<90;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);if(bat.st==='up'){rose=true;break;}}
    out.ride={rose,st:bat.st,pin:S.n.pin};
    P.x=A.stage.gx0+24;P.y=A.stage.gallery;P.vx=0;P.vy=0;for(let i=0;i<30&&e.mode!=='staggered';i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}
    out.stagger={mode:e.mode,open:BK.bossOpen(e),y:e.y,gal:A.stage.gallery};
    const oh=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.open={dmg:oh-e.hp};
    for(let i=0;i<12;i++)BKT.hurtEnemy(e,50,e.x-10,false);out.visit={lost:oh-e.hp,cap:Math.round(e.maxHp*PMm.PUP.visitCap),mode:e.mode};
    let thrown=false;for(let i=0;i<60*4;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);if(P.ground&&Math.abs(P.y-A.floor)<4){thrown=true;break;}}out.knock={thrown,y:P.y,floor:A.floor,n:S.n.knock};
    for(let i=0;i<60*3&&e.mode!=='work';i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}out.after={mode:e.mode,cycle:S.cycle,scene:PH.read().sceneKey,free:S.free};
    const e3=boot();e3.hp=1;e3.mode='staggered';e3.openT=3;BK.puppeteerHands().show().visitLeft=99;BKT.hurtEnemy(e3,99,e3.x-10,false);for(let i=0;i<200&&BK.bossActive;i++){BK.P.inv=99;BK.sim(1);}
    const S3=BK.puppeteerHands().show();out.death={alive:e3.alive,active:BK.bossActive,curtain:S3.curtain>0};
    Math.random=real;
    /* THE HUMAN BOT: one whole fight, the knight at the level's depth with no skills, normal health (bossLab pins its own dice per row) */
    {const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG;P0.xp.knight=xpFloor(${DEPTH});P0.card={...(P0.card||{}),knight:(await import('/src/progression.js')).evenCard(${DEPTH})};P0.skillOwned.knight={};P0.loadouts.knight=[];if(P0.talents)P0.talents.knight={};}
    const o=await BK.bossLab({bosses:['theatre'],heroes:['knight'],healthMode:'normal',maxSecs:300,salt:3});const row=o.rows[0];
    out.bot={out:row.outcome,taken:Math.round(row.health.damageTaken),secs:row.secs};
    return out;})()`, 900000);
  ok(r.woke, 'the fight did not wake past the stage door');
  ok(r.iron >= 30, 'the fly gallery does not wear the iron grating (' + r.iron + ')');
  ok(['storm', 'night', 'inferno', 'sea'].includes(r.scene), 'the fight did not open on one of the four scenes: ' + r.scene);
  ok(r.locked.free === false && r.locked.bat === 'down' && r.locked.n >= 1, 'a real swing at the CHAINED lever did more than clunk: ' + JSON.stringify(r.locked));
  ok(r.clank.lost === 0 && r.clank.clanks >= 1, 'a blow on the Brute outside his green window took his health (or did not clank): ' + JSON.stringify(r.clank));
  ok(r.body.lost === 20 && r.body.alive && r.body.flash, 'a blow on the Brute in his green window did not take its health: ' + JSON.stringify(r.body));
  ok(r.ward > 0 && r.ward <= Math.ceil(50 * P.ward) + 2, 'a blow on him hanging was not warded at ' + P.ward + ' (' + r.ward + ' of 50)');
  ok(r.swing.l1 === r.swing.l0 - 1, 'a real swing across the Brute\'s green string did not cut it: ' + JSON.stringify(r.swing));
  ok(r.slack.mode === 'slack' && !r.slack.open && r.slack.free && Math.abs(r.slack.y - r.slack.gal) < 2, 'both puppets down, the lever is not free with him on the gallery - or he is open: ' + JSON.stringify(r.slack));
  ok(r.ride.rose && r.ride.pin >= 1, 'a real swing at the FREE lever did not send the batten up: ' + JSON.stringify(r.ride));
  ok(r.stagger.mode === 'staggered' && r.stagger.open && r.stagger.y === r.stagger.gal, 'up on the gallery he did not stagger, open, on the gallery: ' + JSON.stringify(r.stagger));
  ok(r.open.dmg >= Math.floor(50 * P.openMul) - 2, 'a blow in his stagger did not land whole: ' + JSON.stringify(r.open));
  ok(r.visit.lost <= r.visit.cap && r.visit.lost >= r.visit.cap - 2, 'one visit took more (or much less) than its share of him: ' + JSON.stringify(r.visit));
  ok(r.knock.thrown && r.knock.n >= 1, 'the knockback did not put the hero back on the boards: ' + JSON.stringify(r.knock));
  ok(r.after.mode === 'work' && r.after.cycle === 1 && r.after.free === false && r.after.scene !== r.scene, 'after the visit the next cycle did not begin on a new scene with the lever chained: ' + JSON.stringify(r.after) + ' (was ' + r.scene + ')');
  ok(!r.death.alive && !r.death.active && r.death.curtain, 'his death did not end the fight and bring the curtain down: ' + JSON.stringify(r.death));
  ok(r.bot.out === 'win' && r.bot.taken >= 10, 'the human bot (knight, salt 3) (L' + DEPTH + ') did not win while taking real damage: ' + JSON.stringify(r.bot));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }

if (bad.length) { console.log('PUPPETEER: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  puppeteer  the duo, the green window (clank otherwise; the gold cancel; limp limbs), the chained lever (free when both are down), the visit (staggered on the gallery, a third of him at most, the told knockback, no fall), his two slow attacks (told, in turn, a long gap), the four scenes in a shuffled order (storm, night, inferno, sea; the finale\'s shift), one windup at a time, the phases, every attack, the stage, and in the page with the human bot');
