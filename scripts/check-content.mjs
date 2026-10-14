import fs from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync(new URL('../src/content.json',import.meta.url),'utf8'));
const ids=data.chapters.map(c=>c.id);
assert.equal(new Set(ids).size,ids.length,'Chapter IDs must be unique');
assert.equal(data.map.stops.length,10,'Keep all ten source map entries');
for(const stop of data.map.stops)assert(ids.includes(stop.chapter),`Missing map target ${stop.chapter}`);
function validate(value){
 if(Array.isArray(value))value.forEach(validate);
 else if(value && typeof value==='object'){
  if(value.src){for(const key of ['src','small'])assert(fs.existsSync(new URL(`../public/${value[key]}`,import.meta.url)),`Missing asset ${value[key]}`);assert(value.alt?.trim(),'Missing image alternative text');assert(value.width>0&&value.height>0,'Missing image dimensions');}
  Object.values(value).forEach(validate);
 }
}
validate(data);
const rooms=data.chapters.find(c=>c.id==='rooms-reimagined');
assert(rooms.continuation[0].includes('In the Deluxe Rooms, fishermen’s rope knots'),'Deluxe attribution must remain explicit');
assert(rooms.continuation[0].includes('The Pool Villas draw inspiration from Southern folk art'),'Villa attribution must remain explicit');
assert(data.chapters.find(c=>c.id==='hydra-collection').paragraphs.join(' ').includes('EggWong'),'Artist credit is required');
assert(!JSON.stringify(data).includes('/f_'),'Unresolved PDF extraction glyph');
console.log('Content checks passed: chapter IDs, map targets, image files, alt text, attribution and extraction glyphs.');
