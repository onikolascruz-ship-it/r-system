import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function TelaVenda() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      const { data } = await supabase.from('produtos').select('*').order('nome');
      if (data) setProdutos(data);
    };
    carregarDados();
  }, []);

  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.produto_id === produto.id);

    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.produto_id === produto.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: 1
      }]);
    }
  };

  const enviarPedido = async () => {
    if (carrinho.length === 0) return;
    setLoading(true);

    try {
      const itensParaSalvar = carrinho.map(item => ({
        comanda_id: id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        status_producao: 'pendente'
      }));

      const { error } = await supabase.from('itens_pedido').insert(itensParaSalvar);

      if (error) throw error;

      alert('Pedido enviado com sucesso.');
      setCarrinho([]);
      // Ao enviar, continua indo para o Extrato da mesa (fluxo comercial correto)
      navigate(`/conta/${id}`); 
      
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial' }}>
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <div style={{ padding: '10px 20px', backgroundColor: '#34495e', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => navigate(-1)} // VOLTA 1 PAGINA
          style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          &lt; VOLTAR
        </button>

        <button 
          onClick={() => navigate('/')} // VAI PARA O INICIO
          style={{ padding: '10px 20px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          INICIO
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ESQUERDA: Cardápio */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#ecf0f1', overflowY: 'auto' }}>
          <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Cardapio</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
            {produtos.map(prod => (
              <button
                key={prod.id}
                onClick={() => adicionarAoCarrinho(prod)}
                style={{
                  padding: '20px', backgroundColor: 'white', border: '1px solid #bdc3c7',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '16px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                <strong>{prod.nome}</strong><br/>
                <span style={{ color: '#27ae60' }}>R$ {prod.preco}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DIREITA: Carrinho */}
        <div style={{ width: '350px', backgroundColor: '#fff', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ borderBottom: '2px solid #e74c3c', paddingBottom: '10px' }}>Pedido Atual</h3>
            
            {carrinho.length === 0 ? (
              <p style={{ color: '#95a5a6', textAlign: 'center', marginTop: '50px' }}>Nenhum item selecionado</p>
            ) : (
              carrinho.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div><strong>{item.quantidade}x</strong> {item.nome}</div>
                  <div>R$ {(item.preco * item.quantidade).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', marginBottom: '15px', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>R$ {carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0).toFixed(2)}</span>
            </div>

            <button
              onClick={enviarPedido}
              disabled={carrinho.length === 0 || loading}
              style={{
                width: '100%', padding: '15px',
                backgroundColor: carrinho.length === 0 ? '#bdc3c7' : '#27ae60',
                color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px',
                fontWeight: 'bold', cursor: carrinho.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'ENVIANDO...' : 'ENVIAR PEDIDO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}