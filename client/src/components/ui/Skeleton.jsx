export const Skeleton = ({ className = '', style, ...props }) => (
  <div className={['skeleton', className].filter(Boolean).join(' ')} style={style} {...props} />
)
