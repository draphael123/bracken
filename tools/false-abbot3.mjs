// tools/false-abbot3.mjs - THE FALSE ABBOT IN THE MONASTERY 3 (claude/falseabbot; src/false-abbot.js where the house is m3, src/abbot-chapel.js,
// behind MON3) proved in Node, on the house the level really builds: P1 in the chapel, THE FLOOR GOES at half, P2 in the belfry; ONE main opening
// (a bell struck with him on its bridge) and ONE second (the brazier he lit: come down on him), both in both phases; the call, the peal, the
// resist floor, and the great bell as the last blow. Plus the building's own geometry (bells over floor, smoke columns clear, the climb up).
// usage: node tools/false-abbot3.mjs   (sets MON3 itself)
process.env.MON3 = '1';
const { LEVELS, T } = await import('../src/level.js');
const { ABBOT, ABBOT3, updateFalseAbbot, abbotBridgeBell, abbotPlunge, abbotTake, abbotClamp, abbotBellRung, abbotOpen, abbotFrame } = await import('../src/false-abbot.js');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const TS = 16, DT = 1 / 60;
const L = LEVELS.find(l => l.id === 'spire').build(), A0 = L.arena, h = A0 && A0.house;
console.log('THE FALSE ABBOT IN THE MONASTERY 3');
ok(!!(h && h.m3 && h.stages.length === 2), 'the built Monastery (MON3) hands him the two-storey house (the chapel, the belfry)');
if (!h || !h.m3) { console.log('\nno m3 house: stop'); process.exit(1); }
/* the house in pixels, as main.js abbotStageHouse() makes it */
const stageOf = n => { const s = h.stages[n - 1], C = h.collapse, bell = L.ents.find(e => e.t === 'tbell' && e.abbot);
  return { m3: true, n, floor: s.floor * TS, deckY: s.deck * TS, roofY: s.roof * TS, spans: s.spans.map(([a, b]) => [a * TS, (b + 1) * TS]),
    bridges: s.bridges.map(b => ({ x0: b.x0 * TS, x1: (b.x1 + 1) * TS, bells: b.bells.map(x => x * TS), tiles: [b.x0, b.x1, s.deck] })),
    braziers: s.braziers.map(z => ({ x: z.smoke * TS, smokeX: z.smoke * TS, spotX: z.spot * TS })), ropes: s.ropes.map(t => t * TS + 8), landLo: s.land[0] * TS, landHi: s.land[1] * TS,
    floorSpans: s.floorSpans.map(([a, b]) => [a * TS, (b + 1) * TS]), callAt: s.callAt, landX: (s.landX ?? (s.floorSpans[0][0] + s.floorSpans[0][1]) / 2) * TS,
    hole: n === 1 && C ? { x0: C.hole[0] * TS, x1: (C.hole[1] + 1) * TS, top: C.hole[2] * TS } : null, bellX: n === 2 && bell ? bell.x * TS + 8 : undefined }; };
const S = [null, stageOf(1), stageOf(2)];
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];

// ---- THE BUILDING ----
{ const s1 = h.stages[0], s2 = h.stages[1];
  for (const [n, s] of [[1, s1], [2, s2]]) {
    const fl = s.floor, onF = x => s.floorSpans.some(([a, b]) => x >= a && x <= b);
    ok(s.bridges.every(b => b.bells.every(x => onF(Math.floor(x)) && at(Math.floor(x), fl) === T.SOLID && at(Math.floor(x), fl - 1) === T.AIR && at(Math.floor(x), fl - 2) === T.AIR)),
      `storey ${n}: every bridge's bell hangs over standing floor, at a hero's height`);
    ok(s.bridges.every(b => { for (let x = b.x0; x <= b.x1; x++) if (at(x, s.deck) !== T.ONEWAY) return false; return true; }), `storey ${n}: the bridges are laid (boards at deck ${s.deck})`);
    ok(s.braziers.every(z => { const x = Math.floor(z.smoke); if (!onF(x) || at(x, fl) !== T.SOLID) return false; for (let y = fl - 1; y > fl - 1 - ABBOT.smokeH / TS; y--) if (at(x, y) !== T.AIR) return false; return true; }),
      `storey ${n}: each brazier stands on floor with its smoke column clear for ${ABBOT.smokeH} px (no deck over it: you rise, then come down on him)`);
    ok(s.braziers.every(z => onF(Math.floor(z.spot)) && !s.spans.some(([a, b]) => z.spot >= a && z.spot <= b + 1) && !s.bridges.some(b => z.spot >= b.x0 && z.spot <= b.x1 + 1)), `storey ${n}: he kneels by each brazier in the open (nothing over his head to plunge through)`);
  }
  const [hx0, hx1, hr] = h.collapse.hole;
  ok([...Array(hx1 - hx0 + 1).keys()].every(i => at(hx0 + i, hr) === T.SOLID), 'before the fight the belfry floor is whole over the nave (the hole is laid by THE FLOOR GOES)');
  ok(!s2.bridges.some(b => b.bells.some(x => x >= hx0 - 1 && x <= hx1 + 1)) && !s2.braziers.some(z => z.smoke >= hx0 - 1 && z.smoke <= hx1 + 1), 'no belfry bell or brazier stands over the hole');
  ok(h.collapse.rubble.every(([a, b, y]) => [...Array(b - a + 1).keys()].every(i => at(a + i, y) === T.AIR)), 'the rubble steps land in open air (they are laid at runtime)');
  const cl = h.climb; ok(cl.every((p, i) => i === 0 || p[1] >= cl[i - 1][1] - 3), `the way up after him climbs at most 3 rows a step (${cl.map(p => p[1]).join(' > ')})`);
  ok(h.bars.every(b => at(b.x0, b.y0) === T[b.open]), 'the ways in (the belfry arch, the great bell\'s rope hole) are open before the fight');
  ok(at(92, 20) === T.NET && at(92, 29) === T.NET, "the great bell's rope runs down into the chapel");
  const tb = L.ents.find(e => e.t === 'tbell' && e.rope && e.y <= 31); ok(!!tb && tb.rope[0] === 39 && [...Array(tb.rope[2] - tb.rope[1] + 1).keys()].every(i => at(39, tb.rope[1] + i) === T.AIR), 'the west front\'s bell lets its rope down open air to the leads (the retry shortcut)');
  ok(at(48, 12) === T.AIR && at(48, 13) === T.AIR && at(47, 14) === T.SOLID, 'the belfry arch opens off the bell-cote sill');
  ok(L.ents.filter(e => ['harpy', 'fledgling', 'bat'].includes(e.t) && e.y <= 31).every(e => e.x < 48), 'birds outside only: the one up here is on the west front');
  ok(!L.ents.some(e => e.y <= 29 && e.x >= 48 && e.x <= 94 && ['sprig', 'rockgoblin', 'gobpriest', 'gobmage', 'sentry', 'troll', 'archer'].includes(e.t)), 'no sprinkled garrison in his chapel or the belfry (calm)');
}

/* a fight rig on the real house: c.A reads the storey he is in, as main.js abbotMakeCtx3 does */
function rig(o = {}) {
  const P = { x: o.px ?? 70 * TS, y: o.py ?? S[1].floor, dead: false, ground: true };
  const e = { t: 'abbot', x: o.x ?? 76 * TS, y: S[1].floor, hp: o.hp ?? ABBOT.hp, maxHp: ABBOT.hp, alive: true, mode: 'stalk', modeT: 0, cd: o.cd ?? 0, anim: 0, face: -1, turn: 0, phase: 1, riteCd: o.riteCd ?? 0, blessT: 0, stage: 1 };
  const log = { hits: [], said: [], summons: 0, collapse: 0, bridges: [], shoves: 0, kindled: 0, nudges: 0 };
  let adds = 0;
  const H = () => S[e.stage || 1];
  const A = { x0: A0.x0, x1: A0.x1, y0: A0.y0 };
  Object.defineProperties(A, { house: { get: H }, floor: { get: () => H().floor }, ropes: { get: () => H().ropes }, landLo: { get: () => H().landLo }, landHi: { get: () => H().landHi } });
  const c = { P, A, hit: (x, d, hard, name) => { log.hits.push({ x, d, hard, name }); return 'hit'; },
    say: (m, red) => log.said.push({ m, red: !!red }), sound: () => {}, shake: () => {}, dust: () => {}, shove: () => { log.shoves++; }, reel: () => {}, fire: () => {},
    blessFlock: () => 0, breakBlessings: () => {}, dazeFlock: () => {}, adds: () => adds, summon: () => { adds++; log.summons++; }, bellSpend: () => {}, bellCold: () => false,
    bridge: (i, up) => log.bridges.push([e.stage, i, up]), basketK: () => 0,
    stage: n => ({ floor: S[n].floor, landX: S[n].landX }), collapse: () => { log.collapse++; }, collapseTell: () => {}, kindle: () => { log.kindled++; }, nudgeUp: () => { log.nudges++; } };
  return { P, e, c, log, H, setAdds: n => { adds = n; }, step: () => updateFalseAbbot(e, DT, c), run(s, each) { for (let i = 0; i < Math.round(s / DT); i++) { updateFalseAbbot(e, DT, c); if (each && each(this)) return true; } return false; } };
}
const struck = (r, i) => abbotBridgeBell(r.e, i, r.c);

// ---- every new move is told, long enough to answer ----
ok(Object.values(ABBOT3.tell).every(t => t >= 0.5), `the call, the peal and the floor going are each told >= 0.5 s (${Object.entries(ABBOT3.tell).map(([k, v]) => k + ' ' + v).join(', ')})`);
ok(['pealTell', 'callTell', 'collapseTell'].every(m => abbotFrame({ mode: m }) > 0), 'each has a pose (B16: not the idle frame)');

// ---- P1: THE MAIN OPENING - he kneels on his rood, its bell is struck, it drops with him ----
{ const r = rig({ riteCd: 0 }); let res = null, downed = false;
  r.run(30, q => { if (q.e.mode === 'riteTell' && q.e.riteDev === 'bridge' && q.e.deck === 'high') { res = struck(q, q.e.riteBr); return true; } });
  ok(res === 'him', `P1: he kneels on the rood (its bell by you) and a bell struck under it drops it WITH him (${res})`);
  r.run(3, q => { if (q.e.mode === 'downed') { downed = true; return true; } });
  ok(downed && abbotTake(r.e) === ABBOT.downMul, `he lands stunned on the chapel floor = THE OPENING (x${abbotTake(r.e)})`);
  ok(Math.abs(r.e.y - S[1].floor) < 1, 'and he is on the chapel floor'); }

// ---- the rite takes turns: the brazier next - THE SECOND OPENING ----
{ const r = rig({ riteCd: 0 }); let first = null, second = null, lit = null;
  r.run(60, q => { if (q.e.mode === 'riteTell') { if (!first) first = q.e.riteDev; else if (q.e.riteDev !== first || second) { second = q.e.riteDev; lit = q.e.smoke; return true; } } if (q.e.mode === 'rite' && first && !second) { q.e.blessT = 0; q.e.riteCd = 0; } });
  ok(first === 'bridge' && second === 'brazier', `his rite takes turns: ${first}, then ${second}`);
  ok(!!lit && r.H().braziers.some(z => Math.abs(z.smokeX - lit.x) < 1) && r.log.kindled > 0, 'he LIGHTS the brazier he kneels at: its smoke rises (the column that lifts you)');
  const was = r.e.mode, got = abbotPlunge(r.e, r.c);
  ok(was === 'riteTell' && got && r.e.mode === 'downed', 'COME DOWN ON HIM while he prays at it = THE OPENING'); }
{ const r = rig({ riteCd: 0 }); r.e.riteDevNext = 'brazier';
  r.run(40, q => q.e.mode === 'rite' && q.e.riteDev === 'brazier');
  r.run(0.6); const smoke = !!r.e.smoke, warded = (r.e.blessT || 0) > 0;
  ok(warded && smoke, 'his rite done, the brazier keeps smoking while it wards him (the second opening stays open)');
  ok(abbotTake(r.e) === ABBOT.wardTake && ABBOT.wardTake >= 0.4, `warded, a blade is worth ${ABBOT.wardTake} (B15's floor, never nothing)`);
  ok(abbotPlunge(r.e, r.c) && r.e.mode === 'downed', 'a plunge on him warded by its smoke is THE OPENING too');
  r.run(ABBOT.downT + 0.2); r.e.blessT = ABBOT.bless; r.e.smoke = null;
  ok(!abbotPlunge(r.e, r.c) && r.e.mode !== 'downed', 'warded with no smoke (a bridge rite) a plunge is not an opening - the bell is'); }

// ---- THE CONGREGATION CALL ----
{ const r = rig({ riteCd: 999 }); let told = 0;
  r.run(90, q => { q.e.riteCd = 999; if (q.e.mode === 'callTell') told = Math.max(told, q.e.modeT); });
  ok(r.log.summons > 0, `he CALLS his congregation (told, ${ABBOT3.tell.call} s): ${r.log.summons} came up out of the pews in 90 s`);
  const r2 = rig({ riteCd: 999 }); r2.setAdds(ABBOT3.addsCap); r2.run(90, q => { q.e.riteCd = 999; });
  ok(r2.log.summons === 0, `never past ${ABBOT3.addsCap} of his at once`); }

// ---- THE FLOOR GOES at half: told, the rubble, and he takes the rope up into the belfry ----
let up = null;
{ const r = rig({ riteCd: 999, hp: Math.floor(ABBOT.hp * 0.51) }); r.e.hp = Math.floor(ABBOT.hp * ABBOT3.p2At) - 1; let tellT = 0;
  r.run(20, q => { q.e.riteCd = Math.max(q.e.riteCd, 0); if (q.e.mode === 'collapseTell') tellT = Math.max(tellT, q.e.modeT); return q.e.stage === 2; });
  ok(r.e.phase === 2 && tellT >= 1.4, `at ${ABBOT3.p2At * 100}% he rings for the bells (told ${tellT.toFixed(2)} s)`);
  ok(r.log.collapse === 1, 'THE FLOOR GOES: the belfry floor over the nave comes down once');
  ok(r.e.stage === 2 && Math.abs(r.e.y - S[2].floor) < 1 && r.e.x >= S[2].floorSpans[0][0], `and he takes the rope up: in the belfry, on its floor (x ${Math.round(r.e.x / TS)})`);
  ok(r.log.said.some(s => /UP THE FALLEN FLOOR/.test(s.m)), 'it says where he went');
  up = r; }

// ---- P2: you still below - he does not come down; the light and the call reach you, and he tells you where he is ----
{ const r = up; r.P.y = S[1].floor; r.P.x = 70 * TS; const seen = new Set(); const y0 = r.e.y;
  r.run(30, q => { q.e.riteCd = 999; if (q.e.mode.endsWith('Tell')) seen.add(q.e.mode); });
  ok([...seen].every(m => m === 'gleamTell' || m === 'callTell') && seen.has('gleamTell'), `with you below he only lobs false light and calls (${[...seen].join(', ')})`);
  ok(Math.abs(r.e.y - y0) < 1 && r.e.stage === 2, 'and never comes back down');
  ok(r.log.nudges > 0, 'every few seconds he says where he is (the hint: climb the fallen floor)'); }

// ---- P2: THE MAIN OPENING on a belfry bridge ----
{ const r = up; r.P.y = S[2].floor; r.P.x = 56 * TS; r.e.riteCd = 0; r.e.blessT = 0; r.e.riteDevNext = 'bridge'; let res = null;
  r.run(30, q => { if (q.e.mode === 'riteTell' && q.e.riteDev === 'bridge' && q.e.deck === 'high') { res = struck(q, q.e.riteBr); return true; } });
  ok(res === 'him', `P2: a belfry bridge's bell struck with him on it drops him (${res})`);
  r.run(3, q => q.e.mode === 'downed');
  ok(r.e.mode === 'downed' && Math.abs(r.e.y - S[2].floor) < 1 && S[2].floorSpans.some(([a, b]) => r.e.x >= a && r.e.x <= b), 'he lands on the belfry floor beside the hole, never in it'); }

// ---- P2: THE PEAL - a ring each way along the boards he stands on; jump it ----
{ const mk = (px, air) => { const r = rig({ riteCd: 999 }); r.e.stage = 2; r.e.phase = 2; r.e.y = S[2].floor; r.e.x = 60 * TS; r.e.deck = 'floor'; r.P.y = S[2].floor; r.P.x = px; r.P.ground = !air; r.e.turn = 1; return r; };
  const r = mk(68 * TS, false); let told = false;
  r.run(8, q => { q.e.riteCd = 999; if (q.e.mode === 'pealTell') told = true; return q.log.hits.some(hh => hh.name === 'THE PEAL'); });
  ok(told && r.log.hits.some(hh => hh.name === 'THE PEAL' && hh.hard), 'THE PEAL (red, told) runs along the floor and strikes a hero standing on it');
  const r2 = mk(68 * TS, true); r2.run(8, q => { q.e.riteCd = 999; q.P.ground = false; });
  ok(!r2.log.hits.some(hh => hh.name === 'THE PEAL'), 'in the air it passes under you (jump it)');
  const r3 = mk(86 * TS, false); r3.e.x = 60 * TS; r3.run(8, q => { q.e.riteCd = 999; if (q.e.waves) for (const w of q.e.waves) if (w.x > 76 * TS + 16) return true; });
  ok(!(r3.e.waves || []).some(w => w.x > 77 * TS), 'it stops at the end of its boards (the hole in the belfry floor)'); }

// ---- THE RESIST FLOOR, all fight: never under 0.4 ----
{ const r = rig({ riteCd: 0 }); let lo = 9, hi = 0, opens = 0;
  r.run(240, q => { const k = abbotTake(q.e); lo = Math.min(lo, k); hi = Math.max(hi, k); if (abbotOpen(q.e)) opens++;
    if (q.e.mode === 'riteTell' && q.e.riteDev === 'bridge' && q.e.deck === 'high') struck(q, q.e.riteBr);
    if (q.e.mode === 'riteTell' && q.e.riteDev === 'brazier') abbotPlunge(q.e, q.c);
    if (!abbotOpen(q.e)) { q.e.hp -= abbotClamp(q.e, 6 * DT * 60 * abbotTake(q.e)) / 60; } else q.e.hp -= abbotClamp(q.e, 0.6 * abbotTake(q.e));
    q.P.x = q.e.stage === 2 ? 64 * TS : 70 * TS; q.P.y = q.H().floor;
    if (q.e.mode === 'beaten') { abbotBellRung(q.e, 0, q.c); return true; } });
  ok(lo >= 0.4, `every blow all fight is worth at least ${lo} (B15 floor 0.4)`);
  ok(r.e.finished === true, `a scripted fight (bells struck, plunges taken, blades between) reaches the finale and the great bell finishes him (phase ${r.e.phase}, ${r.log.collapse} collapse)`); }

console.log(fails ? `\n${fails} FAILED` : '\nall false abbot 3 checks pass');
process.exit(fails ? 1 : 0);
