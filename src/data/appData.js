import cafeImage from '../assets/cafe-card.png';
import okonomiyakiImage from '../assets/okonomiyaki-card.png';
import osakaHero from '../assets/osaka-hero.png';

export { cafeImage, okonomiyakiImage, osakaHero };

export const defaultGroup = {
  name: 'Osaka Foodies',
  city: 'Osaka, Japan',
  date: 'Oct 12 - Oct 18, 2024',
  inviteCode: 'GALM24',
  readiness: 75,
  purpose: '먹방여행',
  lat: 37.5665,
  lng: 126.978,
  recTime: '18:00',
  distanceKm: 2,
};

export const travelGroups = [
  { name: 'Osaka Foodies', city: 'Osaka, Japan', date: 'Oct 12 - Oct 18', progress: 75, status: 'Day 3 of 4' },
  { name: 'Seoul Weekend', city: 'Seoul, South Korea', date: 'Nov 2 - Nov 4', progress: 54, status: 'Day 1 of 2' },
];

export const purposeOptions = ['먹방여행', '카페 투어', '로컬 탐방', '휴식 여행', '쇼핑'];

export const allergenOptions = [
  '난류(계란)', '우유', '땅콩', '견과류', '대두', '밀', '메밀', '갑각류(새우·게)',
  '조개류', '고등어', '복숭아', '토마토', '돼지고기', '닭고기', '쇠고기', '오징어', '아황산류', '호두',
];

export const menuMaster = {
  한식: ['김치찌개', '된장찌개', '청국장', '순대국', '육회', '홍어', '보쌈', '비빔밥', '불고기', '갈비탕', '냉면'],
  중식: ['짜장면', '짬뽕', '마라탕', '마라샹궈', '양꼬치', '훠궈', '탕수육', '유린기', '깐풍기'],
  일식: ['초밥', '회', '라멘', '낫토', '우동', '돈카츠', '나베', '규동'],
  양식: ['파스타', '스테이크', '피자', '리조또', '감바스', '샐러드'],
  분식: ['떡볶이', '순대', '김밥', '튀김', '라볶이', '쫄면'],
  아시안: ['쌀국수', '팟타이', '분짜', '나시고렝', '커리', '향신료(고수)'],
  '고기·구이': ['삼겹살', '양고기', '대창', '곱창', '막창', '닭발'],
  해산물: ['굴', '조개찜', '새우', '게', '문어', '산낙지'],
};

export const suggestKeywords = ['든든한', '깔끔한', '매콤한', '따뜻한 국물', '가벼운'];

// 메뉴 투표 후보 (첫 단계: 음식 목록)
export const menus = [
  {
    id: 'okonomiyaki', name: '오코노미야키', cat: '일식 · 철판요리', image: okonomiyakiImage, score: 92,
    votes: { like: 3, maybe: 0, dislike: 1 },
    reasons: ['그룹 전체가 현지 음식과 면·철판 요리를 선호해요.', '저장한 알레르기 성분이 들어가지 않은 조합이에요.', '짭짤하고 든든한 맛을 원하는 멤버에게 잘 맞아요.'],
    cautions: ['가다랑어포가 올라가 비린맛에 민감하면 확인하세요.', '조리 시간이 다소 걸릴 수 있어요.'],
  },
  {
    id: 'pasta', name: '파스타', cat: '양식 · 면요리', image: cafeImage, score: 88,
    votes: { like: 3, maybe: 1, dislike: 0 },
    reasons: ['차분하게 나눠 먹기 좋은 메뉴예요.', '매운 음식을 못 먹는 멤버도 무난해요.'],
    cautions: ['크림 소스는 유당이 포함될 수 있어요.'],
  },
  {
    id: 'ramen', name: '라멘', cat: '일식 · 국물요리', image: okonomiyakiImage, score: 84,
    votes: { like: 2, maybe: 1, dislike: 1 },
    reasons: ['따뜻한 국물을 원하는 멤버에게 잘 맞아요.'],
    cautions: ['돼지 육수라 일부 멤버가 제외했을 수 있어요.', '면 양이 많아 호불호가 있어요.'],
  },
  {
    id: 'dessert', name: '디저트 플레이트', cat: '카페 · 디저트', image: cafeImage, score: 79,
    votes: { like: 2, maybe: 2, dislike: 0 },
    reasons: ['식사 후 가볍게 즐기기 좋아요.', '사진 찍기 좋은 분위기를 원하는 멤버에게 맞아요.'],
    cautions: ['식사 대용으로는 부족할 수 있어요.'],
  },
];

// 식당 후보 (지도 투표 단계)
export const recommendationCandidates = [
  {
    id: 'trattoria-bella', name: 'Trattoria Bella', city: 'Namba, Osaka', category: 'Italian', score: 88,
    distance: '도보 12분', meta: '파스타 · 단체석', scheduleLabel: '파스타', image: cafeImage,
    votes: { like: 3, maybe: 1, dislike: 0 }, geo: { dLat: 0.0035, dLng: 0.0042 },
    reasons: ['민재님의 유제품 제한을 피할 수 있는 메뉴가 있어요.', '지민님이 선호한 차분한 저녁 분위기와 잘 맞아요.', '수현님이 저장한 카페 거리와 같은 동선에 있어요.'],
    cautions: ['피크 시간에는 20-30분 정도 기다릴 수 있어요.', '근처 주차가 어려워 도보 이동을 추천해요.'],
  },
  {
    id: 'wad-omotenashi-cafe', name: '와드 오모테나시 카페', city: 'Namba, Osaka', category: 'Cafe', score: 85,
    distance: '도보 8분', meta: '감성 카페 · 조용한 좌석', scheduleLabel: '감성 카페', image: cafeImage,
    votes: { like: 2, maybe: 1, dislike: 1 }, geo: { dLat: -0.0026, dLng: -0.0031 },
    reasons: ['수현님이 저장한 카페 거리와 같은 동선에 있어요.', '오후 일정 피로를 줄이기 좋은 조용한 분위기예요.', '식사 후 바로 이동하기 쉬운 난바 중심 후보예요.'],
    cautions: ['식사보다는 디저트와 휴식에 가까워요.', '4명 모두 앉을 좌석은 방문 시간에 따라 달라질 수 있어요.'],
  },
  {
    id: 'mizuno-okonomiyaki', name: '미즈노 오코노미야키', city: 'Dotonbori, Osaka', category: 'Japanese', score: 92,
    distance: '도보 15분', meta: '오코노미야키 · 로컬 맛집', scheduleLabel: '로컬 맛집', image: okonomiyakiImage,
    votes: { like: 3, maybe: 0, dislike: 1 }, geo: { dLat: 0.0016, dLng: 0.0058 },
    reasons: ['그룹 전체가 면 요리와 현지 음식을 선호해요.', '첫날 저녁 동선에서 크게 벗어나지 않아요.', '현지 음식 경험을 원하는 멤버에게 가장 잘 맞아요.'],
    cautions: ['웨이팅이 길면 다음 일정이 밀릴 수 있어요.', '철판 좌석이라 조용한 분위기는 아니에요.'],
  },
];

export const voteCandidate = recommendationCandidates[0];

export const groupMembersSeed = [
  { id: 'me', name: '나', email: 'me@kakao.com', role: 'host' },
  { id: 'jimin', name: '지민', email: 'jimin@kakao.com', role: 'member' },
  { id: 'suhyun', name: '수현', email: 'suhyun@naver.com', role: 'member' },
  { id: 'minjae', name: '민재', email: 'minjae@kakao.com', role: 'member' },
];

export const scheduleItems = [
  { time: '12:30', title: '미즈노 오코노미야키', detail: '첫날 점심 · 도톤보리 · 그룹 적합도 92%' },
  { time: '16:00', title: '와드 오모테나시 카페', detail: '오후 휴식 · 난바 · 감성 카페' },
  { time: '19:30', title: 'Trattoria Bella', detail: '저녁 투표 후보 · 단체석 예약 가능' },
];

export const archiveGroups = [
  {
    group: 'Osaka Foodies', city: 'Osaka, Japan', period: 'Oct 12 - Oct 18, 2024',
    meals: [
      { dateLabel: '10.12', when: '첫날 점심', place: '미즈노 오코노미야키', city: '도톤보리', tag: '로컬 맛집', img: okonomiyakiImage, score: 92, like: 3, maybe: 0, dislike: 1, note: '그룹 전원이 현지 음식을 원해서 만장일치에 가깝게 정해졌어요.' },
      { dateLabel: '10.13', when: '저녁', place: 'Trattoria Bella', city: '난바', tag: '파스타', img: cafeImage, score: 88, like: 3, maybe: 1, dislike: 0, note: '단체석과 차분한 분위기 덕에 저녁 자리로 딱 맞았어요.' },
      { dateLabel: '10.14', when: '오후 휴식', place: '와드 오모테나시 카페', city: '난바', tag: '감성 카페', img: cafeImage, score: 85, like: 2, maybe: 1, dislike: 1, note: '디저트·휴식 중심이라 반응이 조금 갈렸지만 여유로웠어요.' },
    ],
  },
  {
    group: 'Seoul Weekend', city: 'Seoul, South Korea', period: 'Nov 2 - Nov 4, 2024',
    meals: [
      { dateLabel: '11.02', when: '첫날 저녁', place: '을지로 노가리 골목', city: '을지로', tag: '로컬 펍', img: okonomiyakiImage, score: 90, like: 4, maybe: 0, dislike: 0, note: '가볍게 한잔하며 이야기 나누기 좋아 전원 만족했어요.' },
      { dateLabel: '11.03', when: '점심', place: '성수 브런치 하우스', city: '성수동', tag: '브런치', img: cafeImage, score: 82, like: 2, maybe: 2, dislike: 0, note: '웨이팅이 있었지만 분위기와 커피가 좋아 반응이 나쁘지 않았어요.' },
    ],
  },
];
