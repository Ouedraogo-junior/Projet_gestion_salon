// src/app/pages/RendezVous/components/ModalDetailsRendezVous/components/MontantRestantSection.tsx

import React from 'react';
import { Wallet, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import type { RendezVous } from '../../../../../../types/rendezVous.types';

interface Props {
  rendezVous: RendezVous;
}

export const MontantRestantSection: React.FC<Props> = ({ rendezVous }) => {
  const { prix_estime, paiements, statut, vente } = rendezVous;

  const paiementAcompte = paiements?.find(p => p.type_paiement === 'acompte');
  const paiementSolde = paiements?.find(p => p.type_paiement === 'solde');

  // Vérification stricte
  if (!paiementAcompte) return null;

  // Utiliser le montant de la vente si disponible, sinon prix estimé
  const montantTotal = vente?.montant_total_ttc ?? prix_estime ?? 0;
  
  const montantAcompte = paiementAcompte.montant; // 
  const montantSolde = paiementSolde?.montant || 0;
  const totalPaye = montantAcompte + montantSolde;
  const resteAPayer = montantTotal - totalPaye;
  const estTermine = statut === 'termine';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getModePaiementLabel = (mode: string) => {
    const labels: Record<string, string> = {
      especes: 'Espèces',
      orange_money: 'Orange Money',
      moov_money: 'Moov Money',
      carte: 'Carte bancaire',
    };
    return labels[mode] || mode;
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">
        {estTermine ? 'Solde réglé' : 'Solde à régler'}
      </h3>
      
      <div className={`bg-gradient-to-r border rounded-lg p-3 sm:p-4 space-y-3 ${
        estTermine 
          ? 'from-green-50 to-green-100 border-green-200' 
          : 'from-orange-50 to-orange-100 border-orange-200'
      }`}>
        {/* Montant total payé */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            {estTermine ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            ) : (
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="text-sm font-medium">Montant payé</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-green-700">
            {formatCurrency(totalPaye)} FCFA
          </span>
        </div>

        {/* Reste à payer OU Total payé */}
        {estTermine ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Montant total</span>
            <span className="text-lg sm:text-xl font-bold text-green-600">
              {formatCurrency(prix_estime)} FCFA
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Reste à payer</span>
            <span className="text-lg sm:text-xl font-bold text-orange-600">
              {formatCurrency(resteAPayer)} FCFA
            </span>
          </div>
        )}

        {/* Infos paiement acompte */}
        <div className="pt-2 border-t border-gray-200 space-y-1.5">
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">Acompte</div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{getModePaiementLabel(paiementAcompte.mode_paiement)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Payé le {formatDate(paiementAcompte.date_paiement)}</span>
          </div>

          {paiementAcompte.reference_transaction && (
            <div className="text-xs sm:text-sm text-gray-600 break-all">
              <span className="font-medium">Réf:</span> {paiementAcompte.reference_transaction}
            </div>
          )}
        </div>

        {/* Infos paiement solde (si terminé) */}
        {estTermine && paiementSolde && (
          <div className="pt-2 border-t border-gray-200 space-y-1.5">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Solde</div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{getModePaiementLabel(paiementSolde.mode_paiement)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Payé le {formatDate(paiementSolde.date_paiement)}</span>
            </div>

            {paiementSolde.reference_transaction && (
              <div className="text-xs sm:text-sm text-gray-600 break-all">
                <span className="font-medium">Réf:</span> {paiementSolde.reference_transaction}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};