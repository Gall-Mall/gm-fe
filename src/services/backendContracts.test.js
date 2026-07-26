import { afterEach, describe, expect, it, vi } from 'vitest';
import { exchangeOAuthCode } from './authApi';
import { createGroup, getGroup, listGroups, updateGroup } from './groupApi';
import { createInviteLink, getInvite, joinInvite } from './inviteApi';
import {
  getFoodSettings,
  submitOnboarding,
  updateFoodSettings,
} from './userApi';
import {
  closeMenuVote,
  getMenuCandidates,
  startMenuRecommendation,

  submitMenuVote,
} from './menuCandidateApi';

const BASE = 'http://localhost:8080';

function successfulFetcher(data = { ok: true }) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ data }),
  });
}

describe('backend REST contracts', () => {
  afterEach(() => window.sessionStorage.clear());

  it('OAuth 교환 코드를 토큰으로 바꾸고 탭 세션에 저장한다', async () => {
    const fetcher = successfulFetcher({ accessToken: 'issued-token', userStatus: 'ACTIVE', redirectPath: '/' });

    await exchangeOAuthCode('oauth-code', { baseUrl: BASE, fetcher });

    expect(fetcher).toHaveBeenCalledWith(`${BASE}/api/auth/token`, expect.objectContaining({
      method: 'POST', body: JSON.stringify({ code: 'oauth-code' }), credentials: 'include',
    }));
    expect(window.sessionStorage.getItem('gm-access-token')).toBe('issued-token');
  });

  it('온보딩과 사용자 설정 API 계약을 사용한다', async () => {
    const fetcher = successfulFetcher();
    const userSetting = {
      allergenIds: [], preferredMenuIds: [], excludedMenuIds: [],
      preferredCategoryIds: [], excludedCategoryIds: [],
      allergenText: '', preferredText: '', excludedText: '',
    };

    await submitOnboarding({ termsAgreed: true, userSetting }, { baseUrl: BASE, fetcher });
    await getFoodSettings({ baseUrl: BASE, fetcher });
    await updateFoodSettings(userSetting, { baseUrl: BASE, fetcher });

    expect(fetcher.mock.calls.map(([url, options]) => [url, options.method])).toEqual([
      [`${BASE}/api/users/me/onboarding`, 'POST'],
      [`${BASE}/api/users/me/food-settings`, 'GET'],
      [`${BASE}/api/users/me/food-settings`, 'PUT'],
    ]);
  });

  it('그룹 목록·생성·상세·수정 API 계약을 사용한다', async () => {
    const fetcher = successfulFetcher();
    const group = { name: '모임', locationAddress: '강남', latitude: 37.5, longitude: 127, searchRadiusM: 2000, recommendationTime: '18:00', maxMemberCount: 4 };

    await listGroups({ baseUrl: BASE, fetcher });
    await createGroup(group, { baseUrl: BASE, fetcher });
    await getGroup('group-id', { baseUrl: BASE, fetcher });
    await updateGroup('group-id', group, { baseUrl: BASE, fetcher });

    expect(fetcher.mock.calls.map(([url, options]) => [url, options.method])).toEqual([
      [`${BASE}/api/groups?page=0&size=20`, 'GET'],
      [`${BASE}/api/groups`, 'POST'],
      [`${BASE}/api/groups/group-id`, 'GET'],
      [`${BASE}/api/groups/group-id`, 'PUT'],
    ]);
  });

  it('초대 생성·조회·가입 API 계약을 사용한다', async () => {
    const fetcher = successfulFetcher();

    await createInviteLink('group-id', { baseUrl: BASE, fetcher });
    await getInvite('invite-code', { baseUrl: BASE, fetcher });
    await joinInvite('invite-code', { baseUrl: BASE, fetcher });

    expect(fetcher.mock.calls.map(([url, options]) => [url, options.method])).toEqual([
      [`${BASE}/api/groups/group-id/invites`, 'POST'],
      [`${BASE}/api/invites/invite-code`, 'GET'],
      [`${BASE}/api/invites/invite-code/members`, 'POST'],
    ]);
  });

  it('메뉴 추천·후보조회·투표·마감 API 계약을 사용한다', async () => {
    const fetcher = successfulFetcher();
    const ids = ['group-id', 'session-id'];

    await startMenuRecommendation(...ids, { baseUrl: BASE, fetcher });
    await getMenuCandidates(...ids, { baseUrl: BASE, fetcher });
    await submitMenuVote(...ids, 'candidate-id', 'like', { baseUrl: BASE, fetcher });
    await closeMenuVote(...ids, { baseUrl: BASE, fetcher });


    const calls = fetcher.mock.calls.map(([url, options]) => [url, options.method, options.body]);
    expect(calls).toEqual([
      [`${BASE}/api/groups/group-id/vote-sessions/session-id/recommendations`, 'POST', undefined],
      [`${BASE}/api/groups/group-id/vote-sessions/session-id/menu-candidates`, 'GET', undefined],
      [`${BASE}/api/groups/group-id/vote-sessions/session-id/menu-candidates/candidate-id/vote`, 'POST', JSON.stringify({ choice: 'GO' })],
      [`${BASE}/api/groups/group-id/vote-sessions/session-id/menu-candidates/close`, 'PUT', undefined],
    ]);
  });
});
