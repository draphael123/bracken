// work/mon3/hash.mjs <path-to-src/level.js> - a hash of THE MONASTERY's built grid + ents (flag-off regression check)
import { createHash } from 'node:crypto'; import { pathToFileURL } from 'node:url';
const { LEVELS } = await import(pathToFileURL(process.argv[2]).href);
const L = LEVELS.find(l => l.id === 'spire').build();
console.log(createHash('sha1').update(Buffer.from(L.grid)).update(JSON.stringify(L.ents)).digest('hex').slice(0, 12), L.ents.length);
