import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/cfa/HomePage'
import { StudyPage } from './pages/cfa/StudyPage'
import { ReviewPage } from './pages/cfa/ReviewPage'
import { MockExamPage } from './pages/cfa/MockExamPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/study/:topic" element={<StudyPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/mock" element={<MockExamPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
