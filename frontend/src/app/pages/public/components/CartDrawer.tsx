// src/app/pages/public/components/CartDrawer.tsx

import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '@/types/public.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onUpdateQuantite: (key: string, q: number) => void;
  onRemove: (key: string) => void;
  onCommander: () => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(v);

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  total,
  onUpdateQuantite,
  onRemove,
  onCommander,
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col
          transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" size={22} />
            <h2 className="text-lg font-bold text-gray-800">Mon panier</h2>
            {items.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantite, 0)}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Liste articles */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <ShoppingBag size={48} className="opacity-30" />
              <p className="text-sm">Votre panier est vide</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                {/* Photo */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {item.produit_photo ? (
                    <img
                      src={item.produit_photo}
                      alt={item.produit_nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {item.produit_nom}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{item.variante_label}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-1">
                    {fmt(item.prix_unitaire * item.quantite)} FCFA
                  </p>

                  {/* Quantité */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantite(item.key, item.quantite - 1)}
                      className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantite}</span>
                    <button
                      onClick={() => onUpdateQuantite(item.key, item.quantite + 1)}
                      disabled={item.quantite >= item.stock_max}
                      className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => onRemove(item.key)}
                      className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <div className="flex items-center justify-between text-base font-bold text-gray-800">
              <span>Total</span>
              <span className="text-indigo-600">{fmt(total)} FCFA</span>
            </div>
            <button
              onClick={onCommander}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
              Commander via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
};