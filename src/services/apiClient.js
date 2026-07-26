import { clearAccessToken, getAccessToken, setAccessToken } from './authToken';

// 공용 REST 클라이언트. voteSessionApi/preferencesApi와 동일한 규약:
//  - baseUrl = VITE_API_BASE_URL
//  - 응답 봉투 { data, message } 를 가정하고 data 를 반환
//  - 테스트 위해 { baseUrl, fetcher } 주입 가능
const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

async function readResponseBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest(
  path,
  {
    method = 'GET',
    body,
    baseUrl = defaultBaseUrl,
    fetcher = fetch,
    token,
    auth = true,
    failMessage,
  } = {},
) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const bearer = token ?? (auth ? getAccessToken() : null);
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const requestUrl = `${trimTrailingSlash(baseUrl)}${path}`;
  const requestOptions = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include', // 쿠키 기반 세션(OAuth) 병행 지원
  };
  let response = await fetcher(requestUrl, requestOptions);

  if (response.status === 401 && bearer && path !== '/api/auth/token/refresh') {
    const refreshResponse = await fetcher(`${trimTrailingSlash(baseUrl)}/api/auth/token/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {},
    });
    const refreshBody = await readResponseBody(refreshResponse);
    const refreshedToken = refreshBody?.data?.accessToken ?? refreshBody?.accessToken;
    if (!refreshResponse.ok || !refreshedToken) {
      clearAccessToken();
      throw new Error(refreshBody?.message || refreshBody?.error?.message || '로그인이 만료되었습니다. 다시 로그인해주세요.');
    }
    setAccessToken(refreshedToken);
    response = await fetcher(requestUrl, {
      ...requestOptions,
      headers: { ...headers, Authorization: `Bearer ${refreshedToken}` },
    });
  }

  const resBody = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(resBody?.message || resBody?.error?.message || failMessage || `요청에 실패했습니다. (${response.status})`);
  }
  return resBody?.data ?? resBody;
}
