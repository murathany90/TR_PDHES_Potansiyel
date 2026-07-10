Aşağıda **Altınkaya PDHES** için uygulamaya eklenecek **17. aday** adına, mevcut şemaya uyumlu ve **3D çizim / harita / veri kartı / aday listesi** kullanımına uygun, ayrıntılı bir JSON nesnesi veriyorum.

Bu sürümde:

* **17. aday** olarak eklendi.
* **JICA/EİE** kaynak grubu olarak işaretlendi.
* **1.800 MW / 12.600 MWh / 7 saat** yaklaşımı işlendi.
* **GÖKAY varsayımsal yıllık brüt gelir** eklendi.
* **JICA kavramsal tasarım bilgileri** işlendi.
* **Altınkaya ön etüt çizim mantığına uygun yaklaşık bileşen koordinatları** verildi.
* **Üst rezervuar için polygon footprint** tanımlandı.
* **Headrace / penstock / powerhouse / tailrace / switchyard / 3D footprint** alanları detaylandırıldı.
* Koordinatlar ve çizim geometrisi **ön etüt görsellerine göre yaklaşık** hazırlanmıştır; nihai mühendislik koordinatı değildir.

---

## Altınkaya PDHES – tam JSON

```json
{
  "id": "altinkaya",
  "rank": 17,
  "name": "Altınkaya PDHES",
  "shortName": "Altınkaya PSPP",
  "concept": "classic",
  "conceptLabel": "JICA öncelikli açık döngü / mevcut rezervuar entegre",
  "sourceGroup": "JICA/EIE",
  "lat": 41.3562,
  "lon": 35.7138,
  "region": "Kızılırmak Havzası - Altınkaya Barajı, Samsun",
  "province": "Samsun",
  "district": "Bafra / Vezirköprü yakını",
  "country": "Türkiye",
  "score": 93,
  "priorityClass": "top_5",
  "priorityNote": "JICA kavramsal tasarımı yapılmış öncelikli 5 adaydan biri; B/C oranı en yüksek proje (1.87).",
  "head": 611,
  "effectiveHeadM": 611,
  "designDischargeM3s": 350,
  "tunnelKm": 4.555,
  "headraceTunnelKm": 2.082,
  "penstockKm": 0.87,
  "tailraceTunnelKm": 1.603,
  "activeMcm": 8.9,
  "powerMW": 1800,
  "energyGWh": 12.6,
  "dailyPeakHours": 7,
  "gokayOperatingHours": 7.59,
  "gokayGrossMarginUsdPerMWh": 18.49,
  "annualGrossProfitMUsd": 92.2,
  "capexBn": 1.301,
  "capexPlantOnlyBn": 1.201,
  "capexWithTransmissionBn": 1.301,
  "capexCurrency": "USD",
  "revenueM": 92.2,
  "payback": 14.1,
  "gridDistKm": 1.2,
  "lower": "Altınkaya Barajı Gölü / mevcut Altınkaya HES",
  "upper": "79 m beton ağırlıklı baraj ile oluşturulan yapay üst rezervuar",
  "thesis": "JICA ve Mülga EİE tarafından kavramsal tasarımı yapılmış, mevcut rezervuara entegre, yeraltı santralli ve ekonomik olarak en güçlü PDHES adaylarından biridir.",
  "risks": [
    "Ayrıntılı jeoloji ve yeraltı kazı koşulları",
    "Uzun yeraltı su yolu ve şaft/penstock yapım zorluğu",
    "DSİ işletme rejimi ve mevcut baraj işletmesiyle koordinasyon",
    "ÇED ve sosyal/çevresel etki yönetimi",
    "TEİAŞ sistem etüdü, kısa devre gücü ve N-1 uyumluluğu"
  ],
  "scores": {
    "topo": 92,
    "grid": 90,
    "env": 73,
    "geology": 84,
    "access": 79,
    "market": 94
  },
  "view": {
    "center": [
      35.7138,
      41.3562
    ],
    "zoom": 11.6,
    "pitch": 58,
    "bearing": 48
  },
  "color": "#2563eb",
  "layout": {
    "bearing": 48,
    "upper": [
      35.6989,
      41.3495
    ],
    "upperPolygon": [
      [
        35.6938,
        41.3512
      ],
      [
        35.6950,
        41.3520
      ],
      [
        35.6972,
        41.3526
      ],
      [
        35.7002,
        41.3526
      ],
      [
        35.7028,
        41.3518
      ],
      [
        35.7040,
        41.3505
      ],
      [
        35.7042,
        41.3489
      ],
      [
        35.7033,
        41.3476
      ],
      [
        35.7013,
        41.3468
      ],
      [
        35.6983,
        41.3466
      ],
      [
        35.6959,
        41.3469
      ],
      [
        35.6942,
        41.3478
      ],
      [
        35.6934,
        41.3492
      ],
      [
        35.6935,
        41.3504
      ],
      [
        35.6938,
        41.3512
      ]
    ],
    "lower": [
      35.7246,
      41.3668
    ],
    "power": [
      35.7099,
      41.3549
    ],
    "surge": [
      35.7048,
      41.3586
    ],
    "tailraceSurge": [
      35.7146,
      41.3569
    ],
    "servicePortal": [
      35.7076,
      41.3558
    ],
    "switchyard": [
      35.7162,
      41.3557
    ],
    "gridA": [
      35.7162,
      41.3557
    ],
    "gridB": [
      35.7248,
      41.3662
    ],
    "risk": [
      35.7138,
      41.3562
    ],
    "gridTap": [
      35.7162,
      41.3557
    ]
  },
  "timeline": [
    {
      "date": "2011",
      "title": "JICA kavramsal tasarım",
      "text": "Altınkaya PDHES için 1.800 MW ölçekli kavramsal tasarım, su yolu kesitleri ve maliyet ön tahmini hazırlanmıştır."
    },
    {
      "date": "2026 Q1",
      "title": "Masaüstü yeniden doğrulama",
      "text": "Genel yerleşim, üst rezervuar konumu, yeraltı güç evi, şalt sahası ve su yolları güncellenir."
    },
    {
      "date": "2026 Q2",
      "title": "TEİAŞ + DSİ ön görüş paketi",
      "text": "Bağlantı gerilimi, mevcut HES şalt kullanımı, işletme rejimi ve iletim gereksinimleri için ön etüt paketi hazırlanır."
    },
    {
      "date": "2026 Q4",
      "title": "Ön fizibilite kapısı",
      "text": "Jeoloji, tünel kazısı, CAPEX P50/P90, çevresel etkiler ve finansman modeli olgunlaştırılır."
    }
  ],
  "nearest380Km": 1.2,
  "nearest154Km": 3.4,
  "nearestSubstation": {
    "name": "Altınkaya HES Mevcut Şalt Sahası",
    "voltage_kv": 380,
    "coord": [
      35.7162,
      41.3557
    ],
    "distance_km": 1.2
  },
  "nMinusOneNote": "Mevcut Altınkaya HES ve mevcut şalt varlığı bağlantı avantajı sağlar; ancak kesin 380 kV bağlantı, kısa devre gücü ve N-1 uygunluğu için TEİAŞ sistem etüdü gereklidir.",
  "gridConnection": {
    "preferredVoltageKv": 380,
    "preferredLineName": "Mevcut Altınkaya HES 380 kV şalt sahası üzerinden bağlantı (ön kabul)",
    "preferredLineDistanceKm": 1.2,
    "tapCoord": [
      35.7162,
      41.3557
    ],
    "lineSegment": [
      [
        35.7162,
        41.3557
      ],
      [
        35.7248,
        41.3662
      ]
    ],
    "nearest380": {
      "lineName": "Altınkaya HES mevcut 380 kV bağlantı koridoru (ön kabul)",
      "distanceKm": 1.2,
      "tapCoord": [
        35.7162,
        41.3557
      ]
    },
    "nearest154": {
      "lineName": "Bölgesel 154 kV bağlantı alternatifi (yaklaşık)",
      "distanceKm": 3.4,
      "tapCoord": [
        35.7214,
        41.3598
      ]
    }
  },
  "components_detail": {
    "upper_reservoir": {
      "elevation_m": 782,
      "active_volume_mcm": 8.9,
      "dam_height_m": 79,
      "lining": "beton ağırlıklı baraj ile oluşturulan yapay rezervuar",
      "reservoir_type": "new_concrete_gravity_dam_reservoir",
      "geology_note": "JICA kavramsal tasarımında yapay üst rezervuar öngörülmüştür.",
      "shape_note": "Genel yerleşim planına uygun olarak çokgen/oval footprint ile çizilmelidir.",
      "render_mode": "polygon_footprint"
    },
    "lower_reservoir": {
      "name": "Altınkaya Barajı Gölü",
      "type": "existing_dam_reservoir",
      "note": "Mevcut Altınkaya Barajı alt rezervuar olarak kullanılacaktır; işletme rejimi DSİ ile doğrulanmalıdır."
    },
    "headrace_tunnel": {
      "length_m": 2082,
      "count": 1,
      "material": "beton kaplı basınçsız/basınçlı iletim tüneli",
      "section_note": "JICA su yolu kesit paftasına göre büyük kesitli ana iletim tüneli."
    },
    "penstock": {
      "length_m": 870,
      "material": "çelik kaplı eğimli cebri boru / penstock",
      "pressure_class": "yüksek basınçlı",
      "count": 2,
      "section_note": "JICA paftasında iki branşmanlı eğimli şaft/penstock sistemi gösterilmiştir."
    },
    "powerhouse": {
      "type": "underground_powerhouse",
      "units": 4,
      "unitPowerMW": 450,
      "turbine_type": "single-stage Francis pump-turbine",
      "generator_type": "motor-generator",
      "transformer_note": "Yeraltı ana trafo düzeni JICA kesit paftasında gösterilmiştir.",
      "station_length_note": "Kavramsal kesitte toplam yeraltı santral uzunluğu yaklaşık 213 m mertebesindedir."
    },
    "surge_tank": {
      "type": "headrace surge tank",
      "note": "İletim tüneli ile penstock arasında ana denge bacası."
    },
    "tailrace_surge_tank": {
      "type": "tailrace surge tank",
      "note": "Kuyruk suyu tüneli tarafında ikinci denge yapısı."
    },
    "tailrace_tunnel": {
      "length_m": 1603,
      "count": 1,
      "material": "beton kaplı kuyruk suyu tüneli",
      "note": "JICA su yolu kesit paftasında tailrace room/tunnel düzeni gösterilmiştir."
    },
    "switchyard": {
      "voltage_kv": 380,
      "transformer_count": 2,
      "connection_line_km": 1.2,
      "note": "Mevcut HES şalt düzeniyle entegre veya yakın konumlu yeni şalt alternatifidir."
    },
    "tunnel": {
      "length_m": 4555,
      "excavation_type": "drill-and-blast ağırlıklı, gerektiğinde TBM/hibrid yaklaşım",
      "note": "Toplam su yolu uzunluğu: headrace + penstock + tailrace yaklaşık 4.555 km."
    },
    "intake_outfall": {
      "intake_type": "upper reservoir intake structure",
      "outfall_type": "tailrace outlet to Altınkaya reservoir"
    }
  },
  "pdhesType": "OPEN_LOOP",
  "technicalClassification": {
    "cycleType": "OPEN_LOOP",
    "infrastructureType": "EXISTING_RESERVOIR_INTEGRATED",
    "conceptType": "CONVENTIONAL_LAND",
    "gridSupplyType": "GRID_SUPPORTED",
    "primaryPurpose": "PEAK_POWER",
    "legacyType": null,
    "classificationNote": "Mevcut Altınkaya Barajı alt rezervuar olarak kullanılır; üst rezervuar yeni yapay havuzdur. Yeraltı santralli klasik kara tipi açık döngü PDHES’tir."
  },
  "locationConfidence": "medium",
  "isApproximate": true,
  "confidence": "reference_based",
  "technologyReadiness": "pre_feasibility",
  "coordinates": {
    "mapAnchor": [
      35.7138,
      41.3562
    ],
    "lowerReservoir": [
      35.7246,
      41.3668
    ],
    "upperReservoir": [
      35.6989,
      41.3495
    ],
    "upperReservoirPolygon": [
      [
        35.6938,
        41.3512
      ],
      [
        35.6950,
        41.3520
      ],
      [
        35.6972,
        41.3526
      ],
      [
        35.7002,
        41.3526
      ],
      [
        35.7028,
        41.3518
      ],
      [
        35.7040,
        41.3505
      ],
      [
        35.7042,
        41.3489
      ],
      [
        35.7033,
        41.3476
      ],
      [
        35.7013,
        41.3468
      ],
      [
        35.6983,
        41.3466
      ],
      [
        35.6959,
        41.3469
      ],
      [
        35.6942,
        41.3478
      ],
      [
        35.6934,
        41.3492
      ],
      [
        35.6935,
        41.3504
      ],
      [
        35.6938,
        41.3512
      ]
    ],
    "powerhouse": [
      35.7099,
      41.3549
    ],
    "surgeTank": [
      35.7048,
      41.3586
    ],
    "tailraceSurgeTank": [
      35.7146,
      41.3569
    ],
    "servicePortal": [
      35.7076,
      41.3558
    ],
    "switchyard": [
      35.7162,
      41.3557
    ],
    "gridConnection": [
      35.7162,
      41.3557
    ],
    "intakeOutfall": [
      35.7218,
      41.3622
    ],
    "bbox": [
      [
        35.689,
        41.344
      ],
      [
        35.729,
        41.369
      ]
    ]
  },
  "evidence": [
    "jicaAltinkaya",
    "jicaStudy",
    "generalLayoutDrawing",
    "waterwayLongitudinalSection",
    "existingAltinkayaDam"
  ],
  "note": "Altınkaya PDHES, JICA ve Mülga EİE’nin kavramsal tasarım çalışmalarına dayalı olarak 17. aday şeklinde eklenmiştir. Koordinatlar ve 3D bileşen konumları ekteki general layout ve waterway longitudinal section paftalarından türetilmiş yaklaşık yerleşimdir.",
  "capacityClass": "macro",
  "lowerReservoirType": "existing_dam",
  "upperReservoirType": "new_lined_reservoir",
  "oldCoordinates": null,
  "verifiedAt": "2026-07-08",
  "verificationNotes": "Altınkaya Barajı ana konumu kamuya açık harita verilerinden, üst rezervuar ve yeraltı santral yerleşimi ise JICA general layout ve su yolu kesit paftasına göre yaklaşık olarak yerleştirilmiştir. Nihai mühendislik koordinatı değildir.",
  "locationEvidence": [
    {
      "field": "mapAnchor",
      "sourceName": "Altınkaya Dam public map location + JICA conceptual study",
      "sourceType": "mixed",
      "sourceUrl": "local-reference",
      "method": "dam/reservoir lookup + layout interpretation",
      "confidence": "medium",
      "note": "Mevcut Altınkaya Barajı referans alınmıştır."
    },
    {
      "field": "upperReservoir",
      "sourceName": "JICA Altınkaya PSPP general layout",
      "sourceType": "report_drawing",
      "sourceUrl": "local-reference",
      "method": "layout interpretation",
      "confidence": "medium",
      "note": "Üst rezervuar general layout paftasına göre yaklaşık poligon olarak üretilmiştir."
    },
    {
      "field": "powerhouse",
      "sourceName": "JICA Altınkaya PSPP waterway longitudinal section",
      "sourceType": "report_drawing",
      "sourceUrl": "local-reference",
      "method": "section/layout interpretation",
      "confidence": "medium",
      "note": "Yeraltı güç evi ve su yolu elemanları kesit paftasına göre yaklaşık konumlandırılmıştır."
    }
  ],
  "layout3D": {
    "scale": "macro",
    "preferredBearing": 48,
    "terrainExaggeration": 1.32,
    "reservoirSurfaceMode": "polygon",
    "useFootprintPolygons": true,
    "hideLegacySquareReservoir": true,
    "componentFootprints": [
      {
        "id": "upperReservoirWater",
        "component": "upper_reservoir",
        "kind": "polygon",
        "material": "water",
        "closed": true,
        "coords": [
          [
            35.6938,
            41.3512
          ],
          [
            35.6950,
            41.3520
          ],
          [
            35.6972,
            41.3526
          ],
          [
            35.7002,
            41.3526
          ],
          [
            35.7028,
            41.3518
          ],
          [
            35.7040,
            41.3505
          ],
          [
            35.7042,
            41.3489
          ],
          [
            35.7033,
            41.3476
          ],
          [
            35.7013,
            41.3468
          ],
          [
            35.6983,
            41.3466
          ],
          [
            35.6959,
            41.3469
          ],
          [
            35.6942,
            41.3478
          ],
          [
            35.6934,
            41.3492
          ],
          [
            35.6935,
            41.3504
          ],
          [
            35.6938,
            41.3512
          ]
        ],
        "baseElevationM": 782,
        "topElevationM": 782,
        "extrudeM": 0
      },
      {
        "id": "upperReservoirDamEmbankment",
        "component": "upper_reservoir",
        "kind": "polygon",
        "material": "embankment",
        "closed": true,
        "coords": [
          [
            35.6927,
            41.3520
          ],
          [
            35.6944,
            41.3532
          ],
          [
            35.6971,
            41.3538
          ],
          [
            35.7008,
            41.3538
          ],
          [
            35.7040,
            41.3528
          ],
          [
            35.7055,
            41.3510
          ],
          [
            35.7058,
            41.3487
          ],
          [
            35.7047,
            41.3468
          ],
          [
            35.7021,
            41.3457
          ],
          [
            35.6984,
            41.3453
          ],
          [
            35.6952,
            41.3456
          ],
          [
            35.6932,
            41.3466
          ],
          [
            35.6922,
            41.3484
          ],
          [
            35.6922,
            41.3504
          ],
          [
            35.6927,
            41.3520
          ]
        ],
        "baseElevationM": 703,
        "topElevationM": 782,
        "extrudeM": 79
      },
      {
        "id": "upperDamCrestRoad",
        "component": "upper_reservoir",
        "kind": "polyline",
        "material": "crest_road",
        "closed": true,
        "coords": [
          [
            35.6931,
            41.3517
          ],
          [
            35.6948,
            41.3528
          ],
          [
            35.6972,
            41.3533
          ],
          [
            35.7005,
            41.3533
          ],
          [
            35.7034,
            41.3524
          ],
          [
            35.7049,
            41.3508
          ],
          [
            35.7052,
            41.3488
          ],
          [
            35.7042,
            41.3471
          ],
          [
            35.7019,
            41.3461
          ],
          [
            35.6984,
            41.3458
          ],
          [
            35.6954,
            41.3461
          ],
          [
            35.6936,
            41.3471
          ],
          [
            35.6928,
            41.3487
          ],
          [
            35.6928,
            41.3503
          ],
          [
            35.6931,
            41.3517
          ]
        ],
        "elevationM": 782
      },
      {
        "id": "upperIntake",
        "component": "intake",
        "kind": "polygon",
        "material": "concrete",
        "closed": true,
        "coords": [
          [
            35.7035,
            41.3497
          ],
          [
            35.7041,
            41.3497
          ],
          [
            35.7041,
            41.3492
          ],
          [
            35.7035,
            41.3492
          ],
          [
            35.7035,
            41.3497
          ]
        ],
        "baseElevationM": 779,
        "topElevationM": 782,
        "extrudeM": 3
      },
      {
        "id": "headraceAlignment",
        "component": "headrace_tunnel",
        "kind": "polyline",
        "material": "tunnel_axis",
        "coords": [
          [
            35.7038,
            41.3495
          ],
          [
            35.7048,
            41.3586
          ]
        ],
        "profileElevationM": [
          782,
          690
        ]
      },
      {
        "id": "surgeTankFootprint",
        "component": "surge_tank",
        "kind": "polygon",
        "material": "shaft",
        "closed": true,
        "coords": [
          [
            35.7048,
            41.3590
          ],
          [
            35.7051,
            41.3589
          ],
          [
            35.7052,
            41.3586
          ],
          [
            35.7051,
            41.3583
          ],
          [
            35.7048,
            41.3582
          ],
          [
            35.7045,
            41.3583
          ],
          [
            35.7044,
            41.3586
          ],
          [
            35.7045,
            41.3589
          ],
          [
            35.7048,
            41.3590
          ]
        ],
        "baseElevationM": 690,
        "topElevationM": 735,
        "extrudeM": 45
      },
      {
        "id": "penstockAlignment",
        "component": "penstock",
        "kind": "polyline",
        "material": "penstock_axis",
        "coords": [
          [
            35.7048,
            41.3586
          ],
          [
            35.7099,
            41.3549
          ]
        ],
        "profileElevationM": [
          690,
          250
        ]
      },
      {
        "id": "servicePortal",
        "component": "portal",
        "kind": "polygon",
        "material": "portal",
        "closed": true,
        "coords": [
          [
            35.7072,
            41.3561
          ],
          [
            35.7080,
            41.3561
          ],
          [
            35.7080,
            41.3555
          ],
          [
            35.7072,
            41.3555
          ],
          [
            35.7072,
            41.3561
          ]
        ],
        "baseElevationM": 285,
        "topElevationM": 291,
        "extrudeM": 6
      },
      {
        "id": "powerhouseFootprint",
        "component": "powerhouse",
        "kind": "polygon",
        "material": "industrial",
        "closed": true,
        "coords": [
          [
            35.7089,
            41.3554
          ],
          [
            35.7111,
            41.3554
          ],
          [
            35.7111,
            41.3543
          ],
          [
            35.7089,
            41.3543
          ],
          [
            35.7089,
            41.3554
          ]
        ],
        "baseElevationM": 170,
        "topElevationM": 186,
        "extrudeM": 16
      },
      {
        "id": "tailraceSurgeTankFootprint",
        "component": "tailrace_surge_tank",
        "kind": "polygon",
        "material": "shaft",
        "closed": true,
        "coords": [
          [
            35.7146,
            41.3573
          ],
          [
            35.7149,
            41.3572
          ],
          [
            35.7150,
            41.3569
          ],
          [
            35.7149,
            41.3566
          ],
          [
            35.7146,
            41.3565
          ],
          [
            35.7143,
            41.3566
          ],
          [
            35.7142,
            41.3569
          ],
          [
            35.7143,
            41.3572
          ],
          [
            35.7146,
            41.3573
          ]
        ],
        "baseElevationM": 170,
        "topElevationM": 230,
        "extrudeM": 60
      },
      {
        "id": "tailraceAlignment",
        "component": "tailrace_tunnel",
        "kind": "polyline",
        "material": "tailrace_channel",
        "coords": [
          [
            35.7099,
            41.3549
          ],
          [
            35.7146,
            41.3569
          ],
          [
            35.7218,
            41.3622
          ]
        ],
        "profileElevationM": [
          170,
          155,
          145
        ]
      },
      {
        "id": "switchyardFootprint",
        "component": "switchyard",
        "kind": "polygon",
        "material": "switchyard",
        "closed": true,
        "coords": [
          [
            35.7152,
            41.3562
          ],
          [
            35.7171,
            41.3562
          ],
          [
            35.7171,
            41.3552
          ],
          [
            35.7152,
            41.3552
          ],
          [
            35.7152,
            41.3562
          ]
        ],
        "baseElevationM": 182,
        "topElevationM": 190,
        "extrudeM": 8
      }
    ]
  },
  "imagePrompt": "Aerial drone photography of a massive Pumped Storage Hydropower Plant. Visual details: an artificial upper reservoir formed by a 79-meter-high concrete gravity dam on a steep mountain plateau, connected to the existing large Altınkaya dam reservoir. There is a visible elevation difference of 611 meters between the two reservoirs. Giant steel penstock pipes and underground waterway structures run down the steep mountain slope. A large underground powerhouse facility with four 450 MW Francis pump-turbine units is located between the reservoirs, with switchyard and tunnel portals visible. Photorealistic, 8k resolution, accurate engineering architecture, hyper-detailed topography, clear blue water, cinematic daylight, Unreal Engine 5 render style."
}
```

---

## Uygulama tarafında önemli not

Bu nesnenin **3D’de doğru görünmesi** için renderer tarafında şu öncelik kullanılmalı:

1. `layout3D.useFootprintPolygons = true`
2. `layout.upperPolygon` veya `coordinates.upperReservoirPolygon` varsa kare reservoir yerine onu kullan
3. `layout3D.componentFootprints` içindeki:

   * `upperReservoirWater`
   * `upperReservoirDamEmbankment`
   * `headraceAlignment`
   * `penstockAlignment`
   * `powerhouseFootprint`
   * `tailraceAlignment`
   * `switchyardFootprint`

   doğrudan mesh/line üretiminde kullanılmalı.


