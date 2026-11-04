/* src/transitions.js - THE LEVEL-TO-LEVEL TRANSITION SYSTEM (claude/transwm; scratch/brief-transition-woodmarsh-1018.md + brief-storytransitions-1016.md PART 2).
   Pure logic, no canvas and no page: main.js runs the timeline and draws it (src/transitions-art.js).
   THE IDEA (Daniel 10-16/10-18): story by progression. A boss falls, THE WAY OPENS (told, never written), the heroes walk out, and the next level
   starts FROM THAT PLACE. One short, SKIPPABLE, DIALOGUE-FREE cutscene system; every pair of levels is one ROW of the table below:
       { from, to, scene, beats: [{ id, dur }...], open: { col, rows }, arrive: { ferry, walk } }
   BEATS (what main.js does for each id):
       open   the way opens in the level you just won (open.col: those tiles go to air in a spill of dust) - the world, letterbox bars sliding in
       walk   every hero is walked (kinematically, so it works for every hero and every seat) to the level's edge: the path out of the arena
       shore  (only when `scene` is set) the scene takes over: the heroes walk onto the jetty and step aboard
       ride   (only when `scene` is set) the vehicle carries them (parallax, mist): the last level recedes, the next appears
       fade   to black; the next level then loads and (arrive.ferry) begins with the heroes stepping OFF the same vehicle
   The CLEAR IS CREDITED BEFORE THE CUTSCENE (main.js calls winLevel first, then begins this), so quitting or skipping loses nothing.
   SKIP: any button or tap, once MIN_SKIP seconds in (a hero still mashing attack as the boss falls does not skip it), jumps to a short fade;
   the state after a skip is the state after a full watch (the next level, the arrival) - skipping only drops the pictures.
   WHEN IT PLAYS: policy() below. ON BY DEFAULT since the art pass (claude/transwmart; ?trans=0 is the off switch); the Settings row TRANSITIONS (ALWAYS / FIRST TIME /
   NEVER, default FIRST TIME) is honoured inside that. The flag gate is gone. */
export const MIN_SKIP = 0.8;
export const FADE_SKIP = 0.3;
export const TABLE = [
  /* (claude/demotransitions, Daniel 11-02) EVERY CONNECTED DEMO LEVEL HAS A ROW. Kinds of row:
       WALK-OUT   scene null: [open,] walk, fade. The boss falls, the way out opens (a gate / wall in the arena's last column, OUTSIDE the fight - tiles go to air AFTER the kill, no fairness change; open.kind picks the
                  gate's look, 'light' = no wall to open, only the spill of light beyond), the party walks out, fade, the next level ARRIVES from the left (arrive.walk).
       GATE-END   a level that ends at an exit gate (L.gateAfterBoss: Hornet's Nest, Fen Road, Rootway) starts its row when the party walks INTO the gate: no open beat, the gate is the way.
       SCENE      on top of the walk: 'ferry' (Hornet's Nest -> Marsh: the jetty, the ferryman), 'road' (Fen Road -> Stockade: the laid road to the walls), 'smoke' (Kingswood -> Burning Village:
                  Gorm falls, smoke on the horizon). Scene beats carry sc: true (the ferry's are shore + ride). when: the row plays only if PROG has those flags (entryFor's ctx).
     walk.to: the column the party walks to (default: the level's last column + 1 tile). */
  { from: 'wood', to: 'hornetsnest', scene: null,   /* (claude/hornetsnest2) THE LUMBER TRAIL -> THE HORNET'S NEST: a WALK-OUT, no ferry */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 549, rows: [3, 8], lintel: 2 },        /* OLD TUSKER's clearing: the fence-gate at the east edge (the Wood's last column) gives way - rows 3-8 of col 549 go to air, a lintel stays */
    arrive: { ferry: false, walk: 1.2 } },               /* the nest begins in the old pines: the heroes walk in from the left for 1.2 s, then control (no ferry to step off) */
  { from: 'hornetsnest', to: 'marsh', scene: 'ferry', bank: 'nest',   /* THE HORNET'S NEST -> MARSH WOOD: the nest's gate at the marsh edge, then the FERRY (the old wood -> marsh scene, back where the road really crosses) */
    beats: [{ id: 'walk', dur: 1.4, max: 2.4 }, { id: 'shore', dur: 3.3, sc: true }, { id: 'ride', dur: 7.5, sc: true }, { id: 'fade', dur: 0.7 }],
    arrive: { ferry: true, walk: 1.7 } },
  { from: 'marsh', to: 'fenroad', scene: null,        /* THE FROG falls: the bog-oak palisade at the marsh's east edge (cols 781-782, the two last) gives way onto the Fen Road's causeway */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 781, w: 2, rows: [12, 17], kind: 'bog' }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'fenroad', to: 'stockade', scene: 'road',  /* THE BOG TROLL's gate, then THE LAID ROAD: the boardwalk runs on to the stockade's walls on the skyline */
    beats: [{ id: 'walk', dur: 1.2, max: 2.2 }, { id: 'road', dur: 8.2, sc: true }, { id: 'fade', dur: 0.8 }],
    arrive: { ferry: false, walk: 1.5 } },
  { from: 'stockade', to: 'spore', scene: null,       /* THE CHIEFTAIN falls and the hall BURNS: the party climbs the rafters to the escape gate (a gate end, col 596) - through it, out of the burning camp and down into the fungus */
    beats: [{ id: 'walk', dur: 1.5, max: 2.4 }, { id: 'fade', dur: 0.8 }],
    walk: { to: 600 }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'spore', to: 'rootway', scene: null,        /* THE MOTHER falls: the knot opens on the root-way (no wall: light) */
    beats: [{ id: 'open', dur: 1.3 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 470, rows: [9, 14], kind: 'light' }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'rootway', to: 'underleaf', scene: null,    /* THE HUNTMASTER's gate (gate end): through it, out of the roots into the leaf village */
    beats: [{ id: 'walk', dur: 1.6, max: 3.0 }, { id: 'fade', dur: 0.7 }], arrive: { ferry: false, walk: 1.3 } },
  { from: 'underleaf', to: 'palisadewood', scene: null,   /* THE GRANDMOTHER's hedge-gate (col 563) parts */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 563, rows: [24, 29], kind: 'leaf' }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'palisadewood', to: 'kings', scene: null,   /* THE BATTERING BEAST is down: the goblins' own wall (col 502) is breached - the road through it runs on to the king's wood */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 502, rows: [19, 24], kind: 'palisade' }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'kings', to: 'burning', scene: 'smoke', when: { burningOpen: true },   /* KING GORM falls (a clean fight: the spur is OPEN): the court road, and SMOKE on the horizon - the village is burning */
    beats: [{ id: 'walk', dur: 1.6, max: 2.8 }, { id: 'smoke', dur: 8.0, sc: true }, { id: 'fade', dur: 0.8 }],
    walk: { to: 478 }, endOnMap: true, arrive: null },   /* (Daniel 11-02 17:53) NOT auto-loaded: after the smoke the party ends on the WORLD MAP with the spur node lit (the player chooses to go) */
  { from: 'kings', to: 'scree', scene: null, when: { burningOpen: false },   /* GORM fell the party in a life (the spur stays shut): the plain walk-out onto the road to the Scree Path (beyond the demo) */
    beats: [{ id: 'walk', dur: 2.0, max: 3.0 }, { id: 'fade', dur: 0.7 }], walk: { to: 478 }, arrive: { ferry: false, walk: 1.3 } },

  /* ============================================================ ACT II: THE CRAGS - the MAIN ROAD (claude/act2tr; scratch/brief-act2transitions-1104.md, Daniel APPROVED 11-04). Side paths (Burning Village, The War Cairn) have NO rows.
     LANE A = rows 1-6 below (scree > hanging ... skyroad > oreroad). LANE B appends rows 7-11 (oreroad > minecart ... kitchengate > crown) + the S1/S2 scenes, LANE C row 12 (crown > longwater, S3), here, IN ROAD ORDER, and adds its
     letter to ACT2_BUILT in tools/demo-transitions.mjs (until then that check reports the row as pending, after it a missing row is RED). Open kinds new in lane A (drawn by TRA.drawWayGate, greybox-plus: recoloured rails, lane C draws real ones):
       cairn / ledge  BARE kinds (BARE_KINDS: no wall in the arena to open - the level just runs on; main.js throws dust + light, and an open.fill bridges a pit)    rope = a rope-bridge gate    bell = the monastery's great doors    crumble = stone that falls */
  { from: 'scree', to: 'hanging', scene: null,        /* 1. THE RAM LORD falls: the goat track runs on east over the open scree (no wall in the arena): two cairns rise out of the dust at col 634 and the party walks on to the cliff gate */
    beats: [{ id: 'open', dur: 1.4 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 634, rows: [3, 8], kind: 'cairn' }, walk: { to: 640 }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'hanging', to: 'spire', scene: null,       /* 2. THE OWL REEVE falls: the village's last hoist-rope gate (col 109, the east end) lets go and a rope way runs on up the cliff */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 109, rows: [14, 19], kind: 'rope' }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'spire', to: 'moor', scene: null,          /* 3. THE FALSE ABBOT falls: the hall's great doors (col 95) swing out onto the high moor. Built against TODAY's arena - MONASTERY 3 (11-16) re-points this one row (col/rows) and its test */
    beats: [{ id: 'open', dur: 1.6 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 95, rows: [24, 29], kind: 'bell' }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'moor', to: 'rookery', scene: null,        /* 4. THE WINDCALLER falls: the wind drops (no wall: the summit's far lip) and a stone ledge path shows - open.fill closes the 3-tile pit at cols 739-741 so the walk has a floor */
    beats: [{ id: 'open', dur: 1.4 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 751, rows: [8, 12], kind: 'ledge', fill: { col: 739, w: 3, rows: [13, 15] } }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'rookery', to: 'skyroad', scene: null,     /* 5. THE SHRIEK SISTERS fall: the eyrie's last wall (col 487) crumbles to a ledge */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 487, rows: [5, 10], kind: 'crumble' }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'skyroad', to: 'oreroad', scene: null,     /* 6. THE ROC falls (GATE-END, L.gateAfterBoss: the gate at col 456 is walked INTO - no open beat): through it, out of the sky and down into the Ore Road's drum-house yard */
    beats: [{ id: 'walk', dur: 1.6, max: 3.0 }, { id: 'fade', dur: 0.7 }], arrive: { ferry: false, walk: 1.3 } },
];
/* open kinds with NO wall in the arena to open (the level just runs on): main.js throws dust + light and does not hop; art draws a spill (+ the root-arch for 'light', two cairns for the rest) */
export const BARE_KINDS = ['light', 'cairn', 'ledge'];
export const isBareKind = k => BARE_KINDS.includes(k);
/* the dust a falling gate throws, per open.kind (default: the Wood's earth + pine) */
export const DUST = { rope: ['#8a7048', '#c8b480', '#5e4a2c'], bell: ['#6a5238', '#c89a48', '#2e2218'], crumble: ['#7a828c', '#b4bcc4', '#4a5058'] };
/* the row for a level. ctx: the flags a row's `when` asks for ({ burningOpen: bool }); a row with no when always matches. */
export const entryFor = (from, to, ctx = {}) => TABLE.find(e => e.from === from && (to === undefined || e.to === to) && (!e.when || Object.keys(e.when).every(k => !!e.when[k] === !!ctx[k]))) || null;
/* a scene beat (shore, ride, road, smoke...) is one that carries sc, or the ferry's own two */
export const isSceneBeat = b => !!b && (b.sc === true || b.id === 'shore' || b.id === 'ride');

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

/* ------------------------------------------------------------- THE ROAD SCENE (scene 'road': FEN ROAD -> THE STOCKADE; claude/demotransitions). Pure, so a node check can pin it.
   s: seconds since the scene began. The party walks the laid boardwalk (the world slides under them), and the stockade's walls on the skyline grow from a smudge to a wall of points and horns. */
const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
export const ROAD = { dur: 8.2, inT: 1.5, v: 58, rampT: 1.4, parallax: { far: 0.12, mid: 0.5, near: 1.3 } };
export function roadScroll(s, reduce = false) {
  const v = reduce ? ROAD.v * 0.4 : ROAD.v, a = v / ROAD.rampT, t = Math.max(0, s - 0.3);
  return t < ROAD.rampT ? 0.5 * a * t * t : 0.5 * v * ROAD.rampT + v * (t - ROAD.rampT);
}
/* the stockade's growth, 0 (a smudge on the skyline) .. 1 (the wall fills the screen's right): eased over the whole scene */
export const roadGrowth = s => smooth(s / ROAD.dur);
/* hero i of n: in from the left edge over 1.5 s, then walking in place at the same stations (the road moves, not them) */
export function roadHero(i, n, s, VW) {
  const to = VW * 0.34 + i * 13, from = -24 - i * 14, e = smooth(s / ROAD.inT);
  return { x: from + (to - from) * e, walking: true, settled: s >= ROAD.inT };
}

/* ------------------------------------------------------------- THE SMOKE SCENE (scene 'smoke': KINGSWOOD -> THE BURNING VILLAGE). Gorm is down; the party walks out along the court road and STOPS on the rise: smoke on the horizon, the sky going to ember. */
export const SMOKE = { dur: 8.0, inT: 2.4, stopX: 0.30 };
export function smokeHero(i, n, s, VW) {
  const to = VW * SMOKE.stopX + i * 13, from = -24 - i * 14, k = clamp01(s / SMOKE.inT), e = smooth(k);
  return { x: from + (to - from) * e, walking: s < SMOKE.inT - 0.1 };
}
/* how tall the columns have grown (0..1) and how red the sky has gone (0..1): the plumes rise first, the glow follows */
export const smokeRise = s => smooth((s - 1.2) / 5.2);
export const smokeGlow = s => smooth((s - 2.0) / 5.0);
