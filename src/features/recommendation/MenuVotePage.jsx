import { Clock, X, HelpCircle, Heart, ChevronRight } from 'lucide-react';

export function MenuVotePage({ flow }) {
  const { menus, menuVotes, myMenuVote, currentMenuIdx, setCurrentMenuIdx, voteMenu, voteKeywords, voteStartedAt, remainMs, goToStep } = flow;
  const m = menus[currentMenuIdx];
  const v = menuVotes[m.id];
  const votedCount = Object.keys(myMenuVote).length;

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
            <div><span className="muted-sm">갈래 말래 메뉴 투표</span><h1>오늘 뭐 먹을래요?</h1></div>
            <div className="inline-row">
              {countdown ? <em className="countdown"><Clock size={12} />{countdown}</em> : null}
              <em className="pill soft">메뉴 {currentMenuIdx + 1} / {menus.length}</em>
            </div>
          </div>
          {voteKeywords.length > 0 ? (
            <div className="kw-banner"><span className="kw-star">★</span><span>방장이 정한 느낌 <strong>{voteKeywords.join(' · ')}</strong></span></div>
          ) : null}
        </div>

        <div className="vote-media" style={{ backgroundImage: `url(${m.image})` }}>
          <div className="vote-media-overlay" />
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

          <div className="vote-actions">
            <button type="button" className="vote-btn dislike" onClick={() => voteMenu('dislike')}><span className="vote-circle"><X size={28} /></span>말래</button>
            <button type="button" className="vote-btn maybe" onClick={() => voteMenu('maybe')}><span className="vote-circle"><HelpCircle size={30} /></span>애매하긴해</button>
            <button type="button" className="vote-btn like" onClick={() => voteMenu('like')}><span className="vote-circle"><Heart size={28} fill="currentColor" /></span>갈래</button>
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

          <button type="button" className="button primary full" onClick={() => goToStep('votedone')}>
            투표 완료하기 ({votedCount}/{menus.length})<ChevronRight size={17} />
          </button>
        </div>
      </div>
    </main>
  );
}
