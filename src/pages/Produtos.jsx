import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [novoProduto, setNovoProduto] = useState({ nome: '', preco: '', categoria: 'Lanches' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      const { data, error } = await supabase.from('produtos').select('*').order('nome');
      if (error) throw error;
      setProdutos(data);
    } catch (error) {
      alert('Erro ao carregar produtos.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarProduto = async (e) => {
    e.preventDefault();
    if (!novoProduto.nome || !novoProduto.preco) return alert('Preencha todos os campos');

    try {
      const { error } = await supabase.from('produtos').insert([{
        nome: novoProduto.nome,
        preco: parseFloat(novoProduto.preco),
        categoria: novoProduto.categoria
      }]);

      if (error) throw error;

      alert('Produto adicionado com sucesso!');
      setNovoProduto({ nome: '', preco: '', categoria: 'Lanches' }); // Limpa form
      buscarProdutos(); // Recarrega lista
    } catch (error) {
      alert('Erro ao cadastrar produto.');
      console.error(error);
    }
  };

  const removerProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      buscarProdutos();
    } catch (error) {
      alert('Erro ao excluir.');
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
          &lt;
        </button>
        <button 
          onClick={() => navigate('/')} 
          style={{ padding: '8px 15px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Home
        </button>
        <h2 style={{ color: 'white', margin: '0 0 0 15px', fontSize: '18px' }}>Gestao de Produtos</h2>
      </div>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* FORMULÁRIO DE CADASTRO */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Novo Produto</h3>
          <form onSubmit={adicionarProduto} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Nome do Produto" 
              value={novoProduto.nome}
              onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})}
              style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
            />
            <select 
              value={novoProduto.categoria}
              onChange={e => setNovoProduto({...novoProduto, categoria: e.target.value})}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
            >
              <option value="Lanches">Lanches</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Porcoes">Porcoes</option>
              <option value="Sobremesas">Sobremesas</option>
            </select>
            <input 
              type="number" 
              placeholder="Preco (R$)" 
              step="0.01"
              value={novoProduto.preco}
              onChange={e => setNovoProduto({...novoProduto, preco: e.target.value})}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
            />
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              SALVAR
            </button>
          </form>
        </div>

        {/* LISTA DE PRODUTOS */}
        {loading ? <p>Carregando...</p> : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f2f6', color: '#7f8c8d' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Categoria</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Preco</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(prod => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>{prod.nome}</td>
                    <td style={{ padding: '15px' }}>{prod.categoria}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#27ae60' }}>R$ {prod.preco.toFixed(2)}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button 
                        onClick={() => removerProduto(prod.id)}
                        style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}