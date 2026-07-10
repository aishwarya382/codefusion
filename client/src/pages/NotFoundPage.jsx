import { Link } from 'react-router-dom'
import { FiCode, FiArrowLeft } from 'react-icons/fi'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-center mb-8">
        <FiCode size={24} className="text-[var(--color-text)]" />
      </div>
      
      <h1 className="text-8xl font-bold tracking-tighter mb-4 text-[#333]">404</h1>
      <h2 className="text-xl font-semibold mb-2">Page not found</h2>
      <p className="text-[var(--color-muted)] text-sm max-w-sm mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/">
        <Button variant="secondary">
          <FiArrowLeft size={16} className="mr-2" /> Back to Home
        </Button>
      </Link>
    </div>
  )
}
