import { Link } from 'react-router-dom'

type Size = 'sm' | 'md' | 'lg'

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-sm',
  md: 'px-6 py-3',
  lg: 'px-8 py-4 text-lg',
}

interface Props {
  size?: Size
  className?: string
  label?: string
}

export function BookCallButton({ size = 'md', className = '', label = 'Send a request' }: Props) {
  return (
    <Link
      to="/book"
      className={`inline-flex items-center gap-2 bg-flame-500 hover:bg-flame-600 text-white font-medium rounded-md shadow-flame-glow hover:shadow-lg transition-all ${sizeStyles[size]} ${className}`}
    >
      {label}
      <span aria-hidden>→</span>
    </Link>
  )
}
