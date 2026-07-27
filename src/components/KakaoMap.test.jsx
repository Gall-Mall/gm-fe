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

  beforeEach(() => {
    markerSetMap = vi.fn();
    mapPanTo = vi.fn();
    mapSetLevel = vi.fn();
    addListener = vi.fn();
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
        Marker: function Marker() {
          this.setMap = markerSetMap;
        },
        CustomOverlay: function CustomOverlay() {
          this.setMap = vi.fn();
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

    await waitFor(() => expect(markerSetMap).toHaveBeenCalledTimes(1));
  });

  it('식당 카드에서 전달한 좌표로 지도 중심을 이동한다', async () => {
    const markers = [{ lat: 37.51, lng: 127.01, label: '김치식당' }];
    const { rerender } = render(
      <KakaoMap center={{ lat: 37.5, lng: 127 }} markers={markers} />,
    );
    await waitFor(() => expect(markerSetMap).toHaveBeenCalledTimes(1));

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

  it('식당 마커를 누르면 외부 상세 정보를 새 탭으로 연다', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <KakaoMap
        center={{ lat: 37.5, lng: 127 }}
        markers={[{
          lat: 37.51,
          lng: 127.01,
          label: '김치식당',
          url: 'https://place.map.kakao.com/place-1',
        }]}
      />,
    );

    await waitFor(() => expect(addListener).toHaveBeenCalledWith(
      expect.anything(),
      'click',
      expect.any(Function),
    ));
    const clickHandler = addListener.mock.calls.find((call) => call[1] === 'click')[2];
    clickHandler();

    expect(open).toHaveBeenCalledWith(
      'https://place.map.kakao.com/place-1',
      '_blank',
      'noopener,noreferrer',
    );
    open.mockRestore();
  });
});
