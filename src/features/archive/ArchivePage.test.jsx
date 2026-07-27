import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArchivePage } from './ArchivePage';

describe('ArchivePage 그룹별 기록 이동', () => {
  it('그룹 헤더를 누르면 해당 그룹 식사 내역으로 이동한다', () => {
    const openGroupHistory = vi.fn();
    render(<ArchivePage flow={{
      archiveGroups: [{
        group: '수정사항',
        groupId: 'group-1',
        city: '',
        period: '',
        meals: [],
      }],
      openMeal: vi.fn(),
      openGroupHistory,
      goToStep: vi.fn(),
      loadHistory: vi.fn(),
      historyStatus: 'ready',
      operationError: '',
    }} />);

    fireEvent.click(screen.getByRole('button', {
      name: '수정사항 해당 그룹 식사 내역으로 이동',
    }));

    expect(openGroupHistory).toHaveBeenCalledWith('group-1');
  });
});
