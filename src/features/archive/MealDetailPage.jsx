import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import { KakaoMap } from '../../components/KakaoMap';
import { resolvePlaceUrl } from '../../utils/placeUrl';

export function MealDetailPage({ flow }) {
  const { selectedMeal, goToStep } = flow;
  const m = selectedMeal;
  if (!m) return <main className="screen page narrow"><p className="muted">선택된 식사가 없어요.</p></main>;
  const hasCoordinates = Number.isFinite(m.latitude) && Number.isFinite(m.longitude);
  const placeUrl = resolvePlaceUrl(m);
  const menuCandidates = Array.isArray(m.menuCandidates) ? m.menuCandidates : [];

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

      <section className="card map-card meal-map-card">
        <div className="card-title"><span className="card-icon"><MapPin size={15} /></span><h2>식당 위치</h2></div>
        {hasCoordinates ? (
          <KakaoMap
            center={{ lat: m.latitude, lng: m.longitude }}
            markers={[{ lat: m.latitude, lng: m.longitude, label: m.place, url: placeUrl }]}
            focus={{ lat: m.latitude, lng: m.longitude }}
            height={260}
          />
        ) : (
          <div className="map-holder map-fallback" style={{ height: 180 }}>
            <span>저장된 식당 좌표가 없어 주소로 확인해주세요.</span>
          </div>
        )}
        <div className="meal-map-meta">
          <span className="muted-sm"><MapPin size={13} /> {m.tag || m.city}</span>
          {placeUrl ? (
            <a className="button ghost" href={placeUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} />식당 정보 보기
            </a>
          ) : null}
        </div>
      </section>

      <section className="card history-candidates-card">
        <div className="history-candidates-head">
          <div>
            <span className="tag">지난 투표</span>
            <h2>당시 메뉴 후보와 투표 결과</h2>
          </div>
          <span>{menuCandidates.length}개 후보</span>
        </div>
        {menuCandidates.length ? (
          <div className="history-candidate-list">
            {menuCandidates.map((candidate) => {
              const goCount = candidate.goCount || 0;
              const maybeCount = candidate.maybeCount || 0;
              const noCount = candidate.noCount || 0;
              const total = candidate.respondentCount || goCount + maybeCount + noCount;
              const votes = [
                { label: '갈래', count: goCount, cls: 'like' },
                { label: '애매하긴해', count: maybeCount, cls: 'maybe' },
                { label: '말래', count: noCount, cls: 'dislike' },
              ];
              return (
                <article
                  className={`history-candidate ${candidate.selected ? 'is-selected' : ''}`}
                  key={candidate.menuId}
                  aria-label={`${candidate.name} 갈래 ${goCount}명 애매하긴해 ${maybeCount}명 말래 ${noCount}명`}
                >
                  <div
                    className="history-candidate-image"
                    style={candidate.imageUrl ? { backgroundImage: `url(${candidate.imageUrl})` } : undefined}
                    aria-hidden="true"
                  >
                    {!candidate.imageUrl ? '🍽️' : null}
                  </div>
                  <div className="history-candidate-body">
                    <div className="history-candidate-title">
                      <div>
                        <h3>{candidate.name}</h3>
                        <span>총 {total}명 참여</span>
                      </div>
                      {candidate.selected ? <strong>최종 선택</strong> : null}
                    </div>
                    <div className="history-candidate-votes">
                      {votes.map((vote) => {
                        const percentage = total ? Math.round((vote.count / total) * 100) : 0;
                        return (
                          <div className={`candidate-vote candidate-vote-${vote.cls}`} key={vote.label}>
                            <div><span>{vote.label}</span><strong>{vote.count}명</strong><em>{percentage}%</em></div>
                            <span className="candidate-vote-track" aria-hidden="true">
                              <i style={{ width: `${percentage}%` }} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="history-candidates-empty">저장된 후보별 투표 결과가 없습니다.</p>
        )}
      </section>
    </main>
  );
}
