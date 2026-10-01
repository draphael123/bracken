/* THE HINT LINES THAT WERE NEVER SHOWN (claude/hintsweep). main.js's number() lets a capital-letter string through only when it is one of the
   MOVE_WORDS; every other one is dropped on purpose (words do not float in play). So a line written as number(x, y, 'HE IS OPEN') was never
   on the screen. The Undead Archmage's realm lines were the first found (claude/archfix); this is the sweep of the rest.
   The lines that TEACH - name an opening, say what to strike or jump, say a way is open - are listed here. number() routes them to callout()
   (main.js), which draws them in the hint box (one line, 1.8 s, never over a longer hint being read). Everything else number() drops is the
   old silent flavour, counted in tools/hint-shown-silent.txt so that no NEW dead line can be added (tools/hint-shown.mjs). */
export const CALL_LINES = new Set([
  /* claude/croucha + crouchb + weakboss (batch49): the crouch twists' feedback and the three reworked bosses' openings */
  'GUARD BREAK', 'HOLDS', 'UNDER THE SHIELD', 'IMPALED', 'BLOOD', 'READY', 'STEADY',
  'HE REACHES FOR YOUR LIGHT', 'FROM THE DARK', 'HOODING IT: STRIKE THE LAMP', 'HE LEAVES ONE BURNING', 'YOUR LIGHT IS OUT: RELIGHT IT AT A LAMP',
  'THE LAMP FLARES', 'BLIND: CUT HIM', 'YOUR LIGHT AGAIN', 'HIS FURROWS WAKE', 'THE SHARE IS IN THE FENCE: CUT HIM', 'THE SHARE IS IN THE TROUGH: CUT HIM',
  'THE FURROWS', 'AND AGAIN', 'MISSED: ITS JAR BREAKS', 'ITS JAR CRACKS: TWO TRICKS AT A TIME', 'IT IS IN THE SMOKE',
  /* claude/fairboss: THE WICKER QUEEN on her carousel - her opening, her read between up and down, the ride quickening (they were never shown before: src/wicker-queen.js said them through number()) */
  'LEAD HER ONTO THE FIRE, THEN FACE HER', 'THE RIDE BRINGS HER TO THE FIRE', 'THE WICKER CATCHES', 'SHE BURNS: CUT HER', 'THE FIRE IS BANKED', 'THE FIRE IS HOT AGAIN',
  'HIGH: DUCK IT', 'THE FLOOR BURNS: RIDE A HORSE', 'HER SPEAR, HIGH: DUCK', 'HER SPEAR, LOW: JUMP', 'FULL DARK: THE RIDE QUICKENS', 'SHE IS ALIGHT: THE RIDE QUICKENS', 'THE CROWNING',
  /* the states that mean "hit him now" / "the ward is down" */
  'OPEN', 'WARDED', 'HE IS OPEN', 'DOUSED - HE IS OPEN', 'HIS HEAD IS UP. HE IS OPEN', 'HER SIDE IS OPEN', 'HER GUARD IS BROKEN',
  'THE GOBLIN QUEEN  OPEN', "THE QUEEN'S LANCE  OPEN", 'THE PALADIN  THE WARD IS DOWN', 'THE RAM LORD  DAZED', 'THE ROC  GROUNDED', 'THE RIMEWRIGHT  THAWED',
  'THE BURIED PRINCE  BAREHEADED', 'THE BURIED PRINCE  IN THE LIGHT', 'THE FORGEMASTER  STUNNED', 'THE FORGEMASTER  SCALDED', 'THE WINDCALLER  HOLD ON',
  /* the openings that say what to do */
  'CUT HIM', 'HIT IT', 'HOLD HIM', 'HIT THE TALON', 'HE IS DOWN: CUT HIM', 'THE BOOK TURNS: CUT HIM', 'HIS HANDS ARE UP: CUT HIM',
  'IN THE MUD: CUT HIM', 'DOWN: CUT HER', 'THE LANCE STICKS: CUT HIM', 'THE POINT STICKS: CUT HIM', 'INTO THE STONE: CUT HER', 'THE RIME RUNS OFF IT: CUT IT',
  'IT FALLS - FINISH IT', 'IT SKIDS: HIT IT', 'IT LANDS: HIT IT', 'IT WHINES: HIT IT', 'INTO THE LANTERN: HIT IT', 'PINNED: HIT IT', 'ON THE GROUND: HIT IT',
  'DAZED: HIT HIM', 'SCALDED: HIT HIM', 'STUCK: JUMP ON IT', 'STRIKE ITS LEVER', 'STRIKE IT AGAIN', 'KILL THE PUPS FAST', 'THE IRON TAKES HALF: JAM HIS DRUM',
  'STUNG: HIS ARMS LIE STILL', 'BEHIND HER GUARD: BRING A GUN TO BEAR', 'THE COLD TAKES YOUR FIRE: A CANDLE AT THE WALL',
  /* the ones that say what to do about a hazard */
  'THE ROD: JUMP', 'LOW: JUMP IT', 'JUMP THE FLOCK', 'FROM BOTH WALLS: JUMP', 'JUMP! AND KEEP JUMPING', 'GET CLEAR', 'GET ABOVE THE ROOTS - AND THE SPORES',
  'GET ABOVE THE ROOTS', 'STAY LOW OR CLIMB', 'LEAVE THE MARKS - SEEDS FALLING', 'LEAVE THE MARKS', 'LOOK UP', 'HURRY!', 'HELP! CUT THE BOARDS!', 'HELP! THE DOOR IS HOT!',
  /* a way that is open */
  'THE FIRE IS OUT - GO', 'IT BURNS DOWN - THE STREET IS OPEN', 'THE HEART OPENS. TAKE THE SPRING.', 'HER CAP JAMS. THE HEART OPENS.', 'THE TOWER BREAKS OPEN AT THE FOOT',
  'THE VAULT OPENS', 'THE CAMP GATE OPENS', 'THE FURNACE OPENS', 'THE HATCH OPENS', 'THE DOOR OPENS', 'THE WAY OPENS', 'A PORTAL OPENS', 'THE GRATE IS UP', 'THE HOIST IS FREE',
  /* claude/puppeteer (PUPPETEER3): THE PUPPETEER's openings and reads (src/puppeteer.js, src/puppeteer-hands.js) */
  'DROP BOTH PUPPETS AND HE COMES DOWN', "HE'S DOWN - STRIKE HIM", 'ONE DOWN: HIS BAR DROPS', 'CUT: THE HARLEQUIN DROPS', 'THE ARM GOES LIMP: NO MORE CHOP OR GRAB',
  'THE BACK GOES LIMP: NO MORE SLAM', 'A STRING PARTS', 'JOLTED: STRIKE HIM', 'OUT OF REACH: DROP HIS PUPPETS FIRST', 'SCENE CHANGE: WATCH THE BOARDS',
  'TOGETHER NOW: HIS SLAM BREAKS THE BOARDS', 'DROP THE KING AND THE HARLEQUIN: HE FALLS',
]);
/* ...and the ones with a count in them (the count is the teaching: how many more) */
export const CALL_COUNTS = [/^THE ROAD COMES UP: \d+ LAMPS$/, /^SAVED \d+ OF \d+$/, /^THE VALVE COOKS: \d+ MORE$/, /^THE GATE TAKES \d+$/];
export const isCallout = txt => typeof txt === 'string' && (CALL_LINES.has(txt) || CALL_COUNTS.some(r => r.test(txt)));
/* what is drawn: the line, with the boss-name double space read as a colon ("THE GOBLIN QUEEN: OPEN") */
export const calloutText = txt => txt.replace(/ {2,}/g, ': ');
