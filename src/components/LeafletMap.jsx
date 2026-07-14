import { useEffect, useRef } from 'react';

let leafletPromise = null;
function ensureLeaflet() {
  if (typeof window !== 'undefined' && window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet', '');
      document.head.appendChild(link);
    }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => resolve(window.L);
    document.head.appendChild(s);
  });
  return leafletPromise;
}

// 위치 선택용 지도: 드래그·클릭으로 핀 이동. center={lat,lng}, onPick(lat,lng)
export function LeafletMap({ center, onPick, height = 220 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    ensureLeaflet().then((L) => {
      if (!alive || !elRef.current || mapRef.current) return;
      const map = L.map(elRef.current, { zoomControl: true }).setView([center.lat, center.lng], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', attribution: '© OpenStreetMap © CARTO', maxZoom: 20, detectRetina: true,
      }).addTo(map);
      const icon = L.divIcon({
        className: '',
        html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#ec9a16;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.35)"></div>',
        iconSize: [22, 22], iconAnchor: [11, 22],
      });
      const marker = L.marker([center.lat, center.lng], { draggable: true, icon }).addTo(map);
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        onPick(+p.lat.toFixed(6), +p.lng.toFixed(6));
      });
      map.on('click', (e) => onPick(+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6)));
      mapRef.current = map;
      markerRef.current = marker;
      window.setTimeout(() => map.invalidateSize(), 60);
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
    if (map && marker) {
      map.setView([center.lat, center.lng], 15);
      marker.setLatLng([center.lat, center.lng]);
    }
  }, [center.lat, center.lng]);

  return <div ref={elRef} className="leaflet-holder" style={{ height }} />;
}
