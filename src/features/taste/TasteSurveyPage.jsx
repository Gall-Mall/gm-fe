import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { tasteOptions } from '../../data/appData';

export function TasteSurveyPage({ onSubmitTaste }) {
  const [selected, setSelected] = useState('');

  return (
    <main className="survey-page">
      <section className="survey-card">
        <div className="survey-progress">
          <span>1 / 3</span>
          <strong>취향 선택</strong>
        </div>
        <div className="survey-track" aria-hidden="true">
          <span />
        </div>
        <h1>어떤 음식을 선호하시나요?</h1>
        <p>평소 즐겨 먹는 음식 카테고리를 골라주세요.</p>
        <div className="taste-grid">
          {tasteOptions.map((option) => (
            <button
              aria-label={option.label}
              aria-pressed={selected === option.label}
              className={selected === option.label ? 'selected' : ''}
              key={option.label}
              onClick={() => setSelected(option.label)}
              type="button"
            >
              {option.image ? <img src={option.image} alt="" /> : <span className="soft-dot" />}
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </button>
          ))}
        </div>
        <div className="survey-footer">
          <Button disabled={!selected} icon={ChevronRight} onClick={() => onSubmitTaste(selected)}>다음</Button>
        </div>
      </section>
    </main>
  );
}
