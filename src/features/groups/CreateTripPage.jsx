import { useState } from 'react';
import { ArrowLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { Button } from '../../components/Button';
import { purposeOptions } from '../../data/appData';

export function CreateTripPage({ onCreate, goToStep }) {
  const [draft, setDraft] = useState({
    name: 'Osaka Foodies',
    destination: 'Osaka, Japan',
    date: 'Oct 12 - Oct 18, 2024',
    members: 4,
    purpose: '먹방여행',
  });

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function adjustMembers(amount) {
    setDraft((current) => ({
      ...current,
      members: Math.max(2, Math.min(8, current.members + amount)),
    }));
  }

  return (
    <main className="form-page">
      <button className="back-link" onClick={() => goToStep('groups')} type="button">
        <ArrowLeft size={16} />
        내 그룹으로
      </button>
      <section className="form-intro">
        <h1>다음 여행지는?</h1>
        <p>여행 이름과 목적지만 정하면 친구들을 초대해 취향 입력과 맛집 투표를 시작할 수 있어요.</p>
      </section>
      <form className="trip-form" onSubmit={(event) => onCreate(event, draft)}>
        <label>
          <span>그룹 이름</span>
          <input value={draft.name} onChange={(event) => updateField('name', event.target.value)} />
        </label>
        <label>
          <span>여행지</span>
          <input value={draft.destination} onChange={(event) => updateField('destination', event.target.value)} />
        </label>
        <div className="form-row">
          <label>
            <span>여행 날짜</span>
            <input value={draft.date} onChange={(event) => updateField('date', event.target.value)} />
          </label>
          <div className="member-stepper" aria-label="멤버 수">
            <span>멤버 수</span>
            <div>
              <button aria-label="멤버 줄이기" onClick={() => adjustMembers(-1)} type="button">
                <Minus size={15} />
              </button>
              <strong>{draft.members}</strong>
              <button aria-label="멤버 늘리기" onClick={() => adjustMembers(1)} type="button">
                <Plus size={15} />
              </button>
            </div>
          </div>
        </div>
        <fieldset>
          <legend>여행 목적</legend>
          <div className="purpose-list">
            {purposeOptions.map((purpose) => (
              <button
                aria-pressed={draft.purpose === purpose}
                className={draft.purpose === purpose ? 'selected' : ''}
                key={purpose}
                onClick={() => updateField('purpose', purpose)}
                type="button"
              >
                {purpose}
              </button>
            ))}
          </div>
        </fieldset>
        <Button className="full-width" icon={ChevronRight} type="submit">그룹 생성하고 초대하기</Button>
      </form>
    </main>
  );
}
