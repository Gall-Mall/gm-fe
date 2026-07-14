import { Bell, Search, Camera, LogOut, Settings } from 'lucide-react';

const navItems = [
  { label: '홈', step: 'home' },
  { label: '내 그룹', step: 'groups' },
  { label: '지난 식사', step: 'archive' },
];

export function Header({ flow }) {
  const { step, goToStep, profile, setProfile, profileOpen, setProfileOpen, setPrefsOpen, setPrefsTab, logout } = flow;
  const initial = profile.photo ? '' : profile.name.slice(0, 1);

  function onPhoto(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setProfile((p) => ({ ...p, photo: r.result }));
    r.readAsDataURL(f);
  }

  const isArchive = step === 'archive' || step === 'mealdetail';

  return (
    <header className="site-header">
      <button className="brand-mark" type="button" onClick={() => goToStep('home')}>
        <span>갈래말래</span>
      </button>
      <nav className="top-nav" aria-label="주요 메뉴">
        {navItems.map((item) => {
          const active = item.step === 'archive' ? isArchive : step === item.step;
          return (
            <button className={active ? 'active' : ''} key={item.label} onClick={() => goToStep(item.step)} type="button">
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="header-actions">
        <button aria-label="내 그룹" className="icon-button" onClick={() => goToStep('groups')} type="button">
          <Search size={17} />
        </button>
        <button aria-label="대시보드" className="icon-button" onClick={() => goToStep('dashboard')} type="button">
          <Bell size={17} />
        </button>
        <div className="profile-wrap">
          <button className="avatar-button" type="button" aria-label="내 정보" onClick={() => setProfileOpen(!profileOpen)}>
            {profile.photo ? <span className="avatar-img" style={{ backgroundImage: `url(${profile.photo})` }} /> : <span>{initial}</span>}
          </button>
          {profileOpen ? (
            <div className="profile-menu">
              <div className="profile-photo-row">
                <label className="profile-photo">
                  {profile.photo ? <span className="avatar-img lg" style={{ backgroundImage: `url(${profile.photo})` }} /> : <span className="avatar-lg">{initial}</span>}
                  <span className="camera-badge"><Camera size={13} /></span>
                  <input type="file" accept="image/*" onChange={onPhoto} hidden />
                </label>
                <span className="muted-sm">사진을 눌러 프로필 변경</span>
              </div>
              <div className="profile-name-row">
                <span className="field-label">닉네임</span>
                <div className="inline-row">
                  <input
                    className="text-input"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>
              <button type="button" className="menu-item" onClick={() => { setProfileOpen(false); setPrefsTab('allergy'); setPrefsOpen(true); }}>
                <Settings size={16} />취향 수정 (알레르기·음식)
              </button>
              <button type="button" className="menu-item danger" onClick={logout}>
                <LogOut size={16} />로그아웃
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
