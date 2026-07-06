import { useSettingsStore } from '../stores/useSettingsStore';
import { useSiteStore } from '../stores/useSiteStore';
import WarningBanner from '../components/ui/WarningBanner';
import { calculateWeightedScore } from '../utils/scoring';

const WEIGHT_LABELS: Record<string, string> = {
  topo: 'Topografya / düşü',
  grid: 'Şebeke yakınlığı',
  env: 'Çevresel kısıt',
  geology: 'Jeoloji / deprem',
  access: 'Erişim ve lojistik',
  market: 'Piyasa ve yük',
};

export default function SettingsPage() {
  const { theme, mapStyle, heightScale, weights, setTheme, setMapStyle, setHeightScale, setWeight } = useSettingsStore();
  const { resetSites, sites, selectedId } = useSiteStore();
  const selectedSite = sites.find((site) => site.id === selectedId) || sites[0];
  const scenarioScore = selectedSite
    ? calculateWeightedScore(selectedSite.scores, weights)
    : null;
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return (
    <section className="panel active">
      <div className="settings-layout">
        <div className="card">
          <h2>Arayüz ve harita</h2>
          <div className="editor-form">
            <div className="form-group">
              <label htmlFor="settings-theme">Tema</label>
              <select id="settings-theme" className="select" value={theme} onChange={(event) => setTheme(event.target.value as 'dark' | 'light')}>
                <option value="dark">Koyu</option>
                <option value="light">Açık</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="settings-map-style">Harita görünümü</label>
              <select id="settings-map-style" className="select" value={mapStyle} onChange={(event) => setMapStyle(event.target.value as 'dark' | 'light' | 'satellite')}>
                <option value="dark">Koyu</option>
                <option value="light">Açık</option>
                <option value="satellite">Uydu</option>
              </select>
            </div>
            <div className="range-row">
              <label htmlFor="settings-height-scale">3D yükseklik ölçeği</label>
              <input id="settings-height-scale" type="range" min={0.4} max={3} step={0.1} value={heightScale} aria-valuetext={`${heightScale.toFixed(1)}x`} onChange={(event) => setHeightScale(+event.target.value)} />
              <output htmlFor="settings-height-scale" className="kbd">{heightScale.toFixed(1)}x</output>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Skor ağırlıkları</h2>
          {Object.entries(weights).map(([key, value]) => {
            const inputId = `settings-weight-${key}`;
            return (
              <div className="range-row" key={key}>
                <label htmlFor={inputId}>{WEIGHT_LABELS[key] || key}</label>
                <input id={inputId} type="range" min={0} max={50} step={1} value={value} aria-valuetext={`${value} ağırlık`} onChange={(event) => setWeight(key as keyof typeof weights, +event.target.value)} />
                <output htmlFor={inputId} className="kbd">{value}</output>
              </div>
            );
          })}
          {selectedSite && (
            <div className="scenario-score-preview" aria-live="polite">
              <div>
                <span>Kaynak skor {selectedSite.score}</span>
                <small>Veri seti, değişmez</small>
              </div>
              <div>
                <span>Senaryo skoru {scenarioScore}</span>
                <small>{totalWeight} toplam ağırlık</small>
              </div>
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <WarningBanner
              type={totalWeight === 0 ? 'warning' : 'info'}
              message={totalWeight === 0
                ? 'Senaryo skoru için en az bir ağırlığı sıfırdan büyük seçin.'
                : 'Ağırlıklar senaryo skorunu anlık hesaplar; veri setindeki kaynak skoru değiştirmez.'}
            />
          </div>
          <h3 style={{ marginTop: 16 }}>Veri yönetimi</h3>
          <button className="btn danger" onClick={() => { if (confirm('Kaydedilmiş saha düzenlemeleri sıfırlansın mı?')) resetSites(); }}>
            Saha düzenlemelerini sıfırla
          </button>
          <p className="muted small" style={{ marginTop: 12 }}>
            Mevcut çalışma listesinde {sites.length} aday saha var. Yedek alma ve geri yükleme işlemleri Yerel Çalışma Alanı sekmesinden yapılır.
          </p>
        </div>
      </div>
    </section>
  );
}
