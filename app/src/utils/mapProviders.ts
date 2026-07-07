import type { StyleSpecification } from 'maplibre-gl';

export type MapStyleKind = 'dark' | 'light' | 'satellite';

export const MAP_PROVIDERS: Record<MapStyleKind, {
  tileUrl: string;
  attribution: string;
}> = {
  light: {
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  },
  dark: {
    tileUrl: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> © <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    tileUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics and contributors',
  },
};

export function getMapStyleSpecification(kind: MapStyleKind): StyleSpecification {
  const provider = MAP_PROVIDERS[kind];

  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      base: {
        type: 'raster',
        tiles: [provider.tileUrl],
        tileSize: 256,
        maxzoom: 22,
        attribution: provider.attribution,
      },
      terrainSource: {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15,
        attribution: 'Elevation tiles © AWS Open Data Terrain Tiles',
      },
    },
    layers: [{ id: 'base', type: 'raster', source: 'base' }],
  };
}


export function getMarkerIconHtml(concept: string, color: string, isActive: boolean): string {
  const size = isActive ? 34 : 26;
  const shadow = isActive ? 'drop-shadow(0px 0px 8px rgba(0,0,0,0.9))' : 'drop-shadow(0px 0px 4px rgba(0,0,0,0.6))';
  
  let innerSvg = '';
  if (concept === 'sea') {
    innerSvg = '<path d="M2 12C2 12 5 9 12 12C19 15 22 12 22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 18C2 18 5 15 12 18C19 21 22 18 22 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  } else if (concept === 'mine') {
    innerSvg = '<path d="M14.531 12.469L11.5 9.438L3.563 17.375L6.625 20.438L14.563 12.5V12.469H14.531ZM17.156 5.813L18.188 4.781C18.688 4.281 19.5 4.281 20 4.781C20.5 5.281 20.5 6.094 20 6.594L18.969 7.625L17.156 5.813Z" fill="white"/><path d="M22.063 2.938C20.938 1.813 18.688 1.438 17.188 2.938L8.688 11.438L12.563 15.313L21.063 6.813C22.563 5.313 23.188 4.063 22.063 2.938Z" fill="white"/>';
  } else {
    innerSvg = '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="white"/><path d="M12 9l-2 3h4l-2 3" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  return `
    <div style="width: ${size}px; height: ${size}px; filter: ${shadow}; transition: all 0.2s ease; transform: translate(-50%, -100%); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: ${isActive ? 10 : 1}; position: relative;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <g transform="scale(0.55) translate(10, 6)">
          ${innerSvg}
        </g>
      </svg>
    </div>
  `;
}
