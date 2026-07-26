import { apiRequest } from './apiClient';
import { clearAccessToken, setAccessToken } from './authToken';

// OAuth 성공 리다이렉트의 일회용 코드를 Access Token으로 교환한다.
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

export function exchangeOAuthCode(code, options = {}) {
  return issueToken({ code }, options);
}

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
