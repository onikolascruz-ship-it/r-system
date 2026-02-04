import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { supabase } from './supabase'

// --- SEUS COMPONENTES ---
import Login from './pages/Login'
import Mesas from './pages/Mesas'
import Cozinha from './pages/Cozinha'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import TelaInicial from './pages/TelaInicial'
import TelaVenda from './pages/TelaVenda' // <--- FALTAVA ISSO AQUI!
import TelaConta from './pages/TelaConta';

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const buscarDados = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        setRole(data?.role)
      }
      setLoading(false)
    }

    buscarDados()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) setRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setRole(null)
  }

  if (loading) return <div style={{color:'white', padding:20}}>Carregando sistema...</div>

  return (
    <BrowserRouter>
      {session && (
        <nav style={{ backgroundColor: '#2c3e50', padding: '10px 20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          <Link to="/" style={{ color: 'white', fontWeight: 'bold' }}>Início</Link>
          <Link to="/mesas" style={{ color: '#bdc3c7', fontWeight: 'normal', fontSize: '14px' }}>Mapa Mesas</Link>
          <Link to="/cozinha" style={{ color: 'white', fontWeight: 'bold' }}>Cozinha</Link>

          {role === 'admin' && (
            <>
              <Link to="/produtos" style={{ color: '#e74c3c', fontWeight: 'bold' }}>📦 Produtos</Link>
              <Link to="/dashboard" style={{ color: '#f1c40f', fontWeight: 'bold' }}>💰 Financeiro</Link>
            </>
          )}
          
          <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
            Sair ({role === 'admin' ? 'Gerente' : 'Garçom'})
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/" element={!session ? <Login /> : <TelaInicial />} />

        {/* --- CORREÇÃO FEITA AQUI --- */}
        {/* Havia uma linha duplicada aqui apontando para <Mesas>. Foi removida. */}
        <Route path="/venda/:id" element={session ? <TelaVenda /> : <Navigate to="/" />} />

        <Route path="/mesas" element={session ? <Mesas /> : <Navigate to="/" />} />
        <Route path="/cozinha" element={session ? <Cozinha /> : <Navigate to="/" />} />
        <Route path="/conta/:id" element={session ? <TelaConta /> : <Navigate to="/" />} />
        <Route path="/produtos" element={session && role === 'admin' ? <Produtos /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={session && role === 'admin' ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App