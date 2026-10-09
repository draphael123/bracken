require('./rep.cjs')('tools/leveling.mjs', rep => {
rep("assert(/id: 'tonic'[^\n]*max: 2/.test(src), 'the extra flasks do not take a hero to three (claude/survival2, Daniel 10-07 A10b: the tonic line is EXTRA FLASK, 1 + 2)');",
 "{ const f2 = readFileSync(new URL('../src/flasks2.js', import.meta.url), 'utf8'); assert(/id: 'tonic', group: 'COUNT'/.test(f2) && (f2.match(/group: 'COUNT'/g) || []).length === 3 && /F2\.FLASK_ITEMS/.test(src), 'the extra flasks do not take a hero to four (claude/flasks2, Daniel 10-08: EXTRA FLASK I (the old tonic line), II and the hidden III on the store\'s FLASKS tab)'); }");
});
