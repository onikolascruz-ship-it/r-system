import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function Cozinha() {
  const navigate = useNavigate();
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)

  const buscarPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('itens_pedido')
        .select(`*, produtos(*), comandas (id, numero_cartao, mesas (*))`) 
        .in('status_producao', ['pendente', 'pronto']) 
        .order('created_at', { ascending: true });

      if (error) console.error("Erro Supabase:", error);
      if (data) setItens(data);
    } catch (error) {
      console.error("Erro geral:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarPedidos()
    const canal = supabase
      .channel('cozinha-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'itens_pedido' }, () => { buscarPedidos() })
      .subscribe()
    return () => { supabase.removeChannel(canal) }
  }, [])

  const marcarComoPronto = async (id) => {
    setItens(lista => lista.map(item => item.id === id ? { ...item, status_producao: 'pronto' } : item));
    const { error } = await supabase.from('itens_pedido').update({ status_producao: 'pronto' }).eq('id', id);
    if (error) buscarPedidos();
  }

  const marcarComoEntregue = async (id) => {
    setItens(lista => lista.filter(item => item.id !== id));
    const { error } = await supabase.from('itens_pedido').update({ status_producao: 'entregue' }).eq('id', id);
    if (error) buscarPedidos();
  }

  const pendentes = itens.filter(i => i.status_producao === 'pendente').sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const prontos = itens.filter(i => i.status_producao === 'pronto').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const CardPedido = ({ item, acao, textoBotao, corBotao, corFundo }) => {
    const dadosMesa = item.comandas?.mesas;
    const numeroMesa = Array.isArray(dadosMesa) ? dadosMesa[0]?.numero : dadosMesa?.numero;
    const cartao = item.comandas?.numero_cartao;
    const titulo = numeroMesa ? `Mesa ${numeroMesa}` : `Comanda ${cartao || 'Balcao'}`;
    const horaFormatada = new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
      <div style={{ backgroundColor: '#fff', color: '#2c3e50', borderRadius: '8px', width: '100%', marginBottom: '15px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: `5px solid ${corFundo}` }}>
        <div style={{ backgroundColor: corFundo, color: 'white', padding: '8px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>{titulo}</span>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>{horaFormatada}</span>
        </div>
        <div style={{ padding: '15px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{item.produtos?.nome || 'Produto nao identificado'}</h3>
          {item.observacoes && <div style={{ background: '#fff3cd', padding: '5px', borderRadius: '4px', fontSize: '13px', color: '#856404', border: '1px solid #ffeeba' }}>Obs: {item.observacoes}</div>}
        </div>
        <button onClick={() => acao(item.id)} style={{ width: '100%', padding: '10px', backgroundColor: corBotao, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>{textoBotao}</button>
      </div>
    )
  }

  if (loading) return <div style={{padding: 20, color: 'white'}}>Carregando...</div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial', backgroundColor: '#2c3e50', flexDirection: 'column' }}>
      
      {/* HEADER DA COZINHA DUPLO */}
      <div style={{ padding: '15px 20px', backgroundColor: '#212f3d', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          &lt; 
        </button>
        <button onClick={() => navigate('/')} style={{ padding: '8px 15px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Home
        </button>
        <h2 style={{ color: 'white', margin: '0 0 0 15px', fontSize: '18px' }}>Monitor de Producao (KDS)</h2>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 7, padding: '20px', borderRight: '2px solid #34495e' }}>
          <h1 style={{ color: 'white', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>Preparando ({pendentes.length})</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px', marginTop: '20px' }}>
            {pendentes.map(item => <CardPedido key={item.id} item={item} acao={marcarComoPronto} textoBotao="PRONTO" corBotao="#27ae60" corFundo="#e74c3c" />)}
          </div>
        </div>
        <div style={{ flex: 3, padding: '20px', backgroundColor: '#000000' }}>
          <h1 style={{ color: '#2ecc71', borderBottom: '1px solid #2ecc71', paddingBottom: '10px', fontSize: '22px' }}>Prontos ({prontos.length})</h1>
          <div style={{ marginTop: '20px', overflowY: 'auto', height: 'calc(100vh - 150px)' }}>
            {prontos.length === 0 && <p style={{color: '#95a5a6'}}>Nenhum pedido pronto.</p>}
            {prontos.map(item => <CardPedido key={item.id} item={item} acao={marcarComoEntregue} textoBotao="ENTREGUE" corBotao="#34495e" corFundo="#27ae60" />)}
          </div>
        </div>
      </div>
    </div>
  )
}