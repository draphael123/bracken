require('./rep.cjs')('src/main.js', rep => {
// 1. import
rep("import * as SV from './survival.js';", "import * as SV from './survival.js'; import * as F2 from './flasks2.js';   /* FLASKS 2 (claude/flasks2, Daniel 10-08): the flask row, the drink, the store's FLASKS tab, the finds and objectives */");
// 2. migration
rep("  PROG.flaskUp = Math.max(0, Math.min(SV.FLASK.extraMax, PROG.flaskUp | 0));\n", "  PROG.flaskUp = Math.max(0, Math.min(SV.FLASK.extraMax, PROG.flaskUp | 0)); F2.migrate(PROG);   /* (claude/flasks2) the old EXTRA FLASK count becomes EXTRA FLASK I/II owned; flaskUp is the count of the FLASKS tab's count lines */\n");
// 3. icons
rep("    hudFlask: outline(fromGrid(['..c..', '..c..', '.rrr.', 'rrrrr', 'rLrrr', '.rrr.'], { c: '#c9d1dc', r: '#c9463d', L: '#ff9a9a' }, 1), ART.OUT),\n",
 "    hudFlask: outline(fromGrid(['..c..', '..c..', '.rrr.', 'rrrrr', 'rLrrr', '.rrr.'], { c: '#c9d1dc', r: '#c9463d', L: '#ff9a9a' }, 1), ART.OUT),\n" +
 "    hudFlaskEmpty: outline(fromGrid(['..c..', '..c..', '.g.g.', 'g...g', 'g...g', '.ggg.'], { c: '#6a6a7a', g: '#5a5468' }, 1), ART.OUT),   /* (claude/flasks2) a drunk flask: the empty glass, not a faint full one */\n" +
 "    hudFlaskGold: outline(fromGrid(['..c..', '..c..', '.yyy.', 'yyyyy', 'yLyyy', '.yyy.'], { c: '#fff6c8', y: '#e0a830', L: '#fff2a0' }, 1), ART.OUT),   /* a flask OVER the max (a broken shrine's) */\n" +
 "    flaskIcons: { rich: outline(fromGrid(['..c..', '..c..', '.rrr.', 'rrrrr', 'rLrrr', '.rrr.'], { c: '#ffd36b', r: '#a8302a', L: '#ff9a5c' }, 1), ART.OUT), distilled: outline(fromGrid(['..c..', '..c..', '.rrr.', 'rrrrr', 'rLrrr', '.rrr.'], { c: '#dfe8ff', r: '#d04a6a', L: '#ffd0e0' }, 1), ART.OUT), sunlight: outline(fromGrid(['y.c.y', '..c..', '.yyy.', 'yyyyy', 'yLyyy', '.yyy.'], { c: '#fff6c8', y: '#ffd34a', L: '#ffffff' }, 1), ART.OUT),\n" +
 "      quick: outline(fromGrid(['....c..', '....c..', 'w..rrr.', '.wrrrrr', 'w.rLrrr', '...rrr.'], { c: '#c9d1dc', r: '#c9463d', L: '#ff9a9a', w: '#fff6e0' }, 1), ART.OUT), steady: outline(fromGrid(['.b.b.', '.b.b.', 'bbbbb', 'bbbbb', '.bbbb', '..bb.'], { b: '#c9a070' }, 1), ART.OUT), blessing: outline(fromGrid(['..y..', '.yyy.', '..s..', '.sss.', '.sss.', 'sssss'], { y: '#ffd36b', s: '#9a9aa8' }, 1), ART.OUT),\n" +
 "      hidden: outline(fromGrid(['.ggg.', 'g...g', '...g.', '..g..', '.....', '..g..'], { g: '#8a8a9a' }, 1), ART.OUT) },   /* THE FLASKS TAB's lines (an art pass will redraw them) */\n");
});
