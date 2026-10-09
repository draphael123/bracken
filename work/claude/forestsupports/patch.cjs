const fs = require('fs');
let a = fs.readFileSync('src/route-art.js', 'utf8'); const nl = a.includes('\r\n') ? '\r\n' : '\n';
a = a.replace("import {canvas} from './px.js';", "import {canvas} from './px.js';" + nl + "import {drawForestSupport} from './forest-supports-art.js';");
a = a.replace("bottom<0||y>g.canvas.height)continue;", "bottom<0||y>g.canvas.height)continue;" + nl + " if(p.kind){drawForestSupport(g,p,cx,cy);continue;}");
fs.writeFileSync('src/route-art.js', a);
let b = fs.readFileSync('src/island-posts.js', 'utf8');
b = b.replace("export const MAX_DROP", "import { addForestSupports } from './forest-supports.js';" + nl + "export const MAX_DROP");
b = b.replace("if (!POST_LEVELS.has(id) || !L || !L.grid) return L;", "addForestSupports(L, id, T, islandsOf);   /* the forest and crag levels: their own kit (src/forest-supports.js) */" + nl + "  if (!POST_LEVELS.has(id) || !L || !L.grid) return L;");
fs.writeFileSync('src/island-posts.js', b);
