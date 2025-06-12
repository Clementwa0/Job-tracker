import './App.css'
import { Routes, Route } from 'react-router-dom'
import Homepage from './components/HomePage/Homepage'
import { Login, Register } from './components'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App