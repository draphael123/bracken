// tools/firedamp.mjs - FIREDAMP, the model and THE UNDERCROWN 3's data (claude/undercrown3). NODE ONLY (no browser).
//   THE MODEL   src/firedamp.js: sources fill, open doors level by volume, holes only take gas UP, a dam shuts with its slab flat, a flame lights
//               only a READY band it is in, the fuse is told (FD.FUSE) and the blast empties the chamber; a DUCKED hero is under every band, a
//               standing one is not under a full one; the canary slows and stops at READY.
//   THE DATA    every chamber is air under a roof inside the level, every door joins real chambers (a slab door a real slab), every wind door and
//               canary cage stands in its chamber, every lamp's ignition point is reported (a floor lamp = the gas has come down that far),
//               THE EXAM: the stope stage's cold lamp is in the band at READY and the blast box then takes BOTH hung-walkway posts (it drops flat:
//               a bridge), THE TEACH: the fireman stands in the works, THE TOMB: off until P2, fills to READY in a P2's length.
// Exit 1 on any failure. Usage: node tools/firedamp.mjs [--verbose]
process.env.BRACKEN_UC3 = '1';
const { LEVELS, T, TS, UC3 } = await import('../src/level.js');
const FDM = await import('../src/firedamp.js');
const { FD } = FDM;
const FP = await import('../src/fallen-pillar.js');
const { DUCK_H } = await import('../src/duck.js');
const VERBOSE = process.argv.includes('--verbose');
let fails = 0, passes = 0; const fail = m => { fails++; console.log('  FAIL ' + m); }, ok = m => { passes++; if (VERBOSE) console.log('  ok   ' + m); }, check = (c, m) => (c ? ok(m) : fail(m));
if (!UC3) { console.error('UC3 flag did not turn on'); process.exit(1); }
const L = LEVELS.find(l => l.id === 'undercrown').build();
const W = L.W, H = L.H, ta = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
const solid = t => t === T.SOLID || t === T.SOFT || t === T.CRATE;
check(!!L.firedamp && L.uc3, 'UC3 level carries firedamp');
console.log('FIREDAMP - the model');
/* ---- THE MODEL, on a toy: A (src) | door | B ; A has a hole up to C; D is out ---- */
{
  const mk = () => FDM.makeFiredamp({ chambers: [{ id: 'A', x0: 0, x1: 9, y0: 0, y1: 3, src: 0.1 }, { id: 'B', x0: 10, x1: 19, y0: 0, y1: 3 }, { id: 'C', x0: 0, x1: 9, y0: -5, y1: -2 }],
    doors: [{ id: 'd', a: 'A', b: 'B' }, { id: 'hole', a: 'B', b: 'C', up: true, slab: 's' }, { id: 'dam', a: 'A', b: 'C', slab: 'q', dam: true, open: true }] });
  let st = mk(); st.doors[2].open = false;
  for (let i = 0; i < 300; i++) FDM.step(st, 1 / 60);
  check(Math.abs(st.byId.get('A').fill - 0.5) < 1e-6 && st.byId.get('B').fill === 0, 'a source fills its chamber (0.1/s x 5 s = 0.5); a shut door holds');
  FDM.setDoor(st, 'd', true); for (let i = 0; i < 600; i++) FDM.step(st, 1 / 60);
  const a = st.byId.get('A').fill, b = st.byId.get('B').fill; check(Math.abs(a - b) < 0.12 && b > 0.3, `an open door levels two chambers (A ${a.toFixed(2)} B ${b.toFixed(2)})`);
  FDM.slabDoors(st, 's', 'up'); check(!st.doors[1].open, 'a slab whole: its hole is shut'); FDM.slabDoors(st, 's', 'ramp'); check(st.doors[1].open, 'a slab swung: its hole is open');
  FDM.slabDoors(st, 's', 'flat'); check(!st.doors[1].open, 'a slab flat: its hole is shut');
  FDM.slabDoors(st, 'q', 'up'); check(st.doors[2].open, 'a dam open while its slab is up'); FDM.slabDoors(st, 'q', 'flat'); check(!st.doors[2].open, 'a dam shut by its slab down flat');
  /* up only */
  st = mk(); st.doors[0].open = false; st.doors[2].open = false; st.byId.get('B').fill = 0; st.byId.get('C').fill = 0.8; st.doors[1].open = true;
  for (let i = 0; i < 120; i++) FDM.step(st, 1 / 60); check(st.byId.get('B').fill === 0, 'a hole takes gas UP only (none comes down it)');
  /* the flame */
  st = mk(); st.doors[2].open = false; const A = st.byId.get('A'); A.src = 0; A.fill = 0.5;
  check(!FDM.lightAt(st, 40, 4), 'no flame takes a band under READY');
  A.fill = 0.7; const floorY = 4 * TS;
  check(!FDM.lightAt(st, 40, floorY - 2), 'a flame under the band does not take it');
  check(!!FDM.lightAt(st, 40, floorY - 2, FD.FLARE), 'a FLARED flame (a struck lit lamp) reaches up into it');
  let blasts = 0; for (let i = 0; i < Math.ceil((FD.FUSE + 0.05) * 60); i++) for (const e of FDM.step(st, 1 / 60)) if (e.t === 'blast') blasts++;
  check(blasts === 1 && A.fill === 0 && A.rest > 0, `the fuse is told (${FD.FUSE} s), then one blast empties it and it rests`);
  /* who is under it */
  A.fill = 1; const box = FDM.blastBox(A);
  check(FDM.inBlast(box, { x: 40, y: floorY, w: 10, h: 14 }), 'a FULL band takes a standing hero');
  check(!FDM.inBlast(box, { x: 40, y: floorY, w: 10, h: DUCK_H }), 'a DUCKED hero is under even a full band');
  check(FDM.canary({ fill: 0.1 }).gap < FDM.canary({ fill: 0.5 }).gap && FDM.canary({ fill: FD.READY }).silent, 'the canary slows as it fills and stops at READY');
}
console.log('FIREDAMP - THE UNDERCROWN 3 data');
const st = FDM.makeFiredamp(L.firedamp), chambers = st.chambers;
const slabIds = new Set(L.slabs.map(s => s.id));
for (const c of chambers) {
  check(c.x0 >= 0 && c.x1 < W && c.y0 >= 0 && c.y1 < H && c.x0 <= c.x1 && c.y0 <= c.y1, `${c.id}: inside the level`);
  let air = 0, n = 0, roof = 0; for (let x = c.x0; x <= c.x1; x++) { for (let y = c.y0; y <= c.y1; y++) { n++; if (!solid(ta(x, y))) air++; } if (solid(ta(x, c.y0 - 1)) || ta(x, c.y0 - 1) === T.PLANK) roof++; }
  check(air / n >= 0.7, `${c.id}: open air (${Math.round(100 * air / n)}%)`);
  check(roof / (c.x1 - c.x0 + 1) >= 0.5 || ['stope'].includes(c.id), `${c.id}: a roof over ${Math.round(100 * roof / (c.x1 - c.x0 + 1))}% of it`);
  if (c.src) { const tReady = FD.READY / c.src; check(tReady >= 6 && tReady <= 30, `${c.id}: fills to READY in ${tReady.toFixed(1)} s (6-30)`); }
  const band = FDM.roomPx(c) - FD.DUCK_ROOM; check(band >= 40, `${c.id}: full band ${band} px`);
}
for (const d of st.doors) {
  check(st.byId.has(d.a) && (d.b === null || st.byId.has(d.b)), `door ${d.id}: joins real chambers`);
  if (d.slab) check(slabIds.has(d.slab), `door ${d.id}: its slab ${d.slab} exists`);
}
const chamberOf = (x, y) => FDM.chamberAt(st, x * TS + 8, (y + 1) * TS - 4);
for (const e of L.ents) {
  if (e.t === 'brattice') { const d = st.doors.find(q => q.id === e.door); check(!!d && d.brattice, `wind door at ${e.x},${e.y}: door ${e.door}`);
    const c = chamberOf(e.x, e.y); check(!!c && d && (c.id === d.a || c.id === d.b), `wind door at ${e.x},${e.y}: stands in its chamber (${c && c.id})`); }
  if (e.t === 'canarycage') { const c = chamberOf(e.x, e.y); check(!!c && c.id === e.chamber, `canary at ${e.x},${e.y}: in ${e.chamber} (${c && c.id})`); }
  if (e.fireman) { const c = chamberOf(e.x, e.y); check(!!c && c.src > 0, `the fireman at ${e.x},${e.y}: in a gassy chamber (${c && c.id})`); }
}
check(L.ents.some(e => e.fireman), 'a FIREMAN is placed (teach)');
check(L.ents.filter(e => e.t === 'canarycage').length >= 5, 'a canary per gassy section');
/* every lit lamp: the fill at which its own flame takes the band (a floor lamp: the gas has come all the way down) */
const lampRows = [];
for (const e of L.ents) { if (e.t !== 'minerlamp') continue; const fx = e.x * TS + 8, fy = (e.y + 1) * TS - 12, c = FDM.chamberAt(st, fx, fy); if (!c) continue;
  const fill = (fy - c.y0 * TS) / (FDM.roomPx(c) - FD.DUCK_ROOM); lampRows.push(`${c.id}@${e.x},${e.y} ${e.lit === false ? 'cold' : 'LIT'} takes it at ${fill > 1 ? 'never (under a full band)' : fill.toFixed(2)}`);
  if (e.lit !== false) check(fill >= FD.READY, `a lit lamp at ${e.x},${e.y} (${c.id}) does not burn the gas off before READY (${fill.toFixed(2)})`); }
if (VERBOSE) for (const r of lampRows) console.log('       ' + r);
/* THE EXAM: the stope's stage lamp, struck lit at READY, and the blast takes the hung walkway's posts */
{ const c = st.byId.get('stope'), lamp = L.ents.find(e => e.t === 'minerlamp' && e.x === 26 && e.y === 97);
  check(!!lamp && lamp.lit === false, 'the stope stage has a cold lamp');
  c.fill = FD.READY; const fy = (lamp.y + 1) * TS - 12; check(fy < FDM.bandBottom(c), `its flame is in the band at READY (flame ${fy}, band ${Math.round(FDM.bandBottom(c))})`);
  const box = FDM.blastBox(c), sl = L.slabs.find(s => s.id === 'stope');
  const posts = L.ents.filter(e => e.t === 'timber' && e.slab === 'stope');
  check(posts.length === 2 && posts.every(p => FDM.pointInBlast(box, p.x * TS + 8, (sl.row + 1) * TS + 1)), 'the READY blast takes BOTH hung-walkway posts');
  const g2 = L.grid.slice(), t2 = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g2[y * W + x]; for (let x = sl.x0; x <= sl.x1; x++) g2[sl.row * W + x] = T.AIR;
  const r = FP.restFor(t2, sl); check(!!r && r.kind === 'bridge', `both posts gone, it drops flat across the walkways: a ${r && r.kind}`);
  /* a hero on the stage when it goes is in it; one who got down to the near walkway is not */
  check(FDM.inBlast(box, { x: 26 * TS, y: 98 * TS, w: 10, h: 14 }), 'a hero left standing on the stage takes it (strike it, then get down)');
  check(!FDM.inBlast(box, { x: 36 * TS, y: 112 * TS, w: 10, h: 14 }), 'a hero down on the near walkway does not');
}
/* THE TEACH: the works fill, its posts are in the band, the wind door routes it */
{ const s2 = FDM.makeFiredamp(L.firedamp), w = s2.byId.get('works'), ld = s2.byId.get('landing');
  for (let i = 0; i < 20 * 60; i++) FDM.step(s2, 1 / 60); check(FDM.ready(w) && ld.fill === 0, `works READY in 20 s with its wind door shut (fill ${w.fill.toFixed(2)}), the landing clean`);
  const s3 = FDM.makeFiredamp(L.firedamp); FDM.setDoor(s3, 'bratW', true); for (let i = 0; i < 20 * 60; i++) FDM.step(s3, 1 / 60);
  const w3 = s3.byId.get('works'); check(w3.fill < w.fill, `with the wind door open the works fill slower (${w3.fill.toFixed(2)} vs ${w.fill.toFixed(2)})`);
  const s4 = FDM.makeFiredamp(L.firedamp); FDM.slabDoors(s4, 'works1', 'ramp'); for (let i = 0; i < 20 * 60; i++) FDM.step(s4, 1 / 60);
  check(s4.byId.get('worksUp').fill > 0.1 && s4.byId.get('works').fill < w.fill, 'a cut post opens a hole: the works drain UP into the working over it'); }
/* THE TOMB: off in P1; on, READY in under a phase */
{ const s5 = FDM.makeFiredamp(L.firedamp), tb = s5.byId.get('tomb'); for (let i = 0; i < 30 * 60; i++) FDM.step(s5, 1 / 60); check(tb.fill === 0, 'the tomb breathes nothing in P1 (off)');
  tb.on = true; let t = 0; while (!FDM.ready(tb) && t < 60) { FDM.step(s5, 1 / 60); t += 1 / 60; } check(t >= 8 && t <= 20, `on (P2), the tomb is READY in ${t.toFixed(1)} s`);
  /* where it finds him: on the floor, and up on a fallen shelf (3 rows) */
  const floor = (tb.y1 + 1) * TS;
  const at = top => (top - tb.y0 * TS) / (FDM.roomPx(tb) - FD.DUCK_ROOM);
  console.log(`  tomb: the band reaches the Prince's crown on the floor at fill ${at(floor - 60).toFixed(2)}, on a shelf at ${at(floor - 48 - 60).toFixed(2)}; a standing hero at ${at(floor - 14).toFixed(2)}; ducked never`); }
console.log(fails ? `FIREDAMP: ${fails} FAILED, ${passes} passed` : `FIREDAMP: all ${passes} passed`);
process.exit(fails ? 1 : 0);
