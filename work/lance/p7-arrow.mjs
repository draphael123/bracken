import { patch } from './patch.mjs';
patch('src/main.js', [
  ["for (let q = 0; q < 3; q++) g.fillRect(x + s * (w / 2 + 2 + q), y - q, 1, 1 + 2 * q); }", "for (let q = 0; q < 3; q++) g.fillRect(x + s * (w / 2 + 2 + q), y - 2 + q, 1, 5 - 2 * q); }   /* an arrow, point outward, toward the lookout */"],
]);
