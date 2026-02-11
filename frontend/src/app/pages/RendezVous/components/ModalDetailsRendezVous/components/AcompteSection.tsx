// src/app/pages/RendezVous/components/ModalDetailsRendezVous/components/AcompteSection.tsx

import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, AlertCircle, Edit2, Download } from 'lucide-react';
import { rendezVousApi } from '../../../../../../services/rendezVousApi';

interface Props {
  rendezVousId: number;
  acompteDemande: boolean;
  acompteMontant: number | null;
  acomptePaye: boolean;
  statut: string;
  prixEstime: number | null;
  onMarquerPaye: (data: { mode_paiement: string; montant: number; reference?: string }) => void;
  onUpdateMontant: (montant: number) => void;
}

export const AcompteSection: React.FC<Props> = ({
  rendezVousId,
  acompteDemande,
  acompteMontant,
  acomptePaye,
  statut,
  prixEstime,
  onMarquerPaye,
  onUpdateMontant,
}) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showPaiement, setShowPaiement] = useState(false);
  const [nouveauMontant, setNouveauMontant] = useState(acompteMontant || 0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Données de paiement
  const [modePaiement, setModePaiement] = useState<'especes' | 'orange_money' | 'moov_money' | 'carte'>('especes');
  const [reference, setReference] = useState('');

  useEffect(() => {
    setNouveauMontant(acompteMontant || 0);
  }, [acompteMontant]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const handleMarquerPayeAvecRecu = async () => {
    if (!acompteMontant) return;

    try {
      setIsDownloading(true);
      
      await onMarquerPaye({
        mode_paiement: modePaiement,
        montant: acompteMontant,
        reference: reference || undefined,
      });
      
      // Télécharger le reçu après marquage
      setTimeout(() => {
        telechargerRecuAcompte();
        setShowPaiement(false);
      }, 500);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const telechargerRecuAcompte = () => {
    const url = rendezVousApi.getRecuAcompteUrl(rendezVousId);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recu-acompte-${rendezVousId}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canEdit = !acomptePaye && statut !== 'termine' && statut !== 'annule';

  if (!acompteDemande) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Acompte</h3>
        {canEdit && (
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            Modifier
          </button>
        )}
      </div>

      {!showEdit && !showPaiement ? (
        <div className={`rounded-lg p-3 sm:p-4 ${acomptePaye ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900 text-lg">
                  {acompteMontant ? `${formatCurrency(Number(acompteMontant))} FCFA` : '-'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1 ml-7">
                {acomptePaye ? (
                  <span className="flex items-center gap-1 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    Payé
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-700">
                    <AlertCircle className="w-4 h-4" />
                    En attente de paiement
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {acomptePaye ? (
                <button
                  onClick={telechargerRecuAcompte}
                  disabled={isDownloading}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Reçu acompte
                </button>
              ) : canEdit && (
                <button
                  onClick={() => setShowPaiement(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marquer comme payé
                </button>
              )}
            </div>
          </div>
        </div>
      ) : showPaiement ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 font-medium">
              Enregistrement du paiement de l'acompte
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement
            </label>
            <select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="especes">Espèces</option>
              <option value="orange_money">Orange Money</option>
              <option value="moov_money">Moov Money</option>
              <option value="carte">Carte bancaire</option>
            </select>
          </div>

          {modePaiement !== 'especes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence transaction (optionnel)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: TRX123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Montant à payer :</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(acompteMontant || 0)} FCFA
              </span>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-2">
            <button
              onClick={() => {
                setShowPaiement(false);
                setReference('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleMarquerPayeAvecRecu}
              disabled={isDownloading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isDownloading ? 'Traitement...' : 'Confirmer le paiement'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              Vous pouvez modifier le montant de l'acompte si le client n'a pas payé le montant complet.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant de l'acompte (FCFA)
            </label>
            <input
              type="number"
              value={nouveauMontant}
              onChange={(e) => setNouveauMontant(Number(e.target.value))}
              min="0"
              max={prixEstime || undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col xs:flex-row gap-2">
            <button
              onClick={() => {
                setShowEdit(false);
                setNouveauMontant(acompteMontant || 0);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                onUpdateMontant(nouveauMontant);
                setShowEdit(false);
              }}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};