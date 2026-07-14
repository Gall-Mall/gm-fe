export function Button({ children, variant = 'primary', icon: Icon, iconRight: IconRight, onClick, type = 'button', disabled = false, className = '', full = false }) {
  const cls = ['button', variant, full ? 'full' : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} disabled={disabled} onClick={onClick} type={type}>
      {Icon ? <Icon size={17} aria-hidden="true" /> : null}
      <span>{children}</span>
      {IconRight ? <IconRight size={17} aria-hidden="true" /> : null}
    </button>
  );
}

export function Chip({ children, active = false, dashed = false, onClick, size = 'md' }) {
  const cls = ['chip', active ? 'active' : '', dashed ? 'dashed' : '', size === 'sm' ? 'chip-sm' : ''].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
