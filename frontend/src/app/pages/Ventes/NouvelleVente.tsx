// src/app/pages/ventes/NouvelleVente.tsx

import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { ClientSelector } from './components/ClientSelector';
import { Panier } from './components/Panier';
import { PaiementForm } from './components/PaiementForm';
import { ProduitsList } from './components/ProduitsList';
import { PrestationsList } from './components/PrestationsList';
import { usePanier } from '../../../hooks/usePanier';
import { useCalculsVente } from '../../../hooks/useCalculsVente';
import { venteApi } from '../../../services/venteApi';
import { clientApi } from '../../../services/clientApi';
import { userApi } from '../../../services/userApi';
import { VenteSuccessModal } from './components/VenteSuccessModal';
import type {
  Client,
  NouveauClient,
  ClientAnonyme,
  Paiement,
  Reduction,
  CreateVenteDTO,
  SourceStock,
} from '../../../types/vente.types';
import type { Produit, ProduitVariante } from '../../../types/produit.types';
import type { TypePrestation } from '../../../types/prestation.types';

interface Coiffeur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  role: 'gerant' | 'coiffeur' | 'gestionnaire';
  specialite: string | null;
  photo_url: string | null;
}

export const NouvelleVente: React.FC = () => {
  const [clientData, setClientData] = useState<{
    client_id?: number;
    nouveau_client?: NouveauClient;
    client_anonyme?: ClientAnonyme;
  }>({});
  const [clientSelectionne, setClientSelectionne] = useState<Client | null>(null);
  const [coiffeurId, setCoiffeurId]     = useState<number | undefined>();
  const [paiements, setPaiements]       = useState<Paiement[]>([]);
  const [reduction, setReduction]       = useState<Reduction | undefined>();
  const [pointsUtilises, setPointsUtilises] = useState(0);
  const [notes, setNotes]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastVente, setLastVente]       = useState<{ id: number; numero_facture: string } | null>(null);
  const [coiffeurs, setCoiffeurs]       = useState<Coiffeur[]>([]);
  const [isLoadingCoiffeurs, setIsLoadingCoiffeurs] = useState(false);
  const [activeTab, setActiveTab]       = useState<'prestations' | 'produits'>('prestations');

  const {
    articles,
    ajouterArticle,
    modifierQuantite,
    modifierPrix,
    appliquerReductionArticle,
    supprimerArticle,
    viderPanier,
    calculerSousTotal,
  } = usePanier();

  const { totaux, validerPaiements, formaterMontant } = useCalculsVente({
    articles,
    reduction,
    pointsUtilises,
  });

  useEffect(() => { loadCoiffeurs(); }, []);

  const loadCoiffeurs = async () => {
    setIsLoadingCoiffeurs(true);
    try {
      const response = await userApi.getCoiffeurs();
      if (response.success) setCoiffeurs(response.data);
    } catch (error) {
      console.error('Erreur chargement coiffeurs:', error);
      setCoiffeurs([]);
    } finally {
      setIsLoadingCoiffeurs(false);
    }
  };

  const handleClientSelect = async (data: any) => {
    setClientData(data);

    if (data.client_id) {
      try {
        const response = await clientApi.getClient(data.client_id);
        if (response.success) setClientSelectionne(response.data.client);
      } catch (error) {
        console.error('Erreur récupération client:', error);
        setClientSelectionne(null);
      }
    } else if (data.nouveau_client) {
      setClientSelectionne({
        id: 0, nom: data.nouveau_client.nom || 'Client',
        prenom: data.nouveau_client.prenom || 'Nouveau',
        telephone: data.nouveau_client.telephone, email: data.nouveau_client.email,
        points_fidelite: 0, date_naissance: undefined, adresse: undefined,
        ville: undefined, quartier: undefined, created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), nombre_visites: 0,
        derniere_visite: undefined, total_depense: 0, moyenne_depense: 0, statut: 'actif',
      });
    } else if (data.client_anonyme) {
      setClientSelectionne({
        id: 0, nom: data.client_anonyme.nom || 'Anonyme', prenom: 'Client',
        telephone: data.client_anonyme.telephone || 'Non renseigné', email: undefined,
        points_fidelite: 0, date_naissance: undefined, adresse: undefined,
        ville: undefined, quartier: undefined, created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), nombre_visites: 0,
        derniere_visite: undefined, total_depense: 0, moyenne_depense: 0, statut: 'actif',
      });
    } else {
      setClientSelectionne(null);
    }
  };

  const handleSelectPrestation = (prestation: TypePrestation) => {
    ajouterArticle(
      prestation.id, 'prestation', prestation.nom,
      prestation.prix_base, undefined, undefined
    );
  };

  // ── ADAPTÉ : reçoit maintenant la variante ──────────────────
  const handleSelectProduit = (
    produit: Produit,
    quantite: number,
    sourceStock: SourceStock,
    variante: ProduitVariante,
  ) => {
    const prix = getPrixVariante(variante);

    // Label : nom produit + attributs variante si présents
    const attrLabel = variante.attributs && variante.attributs.length > 0
      ? variante.attributs.map(a => a.valeur_formatee ?? a.valeur).join(' · ')
      : variante.reference ?? null;

    const nomArticle = attrLabel
      ? `${produit.nom} — ${attrLabel}`
      : produit.nom;

    ajouterArticle(
      variante.id,          // ← on utilise l'id de la variante, pas du produit parent
      'produit',
      nomArticle,
      prix,
      sourceStock,
      variante.reference ?? produit.marque,
    );
  };

  // ── Prix depuis la variante ─────────────────────────────────
  const getPrixVariante = (variante: ProduitVariante): number => {
    if (variante.en_promotion && variante.prix_promo) return variante.prix_promo;
    return variante.prix_vente ?? 0;
  };

  const handleValiderVente = async () => {
    if (articles.length === 0) {
      alert('Veuillez ajouter au moins un article');
      return;
    }
    if (!clientData.client_id && !clientData.nouveau_client && !clientData.client_anonyme) {
      alert('Veuillez sélectionner un client');
      return;
    }
    const validation = validerPaiements(paiements);
    if (!validation.estValide) {
      alert(`Paiement insuffisant. Il manque ${formaterMontant(validation.montantManquant)}`);
      return;
    }

    const venteData: CreateVenteDTO = {
      ...clientData,
      coiffeur_id: coiffeurId,
      articles: articles.map((a) => ({
        id: a.id,           // ← variante_id
        type: a.type,
        quantite: a.quantite,
        prix_unitaire: a.prix_unitaire,
        reduction: a.reduction,
        source_stock: a.source_stock,
      })),
      reduction,
      paiements,
      points_utilises: pointsUtilises,
      notes,
    };

    setIsLoading(true);
    try {
      const response = await venteApi.createVente(venteData);
      if (response.success) {
        setLastVente({ id: response.data.id, numero_facture: response.data.numero_facture });
        setShowSuccessModal(true);
        resetForm();
      }
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!lastVente) return;
    window.open(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/ventes/${lastVente.id}/receipt`,
      '_blank'
    );
  };

  const resetForm = () => {
    viderPanier();
    setClientData({});
    setClientSelectionne(null);
    setCoiffeurId(undefined);
    setPaiements([]);
    setReduction(undefined);
    setPointsUtilises(0);
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">

        {/* En-tête */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">Nouvelle Vente</h1>
            <div className="flex gap-2">
              <button onClick={resetForm}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border rounded hover:bg-gray-100 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                Annuler
              </button>
              <button
                onClick={handleValiderVente}
                disabled={isLoading || articles.length === 0}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
              >
                <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{isLoading ? 'Enregistrement...' : 'Valider la vente'}</span>
                <span className="sm:hidden">{isLoading ? 'Envoi...' : 'Valider'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Colonne gauche */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <ClientSelector onClientSelect={handleClientSelect} clientSelectionne={clientSelectionne} />

            {/* Onglets Prestations / Produits */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab('prestations')}
                  className={`flex-1 py-2.5 sm:py-3 font-medium transition text-sm sm:text-base ${
                    activeTab === 'prestations'
                      ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Prestations
                </button>
                <button
                  onClick={() => setActiveTab('produits')}
                  className={`flex-1 py-2.5 sm:py-3 font-medium transition text-sm sm:text-base ${
                    activeTab === 'produits'
                      ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Produits
                </button>
              </div>

              <div className="p-3 sm:p-4">
                {activeTab === 'prestations' ? (
                  <PrestationsList onSelect={handleSelectPrestation} />
                ) : (
                  <ProduitsList onSelect={handleSelectProduit} />
                )}
              </div>
            </div>

            {/* Coiffeur */}
            <div className="bg-white p-3 sm:p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                Coiffeur / Employé (optionnel)
              </h3>
              <select
                value={coiffeurId || ''}
                onChange={(e) => setCoiffeurId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                disabled={isLoadingCoiffeurs}
              >
                <option value="">{isLoadingCoiffeurs ? 'Chargement...' : 'Aucun coiffeur sélectionné'}</option>
                {coiffeurs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.prenom} {c.nom}{c.specialite ? ` - ${c.specialite}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="bg-white p-3 sm:p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Notes (optionnel)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base resize-none"
                rows={3}
                placeholder="Remarques, instructions particulières..."
              />
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-3 sm:space-y-4">
            <Panier
              articles={articles}
              onQuantiteChange={modifierQuantite}
              onPrixChange={modifierPrix}
              onReductionChange={appliquerReductionArticle}
              onSupprimer={supprimerArticle}
              montantHT={totaux.montantHT}
              montantReduction={totaux.totalReductionGlobale}
              montantTTC={totaux.montantTTC}
              clientSelectionne={clientSelectionne}
            />

            {articles.length > 0 && (
              <PaiementForm
                montantTotal={totaux.montantTTC}
                onPaiementsChange={setPaiements}
              />
            )}
          </div>
        </div>
      </div>

      <VenteSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        numeroFacture={lastVente?.numero_facture || ''}
        venteId={lastVente?.id || 0}
        onPrint={handlePrintReceipt}
      />
    </div>
  );
};

export default NouvelleVente;