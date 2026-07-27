import { useState } from 'react';
import { CalendarPlus, MapPin, Check, Clock } from 'lucide-react';
import { voteLabelByChoice, voteChoices } from '../../utils/vote';

export function VoteResultsPage({ flow }) {
  const { gset, groupRestaurants, restaurantVotes, restaurantCandidates, confirmSchedule, isHost, operationError } = flow;

  const [finalRestId, setFinalRestId] = useState(groupRestaurants[0] || null);
  const [time, setTime] = useState(gset.recTime || '18:00');

  const pool = groupRestaurants.length
    ? restaurantCandidates.filter((c) => groupRestaurants.includes(c.id))
    : restaurantCandidates;

  const ranked = [...pool]
    .map((c) => {
      const v = restaurantVotes[c.id] || { like: 0, maybe: 0, dislike: 0 };
      return { ...c, v, total: v.like + v.maybe + v.dislike };
    })
    .sort((a, b) => b.v.like - a.v.like || (b.score || 0) - (a.score || 0));

  const finalRest = ranked.find((c) => c.id === finalRestId) || null;

  return (
    <main className="screen page narrow">
      <header className="page-head col">
        <span className="tag">방장 · 최종 식당 선택</span>
        <h1>어디로 갈래요?</h1>
        <p className="muted">
          {isHost ? '식당을 하나 선택하고 시간을 정해 일정에 저장해요.' : '방장이 최종 식당을 고르는 중이에요.'}
        </p>
      </header>

      <div className="candidate-two">
        {ranked.map((c) => {
          const selected = finalRestId === c.id;
          const inner = (
            <>
              <div className="rest-thumb sm" style={{ backgroundImage: `url(${c.image})` }} />
              <div className="candidate-info">
                <div className="final-name">
                  <strong>{c.name}</strong>
                  {selected ? <span className="candidate-check"><Check size={15} /></span> : <em className="accent">{c.score}%</em>}
                </div>
                <small className="muted-sm"><MapPin size={12} /> {c.city} · {c.meta}</small>
                <div className="tally">
                  {voteChoices.map((k) => <span key={k} className={`tally-${k}`}>{voteLabelByChoice[k]} {c.v[k]}</span>)}
                </div>
              </div>
            </>
          );
          if (!isHost) return <div className="candidate-card readonly" key={c.id}>{inner}</div>;
          return (
            <button type="button" key={c.id} className={`candidate-card ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => setFinalRestId(c.id)}>
              {inner}
            </button>
          );
        })}
      </div>
      {!ranked.length ? <div className="waiting-box"><span>아직 식당 검색 결과가 없어요.</span></div> : null}
      {operationError ? <p className="alert-warn">{operationError}</p> : null}

      {isHost ? (
        <>
          <section className="card">
            <label className="field">
              <span className="field-label"><Clock size={13} /> 식사 시간</span>
              <input type="time" className="text-input" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          </section>
          <div className="page-actions">
            <span className="muted-sm">{finalRest ? `${finalRest.name} · ${time}` : '식당을 선택해주세요'}</span>
            <button type="button" className="button primary" disabled={!finalRestId} onClick={() => confirmSchedule(finalRestId, time)}>
              <CalendarPlus size={16} /><span>이 시간으로 일정 저장</span>
            </button>
          </div>
        </>
      ) : (
        <div className="waiting-box"><span className="waiting-spinner" aria-hidden="true" /><span>방장이 최종 식당을 정하고 있어요</span></div>
      )}
    </main>
  );
}
