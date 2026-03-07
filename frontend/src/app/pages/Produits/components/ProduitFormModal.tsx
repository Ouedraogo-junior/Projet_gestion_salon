// src/app/pages/Produits/components/ProduitFormModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Textarea } from './ui/Textarea';
import { produitsApi } from '@/services/produitsApi';
import { Upload, X, Camera, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Produit, ProduitVariante, Categorie } from '@/types/produit.types';
import { tokenStorage } from '@/utils/tokenStorage';
import { DEVISES, MOYENS_PAIEMENT } from '@/constants/devises';

// ============================================================
// TYPES
// ============================================================

interface VarianteEditForm {
  id?: number; // undefined = nouvelle variante
  localId: string;
  reference: string;
  type_stock_principal: string;
  devise_achat: string;
  taux_change: number;
  prix_achat_stock_total: string;
  quantite_stock_commande: string;
  frais_cmb: string;
  frais_transit: string;
  frais_bancaires: string;
  frais_courtier: string;
  frais_transport_local: string;
  cbm: string;
  poids_kg: string;
  moyen_paiement: string;
  date_commande: string;
  date_reception: string;
  prix_achat: string;
  prix_vente: string;
  prix_promo: string;
  date_debut_promo: string;
  date_fin_promo: string;
  stock_vente: string;
  stock_utilisation: string;
  stock_reserve: string;
  seuil_alerte: string;
  seuil_critique: string;
  seuil_alerte_utilisation: string;
  seuil_critique_utilisation: string;
  seuil_alerte_reserve: string;
  seuil_critique_reserve: string;
  is_active: boolean;
  attributs: Record<number, string>;
  collapsed: boolean;
}

interface ProduitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  produit?: Produit | null;
  categories: Categorie[];
  modeValidation?: boolean;
}

// ============================================================
// HELPERS
// ============================================================

const varianteToForm = (v: ProduitVariante): VarianteEditForm => ({
  id:                         v.id,
  localId:                    crypto.randomUUID(),
  reference:                  v.reference ?? '',
  type_stock_principal:       v.type_stock_principal ?? 'mixte',
  devise_achat:               v.devise_achat ?? 'FCFA',
  taux_change:                v.taux_change ?? 1,
  prix_achat_stock_total:     v.prix_achat_stock_total?.toString() ?? '',
  quantite_stock_commande:    v.quantite_stock_commande?.toString() ?? '',
  frais_cmb:                  v.frais_cmb?.toString() ?? '',
  frais_transit:              v.frais_transit?.toString() ?? '',
  frais_bancaires:            v.frais_bancaires?.toString() ?? '',
  frais_courtier:             v.frais_courtier?.toString() ?? '',
  frais_transport_local:      v.frais_transport_local?.toString() ?? '',
  cbm:                        v.cbm?.toString() ?? '',
  poids_kg:                   v.poids_kg?.toString() ?? '',
  moyen_paiement:             v.moyen_paiement ?? '',
  date_commande:              v.date_commande ?? '',
  date_reception:             v.date_reception ?? '',
  prix_achat:                 v.prix_achat?.toString() ?? '',
  prix_vente:                 v.prix_vente?.toString() ?? '',
  prix_promo:                 v.prix_promo?.toString() ?? '',
  date_debut_promo:           v.date_debut_promo ?? '',
  date_fin_promo:             v.date_fin_promo ?? '',
  stock_vente:                v.stock_vente?.toString() ?? '0',
  stock_utilisation:          v.stock_utilisation?.toString() ?? '0',
  stock_reserve:              v.stock_reserve?.toString() ?? '0',
  seuil_alerte:               v.seuil_alerte?.toString() ?? '',
  seuil_critique:             v.seuil_critique?.toString() ?? '',
  seuil_alerte_utilisation:   v.seuil_alerte_utilisation?.toString() ?? '',
  seuil_critique_utilisation: v.seuil_critique_utilisation?.toString() ?? '',
  seuil_alerte_reserve:       v.seuil_alerte_reserve?.toString() ?? '',
  seuil_critique_reserve:     v.seuil_critique_reserve?.toString() ?? '',
  is_active:                  v.is_active ?? true,
  attributs:                  v.attributs
    ? Object.fromEntries(v.attributs.map(a => [a.attribut_id, a.valeur]))
    : {},
  collapsed: false,
});

const defaultVariante = (): VarianteEditForm => ({
  localId:                    crypto.randomUUID(),
  reference:                  '',
  type_stock_principal:       'mixte',
  devise_achat:               'FCFA',
  taux_change:                1,
  prix_achat_stock_total:     '',
  quantite_stock_commande:    '',
  frais_cmb:                  '',
  frais_transit:              '',
  frais_bancaires:            '',
  frais_courtier:             '',
  frais_transport_local:      '',
  cbm:                        '',
  poids_kg:                   '',
  moyen_paiement:             '',
  date_commande:              '',
  date_reception:             '',
  prix_achat:                 '',
  prix_vente:                 '',
  prix_promo:                 '',
  date_debut_promo:           '',
  date_fin_promo:             '',
  stock_vente:                '',
  stock_utilisation:          '',
  stock_reserve:              '',
  seuil_alerte:               '',
  seuil_critique:             '',
  seuil_alerte_utilisation:   '',
  seuil_critique_utilisation: '',
  seuil_alerte_reserve:       '',
  seuil_critique_reserve:     '',
  is_active:                  true,
  attributs:                  {},
  collapsed:                  false,
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);

// ============================================================
// SOUS-COMPOSANT VARIANTE
// ============================================================

interface VarianteFormSectionProps {
  variante: VarianteEditForm;
  index: number;
  total: number;
  attributsCategorie: any[];
  onChange: (localId: string, field: keyof VarianteEditForm, value: any) => void;
  onChangeAttribut: (localId: string, attributId: number, value: string) => void;
  onRemove: (localId: string) => void;
  onToggleCollapse: (localId: string) => void;
}

function VarianteFormSection({
  variante, index, total, attributsCategorie,
  onChange, onChangeAttribut, onRemove, onToggleCollapse,
}: VarianteFormSectionProps) {
  const isReserve          = variante.type_stock_principal === 'reserve';
  const showStockVente     = !isReserve && ['vente', 'mixte'].includes(variante.type_stock_principal);
  const showStockUtil      = !isReserve && ['utilisation', 'mixte'].includes(variante.type_stock_principal);

  const f = (field: keyof VarianteEditForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(variante.localId, field, e.target.value);

  // Recalcul prix achat auto
  useEffect(() => {
    const stockTotal = parseFloat(variante.prix_achat_stock_total) || 0;
    const quantite   = parseFloat(variante.quantite_stock_commande) || 0;
    const frais      = (parseFloat(variante.frais_cmb) || 0)
                     + (parseFloat(variante.frais_transit) || 0)
                     + (parseFloat(variante.frais_bancaires) || 0)
                     + (parseFloat(variante.frais_courtier) || 0)
                     + (parseFloat(variante.frais_transport_local) || 0);
    if (quantite > 0) {
      onChange(variante.localId, 'prix_achat',
        ((stockTotal * variante.taux_change + frais) / quantite).toFixed(2));
    } else if (stockTotal === 0 && frais === 0) {
      onChange(variante.localId, 'prix_achat', '');
    }
  }, [
    variante.prix_achat_stock_total, variante.quantite_stock_commande,
    variante.frais_cmb, variante.frais_transit, variante.frais_bancaires,
    variante.frais_courtier, variante.frais_transport_local, variante.taux_change,
  ]);

  // Sync stock_reserve avec quantite si type reserve
  useEffect(() => {
    if (variante.type_stock_principal === 'reserve' && variante.quantite_stock_commande) {
      onChange(variante.localId, 'stock_reserve', variante.quantite_stock_commande);
    }
  }, [variante.type_stock_principal, variante.quantite_stock_commande]);

  // Sync taux_change avec devise
  useEffect(() => {
    const devise = DEVISES.find(d => d.value === variante.devise_achat);
    if (devise) onChange(variante.localId, 'taux_change', devise.tauxVersFCFA);
  }, [variante.devise_achat]);

  const label = variante.reference
    ? `Variante ${index + 1} — ${variante.reference}`
    : `Variante ${index + 1}`;

  return (
    <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
        onClick={() => onToggleCollapse(variante.localId)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-blue-800">{label}</span>
          {variante.prix_vente && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {formatCurrency(parseFloat(variante.prix_vente))} FCFA
            </span>
          )}
          {variante.id && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              ID #{variante.id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(variante.localId); }}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {variante.collapsed
            ? <ChevronDown className="w-4 h-4 text-blue-600" />
            : <ChevronUp className="w-4 h-4 text-blue-600" />
          }
        </div>
      </div>

      {/* Corps */}
      {!variante.collapsed && (
        <div className="p-5 space-y-5 bg-white">

          {/* Référence + Type stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <Input value={variante.reference} onChange={f('reference')} placeholder="Référence unique" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de stock <span className="text-red-500">*</span>
              </label>
              <select
                value={variante.type_stock_principal}
                onChange={f('type_stock_principal')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="vente">Vente uniquement</option>
                <option value="utilisation">Utilisation salon uniquement</option>
                <option value="mixte">Mixte (vente + salon)</option>
                <option value="reserve">Réserve</option>
              </select>
            </div>
          </div>

          {/* Attributs */}
          {attributsCategorie.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 rounded-lg border-l-4 border-indigo-400">
                📋 Caractéristiques
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {attributsCategorie.map((attr) => (
                  <div key={attr.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {attr.nom}
                      {attr.pivot?.obligatoire && <span className="text-red-500">*</span>}
                      {attr.unite && <span className="text-gray-400 text-xs ml-1">({attr.unite})</span>}
                    </label>
                    {attr.type_valeur === 'liste' ? (
                      <select
                        value={variante.attributs[attr.id] || ''}
                        onChange={(e) => onChangeAttribut(variante.localId, attr.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={attr.pivot?.obligatoire}
                      >
                        <option value="">Sélectionnez...</option>
                        {attr.valeurs_possibles?.map((val: string, idx: number) => (
                          <option key={idx} value={val}>{val}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={attr.type_valeur === 'nombre' ? 'number' : 'text'}
                        value={variante.attributs[attr.id] || ''}
                        onChange={(e) => onChangeAttribut(variante.localId, attr.id, e.target.value)}
                        placeholder={attr.unite ? `Valeur en ${attr.unite}` : ''}
                        required={attr.pivot?.obligatoire}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commande & Import */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 rounded-lg border-l-4 border-amber-400">
              📦 Commande & Import
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de commande</label>
                <Input type="date" value={variante.date_commande} onChange={f('date_commande')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de réception</label>
                <Input type="date" value={variante.date_reception} onChange={f('date_reception')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moyen de paiement</label>
                <select value={variante.moyen_paiement} onChange={f('moyen_paiement')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Sélectionnez...</option>
                  {MOYENS_PAIEMENT.map(mp => (
                    <option key={mp.value} value={mp.value}>{mp.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devise d'achat</label>
                <select value={variante.devise_achat} onChange={f('devise_achat')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {DEVISES.map(d => (
                    <option key={d.value} value={d.value}>{d.label} ({d.symbole})</option>
                  ))}
                </select>
              </div>
            </div>

            {variante.devise_achat !== 'FCFA' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux de change : 1 {DEVISES.find(d => d.value === variante.devise_achat)?.symbole} = ? FCFA
                </label>
                <div className="flex gap-2 items-center">
                  <Input type="number"
                    value={variante.taux_change}
                    onChange={(e) => onChange(variante.localId, 'taux_change', parseFloat(e.target.value) || 1)}
                    min="0" step="0.001" className="w-32"
                  />
                  <span className="text-sm text-gray-600">FCFA</span>
                  <button type="button"
                    onClick={() => {
                      const d = DEVISES.find(d => d.value === variante.devise_achat);
                      if (d) onChange(variante.localId, 'taux_change', d.tauxVersFCFA);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >Réinitialiser</button>
                </div>
              </div>
            )}
          </div>

          {/* Prix et coûts */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border-l-4 border-green-400">
              💰 Prix et coûts
            </h4>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix achat stock total</label>
                  <div className="flex gap-1">
                    <Input type="number" value={variante.prix_achat_stock_total}
                      onChange={f('prix_achat_stock_total')} min="0" step="0.01" placeholder="0" />
                    <span className="px-2 py-2 bg-gray-100 border border-gray-300 rounded text-xs text-gray-600 flex items-center">
                      {DEVISES.find(d => d.value === variante.devise_achat)?.symbole || 'FCFA'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité commandée</label>
                  <Input type="number" value={variante.quantite_stock_commande}
                    onChange={f('quantite_stock_commande')} min="0" step="1" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CBM (m³)</label>
                  <Input type="number" value={variante.cbm} onChange={f('cbm')} min="0" step="0.0001" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais CMB (FCFA)</label>
                  <Input type="number" value={variante.frais_cmb} onChange={f('frais_cmb')} min="0" step="0.01" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais transit/douane (FCFA)</label>
                  <Input type="number" value={variante.frais_transit} onChange={f('frais_transit')} min="0" step="0.01" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais bancaires (FCFA)</label>
                  <Input type="number" value={variante.frais_bancaires} onChange={f('frais_bancaires')} min="0" step="0.01" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais courtier (FCFA)</label>
                  <Input type="number" value={variante.frais_courtier} onChange={f('frais_courtier')} min="0" step="0.01" placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais transport local (FCFA)</label>
                  <Input type="number" value={variante.frais_transport_local}
                    onChange={f('frais_transport_local')} min="0" step="0.01" placeholder="0" />
                </div>
              </div>

              {(variante.prix_achat_stock_total || variante.frais_cmb || variante.frais_transit) && (
                <div className="pt-3 border-t border-blue-300 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Coût total du stock (FCFA)</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(
                      (parseFloat(variante.prix_achat_stock_total) || 0) * variante.taux_change
                      + (parseFloat(variante.frais_cmb) || 0)
                      + (parseFloat(variante.frais_transit) || 0)
                      + (parseFloat(variante.frais_bancaires) || 0)
                      + (parseFloat(variante.frais_courtier) || 0)
                      + (parseFloat(variante.frais_transport_local) || 0)
                    )} FCFA
                  </span>
                </div>
              )}
            </div>

            {/* Prix unitaire */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix d'achat unitaire (FCFA) <span className="text-red-500">*</span>
                </label>
                <Input type="number" value={variante.prix_achat} onChange={f('prix_achat')}
                  required min="0" step="0.01" placeholder="Calculé automatiquement" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de vente (FCFA) <span className="text-red-500">*</span>
                </label>
                <Input type="number" value={variante.prix_vente} onChange={f('prix_vente')}
                  required min="0" step="0.01" placeholder="0" />
              </div>
            </div>

            {/* Marge */}
            {variante.prix_achat && variante.prix_vente && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Marge unitaire</span>
                  <span className="font-bold text-green-600">
                    {(() => {
                      const marge    = parseFloat(variante.prix_vente) - parseFloat(variante.prix_achat);
                      const margePct = (marge / parseFloat(variante.prix_achat)) * 100;
                      return `${formatCurrency(marge)} FCFA (${margePct.toFixed(1)}%)`;
                    })()}
                  </span>
                </div>
                {/* Gain stock actuel (variante existante) */}
                {variante.id && (
                  <div className="flex justify-between items-center pt-2 border-t border-green-200 mt-2">
                    <span className="text-sm text-gray-600">
                      Gain stock actuel ({
                        (parseInt(variante.stock_vente) || 0)
                        + (parseInt(variante.stock_utilisation) || 0)
                        + (parseInt(variante.stock_reserve) || 0)
                      } unités)
                    </span>
                    <span className="font-bold text-teal-600">
                      {formatCurrency(
                        (parseFloat(variante.prix_vente) - parseFloat(variante.prix_achat)) *
                        ((parseInt(variante.stock_vente) || 0)
                          + (parseInt(variante.stock_utilisation) || 0)
                          + (parseInt(variante.stock_reserve) || 0))
                      )} FCFA
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Prix promo */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix promo (FCFA)</label>
                <Input type="number" value={variante.prix_promo} onChange={f('prix_promo')} min="0" step="0.01" placeholder="Optionnel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Début promo</label>
                <Input type="date" value={variante.date_debut_promo} onChange={f('date_debut_promo')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin promo</label>
                <Input type="date" value={variante.date_fin_promo} onChange={f('date_fin_promo')} />
              </div>
            </div>
          </div>

          {/* Stocks et seuils */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-teal-50 to-cyan-50 px-3 py-2 rounded-lg border-l-4 border-teal-400">
              📊 Stocks et seuils
            </h4>

            {isReserve ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  ℹ️ Stock réserve — utilisez les transferts pour l'allouer.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité en réserve</label>
                  <Input type="number" value={variante.stock_reserve} onChange={f('stock_reserve')} min="0" placeholder="0" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seuil alerte réserve</label>
                    <Input type="number" value={variante.seuil_alerte_reserve} onChange={f('seuil_alerte_reserve')} min="0" placeholder="Optionnel" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seuil critique réserve</label>
                    <Input type="number" value={variante.seuil_critique_reserve} onChange={f('seuil_critique_reserve')} min="0" placeholder="Optionnel" />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`grid ${showStockVente && showStockUtil ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {showStockVente && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-gray-700 bg-blue-100 px-3 py-1.5 rounded">🛒 Stock Vente</h5>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantité</label>
                      <Input type="number" value={variante.stock_vente} onChange={f('stock_vente')} min="0" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Seuil alerte</label>
                      <Input type="number" value={variante.seuil_alerte} onChange={f('seuil_alerte')} min="0" placeholder="Optionnel" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Seuil critique</label>
                      <Input type="number" value={variante.seuil_critique} onChange={f('seuil_critique')} min="0" placeholder="Optionnel" />
                    </div>
                  </div>
                )}
                {showStockUtil && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-gray-700 bg-purple-100 px-3 py-1.5 rounded">💇‍♀️ Stock Salon</h5>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantité</label>
                      <Input type="number" value={variante.stock_utilisation} onChange={f('stock_utilisation')} min="0" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Seuil alerte</label>
                      <Input type="number" value={variante.seuil_alerte_utilisation} onChange={f('seuil_alerte_utilisation')} min="0" placeholder="Optionnel" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Seuil critique</label>
                      <Input type="number" value={variante.seuil_critique_utilisation} onChange={f('seuil_critique_utilisation')} min="0" placeholder="Optionnel" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function ProduitFormModal({
  isOpen, onClose, onSuccess, produit, categories, modeValidation = false,
}: ProduitFormModalProps) {

  // ---- Produit parent ----
  const [produitData, setProduitData] = useState({
    nom:            '',
    description:    '',
    categorie_id:   '',
    marque:         '',
    fournisseur:    '',
    visible_public: true,
  });

  // ---- Variantes ----
  const [variantes, setVariantes] = useState<VarianteEditForm[]>([defaultVariante()]);

  // ---- Photo ----
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Attributs catégorie ----
  const [attributsCategorie, setAttributsCategorie] = useState<any[]>([]);

  // ---- UI ----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState('');

  // ============================================================
  // INIT depuis produit existant
  // ============================================================

  useEffect(() => {
    if (produit) {
      setProduitData({
        nom:            produit.nom ?? '',
        description:    produit.description ?? '',
        categorie_id:   produit.categorie_id?.toString() ?? '',
        marque:         produit.marque ?? '',
        fournisseur:    produit.fournisseur ?? '',
        visible_public: produit.visible_public ?? true,
      });

      if (produit.variantes && produit.variantes.length > 0) {
        setVariantes(produit.variantes.map(varianteToForm));
      } else {
        setVariantes([defaultVariante()]);
      }

      if (produit.photo_url) {
        const cleanUrl = produit.photo_url.replace(/^(storage\/)+/, '');
        setPhotoPreview(`${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`);
      } else {
        setPhotoPreview(null);
      }
    } else {
      setProduitData({ nom: '', description: '', categorie_id: '', marque: '', fournisseur: '', visible_public: true });
      setVariantes([defaultVariante()]);
      setPhotoFile(null);
      setPhotoPreview(null);
    }
    setError('');
  }, [produit, isOpen]);

  // ============================================================
  // ATTRIBUTS CATÉGORIE
  // ============================================================

  useEffect(() => {
    const load = async () => {
      if (!produitData.categorie_id) { setAttributsCategorie([]); return; }
      try {
        const token = tokenStorage.getToken();
        const res   = await fetch(
          `${import.meta.env.VITE_API_URL}/api/categories/${produitData.categorie_id}`,
          { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
        );
        const data = await res.json();
        if (data.success && data.data.attributs) {
          setAttributsCategorie(data.data.attributs);
        } else {
          setAttributsCategorie([]);
        }
      } catch { setAttributsCategorie([]); }
    };
    load();
  }, [produitData.categorie_id]);

  // ============================================================
  // HANDLERS VARIANTES
  // ============================================================

  const handleVarianteChange = (localId: string, field: keyof VarianteEditForm, value: any) => {
    setVariantes(prev => prev.map(v => v.localId === localId ? { ...v, [field]: value } : v));
  };

  const handleVarianteAttribut = (localId: string, attributId: number, value: string) => {
    setVariantes(prev => prev.map(v =>
      v.localId === localId ? { ...v, attributs: { ...v.attributs, [attributId]: value } } : v
    ));
  };

  const handleAddVariante = () => {
    const premiere = variantes[0];
    setVariantes(prev => [...prev, {
      ...defaultVariante(),
      devise_achat:         premiere.devise_achat,
      taux_change:          premiere.taux_change,
      type_stock_principal: premiere.type_stock_principal,
      collapsed:            false,
    }]);
  };

  const handleRemoveVariante = (localId: string) => {
    setVariantes(prev => prev.filter(v => v.localId !== localId));
  };

  const handleToggleCollapse = (localId: string) => {
    setVariantes(prev => prev.map(v =>
      v.localId === localId ? { ...v, collapsed: !v.collapsed } : v
    ));
  };

  // ============================================================
  // PHOTO
  // ============================================================

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Veuillez sélectionner une image valide'); return; }
    if (file.size > 5 * 1024 * 1024) { setError("L'image ne doit pas dépasser 5 MB"); return; }
    setPhotoFile(file);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteExistingPhoto = async () => {
    if (!produit || !confirm('Supprimer la photo actuelle ?')) return;
    try {
      setIsUploadingPhoto(true);
      await produitsApi.produits.deletePhoto(produit.id);
      setPhotoPreview(null);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la suppression');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        nom:            produitData.nom,
        description:    produitData.description,
        categorie_id:   parseInt(produitData.categorie_id),
        marque:         produitData.marque,
        fournisseur:    produitData.fournisseur,
        visible_public: produitData.visible_public,
        variantes: variantes.map(v => {
          const isReserve    = v.type_stock_principal === 'reserve';
          const stockTotal   = parseFloat(v.prix_achat_stock_total) || 0;
          const quantite     = parseFloat(v.quantite_stock_commande) || 0;
          const stockFCFA    = stockTotal * v.taux_change;
          const montantTotal = stockFCFA
            + (parseFloat(v.frais_cmb) || 0)
            + (parseFloat(v.frais_transit) || 0)
            + (parseFloat(v.frais_bancaires) || 0)
            + (parseFloat(v.frais_courtier) || 0)
            + (parseFloat(v.frais_transport_local) || 0);

          return {
            // id présent = mise à jour, absent = création
            ...(v.id ? { id: v.id } : {}),
            reference:                 v.reference || null,
            type_stock_principal:      v.type_stock_principal,
            devise_achat:              v.devise_achat,
            taux_change:               v.taux_change,
            prix_achat_stock_total:    stockTotal || null,
            quantite_stock_commande:   quantite || null,
            prix_achat_devise_origine: stockTotal > 0 && quantite > 0 ? stockTotal / quantite : null,
            montant_total_achat:       montantTotal || null,
            frais_cmb:                 parseFloat(v.frais_cmb) || null,
            frais_transit:             parseFloat(v.frais_transit) || null,
            frais_bancaires:           parseFloat(v.frais_bancaires) || null,
            frais_courtier:            parseFloat(v.frais_courtier) || null,
            frais_transport_local:     parseFloat(v.frais_transport_local) || null,
            cbm:                       parseFloat(v.cbm) || null,
            poids_kg:                  parseFloat(v.poids_kg) || null,
            moyen_paiement:            v.moyen_paiement || null,
            date_commande:             v.date_commande || null,
            date_reception:            v.date_reception || null,
            prix_achat:                parseFloat(v.prix_achat),
            prix_vente:                parseFloat(v.prix_vente),
            prix_promo:                parseFloat(v.prix_promo) || null,
            date_debut_promo:          v.date_debut_promo || null,
            date_fin_promo:            v.date_fin_promo || null,
            stock_vente:               isReserve ? 0 : (parseInt(v.stock_vente) || 0),
            stock_utilisation:         isReserve ? 0 : (parseInt(v.stock_utilisation) || 0),
            stock_reserve:             isReserve ? (parseInt(v.stock_reserve) || 0) : 0,
            seuil_alerte:              isReserve ? null : (parseInt(v.seuil_alerte) || null),
            seuil_critique:            isReserve ? null : (parseInt(v.seuil_critique) || null),
            seuil_alerte_utilisation:  isReserve ? null : (parseInt(v.seuil_alerte_utilisation) || null),
            seuil_critique_utilisation: isReserve ? null : (parseInt(v.seuil_critique_utilisation) || null),
            seuil_alerte_reserve:      isReserve ? (parseInt(v.seuil_alerte_reserve) || null) : null,
            seuil_critique_reserve:    isReserve ? (parseInt(v.seuil_critique_reserve) || null) : null,
            is_active:                 v.is_active,
            attributs:                 v.attributs,
          };
        }),
      };

      let produitId: number;

      if (produit) {
        if (modeValidation) {
          await produitsApi.produits.modifierEtValider(produit.id, payload);
        } else {
          await produitsApi.produits.update(produit.id, payload);
        }
        produitId = produit.id;
      } else {
        const response = await produitsApi.produits.create(payload);
        produitId = response.data.id;
      }

      if (photoFile) {
        setIsUploadingPhoto(true);
        await produitsApi.produits.uploadPhoto(produitId, photoFile);
      }

      onSuccess();
      onClose();

    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] as string : 'Erreur de validation');
      } else {
        setError(error.message || 'Une erreur est survenue');
      }
    } finally {
      setIsSubmitting(false);
      setIsUploadingPhoto(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modeValidation ? 'Modifier et valider' : produit ? 'Modifier le produit' : 'Nouveau produit'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Erreur */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 font-medium">Erreur</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ---- PRODUIT PARENT ---- */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold text-gray-900 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-lg border-l-4 border-blue-500">
            ℹ️ Informations du produit
          </h3>

          {/* Photo */}
          <div className="flex gap-4">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Camera size={28} className="text-gray-300 mb-1" />
                  <span className="text-xs text-gray-400">Aucune photo</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploadingPhoto}>
                <Upload className="w-4 h-4 mr-2" />
                {photoPreview ? 'Changer' : 'Ajouter une photo'}
              </Button>
              {photoPreview && (
                <Button type="button" variant="outline" size="sm"
                  onClick={photoFile
                    ? () => { setPhotoFile(null); setPhotoPreview(null); }
                    : handleDeleteExistingPhoto
                  }
                  disabled={isSubmitting || isUploadingPhoto}
                  className="text-red-600"
                >
                  <X className="w-4 h-4 mr-2" /> Supprimer
                </Button>
              )}
              <p className="text-xs text-gray-500">JPG, PNG, WEBP (max 5 MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                value={produitData.nom}
                onChange={(e) => setProduitData({ ...produitData, nom: e.target.value })}
                required placeholder="Ex: AFRO KINKY"
              />
            </div>

            <div className="col-span-2">
              <Textarea
                label="Description"
                value={produitData.description}
                onChange={(val: string) => setProduitData({ ...produitData, description: val })}
                placeholder="Description du produit..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={produitData.categorie_id}
                onChange={(e) => setProduitData({ ...produitData, categorie_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <Input value={produitData.marque}
                onChange={(e) => setProduitData({ ...produitData, marque: e.target.value })}
                placeholder="Marque" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <Input value={produitData.fournisseur}
                onChange={(e) => setProduitData({ ...produitData, fournisseur: e.target.value })}
                placeholder="Fournisseur" />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="visible_public_modal"
                checked={produitData.visible_public}
                onChange={(e) => setProduitData({ ...produitData, visible_public: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="visible_public_modal" className="text-sm font-medium text-gray-700">
                Visible publiquement
              </label>
            </div>
          </div>
        </div>

        {/* ---- VARIANTES ---- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Variantes
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {variantes.length}
              </span>
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddVariante}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une variante
            </Button>
          </div>

          <div className="space-y-4">
            {variantes.map((variante, index) => (
              <VarianteFormSection
                key={variante.localId}
                variante={variante}
                index={index}
                total={variantes.length}
                attributsCategorie={attributsCategorie}
                onChange={handleVarianteChange}
                onChangeAttribut={handleVarianteAttribut}
                onRemove={handleRemoveVariante}
                onToggleCollapse={handleToggleCollapse}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploadingPhoto}>
            {isSubmitting || isUploadingPhoto
              ? 'Enregistrement...'
              : modeValidation ? 'Modifier & Valider' : produit ? 'Modifier' : 'Créer'}
          </Button>
        </div>

      </form>
    </Modal>
  );
}