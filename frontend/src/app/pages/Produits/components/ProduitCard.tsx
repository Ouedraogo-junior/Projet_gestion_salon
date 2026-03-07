// src/app/pages/Produits/components/ProduitCard.tsx

import React, { useState } from 'react';
import { Edit, Trash2, Eye, ImageOff, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Badge } from './ui/Badge';
import type { Produit, ProduitVariante } from '@/types/produit.types';
import { Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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

// ============================================================
// HELPERS
// ============================================================

const getStockStatus = (stock: number, seuilAlerte?: number, seuilCritique?: number) => {
  if (seuilCritique && stock <= seuilCritique)
    return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' };
  if (seuilAlerte && stock <= seuilAlerte)
    return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' };
  return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' };
};

const getImageUrl = (photoUrl?: string) => {
  if (!photoUrl) return null;
  const cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
  return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
};

// ============================================================
// SOUS-COMPOSANT : LIGNE VARIANTE
// ============================================================

function VarianteLigne({
  variante,
  showStockVente,
  showStockSalon,
  showStockReserve,
  isGestionnaire,
  onEdit,
  produit,
}: {
  variante: ProduitVariante;
  showStockVente: boolean;
  showStockSalon: boolean;
  showStockReserve: boolean;
  isGestionnaire: boolean;
  onEdit: (produit: Produit) => void;
  produit: Produit;
}) {
  const statusVente       = getStockStatus(variante.stock_vente, variante.seuil_alerte, variante.seuil_critique);
  const statusUtilisation = getStockStatus(variante.stock_utilisation, variante.seuil_alerte_utilisation, variante.seuil_critique_utilisation);
  const statusReserve     = getStockStatus(variante.stock_reserve ?? 0, variante.seuil_alerte_reserve, variante.seuil_critique_reserve);

  const IconVente       = statusVente.icon;
  const IconUtilisation = statusUtilisation.icon;
  const IconReserve     = statusReserve.icon;

  const isReserveOnly = variante.type_stock_principal === 'reserve';

  return (
    <div className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50 hover:bg-blue-50/30 transition-colors">

      {/* Référence + statut validation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {variante.reference && (
            <span className="text-xs font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 truncate">
              {variante.reference}
            </span>
          )}
          {/* Attributs (ex: 10g, 20g, 30cm...) */}
          {variante.attributs && variante.attributs.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {variante.attributs.map((attr, i) => (
                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                  {attr.valeur_formatee || attr.valeur}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Badge validation */}
        {variante.statut_validation !== 'valide' && (
          <div className="flex-shrink-0">
            {variante.statut_validation === 'en_attente' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                <Clock size={10} /> Attente
              </span>
            )}
            {variante.statut_validation === 'rejete' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                <AlertCircle size={10} /> Rejeté
              </span>
            )}
          </div>
        )}
      </div>

      {/* Prix */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-green-600">
          {variante.prix_vente?.toLocaleString()} FCFA
        </span>
        {variante.en_promotion && variante.prix_promo && (
          <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
            PROMO {variante.prix_promo.toLocaleString()} FCFA
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          Achat : {variante.prix_achat?.toLocaleString()} FCFA
        </span>
      </div>

      {/* Stocks */}
      <div className={`grid gap-2 ${
        [showStockVente && !isReserveOnly, showStockSalon && !isReserveOnly, showStockReserve || isReserveOnly]
          .filter(Boolean).length === 3 ? 'grid-cols-3' : 'grid-cols-2'
      }`}>
        {showStockVente && !isReserveOnly && (
          <div className={`${statusVente.bg} p-1.5 rounded text-center`}>
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              <span className="text-xs text-gray-500">Vente</span>
              <IconVente size={11} className={statusVente.color} />
            </div>
            <p className="text-base font-bold text-blue-600">{variante.stock_vente}</p>
          </div>
        )}
        {showStockSalon && !isReserveOnly && (
          <div className={`${statusUtilisation.bg} p-1.5 rounded text-center`}>
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              <span className="text-xs text-gray-500">Salon</span>
              <IconUtilisation size={11} className={statusUtilisation.color} />
            </div>
            <p className="text-base font-bold text-green-600">{variante.stock_utilisation}</p>
          </div>
        )}
        {(showStockReserve || isReserveOnly) && (
          <div className={`${statusReserve.bg} p-1.5 rounded text-center`}>
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              <span className="text-xs text-gray-500">Réserve</span>
              <IconReserve size={11} className={statusReserve.color} />
            </div>
            <p className="text-base font-bold text-amber-600">{variante.stock_reserve ?? 0}</p>
          </div>
        )}
      </div>

      {/* Motif rejet */}
      {variante.statut_validation === 'rejete' && variante.motif_rejet && (
        <p className="text-xs text-red-500 italic truncate" title={variante.motif_rejet}>
          {variante.motif_rejet}
        </p>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function ProduitCard({
  produit,
  onEdit,
  onDelete,
  onToggleActive,
  onViewDetails,
  showStockVente = true,
  showStockSalon = true,
  showStockReserve = false,
}: ProduitCardProps) {
  const [imageError, setImageError]           = useState(false);
  const [variantesOuvertes, setVariantesOuvertes] = useState(false);
  const { user }                              = useAuth();
  const isGestionnaire                        = user?.role === 'gestionnaire';

  const variantes        = produit.variantes ?? [];
  const hasVariantes     = variantes.length > 1;
  const premiereVariante = variantes[0];

  // Agrégats sur toutes les variantes
  const stockTotalVente       = variantes.reduce((s, v) => s + (v.stock_vente ?? 0), 0);
  const stockTotalUtilisation = variantes.reduce((s, v) => s + (v.stock_utilisation ?? 0), 0);
  const stockTotalReserve     = variantes.reduce((s, v) => s + (v.stock_reserve ?? 0), 0);

  const prixMin = produit.prix_min ?? premiereVariante?.prix_vente;
  const prixMax = produit.prix_max ?? premiereVariante?.prix_vente;

  // Statut validation global : on prend le pire
  const statutGlobal = (() => {
    if (variantes.some(v => v.statut_validation === 'rejete'))    return 'rejete';
    if (variantes.some(v => v.statut_validation === 'en_attente')) return 'en_attente';
    return 'valide';
  })();

  const enPromo = variantes.some(v => v.en_promotion);

  const imageUrl = produit.photo_url ? getImageUrl(produit.photo_url) : null;

  // Peut modifier si gestionnaire OU si au moins une variante modifiable
  const peutModifier = isGestionnaire || variantes.some(v => v.statut_validation !== 'valide');

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
      onClick={() => onViewDetails(produit)}
    >
      {/* ---- PHOTO ---- */}
      <div className="relative h-44 bg-gradient-to-br from-blue-100 to-purple-100">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={produit.nom}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <ImageOff size={40} className="text-gray-300 mb-2" />
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

        {/* Badge variantes */}
        {hasVariantes && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs rounded-full font-medium">
              <Layers size={11} />
              {variantes.length} variantes
            </span>
          </div>
        )}

        {/* Badge promo */}
        {enPromo && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold">PROMO</span>
          </div>
        )}
      </div>

      {/* ---- BODY ---- */}
      <div className="p-4 space-y-3">

        {/* Nom + marque */}
        <div>
          <h3 className="font-bold text-lg truncate">{produit.nom}</h3>
          {produit.marque && <p className="text-xs text-gray-400">{produit.marque}</p>}
        </div>

        {/* Badge validation global */}
        {statutGlobal !== 'valide' && (
          <div>
            {statutGlobal === 'en_attente' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 w-full justify-center">
                <Clock size={12} /> En attente de validation
              </span>
            )}
            {statutGlobal === 'rejete' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 w-full justify-center">
                <AlertCircle size={12} /> Rejeté
              </span>
            )}
          </div>
        )}

        {/* Prix */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Prix vente</span>
          <span className="font-bold text-green-600">
            {prixMin && prixMax && prixMin !== prixMax
              ? `${prixMin.toLocaleString()} – ${prixMax.toLocaleString()} FCFA`
              : `${(prixMin ?? 0).toLocaleString()} FCFA`
            }
          </span>
        </div>

        {/* Stocks agrégés */}
        <div className={`grid gap-2 pt-2 border-t ${
          [showStockVente, showStockSalon, showStockReserve].filter(Boolean).length === 3
            ? 'grid-cols-3' : 'grid-cols-2'
        }`}>
          {showStockVente && (
            <div className="bg-blue-50 p-2 rounded text-center">
              <p className="text-xs text-gray-500 mb-0.5">Stock vente</p>
              <p className="text-lg font-bold text-blue-600">{stockTotalVente}</p>
            </div>
          )}
          {showStockSalon && (
            <div className="bg-green-50 p-2 rounded text-center">
              <p className="text-xs text-gray-500 mb-0.5">Stock salon</p>
              <p className="text-lg font-bold text-green-600">{stockTotalUtilisation}</p>
            </div>
          )}
          {showStockReserve && (
            <div className="bg-amber-50 p-2 rounded text-center">
              <p className="text-xs text-gray-500 mb-0.5">Réserve</p>
              <p className="text-lg font-bold text-amber-600">{stockTotalReserve}</p>
            </div>
          )}
        </div>

        {/* ---- SECTION VARIANTES DÉPLIABLE ---- */}
        {hasVariantes && (
          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setVariantesOuvertes(o => !o); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium text-indigo-700 transition-colors"
            >
              <span>Voir les {variantes.length} variantes</span>
              {variantesOuvertes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {variantesOuvertes && (
              <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                {variantes.map((variante) => (
                  <VarianteLigne
                    key={variante.id}
                    variante={variante}
                    showStockVente={showStockVente}
                    showStockSalon={showStockSalon}
                    showStockReserve={showStockReserve}
                    isGestionnaire={isGestionnaire}
                    onEdit={onEdit}
                    produit={produit}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Variante unique → afficher directement sans dépliable */}
        {!hasVariantes && premiereVariante && (
          <div onClick={(e) => e.stopPropagation()}>
            <VarianteLigne
              variante={premiereVariante}
              showStockVente={showStockVente}
              showStockSalon={showStockSalon}
              showStockReserve={showStockReserve}
              isGestionnaire={isGestionnaire}
              onEdit={onEdit}
              produit={produit}
            />
          </div>
        )}

        {/* Statut actif */}
        <div className="pt-2 border-t">
          <Badge variant={produit.is_active ? 'success' : 'danger'}>
            {produit.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(produit); }}
            className="flex-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm flex items-center justify-center gap-2"
          >
            <Eye size={16} /> Détails
          </button>

          {peutModifier && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(produit); }}
              className="flex-1 px-3 py-1.5 text-orange-600 hover:bg-orange-50 rounded text-sm flex items-center justify-center gap-2"
            >
              <Edit size={16} /> Modifier
            </button>
          )}

          {isGestionnaire && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleActive(produit.id); }}
              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
              title={produit.is_active ? 'Désactiver' : 'Activer'}
            >
              {produit.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
            </button>
          )}

          {isGestionnaire && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(produit.id); }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}