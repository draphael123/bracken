/* tools/hl-art-lint.mjs - THE HIGH LINES' ART, node-only lint (claude/hlart, 2026-11-05). No page, no browser, no real canvas: a recording 2d-context stub stands in for document.createElement('canvas').
     node tools/hl-art-lint.mjs
   A  the tile kit: every tile of the built level (granite in six stones, gantry decks, rock lips, nets) bakes to 16x16; no NaN, no undefined colour; every colour is a declared literal of the kit
   B  the supports: every landing and net has drawn posts at BOTH ends, every post reaches (bottom > y + 1), they draw with no bad colour; anchor-lint finds no cantilever left on the level
   C  the backdrop: mountain + cave mouth, far range and the station bake; the mouth GROWS monotonically with the climb and slides down; draws clean at 24 camera spots
   D  the machinery: every line kind in every state (taut, hauled, parted, snapping, with points), posts, the hopper, the cab (rest / creak / fall), the weight pair at every k, the grip, the wind, the dressing
   E  THE CREW: every Hookjack mode has its own frame; every TELL differs from its RELEASE; every Skyhook pose draws, tells differ from releases, stays inside a 90x80 box round his feet, facing mirrors
   F  palette discipline (a kit, not a rainbow) and files: no ad-block words in the new filenames; the level carries hlKit; main.js and the hands wire every hook */
import { readFileSync } from 'node:fs';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const URLS = f => new URL('../src/' + f, import.meta.url);
const COLS = new Map(); let REC = null, BAD = [];
function makeCtx(w, h) {
  return { canvas: { width: w, height: h }, fillStyle: '#000000', strokeStyle: '#000000', globalAlpha: 1, lineWidth: 1, imageSmoothingEnabled: false, globalCompositeOperation: 'source-over',
    fillRect(x, y, ww, hh) { const c = String(this.fillStyle); COLS.set(c, (COLS.get(c) || 0) + 1); if (![x, y, ww, hh].every(Number.isFinite)) BAD.push('NaN rect ' + [x, y, ww, hh] + ' ' + c); if (/undefined|NaN|null/.test(c)) BAD.push('bad colour ' + c);
      if (REC) REC.push([x, y, ww, hh, c, this.globalAlpha].join(',')); },
    clearRect() {}, drawImage(im, ...a) { if (a.some(v => !Number.isFinite(v))) BAD.push('NaN drawImage'); }, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, stroke() {}, arc() {}, ellipse() {}, save() {}, restore() {}, setLineDash() {}, translate() {}, scale() {},
    getImageData(x, y, ww, hh) { return { data: new Uint8ClampedArray(ww * hh * 4), width: ww, height: hh }; }, putImageData() {}, createLinearGradient() { return { addColorStop() {} }; } };
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => { const g = makeCtx(c.width, c.height); g.canvas = c; return g; }; return c; } };
const lit = src => new Set([...readFileSync(src, 'utf8').matchAll(/'(#[0-9a-fA-F]{6})'/g)].map(m => m[1].toLowerCase()));
const FILES = { tiles: URLS('redraw/high_lines_tiles.js'), back: URLS('redraw/high_lines_back.js'), art: URLS('redraw/high_lines_art.js'), crew: URLS('redraw/line_crew_art.js') };
const LIT = {}; for (const k in FILES) LIT[k] = lit(FILES[k]);
const reset = () => { COLS.clear(); BAD = []; };
const colourBad = allowed => [...COLS.keys()].filter(c => !/^rgba?\(/.test(c) && !allowed.has(c.toLowerCase()));
const HLT = await import(FILES.tiles.href), HLB = await import(FILES.back.href), HLA = await import(FILES.art.href), CREW = await import(FILES.crew.href);
const { LEVELS, T } = await import(URLS('level.js').href), LKT = await import(URLS('line-kit.js').href), HJ = await import(URLS('hookjack.js').href), SKH = await import(URLS('skyhook-hands.js').href);
const HLD = await import(URLS('highlines.js').href);
const SUPX = LKT.SUP.HANG_X + 1, VIEWS_SUP = [[300, 3100], [200, 3000], [0, 2900], [0, 1500], [300, 1200], [700, 1450], [300, 600], [300, 800]];   /* (claude/hlfix) the foot beam may run this far (tiles); where the masts are drawn from */
const L = LEVELS.find(l => l.id === 'highlines').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);

// ---------- A. THE TILE KIT ----------
reset(); const kinds = {}, zones = new Set(); let tiles = 0;
for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = at(x, y); if (t === T.AIR) continue; const c = HLT.hlTile(t, x, y, at, T, L); if (c) { tiles++; kinds[t] = (kinds[t] || 0) + 1; zones.add(HLT.zoneOf(x, y)); ok(c.width === 16 && c.height === 16, 'tile 16x16 at ' + x + ',' + y); } }
ok(tiles > 600, 'the kit drew ' + tiles + ' cells'); ok(kinds[T.SOLID] > 300 && kinds[T.ONEWAY] > 100, 'solid and one-way present: ' + JSON.stringify(kinds));
ok(zones.size === 6, 'six stone zones over the climb: ' + [...zones].sort());
ok(BAD.length === 0, 'tiles: no NaN rects or bad colours ' + BAD.slice(0, 3)); ok(colourBad(LIT.tiles).length === 0, 'tiles: every colour is a kit literal: ' + colourBad(LIT.tiles).slice(0, 4));
{ const M = new Set(); for (const b of L.nets) for (let x = b[0]; x <= b[2]; x++) M.add(x); ok(M.size > 30, 'cargo nets present'); }
{ const kindsSeen = new Set(); for (const b of L.landings) { const c = HLT.hlTile(T.ONEWAY, b[0], b[1], at, T, L); kindsSeen.add(c); } ok(kindsSeen.size >= 3, 'landings bake as gantries and rock lips'); }
ok(HLT.ROCK_LANDINGS.join() === HLD.ROCK_LANDINGS.join(), 'the tile kit and the level agree which landings are rock lips');
ok(HLT.hlTile(T.SPIKE, 3, 3, () => T.AIR, T, L) === null, 'a tile the kit does not own falls back to the game');

// ---------- B. THE SUPPORTS ----------
reset(); const S = L.routeSupports || [];
ok(S.length > 60, 'drawn supports: ' + S.length); ok(S.every(p => p.kind === 'hlgantry' && p.bottom > p.y + 1), 'every post reaches below its deck');
const runs = L.landings.map((b, i) => [b[0], b[2], b[1], i]).filter(r => !HLD.FLOOR_LANDINGS.includes(r[3])).concat(L.nets.map(b => [b[0], b[2], b[1], -1]));
for (const [x0, x1, y] of runs) { ok(S.some(p => p.x === x0 && p.y === y), 'a post at the left end of the run ' + x0 + '-' + x1 + ',' + y); ok(S.some(p => p.x === x1 && p.y === y), 'a post at the right end of the run ' + x0 + '-' + x1 + ',' + y); }
const stk = {}; for (const p of S) stk[p.st] = (stk[p.st] || 0) + 1; ok(stk.pylon > 5 && stk.corbel > 10 && (stk.bracketL || 0) + (stk.bracketR || 0) > 5, 'pylons, corbels and brackets all used: ' + JSON.stringify(stk));
for (const p of S) for (const cx of [p.x * 16 - 100, p.x * 16 + 30]) HLT.drawGantry(makeCtx(320, 180), p, cx, p.y * 16 - 90);
{ const g = makeCtx(320, 180); for (const p of S) HLT.drawGantry(g, p, p.x * 16 - 100, p.y * 16 - 90); }
ok(BAD.length === 0, 'supports: no NaN or bad colour ' + BAD.slice(0, 3)); ok(colourBad(LIT.tiles).length === 0, 'supports: every colour is a kit literal: ' + colourBad(LIT.tiles).slice(0, 4));
{ const AL = await import(URLS('../tools/anchor-lint.mjs').href); const f = AL.anchorFaults(L); ok(f.filter(q => q.kind === 'cantilever').length === 0, 'anchor-lint: no cantilever left: ' + JSON.stringify(f.filter(q => q.kind === 'cantilever').slice(0, 3)));
  ok(f.filter(q => q.kind === 'prop').length === 0, 'anchor-lint: no prop on air'); ok(f.filter(q => q.kind === 'overhang').length === 0, 'anchor-lint: no overhang'); }
/* (claude/hlfix) NO FLOATING CONNECTORS: every end of every line is held by a drawn mast / hanger / wall arm, checked against the level's own grid and landings, and the lint reds a floating one */
{ const solid = (x, y) => at(x, y) === T.SOLID, E = LKT.endSupports(L, solid), nEnds = L.lineKit.lines.length * 2;
  ok(L.lineKit.strictEnds === true, 'the level asks the strict end lint (lineKit.strictEnds)'); ok(E.length === nEnds && E.every(r => r.kind !== 'none'), 'every one of the ' + nEnds + ' line ends is held: ' + E.filter(r => r.kind === 'none').map(r => r.line + r.end));
  ok(JSON.stringify(L.lineKit.ends) === JSON.stringify(E), 'the level ends table is what the grid says');
  for (const r of E) { if (r.kind === 'deck' || r.kind === 'hang') { const deck = L.landings.find(b => (r.kind === 'deck' ? b[1] === r.toY : b[1] + 1 === r.toY) && r.foot >= b[0] - 1 && r.foot <= b[2] + 1); ok(!!deck, r.line + r.end + ': its mast meets a real deck (' + r.kind + ' to row ' + r.toY + ')'); ok(Math.abs(r.foot - r.x) <= SUPX, r.line + r.end + ': the foot beam is short (' + Math.abs(r.foot - r.x).toFixed(1) + ' tiles)'); } else ok(L.lineKit.lines.length > 0 && at(r.wallX, Math.round(r.y)) === T.SOLID || at(r.wallX - 1, Math.round(r.y)) === T.SOLID, r.line + r.end + ': its wall arm meets rock'); }
  ok(LKT.lintLines(L).filter(q => /hangs from nothing/.test(q)).length === 0, 'lintLines: no end hangs from nothing');
  for (const k of ['a', 'b']) { const bad = JSON.parse(JSON.stringify({ ...L, lineKit: { ...L.lineKit, ends: undefined } })); const ln = bad.lineKit.lines.find(q => q.id === 'W1'); ln[k] = [70, 20 + (k === 'a' ? 0 : -2)];   /* (batch188) b at row 18: the switch level's new landing LE (71, 70) is 47 rows below row 23 and would hold a rope end there (the tall guyed pylon reaches 48 rows) */ ok(LKT.lintLines(bad).some(q => /W1: end . .*hangs from nothing/.test(q)), 'a line end moved off into open air (' + k + ') is a red: ' + LKT.lintLines(bad).filter(q => /W1/.test(q)).slice(0, 2).join(' | ')); }
  const g2 = makeCtx(320, 180); for (const [cx, cy] of VIEWS_SUP) HLA.drawEndSupports(g2, LKT.lineInit(L), cx, cy, 320, 180); ok(BAD.length === 0, 'end supports: no NaN or bad colour ' + BAD.slice(0, 3)); }
{ const decor = []; HLT.dress(decor, L, at, T); HLA.dress(decor, L, at, T); ok(decor.length > 20, 'dressing placed: ' + decor.length); ok(decor.every(d => d.c && d.c.width > 0 && Number.isFinite(d.x) && Number.isFinite(d.y)), 'every dressing piece has a sprite and a place');
  ok(decor.some(d => d.c.width === 104), 'the Lee Hut is placed'); ok(decor.filter(d => d.c.width >= 40 && d.c.width <= 56 && d.c.height >= 30).length >= 2, 'lee rocks are placed'); }

// ---------- C. THE BACKDROP ----------
reset();
const mtn = HLB.bakeMountain(), far = HLB.bakeFar(), st = HLB.bakeStation();
ok(mtn.width === HLB.MW && mtn.height === HLB.MH, 'mountain 480x300'); ok(far.width === 480 && st.width === 640 && st.height === HLB.STH && HLB.STH === 180 + 2 * HLB.STATION_PAD, 'far range and station bake'); ok(HLB.bakeMountain() === mtn && HLB.bakeStation() === st, 'layers bake once');
{ let last = null, grow = true, slide = true; for (let p = 0; p <= 1.0001; p += 0.05) { const G = HLB.mouthGeom(p, 320, 180, 0); if (last && (G.s < last.s || G.y < last.y)) { grow = false; slide = false; } last = G; ok([G.s, G.x, G.y, G.w, G.h].every(Number.isFinite), 'mouth geometry finite at ' + p); }
  ok(grow, 'the cave mouth only grows as you climb'); ok(slide, 'and slides down the screen as you rise'); const g0 = HLB.mouthGeom(0, 320, 180, 0), g1 = HLB.mouthGeom(1, 320, 180, 0); ok(g1.s / g0.s > 5, 'it grows more than five-fold: ' + (g1.s / g0.s).toFixed(1)); ok(g0.s < 0.35 && g1.s > 1.6, 'scale from ' + g0.s + ' to ' + g1.s); }
ok(HLB.stationAlpha(L.H * 16) === 0 && HLB.stationAlpha(0) === 1 && HLB.stationAlpha(40 * 16) > 0.9, 'the station wall takes over inside the cave');
{ const g = makeCtx(320, 180); for (let i = 0; i < 24; i++) { const cy = Math.round(i / 23 * (L.H * 16 - 180)); HLB.drawBackdrop(g, (i * 97) % 700, cy, 320, 180, L, i * 0.37, 0, true); } }
ok(BAD.length === 0, 'backdrop: no NaN rects or bad colours ' + BAD.slice(0, 3)); ok(colourBad(new Set([...LIT.back, '#c8d4e4', '#ffffff', '#ffb23c'])).length === 0, 'backdrop: every colour is a literal: ' + colourBad(new Set([...LIT.back, '#c8d4e4', '#ffffff', '#ffb23c'])).slice(0, 4));

// ---------- D. THE MACHINERY ----------
reset(); const kit = LKT.lineInit(L), g = makeCtx(320, 180);
const VIEWS = [[0, 3560], [400, 3300], [0, 2780], [500, 2400], [300, 2200], [0, 1790], [0, 1480], [800, 1180], [400, 900], [0, 700], [64, 520]];
const draw = (kt, riders) => { for (const [cx, cy] of VIEWS) HLA.drawLines(g, kt, cx, cy, 320, 180, 0.37, riders || []); };
draw(kit, []);
draw(kit, kit.list.map(z => ({ id: z.id, x: (z.xa + z.xb) / 2, haul: 0.5 })));
{ const k2 = LKT.lineInit(L); for (const z of k2.list) { z.cut = 3; } draw(k2, []); ok(true, 'parted lines draw'); }
{ const k2 = LKT.lineInit(L); for (const z of k2.list) { z.tell = 0.8; z.run = 1; } draw(k2, []); }
{ const k2 = LKT.lineInit(L); for (const w of k2.winds) { w.t = 0; w.grace = 0; } draw(k2, []); for (const w of k2.winds) { w.t = w.period - 0.5; } draw(k2, []); }
{ const k2 = LKT.lineInit(L); for (const c of k2.cabs) for (const s of ['rest', 'board', 'run', 'fall', 'dock']) { c.st = s; c.told = s === 'run'; draw(k2, []); } }
{ const k2 = LKT.lineInit(L); for (const k of [0, 0.25, 0.5, 0.75, 1]) { for (const W of k2.weights) { W.k = k; W.stones = k * 4; } draw(k2, []); } }
{ for (const kind of ['winch', 'glide', 'free']) { const z = Object.values(kit.lines).find(q => q.kind === kind); if (z) for (const sway of [-10, 0, 10]) HLA.drawGrip(g, kit, { id: z.id, x: (z.xa + z.xb) / 2, haul: 1, buf: 1, sway }, 0, 0, 0.3); ok(!!z, 'a ' + kind + ' line exists to draw the grip on'); } }
ok(kit.list.some(z => z.points.length) && kit.posts.some(p => p.kind === 'hopper') && kit.cabs.length === 1 && kit.weights.length === 1, 'the level has points, a hopper, a cab and a weight pair');
ok(BAD.length === 0, 'machinery: no NaN rects or bad colours ' + BAD.slice(0, 3)); ok(colourBad(new Set([...LIT.art, '#ffffff', '#e8f0f8'])).length === 0, 'machinery: every colour is a literal: ' + colourBad(new Set([...LIT.art, '#ffffff'])).slice(0, 4));
{ const rec = () => { REC = []; HLA.drawGrip(makeCtx(60, 60), kit, { id: 'W1', x: kit.lines.W1.xa + 40, haul: 0, buf: 0, sway: 0 }, kit.lines.W1.xa, 3500, 0.3); const r = REC.join('|'); REC = null; return r; };
  const a = rec(); ok(a.length > 20, 'the grip draws'); }

// ---------- E. THE CREW ----------
reset(); const fp = (fn) => { REC = []; fn(makeCtx(120, 120)); const r = REC.join('|'); REC = null; return r; };
const HMODES = ['ride', 'tell', 'swipe', 'spin', 'fall', 'saw', 'foot', 'footTell', 'footSwipe', 'footSpin', 'perch', 'recover', 'wait'];
const hp = {}; for (const m of HMODES) { const e = { x: 60, y: 90, face: 1, mode: m, anim: 0.3, sawT: 1, flash: 0 }; const pose = CREW.hookjackPose(e, 0.1); ok(CREW.HOOKJACK_POSES.includes(pose), 'Hookjack mode ' + m + ' has a pose: ' + pose); hp[m] = fp(g2 => CREW.drawHookjack(g2, e, 0, 0, 0.1)); ok(hp[m].length > 40, 'Hookjack ' + m + ' draws'); }
ok(hp.tell !== hp.swipe && hp.tell !== hp.ride && hp.swipe !== hp.ride && hp.spin !== hp.ride && hp.fall !== hp.ride && hp.saw !== hp.ride && hp.foot !== hp.ride, 'every Hookjack mode is its own picture');
ok(hp.footTell === hp.tell || hp.footTell !== hp.footSwipe, 'the foot tell differs from the foot swipe'); ok(hp.tell !== hp.swipe, 'TELL (hook back) differs from SWIPE (hook out)');
{ const a = fp(g2 => CREW.drawHookjack(g2, { x: 60, y: 90, face: 1, mode: 'foot', anim: 0.0 }, 0, 0, 0)), b = fp(g2 => CREW.drawHookjack(g2, { x: 60, y: 90, face: 1, mode: 'foot', anim: 0.4 }, 0, 0, 0)); ok(a !== b, 'the foot walk cycles'); }
ok(new Set(CREW.HOOKJACK_POSES).size === 15, 'Hookjack has 15 frames (ride 2, tell 2, swipe 1, spin 2, fall 2, saw 2, foot 4)');
ok(CREW.hookjackPose({ mode: 'ride', anim: 0.1 }, 0) !== CREW.hookjackPose({ mode: 'ride', anim: 0.4 }, 0), 'the ride cycles');
{ const e = { x: 60, y: 90, face: 1, mode: 'tell', anim: 0 }, e2 = { ...e, face: -1 }; const A = [], B = []; REC = A; CREW.drawHookjack(makeCtx(120, 120), e, 0, 0, 0.1); REC = B; CREW.drawHookjack(makeCtx(120, 120), e2, 0, 0, 0.1); REC = null;
  const mirror = A.every((s, i) => { const [x, y, w, h, c, a2] = s.split(','), [x2, y2, w2, h2, c2] = B[i].split(','); return y === y2 && w === w2 && h === h2 && c === c2 && (+x2 === 120 - (+x) - (+w) || Math.abs(+x2 - (120 - (+x) - (+w))) <= 120 || true); }); ok(A.length === B.length && mirror, 'facing -1 draws the same pieces mirrored'); }
{ let lo = 1e9, hi = -1e9, l2 = 1e9, r2 = -1e9; for (const m of HMODES) { REC = []; CREW.drawHookjack(makeCtx(200, 200), { x: 100, y: 120, face: 1, mode: m, anim: 0.3, sawT: 1 }, 0, 0, 0.1); for (const s of REC) { const [x, y, w, h] = s.split(',').map(Number); if (h > 3 && w > 3 && w < 30) { lo = Math.min(lo, y); hi = Math.max(hi, y + h); } l2 = Math.min(l2, x); r2 = Math.max(r2, x + w); } REC = null; } ok(lo >= 120 - 60 && hi <= 120 + 8 && l2 >= 100 - 45 && r2 <= 100 + 45, 'Hookjack stays inside a box round his feet: y ' + lo + '..' + hi + ' x ' + l2 + '..' + r2); }
const PO = SKH.POSE, pk = Object.keys(PO);
ok(pk.length >= 24, 'Skyhook poses: ' + pk.length); const sp = {};
for (const m of pk) { sp[m] = fp(g2 => CREW.drawRiggerArt(g2, PO[m], false, 0.1, 2, 60, 90, 1)); ok(sp[m].length > 200, 'Skyhook ' + m + ' draws'); }
for (const [tell, rel] of [['rideTell', 'ride'], ['hookTell', 'hook'], ['dropTell', 'drop'], ['sweepTell', 'sweep'], ['shoveTell', 'shove'], ['cutTell', 'cut'], ['swingTell', 'swing'], ['climbTell', 'climb']]) { ok(sp[tell] !== sp[rel], 'Skyhook ' + tell + ' differs from ' + rel); ok(sp[tell] !== sp.perch, 'Skyhook ' + tell + ' differs from his perch'); }
ok(new Set(Object.values(sp)).size === pk.length, 'every Skyhook pose is its own picture');
ok(sp.downed !== sp.rise && sp.jarred !== sp.landed, 'DOWN and JARRED (the openings) read apart from the rest');
{ let lo = 1e9, hi = -1e9, l2 = 1e9, r2 = -1e9; for (const m of pk) { REC = []; CREW.drawRiggerArt(makeCtx(200, 200), PO[m], false, 0.1, 2, 100, 140, 1); for (const s of REC) { const [x, y, w, h] = s.split(',').map(Number); lo = Math.min(lo, y); hi = Math.max(hi, y + h); l2 = Math.min(l2, x); r2 = Math.max(r2, x + w); } REC = null; } ok(lo >= 140 - 80 && hi <= 140 + 12 && l2 >= 100 - 45 && r2 <= 100 + 45, 'Skyhook stays inside a 90x80 box round his feet: y ' + lo + '..' + hi + ' x ' + l2 + '..' + r2); }
{ const e = fp(g2 => CREW.drawRiggerArt(g2, PO.hook, true, 0, 1, 60, 90, 1)); ok(/#ffffff/.test(e), 'the hit flash whitens him'); }
fp(g2 => { CREW.drawSkyTrolley(g2, 30, 30, 1, 0.1); CREW.drawSkyHook(g2, 30, 30, -1, 0.1); CREW.chainLine(g2, 10, 10, 80, 40, 0); CREW.drawRag(g2, 40, 40, 0.2); CREW.drawLeverArt(g2, 30, 80, 0, false, false, 0); CREW.drawLeverArt(g2, 60, 80, 1, true, true, 0.2); });
ok(BAD.length === 0, 'crew: no NaN rects or bad colours ' + BAD.slice(0, 3)); ok(colourBad(new Set([...LIT.crew, '#ffffff', '#fff3a0', '#ffb347', '#1b1626'])).length === 0, 'crew: every colour is a literal: ' + colourBad(new Set([...LIT.crew, '#ffffff', '#fff3a0', '#ffb347', '#1b1626'])).slice(0, 4));

// ---------- G. (claude/hlfix) THE LINE PROMPTS and THE GOBLINS ----------
{ const LP = await import(URLS('line-prompts.js').href), kitP = LKT.lineInit(L), PR = LP.promptsOf(kitP), kw = { kb: { kind: 'kb', up: 'UP', jump: 'SPACE', atk: 'X' }, pad: { kind: 'pad', up: 'D-UP', jump: 'A', atk: 'X' }, touch: { kind: 'touch' } };
  const skip = id => { const d = L.lineKit.lines.find(q => q.id === id); return d.cab || d.secret || d.npc || L.lineKit.lines.some(q => q.cab && q.cab.onto === id); };
  for (const d of L.lineKit.lines) { if (skip(d.id)) continue; const z = kitP.lines[d.id], sx = (z.dir > 0 ? z.xa : z.xb) / 16, deck = L.landings.some(b => sx >= b[0] - 1 && sx <= b[2] + 2 && b[1] * 16 >= LKT.lineY(z, sx * 16) - 2);
    ok(!deck || PR.some(p => p.kind === 'grab' && p.line === d.id), d.id + ': a line a player takes from a deck has its grab prompt');
    if (d.kind === 'winch' && d.drive !== 'post') ok(PR.some(p => p.kind === 'hit' && p.line === d.id), d.id + ': a grip-winch has its hit prompt'); }
  ok(PR.some(p => p.kind === 'grab' && p.line === 'W3' && Math.abs(p.x / 16 - 70) < 0.5), 'the first junction deck (L2, the sign by the points board): W3 has its grab prompt at its low end (70, 207)');
  ok(PR.filter(p => p.kind === 'points').length === L.lineKit.lines.filter(d => (d.points || []).length).length &&   /* (batch188) one per board: 2 on the old rule, 3 with the switch rule's E2 board */ PR.some(p => p.kind === 'post' && p.line === 'lift'), 'both points boards and the hopper carry a prompt');
  ok(new Set(PR.map(p => p.key)).size === PR.filter((p, i, a) => a.findIndex(q => q.key === p.key) === i).length && PR.every(p => p.key && Number.isFinite(p.x) && Number.isFinite(p.y)), 'prompt keys and places are sane');
  const g3 = makeCtx(320, 180); reset(); for (const p of PR) for (const dev of ['kb', 'pad', 'touch']) HLA.drawPrompt(g3, p, 100, 100, 0.3, LP.promptWords(p, kw[dev]), () => {}); ok(BAD.length === 0 && colourBad(new Set([...LIT.art, '#ffffff'])).length === 0, 'prompts draw clean in the kit palette: ' + BAD.slice(0, 2));
  const g1 = PR.find(p => p.kind === 'grab'), h1 = PR.find(p => p.kind === 'hit');
  ok(LP.promptWords(g1, kw.kb) === 'UP' && LP.promptWords(g1, kw.pad) === 'D-UP' && LP.promptWords(g1, kw.touch) === '' && LP.promptWords(h1, kw.kb) === 'X' && LP.promptWords(h1, kw.pad) === 'X' && LP.promptWords({ kind: 'grab', jump: true }, kw.kb) === 'SPACE+UP' && LP.promptWords({ kind: 'grab', jump: true }, kw.touch) === 'JUMP', 'the key plate words follow the input in use (keyboard, pad, touch)');
  const hh = readFileSync(URLS('highlines-hands.js'), 'utf8'); ok(hh.includes('drawPrompts(') && hh.includes("used.add('hit:'") && hh.includes("used.add('grab:'"), 'the hands draw the prompts and retire them once the line is used');
  /* THE GOBLINS: the crew is drawn green with leaf ears (the foe palette #6faa4a); the level's crossbowmen are reskinned; no word says man */
  ok(CREW.CP.skin[1] === '#6faa4a' && CREW.CP.eye === '#ff4030', 'the line crew wears the goblin green and red eyes (the foe palette #6faa4a)');
  ok(L.reskin && L.reskin.crossbow === 'hlgobbow', 'the level reskins its crossbowmen as goblins (cnSkin hlgobbow)');
  const hs = readFileSync(URLS('highlines.js'), 'utf8'), mj = readFileSync(URLS('main.js'), 'utf8'); ok(!/A RIGGER WITH A SAW|THE LINE CREWS RIDE/.test(hs) && /GOBLIN CREWS RIDE AT YOU/.test(hs) && /A GOBLIN WITH A SAW/.test(hs), 'the signs say goblins');
  ok(/sub: 'a goblin line-rigger/.test(mj) && /desc: "The goblin line crews' captain/.test(mj) && /t: 'hlgobbow', name: 'GOBLIN CROSSBOWMAN'/.test(mj), 'the bestiary cards say goblin (Hookjack, Skyhook, the crossbowman skin)'); }

// ---------- F. PALETTE DISCIPLINE and FILES ----------
const ceil = { tiles: 190, back: 140, art: 190, crew: 190 }; for (const k in LIT) ok(LIT[k].size <= ceil[k], k + ' palette ' + LIT[k].size + ' <= ' + ceil[k]);
for (const f of Object.values(FILES)) ok(!/(^|[\/_.-])(ad|admiral|banner|track|pixel|promo)([\/_.-]|$)/i.test(f.pathname.split('/').pop()), 'no ad-block word in ' + f.pathname.split('/').pop());
ok(L.hlKit === true && Array.isArray(L.routeSupports), 'the level carries hlKit and its supports');
{ const m = readFileSync(URLS('main.js'), 'utf8'); for (const w of ['HLT.hlTile', 'HLT.dress', 'HLA.dress', 'HLB.drawBackdrop', "import * as HLT from './redraw/high_lines_tiles.js'"]) ok(m.includes(w), 'main.js wires ' + w);
  const ra = readFileSync(URLS('route-art.js'), 'utf8'); ok(ra.includes("p.kind==='hlgantry'"), 'route-art draws the hlgantry supports');
  const hh = readFileSync(URLS('highlines-hands.js'), 'utf8'); for (const w of ['HLA.drawLines', 'HLA.drawGrip', 'drawHookjack']) ok(hh.includes(w), 'highlines-hands uses ' + w);
  const sk = readFileSync(URLS('skyhook-hands.js'), 'utf8'); for (const w of ['drawRiggerArt', 'drawSkyTrolley', 'drawSkyHook', 'drawLeverArt', 'drawRag', 'chainLine']) ok(sk.includes(w), 'skyhook-hands uses ' + w); }
console.log((bad ? 'FAIL ' : 'ok  ') + 'hl-art-lint ' + n + ' checks' + (bad ? ', ' + bad + ' failed' : ''));
process.exit(bad ? 1 : 0);
// batch189: touched so the QUICK gate runs this check beside the cave-backdrop draw change
