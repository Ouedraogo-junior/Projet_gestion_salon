// src/app/pages/public/components/ProduitCard.tsx
import React, { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { ProduitDetailsModal } from './ProduitDetailsModal';

interface ProduitCardProps {
  produit: {
    id: number;
    nom: string;
    description?: string;
    marque?: string;
    prix_vente: number;
    prix_promo?: number;
    photo_url?: string;
    stock_vente: number;
    prix_actuel: number;
    en_promo: boolean;
  };
  salonTel: string;
  salonNom: string;
}

export const ProduitCard: React.FC<ProduitCardProps> = ({ produit, salonTel, salonNom }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleCommander = () => {
    const message = `Bonjour ${salonNom}, je suis intéressé(e) par le produit : ${produit.nom}`;
    const whatsappUrl = `https://wa.me/${salonTel.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-indigo-100 to-purple-100">
          {produit.photo_url && !imageError ? (
            <img
              src={produit.photo_url}
              alt={produit.nom}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-2" />
                <p className="text-sm">Aucune photo</p>
              </div>
            </div>
          )}
          
          {/* Badge promo */}
          {produit.en_promo && produit.prix_promo && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              -{Math.round(((produit.prix_vente - produit.prix_promo) / produit.prix_vente) * 100)}%
            </div>
          )}
          
          {/* Badge stock */}
          {produit.stock_vente <= 5 && produit.stock_vente > 0 && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Plus que {produit.stock_vente}
            </div>
          )}
          
          {produit.stock_vente === 0 && (
            <div className="absolute top-3 left-3 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Épuisé
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Nom et marque */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">
              {produit.nom}
            </h3>
            {produit.marque && (
              <p className="text-sm text-gray-500">
                {produit.marque}
              </p>
            )}
          </div>

          {/* Description */}
          {produit.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {produit.description}
            </p>
          )}

          {/* Prix */}
          <div className="mt-auto">
            <div className="mb-4">
              {produit.en_promo && produit.prix_promo ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600">
                      {formatCurrency(produit.prix_promo)} FCFA
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(produit.prix_vente)} FCFA
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(produit.prix_vente)} FCFA
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Eye size={18} />
                <span className="text-sm">Détails</span>
              </button>
              
              <button
                onClick={handleCommander}
                disabled={produit.stock_vente === 0}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                <span className="text-sm">Commander</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      <ProduitDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        produitId={produit.id}
        salonTel={salonTel}
        salonNom={salonNom}
      />
    </>
  );
};