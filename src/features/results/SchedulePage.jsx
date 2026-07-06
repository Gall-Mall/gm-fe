import { Home } from 'lucide-react';
import { Button } from '../../components/Button';
import { scheduleItems } from '../../data/appData';

export function SchedulePage({ candidate, goToStep, voteCounts }) {
  const finalScheduleItems = scheduleItems
    .filter((item) => item.time === '19:30' || item.title !== candidate.name)
    .map((item) =>
      item.time === '19:30'
        ? {
            ...item,
            title: candidate.name,
            detail: `최종 투표 후보 · ${candidate.scheduleLabel} · 애매해 ${voteCounts.maybe}`,
          }
        : item,
    );

  return (
    <main className="page schedule-page">
      <div className="page-title-row">
        <div>
          <h1>날짜별 맛집 일정</h1>
          <p>투표 결과가 하루 동선에 맞춰 정리되었습니다.</p>
        </div>
        <Button variant="outline" icon={Home} onClick={() => goToStep('home')}>메인으로</Button>
      </div>
      <section className="timeline-card">
        <h2>Oct 12, 2024</h2>
        {finalScheduleItems.map((item) => (
          <article className="schedule-item" key={`${item.time}-${item.title}`}>
            <time>{item.time}</time>
            <div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
