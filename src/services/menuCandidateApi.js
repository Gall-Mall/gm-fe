import { apiRequest } from './apiClient';

function sessionPath(groupId, voteSessionId) {
  if (!groupId || !voteSessionId) throw new Error('groupId와 voteSessionId가 필요합니다.');
  return `/api/groups/${groupId}/vote-sessions/${voteSessionId}`;
}

export function getMenuCandidates(groupId, voteSessionId, options = {}) {
  return apiRequest(`${sessionPath(groupId, voteSessionId)}/menu-candidates`, {
    failMessage: '메뉴 후보를 불러오지 못했습니다.', ...options,
  });
}

export function startMenuRecommendation(groupId, voteSessionId, options = {}) {
  return apiRequest(`${sessionPath(groupId, voteSessionId)}/recommendations`, {
    method: 'POST', failMessage: '메뉴 추천을 시작하지 못했습니다.', ...options,
  });
}

export function getVoteState(groupId, voteSessionId, options = {}) {
  return apiRequest(`${sessionPath(groupId, voteSessionId)}/vote-state`, {
    failMessage: '투표 상태를 불러오지 못했습니다.', ...options,
  });
}

const MENU_VOTE_CHOICE = Object.freeze({ like: 'GO', maybe: 'MAYBE', dislike: 'NO' });

export function submitMenuVote(groupId, voteSessionId, candidateId, choice, options = {}) {
  return apiRequest(`${sessionPath(groupId, voteSessionId)}/menu-candidates/${candidateId}/vote`, {
    method: 'PUT', body: { choice: MENU_VOTE_CHOICE[choice] || choice }, failMessage: '메뉴 투표를 저장하지 못했습니다.', ...options,
  });
}

export function closeMenuVote(groupId, voteSessionId, options = {}) {
  return apiRequest(`${sessionPath(groupId, voteSessionId)}/menu-candidates/close`, {
    method: 'PUT', failMessage: '메뉴 투표를 마감하지 못했습니다.', ...options,
  });
}

export function submitFinalMenuVote(groupId, voteSessionId, candidateId, options = {}) {
  return apiRequest(`${sessionPath(groupId, voteSessionId)}/menu-candidates/${candidateId}/final-vote`, {
    method: 'PUT', failMessage: '최종 메뉴 투표를 저장하지 못했습니다.', ...options,
  });
}

export function selectFinalMenu(groupId, voteSessionId, candidateId, options = {}) {
  return apiRequest(`${sessionPath(groupId, voteSessionId)}/menu-candidates/${candidateId}/final-selection`, {
    method: 'PUT', failMessage: '최종 메뉴를 확정하지 못했습니다.', ...options,
  });
}

export function reRecommendMenu(groupId, voteSessionId, options = {}) {
  return apiRequest(`${sessionPath(groupId, voteSessionId)}/menu-candidates/re-recommend`, {
    method: 'PUT', failMessage: '메뉴 재추천을 시작하지 못했습니다.', ...options,
  });
}
