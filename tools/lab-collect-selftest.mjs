import{installLabCollection}from'./lab-collect.mjs';import assert from'node:assert/strict';
let n=0;const result={},calls=[],bk={tag:'same',load(...args){calls.push([this.tag,args]);return result;},setHero(){throw result;},reset(o){return o;}};
assert.equal(installLabCollection(bk,()=>n++),3);assert.equal(bk.load(4,'x'),result);assert.deepEqual(calls,[['same',[4,'x']]]);assert.equal(n,1);assert.throws(()=>bk.setHero('pyro'),e=>e===result);assert.equal(n,1);
const plain={fresh:false};assert.equal(bk.reset(plain),plain);assert.equal(n,1);const fresh={fresh:true};assert.equal(bk.reset(fresh),fresh);assert.equal(n,1);bk.reset(fresh);assert.equal(n,1);bk.reset(fresh);assert.equal(n,2);assert.equal(installLabCollection(bk,()=>n++),0);
let control=0;const other={load(){},reset(){},setHero(){}};assert.equal(installLabCollection(other,()=>control++,['load']),1);other.reset({fresh:true});other.setHero('knight');assert.equal(control,0);other.load();assert.equal(control,1);
console.log('PASS lab collection: return/throw/this/arguments preserved; fresh reset only; idempotent; load-only control');
