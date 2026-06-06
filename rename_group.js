import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'src', 'assets', 'group_photos');

console.log(`Scanning directory: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory does not exist: ${targetDir}`);
  process.exit(1);
}

const files = fs.readdirSync(targetDir);

const imageExtensions = ['.jpeg', '.jpg', '.png', '.webp'];
const newImages = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  return imageExtensions.includes(ext);
});

console.log(`Found ${newImages.length} image(s) to rename.`);

if (newImages.length === 0) {
  console.log('No images found.');
  process.exit(0);
}

// Sort images naturally so they get processed in a predictable order
newImages.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

let currentIndex = 1;

newImages.forEach(oldName => {
  const newName = `group_${currentIndex}.jpeg`;
  const oldPath = path.join(targetDir, oldName);
  const newPath = path.join(targetDir, newName);

  fs.renameSync(oldPath, newPath);
  console.log(`Renamed: "${oldName}" -> "${newName}"`);
  currentIndex++;
});

console.log(`Renaming completed successfully! Renamed ${currentIndex - 1} images.`);
