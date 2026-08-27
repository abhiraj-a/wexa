import React, { useEffect, useState } from 'react';

export default function ProductList({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-20">
      <div className="inline-block glass-card border-red-500/30 bg-red-500/10 text-red-200 px-8 py-4 rounded-2xl">
        Error: {error}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Featured Graph Collection
          </h2>
          <p className="text-slate-400 mt-2 text-sm">Discover products through connected intelligence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <div 
            key={product.id} 
            className="glass-card hover:bg-white/10 transition-all duration-500 rounded-3xl overflow-hidden cursor-pointer group hover:-translate-y-2 hover:shadow-[0_20px_40px_0_rgba(79,70,229,0.2)] hover:border-indigo-500/30"
            onClick={() => onSelectProduct(product.id)}
          >
            <div className="h-56 bg-slate-800 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 mix-blend-overlay z-10" />
              {product.imageUrl && product.imageUrl.startsWith('http') ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover mix-blend-screen opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 font-medium group-hover:scale-110 transition-transform duration-700 ease-out">
                  {product.name}
                </div>
              )}
              
              {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute top-4 right-4 z-20 bg-orange-500/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-orange-400/50">
                  Only {product.stock} left
                </div>
              )}
            </div>
            
            <div className="p-6 relative">
              <div className="absolute -top-6 right-6 w-12 h-12 bg-[#0f172a] rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-inner">
                <span className="text-lg">✨</span>
              </div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{product.category}</span>
              <h3 className="mt-2 text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{product.name}</h3>
              <p className="mt-4 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
