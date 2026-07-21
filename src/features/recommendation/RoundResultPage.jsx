import { useEffect, useState } from 'react';
import { Check, RefreshCw, Loader, AlertTriangle, Trophy } from 'lucide-react';

// 후보 메뉴 카드 (선택형 / 읽기전용)
function CandidateCard({ m, selected, readOnly, onSelect, big }) {
  const cls = `candidate-card ${selected ? 'selected' : ''} ${readOnly ? 'readonly' : ''} ${big ? 'big' : ''}`;
  const inner = (
    <>
      <div className="candidate-emoji" aria-hidden="true">{m.emoji || '🍽️'}</div>
      <div className="candidate-info">
        <div className="final-name"><strong>{m.name}</strong>{selected ? <span className="candidate-check"><Check size={15} /></span> : null}</div>
        <small className="muted-sm">{m.cat}</small>
        <div className="tally">
          <span className="tally-like">갈래 {m.v.like}</span>
          <span className="tally-maybe">애매하긴해 {m.v.maybe}</span>
          <span className="tally-dislike">말래 {m.v.dislike}</span>
        </div>
      </div>
    </>
  );
  if (readOnly) return <div className={cls}>{inner}</div>;
  return <button type="button" className={cls} aria-pressed={selected} onClick={onSelect}>{inner}</button>;
}

function WaitingBox({ text }) {
  return <div className="waiting-box"><span className="waiting-spinner" aria-hidden="true" /><span>{text}</span></div>;
}

export function RoundResultPage({ flow }) {
  const {
    isHost, candidateCount, candidateMenus, candidateIds, roundSummary, setRoundCandidates,
    decisionVote, closeDecision, confirmMenu, reRecommend, recommending,
    myDecisionChoice, decisionDoneCount, decisionTotal, decisionClosed, decisionAllDone, decisionTally, decisionOutcome,
    selectedFinalMenuId, setSelectedFinalMenuId, roundNumber,
  } = flow;

  const [initDone, setInitDone] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 최초 진입 시 mock 판정값으로 후보 초기화(후보 유지 수, 최대 3)
  useEffect(() => {
    if (!initDone) {
      setRoundCandidates(Math.min(3, roundSummary.kept));
      setInitDone(true);
    }
  }, [initDone, roundSummary.kept, setRoundCandidates]);

  // 전원 완료 시 자동 마감(1.2초 유예 — 그 전엔 선택 변경 가능, 변경 시 타이머 리셋)
  useEffect(() => {
    if ((candidateCount === 1 || candidateCount === 2) && decisionAllDone && !decisionClosed) {
      const t = window.setTimeout(() => closeDecision(), 1200);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateCount, decisionAllDone, decisionClosed, myDecisionChoice]);

  const c0 = candidateMenus[0];
  const c1 = candidateMenus[1];
  const hostSelected = candidateMenus.find((m) => m.id === selectedFinalMenuId) || null;

  return (
    <main className="screen page narrow">
      <header className="page-head col">
        <span className="tag">{roundNumber}차 라운드 결과</span>
        <h1>
          {candidateCount === 0 && '아직 적합한 메뉴를 찾지 못했어요'}
          {candidateCount === 1 && '후보가 하나 나왔어요'}
          {candidateCount === 2 && '두 메뉴 중 하나를 골라주세요'}
          {candidateCount === 3 && (isHost ? '최종 후보 3개가 모였어요' : '최종 후보 3개가 모였어요')}
        </h1>
        <p className="muted">
          {candidateCount === 0 && '새로운 메뉴를 다시 추천받아 볼까요?'}
          {candidateCount === 1 && '이 메뉴로 갈까요, 다시 추천받을까요?'}
          {candidateCount === 2 && '최다 득표 메뉴가 오늘의 메뉴로 정해져요.'}
          {candidateCount === 3 && (isHost ? '오늘의 메뉴를 하나 선택해 주세요.' : '방장이 최종 메뉴를 고르는 중이에요.')}
        </p>
      </header>

      <div className="round-summary">
        <div><em className="accent">{roundSummary.confirmed}</em><span className="muted-sm">확정</span></div>
        <div><em className="accent">{roundSummary.kept}</em><span className="muted-sm">후보 유지</span></div>
        <div><em className="accent">{roundSummary.excluded}</em><span className="muted-sm">제외</span></div>
        <div><em className="accent">{candidateCount}/3</em><span className="muted-sm">현재 후보</span></div>
      </div>

      {/* 후보 0개 */}
      {candidateCount === 0 ? (
        <section className="card decide-card">
          {recommending ? (
            <div className="loading-box"><Loader size={26} className="spin" /><p>새로운 메뉴를 추천받는 중이에요…</p></div>
          ) : isHost ? (
            <button type="button" className="button primary full" onClick={reRecommend}><RefreshCw size={16} /><span>새 메뉴 추천받기</span></button>
          ) : (
            <WaitingBox text="방장이 새 메뉴를 준비하고 있어요" />
          )}
        </section>
      ) : null}

      {/* 후보 1개 */}
      {candidateCount === 1 && c0 ? (
        <section className="card decide-card">
          <CandidateCard m={c0} big />
          {recommending ? (
            <div className="loading-box"><Loader size={26} className="spin" /><p>새로운 메뉴를 추천받는 중이에요…</p></div>
          ) : !decisionClosed ? (
            <>
              <div className="decide-actions two">
                <button type="button" className={`decide-btn ${myDecisionChoice === 'go' ? 'on go' : ''}`} onClick={() => decisionVote('go')}>이 메뉴로 갈래</button>
                <button type="button" className={`decide-btn ${myDecisionChoice === 'again' ? 'on again' : ''}`} onClick={() => decisionVote('again')}>다시 추천받기</button>
              </div>
              <p className="muted-sm center">{decisionAllDone ? '전원 완료 · 곧 마감돼요' : `${decisionDoneCount}/${decisionTotal}명 선택 완료 · 마감 전 변경할 수 있어요`}</p>
              {isHost && decisionDoneCount >= 1 ? (
                <button type="button" className="button ghost full" onClick={closeDecision}>현재 결과로 마감하기 (방장)</button>
              ) : null}
            </>
          ) : (
            <DecisionResult
              outcome={decisionOutcome}
              tally={decisionTally}
              labels={{ go: '이 메뉴로 갈래', again: '다시 추천받기' }}
              isHost={isHost}
              onConfirm={() => confirmMenu(c0.id, 'single')}
              onAgain={reRecommend}
              tieButtons={[
                { label: '이 메뉴로 확정', onClick: () => confirmMenu(c0.id, 'single') },
                { label: '다시 추천받기', onClick: reRecommend },
              ]}
            />
          )}
        </section>
      ) : null}

      {/* 후보 2개 */}
      {candidateCount === 2 && c0 && c1 ? (
        <section className="card decide-card">
          <div className="candidate-two">
            <CandidateCard m={c0} selected={myDecisionChoice === c0.id} onSelect={() => decisionVote(c0.id)} readOnly={decisionClosed} />
            <CandidateCard m={c1} selected={myDecisionChoice === c1.id} onSelect={() => decisionVote(c1.id)} readOnly={decisionClosed} />
          </div>
          {!decisionClosed ? (
            <>
              <p className="muted-sm center">{decisionAllDone ? '전원 완료 · 곧 마감돼요' : `${decisionDoneCount}/${decisionTotal}명 투표 완료 · 마감 전 변경할 수 있어요`}</p>
              {isHost && decisionDoneCount >= 1 ? (
                <button type="button" className="button ghost full" onClick={closeDecision}>현재 결과로 마감하기 (방장)</button>
              ) : null}
            </>
          ) : decisionOutcome?.type === 'confirm' ? (
            <div className="decide-result">
              <p className="notice-inline"><Trophy size={15} /> 최다 득표 메뉴로 확정됐어요</p>
              <button type="button" className="button primary full" onClick={() => confirmMenu(decisionOutcome.menuId, 'finalvote')}>확정 결과 보기</button>
            </div>
          ) : (
            <div className="decide-result">
              <div className="alert-warn"><span className="alert-icon"><AlertTriangle size={18} /></span><div><strong>동점이에요</strong><small>{isHost ? '방장이 두 후보 중 하나를 선택해주세요.' : '방장이 최종 메뉴를 정하는 중이에요.'}</small></div></div>
              {isHost ? (
                <div className="decide-actions two">
                  <button type="button" className="decide-btn" onClick={() => confirmMenu(c0.id, 'finalvote')}>{c0.name}(으)로</button>
                  <button type="button" className="decide-btn" onClick={() => confirmMenu(c1.id, 'finalvote')}>{c1.name}(으)로</button>
                </div>
              ) : (
                <WaitingBox text="방장이 최종 메뉴를 선택하고 있어요" />
              )}
            </div>
          )}
        </section>
      ) : null}

      {/* 후보 3개 — 방장 단일 선택 (멤버 재투표 없음) */}
      {candidateCount === 3 ? (
        <section className="card decide-card">
          {isHost ? (
            <>
              <div className="candidate-three">
                {candidateMenus.map((m) => (
                  <CandidateCard key={m.id} m={m} selected={selectedFinalMenuId === m.id} onSelect={() => setSelectedFinalMenuId(m.id)} />
                ))}
              </div>
              <button type="button" className="button primary full" disabled={!selectedFinalMenuId} onClick={() => setConfirmOpen(true)}>
                {hostSelected ? `${hostSelected.name}으로 결정하기` : '메뉴를 선택해주세요'}
              </button>
            </>
          ) : (
            <>
              <div className="candidate-three">
                {candidateMenus.map((m) => (
                  <CandidateCard key={m.id} m={m} readOnly />
                ))}
              </div>
              <WaitingBox text="방장이 최종 메뉴를 선택하고 있어요" />
            </>
          )}
        </section>
      ) : null}

      {isHost && !recommending && (candidateCount === 2 || candidateCount === 3) ? (
        <button type="button" className="reroll-btn" onClick={reRecommend}>
          <RefreshCw size={14} /> 마음에 드는 후보가 없어요 · 새 메뉴로 다시 투표
        </button>
      ) : null}

      {confirmOpen && hostSelected ? (
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)}>
          <div className="modal-card confirm-panel" onClick={(e) => e.stopPropagation()}>
            <h2>{hostSelected.name}으로 최종 결정할까요?</h2>
            <p className="muted">결정하면 이 메뉴로 근처 식당 찾기로 넘어가요.</p>
            <div className="confirm-actions">
              <button type="button" className="button ghost" onClick={() => setConfirmOpen(false)}>취소</button>
              <button type="button" className="button primary" onClick={() => { setConfirmOpen(false); confirmMenu(hostSelected.id, 'host'); }}>결정하기</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

// 후보 1개 마감 결과
function DecisionResult({ outcome, isHost, onConfirm, onAgain, tieButtons }) {
  if (!outcome) return null;
  if (outcome.type === 'confirm') {
    return (
      <div className="decide-result">
        <p className="notice-inline"><Trophy size={15} /> 이 메뉴로 가기로 했어요</p>
        <button type="button" className="button primary full" onClick={onConfirm}>확정 결과 보기</button>
      </div>
    );
  }
  if (outcome.type === 'again') {
    return (
      <div className="decide-result">
        <p className="notice-inline"><RefreshCw size={15} /> 다시 추천받기로 했어요</p>
        {isHost ? (
          <button type="button" className="button primary full" onClick={onAgain}><RefreshCw size={16} /><span>새 메뉴 추천받기</span></button>
        ) : (
          <WaitingBox text="방장이 새 메뉴를 준비하고 있어요" />
        )}
      </div>
    );
  }
  // tie
  return (
    <div className="decide-result">
      <div className="alert-warn"><span className="alert-icon"><AlertTriangle size={18} /></span><div><strong>동점이에요</strong><small>{isHost ? '방장이 결정해주세요.' : '방장이 결정하는 중이에요.'}</small></div></div>
      {isHost ? (
        <div className="decide-actions two">
          {tieButtons.map((b) => <button key={b.label} type="button" className="decide-btn" onClick={b.onClick}>{b.label}</button>)}
        </div>
      ) : (
        <WaitingBox text="방장이 최종 메뉴를 선택하고 있어요" />
      )}
    </div>
  );
}
