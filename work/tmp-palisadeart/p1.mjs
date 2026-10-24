import { edit } from './patch.mjs';
const M = 'src/main.js';
edit(M, "let PWH = null; import { makeBatteringBeastHands", "let PWH = null; import * as PWT from './redraw/palisade_tiles.js'; import { makeBatteringBeastHands");
edit(M, "if (L.rootway) { const ts = RWT.rootTile(t, x, y, tileAt, T, L); if (ts) s = ts; }", "if (L.rootway) { const ts = RWT.rootTile(t, x, y, tileAt, T, L); if (ts) s = ts; }\n    if (L.pwood) { const ts = PWT.pwTile(t, x, y, tileAt, T, L); if (ts) s = ts; }   /* (claude/palisadeart) THE PALISADE WOOD's tile kit: leaf-litter loam, the palisade's standing logs, the gatehouse's hewn beams, scaffold decks, loose boards (src/redraw/palisade_tiles.js) */");
