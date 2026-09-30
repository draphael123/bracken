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

const S = { busy: false, shown: false, job: null, total: 0, doneW: 0, true: 0, disp: 0, label: '', t0: 0, lastYield: 0, force: false, seq: [], hist: [], trace: [], heroes: [], lastTrue: 0, raf: 0, moduleFrac: 0 };
const hasDom = typeof document !== 'undefined';
let cv = null, cg = null, art = null, ag = null;

/* THE HERO'S DANCE: the frame lists of the heroes to draw (K.R.dance for player one, and player two's set in co-op) */
function heroList(sets) { return (sets || []).map(s => s && s.R && s.R.dance && s.R.dance.length ? s.R.dance : null).filter(Boolean); }
export function heroReady(...sets) { S.heroes = heroList(sets); }

function mount() {
  if (!hasDom || cv) return;
  cv = document.createElement('canvas'); cv.id = 'loadscreen';
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:25;image-rendering:pixelated;image-rendering:crisp-edges;background:' + BG + ';display:none;touch-action:none';
  (document.body || document.documentElement).appendChild(cv); cg = cv.getContext('2d');
  art = document.createElement('canvas'); art.width = 320; art.height = 180; ag = art.getContext('2d'); ag.imageSmoothingEnabled = false;
}

/* ---- the picture: 320 x 180, scaled to a whole number of pixels ---- */
function px(x, y, w, h, c) { ag.fillStyle = c; ag.fillRect(x | 0, y | 0, w | 0, h | 0); }
function text(s, x, y, c, size = 8, align = 'left') { ag.font = size + 'px "Press Start 2P", monospace'; ag.textAlign = align; ag.textBaseline = 'top'; ag.fillStyle = INK; ag.fillText(s, x + 1, y + 1); ag.fillStyle = c; ag.fillText(s, x, y); }
/* what to draw before a hero is baked (the first second of a cold boot, while the scripts are still arriving): a small hooded figure that
   hops in time - the simplest frames there are, so the dance is never a blank */
function stand(t, x, gy) {
  const k = Math.floor(t / 130) % 4, up = k === 1 || k === 3 ? 0 : 1, arm = k === 1 ? -3 : k === 3 ? 3 : 0, y = gy - 16 - (k === 2 ? 3 : 0);
  px(x + 3, y, 8, 6, '#c9d1dc'); px(x + 4, y + 2, 6, 2, '#1b1626'); px(x + 2, y + 6, 10, 6, '#3f7fd0'); px(x + 5, y + 6, 4, 6, '#c9463d');
  px(x + 1 + arm, y + 6 + up, 2, 5, '#c9d1dc'); px(x + 11 - arm, y + 6 + up, 2, 5, '#c9d1dc'); px(x + 3, y + 12, 3, 4 + (k === 2 ? 0 : 0), '#3a2a1a'); px(x + 8, y + 12, 3, 4, '#3a2a1a');
}
function drawHero(list, t, x, gy, mirror) {
  const n = list.length, f = list[Math.floor(t / 100) % n];   // ten frames a second, as the game plays it
  if (!f || !f.width) return;
  const sc = f.height <= 34 ? 2 : 1, w = f.width * sc, h = f.height * sc;
  ag.save(); if (mirror) { ag.translate(x + w, 0); ag.scale(-1, 1); ag.drawImage(f, 0, gy - h, w, h); } else ag.drawImage(f, x, gy - h, w, h); ag.restore();
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
  for (let i = 0; i < 40; i++) px(((i * 97 + 13) % 320), ((i * 53 + 7) % 90), 1, 1, i % 5 === 0 ? '#3a4a44' : '#1f2c26');   // a few stars
  text('BRACKEN', 160, 28, GOLD, 16, 'center');
  const gy = 124, bx = 96, bw = 176, bh = 10, by = gy - bh - 2;
  px(0, gy, 320, 56, '#16241c'); px(0, gy, 320, 2, '#2e5a2a'); px(0, gy + 2, 320, 1, '#0e1a12');   // the ground the hero dances on
  // the bar: a dark frame, a track, a fill in blocks with a light top edge, a notch every eighth
  px(bx - 3, by - 3, bw + 6, bh + 6, INK); px(bx - 2, by - 2, bw + 4, bh + 4, '#4a4058'); px(bx - 1, by - 1, bw + 2, bh + 2, '#221c30');
  const fw = Math.round(bw * Math.min(1, S.disp));
  if (fw > 0) { px(bx, by, fw, bh, '#4a8a3a'); px(bx, by, fw, 3, '#8fd160'); px(bx, by + bh - 2, fw, 2, '#2f6a2c'); if (fw > 2) px(bx + fw - 2, by, 2, bh, '#c8f090'); }
  for (let x = 8; x < bw; x += 8) px(bx + x, by, 1, bh, 'rgba(11,20,16,0.55)');
  const pct = Math.min(100, Math.floor(S.disp * 100 + 1e-6));
  text(pct + '%', bx + bw, by + bh + 7, CREAM, 8, 'right');
  text(S.label || 'LOADING', bx, by + bh + 7, DIM, 6, 'left');
  // THE DANCERS: player one to the left of the bar, and in co-op player two to the right of it (his own dance)
  const list = S.heroes;
  if (list.length) { drawHero(list[0], t, 34, gy + 4, false); if (list[1]) drawHero(list[1], t + 130, 320 - 34 - list[1][0].width * (list[1][0].height <= 34 ? 2 : 1), gy + 4, true); }
  else stand(t, 52, gy + 4);
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
