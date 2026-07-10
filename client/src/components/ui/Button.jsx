import { forwardRef } from 'react'

const variantMap = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost:     'btn btn-ghost',
  outline:   'btn btn-outline',
  danger:    'btn btn-danger',
  success:   'btn btn-success',
}

const sizeMap = {
  xs:      'btn-xs',
  sm:      'btn-sm',
  md:      '',
  lg:      'btn-lg',
  xl:      'btn-xl',
  icon:    'btn-icon',
  'icon-sm': 'btn-icon-sm',
  'icon-xs': 'btn-icon-xs',
}

export const Button = forwardRef(({
  className = '',
  variant = 'primary',
  size = 'md',
  disabled,
  isLoading,
  children,
  ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || isLoading}
    className={[variantMap[variant] ?? variantMap.primary, sizeMap[size] ?? '', className].filter(Boolean).join(' ')}
    {...props}
  >
    {isLoading ? (
      <>
        <svg className="anim-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        {children}
      </>
    ) : children}
  </button>
))
Button.displayName = 'Button'
