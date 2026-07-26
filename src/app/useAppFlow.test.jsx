import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createVoteSession } from '../services/voteSessionApi';
import { closeMenuVote, getMenuCandidates, startMenuRecommendation, submitMenuVote } from '../services/menuCandidateApi';
import { createGroup as createGroupRequest, listGroups, updateGroup } from '../services/groupApi';
import { createInviteLink, getInvite, joinInvite } from '../services/inviteApi';
import { getMe, submitOnboarding, updateFoodSettings } from '../services/userApi';
import { exchangeOAuthCode } from '../services/authApi';
import { useAppFlow } from './useAppFlow';

vi.mock('../services/voteSessionApi', () => ({ createVoteSession: vi.fn() }));
vi.mock('../services/authApi', () => ({
  exchangeOAuthCode: vi.fn(),
  refreshToken: vi.fn().mockResolvedValue({ accessToken: 'refreshed-token' }),
  logout: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../services/menuCandidateApi', () => ({
  getMenuCandidates: vi.fn(),
  startMenuRecommendation: vi.fn(),
  submitMenuVote: vi.fn(),
  closeMenuVote: vi.fn(),

}));
vi.mock('../services/groupApi', () => ({
  createGroup: vi.fn(), listGroups: vi.fn(), updateGroup: vi.fn(),
}));
vi.mock('../services/inviteApi', () => ({
  createInviteLink: vi.fn(), getInvite: vi.fn(), joinInvite: vi.fn(),
}));
vi.mock('../services/userApi', () => ({
  getMe: vi.fn(), getFoodSettings: vi.fn().mockRejectedValue(new Error('설정 없음')),
  submitOnboarding: vi.fn(), updateFoodSettings: vi.fn(),
}));

beforeEach(() => {
  exchangeOAuthCode.mockResolvedValue({ accessToken: 'issued-token', userStatus: 'ACTIVE', redirectPath: '/' });
  getMe.mockResolvedValue({ name: '테스트 사용자', status: 'ACTIVE' });
  listGroups.mockResolvedValue({ content: [] });
  createInviteLink.mockResolvedValue({ inviteCode: 'SERVER1', inviteUrl: 'http://localhost/invite/SERVER1' });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('useAppFlow 백엔드 플로우', () => {
  it('mock 모드는 백엔드를 호출하지 않고 기존 그룹·투표 흐름을 유지한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'mock');
    const { result } = renderHook(() => useAppFlow());
    act(() => result.current.setDraft((draft) => ({ ...draft, name: 'Mock 모임' })));

    await act(async () => result.current.createGroup());
    await act(async () => result.current.startVote());

    expect(createGroupRequest).not.toHaveBeenCalled();
    expect(createVoteSession).not.toHaveBeenCalled();
    expect(result.current.groups[0].name).toBe('Mock 모임');
    expect(result.current.step).toBe('recommend');
    expect(result.current.voteStartStatus).toBe('mock');
  });

  it('OAuth 리다이렉트 코드를 교환하고 로그인 상태를 복구한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.history.replaceState({}, '', '/home?code=oauth-code');
    const { result } = renderHook(() => useAppFlow());

    await waitFor(() => expect(exchangeOAuthCode).toHaveBeenCalledWith('oauth-code'));
    await waitFor(() => expect(result.current.loggedIn).toBe(true));

    expect(result.current.step).toBe('home');
    expect(window.location.pathname).toBe('/');
  });

  it('REST 세션 생성과 추천 요청 후 서버 후보를 화면에 반영한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-1', status: 'PREFERENCE_INPUT' });
    startMenuRecommendation.mockResolvedValue(null);
    getMenuCandidates.mockResolvedValue([{
        voteCandidateId: 'candidate-1', menuId: 'menu-1', menuName: '김치찌개', categoryName: '한식',
        imageUrl: null, counts: { go: 2, maybe: 1, no: 0 }, resultStatus: 'PENDING', description: '따뜻한 국물',
      }]);
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());

    expect(createVoteSession).toHaveBeenCalledWith('group-1', expect.objectContaining({ title: expect.any(String) }), { accessToken: 'access-token' });
    expect(startMenuRecommendation).toHaveBeenCalledWith('group-1', 'session-1');
    expect(getMenuCandidates).toHaveBeenCalledWith('group-1', 'session-1');
    expect(result.current.voteSessionId).toBe('session-1');
    expect(result.current.menus[0]).toEqual(expect.objectContaining({ id: 'candidate-1', menuId: 'menu-1', name: '김치찌개' }));
    expect(result.current.voteStartStatus).toBe('connected');
    expect(result.current.step).toBe('recommend');
  });

  it('hybrid 모드는 서버 리소스 생성 전 실패만 mock으로 대체한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'hybrid');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockRejectedValue(new Error('백엔드 연결 실패'));
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());

    expect(result.current.step).toBe('recommend');
    expect(result.current.voteStartStatus).toBe('mock');
    expect(result.current.voteStartError).toContain('mock 데이터');
  });

  it('세션 생성 후 추천 실패는 hybrid에서도 숨기지 않고 같은 화면에 오류를 표시한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'hybrid');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.localStorage.setItem('galae-state-v4', JSON.stringify({ loggedIn: true, step: 'home' }));
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-1' });
    startMenuRecommendation.mockRejectedValue(new Error('추천 시작 실패'));
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());

    expect(result.current.step).toBe('home');
    expect(result.current.voteSessionId).toBe('session-1');
    expect(result.current.voteStartStatus).toBe('failed');
    expect(result.current.voteStartError).toBe('추천 시작 실패');
  });

  it('서버 후보에 대한 투표와 방장 마감을 REST로 반영한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-1' });
    startMenuRecommendation.mockResolvedValue(null);
    getMenuCandidates.mockResolvedValue([{
      voteCandidateId: 'candidate-1', menuId: 'menu-1', menuName: '김치찌개', categoryName: '한식',
      counts: { go: 0, maybe: 0, no: 0 }, description: '따뜻한 국물',
    }]);
    submitMenuVote.mockResolvedValue({ counts: { go: 1, maybe: 0, no: 0 } });
    closeMenuVote.mockResolvedValue([{
      candidateId: 'candidate-1', goCount: 1, maybeCount: 0, noCount: 0, result: 'CONFIRMED',
    }]);
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());
    await act(async () => result.current.voteMenu('like'));
    await act(async () => result.current.closeMenuVoting());

    expect(submitMenuVote).toHaveBeenCalledWith('group-1', 'session-1', 'candidate-1', 'like');
    expect(closeMenuVote).toHaveBeenCalledWith('group-1', 'session-1');
    expect(result.current.menuVotes['candidate-1'].like).toBe(1);
    expect(result.current.candidateIds).toEqual(['candidate-1']);
  });

  it('그룹 생성 응답을 활성 그룹과 화면 목록에 반영하고 서버 초대를 만든다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createGroupRequest.mockResolvedValue({
      groupId: 'group-2', name: '서버 모임', locationAddress: '서울 강남구', latitude: 37.5, longitude: 127,
      searchRadiusM: 2000, recommendationTime: '18:00', maxMemberCount: 4, memberCount: 1,
    });
    const { result } = renderHook(() => useAppFlow());
    act(() => result.current.setDraft((draft) => ({ ...draft, name: '서버 모임', destination: '서울 강남구' })));

    await act(async () => result.current.createGroup());

    expect(createGroupRequest).toHaveBeenCalledWith(expect.objectContaining({
      name: '서버 모임', locationAddress: '서울 강남구', searchRadiusM: 2000, recommendationTime: '18:00', maxMemberCount: 4,
    }));
    expect(createInviteLink).toHaveBeenCalledWith('group-2');
    expect(result.current.activeGroupId).toBe('group-2');
    expect(result.current.groups[0]).toEqual(expect.objectContaining({ groupId: 'group-2', name: '서버 모임' }));
    expect(result.current.inviteUrl).toBe('http://localhost/invite/SERVER1');
    expect(result.current.step).toBe('invite');
  });

  it('초대 조회와 가입 결과를 활성 그룹에 반영한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    window.history.replaceState({}, '', '/invite/JOIN1');
    getInvite.mockResolvedValue({ inviteCode: 'JOIN1', groupId: 'group-3', groupName: '가입 모임', memberCount: 2, maxMemberCount: 4, joinable: true });
    joinInvite.mockResolvedValue({ groupId: 'group-3', role: 'MEMBER', status: 'ACTIVE' });
    const { result } = renderHook(() => useAppFlow());

    await waitFor(() => expect(getInvite).toHaveBeenCalledWith('JOIN1'));
    await waitFor(() => expect(result.current.loggedIn).toBe(true));
    await act(async () => result.current.joinGroup());

    expect(joinInvite).toHaveBeenCalledWith('JOIN1');
    expect(result.current.activeGroupId).toBe('group-3');
    expect(result.current.step).toBe('dashboard');
  });

  it('온보딩 완료 시 선택 내용을 백엔드 설정 계약으로 제출한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    submitOnboarding.mockResolvedValue({ onboardingCompleted: true, status: 'ACTIVE' });
    const { result } = renderHook(() => useAppFlow());
    act(() => {
      result.current.setAllergens(['우유']);
      result.current.setLikeMenus(['김치찌개']);
      result.current.setDislikeMenus(['마라탕']);
    });

    await act(async () => result.current.completeOnboarding());

    expect(submitOnboarding).toHaveBeenCalledWith({
      termsAgreed: true,
      userSetting: expect.objectContaining({
        allergenIds: [], preferredMenuIds: [], excludedMenuIds: [],
        allergenText: '우유', preferredText: '김치찌개', excludedText: '마라탕',
      }),
    });
    expect(result.current.step).toBe('home');
  });

  it('취향 수정 완료는 백엔드 사용자 설정을 갱신한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    updateFoodSettings.mockResolvedValue({});
    const { result } = renderHook(() => useAppFlow());
    act(() => result.current.setLikeMenus(['초밥']));

    await act(async () => result.current.savePreferences());

    expect(updateFoodSettings).toHaveBeenCalledWith(expect.objectContaining({ preferredText: '초밥' }));
    expect(result.current.prefsOpen).toBe(false);
  });

  it('그룹 설정 저장은 현재 활성 그룹을 수정한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    updateGroup.mockResolvedValue({ groupId: 'group-1', name: '수정 모임' });
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.saveGroupSettings());

    expect(updateGroup).toHaveBeenCalledWith('group-1', expect.objectContaining({ recommendationTime: '18:00' }));
    expect(result.current.step).toBe('dashboard');
  });
});
