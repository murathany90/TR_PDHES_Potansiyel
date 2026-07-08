# OSM Power Grid Tools

OpenStreetMap üzerindeki elektrik şebekesi (power grid) verilerini keşfetmek, görselleştirmek, düzenlemek ve dışa aktarmak için **local-first Chrome Extension** (MV3).

Harita, veri tablosu, katman paneli, audit raporu ve Overpass API entegrasyonu tek bir araçta birleşir. Tüm veri yerel olarak IndexedDB'de saklanır; herhangi bir backend, API anahtarı veya uzaktan kod çalıştırma gerektirmez.

Toplu veri gönderimleri ve OSM uyum kuralları hakkında detaylı bilgi:
- **OSM Wiki sayfası**: [Automated edits/OSM Power Grid Tools](https://wiki.openstreetmap.org/wiki/Automated_edits/OSM_Power_Grid_Tools)
- **Topluluk forum başlığı**: [OSM Enerji Şebekesi Araçları](https://community.openstreetmap.org/t/osm-enerji-sebekesi-araclari-osm-power-grid-tools/144237)

---

## İçindekiler

- [Özellikler](#özellikler)
- [Kullanım Akışı](#kullanım-akışı)
- [Mimari](#mimari)
- [Geliştirme Kılavuzu](#geliştirme-kılavuzu)
- [Teknoloji Stack'i](#teknoloji-stacki)
- [Veri Modeli](#veri-modeli)
- [Depolama Stratejisi](#depolama-stratejisi)
- [Overpass Entegrasyonu](#overpass-entegrasyonu)
- [Import / Export](#import--export)
- [UI / Tasarım Sistemi](#ui--tasarım-sistemi)
- [Test](#test)
- [Güvenlik ve Lisans](#güvenlik-ve-lisans)
- [Bilinen Sınırlamalar](#bilinen-sınırlamalar)

---

## Özellikler

### Harita Görselleştirme (MapLibre GL JS)

- OSM raster tile tabanlı interaktif harita
- **3 stil modu**: Voltage grubu, veri kaynağı, element grubu
- **7 element grubu** için özel canvas ikonları: hatlar, kablolar, trafo merkezleri, santraller, trafo merkezi içi, direkler, diğerleri
- Voltage grubu bazında renklendirme ve çizgi kalınlığı
- Highlight vurgusu: beyaz glow (blur + genişletilmiş çizgi/daire) + turuncu-kırmızı (`#FF4400`) renk + 3× büyütme
- Katman paneli: voltage ve element gruplarını aç/kapa, stil modu değiştirici
- "Tümünü göster" sığdırma butonu

### Veri Tablosu

- Sıralanabilir kolonlar (score, source, osmType, elementType, name, operator, voltageGroup)
- Sayfalama (100 feature/sayfa)
- Metin arama (name, operator, type)
- Element tipi filtreleme
- Sadece eksik voltage göster modu
- Satır tıklaması → detay paneli
- Ctrl+ tıklama → highlight + haritaya odaklanma
- Çift tıklama ile inline düzenleme (name, operator, voltageRaw)
- Düzenlenen feature rozeti

### Detay Paneli

- Tüm OSM tag'leri (monospace, kırılabilir)
- Kalite skoru ve eksik alan rozetleri
- OSM bağlantısı (osmType + osmId varsa)
- Highlight butonu
- Ham tag görüntüleyici

### Özet ve İstatistik

- Summary kartları: toplam feature, hatlar, kablolar, trafo merkezleri, eksik voltage %, eksik isim %, düzenlenen sayısı
- ElementType × VoltageGroup çapraz tablo (breakdown)
- Audit raporu: tag kalitesi, geometri kalitesi, kaynak sağlığı

### Overpass Veri Çekme

- Büyük bbox'ları grid chunk'lara bölme (kullanıcı ayarlanabilir chunk size)
- **İki fazlı çekme**: Way'ler (hat/kablo) ve node'lar (trafo/santral/direk) ayrı sorgularla, 2sn gecikmeyle
- **Endpoint fallback**: 3 genel Overpass endpoint'i, her endpoint'te `post-form` → `get` transport
- **Non-retryable hata yönetimi**: 406, 429, 504, "out of memory", "runtime error" → aynı endpoint/transport'ı atla
- Adaptive delay: 429 → 10sn, 504 → 3sn, diğer → `min(retryCount, 3) × 500ms`
- Her chunk için: durum, retry sayısı, timeout, süre, feature sayısı, endpoint, transport, hata kaydı
- Job durumu: `queued` → `running` → `completed` / `partial` / `failed` / `cancelled`
- `declarativeNetRequest` ile özel User-Agent başlığı
- Overpass `remark` alanından hata/zaman aşımı tespiti

### Import

- **GeoJSON**: FeatureCollection, tek Feature veya ham Geometry kabul eder. `properties.tags` veya doğrudan propertylerden tag çıkarımı. Eksik alan toleranslı.
- **KML**: Regex tabanlı parser (XML DOM yok). Folder yoluyla element tipi çıkarımı. Point, LineString, Polygon koordinatları. Tüm import'lar `missingVoltage: true` olarak işaretlenir.
- Sürükle-bırak veya dosya seçici
- Her import ayrı snapshot olarak IndexedDB'ye kaydedilir

### Export

- **GeoJSON**: Metadata içerir (app, exportedAt, source, license, attribution, filters, featureCount). Feature'lar `tags` ve `quality` propertylerini korur.
- **KML 2.2**: Element tipine göre Folder grupları, voltage bazlı Style tanımları (KML rengi AABBGGRR formatında), Placemark açıklamaları, OSM attribution. XML escape dahil.
- Tüm export'lar `downloadLocal()` ile blob → `<a>` tıklaması → yerel indirme

### Ayarlar

- Popup: harita sekmesi açma
- Uygulama ayarları: element tipleri, voltage grupları, ülke kodu, veri kaynağı, chunk size, Overpass endpoint
- Katman stilleri: voltage grubu renk/çizgi kalınlığı, element grubu görünürlük/boyut
- Tüm ayarlar `chrome.storage.local`'de saklanır

---

## Kullanım Akışı

```
Popup ("Harita Sekmesini Aç")
  → chrome.tabs.create(map.html)
    → restoreLatestSnapshot() (varsa)
    → tab sistemi: Harita | Tablo | Kaynaklar | Ayarlar | Katmanlar

Veri çekme:
  Kaynaklar → "Veri Çek" → startOverpassJob()
    → chunk polling (3sn aralıkla)
    → her chunk: way sorgusu → 2sn bekle → node sorgusu
    → normalize → IndexedDB'ye kaydet
    → job tamam: snapshot oluştur → audit log → UI'da göster

Veri keşfi:
  Tablo → sırala/filtrele/ara/sayfala
  Tablo satırı → detay paneli (tag'ler, kalite, OSM link)
  Ctrl+tıklama → highlight (harita vurgusu + odaklanma)
  Çift tıklama → inline düzenleme

Import:
  Sürükle-bırak / dosya seç → GeoJSON/KML parse
    → saveSnapshot() + saveFeatures() → restoreLatest()

Export:
  GeoJSON / KML butonu → downloadLocal() → tarayıcı indirme
```

---

## Mimari

### Dizin Yapısı

```
src/
├── background/          # MV3 Service Worker
│   ├── service-worker.ts      # Message router, tab/chunk/export işlemleri
│   ├── overpass-client.ts     # Chunked Overpass fetch motoru
│   ├── overpass-request-rules.ts  # declarativeNetRequest header kuralları
│   └── job-store.ts           # Job/chunk oluşturma
├── app/                 # Harita ve veri arayüzü (tam sekme)
│   ├── map.html               # App shell (tab'lar, container'lar)
│   ├── map.ts                 # Tüm UI mantığı (~1100 satır)
│   └── job-log.ts             # Job log formatlayıcı
├── popup/               # Extension popup
│   ├── popup.html
│   └── popup.ts
├── data/                # Veri dönüşümü
│   ├── osm-normalizer.ts      # OSM element → PowerGridFeature
│   ├── voltage-normalizer.ts  # Voltage ayrıştırma ve gruplama
│   ├── overpass-query-builder.ts  # Overpass QL oluşturma
│   ├── geojson.ts             # GeoJSON import/export
│   ├── kml-exporter.ts        # KML 2.2 XML üretimi
│   └── kml-importer.ts        # Regex tabanlı KML parser
├── storage/             # Kalıcı veri katmanı
│   └── indexeddb.ts           # IndexedDB repository
├── common/              # Paylaşılan tipler ve sabitler
│   ├── types.ts               # Tüm tip tanımları
│   ├── defaults.ts            # Varsayılan değerler, renkler, gruplar
│   └── geometry.ts            # Geometri yardımcıları
├── diagnostics/         # Teşhis ve raporlama
│   └── audit-report.ts        # Kalite ve kaynak sağlığı raporu
└── styles/              # Stil dosyaları
    ├── app.css                # Uygulama stilleri
    └── popup.css              # Popup stilleri
```

### Veri Pipeline'ı

```
Overpass API / GeoJSON / KML
  → normalizer / importer
  → PowerGridFeature (birleşik model)
  → IndexedDB (DatasetSnapshot + features)
  → MapLibre harita katmanları + veri tablosu + audit + export
```

### Veri Akış Diyagramı

```
Popup                  Service Worker              Overpass Client
  │                         │                           │
  │── OPEN_MAP_TAB ────────>│                           │
  │                         │── chrome.tabs.create ──>  │
  │                         │                           │
  │                         │<── START_OVERPASS_JOB ──  │
  │                         │                           │
  │                         │── processNextChunk() ···  │
  │                         │     ┌─────────────┐      │
  │                         │     │ Way query    │      │
  │                         │     │ 2sn bekle    │      │
  │                         │     │ Node query   │      │
  │                         │     │ normalize()  │      │
  │                         │     └──────┬──────┘      │
  │                         │            ▼              │
  │                         │     IndexedDB             │
  │                         │            │              │
  │<── GET_JOB_STATUS ──────────────>    │              │
  │                         │            │              │
  Map App (poll 3sn) ───────┘            │              │
  │                                       ▼              │
  │── restoreLatestSnapshot() ─────> IndexedDB          │
  │── renderMap() → MapLibre         │                  │
  │── renderTable() → DOM tablosu    │                  │
  │── export/import → file I/O       │                  │
```

---

## Geliştirme Kılavuzu

### Gereksinimler

- Node.js >= 18
- npm >= 9
- Chrome / Chromium (test ve smoke için)

### Kurulum

```bash
git clone <repo>
cd osm-power-grid-tools
npm install
```

### Geliştirme Komutları

```bash
npm run dev          # Vite dev server (127.0.0.1)
npm run typecheck    # TypeScript tip kontrolü (tsc --noEmit)
npm run test         # Vitest unit testleri
npm run build        # Vite production build → dist/
npm run smoke        # Puppeteer smoke test (tarayıcı açar)
```

### Build Çıktısı

`dist/` dizini unpacked Chrome Extension olarak yüklenir:

```
dist/
├── manifest.json
├── data/countries.json
├── assets/app.js, app.css
├── assets/popup.js, popup.css
├── background/service-worker.js
└── src/popup/popup.html, src/app/map.html
```

Chrome'da `chrome://extensions` → "Paketlenmemiş öğe yükle" → `dist/` seçin.

### Derleme (Build) Detayları

- **Vite 6.x**: Çoklu input (popup, app, service worker) tek build'de birleşir
- Service worker ayrı chunk olarak `background/service-worker.js`'e yazılır
- `manifest.json` ve `data/countries.json` build sonrası `dist/`'e kopyalanır
- MapLibre bundle boyutu ~1MB (chunk size warning normaldir; failure değildir)
- Sourcemap'ler dahildir (`build.sourcemap: true`)

### Kod Stili ve Kurallar

- **TypeScript strict mode** (`tsconfig.json: strict: true`)
- ES2022 hedef, ESNext module
- `noEmit: true` (Vite derler, tsc sadece kontrol eder)
- Tüm UI vanilla DOM API ile yazılır (React/Vue/Svelte yok)
- UI değişikliklerinden önce `design-system.md` okunur
- Kod değişikliğinden sonra: `typecheck` → `test` → `build`

### Agent / IDE Kuralları

Repo içinde birden fazla agent rehberi bulunur:

| Dosya | Kullanım |
|-------|----------|
| `AGENTS.md` | Ana proje kuralları, tüm agent'lar için zorunlu |
| `SKILL.md` | Skill discovery için kompansiyonel rehber |
| `design-system.md` | UI/CSS değişiklikleri için zorunlu referans |
| `GEMINI.md` | Gemini agent'ları için giriş noktası |
| `CLAUDE.md` | Claude agent'ları için giriş noktası |
| `.cursorrules` | Cursor IDE yönlendirme |
| `.clinerules` | IDE helper kuralları |

### Önemli Mimari Kurallar

1. **Service worker kalıcı değildir**: MV3 service worker her an suspend olabilir. Durable state IndexedDB'de tutulur, `chrome.storage.local` sadece küçük ayarlar içindir.
2. **Veri pipeline'ı tektir**: Overpass, GeoJSON, KML — tüm kaynaklar `PowerGridFeature` modeline normalize edilir.
3. **Snapshot atomiktir**: Snapshot silme işlemi ilişkili feature kayıtlarını da temizler.
4. **Endpoint değişikliği**: Yeni Overpass endpoint'i eklenirse `manifest.json` host permissions güncellenir ve kullanıcıya extension reload gerektiği bildirilir.
5. **OSM attribution korunur**: Harita, export çıktıları ve uygulama metninde OpenStreetMap contributors / ODbL bilgisi silinmez.

---

## Teknoloji Stack'i

| Teknoloji | Sürüm | Kullanım |
|-----------|-------|----------|
| **TypeScript** | 5.8 | Tüm kaynak kodu |
| **Vite** | 6.x | Build tool, multi-entry |
| **MapLibre GL JS** | ^5.6 | Harita görselleştirme |
| **IndexedDB** (native) | — | Kalıcı veri deposu |
| **chrome.\* API** | MV3 | Extension host (storage, tabs, downloads, declarativeNetRequest) |
| **Vitest** | 3.1 | Unit test framework |
| **Puppeteer** | 24.x | Smoke/E2E test |
| **fake-indexeddb** | 6.x | Testlerde IndexedDB mock'u |
| **Vanilla DOM API** | — | Tüm UI (framework yok) |
| **CSS Custom Properties** | — | Tasarım token sistemi |

---

## Veri Modeli

### PowerGridFeature

Normalize edilmiş feature modeli:

```typescript
interface PowerGridFeature {
  id: string;                    // "way/12345" formatında benzersiz ID
  type: 'node' | 'way' | 'relation';  // OSM element tipi
  osmType?: string;              // OSM power tag değeri
  osmId: number;                 // OSM element ID'si
  elementType: ElementType;      // 14 farklı tip (line, cable, substation, ...)
  elementGroup: ElementGroup;    // 7 gruptan biri
  geometry: Geometry;            // GeoJSON geometry
  bbox?: [number, number, number, number];
  name?: string;                 // name tag
  operator?: string;             // operator tag
  voltageRaw?: string;           // Ham voltage tag
  voltagePrimary?: string;       // voltage:primary
  voltageSecondary?: string;     // voltage:secondary
  voltageGroup: VoltageGroup;    // Normalize grup (<20kV, 20-66kV, ...)
  frequency?: string;
  cables?: string;
  circuits?: string;
  wires?: string;
  line?: string;                 // line tag
  substation?: string;
  plantSource?: string;          // plant:source
  generatorSource?: string;      // generator:source
  source: 'osm-overpass' | 'geojson-import' | 'kml-import';
  countryCode: string;           // ISO 3166-1 alpha-2
  snapshotId: string;
  tags: Record<string, string>;  // Tüm OSM tag'leri
  quality: {
    score: number;               // 0-100
    missingVoltage: boolean;
    missingName: boolean;
    missingOperator: boolean;
    invalidGeometry: boolean;
  };
}
```

### Element Tipleri ve Grupları

| Grup (Türkçe) | Element Tipleri | Harita Rengi |
|----------------|----------------|--------------|
| hatlar | line, minor_line | `#0f8b8d` |
| kablolar | cable | `#64748b` |
| trafo_merkezi | substation | `#e4572e` |
| santraller | plant, generator | `#7c3aed` |
| trafo_merkezi_ici | transformer, switch, switchgear, compensator, converter | `#f59e0b` |
| direkler | tower, pole | `#64748b` |
| digerleri | other_power | `#64748b` |

### Voltage Grupları

| Grup | Etiket | Renk | Çizgi Kalınlığı |
|------|--------|------|-----------------|
| `<20kV` | 33 kV altı | `#4ade80` | 2 |
| `20-66kV` | 33 kV | `#16a34a` | 2.5 |
| `66-300kV` | 154 kV | `#1e293b` | 3 |
| `300-500kV` | 400 kV | `#ef4444` | 4 |
| `>500kV` | 500 kV üstü | `#b91c1c` | 5 |
| `unknown` | Bilinmeyen kV | `#f97316` | 1.5 |

### DatasetSnapshot

```typescript
interface DatasetSnapshot {
  id: string;
  label: string;
  fetchedAt: number;
  source: string;
  featureCount: number;
  license: string;
  attribution: string;
  countryFilter: string;
  voltageFilter: string[];
  elementFilter: string[];
  bbox: string;
  quality: {
    missingVoltageCount: number;
    missingNameCount: number;
    missingOperatorCount: number;
    invalidGeometryCount: number;
  };
}
```

---

## Depolama Stratejisi

### İlkeler

1. **IndexedDB** — tüm durable state: snapshot'lar, feature'lar, job'lar, log'lar, import'lar, export'lar
2. **chrome.storage.local** — sadece küçük ayarlar: popup seçimleri, endpoint, chunk size, katman stilleri
3. **Service worker global değişkenleri** — durable state İÇİN KULLANILMAZ

### IndexedDB Şeması

| Store | Key | Index'ler | Açıklama |
|-------|-----|-----------|----------|
| `snapshots` | `id` | — | DatasetSnapshot metadata |
| `features` | `id` | snapshotId, elementType, voltageGroup, countryCode | PowerGridFeature[] (500'lik batch) |
| `jobs` | `id` | — | OverpassJob + chunk detayları |
| `logs` | auto-id (UUID) | — | Zaman damgalı log kayıtları |
| `settings` | `id` | — | (rezerve) |
| `imports` | `id` | — | (rezerve) |
| `imports` | `id` | — | (rezerve) |

### Batch Yazma

Feature'lar 500'erli batch'ler halinde IndexedDB'ye yazılır. Her batch ayrı transaction'da işlenir.

### Snapshot Yönetimi

- `restoreLatestSnapshot()`: `fetchedAt` alanına göre sıralar, en son snapshot'ı ve feature'larını döndürür
- `deleteSnapshot()`: Cursor-based silme ile snapshot + ilişkili feature'ları temizler
- `deleteAllSnapshots()`: Tüm store'ları temizler
- App açılışında otomatik restore: en son snapshot varsa MapLibre ve tabloya yüklenir

---

## Overpass Entegrasyonu

### Chunking

- Büyük bbox, `chunkSize` (varsayılan 2.5 derece) ile grid'e bölünür
- Minimum chunk size: 0.1 derece
- Koordinatlar 6 ondalık basamağa yuvarlanır

### İki Fazlı Sorgu

Her chunk için **way sorgusu** (hat/kablo) ve **node sorgusu** (trafo/santral/direk) ayrı ayrı çalıştırılır. Aralarında 2 saniye gecikme vardır. Way başarılı + node başarısız olsa bile chunk `completed` kabul edilir (nodeError ile işaretlenir).

### Overpass Sorgu Formatı

```
[out:json][timeout:180][maxsize:268435456];
(
  way["power"~"line|minor_line|cable"](bbox);
  relation["power"~"line|minor_line|cable"](bbox);
);
out geom tags;
(
  node["power"~"substation|plant|generator|transformer|tower|pole|switch|switchgear|compensator|converter"](bbox);
  way["power"~"substation|plant|generator|transformer"](bbox);
  relation["power"~"substation|plant|generator|transformer"](bbox);
);
out geom tags;
```

### Varsayılan Endpoint'ler

1. `https://overpass-api.de/api/interpreter`
2. `https://overpass.private.coffee/api/interpreter`
3. `https://overpass.kumi.systems/api/interpreter`

### Endpoint Fallback Sırası

Kullanıcı tercihi → public endpoint 1 → public endpoint 2 → public endpoint 3

Her endpoint'te önce `post-form` transport denenir, başarısız olursa `get` transport'a geçilir.

### Non-retryable Hatalar

HTTP 406, 429, 504 ve Overpass "out of memory" / "runtime error" mesajları aynı endpoint/transport kombinasyonunda tekrar denenmez.

### adaptif Bekleme

| Durum | Bekleme | Strateji |
|-------|---------|----------|
| HTTP 429 (rate limit) | 10 saniye | Endpoint değiştir |
| HTTP 504 (gateway timeout) | 3 saniye | Endpoint değiştir |
| Diğer hatalar | `min(retryCount, 3) × 500ms` | Kademeli backoff |
| `remark` alanında hata | Hemen atla | Endpoint değiştir |

---

## Import / Export

### GeoJSON Export

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "app": "OSM Power Grid Tools",
    "exportedAt": "2025-01-01T00:00:00.000Z",
    "source": "OpenStreetMap / Overpass API",
    "license": "ODbL 1.0",
    "attribution": "OpenStreetMap contributors",
    "filters": {},
    "featureCount": 1234
  },
  "features": [...]
}
```

### KML Export (KML 2.2)

- Folder grupları: Lines, Cables, Substations, Plants, Generators, Transformers, Towers, Poles, Switches, Switchgears, Compensators, Converters, Other
- Voltage bazlı Style'lar (KML color format: AABBGGRR)
- Placemark: name + styleUrl + description (Type / Voltage / Operator / Source / OSM attribution)
- MultiLineString → MultiGeometry
- XML escape (`&`, `<`, `>`, `"`, `'`)

### GeoJSON Import

- FeatureCollection, tek Feature, ham Geometry kabul eder
- Tag'leri `properties.tags` veya doğrudan propertylerden okur
- `elementType` için fallback: `tags.power`
- Kalite skoru: voltage varsa 90, yoksa 70
- Kaynak: `geojson-import`

### KML Import

- Regex tabanlı parser (XML DOM bağımlılığı yok)
- Folder path'inden element tipi çıkarımı:
  - "line" içeren → line, minor_line
  - "substation" → substation, transformer
  - diğer → other_power
- Tüm import'lar `missingVoltage: true` + skor 70
- Kaynak: `kml-import`

### CSV Export (OSM Push Pipeline)

Data tab'ındaki feature'ları OSM'e göndermek için CSV tabanlı toplu düzenleme pipeline'ı:

| Kolon | Açıklama |
|-------|----------|
| `osmType` | OSM element tipi (node/way/relation) |
| `osmId` | OSM element ID'si |
| `elementType` | Normalize element tipi |
| `name (original)` | OSM'deki mevcut ad (değiştirilemez, koruma amaçlı) |
| `name (new)` | Kullanıcı tarafından girilen yeni ad |
| `operator (original)` | OSM'deki mevcut operatör (değiştirilemez) |
| `operator (new)` | Kullanıcı tarafından girilen yeni operatör |
| `voltage (original)` | OSM'deki mevcut voltaj (değiştirilemez) |
| `voltage (new)` | Kullanıcı tarafından girilen yeni voltaj |

- UTF-8 BOM + CRLF satır sonu
- Sadece `(new)` sütunları düzenlenebilir
- Boş `(new)` = değişiklik yok, OSM'e gönderilmez
- Import sonrası `osmType+osmId` ile eşleme yapılır (snapshotId'den bağımsız)
- Değişen feature'lar tabloda renkli satır ve `↦` okuyla gösterilir
- "Değişenler" filtre butonu ile sadece düzenlenen feature'lar gösterilir
- `matchQuality` skoru: 0-100 float, text input ile filtrelenebilir

---

## UI / Tasarım Sistemi

Detaylı tasarım sistemi `design-system.md` dosyasında tanımlıdır.

### Token Sistemi

CSS custom properties ile 100+ token:

```css
:root {
  /* Renk */
  --color-primary: #0f766e;
  --color-accent: #e4572e;
  --color-bg-page: #f4f7fa;
  --color-text-strong: #122033;

  /* Tipografi */
  --font-family-sans: Inter, ui-sans-serif, system-ui, ...;
  --font-size-body: 14px;
  --font-size-table: 12px;

  /* Spacing (4px tabanlı) */
  --space-1: 4px;  --space-2: 8px;  --space-4: 16px;

  /* Radius, Shadow, Z-index */
  --radius-md: 6px;
  --shadow-md: 0 8px 20px rgba(15, 23, 42, 0.12);
  --z-toast: 120;
}
```

### Tab Sistemi

| Sekme | İçerik |
|-------|--------|
| Harita | MapLibre canvas, katman paneli, sığdırma butonu |
| Tablo | Sıralanabilir tablo, arama, filtre, sayfalama, detay paneli |
| Kaynaklar | Overpass job kontrolü, import/export, log, veri silme |
| Ayarlar | Element/voltage filtreleri, endpoint, chunk size, query önizleme |
| Katmanlar | Voltage renk/çizgi, element görünürlük/boyut |

### Bileşenler

- **Summary kartları**: bağımsız bilgi kartları, `--shadow-sm`
- **Veri tablosu**: kompakt (12px/8px), sticky header, sort göstergeli
- **Detay paneli**: monospace tag'ler, kalite rozetleri, OSM link
- **Toast**: 3 saniye auto-hide, `role="status"`, `aria-live="polite"`
- **Layer panel**: floating, 260px genişlik, `--shadow-lg`
- **Log paneli**: monospace 12px, kopyalanabilir textarea, scroll 220-240px
- **Dropdown zone**: dashed border, dragover feedback, hata durumu
- **Progress bar**: chunk bazında tamamlanan/toplam, hata sayısı

### Erişilebilirlik

- Tüm interaktif elemanlar klavye erişimli
- Focus ring: `--color-focus`, 2px offset
- Icon-only butonlarda `aria-label` zorunlu
- Status: `role="status"`, hata: `role="alert"`
- WCAG AA kontrast (4.5:1 normal, 3:1 büyük metin)
- `prefers-reduced-motion` desteği

---

## Test

### Unit Test (Vitest)

10 test dosyası, 50+ test:

| Test Dosyası | Kapsam |
|-------------|--------|
| `tests/voltage-normalizer.test.ts` | Voltage ayrıştırma ve gruplama |
| `tests/osm-normalizer.test.ts` | OSM element normalizasyonu |
| `tests/overpass.test.ts` | Sorgu oluşturma, chunk bölme |
| `tests/overpass-client.test.ts` | Chunk işleme, two-phase fetch, endpoint fallback |
| `tests/overpass-request-rules.test.ts` | Header kuralı oluşturma |
| `tests/job-logging.test.ts` | Job log formatı |
| `tests/repository.test.ts` | IndexedDB işlemleri, snapshot restore |
| `tests/audit-report.test.ts` | Audit raporu hesaplama |
| `tests/import-export.test.ts` | GeoJSON/KML round-trip |
| `tests/geometry-calc.test.ts` | Geometri hesaplamaları (uzunluk/km, alan/m²) |

### Smoke Test (Puppeteer)

`tests/smoke-extension.cjs`: Chrome'u built extension'la açar, popup'ı tetikler, harita sekmesini açar, MapLibre canvas'ını bekler, GeoJSON fixture import eder, feature'ın tabloda göründüğünü ve export butonlarının çalıştığını doğrular.

### Test Fixtures

- `tests/fixtures/sample-power-grid.geojson`
- `tests/fixtures/sample-power-grid.kml`

### Setup

`tests/setup.ts`: `fake-indexeddb` ile native IndexedDB mock'u. Tüm testlerde kullanılır.

```bash
npm run test        # Tüm unit testleri
npm run smoke       # Puppeteer E2E (tarayıcı açar)
```

---

## Güvenlik ve Lisans

- **Backend yok**: Tüm veri yerel IndexedDB'de kalır
- **Secret/token yok**: API anahtarı veya kimlik bilgisi saklanmaz
- **Remote code yok**: Uzaktan JavaScript çalıştırılmaz
- **Host permissions minimum**: Sadece Overpass endpoint'leri ve OSM tile'ları
- **OSM/ODbL korunur**: Harita, uygulama metni ve export çıktılarında OpenStreetMap contributors / ODbL 1.0 bilgisi yer alır
- **declarativeNetRequest**: User-Agent sadece Overpass isteklerinde değiştirilir

### Veri Kaynakları

- **OpenStreetMap** (Overpass API): Birincil veri kaynağı
- **GeoJSON/KML import**: Kullanıcı tarafından sağlanan dosyalar
- **OIM / Flosm**: Sadece referans/görsel kaynak (scraping yok)

---

## Toplu Düzenleme Kuralları ve OSM Uyumu

OSM Power Grid Tools ile yapılan toplu veri gönderimleri, OpenStreetMap topluluğu ve [Otomatik Düzenleme Politikası](https://wiki.openstreetmap.org/wiki/Automated_Edits/Code_of_Conduct) kurallarına tam uyumlu olarak yürütülür.

### İletişim ve Danışma

Tüm toplu düzenlemeler öncesinde topluluk bilgilendirilir ve görüşler alınır:

| Kanal | Adres |
|-------|-------|
| OSM Wiki sayfası | [Automated edits/OSM Power Grid Tools](https://wiki.openstreetmap.org/wiki/Automated_edits/OSM_Power_Grid_Tools) |
| Topluluk forumu | [OSM Enerji Şebekesi Araçları](https://community.openstreetmap.org/t/osm-enerji-sebekesi-araclari-osm-power-grid-tools/144237) |
| E-posta listesi | [talk-tr@openstreetmap.org](mailto:talk-tr@openstreetmap.org) |
| OSM kullanıcısı | [OSM_PGM_TR](https://www.openstreetmap.org/user/OSM_PGM_TR) |

### Changeset Yönetimi

| Kural | Değer |
|-------|-------|
| Maksimum feature/changeset | 200 |
| Coğrafi gruplama | İl/ilçe ölçeğinde (mümkün olduğunca) |
| Değişiklik kapsamı | Sadece `name` ve `operator` etiketleri (başlangıç) |
| Geometri değişikliği | Yok |
| Gönderim öncesi inceleme | Evet |
| Opt-out desteği | Evet (`mechanical_edit=no` ile) |

### Zorunlu Changeset Etiketleri

Her changeset aşağıdaki etiketleri içermelidir:

| Etiket | Değer |
|--------|-------|
| `created_by` | OSM Power Grid Tools |
| `comment` | İşlemi açıklayan kısa not (Türkçe) |
| `source` | OpenStreetMap; existing OSM tags reviewed with OSM Power Grid Tools |
| `mechanical` | yes |
| `bot` | no |
| `locale` | tr_TR |
| `wiki` | Automated_edits/OSM_Power_Grid_Tools |
| `consultation` | https://community.openstreetmap.org/t/osm-enerji-sebekesi-araclari-osm-power-grid-tools/144237 |

### Opt-out Mekanizması

Belirli bir OSM nesnesinin toplu düzenleme kapsamı dışında tutulması için:

1. Nesneye `mechanical_edit=no` etiketi eklenir
2. Gönderim script'i bu etiketi görünce nesneyi atlar
3. Forum başlığına yazılarak da nesne/alan bildirilebilir
4. İtiraz durumunda `OSM_PGM_TR` üzerinden OSM mesajı gönderilebilir

### Veri Gönderim Akışı

```
PowerGridFeature (IndexedDB)
  → Kullanıcı düzenlemeleri (inline edit / CSV import)
  → Diff hesaplama (orijinal vs değişmiş)
  → OAuth 2.0 + PKCE kimlik doğrulama (chrome.identity.launchWebAuthFlow)
  → Changeset aç (wiki=..., mechanical=yes, comment=..., source=...)
  → OSM XML upload (POST /api/0.6/changeset/#id/upload)
  → Changeset kapat
  → Doğrulama (Verify: OSM'den son tag'leri çek, IndexedDB'yi güncelle)
```

### Per-Element Changeset Stratejisi

OSM Production API'si bbox sınırı nedeniyle büyük coğrafyalarda tek changeset kullanılamaz. Bu nedenle her element için ayrı changeset açılır:

- **Artı**: Her element bağımsız, bbox sorunu yok, hata durumunda sadece 1 element etkilenir
- **Eksi**: Çok sayıda changeset (1319 element → 1300+ changeset), OSM rate limit (429) riski

Overpass API'den çekilen veriler OSM'e geri gönderilirken `POST /api/0.6/changeset/#id/upload` endpoint'i kullanılır.

---

## Bilinen Sınırlamalar

- Ülke kataloğu MVP'de sadece Türkiye içerir
- Büyük ülkeler için chunk size küçültme gerekebilir
- PMTiles, PBF import, topoloji analizi, KMZ export, dashboard modu ve offline basemap cache gelecek çalışmalardır
- Dark mode planlanmıştır ancak henüz uygulanmamıştır
- OSM yazma API'si (OAuth 2.0 + PKCE) implemente edilmiş ve çalışır durumdadır. Push edilen feature'lar IndexedDB'de `pushStatus='uploaded'` olarak işaretlenir
- Per-element changeset stratejisi nedeniyle büyük gönderimlerde OSM rate limit (429) ile karşılaşılabilir; 120sn bekleme sonrası otomatik devam eder
- Batch 1 ve 2'deki changeset'lerde (`wiki`) tag'i eksik/yanlıştır (kapalı changeset'ler düzeltilemez)
- 24 element çeşitli 503/timeout hataları nedeniyle push edilememiştir (yeniden denenebilir)
- Drag-and-drop drop zone görsel standardı henüz tam implemente edilmemiştir (file input çalışır)
- MapLibre feature tooltip/popup henüz eklenmemiştir
- CSS token refactor'ı tamamlanmamıştır (bazı değerler hard-coded)

---

## Oturum Geçmişi

### 29 Mayıs 2026 — opencode (deepseek-v4-flash-free)

**Yapılanlar:**
- Data tab'ı tamamen yeniden yazıldı: summary kartları, breakdown tablosu, sıralanabilir/sayfalanabilir tablo, detay paneli, inline editing (name/operator/voltageRaw), düzenlenen feature takibi (`editedFeatureIds`)
- Highlight butonu → harita sekmesine geçiş + haritada vurgu + odaklanma
- KML export doğrudan istemcide çalışacak şekilde değiştirildi (service worker üzerinden değil)
- GeoJSON import eksik alanlar eklendi: osmType, osmId, frequency, cables, circuits, wires, line, substation, plantSource, generatorSource
- OSM linki detay panelinde sadece osmType && osmId varsa gösteriliyor
- "Tümünü göster" (⊞) butonu haritaya eklendi
- Way/node sorgu ayrıştırması: her chunk way + node ayrı sorgulanıyor, 2sn gecikmeli
- Overpass `remark` alanından hata tespiti eklendi
- `maxsize` küçültüldü (overpass-api.de 512MB, kumi.systems 256MB)
- `fitMapToFeatures` stack overflow hatası düzeltildi (`Math.min(...)` spread → for döngüsü)
- Highlight vurgusu `feature-state` → `['get', 'highlighted']` (GeoJSON property) olarak değiştirildi
  - **Sorun**: feature-state filter/layout property'lerinde desteklenmiyor
  - **Çözüm**: feature-state tamamen kaldırıldı; highlight değeri `renderMap()` içinde her feature'ın GeoJSON property'sine ekleniyor; tüm expression'lar `['get', 'highlighted']` kullanıyor
- Beyaz glow layer'lar eklendi (line + icon) — highlight görünürlüğü için
  - **Sorun** (1. deneme): `filter` + `['feature-state', ...]` → "not supported with filters"
  - **Sorun** (1. deneme): `['feature-state', ...]` layout property'de (`icon-size`) → "not supported with layout properties"
  - **Çözüm**: glow layer'larında filtre kaldırıldı, opacity `['case', ['==', ['get', 'highlighted'], true], 0.75, 0]` ile kontrol; layout property'lerinde `['get', 'highlighted']`
- Highlight rengi değiştirildi: `#f59e0b` → `#FFCC00` → `#FF4400` (turuncu-kırmızı, OSM tile'larında daha görünür)
- `applyAllFeatureStates()` fonksiyonu kaldırıldı (artık gereksiz, highlight GeoJSON property'sinden okunuyor)

**Doğrulama:** typecheck ✅, 9/9 test ✅, build ✅

---

### 1 Haziran 2026 — opencode (deepseek-v4-flash-free) — Batch 1: CSV & OSM Push

**Yapılanlar:**
- CSV export pipeline: IndexedDB'deki feature'lar orijinal/yeni kolonlarıyla CSV'ye aktarılıyor (UTF-8 BOM, CRLF)
- CSV import: değişen kolonlar algılanıyor, feature'lar `osmType+osmId` veya `featureId` ile eşleşiyor
- OAuth 2.0 + PKCE: `chrome.identity.launchWebAuthFlow` ile OSM girişi, token IndexedDB'de saklanıyor
- Token server (`token-server.js`): localhost:9877 üzerinden token alımı
- Streaming push: `chrome.runtime.connect()` ile port tabanlı progress (`osm-push` port)
- Push progress bar: `<progress id="osmPushProgress">`, per-chunk güncelleme
- Push sonuç kartı: changeset linki, feature sayısı, süre
- Buton loading states: "Hazırlanıyor...", "Gönderiliyor... X/Y", "Doğrulanıyor..."
- OSM element fetch'leri paralelleştirildi: 20 element/batch
- Push status persistence: `pushStatus='uploaded'` IndexedDB'ye kaydediliyor
- 1339 element push edildi: 1335 başarılı, 4 hata (OSM 503), 1326 changeset
- Verify sonrası tag güncelleme: OSM API'den son tag'ler çekilip IndexedDB feature'ları güncelleniyor
- Auth status'ta kullanıcı adı: `OsmAuthTokenRecord.displayName` ekran adı gösterimi
- Geometry tip kolonu (Point/LineString/Polygon/MultiLineString/MultiPolygon)
- Uzunluk (km) ve alan (m²) kolonları: Haversine + Shoelace formülleri
- "İtilenler" filtresi: sadece `pushStatus='uploaded'` olanları göster
- Geometry tip filtresi
- `geometry-calc.ts`: `computeLengthKm()` ve `computeAreaM2()` fonksiyonları

**Doğrulama:** typecheck ✅, test ✅, build ✅ (10/10 test, 50+ test)

### 1 Haziran 2026 — opencode (deepseek-v4-flash-free) — Batch 2: ALL CAPS → Proper Case Fix

**Yapılanlar:**
- 1319 ALL CAPS name düzeltmesi OSM Production'a push edildi
- 1005 elementte orijinal isme dönüş, 314 elementte title-case dönüşümü
- `wiki=Automated_edits/OSM_Power_Grid_Tools` tag'i changeset'lere eklendi
- 429 rate limit yönetimi: 120sn bekleme + otomatik devam
- Toplamda 4 batch'te 1729 push (bazı mükerrer), 1339 unique element Proper Case'te
- 24 element 503/timeout nedeniyle push edilemedi

**Doğrulama:** typecheck ✅, test ✅, build ✅

**Bilinen sorunlar:**
- Batch 1 ve 2'deki changeset'lerde `wiki` tag'i eksik/yanlış (kapalı changeset düzeltilemez)
- 24 element push edilemedi (yeniden denenebilir)

---

## Geliştirilecek Özellikler

### OSM'ye Gönder (Push to OSM) — ✅ Uygulandı

> **Bu özelliklerin büyük kısmı implemente edilmiş ve üretimde kullanılmaktadır.** Aşağıdaki Faz 1 (temel tag düzenleme), CSV tabanlı toplu düzenleme pipeline'ı ve OAuth 2.0 kimlik doğrulama tamamen çalışır durumdadır. Faz 2 ve 3 ise gelecek çalışmalardır.

Eklentiye indirilen OSM verilerinin iyileştirilerek OpenStreetMap'e geri gönderilmesi. OSM v0.6 Yazma API'si kullanılır.

#### Mimari

```
PowerGridFeature (IndexedDB)
  → Kullanıcı düzenlemeleri (inline edit, CSV import)
  → Diff hesaplama (orijinal vs değişmiş)
  → OSM XML (node/way/relation + tags)
  → OAuth 2.0 kimlik doğrulama
  → Changeset aç → CRUD istekleri → Changeset kapat
```

#### OSM API v0.6 Kullanımı

| İstek | Endpoint | Açıklama |
|-------|----------|----------|
| `PUT` | `/api/0.6/changeset/create` | Yeni değişiklik kümesi oluşturur, XML döner |
| `PUT` | `/api/0.6/node` | Yeni nokta oluşturur/günceller (ID'siz = create, ID'li = update) |
| `PUT` | `/api/0.6/way` | Yeni çizgi oluşturur/günceller |
| `POST` | `/api/0.6/changeset/#id/upload` | Toplu OSC (OsmChange) yükleme |
| `PUT` | `/api/0.6/changeset/#id/close` | Değişiklik kümesini kapatır |

- **Kimlik doğrulama**: OAuth 2.0 (OSM kayıtlı kullanıcı gereklidir)
- **Veri formatı**: XML (OSM v0.6 şeması)
- **Changeset etiketi**: `created_by=OSM Power Grid Tools`, `comment=...`, `source=...`
- **Hata yönetimi**: API dönüş kodları (409 conflict, 412 precondition failed), conflict çözümü

#### Faz 1 — Temel Tag Düzenleme (Ad, Operatör, Voltaj) — ✅ Tamamlandı

> İndirilen verilerdeki mevcut node/way/relation'ların tag'lerini güncelleme. **Tüm Faz 1 özellikleri implemente edilmiş ve 1339 OSM elementine başarıyla uygulanmıştır.**

1. Kullanıcı Data tab'ında inline edit ile name, operator, voltageRaw alanlarını düzenler
2. Düzenlenen feature'lar `editedFeatureIds` set'inde işaretlenir
3. "OSM'ye Gönder" butonu sadece düzenlenen feature'ları içeren bir OSC (OsmChange) XML'i oluşturur
4. XML'de her feature için `<modify>` bloğu: orijinal OSM ID + yeni tag'ler
5. OAuth 2.0 ile kimlik doğrulama → changeset aç → `POST /api/0.6/changeset/#id/upload` → kapat

**Gerçekleşen gönderim (Haziran 2026):**
- **1339 OSM element** (way) ALL CAPS → Proper Case düzeltildi
- **1335 başarılı**, 4 hata (OSM 503)
- **1319 name** düzeltmesi (1005'inde orijinal isme dönüş, 314'ünde title-case dönüşümü)
- Per-element changeset stratejisi: her element için ayrı changeset (bbox sınırı nedeniyle)
- Changeset etiketleri: `mechanical=yes`, `wiki=Automated_edits/OSM_Power_Grid_Tools`, `consultation=...`
- 24 element 503/timeout nedeniyle push edilemedi (tekrar denenebilir)
- OSM rate limit (429) ile karşılaşıldı; 120sn bekleme + otomatik devam mekanizması çalıştı

**OSC XML örneği (tag güncelleme):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<osmChange version="0.6" generator="OSM Power Grid Tools">
  <modify>
    <way id="12345678" visible="true" version="5">
      <nd ref="987654"/>
      <nd ref="987655"/>
      <tag k="power" v="line"/>
      <tag k="name" v="Düzeltilmiş Hat Adı"/>
      <tag k="operator" v="TEİAŞ"/>
      <tag k="voltage" v="154000"/>
    </way>
  </modify>
</osmChange>
```

**Kullanıcı akışı:**
1. Overpass'ten veri çek
2. Data tab → ilgili satırı bul → çift tıkla → name/operator/voltage düzenle
3. Tablo üstünde "OSM'ye Gönder (1)" butonu belirir (düzenlenen feature sayısı)
4. Butona tıkla → OAuth 2.0 girişi (popup) → onay → gönderim başlar
5. Başarılı → changeset linki gösterilir (`https://osm.org/changeset/#id`)

#### Faz 2 — Geometri ve Detaylı Özellik Düzenleme

1. Kullanıcı Data tab'ında frequency, cables, circuits, wires, line, substation, plantSource, generatorSource alanlarını düzenleyebilir
2. Geometri düzeltme: node koordinat düzeltme, way node referansı güncelleme (ileri seviye)
3. Feature silme: `visible="false"` ile OSM'den kaldırma
4. Yeni feature ekleme: `<create>` bloğu ile OSM'de yeni node/way oluşturma
5. Çakışma tespiti: gönderim öncesi son versiyon kontrolü (`version` alanı)
6. Değişiklik önizleme: gönderimden önce değişecek tag'lerin karşılaştırma tablosu

#### Faz 3 — Eksik Veri Tamamlama ve Toplu İyileştirme

1. İndirilen verilerde bulunmayan ama olması gereken feature'ların tespiti:
   - **Hat ekleme**: İki trafo merkezi arasında bağlantı hattı yoksa kullanıcıya öner
   - **Trafo merkezi ekleme**: Birden çok hattın kesiştiği noktada trafo merkezi yoksa öner
   - **Santral ekleme**: generator tag'i olan node'lar tespit edildiğinde üst santral öner
   - **Trafo içi ekipman**: trafo merkezi içinde switch/transformer/switchgear eksikse öner
2. Kullanıcı önerilen feature'ları onaylar veya reddeder
3. Onaylananlar OSM'ye yeni node/way olarak gönderilir
4. Toplu gönderim: birden çok değişiklik tek changeset'te birleştirilir

#### CSV Tabanlı Toplu Düzenleme Pipeline'ı

```text
IndexedDB'deki mevcut feature'lar
  → CSV export (orijinal + mevcut değerler yan yana kolonlarda)
  → Kullanıcı Excel'de düzenler
  → CSV re-import (değişen kolonlar algılanır)
  → Değişiklik önizleme tablosu (orijinal ↦ yeni)
  → OSM'ye gönder (OSC XML)
```

**CSV formatı:**

| osmId | osmType | elementType | name (original) | name (new) | operator (original) | operator (new) | voltage (original) | voltage (new) |
|-------|---------|-------------|-----------------|------------|-------------------|---------------|-------------------|---------------|
| 12345 | way | line | Eski Hat | Yeni Hat | | TEİAŞ | 154000 | 154000 |
| 67890 | node | substation | TM-1 | TM-1 (Revize) | TEDAŞ | TEİAŞ | | 154000 |

- Orijinal değerler değiştirilemez kolonlardır (koruma amaçlı)
- Sadece `(new)` sütunları düzenlenebilir
- Boş `(new)` = değişiklik yok, OSM'ye gönderilmez
- Import sonrası değişen feature'lar tabloda renkli satır ve `↦` okuyla gösterilir
- Data tab'ında "Değişenler" filtre butonu eklenir
- Orijinal ve yeni değerler yan yana kolonlarda gösterilir:

| Özellik | Orijinal | Yeni |
|---------|----------|------|
| Ad | Eski Hat | **Yeni Hat** |
| Operatör | — | **TEİAŞ** |
| Voltaj | 154000 | 154000 |

#### Data Tab'ına Eklenecekler (Tüm Fazlar)

- "Değişenler" filtre butonu (sadece edited feature'ları göster)
- "Orijinal / Yeni" karşılaştırma modu (tablo kolonları iki sütunlu görünür)
- Değişiklik özet satırı: "12 değişiklik | 3 yeni | 1 silme"
- "CSV İndir" butonu (orijinal + yeni kolonlarıyla)
- "CSV Yükle" butonu (düzenlenmiş CSV'yi geri yükler)
- "OSM'ye Gönder" butonu (OAuth durumuna göre aktif/pasif)
- Changeset geçmişi: daha önce gönderilen changeset ID'leri ve linkleri

#### OAuth 2.0 Kimlik Doğrulama Akışı

```
1. Kullanıcı "OSM'ye Gönder" butonuna tıklar
2. Eklenti yeni sekme açar: https://www.openstreetmap.org/oauth2/authorize?...
3. Kullanıcı OSM hesabıyla giriş yapar ve yetki verir
4. OSM tarayıcıyı redirect URI'ye yönlendirir (auth code ile)
5. Eklenti auth code'u alır → token endpoint'e POST → access_token alır
6. Access_token IndexedDB'de saklanır (chrome.storage.local değil!)
7. Sonraki tüm API isteklerinde Authorization: Bearer başlığı eklenir

Not: OAuth akışı için extension redirect URI ayarları OSM hesabında
yapılandırılmalıdır. MVP'de OAuth 2.0 Authorization Code + PKCE kullanılır.
```

#### manifest.json Değişiklikleri

```json
{
  "permissions": [
    "storage", "tabs", "downloads", "unlimitedStorage",
    "declarativeNetRequestWithHostAccess", "identity"
  ],
  "host_permissions": [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://tile.openstreetmap.org/*",
    "https://*.openstreetmap.org/*",
    "https://api.openstreetmap.org/*"
  ]
}
```

- `identity` permission'ı OAuth 2.0 flow'u için eklenir
- `api.openstreetmap.org` OSM v0.6 API'si için host permission

#### Güvenlik ve Kural Notları

- OSM'a gönderim öncesi kullanıcı onayı zorunludur
- Her changeset açıklayıcı bir `comment` etiketi içermelidir
- OSM Topluluk Kuralları'na uygunluk sağlanmalıdır
- Otomatik/yığın gönderimlerde OSM Otomatik Düzenleme Politikası'na uyulmalıdır
- Access_token sadece IndexedDB'de saklanır, asla `chrome.storage.local`'e yazılmaz
- Kullanıcı token'ı istediği zaman iptal edebilir ("OSM'den Çıkış")
- Gönderim öncesi version çakışması kontrolü yapılır (feature güncel değilse kullanıcı uyarılır)
- Kuru çalışma (dry-run) modu: gerçek API isteği yapmadan OSC XML'ini önizleme

### Diğer Gelecek Özellikler

- **Dark mode**: Tasarım sistemi token'ları hazır (`design-system.md`), uygulama bekliyor
- **Topoloji analizi**: Hat bağlantıları, trafo merkezi yönlendirmeleri
- **Dashboard modu**: Grafiklerle özet istatistik
- **MapLibre tooltip/popup**: Feature hover/click bilgi gösterimi
- **Drag-and-drop drop zone**: Görsel iyileştirme (mevcut file input çalışır durumda)
- **CSS token refactor**: Hard-coded değerlerin tasarım token'larına taşınması
