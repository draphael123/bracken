// tools/harpypass.mjs - THE ROOKERY HARPY PASS (claude/harpypass, 2026-11-05; Daniel 11-02 21:49 / 21:51): THE GUST HARPY and THE CARRIER HARPY, the two shared harpy modules,
//   pure (no page), and where the Rookery puts them. tools/rookery.mjs checks them in the rookery's hands; this checks the modules as a level that is not the rookery would use them.
//     node tools/harpypass.mjs
import { readFileSync } from 'node:fs';
import * as GHM from '../src/gale-harpy.js';
import * as CHM from '../src/carrier-harpy.js';
import { LEVELS, T } from '../src/level.js';
import { HERO_IDS } from '../src/hero-roster.js';
import { SAY_LINES } from '../src/hint-lines.js';
import { MARK, ANSWER, HEIGHT, BY_HAND } from '../src/marks.js';
const TS = 16, G = GHM.GUST, C = CHM.CARRY;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');

// ---- THE GUST HARPY (src/gale-harpy.js GUST), pure ----
const world = (heroes, o = {}) => { const said = [], snd = []; return { said, snd, time: () => o.t || 0, heroes: () => heroes, solid: () => false, floorBelow: o.floorBelow || ((x, y) => 400), voidY: 900,
  kill: e => { e.alive = false; e.killed = true; }, say: (x, y, t) => said.push(t), sound: k => snd.push(k), mark() {}, seen() {}, firstTell() {} }; };
const hero = o => { const h = { x: 100, y: 200, ground: false, vy: 0, alive: true, blocking: false, answer: false, pushed: [], ...o }; h.push = (vx, vy, t) => h.pushed.push([vx, vy, t]); return h; };
const harpy = o => ({ t: 'gustharpy', x: 240, y: 180, hx: 240, hy: 180, face: -1, alive: true, stagger: 0, anim: 0, ...GHM.newGust(), ...o });
const run = (e, w, s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { e.anim += 1 / 60; GHM.gustStep(e, 1 / 60, w); if (e.stagger > 0) e.stagger = Math.max(0, e.stagger - 1 / 60); if (f && f(i)) return i; } return -1; };
{ const h = hero(), e = harpy(), w = world([h]);
  let tellAt = -1; run(e, w, G.first + 0.2, i => { if (e.mode === 'gustTell' && tellAt < 0) tellAt = i; });
  ok(tellAt >= 0 && Math.abs(tellAt / 60 - G.first) < 0.1 && w.snd.includes('tell'), 'she waits GUST.first s (' + G.first + ') after she sees you, then TELLS: wings up (gustTell), a !, her whistle');
  ok(GHM.gustFrame(e) === 4, 'the tell wears frame 4 (wings up)');
  run(e, w, G.tell + 0.05); ok(e.blasts.length === 1 && w.snd.includes('blast') && e.mode === 'gust', 'after GUST.tell (' + G.tell + ' s) she claps a BLAST down her lane');
  const t0 = e.blasts[0].x; run(e, w, 0.2); ok(Math.abs((t0 - e.blasts[0].x) - G.v * 0.2) < 3, 'the blast TRAVELS (' + G.v + ' px/s) - a slow read, not a hitscan');
  run(e, w, 1.2, () => h.pushed.length);
  ok(h.pushed.length === 1 && h.pushed[0][0] === -G.push && h.pushed[0][1] === -G.lift && w.said.includes(GHM.GUST_SAY.shoved), 'an AIRBORNE hero in it is THROWN along it (vx ' + -G.push + ', no damage: the module has no hurt)');
  run(e, w, 1.5); ok(h.pushed.length === 1, 'one shove per blast per hero'); }
{ const h = hero({ ground: true }), e = harpy({ gCd: 0 }), w = world([h]); run(e, w, G.tell + 1.4, () => h.pushed.length);
  ok(h.pushed.length === 1 && Math.abs(h.pushed[0][0]) <= G.push * 0.3, 'a hero ON HIS FEET only leans (x' + G.ground + '): she is a hazard to JUMPS'); }
{ const h = hero({ blocking: true }), e = harpy({ gCd: 0 }), w = world([h]); run(e, w, G.tell + 1.4, () => h.pushed.length);
  ok(h.pushed.length === 1 && Math.abs(h.pushed[0][0]) === G.push * G.brace && w.said.includes(GHM.GUST_SAY.braced), 'a GUARD up BRACES it, in the air too (x' + G.brace + ')'); }
{ const h = hero({ answer: true }), e = harpy({ gCd: 0 }), w = world([h], { floorBelow: () => 260 }); let turned = -1;
  run(e, w, G.tell + 3, i => { if (e.blasts[0] && e.blasts[0].turned && turned < 0) turned = i; return e.gMode === 'grounded'; });
  ok(turned >= 0 && !h.pushed.length && w.said.includes(GHM.GUST_SAY.turned), 'a hero who ANSWERS it (his perfect guard: the parry tap, the deflect, the ward on the beat) TURNS IT BACK - no shove');
  ok(e.gMode === 'grounded' && e.gN.downed === 1 && Math.abs(e.y - 256) < 1, 'her own blast, turned back, KNOCKS HER DOWN onto the footing under her'); }
{ const h = hero(), e = harpy({ gCd: 0 }), w = world([h], { floorBelow: () => 300 }); run(e, w, 0.2); e.stagger = 0.2; run(e, w, 0.02);
  ok(e.gMode === 'downed' && !e.blasts.length && w.said.includes(GHM.GUST_SAY.down), 'A BLOW IN HER TELL knocks her OUT OF THE AIR (no blast)');
  run(e, w, 2, () => e.gMode === 'grounded'); ok(e.gMode === 'grounded' && GHM.gustFrame(e) === 3, 'she tumbles to the footing and lies GROUNDED (frame 3)');
  const n0 = e.gN.tells; run(e, w, G.down - 0.2); ok(e.gMode === 'grounded' && e.gN.tells === n0, 'grounded GUST.down s (' + G.down + '): no blast - CROSS NOW');
  run(e, w, 0.3 + G.rise + 0.1); ok(e.gMode === 'hover' && Math.abs(e.y - e.hy) < 8, 'then she climbs back to her beat (GUST.rise ' + G.rise + ' s)'); }
{ const h = hero(), e = harpy({ gCd: 5 }), w = world([h]); run(e, w, 0.1); e.stagger = 0.2; run(e, w, 0.02);
  ok(e.gMode === 'downed', 'a blow while she only HOVERS knocks her down too (an arrow, a bolt, a fireball, a hook, a jump strike)'); }
{ const h = hero(), e = harpy({ gCd: 0 }), w = world([h], { floorBelow: () => null }); run(e, w, 0.1); e.stagger = 0.2; run(e, w, 4);
  ok(e.killed && !e.alive, 'knocked down over a drop with no footing: she is GONE (past w.voidY)'); }
{ const h = hero(), e = harpy({ gCd: 0 }), w = world([h], { t: 0 }); w.lastDive = () => 0; let held = 0; run(e, w, G.tell + 0.3, () => { held = e.gN.held; return false; });
  ok(held > 0 && !e.blasts.length, 'never a blast in a dive\'s window (w.lastDive, as the gale harpy): she holds her tell'); }
{ const h = hero({ x: 100 }), e = harpy({ gCd: 0 }), w = world([h]); let two = 0; run(e, w, 6, () => { if (e.blasts.length > 1) two++; });
  ok(!two && e.gN.blasts >= 2, 'ONE BLAST ALIVE at a time (' + e.gN.blasts + ' blasts in 6 s, never two at once)'); }
{ const lanes = []; for (const fy of [150, 190, 230, 260]) { const h = hero({ y: fy }), e = harpy(), w = world([h]); run(e, w, 1); lanes.push(Math.round(e.lane)); }
  ok(lanes[0] === 150 || lanes[0] === 180 - G.climb, 'she keeps her lane a jump over your feet (GUST.over ' + G.over + ' px), within GUST.climb (' + G.climb + ' px) of her home: lanes ' + lanes.join('/')); }
ok(Object.values(GHM.GUST_SAY).every(s => SAY_LINES.has(s)) && Object.values(CHM.CARRY_SAY).every(s => SAY_LINES.has(s)), 'every capital line both modules say is in src/hint-lines.js');

// ---- THE WIRING (a module foe, by hand) ----
ok(/case 'gustharpy': enemies\.push\(\{[^\n]*GHM\.newGust\(\)/.test(main) && /gustharpy: GHM\.GUST\.hp/.test(main), 'main.js: a spawn case (GHM.newGust) and her health (GUST.hp ' + G.hp + ': two blows of most heroes)');
ok(/SPR\.gustharpy = RKF\.bakeGustHarpy\(\)/.test(main) && /\{ t: 'gustharpy', name: 'GUST HARPY'/.test(main), 'a sprite (greybox storm-blue harpy) and a bestiary card');
ok(['AMB_FLY', 'HAS_HURT', 'FLYERS'].every(k => new RegExp('const ' + k + " = new Set\\(\\[[^\\]]*'gustharpy'").test(main)), 'a flyer (AMB_FLY, FLYERS), a hurt frame (HAS_HURT)');
ok(/if \(e\.t === 'gustharpy' && !\(RKH && RKH\.on\(\)\)\) \{ GHM\.gustStep\(e, dt, gustWorld\(\)\)/.test(main) && /function gustWorld\(\)/.test(main), 'she runs ANYWHERE (Gale Moor, the Sky Road): main.js gustWorld - not only in the rookery\'s hands');
ok(/GHM\.drawBlasts\(g, e, cx, cy, time\)/.test(main) && /frame = GHM\.gustFrame\(e\)/.test(main), 'drawn anywhere: her lane, her blast, her frames');
ok(BY_HAND['gustharpy|gustTell'] === '!' && MARK['gustharpy|gustTell'] === '!' && ANSWER['gustharpy|gustTell'] === 'block' && HEIGHT['gustharpy|gustTell'] === 'high', 'the tell tables: a yellow ! (MARK, BY_HAND), answered by a guard (block), high (stay on your feet)');
{ const rp = /function rpAnswerUp\(\) \{([^\n]*\n[^\n]*)/.exec(main), body = rp ? rp[1] : '';
  const per = { knight: /hero\(\) === 'knight'/, paladin: /isPaladin\(\)/, pirate: /isPirate\(\)/, warden: /isWarden\(\)/, berserker: /isBz\(\)/, ranger: /isRg\(\)/, pyro: /isPyro\(\)/, geomancer: /isGeo\(\)/, reaper: /isReaper\(\)/ };
  ok(HERO_IDS.every(h => per[h] && per[h].test(body)), 'EVERY HERO can TURN THE BLAST BACK with his own perfect guard (rpAnswerUp covers ' + HERO_IDS.join(', ') + ')'); }

// ---- THE CARRIER HARPY (src/carrier-harpy.js), pure ----
{ const e = { x: 100, y: 193, hx: 100, hy: 193, alive: true, anim: 0, stagger: 0, ...CHM.newCarrier() }, step = (s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { e.anim += 1 / 60; const r = CHM.carryStep(e, 1 / 60); if (f && f(r)) return; } };
  step(1); ok(e.cMode === 'perch' && Math.abs(e.x - 100) < 1 && !CHM.boards(e, { x: 100, y: 200, ground: true, vy: 0 }), 'she SITS on her perch; a hero walking past her is not aboard');
  ok(CHM.boards(e, { x: 104, y: 180, ground: false, vy: 60 }) && !CHM.boards(e, { x: 104, y: 180, ground: false, vy: -200 }), 'a hero FALLING onto her back boards (not one jumping up past her)');
  ok(CHM.grabs(e, { x: 112, y: 200, ground: true }) && !CHM.grabs(e, { x: 160, y: 200, ground: true }), 'UP beside her boards (within ' + (C.reach + 6) + ' px)');
  const pts = [[100, 193], [140, 150], [220, 150]]; CHM.board(e, pts); let landed = false, n = 0; step(6, r => { n++; if (r === 'landed') { landed = true; return true; } });
  ok(landed && Math.abs(e.x - 220) < 1 && n / 60 >= C.minT && n / 60 <= C.maxT + 0.05 && e.cMode === 'home', 'she flies the flight (' + (n / 60).toFixed(2) + ' s, ' + C.minT + '-' + C.maxT + ') and lands at its end: the level sets him down; she turns home');
  const [fx, fy] = CHM.riderAt(e); ok(fx === e.x && fy === e.y - C.under, 'the rider stands ON HER BACK (feet ' + C.under + ' px over her)');
  step(4, () => e.cMode === 'perch'); ok(e.cMode === 'perch' && e.x === 100 && e.cN.home === 1, 'home, empty, ' + C.homeK + 'x faster - and she sits again');
  ok(!CHM.boards(e, { x: 100, y: 180, ground: false, vy: 60 }), 'a rest (' + C.rest + ' s) before she takes another'); step(C.rest + 0.05);
  e.stagger = 0.3; step(0.05); ok(e.cN.startled === 1 && e.mode === 'fly' && !CHM.boards(e, { x: 100, y: 180, ground: false, vy: 60 }), 'a blow STARTLES her (no hurt, no knock-down needed): a flap up, then she settles');
  step(C.startle + 0.1); ok(e.mode === 'perch' && CHM.boards(e, { x: 100, y: 180, ground: false, vy: 60 }), 'settled, she is a ride again'); }

// ---- WHERE THE ROOKERY PUTS THEM ----
{ const L = LEVELS.find(l => l.id === 'rookery').build(), solid = (x, y) => L.grid[y * L.W + x] === T.SOLID || L.grid[y * L.W + x] === T.ONEWAY;
  const gs = L.ents.filter(e => e.t === 'gustharpy');
  ok(gs.length === 2, 'two GUST HARPIES: the Wind Gap (taught: a fall is a climb) and the Gale Spires (with the gale harpy ahead)');
  for (const e of gs) { let fy = -1; for (let y = e.y + 1; y < L.H; y++) if (solid(e.x, y)) { fy = y; break; }
    ok(fy > 0, e.squad + ': footing under her (row ' + fy + ', ' + (fy - e.y) + ' below) - knocked down, she lies on it, then climbs back (never lost in the void)'); }
  ok(L.ents.some(e => e.t === 'sign' && /GUST HARPY/.test(e.text || '')), 'a sign teaches her before the Wind Gap');
  ok((L.rkRides || []).length === 6, 'every Rookery ride (six) is a PERCHED CARRIER HARPY (src/rookery-hands.js: no dive, no knock-down first)');
  ok(L.ents.some(e => e.t === 'sign' && /CARRIER HARPY/.test(e.text || '')), 'a sign teaches her at the first ride'); }

console.log(bad ? '\nharpypass: ' + bad + ' FAILED' : '\nok  harpypass: the gust harpy, the carrier harpy, their wiring and their places');
process.exit(bad ? 1 : 0);
