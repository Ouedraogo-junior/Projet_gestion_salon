// src/app/pages/Produits/components/ProduitRow.tsx

import React, { useState } from 'react';
import {
  Edit, Trash2, Eye, ImageOff, CheckCircle, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import { Badge } from './ui/Badge';
import type { Produit, ProduitVariante } from '@/types/produit.types';
import { Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProduitRowProps {
  produit: Produit;
  onEdit: (produit: Produit) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
  onViewDetails: (produit: Produit) => void;
  showStockVente?: boolean;
  showStockSalon?: boolean;
  showStockReserve?: boolean;
}

const getStockStatus = (stock: number, seuilAlerte?: number, seuilCritique?: number) => {
  if (seuilCritique && stock <= seuilCritique) return 'critique';
  if (seuilAlerte && stock <= seuilAlerte)     return 'alerte';
  return 'ok';
};

const StockBadge = ({
  label, value, status, color,
}: {
  label: string;
  value: number;
  status: 'ok' | 'alerte' | 'critique';
  color: 'blue' | 'green' | 'amber';
}) => {
  const colorMap = {
    blue:  { text: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-100' },
    green: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  };
  const c = colorMap[color];

  return (
    <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg border ${c.bg} ${c.border} min-w-[64px]`}>
      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-1">
        <span className={`text-base font-bold ${c.text}`}>{value}</span>
        {status === 'critique' && <AlertTriangle size={12} className="text-red-500" />}
        {status === 'alerte'   && <AlertTriangle size={12} className="text-yellow-500" />}
      </div>
    </div>
  );
};

const getImageUrl = (photoUrl?: string) => {
  if (!photoUrl) return null;
  const cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
  return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
};

export function ProduitRow({
  produit,
  onEdit,
  onDelete,
  onToggleActive,
  onViewDetails,
  showStockVente = true,
  showStockSalon = true,
  showStockReserve = false,
}: ProduitRowProps) {
  const [imageError, setImageError]               = useState(false);
  const [variantesOuvertes, setVariantesOuvertes] = useState(false);
  const { user }                                  = useAuth();
  const isGestionnaire                            = user?.role === 'gestionnaire';

  const variantes        = produit.variantes ?? [];
  const hasVariantes     = variantes.length > 1;
  const premiereVariante = variantes[0];

  const stockTotalVente       = variantes.reduce((s, v) => s + (v.stock_vente ?? 0), 0);
  const stockTotalUtilisation = variantes.reduce((s, v) => s + (v.stock_utilisation ?? 0), 0);
  const stockTotalReserve     = variantes.reduce((s, v) => s + (v.stock_reserve ?? 0), 0);

  const prixMin = produit.prix_min ?? premiereVariante?.prix_vente;
  const prixMax = produit.prix_max ?? premiereVariante?.prix_vente;

  const statutGlobal = (() => {
    if (variantes.some(v => v.statut_validation === 'rejete'))     return 'rejete';
    if (variantes.some(v => v.statut_validation === 'en_attente')) return 'en_attente';
    return 'valide';
  })();

  const enPromo    = variantes.some(v => v.en_promotion);
  const imageUrl   = produit.photo_url ? getImageUrl(produit.photo_url) : null;
  const peutModifier = isGestionnaire || variantes.some(v => v.statut_validation !== 'valide');

  // Statut stock global (pire des variantes)
  const worstVente = Math.min(...variantes.map(v =>
    getStockStatus(v.stock_vente, v.seuil_alerte, v.seuil_critique) === 'critique' ? 0
    : getStockStatus(v.stock_vente, v.seuil_alerte, v.seuil_critique) === 'alerte' ? 1 : 2
  ));
  const worstSalon = Math.min(...variantes.map(v =>
    getStockStatus(v.stock_utilisation, v.seuil_alerte_utilisation, v.seuil_critique_utilisation) === 'critique' ? 0
    : getStockStatus(v.stock_utilisation, v.seuil_alerte_utilisation, v.seuil_critique_utilisation) === 'alerte' ? 1 : 2
  ));
  const worstReserve = Math.min(...variantes.map(v =>
    getStockStatus(v.stock_reserve ?? 0, v.seuil_alerte_reserve, v.seuil_critique_reserve) === 'critique' ? 0
    : getStockStatus(v.stock_reserve ?? 0, v.seuil_alerte_reserve, v.seuil_critique_reserve) === 'alerte' ? 1 : 2
  ));
  const toStatus = (n: number): 'ok' | 'alerte' | 'critique' =>
    n === 0 ? 'critique' : n === 1 ? 'alerte' : 'ok';

  return (
    <div className="bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all">
      {/* ── LIGNE PRINCIPALE ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => onViewDetails(produit)}
      >
        {/* Miniature */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={produit.nom}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff size={18} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Nom + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 truncate">{produit.nom}</span>

            {produit.categorie && (
              <span className="hidden sm:inline text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {produit.categorie.nom}
              </span>
            )}

            {hasVariantes && (
              <span className="inline-flex items-center gap-0.5 text-[11px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                <Layers size={10} />
                {variantes.length}
              </span>
            )}

            {enPromo && (
              <span className="text-[11px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">PROMO</span>
            )}

            {statutGlobal === 'en_attente' && (
              <span className="inline-flex items-center gap-0.5 text-[11px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                <Clock size={10} /> Attente
              </span>
            )}
            {statutGlobal === 'rejete' && (
              <span className="inline-flex items-center gap-0.5 text-[11px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                <AlertCircle size={10} /> Rejeté
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-0.5">
            {produit.marque && (
              <span className="text-xs text-gray-400">{produit.marque}</span>
            )}
            <span className="text-xs font-semibold text-green-600">
              {prixMin && prixMax && prixMin !== prixMax
                ? `${prixMin.toLocaleString()} – ${prixMax.toLocaleString()} FCFA`
                : `${(prixMin ?? 0).toLocaleString()} FCFA`}
            </span>
          </div>
        </div>

        {/* Stocks */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {showStockVente && (
            <StockBadge label="Vente" value={stockTotalVente}       status={toStatus(worstVente)}   color="blue"  />
          )}
          {showStockSalon && (
            <StockBadge label="Salon" value={stockTotalUtilisation} status={toStatus(worstSalon)}   color="green" />
          )}
          {showStockReserve && (
            <StockBadge label="Réserve" value={stockTotalReserve}   status={toStatus(worstReserve)} color="amber" />
          )}
        </div>

        {/* Statut + Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2" onClick={e => e.stopPropagation()}>
          <Badge variant={produit.is_active ? 'success' : 'danger'} className="hidden sm:inline-flex text-[11px]">
            {produit.is_active ? 'Actif' : 'Inactif'}
          </Badge>

          <button
            onClick={() => onViewDetails(produit)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Détails"
          >
            <Eye size={15} />
          </button>

          {peutModifier && (
            <button
              onClick={() => onEdit(produit)}
              className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit size={15} />
            </button>
          )}

          {isGestionnaire && (
            <button
              onClick={() => onToggleActive(produit.id)}
              className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
              title={produit.is_active ? 'Désactiver' : 'Activer'}
            >
              {produit.is_active ? <XCircle size={15} /> : <CheckCircle size={15} />}
            </button>
          )}

          {isGestionnaire && (
            <button
              onClick={() => onDelete(produit.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 size={15} />
            </button>
          )}

          {/* Toggle variantes */}
          {hasVariantes && (
            <button
              onClick={() => setVariantesOuvertes(o => !o)}
              className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Voir variantes"
            >
              {variantesOuvertes ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Stocks mobile */}
      <div className="flex md:hidden items-center gap-2 px-4 pb-3 flex-wrap">
        {showStockVente && (
          <StockBadge label="Vente" value={stockTotalVente}       status={toStatus(worstVente)}   color="blue"  />
        )}
        {showStockSalon && (
          <StockBadge label="Salon" value={stockTotalUtilisation} status={toStatus(worstSalon)}   color="green" />
        )}
        {showStockReserve && (
          <StockBadge label="Réserve" value={stockTotalReserve}   status={toStatus(worstReserve)} color="amber" />
        )}
      </div>

      {/* ── VARIANTES DÉPLIÉES ── */}
      {variantesOuvertes && hasVariantes && (
        <div
          className="border-t border-gray-100 px-4 pb-3 pt-2 space-y-2"
          onClick={e => e.stopPropagation()}
        >
          {variantes.map(variante => (
            <VarianteRow
              key={variante.id}
              variante={variante}
              showStockVente={showStockVente}
              showStockSalon={showStockSalon}
              showStockReserve={showStockReserve}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── LIGNE VARIANTE ──────────────────────────────────────────

function VarianteRow({
  variante,
  showStockVente,
  showStockSalon,
  showStockReserve,
}: {
  variante: ProduitVariante;
  showStockVente: boolean;
  showStockSalon: boolean;
  showStockReserve: boolean;
}) {
  const isReserveOnly = variante.type_stock_principal === 'reserve';
  const statusVente       = getStockStatus(variante.stock_vente,         variante.seuil_alerte,             variante.seuil_critique);
  const statusUtilisation = getStockStatus(variante.stock_utilisation,   variante.seuil_alerte_utilisation, variante.seuil_critique_utilisation);
  const statusReserve     = getStockStatus(variante.stock_reserve ?? 0,  variante.seuil_alerte_reserve,     variante.seuil_critique_reserve);

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-sm flex-wrap">
      {/* Référence */}
      {variante.reference && (
        <span className="font-mono text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">
          {variante.reference}
        </span>
      )}

      {/* Attributs */}
      {variante.attributs?.map((attr, i) => (
        <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
          {attr.valeur_formatee || attr.valeur}
        </span>
      ))}

      {/* Statut validation */}
      {variante.statut_validation === 'en_attente' && (
        <span className="inline-flex items-center gap-0.5 text-[11px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
          <Clock size={10} /> Attente
        </span>
      )}
      {variante.statut_validation === 'rejete' && (
        <span className="inline-flex items-center gap-0.5 text-[11px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
          <AlertCircle size={10} /> Rejeté
        </span>
      )}

      {/* Prix */}
      <span className="text-xs font-bold text-green-600 ml-1">
        {variante.prix_vente?.toLocaleString()} FCFA
      </span>
      {variante.en_promotion && variante.prix_promo && (
        <span className="text-xs font-bold text-red-500">
          → {variante.prix_promo.toLocaleString()} FCFA
        </span>
      )}

      {/* Stocks */}
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        {showStockVente && !isReserveOnly && (
          <StockBadge label="Vente" value={variante.stock_vente} status={statusVente as any} color="blue" />
        )}
        {showStockSalon && !isReserveOnly && (
          <StockBadge label="Salon" value={variante.stock_utilisation} status={statusUtilisation as any} color="green" />
        )}
        {(showStockReserve || isReserveOnly) && (
          <StockBadge label="Réserve" value={variante.stock_reserve ?? 0} status={statusReserve as any} color="amber" />
        )}
      </div>
    </div>
  );
}