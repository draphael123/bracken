const fs = require('fs');
module.exports = function patch(f, fn) { let s = fs.readFileSync(f, 'utf8'); const NL = s.includes('\r\n') ? '\r\n' : '\n';
  const rep = (a, b) => { a = a.split('\n').join(NL); b = b.split('\n').join(NL); const n = s.split(a).length - 1; if (n !== 1) throw new Error(f + ' match ' + n + ': ' + a.slice(0, 100)); s = s.replace(a, () => b); };
  fn(rep, () => s); fs.writeFileSync(f, s); console.log('patched', f); };
