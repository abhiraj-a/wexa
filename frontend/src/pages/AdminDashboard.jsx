import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
    fetchOrders();
  }, [navigate]);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      })
    });
    
    setNewProduct({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
    setEditingId(null);
    fetchProducts();
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewProduct({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 glass px-8 py-6 rounded-[2rem]">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Admin Workspace
          </h1>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-colors">Storefront</button>
            <button onClick={logout} className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full font-bold hover:bg-red-500 hover:text-white transition-colors">Logout</button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="glass-card p-8 rounded-[2rem] sticky top-8 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                  <span className="text-indigo-300 font-bold">{editingId ? '✎' : '+'}</span>
                </div>
                <h2 className="text-2xl font-bold">{editingId ? 'Edit Product' : 'New Product'}</h2>
              </div>
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <input placeholder="Product Name" required className="p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input placeholder="Category" required className="p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                  value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                <div className="flex gap-4">
                  <input type="number" step="0.01" placeholder="Price" required className="w-1/2 p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  <input type="number" placeholder="Stock" required className="w-1/2 p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
                <textarea placeholder="Description" required className="p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 min-h-[120px]"
                  value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                <input placeholder="Image URL (optional)" className="p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
                  value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                <div className="flex gap-4 mt-4">
                  <button type="submit" className="flex-1 glass-button text-white font-bold py-4 rounded-xl hover:bg-indigo-500 transition-all">
                    {editingId ? 'Update Inventory' : 'Add to Inventory'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="px-6 py-4 bg-slate-500/20 text-slate-300 font-bold rounded-xl hover:bg-slate-500/40 transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2rem] overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="font-bold text-lg">Inventory Management</h3>
                <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">{products.length} Items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="p-6">Product</th>
                      <th className="p-6">Category</th>
                      <th className="p-6 text-right">Price</th>
                      <th className="p-6 text-right">Stock</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6 font-medium text-white">{p.name}</td>
                        <td className="p-6 text-slate-400 text-sm">{p.category}</td>
                        <td className="p-6 text-right font-mono text-indigo-300">${p.price.toFixed(2)}</td>
                        <td className="p-6 text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${p.stock > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(p)} className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-colors">
                              ✎
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                              &times;
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] overflow-hidden animate-fade-in-up mt-8" style={{ animationDelay: '200ms' }}>
              <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="font-bold text-lg">Recent Orders</h3>
                <span className="text-xs font-bold bg-fuchsia-500/20 text-fuchsia-300 px-3 py-1 rounded-full">{orders.length} Orders</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="p-6">Order ID</th>
                      <th className="p-6">Date</th>
                      <th className="p-6">Items</th>
                      <th className="p-6 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6 font-mono text-xs text-indigo-300">{o.id}</td>
                        <td className="p-6 text-slate-400 text-sm">{o.date}</td>
                        <td className="p-6">
                          <ul className="text-sm text-slate-300 list-disc list-inside">
                            {o.items.map((item, idx) => (
                              <li key={idx}>{item.quantity}x {item.name}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-6 text-right font-bold text-white">
                          ${o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
