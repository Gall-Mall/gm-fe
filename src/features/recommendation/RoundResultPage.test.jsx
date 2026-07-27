import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoundResultPage } from './RoundResultPage';

afterEach(cleanup);

function candidate(id, name) {
  return {
    id,
    name,
    cat: '한식',
    v: { like: 1, maybe: 0, dislike: 0 },
  };
}

describe('RoundResultPage 재추천 노출', () => {
  it('실 API 최종 후보가 3개면 재추천 버튼을 표시하지 않는다', () => {
    render(<RoundResultPage flow={{
      isHost: true,
      candidateCount: 3,
      candidateMenus: [
        candidate('candidate-1', '비빔밥'),
        candidate('candidate-2', '불고기'),
        candidate('candidate-3', '제육볶음'),
      ],
      candidateIds: ['candidate-1', 'candidate-2', 'candidate-3'],
      roundSummary: { confirmed: 0, kept: 3, excluded: 7 },
      setRoundCandidates: vi.fn(),
      decisionVote: vi.fn(),
      closeDecision: vi.fn(),
      confirmMenu: vi.fn(),
      reRecommend: vi.fn(),
      recommending: false,
      myDecisionChoice: null,
      decisionDoneCount: 0,
      decisionTotal: 3,
      decisionClosed: false,
      decisionAllDone: false,
      decisionTally: {},
      decisionOutcome: null,
      selectedFinalMenuId: null,
      setSelectedFinalMenuId: vi.fn(),
      roundNumber: 1,
      voteStartStatus: 'connected',
      finalMenuVote: null,
      submitFinalVote: vi.fn(),
      selectFinalCandidate: vi.fn(),
      requestReRecommendation: vi.fn(),
    }} />);

    expect(screen.queryByRole('button', {
      name: /마음에 드는 후보가 없어요 · 새 메뉴로 다시 투표/,
    })).toBeNull();
  });

  it('실 API 최종 후보가 0개면 방장이 새 메뉴를 추천받을 수 있다', () => {
    const requestReRecommendation = vi.fn();
    render(<RoundResultPage flow={{
      isHost: true,
      candidateCount: 0,
      candidateMenus: [],
      candidateIds: [],
      roundSummary: { confirmed: 0, kept: 0, excluded: 10 },
      setRoundCandidates: vi.fn(),
      decisionVote: vi.fn(),
      closeDecision: vi.fn(),
      confirmMenu: vi.fn(),
      reRecommend: vi.fn(),
      recommending: false,
      myDecisionChoice: null,
      decisionDoneCount: 0,
      decisionTotal: 3,
      decisionClosed: false,
      decisionAllDone: false,
      decisionTally: {},
      decisionOutcome: null,
      selectedFinalMenuId: null,
      setSelectedFinalMenuId: vi.fn(),
      roundNumber: 1,
      voteStartStatus: 'connected',
      finalMenuVote: null,
      submitFinalVote: vi.fn(),
      selectFinalCandidate: vi.fn(),
      requestReRecommendation,
    }} />);

    fireEvent.click(screen.getByRole('button', { name: '새 메뉴 추천받기' }));

    expect(requestReRecommendation).toHaveBeenCalledOnce();
  });

  it('실 API 최종 후보가 0개면 일반 멤버는 방장의 재추천을 기다린다', () => {
    render(<RoundResultPage flow={{
      isHost: false,
      candidateCount: 0,
      candidateMenus: [],
      candidateIds: [],
      roundSummary: { confirmed: 0, kept: 0, excluded: 10 },
      setRoundCandidates: vi.fn(),
      decisionVote: vi.fn(),
      closeDecision: vi.fn(),
      confirmMenu: vi.fn(),
      reRecommend: vi.fn(),
      recommending: false,
      myDecisionChoice: null,
      decisionDoneCount: 0,
      decisionTotal: 3,
      decisionClosed: false,
      decisionAllDone: false,
      decisionTally: {},
      decisionOutcome: null,
      selectedFinalMenuId: null,
      setSelectedFinalMenuId: vi.fn(),
      roundNumber: 1,
      voteStartStatus: 'connected',
      finalMenuVote: null,
      submitFinalVote: vi.fn(),
      selectFinalCandidate: vi.fn(),
      requestReRecommendation: vi.fn(),
    }} />);

    expect(screen.getByText('방장이 새 메뉴를 준비하고 있어요')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '새 메뉴 추천받기' })).toBeNull();
  });
});
