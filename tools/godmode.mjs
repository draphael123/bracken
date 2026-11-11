// tools/godmode.mjs - GOD MODE and UNLOCK EVERYTHING (claude/godmode; Daniel 2026-10-07). The two TESTING settings were swapped in name:
//   UNLOCK EVERYTHING = SET.godmode (the old "God mode": owns everything, opens every wood, writes nothing to the save);
//   GOD MODE = SET.invincible (the old "Invincible", and now the real thing): hp and stamina held full through hits, poisons and a pit,
//   an infinite jump in the air, hold JUMP to rise slowly, DOWN to drop - and an ASSIST: no medal, no silver, no no-hit / iron mark, no best time.
// The saved keys are unchanged (godmode, invincible), so an old save keeps its values. In the page: settings rows + labels, then the play.
// suite1 11-11 (Daniel Q6): the browser half (invincibility, mid-air jumps, the pit, the assist earning nothing - 44 s, one page) was a one-off proof of the 10-07 rename and is retired; the rename itself
// stays asserted here in Node, and the settings rows are also exercised by settings-tabs and save-safety.
import assert from 'node:assert/strict';
import { TAB_ITEMS, tabOf, LEGACY_ROWS } from '../src/settings-ui.js';
for (const k of ['Unlock everything', 'God mode']) assert.equal(tabOf(k), 'gameplay', k + ' is a gameplay row');
assert(!tabOf('Invincible'), 'the old Invincible row is gone'); assert(LEGACY_ROWS.includes('God mode') && LEGACY_ROWS.includes('Unlock everything'));
console.log('ok  godmode  the settings rows are renamed (UNLOCK EVERYTHING / GOD MODE are gameplay rows, Invincible is gone, the legacy names are kept); the in-page play half is retired (suite1)');
