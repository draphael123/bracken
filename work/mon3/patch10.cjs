// work/mon3/patch10.cjs - THE CENSER-SWINGER: a goblin priest with `censer` smothers the brazier you ride (claude/monastery3-1105)
const fs = require('fs'); const f = 'src/main.js'; let s = fs.readFileSync(f, 'utf8');
const NL = s.includes('\r\n') ? '\r\n' : '\n';
const rep = (a, b) => { a = a.split('\n').join(NL); b = b.split('\n').join(NL); const n = s.split(a).length - 1; if (n !== 1) throw new Error('match ' + n + ': ' + a.slice(0, 70)); s = s.replace(a, b); };
rep("    case 'censer': e.vx = 0; if (e.modeT <= 0) e.mode = 'keep'; break;\n    case 'bellTell':",
"    case 'censer': e.vx = 0; if (e.modeT <= 0) e.mode = 'keep'; break;\n" +
"    /* (claude/monastery3-1105) THE CENSER-SWINGER (Daniel 11-02 15:55 #3; ent flag `censer` on a goblin priest - its own sprite and card are the art pass's):\n" +
"       it tends the monks' braziers, and when you ride one it swings its pot into the bowl and SMOTHERS it - the smoke dies under you. Told (!, the\n" +
"       censer's sound, the swing pose); a blow on the swing throws it off; a smothered brazier comes back after its usual cool (CENSER.cool). */\n" +
"    case 'snuffTell': e.vx = 0; { const v = e.snuffAt; if (v) e.face = Math.sign(v.x - e.x) || e.face; }\n" +
"      if (Math.random() < dt * 16) parts.push({ x: e.x + e.face * 7, y: e.y - 18, vx: (Math.random() - 0.5) * 8, vy: -20, life: 0.6, max: 0.6, col: '#d8d0c0', size: 1, grav: -16 });\n" +
"      if (e.stagger > 0) { e.mode = 'keep'; e.snuffCd = 1.5; break; }\n" +
"      if (e.modeT <= 0) { const v = e.snuffAt; e.mode = 'censer'; e.modeT = 0.4; e.snuffCd = 4 + Math.random();\n" +
"        if (v) { v.forceT = 0; v.coolT = CENSER.cool; v.active = false; burst(v.x, v.y - 12, 10, ['#6a6058', '#9aa39a', '#d8d0c0'], 50, 0.5); number(v.x, v.y - 30, 'SMOTHERED', '#9aa39a'); SFX.priestCenser(); } }\n" +
"      break;\n" +
"    case 'bellTell':");
rep("      if (!sees || e.stagger > 0) want = 0;\n      else if (e.cd <= 0 && e.onGround && priestFlock(e)",
"      e.snuffCd = (e.snuffCd || 0) - dt;\n" +
"      const smother = e.censer && e.onGround && !(e.stagger > 0) && e.snuffCd <= 0 ? props.find(v => v.t === 'vent' && v.incense && v.active && Math.abs(v.x - e.x) < 64 && Math.abs(v.y - e.y) < 24 && !P.dead && Math.abs(P.x - v.x) < 16 && P.y <= v.y + 2 && P.y > v.y - v.h - 8) : null;\n" +
"      if (smother) { e.mode = 'snuffTell'; e.modeT = 0.5; e.snuffAt = smother; e.vx = 0; number(e.x, e.y - e.h - 12, '!', '#ffd36b'); SFX.priestCenserTell(); }\n" +
"      else if (!sees || e.stagger > 0) want = 0;\n      else if (e.cd <= 0 && e.onGround && priestFlock(e)");
rep("      else { const fl = priestFlock(e, 200), near = fl.sort(",
"      else if (e.censer && e.home !== undefined && Math.abs(e.home - e.x) > 24) want = Math.sign(e.home - e.x) * e.speed * 0.8;   /* the censer-swinger goes back to its brazier */\n" +
"      else { const fl = priestFlock(e, 200), near = fl.sort(");
rep("cd: PRIEST.first + Math.random(), censerCd: 1 + Math.random(), bellCd: 0 }); break;",
"cd: PRIEST.first + Math.random(), censerCd: 1 + Math.random(), bellCd: 0, censer: !!e.censer, home: e.censer ? px : undefined }); break;");
rep("e.mode === 'censerTell' ? 5 : e.mode === 'censer' ? 6 :", "(e.mode === 'censerTell' || e.mode === 'snuffTell') ? 5 : e.mode === 'censer' ? 6 :");
fs.writeFileSync(f, s); console.log('ok');
