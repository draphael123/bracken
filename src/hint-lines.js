/* THE HINT LINES THAT WERE NEVER SHOWN (claude/hintsweep). main.js's number() lets a capital-letter string through only when it is one of the
   MOVE_WORDS; every other one is dropped on purpose (words do not float in play). So a line written as number(x, y, 'HE IS OPEN') was never
   on the screen. The Undead Archmage's realm lines were the first found (claude/archfix); this is the sweep of the rest.
   The lines that TEACH - name an opening, say what to strike or jump, say a way is open - are listed here. number() routes them to callout()
   (main.js), which draws them in the hint box (one line, 1.8 s, never over a longer hint being read). Everything else number() drops is the
   old silent flavour, counted in tools/hint-shown-silent.txt so that no NEW dead line can be added (tools/hint-shown.mjs). */
import { STUCK_HANDS } from './stuck-spots.js';
import { BK_LINES } from './unburied-foes.js';
export const CALL_LINES = new Set([
  /* claude/slide: the first slope a hero stands on */
  'HOLD DOWN TO SLIDE: FEET FIRST',
  /* claude/weight: the bar hit 0 - EXHAUSTED (src/commit.js): no roll and no guard until it is back to 30% */
  'WINDED: NO ROLL, NO GUARD',
  /* claude/croucha + crouchb + weakboss (batch49): the crouch twists' feedback and the three reworked bosses' openings */
  'GUARD BREAK', 'HOLDS', 'UNDER THE SHIELD', 'IMPALED', 'BLOOD', 'READY', 'STEADY',
  'HE REACHES FOR YOUR LIGHT', 'FROM THE DARK', 'HOODING IT: STRIKE THE LAMP', 'HE LEAVES ONE BURNING', 'YOUR LIGHT IS OUT: RELIGHT IT AT A LAMP',
  'THE LAMP FLARES', 'BLIND: CUT HIM', 'YOUR LIGHT AGAIN', 'HIS FURROWS WAKE', 'THE SHARE IS IN THE FENCE: CUT HIM', 'THE SHARE IS IN THE TROUGH: CUT HIM',
  'THE FURROWS', 'AND AGAIN', 'MISSED: ITS JAR BREAKS', 'ITS JAR CRACKS: TWO TRICKS AT A TIME', 'IT IS IN THE SMOKE',
  /* claude/fairboss: THE WICKER QUEEN on her carousel - her opening, her read between up and down, the ride quickening (they were never shown before: src/wicker-queen.js said them through number()) */
  'LEAD HER ONTO THE FIRE, THEN FACE HER', 'THE RIDE BRINGS HER TO THE FIRE', 'THE WICKER CATCHES', 'SHE BURNS: CUT HER', 'THE FIRE IS BANKED', 'THE FIRE IS HOT AGAIN',
  'HIGH: DUCK IT', 'THE FLOOR BURNS: RIDE A HORSE', 'HER SPEAR, HIGH: DUCK', 'HER SPEAR, LOW: JUMP', 'FULL DARK: THE RIDE QUICKENS', 'SHE IS ALIGHT: THE RIDE QUICKENS', 'THE CROWNING',
  /* claude/fairfix3: her ball, her ribbon sweep, her fires (src/wicker-queen.js, src/main.js wqBallsStep / wqLightPit) */
  /* claude/fairfix4: her ball struck back into her, and THE BONFIRE RING (the ball's line was 'THE WICKER BALL: JUMP IT') */
  'THE WICKER BALL: STRIKE IT BACK', 'STRUCK BACK', 'HER OWN FIRE: SHE CATCHES', 'THE BONFIRE RING: FIND THE GAP',
  'THE RIBBONS SWEEP LOW: JUMP TWICE', 'THE RIBBONS SWEEP HIGH: DUCK', 'THAT FIRE IS SPENT', 'THE BALL RELIGHTS THE FIRE',
  /* the states that mean "hit him now" / "the ward is down" */
  'OPEN', 'WARDED', 'HE IS OPEN', 'DOUSED - HE IS OPEN', 'HIS HEAD IS UP. HE IS OPEN', 'HER SIDE IS OPEN', 'HER GUARD IS BROKEN',
  'THE GOBLIN QUEEN  OPEN', "THE QUEEN'S LANCE  OPEN", 'THE PALADIN  THE WARD IS DOWN', 'THE RAM LORD  DAZED', 'THE ROC  GROUNDED', 'THE RIMEWRIGHT  THAWED',
  'THE BURIED PRINCE  BAREHEADED', 'THE BURIED PRINCE  IN THE LIGHT', 'THE FORGEMASTER  STUNNED', 'THE FORGEMASTER  SCALDED', 'THE WINDCALLER  HOLD ON',
  /* the openings that say what to do */
  'CUT HIM', 'HIT IT', 'HOLD HIM', 'HIT THE TALON', 'HE IS DOWN: CUT HIM', 'THE BOOK TURNS: CUT HIM',
  'IN THE MUD: CUT HIM', 'DOWN: CUT HER', 'THE LANCE STICKS: CUT HIM', 'THE POINT STICKS: CUT HIM', 'INTO THE STONE: CUT HER', 'THE RIME RUNS OFF IT: CUT IT',
  'IT FALLS - FINISH IT', 'IT SKIDS: HIT IT', 'IT LANDS: HIT IT', 'IT WHINES: HIT IT', 'INTO THE LANTERN: HIT IT', 'PINNED: HIT IT', 'ON THE GROUND: HIT IT',
  'DAZED: HIT HIM', 'SCALDED: HIT HIM', 'STUCK: JUMP ON IT', 'STRIKE ITS LEVER', 'STRIKE IT AGAIN', 'KILL THE PUPS FAST', 'THE IRON TAKES HALF: JAM HIS DRUM',
  /* claude/bosswave1: the boss wave's earned openings, told (src/main.js, src/boss-greed.js OPEN_RULE) */
  'HE FALLS: CUT HIM', 'HE RISES ON THE WIND', 'SHE RAPS THE FLOOR: CUT HER', 'NOTHING THERE: CUT HER', 'HE SHAKES IT OFF', 'IT GATHERS ITS GLASS', 'IT SHAKES IT OFF',
  'STUNG: HIS ARMS LIE STILL', 'BEHIND HER GUARD: BRING A GUN TO BEAR', 'THE COLD TAKES YOUR FIRE: A CANDLE AT THE WALL',
  /* the ones that say what to do about a hazard */
  'THE ROD: JUMP', 'LOW: JUMP IT', 'JUMP THE FLOCK', 'FROM BOTH WALLS: JUMP', 'JUMP! AND KEEP JUMPING', 'GET CLEAR', 'GET ABOVE THE ROOTS - AND THE SPORES',
  'GET ABOVE THE ROOTS', 'STAY LOW OR CLIMB', 'LEAVE THE MARKS - SEEDS FALLING', 'LEAVE THE MARKS', 'LOOK UP', 'HURRY!', 'HELP! CUT THE BOARDS!', 'HELP! THE DOOR IS HOT!',
  /* a way that is open */
  'THE FIRE IS OUT - GO', 'IT BURNS DOWN - THE STREET IS OPEN', 'THE HEART OPENS. TAKE THE SPRING.', 'HER CAP JAMS. THE HEART OPENS.', 'THE TOWER BREAKS OPEN AT THE FOOT',
  /* claude/lockkeeper: JENNY GREENTEETH's rules and openings (src/jenny-greenteeth.js, src/jenny-greenteeth-hands.js) */
  'THE BRIGHT WEED HOLDS. THE DARK WEED IS WATER', 'DRAIN THE LOCK WHILE SHE IS AT THE GATE', 'SHE IS STRANDED: CUT HER', 'THE UPPER PADDLE IS RUNNING: SHUT IT FIRST',
  'THE WEED CHOKES THE PADDLE: CUT IT', 'HER HAND IS ON THE PADDLE: STRIKE IT', 'SHE SHUT THE PADDLE', 'SHE LETS GO', 'THE PADDLE IS FREE', 'THE UPPER PADDLE DROPS',
  'THE LOCK FLOODS: SHE HIDES IN THE CULVERTS', 'OPEN THE PADDLE OF HER CULVERT', 'THE CULVERT SPITS HER OUT: CUT HER', 'SHE IS NOT IN THAT CULVERT',
  'THE FOG COMES DOWN: SHE GOES FOR THE LIGHT', 'DROP A LAMP AT A GATE, THEN WORK ITS PADDLE', 'SHE WILL NOT LEAVE THE LIGHT: CUT HER', 'THE LIGHT GOES OUT',
  'STRIKE THE ARM THAT HOLDS YOU', 'THE LAMP IS HOOKED FAST', 'THE WATER TAKES IT: STRAND HER FIRST',
  /* claude/canalfix3: she contests the paddles, fights in her openings, and each phase breaks the last trick */
  'WORK THE PADDLE: SHE COMES FOR YOU', 'SHAKEN OFF THE PADDLE', 'SHE STILL BITES: BLOCK IT OR JUMP IT', 'SHE KNOTTED THE PADDLE YOU USED: CUT IT', 'THE WEED BINDS THE LAMP: CUT IT', 'THE LAMP IS FREE',
  'THE VAULT OPENS', 'THE CAMP GATE OPENS', 'THE FURNACE OPENS', 'THE HATCH OPENS', 'THE DOOR OPENS', 'THE WAY OPENS', 'A PORTAL OPENS', 'THE GRATE IS UP', 'THE HOIST IS FREE',
  /* claude/puppeteer (PUPPETEER3): THE PUPPETEER's openings and reads (src/puppeteer.js, src/puppeteer-hands.js) */
  "HE'S DOWN - STRIKE HIM", 'ONE DOWN: HIS BAR DROPS', 'CUT: THE HARLEQUIN DROPS', 'THE ARM GOES LIMP: NO MORE CHOP OR GRAB',
  'THE BACK GOES LIMP: NO MORE SLAM', 'A STRING PARTS', 'OUT OF REACH: DROP HIS PUPPETS FIRST', 'SCENE CHANGE: WATCH THE BOARDS',
  'TOGETHER NOW: HIS SLAM BREAKS THE BOARDS',
  /* claude/theatre3: the loop rebuilt - a puppet is hurt only while it glows green; both down, his bar goes slack: climb and cut it */
  'DROP BOTH PUPPETS, THEN CUT HIS BAR', 'DROP THE KING AND THE HARLEQUIN, THEN CUT HIS BAR', 'HIS BAR IS SLACK: CLIMB AND CUT IT', 'TOO SLOW: HE STRINGS THEM AGAIN',
  'HIS BAR IS CUT: HE FALLS', 'HIS BAR IS TAUT: DROP BOTH PUPPETS FIRST', 'CLANK: STRIKE A PUPPET WHEN IT GLOWS GREEN', 'STRIKE HIS BAR, NOT HIM',
  /* claude/welltown: THE WELL TOWN's skin, its mud and fire, its windlass and dry cistern, the water-thief (src/well-town-hands.js), and (until claude/welltown3) THE BANDIT KING */
  'YOUR SKIN IS FULL: E POURS, E DRINKS', 'YOUR SKIN IS EMPTY: FILL IT AT A WELL', 'THE MUD GIVES WAY', 'MUD: POUR YOUR SKIN ON IT', 'IT BURNS: POUR YOUR SKIN ON IT',
  'THE SUN LETS GO OF YOU', 'THE SUN IS OUT: DRINK FROM YOUR SKIN (E)', 'HE CUT YOUR SKIN: CATCH HIM', 'THE SIP IS BACK',
  'STRIKE THE WINDLASS: THE BUCKET GOES DOWN', 'THE BUCKET GOES UP', 'THE DRY CISTERN WANTS FOUR WATER-SKINS', 'THE CISTERN FILLS: THE VAULT OPENS',
  'THE BUCKET IS DOWN: STRIKE THE WINDLASS', 'THE WINDLASS IS FOULED: FINISH HIM FIRST', 'THE BUCKET COMES UP: HOLD THE WELL', 'THEY COME DOWN THE WELL AFTER YOU', 'A JAR: ONE SIP',
  /* claude/welltown3: THE CISTERN QUEEN (src/cistern-queen.js, src/cistern-queen-hands.js) and THE GANG LEADER (src/gang-leader.js) */
  'SHE RIGHTS HERSELF', 'FLOODED OUT: SHE IS SOAKED. CUT HER', 'IT RUNS INTO THE SAND',
  'SHE LOSES HER GRIP: ON HER BACK. CUT HER', 'HER STINGER STICKS', 'THE BUCKET COMES DOWN THE SHAFT', 'HER VENOM SLOWS YOUR STAMINA',
  'THE CISTERN FLOODS: HER BROOD COMES', 'STRIKE THE CLAW THAT HOLDS YOU', 'THE GRAB IS BROKEN: SHE REARS. CUT HER', 'HER BROOD: DROWN THEM IN THE SUMP', 'THE DEEP WATER DROWNS HER BROOD',
  'HE IS ALIGHT: CUT HIM', 'HIS OTHER BLADE GUARDS: NOT INTO HIS CUTS', 'OFF BALANCE AFTER HIS BLOWS: CUT HIM THEN', 'STRUCK BACK: IT FLIES HOME', 'THE FLAMES GO OUT', 'HE SLIPS THE BLADE: HIS RIPOSTE COMES', 'HE GOES FASTER: WATCH HIS BOTTLES',
  /* claude/welltown5: THE CISTERN QUEEN's stinger and her fire */
  'HER SHELL TURNS BLADES: HIT HER STINGER, OR FLOOD HER', 'THE SHELL TURNS IT: STRIKE HER STINGER', 'HER STINGER IS STUCK: STRIKE IT', 'SHE TUGS IT FREE',
  'SHE CLIMBS THROUGH THE OIL: HER SHELL BURNS', 'HER SHELL BURNS: PUT HER OUT WITH WATER', 'PUT OUT, AND ON HER BACK: CUT HER', 'PUT OUT: HER SHELL IS COLD. CUT HER', 'SHE FLARES UP: PUT HER OUT AGAIN', 'THE FLOOD PUTS HER FIRE OUT',
  /* claude/welltown5: THE GANG LEADER's water (a puddle trips his dash and puts out his flames; his fire catches you, the skin douses you) */
  /* claude/welltown5: THE DJINN OF THE GREAT WELL (src/djinn.js, src/djinn-hands.js) */
  'THE DJINN OF THE GREAT WELL RISES', 'A BLADE PASSES THROUGH SAND: POUR WATER ON HIM', 'THE SAND TAKES THE BLADE', 'MUD: HE IS SOLID. CUT HIM', 'HE DRIES BACK TO SAND', 'THE MUD CRACKS: HE IS SAND AGAIN',
  'THE SPRINGS REFILL YOUR SKIN', 'HE CATCHES FIRE: DOUSE HIM WITH WATER', 'HIS FIRE TURNS THE BLADE: DOUSE HIM', 'DOUSED: SMOKE AND CLAY. CUT HIM', 'HE FLARES UP: DOUSE HIM AGAIN', 'HE GATHERS HIMSELF',
  'HE TAKES THE WELL: THE WATER RISES - GET UP', 'THE FLOOD DRAGS AT YOU: GET UP ON A LEDGE', 'THE CRANK: DROP THE BUCKET ON HIM', 'THE GREAT BUCKET COMES DOWN', 'THE BUCKET BAILS HIM OUT: CUT HIM',
  'HIS HAND RESTS THERE: STRIKE IT', 'THE SPOUT HOLDS YOU: STRIKE OUT OF IT', 'WATER CANNOT BE CUT: THE BUCKET, OR HIS HAND', 'HE WHIRLS: THE WATER IS FLUNG OFF', 'NO FIRE TO PUT OUT: WAIT FOR HIS FLARE',
  'WET GROUND SLOWS HIM: POUR TO PEN HIM IN', 'MUD: HE STOPS AT ITS EDGE. A DASH SLIPS HIM', 'HE SLIPS: CUT HIM', 'HE SLIPS', 'THE WATER PUTS HIM OUT', 'HE IS ALIGHT: CUT HIM - KEEP THE WATER OFF HIM',
  'YOU CATCH FIRE: E DOUSES YOU', 'THE WATER PUTS YOU OUT', 'THE WELL HEAD REFILLS YOUR SKIN',
  /* claude/combat3: THE GLOBAL BOSS RULE (src/boss-greed.js) - a blow outside his opening is a scratch, and greed is answered */
  'A SCRATCH: WAIT FOR HIS OPENING', 'TOO GREEDY: HE HITS BACK',
  'THE HORN: THE FLOOD IS COMING', 'THE GATE HOLDS THE FLOOD', 'THE GATE IS SHUT: IT HOLDS THE NEXT FLOOD', 'THE GATE IS OPEN', 'RELEASED: THE WATER COMES DOWN', 'THE JAM BREAKS',
  'THE FLOOD TAKES YOU', 'E AT THE WHEEL: SHUT THE GATE, OR RELEASE WHAT IT HOLDS', 'A JAM: ONLY A RELEASED BURST MOVES IT', 'THE WHEEL TURNS WHEN THE WATER RUNS',
  'THE OLD NEST WANTS FOUR FEATHERS', 'THE OLD NEST OPENS', 'THE WATER THROWS HIM: CUT HIM', 'HE SMELLS THE HELD WATER', 'HE IS NOT IN THE CHANNEL: THE WATER IS WASTED', 'THE SPRAY DAMPS YOUR FIRE',
  'HIS SHELL TURNS A BLADE: RELEASE THE DAM ON HIM', 'THE FLOOD TAKES HIM', 'SWEPT AWAY', 'CLIMB THE ROPE: UP',
  /* claude/desertfoes: the fire scorpion's burning patch, the venom scorpion's sting, the sandworm and the flood, the dynamite bandit's fuse (src/desert-foes2-hands.js) */
  'WATER PUTS IT OUT', 'THE PATCH GOES OUT', 'VENOM: YOUR STAMINA COMES BACK SLOWER', 'THE HORN DRIVES IT UNDER', 'THE FLOOD DOUSES THE FUSE',
]);
/* ...and the ones with a count in them (the count is the teaching: how many more) */
/* claude/canalfix3: THE FOG CANAL's NUDGES (Daniel 10-02: "not always clear what you need to do; you get stuck"). When the barge has been held ~10 s and the
   hero has made no headway, one of these names the machine that holds her - never how to work it (the glint over the machine shows where). src/canal-hands.js */
export const CANAL_NUDGE = { gate: 'THE GATE IS SHUT: FIND ITS PADDLE', bridge: 'THE BRIDGE HOLDS HER: FIND ITS CAPSTAN', fog: 'THE FOG HOLDS HER: FIND THE FOGHORN',
  door: 'THE DOOR IS TOO HIGH: THE LOCK UNDER HER IS LOW' };
/* (they go straight to the hint box, src/canal-hands.js H.hint - not through number(), so they are not CALL_LINES) */
export const CALL_COUNTS = [/^THE ROAD COMES UP: \d+ LAMPS$/, /^SAVED \d+ OF \d+$/, /^THE VALVE COOKS: \d+ MORE$/, /^THE GATE TAKES \d+$/];
/* (claude/gorgemodule) THE RED GORGE's NUDGES are data now (src/stuck-spots.js STUCK_HANDS): the hands say them through number() as a variable, so they are routed here, not as CALL_LINES */
export const SPOT_LINES = new Set(Object.values(STUCK_HANDS).flat().flatMap(sp => (sp.steps || [sp]).map(s => s.line || sp.line)));
/* (claude/dk3) THE DEATH KNIGHT's teaching lines - his openings, his coil healing him, his dodge - said through number() as a variable (c.say), so they are routed here, not as CALL_LINES; his tells keep their sound, mark and floor colour */
export const SAY_LINES = new Set(BK_LINES);
export const isCallout = txt => typeof txt === 'string' && (CALL_LINES.has(txt) || SPOT_LINES.has(txt) || SAY_LINES.has(txt) || CALL_COUNTS.some(r => r.test(txt)));
/* what is drawn: the line, with the boss-name double space read as a colon ("THE GOBLIN QUEEN: OPEN") */
export const calloutText = txt => txt.replace(/ {2,}/g, ': ');
