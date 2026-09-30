const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/Hari/Desktop/Agri/src');
const foundKeys = new Map(); // key -> list of files

const regex = /t\(\s*["']([^"']*?_[^"']*?)["']/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const k = match[1];
    if (!foundKeys.has(k)) foundKeys.set(k, []);
    foundKeys.get(k).push(file.replace('c:/Users/Hari/Desktop/Agri/', ''));
  }
});

console.log(`Found ${foundKeys.size} underscore keys in codebase:`);
for (const [key, occurrenceFiles] of foundKeys.entries()) {
  console.log(`- "${key}" (${occurrenceFiles.length} occurrences)`);
}

// Write to JSON for inspection
fs.writeFileSync('c:/Users/Hari/Desktop/Agri/scratch/underscore_keys.json', JSON.stringify(Object.fromEntries(foundKeys), null, 2));
