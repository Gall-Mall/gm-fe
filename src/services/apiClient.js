import { getAccessToken } from './authToken';

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

  const response = await fetcher(`${trimTrailingSlash(baseUrl)}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include', // 쿠키 기반 세션(OAuth) 병행 지원
  });

  const resBody = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(resBody?.message || resBody?.error?.message || failMessage || `요청에 실패했습니다. (${response.status})`);
  }
  return resBody?.data ?? resBody;
}
