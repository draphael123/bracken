// tools/harvest-fair.mjs - THE HARVEST FAIR (claude/fair1, L1: brief + greybox + THE FACING MECHANIC). docs/briefs/harvest-fair.md.
// The rule of the level: DON'T TURN YOUR BACK ON THEM. Its engine is the FACING RULE (src/mummer.js + its hook in src/main.js), reusable by any level:
//   PURE (src/mummer.js, no page):
//     - WHO IS LOOKING: a hero looks at a foe when he faces its side, is alive and near enough on the screen; a dead hero looks at nothing;
//       CO-OP: the foe is frozen if ANY hero faces it, and it only moves when EVERY hero has his back to it
//     - THE MUMMER moves ONLY while nobody faces it: over a long run with the hero turning at random it never moves a pixel on a frame it was faced;
//       it FREEZES the frame it is looked at and creeps again when the hero turns away; its cap bells JINGLE while it creeps (and only then);
//       within strike reach its mask GLOWS RED for a told beat before it strikes, and a look cancels the strike
//     - THE HOBBY-HORSE charges the moment the hero's back is turned (after a told wind-up a look cancels), commits to the charge even if the hero
//       then turns, FREEZES where the charge ends, and does not charge again until it has been looked at
//     - THE CAROUSEL turns a rider only after its warning
//   THE LEVEL (src/harvest-fair.js, wired in src/level.js and the map in src/main.js):
//     - it exists, sits between WAYMEET and THE HEXED FIELDS (the Fields need it), has its rule, its brief and a map node between the two
//     - every section holds a designed encounter of the facing rule (a mummer or the horse), the arc teach -> develop -> twist -> combine -> exam is
//       all there (a lone mummer, a pincer on a climb, the carousel, the horse over haystacks, an exam), there are haystack bouncers, and the green
//       (the boss room, greybox) has its door and a checkpoint before it
//   IN THE PAGE: a mummer in the real game does not move while faced, moves when the hero's back is turned, is HIT while frozen and dies in about
//     three blows, the bells cue, the horse charges on a back-turn and stands where it ends, co-op any-hero-facing freezes, the carousel turns the hero
//   node tools/harvest-fair.mjs        (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import * as M from '../src/mummer.js';
import * as WQ from '../src/wicker-queen.js';
import { LEVELS } from '../src/level.js';
import { THREAT, measureLevel, indexOf, spanOf } from '../src/threat.js';
import * as FA from '../src/redraw/fair_world.js';
import * as FGM from '../src/fair-games.js';
import * as FK from '../src/fair-keys.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60;
const hero = (x, face, o = {}) => ({ x, y: 400, face, alive: true, ...o });
const world = hs => ({ heroes: hs, canStep: () => true });

// ---- WHO IS LOOKING ----
{ const e = { x: 200, y: 400 };
  ok(M.looks(e, hero(100, 1)), 'a hero facing right at a foe on his right does not look at it');
  ok(!M.looks(e, hero(100, -1)), 'a hero facing away (left) looks at a foe on his right');
  ok(M.looks({ x: 50, y: 400 }, hero(100, -1)), 'a hero facing left does not look at a foe on his left');
  ok(!M.looks(e, hero(100, 1, { alive: false })), 'a dead hero looks at a foe');
  ok(!M.looks({ x: 100 + M.MUMMER.sight + 40, y: 400 }, hero(100, 1)), 'a hero looks at a foe past the screen (sight)');
  ok(!M.looks({ x: 200, y: 400 - M.MUMMER.sightY - 40 }, hero(100, 1)), 'a hero looks at a foe on a different storey');
  // THE MAYPOLE RIBBON: reach 1.5 makes the look reach half as far again, and only for the one who carries it
  { const far = { x: 100 + Math.round(M.MUMMER.sight * 1.25), y: 400 }, tall = { x: 200, y: 400 - Math.round(M.MUMMER.sightY * 1.25) };
    ok(!M.looks(far, hero(100, 1)) && M.looks(far, hero(100, 1, { reach: M.RIBBON_REACH })), 'the ribbon does not stretch the look sideways by half');
    ok(!M.looks(tall, hero(100, 1)) && M.looks(tall, hero(100, 1, { reach: M.RIBBON_REACH })), 'the ribbon does not stretch the look up by half');
    ok(!M.looks({ x: 100 + M.MUMMER.sight * 1.6, y: 400 }, hero(100, 1, { reach: M.RIBBON_REACH })), 'the ribbon reaches past half again');
    ok(!M.looks({ x: 100 - 40, y: 400 }, hero(100, 1, { reach: M.RIBBON_REACH })), 'the ribbon lets a hero look backwards');
    ok(M.RIBBON_REACH === 1.5, 'the ribbon is not +50%: ' + M.RIBBON_REACH);
    const q = { x: 100 + Math.round(WQ.WQ.nearR * 1.3), y: 400, phase: 2 };
    ok(!WQ.wqSeen(q, [hero(100, 1)]) && WQ.wqSeen(q, [hero(100, 1, { reach: M.RIBBON_REACH })]), 'the ribbon does not reach her phase-2 cone (96 px) half as far again'); }
  // CO-OP: any hero facing it freezes it; only when every hero has his back to it does it move
  ok(M.facedBy(e, [hero(100, -1), hero(300, -1)]), 'co-op: a foe with one hero facing away and the other facing it is not faced');
  ok(!M.facedBy(e, [hero(100, -1), hero(300, 1)]), 'co-op: a foe with both heroes facing away is faced');
  ok(M.facedBy(e, [hero(100, 1), hero(300, 1)]), 'co-op: one hero facing it does not freeze it');
  ok(M.facedBy(e, [hero(100, 1), hero(90, 1, { alive: false })]), 'co-op: a dead partner unfroze a foe the live hero is facing'); }

// ---- THE MUMMER: moves ONLY while nobody faces it ----
const mk = (x = 400, o = {}) => Object.assign(M.newMummer(x, 400), o);
{ const s = mk(400), hs = [hero(100, -1)]; let bells = 0, x0 = s.x;   // hero at 100 facing LEFT (away): the mummer at 400 is behind him
  for (let i = 0; i < 180; i++) for (const v of M.mummerStep(s, world(hs), DT)) if (v.t === 'bell') bells++;
  ok(s.mode === 'creep' && s.vx < 0, 'a mummer behind a hero with his back turned does not creep toward him: ' + s.mode);
  const move = s.vx * DT; void move;
  ok(bells >= 3, 'a creeping mummer\'s bells did not jingle (' + bells + ' in 3 s)');
  // it actually advances when the host integrates vx (the game does): simulate that
  const t = mk(400); let px = 400; for (let i = 0; i < 120; i++) { M.mummerStep(t, world([hero(100, -1)]), DT); px += t.vx * DT; }
  ok(px < 400 - 40, 'a mummer with the hero\'s back turned covered only ' + Math.round(400 - px) + ' px in 2 s');
  hs[0].face = 1;   // he turns and looks
  let frozen = null, ev = []; for (let i = 0; i < 5; i++) ev.push(...M.mummerStep(s, world(hs), DT));
  ok(s.mode === 'still' && s.vx === 0, 'a mummer that is looked at does not freeze: ' + s.mode + ' vx ' + s.vx);
  ok(ev.some(v => v.t === 'freeze'), 'no freeze event when a mummer is looked at');
  let bellsFrozen = 0; for (let i = 0; i < 120; i++) for (const v of M.mummerStep(s, world(hs), DT)) if (v.t === 'bell') bellsFrozen++;
  ok(bellsFrozen === 0, 'a frozen mummer jingled (' + bellsFrozen + ' bells): the bell is the cue that it MOVES');
  hs[0].face = -1; for (let i = 0; i < 4; i++) M.mummerStep(s, world(hs), DT); ok(s.mode === 'creep', 'a mummer does not creep again when the hero turns away'); void frozen; }
{ // the fuzz: the hero turns at random; on EVERY frame it was faced, the mummer's velocity is zero
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const s = mk(350), h = hero(100, 1); let movedWhileFaced = 0, movedWhileBack = 0, x = 350;
  for (let i = 0; i < 60 * 60; i++) { if (rnd() < 0.02) h.face = -h.face; if (rnd() < 0.01) h.x += (rnd() - 0.5) * 30;
    const faced = M.facedBy(s, [h]); M.mummerStep(s, world([h]), DT); const dx = s.vx * DT; x += dx;
    if (faced && Math.abs(s.vx) > 0) movedWhileFaced++; if (!faced && Math.abs(s.vx) > 0) movedWhileBack++;
    if (Math.abs(x - h.x) < 12) { x = 350; s.x = 350; s.mode = 'still'; } else s.x = x; }
  ok(movedWhileFaced === 0, 'a mummer moved on ' + movedWhileFaced + ' frames it was faced (the whole rule)');
  ok(movedWhileBack > 60, 'the fuzz never let a mummer move (' + movedWhileBack + ' frames): the test measured nothing'); }
{ // strike reach: the mask GLOWS for a told beat, then strikes; a look cancels; nothing happens while faced
  const h = hero(100, -1), s = mk(100 + M.MUMMER.reach - 4); let glowAt = null, strikeAt = null, t = 0;
  for (let i = 0; i < 120 && strikeAt === null; i++) { t = i * DT; for (const v of M.mummerStep(s, world([h]), DT)) { if (v.t === 'glow' && glowAt === null) glowAt = t; if (v.t === 'strike') strikeAt = t; } }
  ok(glowAt !== null && strikeAt !== null, 'a mummer at reach with the hero\'s back turned did not glow and strike');
  ok(strikeAt - glowAt >= M.MUMMER.glow - 0.05 && M.MUMMER.glow >= 0.4, 'the red glow is not a told beat: ' + (strikeAt - glowAt).toFixed(2) + ' s (glow ' + M.MUMMER.glow + ')');
  const s2 = mk(100 + M.MUMMER.reach - 4); let struck = false; for (let i = 0; i < 20; i++) M.mummerStep(s2, world([h]), DT);
  ok(s2.mode === 'glow', 'the mask is not in its glow inside reach: ' + s2.mode);
  h.face = 1; for (let i = 0; i < 120; i++) for (const v of M.mummerStep(s2, world([h]), DT)) if (v.t === 'strike') struck = true;
  ok(!struck && s2.mode === 'still', 'a look during the glow did not cancel the strike'); }
{ // CO-OP in the step: one hero facing it holds it, even with the other's back turned and nearer
  const s = mk(400); for (let i = 0; i < 90; i++) M.mummerStep(s, world([hero(390 - 200, 1), hero(300, -1)]), DT);
  ok(s.mode === 'still' && s.x === 400, 'co-op: a mummer moved with one hero facing it: ' + s.mode); }

// ---- THE HOBBY-HORSE: charges on a back-turn, freezes where the charge ends ----
const mkH = (x = 500) => M.newHorse(x, 400);
{ const s = mkH(500), h = hero(300, -1); let wind = null, charge = null, end = null, x = 500, maxV = 0, winded = 0;
  for (let i = 0; i < 60 * 6; i++) { const evs = M.horseStep(s, world([h]), DT); for (const v of evs) { if (v.t === 'rear') wind = wind ?? i; if (v.t === 'charge') charge = charge ?? i; if (v.t === 'end') end = end ?? i; }
    if (s.mode === 'rear') winded++; x += s.vx * DT; maxV = Math.max(maxV, Math.abs(s.vx)); if (i === 40) h.face = 1; if (i === 46) h.face = -1; }   // he turns to look mid charge: it commits anyway
  ok(wind !== null && charge !== null && charge > wind, 'the horse did not wind up and then charge when the hero\'s back was turned');
  ok(winded >= 0.3 * 60, 'the horse\'s wind-up is not a told beat (' + winded + ' frames)');
  ok(end !== null && s.mode === 'still' && s.vx === 0, 'the horse did not freeze where its charge ended: ' + s.mode);
  ok(500 - x >= M.HORSE.dist - 30 && 500 - x <= M.HORSE.dist + 60, 'the horse\'s charge covered ' + Math.round(500 - x) + ' px, not ~' + M.HORSE.dist);
  ok(maxV >= M.HORSE.charge - 1, 'the horse never reached its charge speed');
  // it does not charge again until it has been looked at: back turned again, nothing
  let again = false; h.face = -1; s.x = x; for (let i = 0; i < 180; i++) for (const v of M.horseStep(s, world([{ ...h, x: s.x - 120 }]), DT)) if (v.t === 'rear' || v.t === 'charge') again = true;
  ok(!again, 'the horse charged a second time without being looked at in between');
  const looked = { ...h, x: s.x - 120, face: 1 }; M.horseStep(s, world([looked]), DT);
  let third = false; for (let i = 0; i < 120; i++) for (const v of M.horseStep(s, world([{ ...looked, face: -1 }]), DT)) if (v.t === 'charge') third = true;
  ok(third, 'a horse that was looked at does not charge again when the back is turned'); }
{ const s = mkH(500), h = hero(300, -1); let charged = false, aborted = false;   // a look during the wind-up cancels it
  for (let i = 0; i < 12; i++) M.horseStep(s, world([h]), DT); ok(s.mode === 'rear', 'the horse is not winding up 0.2 s after the back turned: ' + s.mode);
  h.face = 1; for (let i = 0; i < 60; i++) for (const v of M.horseStep(s, world([h]), DT)) { if (v.t === 'charge') charged = true; if (v.t === 'freeze') aborted = true; }
  ok(!charged && aborted && s.mode === 'still', 'a look during the wind-up did not stop the charge'); }
{ const s = mkH(500); let charged = false; for (let i = 0; i < 120; i++) for (const v of M.horseStep(s, world([hero(300, 1)]), DT)) if (v.t === 'charge') charged = true;
  ok(!charged && s.mode === 'still', 'the horse charged a hero who was facing it');
  const c = mkH(500); let cc = false; for (let i = 0; i < 120; i++) for (const v of M.horseStep(c, world([hero(300, 1), hero(700, -1)]), DT)) if (v.t === 'charge') cc = true;
  ok(!cc, 'co-op: the horse charged with one hero facing it'); }
{ const s = mkH(500), blocked = { heroes: [hero(300, -1)], canStep: x => x > 400 }; let end = null, x = 500;   // a wall or an edge ends the charge there
  for (let i = 0; i < 240 && end === null; i++) { for (const v of M.horseStep(s, blocked, DT)) if (v.t === 'end') end = i; x += s.vx * DT; s.x = x; }
  ok(end !== null && x > 380, 'a charge does not stop at the edge it reaches: x ' + Math.round(x)); }

// ---- THE CAROUSEL turns only after its warning ----
{ const c = M.newCarousel(), evs = []; let turned = null, warned = null;
  for (let i = 0; i < 60 * 10; i++) for (const v of M.carouselStep(c, { period: 5, warn: 1.2 }, true, DT)) { evs.push(v.t); if (v.t === 'warn' && warned === null) warned = i; if (v.t === 'turn' && turned === null) turned = i; }
  ok(warned !== null && turned !== null && warned < turned && (turned - warned) / 60 >= 1.0, 'the carousel turned a rider without a warning of a second or more (warn at ' + warned + ', turn at ' + turned + ')');
  const c2 = M.newCarousel(); let any = false; for (let i = 0; i < 60 * 12; i++) if (M.carouselStep(c2, { period: 5, warn: 1.2 }, false, DT).length) any = true;
  ok(!any, 'the carousel turned nobody who was not on it'); }

// ---- THE MARIONETTE (claude/fairfix, src/fair-foes.js): THE RULE INSIDE OUT - it moves ONLY while a hero looks at it ----
const FF = await import('../src/fair-foes.js'), { DUCK_H } = await import('../src/duck.js');
{ let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const s = FF.newMarionette(350, 400), h = hero(100, 1); let movedUnseen = 0, movedSeen = 0, x = 350;
  for (let i = 0; i < 60 * 60; i++) { if (rnd() < 0.02) h.face = -h.face; const seen = FF.worked(s, [h]); FF.marionetteStep(s, world([h]), DT); x += s.vx * DT;
    if (!seen && s.vx) movedUnseen++; if (seen && s.vx) movedSeen++;
    if (Math.abs(x - h.x) < 30) { x = 350; s.x = 350; s.mode = 'hang'; } else s.x = x; }
  ok(movedUnseen === 0, 'a marionette moved on ' + movedUnseen + ' frames nobody looked at it (the whole rule)');
  ok(movedSeen > 60, 'the fuzz never let a marionette move (' + movedSeen + ' frames): the test measured nothing');
  ok(FF.MARIONETTE.walk > M.MUMMER.creep, 'the marionette is not quicker than a mummer creeps: holding a mummer must bring it on fast'); }
{ const h = hero(100, 1), s = FF.newMarionette(100 + FF.MARIONETTE.reach - 4, 400); let jerkAt = null, cutAt = null, box = null;
  for (let i = 0; i < 120 && cutAt === null; i++) for (const v of FF.marionetteStep(s, world([h]), DT)) { if (v.t === 'jerk' && jerkAt === null) jerkAt = i; if (v.t === 'strike') { cutAt = i; box = v.box; } }
  ok(jerkAt !== null && cutAt !== null && (cutAt - jerkAt) / 60 >= 0.4, 'the marionette does not jerk (a told beat of 0.4 s or more) before it cuts: ' + jerkAt + ' -> ' + cutAt);
  ok(box && box[3] <= 400 - DUCK_H, 'the marionette\'s cut reaches the floor: a ducking hero (HEIGHT high) must let it over him: ' + JSON.stringify(box));
  const s2 = FF.newMarionette(100 + FF.MARIONETTE.reach - 4, 400); let cut = false; for (let i = 0; i < 12; i++) FF.marionetteStep(s2, world([h]), DT);
  ok(s2.mode === 'jerk', 'the marionette is not jerking inside reach while looked at: ' + s2.mode);
  const away = hero(100, -1); for (let i = 0; i < 90; i++) for (const v of FF.marionetteStep(s2, world([away]), DT)) if (v.t === 'strike') cut = true;
  ok(!cut && s2.mode === 'hang', 'turning your back during the jerk did not let the strings go slack (it cut anyway)'); }
{ const s = FF.newMarionette(400, 400); FF.marionetteStep(s, world([hero(100, -1), hero(700, 1)]), DT); FF.marionetteStep(s, world([hero(100, -1), hero(700, 1)]), DT);
  ok(s.mode === 'hang' && s.vx === 0, 'co-op: a marionette moved with every back turned');
  FF.marionetteStep(s, world([hero(100, -1), hero(700, 1)]), DT); FF.marionetteStep(s, world([hero(100, 1), hero(700, 1)]), DT); FF.marionetteStep(s, world([hero(100, 1), hero(700, 1)]), DT);
  ok(s.mode === 'walk' && s.vx < 0, 'co-op: one hero looking does not work its strings');
  const t = FF.newMarionette(400, 400); for (let i = 0; i < 3; i++) FF.marionetteStep(t, world([hero(500, 1, { mirror: true })]), DT);
  ok(t.mode === 'walk', 'the hall\'s true glass (the mirror look) does not work a marionette at a hero\'s back');
  const d = FF.newMarionette(400, 400); for (let i = 0; i < 3; i++) FF.marionetteStep(d, { heroes: [hero(280, 1)], canStep: () => true, sight: 88, sightY: 88 }, DT);
  ok(d.mode === 'hang', 'in the dark (a look of 88 px) a marionette 120 px off was still worked'); }
// ---- THE BARKER (claude/fairfix): a told call that turns every hero in range to face him; a told cane ----
{ const b = FF.newBarker(400, 400), hs = [hero(250, -1), hero(560, 1), hero(700, -1)]; let tellAt = null, callAt = null, turned = null;
  for (let i = 0; i < 60 * 6 && callAt === null; i++) for (const v of FF.barkerStep(b, world(hs), DT)) { if (v.t === 'callTell' && tellAt === null) tellAt = i; if (v.t === 'call') { callAt = i; turned = v.turned; } }
  ok(tellAt !== null && callAt !== null && (callAt - tellAt) / 60 >= 0.6, 'the barker\'s call is not told (a wind-up of 0.6 s or more): ' + tellAt + ' -> ' + callAt);
  ok(turned && turned.length === 2 && turned.includes(hs[0]) && turned.includes(hs[1]) && !turned.includes(hs[2]), 'the call does not turn every hero in range (co-op) and nobody out of it: ' + (turned && turned.map(h => h.x)));
  ok(FF.callFace(b, hs[0]) === 1 && FF.callFace(b, hs[1]) === -1, 'the call does not turn a hero to face the barker');
  const c = FF.newBarker(400, 400), near = hero(400 - FF.BARKER.caneReach + 6, 1); let ct = null, cane = null;
  for (let i = 0; i < 120 && cane === null; i++) for (const v of FF.barkerStep(c, world([near]), DT)) { if (v.t === 'caneTell' && ct === null) ct = i; if (v.t === 'cane') cane = i; }
  ok(ct !== null && cane !== null && (cane - ct) / 60 >= 0.4, 'the barker\'s cane is not told (0.4 s or more): ' + ct + ' -> ' + cane); }
// ---- THE HORSE IN THE DARK (claude/fairfix, the door guard's unlit stretch): it finds you only from twice as far as you can see it ----
{ const s = M.newHorse(500, 400); for (let i = 0; i < 30; i++) M.horseStep(s, { heroes: [hero(500 - 250, -1)], canStep: () => true, sight: 88, sightY: 88, near: 176 }, DT);
  ok(s.mode === 'still', 'a horse in the dark reared at a hero 250 px off (it should find him only within 176)');
  const t = M.newHorse(500, 400); for (let i = 0; i < 12; i++) M.horseStep(t, { heroes: [hero(500 - 150, 1)], canStep: () => true, sight: 88, sightY: 88, near: 176 }, DT);
  ok(t.mode === 'rear', 'a horse in the dark did not rear at a hero 150 px off who faces it but cannot see it (the dark look is 88): ' + t.mode); }

// ---- THE LEVEL ----
const fi = LEVELS.findIndex(l => l.id === 'fair'), fair = LEVELS[fi], fields = LEVELS.find(l => l.id === 'fields'), way = LEVELS.find(l => l.id === 'waymeet');
ok(!!fair, 'there is no level with id "fair" in LEVELS');
if (fair) {
  ok(fair.needs === 'theatre', 'the fair does not need THE MASKWRIGHT\'S THEATRE (claude/theatre: the playhouse stands between Waymeet and the fair now): ' + fair.needs);
  ok(fields && fields.needs === 'fair', 'THE HEXED FIELDS do not need the fair: ' + (fields && fields.needs));
  ok(way && way.needs === 'causeway', 'Waymeet\'s road changed');
  ok(/DON'T TURN YOUR BACK ON THEM/.test(fair.rule || ''), 'the level\'s rule is not DON\'T TURN YOUR BACK ON THEM: ' + fair.rule);
  ok(/HARVEST FAIR/.test(fair.name || ''), 'the level is not called THE HARVEST FAIR');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const nodes = src.slice(src.indexOf('const INLAND_NODES'), src.indexOf('const INLAND_PATH'));
  const ids = [...nodes.matchAll(/id: '([a-z]+)', kind: 'level'/g)].map(m => m[1]);
  ok(ids.indexOf('waymeet') >= 0 && ids.indexOf('theatre') === ids.indexOf('waymeet') + 1 && ids.indexOf('fair') === ids.indexOf('theatre') + 1 && ids.indexOf('fields') === ids.indexOf('fair') + 1, 'the map does not run Waymeet, the theatre, the fair, the Hexed Fields in that order: ' + ids.join(','));
  ok(existsSync(new URL('../docs/briefs/harvest-fair.md', import.meta.url)), 'docs/briefs/harvest-fair.md (the brief) is not committed');
  const L = fair.build(), T = { BOUNCER: 10, SPIKE: 3 }, TS = 16;
  const facers = L.ents.filter(e => e.t === 'mummer' || e.t === 'hobbyhorse'), mum = L.ents.filter(e => e.t === 'mummer'), horse = L.ents.filter(e => e.t === 'hobbyhorse');
  const endX = (L.green ? L.green.x0 : L.W);
  ok(L.W >= 560 && L.W <= 720, 'the fair is ' + L.W + ' columns: not the 560-720 the brief plans');
  ok(mum.length >= 6 && horse.length >= 2, 'the fair has ' + mum.length + ' mummers and ' + horse.length + ' hobby-horses');
  const SEC = 100, uncovered = []; for (let s = 0; s * SEC < endX; s++) if (!facers.some(e => e.x >= s * SEC && e.x < (s + 1) * SEC)) uncovered.push((s * SEC) + '-' + ((s + 1) * SEC - 1));
  ok(!uncovered.length, 'sections with no designed encounter of the facing rule: ' + uncovered.join(', '));
  ok(L.ents.filter(e => e.t !== 'mummer' && e.t !== 'hobbyhorse' && e.garrison === true).length === 0, 'sprinkled garrison filler stands in the fair (it is placed by hand)');
  ok(mum.every(e => e.squad === undefined || typeof e.squad === 'string'), '');
  // THE ARC: teach (a lone mummer on the flat, first), develop (a pincer: mummers on both sides of a climb), twist (the carousel), combine (horse + haystacks), exam
  const arc = L.arc || {};
  for (const k of ['teach', 'develop', 'twist', 'combine', 'exam']) ok(Array.isArray(arc[k]) && arc[k].length === 2 && arc[k][0] < arc[k][1], 'L.arc.' + k + ' is not a [x0,x1] section');
  if (arc.teach && arc.exam) {
    const inn = (k, t) => facers.filter(e => e.x >= arc[k][0] && e.x < arc[k][1] && (t ? e.t === t : true));
    ok(inn('teach', 'mummer').filter(e => e.y === 27).length === 1 && inn('teach', 'hobbyhorse').length === 0, 'the TEACH section\'s road is not exactly one mummer (' + inn('teach').length + ' facers)');
    /* THE HIGH ROADS CARRY THEIR OWN TESTS (claude/fairfix): the boardwalk (row 18, 82-163) a mummer on its planks and the barker at its far end; the chair islands a marionette and a horse;
       the night lane a mummer by a guttering lantern; the corn-top walk a scarecrow that is not straw */
    { const hi = L.ents.filter(e => ['mummer', 'hobbyhorse', 'stringjack', 'barker'].includes(e.t)), on = (x0, x1, y0, y1) => hi.filter(e => e.x >= x0 && e.x <= x1 && e.y >= y0 && e.y <= y1);
      ok(on(82, 163, 18, 18).some(e => e.t === 'mummer') && on(140, 163, 18, 18).some(e => e.t === 'barker' && e.elite), 'the boardwalk is a free road again (no mummer on its planks, no barker at its far end): ' + on(82, 163, 18, 18).map(e => e.t + e.x));
      ok(on(326, 329, 16, 16).some(e => e.t === 'stringjack') && on(344, 347, 15, 15).some(e => e.t === 'hobbyhorse' && e.face === 1), 'the swing ride\'s islands hold no marionette (A) and no horse facing the way you come (B)');
      const lane = on(563, 595, 12, 14).filter(e => e.t === 'mummer'); ok(lane.length >= 1 && lane.every(e => (L.lamps || []).some(l => l.life === 0.5 && Math.abs(l.x - e.x) <= 3 && Math.abs(l.y - e.y) <= 2)), 'the night lane has no mummer held only in a guttering lantern\'s light: ' + lane.map(e => e.x));
      ok(on(410, 438, 10, 11).some(e => e.t === 'mummer' && e.scare), 'the corn-top walk has no scarecrow that is not straw'); }
    ok(mum.indexOf(mum.slice().sort((a, b) => a.x - b.x)[0]) >= 0 && mum.slice().sort((a, b) => a.x - b.x)[0].x >= arc.teach[0] && mum.slice().sort((a, b) => a.x - b.x)[0].x < arc.teach[1], 'the first mummer in the level is not in the TEACH section');
    const dv = inn('develop', 'mummer'), st = L.stair || {}; ok(dv.length >= 3 && dv.filter(e => e.x < st.x0).length >= 2 && dv.some(e => e.x >= st.top), 'the DEVELOP section is not a pincer: two mummers at the foot of the climb (' + JSON.stringify(st) + ') and one at its top (' + dv.map(e => e.x).join(',') + ')');
    ok(L.grid.some(t => t === 22) && L.grid.some(t => t === 23) && L.grid.some(t => t === 24), 'the climb is not built of slopes (a mummer must be able to walk up it)');
    ok(inn('twist', 'mummer').length >= 2, 'the TWIST section (the carousel) has fewer than two mummers');
    ok(inn('combine', 'hobbyhorse').length >= 1, 'the COMBINE section has no hobby-horse');
    /* THE EXAM IS ONE SPACE (claude/fairfix): the small carousel under a dark canopy with a true mirror panel, a mummer and a marionette riding it; the night lane; a blind stall wall with a
       mummer behind it; the barker on his crate; the door guard on an unlit stretch */
    { const ex = L.ents.filter(e => e.x >= arc.exam[0] && e.x < arc.exam[1]), c = (L.carousels || []).find(q => q.x0 >= arc.exam[0] && q.x1 < arc.exam[1]), can = (L.halls || []).find(H => H.canopy);
      ok(c && can && can.x0 === c.x0 && can.x1 === c.x1 && can.mirrors.some(m => m.kind === 'true') && ex.some(e => e.t === 'mummer' && e.y === c.row - 1 && e.x >= c.x0 && e.x <= c.x1) && ex.some(e => e.t === 'stringjack' && e.y === c.row - 1 && e.x >= c.x0 && e.x <= c.x1), 'the exam\'s carousel is not under a dark canopy with a true mirror, with a mummer and a marionette riding it');
      ok((L.lamps || []).filter(l => l.x >= c.x0 && l.x <= c.x1 && l.y < c.row).length >= 2 && (L.lamps || []).filter(l => l.x >= c.x0 && l.x <= c.x1 && l.y < c.row).every(l => l.life === 0.5), 'the canopy\'s lanterns are not failing (guttering)');
      const bl = (L.blinds || [])[0]; ok(bl && ex.some(e => e.t === 'mummer' && e.x * 16 >= bl[0] * 16 && e.x <= bl[1] && e.y === 27) && FGM.blocked(L, (tx, ty) => L.grid[ty * L.W + tx] === 1, { x: 575 * 16 + 8, y: 28 * 16 }, { x: 566 * 16, y: 28 * 16, face: 1 }), 'no blind stall wall hides a mummer in the exam');
      ok(ex.some(e => e.t === 'barker' && e.elite) && ex.some(e => e.t === 'hobbyhorse' && e.elite && e.gate === L.green.door), 'the exam has no barker, or no door guard');
      const g0 = ex.find(e => e.t === 'hobbyhorse' && e.elite); ok(g0 && (L.unlit || []).some(([a, b]) => g0.x >= a && g0.x <= b) && FGM.sightFor(L, [], { x: g0.x * 16 + 8, y: 28 * 16 }) !== null && !(L.lamps || []).some(l => l.life > 0 && Math.abs(l.x - g0.x) <= 6), 'the door guard does not stand on an unlit stretch'); }
    ok(Array.isArray(L.carousels) && L.carousels.length >= 1 && L.carousels.every(c => c.x0 < c.x1 && c.period >= 3 && c.warn >= 1), 'the fair has no carousel with a period and a warning');
    ok(L.carousels && L.carousels.some(c => c.x0 >= arc.twist[0] && c.x1 <= arc.twist[1]), 'no carousel stands in the TWIST section');
    const stacks = []; for (let x = 0; x < L.W; x++) for (let y = 0; y < L.H; y++) if (L.grid[y * L.W + x] === T.BOUNCER) stacks.push([x, y]);
    ok(stacks.length >= 8, 'the fair has ' + stacks.length + ' haystack bouncer tiles (the Sporewood cap bounce): fewer than 8');
    ok(stacks.some(([x]) => x >= arc.combine[0] && x < arc.combine[1]), 'no haystack bouncers in the COMBINE section');
    for (const h of horse) ok(h.range === undefined || h.range > 0, ''); }
  // THE GREEN: the boss room: a door and a checkpoint before it, and (L3) THE WICKER QUEEN in it
  ok(L.green && L.green.x0 < L.green.x1 && L.green.door > 0 && L.green.x1 - L.green.x0 >= 30, 'the green (the maypole room) is not there or is too small: ' + JSON.stringify(L.green));
  if (L.green) {
    const cks = L.ents.filter(e => e.t === 'check').map(e => e.x);
    ok(cks.some(x => x < L.green.door && x >= L.green.door - 40), 'no checkpoint within 40 columns before the green\'s door');
    ok(!cks.some(x => x >= L.green.x0 && x <= L.green.x1), 'a checkpoint stands inside the green');
    ok(L.ents.some(e => e.t === 'gate' && e.x >= L.green.x0), 'the green has no gate at its far end');
    ok(L.green.maypole > L.green.x0 && L.green.bonfire > L.green.maypole && L.green.bonfire < L.green.x1 && L.green.floor > 0, 'the green has no maypole and bonfire');
    /* L3 (claude/fair3): the green is THE WICKER QUEEN's arena now - one boss, and only her (tools/wicker-queen.mjs asks the rest of her) */
    ok(L.arena && L.arena.boss === 'wickerqueen' && L.ents.filter(e => e.t === 'wickerqueen').length === 1 && !L.ents.some(e => e.t === 'closedhelm' || e.boss), 'the green is not the Wicker Queen\'s arena, with her alone in it: ' + JSON.stringify(L.arena));
    ok(horse.some(h => h.elite && h.gate === L.green.door && Math.abs(h.x - L.green.door) >= 5 && h.x < L.green.door), 'the elite hobby-horse does not hold the door of the green (elite: true, gate: the door column)'); }
  ok(L.duskStart !== undefined && L.duskLen > 100 * TS, 'the fair does not go from sunset to dusk over its length (duskStart/duskLen)');
  ok(L.music === 'harvestfair' && L.arena && L.arena.music === 'wickerqueen', 'the fair does not play its own two tracks (harvestfair on the road, wickerqueen on the green): ' + L.music + ' / ' + (L.arena && L.arena.music));
  ok(!!L.ents.find(e => e.t === 'sign' && /BACK/.test(e.text || '')), 'no sign says the rule'); }


// ---- L2 (2026-09-29): THE INDEX WEIGHTS, THE FURNITURE, THE LAMPS, THE ART AND THE AUDIO ----
{ const fair = LEVELS.find(l => l.id === 'fair'), L = fair.build(), T2 = { BOUNCER: 10, SPIKE: 3, AIR: 0, SOLID: 1 }, TS2 = 16;
  // Daniel approved the greybox with the index at 34 against ~117 and no extra bodies: the mummer is a 5, the hobby-horse a 6
  ok(THREAT.mummer >= 5 && THREAT.hobbyhorse >= 6, 'the mummer / hobby-horse are not weighed 5 / 6 in src/threat.js: ' + THREAT.mummer + ' / ' + THREAT.hobbyhorse);
  { const m = measureLevel(L, { T: T2, TS: TS2 }); const idx = indexOf({ threat: m.threat, kinds: m.kinds, hazTiles: m.hazTiles, gap: m.gap, span: spanOf(L.W, L.H) });
    ok(idx >= 70 && idx <= 125, 'the fair INDEX is ' + idx + ' (85 after claude/fairfix; 116 after claude/fairfix2, which Daniel asked to make a real challenge at level 1 - the ranged reskins and the edge horses; 45 before, the campaign ~117): ' + JSON.stringify(m)); }
    // FURNITURE: what Waymeet and the Fields carry (three silvers, a relic, hearts); NO NPCs (pickups only)
  const cnt = t => L.ents.filter(e => e.t === t).length;
  ok(cnt('silver') === 3, 'the fair has ' + cnt('silver') + ' silvers, not the campaign three');
  ok(cnt('relic') === 2 && L.ents.some(e => e.t === 'relic' && e.kind === 'maypole' && e.bossDrop) && L.ents.some(e => e.t === 'relic' && e.kind === 'handglass' && !e.bossDrop), 'the fair has not two relics (the Queen\'s maypole ribbon, and THE FORTUNE-TELLER\'S GLASS in the back lot - claude/fairfix2): ' + cnt('relic'));
  ok(cnt('mend') >= 3, 'the fair has ' + cnt('mend') + ' hearts (mend): three, one after each hard stretch');
  ok(!L.ents.some(e => ['npc', 'stray', 'captive', 'folk', 'squire'].includes(e.t)), 'an NPC or stray stands in the fair (pickups only)');
  ok(L.ents.filter(e => e.t === 'check').length === 5, 'the fair does not stand five shrines (claude/fairfix, under the 200-tile ceiling): ' + L.ents.filter(e => e.t === 'check').map(e => e.x));
  // THE LAMPS GUTTER OUT: steady at the gate, more of them out the further along, the last lamps before the door guttering
  { const lp = L.lamps || [], at = (a, b) => lp.filter(l => l.x >= a && l.x < b), share = ls => ls.length ? ls.filter(l => l.life <= 0).length / ls.length : 0;
    ok(lp.length >= 16, 'the fair has ' + lp.length + ' lamps'); ok(at(0, 118).every(l => l.life === 1), 'a lamp is out or guttering at the GATE (sunset)');
    ok(share(at(374, 640)) > share(at(0, 246)) + 0.3, 'the lamps do not go out along the way: ' + share(at(0, 246)).toFixed(2) + ' out early, ' + share(at(374, 640)).toFixed(2) + ' late');
    ok(lp.some(l => l.life > 0 && l.life < 1), 'no lamp is guttering'); ok(lp.every(l => l.x > 0 && l.x < L.W), 'a lamp stands off the map'); }
  // THE MUSIC BOX WINDS DOWN, section by section: a fresh spring at the gate, run down at the green; never speeds up
  { let prev = -1; for (const c of [0, 60, 118, 180, 246, 310, 374, 440, 502, 560, 620, 650]) { const w = FA.windAt(c); ok(w >= prev, 'the music box wound UP between columns (' + c + ')'); prev = w; }
    ok(FA.windAt(5) < 0.1 && FA.windAt(640) >= 0.99 && FA.windAt(374) > FA.windAt(246) && FA.windAt(502) > FA.windAt(374), 'the music box does not wind down section by section'); }
  const au = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
  ok(/export const musicBox/.test(au) && /BOX_TUNE/.test(au) && /mummerBell()/.test(au) && /horseRear()/.test(au) && /hayRustle()/.test(au), 'the audio has no music box, bells, horse-rear or hay rustle');
  ok(L.music === 'harvestfair', 'the fair base track is not its own harvestfair band organ');
  // THE ART: the foes and the world are real art files, not the L1 rectangles
  ok(existsSync(new URL('../src/redraw/fair_art.js', import.meta.url)) && existsSync(new URL('../src/redraw/fair_world.js', import.meta.url)) && !existsSync(new URL('../src/redraw/fair_' + 'greybox.js', import.meta.url)), 'the fair art files are not fair_art.js + fair_world.js (the L1 greybox file is gone)');
  const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/FAW.drawCarousel/.test(mainSrc) && /FAW.drawGreen/.test(mainSrc) && /FAW.drawCrowd/.test(mainSrc) && /FAW.drawGlow/.test(mainSrc) && /FAW.drawHay/.test(mainSrc), 'drawFair does not draw the carousel, the green, the crowd, the glow and the haystacks from src/redraw/fair_world.js'); }

// ---- A SLOPE IS DRAWN AS A SLOPE (claude/fairlevel): the art baked from a level's own top and fill follows slopes.js heightAt, kind by kind ----
{ const { install } = await import('./node-canvas.mjs'); install(); const { slopeTile } = await import('../src/redraw/ground-slopes.js'), SL = await import('../src/slopes.js'), { canvas } = await import('../src/px.js');
  const mkS = col => { const [c, g] = canvas(16, 16); g.fillStyle = col; g.fillRect(0, 0, 16, 16); return c; }, top = mkS('#6a8a46'), fill = mkS('#7a6248');
  for (const kind of [20, 21, 22, 23, 24, 25]) { const c = slopeTile(kind, top, fill), d = c.getContext('2d').getImageData(0, 0, 16, 16).data; let worst = 0, opaque = 0;
    for (let x = 0; x < 16; x++) { let first = 16; for (let y = 0; y < 16; y++) if (d[(y * 16 + x) * 4 + 3] > 0) { first = y; break; } const want = Math.min(16, Math.round(SL.heightAt(kind, x + 0.5))); worst = Math.max(worst, Math.abs(first - want)); if (first < 16) opaque++; }
    ok(worst <= 1, 'the slope art for kind ' + kind + ' does not follow the slope (its top edge is ' + worst + ' px off the surface)'); ok(opaque >= 8, 'the slope art for kind ' + kind + ' is nearly empty'); }
  delete globalThis.document; }
// ---- THE VERTICAL REBUILD (claude/fairlevel, 2026-09-30): the fairground climbs and loops; three fair mechanics are taught, developed, twisted and examined; two secrets; a set piece ----
{ const fair = LEVELS.find(l => l.id === 'fair'), L = fair.build(), R = 28, TS3 = 16, TT = (await import('../src/level.js')).T, { floodReach } = await import('../src/reachcore.js');
  const cnt = t => L.ents.filter(e => e.t === t).length, at = (x, y) => L.grid[y * L.W + x];
  // FEWER, BETTER FOES: 12 mummers, 3 horses (the door guard among them); the last count was 13 and a grid of them
  // FEWER, BETTER FOES, EVERY ONE IN A DESIGNED ENCOUNTER (claude/fairfix): 18 mummers, 4 horses, 3 marionettes, 2 barkers - 27 - and every one a squad or an elite (no padding)
  /* (claude/fairfix2) the RANGED reskins join them - a coconut shy, four knife jugglers, two crows - and two horses at edges: 37, still every one a squad or an elite */
  { const fs2 = L.ents.filter(e => ['mummer', 'hobbyhorse', 'stringjack', 'barker', 'drunk', 'archer', 'crow'].includes(e.t));
    ok(cnt('mummer') === 19 && cnt('hobbyhorse') === 6 && cnt('stringjack') === 3 && cnt('barker') === 2 && cnt('drunk') === 1 && cnt('archer') === 4 && cnt('crow') === 2, 'the fair foe count moved (19 mummers + 6 horses + 3 string-jacks + 2 barkers + 1 shy + 4 jugglers + 2 crows): ' + [cnt('mummer'), cnt('hobbyhorse'), cnt('stringjack'), cnt('barker'), cnt('drunk'), cnt('archer'), cnt('crow')]);
    ok(fs2.every(e => e.squad || e.elite) && cnt('barker') === L.ents.filter(e => e.t === 'barker' && e.elite).length, 'a fair foe is not in a designed encounter (a squad or an elite), or a barker is not an elite'); }
  // HEIGHT BANDS: the reach fill (with the rides) stands in five bands of height - the cellars, the road, the roofs, the boardwalk, the tops - and nothing is a corridor
  { const seen = floodReach(L, TT, { rides: true }).seen, rows = new Set([...seen].map(k => +k.split(',')[1])), band = r => r >= 29 ? 0 : r >= 24 ? 1 : r >= 19 ? 2 : r >= 15 ? 3 : 4, bands = new Set([...rows].map(band));
    ok(bands.size === 5, 'the fair is not five bands of height (cellar, road, roofs, boardwalk, tops): ' + [...bands].sort() + ' rows ' + Math.min(...rows) + '-' + Math.max(...rows));
    ok(Math.min(...rows) <= 13, 'nothing in the fair stands higher than row ' + Math.min(...rows) + ' (the tower top is row 14 and the night lane row 13)'); }
  // THE RIDES: the big wheel (six cars evenly spaced on one circle), the swing ride (three chairs), the helter-skelter (a tower and a 14-row slide of steep slopes)
  { const cars = (L.moversExtra || []).filter(m => m.kind === 'wheel' && m.fair === 'gondola'), chairs = (L.moversExtra || []).filter(m => m.kind === 'swing' && m.fair === 'chair');
    ok(cars.length === 6 && cars.every(c => c.px === cars[0].px && c.py === cars[0].py && c.r === cars[0].r) && new Set(cars.map(c => c.phase.toFixed(3))).size === 6, 'the big wheel is not six cars on one circle');
    ok(cars[0] && cars[0].py + cars[0].r <= 28 * TS3 && cars[0].py + cars[0].r >= 27 * TS3 - 1 && (28 * TS3 - (cars[0].py - cars[0].r)) / TS3 >= 10, 'the wheel does not run from a hop above the road to the boardwalk\'s height: ' + JSON.stringify(cars[0] && { py: cars[0].py, r: cars[0].r }));
    ok(chairs.length >= 3 && chairs.every(c => c.mast && c.mast.length === 4), 'the swing ride has fewer than three chairs hung from masts: ' + chairs.length);
    ok(chairs.every(c => c.arm >= 88 && c.period >= 3), 'a chair swings too short or too fast');
    const sl = L.slide, T1 = 21; let run = 0; for (let k = 0; k < sl.n; k++) if (at(sl.x0 + k, sl.y0 + k) === T1) run++;
    ok(sl && sl.n >= 11 && run === sl.n && at(sl.x0 + sl.n, R - 1) === 0 && at(sl.x0 + sl.n, R) === 1, 'the helter-skelter is not a slide of steep slopes that ends over the road: ' + JSON.stringify(sl) + ' run ' + run);
    /* THE HORSE STALL (claude/fairfix): under the slide's foot a hollow open to the road, and a horse in it facing out - behind you when you land */
    { const S2 = sl.stall, hf = L.ents.find(e => e.t === 'hobbyhorse' && S2 && e.x >= S2.x0 && e.x <= S2.x1); let open = !!S2; if (S2) for (let x = S2.x0; x <= S2.x1; x++) for (let y = sl.y0 + (x - sl.x0) + 1; y < R; y++) if (at(x, y) !== 0) open = false;
      ok(open && hf && hf.face === 1 && hf.x < sl.x0 + sl.n && at(sl.x0 + sl.n, R - 1) === 0 && at(sl.x0 + sl.n, R - 3) === 0, 'there is no horse stall under the slide\'s foot with a horse facing out of it (behind the landing): ' + JSON.stringify(S2) + ' ' + (hf && hf.x)); }
    ok(L.tower && L.tower.top <= 14 && at(L.tower.x0, L.tower.top) === 1 && at(L.tower.x0, L.tower.top - 1) === 0, 'the helter-skelter tower is not a solid column to the road with a top at row 14');
    ok(L.arc.twist[1] - L.arc.twist[0] >= 120 && sl.x0 + sl.n >= L.arc.combine[0] && sl.x0 + sl.n <= L.arc.combine[0] + 8, 'the slide does not land at the start of the section after the twist'); }
  // TWO ROADS: the low road (the hall of mirrors and the tower stair) and the high road (the wheel and the swing ride) both reach the tower top (the route pilot walks them: tools/fair-route.mjs)
  { const seenPlain = floodReach(L, TT, { rides: true }).seen, tower = (L.tower.x0 + 1) + ',' + (L.tower.top - 1); ok(seenPlain.has(tower), 'the tower top is not on the low road (the stair): the fill (with the rides - the wheel is the way over its pit now, claude/fairfix2) does not reach it');
    const hall = L.hall; ok(hall && hall.mirrors.some(m => m.kind === 'true') && hall.mirrors.some(m => m.kind === 'cracked') && hall.x1 - hall.x0 >= 20, 'the hall of mirrors has no true and cracked glass');
    const A = L.ents.filter(e => e.t === 'mummer' && e.x >= hall.x0 && e.x <= hall.x1).sort((a, b) => a.x - b.x);
    const Mh = L.ents.filter(e => e.t === 'stringjack' && e.x >= hall.x0 && e.x <= hall.x1 && e.y === 27);
    ok(A.length === 1 && Mh.length === 1 && Mh[0].x < hall.mirrors.find(m => m.kind === 'true').x1 + 1 && A[0].x >= hall.mirrors.find(m => m.kind === 'cracked').x0 && A[0].x <= hall.mirrors.find(m => m.kind === 'cracked').x1, 'the hall is not a marionette by the door (by the first true glass) and a mummer in front of the cracked glass (' + A.map(e => e.x) + ' / ' + Mh.map(e => e.x) + ')'); }
  // THE GAMES, each taught -> developed -> twisted -> examined
  { const S = L.strikers || [], GS = L.galleries || [], G = GS[0], B = L.booth, tk = L.tickets || [];
    ok(S.length === 3 && S[0].x < S[1].x && S[1].x < S[2].x && S[0].launch === -600 && S[1].big && S[2].big && !S[0].big && S[1].launch < S[0].launch, 'the fair has not three strikers, the first small (taught at the gate) and two tall (over the maze, before the door): ' + JSON.stringify(S));
    for (const s of S) { const rise = s.launch * s.launch / 2000 / TS3; let top = null; for (let y = R - 1; y >= 0; y--) if (at(s.x, y) === TT.ONEWAY) { top = y; break; }   // the plank over the pad
      ok(top !== null && R - top + 1 <= rise && R - top >= 8, 'the striker at ' + s.x + ' does not throw you onto a plank over it: plank row ' + top + ', it throws ' + rise.toFixed(1) + ' rows'); }
    const GS3 = GS.filter(g => g.targets.length > 1); ok(GS3.length === 3 && GS3.every(g => g.targets.length === 3 && g.planks.length >= 2 && g.window >= 8 && g.window <= 15) && GS3[0].window > GS3[1].window && GS3[1].window > GS3[2].window, 'the shooting galleries are not three of three targets, each with a shorter window (taught, developed, examined): ' + JSON.stringify(GS.map(g => [g.targets.length, g.planks.length, g.window])));
    ok(GS.every(g => g.planks.every(([x0, x1, row]) => { for (let x = x0; x <= x1; x++) if (at(x, row) !== 0) return false; return true; })), 'a gallery plank is already built: it should only exist once the targets are hit');
    ok(new Set(GS3.map(g => Math.floor(g.targets[0].x / 100))).size === 3, 'the three galleries do not stand in three different stretches of the level');
    ok(G && L.ents.some(e => e.t === 'silver' && e.x >= G.nest.x0 && e.x <= G.nest.x1 && e.y === G.nest.row - 1), 'the crow\'s nest holds no silver');
    /* TICKETS ARE KEYS (claude/fairfix2): no booth; three gates, dearer as you go, the last ALL of them - a hatch into THE BACK LOT, where the fair's own relic and its third silver lie */
    const TG = L.ticketGates || [], tot = FK.ticketTotal(L);
    ok(!B && tk.length >= 20 && tot === tk.length + S.reduce((a, s) => a + s.tickets, 0), 'the tickets are not the level\'s keys (no booth, a total of every ticket and every striker\'s pay): ' + tot);
    ok(TG.length === 3 && TG[0].need < TG[1].need && TG[1].need < tot && TG[2].all && TG[2].hatch && FK.gateNeed(L, TG[2]) === tot, 'the ticket gates are not three, dearer as you go, the last ALL the tickets: ' + JSON.stringify(TG.map(g => [g.x, g.need, g.all])));
    ok(TG.every(g => { for (let y = g.y0; y <= g.y1; y++) for (let x = g.x; x < g.x + (g.w || 1); x++) if (at(x, y) !== 1) return false; return true; }) && TG.filter(g => !g.hatch).every(g => g.y1 - g.y0 >= 4), 'a ticket gate is not solid at the start (or a fence is low enough to jump: five high)');
    ok(TG.filter(g => !g.hatch).every(g => L.ents.some(e => e.t === 'sign' && Math.abs(e.x - g.x) <= 4 && new RegExp('SHOW ' + g.need + ' TICKETS').test(e.text))) && L.ents.some(e => e.t === 'sign' && /BACK LOT\. SHOW ALL THE TICKETS/.test(e.text)), 'a ticket gate has no sign that says its price');
    const BL = L.backLot; ok(BL && L.ents.some(e => e.t === 'relic' && e.kind === 'handglass' && e.x >= BL.x0 && e.x <= BL.x1 && e.y >= BL.y0) && L.ents.some(e => e.t === 'silver' && e.x >= BL.x0 && e.x <= BL.x1 && e.y >= BL.y0) && at(TG[2].x, TG[2].y0 + 1) === 0, 'the back lot is not a room under the hatch with the relic and a silver in it');
    const sil = L.ents.filter(e => e.t === 'silver'); ok(sil.length === 3 && sil.some(e => e.y >= R + 1 && e.x < 300) && G && sil.some(e => e.x >= G.nest.x0 && e.x <= G.nest.x1) && BL && sil.some(e => e.x >= BL.x0 && e.x <= BL.x1), 'the three silvers are not the takings\', the crow\'s nest\'s and the back lot\'s'); }
  // TWO SECRETS: a plug of plain rock in the road, a cellar with a stair back up, and something in it (the back lot; the closet behind the cracked glass)
  { const W = L.walls || []; ok(W.length === 2 && W.every(w => w.kind === 'secret' && w.reach === true && w.y0 === R && w.y1 === R && w.x1 - w.x0 === 1), 'the fair has not two secret plugs in the road: ' + W.length);
    for (const w of W) {
      ok(at(w.x0, R) === 1 && at(w.x1, R) === 1, 'a secret plug is not solid rock (plain, so it reads as road)');
      ok(at(w.x0, R + 1) === 0 && at(w.x0 + 5, R + 6) === 0 && at(w.x0, R + 7) === 1, 'the cellar under the plug at ' + w.x0 + ' is not a room (rows 29-34, a floor at 35)');
      ok(at(w.x0 + 2, R + 4) === TT.ONEWAY && at(w.x0, R + 2) === TT.ONEWAY, 'the cellar under ' + w.x0 + ' has no stair back up (a step at row 32 and one at row 30 under the plug)');
      ok(L.ents.some(e => (e.t === 'mend' || e.t === 'silver') && e.x >= w.x0 - 12 && e.x <= w.x0 + 12 && e.y >= R + 1) && (L.tickets || []).some(t => t.x >= w.x0 - 12 && t.x <= w.x0 + 12 && t.row >= R + 1), 'the cellar under ' + w.x0 + ' holds no reward (a silver or a heart, and tickets)'); }
    const seen = floodReach(L, TT, { rides: true }).seen; ok(W.every(w => seen.has((w.x0 + 2) + ',' + (R + 6))), 'a cellar is not reached by the fill (with the rides) with its plug broken'); }
  // THE CORN MAZE: three tiers, two chimneys, blind corners with a scarecrow that is not straw at each turn, and the walls stop your look
  { const Mz = L.maze, sc = L.ents.filter(e => e.t === 'mummer' && e.scare);
    ok(Mz && sc.length === 3 && sc.every(e => e.x >= Mz.x0 - 1 && e.x <= Mz.x1 + 1) && (L.scarecrows || []).length >= 4, 'the corn maze has not three disguised mummers (two at the turns, one on the corn-top walk) among four or more straw ones: ' + sc.length + ' / ' + (L.scarecrows || []).length);
    ok(Mz && Mz.tiers.length === 3 && (L.corn || []).length >= 1 && Mz.blind && FGM.blocked(L, (tx, ty) => at(tx, ty) === 1, { x: (Mz.x0 + 12) * TS3, y: 23 * TS3 - 1 }, { x: (Mz.x0 + 12) * TS3, y: R * TS3 - 1 }), 'the maze\'s tiers do not hide a mummer one floor up (walls must stop the look)');
    ok(Mz && !FGM.blocked(L, (tx, ty) => at(tx, ty) === 1, { x: (Mz.x0 + 20) * TS3, y: R * TS3 - 1 }, { x: (Mz.x0 + 10) * TS3, y: R * TS3 - 1 }), 'the maze\'s walls block a look along one corridor');
    ok(sc.some(e => e.y <= 17) && sc.some(e => e.y === 22), 'the disguised mummers are not one in the middle tier and one in the dark tier'); }
  // THE NIGHT THAT COMES WITH HEIGHT: the light goes out with rows; a guttering lantern by the tower stair's mummer is the way to see it
  { const N = L.fairNight; ok(N && N.full < N.start && N.start <= 26 && N.full <= 14 && N.dim >= 60 && N.dim <= 120, 'the night does not come with height: ' + JSON.stringify(N));
    const lp = L.lamps; ok(lp.filter(l => l.y < 17).every(l => l.life <= 0.5) && lp.some(l => l.y < 17 && l.life === 0.5) && lp.some(l => l.y < 17 && l.life === 0), 'up in the rides the lamps do not gutter and go out with height');
    const st = L.ents.find(e => e.t === 'mummer' && e.x >= 354 && e.x <= 358 && e.y <= 20); ok(!!st && lp.some(l => l.life === 0.5 && Math.abs(l.x - st.x) <= 3 && l.y <= 19), 'the tower stair\'s mummer has no guttering lantern by it');
    ok(FGM.sightFor(L, [], { x: 100 * TS3, y: 27 * TS3 }) === null && FGM.sightFor(L, [], { x: 358 * TS3, y: 18 * TS3 }) !== null && FGM.sightFor(L, [{ x: 357, y: 18, life: 1, lit: true }], { x: 358 * TS3, y: 18 * TS3 }) === null, 'the night sight does not follow height and the lit lantern');
    ok(FGM.sightFor(L, [], { x: (L.hall.x0 + 3) * TS3, y: 27 * TS3 }) !== null, 'the hall of mirrors is not dark'); }
  // THE MIRROR: inside the hall, a hero who faces a true mirror within reach sees behind him; cracked glass does not; nowhere else
  { const at3 = (x, f) => ({ x: x * TS3, y: 27 * TS3, face: f });
    ok(FGM.mirrorSees(L, at3(331, 1)) && FGM.mirrorSees(L, at3(327, 1)), 'a hero facing the true glass ahead does not see behind him');
    ok(!FGM.mirrorSees(L, at3(324, 1)) && !FGM.mirrorSees(L, at3(331, -1)), 'the cracked stretch (and a back to the glass) shows behind him: it should not');
    ok(!FGM.mirrorSees(L, at3(300, 1)) && !FGM.mirrorSees(L, at3(345, -1)), 'a hero outside the hall sees behind him');
    const foe = { x: 400, y: 27 * TS3 }, back = { x: 500, y: 27 * TS3, face: 1, alive: true };
    ok(!M.looks(foe, back) && M.looks(foe, { ...back, mirror: true }) && !M.looks(foe, { ...back, mirror: true, blind: true }), 'the mirror flag does not turn the look round, or a wall does not stop it');
    ok(!M.looks({ x: 500 + 120, y: 27 * TS3 }, { ...back, reach: 1 }, 88, 88), '(a foe 120 px ahead is out of a dim 88 px look)');
    ok(M.looks({ x: 500 + 120, y: 27 * TS3 }, { ...back, reach: M.RIBBON_REACH }, 88, 88), 'THE MAYPOLE RIBBON does not stretch the dim look from 88 to 132 px (the night and the hall are where it helps)'); }
  // THE EFFIGY CATCHES FIRE (claude/fairfix2; it was the ghost train): a chase down the sunken straw lane from BEHIND, kill on contact like every chase, told speed-ups, the fair's own shrine within
  // fifteen columns of its start; TWO LANES to choose - the LOW lane's burning bunting (timed, to duck or wait), fallen stalls to hop and two mummers each a few steps before a line of bunting;
  // the HIGH lane's stall roofs, every one giving way under you. No free heart in it
  { const C = (L.chases || [])[0], G = { x0: 469, x1: 524 }; ok(C && L.chases.length === 1 && C.id === 'effigy' && C.dir === 1 && C.look === 'fire' && (C.contact || 'kill') === 'kill' && C.runsOver && !L.ghostTrain, 'the effigy\'s fire is not a kill-on-contact chase that runs from behind (and the ghost train is not gone): ' + JSON.stringify(C && { id: C.id, dir: C.dir, look: C.look }));
    const E4 = (L.effigies || []).find(e => e.burns && e.world); ok(E4 && E4.x * 16 < C.trigger && C.trigger - E4.x * 16 <= 20 * 16, 'the effigy that catches does not stand at the fire\'s start line');
    const hiRoofs = (L.crumbles || []).filter(c => c.kind === 'stall' && c.x0 >= G.x0 && c.x1 <= G.x1 + 2 && c.row < R); ok(hiRoofs.length >= 6 && hiRoofs.every((c, i) => i === 0 || c.x0 - hiRoofs[i - 1].x1 - 1 <= 3), 'the HIGH lane is not a run of collapsing stall roofs a jump apart: ' + hiRoofs.map(c => c.x0));
    ok(C.beams.every(b => b.bunting) && (L.fallen || []).length >= 2 && (L.fallen || []).every(x => at(x, R + 2) === 1 && at(x, R + 1) === 0), 'the LOW lane has no burning bunting or no fallen stalls to hop');
    ok(G && G.x1 - G.x0 >= 54 && (() => { for (let x = G.x0 + 8; x <= G.x1 - 8; x++) if ((L.fallen || []).includes(x)) continue; else if (at(x, R + 3) !== 1 || at(x, R + 2) !== 0 || at(x, R + 1) !== 0 || at(x, R) !== 0) return false; return true; })(), 'the fire\'s straw lane is not a long sunken lane (the road three rows down, ~60 columns)');
    ok(G && at(G.x0, R) === 25 && at(G.x0 + 1, R) === 24 && at(G.x1 - 1, R) === 22 && at(G.x1, R) === 23, 'the cutting has no slopes down and up');
    ok(C && C.curve.length >= 3 && C.curve.slice(1).every(r => r[2]) && C.beams.length >= 3 && C.beams.every(b => b.period > b.up && b.up > 0.6) && new Set(C.beams.map(b => b.period)).size === C.beams.length, 'the chase has no told speed-ups, or its beams are not timed (three, each down part of a period, never all lifting together)');
    const CH = await import('../src/chase.js'), cps = L.ents.filter(e => e.t === 'check').map(e => ({ x: e.x * 16 + 8, y: (e.y + 1) * 16 }));
    ok(C && CH.chaseProblems(L.chases, cps).length === 0, 'the effigy\'s fire fails the chase lint: ' + (C && CH.chaseProblems(L.chases, cps).join('; ')));
    const tm = L.ents.filter(e => e.t === 'mummer' && e.x * 16 > C.trigger && e.x * 16 < C.end && e.y === R + 2);
    ok(tm.length >= 2 && tm.every(e => C.beams.some(b => b.x0 / 16 > e.x && b.x0 / 16 - e.x <= 8)), 'the chase does not put mummers in the way, each a few steps before a beam: ' + tm.map(e => e.x));
    ok(!L.ents.some(e => e.t === 'mend' && e.x >= G.x0 && e.x <= G.x1) && !L.ents.some(e => e.t === 'mend' && e.x >= L.arc.exam[0] && e.x < L.green.door && e.y >= 26), 'a free heart lies in the cutting or on the exam\'s road (the review cut 470 and 597)'); }
  // THE WICKER EFFIGY going up behind the fair, five stages, passed again and again
  /* (claude/fairfix2) four stages going up, the fourth standing on the bank at the fire and BURNING, and after it the ash */
  { const E = L.effigies || []; ok(E.length === 5 && E.slice(0, 4).every((e, i) => e.stage === i && (i === 0 || e.x > E[i - 1].x)) && E[3].burns && E[3].world && E[4].stage === 'ash' && E[4].x > E[3].x, 'the wicker effigy is not four stages going up, the fourth burning at the fire, then ash: ' + JSON.stringify(E)); }
  // NO LONG FLAT WALK: every 40 columns of the fair proper hold something (a foe, a pit or spikes, a ride, a slope, a game, a climb, a plank)
  { const feats = new Array(L.W).fill(0); for (let x = 0; x < L.W; x++) for (let y = 0; y < L.H; y++) { const t = at(x, y); if (t === TT.ONEWAY || t === TT.SPIKE || t === TT.BOUNCER || (t >= 20 && t <= 25)) feats[x]++; }
    for (const e of L.ents) if (['mummer', 'hobbyhorse', 'check'].includes(e.t)) feats[e.x] += 3; for (const m of L.moversExtra || []) feats[Math.max(0, Math.min(L.W - 1, Math.floor((m.px || m.x) / TS3)))] += 4; for (const c of L.carousels) feats[c.x0] += 5;
    for (const c of L.chases || []) for (const b of c.beams || []) feats[Math.floor(b.x0 / TS3)] += 4;   /* (the chase's beams are its features) */
    const flat = []; for (let s = 0; s + 40 <= 618; s += 20) { let n = 0; for (let x = s; x < s + 40; x++) n += feats[x]; if (n < 8) flat.push(s + '-' + (s + 39)); }
    ok(!flat.length, 'long flat walks (40 columns with next to nothing in them): ' + flat.join(', ')); }
  // SHRINES (claude/fairfix; Daniel widened the game's ceiling to 200 route tiles): five, one before the effigy's fire (it was the ghost train) and one before the door, 80-200 columns apart
  { const cp = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b), C = (L.chases || [])[0]; ok(cp.length === 5 && cp.every((x, i) => i === 0 || (x - cp[i - 1] >= 80 && x - cp[i - 1] <= 200)) && C && cp.some(x => x * 16 < C.trigger && C.trigger - x * 16 <= 240), 'the shrines are not five, 80-200 columns apart, one right before the ghost train: ' + cp); }
}

if (bad.length) { console.error('HARVEST-FAIR (pure + level): ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('harvest-fair pure + level: ok');

// ---- IN THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const fi = LEVELS.findIndex(l => l.id === 'fair'); const out = {};
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.god = true; BK.sim(5);
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) if (e.t !== 'mummer' && e.t !== 'hobbyhorse') e.alive = false; };
    out.hp = { mummer: BK.EHP ? BK.EHP.mummer : null };
    // find the flat teach mummer and put a hero 90 px in front of it, on the same floor
    const ms = () => BK.enemies().filter(e => e.t === 'mummer' && e.alive), m0 = ms().sort((a, b) => a.x - b.x)[0];
    out.n = ms().length; out.horses = BK.enemies().filter(e => e.t === 'hobbyhorse').length;
    // 1. FACED: hero to the LEFT of the mummer facing right (toward it): it does not move in 4 s
    clear(); BK.god = true; BK.P.hp = BK.P.maxHp; none();
    const set = (dx, face) => { BK.P.x = m0.x + dx; BK.P.y = m0.y; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = face; };
    for (const q of ms()) if (q !== m0) q.alive = false;
    m0.st.mode = 'still'; const x0 = m0.x; set(-110, 1); let moved = 0;
    for (let i = 0; i < 240; i++) { set(-110 - (m0.x - x0), 1); BK.P.face = 1; BK.sim(1); moved = Math.max(moved, Math.abs(m0.x - x0)); }
    out.facedMoved = moved; out.facedMode = m0.mode;
    // 2. BACK TURNED: face away: it creeps toward him
    const x1 = m0.x; for (let i = 0; i < 120; i++) { BK.P.x = m0.x - 110; BK.P.y = m0.y; BK.P.vx = 0; BK.P.face = -1; BK.sim(1); }
    out.creepDx = x1 - m0.x; out.creepMode = m0.mode; out.bell = BK.mummerBells ? BK.mummerBells() : null;
    // 3. HIT WHILE FROZEN: look at it, swing: it takes damage and dies in a few blows
    BK.P.x = m0.x - 14; BK.P.y = m0.y; BK.P.face = 1; BK.sim(4); m0.st.mode = 'still'; const hp0 = m0.hp; let blows = 0, bx = m0.x;
    for (let i = 0; i < 12 && m0.alive; i++) { BK.P.x = m0.x - 16; BK.P.y = m0.y; BK.P.face = 1; BK.P.vx = 0; BK.P.inv = 99; BK.press('atk'); BK.sim(30); blows++; }
    out.hit = { hp0, hp1: m0.hp, alive: m0.alive, blows, moved: Math.abs(m0.x - bx) };
    return out;
  })()`, 600000);
} finally { pg.close(); }

// ---- IN THE PAGE, THE REST: bells, glow and strike, co-op, the horse, the carousel ----
const pg2 = await openPage({ audio: false, fonts: false });
let R2;
try {
  R2 = await pg2.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const fi = LEVELS.findIndex(l => l.id === 'fair'); const out = {};
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.sim(5);
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const only = keep => { for (const e of BK.enemies()) if (!keep.includes(e)) e.alive = false; };
    const mums = () => BK.enemies().filter(e => e.t === 'mummer').sort((a, b) => a.x - b.x), hors = () => BK.enemies().filter(e => e.t === 'hobbyhorse').sort((a, b) => a.x - b.x);
    const m0 = mums()[0]; only([m0]);
    // 1. BACK TURNED, hero pinned 110 px to the left of it (the fair's mummer creeps faster now, claude/fairfix2): it creeps (bells), then its mask GLOWS, then it strikes and hurts him
    BK.god = false; BK.P.inv = 0; BK.P.hp = BK.P.maxHp; const hx = m0.x - 110; const pin = f => { BK.P.x = hx; BK.P.y = m0.y; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = f; };
    const modes = new Set(); let hpMin = BK.P.maxHp; const b0 = BK.fair().bells;
    for (let i = 0; i < 60 * 8; i++) { pin(-1); BK.P.inv = 0; BK.sim(1); modes.add(m0.mode); hpMin = Math.min(hpMin, BK.P.hp); if (m0.mode === 'recover') break; }
    out.modes = [...modes]; out.bells = BK.fair().bells - b0; out.hpLost = BK.P.maxHp - hpMin; out.strikes = BK.fair().strikes;
    // 2. A LOOK DURING THE GLOW cancels the strike
    BK.P.hp = BK.P.maxHp; BK.P.inv = 0; m0.st.mode = 'still'; m0.st.t = 0; m0.x = hx + 30; BK.sim(2); const s0 = BK.fair().strikes; let glowSeen = false, cancelled = false;
    for (let i = 0; i < 90; i++) { BK.P.x = m0.x - 16; BK.P.y = m0.y; BK.P.vx = 0; BK.P.face = -1; BK.P.inv = 0; BK.sim(1); if (m0.mode === 'glow') { glowSeen = true; BK.P.face = 1; break; } }
    for (let i = 0; i < 60; i++) { BK.P.x = m0.x - 16; BK.P.face = 1; BK.P.vx = 0; BK.P.inv = 0; BK.sim(1); }
    cancelled = glowSeen && m0.mode === 'still' && BK.fair().strikes === s0; out.glowCancel = { glowSeen, cancelled, mode: m0.mode };
    // 3. CO-OP: one hero facing it freezes it even with the other's back turned
    BK.god = true; m0.st.mode = 'still'; m0.st.t = 0; const cx0 = m0.x;
    BK.coopStart('warden', false); BK.sim(2); const [A, B] = BK.players(); only([m0]);
    const place = (fa, fb) => { A.x = cx0 - 90; A.y = m0.y; A.vx = 0; A.vy = 0; A.face = fa; B.x = cx0 + 90; B.y = m0.y; B.vx = 0; B.vy = 0; B.face = fb; };
    let moved1 = 0; for (let i = 0; i < 150; i++) { place(-1, -1); BK.sim(1); moved1 = Math.max(moved1, Math.abs(m0.x - cx0)); }
    out.coopOneFacing = { moved: moved1, mode: m0.mode };
    let moved2 = 0; m0.x = cx0; m0.st.x = cx0; for (let i = 0; i < 120; i++) { place(-1, 1); BK.sim(1); moved2 = Math.max(moved2, Math.abs(m0.x - cx0)); }
    out.coopBothAway = { moved: moved2, mode: m0.mode };
    BK.coopEnd();
    // 4. THE HOBBY-HORSE: back turned -> wind, charge, skid, and it stands where it ends; no second charge until it is looked at
    BK.load(fi); BK.start(); BK.sim(5); none(); const h0 = hors().find(h => !h.elite && h.rideIdx === undefined && h.x > 370 * 16 && h.x < 380 * 16); only([h0]); BK.god = true; h0.x = 45 * 16 + 8; h0.y = 28 * 16; h0.st.x = h0.x; h0.st.y = h0.y; h0.vy = 0; BK.sim(2);   /* (claude/fairfix: the small carousel's horse is gone; the slide-foot horse, set down on the gate's flat, lit road) */   /* the small carousel's horse: the slide-foot horse stands under a hill that would end its charge */
    const hh = h0.x - 180; const pinH = f => { BK.P.x = hh; BK.P.y = h0.y; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = f; };
    const hm = new Set(); const hx0 = h0.x; let stillFrames = 0, xEnd = null;
    for (let i = 0; i < 60 * 5; i++) { pinH(-1); BK.sim(1); hm.add(h0.mode); if (h0.mode === 'still' && hm.has('charge')) { stillFrames++; if (xEnd === null) xEnd = h0.x; } }
    out.horse = { modes: [...hm], charges: BK.fair().charges, ranPx: Math.round(hx0 - h0.x), stoodStill: stillFrames > 60, stayed: xEnd !== null && Math.abs(h0.x - xEnd) < 1 };
    const toward = () => (h0.x > hh ? 1 : -1);   // the side it is on now: it ran past him
    for (let i = 0; i < 10; i++) { pinH(toward()); BK.sim(1); }
    for (let i = 0; i < 160; i++) { pinH(-toward()); BK.sim(1); }
    out.horse2 = { charges: BK.fair().charges };
    // 5. THE CAROUSEL: on the ride it warns, then turns him and holds his facing a moment
    BK.load(fi); BK.start(); BK.sim(5); none(); only([]); BK.god = true; const car = BK.L.carousels[0];
    BK.tp(Math.round((car.x0 + car.x1) / 2), car.row - 1); BK.P.face = 1; BK.sim(3);
    let warnAt = null, turnAt = null, faceAfter = null, lockAfter = null, heldRight = null; const w0 = BK.fair().warns, t0 = BK.fair().turns;
    for (let i = 0; i < 60 * 16 && turnAt === null; i++) { BK.sim(1); if (warnAt === null && BK.fair().warns > w0) warnAt = i; if (BK.fair().turns > t0) { turnAt = i; faceAfter = BK.P.face; lockAfter = BK.P.faceLock; } }
    K.right = true; BK.sim(10); heldRight = BK.P.face; BK.sim(50); out.carousel = { warnAt, turnAt, faceAfter, lockAfter, heldRight, faceLater: BK.P.face, onRide: BK.P.ground };
    none();
    // 6. THE ELITE holds the green's door: shut (a portcullis over the opening) until it is dead, then it lifts
    BK.load(fi); BK.start(); BK.sim(5); BK.god = true; const el = BK.enemies().find(e => e.t === 'hobbyhorse' && e.elite), G = BK.L.green, dc = G.door, rowS = 27;
    const shut = () => [24, 25, 26, 27].every(y => BK.L.grid[y * BK.L.W + dc] === 12);
    const before = { elite: !!el, shut: shut(), hp: el && el.hp };
    only([el]); el.hp = 1; BKT.hurtEnemy(el, 5, el.x - 10, false); BK.sim(60);
    out.elite = { ...before, dead: !el.alive, open: !shut() };
    // 7. L2: every section draws without a throw (carousel, haystacks, lamps, the green, the crowd), the lamps are engine lights that follow their life, and a glowing mask draws its halo
    BK.load(fi); BK.start(); BK.sim(5); BK.god = true; out.drawn = 0; for (const c of [30, 130, 300, 400, 526, 580, 646]) { BK.tp(c, 27); BK.sim(20); BK.step(1); out.drawn++; }
    out.lamps = BK.fair().lamps.map(l => [l.life, l.lit]); out.musicBox = (await import('/src/audio.js')).musicBox.on;
    return out;
  })()`, 600000);
} finally { pg2.close(); }
console.log(JSON.stringify(R2).slice(0, 600));
ok(R2.drawn === 7, 'a section of the fair did not draw (' + R2.drawn + ' of 7)');
ok(R2.lamps.length >= 16 && R2.lamps.every(([life, lit]) => life >= 1 ? lit : life <= 0 ? !lit : true) && R2.lamps.some(([life]) => life === 0) && R2.lamps.some(([life]) => life === 1), 'the lamps are not engine lights that follow their life: ' + JSON.stringify(R2.lamps));
ok(R2.modes.includes('creep') && R2.modes.includes('glow') && R2.modes.includes('strike'), 'a mummer with the hero\'s back turned did not creep, glow and strike: ' + R2.modes);
ok(R2.bells >= 3, 'the bells did not jingle while a mummer crept (' + R2.bells + ')');
ok(R2.strikes >= 1 && R2.hpLost >= 8, 'the mummer\'s strike did not hurt the hero from behind (' + R2.hpLost + ')');
ok(R2.glowCancel.glowSeen && R2.glowCancel.cancelled, 'a look during the glow did not cancel the strike in the page: ' + JSON.stringify(R2.glowCancel));
ok(R2.coopOneFacing.moved < 0.5 && R2.coopOneFacing.mode === 'still', 'co-op: a mummer moved with one hero facing it: ' + JSON.stringify(R2.coopOneFacing));
ok(R2.coopBothAway.moved > 8, 'co-op: a mummer stayed frozen with both heroes facing away: ' + JSON.stringify(R2.coopBothAway));
ok(['rear', 'charge', 'skid'].every(m => R2.horse.modes.includes(m)) && R2.horse.charges === 1, 'the horse did not wind, charge and skid exactly once on a turned back: ' + JSON.stringify(R2.horse));
ok(R2.horse.ranPx > 60 && R2.horse.stoodStill && R2.horse.stayed, 'the horse did not stand where its charge ended: ' + JSON.stringify(R2.horse));
ok(R2.horse2.charges === 2, 'a looked-at horse did not charge again when the back was turned: ' + JSON.stringify(R2.horse2));
ok(R2.carousel.warnAt !== null && R2.carousel.turnAt !== null && R2.carousel.warnAt < R2.carousel.turnAt && R2.carousel.faceAfter === -1 && R2.carousel.lockAfter > 0, 'the carousel did not warn and then turn the rider: ' + JSON.stringify(R2.carousel));
ok(R2.elite.elite && R2.elite.shut && R2.elite.dead && R2.elite.open, 'the elite hobby-horse does not shut the green door and open it on its death: ' + JSON.stringify(R2.elite));
ok(R2.carousel.heldRight === -1 && R2.carousel.faceLater === 1, 'the carousel did not hold his facing for a moment and then let him turn back: ' + JSON.stringify(R2.carousel));
console.log(JSON.stringify(R));
ok(R.n >= 6, 'the page spawned ' + R.n + ' mummers');
ok(R.facedMoved < 0.5, 'in the page a faced mummer moved ' + R.facedMoved + ' px');
ok(R.creepDx > 20, 'in the page a mummer with the hero\'s back turned crept only ' + R.creepDx + ' px in 2 s');
ok(R.hit.hp1 < R.hit.hp0, 'a frozen mummer was not hurt by the hero facing it');
ok(!R.hit.alive && R.hit.blows >= 2 && R.hit.blows <= 5, 'a frozen mummer took ' + R.hit.blows + ' blows (about three)');
// a lone BULL'S-EYE (claude/fairfix2): its target struck where its ride has carried it opens it at once - its planks and its bars go to the host
{ const L0 = { strikers: [], tickets: [], galleries: [{ id: 9, targets: [{ x: 10, row: 10, on: { kind: 'gondola', idx: 0 } }], window: 1, planks: [[1, 2, 3]], bars: [[4, 4, 5, 6]] }] }, G0 = FGM.newGames(L0); let got = null, said = '';
  FK.liveTargets(G0.galleries, [{ fair: 'gondola', idx: 0, x: 400, y: 300, w: 30 }]); const t = G0.galleries[0].targets[0];
  const fx = { launch() {}, say: x => { said = x; }, sound() {}, open: (p, b) => { got = [p, b]; } };
  FGM.step(G0, L0, [{ x: 0, y: 0, box: { l: 165, r: 175, t: 155, b: 165 }, hit: new Set() }], fx, DT); ok(!got, 'a bull\'s-eye opened from where it was built, not where its ride had carried it');
  FGM.step(G0, L0, [{ x: 0, y: 0, box: { l: t.px - 4, r: t.px + 4, t: t.py - 4, b: t.py + 4 }, hit: new Set() }], fx, DT); ok(got && got[0].length === 1 && got[1].length === 1 && G0.galleries[0].open && said, 'a bull\'s-eye struck on its ride did not open its planks and bars: ' + JSON.stringify(got)); }
// ---- FAIRFIX2 (2026-10-01; Daniel: "it needs RANGED foes, real PLATFORMING, it's INCREDIBLY EASY at level 1 with no abilities, tickets are unclear, bull's-eyes / hidden paths are underused") ----
{ const fair = LEVELS.find(l => l.id === 'fair'), L = fair.build(), R = 28, TT = (await import('../src/level.js')).T, at = (x, y) => L.grid[y * L.W + x];
  const foes = L.ents.filter(e => ['mummer', 'hobbyhorse', 'stringjack', 'barker', 'drunk', 'archer', 'crow'].includes(e.t)), sq = n => foes.filter(e => e.squad === n);
  const spikedPit = (x0, x1) => { for (let x = x0; x <= x1; x++) if (at(x, R) !== 0 || at(x, R + 1) !== TT.SPIKE) return false; return true; };
  // RANGED, REUSED AND RESKINNED: the Waymeet drunk as the coconut shy, the goblin archer as the knife juggler, the storm crows - each in a designed encounter WITH a facing foe,
  // so it hits your back while you hold a mummer (a ranged foe alone would be sprinkle)
  { const shy = foes.filter(e => e.t === 'drunk' && e.shy), jug = foes.filter(e => e.t === 'archer' && e.juggler), crows = foes.filter(e => e.t === 'crow');
    ok(shy.length >= 1 && jug.length >= 3 && crows.length >= 2 && foes.filter(e => e.t === 'drunk' || e.t === 'archer').every(e => e.shy || e.juggler), 'the fair has not its ranged reskins (a coconut shy, three or more knife jugglers, two crows), or a plain drunk / archer stands in it');
    const faces = e => !!e.squad && [...sq(e.squad), ...(e.cover ? sq(e.cover) : [])].some(q => ['mummer', 'hobbyhorse', 'stringjack'].includes(q.t));   /* (cover: a roof's squad covering the road's - a squad keeps to one floor, tools/sprinkle-cap) */
    ok([...shy, ...jug, ...crows].every(faces) && foes.filter(e => e.cover).every(e => sq(e.cover).length >= 1 && Math.abs(sq(e.cover)[0].x - e.x) <= 16), 'a ranged foe is not in an encounter with a facing foe (it must hit the back you turn), or a cover is not beside what it covers: ' + [...shy, ...jug, ...crows].filter(e => !faces(e)).map(e => e.t + e.x));
    ok(crows.every(e => e.y >= R - 2), 'a crow flies over a hero\'s head (it must come at head height, to be ducked)'); }
  // THE SHARPER FOES: deadlier one-on-one through their hands, never through health
  ok(FK.FAIR_MUMMER.hp === M.MUMMER.hp && FK.FAIR_HORSE.hp === M.HORSE.hp && FK.FAIR_MUMMER.creep > M.MUMMER.creep && FK.FAIR_MUMMER.dmg > M.MUMMER.dmg && FK.FAIR_MUMMER.glow < M.MUMMER.glow && FK.FAIR_MUMMER.glow >= 0.4 && FK.FAIR_MUMMER.recover < M.MUMMER.recover && FK.FAIR_HORSE.dmg > M.HORSE.dmg && FK.FAIR_HORSE.wind >= 0.3,
    'the fair\'s mummer / horse are not sharper than the theatre\'s by their hands alone (same health, a told glow >= 0.4 s and wind >= 0.3 s): ' + JSON.stringify([FK.FAIR_MUMMER, FK.FAIR_HORSE]));
  { const s0 = M.newMummer(400, 400), h = [{ x: 100, y: 400, face: -1, alive: true }]; let x = 400; for (let i = 0; i < 60; i++) { M.mummerStep(s0, { heroes: h, canStep: () => true, C: FK.FAIR_MUMMER }, DT); x += s0.vx * DT; }
    const s1 = M.newMummer(400, 400); let x1 = 400; for (let i = 0; i < 60; i++) { M.mummerStep(s1, { heroes: h, canStep: () => true }, DT); x1 += s1.vx * DT; }
    ok(400 - x > 400 - x1 + 8, 'the fair\'s mummer config does not reach the step (it creeps no faster): ' + Math.round(400 - x) + ' vs ' + Math.round(400 - x1)); }
  { const Tt = { AIR: 0, SPIKE: 3 }, col = rows => (x, y) => rows[y] ?? 1;
    ok(FK.dropOk(col({ 10: 0, 11: 0, 12: 0, 13: 1 }), 0, 10, Tt) && !FK.dropOk(col({ 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 1 }), 0, 10, Tt) && !FK.dropOk(col({ 10: 0, 11: 3 }), 0, 10, Tt), 'a fair mummer does not drop off a roof of four rows or less (or it drops further, or onto spikes)'); }
  { const k = FK.knifeShot(0, 0, 200, 0, 0), kl = FK.knifeShot(0, 0, 200, 0, 92); ok(Math.abs(Math.hypot(k.vx, k.vy) - FK.JUGGLER.speed) < 1 && Math.abs(k.vy) < 1 && kl.vx > 0 && Math.atan2(kl.vy, kl.vx) === 0 && FK.JUGGLER.draw >= 0.4, 'the juggler\'s knife is not a flat, fast throw after a told draw: ' + JSON.stringify(k));
    const e = {}; FK.shyLead(e, { x: 100, y: 400, vx: 92 }, null); ok(e.aimX > 100 + 40, 'the coconut shy does not lead a running hero: ' + e.aimX); }
  // REAL PLATFORMING: the fallen big top's poles over a pit too wide to jump; the wheel the only way over its pit; collapsing stall roofs (and a bunting rope) over a spiked pit; spikes under chair one
  { const P0 = L.poles || []; ok(P0.length >= 2 && spikedPit(97, 97) && spikedPit(102, 102) && P0.every(([x, top]) => at(x, top) === 1 && at(x, top - 1) === 0), 'the fallen big top is not tent poles standing in a spiked pit: ' + JSON.stringify(P0));
    ok((() => { for (let x = 300; x <= 309; x++) if (at(x, R) !== 0 || at(x, R + 1) !== TT.SPIKE) return false; return true; })() && L.wheel && Math.abs(L.wheel.px / 16 - 304.5) < 1.5, 'there is no spiked pit under the big wheel (its cars the only way over)');
    const CR = (L.crumbles || []).filter(c => c.x0 >= 236 && c.x1 <= 243); ok(spikedPit(236, 243) && CR.length >= 2 && CR.every(c => at(c.x0, c.row) === TT.ONEWAY), 'the collapsing stalls do not stand over an eight-wide spiked pit');
    ok((L.zipLines || []).some(z => z.bunting && z.x0 < 237 * 16 && z.x1 > 244 * 16 && z.y1 > z.y0), 'no bunting rope runs down over the collapsing stalls\' pit');
    ok((() => { for (let x = 317; x <= 324; x++) if (at(x, 20) !== TT.SPIKE) return false; return true; })(), 'the hall roof under chair one is not spiked'); }
  // BULL'S-EYES OPEN THINGS: a lone target on a wheel car runs up planks; one in the corn drops a cage's bars (the bars stand at the start, a ticket behind them)
  { const BE = (L.galleries || []).filter(g => g.targets.length === 1); const onCar = BE.find(g => g.targets[0].on && g.targets[0].on.kind === 'gondola'), cage = BE.find(g => (g.bars || []).length);
    ok(BE.length >= 2 && onCar && onCar.planks.length >= 2 && onCar.planks.every(([x0, x1, row]) => at(x0, row) === 0), 'no bull\'s-eye hangs on a wheel car and runs up planks');
    ok(cage && cage.bars.every(([x0, x1, y0, y1]) => at(x0, y0) === 1 && at(x1, y1) === 1) && (L.tickets || []).some(t => cage.bars.some(([x0]) => Math.abs(t.x - x0) <= 2)), 'no bull\'s-eye drops a cage\'s bars with a ticket behind them');
    const mv = [{ fair: 'gondola', idx: onCar.targets[0].on.idx, x: 1000, y: 300, w: 30 }]; FK.liveTargets([onCar], mv); ok(onCar.targets[0].px === 1015 && onCar.targets[0].py > 300, 'a bull\'s-eye on a ride does not move with it'); }
  // THE DOOR IN THE GLASS: a doorway in the hall only a TRUE mirror shows, to a room with a reward and a door back
  { const md = L.ents.find(e => e.t === 'doorway' && e.mirror), back = md && L.ents.find(e => e.t === 'doorway' && e.id === md.to), H = L.hall;
    ok(md && back && back.to === md.id && md.x >= H.x0 && md.x <= H.x1 && L.fortune && L.ents.some(e => (e.t === 'mend' || e.t === 'silver') && e.x >= L.fortune.x0 && e.x <= L.fortune.x1 && e.y >= L.fortune.y0) && at(back.x, back.y) === 0, 'the hall has no door in the glass to a room with a reward');
    const door = { x: md.x * 16 + 8, y: (md.y + 1) * 16 };
    ok(FK.mirrorDoorOpen(L, door, { x: door.x, y: door.y, face: -1 }) && !FK.mirrorDoorOpen(L, door, { x: door.x, y: door.y, face: 1 }) && !FK.mirrorDoorOpen(L, door, { x: door.x + 80, y: door.y, face: -1 }), 'the door in the glass does not show only to a hero at it facing the true glass'); }
  // TICKETS ARE KEYS: keysStep opens a gate only at its price, and tells a hero at a shut gate what it costs
  { const K = FK.newKeys(L), g0 = K.gates[0], hx = { x: g0.x * 16 + 8, y: (g0.y1 + 1) * 16, dead: false };
    const a = FK.keysStep(K, L, [hx], g0.need - 1, DT), b = FK.keysStep(K, L, [hx], g0.need, DT), far = FK.keysStep(FK.newKeys(L), L, [{ ...hx, x: hx.x + 400 }], 99, DT);
    ok(a.some(v => v.t === 'ask' && v.need === g0.need) && !a.some(v => v.t === 'open') && b.some(v => v.t === 'open' && v.g === g0) && !far.length, 'a ticket gate opens below its price, or does not open at it, or opens from afar');
    const all = K.gates.find(g => g.all), hb = { x: all.x * 16 + 8, y: all.y0 * 16, dead: false }; ok(!FK.keysStep(K, L, [hb], FK.ticketTotal(L) - 1, DT).some(v => v.t === 'open') && FK.keysStep(K, L, [hb], FK.ticketTotal(L), DT).some(v => v.t === 'open'), 'the back lot opens without every ticket'); }
}
// ---- IN THE PAGE, THE VERTICAL REBUILD (claude/fairlevel): slopes drawn, the strikers for EVERY hero, the gallery, the tickets and the booth, the hall's glass, the night, the maze's walls, the scarecrows ----
const pg3 = await openPage({ audio: false, fonts: false });
let R3;
try {
  R3 = await pg3.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const fi = LEVELS.findIndex(l => l.id === 'fair'); const out = {};
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const load = (hero, keep) => { BK.setHero(hero || 'knight'); BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.sim(5); if (!keep) for (const e of BK.enemies()) e.alive = false; none(); BK.god = true; };
    const G = () => BK.fair().games, grid = (x, y) => BK.L.grid[y * BK.L.W + x];
    // 0. EVERY SLOPE CELL IS DRAWN (the tile painter reached only the Sunken Caravan: the Stall Stair was empty air over a staircase of grass tops)
    load(); out.slope = BK.slopeArt();
    // 1. THE HIGH STRIKER, EVERY HERO: jump, come down on the pad with the plunge, and land on the boardwalk (row 19). The light blow only hops. The bell pays tickets once.
    out.strike = {};
    for (const hero of ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer']) { load(hero); const S = G().strikers[0], o = {};
      BK.tp(88, 27); BK.P.face = 1; BK.sim(30); const t0 = G().tickets; let ph = 0, minY = 1e9, landed = false;
      for (let i = 0; i < 400; i++) { const p = BK.P; K.jump = false; K.down = false;
        if (ph === 0 && p.ground) { K.jump = true; BK.press('jump'); ph = 1; } else if (ph === 1 && p.vy > 40) { K.down = true; BK.press('atk'); ph = 2; } else if (ph === 2) { K.down = true; if (p.vy < -300) ph = 3; }
        BK.sim(1); minY = Math.min(minY, BK.P.y); if (ph === 3 && BK.P.ground && Math.abs(BK.P.y - 19 * 16) < 4) { landed = true; break; } }
      none(); out.strike[hero] = { minY: Math.round(minY), landed, tickets: G().tickets - t0, rang: S.hits >= 1 }; }
    { load(); const S = G().strikers[0]; BK.tp(88, 27); BK.P.face = 1; BK.sim(30); const y0 = BK.P.y; let minY = 1e9; BK.press('atk'); for (let i = 0; i < 40; i++) { BK.sim(1); minY = Math.min(minY, BK.P.y); } out.lightHop = { rise: y0 - minY, tickets: G().tickets, rang: S.hits }; }
    // 2. THE GALLERY: three targets inside the window opens the planks (the tiles appear), two and the clock runs out resets them
    load(); { const Gy = G().galleries[0], ts = Gy.targets; out.gal0 = { open: Gy.open, plank: grid(186, 19), n: ts.length };
      const hitAt = t => { BK.tp(t.x - 1, 21); BK.P.face = 1; BK.sim(4); BK.press('atk'); BK.sim(10); };
      hitAt(ts[0]); hitAt(ts[1]); out.gal2 = { hits: ts.filter(t => t.hit).length, open: Gy.open }; hitAt(ts[2]); out.gal3 = { hits: ts.filter(t => t.hit).length, open: Gy.open, plank: grid(186, 19), plank2: grid(183, 16), nest: grid(178, 13) }; }
    load(); { const Gy = G().galleries[0], ts = Gy.targets; const hitAt = t => { BK.tp(t.x - 1, 21); BK.P.face = 1; BK.sim(4); BK.press('atk'); BK.sim(10); };
      hitAt(ts[0]); hitAt(ts[1]); BK.tp(160, 27); BK.sim(60 * 24); out.galReset = { hits: ts.filter(t => t.hit).length, open: Gy.open, plank: grid(186, 19) }; }
    // 2b. THE OTHER TWO GALLERIES open their own planks (the ticket yard's to the hall roof, the last stalls' to the nest under the night lane)
    load(); { const gs = G().galleries; out.galN = [];
      for (const [i, probe] of [[2, [344, 25]], [3, [583, 25]]]) { const Gy = gs.find(g => g.id === i);   /* (by id: the bull's-eyes stand among them now, claude/fairfix2) */ for (const t of Gy.targets) { BK.tp(t.x - 1, 27); BK.P.face = 1; BK.sim(4); BK.press('atk'); BK.sim(10); } out.galN.push({ i, hits: Gy.targets.filter(t => t.hit).length, open: Gy.open, plank: grid(probe[0], probe[1]) }); } }
    // 2c. A HORSE ON A GONDOLA: it rides the wide car round the wheel, on the car, never on the ground
    load(undefined, true); { const h = BK.enemies().find(q => q.t === 'hobbyhorse' && q.rideIdx !== undefined); let off = 0, low = 0; BK.tp(280, 27); for (let i = 0; i < 700; i++) { BK.P.x = 280 * 16; BK.P.y = 27 * 16 + 16; BK.P.vx = 0; BK.P.vy = 0; BK.sim(1); if (h.ride) { off = Math.max(off, Math.abs(h.x - (h.ride.x + h.rx))); if (h.y > 28 * 16 - 2) low++; } } out.rider = { has: !!h, ride: !!(h && h.ride), off, onGround: low, y0: h && h.ride && h.ride.y }; }
    // 3. THE TICKETS AND THE PRIZE BOOTH: a touch takes one; eight buy the silver (it is out of the world until then); seven do not
    load(); { const g0 = G().tickets; BK.tp(84, 18); BK.sim(6); out.tk1 = { got: G().tickets - g0, taken: G().taken.size };
      /* TICKETS ARE KEYS (claude/fairfix2): the loft's gate stays shut one ticket short and swings open (its tiles go) at its price; the back lot's hatch opens on every ticket, and you fall into it */
      const tile = (x, y) => BK.L.grid[y * BK.L.W + x], lg = BK.fair().keys.gates[0];
      G().tickets = lg.need - 1; BK.tp(lg.x - 1, lg.y1); BK.sim(12); out.gateShort = { open: lg.open, solid: tile(lg.x, lg.y1) };
      G().tickets = lg.need; BK.sim(12); out.gateOpen = { open: lg.open, solid: tile(lg.x, lg.y1), held: G().tickets };
      const bl = BK.fair().keys.gates.find(g => g.all); G().tickets = G().total - 1; BK.tp(bl.x, 27); BK.sim(30); out.backShut = { open: bl.open };
      G().tickets = G().total; BK.sim(90); out.backLot = { open: bl.open, fell: BK.P.y > 29 * 16, total: G().total }; }   /* (down through the hatch onto its stair) */
    // 4. THE HALL OF MIRRORS: the mummer by the door creeps up behind you where the glass cannot see, and is held where a true mirror is ahead; the dark shortens the look
    load(undefined, true); { const ms = BK.enemies().filter(e => e.t === 'mummer').sort((a, b) => a.x - b.x), B0 = ms.find(e => e.x >= 317 * 16 && e.x <= 340 * 16); for (const e of BK.enemies()) if (e !== B0) e.alive = false; B0.alive = true;   /* (claude/fairfix: the hall's one mummer, set by the door; the marionette put away) */
      const run = (hx, face, frames) => { const x0 = B0.x; B0.st.mode = 'still'; for (let i = 0; i < frames; i++) { BK.P.x = hx * 16; BK.P.y = 28 * 16; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = face; BK.sim(1); } return Math.abs(x0 - B0.x); };
      B0.x = 319 * 16; B0.st.x = B0.x; out.hallHeld = run(328, 1, 90); B0.x = 319 * 16; B0.st.x = B0.x; out.hallCracked = run(324, 1, 90);   // 328 has a true mirror within 7 tiles ahead; 324 does not
      out.hallMoved = { held: out.hallHeld, cracked: out.hallCracked }; }
    // 5. THE NIGHT: a mummer up in the dark is held only within 88 px (132 with the ribbon), a lantern's light restores the full look
    load(undefined, true); { const e = BK.enemies().find(q => q.t === 'mummer' && q.x > 350 * 16 && q.x < 360 * 16); e.alive = true; for (const q of BK.enemies()) if (q !== e) q.alive = false; const y = e.y;
      const ex0 = e.x, dist = (d, relic) => { e.st.mode = 'still'; e.x = ex0; e.st.x = ex0; e.y = y; BK.P.relic = relic || null; for (const l of BK.fair().lamps) { l.life = 0; l.lit = false; } const x0 = e.x; for (let i = 0; i < 60; i++) { BK.P.x = e.x - d; BK.P.y = y; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = 1; BK.sim(1); } return Math.abs(e.x - x0) > 1.5 ? 'moved' : 'held'; };
      out.night = { d60: dist(60), d120: dist(120), d120ribbon: dist(120, 'maypole'), d200ribbon: dist(200, 'maypole') }; BK.P.relic = null; }
    // 6. THE CORN MAZE: a mummer one tier up is not held by a hero looking straight at its column (the wall is between), and the disguised ones wake only when they move
    load(undefined, true); { const M = BK.L.maze, sc = BK.enemies().filter(q => q.t === 'mummer' && q.scare); out.scare = { n: sc.length, woke: sc.filter(q => q.woke).length }; for (const q of BK.enemies()) q.alive = false; const e = sc[1]; e.alive = true;
      const hy = 28 * 16, ex = (M.x0 + 12) * 16; e.st.mode = 'still'; e.x = ex; e.y = 23 * 16; e.st.x = e.x; e.st.y = e.y; e.woke = false; const x0 = e.x; for (let i = 0; i < 90; i++) { BK.P.x = ex - 50; BK.P.y = hy; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = 1; BK.sim(1); }
      out.blind = { crept: Math.abs(e.x - x0) > 1.5, woke: !!e.woke, mode: e.mode }; }
    // 7. EVERYTHING DRAWS (the rides, the tower, the hall, the maze, the effigies, the night) with no throw
    load(); out.drawn = 0; for (const [x, y] of [[52, 27], [118, 27], [172, 21], [205, 27], [276, 25], [304, 27], [316, 16], [326, 27], [354, 18], [372, 13], [425, 27], [424, 17], [484, 27], [536, 25], [572, 13], [588, 27], [646, 27]]) { BK.tp(x, y); BK.sim(25); BK.step(1); out.drawn++; }
    return out; })()`, 900000);
} finally { pg3.close(); }
console.log(JSON.stringify(R3).slice(0, 1400));
ok(R3.slope.cells >= 24 && R3.slope.drawn === R3.slope.cells, 'a slope cell has no picture: ' + JSON.stringify(R3.slope) + ' (the tile painter draws slopes only for levels its guard names)');
for (const h of ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer']) { const s = R3.strike[h]; ok(s && s.landed && s.minY <= 19 * 16 - 8 && s.rang && s.tickets === 2, 'the high striker does not throw ' + h + ' onto the boardwalk with a plunge: ' + JSON.stringify(s)); }
ok(R3.lightHop.rang >= 1 && R3.lightHop.rise >= 10 && R3.lightHop.rise <= 40 && R3.lightHop.tickets === 0, 'a light blow on the striker does more than hop (or pays): ' + JSON.stringify(R3.lightHop));
ok(R3.gal0.n === 3 && !R3.gal0.open && R3.gal0.plank === 0, 'the gallery starts open: ' + JSON.stringify(R3.gal0));
ok(R3.gal2.hits === 2 && !R3.gal2.open, 'the gallery opened on two hits: ' + JSON.stringify(R3.gal2));
ok(R3.gal3.open && R3.gal3.plank === 2 && R3.gal3.plank2 === 2 && R3.gal3.nest === 2, 'three hits inside the window did not run the planks up to the crow\'s nest: ' + JSON.stringify(R3.gal3));
ok(R3.galReset.hits === 0 && !R3.galReset.open && R3.galReset.plank === 0, 'two hits and a missed window did not reset the gallery: ' + JSON.stringify(R3.galReset));
ok(R3.galN.length === 2 && R3.galN.every(g => g.hits === 3 && g.open && g.plank === 2), 'the ticket yard\'s and the last stalls\' galleries did not open their planks: ' + JSON.stringify(R3.galN));
ok(R3.rider.has && R3.rider.ride && R3.rider.off < 0.5, 'the horse on the wheel\'s wide car does not ride it: ' + JSON.stringify(R3.rider));
ok(R3.tk1.got === 1 && R3.tk1.taken === 1, 'a ticket touched was not taken: ' + JSON.stringify(R3.tk1));
ok(!R3.gateShort.open && R3.gateShort.solid === 1 && R3.gateOpen.open && R3.gateOpen.solid === 0 && R3.gateOpen.held === 5, 'the loft\'s ticket gate did not stay shut one short and open (keeping the tickets: a key, not a price) at five: ' + JSON.stringify([R3.gateShort, R3.gateOpen]));
ok(!R3.backShut.open && R3.backLot.open && R3.backLot.fell && R3.backLot.total >= 30, 'the back lot\'s hatch did not open on every ticket (and only then), dropping you in: ' + JSON.stringify([R3.backShut, R3.backLot]));
ok(R3.hallHeld < 1.5, 'the mummer behind a hero who faces true glass crept ' + R3.hallHeld + ' px: the mirror does not hold it');
ok(R3.hallCracked > 6, 'the mummer behind a hero in the cracked stretch did not creep (' + R3.hallCracked + ' px): nothing watches his back there');
ok(R3.night.d60 === 'held' && R3.night.d120 === 'moved' && R3.night.d120ribbon === 'held' && R3.night.d200ribbon === 'moved', 'the night look is not 88 px (132 with the ribbon): ' + JSON.stringify(R3.night));
ok(R3.scare.n === 3 && R3.scare.woke === 0, 'the corn maze has not three mummers in scarecrows\' coats, asleep: ' + JSON.stringify(R3.scare));
ok(R3.blind.crept && R3.blind.woke, 'a mummer one tier up (a wall between) was held by a look through the wall: ' + JSON.stringify(R3.blind));
ok(R3.drawn === 17, 'a set piece of the fair did not draw (' + R3.drawn + ' of 17)');

// ---- IN THE PAGE, THE FIX (claude/fairfix): the marionette and the barker in the real game, the carousel turns a runner and a hopper, the slide lands you with the horse behind, the ghost train ----
const pg4 = await openPage({ audio: false, fonts: false });
let R4;
try {
  R4 = await pg4.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const fi = LEVELS.findIndex(l => l.id === 'fair'); const out = {};
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const load = (keep) => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.sim(5); for (const e of BK.enemies()) if (!keep || !keep(e)) e.alive = false; none(); BK.god = true; };
    const put = (e, col, row) => { e.alive = true; e.x = col * 16 + 8; e.y = (row + 1) * 16; e.vy = 0; if (e.st) { e.st.x = e.x; e.st.y = e.y; } };
    const pin = (x, y, f) => { BK.P.x = x; BK.P.y = y; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = f; };
    // 1. THE MARIONETTE: on the gate's lit road, looked at from 110 px it comes; with the hero's back to it, it does not move; its cut hurts a hero who looks and does not guard
    load(e => e.t === 'stringjack'); { const m = BK.enemies().find(e => e.t === 'stringjack'); for (const e of BK.enemies()) if (e !== m) e.alive = false; put(m, 40, 27); m.st.mode = 'hang'; BK.sim(2);
      const x0 = m.x; for (let i = 0; i < 60; i++) { pin(m.x - 110, m.y, -1); BK.sim(1); } out.mAway = Math.abs(m.x - x0);
      const x1 = m.x; for (let i = 0; i < 30; i++) { pin(x1 - 110, m.y, 1); BK.sim(1); } out.mFaced = Math.abs(m.x - x1);
      BK.god = false; BK.P.hp = BK.P.maxHp; const hp0 = BK.P.hp, c0 = BK.fair().cuts; for (let i = 0; i < 150; i++) { pin(m.x - 18, m.y, 1); BK.P.inv = 0; BK.sim(1); } out.mCut = { cuts: BK.fair().cuts - c0, lost: hp0 - BK.P.hp }; BK.god = true; }
    // 2. THE BARKER: a hero with his back to him in range is turned to face him after the told wind-up, and held; a blow in the wind-up kills the call
    load(e => e.t === 'barker'); { const b = BK.enemies().find(e => e.t === 'barker' && e.x > 500 * 16); for (const e of BK.enemies()) if (e !== b) e.alive = false; put(b, 40, 27); b.home = { x: b.x, y: b.y }; b.st.callT = 0.4; BK.sim(1);
      let turnedAt = null, tellSeen = false, lockMax = 0; const c0 = BK.fair().calls;
      for (let i = 0; i < 150 && turnedAt === null; i++) { pin(b.x - 140, b.y, -1); BK.sim(1); if (b.mode === 'callTell') tellSeen = true; if (BK.P.face === 1) { turnedAt = i; lockMax = BK.P.faceLock; } }
      out.call = { tellSeen, turnedAt, lock: lockMax, calls: BK.fair().calls - c0 };
      b.st.mode = 'stand'; b.st.callT = 0.2; let inTell = false; for (let i = 0; i < 40 && !inTell; i++) { pin(b.x - 140, b.y, -1); BK.sim(1); inTell = b.mode === 'callTell'; }
      const c1 = BK.fair().calls; b.stagger = 0.4; for (let i = 0; i < 90; i++) { pin(b.x - 140, b.y, -1); BK.sim(1); if (b.mode === 'callTell') break; } out.cutShort = { inTell, calls: BK.fair().calls - c1 };
      // co-op: both heroes turned
      b.st.mode = 'stand'; b.st.callT = 0.3; BK.coopStart('warden', false); BK.sim(2); for (const e of BK.enemies()) if (e !== b) e.alive = false; const [A, B] = BK.players();
      let both = false; for (let i = 0; i < 160 && !both; i++) { A.x = b.x - 120; A.y = b.y; A.vx = 0; A.vy = 0; B.x = b.x + 120; B.y = b.y; B.vx = 0; B.vy = 0; if (i === 0) { A.face = -1; B.face = 1; } BK.sim(1); both = A.face === 1 && B.face === -1; }
      out.coopCall = both; BK.coopEnd(); }
    // 3. THE CAROUSEL CANNOT BE CROSSED UNTURNED: running across it, and hopping across it
    for (const hop of [false, true]) { load(); const c = BK.L.carousels[0]; BK.tp(c.x0, c.row - 1); BK.P.face = 1; BK.sim(2); const t0 = BK.fair().turns;   /* from the disc's near edge, flat out */
      for (let i = 0; i < 600 && BK.P.x < (c.x1 + 3) * 16; i++) { K.right = true; K.jump = false; if (hop && BK.P.ground && BK.P.x > c.x0 * 16) { K.jump = true; BK.press('jump'); } BK.sim(1); }
      none(); out[hop ? 'hopTurns' : 'runTurns'] = BK.fair().turns - t0; }
    // 4. THE SLIDE LANDS YOU WITH THE HORSE AT YOUR BACK: come down it, stand, and the stall's horse rears and charges
    load(e => e.t === 'hobbyhorse'); { const S = BK.L.slide, h = BK.enemies().find(e => e.t === 'hobbyhorse' && e.x >= S.stall.x0 * 16 && e.x <= (S.stall.x1 + 1) * 16); for (const e of BK.enemies()) if (e !== h) e.alive = false;
      BK.tp(S.x0 - 1, S.y0 - 1); BK.P.face = 1; BK.sim(5); const c0 = BK.fair().charges; let chargeBehind = null; for (let i = 0; i < 400 && !(BK.P.ground && BK.P.x > (S.x0 + S.n) * 16); i++) { K.right = true; K.down = true; BK.sim(1); if (chargeBehind === null && h.mode === 'charge') chargeBehind = h.x < BK.P.x; } none();
      out.land = { x: Math.round(BK.P.x / 16), face: BK.P.face, horseBehind: h.x < BK.P.x }; for (let i = 0; i < 90; i++) { BK.sim(1); if (chargeBehind === null && h.mode === 'charge') chargeBehind = h.x < BK.P.x; } out.land.charged = BK.fair().charges - c0; out.land.chargeBehind = chargeBehind; }   /* (it may rear as you pass over its stall: the charge meets you as you land) */
    // 5. THE GHOST TRAIN: cross the start line and stand still - it kills; with god on, a mummer left behind in the cutting is run over
    load(); { const C = BK.L.chases[0]; BK.god = false; BK.P.hp = BK.P.maxHp; BK.tp(Math.floor(C.trigger / 16) + 1, 30); BK.sim(2); let dead = false, t = 0;
      for (let i = 0; i < 60 * 14 && !dead; i++) { none(); BK.sim(1); t = i; dead = !!BK.P.dead || BK.P.hp <= 0; } out.trainKills = { dead, secs: +(t / 60).toFixed(1) }; }
    load(e => e.t === 'mummer' && e.y === 30 * 16 + 16); { const C = BK.L.chases[0], mm = BK.enemies().filter(e => e.t === 'mummer' && e.alive); const r0 = BK.fair().runOver; BK.tp(Math.floor(C.trigger / 16) + 1, 30); BK.sim(2);
      for (let i = 0; i < 60 * 12 && BK.P.x < C.end - 120; i++) { K.right = true; BK.sim(1); } none(); for (const e of mm) if (e.alive) e.stagger = 30;   /* (claude/fairfix2: the fair's mummers creep after you faster than the fire comes at first - stun the ones left behind, and wait for it) */
      for (let i = 0; i < 60 * 10 && BK.fair().runOver === r0 && !BK.P.dead; i++) BK.sim(1); for (let i = 0; i < 60 * 4 && BK.P.x < C.end + 16; i++) { K.right = true; BK.sim(1); } none(); out.runOver = { mummers: mm.length, runOver: BK.fair().runOver - r0 }; }
    return out; })()`, 900000);
} finally { pg4.close(); }
console.log(JSON.stringify(R4));
ok(R4.mAway < 0.5 && R4.mFaced > 12, 'in the page the marionette does not move only while looked at: ' + JSON.stringify({ away: R4.mAway, faced: R4.mFaced }));
ok(R4.mCut.cuts >= 1 && R4.mCut.lost >= 8, 'in the page the marionette\'s cut did not hurt a hero looking at it: ' + JSON.stringify(R4.mCut));
ok(R4.call.tellSeen && R4.call.turnedAt !== null && R4.call.lock > 0.3 && R4.call.calls === 1, 'in the page the barker\'s call did not turn the hero to face him (told, then held): ' + JSON.stringify(R4.call));
ok(R4.cutShort.inTell && R4.cutShort.calls === 0, 'a blow in the barker\'s wind-up did not cut the call short: ' + JSON.stringify(R4.cutShort));
ok(R4.coopCall, 'co-op: the barker\'s call did not turn both heroes');
ok(R4.runTurns >= 1 && R4.hopTurns >= 1, 'the carousel can be crossed without being turned (run ' + R4.runTurns + ', hop ' + R4.hopTurns + ')');
ok(R4.land.face === 1 && R4.land.horseBehind && R4.land.charged >= 1 && R4.land.chargeBehind === true, 'the slide does not land you with the stall\'s horse at your back (it should rear and charge): ' + JSON.stringify(R4.land));
ok(R4.trainKills.dead, 'the effigy\'s fire did not kill a hero who stood still in its lane: ' + JSON.stringify(R4.trainKills));
ok(R4.runOver.mummers >= 2 && R4.runOver.runOver >= 1, 'the effigy\'s fire did not take a mummer left behind in its lane: ' + JSON.stringify(R4.runOver));

if (bad.length) { console.error('HARVEST-FAIR (page): ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('harvest-fair ok');
