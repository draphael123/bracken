import assert from 'node:assert/strict';
import {keyVerb} from '../src/lab.js';
for(const family of ['plate','shell','beast','guard']) {
  const P={loaded:false,swim:false};
  const BK={P,keyOf:()=>({family,tripped:true})};
  const foe={x:100,y:0,w:16};P.x=P.y=0;
  assert.notEqual(keyVerb(BK,'pirate',foe),'heavy','empty pistol against '+family);
  P.loaded=true;
  assert.equal(keyVerb(BK,'pirate',foe),'heavy','loaded pistol against '+family);
  foe.x=20;
  assert.notEqual(keyVerb(BK,'pirate',foe),'heavy','use the blade when too close to wind the pistol');
}
console.log('Freebooter uses his pistol when loaded and a usable fallback when empty.');
