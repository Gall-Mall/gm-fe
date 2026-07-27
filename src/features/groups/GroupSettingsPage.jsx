import { ArrowLeft, Users, MapPin } from 'lucide-react';
import { normDistance } from '../../utils/geo';

export function GroupSettingsPage({ flow }) {
  const {
    goToStep, gset, setGset, members, isHost, delegateHost, kickMember,
    saveGroupSettings, deleteActiveGroup, groupDeleteStatus, operationError,
  } = flow;
  const set = (patch) => setGset((g) => ({ ...g, ...patch }));
  const deleting = groupDeleteStatus === 'deleting';

  function confirmDeleteGroup() {
    if (window.confirm('그룹을 삭제하면 되돌릴 수 없습니다. 정말 삭제할까요?')) {
      deleteActiveGroup();
    }
  }

  return (
    <main className="screen page narrow">
      <button type="button" className="back-btn" onClick={() => goToStep('dashboard')}><ArrowLeft size={16} />대시보드</button>
      <header className="page-head settings-page-head">
        <div className="settings-page-title">
          <span className="tag">방장 전용</span>
          <h1>그룹 설정</h1>
          <p className="muted">그룹 정보와 멤버를 관리할 수 있어요.</p>
        </div>
        {isHost ? (
          <button type="button" className="button danger" onClick={confirmDeleteGroup} disabled={deleting}>
            {deleting ? '삭제 중...' : '그룹 삭제'}
          </button>
        ) : null}
      </header>

      <section className="card">
        <h2>그룹 정보</h2>
        <div className="form-grid">
          <label className="field"><span className="field-label">그룹 이름</span><input className="text-input" value={gset.name} onChange={(e) => set({ name: e.target.value })} /></label>
          <label className="field"><span className="field-label">위치</span><input className="text-input" value={gset.location} onChange={(e) => set({ location: e.target.value })} /></label>
          <label className="field"><span className="field-label">추천 받을 시간</span><input type="time" className="text-input" value={gset.recTime} onChange={(e) => set({ recTime: e.target.value })} /></label>
          <div className="field">
            <span className="field-label">거리 기준 (반경 {gset.distanceKm}km)</span>
            <div className="chip-wrap align-center">
              {[1, 2, 3, 5].map((km) => (
                <button key={km} type="button" className={`chip ${gset.distanceMode === 'preset' && gset.distanceKm === km ? 'active' : ''}`} onClick={() => set({ distanceKm: km, distanceMode: 'preset' })}>{km}km</button>
              ))}
              <button type="button" className={`chip ${gset.distanceMode === 'custom' ? 'active' : 'dashed'}`} onClick={() => set({ distanceMode: 'custom', distanceText: String(gset.distanceKm) })}>직접 입력</button>
              <span className="km-input">
                <input type="text" inputMode="decimal" disabled={gset.distanceMode !== 'custom'} value={gset.distanceText}
                  onChange={(e) => set({ distanceText: e.target.value.replace(/[^0-9.]/g, '') })}
                  onBlur={() => { const n = normDistance(gset.distanceText); set({ distanceKm: n, distanceText: String(n) }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  className={`text-input mini ${gset.distanceMode !== 'custom' ? 'locked' : ''}`} aria-label="반경 직접 입력 (0.5 단위, 최대 30km)" />
                <span className="muted-sm">km</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="inline-between"><h2><Users size={16} /> 멤버 관리</h2><span className="muted-sm">{members.length}/6명</span></div>
        <div className="member-manage">
          {members.map((m) => (
            <div className="member-manage-row" key={m.id}>
              <span className="member-avatar">{m.name.slice(0, 1)}</span>
              <div className="member-meta">
                <div className="member-name"><strong>{m.name}</strong><em className={`badge ${m.role === 'host' ? '' : 'soft'}`}>{m.role === 'host' ? '방장' : '멤버'}</em></div>
                <small className="muted-sm">{m.email}</small>
              </div>
              {isHost && m.role !== 'host' ? (
                <div className="inline-row">
                  <button type="button" className="chip" onClick={() => delegateHost(m.id)}>방장 위임</button>
                  <button type="button" className="chip danger" onClick={() => kickMember(m.id)}>내보내기</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="page-actions">
        <button type="button" className="button primary full" onClick={saveGroupSettings}>변경사항 저장</button>
      </div>
      {operationError ? <p className="error-text center" role="alert">{operationError}</p> : null}
    </main>
  );
}
