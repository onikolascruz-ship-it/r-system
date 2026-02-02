import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Mesas() {
  const [mesaSelecionada, setMesaSelecionada] = useState(null)
  const [listaPedidos, setListaPedidos] = useState([])
  const [mostrandoCardapio, setMostrandoCardapio] = useState(false)
  
  // AGORA OS PRODUTOS VÊM DO BANCO, NÃO SÃO MAIS FIXOS
  const [produtos, setProdutos] = useState([]) 

  // 1. Buscar Pedidos (Mesma lógica de antes)
  const buscarPedidos = async () => {
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .neq('status', 'pago')
    if (data) setListaPedidos(data)
  }

  // 2. BUSCAR PRODUTOS DO BANCO (NOVO!)
  const buscarProdutos = async () => {
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .order('nome') // Ordem alfabética
    
    if (data) setProdutos(data)
  }

  useEffect(() => {
    buscarPedidos()
    buscarProdutos() // <--- Chama a busca de produtos ao carregar
    
    // Realtime dos Pedidos
    const canal = supabase
      .channel('mesas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        buscarPedidos()
      })
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [])

  const adicionarItem = async (produto) => {
    const { error } = await supabase.from('pedidos').insert({
      mesa: mesaSelecionada,
      itens: [produto],
      total: produto.preco,
      status: 'aberto'
    })
    if (!error) {
      setMostrandoCardapio(false)
    }
  }

  const fecharConta = async () => {
    if (!confirm(`Confirmar pagamento da Mesa ${mesaSelecionada}?`)) return
    const { error } = await supabase.from('pedidos').update({ status: 'pago' }).eq('mesa', mesaSelecionada).neq('status', 'pago')
    if (!error) {
      setMesaSelecionada(null)
      alert('Conta fechada com sucesso! 💸')
    }
  }

  const pedidosDaMesaAtual = listaPedidos.filter(item => item.mesa === mesaSelecionada)
  const totalMesa = pedidosDaMesaAtual.reduce((acc, item) => acc + item.total, 0)
  const mesasOcupadas = listaPedidos.map(p => p.mesa)

  return (
    <div style={{ padding: '20px' }}>
      <h1>Salão Principal</h1>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(numero => {
          const estaOcupada = mesasOcupadas.includes(numero)
          return (
            <div key={numero} onClick={() => setMesaSelecionada(numero)}
              style={{ 
                width: '120px', height: '120px', 
                backgroundColor: estaOcupada ? '#ffeba7' : '#d4edda',
                border: estaOcupada ? '2px solid orange' : '2px solid #28a745',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Mesa {numero}</span>
              <span style={{ fontSize: '12px', color: estaOcupada ? 'orange' : 'green', fontWeight: 'bold' }}>
                {estaOcupada ? 'Ocupada' : 'Livre'}
              </span>
            </div>
          )
        })}
      </div>

      {mesaSelecionada && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '25px', borderRadius: '15px',
            width: '350px', maxHeight: '85vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h2 style={{margin:0}}>Mesa {mesaSelecionada}</h2>
              <button onClick={() => { setMesaSelecionada(null); setMostrandoCardapio(false); }} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>

            {!mostrandoCardapio ? (
              <>
                <div style={{ flex: 1, overflowY: 'auto', minHeight: '150px', marginBottom: '15px' }}>
                  {pedidosDaMesaAtual.map((pedido) => (
                    <div key={pedido.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #eee' }}>
                      <div>
                        <span style={{fontWeight: '500'}}>{pedido.itens[0].nome}</span>
                        <div style={{fontSize: '11px', color: pedido.status === 'pronto' ? 'green' : 'orange'}}>
                          {pedido.status === 'pronto' ? '✅ Pronto' : '⏳ Preparando'}
                        </div>
                      </div>
                      <span>R$ {pedido.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                  <span>Total:</span><span>R$ {totalMesa.toFixed(2)}</span>
                </div>
                <button onClick={() => setMostrandoCardapio(true)} style={{ padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', width: '100%', marginBottom: '10px' }}>+ Adicionar Item</button>
                {totalMesa > 0 && <button onClick={fecharConta} style={{ padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', width: '100%' }}>💰 Fechar Conta</button>}
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '15px' }}>Cardápio</h3>
                {/* AQUI A MÁGICA ACONTECE: LISTA DINÂMICA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                  {produtos.length === 0 ? <p>Nenhum produto cadastrado.</p> : produtos.map(produto => (
                    <button key={produto.id} onClick={() => adicionarItem(produto)}
                      style={{ padding: '12px', textAlign: 'left', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{produto.nome}</span>
                      <strong>R$ {produto.preco.toFixed(2)}</strong>
                    </button>
                  ))}
                </div>
                <button onClick={() => setMostrandoCardapio(false)} style={{ marginTop: '15px', padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px' }}>Voltar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}