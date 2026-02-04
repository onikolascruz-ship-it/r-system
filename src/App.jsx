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
import TelaVenda from './pages/TelaVenda'
import TelaConta from './pages/TelaConta'

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Função auxiliar para buscar o cargo
    const buscarRole = async (userId) => {
      if (!userId) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data) setRole(data.role);
    }

    // 1. Verifica sessão atual ao abrir o site
    const iniciarSessao = async () => {
      const { data: { session: sessaoAtual } } = await supabase.auth.getSession()
      setSession(sessaoAtual)
      
      if (sessaoAtual) {
        await buscarRole(sessaoAtual.user.id);
      }
      setLoading(false)
    }

    iniciarSessao()

    // 2. Escuta mudanças (Login ou Logout) em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      
      if (session) {
        // SE ENTROU: Busca o cargo imediatamente
        await buscarRole(session.user.id);
      } else {
        // SE SAIU: Limpa o cargo
        setRole(null);
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setRole(null)
    setSession(null)
  }

  if (loading) return <div style={{color:'white', padding:20}}>Carregando sistema...</div>

  return (
    <BrowserRouter>
      {session && (
        <nav style={{ backgroundColor: '#2c3e50', padding: '10px 20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          {/* MENU DE NAVEGAÇÃO */}
          <Link to="/" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>Inicio</Link>
          <Link to="/mesas" style={{ color: '#bdc3c7', fontWeight: 'normal', fontSize: '14px', textDecoration: 'none' }}>Mapa Mesas</Link>
          <Link to="/cozinha" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>Cozinha</Link>

          {/* ITENS EXCLUSIVOS DE ADMIN */}
          {role === 'admin' && (
            <>
              <Link to="/produtos" style={{ color: '#e74c3c', fontWeight: 'bold', textDecoration: 'none' }}>Produtos</Link>
              <Link to="/dashboard" style={{ color: '#f1c40f', fontWeight: 'bold', textDecoration: 'none' }}>Financeiro</Link>
            </>
          )}
          
          <button 
            onClick={handleLogout} 
            style={{ marginLeft: 'auto', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#95a5a6', border: 'none', borderRadius: '4px', color: 'white' }}
          >
            Sair ({role === 'admin' ? 'Gerente' : 'Garcom'})
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/" element={!session ? <Login /> : <TelaInicial />} />
        
        {/* Rotas protegidas */}
        <Route path="/venda/:id" element={session ? <TelaVenda /> : <Navigate to="/" />} />
        <Route path="/conta/:id" element={session ? <TelaConta /> : <Navigate to="/" />} />
        
        <Route path="/mesas" element={session ? <Mesas /> : <Navigate to="/" />} />
        <Route path="/cozinha" element={session ? <Cozinha /> : <Navigate to="/" />} />
        
        {/* Rotas de Admin */}
        <Route path="/produtos" element={session && role === 'admin' ? <Produtos /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={session && role === 'admin' ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App