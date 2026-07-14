import { Plus, ChevronRight, Users, ClipboardList } from 'lucide-react';
import { travelGroups } from '../../data/appData';

export function LandingPage({ flow }) {
  const { goToStep, members } = flow;
  return (
    <main className="screen page">
      <section className="hero-band">
        <span className="tag">🍽 갈래? 말래? 애매하긴해?</span>
        <h1 className="hero-title">안녕하세요, 나님<br />오늘은 어디로 갈래요?</h1>
        <p className="hero-lead">친구들의 입맛과 조건을 한 번에 모아, 모두가 납득하는 맛집을 카드 투표로 정해요. 새 여행 그룹을 만들어 시작해보세요.</p>
        <button type="button" className="button primary" onClick={() => goToStep('create')}>
          <Plus size={17} /><span>새 그룹 만들기</span>
        </button>
      </section>

      <section className="card ongoing">
        <div className="ongoing-head">
          <span className="muted-sm">진행 중인 여행</span>
          <button type="button" className="link-btn" onClick={() => goToStep('dashboard')}>이어서 보기<ChevronRight size={15} /></button>
        </div>
        <h2>{travelGroups[0].name}</h2>
        <p className="muted">{travelGroups[0].city} · 10월 12일 ~ 10월 18일</p>
        <div className="progress-line"><span style={{ width: '75%' }} /></div>
        <p className="muted-sm">취향 입력 75% 완료 · 4명 중 3명</p>
        <div className="avatar-row">
          {members.slice(0, 4).map((m) => <span className="member-avatar" key={m.name}>{m.name.slice(0, 1)}</span>)}
        </div>
      </section>

      <section className="quick-grid">
        <button type="button" className="card quick" onClick={() => goToStep('create')}>
          <span className="quick-icon"><Plus size={18} /></span>
          <h3>새 여행 준비하기</h3>
          <p className="muted-sm">이름과 목적지만 정하면 바로 친구들을 초대할 수 있어요.</p>
        </button>
        <button type="button" className="card quick" onClick={() => goToStep('groups')}>
          <span className="quick-icon"><Users size={18} /></span>
          <h3>내 그룹</h3>
          <p className="muted-sm">진행 중인 여행 2개</p>
        </button>
        <button type="button" className="card quick" onClick={() => goToStep('archive')}>
          <span className="quick-icon"><ClipboardList size={18} /></span>
          <h3>지난 식사</h3>
          <p className="muted-sm">함께한 식사 3회 기록</p>
        </button>
      </section>
    </main>
  );
}
