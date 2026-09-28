// src/pogo-chain.js - OFF THEIR HEADS: ONE BOUNCE FOR EVERY HERO (the combat pass, part 2; Daniel, 2026-09-28).
//
// A foe's head is a stepping stone: the wasps over the Wood's pond, a string of anything over a pit. It only works as ground if it
// throws every hero back up the same way, and it did not:
//   - THE DEATH KNIGHT'S plunge onto a foe tore a shade out of it (the cull) and then fell straight through into a ground swing: no
//     rebound at all, so a pit crossed on heads by the knight was a pit the Death Knight fell into
//   - a plain STOMP (falling onto a head without the plunge) threw every hero up, but was not a pogo: it did not count toward a chain
// Now every plunge that lands on a head rebounds at POGO (the knight's own), the cull included; the Warden keeps her own rule - she
// never bounces: on footing she pins or perches, and over a drop she VAULTS off it (VAULT_HIGH/LOW in main.js, as high as a pogo) -
// and a stomp is a pogo too: it rebounds as it always did and counts in the chain. THE CHAIN: three heads without touching the ground
// says CHAIN! (as before), for every hero and both ways down.
// main.js calls bounce() where each rebound was written out by hand.

export const POGO_CHAIN = { plunge: -330, stomp: -220, stompHeld: -290, say: 3, count: 0 };

/* THE PYROMANCER'S FIREDROP goes down ahead of her and lands first - and it burned the very head she was coming down on, so there
   was nothing left under her boots to come back up off (a one-blow wasp over a pit: she fell). It goes past the head she is about to
   land on now (her boots meet it and she bounces, the pogo every hero has) and burns whatever it finds below. */
export const firedropSpares = (e, P) => !!(P && P.plunge && !P.ground && Math.abs(e.x - P.x) < (e.w || 10) / 2 + 8 && e.y - (e.h || 10) > P.y - 6 && e.y - P.y < 80);

/* api: { P, keys, SFX, number, squash, bump: () => the chain after this one, spare(head) } */
export function bounce(api, kind, head) {
  const P = api.P; if (head && api.spare) api.spare(head);   /* the head she came up off is not then burned by her own firedrop, a frame behind her */
  P.vy = kind === 'plunge' ? POGO_CHAIN.plunge : (api.keys.jump ? POGO_CHAIN.stompHeld : POGO_CHAIN.stomp);
  P.ground = false; P.plunge = false; P.canCut = false; P.hitSet.clear();
  if (api.SFX.pPogo) api.SFX.pPogo();
  const n = api.bump(); POGO_CHAIN.count++;
  if (n === POGO_CHAIN.say) { if (api.SFX.laugh) api.SFX.laugh(); api.number(P.x, P.y - 26, 'CHAIN!', '#8fd160'); }
  api.squash(0.8, 1.25, 0.1);
}
