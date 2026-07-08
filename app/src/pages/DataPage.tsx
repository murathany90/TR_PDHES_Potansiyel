import React, { useState } from 'react';
import type { CandidateFilters } from '../utils/pdhesFilters';
import type { Site } from '../types/site';
import { useSiteStore } from '../stores/useSiteStore';
import { moneyBn, moneyM, num } from '../utils/format';
import { getSiteTableMetrics } from '../utils/siteTableMetrics';
import {
  CONCEPT_TYPE_FILTERS,
  DEFAULT_DATA_FILTERS,
  INFRASTRUCTURE_TYPE_FILTERS,
  SOURCE_GROUP_FILTERS,
  matchesCandidateFilters,
} from '../utils/pdhesFilters';

import {
  CONCEPT_TYPE_LABELS,
  CYCLE_TYPE_LABELS,
  GRID_SUPPLY_TYPE_LABELS,
  INFRASTRUCTURE_TYPE_LABELS,
  PRIMARY_PURPOSE_LABELS,
  SOURCE_GROUP_LABELS,
} from '../utils/siteDerived';

function waterwayText(site: Site): string {
  if (site.totalWaterwayLengthM != null) return `${num(site.totalWaterwayLengthM)} m toplam su yolu`;
  if (site.tunnelLengthKm != null) return `${num(site.tunnelLengthKm, 1)} km tünel`;
  if (site.penstockLengthM != null) return `${num(site.penstockLengthM)} m cebri boru`;
  if (site.tailraceTunnelLengthM != null) return `${num(site.tailraceTunnelLengthM)} m kuyruk suyu`;
  return '-';
}

function originLabel(origin: 'source' | 'scenario'): string {
  return origin === 'source' ? 'Kaynak' : 'Senaryo';
}

export default function DataPage({ site }: { site?: Site }) {
  const { sites, selectedId, selectSite } = useSiteStore();
  const [filters, setFilters] = useState<CandidateFilters>(DEFAULT_DATA_FILTERS);

  if (!site) return <div className="panel active"><p className="muted">Veri yükleniyor...</p></div>;

  const filteredSites = sites
    .filter((candidate) => matchesCandidateFilters(candidate, filters))
    .sort((a, b) => a.order - b.order);

  const updateFilter = <K extends keyof CandidateFilters>(key: K, value: CandidateFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="panel active">
      <div className="grid data-layout full-width">
        <div className="card table-card">
          <h2>Aday saha tablosu</h2>
          <p className="muted small">Varsayılan sıra önce JICA/EİE 16 adayını, sonra skorla seçilen 4 deniz tipi prototipi gösterir.</p>

          <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
            {SOURCE_GROUP_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={filters.sourceGroup === filter.id}
                className={`btn ${filters.sourceGroup === filter.id ? 'primary' : 'ghost'}`}
                style={{ minHeight: 32, padding: '6px 12px', fontSize: 13 }}
                onClick={() => updateFilter('sourceGroup', filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="editor-form" style={{ marginBottom: 14 }}>
            <div className="form-row">
              <label className="form-group">
                Konsept
                <select className="select" value={filters.conceptType} onChange={(event) => updateFilter('conceptType', event.target.value as CandidateFilters['conceptType'])}>
                  {CONCEPT_TYPE_FILTERS.map((filter) => <option key={filter.id} value={filter.id}>{filter.label}</option>)}
                </select>
              </label>
              <label className="form-group">
                Altyapı
                <select className="select" value={filters.infrastructureType} onChange={(event) => updateFilter('infrastructureType', event.target.value as CandidateFilters['infrastructureType'])}>
                  {INFRASTRUCTURE_TYPE_FILTERS.map((filter) => <option key={filter.id} value={filter.id}>{filter.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="candidate-table-wrap">
            <table className="candidate-table">
              <colgroup>
                <col className="col-order" style={{ width: '40px' }} />
                <col className="col-site" style={{ width: '180px' }} />
                <col className="col-source" style={{ width: '100px' }} />
                <col className="col-power" style={{ width: '120px' }} />
                <col className="col-waterway" style={{ width: '140px' }} />
                <col className="col-money" style={{ width: '100px' }} />
                <col className="col-money" style={{ width: '100px' }} />
                <col className="col-reservoir" style={{ width: '220px' }} />
                <col className="col-classification" style={{ width: '180px' }} />
                <col className="col-score" style={{ width: '120px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th>Saha</th>
                  <th>Kaynak grubu</th>
                  <th>Güç / Enerji</th>
                  <th>Düşü (head) / Su Yolu</th>
                  <th>Yatırım</th>
                  <th>Gelir</th>
                  <th>Alt / üst rezervuar</th>
                  <th>Teknik sınıflandırma</th>
                  <th>Skor (Senaryo)</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map((candidate) => {
                  const metrics = getSiteTableMetrics(candidate);
                  return (
                    <React.Fragment key={candidate.id}>
                      <tr className={`main-row ${candidate.id === selectedId ? 'selected' : ''}`} onClick={() => selectSite(candidate.id)}>
                        <td>{candidate.order}</td>
                        <td>
                          <button
                            type="button"
                            className="site-row-button"
                            aria-current={candidate.id === selectedId ? 'true' : undefined}
                            onClick={(e) => { e.stopPropagation(); selectSite(candidate.id); }}
                          >
                            <b>{candidate.name}</b>
                            <span className="muted small">{candidate.province}</span>
                          </button>
                        </td>
                        <td>
                          <span className={`source-chip ${candidate.sourceGroup === 'SEA_WATER_PROTOTYPE_TOP4' ? 'sea' : 'jica'}`}>
                            {SOURCE_GROUP_LABELS[candidate.sourceGroup]}
                          </span>
                        </td>
                        <td>
                          <b>{num(candidate.capacityMW)} MW</b>
                          <span className="muted small">{candidate.energyGWh ? `${num(candidate.energyGWh * 1000)} MWh` : '-'}</span>
                        </td>
                        <td>
                          <b>{candidate.headM ? `${num(candidate.headM)} m` : '-'}</b>
                          <span className="muted small">{waterwayText(candidate)}</span>
                        </td>
                        <td>
                          <b>{metrics.investmentUsdBn ? moneyBn(metrics.investmentUsdBn) : '-'}</b>
                          {metrics.investmentUsdBn != null && <span className="muted small">{originLabel(metrics.investmentOrigin)}</span>}
                        </td>
                        <td>
                          <b>{metrics.revenueUsdM ? moneyM(metrics.revenueUsdM) : '-'}</b>
                          {metrics.revenueUsdM != null && <span className="muted small">{originLabel(metrics.revenueOrigin)}</span>}
                        </td>
                        <td><b>{candidate.lowerReservoirName}</b><br /><span className="muted small">{candidate.upperReservoirDescription}</span></td>
                        <td>
                          {CYCLE_TYPE_LABELS[candidate.technicalClassification.cycleType]}<br />
                          <span className="muted small">{INFRASTRUCTURE_TYPE_LABELS[candidate.technicalClassification.infrastructureType]}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <b style={{ minWidth: '24px' }}>{metrics.scenarioScore}</b>
                            <div style={{ flex: 1, height: '6px', background: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${metrics.scenarioScore}%`, background: 'var(--green)' }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                      {candidate.id === selectedId && (
                        <tr className="expanded-details-row">
                          <td colSpan={10}>
                            <div className="expanded-details-content">
                              <p className="muted" style={{ marginBottom: 12 }}>{candidate.thesis}</p>
                              <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div className="metric info"><span>Debi / düşü</span><b>{candidate.projectFlowCms ? num(candidate.projectFlowCms) : '-'} m³/s / {candidate.headM ? num(candidate.headM) : '-'} m</b></div>
                                <div className="metric"><span>Geri ödeme</span><b>{candidate.paybackYear ? `${candidate.paybackYear} yıl` : (metrics.investmentUsdBn && metrics.revenueUsdM ? `~${Math.round((metrics.investmentUsdBn * 1000) / metrics.revenueUsdM)} yıl` : '-')}</b></div>
                                <div className="metric">
                                  <span>Yaklaşık depolama kapasitesi</span>
                                  <b>{candidate.activeVolumeHm3 ? `${candidate.activeVolumeHm3} hm³` : (candidate.projectFlowCms ? `~${(candidate.projectFlowCms * 7 * 3600 / 1000000).toFixed(1)} hm³` : '-')}</b>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                                <span className="tag">{CONCEPT_TYPE_LABELS[candidate.technicalClassification.conceptType]}</span>
                                <span className="tag">{GRID_SUPPLY_TYPE_LABELS[candidate.technicalClassification.gridSupplyType]}</span>
                                <span className="tag">{PRIMARY_PURPOSE_LABELS[candidate.technicalClassification.primaryPurpose]}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
