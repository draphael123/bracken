const fs=require('fs');let s=fs.readFileSync('src/stuck-spots.js','utf8');
s=s.replace("line: 'THE MONKS' HOIST: STAND IN ONE BASKET, RIDE THE OTHER UP' }","line: \"THE MONKS' HOIST: STAND IN ONE BASKET, RIDE THE OTHER UP\" }");
s=s.replace("line: 'THE BELL AT THE GUARDIAN'S DOOR: A WAY BACK UP FROM THE DORTER ROOF' }","line: \"THE BELL AT THE GUARDIAN'S DOOR: A WAY BACK UP FROM THE DORTER ROOF\" }");
fs.writeFileSync('src/stuck-spots.js',s);
let m=fs.readFileSync('src/monastery3.js','utf8'); m=m.replace("'the crag under the chapel and the guardian's floor: only the rope well parts it from the map wall'","\"the crag under the chapel and the guardian's floor: only the rope well parts it from the map wall\""); fs.writeFileSync('src/monastery3.js',m);
