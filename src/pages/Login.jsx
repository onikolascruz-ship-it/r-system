import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate() // O "piloto" da navegação

  const handleLogin = () => {
    // Aqui depois colocaremos a validação de senha real
    navigate('/mesas') 
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h2>Acesso ao Sistema</h2>
      <input type="text" placeholder="Usuário" style={{ margin: '10px', padding: '8px' }} />
      <input type="password" placeholder="Senha" style={{ margin: '10px', padding: '8px' }} />
      
      <button 
        onClick={handleLogin}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none' }}
      >
        ENTRAR
      </button>
    </div>
  )
}