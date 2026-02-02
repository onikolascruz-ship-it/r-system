import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Mesas() {
  const [mesaSelecionada, setMesaSelecionada] = useState(null)
  const [listaPedidos, setListaPedidos] = useState([])
  const [mostrandoCardapio, setMostrandoCardapio] = useState(false)

  const produtos = [
    { id: 1, nome: 'Coca-Cola 350ml', preco: 6.50 },
    { id: 2, nome: 'Heineken Long Neck', preco: 12.00 },
    { id: 3, nome: 'Água s/ Gás', preco: 4.00 },
    { id: 4, nome: 'X-Bacon Artesanal', preco: 28.50 },
    { id: 5, nome: 'Porção Fritas', preco: 18.00 },
  ]

  // BUSCAR (Regra: Tudo que NÃO foi pago conta como mesa ocupada)
  const buscarPedidos = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .neq('status', 'pago') // Traz tudo (aberto ou pronto), menos o pago.

    if (error) {
      console.error('Erro ao buscar:', error)
    } else {
      setListaPedidos(data)
    }
  }

  // ATIVANDO O REALTIME NAS MESAS TAMBÉM
  // Assim, se o garçom de outro celular lançar algo, aparece aqui na hora
  useEffect(() => {
    buscarPedidos()
    
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

  // --- NOVO: FUNÇÃO FECHAR CONTA ---
  const fecharConta = async () => {
    if (!confirm(`Confirmar pagamento da Mesa ${mesaSelecionada}?`)) return

    // Atualiza TODOS os pedidos dessa mesa para 'pago'
    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'pago' })
      .eq('mesa', mesaSelecionada)
      .neq('status', 'pago') // Só o que ainda não foi pago

    if (!error) {
      setMesaSelecionada(null) // Fecha o modal
      alert('Conta fechada com sucesso! Mesa liberada. 💸')
    }
  }

  // CÁLCULOS
  const pedidosDaMesaAtual = listaPedidos.filter(item => item.mesa === mesaSelecionada)
  const totalMesa = pedidosDaMesaAtual.reduce((acc, item) => acc + item.total, 0)
  const mesasOcupadas = listaPedidos.map(p => p.mesa)

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Salão Principal</h1>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(numero => {
          const estaOcupada = mesasOcupadas.includes(numero)
          return (
            <div 
              key={numero} 
              onClick={() => setMesaSelecionada(numero)}
              style={{ 
                width: '120px', height: '120px', 
                backgroundColor: estaOcupada ? '#ffeba7' : '#d4edda', // Verde se livre
                border: estaOcupada ? '2px solid orange' : '2px solid #28a745',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Mesa {numero}</span>
              <span style={{ fontSize: '12px', color: estaOcupada ? 'orange' : 'green', fontWeight: 'bold' }}>
                {estaOcupada ? 'Ocupada' : 'Livre'}
              </span>
              {estaOcupada && <span style={{fontSize: '10px', marginTop: '5px'}}>Ver Conta</span>}
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
            width: '350px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h2 style={{margin:0}}>Mesa {mesaSelecionada}</h2>
              <button onClick={() => { setMesaSelecionada(null); setMostrandoCardapio(false); }} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>

            {!mostrandoCardapio ? (
              <>
                <div style={{ flex: 1, overflowY: 'auto', minHeight: '150px', marginBottom: '15px' }}>
                  {pedidosDaMesaAtual.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>Nenhum consumo.</p>
                  ) : (
                    pedidosDaMesaAtual.map((pedido) => (
                      <div key={pedido.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #eee' }}>
                        <div>
                          <span style={{fontWeight: '500'}}>{pedido.itens[0].nome}</span>
                          <div style={{fontSize: '11px', color: pedido.status === 'pronto' ? 'green' : 'orange'}}>
                            {pedido.status === 'pronto' ? '✅ Pronto' : '⏳ Preparando'}
                          </div>
                        </div>
                        <span>R$ {pedido.total.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50' }}>
                  <span>Total:</span>
                  <span>R$ {totalMesa.toFixed(2)}</span>
                </div>

                <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                  <button 
                    onClick={() => setMostrandoCardapio(true)}
                    style={{ padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Adicionar Item
                  </button>

                  {/* SÓ MOSTRA O BOTÃO DE PAGAR SE TIVER CONTA */}
                  {totalMesa > 0 && (
                    <button 
                      onClick={fecharConta}
                      style={{ padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      💰 Fechar Conta
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '15px' }}>Cardápio</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                  {produtos.map(produto => (
                    <button 
                      key={produto.id}
                      onClick={() => adicionarItem(produto)}
                      style={{ 
                        padding: '12px', textAlign: 'left', background: '#f8f9fa', 
                        border: '1px solid #e9ecef', borderRadius: '8px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{fontWeight: '500'}}>{produto.nome}</span>
                      <strong style={{color: '#28a745'}}>R$ {produto.preco.toFixed(2)}</strong>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setMostrandoCardapio(false)}
                  style={{ marginTop: '15px', padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Voltar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}