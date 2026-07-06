export function Button({
  children,
  variant = 'primary',
  icon: Icon,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) {
  return (
    <button className={`button ${variant} ${className}`.trim()} disabled={disabled} onClick={onClick} type={type}>
      {Icon ? <Icon size={17} aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}
