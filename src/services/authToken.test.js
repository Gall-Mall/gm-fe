import { afterEach, describe, expect, it } from 'vitest';
import { clearAccessToken, getAccessToken, setAccessToken } from './authToken';

describe('authToken', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('access token은 브라우저 탭 세션에만 저장한다', () => {
    setAccessToken('access-token');

    expect(window.sessionStorage.getItem('gm-access-token')).toBe('access-token');
    expect(window.localStorage.length).toBe(0);
    expect(getAccessToken()).toBe('access-token');

    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
