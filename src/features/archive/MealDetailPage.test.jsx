import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MealDetailPage } from './MealDetailPage';

vi.mock('../../components/KakaoMap', () => ({
  KakaoMap: ({ center, markers }) => (
    <div
      aria-label="지난 식사 위치 지도"
      data-center={`${center.lat},${center.lng}`}
      data-marker-url={markers[0]?.url || ''}
    />
  ),
}));

afterEach(cleanup);

describe('MealDetailPage', () => {
  it('재투표 버튼 없이 지난 식당 위치와 상세 링크를 표시한다', () => {
    render(<MealDetailPage flow={{
      goToStep: vi.fn(),
      selectedMeal: {
        group: '123',
        place: '전설의우대갈비 강남직영점',
        city: '서울 강남구 강남대로94길 10',
        tag: '서울 강남구 강남대로94길 10',
        latitude: 37.501,
        longitude: 127.027,
        url: 'https://place.map.kakao.com/12345',
        externalPlaceId: '12345',
        like: 0,
        maybe: 1,
        dislike: 0,
        score: 0,
        when: '오전 12:09',
        dateLabel: '2026. 7. 27.',
        note: '',
        menuCandidates: [
          {
            menuId: 'menu-1',
            name: '비빔밥',
            selected: false,
            goCount: 0,
            maybeCount: 1,
            noCount: 0,
            respondentCount: 1,
          },
          {
            menuId: 'menu-2',
            name: '불고기',
            selected: true,
            goCount: 1,
            maybeCount: 0,
            noCount: 0,
            respondentCount: 1,
          },
        ],
      },
    }} />);

    expect(screen.queryByRole('button', { name: '비슷한 메뉴 다시 투표' })).toBeNull();
    expect(screen.queryByText('평점')).toBeNull();
    expect(document.querySelector('.location-card')).toBeNull();
    expect(screen.getByLabelText('지난 식사 위치 지도').getAttribute('data-center'))
      .toBe('37.501,127.027');
    expect(screen.getByRole('link', { name: '식당 정보 보기' }).getAttribute('href'))
      .toBe('https://place.map.kakao.com/12345');
    const map = screen.getByLabelText('지난 식사 위치 지도');
    const candidateHeading = screen.getByRole('heading', { name: '당시 메뉴 후보와 투표 결과' });
    expect(map.compareDocumentPosition(candidateHeading) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(screen.getByLabelText('비빔밥 갈래 0명 애매하긴해 1명 말래 0명')).toBeTruthy();
    expect(screen.getByLabelText('불고기 갈래 1명 애매하긴해 0명 말래 0명')).toBeTruthy();
    expect(screen.getByText('최종 선택')).toBeTruthy();
  });
});
