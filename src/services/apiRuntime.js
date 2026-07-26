import { getAccessToken as readAccessToken, setAccessToken as writeAccessToken } from './authToken';

export const API_MODE = Object.freeze({
  MOCK: 'mock',
  HYBRID: 'hybrid',
  REAL: 'real',
});


export function resolveApiMode(value = import.meta.env.VITE_API_MODE) {
  const normalized = String(value || '').trim().toLowerCase();
  return Object.values(API_MODE).includes(normalized) ? normalized : API_MODE.HYBRID;
}

export function getAccessToken() {
  return readAccessToken() || '';
}

export function setAccessToken(accessToken) {
  writeAccessToken(accessToken);
}

export async function runWithApiFallback({ mode, realAction, mockAction }) {
  if (mode === API_MODE.MOCK) {
    return { source: 'mock', data: await mockAction(), fallbackReason: null };
  }

  try {
    return { source: 'real', data: await realAction(), fallbackReason: null };
  } catch (error) {
    if (mode === API_MODE.REAL) throw error;
    return {
      source: 'mock',
      data: await mockAction(),
      fallbackReason: error instanceof Error ? error.message : '실제 API 연결에 실패했습니다.',
    };
  }
}
