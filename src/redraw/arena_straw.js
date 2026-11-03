// arena_straw.js - THE ARENA YARD's STRAW CAST (claude/arenastraw, Daniel 11-03): the yard's attacking dummies wear TRAINING-DUMMY skins, so they read as sparring gear, not foes.
// Each skin is the proven machine's own frames (the sworn sword's / the goblin archer's grids, same frame order, anchors, sizes and boxes: every AI pick and hitbox is untouched, and the
// white tell frame is baked from them as usual) in the arena set's colours - burlap, straw, rope and the crimson / royal blue cloth of src/redraw/arena_pal.js:
//   strawsword  THE STRAW SWORDSMAN (the slow station)  a sack head with button eyes and straw tufts, a burlap tunic with a royal-blue patch, straw hands, a WOODEN sword, a PADDED canvas shield
//   strawflash  THE FLASH STATION's swordsman           the same man in a CRIMSON sash and a crimson neck-rope, so the two stations tell apart at a glance
//   strawbow    THE STRAW BOWMAN                        the archer's frames: a sack hood, button eyes, straw legs and tufts, a short wooden bow
// Used only through the yard's L.reskin table / placed cnSkin ('swornsword' / 'archer' elsewhere keep their own art).
import { AP } from './arena_pal.js';

const SWORD = {
  head: ['....y.yy.y....', '...yyxxxxyy...', '..yxxxxxxxxy..', '...xxxxxxxxX..', '....xjxxjxX...', '....ttttttt...'],
  blade: 'c',
  pal: { x: '#c9a860', X: '#8c6c36', y: '#ecd068', Y: '#b8942c', t: '#6a4a24', c: '#d8b070', j: '#1e1e24', f: '#ecd068', m: '#8c6a3a',
    s: '#dccca4', S: '#a98f5a', z: '#6a4a24', u: '#bf9c54', U: '#8f6f38', v: '#a98650', V: '#6a4a24', q: AP.b2 },
};
const FLASH = { head: SWORD.head, blade: SWORD.blade, pal: Object.assign({}, SWORD.pal, { q: AP.c2, t: AP.c1 }) };
const BOW = { H: '#c9a860', g: '#ddbf80', G: '#ecd068', e: '#1e1e24', b: '#a98650', r: '#6a4a24', a: '#ecd068', w: '#b0824a' };

export function bakeStrawSkins(bakeSwornSword, bakeArcher) {
  return { strawsword: bakeSwornSword(SWORD), strawflash: bakeSwornSword(FLASH), strawbow: bakeArcher(BOW) };
}
