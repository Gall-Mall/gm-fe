import { Plus, ChevronRight, Users, ClipboardList } from 'lucide-react';

export function LandingPage({ flow }) {
  const { goToStep, members, groups, profile } = flow;
  const top = groups[0];
  return (
    <main className="screen page">
      <section className="hero-band">
        <span className="tag">🍽 갈래? 말래? 애매하긴해?</span>
        <h1 className="hero-title">안녕하세요, {profile.name}님<br />오늘은 어디로 갈래요?</h1>
        <p className="hero-lead">친구들의 입맛과 조건을 한 번에 모아, 모두가 납득하는 맛집을 카드 투표로 정해요. 새 여행 그룹을 만들어 시작해보세요.</p>
        <button type="button" className="button primary" onClick={() => goToStep('create')}>
          <Plus size={17} /><span>새 그룹 만들기</span>
        </button>
      </section>

      {top ? (
        <section className="card ongoing">
          <div className="ongoing-head">
            <span className="muted-sm">진행 중인 여행</span>
            <button type="button" className="link-btn" onClick={() => goToStep('dashboard')}>이어서 보기<ChevronRight size={15} /></button>
          </div>
          <h2>{top.name}</h2>
          <p className="muted">{top.city} · {top.date}</p>
          <div className="progress-line"><span style={{ width: `${top.progress}%` }} /></div>
          <p className="muted-sm">취향 입력 {top.progress}% 완료</p>
          <div className="avatar-row">
            {members.slice(0, 4).map((m) => <span className="member-avatar" key={m.name}>{m.name.slice(0, 1)}</span>)}
          </div>
        </section>
      ) : null}

      <section className="quick-grid">
        <button type="button" className="card quick" onClick={() => goToStep('create')}>
          <span className="quick-icon"><Plus size={18} /></span>
          <h3>새 여행 준비하기</h3>
          <p className="muted-sm">이름과 목적지만 정하면 그룹이 만들어지고, 초대 링크로 친구를 부를 수 있어요.</p>
        </button>
        <button type="button" className="card quick" onClick={() => goToStep('groups')}>
          <span className="quick-icon"><Users size={18} /></span>
          <h3>내 그룹</h3>
          <p className="muted-sm">진행 중인 여행 {groups.length}개</p>
        </button>
        <button type="button" className="card quick" onClick={() => goToStep('archive')}>
          <span className="quick-icon"><ClipboardList size={18} /></span>
          <h3>지난 식사</h3>
          <p className="muted-sm">함께한 식사 기록 보기</p>
        </button>
      </section>
    </main>
  );
}
