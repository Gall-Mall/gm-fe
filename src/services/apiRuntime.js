import { getAccessToken as readAccessToken, setAccessToken as writeAccessToken } from './authToken';

export const API_MODE = Object.freeze({
  MOCK: 'mock',
  HYBRID: 'hybrid',
  REAL: 'real',
});


export function resolveApiMode(value = import.meta.env.VITE_API_MODE) {
  void value;
  return API_MODE.REAL;
}

export function getAccessToken() {
  return readAccessToken() || '';
}

export function setAccessToken(accessToken) {
  writeAccessToken(accessToken);
}

export async function runWithApiFallback({ realAction }) {
  return { source: 'real', data: await realAction(), fallbackReason: null };
}
