// src/app/pages/RendezVous/components/MesRendezVousModal.tsx

import React, { useState } from 'react';
import { X, Phone, Loader2, Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { rendezVousApi } from '../../../../services/rendezVousApi';
import { toast } from 'sonner';
import type { RendezVousPublic } from '../../../../types/rendezVous.types';

interface MesRendezVousModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MesRendezVousModal: React.FC<MesRendezVousModalProps> = ({ isOpen, onClose }) => {
  const [etape, setEtape] = useState<'saisie' | 'liste'>('saisie');
  const [telephone, setTelephone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [rendezVous, setRendezVous] = useState<{
    a_venir: RendezVousPublic[];
    passes: RendezVousPublic[];
  }>({ a_venir: [], passes: [] });
  const [rdvAnnuler, setRdvAnnuler] = useState<number | null>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');

  if (!isOpen) return null;

  const handleRechercher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!telephone) {
      toast.error('Veuillez saisir votre numéro de téléphone');
      return;
    }

    setIsLoading(true);
    try {
      const response = await rendezVousApi.getMesRendezVous(telephone);

      if (response.success) {
        setClientInfo(response.data.client);
        setRendezVous(response.data.rendez_vous);
        setEtape('liste');

        if (response.data.rendez_vous.total === 0) {
          toast.info('Aucun rendez-vous trouvé pour ce numéro');
        }
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnuler = async () => {
    if (!rdvAnnuler || !telephone) return;

    setIsLoading(true);
    try {
      const response = await rendezVousApi.annulerRendezVousPublic(
        rdvAnnuler,
        telephone,
        motifAnnulation || undefined
      );

      if (response.success) {
        toast.success('Rendez-vous annulé avec succès');
        setRdvAnnuler(null);
        setMotifAnnulation('');
        
        // Recharger la liste
        const refreshResponse = await rendezVousApi.getMesRendezVous(telephone);
        if (refreshResponse.success) {
          setRendezVous(refreshResponse.data.rendez_vous);
        }
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setEtape('saisie');
    setTelephone('');
    setClientInfo(null);
    setRendezVous({ a_venir: [], passes: [] });
    setRdvAnnuler(null);
    setMotifAnnulation('');
    onClose();
  };

  const getStatutBadge = (statut: string, couleur: string) => {
    const colors: Record<string, string> = {
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      primary: 'bg-purple-100 text-purple-800 border-purple-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      danger: 'bg-red-100 text-red-800 border-red-200',
      secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[couleur] || colors.secondary}`}>
        {statut}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mes Rendez-vous</h2>
          <button
            onClick={resetModal}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Étape 1: Saisie téléphone */}
          {etape === 'saisie' && (
            <form onSubmit={handleRechercher} className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Consulter vos rendez-vous
                </h3>
                <p className="text-gray-600">
                  Entrez votre numéro de téléphone pour voir tous vos rendez-vous
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+226 XX XX XX XX"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  'Rechercher mes rendez-vous'
                )}
              </button>
            </form>
          )}

          {/* Étape 2: Liste des RDV */}
          {etape === 'liste' && (
            <div>
              {/* Infos client */}
              {clientInfo && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {clientInfo.prenom} {clientInfo.nom}
                      </h3>
                      <p className="text-sm text-gray-600">{clientInfo.telephone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Points de fidélité</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {clientInfo.points_fidelite}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rendez-vous à venir */}
              {rendezVous.a_venir.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Rendez-vous à venir ({rendezVous.a_venir.length})
                  </h3>

                  <div className="space-y-3">
                    {rendezVous.a_venir.map((rdv) => (
                      <div
                        key={rdv.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {rdv.type_prestation.nom}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {rdv.date_formattee}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {rdv.heure_formattee}
                              </span>
                            </div>
                          </div>
                          {getStatutBadge(rdv.statut_formate, rdv.statut_couleur)}
                        </div>

                        {rdv.coiffeur && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Coiffeur:</strong> {rdv.coiffeur.prenom} {rdv.coiffeur.nom}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-sm font-semibold text-orange-600">
                            {rdv.prix_estime.toLocaleString()} FCFA
                          </span>

                          {rdv.peut_annuler ? (
                            <button
                              onClick={() => setRdvAnnuler(rdv.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Annuler
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Annulation impossible
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rendez-vous passés */}
              {rendezVous.passes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-600" />
                    Historique ({rendezVous.passes.length})
                  </h3>

                  <div className="space-y-3">
                    {rendezVous.passes.slice(0, 5).map((rdv) => (
                      <div
                        key={rdv.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-700">
                              {rdv.type_prestation.nom}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{rdv.date_formattee}</span>
                              <span>{rdv.heure_formattee}</span>
                            </div>
                          </div>
                          {getStatutBadge(rdv.statut_formate, rdv.statut_couleur)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aucun RDV */}
              {rendezVous.a_venir.length === 0 && rendezVous.passes.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Aucun rendez-vous trouvé</p>
                  <button
                    onClick={resetModal}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Prendre un rendez-vous
                  </button>
                </div>
              )}

              {/* Bouton retour */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEtape('saisie')}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Rechercher un autre numéro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'annulation */}
      {rdvAnnuler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Annuler ce rendez-vous ?
              </h3>
              <p className="text-gray-600 text-sm">
                Cette action est irréversible. Vous devrez reprendre un nouveau rendez-vous.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de l'annulation (optionnel)
              </label>
              <textarea
                value={motifAnnulation}
                onChange={(e) => setMotifAnnulation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Pourquoi annulez-vous ?"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRdvAnnuler(null);
                  setMotifAnnulation('');
                }}
                disabled={isLoading}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Garder le RDV
              </button>
              <button
                onClick={handleAnnuler}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Annulation...
                  </>
                ) : (
                  'Confirmer l\'annulation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};