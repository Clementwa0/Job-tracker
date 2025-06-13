import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Homepage from './components/HomePage/Homepage'
import { Calendar, Profile, Dashboard, Jobs, Layout, Login, Register, AddJob } from './components'
import { ThemeProvider } from '@/components/theme-provider'

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="add-job" element={<AddJob />} />
          <Route path="/Profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
   </ThemeProvider>
  )
}

export default App
