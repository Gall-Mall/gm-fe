import { Check } from 'lucide-react';
import { fallbackMembers } from '../flow';

export function AvatarStack({ members = fallbackMembers, compact = false }) {
  return (
    <div className={`avatar-stack ${compact ? 'compact' : ''}`} aria-label="여행 멤버">
      {members.slice(0, compact ? 3 : 4).map((member, index) => (
        <span className="member-avatar" key={member.name} title={`${member.name} · ${member.status}`}>
          {member.name.slice(0, 1)}
          {member.status === '완료' ? <Check size={10} /> : null}
          {index === 3 ? null : null}
        </span>
      ))}
      {compact ? <span className="member-avatar more">+2</span> : null}
    </div>
  );
}
