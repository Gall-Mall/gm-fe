import { Check } from 'lucide-react';
import { allergenOptions } from '../../data/appData';
import { MenuAccordion } from '../../components/MenuAccordion';
import { AiAnalyzeField } from '../../components/AiAnalyzeField';

const STEPS = [
  { n: 1, label: '약관 동의' },
  { n: 2, label: '알레르기' },
  { n: 3, label: '못 먹는 음식' },
  { n: 4, label: '선호 음식' },
];

const CONSENTS = [
  { key: 'service', label: '서비스 이용약관 동의', badge: '필수', desc: '갈래말래 이용약관에 동의합니다.' },
  { key: 'privacy', label: '개인정보 수집·이용 동의', badge: '필수', desc: '계정·위치 정보를 추천 제공에 사용합니다.' },
  { key: 'age', label: '만 14세 이상입니다', badge: '필수', desc: '서비스 이용 가능 연령을 확인합니다.' },
  { key: 'health', label: '건강정보(알레르기) 수집·이용', badge: '별도 필수', desc: '알레르기 성분 필터를 위해 별도 동의가 필요해요.' },
  { key: 'logs', label: '서비스 개선 로그 활용', badge: '선택', desc: '추천 품질 향상에 익명 통계를 사용합니다.' },
];

export function OnboardingPage({ flow }) {
  const {
    goToStep, onbStep, setOnbStep, consent, setConsent,
    allergens, setAllergens, aiAllergens, setAiAllergens,
    dislikeMenus, setDislikeMenus, aiExclusions, setAiExclusions,
    likeMenus, setLikeMenus, aiLikes, setAiLikes, analyzeText, completeOnboarding, operationError,
  } = flow;

  const required = ['service', 'privacy', 'age', 'health'];
  const req1 = required.every((k) => consent[k]);
  const allOn = CONSENTS.every((c) => consent[c.key]);
  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function next() {
    if (onbStep === 1 && !req1) return;
    if (onbStep < 4) setOnbStep(onbStep + 1);
    else await completeOnboarding();
  }
  function prev() {
    if (onbStep === 1) goToStep('login');
    else setOnbStep(onbStep - 1);
  }

  return (
    <div className="screen onboarding-screen">
      <div className="onboarding-inner">
        <div className="brand-inline"><img className="brand-logo" src="/gallae-mallae-logo.png" alt="" /><strong>갈래말래</strong></div>

        <div className="step-progress">
          {STEPS.map((s) => {
            const done = onbStep > s.n;
            const active = onbStep === s.n;
            return (
              <div className="step-item" key={s.n}>
                <span className={`step-dot ${done ? 'done' : active ? 'active' : ''}`}>{done ? '✓' : s.n}</span>
                <span className={`step-label ${active ? 'active' : ''}`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="onboarding-card">
          {onbStep === 1 ? (
            <>
              <h1>시작 전에 동의해주세요</h1>
              <p className="section-hint">더 정확한 추천과 알레르기 안전을 위해 아래 항목에 동의가 필요해요.</p>
              <button type="button" className="consent-all" onClick={() => { const v = !allOn; setConsent(Object.fromEntries(CONSENTS.map((c) => [c.key, v]))); }}>
                <span className={`checkbox ${allOn ? 'on' : ''}`}><Check size={14} /></span>
                <strong>전체 동의합니다</strong>
              </button>
              <div className="consent-list">
                {CONSENTS.map((c) => (
                  <button type="button" key={c.key} className="consent-row" onClick={() => setConsent({ ...consent, [c.key]: !consent[c.key] })}>
                    <span className={`checkbox ${consent[c.key] ? 'on' : ''}`}><Check size={13} /></span>
                    <span className="consent-text">
                      <span className="consent-title"><strong>{c.label}</strong><em className={`badge ${c.badge === '선택' ? 'soft' : ''}`}>{c.badge}</em></span>
                      <span className="muted-sm">{c.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {onbStep === 2 ? (
            <>
              <h1>알레르기 성분을 알려주세요</h1>
              <p className="section-hint">선택한 성분이 포함된 메뉴는 추천에서 <strong>자동으로 제외</strong>돼요.</p>
              <div className="chip-wrap">
                {allergenOptions.map((a) => (
                  <button key={a} type="button" className={`chip ${allergens.includes(a) ? 'active' : ''}`} onClick={() => toggle(allergens, setAllergens, a)}>{a}</button>
                ))}
              </div>
              <p className="warn-box">⚠ 안전을 위해 알레르기 성분은 추천에서 예외 없이 제외됩니다.</p>
              <AiAnalyzeField kind="allergy" tone="red" items={aiAllergens} setItems={setAiAllergens} analyzeText={analyzeText}
                placeholder="알레르기·못 먹는 이유를 문장으로 입력" hint={'예) "새우 알레르기", "우유 마시면 배가 아파요" — AI가 성분을 분석해 저장해요.'} />
            </>
          ) : null}

          {onbStep === 3 ? (
            <>
              <h1>못 먹는 음식이 있나요?</h1>
              <p className="section-hint">카테고리는 좋아해도 특정 메뉴만 빼고 싶을 수 있죠. 카테고리를 열어 <strong>싫어하는 메뉴만</strong> 골라주세요.</p>
              <MenuAccordion selected={dislikeMenus} onToggle={(k) => toggle(dislikeMenus, setDislikeMenus, k)} countWord="제외" blocked={likeMenus} />
              <AiAnalyzeField kind="dislike" items={aiExclusions} setItems={setAiExclusions} analyzeText={analyzeText}
                placeholder="못 먹는 음식을 문장으로 입력" hint={'예) "고수 들어간 음식", "느끼한 건 못 먹어요" — AI가 분석해 제외 항목으로 저장해요.'} />
            </>
          ) : null}

          {onbStep === 4 ? (
            <>
              <h1>좋아하는 음식을 알려주세요</h1>
              <p className="section-hint">자주 끌리는 메뉴를 골라두면 추천이 더 정확해져요. 카테고리를 열어 <strong>좋아하는 메뉴</strong>를 선택하세요.</p>
              <MenuAccordion selected={likeMenus} onToggle={(k) => toggle(likeMenus, setLikeMenus, k)} countWord="선택" blocked={dislikeMenus} />
              <AiAnalyzeField kind="like" items={aiLikes} setItems={setAiLikes} analyzeText={analyzeText}
                placeholder="좋아하는 음식을 문장으로 입력" hint={'예) "매콤한 국물 좋아해요", "든든한 고기 요리" — AI가 분석해 취향으로 저장해요.'} />
            </>
          ) : null}
        </div>

        <div className="onboarding-nav">
          <button type="button" className="button ghost" onClick={prev}>{onbStep === 1 ? '로그인' : '이전'}</button>
          <button type="button" className={`button primary ${onbStep === 1 && !req1 ? 'disabled' : ''}`} disabled={onbStep === 1 && !req1} onClick={next}>
            {onbStep === 4 ? '완료' : '다음'}
          </button>
        </div>
        {operationError ? <p className="error-text center" role="alert">{operationError}</p> : null}
      </div>
    </div>
  );
}
