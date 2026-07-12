// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useSiteStore } from '../stores/useSiteStore';
import { makeTestSite } from '../test-utils/makeTestSite';
import { FabPopover } from './FabPopover';

const sites = [
  makeTestSite({ id: 'site-a', name: 'Gokcekaya PDHES', order: 1, capacityMW: 1400, energyGWh: 9.8, headM: 380 }),
  makeTestSite({ id: 'site-b', name: 'Very Long Candidate Name That Should Wrap Instead Of Expanding The Table PDHES', order: 2 }),
];

function renderFabPopover() {
  return render(
    <FabPopover
      mapStyle="satellite"
      setMapStyle={vi.fn()}
      terrain3d={false}
      setTerrain3d={vi.fn()}
      heightScale={1.1}
      setHeightScale={vi.fn()}
      selectedSiteId="site-a"
      selectSite={vi.fn()}
    />,
  );
}

describe('FabPopover UI contract', () => {
  beforeEach(() => {
    useSiteStore.setState({
      sites,
      selectedId: 'site-a',
      setWorldExampleFocus: vi.fn(),
    });
    useSettingsStore.setState({ mapStyle: 'satellite', heightScale: 1.1, showPowerGrid: false });
  });

  afterEach(cleanup);

  it('uses tab semantics and fixed table columns for compact map popover lists', () => {
    renderFabPopover();

    fireEvent.click(screen.getByRole('button', { name: /Men/i }));

    const tabList = screen.getByRole('tablist');
    const candidateTab = within(tabList).getByRole('tab', { name: /Adaylar/i });
    const worldTab = document.getElementById('fab-tab-world');
    expect(candidateTab.getAttribute('aria-selected')).toBe('true');
    expect(worldTab?.getAttribute('role')).toBe('tab');
    expect(worldTab?.getAttribute('aria-selected')).toBe('false');

    const table = screen.getByRole('table');
    const columnWidths = Array.from(table.querySelectorAll('col')).map((col) => col.getAttribute('style'));
    expect(columnWidths).toEqual(['width: 60%;', 'width: 20%;', 'width: 20%;']);
  });
});
