import { forwardRef } from 'react'

export const Input = forwardRef(({
  className = '',
  error,
  label,
  helperText,
  icon: Icon,
  rightElement,
  size,
  ...props
}, ref) => (
  <div style={{ width: '100%' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {Icon && (
        <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none', display: 'flex' }}>
          <Icon size={15} />
        </div>
      )}
      <input
        ref={ref}
        className={['input', size === 'sm' ? 'input-sm' : '', Icon ? 'pl-9' : '', rightElement ? 'pr-10' : '', error ? 'error' : '', className].filter(Boolean).join(' ')}
        style={{ paddingLeft: Icon ? 36 : undefined, paddingRight: rightElement ? 40 : undefined }}
        {...props}
      />
      {rightElement && (
        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          {rightElement}
        </div>
      )}
    </div>
    {error && (
      <p style={{ marginTop: 5, fontSize: '0.75rem', fontWeight: 500, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {error}
      </p>
    )}
    {helperText && !error && (
      <p style={{ marginTop: 5, fontSize: '0.75rem', color: 'var(--text-4)' }}>{helperText}</p>
    )}
  </div>
))
Input.displayName = 'Input'
