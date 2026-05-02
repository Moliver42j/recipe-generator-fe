import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const lambdaSourceDir = resolve(projectRoot, 'account-state-lambda');
const artifactPath = resolve(projectRoot, 'dist', 'account-state.zip');

function run(command, args, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
    });

    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise(undefined);
        return;
      }

      rejectPromise(new Error(`${command} failed with exit code ${code}`));
    });
  });
}

await mkdir(dirname(artifactPath), { recursive: true });
await rm(artifactPath, { force: true });
await run('npm', ['install', '--omit=dev', '--no-audit', '--no-fund'], lambdaSourceDir);
await run(
  'zip',
  [
    '-qr',
    artifactPath,
    'index.mjs',
    'package.json',
    'package-lock.json',
    'node_modules',
  ],
  lambdaSourceDir,
);
