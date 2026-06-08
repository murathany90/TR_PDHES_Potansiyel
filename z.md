Ekran görüntülerine göre tasarım genel olarak temiz ve profesyonel başlamış; ama şu an biraz **“teknik demo / dashboard prototipi”** gibi duruyor. LinkedIn’de paylaşılacak ve GitHub Pages’te gezilecek bir site için tasarımı daha **ürün, yatırım istihbaratı ve enerji dashboard’u** hissine yaklaştırabilirsin.

Proje zaten Vite + React + TypeScript’e taşınmış; 7 sekmeli yapı, harita, veri tablosu, 3D yerleşim, hesaplama ve yönetim alanları var.  Bu yüzden iyileştirme tarafında öncelik artık yeni özellik değil, **bilgi mimarisi + görsel hiyerarşi + harita deneyimi** olmalı.

## 1. En büyük sorun: sayfa çok “boş ve soluk” görünüyor

Ekranlarda açık gri/yeşil palet güzel ama her şey aynı yumuşaklıkta olduğu için önemli alanlar yeterince öne çıkmıyor. Özellikle Datalar, Hesaplamalar ve Ayarlar sayfalarında kartlar çok açık tonda; başlık, metrik ve aksiyonların kontrastı zayıf kalıyor.

Yapılacaklar:

```text
- Arka planı tek renk yerine hafif radial/gradient yap.
- Ana kartlara daha net gölge ve sınır ver.
- Birincil metrikleri daha büyük ve koyu göster.
- Uyarı, risk, yatırım, kapasite, skor renklerini birbirinden ayır.
- Yeşili sadece “pozitif / aktif / seçili” anlamında kullan.
```

Şu an neredeyse tüm olumlu, seçili ve bilgi alanları yeşil tonlarında. Bunun yerine:

```text
Kapasite / enerji: yeşil
Yatırım / CAPEX: amber / altın
Risk: kırmızı / turuncu
Şebeke bağlantısı: mavi
Belirsizlik / düşük güven: gri
Deniz suyu konsepti: cyan
Müstakil PDHES: yeşil
Yarı PDHES: mavi
Mikro pilot: mor
```

## 2. Ana sayfa gibi çalışan güçlü bir “Özet / Giriş” ekranı ekle

Şu an ilk sekme “PDHES Nedir” gibi duruyor. Bu teknik olarak iyi ama kullanıcı ilk açtığında daha çarpıcı bir karşılama görebilir.

Yeni bir ilk bölüm önerim:

```text
Türkiye PDHES Potansiyeli
Uzun süreli enerji depolama, şebeke esnekliği ve yenilenebilir entegrasyonu için etkileşimli ön-inceleme aracı.

[Haritada İncele] [Adayları Karşılaştır] [PDHES Nedir?]

19 aday saha
1.400 MW en büyük aday
9.8 GWh örnek enerji kapasitesi
154/380 kV şebeke katmanları
Kavramsal 3D yerleşim
```

Bu alan LinkedIn’den gelen kişiye ilk 5 saniyede “bu ne?” sorusunun cevabını verir.

## 3. Harita ekranını tam dashboard gibi yap

Harita ekranı görsel olarak en güçlü bölümün. Ancak ekran görüntüsünde harita üstte kalıyor, altta büyük boşluk oluşuyor. Bu, kullanıcıya “sayfa eksik yüklenmiş” hissi verebilir.

Harita sayfasında hedef şu olmalı:

```text
Sol: aday listesi
Orta: tam yükseklik harita
Sağ: seçili saha özeti + katmanlar + riskler
Alt: gerekirse mini zaman çizelgesi / hesap özeti
```

Harita alanı için:

```css
.map-page {
  height: calc(100vh - 112px);
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 320px;
  gap: 16px;
}

.map-container {
  height: 100%;
  min-height: 680px;
  border-radius: 24px;
  overflow: hidden;
}
```

Mobilde ise:

```text
Üstte harita
Altında seçili saha kartı
Aday listesi drawer/bottom sheet olarak açılsın
Katmanlar floating button ile açılsın
```

## 4. Datalar sekmesini “Excel tablo”dan “karşılaştırma aracı”na çevir

Datalar ekranındaki tablo faydalı ama çok yoğun. Bunu daha karar destek ekranı gibi yapabilirsin.

Öneriler:

```text
- Tablo üstüne filtre barı ekle:
  Tip, kapasite, skor, deniz/kara, şebeke mesafesi, risk seviyesi.

- Tablo satırlarını tıklanabilir kart hissine getir.
- Skor kolonunu sadece bar değil, renkli kalite etiketiyle göster:
  80+ Güçlü Aday
  60-79 İncelenmeli
  <60 Düşük Öncelik / Pilot

- Sağdaki “Seçili saha veri kartı” daha zengin olsun:
  Haritada aç
  3D yerleşimi gör
  Senaryo hesapla
  Veri güven notu
```

Şu an seçili saha kartı iyi düşünülmüş ama biraz pasif duruyor. Kartın altına 3 ana aksiyon ekle:

```text
[Haritada Aç] [3D Yerleşim] [Hesapla]
```

## 5. 3D Yerleşim sekmesi şu an fazla statik

3D Yerleşim ekranında bileşen listesi düzenli ama “3D” beklentisini tam karşılamıyor. Haritada zaten 3D görsel var; bu sekmede de solda bileşen listesi, sağda küçük teknik özet yerine daha görsel bir “tesis şeması” koyabilirsin.

Öneri:

```text
Üst Rezervuar → Cebri Boru → Güç Evi → Alt Rezervuar
                         ↓
                    Şalt Sahası → İletim Hattı
```

Bunu SVG veya basit React component ile yap. Her bileşen tıklanınca sağ panelde teknik detay değişsin.

Ek görsel fikir:

```text
- Üst rezervuar kartı: mavi alan ikonu
- Penstock: eğimli çizgi
- Powerhouse: yeraltı blok ikonu
- Surge tank: dikey silindir
- Switchyard: trafo/şalt ikonu
- Grid connection: iletim hattı ikonu
```

Bu sekmenin adı da daha açıklayıcı olabilir:

```text
3D Yerleşim → Kavramsal Tesis Yerleşimi
```

## 6. Hesaplamalar ekranını daha “finansal simülatör” gibi yap

Hesaplamalar sekmesi şu an iyi çalışıyor gibi görünüyor. Ama görsel hiyerarşiyi güçlendirmek için üstteki 4 metriği daha belirgin yap:

```text
Fiziksel enerji
9.49 GWh

Senaryo yatırım gideri
€2.59 bn

Brüt yıllık gelir
€297 m/yıl

Basit geri ödeme
8.7 yıl
```

Burada özellikle geri ödeme süresine renk mantığı eklenebilir:

```text
0-8 yıl: yeşil
8-12 yıl: sarı
12+ yıl: kırmızı/turuncu
```

Sağdaki skor/risk kırılımı güzel. Onu daha profesyonel göstermek için her barın yanına küçük açıklama ekle:

```text
Topografya / düşü: yüksek düşü avantajı
Şebeke bağlantısı: yakın trafo/hat avantajı
Çevre / izin: izin belirsizliği
Jeoloji / deprem: ön etüt gerektirir
```

## 7. PDHES Nedir sayfası çok uzun; içerik iyi ama okunabilirlik düşebilir

Bu sayfa içerik olarak güçlü: çalışma prensibi, Türkiye bağlamı, tipler, dünya örnekleri, sözlük ve SSS var. README’de de bu bölümün 30+ dünya örneği, 40+ teknik terim ve sık sorular içerdiği belirtilmiş. 

Ama ekran görüntüsünde uzun bir akademik sayfa gibi akıyor. Bunu daha modern hale getirmek için:

```text
- Sayfa içine sticky mini menü ekle:
  Tanım
  Türkiye
  Tipler
  Dünya örnekleri
  Şebeke hizmetleri
  Riskler
  Sözlük
  SSS

- Dünya örnekleri kartlarını filtrelenebilir yap:
  Deniz suyu
  Kapalı çevrim
  Büyük ölçekli
  Avrupa
  Asya
  Amerika

- Sözlüğü accordion yap.
- Çok uzun tabloyu arama + kategori filtresiyle sun.
```

## 8. Header çok teknik, biraz sadeleşmeli

Üst bar şu an işlevsel ama biraz kalabalık. Şu yapıyı öneririm:

```text
Sol:
Logo + Türkiye PDHES Potansiyeli

Orta:
PDHES Nedir | Datalar | Harita | 3D | Hesaplamalar

Sağ:
Saha seçici | Haritada İncele | Veri indir | Tema
```

“Yönetim” ve “Ayarlar” public sürümde daha az görünür olmalı. Hatta GitHub Pages public paylaşımında:

```text
Yönetim → sadece admin/dev modda görünsün
Ayarlar → sağ üstte küçük ikon olarak kalsın
```

Çünkü LinkedIn’den gelen kullanıcı için “Yönetim” sekmesi ürünü biraz demo/admin panel gibi gösterir.

## 9. Public demo için “Yönetim” sekmesini gizle veya kilitle

README’de yönetim sekmesinde içerik düzenleme, yeni aday ekleme, saha silme, veri yedeği alma/yükleme ve 3D yerleşim düzenleme olduğu belirtilmiş.  Bu harika bir geliştirme özelliği ama public sunumda dikkatli olmalı.

Önerim:

```text
- Public mod: Yönetim sekmesi gizli.
- Dev mod: URL parametresiyle açılır.
  ?admin=1
- Demo admin şifresi README’den veya public ekrandan kaldırılır.
- LocalStorage değişiklikleri “Bu sadece tarayıcı demosudur” uyarısıyla gösterilir.
```

## 10. Tasarım sistemi kur: tek tek ekran düzeltme yerine ortak component mantığı

Antigravity agent’a şu component setini yaptır:

```text
AppShell
TopNav
PageHeader
MetricCard
InsightCard
RiskBadge
ScorePill
SiteSelector
LayerToggle
ScenarioSlider
DataTable
EmptyState
WarningBanner
SectionNav
InfoAccordion
```

Böylece her sekme aynı görsel dille konuşur.

## Antigravity Agent’a verebileceğin iyileştirme talimatı

Aşağıdaki metni doğrudan agent’a verebilirsin:

```text
Mevcut Vite + React + TypeScript PDHES uygulamasının tasarımını daha profesyonel, GitHub Pages’te yayınlanabilir ve LinkedIn’den gelen kullanıcılar için anlaşılır hale getir.

Öncelikler:

1. Genel görsel sistem
- Açık tema korunacak ama daha güçlü kontrast, daha belirgin kart gölgeleri ve net metrik hiyerarşisi eklenecek.
- CSS custom properties ile renk sistemi oluştur:
  --color-primary, --color-capacity, --color-grid, --color-risk, --color-warning, --color-sea, --color-muted, --surface-card, --surface-page.
- Yeşil sadece aktif/seçili/pozitif anlamlarda kullanılacak.
- CAPEX/yatırım için amber, risk için kırmızı/turuncu, şebeke için mavi, deniz konsepti için cyan kullanılacak.

2. Ana giriş / özet bölümü
- PDHES Nedir sekmesinin en üstüne güçlü bir hero alanı ekle.
- Hero içinde başlık, kısa açıklama, 3 ana CTA ve 5 özet metrik olsun:
  19 aday saha, en yüksek MW, en yüksek GWh, şebeke katmanları, kavramsal 3D yerleşim.
- CTA butonları:
  Haritada İncele
  Adayları Karşılaştır
  PDHES Nedir?

3. Harita ekranı
- Harita sayfasını tam dashboard yap:
  sol aday listesi, orta tam yükseklik harita, sağ yatırım/kapasite özeti.
- Harita container yüksekliği calc(100vh - header height) mantığıyla çalışsın.
- Altta gereksiz büyük boşluk kalmasın.
- Sol ve sağ paneller desktopta sabit, mobilde drawer/bottom sheet olarak açılsın.
- Katman kontrolleri daha kompakt ve ikonlu olsun.

4. Datalar sekmesi
- Tablo üstüne filtre barı ekle:
  PDHES tipi, kapasite sınıfı, skor aralığı, deniz/kara, risk seviyesi.
- Skor görselini renkli kalite etiketiyle destekle:
  80+ Güçlü Aday
  60-79 İncelenmeli
  <60 Düşük Öncelik / Pilot
- Seçili saha kartına 3 aksiyon ekle:
  Haritada Aç
  3D Yerleşim
  Hesapla

5. 3D Yerleşim sekmesi
- Mevcut bileşen listesini daha görsel hale getir.
- Üst rezervuar, penstock, powerhouse, surge tank, switchyard ve iletim hattını gösteren basit SVG/diagram component ekle.
- Bileşen tıklanınca sağdaki detay paneli güncellensin.
- Sekme adı mümkünse “Kavramsal Tesis Yerleşimi” olarak güncellensin.

6. Hesaplamalar sekmesi
- Üst metrik kartlarını daha büyük ve belirgin yap.
- Geri ödeme süresine renk sınıflandırması ekle:
  0-8 yıl iyi, 8-12 yıl orta, 12+ yıl riskli.
- Sağdaki skor/risk kırılımına kısa açıklamalar ekle.
- Slider alanlarında değer kutuları daha okunur olsun.

7. PDHES Nedir içeriği
- Sticky section nav ekle:
  Tanım, Türkiye, Tipler, Dünya örnekleri, Şebeke hizmetleri, Riskler, Sözlük, SSS.
- Dünya örnekleri kartlarını filtrelenebilir hale getir.
- Teknik terimler sözlüğünü arama + accordion yapısına çevir.
- Çok uzun sayfada okunabilirliği artırmak için max-width, bölüm boşlukları ve başlık hiyerarşisini iyileştir.

8. Public demo modu
- Yönetim sekmesi public modda gizlenebilir veya dev/admin moduna alınabilir.
- Demo admin şifresi public header veya README görünür alanında öne çıkarılmamalı.
- Yönetim işlemleri localStorage tabanlıysa “Bu değişiklik yalnızca tarayıcınızda saklanır” uyarısı göster.

9. Responsive
- 1440px desktop, 1024px tablet ve 390px mobil için layout test et.
- Mobilde üst nav yatay scroll yerine hamburger veya bottom nav olarak çalışsın.
- Tablo mobilde kart listesine dönüşsün.

10. Kod kalitesi
- Ortak componentler oluştur:
  AppShell, TopNav, PageHeader, MetricCard, InsightCard, RiskBadge, ScorePill, SiteSelector, LayerToggle, ScenarioSlider, SectionNav, InfoAccordion.
- Tasarım tokenlarını tek CSS dosyasında topla.
- Var olan veri ve hesaplama mantığını bozma.
- Uygulama npm run build ile hatasız derlenmeli.
```

## Öncelik sırası

Ben olsam agent’a tek seferde her şeyi yaptırmak yerine 4 faz verirdim:

```text
Faz 1: Görsel sistem + header + kartlar
Faz 2: Harita ekranı tam yükseklik dashboard
Faz 3: Datalar + Hesaplamalar ekranı iyileştirme
Faz 4: PDHES Nedir + 3D Yerleşim görsel anlatım
```

En hızlı etkiyi **Harita ekranındaki boşluğu kaldırmak, hero/özet alanı eklemek ve kart kontrastlarını güçlendirmek** verir. Bu üçü yapıldığında uygulama prototip görünümünden çıkıp daha ciddi bir enerji istihbaratı dashboard’u gibi görünür.
