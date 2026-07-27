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

// 위치 선택용 지도(단일 핀 드래그·클릭) 또는 읽기전용 다중 마커 지도.
// - 선택 모드: onPick(lat,lng) 전달
// - 표시 모드: markers=[{lat,lng,label}] 전달
export function KakaoMap({
  center,
  onPick,
  markers = null,
  focus = null,
  height = 220,
  onMarkerClick,
  onClusterClick,
}) {
  const readOnly = Array.isArray(markers);
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const kakaoRef = useRef(null);
  const markerImageRef = useRef(null);
  const clustererRef = useRef(null);
  const displayObjectsRef = useRef([]);
  const onPickRef = useRef(onPick);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onClusterClickRef = useRef(onClusterClick);
  onPickRef.current = onPick;
  onMarkerClickRef.current = onMarkerClick;
  onClusterClickRef.current = onClusterClick;
  const [failed, setFailed] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let alive = true;
    ensureKakao()
      .then((kakao) => {
        if (!alive || !elRef.current || mapRef.current) return;
        const pos = new kakao.maps.LatLng(center.lat, center.lng);
        const map = new kakao.maps.Map(elRef.current, { center: pos, level: 4 });
        mapRef.current = map;
        kakaoRef.current = kakao;

        const image = new kakao.maps.MarkerImage(PIN_SRC, new kakao.maps.Size(28, 40), {
          offset: new kakao.maps.Point(14, 40),
        });
        markerImageRef.current = image;

        if (!readOnly) {
          const marker = new kakao.maps.Marker({ position: pos, draggable: true, image });
          marker.setMap(map);
          markerRef.current = marker;
          const emit = (latlng) => onPickRef.current(+latlng.getLat().toFixed(6), +latlng.getLng().toFixed(6));
          kakao.maps.event.addListener(marker, 'dragend', () => emit(marker.getPosition()));
          kakao.maps.event.addListener(map, 'click', (e) => {
            marker.setPosition(e.latLng);
            emit(e.latLng);
          });
        }

        setMapReady(true);
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

  // 표시 모드: 비동기로 검색 결과가 도착하거나 변경되면 기존 마커를 교체한다.
  useEffect(() => {
    if (!readOnly || !mapReady) return undefined;
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) return undefined;

    clustererRef.current?.clear();
    clustererRef.current = null;
    displayObjectsRef.current.forEach((object) => object.setMap(null));
    displayObjectsRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();
    const markerDataByObject = new Map();
    const mapMarkers = [];
    markers
      .filter((marker) => Number.isFinite(marker.lat) && Number.isFinite(marker.lng))
      .forEach((mk) => {
        const position = new kakao.maps.LatLng(mk.lat, mk.lng);
        const marker = new kakao.maps.Marker({
          position,
          image: markerImageRef.current,
          clickable: true,
        });
        markerDataByObject.set(marker, mk);
        mapMarkers.push(marker);
        displayObjectsRef.current.push(marker);
        bounds.extend(position);

        kakao.maps.event.addListener(marker, 'click', () => {
          if (onMarkerClickRef.current) {
            onMarkerClickRef.current(mk);
          } else if (typeof mk.url === 'string' && /^https?:\/\//i.test(mk.url)) {
            window.open(mk.url, '_blank', 'noopener,noreferrer');
          }
        });

        if (mk.label) {
          const label = document.createElement('span');
          label.className = 'map-pin-label';
          label.textContent = mk.label;
          const overlay = new kakao.maps.CustomOverlay({
            position,
            yAnchor: 2.2,
            content: label,
          });
          kakao.maps.event.addListener(marker, 'mouseover', () => overlay.setMap(map));
          kakao.maps.event.addListener(marker, 'mouseout', () => overlay.setMap(null));
          displayObjectsRef.current.push(overlay);
        }
      });

    if (typeof kakao.maps.MarkerClusterer === 'function' && mapMarkers.length) {
      const clusterer = new kakao.maps.MarkerClusterer({
        map,
        averageCenter: true,
        minLevel: 3,
        disableClickZoom: true,
        gridSize: 44,
      });
      clusterer.addMarkers(mapMarkers);
      clustererRef.current = clusterer;
      kakao.maps.event.addListener(clusterer, 'clusterclick', (cluster) => {
        const clusterItems = cluster
          .getMarkers()
          .map((marker) => markerDataByObject.get(marker))
          .filter(Boolean);
        if (clusterItems.length && onClusterClickRef.current) {
          onClusterClickRef.current(clusterItems);
          return;
        }
        if (typeof map.getLevel === 'function' && typeof cluster.getCenter === 'function') {
          map.setLevel(Math.max(1, map.getLevel() - 1), { anchor: cluster.getCenter() });
        }
      });
    } else {
      mapMarkers.forEach((marker) => marker.setMap(map));
    }

    if (mapMarkers.length) map.setBounds(bounds);

    return undefined;
  }, [mapReady, markers, readOnly]);

  // 선택 모드: 외부에서 center 변경(검색) 시 지도/핀 이동
  useEffect(() => {
    if (readOnly) return;
    const map = mapRef.current;
    const marker = markerRef.current;
    if (map && marker && window.kakao) {
      const pos = new window.kakao.maps.LatLng(center.lat, center.lng);
      map.setLevel(3);
      map.setCenter(pos);
      marker.setPosition(pos);
    }
  }, [center.lat, center.lng, readOnly]);

  // 표시 모드: 외부 목록에서 식당을 누르면 해당 마커 위치로 확대 이동한다.
  useEffect(() => {
    if (!readOnly || !mapReady || !focus) return;
    if (!Number.isFinite(focus.lat) || !Number.isFinite(focus.lng)) return;
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) return;
    const position = new kakao.maps.LatLng(focus.lat, focus.lng);
    map.setLevel(2);
    if (typeof map.panTo === 'function') map.panTo(position);
    else map.setCenter(position);
  }, [focus?.lat, focus?.lng, mapReady, readOnly]);

  useEffect(() => () => {
    clustererRef.current?.clear();
    clustererRef.current = null;
    displayObjectsRef.current.forEach((object) => object.setMap(null));
    displayObjectsRef.current = [];
  }, []);

  if (failed) {
    return (
      <div className="map-holder map-fallback" style={{ height }}>
        <span>지도를 불러오지 못했어요. 카카오 지도 키·도메인 설정을 확인해주세요.</span>
      </div>
    );
  }
  return <div ref={elRef} className="map-holder" style={{ height }} />;
}
