// 액세스 토큰 저장소 (localStorage). OAuth/토큰 발급 후 저장, 로그아웃 시 제거.
const TOKEN_KEY = 'galae-access-token';

export function getAccessToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* 저장 실패는 무시 */
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}
