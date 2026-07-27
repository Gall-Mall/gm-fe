import { apiRequest } from './apiClient';

function storePath(groupId, voteSessionId) {
  if (!groupId || !voteSessionId) throw new Error('groupId와 voteSessionId가 필요합니다.');
  return `/api/groups/${groupId}/vote-sessions/${voteSessionId}/stores`;
}

export function searchStores(request, options = {}) {
  return apiRequest('/api/stores/search', {
    method: 'POST', body: request, failMessage: '주변 식당 검색을 시작하지 못했습니다.', ...options,
  });
}

export function listStores(groupId, voteSessionId, options = {}) {
  return apiRequest(storePath(groupId, voteSessionId), {
    failMessage: '식당 검색 결과를 불러오지 못했습니다.', ...options,
  });
}

export function selectStore(groupId, voteSessionId, externalPlaceId, options = {}) {
  if (!externalPlaceId) throw new Error('externalPlaceId가 필요합니다.');
  return apiRequest(`${storePath(groupId, voteSessionId)}/${encodeURIComponent(externalPlaceId)}/selection`, {
    method: 'PUT', failMessage: '최종 식당을 확정하지 못했습니다.', ...options,
  });
}
