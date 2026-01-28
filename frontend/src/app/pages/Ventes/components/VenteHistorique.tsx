// src/app/components/ventes/VenteHistorique.tsx

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { venteApi } from '../../../../services/venteApi';
import type { Vente, VenteFilters, StatutPaiement, ModePaiement } from '../../../../types/vente.types';

export const VenteHistorique: React.FC = () => {
  // États
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtres
  const [filters, setFilters] = useState<VenteFilters>({
    search: '',
    statut_paiement: undefined,
    mode_paiement: undefined,
    date_debut: '',
    date_fin: '',
    per_page: 20,
    page: 1,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [venteSelectionnee, setVenteSelectionnee] = useState<Vente | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Charger les ventes
  useEffect(() => {
    loadVentes();
  }, [currentPage, filters.statut_paiement, filters.mode_paiement, filters.date_debut, filters.date_fin]);

  const loadVentes = async () => {
    setIsLoading(true);
    try {
      const response = await venteApi.getVentes({
        ...filters,
        page: currentPage,
      });
      
      if (response.success) {
        setVentes(response.data.data);
        setTotalPages(response.data.last_page);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      console.error('Erreur chargement ventes:', error);
      alert('Erreur lors du chargement des ventes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadVentes();
  };

  const handleFilterChange = (key: keyof VenteFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const handleVoirDetails = async (vente: Vente) => {
    try {
      const response = await venteApi.getVente(vente.id);
      if (response.success) {
        setVenteSelectionnee(response.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const handleTelechargerRecu = async (vente: Vente) => {
    try {
      await venteApi.downloadReceipt(vente.id, vente.numero_facture);
    } catch (error) {
      console.error('Erreur téléchargement reçu:', error);
      alert('Erreur lors du téléchargement du reçu');
    }
  };

  const getStatutBadgeColor = (statut: StatutPaiement) => {
    switch (statut) {
      case 'paye':
        return 'bg-green-100 text-green-800';
      case 'partiel':
        return 'bg-orange-100 text-orange-800';
      case 'impaye':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Historique des ventes</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                showFilters ? 'bg-blue-500 text-white' : 'border hover:bg-gray-50'
              }`}
            >
              <Filter size={18} />
              Filtres
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher par N° facture ou client..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Rechercher
          </button>
        </form>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-1">Statut paiement</label>
              <select
                value={filters.statut_paiement || ''}
                onChange={(e) =>
                  handleFilterChange('statut_paiement', e.target.value || undefined)
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Tous</option>
                <option value="paye">Payé</option>
                <option value="partiel">Partiel</option>
                <option value="impaye">Impayé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mode paiement</label>
              <select
                value={filters.mode_paiement || ''}
                onChange={(e) =>
                  handleFilterChange('mode_paiement', e.target.value || undefined)
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Tous</option>
                <option value="especes">Espèces</option>
                <option value="orange_money">Orange Money</option>
                <option value="moov_money">Moov Money</option>
                <option value="carte">Carte</option>
                <option value="mixte">Mixte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date début</label>
              <input
                type="date"
                value={filters.date_debut}
                onChange={(e) => handleFilterChange('date_debut', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date fin</label>
              <input
                type="date"
                value={filters.date_fin}
                onChange={(e) => handleFilterChange('date_fin', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tableau des ventes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : ventes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Aucune vente trouvée</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      N° Facture
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vendeur
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Montant TTC
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mode
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ventes.map((vente) => (
                    <tr key={vente.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-blue-600">
                          {vente.numero_facture}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(vente.date_vente)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {vente.client
                              ? `${vente.client.prenom} ${vente.client.nom}`
                              : vente.client_nom || 'Client anonyme'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {vente.client?.telephone || vente.client_telephone || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {vente.vendeur?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatMontant(vente.montant_total_ttc)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {vente.mode_paiement.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutBadgeColor(
                            vente.statut_paiement
                          )}`}
                        >
                          {vente.statut_paiement}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVoirDetails(vente)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleTelechargerRecu(vente)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Télécharger reçu"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: {total} vente{total > 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal détails vente */}
      {showDetails && venteSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Détails vente - {venteSelectionnee.numero_facture}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(venteSelectionnee.date_vente)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatutBadgeColor(
                      venteSelectionnee.statut_paiement
                    )}`}
                  >
                    {venteSelectionnee.statut_paiement}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">
                    {venteSelectionnee.client
                      ? `${venteSelectionnee.client.prenom} ${venteSelectionnee.client.nom}`
                      : venteSelectionnee.client_nom || 'Client anonyme'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendeur</p>
                  <p className="font-medium">{venteSelectionnee.vendeur?.name || '-'}</p>
                </div>
              </div>

              {/* Articles */}
              <div>
                <h4 className="font-semibold mb-3">Articles</h4>
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Article</th>
                        <th className="px-3 py-2 text-center">Qté</th>
                        <th className="px-3 py-2 text-right">Prix unit.</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {venteSelectionnee.details?.map((detail) => (
                        <tr key={detail.id}>
                          <td className="px-3 py-2">{detail.article_nom}</td>
                          <td className="px-3 py-2 text-center">{detail.quantite}</td>
                          <td className="px-3 py-2 text-right">
                            {formatMontant(detail.prix_unitaire)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatMontant(detail.prix_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totaux */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total HT</span>
                    <span className="font-medium">
                      {formatMontant(venteSelectionnee.montant_total_ht)}
                    </span>
                  </div>
                  {venteSelectionnee.montant_reduction > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Réduction</span>
                      <span>-{formatMontant(venteSelectionnee.montant_reduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total TTC</span>
                    <span>{formatMontant(venteSelectionnee.montant_total_ttc)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Montant payé</span>
                    <span>{formatMontant(venteSelectionnee.montant_paye)}</span>
                  </div>
                  {venteSelectionnee.solde_restant > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>Reste à payer</span>
                      <span>{formatMontant(venteSelectionnee.solde_restant)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {venteSelectionnee.notes && (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-gray-600">{venteSelectionnee.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTelechargerRecu(venteSelectionnee)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Télécharger le reçu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};