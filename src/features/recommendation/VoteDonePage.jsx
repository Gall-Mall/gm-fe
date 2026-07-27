import { Bell, Check, ChevronRight } from 'lucide-react';

export function VoteDonePage({ flow }) {
  const {
    goToStep, members, profile, gset, simAllVoted,
    closeMenuVoting, allMenusVoted, completedMenuVoterIds = [], isHost, roundNumber,
  } = flow;
  const currentMember = { id: 'me', name: profile?.name || '나' };
  const visibleMembers = members.length > 0 ? members : [currentMember];
  const totalMembers = Math.max(gset?.memberCount || visibleMembers.length, 1);
  const completedUserIds = new Set(completedMenuVoterIds);
  const voteMembers = visibleMembers.map((m) => ({
    name: m.name,
    done: simAllVoted || completedUserIds.has(m.id) || (visibleMembers.length === 1 && allMenusVoted),
  }));
  const doneCount = simAllVoted ? totalMembers : voteMembers.filter((member) => member.done).length;
  const allDone = simAllVoted;

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
        <span className="pill soft">{roundNumber}차 메뉴 투표</span>
        <h1>투표가 완료되었어요</h1>
        <p className="muted">
          {allDone ? '그룹 전원이 투표를 마쳤어요. 라운드 결과를 확인하세요.' : '내 투표가 저장됐어요. 다른 멤버들이 투표를 마치면 알림으로 알려드릴게요.'}
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
          <button type="button" className="button primary full" onClick={() => goToStep('roundresult')}>라운드 결과 보기<ChevronRight size={17} /></button>
        ) : (
          <>
            <div className="waiting">
              <span className="dot" />
              {totalMembers === 1 ? '투표를 마감하면 결과를 확인할 수 있어요' : '다른 멤버들의 투표를 기다리고 있어요'}
            </div>
            {isHost && allMenusVoted ? (
              <button type="button" className="button primary full" onClick={closeMenuVoting}>투표 마감하고 라운드 결과 보기<ChevronRight size={17} /></button>
            ) : isHost ? (
              <button type="button" className="button ghost full" onClick={closeMenuVoting}>현재 응답으로 투표 마감하기 (방장)</button>
            ) : null}
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
