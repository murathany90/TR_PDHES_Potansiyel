// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SectionNav from './SectionNav';

describe('SectionNav scroll tracking', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('tracks both the nested desktop panel and the mobile window scroller', () => {
    const panel = document.createElement('div');
    panel.className = 'panel active';
    document.body.appendChild(panel);
    const panelListener = vi.spyOn(panel, 'addEventListener');
    const windowListener = vi.spyOn(window, 'addEventListener');

    render(<SectionNav sections={[{ id: 'section-one', title: 'Bölüm' }]} />, {
      container: panel,
    });

    expect(panelListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(windowListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
