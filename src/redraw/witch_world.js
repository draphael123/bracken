// witch_world.js — THE WITCHLIGHT STAIR's own tiles (2026-09-22, brief .claude/briefs/witchlight-redesign.md): RUNED TOWER STONE
// with glowing seams, for the aqueduct's piers, the cloister and the rune stair, and the LIBRARY CHUNK's shelved books. Drawn as
// skins over solid tiles by drawMageTiles (L.mage.skins kinds 'witch' and 'books'). px.js primitives only, so tools/node-canvas.mjs
// can render them in Node.
import { canvas, line } from '../px.js';

export function bakeWitchSkins() {
  const tile = fn => [0, 1, 2, 3].map(v => { const [c, g] = canvas(16, 16); fn(g, v); return c; });
  /* THE STONE: coursed blocks in a cold violet grey, every other course offset, a darker mortar; one in four has a RUNE SEAM - a
     crack the loose magic leaks through, lit from inside */
  const witch = tile((g, v) => {
    g.fillStyle = '#3c3450'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#463e5c'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 8, 16, 1);
    g.fillStyle = '#2a2438'; g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1);
    const j0 = (v * 5 + 4) % 16, j1 = (v * 5 + 12) % 16; g.fillRect(j0, 0, 1, 7); g.fillRect(j1, 8, 1, 7);
    g.fillStyle = '#50466a'; g.fillRect(j0 + 1, 1, 1, 6); g.fillRect(j1 + 1, 9, 1, 6);
    g.fillStyle = '#342c46'; for (let i = 0; i < 5; i++) g.fillRect((i * 7 + v * 3) % 15, (i * 5 + v) % 15, 1, 1);
    if (v === 1 || v === 3) { const x0 = v === 1 ? 3 : 9; line(g, x0, 2, x0 + 3, 6, '#7a4ab8'); line(g, x0 + 3, 6, x0 + 1, 12, '#7a4ab8');
      g.fillStyle = '#d8b8ff'; g.fillRect(x0 + 2, 4, 1, 1); g.fillRect(x0 + 3, 6, 1, 1); g.fillRect(x0 + 2, 9, 1, 1);
      g.fillStyle = 'rgba(184,132,255,0.25)'; g.fillRect(x0 - 1, 2, 6, 11); }
    if (v === 2) { g.fillStyle = '#6a5a8a'; g.fillRect(5, 10, 5, 1); g.fillRect(7, 9, 1, 3); g.fillStyle = '#b884ff'; g.fillRect(7, 10, 1, 1); }   /* a carved rune, cold */
  });
  /* THE LIBRARY CHUNK: shelves torn out of the tower with the floor still under them, the spines in reds, greens and violets */
  const books = tile((g, v) => {
    g.fillStyle = '#2a2236'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#4a3624'; g.fillRect(0, 7, 16, 2); g.fillRect(0, 15, 16, 1);
    const cols = ['#5a2a3a', '#2a4a3a', '#3a2a5a', '#5a4a2a', '#2a3a5a', '#6a2a2a'];
    for (let x = 0; x < 16; x += 2) for (const y0 of [0, 9]) { const k = (x * 7 + y0 * 3 + v * 11) % 13; if (k === 0) continue; const h = 5 + (k % 3);
      g.fillStyle = cols[k % cols.length]; g.fillRect(x, y0 + 7 - h, 2, h); if (k % 4 === 1) { g.fillStyle = '#c8a060'; g.fillRect(x, y0 + 7 - h + 1, 2, 1); } }
    g.fillStyle = '#6a5038'; g.fillRect(0, 7, 16, 1);
  });
  /* A LEDGE: a stone lintel held up by nothing, over the one-way tiles (the arch piece, the rune ledges, the arena's lip) */
  const ledge = tile((g, v) => { g.fillStyle = '#1b1626'; g.fillRect(0, 0, 16, 9); g.fillStyle = '#5a5070'; g.fillRect(0, 0, 16, 7); g.fillStyle = '#7a7094'; g.fillRect(0, 0, 16, 2);
    g.fillStyle = '#403856'; g.fillRect(0, 5, 16, 2); g.fillRect((v * 6 + 5) % 16, 2, 1, 3); if (v === 2) { g.fillStyle = '#c8a0ff'; g.fillRect(8, 3, 2, 1); } });
  return { witch, books, ledge };
}
