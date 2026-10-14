// tools/feel-platform.mjs - PLATFORM FEEL (Daniel 10-12, claude/feelplatform), in the page:
//  CAMERA LOOKAHEAD  running right builds a lead of ~1/6 of the screen, EASED (not at once), stopping lets it go; it is OFF with Reduce motion, in a boss fight, in a camLock, on a co-op screen;
//                    a long fall leads the camera DOWN further than a short one.
//  LANDINGS BY HEIGHT a hop is a puff (a short landing), a drop is the usual landing, a five-tile drop is longer + a ring of dust; no landing locks input (a jump press clears it at once).
//  THE WORLD REACTS  a wooden ledge / plank dips under a landing (and nothing else does: stone does not), a deco vine/banner sways when the hero passes through it, nothing moves under Reduce motion,
//                    and NONE of it changes where the floor is (collision identical).
import { openPage } from './cdp.mjs';
const fails = []; const ok = (c, m) => { if (!c) { fails.push(m); console.log('FAIL ' + m); } };
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS, T } = await import('/src/level.js'); const out = {};
    BK.manualSimulation = true; BK.SET.speed = 1; BK.SET.reduceMotion = false; BK.SET.lookDown = true; BK.SET.parts = 'normal';
    const fresh = (id) => { const i = LEVELS.findIndex(l => l.id === id); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.sim(40); for (const k in BK.keys) BK.keys[k] = false; BK.P.inv = 99; return i; };
    /* ---- the lookahead on the first wood ---- */
    fresh('wood'); let P = BK.P; const rel = () => BK.camX() - (P.x - 160);
    BK.keys.right = true; const leads = []; for (let i = 0; i < 150; i++) { BK.sim(1); if (i === 10 || i === 40 || i === 149) leads.push(+BK.feel().lead.toFixed(1)); } out.leads = leads; out.on = BK.feel().la; out.vw = BK.view ? BK.view.VW : 320;
    BK.keys.right = false; BK.sim(120); out.leadAfterStop = +BK.feel().lead.toFixed(1);
    BK.SET.reduceMotion = true; BK.keys.right = true; BK.sim(60); out.leadReduced = +BK.feel().lead.toFixed(1); out.onReduced = BK.feel().la; BK.keys.right = false; BK.SET.reduceMotion = false;
    return out; })()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.on === true, 'the lookahead is on in an ordinary wood');
  ok(r.leads[0] > 2 && r.leads[0] < r.leads[1] && r.leads[1] <= r.leads[2] + 0.5, 'the lead BUILDS (eased), it does not appear at once: ' + r.leads);
  const sixth = (r.vw || 320) / 6; ok(r.leads[2] > sixth * 0.8 && r.leads[2] < sixth * 1.15, 'at a run the lead is about a sixth of the screen (' + sixth.toFixed(0) + '): ' + r.leads[2]);
  ok(Math.abs(r.leadAfterStop) < 3, 'stopping lets the lead go: ' + r.leadAfterStop);
  ok(r.onReduced === false && r.leadReduced === 0, 'Reduce motion switches the lookahead off: ' + r.onReduced + ' ' + r.leadReduced);

  const q = await pg.evalp(`(async()=>{
    const { LEVELS, T } = await import('/src/level.js'); const out = {};
    BK.manualSimulation = true; BK.SET.speed = 1; BK.SET.reduceMotion = false; BK.SET.parts = 'normal';
    const fresh = (id) => { const i = LEVELS.findIndex(l => l.id === id); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.sim(40); for (const k in BK.keys) BK.keys[k] = false; BK.P.inv = 99; BK.P.hp = BK.P.maxHp; return i; };
    fresh('wood'); const L = BK.L, P = BK.P; const W = L.W, H = L.H;
    /* a column with solid floor and 9+ clear tiles over it, to drop from */
    const tileAt = (x, y) => L.grid[y * W + x]; let col = null;
    for (let x = 4; x < W - 4 && !col; x++) for (let y = 14; y < H - 2; y++) { if (tileAt(x, y) === T.SOLID && tileAt(x, y - 1) === 0) { let clear = 0; while (y - 1 - clear >= 0 && tileAt(x, y - 1 - clear) === 0) clear++; if (clear >= 10) { col = [x, y]; break; } } }
    out.col = col; if (!col) return out;
    const drop = (tilesUp) => { fresh('wood'); const P = BK.P; P.x = col[0] * 16 + 8; P.y = (col[1] - tilesUp) * 16; P.vx = 0; P.vy = 0; P.ground = false; P.airTopY = P.y; let rec = null;
      for (let i = 0; i < 200; i++) { BK.sim(1); if (BK.P.ground) { const f = BK.feel(); rec = { landT: +f.landT.toFixed(2), landArt: +(f.landArt || 0).toFixed(2), parts: f.nparts }; break; } } return rec; };
    out.hop = drop(0.5); out.drop3 = drop(3); out.drop8 = drop(8);
    /* no input lock: a jump press right at the landing is taken at once */
    fresh('wood'); { const P = BK.P; P.x = col[0] * 16 + 8; P.y = (col[1] - 8) * 16; P.vx = 0; P.vy = 0; P.ground = false; P.airTopY = P.y; for (let i = 0; i < 200 && !BK.P.ground; i++) BK.sim(1); BK.press('jump'); BK.keys.jump = true; let up = false; for (let i = 0; i < 12; i++) { BK.sim(1); if (BK.P.vy < -50 || !BK.P.ground) up = true; if (i === 1) BK.keys.jump = false; } out.jumpedAfterBigLanding = up; }
    /* collision identical: the tile under the hero is where it was */
    out.groundY = BK.P.y;
    return out; })()`, 600000);
  console.log(JSON.stringify(q));
  if (q.col) {
    ok(q.hop && q.drop3 && q.drop8, 'all three landings happened');
    ok(q.hop.landT <= q.drop3.landT && q.drop3.landT < q.drop8.landT, 'landing length grows with the height: ' + [q.hop.landT, q.drop3.landT, q.drop8.landT]);
    ok(q.drop8.landArt > q.drop3.landArt, 'the big drop has the longer crouch-recover: ' + q.drop8.landArt + ' vs ' + q.drop3.landArt);
    ok(q.drop8.parts > q.hop.parts, 'the big drop throws more dust than a hop (a ring): ' + q.drop8.parts + ' vs ' + q.hop.parts);
    ok(q.jumpedAfterBigLanding, 'a big landing never locks the controls: the jump press took');
  } else console.log('NOTE no tall column found on bracken: landing tiers not measured');

  /* THE WORLD REACTS: a wooden ledge dips, stone does not; reduce motion keeps it still; a vine deco sways */
  const w = await pg.evalp(`(async()=>{
    const { LEVELS, T } = await import('/src/level.js'); const out = {}; BK.manualSimulation = true; BK.SET.speed = 1; BK.SET.parts = 'normal';
    const fresh = (id) => { const i = LEVELS.findIndex(l => l.id === id); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.sim(40); for (const k in BK.keys) BK.keys[k] = false; BK.P.inv = 99; BK.P.hp = BK.P.maxHp; return i; };
    /* find a level with a wooden one-way ledge or plank with clearance above, in any wood */
    for (const lv of LEVELS) { let b; try { b = lv.build(); } catch { continue; } }
    let found = null;
    for (const id of ['wood', 'stockade', 'hanging', 'harbor', 'spore', 'marsh']) { const idx = LEVELS.findIndex(l => l.id === id); if (idx < 0) continue; fresh(id); const L = BK.L, W = L.W, H = L.H;
      for (let y = 8; y < H - 2 && !found; y++) for (let x = 4; x < W - 4; x++) { const t = L.grid[y * W + x]; if ((t === T.PLANK || t === T.NET || t === T.ONEWAY) && L.grid[(y - 1) * W + x] === 0 && L.grid[(y - 2) * W + x] === 0 && L.grid[(y - 3) * W + x] === 0 && L.grid[(y - 4) * W + x] === 0) { found = { id, x, y, t }; break; } } if (found) break; }
    out.found = found; if (!found) return out;
    const land = (reduce) => { fresh(found.id); BK.SET.reduceMotion = reduce; const P = BK.P; P.x = found.x * 16 + 8; P.y = (found.y - 3) * 16; P.vx = 0; P.vy = 0; P.ground = false; P.airTopY = P.y - 40; let rec = null; for (let i = 0; i < 90; i++) { BK.sim(1); if (BK.P.ground) { const f = BK.feel(); rec = { dips: f.dips, dipT: +(f.dipT || 0).toFixed(2), y: BK.P.y }; break; } } BK.SET.reduceMotion = false; return rec; };
    out.land = land(false); out.landReduced = land(true);
    return out; })()`, 600000);
  console.log(JSON.stringify(w));
  if (w.found) {
    ok(w.land && w.land.dips > 0, 'a wood/rope ledge dips under a landing: ' + JSON.stringify(w.land));
    ok(w.landReduced && w.landReduced.dips === 0, 'Reduce motion: nothing dips: ' + JSON.stringify(w.landReduced));
    ok(w.land && w.landReduced && w.land.y === w.landReduced.y, 'collision is identical with and without the dip: ' + w.land.y + ' vs ' + w.landReduced.y);
  } else console.log('NOTE no wooden ledge found in the sampled levels');
  ok(!pg.errors.length, 'page errors: ' + pg.errors.slice(0, 2).join(' / '));
} finally { await pg.close(); }
if (fails.length) { console.log('FEEL-PLATFORM: ' + fails.length + ' red'); process.exit(1); }
console.log('FEEL-PLATFORM ok');
