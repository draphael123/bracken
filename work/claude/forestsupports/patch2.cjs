const fs=require('fs');let a=fs.readFileSync('tools/solid-islands.mjs','utf8');
a=a.replace("scree: [55, NATURAL], hanging: [37, NATURAL], moor: [25, NATURAL],","/* scree hanging moor skyroad rootway glasssea witchlight: 0 - every slab stands on its own drawn kit (src/forest-supports.js) */");
a=a.replace(/\r?\n  skyroad: \[19[^\n]*\r?\n  witchlight: \[32[^\n]*/,"");
fs.writeFileSync('tools/solid-islands.mjs',a);
