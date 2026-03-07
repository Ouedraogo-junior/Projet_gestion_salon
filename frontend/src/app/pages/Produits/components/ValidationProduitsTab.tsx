// src/app/pages/Produits/components/ValidationProduitsTab.tsx

import { useState, useEffect } from 'react';
import { Check, X, Eye, Edit, Clock, AlertCircle, RefreshCw, Package, ImageOff } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { produitsApi } from '@/services/produitsApi';
import { ProduitDetailsModal } from './ProduitDetailsModal';
import { ProduitFormModal } from './ProduitFormModal';
import { useCategories } from '@/hooks/useProduitsModule';
import type { Produit, ProduitVariante } from '@/types/produit.types';

// ── Type réel retourné par enAttente() ──────────────────────
interface VarianteEnAttente extends ProduitVariante {
  produit: Produit & { categorie?: { nom: string } };
  createur?: { nom: string; prenom: string };
  valeursAttributs?: Array<{
    attribut: { nom: string };
    valeur: string;
  }>;
}

const getImageUrl = (photoUrl?: string) => {
  if (!photoUrl) return null;
  const clean = photoUrl.replace(/^(storage\/)+/, '');
  return `${import.meta.env.VITE_API_URL}/storage/${clean}`;
};

// ── Ligne variante ──────────────────────────────────────────
function VarianteRow({
  variante,
  actionLoading,
  onValider,
  onOuvrirRejet,
  onVoirProduit,
  onModifierValider,
}: {
  variante: VarianteEnAttente;
  actionLoading: number | null;
  onValider: (v: VarianteEnAttente) => void;
  onOuvrirRejet: (v: VarianteEnAttente) => void;
  onVoirProduit: (v: VarianteEnAttente) => void;
  onModifierValider: (v: VarianteEnAttente) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getImageUrl(variante.produit?.photo_url);
  const isLoading = actionLoading === variante.id;

  return (
    <div className="bg-white border border-amber-100 rounded-lg hover:border-amber-300 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Miniature produit */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={variante.produit?.nom}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={18} className="text-amber-300" />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 truncate">
              {variante.produit?.nom ?? '—'}
            </span>

            {variante.produit?.categorie && (
              <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded hidden sm:inline">
                {variante.produit.categorie.nom}
              </span>
            )}

            {variante.reference && (
              <span className="font-mono text-[11px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">
                {variante.reference}
              </span>
            )}

            {/* Attributs (ex: 10g, 30cm…) */}
            {variante.valeursAttributs?.map((av, i) => (
              <span key={i} className="text-[11px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                {av.attribut.nom}: {av.valeur}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {variante.createur && (
              <span className="text-xs text-gray-400">
                Soumis par <span className="text-gray-600 font-medium">{variante.createur.prenom} {variante.createur.nom}</span>
              </span>
            )}
            <span className="text-xs font-semibold text-green-600">
              Vente : {Number(variante.prix_vente).toLocaleString()} FCFA
            </span>
            <span className="text-xs text-gray-400">
              Achat : {Number(variante.prix_achat).toLocaleString()} FCFA
            </span>
          </div>

          {/* Stocks */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
              Vente : <strong>{variante.stock_vente}</strong>
            </span>
            <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">
              Salon : <strong>{variante.stock_utilisation}</strong>
            </span>
            {(variante.stock_reserve ?? 0) > 0 && (
              <span className="text-[11px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">
                Réserve : <strong>{variante.stock_reserve}</strong>
              </span>
            )}
          </div>

          {/* Motif rejet précédent */}
          {variante.motif_rejet && (
            <div className="mt-1.5 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded px-2 py-1">
              <AlertCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-600">
                <span className="font-medium">Rejeté :</span> {variante.motif_rejet}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onVoirProduit(variante)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir le produit"
          >
            <Eye size={15} />
          </button>

          <button
            onClick={() => onModifierValider(variante)}
            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Modifier & Valider"
          >
            <Edit size={15} />
          </button>

          <button
            onClick={() => onValider(variante)}
            disabled={isLoading}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="Valider"
          >
            <Check size={15} />
          </button>

          <button
            onClick={() => onOuvrirRejet(variante)}
            disabled={isLoading}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Rejeter"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────
export function ValidationProduitsTab() {
  const [variantes, setVariantes]             = useState<VarianteEnAttente[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [actionLoading, setActionLoading]     = useState<number | null>(null);
  const [selectedProduitId, setSelectedProduitId] = useState<number | null>(null);
  const [showDetails, setShowDetails]         = useState(false);
  const [editingProduit, setEditingProduit]   = useState<Produit | null>(null);
  const [showForm, setShowForm]               = useState(false);
  const [showRejetModal, setShowRejetModal]   = useState(false);
  const [varianteArejeter, setVarianteArejeter] = useState<VarianteEnAttente | null>(null);
  const [motifRejet, setMotifRejet]           = useState('');
  const { data: categories }                  = useCategories();

  const load = async () => {
    setLoading(true);
    try {
      const res = await produitsApi.produits.enAttente();
      setVariantes(res.data?.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleValider = async (variante: VarianteEnAttente) => {
    if (!confirm(`Valider la variante "${variante.produit?.nom}${variante.reference ? ` (${variante.reference})` : ''}" ?`)) return;
    setActionLoading(variante.id);
    try {
      await produitsApi.produits.valider(variante.produit.id, variante.id);
      await load();
    } catch (e: any) {
      alert('Erreur : ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmerRejet = async () => {
    if (!varianteArejeter || !motifRejet.trim()) return;
    setActionLoading(varianteArejeter.id);
    try {
      await produitsApi.produits.rejeter(varianteArejeter.produit.id, motifRejet, varianteArejeter.id);
      setShowRejetModal(false);
      setVarianteArejeter(null);
      await load();
    } catch (e: any) {
      alert('Erreur : ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleModifierValider = (variante: VarianteEnAttente) => {
    setEditingProduit(variante.produit);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Variantes en attente de validation</h2>
            <p className="text-sm text-gray-500">{variantes.length} variante{variantes.length > 1 ? 's' : ''} à traiter</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Liste vide */}
      {variantes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Check className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucune variante en attente</p>
          <p className="text-sm text-gray-400 mt-1">Tout est à jour.</p>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-1.5">
        {variantes.map(variante => (
          <VarianteRow
            key={variante.id}
            variante={variante}
            actionLoading={actionLoading}
            onValider={handleValider}
            onOuvrirRejet={(v) => { setVarianteArejeter(v); setMotifRejet(''); setShowRejetModal(true); }}
            onVoirProduit={(v) => { setSelectedProduitId(v.produit.id); setShowDetails(true); }}
            onModifierValider={handleModifierValider}
          />
        ))}
      </div>

      {/* Modal Détails */}
      {selectedProduitId && (
        <ProduitDetailsModal
          isOpen={showDetails}
          onClose={() => { setShowDetails(false); setSelectedProduitId(null); }}
          produitId={selectedProduitId}
        />
      )}

      {/* Modal Modifier & Valider */}
      {editingProduit && (
        <ProduitFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditingProduit(null); }}
          onSuccess={async () => { setShowForm(false); setEditingProduit(null); await load(); }}
          produit={editingProduit}
          categories={categories}
          modeValidation={true}
        />
      )}

      {/* Modal Rejet */}
      {showRejetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">
              Rejeter —{' '}
              <span className="text-gray-600">
                {varianteArejeter?.produit?.nom}
                {varianteArejeter?.reference && ` (${varianteArejeter.reference})`}
              </span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motifRejet}
                onChange={e => setMotifRejet(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm resize-none"
                placeholder="Expliquez pourquoi cette variante est rejetée..."
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRejetModal(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmerRejet}
                disabled={!motifRejet.trim() || actionLoading !== null}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}