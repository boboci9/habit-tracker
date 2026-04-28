#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');

function getArg(name, fallback = '') {
  const prefixed = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefixed));
  if (!found) {
    return fallback;
  }
  return found.slice(prefixed.length);
}

function readAppVersion() {
  const appJsonPath = path.join(repoRoot, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  return appJson?.expo?.version || '0.0.0';
}

function currentCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function compactTimestamp(isoTimestamp) {
  return isoTimestamp.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function main() {
  const channel = getArg('--channel', process.env.APP_RELEASE_CHANNEL || 'unknown');
  const platform = getArg('--platform', 'unknown');
  const buildProfile = getArg('--build-profile', 'unknown');

  const generatedAt = new Date().toISOString();
  const sourceCommit = currentCommit();
  const metadata = {
    channel,
    platform,
    buildProfile,
    appVersion: readAppVersion(),
    sourceCommit,
    generatedAt,
  };

  const outputDir = path.join(repoRoot, 'build-artifacts', 'metadata');
  ensureDir(outputDir);
  const suffix = `${compactTimestamp(generatedAt)}-${sourceCommit}`;
  const versionedPath = path.join(outputDir, `${channel}-${platform}-${suffix}.json`);
  const latestPath = path.join(outputDir, `${channel}-${platform}-latest.json`);
  fs.writeFileSync(versionedPath, JSON.stringify(metadata, null, 2));
  fs.writeFileSync(latestPath, JSON.stringify(metadata, null, 2));

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        outputPath: path.relative(repoRoot, versionedPath),
        latestPath: path.relative(repoRoot, latestPath),
        metadata,
      },
      null,
      2
    )
  );
}

main();
