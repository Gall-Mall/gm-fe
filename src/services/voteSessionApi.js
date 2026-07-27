import { apiRequest } from './apiClient';

export async function getCurrentVoteSession(groupId, options = {}) {
  if (!groupId) throw new Error('투표를 조회할 그룹 ID가 없습니다.');
  const data = await apiRequest(`/api/groups/${groupId}/vote-sessions/current`, {
    failMessage: '진행 중인 투표를 불러오지 못했습니다.',
    ...options,
  });
  return data?.voteSessionId ? data : null;
}

export async function createVoteSession(
  groupId,
  request,
  { accessToken, ...options } = {},
) {
  if (!groupId) {
    throw new Error('투표를 시작할 그룹 ID가 없습니다.');
  }
  const data = await apiRequest(`/api/groups/${groupId}/vote-sessions`, {
    method: 'POST',
    body: request,
    token: accessToken,
    failMessage: '투표 세션 생성에 실패했습니다.',
    ...options,
  });
  if (!data?.voteSessionId) {
    throw new Error('투표 세션 생성 응답에 voteSessionId가 없습니다.');
  }
  return data;
}
