import { X } from 'lucide-react';
import { allergenOptions } from '../data/appData';
import { MenuAccordion } from './MenuAccordion';
import { AiAnalyzeField } from './AiAnalyzeField';

const TABS = [
  { k: 'allergy', label: '알레르기' },
  { k: 'dislike', label: '못 먹는 음식' },
  { k: 'like', label: '좋아하는 음식' },
];

export function PrefsModal({ flow }) {
  const {
    setPrefsOpen, prefsTab, setPrefsTab,
    allergens, setAllergens, aiAllergens, setAiAllergens,
    dislikeMenus, setDislikeMenus, aiExclusions, setAiExclusions,
    likeMenus, setLikeMenus, aiLikes, setAiLikes, analyzeText,
  } = flow;

  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="modal-overlay" onClick={() => setPrefsOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="muted-sm">마이페이지</span>
            <h2>취향 수정</h2>
          </div>
          <button type="button" className="icon-close" aria-label="닫기" onClick={() => setPrefsOpen(false)}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-tabs">
          {TABS.map((t) => (
            <button key={t.k} type="button" className={prefsTab === t.k ? 'tab active' : 'tab'} onClick={() => setPrefsTab(t.k)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="modal-body">
          {prefsTab === 'allergy' ? (
            <>
              <p className="section-hint">선택한 성분이 포함된 메뉴는 추천에서 <strong>자동으로 제외</strong>돼요.</p>
              <div className="chip-wrap">
                {allergenOptions.map((a) => (
                  <button key={a} type="button" className={`chip ${allergens.includes(a) ? 'active' : ''}`} onClick={() => toggle(allergens, setAllergens, a)}>{a}</button>
                ))}
              </div>
              <AiAnalyzeField kind="allergy" tone="red" items={aiAllergens} setItems={setAiAllergens} analyzeText={analyzeText}
                placeholder="알레르기·못 먹는 이유를 문장으로 입력" hint={'예) "새우 알레르기", "우유 마시면 배가 아파요" — AI가 성분을 분석해 저장해요.'} />
            </>
          ) : null}
          {prefsTab === 'dislike' ? (
            <>
              <p className="section-hint">카테고리를 열어 <strong>싫어하는 메뉴만</strong> 골라주세요.</p>
              <MenuAccordion selected={dislikeMenus} onToggle={(k) => toggle(dislikeMenus, setDislikeMenus, k)} countWord="제외" blocked={likeMenus} />
              <AiAnalyzeField kind="dislike" items={aiExclusions} setItems={setAiExclusions} analyzeText={analyzeText}
                placeholder="못 먹는 음식을 문장으로 입력" hint={'예) "고수 들어간 음식", "느끼한 건 못 먹어요" — AI가 분석해 제외 항목으로 저장해요.'} />
            </>
          ) : null}
          {prefsTab === 'like' ? (
            <>
              <p className="section-hint">카테고리를 열어 <strong>좋아하는 메뉴</strong>를 골라주세요. 추천에서 우선 노출돼요.</p>
              <MenuAccordion selected={likeMenus} onToggle={(k) => toggle(likeMenus, setLikeMenus, k)} countWord="선택" blocked={dislikeMenus} />
              <AiAnalyzeField kind="like" items={aiLikes} setItems={setAiLikes} analyzeText={analyzeText}
                placeholder="좋아하는 음식을 문장으로 입력" hint={'예) "매콤한 국물 좋아해요", "든든한 고기 요리" — AI가 분석해 취향으로 저장해요.'} />
            </>
          ) : null}
        </div>
        <div className="modal-foot">
          <button type="button" className="button primary full" onClick={() => setPrefsOpen(false)}>완료</button>
        </div>
      </div>
    </div>
  );
}
