import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Recursively find all files matching criteria
function findFiles(dir: string, filter: (file: string) => boolean): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, filter));
    } else if (filter(filePath)) {
      results.push(filePath);
    }
  });
  return results;
}

// Find all tests and validations
const srcDir = path.join(__dirname, '../src');

// Filter:
// - Any file ending in `.test.ts`
// - Any validation file starting with `validate_` in the engine folder
// - `cli_test.ts` in the engine folder
const testFiles = findFiles(srcDir, (filePath) => {
  const relativePath = path.relative(srcDir, filePath);
  if (relativePath.endsWith('.test.ts')) {
    return true;
  }
  if (relativePath.startsWith('engine/validate_') && relativePath.endsWith('.ts')) {
    return true;
  }
  if (relativePath === 'engine/cli_test.ts') {
    return true;
  }
  return false;
});

// Sort to keep execution order deterministic
testFiles.sort();

console.log(`Found ${testFiles.length} test/validation files to run.`);

let failed = false;

testFiles.forEach((file) => {
  const relativePath = path.relative(path.join(__dirname, '..'), file);
  console.log(`\n🏃 Running: ${relativePath}`);
  try {
    // Run using tsx
    execSync(`npx tsx ${file}`, { stdio: 'inherit' });
    console.log(`✅ Passed: ${relativePath}`);
  } catch (error) {
    console.error(`❌ Failed: ${relativePath}`);
    failed = true;
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed successfully!');
  process.exit(0);
}
