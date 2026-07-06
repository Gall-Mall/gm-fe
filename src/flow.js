export const steps = [
  'home',
  'create',
  'invite',
  'taste',
  'recommend',
  'result',
  'schedule',
];

export function getNextStep(currentStep) {
  const index = steps.indexOf(currentStep);
  return steps[Math.min(index + 1, steps.length - 1)];
}

export const fallbackMembers = [
  { name: '지민', status: '완료', type: '로컬 탐험가형' },
  { name: '수현', status: '완료', type: '감성 카페 수집가형' },
  { name: '민재', status: '완료', type: '가성비 미식가형' },
  { name: '나', status: '입력 중', type: '취향 확인 중' },
];

export const fallbackRecommendations = [
  {
    name: '이치란 라멘 난바점',
    category: '라멘',
    menu: '돈코츠 라멘 + 반숙 계란',
    score: 92,
    distance: '도보 12분',
    price: '1,500엔대',
    reasons: [
      '그룹 전체가 면 요리와 현지 음식을 선호해요.',
      '해산물 부담이 낮아 민재님 조건과 잘 맞아요.',
      '숙소에서 가까워 첫날 점심으로 이동 부담이 적어요.',
    ],
  },
  {
    name: '쿠시카츠 다루마',
    category: '로컬 식당',
    menu: '쿠시카츠 세트',
    score: 78,
    distance: '도보 18분',
    price: '2,200엔대',
    reasons: [
      '로컬 분위기와 친구 여행 목적에 잘 맞아요.',
      '여러 메뉴를 나눠 먹기 좋아 그룹 식사에 적합해요.',
      '웨이팅은 있지만 30분 이내 가능성이 높아요.',
    ],
  },
];

export const fallbackGroup = {
  name: '오사카 먹방 원정대',
  city: '일본 오사카',
  date: '2026.08.12 - 08.15',
  purposes: ['친구 여행', '먹방 여행'],
};
