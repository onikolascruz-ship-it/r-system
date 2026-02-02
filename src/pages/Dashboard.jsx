import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Dashboard() {
  const [vendas, setVendas] = useState([])
  const [totalFaturado, setTotalFaturado] = useState(0)
  const [totalPedidos, setTotalPedidos] = useState(0)
  
  // Filtros de Data
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const buscarVendas = async () => {
    // Começa montando a "frase" para o banco
    let query = supabase
      .from('pedidos')
      .select('*')
      .eq('status', 'pago')
      .order('id', { ascending: false })

    // Se tiver data inicial, adiciona filtro "Maior ou igual a..."
    if (dataInicio) {
      query = query.gte('created_at', dataInicio + 'T00:00:00')
    }

    // Se tiver data final, adiciona filtro "Menor ou igual a..."
    if (dataFim) {
      query = query.lte('created_at', dataFim + 'T23:59:59')
    }

    const { data, error } = await query

    if (data) {
      setVendas(data)
      const faturamento = data.reduce((acc, item) => acc + item.total, 0)
      setTotalFaturado(faturamento)
      setTotalPedidos(data.length)
    }
  }

  // Roda sempre que mudar as datas ou ao abrir a tela
  useEffect(() => {
    buscarVendas()
  }, [dataInicio, dataFim])

  return (
    <div style={{ padding: '30px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: 'Arial' }}>
      <div style={{display:'flex', justifyContent: 'space-between', alignItems:'center', flexWrap: 'wrap', gap: '15px'}}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>📊 Painel Financeiro</h1>
        
        {/* FILTROS DE DATA */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div>
            <span style={{fontSize: '12px', color: '#666', display: 'block'}}>De:</span>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={{border:'1px solid #ddd', padding:'5px', borderRadius:'4px'}} />
          </div>
          <div>
            <span style={{fontSize: '12px', color: '#666', display: 'block'}}>Até:</span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={{border:'1px solid #ddd', padding:'5px', borderRadius:'4px'}} />
          </div>
          {(dataInicio || dataFim) && (
             <button onClick={() => {setDataInicio(''); setDataFim('')}} style={{background:'#6c757d', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', height: '30px', alignSelf: 'flex-end'}}>Limpar</button>
          )}
        </div>
      </div>

      {/* CARDS KPI */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', width: '250px', borderLeft: '5px solid #27ae60', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>FATURAMENTO (Período)</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#2c3e50' }}>R$ {totalFaturado.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', width: '250px', borderLeft: '5px solid #2980b9', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>VENDAS (Período)</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#2c3e50' }}>{totalPedidos}</p>
        </div>
      </div>

      <h2 style={{ color: '#2c3e50', fontSize: '20px' }}>Extrato de Vendas</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#ecf0f1' }}>
            <tr>
              <th style={{ padding: '15px' }}>Data/Hora</th>
              <th style={{ padding: '15px' }}>Mesa</th>
              <th style={{ padding: '15px' }}>Produto</th>
              <th style={{ padding: '15px' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Nenhuma venda encontrada neste período.</td></tr>
            ) : (
              vendas.map(venda => (
                <tr key={venda.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{new Date(venda.created_at).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: '15px' }}>Mesa {venda.mesa}</td>
                  <td style={{ padding: '15px' }}>{venda.itens[0].nome}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#27ae60' }}>R$ {venda.total.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}