import React, { useState } from 'react';
import { supabase } from '../supabase'; 
import { useNavigate } from 'react-router-dom';

export default function TelaInicial() {
  const navigate = useNavigate();
  const [numeroMesa, setNumeroMesa] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEntrada(e) {
    if (e.key !== 'Enter' || !numeroMesa) return;

    setLoading(true);

    try {
      // 1. Descobrir o ID REAL da mesa no banco
      const { data: mesa, error: erroMesa } = await supabase
        .from('mesas')
        .select('id')
        .eq('numero', numeroMesa)
        .maybeSingle();

      if (erroMesa) throw erroMesa;
      
      if (!mesa) {
        alert(`A Mesa ${numeroMesa} nao esta cadastrada no sistema!`);
        setLoading(false);
        return;
      }

      // 2. Busca comanda aberta nesta mesa
      const { data: comandas, error: erroComanda } = await supabase
        .from('comandas')
        .select('*')
        .eq('mesa_id', mesa.id)
        .eq('status', 'aberta');

      if (erroComanda) throw erroComanda;

      // CENARIO A: Mesa Vazia (0 comandas) -> Cria e vai para VENDA
      if (comandas.length === 0) {
        const confirmar = window.confirm(`A Mesa ${numeroMesa} esta LIVRE. Abrir nova conta?`);
        
        if (confirmar) {
          const { data: novaComanda, error: erroCriacao } = await supabase
            .from('comandas')
            .insert([{ 
              mesa_id: mesa.id,
              status: 'aberta',
              total: 0 
            }])
            .select()
            .single();

          if (erroCriacao) throw erroCriacao;

          // Mesa nova: vai direto para adicionar itens
          navigate(`/venda/${novaComanda.id}`);
        }
      } 
      
      // CENARIO B: Mesa Ocupada -> Vai para o EXTRATO (Conta)
      else if (comandas.length >= 1) {
        const idDaComanda = comandas[0].id;
        // MUDANCA AQUI: Redireciona para /conta em vez de /venda
        navigate(`/conta/${idDaComanda}`);
      }

    } catch (error) {
      console.error('Erro detalhado:', error);
      alert('Ocorreu um erro tecnico. Verifique o console.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#2c3e50' }}>R-System</h1>
      
      <div style={{ marginTop: '50px' }}>
        <label style={{ display: 'block', fontSize: '20px', marginBottom: '15px', color: '#7f8c8d' }}>
          Digite o numero da MESA e aperte <strong>ENTER</strong>:
        </label>
        
        <input
          type="number"
          value={numeroMesa}
          onChange={(e) => setNumeroMesa(e.target.value)}
          onKeyDown={handleEntrada}
          placeholder="Ex: 10"
          style={{ 
            fontSize: '32px', 
            padding: '15px', 
            width: '200px', 
            textAlign: 'center',
            borderRadius: '10px',
            border: '2px solid #3498db'
          }}
          disabled={loading}
          autoFocus
        />
      </div>

      {loading && <p style={{ marginTop: '20px', color: '#3498db' }}>Buscando mesa...</p>}
    </div>
  );
}