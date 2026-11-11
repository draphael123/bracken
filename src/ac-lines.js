/* src/ac-lines.js - THE MAGE ACADEMY's words (claude/academy, the greybox). No imports: the level, its hands, the Headmistress and the tools all read these.
   Every line a hero can see is here, so the textfit page check (owed) and the art lane read one list. */
export const AC_RULE = 'THE LESSONS ARE STILL BEING TAUGHT. LEARN THE SPELL AT THE LECTERN; IT LASTS THE LESSON.';
export const SPELL_NAME = { levitate: 'LEVITATION', blink: 'BLINK', conjure: 'CONJURE STEP' };
export const SPELL_HOW = { levitate: 'HOLD JUMP IN THE AIR TO FLOAT UP', blink: 'DODGE TO BLINK - THROUGH WARD RAILS AND GAPS', conjure: 'JUMP IN THE AIR TO CONJURE A STEP' };
export const AC_SAY = {
  start: 'THE MAGE ACADEMY. THE ARCHMAGE\'S SCHOOL AT THE FOOT OF HIS TOWER.',
  rule: 'THE LESSONS ARE STILL BEING TAUGHT. A LECTERN TEACHES ITS ROOM\'S SPELL - FOR THAT ROOM ONLY.',
  library: 'THE LIBRARY. THE READING GALLERY IS UP AMONG THE STACKS.',
  archive: 'THE ARCHIVE PIT HAS NO FLOOR. THE CATALOGUE SPIRITS WILL FILE YOU BACK - AT A PRICE.',
  flock: 'SPELLBOOK FLOCKS: BLOCK THE STREAM AND THEY SCATTER.',
  lecture: 'THE LECTURE HALL. WARD RAILS OF LIGHT STOP FEET, NOT A BLINK.',
  duel: 'APPRENTICES DUEL BEHIND THE RAILS. MIND THE STRAY BOLTS.',
  yard: 'THE CONJURATION YARD. THE SUMMONING WELL IS WIDE. BUILD YOUR OWN WAY OVER.',
  exam: 'THE EXAM HALL. EVERY LESSON, ONE AFTER ANOTHER. SWAP FAST.',
  gate: 'THE HEADMISTRESS SETS THE FINAL EXAM. SHE MARKS ONLY WHAT USES THE LESSON.',
  rune: 'A SHORTCUT RUNE: STRIKE IT TO LIFT THE SHUTTER.',
  learned: 'LEARNED', ends: 'THE LESSON ENDS', swap: 'NEW LESSON', filed: 'THE CATALOGUE SPIRITS FILE YOU BACK', lifted: 'THE SHUTTER LIFTS',
  scattered: 'SCATTERED', dispelled: 'DISPELLED', fizzle: 'NO ROOM TO BLINK', float: 'FLOAT', dark: 'THE LECTERN IS DARK',
};
/* THE HEADMISTRESS (src/headmistress.js) */
export const HM_SAY = {
  name: 'THE HEADMISTRESS', sub: 'she sets the final exam',
  wake: 'PENS DOWN. THE FINAL EXAM BEGINS.', rule: 'USE THE LESSON ON HER: A CORRECT ANSWER MAKES HER STAGGER',
  correct: 'CORRECT!', open: 'SHE STAGGERS', work: 'SHOW YOUR WORK', holds: 'NOT YET - THE LESSON IS NOT DONE',
  p1: 'LESSON ONE: LEVITATION', p2: 'LESSON TWO: BLINK', p3: 'LESSON THREE: CONJURE STEP', fin: 'THE FINAL QUESTIONS',
  callLevitate: 'LEVITATE!', callBlink: 'BLINK!', callConjure: 'CONJURE!',
  chalk: 'CHALK RAIN', bolt: 'CHALK BOLT', ruler: 'THE RULER', about: 'ABOUT FACE', dispel: 'DISPEL', crumble: 'THE FLOOR IS DISMISSED', shield: 'A SHIELD BOOK',
  fell: 'SHE CLOSES THE REGISTER. YOU PASS.',
};
