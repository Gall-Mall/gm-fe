import { CalendarPlus } from 'lucide-react';
import { recommendationCandidates } from '../../data/appData';
import { voteLabelByChoice } from '../../utils/vote';

export function VoteResultsPage({ flow }) {
  const { selectedId, restaurantVotes, goToStep } = flow;
  const cand = recommendationCandidates.find((c) => c.id === selectedId) || recommendationCandidates[0];
  const v = restaurantVotes[cand.id];
  const total = v.like + v.maybe + v.dislike;
  const others = recommendationCandidates.filter((c) => c.id !== cand.id);

  return (
    <main className="screen page narrow">
      <header className="page-head col">
        <span className="tag">투표 결과</span>
        <h1>{cand.name}</h1>
        <p className="muted">{cand.city} · {cand.meta}</p>
      </header>

      <section className="card">
        <div className="result-media" style={{ backgroundImage: `url(${cand.image})` }}>
          <div className="vote-media-overlay" />
          <strong className="vote-score">{cand.score}%</strong>
        </div>
        <div className="inline-between result-top"><span className="muted-sm">그룹 적합도</span><strong className="accent">{cand.score}% 일치</strong></div>
        <div className="progress-line"><span style={{ width: `${cand.score}%` }} /></div>
        <div className="tally">
          {['like', 'maybe', 'dislike'].map((k) => (
            <span key={k} className={`tally-${k}`}>{voteLabelByChoice[k]} {v[k]}</span>
          ))}
        </div>
        <p className="muted-sm">총 {total}명이 투표했어요.</p>
        <div className="reason-grid">
          <section className="reason-box"><h3>추천 이유</h3><ul>{cand.reasons.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section className="caution-box"><h3>확인할 점</h3><ul>{cand.cautions.map((c) => <li key={c}>{c}</li>)}</ul></section>
        </div>
        <button type="button" className="button primary full" onClick={() => goToStep('schedule')}><CalendarPlus size={16} /><span>일정에 추가하기</span></button>
      </section>

      <section className="card">
        <h2>다른 후보</h2>
        <div className="alt-list">
          {others.map((c) => (
            <button type="button" className="alt-row" key={c.id} onClick={() => { flow.setSelectedId(c.id); }}>
              <div className="rest-thumb sm" style={{ backgroundImage: `url(${c.image})` }} />
              <div className="final-info"><strong>{c.name}</strong><small className="muted-sm">{c.meta}</small></div>
              <em className="accent">{c.score}%</em>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
