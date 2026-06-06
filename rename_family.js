import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'src', 'assets', 'family');

console.log(`Scanning directory: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory does not exist: ${targetDir}`);
  process.exit(1);
}

const files = fs.readdirSync(targetDir);

// Filter files that are images
const imageFiles = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ext === '.jpeg' || ext === '.jpg' || ext === '.png';
});

console.log(`Found ${imageFiles.length} image(s) to rename.`);

if (imageFiles.length === 0) {
  console.log('No images found in the family folder.');
  process.exit(0);
}

// Helper to sort filenames naturally
const naturalSort = (a, b) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

imageFiles.sort(naturalSort);

console.log('Renaming files sequentially...');

imageFiles.forEach((oldName, index) => {
  const ext = path.extname(oldName).toLowerCase();
  // We can standardize on .jpeg for consistency, or keep the original extension.
  // Standardizing on .jpeg is fine, but keeping the original extension is safer to avoid mime issues.
  const newName = `family_${index + 1}${ext}`;
  const oldPath = path.join(targetDir, oldName);
  const newPath = path.join(targetDir, newName);

  fs.renameSync(oldPath, newPath);
  console.log(`Renamed: "${oldName}" -> "${newName}"`);
});

console.log('Renaming completed successfully!');
