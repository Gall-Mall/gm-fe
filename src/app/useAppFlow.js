import { useEffect, useMemo, useRef, useState } from 'react';
import {
  archiveGroups,
  defaultGroup,
  groupMembersSeed,
  menus,
  recommendationCandidates,
  voteCandidate,
} from '../data/appData';

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

export function useAppFlow() {
  const [step, setStep] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [afterLogin, setAfterLogin] = useState(null);

  // 프로필
  const [profile, setProfile] = useState({ name: '나', photo: null });
  const [profileOpen, setProfileOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsTab, setPrefsTab] = useState('allergy');

  // 취향(온보딩 + 마이페이지 공유)
  const [onbStep, setOnbStep] = useState(1);
  const [consent, setConsent] = useState({ service: false, privacy: false, age: false, health: false, logs: false });
  const [allergens, setAllergens] = useState([]);
  const [aiAllergens, setAiAllergens] = useState([]);
  const [dislikeMenus, setDislikeMenus] = useState([]);
  const [aiExclusions, setAiExclusions] = useState([]);
  const [likeMenus, setLikeMenus] = useState([]);
  const [aiLikes, setAiLikes] = useState([]);

  // 그룹 생성 draft
  const [draft, setDraft] = useState({
    name: 'Osaka Foodies', destination: 'Osaka, Japan', dateMode: 'fixed',
    dateStart: '2024-10-12', dateEnd: '2024-10-18', dateCasual: '오늘',
    members: 4, purpose: '먹방여행', invites: ['jimin@kakao.com', '수현'],
    lat: 37.5665, lng: 126.978, distanceKm: 2, distanceMode: 'preset', distanceText: '2',
  });

  // 그룹 설정 / 멤버
  const [members, setMembers] = useState(groupMembersSeed);
  const [isHost, setIsHost] = useState(true);
  const [gset, setGset] = useState({
    name: 'Osaka Foodies', location: 'Osaka, Japan', recTime: '18:00',
    distanceKm: 2, distanceMode: 'preset', distanceText: '2',
  });

  // 투표
  const [voteLimitMin, setVoteLimitMin] = useState(60);
  const [voteStartedAt, setVoteStartedAt] = useState(null);
  const [voteKeywords, setVoteKeywords] = useState([]);
  const [menuVotes, setMenuVotes] = useState(initialVoteCounts);
  const [myMenuVote, setMyMenuVote] = useState({});
  const [currentMenuIdx, setCurrentMenuIdx] = useState(0);
  const [simAllVoted, setSimAllVoted] = useState(false);

  // 식당(지도 투표) + 검색/그룹목록
  const [selectedId, setSelectedId] = useState(voteCandidate.id);
  const [restaurantVotes, setRestaurantVotes] = useState(
    Object.fromEntries(recommendationCandidates.map((c) => [c.id, { ...c.votes }])),
  );
  const [groupRestaurants, setGroupRestaurants] = useState([]);
  const [selectedFinalMenuId, setSelectedFinalMenuId] = useState(null);

  // 지난 식사 상세
  const [selectedMeal, setSelectedMeal] = useState(null);

  const [copied, setCopied] = useState('idle');

  const tick = useRef(null);
  useEffect(() => {
    const el = document.scrollingElement || document.documentElement;
    el.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [step]);

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
  const [, setNow] = useState(Date.now());

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
    setProfileOpen(false);
    setLoggedIn(false);
    setStep('login');
  }

  function joinGroup() {
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

  function startVote() {
    setVoteStartedAt(Date.now());
    setStep('recommend');
  }
  function addVoteKeyword(raw) {
    const v = (raw || '').trim();
    setVoteKeywords((cur) => (!v || cur.includes(v) || cur.length >= 5 ? cur : [...cur, v]));
  }
  function removeVoteKeyword(i) {
    setVoteKeywords((cur) => cur.filter((_, j) => j !== i));
  }

  function voteMenu(choice) {
    const m = menus[currentMenuIdx];
    const had = myMenuVote[m.id];
    setMenuVotes((cur) => {
      const prev = cur[m.id];
      const nv = { ...prev };
      if (had) nv[had] = Math.max(0, nv[had] - 1);
      nv[choice] = nv[choice] + 1;
      return { ...cur, [m.id]: nv };
    });
    setMyMenuVote((cur) => ({ ...cur, [m.id]: choice }));
    if (!had) setCurrentMenuIdx((i) => Math.min(menus.length - 1, i + 1));
  }

  function voteRestaurant(choice) {
    setRestaurantVotes((cur) => ({
      ...cur,
      [selectedId]: { ...cur[selectedId], [choice]: cur[selectedId][choice] + 1 },
    }));
    setStep('result');
  }
  function toggleGroupRestaurant(id) {
    setGroupRestaurants((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
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

  // 파생값
  const remainMs = voteStartedAt ? Math.max(0, voteLimitMin * 60000 - (Date.now() - voteStartedAt)) : 0;

  const finalRanked = useMemo(() => {
    const verdictOf = (v) => {
      const total = v.like + v.maybe + v.dislike;
      const half = total / 2;
      if (v.like > half) return '확정';
      if (v.like + v.maybe > half) return '후보 유지';
      if (v.dislike > half) return '제외';
      return '보류';
    };
    return [...menus]
      .map((m) => ({ ...m, v: menuVotes[m.id], verdict: verdictOf(menuVotes[m.id]) }))
      .sort((a, b) => b.v.like - a.v.like || b.score - a.score);
  }, [menuVotes]);

  return {
    step, goToStep,
    loggedIn, afterLogin, doLogin, logout, joinGroup,
    profile, setProfile, profileOpen, setProfileOpen,
    prefsOpen, setPrefsOpen, prefsTab, setPrefsTab,
    onbStep, setOnbStep, consent, setConsent,
    allergens, setAllergens, aiAllergens, setAiAllergens,
    dislikeMenus, setDislikeMenus, aiExclusions, setAiExclusions,
    likeMenus, setLikeMenus, aiLikes, setAiLikes,
    analyzeText,
    draft, setDraft,
    members, isHost, setIsHost, delegateHost, kickMember,
    gset, setGset,
    voteLimitMin, setVoteLimitMin, voteStartedAt, startVote, remainMs,
    voteKeywords, addVoteKeyword, removeVoteKeyword,
    menus, menuVotes, myMenuVote, currentMenuIdx, setCurrentMenuIdx, voteMenu,
    simAllVoted, setSimAllVoted, finalRanked,
    selectedId, setSelectedId, restaurantVotes, voteRestaurant,
    groupRestaurants, toggleGroupRestaurant, selectedFinalMenuId, setSelectedFinalMenuId,
    selectedMeal, openMeal,
    copied, handleCopy,
    archiveGroups,
  };
}
