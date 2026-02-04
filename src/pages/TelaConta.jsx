import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function TelaConta() {
  const { id } = useParams(); // ID da Comanda
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [comanda, setComanda] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarDetalhes();
  }, []);

  const buscarDetalhes = async () => {
    try {
      // 1. Busca dados da comanda
      const { data: dadosComanda } = await supabase
        .from('comandas')
        .select('*, mesas(*)')
        .eq('id', id)
        .single();
      
      setComanda(dadosComanda);

      // 2. Busca TODOS os itens
      const { data: dadosItens } = await supabase
        .from('itens_pedido')
        .select('*, produtos(*)')
        .eq('comanda_id', id);

      setItens(dadosItens || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    return itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);
  };

  // Agrupa itens iguais
  const getItensAgrupados = () => {
    const listaResumida = [];
    itens.forEach(item => {
      const existente = listaResumida.find(i => i.produto_id === item.produto_id);
      if (existente) {
        existente.quantidade += item.quantidade;
      } else {
        listaResumida.push({ ...item });
      }
    });
    return listaResumida;
  };

  const fecharConta = async () => {
    if (!window.confirm("Deseja realmente fechar esta conta e liberar a mesa?")) return;

    await supabase.from('comandas').update({ status: 'paga', total: calcularTotal() }).eq('id', id);
    await supabase.from('mesas').update({ status: 'livre' }).eq('id', comanda.mesa_id);
    
    alert("Conta Fechada com Sucesso!");
    navigate('/'); // Volta para o inicio apos fechar
  };

  if (loading) return <div style={{padding:20, color:'white'}}>Carregando conta...</div>;

  const itensParaExibir = getItensAgrupados();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Arial', backgroundColor: '#f4f6f7' }}>
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <div style={{ padding: '10px 20px', backgroundColor: '#34495e', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          &lt;
        </button>

        <button 
          onClick={() => navigate('/')} 
          style={{ padding: '10px 20px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Home
        </button>
        
        <h2 style={{ color: 'white', margin: '0 0 0 15px', fontSize: '18px' }}>Extrato da Conta</h2>
      </div>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        {/* CABEÇALHO DA CONTA */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px 10px 0 0', borderBottom: '2px dashed #bdc3c7', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '28px' }}>
            Mesa {comanda?.mesas?.numero}
          </h2>
          <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Resumo de Consumo</p>
        </div>

        {/* LISTA DE ITENS */}
        <div style={{ backgroundColor: '#fff', padding: '20px', minHeight: '300px' }}>
          {itensParaExibir.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#ccc', marginTop: '50px' }}>Nenhum item pedido ainda.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', color: '#7f8c8d', fontSize: '14px' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Qtd</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Item</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Unit.</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {itensParaExibir.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 10px', fontWeight: 'bold', fontSize: '16px' }}>{item.quantidade}x</td>
                    
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{ fontSize: '16px', color: '#2c3e50' }}>{item.produtos?.nome}</span>
                    </td>
                    
                    <td style={{ padding: '15px 10px', textAlign: 'right', color: '#7f8c8d' }}>
                      R$ {item.preco_unitario.toFixed(2)}
                    </td>

                    <td style={{ padding: '15px 10px', textAlign: 'right', fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' }}>
                      R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RODAPÉ E BOTÕES DE AÇÃO */}
        <div style={{ backgroundColor: '#f1c40f', padding: '20px', borderRadius: '0 0 10px 10px', color: '#2c3e50' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '28px', fontWeight: 'bold', marginBottom: '25px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '15px' }}>
            <span>TOTAL A PAGAR:</span>
            <span>R$ {calcularTotal().toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => navigate(`/venda/${id}`)}
              style={{ flex: 1, padding: '15px', border: 'none', borderRadius: '8px', backgroundColor: '#2980b9', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' }}
            >
              + Adicionar Itens
            </button>
            
            <button 
              onClick={fecharConta}
              style={{ flex: 1, padding: '15px', border: 'none', borderRadius: '8px', backgroundColor: '#c0392b', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' }}
            >
              Fechar Conta ($)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}