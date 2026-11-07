// src/first-cards.js - FIRST-TIME EXPLAINER CARDS + BOSS STUCK-HINT CARDS (claude/onboard2, Daniel 11-06 08:13 DEMO ONBOARDING items 2 and 5).
// One short card, once per save (PROG.firstCards[id] = 1), dismissed with the confirm key (armed after ARM_S, like src/salt-card.js), in the player's own key words.
//   EXPLAINERS  levelup (the first level-up choice card: opens after it), flask (the first shrine lit / first time hurt with a flask held), skills (the first calm stretch
//               of a real level: one slot, the second at level 30, max two), slot2 (the level-up that opens the second slot)
//   BOSS HINTS  'hint:<arena boss id>' - after BOSS_HINT_AT deaths to the SAME boss that this save has not beaten, ONE card on his main tell / opening (read from his code: the
//               header of the file named in each row). Never easier, never a number change: it only says what the fight already shows.
// Pure: main.js owns the state and the keys (teachKeys), the draw takes main.js's text/wrap. tools/first-cards.mjs is the node check.
import { CARD, SECOND_SLOT_LEVEL } from './progression.js';
export const ARM_S = 0.9;          // seconds before the confirm key may dismiss a card
export const BOSS_HINT_AT = 3;     // deaths to the same boss before his hint card (Daniel: "2-3")
export const CALM_S = 7;           // seconds of calm play in a real level before the skills card

/* k = the player's own words: { flask, skill1, skill2, menu } */
export const EXPLAIN = {
  levelup: { title: 'LEVEL UP: YOUR FIRST CARD', col: '#ffd36b', body: k => [
    'EVERY LEVEL OWES YOU ONE PICK, FROM THREE:',
    CARD.map(c => c.name + ' ' + c.what).join(', ') + '.',
    'LEFT / RIGHT CHOOSE. Z TAKES IT. ESC LEAVES IT FOR LATER: IT WAITS IN PAUSE > LEVEL CARD.',
    'FROM LEVEL 25, EVERY FIFTH LEVEL OFFERS A BIGGER PERK.'] },
  flask: { title: 'YOUR FLASK', col: '#ff9a8a', body: k => [
    k.flask + ' DRINKS A FLASK: ABOUT A QUARTER OF YOUR HEALTH BACK.',
    'STAND STILL TO DRINK. A BLOW BEFORE THE SWALLOW SPILLS IT.',
    'A SHRINE GIVES ONE FLASK BACK. DYING REFILLS THEM ALL.',
    'THE SMITH SELLS EXTRA FLASKS.'] },
  skills: { title: 'YOUR SKILL', col: '#9fc6e8', body: k => [
    k.skill1 + ' USES YOUR EQUIPPED SKILL: SKILL ONE. IT IS YOUR ONE SLOT FOR NOW.',
    'A SECOND SLOT OPENS AT LEVEL ' + SECOND_SLOT_LEVEL + ' (' + k.skill2 + '). TWO SLOTS IS THE MOST.',
    'CHOOSE WHAT SITS IN THEM IN THE SKILLS MENU (' + k.menu + '), AT A MAP, SHOP OR SHRINE.'] },
  slot2: { title: 'A SECOND SKILL SLOT', col: '#9fc6e8', body: k => [
    'LEVEL ' + SECOND_SLOT_LEVEL + ' OPENS YOUR SECOND SKILL SLOT: ' + k.skill2 + '.',
    'TWO SLOTS IS THE MOST. FILL IT IN THE SKILLS MENU (' + k.menu + ').'] },
};

/* BOSS HINTS, keyed by the arena's boss id (the 11 bosses of the demo slice). Each says the main tell / opening his own file's header names. */
export const BOSS_HINTS = {
  oldtusker: { name: 'OLD TUSKER', body: k => [   // src/old-tusker.js
    'HIS HIDE TURNS A CUT. TWO WAYS IN:',
    'COME DOWN ON HIS BACK FROM A JUMP,',
    'OR FELL A MARKED PINE ON HIM: FOUR STROKES, WHILE HE STANDS UNDER IT.',
    'A PINE THAT MISSES LIES AS A TRUNK: HE RAMS IT AND REELS.'] },
  hornetqueen: { name: 'THE HORNET QUEEN', body: k => [   // src/hornet-queen.js
    'HER SHELL TURNS A CUT. HER STING STICKS IN COMB:',
    'STAND ON COMB AS SHE DIVES AND LEAVE LATE.',
    'A DIVE TAKEN ON A RAISED SHIELD WINDS HER.',
    'SMOKE DROPS HER: A POT THROWN ON HER. A JUMP ON HER FROM ABOVE LANDS WHOLE.'] },
  frog: { name: 'THE BULLFROG KING', body: k => [   // src/frog-king.js
    'HE IS HITTABLE ON HIS ROYAL PAD: CROSS THE LILY PADS. YELLOW ONES SINK, GREEN ONES HOLD.',
    'SHIELD OR JUMP HIS TONGUE: A SHIELDED TONGUE DAZES HIM.',
    'JUMP THE RED BELLY-FLOP, THEN CUT HIM WHILE HE LIES WINDED.'] },
  bogtroll: { name: 'THE BOG TROLL', body: k => [   // src/bog-troll.js
    'HIS PEAT HIDE TURNS A CUT. HE BURSTS UP UNDER YOUR WEIGHT.',
    'STAND ON A ROTTEN SECTION, THEN STEP OFF AS HIS BULGE TURNS RED:',
    'HE ERUPTS STUCK IN THE WRECK. CUT HIM THEN.',
    'JUMP OR ROLL THE RED DRAG AND HURL.'] },
  chief: { name: 'THE GOBLIN CHIEFTAIN', body: k => [   // updateChief in src/main.js
    'HE SWAPS WEAPONS, AND EACH HAS ITS ANSWER:',
    'CLUB: SLOW AND HEAVY. SWORD AND SHIELD: GO ROUND THE SHIELD.',
    'BOW: BACK OFF AND PARRY THE ARROWS BACK.',
    'THREE BLOWS: STOP SWINGING. AFTER THE STOMP HE IS SPENT: CUT HIM.',   // (claude/chief4) the chain
    'STRIKE HIS KEG ONLY AS IT FLASHES. TWO BLOWS SILENCE HIS HORN.',
    'A BROKEN WEAPON RACK TAKES THAT WEAPON OUT OF THE FIGHT.'] },
  mother: { name: 'THE MOTHER CAP', body: k => [   // src/mother-cap2.js
    'HER HIDE TURNS A CUT. HER KNOT, ON HER CROWN, OPENS HER.',
    'STRIKE A SEED CAP: IT GROWS A STEP. CLIMB, THEN COME DOWN ON THE KNOT.',
    'A STRUCK SPORE BLOOM BECOMES A SPRING SPORE THAT THROWS YOU THERE TOO.'] },
  huntmaster: { name: 'THE HUNTMASTER', body: k => [   // src/huntmaster.js
    'HIS BOW GUARDS HIS FRONT: GO ROUND HIM, OR COME DOWN ON HIM.',
    'STRIKE HIS GOLD ARROW BACK, OR HIT HIM WITH A SPORE POD:',
    'HE STAGGERS LONG. CROSS TO HIM AND CUT, THREE BLOWS WORTH.'] },
  grandmother: { name: 'THE POTION MASTER', body: k => [   // src/potion-hands.js
    'HER JARS BEAT HER WARDS: THROW THE RIGHT COLOUR.',
    'GREEN BRAMBLE BURNS TO RED. BLUE BUBBLES: SNARE HER WITH GREEN.',
    'THE RED CAULDRON RING: LIFT HER OUT WITH BLUE.'] },
  batteringbeast: { name: 'THE BATTERING BEAST', body: k => [   // src/battering-beast.js
    'HIS ARMOUR TURNS A CUT. KNOCK OUT A SCAFFOLD PROP:',
    'ONE BLOW TIPS IT. ON HIM, HE IS STUCK. IN HIS PATH, A CHARGE STICKS HIM.',
    'OR COME DOWN ON HIS BACK FROM A JUMP.'] },
  king: { name: 'KING GORM', body: k => [   // src/gorm-king.js
    'WHAT HANGS OVER HIM OPENS HIM: DROP THE CAGE ON ITS ROPE ONTO HIM.',
    'HIS HAND CANNOT BE BLOCKED: DODGE IT OR BE ABOVE IT.',
    'JUMP THE LOG ROLL AND THE BELLY QUAKE.'] },
  pyromancer: { name: 'THE PYROMANCER', body: k => [   // src/pyro-boss.js
    'HER FLAME WARD TURNS A CUT AND SCORCHES YOU. WATER PUTS IT OUT.',
    'HIT HER WHILE SHE CHARGES A FIREBALL: IT CANCELS AND SHE STAGGERS.',
    'WHEN THE DOME GUTTERS, SHE IS SPENT: CUT HER.'] },
};
export const hintId = bossId => 'hint:' + bossId;
export const hasHint = bossId => Object.prototype.hasOwnProperty.call(BOSS_HINTS, bossId);

/* the card for an id: { title, col, paras:[text] } - paras are wrapped by the caller */
export function cardOf(id, k) {
  if (EXPLAIN[id]) { const c = EXPLAIN[id]; return { title: c.title, col: c.col, paras: c.body(k) }; }
  if (id.startsWith('hint:')) { const h = BOSS_HINTS[id.slice(5)]; if (h) return { title: h.name + ': A HINT', col: '#ffd36b', paras: h.body(k) }; }
  return null;
}
/* once per save */
export const told = (PROG, id) => !!(PROG && PROG.firstCards && PROG.firstCards[id]);
export function markTold(PROG, id) { PROG.firstCards = PROG.firstCards || {}; PROG.firstCards[id] = 1; }
/* a boss death: PROG.bossDeaths[id]++ ; true when this death makes the hint due (the threshold, not yet told, and not beaten) */
export function noteBossDeath(PROG, bossId, beaten) {
  if (!hasHint(bossId) || beaten) return false;
  PROG.bossDeaths = PROG.bossDeaths || {}; PROG.bossDeaths[bossId] = (PROG.bossDeaths[bossId] | 0) + 1;
  return PROG.bossDeaths[bossId] >= BOSS_HINT_AT && !told(PROG, hintId(bossId));
}

/* layout + draw. wrap(s, w, size), text and board are main.js's; o = { card, t, VW, VH, touch, board } */
export const MAX_LINES = 12;
export function layout(card, wrap, w) {
  const lines = []; for (const p of card.paras) lines.push(...wrap(p, w - 14, 6));
  return lines.slice(0, MAX_LINES);
}
export function draw(g, text, wrap, o) {
  const { VW, VH } = o, w = Math.min(VW - 16, 280), x = Math.round((VW - w) / 2), L = layout(o.card, wrap, w), h = 38 + L.length * 8 + 4, y = Math.round((VH - h) / 2) - 2, a = Math.min(1, o.t * 4);
  g.globalAlpha = 0.6 * a; g.fillStyle = '#0a060e'; g.fillRect(0, 0, VW, VH); g.globalAlpha = a;
  if (o.board) o.board(x, y, w, h, o.card.col); else { g.fillStyle = 'rgba(24,8,12,0.96)'; g.fillRect(x, y, w, h); g.strokeStyle = o.card.col; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
  let ty = y + 7; text(o.card.title, VW / 2, ty, o.card.col, 'center', 8); ty += 16;
  g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(x + 8, ty - 3, w - 16, 1);
  for (const s of L) { text(s, VW / 2, ty + 2, '#fff6e0', 'center', 6); ty += 8; }
  ty += 4; if (o.t > ARM_S && Math.floor(o.t * 2) % 2 === 0) text(o.touch ? 'TAP  CONTINUE' : 'Z  CONTINUE', VW / 2, ty, '#8fd160', 'center', 6);
  g.globalAlpha = 1;
}
