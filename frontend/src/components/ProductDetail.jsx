import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductDetail({ productId, onBack, onSelectProduct }) {
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    // Fetch product details and recommendations in parallel
    Promise.all([
      fetch(`/api/products/${productId}`).then(res => res.json()),
      fetch(`/api/products/${productId}/recommendations`).then(res => res.json())
    ]).then(([prodData, recData]) => {
      setProduct(prodData);
      setRecommendations(recData);
      setLoading(false);
    });
  }, [productId]);

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!product) return <div className="text-center py-20 text-slate-500">Product not found.</div>;

  return (
    <div className="animate-fade-in-up">
      <button 
        onClick={onBack}
        className="mb-8 text-sm font-bold text-slate-400 hover:text-white flex items-center transition-colors group"
      >
        <span className="transform group-hover:-translate-x-2 transition-transform inline-block mr-2">&larr;</span> 
        Back to catalog
      </button>

      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 mix-blend-overlay pointer-events-none" />
        
        <div className="md:w-1/2 bg-slate-900/50 min-h-[500px] flex items-center justify-center relative overflow-hidden p-8">
          {product.imageUrl && product.imageUrl.startsWith('http') ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-screen opacity-80 animate-pulse hover:animate-none transition-all duration-1000" />
            </>
          ) : (
             <span className="text-3xl font-bold text-slate-800 relative z-10">{product.name}</span>
          )}
        </div>
        
        <div className="p-10 md:p-16 md:w-1/2 flex flex-col justify-center relative z-20">
          <span className="text-sm font-bold text-fuchsia-400 uppercase tracking-[0.2em]">{product.category}</span>
          <h2 className="mt-4 text-5xl font-extrabold text-white leading-tight">{product.name}</h2>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed font-light">{product.description}</p>
          
          <div className="mt-8 flex gap-4 items-center">
            <div className={`px-4 py-2 rounded-xl text-sm font-bold border backdrop-blur-md ${product.stock > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} Units in Stock` : 'Out of Stock'}
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300">
              Graph Entity: <span className="font-mono text-indigo-300 ml-1">{product.id.substring(0,8)}</span>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              ${product.price.toFixed(2)}
            </span>
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold rounded-2xl hover:from-indigo-500 hover:to-fuchsia-500 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(217,70,239,0.6)]"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-3xl font-extrabold text-white">Recommended for you</h3>
            <div className="h-px bg-gradient-to-r from-indigo-500/50 to-transparent flex-1" />
          </div>
          <p className="text-indigo-400 font-medium mb-10 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Powered by multi-hop graph traversal
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((rec, idx) => (
              <div 
                key={rec.id} 
                style={{ animationDelay: `${idx * 100}ms` }}
                className="glass-card hover:bg-white/10 transition-all duration-300 rounded-3xl p-6 flex items-center gap-6 cursor-pointer group hover:-translate-y-2 animate-fade-in-up"
                onClick={() => onSelectProduct(rec.id)}
              >
                <div className="w-24 h-24 bg-slate-800 rounded-2xl flex-shrink-0 overflow-hidden relative border border-white/5 shadow-inner">
                  {rec.imageUrl && rec.imageUrl.startsWith('http') && (
                     <img src={rec.imageUrl} className="w-full h-full object-cover mix-blend-screen opacity-70 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">{rec.category}</span>
                  <h4 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors mt-1">{rec.name}</h4>
                  <p className="font-black text-slate-300 mt-2">${rec.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
