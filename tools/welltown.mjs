// tools/welltown.mjs - THE WELL TOWN's own check (claude/welltown, the greybox; docs/concepts/the-well-town.md). Node only: no page.
// It holds the design's promises against the built level (src/well-town.js):
//   THE RULE IS LOAD-BEARING   every required mud wall and fire alone shuts the way to the courtyard; poured, the way is open
//   THE WINDLASS IS THE WAY    without the bucket down THE GREAT WELL, the cisterns and everything past the rubble are out of reach
//   THE DOVECOTE IS THE WAY UP without its rungs, the roofs (and the roost past them) are out of reach
//   THE SUN (claude/welltown-fix: the review's P1, the sun did 88% of a level-1 hero's damage) walked along the pacing route (tools/pacing.mjs,
//                              not the lowest footing: the cisterns lie under the street), no stretch between two shades is longer than
//                              SUN.maxWalk s at RUN; every shade a fight stands in is cast by a prop (an awning ent, a solid roof, a rect)
//   THE WATER BUDGET           walked left to right with a three-sip skin, filled at every well passed, it is never short at a required pour,
//                              counting ONE DRINK for every sun stretch over SUN.maxWalk and ONE STOLEN SIP at every thief squad on the way (a
//                              roof's water jar gives one); the first well stands before the first wall; the exam asks two pours after its last well
//   THE THEMED KEY             four water-skins, the dry cistern, its vault holding a silver and coins (NO relic: Daniel 10-02), shut until it is poured full
//   THE FOES                   every foe is in a designed squad (or the elite); the ranged foe is the reskinned bowman; the one new kind is the
//                              water-thief; the roles are melee, ranged and runner
//   THE SHOP AND THE BOSSES    the market shrine, THE WELL STORE's room and map node; THE GANG LEADER's courtyard (a mini, his opening >= 3 s, a third of
//                              him a burning); THE CISTERN QUEEN's hall under the old well (her springs, her windlass, her openings >= 3 s, the global x0.05)
// node tools/welltown.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { DJ, STAGE as QSTAGE } from '../src/djinn.js';   /* (claude/welltown5: THE DJINN OF THE GREAT WELL is the town's boss; the Cistern Queen is benched - tools/cistern-queen.mjs still holds her) */
import { GL, STAGE as GSTAGE } from '../src/gang-leader.js';
import { OPEN_RULE, OWN_WARD, NO_OPENING, GREED } from '../src/boss-greed.js';
import { ROLES } from './level-quality.mjs';
import { CALL_LINES } from '../src/hint-lines.js';
import { SUN, shadeZones, inShade, roofShade } from '../src/sunstroke.js';
import { pacing } from './pacing.mjs';

let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok  ' + m); };
const lv = LEVELS.find(l => l.id === 'welltown'); assert.ok(lv, 'no welltown in LEVELS');
const L0 = lv.build(), TS = 16, W = L0.W, H = L0.H;
/* THE GANG LEADER's gate is shut until he falls: the reach tests walk the town with it lifted (as it is after the mini) */
const L = { ...L0, grid: L0.grid.map((t, i) => (t === T.PORT && i % W === L0.mini.gate ? T.AIR : t)) };
ok(lv.needs === 'caravan', "THE WELL TOWN needs 'caravan' (the desert-arc concept, not the old brief's 'sunkencaravan')");
const A = L.arena, ax0 = A.x0 / TS, ax1 = A.x1 / TS;
const fires = L.ents.filter(e => e.t === 'oilfire').map(e => { let y0 = e.y; while (y0 > 0 && L.grid[(y0 - 1) * W + e.x] === T.AIR) y0--; return { x0: e.x, x1: e.x, y0, y1: e.y, kind: e.barricade ? 'barricade' : e.gateway ? 'gateway' : 'stall' }; });
/* the level as reach sees it, with some of its doors shut: grid cells set solid, and those walls taken off the list reachcore opens */
const withShut = (shut, o = {}) => { const g = L.grid.slice(); for (const m of shut) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) g[y * W + x] = T.SOLID;
  return { ...L, grid: g, mudWalls: (L.mudWalls || []).filter(m => !shut.includes(m)), ...o }; };
const reaches = (LL, test) => { const R = floodReach(LL, T, { rides: true }); for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (test(x, y)) return true; } return false; };
const inArena = (x, y) => x > ax0 + 2 && x < ax1 - 2 && y >= A.floor / TS - 3;
const fireShut = fires.map(f => ({ ...f }));

console.log('THE WELL TOWN (' + W + ' x ' + H + ')');
// ---- THE RULE IS LOAD-BEARING ----
ok(reaches(L, inArena), 'everything poured: the start reaches the courtyard');
ok(!reaches(withShut([...(L.mudWalls || []), ...fireShut]), inArena), 'everything shut (' + L.mudWalls.length + ' mud walls, ' + fires.length + ' fires): the courtyard cannot be reached');
const required = [...L.mudWalls.filter(m => !m.optional).map(m => ['mud wall @' + m.x0, m]), ...fireShut.filter(f => f.kind !== 'stall').map(f => [f.kind + ' fire @' + f.x0, f])];
for (const [what, m] of required) ok(!reaches(withShut([m]), inArena), 'REQUIRED: the ' + what + ' alone shuts the way to the courtyard');
{ const opt = [...L.mudWalls.filter(m => m.optional), ...fireShut.filter(f => f.kind === 'stall')];
  ok(opt.length === 2 && reaches(withShut(opt), inArena), 'the two taught where they cost nothing (the gate house door, the bazaar\'s stall fire) can be left: the way goes round'); }
// ---- THE WINDLASS, THE DOVECOTE ----
{ const lift = L.moversExtra.find(m => m.windlass), g = L.grid.slice(); for (let x = lift.x / TS; x < (lift.x + lift.w) / TS; x++) g[(lift.y0 / TS) * W + x] = T.SOLID;   /* the bucket left at the top plugs the well's mouth */
  const noLift = { ...L, grid: g, moversExtra: L.moversExtra.filter(m => !m.windlass) };
  ok(!reaches(noLift, (x, y) => y >= 34 && x > 180 && x < 250) && !reaches(noLift, inArena), 'THE GREAT WELL: with the bucket never sent down (it plugs the mouth) the cisterns, and the courtyard past the rubble, are out of reach');
  ok(reaches(L, (x, y) => y >= 34 && x > 180 && x < 250), 'and the bucket takes you down into them'); }
{ const g = L.grid.slice(); for (let y = 0; y < H; y++) if (g[y * W + 322] === T.NET) g[y * W + 322] = T.AIR;
  ok(!reaches({ ...L, grid: g }, inArena), 'THE DOVECOTE: with its rungs gone the roofs and the roost past them are out of reach'); }
// ---- THE SUN ----
const Z = shadeZones(L), cell = (x, y) => L.grid[y * W + x];
const shaded = (x, y) => inShade(Z, x, y - 1) || roofShade(cell, x, y - 14, t => t === T.SOLID);
const sunLong = [];
{ const r = pacing(lv).route, pts = [];   /* the pacing route, filled in at a quarter tile (its nodes stand ~6 tiles apart), up to his courtyard */
  for (let i = 1; i < r.length; i++) { const [ax, ay] = r[i - 1], [bx, by] = r[i]; if (ax >= ax0) break; const k = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) * 4));
    for (let j = 0; j < k; j++) pts.push([(ax + (bx - ax) * j / k + 0.5) * TS, (Math.round(ay + (by - ay) * j / k) + 1) * TS]); }
  const st = []; let s0 = null, len = 0;
  for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], d = i ? Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]) : 0;
    if (!shaded(x, y)) { if (s0 === null) { s0 = x; len = 0; } else len += d; } else if (s0 !== null) { st.push({ x0: Math.floor(s0 / TS), x1: Math.floor(x / TS), s: len / SUN.RUN }); s0 = null; } }
  if (s0 !== null) st.push({ x0: Math.floor(s0 / TS), x1: ax0, s: len / SUN.RUN });
  st.sort((a, b) => b.s - a.s); for (const q of st) if (q.s > SUN.maxWalk) sunLong.push(q);
  ok(pts.length > 1500 && st[0].s <= SUN.maxWalk, 'THE SUN: walked along the route, the longest stretch between two shades is ' + st[0].s.toFixed(1) + ' s (columns ' + st[0].x0 + '-' + st[0].x1 + '), the rule ' + SUN.maxWalk + ' s; next ' + st.slice(1, 4).map(q => q.s.toFixed(1) + ' (' + q.x0 + ')').join(', '));
  const props = L.ents.filter(e => e.t === 'deco' && /^awning/.test(e.kind)).length;
  ok(props >= 12 && shaded((159 + 0.5) * TS, 26 * TS) && shaded((182 + 0.5) * TS, 26 * TS) && shaded((322 + 0.5) * TS, 20 * TS) && shaded((495 + 0.5) * TS, 28 * TS),
    'THE SHADE IS CAST BY THINGS: ' + props + " awnings over the fights, the market courtyard's canopies (the Gang Leader's fight is in shade, both ends), the Kasbah courtyard's walls, the inside of the dovecote (its 18 rungs are the breather before the roost)"); }
// ---- THE SHADE HAS A CASTER (claude/welltown5, Daniel played it 10-03: "not clear that things will actually give you shade") ----
/* BOTH WAYS. (1) every shade zone (L.shade: the tinted rects and the awnings' own) has a CASTER over every column of it: looking straight up from the
   zone's first open cell the eye meets a caster prop (an awning, a strung cloth, the well-house roof: L.casters) or a tile (a roof, a lintel, boards, a
   vault) before the sky. (2) every caster prop has its shade under it: each of its columns lies in a zone whose top is the prop's own underside */
{ const tileCast = (x, y) => { const c = L.grid[Math.floor(y / TS) * W + Math.floor(x / TS)]; return c === T.SOLID || c === T.ONEWAY || c === T.NET; };
  const props = [...L.ents.filter(e => e.t === 'deco' && /^awning/.test(e.kind)).map(e => { const left = e.x * TS + 8 - 26, g = (e.y + 1) * TS; return { kind: e.kind + '@' + e.x, x0: left + 3, x1: left + 49, y: g - 30, yb: g - 17 }; }),
    ...(L.casters || []).map(k => ({ ...k, kind: k.kind + '@' + Math.floor(k.x0 / TS) }))];
  const bare = [];
  for (const z of L.shade) { const cols = [];
    for (let x = z[0] + 2; x <= z[1] - 2; x += 4) { let y = z[2]; while (y <= z[3] && tileCast(x, y)) y += 4; if (y > z[3]) continue;
      let hit = false; for (let py = y; py >= 0 && !hit; py -= 2) hit = tileCast(x, py) || props.some(p => x >= p.x0 && x <= p.x1 && py >= p.y && py <= p.yb);
      if (!hit) cols.push(Math.floor(x / TS)); }
    if (cols.length) bare.push('cols ' + Math.min(...cols) + '-' + Math.max(...cols) + ' rows ' + Math.floor(z[2] / TS) + '-' + Math.floor(z[3] / TS)); }
  ok(!bare.length, 'THE SHADE HAS A CASTER: every one of ' + L.shade.length + ' shade zones has an awning, a strung cloth, a roof or a lintel over every column of it' + (bare.length ? ' - BARE (a tint with nothing over it): ' + bare.join('; ') : ''));
  const dry = [];
  for (const p of props) { const cols = []; for (let x = p.x0 + 2; x <= p.x1 - 2; x += 4) if (!L.shade.some(z => x >= z[0] && x <= z[1] && z[2] >= p.y - 2 && z[2] <= p.yb + 4)) cols.push(Math.floor(x / TS));
    if (cols.length) dry.push(p.kind + ' (cols ' + Math.min(...cols) + '-' + Math.max(...cols) + ')'); }
  ok(props.length >= 14 && !dry.length, 'AND EVERY CASTER CASTS: each of ' + props.length + ' awnings, cloths and roofs has its shade under it, from its own underside' + (dry.length ? ' - NO SHADE UNDER: ' + dry.join('; ') : '')); }
// ---- THE WATER BUDGET ----
{ const wells = L.ents.filter(e => e.t === 'skinwell' && !e.arena && !e.jar && !e.works).map(e => [e.x, 'well'])   /* (claude/djinn2: THE BINDING WORKS' two springs are past the Kasbah's exam, on the way to him - like his hall's basins, they are not the town's water budget) */, jars = L.ents.filter(e => e.t === 'skinwell' && e.jar).map(e => [e.x, 'jar']), pours = required.map(([w, m]) => [m.x0, w]);
  const thieves = [...new Set(L.ents.filter(e => e.t === 'waterthief' && !(e.x >= ax0 && e.x <= ax1)).map(e => e.squad))].map(q => [Math.min(...L.ents.filter(e => e.squad === q).map(e => e.x)), 'thief ' + q]);
  const drinks = sunLong.map(q => [q.x1, 'drink']);
  const rank = { well: 0, jar: 1, thief: 2, drink: 3 }, kindOf = k => k.split(' ')[0];
  const ev = [...wells, ...jars, ...pours, ...thieves, ...drinks].sort((a, b) => a[0] - b[0] || (rank[kindOf(a[1])] ?? 9) - (rank[kindOf(b[1])] ?? 9)); let sips = 0, short = null, last = null, after = 0, stolen = 0, drunk = 0, lastSip = {};
  for (const [x, k] of ev) { const kk = kindOf(k); if (kk === 'well') { sips = 3; last = x; after = 0; } else if (kk === 'jar') sips = Math.min(3, sips + 1);
    else if (kk === 'thief') { if (sips > 0) { sips--; stolen++; } } else if (kk === 'drink') { if (sips > 0) { sips--; drunk++; } }
    else { if (sips <= 0 && !short) short = k + ' (@' + x + ')'; sips--; after++; lastSip[k] = sips; } }
  ok(!short, 'THE WATER BUDGET: ' + pours.length + ' required pours, ' + wells.length + ' wells and ' + jars.length + ' jar on the road; a three-sip skin filled at each, less ' + stolen + ' sips to thieves and ' + drunk + ' drinks for the sun, is never short' + (short ? ' - SHORT at ' + short : ''));
  { const b = required.find(([w]) => /barricade/.test(w)); ok(b && lastSip[b[0]] >= 0, 'THE ROOST LEG: the burning barricade still has its sip after the well-two thieves, door two, the roof-C thief and the sun'); }
  ok(Math.min(...wells.map(w => w[0])) < Math.min(...L.mudWalls.map(m => m.x0)), 'the first well stands before the first mud wall');
  ok(after >= 2 && last > 440, 'THE EXAM: after the last well (@' + last + ') two pours are asked (' + after + ') - a three-sip skin, a sip to spare for the sun'); }
// ---- THE THEMED KEY ----
{ const skins = L.ents.filter(e => e.t === 'stray' && e.kind === 'waterskin'), c = L.ents.find(e => e.t === 'cistern'), v = L.vaultDoors[0];
  ok(skins.length === 4 && L.quest && L.quest.n === 4 && /WATER-SKIN/.test(L.quest.name), 'FOUR WATER-SKINS, counted by the quest (the HUD: ' + L.quest.name + ' n/4)');
  ok(skins.every(s => reaches(L, (x, y) => Math.abs(x - s.x) <= 1 && Math.abs(y - s.y) <= 1)), 'every water-skin can be reached');
  const inVault = e => e.x > v.x1 && e.x <= v.x1 + 6 && e.y >= v.y0 && e.y <= v.y1;
  ok(c && L.ents.some(e => e.t === 'silver' && inVault(e)) && L.ents.filter(e => e.t === 'coin' && inVault(e)).length >= 3 && !L.ents.some(e => e.t === 'relic'), 'THE DRY CISTERN\'s vault holds a silver and coins, and the town has no relic (Daniel 10-02: relics are leaving the game)');
  const shut = { ...L, vaultDoors: [], grid: (() => { const g = L.grid.slice(); for (let y = v.y0; y <= v.y1; y++) g[y * W + v.x0] = T.SOLID; return g; })() };
  ok(!reaches(shut, (x, y) => x > v.x1 && x <= v.x1 + 6 && y >= v.y0 && y <= v.y1) && reaches(L, (x, y) => x > v.x1 && x <= v.x1 + 6 && y >= v.y0 && y <= v.y1), 'the vault is shut until the cistern is filled, and opens onto the relic');
  ok((L.unlocks || []).some(u => u.kind === 'stray' && /VAULT/.test(u.hud)) && CALL_LINES.has('THE CISTERN FILLS: THE VAULT OPENS') && CALL_LINES.has('THE DRY CISTERN WANTS FOUR WATER-SKINS'), 'the HUD says what the skins are for (L.unlocks, the cistern\'s two callouts)'); }
// ---- THE FOES ----
{ const FOES = new Set(['cutthroat', 'archer', 'waterthief', 'scorpion']), foes = L.ents.filter(e => FOES.has(e.t) && !(e.x >= ax0 && e.x <= ax1));
  ok(foes.every(e => e.squad || e.elite), 'every foe stands in a designed squad or is the elite (' + foes.length + ' foes, ' + new Set(foes.map(e => e.squad).filter(Boolean)).size + ' squads, nothing sprinkled)');
  ok(foes.filter(e => e.t === 'archer').every(e => e.bandit), 'the ranged foe is THE BANDIT BOWMAN: every archer here is the reskin (bandit: true)');
  ok(L.ents.some(e => e.elite && e.gate !== undefined), 'THE OLD STINGER, the elite, holds a gate');
  const roles = new Set(foes.flatMap(e => { const r = Object.keys(ROLES).filter(k => ROLES[k].includes(e.t)); return r.length ? r : ['melee']; }));
  ok(roles.has('ranged') && roles.has('runner') && roles.has('melee'), 'roles: ' + [...roles].join(', ')); }
// ---- THE SHOP AND THE BOSS ----
{ const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(L.ents.some(e => e.t === 'check' && e.x >= 64 && e.x < 90) && L.ents.some(e => e.t === 'sign' && /SHRINE KEEPS A SHOP/.test(e.text)), 'THE MARKET SHRINE: a checkpoint in the market, and the sign that says a lit shrine is a shop');
  ok(LEVELS.some(l => l.id === 'shopWell' && l.hidden && l.build().shop) && /id: 'wellstore', kind: 'store', shop: 'shopWell'/.test(main), "THE WELL STORE: the desert's walk-in room (shopWell) and its map node");
  /* THE DJINN OF THE GREAT WELL (claude/welltown5): his hall is the deep cistern under the old well, its two springs, its windlass on the floor and its crank on a ledge, the shaft down from the street */
  const wells = L.ents.filter(e => e.t === 'skinwell' && e.arena && e.x >= ax0 && e.x <= ax1), wls = L.ents.filter(e => e.t === 'djwindlass' && e.x > ax0 && e.x < ax1);
  ok(A.boss === 'djinn' && A.music === 'djinn' && wells.length === 2 && wls.length === 2 && wls.some(w => w.crank) && A.x1 - A.x0 === QSTAGE.W * TS && !L.ents.some(e => e.t === 'cisternqueen'),
    "THE DJINN's hall: " + QSTAGE.W + ' tiles, two springs, the windlass and the crank on a ledge, on the boss room\'s theme (and no Queen: she is benched)');
  { const q = A.djinn, sh = [q.sx + QSTAGE.shaft[0], q.sx + QSTAGE.shaft[1]]; let open = true; for (let y = q.top; y <= q.vault; y++) for (let x = sh[0]; x <= sh[1]; x++) if (L.grid[y * W + x] !== T.AIR) open = false;
    ok(open && reaches(L, inArena), 'THE OLD WELL: its shaft runs open from the street down through the vault into her hall, and the hall is reached'); }
  ok(DJ.openT >= 3 && OPEN_RULE.djinn && OPEN_RULE.djinn({ mode: 'mud', open: 2 }) && OPEN_RULE.djinn({ mode: 'doused', open: 1 }) && OPEN_RULE.djinn({ mode: 'bailed', open: 1 }) && OPEN_RULE.djinn({ mode: 'reach', open: 0, hand: 1 }) && !OPEN_RULE.djinn({ mode: 'walk', open: 0 })
    && !OWN_WARD.has('djinn') && !NO_OPENING.djinn && GREED.chip === 0.05 && GREED.chipBy.djinn === undefined,
    'his openings (MUD, DOUSED, BAILED OUT) are ' + DJ.openT + ' s (>= 3), his OPEN_RULE row (and his slammed hand), and outside them a blade does nothing');
  /* THE GANG LEADER: the courtyard's mini (Daniel 10-02: the Bandit King "feels like a mini") */
  const M = L0.mini;
  ok(M && M.boss === 'gangleader' && /GANG LEADER/.test(M.name) && M.music === 'banditking' && L.ents.some(e => e.t === 'gangleader' && e.mini) && (M.x1 - M.x0) / TS === GSTAGE.W && L.ents.some(e => e.t === 'skinwell' && e.arena && e.x * TS >= M.x0 && e.x * TS <= M.x1),
    "THE GANG LEADER: a mini in the MARKET COURTYARD (" + GSTAGE.W + " tiles, the great well's head), on the old King's theme");
  ok(M.x0 >= 150 * TS && M.x1 <= 193 * TS && M.wallL === 151 && M.wallR === 192 && L0.ents.some(e => e.t === 'windlass' && e.top && e.x * TS > M.x0 && e.x * TS < M.x1) && L0.ents.some(e => e.t === 'skinwell' && e.great && e.x * TS > M.x0 && e.x * TS < M.x1),
    'his courtyard is the Well Square at the head of the market stair (151-192): the great well and its windlass are in it');
  ok(!L0.ents.some(e => e.t === 'gangleader' && e.x > 440), 'and the Kasbah is not his any more: nothing of his stands past column 440');
  ok(GL.openT >= 3 && GL.capK <= 1 / 3 + 1e-9 && OPEN_RULE.gangleader && OPEN_RULE.gangleader({ mode: 'burning', open: 2 }) && !OPEN_RULE.gangleader({ mode: 'walk', open: 0 }),
    'his opening (BURNING, his own bottle struck home) is ' + GL.openT + ' s (>= 3), and one burning takes a third of him at most (Daniel\'s mini rule)');
  { const rows = []; for (let y = M.floor / TS - 6; y <= M.floor / TS - 1; y++) rows.push(y);
    const shut = { ...L, grid: L.grid.map((t, i) => (i % W === M.wallL && rows.includes(Math.floor(i / W)) ? T.SOLID : t)) };
    ok(reaches(L, inArena) && !reaches(shut, inArena), 'the way on to the old well runs through his courtyard: with his wall shut (' + rows.length + ' rows) the cisterns and the old well are out of reach, until he falls and it opens'); }
  { const k = L0.ents.filter(e => e.x > 473 && e.x < 515 && /^(cutthroat|archer|waterthief)$/.test(e.t)), sq = new Set(k.map(e => e.squad));
    ok(k.length >= 5 && k.some(e => e.t === 'archer') && sq.size >= 3, 'THE KASBAH COURTYARD is not empty: ' + k.length + ' of the garrison in ' + sq.size + ' squads (two bowmen on ledges, a pair of knives and a thief in the yard)'); }
  ok(!L.ents.some(e => e.t === 'banditking'), 'no Bandit King: the courtyard is the Gang Leader\'s, the boss is the Djinn\'s'); }
console.log('welltown: ' + n + ' checks pass');
