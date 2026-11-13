// src/gq6fix.js - GQ6FIX (Daniel 11-13, Highcrown pass 6 after batch182): the tower top's ENTRY and its TEACH, small and concrete. One switch, SHIPS ON.
//   ENTRY   she is ON THE DECK WITH YOU when the roof opens (the party's side of the cupola, in front of the hero), not at the far east end where she walked slowly toward you, then blinked
//           to the far west behind you - the hero walked to the end of the platform and back before the fight began. The name card is 1.0 s (was 1.6), her first blink waits until the
//           teach has been seen, and the first told move (the teach) comes 1.5 s after arrival.
//   TEACH   the first shard comes OUT OF HER (her '!' and her sceptre-up pose, 0.5 s) from the ring at her feet, the plate rides it bigger and is read from where you stand, a struck shard
//           shows a hit confirm ON HER (her flash + 'STRUCK - 8%' + a ring), a blow straight at her shows 'NO EFFECT' (a ward glance), and the plate says it in two lines.
// ?gq6fix=0 / BRACKEN_GQ6FIX=0 / globalThis.BRACKEN_GQ6FIX=false = the old entry and teach (batch182 cell for cell).
export const GQ6FIX_SHIPS = true;
export function gq6fixOn() {
  try { if (globalThis.BRACKEN_GQ6FIX === false || globalThis.BRACKEN_GQ6FIX === '0') return false; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq6fix=0\b/.test(location.search || '')) return false; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ6FIX === '0') return false; } catch { /* no node */ }
  if (GQ6FIX_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ6FIX === true || globalThis.BRACKEN_GQ6FIX === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq6fix=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ6FIX === '1') return true; } catch { /* no node */ }
  return false;
}
export const Q6 = gq6fixOn();
export const Q6N = {
  dx: 12 * 16,        // she stands this far WEST of the arrival ring (the hero's side of the cupola: the deck's west half is 24 tiles of open floor, the cupola block starts 4 tiles east of the exit)
  card: 1.0,          // the roof's name card (bossStart gives 1.6)
  firstBlink: 9,      // s: her first blink (the old 3 s took her away from the hero before anything had happened)
  tellT: 0.5,         // the teach's own told move
};
