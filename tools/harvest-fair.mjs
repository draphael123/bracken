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
    ok(inn('exam').length >= 3 && inn('exam', 'hobbyhorse').length >= 1 && inn('exam', 'mummer').length >= 2, 'the EXAM does not combine the horse and the mummers');
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
  ok(L.ents.filter(e => e.t === 'mummer' || e.t === 'hobbyhorse').length === 13, 'the fair foe count moved (no extra bodies): ' + L.ents.filter(e => e.t === 'mummer' || e.t === 'hobbyhorse').length);
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
  ok(L.music === 'harvestfair', 'the fair base track is not its own harvestfair band organ');
  // THE ART: the foes and the world are real art files, not the L1 rectangles
  ok(existsSync(new URL('../src/redraw/fair_art.js', import.meta.url)) && existsSync(new URL('../src/redraw/fair_world.js', import.meta.url)) && !existsSync(new URL('../src/redraw/fair_' + 'greybox.js', import.meta.url)), 'the fair art files are not fair_art.js + fair_world.js (the L1 greybox file is gone)');
  const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/FAW.drawCarousel/.test(mainSrc) && /FAW.drawGreen/.test(mainSrc) && /FAW.drawCrowd/.test(mainSrc) && /FAW.drawGlow/.test(mainSrc) && /FAW.drawHay/.test(mainSrc), 'drawFair does not draw the carousel, the green, the crowd, the glow and the haystacks from src/redraw/fair_world.js'); }

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
    BK.load(fi); BK.start(); BK.sim(5); none(); const h0 = hors()[0]; only([h0]); BK.god = true;
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
if (bad.length) { console.error('HARVEST-FAIR (page): ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('harvest-fair ok');
