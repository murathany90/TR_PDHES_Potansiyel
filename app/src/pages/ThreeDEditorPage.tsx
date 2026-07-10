import { useEffect, useRef, useState } from 'react';
import { useMapLibre, type MapLayerVisibility } from '../hooks/useMapLibre';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useSiteStore } from '../stores/useSiteStore';
import type { Site } from '../types/site';

interface ThreeDEditorPageProps {
  site?: Site;
  onDone: () => void;
}

const EDITOR_LAYERS: MapLayerVisibility = {
  candidates: false,
  projectLayout: true,
  risk: true,
  waterPath: true,
  powerGrid: true,
  terrain3d: true,
  upperReservoir: true,
  lowerReservoir: true,
  powerhouse: true,
  surgeTank: true,
  switchyard3d: true,
  portal: true,
};

export default function ThreeDEditorPage({ site, onDone }: ThreeDEditorPageProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { updateSite, baseSites, gridAssets } = useSiteStore();
  const { mapStyle, heightScale } = useSettingsStore();

  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previewSite, setPreviewSite] = useState<Site | undefined>(site);
  const [lastClickedPoint, setLastClickedPoint] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState('');

  // Initialize JSON on first load or when site ID changes
  useEffect(() => {
    if (site) {
      const initialJson = JSON.stringify({
        coordinates: site.coordinates,
        layout: site.layout,
        view: site.view,
      }, null, 2);
      setJsonText(initialJson);
      setPreviewSite(site);
    }
  }, [site?.id]);

  const { mapRef } = useMapLibre({
    containerRef: mapContainer,
    site: previewSite,
    sites: previewSite ? [previewSite] : [],
    selectedId: previewSite?.id || '',
    mapStyle,
    heightScale,
    gridAssets,
    layers: EDITOR_LAYERS,
    interactiveCandidates: false,
  });

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    const onClick = (e: any) => {
      // Limit to 6 decimals to match standard coordinate format
      const lng = Number(e.lngLat.lng.toFixed(6));
      const lat = Number(e.lngLat.lat.toFixed(6));
      setLastClickedPoint([lng, lat]);
    };
    
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [mapRef.current]);

  if (!site) {
    return <section className="panel active"><p className="muted">Düzenlenecek 3D yerleşim bulunamadı.</p></section>;
  }

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonError(null);
      const updatedSite = {
        ...site,
        ...parsed
      };
      setPreviewSite(updatedSite);
      setMessage('Değişiklikler haritaya uygulandı. Kaydetmeyi unutmayın.');
    } catch (e: any) {
      setJsonError(e.message);
      setMessage('');
    }
  };

  const handleSave = () => {
    if (jsonError) {
      setMessage('Lütfen önce hatalı JSON formatını düzeltin.');
      return;
    }
    if (previewSite) {
      updateSite(site.id, previewSite);
      setMessage('Yerleşim yerel çalışma alanına kaydedildi.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText).then(() => {
      setMessage('JSON panoya kopyalandı. data.json dosyasına yapıştırabilirsiniz.');
    });
  };

  const handleReset = () => {
    const base = baseSites.find((item) => item.id === site.id);
    if (base) {
      const baseJson = JSON.stringify({
        coordinates: base.coordinates,
        layout: base.layout,
        view: base.view,
      }, null, 2);
      setJsonText(baseJson);
      setPreviewSite(base);
      setJsonError(null);
      setMessage('Varsayılan veriler yüklendi.');
    }
  };

  return (
    <section className="panel active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="map-layout" style={{ flex: 1, overflow: 'hidden' }}>
        <aside className="map-left" style={{ width: '420px', display: 'flex', flexDirection: 'column' }}>
          <h2>3D Yerleşim Editörü (Gelişmiş)</h2>
          <p className="muted small" style={{ marginBottom: 12 }}>{site.name}</p>
          
          <div className="card" style={{ marginBottom: 12, padding: 12, background: 'var(--bg-card)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Harita Etkileşimi</h3>
            <p className="muted small" style={{ marginBottom: 8 }}>Haritaya tıklayarak koordinat alabilirsiniz.</p>
            {lastClickedPoint ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{ flex: 1, padding: 6, background: 'var(--bg)', borderRadius: 4, fontSize: '12px' }}>
                  [{lastClickedPoint[0]}, {lastClickedPoint[1]}]
                </code>
                <button 
                  className="btn outline" 
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  onClick={() => navigator.clipboard.writeText(`[\n  ${lastClickedPoint[0]},\n  ${lastClickedPoint[1]}\n]`)}
                >
                  Kopyala
                </button>
              </div>
            ) : (
              <p className="muted small">Henüz bir noktaya tıklanmadı.</p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
            <h3 style={{ fontSize: '13px', margin: 0 }}>JSON Verisi (coordinates, view)</h3>
            <textarea
              className="input"
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '11px',
                lineHeight: 1.4,
                padding: '8px',
                resize: 'none',
                whiteSpace: 'pre',
                borderColor: jsonError ? 'var(--red)' : 'var(--border)',
                minHeight: '200px'
              }}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
            {jsonError && <div className="notice" style={{ color: 'var(--red)', background: 'transparent', padding: 0 }}>Hata: {jsonError}</div>}
            {message && <div className="notice" style={{ padding: '6px 10px' }}>{message}</div>}
            
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn primary" onClick={handleApply}>Uygula</button>
              <button className="btn" onClick={handleSave}>Kaydet</button>
              <button className="btn outline" onClick={handleCopy}>Kopyala</button>
            </div>
            
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn ghost" onClick={handleReset} style={{ fontSize: '12px', padding: '6px' }}>Sıfırla</button>
              <button className="btn ghost" onClick={onDone} style={{ fontSize: '12px', padding: '6px', marginLeft: 'auto' }}>Çıkış</button>
            </div>
          </div>
        </aside>

        <div className="map-stage">
          <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
        </div>
      </div>
    </section>
  );
}
