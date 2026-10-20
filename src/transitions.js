/* src/transitions.js - THE LEVEL-TO-LEVEL TRANSITION SYSTEM (claude/transwm; scratch/brief-transition-woodmarsh-1018.md + brief-storytransitions-1016.md PART 2).
   Pure logic, no canvas and no page: main.js runs the timeline and draws it (src/transitions-art.js).
   THE IDEA (Daniel 10-16/10-18): story by progression. A boss falls, THE WAY OPENS (told, never written), the heroes walk out, and the next level
   starts FROM THAT PLACE. One short, SKIPPABLE, DIALOGUE-FREE cutscene system; every pair of levels is one ROW of the table below:
       { from, to, scene, beats: [{ id, dur }...], open: { col, rows }, arrive: { ferry, walk } }
   BEATS (what main.js does for each id):
       open   the way opens in the level you just won (open.col: those tiles go to air in a spill of dust) - the world, letterbox bars sliding in
       walk   every hero is walked (kinematically, so it works for every hero and every seat) to the level's edge: the path out of the arena
       shore  the scene `scene` takes over: the heroes walk onto the jetty and step aboard
       ride   the vehicle carries them (parallax, mist): the last level recedes, the next appears
       fade   to black; the next level then loads and (arrive.ferry) begins with the heroes stepping OFF the same vehicle
   The CLEAR IS CREDITED BEFORE THE CUTSCENE (main.js calls winLevel first, then begins this), so quitting or skipping loses nothing.
   SKIP: any button or tap, once MIN_SKIP seconds in (a hero still mashing attack as the boss falls does not skip it), jumps to a short fade;
   the state after a skip is the state after a full watch (the next level, the arrival) - skipping only drops the pictures.
   WHEN IT PLAYS: policy() below. Until the art pass merges it is behind ?trans=1 (art before live); the Settings row TRANSITIONS (ALWAYS / FIRST TIME /
   NEVER, default FIRST TIME) is honoured inside that. When the art merges, `live` goes true and the flag is no longer needed. */
export const MIN_SKIP = 0.8;
export const FADE_SKIP = 0.3;
export const TABLE = [
  { from: 'wood', to: 'marsh', scene: 'ferry',
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'shore', dur: 3.3 }, { id: 'ride', dur: 7.5 }, { id: 'fade', dur: 0.7 }],
    open: { col: 549, rows: [3, 8], lintel: 2 },        /* OLD TUSKER's clearing: the fence-gate at the east edge (the Wood's last column) gives way - rows 3-8 of col 549 go to air, a lintel stays */
    arrive: { ferry: true, walk: 1.7 } },                /* the Marsh begins with the heroes stepping OFF the ferry, 1.7 s of walk, then control */
];
export const entryFor = (from, to) => TABLE.find(e => e.from === from && (to === undefined || e.to === to)) || null;

/* IS IT PLAYED? flag: ?trans=1 (or BK.trans.force) - plays always, every replay. mode: 'always' | 'first' | 'never' (the settings choice, default 'first').
   `live` is false until the art pass merges: with it false only the flag plays it. */
export const MODES = ['always', 'first', 'never'], MODE_LABEL = { always: 'ALWAYS', first: 'FIRST TIME', never: 'NEVER' };
export const modeOf = m => (MODES.includes(m) ? m : 'first');   /* the settings row's value; anything else (an old save) is the default, FIRST TIME */
export function policy({ off = false, mode = 'first', seen = false } = {}) {
  if (off) return false;   /* ?trans=0 (or BK.trans.force(false)): the tests' off switch. The art is in (claude/transwmart): ON BY DEFAULT, the setting below governs it */
  if (mode === 'never') return false;
  if (mode === 'first') return !seen;
  return true;
}

/* THE TIMELINE: a tiny state machine. t: seconds since it began; i: the beat; pt: seconds in the beat. */
export function start(entry, { reduce = false } = {}) {
  const beats = entry.beats.map(b => ({ ...b }));
  return { entry, beats, i: 0, pt: 0, t: 0, skipped: false, done: false, reduce: !!reduce, log: [beats[0].id] };
}
export const phase = tl => (tl.done ? 'done' : tl.beats[tl.i].id);
export const beatK = tl => (tl.done ? 1 : Math.min(1, tl.pt / (tl.beats[tl.i].dur || 1)));
export const canSkip = tl => !tl.done && !tl.skipped && tl.t >= MIN_SKIP && phase(tl) !== 'fade';
/* press: a button was pressed this frame. ready: the walk beat's own "everyone is at the edge" (it may end early; it cannot run past beat.max). Returns the beats entered this step. */
export function step(tl, dt, { press = false, ready = false } = {}) {
  const entered = [];
  if (tl.done) return entered;
  tl.t += dt;
  if (press && canSkip(tl)) {
    tl.skipped = true; tl.i = tl.beats.findIndex(b => b.id === 'fade'); tl.pt = 0; tl.beats[tl.i] = { ...tl.beats[tl.i], dur: FADE_SKIP };
    tl.log.push('skip'); entered.push('fade'); return entered;
  }
  tl.pt += dt;
  for (;;) {
    const b = tl.beats[tl.i];
    const over = b.id === 'walk' ? (ready && tl.pt >= 0.4) || tl.pt >= (b.max || b.dur) : tl.pt >= b.dur;
    if (!over) break;
    if (tl.i === tl.beats.length - 1) { tl.done = true; tl.log.push('done'); entered.push('done'); break; }
    tl.pt = b.id === 'walk' ? 0 : tl.pt - b.dur; tl.i++; tl.log.push(tl.beats[tl.i].id); entered.push(tl.beats[tl.i].id);
  }
  return entered;
}
/* the total of a full watch (walk at its nominal length) */
export const length = entry => entry.beats.reduce((n, b) => n + b.dur, 0);

/* LETTERBOX BARS (px of each bar, 0..BAR): slide in over the first 0.5 s of the transition, stay through the scenes, slide out over the arrival */
export const BAR = 22;
export const barIn = t => BAR * Math.min(1, Math.max(0, t / 0.5));
export const barOut = (t, dur) => BAR * Math.min(1, Math.max(0, (dur - t) / 0.6));

/* THE WALK: every hero to `target` x (px) at a speed that finishes in about `want` seconds from wherever he is: never slower than WALK_MIN (a hero beside the exit
   still walks), never faster than WALK_MAX (a long way is a run, not a blur). Returns the new x and the speed used. */
export const WALK_MIN = 70, WALK_MAX = 175;
export function walkSpeed(dist, want = 2.2) { return Math.max(WALK_MIN, Math.min(WALK_MAX, dist / want)); }
export function walkStep(x, target, dt, speed) { const d = target - x; if (d <= 0) return { x: target, v: 0, arrived: true }; const s = Math.min(d, speed * dt); return { x: x + s, v: s / dt, arrived: x + s >= target - 0.01 }; }
/* a small hop over the settled gate (a 7 px arc across the two tiles either side of the opened column): the walk's one hop */
export function hopY(x, col, TS) { const c = (col + 0.5) * TS, d = Math.abs(x - c); return d >= TS ? 0 : -Math.round(7 * Math.cos((d / TS) * Math.PI / 2)); }

/* ------------------------------------------------------------- THE FERRY SCENE (scene 'ferry'): the geometry, pure, so a node check can pin it.
   s: seconds since the scene began (the shore beat then the ride beat). One screen, VW wide: the jetty and the bank at the left, the ferry at the jetty's end. */
export const FERRY = { dockAt: 0.5, deckW: 96, boardBy: 2.3, poleAt: 2.7, rideV: 52, rampT: 1.8, parallax: { far: 0.45, mid: 0.8, near: 1.25 } };
/* how far the world has slid left by scene time s: 0 until the ferryman poles off, then a ramp to rideV px/s */
export function sceneScroll(s, reduce = false) {
  const t = s - FERRY.poleAt; if (t <= 0) return 0;
  const v = reduce ? FERRY.rideV * 0.4 : FERRY.rideV, a = v / FERRY.rampT;
  return t < FERRY.rampT ? 0.5 * a * t * t : 0.5 * v * FERRY.rampT + v * (t - FERRY.rampT);
}
/* where hero i of n stands (x relative to the screen, px): they walk in from the left edge over the jetty and stop on the deck, side by side, the last one nearest the bow */
export function heroOnScene(i, n, s, VW) {
  const deck0 = VW * FERRY.dockAt + 16 + i * 13, from = -24 - i * 14, k = Math.min(1, Math.max(0, s / FERRY.boardBy));
  const e = k * k * (3 - 2 * k);
  const x = from + (deck0 - from) * e;
  return { x, aboard: s >= FERRY.boardBy, walking: s < FERRY.boardBy - 0.05, deckX: deck0 };
}
/* the ferry's own x on the screen: it sits at the jetty's end, then the screen follows it (so it stays put and the world slides: its x does not change) */
export const ferryX = VW => VW * FERRY.dockAt;
