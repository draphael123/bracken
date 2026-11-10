// tools/wisp-art-draw.mjs (claude/wispart; node only, no browser): WISPWOOD's art draws. Every SOLID / ONE-WAY cell of the built level gets a tile (no stock fallback), spectral cells are the clear
// tile, a non-wood level takes none; every prop draws in every state; the thief draws in every mode; THE LANTERN WIDOW draws every POSE mode (windup differs from release), hurt, the death, her
// attacks; and the real hands' drawBack / drawOver / drawThief / drawBoss run in a fake world through a whole bot fight, dead boss included.
//   node tools/wisp-art-draw.mjs
globalThis.__WW = true;
const { install, newCanvas } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const ART = await import('../src/redraw/wispwood_art.js'), LWA = await import('../src/redraw/lantern_widow_art.js');
const { makeWispwoodHands } = await import('../src/wispwood-hands.js');
const { makeLanternWidowHands, POSE } = await import('../src/lantern-widow-hands.js'); const WDM = await import('../src/lantern-widow.js'); const { WD } = WDM;
const TS = 16; let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const lit = c => { const d = c._d; let k = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) k++; return k; };
const sig = c => Buffer.from(c._d).toString('base64');
const draw = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); fn(g); return c; };
const L = LEVELS.find(l => l.id === 'wispwood').build(), W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
/* tiles */
let n = 0, miss = 0, clear = 0; const seen = new Set(); const spec = new Set(); for (const s of L.ww.spans) for (let x = s.x0; x <= s.x1; x++) spec.add(s.y * W + x);
for (let y = 0; y < L.H; y++) for (let x = 0; x < W; x++) { const t = at(x, y); if (t !== T.SOLID && t !== T.ONEWAY) continue; n++; const c = ART.wispTile(t, x, y, at, T, L); if (!c) { miss++; continue; } seen.add(c); if (spec.has(y * W + x)) { if (lit(c) === 0) clear++; else miss++; } }
ok(n > 3000 && !miss, 'every solid / one-way cell has a tile: ' + n + ' cells, ' + miss + ' missing, ' + seen.size + ' distinct baked; ' + clear + ' spectral cells are the clear tile');
ok(L.ww.trunks.length >= 5, L.ww.trunks.length + ' dead-oak trunks recorded by the builder');
ok(ART.wispTile(T.SOLID, 5, 5, at, T, { ...L, wispwood: false }) === null && ART.wispTile(T.SPIKE, 5, 5, at, T, L) === null && ART.wispTile(T.AIR, 5, 5, at, T, L) === null, 'not the wood / not a solid: no tile');
const kinds = { ground: ART.groundTile(3, 3, { up: true }), barrow: ART.barrowTile(2, 24, { up: true }), trunk: ART.trunkTile(56, 20, {}), crown: ART.trunkTile(56, 20, { up: true }), bough: ART.boughTile(60, 14, false, false), root: ART.rootTile(60, 30, false, false) };
ok(new Set(Object.values(kinds).map(sig)).size === 6 && Object.values(kinds).every(c => lit(c) > 60), 'peat, barrow stone, trunk, sawn crown, bough, drowned root: six different tiles');
ok(sig(ART.groundTile(3, 3, { up: true })) !== sig(ART.groundTile(3, 3, {})) && sig(ART.groundTile(3, 3, { dn: true })) !== sig(ART.groundTile(3, 3, {})), 'a bank has its moss lip and its root fringe');
const sp = k => ART.spectralSprite(k, false, false, 1);
ok(new Set(['bridge', 'branch', 'rung'].map(k => sig(sp(k)))).size === 3 && sig(sp('bridge')) !== sig(ART.glintSprite(false, false, 1)) && lit(ART.glintSprite(false, false, 1)) < lit(sp('bridge')) / 2, 'a lit span (three kinds) is not its faint glint');
/* backdrop, mere, light, props */
{ const a = draw(480, 280, g => ART.drawBackdrop(g, 40 * TS, 20 * TS, 480, 280, 0.4, L)), b = draw(480, 280, g => ART.drawBackdrop(g, 200 * TS, 20 * TS, 480, 280, 0.4, L)); ok(lit(a) > 100 && sig(a) !== sig(b), 'the pale oaks, mist and wisps draw and scroll (parallax)'); }
{ const m = draw(200, 120, g => ART.drawMere(g, 0, 200, 30, 200, 120, 0.4, 1)); ok(lit(m) > 10000, 'the black mere draws'); }
{ const s = ['cold', 'lit', 'gutter'].map(st => sig(draw(30, 36, g => ART.drawCandle(g, 15, 32, st, 0.3)))); ok(new Set(s).size === 3, 'a grave candle: cold, lit, guttering'); }
ok(sig(draw(36, 52, g => ART.drawLamp(g, 12, 48, false, 0.3))) !== sig(draw(36, 52, g => ART.drawLamp(g, 12, 48, true, 0.3))), 'a hanging lamp lit / out');
ok(lit(draw(36, 40, g => ART.drawStone(g, 18, 36, 0.3))) > 250, 'the waystone');
{ const s = ['lit', 'out', 'stolen'].map(st => sig(draw(24, 24, g => ART.drawHeroLantern(g, 12, 10, 1, st, 0.3)))); ok(new Set(s).size === 3, 'the hero lantern: lit, drowned, stolen'); }
{ const a = [0.1, 0.6, 1].map(k => sig(draw(40, 24, g => ART.drawHandTell(g, 20, 18, 34, k, 0.05)))), h = [[0.3, 0], [1, 0], [1, 1]].map(([u, d]) => sig(draw(30, 42, g => ART.drawHand(g, 15, 38, u, d, 0.3)))); ok(new Set(a).size === 3 && new Set(h).size === 3, 'a shadow hand: the told ripple grows; it rises, and leans into its lunge'); }
ok(lit(draw(60, 14, g => ART.drawPool(g, 4, 56, 10, 0.5, 2))) > 100, 'a pool of shadow');
ok(sig(draw(100, 64, g => ART.drawExitHole(g, 50, 24, false, 0.3))) !== sig(draw(100, 64, g => ART.drawExitHole(g, 50, 24, true, 0.3))), 'the root-hole exit: webbed shut, then open');
{ const m = ['drift', 'swoopTell', 'swoop', 'flee', 'scorched'].map(mode => sig(draw(56, 48, g => ART.drawThief(g, { mode, face: 1, x: 40, flame: mode === 'flee' ? {} : null }, 28, 24, 1.1)))); ok(new Set(m).size === 5, 'the wisp thief: drift, told swoop, swoop, flee (with the flame), scorched'); }
ok(sig(draw(56, 48, g => ART.drawThief(g, { mode: 'drift', face: 1, x: 40, flash: 0.1 }, 28, 24, 1.1))) !== sig(draw(56, 48, g => ART.drawThief(g, { mode: 'drift', face: 1, x: 40 }, 28, 24, 1.1))), 'a hit flashes the thief white');
/* the Widow */
const WP = m => sig(draw(150, 104, g => LWA.drawWidow(g, 62, 90, m, POSE[m], 1, 0.9, {})));
const modes = Object.keys(POSE), all = modes.map(WP);
ok(new Set(all).size === modes.length, 'every one of her ' + modes.length + ' pose modes is its own picture');
ok(['veil', 'wail', 'hands', 'march'].every(m => WP(m + 'Tell') !== WP(m)) && WP('theftTell') !== WP('drift') && WP('reel') !== WP('lament'), 'each move windup differs from its release; the beckon, the reel and the lament are their own');
ok(sig(draw(150, 104, g => LWA.drawWidow(g, 62, 90, 'perch', POSE.perch, 1, 0.9, { stolen: true }))) !== WP('perch'), 'the great lantern blazes while she holds stolen light (the target)');
ok(sig(draw(150, 104, g => LWA.drawWidow(g, 62, 90, 'drift', POSE.drift, 1, 0.9, { flash: true }))) !== WP('drift'), 'hurt flashes her white');
ok(sig(draw(150, 104, g => LWA.drawWidow(g, 62, 90, 'drift', POSE.drift, 1, 0.9, {}))) !== sig(draw(150, 104, g => LWA.drawWidow(g, 62, 90, 'drift', POSE.drift, -1, 0.9, {}))), 'she faces both ways');
{ const d = [0.2, 1.6, 3.2].map(t => sig(draw(150, 104, g => { LWA.drawWidow(g, 62, 90, 'dead', POSE.reel, 1, 0.9, { t }); LWA.drawDeathLantern(g, 62, 96, 74, 74, t, 0.9); }))); ok(new Set(d).size === 3 && lit(draw(150, 104, g => LWA.drawDeathLantern(g, 62, 96, 74, 74, 4.6, 0.9))) === 0, 'she comes apart into blossom, the lantern drops and goes out, and she is gone after ~4.4 s'); }
ok(new Set([0.1, 0.7, 1].map(k => sig(draw(150, 90, g => LWA.drawWailRing(g, 75, 60, 20 + k * 40, k, 0.3))))).size === 3 && lit(draw(150, 60, g => LWA.drawMourners(g, 100, 50, 1, WD.march.h, 0.5))) > 100 && lit(draw(150, 90, g => LWA.drawMarchGate(g, 75, 80, 0.3))) > 400 && lit(draw(60, 60, g => LWA.drawFalseLight(g, 30, 30, 0.3, 0))) > 40, 'the wail rings, the mourners, the toll-gate and a false light draw');
ok(sig(draw(60, 60, g => LWA.drawHandSpot(g, 30, 50, 1.5, 0.3))) !== sig(draw(60, 60, g => LWA.drawHandSpot(g, 30, 50, 0.05, 0.3))), 'her hands: the ripple, then the hand');
/* the real hands in a fake world, a whole bot fight, drawn every few frames (dead boss too) */
const hero = (x, y, o = {}) => ({ x, y, hp: 640, vx: 0, vy: 0, ground: true, face: 1, ...o });
const L0 = LEVELS.find(l => l.id === 'wispwood').build(), A = L0.arena, P = hero(A.x0 + 3 * TS, A.floor), heroes = [P];
let HW = null;
const fx = { L: L0, TS, T, players: () => heroes, enemies: () => fx.ens, ens: [], time: () => 0, number() {}, hint() {}, asPlayer: (p, fn) => fn(), damage: (x, d) => { P.hp -= d; return 'hit'; }, cellSet: (x, y, t) => { L0.grid[y * L0.W + x] = t; }, upright: () => true, hitOnce: () => true, shake() {}, ring() {}, extraLights: () => (fx.extra ? fx.extra() : []), exitOpen: () => !!(HW && HW.show() && HW.show().won) };
const G = makeWispwoodHands(fx); G.reset(); let boss = null; const ctx = { ...fx, get L() { return L0; }, get boss() { return boss; }, bossActive: true, EHP: { lanternwidow: WD.hp }, ww: () => G };
HW = makeLanternWidowHands(ctx); fx.extra = () => HW.lights();
const sp0 = L0.ents.find(e => e.t === 'lanternwidow'); boss = HW.spawnBoss({ x: sp0.x * TS + 8, y: (sp0.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); boss.mode = 'wake'; boss.modeT = 1.6;
const S = HW.show(); const seenModes = new Set(); let t = 0, frames = 0, err = null, swing = 0, drew = 0;
const cv = newCanvas(560, 320), g = cv.getContext('2d');
const dt = 1 / 60, lp = () => WDM.lanternAt(boss);
while (t < 300 && boss.alive) { t += dt; try { G.update(dt); HW.update(boss, dt); } catch (e) { err = e; break; }
  seenModes.add(boss.mode); const goal = S.stolen ? lp().x - 10 : boss.x - 18; P.x += Math.sign(goal - P.x) * Math.min(Math.abs(goal - P.x), 92 * dt); P.y = Math.abs(goal - P.x) < 24 ? Math.min(A.floor, boss.y) : A.floor;
  swing -= dt; if (swing <= 0 && Math.abs(goal - P.x) < 24) { swing = 0.45; if (S.stolen) HW.strike({ l: lp().x - 6, r: lp().x + 6, t: lp().y - 6, b: lp().y + 6 }); if (Math.abs(boss.x - P.x) < 34) { boss.hp -= HW.take(boss, 40); boss.flash = 0.1; if (boss.hp <= 0) { boss.alive = false; HW.end(boss); } } }
  if (frames++ % 12 === 0) { try { const cx = P.x - 280, cy = P.y - 220; g.clearRect(0, 0, 560, 320); G.drawBack(g, cx, cy, 560, 320, t); G.drawOver(g, cx, cy, 560, 320, t); HW.drawBoss(g, boss, cx, cy, t); HW.drawOver(g, cx, cy, 560, 320, t); drew++; } catch (e) { err = e; break; } } }
ok(!err && !boss.alive, 'a whole bot fight draws without a throw (' + t.toFixed(0) + ' s, ' + drew + ' frames, ' + seenModes.size + ' modes seen)' + (err ? ': ' + err.stack.split('\n').slice(0, 3).join(' | ') : ''));
let dead0 = 0; for (let k = 0; k < 6; k++) { g.clearRect(0, 0, 560, 320); try { HW.drawBoss(g, boss, boss.x - 280, boss.y - 220, (HW.show().diedAt || 0) + 0.2 + k * 0.6); } catch (e) { err = e; } dead0 += lit(cv) > 0 ? 1 : 0; }
if (err) console.log(err.stack); ok(!err && dead0 > 0 && HW.show().won, 'the dead Widow still draws (comes apart) and the exit reads WON (' + dead0 + ' of 6 sample frames)');
fx.ens.push({ t: 'wwthief', alive: true, x: P.x, y: P.y - 30, mode: 'flee', face: 1, flame: P }); { let e2 = null; try { G.drawOver(g, P.x - 280, P.y - 220, 560, 320, 1); G.drawThief(g, fx.ens[0], P.x - 280, P.y - 220, 1); } catch (e) { e2 = e; } ok(!e2, 'the thief and its tether draw through the hands'); }
console.log(bad ? 'FAILED ' + bad : 'all ok'); process.exitCode = bad ? 1 : 0;
