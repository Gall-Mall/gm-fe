import { useState } from 'react';
import { Play, ClipboardList, Settings, Bell, Copy } from 'lucide-react';
import { suggestKeywords } from '../../data/appData';

export function DashboardPage({ flow }) {
  const {
    goToStep, members, isHost, gset,
    voteLimitMin, setVoteLimitMin, startVote,
    voteKeywords, addVoteKeyword, removeVoteKeyword,
    voteStartStatus, voteStartError,
    copied, handleCopy,
  } = flow;
  const [kw, setKw] = useState('');
  const limitLabel = voteLimitMin >= 60 ? `${voteLimitMin / 60}시간` : `${voteLimitMin}분`;
  const voteStarting = voteStartStatus === 'creating' || voteStartStatus === 'connecting';
  const voteStartLabel = voteStartStatus === 'creating'
    ? '투표방 만드는 중...'
    : voteStartStatus === 'connecting'
      ? '추천 메뉴 불러오는 중...'
      : `투표 시작하기 (${limitLabel})`;

  return (
    <main className="screen page narrow">
      <header className="page-head col">
        <span className="tag">{gset.name}</span>
        <h1>모임 준비 현황</h1>
        <p className="muted">{gset.location} · 취향 입력을 모으고 투표를 시작해요.</p>
      </header>

      <section className="card">
        <div className="inline-between">
          <h2>멤버 취향 현황</h2>
          <button type="button" className="chip" onClick={handleCopy}><Copy size={13} /> {copied === 'success' ? '복사됨' : '초대 링크'}</button>
        </div>
        <div className="member-lines">
          {members.map((m) => (
            <div className="member-line" key={m.id}>
              <span className="member-avatar">{m.name.slice(0, 1)}</span>
              <strong>{m.name}</strong>
              <em className="muted-sm">{m.role === 'host' ? '방장' : '멤버'}</em>
            </div>
          ))}
        </div>

        {isHost ? (
          <>
            <div className="host-panel">
              <div className="host-panel-head"><span className="host-icon"><Play size={12} /></span><strong>방장 · 투표 시작</strong></div>
              <p className="muted-sm indent">제한시간을 정하고 투표를 시작하면 그룹원에게 카카오톡 알림이 발송돼요.</p>
              <span className="field-label accent">투표 제한시간</span>
              <div className="chip-wrap">
                {[30, 60, 120, 180].map((min) => (
                  <button key={min} type="button" className={`chip ${voteLimitMin === min ? 'active' : ''}`} onClick={() => setVoteLimitMin(min)}>
                    {min >= 60 ? `${min / 60}시간` : `${min}분`}
                  </button>
                ))}
              </div>
              <span className="field-label accent">오늘의 느낌 키워드 <em className="muted">· 방장이 방향을 정해요</em></span>
              <p className="muted-sm">예) 든든한, 깔끔한, 매콤한 — 추천 메뉴가 이 느낌 위주로 구성돼요.</p>
              <div className="inline-row">
                <input className="text-input" value={kw} onChange={(e) => setKw(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addVoteKeyword(kw); setKw(''); } }}
                  placeholder="키워드 입력 후 Enter" />
                <button type="button" className="button primary" onClick={() => { addVoteKeyword(kw); setKw(''); }}>추가</button>
              </div>
              <div className="chip-wrap">
                {suggestKeywords.filter((k) => !voteKeywords.includes(k)).map((k) => (
                  <button key={k} type="button" className="chip dashed" onClick={() => addVoteKeyword(k)}>+ {k}</button>
                ))}
              </div>
              {voteKeywords.length > 0 ? (
                <div className="chip-wrap">
                  {voteKeywords.map((k, i) => (
                    <span className="kw-chip" key={k}>{k}<button type="button" aria-label="삭제" onClick={() => removeVoteKeyword(i)}>×</button></span>
                  ))}
                </div>
              ) : null}
              {voteStartError ? <p className="muted-sm" role="alert">{voteStartError}</p> : null}
              <button type="button" className="button primary full" onClick={startVote} disabled={voteStarting}>
                <Play size={16} /><span>{voteStartLabel}</span>
              </button>
            </div>
            <div className="inline-row wrap gap">
              <button type="button" className="button ghost" onClick={() => goToStep('archive')}><ClipboardList size={16} /><span>지난 식사 모아보기</span></button>
              <button type="button" className="button ghost" onClick={() => goToStep('groupsettings')}><Settings size={16} /><span>그룹 설정</span></button>
            </div>
          </>
        ) : (
          <>
            <div className="notice"><span className="notice-icon"><Bell size={17} /></span><p>방장이 투표를 시작하면 카카오톡 알림으로 알려드려요.</p></div>
            <div className="inline-row wrap gap">
              <button type="button" className="button ghost" onClick={() => goToStep('archive')}>지난 식사 모아보기</button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
