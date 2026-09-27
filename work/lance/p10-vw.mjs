import { patch } from './patch.mjs';
patch('src/main.js', [["x = Math.max(12, Math.min(308, x0)), y = Math.max(34, Math.round(c.y - cy) - 26), w = 16;", "x = Math.max(12, Math.min(VW - 16, x0)), y = Math.max(34, Math.round(c.y - cy) - 26), w = 16;   /* VW: the fight is drawn zoomed out, wider than the 320 buffer */"]]);
