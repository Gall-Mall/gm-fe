import { Bell, Search } from 'lucide-react';

const navItems = [
  { label: '서비스 소개', step: 'home' },
  { label: '갈래 말래 체험', step: 'recommend' },
  { label: '결과 예시', step: 'analysis' },
  { label: '내 그룹', step: 'groups' },
];

export function Header({ activeStep, goToStep }) {
  return (
    <header className="site-header">
      <button className="brand-mark" type="button" onClick={() => goToStep('home')}>
        <span>Gallae Mallae</span>
      </button>
      <nav className="top-nav" aria-label="주요 메뉴">
        {navItems.map((item) => (
          <button
            className={activeStep === item.step ? 'active' : ''}
            key={item.label}
            onClick={() => goToStep(item.step)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <button aria-label="내 그룹 보기" title="내 그룹 보기" className="icon-button" onClick={() => goToStep('groups')} type="button">
          <Search size={17} />
        </button>
        <button aria-label="대시보드 보기" title="대시보드 보기" className="icon-button" onClick={() => goToStep('dashboard')} type="button">
          <Bell size={17} />
        </button>
        <button className="avatar-button" onClick={() => goToStep('login')} type="button" aria-label="로그인">
          <span>나</span>
        </button>
      </div>
    </header>
  );
}
