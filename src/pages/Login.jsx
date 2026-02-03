import React, { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    // AQUI A MÁGICA: O Supabase verifica se o email/senha batem
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    })

    if (error) {
      alert('Erro ao entrar: ' + error.message)
      setLoading(false)
    } else {
      // Se deu certo, o Supabase guarda um "crachá" (token) no navegador
      // e nós mandamos o usuário para as mesas.
      navigate('/mesas')
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2c3e50' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>🔐 R-System Pro</h1>
      <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
        
        <label>Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@restaurante.com"
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          required
        />

        <label>Senha</label>
        <input 
          type="password" 
          value={senha} 
          onChange={e => setSenha(e.target.value)}
          placeholder="Sua senha secreta"
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          required
        />

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Verificando...' : 'ENTRAR'}
        </button>
      </form>
    </div>
  )
}