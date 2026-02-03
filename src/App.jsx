import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

import Login from './pages/Login'
import Mesas from './pages/Mesas'
import Cozinha from './pages/Cozinha'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1. Verifica se já existe alguém logado ao abrir o site
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Fica ouvindo: se alguém fizer login ou logout, atualiza o estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Função de Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <BrowserRouter>
      {/* MENU SÓ APARECE SE TIVER LOGADO (session existe) */}
      {session && (
        <nav style={{ backgroundColor: '#2c3e50', padding: '10px 20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/mesas" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Salão</Link>
          <Link to="/cozinha" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Cozinha</Link>
          <Link to="/produtos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📦 Produtos</Link>
          <Link to="/dashboard" style={{ color: '#f1c40f', textDecoration: 'none', fontWeight: 'bold' }}>💰 Financeiro</Link>
          
          <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #95a5a6', color: '#ccc', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
            Sair ({session.user.email})
          </button>
        </nav>
      )}

      <Routes>
        {/* Rota Protegida: Se não tem sessão, manda pro Login */}
        <Route path="/" element={!session ? <Login /> : <Navigate to="/mesas" />} />
        
        <Route path="/mesas" element={session ? <Mesas /> : <Navigate to="/" />} />
        <Route path="/cozinha" element={session ? <Cozinha /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/produtos" element={session ? <Produtos /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App