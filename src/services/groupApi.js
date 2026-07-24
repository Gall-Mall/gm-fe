import { apiRequest } from './apiClient';

// GET /api/groups — 내 그룹 목록
export async function listGroups(options = {}) {
  return apiRequest('/api/groups', { failMessage: '그룹 목록을 불러오지 못했습니다.', ...options });
}

// POST /api/groups — 그룹 생성
export async function createGroup(payload, options = {}) {
  return apiRequest('/api/groups', {
    method: 'POST',
    body: payload,
    failMessage: '그룹 생성에 실패했습니다.',
    ...options,
  });
}

// GET /api/groups/{groupId} — 그룹 상세
export async function getGroup(groupId, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  return apiRequest(`/api/groups/${groupId}`, { failMessage: '그룹 정보를 불러오지 못했습니다.', ...options });
}

// PUT /api/groups/{groupId} — 그룹 정보 수정
export async function updateGroup(groupId, payload, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  return apiRequest(`/api/groups/${groupId}`, {
    method: 'PUT',
    body: payload,
    failMessage: '그룹 수정에 실패했습니다.',
    ...options,
  });
}
