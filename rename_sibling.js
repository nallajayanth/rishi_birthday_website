import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'src', 'assets', 'brother_sister');

console.log(`Scanning directory: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory does not exist: ${targetDir}`);
  process.exit(1);
}

const files = fs.readdirSync(targetDir);

// Filter image files
const imageFiles = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ext === '.jpeg' || ext === '.jpg' || ext === '.png';
});

console.log(`Found ${imageFiles.length} image(s) to rename.`);

if (imageFiles.length === 0) {
  console.log('No images found in brother_sister.');
  process.exit(0);
}

// Sort filenames naturally to maintain alphabetical/chronological order
const naturalSort = (a, b) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

imageFiles.sort(naturalSort);

console.log('Renaming files sequentially to sibling_X.jpeg...');

imageFiles.forEach((oldName, index) => {
  const newName = `sibling_${index + 1}.jpeg`;
  const oldPath = path.join(targetDir, oldName);
  const newPath = path.join(targetDir, newName);

  fs.renameSync(oldPath, newPath);
  console.log(`Renamed: "${oldName}" -> "${newName}"`);
});

console.log('Brother & Sister renaming completed successfully!');
