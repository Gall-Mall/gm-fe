import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RestaurantSearchPage } from './RestaurantSearchPage';

vi.mock('../../components/KakaoMap', () => ({
  KakaoMap: ({ focus, height, markers, onClusterClick, onMarkerClick }) => (
    <>
      <div
        aria-label="지도"
        data-focus={focus ? `${focus.lat},${focus.lng}` : ''}
        data-height={height}
      />
      {markers?.map((marker) => (
        <button
          type="button"
          key={marker.id}
          onClick={() => onMarkerClick?.(marker)}
        >
          {marker.label} 지도 마커
        </button>
      ))}
      {markers?.length > 1 && onClusterClick ? (
        <button type="button" onClick={() => onClusterClick(markers)}>겹친 식당 보기</button>
      ) : null}
    </>
  ),
}));

afterEach(cleanup);

describe('RestaurantSearchPage', () => {
  it('검색 대기 중에는 저장된 결과를 다시 확인할 수 있다', () => {
    const refreshRestaurantResults = vi.fn();
    render(<RestaurantSearchPage flow={{
      goToStep: vi.fn(),
      gset: { lat: 37.5, lng: 127, distanceKm: 2 },
      groupRestaurants: [],
      toggleGroupRestaurant: vi.fn(),
      decidedMenu: { name: '김치찌개' },
      restaurantCandidates: [],
      restaurantSearchStatus: 'waiting',
      requestRestaurantSearch: vi.fn(),
      refreshRestaurantResults,
      voteStartStatus: 'connected',
      operationError: '',
    }} />);

    fireEvent.click(screen.getByRole('button', { name: '검색 결과 다시 확인' }));

    expect(refreshRestaurantResults).toHaveBeenCalledTimes(1);
  });

  it('식당 카드를 누르면 지도가 이동하고 같은 페이지에서 확정한다', () => {
    const goToStep = vi.fn();
    const confirmSchedule = vi.fn();
    render(<RestaurantSearchPage flow={{
      goToStep,
      gset: { lat: 37.5, lng: 127, distanceKm: 2, recTime: '18:30' },
      groupRestaurants: [],
      toggleGroupRestaurant: vi.fn(),
      decidedMenu: { name: '김치찌개' },
      restaurantCandidates: [{
        id: 'place-1',
        name: '김치식당',
        city: '서울 강남구',
        distance: '120m',
        meta: '한식',
        lat: 37.51,
        lng: 127.01,
        url: 'https://place.map.kakao.com/place-1',
        externalPlaceId: 'place-1',
      }],
      restaurantSearchStatus: 'ready',
      requestRestaurantSearch: vi.fn(),
      refreshRestaurantResults: vi.fn(),
      voteStartStatus: 'connected',
      operationError: '',
      confirmSchedule,
    }} />);

    const restaurantList = screen.getByRole('region', { name: '식당 검색 결과' });
    expect(restaurantList.classList.contains('rest-list-panel')).toBe(true);
    expect(screen.getByLabelText('지도').getAttribute('data-height')).toBe('360');
    expect(screen.getByRole('button', { name: '식당 확정하기' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '김치식당 지도에서 보기' }));
    expect(screen.getByLabelText('지도').getAttribute('data-focus')).toBe('37.51,127.01');
    fireEvent.click(screen.getByRole('button', { name: '김치식당 식당 정보 보기' }));
    const detailDialog = screen.getByRole('dialog', { name: '김치식당 상세 정보' });
    expect(detailDialog.querySelector('iframe').getAttribute('src'))
      .toBe('https://place.map.kakao.com/place-1');
    fireEvent.click(screen.getByRole('button', { name: '식당 상세 정보 닫기' }));
    expect(screen.queryByRole('dialog', { name: '김치식당 상세 정보' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '식당 확정하기' }));
    expect(confirmSchedule).toHaveBeenCalledWith('place-1', '18:30');
    expect(goToStep).not.toHaveBeenCalledWith('result');
  });

  it('겹친 마커를 누르면 지도 안에서 식당 목록을 고를 수 있다', () => {
    render(<RestaurantSearchPage flow={{
      goToStep: vi.fn(),
      gset: { lat: 37.5, lng: 127, distanceKm: 2, recTime: '18:30' },
      decidedMenu: { name: '김치찌개' },
      restaurantCandidates: [
        {
          id: 'place-1', name: '김치식당', city: '서울 강남구', distance: '120m',
          meta: '한식', lat: 37.51, lng: 127.01, url: 'https://place.map.kakao.com/place-1',
        },
        {
          id: 'place-2', name: '된장식당', city: '서울 강남구', distance: '130m',
          meta: '한식', lat: 37.5101, lng: 127.0101, url: 'https://place.map.kakao.com/place-2',
        },
      ],
      restaurantSearchStatus: 'ready',
      requestRestaurantSearch: vi.fn(),
      refreshRestaurantResults: vi.fn(),
      voteStartStatus: 'connected',
      operationError: '',
      confirmSchedule: vi.fn(),
    }} />);

    fireEvent.click(screen.getByRole('button', { name: '겹친 식당 보기' }));
    expect(screen.getByRole('region', { name: '겹친 위치의 식당 목록' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '된장식당 선택' }));
    expect(screen.getByLabelText('지도').getAttribute('data-focus')).toBe('37.5101,127.0101');
  });

  it('같은 식당 마커를 다시 누르면 상세 모달을 연다', () => {
    render(<RestaurantSearchPage flow={{
      goToStep: vi.fn(),
      gset: { lat: 37.5, lng: 127, distanceKm: 2, recTime: '18:30' },
      decidedMenu: { name: '김치찌개' },
      restaurantCandidates: [{
        id: 'place-1',
        name: '김치식당',
        city: '서울 강남구',
        distance: '120m',
        meta: '한식',
        lat: 37.51,
        lng: 127.01,
        url: 'https://place.map.kakao.com/place-1',
      }],
      restaurantSearchStatus: 'ready',
      requestRestaurantSearch: vi.fn(),
      refreshRestaurantResults: vi.fn(),
      voteStartStatus: 'connected',
      operationError: '',
      confirmSchedule: vi.fn(),
    }} />);

    const marker = screen.getByRole('button', { name: '김치식당 지도 마커' });
    fireEvent.click(marker);
    expect(screen.queryByRole('dialog', { name: '김치식당 상세 정보' })).toBeNull();

    fireEvent.click(marker);
    expect(screen.getByRole('dialog', { name: '김치식당 상세 정보' })).toBeTruthy();
  });
});
