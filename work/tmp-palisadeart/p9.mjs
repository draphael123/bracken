import { edit } from './patch.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const M = 'src/main.js';
edit(M, "import * as PWB from './redraw/palisade_backdrop.js';", "import * as PWB from './redraw/palisade_backdrop.js'; import * as PWF from './redraw/palisade_foes.js';");
edit(M, "SPR.mother = SW2M.bakeIcon();", "SPR.mother = SW2M.bakeIcon(); SPR.stakesetter = PWF.bakeStakeSetter(); SPR.stakethrower = PWF.bakeStakeThrower(SPR.rockgoblin); SPR.maulcrew = PWF.bakeMaulCrew(SPR.brute);   /* (claude/palisadeart) THE PALISADE WOOD's own people: the stake-setter drawn by hand, the stake-thrower and the maul crew in the rock-goblin's and the brute's frames (src/redraw/palisade_foes.js) */");
edit(M, "if (e.pw) Object.assign(enemies[i], e.pw); } });", "if (e.pw) Object.assign(enemies[i], e.pw); if (e.pw && e.pw.pwSetter) enemies[i].cnSkin = 'stakesetter'; } });   /* (claude/palisadeart) THE STAKE-SETTER wears his own sheet, name and bestiary card */");
edit(M, "    else if (e.t === 'sprig' && (e.mode === 'biteTell' || e.mode === 'bite')) frame = e.mode === 'biteTell' ? 5 : 6;", "    else if (e.pwSetter && e.alive && (e.setMode === 'tell' || e.setSlam > 0)) frame = e.setMode === 'tell' ? 5 : 6;   /* (claude/palisadeart) THE STAKE-SETTER: the mallet raised, the stake driven */\n    else if (e.t === 'sprig' && (e.mode === 'biteTell' || e.mode === 'bite')) frame = e.mode === 'biteTell' ? 5 : 6;");
edit(M, "  { t: 'myconidguard', name: 'MYCONID GUARD'", `  { t: 'stakesetter', name: 'STAKE-SETTER', sub: 'a wall in your way', desc: 'The work-boss of the palisade: a goblin with an armful of stakes and a great mallet. When you come close he shouts and the mallet goes up: a wall of two rows of stakes is driven between you. Knock it down with two blows, or jump it. He sets one at a time, never on top of you.' },
  { t: 'stakethrower', name: 'STAKE-THROWER', sub: 'a quiver of sharp timber', desc: 'A goblin of the work crews with a quiver of spare stakes on his back: he stands off and flings them overhand. A thrown stake is slow enough to see and a block takes it. Close the gap or take cover behind the timber.' },
  { t: 'maulcrew', name: 'MAUL CREW', sub: 'the ones who drive the posts', desc: 'A hooded goblin with a maul bound in iron: the same hands that drive the palisade posts. Two tells: a double mark is the overhead, which cannot be blocked, so dodge it; a single mark is the sweep, which a shield holds. Cut him while the maul is raised or while he rests.' },
  { t: 'myconidguard', name: 'MYCONID GUARD'`);
const W = 'src/palisade-wood.js';
edit(W, "    ambient: [{ x0: 0, x1: 99999, kind: 'palisade' }],", "    reskin: { rockgoblin: 'stakethrower', brute: 'maulcrew' },   /* (claude/palisadeart) the work crews' own sheets (the setter's is given at spawn: pw.pwSetter): art, names and cards only, so the level's hash is the greybox's */\n    ambient: [{ x0: 0, x1: 99999, kind: 'palisade' }],");
const H = 'src/palisade-hands.js';
edit(H, "    e.setT = (e.setT || 0) - dt;\n", "    e.setT = (e.setT || 0) - dt; if (e.setSlam > 0) e.setSlam = Math.max(0, e.setSlam - dt);\n");
edit(H, "e.setMode = null; e.setT = SETTER.cd; const w = e.setWall; e.setWall = null;", "e.setMode = null; e.setT = SETTER.cd; e.setSlam = 0.32; const w = e.setWall; e.setWall = null;");
// setterOver no-op
let s = readFileSync(H, 'utf8'); const crlf = s.includes('\r\n'), nl = crlf ? '\r\n' : '\n';
const a = s.indexOf("  /* the setter's mallet raised"), b = s.indexOf('  /* THE LANDMARK on the skyline', a);
s = s.slice(0, a) + ["  /* the setter's mallet and his stakes are drawn in his own frames (src/redraw/palisade_foes.js: 5 the raise, 6 the drive); nothing is laid over him now */", "  H.setterOver = () => {};"].join(nl) + nl + s.slice(b); writeFileSync(H, s);
