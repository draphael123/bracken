import{installLabCollection}from'./lab-collect.mjs';import assert from'node:assert/strict';
let n=0;const result={},calls=[],bk={tag:'same',load(...args){calls.push([this.tag,args]);return result;},setHero(){throw result;},reset(o){return o;}};
assert.equal(installLabCollection(bk,()=>n++,undefined,4),3);assert.equal(bk.load(4,'x'),result);assert.deepEqual(calls,[['same',[4,'x']]]);assert.equal(n,1);assert.throws(()=>bk.setHero('pyro'),e=>e===result);assert.equal(n,1);
const plain={fresh:false};assert.equal(bk.reset(plain),plain);assert.equal(n,1);const fresh={fresh:true};assert.equal(bk.reset(fresh),fresh);assert.equal(n,1);bk.reset(fresh);assert.equal(n,1);bk.reset(fresh);assert.equal(n,2);assert.equal(installLabCollection(bk,()=>n++,undefined,4),0);
let control=0;const other={load(){},reset(){},setHero(){}};assert.equal(installLabCollection(other,()=>control++,['load']),1);other.reset({fresh:true});other.setHero('knight');assert.equal(control,0);other.load();assert.equal(control,1);
console.log('PASS lab collection: return/throw/this/arguments preserved; fresh reset only; idempotent; load-only control');

let immediate=0;const eager={load(){},setHero(){},reset(){}};installLabCollection(eager,()=>immediate++);eager.setHero();eager.reset({fresh:true});assert.equal(immediate,2);eager.reset();assert.equal(immediate,2);

let rounds=0,updates=0;const token={},driver={sim(n=1){updates+=n;return token;},step(n=1){updates+=n;},draw1(){},look(){}};installLabCollection(driver,()=>rounds++);assert.equal(driver.sim(239),token);assert.equal(rounds,0);driver.step();assert.equal(updates,240);assert.equal(rounds,1);for(let i=0;i<59;i++)driver.draw1();assert.equal(rounds,1);driver.look();assert.equal(rounds,2);
console.log('PASS long lab simulations: same calls, arguments, returns and update count; collection only at helper boundaries');
