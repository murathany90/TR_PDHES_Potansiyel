import { ShieldCheck } from "lucide-react";
import PdhesCalculationEngine from "../components/settings/PdhesCalculationEngine";
import WarningBanner from "../components/ui/WarningBanner";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useSiteStore } from "../stores/useSiteStore";
import { isLocalWorkspaceEnabled } from "../utils/workspaceMode";

import type { MapStyleKind } from "../utils/mapProviders";

export default function SettingsPage() {
  const {
    theme, mapStyle, heightScale,
    setTheme, setMapStyle, setHeightScale,
  } = useSettingsStore();
  const { resetSites, sites, selectedId, selectSite } = useSiteStore();

  const workspaceEnabled = isLocalWorkspaceEnabled(window.location.search);
  const workspaceHref = workspaceEnabled
    ? "#/workspace"
    : `${window.location.pathname || "/"}?editor=1#/workspace`;

  return (
    <section className="panel active">
      <div className="settings-layout">
        <div className="card">
          <h2>Arayüz ve harita</h2>
          <div className="editor-form">
            <div className="form-group">
              <label htmlFor="settings-theme">Tema</label>
              <select id="settings-theme" className="select" value={theme} onChange={(event) => setTheme(event.target.value as "dark" | "light")}>
                <option value="dark">Koyu</option>
                <option value="light">Açık</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="settings-map-style">Harita görünümü</label>
              <select id="settings-map-style" className="select" value={mapStyle} onChange={(event) => setMapStyle(event.target.value as MapStyleKind)}>
                <option value="osm">OSM Standart</option>
                <option value="topo">OpenTopoMap</option>
                <option value="light">CartoDB Light</option>
                <option value="dark">CartoDB Dark</option>
                <option value="gray">Esri World Gray</option>
                <option value="satellite">Uydu - Esri World Imagery</option>
                <option value="maptiler-basic">MapTiler Basic</option>
                <option value="maptiler-backdrop">MapTiler Backdrop</option>
                <option value="maptiler-topo">MapTiler Topo</option>
                <option value="maptiler-hybrid">Uydu - MapTiler Hybrid</option>
              </select>
            </div>
            <div className="range-row">
              <label htmlFor="settings-height-scale">3D yükseklik ölçeği</label>
              <input
                id="settings-height-scale"
                type="range"
                min={0.4}
                max={3}
                step={0.1}
                value={heightScale}
                aria-valuetext={`${heightScale.toFixed(1)}x`}
                onChange={(event) => setHeightScale(+event.target.value)}
              />
              <output htmlFor="settings-height-scale" className="kbd">{heightScale.toFixed(1)}x</output>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Veri yönetimi</h2>

          <div style={{ marginTop: 12 }}>
            <WarningBanner
              type="info"
              message="Saha geometrisi ve harita/3D yerleşimi app/public/data.json kaynağından korunur. Excel dosyası yalnızca tablo ve hesaplama motoru için build-time veri kaynağıdır."
            />
          </div>
          <button
            className="btn danger"
            style={{ marginTop: 14 }}
            onClick={() => { if (confirm("Kaydedilmiş saha düzenlemeleri sıfırlansın mı?")) resetSites(); }}
          >
            Saha düzenlemelerini sıfırla
          </button>
          <p className="muted small" style={{ marginTop: 12 }}>
            Mevcut çalışma listesinde {sites.length} Türkiye adayı var.
          </p>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <PdhesCalculationEngine
            sites={sites}
            selectedId={selectedId}
            onSelectSite={selectSite}
          />
        </div>

        <div className="card workspace-settings-card" style={{ gridColumn: "1 / -1" }}>
          <h2>Yerel çalışma alanı</h2>
          <p className="muted">
            Saha ve 3D yerleşim düzenleme araçları yalnızca bu tarayıcıda çalışır; genel veri setini veya yayımlanan uygulamayı değiştirmez.
          </p>
          <div style={{ margin: "14px 0" }}>
            <WarningBanner
              type="info"
              message={workspaceEnabled
                ? "Yerel çalışma alanı bu oturum için etkin."
                : "Gelişmiş düzenleme araçları varsayılan olarak kapalıdır. İhtiyacınız olduğunda buradan etkinleştirebilirsiniz."}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <a className="btn primary" href={workspaceHref}>
              <ShieldCheck size={16} aria-hidden="true" />
              {workspaceEnabled ? "Çalışma alanına git" : "Yerel çalışma alanını etkinleştir"}
            </a>
            {workspaceEnabled && (
              <a className="btn danger" href={`${window.location.pathname || "/"}#/settings`}>
                Yerel çalışma alanını kapat
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
