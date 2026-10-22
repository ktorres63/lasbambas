import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import SiteLayout from './layouts/SiteLayout'
import HomePage from './pages/HomePage'
import JobVacanciesPage from './pages/JobVacanciesPage'
import TalentTeamPage from './pages/TalentTeamPage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/es" element={<HomePage />} />
          <Route path="/en" element={<PlaceholderPage />} />
          <Route
            path="/trabaja-con-nosotros/vacantes-de-trabajo"
            element={<JobVacanciesPage />}
          />
          <Route
            path="/trabaja-con-nosotros/recursos-humanos"
            element={<TalentTeamPage teamId="recursos-humanos" />}
          />
          <Route
            path="/trabaja-con-nosotros/ingenieros-a-cargo-de-la-postulacion"
            element={<TalentTeamPage teamId="ingenieros-postulacion" />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
