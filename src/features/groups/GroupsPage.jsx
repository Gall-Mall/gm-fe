import { Plus, ChevronRight, Users } from 'lucide-react';

export function GroupsPage({ flow }) {
  const { goToStep, groups, selectGroup, operationError } = flow;
  return (
    <main className="screen page narrow">
      <header className="page-head">
        <div>
          <span className="tag">내 그룹</span>
          <h1>진행 중인 모임</h1>
          <p className="muted">함께 맛집을 정하고 있는 모임이에요.</p>
        </div>
        <button type="button" className="button primary" onClick={() => goToStep('create')}>
          <Plus size={17} /><span>새 그룹 만들기</span>
        </button>
      </header>

      {groups.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><Users size={26} /></span>
          <h2>아직 그룹이 없어요</h2>
          <p className="muted">새 모임을 만들어 친구들과 맛집을 정해보세요.</p>
          <button type="button" className="button primary" onClick={() => goToStep('create')}><Plus size={17} /><span>새 그룹 만들기</span></button>
        </div>
      ) : (
        <div className="group-list">
          {groups.map((g) => (
            <button type="button" className="card group-row" key={g.groupId || g.name} onClick={() => selectGroup(g)}>
              <div>
                <div className="final-name"><h2>{g.name}</h2>{g.isMine ? <em className="badge">내가 만든</em> : null}</div>
                <p className="muted">{g.city} · {g.date}</p>
                <div className="progress-line"><span style={{ width: `${g.progress}%` }} /></div>
                <p className="muted-sm">{g.status} · 취향 입력 {g.progress}% 완료</p>
              </div>
              <ChevronRight size={20} className="muted" />
            </button>
          ))}
        </div>
      )}
      {operationError ? <p className="error-text center" role="alert">{operationError}</p> : null}
    </main>
  );
}
