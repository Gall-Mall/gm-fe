import { Clock, X, HelpCircle, Heart, ChevronRight } from 'lucide-react';

export function MenuVotePage({ flow }) {
  const { menus, menuVotes, myMenuVote, currentMenuIdx, setCurrentMenuIdx, voteMenu, voteKeywords, voteStartedAt, remainMs, voteClosed, votedCount, allMenusVoted, roundNumber, candidateCount, members = [], gset, completedMenuVoterIds = [], goToStep } = flow;
  const m = menus[currentMenuIdx] || menus[0];
  const v = menuVotes[m.id] || { like: 0, maybe: 0, dislike: 0 };
  const canComplete = allMenusVoted || voteClosed;
  const memberIds = new Set(members.map(({ id }) => id));
  const totalMembers = Math.max(members.length || gset?.memberCount || 1, 1);
  const completedFromServer = [...new Set(completedMenuVoterIds)]
    .filter((userId) => memberIds.size === 0 || memberIds.has(userId))
    .length;
  const completedMembers = Math.min(
    totalMembers,
    completedFromServer || (totalMembers === 1 && allMenusVoted ? 1 : 0),
  );
  const votingMembers = Math.max(totalMembers - completedMembers, 0);

  const countdown = (() => {
    if (!voteStartedAt) return null;
    const tot = Math.floor(remainMs / 1000);
    const h = Math.floor(tot / 3600), mm = Math.floor((tot % 3600) / 60), s = tot % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return (h > 0 ? `${h}:${pad(mm)}` : `${mm}:${pad(s)}`) + (remainMs === 0 ? ' 종료' : ' 남음');
  })();

  return (
    <main className="screen page vote-page">
      <div className="vote-card">
        <div className="vote-card-head">
          <div className="inline-between">
            <div><span className="muted-sm">{roundNumber}차 메뉴 투표</span><h1>오늘 뭐 먹을래요?</h1></div>
            <div className="inline-row">
              {countdown ? <em className="countdown"><Clock size={12} />{countdown}</em> : null}
              <em className="pill like">투표 완료 {completedMembers}명</em>
              <em className="pill soft">투표 중 {votingMembers}명</em>
              {candidateCount > 0 ? <em className="pill like">최종 후보 {candidateCount}/3</em> : null}
              <em className="pill soft">{currentMenuIdx + 1}/{menus.length}</em>
            </div>
          </div>
          {voteKeywords.length > 0 ? (
            <div className="kw-banner"><span className="kw-star">★</span><span>방장이 정한 느낌 <strong>{voteKeywords.join(' · ')}</strong></span></div>
          ) : null}
        </div>

        <div className={`vote-media ${m.emoji ? 'emoji-media' : ''}`} style={m.emoji ? undefined : { backgroundImage: `url(${m.image})` }}>
          {m.emoji ? <span className="vote-emoji" aria-hidden="true">{m.emoji}</span> : <div className="vote-media-overlay" />}
          <span className="vote-cat">{m.cat}</span>
          <strong className="vote-score">{m.score}%</strong>
          <h2 className="vote-name">{m.name}</h2>
        </div>

        <div className="vote-card-body">
          <div className="inline-between"><span className="muted-sm">그룹 적합도</span><strong className="accent">{m.score}% 일치</strong></div>
          <div className="progress-line"><span style={{ width: `${m.score}%` }} /></div>
          <div className="tally">
            <span className="tally-like">갈래 {v.like}</span>
            <span className="tally-maybe">애매하긴해 {v.maybe}</span>
            <span className="tally-dislike">말래 {v.dislike}</span>
          </div>

          {voteClosed ? (
            <div className="vote-closed"><Clock size={15} /> 제한시간이 종료되어 더 이상 투표할 수 없어요. 완료를 눌러 결과를 확인하세요.</div>
          ) : null}
          <div className="vote-actions">
            <button type="button" className="vote-btn dislike" onClick={() => voteMenu('dislike')} disabled={voteClosed}><span className="vote-circle"><X size={28} /></span>말래</button>
            <button type="button" className="vote-btn maybe" onClick={() => voteMenu('maybe')} disabled={voteClosed}><span className="vote-circle"><HelpCircle size={30} /></span>애매하긴해</button>
            <button type="button" className="vote-btn like" onClick={() => voteMenu('like')} disabled={voteClosed}><span className="vote-circle"><Heart size={28} fill="currentColor" /></span>갈래</button>
          </div>

          <div className="reason-grid">
            <section className="reason-box">
              <h3>추천 이유</h3>
              <ul>{m.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </section>
            <section className="caution-box">
              <h3>확인할 점</h3>
              <ul>{m.cautions.map((c) => <li key={c}>{c}</li>)}</ul>
            </section>
          </div>

          <div className="menu-dots">
            {menus.map((mm, i) => (
              <button key={mm.id} type="button" className={`menu-dot ${i === currentMenuIdx ? 'on' : ''} ${myMenuVote[mm.id] ? 'voted' : ''}`} onClick={() => setCurrentMenuIdx(i)} aria-label={mm.name} />
            ))}
          </div>

          <button type="button" className="button primary full" onClick={() => goToStep('votedone')} disabled={!canComplete}>
            {canComplete ? '투표 완료하기' : `모든 메뉴를 투표해주세요`} ({votedCount}/{menus.length})<ChevronRight size={17} />
          </button>
          {!canComplete ? <p className="muted-sm center hint-under">남은 메뉴 {menus.length - votedCount}개를 투표하면 완료할 수 있어요.</p> : null}
        </div>
      </div>
    </main>
  );
}
