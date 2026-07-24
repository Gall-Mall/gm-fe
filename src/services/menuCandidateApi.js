import { apiRequest } from './apiClient';

// GET /api/groups/{groupId}/vote-sessions/{voteSessionId}/menu-candidates
// 현재 라운드의 메뉴 후보 목록 조회
export async function getMenuCandidates(groupId, voteSessionId, options = {}) {
  if (!groupId || !voteSessionId) throw new Error('groupId와 voteSessionId가 필요합니다.');
  return apiRequest(`/api/groups/${groupId}/vote-sessions/${voteSessionId}/menu-candidates`, {
    failMessage: '메뉴 후보를 불러오지 못했습니다.',
    ...options,
  });
}
