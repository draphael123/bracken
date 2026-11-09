// Hand-sorted heading for every non-boss foe in the maker FIND browser and ALL ENEMIES tab.
// Sorted by how each foe actually behaves in a fight (bestiary entry plus its code in main.js).
const WALK = 'WALKERS AND FIGHTERS', FAST = 'FAST AND CHARGING', HEAVY = 'HEAVY AND SHIELDED', SHOOT = 'SHOOTERS AND THROWERS', FLY = 'FLYERS', RISE = 'RISERS AND CASTERS', SWIM = 'SWIMMERS (place them in water)';
export const HAND_HEADS = {
  sprig: WALK,
  shield: HEAVY,
  spit: SHOOT,
  wasp: FLY,
  thorn: FAST,   // winds up and charges
  archer: SHOOT,
  hopper: FAST,   // leaps at you
  sapper: SHOOT,   // runs in but its weapon is the thrown bomb
  brute: HEAVY,
  cutlass: WALK,   // quick but a plain melee swinger
  boarder: SHOOT,   // throws a grapple from across a gap
  marine: SHOOT,
  bosun: WALK,   // hits hard but is a plain melee walker
  topiary: FAST,   // hops at you after it shivers
  armour: HEAVY,
  piece: WALK,
  broom: FAST,   // tips back and rams
  mimic: RISE,   // ambusher: chest that pops open
  tome: FLY,   // drifts and darts
  scarecrow: WALK,
  rook: FLY,
  farmhand: WALK,   // ghost that drifts through walls but fights with a hoe up close
  pumpkin: RISE,   // ambusher: bursts up from below
  marshlight: FLY,
  haunt: FAST,   // a fork that throws itself at you
  boo: FLY,   // drifts toward you when your back is turned
  feeler: RISE,   // ambusher: arm rising out of the mud
  grapnel: FAST,   // swings across onto your deck
  powdermonkey: SHOOT,   // lobs grenades
  watch: HEAVY,   // guards with the halberd haft, only heavy blows get through
  sailor: HEAVY,   // slow, heavy, guards while you swing
  netter: SHOOT,
  merrowspear: SHOOT,
  merrowcaller: RISE,   // channels water at mid range
  merrowbrute: HEAVY,
  whelp: FLY,   // stone gargoyle that screeches and dives
  oathblade: HEAVY,   // sword and shield duelist
  drownedknight: FAST,   // the lunge closes the gap
  manta: FLY,
  petrel: FLY,
  turtle: HEAVY,
  heronfoe: WALK,   // stands and spears when you are close, melee
  crab: HEAVY,   // claws up turns a blade
  scout: SHOOT,
  tideguard: HEAVY,
  soldier: HEAVY,
  javelin: SHOOT,
  heavy: HEAVY,
  hound: FAST,
  wickling: RISE,   // flame sprite that drinks lamps and flares
  scorpion: WALK,
  sandgob: RISE,   // ambusher: rises out of the sand
  cutthroat: WALK,
  slinger: SHOOT,
  stagehand: WALK,   // sandbag swing, melee reach
  mummer: WALK,   // creeps up while unseen, fights in melee
  honeyhornet: FLY,
  swarm: FLY,
  stiltwalker: WALK,   // long gaff but a walking melee foe
  construct: HEAVY,
  hawkscout: FLY,
  orderpaladin: HEAVY,
  deadpriest: RISE,   // raises and mends the dead
  fogwraith: FLY,   // drifts through the fog
  skitter: FAST,
  waterthief: WALK,   // cutthroat that steals and runs
  raptor: FLY,
  kiterider: FLY,   // hangs under a war-kite
  trophyhunter: RISE,   // ambusher: rides a hoist down onto you
  willowisp: FLY,   // bobbing light that drifts ahead of you
  hobbyhorse: FAST,   // long straight charge
  wickerman: WALK,
  stringjack: WALK,   // moves only while watched, melee
  hornsman: RISE,   // commands towers with a horn
  barker: RISE,   // its call turns you to face it
  ambusher: RISE,   // ambusher: rises from a sand cloak
  vulture: FLY,
  folk: WALK,   // harmless townsfolk
  thief: FAST,   // snatches gold and runs
  pike: HEAVY,   // pike turns blades from the front
  miner: WALK,   // digs and swings a pick, throws it only across a gap
  sheargob: FAST,   // leaps onto the bucket you ride
  gaffer: WALK,   // long reach but melee
  grub: SHOOT,   // spits acid
  rockgoblin: SHOOT,   // lobs lit lanterns
  kite: FLY,
  crow: FLY,
  bale: FAST,   // rolling hazard on a track
  badger: FAST,   // digs in and charges
  hare: FAST,   // bolts straight through you
  wight: RISE,   // rises out of the bog
  prise: WALK,   // steals your stone in melee
  swornsword: WALK,
  hedgeknight: HEAVY,   // great helm and poleaxe
  runner: FAST,   // quick, runs to fetch reinforcements
  acolyte: WALK,   // does not fight, runs for lamps
  lancer: FAST,   // mounted charge
  drunk: SHOOT,   // throws tankards and bottles
  bannerbearer: RISE,   // raises the fallen
  zombie: RISE,   // rises from the soil
  husk: HEAVY,   // slower than a zombie and twice as tough
  apprentice: SHOOT,   // walks like the dead but throws embers
  lanternshade: RISE,   // ghost that marks your feet
  bellguard: HEAVY,
  propman: WALK,   // does not fight, runs to timber
  shardling: WALK,
  fledgling: WALK,
  gobpriest: RISE,   // mends and blesses goblins
  gobmage: SHOOT,   // slow bolt at range, rune under your feet
  sentry: WALK,   // runs for his bell
  bellman: WALK,
  assassin: RISE,   // ambusher: hidden until it strikes
  berserker: FAST,   // runs in a straight line
  drummer: RISE,   // buffs the clansmen with his drum
  butcher: HEAVY,
  hearthgob: WALK,
  temperer: WALK,   // runs to the brazier and hits
  burngob: WALK,
  emberwisp: FLY,   // drifting flame
  cutter: WALK,   // chops bridges, melee when the rope is gone
  snuffer: WALK,   // snuffs lamps, swings a pole
  sailer: FAST,   // gust-driven battering ram
  harpy: FLY,
  galeharpy: FLY,
  shrieker: FLY,
  goat: FAST,
  royalboar: FAST,
  sporeling: WALK,
  lurker: RISE,   // ambusher: scenery until you pass
  drone: FLY,   // drifts toward you and bursts
  shaman: RISE,   // raises sporelings
  urchin: SWIM,
  angler: SWIM,
  puffer: SWIM,
  jelly: SWIM,
  lamprey: SWIM,
  eel: SWIM,
  leech: SWIM,
};
