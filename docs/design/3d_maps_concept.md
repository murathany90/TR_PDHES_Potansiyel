En verimli yaklaşım şu olmalı: **Harita sekmesini küçük bir CBS/GIS çizim editörüne dönüştürüp**, 3D çizimleri artık tahmini kare/dairelerden değil, kullanıcının haritada çizdiği **manuel GeoJSON katmanlarından** üretmek.

Yani “Mesafe Ölç” aracı sadece ölçüm aracı olarak kalmamalı; çizilen hat/polygon sonradan **tesis bileşeni** olarak etiketlenebilmeli.

---

## 1. Temel öneri: “Ölçüm” aracını “PDHES çizim aracına” dönüştür

Mevcut akış şöyle olmalı:

1. Kullanıcı haritada sağ tık yapar.
2. **Mesafe Ölç** seçer.
3. Haritada çizgi, çoklu çizgi veya kapalı alan çizer.
4. Çizim bitince mevcut **Profil** butonunun yanına şu kontroller gelir:

```text
[Profil] [Tür Seç ▼] [Kaydet] [GeoJSON İndir] [Sıfırla]
```

Dropdown seçenekleri:

```text
Mesafe
Mevcut Baraj Seti
Alt Rezervuar
Deniz Sınırı
Üst Rezervuar
Güç Evi
Mevcut Şalt Sahası
Yeni Şalt Sahası
Cebri Boru / Tünel Ekseni
Su Alma Yapısı
Kuyruk Suyu Çıkışı
Denge Bacası
Servis / Drenaj Tüneli Portalı
```

Senin verdiğin listeye ek olarak özellikle şu üç seçenek önemli:

* **Cebri Boru / Tünel Ekseni**
* **Kuyruk Suyu Çıkışı**
* **Denge Bacası**

Çünkü PDHES 3D çiziminde asıl gerçekçilik bu su yolu bileşenlerinden gelir.

---

## 2. Çizim türleri çizgi mi polygon mu olmalı?

Her tesis bileşeni aynı geometri tipiyle çizilmemeli.

| Bileşen            | Geometri tipi                | Açıklama                                                |
| ------------------ | ---------------------------- | ------------------------------------------------------- |
| Mesafe             | LineString / Polyline        | Sadece ölçüm                                            |
| Mevcut Baraj Seti  | LineString veya Polygon      | Baraj aksı kırmızı çizgi; gövde genişliği varsa polygon |
| Alt Rezervuar      | Polygon                      | Göl/deniz/kuyruk suyu alanı                             |
| Deniz Sınırı       | LineString                   | Kıyı çizgisi / deniz sınırı                             |
| Üst Rezervuar      | Polygon                      | Yapay üst havuz veya doğal plato göleti                 |
| Güç Evi            | Polygon                      | Yeraltı güç evi izdüşümü veya yüzey binası              |
| Mevcut Şalt Sahası | Polygon                      | Mevcut HES şalt alanı                                   |
| Yeni Şalt Sahası   | Polygon                      | Önerilen yeni şalt alanı                                |
| Cebri Boru / Tünel | LineString / MultiLineString | Üst rezervuardan güç evine hat                          |
| Su Alma Yapısı     | Polygon                      | Intake yapısı                                           |
| Kuyruk Suyu Çıkışı | LineString / Polygon         | Güç evinden alt rezervuara dönüş                        |
| Denge Bacası       | Point veya küçük Polygon     | Surge tank / şaft                                       |

Bu ayrım çok önemli. Çünkü 3D tarafında:

* **Polygon** → yüzey / alan / extrusion
* **LineString** → boru / tünel / aks / bağlantı hattı
* **Point** → marker / baca / portal / ölçüm noktası

olarak yorumlanmalı.

---

## 3. Dropdown sonrası kayıt mantığı nasıl olmalı?

Kullanıcı çizimi bitirince önce tür seçmeli, sonra **Kaydet** demeli. Kaydedilen her çizim şu bilgileri taşımalı:

```json
{
  "siteId": "jica-gokcekaya-pspp",
  "siteName": "Gökçekaya PDHES",
  "featureType": "upper_reservoir",
  "displayName": "Gökçekaya PDHES - Üst Rezervuar",
  "geometryType": "Polygon",
  "source": "manual_map_drawing",
  "confidence": "B_SATELLITE_MANUAL",
  "createdAt": "2026-07-09T...",
  "properties": {
    "material": "water",
    "role": "upperReservoirWater",
    "drawMethod": "right_click_measure_tool",
    "lengthM": 4051,
    "areaM2": 550000,
    "minElevationM": 785,
    "maxElevationM": 810,
    "meanElevationM": 798,
    "notes": "Google Earth/uydu görüntüsü üzerinden manuel çizim"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  }
}
```

Böylece agent bu dosyayı okuduğunda “bu çizim neyi temsil ediyor?” sorusunu anlamış olur.

---

## 4. Otomatik dosya isimlendirme

İndirilen dosya isimleri standart olmalı. Önerim:

```text
<siteId>__<featureType>__manual__YYYYMMDD_HHmm.geojson
```

Örnekler:

```text
jica-gokcekaya-pspp__upper_reservoir__manual__20260709_1530.geojson
jica-gokcekaya-pspp__lower_reservoir__manual__20260709_1532.geojson
jica-gokcekaya-pspp__penstock_axis__manual__20260709_1535.geojson
```

Tüm çizimler birlikte indirilecekse:

```text
jica-gokcekaya-pspp__manual_geometry_package__20260709_1540.geojson
```

21 aday toplu dosya için:

```text
pdhes_21_candidates__manual_geometry_package__20260709.geojson
```

---

## 5. 3D çizim nasıl iyileştirilir?

Yeni harita özellikleriyle 3D tarafı şu şekilde iyileştirilebilir:

### Alt rezervuar

Eski yöntem:

```text
mapAnchor çevresine kare/daire çiz
```

Yeni yöntem:

```text
Kullanıcının çizdiği Alt Rezervuar polygonunu doğrudan su yüzeyi olarak kullan
```

3D’de:

* `material: water`
* şeffaf mavi yüzey
* kot değeri DEM’den veya kullanıcı çizimi üzerindeki rakım profilinden alınır
* mevcut baraj gölü ise polygon topografyaya oturtulur
* deniz tipi adaylarda `elevationM = 0`

### Üst rezervuar

Eski yöntem:

```text
üst rezervuarı yaklaşık oval/kare çiz
```

Yeni yöntem:

```text
Kullanıcı uydu/topoğrafya üzerinden üst rezervuar sınırını çizer
```

3D’de iki ayrı polygon üretilmeli:

1. `upperReservoirWater`
2. `upperReservoirEmbankment`

Yani sadece mavi su alanı değil, dış beton/asfalt/dolgu seti de çizilmeli.

### Baraj seti

Kullanıcı **Mevcut Baraj Seti** veya **Üst Rezervuar Seti** olarak çizdiği çizgiyi/polygonu kırmızı gösterir.

3D’de:

* mevcut baraj seti: kırmızı polyline veya düşük extrusion
* üst rezervuar seti: polygon extrusion
* beton set: gri/kırmızı
* kaya dolgu set: kahverengi/gri

### Cebri boru / tünel

Mesafe ölç aracıyla çizilen hat, tür olarak **Cebri Boru / Tünel Ekseni** seçilirse:

* çizgi uzunluğu otomatik hesaplanır
* rakım profili alınır
* üst nokta ile alt nokta arasındaki düşü hesaplanır
* `headM` ile karşılaştırılır
* profil eğimi 3D su yolu olarak kullanılır

Bu, 3D çizimlerin en önemli iyileştirmesi olur. Çünkü artık cebri boru rastgele düz çizgi değil, kullanıcının topoğrafyaya göre çizdiği hat olur.

---

## 6. Rakım profili nasıl kullanılmalı?

Yeni gelen rakım profili özelliği çok değerli. Şu kontroller yapılmalı:

### Cebri boru için

```text
başlangıç kotu - bitiş kotu ≈ headM
```

Örnek:

* Gökçekaya `headM = 379,5 m`
* çizilen hattın üst noktası: 801 m
* güç evi / alt nokta: 421 m
* fark: 380 m

Bu durumda çizim güveni artar.

### Üst rezervuar için

Polygon içindeki DEM örnekleri alınmalı:

* minimum kot
* maksimum kot
* ortalama kot
* eğim
* alan

Eğer üst rezervuar polygonu çok eğimli alana çizilmişse sistem uyarmalı:

```text
Uyarı: Üst rezervuar alanında eğim yüksek. Bu polygon yapay havuz için uygun olmayabilir.
```

### Alt rezervuar için

Mevcut göl polygonunda kot çok değişmemeli. Deniz tipi adaylarda kot 0 m olmalı.

---

## 7. Önerilen veri modeli

Manuel çizimler uygulama ana `data.json` içine doğrudan gömülmemeli. Önce ayrı bir çalışma dosyasında tutulmalı.

Önerilen yapı:

```text
app/public/manual-geometries/
├─ jica-gokcekaya-pspp.geojson
├─ jica-altinkaya-pspp.geojson
├─ jica-sariyar-pspp.geojson
└─ ...
```

Sonra agent bu dosyaları okuyup `data.json` içindeki şu alanlara dönüştürmeli:

```json
{
  "coordinates": {
    "upperReservoirPolygon": [],
    "lowerReservoirPolygon": [],
    "powerhouse": [],
    "switchyard": [],
    "mapAnchor": []
  },
  "model3d": {
    "useFootprintPolygons": true,
    "hideLegacySquareReservoir": true,
    "renderLowerReservoirAsPolygon": true,
    "renderUpperReservoirAsPolygon": true,
    "componentFootprints": []
  }
}
```

Yani manuel GeoJSON → agent → uygulama uyumlu `model3d.componentFootprints`.

---

## 8. Harita arayüzünde önerilen yeni panel

Çizim tamamlandığında küçük bir panel açılmalı:

```text
Çizim Tamamlandı

Aday:
[Gökçekaya PDHES ▼]

Çizim Türü:
[Üst Rezervuar ▼]

Geometri:
Polygon

Ölçümler:
Alan: 0,54 km²
Çevre: 3,1 km
Min kot: 785 m
Max kot: 812 m
Ortalama kot: 798 m

Güven:
[B - Uydu/harita üzerinden manuel]

[Profil Aç] [Kaydet] [GeoJSON İndir] [KML İndir]
```

Bu panel sayesinde kullanıcı sadece çizim yapmaz; çizimi mühendislik verisiyle birlikte kaydeder.

---

## 9. Dünya örnekleri için nasıl kullanılmalı?

Dünya örnekleri için de aynı yöntem kullanılabilir; ancak aktif Türkiye adaylarıyla karıştırılmamalı.

Önerilen ayrım:

```text
manual-geometries/turkey-candidates/
manual-geometries/world-examples/
```

Dünya örneklerinde çizilecek bileşenler:

* mevcut üst rezervuar
* mevcut alt rezervuar
* baraj setleri
* santral binası / güç evi
* tünel veya cebri boru hattı
* şalt sahası

Bu özellikle şu örneklerde çok faydalı olur:

* Presenzano
* Bath County
* Dinorwig
* Fengning
* Okinawa Yanbaru
* La Muela
* Goldisthal

Bu örneklerde gerçek tesisler mevcut olduğu için, uydu üzerinden çizilen polygonlar Türkiye adaylarına referans kalite standardı oluşturur.

---

## 10. En verimli entegrasyon yöntemi

Bence en iyi sistem şu dört aşamalı sistemdir:

### Aşama 1 — Haritada manuel çizim

Kullanıcı:

* alt rezervuarı çizer
* üst rezervuarı çizer
* baraj setini çizer
* cebri boru/tünel hattını çizer
* güç evi ve şalt sahasını çizer

Her çizim tür seçilerek GeoJSON’a kaydedilir.

### Aşama 2 — Otomatik ölçüm ve profil

Uygulama her çizim için otomatik hesaplar:

* uzunluk
* alan
* çevre
* min/max/ortalama kot
* eğim
* düşü farkı
* adayın `headM` değeriyle uyum
* su yolu uzunluğu ile uyum

### Aşama 3 — Agent dönüştürmesi

Agent, manuel GeoJSON’u alır ve şuna dönüştürür:

```text
data.json → coordinates + model3d.componentFootprints
```

Agent ayrıca:

* eski kare/daire rezervuarları kaldırır
* polygonları sadeleştirir
* hatları isimlendirir
* eksik bileşenleri uyarı olarak raporlar
* güven sınıfı ekler

### Aşama 4 — 3D render

3D tarafı artık şunu yapar:

* `componentFootprints` polygonlarını doğrudan çizer
* DEM kotlarını kullanır
* su yüzeyini sabit kotta gösterir
* setleri extrusion ile yükseltir
* cebri boruyu polyline üzerinden 3D boru olarak çizer
* güç evi ve şalt sahasını gerçek polygon footprint üzerinden gösterir

---

## 11. Agent’a verilecek öneri/prompt

Aşağıdaki metni doğrudan geliştirme agent’ına verebilirsin:

```text
Harita arayüzündeki sağ tık menüsü, Mesafe Ölç aracı ve Rakım Profili özelliğini PDHES manuel geometri üretim sistemine dönüştür.

İstenen geliştirme:

1. Mesafe Ölç aracıyla çizim tamamlandığında Profil butonunun yanına bir dropdown ekle.
2. Dropdown seçenekleri:
   - Mesafe
   - Mevcut Baraj Seti
   - Alt Rezervuar
   - Deniz Sınırı
   - Üst Rezervuar
   - Üst Rezervuar Set/Dolgu
   - Güç Evi
   - Mevcut Şalt Sahası
   - Yeni Şalt Sahası
   - Cebri Boru / Tünel Ekseni
   - Su Alma Yapısı
   - Kuyruk Suyu Çıkışı
   - Denge Bacası
   - Servis / Drenaj Tüneli Portalı

3. Her seçim için uygun geometri tipini belirle:
   - Mesafe, baraj seti, deniz sınırı, cebri boru/tünel: LineString veya MultiLineString
   - Alt rezervuar, üst rezervuar, şalt sahası, güç evi, intake/outfall: Polygon
   - Denge bacası: Point veya küçük Polygon

4. Kullanıcı çizimi kaydettiğinde çizim şu özellikleri içeren GeoJSON Feature olarak saklansın:
   - siteId
   - siteName
   - featureType
   - displayName
   - geometryType
   - material
   - role
   - source: manual_map_drawing
   - confidence
   - lengthM
   - areaM2
   - perimeterM
   - minElevationM
   - maxElevationM
   - meanElevationM
   - slopePercent
   - headCompatibilityWarning
   - createdAt
   - notes

5. Ölçüm ve analiz:
   - Çizgi uzunluğu için turf length kullan.
   - Polygon alanı için turf area kullan.
   - Rakım için MapLibre queryTerrainElevation kullan.
   - Çizgi boyunca örnekleme yaparak elevation profile üret.
   - Üst rezervuar - alt rezervuar kot farkını adayın headM değeriyle karşılaştır.
   - Su yolu uzunluğunu adayın waterwayM değeriyle karşılaştır.

6. İndirme özellikleri:
   - Seçili çizimi GeoJSON indir.
   - Seçili adayın tüm manuel çizimlerini GeoJSON indir.
   - Tüm adayların manuel çizimlerini tek GeoJSON indir.
   - KML çıktısı üretilebiliyorsa KML/KMZ indir.
   - Dosya adlarını otomatik üret:
     <siteId>__<featureType>__manual__YYYYMMDD_HHmm.geojson

7. Manuel çizimler localStorage veya IndexedDB içinde saklanabilsin.
8. Dev Mode açıksa manuel çizimlerin raw GeoJSON içeriği görüntülenebilsin.
9. Bu manuel çizimler doğrudan data.json’u bozmasın. Önce ayrı `manual-geometries` formatında tutulsun.
10. Sonraki aşamada bu manual GeoJSON verisini `model3d.componentFootprints` formatına çevirecek yardımcı fonksiyon hazırla:
    manualGeoJsonToComponentFootprints()

11. 3D tarafında:
    - hideLegacySquareReservoir: true
    - renderLowerReservoirAsPolygon: true
    - renderUpperReservoirAsPolygon: true
    - useFootprintPolygons: true
    olacak şekilde manuel polygonlar kullanılsın.
    Kare/daire placeholder rezervuarlar, manuel polygon varsa çizilmesin.

12. UI kabul kriteri:
    - Ölçüm bitince Profil butonu yanında Tür Seç dropdown’u görünmeli.
    - Kullanıcı tür seçmeden kaydedememeli.
    - Polygon gerektiren türlerde açık polyline varsa “Alanı kapat” uyarısı çıkmalı.
    - Çizim kaydedildikten sonra haritada renk ve etiket değişmeli.
    - GeoJSON indirilen dosya QGIS/geojson.io/Google Earth dönüştürme araçlarında açılabilir olmalı.

Amaç:
Harita arayüzünü PDHES adayları ve dünya örnekleri için gerçekçi 3D tesis yerleşimi üretmeye yarayan manuel GIS çizim aracına dönüştürmek.
```

---

## 12. Son önerim

Bu geliştirmeyi tek seferde çok büyütmemek lazım. En doğru sıra:

1. **Sadece Gökçekaya için manuel çizim → GeoJSON indir**
2. Agent’a verip `model3d.componentFootprints` ürettir
3. 3D sayfada Gökçekaya doğru görünürse
4. Altınkaya eklenir
5. Sonra tüm 21 aday ve dünya örnekleri için aynı sistem kullanılır

Böyle yapılırsa harita arayüzü sadece görsel bir ekran değil, doğrudan **3D PDHES modelleme veri üretim aracı** haline gelir.
