// src/app/pages/Produits/components/ProduitCard.tsx

import React, { useState } from 'react';
import { Edit, Trash2, Eye, ImageOff, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/Badge';
import type { Produit } from '@/types/produit.types';

interface ProduitCardProps {
  produit: Produit;
  onEdit: (produit: Produit) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
  onViewDetails: (produit: Produit) => void;
  showStockVente?: boolean;
  showStockSalon?: boolean;
  showStockReserve?: boolean;
}

export function ProduitCard({
  produit,
  onEdit,
  onDelete,
  onToggleActive,
  onViewDetails,
  showStockVente = true,
  showStockSalon = true,
  showStockReserve = false
}: ProduitCardProps) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    const cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  const getStockStatus = (stock: number, seuil_alerte: number, seuil_critique: number) => {
    if (stock <= seuil_critique) {
      return { variant: 'danger', label: 'Critique', icon: AlertTriangle, color: 'text-red-500' };
    }
    if (stock <= seuil_alerte) {
      return { variant: 'warning', label: 'Alerte', icon: AlertTriangle, color: 'text-yellow-500' };
    }
    return { variant: 'success', label: 'Normal', icon: CheckCircle, color: 'text-green-500' };
  };

  const statusVente = getStockStatus(
    produit.stock_vente,
    produit.seuil_alerte,
    produit.seuil_critique
  );

  const statusUtilisation = getStockStatus(
    produit.stock_utilisation,
    produit.seuil_alerte_utilisation,
    produit.seuil_critique_utilisation
  );

   const statusReserve = (produit.seuil_alerte_reserve && produit.seuil_critique_reserve) 
    ? getStockStatus(
        produit.stock_reserve || 0,
        produit.seuil_alerte_reserve,
        produit.seuil_critique_reserve
      )
    : { variant: 'success', label: 'Normal', icon: CheckCircle, color: 'text-green-500' }; // ← Valeur par défaut

    

  const imageUrl = produit.photo_url ? getImageUrl(produit.photo_url) : null;
  const StatusIconVente = statusVente.icon;
  const StatusIconUtilisation = statusUtilisation.icon;
  const StatusIconReserve = statusReserve?.icon;

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer group"
      onClick={() => onViewDetails(produit)}
    >
      {/* Photo du produit */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={produit.nom}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <ImageOff size={48} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Aucune photo</p>
          </div>
        )}

        {/* Badge catégorie */}
        {produit.categorie && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
              {produit.categorie.nom}
            </span>
          </div>
        )}

        {/* Badge promotion */}
        {produit.prix_promo && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold">
              PROMO
            </span>
          </div>
        )}
      </div>

      {/* Informations du produit */}
      <div className="p-4 space-y-3">
        {/* Nom et référence */}
        <div>
          <h3 className="font-bold text-lg truncate">{produit.nom}</h3>
          {produit.reference && (
            <p className="text-sm text-gray-500">{produit.reference}</p>
          )}
          {produit.marque && (
            <p className="text-xs text-gray-400">{produit.marque}</p>
          )}
        </div>

        {/* Prix */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Prix vente</span>
            <span className="font-bold text-green-600">
              {produit.prix_vente.toLocaleString()} FCFA
            </span>
          </div>
          {produit.prix_promo && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prix promo</span>
              <span className="font-bold text-red-600">
                {produit.prix_promo.toLocaleString()} FCFA
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Prix achat</span>
            <span className="text-sm text-gray-600">
              {produit.prix_achat.toLocaleString()} FCFA
            </span>
          </div>
        </div>

        {/* Stocks */}
        <div className={`grid ${
        [showStockVente, showStockSalon, showStockReserve].filter(Boolean).length === 3 
          ? 'grid-cols-3' 
          : 'grid-cols-2'
          } gap-2 pt-2 border-t`}>
          {showStockVente && (
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-gray-600">Stock vente</span>
                <StatusIconVente size={14} className={statusVente.color} />
              </div>
              <p className="text-lg font-bold text-blue-600">
                {produit.stock_vente}
              </p>
            </div>
          )}
          {showStockSalon && (
            <div className="bg-green-50 p-2 rounded">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-gray-600">Stock salon</span>
                <StatusIconUtilisation size={14} className={statusUtilisation.color} />
              </div>
              <p className="text-lg font-bold text-green-600">
                {produit.stock_utilisation}
              </p>
            </div>
          )}

          {showStockReserve && (
              <div className="bg-amber-50 p-2 rounded">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs text-gray-600">Réserve</span>
                  {statusReserve && <StatusIconReserve size={14} className={statusReserve.color} />}
                </div>
                <p className="text-lg font-bold text-amber-600">
                  {produit.stock_reserve || 0}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statut */}
        <div className="pt-2 border-t">
          <Badge variant={produit.is_active ? 'success' : 'danger'}>
            {produit.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(produit);
            }}
            className="flex-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm flex items-center justify-center gap-2"
            title="Voir détails"
          >
            <Eye size={16} />
            Détails
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(produit);
            }}
            className="flex-1 px-3 py-1.5 text-orange-600 hover:bg-orange-50 rounded text-sm flex items-center justify-center gap-2"
            title="Modifier"
          >
            <Edit size={16} />
            Modifier
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(produit.id);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
            title={produit.is_active ? 'Désactiver' : 'Activer'}
          >
            {produit.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(produit.id);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
  );
}