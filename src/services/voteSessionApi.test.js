import { describe, expect, it, vi } from 'vitest';
import { createVoteSession } from './voteSessionApi';

describe('createVoteSession', () => {
  it('그룹 투표 세션 생성 API의 data를 반환한다', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { voteSessionId: 'session-1', status: 'PREFERENCE_VOTING' },
      }),
    });

    const result = await createVoteSession(
      'group-1',
      { title: '오늘 메뉴 투표', likeKeyword: '매콤한', dislikeKeyword: null },
      { baseUrl: 'http://localhost:8080', fetcher },
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:8080/api/groups/group-1/vote-sessions',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      title: '오늘 메뉴 투표',
      likeKeyword: '매콤한',
      dislikeKeyword: null,
    });
    expect(result).toEqual({ voteSessionId: 'session-1', status: 'PREFERENCE_VOTING' });
  });

  it('생성 API가 실패하면 서버 메시지를 포함한 오류를 던진다', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: '제목은 필수입니다.' }),
    });

    await expect(createVoteSession(
      'group-1',
      { title: '' },
      { baseUrl: 'http://localhost:8080/', fetcher },
    )).rejects.toThrow('제목은 필수입니다.');
  });

  it('API 주소가 없으면 현재 origin의 상대 경로를 사용한다', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { voteSessionId: 'session-1' } }),
    });

    await createVoteSession('group-1', { title: '오늘 메뉴 투표' }, { fetcher });

    expect(fetcher.mock.calls[0][0]).toBe('/api/groups/group-1/vote-sessions');
  });
});
