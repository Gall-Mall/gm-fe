import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createVoteSession } from '../services/voteSessionApi';
import {
  closeMenuVote,
  getMenuCandidates,
  getVoteState,
  reRecommendMenu,
  selectFinalMenu,
  startMenuRecommendation,
  submitFinalMenuVote,
  submitMenuVote,
} from '../services/menuCandidateApi';
import { subscribeVoteSession } from '../services/voteSessionSocket';
import {
  createGroup as createGroupRequest,
  deleteGroup as deleteGroupRequest,
  getGroup,
  listGroups,
  updateGroup,
} from '../services/groupApi';
import { createInviteLink, getInvite, joinInvite } from '../services/inviteApi';
import { getFoodSettings, getMe, submitOnboarding, updateFoodSettings } from '../services/userApi';
import { exchangeOAuthCode } from '../services/authApi';
import { listStores, searchStores, selectStore } from '../services/storeApi';
import { getPreviousVoteSession, listPreviousGroups } from '../services/historyApi';
import { analyzeAllergen, analyzeFoodPreference } from '../services/preferencesApi';
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
  getVoteState: vi.fn(),
  submitFinalMenuVote: vi.fn(),
  selectFinalMenu: vi.fn(),
  reRecommendMenu: vi.fn(),

}));
vi.mock('../services/voteSessionSocket', () => ({
  subscribeVoteSession: vi.fn(),
}));
vi.mock('../services/groupApi', () => ({
  createGroup: vi.fn(), deleteGroup: vi.fn(), getGroup: vi.fn(), listGroups: vi.fn(), updateGroup: vi.fn(),
}));
vi.mock('../services/inviteApi', () => ({
  createInviteLink: vi.fn(), getInvite: vi.fn(), joinInvite: vi.fn(),
}));
vi.mock('../services/userApi', () => ({
  getMe: vi.fn(), getFoodSettings: vi.fn().mockRejectedValue(new Error('설정 없음')),
  submitOnboarding: vi.fn(), updateFoodSettings: vi.fn(),
}));
vi.mock('../services/storeApi', () => ({
  searchStores: vi.fn(), listStores: vi.fn(), selectStore: vi.fn(),
}));
vi.mock('../services/historyApi', () => ({
  listPreviousGroups: vi.fn(), getPreviousVoteSession: vi.fn(),
}));
vi.mock('../services/preferencesApi', () => ({
  analyzeAllergen: vi.fn(),
  analyzeFoodPreference: vi.fn(),
}));

beforeEach(() => {
  exchangeOAuthCode.mockResolvedValue({ accessToken: 'issued-token', userStatus: 'ACTIVE', redirectPath: '/' });
  getMe.mockResolvedValue({ name: '테스트 사용자', status: 'ACTIVE' });
  listGroups.mockResolvedValue({ content: [] });
  createInviteLink.mockResolvedValue({ inviteCode: 'SERVER1', inviteUrl: 'http://localhost/invite/SERVER1' });
  analyzeAllergen.mockResolvedValue({ standardAllergens: [], customAllergens: [] });
  analyzeFoodPreference.mockResolvedValue({
    matchedMenus: [],
    matchedCategories: [],
    unmatchedText: '',
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('useAppFlow 백엔드 플로우', () => {
  it('백엔드가 생성한 복수형 초대 링크에서 초대 코드를 읽고 정보를 조회한다', async () => {
    window.history.replaceState({}, '', '/invites/ABC123');
    window.localStorage.setItem('galae-state-v5', JSON.stringify({ loggedIn: true, step: 'home' }));
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    getInvite.mockResolvedValue({
      inviteCode: 'ABC123',
      groupName: '점심 모임',
      memberCount: 1,
      maxMemberCount: 6,
      joinable: true,
    });

    const { result } = renderHook(() => useAppFlow());

    expect(result.current.inviteCode).toBe('ABC123');
    expect(result.current.step).toBe('invite');
    await waitFor(() => expect(getInvite).toHaveBeenCalledWith('ABC123'));
  });

  it('초대 링크에서 시작한 OAuth 로그인이 끝나면 같은 초대 화면으로 복귀한다', async () => {
    window.history.replaceState({}, '', '/invites/LOGIN1');
    const beforeLogin = renderHook(() => useAppFlow());
    beforeLogin.unmount();

    exchangeOAuthCode.mockImplementation(async () => {
      window.sessionStorage.setItem('gm-access-token', 'issued-token');
      return { accessToken: 'issued-token', userStatus: 'ACTIVE', redirectPath: '/home' };
    });
    getInvite.mockResolvedValue({
      inviteCode: 'LOGIN1',
      groupName: '저녁 모임',
      memberCount: 2,
      maxMemberCount: 6,
      joinable: true,
    });
    window.history.replaceState({}, '', '/home?code=oauth-code');

    const { result } = renderHook(() => useAppFlow());

    await waitFor(() => expect(result.current.loggedIn).toBe(true));
    await waitFor(() => expect(result.current.step).toBe('invite'));
    expect(result.current.inviteCode).toBe('LOGIN1');
    await waitFor(() => expect(getInvite).toHaveBeenCalledWith('LOGIN1'));
  });

  it('초대 가입에 성공하면 초대 경로를 제거하고 그룹 대시보드로 이동한다', async () => {
    window.history.replaceState({}, '', '/invites/JOIN12');
    window.localStorage.setItem('galae-state-v5', JSON.stringify({ loggedIn: true, step: 'home' }));
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    getInvite.mockResolvedValue({
      inviteCode: 'JOIN12',
      groupName: '가입할 모임',
      memberCount: 1,
      maxMemberCount: 6,
      joinable: true,
    });
    joinInvite.mockResolvedValue({ groupId: 'group-joined' });
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.joinGroup());

    expect(joinInvite).toHaveBeenCalledWith('JOIN12');
    expect(result.current.activeGroupId).toBe('group-joined');
    expect(result.current.step).toBe('dashboard');
    expect(window.location.pathname).toBe('/');
  });

  it('활성 그룹을 삭제하면 그룹 목록으로 이동한다', async () => {
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    deleteGroupRequest.mockResolvedValue(null);
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.deleteActiveGroup());

    expect(deleteGroupRequest).toHaveBeenCalledWith('group-1');
    expect(result.current.activeGroupId).toBeNull();
    expect(result.current.step).toBe('groups');
  });

  it('해당 그룹 기록 화면으로 이동하면 지난 식사를 그 그룹만 표시한다', async () => {
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    listPreviousGroups.mockResolvedValue({
      previous: [
        { groupId: 'group-1', name: '수정사항', voteSessions: [] },
        { groupId: 'group-2', name: '멀티캠퍼스', voteSessions: [] },
      ],
    });
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.loadHistory());
    act(() => result.current.openGroupHistory('group-1'));

    expect(result.current.step).toBe('archive');
    expect(result.current.archiveGroups.map((group) => group.groupId)).toEqual(['group-1']);
  });

  it('mock 설정이어도 seed 그룹·멤버·메뉴·식당을 실행 상태에 적용하지 않는다', () => {
    vi.stubEnv('VITE_API_MODE', 'mock');
    const { result } = renderHook(() => useAppFlow());

    expect(result.current.groups).toEqual([]);
    expect(result.current.members).toEqual([]);
    expect(result.current.menus).toEqual([]);
    expect(result.current.restaurantCandidates).toEqual([]);
  });

  it('앱 초기화가 중복 실행돼도 OAuth 일회용 코드를 한 번만 교환한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.history.replaceState({}, '', '/home?code=oauth-code');
    const first = renderHook(() => useAppFlow());
    const second = renderHook(() => useAppFlow());

    await waitFor(() => expect(first.result.current.loggedIn).toBe(true));
    await waitFor(() => expect(second.result.current.loggedIn).toBe(true));

    expect(exchangeOAuthCode).toHaveBeenCalledTimes(1);
    expect(exchangeOAuthCode).toHaveBeenCalledWith('oauth-code');
    expect(first.result.current.step).toBe('home');
    expect(second.result.current.step).toBe('home');
    expect(window.location.pathname).toBe('/');
  });

  it('OAuth 성공 응답에 화면 경로가 없어도 백엔드 리다이렉트 경로대로 온보딩을 연다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    exchangeOAuthCode.mockResolvedValue({
      tokenType: 'Bearer',
      accessToken: 'issued-token',
      expiresIn: 3600,
    });
    window.history.replaceState({}, '', '/onboarding?code=oauth-code');
    const { result } = renderHook(() => useAppFlow());

    await waitFor(() => expect(result.current.loggedIn).toBe(true));

    expect(result.current.step).toBe('onboarding');
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

  it('추천 후보를 2초 간격으로 조회하다 준비되면 투표 화면을 연다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-slow', status: 'PREFERENCE_INPUT' });
    startMenuRecommendation.mockResolvedValue(null);
    getMenuCandidates.mockResolvedValueOnce([]);
    getMenuCandidates.mockResolvedValueOnce([{
      voteCandidateId: 'candidate-slow',
      menuId: 'menu-slow',
      menuName: '된장찌개',
      categoryName: '한식',
      imageUrl: null,
      counts: { go: 0, maybe: 0, no: 0 },
      resultStatus: 'PENDING',
      description: '느리게 준비된 추천',
    }]);
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());

    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
    expect(getMenuCandidates).toHaveBeenCalledTimes(2);
    expect(result.current.voteStartStatus).toBe('connected');
    expect(result.current.step).toBe('recommend');
  });

  it('hybrid 설정이어도 서버 세션 생성 실패를 mock으로 대체하지 않는다', async () => {
    vi.stubEnv('VITE_API_MODE', 'hybrid');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockRejectedValue(new Error('백엔드 연결 실패'));
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());

    expect(result.current.step).not.toBe('recommend');
    expect(result.current.voteStartStatus).toBe('failed');
    expect(result.current.voteStartError).toBe('백엔드 연결 실패');
  });

  it('세션 생성 후 추천 실패는 hybrid에서도 숨기지 않고 같은 화면에 오류를 표시한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'hybrid');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.localStorage.setItem('galae-state-v5', JSON.stringify({ loggedIn: true, step: 'home' }));
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
    getMenuCandidates.mockResolvedValue([
      {
        voteCandidateId: 'candidate-1', menuId: 'menu-1', menuName: '김치찌개', categoryName: '한식',
        counts: { go: 0, maybe: 0, no: 0 }, description: '따뜻한 국물',
      },
      {
        voteCandidateId: 'candidate-2', menuId: 'menu-2', menuName: '비빔밥', categoryName: '한식',
        counts: { go: 0, maybe: 0, no: 0 }, description: '채소 메뉴',
      },
    ]);
    submitMenuVote.mockResolvedValue({ counts: { go: 1, maybe: 0, no: 0 } });
    closeMenuVote.mockResolvedValue([
      {
        candidateId: 'candidate-1', goCount: 1, maybeCount: 0, noCount: 0, result: 'CONFIRMED',
      },
      {
        candidateId: 'candidate-2', goCount: 0, maybeCount: 0, noCount: 1, result: 'REJECTED',
      },
    ]);
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());
    await act(async () => result.current.voteMenu('like'));
    await act(async () => result.current.closeMenuVoting());

    expect(submitMenuVote).toHaveBeenCalledWith('group-1', 'session-1', 'candidate-1', 'like');
    expect(closeMenuVote).toHaveBeenCalledWith('group-1', 'session-1');
    expect(result.current.menuVotes['candidate-1'].like).toBe(1);
    expect(result.current.candidateIds).toEqual(['candidate-1']);
    expect(result.current.step).toBe('roundresult');
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
    expect(result.current.step).toBe('dashboard');
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

  it('음식 취향 입력 종류를 분석 API 극성으로 변환하고 카테고리를 구분한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    analyzeFoodPreference
      .mockResolvedValueOnce({
        matchedMenus: [{ id: 'menu-1', name: '부리또' }],
        matchedCategories: [{ id: 'category-1', name: '멕시코식' }],
        unmatchedText: '',
      })
      .mockResolvedValueOnce({
        matchedMenus: [{ id: 'menu-2', name: '라면' }],
        matchedCategories: [],
        unmatchedText: '',
      });
    const { result } = renderHook(() => useAppFlow());

    let likes;
    let exclusions;
    await act(async () => {
      likes = await result.current.analyzeText('like', '멕시코식과 부리또가 좋아요');
      exclusions = await result.current.analyzeText('dislike', '면요리는 싫고 국물은 좋아요');
    });

    expect(analyzeFoodPreference).toHaveBeenNthCalledWith(
      1,
      '멕시코식과 부리또가 좋아요',
      'LIKE',
    );
    expect(analyzeFoodPreference).toHaveBeenNthCalledWith(
      2,
      '면요리는 싫고 국물은 좋아요',
      'EXCLUDE',
    );
    expect(likes).toEqual([
      { id: 'menu-1', name: '부리또', kind: '메뉴' },
      { id: 'category-1', name: '멕시코식', kind: '카테고리' },
    ]);
    expect(exclusions).toEqual([
      { id: 'menu-2', name: '라면', kind: '메뉴' },
    ]);
  });

  it('분석된 카테고리 id를 메뉴 id와 분리해 저장한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    updateFoodSettings.mockResolvedValue({});
    const { result } = renderHook(() => useAppFlow());
    act(() => {
      result.current.setAiLikes([
        { id: 'menu-like', name: '부리또', kind: '메뉴' },
        { id: 'category-like', name: '멕시코식', kind: '카테고리' },
      ]);
      result.current.setAiExclusions([
        { id: 'menu-exclude', name: '라면', kind: '메뉴' },
        { id: 'category-exclude', name: '면요리', kind: '카테고리' },
      ]);
    });

    await act(async () => result.current.savePreferences());

    expect(updateFoodSettings).toHaveBeenCalledWith(expect.objectContaining({
      preferredMenuIds: ['menu-like'],
      excludedMenuIds: ['menu-exclude'],
      preferredCategoryIds: ['category-like'],
      excludedCategoryIds: ['category-exclude'],
    }));
  });

  it('저장된 메뉴 선택은 체크 상태로 복원하고 자유입력만 AI 분석 칩으로 표시한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    getFoodSettings.mockResolvedValue({
      excludedText: '한식|갈비탕, 고수',
      preferredText: '일식|초밥, 따뜻한 국물',
    });
    const { result } = renderHook(() => useAppFlow());

    await waitFor(() => expect(result.current.dislikeMenus).toContain('한식|갈비탕'));

    expect(result.current.aiExclusions.map((item) => item.name)).toEqual(['고수']);
    expect(result.current.likeMenus).toContain('일식|초밥');
    expect(result.current.aiLikes.map((item) => item.name)).toEqual(['따뜻한 국물']);
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

  it('백엔드 OWNER 역할을 방장 화면 권한으로 반영한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    getGroup.mockResolvedValue({
      groupId: 'group-1',
      name: '방장 모임',
      locationAddress: '서울 강남구',
      currentUserRole: 'OWNER',
      searchRadiusM: 2000,
      maxMemberCount: 4,
    });
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.selectGroup({ groupId: 'group-1' }));

    expect(result.current.isHost).toBe(true);
  });

  it('투표 WebSocket 이벤트를 받으면 REST 기준 상태를 다시 동기화한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-1' });
    startMenuRecommendation.mockResolvedValue(null);
    getMenuCandidates.mockResolvedValue([{
      voteCandidateId: 'candidate-1', menuId: 'menu-1', menuName: '김치찌개',
      counts: { go: 0, maybe: 0, no: 0 },
    }]);
    getVoteState.mockResolvedValue({
      sessionStatus: 'MENU_SELECTION',
      candidates: [
        {
          voteCandidateId: 'candidate-1', menuId: 'menu-1', menuName: '김치찌개',
          counts: { go: 1, maybe: 0, no: 0 }, resultStatus: 'KEPT',
        },
        {
          voteCandidateId: 'candidate-2', menuId: 'menu-2', menuName: '비빔밥',
          counts: { go: 0, maybe: 0, no: 1 }, resultStatus: 'REJECTED',
        },
      ],
      finalMenuVote: { status: 'WAITING', candidateIds: ['candidate-1'] },
      selectedFinalMenu: null,
    });
    let socketEvent;
    const disconnect = vi.fn();
    subscribeVoteSession.mockImplementation(async (_sessionId, onEvent) => {
      socketEvent = onEvent;
      return { disconnect };
    });
    const { result, unmount } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());
    await act(async () => socketEvent({ type: 'MENU_VOTE_CLOSED' }));

    expect(subscribeVoteSession).toHaveBeenCalledWith(
      'session-1',
      expect.any(Function),
      expect.objectContaining({ accessToken: 'access-token' }),
    );
    expect(getVoteState).toHaveBeenCalledWith('group-1', 'session-1');
    expect(result.current.serverSessionStatus).toBe('MENU_SELECTION');
    expect(result.current.finalMenuVote).toEqual(expect.objectContaining({ status: 'WAITING' }));
    expect(result.current.candidateMenus.map((candidate) => candidate.id)).toEqual(['candidate-1']);

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('실제 최종 투표·방장 선택·재추천을 백엔드에 반영한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-1' });
    startMenuRecommendation.mockResolvedValue(null);
    getMenuCandidates.mockResolvedValue([{
      voteCandidateId: 'candidate-1', menuId: 'menu-1', menuName: '김치찌개',
      counts: { go: 1, maybe: 0, no: 0 },
    }]);
    subscribeVoteSession.mockResolvedValue({ disconnect: vi.fn() });
    submitFinalMenuVote.mockResolvedValue({ status: 'WAITING', selectedCandidateId: null, tiedCandidateIds: [] });
    selectFinalMenu.mockResolvedValue({ selectedCandidateId: 'candidate-1', menuId: 'menu-1' });
    reRecommendMenu.mockResolvedValue(null);
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());
    await act(async () => result.current.submitFinalVote('candidate-1'));
    expect(submitFinalMenuVote).toHaveBeenCalledWith('group-1', 'session-1', 'candidate-1');
    expect(result.current.finalMenuVote.status).toBe('WAITING');

    await act(async () => result.current.selectFinalCandidate('candidate-1'));
    expect(selectFinalMenu).toHaveBeenCalledWith('group-1', 'session-1', 'candidate-1');
    expect(result.current.confirmedMenuId).toBe('candidate-1');
    expect(result.current.step).toBe('menuconfirmed');

    getMenuCandidates.mockResolvedValue([{
      voteCandidateId: 'candidate-2', menuId: 'menu-2', menuName: '된장찌개',
      counts: { go: 0, maybe: 0, no: 0 },
    }]);
    await act(async () => result.current.requestReRecommendation());
    expect(reRecommendMenu).toHaveBeenCalledWith('group-1', 'session-1');
  });

  it('재추천 요청을 중복 전송하지 않고 새 후보가 저장될 때까지 기다린다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-1' });
    startMenuRecommendation.mockResolvedValue(null);
    const previous = {
      voteCandidateId: 'candidate-old', menuId: 'menu-old', menuName: '김치찌개',
      counts: { go: 1, maybe: 0, no: 0 },
    };
    const replacement = {
      voteCandidateId: 'candidate-new', menuId: 'menu-new', menuName: '된장찌개',
      counts: { go: 0, maybe: 0, no: 0 },
    };
    getMenuCandidates
      .mockResolvedValueOnce([previous])
      .mockResolvedValueOnce([previous])
      .mockResolvedValue([replacement]);
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    subscribeVoteSession.mockResolvedValue({ disconnect: vi.fn() });
    let finishRequest;
    reRecommendMenu.mockImplementation(() => new Promise((resolve) => {
      finishRequest = resolve;
    }));
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());
    let first;
    let second;
    act(() => {
      first = result.current.requestReRecommendation();
      second = result.current.requestReRecommendation();
    });
    expect(reRecommendMenu).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishRequest();
      await Promise.all([first, second]);
    });

    expect(result.current.menus.map((menu) => menu.id)).toEqual(['candidate-new']);
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
    expect(result.current.recommending).toBe(false);
    expect(result.current.step).toBe('recommend');
  });

  it('실제 식당 검색 결과를 불러오고 방장 확정을 완료한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-1' });
    startMenuRecommendation.mockResolvedValue(null);
    getMenuCandidates.mockResolvedValue([{
      voteCandidateId: 'candidate-1', menuId: 'menu-1', menuName: '김치찌개',
      counts: { go: 1, maybe: 0, no: 0 },
    }]);
    subscribeVoteSession.mockResolvedValue({ disconnect: vi.fn() });
    searchStores.mockResolvedValue(null);
    listStores.mockResolvedValue([{
      externalPlaceId: 'place-1',
      name: '김치식당',
      address: '서울 강남구',
      url: 'https://place.map.kakao.com/place-1',
      longitude: 127,
      latitude: 37.5,
      provider: 'KAKAO',
      distanceM: 120,
    }]);
    selectStore.mockResolvedValue({
      externalPlaceId: 'place-1',
      name: '김치식당',
      address: '서울 강남구',
      distanceM: 120,
    });
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());
    await act(async () => result.current.requestRestaurantSearch(3000));

    expect(searchStores).toHaveBeenCalledWith(expect.objectContaining({
      voteSessionId: 'session-1',
      keyword: '김치찌개',
      radiusM: 3000,
    }));
    expect(listStores).toHaveBeenCalledWith('group-1', 'session-1');
    expect(result.current.restaurantCandidates[0]).toEqual(expect.objectContaining({
      id: 'place-1',
      name: '김치식당',
    }));

    await act(async () => result.current.confirmSchedule('place-1', '18:30'));
    expect(selectStore).toHaveBeenCalledWith('group-1', 'session-1', 'place-1');
    expect(result.current.step).toBe('schedule');
  });

  it('식당 검색 완료가 늦어도 결과가 준비되면 대기 화면을 종료한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-store-slow' });
    startMenuRecommendation.mockResolvedValue(null);
    getMenuCandidates.mockResolvedValue([{
      voteCandidateId: 'candidate-store',
      menuId: 'menu-store',
      menuName: '김치찌개',
      counts: { go: 1, maybe: 0, no: 0 },
    }]);
    subscribeVoteSession.mockResolvedValue({ disconnect: vi.fn() });
    searchStores.mockResolvedValue(null);
    for (let attempt = 0; attempt < 6; attempt += 1) {
      listStores.mockRejectedValueOnce(new Error('검색 중'));
    }
    listStores.mockResolvedValueOnce([{
      externalPlaceId: 'place-slow',
      name: '늦게 도착한 식당',
      address: '서울 강남구',
      longitude: 127,
      latitude: 37.5,
      provider: 'KAKAO',
      distanceM: 150,
    }]);
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());
    await act(async () => result.current.requestRestaurantSearch(3000));

    expect(listStores).toHaveBeenCalledTimes(7);
    expect(result.current.restaurantSearchStatus).toBe('ready');
    expect(result.current.restaurantCandidates[0].name).toBe('늦게 도착한 식당');
  });

  it('이미 완료된 식당 검색은 외부 검색을 다시 요청하지 않고 목록만 복구한다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    vi.stubEnv('VITE_ACTIVE_GROUP_ID', 'group-1');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    createVoteSession.mockResolvedValue({ voteSessionId: 'session-existing-store' });
    startMenuRecommendation.mockResolvedValue(null);
    getMenuCandidates.mockResolvedValue([{
      voteCandidateId: 'candidate-existing-store',
      menuId: 'menu-existing-store',
      menuName: '김치찌개',
      counts: { go: 1, maybe: 0, no: 0 },
    }]);
    subscribeVoteSession.mockResolvedValue({ disconnect: vi.fn() });
    listStores.mockResolvedValue([{
      externalPlaceId: 'place-existing',
      name: '저장된 식당',
      address: '서울 강남구',
      longitude: 127,
      latitude: 37.5,
      provider: 'KAKAO',
      distanceM: 100,
    }]);
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.startVote());
    await act(async () => result.current.refreshRestaurantResults());

    expect(searchStores).not.toHaveBeenCalled();
    expect(result.current.restaurantSearchStatus).toBe('ready');
    expect(result.current.restaurantCandidates[0].name).toBe('저장된 식당');
  });

  it('실제 지난 기록 목록과 상세를 불러온다', async () => {
    vi.stubEnv('VITE_API_MODE', 'real');
    window.sessionStorage.setItem('gm-access-token', 'access-token');
    listPreviousGroups.mockResolvedValue({
      previous: [{
        groupId: 'group-1',
        name: '점심 모임',
        voteSessions: [{
          voteSessionId: 'session-1',
          name: '김치식당',
          address: '서울 강남구',
          goCount: 2,
          maybeCount: 1,
          noCount: 0,
          completedAt: '2026-07-26T18:30:00',
        }],
      }],
    });
    getPreviousVoteSession.mockResolvedValue({
      groupId: 'group-1',
      groupName: '점심 모임',
      voteSessionId: 'session-1',
      name: '김치식당',
      address: '서울 강남구',
      goCount: 2,
      maybeCount: 1,
      noCount: 0,
      menuCandidates: [{
        menuId: 'menu-1',
        name: '김치찌개',
        selected: true,
        goCount: 2,
        maybeCount: 1,
        noCount: 0,
        respondentCount: 3,
      }],
      completedAt: '2026-07-26T18:30:00',
    });
    const { result } = renderHook(() => useAppFlow());

    await act(async () => result.current.loadHistory());
    expect(result.current.historyGroups[0].meals[0].place).toBe('김치식당');

    await act(async () => result.current.openMeal({ voteSessionId: 'session-1' }));
    expect(getPreviousVoteSession).toHaveBeenCalledWith('session-1');
    expect(result.current.selectedMeal.place).toBe('김치식당');
    expect(result.current.selectedMeal.menuCandidates[0].name).toBe('김치찌개');
    expect(result.current.step).toBe('mealdetail');
  });
});
