// src/gq4p.js - GQ4P: HIGHCROWN PASS 4, THE GOBLIN PRINCESS (Daniel 11-10 07:45, scratch gq4-plan.md section 2). One switch, default OFF: OFF = master's Princess move for move.
// ON (needs GQ4L's 46-column bell tower too): THE GATES (G-W, G-E, G-U; a chain pin knocks an open one shut), 'GUARDS!' calls goblins through the open ones, THE KEY (she opens a shut one),
// the 50 % ALL GATES add phase (she is invincible until the ads die, 40 s failsafe), THE PIROUETTE in phase 2, hp 1080.
// The override: ?gq4p=1 on the page, globalThis.BRACKEN_GQ4P = true (tools/cdp.mjs sets it from the env BRACKEN_GQ4P=1), or BRACKEN_GQ4P=1 in a Node tool's env.
export const GQ4P_SHIPS = true;
export function gq4pOn() {
  if (GQ4P_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ4P === true || globalThis.BRACKEN_GQ4P === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq4p=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ4P === '1') return true; } catch { /* no node */ }
  return false;
}
export const P4 = gq4pOn();
