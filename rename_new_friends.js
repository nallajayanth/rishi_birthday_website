import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'src', 'assets', 'bestfriends');

console.log(`Scanning directory: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory does not exist: ${targetDir}`);
  process.exit(1);
}

const files = fs.readdirSync(targetDir);

// 1. Find the maximum index of existing friend_*.jpeg files
let maxIndex = 0;
const friendFileRegex = /^friend_(\d+)\.(jpeg|jpg|png)$/i;

files.forEach(file => {
  const match = file.match(friendFileRegex);
  if (match) {
    const idx = parseInt(match[1], 10);
    if (idx > maxIndex) {
      maxIndex = idx;
    }
  }
});

console.log(`Current maximum friend index: ${maxIndex}`);

// 2. Filter files that do NOT match friend_*.jpeg and are images
const imageExtensions = ['.jpeg', '.jpg', '.png', '.webp'];
const newImages = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  const isImage = imageExtensions.includes(ext);
  const isAlreadyNamedFriend = friendFileRegex.test(file);
  return isImage && !isAlreadyNamedFriend;
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
  const newName = `friend_${currentIndex}.jpeg`;
  const oldPath = path.join(targetDir, oldName);
  const newPath = path.join(targetDir, newName);

  fs.renameSync(oldPath, newPath);
  console.log(`Renamed: "${oldName}" -> "${newName}"`);
  currentIndex++;
});

console.log(`Renaming completed successfully! New maximum index is ${currentIndex - 1}.`);
