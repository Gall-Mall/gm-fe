import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GroupSettingsPage } from './GroupSettingsPage';

afterEach(() => vi.restoreAllMocks());

function flow(overrides = {}) {
  return {
    goToStep: vi.fn(),
    gset: {
      name: '수정사항',
      location: '강남',
      recTime: '18:00',
      distanceKm: 2,
      distanceMode: 'preset',
      distanceText: '2',
    },
    setGset: vi.fn(),
    members: [],
    isHost: true,
    delegateHost: vi.fn(),
    kickMember: vi.fn(),
    saveGroupSettings: vi.fn(),
    deleteActiveGroup: vi.fn(),
    groupDeleteStatus: 'idle',
    operationError: '',
    ...overrides,
  };
}

describe('GroupSettingsPage 그룹 삭제', () => {
  it('방장이 확인하면 활성 그룹을 삭제한다', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const pageFlow = flow();
    render(<GroupSettingsPage flow={pageFlow} />);

    const header = screen.getByRole('banner');
    fireEvent.click(within(header).getByRole('button', { name: '그룹 삭제' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(pageFlow.deleteActiveGroup).toHaveBeenCalledTimes(1);
  });
});
