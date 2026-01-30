// src/app/pages/ventes/NouvelleVente.tsx

import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { ClientSelector } from './components/ClientSelector';
import { Panier } from './components/Panier';
import { PaiementForm } from './components/PaiementForm';
import { SelectionProduitModal } from './components/SelectionProduitModal';
import { SelectionPrestationModal } from './components/SelectionPrestationModal';
import { usePanier } from '../../../hooks/usePanier';
import { useCalculsVente } from '../../../hooks/useCalculsVente';
import { venteApi } from '../../../services/venteApi';
import { clientApi } from '../../../services/clientApi';
import { userApi } from '../../../services/userApi';
import type {
  Client,
  NouveauClient,
  ClientAnonyme,
  Paiement,
  Reduction,
  CreateVenteDTO,
  SourceStock,
} from '../../../types/vente.types';
import type { Produit } from '../../../types/produit.types';
import type { TypePrestation } from '../../../types/prestation.types';

// Type pour les coiffeurs (utilisateurs)
// Remplacer l'interface Coiffeur par :
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
  // États
  const [clientData, setClientData] = useState<{
    client_id?: number;
    nouveau_client?: NouveauClient;
    client_anonyme?: ClientAnonyme;
  }>({});
  const [clientSelectionne, setClientSelectionne] = useState<Client | null>(null);
  const [coiffeurId, setCoiffeurId] = useState<number | undefined>();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [reduction, setReduction] = useState<Reduction | undefined>();
  const [pointsUtilises, setPointsUtilises] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Listes pour les selects
  const [coiffeurs, setCoiffeurs] = useState<Coiffeur[]>([]);
  const [isLoadingCoiffeurs, setIsLoadingCoiffeurs] = useState(false);
  
  // Modals
  const [showProduitModal, setShowProduitModal] = useState(false);
  const [showPrestationModal, setShowPrestationModal] = useState(false);

  // Hooks personnalisés
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

  // Charger les coiffeurs au montage
  useEffect(() => {
    loadCoiffeurs();
  }, []);

  /**
   * Charger la liste des coiffeurs (employés)
   */
    const loadCoiffeurs = async () => {
    setIsLoadingCoiffeurs(true);
    try {
      const response = await userApi.getCoiffeurs();
      
      if (response.success) {
        setCoiffeurs(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement coiffeurs:', error);
      setCoiffeurs([]);
    } finally {
      setIsLoadingCoiffeurs(false);
    }
  };

  // Gestionnaires
  const handleClientSelect = async (data: any) => {
    setClientData(data);
    
    // Si c'est un client existant, récupérer ses détails
    if (data.client_id) {
      try {
        const response = await clientApi.getOne(data.client_id);
        if (response.success) {
          setClientSelectionne(response.data);
        }
      } catch (error) {
        console.error('Erreur récupération client:', error);
        // En cas d'erreur, garder juste l'ID
        setClientSelectionne(null);
      }
    } else {
      setClientSelectionne(null);
    }
  };

  const handleAjouterPrestation = () => {
    setShowPrestationModal(true);
  };

  const handleSelectPrestation = (prestation: TypePrestation, quantite: number) => {
    // Ajouter la prestation au panier
    ajouterArticle(
      prestation.id,
      'prestation',
      prestation.nom,
      prestation.prix_base,
      undefined, // sourceStock (pas applicable aux prestations)
      undefined  // reference (pas applicable aux prestations)
    );

    console.log('Prestation ajoutée:', {
      id: prestation.id,
      nom: prestation.nom,
      quantite,
      prix: prestation.prix_base,
    });
  };

  const handleAjouterProduit = () => {
    setShowProduitModal(true);
  };

  const handleSelectProduit = (produit: Produit, quantite: number, sourceStock: SourceStock) => {
    // Calculer le prix (promo ou normal)
    const prix = getPrixProduit(produit);
    
    // Ajouter au panier
    ajouterArticle(
      produit.id,
      'produit',
      produit.nom,
      prix,
      sourceStock,
      produit.reference
    );

    console.log('Produit ajouté:', {
      id: produit.id,
      nom: produit.nom,
      quantite,
      prix,
      sourceStock,
    });
  };

  const getPrixProduit = (produit: Produit): number => {
    // Vérifier si le produit est en promotion
    if (produit.prix_promo && produit.date_debut_promo && produit.date_fin_promo) {
      const now = new Date();
      const debut = new Date(produit.date_debut_promo);
      const fin = new Date(produit.date_fin_promo);
      
      if (now >= debut && now <= fin) {
        return produit.prix_promo;
      }
    }
    
    return produit.prix_vente;
  };

  const handleValiderVente = async () => {
    // Validation
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

    // Préparer les données
    const venteData: CreateVenteDTO = {
      ...clientData,
      coiffeur_id: coiffeurId,
      articles: articles.map((a) => ({
        id: a.id,
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

    // Enregistrer
    setIsLoading(true);
    try {
      const response = await venteApi.createVente(venteData);
      
      if (response.success) {
        alert(`Vente enregistrée avec succès! Facture: ${response.data.numero_facture}`);
        
        // Télécharger le reçu
        const confirmer = confirm('Voulez-vous télécharger le reçu?');
        if (confirmer) {
          await venteApi.downloadReceipt(response.data.id, response.data.numero_facture);
        }
        
        // Réinitialiser le formulaire
        resetForm();
      }
    } catch (error: any) {
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
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
    <>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Nouvelle Vente</h1>
            <div className="flex gap-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 border rounded hover:bg-gray-100 flex items-center gap-2"
              >
                <X size={18} />
                Annuler
              </button>
              <button
                onClick={handleValiderVente}
                disabled={isLoading || articles.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 flex items-center gap-2"
              >
                <Save size={18} />
                {isLoading ? 'Enregistrement...' : 'Valider la vente'}
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Colonne gauche */}
            <div className="lg:col-span-2 space-y-4">
              {/* Sélection client */}
              <ClientSelector
                onClientSelect={handleClientSelect}
                clientSelectionne={clientSelectionne}
              />

              {/* Sélection articles */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-3">Articles</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleAjouterPrestation}
                    className="flex-1 py-3 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                  >
                    + Ajouter Prestation
                  </button>
                  <button
                    onClick={handleAjouterProduit}
                    className="flex-1 py-3 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                  >
                    + Ajouter Produit
                  </button>
                </div>
              </div>

              {/* Coiffeur (optionnel) */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-3">
                  Coiffeur / Employé (optionnel)
                </h3>
                <select
                  value={coiffeurId || ''}
                  onChange={(e) => setCoiffeurId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoadingCoiffeurs}
                >
                  <option value="">
                    {isLoadingCoiffeurs ? 'Chargement...' : 'Aucun coiffeur sélectionné'}
                  </option>
                  {coiffeurs.map((coiffeur) => (
                    <option key={coiffeur.id} value={coiffeur.id}>
                    {coiffeur.prenom} {coiffeur.nom} {coiffeur.specialite ? `- ${coiffeur.specialite}` : ''}
                  </option>
                  ))}
                </select>
                {coiffeurs.length === 0 && !isLoadingCoiffeurs && (
                  <p className="mt-2 text-sm text-gray-500">
                    Aucun employé disponible
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-3">Notes (optionnel)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  rows={3}
                  placeholder="Remarques, instructions particulières..."
                />
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              {/* Panier */}
              <Panier
                articles={articles}
                onQuantiteChange={modifierQuantite}
                onPrixChange={modifierPrix}
                onReductionChange={appliquerReductionArticle}
                onSupprimer={supprimerArticle}
                montantHT={totaux.montantHT}
                montantReduction={totaux.totalReductionGlobale}
                montantTTC={totaux.montantTTC}
              />

              {/* Paiement */}
              {articles.length > 0 && (
                <PaiementForm
                  montantTotal={totaux.montantTTC}
                  onPaiementsChange={setPaiements}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SelectionProduitModal
        isOpen={showProduitModal}
        onClose={() => setShowProduitModal(false)}
        onSelect={handleSelectProduit}
      />

      <SelectionPrestationModal
        isOpen={showPrestationModal}
        onClose={() => setShowPrestationModal(false)}
        onSelect={handleSelectPrestation}
      />
    </>
  );
};

export default NouvelleVente;