import { Plus, ChevronRight } from 'lucide-react';
import { travelGroups } from '../../data/appData';

export function GroupsPage({ flow }) {
  const { goToStep } = flow;
  return (
    <main className="screen page narrow">
      <header className="page-head">
        <div>
          <span className="tag">내 그룹</span>
          <h1>진행 중인 여행</h1>
          <p className="muted">함께 맛집을 정하고 있는 그룹이에요.</p>
        </div>
        <button type="button" className="button primary" onClick={() => goToStep('create')}>
          <Plus size={17} /><span>새 그룹 만들기</span>
        </button>
      </header>
      <div className="group-list">
        {travelGroups.map((g) => (
          <button type="button" className="card group-row" key={g.name} onClick={() => goToStep('dashboard')}>
            <div>
              <h2>{g.name}</h2>
              <p className="muted">{g.city} · {g.date}</p>
              <div className="progress-line"><span style={{ width: `${g.progress}%` }} /></div>
              <p className="muted-sm">{g.status} · 취향 입력 {g.progress}% 완료</p>
            </div>
            <ChevronRight size={20} className="muted" />
          </button>
        ))}
      </div>
    </main>
  );
}
