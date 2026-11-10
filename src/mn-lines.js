/* src/mn-lines.js - THE HOLLOW MANOR's words (claude/hollowmanor, the greybox). No imports: the level, its hands, the Castellan and the tools all read these.
   Every line a hero can see is here, so the textfit page check (owed) and the art lane read one list. */
export const MN_RULE = 'THE HOUSE MOVES WHEN YOU LOOK AWAY. THE ARMOUR MOVES WHEN A GHOST GETS IN.';
export const MN_SAY = {
  start: 'UP OUT OF THE UNDERCROFT. THE MANOR ABOVE IS EMPTY. NOTHING IN IT IS STILL.',
  shift: 'THIS WALL MOVES - BUT NEVER WHILE YOU WATCH IT. TURN YOUR BACK.',
  suit: 'AN EMPTY SUIT STANDS UP WHEN A GHOST GETS IN. KNOCK IT OUT.',
  wisp: 'THE GHOST FLEES TO THE NEXT EMPTY SUIT. STRIKE IT IN FLIGHT: LAID TO REST.',
  portrait: 'A FAMILY PORTRAIT. STRIKE IT: A KEY BEHIND THE FRAME.',
  gallery: 'THE PORTRAIT GALLERY.',
  stair: 'NO STAIR. LOOK AWAY, AND THERE WILL BE.',
  poltergeist: 'A POLTERGEIST. WHAT IT LIFTS, IT THROWS. BLOCK IT.',
  boo: 'TURNING YOUR BACK MOVES THE HOUSE. IT MOVES THEM TOO.',
  long: 'THE LONG GALLERY. TAKE THE CANDELABRA. THE LIGHTS ARE GOING OUT.',
  candle: 'TOUCH A CANDLE WITH THE FLAME: SHADES WILL NOT ENTER ITS LIGHT.',
  nursery: 'THE NURSERY WING.',
  sealed: 'THE SEALED NURSERY. THREE PORTRAITS, THREE KEYS.',
  door: 'THE ARMOURY. HE WEARS WHATEVER STANDS EMPTY.',
  exit: 'THE STAIR TO THE WITCHLIGHT ROAD.',
  moved: 'IT MOVED', carry: 'CANDELABRA', lit: 'LIT', snuffed: 'SNUFFED', out: 'THE LIGHTS GO OUT', key: 'KEY', keys: 'KEYS', open: 'IT OPENS', locked: 'LOCKED',
  knocked: 'KNOCKED OUT', rest: 'LAID TO REST', rises: 'IT RISES', fades: 'IT FADES',
};
/* THE CASTELLAN'S GHOST (src/castellan.js) */
export const CS_SAY = {
  name: "THE CASTELLAN'S GHOST", sub: 'he keeps the armoury still',
  wake: 'THE RACKS RATTLE. A VISOR LIGHTS.', rule: 'EACH SUIT HAS A WEAKNESS IN HOW IT FIGHTS. EARN IT: THE GHOST IS KNOCKED HALF OUT',
  open: 'KNOCKED HALF OUT: OPEN', warded: 'THE ARMOUR TURNS IT', shield: 'THE SHIELD TURNS IT', holds: 'HE WILL NOT LEAVE IT YET',
  sets: { knight: 'THE KNIGHT', halberd: 'THE HALBERD', duelist: 'THE DUELIST', greatsword: 'THE GREATSWORD' },
  thrust: 'THRUST', bash: 'SHIELD BASH', sweep: 'LOW SWEEP', chop: 'OVERHEAD CHOP', feint: 'FEINT', lunge: 'LUNGE', flurry: 'FLURRY', breaker: 'ARMOUR-BREAKER', whirl: 'WHIRL',
  stumble: 'HE STUMBLES', bites: 'THE BLADE BITES THE FLOOR', winded: 'WINDED', dizzy: 'DIZZY',
  leaves: 'HE LEAVES THE SUIT', final: 'HE SWAPS BODIES MID-COMBO', wisp: 'STRIKE THE WISP',
  fell: 'THE ARMOURY FALLS STILL. EVERY VISOR GOES DARK.',
};
