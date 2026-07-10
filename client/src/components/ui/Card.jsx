export const Card = ({ className = '', hover = false, glow = false, children, ...props }) => (
  <div
    className={['card', hover ? 'card-hover' : '', glow ? 'card-glow' : '', className].filter(Boolean).join(' ')}
    {...props}
  >
    {children}
  </div>
)

export const CardHeader = ({ className = '', children, ...props }) => (
  <div
    className={className}
    style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}
    {...props}
  >
    {children}
  </div>
)

export const CardTitle = ({ className = '', children, ...props }) => (
  <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.01em', color: 'var(--text)' }} className={className} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ className = '', children, ...props }) => (
  <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginTop: 3 }} className={className} {...props}>
    {children}
  </p>
)

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>{children}</div>
)
