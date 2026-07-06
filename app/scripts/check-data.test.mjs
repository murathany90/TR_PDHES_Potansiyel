import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

describe('check-data script', () => {
  it('validates the canonical public datasets without requiring removed root copies', () => {
    const result = spawnSync(process.execPath, ['scripts/check-data.mjs'], {
      cwd: appRoot,
      encoding: 'utf8',
    });

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain('data.json');
    expect(result.stdout).toContain('grid_assets.json');
  });
});
