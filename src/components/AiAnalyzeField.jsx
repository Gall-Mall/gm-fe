import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

// 문장 입력 → AI 분석 → 추출 칩. kind: 'allergy' | 'dislike' | 'like'
export function AiAnalyzeField({ kind, placeholder, hint, items, setItems, analyzeText, tone = 'amber' }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');

  async function run() {
    const t = text.trim();
    if (!t || status === 'loading') return;
    setStatus('loading');
    try {
      const found = await analyzeText(kind, t);
      const existing = new Set(items.map((x) => x.name));
      setItems([...items, ...found.filter((f) => !existing.has(f.name))]);
      setStatus('idle');
      setText('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="ai-field">
      <span className="ai-field-label">목록에 없나요? 직접 알려주세요</span>
      <p className="ai-field-hint">{hint}</p>
      <div className="ai-field-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              run();
            }
          }}
          placeholder={placeholder}
          className="text-input"
        />
        <button type="button" className="button primary" onClick={run} disabled={status === 'loading'}>
          <Sparkles size={15} />
          <span>{status === 'loading' ? '분석 중…' : 'AI 분석'}</span>
        </button>
      </div>
      {status === 'error' ? <p className="error-text">분석에 실패했어요. 잠시 후 다시 시도해주세요.</p> : null}
      {kind === 'allergy' ? (
        <p className="ai-field-caution">⚠ 표준 22종 외 알레르기 성분은 메뉴 정보에 따라 필터가 100% 보장되지 않을 수 있어요. 주문 시 성분을 다시 한 번 확인해주세요.</p>
      ) : null}
      {items.length > 0 ? (
        <div className={`ai-chips ${tone}`}>
          {items.map((it, i) => (
            <span className="ai-chip" key={`${it.name}-${i}`}>
              {it.kind ? <em className="ai-chip-kind">{it.kind}</em> : null}
              <span>{it.name}</span>
              <button type="button" aria-label="삭제" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
