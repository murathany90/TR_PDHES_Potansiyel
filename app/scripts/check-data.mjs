import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const datasets = [
  {
    name: 'data.json',
    validate: (value) => Array.isArray(value) && value.length > 0,
  },
  {
    name: 'grid_assets.json',
    validate: (value) =>
      value?.type === 'FeatureCollection' &&
      Array.isArray(value.features),
  },
];

for (const dataset of datasets) {
  const raw = await readFile(resolve('public', dataset.name), 'utf8');
  const parsed = JSON.parse(raw);

  if (!dataset.validate(parsed)) {
    throw new Error(`${dataset.name}: beklenen veri yapısıyla eşleşmiyor.`);
  }

  console.log(`✓ ${dataset.name}: kanonik public veri kümesi geçerli`);
}
