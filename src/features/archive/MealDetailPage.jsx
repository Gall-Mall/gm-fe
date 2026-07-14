import { ArrowLeft, MapPin } from 'lucide-react';

export function MealDetailPage({ flow }) {
  const { selectedMeal, goToStep } = flow;
  const m = selectedMeal;
  if (!m) return <main className="screen page narrow"><p className="muted">선택된 식사가 없어요.</p></main>;
  const total = m.like + m.maybe + m.dislike;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const rating = (3.9 + (m.score % 10) / 10).toFixed(1);
  const rows = [
    { label: '갈래', count: m.like, w: pct(m.like), cls: 'like' },
    { label: '애매하긴해', count: m.maybe, w: pct(m.maybe), cls: 'maybe' },
    { label: '말래', count: m.dislike, w: pct(m.dislike), cls: 'dislike' },
  ];

  return (
    <main className="screen page narrow">
      <button type="button" className="back-btn" onClick={() => goToStep('archive')}><ArrowLeft size={16} />지난 식사</button>
      <div className="meal-hero" style={{ backgroundImage: `url(${m.img})` }}>
        <div className="vote-media-overlay" />
        <span className="meal-detail-group">{m.group}</span>
        <strong className="meal-detail-score">그룹 적합도 {m.score}%</strong>
        <div className="meal-hero-text">
          <span>{m.when} · {m.dateLabel}</span>
          <h1>{m.place}</h1>
          <p>{m.city} · {m.tag}</p>
        </div>
      </div>

      <div className="meal-detail-grid">
        <section className="card">
          <h2>그날의 투표 결과</h2>
          <div className="vote-rows">
            {rows.map((r) => (
              <div key={r.label}>
                <div className="inline-between"><span className="muted-sm">{r.label}</span><strong>{r.count}명</strong></div>
                <div className="progress-line"><span className={`bar-${r.cls}`} style={{ width: `${r.w}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="meal-note bordered">{m.note}</p>
        </section>
        <aside className="meal-side">
          <div className="card mini-card"><span className="muted-sm">평점</span><strong className="rating">★ {rating}</strong></div>
          <div className="card mini-card"><span className="muted-sm"><MapPin size={13} /> 위치</span><strong>{m.city}</strong><p className="muted-sm">{m.tag}</p></div>
          <button type="button" className="button ghost full" onClick={() => goToStep('recommend')}>비슷한 메뉴 다시 투표</button>
        </aside>
      </div>
    </main>
  );
}
