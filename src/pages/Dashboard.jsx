import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados para o Filtro de Data
  // Definimos o padrão como a data de hoje para ja carregar o dia atual
  const hoje = new Date().toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);

  useEffect(() => {
    buscarFinanceiro();
  }, []);

  const buscarFinanceiro = async () => {
    setLoading(true);
    try {
      // Começa a query base
      let query = supabase
        .from('comandas')
        .select(`*, mesas(numero)`)
        .eq('status', 'paga')
        .order('created_at', { ascending: false });

      // Aplica filtro de Data Inicio (se tiver preenchido)
      // Adicionamos T00:00:00 para pegar desde o começo do dia
      if (dataInicio) {
        query = query.gte('created_at', `${dataInicio}T00:00:00`);
      }

      // Aplica filtro de Data Fim (se tiver preenchido)
      // Adicionamos T23:59:59 para pegar até o final do dia
      if (dataFim) {
        query = query.lte('created_at', `${dataFim}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVendas(data);
      
      // Calcula o total
      const soma = data.reduce((acc, item) => acc + (item.total || 0), 0);
      setTotalGeral(soma);

    } catch (error) {
      console.error(error);
      alert('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ecf0f1', fontFamily: 'Arial' }}>
      
      {/* BARRA DE NAVEGAÇÃO */}
      <div style={{ padding: '10px 20px', backgroundColor: '#34495e', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          &lt; VOLTAR
        </button>
        <button 
          onClick={() => navigate('/')} 
          style={{ padding: '8px 15px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          INICIO
        </button>
        <h2 style={{ color: 'white', margin: '0 0 0 15px', fontSize: '18px' }}>Financeiro</h2>
      </div>

      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* AREA DE FILTRO */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: 'bold' }}>Data Inicio:</label>
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: 'bold' }}>Data Fim:</label>
            <input 
              type="date" 
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
            />
          </div>

          <button 
            onClick={buscarFinanceiro}
            style={{ padding: '10px 25px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '40px' }}
          >
            FILTRAR
          </button>
        </div>

        {/* CARD DE TOTAL */}
        <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '30px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '20px', opacity: 0.9 }}>Faturamento no Periodo</h3>
          <h1 style={{ margin: '10px 0 0 0', fontSize: '48px' }}>R$ {totalGeral.toFixed(2)}</h1>
        </div>

        {/* TABELA DE VENDAS */}
        <h3 style={{ color: '#2c3e50', marginTop: '30px' }}>Relatorio de Vendas</h3>
        
        {loading ? <p>Carregando...</p> : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f2f6', color: '#7f8c8d' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Data/Hora</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Origem</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {vendas.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>Nenhuma venda encontrada neste periodo.</td>
                  </tr>
                ) : (
                  vendas.map(venda => (
                    <tr key={venda.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}>
                        {new Date(venda.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '15px' }}>
                        Mesa {venda.mesas?.numero || '?'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ backgroundColor: '#2ecc71', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          PAGO
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#2c3e50' }}>
                        R$ {venda.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}