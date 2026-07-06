import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import App from './App.jsx';

afterEach(() => {
  cleanup();
});

describe('Gallae Mallae product flow', () => {
  test('clicks through group setup, taste analysis, voting, and schedule flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: '갈래? 말래? 애매해? 모두가 납득하는 맛집 결정' })).toBeInTheDocument();
    expect(screen.getByText('갈래 말래는 맛집 검색보다 그룹 결정을 돕습니다.')).toBeInTheDocument();
    expect(screen.getByText('지도에서 동선 먼저 보고 결정해요')).toBeInTheDocument();
    expect(screen.getByText('난바 저녁 루트')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '서비스 소개' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '갈래 말래 체험' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '결과 예시' })).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: '무료로 그룹 만들기' })[0]);
    expect(screen.getByRole('heading', { name: '다음 여행지는?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '그룹 생성하고 초대하기' }));
    expect(screen.getByText('GALM24')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '내 취향 입력하기' }));
    expect(screen.getByRole('heading', { name: '어떤 음식을 선호하시나요?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '일식' }));
    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByRole('heading', { name: '나의 먹거리 여행 타입' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '그룹 분석 결과보기' }));
    expect(screen.getByRole('heading', { name: '우리 그룹은 어떤 입맛일까요?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '추천 카드 보러가기' }));
    expect(screen.getByRole('heading', { name: '오늘 저녁 어디로 갈까요?' })).toBeInTheDocument();
    expect(screen.getByText('갈래 말래 샘플 투표')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '지도 기준 추천 후보' })).toBeInTheDocument();
    expect(screen.getByText('현재 위치에서 도보 12분')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '추천 후보 사이드 패널' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trattoria Bella 구글지도에서 보기/ })).toHaveAttribute(
      'href',
      expect.stringContaining('https://www.google.com/maps/search/'),
    );
    expect(screen.getByText('그룹 기존 반응 4명')).toBeInTheDocument();
    expect(screen.getByText('내 투표 대기')).toBeInTheDocument();
    expect(screen.getByText('기본 추천은 동선과 단체석을 우선해요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '말래' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '애매해' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '갈래' }));
    expect(screen.getByRole('heading', { name: '투표 결과와 최종 후보' })).toBeInTheDocument();
    expect(screen.getByText('방금 선택한 투표는 갈래로 저장되었습니다.')).toBeInTheDocument();
    expect(screen.getByText('내 투표: 갈래')).toBeInTheDocument();
    expect(screen.getByText('Trattoria Bella 갈래 3 → 4')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '그룹 최고점안 보기' }));
    expect(screen.getByText('미즈노 오코노미야키')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '일정에 추가' }));
    expect(screen.getByRole('heading', { name: '날짜별 맛집 일정' })).toBeInTheDocument();
  });

  test('supports login, group dashboard, invite copy, and alternate navigation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<App />);

    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(screen.getByRole('heading', { name: 'Gallae Mallae' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Email로 계속하기' }));
    expect(screen.getByText('Email로 계속 진행할게요')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '내 여행 그룹 보기' }));
    await user.click(screen.getByRole('button', { name: /Osaka Foodies/ }));
    expect(screen.getByRole('heading', { name: 'Osaka Foodies' })).toBeInTheDocument();
    expect(screen.getByText('취향 입력률')).toBeInTheDocument();
    expect(screen.getByText('3/4명 완료')).toBeInTheDocument();
    expect(screen.getByText('추천 신뢰도')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '링크 복사' }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('GALM24'));
    expect(screen.getByRole('button', { name: '복사됨' })).toBeInTheDocument();
    expect(screen.getByText('초대 링크가 클립보드에 복사되었습니다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '현재 입력 기준 결과 보기' }));
    expect(screen.getByRole('heading', { name: '우리 그룹은 어떤 입맛일까요?' })).toBeInTheDocument();
  });



  test('uses honest header actions and Korean form accessibility labels', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByRole('button', { name: '검색' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '알림' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '내 그룹 보기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '대시보드 보기' })).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: '무료로 그룹 만들기' })[0]);
    expect(screen.getByLabelText('멤버 수')).toBeInTheDocument();
  });

  test('selects a map candidate, records the vote, and carries that place into result and schedule', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '갈래 말래 체험' }));
    expect(screen.getByRole('heading', { name: '오늘 저녁 어디로 갈까요?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /와드 오모테나시 카페 후보 선택/ }));
    expect(screen.getByRole('button', { name: /와드 오모테나시 카페 후보 선택/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: /와드 오모테나시 카페 구글지도에서 보기/ })).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent('와드 오모테나시 카페')),
    );

    await user.click(screen.getByRole('button', { name: '애매해' }));
    expect(screen.getByRole('heading', { name: '투표 결과와 최종 후보' })).toBeInTheDocument();
    expect(screen.getByText('방금 선택한 투표는 애매해로 저장되었습니다.')).toBeInTheDocument();
    expect(screen.getByText('내 투표: 애매해')).toBeInTheDocument();
    expect(screen.getByText('와드 오모테나시 카페 애매해 1 → 2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '와드 오모테나시 카페' })).toBeInTheDocument();
    expect(screen.getByText('갈래 2')).toBeInTheDocument();
    expect(screen.getByText('애매해 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '일정에 추가' }));
    expect(screen.getByRole('heading', { name: '날짜별 맛집 일정' })).toBeInTheDocument();
    expect(screen.getByText('19:30')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '와드 오모테나시 카페' })).toBeInTheDocument();
    expect(screen.getByText(/최종 투표 후보 · 감성 카페 · 애매해 2/)).toBeInTheDocument();
  });
});
