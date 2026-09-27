// tools/campaign-order.mjs — THE SHIM. The walk lives in src/campaign-order.js now, because the game reads it too (the
// catch-up XP asks how deep a level sits) and the page cannot load a .mjs. The tools keep importing it from here.
export * from '../src/campaign-order.js';
