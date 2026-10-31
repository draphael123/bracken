// src/order-chapters.js - THE ROAD WARDENS: WHO THE KNIGHTS ARE, REGION BY REGION AND LEVEL BY LEVEL (claude/order, Daniel 2026-10-11,
// scratch/brief-elite-order.md). PURE DATA: no page, no canvas, no main.js. src/order-knights.js runs the bodies; src/level.js reads ORDER_AT
// to place them (knightRow); tools/order-knights.mjs holds this table to its rules.
//
// ONE FALLEN ORDER whose CHAPTERS went native in each region: the same heraldry (a broken milestone on a field of the chapter's colour), worn
// differently. You learn a BODY once - four of them, each an elite kind on the existing elite plate / affix / guard / opening / ROUSED code
// (src/elite-kit.js), never a parallel system - and each region surprises you with its CHAPTER's 1-2 signature moves. Three layers make every
// level a little different (Daniel 10-11 12:55):
//   CHAPTER  region -> palette, banner, the mage's element and 1-2 SIGNATURE moves (src/exit-gates.js KIND_OF is the region table)
//   TWIST    level -> ONE small change drawn from THAT level's own rule: where he stands, what he uses. Data plus a small AI hook in
//            src/order-knights.js (TWIST_RUN), never a new body. Two levels of one region never share a twist.
//   AFFIX    optional, at most one (src/elite-kit.js AFFIX); the level's ent carries it, so AFFIX_AT stays the elites' one table.
// The order counts ONCE as the recurring foe (design-standard A9): a knight is not 'new' after the first one you meet.
// A HOOK FOR LATER: ORDER.master names the order's last master, the boss of a later act (not built; nothing reads it yet).

/* THE ORDER. THE ROAD WARDENS (Daniel's pick, 10-11; the working title was THE OATHBROKEN). One line to rename: every plate and card reads ORDER.name / ORDER.short. */
export const ORDER = { name: 'THE ROAD WARDENS', short: 'ROAD WARDEN', was: 'the knights who kept the road', master: 'THE LAST GRANDMASTER',
  sigil: 'a broken milestone' };

/* THE FOUR BODIES. One AI each (src/order-knights.js BODY_RUN); the ent kind IS the body. `react` is his anti-plunge pose from
   src/foe-react.js REACT_AIR (scratch/brief-combat2.md section 4's update: the Duelist a, the Lancer b, the Brute d; the mage none - he wards
   spells instead). hp is his kind's base health (main.js EHP); an elite stands up with ELITE[t].hp of it, times his level row's hp. */
export const BODY = {
  oathblade: { body: 'duelist', name: 'DUELIST', hp: 30, w: 12, h: 18, speed: 30, keep: 26, react: 'guardsHigh',
    kit: 'sword and shield. GUARDS BY ANGLE, ripostes a mash, and TEACHES THE PARRY: his yellow CUT glints on the beat - the cleanest parry read in the game. And a LUNGE.' },
  oathmaul: { body: 'brute', name: 'BRUTE', hp: 34, w: 14, h: 20, speed: 22, keep: 24, react: 'catchThrow', unmoved: true,
    kit: 'a greatmaul. Slow and poise-heavy: no blow throws him until his poise breaks. The SLAM (red: the maul stays in the floor - his opening) and the SWEEP (yellow). Plunge on him and he CATCHES you.' },
  oathlance: { body: 'lancer', name: 'LANCER', hp: 30, w: 12, h: 18, speed: 28, keep: 56, react: 'antiAir',
    kit: 'a war lance. Reach: the THRUST (yellow) and the CHARGE (yellow; take it on the shield and he rebounds, dodge it and he runs on - into a wall he is dazed, at a ledge he TEETERS: throw him in). Over his head he thrusts UP.' },
  oathmage: { body: 'mage', name: 'BATTLE MAGE', hp: 26, w: 11, h: 18, speed: 26, keep: 110, react: null, wards: true,
    kit: 'a blade and a focus. Mid range, he CASTS his chapter\'s element (yellow: a shield turns it, a parry sends it back at him); hit him while he casts and he is INTERRUPTED (his opening). He WARDS his front against shots - dash through it. A short BLADE when you reach him.' },
};
export const TYPES = Object.keys(BODY);
export const isKnightT = t => !!BODY[t];

/* THE CHAPTERS, by region (src/exit-gates.js KIND_OF). pal: plate / plate shade / cloth (surcoat + banner field) / cloth shade / trim / the
   eye-slit glow; col: the chapter's word colour. moves: the 1-2 SIGNATURE moves (src/order-knights.js SIG_RUN builds the ones marked built).
   element: what his battle mage casts. All ten are written down so the roll-out lanes have the palette and the plan; only built moves run. */
export const CHAPTERS = {
  forest: { id: 'thorn', name: 'THE THORN CHAPTER', title: 'BRIAR', col: '#8fd160',
    pal: { plate: '#7d8a70', dark: '#4a5442', cloth: '#3f6a34', clothDk: '#28451f', trim: '#a8c070', eye: '#c8f070' },
    moves: ['vine', 'snare'], element: 'THORN BOLT', built: true },
  marsh: { id: 'bog', name: 'THE BOG CHAPTER', title: 'BOG', col: '#b09a5a',
    pal: { plate: '#6e6a58', dark: '#3e3a2c', cloth: '#5a4a2a', clothDk: '#3a2e18', trim: '#8a9a4a', eye: '#d8e080' },
    moves: ['mud', 'wade'], element: 'BOG SPIT', built: true },
  fungus: { id: 'spore', name: 'THE SPORE CHAPTER', title: 'SPORE', col: '#c8a0ff',
    pal: { plate: '#7a6a80', dark: '#45384a', cloth: '#6a3a7a', clothDk: '#45204e', trim: '#c8f0a0', eye: '#e0c0ff' },
    moves: ['puff', 'capBounce'], element: 'SPORE CLOUD', built: true },
  crag: { id: 'scree', name: 'THE SCREE CHAPTER', title: 'SCREE', col: '#c9b27c',
    pal: { plate: '#8a8478', dark: '#4e4a44', cloth: '#6a5a40', clothDk: '#45382a', trim: '#c9b27c', eye: '#ffe0a0' },
    moves: ['kickRock', 'rockShield'], element: 'ROCK SHARDS', built: true },
  mine: { id: 'ore', name: 'THE ORE CHAPTER', title: 'ORE', col: '#e0a050',
    pal: { plate: '#5a5260', dark: '#2e2a34', cloth: '#7a4a2a', clothDk: '#4a2a16', trim: '#b09a5a', eye: '#ffb060' },
    moves: ['plate', 'snuff'], element: 'ORE SPARKS', built: true },
  storm: { id: 'storm', name: 'THE STORM CHAPTER', title: 'STORM', col: '#bfe6f5',
    pal: { plate: '#8a96a8', dark: '#4a5468', cloth: '#2a4a7a', clothDk: '#1a2e50', trim: '#d8e8ff', eye: '#bfe6f5' },
    moves: ['arc', 'braced'], element: 'STORM ARC', built: true },
  coast: { id: 'drowned', name: 'THE DROWNED CHAPTER', title: 'DROWNED', col: '#8ff0dc',
    pal: { plate: '#56656c', dark: '#27313a', cloth: '#2a5a5a', clothDk: '#18393a', trim: '#8ff0dc', eye: '#8ff0dc' },
    moves: ['riseWater', 'towLine'], element: 'TIDE WHIP' },
  canal: { id: 'lantern', name: 'THE LANTERN CHAPTER', title: 'LANTERN', col: '#ffd36b',
    pal: { plate: '#6a6458', dark: '#36322a', cloth: '#5a3a5a', clothDk: '#3a2438', trim: '#ffd36b', eye: '#fff0a0' },
    moves: ['snuffLight', 'fogStep'], element: 'LANTERN FLARE' },
  inland: { id: 'grave', name: 'THE GRAVE CHAPTER', title: 'GRAVE', col: '#c9d1dc',
    pal: { plate: '#8a8a90', dark: '#46464e', cloth: '#3a3a48', clothDk: '#22222c', trim: '#c9d1dc', eye: '#a0f0ff' },
    moves: ['riseOnce', 'bellToll'], element: 'GRAVE CHILL', undead: true },
  desert: { id: 'sun', name: 'THE SUN CHAPTER', title: 'SUN', col: '#ffe08a',
    pal: { plate: '#b09a6a', dark: '#6a5a3a', cloth: '#e0c070', clothDk: '#a08040', trim: '#fff0b0', eye: '#fff6c8' },
    moves: ['mirrorFlash', 'shadeStep'], element: 'SUN LANCE' },
};
/* LATER (the acts not built yet): FROST (ice floor, frozen guard), ASH (the volcano: ember trail, a lava-fed brute), HOLLOW (the demon act:
   possessed - the Veil). Named so a roll-out lane does not invent a fourth palette for them. */
export const LATER = { frost: 'THE FROST CHAPTER', ash: 'THE ASH CHAPTER', hollow: 'THE HOLLOW CHAPTER' };

/* THE SIGNATURE MOVES. mark '!' a shield turns it, '!!' nothing does, '' it throws no blow (a QUIET windup: src/marks.js). The word is said
   over his plate in the chapter's colour as the windup starts, with the move's sound. passive: no windup (a state he is in). */
export const SIG = {
  vine: { mark: '!', word: 'VINE PULL', what: 'a briar lash along the floor: it lands, and it hauls you in to him (a shield turns it)' },
  snare: { mark: '!!', word: 'SNARE', what: 'briars mark the floor at your feet; spring them standing there and they ROOT you a moment' },
  mud: { mark: '!!', word: 'MUD', what: 'he drives his weapon into the ground and the floor at your feet turns to MUD: it holds your feet for a while' },
  wade: { passive: true, what: 'he WADES: mud and shallows never slow him' },
  plate: { passive: true, what: 'ORE-PLATED: his ore turns a light blade from any side (ORE). A HEAVY blow, a riposte or a thrown thing CRACKS a plate' },
  snuff: { mark: '', word: 'SNUFF', what: 'he puts out the nearest lamp; in the dark his ore grows back. Strike the lamp to light it again' },
};
export const SIG_BUILT = new Set(Object.keys(SIG));

/* THE TWISTS: one small change from THAT level's rule. level: where it is wired; rule: the level's rule line it comes from (src/level.js);
   what: what the player sees; n: its numbers (src/order-knights.js TWIST_RUN). */
export const TWISTS = {
  timber: { level: 'wood', rule: 'FOUR STROKES FELL A MARKED PINE, AND IT FALLS THE WAY IT LEANS: ACROSS A GAP, UP A CLIFF, OR ON WHOEVER STANDS UNDER IT.',   /* (claude/lumbertrail: THE LUMBER TRAIL's rule, src/level.js RULE_WOOD) */
    mark: '!!', word: 'TIMBER',
    what: 'once he is ROUSED he fells the pine beside him across the yard (a red strip: be off it). It lies there for the rest of the fight - and a SWEEP or a SLAM swung across it STICKS IN THE WOOD: his long opening. Fight from behind the trunk.',
    n: { tell: 0.95, len: 3, dmg: 18, stuck: 1.7 } },
  channel: { level: 'marsh', rule: 'THE CHANNEL IS DEEP: PAY THE FERRYMAN, OR DRAIN IT AND WADE.', mark: '!', word: 'SHOVE',
    what: 'he holds the far bank with the deep channel at your back: a shield SHOVE that drives you back toward the water. A shield turns it to a step; PARRY it and he is yours.',
    n: { tell: 0.55, reach: 30, dmg: 10, push: 210, blockedPush: 90, every: 4.0 } },
  rust: { level: 'oreroad', rule: 'THE BUCKETS ARE THE FLOOR. STEP ON, STEP OFF, AND DO NOT STAND ON RUST.', mark: '!!', word: 'RUST',
    what: 'he grinds his lance butt on the drum yard\'s plates: the patch under you RUSTS red and gives a beat later - step off the rust.',
    n: { tell: 0.85, half: 24, dmg: 14, every: 6.5 } },
  /* THE ROLL-OUT (claude/wardens12, Daniel 10-13/14): ACTS I and II. Every new twist is one of THREE small mechanisms (src/order-knights.js twistRun), data only:
       fam 'patch' (red !!)  the floor under you is marked, then it springs (the Ore Road's RUST family): half = the strip's half-width, dmg, vy / vx = the toss (vx is AWAY from him),
                             every = the cooldown, ember = a lingering burn after it springs {life, dmg, tick}
       fam 'shove' (yellow !) a reach move that moves you: push > 0 drives you away from him, push < 0 hauls you IN; a shield turns it to blockedPush (the Marsh's SHOVE family)
       fam 'horn'  (yellow !) a TOLD blast: struck while he draws breath it is SILENCED (his opening, the way the mage's cast is interrupted); sounded, it hits everything inside r
     move = the windup's id (the mode is <move>Tell, <move>, <move>Rec); word = said over his plate; sound / fire = the windup's and the release's sfx. Numbers come from the three as-played
     knights (tell 0.55-1.0 s, dmg 6-18, every 4-8 s): nothing here is new tuning, only which of those a level picks. */
  horn: { level: 'stockade', fam: 'horn', move: 'horn', rule: 'EVERY TOWER HAS A HORN. SILENCE THE BLOWER BEFORE IT SOUNDS.', mark: '!', word: 'WAR HORN', sound: 'hornDraw', fire: 'hornBlast',
    what: 'the tower rule worn by a knight: he puts a warhorn to his lips (a long, told breath) and, sounded, it drives everything near him back. STRIKE HIM WHILE HE DRAWS BREATH and the horn is SILENCED - his opening.',
    n: { tell: 0.95, r: 118, dmg: 9, push: 190, blockedPush: 70, every: 8.0 } },
  bud: { level: 'spore', fam: 'patch', move: 'bud', rule: 'THE CAPS GROW INTO STEPS. CLIMB TO THE MOTHERS KNOT.', mark: '!!', word: 'BUD', sound: 'budSpring', fire: 'budSpring',
    what: 'he stamps a bud: the cap under your feet SPRINGS, a high toss (a little spore-burn). Be off the purple strip - or be on it, and use the bounce to clear him.',
    n: { tell: 0.9, half: 22, dmg: 6, vy: -250, vx: 0, every: 7.0, col: '#c8a0ff', life: 1.2 } },
  hoist: { level: 'rootway', fam: 'patch', move: 'hoist', rule: "THE GOBLINS' HOISTS DROP WHAT THEY HOLD.", mark: '!!', word: 'HOIST', sound: 'creak', fire: 'crumble',
    what: 'his order kept the hoists too: he cuts a line and the load comes down on a wide red strip over your head (be out from under it).',
    n: { tell: 1.05, half: 28, dmg: 18, vy: -110, vx: 0, every: 8.0, col: '#a07a46', life: 1.4 } },
  plank: { level: 'burning', fam: 'patch', move: 'plank', rule: 'ONLY HIS FIRE SPREADS. WATER PUTS IT OUT.', mark: '!!', word: 'BURNING PLANK', sound: 'creak', fire: 'ember',
    what: 'he KICKS a burning plank under your feet: it flares on the strip, and the embers keep burning for a few seconds - get off the red.',
    n: { tell: 0.85, half: 24, dmg: 10, vy: -90, vx: 0, every: 7.0, col: '#ff8a3a', life: 2.6, ember: { life: 2.6, dmg: 4, tick: 0.6 } } },
  pot: { level: 'underleaf', fam: 'patch', move: 'pot', rule: 'HER JARS CHANGE WHAT THEY BREAK ON: GREEN GROWS A VINE, BLUE LIFTS IN A BUBBLE, RED BURNS.', mark: '!!', word: 'POT', sound: 'throwWhoosh', fire: 'flaskBreak',
    what: 'he lobs a pot at the spot he last HEARD you: it bursts on a small red patch (a sound he chose) and throws you clear of it.',
    n: { tell: 0.7, half: 16, dmg: 8, vy: -60, vx: 140, every: 6.0, col: '#c9a96a', life: 0.9 } },
  kick: { level: 'scree', fam: 'patch', move: 'kick', rule: 'THE SLOPE MOVES UNDER YOU AND THE CLIFF DROPS WHAT IT LIKES.', mark: '!!', word: 'KICK ROCK', sound: 'stone', fire: 'rubble',
    what: 'he kicks the scree loose under your feet: the strip slides, and it takes you away from him with it. A shield does not turn the ground.',
    n: { tell: 0.75, half: 28, dmg: 8, vy: -60, vx: 230, every: 6.5, col: '#c9b27c', life: 1.2 } },
  haul: { level: 'hanging', fam: 'shove', move: 'haul', rule: 'THE VILLAGE HANGS ON ROPES, AND A ROPE CAN BE CUT.', mark: '!', word: 'HAUL', sound: 'grapple', fire: 'ropeHaul',
    what: 'he hooks you with a rope-line and HAULS you in. A shield turns it to a stumble; a parry is the riposte.',
    n: { tell: 0.6, reach: 70, dmg: 6, push: -200, blockedPush: -70, every: 5.0 } },
  gong: { level: 'spire', fam: 'horn', move: 'gong', rule: 'WHAT THE MONKS BUILT STILL ANSWERS A BLOW. CLIMB.', mark: '!', word: 'GONG', sound: 'tollBell', fire: 'boom',
    what: 'he strikes his shield like the monastery\'s own gong: a long told ring, then a blast that throws you back. A blow while he lifts the maul SILENCES it.',
    n: { tell: 1.0, r: 104, dmg: 9, push: 170, blockedPush: 60, every: 8.5 } },
  gale: { level: 'moor', fam: 'shove', move: 'gale', rule: 'THE WIND COMES IN GUSTS, AND YOU CAN HEAR EACH ONE COMING.', mark: '!', word: 'GALE', sound: 'gustRise', fire: 'gust',
    what: 'he braces his lance into the wind and drives you down the field on a gust. A shield turns it to a step.',
    n: { tell: 0.55, reach: 64, dmg: 8, push: 230, blockedPush: 90, every: 5.0 } },
  updraft: { level: 'skyroad', fam: 'patch', move: 'updraft', rule: 'THE SUN WARMS THE ROCK AND THE AIR RISES. STRIKE A SUN-STONE TO WAKE ITS AIR; RIDE IT.', mark: '!!', word: 'UPDRAFT', sound: 'gustRise', fire: 'gust',
    what: 'he warms the rock under your feet and the AIR RISES: a red strip that hurls you up (glide out of it).',
    n: { tell: 0.9, half: 22, dmg: 4, vy: -330, vx: 0, every: 7.0, col: '#ffe08a', life: 1.1 } },
  arc: { level: 'storm', fam: 'patch', move: 'arc', rule: 'THREE GATES. EVERY KEY HANGS IN A WATCHTOWER.', mark: '!!', word: 'ARC', sound: 'zap', fire: 'stormZap',
    what: 'his charged lance finds the iron in the floor: the strip under you ARCS (a red mark first). Step off the metal.',
    n: { tell: 0.8, half: 30, dmg: 14, vy: -100, vx: 0, every: 6.5, col: '#bfe6f5', life: 0.9 } },
};

/* THE ORDER TABLE: level -> who holds it. chapter by region (KIND_OF) unless named; body = the ent kind; twist = TWISTS; affix optional (one);
   sig = which of the chapter's signature moves this one uses; affix: tools/elites.mjs holds every placed elite to ONE (the old elite's was WARDING / THORNED / UNSTOPPABLE: the wood keeps its ward over the sprigs, the bog its venom, the ore lancer is quick on his feet); hp = x his body's elite health; replaces = the old elite he stands in for
   (review-first2: knights REPLACE, not add). gate = the column he holds shut until he falls (src/level.js eliteGate, batch81's elite gates);
   at = [col, row] in the level's final columns. Only the three wired chapters' exams are rows; the roll-out lanes add theirs. */
export const ORDER_AT = {
  wood: { body: 'oathmaul', chapter: 'forest', twist: 'timber', sig: ['vine'], affix: 'WARDING', hp: 0.85, at: [254, 16], gate: 260, replaces: 'shield',   /* (claude/lumbertrail) THE LUMBER CAMP's yard, the area's exam: his gate holds the way to the lean-to */
   
    name: 'THE BRIAR MAUL', why: 'the first knight you meet: slow, heavy, readable - the knock-into target that stays put; the wood already has its duelist (the sworn sword)' },
  marsh: { body: 'oathblade', chapter: 'marsh', twist: 'channel', sig: ['mud', 'wade'], affix: 'VENOMOUS', hp: 1.0, at: [98, 15], gate: 105, replaces: 'thorn',
    name: 'THE BOG BLADE', why: 'the duelist teaches the parry early, one on one on the far bank; not a battle mage (the marsh is ~36% ranged already)' },
  oreroad: { body: 'oathlance', chapter: 'mine', twist: 'rust', sig: ['plate'], affix: 'SWIFT', hp: 1.65, at: [458, 12], gate: 472, replaces: 'heavy',
    name: 'THE ORE LANCE', why: 'the drum yard before the Winchmaster: his ORE turns a blade until a heavy cracks it - the boss\'s key, taught first (B14); the shaft drop at your back is where his charge ends' },
  /* THE ROLL-OUT, ACTS I and II (claude/wardens12). Each knight REPLACES the exam elite named in 'replaces' (same column, same row, same gate, the same affix he wore), numbers are
     the as-played three's (hp x: the brute .85 as at the wood, the duelist and the mage 1.0 as at the marsh; the lancer 1.0 - the Ore Road's 1.65 was the Ore plates' weight, see QUESTIONS).
     The chapters of the fungus, the crag and the storm are wired for their PALETTE, BANNER and ELEMENT; their signature moves are not built yet (sig: []). DEFERRED (an active rework or brief):
     kings (Kingswood 2), crown (Highcrown rework), minecart (Deep Rails 5), undercrown (Undercrown 2), wood (Lumber Trail). */
  stockade: { body: 'oathlance', chapter: 'marsh', twist: 'horn', sig: ['mud'], affix: 'SUMMONER', hp: 1.0, at: [302, 19], gate: 317, replaces: 'brute',
    name: 'THE HORN LANCE', why: 'the camp\'s yard before the palisade gate: the tower rule (a horn, and the blower to silence) worn by a knight; a charge ends at the shut gate behind you' },
  spore: { body: 'oathmage', chapter: 'fungus', twist: 'bud', sig: [], affix: 'VENOMOUS', hp: 1.4, at: [346, 11],   /* (claude/sporewood2: hp 1.0 -> 1.4 - the larder's exam; the campaign walker won his duel in ~10 s) */ gate: 353, replaces: 'shield',   /* (claude/sporewood2: THE WEB LARDER's end, built row 11 - was 412/430 of the old wood) */
    name: 'THE SPORE MAGE', why: 'the battle mage\'s first wiring (rec: Sporewood col 412, the cap-top exam): he casts SPORE CLOUD from mid range and stamps the caps to spring them' },
  rootway: { body: 'oathmaul', chapter: 'fungus', twist: 'hoist', sig: [], affix: 'WARDING', hp: 0.85, at: [147, 22], gate: 157, replaces: 'shield',
    name: 'THE HOIST MAUL', why: 'the hollow trunk\'s exam, the knothole at his back; the hoist rule worn by a brute - a slow heavy that drops a load on a told strip' },
  burning: { body: 'oathblade', chapter: 'marsh', twist: 'plank', sig: ['wade'], affix: 'BURNING', hp: 1.0, at: [156, 25], gate: 166, replaces: 'shield',
    name: 'THE EMBER BLADE', why: 'the crofts\' lane out of the village: a duelist who kicks a burning plank under you (the fire is his; water puts it out)' },
  underleaf: { body: 'oathlance', chapter: 'fungus', twist: 'pot', sig: [], affix: 'UNSTOPPABLE', hp: 1.0, at: [366, 29], replaces: 'pike',   /* (claude/underleaf3: THE CAULDRON YARD's exam, at the foot of the jar stair) */
    name: 'THE HUSH LANCE', why: 'the tower-foot pike, UPGRADED not added (the level has no gated exam: it is a sneak level and keeps none): a lancer who throws a pot at where he last heard you' },
  scree: { body: 'oathmaul', chapter: 'crag', twist: 'kick', sig: [], affix: 'WARDING', hp: 0.85, at: [505, 18], gate: 510, replaces: 'troll',
    name: 'THE SCREE MAUL', why: 'the crag troll\'s place before the climb: the slope moves under you and he moves it - a brute that kicks the scree loose' },
  hanging: { body: 'oathblade', chapter: 'crag', twist: 'haul', sig: [], affix: 'SWIFT', hp: 1.0, at: [85, 107], replaces: 'shield',
    name: 'THE ROPE BLADE', why: 'the village street\'s shield captain: a duelist on the rope village who hauls you in on a line' },
  spire: { body: 'oathmaul', chapter: 'crag', twist: 'gong', sig: [], affix: 'WARDING', hp: 0.85, at: [61, 171], replaces: 'troll',
    name: 'THE GONG MAUL', why: 'the scriptorium\'s long floor: what the monks built still answers a blow - a brute that rings the gong' },
  moor: { body: 'oathlance', chapter: 'crag', twist: 'gale', sig: [], affix: 'SWIFT', hp: 1.0, at: [188, 21], gate: 193, replaces: 'goat',
    name: 'THE GALE LANCE', why: 'the Kite Field\'s herd billy, replaced by a lancer that braces into the gust (the field\'s gate is behind him)' },
  skyroad: { body: 'oathblade', chapter: 'crag', twist: 'updraft', sig: [], affix: 'THORNED', hp: 1.0, at: [277, 17], gate: 290, replaces: 'troll',
    name: 'THE SUN BLADE', why: 'the troll on the roc\'s road: a duelist who warms the rock until the air rises under you' },
  storm: { body: 'oathlance', chapter: 'storm', twist: 'arc', sig: [], affix: 'SHIELDED', hp: 1.0, at: [632, 29], gate: 637,   /* (stormhold4: the gatehouse moved +180 - G0 + 56 / G0 + 61, src/stormhold-town.js) */ replaces: 'pike',
    name: 'THE STORM LANCE', why: 'the gatehouse yard of the outer works (claude/stormhold3; was the Pike Serjeant\'s place at the Halls):the charged lance finds the iron in the floor (the zip-line ride is a QUESTION)' },
};
/* WHAT THE ROLL-OUT LANES ARE ASKED TO WRITE NEXT (suggestions, NOT wired: nothing reads PLANNED). Daniel's own examples are here. */
export const PLANNED = {
  stockade: 'BOG knight fights from a RAFT', burning: 'BOG knight KICKS BURNING PLANKS', storm: 'STORM lancer RIDES A ZIP LINE at you',
  minecart: 'ORE knight SNUFFS the cart lamps', spore: 'SPORE battle mage (his first wiring: spore cloud at the shield exam, col 412)',
};

/* THE MARK OVER EVERY WINDUP a knight can enter (src/marks.js BY_HAND rows for each body; tools/order-knights.mjs checks every tell site calls it). */
export const ORDER_MARKS = { cutTell: '!', lungeTell: '!', slamTell: '!!', sweepTell: '!', thrustTell: '!', chargeTell: '!', castTell: '!', bladeTell: '!',
  vineTell: '!', snareTell: '!!', mudTell: '!!', snuffTell: '', timberTell: '!!', shoveTell: '!', rustTell: '!!' };

for (const t of Object.values(TWISTS)) if (t.move) ORDER_MARKS[t.move + 'Tell'] = t.mark;   /* (claude/wardens12) the roll-out twists' windups are told like the three before them: their mark rides this table to src/marks.js BY_HAND */
export const chapterOf = region => CHAPTERS[region] || CHAPTERS.forest;
export const skinOf = (t, chapterKey) => t + '_' + CHAPTERS[chapterKey].id;   /* the cnSkin: 'oathmaul_thorn' - he lives and dies in it */
export const SKINS = []; for (const t of TYPES) for (const k of Object.keys(CHAPTERS)) SKINS.push({ skin: skinOf(t, k), t, chapter: k });
/* THE ELITES ROW src/level.js puts down for a level: [kind, col, row, ent fields]. The fields carry the order (chapter, twist, affix, name)
   onto the ent, so main.js's eliteMake gives him the affix the table names and src/order-knights.js reads the rest off him. */
export function knightRow(id) {
  const o = ORDER_AT[id]; if (!o) return null;
  const f = { face: -1, gate: o.gate, replaces: o.replaces, order: id, cnSkin: skinOf(o.body, o.chapter), eliteName: o.name };
  if (o.affix) f.affix = o.affix;
  return [o.body, o.at[0], o.at[1], f];
}
