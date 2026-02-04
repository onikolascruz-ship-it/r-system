import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Mesas() {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarMesas = async () => {
    try {
      const { data: dadosMesas, error: erroMesas } = await supabase
        .from('mesas')
        .select(`*, comandas (id, status, total, nome_cliente)`)
        .order('numero', { ascending: true });

      if (erroMesas) throw erroMesas;

      const mesasFormatadas = dadosMesas.map(mesa => {
        const comandaAberta = mesa.comandas.find(c => c.status === 'aberta');
        return {
          ...mesa,
          ocupada: !!comandaAberta,
          comandaAtiva: comandaAberta || null
        };
      });
      setMesas(mesasFormatadas);
    } catch (error) {
      console.error("Erro ao carregar mesas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarMesas();
    const canal = supabase
      .channel('mapa-mesas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comandas' }, () => { buscarMesas(); })
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, []);

  const criarComanda = async (mesaId) => {
    try {
      const { data, error } = await supabase
        .from('comandas')
        .insert([{ mesa_id: mesaId, status: 'aberta', total: 0 }])
        .select()
        .single();
      if (error) throw error;
      navigate(`/venda/${data.id}`);
    } catch (error) {
      alert('Erro ao abrir mesa.');
    }
  };

  const handleMesaClick = (mesa) => {
    if (mesa.ocupada) {
      navigate(`/conta/${mesa.comandaAtiva.id}`);
    } else {
      const abrir = window.confirm(`A Mesa ${mesa.numero} esta LIVRE. Deseja abrir?`);
      if (abrir) criarComanda(mesa.id);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: 20 }}>Carregando mapa...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'Arial' }}>
      
      {/* CABEÇALHO DUPLO */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #7f8c8d', paddingBottom: '15px', marginBottom: '20px', gap: '10px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          &lt; 
        </button>

        <button 
          onClick={() => navigate('/')} 
          style={{ padding: '10px 20px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
           Home
        
        </button>

        <h1 style={{ color: 'white', margin: '0 0 0 20px' }}>Mapa</h1>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {mesas.map(mesa => (
          <div
            key={mesa.id}
            onClick={() => handleMesaClick(mesa)}
            style={{
              width: '150px', height: '150px',
              backgroundColor: mesa.ocupada ? '#e74c3c' : '#27ae60',
              borderRadius: '15px', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '4px solid rgba(255,255,255,0.2)',
              transition: 'transform 0.2s', position: 'relative'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '40px', color: 'white', fontWeight: 'bold' }}>{mesa.numero}</span>
            <span style={{ color: 'white', marginTop: '10px', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {mesa.ocupada ? 'OCUPADA' : 'LIVRE'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}