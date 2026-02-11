// src/app/pages/RendezVous/components/HistoriquePaiementsView/HistoriquePaiementsView.tsx

import React, { useState, useEffect } from 'react';
import { Search, Printer, Calendar, DollarSign, User, FileText, ChevronRight } from 'lucide-react';
import { rendezVousApi } from '../../../../../services/rendezVousApi';
import type { RendezVousPaiement } from '../../../../../types/rendezVousPaiement.types';

export const HistoriquePaiementsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [rendezVousList, setRendezVousList] = useState<any[]>([]);
  const [selectedRdv, setSelectedRdv] = useState<any>(null);
  const [historique, setHistorique] = useState<RendezVousPaiement[]>([]);
  const [loading, setLoading] = useState(false);
  const [paiementsSearchTerm, setPaiementsSearchTerm] = useState('');

  // Charger la liste des rendez-vous au montage
  useEffect(() => {
    chargerRendezVous();
  }, []);

  const chargerRendezVous = async (params?: any) => {
    setLoading(true);
    try {
      const response = await rendezVousApi.getListeAvecPaiements(params);
      setRendezVousList(response.data.data || response.data);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
      setRendezVousList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecherche = () => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;
    chargerRendezVous(params);
  };

  const handleSelectRdv = async (rdv: any) => {
    setSelectedRdv(rdv);
    try {
      const histoResponse = await rendezVousApi.getHistoriquePaiements(rdv.id);
      setHistorique(histoResponse.data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setHistorique([]);
    }
  };

  const handleRetour = () => {
    setSelectedRdv(null);
    setHistorique([]);
    setPaiementsSearchTerm('');
  };

  const handleImprimer = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDateOnly = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getModePaiementLabel = (mode: string) => {
    const modes: Record<string, string> = {
      especes: 'Espèces',
      orange_money: 'Orange Money',
      moov_money: 'Moov Money',
      carte: 'Carte bancaire',
    };
    return modes[mode] || mode;
  };

  const getTypePaiementBadge = (type: string) => {
    return type === 'acompte' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const totalPaiements = historique.reduce((sum, p) => sum + p.montant, 0);

  const paiementsFiltered = historique.filter(p => {
    if (!paiementsSearchTerm) return true;
    const search = paiementsSearchTerm.toLowerCase();
    return (
      p.mode_paiement.toLowerCase().includes(search) ||
      p.type_paiement.toLowerCase().includes(search) ||
      p.user?.nom?.toLowerCase().includes(search) ||
      p.user?.prenom?.toLowerCase().includes(search) ||
      p.reference_transaction?.toLowerCase().includes(search)
    );
  });

  const rdvsFiltered = rendezVousList;

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Historique des paiements
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {selectedRdv 
                ? `Paiements du rendez-vous #${selectedRdv.id}` 
                : 'Sélectionnez un rendez-vous pour voir son historique'}
            </p>
          </div>

          <div className="flex gap-2">
            {selectedRdv && (
              <>
                <button
                  onClick={handleRetour}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition"
                >
                  ← Retour
                </button>
                {historique.length > 0 && (
                  <button
                    onClick={handleImprimer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimer
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filtres de recherche - Visible uniquement sur la liste */}
        {!selectedRdv && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom client ou téléphone..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleRecherche()}
            />
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleRecherche}
              className="sm:col-span-3 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Rechercher
            </button>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 sm:p-6">
        {!selectedRdv ? (
          /* LISTE DES RENDEZ-VOUS */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            ) : rdvsFiltered.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun rendez-vous trouvé
                </h3>
                <p className="text-gray-600">
                  Modifiez vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {rdvsFiltered.map((rdv) => (
                  <button
                    key={rdv.id}
                    onClick={() => handleSelectRdv(rdv)}
                    className="w-full p-4 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">#{rdv.id}</span>
                          <span className="text-gray-600">—</span>
                          <span className="font-medium text-gray-900">
                            {rdv.client?.prenom} {rdv.client?.nom}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateOnly(rdv.date_heure)}
                          </span>
                          <span>{rdv.typePrestation?.nom}</span>
                          <span className="font-medium text-orange-600">
                            Payé: {formatCurrency(rdv.total_paye || 0)} FCFA
                            {rdv.prix_estime && ` / ${formatCurrency(rdv.prix_estime)} FCFA`}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* DÉTAILS DU RDV ET HISTORIQUE */
          <div className="space-y-6">
            {/* En-tête d'impression */}
            <div className="hidden print:block text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">HISTORIQUE DES PAIEMENTS</h1>
              <p className="text-sm text-gray-600 mt-1">
                Imprimé le {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>

            {/* Infos du RDV */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:shadow-none print:border-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 print:hidden" />
                Rendez-vous #{selectedRdv.id}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium text-gray-900">
                    {selectedRdv.client?.prenom} {selectedRdv.client?.nom}
                  </p>
                  <p className="text-sm text-gray-600">{selectedRdv.client?.telephone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Prestation</p>
                  <p className="font-medium text-gray-900">{selectedRdv.typePrestation?.nom}</p>
                  {selectedRdv.prix_estime && (
                    <p className="text-sm text-gray-600">
                      {formatCurrency(selectedRdv.prix_estime)} FCFA
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Date du rendez-vous</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedRdv.date_heure).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    à {new Date(selectedRdv.date_heure).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Coiffeur</p>
                  <p className="font-medium text-gray-900">
                    {selectedRdv.coiffeur?.prenom} {selectedRdv.coiffeur?.nom}
                  </p>
                </div>
              </div>
            </div>

            {/* Filtre dans l'historique */}
            {historique.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 print:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={paiementsSearchTerm}
                    onChange={(e) => setPaiementsSearchTerm(e.target.value)}
                    placeholder="Filtrer par mode de paiement, type, encaisseur..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Liste des paiements */}
            {historique.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun paiement enregistré
                </h3>
                <p className="text-gray-600">
                  Aucun paiement n'a été effectué pour ce rendez-vous
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-2">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    Historique des paiements ({paiementsFiltered.length})
                  </h3>
                </div>

                {/* Version desktop/tablette */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mode
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                          Encaissé par
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                          Référence
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paiementsFiltered.map((paiement) => (
                        <tr key={paiement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(paiement.date_paiement)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypePaiementBadge(paiement.type_paiement)}`}>
                              {paiement.type_paiement === 'acompte' ? 'Acompte' : 'Solde'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getModePaiementLabel(paiement.mode_paiement)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            {formatCurrency(paiement.montant)} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 print:hidden">
                            {paiement.user?.prenom} {paiement.user?.nom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 print:hidden">
                            {paiement.reference_transaction || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900">
                          TOTAL PAYÉ
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(totalPaiements)} FCFA
                        </td>
                        <td colSpan={2} className="print:hidden"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Version mobile */}
                <div className="sm:hidden divide-y divide-gray-200">
                  {paiementsFiltered.map((paiement) => (
                    <div key={paiement.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypePaiementBadge(paiement.type_paiement)}`}>
                          {paiement.type_paiement === 'acompte' ? 'Acompte' : 'Solde'}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(paiement.montant)} FCFA
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(paiement.date_paiement)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        {getModePaiementLabel(paiement.mode_paiement)}
                      </div>

                      {paiement.user && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          {paiement.user.prenom} {paiement.user.nom}
                        </div>
                      )}

                      {paiement.reference_transaction && (
                        <div className="text-xs text-gray-500">
                          Réf: {paiement.reference_transaction}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="p-4 bg-gray-50 flex justify-between items-center font-bold">
                    <span className="text-gray-900">TOTAL PAYÉ</span>
                    <span className="text-gray-900">{formatCurrency(totalPaiements)} FCFA</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Styles d'impression */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-2 { border-width: 2px !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
};