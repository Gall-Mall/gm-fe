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

async function postAnalyze(path, text, { baseUrl = defaultBaseUrl, fetcher = fetch } = {}) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    throw new Error('분석할 텍스트를 입력해주세요.');
  }

  const response = await fetcher(`${trimTrailingSlash(baseUrl)}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: trimmed }),
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(body?.message || body?.error?.message || `분석에 실패했습니다. (${response.status})`);
  }
  if (!body?.data) {
    throw new Error('분석 응답에 data가 없습니다.');
  }
  return body.data;
}

/**
 * 자유텍스트 알레르기 분석.
 * @returns {Promise<{standardAllergens: {id: string, name: string}[], customAllergens: string[]}>}
 */
export async function analyzeAllergen(text, options = {}) {
  return postAnalyze('/api/users/me/allergens/analyze', text, options);
}

/**
 * 자유텍스트 음식 취향 분석. (좋아하는/싫어하는 입력칸 공용)
 * @returns {Promise<{matchedCategories: {id: string, name: string}[], unmatchedText: string}>}
 */
export async function analyzeFoodPreference(text, options = {}) {
  return postAnalyze('/api/users/me/food-preferences/analyze', text, options);
}
