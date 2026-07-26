import { apiRequest } from './apiClient';

export function getMe(options = {}) {
  return apiRequest('/api/users/me', { failMessage: '내 정보를 불러오지 못했습니다.', ...options });
}

export function submitOnboarding(request, options = {}) {
  return apiRequest('/api/users/me/onboarding', {
    method: 'POST', body: request, failMessage: '온보딩 정보를 저장하지 못했습니다.', ...options,
  });
}

export function getFoodSettings(options = {}) {
  return apiRequest('/api/users/me/food-settings', { failMessage: '취향 설정을 불러오지 못했습니다.', ...options });
}

export function updateFoodSettings(request, options = {}) {
  return apiRequest('/api/users/me/food-settings', {
    method: 'PUT', body: request, failMessage: '취향 설정을 저장하지 못했습니다.', ...options,
  });
}
