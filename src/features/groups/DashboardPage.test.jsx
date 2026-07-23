import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

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
    ...overrides,
  };
}

describe('DashboardPage 투표 시작 상태', () => {
  it('WebSocket 연결 중에는 시작 버튼을 비활성화한다', () => {
    render(<DashboardPage flow={flow({ voteStartStatus: 'connecting' })} />);

    const button = screen.getByRole('button', { name: 'WebSocket 연결 중...' });
    expect(button.disabled).toBe(true);
  });

  it('세션 생성 또는 연결 오류를 표시한다', () => {
    render(<DashboardPage flow={flow({
      voteStartStatus: 'failed',
      voteStartError: 'WebSocket 연결에 실패했습니다.',
    })} />);

    expect(screen.getByRole('alert').textContent).toContain('WebSocket 연결에 실패했습니다.');
  });
});
