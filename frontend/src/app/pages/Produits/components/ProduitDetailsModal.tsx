// src/app/pages/Produits/components/ProduitDetailsModal.tsx
import { useEffect, useState } from 'react';
import { Package, Tag, DollarSign, Calendar, Info, ImageOff, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { produitsApi } from '@/services/produitsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { DEVISES, MOYENS_PAIEMENT } from '@/constants/devises';
import type { ProduitVariante } from '@/types/produit.types';

interface ProduitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  produitId: number;
}

function toFloat(val: any): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

const fmt = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatDate = (date?: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const typeStockLabel = (type: string) => {
  const map: Record<string, string> = {
    vente: 'Vente uniquement',
    utilisation: 'Utilisation salon',
    mixte: 'Mixte (vente + salon)',
    reserve: 'Réserve',
  };
  return map[type] ?? type;
};

// ============================================================
// SOUS-COMPOSANT : DÉTAIL D'UNE VARIANTE
// ============================================================

function VarianteDetails({ variante }: { variante: ProduitVariante }) {
  const [open, setOpen] = useState(false);

  const isDeviseEtrangere = variante.devise_achat && variante.devise_achat !== 'FCFA';
  const deviseSymbole     = DEVISES.find(d => d.value === variante.devise_achat)?.symbole ?? 'FCFA';
  const deviseLabel       = DEVISES.find(d => d.value === variante.devise_achat)?.label   ?? 'FCFA';
  const isReserve         = variante.type_stock_principal === 'reserve';

  const prixAchat        = toFloat(variante.prix_achat);
  const prixVente        = toFloat(variante.prix_vente);
  const margeUnitaire    = toFloat(variante.marge_montant);
  const margePourcentage = toFloat(variante.marge_pourcentage);
  const montantTotal     = toFloat(variante.montant_total_achat);
  const qteCommande      = variante.quantite_stock_commande ?? 0;

  // Label pour le header : attributs ou référence
  const attrLabel = variante.attributs && variante.attributs.length > 0
    ? variante.attributs.map(a => a.valeur_formatee ?? a.valeur).join(' · ')
    : null;

  const headerLabel = attrLabel ?? variante.reference ?? `Variante #${variante.id}`;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header dépliable */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{headerLabel}</span>

          {variante.reference && attrLabel && (
            <span className="text-xs font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">
              {variante.reference}
            </span>
          )}

          {/* Attributs badges */}
          {variante.attributs && variante.attributs.map((a, i) => (
            <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
              {a.nom} : {a.valeur_formatee ?? a.valeur}
            </span>
          ))}

          {/* Prix */}
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {fmt(prixVente)} FCFA
          </span>

          {variante.en_promotion && variante.prix_promo && (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              PROMO {fmt(variante.prix_promo)} FCFA
            </span>
          )}

          {/* Statut validation */}
          {variante.statut_validation !== 'valide' && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              variante.statut_validation === 'en_attente'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {variante.statut_validation === 'en_attente' ? '⏳ En attente' : '❌ Rejeté'}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
               : <ChevronDown className="w-4 h-4 text-blue-600 flex-shrink-0" />}
      </button>

      {/* Corps */}
      {open && (
        <div className="p-5 space-y-5 bg-white">

          {/* Motif rejet */}
          {variante.statut_validation === 'rejete' && variante.motif_rejet && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <strong>Motif de rejet :</strong> {variante.motif_rejet}
            </div>
          )}

          {/* Prix & Marges */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border-l-4 border-green-400 mb-3">
              💰 Prix et marges
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-xs text-gray-500">Prix achat</label>
                <p className="text-base font-bold text-gray-900 mt-0.5">{fmt(prixAchat)} FCFA</p>
                <p className="text-xs text-gray-400">Avec frais</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <label className="text-xs text-gray-500">Prix vente</label>
                <p className="text-base font-bold text-blue-600 mt-0.5">{fmt(prixVente)} FCFA</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <label className="text-xs text-gray-500">Marge unitaire</label>
                <p className="text-base font-bold text-green-600 mt-0.5">
                  {fmt(margeUnitaire)} FCFA
                </p>
                {margePourcentage > 0 && (
                  <p className="text-xs text-green-500">{margePourcentage.toFixed(1)}%</p>
                )}
              </div>
            </div>

            {variante.en_promotion && variante.prix_promo && (
              <div className="mt-3 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-red-600 font-medium">PROMOTION</span>
                  <p className="text-base font-bold text-red-600">{fmt(variante.prix_promo)} FCFA</p>
                  {variante.date_debut_promo && variante.date_fin_promo && (
                    <p className="text-xs text-red-400">
                      {formatDate(variante.date_debut_promo)} → {formatDate(variante.date_fin_promo)}
                    </p>
                  )}
                </div>
                <span className="text-2xl font-bold text-red-600">
                  -{Math.round(((prixVente - toFloat(variante.prix_promo)) / prixVente) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Stocks */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-teal-50 to-cyan-50 px-3 py-2 rounded-lg border-l-4 border-teal-400 mb-3">
              📊 Stocks et seuils
            </h4>
            <div className="space-y-2">
              {!isReserve && (
                <>
                  {['vente', 'mixte'].includes(variante.type_stock_principal) && (
                    <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 rounded-r-lg py-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1">🛒 Stock Vente</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div><p className="text-xs text-gray-500">Actuel</p><p className="text-xl font-bold text-blue-600">{variante.stock_vente}</p></div>
                        <div><p className="text-xs text-gray-500">Alerte</p><p className="text-base font-semibold text-orange-500">{variante.seuil_alerte ?? '—'}</p></div>
                        <div><p className="text-xs text-gray-500">Critique</p><p className="text-base font-semibold text-red-500">{variante.seuil_critique ?? '—'}</p></div>
                      </div>
                    </div>
                  )}
                  {['utilisation', 'mixte'].includes(variante.type_stock_principal) && (
                    <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 rounded-r-lg py-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1">💇‍♀️ Stock Salon</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div><p className="text-xs text-gray-500">Actuel</p><p className="text-xl font-bold text-purple-600">{variante.stock_utilisation}</p></div>
                        <div><p className="text-xs text-gray-500">Alerte</p><p className="text-base font-semibold text-orange-500">{variante.seuil_alerte_utilisation ?? '—'}</p></div>
                        <div><p className="text-xs text-gray-500">Critique</p><p className="text-base font-semibold text-red-500">{variante.seuil_critique_utilisation ?? '—'}</p></div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {isReserve && (
                <div className="border-l-4 border-amber-500 pl-4 bg-amber-50 rounded-r-lg py-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">🏪 Stock Réserve</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div><p className="text-xs text-gray-500">Actuel</p><p className="text-xl font-bold text-amber-600">{variante.stock_reserve ?? 0}</p></div>
                    <div><p className="text-xs text-gray-500">Alerte</p><p className="text-base font-semibold text-orange-500">{variante.seuil_alerte_reserve ?? '—'}</p></div>
                    <div><p className="text-xs text-gray-500">Critique</p><p className="text-base font-semibold text-red-500">{variante.seuil_critique_reserve ?? '—'}</p></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gains */}
          {(qteCommande > 0 || toFloat(variante.stock_total) > 0) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 rounded-lg border-l-4 border-emerald-400 mb-3">
                💎 Gains
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {qteCommande > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Sur stock commandé ({qteCommande} unités)</p>
                    <p className="text-xl font-bold text-purple-600">{fmt(toFloat(variante.gain_total_commande))} FCFA</p>
                  </div>
                )}
                {toFloat(variante.stock_total) > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Sur stock actuel ({variante.stock_total} unités)</p>
                    <p className="text-xl font-bold text-emerald-600">{fmt(toFloat(variante.gain_total_stock_actuel))} FCFA</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations d'achat */}
          {(variante.date_commande || variante.prix_achat_stock_total || variante.devise_achat) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 rounded-lg border-l-4 border-amber-400 mb-3">
                📦 Achat & Import
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {variante.date_commande && (
                  <div>
                    <p className="text-xs text-gray-500">Date commande</p>
                    <p className="font-medium text-gray-800">{formatDate(variante.date_commande)}</p>
                  </div>
                )}
                {variante.date_reception && (
                  <div>
                    <p className="text-xs text-gray-500">Date réception</p>
                    <p className="font-medium text-gray-800">{formatDate(variante.date_reception)}</p>
                  </div>
                )}
                {variante.moyen_paiement && (
                  <div>
                    <p className="text-xs text-gray-500">Moyen de paiement</p>
                    <p className="font-medium text-gray-800">
                      {MOYENS_PAIEMENT.find(mp => mp.value === variante.moyen_paiement)?.label ?? variante.moyen_paiement}
                    </p>
                  </div>
                )}
                {variante.devise_achat && (
                  <div>
                    <p className="text-xs text-gray-500">Devise</p>
                    <p className="font-medium text-gray-800">{deviseLabel} ({deviseSymbole})</p>
                  </div>
                )}
                {isDeviseEtrangere && variante.taux_change && (
                  <div>
                    <p className="text-xs text-gray-500">Taux de change</p>
                    <p className="font-medium text-gray-800">1 {deviseSymbole} = {variante.taux_change} FCFA</p>
                  </div>
                )}
                {qteCommande > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Quantité commandée</p>
                    <p className="font-bold text-gray-800">{qteCommande} unités</p>
                  </div>
                )}
              </div>

              {/* Décomposition coût */}
              {montantTotal > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5 text-sm">
                  <p className="text-xs font-semibold text-gray-700 mb-2">📊 Décomposition du coût</p>
                  {variante.prix_achat_stock_total && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix stock ({deviseSymbole})</span>
                      <span className="font-medium">{fmt(variante.prix_achat_stock_total)} {deviseSymbole}</span>
                    </div>
                  )}
                  {isDeviseEtrangere && variante.prix_achat_stock_total && variante.taux_change && (
                    <div className="flex justify-between text-xs text-gray-500 pl-3">
                      <span>→ Converti FCFA (× {variante.taux_change})</span>
                      <span>{fmt(toFloat(variante.prix_achat_stock_total) * variante.taux_change)} FCFA</span>
                    </div>
                  )}
                  {toFloat(variante.frais_cmb) > 0 && (
                    <div className="flex justify-between"><span className="text-gray-600">Frais CMB</span><span>+{fmt(variante.frais_cmb)} FCFA</span></div>
                  )}
                  {toFloat(variante.frais_transit) > 0 && (
                    <div className="flex justify-between"><span className="text-gray-600">Frais transit</span><span>+{fmt(variante.frais_transit)} FCFA</span></div>
                  )}
                  {toFloat(variante.frais_bancaires) > 0 && (
                    <div className="flex justify-between"><span className="text-gray-600">Frais bancaires</span><span>+{fmt(variante.frais_bancaires)} FCFA</span></div>
                  )}
                  {toFloat(variante.frais_courtier) > 0 && (
                    <div className="flex justify-between"><span className="text-gray-600">Frais courtier</span><span>+{fmt(variante.frais_courtier)} FCFA</span></div>
                  )}
                  {toFloat(variante.frais_transport_local) > 0 && (
                    <div className="flex justify-between"><span className="text-gray-600">Transport local</span><span>+{fmt(variante.frais_transport_local)} FCFA</span></div>
                  )}
                  <div className="flex justify-between border-t border-blue-300 pt-2 font-bold">
                    <span>Total stock</span>
                    <span className="text-blue-600">{fmt(montantTotal)} FCFA</span>
                  </div>
                  {qteCommande > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{qteCommande} unités à</span>
                      <span className="font-semibold text-gray-700">{fmt(montantTotal / qteCommande)} FCFA/unité</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Créateur / Validateur */}
          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-gray-100">
            {variante.createur && (
              <div>
                <p className="text-xs text-gray-500">Créé par</p>
                <p className="font-medium text-gray-800">{variante.createur.name}</p>
              </div>
            )}
            {variante.validateur && (
              <div>
                <p className="text-xs text-gray-500">Validé par</p>
                <p className="font-medium text-gray-800">
                  {variante.validateur.name}
                  {variante.valide_le && <span className="text-xs text-gray-400 ml-1">({formatDate(variante.valide_le)})</span>}
                </p>
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

export function ProduitDetailsModal({ isOpen, onClose, produitId }: ProduitDetailsModalProps) {
  const [produit, setProduit]     = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && produitId) loadProduitDetails();
  }, [isOpen, produitId]);

  const loadProduitDetails = async () => {
    try {
      setLoading(true);
      const response = await produitsApi.produits.show(produitId);
      setProduit(response.data ?? response);
      setImageError(false);
    } catch (error: any) {
      alert('❌ Erreur lors du chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!produit || !confirm(`${produit.is_active ? 'Désactiver' : 'Activer'} ce produit ?`)) return;
    try {
      setIsUpdating(true);
      await produitsApi.produits.toggleActive(produit.id);
      await loadProduitDetails();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!produit || !confirm(`Rendre ce produit ${produit.visible_public ? 'privé' : 'public'} ?`)) return;
    try {
      setIsUpdating(true);
      await produitsApi.produits.update(produit.id, { visible_public: !produit.visible_public });
      await loadProduitDetails();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    const cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  if (!isOpen) return null;

  const variantes: ProduitVariante[] = produit?.variantes ?? [];
  const imageUrl = produit?.photo_url ? getImageUrl(produit.photo_url) : null;

  // Agrégats produit parent
  const stockTotal = produit?.stock_total ?? variantes.reduce((s, v) => s + (v.stock_total ?? 0), 0);
  const prixMin    = produit?.prix_min;
  const prixMax    = produit?.prix_max;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du produit" size="large">
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : produit ? (
        <div className="space-y-6">

          {/* ── EN-TÊTE : Photo + infos parent ── */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-32 h-32 sm:w-44 sm:h-44 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden border-2 border-gray-200">
                {imageUrl && !imageError ? (
                  <img src={imageUrl} alt={produit.nom} className="w-full h-full object-cover"
                    onError={() => setImageError(true)} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageOff size={40} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Aucune photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{produit.nom}</h2>
                  {produit.marque && <p className="text-sm text-gray-500 mt-0.5">Marque : {produit.marque}</p>}
                  {produit.fournisseur && <p className="text-sm text-gray-500">Fournisseur : {produit.fournisseur}</p>}
                </div>
                <Badge variant={produit.is_active ? 'success' : 'danger'}>
                  {produit.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* Fourchette de prix */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-500">Prix vente</label>
                  <p className="text-lg font-bold text-blue-600">
                    {prixMin && prixMax && prixMin !== prixMax
                      ? `${fmt(prixMin)} – ${fmt(prixMax)} FCFA`
                      : `${fmt(prixMin ?? prixMax)} FCFA`
                    }
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-500">Stock total</label>
                  <p className="text-lg font-bold text-gray-800">{stockTotal} unités</p>
                </div>
              </div>

              {/* Badge variantes */}
              {variantes.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    <Layers size={14} />
                    {variantes.length} variantes
                  </span>
                </div>
              )}
            </div>
          </div>

          {produit.description && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
              {produit.description}
            </div>
          )}

          {/* ── INFORMATIONS GÉNÉRALES ── */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Info className="w-5 h-5 text-blue-600" />
                ℹ️ Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Catégorie</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {produit.categorie?.nom || 'Non définie'}
                  </p>
                  {produit.categorie?.couleur && (
                    <div className="w-16 h-1.5 rounded mt-1" style={{ backgroundColor: produit.categorie.couleur }} />
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Visibilité</label>
                  <p className="mt-1">
                    <Badge variant={produit.visible_public ? 'success' : 'warning'}>
                      {produit.visible_public ? 'Public' : 'Privé'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Créé le</label>
                  <p className="text-sm text-gray-800 mt-1">{formatDate(produit.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Modifié le</label>
                  <p className="text-sm text-gray-800 mt-1">{formatDate(produit.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── VARIANTES ── */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Layers className="w-5 h-5 text-indigo-600" />
                Variantes
                <span className="text-sm font-normal text-indigo-500">({variantes.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {variantes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Aucune variante disponible</p>
              ) : (
                variantes.map((v) => (
                  <VarianteDetails key={v.id} variante={v} />
                ))
              )}
            </CardContent>
          </Card>

          {/* ── STATUT ET VISIBILITÉ ── */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Info className="w-5 h-5 text-violet-600" />
                🔒 Statut et visibilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <label className="text-sm font-medium text-gray-600 block">Statut</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={produit.is_active ? 'success' : 'danger'}>
                      {produit.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {produit.is_active ? 'Disponible' : 'Désactivé'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleActive}
                    disabled={isUpdating}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      produit.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                    }`}
                  >
                    {isUpdating ? 'Modification...' : produit.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <label className="text-sm font-medium text-gray-600 block">Visibilité</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={produit.visible_public ? 'success' : 'warning'}>
                      {produit.visible_public ? 'Public' : 'Privé'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {produit.visible_public ? 'Visible sur le site' : 'Masqué'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleVisibility}
                    disabled={isUpdating}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      produit.visible_public
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                    }`}
                  >
                    {isUpdating ? 'Modification...' : produit.visible_public ? 'Rendre privé' : 'Rendre public'}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>ℹ️ Note :</strong> Un produit peut être actif mais privé (disponible en interne uniquement)
                ou public mais inactif (visible mais non disponible à la vente).
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t">
            <button onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Fermer
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      )}
    </Modal>
  );
}