import React, { useState } from 'react';
import ProductList from '../components/ProductList';
import ProductDetail from '../components/ProductDetail';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function Storefront() {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, checkout, total } = useCart();

  return (
    <div className="min-h-screen text-slate-200">
      <header className="sticky top-0 z-40 glass border-b-0">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 
            className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setSelectedProductId(null)}
          >
            WexaShop
          </h1>
          <nav className="flex gap-6 items-center">
            <Link to="/admin/login" className="text-slate-400 hover:text-indigo-400 font-medium text-sm transition-colors">Admin</Link>
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative px-6 py-2 glass-button text-white rounded-full font-bold transition-all hover:bg-indigo-400 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-fuchsia-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex relative">
        <div className={`flex-1 transition-all duration-500 ${isCartOpen ? 'pr-[400px]' : ''}`}>
          {selectedProductId ? (
            <ProductDetail 
              productId={selectedProductId} 
              onBack={() => setSelectedProductId(null)}
              onSelectProduct={setSelectedProductId}
            />
          ) : (
            <ProductList onSelectProduct={setSelectedProductId} />
          )}
        </div>

        {isCartOpen && (
          <div className="w-[400px] glass-card fixed right-4 top-24 bottom-4 z-50 p-6 flex flex-col animate-slide-in-right rounded-3xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Your Cart</h2>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                  <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
                    🛒
                  </div>
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex gap-4 mb-4 items-center bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/5 transition-colors group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                      <p className="text-xs text-indigo-400 mt-1">{item.quantity} &times; ${item.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId)} 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-6 border-t border-white/10 mt-auto">
                <div className="flex justify-between font-bold text-xl mb-6 text-white">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button 
                  onClick={checkout} 
                  className="w-full glass-button text-white font-bold py-4 rounded-2xl hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Complete Checkout
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
