import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from '@/components/layout/Navbar'
import { MapPage } from '@/pages/MapPage'
import { MyReservationsPage } from '@/pages/MyReservationsPage'
import { AdminPage } from '@/pages/AdminPage'
import { useStore } from '@/store'
import { getMe } from '@/api/client'

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function AppInner() {
  const { user, setUser } = useStore()

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        // SSO 미연결 환경에서는 mock user 사용
      })
  }, [setUser])

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">로그인 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/my" element={<MyReservationsPage />} />
          {user.role === 'admin' && <Route path="/admin" element={<AdminPage />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <HashRouter>
        <AppInner />
      </HashRouter>
    </QueryClientProvider>
  )
}
