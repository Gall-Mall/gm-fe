import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('백엔드가 지원하는 네이버 OAuth 로그인만 노출한다', () => {
    render(<LoginPage flow={{ goToStep: vi.fn(), afterLogin: null }} />);

    expect(screen.getByRole('button', { name: '네이버로 시작하기' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: '카카오로 시작하기' })).toBeNull();
  });
});
