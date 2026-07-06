import { ChevronRight, MapPin } from 'lucide-react';
import { Button } from '../../components/Button';
import { RadarChart } from '../../components/RadarChart';

export function PersonalResultPage({ goToStep }) {
  return (
    <main className="page result-page">
      <div className="section-heading">
        <h1>나의 먹거리 여행 타입</h1>
        <p>나의 취향 분석 결과를 확인해보세요.</p>
      </div>
      <div className="result-layout">
        <section className="profile-result-card">
          <div className="profile-photo">
            <span>나</span>
          </div>
          <span className="chip">Type B-03</span>
          <h2>로컬 탐험가형</h2>
          <p>
            유명한 맛집보다 골목 사이사이에 숨겨진 현지 맛집을 좋아하고, 길게 줄을 서더라도 새로운
            메뉴를 경험하는 쪽에 설렙니다.
          </p>
          <h3>선호 태그</h3>
          <div className="tag-cloud">
            <span>로컬분위기</span>
            <span>숨은맛집</span>
            <span>대기감수</span>
          </div>
          <h3>비선호 태그</h3>
          <div className="tag-cloud quiet">
            <span>단체프랜차이즈</span>
            <span>관광객밀집</span>
          </div>
        </section>
        <section className="analysis-card">
          <h2>맛 취향 분석도</h2>
          <RadarChart />
          <div className="insight-note">
            <MapPin size={16} />
            <p>친구가 저장한 장소들을 함께 보면 동선과 대기 시간을 더 정확하게 비교할 수 있어요.</p>
          </div>
          <Button className="full-width" icon={ChevronRight} onClick={() => goToStep('analysis')}>그룹 분석 결과보기</Button>
          <Button className="full-width" variant="outline" onClick={() => goToStep('taste')}>테스트 다시하기</Button>
        </section>
      </div>
    </main>
  );
}
