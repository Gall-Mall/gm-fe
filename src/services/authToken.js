// 액세스 토큰은 탭 세션에만 보관한다. Refresh Token은 백엔드의 HTTP-only 쿠키가 관리한다.
const TOKEN_KEY = 'gm-access-token';

export function getAccessToken() {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token) {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* 저장 실패는 무시 */
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}
