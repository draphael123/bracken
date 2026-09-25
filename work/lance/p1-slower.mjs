import { patch } from './patch.mjs';
patch('src/main.js', [
  ["      want = ad > 40 ? e.face * 52 : 0;\n      // up close he mixes",
   "      want = ad > 40 ? e.face * 44 : 0;   /* SLOWER (Daniel, 2026-09-25: docs/briefs/lance-support.md): every stride of him about 15% down - 52 to 44 here, the charge 250 to 212, 78 to 66 behind the shield, the rush 230 to 196 */\n      // up close he mixes"],
  ["if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 3.2; e.vx = e.face * 250; e.passT = -1;", "if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 3.2; e.vx = e.face * 212; e.passT = -1;"],
  ["      want = e.face * 250;\n      if (!P.dead && e.hitT <= 0 && ad < 26", "      want = e.face * 212;\n      if (!P.dead && e.hitT <= 0 && ad < 26"],
  ["      want = ad > 22 ? e.face * 78 : 0;", "      want = ad > 22 ? e.face * 66 : 0;"],
  ["if (e.modeT <= 0) { e.mode = 'rush'; e.modeT = 0.55; e.vx = e.face * 230; e.hitT = 0; SFX.charge(); } break;",
   "if (e.modeT <= 0) { e.mode = 'rush'; e.modeT = 0.65; e.vx = e.face * 196; e.hitT = 0; SFX.charge(); } break;   /* 0.65 s at 196 runs the 126 px that 0.55 at 230 did: the rush still reaches the stride it was told at */"],
  ["      want = e.face * 230;\n      if (!P.dead && e.hitT <= 0 && ad < 22", "      want = e.face * 196;\n      if (!P.dead && e.hitT <= 0 && ad < 22"],
]);
