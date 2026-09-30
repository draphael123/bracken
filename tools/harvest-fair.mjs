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

// ---- THE LEVEL ----
const fi = LEVELS.findIndex(l => l.id === 'fair'), fair = LEVELS[fi], fields = LEVELS.find(l => l.id === 'fields'), way = LEVELS.find(l => l.id === 'waymeet');
ok(!!fair, 'there is no level with id "fair" in LEVELS');
if (fair) {
  ok(fair.needs === 'waymeet', 'the fair does not need WAYMEET: ' + fair.needs);
  ok(fields && fields.needs === 'fair', 'THE HEXED FIELDS do not need the fair: ' + (fields && fields.needs));
  ok(way && way.needs === 'causeway', 'Waymeet\'s road changed');
  ok(/DON'T TURN YOUR BACK ON THEM/.test(fair.rule || ''), 'the level\'s rule is not DON\'T TURN YOUR BACK ON THEM: ' + fair.rule);
  ok(/HARVEST FAIR/.test(fair.name || ''), 'the level is not called THE HARVEST FAIR');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const nodes = src.slice(src.indexOf('const INLAND_NODES'), src.indexOf('const INLAND_PATH'));
  const ids = [...nodes.matchAll(/id: '([a-z]+)', kind: 'level'/g)].map(m => m[1]);
  ok(ids.indexOf('waymeet') >= 0 && ids.indexOf('fair') === ids.indexOf('waymeet') + 1 && ids.indexOf('fields') === ids.indexOf('fair') + 1, 'the map does not run Waymeet, the fair, the Hexed Fields in that order: ' + ids.join(','));
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
    ok(inn('teach', 'mummer').length === 1 && inn('teach', 'hobbyhorse').length === 0, 'the TEACH section is not exactly one mummer (' + inn('teach').length + ' facers)');
    ok(mum.indexOf(mum.slice().sort((a, b) => a.x - b.x)[0]) >= 0 && mum.slice().sort((a, b) => a.x - b.x)[0].x >= arc.teach[0] && mum.slice().sort((a, b) => a.x - b.x)[0].x < arc.teach[1], 'the first mummer in the level is not in the TEACH section');
    const dv = inn('develop', 'mummer'), st = L.stair || {}; ok(dv.length >= 3 && dv.filter(e => e.x < st.x0).length >= 2 && dv.some(e => e.x >= st.top), 'the DEVELOP section is not a pincer: two mummers at the foot of the climb (' + JSON.stringify(st) + ') and one at its top (' + dv.map(e => e.x).join(',') + ')');
    ok(L.grid.some(t => t === 22) && L.grid.some(t => t === 23) && L.grid.some(t => t === 24), 'the climb is not built of slopes (a mummer must be able to walk up it)');
    ok(inn('twist', 'mummer').length >= 2, 'the TWIST section (the carousel) has fewer than two mummers');
    ok(inn('combine', 'hobbyhorse').length >= 1, 'the COMBINE section has no hobby-horse');
    ok(inn('exam').length >= 3 && inn('exam', 'hobbyhorse').length >= 2 && inn('exam', 'mummer').length >= 1, 'the EXAM does not combine the small carousel\'s mummer and horse with the door guard');
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
  ok(L.music === 'marketday' || !!L.music, 'the fair has no music');
  ok(!!L.ents.find(e => e.t === 'sign' && /BACK/.test(e.text || '')), 'no sign says the rule'); }


// ---- L2 (2026-09-29): THE INDEX WEIGHTS, THE FURNITURE, THE LAMPS, THE ART AND THE AUDIO ----
{ const fair = LEVELS.find(l => l.id === 'fair'), L = fair.build(), T2 = { BOUNCER: 10, SPIKE: 3, AIR: 0, SOLID: 1 }, TS2 = 16;
  // Daniel approved the greybox with the index at 34 against ~117 and no extra bodies: the mummer is a 5, the hobby-horse a 6
  ok(THREAT.mummer >= 5 && THREAT.hobbyhorse >= 6, 'the mummer / hobby-horse are not weighed 5 / 6 in src/threat.js: ' + THREAT.mummer + ' / ' + THREAT.hobbyhorse);
  { const m = measureLevel(L, { T: T2, TS: TS2 }); const idx = indexOf({ threat: m.threat, kinds: m.kinds, hazTiles: m.hazTiles, gap: m.gap, span: spanOf(L.W, L.H) });
    ok(idx >= 38 && idx <= 60, 'the fair INDEX is ' + idx + ' (about 45 after the weights, 34 before): ' + JSON.stringify(m)); }
    // FURNITURE: what Waymeet and the Fields carry (three silvers, a relic, hearts); NO NPCs (pickups only)
  const cnt = t => L.ents.filter(e => e.t === t).length;
  ok(cnt('silver') === 3, 'the fair has ' + cnt('silver') + ' silvers, not the campaign three');
  ok(cnt('relic') === 1 && L.ents.find(e => e.t === 'relic').kind === 'maypole', 'the fair has not one relic (the maypole ribbon): ' + cnt('relic'));
  ok(cnt('mend') >= 3, 'the fair has ' + cnt('mend') + ' hearts (mend): three, one after each hard stretch');
  ok(!L.ents.some(e => ['npc', 'stray', 'captive', 'folk', 'squire'].includes(e.t)), 'an NPC or stray stands in the fair (pickups only)');
  ok(L.ents.filter(e => e.t === 'check').length >= 6, 'fewer than six shrines (checkpoints) in the fair');
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
  ok(L.music === 'marketday', 'the fair base track is not marketday');
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
  ok(cnt('mummer') === 12 && cnt('hobbyhorse') === 4, 'the fair foe count moved (12 mummers + 4 horses, each in a designed encounter): ' + cnt('mummer') + ' + ' + cnt('hobbyhorse'));
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
    ok(sl && sl.n >= 14 && run === sl.n && at(sl.x0 + sl.n, R - 1) === 0 && at(sl.x0 + sl.n, R) === 1, 'the helter-skelter is not a 14-column, 14-row slide of steep slopes that meets the road: ' + JSON.stringify(sl) + ' run ' + run);
    ok(L.tower && L.tower.top <= 14 && at(L.tower.x0, L.tower.top) === 1 && at(L.tower.x0, L.tower.top - 1) === 0, 'the helter-skelter tower is not a solid column to the road with a top at row 14');
    ok(L.arc.twist[1] - L.arc.twist[0] >= 120 && sl.x0 + sl.n <= L.arc.twist[1] + 3, 'the slide does not land in the section after the twist'); }
  // TWO ROADS: the low road (the hall of mirrors and the tower stair) and the high road (the wheel and the swing ride) both reach the tower top (the route pilot walks them: tools/fair-route.mjs)
  { const seenPlain = floodReach(L, TT, {}).seen, tower = (L.tower.x0 + 1) + ',' + (L.tower.top - 1); ok(seenPlain.has(tower), 'the tower top is not on the low road (the stair): the plain fill does not reach it');
    const hall = L.hall; ok(hall && hall.mirrors.some(m => m.kind === 'true') && hall.mirrors.some(m => m.kind === 'cracked') && hall.x1 - hall.x0 >= 20, 'the hall of mirrors has no true and cracked glass');
    const A = L.ents.filter(e => e.t === 'mummer' && e.x >= hall.x0 && e.x <= hall.x1).sort((a, b) => a.x - b.x);
    ok(A.length === 2 && A[0].x < hall.mirrors.find(m => m.kind === 'true').x1 + 1 && A[1].x >= hall.mirrors.find(m => m.kind === 'cracked').x0 && A[1].x <= hall.mirrors.find(m => m.kind === 'cracked').x1, 'the hall\'s mummers are not one at the door and one in front of the cracked glass (' + A.map(e => e.x) + ')'); }
  // THE GAMES, each taught -> developed -> twisted -> examined
  { const S = L.strikers || [], GS = L.galleries || [], G = GS[0], B = L.booth, tk = L.tickets || [];
    ok(S.length === 3 && S[0].x < S[1].x && S[1].x < S[2].x && S[0].launch === -600 && S[1].big && S[2].big && !S[0].big && S[1].launch < S[0].launch, 'the fair has not three strikers, the first small (taught at the gate) and two tall (over the maze, before the door): ' + JSON.stringify(S));
    for (const s of S) { const rise = s.launch * s.launch / 2000 / TS3; let top = null; for (let y = R - 1; y >= 0; y--) if (at(s.x, y) === TT.ONEWAY) { top = y; break; }   // the plank over the pad
      ok(top !== null && R - top + 1 <= rise && R - top >= 8, 'the striker at ' + s.x + ' does not throw you onto a plank over it: plank row ' + top + ', it throws ' + rise.toFixed(1) + ' rows'); }
    ok(GS.length === 3 && GS.every(g => g.targets.length === 3 && g.planks.length >= 2 && g.window >= 8 && g.window <= 15) && GS[0].window > GS[1].window && GS[1].window > GS[2].window, 'the shooting galleries are not three of three targets, each with a shorter window (taught, developed, examined): ' + JSON.stringify(GS.map(g => [g.targets.length, g.planks.length, g.window])));
    ok(GS.every(g => g.planks.every(([x0, x1, row]) => { for (let x = x0; x <= x1; x++) if (at(x, row) !== 0) return false; return true; })), 'a gallery plank is already built: it should only exist once the targets are hit');
    ok(new Set(GS.map(g => Math.floor(g.targets[0].x / 100))).size === 3, 'the three galleries do not stand in three different stretches of the level');
    ok(G && L.ents.some(e => e.t === 'silver' && e.x >= G.nest.x0 && e.x <= G.nest.x1 && e.y === G.nest.row - 1), 'the crow\'s nest holds no silver');
    ok(B && B.cost === 8 && tk.length >= 20 && tk.length + S.reduce((a, s) => a + s.tickets, 0) >= B.cost + 12, 'the tickets do not pay for the booth with a little to spare: ' + tk.length + ' found, cost ' + (B && B.cost));
    ok(B && L.ents.some(e => e.t === 'silver' && e.x === B.silver.x), 'the prize booth\'s silver is not on the level');
    const sil = L.ents.filter(e => e.t === 'silver'); ok(sil.length === 3 && sil.some(e => e.y >= R + 1) && G && sil.some(e => e.x >= G.nest.x0 && e.x <= G.nest.x1) && B && sil.some(e => e.x === B.silver.x), 'the three silvers are not the back lot\'s, the crow\'s nest\'s and the booth\'s'); }
  // TWO SECRETS: a plug of plain rock in the road, a cellar with a stair back up, and something in it (the back lot; the closet behind the cracked glass)
  { const W = L.walls || []; ok(W.length === 2 && W.every(w => w.kind === 'secret' && w.reach === true && w.y0 === R && w.y1 === R && w.x1 - w.x0 === 1), 'the fair has not two secret plugs in the road: ' + W.length);
    for (const w of W) {
      ok(at(w.x0, R) === 1 && at(w.x1, R) === 1, 'a secret plug is not solid rock (plain, so it reads as road)');
      ok(at(w.x0, R + 1) === 0 && at(w.x0 + 5, R + 6) === 0 && at(w.x0, R + 7) === 1, 'the cellar under the plug at ' + w.x0 + ' is not a room (rows 29-34, a floor at 35)');
      ok(at(w.x0 + 2, R + 4) === TT.ONEWAY && at(w.x0, R + 2) === TT.ONEWAY, 'the cellar under ' + w.x0 + ' has no stair back up (a step at row 32 and one at row 30 under the plug)');
      ok(L.ents.some(e => (e.t === 'mend' || e.t === 'silver') && e.x >= w.x0 - 12 && e.x <= w.x0 + 12 && e.y >= R + 1) && (L.tickets || []).some(t => t.x >= w.x0 - 12 && t.x <= w.x0 + 12 && t.row >= R + 1), 'the cellar under ' + w.x0 + ' holds no reward (a silver or a heart, and tickets)'); }
    const seen = floodReach(L, TT, {}).seen; ok(W.every(w => seen.has((w.x0 + 2) + ',' + (R + 6))), 'a cellar is not reached by the fill with its plug broken'); }
  // THE CORN MAZE: three tiers, two chimneys, blind corners with a scarecrow that is not straw at each turn, and the walls stop your look
  { const Mz = L.maze, sc = L.ents.filter(e => e.t === 'mummer' && e.scare);
    ok(Mz && sc.length === 2 && sc.every(e => e.x >= Mz.x0 - 1 && e.x <= Mz.x1 + 1) && (L.scarecrows || []).length >= 4, 'the corn maze has not two disguised mummers among four or more straw ones: ' + sc.length + ' / ' + (L.scarecrows || []).length);
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
  // THE GHOST-TRAIN YARD (reserved for the chase set piece): a straight road with nothing on it but a boarded arch
  { const G = L.reserved && L.reserved.ghostTrain; ok(G && G.x1 - G.x0 >= 30 && G.arch > G.x0 && G.arch < G.x1 && G.row === R + 2, 'the ghost-train cutting is not reserved (a marked sunken lane of 30+ columns)');
    ok(G && L.ents.filter(e => e.x >= G.x0 && e.x <= G.x1 && !['coin', 'mend', 'check', 'deco'].includes(e.t)).length === 0, 'something stands in the reserved ghost-train cutting');
    ok(G && (() => { for (let x = G.x0 + 8; x <= G.x1 - 8; x++) if (at(x, R + 3) !== 1 || at(x, R + 2) !== 0 || at(x, R + 1) !== 0 || at(x, R) !== 0 || at(x, R - 1) !== 0) return false; return true; })(), 'the reserved ghost-train cutting is not a straight sunken lane (the road three rows down between two banks)');
    ok(G && at(G.x0, R) === 25 && at(G.x0 + 1, R) === 24 && at(G.x1 - 1, R) === 22 && at(G.x1, R) === 23, 'the cutting has no slopes down and up'); }
  // THE WICKER EFFIGY going up behind the fair, five stages, passed again and again
  { const E = L.effigies || []; ok(E.length === 5 && E.every((e, i) => e.stage === i && (i === 0 || e.x > E[i - 1].x)), 'the wicker effigy is not five stages in order along the road'); }
  // NO LONG FLAT WALK: every 40 columns of the fair proper hold something (a foe, a pit or spikes, a ride, a slope, a game, a climb, a plank)
  { const feats = new Array(L.W).fill(0); for (let x = 0; x < L.W; x++) for (let y = 0; y < L.H; y++) { const t = at(x, y); if (t === TT.ONEWAY || t === TT.SPIKE || t === TT.BOUNCER || (t >= 20 && t <= 25)) feats[x]++; }
    for (const e of L.ents) if (['mummer', 'hobbyhorse', 'check'].includes(e.t)) feats[e.x] += 3; for (const m of L.moversExtra || []) feats[Math.max(0, Math.min(L.W - 1, Math.floor((m.px || m.x) / TS3)))] += 4; for (const c of L.carousels) feats[c.x0] += 5;
    const ghost = L.reserved.ghostTrain, flat = []; for (let s = 0; s + 40 <= 618; s += 20) { if (s + 40 > ghost.x0 && s < ghost.x1 + 1) continue; let n = 0; for (let x = s; x < s + 40; x++) n += feats[x]; if (n < 8) flat.push(s + '-' + (s + 39)); }
    ok(!flat.length, 'long flat walks (40 columns with next to nothing in them): ' + flat.join(', ')); }
  // SHRINES (Daniel: fewer checkpoints): the same six, 85-140 columns apart, one before the door
  { const cp = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b); ok(cp.length === 6 && cp.every((x, i) => i === 0 || (x - cp[i - 1] >= 85 && x - cp[i - 1] <= 140)), 'the shrines are not six, 85-140 columns apart: ' + cp); }
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
    // 1. BACK TURNED, hero pinned 70 px to the left of it: it creeps (bells), then its mask GLOWS, then it strikes and hurts him
    BK.god = false; BK.P.inv = 0; BK.P.hp = BK.P.maxHp; const hx = m0.x - 70; const pin = f => { BK.P.x = hx; BK.P.y = m0.y; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = f; };
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
    BK.load(fi); BK.start(); BK.sim(5); none(); const h0 = hors().find(h => !h.elite && h.x > 500 * 16); only([h0]); BK.god = true;   /* the small carousel's horse: the slide-foot horse stands under a hill that would end its charge */
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
      for (const [i, probe] of [[1, [344, 25]], [2, [583, 25]]]) { const Gy = gs[i]; for (const t of Gy.targets) { BK.tp(t.x - 1, 27); BK.P.face = 1; BK.sim(4); BK.press('atk'); BK.sim(10); } out.galN.push({ i, hits: Gy.targets.filter(t => t.hit).length, open: Gy.open, plank: grid(probe[0], probe[1]) }); } }
    // 2c. A HORSE ON A GONDOLA: it rides the wide car round the wheel, on the car, never on the ground
    load(undefined, true); { const h = BK.enemies().find(q => q.t === 'hobbyhorse' && q.rideIdx !== undefined); let off = 0, low = 0; BK.tp(280, 27); for (let i = 0; i < 700; i++) { BK.P.x = 280 * 16; BK.P.y = 27 * 16 + 16; BK.P.vx = 0; BK.P.vy = 0; BK.sim(1); if (h.ride) { off = Math.max(off, Math.abs(h.x - (h.ride.x + h.rx))); if (h.y > 28 * 16 - 2) low++; } } out.rider = { has: !!h, ride: !!(h && h.ride), off, onGround: low, y0: h && h.ride && h.ride.y }; }
    // 3. THE TICKETS AND THE PRIZE BOOTH: a touch takes one; eight buy the silver (it is out of the world until then); seven do not
    load(); { const g0 = G().tickets; BK.tp(84, 18); BK.sim(6); out.tk1 = { got: G().tickets - g0, taken: G().taken.size };
      const B = G().booth, sv = () => BK.silvers().find(s => Math.abs(s.x - (B.silver.x * 16 + 8)) < 8), before = { hidden: BK.silvers().some(s => s.x < 0) };
      G().tickets = 7; BK.tp(586, 27); BK.sim(4); K.up = true; BK.sim(3); K.up = false; BK.sim(3); out.boothShort = { tickets: G().tickets, bought: B.bought, silver: !!sv() };
      G().tickets = 8; K.up = true; BK.sim(3); K.up = false; BK.sim(3); out.boothBuy = { tickets: G().tickets, bought: B.bought, silver: !!sv(), before }; }
    // 4. THE HALL OF MIRRORS: the mummer by the door creeps up behind you where the glass cannot see, and is held where a true mirror is ahead; the dark shortens the look
    load(undefined, true); { const ms = BK.enemies().filter(e => e.t === 'mummer').sort((a, b) => a.x - b.x), B0 = ms.find(e => e.x >= 317 * 16 && e.x <= 340 * 16), A0 = ms.filter(e => e.x >= 317 * 16 && e.x <= 340 * 16).pop(); for (const e of ms) if (e !== B0 && e !== A0) e.alive = false; B0.alive = true; A0.alive = false;
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
ok(R3.boothShort.tickets === 7 && !R3.boothShort.bought && !R3.boothShort.silver, 'the booth sold a silver for seven tickets: ' + JSON.stringify(R3.boothShort));
ok(R3.boothBuy.tickets === 0 && R3.boothBuy.bought && R3.boothBuy.silver && R3.boothBuy.before.hidden, 'the booth did not sell its silver for eight tickets (it is out of the world until then): ' + JSON.stringify(R3.boothBuy));
ok(R3.hallHeld < 1.5, 'the mummer behind a hero who faces true glass crept ' + R3.hallHeld + ' px: the mirror does not hold it');
ok(R3.hallCracked > 6, 'the mummer behind a hero in the cracked stretch did not creep (' + R3.hallCracked + ' px): nothing watches his back there');
ok(R3.night.d60 === 'held' && R3.night.d120 === 'moved' && R3.night.d120ribbon === 'held' && R3.night.d200ribbon === 'moved', 'the night look is not 88 px (132 with the ribbon): ' + JSON.stringify(R3.night));
ok(R3.scare.n === 2 && R3.scare.woke === 0, 'the corn maze has not two mummers in scarecrows\' coats, asleep: ' + JSON.stringify(R3.scare));
ok(R3.blind.crept && R3.blind.woke, 'a mummer one tier up (a wall between) was held by a look through the wall: ' + JSON.stringify(R3.blind));
ok(R3.drawn === 17, 'a set piece of the fair did not draw (' + R3.drawn + ' of 17)');

if (bad.length) { console.error('HARVEST-FAIR (page): ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('harvest-fair ok');
