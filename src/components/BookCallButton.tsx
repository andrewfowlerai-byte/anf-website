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
      // The one button shape on the site (2026-11-23 redesign): a flat flame rectangle with ink text. No glow.
      className={`inline-flex items-center justify-center bg-flame-500 hover:bg-flame-400 active:translate-y-px text-midnight-950 font-semibold transition-colors ${sizeStyles[size]} ${className}`}
    >
      {label}
    </Link>
  )
}
