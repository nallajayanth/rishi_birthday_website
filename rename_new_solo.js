import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'src', 'assets', 'solo_pics');

console.log(`Scanning directory: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory does not exist: ${targetDir}`);
  process.exit(1);
}

const files = fs.readdirSync(targetDir);

// 1. Find the maximum index of existing solo_*.jpeg files
let maxIndex = 0;
const soloFileRegex = /^solo_(\d+)\.(jpeg|jpg|png)$/i;

files.forEach(file => {
  const match = file.match(soloFileRegex);
  if (match) {
    const idx = parseInt(match[1], 10);
    if (idx > maxIndex) {
      maxIndex = idx;
    }
  }
});

console.log(`Current maximum solo index: ${maxIndex}`);

// 2. Filter files that do NOT match solo_*.jpeg and are images
const imageExtensions = ['.jpeg', '.jpg', '.png', '.webp'];
const newImages = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  const isImage = imageExtensions.includes(ext);
  const isAlreadyNamedSolo = soloFileRegex.test(file);
  return isImage && !isAlreadyNamedSolo;
});

console.log(`Found ${newImages.length} new image(s) to rename.`);

if (newImages.length === 0) {
  console.log('No new images to rename.');
  process.exit(0);
}

// Sort new images naturally
newImages.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

// 3. Rename them starting from maxIndex + 1
let currentIndex = maxIndex + 1;

newImages.forEach(oldName => {
  const ext = path.extname(oldName).toLowerCase();
  // We'll normalize all to .jpeg as done previously in the project
  const newName = `solo_${currentIndex}.jpeg`;
  const oldPath = path.join(targetDir, oldName);
  const newPath = path.join(targetDir, newName);

  fs.renameSync(oldPath, newPath);
  console.log(`Renamed: "${oldName}" -> "${newName}"`);
  currentIndex++;
});

console.log(`Renaming completed successfully! New maximum index is ${currentIndex - 1}.`);
