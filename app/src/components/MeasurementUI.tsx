import { useMapToolsStore } from '../stores/useMapToolsStore';
import { X, Trash2, LineChart } from 'lucide-react';
import * as turf from '@turf/turf';
import { useMemo, useState, useEffect } from 'react';
import TerrainProfileChart from './TerrainProfileChart';

export default function MeasurementUI() {
  const { map, mode, setMode, measurementPoints, clearMeasurement } = useMapToolsStore();
  const [showProfile, setShowProfile] = useState(false);
  const [mousePos, setMousePos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (mode !== 'measure' || !map) return;
    
    const onMouseMove = (e: any) => {
      setMousePos([e.lngLat.lng, e.lngLat.lat]);
    };
    
    map.on('mousemove', onMouseMove);
    return () => {
      map.off('mousemove', onMouseMove);
      setMousePos(null);
    };
  }, [map, mode]);

  useEffect(() => {
    if (!map) return;
    
    const sourceId = 'measure-points';
    
    const updateSource = () => {
      let coordinates = [...measurementPoints];
      if (mode === 'measure' && mousePos && coordinates.length > 0) {
        coordinates.push(mousePos);
      }
      
      const geojson: any = {
        type: 'FeatureCollection',
        features: []
      };

      if (coordinates.length > 0) {
        geojson.features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates },
          properties: {}
        });
        
        coordinates.forEach(coord => {
          geojson.features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: coord },
            properties: {}
          });
        });
      }

      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(geojson);
      } else if (map.isStyleLoaded()) {
        map.addSource(sourceId, { type: 'geojson', data: geojson });
        
        map.addLayer({
          id: 'measure-lines',
          type: 'line',
          source: sourceId,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#10b981', 'line-width': 3, 'line-dasharray': [2, 2] }
        });
        
        map.addLayer({
          id: 'measure-circles',
          type: 'circle',
          source: sourceId,
          filter: ['==', '$type', 'Point'],
          paint: { 'circle-radius': 5, 'circle-color': '#10b981', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }
        });
      }
    };

    updateSource();
    
    // Sometimes style needs to be fully loaded
    const onStyleLoad = () => updateSource();
    map.on('styledata', onStyleLoad);
    
    return () => {
      map.off('styledata', onStyleLoad);
      if (map.getLayer('measure-lines')) map.removeLayer('measure-lines');
      if (map.getLayer('measure-circles')) map.removeLayer('measure-circles');
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, mode, measurementPoints, mousePos]);

  const totalDistanceKm = useMemo(() => {
    if (measurementPoints.length < 2) return 0;
    const line = turf.lineString(measurementPoints);
    return turf.length(line, { units: 'kilometers' });
  }, [measurementPoints]);

  if (mode !== 'measure') return null;

  const handleClose = () => {
    setMode('default');
    setShowProfile(false);
  };

  return (
    <>
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-md border border-emerald-500/30 rounded-full pl-6 pr-2 py-2 flex items-center gap-4 shadow-lg shadow-black/50 animate-in slide-in-from-top-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-400/70 font-semibold uppercase tracking-wider leading-none mb-1">
            Mesafe Ölçümü
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white tabular-nums leading-none">
              {totalDistanceKm.toFixed(2)}
            </span>
            <span className="text-sm text-white/50">km</span>
          </div>
        </div>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <div className="flex items-center gap-1">
          {measurementPoints.length >= 2 && (
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-blue-300 hover:text-blue-200 hover:bg-blue-500/20 transition-colors"
            >
              <LineChart size={16} />
              <span>Profil</span>
            </button>
          )}
          <button
            onClick={clearMeasurement}
            title="Temizle"
            className="p-2 text-white/50 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleClose}
            title="Kapat"
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {showProfile && measurementPoints.length >= 2 && (
        <TerrainProfileChart onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
