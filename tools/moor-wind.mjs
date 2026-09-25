import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';import {LEVELS,T} from '../src/level.js';
const L=LEVELS.find(l=>l.id==='moor').build(),s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
/* EVERY ROPE IS ONE ROPE (2026-09-22): the downdraft cliff's lips were laid over its rope and cut it in three - the climb stopped under each lip */
{const cols={};for(let y=0;y<L.H;y++)for(let x=0;x<L.W;x++)if(L.grid[y*L.W+x]===T.NET)(cols[x]||=[]).push(y);for(const [x,ys] of Object.entries(cols))assert.equal(ys[ys.length-1]-ys[0]+1,ys.length,'the rope at x '+x+' is cut: rows '+ys.join(','));}
/* NO GALE MOOR COLUMN IS WRITTEN BY HAND HERE (the rework, docs/briefs/gale-moor-rework.md). This file used to hold the grown
   level's columns - W 996, the landing at 952, the river ladder at 283, the rail at 250, the cliff at 583 - and a cut would have
   left every one of them pointing at the wrong place. Everything below is read off the built level. */
const TS=16,col=px=>Math.floor(px/TS),at=(x,y)=>L.grid[y*L.W+x];
/* THE CUT HOLDS: about seven hundred columns (F1), and the builder's sections tile the level with no gap and no overlap */
assert(L.W>=650&&L.W<=720,'Gale Moor is '+L.W+' columns: the rework cut it to about 700');
{const S=L.sections;assert(S&&S.length>=7,'the builder names its sections');assert.equal(S[0].x0,0);assert.equal(S[S.length-1].x1,L.W-1,'the last section ends at the level edge');
 for(let i=1;i<S.length;i++)assert.equal(S[i].x0,S[i-1].x1+1,'section '+S[i].id+' starts where '+S[i-1].id+' ends');}
/* the kite lets go over ground: the column under the string's cut has footing within the view */
{const x=L.flight.x1;let y=0;while(y<L.H&&at(x,y)===T.AIR)y++;assert(y<L.H&&at(x,y)!==T.SPIKE,'the kite lets go at '+x+' over ground');}
/* and on that ground, west of the Windcaller's wall, a checkpoint (B6: one OUTSIDE the arena walls; the rework's part three) */
assert(L.ents.some(e=>e.t==='check'&&e.x>=L.flight.x1&&e.x<L.arena.wallL),'a checkpoint on the landing, between the cut of the kite string ('+L.flight.x1+') and the arena wall ('+L.arena.wallL+')');
assert(L.roosts.every(([x])=>x*16>L.arena.x0&&x*16<L.arena.x1));assert(L.ambushes.every(a=>a.waves.flat().every(e=>e[1]>a.wallL&&e[1]<a.wallR)));
/* THE WIND RIVERS' BANK LADDER: a rope stands at the rail's far end, down to the river bed, for anyone who misses the exit */
const R=L.airRails[0];{const x1=col(R.x1);assert([0,1,2].some(d=>at(x1+d,col(R.y)+6)===T.NET),'a bank ladder at the rail\'s exit, '+x1);}
const noop=()=>{},P={x:Math.round((R.x0+R.x1)/2),y:R.y+8,vx:0,vy:20,dead:false,ground:false};const c=vm.createContext({L,P,time:0,jumpPress:false,keys:{},bossActive:false,callerCalm:()=>false,dust:noop,boss:null,SFX:new Proxy({},{get:()=>noop})});vm.runInContext(s.slice(s.indexOf('const GUST_TELL'),s.indexOf('function drawToldGust')),c);c.updateMoorWind(1/60);assert.equal(P.vx,R.speed);c.jumpPress=true;c.updateMoorWind(1/60);assert.equal(P.vy,-260);assert.equal(P.railRelease,.6);c.jumpPress=false;
/* THE DOWNDRAFT CLIFF: pushed down while it blows, free in the lull, and sheltered on a lip */
const D=L.downCliffs[0],rope=(()=>{for(let x=col(D.x0);x<=col(D.x1);x++)if(at(x,col(D.y1)-2)===T.NET)return x;return null;})();assert(rope!==null,'the cliff has its rope');
Object.assign(P,{x:rope*16+8,y:D.y1-16,vy:-74});c.updateMoorWind(1/60);assert.equal(P.vy,100);c.time=D.on+0.5;P.vy=-74;c.updateMoorWind(1/60);assert.equal(P.vy,-74);c.time=0;P.y=D.shelters[0][2];P.vy=-74;c.updateMoorWind(1/60);assert.equal(P.vy,-74);
assert(s.indexOf('  updateMoorWind(dt);')<s.indexOf('  if (P.asleep > 0) { P.jbuf'),'wind acts after ladder velocity, before movement');
console.log('Air rail carry/release, downdraft/lull/shelter, recovery ladder, the cut ('+L.W+' columns in '+L.sections.length+' sections) and the summit/ambush metadata verified off the built level.');
