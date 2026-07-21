import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { menuMaster } from '../data/appData';

// 카테고리 전체 선택(키: 'cat') + 개별 메뉴 선택(키: 'cat|menu') 아코디언 (못먹는/좋아하는 공용)
// 카테고리와 세부를 동시에 고를 수 있고, 가중치가 다름(세부가 더 강함).
// blocked: 반대쪽(싫어요↔좋아요)에서 이미 고른 키들 — 여기서는 선택 불가.
export function MenuAccordion({ selected, onToggle, countWord = '선택', blocked = [] }) {
  const [open, setOpen] = useState('한식');
  const isDislike = countWord === '제외';
  const detailHint = isDislike
    ? '카테고리 = 덜 추천 · 개별 메뉴 = 완전 제외'
    : '카테고리 = 선호 · 개별 메뉴 = 특히 선호';
  const blockedLabel = isDislike ? '좋아요에 선택됨' : '싫어요에 선택됨';
  const blockedSet = new Set(blocked);
  return (
    <div className="accordion">
      {Object.entries(menuMaster).map(([cat, items]) => {
        const isOpen = open === cat;
        const catSelected = selected.includes(cat);
        const catBlocked = blockedSet.has(cat);
        const count = items.filter((it) => selected.includes(`${cat}|${it}`)).length;
        return (
          <div className="accordion-item" key={cat}>
            <div className="accordion-head">
              <button
                type="button"
                className="cat-all"
                onClick={() => onToggle(cat)}
                disabled={catBlocked}
                aria-pressed={catSelected}
                aria-label={catBlocked ? `${cat} — ${blockedLabel}` : `${cat} 카테고리 전체 ${countWord}`}
                title={catBlocked ? blockedLabel : undefined}
              >
                <span className={`checkbox ${catSelected ? 'on' : ''} ${catBlocked ? 'blocked' : ''}`}><Check size={13} /></span>
              </button>
              <button type="button" className="accordion-head-main" onClick={() => setOpen(isOpen ? null : cat)}>
                <span className="accordion-title">
                  <strong>{cat}</strong>
                  {catBlocked ? (
                    <em className="count-badge muted-badge">{blockedLabel}</em>
                  ) : catSelected ? (
                    <em className="count-badge">전체 {countWord}</em>
                  ) : count > 0 ? (
                    <em className="count-badge">{count}개 {countWord}</em>
                  ) : null}
                </span>
                <ChevronDown size={18} className={`chevron ${isOpen ? 'up' : ''}`} />
              </button>
            </div>
            {isOpen ? (
              <div className="accordion-body">
                <p className="cat-all-note">
                  {catSelected ? `‘${cat}’ 전체 ${countWord} · ` : ''}{detailHint}
                </p>
                <div className="accordion-chips">
                  {items.map((it) => {
                    const key = `${cat}|${it}`;
                    const active = selected.includes(key);
                    const itemBlocked = blockedSet.has(key);
                    return (
                      <button
                        type="button"
                        key={key}
                        className={`chip ${active ? 'active' : ''} ${itemBlocked ? 'blocked' : ''}`}
                        onClick={() => onToggle(key)}
                        disabled={itemBlocked}
                        title={itemBlocked ? blockedLabel : undefined}
                      >
                        {it}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
