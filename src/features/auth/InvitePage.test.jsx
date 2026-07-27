import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InvitePage } from './InvitePage';

describe('InvitePage', () => {
  it('가입 전에도 초대 응답의 방장과 현재 인원을 표시한다', () => {
    render(
      <InvitePage
        flow={{
          gset: {
            name: '점심 모임',
            location: '서울 강남구',
            recTime: '12:00',
            memberTarget: 6,
          },
          members: [],
          joinGroup: vi.fn(),
          goToStep: vi.fn(),
          inviteCode: 'INVITE1',
          inviteInfo: {
            ownerName: '민수',
            memberCount: 1,
            maxMemberCount: 6,
            joinable: true,
          },
          operationError: '',
        }}
      />,
    );

    expect(screen.getByText('민수')).not.toBeNull();
    expect(screen.getByText('1/6명 참여 중')).not.toBeNull();
  });
});
