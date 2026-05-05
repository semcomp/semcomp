const fs = require('fs');
const path = 'front-site/src/main.tsx';
let content = fs.readFileSync(path, 'utf8');
content = `window.addEventListener('error', (e) => console.error("GLOBAL ERROR:", e.error));\n` + content;
fs.writeFileSync(path, content);
