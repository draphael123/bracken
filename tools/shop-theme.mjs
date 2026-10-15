import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{LEVELS}from'../src/level.js';
// claude/music1015: the shops' tune is now RandomMind's CC0 "The Bard's Tale" (audio/store.ogg, credited in MUSIC_CREDITS, the credits page and audio/CREDITS.txt); it replaced the in-house 40-second 'Warm Counter' PCM wav.
const shops=LEVELS.map(l=>l.build()).filter(l=>l.shop);assert.equal(shops.length,4);assert(shops.every(l=>l.music==='store'));
const w=readFileSync(new URL('../audio/store.ogg',import.meta.url));assert.equal(w.toString('ascii',0,4),'OggS');assert.equal(w.toString('ascii',29,35),'vorbis');assert.equal(w.readUInt8(39),2);assert.equal(w.readUInt32LE(40),44100);
const au=readFileSync(new URL('../src/audio.js',import.meta.url),'utf8');assert(au.includes("store: './audio/store.ogg'"));assert(au.includes('RandomMind'));
console.log('All four shops use the credited Ogg Vorbis stereo 44.1 kHz store theme (The Bard\'s Tale, CC0).');
