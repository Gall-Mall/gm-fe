import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureKakao } from '../utils/kakaoLoader';
import { KakaoMap } from './KakaoMap';

vi.mock('../utils/kakaoLoader', () => ({
  ensureKakao: vi.fn(),
}));

describe('KakaoMap', () => {
  let markerSetMap;
  let mapPanTo;
  let mapSetLevel;
  let addListener;
  let clustererAddMarkers;
  let createdMarkers;
  let createdOverlays;

  beforeEach(() => {
    markerSetMap = vi.fn();
    mapPanTo = vi.fn();
    mapSetLevel = vi.fn();
    addListener = vi.fn();
    clustererAddMarkers = vi.fn();
    createdMarkers = [];
    createdOverlays = [];
    const kakao = {
      maps: {
        LatLng: function LatLng(lat, lng) {
          this.lat = lat;
          this.lng = lng;
        },
        Map: function Map() {
          this.relayout = vi.fn();
          this.setBounds = vi.fn();
          this.panTo = mapPanTo;
          this.setLevel = mapSetLevel;
        },
        MarkerImage: function MarkerImage() {},
        Size: function Size() {},
        Point: function Point() {},
        LatLngBounds: function LatLngBounds() {
          this.extend = vi.fn();
        },
        Marker: function Marker(options) {
          this.options = options;
          this.setMap = markerSetMap;
          createdMarkers.push(this);
        },
        CustomOverlay: function CustomOverlay(options) {
          this.options = options;
          this.setMap = vi.fn();
          createdOverlays.push(this);
        },
        MarkerClusterer: function MarkerClusterer() {
          this.addMarkers = clustererAddMarkers;
          this.clear = vi.fn();
        },
        event: { addListener },
      },
    };
    ensureKakao.mockResolvedValue(kakao);
  });

  it('지도 생성 뒤 식당 좌표가 도착해도 마커를 추가한다', async () => {
    const { rerender } = render(
      <KakaoMap center={{ lat: 37.5, lng: 127 }} markers={[]} />,
    );
    await waitFor(() => expect(ensureKakao).toHaveBeenCalledTimes(1));

    rerender(
      <KakaoMap
        center={{ lat: 37.5, lng: 127 }}
        markers={[{ lat: 37.51, lng: 127.01, label: '김치식당' }]}
      />,
    );

    await waitFor(() => expect(clustererAddMarkers).toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything()]),
    ));
  });

  it('식당 카드에서 전달한 좌표로 지도 중심을 이동한다', async () => {
    const markers = [{ lat: 37.51, lng: 127.01, label: '김치식당' }];
    const { rerender } = render(
      <KakaoMap center={{ lat: 37.5, lng: 127 }} markers={markers} />,
    );
    await waitFor(() => expect(clustererAddMarkers).toHaveBeenCalled());

    rerender(
      <KakaoMap
        center={{ lat: 37.5, lng: 127 }}
        markers={markers}
        focus={{ lat: 37.51, lng: 127.01 }}
      />,
    );

    await waitFor(() => expect(mapPanTo).toHaveBeenCalledWith(
      expect.objectContaining({ lat: 37.51, lng: 127.01 }),
    ));
    expect(mapSetLevel).toHaveBeenCalledWith(2);
  });

  it('식당 마커를 누르면 선택한 식당 정보를 상위 화면에 전달한다', async () => {
    const onMarkerClick = vi.fn();
    const restaurant = {
      id: 'place-1',
      lat: 37.51,
      lng: 127.01,
      label: '김치식당',
      url: 'https://place.map.kakao.com/place-1',
    };
    render(
      <KakaoMap
        center={{ lat: 37.5, lng: 127 }}
        markers={[restaurant]}
        onMarkerClick={onMarkerClick}
      />,
    );

    await waitFor(() => expect(addListener).toHaveBeenCalledWith(
      expect.anything(),
      'click',
      expect.any(Function),
    ));
    const clickHandler = addListener.mock.calls.find((call) => call[1] === 'click')[2];
    clickHandler();

    expect(onMarkerClick).toHaveBeenCalledWith(restaurant);
  });

  it('마커 이름은 커서를 올린 동안에만 지도에 표시한다', async () => {
    render(
      <KakaoMap
        center={{ lat: 37.5, lng: 127 }}
        markers={[{ lat: 37.51, lng: 127.01, label: '김치식당' }]}
      />,
    );

    await waitFor(() => expect(createdOverlays).toHaveLength(1));
    const mouseover = addListener.mock.calls.find((call) => call[1] === 'mouseover')[2];
    const mouseout = addListener.mock.calls.find((call) => call[1] === 'mouseout')[2];

    expect(createdOverlays[0].setMap).not.toHaveBeenCalled();
    mouseover();
    expect(createdOverlays[0].setMap).toHaveBeenCalledWith(expect.anything());
    mouseout();
    expect(createdOverlays[0].setMap).toHaveBeenLastCalledWith(null);
  });

  it('겹친 마커 묶음을 누르면 포함된 식당 목록을 전달한다', async () => {
    const onClusterClick = vi.fn();
    const markers = [
      { id: 'place-1', lat: 37.51, lng: 127.01, label: '김치식당' },
      { id: 'place-2', lat: 37.5101, lng: 127.0101, label: '된장식당' },
    ];
    render(
      <KakaoMap
        center={{ lat: 37.5, lng: 127 }}
        markers={markers}
        onClusterClick={onClusterClick}
      />,
    );

    await waitFor(() => expect(clustererAddMarkers).toHaveBeenCalled());
    const clusterClick = addListener.mock.calls.find((call) => call[1] === 'clusterclick')[2];
    clusterClick({ getMarkers: () => createdMarkers });

    expect(onClusterClick).toHaveBeenCalledWith(markers);
  });
});
