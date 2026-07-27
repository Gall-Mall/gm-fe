// 카카오 지도 SDK 로더. 장소검색·주소변환과 다중 마커 묶음을 함께 지원한다.
// 최초 1회만 스크립트를 주입하고, 이후 호출은 같은 Promise를 재사용한다.
const KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

let kakaoPromise = null;

export function ensureKakao() {
  if (typeof window !== 'undefined' && window.kakao && window.kakao.maps && window.kakao.maps.services) {
    return Promise.resolve(window.kakao);
  }
  if (kakaoPromise) return kakaoPromise;

  kakaoPromise = new Promise((resolve, reject) => {
    if (!KEY) {
      reject(new Error('VITE_KAKAO_MAP_KEY 가 설정되지 않았습니다.'));
      return;
    }
    const existing = document.querySelector('script[data-kakao-sdk]');
    const onReady = () => window.kakao.maps.load(() => resolve(window.kakao));
    if (existing) {
      if (window.kakao && window.kakao.maps) onReady();
      else existing.addEventListener('load', onReady);
      return;
    }
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-kakao-sdk', '');
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&libraries=services,clusterer&autoload=false`;
    s.onload = onReady;
    s.onerror = () => reject(new Error('카카오 지도 SDK 로드 실패'));
    document.head.appendChild(s);
  });
  return kakaoPromise;
}
