import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Produtos() {
  const [listaProdutos, setListaProdutos] = useState([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [editandoId, setEditandoId] = useState(null) // Guarda o ID se estiver editando

  const carregarProdutos = async () => {
    const { data } = await supabase.from('produtos').select('*').order('nome')
    if (data) setListaProdutos(data)
  }

  useEffect(() => { carregarProdutos() }, [])

  // Função unificada: Cria ou Atualiza
  const salvarProduto = async (e) => {
    e.preventDefault()
    if (!nome || !preco) return

    const precoFormatado = parseFloat(preco.toString().replace(',', '.'))

    if (editandoId) {
      // MODO EDIÇÃO: Atualiza o existente
      await supabase.from('produtos').update({ nome, preco: precoFormatado }).eq('id', editandoId)
      alert('Produto atualizado!')
    } else {
      // MODO CRIAÇÃO: Cria um novo
      await supabase.from('produtos').insert({ nome, preco: precoFormatado })
      alert('Produto cadastrado!')
    }

    // Limpa o formulário e recarrega
    setNome('')
    setPreco('')
    setEditandoId(null)
    carregarProdutos()
  }

  const prepararEdicao = (produto) => {
    setNome(produto.nome)
    setPreco(produto.preco)
    setEditandoId(produto.id)
  }

  const deletarProduto = async (id) => {
    if (confirm('Tem certeza?')) {
      await supabase.from('produtos').delete().eq('id', id)
      carregarProdutos()
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📦 Gerenciar Cardápio</h1>

      <form onSubmit={salvarProduto} style={{ display: 'flex', gap: '10px', marginBottom: '30px', padding: '20px', background: editandoId ? '#fff3cd' : '#f8f9fa', borderRadius: '8px', border: editandoId ? '2px solid #ffc107' : '1px solid #ddd' }}>
        <input 
          type="text" placeholder="Nome do produto" 
          value={nome} onChange={(e) => setNome(e.target.value)}
          style={{ flex: 1, padding: '10px' }}
        />
        <input 
          type="number" step="0.01" placeholder="Preço" 
          value={preco} onChange={(e) => setPreco(e.target.value)}
          style={{ width: '150px', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: editandoId ? '#ffc107' : '#28a745', color: editandoId ? 'black' : 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>
          {editandoId ? '💾 Atualizar' : '+ Salvar'}
        </button>
        {editandoId && (
          <button type="button" onClick={() => { setEditandoId(null); setNome(''); setPreco('') }} style={{ padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Cancelar
          </button>
        )}
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listaProdutos.map(prod => (
          <li key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
            <div>
              <strong>{prod.nome}</strong>
              <div style={{ color: '#666' }}>R$ {prod.preco.toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => prepararEdicao(prod)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>✏️ Editar</button>
              <button onClick={() => deletarProduto(prod.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}