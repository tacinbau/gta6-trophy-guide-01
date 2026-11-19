// Leonida Platinum — a make.fun entry for gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is app/: static files that open
// in a desktop browser and work with the network off. This program hands it
// in: it copies app/ and screenshots/ from beside this file to /output (or
// MAKEFUN_OUTPUT_DIR outside the grader) and writes /output/dossier.json with
// the vendored make.fun library. vendor/makefun-frontend.ts is the kit's copy,
// unchanged — the scorer rebuilds the dossier with its own copy and compares.
//
// Run it twice and the two outputs must be byte-identical:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const DOSSIER_OPTS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function listFiles(dir, base = dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...listFiles(full, base));
    else if (entry.isFile()) found.push(full.slice(base.length + 1));
  }
  return found.sort();
}

function checkTree() {
  const appDir = join(REPO_ROOT, 'app');
  const shotsDir = join(REPO_ROOT, 'screenshots');
  if (!existsSync(join(appDir, 'index.html'))) throw new Error('app/index.html is missing');
  if (statSync(join(appDir, 'index.html')).size > 1048576) throw new Error('app/index.html is over the 1 MiB cap');
  if (!existsSync(join(appDir, 'data', 'trophies.json'))) throw new Error('app/data/trophies.json is missing');
  if (statSync(join(appDir, 'data', 'trophies.json')).size > 2097152) throw new Error('app/data/trophies.json is over the 2 MiB cap');
  const shots = existsSync(shotsDir) ? listFiles(shotsDir) : [];
  if (shots.length < 3 || shots.length > 4) throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
  for (const name of shots) {
    const size = statSync(join(shotsDir, name)).size;
    if (size > 262144) throw new Error(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
  }
  return { appFiles: listFiles(appDir).length, shots };
}

function handIn() {
  const { appFiles, shots } = checkTree();
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  cpSync(join(REPO_ROOT, 'app'), join(OUT_DIR, 'app'), { recursive: true });
  cpSync(join(REPO_ROOT, 'screenshots'), join(OUT_DIR, 'screenshots'), { recursive: true });
  writeFileSync(join(OUT_DIR, 'dossier.json'), buildDossier(OUT_DIR, DOSSIER_OPTS));
  const dossierBytes = statSync(join(OUT_DIR, 'dossier.json')).size;
  if (dossierBytes > 1572864) throw new Error(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
  console.log(`handed in ${appFiles} app files and ${shots.length} screenshots to ${OUT_DIR} (dossier ${dossierBytes} bytes)`);
}

handIn();
