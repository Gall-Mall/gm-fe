import { apiRequest } from './apiClient';

export function listPreviousGroups(options = {}) {
  return apiRequest('/api/users/me/previous-groups', {
    failMessage: '지난 식사 기록을 불러오지 못했습니다.', ...options,
  });
}

export function getPreviousVoteSession(voteSessionId, options = {}) {
  if (!voteSessionId) throw new Error('voteSessionId가 필요합니다.');
  return apiRequest(`/api/users/me/previous-vote-sessions/${voteSessionId}`, {
    failMessage: '지난 식사 상세를 불러오지 못했습니다.', ...options,
  });
}
