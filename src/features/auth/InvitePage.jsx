import { MapPin, Clock } from 'lucide-react';
import { osakaHero } from '../../data/appData';

export function InvitePage({ flow }) {
  const { gset, members, joinGroup, goToStep } = flow;
  const host = members.find((m) => m.role === 'host') || {};
  const full = members.length >= 6;
  return (
    <div className="screen invite-screen">
      <div className="invite-inner">
        <div className="brand-inline center">
          <span className="brand-badge">갈</span>
          <strong>갈래말래</strong>
        </div>
        <div className="invite-card">
          <div className="invite-hero" style={{ backgroundImage: `url(${osakaHero})` }}>
            <div className="invite-hero-overlay" />
            <span className="invite-hero-text">
              <small>초대장이 도착했어요</small>
              <strong>{gset.name}</strong>
            </span>
          </div>
          <div className="invite-body">
            <p className="invite-lead">
              <strong className="accent">{host.name || '방장'}</strong>님이 <strong>{gset.name}</strong> 그룹에 초대했어요. 함께 오늘 뭐 먹을지 정해봐요.
            </p>
            <div className="invite-facts">
              <div><MapPin size={15} /><span>{gset.location}</span></div>
              <div><Clock size={15} /><span>추천 시간 {gset.recTime}</span></div>
            </div>
            <div className="invite-members">
              <div className="avatar-row">
                {members.slice(0, 5).map((m, i) => (
                  <span className="member-avatar stacked" key={m.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>{m.name.slice(0, 1)}</span>
                ))}
              </div>
              <span className="muted-sm">{members.length}/6명 참여 중</span>
            </div>
            <button type="button" className="button primary full" onClick={joinGroup}>참여하시겠어요?</button>
            {full ? <p className="error-text center">인원이 가득 찼어요 (최대 6명)</p> : null}
            <button type="button" className="link-btn muted" onClick={() => goToStep('login')}>나중에 할게요</button>
          </div>
        </div>
      </div>
    </div>
  );
}
