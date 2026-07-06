import { routeStops, voteCandidate } from '../../data/appData';

export function RouteMapPreview({
  compact = false,
  onSelectCandidate,
  selectedCandidate = voteCandidate,
  selectedCandidateId = voteCandidate.id,
  showPlaceCard = true,
}) {
  const isInteractive = Boolean(onSelectCandidate);

  return (
    <section className={`route-map-preview ${compact ? 'compact' : ''}`} aria-label="난바 저녁 루트 지도">
      <div className="route-map-top">
        <div>
          <span className="map-eyebrow">지도 중심 추천</span>
          <h2>지도 기준 추천 후보</h2>
        </div>
        <strong>{selectedCandidate.distance}</strong>
      </div>
      <div className="route-canvas" aria-hidden={!isInteractive}>
        <svg className="route-line" viewBox="0 0 420 260">
          <path d="M70 178 C122 128 162 184 216 104 S316 84 346 174" />
        </svg>
        {routeStops.map((stop, index) => (
          stop.id && onSelectCandidate ? (
            <button
              aria-label={`${stop.name} 지도 핀 선택`}
              aria-pressed={selectedCandidateId === stop.id}
              className={`route-pin ${stop.type} ${selectedCandidateId === stop.id ? 'selected' : ''}`}
              key={stop.name}
              onClick={() => onSelectCandidate(stop.id)}
              style={{ top: stop.top, left: stop.left }}
              type="button"
            >
              {index + 1}
            </button>
          ) : (
            <span
              className={`route-pin ${stop.type}`}
              key={stop.name}
              style={{ top: stop.top, left: stop.left }}
            >
              {index + 1}
            </span>
          )
        ))}
        {showPlaceCard ? (
          <article className="route-place-card">
            <img src={selectedCandidate.image} alt="" />
            <div>
              <strong>{selectedCandidate.name}</strong>
              <span>현재 위치에서 {selectedCandidate.distance}</span>
            </div>
          </article>
        ) : null}
      </div>
      <div className="route-map-bottom">
        <div>
          <strong>지도에서 동선 먼저 보고 결정해요</strong>
          <span>후보의 거리, 웨이팅, 그룹 반응을 한 화면에서 비교합니다.</span>
        </div>
        <div className="route-tags" aria-label="지도 추천 요약">
          <span>난바 저녁 루트</span>
          <span>{selectedCandidate.meta.split(' · ')[1] || selectedCandidate.category}</span>
          <span>{selectedCandidate.score}% 일치</span>
        </div>
      </div>
    </section>
  );
}
