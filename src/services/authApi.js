import { apiRequest } from './apiClient';
import { setAccessToken, clearAccessToken } from './authToken';

// POST /api/auth/token — 토큰 발급(로그인/코드 교환). 응답 accessToken 저장.
export async function issueToken(payload, options = {}) {
  const data = await apiRequest('/api/auth/token', {
    method: 'POST',
    body: payload,
    auth: false,
    failMessage: '로그인에 실패했습니다.',
    ...options,
  });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

// POST /api/auth/token/refresh — 액세스 토큰 재발급(리프레시 토큰은 쿠키 가정).
export async function refreshToken(options = {}) {
  const data = await apiRequest('/api/auth/token/refresh', {
    method: 'POST',
    auth: false,
    failMessage: '토큰 갱신에 실패했습니다.',
    ...options,
  });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

// POST /api/auth/logout — 서버 세션 종료 + 로컬 토큰 제거.
export async function logout(options = {}) {
  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
      failMessage: '로그아웃에 실패했습니다.',
      ...options,
    });
  } finally {
    clearAccessToken();
  }
}
