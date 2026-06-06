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

// Filter files that are images and contain 'WhatsApp'
const whatsappImages = files.filter(file => {
  const ext = path.extname(file).toLowerCase();
  return (ext === '.jpeg' || ext === '.jpg' || ext === '.png') && file.toLowerCase().includes('whatsapp');
});

console.log(`Found ${whatsappImages.length} WhatsApp image(s) to rename.`);

if (whatsappImages.length === 0) {
  console.log('No WhatsApp images found in bestfriends. They might have been renamed already.');
  process.exit(0);
}

// Sort filenames naturally
const naturalSort = (a, b) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

whatsappImages.sort(naturalSort);

console.log('Renaming files sequentially...');

whatsappImages.forEach((oldName, index) => {
  const newName = `friend_${index + 1}.jpeg`;
  const oldPath = path.join(targetDir, oldName);
  const newPath = path.join(targetDir, newName);

  fs.renameSync(oldPath, newPath);
  console.log(`Renamed: "${oldName}" -> "${newName}"`);
});

console.log('Best friends renaming completed successfully!');
