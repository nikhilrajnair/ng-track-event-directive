#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const version = process.argv[2];

if (!version) {
  console.error('Missing version argument. Usage: node scripts/sync-release-version.cjs <version>');
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..');

function updateJsonFile(relativePath, updater) {
  const absolutePath = path.join(repoRoot, relativePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  const json = JSON.parse(content);

  updater(json);

  fs.writeFileSync(absolutePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
}

updateJsonFile('package.json', (pkg) => {
  pkg.version = version;
});

updateJsonFile('projects/tracking/package.json', (pkg) => {
  pkg.version = version;
});

updateJsonFile('package-lock.json', (lock) => {
  lock.version = version;

  if (lock.packages && lock.packages['']) {
    lock.packages[''].version = version;
  }
});

console.log(`Synced release version ${version} to tracked manifest files.`);
