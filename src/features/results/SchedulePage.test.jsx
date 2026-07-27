import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchedulePage } from './SchedulePage';

describe('SchedulePage 그룹 식사 내역 이동', () => {
  it('확정 화면에서 해당 그룹 식사 내역으로 이동한다', () => {
    const openGroupHistory = vi.fn();
    render(<SchedulePage flow={{
      activeGroupId: 'group-1',
      goToStep: vi.fn(),
      openGroupHistory,
      savedSchedule: null,
    }} />);

    fireEvent.click(screen.getByRole('button', {
      name: '해당 그룹 식사 내역으로 이동',
    }));

    expect(openGroupHistory).toHaveBeenCalledWith('group-1');
  });
});
