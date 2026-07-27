import { apiRequest } from './apiClient';

export function listGroups({ page = 0, size = 20, ...options } = {}) {
  return apiRequest(`/api/groups?page=${page}&size=${size}`, { failMessage: '그룹 목록을 불러오지 못했습니다.', ...options });
}

export function createGroup(payload, options = {}) {
  return apiRequest('/api/groups', {
    method: 'POST', body: payload, failMessage: '그룹 생성에 실패했습니다.', ...options,
  });
}

export function getGroup(groupId, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  return apiRequest(`/api/groups/${groupId}`, { failMessage: '그룹 정보를 불러오지 못했습니다.', ...options });
}

export function listGroupMembers(groupId, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  return apiRequest(`/api/groups/${groupId}/members`, {
    failMessage: '그룹 멤버를 불러오지 못했습니다.',
    ...options,
  });
}

export function transferGroupOwner(groupId, userId, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  if (!userId) throw new Error('방장을 위임할 사용자 ID가 없습니다.');
  return apiRequest(`/api/groups/${groupId}/owner`, {
    method: 'PATCH',
    body: { userId },
    failMessage: '방장 위임에 실패했습니다.',
    ...options,
  });
}

export function removeGroupMember(groupId, userId, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  if (!userId) throw new Error('강퇴할 사용자 ID가 없습니다.');
  return apiRequest(`/api/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
    failMessage: '멤버 강퇴에 실패했습니다.',
    ...options,
  });
}

export function updateGroup(groupId, payload, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  return apiRequest(`/api/groups/${groupId}`, {
    method: 'PUT', body: payload, failMessage: '그룹 수정에 실패했습니다.', ...options,
  });
}

export function deleteGroup(groupId, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  return apiRequest(`/api/groups/${groupId}`, {
    method: 'DELETE', failMessage: '그룹 삭제에 실패했습니다.', ...options,
  });
}
