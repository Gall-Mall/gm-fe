import { PartyPopper, ChevronRight } from 'lucide-react';

const methodLabel = { single: '단일 후보 선택', finalvote: '최종투표', host: '방장 선택' };

export function MenuConfirmedPage({ flow }) {
  const { decidedMenu, decisionMethod, isHost, goToStep } = flow;
  const m = decidedMenu;

  return (
    <main className="screen page narrow">
      <header className="page-head col center-head">
        <span className="tag"><PartyPopper size={14} /> 메뉴 확정</span>
        <h1>오늘의 메뉴가 정해졌어요</h1>
      </header>

      <section className="card confirmed-card">
        <div className="confirmed-emoji" aria-hidden="true">{m?.emoji || '🍽️'}</div>
        <h2 className="confirmed-name">{m?.name || '메뉴'}</h2>
        {m?.cat ? <p className="muted">{m.cat}</p> : null}
        {decisionMethod ? <span className="pill soft">{methodLabel[decisionMethod] || '결정 완료'}</span> : null}
      </section>

      {isHost ? (
        <button type="button" className="button primary full" onClick={() => goToStep('restsearch')}>
          이 메뉴로 식당 찾기<ChevronRight size={17} />
        </button>
      ) : (
        <p className="notice-inline center">방장이 근처 식당을 찾고 있어요</p>
      )}
    </main>
  );
}
