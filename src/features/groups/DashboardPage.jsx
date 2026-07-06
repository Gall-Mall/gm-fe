import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Copy,
  MapPin,
} from 'lucide-react';
import { AvatarStack } from '../../components/AvatarStack';
import { Button } from '../../components/Button';
import okonomiyakiImage from '../../assets/okonomiyaki-card.png';
import osakaImage from '../../assets/osaka-hero.png';

export function DashboardPage({ group, members, goToStep, copied, onCopy }) {
  const readyMembers = members.filter((member) => member.status === '완료').length;
  const tasteProgress = Math.round((readyMembers / members.length) * 100);
  const copyFeedback = {
    success: '초대 링크가 클립보드에 복사되었습니다.',
    error: '클립보드 복사에 실패했습니다. 초대 코드를 직접 공유해주세요.',
  }[copied];

  return (
    <main className="page dashboard-page">
      <section className="dashboard-hero">
        <img src={osakaImage} alt="" />
        <div>
          <span className="chip muted">진행 중인 여행</span>
          <h1>{group.name}</h1>
          <p>
            <CalendarDays size={15} />
            {group.date}
          </p>
        </div>
        <aside className="invite-code">
          <span>초대 코드</span>
          <strong>{group.inviteCode}</strong>
          <button onClick={onCopy} type="button">
            <Copy size={14} />
            {copied === 'success' ? '복사됨' : '링크 복사'}
          </button>
          {copyFeedback ? <p className={`copy-feedback ${copied}`} role="status">{copyFeedback}</p> : null}
        </aside>
      </section>

      <div className="dashboard-grid">
        <section className="readiness-card">
          <div className="readiness-head">
            <div>
              <h2>여행 준비 현황</h2>
              <p>{members.length}명 중 {readyMembers}명이 취향 입력을 마쳤습니다.</p>
            </div>
          </div>
          <div className="readiness-metrics" aria-label="여행 준비 지표">
            <div>
              <span>취향 입력률</span>
              <strong>{readyMembers}/{members.length}명 완료</strong>
              <div className="progress-track large" aria-label={`취향 입력률 ${tasteProgress}%`}>
                <span style={{ width: `${tasteProgress}%` }} />
              </div>
            </div>
            <div>
              <span>추천 신뢰도</span>
              <strong>{group.readiness}%</strong>
              <div className="progress-track large" aria-label={`추천 신뢰도 ${group.readiness}%`}>
                <span style={{ width: `${group.readiness}%` }} />
              </div>
            </div>
          </div>
          <div className="dashboard-actions">
            <Button icon={ChevronRight} onClick={() => goToStep('taste')}>내 취향 입력하기</Button>
            <Button variant="outline" icon={ClipboardCheck} onClick={() => goToStep('analysis')}>현재 입력 기준 결과 보기</Button>
          </div>
        </section>

        <section className="companions-card">
          <h2>여행 멤버</h2>
          <div className="member-list">
            {members.map((member) => (
              <div className="member-row" key={member.name}>
                <span className="member-avatar">{member.name.slice(0, 1)}</span>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.status === '완료' ? '취향 입력 완료' : '응답 대기 중'}</span>
                </div>
                <em>{member.type}</em>
              </div>
            ))}
          </div>
        </section>

        <aside className="side-stack">
          <article className="snapshot-card">
            <img src={okonomiyakiImage} alt="" />
            <h2>그룹 취향 스냅샷</h2>
            <p>현재 입력 기준으로 현지 분위기, 편한 식사, 늦은 저녁 동선에 잘 맞는 그룹입니다.</p>
            <div>
              <span>로컬 음식</span>
              <span>짭짤한 맛</span>
              <span>편한 분위기</span>
            </div>
          </article>
          <article className="map-card">
            <h2>
              <MapPin size={16} />
              주요 동선
            </h2>
            <div className="mini-map" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>Osaka, Japan · Namba dining route</p>
          </article>
        </aside>
      </div>
    </main>
  );
}
