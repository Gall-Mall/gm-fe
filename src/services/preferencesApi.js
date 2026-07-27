import { apiRequest } from './apiClient';

async function postAnalyze(path, text, extraBody = {}, options = {}) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    throw new Error('분석할 텍스트를 입력해주세요.');
  }

  return apiRequest(path, {
    method: 'POST',
    body: { text: trimmed, ...extraBody },
    failMessage: '분석에 실패했습니다.',
    ...options,
  });
}

/**
 * 자유텍스트 알레르기 분석.
 * @returns {Promise<{standardAllergens: {id: string, name: string}[], customAllergens: string[]}>}
 */
export async function analyzeAllergen(text, options = {}) {
  return postAnalyze('/api/users/me/allergens/analyze', text, {}, options);
}

/**
 * 자유텍스트 음식 취향 분석. (좋아하는/싫어하는 입력칸 공용)
 * @returns {Promise<{matchedMenus: {id: string, name: string}[], matchedCategories: {id: string, name: string}[], unmatchedText: string}>}
 */
export async function analyzeFoodPreference(text, polarity, options = {}) {
  return postAnalyze('/api/users/me/food-preferences/analyze', text, { polarity }, options);
}
