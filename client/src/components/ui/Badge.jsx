export const Badge = ({ className = '', variant = 'default', dot, children, ...props }) => {
  const map = {
    default:  'badge badge-default',
    primary:  'badge badge-primary',
    accent:   'badge badge-accent',
    success:  'badge badge-success',
    warning:  'badge badge-warning',
    danger:   'badge badge-danger',
    info:     'badge badge-info',
  }
  return (
    <span className={[map[variant] ?? map.default, className].filter(Boolean).join(' ')} {...props}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />}
      {children}
    </span>
  )
}
