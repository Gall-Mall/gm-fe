import { ChevronRight, Utensils } from 'lucide-react';
import { Button } from '../../components/Button';
import { RadarChart } from '../../components/RadarChart';

export function GroupAnalysisPage({ goToStep }) {
  return (
    <main className="page group-analysis-page">
      <div className="section-heading">
        <h1>우리 그룹은 어떤 입맛일까요?</h1>
        <p>멤버들의 취향을 분석해 그룹 밸런스를 도출했습니다.</p>
      </div>
      <div className="analysis-layout">
        <section className="group-type-card">
          <span className="group-symbol">
            <Utensils size={30} />
          </span>
          <h2>로컬 감성 안정형</h2>
          <p>새로운 도전보다 검증된 맛집을 선호하며, 분위기보다는 모두의 만족도를 우선하는 그룹입니다.</p>
          <div className="tag-cloud">
            <span>골목맛집</span>
            <span>소규모모임</span>
            <span>적당한웨이팅</span>
          </div>
        </section>
        <section className="analysis-card">
          <h2>그룹 성향 분석</h2>
          <RadarChart variant="group" />
        </section>
      </div>
      <div className="summary-grid">
        <article>
          <h3>공통 선호</h3>
          <ul>
            <li>고기와 면요리 선호</li>
            <li>조용한 분위기</li>
            <li>도보 이동 동선</li>
          </ul>
        </article>
        <article className="warning">
          <h3>주의 사항</h3>
          <ul>
            <li>해산물 알레르기 1명</li>
            <li>웨이팅 30분 이상 부담</li>
            <li>매운맛 선호 차이</li>
          </ul>
        </article>
        <article>
          <h3>예산 합의점</h3>
          <strong>₩25,000</strong>
          <p>1인당 한 끼 기준</p>
        </article>
      </div>
      <div className="center-action">
        <Button icon={ChevronRight} onClick={() => goToStep('recommend')}>추천 카드 보러가기</Button>
      </div>
    </main>
  );
}
