import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './apiClient';
import { getAccessToken, setAccessToken } from './authToken';

function response({ ok, status, body }) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

describe('apiRequest', () => {
  afterEach(() => window.sessionStorage.clear());

  it('보호 API에 Bearer 토큰과 쿠키 자격 증명을 보낸다', async () => {
    setAccessToken('access-token');
    const fetcher = vi.fn().mockResolvedValue(response({ ok: true, status: 200, body: { data: { ok: true } } }));

    await apiRequest('/api/users/me', { baseUrl: 'http://localhost:8080', fetcher });

    expect(fetcher).toHaveBeenCalledWith('http://localhost:8080/api/users/me', expect.objectContaining({
      credentials: 'include',
      headers: { Authorization: 'Bearer access-token' },
    }));
  });

  it('만료된 Access Token은 refresh 후 한 번만 재시도한다', async () => {
    setAccessToken('expired-token');
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response({ ok: false, status: 401, body: { message: '만료' } }))
      .mockResolvedValueOnce(response({ ok: true, status: 200, body: { data: { accessToken: 'fresh-token' } } }))
      .mockResolvedValueOnce(response({ ok: true, status: 200, body: { data: { name: '새 토큰 사용자' } } }));

    const result = await apiRequest('/api/users/me', { baseUrl: 'http://localhost:8080', fetcher });

    expect(fetcher).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/auth/token/refresh', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: {},
    }));
    expect(fetcher.mock.calls[2][1].headers.Authorization).toBe('Bearer fresh-token');
    expect(getAccessToken()).toBe('fresh-token');
    expect(result).toEqual({ name: '새 토큰 사용자' });
  });
});
