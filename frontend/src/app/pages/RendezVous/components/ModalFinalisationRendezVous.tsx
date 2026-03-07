import React, { useState, useMemo } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useRendezVous } from '../../../../hooks/useRendezVous';
import { rendezVousApi } from '../../../../services/rendezVousApi';
import { SelecteurProduits } from './shared/SelecteurProduits';
import { SelecteurPrestations } from './shared/SelecteurPrestations';
import { GestionnairePaiements } from './shared/GestionnairePaiements';
import type { RendezVous } from '../../../../types/rendezVous.types';
import type { PrestationSelectionnee } from '../../../../types/rendezVous.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rendezVous: RendezVous;
  onSuccess: () => void;
}

// ✅ ADAPTÉ : varianteId au lieu de id
interface ProduitSelectionne {
  varianteId: number;
  produitId: number;
  nom: string;
  reference?: string;
  prix_unitaire: number;
  quantite: number;
  source_stock: 'vente' | 'utilisation';
  stock_vente: number;
  stock_utilisation: number;
}

interface Paiement {
  mode: 'especes' | 'orange_money' | 'moov_money' | 'carte';
  montant: number;
  reference?: string;
}

export const ModalFinalisationRendezVous: React.FC<Props> = ({
  isOpen,
  onClose,
  rendezVous,
  onSuccess,
}) => {
  const { finaliser, isFinalizing } = useRendezVous();

  const [etape, setEtape]     = useState<'prestations' | 'produits' | 'paiement'>('prestations');
  const [prestationsSupplementaires, setPrestationsSupplementaires] = useState<PrestationSelectionnee[]>([]);
  const [produits, setProduits] = useState<ProduitSelectionne[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([{ mode: 'especes', montant: 0, reference: '' }]);
  const [notes, setNotes]     = useState('');

  // ── Calculs ───────────────────────────────────────────────

  const montantPrestationPrincipale = Math.round(
    Number(rendezVous.prix_estime || rendezVous.typePrestation?.prix_base || 0)
  );

  const montantPrestationsSupplementaires = useMemo(() =>
    prestationsSupplementaires.reduce((sum, p) => sum + Math.round(Number(p.prix_unitaire)), 0),
    [prestationsSupplementaires]
  );

  const montantTotalPrestations = montantPrestationPrincipale + montantPrestationsSupplementaires;

  const montantProduits = useMemo(() =>
    produits.reduce((sum, p) => sum + Math.round(Number(p.prix_unitaire)) * p.quantite, 0),
    [produits]
  );

  const montantTotalHT = montantTotalPrestations + montantProduits;
  const acompteVerse   = Math.round(Number(rendezVous.acompte_paye ? rendezVous.acompte_montant || 0 : 0));
  const montantAPayer  = Math.max(0, montantTotalHT - acompteVerse);
  const montantPaye    = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
  const paiementComplet = montantPaye >= montantAPayer;

  const stocksValides = useMemo(() =>
    produits.every(p => {
      const stock = p.source_stock === 'vente' ? p.stock_vente : p.stock_utilisation;
      return p.quantite <= stock;
    }),
    [produits]
  );

  const peutFinaliser = paiementComplet && stocksValides;

  // ── Submit ────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!peutFinaliser) return;

    const articles = [
      // Prestations du RDV
      ...(rendezVous.prestations || []).map(p => ({
        type:          'prestation' as const,
        id:            p.id,
        quantite:      1,
        prix_unitaire: p.prix_base,
        reduction:     0,
      })),
      // Prestations supplémentaires
      ...prestationsSupplementaires.map(p => ({
        type:          'prestation' as const,
        id:            p.id,
        quantite:      1,
        prix_unitaire: p.prix_unitaire,
        reduction:     0,
        coiffeur_id:   p.coiffeur_id || undefined,
      })),
      // ✅ CORRIGÉ : id = varianteId pour le backend
      ...produits.map(p => ({
        type:          'produit' as const,
        id:            p.varianteId,
        quantite:      p.quantite,
        prix_unitaire: p.prix_unitaire,
        reduction:     0,
        source_stock:  p.source_stock,
      })),
    ];

    const paiementsData = paiements
      .filter(p => p.montant > 0)
      .map(p => ({
        mode:      p.mode,
        montant:   p.montant,
        reference: p.reference || undefined,
      }));

    finaliser(
      {
        id:   rendezVous.id,
        data: { articles, paiements: paiementsData, notes: notes || undefined },
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            const url  = rendezVousApi.getRecuFinalUrl(rendezVous.id);
            const link = document.createElement('a');
            link.href     = url;
            link.download = `recu-final-rdv-${rendezVous.id}.pdf`;
            link.target   = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 500);

          onSuccess();
          onClose();
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setEtape('prestations');
    setPrestationsSupplementaires([]);
    setProduits([]);
    setPaiements([{ mode: 'especes', montant: 0, reference: '' }]);
    setNotes('');
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR').format(value);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Finaliser le rendez-vous</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {rendezVous.client?.prenom} {rendezVous.client?.nom} · {rendezVous.typePrestation?.nom}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Étapes */}
          <div className="flex items-center gap-2 mt-4">
            {(['prestations', 'produits', 'paiement'] as const).map((e, i) => (
              <button
                key={e}
                type="button"
                onClick={() => setEtape(e)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  etape === e
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}. {e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Prestation principale</span>
              <p className="font-medium">{formatCurrency(montantPrestationPrincipale)} FCFA</p>
            </div>
            {prestationsSupplementaires.length > 0 && (
              <div>
                <span className="text-gray-600">Prestations sup. ({prestationsSupplementaires.length})</span>
                <p className="font-medium">{formatCurrency(montantPrestationsSupplementaires)} FCFA</p>
              </div>
            )}
            {produits.length > 0 && (
              <div>
                <span className="text-gray-600">Produits ({produits.length})</span>
                <p className="font-medium">{formatCurrency(montantProduits)} FCFA</p>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-gray-600">Total HT</span>
              <p className="font-medium">{formatCurrency(montantTotalHT)} FCFA</p>
            </div>
            {acompteVerse > 0 && (
              <div className="col-span-2">
                <span className="text-gray-600">Acompte versé</span>
                <p className="font-medium text-green-600">-{formatCurrency(acompteVerse)} FCFA</p>
              </div>
            )}
            <div className="col-span-2 pt-2 border-t-2 border-gray-300">
              <span className="text-gray-600 font-medium">Reste à payer</span>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(montantAPayer)} FCFA</p>
            </div>
          </div>
        </div>

        {/* Contenu étapes */}
        <div className="p-6">

          {etape === 'prestations' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Prestations supplémentaires (optionnel)</h3>
                <p className="text-xs text-gray-500 mb-3">Le client a-t-il demandé d'autres prestations ?</p>
              </div>
              <SelecteurPrestations
                prestations={prestationsSupplementaires}
                onChange={setPrestationsSupplementaires}
                prestationPrincipaleId={rendezVous.type_prestation_id}
              />
              <button type="button" onClick={() => setEtape('produits')}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition">
                Continuer vers les produits
              </button>
            </div>
          )}

          {etape === 'produits' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Produits utilisés (optionnel)</h3>
                <p className="text-xs text-gray-500 mb-3">Ajoutez les produits utilisés pendant la prestation</p>
              </div>

              {/* ✅ SelecteurProduits reçoit/retourne ProduitSelectionne avec varianteId */}
              <SelecteurProduits produits={produits} onChange={setProduits} />

              {!stocksValides && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Stock insuffisant</p>
                    <p>Ajustez les quantités ou changez la source de stock.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                  placeholder="Remarques sur la prestation..."
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEtape('prestations')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                  Retour
                </button>
                <button type="button"
                  onClick={() => {
                    setPaiements([{ mode: 'especes', montant: montantAPayer, reference: '' }]);
                    setEtape('paiement');
                  }}
                  disabled={!stocksValides}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Continuer vers le paiement
                </button>
              </div>
            </div>
          )}

          {etape === 'paiement' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Encaisser le paiement</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Montant à encaisser : {formatCurrency(montantAPayer)} FCFA
                </p>
              </div>

              <GestionnairePaiements
                paiements={paiements}
                onChange={setPaiements}
                montantTotal={montantAPayer}
              />

              {!paiementComplet && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">Le montant payé est insuffisant</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setEtape('produits')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                  Retour
                </button>
                <button type="button" onClick={handleSubmit}
                  disabled={!peutFinaliser || isFinalizing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {isFinalizing ? 'Finalisation...' : 'Finaliser'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};