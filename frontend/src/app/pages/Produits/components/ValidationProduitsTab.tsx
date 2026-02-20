// src/app/pages/Produits/components/ValidationProduitsTab.tsx
import { useState, useEffect } from 'react';
import { Check, X, Eye, Edit, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { produitsApi } from '@/services/produitsApi';
import { ProduitDetailsModal } from './ProduitDetailsModal';
import { ProduitFormModal } from './ProduitFormModal';
import { useCategories } from '@/hooks/useProduitsModule';
import type { Produit } from '@/types/produit.types';

export function ValidationProduitsTab() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showRejetModal, setShowRejetModal] = useState(false);
  const [produitArejeter, setProduitArejeter] = useState<Produit | null>(null);
  const [motifRejet, setMotifRejet] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { data: categories } = useCategories();

  const load = async () => {
    setLoading(true);
    try {
      const res = await produitsApi.produits.enAttente();
      setProduits(res.data?.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleValider = async (produit: Produit) => {
    if (!confirm(`Valider le produit "${produit.nom}" ?`)) return;
    setActionLoading(produit.id);
    try {
      await produitsApi.produits.valider(produit.id);
      await load();
    } catch (e: any) {
      alert('Erreur : ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOuvrirRejet = (produit: Produit) => {
    setProduitArejeter(produit);
    setMotifRejet('');
    setShowRejetModal(true);
  };

  const handleConfirmerRejet = async () => {
    if (!produitArejeter || !motifRejet.trim()) return;
    setActionLoading(produitArejeter.id);
    try {
      await produitsApi.produits.rejeter(produitArejeter.id, motifRejet);
      setShowRejetModal(false);
      setProduitArejeter(null);
      await load();
    } catch (e: any) {
      alert('Erreur : ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleModifierValider = (produit: Produit) => {
    setEditingProduit(produit);
    setShowForm(true);
  };

  // Au succès du formulaire, on appelle modifier-valider au lieu de update classique
  // On intercepte via un flag sur editingProduit
  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingProduit(null);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-amber-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Produits en attente de validation</h2>
            <p className="text-sm text-gray-500">{produits.length} produit(s) à traiter</p>
          </div>
        </div>
        <Button variant="outline" onClick={load} size="sm">Actualiser</Button>
      </div>

      {/* Liste vide */}
      {produits.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun produit en attente</p>
          <p className="text-sm text-gray-400 mt-1">Tous les produits soumis ont été traités.</p>
        </div>
      )}

      {/* Cards produits */}
      <div className="space-y-3">
        {produits.map((produit) => (
          <div key={produit.id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              {/* Infos produit */}
              <div className="flex gap-4 flex-1 min-w-0">
                {/* Photo */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {produit.photo_url ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/storage/${produit.photo_url.replace(/^(storage\/)+/, '')}`}
                      alt={produit.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                  )}
                </div>

                {/* Détails */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{produit.nom}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <Clock className="w-3 h-3" /> En attente
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-0.5">
                    Soumis par <span className="font-medium text-gray-700">{(produit as any).createur?.name ?? '—'}</span>
                  </p>

                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                    {produit.reference && <span>Réf: <strong>{produit.reference}</strong></span>}
                    {produit.marque && <span>Marque: <strong>{produit.marque}</strong></span>}
                    <span>Prix vente: <strong>{Number(produit.prix_vente).toLocaleString('fr-FR')} FCFA</strong></span>
                    <span>Stock: <strong>{(produit as any).stock_total ?? 0} unités</strong></span>
                  </div>

                  {/* Motif rejet précédent */}
                  {(produit as any).motif_rejet && (
                    <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">
                        <span className="font-medium">Rejeté précédemment :</span> {(produit as any).motif_rejet}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setSelectedProduit(produit); setShowDetails(true); }}
                >
                  <Eye className="w-4 h-4 mr-1" /> Voir
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleModifierValider(produit)}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-1" /> Modifier & Valider
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleValider(produit)}
                  disabled={actionLoading === produit.id}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {actionLoading === produit.id ? '...' : 'Valider'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOuvrirRejet(produit)}
                  disabled={actionLoading === produit.id}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" /> Rejeter
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Détails */}
      {selectedProduit && (
        <ProduitDetailsModal
          isOpen={showDetails}
          onClose={() => { setShowDetails(false); setSelectedProduit(null); }}
          produitId={selectedProduit.id}
        />
      )}

      {/* Modal Modifier & Valider — réutilise ProduitFormModal */}
      {editingProduit && (
        <ProduitFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditingProduit(null); }}
          onSuccess={handleFormSuccess}
          produit={editingProduit}
          categories={categories}
          modeValidation={true} // ← flag pour appeler modifier-valider
        />
      )}

      {/* Modal Rejet */}
      {showRejetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Rejeter le produit "{produitArejeter?.nom}"
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif du rejet <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motifRejet}
                onChange={(e) => setMotifRejet(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                placeholder="Expliquez pourquoi ce produit est rejeté..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejetModal(false)}>Annuler</Button>
              <Button
                onClick={handleConfirmerRejet}
                disabled={!motifRejet.trim() || actionLoading !== null}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}