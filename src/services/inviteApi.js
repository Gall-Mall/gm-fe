import { apiRequest } from './apiClient';

export function getInvite(inviteCode, options = {}) {
  if (!inviteCode) throw new Error('inviteCode가 없습니다.');
  return apiRequest(`/api/invites/${inviteCode}`, { failMessage: '초대 정보를 불러오지 못했습니다.', ...options });
}

export const getInviteInfo = getInvite;

export function createInviteLink(groupId, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  return apiRequest(`/api/groups/${groupId}/invites`, {
    method: 'POST', failMessage: '초대 링크 생성에 실패했습니다.', ...options,
  });
}

export const createInvite = createInviteLink;

export function joinInvite(inviteCode, options = {}) {
  if (!inviteCode) throw new Error('inviteCode가 없습니다.');
  return apiRequest(`/api/invites/${inviteCode}/members`, {
    method: 'POST', failMessage: '그룹 참여에 실패했습니다.', ...options,
  });
}

export const joinGroup = joinInvite;
