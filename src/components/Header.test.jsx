import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header 상단 바로가기', () => {
  it('상단 오른쪽에 대시보드 아이콘 버튼을 표시하지 않는다', () => {
    const { container } = render(<Header flow={{
      step: 'dashboard',
      goToStep: vi.fn(),
      profile: { name: '이용자', photo: '' },
      setProfile: vi.fn(),
      profileOpen: false,
      setProfileOpen: vi.fn(),
      setPrefsOpen: vi.fn(),
      setPrefsTab: vi.fn(),
      logout: vi.fn(),
    }} />);

    expect(container.querySelector('.header-actions [aria-label="대시보드"]')).toBeNull();
  });
});
