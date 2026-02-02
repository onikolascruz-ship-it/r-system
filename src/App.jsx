import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Mesas from './pages/Mesas'
import Cozinha from './pages/Cozinha'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos' // <--- NOVO

function App() {
  return (
    <BrowserRouter>
      <nav style={{ backgroundColor: '#2c3e50', padding: '10px 20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <Link to="/mesas" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Salão</Link>
        <Link to="/cozinha" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Cozinha</Link>
        <Link to="/produtos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📦 Produtos</Link>
        <Link to="/dashboard" style={{ color: '#f1c40f', textDecoration: 'none', fontWeight: 'bold' }}>💰 Financeiro</Link>
        <Link to="/" style={{ color: '#ccc', textDecoration: 'none', marginLeft: 'auto' }}>Sair</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mesas" element={<Mesas />} />
        <Route path="/cozinha" element={<Cozinha />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/produtos" element={<Produtos />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App