import { Bell, Check, ChevronRight } from 'lucide-react';

export function VoteDonePage({ flow }) {
  const { goToStep, members, simAllVoted, setSimAllVoted, myMenuVote, menus } = flow;
  // 데모: '나' 포함 + simAllVoted로 나머지 완료 처리
  const voteMembers = [
    { name: '지민', done: true },
    { name: '수현', done: true },
    { name: '민재', done: simAllVoted },
    { name: '나', done: true },
  ];
  const doneCount = voteMembers.filter((m) => m.done).length;
  const allDone = doneCount === voteMembers.length;

  return (
    <main className="screen page center-narrow">
      {allDone ? (
        <div className="alert-dark">
          <span className="alert-icon"><Bell size={20} /></span>
          <div><strong>모든 멤버가 투표를 마쳤어요!</strong><small>최종 메뉴 목록이 준비됐어요.</small></div>
        </div>
      ) : null}
      <section className="card done-card">
        <span className="done-check"><Check size={34} /></span>
        <h1>투표가 완료되었어요</h1>
        <p className="muted">
          {allDone ? '그룹 전원이 투표를 마쳤어요. 최종 메뉴 목록을 확인하세요.' : '내 투표가 저장됐어요. 다른 멤버들이 투표를 마치면 알림으로 알려드릴게요.'}
        </p>
        <div className="done-status">
          <div className="inline-between"><strong>멤버 투표 현황</strong><em className="accent">{doneCount}/{voteMembers.length}명 완료</em></div>
          <div className="done-members">
            {voteMembers.map((m) => (
              <div className="member-line" key={m.name}>
                <span className="member-avatar">{m.name.slice(0, 1)}</span>
                <strong>{m.name}</strong>
                <em className={m.done ? 'accent' : 'muted-sm'}>{m.done ? '완료' : '대기 중'}</em>
              </div>
            ))}
          </div>
        </div>
        {allDone ? (
          <button type="button" className="button primary full" onClick={() => goToStep('finallist')}>최종 메뉴 목록 보기<ChevronRight size={17} /></button>
        ) : (
          <>
            <div className="waiting"><span className="dot" />다른 멤버들의 투표를 기다리고 있어요</div>
            <button type="button" className="demo-btn" onClick={() => setSimAllVoted(true)}>데모: 나머지 멤버 투표 완료 처리</button>
          </>
        )}
      </section>
      <div className="page-actions center">
        <button type="button" className="link-btn" onClick={() => goToStep('recommend')}>내 투표 다시 보기</button>
        <button type="button" className="link-btn muted" onClick={() => goToStep('dashboard')}>대시보드로</button>
      </div>
    </main>
  );
}
