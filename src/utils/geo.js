import { ensureKakao } from './kakaoLoader';

// 0.5 단위로 스냅하고 0.5~30km 범위로 보정
export function normDistance(raw) {
  let n = parseFloat(raw);
  if (Number.isNaN(n)) n = 0.5;
  n = Math.round(n * 2) / 2;
  n = Math.min(30, Math.max(0.5, n));
  return n;
}

// 카카오 키워드 장소 검색 (예: "선릉역", "강남역")
export async function geocodePlace(query) {
  const kakao = await ensureKakao();
  return new Promise((resolve) => {
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(query, (data, status) => {
      if (status === kakao.maps.services.Status.OK && data.length) {
        // x=경도(lng), y=위도(lat)
        resolve({ lat: +(+data[0].y).toFixed(6), lng: +(+data[0].x).toFixed(6) });
      } else {
        resolve(null);
      }
    });
  });
}

// 좌표 → 짧은 주소 (도로명 우선, 없으면 지번)
export async function reverseGeocode(lat, lng) {
  const kakao = await ensureKakao();
  return new Promise((resolve) => {
    const geocoder = new kakao.maps.services.Geocoder();
    // coord2Address(경도, 위도) 순서 주의
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result.length) {
        const road = result[0].road_address && result[0].road_address.address_name;
        const jibun = result[0].address && result[0].address.address_name;
        resolve(road || jibun || null);
      } else {
        resolve(null);
      }
    });
  });
}
