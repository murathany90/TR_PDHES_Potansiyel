import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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

  it('keeps Gokcekaya as four 350 MW units in the public dataset', () => {
    const data = JSON.parse(readFileSync(resolve(appRoot, 'public/data.json'), 'utf8'));
    const sites = Array.isArray(data) ? data : data.sites;
    const gokcekaya = sites.find((site) => site.id === 'kamu-gokcekaya-pspp');

    expect(gokcekaya).toBeTruthy();
    expect(gokcekaya.capacityMW).toBe(1400);
    expect(gokcekaya.components_detail.powerhouse.units).toBe(4);
    expect(gokcekaya.components_detail.powerhouse.unitPowerMW).toBe(350);
    expect(gokcekaya.components_detail.penstock.count).toBe(4);
    expect(gokcekaya.components_detail.switchyard.transformer_count).toBe(3);
  });
});
