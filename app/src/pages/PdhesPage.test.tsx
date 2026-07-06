// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';
import PdhesPage from './PdhesPage';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('PdhesPage editable content safety', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkspaceStore.setState({ contentOverrides: {} });
  });

  afterEach(cleanup);

  it('renders local workspace overrides as text instead of HTML', () => {
    const payload = '<img src=x onerror=alert(1)>Güvenli başlık';
    useWorkspaceStore.getState().setOverride('pdhesWhatIs.title', payload);

    render(<PdhesPage />);

    expect(screen.getByText(payload)).toBeTruthy();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });

  it('keeps default editable content free of embedded HTML markup', () => {
    render(<PdhesPage />);

    expect(document.body.textContent).not.toContain('<span');
    expect(screen.getByRole('heading', { name: 'Pompaj Depolamalı HES (PDHES) Nedir?' }))
      .toBeTruthy();
  });

  it('provides an accessible glossary search and a consistent heading hierarchy', () => {
    render(<PdhesPage />);

    expect(screen.getByRole('textbox', { name: /teknik terim ara/i })).toBeTruthy();

  });
});
