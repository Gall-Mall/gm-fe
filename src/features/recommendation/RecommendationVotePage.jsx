import { ExternalLink, Heart, HelpCircle, X } from 'lucide-react';
import { googleMapsSearchUrl } from '../../utils/maps';
import { RouteMapPreview } from './RouteMapPreview';

export function RecommendationVotePage({
  candidates,
  onSelectCandidate,
  onVote,
  selectedCandidate,
  selectedCandidateId,
  voteCounts,
}) {
  const responseCount = voteCounts.like + voteCounts.maybe + voteCounts.dislike;

  return (
    <main className="page vote-page">
      <div className="map-vote-layout">
        <RouteMapPreview
          onSelectCandidate={onSelectCandidate}
          selectedCandidate={selectedCandidate}
          selectedCandidateId={selectedCandidateId}
          showPlaceCard={false}
        />
        <aside className="vote-card recommendation-sidebar" aria-label="추천 후보 사이드 패널">
          <div className="vote-heading">
            <div>
              <span>갈래 말래 샘플 투표</span>
              <h1>오늘 저녁 어디로 갈까요?</h1>
            </div>
            <em>그룹 기존 반응 {responseCount}명</em>
          </div>
          <p className="vote-status-row">
            <span>내 투표 대기</span>
            <strong>기본 추천은 동선과 단체석을 우선해요.</strong>
          </p>
          <div className="candidate-list" aria-label="지도 추천 후보 목록">
            {candidates.map((candidate) => (
              <button
                aria-label={`${candidate.name} 후보 선택`}
                aria-pressed={selectedCandidateId === candidate.id}
                className={selectedCandidateId === candidate.id ? 'selected' : ''}
                key={candidate.id}
                onClick={() => onSelectCandidate(candidate.id)}
                type="button"
              >
                <span>
                  <strong>{candidate.name}</strong>
                  <small>{candidate.distance} · {candidate.meta}</small>
                </span>
                <em>{candidate.score}%</em>
              </button>
            ))}
          </div>
          <a
            aria-label={`${selectedCandidate.name} 구글지도에서 보기`}
            className="candidate-map-link"
            href={googleMapsSearchUrl(selectedCandidate)}
            rel="noreferrer"
            target="_blank"
          >
            <div className="candidate-media">
              <img src={selectedCandidate.image} alt={`${selectedCandidate.name} 장소 이미지`} />
              <span>{selectedCandidate.city}</span>
              <strong>{selectedCandidate.score}%</strong>
              <div>
                <h2>{selectedCandidate.name}</h2>
                <small>현재 위치에서 {selectedCandidate.distance}</small>
                <p>{selectedCandidate.meta}</p>
              </div>
            </div>
            <span className="map-open-label">
              구글지도에서 확인
              <ExternalLink size={14} aria-hidden="true" />
            </span>
          </a>
          <div className="compatibility-row">
            <span>그룹 적합도</span>
            <strong>{selectedCandidate.score}% 일치</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${selectedCandidate.score}%` }} />
          </div>
          <div className="reaction-summary" aria-label="현재 그룹 반응">
            <span className="want">갈래 {voteCounts.like}</span>
            <span className="maybe">애매해 {voteCounts.maybe}</span>
            <span className="pass">말래 {voteCounts.dislike}</span>
          </div>
          <div className="vote-actions side-vote-actions" aria-label="추천 후보 투표">
            <button className="vote-negative" onClick={() => onVote('dislike')} type="button">
              <X size={24} />
              <span>말래</span>
            </button>
            <button className="vote-maybe" onClick={() => onVote('maybe')} type="button">
              <HelpCircle size={25} />
              <span>애매해</span>
            </button>
            <button className="vote-positive" onClick={() => onVote('like')} type="button">
              <Heart size={24} />
              <span>갈래</span>
            </button>
          </div>
          <section className="reason-box positive">
            <h3>추천 이유</h3>
            <ul>
              {selectedCandidate.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
          <section className="reason-box caution">
            <h3>확인할 점</h3>
            <ul>
              {selectedCandidate.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
