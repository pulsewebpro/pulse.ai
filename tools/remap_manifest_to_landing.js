const fs = require('fs');
const p  = require('path');

const MAN = 'data/templates.manifest.json';
const PUB = p.join(process.cwd(), 'public');
const LAND = '/templates/landing.html';

function existsRel(rel){
  const abs = p.join(PUB, rel.replace(/^\//,''));
  try { return fs.existsSync(abs); } catch { return false; }
}

if (!existsRel(LAND)) {
  console.error('❌ No existe', LAND, 'en /public. Crea public/templates/landing.html');
  process.exit(1);
}

const arr = JSON.parse(fs.readFileSync(MAN, 'utf8'));
let fixed = 0;

for (const it of arr) {
  const rel = (it.previewPath || '').replace(/^\//,'');
  const ok  = rel && existsRel('/' + rel);
  if (!ok) {
    it.previewPath = LAND;
    fixed++;
  }
}

fs.writeFileSync(MAN, JSON.stringify(arr, null, 2));
console.log(JSON.stringify({fixed, message: fixed ? 'previewPath reparados a landing.html' : 'todo OK'}, null, 2));
