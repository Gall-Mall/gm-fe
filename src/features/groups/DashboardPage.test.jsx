import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

afterEach(cleanup);

function flow(overrides = {}) {
  return {
    goToStep: vi.fn(),
    members: [{ id: 'member-1', name: '나', role: 'host' }],
    isHost: true,
    gset: { name: '강남 점심 모임', location: '강남' },
    voteLimitMin: 60,
    setVoteLimitMin: vi.fn(),
    startVote: vi.fn(),
    voteKeywords: [],
    addVoteKeyword: vi.fn(),
    removeVoteKeyword: vi.fn(),
    voteStartStatus: 'idle',
    voteStartError: '',
    copied: 'idle',
    handleCopy: vi.fn(),
    activeGroupId: 'group-1',
    openGroupHistory: vi.fn(),
    ...overrides,
  };
}

describe('DashboardPage 투표 시작 상태', () => {
  it('추천 메뉴를 불러오는 중에는 시작 버튼을 비활성화한다', () => {
    render(<DashboardPage flow={flow({ voteStartStatus: 'connecting' })} />);

    const button = screen.getByRole('button', { name: '추천 메뉴 불러오는 중...' });
    expect(button.disabled).toBe(true);
  });

  it('세션 생성 또는 연결 오류를 표시한다', () => {
    render(<DashboardPage flow={flow({
      voteStartStatus: 'failed',
      voteStartError: 'WebSocket 연결에 실패했습니다.',
    })} />);

    expect(screen.getByRole('alert').textContent).toContain('WebSocket 연결에 실패했습니다.');
  });

  it('지난 식사 버튼을 누르면 해당 그룹 식사 내역으로 이동한다', () => {
    const pageFlow = flow();
    const page = render(<DashboardPage flow={pageFlow} />);

    fireEvent.click(page.getByRole('button', { name: '해당 그룹 식사 내역으로 이동' }));

    expect(pageFlow.openGroupHistory).toHaveBeenCalledWith('group-1');
  });
});
