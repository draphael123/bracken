/* src/gt-lines.js - THE GHOST TRAIN's words (claude/ghosttrain, the greybox). No imports: the level, its hands, the Conductor and the tools all read these.
   Every line a hero can see is here, so the textfit page check (owed) and the art lane read one list. */
export const GT_RULE = 'THE TRAIN NEVER STOPS. THE DEAD RIDE IN THE DARK CARS.';
export const GT_SAY = {
  board: 'THE GHOST TRAIN. YOU BOARD AT THE BACK. THE ENGINE IS AT THE FRONT.',
  lamps: 'STRIKE A LAMP TO LIGHT IT, OR TO PUT IT OUT. THE DEAD SLEEP IN THE LIGHT.',
  roof: 'ROOF OR INSIDE. ON THE ROOF THE WIND PUSHES YOU BACK, AND THE BRIDGES COME LOW.',
  couple: 'STRIKE THE COUPLING PIN: THE CAR BEHIND IS LEFT ON THE LINE, AND ALL THAT RIDES IT.',
  points: 'THE POINTS: STRIKE THE LEVER. STRAIGHT ON IS THE TUNNEL. THE BRANCH IS THE OPEN LINE.',
  points2: 'STRAIGHT ON, THE LONG TUNNEL: THE DINERS GO DARK. THE BRANCH: THE WINDY TRESTLE.',
  dining: 'THE DINING CAR. THE DINERS SLEEP WHILE THE CHANDELIERS BURN.',
  sleeper: 'THE SLEEPING CARS. NO LAMP HERE BURNS FOR LONG.',
  coal: 'THE COAL TRUCKS. THE ENGINE THROWS ITS SPARKS BACK OVER THEM.',
  engineDoor: 'THE CONDUCTOR KEEPS THE FRONT CARS. PULL THE EMERGENCY BRAKE.',
  low: 'LOW BRIDGE!', tunnel: 'TUNNEL AHEAD!', duck: 'DUCK FLAT (DOWN) OR GET INSIDE', gust: 'GUST!', sparks: 'SPARKS!',
  snuffed: 'THE TUNNEL PUTS THE LAMPS OUT', lit: 'LIT', out: 'OUT', flicker: 'THE LAMP GUTTERS',
  sleeps: 'IT SLEEPS', wakes: 'THE DEAD WAKE',
  cut: 'THE COUPLING PARTS', cutBehind: 'LEFT ON THE LINE', friend: 'A FRIEND IS STILL BACK THERE',
  pointsStraight: 'POINTS: STRAIGHT ON (THE TUNNEL)', pointsBranch: 'POINTS: THE BRANCH (THE OPEN LINE)',
  tracks: 'THE TRACKS!', tracksBack: 'BACK ON THE TRAIN',
};
/* THE CONDUCTOR (src/conductor.js) */
export const CD_SAY = {
  name: 'THE CONDUCTOR', sub: 'he keeps the timetable of the dead',
  wake: 'TICKETS, PLEASE', rule: 'PULL THE EMERGENCY BRAKE: HE IS THROWN, AND OPEN',
  punch: 'TICKET PUNCH', punched: 'THE BOARDS GO', tunnel: 'TUNNEL AHEAD!', uncouple: 'UNCOUPLING!', uncoupled: 'JUMP FORWARD!',
  brake: 'EMERGENCY BRAKE!', thrown: 'THROWN', open: 'OPEN', pressure: 'THE BRAKE IS BUILDING PRESSURE', ready: 'THE BRAKE IS READY',
  holds: 'HE HOLDS THE FOOTPLATE', fuse: 'HE FEEDS HIMSELF TO THE FIRE', fused: 'THE FIREBOX BURNS',
  blast: 'THE FIREBOX', sparks: 'SPARKS FROM THE STACK', grasp: 'THE FIRE REACHES', whistle: 'THE WHISTLE',
  warded: 'HIS COAT TURNS IT', fell: 'THE FIRE GOES OUT. THE TRAIN SLOWS AT LAST',
};
