import { describe, expect, it, vi } from 'vitest';
import { analyzeAllergen, analyzeFoodPreference } from './preferencesApi';

describe('analyzeAllergen', () => {
  it('알레르기 분석 API의 data를 반환한다', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          standardAllergens: [{ id: 'a1', name: '우유' }],
          customAllergens: ['파인애플'],
        },
      }),
    });

    const result = await analyzeAllergen('우유랑 파인애플 못 먹어요', {
      baseUrl: 'http://localhost:8080',
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:8080/api/users/me/allergens/analyze',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ text: '우유랑 파인애플 못 먹어요' });
    expect(result).toEqual({
      standardAllergens: [{ id: 'a1', name: '우유' }],
      customAllergens: ['파인애플'],
    });
  });

  it('빈 텍스트는 호출 전에 거부한다', async () => {
    const fetcher = vi.fn();
    await expect(analyzeAllergen('   ', { fetcher })).rejects.toThrow('분석할 텍스트를 입력해주세요.');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('API가 실패하면 서버 메시지를 포함한 오류를 던진다', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: '인증이 필요합니다.' }),
    });

    await expect(analyzeAllergen('우유', { fetcher })).rejects.toThrow('인증이 필요합니다.');
  });
});

describe('analyzeFoodPreference', () => {
  it('음식 취향 분석 API의 data를 반환한다', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          matchedCategories: [{ id: 'c1', name: '한식' }],
          unmatchedText: '매콤한 국물',
        },
      }),
    });

    const result = await analyzeFoodPreference('  한식 좋아하고 매콤한 국물 좋아요  ', 'LIKE', {
      baseUrl: 'http://localhost:8080',
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:8080/api/users/me/food-preferences/analyze',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      text: '한식 좋아하고 매콤한 국물 좋아요',
      polarity: 'LIKE',
    });
    expect(result).toEqual({
      matchedCategories: [{ id: 'c1', name: '한식' }],
      unmatchedText: '매콤한 국물',
    });
  });
});
