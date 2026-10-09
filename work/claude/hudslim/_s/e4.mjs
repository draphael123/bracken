export default [
["    ok(cached['bracken-shell-v1'] && cached['bracken-shell-v1'].includes('/index.html') && cached['bracken-shell-v1'].some(p => p.endsWith('/src/main.js')), 'the shell was not cached: ' + JSON.stringify(Object.keys(cached)));",
 "    const shellKey = Object.keys(cached).find(k => /^bracken-shell-v\\d+$/.test(k));   /* (the cache is named by sw.js VERSION: v2 since the font pair; the test follows the name, it checks the same files) */\n    ok(shellKey && cached[shellKey].includes('/index.html') && cached[shellKey].some(p => p.endsWith('/src/main.js')), 'the shell was not cached: ' + JSON.stringify(Object.keys(cached)));"],
];
