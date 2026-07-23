import cafeImage from '../assets/cafe-card.png';
import okonomiyakiImage from '../assets/okonomiyaki-card.png';
import heroImage from '../assets/hero.png';

export { cafeImage, okonomiyakiImage, heroImage };

export const defaultGroup = {
  name: '강남 점심 모임',
  city: '강남',
  date: '오늘 저녁',
  inviteCode: 'GALM24',
  readiness: 75,
  purpose: '친구 모임',
  lat: 37.4979,
  lng: 127.0276,
  recTime: '18:00',
  distanceKm: 2,
};

export const seedGroups = [
  { name: '강남 점심 모임', city: '강남', date: '오늘 저녁', progress: 75, status: '투표 진행 중' },
  { name: '홍대 저녁 모임', city: '홍대', date: '이번 주 금요일', progress: 54, status: '준비 중' },
];

export const purposeOptions = ['친구 모임', '회식', '데이트', '가족 식사', '기념일'];

// 식약처 표시대상 알레르기 유발물질 22종
export const allergenOptions = [
  '난류(계란)', '우유', '메밀', '땅콩', '대두', '밀', '고등어', '게', '새우', '돼지고기', '복숭아',
  '토마토', '아황산류', '호두', '닭고기', '쇠고기', '오징어', '굴', '전복', '홍합', '조개류', '잣',
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

// 메뉴 투표 후보 풀 (라운드마다 여기서 10개씩 뽑아 투표)
// tags: 알레르기/제외 매칭용 성분(allergenOptions 문자열과 일치) — traits: 선호/느낌 키워드 매칭용
export const menus = [
  { id: 'kimchi-jjigae', name: '김치찌개', cat: '한식 · 국물요리', emoji: '🍲', score: 90, votes: { like: 3, maybe: 1, dislike: 1 },
    tags: ['돼지고기', '대두'], traits: ['따뜻한 국물', '매콤한', '든든한'],
    reasons: ['얼큰한 국물을 원하는 멤버에게 잘 맞아요.', '든든하게 나눠 먹기 좋아요.'], cautions: ['매운맛에 민감하면 확인하세요.'] },
  { id: 'doenjang-jjigae', name: '된장찌개', cat: '한식 · 국물요리', emoji: '🥘', score: 86, votes: { like: 2, maybe: 2, dislike: 0 },
    tags: ['대두'], traits: ['따뜻한 국물', '깔끔한', '담백한'],
    reasons: ['자극적이지 않아 무난하게 먹기 좋아요.'], cautions: ['대두(된장) 알레르기는 확인이 필요해요.'] },
  { id: 'samgyeopsal', name: '삼겹살', cat: '고기·구이', emoji: '🥓', score: 91, votes: { like: 4, maybe: 0, dislike: 0 },
    tags: ['돼지고기'], traits: ['든든한', '짭짤한'],
    reasons: ['다 같이 구워 먹기 좋은 회식 메뉴예요.', '든든한 식사를 원하는 멤버에게 맞아요.'], cautions: ['채식·돼지고기 제외 멤버는 빼주세요.'] },
  { id: 'bibimbap', name: '비빔밥', cat: '한식 · 밥요리', emoji: '🍚', score: 84, votes: { like: 3, maybe: 1, dislike: 0 },
    tags: ['난류(계란)', '대두', '쇠고기'], traits: ['깔끔한', '가벼운', '담백한'],
    reasons: ['채소 위주로 가볍게 먹기 좋아요.'], cautions: ['계란·고기 고명을 뺄 수 있는지 확인하세요.'] },
  { id: 'sushi', name: '초밥', cat: '일식 · 회', emoji: '🍣', score: 88, votes: { like: 3, maybe: 1, dislike: 1 },
    tags: ['새우', '오징어', '고등어'], traits: ['담백한', '깔끔한', '가벼운'],
    reasons: ['담백하고 깔끔한 걸 원하는 멤버에게 맞아요.'], cautions: ['해산물·갑각류 알레르기는 꼭 확인하세요.'] },
  { id: 'ramen', name: '라멘', cat: '일식 · 국물요리', emoji: '🍜', score: 85, votes: { like: 2, maybe: 1, dislike: 1 },
    tags: ['밀', '돼지고기', '난류(계란)', '대두'], traits: ['따뜻한 국물', '든든한', '매콤한'],
    reasons: ['따뜻한 국물을 원하는 멤버에게 잘 맞아요.'], cautions: ['돼지 육수라 일부 멤버가 제외했을 수 있어요.'] },
  { id: 'pasta', name: '파스타', cat: '양식 · 면요리', emoji: '🍝', score: 87, votes: { like: 3, maybe: 1, dislike: 0 },
    tags: ['밀', '우유', '토마토'], traits: ['담백한', '부드러운', '가벼운'],
    reasons: ['차분하게 나눠 먹기 좋은 메뉴예요.', '매운 음식을 못 먹는 멤버도 무난해요.'], cautions: ['크림 소스는 유당이 포함될 수 있어요.'] },
  { id: 'malatang', name: '마라탕', cat: '중식 · 국물요리', emoji: '🌶️', score: 83, votes: { like: 2, maybe: 1, dislike: 2 },
    tags: ['대두'], traits: ['매콤한', '따뜻한 국물', '든든한'],
    reasons: ['얼얼한 매운맛을 좋아하는 멤버에게 맞아요.'], cautions: ['향신료·매운맛 호불호가 큰 편이에요.'] },
  { id: 'tteokbokki', name: '떡볶이', cat: '분식', emoji: '🍢', score: 80, votes: { like: 2, maybe: 2, dislike: 1 },
    tags: ['밀', '대두'], traits: ['매콤한', '든든한'],
    reasons: ['간단히 나눠 먹기 좋은 분식이에요.'], cautions: ['밀(떡·어묵) 성분을 확인하세요.'] },
  { id: 'donkatsu', name: '돈카츠', cat: '일식 · 튀김', emoji: '🍱', score: 82, votes: { like: 3, maybe: 0, dislike: 1 },
    tags: ['밀', '돼지고기', '난류(계란)'], traits: ['든든한', '짭짤한'],
    reasons: ['바삭하고 든든한 한 끼를 원할 때 좋아요.'], cautions: ['튀김이라 느끼함에 민감하면 확인하세요.'] },
  { id: 'ricenoodle', name: '쌀국수', cat: '아시안 · 국물요리', emoji: '🍲', score: 81, votes: { like: 2, maybe: 2, dislike: 0 },
    tags: ['쇠고기'], traits: ['따뜻한 국물', '깔끔한', '담백한'],
    reasons: ['담백한 국물을 원하는 멤버에게 맞아요.'], cautions: ['고수(향신료) 호불호가 있어요.'] },
  { id: 'salad', name: '샐러드', cat: '양식 · 가벼운 식사', emoji: '🥗', score: 76, votes: { like: 1, maybe: 3, dislike: 0 },
    tags: ['토마토'], traits: ['가벼운', '깔끔한', '담백한'],
    reasons: ['가볍게 먹고 싶은 멤버에게 맞아요.'], cautions: ['식사 대용으로는 부족할 수 있어요.'] },
  { id: 'jjajang', name: '짜장면', cat: '중식 · 면요리', emoji: '🍜', score: 84, votes: { like: 3, maybe: 1, dislike: 0 },
    tags: ['밀', '대두', '돼지고기'], traits: ['든든한', '짭짤한'],
    reasons: ['무난하게 다 같이 먹기 좋아요.'], cautions: ['밀·대두(춘장) 성분을 확인하세요.'] },
  { id: 'chicken', name: '치킨', cat: '야식 · 튀김', emoji: '🍗', score: 89, votes: { like: 4, maybe: 0, dislike: 0 },
    tags: ['닭고기', '밀'], traits: ['든든한', '짭짤한', '매콤한'],
    reasons: ['실패 확률이 낮은 국민 메뉴예요.', '든든하게 나눠 먹기 좋아요.'], cautions: ['닭고기 제외 멤버는 빼주세요.'] },
  { id: 'naengmyeon', name: '냉면', cat: '한식 · 면요리', emoji: '🥶', score: 79, votes: { like: 2, maybe: 1, dislike: 1 },
    tags: ['메밀', '쇠고기', '난류(계란)'], traits: ['깔끔한', '담백한', '가벼운'],
    reasons: ['시원하고 깔끔하게 먹기 좋아요.'], cautions: ['메밀 알레르기는 꼭 확인하세요.'] },
  { id: 'pizza', name: '피자', cat: '양식 · 오븐요리', emoji: '🍕', score: 83, votes: { like: 3, maybe: 1, dislike: 0 },
    tags: ['밀', '우유', '토마토'], traits: ['든든한', '짭짤한'],
    reasons: ['여럿이 나눠 먹기 좋은 메뉴예요.'], cautions: ['유제품(치즈) 제한 멤버는 확인하세요.'] },
];

// 식당 후보 (지도 투표 단계)
export const recommendationCandidates = [
  {
    id: 'pasta-brothers', name: '파스타 브라더스', city: '강남역', category: '이탈리안', score: 88,
    distance: '도보 5분', meta: '파스타 · 단체석', scheduleLabel: '파스타', image: cafeImage,
    votes: { like: 3, maybe: 1, dislike: 0 }, geo: { dLat: 0.0035, dLng: 0.0042 },
    reasons: ['민재님의 유제품 제한을 피할 수 있는 메뉴가 있어요.', '지민님이 선호한 차분한 저녁 분위기와 잘 맞아요.', '단체석이 있어 모임에 좋아요.'],
    cautions: ['피크 시간에는 20-30분 정도 기다릴 수 있어요.', '근처 주차가 어려워 대중교통을 추천해요.'],
  },
  {
    id: 'antique-coffee', name: '앤티크 커피', city: '역삼동', category: '카페', score: 85,
    distance: '도보 8분', meta: '감성 카페 · 조용한 좌석', scheduleLabel: '감성 카페', image: cafeImage,
    votes: { like: 2, maybe: 1, dislike: 1 }, geo: { dLat: -0.0026, dLng: -0.0031 },
    reasons: ['수현님이 좋아하는 조용한 분위기예요.', '식사 후 가볍게 이야기 나누기 좋아요.', '디저트·커피 중심이라 부담이 적어요.'],
    cautions: ['식사보다는 디저트와 커피에 가까워요.', '4명 모두 앉을 좌석은 방문 시간에 따라 달라질 수 있어요.'],
  },
  {
    id: 'izakaya-haru', name: '이자카야 하루', city: '강남역', category: '일식', score: 92,
    distance: '도보 10분', meta: '이자카야 · 로컬 인기', scheduleLabel: '로컬 맛집', image: okonomiyakiImage,
    votes: { like: 3, maybe: 0, dislike: 1 }, geo: { dLat: 0.0016, dLng: 0.0058 },
    reasons: ['그룹 전체가 면·구이 요리를 선호해요.', '회식 자리로 무난한 인기 맛집이에요.', '메뉴가 다양해 취향을 맞추기 좋아요.'],
    cautions: ['웨이팅이 길면 예약을 추천해요.', '좌석이 활기찬 편이라 조용하진 않아요.'],
  },
];

export const voteCandidate = recommendationCandidates[0];

export const groupMembersSeed = [
  { id: 'me', name: '나', email: 'me@kakao.com', role: 'host' },
  { id: 'jimin', name: '지민', email: 'jimin@kakao.com', role: 'member' },
  { id: 'suhyun', name: '수현', email: 'suhyun@naver.com', role: 'member' },
  { id: 'minjae', name: '민재', email: 'minjae@kakao.com', role: 'member' },
];

// 다가오는 모임 (일정 화면 예시)
export const scheduleItems = [
  { time: '오늘 18:30', title: '이자카야 하루', detail: '강남 점심 모임 · 강남역 · 그룹 적합도 92%' },
  { time: '내일 12:30', title: '파스타 브라더스', detail: '점심 번개 · 강남역 · 단체석 예약 가능' },
  { time: '금요일 19:00', title: '홍대 저녁 모임', detail: '장소 투표 진행 중' },
];

export const archiveGroups = [
  {
    group: '강남 점심 모임', city: '강남', period: '지난 모임',
    meals: [
      { dateLabel: '06.12', when: '점심', place: '이자카야 하루', city: '강남역', tag: '로컬 맛집', img: okonomiyakiImage, score: 92, like: 3, maybe: 0, dislike: 1, note: '그룹 전원이 인기 맛집을 원해서 만장일치에 가깝게 정해졌어요.' },
      { dateLabel: '06.19', when: '저녁', place: '파스타 브라더스', city: '강남역', tag: '파스타', img: cafeImage, score: 88, like: 3, maybe: 1, dislike: 0, note: '단체석과 차분한 분위기 덕에 저녁 자리로 딱 맞았어요.' },
      { dateLabel: '06.26', when: '오후', place: '앤티크 커피', city: '역삼동', tag: '감성 카페', img: cafeImage, score: 85, like: 2, maybe: 1, dislike: 1, note: '디저트·커피 중심이라 반응이 조금 갈렸지만 여유로웠어요.' },
    ],
  },
  {
    group: '홍대 저녁 모임', city: '홍대', period: '지난 모임',
    meals: [
      { dateLabel: '05.02', when: '저녁', place: '을지로 노가리 골목', city: '을지로', tag: '로컬 펍', img: okonomiyakiImage, score: 90, like: 4, maybe: 0, dislike: 0, note: '가볍게 한잔하며 이야기 나누기 좋아 전원 만족했어요.' },
      { dateLabel: '05.09', when: '점심', place: '성수 브런치 하우스', city: '성수동', tag: '브런치', img: cafeImage, score: 82, like: 2, maybe: 2, dislike: 0, note: '웨이팅이 있었지만 분위기와 커피가 좋아 반응이 나쁘지 않았어요.' },
    ],
  },
];
