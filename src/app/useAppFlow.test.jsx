import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createVoteSession } from '../services/voteSessionApi';
import { subscribeVoteSession } from '../services/voteSessionSocket';
import { useAppFlow } from './useAppFlow';

vi.mock('../services/voteSessionApi', () => ({ createVoteSession: vi.fn() }));
vi.mock('../services/voteSessionSocket', () => ({ subscribeVoteSession: vi.fn() }));

describe('useAppFlow 투표 시작', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('세션 생성 후 WebSocket 구독을 완료하고 메뉴 투표 단계로 이동한다', async () => {
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    createVoteSession.mockResolvedValue({
      voteSessionId: 'session-1',
      status: 'PREFERENCE_VOTING',
    });
    subscribeVoteSession.mockResolvedValue({ disconnect: vi.fn() });
    const { result } = renderHook(() => useAppFlow());

    act(() => {
      result.current.goToStep('dashboard');
      result.current.addVoteKeyword('매콤한');
    });
    await act(async () => {
      await result.current.startVote();
    });

    expect(createVoteSession).toHaveBeenCalledWith('group-1', {
      title: '오사카 푸디스 메뉴 투표',
      likeKeyword: '매콤한',
      dislikeKeyword: null,
    });
    expect(subscribeVoteSession).toHaveBeenCalledWith('session-1', expect.any(Function));
    expect(result.current.voteSessionId).toBe('session-1');
    expect(result.current.voteStartStatus).toBe('connected');
    expect(result.current.step).toBe('recommend');
  });

  it('연결 실패 시 대시보드에 머물고 오류를 노출한다', async () => {
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-1' });
    subscribeVoteSession.mockRejectedValue(new Error('WebSocket 연결에 실패했습니다.'));
    const { result } = renderHook(() => useAppFlow());

    act(() => result.current.goToStep('dashboard'));
    await act(async () => {
      await result.current.startVote();
    });

    expect(result.current.step).toBe('dashboard');
    expect(result.current.voteStartStatus).toBe('failed');
    expect(result.current.voteStartError).toBe('WebSocket 연결에 실패했습니다.');
  });
});
