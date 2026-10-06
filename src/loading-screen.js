// src/loading-screen.js - THE LOADING SCREEN (claude/loadbar, 2026-09-30). Daniel: "progress bars for loading and a hero do a dance
// at them." A pixel bar with the percentage and a line of what is loading, and the player's own hero dancing beside it (his dance from
// chars.js: K.R.dance, the same frames the H key plays).
//
// THE BAR IS TRUE. Two jobs, each a list of STEPS with a weight (about what the step costs on this machine, measured by tools/
// loading-screen.mjs --times); the bar is the weight of the steps DONE over the weight of them all. Nothing runs on a timer: a step
// finishes when its work has, and the number drawn never runs ahead of that (it only catches up, smoothly, and never goes back).
//   BOOT  - the first load: the scripts fetched, the hero baked, the art baked in slices, the tiles and props, the first level.
//           main.js calls `await LS.step('id')` at slice boundaries (a top-level await lets the page paint between slices).
//   LEVEL - a wood from the map: main.js's loadLevelG is a generator that yields a step id after each stage, and LS.drive runs it.
// A load under 150 ms never shows the screen (the drive runs straight through, exactly as the old synchronous load did), and a
// yield is only made when 40 ms of work is waiting to be shown, so the screen adds a few milliseconds and no flash.
// While it is up it holds the game's input (a key or a click in the middle of a half-built level would be a bug) and LS.busy tells the
// main loop to stand still. Under BK.manualSimulation (every tool) a drive is always synchronous.

const SHOW_AFTER = 150;    // ms: a load quicker than this is never shown
const YIELD_EVERY = 40;    // ms of work between paints once it is up
const BG = '#0b1410', INK = '#1b1626', GOLD = '#ffd36b', CREAM = '#e8dcc0', DIM = '#8a8f80';

/* WHAT EACH STEP WEIGHS (ms on a busy PC, tools/loading-screen.mjs --times). The bar is a share of these, so they only need to be the
   right shape: the steps are never timed against a clock. */
export const JOBS = {
  boot: { modules: 3000, hero: 900, art1: 600, art2: 1600, art3: 400, art4: 450, art5: 430, art6: 200, art7: 800, art8: 750, art9: 300,
    tiles: 3400, props: 1700, sky: 430, misc1: 520, misc2: 1100, misc3: 600, l_build: 350, l_bake: 1400, l_deep: 450, l_rest: 500, final: 20 },
  level: { build: 350, tiles: 140, props: 1050, sky: 190, deep: 450, rest: 500 },
};
const LABEL = {
  modules: 'FETCHING THE SCRIPTS', hero: 'WAKING THE HERO', art1: 'BAKING SPRITES', art2: 'BAKING FOES', art3: 'BAKING FOES', art4: 'BAKING FOES', art5: 'BAKING BOSSES',
  art6: 'BAKING BOSSES', art7: 'BAKING THE SEA FOLK', art8: 'BAKING THE TOWN', art9: 'BAKING THE TOWN', tiles: 'BAKING TILES', props: 'BAKING PROPS', sky: 'PAINTING THE SKY',
  misc1: 'SETTING THE TABLE', misc2: 'SHARPENING SWORDS', misc3: 'LIGHTING LAMPS', build: 'LAYING OUT THE WOOD', deep: 'RAISING THE WOOD', rest: 'PLACING FOES', l_deep: 'RAISING THE WOOD', l_build: 'LAYING OUT THE WOOD',
  l_bake: 'BAKING THE WOOD', l_rest: 'PLACING FOES', final: 'NEARLY THERE',
};

const TIP_MS = 5200, GY = 126;   // how long a line stays up; where the ground is in the 320 x 180 picture
const S = { tipSeed: 0, firstVisit: false, busy: false, shown: false, job: null, total: 0, doneW: 0, true: 0, disp: 0, label: '', t0: 0, lastYield: 0, force: false, seq: [], hist: [], trace: [], heroes: [], lastTrue: 0, raf: 0, moduleFrac: 0 };
const hasDom = typeof document !== 'undefined';
let cv = null, cg = null, art = null, ag = null;

/* THE HERO'S DANCE: the frame lists of the heroes to draw (K.R.dance for player one, and player two's set in co-op), each with where his feet and his
   middle are (read once from the pixels over every frame: the middle of the frames, so he stands on the ground and does not jitter as they change size) */
function metrics(list) {
  const bots = []; let cx = 0, n = 0;
  try { for (const f of list) { const d = f.getContext('2d').getImageData(0, 0, f.width, f.height).data; let lo = -1, x0 = 1e9, x1 = -1;
    for (let y = 0; y < f.height; y++) for (let x = 0; x < f.width; x++) if (d[(y * f.width + x) * 4 + 3] > 40) { lo = y; if (x < x0) x0 = x; if (x > x1) x1 = x; }
    if (lo >= 0) { bots.push(lo + 1); cx += (x0 + x1 + 1) / 2; n++; } } } catch { /* a tainted or odd canvas: draw from the frame's own edge */ }
  bots.sort((a, b) => b - a);   // his feet are where MOST frames have them (the median): a bow or a raised blade that reaches lower must not lift him off the ground
  return { list, bottom: bots.length ? bots[bots.length >> 1] : list[0].height, cx: n ? cx / n : list[0].width / 2 };
}
export function heroReady(...sets) { S.heroes = (sets || []).map(s => s && s.R && s.R.dance && s.R.dance.length ? metrics(s.R.dance) : null).filter(Boolean); }

function mount() {
  if (!hasDom || cv) return;
  cv = document.createElement('canvas'); cv.id = 'loadscreen';
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:25;image-rendering:pixelated;image-rendering:crisp-edges;background:' + BG + ';display:none;touch-action:none';
  (document.body || document.documentElement).appendChild(cv); cg = cv.getContext('2d');
  art = document.createElement('canvas'); art.width = 320; art.height = 180; ag = art.getContext('2d'); ag.imageSmoothingEnabled = false;
}

/* ---- the picture: 320 x 180, scaled to a whole number of pixels ---- */
function px(x, y, w, h, c) { ag.fillStyle = c; ag.fillRect(x | 0, y | 0, w | 0, h | 0); }
/* a 3 x 5 pixel font, capitals and digits: it is drawn by hand so the bar reads the same whether or not the game's web font has arrived */
const GLYPH = {
  '0': '###/#.#/#.#/#.#/###',
  '1': '.#./##./.#./.#./###',
  '2': '##./..#/.#./#../###',
  '3': '##./..#/.#./..#/##.',
  '4': '#.#/#.#/###/..#/..#',
  '5': '###/#../##./..#/##.',
  '6': '.##/#../###/#.#/###',
  '7': '###/..#/.#./.#./.#.',
  '8': '###/#.#/###/#.#/###',
  '9': '###/#.#/###/..#/##.',
  'A': '.#./#.#/###/#.#/#.#',
  'B': '##./#.#/##./#.#/##.',
  'C': '.##/#../#../#../.##',
  'D': '##./#.#/#.#/#.#/##.',
  'E': '###/#../##./#../###',
  'F': '###/#../##./#../#..',
  'G': '.##/#../#.#/#.#/.##',
  'H': '#.#/#.#/###/#.#/#.#',
  'I': '###/.#./.#./.#./###',
  'J': '..#/..#/..#/#.#/.#.',
  'K': '#.#/#.#/##./#.#/#.#',
  'L': '#../#../#../#../###',
  'M': '#.#/###/###/#.#/#.#',
  'N': '##./#.#/#.#/#.#/#.#',
  'O': '.#./#.#/#.#/#.#/.#.',
  'P': '##./#.#/##./#../#..',
  'Q': '.#./#.#/#.#/###/.##',
  'R': '##./#.#/##./#.#/#.#',
  'S': '.##/#../.#./..#/##.',
  'T': '###/.#./.#./.#./.#.',
  'U': '#.#/#.#/#.#/#.#/###',
  'V': '#.#/#.#/#.#/#.#/.#.',
  'W': '#.#/#.#/###/###/#.#',
  'X': '#.#/#.#/.#./#.#/#.#',
  'Y': '#.#/#.#/.#./.#./.#.',
  'Z': '###/..#/.#./#../###',
  '%': '#.#/..#/.#./#../#.#',
  '.': '.../.../.../.../.#.',
  '-': '.../.../###/.../...',
  ',': '.../.../.../.#./#..',
  "'": '.#./.#./.../.../...',
  '!': '.#./.#./.#./.../.#.',
  '?': '##./..#/.#./.../.#.',
  ':': '.../.#./.../.#./...',
  '+': '.../.#./###/.#./...' };
function text(s, x, y, c, sc = 1, align = 'left') {
  s = String(s).toUpperCase(); const w = s.length * 4 * sc - sc; if (align === 'center') x -= Math.floor(w / 2); else if (align === 'right') x -= w;
  for (const pass of [0, 1]) for (let k = 0; k < s.length; k++) { const g = GLYPH[s[k]]; if (!g) continue; const rows = g.split('/');
    for (let i = 0; i < 15; i++) if (rows[Math.floor(i / 3)][i % 3] === '#') { const gx = x + k * 4 * sc + (i % 3) * sc, gy = y + Math.floor(i / 3) * sc; if (pass === 0) px(gx + Math.max(1, sc >> 1), gy + Math.max(1, sc >> 1), sc, sc, INK); else px(gx, gy, sc, sc, c); } }
}
/* WHAT IS SAID WHILE YOU WAIT: the game's own rules in a line each (TIP), and the wood's. Every TIP is true of this build; edit them with the rules. */
export const TIPS = [
  'TIP: A YELLOW MARK MEANS THE SHIELD TURNS THE BLOW. A RED MARK MEANS ONLY A DODGE DOES.',
  'TIP: A PERFECT TURN OF THE SHIELD OPENS A FOE UP FOR A MOMENT. HIT HIM THEN.',
  'TIP: DIE CARRYING GOLD AND IT DROPS WHERE YOU FELL. GET IT BACK BEFORE YOU DIE AGAIN.',
  'TIP: A SHRINE BANKS EVERYTHING YOU CARRY. LIGHT ONE BEFORE YOU PUSH ON.',
  'TIP: EVERY WOOD HIDES THREE SILVER. THE STORE SELLS THE REST OF THE HEROES FOR IT.',
  'TIP: HOLD THE ATTACK KEY FOR THE HEAVY CUT. IT COSTS STAMINA AND IT MEANS IT.',
  'TIP: THE DESERT SUN HURTS. STAND IN SHADE AND DRINK FROM YOUR SKIN.',
  'TIP: A BOSS BARELY FEELS A BLOW OUTSIDE HIS OPENINGS. WAIT FOR THE OPENING.',
  'TIP: THE MAP SHOWS EACH WOOD\'S MEDAL TIMES. BEAT THEM FOR GOLD FROM THE PURSE.',
  'A KNIGHT, A WOOD, A MOUNTAIN.',
  'THE BRACKEN HAS GROWN OVER THE OLD ROAD.',
  'SOMEONE LEFT THE FIRE LIT. NOBODY WILL SAY WHO.',
];
/* a line cut into rows of at most n letters, on spaces (the 3 x 5 pixel font is 4 dots a letter: 74 letters is 296 of the picture's 320) */
function wrapGlyph(s, n) { s = String(s); if (s.length > n) n = Math.min(n, Math.ceil(s.length / Math.ceil(s.length / n)) + 5);   /* (two even rows, not one full row and a stub) */ const out = []; let cur = ''; for (const w of String(s).split(' ')) { if (cur && (cur + ' ' + w).length > n) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; }
/* THE SCENE: the knight by a campfire, under the bracken, with the mountain behind. Everything is a few rectangles; it moves on the clock. */
function frond(x, base, h, ph, t, col, tip, flip) {
  const sway = Math.sin(t / 900 + ph) * (1 + h * 0.035), steps = Math.max(6, h >> 2), dir = flip ? -1 : 1;
  for (let k = 0; k <= steps; k++) { const u = k / steps, yy = base - h * u, xx = x + dir * (sway * u * u + u * u * h * 0.34), c = u > 0.55 ? tip : col;
    px(xx, yy, 2, 3, c);
    if (k >= 2) { const len = Math.max(1, Math.round((1 - u) * 7 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 1));
      px(xx - len, yy + 1, len, 1, c); px(xx + 2, yy + 1, len, 1, c); px(xx - len - 1, yy + 2, 1, 1, c); px(xx + len + 2, yy + 2, 1, 1, c); } }
}
function scene(t) {
  for (let i = 0; i < 46; i++) px(((i * 97 + 13) % 320), ((i * 53 + 7) % 80), 1, 1, (i % 5 === 0 ? (Math.floor(t / 400 + i) % 6 === 0 ? '#6a7a74' : '#3a4a44') : '#1f2c26'));   // stars, a few of them twinkling
  px(268, 18, 6, 6, '#c9c4a8'); px(269, 17, 4, 8, '#c9c4a8'); px(267, 19, 8, 4, '#c9c4a8'); px(271, 19, 4, 4, BG);   // a thin moon
  // THE MOUNTAIN behind the wood, with the light on top of it
  for (let y = 40; y < GY; y++) { const hw = Math.round((y - 40) * 0.95 + ((y * 7) % 5 === 0 ? 2 : 0)); px(238 - hw, y, hw * 2, 1, y < 56 ? '#1c2a30' : '#142026'); }
  if (Math.floor(t / 600) % 5 !== 0) px(237, 37, 3, 3, '#ffd36b'); px(236, 38, 5, 1, 'rgba(255,211,107,0.5)'); px(238, 36, 1, 5, 'rgba(255,211,107,0.5)');
  px(0, GY, 320, 54, '#16241c'); px(0, GY, 320, 2, '#2e5a2a'); px(0, GY + 2, 320, 1, '#0e1a12');   // the ground
  // the back row of bracken, dark, then the fire
  for (let i = 0; i < 22; i++) frond(((i * 53 + 11) % 330) - 6, GY + 1, 22 + (i * 17) % 22, i * 1.3, t, '#0e1f14', '#183024', i % 2 === 1);
  // THE FIRE: its glow on the ground, logs, three flames, sparks, a thread of smoke
  const fx = 156, fl = Math.floor(t / 110) % 3;
  for (const [r, a] of [[46, 0.05], [32, 0.07], [20, 0.09]]) { ag.globalAlpha = a + (fl === 1 ? 0.015 : 0); ag.fillStyle = '#ff9a5c'; ag.beginPath(); ag.ellipse(fx, GY - 8, r, r * 0.62, 0, 0, 7); ag.fill(); } ag.globalAlpha = 1;
  px(fx - 9, GY - 3, 18, 3, '#3a2214'); px(fx - 8, GY - 3, 16, 1, '#6a4626'); px(fx - 6, GY - 5, 12, 2, '#4a2c18');
  px(fx - 5, GY - 13 - (fl === 1 ? 1 : 0), 10, 9, '#d9642a'); px(fx - 3, GY - 17 - fl, 6, 7, '#ff9a5c'); px(fx - 1, GY - 20 - (fl === 2 ? 2 : fl), 3, 6, '#ffd36b'); px(fx - 2, GY - 9, 4, 5, '#fff6c8');
  for (let i = 0; i < 6; i++) { const ph = ((t / 1100) + i / 6) % 1, sx = fx + Math.sin(i * 3.1 + t / 600) * 5 * ph + (i % 3 - 1) * 2, sy = GY - 20 - ph * 34; ag.globalAlpha = 1 - ph; px(sx, sy, 1, 1, ph < 0.4 ? '#ffd36b' : '#ff9a5c'); } ag.globalAlpha = 1;
  for (let i = 0; i < 7; i++) { const ph = ((t / 3800) + i / 7) % 1; ag.globalAlpha = (1 - ph) * 0.18; px(fx + Math.sin(i * 2.1 + t / 900 + ph * 3) * (3 + ph * 11), GY - 24 - ph * 52, 2 + ph * 3, 2 + ph * 2, '#8a8a84'); } ag.globalAlpha = 1;
}
function foreground(t) {
  // the near fronds at the edges, dark, in front of him: a little of the wood closing over the picture
  for (let i = 0; i < 7; i++) frond(2 + i * 9, GY + 8, 54 + (i * 13) % 26, i * 1.9 + 1, t, '#0a140d', '#122216', false);
  for (let i = 0; i < 7; i++) frond(318 - i * 9, GY + 8, 50 + (i * 11) % 28, i * 1.7, t, '#0a140d', '#122216', true);
}
function stand(t, x, gy) {
  const k = Math.floor(t / 130) % 4, up = k === 1 || k === 3 ? 0 : 1, arm = k === 1 ? -3 : k === 3 ? 3 : 0, y = gy - 16 - (k === 2 ? 3 : 0);
  px(x + 3, y, 8, 6, '#c9d1dc'); px(x + 4, y + 2, 6, 2, '#1b1626'); px(x + 2, y + 6, 10, 6, '#3f7fd0'); px(x + 5, y + 6, 4, 6, '#c9463d');
  px(x + 1 + arm, y + 6 + up, 2, 5, '#c9d1dc'); px(x + 11 - arm, y + 6 + up, 2, 5, '#c9d1dc'); px(x + 3, y + 12, 3, 4 + (k === 2 ? 0 : 0), '#3a2a1a'); px(x + 8, y + 12, 3, 4, '#3a2a1a');
}
function drawHero(h, t, cx, gy, mirror) {
  const n = h.list.length, f = h.list[Math.floor(t / 100) % n];   // ten frames a second, as the game plays it
  if (!f || !f.width) return;
  const sc = 2, w = f.width * sc, hh = f.height * sc, mid = h.cx * sc, top = gy - h.bottom * sc;
  ag.save();
  if (mirror) { ag.translate(cx + mid, 0); ag.scale(-1, 1); ag.drawImage(f, 0, top, w, hh); } else ag.drawImage(f, Math.round(cx - mid), top, w, hh);
  ag.restore();
}
function paint(now) {
  if (!cv || !S.shown) return;
  const cw = innerWidth || 1280, ch = innerHeight || 720, dpr = Math.max(1, Math.min(3, devicePixelRatio || 1));
  if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) { cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
  const t = now === undefined ? performance.now() : now;
  // the number on show follows the true one and never passes it: 4% of the gap a frame, and at least a pixel of bar
  const dt = Math.min(250, Math.max(0, t - (S.tPaint || t))); S.tPaint = t;   // by the clock, so a slow load (a paint every 90 ms) catches up as fast as a free one (a paint every 16)
  const gap = S.true - S.disp; S.disp = gap <= 0 ? S.true : Math.min(S.true, S.disp + Math.max(gap * (1 - Math.exp(-dt / 70)), 0.004));
  if (S.hist.length < 4000 && (!S.hist.length || S.hist[S.hist.length - 1] !== S.disp)) S.hist.push(S.disp);
  ag.clearRect(0, 0, 320, 180); px(0, 0, 320, 180, BG);
  scene(t);
  text('BRACKEN', 160, 12, GOLD, 5, 'center');
  // the bar: a dark frame, a track, a fill in blocks with a light top edge, a notch every eighth
  const bx = 64, bw = 192, bh = 8, by = 144;
  px(bx - 3, by - 3, bw + 6, bh + 6, INK); px(bx - 2, by - 2, bw + 4, bh + 4, '#4a4058'); px(bx - 1, by - 1, bw + 2, bh + 2, '#221c30');
  const fw = Math.round(bw * Math.min(1, S.disp));
  if (fw > 0) { px(bx, by, fw, bh, '#4a8a3a'); px(bx, by, fw, 3, '#8fd160'); px(bx, by + bh - 2, fw, 2, '#2f6a2c'); if (fw > 2) px(bx + fw - 2, by, 2, bh, '#c8f090'); }
  for (let x = 8; x < bw; x += 8) px(bx + x, by, 1, bh, 'rgba(11,20,16,0.55)');
  // WHAT IS HAPPENING, in letters you can read (two dots a pixel), and the number beside it
  const pct = Math.min(100, Math.floor(S.disp * 100 + 1e-6));
  text(S.label || 'LOADING', bx, by - 14, '#c9b892', 2, 'left');
  text(pct + '%', bx + bw, by - 14, CREAM, 2, 'right');
  // A TIP OR A LINE OF THE WOOD'S OWN, changing every few seconds (picked off the clock, so a still is repeatable)
  { const line = TIPS[(Math.floor(t / TIP_MS) + S.tipSeed) % TIPS.length], ph = (t % TIP_MS) / TIP_MS, al = ph < 0.08 ? ph / 0.08 : ph > 0.92 ? (1 - ph) / 0.08 : 1;
    ag.globalAlpha = Math.max(0, Math.min(1, al));
    wrapGlyph(line, 74).forEach((r, i) => text(r, 160, 159 + i * 7, line.startsWith('TIP') ? GOLD : CREAM, 1, 'center')); ag.globalAlpha = 1; }
  if (S.job === 'boot' && S.firstVisit) text('FIRST VISIT: EVERYTHING IS FETCHED FRESH. NEXT TIME IS QUICKER.', 160, 174, DIM, 1, 'center');
  // THE DANCERS: player one by the fire, and in co-op player two across it (his own dance)
  const list = S.heroes;
  if (list.length) { drawHero(list[0], t, 112, GY + 2, false); if (list[1]) drawHero(list[1], t + 130, 200, GY + 2, true); }
  else stand(t, 104, GY + 2);
  foreground(t);
  cg.imageSmoothingEnabled = false;
  const sc = Math.max(1, Math.floor(Math.min(cv.width / 320, cv.height / 180))), ox = Math.floor((cv.width - 320 * sc) / 2), oy = Math.floor((cv.height - 180 * sc) / 2);
  cg.fillStyle = BG; cg.fillRect(0, 0, cv.width, cv.height); cg.drawImage(art, 0, 0, 320, 180, ox, oy, 320 * sc, 180 * sc);
}
function loop(now) { S.raf = 0; if (!S.shown) return; paint(now); S.raf = requestAnimationFrame(loop); }
function show() {
  if (S.shown || !hasDom) return; mount(); if (!cv) return;
  S.shown = true; cv.style.display = 'block'; paint(); if (!S.raf) S.raf = requestAnimationFrame(loop);
}
function hide() {
  S.shown = false; if (cv) cv.style.display = 'none'; if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
}

/* ---- input held while it is up: a key or a click in the middle of a half-built level, or a boot half done, is not a thing to answer ----
   The listeners are put on the window at LOAD, in the capture phase, so they run before any the game adds (listeners of one kind run in the order
   they were added), and they answer only while a hold is on. */
const HELD = ['keydown', 'keypress', 'pointerdown', 'mousedown', 'touchstart', 'click', 'contextmenu', 'dblclick'];
const HELD_BOOT = HELD.concat(['keyup', 'pointerup', 'mouseup', 'touchend']);
let eating = null;
const eat = e => { if (!eating || !eating.includes(e.type)) return; e.stopImmediatePropagation(); if (e.cancelable && e.type !== 'keydown') e.preventDefault(); };
if (hasDom) for (const t of HELD_BOOT) addEventListener(t, eat, { capture: true, passive: false });
function hold(list) { eating = list; }
function release() { eating = null; }

function begin(name, forceShow) {
  S.job = name; S.total = Object.values(JOBS[name]).reduce((a, b) => a + b, 0); S.doneW = 0; S.true = 0; S.disp = 0; S.label = '';
  S.hist = []; S.trace = []; S.t0 = performance.now(); S.lastYield = S.t0; S.tPaint = 0; S.seen = new Set(); S.busy = true; S.force = !!forceShow;
}
function note(id) {
  const now = performance.now(), w = JOBS[S.job][id];
  S.trace.push([id, Math.round(now - (S.trace.length ? S.tLast : S.t0))]); S.tLast = now;
  if (w && !S.seen.has(id)) { S.seen.add(id); S.doneW += w; }
  S.true = Math.max(S.true, Math.min(1, S.doneW / S.total)); S.lastTrue = S.true;
  const next = Object.keys(JOBS[S.job]).find(k => !S.seen.has(k)); S.label = LABEL[next] || S.label;
}
function finish() {
  const reached = S.lastTrue;   // how true the bar was when the last step reported: 1 only if every step ran (never forced)
  S.true = 1; S.disp = 1; if (S.shown) paint();
  S.stats = { job: S.job, ms: Math.round(performance.now() - S.t0), shown: S.shown, reached, trace: S.trace.slice(), hist: S.hist.slice(), heroes: S.heroes.length };
  hide(); release(); S.busy = false; S.job = null; S.done = (S.done || 0) + 1;
}
const later = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });

/* THE BOOT. begin at module load (index.html loads this file first, so the bar is on the glass before the game's own scripts have
   arrived); the fetch step is driven by how many of the page's scripts have come in, measured against the count the last boot saw. */
let bootOn = false;
function bootProgress() {
  if (!bootOn || S.seen.has('modules')) return;
  let n = 0; try { n = performance.getEntriesByType('resource').filter(r => /\.js(\?|$)/.test(r.name) && r.responseEnd > 0).length; } catch {}
  let want = 190; try { want = +localStorage.getItem('bracken.bootmods') || want; } catch {}
  const f = Math.min(0.98, n / want); S.moduleFrac = Math.max(S.moduleFrac, f);
  S.true = Math.max(S.true, Math.min(1, (S.doneW + f * JOBS.boot.modules) / S.total));
}
export function bootStart() {
  if (bootOn || !hasDom) return; bootOn = true; begin('boot', true); hold(HELD_BOOT);
  try { S.firstVisit = !localStorage.getItem('bracken.bootmods'); } catch { /* no storage: say nothing about a first visit */ }
  S.tipSeed = Math.floor(Math.random() * TIPS.length);
  const go = () => { show(); };
  if (document.body) go(); else addEventListener('DOMContentLoaded', go, { once: true });
  const poll = () => { if (!bootOn) return; bootProgress(); setTimeout(poll, 60); }; poll();
  // an app that never finishes booting must not keep the game's input: after a minute the screen lets go
  setTimeout(() => { if (bootOn && S.job === 'boot') { hide(); release(); } }, 60000);
}
async function step(id) {
  if (!bootOn) return;
  if (id === 'modules') { try { const n = performance.getEntriesByType('resource').filter(r => /\.js(\?|$)/.test(r.name)).length; if (n > 20) localStorage.setItem('bracken.bootmods', String(n)); } catch {} }
  note(id); const now = performance.now();
  if (now - S.lastYield >= YIELD_EVERY) { paint(); await later(); S.lastYield = performance.now(); }
}
export function bootDone() { if (!bootOn) return; bootOn = false; if (S.job === 'boot') finish(); }

/* A LEVEL. drive(gen, cont): run a generator that yields step ids; call cont when it is through. Synchronous while fast; if it is still
   going at 150 ms the screen goes up and it carries on a step at a time, yielding to paint. Returns a promise (resolved at once when it
   never went async) so a top-level await can wait on it. */
function drive(gen, cont, opts = {}) {
  const manual = typeof window !== 'undefined' && window.BK && window.BK.manualSimulation, sync = manual || opts.sync || !hasDom || window.__noLoadScreen;
  if (opts.heroes) heroReady(...opts.heroes);
  const boot = bootOn && S.job === 'boot';   // the first level is part of the boot: its steps count in the boot bar, and it never ends the bar
  if (!boot) begin('level', false);
  const RENAME = { build: 'l_build', tiles: 'l_bake', props: 'l_bake', sky: 'l_bake', deep: 'l_deep', rest: 'l_rest' };
  const tick = r => note(boot ? RENAME[r.value] || r.value : r.value);
  let r;
  for (;;) {
    r = gen.next(); if (r.done) break;
    tick(r);
    if (boot ? performance.now() - S.lastYield >= YIELD_EVERY : !sync && !S.shown && performance.now() - S.t0 >= SHOW_AFTER) return more();
  }
  if (!boot) finish(); if (cont) cont(r.value); return Promise.resolve();
  async function more() {   // it is slow: carry on a step at a time, painting between
    if (!boot) { hold(HELD); show(); }
    paint(); await later(); S.lastYield = performance.now();
    for (;;) {
      r = gen.next(); if (r.done) break;
      tick(r);
      if (performance.now() - S.lastYield >= YIELD_EVERY) { paint(); await later(); S.lastYield = performance.now(); }
    }
    if (!boot) finish(); if (cont) cont(r.value);
  }
}

export const LS = { step, drive, heroReady, bootStart, bootDone, get busy() { return S.busy && (S.shown || bootOn); }, get state() { return S; }, JOBS };
if (hasDom) { window.BKLoad = LS; bootStart(); }
