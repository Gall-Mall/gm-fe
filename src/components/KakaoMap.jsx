import { useEffect, useRef, useState } from 'react';
import { ensureKakao } from '../utils/kakaoLoader';

// 브랜드 앰버 핀 (SVG 데이터 URI 마커)
const PIN_SVG = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">' +
    '<path d="M14 0C6.8 0 1 5.8 1 13c0 9 13 27 13 27s13-18 13-27C27 5.8 21.2 0 14 0z" fill="#ec9a16" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="14" cy="13" r="5" fill="#fff"/>' +
  '</svg>',
);
const PIN_SRC = `data:image/svg+xml,${PIN_SVG}`;

// 위치 선택용 지도: 드래그·클릭으로 핀 이동. center={lat,lng}, onPick(lat,lng)
export function KakaoMap({ center, onPick, height = 220 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    ensureKakao()
      .then((kakao) => {
        if (!alive || !elRef.current || mapRef.current) return;
        const pos = new kakao.maps.LatLng(center.lat, center.lng);
        const map = new kakao.maps.Map(elRef.current, { center: pos, level: 4 });

        const image = new kakao.maps.MarkerImage(PIN_SRC, new kakao.maps.Size(28, 40), {
          offset: new kakao.maps.Point(14, 40),
        });
        const marker = new kakao.maps.Marker({ position: pos, draggable: true, image });
        marker.setMap(map);

        const emit = (latlng) =>
          onPickRef.current(+latlng.getLat().toFixed(6), +latlng.getLng().toFixed(6));

        kakao.maps.event.addListener(marker, 'dragend', () => emit(marker.getPosition()));
        kakao.maps.event.addListener(map, 'click', (e) => {
          marker.setPosition(e.latLng);
          emit(e.latLng);
        });

        mapRef.current = map;
        markerRef.current = marker;
        window.setTimeout(() => map.relayout(), 60);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 외부에서 center 변경(검색) 시 지도/핀 이동
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (map && marker && window.kakao) {
      const pos = new window.kakao.maps.LatLng(center.lat, center.lng);
      map.setLevel(3);
      map.setCenter(pos);
      marker.setPosition(pos);
    }
  }, [center.lat, center.lng]);

  if (failed) {
    return (
      <div className="map-holder map-fallback" style={{ height }}>
        <span>지도를 불러오지 못했어요. 카카오 지도 키·도메인 설정을 확인해주세요.</span>
      </div>
    );
  }
  return <div ref={elRef} className="map-holder" style={{ height }} />;
}
