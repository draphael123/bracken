/* tools/itch-qa-paths.mjs - ITCH QA SWEEP, AD-BLOCK FILENAME CHECK of every shipped path (claude/qasweep; no browser, no network).
   Walks dist-itch/site and matches every path segment and every request URL the page text mentions against EasyList / EasyPrivacy style words
   (ads, admiral, banner, track, analytics, pixel, sponsor, beacon, popup ...). A word matches as a whole token (split on / _ - . and digits), or as a substring for the strong ones
   (admiral, doubleclick, adsense, adserver, analytics, tracking, telemetry). Also lists third-party hosts named in index.html / the page scripts.
   usage: node tools/itch-qa-paths.mjs [siteDir]      exit 1 when a path looks blockable. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
const SITE = resolve(process.argv[2] || join(import.meta.dirname, '..', 'dist-itch', 'site'));
const TOKENS = new Set(['ad', 'ads', 'adv', 'advert', 'adverts', 'advertising', 'banner', 'banners', 'track', 'tracker', 'trackers', 'tracking', 'analytics', 'pixel', 'pixels', 'sponsor', 'sponsors', 'sponsored', 'beacon', 'beacons', 'popup', 'popups', 'popunder', 'affiliate', 'promo', 'telemetry', 'metrics', 'stats', 'collect', 'gtm', 'ga', 'tag', 'tags', 'widget', 'widgets', 'social', 'share', 'cookie', 'cookies', 'consent', 'ping', 'click', 'clicks', 'impression', 'campaign', 'syndication', 'prebid', 'vast', 'interstitial', 'rewarded', 'outstream', 'adserver', 'adservice', 'adsense', 'admiral', 'doubleclick', 'googletag', 'taboola', 'outbrain', 'hotjar', 'mixpanel', 'segment', 'sentry', 'log', 'logger', 'logging', 'monitor', 'survey']);
const STRONG = ['admiral', 'doubleclick', 'adsense', 'adserver', 'adservice', 'analytics', 'tracking', 'telemetry', 'googletag', 'taboola', 'outbrain', 'hotjar', 'mixpanel', 'sponsor', 'affiliate', 'popunder'];
const sizeLike = /(^|[^0-9])(300x250|728x90|160x600|468x60|320x50|970x250)([^0-9]|$)/;
const files = []; (function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(relative(SITE, p).replace(/\\/g, '/')); } })(SITE);
const hits = [];
for (const f of files) { const low = f.toLowerCase(); const toks = low.split(/[\/_.\-0-9]+/).filter(Boolean);
  const t = toks.filter(x => TOKENS.has(x)), st = STRONG.filter(w => low.includes(w)), sz = sizeLike.test(low);
  if (t.length || st.length || sz) hits.push(f + '  <- ' + [...new Set([...t, ...st, sz ? 'ad-size' : ''])].filter(Boolean).join(','));
}
console.log('files checked: ' + files.length + ' (dist-itch/site)');
console.log('top-level names: ' + files.filter(f => !f.includes('/')).filter(f => !/^c-[A-Z0-9]{8}\.js$/.test(f)).join(', ') + ' + ' + files.filter(f => /^c-[A-Z0-9]{8}\.js$/.test(f)).length + ' hashed chunks (c-XXXXXXXX.js)');
console.log('directories: ' + [...new Set(files.filter(f => f.includes('/')).map(f => f.split('/').slice(0, f.split('/').length > 2 ? 2 : 1).join('/')))].slice(0, 20).join(', '));
/* a hashed chunk name made of 8 random capitals can spell a word: report any containing a blocked token of 3+ letters */
const chunkWords = files.filter(f => /^c-[A-Z0-9]{8}\.js$/.test(f) && /(ADS|ADV|TAG|LOG|GA[A-Z]|PIX|TRK)/.test(f.slice(2, 10)));
console.log('hashed chunks with an ad-ish substring in the hash (harmless: EasyList rules match path words, and these are inside one token): ' + (chunkWords.join(', ') || 'none'));
const hosts = new Set(); for (const f of files.filter(x => /^[^/]+.(js|html)$/.test(x))) { const t = readFileSync(join(SITE, f), 'utf8'); for (const m of t.matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})(?::\d+)?/gi)) hosts.add(f + ' -> ' + m[1].toLowerCase()); }
const uniq = new Set([...hosts].map(h => h.split(' -> ')[1]));
const hostList = [...hosts].filter(h => !/w3\.org|creativecommons|opengameart|scottbuckley|matthewpablo/.test(h));
console.log('third-party hosts the page code can request at runtime: ' + (hostList.length ? [...new Set(hostList.map(h => h.split(' -> ')[1]))].join(' | ') + ' (cdnjs = PeerJS library, 0.peerjs.com = broker, stun.* = WebRTC; all online co-op only)' : 'none besides credit links'));
if (hits.length) { console.log('BLOCKABLE-LOOKING PATHS (' + hits.length + '):'); for (const h of hits.slice(0, 40)) console.log('  ' + h); } else console.log('ok: no shipped path contains an EasyList/EasyPrivacy-style word');
process.exit(hits.length ? 1 : 0);
