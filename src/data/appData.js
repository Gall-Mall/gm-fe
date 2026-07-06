import cafeImage from '../assets/cafe-card.png';
import okonomiyakiImage from '../assets/okonomiyaki-card.png';

export const defaultGroup = {
  name: 'Osaka Foodies',
  city: 'Osaka, Japan',
  date: 'Oct 12 - Oct 18, 2024',
  inviteCode: 'GALM24',
  readiness: 75,
  purpose: 'Food exploration',
};

export const travelGroups = [
  {
    name: 'Osaka Foodies',
    city: 'Osaka, Japan',
    date: 'Oct 12 - Oct 18',
    progress: 75,
    status: 'Day 3 of 4',
  },
  {
    name: 'Seoul Weekend',
    city: 'Seoul, South Korea',
    date: 'Nov 2 - Nov 4',
    progress: 54,
    status: 'Day 1 of 2',
  },
];

export const tasteOptions = [
  {
    label: '일식',
    detail: '현지 식당과 제철 메뉴를 우선해요.',
    image: okonomiyakiImage,
  },
  {
    label: '양식',
    detail: '익숙한 메뉴와 편안한 분위기를 선호해요.',
  },
  {
    label: '카페/디저트',
    detail: '사진과 여유로운 시간을 중요하게 봐요.',
  },
  {
    label: '분식',
    detail: '가볍게 나눠 먹는 메뉴가 좋아요.',
    image: okonomiyakiImage,
  },
];

export const purposeOptions = ['먹방여행', '카페 투어', '로컬 탐방', '휴식 여행', '쇼핑'];

export const recommendationCandidates = [
  {
    id: 'trattoria-bella',
    name: 'Trattoria Bella',
    city: 'Namba, Osaka',
    category: 'Italian',
    score: 88,
    distance: '도보 12분',
    meta: '파스타 · 단체석',
    scheduleLabel: '파스타',
    image: cafeImage,
    votes: {
      like: 3,
      maybe: 1,
      dislike: 0,
    },
    route: {
      type: 'candidate',
      top: '34%',
      left: '56%',
    },
    reasons: [
      '민재님의 유제품 제한을 피할 수 있는 메뉴가 있어요.',
      '지민님이 선호한 차분한 저녁 분위기와 잘 맞아요.',
      '수현님이 저장한 카페 거리와 같은 동선에 있어요.',
    ],
    cautions: ['피크 시간에는 20-30분 정도 기다릴 수 있어요.', '근처 주차가 어려워 도보 이동을 추천해요.'],
  },
  {
    id: 'wad-omotenashi-cafe',
    name: '와드 오모테나시 카페',
    city: 'Namba, Osaka',
    category: 'Cafe',
    score: 85,
    distance: '도보 8분',
    meta: '감성 카페 · 조용한 좌석',
    scheduleLabel: '감성 카페',
    image: cafeImage,
    votes: {
      like: 2,
      maybe: 1,
      dislike: 1,
    },
    route: {
      type: 'maybe',
      top: '72%',
      left: '78%',
    },
    reasons: [
      '수현님이 저장한 카페 거리와 같은 동선에 있어요.',
      '오후 일정 피로를 줄이기 좋은 조용한 분위기예요.',
      '식사 후 바로 이동하기 쉬운 난바 중심 후보예요.',
    ],
    cautions: ['식사보다는 디저트와 휴식에 가까워요.', '4명 모두 앉을 좌석은 방문 시간에 따라 달라질 수 있어요.'],
  },
  {
    id: 'mizuno-okonomiyaki',
    name: '미즈노 오코노미야키',
    city: 'Dotonbori, Osaka',
    category: 'Japanese',
    score: 92,
    distance: '도보 15분',
    meta: '오코노미야키 · 로컬 맛집',
    scheduleLabel: '로컬 맛집',
    image: okonomiyakiImage,
    votes: {
      like: 3,
      maybe: 0,
      dislike: 1,
    },
    route: {
      type: 'candidate',
      top: '58%',
      left: '30%',
    },
    reasons: [
      '그룹 전체가 면 요리와 현지 음식을 선호해요.',
      '첫날 저녁 동선에서 크게 벗어나지 않아요.',
      '현지 음식 경험을 원하는 멤버에게 가장 잘 맞아요.',
    ],
    cautions: ['웨이팅이 길면 다음 일정이 밀릴 수 있어요.', '철판 좌석이라 조용한 분위기는 아니에요.'],
  },
];

export const voteCandidate = recommendationCandidates[0];

export const routeStops = [
  {
    name: '현재 위치',
    detail: 'Namba Station',
    type: 'start',
    top: '67%',
    left: '18%',
  },
  ...recommendationCandidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    detail: `현재 위치에서 ${candidate.distance}`,
    type: candidate.route.type,
    top: candidate.route.top,
    left: candidate.route.left,
  })),
];

export const scheduleItems = [
  {
    time: '12:30',
    title: '미즈노 오코노미야키',
    detail: '첫날 점심 · 도톤보리 · 그룹 적합도 92%',
  },
  {
    time: '16:00',
    title: '와드 오모테나시 카페',
    detail: '오후 휴식 · 난바 · 감성 카페',
  },
  {
    time: '19:30',
    title: 'Trattoria Bella',
    detail: '저녁 투표 후보 · 단체석 예약 가능',
  },
];
