// tools/caravan-level.mjs — the SUNKEN CARAVAN greybox (src/draft/sunken-caravan.js) measured against the rules before a
// build session touches it: RULES-LEVELS-AND-BOSSES.md F1 (seven sections), F2 (five landmarks), F7 (silvers, strays, a relic),
// B1 (the start reaches the end), B2 (nothing stands in the air), B6 (checkpoints every 100 columns, one outside the arena),
// A7 (a forty-tile arena), the sun rule (no stretch of the road over SUN.maxWalk seconds without shade), the density lesson
// (3.5-4.5 foes a screen), and shape.mjs's numbers (standable heights, flat screens). usage: node tools/caravan-level.mjs
// AND RULES S (2026-09-25, docs/briefs/caravan-ruins-bandits.md), the parts a greybox can be held to: S1 five placed foes or more,
// each with its reason; S2 six jumps of 2.5-3.0 tiles on the main road, two over something that punishes a miss, none over 3.0;
// S3 the exam - the rim, with its checkpoint at the door and none inside; S4 checkpoints 40 to 72 route tiles apart; S5 no free
// heart on the road; S6 how much of the road the meter spends over its warning at a steady run, and that the exam takes it there.
import { install } from './node-canvas.mjs';
install();
const { T } = await import('../src/level.js');
const { buildSunkenCaravan } = await import('../src/draft/sunken-caravan.js');
const { slopeReachGrid, slopeLint } = await import('../src/reach-slopes.js');
const { floodReach } = await import('../src/reachcore.js');
const { isSlope, heightAt } = await import('../src/slopes.js');
const { SUN, shadeZones, inShade, roofShade, sunStretches } = await import('../src/sunstroke.js');

let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const L = buildSunkenCaravan(T), W = L.W, H = L.H, TS = 16, at = (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : L.grid[y * W + x];
const ax0 = L.arena.x0 / TS;
log(`THE SUNKEN CARAVAN (draft): ${W} x ${H} tiles, ${ax0} columns to the arena, ${L.ents.length} ents`);

// F1 / F2
const SEC = Object.entries(L.sections).filter(([k]) => k !== 'arena').sort((a, b) => a[1] - b[1]);
const lens = SEC.map(([k, v], i) => [k, (i + 1 < SEC.length ? SEC[i + 1][1] : ax0) - v]);
ok(SEC.length === 7 && lens.every(([, n]) => n >= 60 && n <= 100), `F1: seven sections of 60-100 columns (${lens.map(([k, n]) => k + ' ' + n).join(', ')})`);
const LM = ['leadwagon', 'ribcage', 'slide', 'winch', 'caravanserai'];
ok(LM.every(k => L.marks[k] !== undefined), `F2: five landmarks placed (${LM.map(k => k + '@' + L.marks[k]).join(', ')})`);
// lint
const lint = slopeLint(L, T); ok(lint.length === 0, `slopeLint: ${lint.length} complaints ${lint.slice(0, 3).map(b => b.join(' ')).join('; ')}`);
// B1 + F7: reach
const R = floodReach(slopeReachGrid(L, T), T, { rides: true });
const want = t => L.ents.filter(e => e.t === t);
const got = e => R.jumpNear(e.x, e.y);
const cnt = t => `${want(t).filter(got).length}/${want(t).length}`;
ok(want('silver').length === 3 && want('stray').length === 3 && want('relic').length === 1 && [...want('silver'), ...want('stray'), ...want('relic')].every(got),
  `F7 + reach: silvers ${cnt('silver')}, strays ${cnt('stray')}, relic ${cnt('relic')} got by the fill`);
let arenaReached = false; for (let x = ax0; x < ax0 + 40; x++) for (let y = 0; y < H; y++) if (R.seen.has(x + ',' + y)) arenaReached = true;
ok(arenaReached, 'B1: the start reaches THE WORM\'S HOLLOW');
// B6
const checks = want('check').map(e => e.x).sort((a, b) => a - b), gaps = checks.slice(1).map((x, i) => x - checks[i]);
ok(Math.max(checks[0], ...gaps) <= 100 && checks.some(x => x < ax0 && x >= ax0 - 6) && want('check').every(e => R.near(e.x, e.y)), `B6: ${checks.length} checkpoints, the widest gap ${Math.max(...gaps)} columns, one just outside the arena (${checks[checks.length - 1]}), all reachable`);
// B2: nothing in the air
const standT = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK || t === T.NET || isSlope(t);
const flyers = new Set(['vulture', 'silver', 'coin']);
const floating = L.ents.filter(e => !flyers.has(e.t) && !standT(at(e.x, e.y + 1)) && !isSlope(at(e.x, e.y)));
ok(floating.length === 0, `B2: nothing stands in the air (${floating.length}: ${floating.slice(0, 4).map(e => e.t + '@' + e.x + ',' + e.y).join(' ')})`);
// A7: the arena
const arenaFlat = [...Array(40).keys()].every(i => at(ax0 + i, L.arena.floor / TS) === T.SOLID && at(ax0 + i, L.arena.floor / TS - 1) === T.AIR);
const wrecks = L.ents.filter(e => e.t === 'wagon' && e.wreck && e.x >= ax0 && e.x < ax0 + 40);
ok(arenaFlat && wrecks.length === 3, `A7: the hollow is 40 tiles of level sand with ${wrecks.length} wrecks in it (the places to make THE OPENING)`);
// quicksand sits on pits
const qsOK = L.quicksand.every(q => { for (let x = q.x0 / TS; x < q.x1 / TS; x++) if (at(x, q.y / TS) !== T.AIR || at(x, q.y / TS + 1) !== T.SOLID) return false; return true; });
ok(qsOK, `${L.quicksand.length} quicksand patches, each over its one-row pit (${L.quicksand.map(q => (q.x1 - q.x0) / TS).join('/')} tiles)`);

// THE SUN: walk the road (the ground, not the ledges) and time each stretch between shades; the winch's awning counts rolled out
const ground = x => { const tx = Math.floor(x / TS); for (let y = 0; y < H; y++) { const t = at(tx, y); if (isSlope(t)) return y * TS + heightAt(t, x - tx * TS); if (t === T.SOLID) return y * TS; } return H * TS; };
const winch = want('winch')[0], Z = shadeZones(L); if (winch) Z.push([winch.canopy.x0 * TS, (winch.canopy.x1 + 1) * TS, winch.canopy.row * TS, H * TS]);
/* the road the player walks: in each column the LOWEST footing the reach fill found (under an overhang, not over it;
   inside the caravanserai, not on its roof), feet at the cell's bottom, or on the slope's surface in a slope cell */
const low = new Map(); for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (!low.has(x) || y > low.get(x)) low.set(x, y); }
const route = []; for (let x = 8; x < ax0 * TS; x += 4) { const tx = Math.floor(x / TS), cy = low.get(tx); if (cy === undefined) continue; const t = at(tx, cy); route.push([x, isSlope(t) ? cy * TS + heightAt(t, x - tx * TS) : (cy + 1) * TS]); }
const shaded = (x, y) => inShade(Z, x, y - 1) || roofShade((tx, ty) => at(tx, ty), x, y - 14, t => t === T.SOLID);
const st = sunStretches(route, shaded), shadeCount = (() => { let n = 0, was = false; for (const [x, y] of route) { const s = shaded(x, y); if (s && !was) n++; was = s; } return n; })();
ok(st[0].s <= SUN.maxWalk, `THE SUN: ${shadeCount} shades along the road; the longest walk in the open is ${st[0].s.toFixed(1)} s (columns ${Math.round(st[0].x0 / TS)}-${Math.round(st[0].x1 / TS)}), the rule ${SUN.maxWalk} s; next ${st.slice(1, 4).map(s => s.s.toFixed(1)).join(', ')}`);
// ================= RULES S =================
const placed = L.ents.filter(e => e.placed);
ok(placed.length >= 5 && placed.every(e => e.why), `S1: ${placed.length} foes placed where they make the ground harder (${[...new Set(placed.map(e => e.t))].join(', ')}), each with its reason`);
/* S2: THE JUMPS ON THE MAIN ROAD. A pit the road jumps is a run of quicksand columns with firm ground at both ends and nothing
   carrying the road over it (the ribcage's spine, seven rows up, a plank) within eight rows; its width is the jump. Quicksand punishes a miss here: it holds
   you in the sun */
const carried = (x, y) => { for (let yy = y - 8; yy < y; yy++) { const t = at(x, yy); if (t === T.ONEWAY || t === T.PLANK || t === T.SOLID) return true; } return false; };
const jumps = L.quicksand.map(q => ({ x: q.x0 / TS, w: (q.x1 - q.x0) / TS, carried: [...Array((q.x1 - q.x0) / TS).keys()].every(i => carried(q.x0 / TS + i, q.y / TS)) })).filter(j => !j.carried);
const fair = jumps.filter(j => j.w >= 2.5 && j.w <= 3.0), over = jumps.filter(j => j.w > 3.0);
ok(fair.length >= 6 && fair.length >= 2 && !over.length, `S2: ${fair.length} jumps of 2.5-3.0 tiles on the road, every one over quicksand (a miss holds you in the sun); ${over.length} over 3.0${over.length ? ' (' + over.map(j => j.x + ':' + j.w).join(' ') + ')' : ''}; ${L.quicksand.length - jumps.length} basin(s) the road is carried over`);
/* S3 + S4: THE EXAM IS THE RIM, and the checkpoints are spaced */
const rim = L.sections.rim, exam = checks.filter(x => x > rim + 2 && x < ax0 - 6), door = checks.find(x => x >= rim - 2 && x <= rim + 2);
const examFoes = placed.filter(e => e.x >= rim && e.x < ax0), examJumps = fair.filter(j => j.x >= rim && j.x < ax0);
ok(door !== undefined && !exam.length && examFoes.length >= 1 && examJumps.length >= 2, `S3: the exam is the rim (${ax0 - rim} columns): its checkpoint at the door (${door}), none inside, ${examJumps.length} jumps in the sun under ${examFoes.map(e => e.t).join(' + ')}`);
const inner = gaps.filter((g, i) => checks[i + 1] < ax0 - 6);
ok(inner.every(g => g >= 40 && g <= 72), `S4: checkpoints ${inner.join('/')} columns apart (40 to 72; the arena door and an ambush room's are exempt)`);
ok(!L.ents.some(e => e.t === 'mend'), `S5: no free heart on the road (${L.ents.filter(e => e.t === 'mend').length}); the yard and THE FIRST KNIFE pay theirs`);
{ const s = { v: 0 }; let warm = 0, n = 0, examPeak = 0; for (let i = 1; i < route.length; i++) { const dt = (route[i][0] - route[i - 1][0]) / SUN.RUN; const sh = shaded(...route[i]);
    s.v = sh ? Math.max(0, s.v - dt / SUN.cool) : Math.min(1, s.v + dt / SUN.fill); if (s.v >= SUN.swimAt) warm++; n++; if (route[i][0] >= rim * TS) examPeak = Math.max(examPeak, s.v); }
  ok(examPeak >= SUN.swimAt, `S6: at a steady run the meter is over its warning for ${Math.round(100 * warm / n)}% of the road (a floor: a run never stops, and a fight does) and the exam takes it to ${Math.round(100 * examPeak)}%`); }
// density + shape (shape.mjs's windows)
const FOES = new Set(['scorpion', 'vulture', 'cutthroat', 'slinger', 'ambusher']);   /* the bandits in the goblins' place (2026-09-25) */
const seen = [...R.seen].map(k => k.split(',').map(Number)); let win = 0, hs = 0, flat = 0, foes = 0, minF = 99;
for (let x = 0; x + 24 <= ax0; x += 24) { win++; const ys = new Set(seen.filter(([sx]) => sx >= x && sx < x + 24).map(([, y]) => y)); hs += ys.size; if (ys.size <= 2) flat++;
  const n = L.ents.filter(e => FOES.has(e.t) && e.x >= x && e.x < x + 24).length; foes += n; minF = Math.min(minF, n); }
const per = foes / win; ok(per >= 3.5 && per <= 4.5 && minF >= 2, `density: ${per.toFixed(1)} foes a screen over ${win} screens (thinnest ${minF}); the rule 3.5-4.5`);
ok(flat / win < 0.33, `shape: ${(hs / win).toFixed(1)} standable heights a screen, ${Math.round(100 * flat / win)}% flat screens (Burial reached 27%)`);
const kinds = {}; for (const e of L.ents) if (FOES.has(e.t)) kinds[e.t] = (kinds[e.t] || 0) + 1;
log('    the draft GARRISON: ' + Object.entries(kinds).map(([k, n]) => k + ' ' + n).join(', '));
console.log(fails ? `\ncaravan-level: ${fails} FAILED` : '\ncaravan-level: all passed');
process.exit(fails ? 1 : 0);
