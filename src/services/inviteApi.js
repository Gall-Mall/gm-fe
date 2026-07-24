import { apiRequest } from './apiClient';

// GET /api/invites/{inviteCode} — 초대 정보(그룹/방장/정원/만료) 조회
export async function getInvite(inviteCode, options = {}) {
  if (!inviteCode) throw new Error('inviteCode가 없습니다.');
  return apiRequest(`/api/invites/${inviteCode}`, { failMessage: '초대 정보를 불러오지 못했습니다.', ...options });
}

// POST /api/groups/{groupId}/invites — 초대 링크 생성
export async function createInviteLink(groupId, options = {}) {
  if (!groupId) throw new Error('groupId가 없습니다.');
  return apiRequest(`/api/groups/${groupId}/invites`, {
    method: 'POST',
    failMessage: '초대 링크 생성에 실패했습니다.',
    ...options,
  });
}

// POST /api/invites/{inviteCode}/members — 초대 코드로 그룹 참여
export async function joinInvite(inviteCode, options = {}) {
  if (!inviteCode) throw new Error('inviteCode가 없습니다.');
  return apiRequest(`/api/invites/${inviteCode}/members`, {
    method: 'POST',
    failMessage: '그룹 참여에 실패했습니다.',
    ...options,
  });
}
