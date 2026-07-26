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

  it('설정이 없으면 실제 API를 시도하고 실패 시 mock을 쓰는 hybrid 모드다', () => {
    expect(resolveApiMode()).toBe(API_MODE.HYBRID);
  });

  it('개발용 Access Token은 브라우저 세션에서 읽는다', () => {
    window.sessionStorage.setItem('gm-access-token', 'access-token');

    expect(getAccessToken()).toBe('access-token');
  });

  it('hybrid 모드에서 실제 API가 실패하면 mock 결과를 반환한다', async () => {
    const mockAction = vi.fn().mockReturnValue('mock-result');

    const result = await runWithApiFallback({
      mode: API_MODE.HYBRID,
      realAction: vi.fn().mockRejectedValue(new Error('API 실패')),
      mockAction,
    });

    expect(result).toEqual({ source: 'mock', data: 'mock-result', fallbackReason: 'API 실패' });
  });

  it('real 모드에서는 실제 API 오류를 숨기지 않는다', async () => {
    await expect(runWithApiFallback({
      mode: API_MODE.REAL,
      realAction: vi.fn().mockRejectedValue(new Error('API 실패')),
      mockAction: vi.fn(),
    })).rejects.toThrow('API 실패');
  });

  it('mock 모드에서는 실제 API를 호출하지 않는다', async () => {
    const realAction = vi.fn();

    const result = await runWithApiFallback({
      mode: API_MODE.MOCK,
      realAction,
      mockAction: () => 'mock-result',
    });

    expect(realAction).not.toHaveBeenCalled();
    expect(result).toEqual({ source: 'mock', data: 'mock-result', fallbackReason: null });
  });
});
