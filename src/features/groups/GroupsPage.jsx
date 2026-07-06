import { ChevronRight, Plus } from 'lucide-react';
import { AvatarStack } from '../../components/AvatarStack';
import { Button } from '../../components/Button';
import { travelGroups } from '../../data/appData';

export function GroupsPage({ goToStep, members }) {
  return (
    <main className="page groups-page">
      <div className="page-title-row">
        <div>
          <h1>내 여행 그룹</h1>
          <p>다가오는 여행의 맛집 후보와 멤버 취향 입력 상태를 확인하세요.</p>
        </div>
        <Button icon={Plus} onClick={() => goToStep('create')}>새 그룹 만들기</Button>
      </div>
      <div className="groups-grid">
        {travelGroups.map((group) => (
          <button className="trip-card" key={group.name} onClick={() => goToStep('dashboard')} type="button">
            <div className="trip-card-top">
              <div>
                <h2>{group.name}</h2>
                <p>{group.city}</p>
              </div>
              <span>{group.status}</span>
            </div>
            <strong>취향 입력 {group.progress}% 완료</strong>
            <div className="progress-track">
              <span style={{ width: `${group.progress}%` }} />
            </div>
            <div className="trip-card-bottom">
              <AvatarStack members={members} compact />
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
        <button className="new-trip-card" onClick={() => goToStep('create')} type="button">
          <span className="icon-tile">
            <Plus size={18} />
          </span>
          <strong>새 여행 준비하기</strong>
          <p>멤버를 초대하고 식당 후보를 함께 좁혀보세요.</p>
        </button>
      </div>
    </main>
  );
}
