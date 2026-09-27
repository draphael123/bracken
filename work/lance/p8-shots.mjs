import { patch } from './patch.mjs';
patch('work/lance/shots.mjs', [
  ["    for (const [name, frames] of [['bowman-called', 30], ['bowman-up', 200]]) {", "    for (const [name, frames, at] of [['bowman-called', 30, 312], ['bowman-up', 200, 312], ['bowman-called-offscreen', 30, 380]]) {"],
  ["        BK.tp(312, 29); BK.sim(40);\n        for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;\n        for (let k = 0; k < 200; k++)", "        BK.tp(312, 29); BK.sim(40); BK.tp(${at}, 29);\n        for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;\n        for (let k = 0; k < 200; k++)"],
]);
