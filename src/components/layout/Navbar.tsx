import { Link, useLocation } from 'react-router-dom'
import { useStore } from '@/store'

export function Navbar() {
  const { user } = useStore()
  const loc = useLocation()

  const nav = [
    { to: '/', label: '좌석 현황' },
    { to: '/my', label: '내 예약' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: '관리자' }] : []),
  ]

  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">좌석 예약 시스템</span>
          <nav className="flex gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  loc.pathname === n.to
                    ? 'bg-white/20 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-200">{user.department}</span>
            <span className="font-medium">{user.name}</span>
            {user.role === 'admin' && (
              <span className="ml-1 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded font-bold">
                ADMIN
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
