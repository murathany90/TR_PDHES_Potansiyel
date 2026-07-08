import fs from 'fs';
import path from 'path';

// Bounding box for Turkey (approximate)
const MIN_LNG = 25.6;
const MAX_LNG = 44.9;
const MIN_LAT = 35.8;
const MAX_LAT = 42.1;

// Only these element types will be included
const ALLOWED_ELEMENT_TYPES = new Set(['line', 'minor_line', 'cable', 'substation', 'plant']);

function processGeojson() {
  const inputPath = path.resolve('docs/OSM_maps/osm-power-grid.geojson');
  const outputPath = path.resolve('app/public/power-grid-filtered.geojson');

  console.log('Reading input file...', inputPath);
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(rawData);

  console.log(`Original feature count: ${data.features.length}`);

  const filteredFeatures = data.features.filter((feature) => {
    const props = feature.properties;
    if (!props) return false;

    // Filter by element type
    if (!ALLOWED_ELEMENT_TYPES.has(props.elementType)) {
      return false;
    }

    // Filter by location (Turkey BBox)
    const center = props.center;
    if (center && Array.isArray(center) && center.length === 2) {
      const [lng, lat] = center;
      if (lng < MIN_LNG || lng > MAX_LNG || lat < MIN_LAT || lat > MAX_LAT) {
        return false;
      }
    }

    return true;
  }).map((feature) => {
    // Keep only essential metadata
    const props = feature.properties;
    let voltage = null;

    if (props.voltagesKv && props.voltagesKv.length > 0) {
      voltage = props.voltagesKv[0]; // primary voltage in kV
    } else if (props.tags && props.tags.voltage) {
      // fallback to tags.voltage
      const v = parseInt(props.tags.voltage.split(';')[0], 10);
      if (!isNaN(v)) {
        voltage = v >= 1000 ? v / 1000 : v;
      }
    }

    return {
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        id: props.osmId || null,
        type: props.elementType,
        name: props.tags?.name || null,
        voltage: voltage,
      }
    };
  });

  const outputData = {
    type: 'FeatureCollection',
    features: filteredFeatures
  };

  console.log(`Filtered feature count: ${filteredFeatures.length}`);

  fs.writeFileSync(outputPath, JSON.stringify(outputData));
  
  const stats = fs.statSync(outputPath);
  console.log(`Output saved to ${outputPath}`);
  console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

processGeojson();
