import { readFileSync, writeFileSync } from 'node:fs';
const f = 'src/main.js'; const s = readFileSync(f, 'utf8').split('\n');
if (s[6389].trim() !== '];') throw new Error('line 6389 is not the end of BEASTS: ' + JSON.stringify(s[6389]));
s.splice(6390, 0, "/* (claude/falseabbot) THE MONASTERY 3's False Abbot (behind MON3): his own chapel and the belfry over it - the card says what hurts him there */",
  "if (MON3) { const ab = BEASTS.find(q => q.t === 'abbot'); if (ab) ab.desc = \"The priest's superior, in a cope that fits and a mitre that does not, holding mass in his own chapel under the bells. His ward comes from the house, and a warded Abbot takes less than half of every blow. So turn the house on him. His rood and his belfry bridges hang from bells: strike a bell while he kneels on its bridge and it drops with him. He lights a brazier to pray: ride its smoke up and come down on him. Past half his blood he brings the belfry floor down and fights on among the bells, where a struck bell's ring runs along the beams: jump it. When he is beaten down, the great bell is the last blow.\"; }");
writeFileSync(f, s.join('\n')); console.log('inserted');
