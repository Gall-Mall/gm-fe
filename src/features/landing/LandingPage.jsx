import { ChevronRight, ClipboardCheck, Heart, Users } from 'lucide-react';
import { AvatarStack } from '../../components/AvatarStack';
import { Button } from '../../components/Button';
import { RouteMapPreview } from '../recommendation/RouteMapPreview';

const featureCards = [
  {
    title: '취향 분석',
    description: '간단한 질문만으로 푸드스타일을 찾고 취향의 차이를 명확하게 보여줍니다.',
    icon: ClipboardCheck,
  },
  {
    title: '그룹 매칭',
    description: '서로 다른 선호를 한 화면에 모아 모두가 납득할 만한 후보를 좁혀줍니다.',
    icon: Users,
  },
  {
    title: '카드 투표',
    description: '추천 카드에 갈래, 애매해, 말래로 반응하며 자연스럽게 최종 후보를 고릅니다.',
    icon: Heart,
  },
];

export function LandingPage({ goToStep, members }) {
  return (
    <main className="page landing-page">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="chip">갈래 말래 결정 도우미</span>
          <h1>갈래? 말래? 애매해? 모두가 납득하는 맛집 결정</h1>
          <p>
            친구들의 입맛, 예산, 동선, 못 먹는 조건을 한 번에 모아 맛집 후보를 추천하고
            갈래 / 말래 / 애매해 카드 투표로 빠르게 정리합니다.
          </p>
          <div className="hero-actions">
            <Button icon={ChevronRight} onClick={() => goToStep('create')}>무료로 그룹 만들기</Button>
            <Button variant="ghost" icon={ClipboardCheck} onClick={() => goToStep('analysis')}>샘플 결과 보기</Button>
          </div>
          <div className="concept-line" aria-label="서비스 컨셉">
            <strong>갈래 말래는 맛집 검색보다 그룹 결정을 돕습니다.</strong>
            <span>싫은 조건까지 숨기지 않고 보여줘서 모두가 납득할 수 있게 합니다.</span>
          </div>
          <dl className="hero-proof" aria-label="서비스 요약">
            <div>
              <dt>3분</dt>
              <dd>취향 입력</dd>
            </div>
            <div>
              <dt>4명</dt>
              <dd>그룹 조율</dd>
            </div>
            <div>
              <dt>92%</dt>
              <dd>추천 적합도</dd>
            </div>
          </dl>
        </div>
        <div className="hero-media map-first" aria-label="난바 저녁 루트 미리보기">
          <RouteMapPreview compact />
          <div className="decision-stack" aria-label="그룹 투표 예시">
            <span className="decision-pill want">갈래 3</span>
            <span className="decision-pill maybe">애매해 1</span>
            <span className="decision-pill pass">말래 0</span>
          </div>
        </div>
      </section>

      <section className="feature-section" aria-labelledby="feature-title">
        <div className="section-heading">
          <h2 id="feature-title">맛집 결정이 흐려지는 순간을 줄입니다</h2>
          <p>취향 분석, 후보 추천, 카드 투표가 하나의 여행 준비 흐름으로 이어집니다.</p>
        </div>
        <div className="feature-grid">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <article className="feature-card" key={title}>
              <span className="icon-tile">
                <Icon size={19} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="next-band">
        <h2>다음 여행, 준비되셨나요?</h2>
        <p>지금 바로 그룹을 만들고 친구들과 음식 취향을 맞춰보세요.</p>
        <Button variant="light" onClick={() => goToStep('create')}>무료로 그룹 만들기</Button>
        <AvatarStack members={members} compact />
      </section>
    </main>
  );
}
