import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Cozinha() {
  const [pedidos, setPedidos] = useState([])

  // Função que busca os dados
  const buscarPedidos = async () => {
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .eq('status', 'aberto')
      .order('id', { ascending: true })

    if (data) {
      setPedidos(data)
    }
  }

  useEffect(() => {
    // 1. Busca os pedidos assim que abre a tela
    buscarPedidos()

    // 2. ATIVANDO O REALTIME ⚡
    // Aqui criamos um "canal" de escuta
    const canal = supabase
      .channel('cozinha-realtime')
      .on(
        'postgres_changes', // Tipo do evento: Mudança no banco
        { event: '*', schema: 'public', table: 'pedidos' }, // Onde? Tabela pedidos
        () => {
          // O que fazer quando mudar? 
          // Simples: busca os pedidos de novo para atualizar a tela!
          buscarPedidos()
        }
      )
      .subscribe()

    // 3. Desliga a antena se o cozinheiro fechar a aba (para não travar o PC)
    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  const concluirPedido = async (id) => {
    await supabase.from('pedidos').update({ status: 'pronto' }).eq('id', id)
    // Não precisa chamar buscarPedidos() aqui, porque o Realtime vai perceber a mudança
    // e chamar sozinho!
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#2c3e50', minHeight: '100vh', color: 'white', fontFamily: 'Arial' }}>
      <h1>👨‍🍳 Monitor da Cozinha (Ao Vivo 🟢)</h1>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
        {pedidos.length === 0 ? (
          <p style={{ opacity: 0.6 }}>Aguardando pedidos...</p>
        ) : (
          pedidos.map(pedido => (
            <div key={pedido.id} style={{ 
              backgroundColor: '#f1c40f', color: '#2c3e50',
              padding: '15px', borderRadius: '10px', width: '220px',
              border: '4px solid #f39c12', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ margin: '0 0 10px 0' }}>Mesa {pedido.mesa}</h2>
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px' }}>
                <strong style={{ fontSize: '18px' }}>{pedido.itens[0].nome}</strong>
              </div>
              
              <button 
                onClick={() => concluirPedido(pedido.id)}
                style={{ 
                  width: '100%', padding: '12px', 
                  backgroundColor: '#27ae60', color: 'white', 
                  border: 'none', borderRadius: '5px', cursor: 'pointer', 
                  fontWeight: 'bold', fontSize: '16px'
                }}
              >
                PRONTO ✅
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}