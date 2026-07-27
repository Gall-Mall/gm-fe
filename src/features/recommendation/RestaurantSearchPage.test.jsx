import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RestaurantSearchPage } from './RestaurantSearchPage';

vi.mock('../../components/KakaoMap', () => ({
  KakaoMap: ({ focus }) => (
    <div
      aria-label="지도"
      data-focus={focus ? `${focus.lat},${focus.lng}` : ''}
    />
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

    expect(screen.getByRole('button', { name: '식당 확정하기' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /김치식당/ }));
    expect(screen.getByLabelText('지도').getAttribute('data-focus')).toBe('37.51,127.01');
    expect(screen.getByRole('link', { name: '김치식당 식당 정보 보기' }).getAttribute('href'))
      .toBe('https://place.map.kakao.com/place-1');

    fireEvent.click(screen.getByRole('button', { name: '식당 확정하기' }));
    expect(confirmSchedule).toHaveBeenCalledWith('place-1', '18:30');
    expect(goToStep).not.toHaveBeenCalledWith('result');
  });
});
