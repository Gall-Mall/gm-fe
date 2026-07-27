import { useEffect } from 'react';
import { Plus, Users } from 'lucide-react';

export function ArchivePage({ flow }) {
  const {
    archiveGroups, openMeal, openGroupHistory, goToStep,
    loadHistory, historyStatus, operationError,
  } = flow;
  useEffect(() => {
    loadHistory();
    // 기록 화면에 처음 진입할 때 한 번만 서버 상태를 조회한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <main className="screen page">
      <div className="page-head">
        <div>
          <span className="tag">그룹별 기록</span>
          <h1>지난 식사 모아보기</h1>
          <p className="muted">모임별로 함께 결정하고 다녀온 식사들을 모았어요.</p>
        </div>
        <button type="button" className="button primary" onClick={() => goToStep('create')}><Plus size={17} /><span>새 그룹 만들기</span></button>
      </div>

      <div className="archive-groups">
        {historyStatus === 'loading' ? <div className="waiting-box"><span className="waiting-spinner" /><span>지난 기록을 불러오는 중이에요</span></div> : null}
        {historyStatus !== 'loading' && archiveGroups.length === 0 ? <div className="waiting-box"><span>아직 완료된 식사 기록이 없어요.</span></div> : null}
        {operationError ? <p className="alert-warn">{operationError}</p> : null}
        {archiveGroups.map((g) => {
          const count = g.meals.length;
          const avg = count ? Math.round(g.meals.reduce((s, m) => s + m.score, 0) / count) : 0;
          return (
            <section className="archive-group" key={g.groupId || g.group}>
              {/* 해당 그룹 식사 내역으로 이동 */}
              <button
                type="button"
                className="archive-group-head"
                aria-label={`${g.group} 해당 그룹 식사 내역으로 이동`}
                onClick={() => openGroupHistory(g.groupId)}
              >
                <div className="inline-row">
                  <span className="group-icon"><Users size={20} /></span>
                  <div><h2>{g.group}</h2><p className="muted-sm">{g.city} · {g.period}</p></div>
                </div>
                <div className="inline-row">
                  <span className="pill neutral">함께한 식사 {count}회</span>
                  <span className="pill maybe">평균 적합도 {avg}%</span>
                </div>
              </button>
              <div className="meal-grid">
                {g.meals.map((m) => (
                  <button type="button" className="meal-card" key={`${g.group}-${m.dateLabel}-${m.place}`} onClick={() => openMeal({ ...m, group: g.group })}>
                    <div className="meal-media" style={{ backgroundImage: `url(${m.img})` }}>
                      <div className="vote-media-overlay" />
                      <span className="meal-date">{m.dateLabel}</span>
                      <strong className="meal-score">{m.score}%</strong>
                    </div>
                    <div className="meal-body">
                      <span className="accent xs">{m.when}</span>
                      <h3>{m.place}</h3>
                      <p className="muted-sm">{m.city} · {m.tag}</p>
                      <div className="tally">
                        <span className="tally-like">갈래 {m.like}</span>
                        <span className="tally-maybe">애매하긴해 {m.maybe}</span>
                        <span className="tally-dislike">말래 {m.dislike}</span>
                      </div>
                      <p className="meal-note">{m.note}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
