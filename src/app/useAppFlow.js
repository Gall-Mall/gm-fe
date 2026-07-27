import { useEffect, useMemo, useRef, useState } from 'react';
import { menuMaster, menus } from '../data/appData';
import { createVoteSession } from '../services/voteSessionApi';
import {
  closeMenuVote,
  getMenuCandidates,
  getVoteState,
  reRecommendMenu as reRecommendMenuApi,
  selectFinalMenu,
  startMenuRecommendation,
  submitFinalMenuVote,
  submitMenuVote,
} from '../services/menuCandidateApi';
import { subscribeVoteSession } from '../services/voteSessionSocket';
import {
  createGroup as createGroupApi,
  deleteGroup as deleteGroupRequest,
  getGroup,
  listGroups,
  updateGroup,
} from '../services/groupApi';
import { createInviteLink, getInvite, joinInvite } from '../services/inviteApi';
import { exchangeOAuthCode, logout as logoutApi, refreshToken } from '../services/authApi';
import { getFoodSettings, getMe, submitOnboarding, updateFoodSettings } from '../services/userApi';
import { analyzeAllergen, analyzeFoodPreference } from '../services/preferencesApi';
import { API_MODE, getAccessToken, resolveApiMode, runWithApiFallback } from '../services/apiRuntime';
import { listStores, searchStores, selectStore } from '../services/storeApi';
import { getPreviousVoteSession, listPreviousGroups } from '../services/historyApi';

const MENU_CANDIDATE_POLL_INTERVAL_MS = 2000;
const MENU_CANDIDATE_POLL_ATTEMPTS = 30;

// AI 분석은 백엔드 API 결과만 사용한다.
async function analyzeText(kind, text) {
  const t = (text || '').trim();
  if (!t) return [];
  if (!getAccessToken()) {
    throw new Error('로그인 정보가 없어 AI 분석을 요청할 수 없습니다.');
  }
  if (kind === 'allergy') {
    const result = await analyzeAllergen(t);
    return [
      ...(result.standardAllergens || []).map((item) => ({ ...item, kind: '성분' })),
      ...(result.customAllergens || []).map((name) => ({ name, kind: '성분' })),
    ];
  }
  const result = await analyzeFoodPreference(t, kind === 'like' ? 'LIKE' : 'EXCLUDE');
  return [
    ...(result.matchedMenus || []).map((item) => ({ ...item, kind: '메뉴' })),
    ...(result.matchedCategories || []).map((item) => ({ ...item, kind: '카테고리' })),
    ...(result.unmatchedText ? [{ name: result.unmatchedText, kind: '특성' }] : []),
  ];
}

const freshVoteCounts = () => Object.fromEntries(menus.map((m) => [m.id, { ...m.votes }]));

const STORAGE_KEY = 'galae-state-v5';

function loadState() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// 초대 링크 라우팅: /invite/CODE 형태면 코드 반환
function readInviteCode() {
  if (typeof window === 'undefined') return null;
  const m = window.location.pathname.match(/^\/invite\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

// OAuth 로그인 성공 후 백엔드가 회원 상태에 따라 보내는 랜딩 경로.
// ONBOARDING → /onboarding, ACTIVE 등 → /home. 그 외 경로는 null.
function readOAuthLanding() {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path.startsWith('/onboarding')) return 'onboarding';
  if (path.startsWith('/home')) return 'home';
  return null;
}

function readOAuthCode() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('code');
}

const oauthExchangeRequests = new Map();

function exchangeOAuthCodeOnce(code) {
  if (!oauthExchangeRequests.has(code)) {
    const request = exchangeOAuthCode(code)
      .finally(() => oauthExchangeRequests.delete(code));
    oauthExchangeRequests.set(code, request);
  }
  return oauthExchangeRequests.get(code);
}

function backendGroupToView(group) {
  return {
    ...group,
    id: group.groupId,
    city: group.locationAddress,
    date: '진행 중',
    progress: 0,
    status: '준비 중',
    isMine: group.currentUserRole ? group.currentUserRole === 'OWNER' : true,
  };
}

function backendGroupToSettings(group) {
  return {
    name: group.name,
    location: group.locationAddress,
    recTime: group.recommendationTime || '18:00',
    distanceKm: (group.searchRadiusM || 2000) / 1000,
    distanceMode: 'preset',
    distanceText: String((group.searchRadiusM || 2000) / 1000),
    memberTarget: group.maxMemberCount || 4,
    memberCount: group.memberCount || 1,
    lat: group.latitude,
    lng: group.longitude,
  };
}

function backendCandidateToMenu(candidate) {
  return {
    id: candidate.voteCandidateId,
    menuId: candidate.menuId,
    name: candidate.menuName,
    cat: candidate.categoryName || '메뉴',
    image: candidate.imageUrl,
    emoji: candidate.imageUrl ? null : '🍽️',
    score: 90,
    tags: [],
    traits: [],
    reasons: candidate.description ? [candidate.description] : ['그룹 취향을 반영한 추천 메뉴예요.'],
    cautions: [],
    votes: {
      like: candidate.counts?.go || 0,
      maybe: candidate.counts?.maybe || 0,
      dislike: candidate.counts?.no || 0,
    },
    resultStatus: candidate.resultStatus,
  };
}

function isRemainingCandidateResult(resultStatus) {
  return resultStatus === 'CONFIRMED' || resultStatus === 'KEPT';
}

function backendStoreToView(store) {
  return {
    ...store,
    id: store.externalPlaceId,
    city: store.address,
    distance: `${store.distanceM ?? 0}m`,
    meta: store.categoryName || store.provider || '음식점',
    image: null,
    score: 0,
    lat: store.latitude,
    lng: store.longitude,
    votes: { like: 0, maybe: 0, dislike: 0 },
  };
}

function backendHistoryMeal(record, groupName) {
  const completed = record.completedAt ? new Date(record.completedAt) : null;
  return {
    ...record,
    group: groupName,
    place: record.name,
    city: record.address || '위치 정보 없음',
    tag: record.address || '',
    dateLabel: completed && !Number.isNaN(completed.getTime()) ? completed.toLocaleDateString('ko-KR') : '',
    when: completed && !Number.isNaN(completed.getTime()) ? completed.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '',
    like: record.goCount || 0,
    maybe: record.maybeCount || 0,
      dislike: record.noCount || 0,
      menuCandidates: Array.isArray(record.menuCandidates) ? record.menuCandidates : [],
      score: 0,
    img: null,
    note: '',
  };
}

function uniqueText(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))].join(', ');
}

const menuPreferenceKeyByText = new Map();
Object.entries(menuMaster).forEach(([category, menuNames]) => {
  menuPreferenceKeyByText.set(category, category);
  menuNames.forEach((menuName) => {
    const key = `${category}|${menuName}`;
    menuPreferenceKeyByText.set(key, key);
    if (!menuPreferenceKeyByText.has(menuName)) {
      menuPreferenceKeyByText.set(menuName, key);
    }
  });
});

function splitMenuPreferenceText(text) {
  const values = String(text || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const selected = [];
  const custom = [];
  values.forEach((value) => {
    const key = menuPreferenceKeyByText.get(value);
    if (key) {
      selected.push(key);
    } else {
      custom.push(value);
    }
  });
  return { selected: [...new Set(selected)], custom: [...new Set(custom)] };
}

const defaultDraft = {
  name: '', destination: '강남', dateMode: 'fixed',
  dateStart: '', dateEnd: '', dateCasual: '오늘',
  members: 4, purpose: '친구 모임',
  lat: 37.4979, lng: 127.0276, distanceKm: 2, distanceMode: 'preset', distanceText: '2',
};

const defaultGset = {
  name: '', location: '', recTime: '18:00',
  distanceKm: 2, distanceMode: 'preset', distanceText: '2', memberTarget: 4,
  lat: null, lng: null,
};

export function useAppFlow() {
  const saved = useMemo(() => loadState(), []);
  const inviteCode = useMemo(() => readInviteCode(), []);
  const oauthLanding = useMemo(() => readOAuthLanding(), []);
  const oauthCode = useMemo(() => readOAuthCode(), []);
  const apiMode = resolveApiMode();

  // 우선순위: 초대 링크 → OAuth 랜딩(온보딩/메인) → 로그인 상태 시 이전 위치 → 로그인 화면.
  const initialStep = inviteCode
    ? 'invite'
    : oauthLanding
      ? oauthLanding
      : saved.loggedIn
        ? saved.step || 'home'
        : 'login';

  const [step, setStep] = useState(initialStep);
  const [loggedIn, setLoggedIn] = useState(Boolean(saved.loggedIn));
  const [afterLogin, setAfterLogin] = useState(inviteCode ? 'dashboard' : null);


  // 프로필
  const [profile, setProfile] = useState(saved.profile || { name: '나', photo: null });
  const [profileOpen, setProfileOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsTab, setPrefsTab] = useState('allergy');

  // 취향(온보딩 + 마이페이지 공유)
  const [onbStep, setOnbStep] = useState(1);
  const [consent, setConsent] = useState(saved.consent || { service: false, privacy: false, age: false, health: false, logs: false });
  const [allergens, setAllergens] = useState(saved.allergens || []);
  const [aiAllergens, setAiAllergens] = useState(saved.aiAllergens || []);
  const [dislikeMenus, setDislikeMenus] = useState(saved.dislikeMenus || []);
  const [aiExclusions, setAiExclusions] = useState(saved.aiExclusions || []);
  const [likeMenus, setLikeMenus] = useState(saved.likeMenus || []);
  const [aiLikes, setAiLikes] = useState(saved.aiLikes || []);
  const [serverUserSetting, setServerUserSetting] = useState(null);

  // 그룹 생성 draft
  const [draft, setDraft] = useState(saved.draft || defaultDraft);

  // 그룹 설정 / 멤버 / 내 그룹 목록
  const [members, setMembers] = useState([]);
  const [isHost, setIsHost] = useState(saved.isHost ?? true);
  const [gset, setGset] = useState(saved.gset || defaultGset);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(saved.activeGroupId || import.meta.env.VITE_ACTIVE_GROUP_ID || null);
  const [groupDeleteStatus, setGroupDeleteStatus] = useState('idle');
  const [inviteInfo, setInviteInfo] = useState(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [operationError, setOperationError] = useState('');

  // 투표
  const [voteLimitMin, setVoteLimitMin] = useState(saved.voteLimitMin ?? 60);
  const [voteStartedAt, setVoteStartedAt] = useState(saved.voteStartedAt ?? null);
  const [voteKeywords, setVoteKeywords] = useState(saved.voteKeywords || []);
  const [menuVotes, setMenuVotes] = useState({});
  const [myMenuVote, setMyMenuVote] = useState(saved.myMenuVote || {});
  const [currentMenuIdx, setCurrentMenuIdx] = useState(saved.currentMenuIdx ?? 0);
  const [simAllVoted, setSimAllVoted] = useState(saved.simAllVoted || false);
  // 라운드: 이번 투표에 뜬 메뉴 id 목록 / 지난 라운드들의 id 목록
  const [roundIds, setRoundIds] = useState(saved.roundIds || null);
  const [pastRoundIds, setPastRoundIds] = useState(saved.pastRoundIds || []);

  // 라운드 판정 이후: 후보(유지) 메뉴 / 후보 결정 투표 / 최종 확정
  const [candidateIds, setCandidateIds] = useState(saved.candidateIds || []);
  const [decisionChoices, setDecisionChoices] = useState(saved.decisionChoices || {}); // { memberId: choice }
  const [decisionClosed, setDecisionClosed] = useState(saved.decisionClosed || false);
  const [confirmedMenuId, setConfirmedMenuId] = useState(saved.confirmedMenuId ?? null);
  const [decisionMethod, setDecisionMethod] = useState(saved.decisionMethod ?? null); // 'single' | 'finalvote' | 'host'
  const [recommending, setRecommending] = useState(false); // 재추천 로딩

  // 식당(지도 투표) + 검색/그룹목록
  const [selectedId, setSelectedId] = useState(null);
  const [restaurantVotes, setRestaurantVotes] = useState({});
  const [myRestaurantVote, setMyRestaurantVote] = useState(saved.myRestaurantVote || {});
  const [groupRestaurants, setGroupRestaurants] = useState(saved.groupRestaurants || []);
  const [selectedFinalMenuId, setSelectedFinalMenuId] = useState(saved.selectedFinalMenuId ?? null);
  const [savedSchedule, setSavedSchedule] = useState(saved.savedSchedule || null);

  // 지난 식사 상세
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [serverStores, setServerStores] = useState([]);
  const [restaurantSearchStatus, setRestaurantSearchStatus] = useState('idle');
  const [historyGroups, setHistoryGroups] = useState([]);
  const [historyGroupFilterId, setHistoryGroupFilterId] = useState(null);
  const [historyStatus, setHistoryStatus] = useState('idle');

  const [copied, setCopied] = useState('idle');
  const [voteSessionId, setVoteSessionId] = useState(null);
  const [voteStartStatus, setVoteStartStatus] = useState('idle');
  const [voteStartError, setVoteStartError] = useState('');
  const [lastVoteSessionEvent, setLastVoteSessionEvent] = useState(null);
  const [serverMenus, setServerMenus] = useState([]);
  const [serverSessionStatus, setServerSessionStatus] = useState(null);
  const [finalMenuVote, setFinalMenuVote] = useState(null);

  const tick = useRef(null);
  const voteSessionConnection = useRef(null);
  const reRecommendationRequest = useRef(false);
  const [, setNow] = useState(Date.now());

  useEffect(() => () => {
    voteSessionConnection.current?.disconnect();
    voteSessionConnection.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (oauthCode) {
        try {
          const token = await exchangeOAuthCodeOnce(oauthCode);
          if (cancelled) return;
          setLoggedIn(true);
          setStep(oauthLanding || (token.redirectPath === '/onboarding' ? 'onboarding' : 'home'));
        } catch (error) {
          setLoggedIn(false);
          setStep('login');
          setOperationError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
          return;
        }
      }

      if (!oauthCode && !getAccessToken() && saved.loggedIn) {
        try {
          await refreshToken();
        } catch (error) {
          setLoggedIn(false);
          setStep('login');
          setOperationError(error instanceof Error ? error.message : '로그인이 만료되었습니다.');
          return;
        }
      }

      if (getAccessToken()) {
        try {
          const [me, page] = await Promise.all([getMe(), listGroups()]);
          if (cancelled) return;
          setLoggedIn(true);
          setProfile((current) => ({ ...current, name: me.nickname || me.name || current.name }));
          if (Array.isArray(page?.content)) setGroups(page.content.map(backendGroupToView));
          try {
            const setting = await getFoodSettings();
            if (!cancelled) {
              setServerUserSetting(setting);
              if (setting.allergenText) setAiAllergens(setting.allergenText.split(',').map((name) => ({ name: name.trim(), kind: '성분' })).filter((item) => item.name));
              const preferred = splitMenuPreferenceText(setting.preferredText);
              setLikeMenus(preferred.selected);
              setAiLikes(preferred.custom.map((name) => ({ name, kind: '메뉴' })));
              const excluded = splitMenuPreferenceText(setting.excludedText);
              setDislikeMenus(excluded.selected);
              setAiExclusions(excluded.custom.map((name) => ({ name, kind: '메뉴' })));
            }
          } catch {
            // 온보딩 전 사용자는 저장된 취향이 없을 수 있다.
          }
        } catch (error) {
          setOperationError(error instanceof Error ? error.message : '사용자 정보를 불러오지 못했습니다.');
        }
      }

      if (oauthLanding || oauthCode) {
        try {
          window.history.replaceState({}, '', '/');
        } catch {
          /* noop */
        }
      }
    }
    bootstrap();
    return () => { cancelled = true; };
    // OAuth 리다이렉트와 최초 사용자 데이터는 앱 시작 시 한 번만 처리한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inviteCode || !getAccessToken()) return undefined;
    let cancelled = false;
    getInvite(inviteCode)
      .then((info) => {
        if (cancelled) return;
        setInviteInfo(info);
        setGset((current) => ({
          ...current,
          name: info.groupName || current.name,
          memberTarget: info.maxMemberCount || current.memberTarget,
        }));
      })
      .catch((error) => {
        setOperationError(error instanceof Error ? error.message : '초대 정보를 불러오지 못했습니다.');
      });
    return () => { cancelled = true; };
  }, [apiMode, inviteCode]);

  useEffect(() => {
    const el = document.scrollingElement || document.documentElement;
    el.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [step]);

  // 상태 영속화 (새로고침 유지)
  useEffect(() => {
    const snap = {
      step, loggedIn, profile, consent,
      allergens, aiAllergens, dislikeMenus, aiExclusions, likeMenus, aiLikes,
      draft, members, isHost, gset, groups, activeGroupId,
      voteLimitMin, voteStartedAt, voteKeywords, menuVotes, myMenuVote, currentMenuIdx, simAllVoted,
      roundIds, pastRoundIds,
      candidateIds, decisionChoices, decisionClosed, confirmedMenuId, decisionMethod,
      selectedId, restaurantVotes, myRestaurantVote, groupRestaurants, selectedFinalMenuId, savedSchedule,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [
    step, loggedIn, profile, consent,
    allergens, aiAllergens, dislikeMenus, aiExclusions, likeMenus, aiLikes,
    draft, members, isHost, gset, groups, activeGroupId,
    voteLimitMin, voteStartedAt, voteKeywords, menuVotes, myMenuVote, currentMenuIdx, simAllVoted,
    roundIds, pastRoundIds,
    candidateIds, decisionChoices, decisionClosed, confirmedMenuId, decisionMethod,
    selectedId, restaurantVotes, myRestaurantVote, groupRestaurants, selectedFinalMenuId, savedSchedule,
  ]);

  // 투표 카운트다운 타이머
  useEffect(() => {
    if (step === 'recommend' && voteStartedAt) {
      if (!tick.current) tick.current = window.setInterval(() => setNow(Date.now()), 1000);
    }
    return () => {
      if (tick.current && step !== 'recommend') {
        window.clearInterval(tick.current);
        tick.current = null;
      }
    };
  }, [step, voteStartedAt]);

  function goToStep(next) {
    if (next === 'archive') setHistoryGroupFilterId(null);
    setStep(next);
  }

  // 해당 그룹 식사 내역으로 이동
  function openGroupHistory(groupId) {
    setHistoryGroupFilterId(groupId || null);
    setStep('archive');
  }

  function doLogin() {
    setLoggedIn(true);
    if (afterLogin) {
      const t = afterLogin;
      setAfterLogin(null);
      setStep(t);
    } else {
      setOnbStep(1);
      setStep('onboarding');
    }
  }

  function logout() {
    // 서버 세션 종료는 best-effort (실패해도 로컬 로그아웃은 진행)
    logoutApi().catch(() => {});
    setVoteSessionId(null);
    setVoteStartStatus('idle');
    setVoteStartError('');
    setProfileOpen(false);
    setLoggedIn(false);
    setStep('login');
  }

  function buildUserSetting() {
    return {
      allergenIds: [...new Set([...(serverUserSetting?.allergenIds || []), ...aiAllergens.map((item) => item.id).filter(Boolean)])],
      preferredMenuIds: [...new Set([
        ...(serverUserSetting?.preferredMenuIds || []),
        ...aiLikes.filter((item) => item.kind === '메뉴').map((item) => item.id).filter(Boolean),
      ])],
      excludedMenuIds: [...new Set([
        ...(serverUserSetting?.excludedMenuIds || []),
        ...aiExclusions.filter((item) => item.kind === '메뉴').map((item) => item.id).filter(Boolean),
      ])],
      preferredCategoryIds: [...new Set([
        ...(serverUserSetting?.preferredCategoryIds || []),
        ...aiLikes.filter((item) => item.kind === '카테고리').map((item) => item.id).filter(Boolean),
      ])],
      excludedCategoryIds: [...new Set([
        ...(serverUserSetting?.excludedCategoryIds || []),
        ...aiExclusions.filter((item) => item.kind === '카테고리').map((item) => item.id).filter(Boolean),
      ])],
      allergenText: uniqueText([...allergens, ...aiAllergens.map((item) => item.name)]),
      preferredText: uniqueText([...likeMenus, ...aiLikes.map((item) => item.name)]),
      excludedText: uniqueText([...dislikeMenus, ...aiExclusions.map((item) => item.name)]),
    };
  }

  async function completeOnboarding() {
    const mode = resolveApiMode();
    const hasToken = Boolean(getAccessToken());
    if (mode === API_MODE.REAL && !hasToken) {
      setOperationError('로그인 정보가 없어 온보딩을 저장할 수 없습니다.');
      return;
    }
    setOperationError('');
    try {
      await runWithApiFallback({
        mode,
        realAction: () => submitOnboarding({ termsAgreed: true, userSetting: buildUserSetting() }),
      });
      setStep('home');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '온보딩 정보를 저장하지 못했습니다.');
    }
  }

  async function savePreferences() {
    const mode = resolveApiMode();
    const hasToken = Boolean(getAccessToken());
    if (mode === API_MODE.REAL && !hasToken) {
      setOperationError('로그인 정보가 없어 취향을 저장할 수 없습니다.');
      return;
    }
    setOperationError('');
    try {
      await runWithApiFallback({
        mode,
        realAction: () => updateFoodSettings(buildUserSetting()),
      });
      setPrefsOpen(false);
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '취향 설정을 저장하지 못했습니다.');
    }
  }

  async function joinGroup() {
    if (!loggedIn) {
      setAfterLogin('dashboard');
      setStep('login');
      return;
    }

    const mode = resolveApiMode();
    const hasToken = Boolean(getAccessToken());
    if (mode === API_MODE.REAL && (!hasToken || !inviteCode)) {
      setOperationError(!hasToken ? '로그인 정보가 없습니다.' : '초대 코드가 없습니다.');
      return;
    }

    try {
      const result = await runWithApiFallback({
        mode,
        realAction: () => joinInvite(inviteCode),
      });
      const joinedGroupId = result.data?.groupId;
      if (joinedGroupId) setActiveGroupId(joinedGroupId);
      try {
        if (window.location.pathname.startsWith('/invite/')) window.history.replaceState({}, '', '/');
      } catch {
        /* noop */
      }
      setStep('dashboard');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '그룹에 참여하지 못했습니다.');
    }
  }

  function delegateHost(id) {
    setMembers((cur) => cur.map((m) => ({ ...m, role: m.role === 'host' ? 'member' : m.id === id ? 'host' : m.role })));
    setIsHost(false);
  }
  function kickMember(id) {
    setMembers((cur) => cur.filter((m) => m.id !== id));
  }

  function applyLocalGroup(group = null) {
    const name = (draft.name || '').trim() || '새 그룹';
    const location = (draft.destination || '').trim() || '위치 미정';
    const nextSettings = group ? backendGroupToSettings(group) : {
      ...gset, name, location, distanceKm: draft.distanceKm, distanceMode: draft.distanceMode,
      distanceText: draft.distanceText, memberTarget: draft.members, purpose: draft.purpose,
      lat: draft.lat, lng: draft.lng,
    };
    setGset(nextSettings);
    const dateLabel =
      draft.dateMode === 'fixed'
        ? draft.dateStart || '날짜 미정'
        : draft.dateCasual || '날짜 미정';
    const entry = group
      ? backendGroupToView(group)
      : { name, city: location, date: dateLabel, progress: 0, status: '준비 중', isMine: true };
    setGroups((cur) => [entry, ...cur.filter((x) => x.name !== name)]);
    // 새 그룹은 투표/식당/일정 상태를 깨끗하게 시작
    setVoteStartedAt(null);
    setMenuVotes(freshVoteCounts());
    setMyMenuVote({});
    setCurrentMenuIdx(0);
    setSimAllVoted(false);
    setRoundIds(null);
    setPastRoundIds([]);
    setCandidateIds([]);
    setDecisionChoices({});
    setDecisionClosed(false);
    setConfirmedMenuId(null);
    setDecisionMethod(null);
    setSelectedFinalMenuId(null);
    setGroupRestaurants([]);
    setRestaurantVotes({});
    setMyRestaurantVote({});
    setSavedSchedule(null);
  }

  async function createGroup() {
    const mode = resolveApiMode();
    const hasToken = Boolean(getAccessToken());
    if (mode === API_MODE.REAL && !hasToken) {
      setOperationError('로그인 정보가 없어 그룹을 만들 수 없습니다.');
      return;
    }
    setOperationError('');
    const payload = {
      name: (draft.name || '').trim() || '새 그룹',
      locationAddress: (draft.destination || '').trim() || '위치 미정',
      latitude: draft.lat,
      longitude: draft.lng,
      searchRadiusM: Math.round(draft.distanceKm * 1000),
      recommendationTime: gset.recTime || '18:00',
      maxMemberCount: draft.members,
    };
    try {
      const result = await runWithApiFallback({
        mode,
        realAction: () => createGroupApi(payload),
      });
      applyLocalGroup(result.data);
      setActiveGroupId(result.data.groupId);
      try {
        const invite = await createInviteLink(result.data.groupId);
        setInviteUrl(invite.inviteUrl || '');
        setStep('dashboard');
      } catch (error) {
        setOperationError(error instanceof Error ? error.message : '초대 링크를 만들지 못했습니다.');
        setStep('dashboard');
      }
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '그룹을 만들지 못했습니다.');
    }
  }

  async function selectGroup(group) {
    const groupId = group.groupId || group.id;
    setActiveGroupId(groupId || null);
    if (groupId && getAccessToken()) {
      try {
        const detail = await getGroup(groupId);
        setGset(backendGroupToSettings(detail));
        setIsHost(detail.currentUserRole === 'OWNER');
      } catch (error) {
        setOperationError(error instanceof Error ? error.message : '그룹 정보를 불러오지 못했습니다.');
        return;
      }
    }
    setStep('dashboard');
  }

  async function saveGroupSettings() {
    const groupId = activeGroupId || import.meta.env.VITE_ACTIVE_GROUP_ID;
    const mode = resolveApiMode();
    if (mode === API_MODE.REAL && (!groupId || !getAccessToken())) {
      setOperationError(!groupId ? '수정할 그룹이 없습니다.' : '로그인 정보가 없습니다.');
      return;
    }
    const payload = {
      name: gset.name,
      locationAddress: gset.location,
      latitude: gset.lat,
      longitude: gset.lng,
      searchRadiusM: Math.round(gset.distanceKm * 1000),
      recommendationTime: gset.recTime,
      maxMemberCount: gset.memberTarget,
    };
    try {
      const result = await runWithApiFallback({
        mode,
        realAction: () => updateGroup(groupId, payload),
      });
      const view = backendGroupToView(result.data);
      setGroups((current) => current.map((group) => (group.groupId === groupId ? view : group)));
      setStep('dashboard');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '그룹 설정을 저장하지 못했습니다.');
    }
  }

  async function deleteActiveGroup() {
    const groupId = activeGroupId || import.meta.env.VITE_ACTIVE_GROUP_ID;
    if (!groupId || !getAccessToken()) {
      setOperationError(!groupId ? '삭제할 그룹이 없습니다.' : '로그인 정보가 없습니다.');
      return;
    }
    setGroupDeleteStatus('deleting');
    setOperationError('');
    try {
      await deleteGroupRequest(groupId);
      setGroups((current) => current.filter((group) => (group.groupId || group.id) !== groupId));
      setActiveGroupId(null);
      setGroupDeleteStatus('idle');
      setStep('groups');
    } catch (error) {
      setGroupDeleteStatus('failed');
      setOperationError(error instanceof Error ? error.message : '그룹 삭제에 실패했습니다.');
    }
  }

  function initializeVoteFlow() {
    setVoteStartedAt(Date.now());
    setMenuVotes({});
    setMyMenuVote({});
    setCurrentMenuIdx(0);
    setSimAllVoted(false);
    setRoundIds([]);
    setPastRoundIds([]);
    setCandidateIds([]);
    setDecisionChoices({});
    setDecisionClosed(false);
    setConfirmedMenuId(null);
    setDecisionMethod(null);
    setSelectedFinalMenuId(null);
    setStep('recommend');
  }

  async function syncVoteState(groupId = activeGroupId, sessionId = voteSessionId) {
    if (!groupId || !sessionId) return null;
    const state = await getVoteState(groupId, sessionId);
    const mappedMenus = (state.candidates || []).map(backendCandidateToMenu);
    setServerSessionStatus(state.sessionStatus || null);
    setFinalMenuVote(state.finalMenuVote || null);
    if (mappedMenus.length > 0) {
      setServerMenus(mappedMenus);
      setRoundIds(mappedMenus.map((menu) => menu.id));
      setMenuVotes(Object.fromEntries(mappedMenus.map((menu) => [menu.id, { ...menu.votes }])));
      setCandidateIds(mappedMenus
        .filter((menu) => isRemainingCandidateResult(menu.resultStatus))
        .map((menu) => menu.id)
        .slice(0, 3));
    }
    if (state.selectedFinalMenu?.selectedCandidateId) {
      setSelectedFinalMenuId(state.selectedFinalMenu.selectedCandidateId);
      setConfirmedMenuId(state.selectedFinalMenu.selectedCandidateId);
    }
    if (state.sessionStatus === 'MENU_SELECTION') setStep('roundresult');
    if (state.sessionStatus === 'RESTAURANT_SEARCHING') setStep('restsearch');
    if (state.sessionStatus === 'RESTAURANT_SELECTION') {
      const stores = await listStores(groupId, sessionId);
      setServerStores(stores.map(backendStoreToView));
      setRestaurantSearchStatus(stores.length ? 'ready' : 'empty');
      setStep('result');
    }
    if (state.sessionStatus === 'COMPLETED') setStep('schedule');
    return state;
  }

  async function startVote() {
    if (voteStartStatus === 'creating' || voteStartStatus === 'connecting') return;

    const mode = resolveApiMode();
    const groupId = activeGroupId || import.meta.env.VITE_ACTIVE_GROUP_ID;
    const accessToken = getAccessToken();
    const missingRealConfig = !groupId || !accessToken;

    if (mode === API_MODE.REAL && missingRealConfig) {
      setVoteStartStatus('failed');
      setVoteStartError(!groupId
        ? '투표를 시작할 그룹을 먼저 선택해주세요.'
        : '실제 API 연결에 사용할 Access Token이 필요합니다.');
      return;
    }

    setVoteStartStatus('creating');
    setVoteStartError('');

    try {
      const session = await createVoteSession(groupId, {
        title: `${gset.name} 메뉴 투표`,
        likeKeyword: voteKeywords.join(', ') || null,
        dislikeKeyword: null,
      }, { accessToken });

      setVoteSessionId(session.voteSessionId);
      setVoteStartStatus('connecting');
      voteSessionConnection.current?.disconnect();
      voteSessionConnection.current = await subscribeVoteSession(
        session.voteSessionId,
        (event) => {
          setLastVoteSessionEvent(event);
          return syncVoteState(groupId, session.voteSessionId).catch((error) => {
            setVoteStartError(error instanceof Error ? error.message : '투표 상태를 동기화하지 못했습니다.');
          });
        },
        { accessToken },
      );
      await startMenuRecommendation(groupId, session.voteSessionId);

      let candidates = [];
      for (let attempt = 0; attempt < MENU_CANDIDATE_POLL_ATTEMPTS && candidates.length === 0; attempt += 1) {
        candidates = await getMenuCandidates(groupId, session.voteSessionId);
        if (candidates.length === 0 && attempt < MENU_CANDIDATE_POLL_ATTEMPTS - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, MENU_CANDIDATE_POLL_INTERVAL_MS));
        }
      }
      if (candidates.length === 0) {
        throw new Error('추천 결과가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
      }

      const mappedMenus = candidates.map(backendCandidateToMenu);
      setServerMenus(mappedMenus);
      setVoteStartStatus('connected');
      initializeVoteFlow();
      setRoundIds(mappedMenus.map((menu) => menu.id));
      setMenuVotes(Object.fromEntries(mappedMenus.map((menu) => [menu.id, { ...menu.votes }])));
    } catch (error) {
      setVoteStartStatus('failed');
      setVoteStartError(error instanceof Error ? error.message : '투표 시작에 실패했습니다.');
    }
  }
  // 마음에 안 들면: 지난 라운드는 보관하고 새 10개로 다시 투표
  function newRound() {
    const currentIds = roundIds || [];
    const used = [...(pastRoundIds || []).flat(), ...currentIds];
    const next = buildRoundIds(used, currentIds);
    if (currentIds.length) setPastRoundIds((cur) => [...cur, currentIds]);
    setRoundIds(next);
    setCurrentMenuIdx(0);
    setVoteStartedAt(Date.now());
    setSelectedFinalMenuId(null);
    setStep('recommend');
  }

  // ---- 라운드 판정 이후 후보 결정 흐름 ----
  // mock 판정: 이번 라운드 갈래 상위 n개를 후보로 유지(0~3). 결정 상태 초기화.
  function setRoundCandidates(n) {
    const top = finalRanked.slice(0, n).map((m) => m.id);
    setCandidateIds(top.slice(0, 3));
    setDecisionChoices({});
    setDecisionClosed(false);
    setSelectedFinalMenuId(null);
  }
  // 후보 1개(go/again) · 후보 2개(메뉴 id) 결정 투표 — '나'의 선택
  function decisionVote(choice) {
    if (decisionClosed) return;
    setDecisionChoices((cur) => ({ ...cur, me: choice }));
  }
  function closeDecision() {
    setDecisionClosed(true);
  }
  // 최종 확정
  function confirmMenu(menuId, method) {
    if (!menuId) return;
    setConfirmedMenuId(menuId);
    setDecisionMethod(method);
    setStep('menuconfirmed');
  }
  async function submitFinalVote(candidateId) {
    if (!activeGroupId || !voteSessionId || !candidateId) return;
    setOperationError('');
    try {
      const result = await submitFinalMenuVote(activeGroupId, voteSessionId, candidateId);
      setFinalMenuVote(result);
      if (result.selectedCandidateId) {
        setSelectedFinalMenuId(result.selectedCandidateId);
        confirmMenu(result.selectedCandidateId, 'finalvote');
      }
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '최종 메뉴 투표를 저장하지 못했습니다.');
    }
  }
  async function selectFinalCandidate(candidateId) {
    if (!activeGroupId || !voteSessionId || !candidateId) return;
    setOperationError('');
    try {
      const result = await selectFinalMenu(activeGroupId, voteSessionId, candidateId);
      setSelectedFinalMenuId(result.selectedCandidateId);
      confirmMenu(result.selectedCandidateId, 'owner');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '최종 메뉴를 확정하지 못했습니다.');
    }
  }
  async function requestReRecommendation() {
    if (!activeGroupId || !voteSessionId || reRecommendationRequest.current) return;
    reRecommendationRequest.current = true;
    setRecommending(true);
    setOperationError('');
    const previousCandidateIds = new Set(serverMenus.map((menu) => menu.id));
    try {
      await reRecommendMenuApi(activeGroupId, voteSessionId);
      let candidates = [];
      for (let attempt = 0; attempt < MENU_CANDIDATE_POLL_ATTEMPTS; attempt += 1) {
        const found = await getMenuCandidates(activeGroupId, voteSessionId);
        const hasReplacement = found.length > 0
          && found.some((candidate) => !previousCandidateIds.has(candidate.voteCandidateId));
        if (hasReplacement) {
          candidates = found;
          break;
        }
        if (attempt < MENU_CANDIDATE_POLL_ATTEMPTS - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, MENU_CANDIDATE_POLL_INTERVAL_MS));
        }
      }
      if (candidates.length === 0) {
        throw new Error('새 추천 결과가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
      }
      const mappedMenus = candidates.map(backendCandidateToMenu);
      setServerMenus(mappedMenus);
      setRoundIds(mappedMenus.map((menu) => menu.id));
      setMenuVotes(Object.fromEntries(mappedMenus.map((menu) => [menu.id, { ...menu.votes }])));
      setMyMenuVote({});
      setCurrentMenuIdx(0);
      setVoteStartedAt(Date.now());
      setSimAllVoted(false);
      setFinalMenuVote(null);
      setCandidateIds([]);
      setDecisionChoices({});
      setDecisionClosed(false);
      setSelectedFinalMenuId(null);
      setStep('recommend');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '메뉴 재추천을 시작하지 못했습니다.');
    } finally {
      reRecommendationRequest.current = false;
      setRecommending(false);
    }
  }
  // 재추천: 이전 노출 메뉴 제외한 새 라운드 (로딩 표시)
  function reRecommend() {
    setRecommending(true);
    window.setTimeout(() => {
      const currentIds = roundIds || [];
      const used = [...(pastRoundIds || []).flat(), ...currentIds];
      const next = buildRoundIds(used, currentIds);
      if (currentIds.length) setPastRoundIds((cur) => [...cur, currentIds]);
      setRoundIds(next);
      setCurrentMenuIdx(0);
      setVoteStartedAt(Date.now());
      setDecisionChoices({});
      setDecisionClosed(false);
      setSimAllVoted(false);
      setRecommending(false);
      setStep('recommend');
    }, 900);
  }
  function addVoteKeyword(raw) {
    const v = (raw || '').trim();
    setVoteKeywords((cur) => (!v || cur.includes(v) || cur.length >= 5 ? cur : [...cur, v]));
  }
  function removeVoteKeyword(i) {
    setVoteKeywords((cur) => cur.filter((_, j) => j !== i));
  }

  // 취향 가중치 모델 (실제 판정은 백엔드 영역, 프론트는 mock 반영)
  //  - 세부(개별) 싫어요 + 알레르기 → 완전 제외(hard)
  //  - 카테고리 싫어요 → 감점(soft, 순위만 내려 간간히 노출)
  //  - 세부 좋아요 → 강한 가점 / 카테고리 좋아요 → 약한 가점
  const isCatKey = (k) => typeof k === 'string' && !k.includes('|');
  const menuOf = (k) => (typeof k === 'string' && k.includes('|') ? k.split('|')[1] : k);

  const hardExclude = useMemo(() => {
    const s = new Set();
    allergens.forEach((v) => v && s.add(v));
    aiAllergens.forEach((x) => x.name && s.add(x.name));
    aiExclusions.forEach((x) => x.name && s.add(x.name));
    dislikeMenus.forEach((k) => { if (!isCatKey(k)) s.add(menuOf(k)); }); // 세부 싫어요만 완전 제외
    return s;
  }, [allergens, aiAllergens, aiExclusions, dislikeMenus]);

  const softDislikeCats = useMemo(() => {
    const s = new Set();
    dislikeMenus.forEach((k) => { if (isCatKey(k)) s.add(k); }); // 카테고리 싫어요 → 감점
    return s;
  }, [dislikeMenus]);

  const likeExact = useMemo(() => {
    const s = new Set();
    likeMenus.forEach((k) => { if (!isCatKey(k)) s.add(menuOf(k)); });
    aiLikes.forEach((x) => x.name && s.add(x.name));
    return s;
  }, [likeMenus, aiLikes]);

  const likeCats = useMemo(() => {
    const s = new Set();
    likeMenus.forEach((k) => { if (isCatKey(k)) s.add(k); });
    return s;
  }, [likeMenus]);

  const menuById = useMemo(() => Object.fromEntries(menus.map((m) => [m.id, m])), []);
  const ROUND_SIZE = 10;
  const catOf = (m) => (m.cat || '').split(' · ')[0]; // '한식 · 국물요리' → '한식'
  // 완전 제외: 알레르기(성분/이름) 또는 세부 싫어요(메뉴명)
  const isExcluded = (m) => [m.name, ...(m.tags || [])].some((t) => hardExclude.has(t));
  const scoreMenu = (m) => {
    let sc = m.score;
    if (likeExact.has(m.name)) sc += 12; // 특히 좋아하는 (세부)
    if (likeCats.has(catOf(m))) sc += 5; // 카테고리 좋아요
    const kwHits = (voteKeywords || []).filter((k) => (m.traits || []).includes(k)).length;
    sc += kwHits * 4;
    if (softDislikeCats.has(catOf(m)) && !likeExact.has(m.name)) sc -= 40; // 카테고리 싫어요 → 감점(단, 세부로 특히 좋아한 메뉴는 예외)
    return Math.min(99, Math.max(1, sc));
  };
  // 취향 제외 후 점수순으로 라운드 10개 구성. 미사용 후보가 모자라면 현재 라운드만 피해 재사용.
  const buildRoundIds = (usedIds, avoidIds) => {
    const eligible = menus
      .filter((m) => !isExcluded(m))
      .map((m) => ({ id: m.id, s: scoreMenu(m) }))
      .sort((a, b) => b.s - a.s);
    let picks = eligible.filter((e) => !usedIds.includes(e.id));
    if (picks.length < ROUND_SIZE) picks = eligible.filter((e) => !avoidIds.includes(e.id));
    if (!picks.length) picks = eligible;
    return picks.slice(0, ROUND_SIZE).map((e) => e.id);
  };

  // 추천 메뉴는 백엔드가 내려준 후보만 노출한다.
  const recMenus = serverMenus;

  const activeMenuById = useMemo(
    () => Object.fromEntries(recMenus.map((menu) => [menu.id, menu])),
    [recMenus],
  );

  // 재추천은 백엔드에서 후보 전체를 교체하므로 이전 mock 라운드를 누적하지 않는다.
  const pastMenus = [];

  const excludedMenus = [];

  // recMenus 길이가 줄면 현재 인덱스 보정
  useEffect(() => {
    if (currentMenuIdx > recMenus.length - 1) setCurrentMenuIdx(Math.max(0, recMenus.length - 1));
  }, [recMenus.length, currentMenuIdx]);

  const votedCount = useMemo(() => recMenus.filter((m) => myMenuVote[m.id]).length, [recMenus, myMenuVote]);
  const allMenusVoted = recMenus.length > 0 && votedCount === recMenus.length;
  const remainMs = voteStartedAt ? Math.max(0, voteLimitMin * 60000 - (Date.now() - voteStartedAt)) : 0;
  const voteClosed = Boolean(voteStartedAt) && remainMs === 0;

  async function voteMenu(choice) {
    if (voteClosed) return; // 시간 종료 후 투표 차단
    const m = recMenus[currentMenuIdx];
    if (!m) return;
    const had = myMenuVote[m.id];

    if (voteStartStatus === 'connected' && activeGroupId && voteSessionId) {
      try {
        const submission = await submitMenuVote(activeGroupId, voteSessionId, m.id, choice);
        setMenuVotes((current) => ({
          ...current,
          [m.id]: {
            like: submission.counts?.go || 0,
            maybe: submission.counts?.maybe || 0,
            dislike: submission.counts?.no || 0,
          },
        }));
        setMyMenuVote((current) => ({ ...current, [m.id]: choice }));
        if (!had) setCurrentMenuIdx((index) => Math.min(recMenus.length - 1, index + 1));
      } catch (error) {
        setVoteStartError(error instanceof Error ? error.message : '메뉴 투표를 저장하지 못했습니다.');
      }
      return;
    }

    setMenuVotes((cur) => {
      const prev = cur[m.id] || { like: 0, maybe: 0, dislike: 0 };
      const nv = { ...prev };
      if (had) nv[had] = Math.max(0, nv[had] - 1);
      nv[choice] = (nv[choice] || 0) + 1;
      return { ...cur, [m.id]: nv };
    });
    setMyMenuVote((cur) => ({ ...cur, [m.id]: choice }));
    if (!had) setCurrentMenuIdx((i) => Math.min(recMenus.length - 1, i + 1));
  }

  async function closeMenuVoting() {
    if (voteStartStatus !== 'connected' || !activeGroupId || !voteSessionId) {
      setSimAllVoted(true);
      return;
    }
    try {
      const results = await closeMenuVote(activeGroupId, voteSessionId);
      setMenuVotes((current) => {
        const next = { ...current };
        results.forEach((result) => {
          next[result.candidateId] = {
            like: result.goCount,
            maybe: result.maybeCount,
            dislike: result.noCount,
          };
        });
        return next;
      });
      setCandidateIds(results
        .filter((result) => isRemainingCandidateResult(result.result))
        .map((result) => result.candidateId)
        .slice(0, 3));
      setSimAllVoted(true);
      setStep('roundresult');
    } catch (error) {
      setVoteStartError(error instanceof Error ? error.message : '메뉴 투표를 마감하지 못했습니다.');
    }
  }

  const finalRanked = useMemo(() => {
    const verdictOf = (v) => {
      const total = v.like + v.maybe + v.dislike;
      const half = total / 2;
      if (v.like > half) return '확정';
      if (v.like + v.maybe > half) return '후보 유지';
      if (v.dislike > half) return '제외';
      return '보류';
    };
    return [...recMenus]
      .map((m) => ({ ...m, v: menuVotes[m.id] || { like: 0, maybe: 0, dislike: 0 }, verdict: verdictOf(menuVotes[m.id] || { like: 0, maybe: 0, dislike: 0 }) }))
      .sort((a, b) => b.v.like - a.v.like || b.score - a.score);
  }, [menuVotes, recMenus]);

  // 최종 메뉴 결정 상태: 갈래 표가 최다인 후보가 여럿이면 동점 → 방장 선택 필요.
  // 사용자가 직접 고른 메뉴(이전 라운드 포함)가 있으면 그것이 최종.
  const finalDecision = useMemo(() => {
    if (!finalRanked.length) return { tie: false, tied: [], decidedId: selectedFinalMenuId || null };
    const maxLike = Math.max(...finalRanked.map((m) => m.v.like));
    const tied = finalRanked.filter((m) => m.v.like === maxLike);
    const tie = tied.length > 1;
    const explicit = selectedFinalMenuId && activeMenuById[selectedFinalMenuId] ? selectedFinalMenuId : null;
    const decidedId = explicit || (tie ? null : tied[0].id);
    return { tie, tied, decidedId };
  }, [finalRanked, selectedFinalMenuId, activeMenuById]);

  // 최종 결정된 메뉴 객체 (확정 메뉴 우선)
  const decidedMenu =
    (confirmedMenuId && activeMenuById[confirmedMenuId]) ||
    (finalDecision.decidedId && (finalRanked.find((m) => m.id === finalDecision.decidedId) || activeMenuById[finalDecision.decidedId])) ||
    finalRanked[0] ||
    recMenus[0] ||
    null;

  // ---- 라운드 판정/후보 결정 파생값 ----
  const candidateMenus = candidateIds
    .map((id) => activeMenuById[id])
    .filter(Boolean)
    .map((m) => ({ ...m, v: menuVotes[m.id] || { like: 0, maybe: 0, dislike: 0 } }));
  const candidateCount = candidateMenus.length;

  // 라운드 결과 요약(mock 판정 가정): 확정/후보유지/제외 수
  const roundSummary = useMemo(() => {
    const kept = finalRanked.filter((m) => m.verdict === '확정' || m.verdict === '후보 유지').length;
    const excluded = finalRanked.filter((m) => m.verdict === '제외').length;
    const confirmed = finalRanked.filter((m) => m.verdict === '확정').length;
    return { kept, excluded, confirmed, total: finalRanked.length };
  }, [finalRanked]);

  // 후보 1개/2개 결정 투표: 다른 멤버는 미리 정해진 mock 선택(항상 완료 상태)
  const otherPresets = useMemo(() => {
    const others = members.filter((m) => m.id !== 'me');
    if (candidateCount === 1) {
      const pattern = ['go', 'again', 'go', 'again'];
      return others.map((m, i) => ({ id: m.id, choice: pattern[i % pattern.length] }));
    }
    if (candidateCount === 2) {
      const pattern = [candidateIds[0], candidateIds[1], candidateIds[0], candidateIds[1]];
      return others.map((m, i) => ({ id: m.id, choice: pattern[i % pattern.length] }));
    }
    return [];
  }, [candidateCount, candidateIds, members]);

  const myDecisionChoice = decisionChoices.me || null;
  const decisionDoneCount = otherPresets.length + (myDecisionChoice ? 1 : 0);
  const decisionTotal = members.length;
  const decisionAllDone = decisionTotal > 0 && decisionDoneCount === decisionTotal;

  const decisionTally = useMemo(() => {
    const all = [...otherPresets.map((o) => o.choice), ...(myDecisionChoice ? [myDecisionChoice] : [])];
    const counts = {};
    all.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
    return counts;
  }, [otherPresets, myDecisionChoice]);

  // 결정 결과(마감 후): confirm | again | tie
  const decisionOutcome = useMemo(() => {
    if (!decisionClosed) return null;
    if (candidateCount === 1) {
      const go = decisionTally.go || 0;
      const again = decisionTally.again || 0;
      if (go > again) return { type: 'confirm', menuId: candidateIds[0], method: 'single' };
      if (again > go) return { type: 'again' };
      return { type: 'tie', mode: 'single' };
    }
    if (candidateCount === 2) {
      const [a, b] = candidateIds;
      const ca = decisionTally[a] || 0;
      const cb = decisionTally[b] || 0;
      if (ca > cb) return { type: 'confirm', menuId: a, method: 'finalvote' };
      if (cb > ca) return { type: 'confirm', menuId: b, method: 'finalvote' };
      return { type: 'tie', mode: 'final2' };
    }
    return null;
  }, [decisionClosed, candidateCount, decisionTally, candidateIds]);

  // 식당 투표 (여러 식당에 각각 투표)
  function voteRestaurant(id, choice) {
    const prevChoice = myRestaurantVote[id];
    if (prevChoice === choice) return;
    setRestaurantVotes((cur) => {
      const base = cur[id] || { like: 0, maybe: 0, dislike: 0 };
      const nv = { ...base };
      if (prevChoice) nv[prevChoice] = Math.max(0, nv[prevChoice] - 1);
      nv[choice] = (nv[choice] || 0) + 1;
      return { ...cur, [id]: nv };
    });
    setMyRestaurantVote((cur) => ({ ...cur, [id]: choice }));
    setSelectedId(id);
  }
  // 식당은 한 곳만 선택 (다시 누르면 해제)
  function toggleGroupRestaurant(id) {
    setGroupRestaurants((cur) => (cur.includes(id) ? [] : [id]));
  }

  const restaurantCandidates = serverStores;

  async function loadRestaurantResults() {
    let stores = [];
    let lastError = null;
    for (let attempt = 0; attempt < 120 && stores.length === 0; attempt += 1) {
      try {
        stores = await listStores(activeGroupId, voteSessionId);
        lastError = null;
      } catch (error) {
        lastError = error;
      }
      if (stores.length === 0 && attempt < 119) {
        setRestaurantSearchStatus('waiting');
        await new Promise((resolve) => window.setTimeout(resolve, 500));
      }
    }
    if (stores.length > 0) {
      setServerStores(stores.map(backendStoreToView));
      setRestaurantSearchStatus('ready');
      return;
    }
    if (lastError) throw lastError;
    setRestaurantSearchStatus('empty');
  }

  async function requestRestaurantSearch(radiusM = gset.distanceKm * 1000) {
    if (!activeGroupId || !voteSessionId || !decidedMenu) return;
    setOperationError('');
    setRestaurantSearchStatus('searching');
    try {
      await searchStores({
        voteSessionId,
        keyword: decidedMenu.name,
        longitude: gset.lng,
        latitude: gset.lat,
        radiusM: Math.round(radiusM),
      });
      await loadRestaurantResults();
    } catch (error) {
      setRestaurantSearchStatus('failed');
      setOperationError(error instanceof Error ? error.message : '주변 식당 검색을 시작하지 못했습니다.');
    }
  }

  async function refreshRestaurantResults() {
    if (!activeGroupId || !voteSessionId) return;
    setOperationError('');
    setRestaurantSearchStatus('waiting');
    try {
      await loadRestaurantResults();
    } catch (error) {
      setRestaurantSearchStatus('failed');
      setOperationError(error instanceof Error ? error.message : '식당 검색 결과를 불러오지 못했습니다.');
    }
  }

  // 식당 확정 → 일정 저장 (시간은 방장이 지정)
  async function confirmSchedule(restId, time) {
    const r = restaurantCandidates.find((c) => c.id === restId);
    if (!r) return;
    let selected = r;
    if (voteStartStatus === 'connected' && activeGroupId && voteSessionId) {
      try {
        const response = await selectStore(activeGroupId, voteSessionId, r.externalPlaceId || r.id);
        selected = { ...r, ...backendStoreToView(response) };
      } catch (error) {
        setOperationError(error instanceof Error ? error.message : '최종 식당을 확정하지 못했습니다.');
        return;
      }
    }
    const menuName = decidedMenu?.name || '';
    setSavedSchedule({
      restaurantId: selected.id,
      time: time || gset.recTime || '18:00',
      name: selected.name,
      detail: `${selected.city} · ${selected.meta}`,
      menu: menuName,
      score: selected.score,
    });
    setStep('schedule');
  }

  async function loadHistory() {
    if (!getAccessToken()) {
      setHistoryStatus('failed');
      setOperationError('로그인 정보가 없어 지난 식사 기록을 불러올 수 없습니다.');
      return;
    }
    setHistoryStatus('loading');
    try {
      const response = await listPreviousGroups();
      setHistoryGroups((response.previous || []).map((group) => ({
        group: group.name,
        groupId: group.groupId,
        city: '',
        period: '',
        meals: (group.voteSessions || []).map((meal) => backendHistoryMeal(meal, group.name)),
      })));
      setHistoryStatus('ready');
    } catch (error) {
      setHistoryStatus('failed');
      setOperationError(error instanceof Error ? error.message : '지난 식사 기록을 불러오지 못했습니다.');
    }
  }

  async function openMeal(meal) {
    if (!getAccessToken() || !meal.voteSessionId) {
      setOperationError(!getAccessToken()
        ? '로그인 정보가 없어 지난 식사 상세를 불러올 수 없습니다.'
        : '지난 식사 식별자가 없습니다.');
      return;
    }
    try {
      const detail = await getPreviousVoteSession(meal.voteSessionId);
      setSelectedMeal(backendHistoryMeal(detail, detail.groupName));
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '지난 식사 상세를 불러오지 못했습니다.');
      return;
    }
    setStep('mealdetail');
  }

  async function handleCopy() {
    const origin = window.location?.origin || 'http://localhost:5173';
    try {
      let nextInviteUrl = inviteUrl;
      if (!nextInviteUrl && activeGroupId && getAccessToken()) {
        const invite = await createInviteLink(activeGroupId);
        nextInviteUrl = invite.inviteUrl || `${origin}/invite/${invite.inviteCode}`;
        setInviteUrl(nextInviteUrl);
      }
      if (!nextInviteUrl) throw new Error('생성된 초대 링크가 없습니다.');
      await navigator.clipboard.writeText(nextInviteUrl);
      setCopied('success');
    } catch (error) {
      setCopied('error');
      setOperationError(error instanceof Error ? error.message : '초대 링크를 만들지 못했습니다.');
    }
    window.setTimeout(() => setCopied('idle'), 1800);
  }

  return {
    step, goToStep,
    loggedIn, afterLogin, doLogin, logout, joinGroup, inviteCode, inviteInfo, inviteUrl,
    operationError,
    profile, setProfile, profileOpen, setProfileOpen,
    prefsOpen, setPrefsOpen, prefsTab, setPrefsTab,
    onbStep, setOnbStep, consent, setConsent,
    allergens, setAllergens, aiAllergens, setAiAllergens,
    dislikeMenus, setDislikeMenus, aiExclusions, setAiExclusions,
    likeMenus, setLikeMenus, aiLikes, setAiLikes,
    analyzeText, completeOnboarding, savePreferences,
    draft, setDraft, createGroup,
    members, isHost, setIsHost, delegateHost, kickMember,
    gset, setGset, groups, activeGroupId, selectGroup, saveGroupSettings,
    deleteActiveGroup, groupDeleteStatus,
    voteLimitMin, setVoteLimitMin, voteStartedAt, startVote, remainMs, voteClosed,
    voteSessionId, voteStartStatus, voteStartError, lastVoteSessionEvent,
    serverSessionStatus, finalMenuVote, syncVoteState,
    voteKeywords, addVoteKeyword, removeVoteKeyword,
    menus: recMenus, excludedMenus, menuVotes, myMenuVote, currentMenuIdx, setCurrentMenuIdx, voteMenu,
    votedCount, allMenusVoted,
    newRound, pastMenus, decidedMenu, roundNumber: (pastRoundIds?.length || 0) + 1,
    simAllVoted, setSimAllVoted, closeMenuVoting, finalRanked, finalDecision,
    // 라운드 판정 → 후보 결정 흐름
    candidateMenus, candidateCount, candidateIds, roundSummary,
    setRoundCandidates, decisionVote, closeDecision, confirmMenu, reRecommend, recommending,
    submitFinalVote, selectFinalCandidate, requestReRecommendation,
    myDecisionChoice, otherPresets, decisionChoices, decisionClosed, decisionDoneCount, decisionTotal,
    decisionAllDone, decisionTally, decisionOutcome,
    confirmedMenuId, decisionMethod,
    selectedId, setSelectedId, restaurantVotes, myRestaurantVote, voteRestaurant,
    groupRestaurants, toggleGroupRestaurant, selectedFinalMenuId, setSelectedFinalMenuId,
    restaurantCandidates, restaurantSearchStatus, requestRestaurantSearch, refreshRestaurantResults,
    savedSchedule, confirmSchedule,
    selectedMeal, openMeal, loadHistory, historyGroups, historyStatus,
    historyGroupFilterId, openGroupHistory,
    copied, handleCopy,
    archiveGroups: historyGroupFilterId
      ? historyGroups.filter((group) => group.groupId === historyGroupFilterId)
      : historyGroups,
  };
}
