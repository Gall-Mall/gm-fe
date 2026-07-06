import { CalendarDays } from 'lucide-react';
import { Button } from '../../components/Button';
import { voteLabelByChoice } from '../../utils/vote';

export function VoteResultsPage({
  alternateCandidates,
  candidate,
  lastVote,
  lastVoteChange,
  onSchedule,
  selectedVariant,
  setSelectedVariant,
  voteCounts,
}) {
  const isVariantB = selectedVariant === 'B';
  const groupBestCandidate = [...alternateCandidates].sort((a, b) => b.score - a.score)[0] || candidate;
  const displayedCandidate = isVariantB ? groupBestCandidate : candidate;
  const displayedVotes = isVariantB ? displayedCandidate.votes : voteCounts;
  const selectedLabel = isVariantB ? '그룹 최고점안' : '내 선택안';
  const voteLabel = voteLabelByChoice[lastVote];

  return (
    <main className="page final-result-page">
      <div className="section-heading">
        <h1>투표 결과와 최종 후보</h1>
        <p>방금 선택한 투표는 {voteLabel}로 저장되었습니다.</p>
        {lastVoteChange ? (
          <div className="vote-change-summary" aria-label="내 투표 반영 요약">
            <span>내 투표: {voteLabel}</span>
            <strong>{lastVoteChange.candidateName} {voteLabel} {lastVoteChange.before} → {lastVoteChange.after}</strong>
          </div>
        ) : null}
      </div>
      <div className="final-result-layout">
        <section
          className={`final-card ${isVariantB ? 'variant-b' : ''}`}
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(255, 254, 250, 0.9), rgba(255, 254, 250, 0.68)), url(${displayedCandidate.image})`,
          }}
        >
          <span className="chip">{selectedLabel}</span>
          <h2>{displayedCandidate.name}</h2>
          <p>{displayedCandidate.meta} 후보입니다. {displayedCandidate.reasons[0]}</p>
          <div className="score-row">
            <span>그룹 적합도</span>
            <strong>{displayedCandidate.score}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${displayedCandidate.score}%` }} />
          </div>
          <div className="result-vote-breakdown" aria-label="투표 분포">
            <span className="want">갈래 {displayedVotes.like}</span>
            <span className="maybe">애매해 {displayedVotes.maybe}</span>
            <span className="pass">말래 {displayedVotes.dislike}</span>
          </div>
        </section>
        <aside className="decision-card">
          <h2>최종 결정</h2>
          <p>{selectedLabel}을 일정에 추가하면 날짜별 맛집 계획으로 이동합니다.</p>
          <div className="variant-switch">
            <Button variant={selectedVariant === 'A' ? 'primary' : 'outline'} onClick={() => setSelectedVariant('A')}>
              내 선택안 보기
            </Button>
            <Button variant={selectedVariant === 'B' ? 'primary' : 'outline'} onClick={() => setSelectedVariant('B')}>
              그룹 최고점안 보기
            </Button>
          </div>
          <Button className="full-width" icon={CalendarDays} onClick={() => onSchedule(displayedCandidate)}>일정에 추가</Button>
        </aside>
      </div>
    </main>
  );
}
