import { describe, expect, it, vi } from 'vitest';
import { createAndSubscribeVoteSession } from './voteSessionFlow';

describe('createAndSubscribeVoteSession', () => {
  it('투표 세션을 생성한 뒤 반환된 채널을 구독한다', async () => {
    const calls = [];
    const createVoteSession = vi.fn(async (groupId, request) => {
      calls.push(['create', groupId, request]);
      return { voteSessionId: 'session-1', status: 'PREFERENCE_VOTING' };
    });
    const subscribeVoteSession = vi.fn(async (voteSessionId, onEvent) => {
      calls.push(['subscribe', voteSessionId, onEvent]);
      return { disconnect: vi.fn() };
    });
    const onEvent = vi.fn();
    const onSessionCreated = vi.fn();
    const request = {
      title: '오늘 메뉴 투표',
      likeKeyword: '든든한, 매콤한',
      dislikeKeyword: null,
    };

    const result = await createAndSubscribeVoteSession({
      groupId: 'group-1',
      request,
      onEvent,
      onSessionCreated,
      createVoteSession,
      subscribeVoteSession,
    });

    expect(calls).toEqual([
      ['create', 'group-1', request],
      ['subscribe', 'session-1', onEvent],
    ]);
    expect(onSessionCreated).toHaveBeenCalledWith({
      voteSessionId: 'session-1',
      status: 'PREFERENCE_VOTING',
    });
    expect(result.voteSession).toEqual({
      voteSessionId: 'session-1',
      status: 'PREFERENCE_VOTING',
    });
    expect(result.connection.disconnect).toBeTypeOf('function');
  });

  it('세션 생성이 실패하면 WebSocket을 연결하지 않는다', async () => {
    const createVoteSession = vi.fn().mockRejectedValue(new Error('생성 실패'));
    const subscribeVoteSession = vi.fn();

    await expect(createAndSubscribeVoteSession({
      groupId: 'group-1',
      request: { title: '오늘 메뉴 투표' },
      onEvent: vi.fn(),
      createVoteSession,
      subscribeVoteSession,
    })).rejects.toThrow('생성 실패');

    expect(subscribeVoteSession).not.toHaveBeenCalled();
  });
});
