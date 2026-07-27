import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  API_MODE,
  getAccessToken,
  resolveApiMode,
  runWithApiFallback,
} from './apiRuntime';

describe('API 런타임 모드', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    window.sessionStorage.clear();
  });

  it('설정값과 관계없이 실제 API 전용 모드로 동작한다', () => {
    expect(resolveApiMode()).toBe(API_MODE.REAL);
    expect(resolveApiMode('mock')).toBe(API_MODE.REAL);
    expect(resolveApiMode('hybrid')).toBe(API_MODE.REAL);
  });

  it('개발용 Access Token은 브라우저 세션에서 읽는다', () => {
    window.sessionStorage.setItem('gm-access-token', 'access-token');

    expect(getAccessToken()).toBe('access-token');
  });

  it('hybrid 설정이어도 실제 API 실패를 mock으로 대체하지 않는다', async () => {
    const mockAction = vi.fn();

    await expect(runWithApiFallback({
      mode: API_MODE.HYBRID,
      realAction: vi.fn().mockRejectedValue(new Error('API 실패')),
      mockAction,
    })).rejects.toThrow('API 실패');

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('real 모드에서는 실제 API 오류를 숨기지 않는다', async () => {
    await expect(runWithApiFallback({
      mode: API_MODE.REAL,
      realAction: vi.fn().mockRejectedValue(new Error('API 실패')),
      mockAction: vi.fn(),
    })).rejects.toThrow('API 실패');
  });

  it('mock 설정이어도 실제 API만 호출한다', async () => {
    const realAction = vi.fn().mockResolvedValue('real-result');
    const mockAction = vi.fn();

    const result = await runWithApiFallback({
      mode: API_MODE.MOCK,
      realAction,
      mockAction,
    });

    expect(realAction).toHaveBeenCalledTimes(1);
    expect(mockAction).not.toHaveBeenCalled();
    expect(result).toEqual({ source: 'real', data: 'real-result', fallbackReason: null });
  });
});
