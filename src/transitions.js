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
    beats: [{ id: 'walk', dur: 1.6, max: 2.8 }, { id: 'smoke', dur: 5.4, sc: true }, { id: 'fade', dur: 0.8 }],
    walk: { to: 478 }, endOnMap: true, arrive: null, bar: 12 },   /* (Daniel 11-02 17:53) NOT auto-loaded: after the smoke the party ends on the WORLD MAP with the spur node lit (the player chooses to go) */
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
  /* LANE B (claude/act2tr, 11-04) rows 7-11; LANE C then made rows 8, 9 and 12 the three BIG SCENES (daylight, drop, descent: thin bars, one caption line, arrive into the next level). */
  { from: 'oreroad', to: 'minecart', scene: null,    /* 7. THE WINCHMASTER falls: the winch landing's east wall (cols 524-528, the level's last five) gives way as an adit gate onto the Deep Rails' mouth. walk.floor 14: the landing's top (the arena's own floor row 18 is the shaft under the buckets) - heroes are set on it for the walk */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 524, w: 5, rows: [9, 13], kind: 'adit' }, walk: { floor: 14 }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'minecart', to: 'storm', scene: 'daylight',   /* 8. THE GOBLIN CAPTAIN falls (GATE-END, L.gateAfterBoss: the drill-stage gate at col 1410 is walked INTO - no open beat). LANE C: S1 'daylight' - the last cart rolls out of the mountain into dawn, Stormhold across the gorge (5.6 s, thin bars, one line) */
    beats: [{ id: 'walk', dur: 1.6, max: 3.0 }, { id: 'daylight', dur: 5.6, sc: true }, { id: 'fade', dur: 0.8 }],
    bar: 12, caption: { text: 'OUT OF THE MOUNTAIN', at: 3.4 }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'storm', to: 'undercrown', scene: 'drop',    /* 9. THE QUEEN'S LANCE falls: the Long Bridge's end wall (cols 796-797, the last two) gives way, then LANE C's S2 'the bridge gives': the deck cracks, the stones fall away and the party drops through grey light into the dark under the castle (5.2 s); the Undercrown's arrival ledge takes them (arrive.drop: dust + a thud, no real fall) */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'drop', dur: 5.2, sc: true }, { id: 'fade', dur: 0.7 }],
    open: { col: 796, w: 2, rows: [26, 29], kind: 'crumble' }, bar: 12, caption: { text: 'THE BRIDGE GIVES', at: 1.7 }, arrive: { ferry: false, walk: 1.4, drop: true } },
  { from: 'undercrown', to: 'kitchengate', scene: null,   /* 10. THE BURIED PRINCE falls: the bay beyond the fight (cols 76-98) ends at a bricked arch in the hall's east wall (col 99): it gives way onto the service stair; the party walks to the arch and fades */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 99, rows: [162, 166], kind: 'arch' }, walk: { to: 99 }, arrive: { ferry: false, walk: 1.3 } },
  { from: 'kitchengate', to: 'crown', scene: null,    /* 11. LORD GRUBBAG falls: the serving line's far door (cols 600-601, the last two) swings out onto the gatehouse passage - a dish hatch */
    beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'fade', dur: 0.7 }],
    open: { col: 600, w: 2, rows: [17, 21], kind: 'hatch' }, arrive: { ferry: false, walk: 1.3 } },
  /* LANE C row 12: THE ACT II -> III HAND-OFF (Highcrown, the mountain, to the Long Water). THE GOBLIN QUEEN falls in the Banquet Hall: its east wall (cols 603-608, the level's last six, rows 12-17) is the broken castle gate and gives way onto the mountain stair; the party walks out (walk.follow: y follows the dais steps, the hall's floor is row 20 and the dais row 18), then S3 'the long descent' (6.6 s): the camera pulls up and back (the castle small on its peak), a river-raft carries them down into broad grey water; the Long Water's first bank takes the raft (arrive.raft). The Codex ACT VIDEO (once per save, before the 'ACT III' card) is the PLAYER lane's: this scene stays as the replay / fallback */
  { from: 'crown', to: 'longwater', scene: 'descent',
    beats: [{ id: 'open', dur: 1.4 }, { id: 'walk', dur: 2.0, max: 3.4 }, { id: 'descent', dur: 6.6, sc: true }, { id: 'fade', dur: 0.8 }],
    open: { col: 603, w: 6, rows: [12, 17], kind: 'crumble' }, walk: { floor: 18, follow: true }, bar: 12, caption: { text: 'DOWN TO THE SEA', at: 4.2 }, arrive: { ferry: true, raft: true, walk: 1.8 } },
];
/* open kinds with NO wall in the arena to open (the level just runs on): main.js throws dust + light and does not hop; art draws a spill (+ the root-arch for 'light', two cairns for the rest) */
export const BARE_KINDS = ['light', 'cairn', 'ledge'];
export const isBareKind = k => BARE_KINDS.includes(k);
/* the dust a falling gate throws, per open.kind (default: the Wood's earth + pine) */
export const DUST = { rope: ['#8a7048', '#c8b480', '#5e4a2c'], bell: ['#6a5238', '#c89a48', '#2e2218'], crumble: ['#7a828c', '#b4bcc4', '#4a5058'],
  adit: ['#6a4a34', '#b08050', '#2a1e16'], arch: ['#4a5248', '#8a9488', '#1e2420'], hatch: ['#8a5a30', '#e8b868', '#3a2412'] };   /* (lane B) adit: ore-brown timbers; arch: the crypt's grey-green brick; hatch: the kitchen's warm oak */
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
export const barIn = (t, bar = BAR) => bar * Math.min(1, Math.max(0, t / 0.5));   /* bar: a row may carry a thinner one (entry.bar: the cinematic beats) */
export const barOut = (t, dur, bar = BAR) => bar * Math.min(1, Math.max(0, (dur - t) / 0.6));

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

/* ------------------------------------------------------------- THE SMOKE SCENE (scene 'smoke': KINGSWOOD -> THE BURNING VILLAGE; REDONE claude/kingscene, Daniel 11-04: a short cinematic beat, ~5.4 s).
   Gorm is down. s: seconds since the scene began. The party walks out onto the court road (0 .. inT), the leader stoops and PICKS UP Gorm's crown (pickAt), raises it (liftT), looks BACK at the wood
   (backAt) as the smoke begins to rise, the WAR HORN sounds (hornAt), then turns and the camera pans slowly right (panAt, panDur) to a CLOSER, bigger burning village; the line THE VILLAGE BURNS
   comes up (wordAt). The beat after it is the fade, then the MAP with the spur lit (the 11-02 rule: it never auto-loads the village). Reduce-motion: no pan, no zoom - the view dissolves instead. */
export const SMOKE = { dur: 5.4, inT: 1.0, stopX: 0.27, pickAt: 1.15, liftT: 0.8, backAt: 2.3, hornAt: 2.4, turnAt: 3.0, panAt: 3.0, panDur: 2.2, wordAt: 3.3, bar: 12, panPx: 210 };
export function smokeHero(i, n, s, VW) {
  const to = VW * SMOKE.stopX - i * 14, from = -24 - i * 14, k = clamp01(s / SMOKE.inT), e = smooth(k);
  return { x: from + (to - from) * e, walking: s < SMOKE.inT - 0.1 };
}
/* the leader's stance: stoop 0..1 (bent to the crown), crown 0 (on the road) .. 1 (raised overhead), face (1 right, -1 left: the look back), walking (the pan carries them on) */
export function smokeStance(s, reduce = false) {
  const stoop = s < SMOKE.pickAt ? 0 : s < SMOKE.pickAt + 0.4 ? smooth((s - SMOKE.pickAt) / 0.25) : 1 - smooth((s - SMOKE.pickAt - 0.4) / 0.35);
  const crown = smooth((s - SMOKE.pickAt - 0.3) / SMOKE.liftT);
  const face = s >= SMOKE.backAt && s < SMOKE.turnAt ? -1 : 1;
  const walking = s < SMOKE.inT - 0.1 || (!reduce && s >= SMOKE.panAt + 0.2 && s < SMOKE.panAt + SMOKE.panDur);
  return { stoop: clamp01(stoop), crown, face, walking };
}
/* the camera: 0 (the wood's rise) .. 1 (the village close). Reduce-motion does not move the camera: it is a quick settle (a dissolve in the art), never a slow slide */
export const smokePan = (s, reduce = false) => (reduce ? (s >= SMOKE.panAt + 0.25 ? 1 : 0) : smooth((s - SMOKE.panAt) / SMOKE.panDur));
/* how tall the columns have grown (0..1) and how red the sky has gone (0..1): the plumes rise as he looks back, the glow follows */
export const smokeRise = s => smooth((s - SMOKE.backAt + 0.4) / 2.8);
export const smokeGlow = s => smooth((s - 1.0) / 3.6);
/* the caption's opacity (0..1) */
export const smokeWord = s => smooth((s - SMOKE.wordAt) / 0.6);
/* ------------------------------------------------------------- LANE C: THE THREE BIG SCENES OF ACT II (claude/act2tr). Pure maths, so a node check can pin it. s = seconds since the scene began; every one takes reduce (no camera whip, slower, a dissolve instead of a pull).
   S1 'daylight' (MINECART -> STORMHOLD): the party is on the last cart in the tunnel (timbers and torch flecks go by), the mouth ahead grows, the cart rolls OUT into dawn: the gorge, Stormhold across it, the Long Bridge up out of the haze. */
export const DAYLIGHT = { dur: 5.6, inT: 0.9, v: 84, rampT: 1.1, litAt: 1.4, outAt: 2.9, wordAt: 3.4 };
export function daylightScroll(s, reduce = false) { const v = reduce ? DAYLIGHT.v * 0.45 : DAYLIGHT.v, a = v / DAYLIGHT.rampT, t = Math.max(0, s - 0.1); return t < DAYLIGHT.rampT ? 0.5 * a * t * t : 0.5 * v * DAYLIGHT.rampT + v * (t - DAYLIGHT.rampT); }
export const daylightLight = s => smooth((s - DAYLIGHT.litAt) / 1.8);   /* the mouth ahead: 0 dark .. 1 full */
export const daylightOut = s => smooth((s - DAYLIGHT.outAt) / 0.8);   /* 0 inside the mountain .. 1 out in the dawn */
export const daylightTown = s => smooth((s - DAYLIGHT.outAt) / 2.4);   /* Stormhold and the Long Bridge come up out of the haze */
export function daylightHero(i, n, s, VW) { const to = VW * 0.20 + 12 + i * 13, from = -24 - i * 14, e = smooth(s / DAYLIGHT.inT); return { x: from + (to - from) * e, walking: s < DAYLIGHT.inT - 0.1 }; }
/* S2 'drop' (STORM -> UNDERCROWN): the Lance's last blow cracks the Long Bridge. */
export const DROP = { dur: 5.2, crackAt: 0.3, breakAt: 1.5, g: 330, vT: 250, wordAt: 1.7 };
export const dropCrack = s => smooth((s - DROP.crackAt) / 1.1);
/* how far the world has scrolled UP since the deck went (px): free fall to a terminal speed. reduce: a gentle, slow fall */
export function dropFall(s, reduce = false) { const t = s - DROP.breakAt; if (t <= 0) return 0; const g = reduce ? DROP.g * 0.4 : DROP.g, vT = reduce ? DROP.vT * 0.45 : DROP.vT, tt = vT / g; return t < tt ? 0.5 * g * t * t : 0.5 * vT * tt + vT * (t - tt); }
export const dropDark = s => smooth((s - 1.8) / 3.0);   /* the grey light goes out as they fall under the castle */
export function dropHero(i, n, s, VW) { return { x: VW * 0.34 + i * 13 + (s > DROP.breakAt ? Math.sin(i * 2.1 + s * 2) * 1.5 : 0), sink: 36 * smooth(dropFall(s) / 70) }; }
/* S3 'descent' (CROWN -> LONG WATER, THE ACT HAND-OFF): out of the broken gate onto the stair, the camera pulls up and back (the castle small on its peak), a raft takes them down into broad water. */
export const DESCENT = { dur: 6.6, inT: 1.2, pullAt: 1.9, pullDur: 2.4, raftAt: 3.3, v: 66, rampT: 1.3, wordAt: 4.2 };
export const descentPull = (s, reduce = false) => (reduce ? (s >= DESCENT.pullAt + 0.3 ? 1 : 0) : smooth((s - DESCENT.pullAt) / DESCENT.pullDur));
export const descentDip = (s, reduce = false) => { if (!reduce) return 0; const d = Math.abs(s - (DESCENT.pullAt + 0.3)); return d < 0.3 ? 1 - d / 0.3 : 0; };   /* reduce-motion: the pull is a quick dip to dark, never a slide */
export const descentWater = s => smooth((s - DESCENT.raftAt) / 1.6);   /* the river widens into the sea under them */
export function descentScroll(s, reduce = false) { const v = reduce ? DESCENT.v * 0.4 : DESCENT.v, a = v / DESCENT.rampT, t = Math.max(0, s - DESCENT.raftAt - 0.2); return t < DESCENT.rampT ? 0.5 * a * t * t : 0.5 * v * DESCENT.rampT + v * (t - DESCENT.rampT); }
export function descentHero(i, n, s, VW) { const to = VW * 0.30 + i * 13, from = -24 - i * 14, e = smooth(s / DESCENT.inT); return { x: from + (to - from) * e, walking: s < DESCENT.inT - 0.1 }; }
/* the caption's opacity (0..1) for a row that carries one (entry.caption: { text, at }) */
export const captionAlpha = (entry, s) => (entry.caption ? smooth((s - entry.caption.at) / 0.6) : 0);
