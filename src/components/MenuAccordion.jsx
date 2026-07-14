import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { menuMaster } from '../data/appData';

// 카테고리별 개별 메뉴 선택 아코디언 (못먹는/좋아하는 공용)
export function MenuAccordion({ selected, onToggle, countWord = '선택' }) {
  const [open, setOpen] = useState('한식');
  return (
    <div className="accordion">
      {Object.entries(menuMaster).map(([cat, items]) => {
        const isOpen = open === cat;
        const count = items.filter((it) => selected.includes(`${cat}|${it}`)).length;
        return (
          <div className="accordion-item" key={cat}>
            <button type="button" className="accordion-head" onClick={() => setOpen(isOpen ? null : cat)}>
              <span className="accordion-title">
                <strong>{cat}</strong>
                {count > 0 ? <em className="count-badge">{count}개 {countWord}</em> : null}
              </span>
              <ChevronDown size={18} className={`chevron ${isOpen ? 'up' : ''}`} />
            </button>
            {isOpen ? (
              <div className="accordion-body">
                {items.map((it) => {
                  const key = `${cat}|${it}`;
                  const active = selected.includes(key);
                  return (
                    <button
                      type="button"
                      key={key}
                      className={`chip ${active ? 'active' : ''}`}
                      onClick={() => onToggle(key)}
                    >
                      {it}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
