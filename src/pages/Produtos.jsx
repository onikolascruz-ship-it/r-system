import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Produtos() {
  const [listaProdutos, setListaProdutos] = useState([])
  const [novoNome, setNovoNome] = useState('')
  const [novoPreco, setNovoPreco] = useState('')

  // BUSCAR PRODUTOS
  const carregarProdutos = async () => {
    const { data } = await supabase.from('produtos').select('*').order('nome')
    if (data) setListaProdutos(data)
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  // CADASTRAR NOVO
  const adicionarProduto = async (e) => {
    e.preventDefault()
    if (!novoNome || !novoPreco) return

    const { error } = await supabase.from('produtos').insert({
      nome: novoNome,
      preco: parseFloat(novoPreco.replace(',', '.')) // Garante que 10,50 vire 10.50
    })

    if (!error) {
      setNovoNome('')
      setNovoPreco('')
      carregarProdutos()
      alert('Produto cadastrado!')
    }
  }

  // DELETAR
  const deletarProduto = async (id) => {
    if (confirm('Tem certeza que quer excluir este item?')) {
      await supabase.from('produtos').delete().eq('id', id)
      carregarProdutos()
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📦 Gerenciar Cardápio</h1>

      {/* FORMULÁRIO DE CADASTRO */}
      <form onSubmit={adicionarProduto} style={{ display: 'flex', gap: '10px', marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <input 
          type="text" 
          placeholder="Nome do produto (ex: Coxinha)" 
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          style={{ flex: 1, padding: '10px' }}
        />
        <input 
          type="number" 
          step="0.01" 
          placeholder="Preço (ex: 5.50)" 
          value={novoPreco}
          onChange={(e) => setNovoPreco(e.target.value)}
          style={{ width: '150px', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
          + Salvar
        </button>
      </form>

      {/* LISTA DE PRODUTOS */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listaProdutos.map(prod => (
          <li key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
            <div>
              <strong>{prod.nome}</strong>
              <div style={{ color: '#666' }}>R$ {prod.preco.toFixed(2)}</div>
            </div>
            <button 
              onClick={() => deletarProduto(prod.id)}
              style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}