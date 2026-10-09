require('./rep.cjs')('tools/store.mjs', rep => {
rep("smith:'items',music:'music',practice:null}[t.id];", "smith:'items',flasks:'flaskItems',music:'music',practice:null}[t.id];");
rep("tonic:buy('smith','tonic'),", "tonic:buy('flasks','tonic'),");
rep(" *   H. BUYING STILL WORKS (a skin, an edge, an extra flask - the old tonic line, an ability)", " *   H. BUYING STILL WORKS (a skin, an edge, an extra flask - the old tonic line, on the FLASKS tab since claude/flasks2, an ability)");
});
require('./rep.cjs')('tools/survival.mjs', rep => {
rep("assert.equal(SV.flaskMax({}), 1); assert.equal(SV.flaskMax({ flaskUp: 9 }), 3);   /* (survival2: one to start, max three) */",
  "assert.equal(SV.flaskMax({}), 1); assert.equal(SV.flaskMax({ flaskUp: 9 }), 4);   /* (survival2: one to start; claude/flasks2: EXTRA FLASK I, II and the hidden III - max four) */");
});
