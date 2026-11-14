// src/linecart-lab.js - THE CART'S TEST ROOM (claude/hlcartk, 11-14). Not on the road, on no level list: data only, the shape HLCARTL copies. tools/hl-cart.mjs flies it.
// One three-leg SWITCHBACK ride up an 80 x 70 shaft: S0 (east cart stop 8) -> S1 (70) -> S2 (8) -> S3 (70, the exit). Each leg crosses 62 tiles and rises 8 rows (~10.3 s at 96 px/s).
export const LINECART_LAB = {
  id: 'linecartlab', name: 'THE HIGH LINES (CART LAB)', w: 80, h: 70,
  landings: [
    [2, 60, 14, 61],    // S0 the start station (checkpoint)
    [64, 52, 76, 53],   // S1 pass-through
    [2, 44, 14, 45],    // S2 pass-through
    [64, 36, 76, 37],   // S3 the end station (exit)
  ],
  checkpoints: [{ x: 4, y: 60 }],
  exit: [66, 32, 73, 36],
  lineCarts: [{
    id: 'labride', stations: [{ x: 8, top: 60 }, { x: 70, top: 52 }, { x: 8, top: 44 }, { x: 70, top: 36 }],
    floats: [{ leg: 0, at: 0.35, text: 'THEY BOARD. KNOCK THEM OFF.' }, { leg: 1, at: 0.5, text: 'HOLD ON.' }],
  }],
  lineKit: { lines: [], anchors: [] },   /* the cart's ropes are added by placeRide / the proof: cartKitLines(ride) */
};
