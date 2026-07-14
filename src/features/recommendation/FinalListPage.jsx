import { ChevronRight } from 'lucide-react';

const verdictClass = { '확정': 'ok', '후보 유지': 'maybe', '제외': 'no', '보류': 'neutral' };

export function FinalListPage({ flow }) {
  const { finalRanked, goToStep, isHost, selectedFinalMenuId, setSelectedFinalMenuId } = flow;
  const top = finalRanked[0];

  return (
    <main className="screen page narrow">
      <header className="page-head col">
        <span className="tag">투표 종료 · 4명 전원 완료</span>
        <h1>최종 메뉴 목록</h1>
        <p className="muted">갈래 과반은 확정, 갈래+애매하긴해 과반은 후보 유지, 말래 과반은 제외예요.</p>
      </header>

      <div className="final-list">
        {finalRanked.map((m, i) => {
          const active = selectedFinalMenuId ? selectedFinalMenuId === m.id : i === 0;
          return (
            <button type="button" key={m.id} className={`card final-row ${active ? 'active' : ''}`} onClick={() => setSelectedFinalMenuId(m.id)}>
              <div className="final-main">
                <div className="final-thumb" style={{ backgroundImage: `url(${m.image})` }} />
                <div className="final-info">
                  <div className="final-name"><strong>{m.name}</strong><em className={`verdict ${verdictClass[m.verdict]}`}>{m.verdict}</em></div>
                  <small className="muted-sm">{m.cat} · 반응 {m.v.like + m.v.maybe + m.v.dislike}명</small>
                </div>
                <strong className="accent">{m.score}%</strong>
              </div>
              <div className="tally">
                <span className="tally-like">갈래 {m.v.like}</span>
                <span className="tally-maybe">애매하긴해 {m.v.maybe}</span>
                <span className="tally-dislike">말래 {m.v.dislike}</span>
              </div>
            </button>
          );
        })}
      </div>

      <section className="card top-pick">
        <span className="muted-sm">그룹이 정한 오늘의 메뉴</span>
        <h2>{(finalRanked.find((m) => m.id === selectedFinalMenuId) || top)?.name}</h2>
        {isHost ? (
          <button type="button" className="button primary full" onClick={() => goToStep('restsearch')}>이 메뉴로 식당 찾기<ChevronRight size={17} /></button>
        ) : (
          <p className="notice-inline">방장이 이 메뉴로 식당을 찾아 투표를 이어가요.</p>
        )}
        <p className="muted-sm center">다음 단계: 확정 메뉴 기준으로 근처 식당을 찾아 투표해요.</p>
      </section>
    </main>
  );
}
