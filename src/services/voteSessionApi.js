import { apiRequest } from './apiClient';

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
