import { useEffect, useMemo, useRef, useState } from 'react';
import {
  archiveGroups,
  defaultGroup,
  groupMembersSeed,
  menus,
  recommendationCandidates,
  travelGroups,
  voteCandidate,
} from '../data/appData';
import { createVoteSession } from '../services/voteSessionApi';
import { createAndSubscribeVoteSession } from '../services/voteSessionFlow';
import { subscribeVoteSession } from '../services/voteSessionSocket';

// AI 분석: window.claude가 있으면 사용, 없으면 간단 폴백
async function analyzeText(kind, text) {
  const t = (text || '').trim();
  if (!t) return [];
  if (typeof window !== 'undefined' && window.claude?.complete) {
    try {
      const sys =
        kind === 'allergy'
          ? '너는 알레르기 성분 추출기다. 사용자가 알레르기·못 먹는 이유를 적으면 제외할 성분만 JSON으로 출력한다. 형식:{"items":[{"name":"성분명","kind":"성분"}]}. 최대 6개, JSON만.'
          : kind === 'like'
            ? '너는 한국 음식 선호 추출기다. 좋아하는 음식을 적으면 선호 항목을 JSON으로 출력한다. 형식:{"items":[{"name":"항목","kind":"메뉴|카테고리|특성"}]}. 최대 6개, JSON만.'
            : '너는 한국 음식 제외 항목 추출기다. 못 먹는 음식을 적으면 제외 항목을 JSON으로 출력한다. 형식:{"items":[{"name":"항목","kind":"성분|메뉴|카테고리|특성"}]}. 최대 6개, JSON만.';
      const res = await window.claude.complete({ system: sys, messages: [{ role: 'user', content: t }] });
      const parsed = JSON.parse(res.slice(res.indexOf('{'), res.lastIndexOf('}') + 1));
      return (parsed.items || [])
        .map((i) => ({ name: String(i.name || '').trim(), kind: i.kind || '특성' }))
        .filter((i) => i.name);
    } catch {
      /* fall through */
    }
  }
  // 폴백: 쉼표/공백 기준 분리
  return t
    .split(/[,·\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((name) => ({ name, kind: '특성' }));
}

const initialVoteCounts = Object.fromEntries(menus.map((m) => [m.id, { ...m.votes }]));
const initialRestaurantVotes = Object.fromEntries(recommendationCandidates.map((c) => [c.id, { ...c.votes }]));
const freshVoteCounts = () => Object.fromEntries(menus.map((m) => [m.id, { ...m.votes }]));
const freshRestaurantVotes = () => Object.fromEntries(recommendationCandidates.map((c) => [c.id, { ...c.votes }]));

const STORAGE_KEY = 'galae-state-v3';

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

const defaultDraft = {
  name: '', destination: '오사카', dateMode: 'fixed',
  dateStart: '', dateEnd: '', dateCasual: '오늘',
  members: 4, purpose: '먹방여행',
  lat: 37.5665, lng: 126.978, distanceKm: 2, distanceMode: 'preset', distanceText: '2',
};

const defaultGset = {
  name: defaultGroup.name, location: defaultGroup.city, recTime: '18:00',
  distanceKm: 2, distanceMode: 'preset', distanceText: '2', memberTarget: 4,
  lat: defaultGroup.lat, lng: defaultGroup.lng,
};

export function useAppFlow() {
  const saved = useMemo(() => loadState(), []);
  const inviteCode = useMemo(() => readInviteCode(), []);

  // 초대 링크로 들어오면 무조건 초대 화면. 아니면 로그인 상태일 때만 이전 위치 복원.
  const initialStep = inviteCode ? 'invite' : saved.loggedIn ? saved.step || 'home' : 'login';

  const [step, setStep] = useState(initialStep);
  const [loggedIn, setLoggedIn] = useState(saved.loggedIn || false);
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

  // 그룹 생성 draft
  const [draft, setDraft] = useState(saved.draft || defaultDraft);

  // 그룹 설정 / 멤버 / 내 그룹 목록
  const [members, setMembers] = useState(saved.members || groupMembersSeed);
  const [isHost, setIsHost] = useState(saved.isHost ?? true);
  const [gset, setGset] = useState(saved.gset || defaultGset);
  const [groups, setGroups] = useState(saved.groups || travelGroups);

  // 투표
  const [voteLimitMin, setVoteLimitMin] = useState(saved.voteLimitMin ?? 60);
  const [voteStartedAt, setVoteStartedAt] = useState(saved.voteStartedAt ?? null);
  const [voteKeywords, setVoteKeywords] = useState(saved.voteKeywords || []);
  const [menuVotes, setMenuVotes] = useState(saved.menuVotes || initialVoteCounts);
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
  const [selectedId, setSelectedId] = useState(saved.selectedId || voteCandidate.id);
  const [restaurantVotes, setRestaurantVotes] = useState(saved.restaurantVotes || initialRestaurantVotes);
  const [myRestaurantVote, setMyRestaurantVote] = useState(saved.myRestaurantVote || {});
  const [groupRestaurants, setGroupRestaurants] = useState(saved.groupRestaurants || []);
  const [selectedFinalMenuId, setSelectedFinalMenuId] = useState(saved.selectedFinalMenuId ?? null);
  const [savedSchedule, setSavedSchedule] = useState(saved.savedSchedule || null);

  // 지난 식사 상세
  const [selectedMeal, setSelectedMeal] = useState(null);

  const [copied, setCopied] = useState('idle');
  const [voteSessionId, setVoteSessionId] = useState(null);
  const [voteStartStatus, setVoteStartStatus] = useState('idle');
  const [voteStartError, setVoteStartError] = useState('');
  const [lastVoteSessionEvent, setLastVoteSessionEvent] = useState(null);

  const tick = useRef(null);
  const voteSessionConnection = useRef(null);
  const [, setNow] = useState(Date.now());

  useEffect(() => () => {
    voteSessionConnection.current?.disconnect();
  }, []);

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
      draft, members, isHost, gset, groups,
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
    draft, members, isHost, gset, groups,
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
    setStep(next);
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
    voteSessionConnection.current?.disconnect();
    voteSessionConnection.current = null;
    setVoteSessionId(null);
    setVoteStartStatus('idle');
    setVoteStartError('');
    setProfileOpen(false);
    setLoggedIn(false);
    setStep('login');
  }

  function joinGroup() {
    // 초대 처리 후 URL을 정리해 새로고침 시 초대 화면에 갇히지 않도록 함
    try {
      if (window.location.pathname.startsWith('/invite/')) window.history.replaceState({}, '', '/');
    } catch {
      /* noop */
    }
    if (loggedIn) setStep('dashboard');
    else {
      setAfterLogin('dashboard');
      setStep('login');
    }
  }

  function delegateHost(id) {
    setMembers((cur) => cur.map((m) => ({ ...m, role: m.role === 'host' ? 'member' : m.id === id ? 'host' : m.role })));
    setIsHost(false);
  }
  function kickMember(id) {
    setMembers((cur) => cur.filter((m) => m.id !== id));
  }

  // 그룹 생성: 입력한 draft를 실제 그룹 설정/목록에 반영
  function createGroup() {
    const name = (draft.name || '').trim() || '새 그룹';
    const location = (draft.destination || '').trim() || '위치 미정';
    setGset((g) => ({
      ...g,
      name,
      location,
      distanceKm: draft.distanceKm,
      distanceMode: draft.distanceMode,
      distanceText: draft.distanceText,
      memberTarget: draft.members,
      purpose: draft.purpose,
      lat: draft.lat,
      lng: draft.lng,
    }));
    const dateLabel =
      draft.dateMode === 'fixed' && draft.dateStart && draft.dateEnd
        ? `${draft.dateStart} ~ ${draft.dateEnd}`
        : draft.dateMode === 'fixed'
          ? '날짜 미정'
          : draft.dateCasual || '날짜 미정';
    const entry = { name, city: location, date: dateLabel, progress: 0, status: '준비 중', isMine: true };
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
    setRestaurantVotes(freshRestaurantVotes());
    setMyRestaurantVote({});
    setSavedSchedule(null);
    setStep('dashboard');
  }

  async function startVote() {
    if (voteStartStatus === 'creating' || voteStartStatus === 'connecting') return;

    const groupId = import.meta.env.VITE_ACTIVE_GROUP_ID;
    if (!groupId) {
      setVoteStartStatus('failed');
      setVoteStartError('VITE_ACTIVE_GROUP_ID 설정이 필요합니다.');
      return;
    }

    setVoteStartStatus('creating');
    setVoteStartError('');
    try {
      const { connection } = await createAndSubscribeVoteSession({
        groupId,
        request: {
          title: `${gset.name} 메뉴 투표`,
          likeKeyword: voteKeywords.join(', ') || null,
          dislikeKeyword: null,
        },
        onSessionCreated: (session) => {
          setVoteSessionId(session.voteSessionId);
          setVoteStartStatus('connecting');
        },
        onEvent: setLastVoteSessionEvent,
        createVoteSession,
        subscribeVoteSession,
      });

      voteSessionConnection.current?.disconnect();
      voteSessionConnection.current = connection;
      setVoteStartStatus('connected');

      // 최신 main의 투표 초기화·라운드 흐름은 그대로 유지한다.
      setVoteStartedAt(Date.now());
      setMenuVotes(freshVoteCounts());
      setMyMenuVote({});
      setCurrentMenuIdx(0);
      setSimAllVoted(false);
      setRoundIds(buildRoundIds([], []));
      setPastRoundIds([]);
      setCandidateIds([]);
      setDecisionChoices({});
      setDecisionClosed(false);
      setConfirmedMenuId(null);
      setDecisionMethod(null);
      setSelectedFinalMenuId(null);
      setStep('recommend');
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

  // 현재 라운드 메뉴(점수 반영). 아직 라운드가 없으면 미리 계산해 보여줌.
  const recMenus = useMemo(() => {
    const ids = roundIds && roundIds.length ? roundIds : buildRoundIds([], []);
    return ids.map((id) => menuById[id]).filter(Boolean).map((m) => ({ ...m, score: scoreMenu(m) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIds, hardExclude, softDislikeCats, likeExact, likeCats, voteKeywords, menuById]);

  // 이전 라운드에서 나온(현재 라운드에 없는) 메뉴 — "이전 투표" 목록, 선택 가능
  const pastMenus = useMemo(() => {
    const seen = new Set(roundIds || []);
    const out = [];
    (pastRoundIds || []).flat().forEach((id) => {
      if (seen.has(id)) return;
      seen.add(id);
      const m = menuById[id];
      if (m) out.push({ ...m, v: menuVotes[id] || { like: 0, maybe: 0, dislike: 0 } });
    });
    return out;
  }, [pastRoundIds, roundIds, menuVotes, menuById]);

  // 제외된 메뉴(안내용) — 완전 제외만
  const excludedMenus = useMemo(() => {
    return menus
      .map((m) => {
        const hay = [m.name, ...(m.tags || [])];
        return { ...m, excludedBy: hay.find((t) => hardExclude.has(t)) || null };
      })
      .filter((m) => m.excludedBy);
  }, [hardExclude]);

  // recMenus 길이가 줄면 현재 인덱스 보정
  useEffect(() => {
    if (currentMenuIdx > recMenus.length - 1) setCurrentMenuIdx(Math.max(0, recMenus.length - 1));
  }, [recMenus.length, currentMenuIdx]);

  const votedCount = useMemo(() => recMenus.filter((m) => myMenuVote[m.id]).length, [recMenus, myMenuVote]);
  const allMenusVoted = recMenus.length > 0 && votedCount === recMenus.length;
  const remainMs = voteStartedAt ? Math.max(0, voteLimitMin * 60000 - (Date.now() - voteStartedAt)) : 0;
  const voteClosed = Boolean(voteStartedAt) && remainMs === 0;

  function voteMenu(choice) {
    if (voteClosed) return; // 시간 종료 후 투표 차단
    const m = recMenus[currentMenuIdx];
    if (!m) return;
    const had = myMenuVote[m.id];
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
    const explicit = selectedFinalMenuId && menuById[selectedFinalMenuId] ? selectedFinalMenuId : null;
    const decidedId = explicit || (tie ? null : tied[0].id);
    return { tie, tied, decidedId };
  }, [finalRanked, selectedFinalMenuId, menuById]);

  // 최종 결정된 메뉴 객체 (확정 메뉴 우선)
  const decidedMenu =
    (confirmedMenuId && menuById[confirmedMenuId]) ||
    (finalDecision.decidedId && (finalRanked.find((m) => m.id === finalDecision.decidedId) || menuById[finalDecision.decidedId])) ||
    finalRanked[0] ||
    recMenus[0] ||
    null;

  // ---- 라운드 판정/후보 결정 파생값 ----
  const candidateMenus = candidateIds
    .map((id) => menuById[id])
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

  // 식당 확정 → 일정 저장 (시간은 방장이 지정)
  function confirmSchedule(restId, time) {
    const r = recommendationCandidates.find((c) => c.id === restId);
    if (!r) return;
    const menuName = decidedMenu?.name || '';
    setSavedSchedule({
      restaurantId: r.id,
      time: time || gset.recTime || '18:00',
      name: r.name,
      detail: `${r.city} · ${r.meta}`,
      menu: menuName,
      score: r.score,
    });
    setStep('schedule');
  }

  function openMeal(meal) {
    setSelectedMeal(meal);
    setStep('mealdetail');
  }

  async function handleCopy() {
    const origin = window.location?.origin || 'http://localhost:5173';
    try {
      await navigator.clipboard.writeText(`${origin}/invite/${defaultGroup.inviteCode}`);
      setCopied('success');
    } catch {
      setCopied('error');
    }
    window.setTimeout(() => setCopied('idle'), 1800);
  }

  return {
    step, goToStep,
    loggedIn, afterLogin, doLogin, logout, joinGroup, inviteCode,
    profile, setProfile, profileOpen, setProfileOpen,
    prefsOpen, setPrefsOpen, prefsTab, setPrefsTab,
    onbStep, setOnbStep, consent, setConsent,
    allergens, setAllergens, aiAllergens, setAiAllergens,
    dislikeMenus, setDislikeMenus, aiExclusions, setAiExclusions,
    likeMenus, setLikeMenus, aiLikes, setAiLikes,
    analyzeText,
    draft, setDraft, createGroup,
    members, isHost, setIsHost, delegateHost, kickMember,
    gset, setGset, groups,
    voteLimitMin, setVoteLimitMin, voteStartedAt, startVote, remainMs, voteClosed,
    voteSessionId, voteStartStatus, voteStartError, lastVoteSessionEvent,
    voteKeywords, addVoteKeyword, removeVoteKeyword,
    menus: recMenus, excludedMenus, menuVotes, myMenuVote, currentMenuIdx, setCurrentMenuIdx, voteMenu,
    votedCount, allMenusVoted,
    newRound, pastMenus, decidedMenu, roundNumber: (pastRoundIds?.length || 0) + 1,
    simAllVoted, setSimAllVoted, finalRanked, finalDecision,
    // 라운드 판정 → 후보 결정 흐름
    candidateMenus, candidateCount, candidateIds, roundSummary,
    setRoundCandidates, decisionVote, closeDecision, confirmMenu, reRecommend, recommending,
    myDecisionChoice, otherPresets, decisionChoices, decisionClosed, decisionDoneCount, decisionTotal,
    decisionAllDone, decisionTally, decisionOutcome,
    confirmedMenuId, decisionMethod,
    selectedId, setSelectedId, restaurantVotes, myRestaurantVote, voteRestaurant,
    groupRestaurants, toggleGroupRestaurant, selectedFinalMenuId, setSelectedFinalMenuId,
    savedSchedule, confirmSchedule,
    selectedMeal, openMeal,
    copied, handleCopy,
    archiveGroups,
  };
}
