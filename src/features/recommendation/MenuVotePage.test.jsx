import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MenuVotePage } from './MenuVotePage';

describe('MenuVotePage 그룹 투표 현황', () => {
  it('활성 멤버 기준으로 투표 완료 인원과 투표 중인 인원을 표시한다', () => {
    render(<MenuVotePage flow={{
      menus: [{
        id: 'candidate-1',
        name: '타코',
        cat: '멕시코식',
        emoji: '🌮',
        image: null,
        score: 90,
        reasons: ['그룹 취향과 잘 맞아요.'],
        cautions: [],
      }],
      menuVotes: { 'candidate-1': { like: 1, maybe: 0, dislike: 0 } },
      myMenuVote: {},
      currentMenuIdx: 0,
      setCurrentMenuIdx: vi.fn(),
      voteMenu: vi.fn(),
      voteKeywords: [],
      voteStartedAt: null,
      remainMs: 0,
      voteClosed: false,
      votedCount: 0,
      allMenusVoted: false,
      roundNumber: 1,
      candidateCount: 0,
      goToStep: vi.fn(),
      members: [
        { id: 'owner-id', name: '이경주' },
        { id: 'member-id', name: '설승환' },
      ],
      gset: { memberCount: 2 },
      completedMenuVoterIds: ['member-id'],
    }} />);

    expect(screen.getByText('투표 완료 1명')).not.toBeNull();
    expect(screen.getByText('투표 중 1명')).not.toBeNull();
  });
});
