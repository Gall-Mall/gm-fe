import { apiRequest } from './apiClient';

// GET /api/users/me — 내 정보(프로필/취향 설정) 조회.
export async function getMe(options = {}) {
  return apiRequest('/api/users/me', {
    failMessage: '내 정보를 불러오지 못했습니다.',
    ...options,
  });
}
