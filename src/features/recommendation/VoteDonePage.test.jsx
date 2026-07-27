import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VoteDonePage } from './VoteDonePage';

afterEach(cleanup);

describe('VoteDonePage 1명 그룹 마감', () => {
  it('혼자 모든 메뉴에 투표하면 1/1로 표시하고 마감 API 버튼을 제공한다', () => {
    const closeMenuVoting = vi.fn();
    const goToStep = vi.fn();

    render(<VoteDonePage flow={{
      goToStep,
      members: [],
      profile: { name: '테스트 사용자' },
      gset: { memberCount: 1 },
      simAllVoted: false,
      closeMenuVoting,
      allMenusVoted: true,
      isHost: true,
      roundNumber: 1,
    }} />);

    expect(screen.getByText('1/1명 완료')).not.toBeNull();
    expect(screen.queryByText('모든 멤버가 투표를 마쳤어요!')).toBeNull();

    fireEvent.click(screen.getByRole('button', {
      name: /투표 마감하고 라운드 결과 보기/,
    }));

    expect(closeMenuVoting).toHaveBeenCalledTimes(1);
    expect(goToStep).not.toHaveBeenCalledWith('roundresult');
  });
});
