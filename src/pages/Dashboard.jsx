import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Dashboard() {
  const [vendas, setVendas] = useState([])
  
  // Variáveis para os Cards de Resumo
  const [totalFaturado, setTotalFaturado] = useState(0)
  const [totalPedidos, setTotalPedidos] = useState(0)

  const buscarVendas = async () => {
    // Busca tudo que JÁ FOI PAGO
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('status', 'pago')
      .order('id', { ascending: false }) // Do mais recente para o mais antigo

    if (data) {
      setVendas(data)
      
      // Calcular totais usando JavaScript simples
      const faturamento = data.reduce((acc, item) => acc + item.total, 0)
      setTotalFaturado(faturamento)
      setTotalPedidos(data.length)
    }
  }

  useEffect(() => {
    buscarVendas()
  }, [])

  return (
    <div style={{ padding: '30px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#2c3e50' }}>📊 Painel Financeiro</h1>
      <p>Visão geral do desempenho do restaurante.</p>

      {/* CARDS DE RESUMO (KPIs) */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '40px' }}>
        
        {/* Card Faturamento */}
        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '10px', 
          width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #27ae60'
        }}>
          <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>FATURAMENTO TOTAL</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#2c3e50' }}>
            R$ {totalFaturado.toFixed(2)}
          </p>
        </div>

        {/* Card Quantidade */}
        <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '10px', 
          width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #2980b9'
        }}>
          <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>VENDAS REALIZADAS</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#2c3e50' }}>
            {totalPedidos}
          </p>
        </div>
      </div>

      {/* TABELA DE HISTÓRICO */}
      <h2 style={{ color: '#2c3e50', fontSize: '20px' }}>Histórico de Vendas Recentes</h2>
      <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#ecf0f1' }}>
            <tr>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Data</th>
              <th style={{ padding: '15px' }}>Mesa</th>
              <th style={{ padding: '15px' }}>Produto</th>
              <th style={{ padding: '15px' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Nenhuma venda registrada ainda.</td>
              </tr>
            ) : (
              vendas.map(venda => (
                <tr key={venda.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', color: '#7f8c8d' }}>#{venda.id}</td>
                  <td style={{ padding: '15px' }}>
                    {new Date(venda.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '15px' }}>Mesa {venda.mesa}</td>
                  <td style={{ padding: '15px' }}>{venda.itens[0].nome}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#27ae60' }}>
                    R$ {venda.total.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}