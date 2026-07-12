import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.resolve(__dirname, '..');
const distDir = path.join(webDir, 'dist');
const budgetPath = path.join(webDir, 'bundle_budget.json');

// Ensure budget exists
if (!fs.existsSync(budgetPath)) {
  console.error(`Budget file not found at ${budgetPath}`);
  process.exit(1);
}

const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf-8'));

// Run build
console.log('Building project...');
try {
  execSync('npm run build', { cwd: webDir, stdio: 'inherit' });
} catch (error) {
  console.error('Build failed', error);
  process.exit(1);
}

// Traverse dist dir
function getFiles(dir: string, ext: string, filesList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, ext, filesList);
    } else if (fullPath.endsWith(ext)) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

function calculateTotalSize(files: string[]): number {
  return files.reduce((total, file) => total + fs.statSync(file).size, 0);
}

const jsFiles = getFiles(distDir, '.js');
const cssFiles = getFiles(distDir, '.css');

const jsTotalSize = calculateTotalSize(jsFiles);
const cssTotalSize = calculateTotalSize(cssFiles);

let exceeded = false;

console.log(`JS Total Size: ${jsTotalSize} bytes`);
if (budget.js !== undefined) {
  console.log(`JS Budget: ${budget.js} bytes`);
  if (jsTotalSize > budget.js) {
    console.error(`❌ JS size exceeded budget!`);
    exceeded = true;
  } else {
    console.log(`✅ JS size is within budget.`);
  }
}

console.log(`CSS Total Size: ${cssTotalSize} bytes`);
if (budget.css !== undefined) {
  console.log(`CSS Budget: ${budget.css} bytes`);
  if (cssTotalSize > budget.css) {
    console.error(`❌ CSS size exceeded budget!`);
    exceeded = true;
  } else {
    console.log(`✅ CSS size is within budget.`);
  }
}

if (exceeded) {
  process.exit(1);
}
