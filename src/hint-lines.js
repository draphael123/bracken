/* THE HINT LINES THAT WERE NEVER SHOWN (claude/hintsweep). main.js's number() lets a capital-letter string through only when it is one of the
   MOVE_WORDS; every other one is dropped on purpose (words do not float in play). So a line written as number(x, y, 'HE IS OPEN') was never
   on the screen. The Undead Archmage's realm lines were the first found (claude/archfix); this is the sweep of the rest.
   The lines that TEACH - name an opening, say what to strike or jump, say a way is open - are listed here. number() routes them to callout()
   (main.js), which draws them in the hint box (one line, 1.8 s, never over a longer hint being read). Everything else number() drops is the
   old silent flavour, counted in tools/hint-shown-silent.txt so that no NEW dead line can be added (tools/hint-shown.mjs). */
import { STUCK_HANDS } from './stuck-spots.js';
import { TELL_LINES } from './minecart.js';
import { FOREMAN_LINES } from './foreman.js';
import { BK_LINES } from './unburied-foes.js';
import { CHAIR_SAY } from './false-abbot.js'; import { HK_SAY } from './hourglass-king.js'; import { AD_SAY } from './flotilla-boss.js'; import { F3_SAY } from './flotilla3.js'; import { PM_SAY } from './powder-monkey.js';   /* (claude/flotilla4) THE POWDER MONKEY's lines */   /* (claude/flotilla3) THE ADMIRAL's lines, said as variables */
import { KG_SAY } from './kitchen-hands.js'; import { GB_SAY } from './grubbag.js'; import { WC_SAY } from './war-cairn-hands.js'; import { BZC_SAY } from './bzchief.js';   /* (claude/warcairn) THE WAR CAIRN's and THE BERSERKER CHIEFTAIN's lines, said as variables */   /* (claude/kitchengate) THE KITCHEN GATE's and LORD GRUBBAG's lines, said as variables */
import { RK_SAY } from './rookery-hands.js'; import { GALE_SAY } from './gale-harpy.js'; import { SS_SAY } from './shriek-sisters.js';   /* (claude/rookery) THE ROOKERY's lines, said as variables */
import { SAY as RM_SAY } from './raptor-matriarch.js';   /* (claude/redgorgerework) THE RAPTOR MATRIARCH's sluice-stun lines, said as variables */   /* (claude/buriedcity3) THE HOURGLASS KING's new moves' words and the great glass's line, said as variables */
import { PW_SAY } from './palisade-hands.js'; import { BB_SAY } from './battering-beast.js';   /* (claude/palisadewood) THE PALISADE WOOD's props and THE BATTERING BEAST's lines, said as variables */
import { TK_SAY } from './tomb-king.js'; import { OT_SAY } from './old-tusker.js'; import { FR_SAY } from './fen-road-hands.js'; import { BT_SAY } from './bog-troll.js'; import { SW_SAY } from './stilt-walker.js'; import { PLANK_SAY } from './fen-planks.js'; import { LEECH_SAY } from './bog-leech.js';   /* (claude/fenroad2) LAY THE ROAD's and THE BOG LEECH's lines, said as variables */   /* (claude/fenroad) THE FEN ROAD's, THE BOG TROLL's and THE STILT-WALKER's lines, said as variables */   /* (claude/oldtusker) OLD TUSKER's lines, said as variables */
import { HR_SAY } from './hanging-ropes.js';   /* (claude/hanging3) CUT IT AND RIDE IT's lines and THE OWL REEVE's rope lines, said as variables */
import { VH_SAY } from './village-hands.js'; import { SPW_SAY } from './sporewood-hands.js';   /* (claude/burning3) THE BURNING VILLAGE 3's soak, burst and falling-debris lines */ import { MC_SAY } from './mother-cap2.js';   /* (claude/sporewood2) SPOREWOOD 2's lantern, puff, spore, seed and knot lines, said as variables */
import { GORM_SAY } from './gorm.js'; import { RB_SAY } from './royal-boar.js';   /* (claude/gorm2) KING GORM 2's and THE ROYAL BOAR's lines, said as variables */ import { STK_SAY } from './stockade-hands.js'; import { KW_SAY } from './kingswood-hands.js';   /* (claude/kingswood2) KINGSWOOD 2's ropes, logs and procession lines, said as variables */   /* (claude/stockade2) THE STOCKADE 2's horn, piles, gate, exam and war-tower lines, said as variables */ import { PO_SAY } from './potion-hands.js'; 
import { LP3_SAY } from './lamplit-fire.js'; import { WK_SAY } from './wickling.js';   /* (claude/lamplit3) THE LAMPLIT STREET 3's fire lines and THE WICKLING's, said as variables */   /* (claude/pyramidboss) THE COFFIN KING's lines, said as variables */
export const CALL_LINES = new Set([
  /* batch126 pre-gate 10-28: lines main.js says that the hint box now shows (the Hurricane's storm call, the sea bell rung), routed as hint-shown requires */
  'THE SUN STAYS: STONES ARE SHADE', 'YOU RING IT', 'TRAY', 'THE BRIDGE DROPS WITH HIM', 'THE BRIDGE DROPS', 'HE CUT IT DOWN', 'IT IS DOWN', 'THE GREAT BELL: THE LAST BLOW', 'IT WAITS FOR THE LAST BLOW',   /* (batch127 integ) abbot3's bridge and bell lines, kitchengate2's attendant tray */
  /* (claude/abbotp2) THE FALSE ABBOT's phase two - how you hurt him: the bridges cut, the chair he takes (the basket is the answer), the spill (src/false-abbot.js CHAIR_SAY, main.js abbotHouseStep) */
  'RIDE HIS BASKET DOWN: THE CHAIR COMES WITH IT',   /* (the cut and the spill are said as variables by false-abbot.js: SAY_LINES) */
  /* (claude/oreroadminor) THE ORE ROAD's minor pass (src/ore-works.js): the lamps you strike and the counterweight lifts - routed as hint-shown requires */
  'LIT: THE STRETCH LIGHTS FOR GOOD', 'ONE ROCK IN: ONE MORE', 'THE WEIGHT TAKES: THE PAN RISES', 'THE ORE TIPS OUT: THE PAN COMES DOWN', 'THE ROCK STAYS OUTSIDE',
  /* (claude/oreroadminor) THE LAUNCHED CARTS (src/ore-works.js, src/ore-carts.js): a shove, a ram, the barricade breaking, a bump too slow, the trip chain */
  'ROLLING', 'FASTER', 'RAMMED', 'THE BARRICADE BREAKS', 'TOO SLOW: BACK UP AND SHOVE IT', 'THE CHAIN PULLS',
  /* (claude/burning3) THE BURNING VILLAGE 3: a burning gate put out - the way is open (main.js putOutHeap), routed as hint-shown requires */
  'THE GATE BURNS DOWN - THE WAY IS OPEN',
  /* (claude/hanging3) THE OWL REEVE REBUILT ON ROPES (src/main.js updateOwl): her perch cut under her, her rope cuts in phase two, all three perches down - routed as hint-shown requires */
  'DOWN WITH HER PERCH: HIT HER', 'SHE GOES FOR THE ROPES', 'SHE CUTS THE ROPE', 'NOWHERE TO SIT',
  /* (claude/marsh3) MARSH WOOD 3's boom (src/marsh3.js, main.js stepCurrentRaft and the lever's say): the raft held, the way open - routed as hint-shown requires */
  'THE BOOM HOLDS HER',
  /* claude/lumbertrail: THE LUMBER TRAIL's felling (src/felling.js) - the first stroke and the fall, routed as hint-shown requires */
  'THE PINE CREAKS AND LEANS', 'THE PINE FALLS: A BRIDGE', 'THE PINE FALLS: A WAY UP', 'TIMBER: IT CRUSHES WHAT STOOD UNDER IT',
  /* (claude/marsh2) THE BULLFROG KING REWORKED (src/frog-king.js): his pond, his grab, the flies, the ripple and the pads - teaching lines, routed as hint-shown requires */
  'THE TONGUE HAS YOU', 'HE BITES HIMSELF', 'THE FLIES ARE ON YOU: LEAD THEM ONTO HIM',
  /* (claude/frogking2) THE PAD CHASE (src/frog-king.js): his leap, the reshuffle, the grab into the water, the wave under a leaf, his pond stirring, the turned and open reads; and THE RAFT IS BACK (main.js recallRafts) */
  'GRABBED: INTO THE WATER', 'HE GATHERS TO LEAP', 'THE PADS RESHUFFLE', 'HIS POND STIRS', 'THE WAVE SINKS YOUR PAD', 'IN THE AIR', 'WINDED', 'THE RAFT IS BACK',
  /* batch101 integ 10-18: THE BELL HOUSINGS (claude/airpockets) - the housing is spent / fills again, routed as hint-shown requires */
  'THE HOUSING IS SPENT', 'THE HOUSING FILLS AGAIN',
  /* batch100 integ 10-18: THE CAPTAIN 2 (claude/hurricane2) - the wave, the lightning, his line and ward, routed as hint-shown requires */
  'KNOCKED FLAT: GRAB A LINE', 'KNOCKED FLAT: CUT HIM', 'STRUCK: CUT HIM', 'YOU HAVE HIS LINE', 'HE IS UP: WARDED', 'HE SHAKES IT OFF: WARDED', 'TURNED: CUT HIM',
  /* (claude/lamplit3) claude/airpockets' bell-housing lines (THE TOLLMASTER's square), routed as hint-shown requires */
  'THE HOUSING FILLS AGAIN', 'THE HOUSING IS SPENT',
  /* batch99 integ 10-18: THE LAMPREEVE and THE TOLLMASTER (claude/lamplit2) - toll, oil, wax and air lines, routed as hint-shown requires */
  'YOU STAND IN THE TOLL', 'THE LAMP KEEPS ITS FLAME', 'TOLL TAKEN', 'SEALED', 'THE WATER RISES INTO THE HOODS', 'THE SQUARE IS FILLING: THE LAMPS ARE YOUR AIR', 'THE BOX IS STRUCK', 'OIL', 'THE OIL FLASK', 'THE OIL GOES UP: STUNNED', 'THE FLARE: STUNNED', 'THE AIR COMES BACK UP THE MAIN', 'THE TOLL GATE LIFTS', 'WAX', 'THE WATER TAKES YOUR FIRE', 'FIRE IN HAND',
  /* batch98 integ 10-17: THE OWL REEVE's lamp and wing-beat lines (claude/owl3) - teaching lines, routed as hint-shown requires */
  'THE DROP', 'WING BEAT: BRACE', 'BONE PELLETS: OFF THE MARKS', 'THE LAMP IS SPENT', 'BLOWN OUT', 'THE WICK SMOKES', 'THE LAMP GOES OUT', 'LAMP LIT',
  /* batch97 integ 10-17: THE BURIED PRINCE's slab-heave and the diggers' winch calls (claude/undercrown2) - teaching lines, routed as hint-shown requires */
  'HE HEAVES AT THE SLAB', 'DIGGERS, TO THE WINCH', 'HIS DIGGERS RISE', 'THE WHOLE ROOF IS COMING DOWN', 'AT THE WINCH', 'GET OFF IT', 'THE DIGGERS PROP IT AGAIN', 'IT SWINGS DOWN', 'IT DROPS FLAT',
  /* claude/slope (batch88 integ): THE RUNNING SLIDE tip (src/run-slide.js), said once - routed so the player can see it */
  'RUNNING SLIDE: LOW, AND UNDER HIGH BLOWS',
  /* claude/burnvillage2: THROW WATER and THE PYROMANCER's stun and steam ward (src/village-water.js) - routed so the player can see them */
  'STUNNED', 'HE WARDS IN STEAM', 'THE JUG', 'THE BUCKET', 'PUT OUT',
  /* claude/underleaf2: UNDERLEAF's sound tools and THE GRANDMOTHER's rework (src/hush-hands.js LINES) */
  'STRUCK FROM BEHIND, A SLEEPER DIES WITHOUT A SOUND', 'A LIGHT IN THE STREET: THE CACHE IS BARRED', 'THE STREET SLEPT: THE CACHE OPENS',
  'THE STREET IS AWAKE: ITS GATE IS DOWN. GO BY THE ROOFS', 'THE BELLMAN RINGS: THE STREET WAKES', 'THE BONE KEY FALLS', 'THE BELL TOLLS: NOTHING HERE IS HEARD',
  'HER BACK: CUT IT', 'SHE KICKS THE CANDLES OVER', 'THE BOARDS CREAK UNDER YOU', 'SHE RINGS FOR THE VILLAGE', 'THE KNELL: JUMP THE BOARDS', 'THE CHIMES ARE LOST IN THE BELL',
  /* claude/batch81 integ: teaching/plate lines the lanes (unburiedsecret, scree2, homunculus, owl2, winch5, unburied) added without routing them - routed here, as hint-shown requires */
  'LOST BANNER ', 'THE FIELD REMEMBERS', 'THE RAM LORD  STUNNED', 'THE RAM LORD  IN THE WALL', 'THE RAM LORD  WARDED', 'JAR TURNS IT', 'UP TO THE BOUGH', 'SHE GOES FOR A LAMP', 'TALONS: DUCK', 'HEAD HIGH: DUCK', 'THE BOUGH: OUT FROM UNDER', 'SHE TAKES THE LAMP', 'THE OIL: OUT OF ITS LINE', 'HORN SWEEP: JUMP IT', 'BURIED', 'A ROCK: ATTACK THROWS IT', 'A BLOW: YOU DROP THE ROCK',
  /* claude/crusader: THE CRUSADER's brand, grab and delayed overhead - routed here (batch82 integ), as hint-shown requires */
  'HE TAKES UP THE BRAND', 'TOO EARLY: AT THE GLINT', 'BRANDED', 'THE BRAND: OVER THE FIRE', 'SEIZED', 'HE GRASPS AIR: STRIKE', 'HURLED DOWN',
  /* claude/monastery2: THE TEMPLE GUARDIAN reworked (src/temple-guardian.js LINES) - its keys, its ward, its blocks, its toll */
  'THE NOTE STAGGERS IT: CUT IT', 'THE STONE STAGGERS IT: CUT IT', 'IT WARDS ITSELF', 'IT RAISES STONE: TAKE ONE (INTERACT)', 'ATTACK THROWS THE STONE', 'IT HURLS ITS STONE', 'THE BELLS SWING',
  'THE BELL IS SWINGING', 'IT IS NOT UNDER THE BELL', 'IT RAISES STONE', 'THE GUARDIAN WAKES FULLY', 'THE STAIR GOES OUT FROM UNDER HIM', 'THE OFFERING COMES DOWN',
  /* claude/windcaller4: THE WINDCALLER 4 - he attacks only in the still; three blows and he falls; the gust hurl, the dust devil (ride it), the downdraft, the gale blades; the pit's wind */
  'HE ATTACKS ONLY IN THE STILL', 'HE CALLS THE WIND: BRACE', 'A DOWNDRAFT: STEP OUT OF THE RING', 'A DUST DEVIL: JUMP INTO IT TO RIDE', 'GUST HURL: JUMP IT OR BRACE', 'THREE BLOWS: HE FALLS - CUT HIM', 'HE REELS', 'HE TOTTERS: ONE MORE',
  'THE PIT WIND THROWS YOU OUT', 'YOU RIDE THE DEVIL UP', 'THE DEVIL LIFTS YOU', 'GALE BLADES: DUCK THE HIGH, JUMP THE LOW',
  /* claude/windcaller3: THE WINDCALLER 3 - the phases change the wind, his blast, his step away, the gale home, the falling ledge, and his opening */
  'THE WIND TURNS: READ THE FLAGS', 'THE STORM: THE EAST LEDGE GIVES', 'HE GATHERS THE WIND: STEP BACK', 'THE GALE TAKES YOU HOME', 'THE LEDGE FALLS', 'HIS OWN BOLT: HE FALLS - CUT HIM',
  /* claude/moorpyro: fire sends his bolt home (the pyromancer's answer to him) */
  'HIS BOLT BURNS HOME: HE FALLS - CUT HIM', 'YOUR FIRE SENDS HIS BOLT HOME',
  /* claude/moorpass: the ranger's snatch, the paladin's aegis, the Blood Knight's ward let go send his bolt home too */
  'HIS BOLT GOES HOME: HE FALLS - CUT HIM', 'SNATCH HIS BOLT: IT FLIES HOME', 'YOUR AEGIS SENDS HIS BOLT HOME', 'LET THE WARD GO AS HIS BOLT LANDS',
  /* claude/survival2: the manual flask and the exam spikes (src/main.js drinkFlask, shrine break, SV.examAt) - routed so the player can see them */
  'NO FLASKS', 'FULL', 'SPILLED', 'SHRINE BROKEN  +1 FLASK', 'THE SPIKES KILL HERE',
  /* claude/flasks2: STEADY HAND kept the flask through a blow (src/main.js spillFlask) */
  'STEADY HAND',
  /* claude/slide: the first slope a hero stands on */
  'HOLD DOWN TO SLIDE: FEET FIRST',
  /* claude/weight: the bar hit 0 - EXHAUSTED (src/commit.js): no roll and no guard until it is back to 30% */
  'WINDED: NO ROLL, NO GUARD',
  /* claude/croucha + crouchb + weakboss (batch49): the crouch twists' feedback and the three reworked bosses' openings */
  'GUARD BREAK', 'HOLDS', 'UNDER THE SHIELD', 'IMPALED', 'READY', 'STEADY',
  'HE REACHES FOR YOUR LIGHT', 'FROM THE DARK', 'HOODING IT: STRIKE THE LAMP', 'HE LEAVES ONE BURNING', 'YOUR LIGHT IS OUT: RELIGHT IT AT A LAMP',
  'THE LAMP FLARES', 'BLIND: CUT HIM', 'YOUR LIGHT AGAIN', 'HIS FURROWS WAKE', 'THE SHARE IS IN THE FENCE: CUT HIM', 'THE SHARE IS IN THE TROUGH: CUT HIM',
  'THE FURROWS', 'AND AGAIN', 'MISSED: ITS JAR BREAKS', 'ITS JAR CRACKS: TWO TRICKS AT A TIME', 'IT IS IN THE SMOKE',
  /* claude/fairboss: THE WICKER QUEEN on her carousel - her opening, her read between up and down, the ride quickening (they were never shown before: src/wicker-queen.js said them through number()) */
  'LEAD HER ONTO THE FIRE, THEN FACE HER', 'THE RIDE BRINGS HER TO THE FIRE', 'THE WICKER CATCHES', 'SHE BURNS: CUT HER', 'THE FIRE IS BANKED', 'THE FIRE IS HOT AGAIN',
  'HIGH: DUCK IT', 'THE FLOOR BURNS: RIDE A HORSE', 'HER SPEAR, HIGH: DUCK', 'HER SPEAR, LOW: JUMP', 'FULL DARK: THE RIDE QUICKENS', 'SHE IS ALIGHT: THE RIDE QUICKENS', 'THE CROWNING',
  /* claude/fairfix3: her ball, her ribbon sweep, her fires (src/wicker-queen.js, src/main.js wqBallsStep / wqLightPit) */
  /* claude/fairfix4: her ball struck back into her, and THE BONFIRE RING (the ball's line was 'THE WICKER BALL: JUMP IT') */
  'THE WICKER BALL: STRIKE IT BACK', 'STRUCK BACK', 'HER OWN FIRE: SHE CATCHES', 'THE BONFIRE RING: FIND THE GAP',
  /* claude/fairfix5: every fire attack sets HERSELF alight (src/wicker-queen.js selfAlight) */
  'HER OWN FIRE CAUGHT HER: CUT HER',
  'THE RIBBONS SWEEP LOW: JUMP TWICE', 'THE RIBBONS SWEEP HIGH: DUCK', 'THAT FIRE IS SPENT', 'THE BALL RELIGHTS THE FIRE',
  /* claude/unburiedart: the field's second engine and the tower's bridge */
  'THE SKEIN LETS GO', "THE BOWMEN'S PALISADE SPLINTERS", 'THE ROPE PARTS: THE DRAWBRIDGE RUNS DOWN', 'THE DRAWBRIDGE LANDS ON THE WALL-WALK',
  /* (claude/sweep2 gap-closer) THE WAYMEET PALADIN'S LEAP: its tell (off the red ring) and his whiff (the ward down beside you) */
  'HE LEAPS: GET OFF THE RING', 'HE OVERREACHED: STRIKE',
  /* the states that mean "hit him now" / "the ward is down" */
  'OPEN', 'WARDED', 'HIS TAIL: JUMP IT, AND AGAIN', 'HE IS OPEN', 'HER SIDE IS OPEN', 
  'THE POTION MASTER  OPEN', 'THE POTION MASTER  RED CAULDRON', 'THE POTION MASTER  BLUE BUBBLES', 'THE POTION MASTER  GREEN BRAMBLE',   /* (batch122, underleaf) her boss-name banner by phase */
  'THE GOBLIN QUEEN  OPEN', "THE QUEEN'S LANCE  OPEN", 'THE CRUSADER  THE WARD IS DOWN', 'THE CRUSADER  HIS OATH', 'THE CRUSADER', 'THE ROC  GROUNDED', 'THE RIMEWRIGHT  THAWED',
  'THE BURIED PRINCE  BAREHEADED', 'THE BURIED PRINCE  IN THE LIGHT', 'THE FORGEMASTER  STUNNED', 'THE FORGEMASTER  SCALDED', 'THE WINDCALLER  HOLD ON',
  /* the openings that say what to do */
  'CUT HIM', 'HIT IT', 'HIT THE TALON', 
  'IN THE MUD: CUT HIM', 'DOWN: CUT HER', 'THE POINT STICKS: CUT HIM', 'INTO THE STONE: CUT HER', 'THE RIME RUNS OFF IT: CUT IT',
  'IT FALLS - FINISH IT', 'IT SKIDS: HIT IT', 'IT LANDS: HIT IT', 'IT WHINES: HIT IT', 'INTO THE LANTERN: HIT IT', 'PINNED: HIT IT', 'ON THE GROUND: HIT IT',
  'DAZED: HIT HIM', 'SCALDED: HIT HIM', 'STUCK: JUMP ON IT', 'STRIKE ITS LEVER', 'STRIKE IT AGAIN', 'KILL THE PUPS FAST', 'THE BOUGHS: GET CLEAR', 'HIS WARD: HE SHAKES IT OFF',
  /* claude/bosswave1: the boss wave's earned openings, told (src/main.js, src/boss-greed.js OPEN_RULE) */
  'HE FALLS: CUT HIM', 'HE RISES ON THE WIND', 'SHE RAPS THE FLOOR: CUT HER', 'HE SHAKES IT OFF', 'IT GATHERS ITS GLASS', 'IT SHAKES IT OFF', 'HE GATHERS HIMSELF', 'THE GATE HAS HIM: CUT HIM', 'HE DRAGS HIMSELF OUT', 'THE RUNE TURNS HIM OVER', 'THE GRATE COMES DOWN ON HER',   /* (claude/bosswave2) a mini's opening shut after a third of him (src/boss-greed.js miniCap) */
  'STUNG: HIS ARMS LIE STILL', 'HIS ARM FALLS - CLIMB IT', 'THE COLD TAKES YOUR FIRE: A CANDLE AT THE WALL',
  /* the ones that say what to do about a hazard */
  'LOW: JUMP IT', 'JUMP THE FLOCK', 'FROM BOTH WALLS: JUMP', 'JUMP! AND KEEP JUMPING', 'GET CLEAR', 
  'LOOK UP', 'HURRY!', 'HELP! CUT THE BOARDS!', 'HELP! THE DOOR IS HOT!',
  /* a way that is open */
  'THE FIRE IS OUT - GO', 'IT BURNS DOWN - THE STREET IS OPEN', 'THE TOWER BREAKS OPEN AT THE FOOT',
  /* claude/lanterneater: THE LANTERN-EATER on the raft (src/lantern-eater.js, src/lantern-eater-hands.js) - its lights, its key, its openings, its tells, the lantern.
     (JENNY GREENTEETH's lines went with her to src/benched/: nothing says them now) */
  'SOMETHING VAST MOVES UNDER THE RAFT', 'TWO LIGHTS: THE LAMP FLICKERS. THE LURE SWAYS: HIT IT HIGH', 'THE LURE IS ITS WEAK POINT: JUMP AND STRIKE, OR UP AND STRIKE',
  'THE LURE IS SNAGGED: CUT IT', 'IT JERKS ON ITS STALK: AGAIN, BEFORE IT BITES', 'ITS MOUTH IS UNDER THE LURE: GET OUT FROM UNDER IT', 'IT DRAWS BACK: WARDED A MOMENT', 'THAT IS A LAMP: IT FLICKERS. THE LURE SWAYS',
  'TOO LOW: STRIKE THE LURE HIGH - JUMP, OR UP AND STRIKE', 'TOO HIGH: SWEEP ITS GUMS LOW - DOWN AND STRIKE', 'THAT OPENING IS SPENT: IT TEARS FREE',
  'IT SURFACES BESIDE THE RAFT: HIT ITS GUMS LOW', 'ITS GUMS AT THE RAIL: SWEEP THEM LOW', 'THE SNAP: STEP OUT AND ITS TEETH STICK IN THE RAFT', 'ITS TEETH ARE IN THE TIMBER: CUT IT',
  'IT SNUFFS EVERY LAMP: YOUR LANTERN IS THE ONLY LIGHT', 'IT HUNTS YOUR LIGHT: LEAVE THE LANTERN, OR DIM IT', 'THE LURE COMES TO YOUR LIGHT: HIT IT HIGH',
  'YOUR LANTERN IS DIM: IT HUNTS THE COPIES', 'YOUR LIGHT IS UP: THE LURE COMES TO IT - SO DOES IT', 'RAISE YOUR LIGHT: THE LURE COMES ONLY TO A LIT LANTERN', 'IT PASSES UNDER THE RAFT: JUMP THE SWELL',
  'THE VAULT OPENS', 'THE CAMP GATE OPENS', 'THE FURNACE OPENS', 'THE HATCH OPENS', 'THE DOOR OPENS', 'THE WAY OPENS', 'A PORTAL OPENS', 'THE GRATE IS UP', 'THE HOIST IS FREE',
  /* claude/puppeteer (PUPPETEER3): THE PUPPETEER's openings and reads (src/puppeteer.js, src/puppeteer-hands.js) */
  'ONE DOWN: HIS BAR DROPS', 'CUT: THE HARLEQUIN DROPS', 'THE ARM GOES LIMP: NO MORE CHOP OR GRAB',
  'THE BACK GOES LIMP: NO MORE SLAM', 'A STRING PARTS', 'OUT OF REACH: DROP HIS PUPPETS FIRST', 'SCENE CHANGE: WATCH THE BOARDS',
  'TOGETHER NOW: HIS SLAM BREAKS THE BOARDS',
  /* claude/theatre3: the loop rebuilt - a puppet is hurt only while it glows green; both down, his bar goes slack: climb and cut it */
  'TOO SLOW: HE STRINGS THEM AGAIN', 'STRINGS TAUT: STRIKE A PUPPET WHEN ITS STRINGS GO SLACK',   /* (claude/theatre4: the shared read - slack strings and a gold outline, was 'glows green') */
  /* claude/puppeteer2: the lever chained until both are down, the visit (he reels on the gallery, then throws you down), his two slow attacks, the four scenes */
  'DROP BOTH PUPPETS: THE LEVER FREES', 'THE MASTERPIECE: DROP IT AND THE HARLEQUIN', 'THE LEVER IS FREE: RIDE UP TO HIM', 'THE LEVER IS CHAINED: DROP BOTH PUPPETS',
  'HE REELS: STRIKE HIM', 'HE THROWS YOU OFF THE GALLERY', 'THE SCENE SHIFTS', 'THE SNARE LINE, LOW: JUMP IT', 'THE SNARE LINE, HIGH: DUCK IT',
  'THE WIND RISES: HOLD DOWN TO BRACE', 'THE TRAPS GLOW: STAND BETWEEN THEM', 'A WAVE IN THE WINGS: JUMP IT', 'IN THE DARK: STRIKE IT IN THE LIGHT',
  /* claude/welltown: THE WELL TOWN's skin, its mud and fire, its windlass and dry cistern, the water-thief (src/well-town-hands.js), and (until claude/welltown3) THE BANDIT KING */
  'YOUR SKIN IS FULL: E POURS, E DRINKS', 'YOUR SKIN IS EMPTY: FILL IT AT A WELL', 'THE MUD GIVES WAY', 'MUD: POUR YOUR SKIN ON IT', 'IT BURNS: POUR YOUR SKIN ON IT',
  'THE SUN LETS GO OF YOU', 'THE SUN IS OUT: DRINK FROM YOUR SKIN (E)', 'HE CUT YOUR SKIN: CATCH HIM', 'THE SIP IS BACK',
  'STRIKE THE WINDLASS: THE BUCKET GOES DOWN', 'THE BUCKET GOES UP', 'THE DRY CISTERN WANTS FOUR WATER-SKINS', 'THE CISTERN FILLS: THE VAULT OPENS',
  'THE BUCKET IS DOWN: STRIKE THE WINDLASS', 'THE WINDLASS IS FOULED: FINISH HIM FIRST', 'THE BUCKET COMES UP: HOLD THE WELL', 'THEY COME DOWN THE WELL AFTER YOU', 'A JAR: ONE SIP',
  /* claude/welltown3: THE CISTERN QUEEN (src/cistern-queen.js, src/cistern-queen-hands.js) and THE GANG LEADER (src/gang-leader.js) */
  'SHE RIGHTS HERSELF', 'IT RUNS INTO THE SAND',
  'HER STINGER STICKS', 'THE BUCKET COMES DOWN THE SHAFT', 'HER VENOM SLOWS YOUR STAMINA',
  'THE CISTERN FLOODS: THE WALL OF THE SHAFT GIVES', 'VENOM BLOOM: OUT OF THE RING BEFORE IT BLOOMS',   /* (claude/queen4, Daniel 10-07: the venom bloom for the death roll; no brood in her fight) */ 'STRIKE THE CLAW THAT HOLDS YOU', 'THE GRAB IS BROKEN: SHE REARS. CUT HER', 
  'HE IS ALIGHT: CUT HIM', 'HIS OTHER BLADE GUARDS: NOT INTO HIS CUTS', 'OFF BALANCE AFTER HIS BLOWS: CUT HIM THEN', 'STRUCK BACK: IT FLIES HOME', 'THE FLAMES GO OUT', 'HE SLIPS THE BLADE: HIS RIPOSTE COMES', 'HE GOES FASTER: WATCH HIS BOTTLES',
  /* claude/welltown5: THE CISTERN QUEEN's stinger and her fire */
  'HER STINGER IS STUCK: STRIKE IT', 'SHE TUGS IT FREE',
  /* claude/underwell3 (Daniel 10-07): her STINGER is her weak spot; THE STINGER SLAM; fire on her oil SCORCHES her; water where she comes up SLIPS her; her hall's oil and torches come back */
  'HER STINGER: THAT IS WHERE SHE BLEEDS', 'STINGER SLAM: OFF THE RED RING, THEN CUT IT', 
  'THE OIL SEEPS BACK: A TORCH LIGHTS IT AGAIN', 'HER TORCH BURNS AGAIN: TAKE IT',
  
  /* claude/cqueenrework (Daniel 10-13): THE CISTERN QUEEN's loop - HOT (fire), DOUSED (water), STEAM (both, in order); THE WELLHEAD her perch; her stinger armoured, its purse, BROKEN, MOULTED */
  'ON THE WELLHEAD: DROP THE BUCKET, OR CLIMB TO HER', 'SHE IS WET: THE FIRE WILL NOT TAKE HER', 'HER SHELL IS BLACKENED: NOT YET', 'SHE TAKES TO HER WALLS AND THE WELLHEAD', 'SHE BURNS OUT: HER SHELL BLACKENS', 
  /* claude/cisternqueen3 (Daniel 10-14 "unclear"): THE CISTERN QUEEN's three rules, said where they are used - STRIKE THE STINGER, SET HER ALIGHT (she thrashes, sags), SHE SURFACES: THROW WATER (a jar) */
  'STRIKE THE STINGER', 'HER SHELL TURNS IT: STRIKE THE STINGER', 'SET HER ALIGHT: SHE FALLS', 'SET ALIGHT: SHE THRASHES', 'THE FIRE DRIVES HER UP: SHE BURNS', 'YOUR FIRE TAKES HER: SHE BURNS',
  'SHE SAGS: HER TAIL DROOPS. STRIKE THE STINGER', 'HER SHELL COOLS: FIRE TAKES HER AGAIN', 'SHE SURFACES: THROW WATER', 'A SPLASH: THROW AS SHE SURFACES', 'E TAKES A JAR: THROW IT AS SHE SURFACES',
  'SHE SLIPS ONTO HER BACK: STRIKE THE STINGER', 'SHE LOSES HER GRIP: ON HER BACK. STRIKE THE STINGER', 'FLOODED OUT: SHE IS SOAKED. STRIKE THE STINGER',
  /* claude/welltown5: THE GANG LEADER's water (a puddle trips his dash and puts out his flames; his fire catches you, the skin douses you) */
  /* claude/welltown5: THE DJINN OF THE GREAT WELL (src/djinn.js, src/djinn-hands.js) */
  'THE DJINN OF THE GREAT WELL RISES', 'A BLADE PASSES THROUGH SAND: POUR WATER ON HIM', 'THE SAND TAKES THE BLADE', 'MUD: HE IS SOLID. CUT HIM', 'HE DRIES BACK TO SAND', 'THE MUD CRACKS: HE IS SAND AGAIN',
  'THE SPRINGS REFILL YOUR SKIN', 'HE CATCHES FIRE: DOUSE HIM WITH WATER', 'HIS FIRE TURNS THE BLADE: DOUSE HIM', 'DOUSED: SMOKE AND CLAY. CUT HIM', 'HE GATHERS HIMSELF',
  'HE TAKES THE WELL: THE WATER RISES', 'STRIKE OR E AT THE WINDLASS OR CRANK: WIND UP, THEN DROP', 'THE GREAT BUCKET COMES DOWN', 'THE BUCKET BAILS HIM OUT: WADE IN AND CUT HIM',
  'HIS HAND RESTS THERE: STRIKE IT', 'THE SPOUT HOLDS YOU: STRIKE OUT OF IT', 'WATER CANNOT BE CUT: THE BUCKET, OR HIS HAND',
  /* claude/djinn2: his WARD after every opening, his new moves, the last seal */
  'THE SAND HARDENS: WATER RUNS OFF HIM', 'HE FLARES WHITE-HOT: STAND BACK', 'A SHROUD OF WATER SPINS ROUND HIM', 'HIS WARD FALLS', 'THE SAND HARDENS: THE WATER RUNS OFF', 'WHITE-HOT: THE WATER HISSES AWAY',
  'HIS SHROUD TURNS THE BUCKET', 'HIS WARD TURNS THE BLADE: WAIT IT OUT', 'SAND SPEARS: THE GLOW UNDER YOU - MOVE', 'A FIRE DEVIL: JUMP IT OR GET UP', 'THE WELL TURNS: WADE AGAINST IT', 'THE LAST SEAL BREAKS',
  /* claude/djinn3: THE TIDE, the blow from below, the two-step bail (src/djinn.js) */
  'BUBBLES UNDER YOU: HE STRIKES FROM BELOW', 'HE DRAWS UNDER THE SHAFT: DROP THE BUCKET', 'THE BUCKET WINDS UP: STRIKE OR E AGAIN TO DROP IT', 'THE BUCKET HANGS READY: DROP IT WHEN HE IS UNDER THE SHAFT',
  'IT MISSES: HE WAS NOT UNDER THE SHAFT', 'THE WELL SURGES: THE LEDGES GO UNDER', 'THE WATER FALLS BACK: THE LEDGES ARE DRY',
  /* claude/djinn4: THE PAIL - scoop it in the flood, throw it into his core when he rears up: he chokes */
  'THE PAIL IS FULL: E THROWS IT AT HIM', 'HE REARS UP: THROW THE PAIL INTO HIS CORE', 'HE CHOKES: CUT HIM', 'HE GETS HIS BREATH BACK',
  'IT SPLASHES OFF HIM: THROW WHEN HE IS UP', 'HIS SHROUD TURNS THE PAIL', 'SCOOP IT IN THE FLOOD',
  /* claude/djinn5: the pail any time he is up - he reels */
  'THE PAIL HITS HIM: HE REELS. CUT HIM', 'A PAIL FLOATS UP, FULL: E THROWS IT AT HIM', 'THE PAIL FILLS ITSELF AGAIN',   /* (claude/djinn6) */
  /* claude/djinn3: THE STEAM WORKS' vents and THE LESSER DJINN (src/well-town-hands.js, src/lesser-djinn-hands.js) */
  'CAPPED: THE VENT HISSES, AND HOLDS', 'THE BELLOWS IS CAPPED: GO, BEFORE IT BLOWS', 'STEAM UNDER THE WATER: GO WHEN THE BUBBLES STOP', 'THE VENT BURNS: WAIT FOR IT, OR POUR ON IT', 'THE BELLOWS NEVER STOPS: POUR ON IT',
  'A SAND SPIRIT: A BLADE PASSES THROUGH. POUR ON IT', 'A FIRE SPIRIT: ITS FIRE TURNS A BLADE. DOUSE IT', 'IT WHIRLS UP AGAIN', 'SAND: THE BLADE PASSES THROUGH. POUR ON IT', 'ITS FIRE TURNS THE BLADE: DOUSE IT', 'MUD: IT FALLS. CUT IT', 'DOUSED: CLAY AND SMOKE. CUT IT',
  /* claude/djinn2: THE BINDING WORKS and THE BANDIT MYSTICS (src/well-town-hands.js, src/bandit-mystic-hands.js) */
  'THE GROUND SHAKES: SOMETHING STIRS BELOW', 'THE LAMP WARDS IT: HALF A BLOW', 'THE LAMP FALLS: E TAKES IT, ATTACK THROWS IT', 'ATTACK THROWS THE LAMP', 'THE LAMP GOES OUT: THEIR WARD IS GONE',
  'THE LAMP BURSTS: IT BURNS THEM', 'THE LAMP BURSTS', 'HIS LAMP WARDS THEM: POUR ON IT, OR KILL HIM', 'BANDIT MYSTICS: THEY CHANT TO FREE HIM', 'THE LAMP FALLS FROM YOUR HANDS',
  'WET GROUND SLOWS HIM: POUR TO PEN HIM IN', 'MUD: HE STOPS AT ITS EDGE. A DASH SLIPS HIM', 'HE SLIPS: CUT HIM', 'HE SLIPS', 'THE WATER PUTS HIM OUT', 'HE IS ALIGHT: CUT HIM - KEEP THE WATER OFF HIM',
  'YOU CATCH FIRE: E DOUSES YOU', 'THE WATER PUTS YOU OUT', 'THE WELL HEAD REFILLS YOUR SKIN',
  /* claude/combat3: THE GLOBAL BOSS RULE (src/boss-greed.js) - a blow outside his opening is a scratch, and greed is answered */
  'A SCRATCH: HIT HIM IN HIS OPENING', 'TOO GREEDY: HE HITS BACK',
  'THE HORN: THE FLOOD IS COMING', 'THE GATE HOLDS THE FLOOD', 'THE GATE IS SHUT: IT HOLDS THE NEXT FLOOD', 'THE GATE IS OPEN', 'RELEASED: THE WATER COMES DOWN', 'THE JAM BREAKS',
  'THE FLOOD TAKES YOU', 'E AT THE WHEEL: SHUT THE GATE, OR RELEASE WHAT IT HOLDS', 'A JAM: ONLY A RELEASED BURST MOVES IT', 'THE WHEEL TURNS WHEN THE WATER RUNS',
  /* claude/redgorge2: THE RAPTOR MATRIARCH (src/raptor-matriarch.js and its hands), THE RAPIDS and THE GORGE CLIMB (src/red-gorge-hands.js) */
  'SHE TAKES TO THE CANYON WALLS', 'THE DAM CRACKS: GET TO THE PILLARS', 'SHE HATES THE WATER: SHE MAKES FOR THE ROCK',
  "THE CHANNEL FLOODS: THE DAM'S TIMBERS FLOAT UP", 'THE DAM BANKS THE FLOOD: THE SLUICES ARE FULL', 'HER WARD: SHE SHAKES IT OFF', 'SHE PERCHES ON THE ROPE BRIDGE', "SHE SCREECHES: HER BROOD, AND THE RAPIDS' DEBRIS",
  'HER BROOD COMES OFF THE WALLS', 'THE NARROW TOP THROWS HER: STRIKE', 'SHE SKIDS: HER GUARD IS DOWN', 'SHE SLAMS INTO THE ROCK: STUNNED', 'THE NARROW PILLAR THROWS HER', 'SHE FINDS HER FOOTING ON THE BROAD ROCK',
  'SHE FALLS INTO THE WATER: STAGGERED', 'THE ROPES PART: SHE IS TANGLED IN THE BRIDGE', 'OLD PLUME, MOTHER OF THE GORGE', 'THE CURRENT THROWS YOU BACK ON THE ROCK', 'THE ROPES PART',
  'THE ROPES HOLD: STRIKE IT WHILE SHE IS ON IT', 'THE SLUICE OPENS: THE WATER COMES', 'THE SLUICE IS EMPTY: THE NEXT FLOOD FILLS IT', 'SHE GATHERS HERSELF',
  'THE STOOP KNOCKS YOU INTO THE RIVER', 'THE STOOP KNOCKS YOU OFF THE BASKET', 'THE WATER DAMPS YOUR FIRE', 'UNDER HER TALONS', 'SHE COMES DOWN OFF THE WALL: HER GUARD IS DOWN',   /* (the fix pass's three lines, routed in the art pass) */
  'SHE FOLLOWS YOUR ROLL', 'SHE CALLS HER YOUNG OFF THE NEST', 'SHE RIDES THE SURGE: WATCH THE FOAM', 'HER YOUNG ARE DOWN: SHE DROPS TO THEM', 'HER YOUNG FLY HOME',   /* (claude/matriarch2: the three new moves) */
  'THE OLD NEST WANTS FOUR FEATHERS', 'THE OLD NEST OPENS', 'THE WATER THROWS HIM: CUT HIM', 'HE SMELLS THE HELD WATER', 'HE IS NOT IN THE CHANNEL: THE WATER IS WASTED', 'THE SPRAY DAMPS YOUR FIRE',
  'HIS SHELL TURNS A BLADE: RELEASE THE DAM ON HIM', 'THE FLOOD TAKES HIM', 'SWEPT AWAY', 'CLIMB THE ROPE: UP',
  /* claude/desertfoes: the fire scorpion's burning patch, the venom scorpion's sting, the sandworm and the flood, the dynamite bandit's fuse (src/desert-foes2-hands.js) */
  'WATER PUTS IT OUT', 'THE PATCH GOES OUT', 'VENOM: YOUR STAMINA COMES BACK SLOWER', 'THE HORN DRIVES IT UNDER', 'THE FLOOD DOUSES THE FUSE',
  /* claude/moor2: GALE MOOR's WIND ROCKS and GOBLIN SCAFFOLDS (src/moor-rocks-hands.js) - the crevice's throw, the wind that takes a struck goblin, the frame */
  'THE CREVICE THROWS YOU UP', 'THE WIND TAKES HIM', 'IT SWAYS BACK: IT WANTS THE GUST', 'THE WIND LAYS THE FRAME OVER THE GAP',
  /* claude/underwell: THE UNDERWELL's oil, torches, great lamp, nests, drips, ropes, fountain and its four scorpions (src/underwell-hands.js); a drip (src/well-town-hands.js) */
  'THE OIL CATCHES', 'WET OIL: IT WILL NOT CATCH', 'THE OIL FIRE GOES OUT', 'THE FOUNTAIN RUNS: ITS VAULT OPENS', 'THE DRY FOUNTAIN WANTS THREE BRASS TAPS',
  'THE BROOD WILL NOT CROSS FIRE', 'THE HEAT DRIVES IT UNDER', 'IT LEAVES A SLICK OF OIL', 'GRIT IN YOUR EYES', 'ITS DUST SMOTHERS THE FIRE', 'IT DRINKS FROM YOUR SKIN', 'IT SMELLS THE WATER IN YOUR SKIN',
  'THE GREAT LAMP FALLS: THE HALL BURNS', 'THE NEST BURNS AWAY', 'THE FIRE BOILS THE DRIP DRY', 'THE ROPE BURNS TO ASH', 'ITS FIRE TAKES THE OIL',
  /* claude/underwell2: the torch you TAKE (E) and THROW (ATTACK, the told arc), the lamp's chain, the ropes, the three new reskins (src/underwell-hands.js) */
  'A TORCH: E TAKES IT, ATTACK THROWS IT ON THE OIL', 'ATTACK THROWS IT: UP LOBS IT, DOWN TOSSES IT SHORT', 'E TAKES THE TORCH OUT OF ITS CRESSET', 'THE TORCH IS IN THE OIL: TAKE IT UP OR GET OUT',
  'THE TORCH FALLS FROM YOUR HAND', 'THE WATER PUTS YOUR TORCH OUT', 'THE WATER PUTS IT OUT', 'THE TORCH SETS THE NEST ALIGHT', 'THE BROOD SHY FROM YOUR TORCH', 'A TORCH NEEDS YOUR HAND: THROW IT OR SET IT DOWN',
  'THE CHAIN GIVES: THE LAMP FALLS INTO THE OIL', 'FIRE TAKES THE DROWNED DEAD', 'THEIR COATS ARE SOAKED IN OIL: FIRE TAKES THEM',
  'HIS FLASK BREAKS: LAMP OIL WHERE IT LANDS', 'THE OIL ON THE WATER CATCHES', 'HIS LANTERN FALLS INTO HIS OWN OIL', 'THE LIGHT SCATTERS THEM',
  'THE OIL BURNS: GET OUT OF IT', 'LAMP OIL ON THE FLOOR: IT BURNS', 'A DRIP: ONE SIP', 'THE NEST SPILLS ITS BROOD', 'THE NEST SPITS VENOM: BURN IT', 'A SPARE ROPE UNCOILS', 'HER WARD: WATER AND BLADES RUN OFF HER',
  /* claude/skyroad: THE SKY ROAD's thermals, cloak, stones, disc, cloud sea, loft, snatch and kite-riders (src/sky-road-hands.js), and THE ROC on her EYRIE (src/roc-eyrie.js) */
  'THE HOT AIR CARRIES YOU UP', "THE RIDER'S CLOAK: HOLD JUMP TO GLIDE", 'THE UPDRAFT THROWS YOU BACK', 'THE HORN CALLS THE KITE-RIDERS', 'THE DISC TURNS: THE ROAD OF AIR RISES', 'THE SUN HAS MOVED OFF THE DISC',
  'THE STONE TURNS TO THE SUN: THE AIR RISES', 'THE LOFT WANTS FOUR CLOTHS', "THE RIDERS' LOFT OPENS", 'SHE HAS YOU: STRUGGLE', 'SHE LETS GO', 'THE LINE IS CUT', 'KNOCKED OUT OF THE SKY',
  'THE STORM ROLLS IN', 'THE AIR GOES DEAD', 'FROM THE AIR: SHE TAKES IT WHOLE', 'HER TALONS GUARD LOW: RIDE THE AIR TO HER', 'A STORM CLOUD OVER YOUR AIR: OUT OF THE COLUMN', 'THE MASTS CHARGE: OFF THE FLOOR', 'HER FEATHERS ARE UP', 'THE ROC  KNOCKED DOWN', 'THE LIGHTNING HAS HER', 'HER TALONS ARE STUCK IN THE NEST', 'SHE SKIDS ON THE STONE', 'SHE DRAGS A CLOUD OVER IT', 'SHE LETS YOU FALL', 'HER FEATHERS BRISTLE', 'THE CLOAK GOES BACK ON ITS MAST', 'THE KITE TAKES THE LINE: STEP ON THE CAGE', 'A GREAT SHADOW CROSSES THE BRIDGE',
  /* claude/minecart: THE DEEP RAILS' points, crashes, hazards and goblin carts (src/minecart-hands.js) and THE GREAT DRILL (src/great-drill.js, src/great-drill-hands.js) */
  "EIGHT ORE: THE SMELTER'S POINTS WILL OPEN", 'LOCKED: THE SMELTER WANTS 8 ORE', 'CRASHED: BACK BEFORE THE POINTS', 'CRASH!', 'POINTS SET: STAY HIGH', 'POINTS OPEN: DOWN TO THE LOW LINE', 'A GOBLIN CASTER ON A CART', 'A GOBLIN ARCHER ON A CART',
  'THROWN OUT: THE CART IS YOURS', 'INTO THE CART', 'A FALL COSTS YOU: PUMP BEFORE A LONG GAP', 'CRUSHED: BRAKE, AND GO WHEN IT LIFTS',
  'THE GATE IS SHUT: WATCH ITS GAUGE', 'KNOCKED OFF',
  /* claude/forgemaster: THE SMELTER FLOOR's junction levers and slag plugs (src/forge-rails.js) and THE FORGEMASTER on the rails (src/main.js updateForgemaster, e.rails) */
  'POINTS OPEN: THE NEXT CART DROPS', 'POINTS SET: THE CARTS RIDE ON', 'IT DROPS', 'THE PLUG BREAKS', 'HE BRACES', 'HE BRACES: IT CLANGS OFF', 'HE IS DOWN ALREADY', 'HE HURLS IT: JUMP', 'HOT INGOTS',
  /* claude/caravan2 (batch83 merge: routed - hint-shown): THE DUNE WORM's ledges and hide, and the wagon bed sinking in the quicksand */
  'A LEDGE RISES', 'THE LEDGE CRACKS', 'HIS HEAD HITS THE LEDGE', 'STUNNED: CUT HIM', 'WARDED: NOT YET', 'MAKE HIM HIT A LEDGE', 'THE BED GOES UNDER',
  /* claude/deeprails2: DEEP RAILS 2 - the ram, the bump, the thrower, the foreman, the ramp, the on-foot stretches; GREAT DRILL 2 */
  'A GOBLIN THROWER ON A LEDGE', 'RAMMED!', 'CRASH: PUMP TO RAM IT, OR JUMP IN', 
  'DERAILED! ON FOOT: A CART WAITS AHEAD', 'THE LINE ENDS: OUT, AND UP THE LIFT', 'INTO THE CART: ROLL ON', 'FLY!', 'NOT ENOUGH PUMP!', 'A BUMP: PUMP TO RAM, OR STRIKE OR JUMP', 
  /* claude/deeprails3: THE FOREMAN (the mini: src/foreman.js FOREMAN_LINES are routed below), the foes that come to your line, the switches */
  /* claude/deeprails3: GREAT DRILL 3 - the chute's points lever, the dynamite, the lunge, the chain, the roof */ 'OFF THE LINE: THE HOOK SLIPS', 'CHAIN CUT', 'ITS OWN ORE IN ITS GEARS: STRIKE THE CAB', 'POINTS THROWN: ITS ORE GOES IN ITS GEARS', 'ORE! THROW ITS POINTS', 'ORE! ITS POINTS LEVER COMES: STRIKE IT, OR E', 'AN ORE CART: PUMP AND RAM IT INTO ITS GEARS', '!! SNAGGED: JUMP, OR STRIKE THE CHAIN', 'IT SPINS UP: DUCK ITS HEAD, CUT ITS CHAIN', '!! DYNAMITE', '!! DYNAMITE: OFF ITS LINE, OR BRAKE', '!! DUCK', '!! IT SPINS UP: DUCK IN YOUR TUB', '!! THE HOOK', '!! THE HOOK: JUMP, OR CHANGE LINE', '!! THE ROOF', '!! THE ROOF COMES DOWN: PUMP THROUGH, OR BRAKE', 'THE FOREMAN: JUMP ON HIS CART', 'A GOBLIN ON THE ROOF TIMBER', 'A GOBLIN READY TO LEAP', 'A GOBLIN WITH A HOOK ALONGSIDE', 'HE IS ON YOUR LINE: RAM HIM', 'KNOCKED OFF HIS BEAM', 'THROWN OFF: BACK IN YOUR CART',
  /* claude/deeprails4: GREAT DRILL 4's gears, the RAIL RAIDERS */ 'A GEAR GONE: IT STALLS - STRIKE THE CAB', 'ITS GEARS GIVE: FINISH IT', 'ITS GEARS GIVE: THE DRIVE IS OPEN', 'A RAIDER DRAWS ALONGSIDE', 'TOO SLOW: PUMP TO RAM IT', 'THE GREAT DRILL BORES ON AHEAD: CHASE IT', 'ITS CAB IS ARMOURED: JAM ITS GEARS', 'THE ORE JAMS ITS GEARS: STRIKE THE CAB', 
  'ITS PLATES ARE UP: IT SHRUGS IT OFF', 'IT SHRUGS IT OFF', 'RAMMED: INTO ITS GEARS!', 'ITS PLATES ARE UP', 'IT CLEARS ITS GEARS: ITS PLATES ARE UP', 
  /* claude/deeprails5: GREAT DRILL 5 - the spare cutter, the rail claw; the parked cart's gate */ '!! CUTTER', '!! A CUTTER: STRIKE IT BACK, OR JUMP', '!! THE CLAW', '!! THE CLAW: PUMP AND JUMP, OR CHANGE LINE', 'STRUCK BACK: INTO ITS GEARS', 'THE GATE: JUMP INTO THE CART', 'CRUSHED: TIME IT, OR DROP UNDER IT',
  'IT CRACKS THE ROOF: OFF THE SHADOWS', '!! REVERSE', '!! IT BACKS AT YOU: BRAKE, OR JUMP UP', '!! IT BACKS AT YOU: BRAKE',    
  'THE ROOF TAKES THE HIGH LINE: TWO LINES LEFT',
  /* claude/glasssea: THE GLASS SEA's mirrors, beams, beds, cracks, night and cast (src/glass-sea-hands.js) and THE GLASS COLOSSUS (src/glass-colossus.js, src/glass-colossus-hands.js) */
  'FIRELIGHT WILL NOT FUSE SAND: IT WANTS THE SUN', 'THIS NOTCH IS STUCK: FIVE GLASS SHARDS FREE IT', 'DAZZLED: THE BEAM STUNS GLASS', 'FROZEN IN THE FIRELIGHT', 'IT SHATTERS: SHARDS IN THE SAND',
  'THE GLASS CRUMBLES BACK TO SAND', 'THE FIRELIGHT HOLDS THE CRACK', 'THE CRACK BOILS WITH THE SWARM: FIRELIGHT HOLDS IT', 'THE CRACK THROWS YOU BACK', 'THE COLD BITES: GET TO A FIRE',
  'THE SUN GOES DOWN: THE COLD COMES', 'A CRACK BOILS: THE SWARM', 'THE GLASS COLOSSUS WAKES', 'THROWN OFF: HOLD DOWN TO GRIP WHEN IT SAYS HOLD',
  'IT KNOCKS THE MIRROR ROUND', 'IT GLAZES ITS CRACKS OVER: WAIT FOR THE GLASS TO CLEAR', 'NIGHT FALLS IN ITS GLASS: THE LANCE IS DARK', 'DAWN: THE SUN RETURNS TO IT', 'IT SPLITS THE GLASS TO YOU: FIRELIGHT ON ITS CRACK HOLDS IT',
  'A MIRROR TO THE SKY THROWS THE DAWN ON ITS CROWN', 'THE DAWN BURNS ITS CROWN: DAZZLED', 'HOLD!', 'THE MIRROR THROWS IT BACK: ITS CHEST CRACKS', 'THE LANCE MISSED THE MIRRORS: NOTHING OPENS', 'TURN A MIRROR TO THE FIRE: ITS LIGHT HOLDS THE CRACK', 'TURN A MIRROR TO THE SKY, OR TO FACE ITS LANCE', 'THE FIRE HOLDS THE CRACK: ITS SHOULDERS BLAZE',
  /* claude/glasssea2: the swarm at dusk, the rocking mirrors, the Colossus's new moves and its read */
  'THE CRACK STIRS', 'THE SWARM WILL NOT CROSS FIRELIGHT', 'THE MIRROR ROCKS OFF THE SUN: THE GLASS GOES', 'THE GLASS GAVE WAY: BACK TO THE LIP',
  'TURN THE MIRROR TO HIM', 'TURN THE MIRROR TO HIM: HIS LANCE COMES BACK INTO HIS CHEST', 'THE GLASS IS SLICK: IT SLIDES YOU',
  /* claude/colossusrework: THE GLASS COLOSSUS walks between his stations, his gaze, his shard lunge */
  'IT STRIDES', 'THE MIRROR CATCHES HIS GAZE',
  /* claude/litchurch: THE LIT CHURCH's light, flame, clergy, grates, organ, dark rising and doors (src/lit-church-hands.js) and THE PALADIN (src/paladin-boss.js, src/paladin-boss-hands.js);
     (Waymeet's boss is THE CRUSADER now: his plate's lines above) */
  'THE ROOM IS LIT: THE PRIESTS ARE STRONG IN IT', 'LAMP ONE BURNS: A SCONCE ON THE ROOD SCREEN', 'LAMP TWO BURNS: A SCONCE ON THE ROOD SCREEN', 'LAMP THREE BURNS: THE CRYPT CRACKS',
  'THE LIGHT WAKES THE CLERGY ON THE STAIR', 'THE ROOM IS DARK: THE PRIESTS WEAKEN, AND THE DEAD COME UP', 'A CHAPEL LAMP WANTS A FLAME: E AT A FIRE TAKES ONE', 'A FLAME LIGHTS IT: E AT A FIRE TAKES ONE',
  'A FLAME: IT BURNS DOWN. A BLOW PUTS IT OUT', 'THE CHORD: THE GUST BLOWS WEST', 'THE RELIQUARY WANTS FIVE CANDLE STUBS', 'THE LIGHT BURNS THE DEAD', 'THE RITE IS CUT', 'THE PRAYER IS CUT',
  'HE RE-LIGHTS THE LAMP', 'HE RE-LIGHTS IT: A BLOW CUTS THE RITE', 'THE ARCHDEACON PRAYS OVER HIS ROOM', 'HE PRAYS: A BLOW CUTS IT', 'IN THE LIGHT HIS PRAYER HEALS DEEP', 'IN THE DARK HIS PRAYER IS THIN',
  'THE ACOLYTE LIGHTS IT', 'AN ACOLYTE RUNS FOR THE LAMP: CATCH HIM', 'THE DARK LETS THE DEAD UP', 'THE DARK RISES: CLIMB', 'THE LIGHT HOLDS IT BELOW', 'THE DARK SNUFFS IT', 'THE DARK TAKES YOUR FLAME',
  'THE DARK COMES UP THE GRATES: THE NAVE IS DARK BEHIND YOU', 'THE FLAME BURNS OUT', 'THE BLOW PUTS YOUR FLAME OUT', 'THE PIPE BREATHES: RIDE IT UP',
  'THE WEST DOOR OPENS', 'THE SEAL IS OUT: THE CRYPT HATCH OPENS', 'THE ROOD SCREEN OPENS', 'THE CRYPT GRATE IN THE CROSSING CRACKS OPEN', 'THE RELIQUARY OPENS', 'THE SACRISTY DOOR IS UNBARRED: A WAY BACK TO THE CRYPT',
  'THE PALADIN, SWORN TO THE LIGHT',
  'THE KINDLING IS CUT',
  'HE KINDLES THE LAMP: CUT IT', 'HE REELS ON THE BEAT', 
  /* claude/church2: LIT CHURCH 2 - the holy fire, the chantry's relay, the chandeliers (src/lit-church-hands.js), THE PALADIN as the hero boss (src/paladin-boss.js, -hands.js), THE DEACON (src/deacon.js, -hands.js) */
  'THE CHAIN PARTS: THE CHANDELIER COMES DOWN', 'THE CHANTRY DOOR OPENS', 'THE BRAZIER CATCHES: A FRESH FLAME FROM IT', 'A FRESH FLAME', 'A DRAUGHT: THE TAPER BURNS FAST HERE', 'HOLY FIRE: SNUFF ITS LAMP, OR CROSS ABOVE', 'BURNED',
  'ON THE BEAT: HE REELS',
  'INTO THE WALL', 'THE PALADIN CAN BE HAD IN THE SHOP',
  'HIS LAMPS ARE OUT: HE GROPES IN THE DARK - STRIKE', 'HE FINDS HIS FLAME: HE IS WARDED', 'HIS POLE GUARDS HIGH: HIT LOW', 'IT LANDS: HIS LIGHT GUTTERS', 'THE CHANDELIER COMES DOWN ON HIM', 'HIS LIGHT GUTTERS', 'A LAMP OUT: HIS LIGHT GUTTERS',
  'THE DEACON TURNS HIS POLE: THE FLAME END DOWN', 'THE SNUFFER HOOK: A SHIELD, OR GET OUT OF ITS REACH', 'THE FLAME ARC: HOLY FIRE ALONG THE FLOOR - JUMP IT', 'HOOKED: HE HAULS YOU IN', 'THE DEACON KEEPS THE LAMPS', 'HIS LAMPS ARE HIS LIGHT: SNUFF THEM, HIT HIM LOW',
  /* claude/church3: THE PALADIN re-pointed to the Paladin 4 kit and the flame (src/paladin-boss.js, -hands.js), THE DEACON two ways (src/deacon.js), the new undead foes */
  'THE LAMP HE DOUSED BURNS: HE FALTERS - STRIKE', 'THE DOUSING IS CUT', 'HE DOUSES HIS LAMPS: LIGHT THEM AGAIN', 'HE DOUSES IT', 'HE DOUSES THE LAMP: THE DEAD STIR. LIGHT IT AGAIN', 'HE RAISES THE SNUFFER CAP: CUT IT', 'CARRY A FLAME: LIGHT A BRAZIER BESIDE HIM', 'THE HOLY FIRE BREAKS HIS LIGHT-WARD: HE FALTERS - STRIKE', 'HIS WARD RETURNS: HE IS WARDED', 'HIS LIGHT-WARD TURNS IT: LIGHT A BRAZIER BESIDE HIM', 'THE PRAYER IS BROKEN', 'HIS HAMMER IS STAYED', 'COMMITTED: IT LANDS', 'TOO FAR FROM HIM: HE WILL PRAY AT IT', 'THE BRAZIER BURNS - TOO FAR FROM HIM: LIGHT ONE BESIDE HIM', 'HIS WARD HOLDS: NOT YET', 'HIS BRAZIER DIES UNDER HIS HANDS', 'THE BASTION: HE SNUFFS HIS BRAZIERS - RELIGHT THEM BY HIM', 'THE EARTHBREAKER: THE DAWN FALLS WITH HIM', 'THE ARC OVER HIS HEAD: DO NOT HANG OVER HIM', 'HE RAISES HIS LIGHT-WARD: BRING THE FIRE', 'HE PRAYS AT THE BRAZIER: BREAK IT OFF', 'HE SNUFFS THE BRAZIER', 'HE SNUFFS THE BRAZIER: LIGHT IT AGAIN BESIDE HIM', 'HE STEPS OFF THE BRAZIER: CATCH HIM AT ONE', 'SUNFALL: STAND BETWEEN THE LIGHTS', 'HE KNEELS IN PRAYER: BREAK IT OFF', 'SMITE: TAKE IT ON A SHIELD, OR STEP BACK', 'TWIN SMITE: AND AGAIN', 'RADIANCE: GET OUT OF HIS LIGHT', 'THE SPEAR OF LIGHT: JUMP IT', 'VERDICT: THE SIGILS FALL WHERE YOU STAND - KEEP MOVING', 'DAWNFALL: OFF THE RING',
  /* claude/church3: THE ORDER / UNDEAD PALADIN and THE UNDEAD PRIEST (src/order-paladin.js, src/undead-priest.js) */
  'THE FLAME CRACKS HIS SHIELD', 'ON THE GLEAM: HIS SHIELD SHATTERS', 'THE LIGHT CREEPS BACK OVER HIM', 'HIS SHIELD STANDS AGAIN', 'A SHIELD TURNS IT: PARRY THE GLEAM TO BREAK HIM', 'THE GLEAM ON HIS SHIELD: PARRY IT', 'HIS CRACKED SHIELD: PARRY THE GLEAM, OR BRING A FLAME', 'HIS DIVINE SHIELD: PARRY THE GLEAM', 'THE FLAME: HE BREAKS OFF AND FLEES', 'HE FLEES THE FLAME', 'THE DEAD GET UP', 'HIS DEAD KNIT', 'HE PINCHES THE LIGHT OUT', 'THE RITE IS BROKEN',
  /* claude/flotilla2: THE ADMIRAL'S CHAMPION (src/admirals-champion.js, src/admirals-champion-hands.js) and THE FLOTILLA 2's rowers (src/flotilla2.js) */
  'THE HULLS ROCK APART', 'TOGETHER AGAIN', "THE ADMIRAL'S CHAMPION: THE FLEET'S LAST WORD", 'HIS PLATE TURNS A BLADE. HIS OWN GUNS WILL PUT HIM DOWN', 'HAULED OUT OF THE HARBOUR',
  'HIS GUNS ARE HOT: THEY WILL NOT SPEAK AGAIN A WHILE', 'HE IS GETTING UP', 'HE IS UP: HIS GUARD IS SET', 'THE BALL GLANCES OFF HIS GUARD: NOT YET', 'KNOCKED FLAT: CUT HIM NOW',
  'HE GETS UP WARY: WAIT FOR HIS GUARD TO DROP', 'HE THROWS DOWN THE SWORD AND TEARS THE ANCHOR OFF THE RAIL', 'HE WRENCHES THE BLADE FREE', 'HE HAULS THE ANCHOR OUT OF THE DECK',
  'THE BLADE IS IN THE DECK: CUT HIM', 'THE DECK TILTS TO THE LASHING: WALK UP IT, OR HOLD A LINE', 'THE ANCHOR BIT THE DECK: CUT HIM', 'FREE: HIS BENCH STOPS', 'EVERY OAR IS DOWN: THE FISHERFOLK ARE FREE',
  /* claude/towpath: THE TOWPATH's locks, wheel, bridges, lantern and fog (src/towpath-hands.js) and THE FOG KNIGHT (src/fog-knight.js, src/fog-knight-hands.js) */
  'A LOCK: ITS PADDLE MOVES THE WATER', 'THE PADDLE IS UP: THE CHAMBER FILLS', 'THE PADDLE IS DOWN: THE CHAMBER DRAINS', 'THE RACE RUNS: THE WHEEL TURNS', 'THE RACE RUNS DRY: THE WHEEL SLOWS', 'THE WHEEL STANDS STILL: ITS PADDLES ARE A STAIR',
  "THE WHEEL'S BLADES: STILL IT FIRST", 'THE CAPSTAN TURNS: THE BRIDGE SWINGS ACROSS', 'THE BRIDGE SWINGS CLEAR OF THE CUT', "THE LOCK-KEEPER'S LANTERN: E LIGHTS IT, OR DIMS IT", 'LIT: YOU SEE THE WAY - AND THEY SEE YOU', 'DIMMED: THE FOG HIDES YOU - AND THE WAY',
  'THE BLOW PUTS YOUR LANTERN OUT: E LIGHTS IT', 'YOU WADE OUT TO THE BANK', 'THE LAMP BURNS THE FOG OFF ROUND IT', 'HE SEES YOUR LIGHT', 'THE WATER TAKES HIM', 'IN THE FOG: A WATCHMAN SEES ONLY WHAT IS LIT', 'OUT OF THE FOG: CLEAR AIR - AND EVERY EYE SEES YOU', 'THE LAST LOCK: DRAINED, ITS IRONS KILL',
  'SOMETHING STANDS IN THE GATE', 'THE LAMP IS OUT: STRIKE IT, OR LIGHT THE LANTERN', 'THE FOG KNIGHT: THE FOG IN AN OLD SUIT OF PLATE', 'FOG IS HIS BODY: YOUR LANTERN BURNS IT OUT OF HIM', 'GUARDS HIGH: HIT LOW', 'GUARDS LOW: HIT HIGH', 'FULL GUARD: PLUNGE ON HIM',
  'THE LANTERN BURNS THE FOG OUT: THE ARMOUR STANDS EMPTY', 'THE BRIDGE SCATTERS THE FOG: THE ARMOUR STANDS EMPTY', 'THE FOG POURS BACK INTO HIM', 'THE FOG IS BACK IN HIM: NOT YET', 'THE FOG GATHERS IN HIM AGAIN', 'THE GUARD BREAKS: HE REELS',
  'THE FOG RISES OFF THE LOCK: IT TAKES HIS SHAPE', "A SECOND KNIGHT OF MIST: THE REAL ONE'S VISOR GLOWS", 'THE LOCK RUNS DRY: THE DOUBLE SINKS WITH ITS MIST', 'NIGHT: THE SHROUD COMES DOWN THE TOWPATH', 'TOO SOON: ROLL IN ITS LAST BEAT',
  /* claude/towpath2: THE TOWPATH 2's fog, hoist, aqueduct and crane (src/towpath-hands.js), THE FOG WRAITH (src/fog-wraith.js) and THE FOG KNIGHT 2's moves (src/fog-knight.js, src/fog-knight-hands.js) */
  'THE LOCK FILLS AGAIN THROUGH ITS LEAKING GATES', 'THE WINCH TURNS: THE HOIST RIDES TO THE OTHER FLOOR', 'THE BARGE IS AT THE FAR STOP: WAIT, THE BARGEMAN POLES IT BACK', 'THE BARGEMAN POLES THE BARGE BACK TO YOU', 'THE LOCK WATER DROWNS', 'THIS WATER DROWNS',
  /* claude/towpathchurch: WAYMEET's votive lamps (src/votive-hands.js) */ 'A VOTIVE LAMP WANTS A FLAME: E AT A BRAZIER TAKES ONE', 'ONE OF THREE VOTIVE LAMPS BURNS', 'TWO OF THREE VOTIVE LAMPS BURN', 'THE THIRD LAMP BURNS: THE HILL ROAD TO THE LIT CHURCH IS OPEN',   /* (the lofts' nudges are STUCK_HANDS.waymeet lines: SPOT_LINES routes them) */ 'THE SLUICE OPENS: THE TROUGH RUNS AND THE BARGE FLOATS', 'THE CRANE SWINGS: THE HOOK RIDES UP OUT OF THE FOG',
  'A FOG WRAITH: ONLY LIGHT MAKES IT SOLID', 'IT REACHES FOR YOUR FLAME: CUT IT WHILE YOUR LIGHT HOLDS IT', 'IT SMOTHERS YOUR LANTERN: E LIGHTS IT', 'YOU SHIELD THE FLAME: IT DRAWS BACK',
  'THE TOWROPE: ROLL OR JUMP IT', 'THE LOCK SURGE: GET UP HIGH', 'FOG SPEARS: OFF THE LINE', 'HE SINKS INTO THE FOG', 'ROLLED UNDER THE CHAIN', 'HOOKED: HE DRAGS YOU IN', 'THE FOG IS OVER YOUR HEAD: GET ABOVE IT AND YOU SEE HIM COME',
  /* claude/buriedcity: THE BURIED CITY's sand rooms, levers, great sand-gate and clockwork vault (src/buried-city-hands.js) and THE HOURGLASS KING (src/hourglass-king.js, src/hourglass-king-hands.js) */
  'AN OPEN FLOOR-GATE IS A DROP: SHUT IT AND THE SAND BRIDGES IT', 'THE OPEN FLOOR-GATE DROPS YOU: BACK TO THE LIP',
  /* (claude/buriedcity2) THE SINKING STREET and THE SAND-FALLS */ 'THE STREET STANDS ON THE SAND: OPEN ITS GATE AND IT SINKS', 'THE GATE IS OPEN: THE STREET GOES DOWN WITH THE SAND', 'A SAND-FALL: E SWINGS ITS CHUTE', 'THE SAND-FALL BEATS YOU DOWN: SWING IT AWAY', 'THE HEAP IS UP TO THE ARCH: SWING THE FALL BACK OFF IT', 'THE SAND FALLS THROUGH THE OPEN FLOOR-GATE INTO THE DARK', 'THE FLOOR-GATE SHUTS: NOW SWING THE SAND-FALL INTO THE HALL', 'THE CHUTE SWINGS: BY THE WALL THE SAND PILES UP', 'THE CHUTE SWINGS: THE FALL POURS INTO THE HALL', 'THE CHUTE SWINGS: THE FALL RUNS AWAY THROUGH THE GRATE', 'THE CHUTE SWINGS: THE FALL LANDS ON THE LIP',   /* (fix pass M3: the foundry's floor-gate, the trap hall's teach) */
  'SAND IN ITS GEARS: IT IS JAMMED', 'JAMMED: IT CANNOT GUARD', 'THE CLOCKWORK VAULT WANTS FIVE GEARS', 'THE FLOOR-GATE OPENS: THE HALL DRAINS INTO THE DARK', 'THE GATE OPENS: THE SAND RUNS DOWN INTO THE NEXT HALL', 'THE GATE IS OPEN: THE ROOM DRAINS', 'THE FLOOR-GATE SHUTS: THE HALL FILLS', 'THE GATE IS SHUT: THE SAND RISES', 'THE GREAT GATE IS OPEN', 'THE GREAT SAND-GATE IS OPEN: THE QUARTER DRAINS', 'THE CLOCKWORK VAULT OPENS', 'THE GREAT SAND-GATE: E TURNS THE WHEEL', 'THE SAND-GATE: OPEN, THE ROOM DRAINS', 'SHUT THE GATE: THE SAND CARRIES YOU UP', 'SHUT THE GATE: THE SAND COVERS THE STAKES', 'THE HOURGLASS: THIS HALL RUNS DOWN INTO THE NEXT', 'SHUT THE GATE: RIDE THE SAND UP THE SHAFT', 'SHUT THE FLOOR-GATE: THE HALL FILLS', 'THE HOURGLASS KING, WHOSE HOUR NEVER ENDS', 'HIS CHEST IS AN HOURGLASS: AS IT RUNS LOW, PULL A SAND-GATE', 'THE SAND STIRS IN HIM', 'HE TURNS HIS GLASS OVER, FULL: HE GUARDS', 'THE GATE TAKES HIS LAST GRAINS: HE STALLS - STRIKE', 'HIS GLASS IS TURNING: THE GATE FINDS NOTHING', 'HIS GLASS IS FULL: NOT YET', 'HIS GLASS RUNS LOW: PULL A SAND-GATE', 'HIS GLASS IS EMPTY: HE TURNS IT OVER',
  /* claude/sealedpyramid: THE SEALED PYRAMID's plates, traps, counterweights, storm, mummies and sealed tomb (src/sealed-pyramid-hands.js) and THE SCARAB MOTHER (src/scarab-mother.js, src/scarab-mother-hands.js) */
  'HE TREADS THE PLATE: THE BLOCK!', 'HE TREADS THE PLATE: THE DARTS!', 'HE TREADS THE PLATE: THE STONE!', 'CLICK: THE BLOCK FALLS', 'CLICK: THE DARTS FLY', 'CLICK: THE STONE RUNS', 'YOU STOOD IN ITS REACH',
  'HE TAKES ONLY A SHARE OF IT', 'THE TOMB KILLS ITS OWN', 'THE WEIGHT OF THE BLOCK TAKES IT DOWN', 'THE BLOCK LIES IN THE PIT: STAND ON IT', 'THE GREAT STONE BREAKS THE FALSE DOOR: THE WAY DOWN', 'THE BLOCK SINKS UNDER YOU, AND ITS MATE COMES UP',
  'THE STORM  >>', '<<  THE STORM: BRACE (BLOCK)', 'ITS LINEN BURNS', 'IT HAS YOU: STRIKE IT', 'YOU TEAR LOOSE OF ITS GRIP', 'THE SEALED TOMB WANTS FOUR SCARAB SEALS', 'THE SEALED TOMB OPENS',
  'A PALE PLATE: IT DROPS THE BLOCK ON THE GUARD UNDER IT', 'A PALE PLATE: IT FIRES THE DART WALL ACROSS THE RUN', 'A PALE PLATE: IT SENDS THE STONE DOWN THE GROOVE', 'THE PLATE OF THE GREAT STONE: THE FLOOR BELOW IS ITS ROAD', 'A PALE PLATE: ITS BLOCK FALLS INTO THE PIT', 'SPEND THE DARTS FIRST: THEN RIDE UNDER THEM',
  'THE SCARAB MOTHER, QUEEN OF THE BROOD', 'LURE HER UNDER A TRAP, THEN TREAD ITS PLATE', 'SHE STRUGGLES FREE', 'SHE RIGHTS HERSELF AND SHUTS HER SHELL: WARDED', 'HER SHELL IS SHUT: THE TRAP GLANCES OFF',
  /* (claude/pyramidlevel) THE SECOND HALF: the gas, the oil, the sluices, the tombs */ 'HE TREADS THE PLATE: THE GAS!', 'HE TREADS THE PLATE: THE FIRE!', 'HE TREADS THE PLATE: THE SLUICE!', 'CLICK: THE GAS HISSES', 'CLICK: THE BRAZIER TIPS', 'CLICK: THE SLUICE OPENS', 'THE WATER IS UP: SWIM', 'THE LID CRACKS: THE DEAD GET UP', 'A PALE PLATE: IT OPENS THE GAS JETS UNDER THE GUARD', 'A PALE PLATE: ITS JETS ARE IN THE NICHE OVER YOU', 'A PALE PLATE: IT TIPS THE BRAZIER INTO THE CHANNEL', 'A PALE PLATE: THE BURNING OIL POURS ON THE FLOOR BELOW', 'A PALE PLATE: IT OPENS THE SLUICE - STAND CLEAR OF THE BORE', 'THE CRYPT SLUICE: THE WATER IS THE WAY UP',
  'THE BLOCK PINS HER - STRIKE', 'DARTS IN HER JOINTS: SHE IS STUCK - STRIKE', 'THE STONE FLIPS HER ON HER BACK - STRIKE', 'THE FLOOR CRACKS: HER BROOD COMES UP OUT OF THE PITS', 'THE TOMB SHAKES: ITS TRAPS RESET FASTER', 'SHE HITS THE WALL', 'THE BROOD',
  /* (claude/buriedcity3) THE HOURGLASS KING's rework (src/hourglass-king.js, -hands.js): his new moves' words, the drift, THE GREAT HOURGLASS */ 'THE GATES ARE DRY: TURN THE GREAT HOURGLASS', 'THE GREAT GLASS IS FAST IN ITS FRAME - NOT YET', 'ITS SAND STILL RUNS BACK DOWN', 'HE GUARDS HIS GLASS: WAIT', 'THE SANDS RISE: THE TIDE WILL TAKE THE FLOOR - THE LEDGES', 'THE SAND TIDE COMES: UP ON A LEDGE', 'HIS GLASS CRACKS: STRIKE THE GREAT HOURGLASS', 'THE SAND HOLDS YOU: JUMP OUT',
  /* (claude/buriedcity3) THE FLIP and THE SAND SEA (src/buried-city-flip.js) */ 'STRUCK AGAIN: ITS SAND RUNS UP FROM THE START', 'HIS GATE KEEPS A CACHE OF COIN: PUT HIM DOWN', 'THE GLASS IS STRUCK: ITS SAND RUNS UP', 'THE SAND RUNS BACK UP: A BURIED ROOF RISES', 'THE SAND RUNS OUT OF THE BANK', 'THE SAND-FALL FLOWS UP: STEP IN AND RIDE IT', 'THE ROOF THAT STOOD SINKS - THE REST RISE', 'THE SAND RUNS BACKWARD: THE ROOFS RISE', 'THE GLASS RUNS OUT', 'THE SAND-FALL BEATS YOU DOWN: STRIKE ITS GLASS', 'THE SAND SEA SWALLOWS YOU', 'THE SAND SEA SWALLOWS YOU: BACK TO THE ROOF',
  /* (claude/buriedcity4) THE GLASS WORKS, THE SAND-BOUND, THE TIMED SLABS, THE OLD STREET (src/buried-city-flip.js, src/buried-city-hands.js) */ 'THE ROOFS YOU CAME BY SINK - TWO RISE AHEAD', 'THE SAND-BOUND IS BURIED: STRIKE IT NOW', 'THE SAND RISES: CROSS BEFORE EACH SLAB CRUMBLES', 'BURIED TO THE CHEST: IT CANNOT MOVE', 'THE SAND HOLDS IT: STRIKE ITS GLASS', 'THE OLD STREET IS OPEN: A WAY BACK TO THE SHRINE', 'THE SAND-GATE OPENS: THE OLD STREET RUNS BACK TO THE SHRINE',
  /* (claude/ksarfoes) THE FALCONER and THE PLATED BANDIT (src/ksar-hands.js) */ 'HE CALLS HIS HAWK TO THE GLOVE', 'HE SENDS HIS HAWK: STEP OFF ITS SHADOW', 'HIS HAWK IS DOWN: CUT HIM', 'HIS HAWK IS BLIND: CUT HIM', 'HIS PLATE TURNS A BLADE: THROW A KEG AT HIM', 'THE PLATE IS BLOWN OFF: CUT HIM',
  /* claude/ksar: THE BANDIT KSAR's gongs, calls, throw, gate and strongroom (src/ksar-hands.js) and THE HAWK-MISTRESS (src/hawk-mistress.js, src/hawk-mistress-hands.js) */
  'YOU RING IT: EVERY BANDIT IN EARSHOT COMES', 'THE GONG! THEY ARE CALLED', 'IT STILL HUMS', 'NO ONE IN EARSHOT ANSWERS', 'THE ROPE IS CUT: THE GONG IS SILENT', 'THE ROPE IS CUT!', 'HE RUNS FOR THE GONG: CUT ITS ROPE',
  'THE SENTRY STRIKES HIS GONG', 'THE HAWK SHRIEKS: THE LOOKOUTS RUN', 'THE LASH PULLS YOU IN', 'A BLOW: YOU DROP IT', 'THE BRICK GIVES: THE ARCH IS OPEN', 'THE ROOF IS HOLED: A CELLAR UNDER IT', 'THE FLASH BLINDS THE HAWK',
  'SMOKE: NO EYE SEES THROUGH IT', 'THE STACK IS EMPTY: WAIT', 'THE RACK IS EMPTY: WAIT', 'A POWDER KEG: ATTACK THROWS IT - UP LOBS, DOWN TOSSES SHORT', 'A FLASH FLASK: ATTACK THROWS IT', 'THE STRONGROOM WANTS FIVE CARAVAN SEALS',
  'THE STRONGROOM OPENS', 'THE GATE IS PINNED UP', 'THE BRAKE IS ON: THE GATEHOUSE HOLDS IT', 'THE GATE IS UP: THE PAWL HOLDS IT', 'THE GATE RISES', 'THE FUSE IS LIT: GET CLEAR', 'THE BRAKE BITES: THE GATE DROPS',
  'THE GREAT GONG: ITS EARSHOT REACHES THE GATEHOUSE', 'THE GREAT GONG HANGS ON A CHAIN', 'MURDER HOLES: THE GATEHOUSE IS MANNED', 'THE GATE WINCH: E HAULS IT', 'A KEG CHAIN: ONE BLAST SETS OFF THE NEXT',
  'THE HAWK IS HOME: SHE GUARDS', 'THE HAWK IS BLIND: SHE IS BARE - CUT HER', 'THE HAWK WHEELS OFF: SHE IS BARE - BURN IT OR CUT HER', 'THE HAWK IS ON HER GLOVE: IT KNOWS THE GONG', 'THE GONG SENDS THE HAWK WHEELING',
  'THE HAWK IS ON HER GLOVE', 'THE POWDER STORE BURNS: THE ROOFS GO', 'A GUARD RUNS FOR A GONG: CUT ITS ROPE', 'THE ROPE IS CUT: NO ONE COMES',
  /* (claude/ksarhawk) THE HAWK AS HER SHIELD: fire brings it down */ 'THE HAWK IS DOWN! SHE IS OPEN - CUT HER', 'THE POWDER BRINGS THE HAWK DOWN - CUT HER', 'THE HAWK IS ON HER GLOVE: IT IS SAFE THERE', 'FIRE! THE HAWK FALLS',
  /* (claude/ksar2) her rooftops and new moves, the hawk's, the longer Ksar's torches, nests, raider lines and shafts */ 'SNARED! JUMP OR ROLL FREE', 'UNDER THE KNIFE', 'THE HAWK HAS YOU', 'YOU BREAK FREE OF THE WHIP', 'THE HAWK LETS YOU GO', 'THE HAWK FLINCHES OFF', 'SHE LEAPS THE SHAFT', 'HER WHIP SNARES: JUMP OR ROLL FREE', 'HER KNIVES: DUCK THE HIGH, JUMP THE LOW', 'A LIT KEG: JUMP IT - OR STRIKE IT BACK AT HER', 'THE RAKE: STEP OFF ITS LINE, OR STRIKE THE HAWK', 'THE SNATCH: BLOCK IT OR STRIKE IT AS IT DROPS', 'BACK AT HER!', 'RAIDERS ON THE LINE! CUT ITS POST', 'THE NEST IS BLIND', 'THE REED CATCHES', 'THE TRAIL CATCHES: THE FIRE RUNS', 'THE ROPE BURNS', 'THE REED BURNS AWAY', 'THE ROPE BURNS THROUGH: THE BRIDGE FALLS ACROSS', 'THE LINE IS CUT: NO RAIDER RIDES IT', 'A TORCH: ATTACK THROWS IT - FIRE EATS REED AND ROPE', 'THE SPIKES BITE - THE UPDRAFT THROWS YOU UP', 'THE HAWK FLINCHES OFF: SHE IS BARE - CUT HER', 'HER OWN KEG! SHE REELS - CUT HER', 'THE GONG CALLS HER GUARD DOWN', 'THE ROOF GOES', 'THE HAWK-MISTRESS, CHIEF OF THE KSAR', 'THE HAWK GUARDS HER: THROW FIRE INTO IT TO BRING IT DOWN', 'IT RIDES THE AIR', 'SHE GATHERS HERSELF', 'THE ROPE IS CUT: THE BRIDGE COMES DOWN', 'YOU HANG THE GONG BACK: IT CAN RING', 'HER GUARD ANSWERS THE GONGS: CUT THE ROPE HE RUNS FOR',
  'THE GONG CALLS HER GUARD DOWN', 'THE ROOF GOES', 'THE HAWK-MISTRESS, CHIEF OF THE KSAR', 'THE HAWK GUARDS HER: THROW FIRE INTO IT TO BRING IT DOWN', 'IT RIDES THE AIR', 'SHE GATHERS HERSELF', 'THE ROPE IS CUT: THE BRIDGE COMES DOWN', 'YOU HANG THE GONG BACK: IT CAN RING', 'HER GUARD ANSWERS THE GONGS: CUT THE ROPE HE RUNS FOR',
  /* claude/rootway: THE ROOTWAY's hoists, hunters, lookout and loft (src/rootway-hands.js), and THE GOBLIN HUNTMASTER (src/huntmaster.js) */
  'HE FALLS: CUT HIM WHILE HE IS DOWN', 'THE ARROW CUTS THE ROPE', 'THE SCOUT SEES YOU', 'THE HOIST DROPS WHAT IT HOLDS', 'THE SPAN LANDS: A BRIDGE', 'CRUSHED UNDER THE CAGE', 'THE CAGE HAS YOU', 'THE CAGE LANDS: A STEP', 'THE HUNTER DROPS ON YOU', 'THE ROPE CREAKS', 'ANOTHER SCOUT TAKES THE POST', 'THE LOFT WANTS FOUR TAGS', 'THE TROPHY LOFT OPENS',
  'HE GUARDS: THE CAGE GLANCES OFF', 'CAUGHT IN HIS OWN CAGE: CUT HIM', 'HIS CAGE HANGS OVER HIM: JUMP AND CUT ITS ROPE', 'A PARRY ONLY STAGGERS HIM: STRIKE IT', 'RED ARROWS ARE POISON: DODGE THEM, NEVER STRIKE', 'HE SHOOTS THE HOISTS: WATCH THE CAGE OVER YOU', 'HIS GOLD ARROWS: STRIKE THEM BACK', 'HE GUARDS', 'POISON: DODGE IT', 'THE POISON IS IN YOU', 'HE GUARDS: IT GLANCES OFF', 'HE GUARDS HIS FRONT: GO ROUND, OR FROM ABOVE', 'THE QUIVER STRAP SNAPS: HE IS OPEN', 'THE BRACER BREAKS: HE IS OPEN', 'THE MASK BREAKS: HE IS OPEN', 'HIS OWN ARROW: HE STAGGERS',
  /* claude/rootway2: THE HUNTMASTER's new moves and his long stagger (src/huntmaster.js), the goblins' snares (src/snares.js) and the spore pod (src/hunt-pods.js) */
  'HIS NET: ROLL THROUGH IT', 'THE HEAVY ARROW', 'HE SETS HIS SNARES', 'THE HUNTING HORN', 'HIS KNIFE', 'THE POD BURSTS IN HIS FACE: HE STAGGERS', 'HE IS OPEN: THREE BLOWS, THEN HE GUARDS', 'HE SETS HIS SNARES: JUMP THEM, OR THROW A POD ON THEM',
  'THE HORN CALLS HIS BOWS: CUT THEM OFF THE PERCHES', 'NETTED: STRUGGLE FREE', 'THROUGH THE NET', 'THE TRAP SNAPS ON NOTHING', 'A JAW TRAP: JUMP IT, OR THROW SOMETHING ON IT', 'THE TRAP HAS YOU: STRUGGLE', 'A NET: ROLL THROUGH IT', 'NETTED',
  'A SPORE POD: ATTACK THROWS IT', 'A BLOW: YOU DROP THE POD', 'HIS BOWS FALL BACK', 'THE POD CUTS THE ROPE',
  /* claude/paladin2 + claude/palart (batch92 integ): the Paladin's holy-ground feedback - plant, empower, smite, aegis on a partner, the circle following a leap, the empty Light bar - routed so the player can see them */
  'HIS AEGIS', 'SMITE', 'THE GROUND FOLLOWS', 'CONSECRATED', 'SANCTIFIED',
  /* claude/paladin3 + claude/rangerfeel (batch94 integ): CONVICTION replaced the Light bar ('NO LIGHT' is 'NO CONVICTION' now), its spends, the held VERDICT, and the Ranger's focus / stance feedback - routed so the player can see them */
  'CONVICTION', 'SUNFALL', 'NO CONVICTION', 'RADIANCE', 'VERDICT', 'VERDICT x', 'THROW: 3 CONVICTION', 'FOCUS ', '%: SWEET-SPOT HITS FILL IT', 'KNIFE', 'BOW',
  /* claude/paladin4: the empowered tiers, the prayer, the Light-ward's break and pierce, VERDICT judged, the spear lost to a hit */
  'TWIN SMITE', 'RADIANCE+', 'PRAY', 'JUDGED', 'WARD BROKEN', 'THROUGH THE WARD', 'SPEAR LOST',
  /* batch125 integ 10-28: THE HURRICANE 3 (claude/hurricane3), THE FORGEMASTER (claude/forgemaster) and THE QUEEN'S LANCE 3 (claude/stormhold3) mid-fight calls - teaching lines, routed as hint-shown requires */
  "THE LINE WON'T HOLD YOU", 'HE FALLS BACK TO THE GATE', 'THE PORTCULLIS IS COMING DOWN', 'ROUND BY THE SUPPLY CARTS', 'HOLD ON', 'STRUCK', 'KNOCKED FLAT: TAKE A LINE', 'SHE IS GOING DOWN UNDER US', 'I WILL GO DOWN WITH HER', 'YOU HAVE HIS LINE: HE HAS NONE', 'BRACE!', 'HE DIVES', 'HE IS BACK ON GUARD: WARDED', 'THE PLANKS GO', 'BALLISTA', 'BOILING OIL', 'UNHORSED: CUT HIM', 'THE CHARGER FOUNDERS', 'THE PENNANT', 'HE REARS', 'SPEARS', 'HE WHEELS: CUT HIM', 'HE VAULTS', 'SHIELD WALL', 'THE WALL IS TURNED: CUT HIM', 'HE CLIMBS BACK', 'THE CAGE COMES DOWN ON HIM',
]);
/* ...and the ones with a count in them (the count is the teaching: how many more) */
/* claude/canalfix3: THE FOG CANAL's NUDGES (Daniel 10-02: "not always clear what you need to do; you get stuck"). When the barge has been held ~10 s and the
   hero has made no headway, one of these names the machine that holds her - never how to work it (the glint over the machine shows where). src/canal-hands.js */
export const CANAL_NUDGE = { gate: 'THE GATE IS SHUT: FIND ITS PADDLE', bridge: 'THE BRIDGE HOLDS HER: FIND ITS CAPSTAN', fog: 'THE FOG HOLDS HER: FIND THE FOGHORN',
  door: 'THE DOOR IS TOO HIGH: THE LOCK UNDER HER IS LOW',
  /* (claude/canal4) THE LEGGING TUNNEL: the stop-planks' windlass, a rider standing on her where there is no current, a hero who has left her in the dark */
  stop: 'STOP-PLANKS HOLD HER: FIND THE WINDLASS', leg: 'NO CURRENT: HOLD LEFT OR RIGHT AT HER END TO LEG HER', back: 'SHE GLIDES TO YOU: DROP BACK ONTO HER DECK' };   /* (claude/canal5) */
/* (they go straight to the hint box, src/canal-hands.js H.hint - not through number(), so they are not CALL_LINES) */
export const CALL_COUNTS = [/^VERDICT x\d+$/, /^FOCUS \d+%: SWEET-SPOT HITS FILL IT$/,/^THE (CHAIN WINCH|SPIN-UP GEAR|DYNAMITE FEED|ROOF WINCH) BROKEN: NO MORE (CHAIN|LUNGE|DYNAMITE|ROCKFALL)$/, /^THE GREAT GATE OPENS A NOTCH \(\d\/\d\)$/, /^THE MIRROR: (TO THE SKY|EAST|WEST|UP|DOWN|FACING THE GIANT|TO THE FIRE)$/, /^IT SPEARS THE MIRROR ROUND: (TO THE SKY|FACING THE GIANT|TO THE FIRE)$/, /^THE BEAM FUSES THE SAND: [A-Z' ]+$/, /^THE ROAD COMES UP: \d+ LAMPS$/, /^SAVED \d+ OF \d+$/, /^THE VALVE COOKS: \d+ MORE$/, /^THE GATE TAKES \d+$/];
/* (claude/gorgemodule) THE RED GORGE's NUDGES are data now (src/stuck-spots.js STUCK_HANDS): the hands say them through number() as a variable, so they are routed here, not as CALL_LINES */
export const SPOT_LINES = new Set(Object.values(STUCK_HANDS).flat().flatMap(sp => (sp.steps || [sp]).map(s => s.line || sp.line)));
/* (claude/dk3) THE DEATH KNIGHT's teaching lines - his openings, his coil healing him, his dodge - said through number() as a variable (c.say), so they are routed here, not as CALL_LINES; his tells keep their sound, mark and floor colour */
export const SAY_LINES = new Set([CHAIR_SAY.cut, CHAIR_SAY.spill, ...Object.values(GALE_SAY), ...Object.values(AD_SAY), ...Object.values(F3_SAY), ...Object.values(PM_SAY), ...Object.values(RK_SAY), ...Object.values(SS_SAY), ...Object.values(KG_SAY), ...Object.values(GB_SAY), ...Object.values(WC_SAY), ...Object.values(BZC_SAY), ...Object.values(HR_SAY), ...Object.values(VH_SAY), ...Object.values(PW_SAY), ...Object.values(BB_SAY), ...Object.values(PO_SAY), ...Object.values(SPW_SAY), ...Object.values(MC_SAY), ...Object.values(GORM_SAY), ...Object.values(RB_SAY), ...Object.values(KW_SAY), ...Object.values(STK_SAY), ...Object.values(LP3_SAY), ...Object.values(WK_SAY), ...BK_LINES, ...HK_SAY, ...Object.values(RM_SAY), ...Object.values(TK_SAY), ...Object.values(OT_SAY), ...Object.values(FR_SAY), ...Object.values(BT_SAY).filter(t => t !== BT_SAY.hide), ...Object.values(SW_SAY), ...Object.values(PLANK_SAY), ...Object.values(LEECH_SAY), 'TIMBER', 'HER DOOR LIFTS: THE WAY UP TO THE KING']);   /* (claude/pyramidboss: THE SCARAB MOTHER's MINI_DONE line, said as a variable by main.js miniEnd) */
/* (claude/minecart fix pass, review MF1) THE DEEP RAILS' TELLS - the cart's teaching, put in the hint box ~2.5 s ahead of what it tells - are data
   (src/minecart.js TELL_LINES, laid by tell() into L.mcTells and said through number() as a variable), so they are routed here, not as CALL_LINES */
export const MC_TELL_LINES = new Set([...TELL_LINES, ...Object.values(FOREMAN_LINES)]);   /* (claude/deeprails3: and THE FOREMAN's lines, said as variables by src/foreman.js) */
export const isCallout = txt => typeof txt === 'string' && (CALL_LINES.has(txt) || SPOT_LINES.has(txt) || SAY_LINES.has(txt) || MC_TELL_LINES.has(txt) || CALL_COUNTS.some(r => r.test(txt)));
/* what is drawn: the line, with the boss-name double space read as a colon ("THE GOBLIN QUEEN: OPEN") */
export const calloutText = txt => txt.replace(/ {2,}/g, ': ');
