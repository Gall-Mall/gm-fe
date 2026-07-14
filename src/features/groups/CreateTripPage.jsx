import { useState } from 'react';
import { Search, Crosshair, Minus, Plus, MapPin, CircleCheck } from 'lucide-react';
import { purposeOptions } from '../../data/appData';
import { LeafletMap } from '../../components/LeafletMap';
import { normDistance, geocodePlace, reverseGeocode } from '../../utils/geo';

export function CreateTripPage({ flow }) {
  const { goToStep, draft, setDraft } = flow;
  const [geoQuery, setGeoQuery] = useState('');
  const [geoStatus, setGeoStatus] = useState('idle');
  const [inviteInput, setInviteInput] = useState('');
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  async function search() {
    const q = geoQuery.trim();
    if (!q || geoStatus === 'loading') return;
    setGeoStatus('loading');
    try {
      const found = await geocodePlace(q);
      if (found) {
        set({ lat: found.lat, lng: found.lng });
        setGeoStatus('idle');
        const addr = await reverseGeocode(found.lat, found.lng).catch(() => null);
        if (addr) set({ destination: addr });
      } else setGeoStatus('error');
    } catch {
      setGeoStatus('error');
    }
  }

  async function onPick(lat, lng) {
    set({ lat, lng });
    const addr = await reverseGeocode(lat, lng).catch(() => null);
    if (addr) set({ destination: addr });
  }

  function addInvite() {
    const v = inviteInput.trim();
    if (!v || draft.invites.includes(v)) { setInviteInput(''); return; }
    set({ invites: [...draft.invites, v] });
    setInviteInput('');
  }

  return (
    <main className="screen page narrow">
      <header className="page-head col">
        <span className="tag">STEP 1 · 그룹 만들기</span>
        <h1>새 여행 그룹 만들기</h1>
        <p className="muted">여행 정보를 채우고 친구들을 초대하면, 취향 입력과 맛집 투표를 바로 시작할 수 있어요.</p>
      </header>

      <section className="card">
        <div className="card-title"><span className="card-icon"><CircleCheck size={15} /></span><h2>기본 정보</h2></div>
        <div className="form-grid">
          <label className="field">
            <span className="field-label">그룹 이름</span>
            <input className="text-input" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="예) 오사카 먹방 원정대" />
          </label>

          <div className="field">
            <span className="field-label">여행지 · 지도에서 위치 선택</span>
            <div className="inline-row">
              <input className="text-input" value={geoQuery} onChange={(e) => setGeoQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); search(); } }}
                placeholder="장소 검색 (예: 선릉역, 강남역)" />
              <button type="button" className="button primary" onClick={search} disabled={geoStatus === 'loading'}>
                <Search size={15} /><span>{geoStatus === 'loading' ? '검색 중' : '검색'}</span>
              </button>
            </div>
            {geoStatus === 'error' ? <p className="error-text">장소를 찾지 못했어요. 다른 이름으로 검색해보세요.</p> : null}
            <LeafletMap center={{ lat: draft.lat, lng: draft.lng }} onPick={onPick} />
            <div className="inline-between">
              <span className="muted-sm">핀을 드래그하거나 지도를 눌러 위치를 조정하세요</span>
              <button type="button" className="chip" onClick={() => set({ lat: 37.5665, lng: 126.978 })}><Crosshair size={13} /> 현재 위치</button>
            </div>
            <input className="text-input" value={draft.destination} onChange={(e) => set({ destination: e.target.value })} placeholder="주소 (지도에서 핀을 찍으면 자동 입력)" />
          </div>

          <div className="field">
            <span className="field-label">여행 날짜</span>
            <div className="seg">
              <button type="button" className={draft.dateMode === 'fixed' ? 'on' : ''} onClick={() => set({ dateMode: 'fixed' })}>날짜 지정</button>
              <button type="button" className={draft.dateMode === 'casual' ? 'on' : ''} onClick={() => set({ dateMode: 'casual' })}>날짜 없이</button>
            </div>
            {draft.dateMode === 'fixed' ? (
              <div className="inline-row wrap">
                <input type="date" className="text-input" value={draft.dateStart} onChange={(e) => set({ dateStart: e.target.value })} />
                <span className="tilde">~</span>
                <input type="date" className="text-input" value={draft.dateEnd} onChange={(e) => set({ dateEnd: e.target.value })} />
              </div>
            ) : (
              <div className="chip-wrap">
                {['오늘', '내일', '이번 주말', '미정'].map((c) => (
                  <button key={c} type="button" className={`chip ${draft.dateCasual === c ? 'active' : ''}`} onClick={() => set({ dateCasual: c })}>{c}</button>
                ))}
              </div>
            )}
          </div>

          <div className="field">
            <span className="field-label">멤버 수 <em className="muted">· 최대 6</em></span>
            <div className="stepper">
              <button type="button" onClick={() => set({ members: Math.max(2, draft.members - 1) })}><Minus size={15} /></button>
              <strong>{draft.members}</strong>
              <button type="button" onClick={() => set({ members: Math.min(6, draft.members + 1) })}><Plus size={15} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-title"><span className="card-icon"><CircleCheck size={15} /></span><h2>여행 목적</h2></div>
        <p className="muted section-sub">추천 알고리즘이 그룹 성향을 잡는 데 참고해요.</p>
        <div className="chip-wrap">
          {purposeOptions.map((p) => (
            <button key={p} type="button" className={`chip ${draft.purpose === p ? 'active' : ''}`} onClick={() => set({ purpose: p })}>{p}</button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-title"><span className="card-icon"><MapPin size={15} /></span><h2>거리 기준</h2></div>
        <p className="muted section-sub">현재 위치에서 이 반경 안의 식당만 추천해요.</p>
        <div className="chip-wrap align-center">
          {[1, 2, 3, 5].map((km) => (
            <button key={km} type="button" className={`chip ${draft.distanceMode === 'preset' && draft.distanceKm === km ? 'active' : ''}`}
              onClick={() => set({ distanceKm: km, distanceMode: 'preset' })}>{km}km</button>
          ))}
          <button type="button" className={`chip ${draft.distanceMode === 'custom' ? 'active' : 'dashed'}`}
            onClick={() => set({ distanceMode: 'custom', distanceText: String(draft.distanceKm) })}>직접 입력</button>
          <span className="km-input">
            <input type="text" inputMode="decimal" disabled={draft.distanceMode !== 'custom'} value={draft.distanceText}
              onChange={(e) => set({ distanceText: e.target.value.replace(/[^0-9.]/g, '') })}
              onBlur={() => { const n = normDistance(draft.distanceText); set({ distanceKm: n, distanceText: String(n) }); }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
              className={`text-input mini ${draft.distanceMode !== 'custom' ? 'locked' : ''}`} aria-label="반경 직접 입력 (0.5 단위, 최대 30km)" />
            <span className="muted-sm">km</span>
          </span>
        </div>
      </section>

      <section className="card">
        <div className="card-title"><span className="card-icon"><Plus size={15} /></span><h2>멤버 초대</h2></div>
        <p className="muted section-sub">이메일이나 닉네임으로 초대하거나, 초대 코드를 공유하세요.</p>
        <div className="inline-row">
          <input className="text-input" value={inviteInput} onChange={(e) => setInviteInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addInvite(); } }}
            placeholder="이메일 또는 닉네임 입력 후 Enter" />
          <button type="button" className="button primary square" onClick={addInvite}><Plus size={17} /></button>
        </div>
        <div className="chip-wrap">
          {draft.invites.map((inv, i) => (
            <span className="ai-chip" key={inv}><span>{inv}</span><button type="button" aria-label="삭제" onClick={() => set({ invites: draft.invites.filter((_, j) => j !== i) })}>×</button></span>
          ))}
        </div>
      </section>

      <div className="page-actions">
        <button type="button" className="button ghost" onClick={() => goToStep('home')}>취소</button>
        <button type="button" className="button primary" onClick={() => goToStep('dashboard')}>그룹 만들고 시작하기</button>
      </div>
    </main>
  );
}
