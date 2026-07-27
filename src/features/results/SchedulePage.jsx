import { ClipboardList, CircleCheck } from 'lucide-react';

export function SchedulePage({ flow }) {
  const { activeGroupId, goToStep, openGroupHistory, savedSchedule } = flow;

  return (
    <main className="screen page narrow">
      <header className="page-head col">
        <span className="tag">오늘의 일정</span>
        <h1>정해진 식사 일정</h1>
        <p className="muted">투표로 정한 식당을 시간대별로 정리했어요.</p>
      </header>

      {savedSchedule ? (
        <section className="card saved-schedule">
          <span className="saved-badge"><CircleCheck size={15} /> 방금 확정됨</span>
          <div className="schedule-row lead">
            <time>{savedSchedule.time}</time>
            <div>
              <h3>{savedSchedule.name}</h3>
              <p className="muted-sm">{savedSchedule.detail}</p>
              {savedSchedule.menu ? <p className="muted-sm">선택 메뉴 · {savedSchedule.menu}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {!savedSchedule ? (
        <section className="card waiting-box">
          <span>아직 확정된 식사 일정이 없어요.</span>
        </section>
      ) : null}

      <div className="page-actions">
        <button type="button" className="button ghost" onClick={() => goToStep('archive')}><ClipboardList size={16} /><span>지난 식사 보기</span></button>
        {/* 해당 그룹 식사 내역으로 이동 */}
        <button type="button" className="button primary" onClick={() => openGroupHistory(activeGroupId)}>해당 그룹 식사 내역으로 이동</button>
      </div>
    </main>
  );
}
